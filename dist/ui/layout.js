"use strict";
/**
 * =============================================================================
 * LAYOUT.TS - Main UI Layout Builder for GitBuddy
 * =============================================================================
 *
 * This file is responsible for constructing the main game interface layout.
 * It assembles all visual components into a unified, boxed display including:
 * - Title bar with pet name and level
 * - Mood indicator with emoji
 * - HP and XP progress bars
 * - ASCII art pet sprite
 * - Speech bubble messages
 * - Repository health checks
 * - Action help bar
 *
 * The layout uses Unicode box-drawing characters to create a clean, bordered
 * interface that adapts to terminal width while maintaining visual consistency.
 *
 * Key Features:
 * - Dynamic width calculation for terminal responsiveness
 * - ANSI code stripping for accurate length calculations
 * - Text wrapping for long messages
 * - Color-coded status indicators
 * - Level-based action availability display
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildLayout = buildLayout;
exports.buildHelpScreen = buildHelpScreen;
const chalk_1 = __importDefault(require("chalk")); // Terminal string styling library
const colors_js_1 = require("./colors.js");
const sprites_js_1 = require("../pet/sprites.js");
// =============================================================================
// STATUS ICON HELPER
// =============================================================================
/**
 * Gets the appropriate status icon for a health check result.
 * Icons are color-coded based on the severity of the status.
 *
 * @param status - The health check status ('great', 'ok', 'warning', or 'bad')
 * @returns A colored icon string: ✓ for good, ⚠ for warning, ✗ for bad
 */
function getStatusIcon(status) {
    switch (status) {
        case 'great':
            return colors_js_1.colors.healthy('✓'); // Green checkmark for excellent status
        case 'ok':
            return colors_js_1.colors.healthy('✓'); // Green checkmark for acceptable status
        case 'warning':
            return colors_js_1.colors.warning('⚠'); // Yellow warning triangle for caution
        case 'bad':
            return colors_js_1.colors.danger('✗'); // Red X for problems that need attention
    }
}
// =============================================================================
// HEALTH CHECK FORMATTER
// =============================================================================
/**
 * Formats a single health check line for display in the UI.
 * Creates a consistent format: "  [icon] [name]  [value]"
 *
 * @param check - The health check object containing name, status, and value
 * @param width - Available width for the line (used for padding calculations)
 * @returns A formatted, color-coded string representing the health check
 */
function formatHealthCheck(check, width) {
    // Get the appropriate colored icon based on status
    const icon = getStatusIcon(check.status);
    // Pad the check name to 18 characters for alignment
    const name = check.name.padEnd(18);
    // Get the value (e.g., "5 commits", "2 days ago")
    const value = check.value;
    // Determine the color function based on status
    // Great and OK statuses use green, warning uses yellow, bad uses red
    const statusColor = check.status === 'great' || check.status === 'ok'
        ? colors_js_1.colors.healthy
        : check.status === 'warning'
            ? colors_js_1.colors.warning
            : colors_js_1.colors.danger;
    // Assemble the formatted line with icon, name, and colored value
    return `  ${icon} ${name} ${statusColor(value)}`;
}
// =============================================================================
// HELP BAR BUILDER
// =============================================================================
/**
 * Creates the action help bar displayed at the bottom of the main UI.
 * Shows available keyboard shortcuts, with some actions grayed out
 * if the pet hasn't reached the required level yet.
 *
 * @param level - Current pet level (determines which actions are available)
 * @returns A formatted string showing all action shortcuts
 *
 * Action availability:
 * - [F]eed: Always available (level 1+)
 * - [P]lay: Requires level 2
 * - [S]tats: Requires level 3
 * - [H]elp and [Q]uit: Always available
 */
function createHelpBar(level) {
    // Show all main keys in a compact format
    const line1 = `${chalk_1.default.bold('[F]')}eed  ${chalk_1.default.bold('[C]')}ommit  ${chalk_1.default.bold('[T]')}imer  ${chalk_1.default.bold('[S]')}tats  ${chalk_1.default.bold('[H]')}elp`;
    return line1;
}
// =============================================================================
// MAIN LAYOUT BUILDER
// =============================================================================
/**
 * Builds the complete main game layout as a single string.
 * This is the primary function that assembles all UI components
 * into a bordered box display.
 *
 * Layout structure (top to bottom):
 * 1. Top border (╭───╮)
 * 2. Title bar (name + level stars)
 * 3. Mood line (mood text + XP counter)
 * 4. Empty spacer line
 * 5. HP progress bar
 * 6. XP progress bar
 * 7. Empty spacer line
 * 8. Pet sprite (ASCII art, centered)
 * 9. Minimum height padding (if sprite is short)
 * 10. Empty spacer line
 * 11. Message bubble (💬 with wrapped text)
 * 12. Empty spacer line
 * 13. Health checks (up to 4 displayed)
 * 14. Empty spacer line
 * 15. Help bar (centered action shortcuts)
 * 16. Bottom border (╰───╯)
 *
 * @param data - LayoutData object containing all display information
 * @returns A complete multi-line string ready for terminal output
 */
function buildLayout(data) {
    // Calculate width - use provided terminal width but cap at 60 for readability
    const width = Math.min(data.terminalWidth || 50, 60);
    // Inner width accounts for the left and right border characters
    const innerWidth = width - 4; // 2 for borders + 2 for padding
    const lines = [];
    // -------------------------------------------------------------------------
    // Top Padding - Ensures the frame is fully visible
    // -------------------------------------------------------------------------
    lines.push('');
    lines.push('');
    // -------------------------------------------------------------------------
    // Top Border - Using Unicode box-drawing characters
    // -------------------------------------------------------------------------
    lines.push(colors_js_1.colors.frame(`╭${'─'.repeat(width - 2)}╮`));
    // -------------------------------------------------------------------------
    // Title Bar - Pet name and level display
    // -------------------------------------------------------------------------
    const levelStars = (0, colors_js_1.getLevelStars)(data.level); // Generate ★★★☆☆ display
    const title = `  🐕 ${chalk_1.default.bold(data.name || 'GitBuddy')}`;
    const levelInfo = `Level ${data.level} ${levelStars}`;
    // Calculate padding to right-align level info
    // stripAnsi is needed because ANSI codes don't take visual space
    const titlePadding = width - 4 - stripAnsi(title).length - stripAnsi(levelInfo).length;
    lines.push(colors_js_1.colors.frame('│') + title + ' '.repeat(Math.max(1, titlePadding)) + levelInfo + colors_js_1.colors.frame(' │'));
    // -------------------------------------------------------------------------
    // Mood Line - Current mood with emoji and XP counter
    // -------------------------------------------------------------------------
    const moodText = `Mood: ${capitalize(data.mood)} ${colors_js_1.moodEmoji[data.mood] || ''}`;
    const xpText = `XP: ${data.xp}/${data.xpMax}`;
    const moodPadding = width - 4 - moodText.length - xpText.length;
    const moodColor = getMoodColor(data.mood); // Get mood-specific color function
    lines.push(colors_js_1.colors.frame('│') +
        `  ${moodColor(moodText)}` +
        ' '.repeat(Math.max(1, moodPadding - 2)) +
        colors_js_1.colors.textDim(xpText) +
        colors_js_1.colors.frame(' │'));
    // -------------------------------------------------------------------------
    // Empty Spacer Line
    // -------------------------------------------------------------------------
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // -------------------------------------------------------------------------
    // HP (Health Points) Progress Bar
    // -------------------------------------------------------------------------
    const hpBar = (0, colors_js_1.progressBar)(data.hp, 100, 16, 'hp'); // 16-character wide HP bar
    const hpLabel = 'HP ';
    const hpValue = ` ${data.hp}/100`;
    lines.push(colors_js_1.colors.frame('│') +
        `  ${chalk_1.default.bold(hpLabel)}${hpBar}${hpValue}` +
        ' '.repeat(Math.max(0, width - 4 - hpLabel.length - 16 - hpValue.length - 2)) +
        colors_js_1.colors.frame('│'));
    // -------------------------------------------------------------------------
    // XP (Experience Points) Progress Bar
    // -------------------------------------------------------------------------
    const xpBar = (0, colors_js_1.progressBar)(data.xp, data.xpMax, 16, 'xp'); // 16-character wide XP bar
    const xpLabel = 'XP ';
    const xpValue = ` ${data.xp}/${data.xpMax}`;
    lines.push(colors_js_1.colors.frame('│') +
        `  ${chalk_1.default.bold(xpLabel)}${xpBar}${xpValue}` +
        ' '.repeat(Math.max(0, width - 4 - xpLabel.length - 16 - xpValue.length - 2)) +
        colors_js_1.colors.frame('│'));
    // -------------------------------------------------------------------------
    // Empty Spacer Line
    // -------------------------------------------------------------------------
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // -------------------------------------------------------------------------
    // Pet Sprite Area - ASCII art of the pet
    // -------------------------------------------------------------------------
    // Render the sprite and split into individual lines
    const spriteLines = (0, sprites_js_1.renderSprite)(data.sprite, innerWidth - 4).split('\n');
    // Add each sprite line with proper padding to center within the box
    for (const spriteLine of spriteLines) {
        const lineLength = stripAnsi(spriteLine).length;
        const padding = width - 2 - lineLength;
        lines.push(colors_js_1.colors.frame('│') + spriteLine + ' '.repeat(Math.max(0, padding)) + colors_js_1.colors.frame('│'));
    }
    // -------------------------------------------------------------------------
    // Minimum Height Padding - Ensure consistent sprite area height
    // -------------------------------------------------------------------------
    // If the sprite is shorter than 8 lines, add empty lines to maintain layout
    const minSpriteHeight = 8;
    const spriteHeight = spriteLines.length;
    for (let i = spriteHeight; i < minSpriteHeight; i++) {
        lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    }
    // -------------------------------------------------------------------------
    // Empty Spacer Line
    // -------------------------------------------------------------------------
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // -------------------------------------------------------------------------
    // Message Bubble - Pet's speech/thought bubble
    // -------------------------------------------------------------------------
    if (data.message) {
        // Wrap long messages to fit within the box
        const msgLines = wrapText(data.message, innerWidth - 6);
        // First line includes the speech bubble emoji
        lines.push(colors_js_1.colors.frame('│') + `  💬 ${chalk_1.default.italic(msgLines[0])}` + ' '.repeat(Math.max(0, width - 6 - msgLines[0].length - 2)) + colors_js_1.colors.frame('│'));
        // Subsequent lines are indented to align with the first line's text
        for (let i = 1; i < msgLines.length; i++) {
            lines.push(colors_js_1.colors.frame('│') + `     ${chalk_1.default.italic(msgLines[i])}` + ' '.repeat(Math.max(0, width - 7 - msgLines[i].length)) + colors_js_1.colors.frame('│'));
        }
    }
    // -------------------------------------------------------------------------
    // Empty Spacer Line
    // -------------------------------------------------------------------------
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // -------------------------------------------------------------------------
    // Health Checks Section - Repository status indicators
    // -------------------------------------------------------------------------
    // Display up to 4 health checks to avoid cluttering the UI
    for (const check of data.healthChecks.slice(0, 4)) {
        const checkLine = formatHealthCheck(check, innerWidth);
        const checkLength = stripAnsi(checkLine).length;
        lines.push(colors_js_1.colors.frame('│') + checkLine + ' '.repeat(Math.max(0, width - 2 - checkLength)) + colors_js_1.colors.frame('│'));
    }
    // -------------------------------------------------------------------------
    // Empty Spacer Line
    // -------------------------------------------------------------------------
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // -------------------------------------------------------------------------
    // Help Bar - Action shortcuts (centered)
    // -------------------------------------------------------------------------
    const helpBar = createHelpBar(data.level);
    const helpLength = stripAnsi(helpBar).length;
    // Calculate padding to center the help bar
    const helpPadding = Math.max(0, Math.floor((width - 2 - helpLength) / 2));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(helpPadding) + helpBar + ' '.repeat(Math.max(0, width - 2 - helpPadding - helpLength)) + colors_js_1.colors.frame('│'));
    // -------------------------------------------------------------------------
    // Bottom Border
    // -------------------------------------------------------------------------
    lines.push(colors_js_1.colors.frame(`╰${'─'.repeat(width - 2)}╯`));
    // Join all lines with newlines for final output
    return lines.join('\n');
}
// =============================================================================
// HELPER FUNCTIONS
// =============================================================================
/**
 * Capitalizes the first letter of a string.
 * Used for displaying mood names in title case.
 *
 * @param str - The string to capitalize
 * @returns The string with the first character uppercase
 *
 * @example
 * capitalize('happy') // Returns 'Happy'
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
/**
 * Returns the appropriate chalk color function for a given mood.
 * Maps mood states to their corresponding visual colors.
 *
 * @param mood - The current mood state
 * @returns A chalk color function to apply to text
 */
function getMoodColor(mood) {
    switch (mood) {
        case 'happy':
            return colors_js_1.colors.happy; // Green for happiness
        case 'excited':
            return colors_js_1.colors.excited; // Bold yellow for excitement
        case 'sad':
            return colors_js_1.colors.sad; // Blue for sadness
        case 'sick':
            return colors_js_1.colors.danger; // Red for sickness/low HP
        case 'sleeping':
            return colors_js_1.colors.sleeping; // Dim cyan for sleeping
        default:
            return colors_js_1.colors.text; // White for neutral and other states
    }
}
/**
 * Wraps text to fit within a specified maximum width.
 * Breaks on word boundaries to avoid mid-word breaks.
 * Used for wrapping long pet messages in the speech bubble.
 *
 * @param text - The text to wrap
 * @param maxWidth - Maximum characters per line
 * @returns An array of lines, each within the maxWidth limit
 *
 * @example
 * wrapText('Hello world this is a test', 12)
 * // Returns ['Hello world', 'this is a', 'test']
 */
function wrapText(text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    for (const word of words) {
        // Check if adding this word would exceed the max width
        if (currentLine.length + word.length + 1 <= maxWidth) {
            // Add word to current line (with space if not first word)
            currentLine += (currentLine ? ' ' : '') + word;
        }
        else {
            // Start a new line with this word
            if (currentLine)
                lines.push(currentLine);
            currentLine = word;
        }
    }
    // Don't forget the last line
    if (currentLine)
        lines.push(currentLine);
    // Return at least an empty string if no lines were created
    return lines.length > 0 ? lines : [''];
}
/**
 * Strips ANSI escape codes from a string for accurate length calculation.
 * ANSI codes (used for colors) don't take up visual space but do
 * contribute to string length, so we need to remove them when
 * calculating padding and alignment.
 *
 * @param str - String potentially containing ANSI escape codes
 * @returns The string with all ANSI codes removed
 *
 * @example
 * stripAnsi('\x1b[32mGreen Text\x1b[0m') // Returns 'Green Text'
 */
function stripAnsi(str) {
    // Regex matches ANSI escape sequences: ESC [ followed by parameters and a letter
    return str.replace(/\x1b\[[0-9;]*m/g, '');
}
// =============================================================================
// HELP SCREEN BUILDER
// =============================================================================
/**
 * Builds the help screen overlay displayed when user presses [H].
 * Shows all available keyboard shortcuts and their descriptions.
 *
 * @returns A complete multi-line string for the help screen display
 */
function buildHelpScreen() {
    const width = 55; // Fixed width for help screen
    const lines = [];
    // -------------------------------------------------------------------------
    // Top Border and Title
    // -------------------------------------------------------------------------
    lines.push(colors_js_1.colors.frame(`╭${'─'.repeat(width - 2)}╮`));
    lines.push(colors_js_1.colors.frame('│') + chalk_1.default.bold.yellow('  📖 GitBuddy Help') + ' '.repeat(width - 21) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // -------------------------------------------------------------------------
    // Help Items - Key/Description pairs
    // -------------------------------------------------------------------------
    const helpItems = [
        ['[F] Feed', 'Scan for TODOs/console.logs (+XP)'],
        ['[P] Play', 'Smart dog tricks (Lvl 2+)'],
        ['[C] Commit', 'Smart commit message generator'],
        ['[T] Timer', 'Focus/Pomodoro mode'],
        ['[S] Stats', 'Git heatmap & streak dashboard'],
        ['[A] Awards', 'View achievements'],
        ['[R] Refresh', 'Re-scan repository health'],
        ['[H] Help', 'Show this help screen'],
        ['[E] Exit', 'Save and exit'],
        ['[X] Reset', 'Reset game (delete pet)'],
    ];
    // Add each help item with proper formatting
    for (const [key, desc] of helpItems) {
        const line = `  ${chalk_1.default.bold(key)}  ${desc}`;
        lines.push(colors_js_1.colors.frame('│') + line + ' '.repeat(width - 2 - stripAnsi(line).length) + colors_js_1.colors.frame('│'));
    }
    // -------------------------------------------------------------------------
    // Footer and Bottom Border
    // -------------------------------------------------------------------------
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + colors_js_1.colors.textDim('  Press any key to return...') + ' '.repeat(width - 36) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame(`╰${'─'.repeat(width - 2)}╯`));
    return lines.join('\n');
}
//# sourceMappingURL=layout.js.map