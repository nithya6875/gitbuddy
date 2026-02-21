/**
 * =============================================================================
 * SCORING.TS - Health and Mood Calculation System
 * =============================================================================
 *
 * This file handles the core game mechanics for GitBuddy:
 * - Converting repository health data into HP (health points)
 * - Determining pet mood based on HP and activity
 * - Calculating XP gains from various actions
 * - Managing level progression
 *
 * The scoring system creates the connection between Git repo health and
 * the pet's wellbeing - good coding habits lead to a happy, healthy pet!
 *
 * Mood States:
 * - Excited (90-100 HP): Bouncing, stars, maximum joy
 * - Happy (70-89 HP): Wagging tail, content
 * - Neutral (50-69 HP): Calm, nothing special
 * - Sad (25-49 HP): Droopy, needs attention
 * - Sick (0-24 HP): Very unwell, needs help
 * - Sleeping: After 60 seconds of inactivity
 */

import type { RepoHealth } from './scanner.js';  // Repository health data structure
import type { Mood } from '../pet/sprites.js';   // Pet mood type

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================
/**
 * Represents the complete mood state of the pet.
 * Combines the mood type with HP value and a display message.
 */
export interface MoodState {
  mood: Mood;     // The mood type (happy, sad, etc.)
  hp: number;     // Current health points (0-100)
  message: string; // Message to display (dialog from pet)
}

// =============================================================================
// MOOD CALCULATION
// =============================================================================
/**
 * Determines the pet's mood based on HP and user activity.
 * Mood is primarily driven by HP, but extended idleness triggers sleep.
 *
 * Mood thresholds:
 * - Sleeping: If idle for 60+ seconds (overrides HP-based mood)
 * - Excited: HP >= 90 (excellent repo health)
 * - Happy: HP >= 70 (good repo health)
 * - Neutral: HP >= 50 (average repo health)
 * - Sad: HP >= 25 (poor repo health)
 * - Sick: HP < 25 (very poor repo health)
 *
 * @param hp - Current health points (0-100)
 * @param isIdle - Whether the user has been inactive
 * @param idleSeconds - Number of seconds since last user activity
 * @returns The appropriate mood for the current state
 *
 * @example
 * calculateMood(85, false, 0)    // Returns 'happy'
 * calculateMood(95, false, 0)    // Returns 'excited'
 * calculateMood(30, false, 0)    // Returns 'sad'
 * calculateMood(50, true, 120)   // Returns 'sleeping' (idle for 2 mins)
 */
export function calculateMood(hp: number, isIdle: boolean, idleSeconds: number): Mood {
  // Sleep check takes priority over HP-based mood
  // If user hasn't interacted for 60+ seconds, pet falls asleep
  if (isIdle && idleSeconds >= 60) {
    return 'sleeping';
  }

  // Map HP ranges to mood states
  // Check from highest threshold down
  if (hp >= 90) {
    return 'excited';   // Excellent health = bouncing with joy
  } else if (hp >= 70) {
    return 'happy';     // Good health = content and wagging
  } else if (hp >= 50) {
    return 'neutral';   // Average health = calm
  } else if (hp >= 25) {
    return 'sad';       // Poor health = needs attention
  } else {
    return 'sick';      // Critical health = very unwell
  }
}

// =============================================================================
// HP CALCULATION
// =============================================================================
/**
 * Extracts the HP value from repository health data.
 * The totalScore from the health scan becomes the pet's HP.
 *
 * HP is clamped between 0 and 100 to ensure valid range.
 *
 * @param health - Repository health data from scanner
 * @returns HP value between 0 and 100
 *
 * @example
 * const health = await scanRepo();
 * const hp = calculateHP(health); // e.g., 75
 */
export function calculateHP(health: RepoHealth): number {
  // Clamp the score between 0 and 100
  // Math.max(0, ...) ensures we don't go below 0
  // Math.min(100, ...) ensures we don't exceed 100
  return Math.max(0, Math.min(100, health.totalScore));
}

// =============================================================================
// XP CALCULATION
// =============================================================================
/**
 * Calculates XP gain for different in-game actions.
 * Each action has a base XP value that can be multiplied by a value parameter.
 *
 * Action XP values:
 * - scan: 2 XP (scanning repository health)
 * - feed: 5 XP (per code issue found)
 * - play: 3 XP (playing with pet)
 * - stats: 1 XP (viewing statistics)
 * - commit: 10 XP (per commit - future feature)
 * - streak: 5 XP (per day of commit streak)
 * - cleanTree: 10 XP (bonus for clean working tree)
 * - hasTests: 15 XP (bonus for having test files)
 *
 * @param action - Name of the action being performed
 * @param value - Optional multiplier (e.g., number of issues found)
 * @returns Total XP to award for this action
 *
 * @example
 * calculateXPGain('scan')        // Returns 2 XP
 * calculateXPGain('feed', 5)     // Returns 25 XP (5 base * 5 issues)
 * calculateXPGain('streak', 7)   // Returns 35 XP (5 base * 7 days)
 */
export function calculateXPGain(action: string, value?: number): number {
  // XP lookup table for each action type
  const xpTable: Record<string, number> = {
    scan: 2,           // XP for running a health scan
    feed: 5,           // XP per issue found during feed
    play: 3,           // XP for playing with pet
    stats: 1,          // XP for checking stats
    commit: 10,        // XP per commit (future feature)
    streak: 5,         // Bonus XP per day of streak
    cleanTree: 10,     // Bonus for clean working tree
    hasTests: 15,      // Bonus for having tests
  };

  // Get base XP for this action (0 if not found)
  const baseXP = xpTable[action] || 0;

  // If value provided, multiply; otherwise just return base
  return value !== undefined ? baseXP * value : baseXP;
}

// =============================================================================
// LEVEL CALCULATION
// =============================================================================
/**
 * Calculates the pet's level based on total XP.
 * Returns a value 1-5 representing the evolution stage.
 *
 * Level thresholds:
 * - Level 1: 0-99 XP (Puppy)
 * - Level 2: 100-299 XP (Young Dog) - Unlocks Play
 * - Level 3: 300-599 XP (Adult Dog) - Unlocks Stats
 * - Level 4: 600-999 XP (Cool Dog) - Gets sunglasses
 * - Level 5: 1000+ XP (Legendary Doge) - Crown & sparkles
 *
 * @param xp - Total experience points
 * @returns Level 1, 2, 3, 4, or 5
 *
 * @example
 * calculateLevel(50)   // Returns 1
 * calculateLevel(250)  // Returns 2
 * calculateLevel(1500) // Returns 5
 */
export function calculateLevel(xp: number): 1 | 2 | 3 | 4 | 5 {
  // Check from highest threshold down
  if (xp >= 1000) return 5;  // Legendary Doge
  if (xp >= 600) return 4;   // Cool Dog
  if (xp >= 300) return 3;   // Adult Dog
  if (xp >= 100) return 2;   // Young Dog
  return 1;                   // Puppy
}

/**
 * Gets the XP required to reach the next level from current level.
 * Used to calculate progress bars and remaining XP needed.
 *
 * @param currentLevel - The pet's current level (1-5)
 * @returns XP needed to reach next level (Infinity if at max level)
 *
 * @example
 * getXPForNextLevel(1) // Returns 100 (need 100 XP for level 2)
 * getXPForNextLevel(4) // Returns 1000 (need 1000 XP for level 5)
 * getXPForNextLevel(5) // Returns Infinity (max level)
 */
export function getXPForNextLevel(currentLevel: number): number {
  // XP thresholds for each level (index 0 = level 2, etc.)
  const thresholds = [100, 300, 600, 1000, Infinity];

  // Array index is (level - 1), so level 1 returns thresholds[0] = 100
  return thresholds[currentLevel - 1] || Infinity;
}

// =============================================================================
// LEVEL PROGRESS CALCULATION
// =============================================================================
/**
 * Calculates detailed XP progress within the current level.
 * Returns current XP in level, XP needed for level, and percentage complete.
 *
 * This is used to render the XP progress bar accurately.
 *
 * @param xp - Total experience points
 * @returns Object with current, max, and percentage values
 *
 * @example
 * getLevelProgress(150)
 * // Returns: { current: 50, max: 200, percentage: 25 }
 * // At level 2 (100-299 XP range):
 * // - current: 150 - 100 = 50 XP into this level
 * // - max: 300 - 100 = 200 XP span for this level
 * // - percentage: (50/200) * 100 = 25%
 */
export function getLevelProgress(xp: number): { current: number; max: number; percentage: number } {
  // Determine current level
  const level = calculateLevel(xp);

  // XP thresholds where each level starts
  // Level 1 starts at 0, level 2 at 100, etc.
  const levelThresholds = [0, 100, 300, 600, 1000];

  // Get the XP threshold where current level starts
  // Array is 0-indexed, so level 1 = index 0
  const currentLevelStart = levelThresholds[level - 1];

  // Get the XP threshold where next level starts
  // If at max level (5), use current XP + 1 to show "full" bar
  const nextLevelStart = levelThresholds[level] || xp + 1;

  // Calculate XP earned within this level
  const current = xp - currentLevelStart;

  // Calculate total XP span of this level
  const max = nextLevelStart - currentLevelStart;

  // Calculate percentage complete (capped at 100%)
  const percentage = Math.min(100, (current / max) * 100);

  return { current, max, percentage };
}

// =============================================================================
// LEVEL UP DETECTION
// =============================================================================
/**
 * Checks if gaining XP resulted in a level up.
 * Compares level at old XP vs new XP to detect level changes.
 *
 * @param oldXP - XP before gaining experience
 * @param newXP - XP after gaining experience
 * @returns true if a level up occurred
 *
 * @example
 * checkLevelUp(95, 105)   // Returns true (level 1 → 2)
 * checkLevelUp(150, 200)  // Returns false (still level 2)
 * checkLevelUp(590, 610)  // Returns true (level 3 → 4)
 */
export function checkLevelUp(oldXP: number, newXP: number): boolean {
  // Compare levels before and after
  return calculateLevel(oldXP) < calculateLevel(newXP);
}
