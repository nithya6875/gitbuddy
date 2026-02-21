"use strict";
/**
 * =============================================================================
 * HEATMAP.TS - Git Stats Screen
 * =============================================================================
 *
 * Displays git statistics in a simple, Windows-compatible way.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentStreak = getCurrentStreak;
exports.getTodayCommits = getTodayCommits;
exports.buildHeatmapScreen = buildHeatmapScreen;
const child_process_1 = require("child_process");
const chalk_1 = __importDefault(require("chalk"));
const colors_js_1 = require("../ui/colors.js");
// =============================================================================
// DATA COLLECTION
// =============================================================================
/**
 * Gets total commit count.
 */
function getTotalCommits() {
    try {
        const result = (0, child_process_1.execSync)('git rev-list --count HEAD', {
            encoding: 'utf-8',
            timeout: 5000,
        });
        return parseInt(result.trim()) || 0;
    }
    catch {
        return 0;
    }
}
/**
 * Gets the current commit streak (simplified).
 */
function getCurrentStreak() {
    try {
        const result = (0, child_process_1.execSync)('git log --oneline -1 --format=%cd --date=short', {
            encoding: 'utf-8',
            timeout: 3000,
        });
        const lastCommitDate = result.trim();
        const today = new Date().toISOString().split('T')[0];
        return lastCommitDate === today ? 1 : 0;
    }
    catch {
        return 0;
    }
}
/**
 * Gets today's commit count.
 */
function getTodayCommits() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const result = (0, child_process_1.execSync)(`git log --oneline --since="${today}"`, {
            encoding: 'utf-8',
            timeout: 3000,
        });
        return result.trim().split('\n').filter(Boolean).length;
    }
    catch {
        return 0;
    }
}
// =============================================================================
// UI BUILDER
// =============================================================================
/**
 * Builds the stats screen.
 */
function buildHeatmapScreen(state) {
    const width = 50;
    const lines = [];
    // Get stats with error handling
    let totalCommits = 0;
    let streak = 0;
    let todayCommits = 0;
    try {
        totalCommits = getTotalCommits();
        streak = getCurrentStreak();
        todayCommits = getTodayCommits();
    }
    catch {
        // Use defaults
    }
    lines.push(colors_js_1.colors.frame(`╭${'─'.repeat(width - 2)}╮`));
    lines.push(colors_js_1.colors.frame('│') + chalk_1.default.bold.yellow('  📊 Git Stats') + ' '.repeat(width - 17) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // Stats
    const totalLine = `  📝 Total Commits: ${totalCommits}`;
    lines.push(colors_js_1.colors.frame('│') + totalLine + ' '.repeat(width - 2 - totalLine.length) + colors_js_1.colors.frame('│'));
    const todayLine = `  📅 Today: ${todayCommits} commits`;
    lines.push(colors_js_1.colors.frame('│') + todayLine + ' '.repeat(width - 2 - todayLine.length) + colors_js_1.colors.frame('│'));
    const streakIcon = streak > 0 ? '🔥' : '❄️';
    const streakLine = `  ${streakIcon} Streak: ${streak} day${streak !== 1 ? 's' : ''}`;
    lines.push(colors_js_1.colors.frame('│') + streakLine + ' '.repeat(width - 2 - streakLine.length) + colors_js_1.colors.frame('│'));
    const longestLine = `  🏆 Longest Streak: ${state.longestStreak} days`;
    lines.push(colors_js_1.colors.frame('│') + longestLine + ' '.repeat(width - 2 - longestLine.length) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // Pet stats
    lines.push(colors_js_1.colors.frame('│') + chalk_1.default.bold('  Pet Stats:') + ' '.repeat(width - 15) + colors_js_1.colors.frame('│'));
    const feedsLine = `  🍖 Total Feeds: ${state.totalFeeds}`;
    lines.push(colors_js_1.colors.frame('│') + feedsLine + ' '.repeat(width - 2 - feedsLine.length) + colors_js_1.colors.frame('│'));
    const playsLine = `  🎾 Total Plays: ${state.totalPlays}`;
    lines.push(colors_js_1.colors.frame('│') + playsLine + ' '.repeat(width - 2 - playsLine.length) + colors_js_1.colors.frame('│'));
    const levelLine = `  ⭐ Level: ${state.level}`;
    lines.push(colors_js_1.colors.frame('│') + levelLine + ' '.repeat(width - 2 - levelLine.length) + colors_js_1.colors.frame('│'));
    const xpLine = `  ✨ XP: ${state.xp}`;
    lines.push(colors_js_1.colors.frame('│') + xpLine + ' '.repeat(width - 2 - xpLine.length) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // Message
    const msg = streak > 0 ? '*happy pant* Keep up the good work!' : '*wag* Make a commit today!';
    lines.push(colors_js_1.colors.frame('│') + colors_js_1.colors.happy(`  💬 "${msg}"`) + ' '.repeat(Math.max(0, width - 8 - msg.length)) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + colors_js_1.colors.textDim('  Press any key to go back...') + ' '.repeat(width - 33) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame(`╰${'─'.repeat(width - 2)}╯`));
    return lines.join('\n');
}
//# sourceMappingURL=heatmap.js.map