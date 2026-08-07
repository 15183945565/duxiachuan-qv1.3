export type BeastStrengthenBeastKey = 'qingshi' | 'bailu' | 'jinhe' | 'chihu';
export type BeastStrengthenEquipPart = 'chest' | 'helmet' | 'armor' | 'leg';
export type BeastStrengthenAction = '' | 'unlock-equipment' | 'unlock-gem' | 'place-gem' | 'replace-gem';

export interface BeastStrengthenBeastConfig {
    key: BeastStrengthenBeastKey;
    name: string;
}

export interface BeastStrengthenEquipmentConfig {
    beastKey: BeastStrengthenBeastKey;
    beastName: string;
    part: BeastStrengthenEquipPart;
    partLabel: string;
    itemId: string;
    displayName: string;
    iconPath: string;
}

export interface BeastStrengthenState {
    yuanbao: number;
    unlockedEquipments: Record<string, boolean>;
    unlockedGemSlots: Record<string, boolean>;
    equippedGems: Record<string, string>;
}

export const BEAST_STRENGTHEN_BEASTS: BeastStrengthenBeastConfig[] = [
    { key: 'bailu', name: '\u767d\u9e7f' },
    { key: 'qingshi', name: '\u9752\u72ee' },
    { key: 'jinhe', name: '\u91d1\u9e64' },
    { key: 'chihu', name: '\u8d64\u72d0' },
];

export const BEAST_STRENGTHEN_PARTS: Array<{ part: BeastStrengthenEquipPart; label: string }> = [
    { part: 'chest', label: '\u80f8\u6302' },
    { part: 'helmet', label: '\u5934\u76d4' },
    { part: 'armor', label: '\u62a4\u7532' },
    { part: 'leg', label: '\u817f\u7532' },
];

export const BEAST_STRENGTHEN_EQUIPMENT_IDS: Record<
    BeastStrengthenBeastKey,
    Record<BeastStrengthenEquipPart, string>
> = {
    qingshi: { chest: 'equipment_168', helmet: 'equipment_166', armor: 'equipment_165', leg: 'equipment_167' },
    bailu: { chest: 'equipment_156', helmet: 'equipment_154', armor: 'equipment_153', leg: 'equipment_155' },
    jinhe: { chest: 'equipment_164', helmet: 'equipment_162', armor: 'equipment_161', leg: 'equipment_163' },
    chihu: { chest: 'equipment_160', helmet: 'equipment_158', armor: 'equipment_157', leg: 'equipment_159' },
};

export const BEAST_STRENGTHEN_GEM_SLOT_POSITIONS = [
    { x: -158, y: 187 },
    { x: 158, y: 187 },
    { x: -266, y: 37 },
    { x: 266, y: 37 },
    { x: -158, y: -156 },
    { x: 158, y: -156 },
] as const;

export const BEAST_STRENGTHEN_DEFAULT_GEM_SLOT_UNLOCKED: Record<number, boolean> = {
    0: true,
    2: true,
    4: true,
};
