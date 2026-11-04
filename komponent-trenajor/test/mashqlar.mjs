// Komponent trenajori (Vue va React) mashqlari brauzerda: har qadamda «Bajarib ko'rsatish» harakati
// bajariladi va qadam o'tishi tekshiriladi. Yechimli qadamlarda avval yechimsiz kod bilan qadam o'tmasligi
// (mashq ma'noli ekani), keyin yechim qo'yilgach o'tishi tekshiriladi.
//   npx vite --port 5181 &  URL=http://localhost:5181 node komponent-trenajor/test/mashqlar.mjs [mashq-id ...]
import { chromium } from 'playwright-core'
import fs from 'node:fs'
import { MASHQLAR } from '../../src/komponent/mashqlar.js'

const BASE = process.env.URL ?? 'http://localhost:5181'
const OUT = process.env.OUT ?? 'komponent-trenajor/test/shots'
const only = process.argv.slice(2)
fs.mkdirSync(OUT, { recursive: true })

const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1680, height: 960 } })
const errs = []
p.on('pageerror', (e) => errs.push(String(e)))
p.on('console', (m) => m.type() === 'error' && errs.push(m.text()))

const okSoni = () => p.locator('.steps li.ok').count()
const tayyor = async () => {
  // iframe qayta yuklanib, daraxtda ilova paydo bo'lishini kutamiz
  await p.waitForTimeout(300)
  await p.waitForSelector('.qadamlar > li', { state: 'attached', timeout: 20000 })
  await p.waitForTimeout(400)
}
async function kut(n, ms) {
  const t = Date.now()
  while (Date.now() - t < ms) {
    if ((await okSoni()) >= n) return true
    await p.waitForTimeout(150)
  }
  return false
}
const korsat = () => p.locator('.steps li.cur button', { hasText: 'Bajarib ko‘rsatish' }).click()

let fail = 0
for (const fw of ['vue', 'react']) {
  for (const m of MASHQLAR[fw]) {
    if (only.length && !only.includes(m.id)) continue
    await p.goto(`${BASE}/${fw}/trenajor?mashq=${m.id}`)
    await tayyor()
    console.log(`▶ ${fw}/${m.id}`)
    for (const [i, s] of m.steps.entries()) {
      if (s.yechim) {
        await korsat()
        const erta = await kut(i + 1, 1800)
        if (erta) { console.log(`  ✗ ${i + 1}. yechimsiz ham o‘tib ketdi`); fail++ }
        await p.locator('.steps li.cur .yordam').click()
        await p.locator('.steps li.cur button', { hasText: 'Yechimni kodga qo‘yish' }).click()
        await tayyor()
      }
      await korsat()
      const ok = await kut(i + 1, 8000)
      if (!ok) {
        fail++
        await p.screenshot({ path: `${OUT}/xato-${m.id}-${i + 1}.png` })
      }
      const xato = await p.locator('.xato').textContent().catch(() => '')
      console.log(`  ${ok ? '✓' : '✗'} ${i + 1}. ${s.text.slice(0, 80)}${xato ? `\n      xato: ${xato}` : ''}`)
      if (!ok) break
    }
    await p.screenshot({ path: `${OUT}/${m.id}.png` })
  }
}
if (errs.length) console.log('\nBrauzer xatolari:\n' + [...new Set(errs)].join('\n'))
await b.close()
console.log(fail ? `\n${fail} ta xato` : "\nhammasi o'tdi")
process.exit(fail ? 1 : 0)
