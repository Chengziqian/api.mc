const DB = require('../libs/DB_Service');
const createError = require('http-errors');
const moment = require('moment');
module.exports = function (httpReq, httpRes, next) {
  let code = httpReq.body.captcha.toLowerCase();
  let token = httpReq.headers['captcha-token'] || httpReq.headers['Captcha-Token'];
  DB.GET('captcha', 'captcha_token', token).then(r => {
    if (r.length === 0) return Promise.reject(createError(422, {message: {captcha: ['验证码错误']}}));
    else {
      if (r[0].code === code && moment(r[0].expired_time).isAfter(moment())) next();
      else return Promise.reject(createError(422, {message: {captcha: ['验证码错误']}}))
    }
  }).catch(e => next(e));
};