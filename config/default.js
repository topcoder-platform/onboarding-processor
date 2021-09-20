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
    TERMS_USER_AGREEMENT_TOPIC: process.env.TERMS_USER_AGREEMENT_TOPIC || 'terms.notification.user.agreed'
  },

  auth0: {
    AUTH0_URL: process.env.AUTH0_URL,
    AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE,
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
    AUTH0_PROXY_SERVER_URL: process.env.AUTH0_PROXY_SERVER_URL,
    TOKEN_CACHE_TIME: process.env.TOKEN_CACHE_TIME
  }
}
