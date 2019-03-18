const express = require('express');
const router = express.Router();
const DB = require('../../libs/DB_Service');
const createError = require('http-errors');
const CheckLogined = require('../../middleware/CheckLogined');
const validate = require('../../libs/validate');
const moment  =require('moment');

let valid = {
  truename: [{type: 'string'},{type: 'required'},{type: 'alias', text: '真实姓名'}],
  gender: [{type: 'integer'},{type: 'required'},{type: 'alias', text: '性别'}],
  qq_number: [{type: 'string'},{type: 'required'},{type: 'alias', text: 'QQ号'}],
  phone: [{type: 'string'},{type: 'required'},{type: 'alias', text: '电话'}],
  id_code: [{type: 'string'},{type: 'required'},{type: 'alias', text: '身份证号'}],
  college: [{type: 'string'},{type: 'required'},{type: 'alias', text: '学院'}],
  competition_type: [{type: 'integer'},{type: 'required'},{type: 'alias', text: '竞赛类型'}],
  school_name: [{type: 'string'},{type: 'alias', text: '学校名称'}],
  major: [{type: 'string'},{type: 'required'},{type: 'alias', text: '专业'}],
  school_number: [{type: 'string'},{type: 'required'},{type: 'alias', text: '学号'}],
  campus: [{type: 'string'},{type: 'required'},{type: 'alias', text: '校区'}]
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
        gender: httpReq.body.gender,
        qq_number: httpReq.body.qq_number || null,
        phone: httpReq.body.phone || null,
        id_code: httpReq.body.id_code || null,
        college: httpReq.body.college || null,
        competition_type: httpReq.body.competition_type,
        school_name: httpReq.body.school_name || '',
        major: httpReq.body.major || null,
        school_number: httpReq.body.school_number  || null,
        user_id: httpReq.USER.id,
        campus: httpReq.body.campus || '',
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
