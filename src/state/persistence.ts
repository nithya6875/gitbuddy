/**
 * =============================================================================
 * PERSISTENCE.TS - Pet State Storage and Management
 * =============================================================================
 *
 * This file handles all persistent data storage for the GitBuddy pet.
 * The pet's state (name, XP, level, HP, etc.) is saved to a JSON file
 * in the user's home directory (~/.gitbuddy/state.json).
 *
 * Key Features:
 * - Save/load pet state to/from disk
 * - Create new pets with default values
 * - Track pet statistics (feeds, plays, streaks)
 * - Calculate HP decay when user is away
 * - Handle XP gains and level-ups
 * - Achievement tracking system
 *
 * Data Location: ~/.gitbuddy/state.json
 */

import * as fs from 'fs';       // Node.js file system module for reading/writing files
import * as path from 'path';   // Node.js path module for handling file paths
import * as os from 'os';       // Node.js OS module for getting home directory

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================
/**
 * Complete state object for a GitBuddy pet.
 * This interface defines all data that persists between sessions.
 */
export interface PetState {
  name: string;           // User-chosen name for the pet
  xp: number;             // Experience points (determines level)
  level: number;          // Current evolution level (1-5)
  hp: number;             // Health points (0-100, based on repo health)
  lastVisit: string;      // ISO timestamp of last time user ran GitBuddy
  totalFeeds: number;     // Total number of times user used Feed action
  totalPlays: number;     // Total number of times user used Play action
  longestStreak: number;  // Longest commit streak ever achieved
  createdAt: string;      // ISO timestamp when pet was first created
  totalScans: number;     // Total number of repo health scans performed
  achievements: string[]; // List of unlocked achievement IDs

  // Focus/Pomodoro tracking
  focusSessions: {
    total: number;
    totalMinutes: number;
    bestSession: { commits: number; lines: number; date: string } | null;
    todaySessions: number;
    lastSessionDate: string;
  };

  // Daily challenge tracking
  dailyChallenge: {
    date: string;
    challengeId: string;
    completed: boolean;
    progress: number;
  } | null;

  // Daily counters (reset each day)
  dailyCounters: {
    date: string;
    feeds: number;
    plays: number;
    focusSessions: number;
    smartCommits: number;
    todosFixed: number;
    commits: number;
  };

  // Smart commit tracking
  totalSmartCommits: number;

  // Clean tree tracking
  cleanTreeCount: number;

  // Actions this session (for achievements)
  actionsThisSession: string[];
}

// =============================================================================
// FILE PATH CONSTANTS
// =============================================================================
/**
 * Directory where GitBuddy stores its state file.
 * Located in user's home directory: ~/.gitbuddy/
 * os.homedir() returns the user's home directory path
 */
const STATE_DIR = path.join(os.homedir(), '.gitbuddy');

/**
 * Full path to the state JSON file: ~/.gitbuddy/state.json
 */
const STATE_FILE = path.join(STATE_DIR, 'state.json');

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================
/**
 * Ensures the state directory exists before trying to read/write files.
 * Creates the ~/.gitbuddy/ directory if it doesn't already exist.
 *
 * The { recursive: true } option means it will create parent directories
 * if needed and won't error if the directory already exists.
 */
function ensureStateDir(): void {
  if (!fs.existsSync(STATE_DIR)) {
    fs.mkdirSync(STATE_DIR, { recursive: true });
  }
}

/**
 * Creates and returns a default state object for a new pet.
 * This is used when creating a new pet or when state is corrupted.
 *
 * @returns A fresh PetState object with initial values
 */
function getDefaultState(): PetState {
  const today = new Date().toISOString().split('T')[0];
  return {
    name: '',                               // Name will be set during intro
    xp: 0,                                  // Start with no XP
    level: 1,                               // Start at level 1 (Puppy)
    hp: 50,                                 // Start at 50% health
    lastVisit: new Date().toISOString(),   // Current time as ISO string
    totalFeeds: 0,                          // No actions taken yet
    totalPlays: 0,                          // No actions taken yet
    longestStreak: 0,                       // No streak yet
    createdAt: new Date().toISOString(),   // Birth time of the pet
    totalScans: 0,                          // No scans yet
    achievements: [],                       // No achievements unlocked yet

    // Focus/Pomodoro tracking
    focusSessions: {
      total: 0,
      totalMinutes: 0,
      bestSession: null,
      todaySessions: 0,
      lastSessionDate: today,
    },

    // Daily challenge tracking
    dailyChallenge: null,

    // Daily counters
    dailyCounters: {
      date: today,
      feeds: 0,
      plays: 0,
      focusSessions: 0,
      smartCommits: 0,
      todosFixed: 0,
      commits: 0,
    },

    // Smart commit tracking
    totalSmartCommits: 0,

    // Clean tree tracking
    cleanTreeCount: 0,

    // Actions this session
    actionsThisSession: [],
  };
}

// =============================================================================
// STATE LOAD/SAVE FUNCTIONS
// =============================================================================
/**
 * Loads the pet state from disk.
 * Reads and parses the JSON state file if it exists.
 *
 * @returns The loaded PetState object, or null if no state file exists
 *
 * @example
 * const state = loadState();
 * if (state) {
 *   console.log(`Welcome back, ${state.name}!`);
 * }
 */
export function loadState(): PetState | null {
  try {
    // Ensure the directory exists before trying to read
    ensureStateDir();

    // Check if state file exists
    if (fs.existsSync(STATE_FILE)) {
      // Read file contents as UTF-8 string
      const data = fs.readFileSync(STATE_FILE, 'utf-8');

      // Parse JSON string into PetState object and return
      return JSON.parse(data) as PetState;
    }

    // No state file found - this is a first run
    return null;
  } catch (error) {
    // Log error but don't crash - return null to trigger first-run flow
    console.error('Failed to load state:', error);
    return null;
  }
}

/**
 * Saves the pet state to disk as JSON.
 * The state is pretty-printed with 2-space indentation for readability.
 *
 * @param state - The complete PetState object to save
 *
 * @example
 * saveState({ ...currentState, xp: currentState.xp + 10 });
 */
export function saveState(state: PetState): void {
  try {
    // Ensure the directory exists before trying to write
    ensureStateDir();

    // Convert state object to pretty-printed JSON and write to file
    // null, 2 means: no replacer function, 2-space indentation
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (error) {
    // Log error but don't crash - the app can continue without saving
    console.error('Failed to save state:', error);
  }
}

// =============================================================================
// PET CREATION AND UPDATE FUNCTIONS
// =============================================================================
/**
 * Creates a new pet with the given name.
 * Used during first-run when user names their new companion.
 *
 * @param name - The name the user chose for their pet
 * @returns The newly created PetState object (already saved to disk)
 *
 * @example
 * const pet = createNewPet('Buddy');
 * console.log(`${pet.name} was born!`);
 */
export function createNewPet(name: string): PetState {
  // Get default state template
  const state = getDefaultState();

  // Set the user-chosen name
  state.name = name;

  // Immediately save to disk so the pet persists
  saveState(state);

  return state;
}

/**
 * Updates the current pet state with new values.
 * Merges the provided partial state with existing state and saves.
 *
 * This is the primary way to modify pet state - it ensures changes
 * are always persisted to disk.
 *
 * @param updates - Partial PetState object with fields to update
 * @returns The updated and saved PetState object
 *
 * @example
 * // Add 10 XP to current state
 * const newState = updateState({ xp: currentState.xp + 10 });
 *
 * // Update multiple fields at once
 * updateState({ hp: 100, totalScans: state.totalScans + 1 });
 */
export function updateState(updates: Partial<PetState>): PetState {
  // Load current state (or use defaults if none exists)
  const currentState = loadState() || getDefaultState();

  // Merge updates into current state using spread operator
  // Updates override current values for any matching keys
  const newState = { ...currentState, ...updates };

  // Persist the merged state to disk
  saveState(newState);

  return newState;
}

// =============================================================================
// STATE CHECK FUNCTIONS
// =============================================================================
/**
 * Checks if this is the first time GitBuddy is being run.
 * Returns true if no state file exists (meaning no pet has been created yet).
 *
 * Used to determine whether to show the intro/naming sequence or
 * welcome the user back to their existing pet.
 *
 * @returns true if this is a first run, false if a pet already exists
 */
export function isFirstRun(): boolean {
  return !fs.existsSync(STATE_FILE);
}

/**
 * Calculates how many hours have passed since the user's last visit.
 * Used to determine welcome back messages and HP decay.
 *
 * @param state - The pet's current state (with lastVisit timestamp)
 * @returns Number of hours since last visit (can be fractional)
 *
 * @example
 * const hours = getHoursSinceLastVisit(state);
 * if (hours > 24) {
 *   console.log("It's been over a day!");
 * }
 */
export function getHoursSinceLastVisit(state: PetState): number {
  // Parse the ISO timestamp string into a Date object
  const lastVisit = new Date(state.lastVisit);

  // Calculate milliseconds elapsed and convert to hours
  // Date.now() returns current time in milliseconds
  // Divide by (1000 * 60 * 60) to convert ms -> seconds -> minutes -> hours
  return (Date.now() - lastVisit.getTime()) / (1000 * 60 * 60);
}

// =============================================================================
// HP DECAY CALCULATION
// =============================================================================
/**
 * Calculates how much HP the pet should lose based on time away.
 * The pet doesn't decay for the first 24 hours (grace period).
 * After that, it loses 5 HP per day, up to a maximum of 30 HP total decay.
 *
 * This encourages users to check in regularly but isn't too punishing.
 *
 * @param state - The pet's current state
 * @returns HP points to subtract (0 to 30)
 *
 * @example
 * const decay = calculateHPDecay(state);
 * if (decay > 0) {
 *   state.hp = Math.max(10, state.hp - decay); // Don't go below 10 HP
 * }
 */
export function calculateHPDecay(state: PetState): number {
  const hoursSince = getHoursSinceLastVisit(state);

  // No decay for first 24 hours - grace period
  if (hoursSince < 24) return 0;

  // Calculate days away after the first day
  // (hoursSince - 24) removes the grace period
  // Math.floor converts to whole days
  const daysAway = Math.floor((hoursSince - 24) / 24);

  // 5 HP decay per day, capped at 30 maximum
  // Math.min ensures we never exceed 30 HP decay
  return Math.min(30, daysAway * 5);
}

// =============================================================================
// XP AND LEVELING FUNCTIONS
// =============================================================================
/**
 * Adds XP to the pet and handles level-up detection.
 * This is the main function for granting experience points.
 *
 * Level thresholds:
 * - Level 1: 0-99 XP (Puppy)
 * - Level 2: 100-299 XP (Young Dog)
 * - Level 3: 300-599 XP (Adult Dog)
 * - Level 4: 600-999 XP (Cool Dog)
 * - Level 5: 1000+ XP (Legendary Doge)
 *
 * @param state - Current pet state
 * @param amount - Amount of XP to add
 * @returns Object containing new state and whether a level-up occurred
 *
 * @example
 * const { newState, leveledUp } = addXP(state, 50);
 * if (leveledUp) {
 *   showLevelUpAnimation();
 * }
 */
export function addXP(state: PetState, amount: number): { newState: PetState; leveledUp: boolean } {
  // Store old level to detect level-up
  const oldLevel = state.level;

  // Calculate new XP total
  const newXP = state.xp + amount;

  // Determine new level based on XP thresholds
  // Check from highest to lowest threshold
  let newLevel = 1;
  if (newXP >= 1000) newLevel = 5;      // Legendary Doge
  else if (newXP >= 600) newLevel = 4;  // Cool Dog
  else if (newXP >= 300) newLevel = 3;  // Adult Dog
  else if (newXP >= 100) newLevel = 2;  // Young Dog
  // else stays at level 1 (Puppy)

  // Update state with new XP and level, save to disk
  const newState = updateState({
    xp: newXP,
    level: newLevel,
  });

  // Return the new state and whether level increased
  return {
    newState,
    leveledUp: newLevel > oldLevel,  // true if we gained at least one level
  };
}

// =============================================================================
// ACHIEVEMENT SYSTEM
// =============================================================================
/**
 * Records an achievement for the pet if not already unlocked.
 * Achievements are unique - calling this with the same achievement
 * multiple times will only record it once.
 *
 * @param state - Current pet state
 * @param achievement - Name/description of the achievement to add
 * @returns Updated pet state (with achievement added if new)
 *
 * @example
 * // Give an achievement for reaching level 5
 * addAchievement(state, 'Reached Legendary status!');
 *
 * // Trying to add the same achievement again does nothing
 * addAchievement(state, 'Reached Legendary status!'); // No change
 */
export function addAchievement(state: PetState, achievement: string): PetState {
  // Only add if this achievement doesn't already exist
  if (!state.achievements.includes(achievement)) {
    // Add to achievements array and save
    return updateState({
      achievements: [...state.achievements, achievement],
    });
  }

  // Achievement already exists, return state unchanged
  return state;
}

// =============================================================================
// RESET FUNCTION
// =============================================================================
/**
 * Deletes the saved state file, effectively resetting the game.
 * The next run will trigger the first-run intro sequence.
 *
 * @returns true if reset was successful, false otherwise
 */
export function resetState(): boolean {
  try {
    if (fs.existsSync(STATE_FILE)) {
      fs.unlinkSync(STATE_FILE);
      return true;
    }
    return true; // Already no state file
  } catch (error) {
    console.error('Failed to reset state:', error);
    return false;
  }
}

/**
 * Checks if daily counters need to be reset (new day).
 * Call this on app launch to reset daily tracking.
 * Also migrates old state to include new fields.
 */
export function checkAndResetDailyCounters(state: PetState): PetState {
  const today = new Date().toISOString().split('T')[0];

  // Initialize missing fields for old save files (migration)
  const dailyCounters = state.dailyCounters || {
    date: today,
    feeds: 0,
    plays: 0,
    focusSessions: 0,
    smartCommits: 0,
    todosFixed: 0,
    commits: 0,
  };

  const focusSessions = state.focusSessions || {
    total: 0,
    totalMinutes: 0,
    bestSession: null,
    todaySessions: 0,
    lastSessionDate: today,
  };

  const actionsThisSession = state.actionsThisSession || [];
  const totalSmartCommits = state.totalSmartCommits || 0;
  const cleanTreeCount = state.cleanTreeCount || 0;

  // Check if we need to reset for a new day OR migrate old state
  if (dailyCounters.date !== today || !state.dailyCounters) {
    // New day or migration - reset counters
    return updateState({
      dailyCounters: {
        date: today,
        feeds: 0,
        plays: 0,
        focusSessions: 0,
        smartCommits: 0,
        todosFixed: 0,
        commits: 0,
      },
      focusSessions: {
        ...focusSessions,
        todaySessions: 0,
        lastSessionDate: today,
      },
      dailyChallenge: null,
      actionsThisSession: [],
      totalSmartCommits,
      cleanTreeCount,
    });
  }

  return state;
}

/**
 * Increments a daily counter.
 */
export function incrementDailyCounter(
  state: PetState,
  counter: keyof PetState['dailyCounters']
): PetState {
  if (counter === 'date') return state;

  // Handle missing dailyCounters (old save file)
  const today = new Date().toISOString().split('T')[0];
  const dailyCounters = state.dailyCounters || {
    date: today,
    feeds: 0,
    plays: 0,
    focusSessions: 0,
    smartCommits: 0,
    todosFixed: 0,
    commits: 0,
  };

  return updateState({
    dailyCounters: {
      ...dailyCounters,
      [counter]: ((dailyCounters[counter] as number) || 0) + 1,
    },
  });
}

/**
 * Records an action for this session (for achievements).
 */
export function recordSessionAction(state: PetState, action: string): PetState {
  // Handle missing actionsThisSession (old save file)
  const actionsThisSession = state.actionsThisSession || [];

  if (actionsThisSession.includes(action)) return state;

  return updateState({
    actionsThisSession: [...actionsThisSession, action],
  });
}
