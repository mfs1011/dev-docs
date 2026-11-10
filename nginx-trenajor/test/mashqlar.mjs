// Nginx trenajori mashqlarini haqiqiy VM'da oxirigacha bajaradi: setup, keyin har qadam buyrug'i (cmd) va
// tekshiruvi (check). ran — buyruq regex'i — cmd ga mos kelishi shu yerda tekshiriladi.
//   node nginx-trenajor/test/mashqlar.mjs            — hammasi
//   node nginx-trenajor/test/mashqlar.mjs ng-16-kesh — bittasi; --chiqish — terminal chiqishini ham ko'rsatadi
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import url from 'node:url'
import { NGINX_MASHQLAR } from '../../src/nginx/mashqlar.js'

const args = process.argv.slice(2)
const tanlov = args.filter((a) => !a.startsWith('--'))
const mashqlar = NGINX_MASHQLAR.filter((m) => !tanlov.length || tanlov.includes(m.id))
const buyruq = path.join(path.dirname(url.fileURLToPath(import.meta.url)), 'buyruq.mjs')
const bir = (s) => s.split('\n').join('⏎')
let xato = 0

for (const m of mashqlar) {
  const qatorlar = [bir(`mkdir -p /tmp/mashq/${m.id} && cd /tmp/mashq/${m.id} && ( set -e\n${m.setup ?? ':'}\n) >/dev/null 2>&1; echo SETUP $?`)]
  m.steps.forEach((s, i) => {
    if (s.ran && !s.ran.test(s.cmd)) { console.log(`✗ ${m.id} ${i + 1}-qadam: ran regex cmd ga mos emas`); xato++ }
    qatorlar.push(bir(s.cmd))
    if (s.check) qatorlar.push(bir(`{ ${s.check}\n} >/dev/null 2>&1 && echo "CHECK ${i + 1} OK" || echo "CHECK ${i + 1} XATO"`))
  })
  const tmp = path.join(os.tmpdir(), `nginx-mashq-${process.pid}.txt`)
  fs.writeFileSync(tmp, qatorlar.join('\n') + '\n')
  const out = execFileSync('node', [buyruq, tmp, '--sorov', ...(args.includes('--xom') ? ['--xom'] : [])], { encoding: 'utf8', maxBuffer: 64 << 20, timeout: 15 * 60e3, env: { ...process.env, KUT: '4000' } })
  fs.unlinkSync(tmp)
  const yomon = [...out.matchAll(/^CHECK (\d+) XATO$/gm)].map((x) => x[1])
  const setup = out.match(/^SETUP (\d+)$/m)?.[1]
  const sorov = out.split("--- so'rovlar ---\n")[1]?.trim().split('\n').filter(Boolean).length ?? 0
  const ok = setup === '0' && !yomon.length
  if (!ok) xato++
  console.log(`${ok ? '✓' : '✗'} ${m.id}: setup=${setup}, xato qadamlar: ${yomon.join(',') || 'yo‘q'}, sxemadagi so‘rovlar: ${sorov}`)
  if (!ok || args.includes('--chiqish')) console.log(out)
}
process.exit(xato ? 1 : 0)
