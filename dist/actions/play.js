"use strict";
/**
 * =============================================================================
 * PLAY.TS - Play Action Handler for GitBuddy
 * =============================================================================
 *
 * This file implements the "Play" action, available once the pet reaches
 * level 2. Playing with the pet is a fun interaction that rewards XP and,
 * for the "fetch" activity, reveals interesting repository statistics.
 *
 * Available play activities:
 * 1. Do a Trick - Pet does a backflip animation (+5 XP)
 * 2. Play Fetch - Pet fetches a ball and returns with a fun fact (+10 XP)
 * 3. Belly Rubs - Pet rolls over for belly rubs (+3 XP)
 *
 * Each activity has a 3-frame ASCII animation sequence that plays
 * when the action is performed. The animations add life and personality
 * to the pet interactions.
 *
 * Key Features:
 * - Three distinct play activities with unique animations
 * - Variable XP rewards based on activity complexity
 * - Fun repository facts during fetch (makes use of repo stats)
 * - Text wrapping for long fun facts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlayFrames = getPlayFrames;
exports.getRandomPlayAction = getRandomPlayAction;
exports.buildPlayMenu = buildPlayMenu;
exports.buildPlayResult = buildPlayResult;
const chalk_1 = __importDefault(require("chalk")); // Terminal string styling library
const colors_js_1 = require("../ui/colors.js");
const scanner_js_1 = require("../health/scanner.js");
const dialogue_js_1 = require("../pet/dialogue.js");
// =============================================================================
// ANIMATION FRAMES
// =============================================================================
/**
 * Trick Animation Frames
 *
 * Three-frame animation showing the pet doing a backflip.
 * Frame 0: Ready stance
 * Frame 1: Mid-backflip (upside down)
 * Frame 2: Landing with stars (ta-da!)
 */
const trickFrames = [
    // Frame 0: Ready position
    [
        '         ∧＿∧    ',
        '        (◕ᴥ◕)   ',
        '       ╭─∪─∪─╮  ',
        '       │ ▒▒▒ │  ',
        '       ╰─────╯  ',
        '        ││ ││   ',
        '                ',
        '   Ready...     ', // Action text
    ],
    // Frame 1: Mid-backflip (body inverted)
    [
        '                ',
        '       ╭─────╮  ', // Body now at top
        '       │ ▒▒▒ │  ',
        '        (ᵔᴥᵔ)   ', // Face below body
        '         ∨＿∨    ', // Ears pointing down
        '                ',
        '                ',
        '   *backflip!*  ',
    ],
    // Frame 2: Successful landing with celebration
    [
        '    ★           ', // Stars appear
        '         ∧＿∧ ★  ',
        '   ★    (ᵔᴥᵔ)   ', // Happy squinting eyes
        '       ╭─∪─∪─╮  ',
        '       │ ▒▒▒ │  ',
        '       ╰─────╯  ',
        '       ╱╲  ╱╲   ', // Proud stance
        '   *ta-da!*     ',
    ],
];
/**
 * Fetch Animation Frames
 *
 * Three-frame animation showing the pet playing fetch.
 * Frame 0: Spots the ball
 * Frame 1: Running after it (zoom effect)
 * Frame 2: Returns with the ball
 */
const fetchFrames = [
    // Frame 0: Sees the ball
    [
        '         ∧＿∧  ◎ ', // Ball (◎) appears
        '        (◕ᴥ◕)   ', // Alert eyes
        '       ╭─∪─∪─╮  ',
        '       │ ▒▒▒ │  ',
        '       ╰─────╯  ',
        '        ││ ││   ',
        '                ',
        '   *sees ball*  ',
    ],
    // Frame 1: Running after the ball
    [
        '                ',
        '                ',
        '    ε=ε=ε=┏(◕ᴥ◕)┛', // Speed lines (ε=ε=ε=) show running
        '                ',
        '                ',
        '                ',
        '                ',
        '   *zooooom*    ',
    ],
    // Frame 2: Got the ball!
    [
        '         ∧＿∧    ',
        '        (ᵔᴥᵔ)◎  ', // Ball in mouth
        '       ╭─∪─∪─╮  ',
        '       │ ▒▒▒ │∼ ', // Tail wagging
        '       ╰─────╯  ',
        '        ││ ││   ',
        '                ',
        '   *got it!*    ',
    ],
];
/**
 * Belly Rub Animation Frames
 *
 * Three-frame animation showing the pet asking for belly rubs.
 * Frame 0: Normal standing position
 * Frame 1: Rolling over (belly up)
 * Frame 2: Happy with hearts (enjoying the rubs)
 */
const bellyFrames = [
    // Frame 0: Standing, about to roll
    [
        '         ∧＿∧    ',
        '        (◕ᴥ◕)   ',
        '       ╭─∪─∪─╮  ',
        '       │ ▒▒▒ │  ',
        '       ╰─────╯  ',
        '        ││ ││   ',
        '                ',
        '   *rolls over* ',
    ],
    // Frame 1: Belly up position (sideways view)
    [
        '        ╭─────╮ ', // Body on its back
        '        │ ▒▒▒ │ ',
        '   ││   ├─────┤ ', // Legs sticking out to side
        '   ││   │(ᵔᴥᵔ)│ ', // Happy upside-down face
        '        ├─────┤ ',
        '        │ ▒▒▒ │ ',
        '   ││   ╰─────╯ ',
        '   *belly up!*  ',
    ],
    // Frame 2: Enjoying belly rubs with hearts
    [
        '    ♥   ╭─────╮ ', // Hearts appear
        '        │ ▒▒▒ │ ',
        '   ││ ♥ ├─────┤ ', // More hearts
        '   ││   │(^ᴥ^)│ ', // Super happy face
        '        ├─────┤ ',
        '        │ ▒▒▒ │ ',
        '   ││   ╰─────╯ ',
        '   *happy wags* ',
    ],
];
// =============================================================================
// ANIMATION HELPERS
// =============================================================================
/**
 * Gets the animation frames for a specific play action.
 * Used by the main game loop to display animations.
 *
 * @param action - The play action ('trick', 'fetch', or 'belly')
 * @returns An array of frame arrays (each frame is an array of lines)
 */
function getPlayFrames(action) {
    switch (action) {
        case 'trick':
            return trickFrames;
        case 'fetch':
            return fetchFrames;
        case 'belly':
            return bellyFrames;
    }
}
/**
 * Selects a random play action.
 * Could be used for automated play or random events.
 *
 * @returns A random PlayAction
 */
function getRandomPlayAction() {
    const actions = ['trick', 'fetch', 'belly'];
    return actions[Math.floor(Math.random() * actions.length)];
}
// =============================================================================
// PLAY MENU SCREEN
// =============================================================================
/**
 * Builds the play selection menu screen.
 * Shows available play activities with their XP rewards.
 * Displayed when user presses [P] from the main screen.
 *
 * @returns A complete bordered screen with play options
 */
function buildPlayMenu() {
    const width = 50;
    const lines = [];
    // -------------------------------------------------------------------------
    // Header
    // -------------------------------------------------------------------------
    lines.push(colors_js_1.colors.frame(`╭${'─'.repeat(width - 2)}╮`));
    lines.push(colors_js_1.colors.frame('│') + chalk_1.default.bold.yellow('  🎾 Play Time!') + ' '.repeat(width - 18) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // -------------------------------------------------------------------------
    // Excited Puppy Sprite
    // -------------------------------------------------------------------------
    const puppy = [
        '         ∧＿∧    ',
        '        (◕ᴥ◕)   ', // Alert, excited eyes
        '       ╭─∪─∪─╮  ',
        '       │ ▒▒▒ │∼ ', // Wagging tail
        '       ╰─────╯  ',
        '       ╱╲  ╱╲   ', // Ready stance
    ];
    // Center the puppy sprite
    for (const line of puppy) {
        const padding = Math.floor((width - 2 - line.length) / 2);
        lines.push(colors_js_1.colors.frame('│') +
            ' '.repeat(padding) +
            colors_js_1.colors.dogBody(line) +
            ' '.repeat(width - 2 - padding - line.length) +
            colors_js_1.colors.frame('│'));
    }
    // -------------------------------------------------------------------------
    // Activity Options
    // -------------------------------------------------------------------------
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + '  Choose an activity:' + ' '.repeat(width - 24) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // Option 1: Trick (+5 XP)
    lines.push(colors_js_1.colors.frame('│') + `  ${chalk_1.default.bold('[1]')} Do a trick (+5 XP)` + ' '.repeat(width - 27) + colors_js_1.colors.frame('│'));
    // Option 2: Fetch (+10 XP, includes fun fact)
    lines.push(colors_js_1.colors.frame('│') + `  ${chalk_1.default.bold('[2]')} Play fetch (+10 XP, fun fact!)` + ' '.repeat(width - 38) + colors_js_1.colors.frame('│'));
    // Option 3: Belly rubs (+3 XP)
    lines.push(colors_js_1.colors.frame('│') + `  ${chalk_1.default.bold('[3]')} Belly rubs (+3 XP)` + ' '.repeat(width - 26) + colors_js_1.colors.frame('│'));
    // -------------------------------------------------------------------------
    // Footer with instructions
    // -------------------------------------------------------------------------
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + colors_js_1.colors.textDim('  Press 1, 2, 3 or [Esc] to cancel') + ' '.repeat(width - 38) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame(`╰${'─'.repeat(width - 2)}╯`));
    return lines.join('\n');
}
// =============================================================================
// PLAY RESULT SCREEN
// =============================================================================
/**
 * Builds the play result screen after completing an activity.
 * Shows the final animation frame, XP earned, and for fetch,
 * displays a fun fact about the repository.
 *
 * @param action - The play action that was performed
 * @returns An object with the screen string and XP earned
 *
 * XP Rewards:
 * - Trick: 5 XP
 * - Fetch: 10 XP (higher because it includes educational content)
 * - Belly: 3 XP (quick, simple interaction)
 */
async function buildPlayResult(action) {
    const width = 50;
    const lines = [];
    let xp = 0;
    let funFact = '';
    // -------------------------------------------------------------------------
    // Calculate XP and Generate Fun Fact (for fetch)
    // -------------------------------------------------------------------------
    if (action === 'fetch') {
        // Fetch is special - it retrieves repo stats and generates a fun fact
        const stats = await (0, scanner_js_1.getRepoStats)();
        funFact = (0, dialogue_js_1.getRepoFunFact)({
            days: stats.firstCommitDays, // How old the repo is
            commits: stats.totalCommits, // Total commit count
            topExt: stats.topExtension.ext, // Most common file extension
            count: stats.topExtension.count, // Count of that extension
            avgLength: stats.avgCommitMessageLength, // Average commit message length
        });
        xp = 10; // Highest XP for most complex activity
    }
    else if (action === 'trick') {
        xp = 5; // Medium XP for trick
    }
    else {
        xp = 3; // Lowest XP for belly rubs (but still cute!)
    }
    // -------------------------------------------------------------------------
    // Header
    // -------------------------------------------------------------------------
    lines.push(colors_js_1.colors.frame(`╭${'─'.repeat(width - 2)}╮`));
    lines.push(colors_js_1.colors.frame('│') + chalk_1.default.bold.yellow('  🎾 Play Complete!') + ' '.repeat(width - 22) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // -------------------------------------------------------------------------
    // Final Animation Frame (celebration frame)
    // -------------------------------------------------------------------------
    const finalFrame = getPlayFrames(action)[2]; // Always use the final frame
    for (const line of finalFrame) {
        const padding = Math.floor((width - 2 - line.length) / 2);
        lines.push(colors_js_1.colors.frame('│') +
            ' '.repeat(padding) +
            colors_js_1.colors.dogBody(line) +
            ' '.repeat(width - 2 - padding - line.length) +
            colors_js_1.colors.frame('│'));
    }
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // -------------------------------------------------------------------------
    // Fun Fact Display (fetch only)
    // -------------------------------------------------------------------------
    if (funFact) {
        // Wrap the fun fact to fit within the box
        const wrappedFact = wrapText(funFact, width - 6);
        // Display each line with a lightbulb emoji on the first line
        for (const factLine of wrappedFact) {
            lines.push(colors_js_1.colors.frame('│') + `  💡 ${factLine}` + ' '.repeat(Math.max(0, width - 5 - factLine.length - 2)) + colors_js_1.colors.frame('│'));
        }
        lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    }
    // -------------------------------------------------------------------------
    // XP Earned Display
    // -------------------------------------------------------------------------
    lines.push(colors_js_1.colors.frame('│') + colors_js_1.colors.xpFilled(`  +${xp} XP earned!`) + ' '.repeat(width - 17 - String(xp).length) + colors_js_1.colors.frame('│'));
    // -------------------------------------------------------------------------
    // Footer
    // -------------------------------------------------------------------------
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + colors_js_1.colors.textDim('  Press any key to return...') + ' '.repeat(width - 32) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame(`╰${'─'.repeat(width - 2)}╯`));
    return { screen: lines.join('\n'), xp };
}
// =============================================================================
// TEXT WRAPPING HELPER
// =============================================================================
/**
 * Wraps text to fit within a specified maximum width.
 * Breaks on word boundaries to avoid mid-word breaks.
 * Used for wrapping fun facts that may be longer than one line.
 *
 * @param text - The text to wrap
 * @param maxWidth - Maximum characters per line
 * @returns An array of lines, each within the maxWidth limit
 */
function wrapText(text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    for (const word of words) {
        // Check if adding this word would exceed the max width
        if (currentLine.length + word.length + 1 <= maxWidth) {
            // Add word to current line (with space if not first word)
            currentLine += (currentLine ? ' ' : '') + word;
        }
        else {
            // Start a new line with this word
            if (currentLine)
                lines.push(currentLine);
            currentLine = word;
        }
    }
    // Don't forget the last line
    if (currentLine)
        lines.push(currentLine);
    // Return at least an empty string if no lines were created
    return lines.length > 0 ? lines : [''];
}
//# sourceMappingURL=play.js.map