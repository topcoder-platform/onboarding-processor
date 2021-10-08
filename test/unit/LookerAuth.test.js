/**
 * Unit tests for Look auth
 */

process.env.NODE_ENV = 'test'

require('../../src/bootstrap')
const should = require('should')
const axios = require('axios')
const config = require('config')
const logger = require('../../src/common/logger')
const LookerAuth = require('../../src/common/LookerAuth')
const sandbox = require('sinon').createSandbox()

describe('Topcoder Onboarding Checklist - Looker Auth Unit Tests', () => {
  afterEach(() => {
    sandbox.restore()
  })
  it('Should properly get token', async () => {
    const now = Date.now()
    const token = '1qase456ygfde4'
    const stub = sandbox.stub(axios, 'post').resolves({ data: { access_token: token, expires_in: (now + 360000) } })
    const auth = new LookerAuth(logger)

    // make the call
    const data = await auth.getToken()
    should.equal(data, token)
    should.equal(stub.callCount, 1)
    const args = stub.getCall(0).args
    should.equal(args[0], `${config.lookerConfig.BASE_URL}/login?client_id=${config.lookerConfig.CLIENT_ID}&client_secret=${config.lookerConfig.CLIENT_SECRET}`)
    should.deepEqual(args[1], {})
    should.deepEqual(args[2], {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // get token from cache
    const tokenAgain = await auth.getToken()
    should.equal(tokenAgain, token)
    // still callCount 1
    should.equal(stub.callCount, 1)
  })
})
