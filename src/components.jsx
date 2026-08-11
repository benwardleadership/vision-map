import { bestStreak, makeWhy } from './derived.js'

export function Rail({ active, state, go }) {
  return (
    <aside className="rail">
      <img className="rail-lockup" src="/assets/vision-map-onnavy.png" alt="Vision MAP" />
      <NavButton id="today" label="Today" active={active} go={go} />
      <NavButton id="map" label="My MAP" active={active} go={go} />
      <NavButton id="progress" label="Progress" active={active} go={go} />
      <NavButton id="more" label="More" active={active} go={go} />
      <WhyCard text={makeWhy(state)} updatedAt={state.why.updatedAt} compact />
    </aside>
  )
}

export function TabBar({ active, go }) {
  return (
    <nav className="tabbar">
      <NavButton id="today" label="Today" active={active} go={go} />
      <NavButton id="map" label="My MAP" active={active} go={go} />
      <NavButton id="progress" label="Progress" active={active} go={go} />
      <NavButton id="more" label="More" active={active} go={go} />
    </nav>
  )
}

export function NavButton({ id, label, active, go }) {
  return <button className={`nav-button ${active === id ? 'is-on' : ''}`} onClick={() => go(id)}>{label}</button>
}

export function ModeTop({ label, close }) {
  return (
    <header className="mode-top">
      <p className="eyebrow">{label}</p>
      <button onClick={close} aria-label="Close">Close</button>
    </header>
  )
}

export function TimerRing({ progress }) {
  const circumference = 326.7
  return (
    <div className="ring">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle className="ring-track" cx="60" cy="60" r="52" />
        <circle className="ring-bar" cx="60" cy="60" r="52" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)} />
      </svg>
    </div>
  )
}

export function Funnel({ dark = false, progress = 1 }) {
  const rows = ['Purpose Filter', 'Fulfilled Life', 'Smart M.A.P', 'Crystalizer']
  return (
    <div className={`funnel ${dark ? 'is-dark' : ''}`}>
      {rows.map((row, index) => (
        <div className={`funnel-row ${index < progress ? 'is-on' : ''}`} style={{ '--in': `${index * 5}%`, '--out': `${(index + 1) * 5}%` }} key={row}>
          {row}
        </div>
      ))}
    </div>
  )
}

export function Page({ eyebrow, title, sub, children }) {
  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </header>
      {children}
    </div>
  )
}

export function WhyCard({ text, updatedAt, compact = false, onEdit }) {
  return (
    <article className={`why-card ${compact ? 'is-compact' : ''}`}>
      <p className="eyebrow">My Why</p>
      <h3>{text}</h3>
      <div className="why-card-foot">
        <span>Updated {updatedAt}</span>
        {onEdit && <button className="why-edit" onClick={onEdit}>Edit</button>}
      </div>
    </article>
  )
}

export function QuoteNote({ text, source }) {
  return <blockquote className="quote-note"><p>{text}</p><cite>{source}</cite></blockquote>
}

export function Saved() {
  return <span className="saved">✓ Saved</span>
}

export function Stats({ state }) {
  const kept = state.challenge.markedDates.length
  return (
    <div className="stats">
      <div><b>{kept}<span>/66</span></b><small>Days In</small></div>
      <div><b>{bestStreak(state)}</b><small>Best Streak</small></div>
      <div><b>{state.challenge.completions}</b><small>Completions</small></div>
    </div>
  )
}
