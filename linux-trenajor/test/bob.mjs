// Bobdagi trenajor bloklarining (```text, VPS emas) buyruqlarini o'quvchi qanday bajarsa, shunday — bitta sessiyada,
// ketma-ket — trenajorda qayta bajarib, bloklardagi chiqishlarni haqiqiysi bilan almashtiradi.
//   node linux-trenajor/test/bob.mjs content/linux/29-signallar.md          — faylni yangilaydi, farqlarni chiqaradi
//   node linux-trenajor/test/bob.mjs content/linux/29-signallar.md --tekshir — faylga tegmaydi, farq bo'lsa kod 1
// Blok ichida faqat "$ " bilan boshlangan qatorlar buyruq; qolganlari (eski chiqish) tashlab yuboriladi.
// Bajarilmasligi kerak bo'lgan blok: ```text vps (VPS'da olingan) yoki ```text sxema (buyruq emas, misol).
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import url from 'node:url'

const [fayl, rejim] = process.argv.slice(2)
if (!fayl) { console.error('foydalanish: node bob.mjs <bob.md> [--tekshir]'); process.exit(2) }
const md = fs.readFileSync(fayl, 'utf8')
const BLOK = /```text\n([\s\S]*?)```/g
// "$ " — buyruq; undan keyin keladigan "> " qatorlar — o'sha buyruqning davomi (here-document va h.k.).
// buyruq.mjs ga ko'p qatorli buyruq qatorlari ⏎ bilan ulab beriladi.
function buyruqlar(matn) {
  const natija = []
  let ichida = false
  for (const q of matn.split('\n')) {
    if (q.startsWith('$ ')) { natija.push(q.slice(2)); ichida = true }
    else if (ichida && q.startsWith('> ')) natija[natija.length - 1] += '⏎' + q.slice(2)
    else ichida = false
  }
  return natija
}
const bloklar = [...md.matchAll(BLOK)]
  .map((m) => ({ m, cmds: buyruqlar(m[1]) }))
  .filter((b) => b.cmds.length)
if (!bloklar.length) { console.log('trenajor bloki yo\'q'); process.exit(0) }

// Bloklar orasiga belgi qo'yamiz: chiqishni keyin shu belgilar bo'yicha bo'lamiz
const belgi = (i) => `echo __BLOK_${i}__`
const qatorlar = bloklar.flatMap((b, i) => [belgi(i), ...b.cmds])
const tmp = path.join(os.tmpdir(), `bob-${process.pid}.txt`)
fs.writeFileSync(tmp, qatorlar.join('\n') + '\n')
const buyruq = path.join(path.dirname(url.fileURLToPath(import.meta.url)), 'buyruq.mjs')
const chiqish = execFileSync('node', [buyruq, tmp], { encoding: 'utf8', maxBuffer: 64 << 20, timeout: 20 * 60e3 })
fs.unlinkSync(tmp)

// buyruq.mjs har buyruqni "# buyruq" qatori bilan chiqaradi. Chiqishning o'zi ham "# " bilan boshlanishi mumkin
// (masalan, `systemctl cat`), shuning uchun faqat navbatdagi kutilgan buyruqqa aynan teng qatorni buyruq deb olamiz.
const kutilgan = qatorlar
let k = 0
const qismlar = []
let joriy = null
for (const q of chiqish.replace(/\n$/, '').split('\n')) {
  if (k < kutilgan.length && q === '# ' + kutilgan[k].split('⏎')[0]) {
    const b = kutilgan[k].match(/^echo __BLOK_(\d+)__$/)
    k++
    if (b) { joriy = []; qismlar[+b[1]] = joriy; continue }
    joriy.push('$ ' + q.slice(2))
    continue
  }
  if (joriy === null) continue
  if (/^__BLOK_\d+__$/.test(q) && joriy.length === 0) continue
  joriy.push(q)
}
if (k !== kutilgan.length) { console.error(`xato: ${kutilgan.length} buyruqdan ${k} tasi chiqishda topildi`); process.exit(1) }

let yangi = md
let farq = 0
for (let i = bloklar.length - 1; i >= 0; i--) {
  const { m } = bloklar[i]
  const blok = (qismlar[i] ?? []).join('\n') + '\n'
  if (blok !== m[1]) {
    farq++
    console.log(`--- ${i + 1}-blok o'zgardi: ${bloklar[i].cmds[0].slice(0, 70)}`)
  }
  const bosh = m.index + '```text\n'.length
  yangi = yangi.slice(0, bosh) + blok + yangi.slice(bosh + m[1].length)
}
console.log(`${bloklar.length} blok, ${farq} tasida chiqish farq qildi`)
if (rejim === '--tekshir') process.exit(farq ? 1 : 0)
fs.writeFileSync(fayl, yangi)
