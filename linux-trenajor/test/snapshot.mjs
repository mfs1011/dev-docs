// Snapshot sinovi: 1) yuklab, shell tayyor bo'lganda holatni saqlaydi; 2) holatdan qayta tiklab, buyruq ishlashini va vaqtni o'lchaydi.
//   node linux-trenajor/test/snapshot.mjs [xotira-MB]
import { V86 } from 'v86'
import { symlinkTuzat } from '../scripts/v86-tuzat.mjs'
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'
import zlib from 'node:zlib'

const ROOT = path.join(path.dirname(url.fileURLToPath(import.meta.url)), '..')
const pub = path.join(ROOT, '..', 'public', 'trenajor')
const build = path.join(ROOT, 'build')
const mb = Number(process.argv[2] ?? 256)
const asos = {
  wasm_path: path.join(pub, 'v86.wasm'),
  bios: { url: path.join(pub, 'bios/seabios.bin') },
  vga_bios: { url: path.join(pub, 'bios/vgabios.bin') },
  filesystem: { basefs: path.join(build, 'fs/fs.json'), baseurl: path.join(build, 'fs/base/') },
  memory_size: mb * 1024 * 1024,
  autostart: true,
  disable_keyboard: true,
  disable_mouse: true,
}
const PROMPT = /root@trenajor:[^#]*# $/

function kut(vm, re) {
  let buf = ''
  return new Promise((res) => {
    const f = (b) => { buf += String.fromCharCode(b); if (re.test(buf)) { vm.remove_listener('serial0-output-byte', f); res(buf) } }
    vm.add_listener('serial0-output-byte', f)
  })
}
async function buyruq(vm, cmd) {
  const p = kut(vm, PROMPT)
  vm.serial0_send(cmd + '\n')
  return (await p).replace(/\x1b\[[?0-9;]*[a-zA-Z]/g, '').replace(/\r/g, '')
}

// 1) yuklash va saqlash
let t0 = Date.now()
const vm = new V86({ ...asos,
  bzimage: { url: path.join(build, 'vmlinuz') },
  initrd: { url: path.join(build, 'initrd.img') },
  cmdline: 'console=ttyS0 rw tsc=reliable mitigations=off quiet' })
symlinkTuzat(vm)
await kut(vm, PROMPT)
console.log(`yuklandi: ${((Date.now() - t0) / 1000).toFixed(1)}s`)
// keshlar tashlanadi — holat kichikroq bo'ladi
await buyruq(vm, 'sync; echo 3 > /proc/sys/vm/drop_caches; clear')
const state = await vm.save_state()
vm.stop()
const gz = zlib.gzipSync(Buffer.from(state), { level: 9 })
const zst = zlib.zstdCompressSync ? zlib.zstdCompressSync(Buffer.from(state)) : null
fs.writeFileSync(path.join(build, 'holat.bin'), Buffer.from(state))
console.log(`holat: ${(state.byteLength / 1048576).toFixed(1)} MB, gzip ${(gz.length / 1048576).toFixed(1)} MB${zst ? `, zstd ${(zst.length / 1048576).toFixed(1)} MB` : ''}`)

// 2) holatdan tiklash
t0 = Date.now()
const vm2 = new V86({ ...asos, initial_state: { url: path.join(build, 'holat.bin') } })
symlinkTuzat(vm2)
await new Promise((r) => vm2.add_listener('emulator-ready', r))
console.log(`tiklandi: ${((Date.now() - t0) / 1000).toFixed(1)}s`)
const t1 = Date.now()
const chiqish = await buyruq(vm2, 'uname -r; systemctl is-system-running; ls /etc | wc -l; echo salom > /tmp/s && cat /tmp/s')
console.log(`birinchi buyruq: ${((Date.now() - t1) / 1000).toFixed(1)}s\n${chiqish.trim()}`)
vm2.stop()
process.exit(0)
