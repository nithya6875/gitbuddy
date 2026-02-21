"use strict";
/**
 * =============================================================================
 * FOCUS.TS - Pomodoro Timer / Focus Mode
 * =============================================================================
 *
 * A productivity timer that tracks commits and changes during focus sessions.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.takeRepoSnapshot = takeRepoSnapshot;
exports.compareSnapshots = compareSnapshots;
exports.startFocusSession = startFocusSession;
exports.getCurrentSession = getCurrentSession;
exports.pauseSession = pauseSession;
exports.resumeSession = resumeSession;
exports.endFocusSession = endFocusSession;
exports.getRemainingTime = getRemainingTime;
exports.isSessionComplete = isSessionComplete;
exports.getFocusMessage = getFocusMessage;
exports.buildDurationSelectScreen = buildDurationSelectScreen;
exports.buildFocusScreen = buildFocusScreen;
exports.buildFocusCompleteScreen = buildFocusCompleteScreen;
const child_process_1 = require("child_process");
const chalk_1 = __importDefault(require("chalk"));
const colors_js_1 = require("../ui/colors.js");
// =============================================================================
// REPO SNAPSHOT
// =============================================================================
/**
 * Takes a snapshot of the current repo state.
 */
function takeRepoSnapshot() {
    let uncommittedFiles = 0;
    let lastCommitHash = '';
    let totalCommits = 0;
    try {
        const status = (0, child_process_1.execSync)('git status --porcelain', { encoding: 'utf-8', timeout: 5000 });
        uncommittedFiles = status.trim().split('\n').filter(Boolean).length;
    }
    catch { }
    try {
        lastCommitHash = (0, child_process_1.execSync)('git rev-parse HEAD', { encoding: 'utf-8', timeout: 5000 }).trim();
    }
    catch { }
    try {
        const log = (0, child_process_1.execSync)('git rev-list --count HEAD', { encoding: 'utf-8', timeout: 5000 });
        totalCommits = parseInt(log.trim()) || 0;
    }
    catch { }
    return { uncommittedFiles, lastCommitHash, totalCommits };
}
/**
 * Compares two snapshots to get session stats.
 */
function compareSnapshots(start, end) {
    const commits = end.totalCommits - start.totalCommits;
    let filesChanged = 0;
    let linesAdded = 0;
    let linesRemoved = 0;
    // Get diff stats since start commit
    if (start.lastCommitHash && commits > 0) {
        try {
            const diffStat = (0, child_process_1.execSync)(`git diff --stat ${start.lastCommitHash}..HEAD`, {
                encoding: 'utf-8',
                timeout: 5000,
            });
            const lines = diffStat.split('\n');
            for (const line of lines) {
                const match = line.match(/(\d+) insertions?\(\+\)/);
                const delMatch = line.match(/(\d+) deletions?\(-\)/);
                if (match)
                    linesAdded += parseInt(match[1]);
                if (delMatch)
                    linesRemoved += parseInt(delMatch[1]);
            }
            filesChanged = lines.filter(l => l.includes('|')).length;
        }
        catch { }
    }
    return {
        duration: 0, // Will be set by caller
        commits,
        filesChanged,
        linesAdded,
        linesRemoved,
    };
}
// =============================================================================
// FOCUS SESSION
// =============================================================================
let currentSession = null;
/**
 * Starts a new focus session.
 */
function startFocusSession(durationMinutes) {
    currentSession = {
        duration: durationMinutes,
        startTime: new Date(),
        startSnapshot: takeRepoSnapshot(),
        isPaused: false,
        totalPausedTime: 0,
    };
    return currentSession;
}
/**
 * Gets the current focus session.
 */
function getCurrentSession() {
    return currentSession;
}
/**
 * Pauses the current session.
 */
function pauseSession() {
    if (currentSession && !currentSession.isPaused) {
        currentSession.isPaused = true;
        currentSession.pausedAt = new Date();
    }
}
/**
 * Resumes the current session.
 */
function resumeSession() {
    if (currentSession && currentSession.isPaused && currentSession.pausedAt) {
        currentSession.totalPausedTime += Date.now() - currentSession.pausedAt.getTime();
        currentSession.isPaused = false;
        currentSession.pausedAt = undefined;
    }
}
/**
 * Ends the current session and returns results.
 */
function endFocusSession() {
    if (!currentSession)
        return null;
    const endSnapshot = takeRepoSnapshot();
    const result = compareSnapshots(currentSession.startSnapshot, endSnapshot);
    // Calculate actual duration
    let elapsed = Date.now() - currentSession.startTime.getTime();
    if (currentSession.isPaused && currentSession.pausedAt) {
        elapsed -= (Date.now() - currentSession.pausedAt.getTime());
    }
    elapsed -= currentSession.totalPausedTime;
    result.duration = Math.floor(elapsed / 60000); // Convert to minutes
    currentSession = null;
    return result;
}
/**
 * Gets remaining time in the current session.
 */
function getRemainingTime() {
    if (!currentSession)
        return { minutes: 0, seconds: 0, elapsed: 0, total: 0 };
    let elapsed = Date.now() - currentSession.startTime.getTime();
    // Account for paused time
    if (currentSession.isPaused && currentSession.pausedAt) {
        elapsed -= (Date.now() - currentSession.pausedAt.getTime());
    }
    elapsed -= currentSession.totalPausedTime;
    const totalMs = currentSession.duration * 60 * 1000;
    const remainingMs = Math.max(0, totalMs - elapsed);
    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);
    return {
        minutes,
        seconds,
        elapsed: Math.floor(elapsed / 1000),
        total: currentSession.duration * 60,
    };
}
/**
 * Checks if the session is complete.
 */
function isSessionComplete() {
    const { minutes, seconds } = getRemainingTime();
    return minutes === 0 && seconds === 0;
}
// =============================================================================
// FOCUS MESSAGES
// =============================================================================
const FOCUS_MESSAGES = [
    "*quiet panting* You've been focused. Great start!",
    "*settles down* You're in the zone.",
    "*soft tail wag* Keep it up!",
    "*perks ears* You're doing great!",
    "*focused stare* I believe in you!",
    "*gentle nod* Stay focused, friend.",
    "*watches proudly* You're amazing!",
];
/**
 * Gets a focus message based on elapsed time.
 */
function getFocusMessage(elapsedMinutes) {
    const index = Math.floor(elapsedMinutes / 5) % FOCUS_MESSAGES.length;
    return FOCUS_MESSAGES[index];
}
// =============================================================================
// UI BUILDERS
// =============================================================================
/**
 * Builds the duration selection screen.
 */
function buildDurationSelectScreen() {
    const width = 50;
    const lines = [];
    lines.push(colors_js_1.colors.frame(`╭${'─'.repeat(width - 2)}╮`));
    lines.push(colors_js_1.colors.frame('│') + chalk_1.default.bold.yellow('  🍅 Focus Mode') + ' '.repeat(width - 18) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // Calm puppy
    const puppy = [
        '         ∧＿∧    ',
        '        (◕ᴥ◕)   ',
        '       ╭─∪─∪─╮  ',
        '       │ ▒▒▒ │  ',
        '       ╰─────╯  ',
        '        ││ ││   ',
    ];
    for (const line of puppy) {
        const padding = Math.floor((width - 2 - line.length) / 2);
        lines.push(colors_js_1.colors.frame('│') + ' '.repeat(padding) + colors_js_1.colors.dogBody(line) + ' '.repeat(width - 2 - padding - line.length) + colors_js_1.colors.frame('│'));
    }
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + '  Choose focus duration:' + ' '.repeat(width - 27) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + `  ${chalk_1.default.bold('[1]')} 15 minutes` + ' '.repeat(width - 19) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + `  ${chalk_1.default.bold('[2]')} 25 minutes (recommended)` + ' '.repeat(width - 33) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + `  ${chalk_1.default.bold('[3]')} 45 minutes` + ' '.repeat(width - 19) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + `  ${chalk_1.default.bold('[4]')} 60 minutes` + ' '.repeat(width - 19) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + colors_js_1.colors.textDim('  Press 1-4 or [B] to go back') + ' '.repeat(width - 33) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame(`╰${'─'.repeat(width - 2)}╯`));
    return lines.join('\n');
}
/**
 * Builds the focus mode screen.
 */
function buildFocusScreen(session) {
    const width = 55;
    const lines = [];
    const time = getRemainingTime();
    const percent = Math.floor((time.elapsed / time.total) * 100);
    lines.push(colors_js_1.colors.frame(`╭${'─'.repeat(width - 2)}╮`));
    lines.push(colors_js_1.colors.frame('│') + chalk_1.default.bold.yellow('  🍅 Focus Mode') + ' '.repeat(width - 18) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // Timer display
    const timeStr = `${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`;
    const timerLine = session.isPaused ? `⏸️  PAUSED — ${timeStr} remaining` : `🍅 ${timeStr} remaining`;
    const timerPadding = Math.floor((width - 2 - timerLine.length) / 2);
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(timerPadding) + chalk_1.default.bold(timerLine) + ' '.repeat(width - 2 - timerPadding - timerLine.length) + colors_js_1.colors.frame('│'));
    // Progress bar
    const bar = (0, colors_js_1.progressBar)(percent, 100, 30, 'xp');
    const barLine = `${bar}  ${percent}%`;
    const barPadding = Math.floor((width - 2 - 36) / 2);
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(barPadding) + barLine + ' '.repeat(width - 2 - barPadding - 36) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // Focused puppy
    const puppy = session.isPaused ? [
        '         ∧＿∧    ',
        '        (─ᴥ─)   ',
        '       ╭─∪─∪─╮  ',
        '       │ ░░░ │  ',
        '       ╰─────╯  ',
        '        ││ ││   ',
    ] : [
        '         ∧＿∧    ',
        '        (◕ᴥ◕)   ',
        '       ╭─∪─∪─╮  ',
        '       │ ▒▒▒ │  ',
        '       ╰─────╯  ',
        '        ││ ││   ',
    ];
    for (const line of puppy) {
        const padding = Math.floor((width - 2 - line.length) / 2);
        lines.push(colors_js_1.colors.frame('│') + ' '.repeat(padding) + colors_js_1.colors.dogBody(line) + ' '.repeat(width - 2 - padding - line.length) + colors_js_1.colors.frame('│'));
    }
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // Live stats
    const currentSnapshot = takeRepoSnapshot();
    const commits = currentSnapshot.totalCommits - session.startSnapshot.totalCommits;
    lines.push(colors_js_1.colors.frame('│') + '  Session stats:' + ' '.repeat(width - 19) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + `    Commits: ${commits}` + ' '.repeat(width - 17 - String(commits).length) + colors_js_1.colors.frame('│'));
    const elapsedMin = Math.floor(time.elapsed / 60);
    lines.push(colors_js_1.colors.frame('│') + `    Time focused: ${elapsedMin}m ${time.elapsed % 60}s` + ' '.repeat(width - 26 - String(elapsedMin).length - String(time.elapsed % 60).length) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // Dog message
    const msg = getFocusMessage(elapsedMin);
    lines.push(colors_js_1.colors.frame('│') + colors_js_1.colors.happy(`  💬 "${msg}"`) + ' '.repeat(Math.max(0, width - 8 - msg.length)) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    const controls = session.isPaused
        ? `  ${chalk_1.default.bold('[Space]')} Resume  ${chalk_1.default.bold('[X]')} End  ${chalk_1.default.bold('[B]')} Back`
        : `  ${chalk_1.default.bold('[Space]')} Pause  ${chalk_1.default.bold('[X]')} End early`;
    lines.push(colors_js_1.colors.frame('│') + controls + ' '.repeat(Math.max(0, width - 2 - controls.length + 20)) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame(`╰${'─'.repeat(width - 2)}╯`));
    return lines.join('\n');
}
/**
 * Builds the focus complete screen.
 */
function buildFocusCompleteScreen(result, xpEarned) {
    const width = 55;
    const lines = [];
    lines.push(colors_js_1.colors.frame(`╭${'─'.repeat(width - 2)}╮`));
    lines.push(colors_js_1.colors.frame('│') + chalk_1.default.bold.green('  🎉 Focus Session Complete!') + ' '.repeat(width - 31) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // Excited puppy
    const puppy = [
        '    ★    ∧＿∧  ★ ',
        '   ♥    (ᵔᴥᵔ)   ',
        '       ╭─∪─∪─╮  ',
        '       │ ▒▒▒ │∼ ',
        '       ╰─────╯  ',
        '       ╱╲ ╱╲    ',
    ];
    for (const line of puppy) {
        const padding = Math.floor((width - 2 - line.length) / 2);
        lines.push(colors_js_1.colors.frame('│') + ' '.repeat(padding) + colors_js_1.colors.dogBody(line) + ' '.repeat(width - 2 - padding - line.length) + colors_js_1.colors.frame('│'));
    }
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // Stats
    lines.push(colors_js_1.colors.frame('│') + `  ⏱️  Duration: ${result.duration} minutes` + ' '.repeat(width - 26 - String(result.duration).length) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + `  📝 Commits made: ${result.commits}` + ' '.repeat(width - 24 - String(result.commits).length) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + `  📁 Files changed: ${result.filesChanged}` + ' '.repeat(width - 25 - String(result.filesChanged).length) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + `  ➕ Lines added: ${result.linesAdded}` + ' '.repeat(width - 23 - String(result.linesAdded).length) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + `  ➖ Lines removed: ${result.linesRemoved}` + ' '.repeat(width - 25 - String(result.linesRemoved).length) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // XP and message
    const msg = result.commits > 0
        ? `*excited bark* ${result.commits} commits! You're a coding machine!`
        : `*happy pant* Great focus session!`;
    lines.push(colors_js_1.colors.frame('│') + colors_js_1.colors.happy(`  💬 "${msg}"`) + ' '.repeat(Math.max(0, width - 8 - msg.length)) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + colors_js_1.colors.xpFilled(`  +${xpEarned} XP earned!`) + ' '.repeat(width - 20 - String(xpEarned).length) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + colors_js_1.colors.textDim('  Press any key to continue...') + ' '.repeat(width - 34) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame(`╰${'─'.repeat(width - 2)}╯`));
    return lines.join('\n');
}
//# sourceMappingURL=focus.js.map