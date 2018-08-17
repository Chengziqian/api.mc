let mysql = require('mysql')
let fs = require('fs')
let color = require('colors')
let path = require('path')
let async = require('async')
let Bar = require('./processBar')
let connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root'
});
console.log('start connecting to mysql...'.blue)
connection.connect(function(err) {
  if (err) {
    console.error(('error connecting: ' + err.stack).red);
    return;
  }
  console.log('mysql connected successfully'.green)
  let pb = new Bar('inserting process', 60);
  fs.readFile(path.join(__dirname, './database.sql'), 'utf8', function (err,data) {
    data = data.replace(/[\r\n]/g,"");
    lines = data.split(';')
    lines.splice(-1, 1);
    let total = lines.length;
    let num = 0;
    pb.render({completed: num, total: total});
    funs = lines.map(line => function (callback) {
      connection.query(line + ';', function(err, rows, fields) {
        if (err) {
          console.log('[ERROR]'.red);
          throw err;
        }
        num++;
        pb.render({completed: num, total: total})
        callback(null)
      });
    })

    async.series(funs, function (err, result) {
      if(err) console.log(err)
      console.log('completed!'.green)
      process.exit(0)
    })
  })
});