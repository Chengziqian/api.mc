const createError = require('http-errors');

module.exports = function (req, res, next) {
  if (req.USER.access >= 0) next();
  else next(createError(403, {message: '您没有权限'}))
};