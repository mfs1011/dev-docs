// "TCP ulanishi" — Paket yo'li darsi. Paketlar VPS laboratoriyasidagi haqiqiy yozuvdan
// (paket-lab/ssenariy/tcp.sh → tshark → scripts/paket/aylantir.mjs). Raqamlar (port, Seq/Ack, hajm, vaqt) yozuvdan
// hisoblanadi, qo'lda yozilmaydi. docs/vizualizator/paket-yoli.md 4.1 (3-dars)
import yozuv from '../paket/yozuvlar/tcp.json'

const P = yozuv.paketlar
const top = (re, dan = 0) => {
  const p = P.find((x) => x.n > dan && re.test(x.info))
  if (!p) throw new Error(`tcp: yozuvda topilmadi: ${re}`)
  return p
}
const VEB = '203.0.113.10'
const syn = top(/ → 80 \[SYN\] Seq=0/)
const synack = top(/\[SYN, ACK\]/)
const ack = top(/\[ACK\] Seq=1 Ack=1 /, synack.n)
const get = top(/GET \/ HTTP\/1\.1/)
const getAck = top(/^80 → \d+ \[ACK\]/, get.n)
const ok = top(/HTTP\/1\.1 200 OK/)
const okAck = top(/→ 80 \[ACK\]/, ok.n)
const fin1 = top(/\[FIN, ACK\]/, ok.n)
const fin2 = top(/\[FIN, ACK\]/, fin1.n)
const oxirgiAck = top(/\[ACK\]/, fin2.n)
const syn81 = top(/ → 81 \[SYN\]/)
const rst = top(/\[RST, ACK\]/, syn81.n)
// javob tanasining davomi va ularga klient ACK'lari (200 OK dan keyin, FIN dan oldin)
const oraliq = P.filter((x) => x.n > okAck.n && x.n < fin1.n)

const port = syn.info.match(/^(\d+)/)[1]
const port81 = syn81.info.match(/^(\d+)/)[1]
const son = (p, k) => Number(p.info.match(new RegExp(`${k}=(\\d+)`))?.[1])
const maydon = (p, k) => {
  let topildi = null
  const yur = (f) => { if (f.k === k) topildi = f; (f.m ?? []).forEach(yur) }
  p.qatlamlar.forEach(yur)
  return topildi
}
const yuk = (p) => Number(maydon(p, 'tcp.len')?.s.match(/(\d+)/)?.[1] ?? 0)
const ms = (a, b) => `${Math.round((b.t - a.t) * 1000)} ms`
const oxirgiMalumot = oraliq.filter((x) => x.src === VEB).at(-1) ?? ok
const jamiTana = son(okAck, 'Ack') - 1 + oraliq.filter((x) => x.src === VEB).reduce((s, x) => s + yuk(x), 0)

const pk = (p, yorliq, qatorlar, rang, qoshimcha = {}) => {
  const [dan, ga] = p.src === VEB ? ['veb', 'klient'] : ['klient', 'veb']
  return { tur: 'paket', n: p.n, yorliq, qatorlar, rang, dan, ga, ...qoshimcha }
}

export default {
  id: 'tcp',
  tur: 'paket',
  sarlavha: 'TCP ulanishi',
  shior: 'Uch qadamli kelishuv, tasdiq raqamlari, yopilish va yopiq port — paketma-paket.',
  daraja: 'boshlang‘ich',
  daqiqa: 7,
  yozuv,
  kitob: [
    { yol: '/web-asoslari/03-ip-port-tcp', nom: 'Web asoslari, 03: IP, port va TCP' },
    { yol: '/web-asoslari/01-veb-qanday-ishlaydi', nom: 'Web asoslari, 01: Veb qanday ishlaydi' },
  ],
  manba: [
    { nom: 'RFC 9293 — TCP (3.5 ulanish o‘rnatish)', url: 'https://www.rfc-editor.org/rfc/rfc9293#section-3.5' },
    { nom: 'RFC 9293 — 3.5.2 RST qachon yuboriladi', url: 'https://www.rfc-editor.org/rfc/rfc9293#section-3.5.2' },
    { nom: 'RFC 9293 — 3.6 ulanishni yopish', url: 'https://www.rfc-editor.org/rfc/rfc9293#section-3.6' },
    { nom: 'RFC 7323 — vaqt belgisi va oyna masshtabi', url: 'https://www.rfc-editor.org/rfc/rfc7323' },
  ],
  sinov: `Yozuv: VPS laboratoriyasi (paket-lab/), \`curl --http1.1 http://203.0.113.10/\` va yopiq 81-portga \`curl\`, tcpdump klient tomonida. Router ikki tomonga 10 ms kechikish qo‘shadi (tc netem). ${yozuv.versiyalar.slice(0, 1).join('')} · curl 7.88.1 · nginx 1.30.6 · TShark 4.6.4.`,
  trenajor: { yol: '/web-asoslari/trenajor', nom: 'HTTP laboratoriyasida o‘zingiz yuboring' },
  protokol: {
    izoh: 'TCP — ishonchli oqim: IP paketlari yo‘qolishi yoki tartibi buzilishi mumkin, TCP esa har baytni raqamlaydi, tasdiqlaydi va kerak bo‘lsa qayta yuboradi. Ilova (HTTP) uchun bu — uzluksiz bayt oqimi.',
    faktlar: [['Qatlam', 'transport'], ['Manzil', 'IP + port'], ['Ulanish', 'SYN → SYN-ACK → ACK'], ['Yopish', 'FIN va ACK (har yo‘nalish alohida)'], ['Standart', 'RFC 9293']],
  },
  organasiz: [
    { matn: 'Uch qadamli kelishuv: nega aynan uchta paket', qadam: 2 },
    { matn: 'Seq va Ack: bayt hisobi qanday yuritiladi', qadam: 4 },
    { matn: 'Ulanish qanday yopiladi', qadam: 5 },
    { matn: 'Yopiq portga ulanish: RST', qadam: 6 },
  ],
  afsona: [{ k: 'sorov', nom: 'klient ma’lumoti' }, { k: 'javob', nom: 'server ma’lumoti' }, { k: 'ulanish', nom: 'TCP boshqaruvi' }, { k: 'xato', nom: 'RST' }],
  ishtirokchilar: ['klient', 'veb'],
  tugunlar: {
    klient: { ikonka: 'noutbuk', nom: 'Klient', izoh: '192.168.1.10', x: 130, y: 330 },
    router: { ikonka: 'router', nom: 'Router', izoh: '192.168.1.1', x: 420, y: 330 },
    veb: { ikonka: 'server', nom: 'Veb-server', izoh: '203.0.113.10:80', x: 740, y: 330 },
  },
  chiziqlar: [['klient', 'router'], ['router', 'veb']],
  yollar: {
    'klient>veb': ['klient', 'router', 'veb'], 'veb>klient': ['veb', 'router', 'klient'],
  },
  qadamlar: [
    {
      qisqa: 'Nega', nishon: 'sozlash',
      sarlavha: 'IP paketni yetkazadi, lekin kafolat bermaydi',
      matn: [
        'IP har paketni alohida manzilga olib boradi. Yo‘lda paket yo‘qolishi, ikki marta kelishi yoki tartibi almashishi mumkin — IP buni bilmaydi.',
        'Veb sahifa esa butun va to‘g‘ri tartibda kerak. Bu ishni **TCP** bajaradi: har baytni raqamlaydi, qabul qiluvchi “shu raqamgacha oldim” deb tasdiqlaydi, kelmaganini qayta yuboradi.',
      ],
      callout: { tur: 'goya', matn: 'TCP’da ma’lumot yuborishdan oldin **ulanish** ochiladi: ikki tomon bir-birining boshlang‘ich raqamini bilib olishi kerak.' },
      faktlar: [['Klient', '192.168.1.10'], ['Server', '203.0.113.10:80'], ['Transport', 'TCP']],
      korinadi: ['klient', 'router', 'veb'],
      kamera: ['klient', 'router', 'veb'],
      hodisalar: [],
    },
    {
      qisqa: 'SYN', nishon: 'texnika',
      sarlavha: 'Uch qadamli kelishuv',
      matn: [
        `Klient **SYN** (“ulanaylik”) yuboradi: o‘zi uchun vaqtinchalik port **${port}** oldi, server porti — 80. Server **SYN-ACK** (“mayli, men ham”) bilan javob beradi, klient **ACK** (“kelishdik”) bilan tasdiqlaydi.`,
        `Nega uchta? Har tomon o‘z boshlang‘ich raqamini aytishi (SYN) va qarshi tomonnikini tasdiqlashi (ACK) kerak. Server o‘z SYN va ACK’ini bitta paketda yuboradi. Kelishuv ${ms(syn, ack)} oldi — bitta borib-kelish.`,
      ],
      callout: { tur: 'maslahat', matn: 'SYN paketini bosing: parametrlarda tomonlar imkoniyatini aytadi — eng katta segment (MSS 1460), SACK, vaqt belgisi, oyna masshtabi. Bu faqat ulanish boshida bo‘ladi.' },
      faktlar: [['Klient porti', `${port} (vaqtinchalik)`], ['Server porti', '80'], ['Kelishuv', 'SYN → SYN-ACK → ACK'], ['Vaqt', ms(syn, ack)]],
      korinadi: ['klient', 'router', 'veb'],
      kamera: ['klient', 'router', 'veb'],
      hodisalar: [
        pk(syn, 'SYN', [`${port} → 80`, 'Seq=0'], 'ulanish'),
        pk(synack, 'SYN-ACK', ['Seq=0', 'Ack=1'], 'ulanish'),
        pk(ack, 'ACK', ['Seq=1', 'Ack=1'], 'ulanish'),
        { tur: 'teg', tugun: 'veb', matn: 'ulanish ochiq', rang: 'insight' },
      ],
    },
    {
      qisqa: 'Raqamlar', nishon: 'tushuncha',
      sarlavha: 'Nega Ack=1, agar ma’lumot yo‘q bo‘lsa?',
      matn: [
        'Wireshark raqamlarni qulaylik uchun 0 dan ko‘rsatadi (nisbiy). Haqiqiy boshlang‘ich raqam tasodifiy katta son — inspektorda “xom” qiymati ko‘rinadi. Tasodifiy bo‘lishi begona odam soxta paket bilan ulanishga aralasha olmasligi uchun.',
        '**SYN bitta raqamni egallaydi**, garchi unda ma’lumot bo‘lmasa ham. Shuning uchun javob `Ack=1`: “0-raqamni (SYN’ingni) oldim, keyingi 1-raqamni kutaman”.',
      ],
      callout: { tur: 'goya', matn: 'Qoidani eslab qoling: **Ack = olingan oxirgi bayt + 1**, ya’ni “keyingi kutayotganim”. SYN va FIN ham bittadan raqam egallaydi.' },
      faktlar: [['SYN', 'Seq=0'], ['SYN-ACK', 'Seq=0, Ack=1'], ['ACK', 'Seq=1, Ack=1']],
      korinadi: ['klient', 'router', 'veb'],
      kamera: ['klient', 'router', 'veb'],
      hodisalar: [],
    },
    {
      qisqa: 'Ma’lumot', nishon: 'texnika',
      sarlavha: 'Ma’lumot va tasdiq: bayt hisobi',
      matn: [
        `Klient \`GET\` so‘rovini yubordi — ${yuk(get)} bayt (1–${yuk(get)}-baytlar). Server javobida **Ack=${son(getAck, 'Ack')}**: “${yuk(get)} baytgacha hammasini oldim”.`,
        `Server javobi sarlavhalari bilan ${yuk(ok)} bayt — klient **Ack=${son(okAck, 'Ack')}** deydi. Keyin tana bo‘laklari keladi, har biriga klient tasdiq yuboradi: Ack ${oraliq.filter((x) => x.src !== VEB).map((x) => son(x, 'Ack')).join(' → ')}.`,
      ],
      callout: { tur: 'maslahat', matn: `Bitta segmentda ko‘pi bilan 1448 bayt ma’lumot: MSS 1460 dan vaqt belgisi parametri (12 bayt) chiqadi. Server jami ${jamiTana} bayt yubordi.` },
      faktlar: [['So‘rov', `${yuk(get)} B → Ack=${son(getAck, 'Ack')}`], ['Javob boshi', `${yuk(ok)} B → Ack=${son(okAck, 'Ack')}`], ['Bo‘laklar', `${oraliq.filter((x) => x.src === VEB).length} ta`], ['Jami yuklab olindi', `${jamiTana} B`]],
      korinadi: ['klient', 'router', 'veb'],
      kamera: ['klient', 'router', 'veb'],
      hodisalar: [
        pk(get, 'GET /', [`${yuk(get)} B`, 'Seq=1'], 'sorov'),
        pk(getAck, 'ACK', [`Ack=${son(getAck, 'Ack')}`], 'ulanish'),
        pk(ok, '200 OK', [`${yuk(ok)} B`, 'Seq=1'], 'javob'),
        pk(okAck, 'ACK', [`Ack=${son(okAck, 'Ack')}`], 'ulanish'),
        ...oraliq.map((p) => (p.src === VEB
          ? pk(p, 'TANA', [`${yuk(p)} B`, `Seq=${son(p, 'Seq')}`], 'javob', { ms: 600 })
          : pk(p, 'ACK', [`Ack=${son(p, 'Ack')}`], 'ulanish', { ms: 500 }))),
        { tur: 'teg', tugun: 'klient', matn: `${jamiTana} B olindi ✓`, rang: 'ok' },
      ],
    },
    {
      qisqa: 'Yopish', nishon: 'texnika',
      sarlavha: 'Ulanishni yopish',
      matn: [
        `Har tomon o‘z yo‘nalishini alohida yopadi. Klient **FIN** yubordi (“men yuborib bo‘ldim”, Seq=${son(fin1, 'Seq')}). Server FIN’ni ACK bilan birga qaytardi — **Ack=${son(fin2, 'Ack')}**: FIN ham bitta raqam egalladi.`,
        `Oxirgi ACK bilan ulanish yopildi. Shuning uchun 4 emas, **3 paket** — xuddi kelishuvdagidek, server ikki ishni bitta paketda qildi.`,
      ],
      callout: { tur: 'goya', matn: 'FIN — “men tugatdim”, lekin “sen ham to‘xta” emas. Bir tomon yopgach, ikkinchisi hali ma’lumot yuborishi mumkin (yarim yopiq ulanish).' },
      faktlar: [['Klient FIN', `Seq=${son(fin1, 'Seq')}`], ['Server FIN-ACK', `Ack=${son(fin2, 'Ack')}`], ['Paketlar', '3 ta'], ['Vaqt', ms(fin1, oxirgiAck)]],
      korinadi: ['klient', 'router', 'veb'],
      kamera: ['klient', 'router', 'veb'],
      hodisalar: [
        { tur: 'teg', tugun: 'klient', matn: null },
        pk(fin1, 'FIN', [`Seq=${son(fin1, 'Seq')}`], 'ulanish'),
        pk(fin2, 'FIN-ACK', [`Ack=${son(fin2, 'Ack')}`], 'ulanish'),
        pk(oxirgiAck, 'ACK', [`Ack=${son(oxirgiAck, 'Ack')}`], 'ulanish'),
        { tur: 'teg', tugun: 'veb', matn: 'ulanish yopiq', rang: 'info' },
      ],
    },
    {
      qisqa: 'RST', nishon: 'muammo',
      sarlavha: 'Yopiq port: darhol rad',
      matn: [
        `Endi klient **81-portga** ulanmoqchi (vaqtinchalik port ${port81}). U yerda hech qanday xizmat tinglamayapti.`,
        `Server SYN-ACK o‘rniga **RST** (reset) qaytardi — “bu portda hech kim yo‘q”. RFC 9293 qoidasi: ulanish mavjud bo‘lmasa, kelgan segmentga RST yuboriladi. \`curl\` ${ms(syn81, rst)} da “Couldn't connect to server” dedi — kutmasdan.`,
      ],
      callout: { tur: 'ogoh', matn: 'RST tez javob — klient kutib qolmaydi. Firewall paketni jimgina tashlasa (DROP), RST ham kelmaydi va klient javob kutib qoladi — bu alohida dars mavzusi (“Firewall: DROP va REJECT”).' },
      faktlar: [['Port', '81 (yopiq)'], ['Javob', '`RST, ACK`'], ['Vaqt', ms(syn81, rst)], ['curl', '`(7) Couldn’t connect`']],
      korinadi: ['klient', 'router', 'veb'],
      kamera: ['klient', 'router', 'veb'],
      hodisalar: [
        { tur: 'teg', tugun: 'veb', matn: null },
        pk(syn81, 'SYN', [`${port81} → 81`], 'ulanish'),
        pk(rst, 'RST', ['bu portda hech kim yo‘q'], 'xato'),
        { tur: 'teg', tugun: 'klient', matn: 'ulanib bo‘lmadi', rang: 'xato' },
      ],
    },
    {
      qisqa: 'Xulosa', nishon: 'xulosa',
      sarlavha: 'Bitta ulanishning butun hayoti',
      matn: [
        `Bitta sahifa uchun ${P.filter((x) => x.n <= oxirgiAck.n).length} ta paket: 3 tasi kelishuv, 3 tasi yopilish, qolgani ma’lumot va tasdiqlar. Ma’lumotning o‘zi ${jamiTana + yuk(get)} bayt, lekin yo‘lda har paketga ~66 bayt sarlavha qo‘shiladi.`,
        'Har yangi ulanish kamida bitta borib-kelishga tushadi. Shuning uchun brauzer ulanishni yopmay qayta ishlatadi (keep-alive), HTTP/2 esa bitta ulanishda ko‘p so‘rov yuboradi.',
      ],
      callout: { tur: 'goya', matn: 'O‘zingiz ko‘ring: `sudo tcpdump -i lo -n port 8080` va boshqa oynada `curl localhost:8080` — Web asoslari, 03-bob.' },
      korinadi: ['klient', 'router', 'veb'],
      kamera: ['klient', 'router', 'veb'],
      kartalar: [{
        sarlavha: 'Yozuvdan: ulanish bosqichlari',
        qatorlar: [
          ['kelishuv (SYN → ACK)', ms(syn, ack)],
          ['so‘rov → javob boshi', ms(get, ok)],
          ['tanani yuklash', ms(ok, oxirgiMalumot)],
          ['yopilish', ms(fin1, oxirgiAck)],
          ['yopiq port: SYN → RST', ms(syn81, rst), true],
        ],
        joy: 'yuqori-chap',
        izoh: 'klient tomonida o‘lchangan',
      }],
      hodisalar: [{ tur: 'teg', tugun: 'klient', matn: null }],
    },
  ],
}
