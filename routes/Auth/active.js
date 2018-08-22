const express = require('express');
const router = express.Router();
const DB = require('../../libs/DB_Service');
const HttpError = require('../../libs/HttpError');
const validate = require('../../libs/validate');
const mailSender = require('../../libs/Mail_Service');

router.get('/active', function (httpReq, httpRes, next) {
  let id = httpReq.query.id;
  let active = httpReq.query.active;
  if (id && active) {
    DB.GET('users', 'id', id).then(res => {
      if (res.length === 0) return Promise.reject('INVALID');
      if (res[0].status === 0 && res[0].active_code === active) {
        return DB.SAVE('users','id', id, {status: 1});
      } else {
        if (res[0].status !== 0)
        return Promise.reject('ACTIVATED');
        else return Promise.reject('INVALID');
      }
    }).then(res => {
      httpRes.sendStatus(200);
    }).catch(e => {
      if (e === 'ACTIVATED') {
        httpRes.sendStatus(200)
      } else if (e === 'INVALID') {
        httpRes.status(422).send(new HttpError(422, '无效的激活链接'))
      }
      else {
        next(e);
      }
    })
  } else {
    next()
  }
});

router.post('/active',function (req, res, next) {
  validate(req.body, {email: [{type:'required'},{type:'string'},{type: 'email'}]}, function (err) {
    if (err) next(err);
    else next()
  })
} ,function (httpReq, httpRes, next) {
  let data = httpReq.body;
  DB.GET('users', 'email', data.email).then(res => {
    if (res.length === 0) return Promise.reject(new HttpError(422, '无效的邮箱'))
    else {
      let html = '<h1>数学竞赛激活邮件</h1>' +
        '<hr>' +
        '<p>请点击以下链接激活</p>' +
        '<a href="'+ 'http://' + httpReq.headers.host +
        '/auth/active?id=' + res[0].id + '&active=' + res[0].active_code +'">'+ 'http://' +httpReq.headers.host +
        '/auth/active?id=' + res[0].id + '&active=' + res[0].active_code + '</a>';
      return mailSender(data.email, "数学竞赛", "激活邮件", html);
    }
  }).then(res => httpRes.sendStatus(200)).catch(e => next(e))
});

module.exports = router;