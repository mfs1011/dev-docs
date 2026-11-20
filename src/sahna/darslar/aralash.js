// "Aralash kontent va SRI" — Paket yo'li darsi. Paketlar VPS laboratoriyasidagi haqiqiy yozuvdan: headless Chromium
// https://sayt.test/aralash.html ni ochadi — http:// rasm va skript, integrity'li ikki skript (paket-lab/ssenariy/aralash.sh,
// paket-lab/veb/aralash.html). HTTPS ichi — Chromium kalitlari bilan "ochiq" daraxt. Sahifa natijalari (onload/onerror)
// va konsol xabarlari — shu yozuvning jurnalidan.
// docs/vizualizator/paket-yoli.md 4.1 (23–24-boblar)
import yozuv from '../paket/yozuvlar/aralash.json'

const P = yozuv.paketlar
const VEB = '203.0.113.10'
const ochiqInfo = (p) => p.ochiq?.info ?? p.info
const top = (re, dan = 0) => {
  const p = P.find((x) => x.n > dan && re.test(ochiqInfo(x)))
  if (!p) throw new Error(`aralash: yozuvda topilmadi: ${re}`)
  return p
}
const maydonlar = (p, k) => {
  const r = []
  const yur = (f) => { if (f.k === k) r.push(f.s); (f.m ?? []).forEach(yur) }
  ;(p.ochiq?.qatlamlar ?? p.qatlamlar).forEach(yur)
  return r
}
const sarlavha = (p, nom) => maydonlar(p, 'http2.header').map((s) => s.replace(/^Header:\s*/, '')).filter((s) => s.startsWith(`${nom}: `)).map((s) => s.slice(nom.length + 2))
const oqimJavob = (sorov) => {
  const oqim = ochiqInfo(sorov).match(/HEADERS\[(\d+)\]: GET/)[1]
  return top(new RegExp(`HEADERS\\[${oqim}\\]: \\d{3}`), sorov.n)
}

const sahifa = top(/HEADERS\[\d+\]: GET \/aralash\.html/)
const rasm = top(/HEADERS\[\d+\]: GET \/rasm\.svg/)
const rasmJ = oqimJavob(rasm)
const ilova = top(/HEADERS\[\d+\]: GET \/ilova\.js/)
const ilovaJ = oqimJavob(ilova)
const ozg = top(/HEADERS\[\d+\]: GET \/ozgartirilgan\.js/)
const ozgJ = oqimJavob(ozg)
const port80 = P.filter((x) => / → 80 | 80 → /.test(x.info)).length
const ilovaSoni = P.filter((x) => /GET \/ilova\.js/.test(ochiqInfo(x))).length
const rasmScheme = sarlavha(rasm, ':scheme')[0]
const hajm = (p) => sarlavha(p, 'content-length')[0]

const pk = (p, yorliq, qatorlar, rang, qoshimcha = {}) => {
  const [dan, ga] = p.src === VEB ? ['veb', 'brauzer'] : ['brauzer', 'veb']
  return { tur: 'paket', n: p.n, yorliq, qatorlar, rang, dan, ga, ...qoshimcha }
}
const KORINADI = ['brauzer', 'router', 'veb']

export default {
  id: 'aralash',
  tur: 'paket',
  sarlavha: 'Aralash kontent va SRI',
  shior: 'HTTPS sahifadagi http:// resurslar va CDN fayli o‘zgarsa — brauzer nimani yangilaydi, nimani to‘sadi.',
  daraja: 'o‘rta',
  daqiqa: 7,
  yozuv,
  yozuvNuqta: 'Brauzer tomonida yozilgan (uy tarmog‘i)',
  kitob: [
    { yol: '/web-asoslari/23-aralash-kontent', nom: 'Web asoslari, 23: Aralash kontent va xavfsiz kontekst' },
    { yol: '/web-asoslari/24-subresource-integrity', nom: 'Web asoslari, 24: Subresource Integrity' },
  ],
  manba: [
    { nom: 'W3C — Mixed Content', url: 'https://www.w3.org/TR/mixed-content/' },
    { nom: 'MDN — Mixed content', url: 'https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Mixed_content' },
    { nom: 'W3C — Subresource Integrity', url: 'https://www.w3.org/TR/SRI/' },
    { nom: 'MDN — Subresource Integrity', url: 'https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Subresource_Integrity' },
  ],
  sinov: `Yozuv: VPS laboratoriyasi (paket-lab/), haqiqiy headless Chromium (192.168.1.20), \`https://sayt.test/aralash.html\` (\`paket-lab/veb/aralash.html\`). Sahifaning o‘z natijasi: “skript (http): rad”, “rasm (http): yuklandi https://sayt.test/rasm.svg”, “ilova.js (xesh mos): yuklandi”, “ozgartirilgan.js (xesh mos emas): rad”. Chromium konsoli: “Mixed Content: … requested an insecure element 'http://sayt.test/rasm.svg'. This request was automatically upgraded to HTTPS”, “… requested an insecure script 'http://sayt.test/ilova.js'. This request has been blocked”, “Failed to find a valid digest in the 'integrity' attribute for resource 'https://sayt.test/ozgartirilgan.js' … The resource has been blocked.” ${yozuv.versiyalar.filter((v) => /^(sana|Chromium|nginx version|TShark)/.test(v)).map((v) => v.replace(/ built on.*$/, '')).join(' · ')}`,
  trenajor: { yol: '/web-asoslari/trenajor', nom: 'HTTP laboratoriyasida o‘zingiz yuboring' },
  protokol: {
    izoh: 'Aralash kontent — HTTPS sahifadagi http:// resurs: uni yo‘ldagi kuzatuvchi o‘zgartira oladi. Brauzer rasm kabilarni HTTPS’ga yangilaydi, skript kabilarni to‘sadi. SRI — skriptning kutilgan xeshi: fayl o‘zgarsa, brauzer uni bajarmaydi.',
    faktlar: [['Yangilanadi', '<img>, <audio>, <video>'], ['Bloklanadi', '<script>, stil, iframe, fetch'], ['SRI', 'integrity="sha384-…"'], ['Standart', 'W3C Mixed Content, SRI']],
  },
  organasiz: [
    { matn: 'http:// rasm HTTPS’ga qanday yangilandi', qadam: 2 },
    { matn: 'http:// skript nega tarmoqqa chiqmadi', qadam: 3 },
    { matn: 'SRI: fayl keldi, lekin bajarilmadi', qadam: 5 },
  ],
  afsona: [{ k: 'sorov', nom: 'so‘rov' }, { k: 'javob', nom: 'javob' }, { k: 'ulanish', nom: 'to‘silgan' }],
  ishtirokchilar: ['brauzer', 'veb'],
  tugunlar: {
    brauzer: { ikonka: 'noutbuk', nom: 'Brauzer', izoh: 'Chromium · 192.168.1.20', x: 130, y: 330 },
    router: { ikonka: 'router', nom: 'Router', izoh: '192.168.1.1', x: 420, y: 330 },
    veb: { ikonka: 'server', nom: 'Veb-server', izoh: 'sayt.test · 443', x: 740, y: 330 },
  },
  chiziqlar: [['brauzer', 'router'], ['router', 'veb']],
  yollar: {
    'brauzer>veb': ['brauzer', 'router', 'veb'], 'veb>brauzer': ['veb', 'router', 'brauzer'],
  },
  qadamlar: [
    {
      qisqa: 'Sahifa', nishon: 'sozlash',
      sarlavha: 'HTTPS sahifa, ichida http:// manzillar',
      matn: [
        'Brauzer `https://sayt.test/aralash.html` ni ochdi — shifrlangan ulanish, HTTP/2. Sahifada to‘rt resurs: `http://` rasm, `http://` skript va `integrity` atributli ikki skript.',
        'Muammo: sahifa HTTPS’da, lekin `http://` resurs ochiq kanaldan keladi — yo‘ldagi kuzatuvchi (13-dars) uni almashtira oladi. Skript almashtirilsa — butun sahifa unga tegishli.',
      ],
      callout: { tur: 'goya', matn: 'HTTPS sahifadan HTTP sahifaga **havola** bilan o‘tish aralash kontent emas — yangi kontekst ochiladi. Aralash kontent — HTTPS sahifa ichiga yuklanadigan resurs (Web asoslari, 23-bob).' },
      faktlar: [['Sahifa', 'https://sayt.test'], ['http:// rasm', '1'], ['http:// skript', '1'], ['integrity’li skript', '2']],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [pk(sahifa, 'GET /aralash.html', ['HTTPS, HTTP/2'], 'sorov')],
    },
    {
      qisqa: 'Rasm', nishon: 'texnika',
      sarlavha: 'http:// rasm — HTTPS’ga yangilandi',
      matn: [
        `Sahifada \`<img src="http://sayt.test/rasm.svg">\`. Brauzer uni **o‘zi \`https://\` ga o‘zgartirdi**: so‘rov shifrlangan ulanishda ketdi (\`:scheme: ${rasmScheme}\`) va ${rasmJ ? ochiqInfo(rasmJ).match(/HEADERS\[\d+\]: (\d{3} [^,]+)/)[1] : '—'} oldi.`,
        `Butun yozuvda 80-portga **${port80} ta paket** — ochiq HTTP umuman ishlatilmadi. Rasm “yangilanadigan” (upgradable) toifada: brauzer so‘rovni HTTPS’ga o‘tkazadi, server javob bersa — ko‘rsatadi (MDN).`,
      ],
      callout: { tur: 'maslahat', matn: 'HTTPS’da rasm bo‘lmasa, yangilangan so‘rov 404 oladi va rasm ko‘rinmaydi. Xost IP manzil bo‘lsa, yangilanmaydi — bloklanadi (23-bob).' },
      faktlar: [['Sahifada', 'http://…/rasm.svg'], ['Ketdi', `${rasmScheme}://…/rasm.svg`], ['80-port', `${port80} paket`]],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        pk(rasm, 'GET /rasm.svg', ['http → https'], 'sorov'),
        pk(rasmJ, '200 OK', ['rasm'], 'javob'),
      ],
    },
    {
      qisqa: 'Skript', nishon: 'texnika',
      sarlavha: 'http:// skript — umuman so‘ralmadi',
      matn: [
        `Sahifada \`<script src="http://sayt.test/ilova.js">\`. Yozuvda \`ilova.js\` uchun ${ilovaSoni} ta so‘rov bor — u **https** orqali, keyingi (integrity’li) teg uchun. \`http://\` dagisi uchun **hech qanday paket yo‘q**.`,
        'Skript “bloklanadigan” (blockable) toifada: brauzer so‘rovni yubormaydi ham. Sahifa jurnali: “skript (http): rad”; konsol: “requested an insecure script … This request has been blocked”.',
      ],
      callout: { tur: 'ogoh', matn: 'Bloklanadiganlar: `<script>`, stillar, `<iframe>`, `fetch()`, `XMLHttpRequest`, shriftlar (MDN). Ular sahifani to‘liq boshqara oladi — ochiq kanal orqali kelishiga yo‘l qo‘yilmaydi.' },
      faktlar: [['http:// skript', 'so‘rov yo‘q'], ['Natija', 'rad'], ['Toifa', 'bloklanadigan']],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [{ tur: 'teg', tugun: 'brauzer', matn: 'http:// skript: so‘rov yo‘q', rang: 'ok' }],
    },
    {
      qisqa: 'SRI ✓', nishon: 'texnika',
      sarlavha: 'SRI: xesh mos — skript ishladi',
      matn: [
        `\`<script src="https://sayt.test/ilova.js" integrity="sha384-…" crossorigin="anonymous">\`. Brauzer faylni oldi (${hajm(ilovaJ)} bayt), SHA-384 xeshini hisobladi va atributdagisi bilan solishtirdi — **mos**. Skript bajarildi.`,
        '`integrity` — kutilgan xesh: `algoritm-base64(xesh)`. Uni fayldan oldindan hisoblab qo‘yiladi: `openssl dgst -sha384 -binary fayl.js | openssl base64 -A` (24-bob).',
      ],
      callout: { tur: 'goya', matn: 'Boshqa origin’dagi (CDN) faylni tekshirish uchun CORS kerak: `crossorigin="anonymous"` va serverda `Access-Control-Allow-Origin`. Bu yozuvda fayl o‘z origin’imizda (24-bob).' },
      faktlar: [['Fayl', 'ilova.js'], ['Hajm', `${hajm(ilovaJ)} B`], ['Xesh', 'mos'], ['Natija', 'bajarildi']],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        { tur: 'teg', tugun: 'brauzer', matn: null },
        pk(ilova, 'GET /ilova.js', ['integrity bilan'], 'sorov'),
        pk(ilovaJ, '200 OK', [`${hajm(ilovaJ)} B`], 'javob'),
        { tur: 'teg', tugun: 'brauzer', matn: 'xesh mos ✓', rang: 'ok' },
      ],
    },
    {
      qisqa: 'SRI ✗', nishon: 'muammo',
      sarlavha: 'SRI: fayl o‘zgargan — keldi, lekin bajarilmadi',
      matn: [
        `Endi \`ozgartirilgan.js\` — xuddi o‘sha \`integrity\` bilan, lekin ichida boshqa kod (“CDN buzildi” holati). Brauzer faylni **oldi** — 200 OK, ${hajm(ozgJ)} bayt, tarmoqda hammasi joyida.`,
        'Xesh mos kelmadi — brauzer skriptni **bajarmadi**. Konsol: “Failed to find a valid digest in the \'integrity\' attribute … The resource has been blocked.” Sahifa jurnali: “rad”. Begona kod sahifada ishlamadi.',
      ],
      callout: { tur: 'maslahat', matn: '“Oxirgi versiya” URL’iga (`…/latest/lib.js`) `integrity` qo‘ymang — fayl yangilanganda sayt buziladi. Aniq versiyali URL ishlating (24-bob, tipik xatolar).' },
      faktlar: [['Fayl', 'ozgartirilgan.js'], ['Javob', '200 OK'], ['Xesh', 'mos emas'], ['Natija', 'bajarilmadi']],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        { tur: 'teg', tugun: 'brauzer', matn: null },
        pk(ozg, 'GET /ozgartirilgan.js', ['integrity bilan'], 'sorov'),
        pk(ozgJ, '200 OK', [`${hajm(ozgJ)} B`], 'javob'),
        { tur: 'teg', tugun: 'brauzer', matn: 'xesh mos emas ✗', rang: 'xato' },
      ],
    },
    {
      qisqa: 'Xulosa', nishon: 'xulosa',
      sarlavha: 'To‘rt resurs, to‘rt natija',
      matn: [
        'http:// rasm — yangilandi va keldi; http:// skript — so‘ralmadi; xeshi mos skript — bajarildi; xeshi mos bo‘lmagani — keldi, lekin bajarilmadi.',
        'Ikkala himoya ham brauzerda: tarmoqda ularning izi — 80-portning jimligi va “200 OK” bo‘lsa ham ishlamagan fayl. Sababi konsolda (30-bob).',
      ],
      callout: { tur: 'goya', matn: 'Hamma resursni HTTPS’dan bering; CDN’dagi skript va stillarga `integrity` qo‘ying. `Integrity-Policy` sarlavhasi `integrity` siz skriptlarni ham to‘sadi (24-bob).' },
      korinadi: KORINADI,
      kamera: KORINADI,
      kartalar: [{
        sarlavha: 'Yozuvdan',
        qatorlar: [
          ['http:// rasm', 'https · 200'],
          ['http:// skript', 'so‘rov yo‘q'],
          ['ilova.js (xesh mos)', 'bajarildi'],
          ['ozgartirilgan.js', '200 · bajarilmadi', true],
          ['80-port', `${port80} paket`],
        ],
        joy: 'yuqori-chap',
        izoh: 'paketlar, sahifa va konsol jurnali',
      }],
      hodisalar: [],
    },
  ],
}
