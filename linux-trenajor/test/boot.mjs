// Spike B: tayyor Debian 12 (systemd) v86'da qancha vaqtda yuklanadi va nima ishlaydi.
//   node linux-trenajor/test/boot.mjs [fs-papka] [xotira-MB]
import { V86 } from 'v86'
import { symlinkTuzat } from '../scripts/v86-tuzat.mjs'
import path from 'node:path'
import url from 'node:url'

const ROOT = path.join(path.dirname(url.fileURLToPath(import.meta.url)), '..')
const pub = path.join(ROOT, '..', 'public', 'trenajor')
const build = path.join(ROOT, 'build')
const fsDir = path.join(build, process.argv[2] ?? 'fs')
const mb = Number(process.argv[3] ?? 512)
const t0 = Date.now()
const vm = new V86({
  wasm_path: path.join(pub, 'v86.wasm'),
  bios: { url: path.join(pub, 'bios/seabios.bin') },
  vga_bios: { url: path.join(pub, 'bios/vgabios.bin') },
  bzimage: { url: path.join(build, 'vmlinuz') },
  initrd: { url: path.join(build, 'initrd.img') },
  filesystem: { basefs: path.join(fsDir, 'fs.json'), baseurl: path.join(fsDir, 'base/') },
  cmdline: 'console=ttyS0 rw tsc=reliable mitigations=off quiet',
  memory_size: mb * 1024 * 1024,
  autostart: true,
  disable_keyboard: true,
  disable_mouse: true,
})
symlinkTuzat(vm)
const BUYRUQLAR = [
  'systemctl is-system-running; systemctl --failed --no-legend --plain | head',
  'systemd-analyze 2>/dev/null | head -3; free -m | head -2; df -h / | tail -1',
  'systemctl status systemd-journald --no-pager | head -5; id; cat /etc/os-release | head -2',
]
let buf = '', qadam = 0, kirdi = false
const vaqt = () => `${((Date.now() - t0) / 1000).toFixed(1)}s`
vm.add_listener('serial0-output-byte', (b) => {
  const c = String.fromCharCode(b)
  buf += c
  process.stdout.write(c)
  if (/root@trenajor:[^#]*# $/.test(buf)) {
    if (!kirdi) { kirdi = true; console.error(`\n[shell tayyor: ${vaqt()}]`) }
    buf = ''
    if (qadam < BUYRUQLAR.length) vm.serial0_send(BUYRUQLAR[qadam++] + '\n')
    else { console.error(`\n[tugadi: ${vaqt()}]`); vm.stop(); process.exit(0) }
  }
})
setTimeout(() => { console.error(`\n[vaqt tugadi ${vaqt()}]`); process.exit(1) }, 15 * 60 * 1000)
