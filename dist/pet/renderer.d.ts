/**
 * =============================================================================
 * RENDERER.TS - Animation and Display Engine
 * =============================================================================
 *
 * This file manages the rendering and animation loop for GitBuddy.
 * It handles:
 * - Continuous animation at 4 FPS (250ms per frame)
 * - Blinking animations (every 4 seconds, 150ms duration)
 * - Breathing animations (subtle up/down movement)
 * - Message rotation (changes every 8 seconds)
 * - Terminal resize handling
 *
 * The renderer uses log-update for smooth terminal updates without flickering.
 * It maintains its own animation state and calls back to get the current
 * pet state, then renders the appropriate frame.
 *
 * Key Features:
 * - Singleton pattern for global access
 * - Start/stop control for the render loop
 * - Custom content rendering for menus/screens
 * - Temporary message display with auto-reset
 */
import { type Mood, type Level } from './sprites.js';
import type { HealthCheck } from '../health/scanner.js';
/**
 * State data required to render a frame.
 * This interface defines what information the renderer needs
 * to display the pet and UI correctly.
 */
export interface RenderState {
    name: string;
    level: Level;
    hp: number;
    xp: number;
    xpMax: number;
    mood: Mood;
    healthChecks: HealthCheck[];
    customMessage?: string;
    isAnimating?: boolean;
}
/**
 * Main renderer class that manages the animation loop and display.
 *
 * The renderer works by:
 * 1. Accepting a callback function that returns current RenderState
 * 2. Running a setInterval loop at 4 FPS
 * 3. Each frame: updating animations, getting state, building layout, displaying
 *
 * Animation details:
 * - Frame counter increments each tick (used for tail wagging, bouncing)
 * - Blink timer triggers every 4 seconds for 150ms
 * - Message changes every 8 seconds unless custom message is set
 */
export declare class Renderer {
    /** Current animation frame number (increments each tick) */
    private frame;
    /** Timestamp of last blink start */
    private lastBlinkTime;
    /** Whether eyes are currently closed for blink */
    private isBlinking;
    /** How long a blink lasts in milliseconds */
    private blinkDuration;
    /** Time between blinks in milliseconds */
    private blinkInterval;
    /** Currently displayed dialogue message */
    private currentMessage;
    /** Timestamp when message was last changed */
    private messageChangeTime;
    /** How often to rotate messages in milliseconds */
    private messageInterval;
    /** Reference to the setInterval timer (for cleanup) */
    private intervalId;
    /** Callback function to get current state (set by start()) */
    private renderCallback;
    /** Current terminal width (updates on resize) */
    private terminalWidth;
    /** Animation controller for dynamic pet movements */
    private animationController;
    /** Whether to use dynamic animations */
    private useDynamicAnimations;
    /**
     * Creates a new Renderer instance.
     * Sets up terminal resize listener to adjust layout dynamically.
     */
    constructor();
    /**
     * Starts the animation render loop.
     * Begins rendering at 4 FPS (250ms interval).
     *
     * @param getState - Callback function that returns current RenderState
     *
     * @example
     * renderer.start(() => ({
     *   name: pet.name,
     *   level: pet.level,
     *   hp: pet.hp,
     *   // ... etc
     * }));
     */
    start(getState: () => RenderState): void;
    /**
     * Stops the animation render loop.
     * Clears the interval timer and stops rendering.
     *
     * Call this when:
     * - Switching to a different screen (help, stats, etc.)
     * - Handling input that pauses animation
     * - Cleaning up before exit
     */
    stop(): void;
    /**
     * Updates animation state (blinking, messages).
     * Called each frame before rendering.
     *
     * Handles:
     * - Blink timing: triggers blink every 4 seconds
     * - Blink duration: resets blink after 150ms
     * - Message rotation: changes dialogue every 8 seconds
     */
    private updateAnimations;
    /**
     * Renders a single frame to the terminal.
     * Gets current state, builds layout, and updates display.
     *
     * Steps:
     * 1. Get state from callback
     * 2. Update animation controller
     * 3. Get appropriate sprite (with animations applied)
     * 4. Build layout with all UI elements
     * 5. Update terminal display using log-update
     */
    private render;
    /**
     * Renders arbitrary content to the terminal.
     * Used for non-animated screens like menus, help, stats.
     *
     * This bypasses the normal render loop and displays custom content.
     * The animation loop should typically be stopped before using this.
     *
     * @param content - String content to display
     *
     * @example
     * renderer.stop();
     * renderer.renderCustom(buildHelpScreen());
     */
    renderCustom(content: string): void;
    /**
     * Sets a temporary custom message that auto-resets after a duration.
     * Useful for showing feedback messages that should disappear.
     *
     * @param message - Message to display
     * @param duration - How long to show it in milliseconds (default: 3000)
     *
     * @example
     * renderer.setMessage("*happy bark* Great job!", 5000);
     */
    setMessage(message: string, duration?: number): void;
    /**
     * Triggers a specific animation sequence.
     * Currently a placeholder - animation is handled via mood changes.
     *
     * @param type - Type of animation to trigger
     */
    triggerAnimation(type: 'excited' | 'levelUp' | 'eating' | 'playing'): void;
    /**
     * Normalizes sprite lines to a fixed width.
     * Ensures all lines are exactly the target width to prevent frame drift.
     *
     * @param sprite - Array of sprite lines
     * @param targetWidth - Target width for all lines
     * @returns Normalized sprite with consistent line widths
     */
    private normalizeSprite;
    /**
     * Gets the current frame number.
     * Useful for synchronizing external animations.
     *
     * @returns Current frame count
     */
    getFrame(): number;
    /**
     * Clears the terminal output.
     * Uses log-update's clear method to remove rendered content.
     */
    clear(): void;
}
/**
 * Global singleton renderer instance.
 * Use this exported instance throughout the application.
 *
 * @example
 * import { renderer } from './pet/renderer.js';
 * renderer.start(getState);
 */
export declare const renderer: Renderer;
//# sourceMappingURL=renderer.d.ts.map