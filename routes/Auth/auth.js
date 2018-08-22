const express = require('express');
const router = express.Router();
const DB = require('../../libs/DB_Service');
const createError = require('http-errors');
const CheckLogined = require('../../middleware/CheckLogined');
router.get('/',CheckLogined ,function (httpReq, httpRes, next) {
  httpRes.status(200).send(httpReq.USER);
});

module.exports = router;