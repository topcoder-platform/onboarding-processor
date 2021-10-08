/**
 * The default configuration file.
 */
require('dotenv').config()
module.exports = {
  PORT: process.env.PORT || 3001,
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',

  KAFKA_URL: process.env.KAFKA_URL || 'localhost:9092',
  // below are used for secure Kafka connection, they are optional
  // for the local Kafka, they are not needed
  KAFKA_CLIENT_CERT: process.env.KAFKA_CLIENT_CERT,
  KAFKA_CLIENT_CERT_KEY: process.env.KAFKA_CLIENT_CERT_KEY,

  // Kafka group id
  KAFKA_GROUP_ID: process.env.KAFKA_GROUP_ID || 'onboarding-checklist-processor',

  MEMBER_API_URL: process.env.MEMBER_API_URL || 'https://api.topcoder-dev.com/v5/members',

  STANDARD_TERMS_ID: process.env.STANDARD_TERMS_ID || '0dedac8f-5a1a-4fe7-001f-e1d04dc65b7d',
  NDA_TERMS_ID: process.env.NDA_TERMS_ID || '0dedac8f-5a1a-4fe7-002f-e1d04dc65b7d',

  topics: {
    // The Kafka topic to which to listen to user terms agreement events
    TERMS_USER_AGREEMENT_TOPIC: process.env.TERMS_USER_AGREEMENT_TOPIC || 'terms.notification.user.agreed',
    // The Kafka topic to which to listen to user tax form updated events
    USER_TAXFORM_UPDATE_TOPIC: process.env.USER_TAXFORM_UPDATE_TOPIC || 'terms.notification.user.taxform.updated'
  },

  auth0: {
    AUTH0_URL: process.env.AUTH0_URL,
    AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE,
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
    AUTH0_PROXY_SERVER_URL: process.env.AUTH0_PROXY_SERVER_URL,
    TOKEN_CACHE_TIME: process.env.TOKEN_CACHE_TIME
  },

  PAYMENT_METHODS_PROCESSOR_CRON_EXPRESSION: process.env.PAYMENT_METHODS_PROCESSOR_CRON_EXPRESSION || '* * * * *',
  MODIFIED_PAYMENT_METHODS_TIMEFRAME_DAYS: process.env.MODIFIED_PAYMENT_METHODS_TIMEFRAME_DAYS || 3,

  INFORMIX: {
    server: process.env.INFORMIX_SERVER || 'informixoltp_tcp', // informix server
    database: process.env.INFORMIX_DATABASE || 'informixoltp', // informix database
    host: process.env.INFORMIX_HOST || 'localhost', // host
    protocol: process.env.INFORMIX_PROTOCOL || 'onsoctcp',
    port: process.env.INFORMIX_PORT || '2021', // port
    db_locale: process.env.INFORMIX_DB_LOCALE || 'en_US.57372',
    user: process.env.INFORMIX_USER || 'informix', // user
    password: process.env.INFORMIX_PASSWORD || '1nf0rm1x', // password
    maxsize: parseInt(process.env.MAXSIZE) || 0,
    minpool: parseInt(process.env.MINPOOL, 10) || 1,
    maxpool: parseInt(process.env.MAXPOOL, 10) || 60,
    idleTimeout: parseInt(process.env.IDLETIMEOUT, 10) || 3600,
    timeout: parseInt(process.env.TIMEOUT, 10) || 30000
  },

  ID_VERIFICATION_PROCESSOR_CRON_EXPRESSION: process.env.ID_VERIFICATION_PROCESSOR_CRON_EXPRESSION || '* * * * *',
  FETCH_LOOKER_VERIFIED_MEMBER_TIMEFRAME_DAYS: process.env.FETCH_LOOKER_VERIFIED_MEMBER_TIMEFRAME_DAYS || '4',
  // looker-api config
  lookerConfig: {
    BASE_URL: process.env.LOOKER_API_BASE_URL || '', // looker api base url
    CLIENT_ID: process.env.LOOKER_API_CLIENT_ID || '', // looker api client id
    CLIENT_SECRET: process.env.LOOKER_API_CLIENT_SECRET || '', // looker api client secret
    TOKEN: process.env.LOOKER_API_TOKEN || 'TOKEN' // looker api token
  }
}
