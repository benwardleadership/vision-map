# Vision MAP Developer Handoff

This is the start-here file for a software team taking over the Vision MAP™ app.

## What You Have

A working React + Vite prototype for Vision MAP™, built from the approved design handoff and Ben Ward / Sellership® brand guidelines.

Current app folder:

```text
/Users/benward/Desktop/design_handoff_pearl_cloud/vision-map
```

## Run It

```bash
cd /Users/benward/Desktop/design_handoff_pearl_cloud/vision-map
npm install
npm run dev
```

Then open the local URL Vite prints, usually:

```text
http://127.0.0.1:5173/
```

Build verification:

```bash
npm run build
```

Smoke verification:

```bash
npm test
```

Optional browser smoke verification:

```bash
npm install -D playwright
npm run test:browser
```

## Read These In Order

1. `README.md`
2. `BRAND_NOTES.md`
3. `STATE_MODEL.md`
4. `BACKEND_PLAN.md`
5. `ROADMAP.md`
6. `PRODUCTION_BACKLOG.md`

Then read the original handoff:

```text
/Users/benward/Desktop/design_handoff_vision_map_app/README.md
/Users/benward/Desktop/design_handoff_vision_map_app/Vision_MAP_App_Design_Brief.md
/Users/benward/Desktop/design_handoff_vision_map_app/Vision MAP App - Design Canvas.html
/Users/benward/Desktop/design_handoff_vision_map_app/screenshots/
```

Brand source:

```text
/Users/benward/Desktop/Brand Assets/Ben Ward_ Sellership Brand Guidelines.pdf
```

## Current Feature Coverage

Built and working:

- Onboarding and Why builder.
- Today dashboard.
- Hour of Power timer overlay.
- Visualize slideshow.
- Affirmations read/edit mode.
- Daily Journal editor.
- Success Strings carry mode and collection.
- My MAP overview.
- Core Values preview.
- Yearly Objectives editor.
- Vision Board with local image upload.
- Big 5 signing ceremony with signature canvas.
- Signed Big 5 certificate view.
- One-Page MAP preview and browser print.
- 66-Day Challenge grid.
- Weekly Review five-step flow.
- More/settings page.
- Account/sync shell.
- Export data.
- Import data.
- Restart 66.
- Local-first autosave.

Prototype-only or incomplete:

- Account auth and real cloud sync.
- Production media storage.
- Push/local notifications.
- PDF export and lock-screen export.
- Big 5 recite mode.
- Full workbook exercise set.
- Journal archive search.
- True route-based navigation.
- Automated tests.

## Architecture Snapshot

```text
src/
├── App.jsx       # App shell and active-view controller
├── components.jsx # Shared UI primitives
├── derived.js    # Derived product state, MAP completion, timer phases
├── main.jsx      # React entry point
├── modes.jsx     # Full-screen practice and ceremony modes
├── state.js      # State schema, local persistence, export helper
├── styles.css    # Brand tokens, responsive layout, component styles
└── views/        # Onboarding, Today, My MAP, Progress, More
```

```text
scripts/
├── structure-smoke.mjs # Zero-dependency structure and source guardrails
└── browser-smoke.mjs   # Optional Playwright browser smoke test
```

This is intentionally simple at the prototype stage. `App.jsx` has already been split into views, shared components, modes, state, and derived helpers. The next engineering step is a deeper split inside larger view files and adding a real sync adapter.

Recommended split:

```text
src/
├── App.jsx
├── state/
│   ├── defaultState.js
│   ├── derived.js
│   └── storage.js
├── sync/
│   ├── localAdapter.js
│   ├── cloudAdapter.js
│   └── syncClient.js
├── components/
│   ├── AppShell.jsx
│   ├── Brand.jsx
│   ├── Funnel.jsx
│   ├── ModeOverlay.jsx
│   └── WhyCard.jsx
└── views/
    ├── Onboarding.jsx
    ├── Today.jsx
    ├── MyMap.jsx
    ├── Progress.jsx
    └── More.jsx
```

## Production Recommendation

Keep the product local-first. Add accounts and sync without blocking the daily loop.

Recommended backend:

- Supabase if the product needs admin/reporting, structured data, and simple storage.
- Firebase if offline multi-device sync and mobile push become the priority.

Current recommendation: Supabase.

Why:

- Auth.
- Postgres JSON document storage.
- Object storage for Vision Board and exports.
- Edge functions for PDF/image export.
- Clean migration path from the current local JSON model.

## Key Product Rules

- The daily loop is never gated behind MAP completion.
- No shame, no red missed days, no confetti.
- Ceremony over gamification.
- Dark navy for moments. Light surfaces for work.
- Use exact brand colors only.
- Use Averta for UI. Hollanda only for signature moments.
- Do not paraphrase approved UI copy unless the product owner approves.
- No em dashes in product UI.

## Immediate Engineering Priorities

1. Add automated smoke tests for the main flows.
2. Add real routing or stateful view routing.
3. Split larger view files into smaller feature components.
4. Implement sync adapter interface.
5. Decide backend and wire real auth.
6. Move Vision Board images and signature images from data URLs to object storage.
7. Add the remaining workbook exercises.
8. Add PDF/image export.
9. Add notification permission and reminders.
10. Run a full accessibility pass.

## Verification Checklist

Before handing back:

- `npm install` completes.
- `npm run build` passes.
- `npm test` passes.
- App opens at local dev URL.
- Onboarding can be completed.
- Today can mark the day.
- Hour of Power opens and runs.
- Affirmations opens.
- Journal saves an entry.
- Success Strings opens.
- My MAP opens.
- Vision Board add tile appears.
- Big 5 opens and signature canvas appears.
- Weekly Review opens from Progress.
- More shows Account, Import data, and Export data.
- Mobile width has no horizontal overflow.

## Notes For Ben

This is not just a visual mockup. It is a working app scaffold. It still needs production engineering, but the main product experience is in place and tied to a state model that can become the backend contract.
