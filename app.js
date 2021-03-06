// const HandleKeys = require("./HandleKeys");
// const HandleRedis = require("./redis");
// const HandleMongodb = require("./mongodb");

// 设置路由
const company = require('./routes/company'); // 返回公司的详细信息
const relations = require('./routes/relations'); // 返回主体之间的关联信息
const search = require('./routes/search'); // 返回检索结果
const data = require('./routes/data'); // 测试用的地址

// 项目的初始化以及json的解析
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const logger = require('morgan');
const mongoose = require('mongoose');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 设置安全策略
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods" , "GET,POST,PUT,DELETE,OPTIONS");
  next();
});

// 设置路由
app.use('/company', company);
app.use('/relations', relations);
app.use('/search', search);
app.use('/data', data);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
