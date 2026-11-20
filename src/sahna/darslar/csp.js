// "CSP va clickjacking" — Paket yo'li darsi. Paketlar VPS laboratoriyasidagi haqiqiy yozuvdan: headless Chromium
// http://himoya.sayt.test/csp.html ni ochadi (CSP: faqat nonce'li skript, hisobot /hisobot ga), keyin http://yomon.test/ramka.html
// panel.html ni freymga qo'ymoqchi bo'ladi (X-Frame-Options: DENY, frame-ancestors 'none') — paket-lab/ssenariy/csp.sh.
// Hisobotlar tanasi paket baytlaridan o'qiladi; brauzer konsoli xabarlari — shu yozuvning jurnalidan.
// docs/vizualizator/paket-yoli.md 4.1 (21–22-boblar)
import yozuv from '../paket/yozuvlar/csp.json'

const P = yozuv.paketlar
const VEB = '203.0.113.10'
const top = (re, dan = 0) => {
  const p = P.find((x) => x.n > dan && re.test(x.info))
  if (!p) throw new Error(`csp: yozuvda topilmadi: ${re}`)
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
  const s = maydonlar(p, 'http.response.line').find((x) => x.startsWith(`${nom}:`))
  return s ? qiymat(s) : null
}
// paket baytlaridan JSON tana (application/csp-report)
const tanaJson = (p) => {
  const b = new Uint8Array(p.hex.replace(/\s/g, '').match(/../g).map((h) => parseInt(h, 16)))
  const t = new TextDecoder().decode(b)
  return JSON.parse(t.slice(t.indexOf('{"csp-report')))['csp-report']
}

const sahifa = top(/^GET \/csp\.html /)
const sahifaJ = top(/^HTTP\/1\.1 200 OK/, sahifa.n)
const siyosat = sarlavha(sahifaJ, 'Content-Security-Policy')
// hisobot va 204 javoblar bitta ulanishda tartib bilan (HTTP/1.1): i-hisobotga i-javob
const javob204 = P.filter((x) => x.src === VEB && /204 No Content/.test(x.info))
const hisobotlar = P.filter((x) => /^POST \/hisobot /.test(x.info)).map((p, i) => ({ p, j: javob204[i], r: tanaJson(p) }))
const tashqiSorov = P.some((x) => /tashqi\.js/.test(x.info))
const ramka = top(/^GET \/ramka\.html /)
const ramkaJ = top(/^HTTP\/1\.1 200 OK/, ramka.n)
const panel = top(/^GET \/panel\.html /)
const panelJ = top(/^HTTP\/1\.1 200 OK/, panel.n)
const xfo = sarlavha(panelJ, 'X-Frame-Options')
const fa = sarlavha(panelJ, 'Content-Security-Policy')

const pk = (p, yorliq, qatorlar, rang, qoshimcha = {}) => {
  const [dan, ga] = p.src === VEB ? ['veb', 'brauzer'] : ['brauzer', 'veb']
  return { tur: 'paket', n: p.n, yorliq, qatorlar, rang, dan, ga, ...qoshimcha }
}
const KORINADI = ['brauzer', 'router', 'veb']
const blok = (r) => (r['blocked-uri'] === 'inline' ? 'ichki skript' : r['blocked-uri'])

export default {
  id: 'csp',
  tur: 'paket',
  sarlavha: 'CSP va clickjacking',
  shior: 'Server sarlavha bilan qoida beradi, brauzer uni bajaradi: begona skript yuklanmaydi, sahifa begona freymga tushmaydi.',
  daraja: 'o‘rta',
  daqiqa: 8,
  yozuv,
  yozuvNuqta: 'Brauzer tomonida yozilgan (uy tarmog‘i)',
  kitob: [
    { yol: '/web-asoslari/21-xss-csp', nom: 'Web asoslari, 21: XSS va CSP' },
    { yol: '/web-asoslari/22-clickjacking-headerlar', nom: 'Web asoslari, 22: Clickjacking va xavfsizlik header’lari' },
  ],
  manba: [
    { nom: 'W3C — Content Security Policy Level 3', url: 'https://www.w3.org/TR/CSP3/' },
    { nom: 'MDN — CSP', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP' },
    { nom: 'MDN — frame-ancestors', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors' },
    { nom: 'MDN — X-Frame-Options', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Frame-Options' },
    { nom: 'MDN — Clickjacking', url: 'https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/Clickjacking' },
  ],
  sinov: `Yozuv: VPS laboratoriyasi (paket-lab/), haqiqiy headless Chromium (192.168.1.20): \`http://himoya.sayt.test/csp.html\`, keyin \`http://yomon.test/ramka.html\` (\`paket-lab/veb/himoya.conf\`). Nonce bu yerda doimiy (\`lab123\`) — faqat laboratoriya uchun; haqiqiy saytda u har javobda yangi bo‘lishi shart. Chromium konsoli (\`--enable-logging\`): “Executing inline script violates … 'script-src 'nonce-lab123''”, “Loading the script 'http://yomon.test/tashqi.js' violates … The action has been blocked.”, “Framing 'http://himoya.sayt.test/' violates … "frame-ancestors 'none'". The request has been blocked.” ${yozuv.versiyalar.filter((v) => /^(sana|Chromium|nginx version|TShark)/.test(v)).map((v) => v.replace(/ built on.*$/, '')).join(' · ')}`,
  trenajor: { yol: '/web-asoslari/trenajor', nom: 'HTTP laboratoriyasida o‘zingiz yuboring' },
  protokol: {
    izoh: 'CSP (Content Security Policy) — server sarlavhasi: sahifa qaysi manbalardan skript va boshqa resurslarni yuklashi mumkin. Freym himoyasi (frame-ancestors, X-Frame-Options) — sahifani kim o‘z ichiga ola olishi. Ikkalasini ham brauzer qo‘llaydi.',
    faktlar: [['XSS himoyasi', 'CSP, nonce'], ['Clickjacking', 'frame-ancestors, X-Frame-Options'], ['Hisobot', 'report-uri / report-to'], ['Standart', 'W3C CSP3, RFC 7034']],
  },
  organasiz: [
    { matn: 'CSP nimani to‘sdi va hisobot qanday ketdi', qadam: 2 },
    { matn: 'Bloklangan skript tarmoqqa chiqmaydi', qadam: 3 },
    { matn: 'Freym himoyasi: javob keldi, lekin ko‘rsatilmadi', qadam: 5 },
  ],
  afsona: [{ k: 'sorov', nom: 'so‘rov' }, { k: 'javob', nom: 'javob' }, { k: 'ulanish', nom: 'hisobot va boshqa sayt' }],
  ishtirokchilar: ['brauzer', 'veb'],
  tugunlar: {
    brauzer: { ikonka: 'noutbuk', nom: 'Brauzer', izoh: 'Chromium · 192.168.1.20', x: 130, y: 330 },
    router: { ikonka: 'router', nom: 'Router', izoh: '192.168.1.1', x: 420, y: 330 },
    veb: { ikonka: 'server', nom: 'Veb-server', izoh: 'himoya.sayt.test · yomon.test', x: 740, y: 330 },
  },
  chiziqlar: [['brauzer', 'router'], ['router', 'veb']],
  yollar: {
    'brauzer>veb': ['brauzer', 'router', 'veb'], 'veb>brauzer': ['veb', 'router', 'brauzer'],
  },
  qadamlar: [
    {
      qisqa: 'Siyosat', nishon: 'sozlash',
      sarlavha: 'Sahifa CSP bilan keldi',
      matn: [
        `Brauzer \`csp.html\` ni oldi. Javobda **\`Content-Security-Policy: ${siyosat}\`**: skript faqat \`nonce-lab123\` belgisi bilan ishlaydi; buzilish bo‘lsa — hisobot \`/hisobot\` ga.`,
        'Sahifada uch skript: nonce’li, nonce’siz ichki skript (XSS’da hujumchi kiritgan kod shunday ko‘rinadi) va boshqa origin’dagi `tashqi.js`.',
      ],
      callout: { tur: 'goya', matn: 'Nonce — har javobda yangi tasodifiy qiymat: server uni sarlavhaga va o‘z skriptlariga qo‘yadi. Hujumchi kiritgan skript uni bilmaydi (Web asoslari, 21-bob). Bu laboratoriyada u doimiy — faqat ko‘rsatish uchun.' },
      faktlar: [['script-src', "'nonce-lab123'"], ['Hisobot', '/hisobot'], ['Skriptlar', 'nonce’li, ichki, tashqi']],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        pk(sahifa, 'GET /csp.html', [], 'sorov'),
        pk(sahifaJ, '200 OK', ['Content-Security-Policy'], 'javob'),
      ],
    },
    {
      qisqa: 'Hisobot', nishon: 'texnika',
      sarlavha: 'CSP to‘sdi va hisobot yubordi',
      matn: [
        `Brauzer nonce’li skriptlarni bajardi (ulardan biri keyin sahifani \`yomon.test\` ga o‘tkazdi — 4-qadam), qolgan ikkitasini **to‘sdi** va har biri uchun serverga hisobot yubordi: ${hisobotlar.length} ta \`POST /hisobot\` (\`Content-Type: application/csp-report\`).`,
        `Hisobotlar ichida (paket baytlaridan): ${hisobotlar.map((h) => `\`blocked-uri: ${h.r['blocked-uri']}\``).join(' va ')}; \`effective-directive: ${hisobotlar[0].r['effective-directive']}\`, \`disposition: ${hisobotlar[0].r.disposition}\` — to‘sildi, faqat xabar emas.`,
      ],
      callout: { tur: 'maslahat', matn: 'Yangi siyosatni avval `Content-Security-Policy-Report-Only` bilan sinang: bloklamaydi, faqat shunday hisobot yuboradi (`disposition: report`). Hisobotlarni ko‘rib, keyin yoqing (21-bob).' },
      faktlar: [['Hisobotlar', `${hisobotlar.length} ta`], ...hisobotlar.map((h, i) => [`${i + 1}-hisobot`, blok(h.r)]), ['disposition', hisobotlar[0].r.disposition]],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: hisobotlar.flatMap((h, i) => [
        pk(h.p, 'POST /hisobot', [blok(h.r)], 'ulanish', i ? { ms: 600 } : {}),
        pk(h.j, '204', [], 'javob', { ms: 500 }),
      ]),
    },
    {
      qisqa: 'Yuklanmadi', nishon: 'tushuncha',
      sarlavha: 'Begona skript tarmoqqa chiqmadi',
      matn: [
        `Yozuvda \`yomon.test/tashqi.js\` uchun **${tashqiSorov ? 'so‘rov bor' : 'birorta so‘rov yo‘q'}**. Brauzer siyosatni yuklashdan **oldin** tekshirdi — skript yuklanmadi ham, bajarilmadi ham.`,
        'Ichki skript esa sahifaning o‘zida edi — u tarmoqdan kelgan, lekin bajarilmadi. Ikki holatda ham XSS’ning ikkinchi sharti — kodning ishga tushishi — bajarilmadi.',
      ],
      callout: { tur: 'ogoh', matn: '`script-src \'unsafe-inline\'` ichki skript taqiqini bekor qiladi — CSP’ning asosiy foydasi yo‘qoladi. Nonce yoki xesh ishlating (21-bob, tipik xatolar).' },
      faktlar: [['tashqi.js so‘rovi', tashqiSorov ? 'bor' : 'yo‘q'], ['Ichki skript', 'bajarilmadi']],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [{ tur: 'teg', tugun: 'brauzer', matn: 'tashqi.js: so‘rov yo‘q', rang: 'ok' }],
    },
    {
      qisqa: 'Freym', nishon: 'muammo',
      sarlavha: 'Boshqa sayt: tugma ostiga yashirin freym',
      matn: [
        'Brauzer `yomon.test/ramka.html` ga o‘tdi (“Yutuq! Tugmani bosing”). Unda `<iframe src="http://himoya.sayt.test/panel.html">` — himoya saytining “Hisobni o‘chirish” tugmali paneli.',
        'Clickjacking shunday: begona sayt haqiqiy sahifani shaffof freymga qo‘yib, foydalanuvchini o‘z tugmasi ustida “bosdiradi” — bosish freymdagi sahifaga, foydalanuvchining sessiyasi bilan ketadi (22-bob).',
      ],
      callout: { tur: 'goya', matn: 'Freym — boshqa origin. Begona sahifa uning ichini o‘qiy olmaydi, lekin ko‘rsatishi va ustiga element qo‘yishi mumkin — himoya kerak bo‘lgani shu.' },
      faktlar: [['Sahifa', 'yomon.test/ramka.html'], ['Freymda', 'himoya.sayt.test/panel.html']],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        { tur: 'teg', tugun: 'brauzer', matn: null },
        pk(ramka, 'GET /ramka.html', ['yomon.test'], 'ulanish'),
        pk(ramkaJ, '200 OK', ['iframe'], 'ulanish'),
      ],
    },
    {
      qisqa: 'To‘sildi', nishon: 'texnika',
      sarlavha: 'Javob keldi — lekin freymda ko‘rsatilmadi',
      matn: [
        `Brauzer \`panel.html\` ni so‘radi va **200 OK** oldi — tarmoqda hammasi joyida. Lekin javobda **\`X-Frame-Options: ${xfo}\`** va **\`Content-Security-Policy: ${fa}\`**.`,
        'Chromium konsoli: “Framing … violates … frame-ancestors \'none\'. The request has been blocked.” Ikkalasi bo‘lsa, `frame-ancestors` ni biladigan brauzer `X-Frame-Options` ga qaramaydi; eski brauzerlar uchun ikkalasini yuborish mumkin (22-bob).',
      ],
      callout: { tur: 'maslahat', matn: '`frame-ancestors` `default-src` dan meros olmaydi — yozilmasa, hamma freym ruxsat. Va u faqat HTTP sarlavhasida ishlaydi, `<meta>` CSP’da emas (MDN, 22-bob).' },
      faktlar: [['Javob', '200 OK'], ['X-Frame-Options', xfo], ['CSP', fa], ['Natija', 'freym to‘sildi']],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        pk(panel, 'GET /panel.html', ['freym uchun'], 'sorov'),
        pk(panelJ, '200 OK', [`X-Frame-Options: ${xfo}`, fa], 'javob'),
        { tur: 'teg', tugun: 'brauzer', matn: 'freym to‘sildi', rang: 'ok' },
      ],
    },
    {
      qisqa: 'Xulosa', nishon: 'xulosa',
      sarlavha: 'Qoidani server beradi, bajaradi brauzer',
      matn: [
        'Bu darsdagi himoyalar tarmoqda deyarli ko‘rinmaydi: so‘rov ketmaydi (tashqi skript) yoki javob keladi, lekin ishlatilmaydi (freym). Ko‘rinadigan iz — javob sarlavhalari va CSP hisobotlari.',
        'CSP — XSS’ga qarshi ikkinchi qatlam; birinchisi — chiqishni ekranlash (21-bob). Freym himoyasi — har sahifaga `frame-ancestors` (va eski brauzerlar uchun `X-Frame-Options`).',
      ],
      callout: { tur: 'goya', matn: 'Brauzer qatlamidagi muammolar (“skript ishlamayapti”, “freym bo‘sh”) tarmoqda “hammasi 200” bo‘lib ko‘rinadi — sababini konsoldan qidiring (30-bob).' },
      korinadi: KORINADI,
      kamera: KORINADI,
      kartalar: [{
        sarlavha: 'Yozuvdan',
        qatorlar: [
          ['nonce’li skript', 'bajarildi'],
          ['ichki skript', 'to‘sildi · hisobot'],
          ['tashqi.js', `to‘sildi · ${tashqiSorov ? 'so‘rov bor' : 'so‘rov yo‘q'}`],
          ['panel freymda', '200 OK · ko‘rsatilmadi', true],
        ],
        joy: 'yuqori-chap',
        izoh: 'paketlar va Chromium konsoli',
      }],
      hodisalar: [{ tur: 'teg', tugun: 'brauzer', matn: null }],
    },
  ],
}
