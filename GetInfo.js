const puppeteer = require('puppeteer');
const uuidv4 = require('uuid/v4');

const config = require('./config');
const mysql = require('./mysql');

const timer = ms => new Promise( res => setTimeout(res, ms));

const Sequelize = require('sequelize');
const sequelize = new Sequelize(mysql.core.database, mysql.core.user.username, mysql.core.user.password, {
  host: mysql.core.localhost,
  dialect: 'mysql',
  logging: false,
  operatorsAliases: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

sequelize.authenticate();
console.log("Have connected mysql!");
const  WairForHandleCompany = sequelize.import(__dirname + "/models/WairForHandleCompany");
const  Handled = sequelize.import(__dirname + "/models/Handled");
const  Company = sequelize.import(__dirname + "/models/Company");
const  Person = sequelize.import(__dirname + "/models/Person");
const  Investor = sequelize.import(__dirname + "/models/Investor");
const  Manager = sequelize.import(__dirname + "/models/Manager");

sequelize.sync();


async function GetInfo(browser)
{
  // const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  var endGet = false;
  while(!endGet)
  {
      let data = await WairForHandleCompany.findOne({});
      if(data == null)
      {
        console.log("Need More Info");
        endGet = true;
        break;
      }
      // console.log(data);
      const tmp = data.dataValues.ID;
    //  const tmp = "https://www.qichacha.com/firm_f1c5372005e04ba99175d5fd3db7b8fc.html";
      await page.goto(tmp);
      data.destroy({ force: true });
      let created = await Handled.findOrCreate({where: {ID : tmp}});

      // console.log(created[1]);
      //created = true;
      if(!created)
        console.log("Duplicated One!");
      else {
        console.log("Start Get Infor");
        try{
          await page.waitForSelector(mysql.companySel.MainProduct);
        }catch(err){
          page.reload();
        }
        var objTmp = mysql.companySel;
        var resTmp = {};
        const companyID = tmp;
        resTmp["ID"] = tmp;
        await page.$eval(objTmp.BossName, (element) => {
          return element.href;
        }).then(data => {
          // console.log(data);
          resTmp["BossID"] = data.trim();
        }).catch(err => {
          // console.log("ERR");
          resTmp["BossID"] = "暂无";
        });
        const promises = Object.keys(objTmp).map(async (key)=> {
          await page.$eval(objTmp[key], (element) => {
            return element.innerHTML;
          }).then(data => {
            // console.log(data);
            resTmp[key] = data.trim();
          }).catch(err => {
            // console.log("ERR");
            resTmp[key] = "暂无";
          })
        });

        await page.$eval(objTmp.Logo, (element) => {
          return element.src;
        }).then(data => {
          // console.log(data);
          resTmp["Logo"] = data;
        }).catch(err => {
          // console.log("ERR");
          resTmp["Logo"] = "暂无";
        });

        await Promise.all(promises);
        // console.log(resTmp);
        Company.build(resTmp).save()
        .then()
        .catch(err => {
          console.log(err);
        });

        await page.$eval(mysql.num.invesSel, (element) => {
          return element.innerHTML;
        }).then(async (invesNum) => {
          for (var i = 1; i <= invesNum; i ++)
          {
            var resInves = {};
            resInves['InvestorName'] = await page.$eval(mysql.getInvesSel(i).InvestorName, (element) => {
              return element.innerHTML;
            });
            resInves['InvestorID'] = await page.$eval(mysql.getInvesSel(i).InvestorName, (element) => {
              return element.href;
            });
            resInves['InvestRate'] = await page.$eval(mysql.getInvesSel(i).InvestRate, (element) => {
              var tmp = element.innerHTML;
              tmp = tmp.trim();
              return tmp;
            });
            resInves['InvestMoney'] = await page.$eval(mysql.getInvesSel(i).InvestMoney, (element) => {
              return element.innerHTML.replace("<br>", "").trim();
            });
            resInves['SellDate'] = await page.$eval(mysql.getInvesSel(i).SellDate, (element) => {
              var tmp = element.innerHTML.replace("<br>", "").trim();
              return tmp;
            });
            resInves['Type'] = await page.$eval(mysql.getInvesSel(i).Type, (element) => {
              return element.innerHTML.replace("<br>", "").trim();
            });
            resInves['CompanyID'] = companyID;
            resInves['CompanyName'] = await page.$eval(mysql.companySel.Name, (element) => {
              return element.innerHTML;
            });
            resInves['ID'] = resInves['InvestorID'] + "->" + resInves['CompanyID'] + "->" + resInves['SellDate'] + "->" + resInves['InvestRate'];
            // console.log(resInves);
            Investor.build(resInves).save()
            .then()
            .catch(err => {
              console.log(err);
            });
          }
        }).catch(err => {
          console.log(err);
        });

        console.log("-----------------------------------------------Manager Get!");
        await page.$eval(mysql.num.manSel, (element) => {
          return element.innerHTML;
        }).then(async (manNum) => {
          for (var i = 1; i <= manNum; i ++)
          {
            var resMan = {};
            var resPer = {};
            resMan['Name'] = await page.$eval(mysql.getManSel(i).Name, (element) => {
              return element.innerHTML;
            });
            resPer['Name'] = resMan['Name'];

            resMan['PersonID'] = await page.$eval(mysql.getManSel(i).Name, (element) => {
              return element.href;
            });
            resPer['ID'] = resMan['PersonID'];

            resMan['CompanyID'] = resPer['CompanyID'] = companyID;
            resMan['Job'] = await page.$eval(mysql.getManSel(i).Job, (element) => {
              return element.innerHTML.replace("\n", "").trim();
            });
            resPer['Job'] = resMan['Job'];
            resMan['ID'] = resMan['PersonID'] + "->" + resMan['CompanyID'] + "->" + resMan['Job'];
            Manager.build(resMan).save()
            .then()
            .catch(err => {
              console.log(err);
            });

            Person.build(resPer).save()
            .then()
            .catch(err => {
              // console.log(err);
            });
          }
        }).catch(err => {
          console.log(err);
        });

        try {
          await page.$eval(mysql.num.ForInveSel, (element) => {
            return element.innerHTML;
          }).then(async (forInveNum) => {

            var pages = forInveNum / mysql.num.ForInveNum;
            pages = Math.ceil(pages);
            // console.log("pages--->" + pages.toString());
            var resForInves = {};
            resForInves["InvestorID"] = companyID;
            resForInves["InvestorName"] = await page.$eval(mysql.companySel.Name, (element) => {
              return element.innerHTML;
            });
            resForInves["Type"] = "企业法人";
            for(var i = 0; i < pages; i ++)
            {
              var nextPage = i + 2;
              for (var j = 1; j <= mysql.num.ForInveNum && i * mysql.num.ForInveNum + j <= forInveNum; j ++)
              {
                resForInves["InvestMoney"] = await page.$eval(mysql.getForInvesNum(j).InvestMoney, (element) => {
                  return element.innerHTML.replace("\n", "").trim();
                });
                resForInves["InvestRate"] = await page.$eval(mysql.getForInvesNum(j).InvestRate, (element) => {
                  return element.innerHTML.replace("\n", "").trim();
                });
                resForInves["SellDate"] = await page.$eval(mysql.getForInvesNum(j).SellDate, (element) => {
                  return element.innerHTML.replace("\n", "").trim();
                });
                resForInves["CompanyName"] = await page.$eval(mysql.getForInvesNum(j).CompanyName, (element) => {
                  return element.innerHTML;
                });
                resForInves["CompanyID"] = await page.$eval(mysql.getForInvesNum(j).CompanyName, (element) => {
                  return element.href;
                });
                resForInves["ID"] = resForInves["InvestorID"] + "->" + resForInves["CompanyID"] + "->" + resForInves["SellDate"] + "->" + resForInves["InvestRate"];
                // console.log("瓯子人");
                // console.log(resForInves);
                Handled.findAndCountAll({where: {ID : resForInves["CompanyID"]}})
                .then(async (data) => {
                  if(data.count == 0)
                  {
                    WairForHandleCompany.findOrCreate({where: {ID : resForInves["CompanyID"]}}).spread((company, created) => {
                      if(!created)
                        console.log("Duplicated One!");
                      else {
                        console.log("Create One!");
                      }
                    });
                  }
                });

                Investor.build(resForInves).save()
                .then(
                  ()=>{
                    console.log("新增对外投资");
                  }
                )
                .catch(err => {
                  console.log(err);
                });
              }
              if(i != pages - 1)
              {
                await timer(config.core.time.forInvesNextPage);
                await page.click(mysql.forInveNextPage(nextPage));
              }
            }
          }).catch(err => {
            console.log("Have no money!!!!!!!!!!!!!!!!!");
            //console.log(err);
          });
        } catch (err) {
          console.log(err);
        }
        console.log("Create One!");
        await timer(config.core.time.infoWait);
      }
      // endGet = true;
  }
}

async function HandleLogin()
{
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.goto(config.core.url.login);
  await page.waitForSelector(config.core.selector.passwordlogin).then(async () => {
    await page.click(config.core.selector.passwordlogin);
  });
  await page.waitForSelector(config.core.selector.username).then(async () => {
    await page.type(config.core.selector.username, config.core.user.username);
    await page.type(config.core.selector.password, config.core.user.password);
  });
  await page.waitForNavigation();
  GetInfo(browser);
}
module.exports = HandleLogin;
