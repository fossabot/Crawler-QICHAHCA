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

async function GetName(id)
{
  return new Promise(function(resolve, reject){
    client.get(id + '->name', function(err, reply){
      // console.log(reply);
      resolve(reply);
    });
  });
}
async function GetMap(id, edge)
{
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

async function GetAdj(id)
{
  return GetMap(id, '->Adj');
}

async function GetRAdj(id)
{
  return GetMap(id, '->RAdj');
}

async function ChangItem(item)
{
  return new Promise(async function(resolve, reject){
      item.children = await GetAdj(item.id);
      // console.log(item.children);
      resolve(item);
  });
}

async function ChangItem_R(item)
{
  return new Promise(async function(resolve, reject){
      item.children = await GetRAdj(item.id);
      // console.log(item.children);
      resolve(item);
  });
}

router.get('/:_ifAdj/:_id', async function(req, res, next) {
  let total_res = {};
  let changewhat;
  if(req.params._ifAdj == '1')
    changewhat = GetAdj;
  else if(req.params._ifAdj == '0')
    changewhat = GetRAdj;
  else {
    next();
  }
  total_res.id = basic + req.params._id;
  total_res.value = "";
  total_res.name = await GetName(total_res.id);
  total_res.children = await changewhat(total_res.id);
  res.status(200).json(total_res);
});

router.get('/:_ifAdj/:_id/3', async function(req, res, next) {
  let edge = "";
  let changewhat;
  if(req.params._ifAdj == '1')
  {
    edge = "->Adj";
    changewhat = ChangItem;
  }
  else if(req.params._ifAdj == '0')
  {
    edge = "->RAdj";
    changewhat = ChangItem_R;
  }
  else {
    next();
  }
  let total_res = {};
  total_res.id = basic + req.params._id;
  total_res.value = "";
  total_res.name = await GetName(total_res.id);
  total_res.children = await GetMap(total_res.id, edge);
  const promises = total_res.children.map(changewhat);
  await Promise.all(promises).then(data => {
    // console.log(data);
    total_res.children = data;
  });
  for (var i = 0; i < total_res.children.length; i ++)
  {
    const promises = total_res.children[i].children.map(changewhat);
    await Promise.all(promises).then(data => {
      // console.log(data);
      total_res.children[i].children = data;
    });
  }
  res.status(200).json(total_res);
});

module.exports = router;
