/**
 * =============================================================================
 * HEATMAP.TS - Git Activity Heatmap & Streak Dashboard
 * =============================================================================
 *
 * Displays a GitHub-style contribution heatmap for the last 12 weeks
 * along with streak statistics and commit history.
 */

import { execSync } from 'child_process';
import chalk from 'chalk';
import { colors } from '../ui/colors.js';
import type { PetState } from '../state/persistence.js';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface HeatmapData {
  weeks: number[][];           // 12 weeks x 7 days of commit counts
  totalCommits: number;
  currentStreak: number;
  longestStreak: number;
  averagePerDay: number;
  mostActiveDay: string;
  commitsThisWeek: number;
  commitsLastWeek: number;
}

// =============================================================================
// DATA COLLECTION
// =============================================================================

/**
 * Gets commit counts for the last 84 days (12 weeks).
 */
export function getHeatmapData(): HeatmapData {
  const weeks: number[][] = [];
  const today = new Date();
  let totalCommits = 0;
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  const dayCounts: Record<string, number> = {
    Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0,
  };
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get commits for last 84 days
  const dailyCommits: number[] = [];

  for (let i = 83; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    let commits = 0;
    try {
      const result = execSync(
        `git log --oneline --after="${dateStr} 00:00" --before="${dateStr} 23:59" 2>/dev/null || echo ""`,
        { encoding: 'utf-8', timeout: 5000 }
      );
      commits = result.trim().split('\n').filter(Boolean).length;
    } catch {
      commits = 0;
    }

    dailyCommits.push(commits);
    totalCommits += commits;
    dayCounts[dayNames[date.getDay()]] += commits;

    // Track streaks
    if (commits > 0) {
      tempStreak++;
      if (i === 0) currentStreak = tempStreak;
    } else {
      if (tempStreak > longestStreak) longestStreak = tempStreak;
      tempStreak = 0;
      if (i === 0) currentStreak = 0;
    }
  }

  // Check final streak
  if (tempStreak > longestStreak) longestStreak = tempStreak;

  // Build weeks array (12 weeks x 7 days)
  for (let w = 0; w < 12; w++) {
    const week: number[] = [];
    for (let d = 0; d < 7; d++) {
      const index = w * 7 + d;
      week.push(dailyCommits[index] || 0);
    }
    weeks.push(week);
  }

  // Find most active day
  let mostActiveDay = 'Mon';
  let maxDayCommits = 0;
  for (const [day, count] of Object.entries(dayCounts)) {
    if (count > maxDayCommits) {
      maxDayCommits = count;
      mostActiveDay = day;
    }
  }

  // Calculate this week and last week
  const commitsThisWeek = weeks[11]?.reduce((a, b) => a + b, 0) || 0;
  const commitsLastWeek = weeks[10]?.reduce((a, b) => a + b, 0) || 0;

  return {
    weeks,
    totalCommits,
    currentStreak,
    longestStreak,
    averagePerDay: totalCommits / 84,
    mostActiveDay,
    commitsThisWeek,
    commitsLastWeek,
  };
}

/**
 * Gets the current commit streak.
 */
export function getCurrentStreak(): number {
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    try {
      const result = execSync(
        `git log --oneline --after="${dateStr} 00:00" --before="${dateStr} 23:59" 2>/dev/null || echo ""`,
        { encoding: 'utf-8', timeout: 3000 }
      );
      const commits = result.trim().split('\n').filter(Boolean).length;

      if (commits > 0) {
        streak++;
      } else if (i > 0) {
        // Allow today to have no commits yet
        break;
      }
    } catch {
      break;
    }
  }

  return streak;
}

/**
 * Gets today's commit count.
 */
export function getTodayCommits(): number {
  const today = new Date().toISOString().split('T')[0];

  try {
    const result = execSync(
      `git log --oneline --after="${today} 00:00" 2>/dev/null || echo ""`,
      { encoding: 'utf-8', timeout: 3000 }
    );
    return result.trim().split('\n').filter(Boolean).length;
  } catch {
    return 0;
  }
}

// =============================================================================
// HEATMAP RENDERING
// =============================================================================

/**
 * Gets the color for a commit count.
 */
function getHeatColor(commits: number): string {
  if (commits === 0) return chalk.gray('░');
  if (commits === 1) return chalk.green('▒');
  if (commits <= 3) return chalk.greenBright('▓');
  return chalk.bold.greenBright('█');
}

/**
 * Builds the heatmap display.
 */
function buildHeatmap(weeks: number[][]): string[] {
  const lines: string[] = [];
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Build each row (day of week)
  for (let d = 0; d < 7; d++) {
    let row = `  ${dayLabels[d]} `;
    for (let w = 0; w < 12; w++) {
      row += getHeatColor(weeks[w][d]) + ' ';
    }
    lines.push(row);
  }

  // Week labels
  let weekLabel = '    ';
  for (let w = 0; w < 12; w++) {
    if (w === 0) weekLabel += '12';
    else if (w === 5) weekLabel += ' 6';
    else if (w === 11) weekLabel += ' 1';
    else weekLabel += '  ';
  }
  lines.push(chalk.gray(weekLabel + ' weeks ago'));

  return lines;
}

// =============================================================================
// UI BUILDERS
// =============================================================================

/**
 * Builds the full heatmap stats screen.
 */
export function buildHeatmapScreen(state: PetState): string {
  const width = 60;
  const lines: string[] = [];
  const data = getHeatmapData();

  lines.push(colors.frame(`\u256d${'─'.repeat(width - 2)}\u256e`));
  lines.push(colors.frame('│') + chalk.bold.yellow('  📊 Git Stats & Activity') + ' '.repeat(width - 28) + colors.frame('│'));
  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // Streak info
  const streakIcon = data.currentStreak > 0 ? '🔥' : '❄️';
  lines.push(colors.frame('│') + `  ${streakIcon} Current Streak: ${data.currentStreak} days` + ' '.repeat(width - 29 - String(data.currentStreak).length) + colors.frame('│'));
  lines.push(colors.frame('│') + `  🏆 Longest Streak: ${data.longestStreak} days` + ' '.repeat(width - 28 - String(data.longestStreak).length) + colors.frame('│'));

  // Update pet's longest streak if we beat it
  if (data.longestStreak > state.longestStreak) {
    lines.push(colors.frame('│') + colors.healthy(`     ↑ New record!`) + ' '.repeat(width - 22) + colors.frame('│'));
  }

  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // Activity heatmap
  lines.push(colors.frame('│') + chalk.bold('  Activity (last 12 weeks):') + ' '.repeat(width - 30) + colors.frame('│'));
  const heatmap = buildHeatmap(data.weeks);
  for (const heatLine of heatmap) {
    lines.push(colors.frame('│') + heatLine + ' '.repeat(Math.max(0, width - 2 - heatLine.length + 10)) + colors.frame('│'));
  }

  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // Stats summary
  lines.push(colors.frame('│') + chalk.bold('  Quick Stats:') + ' '.repeat(width - 17) + colors.frame('│'));
  lines.push(colors.frame('│') + `  📝 Total commits (12 wks): ${data.totalCommits}` + ' '.repeat(width - 33 - String(data.totalCommits).length) + colors.frame('│'));
  lines.push(colors.frame('│') + `  📅 This week: ${data.commitsThisWeek} commits` + ' '.repeat(width - 27 - String(data.commitsThisWeek).length) + colors.frame('│'));

  // Compare to last week
  const diff = data.commitsThisWeek - data.commitsLastWeek;
  const diffStr = diff >= 0 ? `+${diff}` : `${diff}`;
  const diffColor = diff >= 0 ? colors.healthy : colors.danger;
  lines.push(colors.frame('│') + `  📈 vs last week: ` + diffColor(diffStr) + ' '.repeat(width - 22 - diffStr.length) + colors.frame('│'));

  lines.push(colors.frame('│') + `  ⭐ Most active day: ${data.mostActiveDay}` + ' '.repeat(width - 26 - data.mostActiveDay.length) + colors.frame('│'));
  const avgStr = data.averagePerDay.toFixed(1);
  lines.push(colors.frame('│') + `  📊 Average/day: ${avgStr}` + ' '.repeat(width - 22 - avgStr.length) + colors.frame('│'));

  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // Legend
  lines.push(colors.frame('│') + '  Legend: ' + chalk.gray('░') + ' None  ' + chalk.green('▒') + ' 1  ' + chalk.greenBright('▓') + ' 2-3  ' + chalk.bold.greenBright('█') + ' 4+' + ' '.repeat(width - 40) + colors.frame('│'));

  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // Dog message
  let msg = '';
  if (data.currentStreak >= 7) {
    msg = "*excited pant* You're on FIRE! Keep that streak going!";
  } else if (data.currentStreak >= 3) {
    msg = "*happy wag* Nice streak! Let's keep it up!";
  } else if (data.commitsThisWeek > data.commitsLastWeek) {
    msg = "*tail wag* You're doing better than last week!";
  } else {
    msg = "*encouraging look* Every commit counts!";
  }
  lines.push(colors.frame('│') + colors.happy(`  💬 "${msg}"`) + ' '.repeat(Math.max(0, width - 8 - msg.length)) + colors.frame('│'));

  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));
  lines.push(colors.frame('│') + colors.textDim('  Press any key to go back...') + ' '.repeat(width - 33) + colors.frame('│'));
  lines.push(colors.frame(`\u2570${'─'.repeat(width - 2)}\u256f`));

  return lines.join('\n');
}

/**
 * Builds a compact streak display for the main screen.
 */
export function buildStreakDisplay(): string[] {
  const streak = getCurrentStreak();
  const todayCommits = getTodayCommits();

  const lines: string[] = [];

  if (streak > 0) {
    lines.push(colors.text(`🔥 ${streak}-day streak! Today: ${todayCommits} commits`));
  } else {
    lines.push(colors.textDim(`❄️ No streak. Make a commit to start one!`));
  }

  return lines;
}
