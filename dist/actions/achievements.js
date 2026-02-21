"use strict";
/**
 * =============================================================================
 * ACHIEVEMENTS.TS - Achievement System
 * =============================================================================
 *
 * Track and celebrate milestone achievements!
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACHIEVEMENTS = void 0;
exports.checkAchievements = checkAchievements;
exports.getAchievement = getAchievement;
exports.getUnlockedAchievements = getUnlockedAchievements;
exports.getAchievementProgress = getAchievementProgress;
exports.buildAchievementUnlockedScreen = buildAchievementUnlockedScreen;
exports.buildAchievementsScreen = buildAchievementsScreen;
const chalk_1 = __importDefault(require("chalk"));
const colors_js_1 = require("../ui/colors.js");
// =============================================================================
// ACHIEVEMENT DEFINITIONS
// =============================================================================
exports.ACHIEVEMENTS = [
    // Getting Started
    { id: 'first_feed', name: 'First Meal', description: 'Feed your buddy for the first time', icon: '🍖', xpReward: 10 },
    { id: 'first_play', name: 'Playtime!', description: 'Play with your buddy for the first time', icon: '🎾', xpReward: 10 },
    { id: 'first_commit_msg', name: 'Good Boy Speaks', description: 'Use smart commit message', icon: '💬', xpReward: 15 },
    { id: 'first_focus', name: 'Deep Focus', description: 'Complete your first pomodoro session', icon: '🍅', xpReward: 20 },
    // Streaks
    { id: 'streak_3', name: 'Hat Trick', description: '3-day commit streak', icon: '🔥', xpReward: 20 },
    { id: 'streak_7', name: 'On Fire', description: '7-day commit streak', icon: '🔥', xpReward: 50 },
    { id: 'streak_14', name: 'Unstoppable', description: '14-day commit streak', icon: '💪', xpReward: 100 },
    { id: 'streak_30', name: 'Legendary Coder', description: '30-day commit streak', icon: '👑', xpReward: 200 },
    // Commits
    { id: 'commits_10', name: 'Getting Started', description: '10 commits in this repo', icon: '📝', xpReward: 15 },
    { id: 'commits_50', name: 'Committed', description: '50 commits in this repo', icon: '📝', xpReward: 30 },
    { id: 'commits_100', name: 'Centurion', description: '100 commits in this repo', icon: '🏛️', xpReward: 50 },
    { id: 'commits_500', name: 'Commit Machine', description: '500 commits in this repo', icon: '⚙️', xpReward: 100 },
    // Productivity
    { id: 'clean_tree_5', name: 'Clean Freak', description: 'Launch with clean tree 5 times', icon: '🧹', xpReward: 25 },
    { id: 'focus_5', name: 'Focus Master', description: 'Complete 5 pomodoro sessions', icon: '🧘', xpReward: 40 },
    { id: 'focus_marathon', name: 'Marathon', description: 'Complete a 60-min focus session', icon: '🏃', xpReward: 50 },
    { id: 'feed_10', name: 'Code Cleaner', description: 'Feed your buddy 10 times', icon: '🍖', xpReward: 30 },
    // Time-based
    { id: 'night_owl', name: 'Night Owl', description: 'Use GitBuddy after midnight', icon: '🦉', xpReward: 15 },
    { id: 'early_bird', name: 'Early Bird', description: 'Use GitBuddy before 7 AM', icon: '🐦', xpReward: 15 },
    { id: 'weekend_warrior', name: 'Weekend Warrior', description: 'Code on the weekend', icon: '⚔️', xpReward: 20 },
    // Evolution
    { id: 'level_2', name: 'Growing Up', description: 'Reach Level 2', icon: '📈', xpReward: 0 },
    { id: 'level_3', name: 'Maturity', description: 'Reach Level 3', icon: '📈', xpReward: 0 },
    { id: 'level_4', name: 'So Cool', description: 'Reach Level 4', icon: '😎', xpReward: 0 },
    { id: 'level_5', name: 'LEGENDARY', description: 'Reach Level 5', icon: '👑', xpReward: 0 },
    // Fun
    { id: 'daily_challenge_3', name: 'Challenger', description: 'Complete 3 daily challenges', icon: '🎯', xpReward: 30 },
    { id: 'all_actions', name: 'Jack of All Trades', description: 'Use Feed, Play, Focus, Commit in one session', icon: '🃏', xpReward: 40 },
];
// =============================================================================
// ACHIEVEMENT CHECKING
// =============================================================================
/**
 * Checks all achievements and returns newly unlocked ones.
 */
function checkAchievements(state, repoData) {
    const newlyUnlocked = [];
    for (const achievement of exports.ACHIEVEMENTS) {
        if (state.achievements.includes(achievement.id))
            continue;
        let unlocked = false;
        switch (achievement.id) {
            // Getting Started
            case 'first_feed':
                unlocked = state.totalFeeds >= 1;
                break;
            case 'first_play':
                unlocked = state.totalPlays >= 1;
                break;
            case 'first_commit_msg':
                unlocked = state.totalSmartCommits >= 1;
                break;
            case 'first_focus':
                unlocked = state.focusSessions.total >= 1;
                break;
            // Streaks
            case 'streak_3':
                unlocked = repoData.streak >= 3;
                break;
            case 'streak_7':
                unlocked = repoData.streak >= 7;
                break;
            case 'streak_14':
                unlocked = repoData.streak >= 14;
                break;
            case 'streak_30':
                unlocked = repoData.streak >= 30;
                break;
            // Commits
            case 'commits_10':
                unlocked = repoData.totalCommits >= 10;
                break;
            case 'commits_50':
                unlocked = repoData.totalCommits >= 50;
                break;
            case 'commits_100':
                unlocked = repoData.totalCommits >= 100;
                break;
            case 'commits_500':
                unlocked = repoData.totalCommits >= 500;
                break;
            // Productivity
            case 'clean_tree_5':
                unlocked = state.cleanTreeCount >= 5;
                break;
            case 'focus_5':
                unlocked = state.focusSessions.total >= 5;
                break;
            case 'focus_marathon':
                unlocked = state.focusSessions.bestSession?.commits !== undefined &&
                    state.focusSessions.totalMinutes >= 60;
                break;
            case 'feed_10':
                unlocked = state.totalFeeds >= 10;
                break;
            // Time-based
            case 'night_owl':
                unlocked = repoData.hour >= 0 && repoData.hour < 5;
                break;
            case 'early_bird':
                unlocked = repoData.hour >= 5 && repoData.hour < 7;
                break;
            case 'weekend_warrior':
                unlocked = repoData.isWeekend;
                break;
            // Evolution
            case 'level_2':
                unlocked = state.level >= 2;
                break;
            case 'level_3':
                unlocked = state.level >= 3;
                break;
            case 'level_4':
                unlocked = state.level >= 4;
                break;
            case 'level_5':
                unlocked = state.level >= 5;
                break;
            // Fun
            case 'all_actions':
                unlocked = ['feed', 'play', 'focus', 'commit'].every(a => state.actionsThisSession.includes(a));
                break;
        }
        if (unlocked) {
            newlyUnlocked.push(achievement);
        }
    }
    return newlyUnlocked;
}
/**
 * Gets achievement by ID.
 */
function getAchievement(id) {
    return exports.ACHIEVEMENTS.find(a => a.id === id);
}
/**
 * Gets all unlocked achievements.
 */
function getUnlockedAchievements(state) {
    return exports.ACHIEVEMENTS.filter(a => state.achievements.includes(a.id));
}
/**
 * Gets progress toward achievements.
 */
function getAchievementProgress(state, repoData) {
    return {
        unlocked: state.achievements.length,
        total: exports.ACHIEVEMENTS.length,
    };
}
// =============================================================================
// UI BUILDERS
// =============================================================================
/**
 * Builds the achievement unlocked popup.
 */
function buildAchievementUnlockedScreen(achievement) {
    const width = 55;
    const lines = [];
    lines.push(colors_js_1.colors.frame(`╭${'─'.repeat(width - 2)}╮`));
    lines.push(colors_js_1.colors.frame('│') + chalk_1.default.bold.yellow('  🏆 ACHIEVEMENT UNLOCKED!') + ' '.repeat(width - 29) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // Achievement name with icon
    const nameDisplay = `${achievement.icon} ${achievement.name.toUpperCase()} ${achievement.icon}`;
    const namePadding = Math.floor((width - 2 - nameDisplay.length) / 2);
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(namePadding) + chalk_1.default.bold.yellow(nameDisplay) + ' '.repeat(width - 2 - namePadding - nameDisplay.length) + colors_js_1.colors.frame('│'));
    // Description
    const descPadding = Math.floor((width - 2 - achievement.description.length - 2) / 2);
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(descPadding) + `"${achievement.description}"` + ' '.repeat(width - 2 - descPadding - achievement.description.length - 2) + colors_js_1.colors.frame('│'));
    // XP reward
    if (achievement.xpReward > 0) {
        const xpDisplay = `+${achievement.xpReward} XP`;
        const xpPadding = Math.floor((width - 2 - xpDisplay.length) / 2);
        lines.push(colors_js_1.colors.frame('│') + ' '.repeat(xpPadding) + colors_js_1.colors.xpFilled(xpDisplay) + ' '.repeat(width - 2 - xpPadding - xpDisplay.length) + colors_js_1.colors.frame('│'));
    }
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
    const msg = "*BORK BORK* WE DID IT! I'M SO PROUD!";
    const msgPadding = Math.floor((width - 2 - msg.length - 4) / 2);
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(msgPadding) + colors_js_1.colors.happy(`💬 ${msg}`) + ' '.repeat(width - 2 - msgPadding - msg.length - 4) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + colors_js_1.colors.textDim('  Press any key to continue...') + ' '.repeat(width - 34) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame(`╰${'─'.repeat(width - 2)}╯`));
    return lines.join('\n');
}
/**
 * Builds the achievements list screen.
 */
function buildAchievementsScreen(state) {
    const width = 60;
    const lines = [];
    lines.push(colors_js_1.colors.frame(`╭${'─'.repeat(width - 2)}╮`));
    lines.push(colors_js_1.colors.frame('│') + chalk_1.default.bold.yellow('  🏆 Achievements') + ' '.repeat(width - 20) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // Progress
    const progress = `${state.achievements.length}/${exports.ACHIEVEMENTS.length} unlocked`;
    lines.push(colors_js_1.colors.frame('│') + `  ${progress}` + ' '.repeat(width - 4 - progress.length) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // Show achievements (up to 12)
    for (const achievement of exports.ACHIEVEMENTS.slice(0, 12)) {
        const unlocked = state.achievements.includes(achievement.id);
        const icon = unlocked ? achievement.icon : '⬜';
        const name = unlocked ? achievement.name : '???';
        const desc = unlocked ? achievement.description : 'Keep playing to unlock!';
        const xp = unlocked && achievement.xpReward > 0 ? ` (+${achievement.xpReward} XP)` : '';
        const line = `  ${icon} ${name.padEnd(18)} ${desc}${xp}`;
        const truncated = line.length > width - 4 ? line.slice(0, width - 7) + '...' : line;
        const color = unlocked ? colors_js_1.colors.text : colors_js_1.colors.textDim;
        lines.push(colors_js_1.colors.frame('│') + color(truncated) + ' '.repeat(Math.max(0, width - 2 - truncated.length)) + colors_js_1.colors.frame('│'));
    }
    if (exports.ACHIEVEMENTS.length > 12) {
        lines.push(colors_js_1.colors.frame('│') + colors_js_1.colors.textDim(`  ...and ${exports.ACHIEVEMENTS.length - 12} more achievements`) + ' '.repeat(width - 32 - String(exports.ACHIEVEMENTS.length - 12).length) + colors_js_1.colors.frame('│'));
    }
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + colors_js_1.colors.textDim('  Press any key to go back...') + ' '.repeat(width - 33) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame(`╰${'─'.repeat(width - 2)}╯`));
    return lines.join('\n');
}
//# sourceMappingURL=achievements.js.map