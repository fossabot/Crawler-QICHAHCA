const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const MongoClient = require('mongodb').MongoClient;
const mysql = require('../mysql');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/:_id', function(req, res, next) {
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
    dbCompany.find({"_id" : "https://www.qichacha.com/"+req.params._id}).toArray(function(err, docs){
      if(err != null)
      {
        console.log(err);
        res.status(500);
      }
      console.log(docs);
      client.close();
      res.json(docs);
  })
})
});

module.exports = router;
