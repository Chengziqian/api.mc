const express = require('express');
const router = express.Router();
const DB = require('../../libs/DB_Service');
const CheckLogined = require('../../middleware/CheckLogined');
const CheckAdmin = require('../../middleware/CheckAdmin');
const validate = require('../../libs/validate');
const moment = require('moment');
const createError = require('http-errors');

let roles = {
  name: [{type: 'string'},{type: 'required'}],
  introduction: [{type: 'string'}],
  competition_area: [{type: 'string'},{type: 'required'}],
  school_name: [{type: 'string'},{type: 'required'}],
  principal_email: [{type: 'string'},{type: 'required'},{type: 'email'}],
  principal_phone: [{type: 'string'},{type: 'required'}],
  principal_name: [{type: 'string'},{type: 'required'}],
  start_time: [{type: 'date'},{type: 'required'}],
  end_time: [{type: 'date'},{type: 'required'}]
};
router.post('/', CheckLogined, CheckAdmin, function (req, res, next) {
  validate(req.body, roles, function (err) {
    if (err) next(err);
    else next();
  })
}, function(req, res, next) {
  if (moment(req.body.start_time).isAfter(moment(req.body.end_time))) next(createError(422, {message: {time: ['日期范围不合法']}}))
  else next();
}, function (httpReq, httpRes, next) {
  let data = {
    name: httpReq.body.name || null,
    introduction: httpReq.body.introduction || null,
    competition_area: httpReq.body.competition_area || null,
    school_name: httpReq.body.school_name || null,
    principal_email: httpReq.body.principal_email || null,
    principal_phone: httpReq.body.principal_name || null,
    principal_name: httpReq.body.principal_name || null,
    start_time: moment(httpReq.body.start_time).format('YYYY-MM-DD HH:mm:ss') || null,
    end_time: moment(httpReq.body.end_time).format('YYYY-MM-DD HH:mm:ss') || null,
    create_user_id: httpReq.USER.id,
    update_user_id: httpReq.USER.id
  };
  DB.INSERT('race', data).then(r => {
    httpRes.status(200).send({id: r.insertId});
  }).catch(e => next(e));
});

router.get('/', CheckLogined, function (req, res, next) {
  DB.GET_ALL('race').then(r => res.status(200).send(r)).catch(e => next(e))
});

module.exports = router;