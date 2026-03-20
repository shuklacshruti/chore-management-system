# chore-management-system

# HomeBase 🏠

**Household chore management for circles of people — fair, flexible, and actually sustainable.**

---

## What it does

HomeBase helps households assign, track, and balance chores across multiple people. It's built around the idea that fairness over a month matters more than fairness every single day.

**Key features:**

- **Circle system** — create a household circle and invite others via a 6-character code (e.g. `HX92KP`). Each person's browser holds their own session; your data and their data are isolated per-account.
- **Template chooser** — on first setup, pick from four starting points (blank, standard home, roommates, family) and layer on add-on packs for pets, backyard, cooking, laundry, car care, and more. Everything is editable after the fact.
- **Smart assignment** — chores are auto-distributed based on each member's capacity, preferences, dislikes, and accumulated effort. Soft rules (e.g. "Shlok gets max 1 task on school days", "heavy tasks on weekends") shape the output without being rigid.
- **Effort-based fairness** — each chore has a point weight (1–5). The system balances total effort across members weekly, not just task count.
- **Swap requests** — anyone can request a swap for any assignment. The other person accepts or declines.
- **Rules engine** — toggle built-in rules on/off or define your own custom ones in plain English.
- **AI suggestions** — asks an AI to suggest chores you might be missing, based on your current list and household makeup.
- **Gamification** — points, streaks, a leaderboard. Low-key enough to be useful, not cringe.
- **Analytics** — effort distribution, completion rates, sanity check suggestions.
- **localStorage persistence** — everything saves to the browser automatically. Close the tab, come back later — your data is still there. Each browser/account is fully isolated.

---

## Why I built it

Chore management in shared households is genuinely hard — not because the tasks are complicated, but because fairness and consistency are. Most systems are either too rigid (a fixed rota everyone ignores after two weeks) or too vague (just vibes, which means one person always ends up doing more).

I wanted something that:

1. **Accepts that life is uneven** — Shlok has school, Shruti has late classes, Shraddha has work. The app adjusts instead of pretending everyone has the same week.
2. **Optimises over time, not daily** — short-term imbalance is fine if the month balances out.
3. **Has almost zero friction** — opening a tab should show you what you need to do today. No login walls, no setup overhead once you're in.
4. **Works as a real product, not a demo** — complete onboarding flow, invite system, data persistence, mobile-friendly.

---

## How it works

### Architecture

Three files, no build step, no dependencies:

```
homebase/
├── index.html   — all HTML structure, semantic markup, ARIA labels
├── styles.css   — design system (CSS variables), all component styles, responsive breakpoints
└── script.js    — all app logic: auth, onboarding, schedule generation, CRUD, localStorage
```

Open `index.html` in any modern browser and it runs. No server required for the demo version.

### Data flow

```
localStorage ←→ APP (in-memory state object) → DOM renders
```

All reads and writes go through `ls(key, value)` — a thin localStorage wrapper. In a production deployment, every `ls()` call would be replaced with a Supabase query (marked with `// SUPABASE HOOK:` comments throughout `script.js`).

### Template + add-on system

```javascript
CHORE_TEMPLATES = {
  blank: { chores: [] },
  standard: { chores: [ ... ] },
  roommates: { chores: [ ... ] },
  family: { chores: [ ... ] },
}

ADDON_PACKS = {
  dog: { chores: [ morning walk, evening walk, ... ] },
  cat: { ... },
  backyard: { ... },
  // etc.
}
```

During onboarding, the user picks one base template and any number of add-ons. `buildChoreList()` merges them. Everything gets an ID and is stored — then fully editable from the Chores page.

### Smart assignment algorithm

`smartAssign(chore, dayOfWeek, effortMap, dayEntries)` runs per-chore per-day:

1. Start with all members as candidates
2. Filter by school-day rule (members aged ≤17 get max 1 task on weekdays if rule is on)
3. Filter by capacity (exclude anyone already at 130% of their weekly cap)
4. Remove people who dislike this chore type (soft filter — only if alternatives exist)
5. Boost people who prefer this chore type
6. Sort remaining candidates by lowest accumulated effort
7. Pick the first one

### Meaningful interactions (for the spec)

- **Form handling** — auth (login/signup), add/edit chore, add/edit member, add rule, swap request — all use real `<form>` elements or modal forms with validation and error feedback.
- **Filtering** — the Chores page filters by category/recurrence in real time via tab clicks; the sidebar member chips filter all views across the entire app.
- **Dynamic content** — the dashboard, schedule grid, member list, analytics, and leaderboard all render from live app state — adding a member or chore updates every view immediately.

---

## Running it locally

```bash
# No install needed. Just open the file:
open index.html

# Or serve it (avoids any browser file:// restrictions):
npx serve .
# then visit http://localhost:3000
```

---

## Deploying for real (Supabase + Vercel)

See `DEPLOYMENT-GUIDE.md` for step-by-step instructions covering:

- Supabase database schema (SQL)
- Auth setup (email/password)
- Row-level security policies
- Supabase Edge Function for AI suggestions (keeps API key server-side)
- Vercel deployment + environment variables
- Weekly cron job for auto-assigning schedules
- Free-tier AI API recommendations for students (Google Gemini is the pick)

Every `// SUPABASE HOOK:` comment in `script.js` marks exactly what to swap out.

---

## Tech choices

| Thing | Why |
|---|---|
| Vanilla JS | No framework overhead for a project this size. The DOM manipulation is straightforward and the state model is simple. |
| CSS variables | Single source of truth for the design system. Easy to theme or tweak without hunting through files. |
| localStorage | Gives the "real app" feel (data persists across sessions) without needing a server for the demo. Trivially swappable for Supabase. |
| No build step | Open in browser → it works. Zero friction for development and demonstration. |

---

## Folder structure

```
homebase/
├── index.html          Main markup — all screens and pages
├── styles.css          All styles — tokens, components, layouts, responsive
├── script.js           All logic — auth, onboarding, rendering, data, AI
└── README.md           This file
```

---

*Built with no frameworks, no dependencies, and a strong opinion that chore apps should be boring to use in the best possible way.*
