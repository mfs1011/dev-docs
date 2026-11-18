#!/usr/bin/env node
/**
 * tshark chiqishini "Paket yo'li" yozuviga aylantirish (docs/vizualizator/paket-yoli.md 3.3).
 *
 *   node scripts/paket/aylantir.mjs <papka> <dars>
 *
 * <papka> ichida (VPS'da paket-lab/yoz.sh va tshark yaratadi):
 *   <dars>.pdml    tshark -o tcp.desegment_tcp_streams:FALSE -T pdml
 *   <dars>.hex     tshark -T fields -e frame.number -e data... (pastda) — har qatorda: raqam<TAB>hex
 *   <dars>.cols    tshark -T fields: raqam, vaqt, manba, manzil, protokol, info, hajm
 *   versiyalar.txt
 * Natija: src/sahna/paket/yozuvlar/<dars>.json
 *
 * Maxfiylik: TAQIQ muhit o'zgaruvchisidagi qatorlar (vergul bilan; masalan, VPS'ning haqiqiy IP'si) natijada
 * uchrasa — xato, fayl yozilmaydi.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const [papka, dars] = process.argv.slice(2)
if (!papka || !dars) {
  console.error('ishlatish: node scripts/paket/aylantir.mjs <papka> <dars>')
  process.exit(1)
}
const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

const ent = (s) => s.replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d)).replace(/&amp;/g, '&')
const attrs = (s) => Object.fromEntries([...s.matchAll(/([\w.-]+)="([^"]*)"/g)].map(([, k, v]) => [k, ent(v)]))

// ── PDML: <packet> → <proto> → <field> (ichma-ich) ──
function pdml(xml) {
  const paketlar = []
  let paket = null
  const stek = []
  for (const [, yopish, teg, a, ozi] of xml.matchAll(/<(\/?)(packet|proto|field)\b([^>]*?)(\/?)>/g)) {
    if (teg === 'packet') {
      if (yopish) { paketlar.push(paket); paket = null } else paket = { protos: [] }
      continue
    }
    if (yopish) { stek.pop(); continue }
    const at = attrs(a)
    const tugun = { k: at.name ?? '', s: at.showname || at.show || '', pos: +(at.pos ?? 0), len: +(at.size ?? 0), m: [] }
    if (at.hide === 'yes') tugun.yashirin = true
    if (teg === 'proto') {
      paket.protos.push(tugun)
      if (!ozi) stek.length = 0, stek.push(tugun)
    } else {
      const ota = stek[stek.length - 1]
      ota?.m.push(tugun)
      if (!ozi) stek.push(tugun)
    }
  }
  return paketlar
}

const tozala = (f) => {
  const m = f.m.filter((x) => !x.yashirin).map(tozala)
  const o = { k: f.k, s: f.s, pos: f.pos, len: f.len }
  if (m.length) o.m = m
  return o
}

const pd = pdml(readFileSync(join(papka, `${dars}.pdml`), 'utf8'))
const hex = Object.fromEntries(readFileSync(join(papka, `${dars}.hex`), 'utf8').trim().split('\n').map((q) => q.split('\t')))
const cols = readFileSync(join(papka, `${dars}.cols`), 'utf8').trim().split('\n').map((q) => q.split('\t'))
const versiyalar = readFileSync(join(papka, 'versiyalar.txt'), 'utf8').trim().split('\n')

const OTKAZ = new Set(['geninfo', 'frame', 'fake-field-wrapper'])
const paketlar = cols.map(([n, t, src, dst, proto, info, len], i) => ({
  n: +n,
  t: +(+t).toFixed(6),
  src, dst, proto, info, len: +len,
  hex: hex[n],
  qatlamlar: pd[i].protos.filter((p) => !OTKAZ.has(p.k)).map(tozala),
}))

const natija = { dars, versiyalar, paketlar }
const matn = JSON.stringify(natija)
for (const t of (process.env.TAQIQ ?? '').split(',').map((s) => s.trim()).filter(Boolean)) {
  if (matn.includes(t)) {
    console.error('XATO: yozuvda taqiqlangan qator bor — fayl yozilmadi')
    process.exit(2)
  }
}
const chiqish = join(root, 'src/sahna/paket/yozuvlar')
mkdirSync(chiqish, { recursive: true })
writeFileSync(join(chiqish, `${dars}.json`), matn + '\n')
console.log(`${dars}: ${paketlar.length} paket → src/sahna/paket/yozuvlar/${dars}.json (${(matn.length / 1024).toFixed(1)} KB)`)
