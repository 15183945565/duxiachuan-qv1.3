import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(import.meta.dirname, '..');

const requirements = {
    'assets/Scene/LoadingScene.scene': [
        'Canvas/Camera',
        'Canvas/LoadingRoot',
        'Canvas/LoadingRoot/LoadingBg',
        'Canvas/LoadingRoot/LoadingXiake',
        'Canvas/LoadingRoot/SwallowFlightLayer',
        'Canvas/LoadingRoot/LoadingLogo',
        'Canvas/LoadingRoot/LoadingBarBg',
        'Canvas/LoadingRoot/LoadingBarFill',
        'Canvas/LoadingRoot/BtnRepair',
        'Canvas/LoadingRoot/PhoneLoginPanel',
        'Canvas/LoadingRoot/PhoneLoginPanel/InputPhone',
        'Canvas/LoadingRoot/PhoneLoginPanel/InputCode',
        'Canvas/LoadingRoot/PhoneLoginPanel/BtnPhoneLogin',
        'Canvas/LoadingRoot/PhoneLoginPanel/BtnGetCode',
        'Canvas/LoadingRoot/BtnEnterGame',
    ],
    'assets/Scene/MainScene.scene': [
        'Canvas/Camera',
        'Canvas/MainRoot',
        'Canvas/MainRoot/GameSceneLayer',
        'Canvas/MainRoot/HudLayer',
        'Canvas/MainRoot/HudLayer/TopHud',
        'Canvas/MainRoot/HudLayer/LeftDock',
        'Canvas/MainRoot/HudLayer/RightDock',
        'Canvas/MainRoot/HudLayer/BottomNav',
        'Canvas/MainRoot/PageLayer',
        'Canvas/MainRoot/PopupLayer',
        'Canvas/MainRoot/GuideLayer',
        'Canvas/MainRoot/ToastLayer',
        'Canvas/MainRoot/ToastLayer/ToastBg',
        'Canvas/MainRoot/ToastLayer/ToastLabel',

        'Canvas/MainRoot/PageLayer/RolePagePanel',
        'Canvas/MainRoot/PageLayer/RolePagePanel/RolePageEquipmentPage',
        'Canvas/MainRoot/PageLayer/RolePagePanel/RolePageAdvancePage',
        'Canvas/MainRoot/PageLayer/RolePagePanel/RolePageStrengthenPage',
        'Canvas/MainRoot/PageLayer/RolePagePanel/RolePageStrengthenPage/RoleStrengthenMaterial_attack',
        'Canvas/MainRoot/PageLayer/RolePagePanel/RolePageStrengthenPage/RoleStrengthenMaterial_life',
        'Canvas/MainRoot/PageLayer/RolePagePanel/RolePageStrengthenPage/RoleStrengthenMaterial_defense',
        'Canvas/MainRoot/PageLayer/RolePagePanel/RolePageStrengthenPage/RoleStrengthenHint',
        'Canvas/MainRoot/PageLayer/RolePagePanel/RolePageStrengthenPage/RoleStrengthenStatusRoot',
        'Canvas/MainRoot/PageLayer/RolePagePanel/RolePageStrengthenPage/RoleStrengthenButton',
        'Canvas/MainRoot/PageLayer/RolePagePanel/RolePageBottomTabs',
        'Canvas/MainRoot/PageLayer/RolePagePanel/RoleAttrDetailPanel',
        'Canvas/MainRoot/PageLayer/BagPanel',
        'Canvas/MainRoot/PageLayer/BagPanel/BagMaterialBoard',
        'Canvas/MainRoot/PageLayer/BagPanel/BagPageBottomTabs',
        'Canvas/MainRoot/PageLayer/BagPanel/BagIllustrationPanel',
        'Canvas/MainRoot/PageLayer/AlliancePanel',
        'Canvas/MainRoot/PageLayer/DuelPanel',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuTopInfoRoot',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuTopInfoRoot/JianghuKillerTimerBg',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuTopInfoRoot/JianghuKillerPrefixLabel',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuTopInfoRoot/JianghuKillerSecondLabel',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuTopInfoRoot/JianghuKillerSuffixLabel',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuTopInfoRoot/JianghuCurrentPeriodBg',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuTopInfoRoot/JianghuCurrentPeriodPrefixLabel',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuTopInfoRoot/JianghuCurrentPeriodNumberLabel',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuTopInfoRoot/JianghuCurrentPeriodSuffixLabel',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuTopInfoRoot/JianghuTopYuanbaoAmountBg',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuTopInfoRoot/JianghuTopYuanbaoIcon',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuTopInfoRoot/JianghuTopYuanbaoAmountLabel',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuActorLayer',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuActorLayer/JianghuPlayerEntryPoint',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuActorLayer/JianghuExitPoint',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuActorLayer/JianghuKillerEntryPoint',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuActorLayer/JianghuLobbyCrowdArea',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuActorLayer/JianghuRoute_StartPoint',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuActorLayer/JianghuRoute_Turn1',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuActorLayer/JianghuRoute_Turn2',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuActorLayer/JianghuRoute_Turn3',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuActorLayer/JianghuRoute_Turn4',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuActorLayer/JianghuRoute_Turn5',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuActorLayer/JianghuRoute_Turn6',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuActorLayer/JianghuRoute_Turn7',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuActorLayer/JianghuRouteDoor_MibaoYouge',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuActorLayer/JianghuRouteDoor_WudaoJingtan',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuActorLayer/JianghuRouteDoor_BingjiaWutang',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuActorLayer/JianghuRouteDoor_XiantingKeshe',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuActorLayer/JianghuRouteDoor_JuyiZunshi',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuTaoshaRooms',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuTaoshaRooms/JianghuRoom_MibaoYouge',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuTaoshaRooms/JianghuRoom_MibaoYouge/JianghuRoomHighlightFrame',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuTaoshaRooms/JianghuRoom_MibaoYouge/JianghuRoomActorArea',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuTaoshaRooms/JianghuRoom_WudaoJingtan',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuTaoshaRooms/JianghuRoom_WudaoJingtan/JianghuRoomHighlightFrame',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuTaoshaRooms/JianghuRoom_WudaoJingtan/JianghuRoomActorArea',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuTaoshaRooms/JianghuRoom_BingjiaWutang',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuTaoshaRooms/JianghuRoom_BingjiaWutang/JianghuRoomHighlightFrame',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuTaoshaRooms/JianghuRoom_BingjiaWutang/JianghuRoomActorArea',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuTaoshaRooms/JianghuRoom_XiantingKeshe',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuTaoshaRooms/JianghuRoom_XiantingKeshe/JianghuRoomHighlightFrame',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuTaoshaRooms/JianghuRoom_XiantingKeshe/JianghuRoomActorArea',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuTaoshaRooms/JianghuRoom_JuyiZunshi',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuTaoshaRooms/JianghuRoom_JuyiZunshi/JianghuRoomHighlightFrame',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuTaoshaRooms/JianghuRoom_JuyiZunshi/JianghuRoomActorArea',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuInvestRoot',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuInvestRoot/JianghuInvestAmountBg',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuInvestRoot/JianghuInvestYuanbaoIcon',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuInvestRoot/JianghuInvestAmountLabel',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuInvestRoot/JianghuInvestAmountSelectButton',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuInvestRoot/JianghuInvestAmountOptions',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuInvestRoot/JianghuInvestAmountOptions/JianghuInvestAmountOption_1',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuInvestRoot/JianghuInvestAmountOptions/JianghuInvestAmountOption_1/JianghuInvestAmountOptionLabel',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuInvestRoot/JianghuInvestAmountOptions/JianghuInvestAmountOption_10',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuInvestRoot/JianghuInvestAmountOptions/JianghuInvestAmountOption_10/JianghuInvestAmountOptionLabel',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuInvestRoot/JianghuInvestAmountOptions/JianghuInvestAmountOption_100',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuInvestRoot/JianghuInvestAmountOptions/JianghuInvestAmountOption_100/JianghuInvestAmountOptionLabel',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuInvestRoot/JianghuInvestAmountInput',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuInvestRoot/BtnJianghuInvestYuanbao',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuInvestRoot/BtnJianghuInvestYuanbao/BtnJianghuInvestYuanbaoLabel',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuKillerAppearBanner',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuKillerAppearBanner/JianghuKillerAppearBoard',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuKillerAppearBanner/JianghuKillerAppearLabel',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuSideButtons',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuSideButtons/BtnJianghuRecord',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuSideButtons/BtnJianghuRank',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRecordPage',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRecordPage/JianghuRecordPageBackground',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRecordPage/JianghuRecordPageTitle',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRecordPage/JianghuRecordHeaderTitleBar',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRecordPage/JianghuRecordHeaderTitleBar/JianghuRecordHeaderTitleLabel',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRecordPage/JianghuRecordMainScroll',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRecordPage/JianghuRecordMainScroll/JianghuRecordMainContent',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRecordPage/JianghuRecordMainScroll/JianghuRecordMainContent/JianghuRecordStatsPanel',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRecordPage/JianghuRecordMainScroll/JianghuRecordMainContent/JianghuRecordStatsPanel/JianghuRecordStatsTitleBar',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRecordPage/JianghuRecordMainScroll/JianghuRecordMainContent/JianghuRecordStatsPanel/JianghuRecordStatsCell_mibao_youge',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRecordPage/JianghuRecordMainScroll/JianghuRecordMainContent/JianghuRecordStatsPanel/JianghuRecordStatsCell_wudao_jingtan',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRecordPage/JianghuRecordMainScroll/JianghuRecordMainContent/JianghuRecordStatsPanel/JianghuRecordStatsCell_bingjia_wutang',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRecordPage/JianghuRecordMainScroll/JianghuRecordMainContent/JianghuRecordStatsPanel/JianghuRecordStatsCell_xianting_keshe',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRecordPage/JianghuRecordMainScroll/JianghuRecordMainContent/JianghuRecordStatsPanel/JianghuRecordStatsCell_juyi_zunshi',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRecordPage/JianghuRecordMainScroll/JianghuRecordMainContent/JianghuRecordRecentPanel',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRecordPage/JianghuRecordMainScroll/JianghuRecordMainContent/JianghuRecordRecentPanel/JianghuRecordRecentTitleBar',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRecordPage/JianghuRecordMainScroll/JianghuRecordMainContent/JianghuRecordRecentPanel/JianghuRecordRecentCell_1',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRecordPage/JianghuRecordMainScroll/JianghuRecordMainContent/JianghuRecordRecentPanel/JianghuRecordRecentCell_2',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRecordPage/JianghuRecordMainScroll/JianghuRecordMainContent/JianghuRecordRecentPanel/JianghuRecordRecentCell_3',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRecordPage/JianghuRecordMainScroll/JianghuRecordMainContent/JianghuRecordRecentPanel/JianghuRecordRecentCell_4',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRecordPage/JianghuRecordMainScroll/JianghuRecordMainContent/JianghuRecordRecentPanel/JianghuRecordRecentCell_5',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRecordPage/JianghuRecordMainScroll/JianghuRecordMainContent/JianghuRecordRecentPanel/JianghuRecordRecentCell_6',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRecordPage/JianghuRecordMainScroll/JianghuRecordMainContent/JianghuRecordRecentPanel/JianghuRecordRecentCell_7',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRecordPage/JianghuRecordMainScroll/JianghuRecordMainContent/JianghuRecordRecentPanel/JianghuRecordRecentCell_8',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRecordPage/JianghuRecordMainScroll/JianghuRecordMainContent/JianghuRecordRecentPanel/JianghuRecordRecentCell_9',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRecordPage/JianghuRecordMainScroll/JianghuRecordMainContent/JianghuRecordRecentPanel/JianghuRecordRecentCell_10',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRecordPage/JianghuRecordMainScroll/JianghuRecordMainContent/JianghuRecordSummaryPanel',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRecordPage/JianghuRecordMainScroll/JianghuRecordMainContent/JianghuRecordSummaryPanel/JianghuRecordSummaryTitleBar',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRecordPage/JianghuRecordMainScroll/JianghuRecordMainContent/JianghuRecordSummaryPanel/JianghuRecordSummaryCell_Invest',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRecordPage/JianghuRecordMainScroll/JianghuRecordMainContent/JianghuRecordSummaryPanel/JianghuRecordSummaryCell_Success',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRecordPage/JianghuRecordMainScroll/JianghuRecordMainContent/JianghuRecordSummaryPanel/JianghuRecordSummaryCell_Reward',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRecordPage/JianghuRecordMainScroll/JianghuRecordMainContent/JianghuRecordPersonalRow_1/JianghuRecordPersonalRow_1StatusLabel',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRankPage',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRankPage/JianghuRankPageTitle',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRankPage/JianghuRankListRows',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRankPage/JianghuRankListRows/JianghuRankListContent',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRankPage/JianghuRankListRows/JianghuRankListContent/JianghuRankRow_4/JianghuRankRow_4DodgeLabel',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRankPage/JianghuRankListRows/JianghuRankListContent/JianghuRankRow_4/JianghuRankRow_4StreakLabel',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRankPage/JianghuRankSelfRow/JianghuRankSelfRowDodgeLabel',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRankPage/JianghuRankSelfRow/JianghuRankSelfRowStreakLabel',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuResultPopup',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuResultPopup/JianghuResultMask',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuResultPopup/JianghuResultBoard',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuResultPopup/JianghuResultTitleLabel',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuResultPopup/JianghuResultModeLabel',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuResultPopup/JianghuResultDescLabel',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuResultPopup/JianghuResultInvestYuanbaoIcon',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuResultPopup/JianghuResultInvestLabel',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuResultPopup/JianghuResultRewardYuanbaoIcon',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuResultPopup/JianghuResultRewardLabel',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiZhengxiongMainPage',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiZhengxiongMainPage/LuanshiZhengxiongTopHud',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiZhengxiongMainPage/LuanshiZhengxiongTopHud/LuanshiZhengxiongPeriodLabel',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiZhengxiongMainPage/LuanshiZhengxiongTimerBg',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiZhengxiongMainPage/LuanshiZhengxiongTimerLabel',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiZhengxiongMainPage/LuanshiOwnedYuanbaoRoot',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiZhengxiongMainPage/LuanshiOwnedYuanbaoRoot/LuanshiOwnedYuanbaoLabel',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiZhengxiongMainPage/LuanshiWudangInvestYuanbaoRoot',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiZhengxiongMainPage/LuanshiWudangInvestYuanbaoRoot/LuanshiWudangInvestYuanbaoLabel',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiZhengxiongMainPage/LuanshiGaibangInvestYuanbaoRoot',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiZhengxiongMainPage/LuanshiGaibangInvestYuanbaoRoot/LuanshiGaibangInvestYuanbaoLabel',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiZhengxiongMainPage/LuanshiZhengxiongRoundStartFxRoot',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiZhengxiongMainPage/LuanshiZhengxiongRoundStartFxRoot/LuanshiZhengxiongDuelIconFx',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiZhengxiongMainPage/LuanshiZhengxiongBottomDock',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiZhengxiongMainPage/LuanshiZhengxiongBottomDock/LuanshiZhengxiongRankButton',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiZhengxiongMainPage/LuanshiZhengxiongBottomDock/LuanshiZhengxiongRecordButton',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiZhengxiongMainPage/LuanshiZhengxiongBottomDock/LuanshiZhengxiongSkillSlots',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiZhengxiongMainPage/LuanshiZhengxiongBottomDock/LuanshiZhengxiongSkillSlots/LuanshiSkillSlot_wanjian_jidi/LuanshiSkillCostLabel_wanjian_jidi',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiZhengxiongMainPage/LuanshiZhengxiongBottomDock/LuanshiZhengxiongSkillSlots/LuanshiSkillSlot_bingjian/LuanshiSkillCostLabel_bingjian',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiZhengxiongMainPage/LuanshiZhengxiongBottomDock/LuanshiZhengxiongSkillSlots/LuanshiSkillSlot_diaozhong/LuanshiSkillCostLabel_diaozhong',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiZhengxiongMainPage/LuanshiZhengxiongBottomDock/LuanshiZhengxiongSkillSlots/LuanshiSkillSlot_taiji/LuanshiSkillCostLabel_taiji',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiZhengxiongMainPage/LuanshiZhengxiongBottomDock/LuanshiZhengxiongSkillSlots/LuanshiSkillSlot_guaishou_mengchong/LuanshiSkillCostLabel_guaishou_mengchong',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiZhengxiongMainPage/LuanshiZhengxiongBottomDock/LuanshiZhengxiongSkillSlots/LuanshiSkillSlot_huoyan_down/LuanshiSkillCostLabel_huoyan_down',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiZhengxiongMainPage/LuanshiZhengxiongBottomDock/LuanshiZhengxiongSkillSlots/LuanshiSkillSlot_hongjian/LuanshiSkillCostLabel_hongjian',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiZhengxiongMainPage/LuanshiZhengxiongBottomDock/LuanshiZhengxiongSkillSlots/LuanshiSkillSlot_lanse_mofa/LuanshiSkillCostLabel_lanse_mofa',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiZhengxiongMainPage/LuanshiZhengxiongBottomDock/LuanshiZhengxiongSkillSlots/LuanshiSkillSlot_ultimate_1/LuanshiSkillCostLabel_ultimate_1',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiZhengxiongMainPage/LuanshiZhengxiongBottomDock/LuanshiZhengxiongSkillSlots/LuanshiSkillSlot_ultimate_2/LuanshiSkillCostLabel_ultimate_2',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiZhengxiongMainPage/LuanshiZhengxiongSkillEffectLayer',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiZhengxiongMainPage/LuanshiZhengxiongSkillEffectLayer/LuanshiUltimateEffect_ultimate_1',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiZhengxiongMainPage/LuanshiZhengxiongSkillEffectLayer/LuanshiUltimateEffect_ultimate_2',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiRecordPage',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiRankPage',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiRankPage/LuanshiRankStreakHeader',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiRankPage/LuanshiRankStreakHeader/LuanshiRankStreakHeaderStreakLabel',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiRankPage/LuanshiRankStreakList',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiRankPage/LuanshiRankStreakList/LuanshiRankStreakRow_1',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiRankPage/LuanshiRankStreakList/LuanshiRankStreakRow_1/LuanshiRankStreakRow_1StreakAmountLabel',
        'Canvas/MainRoot/PageLayer/ShowcasePanel',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot/BeastCardNameLabel',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot/BeastCardSpine',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot/BeastCardBottomFrame',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot/BeastCardBottomNameLabel',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot/BeastCardRewardRoot',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot/BeastCardRewardRoot/BeastCardYuanbaoFrame',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot/BeastCardRewardRoot/BeastCardYuanbaoIcon',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot/BeastCardRewardRoot/BeastCardOutputRecordButton',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot/BeastCardOutputCountdownLabel',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot/BeastCardOutputRateRoot',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot/BeastCardOutputRateRoot/BeastCardOutputRateTitleLabel',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot/BeastCardOutputRateRoot/BeastCardOutputRateValueLabel',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot/BeastCardOutputAmountRoot',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot/BeastCardOutputAmountRoot/BeastCardOutputAmountTitleLabel',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot/BeastCardOutputAmountRoot/BeastCardOutputAmountValueLabel',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot/BeastCardOutputAmountRoot/BeastCardOutputAmountUnitLabel',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot/BeastCardStrengthenButton',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot/BeastCardYuanbaoRateRoot',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot/BeastCardYuanbaoRateRoot/BeastCardYuanbaoRateFrame',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot/BeastCardYuanbaoRateRoot/BeastCardYuanbaoRateIcon',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot/BeastCardYuanbaoRateRoot/BeastCardYuanbaoRateTitle',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot/BeastCardYuanbaoRateRoot/BeastCardYuanbaoRateValue',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot/BeastCardRecordPopup',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot/BeastCardRecordPopup/BeastCardRecordBoard',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot/BeastCardRecordPopup/BeastCardRecordBoard/BeastCardRecordTitleFrame',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot/BeastCardRecordPopup/BeastCardRecordBoard/BeastCardRecordTitleFrame/BeastCardRecordTitle',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot/BeastCardRecordPopup/BeastCardRecordBoard/BeastCardRecordCloseButton',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot/BeastCardRecordPopup/BeastCardRecordBoard/BeastCardRecordList',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot/BeastCardRecordPopup/BeastCardRecordBoard/BeastCardRecordList/BeastCardRecordContent',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot/BeastCardRecordPopup/BeastCardRecordBoard/BeastCardRecordList/BeastCardRecordContent/BeastCardRecordRow_1',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot/BeastCardRecordPopup/BeastCardRecordBoard/BeastCardRecordList/BeastCardRecordContent/BeastCardRecordRow_1/BeastCardRecordRichText',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot/BeastCardRecordPopup/BeastCardRecordBoard/BeastCardRecordList/BeastCardRecordContent/BeastCardRecordRow_1/BeastCardRecordTime',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot/BeastCardRecordPopup/BeastCardRecordBoard/BeastCardRecordList/BeastCardRecordContent/BeastCardRecordRow_1/BeastCardRecordBeastName',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot/BeastCardRecordPopup/BeastCardRecordBoard/BeastCardRecordList/BeastCardRecordContent/BeastCardRecordRow_1/BeastCardRecordOutputText',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot/BeastCardRecordPopup/BeastCardRecordBoard/BeastCardRecordList/BeastCardRecordContent/BeastCardRecordRow_1/BeastCardRecordAmount',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot/BeastCardRecordPopup/BeastCardRecordBoard/BeastCardRecordList/BeastCardRecordContent/BeastCardRecordRow_1/BeastCardRecordDivider',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot/BeastCardPrevButton',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastCardRoot/BeastCardNextButton',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenBackground',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenTitleFrame',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenTitleFrame/BeastStrengthenTitleLabel',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenCurrencyRoot',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenCurrencyRoot/BeastStrengthenYuanbaoIcon',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenCurrencyRoot/BeastStrengthenYuanbaoLabel',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenGemPanel',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenGemPanel/BeastStrengthenCenterEquipFrame',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenGemPanel/BeastStrengthenCenterEquipFrame/BeastStrengthenCenterEquipIcon',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenGemPanel/BeastStrengthenCenterEquipFrame/BeastStrengthenCenterEquipLock',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenGemPanel/BeastStrengthenSelectedEquipName',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenGemPanel/BeastGemSlot_1',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenGemPanel/BeastGemSlot_1/BeastGemSlotPlus',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenGemPanel/BeastGemSlot_1/BeastGemSlotLock',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenGemPanel/BeastGemSlot_1/BeastGemSlotIcon',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenGemPanel/BeastGemSlot_2',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenGemPanel/BeastGemSlot_2/BeastGemSlotPlus',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenGemPanel/BeastGemSlot_2/BeastGemSlotLock',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenGemPanel/BeastGemSlot_2/BeastGemSlotIcon',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenGemPanel/BeastGemSlot_3',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenGemPanel/BeastGemSlot_3/BeastGemSlotPlus',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenGemPanel/BeastGemSlot_3/BeastGemSlotLock',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenGemPanel/BeastGemSlot_3/BeastGemSlotIcon',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenGemPanel/BeastGemSlot_4',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenGemPanel/BeastGemSlot_4/BeastGemSlotPlus',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenGemPanel/BeastGemSlot_4/BeastGemSlotLock',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenGemPanel/BeastGemSlot_4/BeastGemSlotIcon',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenGemPanel/BeastGemSlot_5',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenGemPanel/BeastGemSlot_5/BeastGemSlotPlus',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenGemPanel/BeastGemSlot_5/BeastGemSlotLock',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenGemPanel/BeastGemSlot_5/BeastGemSlotIcon',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenGemPanel/BeastGemSlot_6',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenGemPanel/BeastGemSlot_6/BeastGemSlotPlus',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenGemPanel/BeastGemSlot_6/BeastGemSlotLock',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenGemPanel/BeastGemSlot_6/BeastGemSlotIcon',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenEquipStrip',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenEquipmentSlots',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenEquipmentSlots/BeastEquipSlot_chest',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenEquipmentSlots/BeastEquipSlot_chest/BeastEquipIcon',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenEquipmentSlots/BeastEquipSlot_chest/BeastEquipLock',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenEquipmentSlots/BeastEquipSlot_chest/BeastEquipSelectedFrame',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenEquipmentSlots/BeastEquipSlot_helmet',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenEquipmentSlots/BeastEquipSlot_helmet/BeastEquipIcon',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenEquipmentSlots/BeastEquipSlot_helmet/BeastEquipLock',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenEquipmentSlots/BeastEquipSlot_helmet/BeastEquipSelectedFrame',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenEquipmentSlots/BeastEquipSlot_armor',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenEquipmentSlots/BeastEquipSlot_armor/BeastEquipIcon',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenEquipmentSlots/BeastEquipSlot_armor/BeastEquipLock',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenEquipmentSlots/BeastEquipSlot_armor/BeastEquipSelectedFrame',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenEquipmentSlots/BeastEquipSlot_leg',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenEquipmentSlots/BeastEquipSlot_leg/BeastEquipIcon',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenEquipmentSlots/BeastEquipSlot_leg/BeastEquipLock',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenEquipmentSlots/BeastEquipSlot_leg/BeastEquipSelectedFrame',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenBonusRoot',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenBonusRoot/BeastStrengthenBonusTitle',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenBonusRoot/BeastStrengthenBonusLabel',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenActionButton',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenActionButton/BeastStrengthenActionLabel',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenRemoveGemButton',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastStrengthenRemoveGemButton/BeastStrengthenRemoveGemLabel',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastGemSelectPopup',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastGemSelectPopup/BeastGemSelectMask',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastGemSelectPopup/BeastGemSelectBoard',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastGemSelectPopup/BeastGemSelectBoard/BeastGemSelectTitle',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastGemSelectPopup/BeastGemSelectBoard/BeastGemSelectViewport',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastGemSelectPopup/BeastGemSelectBoard/BeastGemSelectViewport/BeastGemSelectGrid',
        'Canvas/MainRoot/PageLayer/CharacterCreatePanel',
        'Canvas/MainRoot/PageLayer/MagicMapPanel',
        'Canvas/MainRoot/PageLayer/MagicMapPanel/MagicMapViewport',
        'Canvas/MainRoot/PageLayer/MagicMapPanel/MagicMapViewport/MagicMapWorld',
        'Canvas/MainRoot/PageLayer/MagicMapPanel/MagicMapViewport/MagicMapWorld/MagicMapPlayerAnchor',
        'Canvas/MainRoot/PageLayer/MagicMapPanel/MagicMapViewport/MagicMapWorld/MagicMapMonsterAnchor_1',
        'Canvas/MainRoot/PageLayer/MagicMapPanel/MagicMapViewport/MagicMapWorld/MagicMapMonsterAnchor_2',
        'Canvas/MainRoot/PageLayer/MagicMapPanel/MagicMapViewport/MagicMapWorld/MagicMapMonsterAnchor_3',
        'Canvas/MainRoot/PageLayer/MagicMapPanel/MagicMapViewport/MagicMapWorld/MagicMapMonsterAnchor_4',
        'Canvas/MainRoot/PageLayer/MagicMapPanel/MagicMapViewport/MagicMapWorld/MagicMapMonsterAnchor_5',
        'Canvas/MainRoot/PageLayer/MagicMapPanel/MagicMapViewport/MagicMapWorld/MagicMapMonsterAnchor_6',
        'Canvas/MainRoot/PageLayer/MagicMapPanel/MagicMapViewport/MagicMapWorld/MagicMapMonsterAnchor_7',
        'Canvas/MainRoot/PageLayer/MagicMapPanel/MagicMapViewport/MagicMapWorld/MagicMapMonsterAnchor_8',
        'Canvas/MainRoot/PageLayer/MagicMapPanel/MagicMapViewport/MagicMapWorld/MagicMapMonsterAnchor_9',
        'Canvas/MainRoot/PageLayer/MagicMapPanel/MagicMapViewport/MagicMapWorld/MagicMapMonsterAnchor_10',
        'Canvas/MainRoot/PageLayer/MagicMapPanel/MagicMapViewport/MagicMapWorld/MagicMapBossAnchor',
        'Canvas/MainRoot/PageLayer/MagicMonsterBattlePanel',
        'Canvas/MainRoot/PageLayer/MagicMonsterBattlePanel/MagicBattleBackgroundAnchor',
        'Canvas/MainRoot/PageLayer/MagicMonsterBattlePanel/MagicBattleBackgroundAnchor/MagicBattleBackgroundImage',
        'Canvas/MainRoot/PageLayer/MagicMonsterBattlePanel/MagicBattleRoleAnchor',
        'Canvas/MainRoot/PageLayer/MagicMonsterBattlePanel/MagicBattleMonsterAnchor',
        'Canvas/MainRoot/PageLayer/MagicMonsterBattlePanel/MagicBattleDamageHudRoot',
        'Canvas/MainRoot/PageLayer/MagicMonsterBattlePanel/MagicBattleDamageHudRoot/MagicBattleDamageToggle',
        'Canvas/MainRoot/PageLayer/MagicMonsterBattlePanel/MagicBattleDamageHudRoot/MagicBattleDamageContent',
        'Canvas/MainRoot/PageLayer/MagicMonsterBattlePanel/MagicBattleDamageHudRoot/MagicBattleDamageContent/MagicBattleDamageInfoBg',
        'Canvas/MainRoot/PageLayer/MagicMonsterBattlePanel/MagicBattleDamageHudRoot/MagicBattleDamageContent/MagicBattleDamageTitleFrame',
        'Canvas/MainRoot/PageLayer/MagicMonsterBattlePanel/MagicBattleDamageHudRoot/MagicBattleDamageContent/MagicBattleDamageTitleFrame/MagicBattleDamageTitle',
        'Canvas/MainRoot/PageLayer/MagicMonsterBattlePanel/MagicBattleDamageHudRoot/MagicBattleDamageContent/MagicBattleDamageList',
        'Canvas/MainRoot/PageLayer/MagicMonsterBattlePanel/MagicBattleDamageHudRoot/MagicBattleDamageContent/MagicBattleDamageList/MagicBattleDamageRow_1',
        'Canvas/MainRoot/PageLayer/MagicMonsterBattlePanel/MagicBattleDamageHudRoot/MagicBattleDamageContent/MagicBattleDamageList/MagicBattleDamageRow_1/MagicBattleDamageRowBg',
        'Canvas/MainRoot/PageLayer/MagicMonsterBattlePanel/MagicBattleDamageHudRoot/MagicBattleDamageContent/MagicBattleDamageList/MagicBattleDamageRow_2',
        'Canvas/MainRoot/PageLayer/MagicMonsterBattlePanel/MagicBattleDamageHudRoot/MagicBattleDamageContent/MagicBattleDamageList/MagicBattleDamageRow_2/MagicBattleDamageRowBg',
        'Canvas/MainRoot/PageLayer/MagicMonsterBattlePanel/MagicBattleDamageHudRoot/MagicBattleDamageContent/MagicBattleDamageList/MagicBattleDamageRow_2/MagicBattleDamageDuelButton',
        'Canvas/MainRoot/PageLayer/MagicMonsterBattlePanel/MagicBattleDamageHudRoot/MagicBattleDamageContent/MagicBattleDamageList/MagicBattleDamageRow_3',
        'Canvas/MainRoot/PageLayer/MagicMonsterBattlePanel/MagicBattleDamageHudRoot/MagicBattleDamageContent/MagicBattleDamageList/MagicBattleDamageRow_3/MagicBattleDamageRowBg',
        'Canvas/MainRoot/PageLayer/MagicMonsterBattlePanel/MagicBattleDamageHudRoot/MagicBattleDamageContent/MagicBattleDamageList/MagicBattleDamageRow_3/MagicBattleDamageDuelButton',
        'Canvas/MainRoot/PageLayer/MagicMonsterBattlePanel/MagicBattleDamageHudRoot/MagicBattleDamageContent/MagicBattleMyRankFrame',
        'Canvas/MainRoot/PageLayer/BattlePanel',
        'Canvas/MainRoot/PageLayer/BattlePanel/BattleEntryUiRoot',
        'Canvas/MainRoot/PageLayer/BattlePanel/BattleUpgradePopup',
        'Canvas/MainRoot/PageLayer/BattlePanel/BattleCombatLayer',
        'Canvas/MainRoot/PageLayer/ShopPanel',

        'Canvas/MainRoot/PopupLayer/MailPanel',
        'Canvas/MainRoot/PopupLayer/MailPanel/MailBoard',
        'Canvas/MainRoot/PopupLayer/MailPanel/MailBoard/MailListRoot',
        'Canvas/MainRoot/PopupLayer/MailPanel/MailBoard/MailListRoot/MailListContent',
        'Canvas/MainRoot/PopupLayer/MailPanel/MailBoard/MailListRoot/MailListContent/MailRowTemplate',
        'Canvas/MainRoot/PopupLayer/MailPanel/BattleHostMailDetailTemplate',
        'Canvas/MainRoot/PopupLayer/MailPanel/BattleHostMailDetailTemplate/BattleHostMailDetailBoard',
        'Canvas/MainRoot/PopupLayer/MailPanel/BattleHostMailDetailTemplate/BattleHostMailDetailBoard/BattleHostMailDetailTitleSkin',
        'Canvas/MainRoot/PopupLayer/MailPanel/BattleHostMailDetailTemplate/BattleHostMailDetailBoard/BattleHostMailDetailTitle',
        'Canvas/MainRoot/PopupLayer/MailPanel/BattleHostMailDetailTemplate/BattleHostMailDetailBoard/BattleHostMailRewardViewport',
        'Canvas/MainRoot/PopupLayer/MailPanel/BattleHostMailDetailTemplate/BattleHostMailDetailBoard/BattleHostMailRewardViewport/BattleHostMailRewardContent',
        'Canvas/MainRoot/PopupLayer/MailPanel/BattleHostMailDetailTemplate/BattleHostMailDetailBoard/BattleHostMailRewardViewport/BattleHostMailRewardContent/BattleHostMailRewardSlot_1',
        'Canvas/MainRoot/PopupLayer/MailPanel/BattleHostMailDetailTemplate/BattleHostMailDetailBoard/BattleHostMailCancelButton',
        'Canvas/MainRoot/PopupLayer/MailPanel/BattleHostMailDetailTemplate/BattleHostMailDetailBoard/BattleHostMailClaimButton',
        'Canvas/MainRoot/PopupLayer/NoticePanel',
        'Canvas/MainRoot/PopupLayer/NoticePanel/NoticeBoard/NoticeScrollView/NoticeScrollContent/NoticeArticleTemplate',
        'Canvas/MainRoot/PopupLayer/RankPanel',
        'Canvas/MainRoot/PopupLayer/RankPanel/MainRankRoot/MainRankList/MainRankContent/MainRankRowTemplate',
        'Canvas/MainRoot/PopupLayer/GiftPanel',
        'Canvas/MainRoot/PopupLayer/SharePanel',
        'Canvas/MainRoot/PopupLayer/SharePanel/SharePageBackground',
        'Canvas/MainRoot/PopupLayer/SharePanel/ShareClose',
        'Canvas/MainRoot/PopupLayer/SharePanel/ShareTaskTitleBg',
        'Canvas/MainRoot/PopupLayer/SharePanel/ShareTaskTitleLabel',
        'Canvas/MainRoot/PopupLayer/SharePanel/ShareTaskBoard',
        'Canvas/MainRoot/PopupLayer/SharePanel/ShareTaskBoard/ShareTaskScrollView',
        'Canvas/MainRoot/PopupLayer/SharePanel/ShareTaskBoard/ShareTaskScrollView/ShareTaskScrollContent',
        'Canvas/MainRoot/PopupLayer/SharePanel/ShareTaskBoard/ShareTaskScrollView/ShareTaskScrollContent/ShareTaskRow_generation_lv15_1',
        'Canvas/MainRoot/PopupLayer/SharePanel/ShareTaskBoard/ShareTaskScrollView/ShareTaskScrollContent/ShareTaskRow_chief_lv20_1',
        'Canvas/MainRoot/PopupLayer/ItemDetailPopup',
        'Canvas/MainRoot/PopupLayer/ConfirmPopup',
        'Canvas/MainRoot/PopupLayer/RewardPopup',
        'Canvas/MainRoot/PopupLayer/BattleResultPopup',
        'Canvas/MainRoot/PopupLayer/ProfilePopup',
        'Canvas/MainRoot/PopupLayer/ProfilePopup/ProfilePopupBoard',
        'Canvas/MainRoot/PopupLayer/ProfilePopup/ProfileDaoYouPanel',
        'Canvas/MainRoot/PopupLayer/ProfilePopup/ProfileDaoYouPanel/ProfileDaoYouBg',
        'Canvas/MainRoot/PopupLayer/ProfilePopup/ProfileDaoYouPanel/ProfileDaoYouBackButton',
        'Canvas/MainRoot/PopupLayer/ProfilePopup/ProfileDaoYouPanel/ProfileDaoYouTitleLabel',
        'Canvas/MainRoot/PopupLayer/ProfilePopup/ProfileDaoYouPanel/ProfileDaoYouTabs',
        'Canvas/MainRoot/PopupLayer/ProfilePopup/ProfileDaoYouPanel/ProfileDaoYouCountLabel',
        'Canvas/MainRoot/PopupLayer/ProfilePopup/ProfileDaoYouPanel/ProfileDaoYouBoard',
        'Canvas/MainRoot/PopupLayer/ProfilePopup/ProfileDaoYouPanel/ProfileDaoYouScrollView',
        'Canvas/MainRoot/PopupLayer/ProfilePopup/ProfileDaoYouPanel/ProfileDaoYouScrollView/ProfileDaoYouScrollContent',
        'Canvas/MainRoot/PopupLayer/ProfilePopup/ProfileDaoYouPanel/ProfileDaoYouScrollView/ProfileDaoYouScrollContent/ProfileDaoYouRowTemplate',
        'Canvas/MainRoot/PopupLayer/ProfilePopup/ProfileDaoYouPanel/ProfileDaoYouScrollView/ProfileDaoYouScrollContent/ProfileDaoYouRow_chief_01',
        'Canvas/MainRoot/PopupLayer/ProfilePopup/ProfileDaoYouPanel/ProfileDaoYouScrollView/ProfileDaoYouScrollContent/ProfileDaoYouRow_chief_07',
        'Canvas/MainRoot/PopupLayer/ProfilePopup/ProfileBillPanel',
        'Canvas/MainRoot/PopupLayer/ProfilePopup/ProfileBillPanel/ProfileBillBg',
        'Canvas/MainRoot/PopupLayer/ProfilePopup/ProfileBillPanel/ProfileBillBackButton',
        'Canvas/MainRoot/PopupLayer/ProfilePopup/ProfileBillPanel/ProfileBillTitleLabel',
        'Canvas/MainRoot/PopupLayer/ProfilePopup/ProfileBillPanel/ProfileBillTabs',
        'Canvas/MainRoot/PopupLayer/ProfilePopup/ProfileBillPanel/ProfileBillTabs/ProfileBillTab_income',
        'Canvas/MainRoot/PopupLayer/ProfilePopup/ProfileBillPanel/ProfileBillTabs/ProfileBillTab_income/ProfileBillTab_incomeLabel',
        'Canvas/MainRoot/PopupLayer/ProfilePopup/ProfileBillPanel/ProfileBillTabs/ProfileBillTab_expense',
        'Canvas/MainRoot/PopupLayer/ProfilePopup/ProfileBillPanel/ProfileBillTabs/ProfileBillTab_expense/ProfileBillTab_expenseLabel',
        'Canvas/MainRoot/PopupLayer/ProfilePopup/ProfileBillPanel/ProfileBillScrollView',
        'Canvas/MainRoot/PopupLayer/ProfilePopup/ProfileBillPanel/ProfileBillScrollView/ProfileBillScrollContent',
        'Canvas/MainRoot/PopupLayer/ProfilePopup/ProfileBillPanel/ProfileBillScrollView/ProfileBillScrollContent/ProfileBillRowTemplate',
        'Canvas/MainRoot/PopupLayer/ProfilePopup/ProfileBillPanel/ProfileBillScrollView/ProfileBillScrollContent/ProfileBillRow_bill_001',
        'Canvas/MainRoot/PopupLayer/ProfilePopup/ProfileBillPanel/ProfileBillScrollView/ProfileBillScrollContent/ProfileBillRow_bill_010',
        'Canvas/MainRoot/PopupLayer/BagIllustrationDetailPopup',
        'Canvas/MainRoot/PopupLayer/MarketPanel',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketBackground',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketTitle',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketBoard',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketBoard/MarketBoardSkin',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketTabs',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketTabs/MarketTab_buy',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketTabs/MarketTab_buy/MarketTabLabel',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketTabs/MarketTab_sell',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketTabs/MarketTab_history',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketFilterRoot',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketFilterRoot/MarketCategoryFilter',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketFilterRoot/MarketCategoryFilter/MarketCategoryLabel',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketFilterRoot/MarketCategoryFilter/MarketCategoryDropdown',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketFilterRoot/MarketSecondaryFilter',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketFilterRoot/MarketSecondaryFilter/MarketSecondaryLabel',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketFilterRoot/MarketSecondaryFilter/MarketSecondaryDropdown',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketFilterRoot/MarketTertiaryFilter',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketFilterRoot/MarketTertiaryFilter/MarketTertiaryLabel',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketFilterRoot/MarketTertiaryFilter/MarketTertiaryDropdown',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketFilterRoot/MarketRefreshButton',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketFilterRoot/MarketRefreshButton/MarketRefreshLabel',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketFilterRoot/MarketRefreshButton/MarketRefreshIcon',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketFilterRoot/MarketSortFilter',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketFilterRoot/MarketSortFilter/MarketSortLabel',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketFilterRoot/MarketSortFilter/MarketSortDropdown',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketDropdownLayer',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketListViewport',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketListViewport/MarketListContent',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketListViewport/MarketListContent/MarketListing_1',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketListViewport/MarketListContent/MarketListing_1/MarketItemFrame',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketListViewport/MarketListContent/MarketListing_1/MarketItemIcon',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketListViewport/MarketListContent/MarketListing_1/MarketItemName',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketListViewport/MarketListContent/MarketListing_1/MarketUnitPrice',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketListViewport/MarketListContent/MarketListing_1/MarketTotalPrice',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketListViewport/MarketListContent/MarketListing_1/MarketActionButton',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketListViewport/MarketListContent/MarketListing_1/MarketActionButton/MarketActionLabel',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketListViewport/MarketHistoryContent',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketModeButtons',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketModeButtons/MarketModeTradeButton',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketModeButtons/MarketModeRequestButton',
        'Canvas/MainRoot/PopupLayer/MarketPanel/MarketBack',
        'Canvas/MainRoot/PopupLayer/MagicFloorPanel',
        'Canvas/MainRoot/PopupLayer/BattleRewardPopup',
        'Canvas/MainRoot/PopupLayer/RoleEquipDetailPopup',
        'Canvas/MainRoot/PopupLayer/RoleEquipReplacePopup',
        'Canvas/MainRoot/PopupLayer/RoleProgressSuccessPopup',
        'Canvas/MainRoot/PopupLayer/TransitionLoadingLayer',
    ],
};

const blockInputRequirements = {
    'assets/Scene/MainScene.scene': [
        'Canvas/MainRoot/PageLayer/RolePagePanel',
        'Canvas/MainRoot/PageLayer/RolePagePanel/RoleAttrDetailPanel',
        'Canvas/MainRoot/PageLayer/BagPanel',
        'Canvas/MainRoot/PageLayer/BagPanel/BagIllustrationPanel',
        'Canvas/MainRoot/PageLayer/AlliancePanel',
        'Canvas/MainRoot/PageLayer/DuelPanel',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRecordPage',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuRankPage',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelJianghuTaoshaPage/JianghuResultPopup',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiZhengxiongMainPage',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiRankPage',
        'Canvas/MainRoot/PageLayer/DuelPanel/DuelLuanshiZhengxiongPage/LuanshiRecordPage',
        'Canvas/MainRoot/PageLayer/ShowcasePanel',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage',
        'Canvas/MainRoot/PageLayer/BottomFeaturePanel/BeastStrengthenPage/BeastGemSelectPopup',
        'Canvas/MainRoot/PageLayer/CharacterCreatePanel',
        'Canvas/MainRoot/PageLayer/MagicMapPanel',
        'Canvas/MainRoot/PageLayer/MagicMonsterBattlePanel',
        'Canvas/MainRoot/PageLayer/BattlePanel',
        'Canvas/MainRoot/PageLayer/BattlePanel/BattleUpgradePopup',
        'Canvas/MainRoot/PageLayer/BattlePanel/BattleCombatLayer',
        'Canvas/MainRoot/PageLayer/ShopPanel',
        'Canvas/MainRoot/PopupLayer/MailPanel',
        'Canvas/MainRoot/PopupLayer/MailPanel/BattleHostMailDetailTemplate',
        'Canvas/MainRoot/PopupLayer/MailPanel/BattleHostMailDetailTemplate/BattleHostMailDetailBoard',
        'Canvas/MainRoot/PopupLayer/NoticePanel',
        'Canvas/MainRoot/PopupLayer/RankPanel',
        'Canvas/MainRoot/PopupLayer/GiftPanel',
        'Canvas/MainRoot/PopupLayer/SharePanel',
        'Canvas/MainRoot/PopupLayer/ItemDetailPopup',
        'Canvas/MainRoot/PopupLayer/ConfirmPopup',
        'Canvas/MainRoot/PopupLayer/RewardPopup',
        'Canvas/MainRoot/PopupLayer/BattleResultPopup',
        'Canvas/MainRoot/PopupLayer/ProfilePopup',
        'Canvas/MainRoot/PopupLayer/ProfilePopup/ProfileBillPanel',
        'Canvas/MainRoot/PopupLayer/BagIllustrationDetailPopup',
        'Canvas/MainRoot/PopupLayer/MarketPanel',
        'Canvas/MainRoot/PopupLayer/MagicFloorPanel',
        'Canvas/MainRoot/PopupLayer/BattleRewardPopup',
        'Canvas/MainRoot/PopupLayer/RoleEquipDetailPopup',
        'Canvas/MainRoot/PopupLayer/RoleEquipReplacePopup',
        'Canvas/MainRoot/PopupLayer/RoleProgressSuccessPopup',
        'Canvas/MainRoot/PopupLayer/TransitionLoadingLayer',
    ],
};

const childOrderRequirements = {
    'assets/Scene/MainScene.scene': [
        {
            parent: 'Canvas/MainRoot',
            children: ['GameSceneLayer', 'HudLayer', 'PageLayer', 'PopupLayer', 'GuideLayer', 'ToastLayer'],
        },
        {
            parent: 'Canvas/MainRoot/HudLayer',
            children: ['TopHud', 'LeftDock', 'RightDock', 'BottomNav'],
        },
        {
            parent: 'Canvas/MainRoot/ToastLayer',
            children: ['ToastBg', 'ToastLabel'],
        },
        {
            parent: 'Canvas/MainRoot/PageLayer',
            children: [],
        },
        {
            parent: 'Canvas/MainRoot/PopupLayer',
            children: [],
        },
    ],
};

const forbiddenEditorPaths = {
    'assets/Bundle/UIHome/Prefabs/Popup/SharePanel.prefab': [
        'SharePanel/ShareBoard',
    ],
    'assets/Bundle/UIHome/Prefabs/Popup/ProfilePopup.prefab': [
        'ProfilePopup/ProfileDaoYouPanel/ProfileDaoYouScrollView/ProfileDaoYouScrollContent/ProfileDaoYouRowTemplate/ProfileDaoYouRowSkin',
    ],
};

const activeStateRequirements = {
    'assets/Bundle/UIHome/Prefabs/Popup/MailPanel.prefab': [
        { path: 'MailPanel/BattleHostMailDetailTemplate', active: false },
    ],
    'assets/Bundle/UIHome/Prefabs/Popup/SharePanel.prefab': [
        { path: 'SharePanel', active: false },
    ],
    'assets/Bundle/UIHome/Prefabs/Popup/ProfilePopup.prefab': [
        { path: 'ProfilePopup', active: false },
        { path: 'ProfilePopup/ProfilePopupBoard', active: true },
        { path: 'ProfilePopup/ProfileDaoYouPanel', active: false },
        { path: 'ProfilePopup/ProfileBillPanel', active: false },
    ],
};

const componentRequirements = {
    'assets/Bundle/UIHome/Prefabs/Popup/MailPanel.prefab': [
        {
            path: 'MailPanel/MailBoard/MailListRoot',
            component: 'cc.Mask',
            describe: 'enabled rectangular cc.Mask',
            validate: (_scene, _node, component) => component._enabled !== false && component._type === 0,
        },
        {
            path: 'MailPanel/MailBoard/MailListRoot',
            component: 'cc.ScrollView',
            describe: 'enabled vertical cc.ScrollView using MailListContent',
            validate: (scene, _node, component, nodesByPath) => {
                const content = nodesByPath.get('MailPanel/MailBoard/MailListRoot/MailListContent');
                return component._enabled !== false
                    && component.vertical === true
                    && component.horizontal === false
                    && component.elastic === false
                    && component.bounceDuration === 0
                    && component._content?.__id__ !== undefined
                    && scene[component._content.__id__] === content;
            },
        },
        {
            path: 'MailPanel/BattleHostMailDetailTemplate/BattleHostMailDetailBoard/BattleHostMailRewardViewport',
            component: 'cc.Mask',
            describe: 'enabled rectangular cc.Mask',
            validate: (_scene, _node, component) => component._enabled !== false && component._type === 0,
        },
    ],
};

const homeUiManifestPath = path.join(
    projectRoot,
    'assets',
    'Script',
    'UI',
    'Home',
    'HomeUIPrefabManifest.ts',
);
const homeUiManifest = fs.readFileSync(homeUiManifestPath, 'utf8');
const homeUiPrefabDefinitions = [...homeUiManifest.matchAll(
    /\{\s*rootName:\s*'([^']+)',\s*layer:\s*'(page|popup)',\s*path:\s*'([^']+)'\s*\}/g,
)].map((match) => ({
    rootName: match[1],
    layerName: match[2] === 'page' ? 'PageLayer' : 'PopupLayer',
    assetPath: match[3],
}));
if (homeUiPrefabDefinitions.length !== 34) {
    throw new Error(`Expected 34 home UI prefab definitions, found ${homeUiPrefabDefinitions.length}.`);
}

const mainScenePath = 'assets/Scene/MainScene.scene';
const artifactRequirements = {
    ...requirements,
    [mainScenePath]: requirements[mainScenePath].filter((requiredPath) => {
        return !homeUiPrefabDefinitions.some((definition) => {
            const prefix = `Canvas/MainRoot/${definition.layerName}/${definition.rootName}`;
            return requiredPath === prefix || requiredPath.startsWith(`${prefix}/`);
        });
    }),
};
const artifactBlockInputRequirements = {
    ...blockInputRequirements,
    [mainScenePath]: blockInputRequirements[mainScenePath].filter((requiredPath) => {
        return !homeUiPrefabDefinitions.some((definition) => {
            const prefix = `Canvas/MainRoot/${definition.layerName}/${definition.rootName}`;
            return requiredPath === prefix || requiredPath.startsWith(`${prefix}/`);
        });
    }),
};

for (const definition of homeUiPrefabDefinitions) {
    const artifactPath = `assets/Bundle/UIHome/${definition.assetPath}.prefab`;
    const scenePrefix = `Canvas/MainRoot/${definition.layerName}/`;
    const rootPrefix = `${scenePrefix}${definition.rootName}`;
    artifactRequirements[artifactPath] = requirements[mainScenePath]
        .filter((requiredPath) => requiredPath === rootPrefix || requiredPath.startsWith(`${rootPrefix}/`))
        .map((requiredPath) => requiredPath.slice(scenePrefix.length));
    artifactBlockInputRequirements[artifactPath] = blockInputRequirements[mainScenePath]
        .filter((requiredPath) => requiredPath === rootPrefix || requiredPath.startsWith(`${rootPrefix}/`))
        .map((requiredPath) => requiredPath.slice(scenePrefix.length));
}

function collectNodePaths(scene) {
    const nodeEntries = scene
        .map((value, index) => ({ value, index }))
        .filter((entry) => entry.value?.__type__ === 'cc.Node');
    const nodesByIndex = new Map(nodeEntries.map((entry) => [entry.index, entry.value]));
    const roots = nodeEntries.filter((entry) => {
        const parentId = entry.value._parent?.__id__;
        return parentId === undefined || !nodesByIndex.has(parentId);
    });
    const paths = new Set();

    function visit(node, parentPath = '') {
        const nodePath = parentPath ? `${parentPath}/${node._name}` : node._name;
        paths.add(nodePath);
        nodesByPath.set(nodePath, node);
        for (const childRef of node._children || []) {
            const child = nodesByIndex.get(childRef.__id__);
            if (child) visit(child, nodePath);
        }
    }

    const nodesByPath = new Map();
    roots.forEach((entry) => visit(entry.value));
    return { paths, nodesByPath, nodeCount: nodeEntries.length };
}

function hasEnabledBlockInput(scene, node) {
    return (node._components || [])
        .map((componentRef) => scene[componentRef.__id__])
        .some((component) => component?.__type__ === 'cc.BlockInputEvents' && component._enabled !== false);
}

function getComponent(scene, node, componentType) {
    return (node._components || [])
        .map((componentRef) => scene[componentRef.__id__])
        .find((component) => component?.__type__ === componentType);
}

let failed = false;
for (const [relativePath, requiredPaths] of Object.entries(artifactRequirements)) {
    const scenePath = path.join(projectRoot, relativePath);
    const scene = JSON.parse(fs.readFileSync(scenePath, 'utf8'));
    const { paths, nodesByPath, nodeCount } = collectNodePaths(scene);
    const missing = requiredPaths.filter((requiredPath) => !paths.has(requiredPath));
    if (missing.length > 0) {
        failed = true;
        console.error(`${relativePath}: missing editor paths:`);
        missing.forEach((requiredPath) => console.error(`  - ${requiredPath}`));
    } else {
        console.log(`${relativePath}: editor hierarchy OK (${nodeCount} nodes, ${requiredPaths.length} required paths)`);
    }

    const forbidden = forbiddenEditorPaths[relativePath] || [];
    const presentForbiddenPaths = forbidden.filter((forbiddenPath) => paths.has(forbiddenPath));
    if (presentForbiddenPaths.length > 0) {
        failed = true;
        console.error(`${relativePath}: obsolete editor paths must be removed:`);
        presentForbiddenPaths.forEach((forbiddenPath) => console.error(`  - ${forbiddenPath}`));
    }

    const requiredActiveStates = activeStateRequirements[relativePath] || [];
    const invalidActiveStates = requiredActiveStates.filter((requirement) => {
        const node = nodesByPath.get(requirement.path);
        return !node || node._active !== requirement.active;
    });
    if (invalidActiveStates.length > 0) {
        failed = true;
        console.error(`${relativePath}: invalid default active states:`);
        invalidActiveStates.forEach((requirement) => {
            const actual = nodesByPath.get(requirement.path)?._active;
            console.error(`  - ${requirement.path}: expected ${requirement.active}, got ${actual}`);
        });
    }

    const requiredComponents = componentRequirements[relativePath] || [];
    const invalidComponents = requiredComponents.filter((requirement) => {
        const node = nodesByPath.get(requirement.path);
        if (!node) return true;
        const component = getComponent(scene, node, requirement.component);
        if (!component) return true;
        return requirement.validate && !requirement.validate(scene, node, component, nodesByPath);
    });
    if (invalidComponents.length > 0) {
        failed = true;
        console.error(`${relativePath}: invalid editor components:`);
        invalidComponents.forEach((requirement) => {
            console.error(`  - ${requirement.path}: expected ${requirement.describe}`);
        });
    }

    const requiredBlockInputs = artifactBlockInputRequirements[relativePath] || [];
    const missingBlockInputs = requiredBlockInputs.filter((requiredPath) => {
        const node = nodesByPath.get(requiredPath);
        return !node || !hasEnabledBlockInput(scene, node);
    });
    if (missingBlockInputs.length > 0) {
        failed = true;
        console.error(`${relativePath}: missing enabled cc.BlockInputEvents on blocking roots:`);
        missingBlockInputs.forEach((requiredPath) => console.error(`  - ${requiredPath}`));
    } else if (requiredBlockInputs.length > 0) {
        console.log(`${relativePath}: input blockers OK (${requiredBlockInputs.length} blocking roots)`);
    }

    const requiredChildOrders = childOrderRequirements[relativePath] || [];
    const invalidChildOrders = requiredChildOrders.filter((requirement) => {
        const parent = nodesByPath.get(requirement.parent);
        if (!parent) return true;
        const childNames = (parent._children || [])
            .map((childRef) => scene[childRef.__id__]?._name)
            .filter(Boolean);
        return childNames.length !== requirement.children.length
            || requirement.children.some((name, index) => childNames[index] !== name);
    });
    if (invalidChildOrders.length > 0) {
        failed = true;
        console.error(`${relativePath}: invalid editor sibling order:`);
        invalidChildOrders.forEach((requirement) => {
            const parent = nodesByPath.get(requirement.parent);
            const actual = (parent?._children || [])
                .map((childRef) => scene[childRef.__id__]?._name)
                .filter(Boolean);
            console.error(`  - ${requirement.parent}`);
            console.error(`    expected: ${requirement.children.join(' > ')}`);
            console.error(`    actual:   ${actual.join(' > ')}`);
        });
    } else if (requiredChildOrders.length > 0) {
        console.log(`${relativePath}: editor sibling order OK (${requiredChildOrders.length} ordered containers)`);
    }
}

if (failed) process.exit(1);
