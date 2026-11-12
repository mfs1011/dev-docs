// RabbitMQ trenajori: namuna topologiya va tez boshqaruv yordamchilari.
// Hamma amal VM'dagi haqiqiy brokerda (rmq-boshqaruv → HTTP API / AMQP) bajariladi.

export const ILOVALAR = [
  { nom: 'Web App', izoh: 'Saytdan buyurtma yaratadi.', rang: '#ea580c' },
  { nom: 'Mobile App', izoh: 'Ilovadan buyurtma yuboradi.', rang: '#2563eb' },
  { nom: 'Cron Job', izoh: 'Rejadagi vazifa xabar chiqaradi.', rang: '#7c3aed' },
]

// Namuna: buyurtmalar exchange'i, uchta navbat (email, sms — 3 worker, audit), o'lik xatlar uchun DLX + DLQ.
// Yo'naltirilmagan xabarlar ham yo'qolmasligi uchun buyurtmalar'da alternate-exchange = olik-xatlar.
export const NAMUNA = {
  exchange: 'buyurtmalar',
  dlx: 'olik-xatlar',
  dlq: 'olik-xatlar-navbati',
  navbatlar: [
    { nom: 'email', kalit: 'order.created', headers: { 'x-match': 'any', kanal: 'email' }, workerlar: ['Email Service'] },
    { nom: 'sms', kalit: 'order.*', headers: { 'x-match': 'all', kanal: 'sms', urgent: 'yes' }, workerlar: ['SMS Worker 1', 'SMS Worker 2', 'SMS Worker 3'] },
    { nom: 'audit', kalit: '#', headers: { 'x-match': 'any', log: 'true' }, workerlar: ['Audit Log'] },
  ],
}
export const NAMUNA_KECHIKISH = 700  // consumer ishlov vaqti (ms) — harakat ko'zga ko'rinsin

export const KALITLAR = ['order.created', 'order.shipped', 'payment.done', 'user.login']
export const HEADERLAR = ['kanal=email', 'kanal=sms, urgent=yes', 'kanal=sms', 'log=true']
export const TANALAR = ['{"orderId": 123, "amount": 50}', '{"userId": 7, "event": "login"}', '{"paymentId": "p_99", "status": "done"}']

/** "a=b, c=d" → { a: 'b', c: 'd' } */
export function headerlarniOqi(matn) {
  const h = {}
  for (const qism of (matn ?? '').split(',')) {
    const [k, ...v] = qism.split('=')
    if (k?.trim()) h[k.trim()] = v.join('=').trim()
  }
  return h
}
export const headerMatn = (a) => Object.entries(a ?? {}).filter(([k]) => k !== 'x-match').map(([k, v]) => `${k}=${v}`).join(', ')

/** Namuna topologiyani noldan quradi. bosqich(matn) — jarayonni ko'rsatish uchun. */
export async function namunaQur(buyruq, { tur = 'direct', avtoAck = false, bosqich = () => {} } = {}) {
  const N = NAMUNA
  bosqich('Broker tozalanmoqda…')
  await buyruq('tozala')
  bosqich('O‘lik xatlar: olik-xatlar (fanout) + olik-xatlar-navbati')
  await buyruq('exchange.declare', { nom: N.dlx, tur: 'fanout' })
  await buyruq('queue.declare', { nom: N.dlq, args: { 'x-queue-type': 'classic' } })
  await buyruq('bind', { exchange: N.dlx, navbat: N.dlq, kalit: '' })
  bosqich(`Exchange: ${N.exchange} (${tur}), alternate-exchange → ${N.dlx}`)
  await buyruq('exchange.declare', { nom: N.exchange, tur, args: { 'alternate-exchange': N.dlx } })
  for (const n of N.navbatlar) {
    bosqich(`Navbat: ${n.nom} + binding + ${n.workerlar.length} ta consumer`)
    await buyruq('queue.declare', { nom: n.nom, args: { 'x-queue-type': 'classic', 'x-dead-letter-exchange': N.dlx } })
    await buyruq('bind', bogArg(N.exchange, n.nom, tur, n.kalit, n.headers))
    for (const w of n.workerlar) {
      await buyruq('consumer.start', { navbat: n.nom, nom: w, prefetch: 1, avto_ack: avtoAck, kechikish_ms: NAMUNA_KECHIKISH })
    }
  }
  bosqich('')
}

function bogArg(exchange, navbat, tur, kalit, headers) {
  return tur === 'headers'
    ? { exchange, navbat, kalit: '', args: headers ?? { 'x-match': 'all' } }
    : { exchange, navbat, kalit: kalit ?? '' }
}

/** Exchange turini almashtirish: RabbitMQ'da tur o'zgarmaydi — o'chirib, yangi tur bilan qayta e'lon qilinadi
 *  va bog'lanishlar qayta qo'yiladi (namuna navbatlari uchun tegishli kalit/header'lar bilan). */
export async function turAlmashtir(buyruq, holat, nom, tur) {
  const ex = holat.exchangelar.find((e) => e.nom === nom)
  const boglar = holat.boglanishlar.filter((b) => b.exchange === nom)
  await buyruq('exchange.delete', { nom })
  await buyruq('exchange.declare', { nom, tur, args: ex?.args ?? {} })
  for (const b of boglar) {
    const n = NAMUNA.navbatlar.find((x) => x.nom === b.navbat)
    const kalit = b.kalit || n?.kalit || ''
    const headers = n?.headers ?? (Object.keys(b.args ?? {}).length ? b.args : { 'x-match': 'all' })
    await buyruq('bind', bogArg(nom, b.navbat, tur, kalit, headers))
  }
}

export const EX_IZOH = {
  direct: 'Routing key binding key bilan aynan teng bo‘lgan navbatga beradi.',
  fanout: 'Kalitga qaramaydi — har bog‘langan navbatga nusxa.',
  topic: 'Kalit andozasi: * — bitta so‘z, # — nol yoki ko‘p so‘z.',
  headers: 'Routing key emas — xabar header’lari binding argumentlariga mos kelsa.',
}
