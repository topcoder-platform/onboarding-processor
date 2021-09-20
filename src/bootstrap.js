const Joi = require('@hapi/joi')

global.Promise = require('bluebird')

Joi.positiveId = () => Joi.number().integer().positive()
