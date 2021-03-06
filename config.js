/* 保存了项目的配置，包括数据库，爬虫等等的配置 */

config = {};

// redis配置
config.redis = {
    host : "139.196.101.226",
    port : "6379",
    password : "Anatas"
}

// mongodb配置
config.mongodb = {
    url : "mongodb://139.196.101.226:27017",
    dbName : "Crawl",
    collectionName : "Company"
}

//爬虫的配置
config.core = {
    user :  {
         username : "18781934579",
         password : "HHUCrawlQiChaCha"
    },
    url : {
        home : "https://www.qichacha.com",
        login : "https://www.qichacha.com/user_login",
        search : "https://www.qichacha.com/search?key="
    },
    selector : {
        username : '#nameNormal',
        password : '#pwdNormal',
        passwordlogin : '#normalLogin',
        search_page_num : 3,
        search_res_num : 10,
        is_search_res : '#company-top > div > div.content > div.row.title',
        nextPage : '#ajaxpage'
    },
    xpath : {
        username : '//*[@id="nameNormal"]',
        password : '//*[@id="pwdNormal"]'
    },
    time : {
      pageWait : 3000,
      infoWait : 100,
      forInvesNextPage : 2000,
    }
};
config.SearchSelector = function(index)
{
  return '#searchlist > table > tbody > tr:nth-child(' + index.toString() + ') > td:nth-child(2) > a';
};
config.SearchURL = function(keyword, index)
{
  return config.core.url.search + keyword.toString() + '#p:' + index.toString() + '&';
};
module.exports = config;
