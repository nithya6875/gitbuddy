/**
 * =============================================================================
 * INTRO.TS - Introduction and Special Screen Builders for GitBuddy
 * =============================================================================
 *
 * This file handles all the special-purpose screens that appear outside of
 * the main gameplay loop. These include:
 *
 * - First-run intro animation sequence (kennel with emerging puppy)
 * - Pet naming prompt screen
 * - Welcome message after naming
 * - Goodbye/exit screen
 * - Error screen for non-git directories
 *
 * Each screen is built as a bordered box with centered ASCII art and
 * appropriate messages, maintaining visual consistency with the main UI.
 *
 * Key Features:
 * - Multi-frame intro animation (3 stages)
 * - Personalized screens using the pet's name
 * - Helpful error messaging for common issues
 * - Consistent box-drawing style throughout
 */
/**
 * ASCII art frames for the intro animation sequence.
 * These frames are displayed in order to create an animated
 * "puppy emerging from kennel" effect.
 *
 * Frame 0: Kennel with question marks (something is stirring)
 * Frame 1: Eyes appear in the kennel opening
 * Frame 2: Puppy emerges with stars and celebration text
 */
/**
 * Kennel frames for the intro animation (puppy emerging).
 * Exported so they can be used for startup animation.
 */
export declare const kennelFrames: string[][];
/**
 * Kennel frames for the exit animation (puppy going back in).
 * These are essentially the reverse of the intro frames.
 */
export declare const kennelExitFrames: string[][];
/**
 * Builds a single frame of the intro animation sequence.
 * Used to display the "puppy emerging from kennel" animation
 * during startup.
 *
 * @param frame - Frame number (0, 1, 2, or 3)
 * @returns A complete bordered screen with the animation frame
 *
 * Animation sequence:
 * - Frame 0: "Something is stirring..." message
 * - Frame 1: "*wiggle wiggle*" message
 * - Frame 2: Puppy half out
 * - Frame 3: Puppy emerged (no additional message needed)
 */
export declare function buildIntroFrame(frame: number): string;
/**
 * Builds a single frame of the exit animation sequence.
 * Used to display the "puppy going back into kennel" animation
 * when the user exits.
 *
 * @param frame - Frame number (0, 1, 2, or 3)
 * @returns A complete bordered screen with the animation frame
 */
export declare function buildExitFrame(frame: number): string;
/**
 * Returns the number of kennel intro frames.
 */
export declare function getKennelFrameCount(): number;
/**
 * Returns the number of kennel exit frames.
 */
export declare function getKennelExitFrameCount(): number;
/**
 * Builds the pet naming prompt screen.
 * Displayed after the intro animation to ask the user for their pet's name.
 * Features a friendly puppy sprite looking expectantly at the user.
 *
 * @returns A complete bordered screen with naming prompt
 */
export declare function buildNamePrompt(): string;
/**
 * Builds the welcome message screen displayed after naming the pet.
 * Shows an excited puppy with stars and hearts, introducing itself
 * to the user with its new name.
 *
 * @param name - The name the user gave to their pet
 * @returns A complete bordered screen with welcome message
 */
export declare function buildWelcomeMessage(name: string): string;
/**
 * Builds the goodbye screen displayed when the user quits.
 * Shows the pet waving goodbye with a friendly farewell message.
 * This screen provides a nice ending to each session.
 *
 * @param name - The pet's name for personalized goodbye
 * @returns A complete bordered screen with goodbye message
 */
export declare function buildGoodbyeScreen(name: string): string;
/**
 * Builds the error screen displayed when GitBuddy is run outside a git repo.
 * Shows a confused puppy with helpful instructions on how to fix the issue.
 * This provides a friendly error experience rather than a cryptic message.
 *
 * @returns A complete bordered screen with error message and help
 */
/**
 * Builds the reset confirmation screen.
 * Asks user to confirm they want to reset the game.
 */
export declare function buildResetScreen(): string;
export declare function buildNoGitScreen(): string;
//# sourceMappingURL=intro.d.ts.map