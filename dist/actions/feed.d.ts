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
/**
 * FeedResult Interface
 *
 * Contains the results of a feed action, including all found issues
 * and the XP earned from the scan.
 */
export interface FeedResult {
    issues: FeedIssue[];
    xpGained: number;
}
/**
 * FeedIssue Interface
 *
 * Represents a single code issue found during scanning.
 * Each issue has a type, location, and content preview.
 */
export interface FeedIssue {
    type: 'todo' | 'console' | 'fixme';
    file: string;
    line: number;
    content: string;
}
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
export declare function findCodeIssues(): Promise<FeedResult>;
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
export declare function buildFeedScreen(result: FeedResult): string;
//# sourceMappingURL=feed.d.ts.map