// "HTTPS: vaqt qayerga ketadi" — Paket yo'li darsi. Paketlar VPS laboratoriyasidagi haqiqiy yozuvdan (paket-lab/ssenariy/https.sh:
// bitta sahifa uch marta — ochiq HTTP, HTTPS TLS 1.2, HTTPS TLS 1.3; har biri DNS'dan boshlab, yangi ulanish bilan).
// Bosqichlar vaqti paketlardan hisoblanadi. Shifrlangan qism — "ochiq" daraxt (curl kalitlari bilan).
// docs/vizualizator/paket-yoli.md 4.1 (5-dars)
import yozuv from '../paket/yozuvlar/https.json'

const P = yozuv.paketlar
const VEB = '203.0.113.10'
const DNS = '203.0.113.53'
const ochiqInfo = (p) => p.ochiq?.info ?? p.info
const keyingi = (re, dan, gacha = Infinity, kalit = false) => P.find((x) => x.n > dan && x.n < gacha && re.test(kalit ? ochiqInfo(x) : x.info))
const maydonlar = (p, k) => {
  const r = []
  const yur = (f) => { if (f.k === k) r.push(f.s); (f.m ?? []).forEach(yur) }
  ;(p.ochiq?.qatlamlar ?? p.qatlamlar).forEach(yur)
  return r
}
const ms = (a, b) => Math.round((b.t - a.t) * 1000)
const bosAck = /\[ACK\] Seq=\d+ Ack=\d+ Win=\d+ Len=0/

// uch urinish: har biri A so'rovi bilan boshlanadi
const boshlar = P.filter((x) => /^Standard query 0x[0-9a-f]+ A sayt\.test$/.test(x.info))
const urinish = boshlar.map((q, i) => {
  const gacha = boshlar[i + 1]?.n ?? Infinity
  const javobA = keyingi(/^Standard query response 0x[0-9a-f]+ A sayt\.test A /, q.n, gacha)
  const syn = keyingi(/ \[SYN\] /, q.n, gacha)
  const synack = keyingi(/\[SYN, ACK\]/, syn.n, gacha)
  const ch = keyingi(/Client Hello/, syn.n, gacha)
  const get = keyingi(/^GET \/ HTTP\/1\.1/, syn.n, gacha, true)
  const birinchi = P.find((x) => x.n > get.n && x.n < gacha && x.src === VEB && !bosAck.test(x.info))
  const oxirgi = keyingi(/HTTP\/1\.1 200 OK/, get.n, gacha, true)
  const versiya = ch ? (maydonlar(keyingi(/Server Hello/, ch.n, gacha), 'tls.handshake.extensions.supported_version')[0] ? 'TLS 1.3' : 'TLS 1.2') : null
  return {
    q, javobA, syn, synack, ch, get, birinchi, oxirgi, versiya,
    dns: ms(q, javobA), tcp: ms(syn, synack), tls: ch ? ms(ch, get) : 0, http: ms(get, birinchi), jami: ms(q, oxirgi),
  }
})
const [h, t12, t13] = urinish
const sh12 = keyingi(/Server Hello/, t12.ch.n, t13.q.n)
const cke12 = keyingi(/Client Key Exchange/, sh12.n, t13.q.n)
const fin12 = keyingi(/^Change Cipher Spec, Finished/, cke12.n, t13.q.n, true)
const sh13 = keyingi(/Server Hello/, t13.ch.n)
const fin13 = keyingi(/^Change Cipher Spec, Finished/, sh13.n, Infinity, true)
const sertOchiq12 = /Certificate/.test(sh12.info)
const sertOchiq13 = /Certificate/.test(sh13.info)
const aaaa = P.find((x) => x.src === DNS && /AAAA sayt\.test$/.test(x.info))

const pk = (p, yorliq, qatorlar, rang, qoshimcha = {}) => {
  const tugun = p.src === VEB || p.dst === VEB ? 'veb' : 'dns'
  const [dan, ga] = p.src === '192.168.1.10' ? ['klient', tugun] : [tugun, 'klient']
  return { tur: 'paket', n: p.n, yorliq, qatorlar, rang, dan, ga, ...qoshimcha }
}
const KORINADI = ['klient', 'router', 'dns', 'veb']

export default {
  id: 'https',
  tur: 'paket',
  sarlavha: 'HTTPS: vaqt qayerda',
  shior: 'Bitta sahifa uch xil: ochiq HTTP, TLS 1.2 va TLS 1.3 — har bosqichi millisekundigacha.',
  daraja: 'boshlang‘ich',
  daqiqa: 7,
  yozuv,
  kitob: [
    { yol: '/web-asoslari/25-tls', nom: 'Web asoslari, 25: TLS' },
    { yol: '/web-asoslari/01-veb-qanday-ishlaydi', nom: 'Web asoslari, 01: Veb qanday ishlaydi' },
  ],
  manba: [
    { nom: 'RFC 9846 — TLS 1.3, 2 Protokol sharhi', url: 'https://www.rfc-editor.org/rfc/rfc9846#section-2' },
    { nom: 'RFC 9846 — 1.3 TLS 1.2 dan farqlar', url: 'https://www.rfc-editor.org/rfc/rfc9846#section-1.3' },
    { nom: 'RFC 5246 — TLS 1.2, 7.3 Kelishuv sharhi', url: 'https://www.rfc-editor.org/rfc/rfc5246#section-7.3' },
    { nom: 'curl — --write-out vaqtlari', url: 'https://curl.se/docs/manpage.html#-w' },
  ],
  sinov: `Yozuv: VPS laboratoriyasi (paket-lab/), uch alohida \`curl\`: \`http://sayt.test/\`, \`https://\` \`--tls-max 1.2\` bilan va \`--tlsv1.3\` bilan; nom laboratoriya DNS’idan (dnsmasq), \`--resolve\` yo‘q. nginx’da \`ssl_protocols TLSv1.2 TLSv1.3\`. Router ikki tomonga 10 ms kechikish qo‘shadi — bitta borib-kelish ~20 ms. Bosqich vaqtlari paketlardan: DNS — so‘rov → A javobi, TCP — SYN → SYN-ACK, TLS — ClientHello → GET, HTTP — GET → javobning birinchi paketi. ${yozuv.versiyalar.filter((v) => /^(sana|curl|nginx version|Dnsmasq|TShark)/.test(v)).map((v) => v.replace(/ \(x86.*$/, '').replace(/ +Copyright.*$/, '')).join(' · ')}`,
  trenajor: { yol: '/web-asoslari/trenajor', nom: 'HTTP laboratoriyasida o‘zingiz yuboring' },
  protokol: {
    izoh: 'HTTPS — o‘sha HTTP, lekin TLS ichida. Sahifa ochilguncha to‘rt bosqich: nomni manzilga aylantirish (DNS), ulanish (TCP), shifrlangan kanal (TLS), so‘rov-javob (HTTP). Har biri kamida bitta borib-kelish.',
    faktlar: [['Bosqichlar', 'DNS → TCP → TLS → HTTP'], ['TLS 1.2', '2 borib-kelish'], ['TLS 1.3', '1 borib-kelish'], ['Standart', 'RFC 9846, 5246']],
  },
  organasiz: [
    { matn: 'Sahifa ochilishi qaysi bosqichlardan iborat', qadam: 1 },
    { matn: 'TLS 1.2 va 1.3 farqi — paketda', qadam: 4 },
    { matn: 'Vaqt byudjeti: qayerda tejash mumkin', qadam: 6 },
  ],
  afsona: [{ k: 'sorov', nom: 'so‘rov' }, { k: 'javob', nom: 'javob' }, { k: 'ulanish', nom: 'DNS, TCP, TLS' }],
  ishtirokchilar: ['klient', 'dns', 'veb'],
  tugunlar: {
    klient: { ikonka: 'noutbuk', nom: 'Klient', izoh: '192.168.1.10', x: 60, y: 340 },
    router: { ikonka: 'router', nom: 'Router', izoh: '192.168.1.1', x: 360, y: 340 },
    dns: { ikonka: 'server', nom: 'DNS', izoh: DNS, x: 700, y: 120 },
    veb: { ikonka: 'server', nom: 'Veb-server', izoh: 'sayt.test · 80, 443', x: 700, y: 560 },
  },
  chiziqlar: [['klient', 'router'], ['router', 'dns'], ['router', 'veb']],
  yollar: {
    'klient>dns': ['klient', 'router', 'dns'], 'dns>klient': ['dns', 'router', 'klient'],
    'klient>veb': ['klient', 'router', 'veb'], 'veb>klient': ['veb', 'router', 'klient'],
  },
  qadamlar: [
    {
      qisqa: 'DNS', nishon: 'sozlash',
      sarlavha: '1-bosqich: nomdan manzilga',
      matn: [
        `Har urinish DNS’dan boshlandi: curl \`A\` va \`AAAA\` so‘rovlarini birga yubordi. \`A\` javobi — \`${VEB}\`, ${h.dns} ms da${aaaa ? '; `AAAA` yozuvi yo‘q (IPv6 manzil berilmagan)' : ''}.`,
        `Keyingi ikki urinishda DNS ${t12.dns} va ${t13.dns} ms — har biri bitta borib-kelish. curl har ishga tushganda qaytadan so‘raydi; brauzer va operatsion tizim esa javobni keshlaydi (2-dars).`,
      ],
      callout: { tur: 'maslahat', matn: 'DNS paketini oching: so‘rov UDP 53 ga ketdi, javobdagi `A` yozuvida manzil. Bu bosqich HTTP ham, HTTPS ham uchun bir xil.' },
      faktlar: [['Javob', VEB], ['1-urinish', `${h.dns} ms`], ['2-urinish', `${t12.dns} ms`], ['3-urinish', `${t13.dns} ms`]],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        pk(h.q, 'DNS: A?', ['sayt.test'], 'ulanish'),
        pk(h.javobA, 'DNS JAVOBI', [`A ${VEB}`], 'ulanish'),
      ],
    },
    {
      qisqa: 'HTTP', nishon: 'texnika',
      sarlavha: 'Ochiq HTTP: TCP va bitta so‘rov',
      matn: [
        `Ochiq HTTP’da DNS’dan keyin ikki bosqich: TCP kelishuvi **${h.tcp} ms** (SYN → SYN-ACK) va so‘rov — GET’dan javobning birinchi paketigacha **${h.http} ms**.`,
        `Jami, DNS so‘rovidan oxirgi segmentgacha — **${h.jami} ms**. Bu — taqqoslash uchun asos: keyingi ikki urinishda xuddi shu sahifa, faqat HTTPS orqali.`,
      ],
      callout: { tur: 'goya', matn: 'Router har yo‘nalishga 10 ms qo‘shadi — bitta borib-kelish ~20 ms. Bosqichlar shunga yaqin: har biri bitta borib-kelish.' },
      faktlar: [['TCP', `${h.tcp} ms`], ['HTTP', `${h.http} ms`], ['Jami', `${h.jami} ms`]],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        pk(h.syn, 'SYN', ['port 80'], 'ulanish'),
        pk(h.synack, 'SYN-ACK', [`${h.tcp} ms`], 'ulanish'),
        pk(h.get, 'GET /', ['ochiq'], 'sorov'),
        pk(h.birinchi, '200 OK', [`${h.http} ms`], 'javob'),
      ],
    },
    {
      qisqa: 'TLS 1.2', nishon: 'texnika',
      sarlavha: 'TLS 1.2: ikki borib-kelish',
      matn: [
        `HTTPS, TLS 1.2. TCP’dan keyin ClientHello; server bir paketda **ServerHello, Certificate, ServerKeyExchange, ServerHelloDone** yubordi. Klient kalit almashuvi va Finished’ni yubordi, keyin **serverning Finished’ini kutdi** — faqat shundan keyin GET.`,
        `ClientHello’dan GET’gacha **${t12.tls} ms** — ikki borib-kelish (RFC 5246, 7.3).${sertOchiq12 ? ' Diqqat: TLS 1.2 da sertifikat **ochiq** ketadi — routerdagi kuzatuvchi uni o‘qiy oladi.' : ''}`,
      ],
      callout: { tur: 'maslahat', matn: 'Server javobi paketini kalitsiz oching: `Certificate` xabari va ichida `sayt.test` sertifikati — shifrlanmagan.' },
      faktlar: [['TLS bosqichi', `${t12.tls} ms`], ['Borib-kelish', '2'], ['Sertifikat', sertOchiq12 ? 'ochiq' : 'shifrlangan']],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        pk(t12.ch, 'CLIENT HELLO', ['TLS 1.2'], 'ulanish'),
        pk(sh12, 'SERVER HELLO …', ['Certificate (ochiq)'], 'ulanish'),
        pk(cke12, 'KEY EXCHANGE', ['+ Finished'], 'ulanish'),
        pk(fin12, 'FINISHED', ['server tayyor'], 'ulanish'),
        pk(t12.get, 'GET /', ['shifrlangan'], 'sorov'),
      ],
    },
    {
      qisqa: 'TLS 1.3', nishon: 'texnika',
      sarlavha: 'TLS 1.3: bitta borib-kelish',
      matn: [
        `Xuddi shu sahifa, TLS 1.3. Klient ClientHello’dayoq kalit ulushini yubordi; server bir paketda ServerHello va qolgan hammasini — **shifrlangan** holda. Klient Finished va GET’ni **ketma-ket** yubordi, serverni kutmadi.`,
        `ClientHello’dan GET’gacha **${t13.tls} ms** — bitta borib-kelish, TLS 1.2 dagidan ${t12.tls - t13.tls} ms tez. RFC 9846 (1.3): ServerHello’dan keyingi barcha kelishuv xabarlari shifrlangan${sertOchiq13 ? '' : ' — sertifikat ham'}.`,
      ],
      callout: { tur: 'goya', matn: 'Kitobdagi o‘lchov ham shunga mos: example.com’da TLS bosqichi TLS 1.2 da 69–82 ms, TLS 1.3 da 23–62 ms (Web asoslari, 25-bob).' },
      faktlar: [['TLS bosqichi', `${t13.tls} ms`], ['Borib-kelish', '1'], ['Sertifikat', sertOchiq13 ? 'ochiq' : 'shifrlangan']],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        pk(t13.ch, 'CLIENT HELLO', ['TLS 1.3 + kalit ulushi'], 'ulanish'),
        pk(sh13, 'SERVER HELLO …', ['qolgani shifrlangan'], 'ulanish'),
        pk(fin13, 'FINISHED', ['klient tayyor'], 'ulanish'),
        pk(t13.get, 'GET /', ['darhol'], 'sorov'),
      ],
    },
    {
      qisqa: 'Byudjet', nishon: 'tushuncha',
      sarlavha: 'Vaqt byudjeti: uchalasi yonma-yon',
      matn: [
        `Ochiq HTTP — ${h.jami} ms, TLS 1.2 — ${t12.jami} ms, TLS 1.3 — ${t13.jami} ms. Farq deyarli faqat TLS bosqichida: DNS, TCP va HTTP so‘rovi har uchalasida bir xil tartibda.`,
        `Ya’ni HTTPS’ning “narxi” — TLS kelishuvi: TLS 1.2 da ${t12.tls} ms, TLS 1.3 da ${t13.tls} ms. Borib-kelish uzoqroq bo‘lsa (masalan, 150 ms), bu farq ham shunga ko‘payadi.`,
      ],
      callout: { tur: 'maslahat', matn: 'Bu raqamlar bitta yangi ulanish uchun. Ulanish qayta ishlatilsa (keep-alive, HTTP/2), TCP va TLS keyingi so‘rovlarda qaytarilmaydi (8-, 9-darslar).' },
      korinadi: KORINADI,
      kamera: KORINADI,
      kartalar: [{
        sarlavha: 'Bosqichlar, ms',
        qatorlar: [
          ['ms', 'HTTP · 1.2 · 1.3'],
          ['DNS', urinish.map((u) => u.dns).join(' · ')],
          ['TCP', urinish.map((u) => u.tcp).join(' · ')],
          ['TLS', urinish.map((u) => u.tls || '—').join(' · ')],
          ['so‘rov', urinish.map((u) => u.http).join(' · ')],
          ['jami', urinish.map((u) => u.jami).join(' · '), true],
        ],
        joy: 'yuqori-chap',
        izoh: 'paketlardan; bitta borib-kelish ~20 ms',
      }],
      hodisalar: [],
    },
    {
      qisqa: 'Xulosa', nishon: 'xulosa',
      sarlavha: 'Qayerda tejash mumkin',
      matn: [
        'Har bosqich — borib-kelish. Tejash yo‘llari shu darslarda ko‘rindi: TLS 1.3 (bitta borib-kelish), ulanishni qayta ishlatish (8-, 9-darslar), DNS keshi (2-dars), QUIC’da TCP va TLS birlashgan (HTTP/3 darsi).',
        'TLS 1.3 qayta ulanishda sessiya chiptasi bilan kelishuvni qisqartira oladi (RFC 9846, 2.2) — 4-darsdagi “New Session Ticket” xabarlari shu uchun.',
      ],
      callout: { tur: 'goya', matn: 'Masofa ham muhim: borib-kelish vaqti foydalanuvchi va server orasidagi yo‘lga bog‘liq — server yaqinroq bo‘lsa (CDN), har bosqich qisqaradi.' },
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [],
    },
  ],
}
