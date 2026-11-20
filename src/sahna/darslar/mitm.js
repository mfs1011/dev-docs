// "Yo'ldagi kuzatuvchi" — Paket yo'li darsi. Paketlar VPS laboratoriyasidagi haqiqiy yozuvdan (paket-lab/ssenariy/mitm.sh:
// bitta login formasi POST — ochiq HTTP, keyin HTTPS). Yozuv ROUTERDA (uy tarmog'i tomoni) — ochiq Wi-Fi egasi ko'radigan nuqta.
// HTTPS ichini dars "kalit bilan ochish" orqali ko'rsatadi (klient kalitlari) — kuzatuvchida bu kalit yo'q.
// Login/parol — faqat laboratoriya uchun sinov qiymatlari. Mavzu himoya uchun: nega HTTPS va HSTS kerak.
// docs/vizualizator/paket-yoli.md 4.1 (13-dars)
import yozuv from '../paket/yozuvlar/mitm.json'

const P = yozuv.paketlar
const VEB = '203.0.113.10'
const ochiqInfo = (p) => p.ochiq?.info ?? p.info
const top = (re, dan = 0, kalit = false) => {
  const p = P.find((x) => x.n > dan && re.test(kalit ? ochiqInfo(x) : x.info))
  if (!p) throw new Error(`mitm: yozuvda topilmadi: ${re}`)
  return p
}
const maydonlar = (q, k) => {
  const r = []
  const yur = (f) => { if (f.k === k) r.push(f.s); (f.m ?? []).forEach(yur) }
  q.forEach(yur)
  return r
}
const qiymat = (s) => s.slice(s.indexOf(':') + 1).replace(/\\r\\n$/, '').trim()

// ochiq HTTP
const httpPost = top(/^POST \/kirish /)
const httpOk = top(/200 OK/, httpPost.n)
const forma = (q) => {
  const k = maydonlar(q, 'urlencoded-form.key').map(qiymat)
  const v = maydonlar(q, 'urlencoded-form.value').map(qiymat)
  return k.map((x, i) => `${x}=${v[i]}`).join('&')
}
const httpForma = forma(httpPost.qatlamlar)
const host = qiymat(maydonlar(httpPost.qatlamlar, 'http.host')[0])

// HTTPS
const syn443 = top(/ → 443 \[SYN\]/)
const ch = top(/Client Hello/)
const sni = qiymat(maydonlar(ch.qatlamlar, 'tls.handshake.extensions_server_name')[0])
const tlsPost = top(/^POST \/kirish /, ch.n, true)
const tlsOk = top(/200 OK/, tlsPost.n, true)
const tlsForma = forma(tlsPost.ochiq.qatlamlar)
const hsts = maydonlar(tlsOk.ochiq.qatlamlar, 'http.response.line').map(qiymat).find((s) => /max-age/.test(s))
  ?? maydonlar(tlsOk.ochiq.qatlamlar, 'http.response.line').find((s) => s.startsWith('Strict-Transport-Security'))
const hstsHttpda = maydonlar(httpOk.qatlamlar, 'http.response.line').some((s) => s.startsWith('Strict-Transport-Security'))
const maxAge = Number(hsts?.match(/max-age=(\d+)/)?.[1])
const ilova = P.filter((x) => x.n > ch.n && /^Application Data$/.test(x.info))

const pk = (p, yorliq, qatorlar, rang, qoshimcha = {}) => {
  const [dan, ga] = p.src === VEB ? ['veb', 'klient'] : ['klient', 'veb']
  return { tur: 'paket', n: p.n, yorliq, qatorlar, rang, dan, ga, ...qoshimcha }
}
const KORINADI = ['klient', 'router', 'veb']

export default {
  id: 'mitm',
  tur: 'paket',
  sarlavha: 'Yo‘ldagi kuzatuvchi',
  shior: 'Bitta login formasi ikki marta: ochiq HTTP’da router parolni o‘qiydi, HTTPS’da — faqat sayt nomi va hajmlarni.',
  daraja: 'boshlang‘ich',
  daqiqa: 7,
  yozuv,
  yozuvNuqta: 'Routerda yozilgan — kuzatuvchi ko‘radigan nuqta',
  kitob: [
    { yol: '/web-asoslari/28-mitm', nom: 'Web asoslari, 28: O‘rtadagi odam hujumi' },
    { yol: '/web-asoslari/27-hsts', nom: 'Web asoslari, 27: HSTS' },
  ],
  manba: [
    { nom: 'MDN — Manipulator in the Middle', url: 'https://developer.mozilla.org/en-US/docs/Glossary/MitM' },
    { nom: 'RFC 6797 — HSTS', url: 'https://www.rfc-editor.org/rfc/rfc6797' },
    { nom: 'RFC 6797 — 8.1 HTTP’da kelgan STS e’tiborsiz', url: 'https://www.rfc-editor.org/rfc/rfc6797#section-8.1' },
    { nom: 'RFC 6797 — 14.6 Birinchi tashrif', url: 'https://www.rfc-editor.org/rfc/rfc6797#section-14.6' },
    { nom: 'RFC 6066 — 3 SNI', url: 'https://www.rfc-editor.org/rfc/rfc6066#section-3' },
  ],
  sinov: `Yozuv: VPS laboratoriyasi (paket-lab/), tcpdump routerning uy tarmog‘i tomonida (192.168.1.1) — klient bilan bir Wi-Fi’dagi kuzatuvchi o‘rnida. Klient \`curl -d 'login=…&parol=…'\` bilan avval \`http://sayt.test/kirish\`, 1 soniyadan keyin \`https://sayt.test/kirish\` ga yubordi. Login/parol faqat laboratoriya uchun. HTTPS ichi — klientning \`SSLKEYLOGFILE\` kaliti bilan, faqat darsda ko‘rsatish uchun. ${yozuv.versiyalar.filter((v) => /^(sana|curl|nginx version|TShark)/.test(v)).map((v) => v.replace(/ \(x86.*$/, '')).join(' · ')}`,
  trenajor: { yol: '/web-asoslari/trenajor', nom: 'HTTP laboratoriyasida o‘zingiz yuboring' },
  protokol: {
    izoh: 'Klient va server orasidagi har bir tugun (Wi-Fi nuqtasi, router, provayder) o‘zidan o‘tgan paketlarni ko‘radi. Ochiq HTTP’da — hammasini; TLS’da — faqat kimga ulanayotganingizni va qancha bayt ketganini.',
    faktlar: [['Ochiq HTTP', 'hammasi ko‘rinadi'], ['HTTPS', 'IP, SNI, hajm, vaqt'], ['Himoya', 'HTTPS + HSTS'], ['Standart', 'RFC 6797 (HSTS)']],
  },
  organasiz: [
    { matn: 'Ochiq HTTP’da kuzatuvchi nimani o‘qiydi', qadam: 2 },
    { matn: 'HTTPS’da ham nima ko‘rinib qoladi', qadam: 3 },
    { matn: 'HSTS nimadan himoya qiladi', qadam: 5 },
  ],
  afsona: [{ k: 'sorov', nom: 'so‘rov' }, { k: 'javob', nom: 'javob' }, { k: 'ulanish', nom: 'TLS va TCP' }],
  ishtirokchilar: ['klient', 'veb'],
  tugunlar: {
    klient: { ikonka: 'noutbuk', nom: 'Klient', izoh: '192.168.1.10', x: 130, y: 330 },
    router: { ikonka: 'router', nom: 'Router (kuzatuvchi)', izoh: '192.168.1.1 · tcpdump', x: 420, y: 330 },
    veb: { ikonka: 'server', nom: 'Veb-server', izoh: 'sayt.test · 80, 443', x: 740, y: 330 },
  },
  chiziqlar: [['klient', 'router'], ['router', 'veb']],
  yollar: {
    'klient>veb': ['klient', 'router', 'veb'], 'veb>klient': ['veb', 'router', 'klient'],
  },
  qadamlar: [
    {
      qisqa: 'Kuzatuvchi', nishon: 'sozlash',
      sarlavha: 'Kuzatuvchi — yo‘lning o‘rtasida',
      matn: [
        'Bu darsda yozuv klientda emas, **routerda** olindi — uy tarmog‘i tomonida. Ochiq Wi-Fi egasi, kafedagi soxta nuqta yoki provayder xuddi shu joyda turadi: klient yuborgan har paket ulardan o‘tadi.',
        'Klient bitta login formasini ikki marta yubordi: avval ochiq HTTP orqali, keyin HTTPS orqali. Kuzatuvchi ikkalasida nimani ko‘rishini solishtiramiz.',
      ],
      callout: { tur: 'goya', matn: 'O‘rtadagi odam (MITM) faqat ko‘rmaydi — ochiq HTTP’da javobni o‘zgartira ham oladi: sahifaga skript qo‘shish, havolani almashtirish (Web asoslari, 28-bob).' },
      faktlar: [['Yozuv nuqtasi', 'router, uy tomoni'], ['Klient', '192.168.1.10'], ['Server', VEB]],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        { tur: 'teg', tugun: 'router', matn: 'tcpdump', rang: 'info' },
      ],
    },
    {
      qisqa: 'HTTP', nishon: 'texnika',
      sarlavha: 'Ochiq HTTP: parol ochiq matnda',
      matn: [
        `Klient \`POST /kirish\` yubordi (\`Host: ${host}\`). Router bu paketda hamma narsani o‘qidi — forma tanasi: **\`${httpForma}\`**. Hech qanday ochish, kalit kerak emas.`,
        'Javob ham ochiq: kod, sarlavhalar, tana. Agar server sessiya cookie’si bergan bo‘lganida, kuzatuvchi uni ham olib, foydalanuvchi nomidan kira olardi (10-dars).',
      ],
      callout: { tur: 'ogoh', matn: 'POST paketini bosing: `HTML Form URL Encoded` qatlamida `login` va `parol` maydonlari. Bu — routerdagi yozuvning o‘zi, kalitsiz.' },
      faktlar: [['So‘rov', 'POST /kirish'], ['Forma', httpForma], ['Kuzatuvchi', 'hammasini ko‘rdi']],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        pk(httpPost, 'POST /kirish', [httpForma], 'sorov'),
        { tur: 'teg', tugun: 'router', matn: `o‘qidi: ${httpForma.split('&').pop()}`, rang: 'xato' },
        pk(httpOk, '200 OK', ['kirdingiz'], 'javob'),
      ],
    },
    {
      qisqa: 'SNI', nishon: 'tushuncha',
      sarlavha: 'HTTPS: ochiq qolgan yagona joy — salomlashish',
      matn: [
        `Endi o‘sha forma HTTPS orqali. TCP ulanish (port 443) va ClientHello — hali shifrsiz. Kuzatuvchi ko‘radi: IP manzillar, port va ClientHello’dagi **SNI: \`${sni}\`** — klient qaysi saytga kirayotgani (RFC 6066, 3).`,
        'Sertifikat ham, keyingi hamma narsa ham TLS 1.3 da shifrlangan (4-dars). Kuzatuvchi “sayt.test ga ulandi” deb biladi, lekin qaysi sahifa, qanday forma — yo‘q.',
      ],
      callout: { tur: 'maslahat', matn: 'HTTPS — mazmun va yaxlitlik himoyasi, anonimlik emas: IP, SNI’dagi domen va trafik hajmi ko‘rinadi (Web asoslari, 28-bob).' },
      faktlar: [['Ko‘rinadi', `IP, port 443, SNI ${sni}`], ['Ko‘rinmaydi', 'yo‘l, sarlavhalar, tana']],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        { tur: 'teg', tugun: 'router', matn: null },
        pk(ch, 'CLIENT HELLO', [`SNI: ${sni}`], 'ulanish'),
        { tur: 'teg', tugun: 'router', matn: `ko‘rdi: ${sni}`, rang: 'ogoh' },
      ],
    },
    {
      qisqa: 'Shifr', nishon: 'texnika',
      sarlavha: 'Forma — “Application Data”',
      matn: [
        `O‘sha POST endi routerda shunchaki **Application Data** — ${tlsPost.len} baytli paket. Kuzatuvchi faqat hajm va vaqtni biladi; \`login\`, \`parol\`, hatto \`/kirish\` yo‘li ham ko‘rinmaydi.`,
        `“Kalit bilan ochish” ni yoqing: ichida xuddi o‘sha \`${tlsForma}\`. Bu kalit faqat klientda (\`SSLKEYLOGFILE\`, dars uchun) — routerda u yo‘q, shuning uchun uning ko‘rgani — faqat shifrlangan baytlar.`,
      ],
      callout: { tur: 'ogoh', matn: 'Kuzatuvchi o‘z sertifikati bilan “o‘rtaga” kirishga urinsa, brauzer uni tanimaydi — sertifikat ishonchli CA’dan emas (26-bob). Agar qurilmaga uning CA’si o‘rnatilgan bo‘lsa — himoya yo‘q: ildiz sertifikatlar ro‘yxati muhim.' },
      faktlar: [['Routerda', `Application Data, ${tlsPost.len} B`], ['Kalit bilan', 'POST /kirish'], ['Shifrlangan paketlar', `${ilova.length} ta`]],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        { tur: 'teg', tugun: 'router', matn: null },
        pk(tlsPost, 'APPLICATION DATA', [`${tlsPost.len} B · ichida POST`], 'sorov'),
        { tur: 'teg', tugun: 'router', matn: 'ko‘rdi: faqat hajm', rang: 'ok' },
        pk(tlsOk, 'APPLICATION DATA', ['ichida 200 OK'], 'javob'),
      ],
    },
    {
      qisqa: 'HSTS', nishon: 'tushuncha',
      sarlavha: 'HSTS: keyingi safar HTTP’ga qaytmaslik',
      matn: [
        `Muammo: foydalanuvchi \`sayt.test\` yoki \`http://…\` yozsa, birinchi so‘rov ochiq HTTP’da ketadi — 2-qadamdagi holat. Shuning uchun HTTPS javobida server **\`Strict-Transport-Security: ${hsts?.replace(/^Strict-Transport-Security:\s*/, '') ?? '—'}\`** yubordi (kalit bilan ko‘rinadi): “${maxAge ? `${Math.round(maxAge / 86400)} kun` : 'shu muddat'} davomida bu saytga faqat HTTPS bilan kel”.`,
        `Brauzer buni eslab qoladi va \`http://\` manzilni so‘rov yubormasdan oldin \`https://\` ga almashtiradi. ${hstsHttpda ? '' : 'Ochiq HTTP javobida bu sarlavha yo‘q — bo‘lganida ham brauzer uni e’tiborsiz qoldirardi: kuzatuvchi uni qo‘shishi yoki olib tashlashi mumkin (RFC 6797, 8.1).'}`,
      ],
      callout: { tur: 'goya', matn: 'HSTS birinchi tashrifni himoya qilmaydi — brauzer sarlavhani hali ko‘rmagan (RFC 6797, 14.6). Buning uchun brauzerlarning “preload” ro‘yxati bor (Web asoslari, 27-bob).' },
      faktlar: [['Sarlavha', 'Strict-Transport-Security'], ['max-age', maxAge ? `${maxAge} s` : '—'], ['Qayerda', 'faqat HTTPS javobida']],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        { tur: 'teg', tugun: 'router', matn: null },
        { tur: 'teg', tugun: 'klient', matn: 'faqat HTTPS (HSTS)', rang: 'ok' },
      ],
    },
    {
      qisqa: 'Xulosa', nishon: 'xulosa',
      sarlavha: 'Kuzatuvchi nimani ko‘rdi',
      matn: [
        'Bir xil forma, bir xil server, bir xil router. Ochiq HTTP’da kuzatuvchi parolni o‘qidi; HTTPS’da — sayt nomi va baytlar soni.',
        'Himoya: hamma sahifa HTTPS’da, HTTP faqat HTTPS’ga yo‘naltiradi (6-dars), HTTPS javoblarida HSTS. Login, cookie, token — hech qachon ochiq HTTP’da emas.',
      ],
      callout: { tur: 'maslahat', matn: 'Tipik xato: ochiq Wi-Fi’da HTTP saytga parol kiritish — tarmoq egasi uni ko‘radi (Web asoslari, 28-bob). Bu darsning 2-qadami aynan shu.' },
      korinadi: KORINADI,
      kamera: KORINADI,
      kartalar: [{
        sarlavha: 'Routerda ko‘rindi',
        qatorlar: [
          ['HTTP: yo‘l', 'POST /kirish'],
          ['HTTP: forma', httpForma, true],
          ['HTTPS: SNI', sni],
          ['HTTPS: forma', `— (${tlsPost.len} B shifr)`],
          ['ikkalasida', 'IP, port, vaqt'],
        ],
        joy: 'yuqori-chap',
        izoh: 'sinov login-paroli, faqat laboratoriya uchun',
      }],
      hodisalar: [{ tur: 'teg', tugun: 'klient', matn: null }],
    },
  ],
}
