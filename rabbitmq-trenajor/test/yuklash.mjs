import { V86 } from 'v86'
import { symlinkTuzat } from '/Users/mfsv/Projects/dev-docs/linux-trenajor/scripts/v86-tuzat.mjs'
const R = '/Users/mfsv/Projects/dev-docs', pub = R + '/public/trenajor', b = R + '/rabbitmq-trenajor/build', fsd = process.argv[2]
const vm = new V86({ wasm_path: pub + '/v86.wasm', bios: { url: pub + '/bios/seabios.bin' }, vga_bios: { url: pub + '/bios/vgabios.bin' },
  bzimage: { url: b + '/vmlinuz' }, initrd: { url: b + '/initrd.img' },
  filesystem: { basefs: fsd + '/fs.json', baseurl: fsd + '/base/' }, cmdline: 'console=ttyS0 rw tsc=reliable mitigations=off quiet',
  memory_size: 512 << 20, autostart: true, disable_keyboard: true, disable_mouse: true, uart1: true })
symlinkTuzat(vm)
const t0 = Date.now(); let buf = ''
let k1 = ''
vm.add_listener('serial1-output-byte', (c) => { k1 += String.fromCharCode(c) })
process.on('exit', () => console.log('KANAL1:', k1.length, 'bayt; boshi:', JSON.stringify(k1.slice(0, 200))))
let bosqich = 0
const BUYRUQ = process.argv[3]
vm.add_listener('serial0-output-byte', (c) => {
  buf += String.fromCharCode(c)
  if (bosqich === 0 && /root@trenajor:[^#]*# $/.test(buf)) {
    console.log('PROMPT', ((Date.now() - t0) / 1000).toFixed(1), 's')
    if (!BUYRUQ) process.exit(0)
    bosqich = 1; buf = ''
    setTimeout(() => vm.serial0_send(BUYRUQ + "; echo TUGADI_''BELGI\n"), Number(process.env.KUT ?? 0))
  } else if (bosqich === 1 && buf.includes('TUGADI_BELGI\r\n')) {
    console.log(buf.replace(/\x1b\[[0-9;?]*[a-zA-Z]|\r/g, '').slice(-4000)); process.exit(0)
  }
})
setTimeout(() => { console.log('VAQT TUGADI; oxiri:', buf.slice(-300).replace(/\r/g, '')); process.exit(1) }, Number(process.env.VAQT ?? 120000))
