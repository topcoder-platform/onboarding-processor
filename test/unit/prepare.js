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
    .get(uri => uri.includes(`?userId=${nonExistingUserId}`))
    .reply(200, [])
    .get(uri => uri.includes('/members/denis/traits?traitIds=onboarding_checklist'))
    .reply(200, [])
    .get(uri => uri.includes('/members/upbeat/traits?traitIds=onboarding_checklist'))
    .reply(200, upbeatExistingTraits)
    .get(uri => uri.includes('/members/argolite/traits?traitIds=onboarding_checklist'))
    .reply(200, argoliteExistingTraits)
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
