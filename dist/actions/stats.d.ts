/**
 * =============================================================================
 * STATS.TS - Statistics Screen Builder for GitBuddy
 * =============================================================================
 *
 * This file implements the "Stats" action, available once the pet reaches
 * level 3. It displays comprehensive statistics about both the pet and
 * the repository, providing insights into the user's coding journey.
 *
 * Statistics displayed:
 *
 * Pet Info Section:
 * - Current level with title and star display
 * - XP accumulated
 * - HP (health points)
 * - Days together (since pet creation)
 *
 * Activity Section:
 * - Total number of feeds
 * - Total number of play sessions
 * - Longest commit streak achieved
 * - Total repository scans performed
 *
 * Repository Section:
 * - Overall health score (0-100)
 * - Total commit count
 * - Current commit streak
 * - Time since last commit
 *
 * Achievements Section:
 * - Unlocked achievements (up to 3 shown)
 * - Count of additional achievements
 *
 * Key Features:
 * - Clean, organized statistics layout
 * - Human-readable time formatting
 * - Achievement showcase
 * - Section-based organization
 */
import type { PetState } from '../state/persistence.js';
import type { RepoHealth } from '../health/scanner.js';
/**
 * StatsData Interface
 *
 * Contains all data needed to render the statistics screen.
 * Combines pet state with repository health information.
 */
export interface StatsData {
    state: PetState;
    health: RepoHealth;
}
/**
 * Builds the statistics screen displayed when user presses [S].
 * Organizes statistics into clear sections with icons and labels.
 *
 * @param data - StatsData containing pet state and repo health
 * @returns A complete bordered screen string
 *
 * Screen layout:
 * - Title with pet name
 * - Pet Info section (level, XP, HP, days together)
 * - Activity section (feeds, plays, streaks, scans)
 * - Repository section (health score, commits, streak, last commit)
 * - Achievements section (if any unlocked)
 */
export declare function buildStatsScreen(data: StatsData): string;
//# sourceMappingURL=stats.d.ts.map