const express = require('express');
const router = express.Router();
const DB = require('../../libs/DB_Service');
const createError = require('http-errors');
const CheckLogined = require('../../middleware/CheckLogined');
const CheckAdmin = require('../../middleware/CheckAdmin');

router.get('/:id',CheckLogined, CheckAdmin, function (httpReq, httpRes, next) {
  DB.GET('users', 'id', httpReq.params.id).then(r => {
    if (r.length === 0) return Promise.reject(createError(400, {message: '无此用户'}));
    let data = r[0];
    delete data['password'];
    delete data['active_code'];
    delete data['reset_token'];
    httpRes.status(200).send(r[0]);
  }).catch(e => next(e));
});

module.exports = router;