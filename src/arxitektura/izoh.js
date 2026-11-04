// Yangi boshlovchi uchun: tanishtiruv qadamlari va sxemadagi har komponentning oddiy tildagi izohi
// (hozirgi raqamlar bilan). Atamalar birinchi uchraganda oddiy so'z bilan tushuntiriladi.
import { TAXMIN } from './model.js'

const son = (n) => Math.round(n).toLocaleString('uz')
const foiz = (b) => `${Math.round(b * 100)}%`

export const TANISHTIRUV = [
  {
    ikon: '👋',
    sarlavha: 'Bu nima?',
    matn: [
      'Bu — veb-sayt orqasidagi tizimning soddalashtirilgan modeli. Foydalanuvchilar so‘rov yuboradi (sahifa ochadi, qidiradi), tizim javob beradi.',
      'Maqsad oddiy: hamma tez javob olsin va hech kim xato ko‘rmasin. Yuk oshganda buni qanday saqlashni shu yerda sinab ko‘rasiz.',
    ],
  },
  {
    nishon: '[data-t="foyd"]',
    ikon: '👥',
    sarlavha: 'Foydalanuvchilar',
    matn: 'Chiziqlar bo‘ylab yuguradigan nuqtalar — so‘rovlar oqimi. Hozir sekundiga 1 000 ta so‘rov kelyapti: nuqtalar qancha zich bo‘lsa, so‘rov shuncha ko‘p.',
  },
  {
    nishon: '[data-t="server"]',
    ikon: '🖥️',
    sarlavha: 'Server',
    matn: [
      `So‘rovni bajaradigan kompyuter. Bittasi sekundiga ${TAXMIN.server.sigim} tagacha so‘rovga ulguradi.`,
      'Pastidagi chiziq — qanchalik bandligi: yashil — bemalol, sariq — chegaraga yaqin, qizil 🔥 — ulgurmayapti, so‘rovlar navbatda kutib qoladi.',
    ],
  },
  {
    nishon: '[data-t="lb"]',
    ikon: '🔀',
    sarlavha: 'Load balancer (yuk taqsimlovchi)',
    matn: 'Navbatchi kabi: kelgan so‘rovlarni serverlar orasida teng bo‘lib beradi. Usiz hamma so‘rov bitta serverga tushardi — qolganlari bekor turardi.',
  },
  {
    nishon: '[data-t="db"]',
    ikon: '🗄️',
    sarlavha: 'Baza',
    matn: 'Ma’lumot saqlanadigan joy: foydalanuvchilar, mahsulotlar, buyurtmalar. Deyarli har so‘rov bazadan nimadir o‘qiydi yoki yozadi — shuning uchun u ham tiqilib qolishi mumkin.',
  },
  {
    nishon: '[data-t="metrik"]',
    ikon: '📊',
    sarlavha: 'Natija qanday o‘lchanadi',
    matn: [
      '«Javob vaqti (p95)» — 100 kishidan 95 tasi shu vaqtdan tezroq javob oladi. Taxminan 300 ms gacha — yaxshi, sekundlar — sekin.',
      '«Xatolar» — javob ololmaganlar ulushi. Bu 0% bo‘lishi kerak.',
    ],
  },
  {
    nishon: '[data-t="chooqi"]',
    ikon: '🔥',
    sarlavha: 'Endi o‘zingiz sinab ko‘ring',
    matn: 'Kechqurun hamma saytga kirdi, foydalanuvchilar 3 barobar ko‘paydi. Nima bo‘lishini ko‘raylik.',
    vazifa: '«Cho‘qqi vaqti ×3» tugmasini bosing',
    shart: (h) => h.c.oqim >= 2500,
  },
  {
    nishon: '[data-t="sxema"]',
    ikon: '😮',
    sarlavha: 'Serverlar ulgurmayapti',
    matn: 'Serverlar qizarib, «tiqilib qoldi» deb yozildi: har biriga sig‘imidan ko‘p so‘rov kelyapti. Ortiqchasi navbatda kutadi, 3 soniyadan keyin esa xato bilan tugaydi — yuqorida xatolar o‘sganini ko‘rasiz.',
  },
  {
    nishon: '[data-t="server-qosh"]',
    ikon: '➕',
    sarlavha: 'Yechim: yana serverlar',
    matn: 'Yukni ko‘proq server o‘rtasida bo‘lish mumkin — load balancer yangi serverlarga ham o‘zi taqsimlaydi.',
    vazifa: '«+ Server» ni bir necha marta bosing — qizil yo‘qolib, javob vaqti tushguncha',
    // navbat bo'shashi bir necha soniya oladi — o'quvchi tiklanishni ko'rsin
    shart: (h) => h.m.xato < 0.01 && h.m.p95 < 600 && h.c.oqim >= 2500,
  },
  {
    nishon: '[data-t="hikoya"]',
    ikon: '💬',
    sarlavha: '«Nima bo‘ldi?»',
    matn: 'Har o‘zgarishdan keyin shu yerda oddiy tilda yoziladi: yuk qanday taqsimlandi, eng zaif joy qayer va keyin nima qilish mumkin.',
  },
  {
    ikon: '🎉',
    sarlavha: 'Barakalla!',
    matn: [
      'Siz hozir gorizontal masshtabni qildingiz: kuchliroq server o‘rniga ko‘proq bir xil server qo‘shdingiz.',
      'Sxemadagi istalgan qutiga sichqonchani olib boring — u nima ekani ostida yoziladi. Keyin yuqoridagi «Mashq» ro‘yxatidan boshlang: har biri bitta g‘oyani o‘rgatadi.',
    ],
  },
]

// sxemadagi qutiga sichqoncha kelganda: nima bu va hozir qanchalik band
export function komponentIzohi(id, c, m) {
  if (!id || !m) return null
  if (id === 'foyd') return `👥 Foydalanuvchilar sekundiga ${son(c.oqim)} ta so‘rov yuboryapti (sahifa ochish, qidirish…). Ulardan ${foiz(c.oqishUlushi)} — faqat o‘qish, ${foiz(c.statikUlushi)} — rasm, CSS kabi o‘zgarmas fayllar.`
  if (id === 'cdn') return `🌍 CDN — dunyo bo‘ylab tarqalgan serverlar: o‘zgarmas fayllarni foydalanuvchiga yaqin joydan beradi. Hozir ${son(m.cdn.oqim)} so‘rov/s ni o‘zi berdi — ular bizning serverlarga yetib bormadi.`
  if (id === 'lb') return `🔀 Load balancer — navbatchi: so‘rovlarni ishlayotgan serverlarga teng bo‘ladi (hozir har biriga ≈ ${son(m.lb.oqim / Math.max(1, c.serverlar.filter(Boolean).length))} /s). Yiqilgan serverga so‘rov yubormaydi.`
  if (id === 'db') return `🗄️ Asosiy baza — ma’lumotlar saqlanadigan joy, hamma yozish shu yerga. Hozir ${son(m.db.oqim)} so‘rov/s, sig‘imi ${son(TAXMIN.db.sigim)} → ${foiz(m.db.band)} band.${m.db.band >= 1 ? ' Ulgurmayapti — so‘rovlar navbatda kutib qolyapti.' : ''}`
  if (id === 'kesh') return `⚡ Kesh — tez-tez so‘raladigan ma’lumotning xotiradagi nusxasi: bazaga borish o‘rniga ~${TAXMIN.kesh.vaqt} ms da javob. Hozir ${son(m.kesh.hit)} so‘rov/s keshdan topildi va bazaga bormadi.`
  if (id.startsWith('r')) {
    const r = m.replikalar[+id.slice(1)]
    return `📚 Replika — bazaning nusxasi: faqat o‘qish so‘rovlarini oladi va asosiy bazani yengillatadi. Hozir ${son(r?.oqim ?? 0)} so‘rov/s → ${foiz(r?.band ?? 0)} band. Yozish unga emas, asosiy bazaga boradi.`
  }
  if (id.startsWith('s')) {
    const i = +id.slice(1)
    const s = m.serverlar[i]
    if (!c.serverlar[i]) return `🖥️ Server ${i + 1} yiqilgan — so‘rov qabul qilmaydi. Bosing — tiklanadi.`
    return `🖥️ Server ${i + 1} — so‘rovni bajaradigan kompyuter. Hozir sekundiga ${son(s?.oqim ?? 0)} ta keladi, ulguradigani ${TAXMIN.server.sigim} ta → ${foiz(s?.band ?? 0)} band.${(s?.band ?? 0) >= 1 ? ' Ulgurmayapti: ortiqchasi navbatda kutadi, 3 soniyadan keyin xato bo‘ladi.' : ''} Bosing — yiqiladi (server buzilsa nima bo‘lishini ko‘rasiz).`
  }
  return null
}
