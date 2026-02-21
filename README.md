# 🐕 GitBuddy

> A Tamagotchi-style terminal pet whose mood reflects your git repository health!

GitBuddy is an adorable animated dog that lives in your terminal. Its mood and health are tied to your coding habits — frequent commits, clean working trees, and good practices make your buddy happy!

## ✨ Features

- **Adorable ASCII Art Dog** — Cute animated pet with wagging tail, blinking eyes, and expressive moods
- **5 Evolution Levels** — Watch your puppy grow from a tiny ball of fluff to a Legendary Doge with a crown!
- **Real-time Animations** — Smooth animations including breathing, tail wagging, and mood-specific reactions
- **Repository Health Tracking** — Monitors commit frequency, working tree cleanliness, test coverage, and more
- **Interactive Actions**:
  - 🍖 **Feed** — Scan for TODOs, FIXMEs, and console.logs to fix
  - 🎾 **Play** — Do tricks, play fetch, and get belly rubs
  - 📊 **Stats** — View detailed statistics about your pet and repo
- **XP & Leveling System** — Earn XP through good coding habits and watch your pet evolve
- **Persistent State** — Your pet remembers you between sessions!
- **Beautiful Terminal UI** — Colorful, responsive interface with progress bars and status indicators

## 📦 Installation

```bash
# Run directly with npx (no install needed!)
npx gitbuddy

# Or install globally
npm install -g gitbuddy
gitbuddy
```

## 🚀 Quick Start

1. Navigate to any git repository
2. Run `npx gitbuddy`
3. Name your new pet companion
4. Watch them react to your repository's health!

## ⌨️ Controls

| Key | Action |
|-----|--------|
| `F` | Feed — Scan for code issues |
| `P` | Play — Play with your buddy (Level 2+) |
| `S` | Stats — View detailed statistics (Level 3+) |
| `H` | Help — Show help screen |
| `R` | Refresh — Re-scan repository |
| `Q` | Quit — Save and exit |

## 🎮 Evolution Levels

| Level | XP Required | Name | Special |
|-------|-------------|------|---------|
| 1 | 0 | Puppy | Small and extra cute! |
| 2 | 100 | Young Dog | Unlocks Play feature |
| 3 | 300 | Adult Dog | Unlocks Stats, gets spots |
| 4 | 600 | Cool Dog | Gets sunglasses! 😎 |
| 5 | 1000 | Legendary Doge | Crown and sparkles! 👑 |

## 📊 How Health is Calculated

GitBuddy monitors several aspects of your repository:

- **Commit Frequency** (30%) — How often you commit (10+/week = great!)
- **Commit Streak** (15%) — Consecutive days with commits
- **Working Tree** (20%) — Clean tree = happy dog
- **Test Files** (15%) — Having tests shows you care!
- **README** (5%) — Documentation matters
- **Recent Activity** (15%) — When was your last commit?

## 🐕 Mood States

Your buddy's mood changes based on repository health:

- **Excited** (90-100 HP) — Bouncy, sparkles, maximum tail wags
- **Happy** (70-89 HP) — Wagging tail, big smile
- **Neutral** (50-69 HP) — Calm, small smile
- **Sad** (25-49 HP) — Droopy ears, tears
- **Sick** (0-24 HP) — Shivering, needs help!
- **Sleeping** — After 60 seconds of inactivity (zzz...)

## 💡 Tips for a Happy Pet

- Commit frequently (aim for at least 1 commit per day)
- Keep your working tree clean
- Add test files to your project
- Include a README.md
- Address TODOs and FIXMEs
- Remove console.log statements from production code

## 🛠️ Requirements

- Node.js 18 or higher
- A git repository to live in
- A terminal that supports Unicode and colors

## 🎨 Screenshots

When you first run GitBuddy, you'll meet your new companion:

```
╭───────────────────────────────────────────────╮
│  🐕 Buddy             Level 1 ★☆☆☆☆           │
│  Mood: Happy 😊           XP: 0/100           │
│                                               │
│  HP  ████████████████  100/100                │
│  XP  ░░░░░░░░░░░░░░░░  0/100                  │
│                                               │
│              ∧＿∧                              │
│             (◕ᴥ◕)                             │
│            ╭─∪─∪─╮                            │
│            │ ▒▒▒ │∼                           │
│            ╰─────╯                            │
│             ││ ││                             │
│                                               │
│  💬 "*happy bark* Your repo looks great!"    │
│                                               │
│  ✓ Commits this week    12 commits           │
│  ✓ Working tree         clean                │
│  ⚠ Tests                no tests found       │
│  ✓ README               present              │
│                                               │
│  [F]eed  [P]lay (Lvl 2)  [S]tats (Lvl 3)    │
╰───────────────────────────────────────────────╯
```

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## 📄 License

MIT © 2024

---



*Give your terminal a friend!* 🐕
