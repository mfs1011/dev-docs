// HTTP laboratoriyasi sahifasini brauzerda ochadi, mavzular bo'yicha tayyor so'rovlarni yuboradi va skrinshot oladi.
//   URL=http://localhost:5182/web-asoslari/trenajor node web-trenajor/test/brauzer.mjs
import { chromium } from 'playwright-core'
import path from 'node:path'
import url from 'node:url'

const URL = process.env.URL ?? 'http://localhost:5182/web-asoslari/trenajor'
const shots = path.join(path.dirname(url.fileURLToPath(import.meta.url)), 'shots')
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1500, height: 1000 }, colorScheme: process.env.MAVZU ?? 'light' })
const xatolar = []
p.on('pageerror', (e) => xatolar.push(e.message))
p.on('console', (m) => { if (m.type() === 'error') xatolar.push(m.text()) })
const t0 = Date.now()
await p.goto(URL)
await p.waitForSelector('.tarmoq tbody tr', { timeout: 240000 })
console.log('birinchi javob:', ((Date.now() - t0) / 1000).toFixed(1), 's')
const yubor = async (mavzu, tayyor, nom) => {
  await p.click(`.mavzular button:has-text("${mavzu}")`)
  await p.click(`.tayyorlar button:has-text("${tayyor}")`)
  const oldin = await p.$$eval('.tarmoq tbody tr', (l) => l.length)
  await p.click('button.asosiy')
  await p.waitForFunction((n) => document.querySelectorAll('.tarmoq tbody tr').length > n, oldin, { timeout: 60000 })
  await p.waitForTimeout(2200)
  if (nom) await p.screenshot({ path: path.join(shots, nom + '.png') })
  const qator = await p.$eval('.tarmoq tbody tr', (x) => x.textContent.replace(/\s+/g, ' ').trim())
  const izoh = await p.$$eval('.tushuntirish li', (l) => l.map((x) => x.textContent.trim()).slice(0, 3))
  console.log(`${mavzu} / ${tayyor}: ${qator}\n   ${izoh.join('\n   ')}`)
}
await yubor('Redirect', '301 → 301 → 200', '1-redirect')
await yubor('Kesh', 'GET /static/logo.svg')
await p.click('.chiplar button:has-text("If-None-Match")')
await p.click('button.asosiy'); await p.waitForTimeout(3000)
console.log('304:', await p.$eval('.tarmoq tbody tr', (x) => x.textContent.replace(/\s+/g, ' ').trim()))
await p.screenshot({ path: path.join(shots, '2-kesh.png') })
await yubor('Cookie va sessiya', '/kirish')
await yubor('Cookie va sessiya', '/profil', '3-cookie')
await yubor('CORS', 'Preflight: yomon.test', '4-cors')
await yubor('Kesh', 'Sekin javob', '5-sekin')
await p.screenshot({ path: path.join(shots, 'web.png'), fullPage: true })
if (xatolar.length) console.log('XATOLAR:', xatolar)
await b.close()
