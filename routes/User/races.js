const express = require('express');
const router = express.Router();
const DB = require('../../libs/DB_Service');
const CheckLogined = require('../../middleware/CheckLogined');
const moment = require('moment');

router.get('/races',CheckLogined, function (httpReq, httpRes, next) {
  DB.JOIN_GET('users_races', 'race', 'race_id', 'user_id', httpReq.USER.id)
    .then(r => {
      r.forEach(o => {
        if (moment().isBetween(moment(o.start_time), moment(o.end_time))) o.status = '比赛进行中';
        else if (moment().isBefore(moment(o.start_time))) o.status = '比赛未开始';
        else o.status = '比赛已结束';
      });
      httpRes.status(200).send(r);
    }).catch(e => next(e));
});

module.exports = router;