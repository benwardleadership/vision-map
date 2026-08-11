import { addDays, todayIso } from './state.js'

export function makeWhy(state) {
  return `My Why is to ${state.why.contribution}, so that ${state.why.impact}.`
}

export function firstName(name) {
  return name.split(' ')[0] || 'there'
}

export function challengeDay(state) {
  const start = new Date(`${state.challenge.startDate}T12:00:00`)
  const now = new Date()
  return Math.min(66, Math.max(1, Math.floor((now - start) / 86400000) + 1))
}

export function bestStreak(state) {
  const dates = [...state.challenge.markedDates].sort()
  let best = 0
  let current = 0
  let previous = null
  for (const iso of dates) {
    if (!previous || iso === addDays(previous, 1)) current += 1
    else current = 1
    best = Math.max(best, current)
    previous = iso
  }
  return best
}

export function mapGroups(state) {
  return [
    {
      name: 'Purpose Filter',
      items: [
        { name: 'Your Why', done: Boolean(state.why.contribution && state.why.impact), updatedAt: state.why.updatedAt },
        { name: 'Your Core Values', done: state.values.core.length >= 3, updatedAt: state.values.updatedAt },
      ],
    },
    {
      name: 'Fulfilled Life',
      items: [
        { name: 'What a Fulfilled Life Means', done: filledLines(state.fulfilledLife.lines).length >= 3, updatedAt: state.fulfilledLife.updatedAt },
        { name: 'I Know Who I Am', done: state.identity.strengths.length > 0 && state.identity.growthEdges.length > 0 && state.identity.passions.length > 0, updatedAt: state.identity.updatedAt },
        { name: 'Vision Board', done: state.visionBoard.images.length > 0, updatedAt: todayIso() },
      ],
    },
    {
      name: 'Smart M.A.P',
      items: [
        { name: 'Your Yearly Objectives', done: Boolean(state.objectives.theme), updatedAt: state.objectives.updatedAt },
        { name: 'Daily Rituals', done: state.dailyRituals.ritualsToBuild.length > 0, updatedAt: state.dailyRituals.updatedAt },
        { name: 'Sharpen the Saw', done: Boolean(state.sharpenTheSaw.learn.trim()), updatedAt: state.sharpenTheSaw.updatedAt },
      ],
    },
    {
      name: 'Crystalizer',
      items: [
        { name: 'The Big 5', done: Boolean(state.big5.signedDate), updatedAt: state.big5.signedDate },
        { name: 'Success Strings', done: state.successStrings.length > 0, updatedAt: todayIso() },
        { name: 'Daily Affirmations', done: state.affirmations.lines.length > 0, updatedAt: todayIso() },
        { name: 'Daily Journaling setup', done: false },
      ],
    },
  ].map((group) => ({ ...group, done: group.items.filter((item) => item.done).length }))
}

export function completedCount(groups) {
  return groups.filter((group) => group.done === group.items.length).length || 1
}

export function filledLines(lines) {
  return (lines || []).filter((line) => line && line.trim())
}

export function nextExercise(state) {
  for (const group of mapGroups(state)) {
    const item = group.items.find((entry) => !entry.done)
    if (item) return { name: item.name, phase: group.name }
  }
  return null
}

export function getHourPhases(preset) {
  const minutes = preset === 60 ? [20, 20, 20] : preset === 30 ? [10, 10, 10] : [5, 5, 5]
  return [
    { key: 'move', name: 'Move', description: 'Exercise that makes you sweat.', seconds: minutes[0] * 60 },
    { key: 'visualize', name: 'Visualize', description: 'Focus on your ideal life.', seconds: minutes[1] * 60 },
    { key: 'read', name: 'Read', description: 'The best material on what you want to become.', seconds: minutes[2] * 60 },
  ]
}

export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${mins}:${secs}`
}

export function labelArea(key) {
  return {
    higherPower: 'Higher Power',
    family: 'Family',
    health: 'Health',
    personal: 'Personal',
    education: 'Education',
    financial: 'Financial',
  }[key] || key
}
