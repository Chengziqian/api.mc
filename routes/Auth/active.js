const express = require('express');
const router = express.Router();
const DB = require('../../libs/DB_Service');
const HttpError = require('../../libs/HttpError');

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
      let html = '<h2 style="color: green">邮箱验证成功</h2>' +
        '<hr>' +
        '<a href="' + process.env.APP_baseUrl + '">点击此链接跳转至登陆界面</a>';
      httpRes.send(html);
    }).catch(e => {
      if (e === 'ACTIVATED') {
        let html = '<h2 style="color: green">邮箱已验证</h2>' +
          '<hr>' +
          '<a href="' + process.env.APP_baseUrl + '">点击此链接跳转至登陆界面</a>';
        httpRes.send(html);
      } else if (e === 'INVALID') {
        let html = '<h2 style="color: red">未识别的激活链接</h2>' +
          '<hr>' +
          '<a href="'+ process.env.APP_baseUrl +'">点击此链接跳转至登陆界面重新发送激活邮件</a>';
        httpRes.send(html);
      }
      else {
        console.log(e.stack || e);
        next(e.stack || e);
      }
    })
  } else {
    next()
  }
});

module.exports = router;