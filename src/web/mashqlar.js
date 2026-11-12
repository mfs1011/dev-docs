// HTTP laboratoriyasi mashqlari. Har qadam haqiqiy so'rovlar tarixiga (curl natijasi, eng yangisi boshida) qarab
// tekshiriladi: t — [{ sorov, hoplar, w, kod, cookielar }].
import { hdr } from './lab.js'

const oxirgi = (n) => n.hoplar.at(-1)
const bor = (t, f) => t.some((n) => n.kod === 0 && n.hoplar.length && f(n))
const yol = (n) => oxirgi(n).sorov.qator.split(' ')[1]
const metod = (n) => oxirgi(n).sorov.qator.split(' ')[0]
const status = (n) => oxirgi(n).javob.kod
const jh = (n, x) => hdr(oxirgi(n).javob.headerlar, x)
const sh = (n, x) => hdr(oxirgi(n).sorov.headerlar, x)

export const WEB_MASHQLAR = [
  {
    id: 'birinchi-sorov',
    bob: '/web-asoslari/06-http-xabarlari',
    title: 'So‘rov va javob',
    intro: 'HTTP xabari: boshlang‘ich qator, sarlavhalar va tana. GET va HEAD farqini ko‘ramiz.',
    steps: [
      { text: '`GET /` yuboring va javobdagi `Content-Type` ni toping.', tekshir: (t) => bor(t, (n) => metod(n) === 'GET' && yol(n) === '/' && status(n) === 200),
        natija: '200 OK, `Content-Type: text/html` — brauzer buni sahifa sifatida chizadi. So‘rovda `Host` sarlavhasi bor: bitta IP’da ko‘p sayt bo‘lishi mumkin.' },
      { text: '`HEAD /static/logo.svg` yuboring.', tekshir: (t) => bor(t, (n) => metod(n) === 'HEAD' && status(n) === 200),
        natija: 'Sarlavhalar GET’dagi kabi (Content-Length ham), lekin tana yo‘q — fayl yuklanmasdan uning hajmi va turini bilish mumkin.' },
    ],
  },
  {
    id: 'metodlar',
    bob: '/web-asoslari/07-metodlar',
    title: 'Metodlar',
    intro: 'Bir manzil turli metodlarga turlicha javob beradi.',
    steps: [
      { text: '`POST /api/buyurtma` ga JSON tana bilan so‘rov yuboring.', tekshir: (t) => bor(t, (n) => metod(n) === 'POST' && status(n) === 201),
        natija: '201 Created va `Location: /api/buyurtma/42` — yangi resurs manzili.' },
      { text: '`DELETE /api/foydalanuvchi` yuboring.', tekshir: (t) => bor(t, (n) => metod(n) === 'DELETE' && status(n) === 405),
        natija: '405 va `Allow: GET, HEAD` — server qaysi metodlar mumkinligini aytdi.' },
    ],
  },
  {
    id: 'redirect',
    bob: '/web-asoslari/10-redirectlar',
    title: 'Redirectlar',
    intro: '3xx javob va Location sarlavhasi. Klient yangi manzilga o‘zi borishi kerak.',
    steps: [
      { text: '`/zanjir` ga “Redirectga ergashish” o‘chiq holda so‘rov yuboring.', tekshir: (t) => bor(t, (n) => n.hoplar.length === 1 && yol(n) === '/zanjir' && status(n) === 301),
        natija: '301 va `Location` — curl o‘zi ketmadi, faqat manzilni ko‘rsatdi.' },
      { text: 'Endi “Redirectga ergashish” ni yoqib, yana yuboring.', tekshir: (t) => bor(t, (n) => n.hoplar.length >= 3 && n.hoplar[0].sorov.qator.includes('/zanjir') && status(n) === 200),
        natija: 'Uchta so‘rov: /zanjir → /eski → /yangi. Har biri alohida HTTP so‘rov — redirect zanjiri sahifani sekinlashtiradi.' },
      { text: '`POST → 303` va `POST → 307` tayyorlarini yuborib, ikkinchi so‘rov metodini solishtiring.',
        tekshir: (t) => bor(t, (n) => n.hoplar[0]?.javob.kod === 303 && metod(n) === 'GET') && bor(t, (n) => n.hoplar[0]?.javob.kod === 307 && metod(n) === 'POST'),
        natija: '303 dan keyin GET, 307 dan keyin POST (tana bilan) — 307/308 metodni o‘zgartirmaydi.' },
    ],
  },
  {
    id: 'kesh',
    bob: '/web-asoslari/11-http-keshlash',
    title: 'Kesh va 304',
    intro: 'ETag bilan shartli so‘rov: o‘zgarmagan resurs qayta yuklanmaydi.',
    steps: [
      { text: '`GET /static/logo.svg` yuboring — `ETag` va `Cache-Control` ni toping.', tekshir: (t) => bor(t, (n) => yol(n) === '/static/logo.svg' && status(n) === 200 && jh(n, 'ETag')),
        natija: '`Cache-Control: max-age=3600` — bir soat keshdan olinadi; `ETag` — versiya belgisi.' },
      { text: 'Sarlavhalarga `If-None-Match` ni (oxirgi ETag bilan) qo‘shib, yana yuboring.', tekshir: (t) => bor(t, (n) => status(n) === 304 && sh(n, 'If-None-Match')),
        natija: '304 Not Modified — tana kelmadi, klient keshdagi nusxani ishlatadi.' },
    ],
  },
  {
    id: 'cookie',
    bob: '/web-asoslari/15-sessiya',
    title: 'Cookie bilan sessiya',
    intro: 'Server cookie beradi, klient uni har so‘rovda qaytaradi — shu orqali “kirgan” holat saqlanadi.',
    steps: [
      { text: '“Cookie’larni saqlash” yoqilgan holda `/profil` ni oching.', tekshir: (t) => bor(t, (n) => yol(n) === '/profil' && status(n) === 401),
        natija: '401 — server sizni tanimaydi.' },
      { text: '`/kirish` ni oching.', tekshir: (t) => bor(t, (n) => yol(n) === '/kirish' && jh(n, 'Set-Cookie') && n.cookielar.some((c) => c.nom === 'sessiya')),
        natija: '`Set-Cookie: sessiya=…; HttpOnly; SameSite=Lax` — cookie saqlandi (pastdagi “Cookie’lar” paneliga qarang).' },
      { text: 'Yana `/profil` ni oching.', tekshir: (t) => bor(t, (n) => yol(n) === '/profil' && status(n) === 200 && sh(n, 'Cookie')),
        natija: 'So‘rovda `Cookie: sessiya=…` ketdi va server 200 berdi. HTTP o‘zi holatsiz — “kirganlik” cookie orqali.' },
    ],
  },
  {
    id: 'basic-auth',
    bob: '/web-asoslari/16-http-autentifikatsiya',
    title: 'Basic autentifikatsiya',
    intro: '401 + WWW-Authenticate → Authorization sarlavhasi.',
    steps: [
      { text: '`/maxfiy/` ni login’siz oching.', tekshir: (t) => bor(t, (n) => yol(n) === '/maxfiy/' && status(n) === 401 && jh(n, 'WWW-Authenticate')),
        natija: '401 va `WWW-Authenticate: Basic realm="Maxfiy hudud"`.' },
      { text: '`Authorization` sarlavhasi bilan yana yuboring (ali / parol123).', tekshir: (t) => bor(t, (n) => yol(n) === '/maxfiy/' && status(n) === 200 && sh(n, 'Authorization')),
        natija: '200. `Authorization: Basic …` — bu shunchaki base64, shifr emas: HTTPS’siz parol ochiq ketadi.' },
    ],
  },
  {
    id: 'cors',
    bob: '/web-asoslari/19-cors',
    title: 'CORS preflight',
    intro: 'Boshqa origin’dan so‘rov: server javobida ruxsat bo‘lishi kerak.',
    steps: [
      { text: '`Preflight: sayt.test` ni yuboring.', tekshir: (t) => bor(t, (n) => metod(n) === 'OPTIONS' && sh(n, 'Origin') === 'http://sayt.test' && jh(n, 'Access-Control-Allow-Origin')),
        natija: '204 va `Access-Control-Allow-Origin: http://sayt.test` — brauzer PUT so‘rovini yuborishga ruxsat oladi.' },
      { text: '`Preflight: yomon.test` ni yuboring.', tekshir: (t) => bor(t, (n) => metod(n) === 'OPTIONS' && sh(n, 'Origin') === 'http://yomon.test' && !jh(n, 'Access-Control-Allow-Origin')),
        natija: 'Javob keldi, lekin `Access-Control-Allow-Origin` yo‘q — brauzer haqiqiy so‘rovni yubormaydi. curl esa javobni ko‘rdi: CORS server’ni emas, brauzerdagi sahifani cheklaydi.' },
    ],
  },
  {
    id: 'siqish-range',
    bob: '/web-asoslari/12-siqish-qismli-yuklash',
    title: 'Siqish va qismli yuklash',
    intro: 'gzip tarmoqdagi hajmni kamaytiradi; Range faylning bir qismini oladi.',
    steps: [
      { text: '`/katta.txt` ni siqmasdan va “Siqishni so‘rash” yoqilgan holda yuboring.',
        tekshir: (t) => bor(t, (n) => yol(n) === '/katta.txt' && jh(n, 'Content-Encoding') === 'gzip') && bor(t, (n) => yol(n) === '/katta.txt' && status(n) === 200 && !jh(n, 'Content-Encoding')),
        natija: 'Bir xil fayl: siqmasdan 28 000 bayt, gzip bilan 1–2 KB. Network panelidagi “Hajm” ustunida solishtiring.' },
      { text: '`Range: bytes=0-99` bilan so‘rang.', tekshir: (t) => bor(t, (n) => status(n) === 206 && jh(n, 'Content-Range')),
        natija: '206 va `Content-Range: bytes 0-99/28000` — yuklab olishni to‘xtagan joyidan davom ettirish shunga tayanadi.' },
    ],
  },
]
