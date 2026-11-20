// Vizual darslar katalogi. `reja: true` — rejada (docs/vizualizator/*.md), hali yozilmagan: ro'yxatda xira ko'rinadi.
// Har dars lazy chunk: butun kurs bitta bundle'da yuklanmaydi (README 4.2).

export const TURLAR = {
  paket: {
    nom: 'Paket yo‘li',
    shior: 'Protokollar paketma-paket — har bayt haqiqiy yozuvdan',
    yol: '/paketlar',
    kitob: { yol: '/web-asoslari', nom: 'Web asoslari' },
  },
  tizim: {
    nom: 'Tizim dizayni darslari',
    shior: 'Qadamli hikoya, jonli sxema va o‘lchangan raqamlar',
    yol: '/arxitektura/darslar',
    kitob: { yol: '/arxitektura', nom: 'Arxitektura' },
  },
}

export const DARSLAR = [
  { id: 'http-1-1', tur: 'paket', guruh: 'Web', sarlavha: 'HTTP/1.1', izoh: 'Sahifa ochilishi: DNS → TCP → GET → 200 OK', yukla: () => import('./http-1-1.js') },
  { id: 'dns', tur: 'paket', guruh: 'Web', sarlavha: 'DNS', izoh: 'Rezolver → ildiz → TLD → domen serveri, kesh', yukla: () => import('./dns.js') },
  { id: 'tcp', tur: 'paket', guruh: 'Web', sarlavha: 'TCP', izoh: 'Uch qadamli kelishuv, tasdiq, yopish, RST', yukla: () => import('./tcp.js') },
  { id: 'tls-1-3', tur: 'paket', guruh: 'Web', sarlavha: 'TLS 1.3', izoh: 'Handshake, sertifikat zanjiri, kalit bilan ochish', yukla: () => import('./tls.js') },
  { id: 'kesh-304', tur: 'paket', guruh: 'Web', sarlavha: 'Kesh va 304', izoh: 'ETag va shartli so‘rov', reja: true },
  { id: 'cors', tur: 'paket', guruh: 'Web', sarlavha: 'CORS preflight', izoh: 'OPTIONS va ruxsat sarlavhalari', reja: true },
  { id: 'reverse-proxy', tur: 'paket', guruh: 'Server', sarlavha: 'Reverse proxy', izoh: 'Ikki ulanish, X-Forwarded-For', reja: true },
  { id: 'ssh', tur: 'paket', guruh: 'Server', sarlavha: 'SSH', izoh: 'Kalit almashinuvi va shifrlash', reja: true },
  { id: 'postgres', tur: 'paket', guruh: 'Ma’lumot', sarlavha: 'PostgreSQL', izoh: 'Ulanish, SCRAM, so‘rov', reja: true },
  { id: 'amqp', tur: 'paket', guruh: 'Ma’lumot', sarlavha: 'RabbitMQ (AMQP)', izoh: 'Publish, deliver, ack', reja: true },

  { id: 'load-balancing', tur: 'tizim', guruh: 'Masshtab', sarlavha: 'Load balancing', izoh: 'Bitta eshik, ko‘p server — nginx bilan o‘lchangan', yukla: () => import('./load-balancing.js') },
  { id: 'sorov-yoli', tur: 'tizim', guruh: 'Poydevor', sarlavha: 'So‘rov yo‘li va vaqt byudjeti', izoh: 'Vaqt qayerga ketadi', reja: true },
  { id: 'kesh', tur: 'tizim', guruh: 'Masshtab', sarlavha: 'Kesh', izoh: 'Redis va topish ulushi', reja: true },
  { id: 'replikatsiya', tur: 'tizim', guruh: 'Ma’lumot', sarlavha: 'Replikatsiya', izoh: 'Asosiy va replika, kechikish', reja: true },
  { id: 'navbat', tur: 'tizim', guruh: 'Aloqa', sarlavha: 'Navbat va fon ishlari', izoh: 'RabbitMQ, worker’lar', reja: true },
  { id: 'rate-limiting', tur: 'tizim', guruh: 'Ishonchlilik', sarlavha: 'Rate limiting', izoh: 'nginx limit_req, 429/503', reja: true },
]

export const darsTopish = (id) => DARSLAR.find((d) => d.id === id && !d.reja)
