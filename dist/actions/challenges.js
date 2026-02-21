"use strict";
/**
 * =============================================================================
 * CHALLENGES.TS - Daily Challenge System
 * =============================================================================
 *
 * Each day, GitBuddy gives the user a random challenge to complete.
 * Challenges are shown on the main screen and grant XP when completed.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHALLENGES = void 0;
exports.getDailyChallenge = getDailyChallenge;
exports.getChallenge = getChallenge;
exports.checkChallengeProgress = checkChallengeProgress;
exports.buildChallengeDisplay = buildChallengeDisplay;
exports.buildChallengeCompleteScreen = buildChallengeCompleteScreen;
exports.buildAllChallengesScreen = buildAllChallengesScreen;
const chalk_1 = __importDefault(require("chalk"));
const colors_js_1 = require("../ui/colors.js");
// =============================================================================
// CHALLENGE DEFINITIONS
// =============================================================================
exports.CHALLENGES = [
    // Commit challenges
    {
        id: 'commits_3',
        name: 'Triple Threat',
        description: 'Make 3 commits today',
        goal: 3,
        xpReward: 30,
        icon: '📝',
        tracker: (state, repo) => repo.commitsToday,
    },
    {
        id: 'commits_5',
        name: 'Commit Champion',
        description: 'Make 5 commits today',
        goal: 5,
        xpReward: 50,
        icon: '🏆',
        tracker: (state, repo) => repo.commitsToday,
    },
    // Code cleanup challenges
    {
        id: 'clean_console',
        name: 'Console Cleaner',
        description: 'Remove all console.log statements',
        goal: 0,
        xpReward: 25,
        icon: '🧹',
        tracker: (state, repo) => repo.consoleLogs === 0 ? 1 : 0,
    },
    {
        id: 'fix_todos',
        name: 'Todo Terminator',
        description: 'Fix 3 TODOs in your code',
        goal: 3,
        xpReward: 35,
        icon: '✅',
        tracker: (state) => state.dailyCounters.todosFixed,
    },
    // Focus challenges
    {
        id: 'focus_1',
        name: 'Focus Finder',
        description: 'Complete a focus session',
        goal: 1,
        xpReward: 25,
        icon: '🍅',
        tracker: (state) => state.dailyCounters.focusSessions,
    },
    {
        id: 'focus_2',
        name: 'Double Focus',
        description: 'Complete 2 focus sessions',
        goal: 2,
        xpReward: 45,
        icon: '🍅',
        tracker: (state) => state.dailyCounters.focusSessions,
    },
    // Smart commit challenges
    {
        id: 'smart_commit_1',
        name: 'Smart Starter',
        description: 'Use smart commit once',
        goal: 1,
        xpReward: 20,
        icon: '🐕',
        tracker: (state) => state.dailyCounters.smartCommits,
    },
    {
        id: 'smart_commit_3',
        name: 'Smart Cookie',
        description: 'Use smart commit 3 times',
        goal: 3,
        xpReward: 40,
        icon: '🐕',
        tracker: (state) => state.dailyCounters.smartCommits,
    },
    // Streak challenges
    {
        id: 'keep_streak',
        name: 'Streak Keeper',
        description: 'Maintain your commit streak',
        goal: 1,
        xpReward: 20,
        icon: '🔥',
        tracker: (state, repo) => repo.streak > 0 ? 1 : 0,
    },
    // Clean code challenges
    {
        id: 'clean_tree',
        name: 'Clean Machine',
        description: 'Commit all changes (clean tree)',
        goal: 1,
        xpReward: 20,
        icon: '✨',
        tracker: (state, repo) => repo.dirtyFiles === 0 ? 1 : 0,
    },
    // Activity challenges
    {
        id: 'feed_play',
        name: 'Pet Parent',
        description: 'Feed and play with your buddy',
        goal: 2,
        xpReward: 25,
        icon: '💕',
        tracker: (state) => state.dailyCounters.feeds + state.dailyCounters.plays,
    },
    // Early bird
    {
        id: 'early_commit',
        name: 'Early Bird',
        description: 'Make a commit before 9 AM',
        goal: 1,
        xpReward: 30,
        icon: '🐦',
        tracker: () => {
            const hour = new Date().getHours();
            return hour < 9 ? 1 : 0;
        },
    },
];
// =============================================================================
// CHALLENGE MANAGEMENT
// =============================================================================
/**
 * Gets or generates today's daily challenge.
 */
function getDailyChallenge(state) {
    const today = new Date().toISOString().split('T')[0];
    // If we have a challenge for today, return it
    if (state.dailyChallenge && state.dailyChallenge.date === today) {
        return state.dailyChallenge;
    }
    // Generate a new challenge for today
    // Use date as seed for consistent daily challenge
    const seed = today.split('-').join('');
    const index = parseInt(seed) % exports.CHALLENGES.length;
    const challenge = exports.CHALLENGES[index];
    return {
        date: today,
        challengeId: challenge.id,
        completed: false,
        progress: 0,
    };
}
/**
 * Gets the challenge definition by ID.
 */
function getChallenge(id) {
    return exports.CHALLENGES.find(c => c.id === id);
}
/**
 * Checks and updates challenge progress.
 */
function checkChallengeProgress(state, repoData) {
    const dailyChallenge = getDailyChallenge(state);
    const challenge = getChallenge(dailyChallenge.challengeId);
    if (!challenge || dailyChallenge.completed) {
        return {
            progress: dailyChallenge.progress,
            completed: dailyChallenge.completed,
            justCompleted: false,
        };
    }
    const currentProgress = challenge.tracker(state, repoData);
    const wasCompleted = dailyChallenge.completed;
    const isNowCompleted = currentProgress >= challenge.goal;
    return {
        progress: Math.min(currentProgress, challenge.goal),
        completed: isNowCompleted,
        justCompleted: isNowCompleted && !wasCompleted,
    };
}
// =============================================================================
// UI BUILDERS
// =============================================================================
/**
 * Builds the daily challenge display for the main screen.
 */
function buildChallengeDisplay(state, repoData) {
    const dailyChallenge = getDailyChallenge(state);
    const challenge = getChallenge(dailyChallenge.challengeId);
    if (!challenge)
        return [];
    const { progress, completed } = checkChallengeProgress(state, repoData);
    const lines = [];
    if (completed) {
        lines.push(colors_js_1.colors.healthy(`${challenge.icon} Daily: ${challenge.name} - COMPLETE! +${challenge.xpReward} XP`));
    }
    else {
        const progressStr = `${progress}/${challenge.goal}`;
        const bar = (0, colors_js_1.progressBar)(progress, challenge.goal, 10, 'xp');
        lines.push(colors_js_1.colors.text(`${challenge.icon} Daily: ${challenge.name}`));
        lines.push(colors_js_1.colors.textDim(`   ${challenge.description} ${bar} ${progressStr}`));
    }
    return lines;
}
/**
 * Builds the challenge complete popup.
 */
function buildChallengeCompleteScreen(challenge) {
    const width = 55;
    const lines = [];
    lines.push(colors_js_1.colors.frame(`\u256d${'─'.repeat(width - 2)}\u256e`));
    lines.push(colors_js_1.colors.frame('│') + chalk_1.default.bold.green('  🎯 DAILY CHALLENGE COMPLETE!') + ' '.repeat(width - 34) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // Challenge name with icon
    const nameDisplay = `${challenge.icon} ${challenge.name.toUpperCase()} ${challenge.icon}`;
    const namePadding = Math.floor((width - 2 - nameDisplay.length) / 2);
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(namePadding) + chalk_1.default.bold.yellow(nameDisplay) + ' '.repeat(width - 2 - namePadding - nameDisplay.length) + colors_js_1.colors.frame('│'));
    // Description
    const descPadding = Math.floor((width - 2 - challenge.description.length - 2) / 2);
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(descPadding) + `"${challenge.description}"` + ' '.repeat(width - 2 - descPadding - challenge.description.length - 2) + colors_js_1.colors.frame('│'));
    // XP reward
    const xpDisplay = `+${challenge.xpReward} XP`;
    const xpPadding = Math.floor((width - 2 - xpDisplay.length) / 2);
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(xpPadding) + colors_js_1.colors.xpFilled(xpDisplay) + ' '.repeat(width - 2 - xpPadding - xpDisplay.length) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // Excited puppy
    const puppy = [
        '    ★    ∧＿∧  ★ ',
        '   ♥    (ᵔᴥᵔ)  ♥',
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
    const msg = "*BORK BORK* Challenge complete! Good human!";
    const msgPadding = Math.floor((width - 2 - msg.length - 4) / 2);
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(msgPadding) + colors_js_1.colors.happy(`💬 ${msg}`) + ' '.repeat(width - 2 - msgPadding - msg.length - 4) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + colors_js_1.colors.textDim('  Press any key to continue...') + ' '.repeat(width - 34) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame(`\u2570${'─'.repeat(width - 2)}\u256f`));
    return lines.join('\n');
}
/**
 * Builds the challenges list screen (all challenges).
 */
function buildAllChallengesScreen(state) {
    const width = 60;
    const lines = [];
    const dailyChallenge = getDailyChallenge(state);
    lines.push(colors_js_1.colors.frame(`\u256d${'─'.repeat(width - 2)}\u256e`));
    lines.push(colors_js_1.colors.frame('│') + chalk_1.default.bold.yellow('  🎯 Daily Challenges') + ' '.repeat(width - 24) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // Today's challenge
    const todayChallenge = getChallenge(dailyChallenge.challengeId);
    if (todayChallenge) {
        const status = dailyChallenge.completed ? colors_js_1.colors.healthy('✓ COMPLETE') : colors_js_1.colors.warning('In Progress');
        lines.push(colors_js_1.colors.frame('│') + chalk_1.default.bold("  Today's Challenge:") + ' '.repeat(width - 23) + colors_js_1.colors.frame('│'));
        lines.push(colors_js_1.colors.frame('│') + `  ${todayChallenge.icon} ${todayChallenge.name} - ${status}` + ' '.repeat(Math.max(0, width - 30 - todayChallenge.name.length)) + colors_js_1.colors.frame('│'));
        lines.push(colors_js_1.colors.frame('│') + colors_js_1.colors.textDim(`     ${todayChallenge.description}`) + ' '.repeat(Math.max(0, width - 7 - todayChallenge.description.length)) + colors_js_1.colors.frame('│'));
        lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    }
    // All possible challenges
    lines.push(colors_js_1.colors.frame('│') + chalk_1.default.bold("  All Possible Challenges:") + ' '.repeat(width - 29) + colors_js_1.colors.frame('│'));
    for (const challenge of exports.CHALLENGES.slice(0, 8)) {
        const line = `  ${challenge.icon} ${challenge.name.padEnd(20)} +${challenge.xpReward} XP`;
        lines.push(colors_js_1.colors.frame('│') + colors_js_1.colors.textDim(line) + ' '.repeat(Math.max(0, width - 2 - line.length)) + colors_js_1.colors.frame('│'));
    }
    if (exports.CHALLENGES.length > 8) {
        lines.push(colors_js_1.colors.frame('│') + colors_js_1.colors.textDim(`  ...and ${exports.CHALLENGES.length - 8} more challenges`) + ' '.repeat(width - 30 - String(exports.CHALLENGES.length - 8).length) + colors_js_1.colors.frame('│'));
    }
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + colors_js_1.colors.textDim('  Press any key to go back...') + ' '.repeat(width - 33) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame(`\u2570${'─'.repeat(width - 2)}\u256f`));
    return lines.join('\n');
}
//# sourceMappingURL=challenges.js.map