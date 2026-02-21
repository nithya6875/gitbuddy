/**
 * =============================================================================
 * HEATMAP.TS - Combined Stats & Progress Screen
 * =============================================================================
 *
 * Displays comprehensive git and pet statistics.
 */
import type { PetState } from '../state/persistence.js';
/**
 * Gets the current commit streak (simplified).
 */
export declare function getCurrentStreak(): number;
/**
 * Gets today's commit count.
 */
export declare function getTodayCommits(): number;
/**
 * Builds the combined stats screen with git stats, pet progress, and more.
 */
export declare function buildHeatmapScreen(state: PetState): string;
//# sourceMappingURL=heatmap.d.ts.map