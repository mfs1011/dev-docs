// Redis trenajori mashqlari: har mashq uchun o'quvchi bajaradigan buyruqlarni haqiqiy VM'da (build/web/holat.zst)
// yuborib, src/redis/mashqlar.js dagi tekshiruvlar barcha qadamlarni o'tkazishini tekshiradi.
//   node redis-trenajor/test/mashqlar.mjs [mashq-id]
import { V86 } from 'v86'
import { symlinkTuzat } from '../../linux-trenajor/scripts/v86-tuzat.mjs'
import { yangiKanal } from '../../src/redis/kanal.js'
import { REDIS_MASHQLAR } from '../../src/redis/mashqlar.js'
import path from 'node:path'
import url from 'node:url'

const ROOT = path.join(path.dirname(url.fileURLToPath(import.meta.url)), '..')
const pub = path.join(ROOT, '..', 'public', 'trenajor'), web = path.join(ROOT, 'build', 'web')
const faqat = process.argv[2]

// [buyruq] — panel orqali; {kut: ms}; {obuna: [nom, kanal]}; {ack: kalit, guruh} — pending ID'ni o'qib XACK
const SSENARIY = {
  'kalit-muddat': ['SET sessiya:ali token123 EX 3', { kut: 5000 }],
  'string-sanagich': ['INCR sahifa:korishlar', 'INCR sahifa:korishlar', 'INCR sahifa:korishlar', 'INCRBY sahifa:korishlar 10'],
  'list-navbat': ['LPUSH ishlar rasm-1 rasm-2 rasm-3', 'RPOP ishlar'],
  'hash-obyekt': ['HSET foydalanuvchi:1 ism Ali shahar Toshkent yosh 30', 'HINCRBY foydalanuvchi:1 yosh 1'],
  'set-teglar': ['SADD teglar:1 redis kesh tez', 'SADD teglar:2 redis navbat tez', 'SINTER teglar:1 teglar:2'],
  'zset-reyting': ['ZADD reyting 120 ali 95 vali 150 gulnora', 'ZINCRBY reyting 80 vali', 'ZRANGE reyting 0 2 REV WITHSCORES'],
  'stream-guruh': ['XADD hodisalar * tur buyurtma id 42', 'XADD hodisalar * tur buyurtma id 43', 'XGROUP CREATE hodisalar ishchilar 0',
    'XREADGROUP GROUP ishchilar w1 COUNT 1 STREAMS hodisalar >', { ack: 'hodisalar', guruh: 'ishchilar' }],
  tranzaksiya: ['MULTI', 'INCR hisob:a', 'DECR hisob:b', 'EXEC'],
  pubsub: [{ obuna: ['mobil', 'yangiliklar'] }, { obuna: ['email', 'yangiliklar'] }, 'PUBLISH yangiliklar "Yangi maqola"'],
  evikt: ['CONFIG SET maxmemory 2mb', 'CONFIG SET maxmemory-policy allkeys-lru',
    `EVAL "for i=1,3000 do redis.call('SET','kesh:'..i,string.rep('x',1000)) end return 3000" 0`],
}

const vm = new V86({
  wasm_path: path.join(pub, 'v86.wasm'), bios: { url: path.join(pub, 'bios/seabios.bin') }, vga_bios: { url: path.join(pub, 'bios/vgabios.bin') },
  filesystem: { basefs: path.join(web, 'fs/fs.json'), baseurl: path.join(web, 'fs/base/') },
  initial_state: { url: path.join(web, 'holat.zst') },
  memory_size: 256 << 20, autostart: true, disable_keyboard: true, disable_mouse: true, uart1: true,
})
symlinkTuzat(vm)
const kanal = yangiKanal((b) => vm.serial_send_bytes(1, b))
vm.add_listener('serial1-output-byte', (b) => kanal.bayt(b))
const kut = (ms) => new Promise((r) => setTimeout(r, ms))
let xato = 0

vm.add_listener('emulator-ready', async () => {
  while (!vm.is_running()) await kut(50)
  vm.serial0_send(`${Math.floor(Date.now() / 1000)} 100 40\n`)
  for (let i = 0; !kanal.holat.tayyor && i < 600; i++) await kut(100)
  for (const m of REDIS_MASHQLAR) {
    if (faqat && m.id !== faqat) continue
    await kanal.buyruq('tozala')
    await kut(1500)
    const boshi = Date.now()
    let qadam = 0
    const tekshir = () => {
      const j = kanal.holat.jurnal.filter((x) => x.vaqt >= boshi)
      while (qadam < m.steps.length && m.steps[qadam].tekshir(kanal.holat, j)) qadam++
    }
    const javoblar = []
    for (const s of SSENARIY[m.id] ?? []) {
      try {
        if (typeof s === 'string') javoblar.push(`${s.slice(0, 40)} → ${(await kanal.redis(s)).split('\n')[0]}`)
        else if (s.kut) await kut(s.kut)
        else if (s.obuna) await kanal.buyruq('obuna', { nom: s.obuna[0], kanallar: [s.obuna[1]] })
        else if (s.ack) {
          const p = await kanal.redis(`XPENDING ${s.ack} ${s.guruh} - + 10`)
          const id = p.match(/"(\d+-\d+)"/)?.[1]
          javoblar.push(`XACK ${id} → ${await kanal.redis(`XACK ${s.ack} ${s.guruh} ${id}`)}`)
        }
      } catch (e) { javoblar.push(`${JSON.stringify(s).slice(0, 40)} → XATO ${e.message}`) }
      await kut(900)
      tekshir()
    }
    for (let i = 0; i < 6 && qadam < m.steps.length; i++) { await kut(700); tekshir() }
    const ok = qadam === m.steps.length
    if (!ok) xato++
    console.log(`${ok ? 'OK  ' : 'XATO'} ${m.id}: ${qadam}/${m.steps.length}`)
    if (!ok || process.env.BATAFSIL) for (const x of javoblar) console.log('     ', x)
  }
  vm.destroy()
  process.exit(xato ? 1 : 0)
})
