// Tizim dizayni simulyatorining modeli — TAXMINIY, o'rgatish uchun. Har komponent: kiruvchi oqim (so'rov/s) va
// sig'im (so'rov/s). Bandlik = oqim / sig'im. Sig'imdan oshgani navbatga yig'iladi; navbatda kutish TIMEOUT dan
// oshsa — so'rov xato bilan tugaydi. Kechikish: xizmat vaqti / (1 − bandlik) (navbat nazariyasining eng sodda
// ko'rinishi) + navbatda kutish. p95 — tasodifiy (eksponensial) kutishda o'rtachadan ~3 barobar.
// Raqamlar haqiqiy o'lchov emas: haqiqiy sig'im yuklama sinovida resurslar bo'yicha o'lchanadi (Arxitektura 90-bob).

export const TAXMIN = {
  server: { sigim: 400, vaqt: 25 }, // bitta ilova serveri: so'rov/s, ms
  kesh: { sigim: 50000, vaqt: 1 }, // Redis kabi xotiradagi kesh
  db: { sigim: 2000, vaqt: 8 }, // asosiy (primary) baza: o'qish + yozish
  replika: { sigim: 2000, vaqt: 8 }, // faqat o'qish
  cdn: { vaqt: 20 }, // statik fayllar foydalanuvchiga yaqin serverdan
  lb: { vaqt: 1 },
  tarmoq: 40, // foydalanuvchi ↔ datamarkaz, ms
  timeout: 3000, // ms
}

export const BOSHLANGICH = {
  oqim: 1000, // foydalanuvchilardan kelayotgan so'rov/s
  oqishUlushi: 0.9, // so'rovlarning qanchasi faqat o'qish
  statikUlushi: 0.4, // rasm, JS, CSS — o'zgarmas fayllar
  cdn: false,
  lb: true,
  serverlar: [true, true, true], // true — ishlayapti, false — yiqilgan
  kesh: false,
  keshHit: 0.8, // keshda topilish ulushi
  replikalar: 0,
}

const nol = () => ({ navbat: 0 })
export const yangiHolat = () => ({ server: [], db: nol(), replika: [], vaqt: 0 })

// Bitta komponent: oqim λ, sig'im μ, holat (navbat) → xizmat qilingan, tashlangan, kutish, bandlik
function komponent(h, lam, mu, vaqtMs, dt) {
  if (mu <= 0) return { xizmat: 0, tashlandi: lam, kutish: 0, band: lam > 0 ? Infinity : 0, navbat: 0 }
  let tashlandi = 0
  if (lam <= mu) h.navbat = Math.max(0, h.navbat - (mu - lam) * dt)
  else {
    h.navbat += (lam - mu) * dt
    const chegara = (mu * TAXMIN.timeout) / 1000
    if (h.navbat > chegara) {
      tashlandi = lam - mu
      h.navbat = chegara
    }
  }
  const band = lam / mu
  const navbatda = (h.navbat / mu) * 1000 // ms
  const xizmatVaqti = vaqtMs / (1 - Math.min(band, 0.95))
  return { xizmat: lam - tashlandi, tashlandi, kutish: xizmatVaqti + navbatda, navbatKutish: navbatda + (xizmatVaqti - vaqtMs), band, navbat: h.navbat }
}

// dt soniya oldinga: har komponent oqimi, bandligi va umumiy ko'rsatkichlar
export function qadam(h, c, dt = 0.1) {
  const T = TAXMIN
  h.vaqt += dt
  const statik = c.oqim * c.statikUlushi
  const cdnga = c.cdn ? statik : 0
  const serverga = c.oqim - cdnga // CDN bo'lmasa statik fayllar ham serverga

  // load balancer: ishlayotgan serverlarga teng; LB yo'q bo'lsa — hamma oqim birinchi serverga
  while (h.server.length < c.serverlar.length) h.server.push(nol())
  h.server.length = c.serverlar.length
  const tirik = c.serverlar.map((x, i) => (x ? i : -1)).filter((i) => i >= 0)
  const ulush = c.serverlar.map((x, i) => (c.lb ? (x && tirik.length ? serverga / tirik.length : 0) : i === 0 ? serverga : 0))
  // LB yo'q va birinchi server yiqilgan — so'rovlar hech qayerga bormaydi
  const yolsiz = !c.lb && !c.serverlar[0] ? serverga : c.lb && !tirik.length ? serverga : 0
  const sv = ulush.map((lam, i) => (c.serverlar[i] ? komponent(h.server[i], lam, T.server.sigim, T.server.vaqt, dt) : { xizmat: 0, tashlandi: lam, kutish: 0, band: 0, navbat: 0, yiqilgan: true }))
  const serverXizmat = sv.reduce((a, s) => a + s.xizmat, 0)
  const serverTashlandi = sv.reduce((a, s) => a + s.tashlandi, 0) + yolsiz

  // har dinamik so'rov bazaga bitta murojaat qiladi (statik fayl — yo'q)
  const dinamik = serverXizmat * (c.cdn ? 1 : 1 - c.statikUlushi)
  const oqish = dinamik * c.oqishUlushi
  const yozish = dinamik - oqish
  const keshdan = c.kesh ? oqish * c.keshHit : 0
  const bazaOqish = oqish - keshdan
  // o'qishlar asosiy baza va replikalar orasida teng bo'linadi, yozish — faqat asosiyga
  while (h.replika.length < c.replikalar) h.replika.push(nol())
  h.replika.length = c.replikalar
  const har = bazaOqish / (1 + c.replikalar)
  const db = komponent(h.db, yozish + har, T.db.sigim, T.db.vaqt, dt)
  const rp = h.replika.map((r) => komponent(r, har, T.replika.sigim, T.replika.vaqt, dt))
  const dbTashlandi = db.tashlandi + rp.reduce((a, r) => a + r.tashlandi, 0)

  // o'rtacha javob vaqti: tarmoq + (CDN yoki LB + server + baza/kesh)
  const tirikSv = sv.filter((s) => !s.yiqilgan && s.xizmat > 0)
  const svKutish = tirikSv.length ? tirikSv.reduce((a, s) => a + s.kutish * s.xizmat, 0) / Math.max(1, serverXizmat) : 0
  const dbKutish = (db.kutish * (yozish + har) + rp.reduce((a, r) => a + r.kutish * har, 0)) / Math.max(1e-9, yozish + bazaOqish)
  const bazaUlushi = dinamik > 0 ? (yozish + bazaOqish) / Math.max(1e-9, serverXizmat) : 0
  const keshUlushi = dinamik > 0 ? keshdan / Math.max(1e-9, serverXizmat) : 0
  const dinamikVaqt = T.lb.vaqt * (c.lb ? 1 : 0) + svKutish + bazaUlushi * dbKutish + keshUlushi * T.kesh.vaqt
  const jami = c.oqim || 1
  const ortacha = T.tarmoq + (cdnga * T.cdn.vaqt + (serverga - serverTashlandi) * dinamikVaqt) / Math.max(1, cdnga + serverga - serverTashlandi)
  // p95: navbatda kutish qismi ~3 barobar (eksponensial taqsimot), qolgani o'zgarmas
  const navbatQismi = tirikSv.reduce((a, s) => a + s.navbatKutish * s.xizmat, 0) / Math.max(1, serverXizmat) + bazaUlushi * ((db.navbatKutish ?? 0) * (yozish + har) + rp.reduce((a, r) => a + (r.navbatKutish ?? 0) * har, 0)) / Math.max(1e-9, yozish + bazaOqish)
  const p95 = Math.min(T.timeout, ortacha + 2 * navbatQismi * ((serverga - serverTashlandi) / jami))
  const xato = Math.min(1, (serverTashlandi + dbTashlandi) / jami)

  return {
    oqim: c.oqim,
    cdn: { oqim: cdnga },
    lb: { oqim: c.lb ? serverga : 0 },
    serverlar: sv.map((s, i) => ({ oqim: ulush[i], band: s.band, kutish: s.kutish, navbat: s.navbat, yiqilgan: !c.serverlar[i], tashlandi: s.tashlandi })),
    kesh: { oqim: c.kesh ? oqish : 0, hit: keshdan, band: c.kesh ? oqish / T.kesh.sigim : 0 },
    db: { oqim: yozish + har, oqish: har, yozish, band: db.band, kutish: db.kutish, tashlandi: db.tashlandi },
    replikalar: rp.map((r) => ({ oqim: har, band: r.band, kutish: r.kutish, tashlandi: r.tashlandi })),
    ortacha: Math.round(Math.min(T.timeout, ortacha)),
    p95: Math.round(p95),
    xato,
    bajarildi: Math.max(0, c.oqim - serverTashlandi - dbTashlandi),
    yolsiz,
  }
}

// barqaror holat: model `soniya` davomida ishlatiladi (hikoya, mashq va testlar uchun)
export function barqaror(c, soniya = 30) {
  const h = yangiHolat()
  let m
  for (let t = 0; t < soniya; t += 0.1) m = qadam(h, c, 0.1)
  return m
}

// eng band komponent (zaif bo'g'in)
export function zaifBogin(m) {
  const list = [
    ...m.serverlar.filter((s) => !s.yiqilgan).map((s, i) => ({ nom: 'server', band: s.band, i })),
    { nom: 'db', band: m.db.band },
    ...m.replikalar.map((r, i) => ({ nom: 'replika', band: r.band, i })),
    { nom: 'kesh', band: m.kesh.band },
  ]
  return list.sort((a, b) => b.band - a.band)[0]
}
