const express = require('express');
const router = express.Router();
const DB = require('../../libs/DB_Service');
const createError = require('http-errors');
const CheckLogined = require('../../middleware/CheckLogined');

router.get('/:key', CheckLogined, function (httpReq, httpRes, next) {
  let key = httpReq.params.key;
  let id = null;
  DB.GET('options', 'alias', key).then(r => {
    if (r.length === 0) return Promise.reject(createError(404));
    else {
      id = r[0].id;
      return DB.GET('options', 'root_id', id);
    }
  }).then(r => {
    httpRes.status(200).send(r.map(o => ({
      id: o.id,
      name: o.name
    })))
  }).catch(e => next(e))
});

module.exports = router;