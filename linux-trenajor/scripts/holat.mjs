// Brauzer uchun tayyor holat: tizim yuklanadi, shell sozlanadi va soat/o'lcham kutilayotgan paytda holat saqlanadi.
// Sahifa holatni tiklab, "<unix-vaqt> <ustun> <qator>" yuboradi — soat to'g'rilanadi, ekran tozalanib prompt chiqadi.
//   node linux-trenajor/scripts/holat.mjs  ->  build/web/{holat.zst, fs/}
import { V86 } from 'v86'
import { symlinkTuzat } from './v86-tuzat.mjs'
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'
import zlib from 'node:zlib'

const ROOT = path.join(path.dirname(url.fileURLToPath(import.meta.url)), '..')
const pub = path.join(ROOT, '..', 'public', 'trenajor')
// profil (deb.py bilan bir xil): TRENAJOR_PROFIL=nginx -> nginx-trenajor/build
const build = process.env.TRENAJOR_PROFIL ? path.join(ROOT, '..', `${process.env.TRENAJOR_PROFIL}-trenajor`, 'build') : path.join(ROOT, 'build')
const web = path.join(build, 'web')
// profil.json dagi "vm": v86 ga qo'shimcha parametrlar (masalan, uart1 — sahifa uchun ikkinchi serial kanal).
// Holatda saqlangan qurilmalar brauzerdagi bilan bir xil bo'lishi kerak.
const profilVm = process.env.TRENAJOR_PROFIL
  ? (JSON.parse(fs.readFileSync(path.join(build, '..', 'profil.json'), 'utf8')).vm ?? {})
  : {}
const t0 = Date.now()
const vm = new V86({
  wasm_path: path.join(pub, 'v86.wasm'),
  bios: { url: path.join(pub, 'bios/seabios.bin') },
  vga_bios: { url: path.join(pub, 'bios/vgabios.bin') },
  bzimage: { url: path.join(build, 'vmlinuz') },
  initrd: { url: path.join(build, 'initrd.img') },
  filesystem: { basefs: path.join(build, 'fs/fs.json'), baseurl: path.join(build, 'fs/base/') },
  cmdline: 'console=ttyS0 rw tsc=reliable mitigations=off quiet',
  memory_size: 256 * 1024 * 1024,
  autostart: true,
  disable_keyboard: true,
  disable_mouse: true,
  ...profilVm,
})
symlinkTuzat(vm)

// OSC 7770 — prompt belgisi (Terminal.vue shu bilan foydalanuvchi qayerdan yozishini biladi)
// prompt oxirida ko'rinmas OSC 7770 — Terminal.vue joriy qatorni (buyruq maslahati uchun) shu nuqtadan o'qiydi
const PS1 = String.raw`\[\e[1;32m\]\u@\h\[\e[0m\]:\[\e[1;34m\]\w\[\e[0m\]\$ \[\e]7770;\a\]`
const SOZLASH = [
  // HISTCONTROL=ignorespace: sahifa yuboradigan xizmat buyruqlari (bosh joy bilan) tarixga tushmaydi
  ` export TERM=xterm-256color HISTCONTROL=ignorespace PS1='${PS1}'`,
  // 9p ildizini v86 o'zi 0777 bilan yaratadi; haqiqiy Debian'dagidek 0755 (metama'lumot VM xotirasida — holatga kiradi)
  ' chmod 755 /',
  ' sync; echo 3 > /proc/sys/vm/drop_caches',
  // shu yerda to'xtaydi: sahifa vaqt va terminal o'lchamini yuboradi; history -c — bu sozlash qatori ↑ da chiqmasin
  ' stty -echo; read -r t c r; date -s @$t > /dev/null; stty cols $c rows $r echo; clear; cat /etc/motd; history -c',
].join('; ')

let buf = ''
vm.add_listener('serial0-output-byte', async (b) => {
  buf += String.fromCharCode(b)
  if (!/root@trenajor:[^#]*# $/.test(buf)) return
  buf = ''
  console.log(`yuklandi: ${((Date.now() - t0) / 1000).toFixed(1)}s`)
  vm.serial0_send(SOZLASH + '\n')
  await new Promise((r) => setTimeout(r, 3000)) // read kutib qolguncha
  const state = Buffer.from(await vm.save_state())
  vm.stop()
  fs.rmSync(web, { recursive: true, force: true })
  fs.mkdirSync(web, { recursive: true })
  fs.writeFileSync(path.join(web, 'holat.zst'), zlib.zstdCompressSync(state, { params: { [zlib.constants.ZSTD_c_compressionLevel]: 19 } }))
  fs.cpSync(path.join(build, 'fs'), path.join(web, 'fs'), { recursive: true })
  console.log(`holat.zst: ${(fs.statSync(path.join(web, 'holat.zst')).size / 1048576).toFixed(1)} MB`)
  process.exit(0)
})
