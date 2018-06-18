const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const config = require('../config');

const MongoClient = require('mongodb').MongoClient;

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

async function GetDetail(child)
{
  return new Promise(async function(resolve, reject) {
    console.log(child);
    MongoClient.connect(config.mongodb.url, function(err, client) {
      if(err != null)
      {
        console.log(err);
        res.status(500);
      }
      console.log("Connected successfully to server");

      const dbName = config.mongodb.dbName;

      const db = client.db(dbName);

      const dbCompany = db.collection(config.mongodb.collectionName);
      dbCompany.find({"_id" : child.id}).toArray(function(err, docs){
        if(err != null)
        {
          console.log(err);
          res.status(500);
        }
        console.log(docs);
        child.detail = docs;
        client.close();
        resolve(child);
    })
  })
  });
}

router.get('/:_ifAdj/:_id', async function(req, res, next) {
  let total_res = {};
  let changewhat = GetAdj;
  if(req.params._ifAdj == '1')
    changewhat = GetAdj;
  else if(req.params._ifAdj == '0')
    changewhat = GetRAdj;
  else {
    console.log("Wrong");
  }
  total_res.id = basic + req.params._id;
  total_res.value = "";
  total_res.name = await GetName(total_res.id);
  total_res.children = await changewhat(total_res.id);
  res.status(200).json(total_res);
});


router.get('/:_ifAdj/:_id/total', async function(req, res, next) {
  let total_res = {};
  let changewhat = GetAdj;
  if(req.params._ifAdj == '1')
    changewhat = GetAdj;
  else if(req.params._ifAdj == '0')
    changewhat = GetRAdj;
  else {
    console.log("Wrong");
  }
  total_res.id = basic + req.params._id;
  total_res.value = "";
  total_res.name = await GetName(total_res.id);
  total_res.children = await changewhat(total_res.id);
  const promises = total_res.children.map(GetDetail);
  await Promise.all(promises).then(data => {
    // console.log(data);
    total_res.children = data;
  });
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

router.get('/01/map/:_id', async function(req, res, next) {
  let total_res = [];
  let edge = {};
  edge.fromID = basic + req.params._id;
  edge.fromName = await GetName(edge.fromID);
  async function AddToEdge(item)
  {
    let ttmp = {};
    ttmp.fromID = edge.fromID;
    ttmp.fromName = edge.fromName;
    ttmp.toID = item.id;
    ttmp.toName = item.name;
    ttmp.value = item.value;
    total_res.push(ttmp);
  }
  let edgeR = {};
  edgeR.toID = basic + req.params._id;
  edgeR.toName = await GetName(edgeR.toID);
  async function AddFromEdge(item)
  {
    let ttmp = {};
    ttmp.toID = edgeR.toID;
    ttmp.toName = edgeR.toName;
    ttmp.fromID = item.id;
    ttmp.fromName = item.name;
    ttmp.value = item.value;
    total_res.push(ttmp);
  }
  async function AddRelations(item)
  {
    let ttmp = {};
    // let is = _.split(item.id, 'com/', 2)[1];
    // console.log(haha);
    ttmp.fromID = item.id;
    ttmp.fromName = item.name;
    ttmp.toID = item.id;
    ttmp.toName = item.name;
    let ttmpAdj = await GetAdj(ttmp.fromID);
    for (const eachItem of ttmpAdj)
    {
      let tput = {};
      tput.fromID = ttmp.fromID;
      tput.fromName = ttmp.fromName;
      tput.toID = eachItem.id;
      tput.toName = eachItem.name;
      tput.value = eachItem.value;
      total_res.push(tput);
    }
    let ttmpRAdj = await GetRAdj(ttmp.toID);
    for (const eachItem of ttmpRAdj)
    {
      let tput = {};
      tput.toID = ttmp.fromID;
      tput.toName = ttmp.fromName;
      tput.fromID = eachItem.id;
      tput.fromName = eachItem.name;
      tput.value = eachItem.value;
      total_res.push(tput);
    }
    // total_res.push(ttmp);
  }
  let tmp = await GetAdj(edge.fromID);
  const promises = tmp.map(AddToEdge);
  await Promise.all(promises);
  let tmpR = await GetRAdj(edgeR.toID);
  const promisesR = tmpR.map(AddFromEdge);
  await Promise.all(promisesR);
  const promisesLast = tmpR.map(AddRelations);
  await Promise.all(promisesLast);
  res.status(200).json(total_res);
});


module.exports = router;
