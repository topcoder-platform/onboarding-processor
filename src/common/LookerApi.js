/* eslint-disable valid-jsdoc */
/* eslint-disable require-jsdoc */
/* eslint-disable func-names */

import config from 'config';
import LookAuth from './LookAuth';

const axios = require('axios');

function LookApi(logger) {
  this.BASE_URL = config.lookerConfig.BASE_URL;
  this.formatting = 'json';
  this.limit = 5000;
  this.logger = logger;
  this.query_timezone = 'America/New_York';
  this.lookAuth = new LookAuth(logger);
}

LookApi.prototype.runLook = function (lookId) {
  const endpoint = `${this.BASE_URL}/looks/${lookId}/run/${this.formatting}?limit=${this.limit}`;
  return this.callApi(endpoint);
};

LookerApi.prototype.findRecentVerifiedMembers(duration) {
  const view = 'member_verification';
  const fields = ['user_id', 'verification_mode', 'status', 'matched_on', 'verification_date'];
  const filters = { 'member_verification.verification_date': '48 hours' };
  return this.runQueryWithFilter(view, fields, filters);
}

LookApi.prototype.runQueryWithFilter = function (view, fields, filters) {
  const endpoint = `${this.BASE_URL}/queries/run/${this.formatting}`;

  const body = {
    model: 'topcoder_model_main',
    view,
    filters,
    fields,
    // sorts: ['user.email desc 0'],
    limit: 10,
    query_timezone: this.query_timezone,

  };
  return this.callApi(endpoint, body);
};

LookApi.prototype.runQuery = function (queryId) {
  const endpoint = `${this.BASE_URL}/queries/${queryId}/run/${this.formatting}?limit=${this.limit}`;
  return this.callApi(endpoint);
};

LookApi.prototype.callApi = function (endpoint, body) {
  return this.lookAuth.getToken().then((token) => {
    let newReq = null;
    if (body) {
      newReq = axios.post(endpoint, body, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `token ${token}`,
        },
      });
    } else {
      newReq = axios.get(endpoint);
    }
    return newReq;
  }).then((res) => {
    this.logger.info(res.data);
    return res.data;
  });
};

module.exports = LookApi;
