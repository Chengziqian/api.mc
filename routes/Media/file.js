const express = require('express');
const router = express.Router();
const DB = require('../../libs/DB_Service');
const createError = require('http-errors');
const mime = require('mime');
const CheckLogined = require('../../middleware/CheckLogined');
const GetLogined = require('../../middleware/GetLogined');
const uploader = require('../../libs/multerUtil');
const upload = uploader.single('file');
const path = require('path');
const fs = require('fs');
router.post('/file', CheckLogined ,function (req, res, next) {
  upload(req, res, function (err) {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') next(createError(413, {message: "File too large"}));
      else (createError(422, {message: {file: [err.code]}}));
    }
    else next()
  });
}, function (httpReq, httpRes, next) {
  let file = httpReq.file;
  if (!file) next(createError(422, {message: {file: ['file invalid']}}));
  else {
    let extension = mime.getExtension(file.mimetype);
    let data = {
      user_id: httpReq.USER.id,
      filename: file.filename,
      truename: file.originalname || file.filename,
      mimetype: file.mimetype,
      extension: extension,
      permission: JSON.stringify({public: true, minAccess: -1})
    };
    DB.INSERT('media', data).then(r => {
      httpRes.status(200).send({filename: data.filename});
    }).catch(e => next(e));
  }
});

router.get('/file/:filename', GetLogined, function (req, res, next) {
  if (!req.params.filename) next(createError(422, {message: 'filename in invalid'}));
  else {
    DB.GET('media', 'filename', req.params.filename).then(r => {
      if (r.length === 0) next(createError(404));
      else {
        let file = r[0];
        let per = JSON.parse(file.permission);
        if (!per.public) {
          if (!req.USER) return Promise.reject(createError(401, {message:'请先登录'}));
          if (req.USER && per.minAccess > req.USER.access) return Promise.reject(createError(403, {message: '您没有权限'}));
        } else {
          fs.readFile(path.join(__dirname, '../../storage/' + file.filename), function (err, data) {
            if (err) next(createError(500, err));
            else {
              res.setHeader('Content-Disposition', 'inline;filename="' + encodeURIComponent(file.truename) + '"');
              res.setHeader('Content-Type', file.mimetype);
              res.status(200).send(data);
            }
          });
        }
      }
    }).catch(e => next(e))
  }
});

router.get('/file/:filename/info', GetLogined, function (req, res, next) {
  DB.GET('media', 'filename', req.params.filename).then(r => {
    if (r.length === 0) next(createError(404));
    else {
      let file = r[0];
      let per = JSON.parse(file.permission);
      if (!per.public) {
        if (!req.USER) return Promise.reject(createError(401, {message:'请先登录'}));
        if (req.USER && per.minAccess > req.USER.access) return Promise.reject(createError(403, {message: '您没有权限'}));
      }
      else {
        let image = ["png","jpg","jpeg","jpe","gif","bmp","ico"];
        let pdf = ["pdf","psd"];
        let zip = ["zip","7z","rar","tar","gzip","tar.gz","gz","jar","cab","7-zip","bz","dmg"];
        let word = ["doc","docx"];
        let excel = ["xls","xlsx"];
        let ppt = ["ppt","pptx"];
        let data = {
          filename: file.filename,
          size: null,
          type: 'unknown',
          truename: file.truename || file.filename + '.' + file.extension
        };
        fs.stat(path.join(__dirname, '../../storage/' + file.filename), function (err, stat) {
          if (err) next(createError(400, {message: err}));
          else {
            data.size = stat.size / 1000 + " KB";
            if (image.indexOf(file.extension) !== -1) data.type = 'image';
            if (pdf.indexOf(file.extension) !== -1) data.type = 'pdf';
            if (zip.indexOf(file.extension) !== -1) data.type = 'zip';
            if (word.indexOf(file.extension) !== -1) data.type = 'word';
            if (excel.indexOf(file.extension) !== -1) data.type = 'excel';
            if (ppt.indexOf(file.extension) !== -1) data.type = 'ppt';
            res.status(200).send(data);
          }
        })
      }
    }
  })
});

module.exports = router;