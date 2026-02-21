/**
 * =============================================================================
 * FEED.TS - Feed Action Handler for GitBuddy
 * =============================================================================
 *
 * This file implements the "Feed" action, one of the core game mechanics.
 * When the user presses [F], GitBuddy scans the codebase for common code
 * quality issues and presents them as "food" for the pet to eat.
 *
 * The feeding mechanic gamifies code maintenance by:
 * - Scanning for TODO/FIXME comments that need attention
 * - Finding leftover console.log statements that should be removed
 * - Rewarding the player with XP for each issue found
 *
 * This creates a fun loop where:
 * 1. User feeds the pet
 * 2. Pet "eats" code issues
 * 3. User gains XP and levels up
 * 4. User is reminded of technical debt to address
 *
 * Key Features:
 * - Async code scanning using grep patterns
 * - Issue categorization (TODO, FIXME, console.log)
 * - XP rewards based on issues found
 * - Clean display of found issues with icons
 */

import chalk from 'chalk'; // Terminal string styling library
import { colors } from '../ui/colors.js';
import { findTodos, findConsoleLogs } from '../health/scanner.js';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * FeedResult Interface
 *
 * Contains the results of a feed action, including all found issues
 * and the XP earned from the scan.
 */
export interface FeedResult {
  issues: FeedIssue[]; // Array of found code issues
  xpGained: number;    // Total XP earned from this feed
}

/**
 * FeedIssue Interface
 *
 * Represents a single code issue found during scanning.
 * Each issue has a type, location, and content preview.
 */
export interface FeedIssue {
  type: 'todo' | 'console' | 'fixme'; // Issue category
  file: string;                        // File path where issue was found
  line: number;                        // Line number in the file
  content: string;                     // Truncated content of the line
}

// =============================================================================
// CODE ISSUE SCANNER
// =============================================================================

/**
 * Scans the repository for code issues that the pet can "eat".
 * This is the main logic for the feed action.
 *
 * Scanned issues:
 * - TODO comments: Code that needs future work
 * - FIXME comments: Code that needs fixing (higher priority)
 * - console.log statements: Debug code that should be removed
 *
 * @returns A promise resolving to FeedResult with issues and XP
 *
 * XP Calculation:
 * - Base XP: 5 (just for trying)
 * - Per issue: 2 XP each
 * - Example: 4 issues = 5 + (4 * 2) = 13 XP
 */
export async function findCodeIssues(): Promise<FeedResult> {
  const issues: FeedIssue[] = [];

  // -------------------------------------------------------------------------
  // Find TODO and FIXME Comments
  // -------------------------------------------------------------------------
  // These are common markers developers use to track technical debt
  const todos = await findTodos();

  for (const todo of todos) {
    // Parse the grep output format: "filepath:lineNumber:content"
    const match = todo.match(/^([^:]+):(\d+):(.*)$/);

    if (match) {
      const content = match[3].trim();

      // Determine if it's a FIXME (more urgent) or regular TODO
      const type = content.toUpperCase().includes('FIXME') ? 'fixme' : 'todo';

      issues.push({
        type,
        file: match[1],                  // File path
        line: parseInt(match[2], 10),    // Line number
        content: content.slice(0, 60),   // Truncate to 60 chars for display
      });
    }
  }

  // -------------------------------------------------------------------------
  // Find console.log Statements
  // -------------------------------------------------------------------------
  // These often indicate debug code that shouldn't be in production
  const consoleLogs = await findConsoleLogs();

  for (const log of consoleLogs) {
    // Same parsing format as TODOs
    const match = log.match(/^([^:]+):(\d+):(.*)$/);

    if (match) {
      issues.push({
        type: 'console',
        file: match[1],
        line: parseInt(match[2], 10),
        content: match[3].trim().slice(0, 60),
      });
    }
  }

  // -------------------------------------------------------------------------
  // Limit and Calculate XP
  // -------------------------------------------------------------------------
  // Cap at 8 issues to keep the display manageable
  const limitedIssues = issues.slice(0, 8);

  return {
    issues: limitedIssues,
    // XP formula: 5 base + 2 per issue found
    xpGained: 5 + limitedIssues.length * 2,
  };
}

// =============================================================================
// FEED SCREEN BUILDER
// =============================================================================

/**
 * Builds the feed result screen displayed after scanning.
 * Shows found issues in a formatted list with icons and XP earned.
 *
 * @param result - The FeedResult from findCodeIssues()
 * @returns A complete bordered screen string
 *
 * Display format:
 * - Empty results: Shows celebratory "clean code" message
 * - Issues found: Lists up to 6 with icons, shows "+N more" if needed
 * - Always shows XP earned at the bottom
 */
export function buildFeedScreen(result: FeedResult): string {
  const width = 55; // Slightly wider to accommodate file paths
  const lines: string[] = [];

  // -------------------------------------------------------------------------
  // Header
  // -------------------------------------------------------------------------
  lines.push(colors.frame(`╭${'─'.repeat(width - 2)}╮`));
  lines.push(colors.frame('│') + chalk.bold.yellow('  🍖 Feed Time - Code Issues Found') + ' '.repeat(width - 37) + colors.frame('│'));
  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

  // -------------------------------------------------------------------------
  // Issues Display (or clean code message)
  // -------------------------------------------------------------------------
  if (result.issues.length === 0) {
    // No issues found - celebrate the clean codebase!
    lines.push(colors.frame('│') + colors.healthy('  ✨ No issues found! Your code is clean!') + ' '.repeat(width - 44) + colors.frame('│'));
    lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));
    lines.push(colors.frame('│') + `  ${colors.happy('*happy munch*')} Nothing to eat here!` + ' '.repeat(width - 42) + colors.frame('│'));
  } else {
    // Issues found - display them as "food" for the pet
    lines.push(colors.frame('│') + `  Found ${result.issues.length} issue(s) to munch on:` + ' '.repeat(width - 33 - String(result.issues.length).length) + colors.frame('│'));
    lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));

    // Display up to 6 issues with appropriate icons
    for (const issue of result.issues.slice(0, 6)) {
      // Select icon based on issue type
      // 📝 = TODO (note/memo)
      // 🔧 = FIXME (wrench for fixing)
      // 🖥️ = console.log (computer screen)
      const icon = issue.type === 'todo' ? '📝' : issue.type === 'fixme' ? '🔧' : '🖥️';

      // Format the type label and file location
      const typeLabel = issue.type.toUpperCase().padEnd(7);
      const file = `${issue.file}:${issue.line}`.slice(0, 25).padEnd(25);

      // Build the display line
      const line = `  ${icon} ${typeLabel} ${file}`;
      const lineLen = line.length + 2; // Rough estimate for padding

      lines.push(colors.frame('│') + line + ' '.repeat(Math.max(0, width - lineLen)) + colors.frame('│'));
    }

    // Show overflow indicator if more than 6 issues
    if (result.issues.length > 6) {
      lines.push(colors.frame('│') + colors.textDim(`  ... and ${result.issues.length - 6} more`) + ' '.repeat(width - 20 - String(result.issues.length - 6).length) + colors.frame('│'));
    }

    // Pet reaction message
    lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));
    lines.push(colors.frame('│') + `  ${colors.happy('*nom nom*')} Delicious code issues!` + ' '.repeat(width - 39) + colors.frame('│'));
  }

  // -------------------------------------------------------------------------
  // XP Earned Display
  // -------------------------------------------------------------------------
  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));
  lines.push(colors.frame('│') + colors.xpFilled(`  +${result.xpGained} XP earned!`) + ' '.repeat(width - 18 - String(result.xpGained).length) + colors.frame('│'));

  // -------------------------------------------------------------------------
  // Footer
  // -------------------------------------------------------------------------
  lines.push(colors.frame('│') + ' '.repeat(width - 2) + colors.frame('│'));
  lines.push(colors.frame('│') + colors.textDim('  Press any key to return...') + ' '.repeat(width - 32) + colors.frame('│'));
  lines.push(colors.frame(`╰${'─'.repeat(width - 2)}╯`));

  return lines.join('\n');
}
