# weibo-backend

#### 介绍
微博后端1.0 node+express+mongodb

本项目是[全栈公开课](https://fullstackopen.com/zh/#course-contents)的跟练项目

#### 插件说明

1. cross-env：解决环境变量（.env文件）在不同系统下的差异

安装：`npm install --save-dev cross-env`

```json
#.env
{
  "scripts": {
    "start": "cross-env NODE_ENV=production node index.js",
    "dev": "cross-env NODE_ENV=development nodemon index.js",
    "test": "cross-env NODE_ENV=test jest --verbose --runInBand",
  },
}
```
2. VSCode件插：[Restful Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) ：在.rest文件中定义接口测试

3. nodemon：node热重载

4. dotenv 实现.env保存环境变量 [教程](https://juejin.cn/post/7070347341282148365)