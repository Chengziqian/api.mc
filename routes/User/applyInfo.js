const express = require('express');
const router = express.Router();
const DB = require('../../libs/DB_Service');
const CheckLogined = require('../../middleware/CheckLogined');


router.get('/applyInfo/:raceId',CheckLogined, function (httpReq, httpRes, next) {
  DB.GET_IN_CONDITIONS('users_races', {user_id: httpReq.USER.id, race_id: httpReq.params.raceId})
    .then(r => {
      if (r.length === 0) return Promise.reject(createError(400, {message: '无此比赛'}));
      else return DB.GET('apply_user_info', 'id', r[0].info_id)
    }).then(r => httpRes.status(200).send(r[0])).catch(e => next(e));
});

module.exports = router;