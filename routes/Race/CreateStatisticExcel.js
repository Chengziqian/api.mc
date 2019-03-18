const excel = require('node-excel-export');
module.exports = function (headerData, principalInfo, itemsData) {
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
    },
    group1: {
      alignment: {
        vertical: 'center',
        horizontal: 'center'
      },
      front: {
        bold: true,
      },
      fill: {
        fgColor: {
          rgb: 'FFD700'
        }
      }
    },
    group2: {
      alignment: {
        vertical: 'center',
        horizontal: 'center'
      },
      front: {
        bold: true,
      },
      fill: {
        fgColor: {
          rgb: '00FA9A'
        }
      }
    },
    group3: {
      alignment: {
        vertical: 'center',
        horizontal: 'center'
      },
      front: {
        bold: true,
      },
      fill: {
        fgColor: {
          rgb: 'FF6347'
        }
      }
    }
  };

  const heading = [
    [{value: headerData, style: styles.middle}],
    [{value: principalInfo, style: styles.middle}],
    [
      {value: '学院统计', style: styles.group1}, '',
      {value: '年级人数统计', style: styles.group2}, '',
      {value: '校区统计', style: styles.group3}, '',
    ]
  ];

  let columns = 6;


  specification = {
    collegeName: {
      displayName: '学院名称',
      headerStyle: styles.middle,
      cellStyle: styles.normal,
      width: '40'
    },
    collegeCount: {
      displayName: '学院报名人数',
      headerStyle: styles.middle,
      cellStyle: styles.normal,
      width: '20'
    },
    className: {
      displayName: '年级',
      headerStyle: styles.middle,
      cellStyle: styles.normal,
      width: '40'
    },
    classCount: {
      displayName: '年级报名人数',
      headerStyle: styles.middle,
      cellStyle: styles.normal,
      width: '20'
    },
    campusName: {
      displayName: '校区',
      headerStyle: styles.middle,
      cellStyle: styles.normal,
      width: '40'
    },
    campusCount: {
      displayName: '校区报名人数',
      headerStyle: styles.middle,
      cellStyle: styles.normal,
      width: '20'
    }
  };

  let dataSet = [];
  for (let key in itemsData.college) {
    if(itemsData.college.hasOwnProperty(key)) {
      dataSet.push({
        collegeName: key,
        collegeCount: itemsData.college[key],
        className: '',
        classCount: '',
        campusName: '',
        campusCount: '',
      })
    }
  }

  let dataCount = dataSet.length;

  for (let key in itemsData.grade) {
    if(itemsData.grade.hasOwnProperty(key)) {
      if (dataCount <= 0) {
        dataSet.push({
          collegeName: '',
          collegeCount: '',
          campusName: '',
          campusCount: '',
          className: key+'级',
          classCount: itemsData.grade[key],
        })
      } else {
        dataSet[dataSet.length - dataCount].className = key + '级';
        dataSet[dataSet.length - dataCount].classCount = itemsData.grade[key];
      }
      dataCount--;
    }
  }

  dataCount = dataSet.length;

  for (let key in itemsData.campus) {
    if(itemsData.campus.hasOwnProperty(key)) {
      if (dataCount <= 0) {
        dataSet.push({
          collegeName: '',
          collegeCount: '',
          campusName: key,
          campusCount: itemsData.campus[key],
          className: '',
          classCount: '',
        })
      } else {
        dataSet[dataSet.length - dataCount].campusName = key;
        dataSet[dataSet.length - dataCount].campusCount = itemsData.campus[key];
      }
      dataCount--;
    }
  }


  const merges = [
    { start: { row: 1, column: 1 }, end: { row: 1, column: columns } },
    { start: { row: 2, column: 1 }, end: { row: 2, column: columns } },
    { start: { row: 3, column: 1 }, end: { row: 3, column: 2 } },
    { start: { row: 3, column: 3 }, end: { row: 3, column: 4 } },
    { start: { row: 3, column: 5 }, end: { row: 3, column: 6 } }
  ];

  return report = excel.buildExport(
    [
      {
        heading: heading,
        merges: merges,
        specification: specification,
        data: dataSet
      }
    ]
  );
};
