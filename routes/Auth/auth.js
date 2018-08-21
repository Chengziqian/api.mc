const express = require('express');
const router = express.Router();
const DB = require('../../libs/DB_Service');
const CheckLogined = require('../../middleware/CheckLogined');
router.get('/',CheckLogined ,function (httpReq, httpRes, next) {
  let token = httpReq.headers['api-token'];
  let api_token = {};
  DB.GET('api_token', 'token', token, 'first').then(res => {
    if (res.length === 0) return Promise.reject(new HttpError(401, '请先登录'));
    else {
      api_token = res[0];
      old_token = api_token.token;
      return DB.GET('users', 'id', res[0].user_id);
    }
  }).then(res => {
    if (res.length === 0) return Promise.reject(new HttpError(401, '请先登录'));
    else {
      delete res[0]['password'];
      httpRes.status(200).send(res[0]);
    }
  }).catch(e => {
    if (e === 'next') next();
    else {
      console.log(e.stack || e)
      next(e.stack || e);
    }
  })
});

module.exports = router;