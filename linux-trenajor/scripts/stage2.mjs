// 2-bosqich runner: 1-bosqich fayl tizimi bilan v86'ni ko'tarib, ichida stage2.sh (haqiqiy dpkg) ishlaydi.
// Tayyor tizim VM ichida /natija.tar ga yoziladi va shu yerga (build/stage2.tar) olinadi.
//   node linux-trenajor/scripts/stage2.mjs
import { V86 } from 'v86'
import { symlinkTuzat } from './v86-tuzat.mjs'
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const ROOT = path.join(path.dirname(url.fileURLToPath(import.meta.url)), '..')
const pub = path.join(ROOT, '..', 'public', 'trenajor')
// profil (deb.py bilan bir xil): TRENAJOR_PROFIL=nginx -> nginx-trenajor/build
const build = process.env.TRENAJOR_PROFIL ? path.join(ROOT, '..', `${process.env.TRENAJOR_PROFIL}-trenajor`, 'build') : path.join(ROOT, 'build')
const t0 = Date.now()
const vm = new V86({
  wasm_path: path.join(pub, 'v86.wasm'),
  bios: { url: path.join(pub, 'bios/seabios.bin') },
  vga_bios: { url: path.join(pub, 'bios/vgabios.bin') },
  bzimage: { url: path.join(build, 'vmlinuz') },
  initrd: { url: path.join(build, 'initrd.img') },
  filesystem: { basefs: path.join(build, 'fs-stage1/fs.json'), baseurl: path.join(build, 'fs-stage1/base/') },
  cmdline: 'console=ttyS0 rw init=/linux-trenajor/stage2.sh tsc=reliable mitigations=off',
  memory_size: 512 * 1024 * 1024,
  autostart: true,
  disable_keyboard: true,
  disable_mouse: true,
})
symlinkTuzat(vm)
const vaqt = () => `${((Date.now() - t0) / 1000).toFixed(0)}s`
let qator = ''
vm.add_listener('serial0-output-byte', async (b) => {
  const c = String.fromCharCode(b)
  if (c !== '\n') return void (qator += c)
  if (process.env.HAMMASI || qator.includes('[stage2]') || /error|xato|panic/i.test(qator)) console.log(vaqt(), qator.trim())
  if (qator.includes('TAR_TAYYOR')) {
    // «TAR_TAYYOR <jami bayt> qism.aa qism.ab …» — bo'laklar birma-bir o'qiladi va hajmi tekshiriladi
    const [, jami, ...qismlar] = qator.trim().split(/\s+/).slice(qator.trim().split(/\s+/).indexOf('TAR_TAYYOR'))
    const out = fs.openSync(path.join(build, 'stage2.tar'), 'w')
    let n = 0
    for (const q of qismlar) {
      const d = await vm.read_file(`/natija/${q}`)
      fs.writeSync(out, d)
      n += d.length
    }
    fs.closeSync(out)
    if (n !== Number(jami)) { console.log(vaqt(), `XATO: ${n} bayt o'qildi, kutilgan ${jami}`); process.exit(1) }
    console.log(vaqt(), `stage2.tar yozildi: ${(n / 1048576).toFixed(0)} MB (${qismlar.length} bo'lak)`)
    vm.stop()
    process.exit(0)
  }
  qator = ''
})
setTimeout(() => { console.log(vaqt(), 'vaqt tugadi'); process.exit(1) }, 90 * 60 * 1000)
