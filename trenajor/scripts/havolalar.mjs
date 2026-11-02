// Git boblarining «Amaliyot» bo'limiga trenajor mashqlari havolasini yozadi (src/trenajor/mashqlar.js dan).
//   npm run trenajor:havolalar
import fs from 'node:fs'
import { MASHQLAR } from '../../src/trenajor/mashqlar.js'
const by = new Map()
for (const m of MASHQLAR) { const f = m.bob.replace('/git/', ''); by.set(f, [...(by.get(f) ?? []), m]) }
const plain = (t) => t.replace(/[’‘]/g, "'")
for (const [f, ms] of by) {
  const p = `content/git/${f}.md`
  let s = fs.readFileSync(p, 'utf8')
  const links = ms.map((m) => `[${plain(m.title)}](/git/trenajor?mashq=${m.id})`)
  const list = links.length === 1 ? links[0] : links.slice(0, -1).join(', ') + ' va ' + links.at(-1)
  const line = `> **Trenajorda sinab ko'ring:** ${list}. Brauzerda tayyor repo ochiladi: buyruqlarni qadamma-qadam yozasiz, yonida graf va \`.git\` papka o'zgarib boradi.\n\n`
  s = s.replace(/> \*\*Trenajorda sinab ko'ring:\*\*.*\n\n/, '')
  if ((s.match(/\n## Amaliyot\n\n/g) ?? []).length !== 1) { console.log('Amaliyot topilmadi:', f); continue }
  s = s.replace('\n## Amaliyot\n\n', '\n## Amaliyot\n\n' + line)
  fs.writeFileSync(p, s)
  console.log(f, ms.length)
}
