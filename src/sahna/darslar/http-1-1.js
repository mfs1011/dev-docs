// "HTTP/1.1: sahifa ochilishi" — Paket yo'li darsi. Paketlar VPS laboratoriyasidagi haqiqiy yozuvdan
// (paket-lab/ssenariy/http-1-1.sh → tshark → scripts/paket/aylantir.mjs). Paket raqamlari va vaqtlar yozuvdan
// topiladi (info ustuni bo'yicha), qo'lda yozilmaydi. docs/vizualizator/paket-yoli.md 5
import yozuv from '../paket/yozuvlar/http-1-1.json'

const P = yozuv.paketlar
const top = (re, dan = 0) => {
  const p = P.find((x) => x.n > dan && re.test(x.info))
  if (!p) throw new Error(`http-1-1: yozuvda topilmadi: ${re}`)
  return p
}
const qA = top(/Standard query 0x\w+ A sayt\.test$/)
const qAAAA = top(/Standard query 0x\w+ AAAA sayt\.test$/)
const rA = top(/Standard query response 0x\w+ A sayt\.test A /)
const rAAAA = top(/Standard query response 0x\w+ AAAA sayt\.test/)
const syn = top(/\[SYN\] Seq=0/)
const synack = top(/\[SYN, ACK\]/)
const ack = top(/\[ACK\] Seq=1 Ack=1 /, synack.n)
const get = top(/GET \/ HTTP\/1\.1/)
const ok = top(/HTTP\/1\.1 200 OK/)
const port = syn.info.match(/^(\d+)/)[1]
// javob tanasining davomi: serverdan klientga, ok dan keyin, FIN dan oldin, ma'lumotli segmentlar
const fin1 = top(/\[FIN, ACK\]/, ok.n)
const davomi = P.filter((x) => x.n > ok.n && x.n < fin1.n && x.src === '203.0.113.10' && !/\[ACK\] Seq=\d+ Ack=\d+ Win=\d+ Len=0/.test(x.info) && x.len > 66)
const fin2 = top(/\[FIN, ACK\]/, fin1.n)
const oxirgiAck = top(/\[ACK\]/, fin2.n)
const maydon = (p, k) => {
  let topildi = null
  const yur = (f) => { if (f.k === k) topildi = f; (f.m ?? []).forEach(yur) }
  p.qatlamlar.forEach(yur)
  return topildi
}
const tana = Number(maydon(ok, 'http.content_length_header')?.s.match(/(\d+)/)?.[1])

const ms = (a, b) => `${Math.round((b.t - a.t) * 1000)} ms`
const oxirgiMalumot = davomi[davomi.length - 1] ?? ok

const pk = (p, yorliq, qatorlar, rang, dan, ga, qoshimcha = {}) => ({ tur: 'paket', n: p.n, yorliq, qatorlar, rang, dan, ga, ...qoshimcha })
const sk = (p) => p.dst === '203.0.113.10' ? ['klient', 'veb'] : ['veb', 'klient']

export default {
  id: 'http-1-1',
  tur: 'paket',
  sarlavha: 'HTTP/1.1: sahifa ochilishi',
  shior: 'Manzil yozilgandan sahifa kelguncha — paketma-paket.',
  daraja: 'boshlang‘ich',
  daqiqa: 7,
  yozuv,
  kitob: [
    { yol: '/web-asoslari/01-veb-qanday-ishlaydi', nom: 'Web asoslari, 01: Veb qanday ishlaydi' },
    { yol: '/web-asoslari/03-ip-port-tcp', nom: 'Web asoslari, 03: IP, port va TCP' },
    { yol: '/web-asoslari/04-domen-dns', nom: 'Web asoslari, 04: Domen va DNS' },
    { yol: '/web-asoslari/06-http-xabarlari', nom: 'Web asoslari, 06: HTTP xabarlari' },
  ],
  manba: [
    { nom: 'RFC 9112 — HTTP/1.1', url: 'https://www.rfc-editor.org/rfc/rfc9112' },
    { nom: 'RFC 9110 — HTTP Semantics', url: 'https://www.rfc-editor.org/rfc/rfc9110' },
    { nom: 'RFC 9293 — TCP', url: 'https://www.rfc-editor.org/rfc/rfc9293' },
    { nom: 'RFC 1035 — DNS', url: 'https://www.rfc-editor.org/rfc/rfc1035' },
  ],
  sinov: `Yozuv: VPS laboratoriyasi (paket-lab/), \`curl -v --http1.1 http://sayt.test/\`, tcpdump klient tomonida. Router ikki tomonga 10 ms kechikish qo‘shadi (tc netem) — laboratoriya bitta mashinada. ${yozuv.versiyalar.slice(0, 1).join('')} · curl 7.88.1 · nginx 1.30.6 · dnsmasq 2.90 · TShark 4.6.4.`,
  trenajor: { yol: '/web-asoslari/trenajor', nom: 'HTTP laboratoriyasida o‘zingiz yuboring' },
  protokol: {
    izoh: 'HTTP — vebning protokoli: klient resursni so‘raydi, server holat kodi, sarlavhalar va (odatda) tana bilan javob beradi. HTTP/1.1 da xabar — o‘qiladigan matn.',
    faktlar: [['Qatlam', 'ilova'], ['Port', '80 (HTTPS — 443)'], ['Transport', 'TCP'], ['Format', 'matn: qator + sarlavhalar + tana'], ['Standart', 'RFC 9110, 9112']],
  },
  organasiz: [
    { matn: 'Nega avval DNS kerak', qadam: 1 },
    { matn: 'TCP ulanishi: uch paket', qadam: 2 },
    { matn: 'So‘rov va javob qanday yozilgan', qadam: 4 },
    { matn: 'Vaqt qayerga ketadi', qadam: 6 },
  ],
  afsona: [{ k: 'sorov', nom: 'so‘rov' }, { k: 'javob', nom: 'javob' }, { k: 'ulanish', nom: 'TCP boshqaruvi' }],
  ishtirokchilar: ['klient', 'dns', 'veb'],
  yozishTuguni: 'klient',
  tugunlar: {
    klient: { ikonka: 'noutbuk', nom: 'Klient', izoh: '192.168.1.10', x: 130, y: 330 },
    router: { ikonka: 'router', nom: 'Router', izoh: '192.168.1.1', x: 420, y: 330 },
    dns: { ikonka: 'dns', nom: 'DNS server', izoh: '203.0.113.53', x: 740, y: 170 },
    veb: { ikonka: 'server', nom: 'Veb-server', izoh: '203.0.113.10:80', x: 740, y: 490 },
  },
  chiziqlar: [['klient', 'router'], ['router', 'dns'], ['router', 'veb']],
  yollar: {
    'klient>dns': ['klient', 'router', 'dns'], 'dns>klient': ['dns', 'router', 'klient'],
    'klient>veb': ['klient', 'router', 'veb'], 'veb>klient': ['veb', 'router', 'klient'],
  },
  qadamlar: [
    {
      qisqa: 'Manzil', nishon: 'sozlash',
      sarlavha: 'Brauzerga manzil yozildi',
      matn: [
        'Klient (bizning noutbuk) `http://sayt.test/` sahifasini ochmoqchi. Bu darsda brauzer o‘rnida `curl` — u ham xuddi shu so‘rovni yuboradi.',
        'Lekin paketlar **nomga** emas, **IP manzilga** boradi. Demak birinchi ish — `sayt.test` ning manzilini topish.',
      ],
      callout: { tur: 'goya', matn: 'Har paket uy tarmog‘idan routerga, router esa uni manzil tomon uzatadi. Shuning uchun hamma paket router orqali o‘tadi.' },
      faktlar: [['Manzil', '`http://sayt.test/`'], ['Metod', '`GET`'], ['Keyingi qadam', 'router 192.168.1.1']],
      korinadi: ['klient', 'router'],
      kamera: ['klient', 'router'],
      hodisalar: [{ tur: 'yozish', tugun: 'klient', matn: 'http://sayt.test/' }],
    },
    {
      qisqa: 'DNS', nishon: 'texnika',
      sarlavha: 'Manzilni DNS’dan so‘rash',
      matn: [
        `Klient DNS serverga UDP orqali (53-port) so‘rov yuboradi. Bir vaqtning o‘zida ikkita: **A** (IPv4 manzil) va **AAAA** (IPv6 manzil).`,
        `Javob ${ms(qA, rA)} da keldi: \`sayt.test\` → **203.0.113.10**. IPv6 manzil yozilmagan — AAAA javobida yozuv yo‘q.`,
      ],
      callout: { tur: 'maslahat', matn: 'Javobdagi **TTL** — natijani necha soniya eslab qolish mumkin. Shu vaqt ichida qayta ochilsa, DNS so‘rovi umuman yuborilmaydi.' },
      faktlar: [['Transport', 'UDP, port 53'], ['Savol', '`A? sayt.test`'], ['Javob', '`A 203.0.113.10`'], ['Vaqt', ms(qA, rA)]],
      korinadi: ['klient', 'router', 'dns'],
      kamera: ['klient', 'router', 'dns'],
      hodisalar: [
        pk(qA, 'DNS SO‘ROVI', ['A? sayt.test'], 'sorov', 'klient', 'dns'),
        pk(qAAAA, 'DNS SO‘ROVI', ['AAAA? sayt.test'], 'sorov', 'klient', 'dns', { ms: 600 }),
        pk(rA, 'DNS JAVOBI', ['A 203.0.113.10'], 'javob', 'dns', 'klient'),
        pk(rAAAA, 'DNS JAVOBI', ['AAAA: yozuv yo‘q'], 'javob', 'dns', 'klient', { ms: 600 }),
        { tur: 'teg', tugun: 'klient', matn: 'sayt.test = 203.0.113.10', rang: 'ok' },
      ],
    },
    {
      qisqa: 'TCP', nishon: 'texnika',
      sarlavha: 'Server bilan ulanish: uch paket',
      matn: [
        `HTTP TCP ustida ishlaydi. Ma’lumot yuborishdan oldin klient va server ulanish ochadi: **SYN** (“ulanaylik”), **SYN-ACK** (“mayli”), **ACK** (“kelishdik”).`,
        `Klient o‘zi uchun vaqtinchalik port tanladi — **${port}**; server 80-portda kutyapti. Uch paket ${ms(syn, ack)} oldi — bitta borib-kelish.`,
      ],
      callout: { tur: 'goya', matn: 'SYN paketida tomonlar imkoniyatlarini aytadi: eng katta segment (MSS 1460 bayt), SACK, oyna masshtabi. Paketni bosib, parametrlarini ko‘ring.' },
      faktlar: [['Klient porti', `${port} (vaqtinchalik)`], ['Server porti', '80'], ['Handshake', 'SYN → SYN-ACK → ACK'], ['Vaqt', ms(syn, ack)]],
      korinadi: ['klient', 'router', 'dns', 'veb'],
      kamera: ['klient', 'router', 'veb'],
      hodisalar: [
        { tur: 'teg', tugun: 'klient', matn: null },
        pk(syn, 'SYN', ['ulanish so‘rovi'], 'ulanish', 'klient', 'veb'),
        pk(synack, 'SYN-ACK', ['rozilik'], 'ulanish', 'veb', 'klient'),
        pk(ack, 'ACK', ['kelishdik'], 'ulanish', 'klient', 'veb'),
        { tur: 'teg', tugun: 'veb', matn: 'ulanish ochiq', rang: 'insight' },
      ],
    },
    {
      qisqa: 'So‘rov', nishon: 'texnika',
      sarlavha: 'GET so‘rovi',
      matn: [
        'Endi klient so‘rovni yuboradi — bu oddiy matn: birinchi qatorda metod, yo‘l va versiya, keyin sarlavhalar, oxirida bo‘sh qator.',
        '`Host: sayt.test` sarlavhasi muhim: bitta IP manzilda ko‘p sayt bo‘lishi mumkin, server qaysi biri so‘ralganini shundan biladi.',
      ],
      callout: { tur: 'maslahat', matn: 'Inspektorda HTTP qatlamini oching: har sarlavha alohida qator, oxiridagi `\\r\\n` — qator tugashi.' },
      faktlar: [['Birinchi qator', '`GET / HTTP/1.1`'], ['Host', '`sayt.test`'], ['Hajm', `${get.len} B`]],
      korinadi: ['klient', 'router', 'dns', 'veb'],
      kamera: ['klient', 'router', 'veb'],
      hodisalar: [pk(get, 'GET /', ['GET / HTTP/1.1', 'Host: sayt.test'], 'sorov', 'klient', 'veb')],
    },
    {
      qisqa: 'Javob', nishon: 'texnika',
      sarlavha: '200 OK va sahifa',
      matn: [
        `Server **200 OK** bilan javob beradi. Sahifa ${tana} bayt — bitta paketga sig‘maydi (bitta segmentda ko‘pi bilan 1448 bayt ma’lumot), shuning uchun TCP uni bo‘laklarga bo‘ldi: sarlavhalar bilan birinchi paket va yana ${davomi.length} ta.`,
        '`Content-Length` sarlavhasi klientga tana qayerda tugashini aytadi; klient har bo‘lakni ACK bilan tasdiqlaydi (ular “hamma paketlar”da ko‘rinadi).',
      ],
      callout: { tur: 'goya', matn: '`Connection: keep-alive` — ulanish yopilmasa, keyingi so‘rov uchun yangi handshake kerak bo‘lmaydi.' },
      faktlar: [['Holat', '`200 OK`'], ['Turi', '`text/html`'], ['Tana', `${tana} B`], ['Bo‘laklar', `${davomi.length + 1} ta segment`]],
      korinadi: ['klient', 'router', 'dns', 'veb'],
      kamera: ['klient', 'router', 'veb'],
      hodisalar: [
        pk(ok, '200 OK', ['HTTP/1.1 200 OK', `Content-Length: ${tana}`], 'javob', 'veb', 'klient'),
        ...davomi.map((p, i) => pk(p, `TANA ${i + 2}/${davomi.length + 1}`, [`${p.len} B`], 'javob', 'veb', 'klient', { ms: 700 })),
        { tur: 'teg', tugun: 'klient', matn: 'sahifa keldi ✓', rang: 'ok' },
      ],
    },
    {
      qisqa: 'Yopish', nishon: 'texnika',
      sarlavha: 'Ulanishni yopish',
      matn: [
        '`curl` bitta sahifa so‘ragan edi, shuning uchun ulanishni yopadi: **FIN** (“men tugatdim”) ikki tomondan, oxirida ACK.',
        'Brauzer odatda ulanishni darhol yopmaydi — sahifadagi rasm va CSS uchun qayta ishlatadi.',
      ],
      korinadi: ['klient', 'router', 'dns', 'veb'],
      kamera: ['klient', 'router', 'veb'],
      hodisalar: [
        pk(fin1, 'FIN', ['men tugatdim'], 'ulanish', ...sk(fin1)),
        pk(fin2, 'FIN', ['men ham'], 'ulanish', ...sk(fin2)),
        pk(oxirgiAck, 'ACK', ['xayr'], 'ulanish', ...sk(oxirgiAck)),
        { tur: 'teg', tugun: 'veb', matn: null },
      ],
    },
    {
      qisqa: 'Vaqt', nishon: 'xulosa',
      sarlavha: 'Vaqt qayerga ketdi',
      matn: [
        `Butun jarayon ${ms(qA, oxirgiMalumot)} oldi (oxirgi bayt kelguncha). Server sahifani tayyorlashga deyarli vaqt sarflamadi — vaqtning ko‘pi **borib-kelishlarga** ketdi: DNS, ulanish, so‘rov-javob.`,
        'Bu laboratoriyada router har tomonga 10 ms qo‘shadi. Haqiqiy internetda server uzoqroq bo‘lsa, har borib-kelish qimmatlashadi — shuning uchun DNS kesh, keep-alive va HTTP/2 muhim.',
      ],
      callout: { tur: 'goya', matn: 'Sekin sahifani tezlashtirishdan oldin vaqt qayerga ketayotganini o‘lchang — brauzerning Network paneli (Web asoslari, 29-bob).' },
      korinadi: ['klient', 'router', 'dns', 'veb'],
      kamera: ['klient', 'router', 'dns', 'veb'],
      kartalar: [{
        sarlavha: 'Vaqt qayerga ketdi (yozuvdan)',
        qatorlar: [
          ['DNS', ms(qA, rA)],
          ['TCP ulanish', ms(syn, ack)],
          ['so‘rov → birinchi javob', ms(get, ok)],
          ['tanani yuklash', ms(ok, oxirgiMalumot)],
          ['jami', ms(qA, oxirgiMalumot), true],
        ],
        joy: 'yuqori-chap',
        izoh: 'klient tomonida o‘lchangan',
      }],
      hodisalar: [],
    },
  ],
}
