import {
    Color,
    EventTouch,
    Graphics,
    HorizontalTextAlignment,
    Label,
    Node,
    UITransform,
    VerticalTextAlignment,
    instantiate,
} from 'cc';
import { applySimKaiFont } from '../Common/UIFont';
import * as HomeConfig from './HomeConfig';
import type { MailData, MailTab } from './HomeTypes';
import { HomeViewBase } from './HomeViewBase';

/**
 * Owns the mail panel, tabs, list rows, and list refresh lifecycle.
 */
export abstract class HomeFeatureMailPanel extends HomeViewBase {

    protected openMailPanel(): void {
        if (this.characterPanel?.active) {
            console.warn('[MainHomeView] 角色创建流程中不打开邮件弹窗');
            return;
        }
        this.ensureMailData();
        this.buildMailPanel();
        if (!this.mailPanel) return;
    
        this.mailPanel.active = true;
        this.ensureInputBlocker(this.mailPanel);
        this.mailPanel.setSiblingIndex((this.mailPanel.parent?.children.length || 1) - 1);
        this.mailActiveTab = 'normal';
        this.refreshMailTabs();
        this.refreshMailPanel();
        this.updateMailBadge();
    }
    protected buildMailPanel(): void {
        if (this.mailPanel) return;

        const editorMailPanel = this.findNode('MailPanel');
        if (editorMailPanel) {
            this.bindEditorMailPanel(editorMailPanel);
            return;
        }

        const popupParent = this.popupRoot || this.node;
        this.mailPanel = this.createNode('MailPanel', popupParent, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        this.mailPanel.active = false;
        this.mailPanel.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);
        this.drawRect(this.mailPanel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, new Color(0, 0, 0, 128));

        const board = this.createNode('MailBoard', this.mailPanel, 680, 1120, 0, 0);
        this.rebuildSimpleMailBoard(board);
    }
    protected bindEditorMailPanel(panel: Node): void {
        this.mailPanel = panel;
        if (this.popupRoot && panel.parent !== this.popupRoot) {
            panel.setParent(this.popupRoot);
        }
        panel.active = false;
        if (!panel.getComponent(Graphics)) {
            const panelSize = panel.getComponent(UITransform)?.contentSize;
            this.drawRect(panel, panelSize?.width || HomeConfig.VIEW_WIDTH, panelSize?.height || HomeConfig.VIEW_HEIGHT, new Color(0, 0, 0, 128));
        }
        panel.off(Node.EventType.TOUCH_END);
        panel.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);

        let board = this.findNode('MailBoard', panel);
        if (!board) {
            this.mailUsesEditorLayout = false;
            board = this.createNode('MailBoard', panel, 680, 1120, 0, 0);
            this.rebuildSimpleMailBoard(board);
            return;
        }
        this.bindExistingEditorMailBoard(board);
    }
    protected bindExistingEditorMailBoard(board: Node): void {
        this.mailUsesEditorLayout = true;
        board.off(Node.EventType.TOUCH_END);
        board.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);

        this.mailTabNodes.normal = undefined;
        this.mailTabNodes.system = undefined;
        this.mailTabNodes.unread = undefined;
        this.mailUnreadDot = null;
        this.mailRowTemplate = null;
        this.mailCountLabel = null;
        this.mailEmptyLabel = null;

        const boardSkin = this.findNode('MailBoardSkin', board);
        if (boardSkin) {
            const size = boardSkin.getComponent(UITransform)?.contentSize;
            this.applySlicedUiSkin(boardSkin, HomeConfig.UI_FRAME_MAIL, size?.width || 680, size?.height || 1120);
            boardSkin.setSiblingIndex(0);
        }

        const close = this.findNode('MailClose', board);
        if (close) {
            const size = close.getComponent(UITransform)?.contentSize;
            this.applyUiSkin(close, HomeConfig.UI_MAIL_BTN_CLOSE, size?.width || 77, size?.height || 71);
            this.bindScaledClick(close, () => this.closeMailPanel());
            close.setSiblingIndex((close.parent?.children.length || 1) - 1);
        }

        this.mailListRoot = this.findNode('MailListRoot', board);
        this.mailRowTemplate = this.mailListRoot ? this.findNode('MailRowTemplate', this.mailListRoot) : null;
        if (this.mailRowTemplate) {
            this.mailRowTemplate.active = false;
        }
        const tabConfigs: Array<{ tab: MailTab; nodeName: string; labelName: string; text: string }> = [
            { tab: 'normal', nodeName: 'MailTabNormal', labelName: 'MailTabNormalLabel', text: '\u666e\u901a' },
            { tab: 'system', nodeName: 'MailTabSystem', labelName: 'MailTabSystemLabel', text: '\u7cfb\u7edf' },
            { tab: 'unread', nodeName: 'MailTabUnread', labelName: 'MailTabUnreadLabel', text: '\u672a\u8bfb' },
        ];
        tabConfigs.forEach((config) => {
            const tabNode = this.findNode(config.nodeName, board);
            if (!tabNode) return;
            this.mailTabNodes[config.tab] = tabNode;
            const label = tabNode.getChildByName(config.labelName)?.getComponent(Label);
            if (label) {
                label.string = config.text;
                applySimKaiFont(label);
            }
            this.bindScaledClick(tabNode, () => this.switchMailTab(config.tab));
        });
        this.mailUnreadDot = this.findNode('MailTabUnreadDot', board);

        const emptyNode = this.findNode('MailEmpty', board) || this.findNode('MailCount', board);
        this.mailEmptyLabel = emptyNode?.getComponent(Label) || null;
        if (this.mailEmptyLabel && this.mailEmptyLabel.string.trim().length <= 0) {
            this.mailEmptyLabel.string = '\u6682\u65e0\u90ae\u4ef6';
        }

        const deleteButton = this.findNode('MailDeleteRead', board);
        if (deleteButton) {
            const size = deleteButton.getComponent(UITransform)?.contentSize;
            this.applyUiSkin(deleteButton, HomeConfig.UI_BTN_DELETE, size?.width || 150, size?.height || 54);
            this.bindScaledClick(deleteButton, () => this.deleteReadMails());
        }
        const claimButton = this.findNode('MailClaimAll', board);
        if (claimButton) {
            const size = claimButton.getComponent(UITransform)?.contentSize;
            this.applyUiSkin(claimButton, HomeConfig.UI_BTN_CLAIM, size?.width || 150, size?.height || 54);
            this.bindScaledClick(claimButton, () => this.claimAllMailRewards());
        }
    }
    protected rebuildSimpleMailBoard(board: Node): void {
        this.mailUsesEditorLayout = false;
        const boardWidth = 680;
        const boardHeight = 1120;
        const boardTransform = board.getComponent(UITransform) || board.addComponent(UITransform);
        boardTransform.setContentSize(boardWidth, boardHeight);
        board.setPosition(0, 0, 0);
        board.off(Node.EventType.TOUCH_END);
        board.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);
        this.clearChildren(board);

        this.mailTabNodes.normal = undefined;
        this.mailTabNodes.system = undefined;
        this.mailTabNodes.unread = undefined;
        this.mailUnreadDot = null;
        this.mailCountLabel = null;
        this.mailRowTemplate = null;
        this.mailEmptyLabel = null;

        this.createSlicedSkinnedNode('MailBoardSkin', board, boardWidth, boardHeight, 0, 0, HomeConfig.UI_FRAME_MAIL).setSiblingIndex(0);
        this.createMailButton(board, 'MailClose', '', 294, 504, 77, 71, new Color(110, 72, 52, 0), () => this.closeMailPanel(), HomeConfig.UI_MAIL_BTN_CLOSE).setSiblingIndex(10);
        const tabsRoot = this.createNode('MailTabs', board, 430, 64, 0, 424);
        tabsRoot.setSiblingIndex(2);
        this.mailTabNodes.normal = this.createMailTab(tabsRoot, 'MailTabNormal', '\u666e\u901a', -136, 'normal');
        this.mailTabNodes.system = this.createMailTab(tabsRoot, 'MailTabSystem', '\u7cfb\u7edf', 0, 'system');
        const unreadTab = this.createMailTab(tabsRoot, 'MailTabUnread', '\u672a\u8bfb', 136, 'unread');
        this.mailTabNodes.unread = unreadTab;
        this.mailUnreadDot = this.createSkinnedNode('MailTabUnreadDot', unreadTab, 28, 28, 48, 16, HomeConfig.UI_MAIL_UNREAD_DOT);

        this.mailListRoot = this.createNode('MailListRoot', board, 596, 760, 0, -18);
        this.mailListRoot.setSiblingIndex(3);
        this.createMailEmptyLabel();

        const bottom = this.createNode('MailBottomActions', board, 420, 70, 0, -486);
        bottom.setSiblingIndex(4);
        this.createMailButton(bottom, 'MailDeleteRead', '\u5220\u9664\u5df2\u8bfb', -92, 0, 150, 54, new Color(204, 238, 232, 0), () => this.deleteReadMails(), HomeConfig.UI_BTN_DELETE);
        this.createMailButton(bottom, 'MailClaimAll', '\u4e00\u952e\u9886\u53d6', 92, 0, 150, 54, new Color(204, 238, 232, 0), () => this.claimAllMailRewards(), HomeConfig.UI_BTN_CLAIM);
    }
    protected createMailEmptyLabel(): void {
        if (!this.mailListRoot) return;

        this.mailEmptyLabel = this.createLabel(this.mailListRoot, 'MailEmpty', '\u6682\u65e0\u90ae\u4ef6', 34, 0, 0, 360, 68, new Color(86, 58, 36, 255));
        this.mailEmptyLabel.enableOutline = true;
        this.mailEmptyLabel.outlineColor = new Color(255, 242, 202, 255);
        this.mailEmptyLabel.outlineWidth = 2;
    }
    protected bindEditorButton(root: Node, name: string, onClick: () => void): void {
        const button = this.findNode(name, root);
        if (!button) {
            console.warn(`[MainHomeView] 缺少按钮节点 ${name}`);
            return;
        }
        this.bindScaledClick(button, () => onClick());
    }
    protected ensureButtonText(button: Node, labelName: string, text: string): Label {
        const transform = button.getComponent(UITransform);
        const width = transform?.contentSize.width || 180;
        const height = transform?.contentSize.height || 54;
        let labelNode = button.getChildByName(labelName);
        if (!labelNode) {
            labelNode = this.createNode(labelName, button, width - 32, height - 14, 0, 2);
        }
    
        labelNode.active = true;
        labelNode.setSiblingIndex((labelNode.parent?.children.length || 1) - 1);
        (labelNode.getComponent(UITransform) || labelNode.addComponent(UITransform)).setContentSize(width - 32, height - 14);
        const label = labelNode.getComponent(Label) || labelNode.addComponent(Label);
        label.string = text;
        label.fontSize = 26;
        label.lineHeight = height - 14;
        label.horizontalAlign = HorizontalTextAlignment.CENTER;
        label.verticalAlign = VerticalTextAlignment.CENTER;
        label.color = new Color(255, 242, 202, 255);
        label.enableOutline = true;
        label.outlineColor = new Color(95, 48, 30, 255);
        label.outlineWidth = 2;
        applySimKaiFont(label);
        return label;
    }
    protected createMailRowTemplate(parent: Node): Node {
        const template = this.createNode('MailRowTemplate', parent, HomeConfig.MAIL_ROW_WIDTH, HomeConfig.MAIL_ROW_HEIGHT, 0, HomeConfig.MAIL_ROW_START_Y);
        template.active = false;
        this.createSkinnedNode('MailRowSkin', template, HomeConfig.MAIL_ROW_WIDTH, HomeConfig.MAIL_ROW_HEIGHT, 0, 0, HomeConfig.UI_FRAME_MAIL_ROW).setSiblingIndex(0);
        this.createSkinnedNode('MailUnreadDot', template, 34, 34, HomeConfig.MAIL_ROW_UNREAD_DOT_X, HomeConfig.MAIL_ROW_UNREAD_DOT_Y, HomeConfig.UI_MAIL_UNREAD_DOT).setSiblingIndex(1);
        const title = this.createLabel(template, 'MailRowTitle', '\u90ae\u4ef6\u6807\u9898', 25, -95, 36, 300, 36, new Color(72, 57, 43, 255));
        title.horizontalAlign = HorizontalTextAlignment.LEFT;
        const time = this.createLabel(template, 'MailRowTime', '\u521a\u521a', 21, 72, 36, 112, 32, new Color(91, 75, 58, 255));
        time.horizontalAlign = HorizontalTextAlignment.RIGHT;
        const preview = this.createLabel(template, 'MailRowPreview', '\u70b9\u51fb\u67e5\u770b\u90ae\u4ef6\u5185\u5bb9', 21, -55, -12, 380, 34, new Color(112, 92, 72, 255));
        preview.horizontalAlign = HorizontalTextAlignment.LEFT;
        this.createMailButton(
            template,
            'MailRowClaimButton',
            '\u9886\u53d6',
            HomeConfig.MAIL_ROW_CLAIM_BUTTON_X,
            0,
            HomeConfig.MAIL_ROW_CLAIM_BUTTON_WIDTH,
            HomeConfig.MAIL_ROW_CLAIM_BUTTON_HEIGHT,
            new Color(204, 238, 232, 0),
            () => undefined,
            HomeConfig.UI_BTN_CLAIM,
        ).setSiblingIndex(5);
        this.mailRowTemplate = template;
        return template;
    }
    protected createMailTab(parent: Node, name: string, text: string, x: number, tabType: MailTab): Node {
        const selected = this.mailActiveTab === tabType;
        const tab = this.createSkinnedNode(name, parent, 128, 54, x, 0, selected ? HomeConfig.UI_FRAME_MAIL_TAB_ACTIVE : HomeConfig.UI_FRAME_MAIL_TAB_NORMAL);
        const label = this.createLabel(tab, `${name}Label`, text, 26, 0, 1, 110, 42, selected ? new Color(142, 75, 32, 255) : new Color(80, 64, 41, 255));
        label.enableOutline = false;
        this.bindScaledClick(tab, () => this.switchMailTab(tabType));
        return tab;
    }
    protected switchMailTab(tab: MailTab): void {
        if (this.mailActiveTab === tab) return;
    
        this.mailActiveTab = tab;
        this.closeMailDetail();
        this.refreshMailTabs();
        this.refreshMailPanel();
    }
    protected refreshMailTabs(): void {
        const tabOrder: MailTab[] = ['normal', 'system', 'unread'];
        tabOrder.forEach((tab) => {
            const node = this.mailTabNodes[tab];
            if (!node?.isValid) return;
    
            const selected = this.mailActiveTab === tab;
            const transform = node.getComponent(UITransform);
            const width = transform?.contentSize.width || 128;
            const height = transform?.contentSize.height || 54;
            this.applyUiSkin(node, selected ? HomeConfig.UI_FRAME_MAIL_TAB_ACTIVE : HomeConfig.UI_FRAME_MAIL_TAB_NORMAL, width, height);
            const label = node.children.find((child) => child.name.endsWith('Label'))?.getComponent(Label);
            if (label) {
                label.color = selected ? new Color(142, 75, 32, 255) : new Color(80, 64, 41, 255);
            }
        });
    
        if (this.mailUnreadDot?.isValid) {
            const unreadCount = this.mailData.filter((mail) => mail.state === 0).length;
            this.mailUnreadDot.active = unreadCount > 0;
            this.mailUnreadDot.setSiblingIndex(20);
        }
    }
    protected getVisibleMails(): MailData[] {
        if (this.mailActiveTab === 'unread') {
            return this.mailData.filter((mail) => mail.state === 0);
        }
    
        return this.mailData.filter((mail) => (mail.category === 'system' ? 'system' : 'normal') === this.mailActiveTab);
    }
    protected closeMailPanel(): void {
        if (!this.mailPanel) return;
    
        this.closeMailDetail();
        this.mailPanel.active = false;
        this.updateMailBadge();
    }
    protected refreshMailPanel(): void {
        if (!this.mailListRoot) return;

        this.clearMailListRuntimeChildren();
        const mails = this.getVisibleMails();
        if (mails.length <= 0) {
            if (this.mailEmptyLabel?.node?.isValid) {
                this.mailEmptyLabel.node.active = true;
                this.mailEmptyLabel.string = '\u6682\u65e0\u90ae\u4ef6';
            } else {
                this.createMailEmptyLabel();
            }
        } else {
            if (this.mailEmptyLabel?.node?.isValid) {
                this.mailEmptyLabel.node.active = false;
            }
            this.mailEmptyLabel = null;
            mails.forEach((mail, index) => this.createMailRow(mail, index));
        }
        this.refreshMailTabs();
    }
    protected createMailRow(mail: MailData, index: number): void {
        if (!this.mailListRoot) return;
    
        if (this.createMailRowFromTemplate(mail, index)) {
            return;
        }
    
        const row = this.createNode(
            `MailRow_${mail.id}`,
            this.mailListRoot,
            HomeConfig.MAIL_ROW_WIDTH,
            HomeConfig.MAIL_ROW_HEIGHT,
            0,
            HomeConfig.MAIL_ROW_START_Y - index * HomeConfig.MAIL_ROW_GAP,
        );
        this.createSkinnedNode('MailRowSkin', row, HomeConfig.MAIL_ROW_WIDTH, HomeConfig.MAIL_ROW_HEIGHT, 0, 0, HomeConfig.UI_FRAME_MAIL_ROW).setSiblingIndex(0);
        this.bindScaledClick(row, () => {
            this.openMailDetail(mail.id);
        });
    
        const isUnread = mail.state === 0;
        if (isUnread) {
            this.createSkinnedNode('MailUnreadDot', row, 34, 34, HomeConfig.MAIL_ROW_UNREAD_DOT_X, HomeConfig.MAIL_ROW_UNREAD_DOT_Y, HomeConfig.UI_MAIL_UNREAD_DOT).setSiblingIndex(2);
        }
        const title = this.createLabel(row, 'MailRowTitle', mail.title, 25, -95, 36, 300, 36, new Color(72, 57, 43, 255));
        title.horizontalAlign = HorizontalTextAlignment.LEFT;
        const time = this.createLabel(row, 'MailRowTime', this.formatMailShortTime(mail.createTime), 21, 72, 36, 112, 32, new Color(91, 75, 58, 255));
        time.horizontalAlign = HorizontalTextAlignment.RIGHT;
        const preview = this.createLabel(row, 'MailRowPreview', this.getMailPreview(mail.content), 21, -55, -12, 380, 34, new Color(112, 92, 72, 255));
        preview.horizontalAlign = HorizontalTextAlignment.LEFT;
        this.configureMailRowClaimButton(row, mail);
    }
    protected createMailRowFromTemplate(mail: MailData, index: number): boolean {
        if (!this.mailListRoot || !this.mailRowTemplate) return false;
    
        const row = instantiate(this.mailRowTemplate);
        row.name = `MailRow_${mail.id}`;
        row.active = true;
        this.mailListRoot.addChild(row);
    
        const rowTransform = row.getComponent(UITransform) || row.addComponent(UITransform);
        rowTransform.setContentSize(HomeConfig.MAIL_ROW_WIDTH, HomeConfig.MAIL_ROW_HEIGHT);
        const rowSpacing = HomeConfig.MAIL_ROW_GAP;
        row.setPosition(0, HomeConfig.MAIL_ROW_START_Y - index * rowSpacing, 0);
    
        const skin = row.getChildByName('MailRowSkin');
        if (skin) {
            skin.setPosition(0, 0, 0);
            this.applyUiSkin(skin, HomeConfig.UI_FRAME_MAIL_ROW, HomeConfig.MAIL_ROW_WIDTH, HomeConfig.MAIL_ROW_HEIGHT);
            skin.setSiblingIndex(0);
        }
    
        const unreadDot = row.getChildByName('MailUnreadDot');
        if (unreadDot) {
            unreadDot.active = mail.state === 0;
            const transform = unreadDot.getComponent(UITransform);
            this.applyUiSkin(unreadDot, HomeConfig.UI_MAIL_UNREAD_DOT, transform?.contentSize.width || 34, transform?.contentSize.height || 34);
            unreadDot.setPosition(HomeConfig.MAIL_ROW_UNREAD_DOT_X, HomeConfig.MAIL_ROW_UNREAD_DOT_Y, 0);
        }
    
        this.setMailRowLabel(row, 'MailRowTitle', mail.title);
        this.setMailRowLabel(row, 'MailRowTime', this.formatMailShortTime(mail.createTime));
        this.setMailRowLabel(row, 'MailRowPreview', this.getMailPreview(mail.content));
        this.configureMailRowClaimButton(row, mail);
        this.bindScaledClick(row, () => this.openMailDetail(mail.id));
        return true;
    }
    protected setMailRowLabel(row: Node, labelName: string, text: string): void {
        const label = row.getChildByName(labelName)?.getComponent(Label);
        if (!label) return;
    
        label.string = text;
        const layout: Record<string, { x: number; y: number; width: number; height: number; align: HorizontalTextAlignment }> = {
            MailRowTitle: { x: -95, y: 36, width: 300, height: 36, align: HorizontalTextAlignment.LEFT },
            MailRowTime: { x: 72, y: 36, width: 112, height: 32, align: HorizontalTextAlignment.RIGHT },
            MailRowPreview: { x: -55, y: -12, width: 380, height: 34, align: HorizontalTextAlignment.LEFT },
        };
        const config = layout[labelName];
        if (config) {
            label.node.setPosition(config.x, config.y, 0);
            (label.node.getComponent(UITransform) || label.node.addComponent(UITransform)).setContentSize(config.width, config.height);
            label.horizontalAlign = config.align;
        }
        applySimKaiFont(label);
    }
    protected configureMailRowClaimButton(row: Node, mail: MailData): void {
        let button = row.getChildByName('MailRowClaimButton');
        if (!button) {
            button = this.createMailButton(
                row,
                'MailRowClaimButton',
                '\u9886\u53d6',
                HomeConfig.MAIL_ROW_CLAIM_BUTTON_X,
                0,
                HomeConfig.MAIL_ROW_CLAIM_BUTTON_WIDTH,
                HomeConfig.MAIL_ROW_CLAIM_BUTTON_HEIGHT,
                new Color(204, 238, 232, 0),
                () => this.claimMailReward(mail.id, false),
                HomeConfig.UI_BTN_CLAIM,
            );
        }
        button.active = mail.rewards.length > 0;
        button.setPosition(HomeConfig.MAIL_ROW_CLAIM_BUTTON_X, 0, 0);
        (button.getComponent(UITransform) || button.addComponent(UITransform)).setContentSize(
            HomeConfig.MAIL_ROW_CLAIM_BUTTON_WIDTH,
            HomeConfig.MAIL_ROW_CLAIM_BUTTON_HEIGHT,
        );
        const skin = button.getChildByName('MailRowClaimButtonSkin');
        if (skin) {
            this.applyUiSkin(
                skin,
                HomeConfig.UI_BTN_CLAIM,
                HomeConfig.MAIL_ROW_CLAIM_BUTTON_WIDTH,
                HomeConfig.MAIL_ROW_CLAIM_BUTTON_HEIGHT,
            );
        }
        this.ensureButtonText(button, 'MailRowClaimButtonLabel', '\u9886\u53d6');
        this.bindScaledClick(button, () => this.claimMailReward(mail.id, false));
        button.setSiblingIndex(row.children.length - 1);
    }
    protected clearMailListRuntimeChildren(): void {
        if (!this.mailListRoot) return;
    
        [...this.mailListRoot.children].forEach((child) => {
            if (child === this.mailRowTemplate || child.name === 'MailRowTemplate') {
                child.active = false;
                return;
            }
    
            child.active = false;
            child.destroy();
        });
    }
}
