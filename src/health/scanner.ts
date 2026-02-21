/**
 * =============================================================================
 * SCANNER.TS - Git Repository Health Analysis System
 * =============================================================================
 *
 * This file is the heart of GitBuddy's repository health monitoring.
 * It scans the current Git repository and evaluates various health metrics
 * that determine the pet's HP (health points).
 *
 * Health Metrics (with weights):
 * 1. Commit Frequency (30%) - How often you commit (weekly)
 * 2. Commit Streak (15%) - Consecutive days with commits
 * 3. Working Tree (20%) - Clean vs. uncommitted changes
 * 4. Test Files (15%) - Presence of test files
 * 5. README (5%) - Documentation exists
 * 6. Recent Activity (15%) - Time since last commit
 *
 * The weighted average of these metrics becomes the pet's HP (0-100).
 *
 * Additional Features:
 * - TODO/FIXME detection for the Feed action
 * - console.log detection for code cleanup
 * - Repository statistics for fun facts
 */

import { exec } from 'child_process';   // Node.js module for executing shell commands
import { promisify } from 'util';        // Utility to convert callbacks to promises
import * as fs from 'fs';                // File system for checking file existence
import * as path from 'path';            // Path utilities for file extensions

// Convert exec to return a Promise instead of using callbacks
// This allows us to use async/await syntax
const execAsync = promisify(exec);

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================
/**
 * Represents a single health check result.
 * Each check has a name, status, value, weight, and score.
 */
export interface HealthCheck {
  name: string;                                  // Display name (e.g., "Commits this week")
  status: 'great' | 'ok' | 'warning' | 'bad';   // Status category for coloring
  value: string;                                 // Human-readable value (e.g., "12 commits")
  details?: string;                              // Optional additional details
  weight: number;                                // Percentage weight in final score (0-100)
  score: number;                                 // Score for this check (0-100)
}

/**
 * Complete repository health report.
 * Contains all health checks and summary statistics.
 */
export interface RepoHealth {
  isGitRepo: boolean;          // Whether current directory is a Git repository
  checks: HealthCheck[];       // Array of all health check results
  totalScore: number;          // Weighted average score (becomes HP)
  commitCount: number;         // Total commits in repository
  lastCommitDate: Date | null; // Timestamp of most recent commit
  streak: number;              // Current consecutive commit day streak
}

// =============================================================================
// GIT REPOSITORY DETECTION
// =============================================================================
/**
 * Checks if the current directory is inside a Git repository.
 * Uses `git rev-parse --is-inside-work-tree` which returns "true" if in a repo.
 *
 * @returns true if in a Git repo, false otherwise
 */
async function isGitRepo(): Promise<boolean> {
  try {
    // This command succeeds (returns "true") only inside a git work tree
    await execAsync('git rev-parse --is-inside-work-tree');
    return true;
  } catch {
    // Command fails if not in a git repository
    return false;
  }
}

// =============================================================================
// COMMIT FREQUENCY ANALYSIS
// =============================================================================
/**
 * Gets the number of commits made in the last 7 days.
 * Also returns unique dates for streak calculation.
 *
 * @returns Object with commit count and array of unique dates
 *
 * @example
 * const { count, dates } = await getWeeklyCommits();
 * // count: 12
 * // dates: ['2024-01-15', '2024-01-14', '2024-01-13']
 */
async function getWeeklyCommits(): Promise<{ count: number; dates: string[] }> {
  try {
    // git log options:
    // --oneline: compact output (one line per commit)
    // --since="7 days ago": only commits from last week
    // --format="%H %ad": output hash and author date
    // --date=short: use YYYY-MM-DD format for dates
    const { stdout } = await execAsync('git log --oneline --since="7 days ago" --format="%H %ad" --date=short');

    // Split output into lines and filter out empty strings
    const lines = stdout.trim().split('\n').filter(Boolean);

    // Extract dates from each line (format: "hash YYYY-MM-DD")
    // and remove duplicates using Set
    const dates = lines.map((line) => line.split(' ')[1]).filter(Boolean);

    return { count: lines.length, dates: [...new Set(dates)] };
  } catch {
    // If git command fails, return empty results
    return { count: 0, dates: [] };
  }
}

// =============================================================================
// COMMIT STREAK CALCULATION
// =============================================================================
/**
 * Calculates the current commit streak (consecutive days with commits).
 * A streak is broken if there's a day without any commits.
 *
 * The algorithm:
 * 1. Get last 100 commit dates (sorted newest first)
 * 2. Remove duplicate dates (multiple commits same day count as 1)
 * 3. Check if each date is consecutive from today backwards
 * 4. Stop counting when a gap is found
 *
 * @returns Number of consecutive days with commits
 */
async function getCommitStreak(): Promise<number> {
  try {
    // Get dates of last 100 commits in short format
    const { stdout } = await execAsync('git log --format="%ad" --date=short -100');

    // Get unique dates (remove duplicates) - newest first
    const dates = [...new Set(stdout.trim().split('\n').filter(Boolean))];

    // No commits = no streak
    if (dates.length === 0) return 0;

    let streak = 0;

    // Get today's date at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check each date for consecutive pattern
    for (let i = 0; i < dates.length; i++) {
      // Parse the commit date
      const commitDate = new Date(dates[i]);
      commitDate.setHours(0, 0, 0, 0);

      // Calculate what date we expect (today minus i days)
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);

      // Calculate difference in days between expected and actual
      const diffDays = Math.floor((expectedDate.getTime() - commitDate.getTime()) / (1000 * 60 * 60 * 24));

      // If the commit is on the expected day (or yesterday for first iteration)
      // diffDays === 0 means exact match
      // i === 0 && diffDays === 1 allows streak to continue if last commit was yesterday
      if (diffDays === 0 || (i === 0 && diffDays === 1)) {
        streak++;
      } else {
        // Gap found - streak is broken
        break;
      }
    }

    return streak;
  } catch {
    return 0;
  }
}

// =============================================================================
// WORKING TREE STATUS
// =============================================================================
/**
 * Checks the Git working tree status (uncommitted changes).
 * Uses `git status --porcelain` for machine-readable output.
 *
 * @returns Object with clean status and count of changed files
 *
 * @example
 * const status = await getWorkingTreeStatus();
 * // { clean: false, changedFiles: 3 }
 */
async function getWorkingTreeStatus(): Promise<{ clean: boolean; changedFiles: number }> {
  try {
    // --porcelain gives stable, parseable output
    // Each changed file appears on its own line
    const { stdout } = await execAsync('git status --porcelain');

    // Split and count non-empty lines
    const lines = stdout.trim().split('\n').filter(Boolean);

    return {
      clean: lines.length === 0,  // Clean if no changed files
      changedFiles: lines.length,  // Count of files with changes
    };
  } catch {
    // On error, assume clean (don't penalize user)
    return { clean: true, changedFiles: 0 };
  }
}

// =============================================================================
// TEST FILE DETECTION
// =============================================================================
/**
 * Checks if the repository contains test files.
 * Looks for common test file patterns and directories.
 *
 * Detected patterns:
 * - *.test.* (e.g., app.test.ts)
 * - *.spec.* (e.g., app.spec.js)
 * - __tests__/ directory
 * - test/ or tests/ directories with js/ts/py/rb files
 *
 * @returns Object with found status and count of test files
 */
async function hasTestFiles(): Promise<{ found: boolean; count: number }> {
  try {
    // Patterns we look for (defined but used in logic below)
    const patterns = [
      '**/*.test.*',
      '**/*.spec.*',
      '**/__tests__/**',
      '**/test/**/*.js',
      '**/test/**/*.ts',
      '**/tests/**/*.js',
      '**/tests/**/*.ts',
    ];

    let totalCount = 0;

    // Get list of all tracked files from Git (faster than filesystem scan)
    const { stdout } = await execAsync('git ls-files');
    const files = stdout.trim().split('\n');

    // Check each file against test patterns
    for (const file of files) {
      if (
        file.includes('.test.') ||           // Jest/Mocha style: app.test.ts
        file.includes('.spec.') ||           // Angular style: app.spec.ts
        file.includes('__tests__') ||        // Jest directory convention
        /\/tests?\/.*\.(js|ts|jsx|tsx|py|rb)$/.test(file)  // test/tests directories
      ) {
        totalCount++;
      }
    }

    return { found: totalCount > 0, count: totalCount };
  } catch {
    return { found: false, count: 0 };
  }
}

// =============================================================================
// README DETECTION
// =============================================================================
/**
 * Checks if the repository has a README file.
 * Looks for common README filename variations.
 *
 * @returns true if any README file exists
 */
async function hasReadme(): Promise<boolean> {
  try {
    // Common README filename variations
    const files = ['README.md', 'README.txt', 'README', 'readme.md', 'Readme.md'];

    // Check each possible filename
    for (const file of files) {
      if (fs.existsSync(file)) return true;
    }
    return false;
  } catch {
    return false;
  }
}

// =============================================================================
// LAST COMMIT TIME
// =============================================================================
/**
 * Gets the timestamp of the most recent commit.
 * Uses `git log -1` to get only the latest commit.
 *
 * @returns Date object of last commit, or null if no commits
 */
async function getLastCommitTime(): Promise<Date | null> {
  try {
    // --format=%ci gives ISO-ish format: "2024-01-15 10:30:00 -0800"
    const { stdout } = await execAsync('git log -1 --format=%ci');
    return new Date(stdout.trim());
  } catch {
    return null;
  }
}

// =============================================================================
// TOTAL COMMIT COUNT
// =============================================================================
/**
 * Gets the total number of commits in the repository history.
 *
 * @returns Total commit count
 */
async function getTotalCommits(): Promise<number> {
  try {
    // rev-list lists all commits, --count just returns the count
    const { stdout } = await execAsync('git rev-list --count HEAD');
    return parseInt(stdout.trim(), 10);
  } catch {
    return 0;
  }
}

// =============================================================================
// MAIN SCAN FUNCTION
// =============================================================================
/**
 * Performs a complete repository health scan.
 * This is the main function that evaluates all health metrics.
 *
 * Health Check Weights:
 * - Commit Frequency: 30% (encourages regular commits)
 * - Commit Streak: 15% (rewards consistency)
 * - Working Tree: 20% (encourages clean state)
 * - Test Files: 15% (encourages testing)
 * - README: 5% (encourages documentation)
 * - Recent Activity: 15% (rewards active development)
 *
 * @returns Complete RepoHealth object with all checks and scores
 */
export async function scanRepo(): Promise<RepoHealth> {
  const checks: HealthCheck[] = [];

  // -------------------------------------------------------------------------
  // STEP 0: Verify we're in a Git repository
  // -------------------------------------------------------------------------
  const gitRepo = await isGitRepo();
  if (!gitRepo) {
    // Return empty health report for non-Git directories
    return {
      isGitRepo: false,
      checks: [],
      totalScore: 0,
      commitCount: 0,
      lastCommitDate: null,
      streak: 0,
    };
  }

  // -------------------------------------------------------------------------
  // CHECK 1: Commit Frequency (30% weight)
  // Measures how actively the user is committing code
  // -------------------------------------------------------------------------
  const { count: weeklyCommits } = await getWeeklyCommits();
  let commitScore = 0;
  let commitStatus: HealthCheck['status'] = 'bad';

  // Score based on weekly commit count
  if (weeklyCommits >= 10) {
    // 10+ commits/week = excellent
    commitScore = 100;
    commitStatus = 'great';
  } else if (weeklyCommits >= 5) {
    // 5-9 commits/week = good
    commitScore = 75;
    commitStatus = 'ok';
  } else if (weeklyCommits >= 1) {
    // 1-4 commits/week = needs improvement
    commitScore = 40;
    commitStatus = 'warning';
  } else {
    // 0 commits = concerning
    commitScore = 0;
    commitStatus = 'bad';
  }

  checks.push({
    name: 'Commits this week',
    status: commitStatus,
    value: `${weeklyCommits} commits`,
    weight: 30,
    score: commitScore,
  });

  // -------------------------------------------------------------------------
  // CHECK 2: Commit Streak (15% weight)
  // Measures consecutive days of coding activity
  // -------------------------------------------------------------------------
  const streak = await getCommitStreak();
  let streakScore = 0;
  let streakStatus: HealthCheck['status'] = 'bad';

  // Score based on streak length
  if (streak >= 7) {
    // Week-long streak = excellent
    streakScore = 100;
    streakStatus = 'great';
  } else if (streak >= 3) {
    // 3-6 day streak = good
    streakScore = 70;
    streakStatus = 'ok';
  } else if (streak >= 1) {
    // 1-2 day streak = okay
    streakScore = 40;
    streakStatus = 'warning';
  } else {
    // No streak
    streakScore = 0;
    streakStatus = 'bad';
  }

  checks.push({
    name: 'Commit streak',
    status: streakStatus,
    value: `${streak} days`,
    weight: 15,
    score: streakScore,
  });

  // -------------------------------------------------------------------------
  // CHECK 3: Working Tree (20% weight)
  // Encourages keeping the repository in a clean state
  // -------------------------------------------------------------------------
  const { clean, changedFiles } = await getWorkingTreeStatus();
  let treeScore = 0;
  let treeStatus: HealthCheck['status'] = 'bad';

  // Score based on uncommitted changes
  if (clean) {
    // Completely clean = excellent
    treeScore = 100;
    treeStatus = 'great';
  } else if (changedFiles < 5) {
    // Few changes = acceptable
    treeScore = 60;
    treeStatus = 'ok';
  } else if (changedFiles < 10) {
    // Several changes = needs attention
    treeScore = 30;
    treeStatus = 'warning';
  } else {
    // Many uncommitted changes = problematic
    treeScore = 0;
    treeStatus = 'bad';
  }

  checks.push({
    name: 'Working tree',
    status: treeStatus,
    value: clean ? 'clean' : `${changedFiles} changed files`,
    weight: 20,
    score: treeScore,
  });

  // -------------------------------------------------------------------------
  // CHECK 4: Test Files (15% weight)
  // Encourages having tests in the project
  // -------------------------------------------------------------------------
  const tests = await hasTestFiles();

  // Binary scoring: either you have tests or you don't
  const testScore = tests.found ? 100 : 20;  // 20 instead of 0 to not be too harsh
  const testStatus: HealthCheck['status'] = tests.found ? 'great' : 'warning';

  checks.push({
    name: 'Tests',
    status: testStatus,
    value: tests.found ? `${tests.count} test files` : 'no tests found',
    weight: 15,
    score: testScore,
  });

  // -------------------------------------------------------------------------
  // CHECK 5: README (5% weight)
  // Encourages documentation
  // -------------------------------------------------------------------------
  const readme = await hasReadme();

  // Binary scoring with lighter penalty
  const readmeScore = readme ? 100 : 30;  // 30 instead of 0 to not be too harsh
  const readmeStatus: HealthCheck['status'] = readme ? 'great' : 'warning';

  checks.push({
    name: 'README',
    status: readmeStatus,
    value: readme ? 'present' : 'missing',
    weight: 5,
    score: readmeScore,
  });

  // -------------------------------------------------------------------------
  // CHECK 6: Recent Activity (15% weight)
  // Measures how recently the repo was updated
  // -------------------------------------------------------------------------
  const lastCommit = await getLastCommitTime();
  let activityScore = 0;
  let activityStatus: HealthCheck['status'] = 'bad';
  let activityValue = 'no commits';

  if (lastCommit) {
    // Calculate hours since last commit
    const hoursSinceCommit = (Date.now() - lastCommit.getTime()) / (1000 * 60 * 60);

    if (hoursSinceCommit < 24) {
      // Committed today = excellent
      activityScore = 100;
      activityStatus = 'great';
      activityValue = 'today';
    } else if (hoursSinceCommit < 72) {
      // Committed in last 3 days = good
      activityScore = 70;
      activityStatus = 'ok';
      activityValue = `${Math.floor(hoursSinceCommit / 24)} days ago`;
    } else if (hoursSinceCommit < 168) {
      // Committed in last week = needs attention
      activityScore = 40;
      activityStatus = 'warning';
      activityValue = `${Math.floor(hoursSinceCommit / 24)} days ago`;
    } else {
      // Over a week ago = stale
      activityScore = 10;
      activityStatus = 'bad';
      activityValue = `${Math.floor(hoursSinceCommit / 24)} days ago`;
    }
  }

  checks.push({
    name: 'Last activity',
    status: activityStatus,
    value: activityValue,
    weight: 15,
    score: activityScore,
  });

  // -------------------------------------------------------------------------
  // CALCULATE TOTAL SCORE
  // Weighted average of all check scores
  // -------------------------------------------------------------------------
  const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0);
  const totalScore = Math.round(
    checks.reduce((sum, c) => sum + (c.score * c.weight) / totalWeight, 0)
  );

  // Get additional repo stats
  const commitCount = await getTotalCommits();

  // Return complete health report
  return {
    isGitRepo: true,
    checks,
    totalScore,
    commitCount,
    lastCommitDate: lastCommit,
    streak,
  };
}

// =============================================================================
// CODE ISSUE DETECTION - For Feed Action
// =============================================================================
/**
 * Finds TODO and FIXME comments in the codebase.
 * Used by the Feed action to give the pet "food" (code issues to fix).
 *
 * Uses `git grep` for fast searching within tracked files.
 *
 * @returns Array of matching lines (max 10)
 */
export async function findTodos(): Promise<string[]> {
  try {
    // git grep options:
    // -n: show line numbers
    // -E: extended regex
    // "TODO|FIXME": search for either keyword
    // -- "*.ts" etc: only search these file types
    const { stdout } = await execAsync('git grep -n -E "TODO|FIXME" -- "*.ts" "*.js" "*.tsx" "*.jsx" "*.py" "*.rb" "*.go"', {
      windowsHide: true,  // Don't show command window on Windows
    });

    // Split into lines and return first 10
    return stdout.trim().split('\n').filter(Boolean).slice(0, 10);
  } catch {
    // git grep returns non-zero exit code if no matches found
    // This is not an error, just means no TODOs
    return [];
  }
}

/**
 * Finds console.log statements in JavaScript/TypeScript files.
 * These are often left behind during debugging and should be cleaned up.
 *
 * @returns Array of matching lines (max 10)
 */
export async function findConsoleLogs(): Promise<string[]> {
  try {
    // Search for console.log in JS/TS files
    const { stdout } = await execAsync('git grep -n "console.log" -- "*.ts" "*.js" "*.tsx" "*.jsx"', {
      windowsHide: true,
    });
    return stdout.trim().split('\n').filter(Boolean).slice(0, 10);
  } catch {
    return [];
  }
}

// =============================================================================
// REPOSITORY STATISTICS - For Fun Facts
// =============================================================================
/**
 * Gathers interesting statistics about the repository.
 * Used to generate fun facts during Play mode.
 *
 * Statistics gathered:
 * - Days since first commit
 * - Total commit count
 * - Most common file extension
 * - Average commit message length
 *
 * @returns Object with various repository statistics
 */
export async function getRepoStats(): Promise<{
  firstCommitDays: number;
  totalCommits: number;
  topExtension: { ext: string; count: number };
  avgCommitMessageLength: number;
}> {
  const stats = {
    firstCommitDays: 0,
    totalCommits: 0,
    topExtension: { ext: 'unknown', count: 0 },
    avgCommitMessageLength: 0,
  };

  try {
    // -------------------------------------------------------------------------
    // First commit date (how old is this repo?)
    // -------------------------------------------------------------------------
    // --reverse shows oldest commit first, -1 gets just that one
    const { stdout: firstCommit } = await execAsync('git log --reverse --format=%ci -1');
    if (firstCommit.trim()) {
      const firstDate = new Date(firstCommit.trim());
      // Calculate days between first commit and now
      stats.firstCommitDays = Math.floor((Date.now() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    // -------------------------------------------------------------------------
    // Total commits
    // -------------------------------------------------------------------------
    stats.totalCommits = await getTotalCommits();

    // -------------------------------------------------------------------------
    // Most common file extension
    // -------------------------------------------------------------------------
    const { stdout: files } = await execAsync('git ls-files');
    const extensions: Record<string, number> = {};

    // Count occurrences of each file extension
    for (const file of files.trim().split('\n')) {
      const ext = path.extname(file);  // Get extension (e.g., ".ts")
      if (ext) {
        extensions[ext] = (extensions[ext] || 0) + 1;
      }
    }

    // Find the most common extension
    const topExt = Object.entries(extensions).sort((a, b) => b[1] - a[1])[0];
    if (topExt) {
      stats.topExtension = { ext: topExt[0], count: topExt[1] };
    }

    // -------------------------------------------------------------------------
    // Average commit message length
    // -------------------------------------------------------------------------
    // Get subject line of last 50 commits
    const { stdout: messages } = await execAsync('git log --format="%s" -50');
    const msgLines = messages.trim().split('\n').filter(Boolean);

    if (msgLines.length > 0) {
      // Calculate average length
      const totalLength = msgLines.reduce((sum, msg) => sum + msg.length, 0);
      stats.avgCommitMessageLength = Math.round(totalLength / msgLines.length);
    }
  } catch {
    // Ignore errors - return whatever stats we gathered
  }

  return stats;
}
