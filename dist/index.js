#!/usr/bin/env node
"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const readline = __importStar(require("readline")); // For reading user input during naming
// Import internal modules
const renderer_js_1 = require("./pet/renderer.js");
const dialogue_js_1 = require("./pet/dialogue.js");
const scanner_js_1 = require("./health/scanner.js");
const scoring_js_1 = require("./health/scoring.js");
const persistence_js_1 = require("./state/persistence.js");
const layout_js_1 = require("./ui/layout.js");
const intro_js_1 = require("./ui/intro.js");
const feed_js_1 = require("./actions/feed.js");
const play_js_1 = require("./actions/play.js");
const stats_js_1 = require("./actions/stats.js");
// New feature imports
const commit_js_1 = require("./actions/commit.js");
const focus_js_1 = require("./actions/focus.js");
const achievements_js_1 = require("./actions/achievements.js");
const challenges_js_1 = require("./actions/challenges.js");
const heatmap_js_1 = require("./actions/heatmap.js");
const tricks_js_1 = require("./actions/tricks.js");
const persistence_js_2 = require("./state/persistence.js");
// =============================================================================
// TTY DETECTION
// =============================================================================
/**
 * Check if we're running in an interactive terminal (TTY).
 * GitBuddy requires a TTY for:
 * - Raw keyboard input (setRawMode)
 * - Cursor control (hiding/showing)
 * - Screen clearing and updates
 */
const isTTY = process.stdin.isTTY && process.stdout.isTTY;
// =============================================================================
// CURSOR CONTROL FUNCTIONS
// =============================================================================
/**
 * Hides the terminal cursor for cleaner visual display.
 * The cursor is distracting during the animated UI rendering.
 * Only executes if running in a TTY.
 */
const hideCursor = () => {
    if (isTTY)
        process.stdout.write('\x1B[?25l'); // ANSI escape: hide cursor
};
/**
 * Shows the terminal cursor.
 * Called on exit to restore normal terminal behavior.
 * Only executes if running in a TTY.
 */
const showCursor = () => {
    if (isTTY)
        process.stdout.write('\x1B[?25h'); // ANSI escape: show cursor
};
// =============================================================================
// SCREEN CONTROL
// =============================================================================
/**
 * Clears the entire terminal screen and moves cursor to top-left.
 * Used when transitioning between major screens or on startup.
 * Only executes if running in a TTY.
 */
const clearScreen = () => {
    if (isTTY)
        process.stdout.write('\x1B[2J\x1B[H'); // ANSI: clear screen + home
};
/**
 * Global application state instance.
 * Initialized with default values, then populated during startup.
 */
let appState = {
    pet: null, // Will be set during init
    health: null, // Will be set during init
    mood: 'neutral',
    isRunning: true,
    currentScreen: 'main',
    lastActivityTime: Date.now(),
};
// =============================================================================
// RENDER STATE GENERATOR
// =============================================================================
/**
 * Converts the application state into a RenderState for the renderer.
 * The renderer needs a specific format to build the UI layout.
 *
 * @returns RenderState object containing all display information
 */
function getRenderState() {
    // Calculate XP progress for the current level
    const levelProgress = (0, scoring_js_1.getLevelProgress)(appState.pet.xp);
    return {
        name: appState.pet.name,
        level: appState.pet.level,
        hp: appState.pet.hp,
        xp: appState.pet.xp,
        // Calculate max XP for progress bar display
        xpMax: levelProgress.max + (appState.pet.xp - levelProgress.current),
        mood: appState.mood,
        healthChecks: appState.health?.checks || [],
        customMessage: appState.customMessage,
    };
}
// =============================================================================
// MOOD CALCULATION
// =============================================================================
/**
 * Updates the pet's mood based on current HP and idle time.
 * Called periodically and after actions to keep mood current.
 *
 * Mood factors:
 * - HP level (low HP = sad/sick)
 * - Idle time (> 30s with low HP might show sleeping)
 * - Recent activity (recent input keeps pet alert)
 */
function updateMood() {
    const idleSeconds = (Date.now() - appState.lastActivityTime) / 1000;
    appState.mood = (0, scoring_js_1.calculateMood)(appState.pet.hp, idleSeconds > 30, idleSeconds);
}
// =============================================================================
// KEYBOARD INPUT HANDLER
// =============================================================================
/**
 * Main keyboard input handler.
 * Routes keypresses to appropriate actions based on current screen.
 *
 * @param key - The key that was pressed (single character or escape sequence)
 *
 * Key mappings vary by screen:
 * - Main screen: f/F (feed), p/P (play), s/S (stats), h/H (help), q/Q (quit), r/R (refresh)
 * - Help/Feed/Stats: Any key returns to main
 * - Play menu: 1, 2, 3 for activities, Esc to cancel
 * - Play result: Any key returns to main
 */
async function handleKeypress(key) {
    // Record activity time to keep pet from going idle
    appState.lastActivityTime = Date.now();
    // Clear any custom message when user interacts
    appState.customMessage = undefined;
    // Force main screen if we somehow got into an invalid state
    const validScreens = ['main', 'help', 'feed', 'play', 'playMenu', 'stats', 'reset',
        'commit', 'commitSuccess', 'focusSelect', 'focus', 'focusComplete',
        'achievements', 'achievementUnlock', 'heatmap', 'level', 'trickSelect', 'trickResult'];
    if (!validScreens.includes(appState.currentScreen)) {
        appState.currentScreen = 'main';
    }
    // -------------------------------------------------------------------------
    // Overlay Screen Handling (Help, Feed, Stats, Heatmap, Achievements, Level)
    // -------------------------------------------------------------------------
    // These screens dismiss on any key
    if (appState.currentScreen === 'help' || appState.currentScreen === 'feed' ||
        appState.currentScreen === 'stats' || appState.currentScreen === 'heatmap' ||
        appState.currentScreen === 'achievements' || appState.currentScreen === 'trickResult' ||
        appState.currentScreen === 'level') {
        appState.currentScreen = 'main';
        return;
    }
    // -------------------------------------------------------------------------
    // Achievement Unlock Handling
    // -------------------------------------------------------------------------
    if (appState.currentScreen === 'achievementUnlock') {
        // Check for more achievements to show
        if (appState.pendingAchievements && appState.pendingAchievements.length > 0) {
            const nextId = appState.pendingAchievements.shift();
            const achievement = (0, achievements_js_1.getAchievement)(nextId);
            if (achievement) {
                renderer_js_1.renderer.renderCustom((0, achievements_js_1.buildAchievementUnlockedScreen)(achievement));
                return;
            }
        }
        appState.currentScreen = 'main';
        return;
    }
    // -------------------------------------------------------------------------
    // Reset Confirmation Handling
    // -------------------------------------------------------------------------
    if (appState.currentScreen === 'reset') {
        if (key.toLowerCase() === 'y') {
            // User confirmed reset
            (0, persistence_js_1.resetState)();
            renderer_js_1.renderer.stop();
            clearScreen();
            console.log('\n  Game reset! Run the app again to start fresh.\n');
            showCursor();
            process.exit(0);
        }
        else {
            // Cancel reset
            appState.currentScreen = 'main';
            appState.customMessage = '*relieved pant* Phew, I thought you were leaving!';
        }
        return;
    }
    // -------------------------------------------------------------------------
    // Commit Screen Handling
    // -------------------------------------------------------------------------
    if (appState.currentScreen === 'commit') {
        if (key.toLowerCase() === 'y') {
            // Use suggested commit message
            await executeCommitAction();
        }
        else if (key.toLowerCase() === 'e') {
            // Edit mode (for now, just use suggestion - would need readline for editing)
            await executeCommitAction();
        }
        else if (key.toLowerCase() === 'b' || key === '\x1b') {
            appState.currentScreen = 'main';
        }
        return;
    }
    if (appState.currentScreen === 'commitSuccess') {
        appState.currentScreen = 'main';
        return;
    }
    // -------------------------------------------------------------------------
    // Focus Duration Select Handling
    // -------------------------------------------------------------------------
    if (appState.currentScreen === 'focusSelect') {
        const durations = { '1': 15, '2': 25, '3': 45, '4': 60 };
        if (durations[key]) {
            startFocusMode(durations[key]);
        }
        else if (key.toLowerCase() === 'b' || key === '\x1b') {
            appState.currentScreen = 'main';
        }
        return;
    }
    // -------------------------------------------------------------------------
    // Focus Mode Handling
    // -------------------------------------------------------------------------
    if (appState.currentScreen === 'focus') {
        const session = (0, focus_js_1.getCurrentSession)();
        if (!session) {
            appState.currentScreen = 'main';
            return;
        }
        if (key === ' ') {
            // Toggle pause
            if (session.isPaused) {
                (0, focus_js_1.resumeSession)();
            }
            else {
                (0, focus_js_1.pauseSession)();
            }
        }
        else if (key.toLowerCase() === 'x') {
            // End early
            await endFocusMode();
        }
        else if (key.toLowerCase() === 'b' && session.isPaused) {
            // Go back only when paused
            await endFocusMode();
        }
        return;
    }
    if (appState.currentScreen === 'focusComplete') {
        appState.currentScreen = 'main';
        await checkAndShowAchievements();
        return;
    }
    // -------------------------------------------------------------------------
    // Trick Select Handling
    // -------------------------------------------------------------------------
    if (appState.currentScreen === 'trickSelect') {
        const available = (0, tricks_js_1.getAvailableTricks)(appState.pet.level);
        // Use string comparison for number keys (more reliable across terminals)
        if (key === '1' && available.length >= 1) {
            await handleTrick(available[0]);
        }
        else if (key === '2' && available.length >= 2) {
            await handleTrick(available[1]);
        }
        else if (key === '3' && available.length >= 3) {
            await handleTrick(available[2]);
        }
        else if (key === '4' && available.length >= 4) {
            await handleTrick(available[3]);
        }
        else if (key === '5' && available.length >= 5) {
            await handleTrick(available[4]);
        }
        else if (key === '6' && available.length >= 6) {
            await handleTrick(available[5]);
        }
        else if (key.toLowerCase() === 'r') {
            await handleTrick((0, tricks_js_1.getRandomTrick)(appState.pet.level));
        }
        else if (key.toLowerCase() === 'b' || key === '\x1b') {
            appState.currentScreen = 'main';
        }
        return;
    }
    // -------------------------------------------------------------------------
    // Play Menu Handling
    // -------------------------------------------------------------------------
    if (appState.currentScreen === 'playMenu') {
        if (key === '1') {
            await handlePlayAction('trick');
        }
        else if (key === '2') {
            await handlePlayAction('fetch');
        }
        else if (key === '3') {
            await handlePlayAction('belly');
        }
        else if (key === '\x1b' || key === 'escape' || key === '\r') {
            // Escape or Enter cancels the menu
            appState.currentScreen = 'main';
        }
        return;
    }
    // -------------------------------------------------------------------------
    // Play Result Handling
    // -------------------------------------------------------------------------
    if (appState.currentScreen === 'play') {
        appState.currentScreen = 'main';
        return;
    }
    // -------------------------------------------------------------------------
    // Main Screen Key Handling
    // -------------------------------------------------------------------------
    const lowerKey = key.toLowerCase();
    try {
        switch (lowerKey) {
            case 'f':
                // Feed action - scan for code issues
                await handleFeed();
                break;
            case 'p':
                // Play action / Smart Tricks
                appState.currentScreen = 'trickSelect';
                renderer_js_1.renderer.stop();
                renderer_js_1.renderer.renderCustom((0, tricks_js_1.buildTrickSelectScreen)(appState.pet));
                break;
            case 's':
                // Stats/Heatmap action
                renderer_js_1.renderer.stop();
                appState.currentScreen = 'heatmap';
                renderer_js_1.renderer.renderCustom((0, heatmap_js_1.buildHeatmapScreen)(appState.pet));
                break;
            case 'c':
                // Smart commit action
                await handleSmartCommit();
                break;
            case 't':
                // Focus/Pomodoro mode
                appState.currentScreen = 'focusSelect';
                renderer_js_1.renderer.stop();
                renderer_js_1.renderer.renderCustom((0, focus_js_1.buildDurationSelectScreen)());
                break;
            case 'a':
                // Achievements screen
                appState.currentScreen = 'achievements';
                renderer_js_1.renderer.stop();
                renderer_js_1.renderer.renderCustom((0, achievements_js_1.buildAchievementsScreen)(appState.pet));
                break;
            case 'l':
                // Show level details screen
                appState.currentScreen = 'level';
                renderer_js_1.renderer.stop();
                renderer_js_1.renderer.renderCustom((0, layout_js_1.buildLevelScreen)({
                    name: appState.pet.name,
                    level: appState.pet.level,
                    hp: appState.pet.hp,
                    xp: appState.pet.xp,
                }));
                break;
            case 'h':
                // Show help screen
                appState.currentScreen = 'help';
                renderer_js_1.renderer.stop();
                renderer_js_1.renderer.renderCustom((0, layout_js_1.buildHelpScreen)());
                break;
            case 'r':
                // Rescan repository health
                await rescanRepo();
                break;
            case 'e':
            case 'q':
            case '\x03': // Ctrl+C
                // Quit application
                await handleQuit();
                break;
            case 'x':
                // Reset game - show confirmation
                appState.currentScreen = 'reset';
                renderer_js_1.renderer.stop();
                renderer_js_1.renderer.renderCustom((0, intro_js_1.buildResetScreen)());
                break;
        }
    }
    catch (err) {
        // If any action fails, show error message and return to main
        appState.customMessage = '*confused whimper* Something went wrong...';
        appState.currentScreen = 'main';
    }
}
// =============================================================================
// ACTION HANDLERS
// =============================================================================
/**
 * Handles the Feed action.
 * Scans for code issues (TODOs, console.logs) and awards XP.
 */
async function handleFeed() {
    // Update mood to eating state
    appState.mood = 'eating';
    appState.customMessage = '*sniff sniff* Looking for issues...';
    // Stop the main renderer while showing feed screen
    renderer_js_1.renderer.stop();
    // Scan for code issues
    const result = await (0, feed_js_1.findCodeIssues)();
    // Award XP from feed
    const { newState, leveledUp } = (0, persistence_js_1.addXP)(appState.pet, result.xpGained);
    appState.pet = newState;
    // Increment feed counter
    appState.pet = (0, persistence_js_1.updateState)({ totalFeeds: appState.pet.totalFeeds + 1 });
    // Check for level up
    if (leveledUp) {
        appState.customMessage = '*HOWLS WITH JOY* I LEVELED UP!!!';
        appState.mood = 'excited';
    }
    else {
        appState.mood = 'happy';
    }
    // Show feed results screen
    appState.currentScreen = 'feed';
    renderer_js_1.renderer.renderCustom((0, feed_js_1.buildFeedScreen)(result));
}
/**
 * Handles a specific play action (trick, fetch, or belly rubs).
 *
 * @param action - The play action to perform
 */
async function handlePlayAction(action) {
    // Update mood to playing state
    appState.mood = 'playing';
    // Stop the main renderer while showing play screen
    renderer_js_1.renderer.stop();
    // Build the play result screen (includes animation for fetch)
    const { screen, xp } = await (0, play_js_1.buildPlayResult)(action);
    // Award XP from play
    const { newState, leveledUp } = (0, persistence_js_1.addXP)(appState.pet, xp);
    appState.pet = newState;
    // Increment play counter
    appState.pet = (0, persistence_js_1.updateState)({ totalPlays: appState.pet.totalPlays + 1 });
    // Check for level up
    if (leveledUp) {
        appState.customMessage = '*HOWLS WITH JOY* I LEVELED UP!!!';
        appState.mood = 'excited';
    }
    else {
        appState.mood = 'happy';
    }
    // Show play results screen
    appState.currentScreen = 'play';
    renderer_js_1.renderer.renderCustom(screen);
}
/**
 * Handles the Stats action.
 * Displays comprehensive statistics about the pet and repository.
 */
function handleStats() {
    appState.currentScreen = 'stats';
    // Stop the main renderer while showing stats
    renderer_js_1.renderer.stop();
    // Build and display stats screen
    const statsScreen = (0, stats_js_1.buildStatsScreen)({
        state: appState.pet,
        health: appState.health,
    });
    renderer_js_1.renderer.renderCustom(statsScreen);
}
// =============================================================================
// NEW FEATURE HANDLERS
// =============================================================================
/**
 * Handles the Smart Commit action [C].
 * Analyzes staged changes and suggests a commit message.
 */
async function handleSmartCommit() {
    renderer_js_1.renderer.stop();
    if (!(0, commit_js_1.hasStagedChanges)()) {
        appState.currentScreen = 'commit';
        renderer_js_1.renderer.renderCustom((0, commit_js_1.buildNoStagedScreen)());
        return;
    }
    const suggestion = (0, commit_js_1.analyzeChanges)();
    appState.pendingCommitMessage = (0, commit_js_1.formatCommitMessage)(suggestion);
    appState.currentScreen = 'commit';
    renderer_js_1.renderer.renderCustom((0, commit_js_1.buildCommitScreen)(suggestion));
}
/**
 * Executes the pending commit.
 */
async function executeCommitAction() {
    if (!appState.pendingCommitMessage) {
        appState.currentScreen = 'main';
        return;
    }
    const result = (0, commit_js_1.executeCommit)(appState.pendingCommitMessage);
    if (result.success) {
        // Award XP for commit
        const { newState, leveledUp } = (0, persistence_js_1.addXP)(appState.pet, 15);
        appState.pet = newState;
        // Track smart commit
        appState.pet = (0, persistence_js_1.updateState)({
            totalSmartCommits: appState.pet.totalSmartCommits + 1,
        });
        appState.pet = (0, persistence_js_2.incrementDailyCounter)(appState.pet, 'smartCommits');
        appState.pet = (0, persistence_js_2.recordSessionAction)(appState.pet, 'commit');
        // Rescan repo health to update commit count in main frame
        const health = await (0, scanner_js_1.scanRepo)();
        appState.health = health;
        if (leveledUp) {
            appState.customMessage = '*HOWLS WITH JOY* I LEVELED UP!!!';
        }
        appState.currentScreen = 'commitSuccess';
        renderer_js_1.renderer.renderCustom((0, commit_js_1.buildCommitSuccessScreen)(appState.pendingCommitMessage));
    }
    else {
        appState.customMessage = `*whimper* Commit failed: ${result.error}`;
        appState.currentScreen = 'main';
    }
    appState.pendingCommitMessage = undefined;
}
/**
 * Starts focus/pomodoro mode.
 */
function startFocusMode(minutes) {
    (0, focus_js_1.startFocusSession)(minutes);
    appState.currentScreen = 'focus';
    appState.pet = (0, persistence_js_2.recordSessionAction)(appState.pet, 'focus');
    // Start the focus update interval
    appState.focusUpdateInterval = setInterval(() => {
        if (appState.currentScreen === 'focus') {
            const session = (0, focus_js_1.getCurrentSession)();
            if (session) {
                if ((0, focus_js_1.isSessionComplete)()) {
                    endFocusMode();
                }
                else {
                    renderer_js_1.renderer.renderCustom((0, focus_js_1.buildFocusScreen)(session));
                }
            }
        }
    }, 1000);
    const session = (0, focus_js_1.getCurrentSession)();
    renderer_js_1.renderer.renderCustom((0, focus_js_1.buildFocusScreen)(session));
}
/**
 * Ends focus mode and shows results.
 */
async function endFocusMode() {
    // Clear the update interval
    if (appState.focusUpdateInterval) {
        clearInterval(appState.focusUpdateInterval);
        appState.focusUpdateInterval = undefined;
    }
    const result = (0, focus_js_1.endFocusSession)();
    if (!result) {
        appState.currentScreen = 'main';
        return;
    }
    // Calculate XP based on duration and commits
    const baseXP = Math.floor(result.duration * 2);
    const commitBonus = result.commits * 10;
    const xpEarned = baseXP + commitBonus;
    const { newState, leveledUp } = (0, persistence_js_1.addXP)(appState.pet, xpEarned);
    appState.pet = newState;
    // Update focus session stats
    appState.pet = (0, persistence_js_1.updateState)({
        focusSessions: {
            ...appState.pet.focusSessions,
            total: appState.pet.focusSessions.total + 1,
            totalMinutes: appState.pet.focusSessions.totalMinutes + result.duration,
            todaySessions: appState.pet.focusSessions.todaySessions + 1,
            bestSession: result.commits > (appState.pet.focusSessions.bestSession?.commits || 0)
                ? { commits: result.commits, lines: result.linesAdded, date: new Date().toISOString() }
                : appState.pet.focusSessions.bestSession,
        },
    });
    appState.pet = (0, persistence_js_2.incrementDailyCounter)(appState.pet, 'focusSessions');
    if (leveledUp) {
        appState.customMessage = '*HOWLS WITH JOY* I LEVELED UP!!!';
    }
    appState.currentScreen = 'focusComplete';
    renderer_js_1.renderer.renderCustom((0, focus_js_1.buildFocusCompleteScreen)(result, xpEarned));
}
/**
 * Handles a smart dog trick.
 */
async function handleTrick(trick) {
    // Stop renderer to ensure clean screen
    renderer_js_1.renderer.stop();
    appState.mood = 'playing';
    appState.pet = (0, persistence_js_2.recordSessionAction)(appState.pet, 'play');
    const result = (0, tricks_js_1.executeTrick)(trick);
    // Award XP for trick
    const xp = result.success ? 15 : 5;
    const { newState, leveledUp } = (0, persistence_js_1.addXP)(appState.pet, xp);
    appState.pet = newState;
    // Increment play counter
    appState.pet = (0, persistence_js_1.updateState)({ totalPlays: appState.pet.totalPlays + 1 });
    if (leveledUp) {
        appState.customMessage = '*HOWLS WITH JOY* I LEVELED UP!!!';
    }
    appState.currentScreen = 'trickResult';
    renderer_js_1.renderer.renderCustom((0, tricks_js_1.buildTrickResultScreen)(result, xp));
}
/**
 * Gets repo data for achievements and challenges.
 */
function getRepoDataForAchievements() {
    const now = new Date();
    // Extract counts from health check values
    const workingTreeCheck = appState.health.checks.find(c => c.name === 'Working Tree');
    const dirtyFiles = workingTreeCheck?.status === 'great' ? 0 :
        parseInt(workingTreeCheck?.value.match(/\d+/)?.[0] || '0');
    return {
        totalCommits: appState.health.commitCount,
        streak: appState.health.streak,
        commitsToday: (0, heatmap_js_1.getTodayCommits)(),
        dirtyFiles,
        consoleLogs: 0, // Would need separate scan
        hasCommitBefore10Today: false,
        hadBigCommitToday: false,
        isWeekend: now.getDay() === 0 || now.getDay() === 6,
        hour: now.getHours(),
    };
}
/**
 * Checks and shows any new achievements.
 */
async function checkAndShowAchievements() {
    const repoData = getRepoDataForAchievements();
    const newAchievements = (0, achievements_js_1.checkAchievements)(appState.pet, repoData);
    if (newAchievements.length === 0)
        return;
    // Grant XP and record achievements
    for (const achievement of newAchievements) {
        if (achievement.xpReward > 0) {
            const { newState } = (0, persistence_js_1.addXP)(appState.pet, achievement.xpReward);
            appState.pet = newState;
        }
        appState.pet = (0, persistence_js_1.updateState)({
            achievements: [...appState.pet.achievements, achievement.id],
        });
    }
    // Show achievement popups
    if (newAchievements.length > 0) {
        appState.pendingAchievements = newAchievements.slice(1).map(a => a.id);
        appState.currentScreen = 'achievementUnlock';
        renderer_js_1.renderer.stop();
        renderer_js_1.renderer.renderCustom((0, achievements_js_1.buildAchievementUnlockedScreen)(newAchievements[0]));
    }
}
/**
 * Checks daily challenge progress.
 */
function checkDailyChallengeProgress() {
    // Extract counts from health check values
    const workingTreeCheck = appState.health.checks.find(c => c.name === 'Working Tree');
    const dirtyFiles = workingTreeCheck?.status === 'great' ? 0 :
        parseInt(workingTreeCheck?.value.match(/\d+/)?.[0] || '0');
    const challengeData = {
        commitsToday: (0, heatmap_js_1.getTodayCommits)(),
        streak: (0, heatmap_js_1.getCurrentStreak)(),
        dirtyFiles,
        consoleLogs: 0, // Would need separate scan
        todos: 0, // Would need separate scan
    };
    const dailyChallenge = (0, challenges_js_1.getDailyChallenge)(appState.pet);
    const { progress, completed, justCompleted } = (0, challenges_js_1.checkChallengeProgress)(appState.pet, challengeData);
    // Update challenge state
    appState.pet = (0, persistence_js_1.updateState)({
        dailyChallenge: {
            ...dailyChallenge,
            progress,
            completed,
        },
    });
    // Show popup if just completed
    if (justCompleted) {
        const challenge = (0, challenges_js_1.getChallenge)(dailyChallenge.challengeId);
        if (challenge) {
            const { newState } = (0, persistence_js_1.addXP)(appState.pet, challenge.xpReward);
            appState.pet = newState;
            renderer_js_1.renderer.stop();
            renderer_js_1.renderer.renderCustom((0, challenges_js_1.buildChallengeCompleteScreen)(challenge));
        }
    }
}
/**
 * Rescans the repository for health metrics.
 * Called when user presses [R] to refresh data.
 */
async function rescanRepo() {
    appState.customMessage = '*sniff sniff* Scanning repo...';
    // Perform repository scan
    const health = await (0, scanner_js_1.scanRepo)();
    appState.health = health;
    if (health.isGitRepo) {
        // Update HP based on new health data
        const hp = (0, scoring_js_1.calculateHP)(health);
        // Update state with new values
        appState.pet = (0, persistence_js_1.updateState)({
            hp,
            totalScans: appState.pet.totalScans + 1,
            longestStreak: Math.max(appState.pet.longestStreak, health.streak),
        });
        // Award small XP for scanning
        const { newState } = (0, persistence_js_1.addXP)(appState.pet, 2);
        appState.pet = newState;
        // Update mood based on new HP
        updateMood();
        // Get a fresh message based on current mood
        appState.customMessage = (0, dialogue_js_1.getMessage)(appState.mood);
    }
}
/**
 * Handles application quit.
 * Shows exit animation, saves state, and exits cleanly.
 */
async function handleQuit() {
    // Mark app as no longer running
    appState.isRunning = false;
    // Stop the renderer
    renderer_js_1.renderer.stop();
    // Show the exit animation (puppy going back into kennel)
    clearScreen();
    await runExitAnimation();
    // Save the current pet state to disk
    (0, persistence_js_1.saveState)(appState.pet);
    // Restore cursor and exit
    showCursor();
    process.exit(0);
}
// =============================================================================
// FIRST RUN INTRO SEQUENCE
// =============================================================================
/**
 * Runs the first-run intro animation sequence.
 * Displays animated kennel, asks for pet name, and shows welcome message.
 *
 * @returns The name the user chose for their pet
 */
async function runIntroSequence() {
    clearScreen();
    hideCursor();
    // -------------------------------------------------------------------------
    // Frame 1: Kennel with question marks (mystery)
    // -------------------------------------------------------------------------
    renderer_js_1.renderer.renderCustom((0, intro_js_1.buildIntroFrame)(0));
    await sleep(1500);
    // -------------------------------------------------------------------------
    // Frame 2: Eyes appear in the kennel
    // -------------------------------------------------------------------------
    renderer_js_1.renderer.renderCustom((0, intro_js_1.buildIntroFrame)(1));
    await sleep(1500);
    // -------------------------------------------------------------------------
    // Frame 3: Puppy emerges!
    // -------------------------------------------------------------------------
    renderer_js_1.renderer.renderCustom((0, intro_js_1.buildIntroFrame)(2));
    await sleep(2000);
    // -------------------------------------------------------------------------
    // Name Prompt
    // -------------------------------------------------------------------------
    renderer_js_1.renderer.renderCustom((0, intro_js_1.buildNamePrompt)());
    showCursor(); // Show cursor for text input
    // Get name from user
    const name = await promptForName();
    hideCursor(); // Hide cursor again
    // -------------------------------------------------------------------------
    // Welcome Message
    // -------------------------------------------------------------------------
    renderer_js_1.renderer.renderCustom((0, intro_js_1.buildWelcomeMessage)(name));
    await waitForKeypress();
    // Clear log-update buffer before main game
    renderer_js_1.renderer.clear();
    return name;
}
/**
 * Runs the startup kennel animation.
 * Shows the puppy emerging from the kennel.
 * This runs every time the app starts.
 */
async function runStartupAnimation() {
    clearScreen();
    hideCursor();
    const frameCount = (0, intro_js_1.getKennelFrameCount)();
    // Play each frame of the kennel animation (log-update handles smooth transitions)
    for (let i = 0; i < frameCount; i++) {
        renderer_js_1.renderer.renderCustom((0, intro_js_1.buildIntroFrame)(i));
        await sleep(800); // 800ms per frame
    }
    // Pause briefly on the final frame
    await sleep(500);
    // Clear log-update buffer before main game
    renderer_js_1.renderer.clear();
}
/**
 * Runs the exit kennel animation.
 * Shows the puppy going back into the kennel.
 */
async function runExitAnimation() {
    const frameCount = (0, intro_js_1.getKennelExitFrameCount)();
    // Play each frame of the exit animation
    for (let i = 0; i < frameCount; i++) {
        renderer_js_1.renderer.renderCustom((0, intro_js_1.buildExitFrame)(i));
        await sleep(800); // 800ms per frame
    }
    // Pause on the final frame (sleeping in kennel)
    await sleep(1000);
}
/**
 * Prompts the user to enter a name for their pet.
 * Uses readline for text input.
 *
 * @returns The entered name, or 'Buddy' if empty
 */
function promptForName() {
    return new Promise((resolve) => {
        // Create readline interface for text input
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        // Display prompt
        process.stdout.write('\n  Name: ');
        // Handle input
        rl.on('line', (input) => {
            // Use 'Buddy' as default if no name entered
            const name = input.trim() || 'Buddy';
            rl.close();
            resolve(name);
        });
    });
}
/**
 * Waits for any keypress from the user.
 * Used for "press any key to continue" prompts.
 */
function waitForKeypress() {
    return new Promise((resolve) => {
        // If not in TTY, resolve immediately
        if (!isTTY) {
            resolve();
            return;
        }
        // Enable raw mode to capture single keypress
        process.stdin.setRawMode(true);
        process.stdin.resume();
        // Resolve on first data (keypress)
        process.stdin.once('data', () => {
            resolve();
        });
    });
}
// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================
/**
 * Sleeps for a specified number of milliseconds.
 * Used for animation timing.
 *
 * @param ms - Milliseconds to sleep
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
// =============================================================================
// MAIN APPLICATION
// =============================================================================
/**
 * Main application entry point.
 * Initializes the app, handles first-run vs returning user,
 * sets up input handling, and starts the game loop.
 */
async function main() {
    // -------------------------------------------------------------------------
    // TTY Check - Require interactive terminal
    // -------------------------------------------------------------------------
    if (!isTTY) {
        console.error('GitBuddy requires an interactive terminal. Please run it directly in your terminal.');
        process.exit(1);
    }
    clearScreen();
    hideCursor();
    // -------------------------------------------------------------------------
    // Git Repository Check
    // -------------------------------------------------------------------------
    const health = await (0, scanner_js_1.scanRepo)();
    if (!health.isGitRepo) {
        // Not in a git repository - show error and exit
        console.log((0, intro_js_1.buildNoGitScreen)());
        showCursor();
        process.exit(1);
    }
    appState.health = health;
    // -------------------------------------------------------------------------
    // First Run vs Returning User
    // -------------------------------------------------------------------------
    if ((0, persistence_js_1.isFirstRun)()) {
        // First run - show full intro sequence (animation + naming)
        const name = await runIntroSequence();
        appState.pet = (0, persistence_js_1.createNewPet)(name);
        // Set initial HP based on repo health
        appState.pet = (0, persistence_js_1.updateState)({ hp: (0, scoring_js_1.calculateHP)(health) });
    }
    else {
        // Returning user - load existing pet
        appState.pet = (0, persistence_js_1.loadState)();
        // -------------------------------------------------------------------------
        // Startup Animation - Puppy emerges from kennel every time
        // -------------------------------------------------------------------------
        await runStartupAnimation();
        // Apply HP decay if user has been away
        // This encourages regular visits to maintain pet health
        const decay = (0, persistence_js_1.calculateHPDecay)(appState.pet);
        if (decay > 0) {
            appState.pet = (0, persistence_js_1.updateState)({
                hp: Math.max(10, appState.pet.hp - decay), // Never go below 10 HP
            });
        }
        // Update visit timestamp and recalculate HP based on current repo health
        appState.pet = (0, persistence_js_1.updateState)({
            lastVisit: new Date().toISOString(),
            hp: (0, scoring_js_1.calculateHP)(health),
        });
        // Generate welcome back message based on time away
        const hoursSince = (0, persistence_js_1.getHoursSinceLastVisit)(appState.pet);
        if (hoursSince > 24) {
            // Been away more than a day - longer welcome back
            appState.customMessage = (0, dialogue_js_1.getContextMessage)('welcomeBack', 'long');
        }
        else if (hoursSince < 1) {
            // Just left - quick welcome
            appState.customMessage = (0, dialogue_js_1.getContextMessage)('welcomeBack', 'short');
        }
    }
    // -------------------------------------------------------------------------
    // Reset Daily Counters If New Day
    // -------------------------------------------------------------------------
    appState.pet = (0, persistence_js_2.checkAndResetDailyCounters)(appState.pet);
    // Initialize daily challenge for today
    const dailyChallenge = (0, challenges_js_1.getDailyChallenge)(appState.pet);
    appState.pet = (0, persistence_js_1.updateState)({ dailyChallenge });
    // -------------------------------------------------------------------------
    // Initial Mood Setup
    // -------------------------------------------------------------------------
    updateMood();
    // Set default message if none was set
    if (!appState.customMessage) {
        appState.customMessage = (0, dialogue_js_1.getMessage)(appState.mood);
    }
    // -------------------------------------------------------------------------
    // Keyboard Input Setup
    // -------------------------------------------------------------------------
    // Enable raw mode for character-by-character input
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    // Handle keyboard input
    process.stdin.on('data', async (key) => {
        if (key === '\x03') {
            // Ctrl+C - immediate quit
            await handleQuit();
        }
        else {
            // Handle other keys
            await handleKeypress(key);
            // Only restart renderer if we're on main screen (not an overlay)
            // The renderer.start() now checks if already running, preventing double-starts
            if (appState.currentScreen === 'main' && appState.isRunning) {
                renderer_js_1.renderer.start(getRenderState);
            }
        }
    });
    // -------------------------------------------------------------------------
    // Process Signal Handling
    // -------------------------------------------------------------------------
    // Handle SIGINT (Ctrl+C from terminal)
    process.on('SIGINT', async () => {
        await handleQuit();
    });
    // Handle SIGTERM (termination signal)
    process.on('SIGTERM', async () => {
        await handleQuit();
    });
    // -------------------------------------------------------------------------
    // Periodic Mood Updates
    // -------------------------------------------------------------------------
    // Update mood every 5 seconds to handle idle state transitions
    setInterval(() => {
        if (appState.currentScreen === 'main') {
            updateMood();
        }
    }, 5000);
    // -------------------------------------------------------------------------
    // Periodic Challenge Checks
    // -------------------------------------------------------------------------
    // Check daily challenge progress every 30 seconds
    setInterval(() => {
        if (appState.currentScreen === 'main') {
            checkDailyChallengeProgress();
        }
    }, 30000);
    // -------------------------------------------------------------------------
    // Start Renderer
    // -------------------------------------------------------------------------
    appState.currentScreen = 'main'; // Ensure we're on main screen
    // Re-ensure stdin is in raw mode (animation might have changed it)
    if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
        process.stdin.resume();
    }
    clearScreen();
    renderer_js_1.renderer.start(getRenderState);
}
// =============================================================================
// APPLICATION STARTUP
// =============================================================================
/**
 * Start the application.
 * Catch and display any fatal errors that occur during startup.
 */
main().catch((err) => {
    console.error('GitBuddy crashed:', err);
    showCursor(); // Restore cursor on crash
    process.exit(1);
});
//# sourceMappingURL=index.js.map