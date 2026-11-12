// RabbitMQ trenajori mashqlari. Har qadam brokerning HAQIQIY holatiga (rmq-boshqaruv yuborgan "holat") yoki
// hodisalariga (firehose "oqim", consumer "ishlov") qarab tekshiriladi. Qadamlar panel yoki terminal orqali bajariladi.
// tekshir(h, j): h — {navbatlar, exchangelar, boglanishlar, consumerlar}, j — jurnal (eng yangisi boshida).

const nv = (h, nom) => h.navbatlar.find((n) => n.nom === nom)
const ex = (h, nom) => h.exchangelar.find((e) => e.nom === nom)
const bog = (h, e, q, k) => h.boglanishlar.some((b) => b.exchange === e && b.navbat === q && (k == null || b.kalit === k))
const publish = (j, f) => j.some((x) => x.t === 'oqim' && x.tur === 'publish' && f(x))
const ishlov = (j, f) => j.some((x) => x.t === 'ishlov' && f(x))
const consumerlar = (h, q) => h.consumerlar.filter((c) => c.navbat === q)

export const RABBITMQ_MASHQLAR = [
  {
    id: 'birinchi-xabar',
    bob: '/rabbitmq/03-birinchi-xabar',
    title: 'Birinchi xabar',
    intro: 'Navbat yaratib, unga default exchange orqali xabar yuboramiz va consumer bilan olamiz.',
    steps: [
      { text: '"Navbat" bo‘limida `salom` nomli classic navbat yarating.', tekshir: (h) => !!nv(h, 'salom'),
        natija: 'Navbat paydo bo‘ldi. Har navbat default exchange’ga o‘z nomi bilan avtomatik bog‘langan.' },
      { text: '"Yuborish" bo‘limida exchange — `(default)`, routing key — `salom` bilan xabar yuboring.',
        tekshir: (h, j) => publish(j, (x) => x.nom === '' && (x.navbatlar ?? []).includes('salom')),
        natija: 'Firehose ko‘rsatdi: default exchange xabarni routing key bilan bir xil nomli navbatga berdi. Sxemada navbatdagi "tayyor" soni oshdi.' },
      { text: '"Consumer" bo‘limida `salom` navbatiga consumer qo‘shing (ack).', tekshir: (h, j) => ishlov(j, (x) => x.navbat === 'salom'),
        natija: 'Consumer xabarni oldi va tasdiqladi — navbat bo‘shadi.' },
    ],
  },
  {
    id: 'worker-navbat',
    bob: '/rabbitmq/05-worker-navbat',
    title: 'Ishni ishchilarga bo‘lish',
    intro: 'Bitta navbatga ikki consumer ulaymiz: navbat xabarlarni ular orasida bo‘ladi.',
    steps: [
      { text: '`ishlar` nomli navbat yarating.', tekshir: (h) => !!nv(h, 'ishlar'), natija: 'Navbat tayyor.' },
      { text: '`ishlar` ga ikkita consumer qo‘shing (ikkalasi ham ack, ishlov 300 ms).', tekshir: (h) => consumerlar(h, 'ishlar').length >= 2,
        natija: 'Sxemada navbatdan ikki consumer’ga chiziq tushdi.' },
      { text: '`ishlar` ga 10 ta xabar yuboring ("Soni" — 10).',
        tekshir: (h, j) => { const s = new Set(j.filter((x) => x.t === 'ishlov' && x.navbat === 'ishlar').map((x) => x.consumer)); return s.size >= 2 },
        natija: 'Xabarlar ikkala consumer’ga taqsimlandi — har xabarni faqat bittasi oldi (ish navbati).' },
    ],
  },
  {
    id: 'fanout',
    bob: '/rabbitmq/07-hammaga-tarqatish',
    title: 'Fanout: hammaga nusxa',
    intro: 'Bitta xabar bir nechta navbatga nusxa bo‘lib tushadi.',
    steps: [
      { text: '`hodisa` nomli fanout exchange yarating.', tekshir: (h) => ex(h, 'hodisa')?.tur === 'fanout', natija: 'Fanout exchange routing key’ga qaramaydi.' },
      { text: '`xat` va `analitika` navbatlarini yarating va ikkalasini `hodisa` ga bog‘lang (kalitsiz).',
        tekshir: (h) => bog(h, 'hodisa', 'xat') && bog(h, 'hodisa', 'analitika'), natija: 'Ikki bog‘lanish sxemada ko‘rindi.' },
      { text: '`hodisa` ga bitta xabar yuboring.', tekshir: (h, j) => publish(j, (x) => x.nom === 'hodisa' && (x.navbatlar ?? []).length >= 2),
        natija: 'Bitta publish — ikki navbatga nusxa (firehose routed_queues).' },
    ],
  },
  {
    id: 'topic',
    bob: '/rabbitmq/08-tanlab-yuborish',
    title: 'Topic: kalit andozasi',
    intro: '`*` — bitta so‘z, `#` — nol yoki ko‘p so‘z.',
    steps: [
      { text: '`log` nomli topic exchange va `xatolar`, `hammasi` navbatlarini yarating.',
        tekshir: (h) => ex(h, 'log')?.tur === 'topic' && nv(h, 'xatolar') && nv(h, 'hammasi'), natija: 'Tayyor.' },
      { text: '`xatolar` ni `log` ga `*.xato` kaliti bilan, `hammasi` ni `#` bilan bog‘lang.',
        tekshir: (h) => bog(h, 'log', 'xatolar', '*.xato') && bog(h, 'log', 'hammasi', '#'), natija: 'Ikki andoza qo‘yildi.' },
      { text: '`log` ga `tolov.xato` kaliti bilan xabar yuboring.',
        tekshir: (h, j) => publish(j, (x) => x.nom === 'log' && (x.kalitlar ?? []).includes('tolov.xato') && ['xatolar', 'hammasi'].every((q) => (x.navbatlar ?? []).includes(q))),
        natija: 'Ikkala andozaga mos keldi — ikkala navbatga tushdi.' },
      { text: 'Endi `tolov.info` kaliti bilan yuboring.',
        tekshir: (h, j) => publish(j, (x) => x.nom === 'log' && (x.kalitlar ?? []).includes('tolov.info') && (x.navbatlar ?? []).includes('hammasi') && !(x.navbatlar ?? []).includes('xatolar')),
        natija: '`*.xato` ga mos emas — faqat `hammasi` ga tushdi.' },
    ],
  },
  {
    id: 'yonaltirilmagan',
    bob: '/rabbitmq/06-exchange-turlari',
    title: 'Hech qayerga bormagan xabar',
    intro: 'Exchange xabarni birorta navbatga yo‘naltira olmasa, xabar jimgina yo‘qoladi.',
    steps: [
      { text: '`bosh` nomli direct exchange yarating (hech narsaga bog‘lamang).', tekshir: (h) => ex(h, 'bosh')?.tur === 'direct', natija: 'Bog‘lanishsiz exchange.' },
      { text: '`bosh` ga istalgan kalit bilan xabar yuboring.', tekshir: (h, j) => publish(j, (x) => x.nom === 'bosh' && !(x.navbatlar ?? []).length),
        natija: 'Firehose: xabar keldi, lekin routed_queues bo‘sh — yo‘qoldi. Panel "routed: false" dedi.' },
    ],
  },
  {
    id: 'tasdiq',
    bob: '/rabbitmq/18-consumer-tasdigi',
    title: 'Tasdiqsiz o‘lgan consumer',
    intro: 'Qo‘lda tasdiqda consumer xabarni ishlab, tasdiqlamay o‘lsa — xabar navbatga qaytadi.',
    steps: [
      { text: '`tasdiq` navbatini yarating va unga 1 ta xabar yuboring.', tekshir: (h) => nv(h, 'tasdiq')?.tayyor >= 1, natija: 'Navbatda 1 ta xabar.' },
      { text: '`tasdiq` ga "o‘lish" xulqli consumer qo‘shing.', tekshir: (h, j) => ishlov(j, (x) => x.navbat === 'tasdiq' && x.xulq === 'crash'),
        natija: 'Consumer xabarni oldi va tasdiqlamay ulanishni uzdi.' },
      { text: '`tasdiq` ga oddiy (ack) consumer qo‘shing.', tekshir: (h, j) => ishlov(j, (x) => x.navbat === 'tasdiq' && x.xulq === 'ack' && x.redelivered),
        natija: 'Xabar qaytib keldi — redelivered=true. Yo‘qolmadi.' },
    ],
  },
  {
    id: 'prefetch',
    bob: '/rabbitmq/19-prefetch',
    title: 'Prefetch va sekin ishchi',
    intro: 'Prefetch — consumer’da bir vaqtda nechta tasdiqlanmagan xabar bo‘lishi mumkinligi.',
    steps: [
      { text: '`pf` navbatini yarating va unga prefetch 1, ishlov 2000 ms li consumer qo‘shing.',
        tekshir: (h) => consumerlar(h, 'pf').some((c) => c.prefetch === 1 && c.kechikish_ms >= 2000), natija: 'Sekin consumer tayyor.' },
      { text: '`pf` ga 5 ta xabar yuboring va sxemaga qarang.', tekshir: (h) => nv(h, 'pf')?.unacked === 1 && nv(h, 'pf')?.tayyor >= 1,
        natija: 'Faqat 1 ta xabar "unacked" — qolganlari navbatda kutyapti: prefetch 1.' },
    ],
  },
  {
    id: 'ttl-dlx',
    bob: '/rabbitmq/15-dead-letter',
    title: 'TTL va dead letter exchange',
    intro: 'Muddati o‘tgan xabar DLX orqali boshqa navbatga ko‘chadi.',
    steps: [
      { text: '`olik` nomli fanout exchange va `olik-xatlar` navbatini yarating, ularni bog‘lang.',
        tekshir: (h) => ex(h, 'olik')?.tur === 'fanout' && bog(h, 'olik', 'olik-xatlar'), natija: 'DLX tayyor.' },
      { text: '`kutish` navbatini x-message-ttl 3000 va DLX `olik` bilan yarating.',
        tekshir: (h) => nv(h, 'kutish')?.args?.['x-message-ttl'] === 3000 && nv(h, 'kutish')?.args?.['x-dead-letter-exchange'] === 'olik',
        natija: 'Navbat sxemada DLX belgisi bilan.' },
      { text: '`kutish` ga xabar yuboring va 3 soniya kuting.', tekshir: (h) => nv(h, 'olik-xatlar')?.tayyor >= 1,
        natija: 'Muddati o‘tdi — xabar `kutish` dan `olik` exchange’i orqali `olik-xatlar` ga ko‘chdi (dead-lettering).' },
    ],
  },
  {
    id: 'max-length',
    bob: '/rabbitmq/14-uzunlik-chegarasi',
    title: 'Navbat uzunligi chegarasi',
    intro: 'x-max-length dan oshganda standart xatti-harakat — eng eski xabar tashlanadi.',
    steps: [
      { text: '`chegara` navbatini x-max-length 3 bilan yarating.', tekshir: (h) => nv(h, 'chegara')?.args?.['x-max-length'] === 3, natija: 'Tayyor.' },
      { text: '`chegara` ga 10 ta xabar yuboring.', tekshir: (h) => nv(h, 'chegara')?.tayyor === 3,
        natija: '10 tadan faqat oxirgi 3 tasi qoldi (drop-head).' },
    ],
  },
  {
    id: 'quorum-limit',
    bob: '/rabbitmq/12-quorum',
    title: 'Quorum navbat va delivery-limit',
    intro: 'Quorum navbat har xabarning muvaffaqiyatsiz yetkazishlarini sanaydi.',
    steps: [
      { text: '`qq` nomli quorum navbat yarating, x-delivery-limit 2.', tekshir: (h) => nv(h, 'qq')?.tur === 'quorum', natija: 'Quorum navbat.' },
      { text: '`qq` ga 1 ta xabar yuboring va "reject" xulqli consumer qo‘shing.',
        tekshir: (h, j) => ishlov(j, (x) => x.navbat === 'qq' && x.xulq === 'reject'),
        natija: 'reject (requeue=false) — DLX bo‘lmagani uchun xabar tashlandi.' },
    ],
  },
  {
    id: 'stream',
    bob: '/rabbitmq/23-stream',
    title: 'Stream: o‘qish o‘chirmaydi',
    intro: 'Stream — faqat oxiriga qo‘shiladigan jurnal.',
    steps: [
      { text: '`tarix` nomli stream yarating va unga 3 ta xabar yuboring.', tekshir: (h) => nv(h, 'tarix')?.tur === 'stream', natija: 'Stream tayyor.' },
      { text: 'Terminalda `rabbitmqctl list_queues name type messages` ni ishga tushiring.', tekshir: () => true,
        natija: 'Stream xabarlar sonini ko‘rsatadi — ular o‘qilgandan keyin ham saqlanadi (kitobning 23-bobi).' },
    ],
  },
]
