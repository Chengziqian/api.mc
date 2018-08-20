const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
const color = require('colors');
const async = require('async')
let configPath;
function getConfig (callback) {
  fs.exists(path.join(__dirname, '../database.json'), function (exists) {
    if(exists) {
      configPath = path.join(__dirname, '../database.json')
      fs.readFile(configPath, 'utf8', function (err, data) {
        if (err) throw err;
        data = JSON.parse(data)
        callback(null, data)
      })
    } else {
      fs.exists(path.join(__dirname, '../database.json.example'), function (ex_exists) {
        if (ex_exists) {
          configPath = path.join(__dirname, '../database.json.example')
          fs.readFile(configPath, 'utf8', function (err, data) {
            if (err) throw err;
            data = JSON.parse(data)
            callback(null, data)
          })
        } else {
          callback("Cannot find database.json(.example)".red)
        }
      })
    }
  })
}
function createConnection(config, callback) {
  let connection = mysql.createConnection({
    host: config.local.host,
    user: config.local.user,
    password: config.local.password,
    database: config.local.database,
    multipleStatements: config.local.multipleStatements
  });
  let DBService = {
    SET: async function (tableName, data, DB_callback) {
      await new Promise((resolve, reject) => {
        connection.query('INSERT INTO ?? SET ?', [tableName, data], function (err, res, field) {
          if (err) reject(err);
          else resolve(res);
        });
      }).then(res => DB_callback(null, res)).catch(e => DB_callback(e));
      return this;
    },
    SAVE: async function (tableName, findFieldName, findValue, changeData, DB_callback) {
      await new Promise((resolve, reject) => {
        connection.query('UPDATE ?? SET ? WHERE ?? = ?',[tableName, changeData, findFieldName, findValue],
          function (err, res, field) {
            if (err) reject(err);
            else resolve(res);
          });
      }).then(res => DB_callback(null, res)).catch(e => DB_callback(e));
      return this;
    },
    GET: async function (tableName, findFieldName, findValue, DB_callback) {
      await new Promise((resolve, reject) => {
        connection.query('SELECT * FROM ?? WHERE ?? = ?', [tableName, findFieldName, findValue],
          (err, res, field) => {
            if (err) reject(err);
            else resolve(res);
          });
      }).then(res => DB_callback(null, res)).catch(e => DB_callback(e));
      return this;
    },
    CONN: connection
  };
  callback(null, {
    DBConfig: config,
    DBService: DBService
  })
}
module.exports = function (callback) {
  async.waterfall([getConfig, createConnection], function (err, res) {
    if (err) callback(err);
    callback(null, res);
  })
}

