# Backend And Sync Plan

The app should remain local-first even after accounts are added. The user must be able to open Today, mark the day, journal, read affirmations, and run Hour of Power without waiting on the network.

## Recommendation

Use this progression:

1. Keep the current local-first app working.
2. Add real auth.
3. Add cloud document sync for the MAP JSON.
4. Add media storage for Vision Board images and exported artifacts.
5. Add notifications.

## Current Architecture

State lives in:

- `src/state.js`

Current persistence:

- `loadState()`
- `saveState(state)`
- `normalizeState(saved)`
- `exportState(state)`

The app imports those helpers in `src/App.jsx`. This is the future sync boundary.

## Data Ownership

Each signed-in user should own one active Vision MAP document:

```text
users/{userId}
vision_maps/{mapId}
vision_map_events/{eventId}
vision_board_assets/{assetId}
exports/{exportId}
```

The full local JSON shape from `STATE_MODEL.md` should remain the client contract.

## Account State

The app already has:

```js
account: {
  status: 'local' | 'connected' | 'syncing' | 'error',
  userId: string,
  email: string,
  displayName: string,
  lastSyncedAt: string,
  syncMessage: string,
  pendingChanges: number
}
```

The current Account panel creates an account shell locally. Replace that action with real auth later.

## Sync Adapter Shape

Add a module like:

```text
src/sync/
├── localAdapter.js
├── cloudAdapter.js
└── syncClient.js
```

Suggested API:

```js
async function signIn(email)
async function signOut()
async function loadRemoteMap(userId)
async function saveRemoteMap(userId, state)
async function uploadVisionAsset(userId, file)
async function resolveConflict(localState, remoteState)
```

`App.jsx` should not know which backend is used. It should call a sync client.

## Conflict Rule

For v1, use field-level last-write-wins where `updatedAt` exists. For daily activity arrays, merge by date:

- `challenge.markedDates`
- `rituals.hourKeptDates`
- `rituals.affirmationsReadDates`
- `rituals.journalDates`

For user-authored lists, merge by item id once ids exist:

- Vision Board images
- Success Strings
- Journal entries
- Weekly Reviews

## Media Storage

Current prototype stores uploaded Vision Board images as data URLs. That is good for proving the workflow, not production.

Production should store:

```js
visionBoard.images[] = {
  id: string,
  src: string,       // public/signed URL
  storagePath: string,
  caption: string,
  updatedAt: string
}
```

Use object storage for:

- Vision Board uploads
- Big 5 signature image
- One-Page MAP exports
- Lock-screen image exports

## Notification Plan

Notifications should be opt-in after onboarding:

- Morning: "Your Hour of Power is waiting. Move first."
- Evening: "Two minutes of gratitude before bed. Write it down."
- Streak save: "The day is not over. Mark it before midnight."

Keep reminder settings in `profile`.

## Backend Choices

Good fits:

- Supabase: auth, Postgres JSON document, storage, edge functions.
- Firebase: auth, Firestore document sync, storage, cloud messaging.

Recommendation: Supabase if this becomes a web app with structured reporting/admin needs. Firebase if offline multi-device sync and mobile push become the center of gravity.
