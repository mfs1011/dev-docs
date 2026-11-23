// Docker boblarining «Amaliyot» bo'limiga trenajor mashqlari havolasini yozadi (src/docker/mashqlar.js dan).
//   node docker-trenajor/scripts/havolalar.mjs
import fs from 'node:fs'
import { DOCKER_MASHQLAR } from '../../src/docker/mashqlar.js'
const by = new Map()
for (const m of DOCKER_MASHQLAR) { const f = m.bob.replace('/docker/', ''); by.set(f, [...(by.get(f) ?? []), m]) }
const plain = (t) => t.replace(/[’‘]/g, "'")
for (const [f, ms] of by) {
  const p = `content/docker/${f}.md`
  let s = fs.readFileSync(p, 'utf8')
  const links = ms.map((m) => `[${plain(m.title)}](/docker/trenajor?mashq=${m.id})`)
  const list = links.length === 1 ? links[0] : links.slice(0, -1).join(', ') + ' va ' + links.at(-1)
  const line = `> **Trenajorda sinab ko'ring:** ${list}. Trenajor — simulyator: chiqishlar sinov VPS'idagi Docker Engine 29.9.3 da yozib olingan; yonida konteynerlar, tarmoqlar va volume'lar xaritasi o'zgarib boradi.\n\n`
  s = s.replace(/> \*\*Trenajorda sinab ko'ring:\*\*.*\n\n/, '')
  if ((s.match(/\n## Amaliyot\n\n/g) ?? []).length !== 1) { console.log('Amaliyot topilmadi:', f); continue }
  s = s.replace('\n## Amaliyot\n\n', '\n## Amaliyot\n\n' + line)
  fs.writeFileSync(p, s)
  console.log(f, ms.length)
}
