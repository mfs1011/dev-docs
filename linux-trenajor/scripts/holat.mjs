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
const profilSoz = process.env.TRENAJOR_PROFIL
  ? JSON.parse(fs.readFileSync(path.join(build, '..', 'profil.json'), 'utf8'))
  : {}
const profilVm = profilSoz.vm ?? {}
// profil.json dagi "holatKutish": holatni saqlashdan oldin ikkinchi serial portda (uart1) shu matn chiqishini kutish
// (masalan, RabbitMQ ko'tarilib, boshqaruv xizmati "tayyor" degach — sahifa ishlab turgan broker bilan ochiladi)
const holatKutish = profilSoz.holatKutish ?? null
let kanalTayyor = !holatKutish
let kanalBuf = ''
const kanalKutuvchilar = []
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
if (holatKutish) {
  vm.add_listener('serial1-output-byte', (b) => {
    if (kanalTayyor) return
    kanalBuf = (kanalBuf + String.fromCharCode(b)).slice(-4096)
    if (kanalBuf.includes(holatKutish)) {
      kanalTayyor = true
      console.log(`kanal tayyor: ${((Date.now() - t0) / 1000).toFixed(1)}s`)
      kanalKutuvchilar.splice(0).forEach((r) => r())
    }
  })
}

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

// Kutish chegaralari: CI soatlab osilib qolmasin (bir marta 6 soatlik limitgacha qotgan). Yuklanish yoki "tayyor"
// signali chegaradan oshsa — VM ichidagi xizmatlar holati va jurnali chiqariladi, jarayon xato bilan tugaydi.
const YUKLASH_MS = Number(process.env.HOLAT_YUKLASH_MS ?? 15 * 60000)
const KANAL_MS = Number(process.env.HOLAT_KANAL_MS ?? 20 * 60000)
let konsol = ''   // oxirgi konsol chiqishi (diagnostika uchun)
vm.add_listener('serial0-output-byte', (b) => { konsol = (konsol + String.fromCharCode(b)).slice(-20000) })
const yuklashTaymer = setTimeout(() => {
  console.error(`XATO: ${YUKLASH_MS / 60000} daqiqada login so'rovi chiqmadi. Konsol oxiri:\n${konsol.slice(-4000)}`)
  process.exit(1)
}, YUKLASH_MS)
async function kanalniKut() {
  const ok = await Promise.race([
    new Promise((r) => kanalKutuvchilar.push(() => r(true))),
    new Promise((r) => setTimeout(() => r(false), KANAL_MS)),
  ])
  if (ok) return true
  console.error(`XATO: ${KANAL_MS / 60000} daqiqada ikkinchi serial portdan ${JSON.stringify(holatKutish)} kelmadi. VM ichidagi holat:`)
  konsol = ''
  vm.serial0_send(' systemctl --no-pager --failed; systemctl --no-pager list-units --type=service --state=activating,running | tail -25;'
    + ' for u in $(systemctl list-units --type=service --state=failed,activating --no-legend --plain | cut -d" " -f1);'
    + ' do echo "== $u"; journalctl --no-pager -u $u -n 30 -o cat | grep -v "^Started\\|^Stopp\\|Scheduled restart"; done;'
    + ' free -m; uptime\n')
  await new Promise((r) => setTimeout(r, 120000))
  console.error(konsol.replace(/\x1b\[[0-9;?]*[a-zA-Z]/g, '').slice(-12000))
  process.exit(1)
}

let buf = ''
vm.add_listener('serial0-output-byte', async (b) => {
  if (process.env.HOLAT_DEBUG) process.stderr.write(String.fromCharCode(b))
  buf += String.fromCharCode(b)
  if (!/root@trenajor:[^#]*# $/.test(buf)) return
  buf = ''
  console.log(`yuklandi: ${((Date.now() - t0) / 1000).toFixed(1)}s`)
  clearTimeout(yuklashTaymer)
  if (!kanalTayyor && !(await kanalniKut())) return
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
