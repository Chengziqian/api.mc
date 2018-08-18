const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const moment = require('moment');
const uuid = require('uuid/v1');
const validate = require('../../libs/validate');
const DB = require('../../libs/DB_Service');
let valid_teacher = {
  email: [{type:'required'},{type:'string'},{type: 'email'}],
  password: [{type:'required'},{type: 'string'}],
  type: [{type:'required'},{type: 'integer'}],
}

let valid_student = {
  email: [{type:'required'},{type:'string'},{type: 'email'}],
  password: [{type:'required'},{type: 'string'}],
  type: [{type:'required'},{type: 'integer'}],
  truename: [{type:'required'},{type: 'string'}],
  qq_number: [{type:'required'},{type: 'string'}],
  phone: [{type:'required'},{type: 'string'}],
  id_code: [{type:'required'},{type: 'string'}],
  competition_area: [{type:'required'},{type: 'string'}],
  competition_type: [{type:'required'},{type: 'integer'}],
  school_name: [{type:'required'},{type: 'string'}],
  major: [{type:'required'},{type: 'string'}],
  school_number: [{type:'required'},{type: 'string'}]
};
router.post('/', function(req, res, next) {
  validate({type: req.body.type},{type: [{type:'required'},{type: 'integer'}]}, function (err) {
    if (JSON.stringify(err) !== "{}") {
      res.status(422).send(err)
    } else {
      next()
    }
  })
}, function (req, res, next) {
  if (req.body.type === 0) {
    validate(req.body, valid_teacher, function (err) {
      if (JSON.stringify(err) !== "{}") {
        res.status(422).send(err)
      } else {
        next()
      }
    })
  } else if (req.body.type === 1) {
    validate(req.body, valid_student, function (err) {
      if (JSON.stringify(err) !== "{}") {
        res.status(422).send(err)
      } else {
        next()
      }
    })
  } else {
    next('register type is undefined')
  }
}, function (req, res, next) {
  let data = req.body
  if (data.type === 0) {
    data.access = 0;
    data.status = 0;
  }
  if (data.type === 1) {
    data.access = -1;
    data.status = 1;
  }
  data.password = crypto.createHash('sha1').update(data.password).digest('hex');
  DB(function (obj) {
    obj.DBService.query('SELECT * FROM `users` WHERE `email` = ?', data.email,
      function (findErr,findResults,findField) {
        if (findResults.length > 0) {
          res.status(422).send({email: ["email is repeated"]})
        } else {
          obj.DBService.query('INSERT INTO `users` SET ?', [data],
            function (insertError, insertResults, insertField) {
              if(insertError) next(insertError)
              let user_id = insertResults.insertId;
              let token = {
                user_id: user_id,
                token: uuid(),
                ip: req.connection.remoteAddress,
                expired_time: moment().add(20, 'm').format('YYYY-MM-DD HH:mm:ss')
              }
              obj.DBService.query('INSERT INTO `api_token` SET ?', [token],
                function (tokenError, tokenResult, tokenField) {
                  if (tokenError) {
                    next(tokenError)
                  } else {
                    res.sendStatus(200);
                  }
                })
          })
        }
      }
    )
  });
});

module.exports = router;
