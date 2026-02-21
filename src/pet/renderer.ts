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

import logUpdate from 'log-update';                      // In-place terminal updates
import { getSprite, addBreathing, type Mood, type Level } from './sprites.js';
import { getMessage } from './dialogue.js';
import { buildLayout, type LayoutData } from '../ui/layout.js';
import type { HealthCheck } from '../health/scanner.js';
import {
  createAnimationController,
  updateAnimation,
  getAnimatedSprite,
  applyPosition,
  type AnimationController,
} from './animations.js';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================
/**
 * State data required to render a frame.
 * This interface defines what information the renderer needs
 * to display the pet and UI correctly.
 */
export interface RenderState {
  name: string;            // Pet's name (displayed in title)
  level: Level;            // Current evolution level (1-5)
  hp: number;              // Health points (0-100)
  xp: number;              // Current experience points
  xpMax: number;           // XP needed for next level
  mood: Mood;              // Current mood state
  healthChecks: HealthCheck[]; // Array of repo health checks
  customMessage?: string;  // Optional override message to display
  isAnimating?: boolean;   // Reserved for future animation states
}

// =============================================================================
// RENDERER CLASS
// =============================================================================
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
export class Renderer {
  // -------------------------------------------------------------------------
  // Animation State Properties
  // -------------------------------------------------------------------------

  /** Current animation frame number (increments each tick) */
  private frame: number = 0;

  /** Timestamp of last blink start */
  private lastBlinkTime: number = Date.now();

  /** Whether eyes are currently closed for blink */
  private isBlinking: boolean = false;

  /** How long a blink lasts in milliseconds */
  private blinkDuration: number = 150; // ms

  /** Time between blinks in milliseconds */
  private blinkInterval: number = 4000; // ms

  /** Currently displayed dialogue message */
  private currentMessage: string = '';

  /** Timestamp when message was last changed */
  private messageChangeTime: number = Date.now();

  /** How often to rotate messages in milliseconds */
  private messageInterval: number = 8000; // ms

  /** Reference to the setInterval timer (for cleanup) */
  private intervalId: ReturnType<typeof setInterval> | null = null;

  /** Callback function to get current state (set by start()) */
  private renderCallback: (() => RenderState) | null = null;

  /** Current terminal width (updates on resize) */
  private terminalWidth: number = process.stdout.columns || 50;

  /** Animation controller for dynamic pet movements */
  private animationController: AnimationController = createAnimationController();

  /** Whether to use dynamic animations (disabled for stability) */
  private useDynamicAnimations: boolean = false;

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------
  /**
   * Creates a new Renderer instance.
   * Sets up terminal resize listener to adjust layout dynamically.
   */
  constructor() {
    // Listen for terminal resize events to update width
    process.stdout.on('resize', () => {
      this.terminalWidth = process.stdout.columns || 50;
    });
  }

  // -------------------------------------------------------------------------
  // Render Loop Control
  // -------------------------------------------------------------------------
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
  start(getState: () => RenderState): void {
    // Store the state callback for use in render loop
    this.renderCallback = getState;

    // Initialize message with mood-appropriate text
    this.currentMessage = getMessage(getState().mood);

    // Reset animation controller for fresh start
    this.animationController = createAnimationController();

    // Clear log-update buffer at start
    logUpdate.clear();

    // Start the render loop at ~7 FPS (150ms per frame)
    // This provides smooth walking animations
    this.intervalId = setInterval(() => {
      this.frame++;                  // Increment frame counter
      this.updateAnimations();       // Update blink/message state
      this.render();                 // Draw the frame
    }, 150);

    // Render first frame immediately (don't wait 250ms)
    this.render();
  }

  /**
   * Stops the animation render loop.
   * Clears the interval timer and stops rendering.
   *
   * Call this when:
   * - Switching to a different screen (help, stats, etc.)
   * - Handling input that pauses animation
   * - Cleaning up before exit
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // -------------------------------------------------------------------------
  // Animation State Updates
  // -------------------------------------------------------------------------
  /**
   * Updates animation state (blinking, messages).
   * Called each frame before rendering.
   *
   * Handles:
   * - Blink timing: triggers blink every 4 seconds
   * - Blink duration: resets blink after 150ms
   * - Message rotation: changes dialogue every 8 seconds
   */
  private updateAnimations(): void {
    const now = Date.now();

    // ---- Blink Animation ----
    // Check if it's time to start a new blink
    if (!this.isBlinking && now - this.lastBlinkTime > this.blinkInterval) {
      this.isBlinking = true;
      this.lastBlinkTime = now;

      // Schedule end of blink after duration
      setTimeout(() => {
        this.isBlinking = false;
      }, this.blinkDuration);
    }

    // ---- Message Rotation ----
    // Change message periodically unless a custom message is set
    if (this.renderCallback && now - this.messageChangeTime > this.messageInterval) {
      const state = this.renderCallback();

      // Only rotate if no custom message is active
      if (!state.customMessage) {
        this.currentMessage = getMessage(state.mood);
        this.messageChangeTime = now;
      }
    }
  }

  // -------------------------------------------------------------------------
  // Frame Rendering
  // -------------------------------------------------------------------------
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
  private render(): void {
    // Skip if no callback is registered
    if (!this.renderCallback) return;

    // Get current state from the app
    const state = this.renderCallback();

    let sprite: string[];

    // ---- Dynamic Animations ----
    if (this.useDynamicAnimations && state.mood !== 'sleeping' && state.mood !== 'eating') {
      // Update the animation controller (handles walking, state changes)
      this.animationController = updateAnimation(this.animationController, state.mood);

      // Level 1 has custom animated sprites
      if (state.level === 1) {
        sprite = getAnimatedSprite(this.animationController, state.level, state.mood);
      } else {
        // Higher levels use standard sprites but still move
        sprite = getSprite(state.mood, state.level, this.frame, this.isBlinking);
      }

      // Apply position offset for movement (pet walks across terminal)
      sprite = applyPosition(sprite, this.animationController.position);
    } else {
      // ---- Static Sprite Rendering (sleeping/eating) ----
      sprite = getSprite(state.mood, state.level, this.frame, this.isBlinking);

      // Apply breathing animation (subtle up/down movement)
      if (state.mood !== 'sleeping' && state.mood !== 'sick') {
        sprite = addBreathing(sprite, this.frame);
      }
    }

    // ---- Build Layout Data ----
    const layoutData: LayoutData = {
      name: state.name,
      level: state.level,
      hp: state.hp,
      xp: state.xp,
      xpMax: state.xpMax,
      mood: state.mood,
      message: state.customMessage || this.currentMessage,  // Custom message takes priority
      sprite,
      healthChecks: state.healthChecks,
      terminalWidth: this.terminalWidth,
    };

    // ---- Render to Terminal ----
    // buildLayout creates the complete UI string
    // logUpdate replaces previous output in-place (no flickering)
    const screen = buildLayout(layoutData);
    logUpdate(screen);
  }

  // -------------------------------------------------------------------------
  // Custom Content Rendering
  // -------------------------------------------------------------------------
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
  renderCustom(content: string): void {
    // Render custom content (log-update handles in-place replacement)
    logUpdate(content);
  }

  // -------------------------------------------------------------------------
  // Message Control
  // -------------------------------------------------------------------------
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
  setMessage(message: string, duration: number = 3000): void {
    // Store the original callback
    const previousCallback = this.renderCallback;
    if (!previousCallback) return;

    const originalGetState = previousCallback;

    // Create a wrapper that adds the custom message
    this.renderCallback = () => {
      const state = originalGetState();
      return { ...state, customMessage: message };
    };

    // Reset after duration
    setTimeout(() => {
      this.renderCallback = originalGetState;
      this.currentMessage = getMessage(originalGetState().mood);
    }, duration);
  }

  // -------------------------------------------------------------------------
  // Animation Triggers (Reserved for Future Use)
  // -------------------------------------------------------------------------
  /**
   * Triggers a specific animation sequence.
   * Currently a placeholder - animation is handled via mood changes.
   *
   * @param type - Type of animation to trigger
   */
  triggerAnimation(type: 'excited' | 'levelUp' | 'eating' | 'playing'): void {
    // Animation is currently handled by changing mood in state
    // This method is reserved for future complex animation sequences
  }

  // -------------------------------------------------------------------------
  // Utility Methods
  // -------------------------------------------------------------------------
  /**
   * Gets the current frame number.
   * Useful for synchronizing external animations.
   *
   * @returns Current frame count
   */
  getFrame(): number {
    return this.frame;
  }

  /**
   * Clears the terminal output.
   * Uses log-update's clear method to remove rendered content.
   */
  clear(): void {
    logUpdate.clear();
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================
/**
 * Global singleton renderer instance.
 * Use this exported instance throughout the application.
 *
 * @example
 * import { renderer } from './pet/renderer.js';
 * renderer.start(getState);
 */
export const renderer = new Renderer();
