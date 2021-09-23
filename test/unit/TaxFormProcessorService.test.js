/**
 * Unit tests for Onboarding Checklist Tax Form updated processor service
 */

process.env.NODE_ENV = 'test'

require('../../src/bootstrap')
const _ = require('lodash')
const should = require('should')
const logger = require('../../src/common/logger')
const service = require('../../src/services/TaxFormProcessorService')
const {
  createTaxFormTraitTestMessage,
  requiredFields,
  stringFields,
  dateFields,
  upbeatUserHandle
} = require('../common/taxFormTestData')

describe('Topcoder Onboarding Checklist - Tax Form Processor Service Unit Tests', () => {
  let infoLogs = []
  let errorLogs = []
  let debugLogs = []
  const info = logger.info
  const error = logger.error
  const debug = logger.debug

  /**
   * Assert validation error
   * @param err the error
   * @param message the message
   */
  function assertValidationError (err, message) {
    err.isJoi.should.be.true()
    should.equal(err.name, 'ValidationError')
    err.details.map(x => x.message).should.containEql(message)
    errorLogs.should.not.be.empty()
  }

  /**
   * Assert there is given info message
   * @param message the message
   */
  function assertInfoMessage (message) {
    infoLogs.should.not.be.empty()
    infoLogs.some(x => String(x).includes(message)).should.be.true()
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

  for (const requiredField of requiredFields) {
    it(`test process message with invalid parameters, required field ${requiredField} is missing`, async () => {
      let message = _.cloneDeep(createTaxFormTraitTestMessage)
      message = _.omit(message, requiredField)
      try {
        await service.processMessage(message)
      } catch (err) {
        assertValidationError(err, `"${_.last(requiredField.split('.'))}" is required`)
        return
      }
      throw new Error('should not throw error here')
    })
  }

  for (const stringField of stringFields) {
    it(`test process message with invalid parameters, invalid string type field ${stringField}`, async () => {
      const message = _.cloneDeep(createTaxFormTraitTestMessage)
      _.set(message, stringField, 123)
      try {
        await service.processMessage(message)
      } catch (err) {
        assertValidationError(err, `"${_.last(stringField.split('.'))}" must be a string`)
        return
      }
      throw new Error('should not throw error here')
    })

    it(`test process message with invalid parameters, empty string field ${stringField}`, async () => {
      const message = _.cloneDeep(createTaxFormTraitTestMessage)
      _.set(message, stringField, '')
      try {
        await service.processMessage(message)
      } catch (err) {
        assertValidationError(err, `"${_.last(stringField.split('.'))}" is not allowed to be empty`)
        return
      }
      throw new Error('should not throw error here')
    })
  }

  for (const dateField of dateFields) {
    it(`test process message with invalid parameters, invalid date type field ${dateField}`, async () => {
      const message = _.cloneDeep(createTaxFormTraitTestMessage)
      _.set(message, dateField, 'abc')
      try {
        await service.processMessage(message)
      } catch (err) {
        assertValidationError(err,
          `"${_.last(dateField.split('.'))}" must be a number of milliseconds or valid date string`)
        return
      }
      throw new Error('should not throw error here')
    })
  }

  it(`test process message - onboarding checklist does not already exist for the member`, async () => {
    const message = _.cloneDeep(createTaxFormTraitTestMessage)
    await service.processMessage(message)

    assertInfoMessage(`Process message of taxForm ${message.payload.taxForm}, userId ${message.payload.userId}, handle ${message.payload.Handle}`)
    assertInfoMessage(`Successfully Processed message of taxForm ${message.payload.taxForm}, userId ${message.payload.userId}, handle ${message.payload.Handle}`)
  })

  it(`test process message - onboarding checklist already exist for the member`, async () => {
    const message = _.cloneDeep(createTaxFormTraitTestMessage)
    _.set(message, 'payload.Handle', upbeatUserHandle)

    await service.processMessage(message)

    assertInfoMessage(`Process message of taxForm ${message.payload.taxForm}, userId ${message.payload.userId}, handle ${message.payload.Handle}`)
    assertInfoMessage(`Successfully Processed message of taxForm ${message.payload.taxForm}, userId ${message.payload.userId}, handle ${message.payload.Handle}`)
  })
})
