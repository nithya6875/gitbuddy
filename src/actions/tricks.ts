/**
 * =============================================================================
 * TRICKS.TS - Smart Dog Tricks (Enhanced Play)
 * =============================================================================
 *
 * Instead of just playing fetch, the dog performs useful git operations!
 * Each trick executes a real command and displays the results.
 */

import { execSync } from 'child_process';
import chalk from 'chalk';
import { colors } from '../ui/colors.js';
import type { PetState } from '../state/persistence.js';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface Trick {
  id: string;
  name: string;
  command: string;
  description: string;
  icon: string;
  animation: string[];  // ASCII art for the trick
  successMsg: string;
  unlockLevel: number;  // Minimum level required
}

export interface TrickResult {
  trick: Trick;
  output: string;
  success: boolean;
}

// =============================================================================
// TRICK DEFINITIONS
// =============================================================================

export const TRICKS: Trick[] = [
  {
    id: 'fetch',
    name: 'Fetch',
    command: 'git fetch --all',
    description: 'Fetch updates from remote',
    icon: '🎾',
    unlockLevel: 1,
    animation: [
      '   🎾        ',
      '      ∧＿∧   ',
      '     (◕ᴥ◕)→🎾',
      '    ╭─∪─∪─╮  ',
      '    │ ▒▒▒ │  ',
      '    ╰─────╯  ',
    ],
    successMsg: '*runs back with remote updates*',
  },
  {
    id: 'status',
    name: 'Sniff',
    command: 'git status --short',
    description: 'Show repository status',
    icon: '👃',
    unlockLevel: 1,
    animation: [
      '     ∧＿∧    ',
      '    (◕ᴥ◕)∿∿ ',
      '   ╭─∪─∪─╮  ',
      '   │ ▒▒▒ │  ',
      '   ╰─────╯👃',
      '    ││ ││   ',
    ],
    successMsg: '*sniff sniff* I smell the repo status!',
  },
  {
    id: 'branch',
    name: 'Roll Over',
    command: 'git branch -a',
    description: 'List all branches',
    icon: '🔀',
    unlockLevel: 2,
    animation: [
      '    ╭─────╮  ',
      '    │ ▒▒▒ │  ',
      '   ╭─∪─∪─╮  ',
      '    (◕ᴥ◕)   ',
      '     ∧＿∧    ',
      '    ╱╲ ╱╲   ',
    ],
    successMsg: '*rolls over* Here are all your branches!',
  },
  {
    id: 'stash',
    name: 'Bury Bone',
    command: 'git stash list',
    description: 'Show stashed changes',
    icon: '🦴',
    unlockLevel: 2,
    animation: [
      '     ∧＿∧🦴  ',
      '    (◕ᴥ◕)   ',
      '   ╭─∪─∪─╮  ',
      '   │ ▒▒▒ │  ',
      '   ╰─────╯  ',
      '   🕳️ 🦴    ',
    ],
    successMsg: '*digs up stashes* Found your buried changes!',
  },
  {
    id: 'log',
    name: 'Sit & Show',
    command: 'git log --oneline -10',
    description: 'Show recent commits',
    icon: '📜',
    unlockLevel: 2,
    animation: [
      '     ∧＿∧    ',
      '    (◕ᴥ◕) 📜',
      '   ╭─∪─∪─╮  ',
      '   │ ▒▒▒ │  ',
      '   ╰─────╯  ',
      '    ╱  ╲    ',
    ],
    successMsg: '*sits proudly* Here is your commit history!',
  },
  {
    id: 'diff',
    name: 'Point',
    command: 'git diff --stat',
    description: 'Show uncommitted changes',
    icon: '👆',
    unlockLevel: 3,
    animation: [
      '           👆',
      '     ∧＿∧ ╱  ',
      '    (◕ᴥ◕)   ',
      '   ╭─∪─∪─╮  ',
      '   │ ▒▒▒ │  ',
      '   ╰─────╯  ',
    ],
    successMsg: '*points* Look at those changes!',
  },
  {
    id: 'remote',
    name: 'Howl',
    command: 'git remote -v',
    description: 'Show remote repositories',
    icon: '🐺',
    unlockLevel: 3,
    animation: [
      '   ♪ ♫ ♪   ',
      '     ∧＿∧   ',
      '    (◕ᴥ◕)  ',
      '   ╭─∪─∪─╮🐺',
      '   │ ▒▒▒ │  ',
      '   ╰─────╯  ',
    ],
    successMsg: '*AWOOOO* Calling out to remotes!',
  },
  {
    id: 'contributors',
    name: 'Pack Call',
    command: 'git shortlog -sn --no-merges | head -5',
    description: 'Show top contributors',
    icon: '👥',
    unlockLevel: 4,
    animation: [
      '  🐕 🐕 🐕  ',
      '     ∧＿∧   ',
      '    (ᵔᴥᵔ)   ',
      '   ╭─∪─∪─╮  ',
      '   │ ▒▒▒ │  ',
      '   ╰─────╯  ',
    ],
    successMsg: '*gathers the pack* Here are your contributors!',
  },
  {
    id: 'blame_self',
    name: 'Play Dead',
    command: 'git log --author="$(git config user.name)" --oneline -5',
    description: 'Show your recent commits',
    icon: '💀',
    unlockLevel: 4,
    animation: [
      '           ',
      '   ╰─────╯ ',
      '   │ ▒▒▒ │ ',
      '  ╭─∪─∪─╮  ',
      '   (✖ᴥ✖)   ',
      '    ∧＿∧   ',
    ],
    successMsg: '*plays dead* ...but here are YOUR commits!',
  },
  {
    id: 'prune',
    name: 'Shake',
    command: 'git remote prune origin --dry-run',
    description: 'Show stale remote branches',
    icon: '🤝',
    unlockLevel: 5,
    animation: [
      '     ╱╲    ',
      '     ∧＿∧  ',
      '    (◕ᴥ◕)╱ ',
      '   ╭─∪─∪╮🤝',
      '   │ ▒▒▒ │ ',
      '   ╰─────╯ ',
    ],
    successMsg: '*shakes paw* Found stale branches to prune!',
  },
];

// =============================================================================
// TRICK EXECUTION
// =============================================================================

/**
 * Gets available tricks for the pet's level.
 */
export function getAvailableTricks(level: number): Trick[] {
  return TRICKS.filter(t => t.unlockLevel <= level);
}

/**
 * Gets a random available trick.
 */
export function getRandomTrick(level: number): Trick {
  const available = getAvailableTricks(level);
  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Executes a trick and returns the result.
 */
export function executeTrick(trick: Trick): TrickResult {
  let output = '';
  let success = true;

  try {
    output = execSync(trick.command, {
      encoding: 'utf-8',
      timeout: 10000,
      maxBuffer: 1024 * 1024,
    }).trim();

    if (!output) {
      output = '(No output)';
    }
  } catch (error: any) {
    success = false;
    output = error.message || 'Command failed';
  }

  return { trick, output, success };
}

// =============================================================================
// UI BUILDERS
// =============================================================================

/**
 * Builds the trick selection screen.
 */
export function buildTrickSelectScreen(state: PetState): string {
  const width = 55;
  const lines: string[] = [];
  const available = getAvailableTricks(state.level);

  lines.push(colors.frame(`\u256d${'─'.repeat(width - 2)}\u256e`));
  lines.push(colors.frame('│') + chalk.bold.yellow('  🎪 Smart Dog Tricks') + ' '.repeat(width - 24) + colors.frame('│'));
  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // Show available tricks
  lines.push(colors.frame('│') + '  Choose a trick:' + ' '.repeat(width - 20) + colors.frame('│'));
  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  for (let i = 0; i < available.length && i < 6; i++) {
    const trick = available[i];
    const keyNum = i + 1;
    const line = `  ${chalk.bold(`[${keyNum}]`)} ${trick.icon} ${trick.name.padEnd(15)} - ${trick.description}`;
    lines.push(colors.frame('│') + line + ' '.repeat(Math.max(0, width - 2 - line.length + 20)) + colors.frame('│'));
  }

  // Show locked tricks
  const locked = TRICKS.filter(t => t.unlockLevel > state.level);
  if (locked.length > 0) {
    lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));
    lines.push(colors.frame('│') + colors.textDim('  Locked tricks:') + ' '.repeat(width - 19) + colors.frame('│'));
    for (const trick of locked.slice(0, 3)) {
      const line = `     🔒 ${trick.name} (Level ${trick.unlockLevel})`;
      lines.push(colors.frame('│') + colors.textDim(line) + ' '.repeat(Math.max(0, width - 2 - line.length)) + colors.frame('│'));
    }
  }

  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // Random trick option
  lines.push(colors.frame('│') + `  ${chalk.bold('[R]')} 🎲 Random trick` + ' '.repeat(width - 23) + colors.frame('│'));
  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));
  lines.push(colors.frame('│') + colors.textDim('  Press 1-6, R for random, or B to go back') + ' '.repeat(width - 46) + colors.frame('│'));
  lines.push(colors.frame(`\u2570${'─'.repeat(width - 2)}\u256f`));

  return lines.join('\n');
}

/**
 * Builds the trick result screen.
 */
export function buildTrickResultScreen(result: TrickResult, xpEarned: number): string {
  const width = 60;
  const lines: string[] = [];
  const { trick, output, success } = result;

  lines.push(colors.frame(`\u256d${'─'.repeat(width - 2)}\u256e`));
  lines.push(colors.frame('│') + chalk.bold.yellow(`  ${trick.icon} ${trick.name}!`) + ' '.repeat(width - 6 - trick.name.length) + colors.frame('│'));
  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // Trick animation
  for (const animLine of trick.animation) {
    const padding = Math.floor((width - 2 - animLine.length) / 2);
    lines.push(colors.frame('│') + ' '.repeat(padding) + colors.dogBody(animLine) + ' '.repeat(width - 2 - padding - animLine.length) + colors.frame('│'));
  }

  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // Command and output
  lines.push(colors.frame('│') + colors.textDim(`  $ ${trick.command}`) + ' '.repeat(Math.max(0, width - 6 - trick.command.length)) + colors.frame('│'));
  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // Output (limit to 8 lines)
  const outputLines = output.split('\n').slice(0, 8);
  for (const outLine of outputLines) {
    const truncated = outLine.length > width - 6 ? outLine.slice(0, width - 9) + '...' : outLine;
    const colorFn = success ? colors.text : colors.danger;
    lines.push(colors.frame('│') + colorFn(`  ${truncated}`) + ' '.repeat(Math.max(0, width - 4 - truncated.length)) + colors.frame('│'));
  }

  if (output.split('\n').length > 8) {
    lines.push(colors.frame('│') + colors.textDim('  ...') + ' '.repeat(width - 7) + colors.frame('│'));
  }

  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // Dog message and XP
  lines.push(colors.frame('│') + colors.happy(`  💬 "${trick.successMsg}"`) + ' '.repeat(Math.max(0, width - 8 - trick.successMsg.length)) + colors.frame('│'));
  lines.push(colors.frame('│') + colors.xpFilled(`  +${xpEarned} XP`) + ' '.repeat(width - 11 - String(xpEarned).length) + colors.frame('│'));

  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));
  lines.push(colors.frame('│') + colors.textDim('  Press any key to continue...') + ' '.repeat(width - 34) + colors.frame('│'));
  lines.push(colors.frame(`\u2570${'─'.repeat(width - 2)}\u256f`));

  return lines.join('\n');
}

/**
 * Builds the "no tricks available" screen (level too low).
 */
export function buildNoTricksScreen(): string {
  const width = 50;
  const lines: string[] = [];

  lines.push(colors.frame(`\u256d${'─'.repeat(width - 2)}\u256e`));
  lines.push(colors.frame('│') + chalk.bold.yellow('  🎪 Smart Dog Tricks') + ' '.repeat(width - 24) + colors.frame('│'));
  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // Confused puppy
  const puppy = [
    '         ∧＿∧  ? ',
    '        (◔ᴥ◔)   ',
    '       ╭─∪─∪─╮  ',
    '       │ ░░░ │  ',
    '       ╰─────╯  ',
    '        ││ ││   ',
  ];

  for (const line of puppy) {
    const padding = Math.floor((width - 2 - line.length) / 2);
    lines.push(colors.frame('│') + ' '.repeat(padding) + colors.dogBody(line) + ' '.repeat(width - 2 - padding - line.length) + colors.frame('│'));
  }

  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));
  lines.push(colors.frame('│') + colors.warning("  I'm still learning tricks!") + ' '.repeat(width - 31) + colors.frame('│'));
  lines.push(colors.frame('│') + colors.textDim('  Reach Level 2 to unlock tricks.') + ' '.repeat(width - 36) + colors.frame('│'));
  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));
  lines.push(colors.frame('│') + colors.textDim('  Press any key to go back...') + ' '.repeat(width - 33) + colors.frame('│'));
  lines.push(colors.frame(`\u2570${'─'.repeat(width - 2)}\u256f`));

  return lines.join('\n');
}
