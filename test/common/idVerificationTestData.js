/**
 * This file contains the test data for id verification processor service unit tests
 */

const denisUserId = 251280
const upbeatUserId = 40154303
const argoliteUserId = 287614
const idVerificationUserId = 287654

// This array simulates the response from looker api
const memberVerification = [
  {
    'member_verification.user_id': denisUserId,
    'member_verification.verification_mode': 'Document',
    'member_verification.status': 'Verified',
    'member_verification.matched_on': 'Driving License',
    'member_verification.verification_date': '2021-09-21'
  },
  {
    'member_verification.user_id': upbeatUserId,
    'member_verification.verification_mode': 'Document',
    'member_verification.status': 'Verified',
    'member_verification.matched_on': 'Driving License',
    'member_verification.verification_date': '2021-08-21'
  },
  {
    'member_verification.user_id': argoliteUserId,
    'member_verification.verification_mode': 'Document',
    'member_verification.status': 'Other',
    'member_verification.matched_on': 'Driving License',
    'member_verification.verification_date': '2021-07-21'
  }
]

// This array contains a single member verification for 'idVerification'
// It is expected that it is already set in member traits
const existingIdVerification = [
  {
    'member_verification.user_id': idVerificationUserId,
    'member_verification.verification_mode': 'Document',
    'member_verification.status': 'Verified',
    'member_verification.matched_on': 'Driving License',
    'member_verification.verification_date': '2021-07-21'
  }
]

// This array contains a single member verification for testing nonExistUser
const nonExistingUserIdVerification = [
  {
    'member_verification.user_id': 111111,
    'member_verification.verification_mode': 'Document',
    'member_verification.status': 'Verified',
    'member_verification.matched_on': 'Driving License',
    'member_verification.verification_date': '2021-07-21'
  }
]

// The existing traits for member 'idVerification'
const idVerificationExistingTraits = [
  {
    'userId': idVerificationUserId,
    'traitId': 'onboarding_checklist',
    'categoryName': 'Onboarding Checklist',
    'traits': {
      'traitId': 'onboarding_checklist',
      'data': [
        {
          'id_verification': {
            'date': '2021-07-21',
            'message': 'success',
            'status': 'completed',
            'metadata': {
              'matched_on': 'Driving License',
              'verification_mode': 'Document'
            }
          }
        }
      ]
    },
    'createdAt': 1631782227459,
    'updatedAt': 1631785852398,
    'createdBy': 'XKMy68LCDT7mwKaUtl17Pgf5u2A7dXYo@clients',
    'updatedBy': 'XKMy68LCDT7mwKaUtl17Pgf5u2A7dXYo@clients'
  }
]

module.exports = {
  memberVerification,
  existingIdVerification,
  nonExistingUserIdVerification,
  idVerificationExistingTraits,
  idVerificationUserId
}
