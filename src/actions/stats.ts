/**
 * =============================================================================
 * STATS.TS - Statistics Screen Builder for GitBuddy
 * =============================================================================
 *
 * This file implements the "Stats" action, available once the pet reaches
 * level 3. It displays comprehensive statistics about both the pet and
 * the repository, providing insights into the user's coding journey.
 *
 * Statistics displayed:
 *
 * Pet Info Section:
 * - Current level with title and star display
 * - XP accumulated
 * - HP (health points)
 * - Days together (since pet creation)
 *
 * Activity Section:
 * - Total number of feeds
 * - Total number of play sessions
 * - Longest commit streak achieved
 * - Total repository scans performed
 *
 * Repository Section:
 * - Overall health score (0-100)
 * - Total commit count
 * - Current commit streak
 * - Time since last commit
 *
 * Achievements Section:
 * - Unlocked achievements (up to 3 shown)
 * - Count of additional achievements
 *
 * Key Features:
 * - Clean, organized statistics layout
 * - Human-readable time formatting
 * - Achievement showcase
 * - Section-based organization
 */

import chalk from 'chalk'; // Terminal string styling library
import { colors, getLevelStars } from '../ui/colors.js';
import { getLevelTitle } from '../state/xp.js';
import type { PetState } from '../state/persistence.js';
import type { RepoHealth } from '../health/scanner.js';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * StatsData Interface
 *
 * Contains all data needed to render the statistics screen.
 * Combines pet state with repository health information.
 */
export interface StatsData {
  state: PetState;    // Current pet state (level, XP, HP, activities)
  health: RepoHealth; // Repository health data (commits, streaks, score)
}

// =============================================================================
// STATS SCREEN BUILDER
// =============================================================================

/**
 * Builds the statistics screen displayed when user presses [S].
 * Organizes statistics into clear sections with icons and labels.
 *
 * @param data - StatsData containing pet state and repo health
 * @returns A complete bordered screen string
 *
 * Screen layout:
 * - Title with pet name
 * - Pet Info section (level, XP, HP, days together)
 * - Activity section (feeds, plays, streaks, scans)
 * - Repository section (health score, commits, streak, last commit)
 * - Achievements section (if any unlocked)
 */
export function buildStatsScreen(data: StatsData): string {
  const width = 55; // Wider to accommodate longer stat lines
  const lines: string[] = [];
  const { state, health } = data; // Destructure for cleaner access

  // -------------------------------------------------------------------------
  // Header - Title with pet name
  // -------------------------------------------------------------------------
  lines.push(colors.frame(`╭${'─'.repeat(width - 2)}╮`));
  lines.push(colors.frame('│') + chalk.bold.yellow(`  📊 ${state.name}'s Statistics`) + ' '.repeat(width - 23 - state.name.length) + colors.frame('│'));
  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // -------------------------------------------------------------------------
  // Pet Info Section - Core pet statistics
  // -------------------------------------------------------------------------
  lines.push(colors.frame('│') + chalk.bold('  🐕 Pet Info') + ' '.repeat(width - 16) + colors.frame('│'));

  // Level display with title and stars
  // getLevelTitle returns names like "Puppy", "Junior", "Good Boy", etc.
  lines.push(colors.frame('│') + `     Level: ${state.level} (${getLevelTitle(state.level as 1|2|3|4|5)}) ${getLevelStars(state.level)}` + ' '.repeat(width - 38 - getLevelTitle(state.level as 1|2|3|4|5).length) + colors.frame('│'));

  // XP display
  lines.push(colors.frame('│') + `     XP: ${state.xp}` + ' '.repeat(width - 12 - String(state.xp).length) + colors.frame('│'));

  // HP display with max value
  lines.push(colors.frame('│') + `     HP: ${state.hp}/100` + ' '.repeat(width - 16 - String(state.hp).length) + colors.frame('│'));

  // -------------------------------------------------------------------------
  // Days Together Calculation
  // -------------------------------------------------------------------------
  // Calculate how many days since the pet was created
  const createdDate = new Date(state.createdAt);
  const daysTogether = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  lines.push(colors.frame('│') + `     Days Together: ${daysTogether}` + ' '.repeat(width - 23 - String(daysTogether).length) + colors.frame('│'));

  // Section separator
  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // -------------------------------------------------------------------------
  // Activity Section - User engagement statistics
  // -------------------------------------------------------------------------
  lines.push(colors.frame('│') + chalk.bold('  📈 Activity') + ' '.repeat(width - 16) + colors.frame('│'));

  // Total feed actions performed
  lines.push(colors.frame('│') + `     Total Feeds: ${state.totalFeeds}` + ' '.repeat(width - 21 - String(state.totalFeeds).length) + colors.frame('│'));

  // Total play actions performed
  lines.push(colors.frame('│') + `     Total Plays: ${state.totalPlays}` + ' '.repeat(width - 21 - String(state.totalPlays).length) + colors.frame('│'));

  // Longest commit streak ever achieved (personal best)
  lines.push(colors.frame('│') + `     Longest Streak: ${state.longestStreak} days` + ' '.repeat(width - 28 - String(state.longestStreak).length) + colors.frame('│'));

  // Total number of repository scans
  lines.push(colors.frame('│') + `     Total Scans: ${state.totalScans}` + ' '.repeat(width - 21 - String(state.totalScans).length) + colors.frame('│'));

  // Section separator
  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // -------------------------------------------------------------------------
  // Repository Section - Git repository statistics
  // -------------------------------------------------------------------------
  lines.push(colors.frame('│') + chalk.bold('  💻 Repository') + ' '.repeat(width - 18) + colors.frame('│'));

  // Overall health score (calculated from various repo metrics)
  lines.push(colors.frame('│') + `     Health Score: ${health.totalScore}/100` + ' '.repeat(width - 26 - String(health.totalScore).length) + colors.frame('│'));

  // Total commit count in the repository
  lines.push(colors.frame('│') + `     Total Commits: ${health.commitCount}` + ' '.repeat(width - 24 - String(health.commitCount).length) + colors.frame('│'));

  // Current commit streak in days
  lines.push(colors.frame('│') + `     Current Streak: ${health.streak} days` + ' '.repeat(width - 28 - String(health.streak).length) + colors.frame('│'));

  // -------------------------------------------------------------------------
  // Last Commit Time - Human-readable format
  // -------------------------------------------------------------------------
  if (health.lastCommitDate) {
    const lastCommit = formatTimeAgo(health.lastCommitDate);
    lines.push(colors.frame('│') + `     Last Commit: ${lastCommit}` + ' '.repeat(width - 21 - lastCommit.length) + colors.frame('│'));
  }

  // Section separator
  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // -------------------------------------------------------------------------
  // Achievements Section - Only shown if achievements exist
  // -------------------------------------------------------------------------
  if (state.achievements.length > 0) {
    lines.push(colors.frame('│') + chalk.bold('  🏆 Achievements') + ' '.repeat(width - 20) + colors.frame('│'));

    // Show up to 3 achievements with star icons
    for (const achievement of state.achievements.slice(0, 3)) {
      lines.push(colors.frame('│') + `     ⭐ ${achievement}` + ' '.repeat(Math.max(0, width - 8 - achievement.length)) + colors.frame('│'));
    }

    // If more than 3 achievements, show count of additional
    if (state.achievements.length > 3) {
      lines.push(colors.frame('│') + colors.textDim(`     ... and ${state.achievements.length - 3} more`) + ' '.repeat(width - 22 - String(state.achievements.length - 3).length) + colors.frame('│'));
    }

    // Section separator
    lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));
  }

  // -------------------------------------------------------------------------
  // Footer
  // -------------------------------------------------------------------------
  lines.push(colors.frame('│') + colors.textDim('  Press any key to return...') + ' '.repeat(width - 32) + colors.frame('│'));
  lines.push(colors.frame(`╰${'─'.repeat(width - 2)}╯`));

  return lines.join('\n');
}

// =============================================================================
// TIME FORMATTING HELPER
// =============================================================================

/**
 * Formats a date as a human-readable "time ago" string.
 * Used to display when the last commit occurred in a friendly format.
 *
 * @param date - The Date object to format
 * @returns A human-readable string like "5 minutes ago" or "2 days ago"
 *
 * Time ranges:
 * - < 60 seconds: "just now"
 * - < 60 minutes: "X minutes ago"
 * - < 24 hours: "X hours ago"
 * - < 7 days: "X days ago"
 * - >= 7 days: "X weeks ago"
 */
function formatTimeAgo(date: Date): string {
  // Calculate total seconds elapsed
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  // Less than a minute
  if (seconds < 60) return 'just now';

  // Less than an hour (60 seconds * 60 minutes = 3600)
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;

  // Less than a day (3600 seconds * 24 hours = 86400)
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;

  // Less than a week (86400 seconds * 7 days = 604800)
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;

  // A week or more
  return `${Math.floor(seconds / 604800)} weeks ago`;
}
