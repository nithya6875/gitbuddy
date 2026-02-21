"use strict";
/**
 * =============================================================================
 * ANIMATIONS.TS - Dynamic Pet Animation System
 * =============================================================================
 *
 * This file manages the puppy's dynamic behaviors and movements.
 * The puppy walks across the terminal, performs idle animations,
 * and behaves like a real pet.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAnimationController = createAnimationController;
exports.updateAnimation = updateAnimation;
exports.getAnimatedSprite = getAnimatedSprite;
exports.applyPosition = applyPosition;
// =============================================================================
// ANIMATION SPRITES
// =============================================================================
// Idle with tail wag
const puppyIdleFrame1 = [
    `  ∧＿∧     `,
    ` (◕ᴥ◕)    `,
    `╭─∪─∪─╮   `,
    `│ ▒▒▒ │ ∼ `,
    `╰─────╯   `,
    ` ││  ││   `,
];
const puppyIdleFrame2 = [
    `  ∧＿∧     `,
    ` (◕ᴥ◕)    `,
    `╭─∪─∪─╮   `,
    `│ ▒▒▒ │   `,
    `╰─────╯ ∽ `,
    ` ││  ││   `,
];
// Walking - legs move
const puppyWalkRight1 = [
    `  ∧＿∧     `,
    ` (◕ᴥ◕)  → `,
    `╭─∪─∪─╮   `,
    `│ ▒▒▒ │   `,
    `╰─────╯   `,
    ` ╱│  │╲   `,
];
const puppyWalkRight2 = [
    `  ∧＿∧     `,
    ` (◕ᴥ◕)  → `,
    `╭─∪─∪─╮   `,
    `│ ▒▒▒ │   `,
    `╰─────╯   `,
    ` │╲  ╱│   `,
];
const puppyWalkLeft1 = [
    `   ∧＿∧    `,
    `← (◕ᴥ◕)   `,
    `  ╭─∪─∪─╮ `,
    `  │ ▒▒▒ │ `,
    `  ╰─────╯ `,
    `   ╱│  │╲ `,
];
const puppyWalkLeft2 = [
    `   ∧＿∧    `,
    `← (◕ᴥ◕)   `,
    `  ╭─∪─∪─╮ `,
    `  │ ▒▒▒ │ `,
    `  ╰─────╯ `,
    `   │╲  ╱│ `,
];
// Sniffing ground
const puppySniff1 = [
    `  ∧＿∧     `,
    ` (◕ᴥ◕)    `,
    `╭─∪─∪─╮   `,
    `│ ▒▒▒ │   `,
    `╰─────╯   `,
    ` ││  ││   `,
];
const puppySniff2 = [
    `  ∧＿∧     `,
    `   ╲      `,
    `╭──(◕ᴥ◕)  `,
    `│ ▒▒▒ │   `,
    `╰─────╯   `,
    ` ││  ││   `,
];
// Scratching behind ear
const puppyScratch1 = [
    `  ∧＿∧     `,
    ` (◕ᴥ◕)    `,
    `╭─∪─∪─╮   `,
    `│ ▒▒▒ │   `,
    `╰─────╯   `,
    ` ││  ││   `,
];
const puppyScratch2 = [
    `  ∧＿∧  ⌒  `,
    ` (─ᴥ─)    `,
    `╭─∪─∪─╮   `,
    `│ ▒▒▒ │   `,
    `╰─────╯   `,
    ` ││   │   `,
];
// Stretching
const puppyStretch1 = [
    `  ∧＿∧     `,
    ` (◕ᴥ◕)    `,
    `╭─∪─∪─╮   `,
    `│ ▒▒▒ │   `,
    `╰─────╯   `,
    ` ││  ││   `,
];
const puppyStretch2 = [
    `       ∧＿∧`,
    `      (─ᴥ─)`,
    ` ╭────∪─∪─╮`,
    `╱╱  ▒▒▒   │`,
    `    ─────╯ `,
    `      ││   `,
];
// Looking around
const puppyLookLeft = [
    ` ∧＿∧      `,
    `(◕ᴥ◕)     `,
    `╭─∪─∪─╮   `,
    `│ ▒▒▒ │   `,
    `╰─────╯   `,
    ` ││  ││   `,
];
const puppyLookRight = [
    `     ∧＿∧  `,
    `    (◕ᴥ◕) `,
    `  ╭─∪─∪─╮ `,
    `  │ ▒▒▒ │ `,
    `  ╰─────╯ `,
    `   ││  ││ `,
];
// Rolling on back (happy)
const puppyRoll1 = [
    `          `,
    `  ∧＿∧    `,
    ` (◕ᴥ◕)   `,
    `╭─∪─∪─╮   `,
    `│ ▒▒▒ │   `,
    `╰─────╯   `,
];
const puppyRoll2 = [
    `          `,
    ` ╱│  │╲   `,
    `┌─────┐   `,
    `│ ▒▒▒ │   `,
    `└─────┘   `,
    ` (ᵔωᵔ)    `,
];
const puppyRoll3 = [
    `          `,
    `  ∧  ∧    `,
    `┌──││──┐  `,
    `│ ▒▒▒▒ │  `,
    `└──────┘  `,
    ` (ᵔᴥᵔ)    `,
];
// Tail chase (happy/playful)
const puppyTailChase1 = [
    `  ∧＿∧     `,
    ` (◕ᴥ◕) ◯  `,
    `╭─∪─∪─╮ │ `,
    `│ ▒▒▒ ├─╯ `,
    `╰─────╯   `,
    ` ││  ││   `,
];
const puppyTailChase2 = [
    `  ∧＿∧  ◯  `,
    ` (◕ᴥ◕)╱   `,
    `╭─∪─∪─╮   `,
    `│ ▒▒▒ │   `,
    `╰─────╯   `,
    ` ││  ││   `,
];
const puppyTailChase3 = [
    `     ◯∧＿∧ `,
    `    ╲(◕ᴥ◕)`,
    `    ╭─∪─∪─╮`,
    `    │ ▒▒▒ │`,
    `    ╰─────╯`,
    `     ││  ││`,
];
// Yawning
const puppyYawn1 = [
    `  ∧＿∧     `,
    ` (◕ᴥ◕)    `,
    `╭─∪─∪─╮   `,
    `│ ▒▒▒ │   `,
    `╰─────╯   `,
    ` ││  ││   `,
];
const puppyYawn2 = [
    `  ∧＿∧     `,
    ` (─○─)    `,
    `╭─∪─∪─╮   `,
    `│ ▒▒▒ │   `,
    `╰─────╯   `,
    ` ││  ││   `,
];
// === SAD ANIMATIONS ===
// Sad idle - droopy, occasional tear
const puppySadIdle1 = [
    `  ∧＿∧     `,
    ` (╥﹏╥)    `,
    `╭─∪─∪─╮   `,
    `│ ░░░ │   `,
    `╰─────╯   `,
    ` ││  ││   `,
];
const puppySadIdle2 = [
    `  ∧＿∧  💧 `,
    ` (╥﹏╥)    `,
    `╭─∪─∪─╮   `,
    `│ ░░░ │   `,
    `╰─────╯   `,
    ` ││  ││   `,
];
// Sad walking - slow trudge
const puppySadWalk1 = [
    `  ∧＿∧     `,
    ` (╥﹏╥)    `,
    `╭─∪─∪─╮   `,
    `│ ░░░ │   `,
    `╰─────╯   `,
    `  │╲╱│    `,
];
const puppySadWalk2 = [
    `  ∧＿∧     `,
    ` (╥﹏╥)    `,
    `╭─∪─∪─╮   `,
    `│ ░░░ │   `,
    `╰─────╯   `,
    `  ╲││╱    `,
];
// Whimpering - ears down, shaking
const puppyWhimper1 = [
    `  ∨＿∨     `,
    ` (╥﹏╥)    `,
    `╭─∪─∪─╮   `,
    `│ ░░░ │   `,
    `╰─────╯   `,
    ` ││  ││   `,
];
const puppyWhimper2 = [
    ` ∨＿∨   💧 `,
    `(╥﹏╥)     `,
    `╭─∪─∪─╮   `,
    `│ ░░░ │   `,
    `╰─────╯   `,
    ` ││  ││   `,
];
// Head down - defeated pose
const puppyHeadDown1 = [
    `          `,
    `  ∧＿∧    `,
    `   ╲      `,
    `╭──(╥﹏╥)  `,
    `│ ░░░ │   `,
    `╰─────╯   `,
];
const puppyHeadDown2 = [
    `          `,
    `  ∨＿∨    `,
    `   ╲   💧 `,
    `╭──(╥﹏╥)  `,
    `│ ░░░ │   `,
    `╰─────╯   `,
];
// =============================================================================
// ANIMATION CONSTANTS
// =============================================================================
const MIN_POSITION = -15;
const MAX_POSITION = 15;
const WALK_SPEED = 1; // Units per frame
// State durations in milliseconds
const STATE_DURATIONS = {
    idle: 2000,
    walking_right: 3000,
    walking_left: 3000,
    sniffing: 1500,
    scratching: 1500,
    stretching: 2000,
    looking_left: 1000,
    looking_right: 1000,
    rolling: 2500,
    yawning: 1500,
    tail_chase: 2500,
    whimpering: 2000,
    head_down: 2500,
};
// Happy/neutral behaviors - more active
const HAPPY_BEHAVIORS = [
    'walking_right',
    'walking_left',
    'walking_right',
    'walking_left',
    'idle',
    'sniffing',
    'scratching',
    'stretching',
    'rolling',
    'tail_chase',
    'tail_chase',
    'looking_left',
    'looking_right',
];
// Sad behaviors - more subdued
const SAD_BEHAVIORS = [
    'idle',
    'whimpering',
    'whimpering',
    'head_down',
    'head_down',
    'walking_left',
    'walking_right',
    'looking_left',
    'looking_right',
    'yawning',
];
// =============================================================================
// ANIMATION CONTROLLER
// =============================================================================
/**
 * Creates a new animation controller.
 */
function createAnimationController() {
    return {
        state: 'idle',
        position: 0,
        frame: 0,
        stateStartTime: Date.now(),
        stateDuration: STATE_DURATIONS.idle,
        lastMood: 'neutral',
    };
}
/**
 * Updates the animation controller each frame.
 */
function updateAnimation(controller, mood) {
    const now = Date.now();
    const elapsed = now - controller.stateStartTime;
    // Increment frame
    let newFrame = controller.frame + 1;
    let newPosition = controller.position;
    let newState = controller.state;
    let newStartTime = controller.stateStartTime;
    let newDuration = controller.stateDuration;
    // Update position for walking
    if (controller.state === 'walking_right') {
        newPosition = Math.min(MAX_POSITION, controller.position + WALK_SPEED);
    }
    else if (controller.state === 'walking_left') {
        newPosition = Math.max(MIN_POSITION, controller.position - WALK_SPEED);
    }
    // Check if state should change
    const shouldChangeState = elapsed >= controller.stateDuration;
    const hitRightEdge = newPosition >= MAX_POSITION;
    const hitLeftEdge = newPosition <= MIN_POSITION;
    if (shouldChangeState || hitRightEdge || hitLeftEdge) {
        // Pick next state
        if (hitRightEdge) {
            // Hit right edge, must go left or do something else
            newState = pickRandomState(['walking_left', 'idle', 'sniffing', 'looking_left'], mood);
        }
        else if (hitLeftEdge) {
            // Hit left edge, must go right or do something else
            newState = pickRandomState(['walking_right', 'idle', 'sniffing', 'looking_right'], mood);
        }
        else {
            // Normal state transition
            newState = pickNextState(mood);
        }
        newStartTime = now;
        newDuration = STATE_DURATIONS[newState];
        newFrame = 0;
    }
    return {
        state: newState,
        position: newPosition,
        frame: newFrame,
        stateStartTime: newStartTime,
        stateDuration: newDuration,
        lastMood: mood,
    };
}
/**
 * Picks a random state from a list, filtered by mood.
 */
function pickRandomState(options, mood) {
    // Filter out inappropriate states for mood
    let filtered = options;
    if (mood === 'sad' || mood === 'sick') {
        filtered = options.filter(s => !['rolling', 'tail_chase', 'stretching'].includes(s));
    }
    if (filtered.length === 0)
        filtered = options;
    return filtered[Math.floor(Math.random() * filtered.length)];
}
/**
 * Picks the next animation state based on mood.
 */
function pickNextState(mood) {
    const behaviors = (mood === 'sad' || mood === 'sick') ? SAD_BEHAVIORS : HAPPY_BEHAVIORS;
    return behaviors[Math.floor(Math.random() * behaviors.length)];
}
/**
 * Gets the sprite for current animation state.
 */
function getAnimatedSprite(controller, level, mood = 'neutral') {
    const frame = controller.frame;
    const isSad = mood === 'sad' || mood === 'sick';
    // Only level 1 has full animations for now
    if (level > 1) {
        return puppyIdleFrame1;
    }
    switch (controller.state) {
        case 'walking_right':
            if (isSad) {
                return frame % 2 === 0 ? puppySadWalk1 : puppySadWalk2;
            }
            return frame % 2 === 0 ? puppyWalkRight1 : puppyWalkRight2;
        case 'walking_left':
            if (isSad) {
                return frame % 2 === 0 ? puppySadWalk1 : puppySadWalk2;
            }
            return frame % 2 === 0 ? puppyWalkLeft1 : puppyWalkLeft2;
        case 'sniffing':
            return frame % 3 < 2 ? puppySniff1 : puppySniff2;
        case 'scratching':
            return frame % 2 === 0 ? puppyScratch1 : puppyScratch2;
        case 'stretching':
            return frame % 3 < 2 ? puppyStretch1 : puppyStretch2;
        case 'looking_left':
            return puppyLookLeft;
        case 'looking_right':
            return puppyLookRight;
        case 'rolling':
            const rollPhase = frame % 6;
            if (rollPhase < 2)
                return puppyRoll1;
            if (rollPhase < 4)
                return puppyRoll2;
            return puppyRoll3;
        case 'tail_chase':
            const chasePhase = frame % 6;
            if (chasePhase < 2)
                return puppyTailChase1;
            if (chasePhase < 4)
                return puppyTailChase2;
            return puppyTailChase3;
        case 'yawning':
            return frame % 3 < 2 ? puppyYawn1 : puppyYawn2;
        case 'whimpering':
            return frame % 2 === 0 ? puppyWhimper1 : puppyWhimper2;
        case 'head_down':
            return frame % 3 < 2 ? puppyHeadDown1 : puppyHeadDown2;
        case 'idle':
        default:
            if (isSad) {
                return frame % 3 < 2 ? puppySadIdle1 : puppySadIdle2;
            }
            return frame % 2 === 0 ? puppyIdleFrame1 : puppyIdleFrame2;
    }
}
/**
 * Applies horizontal position offset to sprite.
 */
function applyPosition(sprite, position) {
    const offset = Math.round(position);
    if (offset === 0)
        return sprite;
    if (offset > 0) {
        // Move right - add spaces at start
        return sprite.map(line => ' '.repeat(offset) + line);
    }
    else {
        // Move left - add spaces at end
        const absOffset = Math.abs(offset);
        return sprite.map(line => line + ' '.repeat(absOffset));
    }
}
//# sourceMappingURL=animations.js.map