const express = require('express');
const router = express.Router();
const DB = require('../../libs/DB_Service');
const createError = require('http-errors');
const CheckLogined = require('../../middleware/CheckLogined');
const CheckAdmin = require('../../middleware/CheckAdmin');
const CheckExceptStudent = require('../../middleware/CheckExceptStudent');
const validate = require('../../libs/validate');
const ExcelCreater = require('./CreateMembersInfoExcel');
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

router.delete('/:id', CheckLogined, CheckAdmin, function (httpReq, httpRes, next) {
  DB.DELETE('race', 'id', httpReq.params.id).then(r => {
    httpRes.sendStatus(200);
  }).catch(e => next(e));
});

router.get('/:id/members', CheckLogined, CheckExceptStudent, function (httpReq, httpRes, next) {
  let race_competition_area = '';
  let race_school_name = '';
  DB.GET('race', 'id', httpReq.params.id).then(r => {
    if (r.length === 0) return Promise.reject(createError(400, {message: '无此比赛'}));
    else {
      race_competition_area = r[0].competition_area;
      race_school_name = r[0].school_name;
      return DB.JOIN_GET('users_races', 'users', 'user_id', 'race_id', httpReq.params.id)
    }
  }).then(r => {
    r = r.map(o => ({
      id: o.id,
      truename: o.truename,
      email: o.email,
      gender: o.gender,
      qq_number: o.qq_number,
      phone: o.phone,
      id_code: o.id_code,
      competition_area: race_competition_area || '四川省',
      competition_type: o.competition_type,
      school_name: race_school_name || o.school_name,
      major: o.major,
      school_number: o.school_number
    }));
    httpRes.status(200).send(r);
  }).catch(e => next(e));
});

router.get('/:id/download', CheckLogined, CheckExceptStudent, function (req, res, next) {
  let race = {};
  DB.GET('race', 'id', req.params.id).then(r => {
    if (r.length === 0) return Promise.reject(createError(400, {message: '无此比赛'}));
    else {
      race = r[0];
      return DB.JOIN_GET('users_races', 'users', 'user_id', 'race_id', req.params.id)
    }
  }).then(r => {
    items = r.map((o, index)=> ({
      index: index + 1,
      truename: o.truename,
      gender: o.gender,
      id_code: o.id_code,
      competition_area: race.competition_area || '四川省',
      competition_type: o.competition_type,
      school_name: race.school_name || o.school_name,
      major: o.major,
      school_number: o.school_number,
      contact: o.phone || o.email
    }));
    let buffer = ExcelCreater(race.name, '参赛学校（盖章）电子科技大学' +
      '        负责人:' + race.principal_name +
      '        电话:' + race.principal_phone +
      '        Email:' + race.principal_email, items);
    res.attachment('电子科技大学' + race.name + '参赛表.xlsx').status(200).send(buffer)
  }).catch(e => next(e));
});

module.exports = router;