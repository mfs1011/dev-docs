// Tizim dizayni simulyatori mashqlari. Qadam `check(s)` — s.c (sozlama), s.m (joriy ko'rsatkichlar, barqaror
// bo'lishi uchun 2 soniya ushlab turilgan), s.tanlangan (bosilgan komponent). `yechim` — sozlamaga qo'llanadigan
// o'zgarish («Yordam» tugmasi va test uchun). Model taxminiy (model.js).
import { BOSHLANGICH } from './model.js'

const sozla = (o) => ({ ...BOSHLANGICH, ...o, serverlar: o.serverlar ?? BOSHLANGICH.serverlar })
const tirik = (c) => c.serverlar.filter(Boolean).length
const maqsad = (s, p95) => s.m.xato < 0.01 && s.m.p95 < p95

export const MASHQLAR = [
  {
    id: 'arx-gorizontal',
    title: 'Gorizontal masshtab va load balancer',
    bob: '/arxitektura/91-gorizontal-masshtab',
    intro: 'Bitta server sekundiga 1 500 so‘rovni ko‘tara olmayapti — xatolarning ko‘pi. Server qo‘shamiz va yukni ular orasida bo‘lamiz.',
    sozlama: sozla({ oqim: 1500, serverlar: [true], lb: false }),
    manba: ['/arxitektura/92-load-balancing'],
    steps: [
      {
        text: '«+ Server» bilan serverlar sonini 3 taga yetkazing. Xatolar kamaydimi?',
        yechim: { serverlar: [true, true, true] },
        check: (s) => s.c.serverlar.length >= 3 && !s.c.lb && s.m.xato > 0.5,
        natija: 'Kamaymadi: foydalanuvchilar faqat Server 1 manzilini biladi. Yangi serverlar bo‘sh turibdi — ularga yukni kimdir taqsimlashi kerak.',
      },
      {
        text: '«Load balancer» ni yoqing.',
        yechim: { lb: true },
        check: (s) => s.c.lb && tirik(s.c) >= 3,
        natija: 'Endi yuk teng bo‘lindi: har serverga ≈ 500 so‘rov/s. Lekin bitta server sig‘imi 400 — hali ham tiqilib qolishi mumkin.',
      },
      {
        text: 'Server qo‘shib, xatoni 1% dan, p95 ni 300 ms dan pastga tushiring.',
        yechim: { serverlar: Array(6).fill(true) },
        check: (s) => s.c.lb && maqsad(s, 300),
        natija: 'Bu — gorizontal masshtab: kuchliroq server emas, ko‘proq bir xil server. Sharti — server holatni o‘zida saqlamasligi (stateless): so‘rov qaysi serverga tushishidan qat’i nazar bir xil javob.',
      },
    ],
  },
  {
    id: 'arx-kesh',
    title: 'Zaif bo‘g‘in: baza va kesh',
    bob: '/arxitektura/25-kesh',
    intro: '12 ta server bor, lekin baribir xatolar. Muammo serverlarda emas — qayerda ekanini topib, tuzatamiz.',
    sozlama: sozla({ oqim: 4000, serverlar: Array(12).fill(true) }),
    manba: ['/arxitektura/90-tizim-dizayni-jarayoni'],
    steps: [
      {
        text: 'Sxemada qizil (🔥) komponentni toping va uni bosing.',
        yechim: { tanla: 'db' },
        check: (s) => s.tanlangan === 'db',
        natija: 'Baza 120% band: har so‘rov bazaga boradi, baza esa sekundiga 2 000 tadan ortig‘ini ko‘tarmaydi. Server qo‘shish yordam bermaydi — ular bazaga yanada ko‘p so‘rov yuboradi.',
      },
      {
        text: '«Kesh» ni yoqing (so‘rovlarning 90% i o‘qish — ularning ko‘pi keshdan javob oladi).',
        yechim: { kesh: true },
        check: (s) => s.c.kesh && maqsad(s, 500),
        natija: 'Kesh xotirada turadi: ~1 ms (bazada ~8 ms va navbat). O‘qishlarning 80% i bazaga yetib bormaydi — baza bandligi uch barobar kamaydi.',
      },
    ],
  },
  {
    id: 'arx-replika',
    title: 'O‘qish uchun replikalar',
    bob: '/arxitektura/94-replikatsiya',
    intro: 'Yana baza tiqilyapti, lekin bu safar keshsiz yechamiz: bazaning nusxalari (replika) o‘qishni o‘zaro bo‘lishadi.',
    sozlama: sozla({ oqim: 4000, serverlar: Array(12).fill(true) }),
    manba: ['/arxitektura/94-replikatsiya'],
    steps: [
      {
        text: '«+ Replika» bilan replika qo‘shing — keshni yoqmasdan xatoni 1% dan, p95 ni 500 ms dan pastga tushiring.',
        yechim: { replikalar: 2 },
        check: (s) => !s.c.kesh && s.c.replikalar >= 1 && maqsad(s, 500),
        natija: 'O‘qishlar asosiy baza va replikalar orasida bo‘lindi, yozish esa faqat asosiyga boradi. Narxi: replika biroz kechikadi — yozilgan narsa replikada darhol ko‘rinmasligi mumkin (94-bob, «o‘z yozuvini ko‘rish»).',
      },
      {
        text: 'Endi «O‘qish ulushi» ni 30% ga tushiring (yozish ko‘paydi). Replikalar hali yordam beryaptimi?',
        yechim: { oqishUlushi: 0.3 },
        check: (s) => s.c.oqishUlushi <= 0.3 && s.m.db.band >= 0.9,
        natija: 'Yo‘q: replika faqat o‘qishni oladi, hamma yozish baribir bitta asosiy bazaga tushadi. Yozish ko‘p bo‘lsa — bazani bo‘lish (sharding, 95-bob) kerak.',
      },
    ],
  },
  {
    id: 'arx-cdn',
    title: 'CDN: statik fayllarni yaqindan berish',
    bob: '/arxitektura/93-cdn',
    intro: 'So‘rovlarning 40% i — rasm, CSS, JS kabi o‘zgarmas fayllar. Ularni serverlarimiz emas, CDN bersa-chi?',
    sozlama: sozla({ oqim: 3000, serverlar: [true, true, true] }),
    manba: ['/arxitektura/93-cdn'],
    steps: [
      {
        text: '«CDN» ni yoqing va serverlar 6 tadan oshmasin — xato 1% dan, p95 400 ms dan past bo‘lsin.',
        yechim: { cdn: true, serverlar: Array(6).fill(true) },
        check: (s) => s.c.cdn && s.c.serverlar.length <= 6 && maqsad(s, 400),
        natija: 'CDN statik fayllarni foydalanuvchiga yaqin joydan beradi — ular serverlarimizga yetib bormaydi. CDN’siz shu natija uchun ~10 ta server kerak bo‘lardi.',
      },
    ],
  },
  {
    id: 'arx-ishonchlilik',
    title: 'Server yiqilsa-chi? (N+1)',
    bob: '/arxitektura/92-load-balancing',
    intro: 'Hamma narsa yaxshi ishlayapti. Lekin serverlar ba’zan yiqiladi — tizim bunga tayyormi?',
    sozlama: sozla({ oqim: 1000, serverlar: [true, true, true] }),
    manba: ['/arxitektura/92-load-balancing'],
    steps: [
      {
        text: 'Sxemada istalgan serverni bosing — u yiqiladi. Nima bo‘ldi?',
        yechim: { serverlar: [false, true, true] },
        check: (s) => tirik(s.c) < s.c.serverlar.length && s.m.xato > 0.05,
        natija: 'Load balancer yiqilgan serverga so‘rov yubormay qo‘ydi (health check), lekin qolgan ikkitasining sig‘imi yetmaydi — 125% band, xatolar boshlandi.',
      },
      {
        text: 'Bitta server yiqilgan holatda ham xato bo‘lmasligi uchun zaxira server qo‘shing.',
        yechim: { serverlar: [false, true, true, true] },
        check: (s) => tirik(s.c) < s.c.serverlar.length && tirik(s.c) >= 3 && maqsad(s, 500),
        natija: 'Bu — N+1 tamoyili: kerakli sig‘imdan bitta ortiqcha server. Bittasi yiqilsa yoki yangilanish uchun o‘chirilsa ham, foydalanuvchi buni sezmaydi.',
      },
    ],
  },
]

export const ERKIN = [{ id: '', title: 'Erkin rejim', note: '1 000 so‘rov/s, 3 server — o‘zingiz sinab ko‘ring' }]
export const findMashq = (id) => MASHQLAR.find((m) => m.id === id) ?? null
