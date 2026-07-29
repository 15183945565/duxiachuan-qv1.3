import {
    Color,
    EventTouch,
    HorizontalTextAlignment,
    Label,
    Node,
    Tween,
    UIOpacity,
} from 'cc';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';
import {
    RoleGender,
    RoleAssetConfig,
} from './HomeTypes';

interface CharacterRoleAttributeSet {
    life: number;
    attack: number;
    defense: number;
}

abstract class HomeFeatureCharacterHost extends HomeViewBase {
    protected abstract roleRuntimeLevel: number;
    protected abstract getRoleTotalAttrs(level?: number): CharacterRoleAttributeSet;
    protected abstract refreshCharacterSelectCards(animated?: boolean): void;
}

/**
 * 角色创建与角色属性详情。
 *
 * 节点引用和角色档案仍由 HomeViewBase 统一持有；这里只安装角色功能行为，
 * 保证 Cocos 生命周期仍由唯一的 MainHomeView 组件负责。
 */
export abstract class HomeFeatureCharacter extends HomeFeatureCharacterHost {
    protected openRoleAttrDetailPanel(): void {
        this.buildRoleAttrDetailPanel();
        if (!this.roleAttrDetailPanel) return;

        this.refreshRoleAttrDetailPanel();
        this.roleAttrDetailPanel.active = true;
        this.ensureInputBlocker(this.roleAttrDetailPanel);
        this.roleAttrDetailPanel.setSiblingIndex((this.roleAttrDetailPanel.parent?.children.length || 1) - 1);
    }

    protected closeRoleAttrDetailPanel(): void {
        if (!this.roleAttrDetailPanel) return;

        this.roleAttrDetailPanel.active = false;
    }

    protected buildRoleAttrDetailPanel(): void {
        if (!this.rolePagePanel || this.roleAttrDetailPanel) return;

        const editorPanel = this.rolePagePanel.getChildByName('RoleAttrDetailPanel');
        this.roleAttrDetailPanel = editorPanel || this.createNode('RoleAttrDetailPanel', this.rolePagePanel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, 0, 0);
        this.roleAttrDetailPanel.active = false;
        this.roleAttrDetailPanel.off(Node.EventType.TOUCH_END);
        this.roleAttrDetailPanel.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
            this.closeRoleAttrDetailPanel();
        }, this);

        this.drawRect(this.roleAttrDetailPanel, HomeConfig.VIEW_WIDTH, HomeConfig.VIEW_HEIGHT, new Color(0, 0, 0, 72));
        const board = this.createNode('RoleAttrDetailBoard', this.roleAttrDetailPanel, HomeConfig.ROLE_ATTR_DETAIL_WIDTH, HomeConfig.ROLE_ATTR_DETAIL_HEIGHT, 0, HomeConfig.ROLE_ATTR_DETAIL_Y);
        board.off(Node.EventType.TOUCH_END);
        board.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this);
        this.createSkinnedNode('RoleAttrDetailBoardSkin', board, HomeConfig.ROLE_ATTR_DETAIL_WIDTH, HomeConfig.ROLE_ATTR_DETAIL_HEIGHT, 0, 0, HomeConfig.UI_CONFIRM_POPUP_BG).setSiblingIndex(0);
        this.createSkinnedNode('RoleAttrDetailTitleSkin', board, HomeConfig.BAG_ITEM_DETAIL_TITLE_WIDTH, HomeConfig.BAG_ITEM_DETAIL_TITLE_HEIGHT, 0, 182, HomeConfig.UI_CONFIRM_TITLE_BG).setSiblingIndex(1);
        const titleLabel = this.createLabel(board, 'RoleAttrDetailTitle', '\u5c5e\u6027\u8be6\u60c5', 30, 0, 186, 220, 42, Color.BLACK);
        this.applyRoleAttrLabelStyle(titleLabel, 3);
        titleLabel.node.setSiblingIndex(2);
        this.createMailButton(board, 'RoleAttrDetailClose', '', 315, 182, 52, 52, new Color(110, 72, 52, 0), () => this.closeRoleAttrDetailPanel(), HomeConfig.UI_BTN_CLOSE).setSiblingIndex(10);

        const totalAttrs = this.getRoleTotalAttrs();
        const attrs = [
            ['\u7b49\u7ea7', `${this.roleRuntimeLevel}`],
            ['\u8840\u91cf', `${totalAttrs.life}`],
            ['\u653b\u51fb', `${totalAttrs.attack}`],
            ['\u9632\u5fa1', `${totalAttrs.defense}`],
        ];

        attrs.forEach(([name, value], index) => {
            const y = 84 - index * 44;
            const nameLabel = this.createLabel(board, `RoleAttrName_${index}`, name, 22, -88, y, 100, 34, Color.BLACK);
            nameLabel.horizontalAlign = HorizontalTextAlignment.RIGHT;
            this.applyRoleAttrLabelStyle(nameLabel, 2);

            const valueLabel = this.createLabel(board, `RoleAttrValue_${index}`, value, 22, 28, y, 120, 34, Color.BLACK);
            valueLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
            this.applyRoleAttrLabelStyle(valueLabel, 2);
        });

        const hintLabel = this.createLabel(board, 'RoleAttrCloseHint', '\u70b9\u51fb\u7a7a\u767d\u533a\u57df\u5173\u95ed\u7a97\u53e3', 20, 0, -150, 360, 34, Color.BLACK);
        this.applyRoleAttrLabelStyle(hintLabel, 2);
    }

    protected refreshRoleAttrDetailPanel(): void {
        const board = this.roleAttrDetailPanel?.getChildByName('RoleAttrDetailBoard');
        if (!board?.isValid) return;
        const totalAttrs = this.getRoleTotalAttrs();
        const values = [`${this.roleRuntimeLevel}`, `${totalAttrs.life}`, `${totalAttrs.attack}`, `${totalAttrs.defense}`];
        values.forEach((value, index) => {
            const label = board.getChildByName(`RoleAttrValue_${index}`)?.getComponent(Label);
            if (label) label.string = value;
        });
    }

    protected createRoleOption(parent: Node, config: RoleAssetConfig, y: number): void {
        const option = this.createNode(`Option_${config.gender}`, parent, 340, 56, 0, y);
        this.drawRect(option, 340, 56, config.gender === 'male' ? new Color(104, 72, 51, 245) : new Color(119, 70, 86, 245));
        this.createLabel(option, `OptionLabel_${config.gender}`, config.displayName, 24, 0, 0, 260, 44, Color.WHITE);
        this.bindScaledClick(option, () => {
            this.selectGender(config.gender);
            if (this.roleDropdown) this.roleDropdown.active = false;
        });
    }

    protected selectGender(gender: RoleGender): void {
        const changed = this.profile.gender !== gender;
        this.profile.gender = gender;
        this.syncProfileNameFromPanel();
        this.refreshCharacterGenderLabel(false);
        this.saveProfile(this.profile);
        this.updateProfileLabels();
        this.fadeCharacterPreviewAndApply();
        if (!this.characterPanel?.active) {
            this.showToast(changed ? `${HomeConfig.ROLE_ASSETS[gender].displayName} \u5df2\u5207\u6362` : `${HomeConfig.ROLE_ASSETS[gender].displayName} \u5df2\u751f\u6548`);
        }
    }

    protected switchGenderByStep(step: number): void {
        const genders: RoleGender[] = ['male', 'female'];
        const currentIndex = Math.max(0, genders.indexOf(this.profile.gender));
        const direction = step >= 0 ? 1 : -1;
        const nextIndex = (currentIndex + direction + genders.length) % genders.length;
        this.selectGender(genders[nextIndex]);
    }

    protected fadeCharacterPreviewAndApply(): void {
        if (!this.characterPanel?.active || !this.characterPreviewRoot?.isValid) {
            this.applyCurrentRole();
            return;
        }

        this.refreshCharacterSelectCards(true);
        this.applyCurrentRole();
    }

    protected refreshCharacterGenderLabel(refreshCards = true): void {
        if (this.roleSelectLabel) {
            this.roleSelectLabel.string = HomeConfig.ROLE_ASSETS[this.profile.gender].displayName;
        }
        if (this.characterGenderLabel) {
            this.characterGenderLabel.string = HomeConfig.ROLE_ASSETS[this.profile.gender].displayName;
        }
        if (refreshCards) {
            this.refreshCharacterSelectCards(false);
        }
    }

    protected randomizeCharacterName(): void {
        const name = this.createRandomRoleName();
        if (this.nameEditBox) {
            this.nameEditBox.string = name;
        }
        this.refreshCharacterNameDisplay();
        this.profile.name = name;
        this.saveProfile(this.profile);
        this.updateProfileLabels();
    }

    protected createRandomRoleName(): string {
        const surnames = ['云', '洛', '白', '沈', '顾', '楚', '凌', '萧', '秦', '苏', '谢', '慕'];
        const givenNames = ['青玄', '问尘', '听雪', '临渊', '知微', '星河', '扶风', '照夜', '清辞', '无尘', '若水', '长歌'];
        const surname = surnames[Math.floor(Math.random() * surnames.length)];
        const given = givenNames[Math.floor(Math.random() * givenNames.length)];
        return `${surname}${given}`;
    }

    protected toggleRoleDropdown(): void {
        if (!this.roleDropdown) return;

        this.roleDropdown.active = !this.roleDropdown.active;
    }

    protected confirmCharacter(): void {
        this.syncProfileNameFromPanel();
        this.profile.created = true;
        this.saveProfile(this.profile);
        this.updateProfileLabels();
        if (this.characterPanel) this.characterPanel.active = false;
        this.showToast('\u89d2\u8272\u6d41\u7a0b\u5df2\u786e\u8ba4');
    }

    protected syncProfileNameFromPanel(): void {
        const name = this.nameEditBox?.string.trim();
        this.profile.name = name && name.length > 0 ? name : this.profile.name || HomeConfig.DEFAULT_NAME;
    }

    protected openCharacterPanel(firstCreate: boolean): void {
        if (!this.characterPanel) return;

        this.characterPanel.active = true;
        this.ensureInputBlocker(this.characterPanel);
        this.characterPanel.setSiblingIndex((this.characterPanel.parent?.children.length || 1) - 1);
        if (this.nameEditBox) {
            this.nameEditBox.string = this.profile.name || HomeConfig.DEFAULT_NAME;
        }
        this.refreshCharacterNameDisplay();
        this.refreshCharacterGenderLabel();
        this.refreshCharacterSelectCards(false);
        if (this.characterPreviewRoot?.isValid) {
            const opacity = this.characterPreviewRoot.getComponent(UIOpacity) || this.characterPreviewRoot.addComponent(UIOpacity);
            Tween.stopAllByTarget(opacity);
            opacity.opacity = 255;
        }
        if (firstCreate) {
            this.showToast('\u8bf7\u5148\u786e\u8ba4\u89d2\u8272');
        }
        this.applyCurrentRole();
    }
}
