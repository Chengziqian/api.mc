const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const moment = require('moment');
const uuid = require('uuid/v1');
const validate = require('../../libs/validate');
const DB = require('../../libs/DB_Service');
let valid = {
  email: [{type:'required'},{type:'string'},{type: 'email'}],
  password: [{type:'required'},{type: 'string'}],
  type: [{type:'required'},{type: 'integer'}],
}

// let valid_student = {
//   email: [{type:'required'},{type:'string'},{type: 'email'}],
//   password: [{type:'required'},{type: 'string'}],
//   type: [{type:'required'},{type: 'integer'}],
//   truename: [{type:'required'},{type: 'string'}],
//   qq_number: [{type:'required'},{type: 'string'}],
//   phone: [{type:'required'},{type: 'string'}],
//   id_code: [{type:'required'},{type: 'string'}],
//   competition_area: [{type:'required'},{type: 'string'}],
//   competition_type: [{type:'required'},{type: 'integer'}],
//   school_name: [{type:'required'},{type: 'string'}],
//   major: [{type:'required'},{type: 'string'}],
//   school_number: [{type:'required'},{type: 'string'}]
// };

let getClientIp = function (req) {
  return req.ip || req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress || '';
};

router.post('/register', function(req, res, next) {
  validate({type: req.body.type},{type: [{type:'required'},{type: 'integer'}]}, function (err) {
    if (err) next(err);
    else next();
  })
}, function (req, res, next) {
    validate(req.body, valid, function (err) {
      if (err) next(err);
      else next()
    })
}, function (req, res, next) {
  if (!(req.body.type === 1 || req.body.type === 0))
    next({status: 422, message:{type: ["type is invalid"]}});
  else next();
}, function (httpReq, httpRes, next) {
  let data = httpReq.body;
  data.status = 0;
  data.access = -1;
  data.login_time = moment().format('YYYY-MM-DD HH:mm:ss');
  data.password = crypto.createHash('sha1').update(data.password).digest('hex');
  let token;
  DB.GET('users','email', data.email).then(res => {
      if (res.length > 0) return Promise.reject({status: 422, message:{email: ["email is repeated"]}});
      return DB.INSERT('users', data);
    }).then(res => {
      let user_id = res.insertId;
      token = {
        user_id: user_id,
        token: uuid(),
        ip: getClientIp(httpReq),
        expired_time: moment().add(20, 'm').format('YYYY-MM-DD HH:mm:ss')
      };
      return DB.INSERT('api_token', token);
    }).then((res) => httpRes.status(200).send({token: token.token})).catch(e => {
      console.log(e.stack || e)
      next(e.stack || e);
    })
  });

module.exports = router;
