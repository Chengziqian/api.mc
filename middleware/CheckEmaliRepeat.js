const createError = require('http-errors');
const DB = require('../libs/DB_Service');

module.exports = function (req, res, next) {
  console.log('enter check email');
  DB.GET('users','email', req.body.email).then(res => {
    if (res.length > 0) next(createError(422, {message: {email: ["email is repeated"]}}));
    else next()
  })
};