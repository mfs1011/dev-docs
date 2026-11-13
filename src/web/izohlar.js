// HTTP laboratoriyasi: status kodlari va sarlavhalar izohi (RFC 9110/9111, Fetch Standard, MDN — kitobdagi boblar
// bilan bir xil), mavzular bo'yicha tayyor so'rovlar va javobni oddiy tilda tushuntirish.
import { hdr } from './lab.js'

export const HOST = 'http://api.test:8080'
export const BASIC = 'Basic ' + btoa('ali:parol123')

export const STATUS = {
  200: 'OK — so‘rov bajarildi, javob tanasida natija.',
  201: 'Created — yangi resurs yaratildi; manzili Location sarlavhasida.',
  204: 'No Content — muvaffaqiyatli, lekin tana yo‘q.',
  206: 'Partial Content — Range bilan so‘ralgan qism; qaysi qismligi Content-Range’da.',
  301: 'Moved Permanently — resurs doimiy ko‘chgan, yangi manzil Location’da. Brauzer bu javobni keshlab qo‘yishi mumkin.',
  302: 'Found — vaqtincha boshqa manzilda (Location).',
  303: 'See Other — natijani boshqa manzildan GET bilan oling (forma yuborilgandan keyin).',
  304: 'Not Modified — keshdagi nusxa hali yangi, tana yuborilmadi.',
  307: 'Temporary Redirect — vaqtincha; metod va tana o‘zgarmasdan qayta yuboriladi.',
  308: 'Permanent Redirect — doimiy; metod va tana o‘zgarmaydi.',
  400: 'Bad Request — so‘rov noto‘g‘ri tuzilgan.',
  401: 'Unauthorized — avval autentifikatsiya kerak (WWW-Authenticate qanday ekanini aytadi).',
  403: 'Forbidden — server kimligingizni bilsa ham, ruxsat bermaydi.',
  404: 'Not Found — bu manzilda resurs yo‘q.',
  405: 'Method Not Allowed — bu manzil bunday metodni qabul qilmaydi; ruxsat etilganlari Allow’da.',
  416: 'Range Not Satisfiable — so‘ralgan qism fayl chegarasidan tashqarida.',
  500: 'Internal Server Error — serverning o‘zida xato.',
  502: 'Bad Gateway — proksi orqadagi serverdan yaroqsiz javob oldi.',
  503: 'Service Unavailable — server vaqtincha band; qachon qayta urinish Retry-After’da.',
}
export const statusSinf = (k) => (!k ? 'xato' : k < 300 ? 'ok' : k < 400 ? 'yonalish' : k < 500 ? 'mijoz' : 'server')

export const HEADER = {
  host: 'Qaysi saytga (bitta IP’da bir nechta sayt bo‘lishi mumkin). HTTP/1.1’da majburiy.',
  'user-agent': 'So‘rovni yuborgan dastur (bu yerda curl).',
  accept: 'Qaysi formatdagi javobni qabul qila olishi.',
  'accept-encoding': 'Qaysi siqish usullarini tushunishi (gzip, br, zstd…).',
  'content-type': 'Tanadagi ma’lumot turi (MIME): text/html, application/json…',
  'content-length': 'Tananing hajmi, baytda.',
  'transfer-encoding': 'chunked — tana bo‘laklab yuboriladi, hajmi oldindan aytilmaydi.',
  'content-encoding': 'Tana qanday siqilgan (gzip…). Klient ochib o‘qiydi.',
  vary: 'Javob qaysi so‘rov sarlavhasiga qarab farq qiladi — keshlar shuni hisobga oladi.',
  location: 'Qayerga borish kerak: redirect (3xx) yoki yaratilgan resurs (201).',
  etag: 'Resurs versiyasining belgisi. Keyingi safar If-None-Match bilan yuborilsa, o‘zgarmagan bo‘lsa 304 keladi.',
  'last-modified': 'Resurs oxirgi o‘zgargan vaqt. If-Modified-Since bilan shartli so‘rovga ishlatiladi.',
  'cache-control': 'Keshlash qoidasi: max-age — necha soniya yangi; no-store — umuman saqlanmasin; no-cache — har safar tekshirilsin.',
  expires: 'Eski usul: shu vaqtgacha yangi hisoblanadi (Cache-Control max-age ustun turadi).',
  'if-none-match': 'Shartli so‘rov: “mendagi versiya shu ETag; o‘zgarmagan bo‘lsa tanani yubormang”.',
  'if-modified-since': 'Shartli so‘rov: “shu vaqtdan keyin o‘zgarmagan bo‘lsa — 304”.',
  'set-cookie': 'Server klientga cookie saqlashni buyuradi. HttpOnly — JavaScript o‘qiy olmaydi; SameSite — boshqa saytdan so‘rovda yuborilishi.',
  cookie: 'Klient saqlangan cookie’larni har so‘rovda qaytaradi — server sizni shundan taniydi (sessiya).',
  'www-authenticate': 'Qanday autentifikatsiya kerakligi (Basic, realm — hudud nomi).',
  authorization: 'Login ma’lumoti. Basic — "login:parol" base64 bilan (shifrlanmaydi! faqat HTTPS orqali).',
  origin: 'So‘rov qaysi saytdan (sxema + domen + port). CORS shunga qarab qaror qiladi.',
  'access-control-request-method': 'Preflight: “haqiqiy so‘rov shu metod bilan bo‘ladi, ruxsatmi?”',
  'access-control-request-headers': 'Preflight: haqiqiy so‘rovda qaysi qo‘shimcha sarlavhalar bo‘ladi.',
  'access-control-allow-origin': 'Qaysi origin bu javobni o‘qiy oladi. Yo‘q bo‘lsa — brauzer javobni sahifaga bermaydi (CORS xatosi).',
  'access-control-allow-methods': 'Boshqa origin’dan ruxsat etilgan metodlar.',
  'access-control-allow-headers': 'Boshqa origin’dan ruxsat etilgan sarlavhalar.',
  'access-control-max-age': 'Preflight natijasini brauzer necha soniya eslab qoladi.',
  range: 'Faylning bir qismini so‘rash: bytes=0-99 — birinchi 100 bayt.',
  'content-range': 'Javobdagi qism: bytes boshi-oxiri/jami.',
  'accept-ranges': 'Server qismli yuklashni (Range) qo‘llaydi.',
  allow: 'Shu manzil qabul qiladigan metodlar (405 bilan keladi).',
  'retry-after': 'Necha soniyadan keyin qayta urinish (503, 429).',
  server: 'Server dasturi (bu yerda nginx).',
  date: 'Javob yaratilgan vaqt.',
  connection: 'keep-alive — TCP ulanish keyingi so‘rovlar uchun ochiq qoladi.',
}

// Mavzular bo'yicha tayyor so'rovlar: har biri { nom, izoh, usul, yol, headerlar?, tana?, ergash?, cookie?, siqish? }
export const MAVZULAR = [
  { id: 'asosiy', nom: 'Asosiy', tayyorlar: [
    { nom: 'GET /', izoh: 'HTML sahifa', usul: 'GET', yol: '/' },
    { nom: 'GET /api/foydalanuvchi', izoh: 'JSON', usul: 'GET', yol: '/api/foydalanuvchi', headerlar: [['Accept', 'application/json']] },
    { nom: 'HEAD /static/logo.svg', izoh: 'faqat sarlavhalar', usul: 'HEAD', yol: '/static/logo.svg' },
  ] },
  { id: 'metod', nom: 'Metodlar', tayyorlar: [
    { nom: 'POST /api/buyurtma', izoh: '201 + Location', usul: 'POST', yol: '/api/buyurtma', headerlar: [['Content-Type', 'application/json']], tana: '{"mahsulot": "kitob", "soni": 2}' },
    { nom: 'DELETE /api/foydalanuvchi', izoh: '405 + Allow', usul: 'DELETE', yol: '/api/foydalanuvchi' },
    { nom: 'GET /api/buyurtma', izoh: 'faqat POST', usul: 'GET', yol: '/api/buyurtma' },
  ] },
  { id: 'status', nom: 'Holat kodlari', tayyorlar: [
    { nom: '404', izoh: '/yoq', usul: 'GET', yol: '/yoq' },
    { nom: '500', izoh: '/xato', usul: 'GET', yol: '/xato' },
    { nom: '503', izoh: 'Retry-After', usul: 'GET', yol: '/band' },
  ] },
  { id: 'redirect', nom: 'Redirect', tayyorlar: [
    { nom: '301 /eski', izoh: 'doimiy', usul: 'GET', yol: '/eski' },
    { nom: '301 → 301 → 200', izoh: '-L bilan zanjir', usul: 'GET', yol: '/zanjir', ergash: true },
    { nom: 'POST → 303', izoh: 'GET’ga aylanadi', usul: 'POST', yol: '/forma-303', tana: 'ism=Ali', ergash: true },
    { nom: 'POST → 307', izoh: 'POST qoladi', usul: 'POST', yol: '/forma-307', tana: 'ism=Ali', ergash: true },
  ] },
  { id: 'kesh', nom: 'Kesh', tayyorlar: [
    { nom: 'GET /static/logo.svg', izoh: 'ETag, max-age', usul: 'GET', yol: '/static/logo.svg' },
    { nom: '/yangiliklar', izoh: 'no-store', usul: 'GET', yol: '/yangiliklar' },
    { nom: 'Sekin javob', izoh: '24 KB, 8 KB/s', usul: 'GET', yol: '/sekin.txt' },
  ] },
  { id: 'cookie', nom: 'Cookie va sessiya', tayyorlar: [
    { nom: '/profil', izoh: 'kirmasdan', usul: 'GET', yol: '/profil', cookie: true },
    { nom: '/kirish', izoh: 'Set-Cookie', usul: 'GET', yol: '/kirish', cookie: true },
    { nom: '/chiqish', izoh: 'Max-Age=0', usul: 'GET', yol: '/chiqish', cookie: true },
  ] },
  { id: 'auth', nom: 'Autentifikatsiya', tayyorlar: [
    { nom: '/maxfiy/', izoh: '401', usul: 'GET', yol: '/maxfiy/' },
    { nom: '/maxfiy/ + login', izoh: 'ali / parol123', usul: 'GET', yol: '/maxfiy/', headerlar: [['Authorization', BASIC]] },
  ] },
  // Brauzer preflight (OPTIONS) so'roviga cookie qo'shmaydi (Fetch Standard: CORS-preflight request — credentials yo'q)
  { id: 'cors', nom: 'CORS', tayyorlar: [
    { nom: 'Preflight: sayt.test', izoh: 'ruxsat bor', usul: 'OPTIONS', yol: '/api/cors', headerlar: [['Origin', 'http://sayt.test'], ['Access-Control-Request-Method', 'PUT']], cookie: false },
    { nom: 'Preflight: yomon.test', izoh: 'ruxsat yo‘q', usul: 'OPTIONS', yol: '/api/cors', headerlar: [['Origin', 'http://yomon.test'], ['Access-Control-Request-Method', 'PUT']], cookie: false },
    { nom: 'GET + Origin', izoh: 'oddiy so‘rov', usul: 'GET', yol: '/api/cors', headerlar: [['Origin', 'http://sayt.test']] },
  ] },
  { id: 'siqish', nom: 'Siqish va Range', tayyorlar: [
    { nom: 'gzip', izoh: '--compressed', usul: 'GET', yol: '/katta.txt', siqish: true },
    { nom: 'siqmasdan', izoh: 'solishtiring', usul: 'GET', yol: '/katta.txt' },
    { nom: 'Range 0-99', izoh: '206', usul: 'GET', yol: '/katta.txt', headerlar: [['Range', 'bytes=0-99']] },
    { nom: 'Range chegaradan tashqari', izoh: '416', usul: 'GET', yol: '/katta.txt', headerlar: [['Range', 'bytes=999999-']] },
  ] },
]

/** Javobni oddiy tilda tushuntirish: [{ m, s: 'ok'|'xato'|'izoh' }] */
export function tushuntir(n) {
  const l = []
  if (n.kod === 6) return [{ m: 'DNS: domen nomi IP manzilga aylanmadi (Could not resolve host) — so‘rov serverga yetmadi ham.', s: 'xato' }]
  if (n.kod === 7) return [{ m: 'TCP ulanish bo‘lmadi (Connection refused) — shu portda server tinglamayapti.', s: 'xato' }]
  if (n.kod === 28) return [{ m: 'Vaqt tugadi (timeout) — server javob bermadi.', s: 'xato' }]
  if (n.kod > 0) return [{ m: n.xato, s: 'xato' }]
  const h = n.hoplar
  if (h.length > 1) {
    const yol = h.map((x) => `${x.sorov.qator.split(' ')[0]} ${x.sorov.qator.split(' ')[1]} → ${x.javob.kod}`).join('  ·  ')
    l.push({ m: `${h.length - 1} ta redirect: ${yol}`, s: 'izoh' })
    for (let i = 0; i < h.length - 1; i++) {
      const a = h[i].sorov.qator.split(' ')[0], b = h[i + 1].sorov.qator.split(' ')[0]
      if (a !== b) l.push({ m: `${h[i].javob.kod} dan keyin metod ${a} → ${b} ga o‘zgardi${h[i].javob.kod === 303 ? ' (303 shuni talab qiladi)' : ''}.`, s: 'izoh' })
      else if (a === 'POST') l.push({ m: `${h[i].javob.kod}: metod ${a} va tana saqlandi.`, s: 'izoh' })
    }
  }
  const o = h.at(-1)
  if (!o) return l
  const j = o.javob, s = o.sorov
  if (STATUS[j.kod]) l.push({ m: `${j.kod} ${STATUS[j.kod]}`, s: j.kod < 400 ? 'ok' : 'xato' })
  const jh = (x) => hdr(j.headerlar, x), sh = (x) => hdr(s.headerlar, x)
  if (jh('Location') && j.kod >= 300 && j.kod < 400 && h.length === 1) l.push({ m: `Yangi manzil: ${jh('Location')}. “Redirectga ergashish” yoqilsa, curl (va brauzer) u yerga o‘zi boradi.`, s: 'izoh' })
  if (jh('ETag') && j.kod === 200) l.push({ m: `ETag ${jh('ETag')} — keyingi so‘rovga If-None-Match bilan qo‘shing: o‘zgarmagan bo‘lsa 304 keladi va tana qayta yuklanmaydi.`, s: 'izoh' })
  if (j.kod === 304) l.push({ m: 'Tana kelmadi — klient keshdagi nusxani ishlatadi. Tarmoq orqali faqat sarlavhalar o‘tdi.', s: 'ok' })
  if (jh('Cache-Control')) l.push({ m: `Cache-Control: ${jh('Cache-Control')}${/max-age=(\d+)/.test(jh('Cache-Control')) ? ` — ${jh('Cache-Control').match(/max-age=(\d+)/)[1]} soniya davomida qayta so‘ramasdan keshdan olinadi` : ''}.`, s: 'izoh' })
  if (jh('Set-Cookie')) l.push({ m: `Server cookie berdi: ${jh('Set-Cookie').split(';')[0]}. ${n.sorov.cookie ? 'Cookie saqlandi — keyingi so‘rovlarda Cookie sarlavhasida qaytadi.' : '“Cookie’larni saqlash” o‘chiq — curl uni eslab qolmaydi.'}`, s: 'izoh' })
  if (sh('Cookie')) l.push({ m: `Klient saqlangan cookie’ni yubordi: ${sh('Cookie')} — server sizni shu orqali taniydi.`, s: 'ok' })
  if (jh('WWW-Authenticate')) l.push({ m: `Server ${jh('WWW-Authenticate')} talab qiladi. Authorization sarlavhasini qo‘shing (ali / parol123).`, s: 'izoh' })
  if (sh('Origin')) {
    const ruxsat = jh('Access-Control-Allow-Origin')
    l.push(ruxsat
      ? { m: `CORS: ${sh('Origin')} ga ruxsat bor (Access-Control-Allow-Origin: ${ruxsat}) — brauzer javobni sahifaga beradi.`, s: 'ok' }
      : { m: `CORS: javobda Access-Control-Allow-Origin yo‘q — brauzer ${sh('Origin')} sahifasiga javobni bermaydi. Serverga so‘rov baribir yetib bordi (curl’da ko‘rinib turibdi): CORS himoyasi brauzerda.`, s: 'xato' })
  }
  if (jh('Content-Encoding')) l.push({ m: `Tana ${jh('Content-Encoding')} bilan siqilgan: tarmoqdan ${n.w.size_download} bayt keldi, ochilgandan keyin kattaroq.`, s: 'izoh' })
  if (jh('Content-Range')) l.push({ m: `Faqat qism keldi: ${jh('Content-Range')}.`, s: 'izoh' })
  if (jh('Allow')) l.push({ m: `Ruxsat etilgan metodlar: ${jh('Allow')}.`, s: 'izoh' })
  if (jh('Retry-After')) l.push({ m: `${jh('Retry-After')} soniyadan keyin qayta urinib ko‘ring.`, s: 'izoh' })
  if (n.w.time_total > 1) l.push({ m: `Javob ${n.w.time_total.toFixed(2)} s davom etdi — vaqt asosan tanani yuklab olishga ketdi (pastdagi vaqt chizig‘iga qarang).`, s: 'izoh' })
  return l
}
