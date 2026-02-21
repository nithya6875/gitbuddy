/**
 * =============================================================================
 * LAYOUT.TS - Main UI Layout Builder for GitBuddy
 * =============================================================================
 *
 * This file is responsible for constructing the main game interface layout.
 * It assembles all visual components into a unified, boxed display including:
 * - Title bar with pet name and level
 * - Mood indicator with emoji
 * - HP and XP progress bars
 * - ASCII art pet sprite
 * - Speech bubble messages
 * - Repository health checks
 * - Action help bar
 *
 * The layout uses Unicode box-drawing characters to create a clean, bordered
 * interface that adapts to terminal width while maintaining visual consistency.
 *
 * Key Features:
 * - Dynamic width calculation for terminal responsiveness
 * - ANSI code stripping for accurate length calculations
 * - Text wrapping for long messages
 * - Color-coded status indicators
 * - Level-based action availability display
 */
import type { Mood, Level } from '../pet/sprites.js';
import type { HealthCheck } from '../health/scanner.js';
/**
 * LayoutData Interface
 *
 * Contains all the data needed to render the main game layout.
 * This is passed to buildLayout() to construct the complete UI.
 */
export interface LayoutData {
    name: string;
    level: Level;
    hp: number;
    xp: number;
    xpMax: number;
    mood: Mood;
    message: string;
    sprite: string[];
    healthChecks: HealthCheck[];
    terminalWidth?: number;
}
/**
 * Builds the complete main game layout as a single string.
 * This is the primary function that assembles all UI components
 * into a bordered box display.
 *
 * Layout structure (top to bottom):
 * 1. Top border (╭───╮)
 * 2. Title bar (name + level stars)
 * 3. Mood line (mood text + XP counter)
 * 4. Empty spacer line
 * 5. HP progress bar
 * 6. XP progress bar
 * 7. Empty spacer line
 * 8. Pet sprite (ASCII art, centered)
 * 9. Minimum height padding (if sprite is short)
 * 10. Empty spacer line
 * 11. Message bubble (💬 with wrapped text)
 * 12. Empty spacer line
 * 13. Health checks (up to 4 displayed)
 * 14. Empty spacer line
 * 15. Help bar (centered action shortcuts)
 * 16. Bottom border (╰───╯)
 *
 * @param data - LayoutData object containing all display information
 * @returns A complete multi-line string ready for terminal output
 */
export declare function buildLayout(data: LayoutData): string;
/**
 * Builds the help screen overlay displayed when user presses [H].
 * Shows all available keyboard shortcuts and their descriptions.
 *
 * @returns A complete multi-line string for the help screen display
 */
export declare function buildHelpScreen(): string;
/**
 * Data needed to render the level screen.
 */
export interface LevelScreenData {
    name: string;
    level: Level;
    hp: number;
    xp: number;
}
/**
 * Builds the level details screen displayed when user presses [L].
 * Shows detailed level, HP, and XP information with progress bars.
 *
 * @param data - LevelScreenData containing pet stats
 * @returns A complete bordered screen string
 */
export declare function buildLevelScreen(data: LevelScreenData): string;
//# sourceMappingURL=layout.d.ts.map