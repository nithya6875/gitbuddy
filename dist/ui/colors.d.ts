/**
 * =============================================================================
 * COLORS.TS - Color Theme and Visual Utilities for GitBuddy
 * =============================================================================
 *
 * This file defines the entire color palette used throughout the GitBuddy
 * application. It uses the 'chalk' library to apply terminal colors and
 * provides utility functions for rendering progress bars and level stars.
 *
 * Key Features:
 * - Centralized color definitions for consistent styling
 * - Dog-specific colors (body, nose, tongue, etc.)
 * - UI element colors (frames, status indicators)
 * - Mood-based color mappings
 * - Progress bar rendering utilities
 * - Level star display function
 */
/**
 * Master color theme object containing all color definitions for GitBuddy.
 * Each property is a chalk function that can be called with text to colorize it.
 * Example usage: colors.dogBody('some text') returns brown-colored text
 */
export declare const colors: {
    dogBody: import("chalk", { with: { "resolution-mode": "import" } }).ChalkInstance;
    dogBodyLight: import("chalk", { with: { "resolution-mode": "import" } }).ChalkInstance;
    dogBodyDark: import("chalk", { with: { "resolution-mode": "import" } }).ChalkInstance;
    dogNose: import("chalk", { with: { "resolution-mode": "import" } }).ChalkInstance;
    dogTongue: import("chalk", { with: { "resolution-mode": "import" } }).ChalkInstance;
    dogEyes: import("chalk", { with: { "resolution-mode": "import" } }).ChalkInstance;
    dogSpots: import("chalk", { with: { "resolution-mode": "import" } }).ChalkInstance;
    dogAccessory: import("chalk", { with: { "resolution-mode": "import" } }).ChalkInstance;
    frame: import("chalk", { with: { "resolution-mode": "import" } }).ChalkInstance;
    frameDim: import("chalk", { with: { "resolution-mode": "import" } }).ChalkInstance;
    title: import("chalk", { with: { "resolution-mode": "import" } }).ChalkInstance;
    subtitle: import("chalk", { with: { "resolution-mode": "import" } }).ChalkInstance;
    healthy: import("chalk", { with: { "resolution-mode": "import" } }).ChalkInstance;
    warning: import("chalk", { with: { "resolution-mode": "import" } }).ChalkInstance;
    danger: import("chalk", { with: { "resolution-mode": "import" } }).ChalkInstance;
    info: import("chalk", { with: { "resolution-mode": "import" } }).ChalkInstance;
    barFilled: import("chalk", { with: { "resolution-mode": "import" } }).ChalkInstance;
    barEmpty: import("chalk", { with: { "resolution-mode": "import" } }).ChalkInstance;
    xpFilled: import("chalk", { with: { "resolution-mode": "import" } }).ChalkInstance;
    text: import("chalk", { with: { "resolution-mode": "import" } }).ChalkInstance;
    textDim: import("chalk", { with: { "resolution-mode": "import" } }).ChalkInstance;
    textBold: import("chalk", { with: { "resolution-mode": "import" } }).ChalkInstance;
    happy: import("chalk", { with: { "resolution-mode": "import" } }).ChalkInstance;
    excited: import("chalk", { with: { "resolution-mode": "import" } }).ChalkInstance;
    neutral: import("chalk", { with: { "resolution-mode": "import" } }).ChalkInstance;
    sad: import("chalk", { with: { "resolution-mode": "import" } }).ChalkInstance;
    sick: import("chalk", { with: { "resolution-mode": "import" } }).ChalkInstance;
    sleeping: import("chalk", { with: { "resolution-mode": "import" } }).ChalkInstance;
    sparkle: import("chalk", { with: { "resolution-mode": "import" } }).ChalkInstance;
    heart: import("chalk", { with: { "resolution-mode": "import" } }).ChalkInstance;
    star: import("chalk", { with: { "resolution-mode": "import" } }).ChalkInstance;
    tear: import("chalk", { with: { "resolution-mode": "import" } }).ChalkInstance;
};
/**
 * Maps mood states to their corresponding emoji representations.
 * Used in the UI to visually indicate the pet's current emotional state.
 */
export declare const moodEmoji: Record<string, string>;
/**
 * Generates a visual representation of the pet's level using stars.
 * Displays filled stars (★) for completed levels and empty stars (☆) for remaining.
 *
 * @param level - Current level of the pet (1-5)
 * @returns A string with filled and empty stars, e.g., "★★★☆☆" for level 3
 *
 * @example
 * getLevelStars(3) // Returns colored "★★★" + dimmed "☆☆"
 */
export declare function getLevelStars(level: number): string;
/**
 * Creates a visual progress bar using Unicode block characters.
 * Used for displaying HP (health) and XP (experience) bars.
 *
 * @param current - Current value (e.g., current HP or XP)
 * @param max - Maximum possible value (e.g., 100 for HP, or XP needed for next level)
 * @param width - Width of the bar in characters (default: 16)
 * @param type - Type of bar: 'hp' uses health colors, 'xp' uses magenta
 * @returns A colored string representing the progress bar
 *
 * @example
 * progressBar(75, 100, 16, 'hp') // Returns green bar 75% filled
 * progressBar(50, 200, 16, 'xp') // Returns magenta bar 25% filled
 */
export declare function progressBar(current: number, max: number, width?: number, type?: 'hp' | 'xp'): string;
//# sourceMappingURL=colors.d.ts.map