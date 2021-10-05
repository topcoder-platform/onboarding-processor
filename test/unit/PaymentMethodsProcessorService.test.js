/**
 * Unit tests for Payment methods processor service
 */

process.env.NODE_ENV = 'test'

require('../../src/bootstrap')
const should = require('should')
const logger = require('../../src/common/logger')
const service = require('../../src/services/PaymentMethodsProcessorService')
const helper = require('../../src/common/helper')
const sandbox = require('sinon').createSandbox()
const { updatedPaymentMethods, argolitePaymentMethod } = require('../common/paymentMethodsTestData')

describe('Topcoder Onboarding Checklist - Payment Methods Processor Service Unit Tests', () => {
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

  it('Should properly process updated user payment methods', async () => {
    const stub = sandbox.stub(helper, 'executeQueryAsync').callsFake(() => updatedPaymentMethods)

    // make the call
    await service.processPaymentMethods()

    assertInfoMessage('Processing user payment methods')
    assertInfoMessage('Successfully Processed user payment methods')
    for (const handle of ['denis']) {
      assertDebugMessage(`Saving payment method member trait for user '${handle}'`)
      assertDebugMessage(`Successfully completed saving payment method member trait for user '${handle}'`)
    }
    should.equal(stub.callCount, 1)
  })

  it('Should skip re-setting already set payment methd trait', async () => {
    const stub = sandbox.stub(helper, 'executeQueryAsync').callsFake(() => argolitePaymentMethod)

    // make the call
    await service.processPaymentMethods()

    assertInfoMessage('Processing user payment methods')
    assertInfoMessage('Successfully Processed user payment methods')
    should.equal(stub.callCount, 1)
    assertDebugMessage(`Payment method trait 'payoneer' is already set for user 'argolite', Skipping...!`)
  })

  it('Should propagate the error when an error occurs when accessing the database', async () => {
    const stub = sandbox.stub(helper, 'executeQueryAsync').throws(new Error('Informix test error'))
    try {
      // make the call
      await service.processPaymentMethods()
    } catch (err) {
      should.equal(stub.callCount, 1)
      assertErrorMessageStartsWith('An error occurred when getting updated user payment methods from database, error =')
      assertErrorMessageStartsWith('Informix test error')
      return
    }
    throw new Error('should not throw error here')
  })
})
