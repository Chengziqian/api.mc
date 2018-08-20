const color = require('colors');
const DB = require('./libs/DB_Service');
const readline = require('readline');
let config;
try {
  config = require('./database.json')
} catch (e) {
  config = require('./database.json.example')
}
let read = readline.createInterface({
  input:process.stdin,
  output:process.stdout
});
function generateDB(data, conn) {
  read.question(("Continuing execution will drop the database named").red + (" [" + data.local.database +
    "] ").magenta + ("and create new database named").red + (" [" + data.local.database + "] ").magenta +
    ("which is empty.\n").red +
    ("ARE YOU SURE?[y/Y]").blue + "\n"
    ,function(answer) {
      if (answer === 'Y' || answer === 'y') {
        let sql_drop = "DROP DATABASE IF EXISTS `" + data.local.database + "`;";
        let sql_create = " CREATE DATABASE `" + data.local.database + "`";
        conn.query(sql_drop + sql_create, function (err, rows, fields) {
          if (err) {
            throw err;
          }
          console.log(("Create new database named ").green + (data.local.database).magenta + (" successfully!").green);
          process.exit(0)
        });
      } else {
        console.log("process stop".green)
        read.close();
        process.exit(0)
      }
    }
  );
}
generateDB(config, DB.CONN);
