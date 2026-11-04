// Simulyator mashqlari model bilan: har qadam yechimdan oldin o'tmasligi va yechim qo'llangach o'tishi
// (barqaror holatda). Brauzersiz — model.js sof funksiya.
//   node arxitektura-simulyator/test/mashqlar.mjs
import { barqaror } from '../../src/arxitektura/model.js'
import { MASHQLAR } from '../../src/arxitektura/mashqlar.js'

let fail = 0
for (const m of MASHQLAR) {
  let c = structuredClone(m.sozlama)
  let tanlangan = null
  const bosh = barqaror(c)
  console.log(`▶ ${m.id}: boshida p95 ${bosh.p95} ms, xato ${(bosh.xato * 100).toFixed(1)}%`)
  for (const [i, s] of m.steps.entries()) {
    const oldin = s.check({ c, m: barqaror(c), tanlangan })
    const { tanla, ...oz } = s.yechim
    if (tanla) tanlangan = tanla
    c = { ...c, ...oz }
    const mm = barqaror(c)
    const ok = !oldin && s.check({ c, m: mm, tanlangan })
    if (!ok) fail++
    console.log(`  ${ok ? '✓' : '✗'} ${i + 1}. p95 ${mm.p95} ms, xato ${(mm.xato * 100).toFixed(1)}%, db ${(mm.db.band * 100).toFixed(0)}%${oldin ? '  (yechimsiz o‘tib ketdi!)' : ''}`)
  }
}
console.log(fail ? `\n${fail} ta xato` : "\nhammasi o'tdi")
process.exit(fail ? 1 : 0)
