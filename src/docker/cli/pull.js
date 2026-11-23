// `docker pull` progress chiqishi — Docker CLI jsonmessage ko'rinishi (VPS yozuvlari: 02-imagelar, 03-pull-noldan,
// 13-pull-keng). TTY'da har qatlam o'z qatorida yangilanadi: ESC[nA (yuqoriga), ESC[2K (qatorni tozalash), \r, matn, \r,
// ESC[nB (pastga). Terminal 110 ustundan keng bo'lsa progress chizig'i [==>  ] qo'shiladi (yozuvda: 100 — yo'q, 120 — bor).
// Yuklash modeli: bir vaqtda 3 ta qatlam (dockerd max-concurrent-downloads=3), 1 MiB bo'laklar; ochish (extract) qatlam
// tartibida birin-ketin. Tezlik yozuvdagidan tezroq (o'quvchi kutib qolmasin), lekin ketma-ketlik o'sha.
import { hajm } from '../birlik.js'

const MiB = 1048576
const TEZLIK = 24 * MiB          // bayt/soniya (yuklash, hammasi uchun)
const OCHISH = 90 * MiB          // bayt/soniya (ochish)
const QADAM = 80                 // ms

export async function pullAnimatsiya(kat, out, { cols = 100 } = {}) {
  const qisqa = (d) => d.replace('sha256:', '').slice(0, 12)
  // tartib: yozuvdagidek — oxirgi qatlam birinchi, keyin qolganlari
  const q = kat.qatlamlar.map((l, i) => ({ id: qisqa(l.d), s: l.s, i, holat: 'kut', yuklandi: 0, ochildi: 0 }))
  const qatorlar = q.length > 1 ? [q[q.length - 1], ...q.slice(0, -1)] : [...q]
  const qoshimcha = kat.attestation.map((l) => ({ id: qisqa(l.d), s: l.s, qoshimcha: true, holat: 'kut', yuklandi: 0 }))
  if (!out.tty) return oddiy(kat, q, qoshimcha, out)

  const korsatilgan = [] // ekrandagi qatorlar tartibi
  const keng = cols > 110
  const matn = (x) => {
    if (x.holat === 'navbat') return `${x.id}: Pulling fs layer `
    if (x.holat === 'yuk') return `${x.id}: Downloading ${progress(x.yuklandi, x.s, keng)}`
    if (x.holat === 'yuklandi') return `${x.id}: Download complete `
    if (x.holat === 'och') return `${x.id}: Extracting ${Math.max(1, Math.ceil(x.ochishVaqt / 1000))} s`
    if (x.holat === 'tayyor') return `${x.id}: Pull complete `
    return ''
  }
  const chiz = (x) => {
    const n = korsatilgan.length - korsatilgan.indexOf(x)
    out.yoz(`\x1b[${n}A\x1b[2K\r${matn(x)}\r\x1b[${n}B`)
  }
  const yangiQator = (x) => {
    korsatilgan.push(x)
    out.yoz('\n\x1b[1A\x1b[2K\r' + matn(x) + '\r\x1b[1B')
  }
  for (const x of qatorlar) { x.holat = 'navbat'; yangiQator(x); await kut(18) }
  // kichik (1 MiB dan kichik) qatlamlar darhol yuklanadi
  let vaqt = 0
  const ochNavbat = [...q]
  let qoshKorsatildi = 0
  for (;;) {
    const faol = qatorlar.filter((x) => x.holat === 'yuk')
    for (const x of qatorlar) if (x.holat === 'navbat' && faol.length < 3) { x.holat = 'yuk'; faol.push(x) }
    // yuklash
    const ulush = (TEZLIK * QADAM) / 1000 / Math.max(1, faol.length)
    for (const x of faol) {
      const oldin = Math.floor(x.yuklandi / MiB)
      x.yuklandi = Math.min(x.s, x.yuklandi + ulush)
      if (x.yuklandi >= x.s) { x.holat = 'yuklandi'; chiz(x) } else if (Math.floor(x.yuklandi / MiB) !== oldin || x.s < MiB) chiz(x)
    }
    // attestation (SBOM, provenance) — yuklash o'rtasida o'z qatori bilan
    if (qoshKorsatildi < qoshimcha.length && vaqt > 300 * (qoshKorsatildi + 1)) {
      const a = qoshimcha[qoshKorsatildi++]
      a.holat = 'yuklandi'
      yangiQator(a)
    }
    // ochish: qatlam tartibida
    const och = ochNavbat[0]
    if (och && (och.holat === 'yuklandi' || och.holat === 'och')) {
      if (och.holat === 'yuklandi') { och.holat = 'och'; och.ochishVaqt = 0 }
      och.ochishVaqt += QADAM
      och.ochildi += (OCHISH * QADAM) / 1000
      if (och.ochildi >= och.s * 2.6 || och.s < 64 * 1024) { och.holat = 'tayyor'; ochNavbat.shift() }
      chiz(och)
    }
    if (!ochNavbat.length && qoshKorsatildi >= qoshimcha.length) break
    await kut(QADAM)
    vaqt += QADAM
  }
  out.yoz('')
}

function progress(joriy, jami, keng) {
  let foiz = Math.floor((joriy / jami) * 100 / 2)
  if (foiz > 50) foiz = 50
  const bar = keng ? `[${'='.repeat(foiz)}>${' '.repeat(Math.max(0, 50 - foiz))}] ` : ''
  const j = Math.floor(joriy / MiB) * MiB || joriy
  return bar + `${hajm(Math.min(j, jami)).padStart(8)}/${hajm(jami)}`
}

// TTY bo'lmasa (quvur, fayl): faqat holat o'zgargan qatorlar — kitobdagi (03-bob) ko'rinish
async function oddiy(kat, q, qoshimcha, out) {
  const qatorlar = q.length > 1 ? [q[q.length - 1], ...q.slice(0, -1)] : [...q]
  for (const x of qatorlar) out.yoz(`${x.id}: Pulling fs layer\n`)
  await kut(200)
  for (const a of qoshimcha) out.yoz(`${a.id}: Download complete\n`)
  for (const x of [...qatorlar].sort((a, b) => a.s - b.s)) { await kut(Math.min(900, (x.s / TEZLIK) * 1000)); out.yoz(`${x.id}: Download complete\n`) }
  for (const x of q) { await kut(Math.min(700, (x.s / OCHISH) * 2600)); out.yoz(`${x.id}: Pull complete\n`) }
}

const kut = (ms) => new Promise((r) => setTimeout(r, ms))
