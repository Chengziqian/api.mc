const svgCaptcha = require('svg-captcha');
const express = require('express');
const uuid = require('uuid/v1');
const router = express.Router();
const DB = require('../../libs/DB_Service');
const moment = require('moment');
router.get('/captcha', function (req, res, next) {
  let captcha_token = uuid();
  let captcha = svgCaptcha.create({color: true});
  let data = {
    code: captcha.text,
    captcha_token: captcha_token,
    expired_time: moment().add(2, 'm').format('YYYY-MM-DD HH:mm:ss')
  };
  DB.INSERT('captcha', data).then(r => {
    res.type('svg');
    res.setHeader('Captcha_Token', captcha_token);
    res.status(200).send(captcha.data);
  }).catch(e => next(e));
  DB.DELETE_EXPIRED('captcha').catch(e => console.log(e));
});

module.exports = router;
