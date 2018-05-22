const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const config = require('../config');

const redis = require("redis");
const client = redis.createClient(config.redis);

var _ = require('lodash');

client.on("error", function (err) {
    console.log("Error " + err);
});

client.on("connect", function (msg) {
    console.log("Redis connected for relations");
});

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/:_ifAdj/:_id', function(req, res, next) {
  let total_res = {};
  let all_id = '';
  if(req.params._ifAdj == '1')
    all_id = 'https://www.qichacha.com/' + req.params._id + '->Adj';
  else if(req.params._ifAdj == '0')
    all_id = 'https://www.qichacha.com/' + req.params._id + '->RAdj';
  else {
    next();
  }
  console.log(all_id);
  total_res.id = req.params._id;
  client.get('https://www.qichacha.com/' + req.params._id + '->name', function(err, reply){
    total_res.name = reply;
    client.smembers(all_id, function(err, reply) {
      // console.log(reply);
      let promises = [];
      let replys = [];

      reply.forEach(item => {
          promises.push(new Promise(function(resolve, reject){
            const tmp = _.split(item, '->', 2);
            const all_res = {};
            all_res.value = tmp[0];
            all_res.id = tmp[1];
            client.get(tmp[1] + '->name', function(err, reply){
              all_res.name = reply;
              // console.log(all_res);
              resolve(all_res);
            })
          }).then(data => {
            replys.push(data);
          })
        )
      });

      Promise.all(promises).then(() => {
        console.log(replys);
        total_res.children = replys;
        res.status(200).json(total_res);
      });
    });
  })

});

router.get('/inves/:_id', function(req, res, next) {

});

module.exports = router;
