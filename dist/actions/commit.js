"use strict";
/**
 * =============================================================================
 * COMMIT.TS - Smart Commit Message Generator
 * =============================================================================
 *
 * Analyzes staged changes and generates conventional commit messages.
 * The dog "sniffs" your changes and suggests what you did!
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasStagedChanges = hasStagedChanges;
exports.analyzeChanges = analyzeChanges;
exports.formatCommitMessage = formatCommitMessage;
exports.executeCommit = executeCommit;
exports.buildCommitScreen = buildCommitScreen;
exports.buildNoStagedScreen = buildNoStagedScreen;
exports.buildCommitSuccessScreen = buildCommitSuccessScreen;
const child_process_1 = require("child_process");
const chalk_1 = __importDefault(require("chalk"));
const colors_js_1 = require("../ui/colors.js");
// =============================================================================
// GIT COMMANDS
// =============================================================================
/**
 * Checks if there are staged changes.
 */
function hasStagedChanges() {
    try {
        const result = (0, child_process_1.execSync)('git diff --cached --stat', {
            encoding: 'utf-8',
            timeout: 5000,
        }).trim();
        return result.length > 0;
    }
    catch {
        return false;
    }
}
/**
 * Gets the staged diff.
 */
function getStagedDiff() {
    try {
        const result = (0, child_process_1.execSync)('git diff --cached', {
            encoding: 'utf-8',
            timeout: 10000,
            maxBuffer: 1024 * 1024, // 1MB
        });
        // Limit to first 200 lines
        const lines = result.split('\n').slice(0, 200);
        return lines.join('\n');
    }
    catch {
        return '';
    }
}
/**
 * Gets staged file stats.
 */
function getStagedStats() {
    try {
        const result = (0, child_process_1.execSync)('git diff --cached --numstat', {
            encoding: 'utf-8',
            timeout: 5000,
        });
        const files = [];
        for (const line of result.trim().split('\n')) {
            if (!line)
                continue;
            const [add, del, file] = line.split('\t');
            files.push({
                file: file || '',
                additions: parseInt(add) || 0,
                deletions: parseInt(del) || 0,
            });
        }
        return files;
    }
    catch {
        return [];
    }
}
/**
 * Gets list of staged files.
 */
function getStagedFiles() {
    try {
        const result = (0, child_process_1.execSync)('git diff --cached --name-only', {
            encoding: 'utf-8',
            timeout: 5000,
        });
        return result.trim().split('\n').filter(Boolean);
    }
    catch {
        return [];
    }
}
// =============================================================================
// PATTERN MATCHING
// =============================================================================
const FILE_PATTERNS = {
    test: /\.(test|spec)\.(ts|js|tsx|jsx)$/i,
    config: /\.(json|yml|yaml|toml|ini|env)$|config/i,
    docs: /\.(md|txt|rst)$|README|CHANGELOG|LICENSE/i,
    style: /\.(css|scss|less|sass|styled)/i,
    ci: /\.github|\.gitlab|circleci|Dockerfile|docker-compose/i,
};
const CONTENT_PATTERNS = {
    fix: /fix(ed|es|ing)?|bug|patch|issue|error|crash|wrong|broken/i,
    feat: /add(ed|s|ing)?|new|create|implement|introduce|feature/i,
    refactor: /refactor|rename|move|restructure|reorganize|clean/i,
    docs: /document|readme|comment|jsdoc|typedoc/i,
    test: /test|spec|describe|it\(|expect\(|assert/i,
    style: /format|indent|whitespace|lint|prettier|eslint/i,
    chore: /package\.json|lock|dependencies|upgrade|update|bump|version/i,
    perf: /performance|optimize|cache|speed|faster|memo/i,
    remove: /delete|remove|drop|deprecate/i,
};
// =============================================================================
// ANALYSIS
// =============================================================================
/**
 * Analyzes staged changes and generates a commit suggestion.
 */
function analyzeChanges() {
    const files = getStagedFiles();
    const stats = getStagedStats();
    const diff = getStagedDiff();
    // Calculate totals
    const totalAdditions = stats.reduce((sum, f) => sum + f.additions, 0);
    const totalDeletions = stats.reduce((sum, f) => sum + f.deletions, 0);
    // Determine type from file patterns
    let detectedType = 'chore';
    let typeScore = 0;
    // Check file patterns
    for (const file of files) {
        for (const [type, pattern] of Object.entries(FILE_PATTERNS)) {
            if (pattern.test(file)) {
                const newType = type === 'test' ? 'test' : type === 'docs' ? 'docs' : type === 'style' ? 'style' : type === 'ci' ? 'ci' : 'chore';
                if (typeScore < 1) {
                    detectedType = newType;
                    typeScore = 1;
                }
            }
        }
    }
    // Check content patterns (stronger signal)
    for (const [type, pattern] of Object.entries(CONTENT_PATTERNS)) {
        const matches = (diff.match(pattern) || []).length;
        if (matches > typeScore) {
            detectedType = type;
            typeScore = matches;
        }
    }
    // Determine scope from most common directory
    const scope = detectScope(files);
    // Generate description
    const description = generateDescription(detectedType, files, totalAdditions, totalDeletions);
    // Generate body bullet points
    const body = generateBody(files, stats);
    return {
        type: detectedType,
        scope,
        description,
        body,
        filesChanged: stats,
        stats: {
            additions: totalAdditions,
            deletions: totalDeletions,
            files: files.length,
        },
    };
}
/**
 * Detects scope from file paths.
 */
function detectScope(files) {
    if (files.length === 0)
        return null;
    // Get first directory from each file
    const dirs = {};
    for (const file of files) {
        const parts = file.split('/');
        if (parts.length > 1) {
            const dir = parts[0] === 'src' && parts.length > 2 ? parts[1] : parts[0];
            dirs[dir] = (dirs[dir] || 0) + 1;
        }
    }
    // Find most common directory
    let maxDir = null;
    let maxCount = 0;
    for (const [dir, count] of Object.entries(dirs)) {
        if (count > maxCount) {
            maxDir = dir;
            maxCount = count;
        }
    }
    return maxDir;
}
/**
 * Generates a short description.
 */
function generateDescription(type, files, additions, deletions) {
    // Get the most significant file (without extension)
    const mainFile = files[0]?.split('/').pop()?.replace(/\.[^.]+$/, '') || 'code';
    const actionVerbs = {
        feat: 'add',
        fix: 'fix',
        docs: 'update',
        style: 'format',
        refactor: 'refactor',
        test: 'add tests for',
        chore: 'update',
        perf: 'optimize',
        remove: 'remove',
        ci: 'update',
    };
    const verb = actionVerbs[type] || 'update';
    if (files.length === 1) {
        return `${verb} ${mainFile}`;
    }
    else if (additions > deletions * 2) {
        return `${verb} ${mainFile} and related files`;
    }
    else if (deletions > additions * 2) {
        return `remove unused code from ${mainFile}`;
    }
    else {
        return `${verb} ${mainFile} (${files.length} files)`;
    }
}
/**
 * Generates body bullet points.
 */
function generateBody(files, stats) {
    const bullets = [];
    // Add file summaries (up to 5)
    for (const stat of stats.slice(0, 5)) {
        const shortFile = stat.file.split('/').slice(-2).join('/');
        if (stat.additions > 0 && stat.deletions > 0) {
            bullets.push(`Update ${shortFile}`);
        }
        else if (stat.additions > 0) {
            bullets.push(`Add ${shortFile}`);
        }
        else if (stat.deletions > 0) {
            bullets.push(`Remove from ${shortFile}`);
        }
    }
    if (stats.length > 5) {
        bullets.push(`...and ${stats.length - 5} more files`);
    }
    return bullets;
}
/**
 * Formats the commit message.
 */
function formatCommitMessage(suggestion) {
    const scope = suggestion.scope ? `(${suggestion.scope})` : '';
    const header = `${suggestion.type}${scope}: ${suggestion.description}`;
    if (suggestion.body.length === 0) {
        return header;
    }
    const body = suggestion.body.map(b => `- ${b}`).join('\n');
    return `${header}\n\n${body}`;
}
/**
 * Executes git commit with the given message.
 */
function executeCommit(message) {
    try {
        (0, child_process_1.execSync)(`git commit -m "${message.replace(/"/g, '\\"')}"`, {
            encoding: 'utf-8',
            timeout: 10000,
        });
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error.message || 'Commit failed' };
    }
}
// =============================================================================
// UI BUILDERS
// =============================================================================
/**
 * Builds the commit suggestion screen.
 */
function buildCommitScreen(suggestion) {
    const width = 55;
    const lines = [];
    lines.push(colors_js_1.colors.frame(`╭${'─'.repeat(width - 2)}╮`));
    lines.push(colors_js_1.colors.frame('│') + chalk_1.default.bold.yellow('  🐕 Sniffing your changes...') + ' '.repeat(width - 32) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // Files changed
    lines.push(colors_js_1.colors.frame('│') + `  📁 Files changed: ${suggestion.stats.files}` + ' '.repeat(width - 24 - String(suggestion.stats.files).length) + colors_js_1.colors.frame('│'));
    // Show up to 4 files
    for (const file of suggestion.filesChanged.slice(0, 4)) {
        const shortFile = file.file.length > 30 ? '...' + file.file.slice(-27) : file.file;
        const stats = colors_js_1.colors.healthy(`+${file.additions}`) + ', ' + colors_js_1.colors.danger(`-${file.deletions}`);
        const line = `     ${shortFile.padEnd(32)} (${stats})`;
        // Rough padding
        lines.push(colors_js_1.colors.frame('│') + line + ' '.repeat(Math.max(0, width - 2 - 50)) + colors_js_1.colors.frame('│'));
    }
    if (suggestion.filesChanged.length > 4) {
        lines.push(colors_js_1.colors.frame('│') + colors_js_1.colors.textDim(`     ...and ${suggestion.filesChanged.length - 4} more`) + ' '.repeat(width - 20 - String(suggestion.filesChanged.length - 4).length) + colors_js_1.colors.frame('│'));
    }
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + '  📝 Suggested commit message:' + ' '.repeat(width - 33) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // Commit message
    const fullMessage = formatCommitMessage(suggestion);
    const msgLines = fullMessage.split('\n');
    for (const msgLine of msgLines.slice(0, 6)) {
        const truncated = msgLine.length > width - 6 ? msgLine.slice(0, width - 9) + '...' : msgLine;
        lines.push(colors_js_1.colors.frame('│') + chalk_1.default.cyan(`  ${truncated}`) + ' '.repeat(Math.max(0, width - 4 - truncated.length)) + colors_js_1.colors.frame('│'));
    }
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // Dog message
    const dogMsg = `*sniff sniff* I smell ${suggestion.stats.additions} new lines!`;
    lines.push(colors_js_1.colors.frame('│') + colors_js_1.colors.happy(`  💬 "${dogMsg}"`) + ' '.repeat(Math.max(0, width - 6 - dogMsg.length)) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + `  ${chalk_1.default.bold('[Y]')} Use this  ${chalk_1.default.bold('[E]')} Edit  ${chalk_1.default.bold('[B]')} Back` + ' '.repeat(width - 38) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame(`╰${'─'.repeat(width - 2)}╯`));
    return lines.join('\n');
}
/**
 * Builds the no staged changes screen.
 */
function buildNoStagedScreen() {
    const width = 55;
    const lines = [];
    lines.push(colors_js_1.colors.frame(`╭${'─'.repeat(width - 2)}╮`));
    lines.push(colors_js_1.colors.frame('│') + chalk_1.default.bold.yellow('  🐕 Smart Commit') + ' '.repeat(width - 20) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // Confused puppy
    const puppy = [
        '         ∧＿∧  ? ',
        '        (◔ᴥ◔)   ',
        '       ╭─∪─∪─╮  ',
        '       │ ░░░ │  ',
        '       ╰─────╯  ',
        '        ││ ││   ',
    ];
    for (const line of puppy) {
        const padding = Math.floor((width - 2 - line.length) / 2);
        lines.push(colors_js_1.colors.frame('│') + ' '.repeat(padding) + colors_js_1.colors.dogBody(line) + ' '.repeat(width - 2 - padding - line.length) + colors_js_1.colors.frame('│'));
    }
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + colors_js_1.colors.warning("  I don't smell any staged changes!") + ' '.repeat(width - 39) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + colors_js_1.colors.textDim('  Try `git add <files>` first 🐕') + ' '.repeat(width - 35) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + colors_js_1.colors.textDim('  Press any key to go back...') + ' '.repeat(width - 33) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame(`╰${'─'.repeat(width - 2)}╯`));
    return lines.join('\n');
}
/**
 * Builds the commit success screen.
 */
function buildCommitSuccessScreen(message) {
    const width = 55;
    const lines = [];
    lines.push(colors_js_1.colors.frame(`╭${'─'.repeat(width - 2)}╮`));
    lines.push(colors_js_1.colors.frame('│') + chalk_1.default.bold.green('  ✅ Commit Successful!') + ' '.repeat(width - 26) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // Happy puppy
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
    // Show first line of commit message
    const firstLine = message.split('\n')[0];
    const truncated = firstLine.length > width - 10 ? firstLine.slice(0, width - 13) + '...' : firstLine;
    lines.push(colors_js_1.colors.frame('│') + chalk_1.default.cyan(`  "${truncated}"`) + ' '.repeat(Math.max(0, width - 6 - truncated.length)) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + colors_js_1.colors.happy("  💬 *happy bark* Good commit! +15 XP") + ' '.repeat(width - 41) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + colors_js_1.colors.textDim('  Press any key to continue...') + ' '.repeat(width - 34) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame(`╰${'─'.repeat(width - 2)}╯`));
    return lines.join('\n');
}
//# sourceMappingURL=commit.js.map