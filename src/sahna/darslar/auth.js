// "HTTP autentifikatsiya" — Paket yo'li darsi. Paketlar VPS laboratoriyasidagi haqiqiy yozuvdan (paket-lab/ssenariy/auth.sh:
// bitta ulanishda ma'lumotsiz, xato parol va to'g'ri parol bilan GET; nginx auth_basic, paket-lab/veb/panel.conf).
// Login/parol — faqat laboratoriya uchun sinov qiymatlari. Qiymatlar yozuvdan hisoblanadi.
// docs/vizualizator/paket-yoli.md 4.1 (12-dars)
import yozuv from '../paket/yozuvlar/auth.json'

const P = yozuv.paketlar
const VEB = '203.0.113.10'
const top = (re, dan = 0) => {
  const p = P.find((x) => x.n > dan && re.test(x.info))
  if (!p) throw new Error(`auth: yozuvda topilmadi: ${re}`)
  return p
}
const maydonlar = (p, k) => {
  const r = []
  const yur = (f) => { if (f.k === k) r.push(f.s); (f.m ?? []).forEach(yur) }
  p.qatlamlar.forEach(yur)
  return r
}
const qiymat = (s) => s.slice(s.indexOf(':') + 1).replace(/\\r\\n$/, '').trim()
const bitta = (p, k) => { const s = maydonlar(p, k)[0]; return s ? qiymat(s) : null }

const get1 = top(/^GET \//)
const r401a = top(/401 Unauthorized/, get1.n)
const get2 = top(/^GET \//, r401a.n)
const r401b = top(/401 Unauthorized/, get2.n)
const get3 = top(/^GET \//, r401b.n)
const ok = top(/200 OK/, get3.n)

const chaqiruv = bitta(r401a, 'http.www_authenticate')
const realm = chaqiruv.match(/realm="([^"]*)"/)?.[1]
const auth2 = bitta(get2, 'http.authorization')
const auth3 = bitta(get3, 'http.authorization')
const b64 = auth3.replace(/^Basic\s+/, '')
// base64 ni ochish — yozuvdagi qiymatdan, brauzer/Node'ning atob() bilan (tshark ham xuddi shuni ko'rsatgan: http.authbasic)
const ochiq = atob(b64)
const login = ochiq.split(':')[0]
const tsharkOchdi = bitta(get3, 'http.authbasic')

const pk = (p, yorliq, qatorlar, rang, qoshimcha = {}) => {
  const [dan, ga] = p.src === VEB ? ['veb', 'klient'] : ['klient', 'veb']
  return { tur: 'paket', n: p.n, yorliq, qatorlar, rang, dan, ga, ...qoshimcha }
}
const KORINADI = ['klient', 'router', 'veb']

export default {
  id: 'http-auth',
  tur: 'paket',
  sarlavha: 'HTTP autentifikatsiya',
  shior: '401 — “kimsiz?”, Authorization — “manaman”. Basic’da login va parol tarmoqda deyarli ochiq ketadi.',
  daraja: 'boshlang‘ich',
  daqiqa: 6,
  yozuv,
  kitob: [
    { yol: '/web-asoslari/16-http-autentifikatsiya', nom: 'Web asoslari, 16: HTTP autentifikatsiyasi' },
  ],
  manba: [
    { nom: 'RFC 9110 — 11 HTTP autentifikatsiyasi', url: 'https://www.rfc-editor.org/rfc/rfc9110#section-11' },
    { nom: 'RFC 9110 — 15.5.2 401 Unauthorized', url: 'https://www.rfc-editor.org/rfc/rfc9110#section-15.5.2' },
    { nom: 'RFC 7617 — Basic sxemasi', url: 'https://www.rfc-editor.org/rfc/rfc7617' },
    { nom: 'nginx — ngx_http_auth_basic_module', url: 'https://nginx.org/en/docs/http/ngx_http_auth_basic_module.html' },
  ],
  sinov: `Yozuv: VPS laboratoriyasi (paket-lab/), bitta \`curl\` buyrug‘ida uch so‘rov (\`--next\`, bitta TCP ulanish): ma’lumotsiz, \`-u lab:xato-parol\`, \`-u lab:sinov-parol\`. nginx’da \`panel.sayt.test\` — \`auth_basic\`, parol fayli \`openssl passwd -apr1\` bilan (\`paket-lab/veb/panel.conf\`). Login va parol faqat shu laboratoriya uchun. Ochiq HTTP — base64 tarmoqda qanday ko‘rinishini ko‘rsatish uchun. ${yozuv.versiyalar.filter((v) => /^(sana|curl|nginx version|TShark)/.test(v)).map((v) => v.replace(/ \(x86.*$/, '')).join(' · ')}`,
  trenajor: { yol: '/web-asoslari/trenajor', nom: 'HTTP laboratoriyasida o‘zingiz yuboring' },
  protokol: {
    izoh: 'HTTP’ning o‘z kirish mexanizmi: server 401 va WWW-Authenticate bilan “qanday kirish kerak”ni aytadi (chaqiruv), klient Authorization sarlavhasi bilan javob beradi. Basic — eng sodda sxema: login va parol base64’da.',
    faktlar: [['Chaqiruv', '401 + WWW-Authenticate'], ['Javob', 'Authorization'], ['Basic', 'base64(login:parol)'], ['Standart', 'RFC 9110 (11), RFC 7617']],
  },
  organasiz: [
    { matn: 'Chaqiruv: 401 va WWW-Authenticate', qadam: 1 },
    { matn: 'Authorization sarlavhasi qanday yasaladi', qadam: 3 },
    { matn: 'Nega base64 — shifr emas', qadam: 4 },
  ],
  afsona: [{ k: 'sorov', nom: 'so‘rov' }, { k: 'javob', nom: 'javob' }, { k: 'ulanish', nom: 'TCP boshqaruvi' }],
  ishtirokchilar: ['klient', 'veb'],
  tugunlar: {
    klient: { ikonka: 'noutbuk', nom: 'Klient', izoh: '192.168.1.10', x: 130, y: 330 },
    router: { ikonka: 'router', nom: 'Router', izoh: '192.168.1.1', x: 420, y: 330 },
    veb: { ikonka: 'server', nom: 'Veb-server', izoh: 'panel.sayt.test · 80', x: 740, y: 330 },
  },
  chiziqlar: [['klient', 'router'], ['router', 'veb']],
  yollar: {
    'klient>veb': ['klient', 'router', 'veb'], 'veb>klient': ['veb', 'router', 'klient'],
  },
  qadamlar: [
    {
      qisqa: 'Chaqiruv', nishon: 'sozlash',
      sarlavha: '401: server “kimsiz?” deydi',
      matn: [
        'Klient himoyalangan sahifani oddiy so‘radi — login-parolsiz. Server **401 Unauthorized** qaytardi va **chaqiruv** (challenge) berdi:',
        `**\`WWW-Authenticate: ${chaqiruv}\`** — sxema \`Basic\`, himoyalangan soha (realm) — “${realm}”. Realm — himoyalangan soha nomi; brauzer shu javobdan keyin login oynasini ochadi (RFC 9110, 11.5–11.6.1).`,
      ],
      callout: { tur: 'goya', matn: '401 — “ma’lumot yo‘q yoki yaroqsiz, qayta urining”. 403 — “siz kimligingiz ma’lum, lekin huquq yetmaydi”: qayta kirish foyda bermaydi (Web asoslari, 16-bob).' },
      faktlar: [['Javob', '401 Unauthorized'], ['Sxema', 'Basic'], ['Realm', realm]],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        pk(get1, 'GET /', ['Authorization yo‘q'], 'sorov'),
        pk(r401a, '401 UNAUTHORIZED', [`WWW-Authenticate: Basic`, `realm="${realm}"`], 'javob'),
        { tur: 'teg', tugun: 'klient', matn: 'login oynasi', rang: 'ogoh' },
      ],
    },
    {
      qisqa: 'Xato', nishon: 'texnika',
      sarlavha: 'Xato parol — yana 401',
      matn: [
        `Klient login va parol bilan qayta so‘radi: **\`Authorization: ${auth2}\`**. Parol xato — server yana **401** va xuddi o‘sha chaqiruvni qaytardi.`,
        'Javob birinchisi bilan bir xil — login xatomi yoki parolmi, server aytmadi.',
      ],
      callout: { tur: 'maslahat', matn: 'Ikki `GET` paketini solishtiring: farq faqat `Authorization` qatorida. HTTP holatni eslamaydi — har so‘rov o‘zi bilan ma’lumot olib keladi.' },
      faktlar: [['Authorization', auth2], ['Javob', '401 Unauthorized']],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        { tur: 'teg', tugun: 'klient', matn: null },
        pk(get2, 'GET /', [`Authorization: ${auth2.slice(0, 22)}…`], 'sorov'),
        pk(r401b, '401 UNAUTHORIZED', ['yana chaqiruv'], 'javob'),
        { tur: 'teg', tugun: 'klient', matn: 'xato ✗', rang: 'xato' },
      ],
    },
    {
      qisqa: 'Kirdi', nishon: 'texnika',
      sarlavha: 'To‘g‘ri parol — 200 OK',
      matn: [
        `Uchinchi urinish: **\`Authorization: ${auth3}\`** — server **200 OK** va sahifani berdi.`,
        `Sarlavha qanday yasaladi (RFC 7617, 2): login va parol \`:\` bilan qo‘shiladi — \`${login}:…\` — va **base64** bilan kodlanadi. curl \`-u\` bilan buni o‘zi qildi, brauzer esa login oynasidan keyin.`,
      ],
      callout: { tur: 'ogoh', matn: 'Basic’da login-parol **har so‘rovda** qayta yuboriladi — brauzer ularni eslab qoladi va shu saytga har safar qo‘shadi. Bitta ochiq so‘rov ham ularni oshkor qiladi.' },
      faktlar: [['Authorization', auth3], ['Javob', '200 OK']],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        { tur: 'teg', tugun: 'klient', matn: null },
        pk(get3, 'GET /', [`Authorization: Basic ${b64}`], 'sorov'),
        pk(ok, '200 OK', ['sahifa'], 'javob'),
        { tur: 'teg', tugun: 'klient', matn: 'kirdi ✓', rang: 'ok' },
      ],
    },
    {
      qisqa: 'base64', nishon: 'tushuncha',
      sarlavha: 'base64 — shifr emas',
      matn: [
        `\`${b64}\` — kodlash, kalitsiz qaytariladi: \`atob('${b64}')\` → **\`${ochiq}\`**. Bu yozuvni ochgan tshark ham uni o‘zi ochib ko‘rsatdi: “Credentials: ${tsharkOchdi}”.`,
        'Ya’ni ochiq HTTP’da Basic — login va parolni tarmoqqa ochiq yozish bilan teng: yo‘ldagi har bir tugun (Wi-Fi, provayder, proxy) ularni o‘qiy oladi.',
      ],
      callout: { tur: 'ogoh', matn: 'Basic faqat HTTPS bilan (Web asoslari, 16-bob; RFC 7617, 4). Bu laboratoriyada ochiq HTTP — faqat ko‘rsatish uchun. Yo‘ldagi kuzatuvchi nimani ko‘rishi — 13-darsda.' },
      faktlar: [['Simda', b64], ['Ochilgani', ochiq], ['Kalit', 'kerak emas']],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        { tur: 'teg', tugun: 'klient', matn: null },
        { tur: 'teg', tugun: 'router', matn: `ko‘radi: ${ochiq}`, rang: 'xato' },
      ],
    },
    {
      qisqa: 'Xulosa', nishon: 'xulosa',
      sarlavha: 'Chaqiruv va javob — ikki sarlavha',
      matn: [
        'HTTP autentifikatsiyasi — ikki sarlavha: server `WWW-Authenticate` bilan usulni aytadi, klient `Authorization` bilan ma’lumot beradi. Holat saqlanmaydi: ma’lumot har so‘rovda qaytadi.',
        'Basic’da parol har so‘rovda ketadi. Boshqa yo‘llar: kirish formasi va sessiya cookie’si (10-dars; Web asoslari, 15-bob) yoki `Bearer` token (16-bob) — u ham o‘sha `Authorization` sarlavhasida.',
      ],
      callout: { tur: 'maslahat', matn: 'nginx’da himoyalangan `location` da `return` ishlatmang: u tekshiruvdan oldingi bosqichda ishlaydi va `auth_basic` ni chetlab o‘tadi. Kontentni fayl yoki `proxy_pass` bilan bering (Web asoslari, 16-bob).' },
      korinadi: KORINADI,
      kamera: KORINADI,
      kartalar: [{
        sarlavha: 'Yozuvdan: uch so‘rov',
        qatorlar: [
          ['ma’lumotsiz', '401'],
          ['xato parol', '401'],
          ['to‘g‘ri parol', '200', true],
          ['simdagi qiymat', b64],
          ['ochilgani', ochiq],
        ],
        joy: 'yuqori-chap',
        izoh: 'sinov login-paroli, faqat laboratoriya uchun',
      }],
      hodisalar: [{ tur: 'teg', tugun: 'router', matn: null }],
    },
  ],
}
