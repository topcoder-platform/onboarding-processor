/**
 * The application entry point
 */

require('./bootstrap')
const config = require('config')
const Kafka = require('no-kafka')
const healthcheck = require('topcoder-healthcheck-dropin')
const logger = require('./common/logger')
const helper = require('./common/helper')
const TermsAgreementProcessorService = require('./services/TermsAgreementProcessorService')
const TaxFormProcessorService = require('./services/TaxFormProcessorService')
const PaymentMethodsProcessorService = require('./services/PaymentMethodsProcessorService')
const Mutex = require('async-mutex').Mutex
const events = require('events')
const cron = require('node-cron')

const eventEmitter = new events.EventEmitter()

// healthcheck listening port
process.env.PORT = config.PORT
const localLogger = {
  info: (message) => logger.info({ component: 'app', message }),
  debug: (message) => logger.debug({ component: 'app', message }),
  error: (message) => logger.error({ component: 'app', message })
}

const topicServiceMapping = {
  [config.topics.TERMS_USER_AGREEMENT_TOPIC]: TermsAgreementProcessorService.processMessage,
  [config.topics.USER_TAXFORM_UPDATE_TOPIC]: TaxFormProcessorService.processMessage
}

// Start kafka consumer
localLogger.info('Starting kafka consumer')
// create consumer
const consumer = new Kafka.GroupConsumer(helper.getKafkaOptions())

let count = 0
const mutex = new Mutex()

/**
 *
 * @returns This function gets the latest message count
 */
async function getLatestCount () {
  const release = await mutex.acquire()

  try {
    count = count + 1

    return count
  } finally {
    release()
  }
}

/*
 * Data handler linked with Kafka consumer
 * Whenever a new message is received by Kafka consumer,
 * this function will be invoked
 */
const dataHandler = (messageSet, topic, partition) => Promise.each(messageSet, async (m) => {
  const message = m.message.value.toString('utf8')
  localLogger.info(`Handle Kafka event message; Topic: ${topic}; Partition: ${partition}; Offset: ${
    m.offset}; Message: ${message}.`)
  let messageJSON
  const messageCount = await getLatestCount()

  localLogger.debug(`Current message count: ${messageCount}`)
  try {
    messageJSON = JSON.parse(message)
  } catch (e) {
    localLogger.error(`Invalid message JSON: ${e.message}`)
    localLogger.debug(`Commiting offset after processing message with count ${messageCount}`)

    // commit the message and ignore it
    await consumer.commitOffset({ topic, partition, offset: m.offset })
    return
  }

  if (messageJSON.topic !== topic) {
    localLogger.error(`The message topic ${messageJSON.topic} doesn't match the Kafka topic ${topic}.`)

    localLogger.debug(`Commiting offset after processing message with count ${messageCount}`)

    // commit the message and ignore it
    await consumer.commitOffset({ topic, partition, offset: m.offset })
    return
  }
  try {
    if (topicServiceMapping[topic]) {
      await topicServiceMapping[topic](messageJSON)
      localLogger.debug(`Successfully processed message with count ${messageCount}`)
    }
  } catch (err) {
    logger.logFullError(err, { component: 'app' })
  } finally {
    localLogger.debug(`Commiting offset after processing message with count ${messageCount}`)

    // Commit offset regardless of error
    await consumer.commitOffset({ topic, partition, offset: m.offset })
  }
})

// check if there is kafka connection alive
const check = () => {
  if (!consumer.client.initialBrokers && !consumer.client.initialBrokers.length) {
    return false
  }
  let connected = true
  consumer.client.initialBrokers.forEach(conn => {
    localLogger.debug(`url ${conn.server()} - connected=${conn.connected}`)
    connected = conn.connected & connected
  })
  return connected
}

const topics = Object.values(config.topics)

/**
 * Init consumer.
 *
 * @returns {undefined}
 */
async function initConsumer () {
  await consumer
    .init([{
      subscriptions: topics,
      handler: async (messageSet, topic, partition) => {
        eventEmitter.emit('start_handling_message')
        localLogger.debug(`Consumer handler. Topic: ${topic}, partition: ${partition}, message set length: ${messageSet.length}`)
        await dataHandler(messageSet, topic, partition)
        eventEmitter.emit('end_handling_message')
      }
    }])
    .then(() => {
      localLogger.info('Initialized.......')
      healthcheck.init([check])
      localLogger.info(topics)
      localLogger.info('Kick Start.......')
    }).catch(err => {
      logger.logFullError(err, { component: 'app' })
    })
}

if (!module.parent) {
  initConsumer()
  // schedule the payment methods processing job
  cron.schedule(config.get('PAYMENT_METHODS_PROCESSOR_CRON_EXPRESSION'), () => PaymentMethodsProcessorService.processPaymentMethods())
}

module.exports = {
  initConsumer,
  eventEmitter,
  topicServiceMapping
}
