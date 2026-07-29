import {
    Color,
    EventTouch,
    Graphics,
    HorizontalTextAlignment,
    Label,
    Node,
    UITransform,
    VerticalTextAlignment,
} from 'cc';
import { applySimKaiFont } from '../Common/UIFont';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';

abstract class HomeFeatureBottomFeatureShellHost extends HomeViewBase {
    protected abstract beastCardRecordPopup: Node | null;
    protected abstract beastStrengthenGemSelectPopup: Node | null;

    protected abstract clearBeastCardLegacyBottomInfo(): void;
    protected abstract ensureBeastCardBottomNameLabel(): void;
    protected abstract ensureBeastCardRewardArea(): void;
    protected abstract ensureBeastCardRecordPopup(): void;
    protected abstract ensureBeastCardStrengthenButton(): void;
    protected abstract ensureBeastCardYuanbaoRatePanel(): void;
    protected abstract ensureBeastStrengthenPage(): void;
    protected abstract closeBeastCardRecordPopup(): void;
    protected abstract closeBeastStrengthenGemSelectPopup(): void;
    protected abstract closeBeastStrengthenPage(restoreBeastCard: boolean): void;
}

/**
 * 主界面底部玩法通用容器、背景/标题、返回按钮与跨玩法关闭协调。
 */
export abstract class HomeFeatureBottomFeatureShell extends HomeFeatureBottomFeatureShellHost {
    protected openBottomFeaturePanel(title: string, hint: string, backgroundPath = HomeConfig.UI_ROLE_PAGE_BG): void {
        this.closeMagicFloorPanel();
        const hadPanel = !!this.bottomFeaturePanel;
        this.buildBottomFeaturePanel(backgroundPath);
        if (!this.bottomFeaturePanel) return;
    
        this.closeOtherBottomEntryPages(this.bottomFeaturePanel);
        this.bottomFeaturePanel.active = true;
        this.ensureInputBlocker(this.bottomFeaturePanel);
        this.bottomFeaturePanel.setSiblingIndex((this.bottomFeaturePanel.parent?.children.length || 1) - 1);
        if (hadPanel) {
            this.refreshBottomFeatureBackground(backgroundPath);
        }
        if (this.bottomFeatureTitleLabel) {
            this.bottomFeatureTitleLabel.node.active = true;
            this.bottomFeatureTitleLabel.string = title;
        }
        if (this.bottomFeatureBackground?.isValid) {
            this.bottomFeatureBackground.active = true;
        }
        if (this.bottomFeatureHintLabel) {
            this.bottomFeatureHintLabel.node.active = true;
            this.bottomFeatureHintLabel.string = hint;
        }
        const reserveText = this.bottomFeaturePanel.getChildByName('BottomFeatureReserveText');
        if (reserveText?.isValid) {
            reserveText.active = true;
        }
        this.hideBottomFeatureContentRoots();
        this.stopMagicScene();
        this.stopBeastCard();
        this.refreshBottomEntryChrome();
    }
    protected openMagicPanel(): void {
        this.closeMagicFloorPanel();
        this.stopBeastCard();
        const hadPanel = !!this.bottomFeaturePanel;
        this.buildBottomFeaturePanel(HomeConfig.UI_MAGIC_SCENE_SCROLL_BG);
        if (!this.bottomFeaturePanel) return;
    
        this.closeOtherBottomEntryPages(this.bottomFeaturePanel);
        this.bottomFeaturePanel.active = true;
        this.ensureInputBlocker(this.bottomFeaturePanel);
        this.bottomFeaturePanel.setSiblingIndex((this.bottomFeaturePanel.parent?.children.length || 1) - 1);
        if (hadPanel) {
            this.refreshBottomFeatureBackground(HomeConfig.UI_MAGIC_SCENE_SCROLL_BG);
        }
        if (this.bottomFeatureTitleLabel) {
            this.bottomFeatureTitleLabel.node.active = false;
            this.bottomFeatureTitleLabel.string = '\u9b54\u754c';
        }
        if (this.bottomFeatureBackground?.isValid) {
            this.bottomFeatureBackground.active = false;
        }
        if (this.bottomFeatureHintLabel) {
            this.bottomFeatureHintLabel.node.active = false;
        }
        const reserveText = this.bottomFeaturePanel.getChildByName('BottomFeatureReserveText');
        if (reserveText?.isValid) {
            reserveText.active = false;
        }
        this.ensureMagicScenePanel();
        this.hideBottomFeatureContentRoots(this.magicSceneRoot);
        if (this.magicSceneRoot?.isValid) {
            this.magicSceneRoot.active = true;
            this.magicSceneRoot.setSiblingIndex(2);
        }
        this.magicSceneIndex = 0;
        this.refreshMagicScene();
        this.raiseBottomFeatureBackButton();
        this.refreshBottomEntryChrome();
    }
    protected openBeastCardPanel(): void {
        this.closeMagicFloorPanel();
        this.stopMagicScene();
        const hadPanel = !!this.bottomFeaturePanel;
        this.buildBottomFeaturePanel(HomeConfig.UI_ROLE_PAGE_BG);
        if (!this.bottomFeaturePanel) return;
    
        this.closeOtherBottomEntryPages(this.bottomFeaturePanel);
        this.bottomFeaturePanel.active = true;
        this.ensureInputBlocker(this.bottomFeaturePanel);
        this.bottomFeaturePanel.setSiblingIndex((this.bottomFeaturePanel.parent?.children.length || 1) - 1);
        if (hadPanel) {
            this.refreshBottomFeatureBackground(HomeConfig.UI_ROLE_PAGE_BG);
        }
        if (this.bottomFeatureTitleLabel) {
            this.bottomFeatureTitleLabel.node.active = true;
            this.bottomFeatureTitleLabel.string = '\u517d\u5361';
        }
        if (this.bottomFeatureBackground?.isValid) {
            this.bottomFeatureBackground.active = true;
        }
        if (this.bottomFeatureHintLabel) {
            this.bottomFeatureHintLabel.node.active = false;
        }
        const reserveText = this.bottomFeaturePanel.getChildByName('BottomFeatureReserveText');
        if (reserveText?.isValid) {
            reserveText.active = false;
        }
        this.ensureBeastCardPanel();
        this.clearBeastCardLegacyBottomInfo();
        this.ensureBeastCardBottomNameLabel();
        this.ensureBeastCardRewardArea();
        this.ensureBeastCardStrengthenButton();
        this.ensureBeastCardYuanbaoRatePanel();
        this.ensureBeastCardRecordPopup();
        this.ensureBeastStrengthenPage();
        this.hideBottomFeatureContentRoots(this.beastCardRoot);
        this.closeBeastStrengthenPage(false);
        if (this.beastCardRoot?.isValid) {
            this.beastCardRoot.active = true;
            this.beastCardRoot.setSiblingIndex(7);
        }
        this.beastCardIndex = 0;
        this.refreshBeastCard();
        this.raiseBottomFeatureBackButton();
        this.refreshBottomEntryChrome();
    }
    protected refreshBottomFeatureBackground(backgroundPath: string): void {
        if (!this.bottomFeatureBackground?.isValid) return;
    
        this.clearSpriteFrame(this.bottomFeatureBackground);
        this.applyUiSkinKeepingEditorSize(this.bottomFeatureBackground, backgroundPath, 750, 1700);
    }
    protected closeBottomFeaturePanel(): void {
        if (!this.bottomFeaturePanel) return;
    
        this.closeMagicFloorPanel();
        this.bottomFeaturePanel.active = false;
        this.stopMagicScene();
        this.stopBeastCard();
        this.closeBeastCardRecordPopup();
        this.closeBeastStrengthenPage(false);
        this.hideBottomFeatureContentRoots();
        this.refreshBottomEntryChrome();
    }
    protected closeOtherBottomEntryPages(activePanel: Node | null): void {
        this.closeBaseBottomEntryPages(activePanel);
        this.closeStandaloneMagicPages(activePanel);
    }
    protected closeStandaloneMagicPages(activePanel: Node | null = null): void {
        const keepMapPanel = !!activePanel && (activePanel === this.magicMapPanel || activePanel.name === 'MagicMapPanel');
        const keepBattlePanel = !!activePanel && (activePanel === this.magicMonsterBattlePanel || activePanel.name === 'MagicMonsterBattlePanel');

        if (!keepBattlePanel) {
            this.stopMagicMonsterBattle();
            const battlePanel = this.magicMonsterBattlePanel?.isValid
                ? this.magicMonsterBattlePanel
                : this.findNode('MagicMonsterBattlePanel');
            if (battlePanel?.isValid) {
                battlePanel.active = false;
            }
        }

        if (!keepMapPanel) {
            this.stopMagicMapWander();
            this.stopMagicMapPlayerMovement(false);
            ++this.magicMapLoadVersion;
            const mapPanel = this.magicMapPanel?.isValid
                ? this.magicMapPanel
                : this.findNode('MagicMapPanel');
            if (mapPanel?.isValid) {
                mapPanel.active = false;
            }
            this.magicMapPlayerMoving = false;
            this.magicMapMonsters.forEach((monster) => this.setSkeletonVisible(monster.skeleton, false));
            this.setSkeletonVisible(this.magicMapPlayerSkeleton, false);
        }
    }
    protected hideBottomFeatureContentRoots(except: Node | null = null): void {
        if (!this.bottomFeaturePanel?.isValid) return;

        const candidates = [
            this.magicSceneRoot,
            this.beastCardRoot,
            this.beastStrengthenPage,
            this.bottomFeaturePanel.getChildByName('MagicSceneRoot'),
            this.bottomFeaturePanel.getChildByName('BeastCardRoot'),
            this.bottomFeaturePanel.getChildByName('BeastStrengthenPage'),
        ];
        const visited = new Set<Node>();
        candidates.forEach((node) => {
            if (!node?.isValid || visited.has(node)) return;
            visited.add(node);
            node.active = node === except;
        });
    }
    protected buildBottomFeaturePanel(backgroundPath = HomeConfig.UI_ROLE_PAGE_BG): void {
        if (this.bottomFeaturePanel) return;
    
        const popupParent = this.pageRoot || this.popupRoot || this.node;
        const editorPanel = popupParent.getChildByName('BottomFeaturePanel') || this.findNode('BottomFeaturePanel');
        this.bottomFeaturePanel = editorPanel || this.createNode('BottomFeaturePanel', popupParent, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        if (this.bottomFeaturePanel.parent !== popupParent) {
            this.bottomFeaturePanel.setParent(popupParent);
        }
        this.bottomFeaturePanel.active = false;
        this.bottomFeaturePanel.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);
    
        if (!this.bottomFeaturePanel.getComponent(Graphics)) {
            this.drawRect(this.bottomFeaturePanel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, new Color(6, 15, 18, 255));
        }
        this.bottomFeatureBackground = this.getOrCreateBottomFeatureSkinnedNode(this.bottomFeaturePanel, 'BottomFeatureBackground', 750, 1700, 0, 0, backgroundPath).node;
        this.bottomFeatureBackground.setSiblingIndex(0);
        this.bottomFeatureTitleLabel = this.getOrCreateBottomFeatureLabel(this.bottomFeaturePanel, 'BottomFeatureTitle', '', 42, 0, 720, 240, 64, new Color(255, 238, 196, 255)).label;
        const back = this.getOrCreateBottomFeatureSkinnedNode(
            this.bottomFeaturePanel,
            'BottomFeatureBack',
            HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_WIDTH,
            HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_HEIGHT,
            HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_X,
            HomeConfig.BOTTOM_ENTRY_BACK_BUTTON_Y,
            HomeConfig.UI_RANK_BACK,
        ).node;
        this.bindScaledClick(back, () => this.handleBottomFeatureBackClick());
        back.setSiblingIndex(30);
        this.bottomFeatureHintLabel = this.getOrCreateBottomFeatureLabel(this.bottomFeaturePanel, 'BottomFeatureHint', '', 28, 0, 120, 520, 80, new Color(255, 238, 196, 255)).label;
        this.getOrCreateBottomFeatureLabel(this.bottomFeaturePanel, 'BottomFeatureReserveText', '\u6b63\u5f0fUI\u7d20\u6750\u5f85\u63a5\u5165', 22, 0, 72, 460, 60, new Color(223, 244, 234, 220));
    }
    protected handleBottomFeatureBackClick(): void {
        if (this.beastCardRecordPopup?.active) {
            this.closeBeastCardRecordPopup();
            return;
        }
        if (this.beastStrengthenGemSelectPopup?.active) {
            this.closeBeastStrengthenGemSelectPopup();
            return;
        }
        if (this.beastStrengthenPage?.active) {
            this.closeBeastStrengthenPage(true);
            return;
        }

        this.closeBottomFeaturePanel();
    }
    protected raiseBottomFeatureBackButton(): void {
        const back = this.bottomFeaturePanel?.getChildByName('BottomFeatureBack');
        if (!back?.isValid || !this.bottomFeaturePanel?.isValid) return;
        back.active = true;
        back.setSiblingIndex((this.bottomFeaturePanel.children.length || 1) - 1);
    }
    protected getOrCreateBottomFeatureNode(parent: Node, name: string, width: number, height: number, x: number, y: number): { node: Node; existed: boolean } {
        const existing = parent.getChildByName(name);
        if (existing?.isValid) {
            const transform = existing.getComponent(UITransform) || existing.addComponent(UITransform);
            if (transform.contentSize.width <= 0 || transform.contentSize.height <= 0) {
                transform.setContentSize(width, height);
            }
            return { node: existing, existed: true };
        }

        return { node: this.createNode(name, parent, width, height, x, y), existed: false };
    }
    protected getOrCreateBottomFeatureSkinnedNode(parent: Node, name: string, width: number, height: number, x: number, y: number, skinPath: string): { node: Node; existed: boolean } {
        const result = this.getOrCreateBottomFeatureNode(parent, name, width, height, x, y);
        this.applyUiSkinKeepingEditorSize(result.node, skinPath, width, height);
        return result;
    }
    protected getOrCreateBottomFeatureLabel(parent: Node, name: string, text: string, fontSize: number, x: number, y: number, width: number, height: number, color: Color): { label: Label; existed: boolean } {
        const result = this.getOrCreateBottomFeatureNode(parent, name, width, height, x, y);
        const existingLabel = result.node.getComponent(Label);
        const label = existingLabel || result.node.addComponent(Label);
        label.string = text;
        if (!result.existed || !existingLabel) {
            applySimKaiFont(label);
            label.fontSize = fontSize;
            label.lineHeight = fontSize + 8;
            label.color = color;
            label.horizontalAlign = HorizontalTextAlignment.CENTER;
            label.verticalAlign = VerticalTextAlignment.CENTER;
        }
        return { label, existed: result.existed };
    }
}
