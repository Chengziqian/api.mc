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
  return db.createTable('media', {
    id: {type: 'int', primaryKey: true, autoIncrement: true},
    user_id: {type: 'int', notNull: true},
    filename: {type: 'string', notNull: true},
    truename: {type: 'string', notNull: true},
    mimetype: {type: 'string', defaultValue: null},
    extension: {type: 'string', defaultValue: null},
    permission: {type: 'string', defaultValue: null}
  });
};

exports.down = function(db) {
  return db.dropTable('media');
};

exports._meta = {
  "version": 1
};
