##后端API说明文档
* 不作说明时，默认前面加上IP地址：端口号
* 以_开头的表示变量

## 获取公司的详细信息
/company/_id
比如：/company/firm_f1c5372005e04ba99175d5fd3db7b8fc.html

## 获取投资和管理关系
/relations/1/_id
比如：/relations/1/firm_f1c5372005e04ba99175d5fd3db7b8fc.html

返回该id(公司/人)管理的对象或者投资的对象
返回示例：{"value":"116.0252%","toPoint":"https://www.qichacha.com/firm_40fd004c5340a716592a6202d7804605.html","name":"浙江齐聚科技有限公司"}

{"value":"0董事长","toPoint":"https://www.qichacha.com/firm_181e23a3c35a6fc18450f03cc13bb03b.html","name":"腾讯科技(深圳)有限公司"}

value组成为0/1 + 边值
0代表投资关系+边值为投资比例，1代表管理关系+边值代表职位

## 获取被投资和被管理关系
/relations/0/_id
比如：/relations/0/firm_f1c5372005e04ba99175d5fd3db7b8fc.html

返回管理或者投资该id(公司/人)
示例同上
value组成为0/1 + 边值
0代表投资关系+边值为投资比例，1代表管理关系+边值代表职位
