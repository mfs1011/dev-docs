// Docker trenajori sahifasini brauzerda ochadi, terminalga buyruqlar yozadi, xarita va skrinshotlarni tekshiradi.
//   URL=http://localhost:5191/docker/trenajor node docker-trenajor/test/brauzer.mjs [--kenglik 390]
import { chromium } from 'playwright-core'
import path from 'node:path'
import fs from 'node:fs'

const URL = process.env.URL ?? 'http://localhost:5191/docker/trenajor'
const kenglik = Number(process.argv[process.argv.indexOf('--kenglik') + 1]) || 1500
const shots = path.join(import.meta.dirname, 'shots')
fs.mkdirSync(shots, { recursive: true })
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: kenglik, height: kenglik < 600 ? 900 : 1050 } })
const xatolar = []
p.on('pageerror', (e) => xatolar.push(e.message))
p.on('console', (m) => { if (m.type() === 'error') xatolar.push(m.text()) })
await p.goto(URL)
await p.waitForSelector('.xterm-screen', { timeout: 60000 })
await p.waitForTimeout(800)
const ekran = () => p.evaluate(() => {
  const t = document.querySelector('.xterm-rows')
  return [...t.children].map((r) => r.textContent).join('\n')
})
const yoz = async (cmd, kut = 1500) => {
  await p.click('.xterm-screen')
  await p.keyboard.type(cmd, { delay: 8 })
  await p.keyboard.press('Enter')
  await p.waitForTimeout(kut)
}
await yoz('docker run hello-world', 4500)
await yoz('docker ps -a', 900)
await yoz('docker run -d --name veb -p 8080:80 nginx:1.29', 9000)
await yoz('curl -s localhost:8080 | head -4', 1200)
await yoz('docker network create ilova-tarmoq', 700)
await yoz('docker volume create malumot', 700)
await yoz('docker run -d --name db --network ilova-tarmoq -v malumot:/data alpine sleep 600', 3500)
await yoz('docker images', 900)
console.log(await ekran())
await p.screenshot({ path: path.join(shots, `sahifa-${kenglik}.png`), fullPage: true })
// -it sessiya
await yoz('docker exec -it veb sh', 1200)
await yoz('ls /usr/share/nginx/html', 800)
await yoz('exit', 900)
const oxir = await ekran()
console.log('---- -it ----\n' + oxir.split('\n').slice(-8).join('\n'))
const hikoya = await p.$$eval('.voqealar li', (x) => x.slice(0, 6).map((l) => l.textContent.trim()))
console.log('---- hikoya ----\n' + hikoya.join('\n'))
console.log('xatolar:', xatolar.length ? xatolar : 'yo‘q')
await b.close()
