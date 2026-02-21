"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moodEmoji = exports.colors = void 0;
exports.getLevelStars = getLevelStars;
exports.progressBar = progressBar;
const chalk_1 = __importDefault(require("chalk")); // Terminal string styling library
// =============================================================================
// COLOR THEME OBJECT
// =============================================================================
/**
 * Master color theme object containing all color definitions for GitBuddy.
 * Each property is a chalk function that can be called with text to colorize it.
 * Example usage: colors.dogBody('some text') returns brown-colored text
 */
exports.colors = {
    // -------------------------------------------------------------------------
    // Dog Colors - Used for rendering the ASCII pet sprite
    // -------------------------------------------------------------------------
    dogBody: chalk_1.default.hex('#D2691E'), // Chocolate brown - main body color
    dogBodyLight: chalk_1.default.hex('#DEB887'), // Burlywood - lighter fur areas/shading
    dogBodyDark: chalk_1.default.hex('#8B4513'), // Saddle brown - darker fur areas
    dogNose: chalk_1.default.hex('#2F1810'), // Dark brown - nose and snout
    dogTongue: chalk_1.default.hex('#FF69B4'), // Hot pink - tongue when panting
    dogEyes: chalk_1.default.hex('#1a1a1a'), // Near black - eye color
    dogSpots: chalk_1.default.hex('#8B4513'), // Saddle brown - spot patterns on coat
    dogAccessory: chalk_1.default.hex('#FFD700'), // Gold - accessories like crown, sunglasses
    // -------------------------------------------------------------------------
    // UI Frame Colors - Used for the main interface box borders
    // -------------------------------------------------------------------------
    frame: chalk_1.default.cyan, // Main border color (bright cyan)
    frameDim: chalk_1.default.dim.cyan, // Dimmed border for inactive elements
    title: chalk_1.default.bold.yellow, // Title text (bold yellow for emphasis)
    subtitle: chalk_1.default.dim.white, // Subtitle/secondary text (dimmed white)
    // -------------------------------------------------------------------------
    // Status Colors - Used for health checks and indicators
    // -------------------------------------------------------------------------
    healthy: chalk_1.default.green, // Good status (✓ checkmarks, positive values)
    warning: chalk_1.default.yellow, // Warning status (⚠ alerts, medium values)
    danger: chalk_1.default.red, // Bad status (✗ crosses, critical values)
    info: chalk_1.default.blue, // Informational messages
    // -------------------------------------------------------------------------
    // Progress Bar Colors - Used for HP and XP bars
    // -------------------------------------------------------------------------
    barFilled: chalk_1.default.green, // Filled portion of HP bar (when healthy)
    barEmpty: chalk_1.default.dim.gray, // Empty portion of any progress bar
    xpFilled: chalk_1.default.magenta, // Filled portion of XP bar (purple/magenta)
    // -------------------------------------------------------------------------
    // Text Colors - General purpose text styling
    // -------------------------------------------------------------------------
    text: chalk_1.default.white, // Normal text color
    textDim: chalk_1.default.dim.white, // Dimmed/subtle text (hints, labels)
    textBold: chalk_1.default.bold.white, // Emphasized/important text
    // -------------------------------------------------------------------------
    // Mood Colors - Color coding for different pet moods
    // -------------------------------------------------------------------------
    happy: chalk_1.default.green, // Happy mood (70-89 HP)
    excited: chalk_1.default.bold.yellow, // Excited mood (90-100 HP) - bold for emphasis
    neutral: chalk_1.default.white, // Neutral mood (50-69 HP)
    sad: chalk_1.default.blue, // Sad mood (25-49 HP)
    sick: chalk_1.default.red, // Sick mood (0-24 HP)
    sleeping: chalk_1.default.dim.cyan, // Sleeping state (after 60s idle)
    // -------------------------------------------------------------------------
    // Special Effect Colors - Decorative elements
    // -------------------------------------------------------------------------
    sparkle: chalk_1.default.yellow, // ★ stars and ✦ sparkles
    heart: chalk_1.default.red, // ♥ hearts (love/affection indicators)
    star: chalk_1.default.yellow, // Level stars display
    tear: chalk_1.default.cyan, // 💧 tear drops for sad mood
};
// =============================================================================
// MOOD EMOJI MAPPINGS
// =============================================================================
/**
 * Maps mood states to their corresponding emoji representations.
 * Used in the UI to visually indicate the pet's current emotional state.
 */
exports.moodEmoji = {
    happy: '😊', // Standard happy face
    excited: '🤩', // Star-struck/very happy
    neutral: '😐', // Neutral/expressionless
    sad: '😢', // Crying face
    sick: '🤒', // Sick face with thermometer
    sleeping: '😴', // Sleeping face with ZZZ
    eating: '😋', // Yummy face (during feed action)
    playing: '🎾', // Tennis ball (during play action)
};
// =============================================================================
// LEVEL STARS FUNCTION
// =============================================================================
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
function getLevelStars(level) {
    // Create filled stars equal to the level (capped at 5 maximum)
    const filled = '★'.repeat(Math.min(level, 5));
    // Create empty stars for remaining levels up to 5
    const empty = '☆'.repeat(Math.max(0, 5 - level));
    // Apply yellow color to filled stars and dim color to empty stars
    return exports.colors.star(filled) + chalk_1.default.dim(empty);
}
// =============================================================================
// PROGRESS BAR FUNCTION
// =============================================================================
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
function progressBar(current, max, width = 16, type = 'hp') {
    // Calculate percentage, clamped between 0 and 1
    // Math.max(0, ...) ensures we don't go below 0
    // Math.min(1, ...) ensures we don't exceed 100%
    const percentage = Math.max(0, Math.min(1, current / max));
    // Calculate how many characters should be filled based on percentage
    const filled = Math.round(percentage * width);
    // Calculate remaining empty characters
    const empty = width - filled;
    // Determine the fill color based on bar type and health level
    // HP bars change color based on health percentage:
    // - >50%: Green (healthy)
    // - >20%: Yellow (warning)
    // - ≤20%: Red (danger)
    // XP bars are always magenta
    const fillColor = type === 'hp'
        ? (percentage > 0.5 ? exports.colors.barFilled : percentage > 0.2 ? exports.colors.warning : exports.colors.danger)
        : exports.colors.xpFilled;
    // Build the bar using '█' (solid block) for filled and '░' (light shade) for empty
    const filledBar = fillColor('█'.repeat(filled));
    const emptyBar = exports.colors.barEmpty('░'.repeat(empty));
    // Concatenate and return the complete progress bar
    return filledBar + emptyBar;
}
//# sourceMappingURL=colors.js.map