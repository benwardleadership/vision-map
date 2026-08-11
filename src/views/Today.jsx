import { Page, QuoteNote, Stats } from '../components.jsx'
import { challengeDay, firstName, nextExercise } from '../derived.js'
import { todayIso } from '../state.js'

export default function Today({ state, update }) {
  const marked = state.challenge.markedDates.includes(todayIso())
  const day = challengeDay(state)
  const carrying = state.successStrings.find((item) => item.status === 'carrying') || state.successStrings[0]
  const isSunday = new Date().getDay() === 0
  const next = nextExercise(state)
  const oneAction = state.sharpenTheSaw.oneAction || state.weeklyReviews[0]?.oneAction || ''

  return (
    <Page eyebrow={new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} title={`Morning, ${firstName(state.profile.name)}.`} sub={`Day ${day} of 66`}>
      <div className="today-grid">
        <section className="stack">
          <button className={`mark ${marked ? 'is-kept' : ''}`} onClick={() => update((s) => {
            if (!s.challenge.markedDates.includes(todayIso())) s.challenge.markedDates.push(todayIso())
          })}>{marked ? `Day ${day}. Kept.` : 'Mark today'}</button>
          <HourCard state={state} update={update} />
          <DailyPractice state={state} update={update} />
          <QuoteNote text="All change is hard at first, messy in the middle, and gorgeous in the end." source="Robin Sharma" />
        </section>
        <aside className="stack">
          {isSunday ? (
            <div className="sunday card">
              <p>Sunday evening. Review your objectives. Ten minutes.</p>
              <button className="btn btn-navy" onClick={() => update((s) => { s.activeMode = 'review' })}>Review</button>
            </div>
          ) : next ? (
            <button className="next card" onClick={() => update((s) => { s.activeView = 'map' })}>
              <p className="eyebrow">Next on your MAP</p>
              <h3>{next.name}</h3>
              <p>10 min · {next.phase}</p>
            </button>
          ) : (
            <div className="next card is-complete">
              <p className="eyebrow">Your MAP</p>
              <h3>Every section is built.</h3>
              <p>Now work it daily.</p>
            </div>
          )}
          {oneAction && (
            <div className="one-action card">
              <p className="eyebrow">This week's one action</p>
              <h3>{oneAction}</h3>
            </div>
          )}
          <button className="card carrying carrying-button" onClick={() => update((s) => { s.activeMode = 'carry' })}>
            <p className="eyebrow">Carrying</p>
            <h3>{carrying.text}</h3>
            <p>{carrying.runs || 0} in a row · Tap to recite</p>
          </button>
          <Stats state={state} />
        </aside>
      </div>
    </Page>
  )
}

function HourCard({ state, update }) {
  const split = state.profile.preset === 60 ? [20, 20, 20] : state.profile.preset === 30 ? [10, 10, 10] : [5, 5, 5]
  return (
    <section className="hour card dark-card">
      <div className="card-head">
        <div>
          <p className="eyebrow">Hour of Power</p>
          <h2>Move. Visualize. Read.</h2>
        </div>
        <button className="btn btn-teal" onClick={() => update((s) => { s.activeMode = 'hour' })}>Start</button>
      </div>
      {['Move', 'Visualize', 'Read'].map((phase, index) => (
        <div className="hop-row" key={phase}>
          <span>{phase}</span>
          <small>{index === 0 ? 'Exercise that makes you sweat.' : index === 1 ? 'Focus on your ideal life.' : 'The best material on what you want to become.'}</small>
          <b>{split[index]}m</b>
        </div>
      ))}
      <div className="preset-line">
        {[60, 30, 15].map((preset) => (
          <button key={preset} className={`preset ${state.profile.preset === preset ? 'is-on' : ''}`} onClick={() => update((s) => { s.profile.preset = preset })}>{preset}</button>
        ))}
      </div>
    </section>
  )
}

function DailyPractice({ state, update }) {
  const items = [
    ['Affirmations', 'Read', 'affirmationsReadDates', 'affirmations'],
    ['Journal', 'Write', 'journalDates', 'journal'],
    ['Visualize', 'My MAP', null, 'visualize'],
  ]
  return (
    <section className="practice">
      {items.map(([name, label, key, mode]) => {
        const done = key && state.rituals[key].includes(todayIso())
        return (
          <button className={`practice-tile ${done ? 'is-done' : ''}`} key={name} onClick={() => update((s) => { s.activeMode = mode })}>
            <b>{name}</b>
            <span>{done ? 'Done' : label}</span>
          </button>
        )
      })}
    </section>
  )
}
