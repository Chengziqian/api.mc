const multer = require('multer');
const path = require('path');
const uuid = require('uuid/v1');
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../storage'))
  },
  filename: function (req, file, cb) {
    cb(null, uuid())
  }
});

let uploader = multer({
  storage: storage,
  limits: {
    fileSize: 2048 * 1024
  }
});

module.exports = uploader;