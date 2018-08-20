const DB = require('../libs/DB_Service');
const moment = require('moment');

let getClientIp = function (req) {
  return req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress || '';
};

module.exports = function (HttpReq, HttpRes, next) {
  let token = req.headers['Api-Token']
  let user = {};
  let api_token = {};
  let old_token;
  DB.GET('api_token', 'token', token).then(res => {
    if (res.length === 0) throw 'next';
    else {
      api_token = res[0];
      old_token = api_token.token;
      return DB.GET('users', 'id', res.user_id);
    }
  }).then(res => {
    if (res.length === 0) return Promise.reject('next');
    else {
      user = res[0];
      if (user.id === api_token.user_id &&
        (api_token.expired_time === null || moment(api_token.expired_time).isAfter(moment())) &&
        api_token.ip === getClientIp(HttpReq)){
        api_token.expired_time =
          api_token.expired_time === null ? null : moment().add(20, 'm').format('YYYY-MM-DD HH:mm:ss');
        return DB.SAVE('api_token', 'token', old_token, api_token)
      } else {
        return Promise.reject('next');
      }
    }
  }).then(res => next()).catch(e => {
    if (e === 'next') next();
    else next(e);
  })
}