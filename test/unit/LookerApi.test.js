/**
 * Unit tests for Look api
 */

process.env.NODE_ENV = 'test'

require('../../src/bootstrap')
const should = require('should')
const axios = require('axios')
const config = require('config')
const logger = require('../../src/common/logger')
const LookerApi = require('../../src/common/LookerApi')
const LookerAuth = require('../../src/common/LookerAuth')
const sandbox = require('sinon').createSandbox()

describe('Topcoder Onboarding Checklist - Looker Api Unit Tests', () => {
  afterEach(() => {
    sandbox.restore()
  })
  it('Should properly post request', async () => {
    const stub = sandbox.stub(axios, 'post').callsFake(() => ({ data: [] }))
    sandbox.stub(LookerAuth.prototype, 'getToken').resolves('access_token')
    const api = new LookerApi(logger)

    // make the call
    const data = await api.findRecentVerifiedMembers(`last ${config.FETCH_LOOKER_VERIFIED_MEMBER_TIMEFRAME_DAYS} days`)
    should.deepEqual(data, [])
    should.equal(stub.callCount, 1)
    const args = stub.getCall(0).args
    should.equal(args[0], `${config.lookerConfig.BASE_URL}/queries/run/json`)
    should.deepEqual(args[1], {
      model: 'member_profile',
      view: 'member_verification',
      filters: { 'member_verification.verification_date': `last ${config.FETCH_LOOKER_VERIFIED_MEMBER_TIMEFRAME_DAYS} days` },
      fields: ['member_verification.user_id', 'member_verification.verification_mode', 'member_verification.status', 'member_verification.matched_on', 'member_verification.verification_date'],
      query_timezone: 'America/New_York'
    })
    should.deepEqual(args[2], {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `token access_token`
      }
    })
  })
})
