const express = require('express');
const router = express.Router();
const DB = require('../../libs/DB_Service');
const HttpError = require('../../libs/HttpError');
const crypto = require('crypto');
const validate = require('../../libs/validate');
const CheckLogined = require('../../middleware/CheckLogined');
let valid = {
  password_old: [{type:'required'},{type:'string'}],
  password_new: [{type:'required'},{type: 'string'}]
};

router.put('/changePwd', CheckLogined, function (httpReq, httpRes, next) {
  validate(httpReq.body, valid, function (err) {
    if(err) next(err);
    else next();
  })
}, function (httpReq, httpRes, next) {
  let token = httpReq.headers['api-token'] || httpReq.headers['Api-Token'];
  DB.GET('api_token', 'token', token, 'first').then(res => {
    return DB.GET('users', 'id', res[0].user_id);
  }).then(res => {
    let old_pwd = crypto.createHash('sha256').update(httpReq.body.password_old).digest('hex')
    if (old_pwd === res[0].password) {
      let pwd = crypto.createHash('sha256').update(httpReq.body.password_new).digest('hex');
      return DB.SAVE('users', 'id', res[0].id, {password: pwd})
    } else {
      return Promise.reject(new HttpError(422, "旧密码不正确"))
    }
  }).then(res => httpRes.sendStatus(200)).catch(e => next (e))
});

module.exports = router