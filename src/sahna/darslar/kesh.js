// "Kesh" — tizim dizayni darsi. Hamma raqamlar VPS laboratoriyasidagi haqiqiy o'lchovdan (tizim-lab/olchov-kesh.sh →
// src/sahna/tizim/olchovlar/kesh/*): do'kon ilovasi (tizim-lab/dokon), PostgreSQL 18 va Redis 8. Mahsulot kartochkasi —
// ataylab og'ir so'rov (indekssiz, 500 000 sharhdan o'rtacha baho). Ilova o'z hisoblagichlarini beradi: DB, hit, miss.
// docs/vizualizator/tizim-dizayni.md 2 (2-modul)
import keshsizY from '../tizim/olchovlar/kesh/keshsiz.yuk.json'
import keshsizS from '../tizim/olchovlar/kesh/keshsiz.stat.json'
import asideY from '../tizim/olchovlar/kesh/cache-aside.yuk.json'
import asideS from '../tizim/olchovlar/kesh/cache-aside.stat.json'
import qulfsizY from '../tizim/olchovlar/kesh/boron-qulfsiz.yuk.json'
import qulfsizS from '../tizim/olchovlar/kesh/boron-qulfsiz.stat.json'
import qulfY from '../tizim/olchovlar/kesh/boron-qulf.yuk.json'
import qulfS from '../tizim/olchovlar/kesh/boron-qulf.stat.json'
import inv from '../tizim/olchovlar/kesh/invalidatsiya.json'
import explain from '../tizim/olchovlar/kesh/explain.json'
import versiyalar from '../tizim/olchovlar/kesh/versiyalar.txt?raw'

const ms = (v) => (v == null ? '—' : v >= 1000 ? `${(v / 1000).toFixed(1)} s` : `${Math.round(v)} ms`)
const holatMs = (v) => (v == null ? 'neytral' : v < 100 ? 'ok' : v < 500 ? 'ogoh' : 'xato')
const xato = (y) => y.sorovlar - (y.kodlar['200'] ?? 0)
const hitFoiz = (s) => Math.round((100 * s.hit) / Math.max(1, s.hit + s.miss))
const m = (y, s) => ({
  p95: { v: y.p95, holat: holatMs(y.p95), manba: 'olchangan' },
  db: { v: `${s.db}`, holat: s.db > 100 ? 'xato' : s.db > 20 ? 'ogoh' : 'ok', manba: 'olchangan' },
  hit: { v: s.kesh ? `${hitFoiz(s)}%` : '—', holat: s.kesh ? (hitFoiz(s) > 80 ? 'ok' : 'ogoh') : 'neytral', manba: 'olchangan' },
  xato: { v: `${xato(y)}`, holat: xato(y) ? 'xato' : 'ok', manba: 'olchangan' },
})
const plan = explain[0]
const sorovMs = Math.round(plan['Execution Time'])

export default {
  id: 'kesh',
  tur: 'tizim',
  sarlavha: 'Kesh',
  shior: 'Qimmat natijani bir marta hisoblab, Redis’dan berish — va buning narxi: eskirish va bo‘ron.',
  daraja: 'o‘rta',
  daqiqa: 9,
  kitob: [
    { yol: '/arxitektura/25-kesh', nom: 'Arxitektura, 25-bob: Kesh strategiyalari' },
  ],
  manba: [
    { nom: 'Redis — SET (EX, NX)', url: 'https://redis.io/docs/latest/commands/set/' },
    { nom: 'PostgreSQL 18 — EXPLAIN', url: 'https://www.postgresql.org/docs/18/sql-explain.html' },
  ],
  sinov: `O‘lchov: VPS laboratoriyasi (tizim-lab/, profil \`kesh\`), ${versiyalar.trim().split('\n').join(' · ')}. Do‘kon ilovasi ko‘p oqimli (Python ThreadingHTTPServer). Mahsulot kartochkasi so‘rovi ataylab og‘ir: \`sharh.mahsulot_id\` da indeks yo‘q, 500 000 qatordan o‘rtacha baho — EXPLAIN ANALYZE: ${sorovMs} ms. Yuklama ochiq tsiklli, 20 ta mashhur mahsulot navbat bilan.`,
  trenajor: { yol: '/arxitektura/trenajor', nom: 'Simulyatorda o‘zingiz sinang' },
  organasiz: [
    { matn: 'Cache-aside: o‘qishda keshlash', qadam: 2 },
    { matn: 'Invalidatsiyasiz kesh eski qiymat beradi', qadam: 3 },
    { matn: 'Kesh bo‘roni va qulf bilan himoya', qadam: 5 },
  ],
  metrikaRoyxat: [
    { k: 'p95', nom: 'p95 javob vaqti', format: ms },
    { k: 'db', nom: 'DB so‘rovlari' },
    { k: 'hit', nom: 'Keshdan (hit)' },
    { k: 'xato', nom: 'Xatolar' },
  ],
  metrikaManba: { olchangan: 'VPS laboratoriyasida o‘lchangan (tizim-lab/olchov-kesh.sh)' },
  afsona: [{ k: 'sorov', nom: 'so‘rov' }, { k: 'ogir', nom: 'DB so‘rovi' }, { k: 'xato', nom: 'xato' }],
  tugunlar: {
    users: { ikonka: 'foydalanuvchilar', nom: 'Foydalanuvchilar', izoh: 'yuklama skripti', x: 60, y: 330 },
    app: { ikonka: 'server', nom: 'Ilova', izoh: 'do‘kon', x: 420, y: 330 },
    redis: { ikonka: 'kesh', nom: 'Redis', izoh: 'kesh · 8.10', x: 800, y: 120 },
    pg: { ikonka: 'baza', nom: 'PostgreSQL', izoh: `so‘rov ~${sorovMs} ms`, x: 800, y: 540 },
  },
  chiziqlar: [['users', 'app'], ['app', 'redis'], ['app', 'pg']],
  qadamlar: [
    {
      qisqa: 'Keshsiz', nishon: 'muammo',
      sarlavha: 'Har so‘rov — bazaga',
      matn: [
        `Mahsulot kartochkasi og‘ir so‘rov: 500 000 sharhdan o‘rtacha baho, indekssiz — **${sorovMs} ms** (EXPLAIN ANALYZE). Bitta vCPU’da baza sekundiga ko‘pi bilan ~${Math.floor(1000 / sorovMs)} ta shunday so‘rovga ulguradi.`,
        `Foydalanuvchilar sekundiga ${keshsizY.tezlik} ta so‘rov yuboryapti — 20 ta mashhur mahsulot. Har so‘rov bazaga: **${keshsizS.db}** ta DB so‘rovi, p50 **${ms(keshsizY.p50)}**, p95 **${ms(keshsizY.p95)}**. Baza to‘yinish chegarasida, so‘rovlar navbatda kutyapti.`,
      ],
      callout: { tur: 'goya', matn: 'Kitob qoidasi: avval o‘lchang. Arzon so‘rovni (indeksli, 1 ms) keshlash murakkablikka arzimaydi (25-bob). Bu yerda so‘rov qimmat — kesh o‘rinli.' },
      ozgardi: [`~ ${keshsizY.tezlik} so‘rov/s`, `~ har biri DB’ga (${sorovMs} ms)`],
      korinadi: ['users', 'app', 'pg'],
      chiziqlar: [['users', 'app'], ['app', 'pg']],
      metrikalar: m(keshsizY, keshsizS),
      teglar: { pg: { band: 0.9, matn: 'band', rang: 'xato' } },
      oqimlar: [{ chiziq: ['users', 'app'], tezlik: 2 }, { chiziq: ['app', 'pg'], tezlik: 2, naqsh: ['ogir'] }],
    },
    {
      qisqa: 'Cache-aside', nishon: 'texnika',
      sarlavha: 'Cache-aside: avval Redis, topilmasa — baza',
      matn: [
        'Ilova avval Redis’dan so‘raydi (`GET mahsulot:v1:<id>`). Bor bo‘lsa — darhol javob (**hit**). Yo‘q bo‘lsa (**miss**) — bazadan hisoblaydi va natijani TTL bilan Redis’ga yozadi (`SET … EX 60`).',
        `Xuddi o‘sha yuklama: DB so‘rovlari **${keshsizS.db} → ${asideS.db}** — har mahsulotga bittadan, birinchi marta. Keshdan: ${asideS.hit} ta (${hitFoiz(asideS)}%). p50 **${ms(keshsizY.p50)} → ${ms(asideY.p50)}**; p95 ${ms(asideY.p95)} — bu o‘sha 20 ta birinchi (sovuq) so‘rov.`,
      ],
      callout: { tur: 'maslahat', matn: 'Kalitda versiya (`v1`): ma’lumot shakli o‘zgarsa, eski format keshdan o‘qilmasin. Kalitda barcha o‘zgaruvchilar bo‘lsin — til, valyuta, foydalanuvchi guruhi (25-bob).' },
      ozgardi: ['+ Redis (cache-aside, TTL 60 s)', `~ DB: ${keshsizS.db} → ${asideS.db}`],
      korinadi: ['users', 'app', 'redis', 'pg'],
      metrikalar: m(asideY, asideS),
      teglar: { redis: { matn: `hit ${hitFoiz(asideS)}%`, rang: 'ok' }, pg: { band: 0.1, matn: `${asideS.db} so‘rov`, rang: 'ok' } },
      oqimlar: [{ chiziq: ['users', 'app'], tezlik: 2 }, { chiziq: ['app', 'redis'], tezlik: 2 }, { chiziq: ['app', 'pg'], tezlik: 0.3, naqsh: ['ogir'] }],
    },
    {
      qisqa: 'Eskirdi', nishon: 'muammo',
      sarlavha: 'Narx o‘zgardi — kesh bilmadi',
      matn: [
        `1-mahsulot narxi bazada **${inv.oldin} → ${inv.db_invalidsiz}** ga o‘zgartirildi, kesh kaliti esa tegilmadi. Bazadan to‘g‘ridan-to‘g‘ri: ${inv.db_invalidsiz}. Kartochka (keshdan): **${inv.kesh_invalidsiz}** — eski narx.`,
        'TTL 60 soniya — demak bir daqiqagacha har foydalanuvchi eski narxni ko‘radi. Kesh tezlik beradi, evaziga izchillikni oladi: har kesh qarori — “qancha eskirish qabul qilinadi?” (25-bob).',
      ],
      callout: { tur: 'ogoh', matn: 'Tipik xato: faqat TTL, invalidatsiyasiz — narx o‘zgargandan keyin TTL davomida eski. To‘g‘risi: hodisa + TTL (25-bob).' },
      faktlar: [['Bazada', `${inv.db_invalidsiz}`], ['Kartochkada', `${inv.kesh_invalidsiz}`], ['TTL', '60 s']],
      korinadi: ['users', 'app', 'redis', 'pg'],
      metrikalar: m(asideY, asideS),
      teglar: { redis: { matn: `eski: ${inv.kesh_invalidsiz}`, rang: 'xato' }, pg: { matn: `yangi: ${inv.db_invalidsiz}`, rang: 'ok' } },
      oqimlar: [{ chiziq: ['users', 'app'], tezlik: 1 }, { chiziq: ['app', 'redis'], tezlik: 1 }],
    },
    {
      qisqa: 'Invalidatsiya', nishon: 'texnika',
      sarlavha: 'Yozishda kalitni o‘chirish',
      matn: [
        `Endi narx o‘zgarganda ilova kalitni ham o‘chiradi (\`DEL mahsulot:v1:1\`). Narx **${inv.db_invalid}** — keyingi so‘rov miss bo‘lib, bazadan yangisini oldi: kartochkada **${inv.kesh_invalid}**.`,
        'Amalda — TTL + hodisa: hodisa asosiy mexanizm, TTL esa hodisa yo‘qolsa ham abadiy eski qolmaslik uchun “xavfsizlik to‘ri” (25-bob).',
      ],
      callout: { tur: 'maslahat', matn: 'Boshqa yo‘llar: versiyali kalit (`product:{id}:{updated_at}`) — eski kalit o‘z-o‘zidan ishlatilmaydi; teglar — bog‘liq yozuvlarni guruhlab o‘chirish (25-bob).' },
      faktlar: [['Bazada', `${inv.db_invalid}`], ['Kartochkada', `${inv.kesh_invalid}`], ['Usul', 'DEL + TTL']],
      korinadi: ['users', 'app', 'redis', 'pg'],
      metrikalar: m(asideY, asideS),
      teglar: { redis: { matn: `yangi: ${inv.kesh_invalid}`, rang: 'ok' }, pg: { matn: `${inv.db_invalid}`, rang: 'ok' } },
      oqimlar: [{ chiziq: ['app', 'redis'], tezlik: 1, naqsh: ['xato'] }, { chiziq: ['app', 'pg'], tezlik: 0.5, naqsh: ['ogir'] }],
    },
    {
      qisqa: 'Bo‘ron', nishon: 'muammo',
      sarlavha: 'Kesh bo‘roni: mashhur kalit eskirdi',
      matn: [
        `Endi bitta juda mashhur mahsulot — sekundiga **${qulfsizY.tezlik}** ta so‘rov, TTL 2 s. Kalit eskirgan lahzada barcha so‘rovlar miss bo‘ladi va har biri bazaga boradi: ${qulfsizY.soniya} soniyada **${qulfsizS.db}** ta og‘ir so‘rov.`,
        `Baza tiqildi: p95 **${ms(qulfsizY.p95)}**, **${xato(qulfsizY)}** ta so‘rov vaqt chegarasida javobsiz qoldi. Kesh bor, lekin aynan kerak paytda yordam bermadi.`,
      ],
      callout: { tur: 'ogoh', matn: '“Mashhur kalit TTL bilan eskirdi → 1000 ta so‘rov bir vaqtda keshda topmadi → 1000 ta DB so‘rov → DB yiqiladi” (25-bob).' },
      ozgardi: [`~ 1 kalit, ${qulfsizY.tezlik} so‘rov/s, TTL 2 s`, `~ DB: ${qulfsizS.db}`],
      korinadi: ['users', 'app', 'redis', 'pg'],
      metrikalar: m(qulfsizY, qulfsizS),
      teglar: { pg: { band: 1, matn: `${qulfsizS.db} so‘rov`, rang: 'xato' }, redis: { matn: 'miss!', rang: 'xato' } },
      oqimlar: [{ chiziq: ['users', 'app'], tezlik: 8 }, { chiziq: ['app', 'redis'], tezlik: 4 }, { chiziq: ['app', 'pg'], tezlik: 6, naqsh: ['ogir', 'xato'] }],
    },
    {
      qisqa: 'Qulf', nishon: 'texnika',
      sarlavha: 'Qulf: bittasi hisoblaydi, qolganlari kutadi',
      matn: [
        'Miss bo‘lganda ilova avval Redis’da qulf oladi: `SET mahsulot:v1:1:qulf 1 NX EX 5`. Kim olgan bo‘lsa — bazaga boradi; qolganlari 20 ms oraliq bilan keshda qiymat paydo bo‘lishini kutadi.',
        `Xuddi o‘sha bo‘ron: DB so‘rovlari **${qulfsizS.db} → ${qulfS.db}** (har eskirishda bittadan), kutganlar ${qulfS.kutdi} ta. p95 **${ms(qulfsizY.p95)} → ${ms(qulfY.p95)}**, xatolar **${xato(qulfsizY)} → ${xato(qulfY)}**.`,
      ],
      callout: { tur: 'maslahat', matn: 'Boshqa himoyalar: stale-while-revalidate (eskisini qaytarib, fonda yangilash), TTL’ga tasodifiy jitter, oldindan isitish (25-bob).' },
      ozgardi: ['+ qulf (SET NX)', `~ DB: ${qulfsizS.db} → ${qulfS.db}`, `~ xatolar: ${xato(qulfsizY)} → ${xato(qulfY)}`],
      korinadi: ['users', 'app', 'redis', 'pg'],
      metrikalar: m(qulfY, qulfS),
      teglar: { redis: { matn: 'qulf · kutish', rang: 'insight' }, pg: { band: 0.1, matn: `${qulfS.db} so‘rov`, rang: 'ok' } },
      oqimlar: [{ chiziq: ['users', 'app'], tezlik: 8 }, { chiziq: ['app', 'redis'], tezlik: 8 }, { chiziq: ['app', 'pg'], tezlik: 0.4, naqsh: ['ogir'] }],
    },
    {
      qisqa: 'Xulosa', nishon: 'xulosa',
      sarlavha: 'Nimalarni ko‘rdik',
      matn: [
        `Kesh og‘ir so‘rovni ${keshsizS.db} martadan ${asideS.db} martaga tushirdi. Evaziga — eskirish (invalidatsiya kerak) va bo‘ron xavfi (qulf kerak).`,
        'Kesh — faqat nusxa: Redis tozalansa ham ma’lumot bazada qoladi. Foydalanuvchiga xos yoki ruxsatga bog‘liq javobni umumiy kalit bilan keshlamang (25-bob).',
      ],
      callout: { tur: 'goya', matn: 'Bu darsdagi so‘rov ataylab indekssiz. Ko‘pincha birinchi qadam — indeks (SQL kitobi), kesh esa undan keyin.' },
      korinadi: ['users', 'app', 'redis', 'pg'],
      metrikalar: m(qulfY, qulfS),
      teglar: {},
      kartalar: [{
        sarlavha: 'O‘lchangan',
        qatorlar: [
          ['keshsiz', `DB ${keshsizS.db} · p95 ${ms(keshsizY.p95)}`],
          ['cache-aside', `DB ${asideS.db} · p50 ${ms(asideY.p50)}`],
          ['bo‘ron, qulfsiz', `DB ${qulfsizS.db} · xato ${xato(qulfsizY)}`],
          ['bo‘ron, qulf', `DB ${qulfS.db} · xato ${xato(qulfY)}`, true],
        ],
        joy: 'yuqori-chap',
      }],
      oqimlar: [{ chiziq: ['users', 'app'], tezlik: 2 }, { chiziq: ['app', 'redis'], tezlik: 2 }],
    },
  ],
}
