# Vision MAP Implementation Roadmap

Recommended order for the next developer.

## Phase 1: Complete The Daily Loop

1. Polish full-screen Hour of Power.
   - Add idle state before countdown starts.
   - Add true phase transition crossfade.
   - Add audible/haptic cue settings only if desired.

2. Upgrade Visualize slideshow.
   - Replace placeholder art panels with actual uploaded Vision Board images.
   - Add image-fit controls if needed.

3. Daily practice details.
   - Add Success Strings collection management.
   - Add journal archive under Progress.
   - Add Big 5 recite mode using the signed commitment cards.

## Phase 2: Build The MAP

4. Exercise template component.
   - Section tag, title, teaching prose, Ben's Example, Activity block, autosave tick, footer.
   - Apply first to Core Values, Yearly Objectives, Vision Board.

5. My MAP real completion logic.
   - Move phase/item definitions into a shared data module.
   - Compute complete, in-progress, and next exercise states.

6. Vision Board.
   - Add real upload from camera or file.
   - Persist media using the final storage strategy.
   - Keep the 2-column masonry and caption editing already scaffolded.

## Phase 3: Ceremony And Output

7. Big 5 signing.
   - Refine the pointer/touch canvas capture already scaffolded.
   - Polish signed certificate view for print/export.
   - Add Recite mode.

8. One-Page MAP.
   - Refine the scaffolded screen version.
   - Expand print stylesheet for exact US Letter.
   - Add PDF and lock-screen image export.

9. Weekly Review flow.
   - Refine the five guided steps already scaffolded.
   - Surface the saved weekly action on Today.
   - Add richer history details on Progress.

## Phase 4: Production Hardening

10. State migrations.
    - Version persisted data.
    - Add import/export JSON.

11. Accessibility pass.
    - Focus states.
    - Keyboard navigation.
    - Larger text checks for recite/timer modes.

12. Account sync and notifications.
    - Keep local-first behavior.
    - Morning, evening, and streak-save reminders.

## Code Organization Recommendation

As the app grows, split `src/App.jsx` into:

```text
src/
├── App.jsx
├── state/
│   ├── defaultState.js
│   ├── derived.js
│   └── storage.js
├── components/
│   ├── AppShell.jsx
│   ├── Brand.jsx
│   ├── Funnel.jsx
│   └── WhyCard.jsx
└── views/
    ├── Onboarding.jsx
    ├── Today.jsx
    ├── MyMap.jsx
    ├── Progress.jsx
    └── More.jsx
```

Keep this split mechanical. Avoid changing behavior during the refactor.
