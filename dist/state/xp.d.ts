/**
 * =============================================================================
 * XP.TS - Experience Points and Leveling System
 * =============================================================================
 *
 * This file defines the XP (experience points) and leveling system for GitBuddy.
 * The pet levels up as it gains XP from various activities, unlocking new
 * features and evolving its appearance at each level.
 *
 * Level Progression:
 * - Level 1 (Puppy):       0-99 XP    - Starting level, basic features
 * - Level 2 (Young Dog):   100-299 XP - Unlocks Play feature
 * - Level 3 (Adult Dog):   300-599 XP - Unlocks Stats, gets spots
 * - Level 4 (Cool Dog):    600-999 XP - Gets sunglasses!
 * - Level 5 (Legendary):   1000+ XP   - Crown and sparkles!
 *
 * Key Features:
 * - Level threshold definitions
 * - XP reward values for different actions
 * - Level calculation utilities
 * - Level name/description lookups
 */
import type { Level } from '../pet/sprites.js';
/**
 * Defines the minimum XP required to reach each level.
 * Used to calculate what level a pet should be at given their total XP.
 *
 * Level 1 starts at 0 XP (everyone starts here)
 * Level 2 requires 100 XP
 * Level 3 requires 300 XP
 * Level 4 requires 600 XP
 * Level 5 requires 1000 XP
 */
export declare const levelThresholds: Record<Level, number>;
/**
 * Defines how much additional XP is needed to advance from each level.
 * This is the "width" of each level in terms of XP.
 *
 * Level 5 has Infinity because there's no level 6 to reach.
 */
export declare const xpToNextLevel: Record<Level, number>;
/**
 * Calculates the current level based on total XP.
 * Checks thresholds from highest to lowest and returns the appropriate level.
 *
 * @param xp - Total experience points
 * @returns The level (1-5) corresponding to that XP amount
 *
 * @example
 * getLevel(50)   // Returns 1 (Puppy)
 * getLevel(150)  // Returns 2 (Young Dog)
 * getLevel(500)  // Returns 3 (Adult Dog)
 * getLevel(800)  // Returns 4 (Cool Dog)
 * getLevel(2000) // Returns 5 (Legendary Doge)
 */
export declare function getLevel(xp: number): Level;
/**
 * Calculates XP progress within the current level.
 * Returns how much XP has been earned in this level and how much is needed
 * to reach the next level.
 *
 * @param xp - Total experience points
 * @returns Object with current progress and total needed for next level
 *
 * @example
 * getXPProgress(150)
 * // Returns { current: 50, needed: 200 }
 * // At level 2 (starts at 100), 150-100=50 XP earned in this level
 * // Need 200 more XP to reach level 3 (at 300 total)
 */
export declare function getXPProgress(xp: number): {
    current: number;
    needed: number;
};
/**
 * Defines XP rewards for various in-game actions.
 * These values can be adjusted to balance progression speed.
 */
export declare const xpRewards: {
    scan: number;
    feed: number;
    feedBonus: number;
    play: number;
    playTrick: number;
    statCheck: number;
    commitStreak: number;
    cleanRepo: number;
    firstVisitOfDay: number;
};
/**
 * Checks if gaining XP resulted in a level up.
 * Compares the level at old XP vs new XP to detect changes.
 *
 * @param oldXP - XP before gaining experience
 * @param newXP - XP after gaining experience
 * @returns true if the pet leveled up, false otherwise
 *
 * @example
 * didLevelUp(90, 110)  // Returns true (level 1 → level 2)
 * didLevelUp(110, 120) // Returns false (still level 2)
 */
export declare function didLevelUp(oldXP: number, newXP: number): boolean;
/**
 * Returns the display name/title for a given level.
 * Used in UI to show the pet's current evolution stage.
 *
 * @param level - Level number (1-5)
 * @returns Human-readable level name
 *
 * @example
 * getLevelTitle(1) // Returns "Puppy"
 * getLevelTitle(4) // Returns "Cool Dog"
 */
export declare function getLevelTitle(level: Level): string;
/**
 * Returns a description of what each level represents and unlocks.
 * Used in UI to explain level benefits to the user.
 *
 * @param level - Level number (1-5)
 * @returns Description string for that level
 *
 * @example
 * getLevelDescription(2)
 * // Returns "Growing up! Unlocked: Play feature"
 */
export declare function getLevelDescription(level: Level): string;
//# sourceMappingURL=xp.d.ts.map