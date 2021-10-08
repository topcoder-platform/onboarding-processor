/**
 * Unit tests for Id verification processor service
 */

process.env.NODE_ENV = 'test'

require('../../src/bootstrap')
const should = require('should')
const logger = require('../../src/common/logger')
const service = require('../../src/services/IdVerificationProcessorService')
const LookerApi = require('../../src/common/LookerApi')
const sandbox = require('sinon').createSandbox()
const { memberVerification, existingIdVerification, nonExistingUserIdVerification } = require('../common/IdVerificationTestData')

describe('Topcoder Onboarding Checklist - Id Verification Processor Service Unit Tests', () => {
  let infoLogs = []
  let errorLogs = []
  let debugLogs = []
  const info = logger.info
  const error = logger.error
  const debug = logger.debug

  /**
   * Assert there is given info message
   * @param message the message
   */
  function assertInfoMessage (message) {
    infoLogs.should.not.be.empty()
    infoLogs.some(x => String(x.message).includes(message)).should.be.true()
  }

  /**
   * Assert there is given error message
   * @param message the message
   */
  function assertErrorMessageStartsWith (message) {
    errorLogs.should.not.be.empty()
    errorLogs.some(x => String(x.message).startsWith(message)).should.be.true()
  }

  /**
   * Assert there is given debug message
   * @param message the message
   */
  function assertDebugMessage (message) {
    debugLogs.should.not.be.empty()
    debugLogs.some(x => String(x.message).includes(message)).should.be.true()
  }

  before(async () => {
    // inject logger with log collector
    logger.info = (message) => {
      infoLogs.push(message)
      info(message)
    }
    logger.error = (message) => {
      errorLogs.push(message)
      error(message)
    }
    logger.debug = (message) => {
      debugLogs.push(message)
      debug(message)
    }
  })

  after(async () => {
    // restore logger
    logger.error = error
    logger.info = info
    logger.debug = debug
  })

  beforeEach(() => {
    // clear logs
    infoLogs = []
    errorLogs = []
    debugLogs = []
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('Should properly process updated id verification', async () => {
    const stub = sandbox.stub(LookerApi.prototype, 'findRecentVerifiedMembers').callsFake(() => memberVerification)

    // make the call
    await service.processIdVerification()

    assertInfoMessage('Processing id verification')
    assertInfoMessage('Successfully Processed id verification')
    for (const handle of ['denis', 'upbeat']) {
      assertDebugMessage(`Saving id verification member trait for user '${handle}'`)
      assertDebugMessage(`Successfully completed saving id verification member trait for user '${handle}'`)
    }
    should.equal(stub.callCount, 1)
  })

  it('Should skip re-setting already set id verification trait', async () => {
    const stub = sandbox.stub(LookerApi.prototype, 'findRecentVerifiedMembers').callsFake(() => existingIdVerification)

    // make the call
    await service.processIdVerification()

    assertInfoMessage('Processing id verification')
    assertInfoMessage('Successfully Processed id verification')
    should.equal(stub.callCount, 1)
    assertDebugMessage(`Id verification trait is already set for user 'idVerification', Skipping...!`)
  })

  it('Should propagate the error when an error occurs when requesting looker api', async () => {
    const stub = sandbox.stub(LookerApi.prototype, 'findRecentVerifiedMembers').throws(new Error('Looker api test error'))
    try {
      // make the call
      await service.processIdVerification()
    } catch (err) {
      should.equal(stub.callCount, 1)
      assertErrorMessageStartsWith('An error occurred when fetching id verification, error = ')
      assertErrorMessageStartsWith('Looker api test error')
      return
    }
    throw new Error('should not throw error here')
  })

  it('Should catch the error when an error occurs when saving id verification trait', async () => {
    const stub = sandbox.stub(LookerApi.prototype, 'findRecentVerifiedMembers').callsFake(() => nonExistingUserIdVerification)
    // make the call
    await service.processIdVerification()
    should.equal(stub.callCount, 1)
    assertErrorMessageStartsWith('An error occurred when saving id verification, error = ')
  })
})
