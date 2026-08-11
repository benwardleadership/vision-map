import { useState } from 'react'
import { Funnel, Saved, WhyCard } from '../components.jsx'
import { makeWhy } from '../derived.js'
import { importStateFile, todayIso } from '../state.js'

export default function Onboarding({ state, update, setState }) {
  const [step, setStep] = useState(0)
  const whyText = makeWhy(state)

  return (
    <section className={`onboarding ${step === 3 ? 'is-light' : ''}`}>
      {step > 0 && (
        <button className="onboard-back" onClick={() => setStep((value) => value - 1)} aria-label="Go back">← Back</button>
      )}
      {step === 0 && (
        <div className="moment">
          <img className="lockup" src="/assets/vision-map-onnavy.png" alt="Vision MAP" />
          <h1>You're holding the tool that changed my life.</h1>
          <p>The Massive Action Plan, a tool for designing your life on purpose.</p>
          <div className="button-row">
            <button className="btn btn-teal" onClick={() => setStep(1)}>Begin</button>
            <ImportSession setState={setState} />
          </div>
        </div>
      )}
      {step === 1 && (
        <div className="moment">
          <p className="eyebrow">The Decision</p>
          <h1>Are you committed to a better life, or just dabbling with the idea?</h1>
          <p>There's a difference, and your life will show which one you chose.</p>
          <div className="button-row">
            <button className="btn btn-yellow" onClick={() => {
              update((s) => {
                s.profile.commitment = 'committed'
                s.profile.commitmentDate = todayIso()
              })
              setStep(2)
            }}>I'm committed</button>
            <button className="btn btn-ghost" onClick={() => {
              update((s) => {
                s.profile.commitment = 'looking'
                s.profile.commitmentDate = todayIso()
              })
              setStep(2)
            }}>Just dabbling</button>
          </div>
          {state.profile.commitment === 'looking' && <p className="ben-line">Fair. Look around. This only works if you work it.</p>}
        </div>
      )}
      {step === 2 && (
        <div className="moment">
          <p className="eyebrow">The Path</p>
          <Funnel dark />
          <h1>Four phases. One MAP.</h1>
          <p>We start with your Why.</p>
          <button className="btn btn-teal" onClick={() => setStep(3)}>Write my Why</button>
        </div>
      )}
      {step === 3 && (
        <div className="worksheet">
          <div className="worksheet-head">
            <p className="section-tag">Section 1 · Purpose</p>
            <Saved />
          </div>
          <h1>Your Why</h1>
          <p className="lead">Leave out your job and title. They're too small to hold your Why.</p>
          <div className="example">
            <b>Ben's Example</b>
            <p>My Why is to help people lead themselves first, so that they can build the life they were meant to live.</p>
          </div>
          <p className="activity">Activity · Build the sentence</p>
          <div className="sentence-builder">
            <span>My Why is to</span>
            <input value={state.why.contribution} onChange={(event) => update((s) => {
              s.why.contribution = event.target.value
              s.why.updatedAt = todayIso()
            })} />
            <span>so that</span>
            <input value={state.why.impact} onChange={(event) => update((s) => {
              s.why.impact = event.target.value
              s.why.updatedAt = todayIso()
            })} />
          </div>
          <WhyCard text={whyText} updatedAt={state.why.updatedAt} />
          <div className="preset-line">
            {[60, 30, 15].map((preset) => (
              <button key={preset} className={`preset ${state.profile.preset === preset ? 'is-on' : ''}`} onClick={() => update((s) => { s.profile.preset = preset })}>{preset}</button>
            ))}
          </div>
          <button className="btn btn-navy" onClick={() => update((s) => { s.onboarded = true })}>Save my Why</button>
        </div>
      )}
    </section>
  )
}

// Manual restore path, for students moving from a device where they worked
// offline. Sync handles this automatically inside Sellership University, so
// this stays as the escape hatch rather than the main route.
function ImportSession({ setState }) {
  const [error, setError] = useState('')

  const choose = (file) => {
    if (!file) return
    setError('')
    importStateFile(file)
      .then((nextState) => setState({ ...nextState, onboarded: true }))
      .catch((err) => setError(err.message || 'Could not read that file.'))
  }

  return (
    <>
      <label className="btn btn-ghost import-button">
        Import session from other device
        <input type="file" accept="application/json,.json" onChange={(event) => choose(event.target.files?.[0])} />
      </label>
      {error && <p className="import-error">{error}</p>}
    </>
  )
}
