// FSD trenajori brauzerda: (1) brauzerdagi Steiger natijasi Steiger CLI bilan bir xilmi — asos va har mashq
// boshlang'ich holati; (2) har qadam: yechimsiz o'tmaydi, yechim qo'llangach o'tadi.
//   npx vite --port 5181 &  node fsd-tekshiruvchi/test/brauzer.mjs
import { chromium } from 'playwright-core'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { ASOS, MASHQLAR } from '../../src/fsd/mashqlar.js'

const BASE = process.env.URL ?? 'http://localhost:5181'
const ILOVA = path.resolve(import.meta.dirname, '../..')
const TSCONFIG = { compilerOptions: { baseUrl: '.', paths: { '@/*': ['./src/*'] }, module: 'esnext', moduleResolution: 'bundler', jsx: 'react-jsx' } }

function cli(fayllar) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'fsd-'))
  fs.writeFileSync(path.join(d, 'tsconfig.json'), JSON.stringify(TSCONFIG))
  fs.writeFileSync(path.join(d, 'steiger.config.ts'), "import { defineConfig } from 'steiger'\nimport fsd from '@feature-sliced/steiger-plugin'\n\nexport default defineConfig([...fsd.configs.recommended])\n")
  fs.symlinkSync(path.join(ILOVA, 'node_modules'), path.join(d, 'node_modules'))
  for (const [p, t] of Object.entries(fayllar)) {
    fs.mkdirSync(path.dirname(path.join(d, p)), { recursive: true })
    fs.writeFileSync(path.join(d, p), t)
  }
  let out
  try {
    out = execFileSync(path.join(ILOVA, 'node_modules/.bin/steiger'), ['src', '--reporter', 'json'], { cwd: d, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
  } catch (e) {
    out = e.stdout
  }
  const real = fs.realpathSync(d)
  fs.rmSync(d, { recursive: true, force: true })
  return JSON.parse(out || '[]').map((x) => `${x.ruleName.replace(/^fsd\//, '')} | ${path.relative(real, x.location.path)} | ${x.message}`).sort()
}

const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1680, height: 1000 } })
const errs = []
p.on('pageerror', (e) => errs.push(String(e)))
let fail = 0

// 1. brauzer va CLI natijasi
await p.goto(`${BASE}/fsd/trenajor`)
await p.waitForSelector('.muammolar .toza, .muammolar article', { timeout: 30000 })
for (const [nom, f] of [['asos', ASOS], ...MASHQLAR.map((m) => [m.id, m.fayllar])]) {
  const br = (await p.evaluate(async (f) => (await import('/src/fsd/steiger.js')).tekshir(f), f)).map((d) => `${d.qoida} | ${d.yol} | ${d.xabar}`).sort()
  const c = cli(f)
  const teng = JSON.stringify(br) === JSON.stringify(c)
  if (!teng) fail++
  console.log(`${teng ? '✓' : '✗'} Steiger brauzer = CLI: ${nom} (${c.length} ta)${teng ? '' : `\n   brauzer: ${br.join('\n            ')}\n   cli:     ${c.join('\n            ')}`}`)
}

// 2. mashq qadamlari
const okSoni = () => p.locator('.steps > li.ok').count()
async function kut(n, ms) {
  const t = Date.now()
  while (Date.now() - t < ms) {
    if ((await okSoni()) >= n) return true
    await p.waitForTimeout(150)
  }
  return false
}
for (const m of MASHQLAR) {
  await p.goto(`${BASE}/fsd/trenajor?mashq=${m.id}`)
  await p.waitForSelector('.muammolar article', { timeout: 30000 })
  console.log(`▶ ${m.id}`)
  for (const [i, s] of m.steps.entries()) {
    if (s.yechim) {
      await p.waitForTimeout(600)
      if ((await okSoni()) > i) { console.log(`  ✗ ${i + 1}. yechimsiz o‘tib ketdi`); fail++ }
      await p.locator('.steps > li.cur .yordam').click()
      await p.locator('.steps > li.cur button', { hasText: 'Yechimni loyihaga qo‘llash' }).click()
    } else {
      // «muammoni bosing» qadami — birinchi muammo bosiladi
      await p.locator('.muammolar article').first().click()
    }
    const ok = await kut(i + 1, 8000)
    if (!ok) fail++
    console.log(`  ${ok ? '✓' : '✗'} ${i + 1}. ${s.text.slice(0, 80)}`)
    if (!ok) break
  }
  await p.screenshot({ path: path.join(os.tmpdir(), `fsd-${m.id}.png`) })
}
if (errs.length) console.log('\nBrauzer xatolari:\n' + [...new Set(errs)].join('\n'))
await b.close()
console.log(fail ? `\n${fail} ta xato` : "\nhammasi o'tdi")
process.exit(fail ? 1 : 0)
