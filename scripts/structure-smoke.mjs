import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd, exit } from 'node:process'

const root = cwd()
const failures = []

function assert(condition, message) {
  if (!condition) failures.push(message)
}

function read(path) {
  return readFileSync(join(root, path), 'utf8')
}

const requiredFiles = [
  'README.md',
  'DEVELOPER_HANDOFF.md',
  'PRODUCTION_BACKLOG.md',
  'BACKEND_PLAN.md',
  'BRAND_NOTES.md',
  'STATE_MODEL.md',
  'ROADMAP.md',
  'package.json',
  'src/App.jsx',
  'src/components.jsx',
  'src/derived.js',
  'src/modes.jsx',
  'src/state.js',
  'src/views/Onboarding.jsx',
  'src/views/Today.jsx',
  'src/views/MyMap.jsx',
  'src/views/Progress.jsx',
  'src/views/More.jsx',
  'src/styles.css',
]

for (const file of requiredFiles) {
  assert(existsSync(join(root, file)), `Missing required file: ${file}`)
}

const packageJson = JSON.parse(read('package.json'))
assert(packageJson.scripts?.build === 'vite build', 'package.json must keep build script')
assert(packageJson.scripts?.dev === 'vite', 'package.json must keep dev script')
assert(packageJson.scripts?.test === 'node scripts/structure-smoke.mjs', 'package.json must expose structure smoke test')

const app = read('src/App.jsx')
assert(app.includes("import Onboarding from './views/Onboarding.jsx'"), 'App must import Onboarding view')
assert(app.includes("import Today from './views/Today.jsx'"), 'App must import Today view')
assert(app.includes("import MyMap from './views/MyMap.jsx'"), 'App must import MyMap view')
assert(app.includes("import Progress from './views/Progress.jsx'"), 'App must import Progress view')
assert(app.includes("import More from './views/More.jsx'"), 'App must import More view')
assert(app.includes("import { ModeOverlay } from './modes.jsx'"), 'App must import ModeOverlay')

const state = read('src/state.js')
assert(state.includes('schemaVersion: 1'), 'state must include schemaVersion')
assert(state.includes("status: 'local'"), 'state must include account local status')
assert(state.includes('export function loadState'), 'state must export loadState')
assert(state.includes('export function saveState'), 'state must export saveState')
assert(state.includes('export function normalizeState'), 'state must export normalizeState')
assert(state.includes('export function exportState'), 'state must export exportState')
assert(state.includes('export function importStateFile'), 'state must export importStateFile')

const derived = read('src/derived.js')
assert(derived.includes('export function mapGroups'), 'derived must export mapGroups')
assert(derived.includes('export function getHourPhases'), 'derived must export getHourPhases')
assert(derived.includes('export function bestStreak'), 'derived must export bestStreak')

const styles = read('src/styles.css')
for (const token of ['#1DC0DC', '#072543', '#FADE4C', '#B1B8BD']) {
  assert(styles.includes(token), `styles must include brand token ${token}`)
}

const handoff = read('DEVELOPER_HANDOFF.md')
assert(handoff.includes('Verification Checklist'), 'developer handoff must include verification checklist')
assert(handoff.includes('Current Feature Coverage'), 'developer handoff must include feature coverage')

const srcFiles = requiredFiles.filter((file) => file.startsWith('src/'))
for (const file of srcFiles) {
  const contents = read(file)
  assert(!contents.includes('—'), `${file} contains an em dash in source/UI copy`)
}

if (failures.length) {
  console.error('Structure smoke failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  exit(1)
}

console.log('Structure smoke passed.')
