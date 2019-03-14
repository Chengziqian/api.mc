const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const mailSender = require('../../libs/Mail_Service');
const validate = require('../../libs/validate');
const DB = require('../../libs/DB_Service');
const CheckCaptcha = require('../../middleware/CheckCaptcha');
const CheckEmailRepeat = require('../../middleware/CheckEmaliRepeat');

let valid = {
  email: [{type:'required'},{type:'string'},{type: 'email'},{type: 'alias', text: '邮箱'}],
  password: [{type:'required'},{type: 'string'},{type: 'alias', text: '密码'}],
  captcha: [{type:'required'},{type: 'string'},{type: 'alias', text: '验证码'}],
  origin_password: [{type:'required'},{type: 'string'},{type: 'length|6-18'},{type: 'alias', text: '密码'}]
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


router.post('/register', function (req, res, next) {
    validate(req.body, valid, function (err) {
      if (err) next(err);
      else next()
    })
}, CheckCaptcha, CheckEmailRepeat, function (httpReq, httpRes, next) {
  let data = httpReq.body;
  delete data['captcha'];
  delete data['origin_password'];
  data.status = 1;
  data.access = -1;
  data.type = 1;
  data.active_code = randomString(64);
  data.password = crypto.createHash('sha256').update(data.password).digest('hex');
  let insertId = '';
  DB.INSERT('users', data).then((res) => {
      // insertId = res.insertId;
      // let html = '<h1>数学竞赛激活邮件</h1>' +
      //   '<hr>' +
      //   '<p>请点击以下链接激活</p>' +
      //   '<a href="' + process.env.APP_BASE_URL +
      //   process.env.APP_ACTIVE_ROUTE + '?id=' + insertId + '&active=' + data.active_code +'">'+ process.env.APP_BASE_URL +
      //   process.env.APP_ACTIVE_ROUTE + '?id=' + insertId + '&active=' + data.active_code + '</a>';
      // mailSender(data.email, "数学竞赛", "激活邮件", html).catch(e => console.log(e));
      httpRes.sendStatus(200);
    }).catch(e => next(e));
  });

module.exports = router;
