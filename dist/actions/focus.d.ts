/**
 * =============================================================================
 * FOCUS.TS - Pomodoro Timer / Focus Mode
 * =============================================================================
 *
 * A productivity timer that tracks commits and changes during focus sessions.
 */
export interface FocusSession {
    duration: number;
    startTime: Date;
    startSnapshot: RepoSnapshot;
    isPaused: boolean;
    pausedAt?: Date;
    totalPausedTime: number;
}
interface RepoSnapshot {
    uncommittedFiles: number;
    lastCommitHash: string;
    totalCommits: number;
}
export interface FocusResult {
    duration: number;
    commits: number;
    filesChanged: number;
    linesAdded: number;
    linesRemoved: number;
}
/**
 * Takes a snapshot of the current repo state.
 */
export declare function takeRepoSnapshot(): RepoSnapshot;
/**
 * Compares two snapshots to get session stats.
 */
export declare function compareSnapshots(start: RepoSnapshot, end: RepoSnapshot): FocusResult;
/**
 * Starts a new focus session.
 */
export declare function startFocusSession(durationMinutes: number): FocusSession;
/**
 * Gets the current focus session.
 */
export declare function getCurrentSession(): FocusSession | null;
/**
 * Pauses the current session.
 */
export declare function pauseSession(): void;
/**
 * Resumes the current session.
 */
export declare function resumeSession(): void;
/**
 * Ends the current session and returns results.
 */
export declare function endFocusSession(): FocusResult | null;
/**
 * Gets remaining time in the current session.
 */
export declare function getRemainingTime(): {
    minutes: number;
    seconds: number;
    elapsed: number;
    total: number;
};
/**
 * Checks if the session is complete.
 */
export declare function isSessionComplete(): boolean;
/**
 * Gets a focus message based on elapsed time.
 */
export declare function getFocusMessage(elapsedMinutes: number): string;
/**
 * Builds the duration selection screen.
 */
export declare function buildDurationSelectScreen(): string;
/**
 * Builds the focus mode screen.
 */
export declare function buildFocusScreen(session: FocusSession): string;
/**
 * Builds the focus complete screen.
 */
export declare function buildFocusCompleteScreen(result: FocusResult, xpEarned: number): string;
export {};
//# sourceMappingURL=focus.d.ts.map