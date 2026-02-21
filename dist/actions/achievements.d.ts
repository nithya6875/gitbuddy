/**
 * =============================================================================
 * ACHIEVEMENTS.TS - Achievement System
 * =============================================================================
 *
 * Track and celebrate milestone achievements!
 */
import type { PetState } from '../state/persistence.js';
export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    xpReward: number;
}
export interface RepoData {
    totalCommits: number;
    streak: number;
    commitsToday: number;
    dirtyFiles: number;
    consoleLogs: number;
    hasCommitBefore10Today: boolean;
    hadBigCommitToday: boolean;
    isWeekend: boolean;
    hour: number;
}
export declare const ACHIEVEMENTS: Achievement[];
/**
 * Checks all achievements and returns newly unlocked ones.
 */
export declare function checkAchievements(state: PetState, repoData: RepoData): Achievement[];
/**
 * Gets achievement by ID.
 */
export declare function getAchievement(id: string): Achievement | undefined;
/**
 * Gets all unlocked achievements.
 */
export declare function getUnlockedAchievements(state: PetState): Achievement[];
/**
 * Gets progress toward achievements.
 */
export declare function getAchievementProgress(state: PetState, repoData: RepoData): {
    unlocked: number;
    total: number;
};
/**
 * Builds the achievement unlocked popup.
 */
export declare function buildAchievementUnlockedScreen(achievement: Achievement): string;
/**
 * Builds the achievements list screen.
 */
export declare function buildAchievementsScreen(state: PetState): string;
//# sourceMappingURL=achievements.d.ts.map