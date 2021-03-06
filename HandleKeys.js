/* 根据提供的关键词，通过企查查等网站的检索接口，获取相关关键词的检索条目结果，将相应结果的URL存入数据库中 */

const puppeteer = require('puppeteer');
const uuidv4 = require('uuid/v4');

const config = require('./config');
const mysql = require('./mysql');

// 定时函数的简化写法
const timer = ms => new Promise( res => setTimeout(res, ms));

// 建立与mysql的连接
const Sequelize = require('sequelize');
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

// 引入相关的表格定义
const  WairForHandleCompany = sequelize.import(__dirname + "/models/WairForHandleCompany");
const  Company = sequelize.import(__dirname + "/models/Company");
const  Investor = sequelize.import(__dirname + "/models/Investor");
const  Handled = sequelize.import(__dirname + "/models/Handled");
const  Manager = sequelize.import(__dirname + "/models/Manager");
const  Person = sequelize.import(__dirname + "/models/Person");
sequelize.sync();

// 处理单条记录
async function HandleOnePage(browser, keyword, index)
{
  all_url = config.SearchURL(keyword, index);
  console.log(all_url);
  const page = await browser.newPage();
  await page.goto(all_url);
  await page.reload();
  var check_se = config.SearchSelector(1);
  page.waitForSelector(check_se).then(async () => {
    for (var j = 1; j <= config.core.selector.search_res_num; j ++)
    {
        var target_se = config.SearchSelector(j);
        const tmp = await page.$eval(target_se, (element) => {
          return element.href;
        });
        console.log(tmp);
        WairForHandleCompany.findOrCreate({where: {ID : tmp}}).spread((company, created) => {
          if(!created)
            console.log("Duplicated One!");
          else {
            console.log("Create One!");
          }
        })
    }
    console.log("Start Close!!!!!!!!!!!!!!!!!");
    await page.close();
  })
}

// 处理单个关键词
async function HandleOneKey(browser, keyword){
    for (var i = 1; i <= config.core.selector.search_page_num; i ++)
    {
        HandleOnePage(browser, keyword, i);
        await timer(config.core.time.pageWait); // 设置一定的爬取间隔，应对反爬机制
    }
}

// 枚举关键词，对于每个关键词，枚举不同的页数
async function StartHandleKeys(browser, page, keywords) {

    for (let i = 0; i < keywords.length; i ++)
    {
        await page.reload();
        await HandleOneKey(browser, keywords[i]);
    }
    await browser.close();
  }

// 爬虫的初始化工作
async function HandleLogin(keywords)
{
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.goto(config.core.url.home);
  await page.goto(config.core.url.login);
  await page.waitForSelector(config.core.selector.passwordlogin).then(async () => {
    await page.click(config.core.selector.passwordlogin);
  });
  await page.waitForSelector(config.core.selector.username).then(async () => {
    await page.type(config.core.selector.username, config.core.user.username);
    await page.type(config.core.selector.password, config.core.user.password);
  });
  await page.waitForNavigation();
  StartHandleKeys(browser, page, keywords);
}

module.exports = HandleLogin;
keywords = new Array("河海", "腾讯", "星网", "材料", "小米", "百度");
HandleLogin(keywords);
