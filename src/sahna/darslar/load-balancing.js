// "Load balancing" — tizim dizayni darsi. Hamma raqamlar VPS laboratoriyasidagi haqiqiy o'lchovdan
// (tizim-lab/olchov.sh → src/sahna/tizim/olchovlar/load-balancing/*.json); matnga ham shu fayllardan qo'yiladi.
// docs/vizualizator/tizim-dizayni.md 4
import bitta from '../tizim/olchovlar/load-balancing/bitta.json'
import rr from '../tizim/olchovlar/load-balancing/round-robin.json'
import ogirRr from '../tizim/olchovlar/load-balancing/ogir-rr.json'
import ogirLc from '../tizim/olchovlar/load-balancing/ogir-lc.json'
import yiqildi from '../tizim/olchovlar/load-balancing/yiqildi.json'
import versiyalar from '../tizim/olchovlar/load-balancing/versiyalar.txt?raw'

const IP = { '10.70.0.11:8000': 'a', '10.70.0.12:8000': 'b', '10.70.0.13:8000': 'c' }
const NOM = { a: 'A', b: 'B', c: 'C' }
const ms = (v) => (v == null ? '—' : v >= 1000 ? `${(v / 1000).toFixed(1)} s` : `${Math.round(v)} ms`)
const foiz = (v) => `${v}%`
const holatMs = (v) => (v == null ? 'neytral' : v < 100 ? 'ok' : v < 500 ? 'ogoh' : 'xato')
const ulush = (o, k) => {
  const jami = Object.values(o.serverlar).reduce((s, x) => s + x, 0) || 1
  const n = Object.entries(o.serverlar).filter(([ip]) => ip.split(', ').pop().startsWith(Object.keys(IP).find((x) => IP[x] === k))).reduce((s, [, x]) => s + x, 0)
  return Math.round((100 * n) / jami)
}
const ogirSoni = (o, k) => Object.entries(o.ogir_serverlar).filter(([ip]) => IP[ip] === k).reduce((s, [, x]) => s + x, 0)
// server bandligi: (og'ir × 0,3 s + yengil × 0,02 s) / o'lchov soniyasi — 1 dan oshsa navbat o'sadi
const ish = (o, k) => {
  const jami = Object.entries(o.serverlar).filter(([ip]) => IP[ip.split(', ').pop()] === k).reduce((s, [, x]) => s + x, 0)
  const og = ogirSoni(o, k)
  return (og * 0.3 + (jami - og) * 0.02) / o.soniya
}
const qaytaYuborilgan = (o) => Object.entries(o.serverlar).filter(([ip]) => ip.includes(', ')).reduce((s, [, x]) => s + x, 0)
const ketma = (o) => o.ketma.slice(0, 9).map((ip) => NOM[IP[ip.split(', ').pop()]] ?? '?').join(', ')
const yuklama = (tezlik, tez, ogir) => (tezlik * (tez * 0.02 + ogir * 0.3)) // soniyasiga necha soniya ish
const m = (o, xizmat) => ({
  sorov: { v: `${o.tezlik} / s`, manba: 'olchangan' },
  p95: { v: o.p95, holat: holatMs(o.p95), manba: 'olchangan' },
  xato: { v: o.xato_foiz, holat: o.xato_foiz > 0 ? 'xato' : 'ok', manba: 'olchangan' },
  serverlar: { v: xizmat, holat: xizmat.startsWith('3') ? 'ok' : 'ogoh' },
})
const band = (v) => ({ band: Math.min(1, v) })

// yiqildi.json: B 8-soniyada to'xtatildi — undan oldingi va keyingi xatolar
const oldin = yiqildi.har_soniya.slice(0, 8)
const keyin = yiqildi.har_soniya.slice(8)
const xatoKeyin = keyin.reduce((s, x) => s + x.xato, 0)
const engYomon = Math.max(...keyin.map((x) => x.p95 ?? 0))
const qayta = qaytaYuborilgan(yiqildi)

export default {
  id: 'load-balancing',
  tur: 'tizim',
  sarlavha: 'Load balancing',
  shior: 'Bitta eshik, ko‘p server — so‘rovlarni kim, qaysi qoida bilan taqsimlaydi.',
  daraja: 'boshlang‘ich',
  daqiqa: 10,
  kitob: [{ yol: '/arxitektura/92-load-balancing', nom: 'Arxitektura, 92-bob: Load balancing' }, { yol: '/arxitektura/91-gorizontal-masshtab', nom: 'Arxitektura, 91-bob: Gorizontal masshtab' }],
  manba: [
    { nom: 'nginx: ngx_http_upstream_module', url: 'https://nginx.org/en/docs/http/ngx_http_upstream_module.html' },
    { nom: 'nginx: Using nginx as HTTP load balancer', url: 'https://nginx.org/en/docs/http/load_balancing.html' },
    { nom: 'nginx: proxy_next_upstream', url: 'https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_next_upstream' },
  ],
  sinov: `O‘lchov: VPS laboratoriyasi (tizim-lab/), ${versiyalar.trim().split('\n').join(' · ')}. Ilova bir vaqtda bitta so‘rov bajaradi: /tez — 20 ms, /ogir — 300 ms ish.`,
  trenajor: { yol: '/arxitektura/trenajor', nom: 'Simulyatorda o‘zingiz sinang' },
  organasiz: [
    { matn: 'Nega serverlar ko‘pligi yetmaydi — “eshik” kerak', qadam: 2 },
    { matn: 'Round robin: navbat bilan va uning zaif joyi', qadam: 4 },
    { matn: 'least_conn: eng bo‘sh serverga', qadam: 5 },
    { matn: 'Server yiqilsa nginx nima qiladi (passiv tekshiruv)', qadam: 8 },
  ],
  metrikaRoyxat: [
    { k: 'sorov', nom: 'So‘rovlar' },
    { k: 'p95', nom: 'p95 javob vaqti', format: ms },
    { k: 'xato', nom: 'Xatolar', format: foiz },
    { k: 'serverlar', nom: 'Ishlayotgan server' },
  ],
  metrikaManba: {
    olchangan: 'VPS laboratoriyasida o‘lchangan (tizim-lab/olchov.sh)',
    model: 'Taxminiy model',
  },
  afsona: [{ k: 'sorov', nom: 'so‘rov' }, { k: 'ogir', nom: 'og‘ir so‘rov' }, { k: 'xato', nom: 'xato' }],
  tugunlar: {
    users: { ikonka: 'foydalanuvchilar', nom: 'Foydalanuvchilar', izoh: 'yuklama skripti', x: 60, y: 330 },
    lb: { ikonka: 'lb', nom: 'Load balancer', izoh: 'nginx 1.30', x: 400, y: 330 },
    a: { ikonka: 'server', nom: 'Server A', izoh: '10.70.0.11', x: 800, y: 80 },
    b: { ikonka: 'server', nom: 'Server B', izoh: '10.70.0.12', x: 800, y: 330 },
    c: { ikonka: 'server', nom: 'Server C', izoh: '10.70.0.13', x: 800, y: 580 },
  },
  chiziqlar: [['users', 'a'], ['users', 'lb'], ['lb', 'a'], ['lb', 'b'], ['lb', 'c']],
  qadamlar: [
    {
      qisqa: 'Bitta server', nishon: 'muammo',
      sarlavha: 'Bitta server to‘lib qoldi',
      matn: [
        `Do‘kon bitta serverda ishlaydi. Har so‘rovga 20 ms ish ketadi va server bir vaqtda bittasini bajaradi — demak sekundiga ko‘pi bilan ~50 ta.`,
        `Foydalanuvchilar sekundiga **${bitta.tezlik}** ta so‘rov yuboryapti. Ortiqchasi navbatga tushadi va navbat o‘sib boradi: ${bitta.soniya} soniyada p95 javob vaqti **${ms(bitta.p95)}** ga yetdi — vaqt o‘tgan sari yomonlashadi.`,
      ],
      callout: { tur: 'goya', matn: '**p95** — so‘rovlarning 95 foizi shundan tezroq javob oldi. O‘rtacha qiymat sekin foydalanuvchilarni yashiradi, p95 esa ko‘rsatadi.' },
      ozgardi: [`~ ${bitta.tezlik} so‘rov/s, sig‘im ~50/s`, `~ p95 ${ms(bitta.p95)}`],
      korinadi: ['users', 'a'],
      chiziqlar: [['users', 'a']],
      metrikalar: m(bitta, '1 / 1'),
      teglar: { a: { ...band(1), matn: 'navbat o‘syapti', rang: 'xato' } },
      oqimlar: [{ chiziq: ['users', 'a'], tezlik: 6 }],
      kartalar: [{ sarlavha: 'p95 har soniyada (o‘lchangan)', qatorlar: bitta.har_soniya.filter((x) => x.s % 5 === 0 || x.s === bitta.har_soniya.length - 1).map((x) => [`${x.s + 1}-soniya`, ms(x.p95)]), joy: 'yuqori-chap', izoh: 'Navbat to‘xtamay o‘sadi: kelayotgan oqim sig‘imdan katta' }],
    },
    {
      qisqa: 'Yana server', nishon: 'sozlash',
      sarlavha: 'Ikki server qo‘shdik — lekin hech narsa o‘zgarmadi',
      matn: [
        'B va C serverlari ishga tushdi. Ammo foydalanuvchilar hamon bitta manzilga — A ga boradi: ular boshqa serverlar borligini bilmaydi.',
        'Raqamlar 1-qadamdagidek qoladi: yangi serverlar bo‘sh turibdi.',
      ],
      callout: { tur: 'ogoh', matn: 'Server qo‘shish o‘zi yetmaydi — trafikni ularga **taqsimlaydigan** narsa kerak.' },
      ozgardi: ['+ Server B, Server C (bo‘sh)'],
      korinadi: ['users', 'a', 'b', 'c'],
      teglar: { b: { band: 0, matn: 'bo‘sh', rang: 'info' }, c: { band: 0, matn: 'bo‘sh', rang: 'info' } },
      metrikalar: m(bitta, '1 / 3'),
      bashorat: { savol: 'Foydalanuvchilar uchta serverdan foydalanishi uchun nima kerak?', variantlar: ['Har foydalanuvchiga boshqa manzil beramiz', 'Hammasi bitta kirish nuqtasiga boradi, u esa serverlarga bo‘lib beradi', 'Server A’ni kuchliroq qilamiz'], togri: 1, izoh: 'Bu — load balancer. Foydalanuvchi bitta manzilni biladi, orqada nechta server borligi uni qiziqtirmaydi.' },
    },
    {
      qisqa: 'LB', nishon: 'texnika',
      sarlavha: 'Load balancer — bitta kirish eshigi',
      matn: [
        'Endi so‘rovlar avval **load balancer**ga (yuklamani taqsimlovchi) keladi. Bu yerda u — nginx, `upstream` blokida uchta server yozilgan.',
        `Natija: o‘sha ${rr.tezlik} so‘rov/s da p95 **${ms(bitta.p95)} → ${ms(rr.p95)}**, xatolar ${rr.xato_foiz}%. Har server ~${Math.round(rr.tezlik / 3)} so‘rov/s oladi — sig‘imidan ancha kam.`,
      ],
      callout: { tur: 'maslahat', matn: 'nginx’da: `upstream ilovalar { server A; server B; server C; }` va `proxy_pass http://ilovalar;`' },
      ozgardi: ['+ Load balancer (nginx)', `~ p95 ${ms(bitta.p95)} → ${ms(rr.p95)}`],
      korinadi: ['users', 'lb', 'a', 'b', 'c'],
      chiziqlar: [['users', 'lb'], ['lb', 'a'], ['lb', 'b'], ['lb', 'c']],
      metrikalar: m(rr, '3 / 3'),
      teglar: { a: { ...band(rr.tezlik / 3 * 0.02), matn: `${ulush(rr, 'a')}%`, rang: 'ok' }, b: { ...band(rr.tezlik / 3 * 0.02), matn: `${ulush(rr, 'b')}%`, rang: 'ok' }, c: { ...band(rr.tezlik / 3 * 0.02), matn: `${ulush(rr, 'c')}%`, rang: 'ok' } },
      oqimlar: [{ chiziq: ['users', 'lb'], tezlik: 6 }, { chiziq: ['lb', 'a'], tezlik: 2 }, { chiziq: ['lb', 'b'], tezlik: 2 }, { chiziq: ['lb', 'c'], tezlik: 2 }],
    },
    {
      qisqa: 'Round robin', nishon: 'texnika',
      sarlavha: 'Round robin: navbat bilan',
      matn: [
        'Qaysi so‘rov qaysi serverga? nginx’ning standart qoidasi — **round robin** (aylana navbat): A, B, C, yana A…',
        `Laboratoriya logidagi birinchi so‘rovlar: **${ketma(rr)}**. Ulushlar: A ${ulush(rr, 'a')}%, B ${ulush(rr, 'b')}%, C ${ulush(rr, 'c')}%.`,
      ],
      callout: { tur: 'goya', matn: 'Round robin arzon va adolatli — **agar** serverlar bir xil kuchli va har so‘rov taxminan bir xil og‘ir bo‘lsa.' },
      faktlar: [['Qoida', 'round robin (standart)'], ['Og‘irlik', '`server A weight=2;` — A ikki barobar ko‘p oladi']],
      korinadi: ['users', 'lb', 'a', 'b', 'c'],
      metrikalar: m(rr, '3 / 3'),
      kartalar: [{ sarlavha: 'Birinchi so‘rovlar (nginx logi)', qatorlar: rr.ketma.slice(0, 4).map((ip, i) => [`${i + 1}-so‘rov`, `Server ${NOM[IP[ip.split(', ').pop()]] ?? '?'}`]), joy: 'yuqori-chap' }],
      oqimlar: [{ chiziq: ['users', 'lb'], tezlik: 3 }, { chiziq: ['lb', 'a'], tezlik: 1 }, { chiziq: ['lb', 'b'], tezlik: 1 }, { chiziq: ['lb', 'c'], tezlik: 1 }],
    },
    {
      qisqa: 'Og‘ir ish', nishon: 'muammo',
      sarlavha: 'So‘rovlar teng bo‘lmasa',
      matn: [
        `Endi har uchinchi so‘rov og‘ir: 300 ms (hisobot, eksport). Yuklama kichikroq — ${ogirRr.tezlik} so‘rov/s; uch server bunga bemalol yetadi: jami ish ${yuklama(ogirRr.tezlik, 2 / 3, 1 / 3).toFixed(1)} s/s, sig‘im 3 s/s.`,
        `Lekin round robin so‘rovlarni **sanaydi**, ishni emas. So‘rovlar tartibi “tez, tez, og‘ir” bo‘lgani uchun og‘irlarning hammasi bitta serverga tushdi: og‘ir so‘rovlar A ${ogirSoni(ogirRr, 'a')}, B ${ogirSoni(ogirRr, 'b')}, C ${ogirSoni(ogirRr, 'c')} ta. p95: **${ms(ogirRr.p95)}**, xatolar ${ogirRr.xato_foiz}% (10 soniyada javob kelmadi).`,
      ],
      callout: { tur: 'ogoh', matn: 'Round robin server qanchalik band ekanini bilmaydi.' },
      ozgardi: ['+ har 3-so‘rov og‘ir (300 ms)', `~ p95 ${ms(ogirRr.p95)}`],
      korinadi: ['users', 'lb', 'a', 'b', 'c'],
      metrikalar: m(ogirRr, '3 / 3'),
      teglar: Object.fromEntries(['a', 'b', 'c'].map((k) => {
        const n = ogirSoni(ogirRr, k)
        return [k, { band: Math.min(1, ish(ogirRr, k)), matn: n ? `${n} og‘ir — navbat` : 'faqat yengil', rang: n ? 'xato' : 'ok' }]
      })),
      oqimlar: [{ chiziq: ['users', 'lb'], tezlik: 3, naqsh: ['sorov', 'sorov', 'ogir'] }, { chiziq: ['lb', 'a'], tezlik: 1, naqsh: ogirSoni(ogirRr, 'a') ? ['ogir'] : ['sorov'] }, { chiziq: ['lb', 'b'], tezlik: 1, naqsh: ogirSoni(ogirRr, 'b') ? ['ogir'] : ['sorov'] }, { chiziq: ['lb', 'c'], tezlik: 1, naqsh: ogirSoni(ogirRr, 'c') ? ['ogir'] : ['sorov'] }],
    },
    {
      qisqa: 'least_conn', nishon: 'texnika',
      sarlavha: 'Eng bo‘sh serverga: least_conn',
      matn: [
        '`least_conn` qoidasida nginx har serverda hozir nechta so‘rov bajarilayotganini sanaydi va yangisini eng kam band serverga yuboradi.',
        `Xuddi shu yuklama: og‘ir so‘rovlar A ${ogirSoni(ogirLc, 'a')}, B ${ogirSoni(ogirLc, 'b')}, C ${ogirSoni(ogirLc, 'c')} ta bo‘lib taqsimlandi. p95: **${ms(ogirRr.p95)} → ${ms(ogirLc.p95)}**, xatolar ${ogirLc.xato_foiz}%. 303 ms — bu og‘ir so‘rovning o‘zi (300 ms ish); yengil so‘rovlarda p95 ${ms(ogirLc.p95_tez)}.`,
      ],
      callout: { tur: 'maslahat', matn: '`upstream ilovalar { least_conn; server A; server B; server C; }`' },
      ozgardi: ['~ qoida: round robin → least_conn', `~ p95 ${ms(ogirRr.p95)} → ${ms(ogirLc.p95)}`],
      korinadi: ['users', 'lb', 'a', 'b', 'c'],
      metrikalar: m(ogirLc, '3 / 3'),
      teglar: Object.fromEntries(['a', 'b', 'c'].map((k) => [k, { band: Math.min(1, ish(ogirLc, k)), matn: `${ogirSoni(ogirLc, k)} og‘ir`, rang: 'ok' }])),
      oqimlar: [{ chiziq: ['users', 'lb'], tezlik: 3, naqsh: ['sorov', 'sorov', 'ogir'] }, ...['a', 'b', 'c'].map((k, i) => ({ chiziq: ['lb', k], tezlik: 1, naqsh: [['sorov', 'sorov', 'ogir'], ['sorov', 'ogir', 'sorov'], ['ogir', 'sorov', 'sorov']][i] }))],
    },
    {
      qisqa: 'Yiqildi', nishon: 'muammo',
      sarlavha: 'Server B to‘xtadi',
      matn: [
        `${yiqildi.tezlik} so‘rov/s oqimi davomida 8-soniyada Server B konteyneri to‘xtatildi. nginx buni oldindan bilmaydi: ochiq manbali nginx’da serverni muntazam tekshiradigan **faol** tekshiruv yo‘q (u NGINX Plus’da).`,
        `B ga yo‘llangan so‘rov javob ololmadi — nginx uni o‘zi **boshqa serverga qayta yubordi** va B ni vaqtincha chiqardi. Logda bunday so‘rov ${qayta} ta: \`10.70.0.12, 10.70.0.13\` (avval B, keyin C). Foydalanuvchi xato ko‘rmadi: to‘xtashdan keyingi xatolar **${xatoKeyin}**, eng yomon soniyadagi p95 **${ms(engYomon)}** (oldin ${ms(Math.max(...oldin.map((x) => x.p95 ?? 0)))}).`,
        'Bu GET so‘rovi edi. Takrorlansa zarar qilmaydigan bo‘lmagan so‘rovlarni (masalan, POST) nginx standart holatda qayta yubormaydi.',
      ],
      callout: { tur: 'goya', matn: '`max_fails` (standart 1) va `fail_timeout` (standart 10 s): shuncha xatodan keyin server shu vaqtga chiqariladi. `proxy_next_upstream error timeout` (standart) — xato bo‘lsa so‘rov keyingi serverga.' },
      ozgardi: ['− Server B', `~ qayta yuborilgan so‘rov: ${qayta}`, `~ xatolar: ${xatoKeyin}`],
      korinadi: ['users', 'lb', 'a', 'b', 'c'],
      metrikalar: { ...m(yiqildi, '2 / 3'), xato: { v: yiqildi.xato_foiz, holat: yiqildi.xato_foiz > 0 ? 'xato' : 'ok', manba: 'olchangan' }, p95: { v: engYomon, holat: holatMs(engYomon), manba: 'olchangan' } },
      teglar: { a: { band: 0.4, matn: `${ulush(yiqildi, 'a')}%`, rang: 'ok' }, b: { yiqildi: true, band: 0, matn: 'to‘xtadi', rang: 'xato' }, c: { band: 0.4, matn: `${ulush(yiqildi, 'c')}%`, rang: 'ok' } },
      oqimlar: [{ chiziq: ['users', 'lb'], tezlik: 4 }, { chiziq: ['lb', 'a'], tezlik: 2 }, { chiziq: ['lb', 'c'], tezlik: 2 }],
      kartalar: [{ sarlavha: 'Har soniya (B 8-soniyada to‘xtadi)', qatorlar: yiqildi.har_soniya.slice(6, 11).map((x) => [`${x.s}-s`, `p95 ${ms(x.p95)} · xato ${x.xato}`, x.s === 8]), joy: 'yuqori-chap', izoh: 'Laboratoriya o‘lchovi' }],
    },
    {
      qisqa: 'Xulosa', nishon: 'xulosa',
      sarlavha: 'Nimalarni ko‘rdik',
      matn: [
        `Bitta server: p95 ${ms(bitta.p95)}. Uchta server + load balancer: ${ms(rr.p95)}.`,
        `Og‘ir so‘rovlar: round robin ${ms(ogirRr.p95)}, least_conn ${ms(ogirLc.p95)}.`,
        'Server yiqilsa nginx uni birinchi xatodan keyin chiqaradi va (GET kabi) so‘rovni boshqasiga qayta yuboradi. Load balancer’ning o‘zi esa endi yagona nuqta — uni ham zaxiralash kerak (92-bob).',
      ],
      callout: { tur: 'goya', matn: 'Raqamlar sizning tizimingizda boshqacha bo‘ladi — qoidalarni yuklama sinovi bilan o‘zingiz o‘lchang.' },
      korinadi: ['users', 'lb', 'a', 'b', 'c'],
      metrikalar: m(ogirLc, '3 / 3'),
      teglar: {},
      oqimlar: [{ chiziq: ['users', 'lb'], tezlik: 4 }, { chiziq: ['lb', 'a'], tezlik: 1.3 }, { chiziq: ['lb', 'b'], tezlik: 1.3 }, { chiziq: ['lb', 'c'], tezlik: 1.3 }],
      kartalar: [{ sarlavha: 'p95 javob vaqti (o‘lchangan)', qatorlar: [['1 server', ms(bitta.p95)], ['3 server, round robin', ms(rr.p95)], ['og‘ir, round robin', ms(ogirRr.p95)], ['og‘ir, least_conn', ms(ogirLc.p95), true]], joy: 'yuqori-chap' }],
    },
  ],
}
