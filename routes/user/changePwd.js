const express = require('express');
const router = express.Router();
const DB = require('../../libs/DB_Service');
const createError = require('http-errors');
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
  let old_pwd = crypto.createHash('sha256').update(httpReq.body.password_old).digest('hex')
  if (old_pwd === httpReq.USER.password) {
    let pwd = crypto.createHash('sha256').update(httpReq.body.password_new).digest('hex');
    DB.SAVE('users', 'id', httpReq.USER.id, {password: pwd}).then(e => httpRes.sendStatus(200)).catch(e => next(e))
  } else {
    next(createError(422, {message: {password_old: ["旧密码不正确"]}}))
  }
});

module.exports = router