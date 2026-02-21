/**
 * =============================================================================
 * DIALOGUE.TS - Pet Speech and Messages System
 * =============================================================================
 *
 * This file contains all the dialogue and messages that the pet can say.
 * Messages are organized by mood and context, with random selection for variety.
 *
 * The pet's personality shines through these messages - it's playful, encouraging,
 * and reacts emotionally to the repository's health state.
 *
 * Key Features:
 * - Mood-based message pools (happy, sad, excited, etc.)
 * - Context-specific messages (welcome back, level up, etc.)
 * - Random selection for variety
 * - Placeholder support for dynamic values
 * - Repository fun facts for Play mode
 */
import type { Mood } from './sprites.js';
/**
 * Messages for specific situations/events in the game.
 * These are more targeted than mood-based messages.
 */
export declare const contextMessages: {
    welcomeBack: {
        long: string[];
        short: string[];
    };
    commitStreak: {
        good: string[];
        bad: string[];
    };
    cleanTree: {
        clean: string[];
        dirty: string[];
    };
    levelUp: string[];
    firstMeeting: string[];
    goodbye: string[];
    noGitRepo: string[];
};
/**
 * Gets a random message for the given mood.
 * Used for general pet dialogue during normal operation.
 *
 * @param mood - The pet's current mood
 * @returns A randomly selected message string
 *
 * @example
 * getMessage('happy')
 * // Returns something like "*tail wag* I love how clean this repo is!"
 */
export declare function getMessage(mood: Mood): string;
/**
 * Gets a random context-specific message with optional placeholder replacement.
 * Used for situation-specific dialogue (welcome back, level up, etc.)
 *
 * @param context - The context key (e.g., 'welcomeBack', 'levelUp')
 * @param subContext - Optional sub-context for nested message groups
 * @param replacements - Optional key-value pairs for placeholder substitution
 * @returns A randomly selected message with placeholders replaced
 *
 * @example
 * getContextMessage('welcomeBack', 'long')
 * // Returns "Welcome back! I missed you so much!"
 *
 * @example
 * getContextMessage('commitStreak', 'good', { count: 12 })
 * // Returns "*tail wag* 12 commits this week - you're crushing it!"
 */
export declare function getContextMessage(context: keyof typeof contextMessages, subContext?: string, replacements?: Record<string, string | number>): string;
/**
 * Template strings for repository fun facts.
 * These are shown during the Play action to share interesting repo statistics.
 * Placeholders in {braces} are replaced with actual values.
 */
export declare const repoFunFacts: string[];
/**
 * Generates a fun fact about the repository from available statistics.
 * Selects a random fact from those that have data available.
 *
 * @param data - Object containing repository statistics
 * @returns A fun fact string with real data filled in
 *
 * @example
 * getRepoFunFact({ days: 100, commits: 500, topExt: '.ts', count: 50 })
 * // Might return "You've made 500 commits in total. That's a lot of code!"
 */
export declare function getRepoFunFact(data: {
    days?: number;
    commits?: number;
    day?: string;
    avgLength?: number;
    topExt?: string;
    count?: number;
}): string;
//# sourceMappingURL=dialogue.d.ts.map