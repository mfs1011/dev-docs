// RabbitMQ trenajori sahifasini brauzerda ochadi, panel orqali ssenariy bajaradi va skrinshot oladi.
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
await p.goto(URL)
await p.waitForSelector('.boot', { state: 'detached', timeout: 240000 })
await p.waitForSelector('.oqim', { timeout: 120000 })
console.log('ochildi:', ((Date.now() - t0) / 1000).toFixed(1), 's')
const tab = (t) => p.click(`.tablar button:has-text("${t}")`)
const natija = async () => { await p.waitForSelector('.natija', { timeout: 30000 }); return p.textContent('.natija') }
// navbat
await tab('Navbat'); await p.fill('form label:has-text("Nomi") input', 'ishlar'); await p.click('form .asosiy'); console.log('navbat:', await natija())
// consumer (ishlov 400 ms)
await p.waitForTimeout(1500)
await tab('Consumer'); await p.selectOption('form label:has-text("Navbat") select', 'ishlar')
await p.fill('form label:has-text("Ishlov") input', '400'); await p.click('form .asosiy'); console.log('consumer:', await natija())
// yuborish 5 ta
await tab('Yuborish'); await p.selectOption('form label:has-text("Exchange") select', '')
await p.fill('form label:has-text("Routing key") input', 'ishlar'); await p.fill('form label:has-text("Soni") input', '5')
await p.click('form .asosiy'); console.log('yuborish:', await natija())
await p.waitForTimeout(600)
await p.screenshot({ path: path.join(shots, 'oqim.png') })
await p.waitForTimeout(4000)
await p.screenshot({ path: path.join(shots, 'rabbitmq.png'), fullPage: true })
console.log('jurnal:', (await p.$$eval('.jurnal li', (l) => l.map((x) => x.textContent.trim().replace(/\s+/g, ' ')))).slice(0, 6))
if (xatolar.length) console.log('XATOLAR:', xatolar)
await b.close()
