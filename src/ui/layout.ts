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

import chalk from 'chalk'; // Terminal string styling library
import { colors, progressBar, moodEmoji, getLevelStars } from './colors.js';
import { renderSprite, getSpriteHeight, getLevelName } from '../pet/sprites.js';
import type { Mood, Level } from '../pet/sprites.js';
import type { HealthCheck } from '../health/scanner.js';
import { getLevelTitle, getLevelDescription, getXPProgress, levelThresholds } from '../state/xp.js';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * LayoutData Interface
 *
 * Contains all the data needed to render the main game layout.
 * This is passed to buildLayout() to construct the complete UI.
 */
export interface LayoutData {
  name: string;           // Pet's name (user-provided during intro)
  level: Level;           // Current level (1-5)
  hp: number;             // Current health points (0-100)
  xp: number;             // Current experience points
  xpMax: number;          // XP needed for next level
  mood: Mood;             // Current mood state (affects sprite and colors)
  message: string;        // Speech bubble message to display
  sprite: string[];       // ASCII art lines for the pet sprite
  healthChecks: HealthCheck[]; // Repository health check results
  terminalWidth?: number; // Optional terminal width for responsive layout
}

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
function getStatusIcon(status: HealthCheck['status']): string {
  switch (status) {
    case 'great':
      return colors.healthy('✓'); // Green checkmark for excellent status
    case 'ok':
      return colors.healthy('✓'); // Green checkmark for acceptable status
    case 'warning':
      return colors.warning('⚠'); // Yellow warning triangle for caution
    case 'bad':
      return colors.danger('✗');  // Red X for problems that need attention
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
function formatHealthCheck(check: HealthCheck, width: number): string {
  // Get the appropriate colored icon based on status
  const icon = getStatusIcon(check.status);

  // Pad the check name to 18 characters for alignment
  const name = check.name.padEnd(18);

  // Get the value (e.g., "5 commits", "2 days ago")
  const value = check.value;

  // Determine the color function based on status
  // Great and OK statuses use green, warning uses yellow, bad uses red
  const statusColor =
    check.status === 'great' || check.status === 'ok'
      ? colors.healthy
      : check.status === 'warning'
        ? colors.warning
        : colors.danger;

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
function createHelpBar(level: Level): string {
  // Show all main keys in a compact format
  return `${chalk.bold('[F]')}eed ${chalk.bold('[S]')}tats ${chalk.bold('[H]')}elp ${chalk.bold('[E]')}xit`;
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
export function buildLayout(data: LayoutData): string {
  // Calculate width - use provided terminal width but cap at 60 for readability
  const width = Math.min(data.terminalWidth || 50, 60);

  // Inner width accounts for the left and right border characters
  const innerWidth = width - 4; // 2 for borders + 2 for padding

  const lines: string[] = [];

  // -------------------------------------------------------------------------
  // Top Border - Using Unicode box-drawing characters
  // -------------------------------------------------------------------------
  lines.push(colors.frame(`╭${'─'.repeat(width - 2)}╮`));

  // -------------------------------------------------------------------------
  // Title Bar - Pet name and level stars
  // -------------------------------------------------------------------------
  const stars = '⭐'.repeat(data.level);
  const title = `  ${data.name || 'Buddy'} ${stars}`;
  const titlePadding = Math.max(0, width - 2 - title.length);
  lines.push(colors.frame('│') + chalk.bold.yellow(title) + ' '.repeat(titlePadding) + colors.frame('│'));

  // -------------------------------------------------------------------------
  // Mood Line - Current mood with emoji and XP counter
  // -------------------------------------------------------------------------
  const moodText = `Mood: ${capitalize(data.mood)} ${moodEmoji[data.mood] || ''}`;
  const xpText = `XP: ${data.xp}/${data.xpMax}`;
  const moodPadding = width - 4 - moodText.length - xpText.length;
  const moodColor = getMoodColor(data.mood); // Get mood-specific color function
  lines.push(
    colors.frame('│') +
    `  ${moodColor(moodText)}` +
    ' '.repeat(Math.max(1, moodPadding - 2)) +
    colors.textDim(xpText) +
    colors.frame(' │')
  );


  // -------------------------------------------------------------------------
  // Empty Spacer Line
  // -------------------------------------------------------------------------
  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // -------------------------------------------------------------------------
  // HP (Health Points) Progress Bar
  // -------------------------------------------------------------------------
  const hpBar = progressBar(data.hp, 100, 16, 'hp'); // 16-character wide HP bar
  const hpLabel = 'HP ';
  const hpValue = ` ${data.hp}/100`;
  lines.push(
    colors.frame('│') +
    `  ${chalk.bold(hpLabel)}${hpBar}${hpValue}` +
    ' '.repeat(Math.max(0, width - 4 - hpLabel.length - 16 - hpValue.length - 2)) +
    colors.frame('│')
  );

  // -------------------------------------------------------------------------
  // XP (Experience Points) Progress Bar
  // -------------------------------------------------------------------------
  const xpBar = progressBar(data.xp, data.xpMax, 16, 'xp'); // 16-character wide XP bar
  const xpLabel = 'XP ';
  const xpValue = ` ${data.xp}/${data.xpMax}`;
  lines.push(
    colors.frame('│') +
    `  ${chalk.bold(xpLabel)}${xpBar}${xpValue}` +
    ' '.repeat(Math.max(0, width - 4 - xpLabel.length - 16 - xpValue.length - 2)) +
    colors.frame('│')
  );

  // -------------------------------------------------------------------------
  // Empty Spacer Line
  // -------------------------------------------------------------------------
  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // -------------------------------------------------------------------------
  // Pet Sprite Area - ASCII art of the pet
  // -------------------------------------------------------------------------
  // Render the sprite and split into individual lines
  const spriteLines = renderSprite(data.sprite, innerWidth - 4).split('\n');

  // Add each sprite line with proper padding to center within the box
  for (const spriteLine of spriteLines) {
    const lineLength = stripAnsi(spriteLine).length;
    const padding = width - 2 - lineLength;
    lines.push(colors.frame('│') + spriteLine + ' '.repeat(Math.max(0, padding)) + colors.frame('│'));
  }

  // -------------------------------------------------------------------------
  // Minimum Height Padding - Ensure consistent sprite area height
  // -------------------------------------------------------------------------
  // If the sprite is shorter than 8 lines, add empty lines to maintain layout
  const minSpriteHeight = 8;
  const spriteHeight = spriteLines.length;
  for (let i = spriteHeight; i < minSpriteHeight; i++) {
    lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));
  }

  // -------------------------------------------------------------------------
  // Empty Spacer Line
  // -------------------------------------------------------------------------
  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // -------------------------------------------------------------------------
  // Message Bubble - Pet's speech/thought bubble (fixed 2 lines)
  // -------------------------------------------------------------------------
  const maxMsgLines = 2; // Fixed number of message lines to prevent frame drift
  if (data.message) {
    // Wrap long messages to fit within the box
    const msgLines = wrapText(data.message, innerWidth - 6).slice(0, maxMsgLines);

    // First line includes the speech bubble emoji
    lines.push(colors.frame('│') + `  💬 ${chalk.italic(msgLines[0])}` + ' '.repeat(Math.max(0, width - 6 - msgLines[0].length - 2)) + colors.frame('│'));

    // Second line (or empty padding)
    if (msgLines[1]) {
      lines.push(colors.frame('│') + `     ${chalk.italic(msgLines[1])}` + ' '.repeat(Math.max(0, width - 7 - msgLines[1].length)) + colors.frame('│'));
    } else {
      lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));
    }
  } else {
    // No message - add 2 empty lines to maintain consistent height
    lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));
    lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));
  }

  // -------------------------------------------------------------------------
  // Empty Spacer Line
  // -------------------------------------------------------------------------
  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // -------------------------------------------------------------------------
  // Health Checks Section - Repository status indicators (fixed 4 lines)
  // -------------------------------------------------------------------------
  const healthCheckCount = 4; // Fixed number of lines to prevent frame drift
  const checks = data.healthChecks.slice(0, healthCheckCount);
  for (let i = 0; i < healthCheckCount; i++) {
    if (checks[i]) {
      const checkLine = formatHealthCheck(checks[i], innerWidth);
      const checkLength = stripAnsi(checkLine).length;
      lines.push(colors.frame('│') + checkLine + ' '.repeat(Math.max(0, width - 2 - checkLength)) + colors.frame('│'));
    } else {
      // Pad with empty line if fewer than 4 checks
      lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));
    }
  }

  // -------------------------------------------------------------------------
  // Empty Spacer Line
  // -------------------------------------------------------------------------
  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // -------------------------------------------------------------------------
  // Help Bar - Action shortcuts (centered)
  // -------------------------------------------------------------------------
  const helpBar = createHelpBar(data.level);
  const helpLength = stripAnsi(helpBar).length;

  // Calculate padding to center the help bar
  const helpPadding = Math.max(0, Math.floor((width - 2 - helpLength) / 2));
  lines.push(colors.frame('│') + ' '.repeat(helpPadding) + helpBar + ' '.repeat(Math.max(0, width - 2 - helpPadding - helpLength)) + colors.frame('│'));

  // -------------------------------------------------------------------------
  // Bottom Border
  // -------------------------------------------------------------------------
  lines.push(colors.frame(`╰${'─'.repeat(width - 2)}╯`));

  // -------------------------------------------------------------------------
  // Fixed Height Padding - Ensure consistent total line count
  // -------------------------------------------------------------------------
  // This prevents frame drift by always outputting exactly 28 lines
  const targetLineCount = 28;
  while (lines.length < targetLineCount) {
    lines.push(''); // Empty lines to pad to fixed height
  }

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
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Returns the appropriate chalk color function for a given mood.
 * Maps mood states to their corresponding visual colors.
 *
 * @param mood - The current mood state
 * @returns A chalk color function to apply to text
 */
function getMoodColor(mood: Mood): (text: string) => string {
  switch (mood) {
    case 'happy':
      return colors.happy;    // Green for happiness
    case 'excited':
      return colors.excited;  // Bold yellow for excitement
    case 'sad':
      return colors.sad;      // Blue for sadness
    case 'sick':
      return colors.danger;   // Red for sickness/low HP
    case 'sleeping':
      return colors.sleeping; // Dim cyan for sleeping
    default:
      return colors.text;     // White for neutral and other states
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
function wrapText(text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    // Check if adding this word would exceed the max width
    if (currentLine.length + word.length + 1 <= maxWidth) {
      // Add word to current line (with space if not first word)
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      // Start a new line with this word
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }

  // Don't forget the last line
  if (currentLine) lines.push(currentLine);

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
function stripAnsi(str: string): string {
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
export function buildHelpScreen(): string {
  const width = 55; // Fixed width for help screen
  const lines: string[] = [];

  // -------------------------------------------------------------------------
  // Top Border and Title
  // -------------------------------------------------------------------------
  lines.push(colors.frame(`╭${'─'.repeat(width - 2)}╮`));
  lines.push(colors.frame('│') + chalk.bold.yellow('  📖 GitBuddy Help') + ' '.repeat(width - 21) + colors.frame('│'));
  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // -------------------------------------------------------------------------
  // Help Items - Key/Description pairs
  // -------------------------------------------------------------------------
  const helpItems = [
    ['[F] Feed', 'Scan for TODOs/console.logs (+XP)'],
    ['[P] Play', 'Smart dog tricks'],
    ['[L] Level', 'View level, HP & XP details'],
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
    const line = `  ${chalk.bold(key)}  ${desc}`;
    lines.push(colors.frame('│') + line + ' '.repeat(width - 2 - stripAnsi(line).length) + colors.frame('│'));
  }

  // -------------------------------------------------------------------------
  // Footer and Bottom Border
  // -------------------------------------------------------------------------
  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));
  lines.push(colors.frame('│') + colors.textDim('  Press any key to return...') + ' '.repeat(width - 36) + colors.frame('│'));
  lines.push(colors.frame(`╰${'─'.repeat(width - 2)}╯`));

  return lines.join('\n');
}

// =============================================================================
// LEVEL SCREEN BUILDER
// =============================================================================

/**
 * Data needed to render the level screen.
 */
export interface LevelScreenData {
  name: string;
  level: Level;
  hp: number;
  xp: number;
}

/**
 * Builds the level details screen displayed when user presses [L].
 * Shows detailed level, HP, and XP information with progress bars.
 *
 * @param data - LevelScreenData containing pet stats
 * @returns A complete bordered screen string
 */
export function buildLevelScreen(data: LevelScreenData): string {
  const width = 55;
  const lines: string[] = [];
  const { name, level, hp, xp } = data;

  // Get XP progress info
  const xpProgress = getXPProgress(xp);
  const nextLevelXP = level < 5 ? levelThresholds[(level + 1) as Level] : xp;
  const xpInLevel = xp - levelThresholds[level];
  const xpNeededForNext = level < 5 ? levelThresholds[(level + 1) as Level] - levelThresholds[level] : 0;

  // -------------------------------------------------------------------------
  // Header
  // -------------------------------------------------------------------------
  lines.push(colors.frame(`╭${'─'.repeat(width - 2)}╮`));
  lines.push(colors.frame('│') + chalk.bold.yellow(`  📊 ${name}'s Level & Stats`) + ' '.repeat(width - 24 - name.length) + colors.frame('│'));
  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // -------------------------------------------------------------------------
  // Level Section
  // -------------------------------------------------------------------------
  lines.push(colors.frame('│') + chalk.bold('  ⭐ Level') + ' '.repeat(width - 13) + colors.frame('│'));
  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // Level number with stars
  const stars = getLevelStars(level);
  const levelLine = `     Level ${level}: ${getLevelTitle(level)} ${stars}`;
  lines.push(colors.frame('│') + chalk.bold.cyan(levelLine) + ' '.repeat(Math.max(0, width - 2 - levelLine.length)) + colors.frame('│'));

  // Level description
  const desc = getLevelDescription(level);
  lines.push(colors.frame('│') + colors.textDim(`     ${desc}`) + ' '.repeat(Math.max(0, width - 7 - desc.length)) + colors.frame('│'));

  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // -------------------------------------------------------------------------
  // HP Section
  // -------------------------------------------------------------------------
  lines.push(colors.frame('│') + chalk.bold('  ❤️  Health Points (HP)') + ' '.repeat(width - 27) + colors.frame('│'));
  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // HP Bar (wider for detail)
  const hpBar = progressBar(hp, 100, 25, 'hp');
  lines.push(colors.frame('│') + `     ${hpBar} ${hp}/100` + ' '.repeat(Math.max(0, width - 39)) + colors.frame('│'));

  // HP status message
  let hpStatus = '';
  if (hp >= 80) hpStatus = '💪 Excellent health!';
  else if (hp >= 60) hpStatus = '😊 Good condition';
  else if (hp >= 40) hpStatus = '😐 Needs attention';
  else if (hp >= 20) hpStatus = '😟 Low health - commit more!';
  else hpStatus = '😢 Critical - needs care!';
  lines.push(colors.frame('│') + `     ${hpStatus}` + ' '.repeat(Math.max(0, width - 7 - hpStatus.length)) + colors.frame('│'));

  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // -------------------------------------------------------------------------
  // XP Section
  // -------------------------------------------------------------------------
  lines.push(colors.frame('│') + chalk.bold('  ✨ Experience Points (XP)') + ' '.repeat(width - 30) + colors.frame('│'));
  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // Total XP
  lines.push(colors.frame('│') + `     Total XP: ${xp}` + ' '.repeat(Math.max(0, width - 18 - String(xp).length)) + colors.frame('│'));

  // XP Progress to next level
  if (level < 5) {
    const xpBar = progressBar(xpInLevel, xpNeededForNext, 25, 'xp');
    lines.push(colors.frame('│') + `     ${xpBar} ${xpInLevel}/${xpNeededForNext}` + ' '.repeat(Math.max(0, width - 37 - String(xpInLevel).length - String(xpNeededForNext).length)) + colors.frame('│'));

    const xpToGo = nextLevelXP - xp;
    lines.push(colors.frame('│') + colors.textDim(`     ${xpToGo} XP to Level ${level + 1}`) + ' '.repeat(Math.max(0, width - 22 - String(xpToGo).length - String(level + 1).length)) + colors.frame('│'));
  } else {
    lines.push(colors.frame('│') + chalk.bold.yellow('     🏆 MAX LEVEL REACHED!') + ' '.repeat(width - 29) + colors.frame('│'));
    lines.push(colors.frame('│') + colors.textDim('     You are a Legendary Doge!') + ' '.repeat(width - 33) + colors.frame('│'));
  }

  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // -------------------------------------------------------------------------
  // Level Unlocks Preview
  // -------------------------------------------------------------------------
  lines.push(colors.frame('│') + chalk.bold('  🔓 Level Unlocks') + ' '.repeat(width - 21) + colors.frame('│'));

  const unlocks = [
    { lvl: 1, text: 'Feed, Help, Basic tricks', unlocked: level >= 1 },
    { lvl: 2, text: 'Smart Dog Tricks (Play)', unlocked: level >= 2 },
    { lvl: 3, text: 'Adult Dog sprite', unlocked: level >= 3 },
    { lvl: 4, text: 'Cool Dog with sunglasses 😎', unlocked: level >= 4 },
    { lvl: 5, text: 'Legendary Doge with crown 👑', unlocked: level >= 5 },
  ];

  for (const unlock of unlocks) {
    const icon = unlock.unlocked ? '✓' : '🔒';
    const color = unlock.unlocked ? colors.healthy : colors.textDim;
    const line = `     ${icon} Lvl ${unlock.lvl}: ${unlock.text}`;
    lines.push(colors.frame('│') + color(line) + ' '.repeat(Math.max(0, width - 2 - line.length)) + colors.frame('│'));
  }

  // -------------------------------------------------------------------------
  // Footer
  // -------------------------------------------------------------------------
  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));
  lines.push(colors.frame('│') + colors.textDim('  Press any key to return...') + ' '.repeat(width - 32) + colors.frame('│'));
  lines.push(colors.frame(`╰${'─'.repeat(width - 2)}╯`));

  return lines.join('\n');
}
