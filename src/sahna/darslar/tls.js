// "TLS 1.3" — Paket yo'li darsi. Paketlar VPS laboratoriyasidagi haqiqiy yozuvdan (paket-lab/ssenariy/tls.sh: sinov CA
// zanjiri, nginx 443, curl SSLKEYLOGFILE bilan → tshark → scripts/paket/aylantir.mjs). "Kalit bilan ochilgan" ko'rinish
// (paket.ochiq) — shu yozuvning kalitlar jurnali bilan tshark ochgan daraxt. Qiymatlar yozuvdan hisoblanadi.
// docs/vizualizator/paket-yoli.md 4.1 (4-dars)
import yozuv from '../paket/yozuvlar/tls.json'

const P = yozuv.paketlar
const VEB = '203.0.113.10'
const ochiqInfo = (p) => p.ochiq?.info ?? p.info
const top = (re, dan = 0) => {
  const p = P.find((x) => x.n > dan && re.test(ochiqInfo(x)))
  if (!p) throw new Error(`tls: yozuvda topilmadi: ${re}`)
  return p
}
const syn = top(/ → 443 \[SYN\]/)
const synack = top(/\[SYN, ACK\]/)
const ack = top(/\[ACK\] Seq=1 Ack=1 /, synack.n)
const ch = top(/Client Hello/)
const sh = top(/Server Hello/)
const fin = top(/^Change Cipher Spec, Finished/, sh.n)
const get = top(/GET \/ HTTP\/1\.1/)
const ticket = P.filter((x) => /New Session Ticket/.test(ochiqInfo(x)))
const javobBosh = P.find((x) => x.n > ticket.at(-1).n && x.src === VEB && /TLS segment data/.test(x.info))
const ok = top(/HTTP\/1\.1 200 OK/)
const tanaBolaklar = P.filter((x) => x.src === VEB && x.n >= javobBosh.n && x.n <= ok.n)
const yopish = top(/Close Notify/)

// yozuvdagi maydonlar (ochiq daraxtdan, bo'lmasa oddiy)
const maydonlar = (p, re) => {
  const r = []
  const yur = (f) => { if (re.test(f.k)) r.push(f.s); (f.m ?? []).forEach(yur) }
  ;(p.ochiq?.qatlamlar ?? p.qatlamlar).forEach(yur)
  return r
}
const qiymat = (s) => s.slice(s.indexOf(':') + 1).trim()
const tanlanganShifr = qiymat(maydonlar(sh, /^tls\.handshake\.ciphersuite$/)[0]).replace(/ \(0x.*\)$/, '')
const klientShifrlar = maydonlar(ch, /^tls\.handshake\.ciphersuite$/).map((s) => qiymat(s).replace(/ \(0x.*\)$/, '')).filter((s) => !/SCSV/.test(s))
const guruh = qiymat(maydonlar(sh, /^tls\.handshake\.extensions_key_share_group$/)[0]).replace(/ \(\d+\)$/, '')
const sni = qiymat(maydonlar(ch, /^tls\.handshake\.extensions_server_name$/)[0])
const alpn = qiymat(maydonlar(ch, /^tls\.handshake\.extensions_alpn_str$/)[0])
const shXabarlar = maydonlar(sh, /^tls\.handshake\.type$/).map((s) => qiymat(s).replace(/ \(\d+\)$/, ''))
const cn = (s) => s.match(/commonName=([^,)]+)/)?.[1]
// sertifikatlar: har biri — issuer, notBefore, notAfter, subject (tshark tartibi)
const nomlar = maydonlar(sh, /^(x509if\.rdnSequence|x509af\.rdnSequence)$/).map(cn)
const muddatlar = maydonlar(sh, /^x509af\.utcTime$/).map((s) => qiymat(s).slice(0, 10))
const sayt = { subject: nomlar[1], issuer: nomlar[0], gacha: muddatlar[1] }
const oraliq = { subject: nomlar[3], issuer: nomlar[2], gacha: muddatlar[3] }
const san = qiymat(maydonlar(sh, /^x509ce\.dNSName$/)[0])
const sertSoni = maydonlar(sh, /^tls\.handshake\.certificate$/).length

const ms = (a, b) => `${Math.round((b.t - a.t) * 1000)} ms`
const pk = (p, yorliq, qatorlar, rang, qoshimcha = {}) => {
  const [dan, ga] = p.src === VEB ? ['veb', 'klient'] : ['klient', 'veb']
  return { tur: 'paket', n: p.n, yorliq, qatorlar, rang, dan, ga, ...qoshimcha }
}

export default {
  id: 'tls-1-3',
  tur: 'paket',
  sarlavha: 'TLS 1.3: shifrlangan ulanish',
  shior: 'Kalit kelishuvi, sertifikat zanjiri va shifrlangan so‘rov — paketma-paket, kerak bo‘lsa kalit bilan ochib.',
  daraja: 'o‘rta',
  daqiqa: 9,
  yozuv,
  kitob: [
    { yol: '/web-asoslari/25-tls', nom: 'Web asoslari, 25: TLS nima beradi' },
    { yol: '/web-asoslari/26-sertifikatlar', nom: 'Web asoslari, 26: Sertifikatlar' },
  ],
  manba: [
    { nom: 'RFC 9846 — TLS 1.3 (2: kelishuv umumiy ko‘rinishi)', url: 'https://www.rfc-editor.org/rfc/rfc9846#section-2' },
    { nom: 'RFC 9846 — 4.5 autentifikatsiya xabarlari', url: 'https://www.rfc-editor.org/rfc/rfc9846#section-4.5' },
    { nom: 'RFC 9846 — E.4 oraliq qurilmalar bilan moslik', url: 'https://www.rfc-editor.org/rfc/rfc9846#appendix-E.4' },
    { nom: 'RFC 5280 — X.509 sertifikati va zanjir tekshiruvi', url: 'https://www.rfc-editor.org/rfc/rfc5280#section-6' },
    { nom: 'RFC 6066 — SNI (server nomi)', url: 'https://www.rfc-editor.org/rfc/rfc6066#section-3' },
  ],
  sinov: `Yozuv: VPS laboratoriyasi (paket-lab/), \`curl --tlsv1.3 --cacert ildiz.pem https://sayt.test/\` — sinov CA zanjiri (ildiz → oraliq → sayt.test, ECDSA P-256), nginx faqat TLS 1.3. Kalitlar curl’ning SSLKEYLOGFILE jurnalidan — faqat “Kalit bilan ochish” uchun. Router ikki tomonga 10 ms kechikish qo‘shadi. ${yozuv.versiyalar.filter((v) => /^(sana|nginx version|built with|TShark)/.test(v)).join(' · ')}`,
  trenajor: { yol: '/web-asoslari/trenajor', nom: 'HTTP laboratoriyasida o‘zingiz yuboring' },
  protokol: {
    izoh: 'TLS — TCP ustidagi shifrlangan kanal. Ikki tomon tarmoqqa chiqmaydigan umumiy kalitga keladi, server sertifikat bilan kimligini isbotlaydi, keyin har bayt shifrlanadi va buzilmaganligi tekshiriladi.',
    faktlar: [['Qatlam', 'TCP ustida'], ['Port', '443 (HTTPS)'], ['Kelishuv', '1 borib-kelish'], ['Versiya', 'TLS 1.3'], ['Standart', 'RFC 9846']],
  },
  organasiz: [
    { matn: 'ClientHello va ServerHello: kalit qanday kelishiladi', qadam: 2 },
    { matn: 'Tashqaridan nima ko‘rinadi, nima yashirin', qadam: 4 },
    { matn: 'Sertifikat zanjiri qanday tekshiriladi', qadam: 5 },
    { matn: 'HTTPS so‘rovi uchun vaqt qayerga ketadi', qadam: 8 },
  ],
  afsona: [{ k: 'sorov', nom: 'klient' }, { k: 'javob', nom: 'server' }, { k: 'ulanish', nom: 'TCP boshqaruvi' }],
  ishtirokchilar: ['klient', 'veb'],
  tugunlar: {
    klient: { ikonka: 'noutbuk', nom: 'Klient', izoh: '192.168.1.10', x: 130, y: 330 },
    router: { ikonka: 'router', nom: 'Router', izoh: '192.168.1.1', x: 420, y: 330 },
    veb: { ikonka: 'server', nom: 'Veb-server', izoh: `${sni} · 443`, x: 740, y: 330 },
  },
  chiziqlar: [['klient', 'router'], ['router', 'veb']],
  yollar: {
    'klient>veb': ['klient', 'router', 'veb'], 'veb>klient': ['veb', 'router', 'klient'],
  },
  qadamlar: [
    {
      qisqa: 'Nega', nishon: 'sozlash',
      sarlavha: 'Ochiq HTTP’ni yo‘ldagi har kim o‘qiydi',
      matn: [
        'HTTP/1.1 darsida har bayt ochiq edi: so‘rov, sarlavhalar, sahifaning o‘zi. Yo‘ldagi har bir qurilma (router, provayder, umumiy Wi-Fi) ularni o‘qiy oladi va o‘zgartira oladi.',
        `**TLS** shu TCP ulanish ichida shifrlangan kanal ochadi. Avval odatdagi TCP kelishuvi — 443-portga, ${ms(syn, ack)}.`,
      ],
      callout: { tur: 'goya', matn: 'TLS uch narsa beradi: **maxfiylik** (mazmunni ko‘rib bo‘lmaydi), **yaxlitlik** (o‘zgartirilsa bilinadi), **autentifikatsiya** (server haqiqatan o‘zi ekani).' },
      faktlar: [['Server', `${sni} (203.0.113.10:443)`], ['Avval', 'TCP kelishuvi'], ['Vaqt', ms(syn, ack)]],
      korinadi: ['klient', 'router', 'veb'],
      kamera: ['klient', 'router', 'veb'],
      hodisalar: [
        pk(syn, 'SYN', ['→ 443'], 'ulanish'),
        pk(synack, 'SYN-ACK', [], 'ulanish'),
        pk(ack, 'ACK', [], 'ulanish'),
        { tur: 'teg', tugun: 'veb', matn: 'TCP ochiq', rang: 'info' },
      ],
    },
    {
      qisqa: 'ClientHello', nishon: 'texnika',
      sarlavha: 'ClientHello: “men bularni bilaman”',
      matn: [
        `Klient birinchi xabarda hamma narsani taklif qiladi: versiya (**TLS 1.3**), shifr to‘plamlari (${klientShifrlar.length} ta), qaysi saytga kelgani (**SNI: ${sni}**), ilova protokoli (**ALPN: ${alpn}**).`,
        `Eng muhimi — **kalit ulushi** (key_share, ${guruh}): klient yashirin son tanlab, undan ochiq qismni hisobladi va yubordi. Yashirin son tarmoqqa chiqmaydi.`,
      ],
      callout: { tur: 'ogoh', matn: `ClientHello shifrlanmagan: kuzatuvchi **${sni}** nomini ko‘radi (SNI). Sahifa yo‘li va mazmuni esa ko‘rinmaydi.` },
      faktlar: [['Versiya', 'TLS 1.3 (supported_versions)'], ['SNI', sni], ['Kalit ulushi', guruh], ['Shifrlar', klientShifrlar.join(', ')]],
      korinadi: ['klient', 'router', 'veb'],
      kamera: ['klient', 'router', 'veb'],
      hodisalar: [
        { tur: 'teg', tugun: 'veb', matn: null },
        pk(ch, 'CLIENT HELLO', [`SNI ${sni}`, `key_share ${guruh}`], 'sorov'),
      ],
    },
    {
      qisqa: 'ServerHello', nishon: 'texnika',
      sarlavha: 'ServerHello: tanlov va umumiy kalit',
      matn: [
        `Server tanladi: **${tanlanganShifr}**, ${guruh}, va o‘z kalit ulushini yubordi. Endi har tomon “o‘z yashirin soni + qarshi tomonning ochiq ulushi”dan **bir xil umumiy son** hisoblaydi. Kuzatuvchi ikkala ochiq ulushni ko‘rgan, lekin undan umumiy sonni topa olmaydi.`,
        `Shu paketning o‘zida ServerHello’dan keyingi hamma narsa allaqachon shifrlangan. ClientHello’dan ${ms(ch, sh)} o‘tdi — bitta borib-kelish.`,
      ],
      callout: { tur: 'maslahat', matn: 'Paket ichida “Change Cipher Spec” ham bor — TLS 1.3 da u ma’nosiz: eski TLS’ni kutadigan oraliq qurilmalar chalkashmasin deb yuboriladi (RFC 9846, E.4).' },
      faktlar: [['Shifr', tanlanganShifr], ['Guruh', guruh], ['Bitta paketda', `${shXabarlar.length} xabar`], ['Vaqt', ms(ch, sh)]],
      korinadi: ['klient', 'router', 'veb'],
      kamera: ['klient', 'router', 'veb'],
      hodisalar: [
        pk(sh, 'SERVER HELLO + …', [tanlanganShifr, `key_share ${guruh}`], 'javob'),
        { tur: 'teg', tugun: 'klient', matn: 'umumiy kalit ✓', rang: 'insight' },
        { tur: 'teg', tugun: 'veb', matn: 'umumiy kalit ✓', rang: 'insight' },
      ],
    },
    {
      qisqa: 'Shifr', nishon: 'tushuncha',
      sarlavha: 'Tashqaridan — faqat “Application Data”',
      matn: [
        `Paketlar jadvalida server paketi: “${sh.info.split(', ').slice(0, 3).join(', ')}…”. Kuzatuvchi faqat shuni ko‘radi — yozuvlar soni va hajmi, xolos.`,
        `Ichida esa: **${shXabarlar.slice(1).join(', ')}**. Inspektorda **“Kalit bilan ochish”**ni yoqing — laboratoriya kaliti bilan shu yozuvlar ochiladi.`,
      ],
      callout: { tur: 'goya', matn: 'TLS 1.2 da sertifikat ochiq ketardi. TLS 1.3 da ServerHello’dan keyingi hamma xabar shifrlangan — kuzatuvchi sertifikatni ham ko‘rmaydi.' },
      faktlar: shXabarlar.slice(1).map((x, i) => [`${i + 1}-yozuv`, x]),
      korinadi: ['klient', 'router', 'veb'],
      kamera: ['klient', 'router', 'veb'],
      hodisalar: [
        { tur: 'teg', tugun: 'klient', matn: null },
        { tur: 'teg', tugun: 'veb', matn: null },
        { tur: 'teg', tugun: 'router', matn: 'faqat hajm ko‘rinadi', rang: 'ogoh' },
      ],
    },
    {
      qisqa: 'Sertifikat', nishon: 'tushuncha',
      sarlavha: 'Sertifikat zanjiri: kimga ishonamiz',
      matn: [
        `Server ${sertSoni} ta sertifikat yubordi: **${sayt.subject}** (uni **${sayt.issuer}** imzolagan) va **${oraliq.subject}** (uni **${oraliq.issuer}** imzolagan). Ildiz CA yuborilmadi — u klientda bor (bu yozuvda \`--cacert\`, brauzerda — tizimning ishonchli ro‘yxati).`,
        `Klient tekshiradi: har imzo yuqoridagi CA kaliti bilan to‘g‘ri, muddat o‘tmagan (${sayt.subject} ${sayt.gacha} gacha), nom mos (SAN: **${san}**), oraliqda “CA” belgisi bor. Keyin **CertificateVerify**: server butun kelishuvni sertifikatdagi kalit bilan imzolagan — “bu sertifikat haqiqatan meniki”.`,
      ],
      callout: { tur: 'ogoh', matn: 'Bitta tekshiruv o‘tmasa (muddat, nom, noma’lum CA), klient ulanishni uzadi — brauzer ogohlantirish sahifasini ko‘rsatadi (Web asoslari, 26-bob).' },
      faktlar: [['Sayt', `${sayt.subject} ← ${sayt.issuer}`], ['Oraliq', `${oraliq.subject} ← ${oraliq.issuer}`], ['Nom (SAN)', san], ['Muddat', `${sayt.gacha} gacha`]],
      korinadi: ['klient', 'router', 'veb'],
      kamera: ['klient', 'router', 'veb'],
      kartalar: [{
        sarlavha: 'Yozuvdan: zanjir',
        qatorlar: [
          [sayt.subject, `← ${sayt.issuer}`],
          [oraliq.subject, `← ${oraliq.issuer}`],
          [oraliq.issuer, 'klientda (ildiz)', true],
        ],
        joy: 'yuqori-chap',
        izoh: 'Certificate xabaridan, kalit bilan ochilgan',
      }],
      hodisalar: [
        { tur: 'teg', tugun: 'router', matn: null },
        { tur: 'teg', tugun: 'klient', matn: 'sertifikat tekshirildi ✓', rang: 'ok' },
      ],
    },
    {
      qisqa: 'So‘rov', nishon: 'texnika',
      sarlavha: 'Klient Finished — va darhol GET',
      matn: [
        `Klient **Finished** yubordi: butun kelishuv ustidan hisoblangan qiymat. Yo‘lda bitta bayt o‘zgargan bo‘lsa, u mos kelmasdi. Server Finished’ni o‘zi avvalroq yuborgan edi.`,
        `Kelishuv tugadi va shu zahoti **GET /** ketdi — u ham shifrlangan. TLS 1.3 kelishuvi bitta borib-kelish oldi: so‘rov ClientHello’dan ${ms(ch, get)} keyin yuborildi.`,
      ],
      callout: { tur: 'maslahat', matn: 'GET paketini oching va “Kalit bilan ochish”ni yoqing: ichida xuddi HTTP/1.1 darsidagi so‘rov — `Host: sayt.test` va boshqalar. TLS HTTP’ni o‘zgartirmaydi, faqat o‘rab oladi.' },
      faktlar: [['Finished', `${fin.n}-paket`], ['So‘rov', `${get.n}-paket (shifrlangan)`], ['CH → GET', ms(ch, get)]],
      korinadi: ['klient', 'router', 'veb'],
      kamera: ['klient', 'router', 'veb'],
      kartalar: [],
      hodisalar: [
        { tur: 'teg', tugun: 'klient', matn: null },
        pk(fin, 'FINISHED', ['kelishuv tugadi'], 'sorov'),
        pk(get, 'GET / (shifrlangan)', ['Host: sayt.test'], 'sorov'),
        { tur: 'teg', tugun: 'veb', matn: 'shifrlangan kanal ✓', rang: 'ok' },
      ],
    },
    {
      qisqa: 'Javob', nishon: 'texnika',
      sarlavha: 'Javob: chiptalar va sahifa',
      matn: [
        `Server avval ${ticket.length} ta **NewSessionTicket** yubordi: keyingi safar to‘liq kelishuvsiz qayta ulanish uchun chipta. Keyin **200 OK** — bitta TLS yozuvi ${tanaBolaklar.length} ta TCP segmentiga bo‘lingan.`,
        `Yozuv oxirgi bo‘lagi (${ok.n}-paket) kelgandagina ochiladi: TLS yozuvni butunligicha tekshiradi. Oxirida **close_notify** — “yuborishni tugatdim”, keyin TCP yopiladi.`,
      ],
      callout: { tur: 'goya', matn: 'Bitta yozuv bo‘laklarga bo‘linsa, tshark ham uni faqat oxirgi bo‘lakda ochadi: inspektorda oldingi bo‘laklar “TLS segment data” bo‘lib qoladi.' },
      faktlar: [['Chiptalar', `${ticket.length} ta NewSessionTicket`], ['Javob', `${tanaBolaklar.length} segment, ${ok.n}-paketda ochiladi`], ['Yopish', 'close_notify + FIN']],
      korinadi: ['klient', 'router', 'veb'],
      kamera: ['klient', 'router', 'veb'],
      hodisalar: [
        { tur: 'teg', tugun: 'veb', matn: null },
        ...ticket.map((t) => pk(t, 'NEW SESSION TICKET', ['qayta ulanish chiptasi'], 'javob')),
        pk(ok, '200 OK (shifrlangan)', [`${tanaBolaklar.length} segmentdagi yozuv`], 'javob'),
        pk(yopish, 'CLOSE NOTIFY', [], 'sorov'),
        { tur: 'teg', tugun: 'klient', matn: 'sahifa keldi ✓', rang: 'ok' },
      ],
    },
    {
      qisqa: 'Xulosa', nishon: 'xulosa',
      sarlavha: 'HTTPS uchun vaqt qayerga ketdi',
      matn: [
        `Ochiq HTTP’da so‘rov TCP kelishuvidan keyin darhol ketardi. HTTPS’da orada TLS kelishuvi — yana bitta borib-kelish (${ms(ch, sh)}). Shuning uchun birinchi bayt kelguncha **ikki** borib-kelish emas, **uch**.`,
        'Evaziga: kuzatuvchi sayt nomini (SNI) va hajmlarni ko‘radi, lekin so‘rov, sarlavhalar, cookie va sahifa mazmuni yashirin va o‘zgartirib bo‘lmaydi.',
      ],
      callout: { tur: 'goya', matn: 'O‘zingiz ko‘ring: `curl -v https://example.com` — TLS kelishuvi qatorlari, yoki `openssl s_client -connect example.com:443 -brief` (Web asoslari, 25-bob).' },
      korinadi: ['klient', 'router', 'veb'],
      kamera: ['klient', 'router', 'veb'],
      kartalar: [{
        sarlavha: 'Yozuvdan: vaqt',
        qatorlar: [
          ['TCP kelishuvi', ms(syn, ack)],
          ['ClientHello → ServerHello', ms(ch, sh)],
          ['GET → javob boshi', ms(get, javobBosh)],
          ['SYN → 200 OK', ms(syn, ok), true],
        ],
        joy: 'yuqori-chap',
        izoh: 'klient tomonida o‘lchangan',
      }],
      hodisalar: [{ tur: 'teg', tugun: 'klient', matn: null }],
    },
  ],
}
