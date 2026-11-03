// SQL trenajori mashqlari: ikkala dvigatelda (PostgreSQL — PGlite, SQLite — WASM) har qadamning
// yordam so'rovini bajaradi va check() o'tishini tekshiradi.
//   node sql-trenajor/test/mashqlar.mjs [mashq-id ...]
import { DVIGATELLAR } from '../../src/sqltrenajor/dvigatel.js'
import { MASHQLAR, yordamMatni, setupMatni } from '../../src/sqltrenajor/mashqlar.js'
import { boshlash } from '../../src/sqltrenajor/baza.js'
import { bajar, kontekst } from '../../src/sqltrenajor/ijro.js'

const only = process.argv.slice(2)
const list = only.length ? MASHQLAR.filter((m) => only.includes(m.id)) : MASHQLAR
const V = !!process.env.V
let fail = 0
for (const id of Object.keys(DVIGATELLAR)) {
  const eng = await DVIGATELLAR[id].yarat()
  console.log(`\n=== ${eng.name} ${eng.version}`)
  for (const m of list) {
    await eng.reset()
    const tayyor = await bajar(eng, boshlash(id) + setupMatni(m, id))
    const err = tayyor.find((r) => r.error)
    if (err) { console.log(`✗ ${m.id}: tayyorlash xatosi: ${err.error.message}\n   ${err.sql.slice(0, 120)}`); fail++; continue }
    const s = await eng.schema()
    console.log(`▶ ${m.id} — ${s.tables.map((t) => `${t.name}(${t.count})`).join(' ')}, FK: ${s.fks.length}`)
    for (const [i, st] of m.steps.entries()) {
      const sql = yordamMatni(st, id)
      const res = await bajar(eng, sql)
      const ok = !!(await st.check(kontekst(eng, res)))
      if (!ok) fail++
      const last = res.at(-1)
      console.log(`  ${ok ? '✓' : '✗'} ${i + 1}. ${sql.replace(/\s+/g, ' ').slice(0, 90)}`)
      if (!ok || V) {
        if (last.error) console.log('      xato:', last.error.code, last.error.message)
        if (last.columns) console.log('      ', last.columns.map((c) => c.name).join(' | '), '→', JSON.stringify(last.rows.slice(0, 6)))
        if (last.plan) { const w = (n, d) => { console.log('      ' + '  '.repeat(d) + n.type + (n.rel ? ' on ' + n.rel : '') + (n.index ? ' using ' + n.index : '') + (n.rows != null ? ` rows=${n.rows}` : '')); n.children?.forEach((c) => w(c, d + 1)) }; w(last.plan.root, 0) }
        if (last.tag || last.affected != null) console.log('      ', last.tag ?? `affected ${last.affected}`)
      }
    }
  }
  await eng.close()
}
console.log(fail ? `\n${fail} ta xato` : "\nhammasi o'tdi")
process.exit(fail ? 1 : 0)
