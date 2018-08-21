const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const uuid = require('uuid/v1');
const moment = require('moment');
const validate = require('../../libs/validate');
const DB = require('../../libs/DB_Service');
const HttpError = require('../../libs/HttpError');

let getClientIp = function (req) {
  return req.ip || req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress || '';
};
let logon_valid = {
  email: [{type:'required'},{type:'string'},{type: 'email'}],
  password: [{type:'required'},{type: 'string'}]
};
router.post('/login', function(req, res, next) {
  validate(req.body, logon_valid, function (err) {
    if (err) throw err;
    else next();
  })
}, function (httpReq, httpRes, next) {
  let data = httpReq.body;
  let token = {};
  DB.GET('users', 'email', data.email).then(res => {
    console.log(httpReq.headers['host'])
    if (res.length === 0) return Promise.reject(new HttpError(401, '用户名或密码错误'));
    else {
      let psw = crypto.createHash('sha256').update(data.password).digest('hex');
      if (res[0].password === psw) {
        if (res[0].status === 0) {
          return Promise.reject(new HttpError(401, '账户未激活'));
        } else {
          token = {
            user_id: res[0].id,
            token: uuid(),
            ip: getClientIp(httpReq),
            expired_time: moment().add(20, 'm').format('YYYY-MM-DD HH:mm:ss')
          };
          return DB.INSERT('api_token', token);
        }
      } else {
        return Promise.reject(new HttpError(401, '用户名或密码错误'))
      }
    }
  }).then(res => {
    return DB.SAVE('users', 'id', token.user_id, {login_time: moment().format('YYYY-MM-DD HH:mm:ss')});
  }).then(res => httpRes.status(200).send({token: token.token})).catch(e => {
      next(e.stack || e);
    })
  });

module.exports = router;


