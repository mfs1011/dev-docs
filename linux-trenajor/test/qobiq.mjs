// Tajriba uchun: fayl tizimini init=/bin/bash bilan ochib, berilgan buyruqlarni bajaradi va chiqishini ko'rsatadi.
//   node linux-trenajor/test/qobiq.mjs <fs-papka> 'buyruq1' 'buyruq2' ...
import { V86 } from 'v86'
import { symlinkTuzat } from '../scripts/v86-tuzat.mjs'
import path from 'node:path'
import url from 'node:url'

const ROOT = path.join(path.dirname(url.fileURLToPath(import.meta.url)), '..')
const pub = path.join(ROOT, '..', 'public', 'trenajor')
const build = path.join(ROOT, 'build')
const [fsDir, ...cmds] = process.argv.slice(2)
const vm = new V86({
  wasm_path: path.join(pub, 'v86.wasm'),
  bios: { url: path.join(pub, 'bios/seabios.bin') },
  vga_bios: { url: path.join(pub, 'bios/vgabios.bin') },
  bzimage: { url: path.join(build, 'vmlinuz') },
  initrd: { url: path.join(build, 'initrd.img') },
  filesystem: { basefs: path.join(build, fsDir, 'fs.json'), baseurl: path.join(build, fsDir, 'base/') },
  cmdline: 'console=ttyS0 rw init=/bin/bash quiet tsc=reliable mitigations=off',
  memory_size: 384 * 1024 * 1024, autostart: true, disable_keyboard: true, disable_mouse: true,
})
symlinkTuzat(vm)
// har buyruq oxirida belgi chiqariladi — keyingisi shundan keyin yuboriladi
const BELGI = '__TAYYOR__'
const navbat = ['export PATH=/usr/sbin:/usr/bin:/sbin:/bin; mount -t proc proc /proc; mount -t sysfs s /sys', ...cmds]
let buf = '', i = 0
const yubor = () => vm.serial0_send(`${navbat[i]}; echo ${BELGI}$((1+${i}))\n`)
vm.add_listener('serial0-output-byte', (b) => {
  buf += String.fromCharCode(b)
  if (i === 0 && /# $/.test(buf)) { buf = ''; yubor(); return }
  const m = buf.match(new RegExp(`\\n${BELGI}(\\d+)`))
  if (m && Number(m[1]) === i + 1) {
    if (i > 0) console.log(`$ ${navbat[i]}\n${buf.slice(buf.indexOf('\n') + 1, m.index).replace(/\r/g, '').trimEnd()}\n`)
    buf = ''
    i++
    if (i < navbat.length) yubor()
    else process.exit(0)
  }
})
setTimeout(() => { console.log('[vaqt tugadi]', buf.slice(-500)); process.exit(1) }, 180000)
