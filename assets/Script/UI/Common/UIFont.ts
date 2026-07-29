import { Label, Node, RichText, TTFFont } from 'cc';
import { ResourceManager } from '../../Managers/ResourceManager';

const SIMKAI_FONT_PATH = 'Font/SIMKAI';
const SIMKAI_FONT_FAMILY = 'SIMKAI';
const simKaiFontScope = ResourceManager.instance.createScope('UIFont/SIMKAI');

let simKaiFontPromise: Promise<TTFFont | null> | null = null;

function loadSimKaiFont(): Promise<TTFFont | null> {
    if (simKaiFontPromise) return simKaiFontPromise;

    simKaiFontPromise = simKaiFontScope.acquireBundle('res')
        .then((bundle) => new Promise<TTFFont | null>((resolve) => {
            bundle.load(SIMKAI_FONT_PATH, TTFFont, (err, font) => {
                if (err || !font) {
                    console.warn('[UIFont] SIMKAI font load failed', err);
                    resolve(null);
                    return;
                }
                resolve(simKaiFontScope.retain(font));
            });
        }))
        .catch((err) => {
            console.warn('[UIFont] SIMKAI bundle load failed', err);
            return null;
        });

    return simKaiFontPromise;
}

export function applySimKaiFont(label: Label | null | undefined): void {
    if (!label || !label.isValid) return;

    label.fontFamily = SIMKAI_FONT_FAMILY;
    void loadSimKaiFont().then((font) => {
        if (!font || !label.isValid) return;
        label.font = font;
    });
}

export function applySimKaiFontToRichText(richText: RichText | null | undefined): void {
    if (!richText || !richText.isValid) return;

    richText.fontFamily = SIMKAI_FONT_FAMILY;
    void loadSimKaiFont().then((font) => {
        if (!font || !richText.isValid) return;
        richText.font = font;
    });
}

export function applySimKaiFontToTree(root: Node | null | undefined): void {
    if (!root || !root.isValid) return;

    const labels = root.getComponentsInChildren(Label);
    labels.forEach((label) => applySimKaiFont(label));
}
