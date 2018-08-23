const express = require('express');
const router = express.Router();
const DB = require('../../libs/DB_Service');
const createError = require('http-errors');
const CheckLogined = require('../../middleware/CheckLogined');
const validate = require('../../libs/validate');

let valid = {
  truename: [{type: 'string'},{type: 'required'}],
  gender: [{type: 'integer'},{type: 'required'}],
  qq_number: [{type: 'string'},{type: 'required'}],
  phone: [{type: 'string'},{type: 'required'}],
  id_code: [{type: 'string'},{type: 'required'}],
  competition_area: [{type: 'string'},{type: 'required'}],
  competition_type: [{type: 'integer'},{type: 'required'}],
  school_name: [{type: 'string'},{type: 'required'}],
  major: [{type: 'string'},{type: 'required'}],
  school_number: [{type: 'string'},{type: 'required'}]
};
router.post('/apply/:id',CheckLogined, function(req, res, next){
  validate(req.body, valid, function (err) {
    if (err) next(err);
    else next()
  })
}, function (httpReq, httpRes, next) {
  DB.GET('race', 'id', httpReq.params.id).then(r => {
    if (r.length === 0) return Promise.reject(createError(400, {message: '无此比赛'}));
    else {
      let data = {
        truename: httpReq.body.truename,
        gender: httpReq.body.gender,
        qq_number: httpReq.body.qq_number,
        phone: httpReq.body.phone,
        id_code: httpReq.body.id_code,
        competition_area: httpReq.body.competition_area,
        competition_type: httpReq.body.competition_type,
        school_name: httpReq.body.school_name,
        major: httpReq.body.major,
        school_number: httpReq.body.school_number
      };
      return DB.SAVE('users', 'id', httpReq.USER.id, data);
    }
  }).then(r => {
    return DB.INSERT('users_races',{user_id: httpReq.USER.id, race_id:httpReq.params.id})
  }).then(r => httpRes.sendStatus(200)).catch(e => next(e));
});

module.exports = router;