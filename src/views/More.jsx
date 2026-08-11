import { Page, Saved } from '../components.jsx'
import { exportState, importStateFile, todayIso } from '../state.js'

export default function More({ state, update, sync }) {
  return (
    <Page eyebrow="More" title="Settings and output." sub="Your MAP saves as you work.">
      <div className="more-grid">
        <SyncPanel sync={sync} />
        <section className="card settings">
          <label>Name<input value={state.profile.name} onChange={(event) => update((s) => { s.profile.name = event.target.value })} /></label>
          <label>Morning<input value={state.profile.morningReminder} onChange={(event) => update((s) => { s.profile.morningReminder = event.target.value })} /></label>
          <label>Evening<input value={state.profile.eveningReminder} onChange={(event) => update((s) => { s.profile.eveningReminder = event.target.value })} /></label>
          <label>Sunday<input value={state.profile.sundayReminder} onChange={(event) => update((s) => { s.profile.sundayReminder = event.target.value })} /></label>
          <Saved />
          <hr />
          <div className="button-row align-left">
            <button className="btn btn-navy" onClick={() => exportState(state)}>Export data</button>
            <label className="btn btn-ghost-light import-button">Import data<input type="file" accept="application/json,.json" onChange={(event) => {
              const file = event.target.files?.[0]
              if (!file) return
              importStateFile(file)
                .then((nextState) => update((s) => Object.assign(s, nextState)))
                .catch((error) => update((s) => { s.account.syncMessage = error.message }))
            }} /></label>
            <button className="btn btn-ghost-light" onClick={() => update((s) => {
              s.challenge.startDate = todayIso()
              s.challenge.markedDates = []
              s.challenge.completions += 1
            })}>Log Completion &amp; Start Next Round</button>
          </div>
        </section>
        <section className="university card">
          <img src="/assets/s-mark.png" alt="" />
          <p className="eyebrow">Sellership University</p>
          <h2>The workbook gave you the map. Sellership University gives you the system to build the life you just designed.</h2>
          <a className="btn btn-navy" href="https://sellershipuniversity.com">sellershipuniversity.com</a>
        </section>
      </div>
    </Page>
  )
}

// Sync status. Inside Sellership University the MAP saves to the student's
// account automatically. Opened standalone, it stays on the device and the
// export file is the way to move it.
function SyncPanel({ sync }) {
  if (!sync?.isEmbedded) {
    return (
      <section className="card account-card">
        <div className="card-head">
          <div>
            <p className="eyebrow">Your data</p>
            <h2>Saved on this device.</h2>
          </div>
          <span className="sync-pill is-local">This device</span>
        </div>
        <p>Open Vision MAP from inside Sellership University to have your MAP saved to your account and available on any device you sign in from.</p>
        <p className="sync-note">Working here is fine too. Use Export data below to move it or keep a backup.</p>
      </section>
    )
  }

  const copy = {
    syncing: { pill: 'Saving', head: 'Saving to your account.', note: 'Keep working. This finishes on its own.' },
    synced: { pill: 'Saved', head: 'Saved to your account.', note: 'Your MAP is on every device you open Sellership University from.' },
    pending: { pill: 'Will retry', head: 'Saved on this device.', note: 'We could not reach your account just now. Nothing is lost. Reopen the lesson in Sellership University and it uploads automatically.' },
  }[sync.status] || { pill: 'Saved', head: 'Saved to your account.', note: '' }

  return (
    <section className="card account-card">
      <div className="card-head">
        <div>
          <p className="eyebrow">Your data</p>
          <h2>{copy.head}</h2>
        </div>
        <span className={`sync-pill is-${sync.status === 'pending' ? 'error' : 'connected'}`}>{copy.pill}</span>
      </div>
      {sync.wpUser?.email && <p>{sync.wpUser.email}</p>}
      <p className="sync-note">{copy.note}</p>
    </section>
  )
}

