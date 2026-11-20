// "Rate limiting" — tizim dizayni darsi. Hamma raqamlar VPS laboratoriyasidagi haqiqiy o'lchovdan
// (tizim-lab/olchov-rate.sh → src/sahna/tizim/olchovlar/rate-limiting/*.json): ikki manba bir vaqtda —
// foydalanuvchi (10.70.0.100, 10 so'rov/s) va bot (10.70.0.101, 300 so'rov/s); nginx limit_req IP bo'yicha.
// docs/vizualizator/tizim-dizayni.md 2 (5-modul)
import yoqBot from '../tizim/olchovlar/rate-limiting/yoq-bot.json'
import yoqFoyd from '../tizim/olchovlar/rate-limiting/yoq-foyd.json'
import limitBot from '../tizim/olchovlar/rate-limiting/limit-bot.json'
import limitFoyd from '../tizim/olchovlar/rate-limiting/limit-foyd.json'
import burstsiz from '../tizim/olchovlar/rate-limiting/portlash-burstsiz.json'
import burst from '../tizim/olchovlar/rate-limiting/portlash-burst.json'
import versiyalar from '../tizim/olchovlar/rate-limiting/versiyalar.txt?raw'

const ms = (v) => (v == null ? '—' : v >= 1000 ? `${(v / 1000).toFixed(1)} s` : `${Math.round(v)} ms`)
const holatMs = (v) => (v == null ? 'neytral' : v < 100 ? 'ok' : v < 500 ? 'ogoh' : 'xato')
const kod = (o, k) => o.kodlar[String(k)] ?? 0
const otdi = (o) => Math.round(kod(o, 200) / o.soniya)
const m = (foyd, bot) => ({
  foyd: { v: foyd.p95, holat: holatMs(foyd.p95), manba: 'olchangan' },
  foydXato: { v: `${foyd.sorovlar - kod(foyd, 200)}`, holat: foyd.sorovlar - kod(foyd, 200) ? 'xato' : 'ok', manba: 'olchangan' },
  bot: { v: bot ? `${otdi(bot)} / s` : '—', holat: bot && otdi(bot) > 100 ? 'xato' : 'ok', manba: 'olchangan' },
  rad: { v: bot ? `${kod(bot, 429)}` : '—', holat: 'neytral', manba: 'olchangan' },
})

export default {
  id: 'rate-limiting',
  tur: 'tizim',
  sarlavha: 'Rate limiting',
  shior: 'Bitta mijoz hammani to‘xtatmasin: har manbaga tezlik chegarasi va tushunarli 429.',
  daraja: 'boshlang‘ich',
  daqiqa: 8,
  kitob: [
    { yol: '/arxitektura/30-rate-limiting', nom: 'Arxitektura, 30-bob: Rate limiting' },
    { yol: '/nginx/26-sorov-cheklash', nom: 'Nginx, 26-bob: So‘rovlarni cheklash' },
  ],
  manba: [
    { nom: 'nginx: ngx_http_limit_req_module', url: 'https://nginx.org/en/docs/http/ngx_http_limit_req_module.html' },
    { nom: 'NGINX: Limiting Access to Proxied HTTP Resources', url: 'https://docs.nginx.com/nginx/admin-guide/security-controls/controlling-access-proxied-http/' },
    { nom: 'RFC 6585 — 4 429 Too Many Requests', url: 'https://www.rfc-editor.org/rfc/rfc6585#section-4' },
    { nom: 'RFC 9110 — 10.2.3 Retry-After', url: 'https://www.rfc-editor.org/rfc/rfc9110#section-10.2.3' },
  ],
  sinov: `O‘lchov: VPS laboratoriyasi (tizim-lab/), ${versiyalar.trim().split('\n').join(' · ')}. Uch ilova nusxasi, har biri bir vaqtda bitta so‘rov (20 ms ish) — jami ~150 so‘rov/s. Ikki yuklama generatori turli IP’dan bir vaqtda: foydalanuvchi 10 so‘rov/s, bot 300 so‘rov/s (generatorda bir vaqtda ko‘pi bilan 400 ta ochiq so‘rov). Har o‘lchov 20 s.`,
  trenajor: { yol: '/arxitektura/trenajor', nom: 'Simulyatorda o‘zingiz sinang' },
  organasiz: [
    { matn: 'Bitta mijoz qanday qilib hammani sekinlashtiradi', qadam: 1 },
    { matn: 'nginx limit_req: IP bo‘yicha tezlik', qadam: 3 },
    { matn: '429 va Retry-After', qadam: 4 },
    { matn: 'burst: qisqa portlashga ruxsat', qadam: 6 },
  ],
  metrikaRoyxat: [
    { k: 'foyd', nom: 'Foydalanuvchi p95', format: ms },
    { k: 'foydXato', nom: 'Foydalanuvchi xatolari' },
    { k: 'bot', nom: 'Botdan o‘tdi' },
    { k: 'rad', nom: 'Rad etildi (429)' },
  ],
  metrikaManba: { olchangan: 'VPS laboratoriyasida o‘lchangan (tizim-lab/olchov-rate.sh)' },
  afsona: [{ k: 'sorov', nom: 'foydalanuvchi so‘rovi' }, { k: 'ogir', nom: 'bot so‘rovi' }, { k: 'xato', nom: 'rad (429)' }],
  tugunlar: {
    users: { ikonka: 'foydalanuvchilar', nom: 'Foydalanuvchi', izoh: '10.70.0.100 · 10/s', x: 60, y: 160 },
    bot: { ikonka: 'noutbuk', nom: 'Bot', izoh: '10.70.0.101 · 300/s', x: 60, y: 500 },
    lb: { ikonka: 'lb', nom: 'nginx', izoh: 'limit_req', x: 400, y: 330 },
    a: { ikonka: 'server', nom: 'Server A', izoh: '~50/s', x: 800, y: 80 },
    b: { ikonka: 'server', nom: 'Server B', izoh: '~50/s', x: 800, y: 330 },
    c: { ikonka: 'server', nom: 'Server C', izoh: '~50/s', x: 800, y: 580 },
  },
  chiziqlar: [['users', 'lb'], ['bot', 'lb'], ['lb', 'a'], ['lb', 'b'], ['lb', 'c']],
  qadamlar: [
    {
      qisqa: 'Bot', nishon: 'muammo',
      sarlavha: 'Bitta bot — hamma sekinlashdi',
      matn: [
        `Do‘konda uch server, jami sig‘im ~150 so‘rov/s. Oddiy foydalanuvchi sekundiga 10 ta so‘rov yuboradi. Shu payt bitta skript (bot) sekundiga **${yoqBot.tezlik}** ta so‘rov bilan keldi — cheklov yo‘q.`,
        `Serverlar botning navbatiga ko‘mildi. Foydalanuvchining p95 javob vaqti: **${ms(yoqFoyd.p95)}** — u hech narsa qilmadi, lekin sayt unga “qotib qoldi”. Bot esa hammasini oldi: ${kod(yoqBot, 200)} ta so‘rovi bajarildi.`,
      ],
      callout: { tur: 'ogoh', matn: 'Limitsiz API — ochiq eshik: bitta skript butun resursni band qiladi, login’ga daqiqasiga minglab parol sinaladi (Arxitektura, 30-bob).' },
      ozgardi: [`~ bot ${yoqBot.tezlik} so‘rov/s`, `~ foydalanuvchi p95 ${ms(yoqFoyd.p95)}`],
      korinadi: ['users', 'bot', 'lb', 'a', 'b', 'c'],
      metrikalar: m(yoqFoyd, yoqBot),
      teglar: { a: { band: 1, matn: 'navbat', rang: 'xato' }, b: { band: 1, matn: 'navbat', rang: 'xato' }, c: { band: 1, matn: 'navbat', rang: 'xato' }, users: { matn: `p95 ${ms(yoqFoyd.p95)}`, rang: 'xato' } },
      oqimlar: [{ chiziq: ['bot', 'lb'], tezlik: 8, naqsh: ['ogir'] }, { chiziq: ['users', 'lb'], tezlik: 1 }, { chiziq: ['lb', 'a'], tezlik: 3, naqsh: ['ogir', 'ogir', 'sorov'] }, { chiziq: ['lb', 'b'], tezlik: 3, naqsh: ['ogir', 'ogir', 'sorov'] }, { chiziq: ['lb', 'c'], tezlik: 3, naqsh: ['ogir', 'ogir', 'sorov'] }],
    },
    {
      qisqa: 'Bashorat', nishon: 'tushuncha',
      sarlavha: 'Kimni cheklash kerak?',
      matn: [
        'Serverlarni ko‘paytirish yordam beradimi? Bot tezligini oshirsa, yana to‘ldiradi. Muammo — sig‘imda emas, **adolatda**: bitta manba boshqalarning ulushini yeb qo‘ydi.',
        'Yechim — har manbaga alohida tezlik chegarasi. Manba nima bilan aniqlanadi — IP, foydalanuvchi, API kalit — bu “kalit” tanlovi (30-bob).',
      ],
      callout: { tur: 'goya', matn: 'Rate limiting maqsadlari: xavfsizlik (brute force), barqarorlik (bitta mijoz hammani band qilmasin), adolat, narx (SMS, AI), tarif rejalari (30-bob).' },
      korinadi: ['users', 'bot', 'lb', 'a', 'b', 'c'],
      metrikalar: m(yoqFoyd, yoqBot),
      bashorat: { savol: 'Foydalanuvchini botdan qanday himoya qilamiz?', variantlar: ['Yana ikki server qo‘shamiz', 'Har IP’ga sekundiga ko‘pi bilan N so‘rov, ortig‘ini rad etamiz', 'Foydalanuvchiga “keyinroq urinib ko‘ring” deymiz'], togri: 1, izoh: 'Server qo‘shish botga ko‘proq joy beradi xolos. Manba bo‘yicha chegara — botni to‘xtatadi, boshqalarga tegmaydi.' },
    },
    {
      qisqa: 'limit_req', nishon: 'texnika',
      sarlavha: 'nginx limit_req: har IP’ga 20 so‘rov/s',
      matn: [
        'nginx’da IP bo‘yicha chegara: `limit_req_zone $binary_remote_addr zone=ip:10m rate=20r/s;` va `limit_req zone=ip;`. Ortiqcha so‘rovlar ilovaga yetib kelmasdan rad etiladi.',
        `Xuddi o‘sha yuklama: botdan sekundiga **${otdi(limitBot)}** ta o‘tdi (${kod(limitBot, 200)} ta), **${kod(limitBot, 429)}** tasi rad etildi. Foydalanuvchi p95: **${ms(yoqFoyd.p95)} → ${ms(limitFoyd.p95)}**, uning so‘rovlaridan ${limitFoyd.sorovlar - kod(limitFoyd, 200)} tasi rad etildi — u chegaraga yetmaydi.`,
      ],
      callout: { tur: 'maslahat', matn: 'nginx’ning limit_req’i — “chelak teshigi” (leaky bucket): so‘rovlar chelakka har xil tezlikda tushadi, belgilangan tezlikda chiqadi (Nginx, 26-bob).' },
      ozgardi: ['+ limit_req: 20 so‘rov/s har IP', `~ foydalanuvchi p95 ${ms(yoqFoyd.p95)} → ${ms(limitFoyd.p95)}`],
      korinadi: ['users', 'bot', 'lb', 'a', 'b', 'c'],
      metrikalar: m(limitFoyd, limitBot),
      teglar: { lb: { matn: `${kod(limitBot, 429)} × 429`, rang: 'insight' }, a: { band: 0.2, matn: 'yengil', rang: 'ok' }, b: { band: 0.2, matn: 'yengil', rang: 'ok' }, c: { band: 0.2, matn: 'yengil', rang: 'ok' }, users: { matn: `p95 ${ms(limitFoyd.p95)}`, rang: 'ok' } },
      oqimlar: [{ chiziq: ['bot', 'lb'], tezlik: 8, naqsh: ['xato', 'xato', 'xato', 'xato', 'xato', 'xato', 'xato', 'xato', 'xato', 'xato', 'xato', 'xato', 'xato', 'ogir'] }, { chiziq: ['users', 'lb'], tezlik: 1 }, { chiziq: ['lb', 'a'], tezlik: 1, naqsh: ['sorov', 'ogir'] }, { chiziq: ['lb', 'b'], tezlik: 1, naqsh: ['sorov', 'ogir'] }, { chiziq: ['lb', 'c'], tezlik: 1, naqsh: ['sorov', 'ogir'] }],
      kartalar: [{ sarlavha: 'Bot, har soniya (o‘lchangan)', qatorlar: limitBot.har_soniya.slice(0, 4).map((x) => [`${x.s + 1}-soniya`, `o‘tdi ${x.ok} · rad ${x.xato}`]), joy: 'yuqori-chap', izoh: 'rate=20r/s — sekundiga 20 ta' }],
    },
    {
      qisqa: '429', nishon: 'texnika',
      sarlavha: '429 va Retry-After: botga nima deyiladi',
      matn: [
        'nginx standart holatda rad etilgan so‘rovga **503** qaytaradi. `limit_req_status 429;` bilan — **429 Too Many Requests**: “siz juda ko‘p so‘rayapsiz” (RFC 6585). 503 esa “server ishlamayapti” degani — klient uchun boshqa ma’no.',
        `Javobga \`Retry-After: ${limitBot.retry_after}\` qo‘shildi — “${limitBot.retry_after} soniyadan keyin urining”. nginx uni o‘zi qo‘shmaydi; bu laboratoriyada \`error_page 429\` orqali qo‘shildi.`,
      ],
      callout: { tur: 'goya', matn: 'Yaxshi 429: `Retry-After`, `RateLimit-*` sarlavhalari va tushunarli tana. Klient tomoni — `Retry-After` ni hurmat qilish va exponential backoff (Arxitektura, 30- va 67-boblar).' },
      faktlar: [['Kod', '429 (standart 503)'], ['Retry-After', `${limitBot.retry_after} s`], ['Sozlama', 'limit_req_status 429']],
      korinadi: ['users', 'bot', 'lb', 'a', 'b', 'c'],
      metrikalar: m(limitFoyd, limitBot),
      teglar: { bot: { matn: `429 · Retry-After: ${limitBot.retry_after}`, rang: 'ogoh' } },
      oqimlar: [{ chiziq: ['bot', 'lb'], tezlik: 4, naqsh: ['xato'] }, { chiziq: ['users', 'lb'], tezlik: 1 }],
    },
    {
      qisqa: 'Portlash', nishon: 'muammo',
      sarlavha: 'Halol foydalanuvchi ham chegaraga uriladi',
      matn: [
        `Sahifa ochilganda brauzer bir vaqtda ko‘p so‘rov yuboradi (rasmlar, API). O‘lchov: foydalanuvchi 0,3 soniyada **${burstsiz.sorovlar}** ta so‘rov yubordi — o‘rtacha tezligi past, lekin bir lahzada ko‘p.`,
        `\`burst\` siz qattiq chegara: **${kod(burstsiz, 200)}** tasi o‘tdi, **${kod(burstsiz, 429)}** tasi 429 oldi. Bot to‘xtadi, lekin oddiy foydalanuvchi ham jabr ko‘rdi.`,
      ],
      callout: { tur: 'ogoh', matn: 'Qat’iy limitlar haqiqiy foydalanuvchilarni ham to‘sadi — ayniqsa NAT ortida (ofis, mobil operator) ko‘p odam bitta IP bo‘lsa (30-bob, trade-off).' },
      ozgardi: [`~ ${burstsiz.sorovlar} so‘rov 0,3 s da`, `~ rad: ${kod(burstsiz, 429)}`],
      korinadi: ['users', 'lb', 'a', 'b', 'c'],
      metrikalar: { ...m(burstsiz, null), foydXato: { v: `${kod(burstsiz, 429)}`, holat: 'xato', manba: 'olchangan' } },
      teglar: { users: { matn: `${kod(burstsiz, 429)} / ${burstsiz.sorovlar} rad`, rang: 'xato' } },
      oqimlar: [{ chiziq: ['users', 'lb'], tezlik: 6, naqsh: ['sorov', 'xato', 'xato', 'xato', 'xato'] }],
    },
    {
      qisqa: 'burst', nishon: 'texnika',
      sarlavha: 'burst=20 nodelay: qisqa portlashga ruxsat',
      matn: [
        '`limit_req zone=ip burst=20 nodelay;` — o‘rtacha tezlik o‘sha 20/s, lekin 20 tagacha ortiqcha so‘rov **darhol** bajariladi (nodelay), keyin chelak asta bo‘shaydi.',
        `Xuddi o‘sha ${burst.sorovlar} ta so‘rov: **${kod(burst, 200)}** tasi o‘tdi, ${kod(burst, 429)} tasi rad (20 ta burst + 0,3 s ichida chelakdan chiqqanlari). Uzoq muddatda bot baribir 20/s dan oshmaydi.`,
      ],
      callout: { tur: 'maslahat', matn: '`burst` siz — ortiqcha darhol rad; `burst=N` — N tagacha navbatga qo‘yiladi va kechiktiriladi; `burst=N nodelay` — N tagacha darhol (Nginx, 26-bob). Interaktiv foydalanuvchiga — token bucket uslubi (30-bob).' },
      ozgardi: ['+ burst=20 nodelay', `~ o‘tdi: ${kod(burstsiz, 200)} → ${kod(burst, 200)}`],
      korinadi: ['users', 'lb', 'a', 'b', 'c'],
      metrikalar: { ...m(burst, null), foydXato: { v: `${kod(burst, 429)}`, holat: kod(burst, 429) ? 'ogoh' : 'ok', manba: 'olchangan' } },
      teglar: { users: { matn: `${kod(burst, 200)} / ${burst.sorovlar} o‘tdi`, rang: 'ok' } },
      oqimlar: [{ chiziq: ['users', 'lb'], tezlik: 6 }, { chiziq: ['lb', 'a'], tezlik: 2 }, { chiziq: ['lb', 'b'], tezlik: 2 }, { chiziq: ['lb', 'c'], tezlik: 2 }],
    },
    {
      qisqa: 'Xulosa', nishon: 'xulosa',
      sarlavha: 'Nimalarni ko‘rdik',
      matn: [
        `Limitsiz: bitta bot foydalanuvchi p95 ini ${ms(yoqFoyd.p95)} ga chiqardi. IP bo‘yicha 20/s: ${ms(limitFoyd.p95)}, bot 429 bilan qaytarildi. Portlash: burst’siz ${kod(burstsiz, 200)}/${burstsiz.sorovlar}, burst bilan ${kod(burst, 200)}/${burst.sorovlar}.`,
        'Ko‘p nusxali tizimda hisoblagich umumiy bo‘lishi kerak (masalan, Redis) — aks holda har nusxa o‘z limitini beradi: 3 nusxa × 100 = 300. Login uchun faqat IP yetmaydi: IP va email birga (30-bob).',
      ],
      callout: { tur: 'goya', matn: 'Qayerda cheklash: CDN/WAF — qo‘pol IP limitlar; nginx — umumiy limit, ilovaga yetmasdan; ilova — foydalanuvchi, tenant, tarif bo‘yicha (30-bob).' },
      korinadi: ['users', 'bot', 'lb', 'a', 'b', 'c'],
      metrikalar: m(limitFoyd, limitBot),
      teglar: {},
      kartalar: [{
        sarlavha: 'Foydalanuvchi p95 (o‘lchangan)',
        qatorlar: [['limitsiz', ms(yoqFoyd.p95)], ['limit_req 20/s', ms(limitFoyd.p95), true], ['portlash, burst’siz', `${kod(burstsiz, 200)}/${burstsiz.sorovlar} o‘tdi`], ['portlash, burst=20', `${kod(burst, 200)}/${burst.sorovlar} o‘tdi`]],
        joy: 'yuqori-chap',
      }],
      oqimlar: [{ chiziq: ['users', 'lb'], tezlik: 1 }, { chiziq: ['bot', 'lb'], tezlik: 4, naqsh: ['xato', 'xato', 'xato', 'ogir'] }],
    },
  ],
}
