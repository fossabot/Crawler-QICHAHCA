/* 实现将清洗后的mysql数据导入redis */

const config = require('./config');

const Sequelize = require('sequelize');
const mysql = require('./mysql');

// 建立与mysql的连接
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
// console.log("Have connected mysql!");

// 引入mysql的单个表
const  Investor = sequelize.import(__dirname + "/models/Investor");
const  Manager = sequelize.import(__dirname + "/models/Manager");

// 建立与redis的连接
const redis = require("redis");
const client = redis.createClient(config.redis);


client.on("error", function (err) {
    console.log("Error " + err);
});

client.on("connect", function (msg) {
    console.log("Redis connected");
});

// 处理数据库中的单个记录
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
    client.sadd(data.InvestorID + "->" + "Adj", "1" + data.InvestRate + "%" + data.InvestMoney + "->" + data.CompanyID);
    client.sadd(data.CompanyID + "->" + "RAdj", "1" + data.InvestRate + "%" + data.InvestMoney + "->" + data.InvestorID);
  }
}

// 处理管理关系
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

// 处理投资关系
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

// 主程序入口
async function main()
{
  HandleManager();
  HandleInvestor();
}

module.exports = main;
main();
