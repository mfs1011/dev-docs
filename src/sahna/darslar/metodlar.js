// "Metodlar va holat kodlari" — Paket yo'li darsi. Paketlar VPS laboratoriyasidagi haqiqiy yozuvdan
// (paket-lab/ssenariy/metodlar.sh: bitta ulanishda bitta fayl ustida GET, PUT, PUT, GET, HEAD, POST, DELETE, DELETE va
// ishlamayotgan backend'ga GET; nginx WebDAV moduli, paket-lab/veb/fayl.conf). Kodlar va sarlavhalar yozuvdan.
// docs/vizualizator/paket-yoli.md 4.1 (07–09-boblar)
import yozuv from '../paket/yozuvlar/metodlar.json'

const P = yozuv.paketlar
const VEB = '203.0.113.10'
const maydonlar = (p, k) => {
  const r = []
  const yur = (f) => { if (f.k === k) r.push(f.s); (f.m ?? []).forEach(yur) }
  p.qatlamlar.forEach(yur)
  return r
}
const qiymat = (s) => s.slice(s.indexOf(':') + 1).replace(/\\r\\n$/, '').trim()
const bitta = (p, k) => { const s = maydonlar(p, k)[0]; return s ? qiymat(s) : null }

// so'rov — javob juftlari, tartib bilan
const juftlar = P.filter((x) => x.src !== VEB && /^[A-Z]+ \/\S* HTTP\/1\.1/.test(x.info)).map((s) => {
  const j = P.find((x) => x.n > s.n && x.src === VEB && /^HTTP\/1\.1 \d{3}/.test(x.info))
  return {
    s, j,
    metod: s.info.split(' ')[0],
    yol: s.info.split(' ')[1],
    kod: j.info.match(/^HTTP\/1\.1 (\d{3} [^(]+?)\s*(\(|$)/)[1],
    ms: Math.round((j.t - s.t) * 1000),
  }
})
const ol = (metod, nechanchi = 0) => juftlar.filter((x) => x.metod === metod)[nechanchi]
const get404 = ol('GET', 0)
const put1 = ol('PUT', 0)
const put2 = ol('PUT', 1)
const get200 = ol('GET', 1)
const head = ol('HEAD', 0)
const post = ol('POST', 0)
const del1 = ol('DELETE', 0)
const del2 = ol('DELETE', 1)
const tashqi = juftlar.find((x) => x.yol === '/tashqi')

const location = bitta(put1.j, 'http.location')
const headUzunlik = bitta(head.j, 'http.content_length_header')
const headTana = maydonlar(head.j, 'http.file_data').length > 0
const allow405 = maydonlar(post.j, 'http.response.line').some((s) => s.startsWith('Allow:'))
const synlar = P.filter((x) => / → 80 \[SYN\]/.test(x.info)).length

const pk = (p, yorliq, qatorlar, rang, qoshimcha = {}) => {
  const [dan, ga] = p.src === VEB ? ['veb', 'klient'] : ['klient', 'veb']
  return { tur: 'paket', n: p.n, yorliq, qatorlar, rang, dan, ga, ...qoshimcha }
}
const juft = (x, izoh, rang = 'javob') => [pk(x.s, `${x.metod} ${x.yol}`, [], 'sorov'), pk(x.j, x.kod.toUpperCase(), izoh ? [izoh] : [], rang)]
const KORINADI = ['klient', 'router', 'veb']

export default {
  id: 'metodlar',
  tur: 'paket',
  sarlavha: 'Metodlar va holat kodlari',
  shior: 'Bitta fayl ustida to‘qqiz so‘rov: GET, PUT, HEAD, POST, DELETE — va server har biriga qanday kod qaytaradi.',
  daraja: 'boshlang‘ich',
  daqiqa: 7,
  yozuv,
  kitob: [
    { yol: '/web-asoslari/07-metodlar', nom: 'Web asoslari, 07: Metodlar' },
    { yol: '/web-asoslari/08-holat-kodlari', nom: 'Web asoslari, 08: Holat kodlari' },
    { yol: '/web-asoslari/09-headerlar-kontent-turi', nom: 'Web asoslari, 09: Header’lar va kontent turi' },
  ],
  manba: [
    { nom: 'RFC 9110 — 9 Metodlar', url: 'https://www.rfc-editor.org/rfc/rfc9110#section-9' },
    { nom: 'RFC 9110 — 9.2.2 Idempotent metodlar', url: 'https://www.rfc-editor.org/rfc/rfc9110#section-9.2.2' },
    { nom: 'RFC 9110 — 15 Holat kodlari', url: 'https://www.rfc-editor.org/rfc/rfc9110#section-15' },
    { nom: 'RFC 9110 — 15.5.6 405', url: 'https://www.rfc-editor.org/rfc/rfc9110#section-15.5.6' },
    { nom: 'nginx — ngx_http_dav_module', url: 'https://nginx.org/en/docs/http/ngx_http_dav_module.html' },
  ],
  sinov: `Yozuv: VPS laboratoriyasi (paket-lab/), bitta \`curl\` buyrug‘ida to‘qqiz so‘rov (\`--next\`, bitta TCP ulanish). nginx’da \`fayl.sayt.test\` — WebDAV moduli (\`dav_methods PUT DELETE\`), \`/tashqi\` — ishlamayotgan backend’ga proxy (\`paket-lab/veb/fayl.conf\`). curl \`--data-binary\` tanaga \`Content-Type: application/x-www-form-urlencoded\` qo‘ydi (curl’ning standarti). ${yozuv.versiyalar.filter((v) => /^(sana|curl|nginx version|TShark)/.test(v)).map((v) => v.replace(/ \(x86.*$/, '')).join(' · ')}`,
  trenajor: { yol: '/web-asoslari/trenajor', nom: 'HTTP laboratoriyasida o‘zingiz yuboring' },
  protokol: {
    izoh: 'Metod — klient nima qilmoqchi (olish, yozish, o‘chirish). Holat kodi — server nima bo‘lganini aytadi: 2xx — bajarildi, 3xx — boshqa joyga, 4xx — so‘rovda muammo, 5xx — serverda muammo.',
    faktlar: [['Metodlar', 'GET, HEAD, POST, PUT, DELETE…'], ['Kodlar', '2xx, 3xx, 4xx, 5xx'], ['Xavfsiz', 'GET, HEAD'], ['Idempotent', 'GET, HEAD, PUT, DELETE'], ['Standart', 'RFC 9110']],
  },
  organasiz: [
    { matn: 'PUT ikki marta: 201 va 204', qadam: 2 },
    { matn: 'DELETE ikki marta: idempotent, lekin kod boshqa', qadam: 5 },
    { matn: '4xx va 5xx — kimda muammo', qadam: 6 },
  ],
  afsona: [{ k: 'sorov', nom: 'so‘rov' }, { k: 'javob', nom: '2xx javob' }, { k: 'ulanish', nom: '4xx/5xx javob' }],
  ishtirokchilar: ['klient', 'veb'],
  tugunlar: {
    klient: { ikonka: 'noutbuk', nom: 'Klient', izoh: '192.168.1.10', x: 130, y: 330 },
    router: { ikonka: 'router', nom: 'Router', izoh: '192.168.1.1', x: 420, y: 330 },
    veb: { ikonka: 'server', nom: 'Veb-server', izoh: 'fayl.sayt.test · 80', x: 740, y: 330 },
  },
  chiziqlar: [['klient', 'router'], ['router', 'veb']],
  yollar: {
    'klient>veb': ['klient', 'router', 'veb'], 'veb>klient': ['veb', 'router', 'klient'],
  },
  qadamlar: [
    {
      qisqa: 'GET 404', nishon: 'sozlash',
      sarlavha: 'GET: fayl hali yo‘q — 404',
      matn: [
        `Klient \`GET ${get404.yol}\` yubordi — server **${get404.kod}** qaytardi: bunday resurs yo‘q. 4xx guruhi — “muammo so‘rovda”: klient mavjud bo‘lmagan narsani so‘radi.`,
        'GET — **xavfsiz** metod: faqat o‘qiydi, serverda hech narsani o‘zgartirmaydi (RFC 9110, 9.2.1). Shuning uchun brauzer va qidiruv robotlari GET havolalarni bemalol ochadi.',
      ],
      callout: { tur: 'ogoh', matn: 'Kitobdagi tipik xato: `GET /ochir?id=5` bilan o‘chirish. GET xavfsiz deb hisoblanadi — robot yoki oldindan yuklash uni “bosib” yuborishi mumkin (Web asoslari, 7-bob).' },
      faktlar: [['So‘rov', `GET ${get404.yol}`], ['Javob', get404.kod], ['Guruh', '4xx — so‘rovda']],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: juft(get404, 'yo‘q', 'ulanish'),
    },
    {
      qisqa: 'PUT', nishon: 'texnika',
      sarlavha: 'PUT ikki marta: 201, keyin 204',
      matn: [
        `\`PUT ${put1.yol}\` tana bilan — server faylni yaratdi: **${put1.kod}**${location ? `, \`Location: ${location}\`` : ''}. Xuddi shu PUT yana (boshqa matn bilan) — endi **${put2.kod}**: fayl almashtirildi, javobda tana yo‘q.`,
        'RFC 9110 (9.3.4): PUT resurs yo‘q bo‘lsa yaratadi (201), bor bo‘lsa almashtiradi (200 yoki 204). PUT — **idempotent**: necha marta yuborilsa ham natija bitta — fayl so‘nggi tanadagi matn bilan.',
      ],
      callout: { tur: 'maslahat', matn: '201 javobini oching: `Location` — yaratilgan resurs manzili. 204 da `Content-Length` ham yo‘q — “No Content” shuni anglatadi.' },
      faktlar: [['1-PUT', put1.kod], ['2-PUT', put2.kod], ['Location', location ?? '—'], ['Idempotent', 'ha']],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [...juft(put1, 'yaratildi'), ...juft(put2, 'almashtirildi')],
    },
    {
      qisqa: 'GET, HEAD', nishon: 'texnika',
      sarlavha: 'GET va HEAD: tana bilan va tanasiz',
      matn: [
        `Endi \`GET\` — **${get200.kod}** va fayl matni. \`HEAD\` — xuddi shu javob sarlavhalari (\`Content-Length: ${headUzunlik}\`, \`ETag\`, \`Last-Modified\`), lekin **tana yo‘q**${headTana ? '' : ' — yozuvda ham tana baytlari yo‘q'}.`,
        'HEAD fayl bor-yo‘qligini, hajmini yoki o‘zgarganini bilish uchun — uni yuklamasdan (RFC 9110, 9.3.2).',
      ],
      callout: { tur: 'goya', matn: 'Javob sarlavhalari — kontent haqida ma’lumot: `Content-Type` (MIME turi), `Content-Length` (hajm). nginx turni fayl kengaytmasidan tanladi: `.txt` → `text/plain` (Web asoslari, 9-bob).' },
      faktlar: [['GET', get200.kod], ['HEAD', head.kod], ['HEAD tanasi', headTana ? 'bor' : 'yo‘q'], ['Content-Length', headUzunlik]],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [...juft(get200, 'matn bilan'), ...juft(head, 'tanasiz')],
    },
    {
      qisqa: 'POST 405', nishon: 'texnika',
      sarlavha: 'POST: ruxsat yo‘q — 405',
      matn: [
        `\`POST ${post.yol}\` — server **${post.kod}**: metod ma’lum, lekin bu resurs uni qabul qilmaydi. nginx statik faylga POST qilishga yo‘l qo‘ymaydi.`,
        `RFC 9110 (15.5.6): 405 javobida ruxsat etilgan metodlar ro‘yxati — \`Allow\` sarlavhasi bo‘lishi **shart**. ${allow405 ? 'Bu javobda u bor.' : 'Bu yozuvda nginx uni **qo‘shmadi** (kuzatildi) — standartdan chetlanish. Kitobdagi Python serveri esa `Allow: GET, HEAD, POST, OPTIONS` qaytargan (7-bob).'}`,
      ],
      callout: { tur: 'goya', matn: 'POST — xavfsiz ham, idempotent ham emas: ikki marta yuborilsa, ikki marta ta’sir qilishi mumkin (ikki buyurtma). Shuning uchun uni avtomatik qayta yubormaslik kerak (7-bob).' },
      faktlar: [['So‘rov', `POST ${post.yol}`], ['Javob', post.kod], ['Allow sarlavhasi', allow405 ? 'bor' : 'yo‘q']],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: juft(post, 'ruxsat yo‘q', 'ulanish'),
    },
    {
      qisqa: 'DELETE', nishon: 'tushuncha',
      sarlavha: 'DELETE ikki marta: idempotent, lekin kod boshqa',
      matn: [
        `Birinchi \`DELETE\` — **${del1.kod}**: fayl o‘chirildi. Ikkinchisi — **${del2.kod}**: o‘chiradigan narsa qolmagan.`,
        'Kod o‘zgardi, lekin server **holati** ikkalasida bir xil — fayl yo‘q. Idempotentlik aynan shu: bir xil so‘rovni takrorlash holatni o‘zgartirmaydi; javob boshqacha bo‘lishi mumkin (RFC 9110, 9.2.2).',
      ],
      callout: { tur: 'maslahat', matn: 'Idempotent so‘rovni (GET, PUT, DELETE) tarmoq uzilsa xavfsiz qayta yuborish mumkin — ikki marta bajarilsa ham natija bitta.' },
      faktlar: [['1-DELETE', del1.kod], ['2-DELETE', del2.kod], ['Holat', 'ikkalasida fayl yo‘q']],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [...juft(del1, 'o‘chirildi'), ...juft(del2, 'yo‘q edi', 'ulanish')],
    },
    {
      qisqa: '502', nishon: 'texnika',
      sarlavha: '5xx: muammo serverda — 502',
      matn: [
        `\`GET ${tashqi.yol}\` — nginx bu yo‘lni orqadagi backend’ga uzatadi, lekin backend ishlamayapti. Natija — **${tashqi.kod}**, ${tashqi.ms} ms da.`,
        '5xx — “muammo serverda”: klient so‘rovi to‘g‘ri, javob bera olmagan — server tomoni. 502 — proxy yoki gateway orqadagi serverdan yaroqli javob ololmadi (RFC 9110, 15.6.3). Bu yozuvda backend ulanishni rad etdi va nginx 502 qaytardi.',
      ],
      callout: { tur: 'maslahat', matn: '502’ning sababi klientga ko‘rinmaydi — u server jurnalida (nginx error log). Kitob: 5xx sababini jurnaldan qidiring (8-bob).' },
      faktlar: [['So‘rov', `GET ${tashqi.yol}`], ['Javob', tashqi.kod], ['Guruh', '5xx — serverda']],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: juft(tashqi, 'backend yo‘q', 'ulanish'),
    },
    {
      qisqa: 'Xulosa', nishon: 'xulosa',
      sarlavha: 'To‘qqiz so‘rov — bitta ulanish',
      matn: [
        `Hammasi bitta TCP ulanishda (SYN ${synlar} marta): ${juftlar.map((x) => `${x.metod} → ${x.kod.split(' ')[0]}`).join(', ')}.`,
        'Metod — niyat, kod — natija. 2xx — bajarildi, 4xx — so‘rov xato (yo‘q resurs, ruxsat yo‘q metod), 5xx — server ishlay olmadi. Kodni to‘g‘ri tanlash klientga nima qilishni aytadi: qayta urinish, so‘rovni tuzatish yoki kutish.',
      ],
      callout: { tur: 'goya', matn: 'Boshqa darslardagi 301 (6-dars), 304 (7-dars), 206 (8-dars), 401 (12-dars) — o‘sha besh guruhning boshqa a’zolari.' },
      korinadi: KORINADI,
      kamera: KORINADI,
      kartalar: [{
        sarlavha: 'Yozuvdan',
        qatorlar: [...new Set(juftlar.map((x) => x.metod))].map((m) => [m, juftlar.filter((x) => x.metod === m).map((x) => x.kod.split(' ')[0]).join(' · '), m === 'DELETE']),
        joy: 'yuqori-chap',
        izoh: 'tartib bilan, bitta ulanishda',
      }],
      hodisalar: [],
    },
  ],
}
