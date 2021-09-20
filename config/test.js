/**
 * The default configuration file.
 */
require('dotenv').config()
module.exports = {
  PORT: process.env.PORT || 3001,
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',

  MEMBER_API_URL: 'http://localhost:3000/v5/members'

}
