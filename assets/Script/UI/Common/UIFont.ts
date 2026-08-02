import { Label, Node, RichText } from 'cc';

const MICROSOFT_YAHEI_FONT_FAMILY = 'Microsoft YaHei';

const fontApplyVersions = new WeakMap<Label | RichText, number>();

function nextFontApplyVersion(target: Label | RichText): number {
    const nextVersion = (fontApplyVersions.get(target) || 0) + 1;
    fontApplyVersions.set(target, nextVersion);
    return nextVersion;
}

export function applySimKaiFont(label: Label | null | undefined): void {
    applyMicrosoftYaHeiFont(label);
}

export function applySimKaiFontToRichText(richText: RichText | null | undefined): void {
    applyMicrosoftYaHeiFontToRichText(richText);
}

export function applySimKaiFontToTree(root: Node | null | undefined): void {
    applyMicrosoftYaHeiFontToTree(root);
}

export function applyMicrosoftYaHeiFont(label: Label | null | undefined): void {
    if (!label || !label.isValid) return;

    nextFontApplyVersion(label);
    label.font = null;
    label.fontFamily = MICROSOFT_YAHEI_FONT_FAMILY;
}

export function applyMicrosoftYaHeiFontToRichText(richText: RichText | null | undefined): void {
    if (!richText || !richText.isValid) return;

    nextFontApplyVersion(richText);
    richText.font = null;
    richText.fontFamily = MICROSOFT_YAHEI_FONT_FAMILY;
}

export function applyMicrosoftYaHeiFontToTree(root: Node | null | undefined): void {
    if (!root || !root.isValid) return;

    const labels = root.getComponentsInChildren(Label);
    labels.forEach((label) => applyMicrosoftYaHeiFont(label));
    const richTexts = root.getComponentsInChildren(RichText);
    richTexts.forEach((richText) => applyMicrosoftYaHeiFontToRichText(richText));
}
