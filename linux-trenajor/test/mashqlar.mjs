// Linux trenajori mashqlarini brauzerda (dev server) haqiqiy VM'da tekshiradi: har qadamning buyrug'i yoziladi va
// panel keyingi qadamga o'tishi kutiladi. Ishga tushirish: npm run dev (5182) ishlab turganda
//   node linux-trenajor/test/mashqlar.mjs [mashq-id ...]
import { chromium } from 'playwright-core'
import { LINUX_MASHQLAR } from '../../src/trenajor/linuxMashqlar.js'

const URL = process.env.URL ?? 'http://localhost:5182'
const tanlangan = process.argv.slice(2)
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1400, height: 900 } })
const xatolar = []
p.on('pageerror', (e) => xatolar.push(String(e)))
let yiqildi = 0

for (const m of LINUX_MASHQLAR.filter((x) => !tanlangan.length || tanlangan.includes(x.id))) {
  await p.goto(`${URL}/linux/trenajor?mashq=${m.id}`, { waitUntil: 'networkidle' })
  await p.waitForFunction(() => document.querySelector('#linux-trenajor-terminal .lt-dot.is-on'), null, { timeout: 60000 })
  await p.waitForTimeout(1500) // mashq skripti source qilinadi
  for (const [i, q] of m.steps.entries()) {
    for (const c of q.sinov ?? [q.cmd]) {
      await p.keyboard.type(c)
      await p.keyboard.press('Enter')
      await p.waitForTimeout(400)
    }
    try {
      await p.waitForFunction((n) => document.querySelectorAll('.side .steps li.ok').length >= n, i + 1, { timeout: 45000 }) // brauzerda systemd buyruqlari birinchi marta sekin
      console.log(`  ✓ ${m.id} ${i + 1}. ${q.cmd}`)
    } catch {
      yiqildi++
      console.log(`  ✗ ${m.id} ${i + 1}. ${q.cmd} — qadam o'tmadi`)
      break
    }
  }
  if (await p.isVisible('.side .tugadi')) console.log(`✓ ${m.id}: tugadi`)
}
if (xatolar.length) console.log('sahifa xatolari:', xatolar)
await b.close()
process.exit(yiqildi || xatolar.length ? 1 : 0)
