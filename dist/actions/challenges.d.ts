/**
 * =============================================================================
 * CHALLENGES.TS - Daily Challenge System
 * =============================================================================
 *
 * Each day, GitBuddy gives the user a random challenge to complete.
 * Challenges are shown on the main screen and grant XP when completed.
 */
import type { PetState } from '../state/persistence.js';
export interface Challenge {
    id: string;
    name: string;
    description: string;
    goal: number;
    xpReward: number;
    icon: string;
    tracker: (state: PetState, repoData: ChallengeRepoData) => number;
}
export interface ChallengeRepoData {
    commitsToday: number;
    streak: number;
    dirtyFiles: number;
    consoleLogs: number;
    todos: number;
}
export interface DailyChallengeState {
    date: string;
    challengeId: string;
    completed: boolean;
    progress: number;
}
export declare const CHALLENGES: Challenge[];
/**
 * Gets or generates today's daily challenge.
 */
export declare function getDailyChallenge(state: PetState): DailyChallengeState;
/**
 * Gets the challenge definition by ID.
 */
export declare function getChallenge(id: string): Challenge | undefined;
/**
 * Checks and updates challenge progress.
 */
export declare function checkChallengeProgress(state: PetState, repoData: ChallengeRepoData): {
    progress: number;
    completed: boolean;
    justCompleted: boolean;
};
/**
 * Builds the daily challenge display for the main screen.
 */
export declare function buildChallengeDisplay(state: PetState, repoData: ChallengeRepoData): string[];
/**
 * Builds the challenge complete popup.
 */
export declare function buildChallengeCompleteScreen(challenge: Challenge): string;
/**
 * Builds the challenges list screen (all challenges).
 */
export declare function buildAllChallengesScreen(state: PetState): string;
//# sourceMappingURL=challenges.d.ts.map