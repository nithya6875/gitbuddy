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
/**
 * Complete state object for a GitBuddy pet.
 * This interface defines all data that persists between sessions.
 */
export interface PetState {
    name: string;
    xp: number;
    level: number;
    hp: number;
    lastVisit: string;
    totalFeeds: number;
    totalPlays: number;
    longestStreak: number;
    createdAt: string;
    totalScans: number;
    achievements: string[];
    focusSessions: {
        total: number;
        totalMinutes: number;
        bestSession: {
            commits: number;
            lines: number;
            date: string;
        } | null;
        todaySessions: number;
        lastSessionDate: string;
    };
    dailyChallenge: {
        date: string;
        challengeId: string;
        completed: boolean;
        progress: number;
    } | null;
    dailyCounters: {
        date: string;
        feeds: number;
        plays: number;
        focusSessions: number;
        smartCommits: number;
        todosFixed: number;
        commits: number;
    };
    totalSmartCommits: number;
    cleanTreeCount: number;
    actionsThisSession: string[];
}
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
export declare function loadState(): PetState | null;
/**
 * Saves the pet state to disk as JSON.
 * The state is pretty-printed with 2-space indentation for readability.
 *
 * @param state - The complete PetState object to save
 *
 * @example
 * saveState({ ...currentState, xp: currentState.xp + 10 });
 */
export declare function saveState(state: PetState): void;
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
export declare function createNewPet(name: string): PetState;
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
export declare function updateState(updates: Partial<PetState>): PetState;
/**
 * Checks if this is the first time GitBuddy is being run.
 * Returns true if no state file exists (meaning no pet has been created yet).
 *
 * Used to determine whether to show the intro/naming sequence or
 * welcome the user back to their existing pet.
 *
 * @returns true if this is a first run, false if a pet already exists
 */
export declare function isFirstRun(): boolean;
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
export declare function getHoursSinceLastVisit(state: PetState): number;
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
export declare function calculateHPDecay(state: PetState): number;
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
export declare function addXP(state: PetState, amount: number): {
    newState: PetState;
    leveledUp: boolean;
};
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
export declare function addAchievement(state: PetState, achievement: string): PetState;
/**
 * Deletes the saved state file, effectively resetting the game.
 * The next run will trigger the first-run intro sequence.
 *
 * @returns true if reset was successful, false otherwise
 */
export declare function resetState(): boolean;
/**
 * Checks if daily counters need to be reset (new day).
 * Call this on app launch to reset daily tracking.
 * Also migrates old state to include new fields.
 */
export declare function checkAndResetDailyCounters(state: PetState): PetState;
/**
 * Increments a daily counter.
 */
export declare function incrementDailyCounter(state: PetState, counter: keyof PetState['dailyCounters']): PetState;
/**
 * Records an action for this session (for achievements).
 */
export declare function recordSessionAction(state: PetState, action: string): PetState;
//# sourceMappingURL=persistence.d.ts.map