const config = require('./config');

const Sequelize = require('sequelize');
const mysql = require('./mysql');
const sequelize = new Sequelize(mysql.core.database, mysql.core.user.username, mysql.core.user.password, {
  host: mysql.core.localhost,
  dialect: 'mysql',
  operatorsAliases: false,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

sequelize.authenticate();
console.log("Have connected mysql!");

const  Company = sequelize.import(__dirname + "/models/Company");

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
async function main()
{
  MongoClient.connect(config.mongodb.url, function(err, client) {
    if(err != null)
    {
      console.log(err);
      return;
    }
    console.log("Connected successfully to server");

    const dbName = config.mongodb.dbName;

    const db = client.db(dbName);

    const dbCompany = db.collection(config.mongodb.collectionName);

    async function HandleCompany()
    {
      let data = await Company.findOne({});
      while(data != null)
      {
        await HandleOneRecord(dbCompany, data);
        // console.log(data.dataValues);
        await data.destroy({ force: true });
        data = await Company.findOne({});
        // data = null;
      }
      console.log("Need More Manager");
      client.close();
    }
    HandleCompany();
  });

  async function HandleOneRecord(collection, data)
  {
    data.dataValues._id = data.dataValues.ID;
    // console.log(data.dataValues);
    collection.insertOne(data.dataValues, function(err, result) {
      if(err)
      {
        // console.log(err
        console.log("Duplicate One");
      }else{
        // console.log(result);
        console.log("Insert One To MongoDB");
      }
    });

  }
}
module.exports = main;
