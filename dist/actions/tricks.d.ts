/**
 * =============================================================================
 * TRICKS.TS - Smart Dog Tricks (Enhanced Play)
 * =============================================================================
 *
 * Instead of just playing fetch, the dog performs useful git operations!
 * Each trick executes a real command and displays the results.
 */
import type { PetState } from '../state/persistence.js';
export interface Trick {
    id: string;
    name: string;
    command: string;
    description: string;
    icon: string;
    animation: string[];
    successMsg: string;
    unlockLevel: number;
}
export interface TrickResult {
    trick: Trick;
    output: string;
    success: boolean;
}
export declare const TRICKS: Trick[];
/**
 * Gets available tricks for the pet's level.
 */
export declare function getAvailableTricks(level: number): Trick[];
/**
 * Gets a random available trick.
 */
export declare function getRandomTrick(level: number): Trick;
/**
 * Executes a trick and returns the result.
 */
export declare function executeTrick(trick: Trick): TrickResult;
/**
 * Builds the trick selection screen.
 */
export declare function buildTrickSelectScreen(state: PetState): string;
/**
 * Builds the trick result screen.
 */
export declare function buildTrickResultScreen(result: TrickResult, xpEarned: number): string;
/**
 * Builds the "no tricks available" screen (level too low).
 */
export declare function buildNoTricksScreen(): string;
//# sourceMappingURL=tricks.d.ts.map