/**
 * =============================================================================
 * HEATMAP.TS - Git Stats Screen
 * =============================================================================
 *
 * Displays git statistics in a simple, Windows-compatible way.
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
 * Builds the stats screen.
 */
export declare function buildHeatmapScreen(state: PetState): string;
//# sourceMappingURL=heatmap.d.ts.map