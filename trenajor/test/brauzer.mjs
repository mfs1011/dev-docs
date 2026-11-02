// Brauzerda (Chromium) to'liq sinov: ilova ochiladi, buyruqlar klaviatura bilan yoziladi, skrinshotlar olinadi.
//   npm run build && npx vite preview --port 4317 &  node trenajor/test/brauzer.mjs
import { chromium } from 'playwright-core'
import fs from 'node:fs'

const URL = process.env.URL ?? 'http://localhost:4317/git/trenajor'
const OUT = process.env.OUT ?? 'trenajor/test/shots'
fs.mkdirSync(OUT, { recursive: true })
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1680, height: 960 } })
const errs = []
p.on('pageerror', (e) => errs.push(String(e)))
p.on('console', (m) => m.type() === 'error' && errs.push(m.text()))
let bytes = 0, files = 0
p.on('response', async (r) => { try { bytes += (await r.body()).length; files++ } catch {} })
const t0 = Date.now()
await p.goto(URL)
// sahifa alohida chunk — avval yuklash oynasi paydo bo'lishini kutamiz
await p.waitForSelector('.boot', { state: 'attached' })
await p.waitForSelector('.boot', { state: 'detached', timeout: 180000 })
console.log('tayyor:', ((Date.now() - t0) / 1000).toFixed(1), 's;', (bytes / 1048576).toFixed(1), 'MB,', files, 'fayl')
const shot = async (n) => { await p.waitForTimeout(900); await p.screenshot({ path: `${OUT}/${n}.png` }) }
const type = async (s, enter = true) => { await p.keyboard.type(s, { delay: 25 }); if (enter) await p.keyboard.press('Enter'); await p.waitForTimeout(1500) }

await shot('01-salom')
await type('git init')
await type('echo salom > a.txt && git add a.txt && git commit -m birinchi')
await type('git sw', false)
await shot('02-maslahat')
await p.keyboard.press('Tab')
await type('-c feature', true)
await type('echo 2 >> a.txt && git commit -qam ikkinchi && echo 3 >> a.txt && git commit -qam uchinchi')
await type('git switch main && echo b > b.txt && git add b.txt && git commit -qm main-da')
await shot('03-ikki-branch')
await type('git switch feature')
await type('git rebase main')
await shot('04-rebase')
await type('echo yangi > c.txt && git add c.txt')
await shot('05-index')
await p.locator('.tree .row.new').first().click()
await shot('06-obyekt')
await p.locator('.tree .row', { hasText: 'index' }).first().click()
await shot('07-index-fayl')
console.log('jami yuklangan:', (bytes / 1048576).toFixed(1), 'MB,', files, 'fayl')
console.log('xatolar:', errs)
await b.close()
