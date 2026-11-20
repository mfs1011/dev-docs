// "HTTP/3" — Paket yo'li darsi. Paketlar VPS laboratoriyasidagi haqiqiy yozuvdan: headless Chromium (paket-lab/brauzer)
// https://sayt.test/h3.html ni QUIC (UDP 443) orqali ochadi, sahifa uslub va skriptni chaqiradi (paket-lab/ssenariy/http3.sh;
// nginx `listen 443 quic`). Laboratoriya CA'si uchun Chromium'ga QUIC majburlangan (--origin-to-force-quic-on,
// --ignore-certificate-errors-spki-list — Chromium hujjati "Playing with QUIC"). Shifrlangan qism — "ochiq" daraxt
// (Chromium'ning SSLKEYLOGFILE kaliti bilan). Qiymatlar yozuvdan hisoblanadi.
// docs/vizualizator/paket-yoli.md 4.1 (⚑ HTTP/3)
import yozuv from '../paket/yozuvlar/http3.json'

const P = yozuv.paketlar
const VEB = '203.0.113.10'
const ochiqInfo = (p) => p.ochiq?.info ?? p.info
const daraxt = (p) => (p.ochiq ?? p).qatlamlar
const maydonlar = (p, k, q = daraxt(p)) => {
  const r = []
  const yur = (f) => { if (f.k === k) r.push(f.s); (f.m ?? []).forEach(yur) }
  q.forEach(yur)
  return r
}
const qiymat = (s) => s.slice(s.indexOf(':') + 1).trim()
const son = (s) => Number(String(s).match(/(\d+)\s*(?:\(|$)/)?.[1] ?? NaN)
const top = (re, dan = 0) => {
  const p = P.find((x) => x.n > dan && re.test(ochiqInfo(x)))
  if (!p) throw new Error(`http3: yozuvda topilmadi: ${re}`)
  return p
}

// ulanish: klientning Initial'lari (ClientHello bir nechta paketga bo'lingan), server javobi
const initKlient = P.filter((x) => x.src !== VEB && /^Initial, DCID/.test(x.info) && /CRYPTO/.test(x.info))
const chPaket = P.find((x) => maydonlar(x, 'tls.handshake.type', x.qatlamlar).some((s) => /Client Hello/.test(s)))
const sni = qiymat(maydonlar(chPaket, 'tls.handshake.extensions_server_name', chPaket.qatlamlar)[0])
const alpnTaklif = maydonlar(chPaket, 'tls.handshake.extensions_alpn_str', chPaket.qatlamlar).map(qiymat)
const guruh = qiymat(maydonlar(P.find((x) => maydonlar(x, 'tls.handshake.type').some((s) => /Server Hello/.test(s))), 'tls.handshake.extensions_key_share_group')[0]).replace(/\s*\(\d+\)$/, '')
const chHajm = son(P.flatMap((x) => maydonlar(x, 'quic.crypto.fragments', x.qatlamlar))[0]?.match(/\((\d+) bytes\)/)?.[1])
const udpUzunlik = son(maydonlar(initKlient[0], 'udp.length', initKlient[0].qatlamlar)[0])
const birinchiJavob = P.find((x) => x.src === VEB)
const shPaketlar = P.filter((x) => x.src === VEB && /^(Initial|Handshake), SCID/.test(x.info))
const eeAlpn = qiymat(P.flatMap((x) => maydonlar(x, 'tls.handshake.extensions_alpn_str').filter(() => x.src === VEB))[0] ?? ': —')
const finished = P.find((x) => x.src !== VEB && /^Handshake, DCID/.test(x.info))

// HTTP/3: boshqaruv oqimlari va so'rovlar
const nazorat = top(/^SETTINGS$/)
const sozlamalar = maydonlar(nazorat, 'http3.settings').map((s) => s.replace(/^Settings - /, '')).filter((s) => !/GREASE/.test(s))
const sorovlar = P.filter((x) => /HEADERS: GET /.test(ochiqInfo(x))).map((p) => {
  const oqimlar = maydonlar(p, 'quic.stream.stream_id').map(son)
  const kadrlar = maydonlar(p, 'http3.frame').filter((s) => /^HEADERS/.test(s))
  return {
    p,
    yol: maydonlar(p, 'http3.headers.path')[0].replace(/^:path:\s*/, ''),
    oqim: oqimlar.filter((n) => n % 4 === 0).at(-1),
    hajm: son(kadrlar[0]?.match(/len=(\d+)/)?.[1]),
    soni: son(maydonlar(p, 'http3.headers.count')[0]),
    ochilgan: son(maydonlar(p, 'http3.headers.decoded_length')[0]),
  }
})
const javoblar = P.filter((x) => x.src === VEB && /HEADERS: \d{3}/.test(ochiqInfo(x))).map((p) => ({
  p,
  oqim: maydonlar(p, 'quic.stream.stream_id').map(son).filter((n) => n % 4 === 0).at(-1),
  kod: ochiqInfo(p).match(/HEADERS: (\d{3} [^,]+)/)[1],
}))
const encoder = P.find((x) => /QPACK ENC/.test(ochiqInfo(x)))
const encOqim = ochiqInfo(encoder).match(/STREAM\((\d+)\), QPACK ENC/)?.[1]
const birOqimlar = [...new Set(P.flatMap((x) => maydonlar(x, 'quic.stream.stream_id').map(son)).filter((n) => n % 2 === 0 && n % 4 === 2))].sort((a, b) => a - b)
const tcpBormi = P.some((x) => / \[SYN\]/.test(x.info))
const ms = (a, b) => `${Math.round((b.t - a.t) * 1000)} ms`
const [s1, s2] = sorovlar

const pk = (p, yorliq, qatorlar, rang, qoshimcha = {}) => {
  const [dan, ga] = p.src === VEB ? ['veb', 'brauzer'] : ['brauzer', 'veb']
  return { tur: 'paket', n: p.n, yorliq, qatorlar, rang, dan, ga, ...qoshimcha }
}
const KORINADI = ['brauzer', 'router', 'veb']

export default {
  id: 'http3',
  tur: 'paket',
  sarlavha: 'HTTP/3 (QUIC)',
  shior: 'TCP yo‘q: UDP ustida QUIC — ulanish va TLS bitta kelishuvda, har so‘rov o‘z oqimida.',
  daraja: 'o‘rta',
  daqiqa: 9,
  yozuv,
  yozuvNuqta: 'Brauzer tomonida yozilgan (uy tarmog‘i)',
  kitob: [
    { yol: '/web-asoslari/13-http-versiyalari', nom: 'Web asoslari, 13: HTTP/1.1, HTTP/2 va HTTP/3' },
  ],
  manba: [
    { nom: 'RFC 9000 — QUIC', url: 'https://www.rfc-editor.org/rfc/rfc9000' },
    { nom: 'RFC 9001 — QUIC va TLS', url: 'https://www.rfc-editor.org/rfc/rfc9001' },
    { nom: 'RFC 9114 — HTTP/3', url: 'https://www.rfc-editor.org/rfc/rfc9114' },
    { nom: 'RFC 9204 — QPACK', url: 'https://www.rfc-editor.org/rfc/rfc9204' },
    { nom: 'Chromium — Playing with QUIC', url: 'https://www.chromium.org/quic/playing-with-quic/' },
    { nom: 'nginx — ngx_http_v3_module', url: 'https://nginx.org/en/docs/http/ngx_http_v3_module.html' },
  ],
  sinov: `Yozuv: VPS laboratoriyasi (paket-lab/), haqiqiy headless Chromium (192.168.1.20) \`https://sayt.test/h3.html\` ni ochdi; nginx’da \`listen 443 quic\`. Laboratoriya CA’si uchun Chromium’ga QUIC buyruq bilan majburlandi (\`--origin-to-force-quic-on\`, leaf sertifikat SPKI’si bilan \`--ignore-certificate-errors-spki-list\` — Chromium hujjati shunday talab qiladi). Haqiqiy saytda brauzer HTTP/3 ni \`Alt-Svc\` sarlavhasidan bilib oladi. Shifrlangan qism Chromium’ning \`SSLKEYLOGFILE\` kaliti bilan ochilgan. Router ikki tomonga 10 ms kechikish qo‘shadi. ${yozuv.versiyalar.filter((v) => /^(sana|Chromium|nginx version|TShark)/.test(v)).map((v) => v.replace(/ built on.*$/, '')).join(' · ')}`,
  trenajor: { yol: '/web-asoslari/trenajor', nom: 'HTTP laboratoriyasida o‘zingiz yuboring' },
  protokol: {
    izoh: 'QUIC — UDP ustidagi transport: ulanish, oqimlar, qayta yuborish va TLS 1.3 bitta protokolda. HTTP/3 — uning ustidagi HTTP: har so‘rov alohida oqimda, sarlavhalar QPACK bilan siqiladi.',
    faktlar: [['Transport', 'QUIC (UDP 443)'], ['Shifr', 'TLS 1.3 QUIC ichida'], ['ALPN', 'h3'], ['Standart', 'RFC 9000, 9001, 9114, 9204']],
  },
  organasiz: [
    { matn: 'Nega TCP kelishuvi yo‘q', qadam: 1 },
    { matn: 'QUIC’da nima ochiq, nima shifrlangan', qadam: 2 },
    { matn: 'So‘rovlar qaysi oqimlarda ketadi', qadam: 4 },
  ],
  afsona: [{ k: 'sorov', nom: 'so‘rov' }, { k: 'javob', nom: 'javob' }, { k: 'ulanish', nom: 'QUIC kelishuvi' }],
  ishtirokchilar: ['brauzer', 'veb'],
  tugunlar: {
    brauzer: { ikonka: 'noutbuk', nom: 'Brauzer', izoh: 'Chromium · 192.168.1.20', x: 130, y: 330 },
    router: { ikonka: 'router', nom: 'Router', izoh: '192.168.1.1', x: 420, y: 330 },
    veb: { ikonka: 'server', nom: 'Veb-server', izoh: 'sayt.test · UDP 443', x: 740, y: 330 },
  },
  chiziqlar: [['brauzer', 'router'], ['router', 'veb']],
  yollar: {
    'brauzer>veb': ['brauzer', 'router', 'veb'], 'veb>brauzer': ['veb', 'router', 'brauzer'],
  },
  qadamlar: [
    {
      qisqa: 'UDP', nishon: 'sozlash',
      sarlavha: 'Birinchi paket — SYN emas, QUIC Initial',
      matn: [
        `${tcpBormi ? 'Yozuvda TCP ham bor.' : '**Yozuvda birorta TCP paketi yo‘q.**'} Brauzer darhol UDP 443 ga **QUIC Initial** paketini yubordi — ichida TLS ClientHello. Uch qadamli TCP kelishuvi kerak emas: ulanishni QUIC o‘zi o‘rnatadi.`,
        `ClientHello ${chHajm ? `${chHajm} bayt — ` : ''}${initKlient.length} ta Initial paketiga bo‘lindi${guruh ? ` (kalit ulushlari orasida \`${guruh}\` ham bor)` : ''}. Har biri ${udpUzunlik - 8} bayt: klientning Initial datagrammasi kamida 1200 bayt bo‘lishi shart, kami PADDING bilan to‘ldiriladi (RFC 9000, 14.1).`,
      ],
      callout: { tur: 'maslahat', matn: 'Birinchi paketni oching: `QUIC IETF` qatlami — `Packet Type: Initial`, `Version: 1`, ulanish ID’si (DCID), ichida CRYPTO kadrlari.' },
      faktlar: [['Transport', 'UDP 443'], ['Birinchi paket', 'QUIC Initial'], ['ClientHello', `${initKlient.length} paketda`], ['TCP', tcpBormi ? 'bor' : 'yo‘q']],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: initKlient.map((p, i) => pk(p, `INITIAL ${i + 1}/${initKlient.length}`, ['ClientHello', `${udpUzunlik - 8} B`], 'ulanish', i ? { ms: 600 } : {})),
    },
    {
      qisqa: 'Ochiq', nishon: 'tushuncha',
      sarlavha: 'Initial — shifrlangan, lekin maxfiy emas',
      matn: [
        `Initial paketlari shifrlangan, ammo kaliti klientning DCID’sidan standartdagi doimiy “tuz” bilan hisoblanadi — uni har kim hisoblay oladi. RFC 9001 (5.2, 5): Initial paketlarida maxfiylik yo‘q. Shuning uchun tshark ularni kalitsiz ochdi: **SNI \`${sni}\`**, **ALPN \`${alpnTaklif.join(', ')}\`**.`,
        `Server javobi ${ms(initKlient[0], birinchiJavob)} da keldi: ServerHello (Initial’da) va **Handshake** paketlari — ular endi kelishilgan kalit bilan shifrlangan. Ichida EncryptedExtensions (\`ALPN: ${eeAlpn}\`), sertifikat va Finished — “Kalit bilan ochish” bilan ko‘rinadi.`,
      ],
      callout: { tur: 'goya', matn: 'TCP+TLS’dagidek: kuzatuvchi sayt nomini (SNI) ko‘radi, mazmunni — yo‘q (13-dars). QUIC’da hatto TCP sarlavhasidagi kabi tasdiq raqamlari ham shifrlangan.' },
      faktlar: [['SNI', sni], ['ALPN', alpnTaklif.join(', ')], ['Guruh', guruh], ['Javob', ms(initKlient[0], birinchiJavob)]],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        ...shPaketlar.map((p, i) => pk(p, ochiqInfo(p).startsWith('Initial') ? (/CRYPTO/.test(p.info) ? 'INITIAL · SERVER HELLO' : 'INITIAL · ACK') : 'HANDSHAKE', [ochiqInfo(p).startsWith('Initial') ? 'ochiq' : 'shifrlangan'], 'ulanish', i ? { ms: 500 } : {})),
        { tur: 'teg', tugun: 'router', matn: `ko‘radi: ${sni}`, rang: 'ogoh' },
      ],
    },
    {
      qisqa: 'Bitta RTT', nishon: 'texnika',
      sarlavha: 'Ulanish va TLS — bitta borib-kelishda',
      matn: [
        `Brauzer o‘z Finished’ini yubordi (${ms(initKlient[0], finished)}) va darhol HTTP/3 boshladi. TCP+TLS’da avval TCP kelishuvi (bir borib-kelish), keyin TLS (yana bir) edi; QUIC’da transport va TLS kelishuvi **birlashgan** — bitta borib-kelish (RFC 9000, 7).`,
        'Shundan keyin hamma paket — qisqa sarlavhali (Short Header), “Protected Payload”: kalitsiz faqat ulanish ID’si va hajm ko‘rinadi.',
      ],
      callout: { tur: 'maslahat', matn: '4-dars (TLS 1.3) bilan solishtiring: u yerda TLS’dan oldin SYN, SYN-ACK, ACK bor edi. Bu yerda birinchi paketning o‘zi ClientHello.' },
      faktlar: [['Server javobi', ms(initKlient[0], birinchiJavob)], ['Klient Finished', ms(initKlient[0], finished)], ['Birinchi so‘rov', ms(initKlient[0], s1.p)]],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        { tur: 'teg', tugun: 'router', matn: null },
        pk(finished, 'HANDSHAKE', ['Finished'], 'ulanish'),
        { tur: 'teg', tugun: 'brauzer', matn: 'QUIC ulanish tayyor', rang: 'ok' },
      ],
    },
    {
      qisqa: 'Oqimlar', nishon: 'texnika',
      sarlavha: 'Oqimlar: so‘rovlar 0, 4, 8…',
      matn: [
        `Avval har tomon **boshqaruv oqimini** ochib, SETTINGS yubordi (brauzerniki: ${sozlamalar.join('; ')}). Keyin so‘rovlar: ${sorovlar.map((s) => `**oqim ${s.oqim}** — \`${s.yol}\``).join(', ')}.`,
        `RFC 9114 (6.1): “birinchi so‘rov QUIC oqimi 0 da, keyingilari 4, 8 va hokazo”. Raqamning pastki ikki biti — kim ochgan va yo‘nalish (RFC 9000, 2.1). Klientning bir yo‘nalishli oqimlari — ${birOqimlar.join(', ')}: boshqaruv va QPACK.`,
      ],
      callout: { tur: 'goya', matn: 'HTTP/2’da oqimlar bitta TCP ichida edi: bitta segment yo‘qolsa, hammasi kutardi. QUIC’da oqimlar transportning o‘zida — yo‘qolgan paket faqat o‘z oqimini ushlaydi (Web asoslari, 13-bob).' },
      faktlar: sorovlar.map((s) => [`oqim ${s.oqim}`, s.yol]),
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        { tur: 'teg', tugun: 'brauzer', matn: null },
        pk(nazorat, 'SETTINGS', ['boshqaruv oqimi'], 'ulanish'),
        ...sorovlar.map((s, i) => pk(s.p, `HEADERS · OQIM ${s.oqim}`, [`GET ${s.yol}`], 'sorov', i ? { ms: 600 } : {})),
      ],
    },
    {
      qisqa: 'QPACK', nishon: 'tushuncha',
      sarlavha: `QPACK: ${s1.hajm} baytdan ${s2?.hajm} baytgacha`,
      matn: [
        `Birinchi so‘rovning HEADERS kadri **${s1.hajm} bayt** (${s1.soni} ta sarlavha, ochilganda ${s1.ochilgan} bayt). Keyingilari — **${sorovlar.slice(1).map((s) => `${s.hajm}`).join(', ')} bayt**.`,
        `Sabab — QPACK dinamik jadvali. Brauzer sarlavhalarni (user-agent, sec-ch-ua…) **alohida enkoder oqimida** (oqim ${encOqim ?? '—'}) jadvalga yozdi, so‘rov esa ularga raqam bilan murojaat qildi. HPACK’dan farqi shu: jadval yangilanishi so‘rov oqimiga aralashmaydi (RFC 9204, 4.2).`,
      ],
      callout: { tur: 'maslahat', matn: 'Ikkinchi so‘rov paketini kalit bilan oching: `QPACK encoder stream` ichida `INSERT` buyruqlari — jadvalga qo‘shilgan sarlavhalar.' },
      faktlar: [['1-so‘rov HEADERS', `${s1.hajm} B`], ...sorovlar.slice(1).map((s) => [`${s.yol}`, `${s.hajm} B`])],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        { tur: 'teg', tugun: 'brauzer', matn: `${s1.hajm} B → ${s2?.hajm} B`, rang: 'insight' },
      ],
    },
    {
      qisqa: 'Javoblar', nishon: 'texnika',
      sarlavha: 'Javoblar o‘z oqimida',
      matn: [
        `Server har so‘rovga o‘sha oqimda javob berdi: ${javoblar.map((j) => `oqim ${j.oqim} — **${j.kod}**`).join(', ')}. HEADERS va DATA kadrlarida oqim raqami yo‘q — u QUIC STREAM kadrida.`,
        `${javoblar.some((j) => /404/.test(j.kod)) ? '`/favicon.ico` ni sahifa so‘ramagan — brauzer o‘zi so‘radi, nginx’da bu fayl yo‘q (404). ' : ''}Skript sahifa sarlavhasini o‘zgartirdi — demak u ham kelib, ishga tushdi (brauzer jurnali).`,
      ],
      callout: { tur: 'goya', matn: 'QUIC oqim boshqaruvi (flow control) va qayta yuborishni o‘zi qiladi — TCP’dagi ACK’lar o‘rnida shifrlangan ACK kadrlari.' },
      faktlar: javoblar.map((j) => [`oqim ${j.oqim}`, j.kod]),
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        { tur: 'teg', tugun: 'brauzer', matn: null },
        ...javoblar.map((j, i) => pk(j.p, `OQIM ${j.oqim}`, [j.kod], 'javob', i ? { ms: 600 } : {})),
      ],
    },
    {
      qisqa: 'Xulosa', nishon: 'xulosa',
      sarlavha: 'HTTP/3: o‘sha HTTP, boshqa transport',
      matn: [
        'Metod, sarlavha, kod — o‘sha HTTP. O‘zgargan — ostidagi qatlam: TCP o‘rnida UDP ustidagi QUIC, TLS uning ichida, oqimlar transportda.',
        'Haqiqiy saytda brauzer avval HTTP/1.1 yoki HTTP/2 bilan kelib, javobdagi `Alt-Svc: h3=":443"` dan HTTP/3 borligini bilib oladi (RFC 9114, 3.1.1). UDP to‘silgan bo‘lsa, brauzer TCP versiyasiga qaytishi kerak (3.1).',
      ],
      callout: { tur: 'ogoh', matn: 'Server tomonida UDP 443 ochiq bo‘lishi kerak — xavfsizlik devori faqat TCP 443 ni ochsa, HTTP/3 ishlamaydi va brauzer HTTP/2 ga qaytadi (Web asoslari, 13-bob).' },
      korinadi: KORINADI,
      kamera: KORINADI,
      kartalar: [{
        sarlavha: 'Yozuvdan',
        qatorlar: [
          ['TCP paketlari', tcpBormi ? 'bor' : '0'],
          ['Initial → server', ms(initKlient[0], birinchiJavob)],
          ['oqimlar', sorovlar.map((s) => s.oqim).join(' · ')],
          ['HEADERS', `${sorovlar.map((s) => s.hajm).join(' · ')} B`, true],
          ['kalitsiz ko‘rinadi', `SNI ${sni}`],
        ],
        joy: 'yuqori-chap',
        izoh: 'brauzer tomonida o‘lchangan',
      }],
      hodisalar: [{ tur: 'teg', tugun: 'brauzer', matn: null }],
    },
  ],
}
