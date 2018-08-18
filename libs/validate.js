const DB = require('./DB_Service');
const mysql = require('mysql');
/**
 *
 * @param data
 * @param roles
 * @param callback
 */

// roles = {
//   key: [
//     {type, errorStatus, errorMessage}
//   ]
// }
// type: 'required|string|integer|email|regex:/^$/|unique:tableName,columnName'

module.exports = function (data, roles, callback) {
  for (let key in roles) {
    if (roles.hasOwnProperty(key)) {
      if (data[key]) {
        roles[key].forEach(o => {
          switch (true) {
            case (/^require$/.test(o.type)):
              break;
            case (/^string$/.test(o.type)):
              if (typeof data[key] !== "string") {
                if (o.errorStatus && o.errorMessage) {
                  callback(key, new ValidateError(o.errorStatus, o.errorMessage))
                  return;
                }
                callback(key, new ValidateError(422, key + ' is not a string'));
                return;
              }
              break;
            case (/^integer$/.test(o.type)):
              if (typeof data[key] !== "number") {
                if (o.errorStatus && o.errorMessage) {
                  callback(key, new ValidateError(o.errorStatus, o.errorMessage))
                  return;
                }
                callback(key, new ValidateError(422, key + ' is not a number'));
                return;
              }
              break;
            case (/^email$/.test(o.type)):
              if (!/^[A-Za-z0-9._%-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,4}$/.test(data[key])) {
                if (o.errorStatus && o.errorMessage) {
                  callback(key, new ValidateError(o.errorStatus, o.errorMessage))
                  return;
                }
                callback(key, new ValidateError(422, key + ' is a invalid email'));
                return
              }
              break;
            case (/^regex:\/.*\/$/.test(o.type)):
              let regex = new RegExp(o.type.match(/^regex:\/(.*)\/$/)[1])
              if (regex) {
                if (!regex.test(data[key])) {
                  if (o.errorStatus && o.errorMessage) {
                    callback(key, new ValidateError(o.errorStatus, o.errorMessage))
                    return;
                  }
                  callback(key, new ValidateError(422, key + ' is invalid'))
                  return;
                }
              } else {
                callback('roles', new ValidateError('', ' roles error'))
                return;
              }
              break;
            case (/^unique:(.+),(.+)$/.test(o.type)):
              let table_name = o.type.match(/^unique:(.+),(.+)$/)[1];
              let column_name = o.type.match(/^unique:(.+),(.+)$/)[2];
              DB(function (DB_obj) {
                let sql = 'SELECT * FROM `' + table_name + '` WHERE ' + column_name +'=' + mysql.escape(data[key]);
                DB_obj.DBService.query(sql, function (err, res, field) {
                    if (err) throw err;
                    if (res) {
                      if (o.errorStatus && o.errorMessage) {
                        callback(key, new ValidateError(o.errorStatus, o.errorMessage))
                      }
                      callback(key, new ValidateError(422, key + ' is invalid'))
                    }
                  })
              });
              break;
            default:
              callback(o.type, new ValidateError('', o.type + ' is unsupported'))
              return;
          }
        })
      } else {
        callback(key, new ValidateError(422, key + ' is required'))
        return
      }
    } else {
      callback('roles', new ValidateError('', ' roles error'))
      return;
    }
  }
}

function ValidateError(status, message) {
  this.errorStatus = status;
  this.errorMessage = message;
}