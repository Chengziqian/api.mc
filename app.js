const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser')
const Register = require('./routes/Auth/register');
const Login = require('./routes/Auth/login');
const Auth = require('./routes/Auth/auth');
const app = express();
const AddTokenTime = require('./middleware/AddTokenTime');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(cookieParser());

app.use(AddTokenTime);

app.use('/auth', Auth);
app.use('/auth', Register);
app.use('/auth', Login);
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
  res.status(err.status || 500).send(err.message || err);
});

module.exports = app;
