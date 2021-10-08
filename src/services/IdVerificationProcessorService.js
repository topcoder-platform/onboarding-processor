/**
 * This service handles the id verification
 */

const _ = require('lodash')
const logger = require('../common/logger')
const helper = require('../common/helper')
const LookerApi = require('../common/LookerApi')
const constants = require('../common/constants')
const config = require('config')
const { ID_VERIFICATION_PROPERTY_NAME } = require('../common/constants')

/**
 * This is the main function of the processor which handles saving the id verification as member traits
 */
async function processIdVerification () {
  if (config.PAUSE_ID_VERIFICATION && _.toLower(config.PAUSE_ID_VERIFICATION) === 'true') {
    logger.info('The id verification is currently paused')
    return
  }
  logger.info({
    component: 'IdVerificationProcessorService',
    context: 'processIdVerification',
    message: 'Processing id verification'
  })

  const idVerifications = []
  try {
    const api = new LookerApi(logger)
    // Get the modified id verification records in the last X (configurable) days
    const resp = await api.findRecentVerifiedMembers(`last ${config.FETCH_LOOKER_VERIFIED_MEMBER_TIMEFRAME_DAYS} days`)

    // Transfer the key name from member_verification.** to ** and filter the status isn't verified
    idVerifications.push(..._.filter(_.map(resp, o => _.mapKeys(o, (v, k) => _.replace(k, 'member_verification.', ''))), ['status', 'Verified']))

    logger.info({
      component: 'IdVerificationProcessorService',
      context: 'processIdVerification',
      message: `Successfully queued id verification for ${idVerifications.length} verifications fetched from looker`
    })
  } catch (e) {
    logger.error({
      component: 'IdVerificationProcessorService',
      context: 'processIdVerification',
      message: `An error occurred when fetching id verification, error = ${e.message}`
    })
    throw e
  }
  // Save the id verification as member traits
  for (const idVerification of idVerifications) {
    try {
      await saveIdVerificationTrait(idVerification)
    } catch (err) {
      logger.error({
        component: 'IdVerificationProcessorService',
        context: 'processIdVerification',
        message: `An error occurred when saving id verification, error = ${err.message}`
      })
    }
  }
}

/**
 * This function saved the provided id verification as member traits
 *
 * @param {Object} idVerification The id verification to set as member trait
 */
async function saveIdVerificationTrait (idVerification) {
  // Get the user handle from members api
  const handle = await helper.getHandleByUserId(_.get(idVerification, 'user_id'))

  logger.debug({
    component: 'IdVerificationProcessorService',
    context: 'saveIdVerificationTrait',
    message: `Saving id verification member trait for user '${handle}'`
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

  // Initialize the id verification traits data object
  const traitsData = {
    status: constants.CHECKLIST_STATUS.COMPLETED,
    message: constants.CHECKLIST_MESSAGE.SUCCESS,
    date: idVerification.verification_date,
    metadata: {
      matched_on: idVerification.matched_on,
      verification_mode: idVerification.verification_mode
    }
  }

  if (onboardingChecklistTraits.length === 0) {
    // Onboarding checklist traits does not exist for the member, we need to create it
    body[0].traits.data.push({
      [ID_VERIFICATION_PROPERTY_NAME]: traitsData
    })
    await helper.saveMemberTraits(handle, body, true)
  } else {
    // Onboarding checklist traits already exists for the member
    // Check if the id verification was updated
    const idVerificationEqualityCheckFields = ['status', 'message', 'date', 'metadata.matched_on', 'metadata.verification_mode']
    if (!_.isUndefined(onboardingChecklistTraits[0].traits.data[0][ID_VERIFICATION_PROPERTY_NAME]) &&
     _.isEqual(_.pick(traitsData, idVerificationEqualityCheckFields),
       _.pick(onboardingChecklistTraits[0].traits.data[0][ID_VERIFICATION_PROPERTY_NAME], idVerificationEqualityCheckFields))) {
      // the id verification trait is already set in traits api, no need to re-update
      logger.debug(
        {
          component: 'IdVerificationProcessorService',
          context: 'saveIdVerificationTrait',
          message: `Id verification trait is already set for user '${handle}', Skipping...!`
        })
      return
    } else {
      // Copy the existing traits data to the request body
      body[0].traits.data[0] = _.cloneDeep(onboardingChecklistTraits[0].traits.data[0])

      // Add the currently processed id verification to the request body
      body[0].traits.data[0][ID_VERIFICATION_PROPERTY_NAME] = traitsData
      await helper.saveMemberTraits(handle, body, false)
    }
  }
  logger.debug({
    component: 'IdVerificationProcessorService',
    context: 'saveIdVerificationTrait',
    message: `Successfully completed saving id verification member trait for user '${handle}'`
  })
}

module.exports = {
  processIdVerification
}

logger.buildService(module.exports, 'IdVerificationProcessorService')
