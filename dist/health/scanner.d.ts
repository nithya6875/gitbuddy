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
/**
 * Represents a single health check result.
 * Each check has a name, status, value, weight, and score.
 */
export interface HealthCheck {
    name: string;
    status: 'great' | 'ok' | 'warning' | 'bad';
    value: string;
    details?: string;
    weight: number;
    score: number;
}
/**
 * Complete repository health report.
 * Contains all health checks and summary statistics.
 */
export interface RepoHealth {
    isGitRepo: boolean;
    checks: HealthCheck[];
    totalScore: number;
    commitCount: number;
    lastCommitDate: Date | null;
    streak: number;
}
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
export declare function scanRepo(): Promise<RepoHealth>;
/**
 * Finds TODO and FIXME comments in the codebase.
 * Used by the Feed action to give the pet "food" (code issues to fix).
 *
 * Uses `git grep` for fast searching within tracked files.
 *
 * @returns Array of matching lines (max 10)
 */
export declare function findTodos(): Promise<string[]>;
/**
 * Finds console.log statements in JavaScript/TypeScript files.
 * These are often left behind during debugging and should be cleaned up.
 *
 * @returns Array of matching lines (max 10)
 */
export declare function findConsoleLogs(): Promise<string[]>;
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
export declare function getRepoStats(): Promise<{
    firstCommitDays: number;
    totalCommits: number;
    topExtension: {
        ext: string;
        count: number;
    };
    avgCommitMessageLength: number;
}>;
//# sourceMappingURL=scanner.d.ts.map