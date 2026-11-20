// "Cookie" — Paket yo'li darsi. Paketlar VPS laboratoriyasidagi haqiqiy yozuvdan (paket-lab/ssenariy/cookie.sh: curl -c/-b
// cookie fayli bilan /kirish → /profil → /chiqish → /profil; nginx hisob.sayt.test, paket-lab/veb/cookie.conf).
// Qiymatlar (cookie'lar, atributlar, server ko'rgan Cookie) yozuvdan hisoblanadi.
// docs/vizualizator/paket-yoli.md 4.1 (10-dars)
import yozuv from '../paket/yozuvlar/cookie.json'

const P = yozuv.paketlar
const VEB = '203.0.113.10'
const top = (re, dan = 0) => {
  const p = P.find((x) => x.n > dan && re.test(x.info))
  if (!p) throw new Error(`cookie: yozuvda topilmadi: ${re}`)
  return p
}
const maydonlar = (p, k) => {
  const r = []
  const yur = (f) => { if (f.k === k) r.push(f.s); (f.m ?? []).forEach(yur) }
  p.qatlamlar.forEach(yur)
  return r
}
const qiymat = (s) => s.slice(s.indexOf(':') + 1).replace(/\\r\\n$/, '').trim()
const tana = (p) => p.qatlamlar.find((f) => f.k === 'data-text-lines')?.m?.[0]?.s.replace(/\\n$/, '') ?? ''

const kirish = top(/^GET \/kirish /)
const kirishJ = top(/200 OK/, kirish.n)
const profil1 = top(/^GET \/profil /)
const profil1J = top(/200 OK/, profil1.n)
const chiqish = top(/^GET \/chiqish /)
const chiqishJ = top(/200 OK/, chiqish.n)
const profil2 = top(/^GET \/profil /, chiqish.n)
const profil2J = top(/200 OK/, profil2.n)

// Set-Cookie: "sessiya=…; Path=/; HttpOnly; SameSite=Lax" → { nom, qiymat, atributlar }
const setCookie = (p) => maydonlar(p, 'http.set_cookie').map(qiymat).map((s) => {
  const [juft, ...atr] = s.split(/;\s*/)
  const [nom, ...q] = juft.split('=')
  return { nom, qiymat: q.join('='), atr, matn: s }
})
const cookie = (p) => { const c = maydonlar(p, 'http.cookie')[0]; return c ? qiymat(c) : null }
const nomlar = (p) => (cookie(p) ?? '').split(/;\s*/).filter(Boolean).map((j) => j.split('=')[0])

const berildi = setCookie(kirishJ)
const ol = (nom) => berildi.find((c) => c.nom === nom)
const sessiya = ol('sessiya')
const til = ol('til')
const panel = ol('panel')
const ochirish = setCookie(chiqishJ)[0]
const qisqa = (v) => (v.length > 12 ? `${v.slice(0, 8)}…` : v)
const qisqaCookie = (p) => (cookie(p) ?? '—').replace(sessiya.qiymat, qisqa(sessiya.qiymat))
const yuborilmadi = berildi.filter((c) => !nomlar(profil1).includes(c.nom))

const pk = (p, yorliq, qatorlar, rang, qoshimcha = {}) => {
  const [dan, ga] = p.src === VEB ? ['veb', 'klient'] : ['klient', 'veb']
  return { tur: 'paket', n: p.n, yorliq, qatorlar, rang, dan, ga, ...qoshimcha }
}
const KORINADI = ['klient', 'router', 'veb']

export default {
  id: 'cookie',
  tur: 'paket',
  sarlavha: 'Cookie',
  shior: 'Server bir marta Set-Cookie deydi — klient keyingi har so‘rovda Cookie bilan eslatadi.',
  daraja: 'boshlang‘ich',
  daqiqa: 6,
  yozuv,
  kitob: [
    { yol: '/web-asoslari/14-cookie', nom: 'Web asoslari, 14: Cookie' },
    { yol: '/web-asoslari/15-sessiya', nom: 'Web asoslari, 15: Sessiya' },
  ],
  manba: [
    { nom: 'RFC 6265 — 4.1 Set-Cookie', url: 'https://www.rfc-editor.org/rfc/rfc6265#section-4.1' },
    { nom: 'RFC 6265 — 4.2 Cookie', url: 'https://www.rfc-editor.org/rfc/rfc6265#section-4.2' },
    { nom: 'RFC 6265 — 5.1.4 Path mosligi', url: 'https://www.rfc-editor.org/rfc/rfc6265#section-5.1.4' },
    { nom: 'RFC 6265 — 5.2.2 Max-Age', url: 'https://www.rfc-editor.org/rfc/rfc6265#section-5.2.2' },
    { nom: 'MDN — Using HTTP cookies', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies' },
    { nom: 'curl — HTTP Cookies', url: 'https://curl.se/docs/http-cookies.html' },
  ],
  sinov: `Yozuv: VPS laboratoriyasi (paket-lab/), bitta \`curl\` buyrug‘ida to‘rt so‘rov (\`--next\`, bitta TCP ulanish), cookie fayli \`-c\`/\`-b\` bilan — brauzer o‘rnida. nginx’da alohida nom \`hisob.sayt.test\` (\`paket-lab/veb/cookie.conf\`): \`/profil\` server ko‘rgan Cookie sarlavhasini qaytaradi. Sessiya qiymati — nginx’ning tasodifiy \`$request_id\`. Ochiq HTTP — sarlavhalar ko‘rinsin deb. ${yozuv.versiyalar.filter((v) => /^(sana|curl|nginx version|TShark)/.test(v)).map((v) => v.replace(/ \(x86.*$/, '')).join(' · ')}`,
  trenajor: { yol: '/web-asoslari/trenajor', nom: 'HTTP laboratoriyasida o‘zingiz yuboring' },
  protokol: {
    izoh: 'HTTP o‘zi hech narsani eslamaydi: har so‘rov alohida. Cookie — server klientga bergan kichik yozuv; klient uni saqlab, shu saytga keyingi so‘rovlarda qaytaradi. Sessiya, til tanlovi, savat shu bilan ishlaydi.',
    faktlar: [['Server', 'Set-Cookie'], ['Klient', 'Cookie'], ['Atributlar', 'Path, Max-Age, HttpOnly, Secure, SameSite'], ['Standart', 'RFC 6265']],
  },
  organasiz: [
    { matn: 'Set-Cookie va Cookie: kim nima yuboradi', qadam: 1 },
    { matn: 'Path qaysi cookie’ni to‘sadi', qadam: 3 },
    { matn: 'Cookie qanday o‘chiriladi', qadam: 4 },
  ],
  afsona: [{ k: 'sorov', nom: 'so‘rov' }, { k: 'javob', nom: 'javob' }, { k: 'ulanish', nom: 'TCP boshqaruvi' }],
  ishtirokchilar: ['klient', 'veb'],
  tugunlar: {
    klient: { ikonka: 'noutbuk', nom: 'Klient', izoh: '192.168.1.10', x: 130, y: 330 },
    router: { ikonka: 'router', nom: 'Router', izoh: '192.168.1.1', x: 420, y: 330 },
    veb: { ikonka: 'server', nom: 'Veb-server', izoh: 'hisob.sayt.test · 80', x: 740, y: 330 },
  },
  chiziqlar: [['klient', 'router'], ['router', 'veb']],
  yollar: {
    'klient>veb': ['klient', 'router', 'veb'], 'veb>klient': ['veb', 'router', 'klient'],
  },
  qadamlar: [
    {
      qisqa: 'Kirish', nishon: 'sozlash',
      sarlavha: 'Set-Cookie: server cookie beradi',
      matn: [
        `Klient \`GET /kirish\` yubordi — cookie’siz. Server javobida **${berildi.length} ta \`Set-Cookie\`** sarlavhasi: har cookie alohida qatorda (RFC 6265, 4.1).`,
        `${berildi.map((c) => `\`${c.nom}=${qisqa(c.qiymat)}\``).join(', ')} — nom va qiymat; nuqtali verguldan keyingilari — **atributlar**: qachongacha saqlash, qaysi yo‘llarga yuborish, kim o‘qiy olishi.`,
      ],
      callout: { tur: 'maslahat', matn: '200 OK paketini oching: uchta `Set-Cookie` qatori. Sessiya qiymati — tasodifiy 32 belgili son, har kirishda boshqacha; uni taxmin qilib bo‘lmasligi kerak.' },
      faktlar: berildi.map((c) => [c.nom, c.atr.join('; ')]),
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        pk(kirish, 'GET /kirish', ['cookie yo‘q'], 'sorov'),
        pk(kirishJ, '200 OK', berildi.map((c) => `Set-Cookie: ${c.nom}=${qisqa(c.qiymat)}`), 'javob'),
        { tur: 'teg', tugun: 'klient', matn: `${berildi.length} cookie saqlandi`, rang: 'ok' },
      ],
    },
    {
      qisqa: 'Atributlar', nishon: 'tushuncha',
      sarlavha: 'Atributlar: qayerga, qachongacha, kimga',
      matn: [
        `**\`Path=/\`** — saytning hamma yo‘llariga; **\`${panel.atr.find((a) => a.startsWith('Path'))}\`** — faqat shu yo‘l bilan boshlanganlarga. **\`${til.atr.find((a) => a.startsWith('Max-Age'))}\`** — shuncha soniya saqlanadi; muddati yo‘q cookie (\`${sessiya.nom}\`, \`${panel.nom}\`) — “sessiya cookie’si”: “joriy sessiya” tugaganda o‘chadi, uni qachon tugatishni brauzer o‘zi belgilaydi (RFC 6265, 4.1.2).`,
        `**\`HttpOnly\`** — sahifadagi JavaScript (\`document.cookie\`) bu cookie’ni ko‘rmaydi, u faqat so‘rovlarga qo‘shiladi: XSS orqali sessiyani o‘g‘irlash qiyinlashadi. **\`SameSite=Lax\`** — boshqa saytdan kelgan ko‘p so‘rovlarda (rasm, fetch) yuborilmaydi, havolani bosganda yuboriladi.`,
      ],
      callout: { tur: 'ogoh', matn: 'Bu yozuv ochiq HTTP’da — sessiya qiymati tarmoqda ochiq matn bo‘lib ketdi, uni ko‘rgan odam sessiyani egallay oladi. Haqiqiy saytda: HTTPS va `Secure` atributi — cookie faqat shifrlangan ulanishda yuboriladi.' },
      faktlar: [['Path', 'qaysi yo‘llarga'], ['Max-Age', 'necha soniya'], ['HttpOnly', 'JavaScript ko‘rmaydi'], ['SameSite', 'boshqa saytdan kelganda'], ['Secure', 'faqat HTTPS']],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        { tur: 'teg', tugun: 'klient', matn: `${sessiya.nom} · ${til.nom} · ${panel.nom}`, rang: 'insight' },
      ],
    },
    {
      qisqa: 'Profil', nishon: 'texnika',
      sarlavha: 'Cookie: klient o‘zi qaytaradi',
      matn: [
        `Keyingi so‘rov — \`GET /profil\`. Klient so‘ramasdan **\`Cookie: ${qisqaCookie(profil1)}\`** qo‘shdi — faqat nom=qiymat, atributlarsiz (RFC 6265, 4.2). Server javobida o‘zi ko‘rganini qaytardi: “${tana(profil1J).replace(sessiya.qiymat, qisqa(sessiya.qiymat))}”.`,
        yuborilmadi.length
          ? `**\`${yuborilmadi.map((c) => c.nom).join('`, `')}\` yuborilmadi**: ${yuborilmadi.map((c) => `\`${c.atr.find((a) => a.startsWith('Path'))}\``).join(', ')}, so‘rov esa \`/profil\` — yo‘l mos kelmadi (RFC 6265, 5.1.4). Path — tartib uchun, xavfsizlik chegarasi emas.`
          : 'Uchala cookie ham yuborildi.',
      ],
      callout: { tur: 'goya', matn: 'Server sessiya qiymatiga qarab “bu — kirgan foydalanuvchi” deydi. Ma’lumotning o‘zi (kim, qanday huquq) serverda saqlanadi; cookie’da — faqat kalit (Web asoslari, 15-bob).' },
      faktlar: [['So‘rov', 'GET /profil'], ['Cookie', qisqaCookie(profil1)], ['Yuborilmadi', yuborilmadi.map((c) => c.nom).join(', ') || '—']],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        { tur: 'teg', tugun: 'klient', matn: null },
        pk(profil1, 'GET /profil', [`Cookie: ${qisqaCookie(profil1)}`], 'sorov'),
        pk(profil1J, '200 OK', ['server ko‘rdi'], 'javob'),
        { tur: 'teg', tugun: 'veb', matn: 'Cookie keldi', rang: 'ok' },
      ],
    },
    {
      qisqa: 'Chiqish', nishon: 'texnika',
      sarlavha: 'Chiqish: cookie qanday o‘chiriladi',
      matn: [
        `\`GET /chiqish\` — cookie’lar yana yuborildi. Server cookie’ni o‘chirish uchun alohida buyruq bermaydi — o‘sha nom bilan yangi \`Set-Cookie\` yuboradi: **\`${ochirish.matn}\`**.`,
        `\`Max-Age=0\` — muddat allaqachon o‘tgan: klient cookie’ni o‘chiradi (RFC 6265, 5.2.2). Nom va \`Path\` eskisi bilan bir xil bo‘lishi kerak — aks holda bu boshqa cookie bo‘lib qoladi.`,
      ],
      callout: { tur: 'maslahat', matn: 'Chiqishda serverdagi sessiyani ham o‘chirish kerak: cookie faqat klientdan o‘chdi, uning nusxasi kimdadir qolgan bo‘lsa, server uni hali qabul qiladi.' },
      faktlar: [['So‘rov', 'GET /chiqish'], ['Cookie', qisqaCookie(chiqish)], ['Javob', ochirish.matn]],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        { tur: 'teg', tugun: 'veb', matn: null },
        pk(chiqish, 'GET /chiqish', [`Cookie: ${qisqaCookie(chiqish)}`], 'sorov'),
        pk(chiqishJ, '200 OK', [`Set-Cookie: ${ochirish.nom}=; Max-Age=0`], 'javob'),
        { tur: 'teg', tugun: 'klient', matn: `${ochirish.nom} o‘chdi`, rang: 'ogoh' },
      ],
    },
    {
      qisqa: 'Xulosa', nishon: 'xulosa',
      sarlavha: 'To‘rt so‘rov — to‘rt xil Cookie',
      matn: [
        `Oxirgi \`GET /profil\` da faqat **\`Cookie: ${cookie(profil2)}\`** qoldi. Server: “${tana(profil2J)}” — sessiya cookie’si yo‘q, haqiqiy sayt endi klientni tanimaydi.`,
        'Cookie’ni server boshqaradi (Set-Cookie), klient esa qoidaga ko‘ra qaytaradi: yo‘l, muddat, xavfsizlik atributlariga qarab. Hammasi oddiy HTTP sarlavhalari — har so‘rovga qo‘shiladi, shuning uchun cookie’lar kichik bo‘lgani yaxshi.',
      ],
      callout: { tur: 'goya', matn: 'Kitob tavsiyasi (Web asoslari, 15-bob): sessiya ID — cookie’da, `Secure` va `HttpOnly` bilan; `SameSite=Lax` (yaxshisi `Strict`). Har kirishda ID yangilanadi — oldindan ma’lum ID ishlamasin.' },
      korinadi: KORINADI,
      kamera: KORINADI,
      kartalar: [{
        sarlavha: 'Yozuvdan: klient yubordi',
        qatorlar: [
          ['GET /kirish', qisqaCookie(kirish)],
          ['GET /profil', qisqaCookie(profil1)],
          ['GET /chiqish', qisqaCookie(chiqish)],
          ['GET /profil', qisqaCookie(profil2), true],
        ],
        joy: 'yuqori-chap',
        izoh: 'Cookie sarlavhasi; sessiya qiymati qisqartirilgan',
      }],
      hodisalar: [
        { tur: 'teg', tugun: 'klient', matn: null },
        pk(profil2, 'GET /profil', [`Cookie: ${cookie(profil2)}`], 'sorov'),
        pk(profil2J, '200 OK', ['sessiya yo‘q'], 'javob'),
      ],
    },
  ],
}
