// build/web/holat.zst ni tiklab, sahifa kabi "<vaqt> <ustun> <qator>" yuboradi va chiqishni ko'rsatadi
import { V86 } from 'v86'
import path from 'node:path'
import url from 'node:url'
const ROOT = path.join(path.dirname(url.fileURLToPath(import.meta.url)), '..')
const pub = path.join(ROOT, '..', 'public', 'trenajor'), web = path.join(ROOT, 'build', 'web')
const vm = new V86({
  wasm_path: path.join(pub, 'v86.wasm'), bios: { url: path.join(pub, 'bios/seabios.bin') }, vga_bios: { url: path.join(pub, 'bios/vgabios.bin') },
  filesystem: { basefs: path.join(web, 'fs/fs.json'), baseurl: path.join(web, 'fs/base/') },
  initial_state: { url: path.join(web, 'holat.zst') },
  memory_size: 256 << 20, autostart: true, disable_keyboard: true, disable_mouse: true,
})
let out = ''
vm.add_listener('serial0-output-byte', (b) => { out += String.fromCharCode(b) })
const t0 = Date.now()
vm.add_listener('emulator-ready', () => {
  console.log('ready', Date.now() - t0, 'ms; running:', vm.is_running())
  setTimeout(() => vm.serial0_send(`${Math.floor(Date.now() / 1000)} 100 30\n`), Number(process.argv[2] ?? 0))
  // ixtiyoriy: uyg'ongandan keyin bitta buyruq (node test/tiklash.mjs 0 'ls /')
  if (process.argv[3]) setTimeout(() => vm.serial0_send(process.argv[3] + '\n'), 1500)
})
setTimeout(() => { console.log(process.argv[3] ? out : JSON.stringify(out)); process.exit(0) }, process.argv[3] ? 15000 : 6000)
