const express = require('express');
const router = express.Router();
const DB = require('../../libs/DB_Service');
const createError = require('http-errors');
const CheckLogined = require('../../middleware/CheckLogined');
const CheckAdmin = require('../../middleware/CheckAdmin');
const validate = require('../../libs/validate');

let roles = {
  name: [{type: 'string'},{type: 'required'}],
  introduction: [{type: 'string'}],
  start_time: [{type: 'date'},{type: 'required'}],
  end_time: [{type: 'date'},{type: 'required'}]
};
router.post('/', CheckLogined, CheckAdmin, function (req, res, next) {
  validate(req.body, roles, function (err) {
    if (err) next(err);
    else next();
  })
}, function (httpReq, httpRes, next) {
  let data = {
    name: httpReq.body.name || null,
    introduction: httpReq.body.introduction || null,
    start_time: httpReq.body.start_time || null,
    end_time: httpReq.body.end_time || null,
    create_user_id: httpReq.USER.id,
    update_user_id: httpReq.USER.id
  };
  DB.INSERT('race', data).then(r => {
    httpRes.sendStatus(200);
  }).catch(e => next(e));
});

router.get('/', CheckLogined, CheckAdmin, function (req, res, next) {
  DB.GET('race', null, null).then(r => res.status(200).send(r)).catch(e => next(e))
});

module.exports = router;