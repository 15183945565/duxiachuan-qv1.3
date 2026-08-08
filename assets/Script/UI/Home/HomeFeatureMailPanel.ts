import {
    Color,
    EventTouch,
    Graphics,
    HorizontalTextAlignment,
    Label,
    Mask,
    Node,
    ScrollView,
    Sprite,
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
        this.mailListContent = null;
        this.mailListScrollView = null;
        this.mailRowTemplate = null;
        this.mailCountLabel = null;
        this.mailEmptyLabel = null;

        const boardSkin = this.findNode('MailBoardSkin', board);
        if (boardSkin) {
            const size = boardSkin.getComponent(UITransform)?.contentSize;
            this.applySlicedUiSkin(boardSkin, HomeConfig.UI_FRAME_MAIL, size?.width || 680, size?.height || 1120);
            boardSkin.setSiblingIndex(0);
        }
        this.ensureMailPanelTitle(board, true);

        const close = this.findNode('MailClose', board);
        if (close) {
            const size = close.getComponent(UITransform)?.contentSize;
            this.applyUiSkin(close, HomeConfig.UI_MAIL_BTN_CLOSE, size?.width || 77, size?.height || 71);
            this.bindScaledClick(close, () => this.closeMailPanel());
            close.setSiblingIndex((close.parent?.children.length || 1) - 1);
        }

        this.mailListRoot = this.findNode('MailListRoot', board);
        this.mailListContent = this.mailListRoot ? this.ensureMailListContent(this.mailListRoot, true) : null;
        this.mailRowTemplate = this.mailListContent ? this.findNode('MailRowTemplate', this.mailListContent) : null;
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
            (deleteButton.getComponent(UITransform) || deleteButton.addComponent(UITransform)).setContentSize(
                HomeConfig.MAIL_BUTTON_WIDTH,
                HomeConfig.MAIL_BUTTON_HEIGHT,
            );
            this.applyUiSkin(deleteButton, HomeConfig.UI_MAIL_BUTTON_BG, HomeConfig.MAIL_BUTTON_WIDTH, HomeConfig.MAIL_BUTTON_HEIGHT);
            this.bindScaledClick(deleteButton, () => this.deleteReadMails());
        }
        const claimButton = this.findNode('MailClaimAll', board);
        if (claimButton) {
            (claimButton.getComponent(UITransform) || claimButton.addComponent(UITransform)).setContentSize(
                HomeConfig.MAIL_BUTTON_WIDTH,
                HomeConfig.MAIL_BUTTON_HEIGHT,
            );
            this.applyUiSkin(claimButton, HomeConfig.UI_MAIL_BUTTON_BG, HomeConfig.MAIL_BUTTON_WIDTH, HomeConfig.MAIL_BUTTON_HEIGHT);
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
        this.mailListContent = null;
        this.mailListScrollView = null;
        this.mailCountLabel = null;
        this.mailRowTemplate = null;
        this.mailEmptyLabel = null;

        this.createSlicedSkinnedNode('MailBoardSkin', board, boardWidth, boardHeight, 0, 0, HomeConfig.UI_FRAME_MAIL).setSiblingIndex(0);
        this.ensureMailPanelTitle(board);
        this.createMailButton(board, 'MailClose', '', 294, 504, 77, 71, new Color(110, 72, 52, 0), () => this.closeMailPanel(), HomeConfig.UI_MAIL_BTN_CLOSE).setSiblingIndex(10);
        const tabsRoot = this.createNode('MailTabs', board, 430, 64, 0, 424);
        tabsRoot.setSiblingIndex(2);
        this.mailTabNodes.normal = this.createMailTab(tabsRoot, 'MailTabNormal', '\u666e\u901a', -136, 'normal');
        this.mailTabNodes.system = this.createMailTab(tabsRoot, 'MailTabSystem', '\u7cfb\u7edf', 0, 'system');
        const unreadTab = this.createMailTab(tabsRoot, 'MailTabUnread', '\u672a\u8bfb', 136, 'unread');
        this.mailTabNodes.unread = unreadTab;
        this.mailUnreadDot = this.createSkinnedNode(
            'MailTabUnreadDot',
            unreadTab,
            HomeConfig.GLOBAL_UNREAD_DOT_WIDTH,
            HomeConfig.GLOBAL_UNREAD_DOT_HEIGHT,
            48,
            16,
            HomeConfig.UI_MAIL_UNREAD_DOT,
        );

        this.mailListRoot = this.createNode('MailListRoot', board, 596, 760, 0, -18);
        this.mailListContent = this.ensureMailListContent(this.mailListRoot);
        this.mailListRoot.setSiblingIndex(3);
        this.createMailEmptyLabel();

        const bottom = this.createNode('MailBottomActions', board, 420, 70, 0, -486);
        bottom.setSiblingIndex(4);
        this.createMailButton(bottom, 'MailDeleteRead', '\u5220\u9664\u5df2\u8bfb', -92, 0, HomeConfig.MAIL_BUTTON_WIDTH, HomeConfig.MAIL_BUTTON_HEIGHT, new Color(204, 238, 232, 0), () => this.deleteReadMails(), HomeConfig.UI_MAIL_BUTTON_BG);
        this.createMailButton(bottom, 'MailClaimAll', '\u4e00\u952e\u9886\u53d6', 92, 0, HomeConfig.MAIL_BUTTON_WIDTH, HomeConfig.MAIL_BUTTON_HEIGHT, new Color(204, 238, 232, 0), () => this.claimAllMailRewards(), HomeConfig.UI_MAIL_BUTTON_BG);
    }
    protected ensureMailPanelTitle(board: Node, preserveEditorLayout = false): void {
        let titleSkin = this.findNode('MailTitleSkin', board);
        if (!titleSkin) {
            titleSkin = this.createSkinnedNode(
                'MailTitleSkin',
                board,
                HomeConfig.POPUP_TITLE_FRAME_WIDTH,
                HomeConfig.POPUP_TITLE_FRAME_HEIGHT,
                0,
                HomeConfig.POPUP_TITLE_Y,
                HomeConfig.UI_MAIL_TITLE_BG,
            );
        } else {
            titleSkin.active = true;
            const titleSkinTransform = titleSkin.getComponent(UITransform) || titleSkin.addComponent(UITransform);
            let width = titleSkinTransform.contentSize.width || HomeConfig.POPUP_TITLE_FRAME_WIDTH;
            let height = titleSkinTransform.contentSize.height || HomeConfig.POPUP_TITLE_FRAME_HEIGHT;
            if (!preserveEditorLayout) {
                titleSkin.setPosition(0, HomeConfig.POPUP_TITLE_Y, 0);
                width = HomeConfig.POPUP_TITLE_FRAME_WIDTH;
                height = HomeConfig.POPUP_TITLE_FRAME_HEIGHT;
                titleSkinTransform.setContentSize(width, height);
            } else if (!titleSkinTransform.contentSize.width || !titleSkinTransform.contentSize.height) {
                titleSkinTransform.setContentSize(width, height);
            }
            this.applyUiSkin(
                titleSkin,
                HomeConfig.UI_MAIL_TITLE_BG,
                width,
                height,
            );
        }
        if (!preserveEditorLayout) {
            titleSkin.setSiblingIndex(1);
        }

        let titleNode = this.findNode('MailTitle', board);
        let titleLabel = titleNode?.getComponent(Label) || null;
        let createdTitleLabel = false;
        if (!titleLabel) {
            createdTitleLabel = true;
            if (!titleNode) {
                titleLabel = this.createLabel(
                    board,
                    'MailTitle',
                    '\u90ae\u4ef6',
                    40,
                    0,
                    HomeConfig.POPUP_TITLE_Y,
                    HomeConfig.POPUP_TITLE_LABEL_WIDTH,
                    HomeConfig.POPUP_TITLE_LABEL_HEIGHT,
                    new Color(255, 250, 226, 255),
                );
            } else {
                titleLabel = titleNode.addComponent(Label);
            }
        }
        titleLabel.node.active = true;
        titleLabel.string = '\u90ae\u4ef6';
        const titleTransform = titleLabel.node.getComponent(UITransform) || titleLabel.node.addComponent(UITransform);
        if (!preserveEditorLayout || createdTitleLabel) {
            titleLabel.node.setPosition(0, HomeConfig.POPUP_TITLE_Y, 0);
            titleTransform.setContentSize(
                HomeConfig.POPUP_TITLE_LABEL_WIDTH,
                HomeConfig.POPUP_TITLE_LABEL_HEIGHT,
            );
            titleLabel.fontSize = 40;
            titleLabel.lineHeight = 50;
            titleLabel.horizontalAlign = HorizontalTextAlignment.CENTER;
            titleLabel.verticalAlign = VerticalTextAlignment.CENTER;
            titleLabel.color = new Color(255, 250, 226, 255);
            titleLabel.enableOutline = true;
            titleLabel.outlineColor = new Color(37, 71, 72, 255);
            titleLabel.outlineWidth = 3;
            applySimKaiFont(titleLabel);
        }
        if (!preserveEditorLayout) {
            titleLabel.node.setSiblingIndex(2);
        }
    }
    protected ensureMailListContent(viewport: Node, preserveEditorLayout = false): Node {
        const viewportTransform = viewport.getComponent(UITransform) || viewport.addComponent(UITransform);
        if (viewportTransform.contentSize.width <= 0 || viewportTransform.contentSize.height <= 0) {
            viewportTransform.setContentSize(596, 760);
        }
        const mask = viewport.getComponent(Mask) || viewport.addComponent(Mask);
        mask.type = Mask.Type.GRAPHICS_RECT;
        mask.enabled = true;

        let content = viewport.getChildByName('MailListContent');
        if (!content) {
            content = this.createNode(
                'MailListContent',
                viewport,
                viewportTransform.contentSize.width || 596,
                viewportTransform.contentSize.height || 760,
                0,
                0,
            );
        }
        content.active = true;
        if (!preserveEditorLayout) {
            content.setPosition(0, 0, 0);
        }
        const contentTransform = content.getComponent(UITransform) || content.addComponent(UITransform);
        if (!preserveEditorLayout || contentTransform.contentSize.width <= 0 || contentTransform.contentSize.height <= 0) {
            contentTransform.setContentSize(
                viewportTransform.contentSize.width || 596,
                viewportTransform.contentSize.height || 760,
            );
        }

        const template = viewport.getChildByName('MailRowTemplate');
        if (template) {
            template.setParent(content);
        }
        const empty = viewport.getChildByName('MailEmpty');
        if (empty) {
            empty.setParent(content);
        }
        const scroll = viewport.getComponent(ScrollView) || viewport.addComponent(ScrollView);
        scroll.content = content;
        scroll.horizontal = false;
        scroll.vertical = true;
        scroll.inertia = true;
        scroll.brake = 0.75;
        scroll.elastic = false;
        scroll.bounceDuration = 0;
        scroll.cancelInnerEvents = true;
        scroll.enabled = true;
        this.mailListScrollView = scroll;
        this.mailListContent = content;
        return content;
    }
    protected createMailEmptyLabel(): void {
        if (!this.mailListRoot) return;
        const parent = this.mailListContent || this.ensureMailListContent(this.mailListRoot, this.mailUsesEditorLayout);

        this.mailEmptyLabel = this.createLabel(parent, 'MailEmpty', '\u6682\u65e0\u90ae\u4ef6', 34, 0, 0, 360, 68, new Color(86, 58, 36, 255));
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
        this.createSkinnedNode(
            'MailUnreadDot',
            template,
            HomeConfig.GLOBAL_UNREAD_DOT_WIDTH,
            HomeConfig.GLOBAL_UNREAD_DOT_HEIGHT,
            HomeConfig.MAIL_ROW_UNREAD_DOT_X,
            HomeConfig.MAIL_ROW_UNREAD_DOT_Y,
            HomeConfig.UI_MAIL_UNREAD_DOT,
        ).setSiblingIndex(1);
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
            HomeConfig.UI_MAIL_BUTTON_BG,
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
        this.mailListContent = this.ensureMailListContent(this.mailListRoot, this.mailUsesEditorLayout);

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
        this.refreshMailListScroll(mails.length);
        this.refreshMailTabs();
    }
    protected refreshMailListScroll(mailCount: number): void {
        if (!this.mailListRoot || !this.mailListContent) return;

        const viewportTransform = this.mailListRoot.getComponent(UITransform) || this.mailListRoot.addComponent(UITransform);
        const viewportWidth = viewportTransform.contentSize.width || 596;
        const viewportHeight = viewportTransform.contentSize.height || 760;
        const rowHeight = this.mailRowTemplate?.getComponent(UITransform)?.contentSize.height || HomeConfig.MAIL_ROW_HEIGHT;
        const rowStartY = this.mailRowTemplate?.position.y ?? HomeConfig.MAIL_ROW_START_Y;
        const rowGap = HomeConfig.MAIL_ROW_GAP;
        const topEdge = mailCount > 0 ? rowStartY + rowHeight / 2 : viewportHeight / 2;
        const bottomEdge = mailCount > 0 ? rowStartY - (mailCount - 1) * rowGap - rowHeight / 2 : -viewportHeight / 2;
        const contentHeight = Math.max(viewportHeight, topEdge - bottomEdge + 36);
        const contentTransform = this.mailListContent.getComponent(UITransform) || this.mailListContent.addComponent(UITransform);
        contentTransform.setContentSize(viewportWidth, contentHeight);

        const maxScrollY = Math.max(0, -viewportHeight / 2 - bottomEdge + 36);
        const currentY = this.mailListContent.position.y || 0;
        this.mailListContent.setPosition(0, this.clamp(currentY, 0, maxScrollY), 0);
        const scroll = this.mailListScrollView || this.mailListRoot.getComponent(ScrollView);
        if (scroll) {
            scroll.content = this.mailListContent;
            scroll.horizontal = false;
            scroll.vertical = true;
            scroll.enabled = true;
            scroll.scrollToTop(0.01);
            return;
        }
        this.bindBagGridScroll(this.mailListRoot, this.mailListContent, maxScrollY);
        this.bindBagGridScroll(this.mailListContent, this.mailListContent, maxScrollY);
    }
    protected createMailRow(mail: MailData, index: number): void {
        if (!this.mailListRoot) return;
        const rowParent = this.mailListContent || this.ensureMailListContent(this.mailListRoot, this.mailUsesEditorLayout);
    
        if (this.createMailRowFromTemplate(mail, index)) {
            return;
        }
    
        const row = this.createNode(
            `MailRow_${mail.id}`,
            rowParent,
            HomeConfig.MAIL_ROW_WIDTH,
            HomeConfig.MAIL_ROW_HEIGHT,
            0,
            HomeConfig.MAIL_ROW_START_Y - index * HomeConfig.MAIL_ROW_GAP,
        );
        this.createSkinnedNode('MailRowSkin', row, HomeConfig.MAIL_ROW_WIDTH, HomeConfig.MAIL_ROW_HEIGHT, 0, 0, HomeConfig.UI_FRAME_MAIL_ROW).setSiblingIndex(0);
        this.bindGridItemTap(row, () => {
            this.openMailDetail(mail.id);
        });
    
        const isUnread = mail.state === 0;
        if (isUnread) {
            this.createSkinnedNode(
                'MailUnreadDot',
                row,
                HomeConfig.GLOBAL_UNREAD_DOT_WIDTH,
                HomeConfig.GLOBAL_UNREAD_DOT_HEIGHT,
                HomeConfig.MAIL_ROW_UNREAD_DOT_X,
                HomeConfig.MAIL_ROW_UNREAD_DOT_Y,
                HomeConfig.UI_MAIL_UNREAD_DOT,
            ).setSiblingIndex(2);
        }
        const title = this.createLabel(row, 'MailRowTitle', mail.title, 25, -95, 36, 300, 36, new Color(72, 57, 43, 255));
        title.horizontalAlign = HorizontalTextAlignment.LEFT;
        const time = this.createLabel(row, 'MailRowTime', this.formatMailShortTime(mail.createTime), 21, 72, 36, 112, 32, new Color(91, 75, 58, 255));
        time.horizontalAlign = HorizontalTextAlignment.RIGHT;
        const preview = this.createLabel(row, 'MailRowPreview', this.getMailPreview(mail.content), 21, -55, -12, 380, 34, new Color(112, 92, 72, 255));
        preview.horizontalAlign = HorizontalTextAlignment.LEFT;
        this.configureMailRowClaimButton(row, mail);
        this.applyMailRowClaimedVisualState(row, mail);
    }
    protected createMailRowFromTemplate(mail: MailData, index: number): boolean {
        if (!this.mailListRoot || !this.mailRowTemplate) return false;
        const rowParent = this.mailListContent || this.ensureMailListContent(this.mailListRoot, this.mailUsesEditorLayout);
    
        const row = instantiate(this.mailRowTemplate);
        row.name = `MailRow_${mail.id}`;
        row.active = true;
        rowParent.addChild(row);
    
        const preserveTemplateLayout = this.mailUsesEditorLayout;
        const rowTransform = row.getComponent(UITransform) || row.addComponent(UITransform);
        if (!preserveTemplateLayout) {
            rowTransform.setContentSize(HomeConfig.MAIL_ROW_WIDTH, HomeConfig.MAIL_ROW_HEIGHT);
        } else if (!rowTransform.contentSize.width || !rowTransform.contentSize.height) {
            rowTransform.setContentSize(HomeConfig.MAIL_ROW_WIDTH, HomeConfig.MAIL_ROW_HEIGHT);
        }
        const rowSpacing = HomeConfig.MAIL_ROW_GAP;
        row.setPosition(
            preserveTemplateLayout ? this.mailRowTemplate.position.x : 0,
            (preserveTemplateLayout ? this.mailRowTemplate.position.y : HomeConfig.MAIL_ROW_START_Y) - index * rowSpacing,
            preserveTemplateLayout ? this.mailRowTemplate.position.z : 0,
        );
    
        const skin = row.getChildByName('MailRowSkin');
        if (skin) {
            const skinTransform = skin.getComponent(UITransform);
            if (!preserveTemplateLayout) {
                skin.setPosition(0, 0, 0);
            }
            this.applyUiSkin(
                skin,
                HomeConfig.UI_FRAME_MAIL_ROW,
                preserveTemplateLayout ? skinTransform?.contentSize.width || HomeConfig.MAIL_ROW_WIDTH : HomeConfig.MAIL_ROW_WIDTH,
                preserveTemplateLayout ? skinTransform?.contentSize.height || HomeConfig.MAIL_ROW_HEIGHT : HomeConfig.MAIL_ROW_HEIGHT,
            );
            skin.setSiblingIndex(0);
        }
    
        const unreadDot = row.getChildByName('MailUnreadDot');
        if (unreadDot) {
            const showUnreadDot = mail.state === 0;
            unreadDot.active = showUnreadDot;
            if (!showUnreadDot) {
                this.skinApplyVersions.set(unreadDot, ++this.skinApplyVersion);
            } else {
                const unreadTransform = unreadDot.getComponent(UITransform) || unreadDot.addComponent(UITransform);
                if (!preserveTemplateLayout) {
                    unreadTransform.setContentSize(
                        HomeConfig.GLOBAL_UNREAD_DOT_WIDTH,
                        HomeConfig.GLOBAL_UNREAD_DOT_HEIGHT,
                    );
                    unreadDot.setPosition(HomeConfig.MAIL_ROW_UNREAD_DOT_X, HomeConfig.MAIL_ROW_UNREAD_DOT_Y, 0);
                }
                this.applyUiSkin(
                    unreadDot,
                    HomeConfig.UI_MAIL_UNREAD_DOT,
                    unreadTransform.contentSize.width || HomeConfig.GLOBAL_UNREAD_DOT_WIDTH,
                    unreadTransform.contentSize.height || HomeConfig.GLOBAL_UNREAD_DOT_HEIGHT,
                );
            }
        }
    
        this.setMailRowLabel(row, 'MailRowTitle', mail.title, preserveTemplateLayout);
        this.setMailRowLabel(row, 'MailRowTime', this.formatMailShortTime(mail.createTime), preserveTemplateLayout);
        this.setMailRowLabel(row, 'MailRowPreview', this.getMailPreview(mail.content), preserveTemplateLayout);
        this.configureMailRowClaimButton(row, mail, preserveTemplateLayout);
        this.applyMailRowClaimedVisualState(row, mail);
        this.bindGridItemTap(row, () => this.openMailDetail(mail.id));
        return true;
    }
    protected setMailRowLabel(row: Node, labelName: string, text: string, preserveEditorLayout = false): void {
        const label = row.getChildByName(labelName)?.getComponent(Label);
        if (!label) return;
    
        const transform = label.node.getComponent(UITransform);
        const editorWidth = transform?.contentSize.width || 0;
        const editorHeight = transform?.contentSize.height || 0;
        label.string = text;
        if (preserveEditorLayout) {
            if (transform && editorWidth > 0 && editorHeight > 0) {
                transform.setContentSize(editorWidth, editorHeight);
            }
            return;
        }

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
    protected configureMailRowClaimButton(row: Node, mail: MailData, preserveEditorLayout = false): void {
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
                HomeConfig.UI_MAIL_BUTTON_BG,
            );
        }
        const claimed = mail.state === 2;
        button.active = mail.rewards.length > 0;
        const buttonTransform = button.getComponent(UITransform) || button.addComponent(UITransform);
        if (!preserveEditorLayout) {
            button.setPosition(HomeConfig.MAIL_ROW_CLAIM_BUTTON_X, 0, 0);
            buttonTransform.setContentSize(
                HomeConfig.MAIL_ROW_CLAIM_BUTTON_WIDTH,
                HomeConfig.MAIL_ROW_CLAIM_BUTTON_HEIGHT,
            );
        }
        const skin = button.getChildByName('MailRowClaimButtonSkin');
        if (skin) {
            const skinTransform = skin.getComponent(UITransform);
            this.applyUiSkin(
                skin,
                HomeConfig.UI_MAIL_BUTTON_BG,
                preserveEditorLayout ? skinTransform?.contentSize.width || buttonTransform.contentSize.width || HomeConfig.MAIL_ROW_CLAIM_BUTTON_WIDTH : HomeConfig.MAIL_ROW_CLAIM_BUTTON_WIDTH,
                preserveEditorLayout ? skinTransform?.contentSize.height || buttonTransform.contentSize.height || HomeConfig.MAIL_ROW_CLAIM_BUTTON_HEIGHT : HomeConfig.MAIL_ROW_CLAIM_BUTTON_HEIGHT,
            );
        }
        const label = button.getChildByName('MailRowClaimButtonLabel')?.getComponent(Label);
        const buttonText = claimed ? '\u5df2\u9886\u53d6' : '\u9886\u53d6';
        if (label && preserveEditorLayout) {
            label.string = buttonText;
        } else {
            this.ensureButtonText(button, 'MailRowClaimButtonLabel', buttonText);
        }
        this.bindScaledClick(button, () => {
            if (claimed) {
                this.showToast('\u5956\u52b1\u5df2\u9886\u53d6');
                return;
            }
            this.claimMailReward(mail.id, false);
        });
        button.setSiblingIndex(row.children.length - 1);
    }
    protected applyMailRowClaimedVisualState(row: Node, mail: MailData): void {
        this.setMailRowUnreadDotVisible(row, mail.state === 0);
        if (mail.state !== 2) {
            const overlay = row.getChildByName('MailRowClaimedDimOverlay');
            if (overlay) {
                overlay.active = false;
            }
            return;
        }

        const rowTransform = row.getComponent(UITransform) || row.addComponent(UITransform);
        const rowWidth = rowTransform.contentSize.width || HomeConfig.MAIL_ROW_WIDTH;
        const rowHeight = rowTransform.contentSize.height || HomeConfig.MAIL_ROW_HEIGHT;
        let overlay = row.getChildByName('MailRowClaimedDimOverlay');
        if (!overlay) {
            overlay = this.createNode('MailRowClaimedDimOverlay', row, rowWidth, rowHeight, 0, 0);
        }
        overlay.active = true;
        overlay.setPosition(0, 0, 0);
        (overlay.getComponent(UITransform) || overlay.addComponent(UITransform)).setContentSize(rowWidth, rowHeight);
        const legacyGraphics = overlay.getComponent(Graphics);
        if (legacyGraphics) {
            legacyGraphics.enabled = false;
        }
        const overlaySprite = overlay.getComponent(Sprite) || overlay.addComponent(Sprite);
        overlaySprite.color = new Color(0, 0, 0, 92);
        overlaySprite.grayscale = false;
        this.applyUiSkinKeepingEditorSize(overlay, HomeConfig.UI_FRAME_MAIL_ROW, rowWidth, rowHeight);
        overlay.setSiblingIndex(row.children.length - 1);
    }
    protected setMailRowUnreadDotVisible(row: Node, visible: boolean): void {
        const visit = (node: Node): void => {
            if (node.name === 'MailUnreadDot' || node.name.includes('UnreadDot')) {
                node.active = visible;
                if (!visible) {
                    this.skinApplyVersions.set(node, ++this.skinApplyVersion);
                }
            }
            node.children.forEach(visit);
        };

        row.children.forEach(visit);
    }
    protected clearMailListRuntimeChildren(): void {
        if (!this.mailListRoot) return;
        const content = this.mailListContent || this.ensureMailListContent(this.mailListRoot, this.mailUsesEditorLayout);
    
        [...content.children].forEach((child) => {
            if (child === this.mailRowTemplate || child.name === 'MailRowTemplate') {
                child.active = false;
                return;
            }
    
            child.active = false;
            child.destroy();
        });
    }
}
