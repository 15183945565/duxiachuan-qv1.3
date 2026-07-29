import { ResolutionPolicy, view } from 'cc';

export const DESIGN_WIDTH = 750;
export const DESIGN_HEIGHT = 1624;

/**
 * Keeps every platform on the same portrait design coordinate system.
 *
 * FIXED_WIDTH fills the physical screen width without stretching the UI.
 * The visible logical height is allowed to grow on taller devices, so edge
 * controls still need Widget/safe-area constraints.
 */
export class DisplayAdapter {
    static apply(): void {
        view.setDesignResolutionSize(
            DESIGN_WIDTH,
            DESIGN_HEIGHT,
            ResolutionPolicy.FIXED_WIDTH,
        );
    }
}
