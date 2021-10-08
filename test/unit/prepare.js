/*
 * Setting up Mock for unit tests
 */

// During tests the node env is set to test
process.env.NODE_ENV = 'test'

const nock = require('nock')
const prepare = require('mocha-prepare')
const helper = require('../../src/common/helper')

const { nonExistingUserId, denisUserId, upbeatUserId, upbeatExistingTraits } = require('../common/testData')
const { argoliteUserId, argoliteExistingTraits } = require('../common/paymentMethodsTestData')
const { idVerificationUserId, idVerificationExistingTraits } = require('../common/IdVerificationTestData')
const { denisSkills, tonyJUserId, tonyJExistingTraits, thomasUserId, thomasExistingTraits, saarixxUserId, saarixxExistingTraits } = require('../common/profileCompletionTestData')

prepare(async function (done) {
  // get access token
  const accessToken = await helper.getM2MToken()

  // called before loading of test cases
  nock(/.com|localhost/)
    .persist()
    .post(uri => uri.includes('token'))
    .query(true)
    .reply(200, { access_token: accessToken })
    .get(uri => uri.includes(`?userId=${denisUserId}`))
    .reply(200, [{ 'handle': 'denis' }])
    .get(uri => uri.includes(`?userId=${upbeatUserId}`))
    .reply(200, [{ 'handle': 'upbeat' }])
    .get(uri => uri.includes(`?userId=${argoliteUserId}`))
    .reply(200, [{ 'handle': 'argolite' }])
    .get(uri => uri.includes(`?userId=${idVerificationUserId}`))
    .reply(200, [{ 'handle': 'idVerification' }])
    .get(uri => uri.includes(`?userId=${tonyJUserId}`))
    .reply(200, [{ 'handle': 'tonyj' }])
    .get(uri => uri.includes(`?userId=${thomasUserId}`))
    .reply(200, [{ 'handle': 'thomaskranitsas' }])
    .get(uri => uri.includes(`?userId=${saarixxUserId}`))
    .reply(200, [{ 'handle': 'saarixx' }])
    .get(uri => uri.includes(`?userId=${nonExistingUserId}`))
    .reply(200, [])
    .get(uri => uri.includes('/members/denis/traits?traitIds=onboarding_checklist'))
    .reply(200, [])
    .get(uri => uri.includes('/members/denis/skills'))
    .reply(200, denisSkills)
    .get(uri => uri.includes('/members/upbeat/skills'))
    .reply(200, [])
    .get(uri => uri.includes('/members/tonyj/skills'))
    .reply(200, [])
    .get(uri => uri.includes('/members/thomaskranitsas/skills'))
    .reply(200, [])
    .get(uri => uri.includes('/members/upbeat/traits?traitIds=onboarding_checklist'))
    .reply(200, upbeatExistingTraits)
    .get(uri => uri.includes('/members/argolite/traits?traitIds=onboarding_checklist'))
    .reply(200, argoliteExistingTraits)
    .get(uri => uri.includes('/members/idVerification/traits?traitIds=onboarding_checklist'))
    .reply(200, idVerificationExistingTraits)
    .get(uri => uri.includes('/members/tonyj/traits?traitIds=onboarding_checklist'))
    .reply(200, tonyJExistingTraits)
    .get(uri => uri.includes('/members/thomaskranitsas/traits?traitIds=onboarding_checklist'))
    .reply(200, thomasExistingTraits)
    .get(uri => uri.includes('/members/saarixx/traits?traitIds=onboarding_checklist'))
    .reply(200, saarixxExistingTraits)
    .post(uri => uri.includes('/traits'))
    .reply(200)
    .put(uri => uri.includes('/traits'))
    .reply(200)
  done()
}, function (done) {
  // called after all test completes (regardless of errors)
  nock.cleanAll()
  done()
})
