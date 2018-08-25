const express = require('express');
const router = express.Router();
const CheckLogined = require('../../middleware/CheckLogined');
router.get('/',CheckLogined ,function (httpReq, httpRes, next) {
  let data = httpReq.USER;
  delete data['password'];
  delete data['active_code'];
  delete data['reset_token'];
  httpRes.status(200).send(data);
});

module.exports = router;