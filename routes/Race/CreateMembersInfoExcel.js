const excel = require('node-excel-export');
module.exports = function (headerData, principalInfo ,itemsData) {
  const styles = {
    middle: {
      alignment: {
        vertical: 'center',
        horizontal: 'center'
      }
    },
    normal: {
      alignment: {
        vertical: 'center',
        horizontal: 'left'
      }
    }
  };

  const heading = [
    [{value: headerData, style: styles.middle}],
    [{value: principalInfo, style: styles.middle}]
  ];
  const columns = Object.getOwnPropertyNames(itemsData[0]).length;

  const map = {
    index: {title:'序号', width: '5'},
    truename: {title: '姓名', width: '10'},
    gender: {title: '性别', width: '5'},
    id_code: {title: '身份证号', width: '20'},
    competition_area: {title: '所在省份（赛区名称）', width: '25'},
    competition_type: {title: '参赛类型', width: '15'},
    school_name: {title: '学校名称', width: '15'},
    major: {title: '所学专业', width: '20'},
    school_number: {title: '学号', width: '20'},
    contact: {title: '联系方式', width: '25'}
  };
  const specification = {};

  for (let key in map) {
    if (key === 'competition_type') {
      specification[key] = {
        displayName: map[key].title,
        headerStyle: styles.normal,
        cellFormat: function(value, row) {
          return (value === 1) ? '数学专业' : '非数学专业';
        },
        width: map[key].width
      }
    } else if (key === 'gender') {
      specification[key] = {
        displayName: map[key].title,
        headerStyle: styles.normal,
        cellFormat: function(value, row) {
          return (value === 1) ? '女' : '男';
        },
        width: map[key].width
      }
    } else {
      specification[key] = {
        displayName: map[key].title,
        headerStyle: styles.normal,
        width: map[key].width
      }
    }
  }

  const dataset = itemsData;
  dataset.sort(function (a, b) {
    return a.competition_type - b.competition_type
  });
  const merges = [
    { start: { row: 1, column: 1 }, end: { row: 1, column: columns } },
    { start: { row: 2, column: 1 }, end: { row: 2, column: columns } },
  ];

  return report = excel.buildExport(
    [
      {
        heading: heading,
        merges: merges,
        specification: specification,
        data: dataset
      }
    ]
  );
};