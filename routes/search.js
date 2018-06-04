const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const config = require('../config');

const redis = require("redis");
const client = redis.createClient(config.redis);

const _ = require('lodash');

const MongoClient = require('mongodb').MongoClient;

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

async function GetPR(id)
{
  return new Promise(function(resolve, reject){
    client.get(id + '->PR', function(err, reply){
      // console.log(reply);
      resolve(reply);
    });
  });
}

async function ChangItem(item)
{
  return new Promise(async function(resolve, reject){
      item.PR = await GetPR(item._id);
      // console.log(item.children);
      resolve(item);
  });
}

router.get('/:_index/:_pageNum/:_pageIndex', function(req, res, next) {
  MongoClient.connect(config.mongodb.url, function(err, Mongoclient) {
    if(err != null)
    {
      console.log(err);
      return;
    }
    console.log("Connected successfully to server");

    const dbName = config.mongodb.dbName;

    const db = Mongoclient.db(dbName);

    const dbCompany = db.collection(config.mongodb.collectionName);

    dbCompany.find({ "Name": { $regex: req.params._index, $options: 'i' }}, {skip : (req.params._pageIndex - 1) * req.params._pageNum, limit : req.params._pageNum}).toArray(async function(err, docs){
      if(err != null)
      {
        console.log(err);
        res.status(500);
      }
      const promises = docs.map(ChangItem);
      await Promise.all(promises).then(data => {
        // console.log(data);
        docs = data;
      });
      // console.log(docs);
      Mongoclient.close();
      res.status(200).json(docs);
    })

  });
});

router.get('/:_index/num', function(req, res, next) {
  MongoClient.connect(config.mongodb.url, function(err, Mongoclient) {
    if(err != null)
    {
      console.log(err);
      return;
    }
    console.log("Connected successfully to server");

    const dbName = config.mongodb.dbName;

    const db = Mongoclient.db(dbName);

    const dbCompany = db.collection(config.mongodb.collectionName);

    dbCompany.find({ "Name": { $regex: req.params._index, $options: 'i' }}).toArray(async function(err, docs){
      if(err != null)
      {
        console.log(err);
        res.status(500);
      }
      Mongoclient.close();
      console.log(docs);
      res.status(200).json({"length":docs.length});
    })

  });
});

module.exports = router;
