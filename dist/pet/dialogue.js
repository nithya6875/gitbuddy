"use strict";
/**
 * =============================================================================
 * DIALOGUE.TS - Pet Speech and Messages System
 * =============================================================================
 *
 * This file contains all the dialogue and messages that the pet can say.
 * Messages are organized by mood and context, with random selection for variety.
 *
 * The pet's personality shines through these messages - it's playful, encouraging,
 * and reacts emotionally to the repository's health state.
 *
 * Key Features:
 * - Mood-based message pools (happy, sad, excited, etc.)
 * - Context-specific messages (welcome back, level up, etc.)
 * - Random selection for variety
 * - Placeholder support for dynamic values
 * - Repository fun facts for Play mode
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.repoFunFacts = exports.contextMessages = void 0;
exports.getMessage = getMessage;
exports.getContextMessage = getContextMessage;
exports.getRepoFunFact = getRepoFunFact;
// =============================================================================
// MOOD-BASED MESSAGE POOLS
// =============================================================================
/**
 * Main collection of messages organized by pet mood.
 * Each mood has an array of possible messages that can be displayed.
 * The system randomly selects from these to keep interactions fresh.
 */
const messages = {
    // -------------------------------------------------------------------------
    // HAPPY MOOD (70-89 HP) - Content and encouraging messages
    // -------------------------------------------------------------------------
    happy: [
        "*happy bark* Your commit streak is on fire!",
        "*tail wag* I love how clean this repo is!",
        "*panting* You're an amazing coder!",
        "*rolls over* Best. Human. Ever.",
        "*zooomies* Let's keep this momentum going!",
        "*bork* Your code is looking great today!",
        "*happy pant* I'm so proud of you!",
        "*tail wag intensifies* Keep up the good work!",
        "*playful bark* Wanna play fetch with some bugs?",
        "*content sigh* Life is good in this terminal.",
    ],
    // -------------------------------------------------------------------------
    // EXCITED MOOD (90-100 HP) - Over-the-top enthusiastic messages
    // -------------------------------------------------------------------------
    excited: [
        "*BORK BORK* AMAZING WORK!!!",
        "*ZOOOMIES* YOU'RE ON FIRE!!!",
        "*backflip* CLEAN CODE! GOOD HUMAN!",
        "*spins in circles* THIS IS THE BEST DAY EVER!",
        "*SUPER WAGS* I CAN'T CONTAIN MY EXCITEMENT!",
        "*bouncing* YAAAAY! YOU DID IT!",
        "*happy howl* AROOOOO! SUCCESS!",
    ],
    // -------------------------------------------------------------------------
    // NEUTRAL MOOD (50-69 HP) - Calm, observational messages
    // -------------------------------------------------------------------------
    neutral: [
        "*sniff* Just checking things out...",
        "*sits* Everything seems okay here.",
        "*yawn* A quiet day in the repo.",
        "*looks around* Anything exciting happening?",
        "*stretches* Taking it easy today.",
        "*ear flick* I'm here if you need me.",
    ],
    // -------------------------------------------------------------------------
    // SAD MOOD (25-49 HP) - Concerned, attention-seeking messages
    // -------------------------------------------------------------------------
    sad: [
        "*whimper* It's been a while since your last commit...",
        "*sad eyes* I found uncommitted files gathering dust...",
        "*paws at screen* Are you still there?",
        "*soft whine* I miss seeing your code...",
        "*droopy ears* The repo feels lonely...",
        "*small sigh* Could use some commits to cheer me up...",
        "*looks down* Don't forget about me...",
    ],
    // -------------------------------------------------------------------------
    // SICK MOOD (0-24 HP) - Urgent, worried messages
    // -------------------------------------------------------------------------
    sick: [
        "*shiver* There might be issues in the code...",
        "*cough* This repo needs some love...",
        "*weak bark* Please check on things...",
        "*shivers* Something doesn't feel right...",
        "*lies down* I need rest... and maybe some bug fixes...",
        "*whimper* The code health is concerning...",
    ],
    // -------------------------------------------------------------------------
    // SLEEPING MOOD - Peaceful dream messages (after 60s idle)
    // -------------------------------------------------------------------------
    sleeping: [
        "zzz... *dreaming of squirrels*... zzz",
        "zzz... *twitches ear*... zzz",
        "zzz... *soft snoring*... zzz",
        "zzz... *chasing dream rabbits*... zzz",
        "zzz... *happy sleep woofs*... zzz",
        "zzz... *peaceful slumber*... zzz",
    ],
    // -------------------------------------------------------------------------
    // EATING MOOD - During Feed action
    // -------------------------------------------------------------------------
    eating: [
        "*nom nom* Mmm, delicious code fixes!",
        "*chomp chomp* This bug tastes great!",
        "*happy eating noises* Thank you for the treat!",
        "*munch* Best meal ever!",
        "*licks lips* That hit the spot!",
    ],
    // -------------------------------------------------------------------------
    // PLAYING MOOD - During Play action
    // -------------------------------------------------------------------------
    playing: [
        "*zooms around* PLAYTIME!",
        "*brings ball* Let's go!",
        "*play bow* Ready when you are!",
        "*excited panting* This is so fun!",
        "*happy bark* Again! Again!",
    ],
};
// =============================================================================
// CONTEXT-SPECIFIC MESSAGES
// =============================================================================
/**
 * Messages for specific situations/events in the game.
 * These are more targeted than mood-based messages.
 */
exports.contextMessages = {
    // -------------------------------------------------------------------------
    // Welcome Back Messages - When user returns after being away
    // -------------------------------------------------------------------------
    welcomeBack: {
        long: [
            "Welcome back! I missed you so much!",
            "*excited spinning* You're back! You're back!",
            "*tackles with love* I thought you forgot about me!",
        ],
        short: [
            "You're back already!",
            "*happy bark* Couldn't stay away, huh?",
            "Back so soon? I love it!",
        ],
    },
    // -------------------------------------------------------------------------
    // Commit Streak Messages - Based on commit history
    // -------------------------------------------------------------------------
    commitStreak: {
        good: [
            "*tail wag* {count} commits this week - you're crushing it!",
            "Your commit streak of {count} days is impressive!",
            "*proud bark* Look at all those commits!",
        ],
        bad: [
            "*concerned whine* No commits lately...",
            "I miss the sound of your keyboard...",
            "*nudges* Time to write some code?",
        ],
    },
    // -------------------------------------------------------------------------
    // Clean Tree Messages - Based on working tree status
    // -------------------------------------------------------------------------
    cleanTree: {
        clean: [
            "*sparkle eyes* Clean working tree! So tidy!",
            "No uncommitted changes - you're organized!",
            "*happy dance* Everything is committed!",
        ],
        dirty: [
            "*sniff sniff* I smell uncommitted changes...",
            "Some files need attention...",
            "*points with paw* Don't forget to commit!",
        ],
    },
    // -------------------------------------------------------------------------
    // Level Up Messages - When pet gains a level
    // -------------------------------------------------------------------------
    levelUp: [
        "*HOWLS WITH JOY* LEVEL UP!!!",
        "I EVOLVED! Look at me now!",
        "*celebrates* I'm getting stronger!",
        "NEW ABILITIES UNLOCKED!",
    ],
    // -------------------------------------------------------------------------
    // First Meeting Messages - During initial setup
    // -------------------------------------------------------------------------
    firstMeeting: [
        "Hi! I'm so happy to meet you!",
        "*excited puppy energy* I'll be your coding companion!",
        "Let's make great code together!",
    ],
    // -------------------------------------------------------------------------
    // Goodbye Messages - When user quits
    // -------------------------------------------------------------------------
    goodbye: [
        "*sad tail wag* Come back soon...",
        "I'll be waiting right here!",
        "*waves paw* Bye for now!",
        "Don't forget about me!",
    ],
    // -------------------------------------------------------------------------
    // No Git Repo Messages - When not in a Git repository
    // -------------------------------------------------------------------------
    noGitRepo: [
        "*confused head tilt* This doesn't look like a git repo...",
        "I need a git repo to live in! Run 'git init' maybe?",
        "*sniff sniff* Can't find any .git directory here...",
    ],
};
// =============================================================================
// MESSAGE RETRIEVAL FUNCTIONS
// =============================================================================
/**
 * Gets a random message for the given mood.
 * Used for general pet dialogue during normal operation.
 *
 * @param mood - The pet's current mood
 * @returns A randomly selected message string
 *
 * @example
 * getMessage('happy')
 * // Returns something like "*tail wag* I love how clean this repo is!"
 */
function getMessage(mood) {
    // Get the message pool for this mood
    const pool = messages[mood];
    // Return a random message from the pool
    return pool[Math.floor(Math.random() * pool.length)];
}
/**
 * Gets a random context-specific message with optional placeholder replacement.
 * Used for situation-specific dialogue (welcome back, level up, etc.)
 *
 * @param context - The context key (e.g., 'welcomeBack', 'levelUp')
 * @param subContext - Optional sub-context for nested message groups
 * @param replacements - Optional key-value pairs for placeholder substitution
 * @returns A randomly selected message with placeholders replaced
 *
 * @example
 * getContextMessage('welcomeBack', 'long')
 * // Returns "Welcome back! I missed you so much!"
 *
 * @example
 * getContextMessage('commitStreak', 'good', { count: 12 })
 * // Returns "*tail wag* 12 commits this week - you're crushing it!"
 */
function getContextMessage(context, subContext, replacements) {
    let pool;
    // Get the context object
    const contextObj = exports.contextMessages[context];
    // Check if this context has sub-contexts (like welcomeBack.long/short)
    if (typeof contextObj === 'object' && !Array.isArray(contextObj) && subContext) {
        // Get the sub-context array
        pool = contextObj[subContext] || [];
    }
    else if (Array.isArray(contextObj)) {
        // Context is directly an array (like levelUp)
        pool = contextObj;
    }
    else {
        pool = [];
    }
    // Return empty string if no messages available
    if (pool.length === 0)
        return '';
    // Pick a random message
    let message = pool[Math.floor(Math.random() * pool.length)];
    // Replace any placeholders with actual values
    // Placeholders are in format {key} e.g., {count}
    if (replacements) {
        for (const [key, value] of Object.entries(replacements)) {
            message = message.replace(`{${key}}`, String(value));
        }
    }
    return message;
}
// =============================================================================
// REPOSITORY FUN FACTS - For Play Mode
// =============================================================================
/**
 * Template strings for repository fun facts.
 * These are shown during the Play action to share interesting repo statistics.
 * Placeholders in {braces} are replaced with actual values.
 */
exports.repoFunFacts = [
    "Did you know? The first file in this repo was created {days} days ago!",
    "You've made {commits} commits in total. That's a lot of code!",
    "Your most active coding day was {day}!",
    "The average commit message length here is {avgLength} characters.",
    "You love {topExt} files - there are {count} of them!",
];
/**
 * Generates a fun fact about the repository from available statistics.
 * Selects a random fact from those that have data available.
 *
 * @param data - Object containing repository statistics
 * @returns A fun fact string with real data filled in
 *
 * @example
 * getRepoFunFact({ days: 100, commits: 500, topExt: '.ts', count: 50 })
 * // Might return "You've made 500 commits in total. That's a lot of code!"
 */
function getRepoFunFact(data) {
    const availableFacts = [];
    // Only include facts where we have the required data
    // This ensures we don't show facts with missing placeholders
    if (data.days !== undefined) {
        availableFacts.push(exports.repoFunFacts[0].replace('{days}', String(data.days)));
    }
    if (data.commits !== undefined) {
        availableFacts.push(exports.repoFunFacts[1].replace('{commits}', String(data.commits)));
    }
    if (data.day !== undefined) {
        availableFacts.push(exports.repoFunFacts[2].replace('{day}', data.day));
    }
    if (data.avgLength !== undefined) {
        availableFacts.push(exports.repoFunFacts[3].replace('{avgLength}', String(data.avgLength)));
    }
    if (data.topExt !== undefined && data.count !== undefined) {
        availableFacts.push(exports.repoFunFacts[4].replace('{topExt}', data.topExt).replace('{count}', String(data.count)));
    }
    // Fallback if no data is available
    if (availableFacts.length === 0) {
        return "This repo is full of mysteries!";
    }
    // Return a random fact from available ones
    return availableFacts[Math.floor(Math.random() * availableFacts.length)];
}
//# sourceMappingURL=dialogue.js.map