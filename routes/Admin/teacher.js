const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const DB = require('../../libs/DB_Service');
const CheckEmailRepeat = require('../../middleware/CheckEmaliRepeat');
const CheckLogined = require('../../middleware/CheckLogined');
const CheckAdmin = require('../../middleware/CheckAdmin');
const validate = require('../../libs/validate');
const mailSender = require('../../libs/Mail_Service');

let roles = {
  email: [{type:'required'},{type:'string'},{type: 'email'},{type: 'alias', text: '邮箱'}],
  truename: [{type:'required'},{type:'string'},{type: 'alias', text: '真实姓名'}]
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

router.post('/teacher', CheckLogined, CheckAdmin, function (req, res, next) {
  validate(req.body, roles, function (err) {
    if (err) next(err);
    else next();
  })
}, CheckEmailRepeat, function (httpReq, httpRes, next) {
  let pwd = randomString(6);
  let data = {
    email: httpReq.body.email,
    truename: httpReq.body.truename,
    password: crypto.createHash('sha256').update(pwd).digest('hex'),
    status: 1,
    access: 0,
    type: 0
  };
  DB.INSERT('users', data).then(res => httpRes.sendStatus(200)).catch(e => next(e));
  let html = '<h1>数学竞赛账号邮件</h1>' +
    '<span><span style="padding-right: 10px;font-size: 16pt;font-weight: 200">' + data.truename + '</span>老师， 您好！</span>' +
    '<h3>欢迎加入数学竞赛报名系统!</h3>' +
    '<hr>' +
    '<h2>您的账号密码如下：</h2>' +
    '<p>账号：' + data.email +'</p>' +
    '<p>密码：' + pwd +'</p>'+
    '<hr>' +
    '<p style="color: red">请妥善管理该邮件并及时登入账户修改密码</p>';
  mailSender(data.email, "数学竞赛", "账号添加提醒", html).catch(e => console.log(e.stack || e));
});

router.get('/teacher', CheckLogined, CheckAdmin, function (req, res, next) {
  DB.GET('users', 'type', 0).then(r => {
    r = r.map(o => ({
      access: o.access,
      truename: o.truename,
      email: o.email,
      gender: o.gender,
      qq_number: o.qq_number,
      phone: o.phone,
      login_time: o.login_time
    }));
    res.status(200).send(r)
  }).catch(e => next(e));
});

module.exports = router;
