# Cocos AI Game Studio 平台开发规划

更新时间：2026-08-05

用途：后续换新窗口、新进程继续开发这个新产品方向时，先读本文件。本文件不是当前 `Qv1.3` 游戏本体的需求，而是一个新产品：面向 Cocos 2D 游戏开发的 AI 游戏工作室网页平台。

## 1. 一句话定位

做一个专门适配 Cocos Creator 2D 游戏开发的 AI 游戏工作室网页平台。用户进入平台后，不是直接让 AI 写代码，而是像拥有一支小型 Cocos 游戏开发公司：策划、美术、UI、前端、后端、数值、测试、运维都有对应工作台和 AI 员工，用户可以用中文参与、验收、修改和派工，并按任务选择不同能力、不同价格的 AI 模型。

平台核心不是“聊天生成代码”，也不是“普通生图网站”，而是：

```txt
把 Cocos 游戏开发全流程变成中文、可视化、可派工、可验收、可导出、可检查、可持续迭代的网页工作室。
```

我们的差异化：

```txt
其他 AI 游戏工具偏生成素材或想法；
我们要做 Cocos 游戏全流程生产 + 多 AI 调度 + 中文可视化编辑 + Cocos 工程落地。
```

## 2. 产品身份

暂定产品名：

```txt
Cocos AI Game Studio
灵构 AI Cocos 游戏工作室
```

用户看到的不是一个单薄的 Prompt 输入框，而是一个工作室：

- 制作人：看项目、预算、进度、风险和版本。
- 策划：写玩法、系统、文案、任务和配置。
- 数值：做公式、战斗模拟、经济消耗、掉落和排行奖励。
- 美术：生成角色、地图、图标、UI 装饰、特效和风格板。
- UI/UX：像 Figma 一样生成和编辑游戏页面。
- 前端：生成 Cocos 节点树、Prefab 方案、TypeScript 脚本和资源引用。
- 后端：生成接口字段、DTO、数据真值、联调说明和管理后台需求。
- 测试：跑流程、截图对比、资源完整性、节点完整性和构建检查。
- 运维：管理构建、环境、版本、发布包、配置和监控。

用户可以只做老板或制作人，也可以深入任意岗位亲自调整。

## 3. 当前判断

这个方向有商业价值，但第一阶段必须收窄。不要把 MVP 做成“万能游戏生成器”，而要先跑通一条能落地的生产链。

第一阶段不要承诺：

- 一键生成完整商业游戏。
- 任意项目全自动理解并重构。
- 全自动生成任意 Spine 骨骼、动作和权重。
- 无限模型包月随便用。
- 直接替代专业策划、美术、程序和测试。

第一阶段应该做到：

- 创建一个 Cocos 游戏项目工作室。
- 按岗位拆分任务和产物。
- 用户可选择不同 AI 模型执行任务。
- 支持文本、图片、音频、代码、数值、视觉页面等多类 AI。
- 能扫描 Cocos 项目并生成中文可视化地图。
- 能生成 Cocos 可落地的页面方案、资源清单、节点树、脚本方案和检查报告。
- 能把产物进入“待验收、待修改、可导出、已落地”的流程。

## 4. 参考产品吸收

参考图中可以吸收的结构：

- 左侧按职能拆分：界面、地图、角色、图标、特效、标志、数值、音乐。
- 中间是工作区：对话、画布、表格、公式节点、素材预览、模拟验证。
- 右侧是产物库：生成中、可选版本、缩略图、进度、历史记录。
- 数值不是纯文本，而是公式节点、参数表和模拟验证。
- 美术不是只出图，还要能进入 UI 页面、图标库、角色库和 Cocos 资源目录。
- 生成不是终点，后面还要验收、修改、测试、导出和版本管理。

我们要在此基础上强化 Cocos 落地：

- 识别 `.scene/.prefab/.meta/.ts`。
- 保留 UUID、meta 和 Bundle 关系。
- 生成中文页面地图和节点别名。
- 标出哪些东西能在 Cocos 编辑器改，哪些会被运行时代码覆盖。
- 输出 Cocos 可执行的检查报告。
- 产物最终进入 Cocos 工程，而不是停留在网页素材库。

## 5. 用户主流程

用户的第一条完整链路应该是：

```txt
创建项目
-> 选择游戏类型和目标平台
-> 选择工作室模板
-> 生成策划案和功能清单
-> 拆成岗位任务
-> 给每个任务选择 AI
-> 生成美术/数值/UI/代码/接口/测试产物
-> 用户验收和修改
-> Cocos 工程扫描与映射
-> 导出到 Cocos
-> 运行检查
-> 生成下一轮任务
```

平台要让用户始终知道三件事：

1. 现在这个任务属于哪个岗位。
2. 当前产物能不能进入 Cocos。
3. 继续生成、修改、验收、导出分别要花多少钱。

## 6. 工作室岗位模块

### 6.1 制作人工作台

负责项目总览：

- 项目名称、类型、风格、目标平台。
- 总任务进度。
- AI 消耗预算。
- 当前风险。
- 最近导出记录。
- 当前 Cocos 工程健康度。
- 哪些产物已验收、哪些还只是草案。

制作人视角要像管理一个小团队，而不是操作复杂 IDE。

### 6.2 策划工作台

负责把想法变成可拆解需求：

- 世界观。
- 核心玩法循环。
- 系统拆分。
- 页面清单。
- 道具、装备、角色、怪物、任务。
- 文案、公告、活动、引导。
- 配置表草案。
- 后端字段需求。

输出必须结构化，不能只是一大段文案。

示例输出：

```txt
游戏类型：修仙放置
核心循环：挂机收益 -> 装备养成 -> 战力提升 -> 挑战关卡 -> 解锁系统
首批页面：登录、创建角色、主界面、背包、角色、商城、战斗、排行
首批配置：物品表、装备表、怪物表、关卡表、掉落表、商城表
```

### 6.3 美术工作台

负责视觉资产生产：

- 风格锁定。
- 角色立绘。
- 怪物。
- 地图。
- 图标。
- UI 底框、按钮、弹窗、页签。
- 特效参考。
- Spine 换皮素材。
- 多版本对比。

美术产物要进入资产库，并记录：

- 生成模型。
- Prompt。
- 成本。
- 授权和使用备注。
- 推荐 Cocos 目录。
- 是否需要切图、九宫格、透明背景、压缩。

### 6.4 UI/UX 工作台

负责游戏页面设计，目标是类似 Figma 的页面画布，但专门服务 Cocos 2D：

- 页面列表。
- 画布尺寸和安全区。
- UI 组件库。
- 页面布局。
- 弹窗布局。
- 列表模板。
- 按钮状态。
- 页面跳转。
- 可导出 Cocos 节点树。

不要只生成漂亮图，要生成页面结构：

```txt
ShopPanel
  Background
  Header
    Title
    CloseButton
  ShopMallTabsRoot
    ShopMallTabYuanbao
    ShopMallTabPoints
  ShopGridRoot
    ShopItemTemplate
```

### 6.5 前端 Cocos 工作台

负责把设计落地到 Cocos：

- `.scene/.prefab` 扫描。
- 节点树解析。
- 组件解析。
- 脚本引用。
- 资源引用。
- Bundle 归属。
- 动态加载路径。
- Prefab 生成方案。
- TypeScript 逻辑方案。
- 导出补丁。

第一版尽量先做只读扫描和方案生成，写回 Cocos 时必须可预览、可确认、可回滚。

### 6.6 后端工作台

负责游戏数据真值和联调：

- API 清单。
- DTO 字段。
- 登录、账号、角色、货币、背包、商城、战斗结算、排行。
- Mock 数据。
- 本地预览后端。
- 远端联调说明。
- 管理后台需求。

后端工作台要和前端页面绑定：

```txt
页面：商城
前端字段：price、currencyType、stock、limit
后端接口：GET /shop/items、POST /shop/buy
真值归属：价格和扣费以后端为准
```

### 6.7 数值工作台

负责公式、参数、模拟和验证：

- 战力公式。
- 生命、攻击、防御。
- 成长曲线。
- 掉落概率。
- 商城价格。
- 经济消耗。
- 排行奖励。
- 冷却时间。
- 关卡难度。
- 战斗模拟。

参考图里的数值公式节点很重要。我们也要做公式模式和模拟模式：

```txt
公式模式：编辑输入、输出、公式、依赖和参数表。
模拟模式：用角色、怪物、技能和装备跑战斗验证。
```

第一版目标不是做完整战斗引擎，而是能让用户用节点方式看懂：

```txt
角色等级 + 装备攻击 + 技能倍率 -> 总攻击
怪物生命 + 防御减免 + 回合数 -> 战斗结果
```

### 6.8 测试工作台

负责把产物变成可验收结果：

- 资源完整性检查。
- `.meta` 配对检查。
- UUID 引用检查。
- 节点路径检查。
- 必要组件检查。
- BlockInputEvents 检查。
- ScrollView 配置检查。
- 动态资源路径检查。
- 页面截图对比。
- 试玩流程记录。

`Qv1.3/tools` 里已有的一批审计脚本是第一版测试工作台的重要基础。

### 6.9 运维工作台

负责构建和交付：

- Web Mobile 构建配置。
- Android/iOS 构建说明。
- 环境配置。
- CDN 和资源版本。
- 发布包记录。
- 回滚记录。
- 运行日志。
- 线上配置表。

第一版可以先做“构建清单 + 发布检查”，后续再做真实部署自动化。

## 7. 多 AI 模型市场

平台必须支持多类 AI，不只 GPT/Claude。

### 7.1 模型类型

| 类型 | 用途 |
| --- | --- |
| 文本推理模型 | 策划、需求拆分、代码方案、测试用例、中文解释 |
| 代码模型 | TypeScript、Cocos 脚本、工具脚本、接口代码 |
| 生图模型 | UI 背景、角色、怪物、图标、地图、特效参考 |
| 图像理解模型 | 拆参考图、识别 UI 元素、分析截图问题 |
| 音频模型 | BGM、按钮音效、战斗音效、环境音 |
| 视频/动效模型 | 技能特效参考、UI 动效参考、宣传素材 |
| 设计模型 | 页面布局、组件库、Figma 风格画布 |
| 数值引擎 | 公式推导、平衡性模拟、经济曲线 |
| 测试模型 | 自动写测试、分析报错、生成验收清单 |

### 7.2 模型选择原则

每个任务都要能让用户选：

- 快速便宜：出草稿。
- 平衡档：可直接评审。
- 高质量：用于最终资源或关键代码。
- 自带 Key：专业团队自己承担模型成本。
- 平台额度：新手低门槛使用。

任务开始前必须显示：

- 预计价格。
- 预计耗时。
- 输出类型。
- 是否会写入项目。
- 是否需要人工确认。

### 7.3 模型路由

平台要有一个统一的模型路由层：

```ts
interface ModelOption {
    id: string;
    provider: string;
    displayName: string;
    taskTypes: AgentTaskType[];
    qualityLevel: 'draft' | 'standard' | 'premium';
    priceMode: 'platform-credit' | 'byok' | 'free-local';
    estimatedUnitCost: number;
    supportsImageInput: boolean;
    supportsStructuredOutput: boolean;
}
```

模型不是散落在页面里的按钮，而是被岗位任务调用。

## 8. Cocos 中文可视化能力

这是平台的核心壁垒之一。

真实 Cocos 项目里常见问题：

```txt
节点英文
脚本英文
资源名英文
Prefab 很多
Bundle 很多
层级很深
运行时动态生成节点
非原作者不知道哪里能改
```

平台要把这些内容转成中文、流程化、可编辑的地图。

### 8.1 中文页面地图

示例：

```txt
主界面
  顶部货币栏
    元宝
    积分
    兑换按钮
  底部导航
    角色
    背包
    征战
    魔界
    兽卡
  弹窗
    邮件
    集市
    排行
```

同时保留技术路径：

```txt
Canvas/MainRoot/HudLayer/TopHud/BtnCurrencyExchange
```

默认给策划、美术和老板看中文；程序和高级用户展开后看 Cocos 真实路径。

### 8.2 中文别名系统

项目扫描后生成别名表：

```ts
interface CocosNodeAlias {
    nodePath: string;
    englishName: string;
    chineseName: string;
    description: string;
    pageName: string;
    ownerRole: 'planner' | 'artist' | 'ui' | 'frontend' | 'backend' | 'tester';
    editable: boolean;
    runtimeMayOverride: boolean;
}
```

示例：

```json
{
  "nodePath": "ShopPanel/ShopMallTabsRoot/ShopMallTabPoints",
  "englishName": "ShopMallTabPoints",
  "chineseName": "积分商城页签",
  "description": "商城底部右侧页签，点击后显示积分购买元宝的商品列表",
  "pageName": "商城页面",
  "ownerRole": "ui",
  "editable": true,
  "runtimeMayOverride": true
}
```

### 8.3 中文问答式开发

用户可以问：

```txt
积分商城在哪里改？
江湖逃杀排行榜第 1 行在哪里改？
为什么我编辑器改了启动后没变化？
这个按钮为什么没有点击音效？
哪个节点负责防止点穿？
这个页面对应哪个后端接口？
```

平台回答要包含：

- 中文名称。
- Cocos 节点路径。
- 所属页面。
- 对应脚本。
- 对应资源。
- 是否运行时覆盖。
- 应该让哪个岗位处理。
- 是否能自动生成修复任务。

## 9. MVP 目标

MVP 不追求完整游戏自动生成，而是跑通“AI 工作室 + Cocos 落地”的最小闭环。

MVP 名称：

```txt
Cocos AI Game Studio MVP
```

MVP 交付标准：

```txt
用户能在网页里创建一个游戏项目，按岗位生成和验收首批策划、美术、数值、UI、前端方案，并扫描一个 Cocos 工程，把页面、节点、资源和检查报告用中文展示出来。
```

### 9.1 MVP 必做

1. 项目创建：游戏名称、类型、风格、目标平台。
2. 工作室首页：制作人总览、任务进度、预算、最近产物。
3. 岗位导航：策划、美术、UI、前端、后端、数值、测试。
4. AI 模型选择：至少做模型配置和价格展示的抽象，不必一开始接入所有模型。
5. 策划生成：生成结构化游戏设计案和页面清单。
6. 美术生成记录：支持图片模型产物进入素材库。
7. UI 页面方案：生成页面结构、组件清单和 Cocos 节点树草案。
8. 数值公式：做一个公式节点编辑和模拟页面。
9. Cocos 扫描器：扫描 `Qv1.3` 这种 Creator 3.8.x 工程。
10. 中文项目地图：把 Scene、Prefab、页面、节点、资源翻译成中文说明。
11. 检查报告：资源 meta、UUID、节点路径、Bundle、动态资源路径。
12. 导出预览：显示将要生成或修改哪些 Cocos 文件，先不强行写回。

### 9.2 MVP 暂不做

- 完整多人协作权限。
- 完整计费系统。
- 自动写回复杂 Prefab。
- 自动生成完整 Spine。
- 自动部署线上服务器。
- 任意 Cocos 旧项目全兼容。

## 10. 第一阶段样本策略

第一阶段以本机这些项目作为样本：

| 项目 | 版本/形态 | 用途 |
| --- | --- | --- |
| `Qv1.3` | Cocos Creator 3.8.8 原生 UI/Prefab/TS | MVP 主样本 |
| `江湖大侠全套源码` | Cocos Creator 3.8.1 + fairygui-cc | 第二阶段 FairyGUI 样本 |
| `逍遥仙剑传` | Cocos Creator 2.4.13 JS 旧工程 | 旧版本兼容样本 |
| `百恋成仙H5源码` | Cocos 2.4.10 + FairyGUI + 大量配置表 | 商业复杂度参考 |

兼容顺序：

1. Creator 3.8.x 原生 Cocos UI。
2. Creator 3.8.x + FairyGUI。
3. Creator 2.4.x 旧工程。
4. 大型商业工程配置表和服务端协作。

## 11. 第一版页面结构

建议首屏不是营销页，而是工作台：

```txt
顶部：项目名 / 版本 / 当前预算 / 模型额度 / 导出状态
左侧：工作室岗位导航
中间：当前岗位工作区
右侧：产物库 / 模型选择 / 检查结果
底部：任务输入 / 附件 / 生成按钮 / 预计成本
```

岗位导航示例：

```txt
制作人
策划
美术
界面
地图
角色
图标
特效
标志
数值
音乐
前端
后端
测试
运维
```

第一版可以先把“前端”和“Cocos 工程”做成一个重点频道。

## 12. 技术架构建议

### 12.1 前端

```txt
Next.js / React
TypeScript
React Flow 或类似库做工作流和数值节点
Canvas/SVG 做页面结构预览
Tailwind 或自研 UI
```

前端核心页面：

- 工作室首页。
- 项目创建。
- 策划工作台。
- 美术资产库。
- UI 页面画布。
- 数值公式画布。
- Cocos 工程地图。
- 检查报告。
- 模型市场。
- 导出记录。

### 12.2 后端

```txt
Node.js / NestJS 或 Fastify
PostgreSQL
Redis
对象存储
队列任务
模型路由服务
```

后端模块：

- 用户和项目。
- 工作室岗位。
- 任务和产物。
- 模型路由。
- 成本预估。
- 文件上传。
- Cocos 项目扫描。
- 检查报告。
- 导出预览。
- 生成历史。

### 12.3 Cocos 项目处理

独立包：

```txt
packages/cocos-analyzer
packages/cocos-checker
packages/cocos-writer
```

`cocos-analyzer` 负责：

- 读取 `.scene/.prefab` JSON。
- 解析节点树。
- 解析组件。
- 解析 UUID 和 `.meta`。
- 找脚本引用。
- 找动态资源路径。
- 识别 Bundle。
- 生成中文页面地图基础数据。

`cocos-checker` 负责：

- meta 配对。
- UUID 完整性。
- Spine 三件套。
- 动态资源路径。
- 必要节点。
- UI 阻挡点穿。
- ScrollView 设置。
- Bundle 边界。

`cocos-writer` 负责：

- 生成导出预览。
- 生成补丁。
- 生成新文件。
- 写入前备份。
- 写入后检查。

第一阶段 `writer` 只做预览和简单文件导出，不直接重写复杂 Prefab。

## 13. 数据结构草案

### 13.1 项目

```ts
interface GameProject {
    id: string;
    name: string;
    genre: 'xiuxian' | 'card' | 'idle' | 'rpg' | 'tower-defense' | 'merge' | 'custom';
    engine: 'cocos-creator';
    engineVersion?: string;
    targetPlatforms: Array<'web-mobile' | 'android' | 'ios' | 'wechat' | 'desktop'>;
    artStyle: string;
    rootPath?: string;
    createdAt: string;
}
```

### 13.2 岗位任务

```ts
type StudioRole =
    | 'producer'
    | 'planner'
    | 'artist'
    | 'ui'
    | 'frontend'
    | 'backend'
    | 'numeric'
    | 'tester'
    | 'ops';

interface StudioTask {
    id: string;
    projectId: string;
    role: StudioRole;
    title: string;
    prompt: string;
    status: 'draft' | 'queued' | 'running' | 'review' | 'approved' | 'exported' | 'failed';
    modelId?: string;
    estimatedCost?: number;
    actualCost?: number;
    artifactIds: string[];
}
```

### 13.3 产物

```ts
interface StudioArtifact {
    id: string;
    projectId: string;
    taskId: string;
    type:
        | 'design-doc'
        | 'image'
        | 'audio'
        | 'ui-layout'
        | 'cocos-node-tree'
        | 'typescript-plan'
        | 'config-table'
        | 'formula-graph'
        | 'test-report'
        | 'export-plan';
    title: string;
    status: 'generated' | 'reviewed' | 'approved' | 'rejected' | 'exported';
    storagePath?: string;
    structuredData?: unknown;
    createdAt: string;
}
```

### 13.4 Cocos 页面节点

```ts
interface CocosPageNode {
    id: string;
    projectId: string;
    name: string;
    chineseName: string;
    type: 'scene' | 'page' | 'popup' | 'component' | 'runtime-template';
    cocosPath: string;
    sourceFile: string;
    scriptPaths: string[];
    assetPaths: string[];
    editable: boolean;
    runtimeMayOverride: boolean;
}
```

### 13.5 数值公式

```ts
interface FormulaGraph {
    id: string;
    projectId: string;
    name: string;
    nodes: FormulaNode[];
    edges: FormulaEdge[];
    simulationCases: SimulationCase[];
}

interface FormulaNode {
    id: string;
    name: string;
    type: 'input' | 'constant' | 'formula' | 'table-lookup' | 'output';
    expression?: string;
    valueType: 'number' | 'integer' | 'percent' | 'boolean' | 'string';
}
```

## 14. 商业模式

建议同时支持平台费和 AI 使用费。

### 14.1 平台费

- 个人版。
- 小团队版。
- 工作室版。
- 企业私有部署版。

平台费包含：

- 项目管理。
- 工作室工作流。
- 基础 Cocos 扫描。
- 中文可视化。
- 产物库。
- 历史记录。
- 少量 AI 额度。

### 14.2 AI 使用费

按点数或实际模型成本计费：

- 文本推理。
- 代码生成。
- 生图。
- 图像理解。
- 音频生成。
- 视频/动效生成。
- 数值模拟。
- 测试分析。

支持两种模式：

```txt
平台额度：新手简单使用。
BYOK：专业团队填写自己的 API Key，平台收工具费。
```

## 15. 成本控制

必须做：

- 每次生成前预估费用。
- 低价草稿和高价精品分层。
- 大任务必须确认。
- 图片、音频、视频先低成本草稿，再高清确认。
- 每个任务最大 token、图片数、音频时长限制。
- 失败重试次数限制。
- 上游价格放配置表，不写死在代码里。
- 每个项目有预算上限。
- 每个岗位有消耗统计。

## 16. 最大风险

| 风险 | 处理 |
| --- | --- |
| 做成普通 AI 套壳 | 用工作室岗位、任务、产物、验收和 Cocos 导出拉开差异 |
| 只生成素材不能落地 | 每个产物都要有 Cocos 目录、用途、检查和导出状态 |
| 模型太多导致混乱 | 统一模型路由，按任务推荐模型 |
| 生成成本不可控 | 草稿/标准/精品分层，生成前报价 |
| Cocos 写回破坏工程 | 第一阶段只读扫描和导出预览，写回必须备份和检查 |
| 用户看不懂 Cocos | 中文页面地图、节点别名、岗位归属和可编辑提示 |
| 数值结果不可信 | 公式节点、模拟用例、对比报告和版本记录 |
| FairyGUI/旧工程差异大 | 先 Creator 3.8.x 原生 UI，再分阶段兼容 |

## 17. 开发顺序建议

### 第一批：平台骨架和 Cocos 扫描

1. 新建独立 Web 项目，不放进 `Qv1.3` 游戏目录。
2. 搭工作室首页和岗位导航。
3. 做项目创建流程。
4. 做模型配置和任务成本展示的静态版本。
5. 做 `cocos-analyzer`，只读扫描 `Qv1.3`。
6. 输出 `project-map.json`。
7. 做中文 Cocos 页面地图。
8. 做检查报告页面。

### 第二批：岗位工作流和产物库

1. 策划工作台：生成结构化游戏设计案。
2. 美术工作台：接入至少一个生图模型或先做模拟模型接口。
3. UI 工作台：生成页面结构和 Cocos 节点树方案。
4. 数值工作台：公式节点和简单模拟。
5. 产物库：草稿、待验收、已通过、可导出。

### 第三批：Cocos 落地

1. 导出预览。
2. 生成 TypeScript 方案。
3. 生成资源目录建议。
4. 简单脚本文件导出。
5. Prefab 写回研究。
6. 写入后运行检查。

### 第四批：高级能力

1. FairyGUI 项目理解。
2. 旧版 Creator 2.4.x 兼容。
3. 音频生成。
4. Spine 固定骨骼换皮。
5. 在线 Cocos 预览。
6. 团队协作和计费。
7. 构建发布和运维自动化。

## 18. 下一步具体执行

建议下一步开始搭第一版独立项目：

```txt
C:\Users\34158\Desktop\灵构AI\cocos-ai-game-studio
```

第一天目标：

1. 初始化 Web 项目。
2. 做工作室首页。
3. 做左侧岗位导航。
4. 做“项目创建”表单。
5. 做“Cocos 工程扫描”入口。
6. 写 `packages/cocos-analyzer` 的第一版 CLI。
7. 用 `Qv1.3` 跑出第一份 `project-map.json`。

第一版不要急着接真实付费模型。先把“任务、岗位、产物、模型选择、Cocos 扫描、中文地图”这个骨架搭住。

## 19. 后续新窗口启动提示词

后续换窗口时，可以直接发：

```txt
先阅读 C:\Users\34158\Desktop\game\Qv1.3\docs\22_Cocos游戏Agent平台开发思路.md。
我们现在要开发一个新的 Cocos AI Game Studio 网页平台，不是在 Qv1.3 游戏本体里继续加页面。
这个平台不是普通代码生成器，而是一个模拟小型 Cocos 游戏开发公司的 AI 工作室：策划、美术、UI、前端、后端、数值、测试、运维都有岗位工作流，用户可以选择不同价位和能力的 AI 来生成、验收、修改和落地 Cocos 游戏全流程产物。
请先按文档搭建第一版独立 Web 项目和 cocos-analyzer，只读扫描 Qv1.3 并生成中文 Cocos 项目地图。
```

## 20. 当前结论

这个方向可以做，但核心必须从“AI 帮我生成代码”升级为：

```txt
AI 工作室帮用户组织 Cocos 游戏生产。
```

第一阶段的胜负手不是模型数量，而是：

```txt
岗位工作流清晰
产物能验收
Cocos 能看懂
中文能编辑
成本能预估
导出能检查
```

只要能把“想法 -> 策划 -> 美术 -> UI -> 数值 -> 前端 -> 后端 -> 测试 -> 导出到 Cocos”这条链路跑通，就不是普通 AI 套壳，而是有壁垒的 Cocos 游戏开发平台。
