const express = require('express');
const router = express.Router();
const DB = require('../../libs/DB_Service');
const CheckLogined = require('../../middleware/CheckLogined');
const CheckAdmin = require('../../middleware/CheckAdmin');
const validate = require('../../libs/validate');
const createError = require('http-errors');
const mailSender = require('../../libs/Mail_Service');
const crypto = require('crypto');

let roles = {
  access: [{type:'required'},{type:'integer'},{type: 'alias', text: '权限'}]
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

router.put('/teacher/:id', CheckLogined, CheckAdmin, function (req, res, next) {
  validate(req.body, roles, function (err) {
    if (err) next(err);
    else next();
  })
}, function (httpReq, httpRes, next) {
  if (httpReq.body.access <= -1 || httpReq.body.access > 1) next(createError(400, {message: '非法的权限修改'}));
  else DB.SAVE('users', 'id', httpReq.params.id, {access: httpReq.body.access}).then(res => httpRes.sendStatus(200)).catch(e => next(e));
});

router.delete('/teacher/:id', CheckLogined, CheckAdmin, function (req, res, next) {
  DB.GET('users', 'id', req.params.id).then(r => {
    if (r.length === 0) return Promise.reject(createError(400, {message: '无此用户'}));
    else {
      if (r[0].type !== 0) return Promise.reject(createError(400, {message: '学生账户不可删除'}));
      else return DB.DELETE('users', 'id', req.params.id);
    }
  }).then(r => res.sendStatus(200)).catch(e => next(e));
});

router.post('/teacher/:id/resend', CheckLogined, CheckAdmin, function (req, res, next) {
  let pwd = randomString(6);
  let data = {
    password: crypto.createHash('sha256').update(pwd).digest('hex'),
  };
  let user = {};
  DB.GET('users', 'id', req.params.id).then(r => {
    if (r.length === 0) return Promise.reject(createError(400, {message: '无此用户'}));
    else {
      if (r[0].type !== 0) return Promise.reject(createError(400, {message: '学生账户不可操作'}));
      else {
        user = r[0];
        let html = '<h1>数学竞赛账号邮件</h1>' +
          '<span><span style="padding-right: 10px;font-size: 16pt;font-weight: 200">' + user.truename + '</span>老师， 您好！</span>' +
          '<h3>欢迎加入数学竞赛报名系统!</h3>' +
          '<hr>' +
          '<h2>您的账号密码如下：</h2>' +
          '<p>账号：' + user.email +'</p>' +
          '<p>密码：' + pwd +'</p>'+
          '<hr>' +
          '<p style="color: red">请妥善管理该邮件并及时登入账户修改密码</p>';
        mailSender(user.email, "数学竞赛", "账号添加提醒", html).catch(e => console.log(e.stack || e));
        return DB.SAVE('users', 'id', req.params.id , data);
      }
    }
  }).then(r => res.sendStatus(200)).catch(e => next(e));
});
module.exports = router;
