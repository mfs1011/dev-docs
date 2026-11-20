// "Sayt ochilmayapti" — Paket yo'li darsi. Paketlar VPS laboratoriyasidagi haqiqiy yozuvdan (paket-lab/ssenariy/ochilmayapti.sh:
// besh alohida curl — mavjud bo'lmagan nom, yopiq port, xavfsizlik devori tashlaydigan port, sertifikatdagi nom mos emas,
// ishlamayotgan backend). Har qatlamdagi belgi paketlardan; curl xabarlari — shu yozuvning jurnalidan.
// docs/vizualizator/paket-yoli.md 4.1 (30-bob)
import yozuv from '../paket/yozuvlar/ochilmayapti.json'

const P = yozuv.paketlar
const VEB = '203.0.113.10'
const DNS = '203.0.113.53'
const KLIENT = '192.168.1.10'
const ochiqInfo = (p) => p.ochiq?.info ?? p.info
const top = (re, dan = 0, kalit = false) => {
  const p = P.find((x) => x.n > dan && re.test(kalit ? ochiqInfo(x) : x.info))
  if (!p) throw new Error(`ochilmayapti: yozuvda topilmadi: ${re}`)
  return p
}
const maydonlar = (p, k) => {
  const r = []
  const yur = (f) => { if (f.k === k) r.push(f.s); (f.m ?? []).forEach(yur) }
  ;(p.ochiq?.qatlamlar ?? p.qatlamlar).forEach(yur)
  return r
}
const ms = (a, b) => Math.round((b.t - a.t) * 1000)

// 1) DNS
const nxSorov = top(/^Standard query 0x[0-9a-f]+ A yoq\.sayt\.test$/)
const nxJavob = top(/No such name A yoq\.sayt\.test/)
const nxDanKeyinTcp = P.some((x) => x.n > nxJavob.n && x.n < top(/^Standard query 0x[0-9a-f]+ A sayt\.test$/, nxJavob.n).n && / \[SYN\]/.test(x.info))
// 2) RST
const syn8080 = top(/ → 8080 \[SYN\]/)
const rst = top(/8080 → \d+ \[RST, ACK\]/)
// 3) DROP
const syn8081 = P.filter((x) => / → 8081 \[SYN\]/.test(x.info))
const javob8081 = P.some((x) => x.src === VEB && /^8081 → /.test(x.info))
const oraliqlar = syn8081.slice(1).map((x, i) => ((x.t - syn8081[i].t)).toFixed(1))
// 4) TLS
const ch = top(/Client Hello \(SNI=www\.sayt\.test\)/)
const sh = top(/Server Hello/, ch.n)
const sni = ch.info.match(/SNI=([^)]+)/)[1]
const sertNomi = maydonlar(sh, 'x509ce.dNSName').map((s) => s.replace(/^dNSName:\s*/, ''))[0]
const finished = top(/^Change Cipher Spec, Finished/, sh.n, true)
const yopish = top(/Close Notify/, sh.n, true)
// 5) HTTP
const get502 = top(/^GET \/tashqi /)
const r502 = top(/502 Bad Gateway/, get502.n)

const pk = (p, yorliq, qatorlar, rang, qoshimcha = {}) => {
  const tugun = p.src === DNS || p.dst === DNS ? 'dns' : 'veb'
  const [dan, ga] = p.src === KLIENT ? ['klient', tugun] : [tugun, 'klient']
  return { tur: 'paket', n: p.n, yorliq, qatorlar, rang, dan, ga, ...qoshimcha }
}
const KORINADI = ['klient', 'router', 'dns', 'veb']

export default {
  id: 'ochilmayapti',
  tur: 'paket',
  sarlavha: 'Sayt ochilmayapti',
  shior: 'Besh xil “ochilmadi”: DNS, yopiq port, jim devor, sertifikat, 502 — har biri paketda o‘zini boshqacha ko‘rsatadi.',
  daraja: 'o‘rta',
  daqiqa: 8,
  yozuv,
  kitob: [
    { yol: '/web-asoslari/30-sayt-ochilmayapti', nom: 'Web asoslari, 30: Sayt ochilmayapti' },
  ],
  manba: [
    { nom: 'RFC 1035 — 4.1.1 RCODE', url: 'https://www.rfc-editor.org/rfc/rfc1035#section-4.1.1' },
    { nom: 'RFC 9293 — 3.5.2 RST qachon yuboriladi', url: 'https://www.rfc-editor.org/rfc/rfc9293#section-3.5.2' },
    { nom: 'RFC 9525 — Sertifikatdagi nomni tekshirish', url: 'https://www.rfc-editor.org/rfc/rfc9525' },
    { nom: 'RFC 9110 — 15.6.3 502', url: 'https://www.rfc-editor.org/rfc/rfc9110#section-15.6.3' },
    { nom: 'curl — xato kodlari', url: 'https://curl.se/libcurl/c/libcurl-errors.html' },
  ],
  sinov: `Yozuv: VPS laboratoriyasi (paket-lab/), besh alohida \`curl\`: \`http://yoq.sayt.test/\` (nom yo‘q), \`http://sayt.test:8080/\` (portda dastur yo‘q), \`http://sayt.test:8081/\` \`--connect-timeout 4\` bilan (routerdagi iptables bu portni DROP qiladi), \`https://www.sayt.test/\` (sertifikat faqat sayt.test uchun), \`http://fayl.sayt.test/tashqi\` (backend yo‘q). curl jurnali: “(6) Could not resolve host”, “(7) Failed to connect … Couldn't connect to server”, “(28) … Timeout was reached”, “(60) SSL: no alternative certificate subject name matches target host name 'www.sayt.test'”, 502. ${yozuv.versiyalar.filter((v) => /^(sana|curl|nginx version|Dnsmasq|TShark)/.test(v)).map((v) => v.replace(/ \(x86.*$/, '').replace(/ +Copyright.*$/, '')).join(' · ')}`,
  trenajor: { yol: '/web-asoslari/trenajor', nom: 'HTTP laboratoriyasida o‘zingiz yuboring' },
  protokol: {
    izoh: 'Sayt ochilmasa, muammo qaysi qatlamda ekanini topish kerak: DNS → TCP → TLS → HTTP. Har qatlamning nosozligi tarmoqda o‘z izini qoldiradi — paketga qarab qayerda to‘xtaganini aniqlash mumkin.',
    faktlar: [['Tartib', 'pastdan yuqoriga'], ['DNS', 'NXDOMAIN'], ['TCP', 'RST yoki jimlik'], ['TLS', 'sertifikat'], ['HTTP', '4xx / 5xx']],
  },
  organasiz: [
    { matn: 'RST va jimlik farqi', qadam: 3 },
    { matn: 'TLS kelishuvi tugasa ham ulanish yopilishi mumkin', qadam: 4 },
    { matn: 'Qatlamma-qatlam tekshirish tartibi', qadam: 6 },
  ],
  afsona: [{ k: 'sorov', nom: 'so‘rov' }, { k: 'javob', nom: 'javob' }, { k: 'ulanish', nom: 'DNS, TCP, TLS' }],
  ishtirokchilar: ['klient', 'dns', 'veb'],
  tugunlar: {
    klient: { ikonka: 'noutbuk', nom: 'Klient', izoh: KLIENT, x: 60, y: 340 },
    router: { ikonka: 'router', nom: 'Router', izoh: '192.168.1.1 · devor', x: 360, y: 340 },
    dns: { ikonka: 'server', nom: 'DNS', izoh: DNS, x: 700, y: 120 },
    veb: { ikonka: 'server', nom: 'Veb-server', izoh: VEB, x: 700, y: 560 },
  },
  chiziqlar: [['klient', 'router'], ['router', 'dns'], ['router', 'veb']],
  yollar: {
    'klient>dns': ['klient', 'router', 'dns'], 'dns>klient': ['dns', 'router', 'klient'],
    'klient>veb': ['klient', 'router', 'veb'], 'veb>klient': ['veb', 'router', 'klient'],
  },
  qadamlar: [
    {
      qisqa: 'DNS', nishon: 'muammo',
      sarlavha: 'DNS: bunday nom yo‘q',
      matn: [
        `\`yoq.sayt.test\` so‘raldi — DNS ${ms(nxSorov, nxJavob)} ms da **“No such name”** (NXDOMAIN, javob kodi 3) qaytardi: bunday nom yo‘q (RFC 1035, 4.1.1).`,
        `${nxDanKeyinTcp ? '' : 'Shundan keyin **hech qanday TCP paketi yo‘q** — manzil bo‘lmasa, ulanadigan joy ham yo‘q. '}curl: “(6) Could not resolve host”. Brauzer “sayt topilmadi” deydi.`,
      ],
      callout: { tur: 'maslahat', matn: 'Tekshirish: `dig +short nom A`. Sabablar: nom xato yozilgan, yozuv yo‘q, yangi o‘zgarish hali keshda (Web asoslari, 4- va 30-boblar).' },
      faktlar: [['Javob', 'No such name (3)'], ['Vaqt', `${ms(nxSorov, nxJavob)} ms`], ['TCP', nxDanKeyinTcp ? 'bor' : 'yo‘q'], ['curl', '(6)']],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        pk(nxSorov, 'DNS: A?', ['yoq.sayt.test'], 'ulanish'),
        pk(nxJavob, 'NXDOMAIN', ['bunday nom yo‘q'], 'ulanish'),
        { tur: 'teg', tugun: 'klient', matn: 'topilmadi ✗', rang: 'xato' },
      ],
    },
    {
      qisqa: 'RST', nishon: 'muammo',
      sarlavha: 'TCP: port yopiq — darhol RST',
      matn: [
        `Nom topildi, klient 8080-portga SYN yubordi. Server **${ms(syn8080, rst)} ms** da **RST** bilan javob berdi: “bu portda hech kim tinglamayapti”. Kutish yo‘q — xato darhol.`,
        'curl: “(7) Failed to connect … Couldn’t connect to server”. Server ishlayapti, mashina javob beryapti — faqat shu portda dastur yo‘q (RFC 9293, 3.5.2).',
      ],
      callout: { tur: 'maslahat', matn: 'Tekshirish (serverda): `ss -tln` — qaysi portlar tinglanmoqda. Odatiy sabab: dastur ishga tushmagan yoki boshqa portda (3- va 30-boblar).' },
      faktlar: [['Javob', 'RST, ACK'], ['Vaqt', `${ms(syn8080, rst)} ms`], ['curl', '(7)']],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        { tur: 'teg', tugun: 'klient', matn: null },
        pk(syn8080, 'SYN', [':8080'], 'ulanish'),
        pk(rst, 'RST', ['port yopiq'], 'ulanish'),
        { tur: 'teg', tugun: 'klient', matn: 'darhol rad ✗', rang: 'xato' },
      ],
    },
    {
      qisqa: 'Jimlik', nishon: 'muammo',
      sarlavha: 'TCP: javob yo‘q — devor jim tashlaydi',
      matn: [
        `8081-portga SYN ketdi — va **javob kelmadi**. Klient SYN’ni ${syn8081.length - 1} marta qayta yubordi (oraliqlar: ${oraliqlar.join(', ')} s), keyin curl 4 soniyada voz kechdi: “(28) … Timeout was reached”.`,
        `${javob8081 ? '' : 'Serverdan birorta paket yo‘q. '}Sabab — routerdagi xavfsizlik devori: u bu portga ketgan paketlarni **jim tashlaydi** (DROP). RST’dan farqi: klient muammo borligini darhol bilmaydi, faqat kutadi.`,
      ],
      callout: { tur: 'ogoh', matn: 'Uzoq kutish va keyin vaqt tugashi — devor, noto‘g‘ri IP yoki marshrut belgisi; darhol “rad etildi” — port yopiq. Bu ikki belgini farqlash qidiruvni yarmiga qisqartiradi (30-bob).' },
      faktlar: [['SYN', `${syn8081.length} marta`], ['Javob', javob8081 ? 'bor' : 'yo‘q'], ['Kutish', '4 s'], ['curl', '(28)']],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        { tur: 'teg', tugun: 'klient', matn: null },
        ...syn8081.map((p, i) => ({ ...pk(p, i ? 'SYN (QAYTA)' : 'SYN', [':8081'], 'ulanish', i ? { ms: 600 } : {}), ga: 'router' })),
        { tur: 'teg', tugun: 'router', matn: 'DROP', rang: 'xato' },
      ],
    },
    {
      qisqa: 'TLS', nishon: 'muammo',
      sarlavha: 'TLS: sertifikat boshqa nom uchun',
      matn: [
        `\`https://www.sayt.test/\`. TCP ulandi, ClientHello’da **SNI: \`${sni}\`**. Server o‘zidagi yagona sertifikatni yubordi — u **\`${sertNomi}\`** uchun (kalit bilan ko‘rinadi). Nom mos emas.`,
        `Bu yozuvda curl kelishuvni oxirigacha olib bordi (Finished), keyin nomni tekshirib, ulanishni **Close Notify** bilan yopdi — HTTP so‘rovi umuman ketmadi (kuzatildi). curl: “(60) SSL: no alternative certificate subject name matches target host name 'www.sayt.test'”.`,
      ],
      callout: { tur: 'maslahat', matn: 'Tekshirish: `openssl s_client -connect … -servername nom -verify_hostname nom`. Sabablar: muddat o‘tgan, nom mos emas, zanjir to‘liq emas (26- va 30-boblar).' },
      faktlar: [['SNI', sni], ['Sertifikat', sertNomi], ['Yopildi', 'Close Notify'], ['curl', '(60)']],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        { tur: 'teg', tugun: 'router', matn: null },
        pk(ch, 'CLIENT HELLO', [`SNI: ${sni}`], 'ulanish'),
        pk(sh, 'SERVER HELLO …', [`sertifikat: ${sertNomi}`], 'ulanish'),
        pk(yopish, 'CLOSE NOTIFY', ['nom mos emas'], 'ulanish'),
        { tur: 'teg', tugun: 'klient', matn: 'sertifikat ✗', rang: 'xato' },
      ],
    },
    {
      qisqa: 'HTTP', nishon: 'muammo',
      sarlavha: 'HTTP: hammasi ishladi, javob — 502',
      matn: [
        `Oxirgi urinishda TCP ulandi, HTTP so‘rovi ketdi — hammasi joyida. Lekin javob **502 Bad Gateway**: veb-server so‘rovni orqadagi ilovaga uzatolmadi (“Metodlar va holat kodlari” darsi).`,
        'Bu holda tarmoq aybdor emas — muammo server tomonida. Sababi klientga ko‘rinmaydi: proxy va ilova jurnallarida.',
      ],
      callout: { tur: 'goya', matn: '4xx — so‘rovni tuzatish kerak (URL, autentifikatsiya), 5xx — server tomonini (ilova, proxy) tekshirish kerak.' },
      faktlar: [['TCP', 'ulandi'], ['Javob', '502 Bad Gateway'], ['Vaqt', `${ms(get502, r502)} ms`]],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        { tur: 'teg', tugun: 'klient', matn: null },
        pk(get502, 'GET /tashqi', [], 'sorov'),
        pk(r502, '502', ['backend yo‘q'], 'javob'),
      ],
    },
    {
      qisqa: 'Xulosa', nishon: 'xulosa',
      sarlavha: 'Pastdan yuqoriga',
      matn: [
        'Besh nosozlik — besh xil iz: DNS’da “No such name”, TCP’da darhol RST yoki uzoq jimlik, TLS’da kelishuvdan keyin yopilish, HTTP’da 5xx kod.',
        'Kitobdagi tartib: pastdan yuqoriga — DNS → TCP → TLS → HTTP → brauzer. Ilova kodini tuzatishdan oldin pastki qatlamlar ishlayotganiga ishonch hosil qiling (Web asoslari, 30-bob).',
      ],
      callout: { tur: 'maslahat', matn: 'Brauzer qatlamidagi nosozliklar (CORS, aralash kontent, CSP) tarmoqda ko‘pincha “hammasi joyida” bo‘lib ko‘rinadi — ular brauzer konsolida (CORS darsi va keyingilari).' },
      korinadi: KORINADI,
      kamera: KORINADI,
      kartalar: [{
        sarlavha: 'Yozuvdan: belgi va vaqt',
        qatorlar: [
          ['DNS', `NXDOMAIN · ${ms(nxSorov, nxJavob)} ms`],
          ['TCP yopiq', `RST · ${ms(syn8080, rst)} ms`],
          ['TCP devor', 'jimlik · 4000 ms', true],
          ['TLS', `nom ${sertNomi} · (60)`],
          ['HTTP', `502 · ${ms(get502, r502)} ms`],
        ],
        joy: 'yuqori-chap',
        izoh: 'klient tomonida',
      }],
      hodisalar: [],
    },
  ],
}
