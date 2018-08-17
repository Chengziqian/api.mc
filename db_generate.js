const mysql = require('mysql');
const fs = require('fs');
const async = require('async')
let color = require('colors')
const readline = require('readline');
const path = require('path')
let read = readline.createInterface({
  input:process.stdin,
  output:process.stdout
});
let configPath;
function getConfig (callback) {
  fs.exists(path.join(__dirname, './database.json'), function (exists) {
    if(exists) {
      configPath = path.join(__dirname, './database.json')
      callback(null)
    } else {
      fs.exists(path.join(__dirname, './database.json.example'), function (ex_exists) {
        if (ex_exists) {
          configPath = path.join(__dirname, './database.json.example')
          callback(null)
        } else {
          callback("Cannot find database.json(.example)".red)
        }
      })
    }
  })
}
function generateDB(callback) {
  fs.readFile(configPath, 'utf8', function (err,data) {
    data = JSON.parse(data)
    let connection = mysql.createConnection({
      host     : data.local.host,
      user     : data.local.user,
      password : data.local.password,
      multipleStatements: data.local.multipleStatements
    });
    read.question(("Continuing execution will drop the database named").red + (" [" + data.local.database +
      "] ").magenta + ("and create new database named").red + (" [" + data.local.database + "] ").magenta +
      ("which is empty.\n").red +
      ("ARE YOU SURE?[y/Y]").blue + "\n"
      ,function(answer){
        if (answer === 'Y' || answer === 'y') {
          connection.connect(function(err) {
            if (err) {
              throw err
            }
            let sql_drop = "DROP DATABASE IF EXISTS `" + data.local.database + "`;";
            let sql_create = " CREATE DATABASE `" + data.local.database + "`";
            connection.query(sql_drop + sql_create, function(err, rows, fields) {
              if (err) {
                throw err;
              }
              console.log(("Create new database named ").green + (data.local.database).magenta + (" successfully!").green);
              callback(null)
            });
          });
        } else {
          console.log("process stop".green)
          read.close()
          callback(null)
        }
      });
  })
}

async.series([getConfig, generateDB], function (err, res) {
  if(err) console.log(err)
  process.exit(0)
})
