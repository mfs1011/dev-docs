// "CORS" — Paket yo'li darsi. Paketlar VPS laboratoriyasidagi haqiqiy yozuvdan: headless Chromium (paket-lab/brauzer)
// sayt.test/cors.html ni ochadi, sahifadagi JavaScript api.sayt.test ga GET, PUT (JSON) va DELETE yuboradi
// (paket-lab/ssenariy/cors.sh, paket-lab/veb/api.conf). CORS'ni brauzer qo'llaydi — shuning uchun curl emas, brauzer.
// docs/vizualizator/paket-yoli.md 4.1 (11-dars)
import yozuv from '../paket/yozuvlar/cors.json'

const P = yozuv.paketlar
const VEB = '203.0.113.10'
const top = (re, dan = 0) => {
  const p = P.find((x) => x.n > dan && re.test(x.info))
  if (!p) throw new Error(`cors: yozuvda topilmadi: ${re}`)
  return p
}
const maydonlar = (p, k) => {
  const r = []
  const yur = (f) => { if (f.k === k) r.push(f.s); (f.m ?? []).forEach(yur) }
  p.qatlamlar.forEach(yur)
  return r
}
const qiymat = (s) => s.slice(s.indexOf(':') + 1).replace(/\\r\\n$/, '').trim()
const sarlavha = (p, nom) => {
  const s = [...maydonlar(p, 'http.request.line'), ...maydonlar(p, 'http.response.line')].find((x) => x.toLowerCase().startsWith(`${nom.toLowerCase()}:`))
  return s ? qiymat(s) : null
}
const port = (p) => p.info.match(/^(\d+) → 80/)?.[1] ?? null

const sahifa = top(/^GET \/cors\.html /)
const sahifaJ = top(/200 OK/, sahifa.n)
const get = top(/^GET \/narx /)
const getJ = top(/200 OK/, get.n)
const opt1 = top(/^OPTIONS \/narx /)
const opt1J = top(/204 No Content/, opt1.n)
const put = top(/^PUT \/narx /)
const putJ = top(/200 OK/, put.n)
const opt2 = top(/^OPTIONS \/narx /, putJ.n)
const opt2J = top(/204 No Content/, opt2.n)
const deleteBormi = P.some((x) => /^DELETE /.test(x.info))
const synlar = P.filter((x) => / → 80 \[SYN\]/.test(x.info))

const origin = sarlavha(get, 'Origin')
const acao = sarlavha(getJ, 'Access-Control-Allow-Origin')
const acrm1 = sarlavha(opt1, 'Access-Control-Request-Method')
const acrh1 = sarlavha(opt1, 'Access-Control-Request-Headers')
const acrm2 = sarlavha(opt2, 'Access-Control-Request-Method')
const acam = sarlavha(opt1J, 'Access-Control-Allow-Methods')
const acah = sarlavha(opt1J, 'Access-Control-Allow-Headers')
const maxAge = sarlavha(opt1J, 'Access-Control-Max-Age')
const putCt = qiymat(maydonlar(put, 'http.content_type')[0] ?? 'Content-Type: —')
const sahifaCe = maydonlar(sahifaJ, 'http.content_encoding')[0]
const ms = (a, b) => `${Math.round((b.t - a.t) * 1000)} ms`

// sahifa va API qaysi TCP ulanishlarda ketdi (manba port bo'yicha) — kuzatuv
const sahifaPort = P.find((x) => x.n < sahifa.n && / → 80 \[SYN\]/.test(x.info) && x.src !== VEB)
const apiPort = [...P].reverse().find((x) => x.n < get.n && / → 80 \[SYN\]/.test(x.info))
const alohidaUlanish = port(sahifaPort) !== port(apiPort)
// brauzer ochib, ishlatmagan ulanish ham bo'lishi mumkin (oldindan ochilgan): HTTP so'rovi o'tmagan manba portlar
const manbaPort = (p) => { const s = maydonlar(p, 'tcp.srcport')[0]; return s ? qiymat(s) : null }
const ishlatilgan = new Set(P.filter((x) => /^(GET|PUT|OPTIONS|DELETE) /.test(x.info)).map(manbaPort))
const bekor = synlar.filter((x) => !ishlatilgan.has(manbaPort(x))).length

const pk = (p, yorliq, qatorlar, rang, qoshimcha = {}) => {
  const [dan, ga] = p.src === VEB ? ['veb', 'brauzer'] : ['brauzer', 'veb']
  return { tur: 'paket', n: p.n, yorliq, qatorlar, rang, dan, ga, ...qoshimcha }
}
const KORINADI = ['brauzer', 'router', 'veb']

export default {
  id: 'cors',
  tur: 'paket',
  sarlavha: 'CORS preflight',
  shior: 'Boshqa manbaga so‘rovdan oldin brauzer serverdan ruxsat so‘raydi — va ruxsat bo‘lmasa, so‘rovni umuman yubormaydi.',
  daraja: 'o‘rta',
  daqiqa: 8,
  yozuv,
  yozuvNuqta: 'Brauzer tomonida yozilgan (uy tarmog‘i)',
  kitob: [
    { yol: '/web-asoslari/19-cors', nom: 'Web asoslari, 19: CORS' },
    { yol: '/web-asoslari/18-same-origin', nom: 'Web asoslari, 18: Same-origin siyosati' },
  ],
  manba: [
    { nom: 'Fetch standarti — 3.3 CORS protokoli', url: 'https://fetch.spec.whatwg.org/#http-cors-protocol' },
    { nom: 'Fetch standarti — CORS-safelisted method', url: 'https://fetch.spec.whatwg.org/#cors-safelisted-method' },
    { nom: 'Fetch standarti — CORS-safelisted request-header', url: 'https://fetch.spec.whatwg.org/#cors-safelisted-request-header' },
    { nom: 'Fetch standarti — 4.8 CORS-preflight fetch', url: 'https://fetch.spec.whatwg.org/#cors-preflight-fetch' },
    { nom: 'Fetch standarti — 4.9 CORS-preflight cache', url: 'https://fetch.spec.whatwg.org/#cors-preflight-cache' },
    { nom: 'MDN — CORS', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS' },
  ],
  sinov: `Yozuv: VPS laboratoriyasi (paket-lab/), haqiqiy headless Chromium uy tarmog‘idagi ikkinchi kompyuterda (192.168.1.20). Sahifa \`http://sayt.test/cors.html\` dagi JavaScript \`fetch\` bilan \`http://api.sayt.test/narx\` ga uch so‘rov yubordi; brauzer jurnali: \`GET: 200\`, \`PUT: 200\`, \`DELETE: TypeError: Failed to fetch\`. Ikkala nom bitta nginx’da (\`paket-lab/veb/api.conf\`). Router ikki tomonga 10 ms kechikish qo‘shadi. ${yozuv.versiyalar.filter((v) => /^(sana|Chromium|nginx version|TShark)/.test(v)).map((v) => v.replace(/ built on.*$/, '')).join(' · ')}`,
  trenajor: { yol: '/web-asoslari/trenajor', nom: 'HTTP laboratoriyasida o‘zingiz yuboring' },
  protokol: {
    izoh: 'Brauzer bir manbadagi (origin) sahifaga boshqa manbadan javobni o‘qishni sukut bo‘yicha taqiqlaydi (same-origin). CORS — server shu taqiqni ochiq ruxsat bilan yumshatadigan sarlavhalar. Ruxsatni brauzer tekshiradi.',
    faktlar: [['Manba (origin)', 'sxema + xost + port'], ['Ruxsat', 'Access-Control-Allow-*'], ['Oldindan tekshiruv', 'OPTIONS (preflight)'], ['Standart', 'Fetch (WHATWG)']],
  },
  organasiz: [
    { matn: 'Qachon preflight bo‘ladi, qachon yo‘q', qadam: 3 },
    { matn: 'Preflight javobidagi ruxsat sarlavhalari', qadam: 3 },
    { matn: 'Rad etilgan so‘rov tarmoqqa chiqmaydi', qadam: 5 },
  ],
  afsona: [{ k: 'sorov', nom: 'so‘rov' }, { k: 'javob', nom: 'javob' }, { k: 'ulanish', nom: 'preflight' }],
  ishtirokchilar: ['brauzer', 'veb'],
  tugunlar: {
    brauzer: { ikonka: 'noutbuk', nom: 'Brauzer', izoh: 'Chromium · 192.168.1.20', x: 130, y: 330 },
    router: { ikonka: 'router', nom: 'Router', izoh: '192.168.1.1', x: 420, y: 330 },
    veb: { ikonka: 'server', nom: 'Veb-server', izoh: 'sayt.test · api.sayt.test', x: 740, y: 330 },
  },
  chiziqlar: [['brauzer', 'router'], ['router', 'veb']],
  yollar: {
    'brauzer>veb': ['brauzer', 'router', 'veb'], 'veb>brauzer': ['veb', 'router', 'brauzer'],
  },
  qadamlar: [
    {
      qisqa: 'Sahifa', nishon: 'sozlash',
      sarlavha: 'Sahifa bir manbadan, API — boshqasidan',
      matn: [
        `Brauzer \`http://sayt.test/cors.html\` ni ochdi.${sahifaCe ? ' (Brauzer `Accept-Encoding: gzip` yubordi — sahifa siqilgan keldi, 8-dars.)' : ''} Sahifadagi JavaScript \`http://api.sayt.test/narx\` ga so‘rov yubormoqchi.`,
        '**Manba** (origin) — sxema, xost va port birga. `http://sayt.test` va `http://api.sayt.test` — xost boshqa, demak **boshqa manba**, garchi ikkalasi bitta serverda, bitta IP’da bo‘lsa ham. Bunday so‘rov javobini o‘qish uchun server ruxsat berishi kerak.',
      ],
      callout: { tur: 'goya', matn: 'Manba IP bo‘yicha emas, nom bo‘yicha. `https://sayt.test` ham `http://sayt.test` ga nisbatan boshqa manba (sxema farq qiladi).' },
      faktlar: [['Sahifa manbasi', 'http://sayt.test'], ['API manbasi', 'http://api.sayt.test'], ['IP', `${VEB} (ikkalasi)`]],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        pk(sahifa, 'GET /cors.html', ['Host: sayt.test'], 'sorov'),
        pk(sahifaJ, '200 OK', ['sahifa + JavaScript'], 'javob'),
        { tur: 'teg', tugun: 'brauzer', matn: 'origin: http://sayt.test', rang: 'info' },
      ],
    },
    {
      qisqa: 'Oddiy', nishon: 'texnika',
      sarlavha: 'Oddiy so‘rov: Origin → Access-Control-Allow-Origin',
      matn: [
        `Birinchi so‘rov — oddiy \`GET\`. Brauzer o‘zi **\`Origin: ${origin}\`** qo‘shdi — JavaScript bu sarlavhani yozmagan. Server javobida **\`Access-Control-Allow-Origin: ${acao}\`**: “shu manbadagi sahifa javobni o‘qisin”. Brauzer javobni JavaScript’ga berdi.`,
        `Oldindan tekshiruv bo‘lmadi: \`GET\` — “xavfsiz ro‘yxat”dagi metod (GET, HEAD, POST), qo‘shimcha sarlavha ham yo‘q.${alohidaUlanish ? ' Bu yozuvda API so‘rovlari sahifadan alohida TCP ulanishda ketdi.' : ''}`,
      ],
      callout: { tur: 'ogoh', matn: 'Javob tarmoqdan baribir keldi — ruxsat bo‘lmasa ham. CORS so‘rovni emas, javobni o‘qishni to‘sadi; oddiy so‘rov serverga yetib boradi. Shuning uchun server tomondagi tekshiruv (autentifikatsiya, CSRF himoyasi) baribir kerak.' },
      faktlar: [['So‘rov', 'GET /narx'], ['Origin', origin], ['Access-Control-Allow-Origin', acao], ['Preflight', 'yo‘q']],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        pk(get, 'GET /narx', [`Origin: ${origin}`], 'sorov'),
        pk(getJ, '200 OK', [`ACAO: ${acao}`], 'javob'),
        { tur: 'teg', tugun: 'brauzer', matn: 'JS javobni oldi ✓', rang: 'ok' },
      ],
    },
    {
      qisqa: 'Preflight', nishon: 'tushuncha',
      sarlavha: 'PUT oldidan: OPTIONS bilan ruxsat so‘rash',
      matn: [
        `Ikkinchi so‘rov — \`PUT\` va \`Content-Type: ${putCt}\`. Ikkalasi ham “xavfsiz ro‘yxat”da yo‘q (Content-Type faqat form va text/plain turlari bilan xavfsiz). Shuning uchun brauzer **avval** \`OPTIONS\` yubordi — **preflight**: \`Access-Control-Request-Method: ${acrm1}\`, \`Access-Control-Request-Headers: ${acrh1}\`. Tana yo‘q — bu faqat savol.`,
        `Server javobi \`204 No Content\`: **\`Allow-Methods: ${acam}\`**, **\`Allow-Headers: ${acah}\`**, **\`Max-Age: ${maxAge}\`** — “PUT mumkin, Content-Type bilan; bu javobni ${maxAge} soniya eslab qol”.`,
      ],
      callout: { tur: 'maslahat', matn: 'OPTIONS paketini oching: `Origin`, `Access-Control-Request-*` va `Sec-Fetch-Mode: cors` — bularni brauzer o‘zi qo‘shgan. JavaScript’dan ularni yozib bo‘lmaydi.' },
      faktlar: [['Metod', `OPTIONS → ${acrm1}?`], ['Sarlavha', acrh1], ['Ruxsat', acam], ['Max-Age', `${maxAge} s`]],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        { tur: 'teg', tugun: 'brauzer', matn: null },
        pk(opt1, 'OPTIONS /narx', [`Request-Method: ${acrm1}`, `Request-Headers: ${acrh1}`], 'ulanish'),
        pk(opt1J, '204 NO CONTENT', [`Allow-Methods: ${acam}`, `Max-Age: ${maxAge}`], 'ulanish'),
        { tur: 'teg', tugun: 'brauzer', matn: `${acrm1} ruxsat ✓`, rang: 'ok' },
      ],
    },
    {
      qisqa: 'PUT', nishon: 'texnika',
      sarlavha: 'Ruxsat bor — asosiy so‘rov ketdi',
      matn: [
        `Preflight o‘tdi — brauzer asl \`PUT\` ni yubordi, tanasi va \`Content-Type\` bilan, yana \`Origin\` bilan. Javobda yana \`Access-Control-Allow-Origin\` — brauzer javobni JavaScript’ga berdi.`,
        `Preflight narxi: bitta qo‘shimcha borib-kelish — OPTIONS → 204 **${ms(opt1, opt1J)}**, keyin PUT → 200 **${ms(put, putJ)}**. \`Max-Age\` shuning uchun kerak: shu muddatda shu metod uchun brauzer qayta so‘ramaydi.`,
      ],
      callout: { tur: 'goya', matn: 'Server preflight’ni alohida ishlashi kerak: OPTIONS ga ruxsat sarlavhalari bilan javob, asosiy so‘rovga esa — o‘z javobi va yana `Access-Control-Allow-Origin`.' },
      faktlar: [['So‘rov', `PUT /narx`], ['Content-Type', putCt], ['Preflight', ms(opt1, opt1J)], ['PUT', ms(put, putJ)]],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        { tur: 'teg', tugun: 'brauzer', matn: null },
        pk(put, 'PUT /narx', [`Content-Type: ${putCt}`, `Origin: ${origin}`], 'sorov'),
        pk(putJ, '200 OK', [`ACAO: ${sarlavha(putJ, 'Access-Control-Allow-Origin')}`], 'javob'),
      ],
    },
    {
      qisqa: 'Rad', nishon: 'texnika',
      sarlavha: 'DELETE: ruxsat yo‘q — so‘rov yuborilmadi',
      matn: [
        `Uchinchi so‘rov — \`DELETE\`. ${maxAge} soniyalik eslab qolish bor edi, lekin u faqat **PUT** uchun: brauzer yana preflight yubordi, \`Access-Control-Request-Method: ${acrm2}\` (Fetch standarti, 4.9: keshdagi yozuv metodga bog‘langan).`,
        `Server yana \`Allow-Methods: ${sarlavha(opt2J, 'Access-Control-Allow-Methods')}\` dedi — DELETE yo‘q. ${deleteBormi ? '' : '**Yozuvda DELETE so‘rovi umuman yo‘q**: brauzer uni tarmoqqa chiqarmadi. '}JavaScript \`TypeError: Failed to fetch\` oldi.`,
      ],
      callout: { tur: 'ogoh', matn: 'Preflight — serverdagi ma’lumotni o‘zgartiradigan so‘rov ruxsatsiz yetib bormasligi uchun. Oddiy so‘rovdan farqi shu: bu yerda so‘rovning o‘zi to‘xtatildi, faqat javob emas.' },
      faktlar: [['Preflight', `OPTIONS → ${acrm2}?`], ['Ruxsat', sarlavha(opt2J, 'Access-Control-Allow-Methods')], ['DELETE paketi', deleteBormi ? 'bor' : 'yo‘q'], ['JavaScript', 'TypeError']],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        pk(opt2, 'OPTIONS /narx', [`Request-Method: ${acrm2}`], 'ulanish'),
        pk(opt2J, '204 NO CONTENT', [`Allow-Methods: ${sarlavha(opt2J, 'Access-Control-Allow-Methods')}`], 'ulanish'),
        { tur: 'teg', tugun: 'brauzer', matn: 'DELETE yuborilmadi ✗', rang: 'xato' },
      ],
    },
    {
      qisqa: 'Xulosa', nishon: 'xulosa',
      sarlavha: 'Uch so‘rov — uch xil yo‘l',
      matn: [
        'Oddiy so‘rov ketdi va javobni ruxsat ochdi. Murakkab so‘rov oldidan brauzer ruxsat so‘radi: bor bo‘lsa — so‘rov ketdi, yo‘q bo‘lsa — umuman ketmadi.',
        'CORS — **ruxsat berish** mexanizmi, himoya emas: uni brauzer qo‘llaydi, curl kabi dastur esa bu sarlavhalarga qaramaydi (Web asoslari, 19-bob). Server ma’lumotini himoya qilish — autentifikatsiya va ruxsat tekshiruvi.',
      ],
      callout: { tur: 'maslahat', matn: '`Access-Control-Allow-Origin` ni so‘rovdagi `Origin` ga qarab tanlasangiz, `Vary: Origin` qo‘shing — kesh turli manbalar javobini aralashtirmasin. Bu yozuvdagi nginx sozlamasida shunday.' },
      korinadi: KORINADI,
      kamera: KORINADI,
      kartalar: [{
        sarlavha: 'Yozuvdan: brauzer → API',
        qatorlar: [
          ['GET', 'preflight yo‘q → 200'],
          ['PUT', `OPTIONS 204 → PUT 200`],
          ['DELETE', 'OPTIONS 204 → yuborilmadi', true],
          ['preflight', ms(opt1, opt1J)],
          ['ulanishlar', `${synlar.length} ta${bekor ? ` (${bekor} tasi ishlatilmadi)` : ''}`],
        ],
        joy: 'yuqori-chap',
        izoh: 'brauzer tomonida o‘lchangan',
      }],
      hodisalar: [{ tur: 'teg', tugun: 'brauzer', matn: null }],
    },
  ],
}
