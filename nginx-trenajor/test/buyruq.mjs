// Nginx trenajori: buyruqlarni haqiqiy VM'da (build/web/holat.zst) bajaradi, terminal chiqishini va ikkinchi serial
// kanaldan (ttyS1, nginx-kuzatuv) kelgan so'rovlar tahlilini chiqaradi.
//   echo 'curl -s localhost/' | node nginx-trenajor/test/buyruq.mjs -          — terminal chiqishi
//   echo 'curl -s localhost/' | node nginx-trenajor/test/buyruq.mjs - --sorov  — + so'rovlar (kuzatuv.js bilan)
import { V86 } from 'v86'
import { symlinkTuzat } from '../../linux-trenajor/scripts/v86-tuzat.mjs'
import { qatorQosh, yangiKuzatuv } from '../../src/nginx/kuzatuv.js'
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const ROOT = path.join(path.dirname(url.fileURLToPath(import.meta.url)), '..')
const pub = path.join(ROOT, '..', 'public', 'trenajor'), web = path.join(ROOT, 'build', 'web')
const [manba = '-', ...bayroqlar] = process.argv.slice(2)
const buyruqlar = fs.readFileSync(manba === '-' ? 0 : manba, 'utf8').split('\n').filter((q) => q.trim() && !q.startsWith('#'))
const BELGI = '\x1b]7770;\x07'

const vm = new V86({
  wasm_path: path.join(pub, 'v86.wasm'), bios: { url: path.join(pub, 'bios/seabios.bin') }, vga_bios: { url: path.join(pub, 'bios/vgabios.bin') },
  filesystem: { basefs: path.join(web, 'fs/fs.json'), baseurl: path.join(web, 'fs/base/') },
  initial_state: { url: path.join(web, 'holat.zst') },
  memory_size: 256 << 20, autostart: true, disable_keyboard: true, disable_mouse: true, uart1: true,
})
symlinkTuzat(vm)
let buf = ''
vm.add_listener('serial0-output-byte', (b) => { buf += String.fromCharCode(b) })
const kuz = yangiKuzatuv()
const xom = []
let q1 = ''
vm.add_listener('serial1-output-byte', (b) => {
  const c = String.fromCharCode(b)
  if (c !== '\n') return void (q1 += c)
  const qator = Buffer.from(q1, 'latin1').toString('utf8')
  xom.push(qator)
  qatorQosh(kuz, qator)
  q1 = ''
})

const kut = (shart, ms) => new Promise((ok, xato) => {
  const t0 = Date.now()
  const tek = () => shart() ? ok() : Date.now() - t0 > ms ? xato(new Error('vaqt tugadi')) : setTimeout(tek, 20)
  tek()
})
const toza = (s) => Buffer.from(s, 'latin1').toString('utf8')
  .replace(/\x1b\][^\x07]*\x07/g, '').replace(/\x1b\[[0-9;?]*[a-zA-Z]/g, '')
  .replace(/\x1b[=>]/g, '').replace(/\x1b[()][0-9A-Za-z]/g, '').replace(/\r/g, '')

vm.add_listener('emulator-ready', async () => {
  try {
    await kut(() => vm.is_running(), 10000)
    // sinov uchun: FAYL=lokal:/vm/yol — faylni VM'ga yozib qo'yish (tasvirni qayta yig'masdan)
    for (const j of (process.env.FAYL ?? '').split(',').filter(Boolean)) {
      const [lokal, vmYol] = j.split(':')
      await vm.create_file(vmYol, fs.readFileSync(lokal))
    }
    vm.serial0_send(`${Math.floor(Date.now() / 1000)} 100 40\n`)
    await kut(() => buf.includes(BELGI), 10000)
    for (const q of buyruqlar) {
      buf = ''
      vm.serial0_send(q.split('⏎').join('\n') + '\n')
      await kut(() => buf.includes(BELGI), 120000)
      const qatorlar = toza(buf.slice(0, buf.indexOf(BELGI))).split('\n').slice(1, -1)
      console.log(`# ${q.split('⏎')[0]}`)
      if (qatorlar.length) console.log(qatorlar.join('\n'))
    }
    // kuzatuvchi kechikib yetkazishi mumkin (tail -F soniyada bir tekshiradi)
    await new Promise((r) => setTimeout(r, Number(process.env.KUT ?? 2500)))
    if (bayroqlar.includes('--xom')) console.log('--- ttyS1 ---\n' + xom.join('\n'))
    if (bayroqlar.includes('--sorov')) {
      console.log('--- so\'rovlar ---')
      for (const s of kuz.sorovlar.filter((x) => !x.tekshiruv)) {
        const yol = s.bosqichlar.map((b) => `[${b.sinalgan.map((x) => (x.regex ? `~ ${x.nom}` : x.nom)).join(', ')}] -> ${b.tanlangan}`).join(' | ')
        console.log(`#${s.id} ${s.usul} ${s.yol}  server=${s.log?.server ?? '?'} status=${s.log?.status ?? '?'}  ${yol}` +
          (s.ulanishlar.length ? `  upstream=${s.ulanishlar.join(',')}` : '') + (s.kesh ? `  kesh=${s.kesh}/${s.log?.kesh}` : '') +
          (s.cheklandi ? '  CHEKLANDI' : '') + (s.xatolar.length ? `  xato=${s.xatolar.join('; ')}` : ''))
      }
    }
  } catch (e) {
    console.error('XATO:', e.message, JSON.stringify(toza(buf).slice(-300)))
    process.exit(1)
  }
  process.exit(0)
})
