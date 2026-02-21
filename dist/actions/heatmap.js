"use strict";
/**
 * =============================================================================
 * HEATMAP.TS - Git Activity Heatmap & Streak Dashboard
 * =============================================================================
 *
 * Displays a GitHub-style contribution heatmap for the last 12 weeks
 * along with streak statistics and commit history.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHeatmapData = getHeatmapData;
exports.getCurrentStreak = getCurrentStreak;
exports.getTodayCommits = getTodayCommits;
exports.buildHeatmapScreen = buildHeatmapScreen;
exports.buildStreakDisplay = buildStreakDisplay;
const child_process_1 = require("child_process");
const chalk_1 = __importDefault(require("chalk"));
const colors_js_1 = require("../ui/colors.js");
// =============================================================================
// DATA COLLECTION
// =============================================================================
/**
 * Gets commit counts for the last 84 days (12 weeks).
 */
function getHeatmapData() {
    const weeks = [];
    const today = new Date();
    let totalCommits = 0;
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const dayCounts = {
        Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0,
    };
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    // Get commits for last 84 days
    const dailyCommits = [];
    for (let i = 83; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        let commits = 0;
        try {
            const result = (0, child_process_1.execSync)(`git log --oneline --after="${dateStr} 00:00" --before="${dateStr} 23:59" 2>/dev/null || echo ""`, { encoding: 'utf-8', timeout: 5000 });
            commits = result.trim().split('\n').filter(Boolean).length;
        }
        catch {
            commits = 0;
        }
        dailyCommits.push(commits);
        totalCommits += commits;
        dayCounts[dayNames[date.getDay()]] += commits;
        // Track streaks
        if (commits > 0) {
            tempStreak++;
            if (i === 0)
                currentStreak = tempStreak;
        }
        else {
            if (tempStreak > longestStreak)
                longestStreak = tempStreak;
            tempStreak = 0;
            if (i === 0)
                currentStreak = 0;
        }
    }
    // Check final streak
    if (tempStreak > longestStreak)
        longestStreak = tempStreak;
    // Build weeks array (12 weeks x 7 days)
    for (let w = 0; w < 12; w++) {
        const week = [];
        for (let d = 0; d < 7; d++) {
            const index = w * 7 + d;
            week.push(dailyCommits[index] || 0);
        }
        weeks.push(week);
    }
    // Find most active day
    let mostActiveDay = 'Mon';
    let maxDayCommits = 0;
    for (const [day, count] of Object.entries(dayCounts)) {
        if (count > maxDayCommits) {
            maxDayCommits = count;
            mostActiveDay = day;
        }
    }
    // Calculate this week and last week
    const commitsThisWeek = weeks[11]?.reduce((a, b) => a + b, 0) || 0;
    const commitsLastWeek = weeks[10]?.reduce((a, b) => a + b, 0) || 0;
    return {
        weeks,
        totalCommits,
        currentStreak,
        longestStreak,
        averagePerDay: totalCommits / 84,
        mostActiveDay,
        commitsThisWeek,
        commitsLastWeek,
    };
}
/**
 * Gets the current commit streak.
 */
function getCurrentStreak() {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        try {
            const result = (0, child_process_1.execSync)(`git log --oneline --after="${dateStr} 00:00" --before="${dateStr} 23:59" 2>/dev/null || echo ""`, { encoding: 'utf-8', timeout: 3000 });
            const commits = result.trim().split('\n').filter(Boolean).length;
            if (commits > 0) {
                streak++;
            }
            else if (i > 0) {
                // Allow today to have no commits yet
                break;
            }
        }
        catch {
            break;
        }
    }
    return streak;
}
/**
 * Gets today's commit count.
 */
function getTodayCommits() {
    const today = new Date().toISOString().split('T')[0];
    try {
        const result = (0, child_process_1.execSync)(`git log --oneline --after="${today} 00:00" 2>/dev/null || echo ""`, { encoding: 'utf-8', timeout: 3000 });
        return result.trim().split('\n').filter(Boolean).length;
    }
    catch {
        return 0;
    }
}
// =============================================================================
// HEATMAP RENDERING
// =============================================================================
/**
 * Gets the color for a commit count.
 */
function getHeatColor(commits) {
    if (commits === 0)
        return chalk_1.default.gray('░');
    if (commits === 1)
        return chalk_1.default.green('▒');
    if (commits <= 3)
        return chalk_1.default.greenBright('▓');
    return chalk_1.default.bold.greenBright('█');
}
/**
 * Builds the heatmap display.
 */
function buildHeatmap(weeks) {
    const lines = [];
    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    // Build each row (day of week)
    for (let d = 0; d < 7; d++) {
        let row = `  ${dayLabels[d]} `;
        for (let w = 0; w < 12; w++) {
            row += getHeatColor(weeks[w][d]) + ' ';
        }
        lines.push(row);
    }
    // Week labels
    let weekLabel = '    ';
    for (let w = 0; w < 12; w++) {
        if (w === 0)
            weekLabel += '12';
        else if (w === 5)
            weekLabel += ' 6';
        else if (w === 11)
            weekLabel += ' 1';
        else
            weekLabel += '  ';
    }
    lines.push(chalk_1.default.gray(weekLabel + ' weeks ago'));
    return lines;
}
// =============================================================================
// UI BUILDERS
// =============================================================================
/**
 * Builds the full heatmap stats screen.
 */
function buildHeatmapScreen(state) {
    const width = 60;
    const lines = [];
    const data = getHeatmapData();
    lines.push(colors_js_1.colors.frame(`\u256d${'─'.repeat(width - 2)}\u256e`));
    lines.push(colors_js_1.colors.frame('│') + chalk_1.default.bold.yellow('  📊 Git Stats & Activity') + ' '.repeat(width - 28) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // Streak info
    const streakIcon = data.currentStreak > 0 ? '🔥' : '❄️';
    lines.push(colors_js_1.colors.frame('│') + `  ${streakIcon} Current Streak: ${data.currentStreak} days` + ' '.repeat(width - 29 - String(data.currentStreak).length) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + `  🏆 Longest Streak: ${data.longestStreak} days` + ' '.repeat(width - 28 - String(data.longestStreak).length) + colors_js_1.colors.frame('│'));
    // Update pet's longest streak if we beat it
    if (data.longestStreak > state.longestStreak) {
        lines.push(colors_js_1.colors.frame('│') + colors_js_1.colors.healthy(`     ↑ New record!`) + ' '.repeat(width - 22) + colors_js_1.colors.frame('│'));
    }
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // Activity heatmap
    lines.push(colors_js_1.colors.frame('│') + chalk_1.default.bold('  Activity (last 12 weeks):') + ' '.repeat(width - 30) + colors_js_1.colors.frame('│'));
    const heatmap = buildHeatmap(data.weeks);
    for (const heatLine of heatmap) {
        lines.push(colors_js_1.colors.frame('│') + heatLine + ' '.repeat(Math.max(0, width - 2 - heatLine.length + 10)) + colors_js_1.colors.frame('│'));
    }
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // Stats summary
    lines.push(colors_js_1.colors.frame('│') + chalk_1.default.bold('  Quick Stats:') + ' '.repeat(width - 17) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + `  📝 Total commits (12 wks): ${data.totalCommits}` + ' '.repeat(width - 33 - String(data.totalCommits).length) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + `  📅 This week: ${data.commitsThisWeek} commits` + ' '.repeat(width - 27 - String(data.commitsThisWeek).length) + colors_js_1.colors.frame('│'));
    // Compare to last week
    const diff = data.commitsThisWeek - data.commitsLastWeek;
    const diffStr = diff >= 0 ? `+${diff}` : `${diff}`;
    const diffColor = diff >= 0 ? colors_js_1.colors.healthy : colors_js_1.colors.danger;
    lines.push(colors_js_1.colors.frame('│') + `  📈 vs last week: ` + diffColor(diffStr) + ' '.repeat(width - 22 - diffStr.length) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + `  ⭐ Most active day: ${data.mostActiveDay}` + ' '.repeat(width - 26 - data.mostActiveDay.length) + colors_js_1.colors.frame('│'));
    const avgStr = data.averagePerDay.toFixed(1);
    lines.push(colors_js_1.colors.frame('│') + `  📊 Average/day: ${avgStr}` + ' '.repeat(width - 22 - avgStr.length) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // Legend
    lines.push(colors_js_1.colors.frame('│') + '  Legend: ' + chalk_1.default.gray('░') + ' None  ' + chalk_1.default.green('▒') + ' 1  ' + chalk_1.default.greenBright('▓') + ' 2-3  ' + chalk_1.default.bold.greenBright('█') + ' 4+' + ' '.repeat(width - 40) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // Dog message
    let msg = '';
    if (data.currentStreak >= 7) {
        msg = "*excited pant* You're on FIRE! Keep that streak going!";
    }
    else if (data.currentStreak >= 3) {
        msg = "*happy wag* Nice streak! Let's keep it up!";
    }
    else if (data.commitsThisWeek > data.commitsLastWeek) {
        msg = "*tail wag* You're doing better than last week!";
    }
    else {
        msg = "*encouraging look* Every commit counts!";
    }
    lines.push(colors_js_1.colors.frame('│') + colors_js_1.colors.happy(`  💬 "${msg}"`) + ' '.repeat(Math.max(0, width - 8 - msg.length)) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + colors_js_1.colors.textDim('  Press any key to go back...') + ' '.repeat(width - 33) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame(`\u2570${'─'.repeat(width - 2)}\u256f`));
    return lines.join('\n');
}
/**
 * Builds a compact streak display for the main screen.
 */
function buildStreakDisplay() {
    const streak = getCurrentStreak();
    const todayCommits = getTodayCommits();
    const lines = [];
    if (streak > 0) {
        lines.push(colors_js_1.colors.text(`🔥 ${streak}-day streak! Today: ${todayCommits} commits`));
    }
    else {
        lines.push(colors_js_1.colors.textDim(`❄️ No streak. Make a commit to start one!`));
    }
    return lines;
}
//# sourceMappingURL=heatmap.js.map