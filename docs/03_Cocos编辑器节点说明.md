# Cocos 编辑器节点说明

## 原则

固定页面、关键功能页和关键弹窗都有编辑器 Prefab 根节点。Scene 只保留常驻壳层；运行时挂载对应 Prefab，并只补充列表行、背包格子、战斗怪物、伤害数字和奖励格子等数据驱动内容。

## 屏幕适配

- 项目默认设计分辨率、`LoadingScene/Canvas` 和 `MainScene/Canvas` 统一为 `750 × 1624`。
- 竖屏使用 `Fit Width`（`ResolutionPolicy.FIXED_WIDTH`），不使用会产生四周黑边的 `SHOW_ALL`，也不使用会拉伸画面的 `EXACT_FIT`。
- Canvas 保持 `Align Canvas With Screen` 和全边对齐 Widget。高宽比不同的手机会扩展可见逻辑高度，贴边控件继续使用 Widget 和安全区约束。
- `DisplayAdapter` 在 LoadingScene 和 MainScene 的 UI 初始化前执行，并在窗口或方向变化后重新应用。不要在单个功能脚本里另设一套设计分辨率。
- Android 原生构建仍须在构建面板选择竖屏；Cocos 的 Web 方向 API不会替代 Android 原生方向配置。

## LoadingScene

```text
Canvas
  Camera
  LoadingRoot
    LoadingBg
    LoadingXiake
    SwallowFlightLayer
    LoadingLogo
    LoadingBarBg
    LoadingBarFill
    BtnRepair
    PhoneLoginPanel
      InputPhone
      InputCode
      BtnGetCode
      BtnPhoneLogin
```

## MainScene 顶层

```text
Canvas
  Camera
  MainRoot
    GameSceneLayer
    HudLayer
      TopHud
      LeftDock
      RightDock
      BottomNav
    PageLayer
    PopupLayer
    GuideLayer
    ToastLayer
```

MainScene 中 `PageLayer` 和 `PopupLayer` 保持空容器。不要把功能 Prefab 重新序列化回 MainScene；运行时挂载后，全屏页面必须归 `PageLayer`，遮罩弹窗必须归 `PopupLayer`。

## PageLayer

- `RolePagePanel`：装备、升阶、强化、属性详情和底部页签。
  - 强化页可编辑节点在 `RolePagePanel/RolePageStrengthenPage` 下：`RoleStrengthenMaterial_attack`、`RoleStrengthenMaterial_life`、`RoleStrengthenMaterial_defense`、`RoleStrengthenHint`、`RoleStrengthenStatusRoot`、`RoleStrengthenButton`。
  - `RolePageStrengthenPage` 是叠在装备页上的强化信息层，不要给它加满屏 `BlockInputEvents`，否则会挡住装备槽点击。
- `BagPanel`：背包、分解、合成、图鉴和底部页签。
- `AlliancePanel / DuelPanel / ShowcasePanel`：宗门、对决和展台。
- `BottomFeaturePanel`：魔界与兽卡入口承载页。
- `CharacterCreatePanel`：首次创建角色全屏页。
- `MagicMapPanel / MagicMonsterBattlePanel`：魔界地图和战斗。
- `BattlePanel`：征战入口、战场升级和 `BattleCombatLayer`。
- `ShopPanel`：商城页面。底部页签在 `ShopPanel/ShopMallTabsRoot`，子节点 `ShopMallTabYuanbao` 和 `ShopMallTabPoints` 分别对应 `元宝商城`、`积分商城`；商品可编辑节点在 `ShopGridRoot` 下。

## PopupLayer

- `MailPanel / NoticePanel / RankPanel`：邮件、公告和排行。
- `MarketPanel`：集市。
  - 筛选区在 `MarketPanel/MarketFilterRoot` 下，一级分类是 `MarketCategoryFilter`，二级分类是 `MarketSecondaryFilter`，三级分类是 `MarketTertiaryFilter`。
  - `MarketRefreshButton/MarketRefreshLabel + MarketRefreshIcon` 是刷新入口，`MarketSortFilter` 是价格排序入口，下拉预览行在 `MarketPanel/MarketDropdownLayer/MarketDropdownItem_1..3`，默认关闭，运行时点击筛选会复用这些节点并按选项数量补足。
  - 底部交易/求购按钮在 `MarketPanel/MarketModeButtons/MarketModeTradeButton` 和 `MarketModeRequestButton`；顶部三个标签是同一组 `MarketTabs/MarketTab_buy|sell|history`，交易/求购模式下只切换文字和数据。
  - 出售/求购发布页的加号行在 `MarketListViewport/MarketListContent/MarketSellAddSlot/MarketSellAddButton`；选择物品弹窗在 `MarketSellSelectPopup/MarketSellSelectBoard/MarketSellSelectViewport/MarketSellSelectContent`，格子为 `MarketSellSelectItem_1..8`。
  - 三张截图状态对照：图一购买页显示 `MarketFilterRoot + MarketListContent/MarketListing_1..6`；图二出售页隐藏 `MarketFilterRoot` 和商品列表，只显示 `MarketListContent/MarketSellAddSlot`；图三记录页隐藏 `MarketListContent`，显示 `MarketHistoryContent/MarketHistoryEmpty` 或 `MarketHistory_1`。
- `GiftPanel / SharePanel / ProfilePopup`：礼包、分享和头像资料。
- `ItemDetailPopup / BagIllustrationDetailPopup`：物品详情。
- `ConfirmPopup / RewardPopup / BattleResultPopup`：通用确认、奖励和结算。
- `MagicFloorPanel / BattleRewardPopup`：层数选择和征战奖励。
- `RoleEquipDetailPopup / RoleEquipReplacePopup / RoleProgressSuccessPopup`：角色装备与养成结果。
- `TransitionLoadingLayer`：页面切换加载遮罩。

上述根节点位于 `assets/Bundle/UIHome/Prefabs`，默认可为 inactive。代码会挂载并复用 Prefab，再补充运行时子内容，不会另建同名根节点。

## 可变内容

- 邮件：`MailPanel/MailBoard/MailListRoot` 是邮件列表显示和滑动区域，带 `cc.Mask` 和 `cc.ScrollView`；`MailPanel/MailBoard/MailListRoot/MailListContent` 是 ScrollView 的 Content；`MailRowTemplate` 放在 `MailListContent` 下，作为单条邮件模板。
- 公告：`NoticeScrollContent/NoticeArticleTemplate`。
- 排行：`RankScrollContent/RankRowTemplate`。
- 商城：`ShopGridRoot` 下的商品节点。
- 商城页签：`ShopPanel/ShopMallTabsRoot/ShopMallTabYuanbao`、`ShopPanel/ShopMallTabsRoot/ShopMallTabPoints`。
- 背包、市场、奖励和伤害数字按数据量动态生成。

## 编辑注意

- 修改后保存 Scene，再启动预览。
- 不要随意改代码依赖的节点名。
- 位置修改使用 Node Position，尺寸修改使用 UITransform Content Size。
- 图片替换优先替换 SpriteFrame；Spine 替换需同时核对 JSON、atlas、PNG 和动画名。
- 若运行时与编辑器不同，先搜索脚本中的 `setPosition/setScale/setContentSize`。
- 若编辑器模板文字显示为 `????`，先确认是否是占位或编码问题：Prefab/Scene 里应写真实 UTF-8 中文示例，或用 `\uXXXX` 转义写入；不要让模板保留问号占位再靠运行时替换，否则中文长度可能触发 Label 自适应尺寸，导致启动后和编辑器不一致。
- 处理编辑器模板文字时，运行时代码只刷新 `Label.string`，不要重设模板节点的 Position、Scale、UITransform Content Size、字体和对齐；如果必须换 `string`，先记录并恢复编辑器里的 `UITransform.contentSize`。
- 滑动列表统一按“外层 Viewport/Mask/ScrollView + 内层 Content + 模板 Row”处理。用户要调截图中的可见区域时优先改 Viewport 的位置和尺寸；用户要调单行样式时改模板 Row，不要把模板拖出 Content。

执行 `npm run check:ui` 可校验关键节点的完整父子路径，不只是检查同名节点是否存在；执行 `npm run check:display` 可校验项目、场景和运行时的屏幕适配入口是否一致。

## 邮件领取奖励确认弹窗

截图里标题为“战场产出材料”的确认领取弹窗在：

```txt
assets/Bundle/UIHome/Prefabs/Popup/MailPanel.prefab
MailPanel
  BattleHostMailDetailTemplate
    BattleHostMailDetailDim
    BattleHostMailDetailBoard
      BattleHostMailDetailBoardSkin
      BattleHostMailDetailTitleSkin
      BattleHostMailDetailTitle
      BattleHostMailRewardViewport
        BattleHostMailRewardContent
          BattleHostMailRewardSlot_1..8
      BattleHostMailCancelButton
      BattleHostMailClaimButton
```

`BattleHostMailDetailTemplate` 默认 inactive。需要在编辑器里改这个弹窗时，临时勾上 Active；改完后仍保持默认 inactive。运行时会复用这个模板，只替换标题文本、奖励图标/数量和按钮点击事件，不应覆盖已有节点的位置、尺寸、字体和对齐。
