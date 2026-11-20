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
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
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
// tshark ba'zi paketga info yozmaydi (masalan, bir nechta segmentga bo'lingan TLS yozuvining boshi) — o'rniga
// eng ichki qatlamning oxirgi maydoni matni (tshark'ning o'zidan, masalan "TLS segment data (1448 bytes)")
for (const p of paketlar) {
  if (p.info) continue
  const q = p.qatlamlar[p.qatlamlar.length - 1]
  p.info = q?.m?.[q.m.length - 1]?.s ?? q?.s ?? ''
}

// TLS: kalit bilan ochilgan ko'rinish (eksport.sh: <dars>.ochiq.pdml, .ochiq.cols). Faqat farq qilgan paketlarga
// `ochiq: { proto, info, qatlamlar }` qo'shiladi. Ochilgan maydonlarning pos/len shifrlangan baytlarga emas, ochilgan
// matnga tegishli — inspektor ularni hex ustida belgilamaydi.
if (existsSync(join(papka, `${dars}.ochiq.pdml`))) {
  const opd = pdml(readFileSync(join(papka, `${dars}.ochiq.pdml`), 'utf8'))
  const ocols = Object.fromEntries(readFileSync(join(papka, `${dars}.ochiq.cols`), 'utf8').trim().split('\n').map((q) => q.split('\t')).map(([n, proto, info]) => [n, { proto, info }]))
  let soni = 0
  paketlar.forEach((p, i) => {
    const q = opd[i].protos.filter((x) => !OTKAZ.has(x.k)).map(tozala)
    if (JSON.stringify(q) === JSON.stringify(p.qatlamlar)) return
    p.ochiq = { ...ocols[p.n], qatlamlar: q }
    soni++
  })
  console.log(`kalit bilan ochilgan: ${soni} paket`)
}

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
