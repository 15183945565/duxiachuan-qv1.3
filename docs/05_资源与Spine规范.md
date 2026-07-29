# 资源与 Spine 规范

## 图片

- PNG 保留透明通道，禁止将预览底色烘焙进资源。
- 固定分辨率页面以 `750 x 1624` 为设计基准。
- 可拉伸底框必须设置九宫格边距，禁止直接非等比拉长装饰角。
- 同一功能资源放在同一目录，例如 `Texture/UI/Mail`。
- 正式资源不得使用 `preview`、`temp`、`new`、`final2` 等名称。

## Spine

- 导出版本：Spine `3.8.75`。
- Cocos：Creator `3.8.8`。
- 每套资源至少包含 skeleton JSON/SKEL、atlas、PNG 及完整 meta。
- atlas 页名必须和实际 PNG 文件名一致。
- 不要同时保留两套同名角色资源；正式角色只使用 `Spine/Role`。
- 替换 Spine 时尽量保留资源路径和 meta UUID，避免场景丢引用。

## 动画命名兼容

- 待机优先：`stand2 / stand1 / stand / idle`。
- 行走优先：`run / walk / move`。
- 普攻优先：`action1 / attack`。
- 受伤优先：`hurt / hit / damage`。

若美术导出名称不同，应在 `HomeConfig.ts` 的候选数组中集中添加，不要散落硬编码。

## 资源删除

删除前必须同时确认：

1. 代码不存在动态资源路径引用。
2. Scene/Prefab 不存在 meta UUID 引用。
3. 删除资源本体及其 `.meta`。
4. 重新运行场景 UUID 审计并在 Creator 中重新导入。
