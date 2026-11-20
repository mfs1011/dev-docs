// "HTTP/2" — Paket yo'li darsi. Paketlar VPS laboratoriyasidagi haqiqiy yozuvdan (paket-lab/ssenariy/http2.sh: curl --http2 -Z,
// bitta ulanishda uch fayl; nginx `http2 on`). HTTP/2 kadrlari TLS ichida — ularni ko'rsatish uchun "ochiq" daraxt
// (shu yozuvning kalitlar jurnali bilan tshark ochgan). Qiymatlar (sozlamalar, oqimlar, HPACK hajmlari, vaqtlar) yozuvdan.
// docs/vizualizator/paket-yoli.md 4.1 (9-dars)
import yozuv from '../paket/yozuvlar/http2.json'

const P = yozuv.paketlar
const VEB = '203.0.113.10'
const ochiqInfo = (p) => p.ochiq?.info ?? p.info
const top = (re, dan = 0) => {
  const p = P.find((x) => x.n > dan && re.test(ochiqInfo(x)))
  if (!p) throw new Error(`http2: yozuvda topilmadi: ${re}`)
  return p
}
// maydonlar: ochiq daraxtdan (bo'lmasa oddiy), tartib bilan
const maydonlar = (p, k) => {
  const r = []
  const yur = (f) => { if (f.k === k) r.push(f.s); (f.m ?? []).forEach(yur) }
  ;(p.ochiq?.qatlamlar ?? p.qatlamlar).forEach(yur)
  return r
}
const son = (s) => Number(s.match(/(\d+)\s*$/)[1])
const qiymat = (s) => s.slice(s.indexOf(':') + 1).trim()

const syn = top(/ → 443 \[SYN\]/)
const synack = top(/\[SYN, ACK\]/)
const ch = top(/Client Hello/)
const sh = top(/Server Hello/)
const cfin = top(/^Change Cipher Spec, Finished/, sh.n)
const muqaddima = top(/^Magic, SETTINGS/)
const sorovlar = P.filter((x) => /HEADERS\[\d+\]: GET /.test(ochiqInfo(x)))
const srvSettings = top(/^SETTINGS\[0\], WINDOW_UPDATE/, muqaddima.n)
const cliAck = top(/^SETTINGS\[0\]$/, srvSettings.n)
const javob1 = top(/HEADERS\[1\]: 200/)
const data1 = top(/DATA\[1\]/)
const javoblar = P.filter((x) => x.src === VEB && /HEADERS\[(3|5)\]: 200/.test(ochiqInfo(x)))
const oxirgi = javoblar.at(-1)
const fin = top(/ → 443 \[FIN, ACK\]/)
const data1Segment = P.filter((x) => x.src === VEB && x.n > javob1.n && x.n <= data1.n && !/\[ACK\] Seq=\d+ Ack=\d+ Win=\d+ Len=0/.test(x.info))

// ALPN: klient taklifi ochiq ClientHello'da, server tanlovi — shifrlangan EncryptedExtensions'da
const alpnTaklif = maydonlar(ch, 'tls.handshake.extensions_alpn_str').map(qiymat)
const alpnTanlov = maydonlar(sh, 'tls.handshake.extensions_alpn_str').map(qiymat)[0]

// sozlamalar: [nom, qiymat] — tshark yozuvidagi "Settings - Max concurrent streams : 100"
const sozlamalar = (p) => maydonlar(p, 'http2.settings').map((s) => s.replace(/^Settings - /, '').split(' : '))
const sozKlient = sozlamalar(muqaddima)
const sozServer = sozlamalar(srvSettings)
const SOZ_NOM = { 'Max concurrent streams': 'parallel oqimlar', 'Initial Windows size': 'boshlang‘ich oyna', 'Enable PUSH': 'server push', 'Max frame size': 'eng katta kadr' }
const sozQator = (s) => s.map(([k, v]) => `${SOZ_NOM[k] ?? k}: ${Number(v).toLocaleString('en-US').replace(/,/g, ' ')}`)

// har so'rov: oqim raqami, yo'l, HPACK bloki hajmi, sarlavhalar (ochilgan), dinamik jadvaldan olinganlar
const sorov = sorovlar.map((p) => {
  const oqim = son(maydonlar(p, 'http2.streamid')[0])
  const blok = son(maydonlar(p, 'http2.length')[0])
  const sarlavhalar = maydonlar(p, 'http2.header').map((s) => s.replace(/^Header: /, ''))
  const indekslar = maydonlar(p, 'http2.header.index').map(son)
  return { p, oqim, yol: maydonlar(p, 'http2.headers.path')[0].replace(/^:path:\s*/, ''), blok, sarlavhalar, dinamik: indekslar.filter((i) => i > 61).length }
})
// xuddi shu sarlavhalar HTTP/1.1 matnida qancha bo'lardi: "GET / HTTP/1.1", Host, qolganlari, bo'sh qator
const h1Hajm = (sarlavhalar) => {
  const ol = (n) => sarlavhalar.find((s) => s.startsWith(`${n}: `))?.slice(n.length + 2)
  const qatorlar = [`${ol(':method')} ${ol(':path')} HTTP/1.1`, `Host: ${ol(':authority')}`, ...sarlavhalar.filter((s) => !s.startsWith(':'))]
  return qatorlar.reduce((s, q) => s + q.length + 2, 0) + 2
}
const h1 = h1Hajm(sorov[0].sarlavhalar)

const ms = (a, b) => `${Math.round((b.t - a.t) * 1000)} ms`
const synlar = P.filter((x) => / → 443 \[SYN\]/.test(x.info)).length

const pk = (p, yorliq, qatorlar, rang, qoshimcha = {}) => {
  const [dan, ga] = p.src === VEB ? ['veb', 'klient'] : ['klient', 'veb']
  return { tur: 'paket', n: p.n, yorliq, qatorlar, rang, dan, ga, ...qoshimcha }
}
const KORINADI = ['klient', 'router', 'veb']

export default {
  id: 'http2',
  tur: 'paket',
  sarlavha: 'HTTP/2',
  shior: 'Bitta ulanish, uch fayl: so‘rovlar oqimlarga bo‘linadi va birga ketadi.',
  daraja: 'o‘rta',
  daqiqa: 8,
  yozuv,
  kitob: [
    { yol: '/web-asoslari/13-http-versiyalari', nom: 'Web asoslari, 13: HTTP/1.1, HTTP/2 va HTTP/3' },
  ],
  manba: [
    { nom: 'RFC 9113 — HTTP/2', url: 'https://www.rfc-editor.org/rfc/rfc9113' },
    { nom: 'RFC 9113 — 3.2 ALPN “h2”', url: 'https://www.rfc-editor.org/rfc/rfc9113#section-3.2' },
    { nom: 'RFC 9113 — 3.4 Muqaddima', url: 'https://www.rfc-editor.org/rfc/rfc9113#section-3.4' },
    { nom: 'RFC 9113 — 5.1.1 Oqim raqamlari', url: 'https://www.rfc-editor.org/rfc/rfc9113#section-5.1.1' },
    { nom: 'RFC 9113 — 6.5 SETTINGS', url: 'https://www.rfc-editor.org/rfc/rfc9113#section-6.5' },
    { nom: 'RFC 7541 — HPACK', url: 'https://www.rfc-editor.org/rfc/rfc7541' },
    { nom: 'nginx — ngx_http_v2_module', url: 'https://nginx.org/en/docs/http/ngx_http_v2_module.html' },
  ],
  sinov: `Yozuv: VPS laboratoriyasi (paket-lab/), \`curl --http2 -Z\` — uch URL parallel (\`/\`, \`/uslub.css\`, \`/ilova.js\`); nginx’da \`http2 on\`, TLS 1.3 sinov sertifikati. HTTP/2 kadrlari shifrlangan — ularni curl’ning \`SSLKEYLOGFILE\` kalitlari bilan ochilgan holda ko‘rasiz. Router ikki tomonga 10 ms kechikish qo‘shadi. ${yozuv.versiyalar.filter((v) => /^(sana|curl|nginx version|TShark)/.test(v)).map((v) => v.replace(/ \(x86.*$/, '')).join(' · ')}`,
  trenajor: { yol: '/web-asoslari/trenajor', nom: 'HTTP laboratoriyasida o‘zingiz yuboring' },
  protokol: {
    izoh: 'HTTP/2 — o‘sha HTTP (metod, sarlavha, kod), lekin simda matn emas, ikkilik kadrlar. Har so‘rov — alohida oqim; bitta ulanishda ko‘p oqim birga ketadi. Sarlavhalar HPACK bilan siqiladi.',
    faktlar: [['Kelishuv', 'TLS ALPN: h2'], ['Birlik', 'kadr (frame), oqim (stream)'], ['Siqish', 'HPACK'], ['Standart', 'RFC 9113, 7541']],
  },
  organasiz: [
    { matn: 'Klient va server HTTP/2 ga qanday kelishadi', qadam: 1 },
    { matn: 'Oqim nima va nega raqamlari toq', qadam: 3 },
    { matn: 'HPACK sarlavhalarni qanday qisqartiradi', qadam: 5 },
  ],
  afsona: [{ k: 'sorov', nom: 'so‘rov' }, { k: 'javob', nom: 'javob' }, { k: 'ulanish', nom: 'TLS va boshqaruv' }],
  ishtirokchilar: ['klient', 'veb'],
  tugunlar: {
    klient: { ikonka: 'noutbuk', nom: 'Klient', izoh: '192.168.1.10', x: 130, y: 330 },
    router: { ikonka: 'router', nom: 'Router', izoh: '192.168.1.1', x: 420, y: 330 },
    veb: { ikonka: 'server', nom: 'Veb-server', izoh: 'sayt.test · 443', x: 740, y: 330 },
  },
  chiziqlar: [['klient', 'router'], ['router', 'veb']],
  yollar: {
    'klient>veb': ['klient', 'router', 'veb'], 'veb>klient': ['veb', 'router', 'klient'],
  },
  qadamlar: [
    {
      qisqa: 'ALPN', nishon: 'sozlash',
      sarlavha: 'Kelishuv TLS ichida: ALPN',
      matn: [
        `TCP ulanishdan keyin klient ClientHello yubordi. Uning **ALPN** kengaytmasida (Application-Layer Protocol Negotiation) takliflar ro‘yxati: **${alpnTaklif.map((a) => `\`${a}\``).join(', ')}** — “HTTP/2 ni afzal ko‘raman, bo‘lmasa HTTP/1.1”.`,
        `Server **\`${alpnTanlov}\`** ni tanladi. Lekin TLS 1.3 da bu javob shifrlangan qismda (EncryptedExtensions) — tarmoqdagi kuzatuvchi uni ko‘rmaydi. Server javobini oching va “Kalit bilan ochish” ni yoqing.`,
      ],
      callout: { tur: 'maslahat', matn: 'RFC 9113, 3.2: https uchun HTTP/2 — TLS + ALPN, identifikatori `h2`. `h2c` (shifrsiz HTTP/2 nomi) TLS ichida yuborilmaydi.' },
      faktlar: [['Klient taklifi', alpnTaklif.join(', ')], ['Server tanlovi', alpnTanlov], ['SYN → SYN-ACK', ms(syn, synack)]],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        pk(ch, 'CLIENT HELLO', [`ALPN: ${alpnTaklif.join(', ')}`], 'ulanish'),
        pk(sh, 'SERVER HELLO …', [`ALPN: ${alpnTanlov} (shifrlangan)`], 'ulanish'),
        { tur: 'teg', tugun: 'veb', matn: alpnTanlov, rang: 'ok' },
      ],
    },
    {
      qisqa: 'Muqaddima', nishon: 'tushuncha',
      sarlavha: 'Muqaddima: “PRI * HTTP/2.0” va SETTINGS',
      matn: [
        'TLS tugagach klient birinchi bo‘lib **muqaddima** (connection preface) yubordi: 24 bayt `PRI * HTTP/2.0\\r\\n\\r\\nSM\\r\\n\\r\\n` va darhol **SETTINGS** kadri — “men shu shartlar bilan ishlayman”.',
        `Klient sozlamalari: ${sozQator(sozKlient).join('; ')}. Bularning hammasi **oqim 0** da — ulanishning o‘ziga tegishli kadrlar (RFC 9113, 3.4).`,
      ],
      callout: { tur: 'goya', matn: 'HTTP/1.1 da birinchi qator “GET / HTTP/1.1” edi. HTTP/2 da simda faqat ikkilik kadrlar: 9 baytli sarlavha (uzunlik, tur, bayroqlar, oqim raqami) va ma’lumot.' },
      faktlar: [['Muqaddima', '24 B'], ...sozKlient.map(([k, v]) => [SOZ_NOM[k] ?? k, v])],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        { tur: 'teg', tugun: 'veb', matn: null },
        pk(cfin, 'FINISHED', ['TLS tayyor'], 'ulanish'),
        pk(muqaddima, 'PRI * HTTP/2.0', ['SETTINGS', 'WINDOW_UPDATE'], 'ulanish'),
      ],
    },
    {
      qisqa: 'Oqimlar', nishon: 'texnika',
      sarlavha: 'Uch so‘rov — uch oqim',
      matn: [
        `Klient serverning SETTINGS’ini kutmadi — uch so‘rovni ketma-ket yubordi: ${sorov.map((s) => `**oqim ${s.oqim}** — \`GET ${s.yol}\``).join(', ')}. Har so‘rov — bitta HEADERS kadri; tanasi yo‘q, shuning uchun END_STREAM bayrog‘i ham shu kadrda.`,
        'Oqim raqamlari toq: klient ochgan oqimlar doim toq (1, 3, 5…), server ochganlari juft, 0 — ulanish uchun (RFC 9113, 5.1.1). Raqam faqat o‘sadi.',
      ],
      callout: { tur: 'maslahat', matn: 'RFC 9113, 3.4: klient muqaddimadan keyin serverni kutmasdan kadr yuborishi mumkin — shunda bir borib-kelish tejaladi.' },
      faktlar: sorov.map((s) => [`oqim ${s.oqim}`, `GET ${s.yol}`]),
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: sorov.map((s, i) => pk(s.p, `HEADERS · OQIM ${s.oqim}`, [`GET ${s.yol}`], 'sorov', i ? { ms: 700 } : {})),
    },
    {
      qisqa: 'SETTINGS', nishon: 'texnika',
      sarlavha: 'Server sozlamalari va ACK',
      matn: [
        `Server ham muqaddimasini yubordi — o‘z SETTINGS’i: ${sozQator(sozServer).join('; ')}. Har tomon qarshi tomon sozlamalarini **ACK** bayroqli bo‘sh SETTINGS bilan tasdiqlaydi (RFC 9113, 6.5).`,
        'Har SETTINGS dan keyin WINDOW_UPDATE ham bor: **oqim nazorati** — qabul qiluvchi “yana shuncha bayt yuborishing mumkin” deydi. Bu TCP’dagi oynaga o‘xshaydi, lekin HTTP/2 da u ham butun ulanish (oqim 0), ham har oqim uchun alohida (RFC 9113, 5.2).',
      ],
      callout: { tur: 'goya', matn: 'Bu yerda tomonlar turli qiymat aytdi: har sozlama “men qanday qabul qilaman” degani. Ikki tomonning sozlamalari bir xil bo‘lishi shart emas.' },
      faktlar: [['Server: parallel oqimlar', sozServer.find(([k]) => /concurrent/.test(k))?.[1] ?? '—'], ['Klient: parallel oqimlar', sozKlient.find(([k]) => /concurrent/.test(k))?.[1] ?? '—']],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        pk(srvSettings, 'SETTINGS', sozQator(sozServer).slice(0, 2), 'ulanish'),
        pk(cliAck, 'SETTINGS · ACK', ['qabul qildim'], 'ulanish'),
        pk(javob1, 'SETTINGS · ACK', ['+ HEADERS oqim 1: 200'], 'ulanish'),
      ],
    },
    {
      qisqa: 'HPACK', nishon: 'tushuncha',
      sarlavha: 'HPACK: sarlavhalar raqamga aylanadi',
      matn: [
        `Uch so‘rovning sarlavhalari deyarli bir xil. HTTP/1.1 da ular har safar matn bo‘lib ketardi — bu so‘rov uchun **${h1} bayt**. HTTP/2 da HPACK bloki: ${sorov.map((s) => `**${s.blok} B**`).join(', ')}.`,
        `Qanday: \`:method: GET\`, \`:scheme: https\` kabi ko‘p uchraydiganlar standartdagi **statik jadvalda** (1–61) — yuborilgani faqat raqam. \`user-agent\`, \`accept\` qiymatlari birinchi so‘rovda matn bilan ketdi va **dinamik jadvalga** qo‘shildi; ikkinchi so‘rovda ${sorov[1].dinamik} ta sarlavha shu jadvaldan raqam (62 va undan katta) bilan olindi (RFC 7541, 2.3).`,
      ],
      callout: { tur: 'maslahat', matn: 'Ikkinchi HEADERS paketini oching (kalit bilan) va `Representation` / `Index` qatorlariga qarang: birinchi so‘rovda “Literal … Incremental Indexing”, keyingisida “Indexed Header Field”.' },
      faktlar: [['HTTP/1.1 matni', `${h1} B`], ...sorov.map((s) => [`HPACK, oqim ${s.oqim}`, `${s.blok} B`])],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        { tur: 'teg', tugun: 'klient', matn: `${h1} B → ${sorov.map((s) => s.blok).join(' / ')} B`, rang: 'insight' },
      ],
    },
    {
      qisqa: 'Javoblar', nishon: 'texnika',
      sarlavha: 'Javoblar: kadrlar oqim raqami bilan',
      matn: [
        `Server oqim 1 ga HEADERS (\`:status: 200\`) va bitta DATA kadri yubordi — sahifa ${son(maydonlar(data1, 'http2.length').at(-1))} bayt, TCP’da ${data1Segment.length} ta segmentga bo‘lindi. Keyin ${javoblar.map((p) => `oqim ${son(maydonlar(p, 'http2.streamid')[0])}`).join(' va ')}: har biri HEADERS + DATA, bittadan paketda.`,
        'Har kadrda oqim raqami bor — klient qaysi bayt qaysi so‘rovniki ekanini shundan biladi. Bu yozuvda fayllar kichik, server ularni navbat bilan yubordi; katta fayllarda kadrlar aralashib ketishi mumkin (multiplexing). DATA dagi END_STREAM — shu oqim tugadi.',
      ],
      callout: { tur: 'ogoh', matn: 'Oqimlar mustaqil, lekin hammasi bitta TCP ulanishida. TCP segmenti yo‘qolsa, u qayta kelguncha shu ulanishdagi barcha oqimlar kutadi (Web asoslari, 13-bob). HTTP/3 shuni QUIC bilan hal qiladi.' },
      faktlar: [['Oqim 1', `${son(maydonlar(data1, 'http2.length').at(-1))} B, ${data1Segment.length} segment`], ...javoblar.map((p) => [`Oqim ${son(maydonlar(p, 'http2.streamid')[0])}`, `${son(maydonlar(p, 'http2.length').at(-1))} B, 1 paket`])],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        { tur: 'teg', tugun: 'klient', matn: null },
        ...data1Segment.map((p, i, a) => pk(p, p.n === data1.n ? 'DATA · OQIM 1' : `OQIM 1 · ${i + 1}/${a.length}`, [`${p.len} B`], 'javob', { ms: 600 })),
        ...javoblar.map((p) => pk(p, `OQIM ${son(maydonlar(p, 'http2.streamid')[0])}`, ['HEADERS 200 + DATA'], 'javob', { ms: 700 })),
      ],
    },
    {
      qisqa: 'Xulosa', nishon: 'xulosa',
      sarlavha: 'Uch fayl — bitta ulanish, bitta borib-kelish',
      matn: [
        `Butun yozuvda TCP kelishuvi **${synlar} marta**, TLS ham bir marta. Birinchi so‘rovdan oxirgi javobgacha **${ms(sorov[0].p, oxirgi)}** — taxminan bitta borib-kelish, uch fayl uchun.`,
        'HTTP/1.1 da bitta ulanishda so‘rovlar navbat bilan ketadi; parallel yuklash uchun brauzer bir nechta ulanish ochadi — har biri o‘z TCP va TLS kelishuvi bilan. HTTP/2 shularni bitta ulanishga yig‘di.',
      ],
      callout: { tur: 'goya', matn: 'curl’ning o‘zi ham shuni aytdi: birinchi URL uchun 1 ta yangi ulanish, qolgan ikkitasi uchun 0 — mavjud ulanishga qo‘shildi (`%{num_connects}`).' },
      korinadi: KORINADI,
      kamera: KORINADI,
      kartalar: [{
        sarlavha: 'Yozuvdan',
        qatorlar: [
          ['TCP+TLS', `${synlar} marta`],
          ['oqimlar', sorov.map((s) => s.oqim).join(' · ')],
          ['HTTP/1.1 sarlavha', `${h1} B`],
          ['HPACK sarlavha', `${sorov.map((s) => s.blok).join(' · ')} B`, true],
          ['1-GET → oxirgi', ms(sorov[0].p, oxirgi)],
          ['SYN → oxirgi', ms(syn, oxirgi)],
        ],
        joy: 'yuqori-chap',
        izoh: 'klient tomonida o‘lchangan; HTTP/1.1 hajmi — xuddi shu sarlavhalar matn ko‘rinishida',
      }],
      hodisalar: [{ tur: 'teg', tugun: 'klient', matn: null }],
    },
  ],
}
