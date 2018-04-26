config = {};
config.redis = {
    host : "115.159.39.220",
    port : "6379",
    password : "Anatas"
}
config.mongodb = {
    url : "mongodb://115.159.39.220:27017",
    dbName : "Crawl",
    collectionName : "Company"
}
config.core = {
    user :  {
         username : "18245461892",
         password : "1562810221llj"
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
        search_page_num : 10,
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
