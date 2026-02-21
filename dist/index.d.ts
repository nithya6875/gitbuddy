#!/usr/bin/env node
/**
 * =============================================================================
 * INDEX.TS - Main Entry Point for GitBuddy
 * =============================================================================
 *
 * This is the main entry point and orchestrator for the GitBuddy application.
 * It initializes the application, manages the main game loop, handles user
 * input, and coordinates all the different subsystems.
 *
 * GitBuddy is a Tamagotchi-style terminal pet whose mood and health reflect
 * the state of your Git repository. Take care of your pet by maintaining
 * good coding practices!
 *
 * Application Flow:
 * 1. Check for TTY (interactive terminal) - exit if not available
 * 2. Check for Git repository - show error screen if not in a repo
 * 3. First run: Display intro animation and prompt for pet name
 * 4. Returning user: Load saved state and apply HP decay
 * 5. Start main game loop with keyboard input handling
 * 6. Render UI updates at 60fps with animated sprites
 * 7. Save state on exit
 *
 * Key Features:
 * - Real-time keyboard input handling (raw mode)
 * - Animated pet sprite rendering
 * - Persistent state across sessions
 * - Multiple screens (main, help, feed, play, stats)
 * - Graceful shutdown with state saving
 */
export {};
//# sourceMappingURL=index.d.ts.map