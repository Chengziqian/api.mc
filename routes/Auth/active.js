const express = require('express');
const router = express.Router();
const DB = require('../../libs/DB_Service');
const createError = require('http-errors');
const validate = require('../../libs/validate');
const mailSender = require('../../libs/Mail_Service');
const uuid = require('uuid/v1');
const moment = require('moment');

let getClientIp = function (req) {
  return req.ip || req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress || '';
};

router.put('/active', function (httpReq, httpRes, next) {
  let id = httpReq.query.id;
  let active = httpReq.query.active;
  let token = {};
  if (id && active) {
    DB.GET('users', 'id', id).then(res => {
      if (res.length === 0) return Promise.reject('INVALID');
      if (res[0].status === 0 && res[0].active_code === active) {
        return DB.SAVE('users','id', id, {status: 1, login_time: moment().format('YYYY-MM-DD HH:mm:ss')});
      } else {
        return Promise.reject('INVALID');
      }
    }).then(res => {
      token = {
        user_id: id,
        token: uuid(),
        ip: getClientIp(httpReq),
        expired_time: moment().add(20, 'm').format('YYYY-MM-DD HH:mm:ss')
      };
      return DB.INSERT('api_token', token);
    }).then(res => {
      httpRes.status(200).send({token: token});
    }).catch(e => {
      if (e === 'INVALID') {
        next(createError(400, {message:'无效的激活链接'}))
      }
      else {
        next(e);
      }
    })
  } else {
    next(createError(400, {message:'无效的激活链接'}))
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
    if (res.length === 0) return Promise.reject(createError(400, {message:'无效的邮箱'}));
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