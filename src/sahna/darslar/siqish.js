// "Siqish va qism" — Paket yo'li darsi. Paketlar VPS laboratoriyasidagi haqiqiy yozuvdan (paket-lab/ssenariy/siqish.sh:
// bitta TCP ulanishda uch GET — oddiy, Accept-Encoding: gzip, Range: bytes=0-99; nginx gzip on, gzip_vary on).
// Qiymatlar (hajmlar, sarlavhalar, vaqtlar) yozuvdan hisoblanadi.
// docs/vizualizator/paket-yoli.md 4.1 (8-dars)
import yozuv from '../paket/yozuvlar/siqish.json'

const P = yozuv.paketlar
const VEB = '203.0.113.10'
const top = (re, dan = 0) => {
  const p = P.find((x) => x.n > dan && re.test(x.info))
  if (!p) throw new Error(`siqish: yozuvda topilmadi: ${re}`)
  return p
}
const maydonlar = (p, k) => {
  const r = []
  const yur = (f) => { if (f.k === k) r.push(f.s); (f.m ?? []).forEach(yur) }
  p.qatlamlar.forEach(yur)
  return r
}
const qiymat = (s) => s.slice(s.indexOf(':') + 1).replace(/\\r\\n$/, '').trim()
const bitta = (p, k) => { const s = maydonlar(p, k)[0]; return s ? qiymat(s) : null }
const sarlavha = (p, nom) => {
  const s = [...maydonlar(p, 'http.response.line'), ...maydonlar(p, 'http.request.line')].find((x) => x.startsWith(`${nom}:`))
  return s ? qiymat(s) : null
}

const syn = top(/ → 80 \[SYN\]/)
const get1 = top(/^GET \//)
const ok1 = top(/HTTP\/1\.1 200 OK/, get1.n)
const get2 = top(/^GET \//, get1.n)
const ok2 = top(/HTTP\/1\.1 200 OK/, get2.n)
const get3 = top(/^GET \//, get2.n)
const r206 = top(/206 Partial Content/, get3.n)
const fin = top(/ → 80 \[FIN, ACK\]/, r206.n)

// har javobda serverdan kelgan ma'lumotli paketlar (bo'sh ACK'larsiz): GET dan keyingi GET gacha
const javob = (dan, gacha) => P.filter((x) => x.src === VEB && x.n > dan.n && x.n < gacha.n && !/\[ACK\] Seq=\d+ Ack=\d+ Win=\d+ Len=0/.test(x.info))
const j1 = javob(get1, get2)
const j2 = javob(get2, get3)
const j3 = javob(get3, fin)
const bayt = (r) => r.reduce((s, x) => s + x.len, 0)
const ms = (a, b) => `${Math.round((b.t - a.t) * 1000)} ms`
const synlar = P.filter((x) => / → 80 \[SYN\]/.test(x.info)).length

const tana = Number(bitta(ok1, 'http.content_length_header'))
const etag1 = sarlavha(ok1, 'ETag')
const vary = sarlavha(ok1, 'Vary')
const ranges = sarlavha(ok1, 'Accept-Ranges')
const ae = bitta(get2, 'http.accept_encoding')
const ce = bitta(ok2, 'http.content_encoding')
const te = bitta(ok2, 'http.transfer_encoding')
const etag2 = sarlavha(ok2, 'ETag')
const bolak = Number(bitta(ok2, 'http.chunk_size').match(/\d+/)[0])
const ranges2 = sarlavha(ok2, 'Accept-Ranges')
const cl2 = bitta(ok2, 'http.content_length_header')
const range = bitta(get3, 'http.range')
// eksport TCP qayta yig'ishsiz: sarlavhalar 206 paketida, tana keyingi segmentda ("Continuation")
const r206Tana = j3.find((x) => x.n > r206.n) ?? r206
const crange = bitta(r206, 'http.content_range')
const cl3 = Number(bitta(r206, 'http.content_length_header'))
const nisbat = (tana / bolak).toFixed(1)

const pk = (p, yorliq, qatorlar, rang, qoshimcha = {}) => {
  const [dan, ga] = p.src === VEB ? ['veb', 'klient'] : ['klient', 'veb']
  return { tur: 'paket', n: p.n, yorliq, qatorlar, rang, dan, ga, ...qoshimcha }
}
const KORINADI = ['klient', 'router', 'veb']

export default {
  id: 'siqish',
  tur: 'paket',
  sarlavha: 'Siqish va qism',
  shior: 'Bitta sahifa uch xil: to‘liq, gzip bilan siqilgan va faqat kerakli 100 bayt.',
  daraja: 'boshlang‘ich',
  daqiqa: 6,
  yozuv,
  kitob: [
    { yol: '/web-asoslari/12-siqish-qismli-yuklash', nom: 'Web asoslari, 12: Siqish va qismli yuklash' },
  ],
  manba: [
    { nom: 'RFC 9110 — 8.4 Content-Encoding', url: 'https://www.rfc-editor.org/rfc/rfc9110#section-8.4' },
    { nom: 'RFC 9110 — 12.5.3 Accept-Encoding', url: 'https://www.rfc-editor.org/rfc/rfc9110#section-12.5.3' },
    { nom: 'RFC 9110 — 12.5.5 Vary', url: 'https://www.rfc-editor.org/rfc/rfc9110#section-12.5.5' },
    { nom: 'RFC 9110 — 14 Range so‘rovlari', url: 'https://www.rfc-editor.org/rfc/rfc9110#section-14' },
    { nom: 'RFC 9110 — 15.3.7 206 Partial Content', url: 'https://www.rfc-editor.org/rfc/rfc9110#section-15.3.7' },
    { nom: 'RFC 9112 — 7.1 Chunked', url: 'https://www.rfc-editor.org/rfc/rfc9112#section-7.1' },
    { nom: 'nginx — ngx_http_gzip_module', url: 'https://nginx.org/en/docs/http/ngx_http_gzip_module.html' },
  ],
  sinov: `Yozuv: VPS laboratoriyasi (paket-lab/), bitta \`curl\` buyrug‘ida uch so‘rov (\`--next\` — ulanish qayta ishlatiladi): oddiy, \`-H 'Accept-Encoding: gzip'\`, \`-r 0-99\`. nginx’da \`gzip on; gzip_vary on;\`. Router ikki tomonga 10 ms kechikish qo‘shadi. ${yozuv.versiyalar.filter((v) => /^(sana|curl|nginx version|TShark)/.test(v)).map((v) => v.replace(/ \(x86.*$/, '')).join(' · ')}`,
  trenajor: { yol: '/web-asoslari/trenajor', nom: 'HTTP laboratoriyasida o‘zingiz yuboring' },
  protokol: {
    izoh: 'Klient qaysi siqishni tushunishini aytadi (Accept-Encoding), server tanlaganini aytadi (Content-Encoding). Range bilan esa klient faylning faqat bir qismini so‘raydi — server 206 bilan shu qismni beradi.',
    faktlar: [['Siqish', 'Accept-Encoding → Content-Encoding'], ['Qism', 'Range → 206, Content-Range'], ['Standart', 'RFC 9110, 9112']],
  },
  organasiz: [
    { matn: 'Klient va server siqish haqida qanday kelishadi', qadam: 2 },
    { matn: 'Nega siqilgan javobda Content-Length yo‘q', qadam: 3 },
    { matn: 'Range va 206: faylning bir qismi', qadam: 4 },
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
      qisqa: 'To‘liq', nishon: 'sozlash',
      sarlavha: 'Oddiy so‘rov: butun sahifa',
      matn: [
        `Klient \`GET /\` yubordi — siqish haqida hech narsa demadi. Server sahifani boricha berdi: **\`Content-Length: ${tana}\`**, ${j1.length} ta paketda (sarlavhalar va ${j1.length - 1} ta tana bo‘lagi).`,
        `Javobda yana ikkita sarlavha bor: **\`Accept-Ranges: ${ranges}\`** — “faylni qismlab ham bera olaman” va **\`Vary: ${vary}\`** — “javob so‘rovdagi Accept-Encoding’ga qarab tanlanadi”. Ular keyingi qadamlarda kerak bo‘ladi.`,
      ],
      callout: { tur: 'maslahat', matn: '200 OK paketini oching: `Content-Length`, `Accept-Ranges`, `Vary`. So‘rovda `Accept-Encoding` yo‘q — server siqmadi.' },
      faktlar: [['Javob', '200 OK'], ['Tana', `${tana} B`], ['Paketlar', `${j1.length} ta`], ['Vaqt', ms(get1, ok1)]],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        pk(get1, 'GET /', ['Host: sayt.test'], 'sorov'),
        pk(ok1, '200 OK', [`Content-Length: ${tana}`], 'javob'),
        ...j1.filter((p) => p.n !== ok1.n).map((p, i, a) => pk(p, `TANA ${i + 1}/${a.length}`, [`${p.len} B`], 'javob', { ms: 700 })),
      ],
    },
    {
      qisqa: 'gzip', nishon: 'texnika',
      sarlavha: 'Kelishish: Accept-Encoding → Content-Encoding',
      matn: [
        `Ikkinchi so‘rov **o‘sha TCP ulanishda** ketdi — yangi SYN yo‘q (butun yozuvda SYN ${synlar} ta). Bu safar klient **\`Accept-Encoding: ${ae}\`** qo‘shdi: “gzip’ni ocha olaman”.`,
        `Server rozi bo‘ldi: **\`Content-Encoding: ${ce}\`**. Siqilgan tana **${bolak} bayt** — ${tana} o‘rniga, ${nisbat} marta kichik. Hammasi bitta paketga sig‘di. Ochilgach yana ${tana} bayt bo‘ldi — gzip ma’lumot yo‘qotmaydi.`,
      ],
      callout: { tur: 'ogoh', matn: `Bu sahifada bitta gap ko‘p marta takrorlanadi — gzip takrorni yaxshi siqadi, shuning uchun nisbat juda katta. Oddiy sahifada u kichikroq; JPEG kabi allaqachon siqilgan fayl esa deyarli kichraymaydi (Web asoslari, 12-bob).` },
      faktlar: [['So‘rov', `Accept-Encoding: ${ae}`], ['Javob', `Content-Encoding: ${ce}`], ['Tana', `${bolak} B (ochilgandan keyin ${tana} B)`], ['Vaqt', ms(get2, ok2)]],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        pk(get2, 'GET / (GZIP)', [`Accept-Encoding: ${ae}`], 'sorov'),
        pk(ok2, '200 OK · GZIP', [`Content-Encoding: ${ce}`, `${bolak} B tana`], 'javob'),
        { tur: 'teg', tugun: 'klient', matn: `${bolak} B → ${tana} B`, rang: 'ok' },
      ],
    },
    {
      qisqa: 'Chunked', nishon: 'tushuncha',
      sarlavha: 'Siqilgan javobda nima o‘zgardi',
      matn: [
        cl2 === null && te
          ? `**\`Content-Length\` yo‘q** — o‘rniga **\`Transfer-Encoding: ${te}\`**. nginx sahifani yuborish davomida siqdi, siqilgan hajmni oldindan bilmadi. Chunked’da tana bo‘laklarda keladi, har biri o‘z hajmi bilan: bu yerda bitta ${bolak} baytli bo‘lak va hajmi 0 bo‘lgan yakuniy bo‘lak (RFC 9112, 7.1).`
          : `Javob sarlavhalarini birinchi javob bilan solishtiring.`,
        `ETag ham o‘zgardi: \`${etag1}\` → **\`${etag2}\`**. \`W/\` — **kuchsiz** (weak) validator: “mazmuni o‘sha”, lekin baytma-bayt bir xillikka kafolat yo‘q (RFC 9110, 8.8.1).${ranges2 === null ? ' `Accept-Ranges` esa yo‘q — bu javobda nginx qismlab berishni taklif qilmadi.' : ''}`,
      ],
      callout: { tur: 'goya', matn: 'Bu — nginx’ning shu yozuvdagi xatti-harakati (kuzatildi). Chunked bo‘lakni ochib ko‘ring: `Chunk size`, keyin `1f8b…` bilan boshlanuvchi baytlar — gzip formatining boshi.' },
      faktlar: [['Content-Length', cl2 ?? 'yo‘q'], ['Transfer-Encoding', te ?? '—'], ['ETag', etag2], ['Accept-Ranges', ranges2 ?? 'yo‘q']],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        { tur: 'teg', tugun: 'klient', matn: null },
        { tur: 'teg', tugun: 'veb', matn: `ETag ${etag2}`, rang: 'insight' },
      ],
    },
    {
      qisqa: 'Range', nishon: 'texnika',
      sarlavha: 'Range: faqat kerakli qism',
      matn: [
        `Uchinchi so‘rov — yana o‘sha ulanishda, **\`Range: ${range}\`**: “faqat dastlabki 100 baytni bering”. Video pleyer o‘rtaga sakraganda yoki uzilgan yuklash davom etganda shunday so‘raladi.`,
        `Server **206 Partial Content** qaytardi: **\`Content-Range: ${crange}\`** — “0–99-baytlar, butun fayl ${tana} bayt”, \`Content-Length: ${cl3}\`. Klient 206 da shu sarlavhaga qarab qaysi qism kelganini biladi (RFC 9110, 15.3.7).`,
      ],
      callout: { tur: 'maslahat', matn: 'Bu so‘rovda `Accept-Encoding` yo‘q — server qismni siqilmagan fayldan kesdi. Oraliq fayldan tashqarida bo‘lsa (masalan, `bytes=9000-`), javob `416 Range Not Satisfiable` bo‘ladi.' },
      faktlar: [['So‘rov', `Range: ${range}`], ['Javob', '206 Partial Content'], ['Content-Range', crange], ['Tana', `${cl3} B`]],
      korinadi: KORINADI,
      kamera: KORINADI,
      hodisalar: [
        { tur: 'teg', tugun: 'veb', matn: null },
        pk(get3, 'GET / (RANGE)', [`Range: ${range}`], 'sorov'),
        pk(r206, '206 PARTIAL', [`Content-Range: ${crange}`], 'javob'),
        ...(r206Tana.n !== r206.n ? [pk(r206Tana, 'TANA', [`${cl3} B`], 'javob', { ms: 700 })] : []),
        { tur: 'teg', tugun: 'klient', matn: `${cl3} B`, rang: 'ok' },
      ],
    },
    {
      qisqa: 'Xulosa', nishon: 'xulosa',
      sarlavha: 'Bitta sahifa, uch javob',
      matn: [
        `Uch javobda serverdan kelgan paketlar: to‘liq — **${bayt(j1)} B** (${j1.length} paket), gzip — **${bayt(j2)} B** (${j2.length}), qism — **${bayt(j3)} B** (${j3.length}). Uchalasi bitta TCP ulanishda: kelishuv bir marta bo‘ldi.`,
        'Siqish — sahifa, skript, CSS kabi matn uchun: kamroq bayt, sekin tarmoqda tezroq. Range — katta fayl uchun: butunini emas, kerakli joyini olish. Ikkalasini klient so‘raydi, server esa rozi bo‘lishi ham, bo‘lmasligi ham mumkin.',
      ],
      callout: { tur: 'goya', matn: '`Vary: Accept-Encoding` muhim: oraliq kesh gzip’li javobni gzip’ni tushunmaydigan klientga bermasligi kerak. nginx’da uni `gzip_vary on` qo‘shadi (standart — off).' },
      korinadi: KORINADI,
      kamera: KORINADI,
      kartalar: [{
        sarlavha: 'Yozuvdan: server yubordi',
        qatorlar: [
          ['1. oddiy GET → 200', `${bayt(j1)} B · ${j1.length} paket`],
          ['2. gzip → 200', `${bayt(j2)} B · ${j2.length} paket`, true],
          ['3. Range → 206', `${bayt(j3)} B · ${j3.length} paket`],
          ['TCP kelishuvi', `${synlar} marta`],
          ['GET → javob', `${ms(get1, ok1)} · ${ms(get2, ok2)} · ${ms(get3, r206)}`],
        ],
        joy: 'yuqori-chap',
        izoh: 'kadrlar hajmi (sarlavhalar bilan), klient tomonida o‘lchangan',
      }],
      hodisalar: [{ tur: 'teg', tugun: 'klient', matn: null }],
    },
  ],
}
