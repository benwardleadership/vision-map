import { useState } from 'react'
import { Funnel, Page, Saved, WhyCard } from '../components.jsx'
import { completedCount, makeWhy, mapGroups } from '../derived.js'
import { todayIso } from '../state.js'

export default function MyMap({ state, update }) {
  const groups = mapGroups(state)
  return (
    <Page eyebrow="My MAP" title="The living document." sub="Your Why stays visible. The funnel fills top to bottom as the work becomes real.">
      <div className="map-grid">
        <section className="stack">
          <WhyCard text={makeWhy(state)} updatedAt={state.why.updatedAt} onEdit={() => document.getElementById('why-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} />
          <Funnel progress={completedCount(groups)} />
          <button className="btn btn-navy" onClick={() => update((s) => { s.activeMode = 'onepage' })}>View my One-Page MAP</button>
        </section>
        <section className="phase-list">
          {groups.map((group, index) => <PhaseGroup key={group.name} group={group} index={index} />)}
        </section>
      </div>
      <WhyPurpose state={state} update={update} />
      <CoreValues state={state} update={update} />
      <FulfilledLife state={state} update={update} />
      <Identity state={state} update={update} />
      <VisionBoard state={state} update={update} />
      <YearlyObjectives state={state} update={update} />
      <DailyRituals state={state} update={update} />
      <SharpenTheSaw state={state} update={update} />
      <Big5Preview state={state} update={update} />
    </Page>
  )
}

function PhaseGroup({ group, index }) {
  return (
    <article className="phase card">
      <div className="phase-head">
        <i style={{ background: ['#1DC0DC', '#4FD0E4', '#9FE6F1', '#DEF6FB'][index] }} />
        <b>{group.name}</b>
        <span>{group.done} of {group.items.length}</span>
      </div>
      {group.items.map((item) => (
        <div className="exercise-row" key={item.name}>
          <span className={`state-dot ${item.done ? 'is-done' : ''}`}>{item.done ? '✓' : ''}</span>
          <b>{item.name}</b>
          <small>{item.done ? `Updated ${item.updatedAt}` : 'Next · 10 min'}</small>
        </div>
      ))}
    </article>
  )
}

function WhyPurpose({ state, update }) {
  return (
    <section className="worksheet inline-work" id="why-editor">
      <div className="worksheet-head">
        <p className="section-tag">Section 1 · Purpose</p>
        <Saved />
      </div>
      <h2>Your Why</h2>
      <p className="lead">Leave out your job and title. They're too small to hold your Why. Tap a box below and type to edit it anytime.</p>
      <label className="field-block">
        <span>My Why is to…</span>
        <input value={state.why.contribution} placeholder="your contribution (e.g. build leaders who sell with purpose)" onChange={(event) => update((s) => {
          s.why.contribution = event.target.value
          s.why.updatedAt = todayIso()
        })} />
      </label>
      <label className="field-block">
        <span>…so that</span>
        <input value={state.why.impact} placeholder="the impact (e.g. families and teams are stronger)" onChange={(event) => update((s) => {
          s.why.impact = event.target.value
          s.why.updatedAt = todayIso()
        })} />
      </label>
      <WhyCard text={makeWhy(state)} updatedAt={state.why.updatedAt} />
      <div className="commit-block">
        <p className="field-label">My commitment</p>
        <div className="seg-control">
          {[['committed', "I'm committed"], ['looking', 'Just dabbling']].map(([value, label]) => (
            <button key={value} className={state.profile.commitment === value ? 'is-on' : ''} onClick={() => update((s) => {
              s.profile.commitment = value
              s.profile.commitmentDate = todayIso()
            })}>{label}</button>
          ))}
        </div>
      </div>
    </section>
  )
}

function CoreValues({ state }) {
  return (
    <section className="worksheet inline-work">
      <div className="worksheet-head">
        <p className="section-tag">Section 1 · Purpose</p>
        <Saved />
      </div>
      <h2>Your Core Values</h2>
      <p className="lead">Narrow to 3-5. If everything is core, nothing is.</p>
      <div className="two-pane">
        <div className="pane">
          <b>Brainstorm Everything</b>
          <div className="chips">
            {state.values.brainstorm.map((value) => <span key={value}>{value}</span>)}
          </div>
        </div>
        <div className="pane pane-dark">
          <b>The Few I'd Never Compromise</b>
          <div className="chips">
            {state.values.core.map((value) => <span key={value}>{value}</span>)}
          </div>
        </div>
      </div>
    </section>
  )
}

function FulfilledLife({ state, update }) {
  const lines = state.fulfilledLife.lines
  const setLine = (index, value) => update((s) => {
    s.fulfilledLife.lines[index] = value
    s.fulfilledLife.updatedAt = todayIso()
  })
  return (
    <section className="worksheet inline-work">
      <div className="worksheet-head">
        <p className="section-tag">Section 2 · Fulfilled Life</p>
        <Saved />
      </div>
      <h2>What a Fulfilled Life Means</h2>
      <p className="lead">Be honest, not impressive. List up to ten things that would make your life feel full.</p>
      <div className="line-list">
        {lines.map((line, index) => (
          <div className="line-row" key={index}>
            <b>{index + 1}</b>
            <input value={line} placeholder="Write one honest line." onChange={(event) => setLine(index, event.target.value)} />
            <button type="button" className="line-remove" aria-label="Remove line" onClick={() => update((s) => {
              s.fulfilledLife.lines.splice(index, 1)
              s.fulfilledLife.updatedAt = todayIso()
            })}>×</button>
          </div>
        ))}
      </div>
      {lines.length < 10 && (
        <button className="btn btn-ghost-light" onClick={() => update((s) => {
          s.fulfilledLife.lines.push('')
          s.fulfilledLife.updatedAt = todayIso()
        })}>Add a line</button>
      )}
    </section>
  )
}

function Identity({ state, update }) {
  const addTo = (field, value) => update((s) => {
    s.identity[field].push(value)
    s.identity.updatedAt = todayIso()
  })
  const removeFrom = (field, index) => update((s) => {
    s.identity[field].splice(index, 1)
    s.identity.updatedAt = todayIso()
  })
  return (
    <section className="worksheet inline-work">
      <div className="worksheet-head">
        <p className="section-tag">Section 2 · Fulfilled Life</p>
        <Saved />
      </div>
      <h2>I Know Who I Am</h2>
      <p className="lead">Name your strengths and your growth edges without flinching. Then the things you love.</p>
      <div className="two-pane">
        <ChipPane label="My Strengths" items={state.identity.strengths} onAdd={(value) => addTo('strengths', value)} onRemove={(index) => removeFrom('strengths', index)} placeholder="Add a strength" />
        <ChipPane label="My Growth Edges" items={state.identity.growthEdges} onAdd={(value) => addTo('growthEdges', value)} onRemove={(index) => removeFrom('growthEdges', index)} placeholder="Add a growth edge" />
      </div>
      <div className="pane pane-wide">
        <b>My Passions</b>
        <ChipList items={state.identity.passions} onAdd={(value) => addTo('passions', value)} onRemove={(index) => removeFrom('passions', index)} placeholder="What do you love?" />
      </div>
    </section>
  )
}

function VisionBoard({ state, update }) {
  const addImage = (file) => {
    if (!file) return
    fileToDataUrl(file).then((src) => update((s) => {
      s.visionBoard.images.push({ src, caption: 'A new picture of my dream life.' })
    }))
  }

  return (
    <section className="worksheet inline-work">
      <div className="worksheet-head">
        <p className="section-tag">Section 2 · Fulfilled Life</p>
        <button className="btn btn-navy" onClick={() => update((s) => { s.activeMode = 'visualize' })}>Visualize</button>
      </div>
      <h2>Vision Board</h2>
      <p className="lead">What you think about, you bring about. Add the first picture of your dream life.</p>
      <div className="vision-grid">
        {state.visionBoard.images.map((image, index) => (
          <figure className="vision-tile" key={index}>
            {image.src ? <img className="vision-photo" src={image.src} alt="" /> : <div className="vision-art" />}
            <textarea value={image.caption} onChange={(event) => update((s) => { s.visionBoard.images[index].caption = event.target.value })} />
          </figure>
        ))}
        <label className="vision-add">+ Add a picture<input type="file" accept="image/*" onChange={(event) => addImage(event.target.files?.[0])} /></label>
      </div>
    </section>
  )
}

function YearlyObjectives({ state, update }) {
  const areaLabels = [
    ['higherPower', 'Higher Power'],
    ['family', 'Family'],
    ['health', 'Health'],
    ['personal', 'Personal'],
    ['education', 'Education'],
    ['financial', 'Financial'],
  ]

  return (
    <section className="worksheet inline-work">
      <div className="worksheet-head">
        <p className="section-tag">Section 3 · Smart M.A.P</p>
        <Saved />
      </div>
      <h2>Your Yearly Objectives</h2>
      <p className="lead">Don't wait for January, start today.</p>
      <div className="theme-bar">
        <p>Theme for the Year</p>
        <input value={state.objectives.theme} onChange={(event) => update((s) => {
          s.objectives.theme = event.target.value
          s.objectives.updatedAt = todayIso()
        })} />
      </div>
      <div className="areas-grid">
        {areaLabels.map(([key, label]) => (
          <label className="area-card-edit" key={key}>
            <span>{label}</span>
            <textarea value={state.objectives.areas[key]} onChange={(event) => update((s) => {
              s.objectives.areas[key] = event.target.value
              s.objectives.updatedAt = todayIso()
            })} />
          </label>
        ))}
      </div>
    </section>
  )
}

function DailyRituals({ state, update }) {
  const chain = ['Thought', 'Action', 'Routine', 'Habit', 'Ritual']
  const addTo = (field, value) => update((s) => {
    s.dailyRituals[field].push(value)
    s.dailyRituals.updatedAt = todayIso()
  })
  const removeFrom = (field, index) => update((s) => {
    s.dailyRituals[field].splice(index, 1)
    s.dailyRituals.updatedAt = todayIso()
  })
  return (
    <section className="worksheet inline-work">
      <div className="worksheet-head">
        <p className="section-tag">Section 3 · Smart M.A.P</p>
        <Saved />
      </div>
      <h2>Daily Rituals</h2>
      <p className="lead">A thought repeated becomes an action. An action repeated becomes a ritual. Choose the ones worth building.</p>
      <div className="ritual-chain">
        {chain.map((link, index) => (
          <div className="chain-link" key={link}>
            <span className={index === chain.length - 1 ? 'is-ritual' : ''}>{link}</span>
            {index < chain.length - 1 && <i aria-hidden="true">→</i>}
          </div>
        ))}
      </div>
      <div className="two-pane">
        <ChipPane label="Habits That Don't Serve Me" items={state.dailyRituals.habitsToDrop} onAdd={(value) => addTo('habitsToDrop', value)} onRemove={(index) => removeFrom('habitsToDrop', index)} placeholder="Name one to drop" />
        <ChipPane label="Rituals I Want To Build" items={state.dailyRituals.ritualsToBuild} onAdd={(value) => addTo('ritualsToBuild', value)} onRemove={(index) => removeFrom('ritualsToBuild', index)} placeholder="Name one to build" dark />
      </div>
    </section>
  )
}

function SharpenTheSaw({ state, update }) {
  const set = (field, value) => update((s) => {
    s.sharpenTheSaw[field] = value
    s.sharpenTheSaw.updatedAt = todayIso()
  })
  return (
    <section className="worksheet inline-work">
      <div className="worksheet-head">
        <p className="section-tag">Section 3 · Smart M.A.P</p>
        <Saved />
      </div>
      <h2>Sharpen the Saw</h2>
      <p className="lead">Grow on purpose. Decide what to learn, why it matters, and the one action that starts this week.</p>
      <label className="field-block">
        <span>What I want to learn</span>
        <textarea value={state.sharpenTheSaw.learn} onChange={(event) => set('learn', event.target.value)} placeholder="The skill, study, or discipline to grow." />
      </label>
      <label className="field-block">
        <span>Why it matters</span>
        <textarea value={state.sharpenTheSaw.why} onChange={(event) => set('why', event.target.value)} placeholder="Tie it to the person you are becoming." />
      </label>
      <div className="theme-bar action-bar">
        <p>My One Action This Week</p>
        <input value={state.sharpenTheSaw.oneAction} onChange={(event) => set('oneAction', event.target.value)} placeholder="One action. It shows up on Today." />
      </div>
    </section>
  )
}

function Big5Preview({ state, update }) {
  return (
    <section className="big5-preview">
      <div>
        <p className="eyebrow">Ceremony</p>
        <h2>The Big 5</h2>
        <p>{state.big5.signedDate ? 'Now let it get branded into your brain. Read it daily.' : 'Five commitments. One signature. This is where the MAP becomes a promise.'}</p>
      </div>
      <button className="btn btn-yellow" onClick={() => update((s) => { s.activeMode = 'big5' })}>{state.big5.signedDate ? 'Recite' : 'Sign it'}</button>
    </section>
  )
}

function ChipPane({ label, items, onAdd, onRemove, placeholder, dark = false }) {
  return (
    <div className={`pane ${dark ? 'pane-dark' : ''}`}>
      <b>{label}</b>
      <ChipList items={items} onAdd={onAdd} onRemove={onRemove} placeholder={placeholder} />
    </div>
  )
}

function ChipList({ items, onAdd, onRemove, placeholder }) {
  const [draft, setDraft] = useState('')
  const commit = () => {
    const value = draft.trim()
    if (!value) return
    onAdd(value)
    setDraft('')
  }
  return (
    <div className="chip-edit">
      <div className="chips">
        {items.map((item, index) => (
          <span className="chip-removable" key={`${item}-${index}`}>
            {item}
            <button type="button" aria-label={`Remove ${item}`} onClick={() => onRemove(index)}>×</button>
          </span>
        ))}
      </div>
      <div className="chip-add">
        <input
          value={draft}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              commit()
            }
          }}
        />
        <button type="button" className="btn btn-ghost-light" onClick={commit}>Add</button>
      </div>
    </div>
  )
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
