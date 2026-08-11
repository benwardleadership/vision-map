import { useEffect, useRef, useState } from 'react'
import { ModeTop, QuoteNote, Saved, TimerRing } from './components.jsx'
import { formatTime, getHourPhases, labelArea, makeWhy } from './derived.js'
import { todayIso } from './state.js'

export const BIG5_COMMITMENTS = [
  ['I can achieve my definite purpose.', 'My purpose is not a wish. It is a written commitment I work with discipline.'],
  ['My dominating thoughts become my reality.', 'What I allow to live in my mind will show up in my actions.'],
  ['Auto-suggestion is powerful.', 'I speak the future I am willing to work into existence.'],
  ['My purpose is written and alive.', 'I keep it where I can see it and work it until it becomes normal.'],
  ['Lasting success is built on truth and justice.', 'I will build the life I was meant to live without cheating the grind.'],
]

export function ModeOverlay({ state, update, mode }) {
  const close = () => update((s) => { s.activeMode = null })
  if (mode === 'hour') return <HourMode state={state} update={update} close={close} />
  if (mode === 'visualize') return <VisualizeMode state={state} close={close} />
  if (mode === 'affirmations') return <AffirmationsMode state={state} update={update} close={close} />
  if (mode === 'journal') return <JournalMode state={state} update={update} close={close} />
  if (mode === 'carry') return <CarryMode state={state} update={update} close={close} />
  if (mode === 'big5') return <Big5Mode state={state} update={update} close={close} />
  if (mode === 'recite') return <ReciteBig5Mode state={state} close={close} />
  if (mode === 'onepage') return <OnePageMode state={state} close={close} />
  if (mode === 'review') return <WeeklyReviewMode state={state} update={update} close={close} />
  return null
}

function HourMode({ state, update, close }) {
  const phases = getHourPhases(state.profile.preset)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [remaining, setRemaining] = useState(phases[0].seconds)
  const [running, setRunning] = useState(true)
  const phase = phases[phaseIndex]
  const total = phase.seconds
  const progress = Math.max(0, Math.min(1, remaining / total))

  useEffect(() => {
    setRemaining(phases[phaseIndex].seconds)
    setRunning(true)
  }, [phaseIndex, state.profile.preset])

  useEffect(() => {
    if (!running) return undefined
    const id = window.setInterval(() => {
      setRemaining((current) => {
        if (current > 1) return current - 1
        if (phaseIndex < phases.length - 1) {
          setPhaseIndex((next) => next + 1)
          return phases[phaseIndex + 1].seconds
        }
        setRunning(false)
        update((s) => {
          if (!s.rituals.hourKeptDates.includes(todayIso())) s.rituals.hourKeptDates.push(todayIso())
          if (!s.challenge.markedDates.includes(todayIso())) s.challenge.markedDates.push(todayIso())
        })
        return 0
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [running, phaseIndex, phases, update])

  const done = remaining === 0 && phaseIndex === phases.length - 1

  return (
    <section className="mode mode-dark">
      <ModeTop label="Hour of Power" close={close} />
      {phase.key === 'visualize' && !done ? (
        <VisualizeStage state={state} compact />
      ) : (
        <div className="timer-stage">
          <TimerRing progress={progress} />
          <p className="timer-phase">{done ? 'Complete' : phase.name}</p>
          <h1>{done ? 'Hour kept.' : formatTime(remaining)}</h1>
          <p>{done ? 'Make it a great day.' : phase.description}</p>
        </div>
      )}
      <div className="phase-strip">
        {phases.map((item, index) => (
          <button key={item.name} className={index === phaseIndex ? 'is-on' : ''} onClick={() => setPhaseIndex(index)}>
            <b>{item.name}</b>
            <span>{Math.round(item.seconds / 60)} min</span>
          </button>
        ))}
      </div>
      <div className="mode-actions">
        <button className="btn btn-teal" onClick={() => setRunning((value) => !value)}>{running ? 'Pause' : 'Start'}</button>
        <button className="btn btn-ghost" onClick={() => {
          if (phaseIndex < phases.length - 1) setPhaseIndex((index) => index + 1)
          else setRemaining(0)
        }}>Skip phase</button>
        <button className="btn btn-ghost" onClick={() => setRemaining(phase.seconds)}>Reset</button>
      </div>
    </section>
  )
}

function VisualizeMode({ state, close }) {
  return (
    <section className="mode mode-dark">
      <ModeTop label="Visualize" close={close} />
      <VisualizeStage state={state} />
    </section>
  )
}

function VisualizeStage({ state, compact = false }) {
  const slides = [
    { type: 'why', title: 'My Why', body: makeWhy(state) },
    ...state.visionBoard.images.map((image, index) => ({ type: 'image', title: `Vision ${index + 1}`, body: image.caption })),
    ...state.affirmations.lines.slice(0, 3).map((line) => ({ type: 'affirmation', title: 'Affirmation', body: line })),
  ]
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => setIndex((current) => (current + 1) % slides.length), 4200)
    return () => window.clearInterval(id)
  }, [slides.length])

  const slide = slides[index]
  return (
    <div className={`visual-stage ${compact ? 'is-compact' : ''}`}>
      <div className={`visual-card visual-${slide.type}`}>
        <p className="eyebrow">{slide.title}</p>
        <h1>{slide.body}</h1>
      </div>
      <div className="dots">{slides.map((item, dot) => <i className={dot === index ? 'is-on' : ''} key={`${item.title}-${dot}`} />)}</div>
    </div>
  )
}

function AffirmationsMode({ state, update, close }) {
  const [readMode, setReadMode] = useState(true)
  const [index, setIndex] = useState(0)
  const lines = state.affirmations.lines

  return (
    <section className={`mode ${readMode ? 'mode-dark' : 'mode-light'}`}>
      <ModeTop label={readMode ? `Morning · ${index + 1} of ${lines.length}` : 'Affirmations'} close={close} />
      {readMode ? (
        <div className="read-card">
          <h1>{lines[index] || 'Speak your future into the present. Start with: I am...'}</h1>
          <div className="dots">{lines.map((line, dot) => <i className={dot === index ? 'is-on' : ''} key={line} />)}</div>
          <div className="mode-actions">
            <button className="btn btn-ghost" onClick={() => setIndex((value) => Math.max(0, value - 1))}>Back</button>
            <button className="btn btn-teal" onClick={() => {
              if (index < lines.length - 1) setIndex(index + 1)
              else update((s) => {
                if (!s.rituals.affirmationsReadDates.includes(todayIso())) s.rituals.affirmationsReadDates.push(todayIso())
                s.activeMode = null
              })
            }}>{index < lines.length - 1 ? 'Next' : 'Done'}</button>
            <button className="btn btn-ghost" onClick={() => setReadMode(false)}>Edit</button>
          </div>
        </div>
      ) : (
        <div className="editor-panel">
          <p className="section-tag">Directed Thought</p>
          <h1>Daily Affirmations</h1>
          <div className="example"><b>Ben's Example</b><p>I am calm, clear, and committed to the person I am becoming.</p></div>
          {lines.map((line, lineIndex) => (
            <textarea key={lineIndex} value={line} onChange={(event) => update((s) => { s.affirmations.lines[lineIndex] = event.target.value })} />
          ))}
          <button className="btn btn-navy" onClick={() => update((s) => { s.affirmations.lines.push('I am...') })}>Add a line</button>
        </div>
      )}
    </section>
  )
}

function JournalMode({ state, update, close }) {
  const entry = state.journal.find((item) => item.date === todayIso()) || { date: todayIso(), gratefulNow: '', gratefulAhead: '' }
  const saveEntry = (field, value) => update((s) => {
    let target = s.journal.find((item) => item.date === todayIso())
    if (!target) {
      target = { date: todayIso(), gratefulNow: '', gratefulAhead: '' }
      s.journal.unshift(target)
    }
    target[field] = value
    if (!s.rituals.journalDates.includes(todayIso())) s.rituals.journalDates.push(todayIso())
  })

  return (
    <section className="mode mode-light">
      <ModeTop label="Daily Journaling" close={close} />
      <div className="editor-panel">
        <p className="section-tag">Daily Journaling</p>
        <h1>Start with gratitude.</h1>
        <label>Today I'm grateful for...<textarea value={entry.gratefulNow} onChange={(event) => saveEntry('gratefulNow', event.target.value)} placeholder="Write it down." /></label>
        <label>...and what I'm grateful for that hasn't happened yet:<textarea value={entry.gratefulAhead} onChange={(event) => saveEntry('gratefulAhead', event.target.value)} placeholder="As if it already has..." /></label>
        <QuoteNote text="What the mind can believe and conceive, it can achieve." source="Napoleon Hill" />
        <Saved />
      </div>
    </section>
  )
}

function CarryMode({ state, update, close }) {
  const carrying = state.successStrings.find((item) => item.status === 'carrying') || state.successStrings[0]
  const [flipped, setFlipped] = useState(false)

  return (
    <section className="mode mode-dark">
      <ModeTop label="Success Strings" close={close} />
      <button className={`index-card ${flipped ? 'is-flipped' : ''}`} onClick={() => setFlipped((value) => !value)}>
        <p>{flipped ? carrying.source : carrying.text}</p>
        <span>{flipped ? 'Tap to return' : 'Tap to flip and recite'}</span>
      </button>
      <div className="mode-actions">
        <button className="btn btn-ghost" onClick={() => setFlipped(false)}>Again</button>
        <button className="btn btn-teal" onClick={() => update((s) => {
          const target = s.successStrings.find((item) => item.text === carrying.text)
          if (target) target.runs = (target.runs || 0) + 1
        })}>Got it</button>
        {(carrying.runs || 0) >= 4 && <button className="btn btn-ghost" onClick={() => update((s) => {
          const target = s.successStrings.find((item) => item.text === carrying.text)
          if (target) target.status = 'memorized'
          s.activeMode = null
        })}>Mark memorized</button>}
      </div>
      <p className="mode-foot">{carrying.runs || 0} in a row · Branded in? Mark it memorized.</p>
    </section>
  )
}

function Big5Mode({ state, update, close }) {
  const commitments = BIG5_COMMITMENTS

  if (state.big5.signedDate) {
    return (
      <section className="mode mode-light">
        <ModeTop label="The Big 5 · Signed" close={close} />
        <article className="certificate">
          <img src="/assets/tool-vision-map.png" alt="Vision MAP" />
          <p className="section-tag">My Commitment</p>
          <h1>The Big 5</h1>
          <div className="cert-list">
            {commitments.map(([title], index) => <p key={title}><b>{index + 1}</b>{title}</p>)}
          </div>
          {state.big5.signatureImage ? <img className="cert-signature" src={state.big5.signatureImage} alt="Signature" /> : <p className="script cert-script">{state.big5.name || state.profile.name}</p>}
          <p className="cert-name">{state.big5.name || state.profile.name} · {state.big5.signedDate}</p>
          <p className="cert-seal">Pluck the FUD®. Plant intentional thought. Become the person capable of living the life you were meant to live.</p>
        </article>
        <div className="mode-actions">
          <button className="btn btn-navy" onClick={() => window.print()}>Download</button>
          <button className="btn btn-ghost-light" onClick={() => update((s) => { s.activeMode = 'recite' })}>Recite</button>
        </div>
      </section>
    )
  }

  return (
    <section className="mode mode-dark">
      <ModeTop label="The Big 5" close={close} />
      <div className="big5-mode">
        <div className="big5-list">
          {commitments.map(([title, body], index) => (
            <article className="commit-card" key={title}>
              <b>{index + 1}</b>
              <div><h3>{title}</h3><p>{body}</p></div>
            </article>
          ))}
        </div>
        <div className="commit-box">
          <p className="eyebrow">My Commitment</p>
          <label>Name<input value={state.big5.name || state.profile.name} onChange={(event) => update((s) => { s.big5.name = event.target.value })} /></label>
          <SignaturePad onChange={(image) => update((s) => { s.big5.signatureImage = image })} />
          <button className="btn btn-yellow" onClick={() => update((s) => {
            s.big5.name = s.big5.name || s.profile.name
            s.big5.signedDate = todayIso()
            s.activeMode = null
          })}>Sign it</button>
        </div>
      </div>
    </section>
  )
}

function SignaturePad({ onChange }) {
  const canvasRef = useRef(null)
  const drawingRef = useRef(false)

  const point = (event) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const source = event.touches?.[0] || event
    return {
      x: (source.clientX - rect.left) * (canvas.width / rect.width),
      y: (source.clientY - rect.top) * (canvas.height / rect.height),
    }
  }

  const start = (event) => {
    event.preventDefault()
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    const p = point(event)
    drawingRef.current = true
    context.strokeStyle = '#FFFFFF'
    context.lineWidth = 3
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.beginPath()
    context.moveTo(p.x, p.y)
  }

  const move = (event) => {
    if (!drawingRef.current) return
    event.preventDefault()
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    const p = point(event)
    context.lineTo(p.x, p.y)
    context.stroke()
  }

  const end = () => {
    if (!drawingRef.current) return
    drawingRef.current = false
    onChange(canvasRef.current.toDataURL('image/png'))
  }

  const clear = () => {
    const canvas = canvasRef.current
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    onChange('')
  }

  return (
    <div className="sig-pad">
      <canvas
        ref={canvasRef}
        width="620"
        height="180"
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={end}
      />
      <span>Sign with your finger</span>
      <button type="button" onClick={clear}>Clear</button>
    </div>
  )
}

function ReciteBig5Mode({ state, close }) {
  const [index, setIndex] = useState(0)
  const [title, body] = BIG5_COMMITMENTS[index]
  const last = index === BIG5_COMMITMENTS.length - 1

  return (
    <section className="mode mode-dark">
      <ModeTop label={`Recite · ${index + 1} of ${BIG5_COMMITMENTS.length}`} close={close} />
      <div className="recite-stage">
        <b className="recite-number">{index + 1}</b>
        <h1>{title}</h1>
        <p>{body}</p>
        <div className="dots">{BIG5_COMMITMENTS.map(([label], dot) => <i className={dot === index ? 'is-on' : ''} key={label} />)}</div>
      </div>
      <div className="mode-actions">
        <button className="btn btn-ghost" onClick={() => setIndex((value) => Math.max(0, value - 1))}>Back</button>
        {last
          ? <button className="btn btn-teal" onClick={close}>Done</button>
          : <button className="btn btn-teal" onClick={() => setIndex((value) => value + 1)}>Next</button>}
      </div>
      <p className="mode-foot">{state.big5.name || state.profile.name} · Read it daily until it becomes who you are.</p>
    </section>
  )
}

function OnePageMode({ state, close }) {
  const areas = Object.entries(state.objectives.areas)
  return (
    <section className="mode mode-light">
      <ModeTop label="One-Page MAP" close={close} />
      <article className="one-page">
        <header>
          <img src="/assets/tool-vision-map.png" alt="Vision MAP" />
          <h1>{makeWhy(state)}</h1>
        </header>
        <section>
          <h2>Core Values</h2>
          <div className="chips">{state.values.core.map((value) => <span key={value}>{value}</span>)}</div>
        </section>
        <section>
          <h2>Theme</h2>
          <p>{state.objectives.theme}</p>
        </section>
        <section className="one-areas">
          {areas.map(([key, value]) => <div key={key}><b>{labelArea(key)}</b><p>{value}</p></div>)}
        </section>
        <section>
          <h2>Top Affirmations</h2>
          {state.affirmations.lines.slice(0, 3).map((line) => <p key={line}>{line}</p>)}
        </section>
        <footer>{state.big5.name || state.profile.name} · Vision MAP™</footer>
      </article>
      <div className="mode-actions">
        <button className="btn btn-navy" onClick={() => window.print()}>Print</button>
      </div>
    </section>
  )
}

function WeeklyReviewMode({ state, update, close }) {
  const areaKeys = ['higherPower', 'family', 'health', 'personal', 'education', 'financial']
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState({
    areaStatus: Object.fromEntries(areaKeys.map((key) => [key, 'on-track'])),
    adjustment: '',
    oneAction: state.weeklyReviews[0]?.oneAction || '',
  })

  const save = () => update((s) => {
    s.weeklyReviews.unshift({
      date: todayIso(),
      areaStatus: draft.areaStatus,
      adjustment: draft.adjustment,
      oneAction: draft.oneAction,
    })
    s.activeMode = null
  })

  return (
    <section className={`mode ${step === 4 ? 'mode-dark' : 'mode-light'}`}>
      <ModeTop label={`Weekly Review · ${Math.min(step + 1, 5)} of 5`} close={close} />
      {step === 0 && (
        <div className="review-panel">
          <p className="section-tag">Read Why + Theme</p>
          <h1>{makeWhy(state)}</h1>
          <div className="theme-read"><span>Theme for the Year</span><b>{state.objectives.theme}</b></div>
        </div>
      )}
      {step === 1 && (
        <div className="review-panel">
          <p className="section-tag">Walk the six areas</p>
          <h1>Review your objectives.</h1>
          <div className="review-areas">
            {areaKeys.map((key) => (
              <div className="review-area" key={key}>
                <b>{labelArea(key)}</b>
                <p>{state.objectives.areas[key]}</p>
                <div className="seg-control">
                  {['on-track', 'needs-attention'].map((value) => (
                    <button className={draft.areaStatus[key] === value ? 'is-on' : ''} key={value} onClick={() => setDraft((current) => ({
                      ...current,
                      areaStatus: { ...current.areaStatus, [key]: value },
                    }))}>{value === 'on-track' ? 'On track' : 'Needs attention'}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="review-panel">
          <p className="section-tag">One adjustment</p>
          <h1>What needs to change this week?</h1>
          <textarea value={draft.adjustment} onChange={(event) => setDraft((current) => ({ ...current, adjustment: event.target.value }))} placeholder="One adjustment. Keep it clear." />
        </div>
      )}
      {step === 3 && (
        <div className="review-panel">
          <p className="section-tag">One action</p>
          <h1>Pick this week's one action.</h1>
          <textarea value={draft.oneAction} onChange={(event) => setDraft((current) => ({ ...current, oneAction: event.target.value }))} placeholder="This feeds Today." />
        </div>
      )}
      {step === 4 && (
        <div className="review-close">
          <h1>Reviewed.</h1>
          <p>Make it a great week.</p>
          <div className="summary-chips">
            <span>{Object.values(draft.areaStatus).filter((value) => value === 'on-track').length} on track</span>
            <span>{Object.values(draft.areaStatus).filter((value) => value === 'needs-attention').length} need attention</span>
          </div>
          <p>{draft.oneAction}</p>
        </div>
      )}
      <div className="mode-actions">
        {step > 0 && <button className="btn btn-ghost-light" onClick={() => setStep((value) => value - 1)}>Back</button>}
        {step < 4 ? <button className="btn btn-navy" onClick={() => setStep((value) => value + 1)}>Next</button> : <button className="btn btn-teal" onClick={save}>Done</button>}
      </div>
    </section>
  )
}
