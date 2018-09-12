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
      else (createError(422, {message: err.code}))
    }
    else next()
  });
}, function (httpReq, httpRes, next) {
  let file = httpReq.file;
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
          res.setHeader('Content-Disposition', 'inline;filename="' + encodeURIComponent(file.truename) + '"');
          res.setHeader('Content-Type', file.mimetype);
          let content = fs.readFileSync(path.join(__dirname, '../../storage/' + file.filename));
          res.status(200).send(content);
        }
      }
    }).catch(e => next(e))
  }
});

module.exports = router;