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
const UserRaces = require('./routes/User/races');
const RaceCreate = require('./routes/Race/create');
const RaceItem = require('./routes/Race/{id}');
const RaceApply = require('./routes/Race/apply');
const Teacher = require('./routes/Admin/teacher');
const TeacherItem = require('./routes/Admin/teacherItem');
const AddTokenTime = require('./middleware/AddTokenTime');
const app = express();
const ScheduleJob = require('./libs/ScheduleJob');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(cookieParser());

app.use(AddTokenTime);

app.use('/auth', Auth);
app.use('/auth', Register);
app.use('/auth', Login);
app.use('/auth', Active);
app.use('/auth', Captcha);
app.use('/user', resetPwd);
app.use('/user', changePwd);
app.use('/user', Profile);
app.use('/user', UserRaces);
app.use('/user', UserDetail);
app.use('/race', RaceCreate);
app.use('/race', RaceItem);
app.use('/race', RaceApply);
app.use('/admin', Teacher);
app.use('/admin', TeacherItem);
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
  if (!err.status || err.status === 500) console.log(err.stack || err);
  if (err.message && err.status) {
    if (err.status === 422 || err.status === 404) res.status(err.status).send(err.message);
    else res.status(err.status).send({message: err.message});
  }
  else res.status(err.status || 500).send(err.stack || err);
});

ScheduleJob('captcha', '10 * * * * *');
ScheduleJob('api_token', '10 * * * * *');

module.exports = app;
