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
      if(item.PR == null)
        item.PR = 0;
      else {
        item.PR = parseFloat(item.PR);
      }
      resolve(item);
  });
}

router.get('/:_type/:_index/:_pageNum/:_pageIndex', function(req, res, next) {
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

    let query = {};
    query[req.params._type] = {$regex: req.params._index, $options: 'i' };
    let options = {};
    options["skip"] = (req.params._pageIndex - 1) * req.params._pageNum;
    options["limit"] = req.params._pageNum;
    // let projection = {};
    // projection[req.params._type] = 1;
    // options["projection"] = projection;
    dbCompany.find(query, options).toArray(async function(err, docs){
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
      docs = _.orderBy(docs, ['PR'], ['desc']);
      Mongoclient.close();
      // for (let j = 0; j < docs.length; j ++)
      // {
      //   console.log(docs[j].PR);
      // }
      res.status(200).json(docs);
    })

  });
});

router.get('/:_type/:_index/num', function(req, res, next) {
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

    let query = {};
    query[req.params._type] = {$regex: req.params._index, $options: 'i' };

    dbCompany.find(query).count(async function(err, docs){
      // console.log(searchType);
      if(err != null)
      {
        console.log(err);
        res.status(500);
      }
      Mongoclient.close();
      console.log(docs);
      res.status(200).json({"length":docs});
    })

  });
});

router.get('/:_type/:_index/autoprefix', function(req, res, next) {
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
    let query = {};
    query[req.params._type] = {$regex: req.params._index, $options: 'i' };
    console.log(query);
    let projection = {};
    projection[req.params._type] = 1;
    let option = {};
    option["projection"] = projection;
    dbCompany.find(query, option).toArray(async function(err, docs){
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
      Mongoclient.close();
      console.log(docs);
      res.status(200).json(docs);
    })

  });
});
module.exports = router;
