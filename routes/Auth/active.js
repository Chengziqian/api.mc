const express = require('express');
const router = express.Router();
const DB = require('../../libs/DB_Service');
const HttpError = require('../../libs/HttpError');

router.get('/active', function (httpReq, httpRes, next) {
  let id = httpReq.query.id;
  let active = httpReq.query.active;
  if (id && active) {
    DB.GET('users', 'id', id).then(res => {
      if (res.length === 0) return Promise.reject('INVALID');
      if (res[0].status === 0 && res[0].active_code === active) {
        return DB.SAVE('users','id', id, {status: 1});
      } else {
        if (res[0].status !== 0)
        return Promise.reject('ACTIVATED');
        else return Promise.reject('INVALID');
      }
    }).then(res => {
      httpRes.sendStatus(200);
    }).catch(e => {
      if (e === 'ACTIVATED') {
        httpRes.sendStatus(200)
      } else if (e === 'INVALID') {
        httpRes.status(422).send(new HttpError(422, '无效的激活链接'))
      }
      else {
        next(e.stack || e);
      }
    })
  } else {
    next()
  }
});

module.exports = router;