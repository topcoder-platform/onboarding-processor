/**
 * This service processes the events fired when users agree to Standard Topcoder terms and NDA terms
 */

const Joi = require('@hapi/joi')
const _ = require('lodash')
const logger = require('../common/logger')
const helper = require('../common/helper')
const constants = require('../common/constants')

/**
  * Process the terms agreement event message
  * @param {Object} message the kafka message
  */
async function processMessage (message) {
  logger.info(`Process message of taxForm ${message.payload.taxForm}, userId ${message.payload.userId}, handle ${message.payload.Handle}`)
  // Get the user handle from members api
  const handle = _.get(message.payload, 'Handle')

  // Get the member Onboarding Checklist traits
  const onboardingChecklistTraits = await helper.getMemberTraits(handle, constants.ONBOARDING_CHECKLIST_TRAIT_ID)

  // Initialize the terms traits data object
  const termsTraitsData = {
    status: constants.CHECKLIST_STATUS.COMPLETED,
    message: constants.CHECKLIST_MESSAGE.SUCCESS,
    date: new Date().getTime()
  }

  if (onboardingChecklistTraits.length === 0) {
    const body = [{
      categoryName: constants.ONBOARDING_CHECKLIST_CATEGORY_NAME,
      traitId: constants.ONBOARDING_CHECKLIST_TRAIT_ID,
      traits: {
        data: [{
          [constants.TAX_FORM_TRAIT_PROPERTY_NAME]: termsTraitsData
        }]
      }
    }]
    await helper.saveMemberTraits(handle, body, true)
  } else {
    // Onboarding checklist traits already exists for the member
    // An update of the trait should be performed

    // Update the currently processed terms property in the request body
    onboardingChecklistTraits[0].traits.data[0][constants.TAX_FORM_TRAIT_PROPERTY_NAME] = termsTraitsData
    await helper.saveMemberTraits(handle, onboardingChecklistTraits, false)
  }

  logger.info(`Successfully Processed message of taxForm ${message.payload.taxForm}, userId ${message.payload.userId}, handle ${message.payload.Handle}`)
}

processMessage.schema = {
  message: Joi.object()
    .keys({
      topic: Joi.string().required(),
      originator: Joi.string().required(),
      timestamp: Joi.date().required(),
      'mime-type': Joi.string().required(),
      payload: Joi.object()
        .keys({
          userId: Joi.alternatives(Joi.string(), Joi.positiveId()).required(),
          taxForm: Joi.string().required(),
          Handle: Joi.string().required(),
          created: Joi.date()
        })
        .required()
    })
    .required()
}

module.exports = {
  processMessage
}

logger.buildService(module.exports, 'TaxFormProcessorService')
