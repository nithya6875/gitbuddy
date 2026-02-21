/**
 * =============================================================================
 * HEATMAP.TS - Combined Stats & Progress Screen
 * =============================================================================
 *
 * Displays comprehensive git and pet statistics.
 */

import { execSync } from 'child_process';
import chalk from 'chalk';
import { colors, getLevelStars, progressBar } from '../ui/colors.js';
import { getLevelTitle, getXPProgress, levelThresholds } from '../state/xp.js';
import type { PetState } from '../state/persistence.js';
import type { Level } from '../pet/sprites.js';

// =============================================================================
// DATA COLLECTION
// =============================================================================

/**
 * Gets total commit count.
 */
function getTotalCommits(): number {
  try {
    const result = execSync('git rev-list --count HEAD', {
      encoding: 'utf-8',
      timeout: 5000,
    });
    return parseInt(result.trim()) || 0;
  } catch {
    return 0;
  }
}

/**
 * Gets the current commit streak (simplified).
 */
export function getCurrentStreak(): number {
  try {
    const result = execSync('git log --oneline -1 --format=%cd --date=short', {
      encoding: 'utf-8',
      timeout: 3000,
    });
    const lastCommitDate = result.trim();
    const today = new Date().toISOString().split('T')[0];
    return lastCommitDate === today ? 1 : 0;
  } catch {
    return 0;
  }
}

/**
 * Gets today's commit count.
 */
export function getTodayCommits(): number {
  try {
    const today = new Date().toISOString().split('T')[0];
    const result = execSync(`git log --oneline --since="${today}"`, {
      encoding: 'utf-8',
      timeout: 3000,
    });
    return result.trim().split('\n').filter(Boolean).length;
  } catch {
    return 0;
  }
}

/**
 * Gets commit counts for the last N days.
 * Returns an array of [date, count] pairs.
 */
function getCommitHistory(days: number): Map<string, number> {
  const commits = new Map<string, number>();

  try {
    // Get commit dates for the last N days
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString().split('T')[0];

    const result = execSync(`git log --format=%cd --date=short --since="${sinceStr}"`, {
      encoding: 'utf-8',
      timeout: 5000,
    });

    // Count commits per day
    const dates = result.trim().split('\n').filter(Boolean);
    for (const date of dates) {
      commits.set(date, (commits.get(date) || 0) + 1);
    }
  } catch {
    // Return empty map on error
  }

  return commits;
}

/**
 * Builds a visual heatmap grid for the last 4 weeks.
 */
function buildHeatmapGrid(): string[] {
  const commits = getCommitHistory(28);
  const lines: string[] = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get the last 4 weeks of dates organized by day of week
  const weeks: string[][] = [[], [], [], []]; // 4 weeks
  const today = new Date();

  for (let i = 27; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const weekIndex = Math.floor((27 - i) / 7);
    if (weekIndex < 4) {
      weeks[weekIndex].push(dateStr);
    }
  }

  // Build header with week labels
  lines.push('        Wk1   Wk2   Wk3   Wk4');

  // Build grid row by row (by day of week)
  for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
    let row = `  ${days[dayOfWeek]} `;

    for (let week = 0; week < 4; week++) {
      // Find the date in this week that matches this day of week
      let found = false;
      for (const dateStr of weeks[week]) {
        const date = new Date(dateStr);
        if (date.getDay() === dayOfWeek) {
          const count = commits.get(dateStr) || 0;
          row += ' ' + getHeatmapChar(count) + '   ';
          found = true;
          break;
        }
      }
      if (!found) {
        row += '     '; // Empty space for missing days
      }
    }

    lines.push(row);
  }

  // Legend
  lines.push('');
  lines.push('  Less ' + chalk.gray('░') + chalk.green('▒') + chalk.greenBright('▓') + chalk.bold.green('█') + ' More');

  return lines;
}

/**
 * Gets the heatmap character based on commit count.
 */
function getHeatmapChar(count: number): string {
  if (count === 0) return chalk.gray('░');
  if (count === 1) return chalk.green('▒');
  if (count <= 3) return chalk.greenBright('▓');
  return chalk.bold.green('█');
}

// =============================================================================
// UI BUILDER
// =============================================================================

/**
 * Builds the combined stats screen with git stats, pet progress, and more.
 */
export function buildHeatmapScreen(state: PetState): string {
  const width = 55;
  const lines: string[] = [];

  // Get git stats with error handling
  let totalCommits = 0;
  let streak = 0;
  let todayCommits = 0;

  try {
    totalCommits = getTotalCommits();
    streak = getCurrentStreak();
    todayCommits = getTodayCommits();
  } catch {
    // Use defaults
  }

  // Calculate days together
  const createdDate = new Date(state.createdAt);
  const daysTogether = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

  // XP progress
  const level = state.level as Level;
  const xpInLevel = state.xp - levelThresholds[level];
  const xpNeededForNext = level < 5 ? levelThresholds[(level + 1) as Level] - levelThresholds[level] : 0;

  // Header
  lines.push(colors.frame(`╭${'─'.repeat(width - 2)}╮`));
  lines.push(colors.frame('│') + chalk.bold.yellow(`  📊 ${state.name}'s Stats & Progress`) + ' '.repeat(width - 28 - state.name.length) + colors.frame('│'));
  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // ---- Pet Progress Section ----
  lines.push(colors.frame('│') + chalk.bold('  🐕 Pet Progress') + ' '.repeat(width - 20) + colors.frame('│'));

  // Level with stars
  const levelText = `Level ${state.level}: ${getLevelTitle(level)} ${getLevelStars(state.level)}`;
  lines.push(colors.frame('│') + `     ${levelText}` + ' '.repeat(Math.max(0, width - 7 - levelText.length)) + colors.frame('│'));

  // HP Bar
  const hpBar = progressBar(state.hp, 100, 20, 'hp');
  lines.push(colors.frame('│') + `     HP:  ${hpBar} ${state.hp}/100` + ' '.repeat(Math.max(0, width - 40)) + colors.frame('│'));

  // XP Bar
  if (level < 5) {
    const xpBar = progressBar(xpInLevel, xpNeededForNext, 20, 'xp');
    lines.push(colors.frame('│') + `     XP:  ${xpBar} ${xpInLevel}/${xpNeededForNext}` + ' '.repeat(Math.max(0, width - 40 - String(xpInLevel).length - String(xpNeededForNext).length + 6)) + colors.frame('│'));
  } else {
    lines.push(colors.frame('│') + chalk.bold.yellow('     XP:  ✨ MAX LEVEL ✨') + ' '.repeat(width - 28) + colors.frame('│'));
  }

  // Days together
  lines.push(colors.frame('│') + `     Days Together: ${daysTogether}` + ' '.repeat(width - 24 - String(daysTogether).length) + colors.frame('│'));

  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // ---- Git Stats Section ----
  lines.push(colors.frame('│') + chalk.bold('  💻 Git Stats') + ' '.repeat(width - 17) + colors.frame('│'));

  const totalLine = `     Total Commits: ${totalCommits}`;
  lines.push(colors.frame('│') + totalLine + ' '.repeat(width - 2 - totalLine.length) + colors.frame('│'));

  const todayLine = `     Today: ${todayCommits} commit${todayCommits !== 1 ? 's' : ''}`;
  lines.push(colors.frame('│') + todayLine + ' '.repeat(width - 2 - todayLine.length) + colors.frame('│'));

  const streakIcon = streak > 0 ? '🔥' : '❄️';
  const streakLine = `     ${streakIcon} Current Streak: ${streak} day${streak !== 1 ? 's' : ''}`;
  lines.push(colors.frame('│') + streakLine + ' '.repeat(width - 2 - streakLine.length) + colors.frame('│'));

  const longestLine = `     🏆 Longest Streak: ${state.longestStreak} days`;
  lines.push(colors.frame('│') + longestLine + ' '.repeat(width - 2 - longestLine.length) + colors.frame('│'));

  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // ---- Heatmap Section ----
  lines.push(colors.frame('│') + chalk.bold('  🗓️  Last 4 Weeks') + ' '.repeat(width - 21) + colors.frame('│'));

  const heatmapLines = buildHeatmapGrid();
  for (const heatLine of heatmapLines) {
    lines.push(colors.frame('│') + heatLine + ' '.repeat(Math.max(0, width - 2 - heatLine.length + 10)) + colors.frame('│'));
  }

  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // ---- Activity Section ----
  lines.push(colors.frame('│') + chalk.bold('  📈 Activity') + ' '.repeat(width - 16) + colors.frame('│'));

  const feedsLine = `     🍖 Total Feeds: ${state.totalFeeds}`;
  lines.push(colors.frame('│') + feedsLine + ' '.repeat(width - 2 - feedsLine.length) + colors.frame('│'));

  const playsLine = `     🎾 Total Plays: ${state.totalPlays}`;
  lines.push(colors.frame('│') + playsLine + ' '.repeat(width - 2 - playsLine.length) + colors.frame('│'));

  const scansLine = `     🔍 Total Scans: ${state.totalScans}`;
  lines.push(colors.frame('│') + scansLine + ' '.repeat(width - 2 - scansLine.length) + colors.frame('│'));

  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // Message
  const msg = streak > 0 ? '*happy pant* Keep up the good work!' : '*wag* Make a commit today!';
  lines.push(colors.frame('│') + colors.happy(`  💬 "${msg}"`) + ' '.repeat(Math.max(0, width - 8 - msg.length)) + colors.frame('│'));

  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));
  lines.push(colors.frame('│') + colors.textDim('  Press any key to go back...') + ' '.repeat(width - 33) + colors.frame('│'));
  lines.push(colors.frame(`╰${'─'.repeat(width - 2)}╯`));

  return lines.join('\n');
}
