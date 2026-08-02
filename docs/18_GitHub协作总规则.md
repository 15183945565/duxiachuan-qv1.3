# GitHub 协作总规则

本文档是前端、后端共同遵守的总规则。当前阶段采用的模式是：前端工程放在 GitHub，后端同学拉取前端到她本地联调，必要时修改前端接口相关代码，再推回 GitHub；你再从 GitHub 拉取最新前端继续开发。

更新时间：2026-08-01

## 当前协作模式

```text
你本地修改 Cocos 前端
-> 你 push 到 GitHub
-> 后端同学 pull 到她本地
-> 后端同学本地联调后端，必要时修改前端接口层
-> 后端同学 push 到 GitHub
-> 你 pull 回本地
-> 继续下一轮前端开发
```

当前阶段暂时不要求你这台电脑直接操作服务器。最终服务器部署由后端同学负责。

## 仓库约定

前端仓库：

```text
https://github.com/15183945565/duxiachuan-qv1.3.git
```

后端仓库：

```text
https://github.com/15183945565/duxiachuan-server.git
```

GitHub 是唯一同步源头。不要用微信、QQ、压缩包来回覆盖完整工程。

## 开始工作前

每个人开始改代码前，先执行：

```bash
git pull --ff-only origin main
git status -sb
```

如果本地有未提交改动，不要直接 pull。先确认这些改动是否要提交、备份或放弃。

## 结束工作后

每次改完后：

```bash
git status -sb
git add .
git commit -m "清晰描述本次修改"
git push origin main
```

提交信息建议：

```text
ui: 调整道友页面布局
fix: 修复分享任务进度条显示
net: 接入玩家信息接口
docs: 更新协作规则
```

## 分工边界

你主要负责：

```text
Cocos 前端工程
UI 页面
Prefab
场景
资源整理
前端交互
前端 Mock
前端文档
```

后端同学主要负责：

```text
Spring Boot 后端
数据库
接口实现
WebSocket
服务器部署
接口联调
必要的前端接口层调整
```

共同负责：

```text
接口文档
字段定义
错误码
Mock 与真实数据对齐
联调问题定位
```

## 禁止事项

禁止：

```text
不 pull 最新就直接改
不看 status 就 commit
用旧压缩包覆盖 GitHub 最新代码
冲突时无脑全部选自己或对方
提交 Library / Temp / build 缓存
提交服务器私钥
提交数据库密码
提交生产环境 .env
提交后台账号密码
```

## 冲突处理

出现冲突时先停下来确认：

```text
这个文件是谁主要负责
这个文件是 UI 还是接口
哪一边改动应该保留
是否能手工重新应用其中一边改动
```

Cocos 的 `.scene`、`.prefab`、`.meta` 冲突不要随便处理，优先让熟悉该页面的人解决。

## 沟通模板

开始改前端时：

```text
我现在要改【页面名】，会动到【prefab/scene/脚本】。
这段时间先不要改这些文件。
我改完 push 后告诉你。
```

后端开始接接口时：

```text
我现在要接【接口名】，会改【ApiClient/页面脚本】。
我不改 UI prefab。
改完 push 后你拉下来检查。
```

发现问题时：

```text
问题页面：
触发步骤：
期望表现：
实际表现：
怀疑是前端/后端/接口字段/数据问题：
截图或报错：
```

## 最小安全流程

```text
开始前先 pull
改之前说一声
改完先自测
提交信息写清楚
push 后告诉对方
对方 pull 后再继续
```

