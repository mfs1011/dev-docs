// Qo'llanma boblari uchun: buyruqlarni trenajorda (build/web/holat.zst) ishga tushirib, haqiqiy chiqishni toza matn qilib beradi.
//   node test/buyruq.mjs buyruqlar.txt      — har qator bitta buyruq (bo'sh va # bilan boshlanganlar o'tkazib yuboriladi)
//   echo 'ls /' | node test/buyruq.mjs -
// Prompt oxiridagi OSC 7770 belgisi buyruq tugaganini bildiradi (Terminal.vue ham shunga qaraydi).
import { V86 } from 'v86'
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const ROOT = path.join(path.dirname(url.fileURLToPath(import.meta.url)), '..')
const pub = path.join(ROOT, '..', 'public', 'trenajor'), web = path.join(ROOT, 'build', 'web')
const manba = process.argv[2] ?? '-'
const buyruqlar = fs.readFileSync(manba === '-' ? 0 : manba, 'utf8').split('\n').filter((q) => q.trim() && !q.startsWith('#'))
const BELGI = '\x1b]7770;\x07'

const vm = new V86({
  wasm_path: path.join(pub, 'v86.wasm'), bios: { url: path.join(pub, 'bios/seabios.bin') }, vga_bios: { url: path.join(pub, 'bios/vgabios.bin') },
  filesystem: { basefs: path.join(web, 'fs/fs.json'), baseurl: path.join(web, 'fs/base/') },
  initial_state: { url: path.join(web, 'holat.zst') },
  memory_size: 256 << 20, autostart: true, disable_keyboard: true, disable_mouse: true,
})
let buf = ''
vm.add_listener('serial0-output-byte', (b) => { buf += String.fromCharCode(b) })

const kut = (shart, ms) => new Promise((ok, xato) => {
  const t0 = Date.now()
  const tek = () => shart() ? ok() : Date.now() - t0 > ms ? xato(new Error('vaqt tugadi')) : setTimeout(tek, 20)
  tek()
})
const toza = (s) => Buffer.from(s, 'latin1').toString('utf8')
  .replace(/\x1b\][^\x07]*\x07/g, '').replace(/\x1b\[[0-9;?]*[a-zA-Z]/g, '').replace(/\r/g, '')

vm.add_listener('emulator-ready', async () => {
  try {
    await kut(() => vm.is_running(), 10000)
    vm.serial0_send(`${Math.floor(Date.now() / 1000)} 100 40\n`)
    await kut(() => buf.includes(BELGI), 10000)
    for (const q of buyruqlar) {
      buf = ''
      // ko'p qatorli buyruq (here-document va h.k.): kirish faylida qatorlar ⏎ bilan ajratiladi
      vm.serial0_send(q.split('⏎').join('\n') + '\n')
      await kut(() => buf.includes(BELGI), 120000)
      const chiqish = toza(buf.slice(0, buf.indexOf(BELGI)))
      // birinchi qator — terminal qaytargan buyruqning o'zi (echo), oxirgisi — keyingi prompt (belgi prompt oxirida)
      const qatorlar = chiqish.split('\n').slice(1, -1)
      console.log(`# ${q.split('⏎')[0]}`)
      if (qatorlar.length) console.log(qatorlar.join('\n'))
    }
  } catch (e) {
    console.error('XATO:', e.message, JSON.stringify(toza(buf).slice(-300)))
    process.exit(1)
  }
  process.exit(0)
})
