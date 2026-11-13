// Redis trenajori sahifasini brauzerda ochadi, panel orqali har turdagi buyruqlarni bajaradi va skrinshot oladi.
//   URL=http://localhost:5182/redis/trenajor node redis-trenajor/test/brauzer.mjs
import { chromium } from 'playwright-core'
import path from 'node:path'
import url from 'node:url'

const URL = process.env.URL ?? 'http://localhost:5182/redis/trenajor'
const shots = path.join(path.dirname(url.fileURLToPath(import.meta.url)), 'shots')
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1500, height: 1000 } })
const xatolar = []
p.on('pageerror', (e) => xatolar.push(e.message))
p.on('console', (m) => { if (m.type() === 'error') xatolar.push(m.text()) })
const t0 = Date.now()
await p.goto(URL)
await p.waitForSelector('.kalitlar', { timeout: 240000 })
console.log('ochildi:', ((Date.now() - t0) / 1000).toFixed(1), 's')
if (process.env.MAVZU === 'dark') await p.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'))
const bajar = async (q, ms = 900) => {
  await p.fill('.qator input', q)
  await p.click('button.asosiy')
  await p.waitForTimeout(ms)
  return p.$eval('.javob pre', (x) => x.textContent)
}
for (const q of ['SET sessiya:ali token123 EX 12', 'INCR sahifa:korishlar', 'INCR sahifa:korishlar', 'LPUSH ishlar rasm-1 rasm-2 rasm-3',
  'HSET foydalanuvchi:1 ism Ali shahar Toshkent yosh 30', 'SADD teglar:1 redis kesh tez', 'ZADD reyting 120 ali 95 vali 150 gulnora',
  'XADD hodisalar * tur buyurtma id 42', 'XGROUP CREATE hodisalar ishchilar 0']) {
  console.log(q.padEnd(52), '→', (await bajar(q)).replace(/\n/g, ' | ').slice(0, 60))
}
await p.waitForTimeout(800)
await p.screenshot({ path: path.join(shots, '1-turlar.png') })
await bajar('ZINCRBY reyting 80 vali', 300)
await p.waitForTimeout(250)
await p.screenshot({ path: path.join(shots, '2-zincrby.png') })
await p.fill('.pubsub .forma input >> nth=0', 'mobil'); await p.click('.pubsub button:has-text("Obunachi")'); await p.waitForTimeout(1200)
await p.fill('.pubsub .forma input >> nth=0', 'email'); await p.click('.pubsub button:has-text("Obunachi")'); await p.waitForTimeout(1200)
await p.click('.pubsub button:has-text("PUBLISH")'); await p.waitForTimeout(800)
console.log('pubsub:', await p.$eval('.pubsub .natija', (x) => x.textContent))
await p.waitForTimeout(10000)
await p.screenshot({ path: path.join(shots, '3-expired.png') })
console.log('oqim:', (await p.$$eval('.oqim li', (l) => l.map((x) => x.textContent.replace(/\s+/g, ' ').trim()))).slice(0, 5))
await p.screenshot({ path: path.join(shots, 'redis.png'), fullPage: true })
if (xatolar.length) console.log('XATOLAR:', xatolar)
await b.close()
