/**
 * =============================================================================
 * PLAY.TS - Play Action Handler for GitBuddy
 * =============================================================================
 *
 * This file implements the "Play" action, available once the pet reaches
 * level 2. Playing with the pet is a fun interaction that rewards XP and,
 * for the "fetch" activity, reveals interesting repository statistics.
 *
 * Available play activities:
 * 1. Do a Trick - Pet does a backflip animation (+5 XP)
 * 2. Play Fetch - Pet fetches a ball and returns with a fun fact (+10 XP)
 * 3. Belly Rubs - Pet rolls over for belly rubs (+3 XP)
 *
 * Each activity has a 3-frame ASCII animation sequence that plays
 * when the action is performed. The animations add life and personality
 * to the pet interactions.
 *
 * Key Features:
 * - Three distinct play activities with unique animations
 * - Variable XP rewards based on activity complexity
 * - Fun repository facts during fetch (makes use of repo stats)
 * - Text wrapping for long fun facts
 */
/**
 * PlayAction Type
 *
 * Union type representing the three available play activities.
 * Used for type safety when selecting and processing play actions.
 */
export type PlayAction = 'trick' | 'fetch' | 'belly';
/**
 * Gets the animation frames for a specific play action.
 * Used by the main game loop to display animations.
 *
 * @param action - The play action ('trick', 'fetch', or 'belly')
 * @returns An array of frame arrays (each frame is an array of lines)
 */
export declare function getPlayFrames(action: PlayAction): string[][];
/**
 * Selects a random play action.
 * Could be used for automated play or random events.
 *
 * @returns A random PlayAction
 */
export declare function getRandomPlayAction(): PlayAction;
/**
 * Builds the play selection menu screen.
 * Shows available play activities with their XP rewards.
 * Displayed when user presses [P] from the main screen.
 *
 * @returns A complete bordered screen with play options
 */
export declare function buildPlayMenu(): string;
/**
 * Builds the play result screen after completing an activity.
 * Shows the final animation frame, XP earned, and for fetch,
 * displays a fun fact about the repository.
 *
 * @param action - The play action that was performed
 * @returns An object with the screen string and XP earned
 *
 * XP Rewards:
 * - Trick: 5 XP
 * - Fetch: 10 XP (higher because it includes educational content)
 * - Belly: 3 XP (quick, simple interaction)
 */
export declare function buildPlayResult(action: PlayAction): Promise<{
    screen: string;
    xp: number;
}>;
//# sourceMappingURL=play.d.ts.map