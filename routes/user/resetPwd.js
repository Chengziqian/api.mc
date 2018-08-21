const express = require('express');
const router = express.Router();
const DB = require('../../libs/DB_Service');
const HttpError = require('../../libs/HttpError');
const mailSender = require('../../libs/Mail_Service');
const crypto = require('crypto');
const validate = require('../../libs/validate');

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
    email: [{type:'required'},{type:'string'},{type: 'email'}]
  }
  validate(req.body, valid, function (err) {
    if (err) next(err);
    else next();
  })
}, function (httpReq, httpRes, next) {
  let user = {};
  let token = '';
  DB.GET('users', 'email', httpReq.body.email).then(res => {
    if (res.length === 0) return Promise.reject(new HttpError(422, '邮箱不存在'));
    else {
      user = res[0];
      token = randomString(64);
      return DB.SAVE('users', 'email', httpReq.body.email, {reset_token: token})
    }
  }).then(res => {
    let html = '<h1>数学竞赛重置密码邮件</h1>' +
      '<hr>' +
      '<p>请点击以下链接跳转至重置密码页面</p>' +
      '<a href="'+ httpReq.headers.host +
      '/resetPwd/active?id=' + user.id + '&reset=' + token +'">'+ httpReq.headers.host +
      '/resetPwd/active?id=' + user.id + '&reset=' + token + '</a>';
    return mailSender(user.email, "数学竞赛", "重置邮件", html);
  }).then(res => {
    httpRes.sendStatus(200);
  }).catch(e => {
    next(e.stack || e);
  })
});

router.put('/resetPwd',function (req, res, next) {
  let valid = {
    password: [{type:'required'},{type:'string'}],
    id: [{type:'required'},{type: 'string'}],
    reset: [{type:'required'},{type: 'string'}]
  }
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
        httpRes.status(422).send(new HttpError(422, '无效的重置链接'))
      }
      else {
        next(e.stack || e);
      }
    })
  } else {
    next()
  }
});

module.exports = router;