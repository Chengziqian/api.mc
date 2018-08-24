const schedule = require('node-schedule');
const DB = require('./DB_Service');
module.exports = function (TableName, Corn) {
  schedule.scheduleJob(Corn, function () {
    DB.DELETE_EXPIRED(TableName).catch(e => console.log(e));
  })
};