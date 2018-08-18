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
  connection.connect(function(err) {
    if (err) {
      throw err
    }
    callback(null, {
      DBConfig: config,
      DBService: connection
    })
  });
}
module.exports = function (callback) {
  async.waterfall([getConfig, createConnection], function (err, res) {
    if (err) throw err;
    callback(res);
  })
}

