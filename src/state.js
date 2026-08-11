export const storageKey = 'vision-map-state-v1'

export const todayIso = () => new Date().toISOString().slice(0, 10)

export const addDays = (iso, days) => {
  const date = new Date(`${iso}T12:00:00`)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export const defaultState = {
  schemaVersion: 1,
  onboarded: false,
  activeView: 'today',
  activeMode: null,
  account: {
    status: 'local',
    userId: '',
    email: '',
    displayName: '',
    lastSyncedAt: '',
    syncMessage: 'Saved on this device.',
    pendingChanges: 0,
  },
  profile: {
    name: 'Alex Rivera',
    commitment: 'committed',
    commitmentDate: todayIso(),
    morningReminder: '6:30 AM',
    eveningReminder: '8:45 PM',
    sundayReminder: '6:00 PM',
    preset: 60,
  },
  why: {
    contribution: 'build leaders who sell with purpose',
    impact: 'families, teams, and communities are stronger because of the work',
    updatedAt: todayIso(),
  },
  values: {
    brainstorm: ['Truth', 'Discipline', 'Service', 'Courage', 'Faith', 'Ownership'],
    core: ['Truth', 'Discipline', 'Service'],
    updatedAt: todayIso(),
  },
  fulfilledLife: {
    lines: [
      'Mornings that start slow and grounded, not rushed.',
      'Work I would do even if no one was watching.',
      'A body that can keep up with my kids.',
      'Dinners where the phones are in the other room.',
      'Enough margin to say yes to the people who need me.',
      'A faith I practice, not just believe.',
    ],
    updatedAt: todayIso(),
  },
  identity: {
    strengths: ['Discipline', 'Empathy', 'Follow-through', 'Teaching'],
    growthEdges: ['Patience under pressure', 'Saying no cleanly', 'Delegating sooner'],
    passions: ['Building leaders', 'Early mornings', 'Writing', 'Coaching my kids'],
    updatedAt: todayIso(),
  },
  objectives: {
    theme: 'Earn the right',
    year: 2026,
    updatedAt: todayIso(),
    areas: {
      higherPower: 'Begin each morning grounded and grateful.',
      family: 'Protect dinner, weekends, and present attention.',
      health: 'Train five days, sleep with discipline.',
      personal: 'Choose the hard right over the easy drift.',
      education: 'Read, study, and teach the system weekly.',
      financial: 'Build margin through useful work and restraint.',
    },
  },
  visionBoard: {
    images: [
      { caption: 'A home that gives the family room to breathe.' },
      { caption: 'A business that runs on purpose and standards.' },
      { caption: 'Health strong enough to carry the calling.' },
    ],
  },
  dailyRituals: {
    habitsToDrop: ['Phone before the Hour of Power', 'Saying yes when I mean no', 'Skipping lunch, then crashing'],
    ritualsToBuild: ['Hour of Power before the house wakes', 'Read the Big 5 out loud', 'Shut the laptop by 6pm'],
    updatedAt: todayIso(),
  },
  sharpenTheSaw: {
    learn: 'One chapter of the craft each week, studied and applied.',
    why: 'The person I am becoming reads more than the person I was.',
    oneAction: 'Read 20 minutes before the phone, every day this week.',
    updatedAt: todayIso(),
  },
  rituals: {
    hourKeptDates: [],
    affirmationsReadDates: [],
    journalDates: [],
  },
  big5: {
    name: '',
    signatureImage: '',
    signedDate: '',
  },
  successStrings: [
    {
      text: 'The day is won in the morning.',
      source: 'Ben Ward',
      status: 'carrying',
      runs: 2,
    },
    {
      text: 'Pluck the FUD®. Plant intentional thought.',
      source: 'Vision MAP',
      status: 'collecting',
      runs: 0,
    },
    {
      text: 'Make the promise small enough to keep and serious enough to matter.',
      source: 'Ben Ward',
      status: 'memorized',
      runs: 6,
    },
  ],
  affirmations: {
    lines: [
      'I am the kind of person who keeps promises to myself.',
      'My life is designed on purpose and worked daily.',
      'I am grateful that my work creates strength for my family.',
    ],
  },
  journal: [],
  challenge: {
    startDate: addDays(todayIso(), -13),
    markedDates: [addDays(todayIso(), -13), addDays(todayIso(), -12), addDays(todayIso(), -11), addDays(todayIso(), -10), addDays(todayIso(), -9), addDays(todayIso(), -7), addDays(todayIso(), -6), addDays(todayIso(), -5), addDays(todayIso(), -4), addDays(todayIso(), -3), addDays(todayIso(), -2), addDays(todayIso(), -1)],
    completions: 0,
  },
  weeklyReviews: [
    {
      date: addDays(todayIso(), -6),
      adjustment: 'Move first. No phone before the Hour of Power.',
      oneAction: 'Schedule the family night before Monday starts.',
    },
  ],
}

export function loadState() {
  try {
    const saved = localStorage.getItem(storageKey)
    return saved ? normalizeState(JSON.parse(saved)) : defaultState
  } catch {
    return defaultState
  }
}

export function saveState(state) {
  // Writing can throw rather than fail quietly: Safari blocks storage for a
  // cross site iframe, private mode can refuse writes, and a large vision board
  // can hit the quota. An unhandled throw here would take the whole app down
  // mid keystroke, so failing to persist has to stay non fatal. When the app is
  // embedded in WordPress the server copy is the real backstop anyway.
  try {
    localStorage.setItem(storageKey, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

export function normalizeState(saved) {
  return {
    ...defaultState,
    ...saved,
    account: { ...defaultState.account, ...saved.account },
    profile: { ...defaultState.profile, ...saved.profile },
    why: { ...defaultState.why, ...saved.why },
    values: { ...defaultState.values, ...saved.values },
    fulfilledLife: { ...defaultState.fulfilledLife, ...saved.fulfilledLife },
    identity: { ...defaultState.identity, ...saved.identity },
    dailyRituals: { ...defaultState.dailyRituals, ...saved.dailyRituals },
    sharpenTheSaw: { ...defaultState.sharpenTheSaw, ...saved.sharpenTheSaw },
    objectives: {
      ...defaultState.objectives,
      ...saved.objectives,
      areas: { ...defaultState.objectives.areas, ...saved.objectives?.areas },
    },
    visionBoard: { ...defaultState.visionBoard, ...saved.visionBoard },
    rituals: { ...defaultState.rituals, ...saved.rituals },
    big5: { ...defaultState.big5, ...saved.big5 },
    affirmations: { ...defaultState.affirmations, ...saved.affirmations },
    challenge: { ...defaultState.challenge, ...saved.challenge },
    activeMode: null,
  }
}

export function exportState(state) {
  const payload = JSON.stringify(state, null, 2)
  const blob = new Blob([payload], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `vision-map-export-${todayIso()}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export function importStateFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        resolve(normalizeState(JSON.parse(reader.result)))
      } catch {
        reject(new Error('Could not import that file. Choose a Vision MAP JSON export.'))
      }
    }
    reader.onerror = () => reject(new Error('Could not read that file.'))
    reader.readAsText(file)
  })
}
