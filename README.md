# Vision MAP App

Responsive, local-first web app scaffold for Vision MAP™, the software version of Ben Ward's Vision M.A.P.™ workbook.

This app is intentionally built as a handoff-friendly prototype: clear source files, official brand assets copied into `public/`, local autosave, and documentation that points back to the approved design handoff.

## Quick Start

For a software team taking this over, start with:

- `DEVELOPER_HANDOFF.md`
- `PRODUCTION_BACKLOG.md`

```bash
npm install
npm run dev
```

Open the local URL Vite prints, usually `http://127.0.0.1:5173/`.

Build check:

```bash
npm run build
```

Smoke check:

```bash
npm test
```

Optional browser smoke check, after installing Playwright:

```bash
npm install -D playwright
npm run test:browser
```

## Current Status

Built:

- Onboarding welcome, commitment decision, path screen, and Why builder.
- App shell with desktop rail and mobile bottom tabs.
- Today screen with Mark today, Hour of Power card, daily practice tiles, carrying card, quote note, and Next on your MAP.
- Full-screen Hour of Power mode with timer ring, phase controls, Visualize phase, and completion marking.
- Full-screen Visualize slideshow using Why, Vision Board captions, and affirmations.
- Affirmations read/edit mode.
- Daily Journaling editor with autosave.
- Success Strings carry mode with flip card and self-grading.
- My MAP overview with pinned Why, funnel progress, phase groups, Core Values, Yearly Objectives, Vision Board, Big 5 entry point, and One-Page MAP preview.
- Progress screen with 66-day challenge grid, counters, missed-day neutral state, milestones, review history, journal archive, and Success Strings collection.
- Weekly Review five-step flow.
- Big 5 signing ceremony with pointer/touch signature capture and signed certificate view.
- Big 5 recite mode: full-screen, one commitment per swipe, for daily reading.
- Full My MAP exercise flows: What a Fulfilled Life Means (ten-line builder), I Know Who I Am (strengths/growth edges/passions), Daily Rituals (habit-to-ritual chain plus keep/drop panes), and Sharpen the Saw (learn/why plus one weekly action that surfaces on Today).
- Today "Next on your MAP" now points to the next unfinished exercise, and surfaces the week's one action.
- More screen with profile/reminder settings, import/export data, restart 66, and Sellership University card.
- Local-first autosave to `localStorage`.

Not built yet:

- Durable Vision Board media storage. Local image upload is working for prototype use.
- Journaling archive search.
- One-Page MAP PDF/lock-screen export. Browser print is wired.
- Account sync, notifications, or production auth.

## Source Material

Primary product/design handoff:

- `/Users/benward/Desktop/design_handoff_vision_map_app/README.md`
- `/Users/benward/Desktop/design_handoff_vision_map_app/Vision_MAP_App_Design_Brief.md`
- `/Users/benward/Desktop/design_handoff_vision_map_app/Vision MAP App - Design Canvas.html`
- `/Users/benward/Desktop/design_handoff_vision_map_app/screenshots/`

Brand source:

- `/Users/benward/Desktop/Brand Assets/Ben Ward_ Sellership Brand Guidelines.pdf`
- Local summary: `BRAND_NOTES.md`

## Project Structure

```text
vision-map/
├── public/
│   ├── assets/       # Official Vision MAP/Sellership marks copied from handoff
│   └── fonts/        # Licensed Averta and Hollanda files copied from handoff
├── scripts/
│   ├── structure-smoke.mjs
│   └── browser-smoke.mjs
├── src/
│   ├── App.jsx       # App shell and active-view controller
│   ├── components.jsx # Shared UI primitives
│   ├── derived.js    # Derived product state and display helpers
│   ├── main.jsx      # React entry point
│   ├── modes.jsx     # Full-screen practice and ceremony modes
│   ├── views/        # Onboarding, Today, My MAP, Progress, More
│   └── styles.css    # Brand tokens, layout, responsive UI
├── BRAND_NOTES.md    # Brand guardrails extracted from the PDF
├── BACKEND_PLAN.md   # Account, sync, media storage, and backend plan
├── DEVELOPER_HANDOFF.md
├── PRODUCTION_BACKLOG.md
├── STATE_MODEL.md    # Local-first data model and derived state notes
├── ROADMAP.md        # Recommended next implementation order
└── README.md
```

## Implementation Notes

- Framework: React + Vite.
- Persistence: `localStorage`, key `vision-map-state-v1`.
- State/storage helpers live in `src/state.js`.
- State updates use a single `update(recipe)` helper in `App.jsx`.
- The current build uses seeded sample data so the app feels realistic immediately.
- Account sync is scaffolded in state and UI, but not connected to a real backend yet.
- Vision Board uploads work as local data URLs for prototype use. Production should move media to object storage.
- Body text should stay at 16px or larger.
- Do not use pure black, red missed-day states, confetti, badges, or generic SaaS dashboard patterns.
- UI copy should follow the design brief. No em dashes in product UI.

## Handoff Expectations

A new developer should start by reading:

1. `README.md`
2. `DEVELOPER_HANDOFF.md`
3. `PRODUCTION_BACKLOG.md`
4. `BRAND_NOTES.md`
5. `STATE_MODEL.md`
6. `ROADMAP.md`
7. `BACKEND_PLAN.md`
8. The product design brief in the original handoff folder

Then run `npm install`, `npm run dev`, and `npm run build`.
