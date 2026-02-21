"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.xpRewards = exports.xpToNextLevel = exports.levelThresholds = void 0;
exports.getLevel = getLevel;
exports.getXPProgress = getXPProgress;
exports.didLevelUp = didLevelUp;
exports.getLevelTitle = getLevelTitle;
exports.getLevelDescription = getLevelDescription;
// =============================================================================
// LEVEL THRESHOLD CONSTANTS
// =============================================================================
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
exports.levelThresholds = {
    1: 0, // Puppy starts at 0 XP
    2: 100, // Young Dog requires 100 XP
    3: 300, // Adult Dog requires 300 XP
    4: 600, // Cool Dog requires 600 XP
    5: 1000, // Legendary Doge requires 1000 XP
};
/**
 * Defines how much additional XP is needed to advance from each level.
 * This is the "width" of each level in terms of XP.
 *
 * Level 5 has Infinity because there's no level 6 to reach.
 */
exports.xpToNextLevel = {
    1: 100, // Need 100 XP to go from level 1 to 2 (0→100)
    2: 200, // Need 200 XP to go from level 2 to 3 (100→300)
    3: 300, // Need 300 XP to go from level 3 to 4 (300→600)
    4: 400, // Need 400 XP to go from level 4 to 5 (600→1000)
    5: Infinity, // Level 5 is max, no next level
};
// =============================================================================
// LEVEL CALCULATION FUNCTIONS
// =============================================================================
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
function getLevel(xp) {
    // Check from highest threshold down
    if (xp >= 1000)
        return 5; // Legendary Doge
    if (xp >= 600)
        return 4; // Cool Dog
    if (xp >= 300)
        return 3; // Adult Dog
    if (xp >= 100)
        return 2; // Young Dog
    return 1; // Puppy (default)
}
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
function getXPProgress(xp) {
    // Determine current level
    const level = getLevel(xp);
    // Get the XP threshold where this level starts
    const currentThreshold = exports.levelThresholds[level];
    // Get the XP threshold for the next level (cap at level 5)
    // Math.min ensures we don't try to access level 6
    const nextThreshold = exports.levelThresholds[(Math.min(level + 1, 5))];
    return {
        // XP earned within this level (total XP minus level start threshold)
        current: xp - currentThreshold,
        // Total XP span of this level (next threshold minus current threshold)
        needed: nextThreshold - currentThreshold,
    };
}
// =============================================================================
// XP REWARDS TABLE
// =============================================================================
/**
 * Defines XP rewards for various in-game actions.
 * These values can be adjusted to balance progression speed.
 */
exports.xpRewards = {
    // Basic actions
    scan: 2, // XP for scanning repository health
    feed: 5, // Base XP for using Feed action
    feedBonus: 2, // Additional XP per code issue found during feed
    play: 10, // XP for completing a play activity
    playTrick: 5, // XP for doing a trick
    statCheck: 1, // XP for viewing statistics
    // Bonuses
    commitStreak: 3, // XP per day of commit streak
    cleanRepo: 5, // Bonus XP for having a clean working tree
    firstVisitOfDay: 10, // Bonus XP for first visit each day
};
// =============================================================================
// LEVEL CHANGE DETECTION
// =============================================================================
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
function didLevelUp(oldXP, newXP) {
    // Compare levels at old and new XP values
    return getLevel(oldXP) < getLevel(newXP);
}
// =============================================================================
// LEVEL METADATA FUNCTIONS
// =============================================================================
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
function getLevelTitle(level) {
    const titles = {
        1: 'Puppy', // Small and adorable
        2: 'Young Dog', // Growing up
        3: 'Adult Dog', // Fully grown
        4: 'Cool Dog', // Has sunglasses 😎
        5: 'Legendary Doge', // Ultimate form with crown
    };
    return titles[level];
}
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
function getLevelDescription(level) {
    const descriptions = {
        1: 'A tiny adorable puppy just starting out!',
        2: 'Growing up! Unlocked: Play feature',
        3: 'A mature and capable companion. Unlocked: Stats',
        4: 'Too cool for school. Got the shades to prove it!',
        5: 'LEGENDARY! The ultimate coding companion!',
    };
    return descriptions[level];
}
//# sourceMappingURL=xp.js.map