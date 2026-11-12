// Mashqni brauzerda panel orqali bajaradi va qadamlar avtomatik belgilanishini tekshiradi.
//   node rabbitmq-trenajor/test/mashq.mjs fanout
import { chromium } from 'playwright-core'
import path from 'node:path'
import url from 'node:url'

const id = process.argv[2] ?? 'fanout'
const URL = (process.env.URL ?? 'http://localhost:5182/rabbitmq/trenajor') + '?mashq=' + id
const shots = path.join(path.dirname(url.fileURLToPath(import.meta.url)), 'shots')
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1500, height: 1000 } })
const xatolar = []
p.on('pageerror', (e) => xatolar.push(e.message))
await p.goto(URL)
await p.waitForSelector('.oqim', { timeout: 240000 })
await p.waitForTimeout(1500)
const tab = (t) => p.click(`.tablar button:has-text("${t}")`)
const asosiy = async () => { await p.click('form .asosiy'); await p.waitForSelector('.panel .natija'); await p.waitForTimeout(1300) }
const qadam = async () => p.$$eval('.steps li.ok', (l) => l.length)
const QADAMLAR = {
  fanout: async () => {
    await tab('Exchange'); await p.fill('form label:has-text("Nomi") input', 'hodisa'); await p.selectOption('form label:has-text("Turi") select', 'fanout'); await asosiy()
    console.log('1-qadamdan keyin:', await qadam())
    for (const n of ['xat', 'analitika']) { await tab('Navbat'); await p.fill('form label:has-text("Nomi") input', n); await asosiy() }
    for (const n of ['xat', 'analitika']) {
      await tab("Bog'lash"); await p.selectOption('form label:has-text("Exchange") select', 'hodisa')
      await p.selectOption('form label:has-text("Navbat") select', n); await p.fill('form label:has-text("Binding key") input', ''); await asosiy()
    }
    console.log('2-qadamdan keyin:', await qadam())
    await tab('Yuborish'); await p.selectOption('form label:has-text("Exchange") select', 'hodisa'); await p.fill('form label:has-text("Soni") input', '1'); await asosiy()
    await p.waitForTimeout(1500)
    console.log('3-qadamdan keyin:', await qadam())
  },
  tasdiq: async () => {
    await tab('Navbat'); await p.fill('form label:has-text("Nomi") input', 'tasdiq'); await asosiy()
    await tab('Yuborish'); await p.selectOption('form label:has-text("Exchange") select', ''); await p.fill('form label:has-text("Routing key") input', 'tasdiq'); await p.fill('form label:has-text("Soni") input', '1'); await asosiy()
    await p.waitForTimeout(1500); console.log('1:', await qadam())
    await tab('Consumer'); await p.selectOption('form label:has-text("Navbat") select', 'tasdiq'); await p.fill('form label:has-text("Ishlov") input', '0')
    await p.selectOption('form label:has-text("ishlagach") select', 'crash'); await asosiy(); await p.waitForTimeout(1500); console.log('2:', await qadam())
    await tab('Consumer'); await p.selectOption('form label:has-text("ishlagach") select', 'ack'); await asosiy(); await p.waitForTimeout(2000); console.log('3:', await qadam())
  },
}
await QADAMLAR[id]()
console.log('tugadi:', !!(await p.$('.tugadi')))
await p.screenshot({ path: path.join(shots, `mashq-${id}.png`) })
if (xatolar.length) console.log('XATOLAR:', xatolar)
await b.close()
