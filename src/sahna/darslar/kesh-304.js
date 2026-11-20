// "Kesh va 304" — Paket yo'li darsi. Paketlar VPS laboratoriyasidagi haqiqiy yozuvdan (paket-lab/ssenariy/kesh-304.sh:
// curl --etag-save → curl --etag-compare; nginx statik fayl). Qiymatlar (ETag, hajmlar, vaqtlar) yozuvdan hisoblanadi.
// docs/vizualizator/paket-yoli.md 4.1 (7-dars)
import yozuv from '../paket/yozuvlar/kesh-304.json'

const P = yozuv.paketlar
const VEB = '203.0.113.10'
const top = (re, dan = 0) => {
  const p = P.find((x) => x.n > dan && re.test(x.info))
  if (!p) throw new Error(`kesh-304: yozuvda topilmadi: ${re}`)
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
  const s = [...maydonlar(p, 'http.response.line'), ...maydonlar(p, 'http.request.line')].find((x) => x.startsWith(`${nom}:`))
  return s ? qiymat(s) : null
}

const syn1 = top(/ → 80 \[SYN\]/)
const get1 = top(/^GET \//)
const ok = top(/HTTP\/1\.1 200 OK/)
const fin1 = top(/ → 80 \[FIN, ACK\]/, ok.n)
const syn2 = top(/ → 80 \[SYN\]/, fin1.n)
const ack2 = top(/ → 80 \[ACK\] Seq=1 Ack=1 /, syn2.n)
const get2 = top(/^GET \//, syn2.n)
const r304 = top(/304 Not Modified/)
const okTana = P.filter((x) => x.src === VEB && x.n > ok.n && x.n < fin1.n && /Len=[1-9]|200 OK/.test(x.info))

const etag = sarlavha(ok, 'ETag')
const lastMod = qiymat(maydonlar(ok, 'http.last_modified')[0])
const hajm = Number(qiymat(maydonlar(ok, 'http.content_length_header')[0]))
const inm = sarlavha(get2, 'If-None-Match')
const etag304 = sarlavha(r304, 'ETag')
// bu yozuvda ETag ikki qismdan: o'n oltilik vaqt va o'n oltilik hajm (kuzatuv, nginx hujjatida format yozilmagan)
const [etagVaqt, etagHajm] = etag.replace(/"/g, '').split('-').map((h) => parseInt(h, 16))
const etagHajmMos = etagHajm === hajm
const etagVaqtMos = new Date(etagVaqt * 1000).toUTCString() === lastMod

// har ulanishda serverdan kelgan baytlar va paketlar (simdagi kadr hajmi)
// 1-ulanish — 1-SYN dan 2-SYN gacha, 2-ulanish — 2-SYN dan oxirigacha (ular vaqtda kesishmaydi)
const ulanish = (dan, gacha = Infinity) => P.filter((x) => x.src === VEB && x.t >= dan.t && x.t < gacha)
const u1 = ulanish(syn1, syn2.t)
const u2 = ulanish(syn2)
const bayt = (r) => r.reduce((s, x) => s + x.len, 0)
const ms = (a, b) => `${Math.round((b.t - a.t) * 1000)} ms`

const pk = (p, yorliq, qatorlar, rang, qoshimcha = {}) => {
  const [dan, ga] = p.src === VEB ? ['veb', 'klient'] : ['klient', 'veb']
  return { tur: 'paket', n: p.n, yorliq, qatorlar, rang, dan, ga, ...qoshimcha }
}

export default {
  id: 'kesh-304',
  tur: 'paket',
  sarlavha: 'Kesh va 304',
  shior: 'ETag bilan shartli so‘rov: fayl o‘zgarmagan bo‘lsa, server tanani qayta yubormaydi.',
  daraja: 'boshlang‘ich',
  daqiqa: 6,
  yozuv,
  kitob: [
    { yol: '/web-asoslari/11-http-keshlash', nom: 'Web asoslari, 11: HTTP keshlash' },
  ],
  manba: [
    { nom: 'RFC 9110 — 8.8.3 ETag', url: 'https://www.rfc-editor.org/rfc/rfc9110#section-8.8.3' },
    { nom: 'RFC 9110 — 13.1.2 If-None-Match', url: 'https://www.rfc-editor.org/rfc/rfc9110#section-13.1.2' },
    { nom: 'RFC 9110 — 15.4.5 304 Not Modified', url: 'https://www.rfc-editor.org/rfc/rfc9110#section-15.4.5' },
    { nom: 'RFC 9111 — HTTP keshlash', url: 'https://www.rfc-editor.org/rfc/rfc9111' },
  ],
  sinov: `Yozuv: VPS laboratoriyasi (paket-lab/), \`curl --etag-save\` (1-so‘rov) va \`curl --etag-compare\` (2-so‘rov, 1 soniyadan keyin) — brauzer keshi o‘rnida. nginx statik fayl, sozlamasiz. Router ikki tomonga 10 ms kechikish qo‘shadi. ${yozuv.versiyalar.filter((v) => /^(sana|curl|nginx version|TShark)/.test(v)).map((v) => v.replace(/ \(x86.*$/, '')).join(' · ')}`,
  trenajor: { yol: '/web-asoslari/trenajor', nom: 'HTTP laboratoriyasida o‘zingiz yuboring' },
  protokol: {
    izoh: 'HTTP keshi: klient javobni saqlaydi va keyingi safar serverdan “o‘zgardimi?” deb so‘raydi. O‘zgarmagan bo‘lsa — 304, tanasiz. Validator — ETag (versiya belgisi) yoki Last-Modified (o‘zgargan vaqt).',
    faktlar: [['Validator', 'ETag, Last-Modified'], ['Shartli so‘rov', 'If-None-Match, If-Modified-Since'], ['Javob', '304 Not Modified'], ['Standart', 'RFC 9110, 9111']],
  },
  organasiz: [
    { matn: 'ETag nima va server uni qayerdan oladi', qadam: 2 },
    { matn: 'Shartli so‘rov: If-None-Match', qadam: 3 },
    { matn: '304 nima tejaydi va nima tejamaydi', qadam: 5 },
  ],
  afsona: [{ k: 'sorov', nom: 'so‘rov' }, { k: 'javob', nom: 'javob' }, { k: 'ulanish', nom: 'TCP boshqaruvi' }],
  ishtirokchilar: ['klient', 'veb'],
  tugunlar: {
    klient: { ikonka: 'noutbuk', nom: 'Klient', izoh: '192.168.1.10', x: 130, y: 330 },
    router: { ikonka: 'router', nom: 'Router', izoh: '192.168.1.1', x: 420, y: 330 },
    veb: { ikonka: 'server', nom: 'Veb-server', izoh: 'sayt.test · 80', x: 740, y: 330 },
  },
  chiziqlar: [['klient', 'router'], ['router', 'veb']],
  yollar: {
    'klient>veb': ['klient', 'router', 'veb'], 'veb>klient': ['veb', 'router', 'klient'],
  },
  qadamlar: [
    {
      qisqa: 'Birinchi', nishon: 'sozlash',
      sarlavha: 'Birinchi so‘rov: butun sahifa',
      matn: [
        `Klient sahifani birinchi marta so‘radi. Server **200 OK** va butun tanani berdi — ${hajm} bayt, ${okTana.length} ta TCP segmentida.`,
        `Javobda ikkita muhim sarlavha: **\`ETag: ${etag}\`** va **\`Last-Modified: ${lastMod}\`**. Ular sahifa versiyasini bildiradi — klient shu javob bilan birga saqlaydi.`,
      ],
      callout: { tur: 'maslahat', matn: '200 OK paketini oching: `ETag` va `Last-Modified` qatorlari. nginx statik faylga ularni o‘zi qo‘shadi — sozlash shart emas.' },
      faktlar: [['Javob', '200 OK'], ['Tana', `${hajm} B`], ['ETag', etag], ['Last-Modified', lastMod]],
      korinadi: ['klient', 'router', 'veb'],
      kamera: ['klient', 'router', 'veb'],
      hodisalar: [
        pk(get1, 'GET /', ['Host: sayt.test'], 'sorov'),
        pk(ok, '200 OK', [`ETag: ${etag}`, `${hajm} B tana`], 'javob'),
        { tur: 'teg', tugun: 'klient', matn: 'keshga saqlandi', rang: 'ok' },
      ],
    },
    {
      qisqa: 'ETag', nishon: 'tushuncha',
      sarlavha: 'ETag — versiya belgisi',
      matn: [
        '**ETag** (entity tag) — server bergan qisqa belgi: fayl o‘zgarsa, belgi ham o‘zgaradi. Uning ichida nima borligi klientni qiziqtirmaydi — klient uni faqat solishtirish uchun qaytaradi (RFC 9110, 8.8.3).',
        etagHajmMos && etagVaqtMos
          ? `Bu yozuvda nginx ETag’i ikki o‘n oltilik sondan: \`${etag.replace(/"/g, '').split('-')[0]}\` = ${lastMod} (Last-Modified bilan bir xil), \`${etag.replace(/"/g, '').split('-')[1]}\` = ${hajm} (fayl hajmi). Fayl tahrirlansa, kamida vaqt qismi o‘zgaradi — demak ETag ham.`
          : 'nginx ETag’ni faylning o‘zidan hisoblaydi.',
      ],
      callout: { tur: 'goya', matn: 'Bu — kuzatuv, standart emas: nginx hujjatida ETag formati yozilmagan, boshqa server ETag’ni butunlay boshqacha (masalan, mazmun xeshi) yasashi mumkin.' },
      faktlar: [['ETag', etag], ['Last-Modified', lastMod], ['Fayl hajmi', `${hajm} B`]],
      korinadi: ['klient', 'router', 'veb'],
      kamera: ['klient', 'router', 'veb'],
      hodisalar: [{ tur: 'teg', tugun: 'klient', matn: `ETag ${etag}`, rang: 'insight' }],
    },
    {
      qisqa: 'Shartli', nishon: 'texnika',
      sarlavha: 'Shartli so‘rov: “o‘zgardimi?”',
      matn: [
        `Bir soniyadan keyin klient yana so‘radi — yangi TCP ulanish (${ms(syn2, ack2)}) va GET, lekin endi **\`If-None-Match: ${inm}\`** bilan: “menda shu versiya bor; o‘zgarmagan bo‘lsa, tanani yubormang”.`,
        'curl buni `--etag-compare` bilan qildi: saqlangan ETag’ni o‘qib, sarlavhaga qo‘ydi. Brauzer xuddi shuni o‘z keshidan qiladi.',
      ],
      callout: { tur: 'maslahat', matn: 'Ikki GET’ni solishtiring: ikkinchisida bitta qator ortiq — `If-None-Match`. Brauzer `Last-Modified` uchun `If-Modified-Since` ham yuboradi.' },
      faktlar: [['Sarlavha', `If-None-Match: ${inm}`], ['Ulanish', 'yangi TCP'], ['Oraliq', ms(get1, get2)]],
      korinadi: ['klient', 'router', 'veb'],
      kamera: ['klient', 'router', 'veb'],
      hodisalar: [
        { tur: 'teg', tugun: 'klient', matn: null },
        pk(get2, 'GET / (SHARTLI)', [`If-None-Match: ${inm}`], 'sorov'),
      ],
    },
    {
      qisqa: '304', nishon: 'texnika',
      sarlavha: '304 Not Modified — tanasiz',
      matn: [
        `ETag mos keldi — server **304 Not Modified** qaytardi. Faqat sarlavhalar, tana yo‘q: “sendagi nusxa hali to‘g‘ri, o‘shani ishlat”. Javob ${ms(get2, r304)} da.`,
        `Javobda yana \`ETag: ${etag304}\` bor — RFC 9110 304 da ETag’ni yuborishni talab qiladi, klient keshini yangilashi uchun.`,
      ],
      callout: { tur: 'goya', matn: 'RFC 9110, 15.4.5: 304 — “200 bo‘lardi, lekin shart bajarilmadi”. Klient keshdagi nusxani xuddi 200 javobning tanasi kabi ishlatadi.' },
      faktlar: [['Kod', '304 Not Modified'], ['Tana', '0 B'], ['ETag', etag304], ['Vaqt', ms(get2, r304)]],
      korinadi: ['klient', 'router', 'veb'],
      kamera: ['klient', 'router', 'veb'],
      hodisalar: [
        pk(r304, '304 NOT MODIFIED', ['tana yo‘q'], 'javob'),
        { tur: 'teg', tugun: 'klient', matn: 'keshdan ✓', rang: 'ok' },
      ],
    },
    {
      qisqa: 'Tejash', nishon: 'xulosa',
      sarlavha: 'Nima tejaldi, nima tejalmadi',
      matn: [
        `Serverdan kelgan baytlar: 1-ulanishda **${bayt(u1)} B** (${u1.length} paket), 2-ulanishda **${bayt(u2)} B** (${u2.length} paket). Tana qancha katta bo‘lsa (rasm, skript), tejash shuncha katta.`,
        'Lekin borib-kelish tejalmadi: TCP kelishuvi va so‘rov-javob baribir bo‘ldi. Uni ham tejash uchun server `Cache-Control: max-age=…` beradi — shu muddat ichida klient serverdan umuman so‘ramaydi (Web asoslari, 11-bob).',
      ],
      callout: { tur: 'ogoh', matn: 'Bu yozuvda nginx `Cache-Control` bermadi — shuning uchun brauzer har safar tekshiradi yoki o‘zi taxmin qiladi. Muddatni ochiq belgilash yaxshiroq.' },
      korinadi: ['klient', 'router', 'veb'],
      kamera: ['klient', 'router', 'veb'],
      kartalar: [{
        sarlavha: 'Yozuvdan: server yubordi',
        qatorlar: [
          ['1-so‘rov: 200 OK', `${bayt(u1)} B · ${u1.length} paket`],
          ['2-so‘rov: 304', `${bayt(u2)} B · ${u2.length} paket`],
          ['GET → javob (200)', ms(get1, ok)],
          ['GET → javob (304)', ms(get2, r304)],
          ['tejaldi', `${bayt(u1) - bayt(u2)} B`, true],
        ],
        joy: 'yuqori-chap',
        izoh: 'kadrlar hajmi, klient tomonida o‘lchangan',
      }],
      hodisalar: [{ tur: 'teg', tugun: 'klient', matn: null }],
    },
  ],
}
