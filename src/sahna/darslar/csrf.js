// "CSRF" — Paket yo'li darsi. Paketlar VPS laboratoriyasidagi haqiqiy yozuvdan: headless Chromium (paket-lab/brauzer)
// https://sayt.test/csrf/kirish da ikki cookie oladi (SameSite=Lax va None), o'z saytiga POST qiladi, keyin boshqa saytdagi
// (http://yomon.test/hujum.html) avtomatik forma sayt.test ga POST yuboradi (paket-lab/ssenariy/csrf.sh). Haqiqiy pul o'tkazmasi
// yo'q — server faqat ko'rgan Cookie va Sec-Fetch-Site'ni qaytaradi. HTTPS ichi — Chromium kalitlari bilan "ochiq" daraxt.
// docs/vizualizator/paket-yoli.md 4.1 (20-bob)
import yozuv from '../paket/yozuvlar/csrf.json'

const P = yozuv.paketlar
const VEB = '203.0.113.10'
const ochiqInfo = (p) => p.ochiq?.info ?? p.info
const top = (re, dan = 0) => {
  const p = P.find((x) => x.n > dan && re.test(ochiqInfo(x)))
  if (!p) throw new Error(`csrf: yozuvda topilmadi: ${re}`)
  return p
}
const maydonlar = (p, k) => {
  const r = []
  const yur = (f) => { if (f.k === k) r.push(f.s); (f.m ?? []).forEach(yur) }
  ;(p.ochiq?.qatlamlar ?? p.qatlamlar).forEach(yur)
  return r
}
// HTTP/2 sarlavhalari: "Header: nom: qiymat"
const sarlavhalar = (p) => maydonlar(p, 'http2.header').map((s) => s.replace(/^Header:\s*/, ''))
const sarlavha = (p, nom) => sarlavhalar(p).filter((s) => s.startsWith(`${nom}: `)).map((s) => s.slice(nom.length + 2))
const tanaMatn = (p) => {
  const hex = maydonlar(p, 'http2.data.data').map((s) => s.replace(/^Data[^:]*:\s*/, ''))[0] ?? ''
  return hex.match(/../g)?.map((h) => String.fromCharCode(parseInt(h, 16))).join('').trim() ?? ''
}

const kirishJ = top(/HEADERS\[\d+\]: 200 OK/)
const setCookie = sarlavha(kirishJ, 'set-cookie')
const nom = (s) => s.split('=')[0]
const [lax, none] = [setCookie.find((s) => /SameSite=Lax/.test(s)), setCookie.find((s) => /SameSite=None/.test(s))]

const postlar = P.filter((x) => /HEADERS\[\d+\]: POST \/csrf\/otkazma/.test(ochiqInfo(x)))
const tahlil = (p) => {
  const oqim = ochiqInfo(p).match(/HEADERS\[(\d+)\]/)[1]
  const javob = top(new RegExp(`HEADERS\\[${oqim}\\]: 200 OK`), p.n)
  return {
    p, javob,
    cookie: sarlavha(p, 'cookie').map(nom),
    site: sarlavha(p, 'sec-fetch-site')[0],
    mode: sarlavha(p, 'sec-fetch-mode')[0],
    origin: sarlavha(p, 'origin')[0],
    javobMatn: tanaMatn(javob),
  }
}
const [ichki, tashqi] = postlar.map(tahlil)
const hujumGet = top(/^GET \/hujum\.html /)
const hujumJ = top(/^HTTP\/1\.1 200 OK/, hujumGet.n)

const pk = (p, yorliq, qatorlar, rang, qoshimcha = {}) => {
  const [dan, ga] = p.src === VEB ? ['veb', 'brauzer'] : ['brauzer', 'veb']
  return { tur: 'paket', n: p.n, yorliq, qatorlar, rang, dan, ga, ...qoshimcha }
}
const KORINADI = ['brauzer', 'router', 'veb']

export default {
  id: 'csrf',
  tur: 'paket',
  sarlavha: 'CSRF va SameSite',
  shior: 'Boshqa sayt sizning nomingizdan forma yuboradi — brauzer qaysi cookie’ni qo‘shishi SameSite’ga bog‘liq.',
  daraja: 'o‘rta',
  daqiqa: 8,
  yozuv,
  yozuvNuqta: 'Brauzer tomonida yozilgan (uy tarmog‘i)',
  kitob: [
    { yol: '/web-asoslari/20-csrf', nom: 'Web asoslari, 20: CSRF' },
    { yol: '/web-asoslari/14-cookie', nom: 'Web asoslari, 14: Cookie' },
  ],
  manba: [
    { nom: 'MDN — Cross-site request forgery', url: 'https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/CSRF' },
    { nom: 'MDN — Set-Cookie', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie' },
    { nom: 'W3C — Fetch Metadata Request Headers', url: 'https://www.w3.org/TR/fetch-metadata/' },
    { nom: 'MDN — Sec-Fetch-Site', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-Fetch-Site' },
    { nom: 'RFC 9113 — 8.2.3 Cookie sarlavhasi HTTP/2 da', url: 'https://www.rfc-editor.org/rfc/rfc9113#section-8.2.3' },
  ],
  sinov: `Yozuv: VPS laboratoriyasi (paket-lab/), haqiqiy headless Chromium (192.168.1.20). U \`https://sayt.test/csrf/kirish\` ni ochdi: sahifa o‘z saytiga \`fetch\` bilan POST qildi va \`http://yomon.test/hujum.html\` ga o‘tdi; u sahifa yashirin formani \`https://sayt.test/csrf/otkazma\` ga avtomatik yubordi. Haqiqiy o‘tkazma yo‘q — server ko‘rgan Cookie va Sec-Fetch-Site’ni qaytaradi. Brauzer oxirgi sahifasi: “${tashqi.javobMatn}”. HTTPS ichi Chromium’ning \`SSLKEYLOGFILE\` kaliti bilan ochilgan. ${yozuv.versiyalar.filter((v) => /^(sana|Chromium|nginx version|TShark)/.test(v)).map((v) => v.replace(/ built on.*$/, '')).join(' · ')}`,
  trenajor: { yol: '/web-asoslari/trenajor', nom: 'HTTP laboratoriyasida o‘zingiz yuboring' },
  protokol: {
    izoh: 'CSRF (cross-site request forgery) — boshqa sayt foydalanuvchi brauzeri orqali sizning saytingizga so‘rov yuboradi; brauzer unga cookie’ni o‘zi qo‘shsa, server so‘rovni foydalanuvchiniki deb biladi. Himoya: CSRF token, Sec-Fetch-Site tekshiruvi, SameSite cookie.',
    faktlar: [['Hujum', 'boshqa saytdan forma'], ['Himoya', 'token, Sec-Fetch-Site, SameSite'], ['SameSite=Lax', 'cross-site POST’da yo‘q'], ['Manba', 'MDN, Fetch Metadata']],
  },
  organasiz: [
    { matn: 'O‘z saytidan va boshqa saytdan kelgan so‘rov farqi', qadam: 4 },
    { matn: 'SameSite=Lax va None amalda', qadam: 4 },
    { matn: 'Server qanday himoyalanadi', qadam: 5 },
  ],
  afsona: [{ k: 'sorov', nom: 'so‘rov' }, { k: 'javob', nom: 'javob' }, { k: 'ulanish', nom: 'boshqa saytdan' }],
  ishtirokchilar: ['brauzer', 'veb'],
  tugunlar: {
    brauzer: { ikonka: 'noutbuk', nom: 'Brauzer', izoh: 'Chromium · 192.168.1.20', x: 130, y: 330 },
    router: { ikonka: 'router', nom: 'Router', izoh: '192.168.1.1', x: 420, y: 330 },
    veb: { ikonka: 'server', nom: 'Veb-server', izoh: 'sayt.test · yomon.test', x: 740, y: 330 },
  },
  chiziqlar: [['brauzer', 'router'], ['router', 'veb']],
  yollar: {
    'brauzer>veb': ['brauzer', 'router', 'veb'], 'veb>brauzer': ['veb', 'router', 'brauzer'],
  },
  qadamlar: [
    {
      qisqa: 'Kirish', nishon: 'sozlash',
      sarlavha: 'Kirish: ikki cookie, ikki SameSite',
      matn: [
        `Foydalanuvchi \`https://sayt.test\` ga kirdi. Server ikki sessiya cookie’si berdi: **\`${lax}\`** va **\`${none}\`**.`,
        'Farq faqat `SameSite` da. `Lax` — boshqa saytdan kelgan so‘rovlarda cheklangan; `None` — har doim yuboriladi (shuning uchun `Secure` majburiy). Ikkalasi `HttpOnly` — JavaScript ko‘rmaydi (10-dars).',
      ],
      callout: { tur: 'maslahat', matn: 'HTTPS paketini kalit bilan oching: HTTP/2 javobida ikkita `set-cookie` sarlavhasi.' },
      faktlar: [[nom(lax), 'SameSite=Lax'], [nom(none), 'SameSite=None; Secure']],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        pk(kirishJ, '200 OK', setCookie.map((s) => s.split(';')[0] + '; ' + s.match(/SameSite=\w+/)[0]), 'javob'),
        { tur: 'teg', tugun: 'brauzer', matn: `${nom(lax)} · ${nom(none)}`, rang: 'ok' },
      ],
    },
    {
      qisqa: 'O‘z sayti', nishon: 'texnika',
      sarlavha: 'O‘z saytidan POST: ikkala cookie',
      matn: [
        `Sahifa o‘z saytiga \`POST /csrf/otkazma\` yubordi. Brauzer **ikkala cookie’ni** qo‘shdi (${ichki.cookie.map((c) => `\`${c}\``).join(', ')}) va o‘zi **\`Sec-Fetch-Site: ${ichki.site}\`**, \`Origin: ${ichki.origin}\` yozdi.`,
        `Server javobi: “${ichki.javobMatn}”. Oddiy holat — foydalanuvchi o‘z saytida amal bajardi.`,
      ],
      callout: { tur: 'goya', matn: 'HTTP/2 da ikki cookie ikki alohida `cookie` sarlavhasida ketdi — HPACK yaxshiroq siqishi uchun standart shunga ruxsat beradi (RFC 9113, 8.2.3).' },
      faktlar: [['Cookie', ichki.cookie.join(', ')], ['Sec-Fetch-Site', ichki.site], ['Origin', ichki.origin]],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        { tur: 'teg', tugun: 'brauzer', matn: null },
        pk(ichki.p, 'POST /csrf/otkazma', [`cookie: ${ichki.cookie.join(', ')}`, `sec-fetch-site: ${ichki.site}`], 'sorov'),
        pk(ichki.javob, '200 OK', ['ikkalasi keldi'], 'javob'),
      ],
    },
    {
      qisqa: 'Boshqa sayt', nishon: 'muammo',
      sarlavha: 'Boshqa sayt: yashirin forma',
      matn: [
        'Endi foydalanuvchi boshqa saytni ochdi — `http://yomon.test/hujum.html` (“Yutuq!”). Sahifada yashirin forma: `action="https://sayt.test/csrf/otkazma"`, `summa=1000000` — va skript uni darhol yuboradi.',
        'Foydalanuvchi hech narsa bosmadi. Hujumchi javobni o‘qiy olmaydi (same-origin, 18-bob) — unga kerak ham emas: maqsad — so‘rov serverda bajarilishi.',
      ],
      callout: { tur: 'ogoh', matn: 'CSRF sharti: amal faqat cookie bilan tekshiriladi, so‘rovni oldindan bilish mumkin va brauzer cookie’ni boshqa saytdan kelgan so‘rovga ham qo‘shadi (Web asoslari, 20-bob).' },
      faktlar: [['Sayt', 'yomon.test'], ['Forma', 'POST → sayt.test'], ['Foydalanuvchi', 'hech narsa bosmadi']],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        pk(hujumGet, 'GET /hujum.html', ['yomon.test'], 'ulanish'),
        pk(hujumJ, '200 OK', ['yashirin forma'], 'ulanish'),
      ],
    },
    {
      qisqa: 'Cross-site', nishon: 'texnika',
      sarlavha: 'Boshqa saytdan POST: faqat None cookie',
      matn: [
        `Forma ketdi: \`Origin: ${tashqi.origin}\`, **\`Sec-Fetch-Site: ${tashqi.site}\`**, \`Sec-Fetch-Mode: ${tashqi.mode}\`. Cookie — faqat **\`${tashqi.cookie.join(', ')}\`**.`,
        `\`${nom(lax)}\` (\`SameSite=Lax\`) **yuborilmadi**: Lax cookie boshqa saytdan kelgan POST’ga qo‘shilmaydi. \`${nom(none)}\` (\`SameSite=None\`) esa ketdi — agar server sessiyani shunga qarab tekshirsa, so‘rov foydalanuvchiniki bo‘lib bajariladi.`,
      ],
      callout: { tur: 'ogoh', matn: `Server javobi: “${tashqi.javobMatn}”. Shu bitta qatorda ham hujum, ham himoya ko‘rinadi.` },
      faktlar: [['Cookie', tashqi.cookie.join(', ')], [`${nom(lax)}`, 'yo‘q'], ['Sec-Fetch-Site', tashqi.site], ['Origin', tashqi.origin]],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        pk(tashqi.p, 'POST /csrf/otkazma', [`cookie: ${tashqi.cookie.join(', ')}`, `sec-fetch-site: ${tashqi.site}`], 'sorov'),
        { tur: 'teg', tugun: 'brauzer', matn: `${nom(lax)} qo‘shilmadi`, rang: 'ok' },
        pk(tashqi.javob, '200 OK', [`${nom(none)} keldi`], 'javob'),
      ],
    },
    {
      qisqa: 'Himoya', nishon: 'tushuncha',
      sarlavha: 'Server qanday himoyalanadi',
      matn: [
        `Yozuvda server farqni ko‘rishi uchun hamma narsa bor: **\`Sec-Fetch-Site: ${tashqi.site}\`** va begona \`Origin\`. Holat o‘zgartiruvchi so‘rov \`cross-site\` dan kelsa — rad etish (Fetch metadata).`,
        'Asosiy himoyalar (MDN, Web asoslari 20-bob): **CSRF token** — formadagi taxmin qilib bo‘lmaydigan qiymat, begona sayt uni bilmaydi; **Sec-Fetch-Site** tekshiruvi; **SameSite** cookie — qo‘shimcha qatlam, yagona himoya emas.',
      ],
      callout: { tur: 'maslahat', matn: 'Sessiya cookie’si — `SameSite=Strict`, iloji bo‘lmasa `Lax`. Holatni `GET` bilan o‘zgartirmang: `Lax` cookie boshqa saytdan `GET` o‘tishda yuboriladi (20-bob).' },
      faktlar: [['Token', 'begona sayt bilmaydi'], ['Sec-Fetch-Site', 'cross-site → rad'], ['SameSite', 'qo‘shimcha qatlam']],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        { tur: 'teg', tugun: 'brauzer', matn: null },
        { tur: 'teg', tugun: 'veb', matn: `${tashqi.site} → rad`, rang: 'insight' },
      ],
    },
    {
      qisqa: 'Xulosa', nishon: 'xulosa',
      sarlavha: 'Bir xil so‘rov, ikki manba',
      matn: [
        'Ikki POST bir xil manzilga, bir xil brauzerdan. Farq — qayerdan boshlangani: brauzer buni `Sec-Fetch-Site` va `Origin` bilan aytdi va cookie’larni `SameSite` qoidasiga ko‘ra tanladi.',
        'CSRF’ni brauzer o‘zi to‘liq to‘xtatmaydi — u faqat signal beradi va ba’zi cookie’larni ushlab qoladi. Qarorni server qabul qiladi.',
      ],
      callout: { tur: 'goya', matn: '`SameSite` **sayt** bo‘yicha ishlaydi, origin bo‘yicha emas: `a.example.org` va `b.example.org` — bir sayt (MDN). Bu yozuvda `sayt.test` va `yomon.test` — boshqa-boshqa saytlar.' },
      korinadi: KORINADI,
      kamera: KORINADI,
      kartalar: [{
        sarlavha: 'Yozuvdan: ikki POST',
        qatorlar: [
          ['o‘z saytidan', ichki.site],
          ['  cookie', ichki.cookie.join(', ')],
          ['boshqa saytdan', tashqi.site, true],
          ['  cookie', tashqi.cookie.join(', '), true],
        ],
        joy: 'yuqori-chap',
        izoh: 'Chromium, HTTP/2 sarlavhalari (kalit bilan)',
      }],
      hodisalar: [{ tur: 'teg', tugun: 'veb', matn: null }],
    },
  ],
}
