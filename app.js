const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser')
const Register = require('./routes/Auth/register');
const Login = require('./routes/Auth/login');
const Auth = require('./routes/Auth/auth');
const Active = require('./routes/Auth/active');
const Captcha = require('./routes/Auth/captcha');
const resetPwd = require('./routes/User/resetPwd');
const changePwd = require('./routes/User/changePwd');
const Profile = require('./routes/User/profile');
const UserDetail = require('./routes/User/{id}');
const RaceCreate = require('./routes/Race/create');
const RaceItem = require('./routes/Race/{id}');
const Teacher = require('./routes/Admin/teacher');
const AddTokenTime = require('./middleware/AddTokenTime');
const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(cookieParser());

// app.all('*', function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
//   res.header("X-Powered-By",' 3.2.1')
//   res.header("Content-Type", "application/json;charset=utf-8");
//   next();
// });

app.use(AddTokenTime);

app.use('/auth', Auth);
app.use('/auth', Register);
app.use('/auth', Login);
app.use('/auth', Active);
app.use('/auth', Captcha);
app.use('/user', resetPwd);
app.use('/user', changePwd);
app.use('/user', Profile);
app.use('/user', UserDetail);
app.use('/race', RaceCreate);
app.use('/race', RaceItem);
app.use('/admin', Teacher);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  if (err.stack) {
    console.log(err.stack);
  }
  else {
    console.log(err.message || err);
  }
  if (err.message && err.status) {
    if (err.status === 422) res.status(err.status).send(err.message);
    else res.status(err.status).send({message: err.message});
  }
  else res.status(err.status || 500).send(err.stack || err);
});

module.exports = app;
