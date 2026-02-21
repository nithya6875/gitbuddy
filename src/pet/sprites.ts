/**
 * =============================================================================
 * SPRITES.TS - ASCII Art Pet Sprites and Animation System
 * =============================================================================
 *
 * This file contains all the ASCII art sprites for the GitBuddy pet.
 * The pet has 5 evolution levels, each with multiple mood variations
 * and animation frames for a lively, expressive character.
 *
 * Evolution Levels:
 * - Level 1 (Puppy): Small, cute, big eyes - 6 lines tall
 * - Level 2 (Young Dog): Medium, more detail, has tail - 7 lines tall
 * - Level 3 (Adult Dog): Full size, spots pattern - 9 lines tall
 * - Level 4 (Cool Dog): Same as adult but with sunglasses! - 9 lines tall
 * - Level 5 (Legendary Doge): Crown, sparkles, maximum majesty - 11 lines tall
 *
 * Each level has sprites for these moods:
 * - happy, happyTail2 (wagging animation)
 * - excited (bouncing, hearts)
 * - sad (droopy, tears)
 * - sick (X eyes, faded colors)
 * - sleeping (closed eyes, ZZZ)
 * - neutral (calm expression)
 * - eating (mouth open)
 * - blink (closed eyes for blinking animation)
 *
 * The sprites use Unicode box-drawing characters and special symbols
 * for a cute, pixelated appearance in the terminal.
 */

import chalk from 'chalk';             // Terminal string styling
import { colors } from '../ui/colors.js'; // Color theme definitions

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================
/**
 * Possible mood states for the pet.
 * Each mood has corresponding sprite art and color treatments.
 */
export type Mood = 'happy' | 'excited' | 'neutral' | 'sad' | 'sick' | 'sleeping' | 'eating' | 'playing';

/**
 * Pet evolution levels (1-5).
 * Higher levels unlock features and have more elaborate sprites.
 */
export type Level = 1 | 2 | 3 | 4 | 5;

// =============================================================================
// SPRITE COLORIZATION
// =============================================================================
/**
 * Applies color styling to sprite characters.
 * Recognizes specific Unicode characters and applies appropriate colors.
 *
 * Color mappings:
 * - Box characters (╭╮╰╯│─): Dog body brown
 * - Eyes (◕◔●◠◡×·ᵔ^): White
 * - Nose (▽ᴥ▾◡): Dark brown
 * - Hearts (♥❤): Red
 * - Stars (★✦✧⭐): Yellow
 * - Tears (💧): Cyan
 * - Zzz: Dim cyan (sleeping)
 * - Fur texture (░▒▓█): Light brown
 * - Tail (∼∽~): Body brown
 * - Music notes (♪♫): Green
 *
 * @param sprite - Raw ASCII sprite string
 * @returns Colorized sprite string with ANSI escape codes
 */
function colorize(sprite: string): string {
  return sprite
    // Box drawing characters - dog body outline
    .replace(/[╭╮╰╯│─┌┐└┘├┤┬┴┼]/g, (m) => colors.dogBody(m))
    // Eye characters - white for visibility
    .replace(/[◕◔●◠◡×·ᵔ^]/g, (m) => chalk.white(m))
    // Nose/mouth characters - dark brown
    .replace(/[▽ᴥ▾◡]/g, (m) => colors.dogNose(m))
    // Hearts - red for love
    .replace(/[♥❤]/g, (m) => colors.heart(m))
    // Stars and sparkles - yellow
    .replace(/[★✦✧⭐]/g, (m) => colors.sparkle(m))
    // Tears - cyan (water color)
    .replace(/[💧]/g, (m) => colors.tear(m))
    // Sleep indicators - dimmed
    .replace(/[Zz]/g, (m) => colors.sleeping(m))
    // Fur texture blocks - light brown
    .replace(/[░▒▓█]/g, (m) => colors.dogBodyLight(m))
    // Tail wagging indicators
    .replace(/[∼∽~]/g, (m) => colors.dogBody(m))
    // Music notes - green (happy sound)
    .replace(/[♪♫]/g, (m) => colors.happy(m));
}

// =============================================================================
// LEVEL 1: PUPPY SPRITES
// =============================================================================
/**
 * Small puppy sprites - the cutest starting form!
 * 6 lines tall, simple design with big expressive eyes.
 * Features: Floppy ears (∧＿∧), small body, stubby legs
 */

// Happy puppy with tail wagging right
const puppyHappy = [
  `         ∧＿∧    `,  // Floppy ears
  `        (◕ᴥ◕)   `,  // Happy face with shiny eyes and cute nose
  `       ╭─∪─∪─╮  `,  // Collar/neck area
  `       │ ▒▒▒ │∼ `,  // Body with fur texture, tail wagging right
  `       ╰─────╯  `,  // Bottom of body
  `        ││ ││   `,  // Four little legs
];

// Happy puppy with tail wagging left (animation frame 2)
const puppyHappyTail2 = [
  `         ∧＿∧    `,
  `        (◕ᴥ◕)   `,
  `       ╭─∪─∪─╮  `,
  ` ∽     │ ▒▒▒ │  `,  // Tail now on left side
  `       ╰─────╯  `,
  `        ││ ││   `,
];

// Excited puppy - bouncing with stars and hearts
const puppyExcited = [
  `    ★    ∧＿∧  ★ `,  // Stars around head
  `   ♥    (ᵔᴥᵔ)   `,  // Heart, super happy squinty eyes
  `       ╭─∪─∪─╮  `,
  `       │ ▒▒▒ │∼ `,
  `       ╰─────╯  `,
  `       ╱╲  ╱╲   `,  // Bouncing legs (lifted up)
];

// Sad puppy - droopy with tear
const puppySad = [
  `         ∧＿∧    `,
  `        (◔ᴥ◔) 💧`,  // Worried eyes, tear drop
  `       ╭─∪─∪─╮  `,
  `       │ ▒▒▒ │  `,  // No tail wag
  `       ╰─────╯  `,
  `        ││ ││   `,
];

// Sick puppy - X eyes, looks unwell
const puppySick = [
  `         ∧＿∧    `,
  `        (×ᴥ×)   `,  // X eyes indicate sickness
  `       ╭─∪─∪─╮  `,
  `       │ ░░░ │  `,  // Faded fur (using lighter block)
  `       ╰─────╯  `,
  `        ││ ││   `,
];

// Sleeping puppy - closed eyes, Zzz
const puppySleeping = [
  `         ∧＿∧ Zz `,  // Zzz floating above
  `        (─ᴥ─)  Z`,  // Closed eyes (dashes), more Z
  `       ╭─∪─∪─╮  `,
  `       │ ▒▒▒ │  `,
  `       ╰─────╯  `,
  `        ││ ││   `,
];

// Neutral puppy - calm expression
const puppyNeutral = [
  `         ∧＿∧    `,
  `        (•ᴥ•)   `,  // Simple dot eyes
  `       ╭─∪─∪─╮  `,
  `       │ ▒▒▒ │  `,
  `       ╰─────╯  `,
  `        ││ ││   `,
];

// Eating puppy - mouth open with music note
const puppyEating = [
  `         ∧＿∧    `,
  `        (◕ᴥ◕)♪  `,  // Happy face, music note
  `       ╭─∪○∪─╮  `,  // ○ represents food/open mouth
  `       │ ▒▒▒ │  `,
  `       ╰─────╯  `,
  `        ││ ││   `,
];

// Blinking puppy - for blink animation
const puppyBlink = [
  `         ∧＿∧    `,
  `        (─ᴥ─)   `,  // Closed eyes (dashes)
  `       ╭─∪─∪─╮  `,
  `       │ ▒▒▒ │∼ `,
  `       ╰─────╯  `,
  `        ││ ││   `,
];

// =============================================================================
// LEVEL 2: YOUNG DOG SPRITES
// =============================================================================
/**
 * Young dog sprites - growing up!
 * 7 lines tall, adds a proper tail on the side.
 * Features: Same face style but larger body, visible tail
 */

const youngHappy = [
  `       ∧＿∧      ∧   `,  // Ears + raised tail
  `      ( ◕ᴥ◕)    ╱╲  `,  // Face + tail top
  `     ╭─╰──╯─╮  ╱  ╲ `,  // Body + tail middle
  `     │ ▒▒▒▒ │╱    ∼`,  // Body connected to tail, wagging
  `     │ ▓▓▓▓ │      `,  // Lower body with darker texture
  `     ╰──────╯      `,
  `      ││  ││       `,
];

const youngHappyTail2 = [
  `       ∧＿∧      ∧   `,
  `      ( ◕ᴥ◕)    ╱╲  `,
  `     ╭─╰──╯─╮  ╱  ╲ `,
  `  ∽  │ ▒▒▒▒ │╱     `,  // Tail indicator moved left
  `     │ ▓▓▓▓ │      `,
  `     ╰──────╯      `,
  `      ││  ││       `,
];

const youngExcited = [
  `  ★    ∧＿∧    ★ ∧   `,
  ` ♥    ( ᵔᴥᵔ) ♥  ╱╲  `,
  `     ╭─╰──╯─╮  ╱  ╲ `,
  `     │ ▒▒▒▒ │╱    ∼`,
  `     │ ▓▓▓▓ │      `,
  `     ╰──────╯      `,
  `     ╱╲  ╱╲        `,  // Bouncing
];

const youngSad = [
  `       ∧＿∧      ∧   `,
  `      ( ◔ᴥ◔)  💧╱╲  `,
  `     ╭─╰──╯─╮  ╱  ╲ `,
  `     │ ▒▒▒▒ │╱     `,
  `     │ ░░░░ │  💧  `,  // Faded + tears
  `     ╰──────╯      `,
  `      ││  ││       `,
];

const youngSick = [
  `       ∧＿∧      ∧   `,
  `      ( ×ᴥ×)    ╱╲  `,
  `     ╭─╰──╯─╮  ╱  ╲ `,
  `     │ ░░░░ │╱     `,
  `     │ ░░░░ │      `,
  `     ╰──────╯      `,
  `      ││  ││       `,
];

const youngSleeping = [
  `       ∧＿∧   Zz ∧   `,
  `      ( ─ᴥ─)  Z ╱╲  `,
  `     ╭─╰──╯─╮  ╱  ╲ `,
  `     │ ▒▒▒▒ │╱     `,
  `     │ ▓▓▓▓ │      `,
  `     ╰──────╯      `,
  `      ││  ││       `,
];

const youngNeutral = [
  `       ∧＿∧      ∧   `,
  `      ( •ᴥ•)    ╱╲  `,
  `     ╭─╰──╯─╮  ╱  ╲ `,
  `     │ ▒▒▒▒ │╱     `,
  `     │ ▓▓▓▓ │      `,
  `     ╰──────╯      `,
  `      ││  ││       `,
];

const youngEating = [
  `       ∧＿∧      ∧   `,
  `      ( ◕ᴥ◕)♪   ╱╲  `,
  `     ╭─╰○─╯─╮  ╱  ╲ `,
  `     │ ▒▒▒▒ │╱     `,
  `     │ ▓▓▓▓ │      `,
  `     ╰──────╯      `,
  `      ││  ││       `,
];

const youngBlink = [
  `       ∧＿∧      ∧   `,
  `      ( ─ᴥ─)    ╱╲  `,
  `     ╭─╰──╯─╮  ╱  ╲ `,
  `     │ ▒▒▒▒ │╱    ∼`,
  `     │ ▓▓▓▓ │      `,
  `     ╰──────╯      `,
  `      ││  ││       `,
];

// =============================================================================
// LEVEL 3: ADULT DOG SPRITES
// =============================================================================
/**
 * Adult dog sprites - fully grown!
 * 9 lines tall, has spots pattern.
 * Features: Spotted coat (mixed ▓░▒ pattern), larger proportions
 */

const adultHappy = [
  `          ╭───╮            `,  // Ear box
  `    ∧＿∧  │   │   ∧        `,
  `   ( ◕ᴥ◕) ╰───╯  ╱ ╲       `,
  `  ╭─╰───╯──╮    ╱   ╲      `,
  `  │ ▓░▒▒▒░ │───╱     ∼     `,  // Spotted coat pattern
  `  │ ▒░▓▓░▒ │               `,
  `  │ ░▒▒▒▓░ │               `,
  `  ╰────────╯               `,
  `   ││    ││                `,
];

const adultHappyTail2 = [
  `          ╭───╮            `,
  `    ∧＿∧  │   │   ∧        `,
  `   ( ◕ᴥ◕) ╰───╯  ╱ ╲       `,
  `  ╭─╰───╯──╮    ╱   ╲      `,
  ` ∽│ ▓░▒▒▒░ │───╱           `,
  `  │ ▒░▓▓░▒ │               `,
  `  │ ░▒▒▒▓░ │               `,
  `  ╰────────╯               `,
  `   ││    ││                `,
];

const adultExcited = [
  `     ★    ╭───╮    ★       `,
  `    ∧＿∧♥ │   │   ∧  ♥     `,
  `   ( ᵔᴥᵔ) ╰───╯  ╱ ╲       `,
  `  ╭─╰───╯──╮    ╱   ╲      `,
  `  │ ▓░▒▒▒░ │───╱     ∼     `,
  `  │ ▒░▓▓░▒ │               `,
  `  │ ░▒▒▒▓░ │               `,
  `  ╰────────╯               `,
  `  ╱╲    ╱╲                 `,
];

const adultSad = [
  `          ╭───╮            `,
  `    ∧＿∧  │   │   ∧   💧   `,
  `   ( ◔ᴥ◔) ╰───╯  ╱ ╲       `,
  `  ╭─╰───╯──╮    ╱   ╲ 💧   `,
  `  │ ░░▒▒▒░ │───╱           `,
  `  │ ▒░░░░▒ │               `,
  `  │ ░▒▒▒░░ │               `,
  `  ╰────────╯               `,
  `   ││    ││                `,
];

const adultSick = [
  `          ╭───╮            `,
  `    ∧＿∧  │   │   ∧        `,
  `   ( ×ᴥ×) ╰───╯  ╱ ╲       `,
  `  ╭─╰───╯──╮    ╱   ╲      `,
  `  │ ░░░░░░ │───╱           `,
  `  │ ░░░░░░ │               `,
  `  │ ░░░░░░ │               `,
  `  ╰────────╯               `,
  `   ││    ││                `,
];

const adultSleeping = [
  `          ╭───╮     Zz     `,
  `    ∧＿∧  │   │   ∧  Z     `,
  `   ( ─ᴥ─) ╰───╯  ╱ ╲       `,
  `  ╭─╰───╯──╮    ╱   ╲      `,
  `  │ ▓░▒▒▒░ │───╱           `,
  `  │ ▒░▓▓░▒ │               `,
  `  │ ░▒▒▒▓░ │               `,
  `  ╰────────╯               `,
  `   ││    ││                `,
];

const adultNeutral = [
  `          ╭───╮            `,
  `    ∧＿∧  │   │   ∧        `,
  `   ( •ᴥ•) ╰───╯  ╱ ╲       `,
  `  ╭─╰───╯──╮    ╱   ╲      `,
  `  │ ▓░▒▒▒░ │───╱           `,
  `  │ ▒░▓▓░▒ │               `,
  `  │ ░▒▒▒▓░ │               `,
  `  ╰────────╯               `,
  `   ││    ││                `,
];

const adultEating = [
  `          ╭───╮            `,
  `    ∧＿∧  │   │   ∧  ♪     `,
  `   ( ◕ᴥ◕) ╰───╯  ╱ ╲       `,
  `  ╭─╰○──╯──╮    ╱   ╲      `,
  `  │ ▓░▒▒▒░ │───╱           `,
  `  │ ▒░▓▓░▒ │               `,
  `  │ ░▒▒▒▓░ │               `,
  `  ╰────────╯               `,
  `   ││    ││                `,
];

const adultBlink = [
  `          ╭───╮            `,
  `    ∧＿∧  │   │   ∧        `,
  `   ( ─ᴥ─) ╰───╯  ╱ ╲       `,
  `  ╭─╰───╯──╮    ╱   ╲      `,
  `  │ ▓░▒▒▒░ │───╱     ∼     `,
  `  │ ▒░▓▓░▒ │               `,
  `  │ ░▒▒▒▓░ │               `,
  `  ╰────────╯               `,
  `   ││    ││                `,
];

// =============================================================================
// LEVEL 4: COOL DOG SPRITES
// =============================================================================
/**
 * Cool dog sprites - same size as adult but WITH SUNGLASSES! 😎
 * 9 lines tall, replaces normal eyes with ▀■ᴥ■▀ sunglasses.
 * Features: Dark rectangular sunglasses, music notes, extra cool vibes
 */

const coolHappy = [
  `          ╭───╮            `,
  `    ∧＿∧  │   │   ∧        `,
  `   (▀■ᴥ■▀)╰───╯  ╱ ╲       `,  // SUNGLASSES!
  `  ╭─╰───╯──╮    ╱   ╲      `,
  `  │ ▓░▒▒▒░ │───╱     ∼     `,
  `  │ ▒░▓▓░▒ │  ♪            `,  // Music note = cool vibes
  `  │ ░▒▒▒▓░ │               `,
  `  ╰────────╯               `,
  `   ││    ││                `,
];

const coolHappyTail2 = [
  `          ╭───╮            `,
  `    ∧＿∧  │   │   ∧        `,
  `   (▀■ᴥ■▀)╰───╯  ╱ ╲       `,
  `  ╭─╰───╯──╮    ╱   ╲      `,
  ` ∽│ ▓░▒▒▒░ │───╱           `,
  `  │ ▒░▓▓░▒ │  ♪            `,
  `  │ ░▒▒▒▓░ │               `,
  `  ╰────────╯               `,
  `   ││    ││                `,
];

const coolExcited = [
  `     ★    ╭───╮    ★       `,
  `    ∧＿∧♥ │   │   ∧  ♥     `,
  `   (▀◕ᴥ◕▀)╰───╯  ╱ ╲       `,  // Sunglasses raised to show excited eyes
  `  ╭─╰───╯──╮    ╱   ╲      `,
  `  │ ▓░▒▒▒░ │───╱     ∼     `,
  `  │ ▒░▓▓░▒ │  ♫            `,  // Double music note
  `  │ ░▒▒▒▓░ │               `,
  `  ╰────────╯               `,
  `  ╱╲    ╱╲                 `,
];

const coolSad = [
  `          ╭───╮            `,
  `    ∧＿∧  │   │   ∧   💧   `,
  `   (▀■ᴥ■▀)╰───╯  ╱ ╲       `,  // Even cool dogs get sad
  `  ╭─╰───╯──╮    ╱   ╲ 💧   `,
  `  │ ░░▒▒▒░ │───╱           `,
  `  │ ▒░░░░▒ │               `,
  `  │ ░▒▒▒░░ │               `,
  `  ╰────────╯               `,
  `   ││    ││                `,
];

const coolSick = [
  `          ╭───╮            `,
  `    ∧＿∧  │   │   ∧        `,
  `   (■×ᴥ×■)╰───╯  ╱ ╲       `,  // Broken/crossed sunglasses
  `  ╭─╰───╯──╮    ╱   ╲      `,
  `  │ ░░░░░░ │───╱           `,
  `  │ ░░░░░░ │               `,
  `  │ ░░░░░░ │               `,
  `  ╰────────╯               `,
  `   ││    ││                `,
];

const coolSleeping = [
  `          ╭───╮     Zz     `,
  `    ∧＿∧  │   │   ∧  Z     `,
  `   (▀─ᴥ─▀)╰───╯  ╱ ╲       `,  // Sleeping behind sunglasses
  `  ╭─╰───╯──╮    ╱   ╲      `,
  `  │ ▓░▒▒▒░ │───╱           `,
  `  │ ▒░▓▓░▒ │               `,
  `  │ ░▒▒▒▓░ │               `,
  `  ╰────────╯               `,
  `   ││    ││                `,
];

const coolNeutral = [
  `          ╭───╮            `,
  `    ∧＿∧  │   │   ∧        `,
  `   (▀■ᴥ■▀)╰───╯  ╱ ╲       `,
  `  ╭─╰───╯──╮    ╱   ╲      `,
  `  │ ▓░▒▒▒░ │───╱           `,
  `  │ ▒░▓▓░▒ │               `,
  `  │ ░▒▒▒▓░ │               `,
  `  ╰────────╯               `,
  `   ││    ││                `,
];

const coolEating = [
  `          ╭───╮            `,
  `    ∧＿∧  │   │   ∧  ♪     `,
  `   (▀◕ᴥ◕▀)╰───╯  ╱ ╲       `,  // Lifted sunglasses to eat
  `  ╭─╰○──╯──╮    ╱   ╲      `,
  `  │ ▓░▒▒▒░ │───╱           `,
  `  │ ▒░▓▓░▒ │               `,
  `  │ ░▒▒▒▓░ │               `,
  `  ╰────────╯               `,
  `   ││    ││                `,
];

const coolBlink = [
  `          ╭───╮            `,
  `    ∧＿∧  │   │   ∧        `,
  `   (▀─ᴥ─▀)╰───╯  ╱ ╲       `,  // Eyes closed behind glasses
  `  ╭─╰───╯──╮    ╱   ╲      `,
  `  │ ▓░▒▒▒░ │───╱     ∼     `,
  `  │ ▒░▓▓░▒ │               `,
  `  │ ░▒▒▒▓░ │               `,
  `  ╰────────╯               `,
  `   ││    ││                `,
];

// =============================================================================
// LEVEL 5: LEGENDARY DOGE SPRITES
// =============================================================================
/**
 * Legendary Doge sprites - the ultimate evolution! 👑
 * 11 lines tall, largest and most detailed sprite.
 * Features: Golden crown (♕), sparkles (✦), wider body, maximum majesty
 */

const legendaryHappy = [
  `        ╔═══╗                `,  // Crown box top
  `        ║ ♕ ║                `,  // Crown with queen symbol
  `    ★   ╚╦═╦╝  ★   ∧         `,  // Stars flanking crown
  `    ∧＿∧ ╭┴─┴╮    ╱ ╲  ✦     `,  // Sparkle
  `   ( ◕ᴥ◕)│   │   ╱   ╲       `,
  `  ╭─╰───╯╰───╯──╮     ∼      `,
  ` ✦│ ▓░▒▒▒░▓░▒▒ │             `,  // Extra wide spotted body
  `  │ ▒░▓▓░▒▒░▓▓ │  ♪          `,
  `  │ ░▒▒▒▓░░▒▒▒ │             `,
  `  ╰─────────────╯            `,
  `   ││      ││     ✦          `,  // Sparkle by feet
];

const legendaryHappyTail2 = [
  `        ╔═══╗                `,
  `        ║ ♕ ║                `,
  `    ★   ╚╦═╦╝  ★   ∧         `,
  `    ∧＿∧ ╭┴─┴╮    ╱ ╲  ✦     `,
  `   ( ◕ᴥ◕)│   │   ╱   ╲       `,
  `  ╭─╰───╯╰───╯──╮             `,
  ` ∽│ ▓░▒▒▒░▓░▒▒ │             `,  // Tail on left
  `  │ ▒░▓▓░▒▒░▓▓ │  ♪          `,
  `  │ ░▒▒▒▓░░▒▒▒ │             `,
  `  ╰─────────────╯            `,
  ` ✦ ││      ││                `,
];

const legendaryExcited = [
  `   ✦    ╔═══╗    ✦           `,  // Extra sparkles
  `        ║ ♕ ║                `,
  `    ★   ╚╦═╦╝  ★   ∧    ♥    `,  // Hearts too
  `   ♥∧＿∧ ╭┴─┴╮    ╱ ╲  ✦     `,
  `   ( ᵔᴥᵔ)│   │   ╱   ╲       `,  // Super happy eyes
  `  ╭─╰───╯╰───╯──╮     ∼      `,
  ` ✦│ ▓░▒▒▒░▓░▒▒ │     ♥       `,
  `  │ ▒░▓▓░▒▒░▓▓ │  ♫          `,  // Double music note
  `  │ ░▒▒▒▓░░▒▒▒ │             `,
  `  ╰─────────────╯            `,
  `  ╱╲      ╱╲      ✦          `,  // Bouncing
];

const legendarySad = [
  `        ╔═══╗                `,
  `        ║ ♕ ║                `,
  `        ╚╦═╦╝      ∧    💧   `,
  `    ∧＿∧ ╭┴─┴╮    ╱ ╲        `,
  `   ( ◔ᴥ◔)│   │   ╱   ╲  💧   `,
  `  ╭─╰───╯╰───╯──╮            `,
  `  │ ░░▒▒▒░░░▒▒ │             `,
  `  │ ▒░░░░▒▒░░░ │             `,
  `  │ ░▒▒▒░░░▒▒▒ │             `,
  `  ╰─────────────╯            `,
  `   ││      ││                `,
];

const legendarySick = [
  `        ╔═══╗                `,
  `        ║ ♕ ║                `,
  `        ╚╦═╦╝      ∧         `,
  `    ∧＿∧ ╭┴─┴╮    ╱ ╲        `,
  `   ( ×ᴥ×)│   │   ╱   ╲       `,
  `  ╭─╰───╯╰───╯──╮            `,
  `  │ ░░░░░░░░░░ │             `,
  `  │ ░░░░░░░░░░ │             `,
  `  │ ░░░░░░░░░░ │             `,
  `  ╰─────────────╯            `,
  `   ││      ││                `,
];

const legendarySleeping = [
  `        ╔═══╗         Zz     `,
  `        ║ ♕ ║          Z     `,
  `        ╚╦═╦╝      ∧         `,
  `    ∧＿∧ ╭┴─┴╮    ╱ ╲        `,
  `   ( ─ᴥ─)│   │   ╱   ╲       `,
  `  ╭─╰───╯╰───╯──╮            `,
  `  │ ▓░▒▒▒░▓░▒▒ │             `,
  `  │ ▒░▓▓░▒▒░▓▓ │             `,
  `  │ ░▒▒▒▓░░▒▒▒ │             `,
  `  ╰─────────────╯            `,
  `   ││      ││                `,
];

const legendaryNeutral = [
  `        ╔═══╗                `,
  `        ║ ♕ ║                `,
  `    ★   ╚╦═╦╝      ∧         `,
  `    ∧＿∧ ╭┴─┴╮    ╱ ╲        `,
  `   ( •ᴥ•)│   │   ╱   ╲       `,
  `  ╭─╰───╯╰───╯──╮            `,
  `  │ ▓░▒▒▒░▓░▒▒ │             `,
  `  │ ▒░▓▓░▒▒░▓▓ │             `,
  `  │ ░▒▒▒▓░░▒▒▒ │             `,
  `  ╰─────────────╯            `,
  `   ││      ││                `,
];

const legendaryEating = [
  `        ╔═══╗                `,
  `        ║ ♕ ║                `,
  `    ★   ╚╦═╦╝      ∧   ♪     `,
  `    ∧＿∧ ╭┴─┴╮    ╱ ╲        `,
  `   ( ◕ᴥ◕)│   │   ╱   ╲       `,
  `  ╭─╰○──╯╰───╯──╮            `,  // Eating
  ` ✦│ ▓░▒▒▒░▓░▒▒ │             `,
  `  │ ▒░▓▓░▒▒░▓▓ │             `,
  `  │ ░▒▒▒▓░░▒▒▒ │             `,
  `  ╰─────────────╯            `,
  `   ││      ││                `,
];

const legendaryBlink = [
  `        ╔═══╗                `,
  `        ║ ♕ ║                `,
  `    ★   ╚╦═╦╝  ★   ∧         `,
  `    ∧＿∧ ╭┴─┴╮    ╱ ╲  ✦     `,
  `   ( ─ᴥ─)│   │   ╱   ╲       `,  // Blinking
  `  ╭─╰───╯╰───╯──╮     ∼      `,
  ` ✦│ ▓░▒▒▒░▓░▒▒ │             `,
  `  │ ▒░▓▓░▒▒░▓▓ │             `,
  `  │ ░▒▒▒▓░░▒▒▒ │             `,
  `  ╰─────────────╯            `,
  `   ││      ││     ✦          `,
];

// =============================================================================
// SPRITE COLLECTION TYPE
// =============================================================================
/**
 * Interface defining all required sprites for one level.
 * Each level must provide sprites for all these states.
 */
interface SpriteSet {
  happy: string[];      // Standard happy pose
  happyTail2: string[]; // Happy with tail in alternate position
  excited: string[];    // Very happy with decorations
  sad: string[];        // Sad with tears
  sick: string[];       // Sick with X eyes
  sleeping: string[];   // Sleeping with Zzz
  neutral: string[];    // Calm default pose
  eating: string[];     // Eating animation
  blink: string[];      // Eyes closed for blink
}

// =============================================================================
// SPRITES BY LEVEL LOOKUP TABLE
// =============================================================================
/**
 * Master lookup table mapping levels to their sprite sets.
 * This allows easy retrieval of any sprite: spritesByLevel[level][mood]
 */
const spritesByLevel: Record<Level, SpriteSet> = {
  1: {
    happy: puppyHappy,
    happyTail2: puppyHappyTail2,
    excited: puppyExcited,
    sad: puppySad,
    sick: puppySick,
    sleeping: puppySleeping,
    neutral: puppyNeutral,
    eating: puppyEating,
    blink: puppyBlink,
  },
  2: {
    happy: youngHappy,
    happyTail2: youngHappyTail2,
    excited: youngExcited,
    sad: youngSad,
    sick: youngSick,
    sleeping: youngSleeping,
    neutral: youngNeutral,
    eating: youngEating,
    blink: youngBlink,
  },
  3: {
    happy: adultHappy,
    happyTail2: adultHappyTail2,
    excited: adultExcited,
    sad: adultSad,
    sick: adultSick,
    sleeping: adultSleeping,
    neutral: adultNeutral,
    eating: adultEating,
    blink: adultBlink,
  },
  4: {
    happy: coolHappy,
    happyTail2: coolHappyTail2,
    excited: coolExcited,
    sad: coolSad,
    sick: coolSick,
    sleeping: coolSleeping,
    neutral: coolNeutral,
    eating: coolEating,
    blink: coolBlink,
  },
  5: {
    happy: legendaryHappy,
    happyTail2: legendaryHappyTail2,
    excited: legendaryExcited,
    sad: legendarySad,
    sick: legendarySick,
    sleeping: legendarySleeping,
    neutral: legendaryNeutral,
    eating: legendaryEating,
    blink: legendaryBlink,
  },
};

// =============================================================================
// SPRITE RETRIEVAL FUNCTIONS
// =============================================================================
/**
 * Gets the appropriate sprite for a given mood, level, and animation frame.
 * Handles animation logic for tail wagging, bouncing, and blinking.
 *
 * @param mood - Current mood state
 * @param level - Pet's evolution level (1-5)
 * @param frame - Current animation frame number (increments over time)
 * @param isBlinking - Whether the pet is currently blinking
 * @returns Array of strings representing the sprite lines
 *
 * @example
 * const sprite = getSprite('happy', 3, 0, false);
 * // Returns adultHappy sprite
 *
 * const sprite = getSprite('happy', 3, 1, false);
 * // Returns adultHappyTail2 sprite (tail wagging)
 */
export function getSprite(mood: Mood, level: Level, frame: number, isBlinking: boolean = false): string[] {
  const sprites = spritesByLevel[level];

  // Handle blinking - override normal sprite with blink sprite
  // Only applies to happy and neutral moods
  if (isBlinking && (mood === 'happy' || mood === 'neutral')) {
    return sprites.blink;
  }

  // Handle tail wagging for happy mood
  // Alternates between two sprites based on frame parity
  if (mood === 'happy') {
    return frame % 2 === 0 ? sprites.happy : sprites.happyTail2;
  }

  // Map mood to appropriate sprite
  switch (mood) {
    case 'excited':
      // Excited also alternates for bouncing effect
      return frame % 2 === 0 ? sprites.excited : sprites.happyTail2;
    case 'sad':
      return sprites.sad;
    case 'sick':
      return sprites.sick;
    case 'sleeping':
      return sprites.sleeping;
    case 'eating':
      return sprites.eating;
    case 'playing':
      // Playing uses excited animation
      return frame % 2 === 0 ? sprites.excited : sprites.happyTail2;
    case 'neutral':
    default:
      return sprites.neutral;
  }
}

/**
 * Colorizes and centers a sprite for display.
 * Applies color styling and centers within the specified width.
 *
 * @param sprite - Array of sprite line strings
 * @param width - Target width for centering (default: 40)
 * @returns Single string with all lines joined by newlines
 */
export function renderSprite(sprite: string[], width: number = 40): string {
  return sprite
    .map((line) => {
      // Apply color styling to the line
      const colored = colorize(line);

      // Calculate left padding to center the sprite
      // (width - line.length) / 2 gives the padding needed
      const padding = Math.max(0, Math.floor((width - line.length) / 2));

      return ' '.repeat(padding) + colored;
    })
    .join('\n');
}

/**
 * Gets the height (number of lines) of sprites at a given level.
 * Used for layout calculations.
 *
 * @param level - Pet level (1-5)
 * @returns Number of lines in the sprite
 */
export function getSpriteHeight(level: Level): number {
  return spritesByLevel[level].happy.length;
}

// =============================================================================
// ANIMATION HELPERS
// =============================================================================
/**
 * Adds a breathing animation effect to a sprite.
 * Every 4 frames, adds an empty line on top to simulate upward movement.
 *
 * @param sprite - Original sprite array
 * @param frame - Current animation frame
 * @returns Modified sprite with breathing effect
 */
export function addBreathing(sprite: string[], frame: number): string[] {
  // For frames 4-7 of every 8-frame cycle, shift sprite up
  if (frame % 8 < 4) {
    return sprite;  // Normal position
  }

  // Add empty line at top and remove bottom line
  // Creates subtle up/down breathing motion
  return ['', ...sprite.slice(0, -1)];
}

/**
 * Gets the display name for a level.
 *
 * @param level - Pet level (1-5)
 * @returns Human-readable level name
 */
export function getLevelName(level: Level): string {
  const names: Record<Level, string> = {
    1: 'Puppy',
    2: 'Young Dog',
    3: 'Adult Dog',
    4: 'Cool Dog',
    5: 'Legendary Doge',
  };
  return names[level];
}
