import { Page, Stats } from '../components.jsx'
import { addDays, todayIso } from '../state.js'

export default function Progress({ state, update }) {
  const marked = state.challenge.markedDates.includes(todayIso())
  return (
    <Page eyebrow="66-Day Challenge" title="Work the ritual." sub="Missing one day does not break the process. Start again this morning.">
      <div className="progress-head">
        <Stats state={state} />
        <div className="button-row align-left">
          <button className="btn btn-yellow" onClick={() => update((s) => {
            if (!s.challenge.markedDates.includes(todayIso())) s.challenge.markedDates.push(todayIso())
          })}>{marked ? 'Mark today ✓' : 'Mark today'}</button>
          <button className="btn btn-navy" onClick={() => update((s) => { s.activeMode = 'review' })}>Review</button>
        </div>
      </div>
      <ChallengeGrid state={state} />
      <section className="history card">
        <h3>Weekly Review History</h3>
        {state.weeklyReviews.map((review) => (
          <div className="review-row" key={review.date}>
            <b>{review.date}</b>
            <span>{review.oneAction}</span>
          </div>
        ))}
      </section>
      <JournalArchive state={state} />
      <SuccessStringsCollection state={state} update={update} />
    </Page>
  )
}

function JournalArchive({ state }) {
  return (
    <section className="history card archive-block">
      <h3>Journal Archive</h3>
      {state.journal.length === 0 ? (
        <p>Start with gratitude. What are you thankful for today?</p>
      ) : state.journal.map((entry) => (
        <article className="archive-card" key={entry.date}>
          <b>{entry.date}</b>
          <p>{entry.gratefulNow || 'Today I am grateful for...'}</p>
          <p>{entry.gratefulAhead || 'As if it already has...'}</p>
        </article>
      ))}
    </section>
  )
}

function SuccessStringsCollection({ state, update }) {
  return (
    <section className="history card archive-block">
      <div className="card-head">
        <h3>Success Strings</h3>
        <button className="btn btn-navy" onClick={() => update((s) => {
          s.successStrings.unshift({ text: 'Keep your antenna up.', source: 'Captured line', status: 'collecting', runs: 0 })
        })}>Capture a line</button>
      </div>
      <div className="strings-grid">
        {state.successStrings.map((item, index) => (
          <article className={`string-card is-${item.status}`} key={`${item.text}-${index}`}>
            <select value={item.status} onChange={(event) => update((s) => { s.successStrings[index].status = event.target.value })}>
              <option value="collecting">Collecting</option>
              <option value="carrying">Carrying</option>
              <option value="memorized">Memorized</option>
            </select>
            <textarea value={item.text} onChange={(event) => update((s) => { s.successStrings[index].text = event.target.value })} />
            <input value={item.source} onChange={(event) => update((s) => { s.successStrings[index].source = event.target.value })} />
          </article>
        ))}
      </div>
    </section>
  )
}

function ChallengeGrid({ state }) {
  const today = todayIso()
  const marked = new Set(state.challenge.markedDates)
  return (
    <div className="challenge-grid">
      {Array.from({ length: 66 }, (_, index) => {
        const day = index + 1
        const date = addDays(state.challenge.startDate, index)
        const past = date < today
        const classes = [
          marked.has(date) ? 'is-kept' : '',
          past && !marked.has(date) ? 'is-missed' : '',
          date === today ? 'is-today' : '',
          [22, 44, 66].includes(day) ? 'is-mile' : '',
        ].filter(Boolean).join(' ')
        return <span className={`tile ${classes}`} key={day} title={`Day ${day}`} />
      })}
    </div>
  )
}
