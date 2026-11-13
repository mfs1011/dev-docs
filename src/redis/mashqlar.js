// Redis trenajori mashqlari. Har qadam Redis'ning HAQIQIY holatiga (kalitlar, INFO, obunachilar) va hodisalariga
// (MONITOR buyruqlari, keyspace bildirishnomalari, Pub/Sub) qarab tekshiriladi. Qadamlarni panel yoki terminaldagi
// redis-cli bilan bajarish mumkin. tekshir(h, j): h — holat, j — jurnal (mashq boshlangandan, eng yangisi boshida).
import { argumentlar, buyruqNomi } from './izohlar.js'

const k = (h, nom) => h.kalitlar.find((x) => x.nom === nom)
const buyruq = (j, nom, f = () => true) => j.some((x) => x.t === 'buyruq' && buyruqNomi(x) === nom && f(argumentlar(x)))
const hodisa = (j, tur, kalit) => j.some((x) => x.t === 'hodisa' && x.tur === tur && (kalit == null || x.kalit === kalit))

export const REDIS_MASHQLAR = [
  {
    id: 'kalit-muddat',
    bob: '/redis/04-kalitlar-muddat',
    title: 'Kalit va muddat (TTL)',
    intro: 'Muddatli kalit — sessiya yoki kesh uchun asosiy usul: vaqti tugaganda Redis uni o‘zi o‘chiradi.',
    steps: [
      { text: '`SET sessiya:ali token123 EX 15` — 15 soniyalik kalit yarating.', tekshir: (h) => k(h, 'sessiya:ali')?.pttl > 0,
        natija: 'Kartochkada TTL halqasi aylanyapti. `TTL sessiya:ali` qancha qolganini aytadi.' },
      { text: 'Kuting — muddat tugashini kuzating.', tekshir: (h, j) => hodisa(j, 'expired', 'sessiya:ali'),
        natija: 'Keyspace bildirishnomasi `expired` keldi — kalitni Redis o‘zi o‘chirdi, hech kim DEL yubormadi.' },
    ],
  },
  {
    id: 'string-sanagich',
    bob: '/redis/05-string',
    title: 'Atomar sanagich (INCR)',
    intro: 'String raqam sifatida: INCR o‘qish-qo‘shish-yozishni bitta atomar amalda bajaradi.',
    steps: [
      { text: '`INCR sahifa:korishlar` ni 3 marta bajaring.', tekshir: (h) => Number(k(h, 'sahifa:korishlar')?.qiymat) >= 3,
        natija: 'Qiymat 3. Kalit yo‘q bo‘lsa INCR uni 0 deb oladi.' },
      { text: '`INCRBY sahifa:korishlar 10` bajaring.', tekshir: (h, j) => buyruq(j, 'INCRBY', (a) => a[1] === 'sahifa:korishlar'),
        natija: 'Bir vaqtda ko‘p mijoz INCR yuborsa ham, birorta oshirish yo‘qolmaydi — Redis buyruqlarni bittalab bajaradi.' },
    ],
  },
  {
    id: 'list-navbat',
    bob: '/redis/07-list',
    title: 'List — ishlar navbati',
    intro: 'LPUSH bilan chapdan qo‘shib, RPOP bilan o‘ngdan olsak — birinchi kelgan birinchi chiqadi (FIFO).',
    steps: [
      { text: '`LPUSH ishlar rasm-1 rasm-2 rasm-3` bajaring.', tekshir: (h) => k(h, 'ishlar')?.uzunlik >= 3,
        natija: 'Har element chapga (boshga) qo‘shildi: oxirgi qo‘shilgan — eng chapda.' },
      { text: '`RPOP ishlar` bilan bitta ish oling.', tekshir: (h, j) => buyruq(j, 'RPOP', (a) => a[1] === 'ishlar'),
        natija: 'O‘ngdan birinchi qo‘shilgan (rasm-1) chiqdi — navbat tartibi saqlandi.' },
    ],
  },
  {
    id: 'hash-obyekt',
    bob: '/redis/06-hash',
    title: 'Hash — obyekt maydonlari',
    intro: 'Bitta kalit ichida maydonlar: foydalanuvchi profili uchun qulay.',
    steps: [
      { text: '`HSET foydalanuvchi:1 ism Ali shahar Toshkent yosh 30`.', tekshir: (h) => k(h, 'foydalanuvchi:1')?.tur === 'hash' && k(h, 'foydalanuvchi:1').uzunlik >= 3,
        natija: 'Uch maydonli hash. Butun obyektni o‘qimasdan bitta maydonni o‘zgartirish mumkin.' },
      { text: '`HINCRBY foydalanuvchi:1 yosh 1`.', tekshir: (h) => k(h, 'foydalanuvchi:1')?.qiymat?.yosh === '31',
        natija: 'Faqat `yosh` maydoni o‘zgardi: 31.' },
    ],
  },
  {
    id: 'set-teglar',
    bob: '/redis/08-set',
    title: 'Set — takrorsiz to‘plam',
    intro: 'Set’da har element bir marta bo‘ladi; to‘plamlarni solishtirish mumkin.',
    steps: [
      { text: '`SADD teglar:1 redis kesh tez` va `SADD teglar:2 redis navbat tez`.', tekshir: (h) => k(h, 'teglar:1')?.uzunlik >= 3 && k(h, 'teglar:2')?.uzunlik >= 3,
        natija: 'Ikki to‘plam. `SADD teglar:1 redis` ni yana yuborsangiz — 0 qaytadi, takror qo‘shilmaydi.' },
      { text: '`SINTER teglar:1 teglar:2` bilan umumiylarini toping.', tekshir: (h, j) => buyruq(j, 'SINTER'),
        natija: 'Kesishma: redis va tez — ikkalasida ham bor elementlar.' },
    ],
  },
  {
    id: 'zset-reyting',
    bob: '/redis/24-reyting',
    title: 'Sorted set — reyting jadvali',
    intro: 'Har a’zoning bali bor; Redis ularni doim tartibda saqlaydi.',
    steps: [
      { text: '`ZADD reyting 120 ali 95 vali 150 gulnora`.', tekshir: (h) => k(h, 'reyting')?.uzunlik >= 3,
        natija: 'Ustunlar ball bo‘yicha: gulnora birinchi.' },
      { text: '`ZINCRBY reyting 80 vali` — valini birinchi o‘ringa chiqaring.', tekshir: (h) => { const z = k(h, 'reyting')?.qiymat; return z && z.at(-1)?.[0] === 'vali' },
        natija: 'Ball oshdi va tartib o‘zi yangilandi — saralash kerak emas.' },
      { text: '`ZRANGE reyting 0 2 REV WITHSCORES` bilan TOP-3 ni oling.', tekshir: (h, j) => buyruq(j, 'ZRANGE', (a) => a.some((x) => x.toUpperCase() === 'REV')),
        natija: 'REV — kattadan kichikka. Reyting jadvalining asosi shu bitta buyruq.' },
    ],
  },
  {
    id: 'stream-guruh',
    bob: '/redis/10-stream',
    title: 'Stream va consumer guruh',
    intro: 'Stream — yozuvlar jurnali. Guruh yozuvlarni a’zolariga bo‘lib beradi va tasdiqni kutadi.',
    steps: [
      { text: '`XADD hodisalar * tur buyurtma id 42` ni 2 marta bajaring.', tekshir: (h) => k(h, 'hodisalar')?.uzunlik >= 2,
        natija: 'Har yozuvga Redis vaqtga asoslangan ID berdi.' },
      { text: '`XGROUP CREATE hodisalar ishchilar 0` — guruh yarating.', tekshir: (h) => k(h, 'hodisalar')?.guruhlar?.some((g) => g.nom === 'ishchilar'),
        natija: 'Guruh 0 dan boshlaydi — eski yozuvlarni ham oladi.' },
      { text: '`XREADGROUP GROUP ishchilar w1 COUNT 1 STREAMS hodisalar >` bilan bitta yozuv oling.', tekshir: (h) => k(h, 'hodisalar')?.guruhlar?.some((g) => g.nom === 'ishchilar' && g.pending >= 1),
        natija: 'Yozuv w1 ga berildi va “pending” bo‘ldi — XACK qilinmaguncha guruh uni ishlangan deb hisoblamaydi.' },
      { text: 'O‘sha yozuv ID’si bilan `XACK hodisalar ishchilar <ID>` bajaring.', tekshir: (h, j) => buyruq(j, 'XACK') && k(h, 'hodisalar')?.guruhlar?.some((g) => g.nom === 'ishchilar' && g.pending === 0),
        natija: 'pending 0 — ish tasdiqlandi.' },
    ],
  },
  {
    id: 'tranzaksiya',
    bob: '/redis/14-pipeline-tranzaksiya',
    title: 'MULTI / EXEC',
    intro: 'Tranzaksiya: buyruqlar navbatga turadi va EXEC’da orasiga boshqa mijoz kirmasdan bajariladi.',
    steps: [
      { text: '`MULTI`, keyin `INCR hisob:a` va `DECR hisob:b`, oxirida `EXEC`.', tekshir: (h, j) => buyruq(j, 'EXEC') && buyruq(j, 'MULTI'),
        natija: 'MULTI’dan keyingi buyruqlar “QUEUED” javobini oldi, EXEC esa ikkalasini birga bajardi.' },
    ],
  },
  {
    id: 'pubsub',
    bob: '/redis/22-pubsub',
    title: 'Pub/Sub',
    intro: 'Kanalga yuborilgan xabar o‘sha paytdagi barcha obunachilarga boradi va saqlanmaydi.',
    steps: [
      { text: 'Pub/Sub panelida `yangiliklar` kanaliga 2 ta obunachi qo‘shing.', tekshir: (h) => h.obunachilar.filter((o) => o.kanallar.includes('yangiliklar') || o.naqshlar.length).length >= 2,
        natija: 'Ikkalasi haqiqiy SUBSCRIBE ulanishi.' },
      { text: '`yangiliklar` ga xabar yuboring (PUBLISH).', tekshir: (h, j) => new Set(j.filter((x) => x.t === 'pubsub').map((x) => x.obunachi)).size >= 2,
        natija: 'Har obunachi o‘z nusxasini oldi. Obunachisiz kanalga PUBLISH qilsangiz — 0, xabar yo‘qoladi.' },
    ],
  },
  {
    id: 'evikt',
    bob: '/redis/27-xotira-evikt',
    title: 'Xotira to‘lganda: evikt',
    intro: 'maxmemory’ga yetganda Redis siyosat bo‘yicha ish tutadi: noeviction — yozishni rad etadi, allkeys-lru — eskisini chiqaradi.',
    steps: [
      { text: '“Xotira va evikt” guruhidan `CONFIG SET maxmemory 2mb` va `CONFIG SET maxmemory-policy allkeys-lru`.', tekshir: (h) => h.info.maxmemory_policy === 'allkeys-lru' && h.info.maxmemory <= 4 * 1024 * 1024,
        natija: 'Chegara 2 MB, siyosat — eng uzoq ishlatilmaganini chiqarish.' },
      { text: '“3000 ta kalit yozish” (EVAL) ni bajaring.', tekshir: (h, j) => (h.info.evicted_keys ?? 0) > 0 || hodisa(j, 'evicted'),
        natija: 'evicted_keys oshdi: xotira to‘lgach Redis eski kalitlarni o‘zi chiqarib yubordi. Kesh uchun to‘g‘ri, asosiy ma’lumot uchun — xavfli.' },
    ],
  },
]
