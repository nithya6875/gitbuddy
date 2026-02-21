/**
 * =============================================================================
 * ANIMATIONS.TS - Dynamic Pet Animation System
 * =============================================================================
 *
 * This file manages the puppy's dynamic behaviors and movements.
 * The puppy walks across the terminal, performs idle animations,
 * and behaves like a real pet.
 */
export type AnimationState = 'idle' | 'walking_right' | 'walking_left' | 'sniffing' | 'scratching' | 'stretching' | 'looking_left' | 'looking_right' | 'rolling' | 'yawning' | 'tail_chase' | 'whimpering' | 'head_down';
export interface AnimationController {
    state: AnimationState;
    position: number;
    frame: number;
    stateStartTime: number;
    stateDuration: number;
    lastMood: string;
}
/**
 * Creates a new animation controller.
 */
export declare function createAnimationController(): AnimationController;
/**
 * Updates the animation controller each frame.
 */
export declare function updateAnimation(controller: AnimationController, mood: string): AnimationController;
/**
 * Gets the sprite for current animation state.
 */
export declare function getAnimatedSprite(controller: AnimationController, level: number, mood?: string): string[];
/**
 * Applies horizontal position offset to sprite.
 */
export declare function applyPosition(sprite: string[], position: number): string[];
//# sourceMappingURL=animations.d.ts.map