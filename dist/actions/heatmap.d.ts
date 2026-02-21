/**
 * =============================================================================
 * HEATMAP.TS - Git Activity Heatmap & Streak Dashboard
 * =============================================================================
 *
 * Displays a GitHub-style contribution heatmap for the last 12 weeks
 * along with streak statistics and commit history.
 */
import type { PetState } from '../state/persistence.js';
export interface HeatmapData {
    weeks: number[][];
    totalCommits: number;
    currentStreak: number;
    longestStreak: number;
    averagePerDay: number;
    mostActiveDay: string;
    commitsThisWeek: number;
    commitsLastWeek: number;
}
/**
 * Gets commit counts for the last 84 days (12 weeks).
 */
export declare function getHeatmapData(): HeatmapData;
/**
 * Gets the current commit streak.
 */
export declare function getCurrentStreak(): number;
/**
 * Gets today's commit count.
 */
export declare function getTodayCommits(): number;
/**
 * Builds the full heatmap stats screen.
 */
export declare function buildHeatmapScreen(state: PetState): string;
/**
 * Builds a compact streak display for the main screen.
 */
export declare function buildStreakDisplay(): string[];
//# sourceMappingURL=heatmap.d.ts.map