#!/usr/bin/env node
/**
 * Vizual darslar brauzer testi (docs/vizualizator/README.md 7).
 *
 *   npx vite --port 5182 &   node scripts/sahna-brauzer.mjs [http://localhost:5182] [skrinshot_papka]
 *
 * Har darsning har qadami: 1440, 1024, 390 px; yorug' va qorong'i. Tekshiradi:
 *  - JS xatosi yo'q (pageerror, console.error);
 *  - sahnadagi tugun kartalari bir-biriga tegmaydi (bounding box kesishuvi);
 *  - sahifa gorizontal toshmaydi (scrollWidth ≤ kenglik);
 *  - inspektor ochiladi (paket darslarida).
 * Skrinshot papkasi berilsa — har holat surati (ko'z bilan tekshirish uchun, README 7: vizual audit majburiy).
 */
import { chromium } from 'playwright-core'

const asos = process.argv[2] ?? 'http://localhost:5182'
const papka = process.argv[3]
const DARSLAR = [
  { yol: '/paketlar/http-1-1', qadamlar: 7, paket: true },
  { yol: '/paketlar/tcp', qadamlar: 7, paket: true },
  { yol: '/paketlar/dns', qadamlar: 8, paket: true },
  { yol: '/paketlar/tls-1-3', qadamlar: 8, paket: true },
  { yol: '/paketlar/redirect', qadamlar: 7, paket: true },
  { yol: '/paketlar/kesh-304', qadamlar: 5, paket: true },
  { yol: '/paketlar/siqish', qadamlar: 5, paket: true },
  { yol: '/paketlar/http2', qadamlar: 7, paket: true },
  { yol: '/paketlar/cookie', qadamlar: 5, paket: true },
  { yol: '/paketlar/cors', qadamlar: 6, paket: true },
  { yol: '/paketlar/http-auth', qadamlar: 5, paket: true },
  { yol: '/paketlar/mitm', qadamlar: 6, paket: true },
  { yol: '/arxitektura/darslar/load-balancing', qadamlar: 8 },
]
const KENGLIK = [[1440, 900], [1024, 768], [390, 844]]
let xato = 0
const yiqil = (m) => { xato++; console.log('  ✗ ' + m) }

const b = await chromium.launch()
for (const tema of ['light', 'dark']) {
  for (const [w, h] of KENGLIK) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, colorScheme: tema, deviceScaleFactor: 1 })
    await ctx.addInitScript((t) => { try { localStorage.setItem('docs-theme', t) } catch {} }, tema)
    const p = await ctx.newPage()
    const xatolar = []
    p.on('pageerror', (e) => xatolar.push(e.message))
    p.on('console', (m) => { if (m.type() === 'error') xatolar.push(m.text()) })
    for (const d of DARSLAR) {
      for (let q = 1; q <= d.qadamlar; q++) {
        await p.goto(`${asos}${d.yol}?q=${q}`, { waitUntil: 'networkidle' })
        await p.waitForTimeout(900)
        const nom = `${d.yol.split('/').pop()} q${q} ${w}px ${tema}`
        const r = await p.evaluate(() => {
          const kartalar = [...document.querySelectorAll('.sahna-svg .tugun .yorliq-fon')].map((e) => e.getBoundingClientRect())
          let kesish = 0
          for (let i = 0; i < kartalar.length; i++) for (let j = i + 1; j < kartalar.length; j++) {
            const a = kartalar[i], c = kartalar[j]
            if (a.left < c.right && c.left < a.right && a.top < c.bottom && c.top < a.bottom) kesish++
          }
          // sahna ustidagi kartalar (hisob, vaqt) tugunlarni yopmasin
          for (const k of document.querySelectorAll('.s-karta')) {
            const c = k.getBoundingClientRect()
            for (const a of kartalar) if (a.left < c.right && c.left < a.right && a.top < c.bottom && c.top < a.bottom) kesish++
          }
          return { kesish, tugun: kartalar.length, toshish: document.documentElement.scrollWidth - innerWidth }
        })
        if (r.tugun === 0) yiqil(`${nom}: sahnada tugun yo'q`)
        if (r.kesish) yiqil(`${nom}: ${r.kesish} juft tugun ustma-ust`)
        if (r.toshish > 1) yiqil(`${nom}: gorizontal toshish ${r.toshish}px`)
        if (papka && (q === 1 || q === d.qadamlar || w === 390)) await p.screenshot({ path: `${papka}/${nom.replace(/ /g, '_')}.png` })
      }
      if (d.paket) {
        await p.goto(`${asos}${d.yol}?q=5&p=10`, { waitUntil: 'networkidle' })
        await p.waitForTimeout(700)
        const ins = await p.locator('.inspektor').count()
        const belgi = await p.locator('.hex .b').count()
        if (!ins) yiqil(`inspektor ochilmadi (${w}px ${tema})`)
        if (!belgi) yiqil(`inspektorda baytlar belgilanmadi (${w}px ${tema})`)
        if (papka) await p.screenshot({ path: `${papka}/inspektor_${w}px_${tema}.png` })
      }
    }
    for (const x of xatolar) yiqil(`${w}px ${tema}: ${x.slice(0, 200)}`)
    await ctx.close()
  }
}
await b.close()
console.log(xato ? `\n${xato} ta muammo` : `\nhammasi joyida: ${DARSLAR.length} dars × qadamlar × 3 kenglik × 2 tema`)
process.exit(xato ? 1 : 0)
