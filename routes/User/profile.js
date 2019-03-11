const express = require('express');
const router = express.Router();
const DB = require('../../libs/DB_Service');
const validate = require('../../libs/validate');
const CheckLogined = require('../../middleware/CheckLogined');

let valid = {
  truename: [{type: 'string'},{type: 'alias', text: '真实姓名'}],
  gender: [{type: 'integer'},{type: 'alias', text: '性别'}],
  qq_number: [{type: 'string'},{type: 'alias', text: 'QQ号'}],
  phone: [{type: 'string'},{type: 'alias', text: '电话'}],
  id_code: [{type: 'string'},{type: 'alias', text: '身份证号'}],
  college: [{type: 'string'},{type: 'alias', text: '学院'}],
  competition_type: [{type: 'integer'},{type: 'alias', text: '竞赛类型'}],
  school_name: [{type: 'string'},{type: 'alias', text: '学校名称'}],
  major: [{type: 'string'},{type: 'alias', text: '专业'}],
  school_number: [{type: 'string'},{type: 'alias', text: '学号'}]
};
router.put('/profile',CheckLogined ,function(req, res, next) {
  validate(req.body, valid, function (err) {
    if (err) next(err);
    else next();
  })
}, function (httpReq, httpRes, next) {
  let data = {
    truename: httpReq.body.truename || null,
    gender: httpReq.body.gender,
    qq_number: httpReq.body.qq_number || null,
    phone: httpReq.body.phone || null,
    id_code: httpReq.body.id_code || null,
    college: httpReq.body.college || null,
    competition_type: httpReq.body.competition_type,
    school_name: httpReq.body.school_name || null,
    major: httpReq.body.major || null,
    school_number: httpReq.body.school_number || null
  };
  DB.SAVE('users', 'id', httpReq.USER.id, data).then(r => {
    httpRes.sendStatus(200);
  }).catch(e => {
    next(e)
  });
});

module.exports = router;
