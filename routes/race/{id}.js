const express = require('express');
const router = express.Router();
const DB = require('../../libs/DB_Service');
const createError = require('http-errors');
const CheckLogined = require('../../middleware/CheckLogined');
const CheckAdmin = require('../../middleware/CheckAdmin');
const validate = require('../../libs/validate');
router.get('/:id',CheckLogined, function (httpReq, httpRes, next) {
  DB.GET('race', 'id', httpReq.params.id).then(r => {
    if (r.length === 0) return Promise.reject(createError(400, {message: '无此比赛'}));
    let data = r[0];
    httpRes.status(200).send(r[0]);
  }).catch(e => next(e));
});

router.put('/:id', CheckLogined, CheckAdmin, function (httpReq, httpRes, next) {
  let roles = {
    name: [{type: 'string'},{type: 'required'}],
    introduction: [{type: 'string'}],
    start_time: [{type: 'date'},{type: 'required'}],
    end_time: [{type: 'date'},{type: 'required'}]
  };
  validate(httpReq.body, roles, function (err) {
    if (err) next(err);
    else next();
  })
}, function (httpReq, httpRes, next) {
  let data = {
    name: httpReq.body.name || null,
    introduction: httpReq.body.introduction || null,
    start_time: httpReq.body.start_time || null,
    end_time: httpReq.body.end_time || null,
    update_user_id: httpReq.USER.id
  };
  DB.SAVE('race', 'id', httpReq.params.id, data).then(r => {
    httpRes.sendStatus(200);
  }).catch(e => next(e));
});

router.delete('/:id', function (httpReq, httpRes, next) {
  DB.DELETE('race', 'id', httpReq.params.id).then(r => {
    httpRes.sendStatus(200);
  }).catch(e => next(e));
});

module.exports = router;