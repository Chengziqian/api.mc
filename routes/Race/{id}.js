const express = require('express');
const router = express.Router();
const DB = require('../../libs/DB_Service');
const createError = require('http-errors');
const CheckLogined = require('../../middleware/CheckLogined');
const CheckExceptStudent = require('../../middleware/CheckExceptStudent');
const validate = require('../../libs/validate');
const MemberExcelCreator = require('./CreateMembersInfoExcel');
const StatisticsExcelCreator = require('./CreateStatisticExcel');
const moment = require('moment');

router.get('/:id',CheckLogined, function (httpReq, httpRes, next) {
  DB.GET('race', 'id', httpReq.params.id).then(r => {
    if (r.length === 0) return Promise.reject(createError(400, {message: '无此比赛'}));
    let data = r[0];
    if (moment().isBetween(moment(data.start_time), moment(data.end_time))) data.status = 1;
    else if (moment().isBefore(moment(data.start_time))) data.status = 0;
    else data.status = 2;
    httpRes.status(200).send(data);
  }).catch(e => next(e));
});

router.put('/:id', CheckLogined, CheckExceptStudent, function (httpReq, httpRes, next) {
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
  validate(httpReq.body, roles, function (err) {
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
    principal_phone: httpReq.body.principal_phone || null,
    principal_name: httpReq.body.principal_name || null,
    start_time: moment(httpReq.body.start_time).format('YYYY-MM-DD HH:mm:ss') || null,
    end_time: moment(httpReq.body.end_time).format('YYYY-MM-DD HH:mm:ss') || null,
    create_user_id: httpReq.USER.id,
    update_user_id: httpReq.USER.id,
    attachment: httpReq.attachment || null
  };
  DB.SAVE('race', 'id', httpReq.params.id, data).then(r => {
    httpRes.sendStatus(200);
  }).catch(e => next(e));
});

router.delete('/:id', CheckLogined, CheckExceptStudent, function (httpReq, httpRes, next) {
  DB.GET('race', 'id', httpReq.params.id).then(r => {
    if (r.length === 0) return Promise.reject(createError(400, {message: '无此比赛'}));
    else if (moment().isBetween(moment(r[0].start_time), moment(r[0].end_time))) return Promise.reject(createError(400, {message: '不可删除进行中的比赛'}));
    else return DB.DELETE('race', 'id', httpReq.params.id)
  }).then(r => {
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
      return DB.JOIN_GET('users_races', 'apply_user_info', 'info_id', 'race_id', httpReq.params.id)
    }
  }).then(r => {
    r = r.map(o => ({
      id: o.id,
      user_id: o.user_id,
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
      college: o.college,
      school_number: o.school_number,
      campus: o.campus,
    }));
    httpRes.status(200).send(r);
  }).catch(e => next(e));
});

router.delete('/:id/members/:userId', CheckLogined, CheckExceptStudent, function (httpReq, httpRes, next) {
  let race_id = httpReq.params.id;
  let user_id = httpReq.params.userId;
  DB.DELETE_IN_CONDITIONS('users_races', {user_id: user_id, race_id: race_id}).then(r => {
    httpRes.sendStatus(200);
  }).catch(e => next(e));
});

router.get('/:id/download', CheckLogined, CheckExceptStudent, function (req, res, next) {
  let race = {};
  DB.GET('race', 'id', req.params.id).then(r => {
    if (r.length === 0) return Promise.reject(createError(400, {message: '无此比赛'}));
    else {
      race = r[0];
      return DB.JOIN_GET('users_races', 'apply_user_info', 'info_id', 'race_id', req.params.id)
    }
  }).then(r => {
    r.sort(function (a, b) {
      return a.competition_type - b.competition_type
    });
    items = r.map((o, index)=> ({
      index: index + 1,
      truename: o.truename,
      gender: o.gender,
      id_code: o.id_code,
      competition_area: race.competition_area || '四川省',
      competition_type: o.competition_type,
      school_name: race.school_name || o.school_name,
      college: o.college || '',
      major: o.major,
      school_number: o.school_number,
      contact: o.phone || o.email
    }));
    let buffer = MemberExcelCreator(race.name, '参赛学校（盖章）电子科技大学' +
      '        负责人:' + race.principal_name +
      '        电话:' + race.principal_phone +
      '        Email:' + race.principal_email, items);
    res.attachment(encodeURIComponent('电子科技大学' + race.name + '参赛表.xlsx')).status(200).send(buffer)
  }).catch(e => next(e));
});

router.get('/:id/statistics', function (httpReq, httpRes, next) {
  DB.GET('race', 'id', httpReq.params.id).then(r => {
    if (r.length === 0) return Promise.reject(createError(400, {message: '无此比赛'}));
    else {
      return DB.JOIN_GET('users_races', 'apply_user_info', 'info_id', 'race_id', httpReq.params.id).then(data => {
        DB.GET('options', 'root_id', 1).then(list => {
          let reg = /^\s*(\d{4})\d*\s*$/;
          let res = {
            college:{},
            grade:{},
            campus:{},
          };
          let checkList = [];
          list.forEach((v) => checkList.push(v.name));
          data.forEach((value, index) => {
            let school_number = value['school_number'];
            let theCollege = value['college'];
            let theCampus = value['campus'];
            if (checkList.indexOf(theCollege) !== -1) {
              if (res.college[theCollege] !== undefined) res.college[theCollege]++;
              else res.college[theCollege] = 1;
            } else {
              if (res.college['其他'] !== undefined) res.college['其他']++;
              else res.college['其他'] = 1
            }
            if (reg.test(school_number)) {
              let thisClass = school_number.match(reg)[1];
              if (res.grade[thisClass] !== undefined) res.grade[thisClass]++;
              else res.grade[thisClass] = 1;
            } else {
              if (res.grade['其他'] !== undefined) res.grade['其他']++;
              else res.grade['其他'] = 1
            }
            if (theCampus === null || theCampus === '') {
              if (res.campus['未填写'] !== undefined) res.campus['未填写']++;
              else res.campus['未填写'] = 1
            } else {
              if (res.campus[theCampus] !== undefined) res.campus[theCampus]++;
              else res.campus[theCampus] = 1
            }
          });
          httpRes.status(200).send(res);
        })
      }).catch(e => next(e));
    }
  })
});

router.get('/:id/statistics/download', function (httpReq, httpRes, next) {
  let race = {};
  DB.GET('race', 'id', httpReq.params.id).then(r => {
    if (r.length === 0) return Promise.reject(createError(400, {message: '无此比赛'}));
    else {
      race = r[0];
      return DB.JOIN_GET('users_races', 'apply_user_info', 'info_id', 'race_id', httpReq.params.id).then(data => {
        DB.GET('options', 'root_id', 1).then(list => {
          let reg = /^\s*(\d{4})\d*\s*$/;
          let res = {
            college: {},
            grade: {},
            campus: {},
          };
          let checkList = [];
          list.forEach((v) => checkList.push(v.name));
          data.forEach((value, index) => {
            let school_number = value['school_number'];
            let theCollege = value['college'];
            let theCampus = value['campus'];
            if (checkList.indexOf(theCollege) !== -1) {
              if (res.college[theCollege] !== undefined) res.college[theCollege]++;
              else res.college[theCollege] = 1;
            } else {
              if (res.college['其他'] !== undefined) res.college['其他']++;
              else res.college['其他'] = 1
            }
            if (reg.test(school_number)) {
              let thisClass = school_number.match(reg)[1];
              if (res.grade[thisClass] !== undefined) res.grade[thisClass]++;
              else res.grade[thisClass] = 1;
            } else {
              if (res.grade['其他'] !== undefined) res.grade['其他']++;
              else res.grade['其他'] = 1
            }
            if (theCampus === null || theCampus === '') {
              if (res.campus['未填写'] !== undefined) res.campus['未填写']++;
              else res.campus['未填写'] = 1
            } else {
              if (res.campus[theCampus] !== undefined) res.campus[theCampus]++;
              else res.campus[theCampus] = 1
            }
          });
          let buffer = StatisticsExcelCreator(race.name + '（统计表）', '参赛学校（盖章）电子科技大学' +
            '        负责人:' + race.principal_name +
            '        电话:' + race.principal_phone +
            '        Email:' + race.principal_email, res);
          httpRes.attachment(encodeURIComponent('电子科技大学' + race.name + '(统计表).xlsx')).status(200).send(buffer)
        });
      }).catch(e => next(e));
    }
  })
});

module.exports = router;
