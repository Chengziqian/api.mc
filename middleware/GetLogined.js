const DB = require('../libs/DB_Service');
const moment = require('moment');
const createError = require('http-errors');

let getClientIp = function (req) {
  return req.ip || req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress || '';
};

module.exports = function (httpReq, httpRes, next) {
  let token = httpReq.headers['api-token'] || httpReq.headers['Api-Token'];
  let api_token = {};
  DB.GET('api_token', 'token', token, 'first').then(res => {
    if (res.length === 0) return Promise.reject(null);
    else {
      api_token = res[0];
      old_token = api_token.token;
      if ((api_token.expired_time === null || moment(api_token.expired_time).isAfter(moment())) &&
        api_token.ip === getClientIp(httpReq)) {
        return DB.GET('users', 'id', res[0].user_id);
      } else {
        return Promise.reject(null);
      }
    }
  }).then(res => {
    if (res.length === 0) return Promise.reject(null);
    else {
      httpReq.USER = res[0];
      next();
    }
  }).catch(e => {
    httpReq.USER = null;
    next();
  })
};