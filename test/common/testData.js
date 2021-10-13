/**
 * This file defines common data used in tests.
 */

const denisUserId = 251280
const upbeatUserId = 40154303

const standardTermsTestMessage = {
  'topic': 'terms.notification.user.agreed',
  'originator': 'onboarding-api',
  'timestamp': '2021-09-14T00:00:00.000Z',
  'mime-type': 'application/json',
  'payload': {
    'userId': denisUserId,
    'termsOfUseId': '0dedac8f-5a1a-4fe7-001f-e1d04dc65b7d',
    'legacyId': 123456,
    'created': '2021-09-14T00:00:00.000Z'
  }
}

const ndaTermsTestMessage = {
  'topic': 'terms.notification.user.agreed',
  'originator': 'onboarding-api',
  'timestamp': '2021-09-14T00:00:00.000Z',
  'mime-type': 'application/json',
  'payload': {
    'userId': upbeatUserId,
    'termsOfUseId': '0dedac8f-5a1a-4fe7-002f-e1d04dc65b7d',
    'legacyId': 123456,
    'created': '2021-09-14T00:00:00.000Z'
  }
}

const upbeatExistingTraits = [
  {
    'userId': upbeatUserId,
    'traitId': 'onboarding_checklist',
    'categoryName': 'Onboarding Checklist',
    'traits': {
      'traitId': 'onboarding_checklist',
      'data': [
        {
          'standard_terms': {
            'date': '2021-09-16T09:52:11.901Z',
            'message': 'success',
            'status': 'completed'
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

const requiredFields = ['originator', 'timestamp', 'mime-type', 'topic', 'payload.userId', 'payload.termsOfUseId']

const stringFields = ['topic', 'originator', 'mime-type']

const guidFields = ['payload.termsOfUseId']

const positiveIntegerFields = ['payload.userId']

const dateFields = ['timestamp']

const nonExistingUserId = 111111

const unsupportedTermsOfUseId = '0dedac8f-5a1a-4fe7-003f-e1d04dc65b7d'

module.exports = {
  standardTermsTestMessage,
  ndaTermsTestMessage,
  requiredFields,
  stringFields,
  guidFields,
  positiveIntegerFields,
  dateFields,
  denisUserId,
  upbeatUserId,
  nonExistingUserId,
  upbeatExistingTraits,
  unsupportedTermsOfUseId
}
