# Vision MAP State Model

The app is local-first. The current prototype stores one JSON document in `localStorage` under:

```text
vision-map-state-v1
```

The shape follows the product brief Appendix Section 13.

## Root

```js
{
  onboarded: boolean,
  activeView: 'today' | 'map' | 'progress' | 'more',
  account,
  profile,
  why,
  fulfilledLife,
  values,
  objectives,
  identity,
  visionBoard,
  rituals,
  big5,
  successStrings,
  affirmations,
  journal,
  challenge,
  weeklyReviews
}
```

Only the currently used branches are seeded in `src/App.jsx`. Add the missing branches as their screens are implemented.

## Current Branches

### `account`

```js
{
  status: 'local' | 'connected' | 'syncing' | 'error',
  userId: string,
  email: string,
  displayName: string,
  lastSyncedAt: string,
  syncMessage: string,
  pendingChanges: number
}
```

This is the account/sync shell. The current app simulates connection locally. Replace with real auth and cloud sync through a sync adapter later.

### `profile`

```js
{
  name: string,
  commitment: 'committed' | 'looking',
  commitmentDate: 'YYYY-MM-DD',
  morningReminder: string,
  eveningReminder: string,
  sundayReminder: string,
  preset: 60 | 30 | 15
}
```

### `why`

```js
{
  contribution: string,
  impact: string,
  updatedAt: 'YYYY-MM-DD'
}
```

Derived display text:

```text
My Why is to {contribution}, so that {impact}.
```

### `values`

```js
{
  brainstorm: string[],
  core: string[], // encourage 3-5
  updatedAt: 'YYYY-MM-DD'
}
```

### `objectives`

```js
{
  theme: string,
  year: number,
  updatedAt: 'YYYY-MM-DD',
  areas: {
    higherPower: string,
    family: string,
    health: string,
    personal: string,
    education: string,
    financial: string
  }
}
```

### `visionBoard`

```js
{
  images: [{ src?: string, caption: string }]
}
```

Current prototype supports local image uploads as data URLs. Production should move uploaded media to durable object storage and store URLs/storage paths here.

### `rituals`

```js
{
  hourKeptDates: string[],
  affirmationsReadDates: string[],
  journalDates: string[]
}
```

### `big5`

```js
{
  name: string,
  signatureImage: string,
  signedDate: string
}
```

`signatureImage` should become a data URL from a pointer/touch canvas.

### `successStrings`

```js
[
  {
    text: string,
    source: string,
    status: 'collecting' | 'carrying' | 'memorized',
    runs: number
  }
]
```

### `affirmations`

```js
{
  lines: string[]
}
```

### `journal`

```js
[
  {
    date: 'YYYY-MM-DD',
    gratefulNow: string,
    gratefulAhead: string
  }
]
```

### `challenge`

```js
{
  startDate: 'YYYY-MM-DD',
  markedDates: string[],
  completions: number
}
```

Derived:

- Current day: days since `startDate`, capped at 66.
- Best streak: longest consecutive run in `markedDates`.
- Missed tiles: dates before today not in `markedDates`.
- Milestones: days 22, 44, 66.

### `weeklyReviews`

```js
[
  {
    date: 'YYYY-MM-DD',
    areaStatus?: Record<string, 'on-track' | 'needs-attention'>,
    adjustment: string,
    oneAction: string
  }
]
```

## Future Sync

When account sync is added, keep this JSON shape as the client contract. Add migration helpers by `schemaVersion` instead of changing keys in place.
