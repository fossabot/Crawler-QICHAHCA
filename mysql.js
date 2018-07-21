mysql = {};

// mysql的配置
mysql.core = {
  user :  {
       username : 'eye',
       password : 'Anatas'
  },
  localhost : '139.196.101.226',
  database : 'Eye'
};

// 配置项对应的网站xpath/selector
mysql.companySel = {
  Name : '#company-top > div > div.content > div.row.title > h1',
  Logo : '#company-top > div > div.logo > div.imgkuang > img',
  Phone  : '#company-top > div > div.content > div:nth-child(2) > span.cvlu > span',
  Email : '#company-top > div > div.content > div:nth-child(3) > span:nth-child(2) > a',
  Website : '#company-top > div > div.content > div:nth-child(3) > span:nth-child(4) > a',
  BossName : '#Cominfo > table:nth-child(3) > tbody > tr:nth-child(2) > td:nth-child(1) > div > div.clearfix > div:nth-child(2) > a.bname',
  RegisterMoney : '#Cominfo > table:nth-child(4) > tbody > tr:nth-child(1) > td:nth-child(2)',
  ActualMoney : '#Cominfo > table:nth-child(4) > tbody > tr:nth-child(1) > td:nth-child(4)',
  State : '#Cominfo > table:nth-child(4) > tbody > tr:nth-child(2) > td:nth-child(2)',
  RegisterDate : '#Cominfo > table:nth-child(4) > tbody > tr:nth-child(2) > td:nth-child(4)',
  RegisterID : '#Cominfo > table:nth-child(4) > tbody > tr:nth-child(3) > td:nth-child(2)',
  OrganizationID : '#Cominfo > table:nth-child(4) > tbody > tr:nth-child(3) > td:nth-child(4)',
  PayPersonID : '#Cominfo > table:nth-child(4) > tbody > tr:nth-child(4) > td:nth-child(2)',
  UniqueSocietyID : '#Cominfo > table:nth-child(4) > tbody > tr:nth-child(4) > td:nth-child(4)',
  CompanyType : '#Cominfo > table:nth-child(4) > tbody > tr:nth-child(5) > td:nth-child(2)',
  Profession : '#Cominfo > table:nth-child(4) > tbody > tr:nth-child(5) > td:nth-child(4)',
  ConfirmDate : '#Cominfo > table:nth-child(4) > tbody > tr:nth-child(6) > td:nth-child(2)',
  RegisterOrganiztion : '#Cominfo > table:nth-child(4) > tbody > tr:nth-child(6) > td:nth-child(4)',
  Region : '#Cominfo > table:nth-child(4) > tbody > tr:nth-child(7) > td:nth-child(2)',
  EnglishName : '#Cominfo > table:nth-child(4) > tbody > tr:nth-child(7) > td:nth-child(4)',
  EverName : '#Cominfo > table:nth-child(4) > tbody > tr:nth-child(8) > td:nth-child(2) > span',
  SellType : '#Cominfo > table:nth-child(4) > tbody > tr:nth-child(8) > td:nth-child(4)',
  Faculty : '#Cominfo > table:nth-child(4) > tbody > tr:nth-child(9) > td:nth-child(2)',
  SellTime : '#Cominfo > table:nth-child(4) > tbody > tr:nth-child(9) > td:nth-child(4)',
  Place : '#company-top > div > div.content > div:nth-child(4) > span.cvlu > a:nth-child(1)',
  MainProduct : '#Cominfo > table:nth-child(4) > tbody > tr:nth-child(11) > td:nth-child(2)',
}

mysql.num = {
  invesSel : "#Sockinfo > div > span.tbadge",
  manSel :　"#Mainmember > div > span.tbadge",
  ForInveSel : "#touzilist > div.tcaption > span.tbadge",
  ForInveNum : 10
}
mysql.forInveNextPage = function (index) {
  if(index > 2)
  {
    index = index + 1;
  }
  return "#touzilist > div:nth-child(3) > nav > ul > li:nth-child(" + index.toString() + ") > a";
}
mysql.getForInvesNum = function(index)
{
  index = index + 1;
  res = {};
  res.CompanyName = "#touzilist > table > tbody > tr:nth-child(" + index.toString() + ") > td:nth-child(1) > a";
  res.InvestMoney = "#touzilist > table > tbody > tr:nth-child(" + index.toString() + ") > td:nth-child(3)",
  res.InvestRate = "#touzilist > table > tbody > tr:nth-child(" + index.toString() + ") > td:nth-child(4)";
  res.SellDate = "#touzilist > table > tbody > tr:nth-child(" + index.toString() + ") > td:nth-child(5)";
  return res;
}
mysql.getInvesSel = function (index) {
  index = index + 1;
  res = {};
  res.InvestorName = "#Sockinfo > table > tbody > tr:nth-child(" + index.toString() + ") > td:nth-child(2) > a";
  res.InvestRate = "#Sockinfo > table > tbody > tr:nth-child(" + index.toString() +  ") > td:nth-child(3)";
  res.InvestMoney = "#Sockinfo > table > tbody > tr:nth-child(" + index.toString() +  ") > td:nth-child(4)";
  res.SellDate = "#Sockinfo > table > tbody > tr:nth-child(" + index.toString() +  ") > td:nth-child(5)";
  return res;
}

mysql.getManSel = function (index) {
  index = index + 1;
  res.Name = "#Mainmember > table > tbody > tr:nth-child(" + index.toString() + ") > td:nth-child(2) > a.c_a";
  res.Job = "#Mainmember > table > tbody > tr:nth-child(" + index.toString() + ") > td.text-center";
  return res;
}
module.exports = mysql;
