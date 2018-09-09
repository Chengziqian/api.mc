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
  return db.createTable('apply_user_info', {
    id: {type: 'int', primaryKey: true, autoIncrement: true},
    user_id: {type: 'int', notNull: true},
    truename: {type: 'string', notNull: true},
    gender: {type: 'int',  notNull: true},
    id_code: {type: 'string', notNull: true},
    college: {type: 'string', notNull: true},
    competition_type: {type: 'int', notNull: true},
    school_name: {type: 'string', notNull: true},
    major: {type: 'string', notNull: true},
    school_number: {type: 'string', notNull: true},
    qq_number: {type: 'string', notNull: true},
    phone: {type: 'string', notNull: true},
  });
};

exports.down = function(db) {
  return db.dropTable('apply_user_info');
};

exports._meta = {
  "version": 1
};
