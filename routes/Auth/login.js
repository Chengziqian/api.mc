const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const uuid = require('uuid/v1');
const moment = require('moment');
const validate = require('../../libs/validate');
const DB = require('../../libs/DB_Service');
const HttpError = require('../../libs/HttpError')

let getClientIp = function (req) {
  return req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress || '';
};
let logon_valid = {
  email: [{type:'required'},{type:'string'},{type: 'email'}],
  password: [{type:'required'},{type: 'string'}]
}
router.post('/login', function(req, res, next) {
  validate(req.body, logon_valid, function (err) {
    if (err) throw err;
    else next();
  })
}, function (httpReq, httpRes, next) {
  let data = httpReq.body;
  let token = {};
  DB.GET('users', 'email', data.email).then(res => {
    if (res.length === 0) next(new HttpError(403, '用户名或密码错误'));
    else {
      let psw = crypto.createHash('sha1').update(data.password).digest('hex');
      if (res[0].password === psw) {
        token = {
          user_id: res[0].id,
          token: uuid(),
          ip: getClientIp(httpReq),
          expired_time: moment().add(20, 'm').format('YYYY-MM-DD HH:mm:ss')
        };
        return DB.INSERT('api_token', token);
      } else {
        next(new HttpError(403, '用户名或密码错误'));
      }
    }
  }).then(res => httpRes.status(200).send({token: token.token})).catch(e => {
      console.log(e.stack)
      next(e.stack);
    })
  });

module.exports = router;


