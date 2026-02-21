"use strict";
/**
 * =============================================================================
 * HEATMAP.TS - Combined Stats & Progress Screen
 * =============================================================================
 *
 * Displays comprehensive git and pet statistics.
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
const xp_js_1 = require("../state/xp.js");
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
/**
 * Gets commit counts for the last N days.
 * Returns an array of [date, count] pairs.
 */
function getCommitHistory(days) {
    const commits = new Map();
    try {
        // Get commit dates for the last N days
        const since = new Date();
        since.setDate(since.getDate() - days);
        const sinceStr = since.toISOString().split('T')[0];
        const result = (0, child_process_1.execSync)(`git log --format=%cd --date=short --since="${sinceStr}"`, {
            encoding: 'utf-8',
            timeout: 5000,
        });
        // Count commits per day
        const dates = result.trim().split('\n').filter(Boolean);
        for (const date of dates) {
            commits.set(date, (commits.get(date) || 0) + 1);
        }
    }
    catch {
        // Return empty map on error
    }
    return commits;
}
/**
 * Builds a visual heatmap grid for the last 4 weeks.
 */
function buildHeatmapGrid() {
    const commits = getCommitHistory(28);
    const lines = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    // Get the last 4 weeks of dates organized by day of week
    const weeks = [[], [], [], []]; // 4 weeks
    const today = new Date();
    for (let i = 27; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const weekIndex = Math.floor((27 - i) / 7);
        if (weekIndex < 4) {
            weeks[weekIndex].push(dateStr);
        }
    }
    // Build header with week labels
    lines.push('        Wk1   Wk2   Wk3   Wk4');
    // Build grid row by row (by day of week)
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        let row = `  ${days[dayOfWeek]} `;
        for (let week = 0; week < 4; week++) {
            // Find the date in this week that matches this day of week
            let found = false;
            for (const dateStr of weeks[week]) {
                const date = new Date(dateStr);
                if (date.getDay() === dayOfWeek) {
                    const count = commits.get(dateStr) || 0;
                    row += ' ' + getHeatmapChar(count) + '   ';
                    found = true;
                    break;
                }
            }
            if (!found) {
                row += '     '; // Empty space for missing days
            }
        }
        lines.push(row);
    }
    // Legend
    lines.push('');
    lines.push('  Less ' + chalk_1.default.gray('░') + chalk_1.default.green('▒') + chalk_1.default.greenBright('▓') + chalk_1.default.bold.green('█') + ' More');
    return lines;
}
/**
 * Gets the heatmap character based on commit count.
 */
function getHeatmapChar(count) {
    if (count === 0)
        return chalk_1.default.gray('░');
    if (count === 1)
        return chalk_1.default.green('▒');
    if (count <= 3)
        return chalk_1.default.greenBright('▓');
    return chalk_1.default.bold.green('█');
}
// =============================================================================
// UI BUILDER
// =============================================================================
/**
 * Builds the combined stats screen with git stats, pet progress, and more.
 */
function buildHeatmapScreen(state) {
    const width = 55;
    const lines = [];
    // Get git stats with error handling
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
    // Calculate days together
    const createdDate = new Date(state.createdAt);
    const daysTogether = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    // XP progress
    const level = state.level;
    const xpInLevel = state.xp - xp_js_1.levelThresholds[level];
    const xpNeededForNext = level < 5 ? xp_js_1.levelThresholds[(level + 1)] - xp_js_1.levelThresholds[level] : 0;
    // Header
    lines.push(colors_js_1.colors.frame(`╭${'─'.repeat(width - 2)}╮`));
    lines.push(colors_js_1.colors.frame('│') + chalk_1.default.bold.yellow(`  📊 ${state.name}'s Stats & Progress`) + ' '.repeat(width - 28 - state.name.length) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // ---- Pet Progress Section ----
    lines.push(colors_js_1.colors.frame('│') + chalk_1.default.bold('  🐕 Pet Progress') + ' '.repeat(width - 20) + colors_js_1.colors.frame('│'));
    // Level with stars
    const levelText = `Level ${state.level}: ${(0, xp_js_1.getLevelTitle)(level)} ${(0, colors_js_1.getLevelStars)(state.level)}`;
    lines.push(colors_js_1.colors.frame('│') + `     ${levelText}` + ' '.repeat(Math.max(0, width - 7 - levelText.length)) + colors_js_1.colors.frame('│'));
    // HP Bar
    const hpBar = (0, colors_js_1.progressBar)(state.hp, 100, 20, 'hp');
    lines.push(colors_js_1.colors.frame('│') + `     HP:  ${hpBar} ${state.hp}/100` + ' '.repeat(Math.max(0, width - 40)) + colors_js_1.colors.frame('│'));
    // XP Bar
    if (level < 5) {
        const xpBar = (0, colors_js_1.progressBar)(xpInLevel, xpNeededForNext, 20, 'xp');
        lines.push(colors_js_1.colors.frame('│') + `     XP:  ${xpBar} ${xpInLevel}/${xpNeededForNext}` + ' '.repeat(Math.max(0, width - 40 - String(xpInLevel).length - String(xpNeededForNext).length + 6)) + colors_js_1.colors.frame('│'));
    }
    else {
        lines.push(colors_js_1.colors.frame('│') + chalk_1.default.bold.yellow('     XP:  ✨ MAX LEVEL ✨') + ' '.repeat(width - 28) + colors_js_1.colors.frame('│'));
    }
    // Days together
    lines.push(colors_js_1.colors.frame('│') + `     Days Together: ${daysTogether}` + ' '.repeat(width - 24 - String(daysTogether).length) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // ---- Git Stats Section ----
    lines.push(colors_js_1.colors.frame('│') + chalk_1.default.bold('  💻 Git Stats') + ' '.repeat(width - 17) + colors_js_1.colors.frame('│'));
    const totalLine = `     Total Commits: ${totalCommits}`;
    lines.push(colors_js_1.colors.frame('│') + totalLine + ' '.repeat(width - 2 - totalLine.length) + colors_js_1.colors.frame('│'));
    const todayLine = `     Today: ${todayCommits} commit${todayCommits !== 1 ? 's' : ''}`;
    lines.push(colors_js_1.colors.frame('│') + todayLine + ' '.repeat(width - 2 - todayLine.length) + colors_js_1.colors.frame('│'));
    const streakIcon = streak > 0 ? '🔥' : '❄️';
    const streakLine = `     ${streakIcon} Current Streak: ${streak} day${streak !== 1 ? 's' : ''}`;
    lines.push(colors_js_1.colors.frame('│') + streakLine + ' '.repeat(width - 2 - streakLine.length) + colors_js_1.colors.frame('│'));
    const longestLine = `     🏆 Longest Streak: ${state.longestStreak} days`;
    lines.push(colors_js_1.colors.frame('│') + longestLine + ' '.repeat(width - 2 - longestLine.length) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // ---- Heatmap Section ----
    lines.push(colors_js_1.colors.frame('│') + chalk_1.default.bold('  🗓️  Last 4 Weeks') + ' '.repeat(width - 21) + colors_js_1.colors.frame('│'));
    const heatmapLines = buildHeatmapGrid();
    for (const heatLine of heatmapLines) {
        lines.push(colors_js_1.colors.frame('│') + heatLine + ' '.repeat(Math.max(0, width - 2 - heatLine.length + 10)) + colors_js_1.colors.frame('│'));
    }
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // ---- Activity Section ----
    lines.push(colors_js_1.colors.frame('│') + chalk_1.default.bold('  📈 Activity') + ' '.repeat(width - 16) + colors_js_1.colors.frame('│'));
    const feedsLine = `     🍖 Total Feeds: ${state.totalFeeds}`;
    lines.push(colors_js_1.colors.frame('│') + feedsLine + ' '.repeat(width - 2 - feedsLine.length) + colors_js_1.colors.frame('│'));
    const playsLine = `     🎾 Total Plays: ${state.totalPlays}`;
    lines.push(colors_js_1.colors.frame('│') + playsLine + ' '.repeat(width - 2 - playsLine.length) + colors_js_1.colors.frame('│'));
    const scansLine = `     🔍 Total Scans: ${state.totalScans}`;
    lines.push(colors_js_1.colors.frame('│') + scansLine + ' '.repeat(width - 2 - scansLine.length) + colors_js_1.colors.frame('│'));
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