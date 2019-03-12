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
  return db.createTable('race',{
    id: {type: 'int', primaryKey: true, autoIncrement: true},
    name: {type: 'string', notNull: true},
    competition_area: {type: 'string'},
    school_name: {type: 'string'},
    introduction: {type: 'text'},
    start_time: {type: 'datetime', notNull: true},
    end_time: {type: 'datetime', notNull: true},
    create_user_id: {type: 'int'},
    principal_name: {type: 'string', notNull: true},
    principal_email: {type: 'string', notNull: true},
    principal_phone: {type: 'string', notNull: true},
    update_user_id: {type: 'int'},
    create_time: {type: 'timestamp', notNull: true, defaultValue: 'CURRENT_TIMESTAMP'},
    update_time: {type: 'timestamp', notNull: true, onUpdate: 'CURRENT_TIMESTAMP' ,defaultValue: 'CURRENT_TIMESTAMP'}
  }).then(function (res) {
  }, function (err) {
    throw err
  });
};

exports.down = function(db) {
  return db.dropTable('race').then(function (res) {
  }, function (err) {
    throw err
  });
};

exports._meta = {
  "version": 1
};
