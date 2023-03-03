# screenshot 网页截图

基于puppeteer api运行的Node 服务, pm2发布

## 详细说明

- 运行 npm i puppeteer
- npm i puppeteer-cluster
- npm install express

// pm2全局安装
npm install pm2 -g


## 相关文档

- pm2 部署 ————  [详细说明](https://zhuanlan.zhihu.com/p/20940096)
  - pm2  More examples in https://github.com/Unitech/pm2
  #### puppeteer 返回多张截图 
- https://github.com/mrzeng/TaobaoScreenshots
- https://gitee.com/wuxue107/screenshot-api-server/tree/master

## CQ WIKI 链接
     https://wiki.biligame.com/cq/

## 部署相关
 - **_注意：_**在使用pm2将本地文件上传到服务器时出现spawn sh ENOENT的错误，
        **用git bash 打开**
 - #### 配置好 pm2, git 上传Node 项目，运行