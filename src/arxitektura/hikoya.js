// Simulyator hikoyasi: o'quvchi nimani o'zgartirdi → yuk qanday taqsimlandi → eng zaif bo'g'in → natija
// (javob vaqti, xatolar) → keyingi qadam uchun maslahat. Barqaror holat model bilan oldindan hisoblanadi.
import { TAXMIN, barqaror, zaifBogin } from './model.js'

const c = (s) => `\`${s}\``
const f = (b) => `${Math.round(b * 100)}%`
const son = (n) => Math.round(n).toLocaleString('uz')

export function ozgarish(eski, yangi) {
  if (!eski) return { ikon: '🚀', sarlavha: 'Simulyator ishga tushdi' }
  if (eski.oqim !== yangi.oqim) return { ikon: '👥', sarlavha: `Foydalanuvchilar oqimi: ${son(eski.oqim)} → ${son(yangi.oqim)} so‘rov/s` }
  const ts = (c) => c.serverlar.filter(Boolean).length
  if (eski.serverlar.length !== yangi.serverlar.length) return { ikon: '🖥️', sarlavha: `Serverlar soni: ${eski.serverlar.length} → ${yangi.serverlar.length}` }
  if (ts(eski) !== ts(yangi)) {
    const i = yangi.serverlar.findIndex((x, k) => x !== eski.serverlar[k])
    return yangi.serverlar[i] ? { ikon: '🛠️', sarlavha: `Server ${i + 1} tiklandi` } : { ikon: '💥', sarlavha: `Server ${i + 1} yiqildi`, matn: 'Masalan: xotira tugadi, disk buzildi yoki yangilanish paytida o‘chirildi.' }
  }
  if (eski.lb !== yangi.lb) return { ikon: '🔀', sarlavha: yangi.lb ? 'Load balancer yoqildi' : 'Load balancer o‘chirildi' }
  if (eski.kesh !== yangi.kesh) return { ikon: '⚡', sarlavha: yangi.kesh ? 'Kesh yoqildi' : 'Kesh o‘chirildi' }
  if (eski.keshHit !== yangi.keshHit) return { ikon: '⚡', sarlavha: `Keshda topilish: ${f(eski.keshHit)} → ${f(yangi.keshHit)}` }
  if (eski.replikalar !== yangi.replikalar) return { ikon: '📚', sarlavha: `Replikalar: ${eski.replikalar} → ${yangi.replikalar}` }
  if (eski.cdn !== yangi.cdn) return { ikon: '🌍', sarlavha: yangi.cdn ? 'CDN yoqildi' : 'CDN o‘chirildi' }
  if (eski.oqishUlushi !== yangi.oqishUlushi) return { ikon: '📖', sarlavha: `O‘qish ulushi: ${f(eski.oqishUlushi)} → ${f(yangi.oqishUlushi)}` }
  if (eski.statikUlushi !== yangi.statikUlushi) return { ikon: '🖼️', sarlavha: `Statik fayllar ulushi: ${f(eski.statikUlushi)} → ${f(yangi.statikUlushi)}` }
  return null
}

function taqsimot(c, m) {
  const qadamlar = []
  const tirik = c.serverlar.filter(Boolean).length
  if (c.cdn) qadamlar.push({ ikon: '🌍', sarlavha: `CDN statik fayllarni o‘zi berdi: ${son(m.cdn.oqim)} so‘rov/s`, matn: 'Rasm, CSS, JS foydalanuvchiga yaqin serverdan keladi — bizning serverlarga yetib bormaydi.' })
  if (!c.lb && c.serverlar.length > 1) {
    qadamlar.push({ ikon: '🚧', sarlavha: 'Load balancer yo‘q — hamma so‘rov Server 1 ga boradi', matn: `Qolgan ${c.serverlar.length - 1} ta server bo‘sh turibdi: foydalanuvchilar ularning manzilini bilmaydi.`, ogoh: true })
  } else if (c.lb) {
    qadamlar.push({ ikon: '🔀', sarlavha: `Load balancer yukni ${tirik} ta ishlayotgan serverga teng bo‘ldi`, matn: `Har biriga ≈ ${son(m.lb.oqim / Math.max(1, tirik))} so‘rov/s (bitta server sig‘imi — ${TAXMIN.server.sigim}).${tirik < c.serverlar.length ? ' Yiqilgan serverga so‘rov yuborilmaydi (health check).' : ''}` })
  }
  if (c.kesh) qadamlar.push({ ikon: '⚡', sarlavha: `Keshdan topildi: ${son(m.kesh.hit)} so‘rov/s`, matn: `Bu o‘qishlar bazaga bormadi — keshdan ~${TAXMIN.kesh.vaqt} ms da javob (bazada ~${TAXMIN.db.vaqt} ms + navbat).` })
  if (c.replikalar) qadamlar.push({ ikon: '📚', sarlavha: `O‘qishlar asosiy baza va ${c.replikalar} ta replika orasida bo‘lindi`, matn: `Yozish faqat asosiy bazaga (${son(m.db.yozish)} /s), o‘qish — har biriga ≈ ${son(m.db.oqish)} /s.` })
  return qadamlar
}

const NOM = { server: 'serverlar', db: 'asosiy baza', replika: 'replikalar', kesh: 'kesh' }
function maslahat(c, m, z) {
  if (m.yolsiz > 0) return 'So‘rovlar ishlayotgan serverga yetib bormayapti — load balancer yoqing yoki serverni tiklang.'
  if (z.band < 0.7) return 'Hamma komponent erkin. Oqimni oshirib, qaysi biri birinchi bo‘lib tiqilishini ko‘ring.'
  if (z.nom === 'server') return !c.lb && c.serverlar.length > 1 ? 'Avval load balancer yoqing — aks holda qo‘shimcha serverlar ishlamaydi.' : `Serverlar band: server qo‘shing (gorizontal masshtab)${!c.cdn && c.statikUlushi > 0.2 ? ' yoki statik fayllarni CDN ga bering' : ''}.`
  if (z.nom === 'db' || z.nom === 'replika') {
    const oqishKop = c.oqishUlushi >= 0.7
    return oqishKop ? 'Baza tiqilyapti, so‘rovlarning ko‘pi — o‘qish: kesh yoqing yoki o‘qish uchun replika qo‘shing.' : 'Baza tiqilyapti va yozish ko‘p — replika yozishga yordam bermaydi; bu holatda bazani bo‘lish (sharding, 95-bob) kerak bo‘ladi.'
  }
  return ''
}

export function hikoya(eski, yangi) {
  const m = barqaror(yangi)
  const out = []
  const o = ozgarish(eski, yangi)
  if (o) out.push(o)
  out.push(...taqsimot(yangi, m))
  const z = zaifBogin(m)
  if (z) {
    const qayer = z.nom === 'server' ? `Server ${z.i + 1}` : z.nom === 'replika' ? `Replika ${z.i + 1}` : NOM[z.nom]
    out.push(z.band >= 1
      ? { ikon: '🔥', sarlavha: `Eng zaif bo‘g‘in — ${qayer}: ${f(z.band)} band`, matn: 'Sig‘imidan ko‘p so‘rov kelyapti: ortiqchasi navbatga yig‘iladi, navbat 3 soniyadan oshsa — so‘rov xato bilan tugaydi.', ogoh: true }
      : { ikon: z.band >= 0.85 ? '⚠️' : '🟢', sarlavha: `Eng band komponent — ${qayer}: ${f(z.band)}`, matn: z.band >= 0.85 ? 'Sig‘im chegarasiga yaqin: kichik o‘sish ham javob vaqtini keskin oshiradi (bandlik 100% ga yaqinlashganda navbat tez o‘sadi).' : '' })
  }
  const yaxshi = m.xato < 0.01 && m.p95 < 500
  out.push({
    ikon: yaxshi ? '✅' : '📉',
    sarlavha: `Natija: p95 ≈ ${son(m.p95)} ms · xatolar ${(m.xato * 100).toFixed(1)}% · bajarildi ${son(m.bajarildi)} /s`,
    matn: 'p95 — 100 ta so‘rovdan 95 tasi shu vaqtdan tezroq javob oladi (o‘rtachadan ko‘ra foydalanuvchi his qiladiganiga yaqinroq, 90-bob).',
    yashil: yaxshi,
    ogoh: !yaxshi,
  })
  const ms = maslahat(yangi, m, z)
  if (ms) out.push({ ikon: '💡', sarlavha: 'Keyingi qadam', matn: ms })
  return out
}
