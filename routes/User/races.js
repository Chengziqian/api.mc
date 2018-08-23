const express = require('express');
const router = express.Router();
const DB = require('../../libs/DB_Service');
const createError = require('http-errors');
const CheckLogined = require('../../middleware/CheckLogined');


router.get('/races',CheckLogined, function (httpReq, httpRes, next) {
  DB.JOIN_GET('users_races', 'race', 'race_id', 'user_id', httpReq.USER.id)
    .then(r => httpRes.status(200).send(r)).catch(e => next(e));
});

module.exports = router;