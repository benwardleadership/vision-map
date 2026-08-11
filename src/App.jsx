import { useEffect, useMemo, useRef, useState } from 'react'
import { Rail, TabBar } from './components.jsx'
import { ModeOverlay } from './modes.jsx'
import { loadState, saveState } from './state.js'
import {
  applyWpIdentity,
  getWpUser,
  hasPendingChanges,
  loadRemoteState,
  mergeStates,
  saveRemoteState,
} from './sync/wpSync.js'
import More from './views/More.jsx'
import Onboarding from './views/Onboarding.jsx'
import MyMap from './views/MyMap.jsx'
import Progress from './views/Progress.jsx'
import Today from './views/Today.jsx'

function App() {
  const wpUser = useMemo(getWpUser, [])
  // Identity is applied synchronously here rather than in an effect. Effects can
  // run twice (StrictMode) or be torn down mid flight, and a student should never
  // see the sample name flash before their own.
  const [state, setState] = useState(() => applyWpIdentity(loadState(), wpUser))
  // syncing | synced | pending | local
  const [syncStatus, setSyncStatus] = useState(wpUser ? 'syncing' : 'local')
  const firstSave = useRef(true)

  const update = (recipe) =>
    setState((current) => {
      const next = structuredClone(current)
      recipe(next)
      return next
    })

  // Local autosave. Always on, never waits for the network, so a student can
  // work through a whole session with no connection and lose nothing.
  useEffect(() => {
    saveState(state)
  }, [state])

  // Pull whatever is stored server side and merge it over this device. The GET
  // is idempotent, so a repeated run under StrictMode is harmless.
  useEffect(() => {
    if (!wpUser) return undefined
    let cancelled = false

    ;(async () => {
      const remote = await loadRemoteState()
      if (cancelled) return
      if (remote) {
        setState((local) => applyWpIdentity(mergeStates(local, remote), wpUser))
      }
      setSyncStatus(hasPendingChanges() ? 'pending' : 'synced')
    })()

    return () => {
      cancelled = true
    }
  }, [wpUser])

  // Debounced push to WordPress. Skips the very first run so opening the app
  // does not immediately write back what we just read.
  useEffect(() => {
    if (!wpUser) return undefined
    if (firstSave.current) {
      firstSave.current = false
      return undefined
    }
    const id = window.setTimeout(async () => {
      setSyncStatus('syncing')
      const result = await saveRemoteState(state)
      setSyncStatus(result.ok ? 'synced' : 'pending')
    }, 1200)
    return () => window.clearTimeout(id)
  }, [state, wpUser])

  const sync = { status: syncStatus, wpUser, isEmbedded: Boolean(wpUser) }
  const go = (view) => update((s) => { s.activeView = view })

  if (!state.onboarded) {
    return <Onboarding state={state} update={update} setState={setState} />
  }

  return (
    <div className="app-shell">
      <Rail active={state.activeView} state={state} go={go} />
      <main className="main">
        {state.activeView === 'today' && <Today state={state} update={update} />}
        {state.activeView === 'map' && <MyMap state={state} update={update} />}
        {state.activeView === 'progress' && <Progress state={state} update={update} />}
        {state.activeView === 'more' && <More state={state} update={update} sync={sync} />}
      </main>
      <TabBar active={state.activeView} go={go} />
      {state.activeMode && <ModeOverlay state={state} update={update} mode={state.activeMode} />}
    </div>
  )
}

export default App
