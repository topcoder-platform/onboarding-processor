/**
 * This service handles the user payment methods updates
 */

const _ = require('lodash')
const logger = require('../common/logger')
const helper = require('../common/helper')
const constants = require('../common/constants')
const config = require('config')
const { PAYMENT_METHODS_MAP, PAYMENT_METHOD_TRAIT_PROPERTY_NAME } = require('../common/constants')

// The SQL query to use to retrieve the modified user payment methods in the last X days
// Each user may have multiple payment methods, this query will retrieve the latest modified one for each user
const GET_MODIFIED_PAYMENT_METHODS_QUERY =
        `SELECT user_id, payment_method_id
         FROM user_payment_method upm1
         WHERE modify_date = (SELECT MAX(modify_date) FROM user_payment_method upm2 WHERE upm1.user_id = upm2.user_id)
         AND modify_date >= current - ${config.MODIFIED_PAYMENT_METHODS_TIMEFRAME_DAYS} units day;`

/**
 * This is the main function of the processor which handles saving the updated user payment methods as member traits
 */
async function processPaymentMethods () {
  logger.info({
    component: 'PaymentMethodsProcessorService',
    context: 'processPaymentMethods',
    message: 'Processing user payment methods'
  })

  let paymentMethods
  try {
    // Get the modified user payment methods records in the last X (configurable) days
    paymentMethods = await helper.executeQueryAsync(config.INFORMIX.database, GET_MODIFIED_PAYMENT_METHODS_QUERY)
  } catch (e) {
    logger.error({
      component: 'PaymentMethodsProcessorService',
      context: 'processPaymentMethods',
      message: `An error occurred when getting updated user payment methods from database, error = ${JSON.stringify(e)}`
    })
    throw e
  }

  // Save the user payment methods as member traits
  for (const paymentMethod of paymentMethods) {
    await savePaymentMethodTrait(paymentMethod)
  }

  logger.info({
    component: 'PaymentMethodsProcessorService',
    context: 'processPaymentMethods',
    message: 'Successfully Processed user payment methods'
  })
}

/**
 * This function saved the provided payment information as member traits
 *
 * @param {Object} paymentMethd The member payment method to set as member trait
 */
async function savePaymentMethodTrait (paymentMethd) {
  // Get the user handle from members api
  const handle = await helper.getHandleByUserId(_.get(paymentMethd, 'user_id'))

  logger.debug({
    component: 'PaymentMethodsProcessorService',
    context: 'savePaymentMethodTrait',
    message: `Saving payment method member trait for user '${handle}'`
  })

  // Get the member Onboarding Checklist traits
  const onboardingChecklistTraits = await helper.getMemberTraits(handle, constants.ONBOARDING_CHECKLIST_TRAIT_ID)

  // construct the request body for saving the member traits
  const body = [{
    categoryName: constants.ONBOARDING_CHECKLIST_CATEGORY_NAME,
    traitId: constants.ONBOARDING_CHECKLIST_TRAIT_ID,
    traits: {
      traitId: constants.ONBOARDING_CHECKLIST_TRAIT_ID,
      data: []
    }
  }]

  // Initialize the payment method traits data object
  const traitsData = {
    status: constants.CHECKLIST_STATUS.COMPLETED,
    message: constants.CHECKLIST_MESSAGE.SUCCESS,
    date: new Date().getTime(),
    payment_method: PAYMENT_METHODS_MAP[_.get(paymentMethd, 'payment_method_id')] || 'other'
  }

  if (onboardingChecklistTraits.length === 0) {
    // Onboarding checklist traits does not exist for the member, we need to create it
    body[0].traits.data.push({
      [PAYMENT_METHOD_TRAIT_PROPERTY_NAME]: traitsData
    })
    await helper.saveMemberTraits(handle, body, true)
  } else {
    // Onboarding checklist traits already exists for the member
    // Check if the payment method was updated
    const paymentMethodEqualityCheckFields = ['status', 'message', 'payment_method']
    if (!_.isUndefined(onboardingChecklistTraits[0].traits.data[0][PAYMENT_METHOD_TRAIT_PROPERTY_NAME]) &&
     _.isEqual(_.pick(traitsData, paymentMethodEqualityCheckFields),
       _.pick(onboardingChecklistTraits[0].traits.data[0][PAYMENT_METHOD_TRAIT_PROPERTY_NAME], paymentMethodEqualityCheckFields))) {
      // the user payment method trait is already set in traits api, no need to re-update
      logger.debug(
        {
          component: 'PaymentMethodsProcessorService',
          context: 'savePaymentMethodTrait',
          message: `Payment method trait '${traitsData.payment_method}' is already set for user '${handle}', Skipping...!`
        })
      return
    } else {
      // Copy the existing traits data to the request body
      body[0].traits.data[0] = _.cloneDeep(onboardingChecklistTraits[0].traits.data[0])

      // Add the currently processed payment method to the request body
      body[0].traits.data[0][PAYMENT_METHOD_TRAIT_PROPERTY_NAME] = traitsData
      await helper.saveMemberTraits(handle, body, false)
    }
  }
  logger.debug({
    component: 'PaymentMethodsProcessorService',
    context: 'savePaymentMethodTrait',
    message: `Successfully completed saving payment method member trait for user '${handle}'`
  })
}

module.exports = {
  processPaymentMethods
}

logger.buildService(module.exports, 'PaymentMethodsProcessorService')
