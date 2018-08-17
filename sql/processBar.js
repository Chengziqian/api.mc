let slog = require('single-line-log').stdout

function processBar(description, length) {
  this.desc = description || 'Process';
  this.length = length || 30;
  this.render = function (opts) {
    let percent = (opts.completed / opts.total).toFixed(4);
    let cell_num = Math.floor(this.length * percent);

    let cell = '';
    for (let i = 0; i < cell_num; i++) {
      cell += '█'
    }

    let empty = '';
    for (let i = 0;i < this.length - cell_num; i++) {
      empty += '░';
    }

    let cmdText = this.desc + ': ' +
      (100*percent).toFixed(2) + '% ' +
      cell +
      empty +
      ' ' +
      opts.completed +
      '/' +
      opts.total;

    slog(cmdText + '\n');
  }
}
module.exports = processBar;