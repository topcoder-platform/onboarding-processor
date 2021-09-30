/**
 * This file defines common data used in tests.
 */

const denisUserId = '251280'
const upbeatUserHandle = 'upbeat'

const createTaxFormTraitTestMessage = {
  'topic': 'terms.notification.user.agreed',
  'originator': 'onboarding-api',
  'timestamp': '2021-09-14T00:00:00.000Z',
  'mime-type': 'application/json',
  'payload': {
    'userId': denisUserId,
    'taxForm': 'W-9(TopCoder)',
    'Handle': 'denis',
    'created': '2021-09-14T00:00:00.000Z'
  }
}

const requiredFields = ['originator', 'timestamp', 'mime-type', 'topic', 'payload.userId', 'payload.taxForm', 'payload.Handle']

const stringFields = ['topic', 'originator', 'mime-type', 'payload.taxForm', 'payload.Handle']

const dateFields = ['timestamp', 'payload.created']

module.exports = {
  createTaxFormTraitTestMessage,
  requiredFields,
  stringFields,
  dateFields,
  denisUserId,
  upbeatUserHandle
}
