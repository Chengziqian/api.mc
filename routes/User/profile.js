const express = require('express');
const router = express.Router();
const DB = require('../../libs/DB_Service');
const validate = require('../../libs/validate');
const CheckLogined = require('../../middleware/CheckLogined');

let valid = {
  truename: [{type: 'string'}],
  gender: [{type: 'integer'}],
  qq_number: [{type: 'string'}],
  phone: [{type: 'string'}],
  id_code: [{type: 'string'}],
  college: [{type: 'string'}],
  competition_type: [{type: 'integer'}],
  school_name: [{type: 'string'}],
  major: [{type: 'string'}],
  school_number: [{type: 'string'}]
};
router.put('/profile',CheckLogined ,function(req, res, next) {
  validate(req.body, valid, function (err) {
    if (err) next(err);
    else next();
  })
}, function (httpReq, httpRes, next) {
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
    school_number: httpReq.body.school_number || null
  };
  DB.SAVE('users', 'id', httpReq.USER.id, data).then(r => {
    httpRes.sendStatus(200);
  }).catch(e => {
    next(e)
  });
});

module.exports = router;