// "Redirect: http → https" — Paket yo'li darsi. Paketlar VPS laboratoriyasidagi haqiqiy yozuvdan
// (paket-lab/ssenariy/redirect.sh: curl -L http://www.sayt.test/ → nginx 301 → https://sayt.test/). Ikkinchi ulanish
// TLS — "Kalit bilan ochish" shu yozuvning kalitlar jurnalidan. Qiymatlar yozuvdan hisoblanadi.
// docs/vizualizator/paket-yoli.md 4.1 (6-dars)
import yozuv from '../paket/yozuvlar/redirect.json'

const P = yozuv.paketlar
const VEB = '203.0.113.10'
const info = (p) => p.ochiq?.info ?? p.info
const top = (re, dan = 0) => {
  const p = P.find((x) => x.n > dan && re.test(info(x)))
  if (!p) throw new Error(`redirect: yozuvda topilmadi: ${re}`)
  return p
}
const maydon = (p, k) => {
  let r = null
  const yur = (f) => { if (f.k === k && r == null) r = f.s; (f.m ?? []).forEach(yur) }
  ;(p.ochiq?.qatlamlar ?? p.qatlamlar).forEach(yur)
  return r
}
const qiymat = (s) => s.slice(s.indexOf(':') + 1).replace(/\\r\\n$/, '').trim()

const syn80 = top(/ → 80 \[SYN\]/)
const ack80 = top(/ → 80 \[ACK\] Seq=1 Ack=1 /)
const get1 = top(/^GET \//)
const r301 = top(/301 Moved Permanently/)
const syn443 = top(/ → 443 \[SYN\]/)
const ack443 = top(/ → 443 \[ACK\] Seq=1 Ack=1 /)
const ch = top(/Client Hello/)
const sh = top(/Server Hello/)
const fin = top(/^Change Cipher Spec, Finished/, sh.n)
const get2 = top(/^GET \//, fin.n)
const ok = top(/200 OK/)
const eskiFin = top(/ → 80 \[FIN, ACK\]/)

const eskiHost = qiymat(maydon(get1, 'http.host'))
const location = qiymat(maydon(r301, 'http.location'))
const tana301 = qiymat(maydon(r301, 'http.content_length_header'))
const yangiHost = qiymat(maydon(get2, 'http.host'))
const portEski = syn80.info.match(/^(\d+)/)[1]
const portYangi = syn443.info.match(/^(\d+)/)[1]
const ms = (a, b) => `${Math.round((b.t - a.t) * 1000)} ms`

const pk = (p, yorliq, qatorlar, rang, qoshimcha = {}) => {
  const [dan, ga] = p.src === VEB ? ['veb', 'klient'] : ['klient', 'veb']
  return { tur: 'paket', n: p.n, yorliq, qatorlar, rang, dan, ga, ...qoshimcha }
}

export default {
  id: 'redirect',
  tur: 'paket',
  sarlavha: 'Redirect: http → https',
  shior: 'Eski manzil 301 bilan yangisiga yo‘naltiradi — klient yangi ulanish, TLS va qayta so‘rov qiladi.',
  daraja: 'boshlang‘ich',
  daqiqa: 7,
  yozuv,
  kitob: [
    { yol: '/web-asoslari/10-redirectlar', nom: 'Web asoslari, 10: Redirect’lar' },
    { yol: '/web-asoslari/27-hsts', nom: 'Web asoslari, 27: HSTS' },
  ],
  manba: [
    { nom: 'RFC 9110 — 15.4 yo‘naltirish (3xx)', url: 'https://www.rfc-editor.org/rfc/rfc9110#section-15.4' },
    { nom: 'RFC 9110 — 15.4.2 301 Moved Permanently', url: 'https://www.rfc-editor.org/rfc/rfc9110#section-15.4.2' },
    { nom: 'RFC 9110 — 10.2.2 Location', url: 'https://www.rfc-editor.org/rfc/rfc9110#section-10.2.2' },
    { nom: 'nginx — return direktivasi', url: 'https://nginx.org/en/docs/http/ngx_http_rewrite_module.html#return' },
  ],
  sinov: `Yozuv: VPS laboratoriyasi (paket-lab/), \`curl -L http://www.sayt.test/\`; nginx’da \`server_name www.sayt.test; return 301 https://sayt.test$request_uri;\`. Ikkinchi ulanish — sinov CA zanjiri bilan TLS 1.3, kalitlar curl’ning SSLKEYLOGFILE jurnalidan. Router ikki tomonga 10 ms kechikish qo‘shadi. ${yozuv.versiyalar.filter((v) => /^(sana|nginx version|TShark)/.test(v)).join(' · ')}`,
  trenajor: { yol: '/web-asoslari/trenajor', nom: 'HTTP laboratoriyasida o‘zingiz yuboring' },
  protokol: {
    izoh: 'Redirect — server “bu resurs boshqa manzilda” deydi: 3xx kodi va Location sarlavhasi. Klient so‘rovni yangi manzilga o‘zi qayta yuboradi. Eng ko‘p uchraydigani — http’dan https’ga va bir nechta nomdan yagona nomga.',
    faktlar: [['Kodlar', '301, 302, 303, 307, 308'], ['Sarlavha', 'Location'], ['Doimiy', '301 / 308'], ['Vaqtinchalik', '302 / 307'], ['Standart', 'RFC 9110, 15.4']],
  },
  organasiz: [
    { matn: '301 va Location: server nima deydi', qadam: 2 },
    { matn: 'Nega yangi ulanish va TLS kerak bo‘ladi', qadam: 3 },
    { matn: 'Redirect qancha vaqt qo‘shadi', qadam: 6 },
    { matn: '301, 302, 307, 308 farqi', qadam: 7 },
  ],
  afsona: [{ k: 'sorov', nom: 'klient' }, { k: 'javob', nom: 'server' }, { k: 'ulanish', nom: 'TCP / TLS boshqaruvi' }],
  ishtirokchilar: ['klient', 'veb'],
  tugunlar: {
    klient: { ikonka: 'noutbuk', nom: 'Klient', izoh: '192.168.1.10', x: 130, y: 330 },
    router: { ikonka: 'router', nom: 'Router', izoh: '192.168.1.1', x: 420, y: 330 },
    veb: { ikonka: 'server', nom: 'Veb-server', izoh: '203.0.113.10 · 80, 443', x: 740, y: 330 },
  },
  chiziqlar: [['klient', 'router'], ['router', 'veb']],
  yollar: {
    'klient>veb': ['klient', 'router', 'veb'], 'veb>klient': ['veb', 'router', 'klient'],
  },
  qadamlar: [
    {
      qisqa: 'Eski manzil', nishon: 'sozlash',
      sarlavha: 'Foydalanuvchi eski manzilni yozdi',
      matn: [
        `Manzil satrida \`http://${eskiHost}/\` — eski odat: “www” bilan va shifrsiz. Klient 80-portga TCP ulanish ochadi (${ms(syn80, ack80)}) va oddiy **GET** yuboradi, \`Host: ${eskiHost}\`.`,
        'Bu so‘rov ochiq ketadi: yo‘ldagi har kim uni ko‘radi. Sayt egasi esa hammani bitta xavfsiz manzilga yig‘moqchi.',
      ],
      callout: { tur: 'goya', matn: 'Bitta sayt ko‘p manzilda ochilishi mumkin: http/https, www bilan va www’siz. Qidiruv tizimlari va havolalar uchun bittasi **yagona (kanonik)** bo‘lishi kerak — qolganlari unga yo‘naltiriladi.' },
      faktlar: [['Manzil', `http://${eskiHost}/`], ['Port', '80 (shifrsiz)'], ['Klient porti', portEski]],
      korinadi: ['klient', 'router', 'veb'],
      kamera: ['klient', 'router', 'veb'],
      hodisalar: [
        pk(syn80, 'SYN', ['→ 80'], 'ulanish'),
        pk(ack80, 'ACK', [], 'ulanish'),
        pk(get1, 'GET /', [`Host: ${eskiHost}`], 'sorov'),
      ],
    },
    {
      qisqa: '301', nishon: 'texnika',
      sarlavha: '301: “bu yerda emas, mana u yerda”',
      matn: [
        `Server sahifani bermadi. **301 Moved Permanently** va **\`Location: ${location}\`** qaytardi — “resurs doimiy ko‘chdi”. Tanada ${tana301} baytlik qisqa HTML eslatma (RFC 9110 shuni tavsiya qiladi), lekin klient unga qaramaydi.`,
        `nginx’da bu bitta qator: \`return 301 https://sayt.test$request_uri;\` — so‘ralgan yo‘l saqlanadi, faqat sxema va nom almashadi. Javob ${ms(get1, r301)} da keldi.`,
      ],
      callout: { tur: 'maslahat', matn: '301 paketini oching: `Location` sarlavhasi — yangi manzil. 301 “doimiy” degani: brauzer va qidiruv tizimlari uni eslab qoladi, keyingi safar to‘g‘ridan-to‘g‘ri yangi manzilga boradi.' },
      faktlar: [['Kod', '301 Moved Permanently'], ['Location', location], ['Tana', `${tana301} B (eslatma)`], ['Vaqt', ms(get1, r301)]],
      korinadi: ['klient', 'router', 'veb'],
      kamera: ['klient', 'router', 'veb'],
      hodisalar: [
        pk(r301, '301 MOVED PERMANENTLY', [`Location: ${location}`], 'javob'),
        { tur: 'teg', tugun: 'klient', matn: `→ ${location}`, rang: 'insight' },
      ],
    },
    {
      qisqa: 'Yangi ulanish', nishon: 'texnika',
      sarlavha: 'Boshqa port — yangi ulanish',
      matn: [
        `Yangi manzil https — port **443**. Eski ulanish 80-portga, uni ishlatib bo‘lmaydi: klient yangi TCP ulanish ochadi (vaqtinchalik port ${portYangi}). Kelishuv yana ${ms(syn443, ack443)}.`,
        `Qiziq tafsilot: eski 80-port ulanishi yopilmadi — curl uni oxirigacha ochiq qoldirdi va faqat ishni tugatgach yopdi (${eskiFin.n}-paket).`,
      ],
      callout: { tur: 'goya', matn: 'Agar redirect boshqa serverga bo‘lsa (masalan, boshqa domen), yangi DNS so‘rovi ham qo‘shilardi. Bu yerda nom bitta serverda.' },
      faktlar: [['Yangi port', '443'], ['Klient porti', portYangi], ['Kelishuv', ms(syn443, ack443)]],
      korinadi: ['klient', 'router', 'veb'],
      kamera: ['klient', 'router', 'veb'],
      hodisalar: [
        { tur: 'teg', tugun: 'klient', matn: null },
        pk(syn443, 'SYN', ['→ 443'], 'ulanish'),
        pk(ack443, 'ACK', [], 'ulanish'),
        { tur: 'teg', tugun: 'veb', matn: '2-ulanish', rang: 'info' },
      ],
    },
    {
      qisqa: 'TLS', nishon: 'texnika',
      sarlavha: 'TLS kelishuvi',
      matn: [
        `https bo‘lgani uchun avval TLS: ClientHello (SNI: ${yangiHost}), server ServerHello va shifrlangan sertifikat, klient Finished. Bu yana bitta borib-kelish — ${ms(ch, sh)}.`,
        'Batafsil “TLS 1.3” darsida. Bu yerda muhimi: redirect tufayli bu ish **ikkinchi** ulanishda bajarildi.',
      ],
      callout: { tur: 'maslahat', matn: 'Paketlarni bosib, inspektorda “Kalit bilan ochish”ni yoqing — shifrlangan sertifikat va Finished ko‘rinadi.' },
      faktlar: [['SNI', yangiHost], ['CH → SH', ms(ch, sh)]],
      korinadi: ['klient', 'router', 'veb'],
      kamera: ['klient', 'router', 'veb'],
      hodisalar: [
        { tur: 'teg', tugun: 'veb', matn: null },
        pk(ch, 'CLIENT HELLO', [`SNI ${yangiHost}`], 'sorov'),
        pk(sh, 'SERVER HELLO + …', ['sertifikat (shifrlangan)'], 'javob'),
        pk(fin, 'FINISHED', [], 'sorov'),
        { tur: 'teg', tugun: 'klient', matn: 'shifrlangan kanal ✓', rang: 'ok' },
      ],
    },
    {
      qisqa: 'Sahifa', nishon: 'texnika',
      sarlavha: 'Xuddi shu so‘rov — endi yangi manzilga',
      matn: [
        `Klient GET’ni qayta yubordi — endi \`Host: ${yangiHost}\` va shifrlangan. Server **200 OK** bilan sahifani berdi.`,
        'GET metodi saqlandi. POST bo‘lganida 301 dan keyin curl ham, brauzer ham uni GET’ga almashtirib, tanani tashlab yuborardi — shuning uchun API’da 308 ishlatiladi (Web asoslari, 10-bob).',
      ],
      callout: { tur: 'maslahat', matn: 'Ikki GET’ni solishtiring: birinchisi ochiq va `Host: www.sayt.test`, ikkinchisi faqat “Kalit bilan ochish”dan keyin ko‘rinadi.' },
      faktlar: [['So‘rov', `GET / · Host: ${yangiHost}`], ['Javob', '200 OK'], ['GET → javob', ms(get2, ok)]],
      korinadi: ['klient', 'router', 'veb'],
      kamera: ['klient', 'router', 'veb'],
      hodisalar: [
        { tur: 'teg', tugun: 'klient', matn: null },
        pk(get2, 'GET / (shifrlangan)', [`Host: ${yangiHost}`], 'sorov'),
        pk(ok, '200 OK (shifrlangan)', [], 'javob'),
        { tur: 'teg', tugun: 'klient', matn: 'sahifa keldi ✓', rang: 'ok' },
      ],
    },
    {
      qisqa: 'Narx', nishon: 'muammo',
      sarlavha: 'Redirect bepul emas',
      matn: [
        `Birinchi SYN’dan yangi SYN’gacha **${ms(syn80, syn443)}** — bu faqat “qayerga borish kerak”ligini bilish uchun: TCP kelishuvi va bitta so‘rov-javob, ya’ni ikki borib-kelish.`,
        `Jami birinchi SYN’dan sahifagacha ${ms(syn80, ok)}. Shuning uchun havolalar va API mijozlari to‘g‘ridan-to‘g‘ri yakuniy manzilni ishlatishi kerak, redirect esa eski havolalar uchun qoladi.`,
      ],
      callout: { tur: 'ogoh', matn: 'Birinchi ochiq so‘rov — xavf ham: yo‘ldagi tajovuzkor 301 o‘rniga o‘zinikini qaytarishi mumkin. **HSTS** brauzerga “bu saytga faqat https bilan kel” deydi — keyingi safar ochiq so‘rov umuman ketmaydi (Web asoslari, 27-bob).' },
      faktlar: [['Redirect narxi', ms(syn80, syn443)], ['SYN → 200 OK', ms(syn80, ok)]],
      korinadi: ['klient', 'router', 'veb'],
      kamera: ['klient', 'router', 'veb'],
      kartalar: [{
        sarlavha: 'Yozuvdan: vaqt',
        qatorlar: [
          ['80: TCP kelishuvi', ms(syn80, ack80)],
          ['80: GET → 301', ms(get1, r301)],
          ['443: TCP kelishuvi', ms(syn443, ack443)],
          ['443: TLS (CH → SH)', ms(ch, sh)],
          ['443: GET → 200', ms(get2, ok)],
          ['redirect narxi', ms(syn80, syn443), true],
        ],
        joy: 'yuqori-chap',
        izoh: 'klient tomonida o‘lchangan',
      }],
      hodisalar: [{ tur: 'teg', tugun: 'klient', matn: null }],
    },
    {
      qisqa: 'Kodlar', nishon: 'xulosa',
      sarlavha: 'Qaysi kodni qachon',
      matn: [
        'Doimiy ko‘chish — **301** yoki **308**; vaqtinchalik — **302** yoki **307**. 307 va 308 metodni va tanani **albatta** saqlaydi; 301 va 302 da mijoz tarixiy sabab bilan POST’ni GET’ga almashtirishi mumkin (RFC 9110, 15.4).',
        'http → https va www → asosiy nom — doimiy: 301 (sahifalar uchun) yoki 308 (API uchun).',
      ],
      callout: { tur: 'goya', matn: 'O‘zingiz ko‘ring: `curl -sI http://github.com` — 301 va `Location: https://github.com/` (Web asoslari, 10-bob).' },
      korinadi: ['klient', 'router', 'veb'],
      kamera: ['klient', 'router', 'veb'],
      kartalar: [{
        sarlavha: '3xx yo‘naltirish',
        qatorlar: [
          ['301 doimiy', 'POST → GET mumkin'],
          ['308 doimiy', 'metod saqlanadi'],
          ['302 vaqtinchalik', 'POST → GET mumkin'],
          ['307 vaqtinchalik', 'metod saqlanadi'],
        ],
        joy: 'yuqori-chap',
        izoh: 'RFC 9110, 15.4',
      }],
      hodisalar: [],
    },
  ],
}
