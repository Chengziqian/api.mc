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
  let count = 0;
  function insertOptions(options, parent) {
    options.forEach(option => {
      let columnArray = [];
      let valueArray = [];
      if (option.hasOwnProperty('name')) {
        columnArray.push('name');
        valueArray.push(option.name);
      }
      if (option.hasOwnProperty('alias')) {
        columnArray.push('alias');
        valueArray.push(option.alias);
      }
      columnArray.push('root_id');
      valueArray.push(parent);
      db.insert('options', columnArray, valueArray, function () {
        ++count;
        if (option.hasOwnProperty('children')) {
          insertOptions(option.children, count);
        }
      })
    })
  }

  let college = [
    {
      name: '学院',
      alias: 'college',
      children: [
        {name: '信息与通信工程学院'},
        {name: '电子科学与工程学院(示范性微电子学院)'},
        {name: '材料与能源学院'},
        {name: '机械与电气工程学院'},
        {name: '光电科学与工程学院'},
        {name: '自动化工程学院'},
        {name: '资源与环境学院'},
        {name: '计算机科学与工程学院(网络空间安全学院)'},
        {name: '信息与软件工程学院(示范性软件学院)'},
        {name: '航空航天学院'},
        {name: '数学科学学院'},
        {name: '物理学院'},
        {name: '医学院'},
        {name: '生命科学与技术学院'},
        {name: '经济与管理学院'},
        {name: '公共管理学院'},
        {name: '外国语学院'},
        {name: '马克思主义学院'},
        {name: '格拉斯哥学院'},
        {name: '英才实验学院'},
        {name: '其他'}
      ]
    }
  ];

  return db.createTable('options', {
    id: {type: 'int', primaryKey: true, autoIncrement: true},
    alias: {type: 'string'},
    name: {type: 'string', notNull: true},
    root_id: {type: 'int', notNull: true, defaultValue: 0}
  }, function () {
    insertOptions(college, 0);
  });
};

exports.down = function(db) {
  db.dropTable('options');
  return null;
};

exports._meta = {
  "version": 1
};
