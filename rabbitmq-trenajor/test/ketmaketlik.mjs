// Animatsiya ketma-ketligini tekshiradi: har navbatda consumer'ga o'tgan xatlar soni shu paytgacha navbatga yetib
// kelgan (publish yoki nack bilan qaytgan) xatlar sonidan oshmasligi kerak. Sahifa dev rejimida window.__rmqIz ga
// hodisalarni yozadi (Sxema.vue: izla).
//   URL=http://localhost:5182/rabbitmq/trenajor node rabbitmq-trenajor/test/ketmaketlik.mjs
import { chromium } from 'playwright-core'

const URL = process.env.URL ?? 'http://localhost:5182/rabbitmq/trenajor'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1500, height: 1000 } })
const xatolar = []
p.on('pageerror', (e) => xatolar.push(e.message))
await p.goto(URL)
await p.waitForSelector('.karta.con:has-text("Audit Log")', { timeout: 240000 })
await p.waitForTimeout(1500)
await p.evaluate(() => { window.__rmqIz = [] })

const kut = (ms) => p.waitForTimeout(ms)
const ssenariylar = [
  ['bitta xabar (direct)', async () => { await p.click('.karta.yub:has-text("Web App") .yubor'); await kut(4000) }],
  ['5 ta birdan (topic, 3 worker)', async () => {
    await p.click('.seg button:has-text("topic")'); await kut(3000)
    await p.selectOption('select.soni', '5'); await p.click('button.asosiy:has-text("Yubor")'); await kut(9000)
    await p.selectOption('select.soni', '1')
  }],
  ['ishlov xato (nack → qayta)', async () => { await p.click('button:has-text("Ishlov xato")'); await kut(6000) }],
  ['poison (reject → DLQ)', async () => { await p.click('button:has-text("Poison xabar")'); await kut(5000) }],
  ['tezlik 2× va 5 ta', async () => {
    await p.fill('.tezlik input', '2'); await p.dispatchEvent('.tezlik input', 'input')
    await p.selectOption('select.soni', '5'); await p.click('button.asosiy:has-text("Yubor")'); await kut(7000)
  }],
]

let jamiXato = 0
for (const [nom, f] of ssenariylar) {
  await p.evaluate(() => { window.__rmqIz = [] })
  await f()
  const iz = await p.evaluate(() => window.__rmqIz)
  const keldi = {}, ketdi = {}
  const buzilish = []
  for (const h of iz) {
    if (h.tur === 'navbatga-yetdi' || h.tur === 'qaytdi') keldi[h.q] = (keldi[h.q] ?? 0) + 1
    if (h.tur === 'son' && !(keldi[h.q] > 0)) buzilish.push(`${h.q}: son ${h.tayyor} ga oshdi, lekin hali hech bir xat yetib kelmagan`)
    if (h.tur === 'consumerga') {
      ketdi[h.q] = (ketdi[h.q] ?? 0) + 1
      if (ketdi[h.q] > (keldi[h.q] ?? 0)) buzilish.push(`${h.q}: ${ketdi[h.q]}-xat consumer'ga (${h.c}) o'tdi, navbatga esa ${keldi[h.q] ?? 0} ta yetgan`)
    }
  }
  const consumerga = iz.filter((h) => h.tur === 'consumerga').length
  console.log(`${buzilish.length ? 'XATO' : 'OK  '} ${nom}: publish ${iz.filter((h) => h.tur === 'publish').length}, navbatga ${iz.filter((h) => h.tur === 'navbatga-yetdi').length}, qaytdi ${iz.filter((h) => h.tur === 'qaytdi').length}, consumer'ga ${consumerga}`)
  for (const x of buzilish) console.log('     ', x)
  jamiXato += buzilish.length
  if (!consumerga) { console.log('      consumer hodisasi yo‘q — ssenariy ishlamadi'); jamiXato++ }
}
if (xatolar.length) { console.log('SAHIFA XATOLARI:', xatolar); jamiXato++ }
await b.close()
process.exit(jamiXato ? 1 : 0)
