/**
 * =============================================================================
 * HEATMAP.TS - Git Stats Screen
 * =============================================================================
 *
 * Displays git statistics in a simple, Windows-compatible way.
 */

import { execSync } from 'child_process';
import chalk from 'chalk';
import { colors } from '../ui/colors.js';
import type { PetState } from '../state/persistence.js';

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

// =============================================================================
// UI BUILDER
// =============================================================================

/**
 * Builds the stats screen.
 */
export function buildHeatmapScreen(state: PetState): string {
  const width = 50;
  const lines: string[] = [];

  // Get stats with error handling
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

  lines.push(colors.frame(`╭${'─'.repeat(width - 2)}╮`));
  lines.push(colors.frame('│') + chalk.bold.yellow('  📊 Git Stats') + ' '.repeat(width - 17) + colors.frame('│'));
  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // Stats
  const totalLine = `  📝 Total Commits: ${totalCommits}`;
  lines.push(colors.frame('│') + totalLine + ' '.repeat(width - 2 - totalLine.length) + colors.frame('│'));

  const todayLine = `  📅 Today: ${todayCommits} commits`;
  lines.push(colors.frame('│') + todayLine + ' '.repeat(width - 2 - todayLine.length) + colors.frame('│'));

  const streakIcon = streak > 0 ? '🔥' : '❄️';
  const streakLine = `  ${streakIcon} Streak: ${streak} day${streak !== 1 ? 's' : ''}`;
  lines.push(colors.frame('│') + streakLine + ' '.repeat(width - 2 - streakLine.length) + colors.frame('│'));

  const longestLine = `  🏆 Longest Streak: ${state.longestStreak} days`;
  lines.push(colors.frame('│') + longestLine + ' '.repeat(width - 2 - longestLine.length) + colors.frame('│'));

  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // Pet stats
  lines.push(colors.frame('│') + chalk.bold('  Pet Stats:') + ' '.repeat(width - 15) + colors.frame('│'));

  const feedsLine = `  🍖 Total Feeds: ${state.totalFeeds}`;
  lines.push(colors.frame('│') + feedsLine + ' '.repeat(width - 2 - feedsLine.length) + colors.frame('│'));

  const playsLine = `  🎾 Total Plays: ${state.totalPlays}`;
  lines.push(colors.frame('│') + playsLine + ' '.repeat(width - 2 - playsLine.length) + colors.frame('│'));

  const levelLine = `  ⭐ Level: ${state.level}`;
  lines.push(colors.frame('│') + levelLine + ' '.repeat(width - 2 - levelLine.length) + colors.frame('│'));

  const xpLine = `  ✨ XP: ${state.xp}`;
  lines.push(colors.frame('│') + xpLine + ' '.repeat(width - 2 - xpLine.length) + colors.frame('│'));

  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // Message
  const msg = streak > 0 ? '*happy pant* Keep up the good work!' : '*wag* Make a commit today!';
  lines.push(colors.frame('│') + colors.happy(`  💬 "${msg}"`) + ' '.repeat(Math.max(0, width - 8 - msg.length)) + colors.frame('│'));

  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));
  lines.push(colors.frame('│') + colors.textDim('  Press any key to go back...') + ' '.repeat(width - 33) + colors.frame('│'));
  lines.push(colors.frame(`╰${'─'.repeat(width - 2)}╯`));

  return lines.join('\n');
}
