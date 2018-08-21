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
  return db.createTable('users', {
    id: {type: 'int', primaryKey: true, autoIncrement: true},
    password: {type: 'string', notNull: true},
    access: {type: 'int', defaultValue: 0},
    status: {type: 'int', defaultValue: 0},
    type: {type: 'int', notNull: true},
    truename: 'string',
    id_code: 'string',
    competition_area: 'string',
    competition_type: 'int',
    school_name: 'string',
    major: 'string',
    login_time: 'datetime',
    school_number: 'string',
    email: {type: 'string', notNull: true},
    qq_number: 'string',
    phone: 'string',
    active_code: 'string',
    create_time: {type: 'timestamp', notNull: true, onUpdate: 'CURRENT_TIMESTAMP', defaultValue: 'CURRENT_TIMESTAMP'}
  }).then(function (res) {
  }, function (err) {
    throw err
  });
};

exports.down = function(db) {
  return db.dropTable('users').then(function (res) {
  }, function (err) {
    throw err
  });
};

exports._meta = {
  "version": 1
};
