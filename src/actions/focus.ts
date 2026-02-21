/**
 * =============================================================================
 * FOCUS.TS - Pomodoro Timer / Focus Mode
 * =============================================================================
 *
 * A productivity timer that tracks commits and changes during focus sessions.
 */

import { execSync } from 'child_process';
import chalk from 'chalk';
import { colors, progressBar } from '../ui/colors.js';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface FocusSession {
  duration: number;          // in minutes
  startTime: Date;
  startSnapshot: RepoSnapshot;
  isPaused: boolean;
  pausedAt?: Date;
  totalPausedTime: number;   // in ms
}

interface RepoSnapshot {
  uncommittedFiles: number;
  lastCommitHash: string;
  totalCommits: number;
}

export interface FocusResult {
  duration: number;          // actual minutes
  commits: number;
  filesChanged: number;
  linesAdded: number;
  linesRemoved: number;
}

// =============================================================================
// REPO SNAPSHOT
// =============================================================================

/**
 * Takes a snapshot of the current repo state.
 */
export function takeRepoSnapshot(): RepoSnapshot {
  let uncommittedFiles = 0;
  let lastCommitHash = '';
  let totalCommits = 0;

  try {
    const status = execSync('git status --porcelain', { encoding: 'utf-8', timeout: 5000 });
    uncommittedFiles = status.trim().split('\n').filter(Boolean).length;
  } catch { }

  try {
    lastCommitHash = execSync('git rev-parse HEAD', { encoding: 'utf-8', timeout: 5000 }).trim();
  } catch { }

  try {
    const log = execSync('git rev-list --count HEAD', { encoding: 'utf-8', timeout: 5000 });
    totalCommits = parseInt(log.trim()) || 0;
  } catch { }

  return { uncommittedFiles, lastCommitHash, totalCommits };
}

/**
 * Compares two snapshots to get session stats.
 */
export function compareSnapshots(start: RepoSnapshot, end: RepoSnapshot): FocusResult {
  const commits = end.totalCommits - start.totalCommits;

  let filesChanged = 0;
  let linesAdded = 0;
  let linesRemoved = 0;

  // Get diff stats since start commit
  if (start.lastCommitHash && commits > 0) {
    try {
      const diffStat = execSync(`git diff --stat ${start.lastCommitHash}..HEAD`, {
        encoding: 'utf-8',
        timeout: 5000,
      });
      const lines = diffStat.split('\n');
      for (const line of lines) {
        const match = line.match(/(\d+) insertions?\(\+\)/);
        const delMatch = line.match(/(\d+) deletions?\(-\)/);
        if (match) linesAdded += parseInt(match[1]);
        if (delMatch) linesRemoved += parseInt(delMatch[1]);
      }
      filesChanged = lines.filter(l => l.includes('|')).length;
    } catch { }
  }

  return {
    duration: 0, // Will be set by caller
    commits,
    filesChanged,
    linesAdded,
    linesRemoved,
  };
}

// =============================================================================
// FOCUS SESSION
// =============================================================================

let currentSession: FocusSession | null = null;

/**
 * Starts a new focus session.
 */
export function startFocusSession(durationMinutes: number): FocusSession {
  currentSession = {
    duration: durationMinutes,
    startTime: new Date(),
    startSnapshot: takeRepoSnapshot(),
    isPaused: false,
    totalPausedTime: 0,
  };
  return currentSession;
}

/**
 * Gets the current focus session.
 */
export function getCurrentSession(): FocusSession | null {
  return currentSession;
}

/**
 * Pauses the current session.
 */
export function pauseSession(): void {
  if (currentSession && !currentSession.isPaused) {
    currentSession.isPaused = true;
    currentSession.pausedAt = new Date();
  }
}

/**
 * Resumes the current session.
 */
export function resumeSession(): void {
  if (currentSession && currentSession.isPaused && currentSession.pausedAt) {
    currentSession.totalPausedTime += Date.now() - currentSession.pausedAt.getTime();
    currentSession.isPaused = false;
    currentSession.pausedAt = undefined;
  }
}

/**
 * Ends the current session and returns results.
 */
export function endFocusSession(): FocusResult | null {
  if (!currentSession) return null;

  const endSnapshot = takeRepoSnapshot();
  const result = compareSnapshots(currentSession.startSnapshot, endSnapshot);

  // Calculate actual duration
  let elapsed = Date.now() - currentSession.startTime.getTime();
  if (currentSession.isPaused && currentSession.pausedAt) {
    elapsed -= (Date.now() - currentSession.pausedAt.getTime());
  }
  elapsed -= currentSession.totalPausedTime;
  result.duration = Math.floor(elapsed / 60000); // Convert to minutes

  currentSession = null;
  return result;
}

/**
 * Gets remaining time in the current session.
 */
export function getRemainingTime(): { minutes: number; seconds: number; elapsed: number; total: number } {
  if (!currentSession) return { minutes: 0, seconds: 0, elapsed: 0, total: 0 };

  let elapsed = Date.now() - currentSession.startTime.getTime();

  // Account for paused time
  if (currentSession.isPaused && currentSession.pausedAt) {
    elapsed -= (Date.now() - currentSession.pausedAt.getTime());
  }
  elapsed -= currentSession.totalPausedTime;

  const totalMs = currentSession.duration * 60 * 1000;
  const remainingMs = Math.max(0, totalMs - elapsed);

  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);

  return {
    minutes,
    seconds,
    elapsed: Math.floor(elapsed / 1000),
    total: currentSession.duration * 60,
  };
}

/**
 * Checks if the session is complete.
 */
export function isSessionComplete(): boolean {
  const { minutes, seconds } = getRemainingTime();
  return minutes === 0 && seconds === 0;
}

// =============================================================================
// FOCUS MESSAGES
// =============================================================================

const FOCUS_MESSAGES = [
  "*quiet panting* You've been focused. Great start!",
  "*settles down* You're in the zone.",
  "*soft tail wag* Keep it up!",
  "*perks ears* You're doing great!",
  "*focused stare* I believe in you!",
  "*gentle nod* Stay focused, friend.",
  "*watches proudly* You're amazing!",
];

/**
 * Gets a focus message based on elapsed time.
 */
export function getFocusMessage(elapsedMinutes: number): string {
  const index = Math.floor(elapsedMinutes / 5) % FOCUS_MESSAGES.length;
  return FOCUS_MESSAGES[index];
}

// =============================================================================
// UI BUILDERS
// =============================================================================

/**
 * Builds the duration selection screen.
 */
export function buildDurationSelectScreen(): string {
  const width = 50;
  const lines: string[] = [];

  lines.push(colors.frame(`╭${'─'.repeat(width - 2)}╮`));
  lines.push(colors.frame('│') + chalk.bold.yellow('  🍅 Focus Mode') + ' '.repeat(width - 18) + colors.frame('│'));
  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // Calm puppy
  const puppy = [
    '         ∧＿∧    ',
    '        (◕ᴥ◕)   ',
    '       ╭─∪─∪─╮  ',
    '       │ ▒▒▒ │  ',
    '       ╰─────╯  ',
    '        ││ ││   ',
  ];

  for (const line of puppy) {
    const padding = Math.floor((width - 2 - line.length) / 2);
    lines.push(colors.frame('│') + ' '.repeat(padding) + colors.dogBody(line) + ' '.repeat(width - 2 - padding - line.length) + colors.frame('│'));
  }

  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));
  lines.push(colors.frame('│') + '  Choose focus duration:' + ' '.repeat(width - 27) + colors.frame('│'));
  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));
  lines.push(colors.frame('│') + `  ${chalk.bold('[1]')} 15 minutes` + ' '.repeat(width - 19) + colors.frame('│'));
  lines.push(colors.frame('│') + `  ${chalk.bold('[2]')} 25 minutes (recommended)` + ' '.repeat(width - 33) + colors.frame('│'));
  lines.push(colors.frame('│') + `  ${chalk.bold('[3]')} 45 minutes` + ' '.repeat(width - 19) + colors.frame('│'));
  lines.push(colors.frame('│') + `  ${chalk.bold('[4]')} 60 minutes` + ' '.repeat(width - 19) + colors.frame('│'));
  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));
  lines.push(colors.frame('│') + colors.textDim('  Press 1-4 or [B] to go back') + ' '.repeat(width - 33) + colors.frame('│'));
  lines.push(colors.frame(`╰${'─'.repeat(width - 2)}╯`));

  return lines.join('\n');
}

/**
 * Builds the focus mode screen.
 */
export function buildFocusScreen(session: FocusSession): string {
  const width = 55;
  const lines: string[] = [];
  const time = getRemainingTime();
  const percent = Math.floor((time.elapsed / time.total) * 100);

  lines.push(colors.frame(`╭${'─'.repeat(width - 2)}╮`));
  lines.push(colors.frame('│') + chalk.bold.yellow('  🍅 Focus Mode') + ' '.repeat(width - 18) + colors.frame('│'));
  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // Timer display
  const timeStr = `${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`;
  const timerLine = session.isPaused ? `⏸️  PAUSED — ${timeStr} remaining` : `🍅 ${timeStr} remaining`;
  const timerPadding = Math.floor((width - 2 - timerLine.length) / 2);
  lines.push(colors.frame('│') + ' '.repeat(timerPadding) + chalk.bold(timerLine) + ' '.repeat(width - 2 - timerPadding - timerLine.length) + colors.frame('│'));

  // Progress bar
  const bar = progressBar(percent, 100, 30, 'xp');
  const barLine = `${bar}  ${percent}%`;
  const barPadding = Math.floor((width - 2 - 36) / 2);
  lines.push(colors.frame('│') + ' '.repeat(barPadding) + barLine + ' '.repeat(width - 2 - barPadding - 36) + colors.frame('│'));

  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // Focused puppy
  const puppy = session.isPaused ? [
    '         ∧＿∧    ',
    '        (─ᴥ─)   ',
    '       ╭─∪─∪─╮  ',
    '       │ ░░░ │  ',
    '       ╰─────╯  ',
    '        ││ ││   ',
  ] : [
    '         ∧＿∧    ',
    '        (◕ᴥ◕)   ',
    '       ╭─∪─∪─╮  ',
    '       │ ▒▒▒ │  ',
    '       ╰─────╯  ',
    '        ││ ││   ',
  ];

  for (const line of puppy) {
    const padding = Math.floor((width - 2 - line.length) / 2);
    lines.push(colors.frame('│') + ' '.repeat(padding) + colors.dogBody(line) + ' '.repeat(width - 2 - padding - line.length) + colors.frame('│'));
  }

  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // Live stats
  const currentSnapshot = takeRepoSnapshot();
  const commits = currentSnapshot.totalCommits - session.startSnapshot.totalCommits;
  lines.push(colors.frame('│') + '  Session stats:' + ' '.repeat(width - 19) + colors.frame('│'));
  lines.push(colors.frame('│') + `    Commits: ${commits}` + ' '.repeat(width - 17 - String(commits).length) + colors.frame('│'));

  const elapsedMin = Math.floor(time.elapsed / 60);
  lines.push(colors.frame('│') + `    Time focused: ${elapsedMin}m ${time.elapsed % 60}s` + ' '.repeat(width - 26 - String(elapsedMin).length - String(time.elapsed % 60).length) + colors.frame('│'));

  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // Dog message
  const msg = getFocusMessage(elapsedMin);
  lines.push(colors.frame('│') + colors.happy(`  💬 "${msg}"`) + ' '.repeat(Math.max(0, width - 8 - msg.length)) + colors.frame('│'));

  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));
  const controls = session.isPaused
    ? `  ${chalk.bold('[Space]')} Resume  ${chalk.bold('[X]')} End  ${chalk.bold('[B]')} Back`
    : `  ${chalk.bold('[Space]')} Pause  ${chalk.bold('[X]')} End early`;
  lines.push(colors.frame('│') + controls + ' '.repeat(Math.max(0, width - 2 - controls.length + 20)) + colors.frame('│'));
  lines.push(colors.frame(`╰${'─'.repeat(width - 2)}╯`));

  return lines.join('\n');
}

/**
 * Builds the focus complete screen.
 */
export function buildFocusCompleteScreen(result: FocusResult, xpEarned: number): string {
  const width = 55;
  const lines: string[] = [];

  lines.push(colors.frame(`╭${'─'.repeat(width - 2)}╮`));
  lines.push(colors.frame('│') + chalk.bold.green('  🎉 Focus Session Complete!') + ' '.repeat(width - 31) + colors.frame('│'));
  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // Excited puppy
  const puppy = [
    '    ★    ∧＿∧  ★ ',
    '   ♥    (ᵔᴥᵔ)   ',
    '       ╭─∪─∪─╮  ',
    '       │ ▒▒▒ │∼ ',
    '       ╰─────╯  ',
    '       ╱╲ ╱╲    ',
  ];

  for (const line of puppy) {
    const padding = Math.floor((width - 2 - line.length) / 2);
    lines.push(colors.frame('│') + ' '.repeat(padding) + colors.dogBody(line) + ' '.repeat(width - 2 - padding - line.length) + colors.frame('│'));
  }

  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // Stats
  lines.push(colors.frame('│') + `  ⏱️  Duration: ${result.duration} minutes` + ' '.repeat(width - 26 - String(result.duration).length) + colors.frame('│'));
  lines.push(colors.frame('│') + `  📝 Commits made: ${result.commits}` + ' '.repeat(width - 24 - String(result.commits).length) + colors.frame('│'));
  lines.push(colors.frame('│') + `  📁 Files changed: ${result.filesChanged}` + ' '.repeat(width - 25 - String(result.filesChanged).length) + colors.frame('│'));
  lines.push(colors.frame('│') + `  ➕ Lines added: ${result.linesAdded}` + ' '.repeat(width - 23 - String(result.linesAdded).length) + colors.frame('│'));
  lines.push(colors.frame('│') + `  ➖ Lines removed: ${result.linesRemoved}` + ' '.repeat(width - 25 - String(result.linesRemoved).length) + colors.frame('│'));

  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // XP and message
  const msg = result.commits > 0
    ? `*excited bark* ${result.commits} commits! You're a coding machine!`
    : `*happy pant* Great focus session!`;
  lines.push(colors.frame('│') + colors.happy(`  💬 "${msg}"`) + ' '.repeat(Math.max(0, width - 8 - msg.length)) + colors.frame('│'));
  lines.push(colors.frame('│') + colors.xpFilled(`  +${xpEarned} XP earned!`) + ' '.repeat(width - 20 - String(xpEarned).length) + colors.frame('│'));

  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));
  lines.push(colors.frame('│') + colors.textDim('  Press any key to continue...') + ' '.repeat(width - 34) + colors.frame('│'));
  lines.push(colors.frame(`╰${'─'.repeat(width - 2)}╯`));

  return lines.join('\n');
}
