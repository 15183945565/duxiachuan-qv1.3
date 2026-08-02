# GitHub 与服务器协作部署流程

本文档是当前阶段的开发约定草案，用来说明后续前端、后端、GitHub、测试服务器之间应该怎么配合。它不是最终上线方案，但后续开发必须尽量按这个方向走，避免继续把文件混在一起。

更新时间：2026-08-01

## 一句话原则

GitHub 放源代码，服务器放可运行版本。

本地电脑负责开发和预览，GitHub 负责同步和协作，服务器负责给手机和团队访问测试。

不要把这三件事混在同一个目录里。

## 当前仓库

前端 Cocos 仓库：

```text
https://github.com/15183945565/duxiachuan-qv1.3.git
```

用途：

```text
Cocos Creator 前端工程源代码
UI、场景、Prefab、脚本、资源、配置表前端引用
```

后端仓库：

```text
https://github.com/15183945565/duxiachuan-server.git
```

用途：

```text
Java / Spring Boot / Maven / JDBC / WebSocket 后端工程
玩家账号、存档、战斗结算、排行榜、道友、分享任务、物品、充值提现等服务端逻辑
```

## 本地开发目录

当前前端开发目录：

```text
C:\Users\34158\Desktop\game\Qv1.3
```

这个目录是前端开发主目录。后续继续做 UI、Prefab、Cocos 脚本、资源整理，默认都在这里做。

不要把服务器密钥、数据库密码、后台账号密码放进这个目录，也不要提交到 GitHub。

## 服务器目标目录

服务器上后续建议统一新建独立目录：

```text
/home/ubuntu/duxiachuan
```

建议结构：

```text
/home/ubuntu/duxiachuan/
  frontend/
    cocos/              # 从 GitHub 拉下来的 Cocos 前端源码
    builds/             # 前端打包后的历史构建
    current/            # 当前对外访问的前端构建，可用软链接指向 builds 某一版

  backend/
    server/             # 从 GitHub 拉下来的后端源码
    releases/           # 后端 jar 历史发布版本
    current/            # 当前运行的后端版本，可用软链接指向 releases 某一版

  deploy/
    scripts/            # 部署脚本
    nginx/              # Nginx 配置备份或模板
    notes/              # 部署记录

  logs/
    frontend/           # Nginx 或前端访问日志
    backend/            # 后端运行日志

  backups/
    database/           # 数据库备份
    release/            # 重要版本备份
```

注意：服务器上已有其他项目，例如：

```text
/home/ubuntu/bigxianxia-java
/home/ubuntu/wukong-ai-aggregator
/root/1
```

后续做独侠传时，不要随便改这些已有目录。新项目只放到 `/home/ubuntu/duxiachuan` 下。

## 标准开发流

前端开发流：

```text
1. 在本地 Cocos Creator 打开 C:\Users\34158\Desktop\game\Qv1.3
2. 修改 UI / Prefab / 脚本 / 资源
3. 本地预览确认没有明显问题
4. 执行本地检查
5. git add / git commit
6. git push 到 GitHub 前端仓库
7. 服务器拉取 GitHub 最新前端
8. 服务器或本地执行 Cocos Web 构建
9. 把构建产物切到服务器 current
10. 手机打开测试网址验证
```

后端开发流：

```text
1. 后端同学在本地开发 duxiachuan-server
2. 本地启动 Spring Boot 测试接口和 WebSocket
3. 提交并 push 到 GitHub 后端仓库
4. 服务器拉取最新后端代码
5. Maven 打包成 jar
6. 停旧进程，启动新 jar
7. 前端访问测试服接口验证
```

联调开发流：

```text
1. 前端先根据接口文档接入 ApiClient / Mock 数据
2. 后端按接口文档实现真实接口
3. 本地先各自验证
4. 推送 GitHub
5. 测试服务器部署前后端
6. 手机访问测试服
7. 发现问题后记录问题属于前端、后端、接口定义还是数据配置
8. 修复后再次重复部署验证
```

## GitHub 使用规则

主分支：

```text
main
```

当前阶段可以直接推 main，但正式多人协作后建议改成：

```text
main       # 稳定版本，能部署
dev        # 日常开发合并分支
feature/*  # 单个功能分支
fix/*      # 单个 bug 修复分支
```

提交前必须先看状态：

```bash
git status -sb
```

提交前建议先拉最新：

```bash
git pull --ff-only origin main
```

提交格式建议：

```bash
git add .
git commit -m "feat: add share task panel"
git push origin main
```

常用提交类型：

```text
feat: 新功能
fix: 修 bug
ui: UI / Prefab / 资源调整
docs: 文档
refactor: 代码整理，不改变功能
chore: 工程配置、脚本、杂项
```

示例：

```text
ui: adjust daoyou row spacing
fix: keep profile popup avatar frame above avatar
docs: add github server deployment workflow
```

## 绝对不能提交的东西

以下内容不要提交到 GitHub：

```text
服务器私钥
数据库密码
JWT 密钥
支付密钥
短信密钥
后台管理员密码
真实玩家隐私数据
服务器 .env 生产配置
build 临时缓存
Cocos Library / Temp / local / logs
```

Windows 私钥位置示例：

```text
C:\Users\34158\.ssh\wukong_ai_aggregator_deploy
```

这个文件只允许放在本机 `.ssh` 目录，不允许放进 Cocos 项目，也不允许上传 GitHub。

## 前端部署方式

Cocos 前端源代码不能直接给玩家访问，玩家访问的是构建产物。

推荐 Web Mobile 构建产物目录：

```text
build/web-mobile
```

服务器上的前端发布建议：

```text
/home/ubuntu/duxiachuan/frontend/builds/20260801-1530
/home/ubuntu/duxiachuan/frontend/current -> /home/ubuntu/duxiachuan/frontend/builds/20260801-1530
```

Nginx 对外只指向：

```text
/home/ubuntu/duxiachuan/frontend/current
```

这样每次发新版本时，只需要：

```text
1. 上传或生成新的 build 目录
2. 修改 current 软链接
3. reload nginx
```

如果新版本坏了，可以快速把 `current` 切回上一版。

## 后端部署方式

后端建议 Spring Boot 打成 jar：

```text
bigxianxia-server.jar 或 duxiachuan-server.jar
```

服务器发布建议：

```text
/home/ubuntu/duxiachuan/backend/releases/20260801-1530/duxiachuan-server.jar
/home/ubuntu/duxiachuan/backend/current -> /home/ubuntu/duxiachuan/backend/releases/20260801-1530
```

后端启动脚本建议放：

```text
/home/ubuntu/duxiachuan/backend/current/start.sh
/home/ubuntu/duxiachuan/backend/current/stop.sh
/home/ubuntu/duxiachuan/backend/current/start-background.sh
```

日志建议放：

```text
/home/ubuntu/duxiachuan/logs/backend/server.out.log
/home/ubuntu/duxiachuan/logs/backend/server.err.log
```

## 测试服访问结构

最终理想结构：

```text
https://test.duxiachuan.com/       # Cocos 前端页面
https://test.duxiachuan.com/api/   # HTTP API
wss://test.duxiachuan.com/ws       # WebSocket
```

如果暂时没有域名，可以先用服务器 IP 和端口：

```text
http://103.144.241.103:端口
```

但正式测试最好用域名和 HTTPS，因为手机浏览器、微信环境、WebSocket、跨域策略都会更接近真实上线环境。

## Nginx 推荐思路

Nginx 应该做三件事：

```text
1. 托管前端静态文件
2. 把 /api 转发给后端 Spring Boot
3. 把 /ws 转发给后端 WebSocket
```

示意：

```nginx
server {
    listen 80;
    server_name test.duxiachuan.com;

    root /home/ubuntu/duxiachuan/frontend/current;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8795/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /ws {
        proxy_pass http://127.0.0.1:8795/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

注意：上面只是模板。正式使用前必须结合后端真实端口、接口路径、域名、HTTPS 证书调整。

## 前后端接口约定

前端不要在 UI 代码里到处散落接口地址。建议统一放到：

```text
assets/Script/Net/
```

建议结构：

```text
ApiClient.ts        # HTTP 请求封装
WsClient.ts         # WebSocket 封装
ApiRoutes.ts        # 接口路径常量
ApiTypes.ts         # 前后端数据结构类型
MockApiClient.ts    # 后端未完成时的 Mock
```

接口路径统一使用相对路径：

```text
/api/player/profile
/api/bag/items
/api/share/tasks
/ws
```

不要在代码里写死：

```text
http://103.144.241.103:8795
```

前端运行在测试服时，浏览器会自动访问同域名下的 `/api` 和 `/ws`，这样以后换域名、换服务器、开 HTTPS 都容易。

## Mock 与真实后端切换

当前前端还没完全接真实后端，所以必须允许 Mock。

建议规则：

```text
开发 UI 时可以用 Mock
联调接口时必须切真实后端
提交前不能把临时测试地址写死
```

建议通过一个统一配置控制：

```ts
export const NETWORK_MODE = 'mock' | 'server';
```

或者后续用构建配置区分：

```text
dev: mock
test-server: server
production: server
```

## 每次部署前检查

前端本地提交前建议执行：

```bash
npm run check:type
npm run check:code
npm run check:ui
npm run check:resources
```

如果只是文档修改，可以不跑完整检查，但提交信息要写清楚是 docs。

后端部署前建议执行：

```bash
mvn test
mvn package
```

服务器部署前建议检查：

```bash
git status -sb
git rev-parse --short HEAD
```

部署后建议检查：

```bash
curl -I http://127.0.0.1:后端端口/actuator/health
curl -I http://127.0.0.1/
```

## 常见问题

### 为什么 GitHub 更新了，手机页面没变？

因为 GitHub 只是代码仓库，不会自动更新服务器。

必须完成：

```text
push GitHub
服务器拉取
前端重新构建
Nginx 指向新构建
浏览器清缓存或刷新
```

### 为什么 Cocos 预览正常，手机测试服不正常？

常见原因：

```text
资源路径大小写问题
WebSocket 地址写死
接口跨域
构建产物不是最新
Nginx 缓存
移动端屏幕适配差异
```

### 为什么前端每次改都要重新打包？

如果要让手机通过服务器网址看到最新效果，就要重新打包或重新同步构建产物。

但平时做 UI 时，仍然可以先用 Cocos 本地预览快速看效果。只有要给后端同学或手机测试时，再打包部署。

### 为什么不能直接在服务器改代码？

服务器应该只运行稳定版本。直接在服务器改代码容易出现：

```text
改完忘记同步 GitHub
不知道当前线上版本对应哪个提交
出了问题无法回退
前后端同学互相覆盖
```

标准做法是：

```text
本地改 -> GitHub -> 服务器拉取/部署
```

## 推荐的下一阶段目标

第一阶段：整理服务器目录

```text
创建 /home/ubuntu/duxiachuan
拉取 frontend/cocos
预留 backend/server
写 deploy README
不影响现有 bigxianxia-java 服务
```

第二阶段：建立前端测试服

```text
Cocos 打包 Web Mobile
上传/生成 build
Nginx 指向 frontend/current
手机能访问静态前端页面
```

第三阶段：接后端测试服

```text
后端仓库拉到 backend/server
Maven 打包 jar
启动 Spring Boot
Nginx 配 /api 和 /ws
前端切 server 模式
```

第四阶段：形成一键部署

```text
deploy_frontend.sh
deploy_backend.sh
rollback_frontend.sh
rollback_backend.sh
```

第五阶段：上线前规范化

```text
域名
HTTPS
数据库备份
日志轮转
错误监控
接口鉴权
防刷和限流
正式支付安全
```

## 协作纪律

每次开始工作前：

```bash
git pull --ff-only origin main
```

每次结束工作后：

```bash
git status -sb
git add .
git commit -m "清晰描述本次改动"
git push origin main
```

如果同一个文件两个人都要改，先沟通。尤其是这些文件：

```text
MainScene.scene
大型 Prefab
核心 Config
网络接口封装
公共资源图集
```

多人协作时，最容易冲突的是 Cocos 的 `.scene`、`.prefab`、`.meta` 文件。改这些文件前最好确认另一个人没有同时改。

## 当前最重要的约定

1. 前端继续以 `C:\Users\34158\Desktop\game\Qv1.3` 为主工程。
2. 前端源代码同步到 `duxiachuan-qv1.3`。
3. 后端源代码同步到 `duxiachuan-server`。
4. 服务器新项目只放 `/home/ubuntu/duxiachuan`。
5. 不要污染现有 `/home/ubuntu/bigxianxia-java`。
6. 服务器私钥不进项目、不进 GitHub。
7. 手机测试看的是服务器构建产物，不是 GitHub 页面。
8. 每次部署必须知道对应的 Git commit。

