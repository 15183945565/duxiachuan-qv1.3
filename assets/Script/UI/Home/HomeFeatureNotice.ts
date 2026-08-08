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
        this.noticeExpanded = true;
    }

    protected createDefaultNotices(): NoticeData[] {
        return [
            {
                id: 'world_boss_update',
                title: '\u4e16\u754c Boss \u7248\u672c\u66f4\u65b0\u516c\u544a',
                time: '2026\u5e746\u670812\u65e5',
                type: 'notice',
                collapseContent: '\u4e16\u754c Boss \u6b63\u5f0f\u4e0a\u7ebf\uff0c\u6d77\u91cf\u6750\u6599\u5956\u52b1\u7b49\u4f60\u6765\u62ff\uff01',
                content: '1. \u4e16\u754c Boss \u6b63\u5f0f\u4e0a\u7ebf\uff0c\u6d77\u91cf\u6750\u6599\u5956\u52b1\u7b49\u4f60\u6765\u62ff\uff01\n2. \u65b0\u589e\u201c\u53cc\u9a84\u793c\u5305\u201d\uff0c\u52a9\u529b\u7b49\u7ea7\u4e0e\u6218\u529b\u53cc\u91cd\u98de\u5347\uff01\n3. \u5546\u57ce\u963f\u62c9\u739b\u4e0b\u67b6\uff0c\u5947\u73cd\u9601\u963f\u62c9\u739b\u5b98\u65b9\u56de\u6536\u6b65\u79fb\u9664\uff0c\u540e\u7eed\u5c06\u6539\u4e3a\u73a9\u5bb6\u81ea\u7531\u4ea4\u6613\u3002\n4. \u65b0\u589e\u5c0f\u6e38\u620f\u5c71\u6d77\u5947\u9047\uff0c\u7075\u5854\u64c2\u53f0\u6302\u80dc\u699c\u3002\n5. \u521d\u4f4e\u79d8\u5883\u65b0\u589e\u89d2\u8272\u7b49\u7ea7\u9650\u5236\u4e0e\u653b\u51fb\u529b\u9650\u5236\u3002\n\n\u611f\u8c22\u5404\u4f4d\u9053\u53cb\u7684\u652f\u6301\u4e0e\u53cd\u9988\uff0c\u795d\u5927\u5bb6\u6e38\u620f\u6109\u5feb\uff01\n\n\u300a\u4ed9\u9014\u7eaa\u300b\u8fd0\u8425\u56e2\u961f\n2026\u5e746\u670812\u65e5',
            },
            {
                id: 'system_update',
                title: '\u66f4\u65b0\u516c\u544a',
                time: '2026\u5e746\u670812\u65e5',
                type: 'notice',
                collapseContent: '\u672c\u6b21\u66f4\u65b0\u4fee\u590d\u82e5\u5e72\u95ee\u9898\uff0c\u5e76\u8c03\u6574\u90e8\u5206\u524d\u7aef\u8868\u73b0\u3002',
                content: '\u672c\u6b21\u66f4\u65b0\u5185\u5bb9\n\n1. \u5c0f\u52a9\u624b\u5355\u4e2a\u7269\u54c1\u53d1\u5e03\u4e0a\u9650\u8c03\u6574\u4e3a 5 \u5355\uff0c\u5e76\u7edf\u4e00\u4e0b\u67b6\u5168\u670d\u5df2\u53d1\u5e03\u7684\u5c0f\u52a9\u624b\u8ba2\u5355\u3002\n2. 20 \u7ea7\u79d8\u5883\u623f\u95f4\u6570\u91cf\u4e0a\u8c03\u81f3 2 \u4e2a\u3002\n3. \u4f18\u5316\u90ae\u4ef6\u9886\u53d6\u903b\u8f91\uff0c\u63d0\u5347\u9886\u53d6\u7a33\u5b9a\u6027\u3002\n4. \u4f18\u5316\u79d8\u5883\u5012\u8ba1\u65f6\u88ab Boss \u8840\u6761\u906e\u6321\u7684\u95ee\u9898\u3002\n5. \u4e16\u754c Boss \u65b0\u589e\u602a\u7269\u5185\u5bb9\uff08\u7a33\u5b9a\u6027\u6d4b\u8bd5\u4e2d\uff09\u3002',
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

        let cursorY = contentHeight / 2 - topPadding;
        notices.forEach((notice, index) => {
            const height = sectionHeights[index];
            const article = this.createNoticeArticleFromTemplate(notice, index, height);
            article.setPosition(0, cursorY - height / 2, 0);
            cursorY -= height + gap;
        });

        this.noticeScrollView?.scrollToTop(0.01);
    }

    protected createNoticeArticleTemplate(parent: Node): Node {
        const template = this.createNode('NoticeArticleTemplate', parent, 590, 224, 0, 0);
        template.active = false;
        this.createSlicedSkinnedNode('NoticeArticleBg', template, 590, 224, 0, 0, HomeConfig.UI_FRAME_NOTICE_CONTENT).setSiblingIndex(0);
        const title = this.createLabel(template, 'NoticeArticleTitle', '\u4e16\u754c Boss \u7248\u672c\u66f4\u65b0\u516c\u544a', 24, 0, 76, 500, 40, new Color(255, 250, 226, 255));
        title.enableOutline = true;
        title.outlineColor = new Color(37, 71, 72, 255);
        title.outlineWidth = 2;
        const content = this.createLabel(template, 'NoticeArticleContent', '', 24, 0, -22, 520, 120, new Color(104, 62, 36, 255));
        content.horizontalAlign = HorizontalTextAlignment.LEFT;
        content.verticalAlign = VerticalTextAlignment.TOP;
        content.enableWrapText = true;
        content.overflow = Overflow.RESIZE_HEIGHT;
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
        const width = articleTransform.contentSize.width || 590;
        articleTransform.setContentSize(width, height);

        const bg = article.getChildByName('NoticeArticleBg');
        if (bg) {
            this.applySlicedUiSkin(bg, HomeConfig.UI_FRAME_NOTICE_CONTENT, width, height);
        }

        const titleLabel = article.getChildByName('NoticeArticleTitle')?.getComponent(Label);
        if (titleLabel) {
            titleLabel.string = notice.title;
            titleLabel.node.setPosition(0, height / 2 - 38, 0);
            applySimKaiFont(titleLabel);
        }

        const contentLabel = article.getChildByName('NoticeArticleContent')?.getComponent(Label);
        if (contentLabel) {
            const text = notice.content;
            const textWidth = contentLabel.node.getComponent(UITransform)?.contentSize.width || 520;
            const textHeight = this.estimateNoticeTextHeight(text, textWidth, contentLabel.fontSize || 24, contentLabel.lineHeight || 34);
            const contentTransform = contentLabel.node.getComponent(UITransform) || contentLabel.node.addComponent(UITransform);
            contentTransform.setContentSize(textWidth, textHeight);
            contentLabel.string = text;
            contentLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
            contentLabel.verticalAlign = VerticalTextAlignment.TOP;
            contentLabel.enableWrapText = true;
            contentLabel.overflow = Overflow.RESIZE_HEIGHT;
            contentLabel.node.setPosition(0, height / 2 - 82 - textHeight / 2, 0);
            applySimKaiFont(contentLabel);
        }

        article.setSiblingIndex(index + 1);
        return article;
    }

    protected calculateNoticeArticleHeight(notice: NoticeData): number {
        const templateText = this.noticeArticleTemplate?.getChildByName('NoticeArticleContent');
        const textTransform = templateText?.getComponent(UITransform);
        const textLabel = templateText?.getComponent(Label);
        const textWidth = textTransform?.contentSize.width || 520;
        const fontSize = textLabel?.fontSize || 24;
        const lineHeight = textLabel?.lineHeight || 34;
        const textHeight = this.estimateNoticeTextHeight(notice.content, textWidth, fontSize, lineHeight);
        return Math.max(224, 112 + textHeight);
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
