// Web asoslari laboratoriyasi: nginx trenajori tasvirida (nginx-trenajor/build/web) laboratoriyani sozlab,
// so'rovlar ro'yxatini haqiqiy curl bilan bajaradi va natijani (src/web/lab.js bilan o'qilgan) chiqaradi.
//   node web-trenajor/test/lab.mjs web-trenajor/test/sorovlar.json
// sorovlar.json: [{ "usul": "GET", "url": "http://api.test:8080/eski", "ergash": true }, ...]
import { V86 } from 'v86'
import { symlinkTuzat } from '../../linux-trenajor/scripts/v86-tuzat.mjs'
import { yangiLab } from '../../src/web/lab.js'
import { LAB_FAYLLAR, SOZLA } from '../lab-fayllar.mjs'
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const ROOT = path.join(path.dirname(url.fileURLToPath(import.meta.url)), '..', '..')
const pub = path.join(ROOT, 'public', 'trenajor'), web = path.join(ROOT, 'nginx-trenajor', 'build', 'web')
const sorovlar = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
const t0 = Date.now()
const vaqt = () => ((Date.now() - t0) / 1000).toFixed(1) + 's'

const vm = new V86({
  wasm_path: path.join(pub, 'v86.wasm'), bios: { url: path.join(pub, 'bios/seabios.bin') }, vga_bios: { url: path.join(pub, 'bios/vgabios.bin') },
  filesystem: { basefs: path.join(web, 'fs/fs.json'), baseurl: path.join(web, 'fs/base/') },
  initial_state: { url: path.join(web, 'holat.zst') },
  memory_size: 256 << 20, autostart: true, disable_keyboard: true, disable_mouse: true, uart1: true,
})
symlinkTuzat(vm)
const lab = yangiLab((b) => vm.serial_send_bytes(1, b))
vm.add_listener('serial1-output-byte', (b) => lab.bayt(b))
let term = ''
vm.add_listener('serial0-output-byte', (b) => { term += String.fromCharCode(b) })
const kut = (ms) => new Promise((r) => setTimeout(r, ms))

vm.add_listener('emulator-ready', async () => {
  try {
    while (!vm.is_running()) await kut(50)
    for (const [nom, matn] of Object.entries(LAB_FAYLLAR)) await vm.create_file(`/root/.lab-${nom}`, new TextEncoder().encode(matn))
    vm.serial0_send(`${Math.floor(Date.now() / 1000)} 100 40\n`)
    await kut(1500)
    vm.serial0_send(`${SOZLA}\n`)
    for (let i = 0; !lab.tayyor && i < 600; i++) await kut(100)
    console.log(vaqt(), 'lab tayyor:', lab.tayyor)
    if (!lab.tayyor) console.log(term.replace(/\x1b\[[0-9;?]*[a-zA-Z]/g, '').slice(-2000))
    for (const s of sorovlar) {
      const n = await lab.sorov(s)
      console.log(`\n=== ${s.usul} ${s.url}${s.ergash ? ' (-L)' : ''}${s.cookie ? ' (cookie)' : ''}${s.siqish ? ' (--compressed)' : ''}  curl=${n.kod} ${n.xato}`)
      for (const h of n.hoplar) {
        console.log('  >', h.sorov.qator, '|', h.sorov.headerlar.map(([k, v]) => `${k}: ${v}`).join(' | '))
        console.log('  <', h.javob.qator, '|', h.javob.headerlar.map(([k, v]) => `${k}: ${v}`).join(' | '))
      }
      console.log('  w:', JSON.stringify({ kod: n.w.http_code, redir: n.w.num_redirects, dns: n.w.time_namelookup, tcp: n.w.time_connect, ttfb: n.w.time_starttransfer, jami: n.w.time_total, hajm: n.w.size_download }))
      if (n.tana) console.log('  tana:', JSON.stringify(n.tana.slice(0, 160)))
      if (n.cookielar.length) console.log('  cookie:', JSON.stringify(n.cookielar))
    }
  } catch (e) {
    console.log('XATO', e)
  }
  vm.destroy()
  process.exit(0)
})
