# Production Backlog

Prioritized backlog for taking Vision MAP™ from working prototype to production app.

## P0: Make It Safe To Ship Internally

- Continue splitting larger view/mode files into smaller feature components.
- Expand automated tests beyond the current structure smoke and optional browser smoke scripts.
- Add route handling for deep links and browser back behavior.
- Add error boundaries.
- Add empty/loading/error states around future sync.
- Add state migrations by `schemaVersion`.
- Add import data flow to pair with export data.

## P1: Real Accounts And Sync

- Choose backend.
- Implement auth.
- Implement sync adapter.
- Save one active MAP document per user.
- Merge daily arrays by date.
- Add conflict handling for edited text fields.
- Add account settings: email, sign out, delete local data, export data.

## P2: Media And Output

- Store Vision Board images in object storage.
- Store Big 5 signature image in object storage or encrypted user document storage.
- Generate One-Page MAP PDF.
- Generate signed Big 5 PDF/image.
- Generate phone lock-screen image.
- Add download history if needed.

## P3: Complete Workbook Coverage

- What a Fulfilled Life Means.
- I Know Who I Am.
- Daily Rituals.
- Sharpen the Saw.
- Full Big 5 recite mode.
- Full Success Strings carry/memorize flow.
- Journal archive search.
- Weekly Review history detail view.

## P4: Reminders And Mobile Polish

- Notification permission flow.
- Morning reminder.
- Evening journal reminder.
- Sunday review reminder.
- Streak-save reminder.
- Installable PWA support.
- Offline status indicator.
- Touch polish for signature and swipe modes.

## P5: Quality Bar

- Accessibility audit.
- Keyboard navigation.
- Screen-reader labels.
- Reduced-motion support.
- Cross-browser test.
- Mobile Safari test.
- Data-loss testing.
- Performance pass for large Vision Boards and journal archives.

## Acceptance Criteria For V1

- A new user can complete onboarding and write their Why.
- The user can work Today without completing the full MAP.
- Mark today persists after refresh.
- Hour of Power can complete and mark the day.
- Journal entries persist and appear in archive.
- Affirmations can be edited and read.
- Success Strings can be collected, carried, and memorized.
- Vision Board accepts real images.
- My MAP reflects completion state.
- Big 5 can be signed and viewed as certificate.
- Weekly Review saves history.
- One-Page MAP can be printed.
- Export data works.
- Signed-in user can sync across two devices.
- The app works offline for daily loop actions.
