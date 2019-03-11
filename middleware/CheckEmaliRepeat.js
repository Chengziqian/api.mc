const createError = require('http-errors');
const DB = require('../libs/DB_Service');

module.exports = function (req, res, next) {
  DB.GET('users','email', req.body.email).then(res => {
    if (res.length > 0) next(createError(422, {message: {email: ["邮箱重复"]}}));
    else next()
  })
};
