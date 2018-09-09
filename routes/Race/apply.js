const express = require('express');
const router = express.Router();
const DB = require('../../libs/DB_Service');
const createError = require('http-errors');
const CheckLogined = require('../../middleware/CheckLogined');
const validate = require('../../libs/validate');
const moment  =require('moment');

let valid = {
  truename: [{type: 'string'},{type: 'required'}],
  gender: [{type: 'integer'},{type: 'required'}],
  qq_number: [{type: 'string'},{type: 'required'}],
  phone: [{type: 'string'},{type: 'required'}],
  id_code: [{type: 'string'},{type: 'required'}],
  college: [{type: 'string'},{type: 'required'}],
  competition_type: [{type: 'integer'},{type: 'required'}],
  school_name: [{type: 'string'}],
  major: [{type: 'string'},{type: 'required'}],
  school_number: [{type: 'string'},{type: 'required'}]
};
router.post('/apply/:id',CheckLogined, function(req, res, next){
  validate(req.body, valid, function (err) {
    if (err) next(err);
    else next()
  })
}, function (httpReq, httpRes, next) {
  let info_id = null;
  DB.GET('race', 'id', httpReq.params.id).then(r => {
    if (r.length === 0) return Promise.reject(createError(400, {message: '无此比赛'}));
    else {
      if (!(moment().isBetween(moment(r[0].start_time), moment(r[0].end_time)))) return Promise.reject(createError(400, {message: '比赛报名未开始或已过期'}));
      let data = {
        truename: httpReq.body.truename || null,
        gender: httpReq.body.gender || null,
        qq_number: httpReq.body.qq_number || null,
        phone: httpReq.body.phone || null,
        id_code: httpReq.body.id_code || null,
        college: httpReq.body.college || null,
        competition_type: httpReq.body.competition_type || null,
        school_name: httpReq.body.school_name || null,
        major: httpReq.body.major || null,
        school_number: httpReq.body.school_number  || null,
        user_id: httpReq.USER.id
      };
      return DB.INSERT('apply_user_info', data);
    }
  }).then(r => {
    info_id = r.insertId;
    return DB.GET_IN_CONDITIONS('users_races', {user_id: httpReq.USER.id, race_id: httpReq.params.id});
  }).then(r => {
    if (r.length === 0) return DB.INSERT('users_races',{user_id: httpReq.USER.id, race_id:httpReq.params.id, info_id: info_id});
    else return DB.SAVE_IN_CONDITIONS('users_races', {user_id: httpReq.USER.id, race_id:httpReq.params.id}, {info_id: info_id});
  }).then(r => httpRes.sendStatus(200)).catch(e => next(e));
});

module.exports = router;