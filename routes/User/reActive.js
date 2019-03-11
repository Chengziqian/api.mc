const express = require('express');
const router = express.Router();
const DB = require('../../libs/DB_Service');
const createError = require('http-errors');
const mailSender = require('../../libs/Mail_Service');
const validate = require('../../libs/validate');
const CheckCaptcha = require('../../middleware/CheckCaptcha');

router.post('/reActive', function(req, res, next){
  let valid = {
    email: [{type:'required'},{type:'string'},{type: 'email'},{type: 'alias', text: '邮箱'}],
    captcha: [{type:'required'},{type: 'string'},{type: 'alias', text: '验证码'}]
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
      token = user.active_code
    }
  }).then(res => {
    let html = '<h1>数学竞赛激活邮件</h1>' +
      '<hr>' +
      '<p>请点击以下链接激活</p>' +
      '<a href="' + process.env.APP_BASE_URL +
      process.env.APP_ACTIVE_ROUTE + '?id=' + insertId + '&active=' + data.active_code +'">'+ process.env.APP_BASE_URL +
      process.env.APP_ACTIVE_ROUTE + '?id=' + insertId + '&active=' + data.active_code + '</a>';
    return mailSender(user.email, "数学竞赛", "激活邮件", html);
  }).then(res => {
    httpRes.sendStatus(200);
  }).catch(e => next(e))
});

module.exports = router;
