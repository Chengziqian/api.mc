const express = require('express');
const router = express.Router();
const DB = require('../../libs/DB_Service');
const createError = require('http-errors');
const CheckLogined = require('../../middleware/CheckLogined');
router.get('/',CheckLogined ,function (httpReq, httpRes, next) {
  let token = httpReq.headers['api-token'];
  let api_token = {};
  DB.GET('api_token', 'token', token, 'first').then(res => {
    if (res.length === 0) return Promise.reject(createError(401, {message:'请先登录'}));
    else {
      api_token = res[0];
      old_token = api_token.token;
      return DB.GET('users', 'id', res[0].user_id);
    }
  }).then(res => {
    if (res.length === 0) return Promise.reject(createError(401, {message:'请先登录'}));
    else {
      delete res[0]['password'];
      delete res[0]['active_code'];
      delete res[0]['reset_token'];
      httpRes.status(200).send(res[0]);
    }
  }).catch(e => next(e))
});

module.exports = router;