const express = require('express');
const router = express.Router();
const DB = require('../../libs/DB_Service');
const createError = require('http-errors');
const CheckLogined = require('../../middleware/CheckLogined');
const CheckAdmin = require('../../middleware/CheckAdmin');
const validate = require('../../libs/validate');

let roles = {
  email: [{type:'required'},{type:'string'},{type: 'email'}]
};
router.post('/auth', );