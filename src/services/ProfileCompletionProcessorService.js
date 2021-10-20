/**
 * This service processes the events for member profile and profile traits completion
 */

const Joi = require('@hapi/joi')
const _ = require('lodash')
const logger = require('../common/logger')
const helper = require('../common/helper')
const constants = require('../common/constants')
const { PROFILE_COMPLETION_TRAIT_PROPERTY_NAME, CHECKLIST_MESSAGE, CHECKLIST_STATUS, TRAITS_TO_PROFILE_COMPLETION_CHECKLIST_METADATA_MAP } = require('../common/constants')
const config = require('config')

/**
 * This array contains the list of profile completion metadata object keys that affect the status update
 */
const METADATA_KEYS_FOR_STATUS_UPDATE = ['profile_picture', 'bio', 'skills', 'education', 'work', 'language', 'country']

// The component name to be used when logging messages
const component = 'ProfileCompletionProcessorService'

/**
 * This function handles the profile update kafka message
 *
 * @param {Object} message The message to handle
 */
async function processProfileUpdateMessage (message) {
  // The eventually updated metadata items by the current event message
  const updatedMetadataItems = {
    bio: !_.isEmpty(_.get(message, 'payload.description')),
    country: !_.isEmpty(_.get(message, `payload.${config.PROFILE_UPDATE_EVENT_COUNTRY_FIELD_NAME}`))
  }

  await handleUpdatedProfileCompletionMetadata(message, updatedMetadataItems)
}

processProfileUpdateMessage.schema = {
  message: Joi.object()
    .keys({
      topic: Joi.string().required(),
      originator: Joi.string().required(),
      timestamp: Joi.date().required(),
      'mime-type': Joi.string().required(),
      payload: Joi.object()
        .keys({
          userId: Joi.positiveId().required(),
          description: Joi.string().allow(null, ''),
          competitionCountryCode: Joi.string().allow(null, ''),
          homeCountryCode: Joi.string().allow(null, '')
        }).unknown(true)
        .required()
    }).required()
}

/**
 * This function handles the messages for create or update profile trait
 *
 * @param {Object} message The message to handle
 */
async function processCreateOrUpdateProfileTraitMessage (message) {
  // Ignore messages not related to: education, work and languages traits
  if (!_.includes(_.keys(TRAITS_TO_PROFILE_COMPLETION_CHECKLIST_METADATA_MAP), _.get(message, 'payload.traitId'))) {
    logger.info(`Event is not for one of valid traitIds : '${_.keys(TRAITS_TO_PROFILE_COMPLETION_CHECKLIST_METADATA_MAP)}' Ignoring ...!`)
  } else {
    // The eventually updated metadata items by the current event message
    const updatedMetadataItems = {
      [TRAITS_TO_PROFILE_COMPLETION_CHECKLIST_METADATA_MAP[_.get(message, 'payload.traitId')]]: (_.get(message, 'payload.traits.data', []).length > 0)
    }
    await handleUpdatedProfileCompletionMetadata(message, updatedMetadataItems)
  }
}

processCreateOrUpdateProfileTraitMessage.schema = {
  message: Joi.object()
    .keys({
      topic: Joi.string().required(),
      originator: Joi.string().required(),
      timestamp: Joi.date().required(),
      'mime-type': Joi.string().required(),
      payload: Joi.object()
        .keys({
          userId: Joi.positiveId().required(),
          traitId: Joi.string().required()
        }).unknown(true)
        .required()
    }).required()
}

/**
 * Handles the profile trait removal message
 *
 * @param {Object} message the message to handle
 */
async function processProfileTraitRemovalMessage (message) {
  // context for logging
  const context = 'processProfileTraitRemovalMessage'
  // Get the list of member profile trait ids received in the message
  const removedTraitIds = _.get(message, 'payload.memberProfileTraitIds')

  if (_.includes(removedTraitIds, constants.ONBOARDING_CHECKLIST_TRAIT_ID)) {
    // The received message is about the removal of the entire onboarding checklist
    // So, there is nothing to update since it is completely removed
    logger.info({
      component,
      context,
      message: `Onboarding checklist for user { userId: ${_.get(message, 'payload.userId')}} has been removed, Skipping...!`
    })
  } else {
    // keep only the traitIds we are interested in: work, education and languages
    const traitIdsToUnset = _.intersection(removedTraitIds, _.keys(TRAITS_TO_PROFILE_COMPLETION_CHECKLIST_METADATA_MAP))

    if (traitIdsToUnset.length === 0) {
      // There are no profile trait we are interested in the removed traitIds
      logger.info({
        component,
        context,
        message: `Profile trait removal message for traitIds: ${removedTraitIds} Skipped`
      })
    } else {
      const updatedMetadataItems = {}
      for (const traitId of traitIdsToUnset) {
        // Each metadata item corresponding to the removed traitId should be set to false (unset)
        updatedMetadataItems[TRAITS_TO_PROFILE_COMPLETION_CHECKLIST_METADATA_MAP[traitId]] = false
      }
      await handleUpdatedProfileCompletionMetadata(message, updatedMetadataItems)
    }
  }
}

processProfileTraitRemovalMessage.schema = {
  message: Joi.object()
    .keys({
      topic: Joi.string().required(),
      originator: Joi.string().required(),
      timestamp: Joi.date().required(),
      'mime-type': Joi.string().required(),
      payload: Joi.object()
        .keys({
          userId: Joi.positiveId().required(),
          memberProfileTraitIds: Joi.array().items(Joi.string())
        }).unknown(true)
        .required()
    }).required()
}

/**
 * A helper function which generates a new checklist based on the old one and updated metadata items
 *
 * @param {Object} oldChecklist The old checklist object
 * @param {Object} updatedMetadataItems The updated metadata objects
 * @returns The new checklist
 */
async function getNewChecklist (oldChecklist, updatedMetadataItems) {
  // Initialize the aggregated updatedMetadata object
  const updatedMetadata = _.assign({}, oldChecklist.metadata, updatedMetadataItems)

  if (_.isEqual(oldChecklist.metadata, updatedMetadata)) {
    // Nothing has changed in the metadata, return the result with 'updated' flag set to false
    return {
      isUpdated: false
    }
  } else { // At least one item has changed in the metadata
    // Get the flag indicating whether all the profile completion items are set
    const allItemsAreSet = _.every(METADATA_KEYS_FOR_STATUS_UPDATE, _.partial(_.has, updatedMetadata)) &&
                           _.every(_.values(_.pick(updatedMetadata, METADATA_KEYS_FOR_STATUS_UPDATE)), v => v === true)

    let newStatus, newMessage
    if (allItemsAreSet) {
      // Set the new status and message
      newStatus = CHECKLIST_STATUS.COMPLETED
      newMessage = CHECKLIST_MESSAGE.SUCCESS
    } else {
      // Set the new status and message
      newStatus = CHECKLIST_STATUS.PENDING_AT_USER
      newMessage = CHECKLIST_MESSAGE.PROFILE_IS_INCOMPLETE
    }

    // return the new checklist with the 'updated' flag set to true
    return {
      isUpdated: true,
      checklist: _.assign({}, oldChecklist, {
        status: newStatus,
        message: newMessage,
        date: new Date().getTime(),
        metadata: updatedMetadata
      })
    }
  }
}

/**
 * This function generates the initial structure of the profile completion checklist
 *
 * @param {Object} metadata The metadata to put in the checklist
 * @returns The initial checklist structure with the the given metadata
 */
async function getInitialChecklist (metadata) {
  return {
    status: CHECKLIST_STATUS.PENDING_AT_USER,
    message: CHECKLIST_MESSAGE.PROFILE_IS_INCOMPLETE,
    date: new Date().getTime(),
    metadata: _.assign({}, metadata)
  }
}

/**
 * This function handles updating the user onboarding checklist in member-api using the specified updated metadata items
 *
 * @param {Object} message The message to handle
 * @param {Object} updatedMetadataItems The updated metadata object
 */
async function handleUpdatedProfileCompletionMetadata (message, updatedMetadataItems) {
  // Get the user handle from members api
  const handle = await helper.getHandleByUserId(_.get(message, 'payload.userId'))

  // Check for other updates in user profile and profile traits
  const fullyUpdatedMetadata = await getFullyUpdatedMetadata(handle, updatedMetadataItems)

  // context used for logging
  const context = 'handleUpdatedProfileCompletionMetadata'

  logger.debug({
    component,
    context,
    message: `Process profile completion trait: { user: '${handle}', updatedMetadata: ${JSON.stringify(fullyUpdatedMetadata)}}`
  })

  // Get the member Onboarding Checklist traits
  const onboardingChecklistTraits = await helper.getMemberTraits(handle, constants.ONBOARDING_CHECKLIST_TRAIT_ID)

  // construct the request body for saving the member traits
  const body = [{
    categoryName: constants.ONBOARDING_CHECKLIST_CATEGORY_NAME,
    traitId: constants.ONBOARDING_CHECKLIST_TRAIT_ID,
    traits: {
      data: []
    }
  }]

  let isCreate
  if (onboardingChecklistTraits.length === 0) {
    isCreate = true
    // The member does not have any onboarding checklist trait, we initialize it
    body[0].traits.data.push({
      [PROFILE_COMPLETION_TRAIT_PROPERTY_NAME]: await getInitialChecklist(fullyUpdatedMetadata)
    })
  } else {
    isCreate = false
    // The user already has the onboarding check list traits data
    // perform an update

    // clone the existing checklist traits
    body[0].traits.data[0] = _.cloneDeep(onboardingChecklistTraits[0].traits.data[0])

    if (_.isUndefined(body[0].traits.data[0][PROFILE_COMPLETION_TRAIT_PROPERTY_NAME])) {
      // There were no traits data for profile completion checklist
      // We initialize a new one with the updated metadata by the current event message
      body[0].traits.data[0][PROFILE_COMPLETION_TRAIT_PROPERTY_NAME] = await getInitialChecklist(fullyUpdatedMetadata)
    } else {
      // traits data for profile completion checklist is already there for the user
      // We update it based on old checklist data and updated metadata by the current event message
      const newChecklist = await getNewChecklist(body[0].traits.data[0][PROFILE_COMPLETION_TRAIT_PROPERTY_NAME], fullyUpdatedMetadata)

      if (!newChecklist.isUpdated) {
        // The checklist was not updated, there is no need to call member-api
        logger.info({
          component,
          context,
          message: `No update to perform on profile completion trait checklist, Ignoring...!`
        })
        return
      } else {
        // Set the updated checklist in the member-api request body data
        body[0].traits.data[0][PROFILE_COMPLETION_TRAIT_PROPERTY_NAME] = newChecklist.checklist
      }
    }
  }
  await helper.saveMemberTraits(handle, body, isCreate)

  logger.debug({
    component,
    context,
    message: `Successfully processed profile completion trait { user: '${handle}', updatedMetadata: ${JSON.stringify(fullyUpdatedMetadata)}}`
  })
}

/**
 * This function handles the message received when a user uploads his profile picture
 *
 * @param {Object} message The message to handle
 */
async function processProfilePictureUploadMessage (message) {
  // The eventually updated metadata items by the current event message
  const updatedMetadataItems = {
    profile_picture: !_.isEmpty(_.get(message, 'payload.photoURL'))
  }

  await handleUpdatedProfileCompletionMetadata(message, updatedMetadataItems)
}

processProfilePictureUploadMessage.schema = {
  message: Joi.object()
    .keys({
      topic: Joi.string().required(),
      originator: Joi.string().required(),
      timestamp: Joi.date().required(),
      'mime-type': Joi.string().required(),
      payload: Joi.object()
        .keys({
          userId: Joi.positiveId().required(),
          photoURL: Joi.string().allow(null, '')
        }).unknown(true)
        .required()
    }).required()
}

/**
 * This function retrieves the fully updated metadata items for the member.
 * It gets the traits from the member traits API and returns the fully updated metadata with the updated flags
 *
 * @param {String} handle The member handle
 * @param {Object} updatedMetadataItems The updated metadata generated as a result of the event
 */
async function getFullyUpdatedMetadata (handle, updatedMetadataItems) {
  const member = await helper.getMemberByHandle(handle)
  const existingTraits = await helper.getMemberTraits(handle, _.join(_.keys(TRAITS_TO_PROFILE_COMPLETION_CHECKLIST_METADATA_MAP), ','))
  const updateTraitsMetadata = {}

  for (const key of _.keys(TRAITS_TO_PROFILE_COMPLETION_CHECKLIST_METADATA_MAP)) {
    const trait = _.find(existingTraits, { traitId: key })
    updateTraitsMetadata[TRAITS_TO_PROFILE_COMPLETION_CHECKLIST_METADATA_MAP[key]] = _.get(trait, 'traits.data', []).length > 0
  }

  return _.assign({}, {
    profile_picture: !_.isEmpty(_.get(member, 'photoURL')),
    bio: !_.isEmpty(_.get(member, 'description')),
    skills: await helper.hasUserEnteredSkills(handle),
    country: !_.isEmpty(_.get(member, config.PROFILE_UPDATE_EVENT_COUNTRY_FIELD_NAME))
  }, updateTraitsMetadata, updatedMetadataItems)
}

module.exports = {
  processProfileUpdateMessage,
  processCreateOrUpdateProfileTraitMessage,
  processProfileTraitRemovalMessage,
  processProfilePictureUploadMessage
}

logger.buildService(module.exports, 'ProfileCompletionProcessorService')
