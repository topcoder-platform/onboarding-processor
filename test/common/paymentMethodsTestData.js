/**
 * This file contains the test data for payment methods processor service unit tests
 */

const denisUserId = 251280
const upbeatUserId = 40154303
const argoliteUserId = 287614

// This array simulates the response from Informix database
const updatedPaymentMethods = [
  {
    user_id: denisUserId,
    payment_method_id: 5
  },
  {
    user_id: upbeatUserId,
    payment_method_id: 10
  }
]

// This array contains a single payment method for 'argolite'
// It is expected that it is already set in member traits
const argolitePaymentMethod = [
  {
    user_id: argoliteUserId,
    payment_method_id: 5
  }
]

// The existing traits for member 'argolite'
const argoliteExistingTraits = [
  {
    'userId': argoliteUserId,
    'traitId': 'onboarding_checklist',
    'categoryName': 'Onboarding Checklist',
    'traits': {
      'traitId': 'onboarding_checklist',
      'data': [
        {
          'user_payment_method': {
            'date': '2021-09-16T09:52:11.901Z',
            'message': 'success',
            'status': 'completed',
            'payment_method': 'payoneer'
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
  updatedPaymentMethods,
  argoliteExistingTraits,
  argoliteUserId,
  argolitePaymentMethod
}
