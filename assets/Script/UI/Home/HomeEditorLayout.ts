import { Node, Sprite, UITransform } from 'cc';

export interface NodeSize {
    readonly width: number;
    readonly height: number;
}

/**
 * Static layout belongs to Scene/Prefab. Runtime code may only fill missing sizes.
 */
export function ensureEditorNodeSize(node: Node, fallbackWidth: number, fallbackHeight: number): UITransform {
    const transform = node.getComponent(UITransform) || node.addComponent(UITransform);
    const current = transform.contentSize;
    if (current.width <= 0 || current.height <= 0) {
        transform.setContentSize(
            current.width > 0 ? current.width : fallbackWidth,
            current.height > 0 ? current.height : fallbackHeight,
        );
    }
    return transform;
}

export function getEditorNodeSize(
    node: Node | null | undefined,
    fallbackWidth: number,
    fallbackHeight: number,
): NodeSize {
    const size = node?.getComponent(UITransform)?.contentSize;
    return {
        width: size && size.width > 0 ? size.width : fallbackWidth,
        height: size && size.height > 0 ? size.height : fallbackHeight,
    };
}

export function needsFallbackSprite(node: Node): boolean {
    return !node.getComponent(Sprite)?.spriteFrame;
}
