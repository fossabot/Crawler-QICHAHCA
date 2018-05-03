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

const  Investor = sequelize.import(__dirname + "/models/Investor");
const  Manager = sequelize.import(__dirname + "/models/Manager");

const redis = require("redis");
const client = redis.createClient(config.redis);


client.on("error", function (err) {
    console.log("Error " + err);
});

client.on("connect", function (msg) {
    console.log("Redis connected");
});

async function HandleOneRecord(data, type)
{
  if(type == 0)
  {
    // client.rpush("PageRank", data.PersonID + "->" + data.CompanyID);
    client.rpush("PageRank", data.CompanyID + "->" + data.PersonID);
    client.set(data.PersonID + "->" + "name", data.Name, redis.print);
    client.sadd(data.PersonID + "->" + "Adj", "0" + data.Job + "->" + data.CompanyID);
    client.sadd(data.CompanyID + "->" + "RAdj", "0" + data.Job + "->" + data.PersonID);
  }else if(type == 1)
  {
    client.rpush("PageRank", data.InvestorID + "->" + data.CompanyID);
    client.rpush("PageRank", data.CompanyID + "->" + data.InvestorID);
    client.set(data.InvestorID + "->" + "name", data.InvestorName, redis.print);
    client.set(data.CompanyID + "->" + "name", data.CompanyName, redis.print);
    client.sadd(data.InvestorID + "->" + "Adj", "1" + data.InvestRate + "->" + data.CompanyID);
    client.sadd(data.CompanyID + "->" + "RAdj", "1" + data.InvestRate + "->" + data.InvestorID);
  }
}

async function HandleManager()
{
  let data = await Manager.findOne({});
  while(data != null)
  {
    HandleOneRecord(data, 0);
    // console.log(data.dataValues);
    data.destroy({ force: true });
    data = await Manager.findOne({});
  }
  console.log("Need More Manager");
}

async function HandleInvestor()
{
  let data = await Investor.findOne({});
  while(data != null)
  {
    HandleOneRecord(data, 1);
    // console.log(data.dataValues);
    data.destroy({ force: true });
    data = await Investor.findOne({});
  }
  console.log("Need More Investor");
}

async function main()
{
  HandleManager();
  HandleInvestor();
}

main();
module.exports = main;
