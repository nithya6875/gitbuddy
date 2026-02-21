"use strict";
/**
 * =============================================================================
 * INTRO.TS - Introduction and Special Screen Builders for GitBuddy
 * =============================================================================
 *
 * This file handles all the special-purpose screens that appear outside of
 * the main gameplay loop. These include:
 *
 * - First-run intro animation sequence (kennel with emerging puppy)
 * - Pet naming prompt screen
 * - Welcome message after naming
 * - Goodbye/exit screen
 * - Error screen for non-git directories
 *
 * Each screen is built as a bordered box with centered ASCII art and
 * appropriate messages, maintaining visual consistency with the main UI.
 *
 * Key Features:
 * - Multi-frame intro animation (3 stages)
 * - Personalized screens using the pet's name
 * - Helpful error messaging for common issues
 * - Consistent box-drawing style throughout
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.kennelExitFrames = exports.kennelFrames = void 0;
exports.buildIntroFrame = buildIntroFrame;
exports.buildExitFrame = buildExitFrame;
exports.getKennelFrameCount = getKennelFrameCount;
exports.getKennelExitFrameCount = getKennelExitFrameCount;
exports.buildNamePrompt = buildNamePrompt;
exports.buildWelcomeMessage = buildWelcomeMessage;
exports.buildGoodbyeScreen = buildGoodbyeScreen;
exports.buildResetScreen = buildResetScreen;
exports.buildNoGitScreen = buildNoGitScreen;
const chalk_1 = __importDefault(require("chalk")); // Terminal string styling library
const colors_js_1 = require("./colors.js");
// =============================================================================
// INTRO ANIMATION FRAMES
// =============================================================================
/**
 * ASCII art frames for the intro animation sequence.
 * These frames are displayed in order to create an animated
 * "puppy emerging from kennel" effect.
 *
 * Frame 0: Kennel with question marks (something is stirring)
 * Frame 1: Eyes appear in the kennel opening
 * Frame 2: Puppy emerges with stars and celebration text
 */
/**
 * Kennel frames for the intro animation (puppy emerging).
 * Exported so they can be used for startup animation.
 */
exports.kennelFrames = [
    // Frame 0: Mystery in the kennel
    [
        '       ╭───────╮       ',
        '      ╱ ░░░░░░░ ╲      ',
        '     ╱ ░░░░░░░░░ ╲     ',
        '    │   ░░░░░░░   │    ',
        '    │   ╭─────╮   │    ',
        '    │   │ ? ? │   │    ', // Question marks - mystery!
        '    │   │     │   │    ',
        '    ╰───┴─────┴───╯    ',
    ],
    // Frame 1: Eyes appear
    [
        '       ╭───────╮       ',
        '      ╱ ░░░░░░░ ╲      ',
        '     ╱ ░░░░░░░░░ ╲     ',
        '    │   ░░░░░░░   │    ',
        '    │   ╭─────╮   │    ',
        '    │   │ ◕ ◕ │   │    ', // Cute eyes peeking out
        '    │   │  ▽  │   │    ', // Little nose
        '    ╰───┴─────┴───╯    ',
    ],
    // Frame 2: Puppy half out
    [
        '       ╭───────╮       ',
        '      ╱ ░░░░░░░ ╲      ',
        '     ╱   ∧＿∧    ╲     ', // Ears peeking over roof
        '    │   (◕ᴥ◕)    │    ', // Face visible
        '    │   ╭─────╮   │    ',
        '    │   │ ▒▒▒ │   │    ', // Body in doorway
        '    │   │     │   │    ',
        '    ╰───┴─────┴───╯    ',
    ],
    // Frame 3: Puppy emerges!
    [
        '              ∧＿∧      ', // Ears
        '       ★    (◕ᴥ◕)   ★  ', // Happy face with stars
        '            ╭─∪─∪─╮    ', // Body
        '    ♥       │ ▒▒▒ │    ', // Heart and fur pattern
        '            ╰─────╯    ',
        '             ││ ││     ', // Legs
        '                       ',
        '    A wild puppy appeared!', // Celebratory text
    ],
];
/**
 * Kennel frames for the exit animation (puppy going back in).
 * These are essentially the reverse of the intro frames.
 */
exports.kennelExitFrames = [
    // Frame 0: Puppy starts walking back
    [
        '              ∧＿∧      ', // Ears
        '            (◕ᴥ◕)      ', // Looking toward kennel
        '            ╭─∪─∪─╮    ', // Body
        '            │ ▒▒▒ │    ', // Fur pattern
        '            ╰─────╯    ',
        '             ││ ││     ', // Legs
        '                       ',
        '    *yawn* Time for bed...',
    ],
    // Frame 1: Puppy half in kennel
    [
        '       ╭───────╮       ',
        '      ╱ ░░░░░░░ ╲      ',
        '     ╱   ∧＿∧    ╲     ', // Ears visible
        '    │   (◕ᴥ◕)    │    ', // Face visible
        '    │   ╭─────╮   │    ',
        '    │   │ ▒▒▒ │   │    ', // Body going in
        '    │   │     │   │    ',
        '    ╰───┴─────┴───╯    ',
    ],
    // Frame 2: Just eyes visible
    [
        '       ╭───────╮       ',
        '      ╱ ░░░░░░░ ╲      ',
        '     ╱ ░░░░░░░░░ ╲     ',
        '    │   ░░░░░░░   │    ',
        '    │   ╭─────╮   │    ',
        '    │   │ ◕ ◕ │   │    ', // Eyes peeking out
        '    │   │  ▽  │   │    ', // Nose
        '    ╰───┴─────┴───╯    ',
    ],
    // Frame 3: Sleeping in kennel
    [
        '       ╭───────╮       ',
        '      ╱ ░░░░░░░ ╲   Zz ',
        '     ╱ ░░░░░░░░░ ╲  Z  ',
        '    │   ░░░░░░░   │    ',
        '    │   ╭─────╮   │    ',
        '    │   │ - - │   │    ', // Closed eyes (sleeping)
        '    │   │  ▽  │   │    ',
        '    ╰───┴─────┴───╯    ',
    ],
];
// =============================================================================
// INTRO FRAME BUILDER
// =============================================================================
/**
 * Builds a single frame of the intro animation sequence.
 * Used to display the "puppy emerging from kennel" animation
 * during startup.
 *
 * @param frame - Frame number (0, 1, 2, or 3)
 * @returns A complete bordered screen with the animation frame
 *
 * Animation sequence:
 * - Frame 0: "Something is stirring..." message
 * - Frame 1: "*wiggle wiggle*" message
 * - Frame 2: Puppy half out
 * - Frame 3: Puppy emerged (no additional message needed)
 */
function buildIntroFrame(frame) {
    const width = 50; // Fixed width for intro screens
    const lines = [];
    // -------------------------------------------------------------------------
    // Header - Top border and title
    // -------------------------------------------------------------------------
    lines.push(colors_js_1.colors.frame(`╭${'─'.repeat(width - 2)}╮`));
    lines.push(colors_js_1.colors.frame('│') + chalk_1.default.bold.yellow('  🐕 GitBuddy') + ' '.repeat(width - 16) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // -------------------------------------------------------------------------
    // Animation Frame - Centered ASCII art
    // -------------------------------------------------------------------------
    // Select the appropriate frame, capping at the maximum available
    const artFrame = exports.kennelFrames[Math.min(frame, exports.kennelFrames.length - 1)];
    // Center each line of the ASCII art within the box
    for (const line of artFrame) {
        const padding = Math.floor((width - 2 - line.length) / 2);
        lines.push(colors_js_1.colors.frame('│') +
            ' '.repeat(padding) +
            colors_js_1.colors.dogBody(line) +
            ' '.repeat(width - 2 - padding - line.length) +
            colors_js_1.colors.frame('│'));
    }
    // -------------------------------------------------------------------------
    // Animation Message - Frame-specific text
    // -------------------------------------------------------------------------
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // Show appropriate message for early frames
    if (frame < 3) {
        const messages = ['  Something is stirring...', '  *wiggle wiggle*', '  *stretches*'];
        const msg = messages[frame] || '';
        lines.push(colors_js_1.colors.frame('│') + chalk_1.default.italic(msg) + ' '.repeat(width - 2 - msg.length) + colors_js_1.colors.frame('│'));
    }
    else {
        // Final frame doesn't need extra message (ASCII art includes it)
        lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    }
    // -------------------------------------------------------------------------
    // Bottom Border
    // -------------------------------------------------------------------------
    lines.push(colors_js_1.colors.frame(`╰${'─'.repeat(width - 2)}╯`));
    return lines.join('\n');
}
/**
 * Builds a single frame of the exit animation sequence.
 * Used to display the "puppy going back into kennel" animation
 * when the user exits.
 *
 * @param frame - Frame number (0, 1, 2, or 3)
 * @returns A complete bordered screen with the animation frame
 */
function buildExitFrame(frame) {
    const width = 50;
    const lines = [];
    // -------------------------------------------------------------------------
    // Header
    // -------------------------------------------------------------------------
    lines.push(colors_js_1.colors.frame(`╭${'─'.repeat(width - 2)}╮`));
    lines.push(colors_js_1.colors.frame('│') + chalk_1.default.bold.yellow('  🐕 GitBuddy') + ' '.repeat(width - 16) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // -------------------------------------------------------------------------
    // Animation Frame - Centered ASCII art
    // -------------------------------------------------------------------------
    const artFrame = exports.kennelExitFrames[Math.min(frame, exports.kennelExitFrames.length - 1)];
    for (const line of artFrame) {
        const padding = Math.floor((width - 2 - line.length) / 2);
        lines.push(colors_js_1.colors.frame('│') +
            ' '.repeat(padding) +
            colors_js_1.colors.dogBody(line) +
            ' '.repeat(width - 2 - padding - line.length) +
            colors_js_1.colors.frame('│'));
    }
    // -------------------------------------------------------------------------
    // Animation Message
    // -------------------------------------------------------------------------
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    const messages = ['  *walks toward kennel*', '  *goes inside*', '  *curls up*', '  Goodnight! Come back soon!'];
    const msg = messages[Math.min(frame, messages.length - 1)];
    lines.push(colors_js_1.colors.frame('│') + chalk_1.default.italic(msg) + ' '.repeat(width - 2 - msg.length) + colors_js_1.colors.frame('│'));
    // -------------------------------------------------------------------------
    // Bottom Border
    // -------------------------------------------------------------------------
    lines.push(colors_js_1.colors.frame(`╰${'─'.repeat(width - 2)}╯`));
    return lines.join('\n');
}
/**
 * Returns the number of kennel intro frames.
 */
function getKennelFrameCount() {
    return exports.kennelFrames.length;
}
/**
 * Returns the number of kennel exit frames.
 */
function getKennelExitFrameCount() {
    return exports.kennelExitFrames.length;
}
// =============================================================================
// NAME PROMPT SCREEN
// =============================================================================
/**
 * Builds the pet naming prompt screen.
 * Displayed after the intro animation to ask the user for their pet's name.
 * Features a friendly puppy sprite looking expectantly at the user.
 *
 * @returns A complete bordered screen with naming prompt
 */
function buildNamePrompt() {
    const width = 50;
    const lines = [];
    // -------------------------------------------------------------------------
    // Header
    // -------------------------------------------------------------------------
    lines.push(colors_js_1.colors.frame(`╭${'─'.repeat(width - 2)}╮`));
    lines.push(colors_js_1.colors.frame('│') + chalk_1.default.bold.yellow('  🐕 GitBuddy') + ' '.repeat(width - 16) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // -------------------------------------------------------------------------
    // Puppy Sprite - Cute waiting pose
    // -------------------------------------------------------------------------
    const puppy = [
        '         ∧＿∧    ', // Ears perked up
        '        (◕ᴥ◕)   ', // Bright eyes, happy expression
        '       ╭─∪─∪─╮  ', // Body
        '       │ ▒▒▒ │  ', // Fur texture
        '       ╰─────╯  ',
        '        ││ ││   ', // Standing position
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
    // Naming Prompt Message
    // -------------------------------------------------------------------------
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + chalk_1.default.cyan('  What would you like to name me?') + ' '.repeat(width - 35) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // -------------------------------------------------------------------------
    // Bottom Border
    // -------------------------------------------------------------------------
    lines.push(colors_js_1.colors.frame(`╰${'─'.repeat(width - 2)}╯`));
    return lines.join('\n');
}
// =============================================================================
// WELCOME MESSAGE SCREEN
// =============================================================================
/**
 * Builds the welcome message screen displayed after naming the pet.
 * Shows an excited puppy with stars and hearts, introducing itself
 * to the user with its new name.
 *
 * @param name - The name the user gave to their pet
 * @returns A complete bordered screen with welcome message
 */
function buildWelcomeMessage(name) {
    const width = 50;
    const lines = [];
    // -------------------------------------------------------------------------
    // Header - Now showing the pet's name!
    // -------------------------------------------------------------------------
    lines.push(colors_js_1.colors.frame(`╭${'─'.repeat(width - 2)}╮`));
    lines.push(colors_js_1.colors.frame('│') + chalk_1.default.bold.yellow(`  🐕 ${name}`) + ' '.repeat(width - 6 - name.length) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // -------------------------------------------------------------------------
    // Excited Puppy Sprite - Happy celebration pose
    // -------------------------------------------------------------------------
    const puppy = [
        '    ★    ∧＿∧  ★ ', // Stars around the ears
        '   ♥    (ᵔᴥᵔ)   ', // Heart and happy squinted eyes
        '       ╭─∪─∪─╮  ',
        '       │ ▒▒▒ │∼ ', // Wagging tail indicator (~)
        '       ╰─────╯  ',
        '       ╱╲ ╱╲    ', // Excited standing pose
    ];
    for (const line of puppy) {
        const padding = Math.floor((width - 2 - line.length) / 2);
        lines.push(colors_js_1.colors.frame('│') +
            ' '.repeat(padding) +
            colors_js_1.colors.dogBody(line) +
            ' '.repeat(width - 2 - padding - line.length) +
            colors_js_1.colors.frame('│'));
    }
    // -------------------------------------------------------------------------
    // Welcome Messages - Personalized greeting
    // -------------------------------------------------------------------------
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // Three lines of welcome text
    const msg1 = `  Hi! I'm ${name}!`;
    const msg2 = '  I\'ll be living in your terminal from now on.';
    const msg3 = '  Take good care of me! 🐾';
    lines.push(colors_js_1.colors.frame('│') + chalk_1.default.bold(msg1) + ' '.repeat(width - 2 - msg1.length) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + msg2 + ' '.repeat(width - 2 - msg2.length) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + msg3 + ' '.repeat(width - 2 - msg3.length) + colors_js_1.colors.frame('│'));
    // -------------------------------------------------------------------------
    // Continue Prompt and Bottom Border
    // -------------------------------------------------------------------------
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + colors_js_1.colors.textDim('  Press any key to continue...') + ' '.repeat(width - 34) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame(`╰${'─'.repeat(width - 2)}╯`));
    return lines.join('\n');
}
// =============================================================================
// GOODBYE SCREEN
// =============================================================================
/**
 * Builds the goodbye screen displayed when the user quits.
 * Shows the pet waving goodbye with a friendly farewell message.
 * This screen provides a nice ending to each session.
 *
 * @param name - The pet's name for personalized goodbye
 * @returns A complete bordered screen with goodbye message
 */
function buildGoodbyeScreen(name) {
    const width = 50;
    const lines = [];
    // -------------------------------------------------------------------------
    // Header
    // -------------------------------------------------------------------------
    lines.push(colors_js_1.colors.frame(`╭${'─'.repeat(width - 2)}╮`));
    lines.push(colors_js_1.colors.frame('│') + chalk_1.default.bold.yellow(`  🐕 ${name}`) + ' '.repeat(width - 6 - name.length) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // -------------------------------------------------------------------------
    // Waving Puppy Sprite
    // -------------------------------------------------------------------------
    const puppy = [
        '         ∧＿∧    ',
        '        (◕ᴥ◕)ノ ', // ノ = waving paw/hand gesture
        '       ╭─∪─∪─╮  ',
        '       │ ▒▒▒ │  ',
        '       ╰─────╯  ',
        '        ││ ││   ',
    ];
    for (const line of puppy) {
        const padding = Math.floor((width - 2 - line.length) / 2);
        lines.push(colors_js_1.colors.frame('│') +
            ' '.repeat(padding) +
            colors_js_1.colors.dogBody(line) +
            ' '.repeat(width - 2 - padding - line.length) +
            colors_js_1.colors.frame('│'));
    }
    // -------------------------------------------------------------------------
    // Goodbye Messages
    // -------------------------------------------------------------------------
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + chalk_1.default.cyan('  *waves paw* Come back soon!') + ' '.repeat(width - 32) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + colors_js_1.colors.textDim('  I\'ll be waiting right here...') + ' '.repeat(width - 34) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // -------------------------------------------------------------------------
    // Bottom Border
    // -------------------------------------------------------------------------
    lines.push(colors_js_1.colors.frame(`╰${'─'.repeat(width - 2)}╯`));
    return lines.join('\n');
}
// =============================================================================
// NO GIT REPO ERROR SCREEN
// =============================================================================
/**
 * Builds the error screen displayed when GitBuddy is run outside a git repo.
 * Shows a confused puppy with helpful instructions on how to fix the issue.
 * This provides a friendly error experience rather than a cryptic message.
 *
 * @returns A complete bordered screen with error message and help
 */
/**
 * Builds the reset confirmation screen.
 * Asks user to confirm they want to reset the game.
 */
function buildResetScreen() {
    const width = 50;
    const lines = [];
    lines.push(colors_js_1.colors.frame(`╭${'─'.repeat(width - 2)}╮`));
    lines.push(colors_js_1.colors.frame('│') + chalk_1.default.bold.red('  ⚠️  Reset Game?') + ' '.repeat(width - 20) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // Sad puppy
    const sadPuppy = [
        '         ∧＿∧    ',
        '        (╥﹏╥)   ',
        '       ╭─∪─∪─╮  ',
        '       │ ░░░ │  ',
        '       ╰─────╯  ',
        '        ││ ││   ',
    ];
    for (const line of sadPuppy) {
        const padding = Math.floor((width - 2 - line.length) / 2);
        lines.push(colors_js_1.colors.frame('│') +
            ' '.repeat(padding) +
            colors_js_1.colors.dogBody(line) +
            ' '.repeat(width - 2 - padding - line.length) +
            colors_js_1.colors.frame('│'));
    }
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + colors_js_1.colors.warning('  This will delete your pet and all progress!') + ' '.repeat(width - 48) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + '  Are you sure?' + ' '.repeat(width - 17) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + chalk_1.default.bold('  [Y]') + ' Yes, reset  ' + chalk_1.default.bold('[N]') + ' No, go back' + ' '.repeat(width - 35) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame(`╰${'─'.repeat(width - 2)}╯`));
    return lines.join('\n');
}
function buildNoGitScreen() {
    const width = 50;
    const lines = [];
    // -------------------------------------------------------------------------
    // Header
    // -------------------------------------------------------------------------
    lines.push(colors_js_1.colors.frame(`╭${'─'.repeat(width - 2)}╮`));
    lines.push(colors_js_1.colors.frame('│') + chalk_1.default.bold.yellow('  🐕 GitBuddy') + ' '.repeat(width - 16) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // -------------------------------------------------------------------------
    // Confused Puppy Sprite - Tilted head with question mark
    // -------------------------------------------------------------------------
    const confusedPuppy = [
        '         ∧＿∧  ? ', // Question mark showing confusion
        '        (◔ᴥ◔)   ', // Wide eyes looking confused
        '       ╭─∪─∪─╮  ',
        '       │ ░░░ │  ', // Different pattern to show uncertainty
        '       ╰─────╯  ',
        '        ││ ││   ',
    ];
    for (const line of confusedPuppy) {
        const padding = Math.floor((width - 2 - line.length) / 2);
        lines.push(colors_js_1.colors.frame('│') +
            ' '.repeat(padding) +
            colors_js_1.colors.dogBody(line) +
            ' '.repeat(width - 2 - padding - line.length) +
            colors_js_1.colors.frame('│'));
    }
    // -------------------------------------------------------------------------
    // Error Message and Help Instructions
    // -------------------------------------------------------------------------
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // Confused action text with warning color
    lines.push(colors_js_1.colors.frame('│') + colors_js_1.colors.warning('  *confused head tilt*') + ' '.repeat(width - 25) + colors_js_1.colors.frame('│'));
    // Problem description
    lines.push(colors_js_1.colors.frame('│') + '  This doesn\'t look like a git repo...' + ' '.repeat(width - 42) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // Helpful solution suggestions
    lines.push(colors_js_1.colors.frame('│') + colors_js_1.colors.info('  Try running: git init') + ' '.repeat(width - 26) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + colors_js_1.colors.textDim('  Or navigate to a git repository first.') + ' '.repeat(width - 43) + colors_js_1.colors.frame('│'));
    lines.push(colors_js_1.colors.frame('│') + ' '.repeat(width - 2) + colors_js_1.colors.frame('│'));
    // -------------------------------------------------------------------------
    // Bottom Border
    // -------------------------------------------------------------------------
    lines.push(colors_js_1.colors.frame(`╰${'─'.repeat(width - 2)}╯`));
    return lines.join('\n');
}
//# sourceMappingURL=intro.js.map