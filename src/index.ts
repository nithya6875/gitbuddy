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

import { createRequire } from 'module';
import * as readline from 'readline'; // For reading user input during naming
import logUpdate from 'log-update';    // For smooth terminal UI updates
import chalk from 'chalk';              // Terminal string styling

// Import internal modules
import { renderer, type RenderState } from './pet/renderer.js';
import { type Mood, type Level } from './pet/sprites.js';
import { getMessage, getContextMessage } from './pet/dialogue.js';
import { scanRepo, type RepoHealth, type HealthCheck } from './health/scanner.js';
import { calculateMood, calculateHP, calculateLevel, getLevelProgress } from './health/scoring.js';
import {
  loadState,
  saveState,
  createNewPet,
  updateState,
  isFirstRun,
  getHoursSinceLastVisit,
  calculateHPDecay,
  addXP,
  resetState,
  type PetState,
} from './state/persistence.js';
import { buildLayout, buildHelpScreen } from './ui/layout.js';
import {
  buildIntroFrame,
  buildExitFrame,
  buildNamePrompt,
  buildWelcomeMessage,
  buildGoodbyeScreen,
  buildNoGitScreen,
  buildResetScreen,
  getKennelFrameCount,
  getKennelExitFrameCount,
} from './ui/intro.js';
import { findCodeIssues, buildFeedScreen } from './actions/feed.js';
import { buildPlayMenu, buildPlayResult, type PlayAction } from './actions/play.js';
import { buildStatsScreen } from './actions/stats.js';

// New feature imports
import {
  hasStagedChanges,
  analyzeChanges,
  formatCommitMessage,
  executeCommit,
  buildCommitScreen,
  buildNoStagedScreen,
  buildCommitSuccessScreen,
} from './actions/commit.js';
import {
  startFocusSession,
  getCurrentSession,
  pauseSession,
  resumeSession,
  endFocusSession,
  isSessionComplete,
  buildDurationSelectScreen,
  buildFocusScreen,
  buildFocusCompleteScreen,
} from './actions/focus.js';
import {
  checkAchievements,
  getAchievement,
  buildAchievementUnlockedScreen,
  buildAchievementsScreen,
  type RepoData,
} from './actions/achievements.js';
import {
  getDailyChallenge,
  getChallenge,
  checkChallengeProgress,
  buildChallengeCompleteScreen,
  type ChallengeRepoData,
} from './actions/challenges.js';
import { buildHeatmapScreen, getCurrentStreak, getTodayCommits } from './actions/heatmap.js';
import {
  getAvailableTricks,
  getRandomTrick,
  executeTrick,
  buildTrickSelectScreen,
  buildTrickResultScreen,
  buildNoTricksScreen,
} from './actions/tricks.js';
import {
  checkAndResetDailyCounters,
  incrementDailyCounter,
  recordSessionAction,
} from './state/persistence.js';

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
const hideCursor = (): void => {
  if (isTTY) process.stdout.write('\x1B[?25l'); // ANSI escape: hide cursor
};

/**
 * Shows the terminal cursor.
 * Called on exit to restore normal terminal behavior.
 * Only executes if running in a TTY.
 */
const showCursor = (): void => {
  if (isTTY) process.stdout.write('\x1B[?25h'); // ANSI escape: show cursor
};

// =============================================================================
// SCREEN CONTROL
// =============================================================================

/**
 * Clears the entire terminal screen and moves cursor to top-left.
 * Used when transitioning between major screens or on startup.
 * Only executes if running in a TTY.
 */
const clearScreen = (): void => {
  if (isTTY) process.stdout.write('\x1B[2J\x1B[H'); // ANSI: clear screen + home
};

// =============================================================================
// APPLICATION STATE
// =============================================================================

/**
 * AppState Interface
 *
 * Represents the complete state of the running application.
 * This is the central state object that all components reference.
 */
interface AppState {
  pet: PetState;           // The pet's persistent state (saved to disk)
  health: RepoHealth;      // Current repository health scan results
  mood: Mood;              // Current mood (derived from HP and activity)
  isRunning: boolean;      // Whether the app is still running
  currentScreen:
    | 'main' | 'help' | 'feed' | 'play' | 'playMenu' | 'stats' | 'intro' | 'naming' | 'reset'
    | 'commit' | 'commitSuccess' | 'commitEdit'
    | 'focusSelect' | 'focus' | 'focusComplete'
    | 'achievements' | 'achievementUnlock'
    | 'heatmap'
    | 'trickSelect' | 'trickResult';
  lastActivityTime: number; // Timestamp of last user input (for idle detection)
  customMessage?: string;  // Optional override message for the speech bubble
  pendingCommitMessage?: string;  // For commit editing
  pendingAchievements?: string[]; // Queue of achievements to show
  focusUpdateInterval?: ReturnType<typeof setInterval>; // Focus mode timer
}

/**
 * Global application state instance.
 * Initialized with default values, then populated during startup.
 */
let appState: AppState = {
  pet: null as unknown as PetState,     // Will be set during init
  health: null as unknown as RepoHealth, // Will be set during init
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
function getRenderState(): RenderState {
  // Calculate XP progress for the current level
  const levelProgress = getLevelProgress(appState.pet.xp);

  return {
    name: appState.pet.name,
    level: appState.pet.level as Level,
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
function updateMood(): void {
  const idleSeconds = (Date.now() - appState.lastActivityTime) / 1000;
  appState.mood = calculateMood(appState.pet.hp, idleSeconds > 30, idleSeconds);
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
async function handleKeypress(key: string): Promise<void> {
  // Record activity time to keep pet from going idle
  appState.lastActivityTime = Date.now();

  // Clear any custom message when user interacts
  appState.customMessage = undefined;

  // Force main screen if we somehow got into an invalid state
  const validScreens = ['main', 'help', 'feed', 'play', 'playMenu', 'stats', 'reset',
    'commit', 'commitSuccess', 'focusSelect', 'focus', 'focusComplete',
    'achievements', 'achievementUnlock', 'heatmap', 'trickSelect', 'trickResult'];
  if (!validScreens.includes(appState.currentScreen)) {
    appState.currentScreen = 'main';
  }

  // -------------------------------------------------------------------------
  // Overlay Screen Handling (Help, Feed, Stats, Heatmap, Achievements)
  // -------------------------------------------------------------------------
  // These screens dismiss on any key
  if (appState.currentScreen === 'help' || appState.currentScreen === 'feed' ||
      appState.currentScreen === 'stats' || appState.currentScreen === 'heatmap' ||
      appState.currentScreen === 'achievements' || appState.currentScreen === 'trickResult') {
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
      const achievement = getAchievement(nextId!);
      if (achievement) {
        renderer.renderCustom(buildAchievementUnlockedScreen(achievement));
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
      resetState();
      renderer.stop();
      clearScreen();
      console.log('\n  Game reset! Run the app again to start fresh.\n');
      showCursor();
      process.exit(0);
    } else {
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
    } else if (key.toLowerCase() === 'e') {
      // Edit mode (for now, just use suggestion - would need readline for editing)
      await executeCommitAction();
    } else if (key.toLowerCase() === 'b' || key === '\x1b') {
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
    const durations: Record<string, number> = { '1': 15, '2': 25, '3': 45, '4': 60 };
    if (durations[key]) {
      startFocusMode(durations[key]);
    } else if (key.toLowerCase() === 'b' || key === '\x1b') {
      appState.currentScreen = 'main';
    }
    return;
  }

  // -------------------------------------------------------------------------
  // Focus Mode Handling
  // -------------------------------------------------------------------------
  if (appState.currentScreen === 'focus') {
    const session = getCurrentSession();
    if (!session) {
      appState.currentScreen = 'main';
      return;
    }

    if (key === ' ') {
      // Toggle pause
      if (session.isPaused) {
        resumeSession();
      } else {
        pauseSession();
      }
    } else if (key.toLowerCase() === 'x') {
      // End early
      await endFocusMode();
    } else if (key.toLowerCase() === 'b' && session.isPaused) {
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
    const available = getAvailableTricks(appState.pet.level);
    const keyNum = parseInt(key);

    if (keyNum >= 1 && keyNum <= available.length) {
      await handleTrick(available[keyNum - 1]);
    } else if (key.toLowerCase() === 'r') {
      await handleTrick(getRandomTrick(appState.pet.level));
    } else if (key.toLowerCase() === 'b' || key === '\x1b') {
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
    } else if (key === '2') {
      await handlePlayAction('fetch');
    } else if (key === '3') {
      await handlePlayAction('belly');
    } else if (key === '\x1b' || key === 'escape' || key === '\r') {
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
        // Play action / Smart Tricks - requires level 2
        if (appState.pet.level >= 2) {
          appState.currentScreen = 'trickSelect';
          renderer.stop();
          renderer.renderCustom(buildTrickSelectScreen(appState.pet));
        } else {
          appState.customMessage = '*whine* I need to reach level 2 first!';
        }
        break;

      case 's':
        // Stats/Heatmap action
        renderer.stop();
        appState.currentScreen = 'heatmap';
        renderer.renderCustom(buildHeatmapScreen(appState.pet));
        break;

      case 'c':
        // Smart commit action
        await handleSmartCommit();
        break;

      case 't':
        // Focus/Pomodoro mode
        appState.currentScreen = 'focusSelect';
        renderer.stop();
        renderer.renderCustom(buildDurationSelectScreen());
        break;

      case 'a':
        // Achievements screen
        appState.currentScreen = 'achievements';
        renderer.stop();
        renderer.renderCustom(buildAchievementsScreen(appState.pet));
        break;

      case 'h':
        // Show help screen
        appState.currentScreen = 'help';
        renderer.stop();
        renderer.renderCustom(buildHelpScreen());
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
        renderer.stop();
        renderer.renderCustom(buildResetScreen());
        break;
    }
  } catch (err) {
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
async function handleFeed(): Promise<void> {
  // Update mood to eating state
  appState.mood = 'eating';
  appState.customMessage = '*sniff sniff* Looking for issues...';

  // Stop the main renderer while showing feed screen
  renderer.stop();

  // Scan for code issues
  const result = await findCodeIssues();

  // Award XP from feed
  const { newState, leveledUp } = addXP(appState.pet, result.xpGained);
  appState.pet = newState;

  // Increment feed counter
  appState.pet = updateState({ totalFeeds: appState.pet.totalFeeds + 1 });

  // Check for level up
  if (leveledUp) {
    appState.customMessage = '*HOWLS WITH JOY* I LEVELED UP!!!';
    appState.mood = 'excited';
  } else {
    appState.mood = 'happy';
  }

  // Show feed results screen
  appState.currentScreen = 'feed';
  renderer.renderCustom(buildFeedScreen(result));
}

/**
 * Handles a specific play action (trick, fetch, or belly rubs).
 *
 * @param action - The play action to perform
 */
async function handlePlayAction(action: PlayAction): Promise<void> {
  // Update mood to playing state
  appState.mood = 'playing';

  // Stop the main renderer while showing play screen
  renderer.stop();

  // Build the play result screen (includes animation for fetch)
  const { screen, xp } = await buildPlayResult(action);

  // Award XP from play
  const { newState, leveledUp } = addXP(appState.pet, xp);
  appState.pet = newState;

  // Increment play counter
  appState.pet = updateState({ totalPlays: appState.pet.totalPlays + 1 });

  // Check for level up
  if (leveledUp) {
    appState.customMessage = '*HOWLS WITH JOY* I LEVELED UP!!!';
    appState.mood = 'excited';
  } else {
    appState.mood = 'happy';
  }

  // Show play results screen
  appState.currentScreen = 'play';
  renderer.renderCustom(screen);
}

/**
 * Handles the Stats action.
 * Displays comprehensive statistics about the pet and repository.
 */
function handleStats(): void {
  appState.currentScreen = 'stats';

  // Stop the main renderer while showing stats
  renderer.stop();

  // Build and display stats screen
  const statsScreen = buildStatsScreen({
    state: appState.pet,
    health: appState.health,
  });

  renderer.renderCustom(statsScreen);
}

// =============================================================================
// NEW FEATURE HANDLERS
// =============================================================================

/**
 * Handles the Smart Commit action [C].
 * Analyzes staged changes and suggests a commit message.
 */
async function handleSmartCommit(): Promise<void> {
  renderer.stop();

  if (!hasStagedChanges()) {
    appState.currentScreen = 'commit';
    renderer.renderCustom(buildNoStagedScreen());
    return;
  }

  const suggestion = analyzeChanges();
  appState.pendingCommitMessage = formatCommitMessage(suggestion);

  appState.currentScreen = 'commit';
  renderer.renderCustom(buildCommitScreen(suggestion));
}

/**
 * Executes the pending commit.
 */
async function executeCommitAction(): Promise<void> {
  if (!appState.pendingCommitMessage) {
    appState.currentScreen = 'main';
    return;
  }

  const result = executeCommit(appState.pendingCommitMessage);

  if (result.success) {
    // Award XP for commit
    const { newState, leveledUp } = addXP(appState.pet, 15);
    appState.pet = newState;

    // Track smart commit
    appState.pet = updateState({
      totalSmartCommits: appState.pet.totalSmartCommits + 1,
    });
    appState.pet = incrementDailyCounter(appState.pet, 'smartCommits');
    appState.pet = recordSessionAction(appState.pet, 'commit');

    if (leveledUp) {
      appState.customMessage = '*HOWLS WITH JOY* I LEVELED UP!!!';
    }

    appState.currentScreen = 'commitSuccess';
    renderer.renderCustom(buildCommitSuccessScreen(appState.pendingCommitMessage));
  } else {
    appState.customMessage = `*whimper* Commit failed: ${result.error}`;
    appState.currentScreen = 'main';
  }

  appState.pendingCommitMessage = undefined;
}

/**
 * Starts focus/pomodoro mode.
 */
function startFocusMode(minutes: number): void {
  startFocusSession(minutes);
  appState.currentScreen = 'focus';
  appState.pet = recordSessionAction(appState.pet, 'focus');

  // Start the focus update interval
  appState.focusUpdateInterval = setInterval(() => {
    if (appState.currentScreen === 'focus') {
      const session = getCurrentSession();
      if (session) {
        if (isSessionComplete()) {
          endFocusMode();
        } else {
          renderer.renderCustom(buildFocusScreen(session));
        }
      }
    }
  }, 1000);

  const session = getCurrentSession()!;
  renderer.renderCustom(buildFocusScreen(session));
}

/**
 * Ends focus mode and shows results.
 */
async function endFocusMode(): Promise<void> {
  // Clear the update interval
  if (appState.focusUpdateInterval) {
    clearInterval(appState.focusUpdateInterval);
    appState.focusUpdateInterval = undefined;
  }

  const result = endFocusSession();
  if (!result) {
    appState.currentScreen = 'main';
    return;
  }

  // Calculate XP based on duration and commits
  const baseXP = Math.floor(result.duration * 2);
  const commitBonus = result.commits * 10;
  const xpEarned = baseXP + commitBonus;

  const { newState, leveledUp } = addXP(appState.pet, xpEarned);
  appState.pet = newState;

  // Update focus session stats
  appState.pet = updateState({
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
  appState.pet = incrementDailyCounter(appState.pet, 'focusSessions');

  if (leveledUp) {
    appState.customMessage = '*HOWLS WITH JOY* I LEVELED UP!!!';
  }

  appState.currentScreen = 'focusComplete';
  renderer.renderCustom(buildFocusCompleteScreen(result, xpEarned));
}

/**
 * Handles a smart dog trick.
 */
async function handleTrick(trick: ReturnType<typeof getRandomTrick>): Promise<void> {
  appState.mood = 'playing';
  appState.pet = recordSessionAction(appState.pet, 'play');

  const result = executeTrick(trick);

  // Award XP for trick
  const xp = result.success ? 15 : 5;
  const { newState, leveledUp } = addXP(appState.pet, xp);
  appState.pet = newState;

  // Increment play counter
  appState.pet = updateState({ totalPlays: appState.pet.totalPlays + 1 });

  if (leveledUp) {
    appState.customMessage = '*HOWLS WITH JOY* I LEVELED UP!!!';
  }

  appState.currentScreen = 'trickResult';
  renderer.renderCustom(buildTrickResultScreen(result, xp));
}

/**
 * Gets repo data for achievements and challenges.
 */
function getRepoDataForAchievements(): RepoData {
  const now = new Date();

  // Extract counts from health check values
  const workingTreeCheck = appState.health.checks.find(c => c.name === 'Working Tree');
  const dirtyFiles = workingTreeCheck?.status === 'great' ? 0 :
    parseInt(workingTreeCheck?.value.match(/\d+/)?.[0] || '0');

  return {
    totalCommits: appState.health.commitCount,
    streak: appState.health.streak,
    commitsToday: getTodayCommits(),
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
async function checkAndShowAchievements(): Promise<void> {
  const repoData = getRepoDataForAchievements();
  const newAchievements = checkAchievements(appState.pet, repoData);

  if (newAchievements.length === 0) return;

  // Grant XP and record achievements
  for (const achievement of newAchievements) {
    if (achievement.xpReward > 0) {
      const { newState } = addXP(appState.pet, achievement.xpReward);
      appState.pet = newState;
    }
    appState.pet = updateState({
      achievements: [...appState.pet.achievements, achievement.id],
    });
  }

  // Show achievement popups
  if (newAchievements.length > 0) {
    appState.pendingAchievements = newAchievements.slice(1).map(a => a.id);
    appState.currentScreen = 'achievementUnlock';
    renderer.stop();
    renderer.renderCustom(buildAchievementUnlockedScreen(newAchievements[0]));
  }
}

/**
 * Checks daily challenge progress.
 */
function checkDailyChallengeProgress(): void {
  // Extract counts from health check values
  const workingTreeCheck = appState.health.checks.find(c => c.name === 'Working Tree');
  const dirtyFiles = workingTreeCheck?.status === 'great' ? 0 :
    parseInt(workingTreeCheck?.value.match(/\d+/)?.[0] || '0');

  const challengeData: ChallengeRepoData = {
    commitsToday: getTodayCommits(),
    streak: getCurrentStreak(),
    dirtyFiles,
    consoleLogs: 0, // Would need separate scan
    todos: 0, // Would need separate scan
  };

  const dailyChallenge = getDailyChallenge(appState.pet);
  const { progress, completed, justCompleted } = checkChallengeProgress(appState.pet, challengeData);

  // Update challenge state
  appState.pet = updateState({
    dailyChallenge: {
      ...dailyChallenge,
      progress,
      completed,
    },
  });

  // Show popup if just completed
  if (justCompleted) {
    const challenge = getChallenge(dailyChallenge.challengeId);
    if (challenge) {
      const { newState } = addXP(appState.pet, challenge.xpReward);
      appState.pet = newState;

      renderer.stop();
      renderer.renderCustom(buildChallengeCompleteScreen(challenge));
    }
  }
}

/**
 * Rescans the repository for health metrics.
 * Called when user presses [R] to refresh data.
 */
async function rescanRepo(): Promise<void> {
  appState.customMessage = '*sniff sniff* Scanning repo...';

  // Perform repository scan
  const health = await scanRepo();
  appState.health = health;

  if (health.isGitRepo) {
    // Update HP based on new health data
    const hp = calculateHP(health);

    // Update state with new values
    appState.pet = updateState({
      hp,
      totalScans: appState.pet.totalScans + 1,
      longestStreak: Math.max(appState.pet.longestStreak, health.streak),
    });

    // Award small XP for scanning
    const { newState } = addXP(appState.pet, 2);
    appState.pet = newState;

    // Update mood based on new HP
    updateMood();

    // Get a fresh message based on current mood
    appState.customMessage = getMessage(appState.mood);
  }
}

/**
 * Handles application quit.
 * Shows exit animation, saves state, and exits cleanly.
 */
async function handleQuit(): Promise<void> {
  // Mark app as no longer running
  appState.isRunning = false;

  // Stop the renderer
  renderer.stop();

  // Show the exit animation (puppy going back into kennel)
  clearScreen();
  await runExitAnimation();

  // Save the current pet state to disk
  saveState(appState.pet);

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
async function runIntroSequence(): Promise<string> {
  clearScreen();
  hideCursor();

  // -------------------------------------------------------------------------
  // Frame 1: Kennel with question marks (mystery)
  // -------------------------------------------------------------------------
  renderer.renderCustom(buildIntroFrame(0));
  await sleep(1500);

  // -------------------------------------------------------------------------
  // Frame 2: Eyes appear in the kennel
  // -------------------------------------------------------------------------
  renderer.renderCustom(buildIntroFrame(1));
  await sleep(1500);

  // -------------------------------------------------------------------------
  // Frame 3: Puppy emerges!
  // -------------------------------------------------------------------------
  renderer.renderCustom(buildIntroFrame(2));
  await sleep(2000);

  // -------------------------------------------------------------------------
  // Name Prompt
  // -------------------------------------------------------------------------
  renderer.renderCustom(buildNamePrompt());
  showCursor(); // Show cursor for text input

  // Get name from user
  const name = await promptForName();
  hideCursor(); // Hide cursor again

  // -------------------------------------------------------------------------
  // Welcome Message
  // -------------------------------------------------------------------------
  renderer.renderCustom(buildWelcomeMessage(name));
  await waitForKeypress();

  // Clear log-update buffer before main game
  renderer.clear();

  return name;
}

/**
 * Runs the startup kennel animation.
 * Shows the puppy emerging from the kennel.
 * This runs every time the app starts.
 */
async function runStartupAnimation(): Promise<void> {
  clearScreen();
  hideCursor();

  const frameCount = getKennelFrameCount();

  // Play each frame of the kennel animation (log-update handles smooth transitions)
  for (let i = 0; i < frameCount; i++) {
    renderer.renderCustom(buildIntroFrame(i));
    await sleep(800); // 800ms per frame
  }

  // Pause briefly on the final frame
  await sleep(500);

  // Clear log-update buffer before main game
  renderer.clear();
}

/**
 * Runs the exit kennel animation.
 * Shows the puppy going back into the kennel.
 */
async function runExitAnimation(): Promise<void> {
  const frameCount = getKennelExitFrameCount();

  // Play each frame of the exit animation
  for (let i = 0; i < frameCount; i++) {
    renderer.renderCustom(buildExitFrame(i));
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
function promptForName(): Promise<string> {
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
function waitForKeypress(): Promise<void> {
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
function sleep(ms: number): Promise<void> {
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
async function main(): Promise<void> {
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
  const health = await scanRepo();

  if (!health.isGitRepo) {
    // Not in a git repository - show error and exit
    console.log(buildNoGitScreen());
    showCursor();
    process.exit(1);
  }

  appState.health = health;

  // -------------------------------------------------------------------------
  // First Run vs Returning User
  // -------------------------------------------------------------------------
  if (isFirstRun()) {
    // First run - show full intro sequence (animation + naming)
    const name = await runIntroSequence();
    appState.pet = createNewPet(name);

    // Set initial HP based on repo health
    appState.pet = updateState({ hp: calculateHP(health) });
  } else {
    // Returning user - load existing pet
    appState.pet = loadState()!;

    // -------------------------------------------------------------------------
    // Startup Animation - Puppy emerges from kennel every time
    // -------------------------------------------------------------------------
    await runStartupAnimation();

    // Apply HP decay if user has been away
    // This encourages regular visits to maintain pet health
    const decay = calculateHPDecay(appState.pet);
    if (decay > 0) {
      appState.pet = updateState({
        hp: Math.max(10, appState.pet.hp - decay), // Never go below 10 HP
      });
    }

    // Update visit timestamp and recalculate HP based on current repo health
    appState.pet = updateState({
      lastVisit: new Date().toISOString(),
      hp: calculateHP(health),
    });

    // Generate welcome back message based on time away
    const hoursSince = getHoursSinceLastVisit(appState.pet);
    if (hoursSince > 24) {
      // Been away more than a day - longer welcome back
      appState.customMessage = getContextMessage('welcomeBack', 'long');
    } else if (hoursSince < 1) {
      // Just left - quick welcome
      appState.customMessage = getContextMessage('welcomeBack', 'short');
    }
  }

  // -------------------------------------------------------------------------
  // Reset Daily Counters If New Day
  // -------------------------------------------------------------------------
  appState.pet = checkAndResetDailyCounters(appState.pet);

  // Initialize daily challenge for today
  const dailyChallenge = getDailyChallenge(appState.pet);
  appState.pet = updateState({ dailyChallenge });

  // -------------------------------------------------------------------------
  // Initial Mood Setup
  // -------------------------------------------------------------------------
  updateMood();

  // Set default message if none was set
  if (!appState.customMessage) {
    appState.customMessage = getMessage(appState.mood);
  }

  // -------------------------------------------------------------------------
  // Keyboard Input Setup
  // -------------------------------------------------------------------------
  // Enable raw mode for character-by-character input
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  // Handle keyboard input
  process.stdin.on('data', async (key: string) => {
    // Show which key was pressed (temporary debug)
    appState.customMessage = `Key: "${key}" Screen: ${appState.currentScreen}`;

    if (key === '\x03') {
      // Ctrl+C - immediate quit
      await handleQuit();
    } else {
      // Handle other keys
      await handleKeypress(key);

      // Restart renderer if we returned to main screen
      if (appState.currentScreen === 'main' && appState.isRunning) {
        renderer.start(getRenderState);
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
  appState.currentScreen = 'main';  // Ensure we're on main screen

  // Re-ensure stdin is in raw mode (animation might have changed it)
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
    process.stdin.resume();
  }

  clearScreen();
  renderer.start(getRenderState);
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
