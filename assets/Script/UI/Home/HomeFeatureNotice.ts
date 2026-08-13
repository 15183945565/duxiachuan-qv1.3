import {
    Color,
    EventTouch,
    Graphics,
    HorizontalTextAlignment,
    instantiate,
    Label,
    Mask,
    Node,
    Overflow,
    ScrollView,
    Tween,
    tween,
    UITransform,
    Vec3,
    VerticalTextAlignment,
    sys,
} from 'cc';
import { applySimKaiFont } from '../Common/UIFont';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';
import {
    NoticeData,
    NoticeType,
} from './HomeTypes';

/**
 * 公告弹窗及公告文章渲染。
 *
 * 公告数据和编辑器节点引用由 HomeViewBase 持有，本类只提供无状态行为。
 * 九宫格皮肤能力通过 HomeViewBase 的抽象契约由后续 Community 共享实现提供。
 */
export abstract class HomeFeatureNotice extends HomeViewBase {
    protected ensureNoticeData(): void {
        if (this.noticeData.length > 0) return;

        this.noticeData = this.createDefaultNotices();
        this.selectedNoticeId = this.noticeData[0]?.id || '';
        this.noticeExpanded = false;
    }

    protected createDefaultNotices(): NoticeData[] {
        return [
            {
                id: 'duxia_open_notice',
                title: '\u72ec\u4fa0\u4f20\u6700\u65b0\u516c\u544a',
                time: '2026\u5e748\u670813\u65e5',
                type: 'notice',
                collapseContent: '\u4eb2\u7231\u7684\u4fa0\u5ba2\u4eec......\u9b54\u754c\u3001\u517d\u8109\u4e0e\u793c\u5305\u5df2\u5f00\u653e\u4f53\u9a8c\u3002',
                content: '\u4eb2\u7231\u7684\u4fa0\u5ba2\u4eec\uff0c\u72ec\u4fa0\u4f20\u8fd1\u671f\u5df2\u5f00\u653e\u591a\u4e2a\u65b0\u529f\u80fd\uff0c\u6b22\u8fce\u5927\u5bb6\u8fdb\u5165\u6c5f\u6e56\u4f53\u9a8c\u3002\n\n1. \u9b54\u754c\u73a9\u6cd5\u5df2\u5f00\u653e\u4e00\u91cd\u81f3\u4e5d\u91cd\u5c42\u6570\u6311\u6218\uff0c\u4e0d\u540c\u9b54\u754c\u5c06\u6709\u5bf9\u5e94\u7684\u5996\u602a\u4e0e\u653b\u51fb\u529b\u9650\u5236\u3002\n2. \u9b54\u754c\u623f\u95f4\u652f\u6301\u591a\u4eba\u540c\u5c4f\u4f53\u9a8c\u7684\u57fa\u7840\u8868\u73b0\uff0c\u73a9\u5bb6\u53ef\u901a\u8fc7\u4fdd\u62a4\u5361\u548c\u6218\u529b\u5361\u83b7\u5f97\u5bf9\u5e94\u6548\u679c\u3002\n3. \u5f02\u517d\u517d\u8109\u5df2\u52a0\u5165\u6fc0\u6d3b\u3001\u4ea7\u51fa\u8bb0\u5f55\u4e0e\u5f3a\u5316\u9875\u9762\uff0c\u5f02\u517d\u5361\u751f\u6548\u540e\u624d\u4f1a\u663e\u793a\u6b63\u5e38\u52a8\u753b\u3002\n4. \u90ae\u4ef6\u3001\u80cc\u5305\u3001\u56fe\u9274\u548c\u5546\u94fa\u7684\u591a\u5904\u754c\u9762\u5df2\u8fdb\u884c\u89c6\u89c9\u6574\u7406\uff0c\u540e\u7eed\u4f1a\u7ee7\u7eed\u6839\u636e\u5b9e\u673a\u6548\u679c\u8c03\u6574\u3002\n\n\u611f\u8c22\u5404\u4f4d\u4fa0\u5ba2\u7684\u652f\u6301\u548c\u53cd\u9988\uff0c\u6211\u4eec\u4f1a\u6301\u7eed\u628a\u6c5f\u6e56\u6253\u78e8\u5f97\u66f4\u7a33\u3001\u66f4\u597d\u73a9\u3002',
            },
            {
                id: 'experience_adjust_notice',
                title: '\u4f53\u9a8c\u8c03\u6574\u8bf4\u660e',
                time: '2026\u5e748\u670813\u65e5',
                type: 'notice',
                collapseContent: '\u4eb2\u7231\u7684\u4fa0\u5ba2\u4eec......\u672c\u6b21\u4e3b\u8981\u8c03\u6574\u754c\u9762\u4e0e\u6218\u6597\u8868\u73b0\u3002',
                content: '\u4eb2\u7231\u7684\u4fa0\u5ba2\u4eec\uff0c\u4e3a\u4e86\u8ba9\u6e38\u620f\u6d41\u7a0b\u66f4\u6e05\u6670\uff0c\u6211\u4eec\u5bf9\u4ee5\u4e0b\u4f53\u9a8c\u8fdb\u884c\u4e86\u8c03\u6574\u3002\n\n1. \u8d85\u503c\u793c\u5305\u8d2d\u4e70\u540e\u5c06\u6709\u6750\u6599\u98de\u5165\u80cc\u5305\u7684\u6536\u83b7\u8868\u73b0\uff0c\u7ed3\u7b97\u611f\u66f4\u660e\u786e\u3002\n2. \u9b54\u754c\u6311\u6218\u5185\u7684\u602a\u7269\u5f85\u673a\u3001\u53d7\u51fb\u3001\u8840\u91cf\u53d8\u5316\u548c\u51b3\u6597\u8868\u73b0\u5df2\u505a\u9636\u6bb5\u6027\u6574\u7406\u3002\n3. \u80cc\u5305\u88c5\u5907\u5df2\u6309\u7b49\u7ea7\u9636\u6bb5\u663e\u793a\u5bf9\u5e94\u56fe\u6807\u548c\u7279\u6548\u6846\uff0c\u540e\u7eed\u63a5\u5165\u771f\u5b9e\u6570\u636e\u540e\u4f1a\u7ee7\u7eed\u5bf9\u9f50\u3002\n4. \u516c\u544a\u9875\u5df2\u6539\u4e3a\u53ef\u5c55\u5f00\u5f0f\u663e\u793a\uff0c\u5c55\u5f00\u540e\u53ef\u67e5\u770b\u5b8c\u6574\u5185\u5bb9\u3002',
            },
        ];
    }

    protected openNoticePanel(): void {
        this.ensureNoticeData();
        this.buildNoticePanel();
        if (!this.noticePanel) return;

        this.noticePanel.active = true;
        this.ensureInputBlocker(this.noticePanel);
        this.noticePanel.setSiblingIndex((this.noticePanel.parent?.children.length || 1) - 1);
        sys.localStorage.setItem(HomeConfig.NOTICE_LAST_OPEN_KEY, this.formatTodayKey());
        this.refreshNoticePanel();

        if (this.noticeBoard) {
            Tween.stopAllByTarget(this.noticeBoard);
            this.noticeBoard.setScale(0.94, 0.94, 1);
            tween(this.noticeBoard).to(0.14, { scale: new Vec3(1, 1, 1) }, { easing: 'sineOut' }).start();
        }
    }

    protected buildNoticePanel(): void {
        if (this.noticePanel) return;

        const editorNoticePanel = this.findNode('NoticePanel');
        if (editorNoticePanel) {
            this.bindEditorNoticePanel(editorNoticePanel);
            return;
        }

        const popupParent = this.popupRoot || this.node;
        this.noticePanel = this.createNode('NoticePanel', popupParent, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        this.noticePanel.active = false;
        this.noticePanel.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);
        this.drawRect(this.noticePanel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, new Color(0, 0, 0, 140));

        this.noticeBoard = this.createNode('NoticeBoard', this.noticePanel, 680, 1120, 0, 0);
        this.createSlicedSkinnedNode('NoticeBoardSkin', this.noticeBoard, 680, 1120, 0, 0, HomeConfig.UI_FRAME_NOTICE).setSiblingIndex(0);
        const title = this.createLabel(this.noticeBoard, 'NoticeTitle', '\u516c\u544a', 40, 0, 506, 260, 58, new Color(255, 250, 226, 255));
        title.enableOutline = true;
        title.outlineColor = new Color(37, 71, 72, 255);
        title.outlineWidth = 3;
        this.ensureNoticePanelTitleFrame();
        this.createMailButton(this.noticeBoard, 'NoticeClose', '', 294, 504, 72, 72, new Color(110, 72, 52, 0), () => this.closeNoticePanel(), HomeConfig.UI_NOTICE_BTN_CLOSE).setSiblingIndex(8);

        this.noticeScrollNode = this.createNode('NoticeScrollView', this.noticeBoard, 596, 930, 0, -38);
        this.noticeScrollContent = this.createNode('NoticeScrollContent', this.noticeScrollNode, 596, 930, 0, 0);
        this.noticeArticleTemplate = this.createNoticeArticleTemplate(this.noticeScrollContent);
        this.setupNoticeScrollView(this.noticeScrollNode, this.noticeScrollContent);
    }

    protected bindEditorNoticePanel(panel: Node): void {
        this.noticePanel = panel;
        if (this.popupRoot && panel.parent !== this.popupRoot) {
            panel.setParent(this.popupRoot);
        }
        panel.active = false;
        if (!panel.getComponent(Graphics)) {
            this.drawRect(panel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, new Color(0, 0, 0, 140));
        }
        panel.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);

        this.noticeBoard = this.findNode('NoticeBoard', panel);
        if (!this.noticeBoard) {
            console.warn('[MainHomeView] NoticePanel \u7f3a\u5c11 NoticeBoard\uff0c\u5df2\u56de\u9000\u5230\u4ee3\u7801\u751f\u6210\u516c\u544a\u5f39\u7a97');
            this.noticePanel = null;
            return;
        }

        const boardSkin = this.findNode('NoticeBoardSkin', this.noticeBoard);
        if (boardSkin) {
            const size = boardSkin.getComponent(UITransform)?.contentSize;
            this.applySlicedUiSkin(boardSkin, HomeConfig.UI_FRAME_NOTICE, size?.width || 680, size?.height || 1120);
        }
        this.ensureNoticePanelTitleFrame(true);
        const titleLabel = this.findNode('NoticeTitle', this.noticeBoard)?.getComponent(Label);
        if (titleLabel) {
            titleLabel.string = '\u516c\u544a';
            titleLabel.node.active = true;
        }
        const close = this.findNode('NoticeClose', this.noticeBoard);
        if (close) {
            const size = close.getComponent(UITransform)?.contentSize;
            this.applyUiSkin(close, HomeConfig.UI_NOTICE_BTN_CLOSE, size?.width || 72, size?.height || 72);
            this.bindScaledClick(close, () => this.closeNoticePanel());
        }

        this.noticeListRoot = null;
        this.noticeContentRoot = null;
        this.noticeDetailTitleLabel = null;
        this.noticeDetailTimeLabel = null;
        this.noticeDetailContentLabel = null;
        this.noticeToggleHintLabel = null;
        this.noticeScrollNode = this.findNode('NoticeScrollView', this.noticeBoard);
        this.noticeScrollContent = this.noticeScrollNode ? this.findNode('NoticeScrollContent', this.noticeScrollNode) : null;
        if (!this.noticeScrollNode || !this.noticeScrollContent) {
            console.warn('[MainHomeView] NoticePanel \u7f3a\u5c11 NoticeScrollView/NoticeScrollContent\uff0c\u516c\u544a\u6eda\u52a8\u5185\u5bb9\u5c06\u65e0\u6cd5\u663e\u793a');
            return;
        }

        this.noticeArticleTemplate = this.findNode('NoticeArticleTemplate', this.noticeScrollContent);
        if (!this.noticeArticleTemplate) {
            this.noticeArticleTemplate = this.createNoticeArticleTemplate(this.noticeScrollContent);
        }
        this.noticeArticleTemplate.active = false;
        this.setupNoticeScrollView(this.noticeScrollNode, this.noticeScrollContent);
    }

    protected ensureNoticePanelTitleFrame(preserveEditorLayout = false): void {
        if (!this.noticeBoard) return;

        let titleSkin = this.findNode('NoticeTitleSkin', this.noticeBoard);
        if (!titleSkin) {
            titleSkin = this.createSkinnedNode(
                'NoticeTitleSkin',
                this.noticeBoard,
                HomeConfig.POPUP_TITLE_FRAME_WIDTH,
                HomeConfig.POPUP_TITLE_FRAME_HEIGHT,
                0,
                HomeConfig.POPUP_TITLE_Y,
                HomeConfig.UI_POPUP_TITLE_BG,
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
                HomeConfig.UI_POPUP_TITLE_BG,
                width,
                height,
            );
        }
        if (!preserveEditorLayout) {
            titleSkin.setSiblingIndex(1);
        }

        const titleLabel = this.findNode('NoticeTitle', this.noticeBoard)?.getComponent(Label);
        if (titleLabel && !preserveEditorLayout) {
            titleLabel.node.setSiblingIndex(2);
        }
    }

    protected closeNoticePanel(): void {
        if (!this.noticePanel) return;

        this.noticePanel.active = false;
        this.showToast('\u516c\u544a\u5df2\u5173\u95ed');
    }

    protected refreshNoticePanel(): void {
        if (!this.noticeScrollContent) return;

        this.clearNoticeArticleRuntimeChildren();
        const notices = this.noticeData.length > 0
            ? this.noticeData
            : [{
                id: 'empty_notice',
                title: '\u6682\u65e0\u516c\u544a',
                time: '',
                type: 'notice' as NoticeType,
                collapseContent: '',
                content: '\u6682\u65e0\u516c\u544a\uff0c\u540e\u7eed\u63a5\u5165\u670d\u52a1\u5668\u540e\u4f1a\u81ea\u52a8\u5237\u65b0\u3002',
            }];

        const scrollHeight = this.noticeScrollNode?.getComponent(UITransform)?.contentSize.height || 930;
        const gap = 20;
        const topPadding = 18;
        const bottomPadding = 18;
        const sectionHeights = notices.map((notice) => this.calculateNoticeArticleHeight(notice));
        const rawHeight = topPadding + bottomPadding + sectionHeights.reduce((sum, value) => sum + value, 0) + Math.max(0, notices.length - 1) * gap;
        const contentHeight = Math.max(scrollHeight, rawHeight);
        const contentTransform = this.noticeScrollContent.getComponent(UITransform) || this.noticeScrollContent.addComponent(UITransform);
        contentTransform.setContentSize(contentTransform.contentSize.width || 596, contentHeight);

        const templateTransform = this.noticeArticleTemplate?.getComponent(UITransform);
        const templateHeight = templateTransform?.contentSize.height || 120;
        const templateBaseX = this.noticeArticleTemplate?.position.x || 0;
        const templateBaseY = this.noticeArticleTemplate?.position.y || (contentHeight / 2 - topPadding - templateHeight / 2);
        let cursorTopY = templateBaseY + templateHeight / 2;
        notices.forEach((notice, index) => {
            const height = sectionHeights[index];
            const article = this.createNoticeArticleFromTemplate(notice, index, height);
            article.setPosition(templateBaseX, cursorTopY - height / 2, 0);
            cursorTopY -= height + gap;
        });

        this.noticeScrollView?.scrollToTop(0.01);
    }

    protected createNoticeArticleTemplate(parent: Node): Node {
        const template = this.createNode('NoticeArticleTemplate', parent, 616, 120, 0, 387);
        template.active = false;
        this.createSlicedSkinnedNode('NoticeArticleBg', template, 616, 120, 0, 0, HomeConfig.UI_FRAME_NOTICE_CONTENT).setSiblingIndex(0);
        this.createSkinnedNode('NoticeArticleTitleBg', template, 460, 42, -38, 33, HomeConfig.UI_NOTICE_TITLE_BG).setSiblingIndex(1);
        const title = this.createLabel(template, 'NoticeArticleTitle', '\u72ec\u4fa0\u4f20\u6700\u65b0\u516c\u544a', 23, -38, 35, 410, 38, new Color(96, 58, 28, 255));
        title.enableOutline = true;
        title.outlineColor = new Color(255, 246, 212, 255);
        title.outlineWidth = 2;
        const content = this.createLabel(template, 'NoticeArticleContent', '', 22, -6, -24, 510, 54, new Color(104, 62, 36, 255));
        content.lineHeight = 30;
        content.horizontalAlign = HorizontalTextAlignment.LEFT;
        content.verticalAlign = VerticalTextAlignment.TOP;
        content.enableWrapText = true;
        content.overflow = Overflow.RESIZE_HEIGHT;
        this.createSkinnedNode('NoticeArticleToggle', template, 76, 76, 264, 26, HomeConfig.UI_NOTICE_DROPDOWN_BTN).setSiblingIndex(4);
        return template;
    }

    protected createNoticeArticleFromTemplate(notice: NoticeData, index: number, height: number): Node {
        let article: Node;
        if (this.noticeArticleTemplate) {
            article = instantiate(this.noticeArticleTemplate);
            article.name = `NoticeArticle_${notice.id}`;
            article.active = true;
            this.noticeScrollContent?.addChild(article);
        } else {
            article = this.createNoticeArticleTemplate(this.noticeScrollContent!);
            article.name = `NoticeArticle_${notice.id}`;
            article.active = true;
        }

        const articleTransform = article.getComponent(UITransform) || article.addComponent(UITransform);
        const expanded = this.noticeExpanded && this.selectedNoticeId === notice.id;
        const templateTransform = this.noticeArticleTemplate?.getComponent(UITransform);
        const templateHeight = templateTransform?.contentSize.height || 120;
        const width = templateTransform?.contentSize.width || 616;
        const getTemplateChild = (name: string): Node | null => this.noticeArticleTemplate?.getChildByName(name) || null;
        const getTemplateChildX = (name: string, fallback: number): number => getTemplateChild(name)?.position.x ?? fallback;
        const getTemplateCenterTopOffset = (name: string, fallback: number): number => {
            const child = getTemplateChild(name);
            return child ? templateHeight / 2 - child.position.y : fallback;
        };
        const getTemplateTopEdgeOffset = (name: string, fallback: number): number => {
            const child = getTemplateChild(name);
            if (!child) return fallback;

            const childHeight = child.getComponent(UITransform)?.contentSize.height || 0;
            return templateHeight / 2 - (child.position.y + childHeight / 2);
        };
        articleTransform.setContentSize(width, height);

        const bg = article.getChildByName('NoticeArticleBg');
        if (bg) {
            this.applySlicedUiSkin(bg, HomeConfig.UI_FRAME_NOTICE_CONTENT, width, height);
        }

        let titleBg = article.getChildByName('NoticeArticleTitleBg');
        if (!titleBg) {
            titleBg = this.createSkinnedNode('NoticeArticleTitleBg', article, 460, 42, getTemplateChildX('NoticeArticleTitleBg', -38), height / 2 - getTemplateCenterTopOffset('NoticeArticleTitleBg', 30), HomeConfig.UI_NOTICE_TITLE_BG);
        }
        if (titleBg) {
            this.applyUiSkin(titleBg, HomeConfig.UI_NOTICE_TITLE_BG, 460, 42);
            titleBg.setPosition(getTemplateChildX('NoticeArticleTitleBg', -38), height / 2 - getTemplateCenterTopOffset('NoticeArticleTitleBg', 30), 0);
            titleBg.setSiblingIndex(1);
        }

        const titleLabel = article.getChildByName('NoticeArticleTitle')?.getComponent(Label);
        if (titleLabel) {
            titleLabel.string = notice.title;
            titleLabel.fontSize = 23;
            titleLabel.lineHeight = 30;
            titleLabel.color = new Color(96, 58, 28, 255);
            titleLabel.node.setPosition(getTemplateChildX('NoticeArticleTitle', -38), height / 2 - getTemplateCenterTopOffset('NoticeArticleTitle', 28), 0);
            applySimKaiFont(titleLabel);
        }

        const contentLabel = article.getChildByName('NoticeArticleContent')?.getComponent(Label);
        if (contentLabel) {
            const text = expanded ? notice.content : notice.collapseContent;
            const textWidth = 510;
            contentLabel.fontSize = 22;
            contentLabel.lineHeight = 30;
            const textHeight = expanded
                ? this.estimateNoticeTextHeight(text, textWidth, contentLabel.fontSize || 22, contentLabel.lineHeight || 30)
                : 30;
            const contentTransform = contentLabel.node.getComponent(UITransform) || contentLabel.node.addComponent(UITransform);
            contentTransform.setContentSize(textWidth, textHeight);
            contentLabel.string = text;
            contentLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
            contentLabel.verticalAlign = VerticalTextAlignment.TOP;
            contentLabel.enableWrapText = expanded;
            contentLabel.overflow = expanded ? Overflow.RESIZE_HEIGHT : Overflow.CLAMP;
            contentLabel.node.setPosition(getTemplateChildX('NoticeArticleContent', -10), height / 2 - getTemplateTopEdgeOffset('NoticeArticleContent', 82) - textHeight / 2, 0);
            applySimKaiFont(contentLabel);
        }

        let toggle = article.getChildByName('NoticeArticleToggle');
        if (!toggle) {
            toggle = this.createSkinnedNode('NoticeArticleToggle', article, 76, 76, getTemplateChildX('NoticeArticleToggle', 264), height / 2 - getTemplateCenterTopOffset('NoticeArticleToggle', 35), HomeConfig.UI_NOTICE_DROPDOWN_BTN);
        }
        if (toggle) {
            this.applyUiSkin(toggle, HomeConfig.UI_NOTICE_DROPDOWN_BTN, 76, 76);
            toggle.active = true;
            toggle.setPosition(getTemplateChildX('NoticeArticleToggle', 264), height / 2 - getTemplateCenterTopOffset('NoticeArticleToggle', 35), 0);
            toggle.setRotationFromEuler(0, 0, expanded ? 180 : 0);
            toggle.setSiblingIndex(5);
            this.bindScaledClick(toggle, () => this.toggleNoticeArticle(notice.id));
        }

        article.setSiblingIndex(index + 1);
        return article;
    }

    protected calculateNoticeArticleHeight(notice: NoticeData): number {
        const templateText = this.noticeArticleTemplate?.getChildByName('NoticeArticleContent');
        const textLabel = templateText?.getComponent(Label);
        const textWidth = 510;
        const fontSize = textLabel?.fontSize || 24;
        const lineHeight = 30;
        if (!(this.noticeExpanded && this.selectedNoticeId === notice.id)) {
            return 120;
        }
        const textHeight = this.estimateNoticeTextHeight(notice.content, textWidth, fontSize, lineHeight);
        return Math.max(174, 112 + textHeight);
    }

    protected toggleNoticeArticle(noticeId: string): void {
        const expanding = this.selectedNoticeId !== noticeId || !this.noticeExpanded;
        this.selectedNoticeId = noticeId;
        this.noticeExpanded = expanding;
        this.refreshNoticePanel();
    }

    protected estimateNoticeTextHeight(text: string, width: number, fontSize: number, lineHeight: number): number {
        const charsPerLine = Math.max(1, Math.floor(width / Math.max(1, fontSize * 0.86)));
        const lines = text.split('\n').reduce((sum, paragraph) => {
            const length = Math.max(1, paragraph.trim().length);
            return sum + Math.max(1, Math.ceil(length / charsPerLine));
        }, 0);
        return Math.max(lineHeight, lines * lineHeight);
    }

    protected clearNoticeArticleRuntimeChildren(): void {
        if (!this.noticeScrollContent) return;

        [...this.noticeScrollContent.children].forEach((child) => {
            if (child === this.noticeArticleTemplate || child.name === 'NoticeArticleTemplate') {
                child.active = false;
                return;
            }
            child.active = false;
            child.destroy();
        });
    }

    protected setupNoticeScrollView(scrollNode: Node, content: Node): void {
        const mask = scrollNode.getComponent(Mask) || scrollNode.addComponent(Mask);
        mask.type = 0;
        const scroll = scrollNode.getComponent(ScrollView) || scrollNode.addComponent(ScrollView);
        scroll.content = content;
        scroll.horizontal = false;
        scroll.vertical = true;
        scroll.inertia = true;
        scroll.brake = 0.75;
        scroll.elastic = true;
        scroll.bounceDuration = 0.2;
        this.noticeScrollView = scroll;
    }

    protected getNoticeTypeText(type: NoticeType): string {
        return type === 'activity' ? '活动公告' : '系统公告';
    }

    protected formatTodayKey(): string {
        const date = new Date();
        const pad = (value: number): string => value < 10 ? `0${value}` : `${value}`;
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    }
}
