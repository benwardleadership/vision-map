import { normalizeState } from '../state.js'

// WordPress sync layer.
//
// Design rules, in priority order:
//   1. Local storage is always the source of truth for the current device.
//      Nothing here can ever block typing or lose a keystroke.
//   2. The network is best effort. If it fails, changes queue and flush later.
//   3. The token comes from WordPress via ?token= on the iframe URL. It is
//      short lived, and WordPress mints a fresh one on every lesson page load,
//      so an expired token is a normal condition, not an error state.

// Where the WordPress plugin lives. This is the WordPress host, which is not the
// same as the host the app itself is served from. Override per environment with
// VITE_WP_API_BASE (set it in Vercel project settings) rather than editing here.
const API_BASE =
  import.meta.env.VITE_WP_API_BASE || 'https://university.benward.com/wp-json/visionmap/v1'

const TOKEN_KEY = 'vision-map-wp-token'
const PENDING_KEY = 'vision-map-pending-sync'

// ---------------------------------------------------------------- token

// Decode a JWT payload without verifying it. Verification happens server side
// in the WordPress plugin. Client side we only read it to know who we are and
// whether it is worth attempting a request.
function decodePayload(token) {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

// Read the token from the URL if WordPress just handed us one, otherwise fall
// back to the last one we stored. Storing it lets a refresh inside the iframe
// keep working without a new page load from the parent.
export function readToken() {
  let token = null
  try {
    token = new URLSearchParams(window.location.search).get('token')
  } catch {
    token = null
  }
  if (token) {
    try {
      window.localStorage.setItem(TOKEN_KEY, token)
    } catch {
      // storage may be unavailable; the in-memory token still works this session
    }
    return token
  }
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function tokenIsFresh(token) {
  const payload = decodePayload(token)
  if (!payload || !payload.exp) return false
  // 30s of slack so we do not fire a request that expires in flight.
  return payload.exp * 1000 > Date.now() + 30000
}

// The WordPress identity for this session, or null when running standalone.
export function getWpUser() {
  const token = readToken()
  if (!token) return null
  const payload = decodePayload(token)
  if (!payload || !payload.user_id) return null
  return {
    id: payload.user_id,
    email: payload.email || '',
    firstName: payload.first_name || '',
    fullName: payload.full_name || '',
    expiresAt: payload.exp ? payload.exp * 1000 : 0,
  }
}

export const isWpEmbedded = () => Boolean(getWpUser())

// ---------------------------------------------------------------- pending queue

// When a save cannot go out (expired token, offline, server down) we mark the
// state dirty. The next successful sync sends whatever is current, so we only
// need a flag rather than a queue of diffs.
function markPending(isPending) {
  try {
    if (isPending) window.localStorage.setItem(PENDING_KEY, '1')
    else window.localStorage.removeItem(PENDING_KEY)
  } catch {
    // ignore
  }
}

export function hasPendingChanges() {
  try {
    return window.localStorage.getItem(PENDING_KEY) === '1'
  } catch {
    return false
  }
}

// ---------------------------------------------------------------- transport

async function request(method, body) {
  const token = readToken()
  if (!token) return { ok: false, reason: 'no-token' }
  if (!tokenIsFresh(token)) return { ok: false, reason: 'token-expired' }

  try {
    const response = await fetch(`${API_BASE}/state`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
    if (!response.ok) {
      return { ok: false, reason: `http-${response.status}` }
    }
    const data = await response.json()
    return { ok: true, data }
  } catch (error) {
    return { ok: false, reason: error.message || 'network-error' }
  }
}

// ---------------------------------------------------------------- public API

// Pull the saved MAP for this WordPress user. Returns null when there is
// nothing stored yet or the request could not be made.
export async function loadRemoteState() {
  const result = await request('GET')
  if (!result.ok) return null
  const doc = result.data && result.data.state
  if (!doc || typeof doc !== 'object' || Object.keys(doc).length === 0) return null
  return normalizeState(doc)
}

export async function saveRemoteState(state) {
  const result = await request('POST', { state })
  markPending(!result.ok)
  return result
}

// ---------------------------------------------------------------- merge

const uniqueSorted = (a = [], b = []) => Array.from(new Set([...a, ...b])).sort()

// Remote wins for authored content, but every date-tracking array is unioned so
// a day marked on a phone is never lost by opening the tool on a laptop.
export function mergeStates(local, remote) {
  if (!remote) return local
  if (!local) return remote
  return normalizeState({
    ...remote,
    challenge: {
      ...remote.challenge,
      markedDates: uniqueSorted(local.challenge?.markedDates, remote.challenge?.markedDates),
    },
    rituals: {
      hourKeptDates: uniqueSorted(local.rituals?.hourKeptDates, remote.rituals?.hourKeptDates),
      affirmationsReadDates: uniqueSorted(
        local.rituals?.affirmationsReadDates,
        remote.rituals?.affirmationsReadDates,
      ),
      journalDates: uniqueSorted(local.rituals?.journalDates, remote.rituals?.journalDates),
    },
  })
}

// Seed identity from WordPress so a student never types their own name.
export function applyWpIdentity(state, wpUser) {
  if (!wpUser) return state
  const next = { ...state }
  next.profile = { ...next.profile }
  next.account = { ...next.account }
  if (wpUser.firstName) next.profile.name = wpUser.firstName
  if (wpUser.email) next.account.email = wpUser.email
  next.account.userId = String(wpUser.id)
  return next
}
