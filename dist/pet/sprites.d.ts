/**
 * =============================================================================
 * SPRITES.TS - ASCII Art Pet Sprites and Animation System
 * =============================================================================
 *
 * This file contains all the ASCII art sprites for the GitBuddy pet.
 * The pet has 5 evolution levels, each with multiple mood variations
 * and animation frames for a lively, expressive character.
 *
 * Evolution Levels:
 * - Level 1 (Puppy): Small, cute, big eyes - 6 lines tall
 * - Level 2 (Young Dog): Medium, more detail, has tail - 7 lines tall
 * - Level 3 (Adult Dog): Full size, spots pattern - 9 lines tall
 * - Level 4 (Cool Dog): Same as adult but with sunglasses! - 9 lines tall
 * - Level 5 (Legendary Doge): Crown, sparkles, maximum majesty - 11 lines tall
 *
 * Each level has sprites for these moods:
 * - happy, happyTail2 (wagging animation)
 * - excited (bouncing, hearts)
 * - sad (droopy, tears)
 * - sick (X eyes, faded colors)
 * - sleeping (closed eyes, ZZZ)
 * - neutral (calm expression)
 * - eating (mouth open)
 * - blink (closed eyes for blinking animation)
 *
 * The sprites use Unicode box-drawing characters and special symbols
 * for a cute, pixelated appearance in the terminal.
 */
/**
 * Possible mood states for the pet.
 * Each mood has corresponding sprite art and color treatments.
 */
export type Mood = 'happy' | 'excited' | 'neutral' | 'sad' | 'sick' | 'sleeping' | 'eating' | 'playing';
/**
 * Pet evolution levels (1-5).
 * Higher levels unlock features and have more elaborate sprites.
 */
export type Level = 1 | 2 | 3 | 4 | 5;
/**
 * Gets the appropriate sprite for a given mood, level, and animation frame.
 * Handles animation logic for tail wagging, bouncing, and blinking.
 *
 * @param mood - Current mood state
 * @param level - Pet's evolution level (1-5)
 * @param frame - Current animation frame number (increments over time)
 * @param isBlinking - Whether the pet is currently blinking
 * @returns Array of strings representing the sprite lines
 *
 * @example
 * const sprite = getSprite('happy', 3, 0, false);
 * // Returns adultHappy sprite
 *
 * const sprite = getSprite('happy', 3, 1, false);
 * // Returns adultHappyTail2 sprite (tail wagging)
 */
export declare function getSprite(mood: Mood, level: Level, frame: number, isBlinking?: boolean): string[];
/**
 * Colorizes and centers a sprite for display.
 * Applies color styling and centers within the specified width.
 *
 * @param sprite - Array of sprite line strings
 * @param width - Target width for centering (default: 40)
 * @returns Single string with all lines joined by newlines
 */
export declare function renderSprite(sprite: string[], width?: number): string;
/**
 * Gets the height (number of lines) of sprites at a given level.
 * Used for layout calculations.
 *
 * @param level - Pet level (1-5)
 * @returns Number of lines in the sprite
 */
export declare function getSpriteHeight(level: Level): number;
/**
 * Adds a breathing animation effect to a sprite.
 * Every 4 frames, adds an empty line on top to simulate upward movement.
 *
 * @param sprite - Original sprite array
 * @param frame - Current animation frame
 * @returns Modified sprite with breathing effect
 */
export declare function addBreathing(sprite: string[], frame: number): string[];
/**
 * Gets the display name for a level.
 *
 * @param level - Pet level (1-5)
 * @returns Human-readable level name
 */
export declare function getLevelName(level: Level): string;
//# sourceMappingURL=sprites.d.ts.map