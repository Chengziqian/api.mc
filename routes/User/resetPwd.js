const express = require('express');
const router = express.Router();
const DB = require('../../libs/DB_Service');
const createError = require('http-errors');
const mailSender = require('../../libs/Mail_Service');
const crypto = require('crypto');
const validate = require('../../libs/validate');
const CheckCaptcha = require('../../middleware/CheckCaptcha');

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

router.post('/resetPwd', function(req, res, next){
  let valid = {
    email: [{type:'required'},{type:'string'},{type: 'email'},{type: 'alias', text: '邮箱'}],
    captcha: [{type:'required'},{type: 'string'},{type: 'alias', text: '验证码'}],
  };
  validate(req.body, valid, function (err) {
    if (err) next(err);
    else next();
  })
}, CheckCaptcha, function (httpReq, httpRes, next) {
  let user = {};
  let token = '';
  DB.GET('users', 'email', httpReq.body.email).then(res => {
    if (res.length === 0) return Promise.reject(createError(422, {message:{email: ['邮箱不存在']}}));
    else {
      user = res[0];
      token = randomString(64);
      return DB.SAVE('users', 'email', httpReq.body.email, {reset_token: token})
    }
  }).then(res => {
    let html = '<h1>数学竞赛重置密码邮件</h1>' +
      '<hr>' +
      '<p>请点击以下链接跳转至重置密码页面</p>' +
      '<a href="'+ process.env.APP_BASE_URL +
       process.env.APP_RESET_ROUTE +'?id=' + user.id + '&reset=' + token +'">'+ process.env.APP_BASE_URL +
       process.env.APP_RESET_ROUTE + '?id=' + user.id + '&reset=' + token + '</a>';
    return mailSender(user.email, "数学竞赛", "重置邮件", html);
  }).then(res => {
    httpRes.sendStatus(200);
  }).catch(e => next(e))
});

router.put('/resetPwd',function (req, res, next) {
  let valid = {
    password: [{type:'required'},{type:'string'}],
    origin_password: [{type:'required'},{type: 'string'},{type: 'length|6-18'},{type: 'alias', text: '新密码'}],
    id: [{type:'required'},{type: 'integer'}],
    reset: [{type:'required'},{type: 'string'}]
  };
  validate(req.body, valid, function (err) {
    if (err) next(err);
    else next();
  })
}, function (httpReq, httpRes, next) {
  let id = httpReq.body.id;
  let reset = httpReq.body.reset;
  if (id && reset) {
    DB.GET('users', 'id', id).then(res => {
      if (res.length === 0) return Promise.reject('INVALID');
      if (res[0].reset_token === reset) {
        let pwd = crypto.createHash('sha256').update(httpReq.body.password).digest('hex');
        return DB.SAVE('users','id', id, {password: pwd, reset_token: null});
      } else {
        return Promise.reject('INVALID');
      }
    }).then(res => {
      httpRes.sendStatus(200);
    }).catch(e => {
      if (e === 'INVALID') {
        next(createError(400, {message:'无效的重置链接'}))
      }
      else {
        next(e);
      }
    })
  } else {
    next()
  }
});

module.exports = router;
