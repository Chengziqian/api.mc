const express = require('express');
const router = express.Router();
const DB = require('../../libs/DB_Service');
const CheckLogined = require('../../middleware/CheckLogined');
const CheckAdmin = require('../../middleware/CheckAdmin');
const CheckExceptStudent = require('../../middleware/CheckExceptStudent');
const validate = require('../../libs/validate');
const moment = require('moment');
const createError = require('http-errors');

let roles = {
  name: [{type: 'string'},{type: 'required'},{type: 'alias', text: '名称'}],
  introduction: [{type: 'string'},{type: 'alias', text: '介绍'}],
  competition_area: [{type: 'string'},{type: 'required'},{type: 'alias', text: '地区'}],
  school_name: [{type: 'string'},{type: 'required'},{type: 'alias', text: '学校名称'}],
  principal_email: [{type: 'string'},{type: 'required'},{type: 'email'},{type: 'alias', text: '负责人邮箱'}],
  principal_phone: [{type: 'string'},{type: 'required'},{type: 'alias', text: '负责人电话'}],
  principal_name: [{type: 'string'},{type: 'required'},{type: 'alias', text: '负责人姓名'}],
  start_time: [{type: 'date'},{type: 'required'},{type: 'alias', text: '开始时间'}],
  end_time: [{type: 'date'},{type: 'required'},{type: 'alias', text: '结束时间'}],
  attachment: [{type: 'string'},{type: 'alias', text: '附件'}]
};
router.post('/', CheckLogined, CheckExceptStudent, function (req, res, next) {
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
    update_user_id: httpReq.USER.id,
    attachment: httpReq.attachment || null
  };
  DB.INSERT('race', data).then(r => {
    httpRes.status(200).send({id: r.insertId});
  }).catch(e => next(e));
});

router.get('/', CheckLogined, function (req, res, next) {
  DB.GET_ALL('race').then(r => {
    r.forEach(o => {
      if (moment().isBetween(moment(o.start_time), moment(o.end_time))) o.status = 1;
      else if (moment().isBefore(moment(o.start_time))) o.status = 0;
      else o.status = 2
    });
    res.status(200).send(r)
  }).catch(e => next(e))
});

module.exports = router;
