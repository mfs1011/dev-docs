// Nginx trenajori sahifasini brauzerda ochadi, terminalga buyruqlar yozadi va skrinshot oladi.
//   URL=http://localhost:5182/nginx/trenajor node nginx-trenajor/test/brauzer.mjs 'curl -s localhost/' ...
import { chromium } from 'playwright-core'
import path from 'node:path'
import url from 'node:url'

const URL = process.env.URL ?? 'http://localhost:5182/nginx/trenajor'
const shots = path.join(path.dirname(url.fileURLToPath(import.meta.url)), 'shots')
const buyruqlar = process.argv.slice(2)
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1500, height: 900 }, colorScheme: process.env.MAVZU ?? 'light' })
const xatolar = []
p.on('pageerror', (e) => xatolar.push(e.message))
p.on('console', (m) => { if (m.type() === 'error') xatolar.push(m.text()) })
await p.goto(URL)
await p.waitForSelector('.boot', { state: 'detached', timeout: 180000 })
console.log('ochildi:', await p.textContent('.ochildi'))
for (const q of buyruqlar) {
  await p.click('.term')
  await p.keyboard.type(q)
  await p.keyboard.press('Enter')
  await p.waitForTimeout(2500)
}
await p.waitForTimeout(2000)
await p.screenshot({ path: path.join(shots, process.env.NOM ?? 'nginx.png') })
console.log('so\'rovlar:', await p.$$eval('.royxat li', (l) => l.map((x) => x.textContent.trim().replace(/\s+/g, ' '))))
if (xatolar.length) console.log('XATOLAR:', xatolar)
await b.close()
