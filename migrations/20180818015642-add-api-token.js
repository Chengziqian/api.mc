'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.createTable('api_token', {
    id: {type: 'int', primaryKey: true, autoIncrement: true},
    create_time: {type: 'timestamp', notNull: true, defaultValue: 'CURRENT_TIMESTAMP'},
    user_id: {type: 'int', notNull: true},
    token: {type: 'string', notNull: true},
    ip: {type: 'string', notNull: true},
    expired_time: {type: 'timestamp', notNull: true, defaultValue: 'CURRENT_TIMESTAMP'},
  }).then(function (res) {
  }, function (err) {
    throw err
  });
};

exports.down = function(db) {
  return db.dropTable('api_token').then(function (res) {
  }, function (err) {
    throw err
  });
};

exports._meta = {
  "version": 1
};
