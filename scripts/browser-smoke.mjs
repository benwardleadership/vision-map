import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

async function importPlaywright() {
  try {
    return await import('playwright')
  } catch {
    throw new Error('Playwright is not installed. Run `npm install -D playwright` to enable browser smoke tests.')
  }
}

function waitForServer(proc) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Timed out waiting for Vite dev server')), 15000)
    proc.stdout.on('data', (data) => {
      const text = data.toString()
      if (text.includes('Local:')) {
        clearTimeout(timeout)
        resolve()
      }
    })
    proc.stderr.on('data', (data) => {
      const text = data.toString()
      if (text.includes('Error')) {
        clearTimeout(timeout)
        reject(new Error(text))
      }
    })
  })
}

let server

try {
  const { chromium } = await importPlaywright()
  server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1'], {
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  await waitForServer(server)
  await delay(300)

  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' })

  const tabs = [
    ['Today', 'Morning, Alex.'],
    ['My MAP', 'The living document.'],
    ['Progress', 'Work the ritual.'],
    ['More', 'Settings and output.'],
  ]

  for (const [tab, heading] of tabs) {
    await page.getByRole('button', { name: tab }).last().click()
    await page.getByRole('heading', { name: heading }).waitFor()
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
    if (overflow) throw new Error(`${tab} has horizontal overflow at mobile viewport`)
  }

  await page.getByRole('button', { name: 'Today' }).last().click()
  await page.getByRole('button', { name: 'Start' }).click()
  await page.getByRole('heading', { name: '20:00' }).waitFor()
  await page.getByRole('button', { name: 'Close' }).click()

  await browser.close()
  console.log('Browser smoke passed.')
  server.kill('SIGTERM')
} catch (error) {
  if (server) server.kill('SIGTERM')
  console.error(error.message)
  process.exit(1)
}
