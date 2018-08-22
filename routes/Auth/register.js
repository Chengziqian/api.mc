const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const mailSender = require('../../libs/Mail_Service');
const validate = require('../../libs/validate');
const DB = require('../../libs/DB_Service');
let valid = {
  email: [{type:'required'},{type:'string'},{type: 'email'}],
  password: [{type:'required'},{type: 'string'}],
  type: [{type:'required'},{type: 'integer'}],
};

function randomString(len) {
  len = len || 32;
  let $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let maxPos = $chars.length;
  let pwd = '';
  for (i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * (maxPos+1)));
  }
  return pwd;
}


router.post('/register', function(req, res, next) {
  validate({type: req.body.type},{type: [{type:'required'},{type: 'integer'}]}, function (err) {
    if (err) next(err);
    else next();
  })
}, function (req, res, next) {
    validate(req.body, valid, function (err) {
      if (err) next(err);
      else next()
    })
}, function (req, res, next) {
  if (!(req.body.type === 1 || req.body.type === 0))
    next({status: 422, message:{type: ["type is invalid"]}});
  else next();
}, function (httpReq, httpRes, next) {
  let data = httpReq.body;
  data.status = 0;
  data.access = -1;
  data.active_code = randomString(64);
  data.password = crypto.createHash('sha256').update(data.password).digest('hex');
  let token;
  DB.GET('users','email', data.email).then(res => {
      if (res.length > 0) return Promise.reject({status: 422, message:{email: ["email is repeated"]}});
      return DB.INSERT('users', data);
    }).then(res => {
      let html = '<h1>数学竞赛激活邮件</h1>' +
        '<hr>' +
        '<p>请点击以下链接激活</p>' +
        '<a href="'+ 'http://' + httpReq.headers.host +
        '/auth/active?id=' + res.insertId + '&active=' + data.active_code +'">'+ 'http://' +httpReq.headers.host +
        '/auth/active?id=' + res.insertId + '&active=' + data.active_code + '</a>';
      return mailSender(data.email, "数学竞赛", "激活邮件", html);
    }).then((res) => httpRes.sendStatus(200)).catch(e => next(e))
  });

module.exports = router;
