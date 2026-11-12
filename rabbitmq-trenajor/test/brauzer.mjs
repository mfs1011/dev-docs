// RabbitMQ trenajori sahifasini brauzerda ochadi: namuna topologiya avtomatik quriladi, so'ng tez panel orqali
// xabar, test xabarlari va auto-demo; har bosqichda skrinshot (test/shots/).
//   URL=http://localhost:5182/rabbitmq/trenajor node rabbitmq-trenajor/test/brauzer.mjs
import { chromium } from 'playwright-core'
import path from 'node:path'
import url from 'node:url'

const URL = process.env.URL ?? 'http://localhost:5182/rabbitmq/trenajor'
const shots = path.join(path.dirname(url.fileURLToPath(import.meta.url)), 'shots')
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1500, height: 1000 }, colorScheme: process.env.MAVZU ?? 'light' })
const xatolar = []
p.on('pageerror', (e) => xatolar.push(e.message))
p.on('console', (m) => { if (m.type() === 'error') xatolar.push(m.text()) })
const t0 = Date.now()
const s = () => ((Date.now() - t0) / 1000).toFixed(1) + ' s'
await p.goto(URL)
await p.waitForSelector('.boot', { state: 'detached', timeout: 240000 })
console.log('ochildi:', s())
// namuna: SMS worker'lari paydo bo'lguncha
await p.waitForSelector('.karta.con:has-text("Audit Log")', { timeout: 120000 })
console.log('namuna tayyor:', s())
const oqim = async (nom) => {
  const el = await p.$('.oqim-qator')
  await el.scrollIntoViewIfNeeded()
  await el.screenshot({ path: path.join(shots, nom + '.png') })
}
await p.waitForTimeout(1200)
await oqim('1-namuna')
// Web App: order.created
await p.click('.karta.yub:has-text("Web App") .yubor')
await p.waitForTimeout(450); await oqim('2-yolda')
await p.waitForTimeout(900); await oqim('3-navbatda')
await p.waitForTimeout(1600); await oqim('4-ishlandi')
// yo'naltirilmagan → AE → DLQ
await p.click('.chiplar button:has-text("payment.done")')
await p.click('.karta.yub:has-text("Cron Job") .yubor')
await p.waitForTimeout(1300); await oqim('5-ae')
// poison
await p.click('.chiplar button:has-text("order.created")')
await p.click('button:has-text("Poison xabar")')
await p.waitForTimeout(2600); await oqim('6-poison')
// topic'ga almashtirish va 5 ta xabar
await p.click('.seg button:has-text("topic")')
await p.waitForTimeout(2500)
await p.selectOption('select.soni', '5')
await p.click('button.asosiy:has-text("Yubor")')
await p.waitForTimeout(1500); await oqim('7-topic')
await p.waitForTimeout(4000)
await p.screenshot({ path: path.join(shots, 'rabbitmq.png'), fullPage: true })
console.log('jarayon:', (await p.$$eval('.jarayon li', (l) => l.map((x) => x.textContent.trim().replace(/\s+/g, ' ')))).slice(0, 4))
console.log('metrika:', (await p.$$eval('.metrikalar .m', (l) => l.map((x) => x.textContent.trim().replace(/\s+/g, ' ')))))
if (xatolar.length) console.log('XATOLAR:', xatolar)
await b.close()
