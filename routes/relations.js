const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const config = require('../config');

const redis = require("redis");
const client = redis.createClient(config.redis);

const _ = require('lodash');

const basic = "https://www.qichacha.com/";
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

async function GetName(id)
{
  return new Promise(function(resolve, reject){
    client.get(id + '->name', function(err, reply){
      // console.log(reply);
      resolve(reply);
    });
  });
}
async function GetAdj(id)
{
  const edge = "->Adj";
  return new Promise(async function(resolve, reject) {
    client.smembers(id + edge, async function(err, reply){
      // console.log(reply);
      let replys = [];
      for (const item of reply)
      {
        const tmp = _.split(item, '->', 2);
        let all_res = {};
        all_res.value = tmp[0];
        all_res.id = tmp[1];
        all_res.children = [];
        all_res.name = await GetName(all_res.id);
        // console.log(all_res);
        replys.push(all_res);
      }
      resolve(replys);
    });
  });
}

async function GetRAdj(id)
{
  const edge = "->RAdj";
  return new Promise(async function(resolve, reject) {
    client.smembers(id + edge, async function(err, reply){
      // console.log(reply);
      let replys = [];
      for (const item of reply)
      {
        const tmp = _.split(item, '->', 2);
        let all_res = {};
        all_res.value = tmp[0];
        all_res.id = tmp[1];
        all_res.children = [];
        all_res.name = await GetName(all_res.id);
        // console.log(all_res);
        replys.push(all_res);
      }
      resolve(replys);
    });
  });
}

async function ChangItem(item)
{
  return new Promise(async function(resolve, reject){
      item.children = await GetAdj(item.id);
      // console.log(item.children);
      resolve(item);
  });
}

router.get('/Adj/:_id/4', async function(req, res, next) {
  let edge = "";
  if(req.params._ifAdj){
    edge = "->Adj";
  }else{
    edge = "->RAdj";
  }
  if(req.params._levels > 4)
  {
    next();
  }
  let total_res = {};
  total_res.id = basic + req.params._id;
  total_res.value = "";
  total_res.name = await GetName(total_res.id);
  total_res.children = await GetAdj(total_res.id);
  const promises = total_res.children.map(ChangItem);
  await Promise.all(promises).then(data => {
    // console.log(data);
    total_res.children = data;
  });
  for (var i = 0; i < total_res.children.length; i ++)
  {
    const promises = total_res.children[i].children.map(ChangItem);
    await Promise.all(promises).then(data => {
      // console.log(data);
      total_res.children[i].children = data;
    });
  }
  // let ttmp = [];
  // for (const item of total_res.children)
  // {
  //   let tmp = item;
  //   tmp.children = await GetAdj(tmp.id, edge);
  //   ttmp.push(tmp);
  //   // console.log(tmp);
  // }
  // total_res.children = ttmp;
  res.status(200).json(total_res);
});

module.exports = router;
