/**
 * This service processes the events fired when users agree to Standard Topcoder terms and NDA terms
 */

const Joi = require('@hapi/joi')
const _ = require('lodash')
const logger = require('../common/logger')
const helper = require('../common/helper')
const constants = require('../common/constants')
const config = require('config')

/**
  * Process the terms agreement event message
  * @param {Object} message the kafka message
  */
async function processMessage (message) {
  logger.info(`Process message of termsOfUseId ${message.payload.termsOfUseId}, userId ${message.payload.userId}`)
  // Get the user handle from members api
  const handle = await helper.getHandleByUserId(_.get(message, 'payload.userId'))

  // The member traits body property name (for standard or nda terms)
  let traitsBodyPropertyName

  // Switch on the terms of use id, to check which terms type are being handled, standard or NDA terms
  // And set the traitsBodyPropertyName accordingly
  const termsOfUseId = _.get(message, 'payload.termsOfUseId')
  switch (termsOfUseId) {
    case config.STANDARD_TERMS_ID: {
      traitsBodyPropertyName = constants.STANDARD_TERMS_TRAIT_PROPERTY_NAME
      break
    }
    case config.NDA_TERMS_ID: {
      traitsBodyPropertyName = constants.NDA_TERMS_TRAIT_PROPERTY_NAME
      break
    }
    default: {
      logger.debug({
        component: 'TermsAgreementProcessorService',
        context: 'processMessage',
        message: `Unsupported terms type id ${termsOfUseId}, Skipping...`
      })
      return
    }
  }

  // Get the member Onboarding Checklist traits
  const onboardingChecklistTraits = await helper.getMemberTraits(handle, constants.ONBOARDING_CHECKLIST_TRAIT_ID)

  // Initialize the flag indicating whether to create or update the member traits
  let isCreate = true

  // construct the request body for saving the member traits
  const body = [{
    categoryName: constants.ONBOARDING_CHECKLIST_CATEGORY_NAME,
    traitId: constants.ONBOARDING_CHECKLIST_TRAIT_ID,
    traits: {
      // traitId: constants.ONBOARDING_CHECKLIST_TRAIT_ID,
      data: []
    }
  }]

  // Initialize the terms traits data object
  const termsTraitsData = {
    status: constants.CHECKLIST_STATUS.COMPLETED,
    message: constants.CHECKLIST_MESSAGE.SUCCESS,
    date: new Date().getTime()
  }

  if (onboardingChecklistTraits.length === 0) {
    // Onboarding checklist traits does not exist for the member, we need to create it
    // Add the terms data to the member traits request body
    body[0].traits.data.push({
      [traitsBodyPropertyName]: termsTraitsData
    })
  } else {
    // Onboarding checklist traits already exists for the member
    // An update of the trait should be performed

    // set the isCreate flag to false to make sure the traits are updated
    isCreate = false

    // Copy the existing traits data to the request body
    body[0].traits.data[0] = _.cloneDeep(onboardingChecklistTraits[0].traits.data[0])

    // Update the currently processed terms property in the request body
    body[0].traits.data[0][traitsBodyPropertyName] = termsTraitsData
  }

  // Save the member traits
  await helper.saveMemberTraits(handle, body, isCreate)

  logger.info(`Successfully Processed message of termsOfUseId ${message.payload.termsOfUseId}, userId ${message.payload.userId}`)
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
          userId: Joi.positiveId().required(),
          termsOfUseId: Joi.string().uuid().required()
        }).unknown(true)
        .required()
    })
    .required()
}

module.exports = {
  processMessage
}

logger.buildService(module.exports, 'TermsAgreementProcessorService')
