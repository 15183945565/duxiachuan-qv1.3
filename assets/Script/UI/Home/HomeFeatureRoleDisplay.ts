import {
    Color,
    Label,
    Overflow,
} from 'cc';
import * as HomeConfig from './HomeConfig';
import { HomeViewBase } from './HomeViewBase';
import { RoleAssetConfig } from './HomeTypes';

/**
 * 角色页 Spine、战力数字、名称与角色/背包/战斗共用文字样式。
 */
export abstract class HomeFeatureRoleDisplay extends HomeViewBase {
    protected refreshRolePageRole(): void {
        if (!this.rolePageSkeleton?.isValid || !this.rolePagePanel?.active || this.rolePageActiveTab === 'advance') return;
    
        const skeletonData = HomeConfig.ENABLE_ROLE_SKEL_ANIMATION ? this.getRoleSkeletonData(this.profile.gender) : null;
        if (!skeletonData) {
            this.setSkeletonVisible(this.rolePageSkeleton, false);
            if (this.rolePageNameLabel?.node?.isValid) {
                this.rolePageNameLabel.node.active = false;
            }
            if (this.rolePagePowerFrame?.isValid) {
                this.rolePagePowerFrame.active = false;
            }
            return;
        }
    
        const config = this.getCurrentRoleAssetConfig(this.profile.gender);
        this.applySkeleton(this.rolePageSkeleton, skeletonData, 'idle', true);
        this.rolePageSkeleton.node.setScale(config.pageScale, config.pageScale, 1);
        if (!this.rolePageRoleUsesEditorTransform) {
            this.rolePageSkeleton.node.setPosition(config.pageOffsetX, config.pageOffsetY + HomeConfig.ROLE_PAGE_CONTENT_OFFSET_Y, 0);
        }
        this.refreshRolePageNameLabel(config);
        this.refreshRolePagePower(config);
    }
    protected refreshRolePagePower(config: RoleAssetConfig): void {
        this.refreshPersistentCurrencyHud();
        if (!this.rolePagePowerFrame?.isValid) return;
    
        this.rolePagePowerFrame.active = !!this.rolePagePanel?.active;
        if (!this.rolePagePowerUsesEditorTransform) {
            if (this.rolePageActiveTab === 'advance') {
                this.rolePagePowerFrame.setPosition(0, HomeConfig.ROLE_ADVANCE_POWER_FRAME_Y, 0);
            } else {
                this.rolePagePowerFrame.setPosition(
                    config.pageOffsetX,
                    config.pageOffsetY + HomeConfig.ROLE_PAGE_CONTENT_OFFSET_Y + HomeConfig.ROLE_PAGE_POWER_FRAME_OFFSET_Y,
                    0,
                );
            }
        }
        this.refreshRolePagePowerDigits(this.getRoleTotalPower());
        this.refreshRolePageEquipmentInlineAttrs();
    }
    protected refreshRolePagePowerDigits(value: number): void {
        if (!this.rolePagePowerDigitRoot?.isValid) return;
    
        this.rolePagePowerDigitRoot.children.slice().forEach((child) => child.destroy());
    
        const digits = Math.max(0, Math.floor(value)).toString().split('');
        const widths = digits.map((digit) => this.getRolePowerDigitWidth(digit));
        const totalWidth = widths.reduce((sum, width) => sum + width, 0) + Math.max(0, digits.length - 1) * HomeConfig.ROLE_PAGE_POWER_DIGIT_SPACING;
        let cursorX = -totalWidth / 2;
    
        digits.forEach((digit, index) => {
            const width = widths[index];
            const digitNode = this.createSkinnedNode(
                `RolePagePowerDigit_${index}_${digit}`,
                this.rolePagePowerDigitRoot!,
                width,
                HomeConfig.ROLE_PAGE_POWER_DIGIT_HEIGHT,
                cursorX + width / 2,
                0,
                `${HomeConfig.UI_ROLE_POWER_DIGIT_ROOT}_${digit}`,
            );
            digitNode.setSiblingIndex(index);
            cursorX += width + HomeConfig.ROLE_PAGE_POWER_DIGIT_SPACING;
        });
    }
    protected refreshRolePageEquipmentInlineAttrs(): void {
        if (this.rolePagePowerDetailButton?.isValid) {
            this.rolePagePowerDetailButton.active = !!this.rolePagePanel?.active;
        }
        if (!this.rolePageEquipmentInlineAttrRoot?.isValid) return;

        this.rolePageEquipmentInlineAttrRoot.active = false;
    }
    protected getRolePowerDigitWidth(digit: string): number {
        return digit === '1' ? 14 : digit === '2' || digit === '4' ? 21 : digit === '3' || digit === '6' || digit === '7' ? 19 : 20;
    }
    protected refreshRolePageNameLabel(config: RoleAssetConfig): void {
        if (!this.rolePageNameLabel?.node?.isValid) return;
    
        this.rolePageNameLabel.string = `Lv.${this.getRoleCurrentLevel()} ${this.profile.name || HomeConfig.DEFAULT_NAME}`;
        this.rolePageNameLabel.node.active = !!this.rolePagePanel?.active && this.rolePageActiveTab !== 'advance';
        if (!this.rolePageNameUsesEditorTransform) {
            this.rolePageNameLabel.node.setPosition(
                config.pageOffsetX,
                config.pageOffsetY + HomeConfig.ROLE_PAGE_CONTENT_OFFSET_Y + HomeConfig.ROLE_PAGE_NAME_LABEL_OFFSET_Y,
                0,
            );
        }
    }
    protected applyRolePageNameLabelStyle(label: Label): void {
        label.overflow = Overflow.SHRINK;
        label.lineHeight = HomeConfig.ROLE_PAGE_NAME_LABEL_FONT_SIZE + 6;
    
        const outlinedLabel = label as unknown as {
            enableOutline?: boolean;
            outlineColor?: Color;
            outlineWidth?: number;
        };
        outlinedLabel.enableOutline = true;
        outlinedLabel.outlineColor = new Color(51, 43, 35, 255);
        outlinedLabel.outlineWidth = 2;
    }
    protected applyRoleAttrLabelStyle(label: Label, outlineWidth: number): void {
        label.color = Color.BLACK;
        label.lineHeight = label.fontSize + 8;
    
        const outlinedLabel = label as unknown as {
            enableOutline?: boolean;
            outlineColor?: Color;
            outlineWidth?: number;
        };
        outlinedLabel.enableOutline = true;
        outlinedLabel.outlineColor = Color.WHITE;
        outlinedLabel.outlineWidth = outlineWidth;
    }
    protected applyBagLabelStyle(label: Label, outlineWidth: number): void {
        label.lineHeight = label.fontSize + 8;
    
        const outlinedLabel = label as unknown as {
            enableOutline?: boolean;
            outlineColor?: Color;
            outlineWidth?: number;
        };
        outlinedLabel.enableOutline = outlineWidth > 0;
        outlinedLabel.outlineColor = new Color(255, 242, 204, 255);
        outlinedLabel.outlineWidth = outlineWidth > 0 ? Math.max(1, outlineWidth - 1) : 0;
    }
    protected applyBattleEntryTextStyle(label: Label, outlineWidth: number): void {
        label.lineHeight = label.fontSize + 8;
    
        const outlinedLabel = label as unknown as {
            enableOutline?: boolean;
            outlineColor?: Color;
            outlineWidth?: number;
        };
        outlinedLabel.enableOutline = true;
        outlinedLabel.outlineColor = new Color(18, 12, 6, 255);
        outlinedLabel.outlineWidth = outlineWidth;
    }
}
