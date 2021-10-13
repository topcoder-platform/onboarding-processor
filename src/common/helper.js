/**
 * Contains generic helper methods
 */

const config = require('config')
const request = require('superagent')
const logger = require('./logger')
const _ = require('lodash')
const m2mAuth = require('tc-core-library-js').auth.m2m
const Wrapper = require('informix-wrapper')
const informixSettings = config.INFORMIX

let m2m

/**
 * Get Kafka options
 * @return {Object} the Kafka options
 */
function getKafkaOptions () {
  const options = { connectionString: config.KAFKA_URL, groupId: config.KAFKA_GROUP_ID }
  if (config.KAFKA_CLIENT_CERT && config.KAFKA_CLIENT_CERT_KEY) {
    options.ssl = { cert: config.KAFKA_CLIENT_CERT, key: config.KAFKA_CLIENT_CERT_KEY }
  }
  return options
}

/*
 * Function to get M2M token
 * @returns {Promise}
 */
async function getM2MToken () {
  if (!m2m) {
    m2m = m2mAuth(_.pick(config.auth0, ['AUTH0_URL', 'AUTH0_AUDIENCE', 'AUTH0_PROXY_SERVER_URL']))
  }
  return m2m.getMachineToken(config.auth0.AUTH0_CLIENT_ID, config.auth0.AUTH0_CLIENT_SECRET)
}

/**
 * This function retrieves the user handle corresponding to the given user id
 *
 * @param {Number} userId The id of the user for whome to get the handle
 * @returns The user handle identified by the given userId
 *
 */
async function getHandleByUserId (userId) {
  logger.debug({ component: 'helper', context: 'getHandleByUserId', message: `userId: ${userId}` })

  const { body: result } = await request.get(`${config.MEMBER_API_URL}?userId=${userId}&fields=handle`)

  if (result.length === 0) { // user with the given id does not exist
    const err = new Error(`User with id ${userId} does not exist`)
    logger.logFullError(err, { component: 'helper' })
    throw err
  } else {
    return result[0].handle
  }
}

/**
 * This function retrieves the details of the user identified by the given handle
 *
 * @param {String} handle The handle of the user for whom to get the details
 * @returns The details of the user
 *
 */
async function getMemberByHandle (handle) {
  logger.debug({ component: 'helper', context: 'getMemberByHandle', message: `handle: ${handle}` })

  const { body: user } = await request.get(`${config.MEMBER_API_URL}/${handle}`)

  return user
}

/**
 * Gets the member traits for the given trait id and member handle
 *
 * @param {String} handle The member handle for whome to get the traits
 * @param {String} traitId The string identifier of the traits to get for the member
 * @returns {Promise} The member traits promise
 */
async function getMemberTraits (handle, traitId) {
  logger.debug({ component: 'helper', context: 'getMemberTraits', message: `{ handle: ${handle}, traitId : ${traitId} }` })

  const token = await getM2MToken()

  const { body: traits } = await request
    .get(`${config.MEMBER_API_URL}/${handle}/traits?traitIds=${traitId}`)
    .set('Authorization', `Bearer ${token}`)
  return traits
}

/**
 * Saves the given member traits body data for the user identified by the specified handle
 * This function supports creating new traits or updating existing traits based on 'isCreate' parameter
 *
 * @param {String} handle The member for whome to create/update the traits
 * @param {Object} body The request body to use for creating/updating the traits
 * @param {Boolean} isCreate The flag indicating whether to create or update the traits
 */
async function saveMemberTraits (handle, body, isCreate) {
  logger.debug({
    component: 'helper',
    context: 'saveMemberTraits',
    message: `{ handle: ${handle}, body: ${JSON.stringify(body)}, isCreate: ${isCreate}}`
  })

  const token = await getM2MToken()

  // Determine the HTTP method to use based on the isCreate flag
  const httpMethod = isCreate ? 'post' : 'put'

  // Send the post/put request to the member traits api
  await request[httpMethod](`${config.MEMBER_API_URL}/${handle}/traits`)
    .send(body)
    .set('Authorization', `Bearer ${token}`)
}

/**
 * Create informix connection
 * @param database the database.
 * @param reject the reject function.
 */
const createConnection = (database, reject) => {
  logger.debug(`Creating Informix Connection ${JSON.stringify(database)}`)
  const jdbc = new Wrapper(_.extend(informixSettings, { database }), e => logger.debug)
  jdbc.on('error', (err) => {
    jdbc.disconnect()
    reject(err)
  })
  return jdbc.initialize()
}

/**
 * Execute query in informix database.
 * @param database the database.
 * @param sql the sql.
 * @param params the sql params.
 */
const executeQueryAsync = (database, sql, params) => new Promise((resolve, reject) => {
  logger.debug(`Execute Query ${JSON.stringify(sql)} params: ${JSON.stringify(params)}`)
  const connection = createConnection(database, reject)
  connection.connect((error) => {
    if (error) {
      connection.disconnect()
      reject(error)
    } else {
      connection.query(sql, (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      }, {
        start: function (q) {
          logger.debug(`Start to execute: '${q}'`)
        },
        finish: (f) => {
          connection.disconnect()
          logger.debug(`Query execution result: ${f}`)
        }
      }).execute(params)
    }
  })
})

/**
 * This function checks if the user identified by the specified handle has entered skills
 *
 * @param {String} handle the user handle for whom to check if the skills are entered
 * @returns true if the user has entered skills, false otherwise
 *
 */
async function hasUserEnteredSkills (handle) {
  logger.debug({ component: 'helper', context: 'hasUserEnteredSkills', message: `handle: ${handle}` })
  const { body: result } = await request.get(`${config.MEMBER_API_URL}/${handle}/skills`)
  return !_.isUndefined(result) && !_.isEmpty(result.skills)
}

module.exports = {
  getKafkaOptions,
  getM2MToken,
  getHandleByUserId,
  getMemberTraits,
  saveMemberTraits,
  executeQueryAsync,
  hasUserEnteredSkills,
  getMemberByHandle
}
