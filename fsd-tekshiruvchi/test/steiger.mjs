// FSD tekshiruvchisi mashqlari haqiqiy Steiger CLI bilan (steiger 0.7.0 + plugin 0.8.0):
// toza asos — 0 ta xato; har mashq boshida qaysi xatolar chiqadi; har qadam yechimidan keyin qadam o'tadimi.
//   node fsd-tekshiruvchi/test/steiger.mjs [mashq-id ...]
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { ASOS, MASHQLAR } from '../../src/fsd/mashqlar.js'

const ILOVA = path.resolve(import.meta.dirname, '../..')
const TSCONFIG = { compilerOptions: { baseUrl: '.', paths: { '@/*': ['./src/*'] }, module: 'esnext', moduleResolution: 'bundler', jsx: 'react-jsx' } }

function steiger(fayllar) {
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
  fs.rmSync(d, { recursive: true, force: true })
  const list = JSON.parse(out || '[]')
  return list.map((x) => ({ qoida: x.ruleName.replace(/^fsd\//, ''), yol: path.relative(d, x.location.path.replace(/^\/private/, '')).replace(/^.*?src\//, 'src/'), xabar: x.message }))
}
const chiz = (ms) => ms.map((m) => `      ${m.qoida} | ${m.yol} | ${m.xabar}`).join('\n')

let fail = 0
const asos = steiger(ASOS)
console.log(`asos: ${asos.length} ta xato${asos.length ? '\n' + chiz(asos) : ''}`)
if (asos.length) fail++
const only = process.argv.slice(2)
for (const m of MASHQLAR) {
  if (only.length && !only.includes(m.id)) continue
  let f = { ...m.fayllar }
  const bosh = steiger(f)
  console.log(`▶ ${m.id}: boshida ${bosh.length} ta\n${chiz(bosh)}`)
  for (const [i, s] of m.steps.entries()) {
    if (s.yechim) for (const [k, v] of Object.entries(s.yechim)) (v === null ? delete f[k] : (f[k] = v))
    const muammolar = steiger(f)
    const ok = !!s.check({ muammolar, fayllar: f, tanlangan: muammolar[0] ?? bosh[0] })
    if (!ok) fail++
    console.log(`  ${ok ? '✓' : '✗'} ${i + 1}. ${s.text.slice(0, 70)}${ok ? '' : '\n' + chiz(muammolar)}`)
  }
}
console.log(fail ? `\n${fail} ta xato` : "\nhammasi o'tdi")
process.exit(fail ? 1 : 0)
