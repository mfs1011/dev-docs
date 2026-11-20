// "DNS: nomdan manzilgacha" — Paket yo'li darsi. Paketlar VPS laboratoriyasidagi haqiqiy yozuvdan
// (paket-lab, profil "dns": Unbound rezolver + NSD ildiz/TLD/domen serverlari; ssenariy/dns.sh → tshark →
// scripts/paket/aylantir.mjs). Yozuv rezolverning o'z interfeysida olingan — klient so'rovi ham, rezolverning
// iyerarxiya bo'ylab so'rovlari ham ko'rinadi. Raqamlar yozuvdan hisoblanadi. docs/vizualizator/paket-yoli.md 4.1 (2-dars)
import yozuv from '../paket/yozuvlar/dns.json'

const P = yozuv.paketlar
const KLIENT = '192.168.1.10'
const REZ = '192.168.1.53'
const ILDIZ = '203.0.113.101'
const TLD = '203.0.113.102'
const DOMEN = '203.0.113.103'
const top = (shart, dan = 0) => {
  const p = P.find((x) => x.n > dan && shart(x))
  if (!p) throw new Error(`dns: yozuvda topilmadi: ${shart}`)
  return p
}
const sorov = (src, dst, re, dan = 0) => top((x) => x.src === src && x.dst === dst && /Standard query 0x/.test(x.info) && re.test(x.info), dan)
const javob = (src, dst, dan = 0) => top((x) => x.src === src && x.dst === dst && /Standard query response/.test(x.info), dan)

const q1 = sorov(KLIENT, REZ, / A sayt\.test/)
const priming = sorov(REZ, ILDIZ, / NS <Root>/)
const primingJ = javob(ILDIZ, REZ)
const qIldiz = sorov(REZ, ILDIZ, / A test /, primingJ.n)
const jIldiz = javob(ILDIZ, REZ, qIldiz.n)
const qTld = sorov(REZ, TLD, / A sayt\.test/)
const jTld = javob(TLD, REZ, qTld.n)
const qDomen = sorov(REZ, DOMEN, / A sayt\.test/)
const jDomen = javob(DOMEN, REZ, qDomen.n)
const j1 = javob(REZ, KLIENT, q1.n)
const q2 = sorov(KLIENT, REZ, / A sayt\.test/, j1.n)
const j2 = javob(REZ, KLIENT, q2.n)

const maydonlar = (p, k) => {
  const r = []
  const yur = (f) => { if (f.k === k) r.push(f); (f.m ?? []).forEach(yur) }
  p.qatlamlar.forEach(yur)
  return r
}
const ttl = (p) => Number(maydonlar(p, 'dns.resp.ttl')[0]?.s.match(/(\d+)/)?.[1])
const aa = (p) => /Server is an authority/.test(maydonlar(p, 'dns.flags.authoritative')[0]?.s ?? '')
const sekund = (a, b) => (b.t - a.t) * 1000
const ms = (a, b) => {
  const v = sekund(a, b)
  return v < 1 ? `${v.toFixed(2)} ms` : `${Math.round(v)} ms`
}
const iyerarxiyaMs = ms(priming, jDomen)

const pk = (p, yorliq, qatorlar, rang, dan, ga, qoshimcha = {}) => ({ tur: 'paket', n: p.n, yorliq, qatorlar, rang, dan, ga, ...qoshimcha })

export default {
  id: 'dns',
  tur: 'paket',
  sarlavha: 'DNS: nomdan manzilgacha',
  shior: 'Rezolver ildizdan domen serverigacha yuradi, keyin javobni keshlaydi — paketma-paket.',
  daraja: 'boshlang‘ich',
  daqiqa: 8,
  yozuv,
  yozuvNuqta: 'Rezolver tomonida yozilgan (uy tarmog‘i)',
  kitob: [
    { yol: '/web-asoslari/04-domen-dns', nom: 'Web asoslari, 04: Domen va DNS' },
    { yol: '/web-asoslari/01-veb-qanday-ishlaydi', nom: 'Web asoslari, 01: Veb qanday ishlaydi' },
  ],
  manba: [
    { nom: 'RFC 1034 — DNS tushunchalari (5.3.3 rezolver algoritmi)', url: 'https://www.rfc-editor.org/rfc/rfc1034#section-5.3.3' },
    { nom: 'RFC 1035 — DNS xabari formati', url: 'https://www.rfc-editor.org/rfc/rfc1035#section-4.1' },
    { nom: 'RFC 9156 — QNAME minimisation', url: 'https://www.rfc-editor.org/rfc/rfc9156' },
    { nom: 'RFC 8109 — rezolverni ildizdan boshlash (priming)', url: 'https://www.rfc-editor.org/rfc/rfc8109' },
    { nom: 'RFC 9499 — DNS atamalari', url: 'https://www.rfc-editor.org/rfc/rfc9499' },
  ],
  sinov: `Yozuv: VPS laboratoriyasi (paket-lab/, profil "dns"): rekursiv rezolver Unbound, ildiz, \`.test\` TLD va \`sayt.test\` serverlari — NSD; klientda \`dig @192.168.1.53 sayt.test A\` ikki marta. Yozuv rezolver interfeysida (tcpdump). Router internet tomoniga 10 ms kechikish qo‘shadi (tc netem). ${yozuv.versiyalar.filter((v) => /^(sana|unbound|NSD|DiG|TShark)/.test(v)).join(' · ')}`,
  trenajor: { yol: '/web-asoslari/trenajor', nom: 'HTTP laboratoriyasida o‘zingiz sinang' },
  protokol: {
    izoh: 'DNS — domen nomini IP manzilga aylantiradigan taqsimlangan ma’lumotlar bazasi. Hech bir server hamma nomni bilmaydi: ildiz TLD serverlarini, TLD domen serverlarini biladi, domen serveri esa yakuniy javobni.',
    faktlar: [['Qatlam', 'ilova'], ['Port', '53'], ['Transport', 'UDP (katta javob — TCP)'], ['Yozuvlar', 'A, AAAA, NS, CNAME, MX…'], ['Standart', 'RFC 1034, 1035']],
  },
  organasiz: [
    { matn: 'Klient va rezolver: kim nima qiladi', qadam: 1 },
    { matn: 'Ildiz → TLD → domen: yo‘llanmalar zanjiri', qadam: 3 },
    { matn: 'Avtoritativ javob va TTL', qadam: 5 },
    { matn: 'Kesh: ikkinchi so‘rov qancha tez', qadam: 7 },
  ],
  afsona: [{ k: 'sorov', nom: 'so‘rov' }, { k: 'javob', nom: 'javob' }, { k: 'ulanish', nom: 'yo‘llanma (referral)' }],
  ishtirokchilar: ['klient', 'rezolver', 'ildiz', 'tld', 'domen'],
  tugunlar: {
    klient: { ikonka: 'noutbuk', nom: 'Klient', izoh: KLIENT, x: 60, y: 340 },
    rezolver: { ikonka: 'dns', nom: 'Rezolver', izoh: REZ, x: 330, y: 340 },
    router: { ikonka: 'router', nom: 'Router', izoh: '192.168.1.1', x: 600, y: 340 },
    ildiz: { ikonka: 'server', nom: 'Ildiz (.)', izoh: ILDIZ, x: 920, y: 0 },
    tld: { ikonka: 'server', nom: 'TLD (.test)', izoh: TLD, x: 920, y: 340 },
    domen: { ikonka: 'server', nom: 'Domen (sayt.test)', izoh: DOMEN, x: 920, y: 680 },
  },
  chiziqlar: [['klient', 'rezolver'], ['rezolver', 'router'], ['router', 'ildiz'], ['router', 'tld'], ['router', 'domen']],
  yollar: {
    'klient>rezolver': ['klient', 'rezolver'], 'rezolver>klient': ['rezolver', 'klient'],
    'rezolver>ildiz': ['rezolver', 'router', 'ildiz'], 'ildiz>rezolver': ['ildiz', 'router', 'rezolver'],
    'rezolver>tld': ['rezolver', 'router', 'tld'], 'tld>rezolver': ['tld', 'router', 'rezolver'],
    'rezolver>domen': ['rezolver', 'router', 'domen'], 'domen>rezolver': ['domen', 'router', 'rezolver'],
  },
  qadamlar: [
    {
      qisqa: 'Savol', nishon: 'sozlash',
      sarlavha: 'Klient bitta savol beradi',
      matn: [
        'Klient `sayt.test` ning manzilini bilmoqchi. Kompyuterdagi **stub rezolver** o‘zi qidirmaydi — savolni uy tarmog‘idagi **rekursiv rezolverga** beradi: “to‘liq javobni sen topib ber”.',
        'Rezolverning keshi bo‘sh: u bu nomni hech qachon so‘ramagan. Demak javobni daraxtning eng tepasidan boshlab qidiradi.',
      ],
      callout: { tur: 'maslahat', matn: 'So‘rov paketini oching: **RD** (Recursion Desired) bayrog‘i 1 — “rekursiya so‘rayman”. Rezolver serverlarga yuboradigan so‘rovlarda esa bu shart emas.' },
      faktlar: [['Savol', '`A? sayt.test`'], ['Kimga', `rezolver ${REZ}`], ['Transport', 'UDP, port 53'], ['Kesh', 'bo‘sh']],
      korinadi: ['klient', 'rezolver'],
      kamera: ['klient', 'rezolver'],
      hodisalar: [
        pk(q1, 'DNS SO‘ROVI', ['A? sayt.test', 'RD=1'], 'sorov', 'klient', 'rezolver'),
        { tur: 'teg', tugun: 'rezolver', matn: 'keshda yo‘q', rang: 'ogoh' },
      ],
    },
    {
      qisqa: 'Ildizlar', nishon: 'texnika',
      sarlavha: 'Avval: ildiz serverlar ro‘yxati',
      matn: [
        'Rezolver ildiz serverining manzilini oldindan biladi — u sozlamadagi ro‘yxatda (root hints) yozilgan. Lekin birinchi ish — shu ro‘yxatni ildizning o‘zidan yangilash: `NS .` so‘rovi (**priming**).',
        `Ildiz javob berdi: ildiz zonasi serveri — \`ildiz.\`, manzili ${ILDIZ}. Bu ${ms(priming, primingJ)} oldi.`,
      ],
      callout: { tur: 'goya', matn: 'RFC 8109: hozir 13 ta ildiz server bor (a…m.root-servers.net). Laboratoriyada bitta — `ildiz.` — lekin ish tartibi bir xil.' },
      faktlar: [['Savol', '`NS .` (ildiz zonasi serverlari)'], ['Javob', `\`ildiz.\` → ${ILDIZ}`], ['Vaqt', ms(priming, primingJ)]],
      korinadi: ['klient', 'rezolver', 'router', 'ildiz'],
      kamera: ['rezolver', 'router', 'ildiz'],
      hodisalar: [
        pk(priming, 'PRIMING', ['NS? .'], 'sorov', 'rezolver', 'ildiz'),
        pk(primingJ, 'ILDIZ RO‘YXATI', [`NS ildiz. → ${ILDIZ}`], 'javob', 'ildiz', 'rezolver'),
      ],
    },
    {
      qisqa: 'Ildiz', nishon: 'texnika',
      sarlavha: 'Ildiz: “.test ni bilmayman, lekin kim biladi — mana”',
      matn: [
        `Rezolver ildizdan so‘radi — lekin to‘liq \`sayt.test\` emas, faqat **\`test\`**. Ildizga butun nom kerak emas: u faqat qaysi TLD serveriga yo‘naltirishni biladi. Bu **QNAME minimisation** (RFC 9156) — kamroq ma’lumot tashqariga chiqadi.`,
        `Ildiz javob bermadi — **yo‘llanma** (referral) berdi: “\`test.\` zonasini \`ns.test\` biladi, uning manzili ${TLD}”. Javob bo‘limi bo‘sh, **AA=${aa(jIldiz) ? 1 : 0}** (avtoritativ javob emas).`,
      ],
      callout: { tur: 'maslahat', matn: 'Javobni oching: NS yozuvi **Authority** bo‘limida, uning IP manzili esa **Additional** bo‘limida (“glue”). Glue bo‘lmasa, rezolver `ns.test` ning manzilini alohida so‘rashi kerak bo‘lardi.' },
      faktlar: [['Savol', '`A? test` (qisqartirilgan)'], ['Javob turi', 'yo‘llanma (referral)'], ['Keyingi server', `ns.test → ${TLD}`], ['Vaqt', ms(qIldiz, jIldiz)]],
      korinadi: ['klient', 'rezolver', 'router', 'ildiz', 'tld'],
      kamera: ['rezolver', 'router', 'ildiz', 'tld'],
      hodisalar: [
        pk(qIldiz, 'SO‘ROV → ILDIZ', ['A? test'], 'sorov', 'rezolver', 'ildiz'),
        pk(jIldiz, 'YO‘LLANMA', ['NS ns.test', `glue ${TLD}`], 'ulanish', 'ildiz', 'rezolver'),
        { tur: 'teg', tugun: 'ildiz', matn: '→ ns.test', rang: 'insight' },
      ],
    },
    {
      qisqa: 'TLD', nishon: 'texnika',
      sarlavha: 'TLD: “sayt.test ni domen serveri biladi”',
      matn: [
        `Endi \`.test\` TLD serveridan so‘raldi. Bu safar to‘liq \`sayt.test\`: TLD’dan keyingi bosqich shu nomning o‘zi.`,
        `Yana yo‘llanma: “\`sayt.test.\` zonasini \`ns.sayt.test\` yuritadi, manzili ${DOMEN}”. TLD serveri ham manzilni bilmaydi — u faqat kimga topshirilganini biladi (**delegatsiya**).`,
      ],
      callout: { tur: 'goya', matn: 'Har bosqichda javob beradigan server o‘zgaradi, rezolver esa bitta — u har yo‘llanmani kuzatib boradi (RFC 1034, 5.3.3: rezolver algoritmi). Klient bularning hech birini ko‘rmaydi.' },
      faktlar: [['Savol', '`A? sayt.test`'], ['Javob turi', 'yo‘llanma (referral)'], ['Keyingi server', `ns.sayt.test → ${DOMEN}`], ['Vaqt', ms(qTld, jTld)]],
      korinadi: ['klient', 'rezolver', 'router', 'ildiz', 'tld', 'domen'],
      kamera: ['rezolver', 'router', 'tld', 'domen'],
      hodisalar: [
        { tur: 'teg', tugun: 'ildiz', matn: null },
        pk(qTld, 'SO‘ROV → TLD', ['A? sayt.test'], 'sorov', 'rezolver', 'tld'),
        pk(jTld, 'YO‘LLANMA', ['NS ns.sayt.test', `glue ${DOMEN}`], 'ulanish', 'tld', 'rezolver'),
        { tur: 'teg', tugun: 'tld', matn: '→ ns.sayt.test', rang: 'insight' },
      ],
    },
    {
      qisqa: 'Javob', nishon: 'texnika',
      sarlavha: 'Domen serveri: yakuniy javob',
      matn: [
        `\`sayt.test\` zonasining o‘z serveri javob beradi: **A ${'203.0.113.10'}**. Bu safar **AA=${aa(jDomen) ? 1 : 0}** — **avtoritativ javob**: server bu zonaning egasi, boshqalardan so‘ramagan.`,
        `Javobdagi **TTL = ${ttl(jDomen)}** soniya: rezolver bu javobni shuncha vaqt keshda saqlashi mumkin. TTL’ni zona egasi belgilaydi.`,
      ],
      callout: { tur: 'maslahat', matn: 'Javob paketida uchala bo‘lim bor: Answer — A yozuvi, Authority — zonaning NS’i, Additional — NS’ning manzili.' },
      faktlar: [['Javob', '`A 203.0.113.10`'], ['Avtoritativ', aa(jDomen) ? 'ha (AA=1)' : 'yo‘q'], ['TTL', `${ttl(jDomen)} s`], ['Vaqt', ms(qDomen, jDomen)]],
      korinadi: ['klient', 'rezolver', 'router', 'ildiz', 'tld', 'domen'],
      kamera: ['rezolver', 'router', 'domen'],
      hodisalar: [
        { tur: 'teg', tugun: 'tld', matn: null },
        pk(qDomen, 'SO‘ROV → DOMEN', ['A? sayt.test'], 'sorov', 'rezolver', 'domen'),
        pk(jDomen, 'AVTORITATIV JAVOB', ['A 203.0.113.10', `TTL ${ttl(jDomen)}`], 'javob', 'domen', 'rezolver'),
        { tur: 'teg', tugun: 'rezolver', matn: `keshda: ${ttl(jDomen)} s`, rang: 'ok' },
      ],
    },
    {
      qisqa: 'Klientga', nishon: 'texnika',
      sarlavha: 'Rezolver klientga javob beradi',
      matn: [
        `Rezolver javobni keshlab, klientga qaytardi. Klient uchun bu bitta savol-javob: so‘rovdan javobgacha **${ms(q1, j1)}**.`,
        `Shundan ${iyerarxiyaMs} — rezolverning ildiz → TLD → domen bo‘ylab yurishi (har borib-kelish routerdagi 10 ms kechikishdan o‘tadi). Klient va rezolver orasidagi yo‘l esa deyarli bepul — ular bir tarmoqda.`,
      ],
      callout: { tur: 'goya', matn: 'Rezolver javobining AA bayrog‘i 0: klientga javobni domen egasi emas, rezolver (vositachi) berdi.' },
      faktlar: [['Javob', '`A 203.0.113.10`'], ['Jami vaqt', ms(q1, j1)], ['Shundan iyerarxiya', iyerarxiyaMs]],
      korinadi: ['klient', 'rezolver', 'router', 'ildiz', 'tld', 'domen'],
      kamera: ['klient', 'rezolver', 'router', 'ildiz', 'tld', 'domen'],
      hodisalar: [
        pk(j1, 'DNS JAVOBI', ['A 203.0.113.10'], 'javob', 'rezolver', 'klient'),
        { tur: 'teg', tugun: 'klient', matn: 'sayt.test = 203.0.113.10', rang: 'ok' },
      ],
    },
    {
      qisqa: 'Kesh', nishon: 'texnika',
      sarlavha: 'Ikkinchi so‘rov: keshdan',
      matn: [
        `Bir soniyadan keyin klient xuddi shu savolni berdi. Rezolver **hech kimdan so‘ramadi** — ildizga ham, TLD’ga ham, domen serveriga ham paket ketmadi. Javob ${ms(q2, j2)} da keldi (avvalgi ${ms(q1, j1)} o‘rniga).`,
        `Javobdagi TTL **${ttl(j2)}** — ${ttl(jDomen)} emas: kesh qolgan vaqtni beradi, u har soniya kamayadi. Nolga yetganda rezolver yana domen serveridan so‘raydi.`,
      ],
      callout: { tur: 'ogoh', matn: 'Domen manzili o‘zgarsa, eski javob TTL tugaguncha keshlardan qaytishi mumkin. Shuning uchun ko‘chishdan oldin TTL kichraytiriladi (Web asoslari, 04-bob).' },
      faktlar: [['Paketlar', '2 ta (faqat klient ↔ rezolver)'], ['Vaqt', ms(q2, j2)], ['TTL', `${ttl(j2)} s (${ttl(jDomen)} dan kamaygan)`]],
      korinadi: ['klient', 'rezolver', 'router', 'ildiz', 'tld', 'domen'],
      kamera: ['klient', 'rezolver', 'router'],
      hodisalar: [
        { tur: 'teg', tugun: 'klient', matn: null },
        pk(q2, 'DNS SO‘ROVI', ['A? sayt.test'], 'sorov', 'klient', 'rezolver'),
        pk(j2, 'KESHDAN', ['A 203.0.113.10', `TTL ${ttl(j2)}`], 'javob', 'rezolver', 'klient'),
        { tur: 'teg', tugun: 'rezolver', matn: 'keshdan ✓', rang: 'ok' },
      ],
    },
    {
      qisqa: 'Xulosa', nishon: 'xulosa',
      sarlavha: 'Vaqt qayerga ketdi',
      matn: [
        `Birinchi so‘rov ${ms(q1, j1)}, ikkinchisi ${ms(q2, j2)}. Farq butunlay kesh hisobidan: iyerarxiya bo‘ylab ${P.filter((x) => x.src === REZ && x.dst !== KLIENT).length} ta so‘rov faqat birinchi marta kerak bo‘ldi.`,
        'Yo‘llanmalar ham keshlanadi: 04-bobdagi `dig +trace` da `.uz` ning NS yozuvlari TTL’i 172800 soniya (2 kun). Shuning uchun haqiqiy rezolver ildiz va TLD’ga kamdan-kam murojaat qiladi — ko‘pincha faqat domen serveri so‘raladi.',
      ],
      callout: { tur: 'goya', matn: 'O‘zingiz ko‘ring: `dig +trace kun.uz` — ildizdan boshlab har yo‘llanma (Web asoslari, 04-bob).' },
      korinadi: ['klient', 'rezolver', 'router', 'ildiz', 'tld', 'domen'],
      kamera: ['klient', 'rezolver', 'router', 'ildiz', 'tld', 'domen'],
      kartalar: [{
        sarlavha: 'Yozuvdan: vaqt',
        qatorlar: [
          ['priming (NS .)', ms(priming, primingJ)],
          ['ildiz → yo‘llanma', ms(qIldiz, jIldiz)],
          ['TLD → yo‘llanma', ms(qTld, jTld)],
          ['domen → javob', ms(qDomen, jDomen)],
          ['1-so‘rov, jami', ms(q1, j1), true],
          ['2-so‘rov, keshdan', ms(q2, j2), true],
        ],
        joy: 'yuqori-chap',
        izoh: 'rezolver interfeysida o‘lchangan',
      }],
      hodisalar: [{ tur: 'teg', tugun: 'rezolver', matn: null }],
    },
  ],
}
