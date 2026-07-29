# 独侠传 Qv1.3

面向后端联调与继续开发的 Cocos Creator `3.8.8` 前端工程。当前 Qv1.3 已完成节点分层、Home Prefab 化、五层继承解除、资源生命周期治理和九个功能 Asset Bundle 拆分，可作为后续开发与交付的唯一工程基线。

## 打开项目

1. 使用 Cocos Creator `3.8.8` 导入本目录。
2. 等待 Creator 首次生成 `library`、`temp` 和 `profiles`。
3. 启动场景：`assets/Scene/LoadingScene.scene`。
4. 主场景：`assets/Scene/MainScene.scene`。

首次导入重新生成缓存属于正常现象。`build/library/temp/profiles` 均不属于源码交付内容。

## 项目入口

- 场景与固定 UI：`assets/Scene`
- 共享资源包：`assets/Res`，Bundle 名为 `res`
- 功能资源包：`assets/Bundle/Feature*`
- Home 编辑器 Prefab：`assets/Bundle/UIHome`
- 前端代码：`assets/Script`
- 后端接口边界：`assets/Script/Services/Backend`
- 交接说明：`docs`
- 只读检查工具：`tools`

## 交接文档

- [项目交接总览](docs/00_项目交接总览.md)
- [项目结构与编码规范](docs/01_项目结构与编码规范.md)
- [后端接入说明](docs/02_后端接入说明.md)
- [Cocos 编辑器节点说明](docs/03_Cocos编辑器节点说明.md)
- [前端完成度与待办](docs/04_前端完成度与待办.md)
- [资源与 Spine 规范](docs/05_资源与Spine规范.md)
- [验证与发布](docs/06_验证与发布.md)
- [Qv1.3 清理与验收记录](docs/07_Qv1.3清理与验收记录.md)
- [Qv1.3 架构整改与交付记录](docs/09_Qv1.3架构整改与交付记录.md)
- [后端联调交付清单](docs/10_后端联调交付清单.md)
- [Qv1.3 后续开发详细说明](docs/11_Qv1.3后续开发详细说明.md)
- [玩家完整流程与接口需求表](docs/12_玩家完整流程与接口需求表.md)
- [分享与道友开发说明](docs/13_分享与道友开发说明.md)

## 一键校验

```powershell
npm run check:all
```

正式 Web Mobile 构建参数位于 `tools/build-config/web-mobile.release.json`。构建后执行：

```powershell
npm run check:delivery:release
```

正式业务数据统一从 `assets/Script/Services/Backend` 接入。当前接口层是联调骨架，页面仍有本地演示真值；未完成 `docs/10_后端联调交付清单.md` 的 P0 项目前，不能把它标记为线上联调完成版。
