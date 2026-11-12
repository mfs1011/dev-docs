// RabbitMQ trenajori: haqiqiy VM'da (build/web/holat.zst) kanal orqali buyruqlar ssenariysini bajaradi.
// Sahifadagi kanal.js ishlatiladi; javoblar, oxirgi holat va hodisalar chiqariladi.
//   node rabbitmq-trenajor/test/kanal.mjs ssenariy.json
// ssenariy: [{"op": "queue.declare", "nom": "ishlar"}, {"kut": 2000}, ...]
import { V86 } from 'v86'
import { symlinkTuzat } from '../../linux-trenajor/scripts/v86-tuzat.mjs'
import { yangiKanal } from '../../src/rabbitmq/kanal.js'
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const ROOT = path.join(path.dirname(url.fileURLToPath(import.meta.url)), '..')
const pub = path.join(ROOT, '..', 'public', 'trenajor'), web = path.join(ROOT, 'build', 'web')
const ssenariy = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
const t0 = Date.now()
const vaqt = () => ((Date.now() - t0) / 1000).toFixed(1) + 's'

const vm = new V86({
  wasm_path: path.join(pub, 'v86.wasm'), bios: { url: path.join(pub, 'bios/seabios.bin') }, vga_bios: { url: path.join(pub, 'bios/vgabios.bin') },
  filesystem: { basefs: path.join(web, 'fs/fs.json'), baseurl: path.join(web, 'fs/base/') },
  initial_state: { url: path.join(web, 'holat.zst') },
  memory_size: 512 << 20, autostart: true, disable_keyboard: true, disable_mouse: true, uart1: true,
})
symlinkTuzat(vm)
const kanal = yangiKanal((b) => vm.serial_send_bytes(1, b))
vm.add_listener('serial1-output-byte', (b) => kanal.bayt(b))
kanal.tingla((x) => { if (x.t === 'oqim' || x.t === 'ishlov' || x.t === 'consumer-xato') console.log(vaqt(), 'HODISA', JSON.stringify(x)) })
const kut = (ms) => new Promise((r) => setTimeout(r, ms))

vm.add_listener('emulator-ready', async () => {
  try {
    // sinov uchun: FAYL=lokal:/vm/yol — faylni VM'ga yozish; BUYRUQ — terminalda bajarish (masalan, servisni qayta ishga tushirish)
    while (!vm.is_running()) await kut(50)
    for (const j of (process.env.FAYL ?? '').split(',').filter(Boolean)) {
      const [lokal, vmYol] = j.split(':')
      await vm.create_file(vmYol, fs.readFileSync(lokal))
    }
    vm.serial0_send(`${Math.floor(Date.now() / 1000)} 100 40\n`)
    let term = ''
    vm.add_listener('serial0-output-byte', (b) => { term += String.fromCharCode(b) })
    if (process.env.BUYRUQ) {
      await kut(1500)
      let qayta = false
      kanal.tingla((x) => { if (x.t === 'tayyor') qayta = true })
      vm.serial0_send(process.env.BUYRUQ + '\n')
      await kut(Number(process.env.BUYRUQ_KUT ?? 5000))
      for (let k = 0; !qayta && k < 900; k++) await kut(100)
      if (process.env.TERM_KOR) console.log(term.replace(/\x1b\[[0-9;?]*[a-zA-Z]|\x1b\][^\x07]*\x07|\r/g, '').slice(-3000))
    }
    while (!kanal.holat.navbatlar && !kanal.holat.tayyor) await kut(100)
    let i = 0
    while (!kanal.holat.tayyor && i++ < 300) await kut(100)
    console.log(vaqt(), 'kanal tayyor:', kanal.holat.tayyor)
    for (const q of ssenariy) {
      if (q.kut) { await kut(q.kut); continue }
      const { op, ...m } = q
      const s = Date.now()
      try { const j = await kanal.buyruq(op, m); console.log(vaqt(), 'OK', op, `${Date.now() - s}ms`, JSON.stringify(j)) }
      catch (e) { console.log(vaqt(), 'XATO', op, `${Date.now() - s}ms`, e.message) }
    }
    await kut(3000)
    const h = kanal.holat
    console.log(vaqt(), 'HOLAT navbatlar', JSON.stringify(h.navbatlar.map((n) => [n.nom, n.tur, n.tayyor, n.unacked, n.consumerlar])))
    console.log(vaqt(), 'HOLAT exchange', JSON.stringify(h.exchangelar.map((e) => [e.nom, e.tur])))
    console.log(vaqt(), 'HOLAT bog', JSON.stringify(h.boglanishlar.map((b) => [b.exchange, b.navbat, b.kalit])))
    console.log(vaqt(), 'HOLAT consumer', JSON.stringify(h.consumerlar))
  } catch (e) { console.error(e) }
  vm.destroy(); process.exit(0)
})
