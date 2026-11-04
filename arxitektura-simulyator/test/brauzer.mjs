// Simulyator brauzerda: har mashq qadami — yechimsiz o'tmaydi, «Yechimni qo'llash» dan keyin (model barqaror
// holatga kelib, shart 2 soniya ushlanib turgach) o'tadi.
//   npx vite --port 5182 &  URL=http://localhost:5182 node arxitektura-simulyator/test/brauzer.mjs
import { chromium } from 'playwright-core'
import os from 'node:os'
import path from 'node:path'
import { MASHQLAR } from '../../src/arxitektura/mashqlar.js'

const BASE = process.env.URL ?? 'http://localhost:5182'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1680, height: 1000 } })
const errs = []
p.on('pageerror', (e) => errs.push(String(e)))
const okSoni = () => p.locator('.steps > li.ok').count()
async function kut(n, ms) {
  const t = Date.now()
  while (Date.now() - t < ms) {
    if ((await okSoni()) >= n) return true
    await p.waitForTimeout(200)
  }
  return false
}
let fail = 0
for (const m of MASHQLAR) {
  await p.goto(`${BASE}/arxitektura/trenajor?mashq=${m.id}`)
  await p.waitForSelector('.karta', { timeout: 30000 })
  console.log(`▶ ${m.id}`)
  for (const [i, s] of m.steps.entries()) {
    if (!s.yechim.tanla) {
      await p.waitForTimeout(2600)
      if ((await okSoni()) > i) { console.log(`  ✗ ${i + 1}. yechimsiz o‘tib ketdi`); fail++ }
    }
    // tiqilgan quti titraydi (animatsiya) — Playwright uni «barqaror emas» deb kutadi
    if (s.yechim.tanla) await p.locator('.tugun.db').click({ force: true })
    else {
      await p.locator('.steps > li.cur .yordam').click()
      await p.locator('.steps > li.cur button', { hasText: 'Yechimni qo‘llash' }).click()
    }
    const ok = await kut(i + 1, 25000)
    if (!ok) fail++
    const p95 = await p.locator('.karta').first().locator('b').textContent()
    console.log(`  ${ok ? '✓' : '✗'} ${i + 1}. ${s.text.slice(0, 70)} (p95 ${p95.trim()})`)
    if (!ok) break
  }
  await p.screenshot({ path: path.join(os.tmpdir(), `arx-${m.id}.png`) })
}
if (errs.length) console.log('\nBrauzer xatolari:\n' + [...new Set(errs)].join('\n'))
await b.close()
console.log(fail ? `\n${fail} ta xato` : "\nhammasi o'tdi")
process.exit(fail ? 1 : 0)
