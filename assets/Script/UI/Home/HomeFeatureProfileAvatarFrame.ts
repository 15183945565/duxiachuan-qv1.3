import {
    Color,
    Graphics,
    Label,
    Mask,
    Node,
    ScrollView,
    Sprite,
    UITransform,
    sp,
    sys,
} from 'cc';
import { applySimKaiFont } from '../Common/UIFont';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';

type ProfileAvatarFrameItem = (typeof HomeConfig.PROFILE_AVATAR_FRAME_ITEMS)[number];

/**
 * Owns avatar-frame selection, purchase, persistence, and skeleton preview.
 */
export abstract class HomeFeatureProfileAvatarFrame extends HomeViewBase {
    protected openProfileAvatarFramePopup(): void {
        const popup = this.ensureProfileAvatarFramePopup();
        popup.active = true;
        this.ensureInputBlocker(popup);
        popup.setSiblingIndex((popup.parent?.children.length || 1) - 1);
        this.refreshRootLayerOrder();
        this.loadProfileAvatarFrameState();
        this.refreshProfileAvatarFrameButtons();
        this.profileAvatarFrameScrollView?.scrollToTop(0.01);
    }
    protected closeProfileAvatarFramePopup(): void {
        if (!this.profileAvatarFramePopupRoot?.isValid) return;
        this.profileAvatarFramePopupRoot.active = false;
    }
    protected ensureProfileAvatarFramePopup(): Node {
        const parent = this.popupRoot || this.findNode('PopupLayer') || this.node;
        let root = parent.getChildByName('ProfileAvatarFramePopup');
        if (root?.isValid) {
            this.bindProfileAvatarFramePopupFromEditor(root);
            return root;
        }

        root = this.createNode('ProfileAvatarFramePopup', parent, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        root.active = false;
        this.ensureInputBlocker(root);

        const mask = this.createNode('ProfileAvatarFrameMask', root, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        this.drawRect(mask, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, new Color(0, 0, 0, 0));
        this.bindScaledClick(mask, () => this.closeProfileAvatarFramePopup());
        mask.setSiblingIndex(0);

        const board = this.createNode(
            'ProfileAvatarFrameBoard',
            root,
            HomeConfig.PROFILE_AVATAR_FRAME_POPUP_WIDTH,
            HomeConfig.PROFILE_AVATAR_FRAME_POPUP_HEIGHT,
            0,
            HomeConfig.PROFILE_AVATAR_FRAME_POPUP_Y,
        );
        this.ensureInputBlocker(board, HomeConfig.PROFILE_AVATAR_FRAME_POPUP_WIDTH, HomeConfig.PROFILE_AVATAR_FRAME_POPUP_HEIGHT);
        this.createSkinnedNode(
            'ProfileAvatarFrameBoardSkin',
            board,
            HomeConfig.PROFILE_AVATAR_FRAME_POPUP_WIDTH,
            HomeConfig.PROFILE_AVATAR_FRAME_POPUP_HEIGHT,
            0,
            0,
            HomeConfig.UI_PROFILE_AVATAR_FRAME_POPUP_BG,
        ).setSiblingIndex(0);

        const scrollRoot = this.createNode('ProfileAvatarFrameScrollView', board, HomeConfig.PROFILE_AVATAR_FRAME_VIEW_WIDTH, HomeConfig.PROFILE_AVATAR_FRAME_VIEW_HEIGHT, 0, 0);
        scrollRoot.setSiblingIndex(1);
        const content = this.createNode('ProfileAvatarFrameContent', scrollRoot, HomeConfig.PROFILE_AVATAR_FRAME_VIEW_WIDTH, HomeConfig.PROFILE_AVATAR_FRAME_CONTENT_HEIGHT, 0, HomeConfig.PROFILE_AVATAR_FRAME_CONTENT_TOP_Y);
        content.setSiblingIndex(0);
        this.createProfileAvatarFrameCells(content);
        this.bindProfileAvatarFramePopupFromEditor(root);
        return root;
    }
    protected bindProfileAvatarFramePopupFromEditor(root: Node): void {
        this.profileAvatarFramePopupRoot = root;
        const board = this.findNode('ProfileAvatarFrameBoard', root);
        if (!board?.isValid) return;

        this.profileAvatarFramePopupBoard = board;
        root.active = false;
        this.ensureInputBlocker(root);
        this.ensureInputBlocker(board, HomeConfig.PROFILE_AVATAR_FRAME_POPUP_WIDTH, HomeConfig.PROFILE_AVATAR_FRAME_POPUP_HEIGHT);
        this.refreshEditorProfileAvatarFramePopupSkins(root, board);

        const mask = this.findNode('ProfileAvatarFrameMask', root);
        if (mask) {
            (mask.getComponent(UITransform) || mask.addComponent(UITransform)).setContentSize(HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT);
            if (!mask.getComponent(Graphics) && !mask.getComponent(Sprite)) {
                this.drawRect(mask, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, new Color(0, 0, 0, 0));
            }
            this.bindScaledClick(mask, () => this.closeProfileAvatarFramePopup());
        }

        const scrollRoot = this.findNode('ProfileAvatarFrameScrollView', board);
        const content = this.findNode('ProfileAvatarFrameContent', board)
            || (scrollRoot ? this.findNode('ProfileAvatarFrameContent', scrollRoot) : null);
        if (scrollRoot?.isValid && content?.isValid) {
            this.setupProfileAvatarFrameScrollView(scrollRoot, content);
            this.ensureProfileAvatarFrameCells(content);
        }
        this.loadProfileAvatarFrameState();
        this.refreshProfileAvatarFrameButtons();
    }
    protected refreshEditorProfileAvatarFramePopupSkins(_root: Node, board: Node): void {
        const skin = (name: string, path: string, width: number, height: number, searchRoot: Node = board): void => {
            const target = this.findNode(name, searchRoot);
            if (target) this.applyUiSkinKeepingEditorSize(target, path, width, height);
        };
        skin('ProfileAvatarFrameBoardSkin', HomeConfig.UI_PROFILE_AVATAR_FRAME_POPUP_BG, HomeConfig.PROFILE_AVATAR_FRAME_POPUP_WIDTH, HomeConfig.PROFILE_AVATAR_FRAME_POPUP_HEIGHT);
        HomeConfig.PROFILE_AVATAR_FRAME_ITEMS.forEach((item) => {
            const cell = this.findNode(`ProfileAvatarFrameCell_${item.id}`, board);
            if (!cell) return;
            skin(`ProfileAvatarFrameCellBg_${item.id}`, HomeConfig.UI_PROFILE_AVATAR_FRAME_SLOT_BG, 126, 144, cell);
            skin(`ProfileAvatarFramePreview_${item.id}`, item.preview, 92, 92, cell);
            skin(`ProfileAvatarFrameActionButton_${item.id}`, HomeConfig.UI_PROFILE_AVATAR_FRAME_SHOP_BUTTON_BG, 92, 31, cell);
        });
    }
    protected setupProfileAvatarFrameScrollView(scrollRoot: Node, content: Node): void {
        const mask = scrollRoot.getComponent(Mask) || scrollRoot.addComponent(Mask);
        mask.type = Mask.Type.GRAPHICS_RECT;
        mask.enabled = true;
        const scroll = scrollRoot.getComponent(ScrollView) || scrollRoot.addComponent(ScrollView);
        scroll.content = content;
        scroll.horizontal = false;
        scroll.vertical = true;
        scroll.inertia = true;
        scroll.brake = 0.75;
        scroll.elastic = true;
        scroll.bounceDuration = 0.2;
        scroll.cancelInnerEvents = true;
        this.profileAvatarFrameScrollView = scroll;
    }
    protected ensureProfileAvatarFrameCells(content: Node): void {
        HomeConfig.PROFILE_AVATAR_FRAME_ITEMS.forEach((item, index) => {
            let cell = content.getChildByName(`ProfileAvatarFrameCell_${item.id}`);
            if (!cell?.isValid) {
                cell = this.createProfileAvatarFrameCell(content, item, index);
            }
            this.bindProfileAvatarFrameCell(cell, item);
        });
    }
    protected createProfileAvatarFrameCells(content: Node): void {
        HomeConfig.PROFILE_AVATAR_FRAME_ITEMS.forEach((item, index) => {
            this.createProfileAvatarFrameCell(content, item, index);
        });
    }
    protected createProfileAvatarFrameCell(
        content: Node,
        item: ProfileAvatarFrameItem,
        index: number,
    ): Node {
        const col = index % 3;
        const row = Math.floor(index / 3);
        const colX = [-204, 0, 204][col] ?? 0;
        const rowY = 258 - row * 164;
        const cell = this.createNode(`ProfileAvatarFrameCell_${item.id}`, content, 150, 156, colX, rowY);
        this.createSkinnedNode(`ProfileAvatarFrameCellBg_${item.id}`, cell, 126, 144, 0, 0, HomeConfig.UI_PROFILE_AVATAR_FRAME_SLOT_BG).setSiblingIndex(0);
        const preview = this.createSkinnedNode(
            `ProfileAvatarFramePreview_${item.id}`,
            cell,
            HomeConfig.PROFILE_AVATAR_FRAME_CELL_PREVIEW_SIZE,
            HomeConfig.PROFILE_AVATAR_FRAME_CELL_PREVIEW_SIZE,
            HomeConfig.PROFILE_AVATAR_FRAME_CELL_PREVIEW_X,
            HomeConfig.PROFILE_AVATAR_FRAME_CELL_PREVIEW_Y,
            item.preview,
        );
        preview.setScale(HomeConfig.PROFILE_AVATAR_FRAME_PREVIEW_NODE_SCALE, HomeConfig.PROFILE_AVATAR_FRAME_PREVIEW_NODE_SCALE, 1);
        preview.setSiblingIndex(1);
        const button = this.createSkinnedNode(
            `ProfileAvatarFrameActionButton_${item.id}`,
            cell,
            92,
            31,
            HomeConfig.PROFILE_AVATAR_FRAME_CELL_BUTTON_X,
            HomeConfig.PROFILE_AVATAR_FRAME_CELL_BUTTON_Y,
            HomeConfig.UI_PROFILE_AVATAR_FRAME_SHOP_BUTTON_BG,
        );
        button.setSiblingIndex(2);
        this.createSkinnedNode(`ProfileAvatarFramePriceIcon_${item.id}`, button, 24, 24, -22, 1, HomeConfig.UI_HOME_JIFEN_ICON).setSiblingIndex(0);
        const label = this.createLabel(button, `ProfileAvatarFrameActionLabel_${item.id}`, `${HomeConfig.PROFILE_AVATAR_FRAME_PRICE}`, 22, 12, 1, 56, 26, new Color(76, 49, 24, 255));
        label.lineHeight = 26;
        label.node.setSiblingIndex(1);
        this.bindProfileAvatarFrameCell(cell, item);
        return cell;
    }
    protected bindProfileAvatarFrameCell(cell: Node, item: ProfileAvatarFrameItem): void {
        const preview = this.findNode(`ProfileAvatarFramePreview_${item.id}`, cell);
        if (preview) this.applyProfileAvatarFramePreviewSkeleton(preview, item);

        const button = this.findNode(`ProfileAvatarFrameActionButton_${item.id}`, cell);
        const label = this.findNode(`ProfileAvatarFrameActionLabel_${item.id}`, cell)?.getComponent(Label) || null;
        const icon = this.findNode(`ProfileAvatarFramePriceIcon_${item.id}`, cell);
        if (label) {
            applySimKaiFont(label);
            this.profileAvatarFrameButtonLabels.set(item.id, label);
        }
        if (icon) this.profileAvatarFramePriceIcons.set(item.id, icon);
        if (button) {
            this.bindScaledClick(button, () => this.handleProfileAvatarFrameAction(item));
        }
    }
    protected handleProfileAvatarFrameAction(item: ProfileAvatarFrameItem): void {
        this.loadProfileAvatarFrameState();
        if (!this.profileAvatarFramePurchased.has(item.id)) {
            this.openProfileAvatarFramePurchaseConfirm(item);
            return;
        }
        if (this.profileAvatarFrameEquipped === item.id) {
            this.showToast('\u8be5\u5934\u50cf\u6846\u5df2\u5728\u4f7f\u7528');
            this.refreshProfileAvatarFrameButtons();
            return;
        }
        this.profileAvatarFrameEquipped = item.id;
        this.saveProfileAvatarFrameState();
        this.applyEquippedProfileAvatarFrameVisual();
        this.refreshProfileAvatarFrameButtons();
        this.showToast('\u5df2\u4f7f\u7528\u5934\u50cf\u6846');
    }
    protected openProfileAvatarFramePurchaseConfirm(item: ProfileAvatarFrameItem): void {
        this.openSharedFlowPopup('ConfirmPopup', {
            title: '\u7cfb\u7edf\u63d0\u793a',
            message: `\u662f\u5426\u82b1\u8d39${HomeConfig.PROFILE_AVATAR_FRAME_PRICE}\u5143\u5b9d\u8d2d\u4e70${item.name}`,
            onConfirm: () => {
                this.profileAvatarFramePurchased.add(item.id);
                this.saveProfileAvatarFrameState();
                this.refreshProfileAvatarFrameButtons();
                this.showToast('\u8d2d\u4e70\u6210\u529f');
            },
        });
    }
    protected refreshProfileAvatarFrameButtons(): void {
        HomeConfig.PROFILE_AVATAR_FRAME_ITEMS.forEach((item) => {
            const label = this.profileAvatarFrameButtonLabels.get(item.id);
            const icon = this.profileAvatarFramePriceIcons.get(item.id);
            const purchased = this.profileAvatarFramePurchased.has(item.id);
            const equipped = this.profileAvatarFrameEquipped === item.id;
            if (icon) icon.active = !purchased;
            if (!label) return;
            label.string = equipped
                ? '\u5df2\u4f7f\u7528'
                : purchased
                    ? '\u4f7f\u7528'
                    : `${HomeConfig.PROFILE_AVATAR_FRAME_PRICE}`;
            label.fontSize = purchased ? 20 : 22;
            label.lineHeight = 26;
            label.color = new Color(76, 49, 24, 255);
            label.node.setPosition(purchased ? 0 : 12, label.node.position.y, 0);
        });
    }
    protected loadProfileAvatarFrameState(): void {
        this.profileAvatarFramePurchased.clear();
        try {
            const raw = sys.localStorage.getItem(HomeConfig.PROFILE_AVATAR_FRAME_STORAGE_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw) as { purchased?: string[]; equipped?: string };
            (parsed.purchased || []).forEach((id) => this.profileAvatarFramePurchased.add(id));
            this.profileAvatarFrameEquipped = parsed.equipped || '';
        } catch {
            this.profileAvatarFramePurchased.clear();
            this.profileAvatarFrameEquipped = '';
        }
    }
    protected saveProfileAvatarFrameState(): void {
        sys.localStorage.setItem(HomeConfig.PROFILE_AVATAR_FRAME_STORAGE_KEY, JSON.stringify({
            purchased: [...this.profileAvatarFramePurchased],
            equipped: this.profileAvatarFrameEquipped,
        }));
    }
    protected applyEquippedProfileAvatarFrameVisual(): void {
        const item = HomeConfig.PROFILE_AVATAR_FRAME_ITEMS.find((entry) => entry.id === this.profileAvatarFrameEquipped);
        const placeFrameAroundAvatar = (frame: Node, avatarName: string, aboveAvatar: boolean, topOverlayNames: string[]): void => {
            const parent = frame.parent;
            if (!parent) return;
            const avatar = parent.getChildByName(avatarName);
            if (!avatar?.isValid) {
                frame.setSiblingIndex(0);
                return;
            }

            if (aboveAvatar) {
                frame.setPosition(avatar.position.x, avatar.position.y, frame.position.z);
                frame.setSiblingIndex(Math.min(parent.children.length - 1, avatar.getSiblingIndex() + 1));
            } else if (frame.getSiblingIndex() > avatar.getSiblingIndex()) {
                frame.setSiblingIndex(avatar.getSiblingIndex());
            }

            topOverlayNames.forEach((name) => {
                const overlay = parent.getChildByName(name);
                if (overlay?.isValid) {
                    const anchorIndex = aboveAvatar ? frame.getSiblingIndex() : avatar.getSiblingIndex();
                    overlay.setSiblingIndex(Math.min(parent.children.length - 1, anchorIndex + 1));
                }
            });
        };
        const resolveScaleByAvatar = (avatar: Node | null, fallbackSize: number, baseScale: number, avatarRatio: number): number => {
            if (!avatar?.isValid || avatarRatio <= 0) return baseScale;
            const transform = avatar.getComponent(UITransform);
            const avatarSize = transform?.contentSize;
            const avatarMax = Math.max(avatarSize?.width || 0, avatarSize?.height || 0);
            if (avatarMax <= 0) return baseScale;
            return Math.max(baseScale, (avatarMax * avatarRatio) / (fallbackSize * 2));
        };
        const apply = (nodeName: string, avatarName: string, fallbackSize: number, scale: number, topOverlayNames: string[] = [], avatarRatio = 0): void => {
            const node = this.findNode(nodeName);
            if (!node?.isValid) return;
            const avatar = node.parent?.getChildByName(avatarName) || null;
            const fittedScale = resolveScaleByAvatar(avatar, fallbackSize, scale, avatarRatio);
            if (avatarRatio > 0) {
                const frameSize = Math.ceil(fallbackSize * 2 * fittedScale);
                (node.getComponent(UITransform) || node.addComponent(UITransform)).setContentSize(frameSize, frameSize);
            }
            if (!item) {
                placeFrameAroundAvatar(node, avatarName, false, topOverlayNames);
                this.clearProfileAvatarFrameSkeleton(node, `${nodeName}Spine`, HomeConfig.UI_HOME_PROFILE_FRAME, fallbackSize);
                return;
            }
            node.active = true;
            placeFrameAroundAvatar(node, avatarName, true, topOverlayNames);
            this.applyProfileAvatarFrameSkeleton(node, `${nodeName}Spine`, item, item.preview, fallbackSize, fittedScale, false, false, false);
        };
        apply('AvatarFrame', 'AvatarIcon', 88, HomeConfig.PROFILE_AVATAR_FRAME_HUD_SPINE_SCALE, ['LabelLevel'], HomeConfig.PROFILE_AVATAR_FRAME_HUD_TO_AVATAR_RATIO);
        apply('ProfileAvatarFrame', 'ProfileAvatarIcon', 104, HomeConfig.PROFILE_AVATAR_FRAME_POPUP_SPINE_SCALE);
    }
    protected applyProfileAvatarFramePreviewSkeleton(parent: Node, item: ProfileAvatarFrameItem): void {
        this.applyProfileAvatarFrameSkeleton(
            parent,
            `ProfileAvatarFramePreviewSpine_${item.id}`,
            item,
            item.preview,
            92,
            HomeConfig.PROFILE_AVATAR_FRAME_PREVIEW_SPINE_SCALE,
            false,
            false,
        );
    }
    protected loadProfileAvatarFrameSkeletonAsset(item: ProfileAvatarFrameItem): Promise<sp.SkeletonData> {
        const cached = this.profileAvatarFrameSkeletonData.get(item.id);
        if (cached) return Promise.resolve(cached);

        return this.loadSkeletonAsset(item.spine).then((data) => {
            this.profileAvatarFrameSkeletonData.set(item.id, data);
            return data;
        });
    }
    protected ensureProfileAvatarFrameSkeletonChild(parent: Node, childName: string, fallbackSize: number, defaultScale: number, useSelf = false): { node: Node; created: boolean } {
        if (useSelf) {
            const hasSkeleton = !!parent.getComponent(sp.Skeleton);
            const transform = parent.getComponent(UITransform) || parent.addComponent(UITransform);
            if (!hasSkeleton) {
                transform.setContentSize(fallbackSize * 2, fallbackSize * 2);
                parent.setScale(defaultScale, defaultScale, 1);
            } else if (transform.contentSize.width <= 0 || transform.contentSize.height <= 0) {
                transform.setContentSize(fallbackSize * 2, fallbackSize * 2);
            }
            return { node: parent, created: !hasSkeleton };
        }

        let spineNode = parent.getChildByName(childName);
        let created = false;
        if (!spineNode?.isValid) {
            spineNode = this.createNode(childName, parent, fallbackSize * 2, fallbackSize * 2, 0, 0);
            spineNode.setScale(defaultScale, defaultScale, 1);
            spineNode.setSiblingIndex(parent.children.length - 1);
            created = true;
        } else {
            spineNode.active = true;
            const transform = spineNode.getComponent(UITransform) || spineNode.addComponent(UITransform);
            if (transform.contentSize.width <= 0 || transform.contentSize.height <= 0) {
                transform.setContentSize(fallbackSize * 2, fallbackSize * 2);
            }
        }
        return { node: spineNode, created };
    }
    protected clearProfileAvatarFrameSkeleton(parent: Node, childName: string, fallbackSkin: string, fallbackSize: number, useSelf = false): void {
        const spineNode = useSelf ? parent : parent.getChildByName(childName);
        if (spineNode?.isValid) {
            const skeleton = spineNode.getComponent(sp.Skeleton);
            if (skeleton) {
                skeleton.clearTracks();
                skeleton.skeletonData = null;
                skeleton.enabled = false;
            }
            if (!useSelf) spineNode.active = false;
        }

        const sprite = parent.getComponent(Sprite);
        if (sprite) sprite.enabled = true;
        this.applyUiSkinKeepingEditorSize(parent, fallbackSkin, fallbackSize, fallbackSize);
    }
    protected applyProfileAvatarFrameSkeleton(
        parent: Node,
        childName: string,
        item: ProfileAvatarFrameItem,
        fallbackSkin: string,
        fallbackSize: number,
        scale: number,
        useSelf = false,
        keepParentSprite = false,
        showFallbackWhileLoading = true,
    ): void {
        const spineInfo = this.ensureProfileAvatarFrameSkeletonChild(parent, childName, fallbackSize, scale, useSelf);
        const spineNode = spineInfo.node;
        const version = ++this.skinApplyVersion;
        this.profileAvatarFrameSkeletonVersions.set(spineNode, version);
        if (useSelf) this.skinApplyVersions.set(parent, version);

        let sprite = parent.getComponent(Sprite);
        if (useSelf) {
            if (sprite) sprite.enabled = true;
        } else {
            if (showFallbackWhileLoading || keepParentSprite) {
                if (sprite) sprite.enabled = true;
                this.applyUiSkinKeepingEditorSize(parent, fallbackSkin, fallbackSize, fallbackSize);
                sprite = parent.getComponent(Sprite);
            } else {
                this.skinApplyVersions.set(parent, ++this.skinApplyVersion);
                if (sprite) {
                    sprite.enabled = false;
                    sprite.spriteFrame = null;
                }
            }
        }

        const skeleton = spineNode.getComponent(sp.Skeleton) || spineNode.addComponent(sp.Skeleton);
        skeleton.enabled = false;
        spineNode.setPosition(0, 0, 0);
        spineNode.setScale(scale, scale, 1);

        void this.loadProfileAvatarFrameSkeletonAsset(item)
            .then((data) => {
                if (!parent.isValid || !spineNode.isValid || this.profileAvatarFrameSkeletonVersions.get(spineNode) !== version) return;
                if (sprite && !keepParentSprite) sprite.enabled = false;
                this.prepareSkeletonRenderer(skeleton);
                skeleton.skeletonData = data;
                try {
                    skeleton.setSkin('default');
                } catch {
                    // Some Spine exports only contain the implicit default skin.
                }
                this.playSkeletonAnimation(skeleton, HomeConfig.PROFILE_AVATAR_FRAME_ANIMATIONS, true);
                skeleton.updateAnimation(0);
                skeleton.markForUpdateRenderData(true);
            })
            .catch((err) => {
                if (!parent.isValid || !spineNode.isValid || this.profileAvatarFrameSkeletonVersions.get(spineNode) !== version) return;
                console.warn('[MainHomeView] profile avatar frame spine load failed', item.spine, err);
                if (!useSelf) spineNode.active = false;
                if (sprite) sprite.enabled = showFallbackWhileLoading || keepParentSprite;
                if (showFallbackWhileLoading || keepParentSprite) {
                    this.applyUiSkinKeepingEditorSize(parent, fallbackSkin, fallbackSize, fallbackSize);
                }
            });
    }
}
