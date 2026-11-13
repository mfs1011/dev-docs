// HTTP laboratoriyasi mashqlari: har mashq uchun o'quvchi bajaradigan so'rovlarni haqiqiy VM'da yuborib,
// src/web/mashqlar.js dagi tekshiruvlar barcha qadamlarni o'tkazishini tekshiradi.
//   node web-trenajor/test/mashqlar.mjs
import { V86 } from 'v86'
import { symlinkTuzat } from '../../linux-trenajor/scripts/v86-tuzat.mjs'
import { JAR, yangiLab } from '../../src/web/lab.js'
import { WEB_MASHQLAR } from '../../src/web/mashqlar.js'
import { LAB_FAYLLAR, SOZLA } from '../lab-fayllar.mjs'
import path from 'node:path'
import url from 'node:url'

globalThis.btoa ??= (s) => Buffer.from(s, 'latin1').toString('base64')
const H = 'http://api.test:8080'
const BASIC = 'Basic ' + btoa('ali:parol123')
const g = (yol, o = {}) => ({ usul: 'GET', url: H + yol, cookie: true, ...o })
const SSENARIY = {
  'birinchi-sorov': [g('/'), g('/static/logo.svg', { usul: 'HEAD' })],
  metodlar: [g('/api/buyurtma', { usul: 'POST', tana: '{"a":1}', headerlar: [['Content-Type', 'application/json']] }), g('/api/foydalanuvchi', { usul: 'DELETE' })],
  redirect: [g('/zanjir'), g('/zanjir', { ergash: true }), g('/forma-303', { usul: 'POST', tana: 'a=1', ergash: true }), g('/forma-307', { usul: 'POST', tana: 'a=1', ergash: true })],
  kesh: [g('/static/logo.svg'), 'ETAG'],
  cookie: ['TOZA', g('/profil'), g('/kirish'), g('/profil')],
  'basic-auth': [g('/maxfiy/'), g('/maxfiy/', { headerlar: [['Authorization', BASIC]] })],
  cors: [g('/api/cors', { usul: 'OPTIONS', cookie: false, headerlar: [['Origin', 'http://sayt.test'], ['Access-Control-Request-Method', 'PUT']] }),
    g('/api/cors', { usul: 'OPTIONS', cookie: false, headerlar: [['Origin', 'http://yomon.test'], ['Access-Control-Request-Method', 'PUT']] })],
  'siqish-range': [g('/katta.txt'), g('/katta.txt', { siqish: true }), g('/katta.txt', { headerlar: [['Range', 'bytes=0-99']] })],
}

const ROOT = path.join(path.dirname(url.fileURLToPath(import.meta.url)), '..', '..')
const pub = path.join(ROOT, 'public', 'trenajor'), web = path.join(ROOT, 'nginx-trenajor', 'build', 'web')
const vm = new V86({
  wasm_path: path.join(pub, 'v86.wasm'), bios: { url: path.join(pub, 'bios/seabios.bin') }, vga_bios: { url: path.join(pub, 'bios/vgabios.bin') },
  filesystem: { basefs: path.join(web, 'fs/fs.json'), baseurl: path.join(web, 'fs/base/') },
  initial_state: { url: path.join(web, 'holat.zst') },
  memory_size: 256 << 20, autostart: true, disable_keyboard: true, disable_mouse: true, uart1: true,
})
symlinkTuzat(vm)
const lab = yangiLab((b) => vm.serial_send_bytes(1, b))
vm.add_listener('serial1-output-byte', (b) => lab.bayt(b))
const kut = (ms) => new Promise((r) => setTimeout(r, ms))
let xato = 0
vm.add_listener('emulator-ready', async () => {
  while (!vm.is_running()) await kut(50)
  for (const [nom, matn] of Object.entries(LAB_FAYLLAR)) await vm.create_file(`/root/.lab-${nom}`, new TextEncoder().encode(matn))
  vm.serial0_send(`${Math.floor(Date.now() / 1000)} 100 40\n`)
  await kut(1500)
  vm.serial0_send(`${SOZLA}\n`)
  for (let i = 0; !lab.tayyor && i < 600; i++) await kut(100)
  for (const m of WEB_MASHQLAR) {
    const tarix = []
    let qadam = 0
    for (const s of SSENARIY[m.id] ?? []) {
      let so = s
      if (s === 'TOZA') { await lab.bajar(`rm -f ${JAR}`); continue }
      if (s === 'ETAG') {
        const etag = tarix[0].hoplar.at(-1).javob.headerlar.find(([k]) => k === 'ETag')[1]
        so = g('/static/logo.svg', { headerlar: [['If-None-Match', etag]] })
      }
      tarix.unshift(await lab.sorov(so))
      while (qadam < m.steps.length && m.steps[qadam].tekshir(tarix)) qadam++
    }
    const ok = qadam === m.steps.length
    if (!ok) xato++
    console.log(`${ok ? 'OK  ' : 'XATO'} ${m.id}: ${qadam}/${m.steps.length}`)
  }
  vm.destroy()
  process.exit(xato ? 1 : 0)
})
