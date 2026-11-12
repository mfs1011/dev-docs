// RabbitMQ trenajori: sahifa <-> VM ichidagi rmq-boshqaruv xizmati (ikkinchi serial port, ttyS1).
// Har qator — bitta JSON. Sahifa buyruq yuboradi ({id, op, ...}) va javobni id bo'yicha kutadi.
// VM'dan: "holat" (har soniyada topologiya va hisoblagichlar), "oqim" (firehose: publish/deliver),
// "ishlov" (consumer xabarni ishladi), "javob", "tayyor".
import { reactive } from 'vue'

const OQIM_CHEGARA = 200

export function yangiKanal(yuborBayt) {
  const holat = reactive({
    tayyor: false,
    navbatlar: [],
    exchangelar: [],
    boglanishlar: [],
    consumerlar: [],
    jurnal: [],      // oxirgi hodisalar (eng yangisi boshida)
    xato: '',
  })
  const kutilmoqda = new Map()
  const tinglovchilar = new Set()
  let id = 0
  let bufer = []
  const dekoder = new TextDecoder()

  function jurnalga(yozuv) {
    holat.jurnal.unshift({ vaqt: Date.now(), ...yozuv })
    if (holat.jurnal.length > OQIM_CHEGARA) holat.jurnal.length = OQIM_CHEGARA
  }

  function qator(matn) {
    let x
    try { x = JSON.parse(matn) } catch { return }
    switch (x.t) {
      case 'tayyor':
        holat.tayyor = true
        break
      case 'holat':
        holat.tayyor = true
        holat.navbatlar = x.navbatlar
        holat.exchangelar = x.exchangelar
        holat.boglanishlar = x.boglanishlar
        holat.consumerlar = x.consumerlar
        holat.xato = ''
        break
      case 'holat-xato':
        holat.xato = x.xato
        break
      case 'javob': {
        const k = kutilmoqda.get(x.id)
        if (!k) break
        kutilmoqda.delete(x.id)
        if (x.ok) k.resolve(x)
        else k.reject(new Error(x.xato))
        break
      }
      case 'oqim':
      case 'ishlov':
      case 'consumer-xato':
        jurnalga(x)
        break
    }
    tinglovchilar.forEach((f) => f(x))
  }

  return {
    holat,
    /** VM'dan kelgan bitta bayt (serial1-output-byte) */
    bayt(b) {
      if (b !== 10) return void bufer.push(b)
      const m = dekoder.decode(Uint8Array.from(bufer))
      bufer = []
      qator(m)
    },
    /** Buyruq yuborish; javob kelganda resolve, xato bo'lsa reject (RabbitMQ'ning o'z xabari bilan) */
    buyruq(op, maydonlar = {}) {
      const bid = ++id
      const p = new Promise((resolve, reject) => {
        kutilmoqda.set(bid, { resolve, reject })
        setTimeout(() => {
          if (kutilmoqda.delete(bid)) reject(new Error('javob kelmadi (30 s)'))
        }, 30000)
      })
      yuborBayt(new TextEncoder().encode(JSON.stringify({ id: bid, op, ...maydonlar }) + '\n'))
      return p
    },
    tingla(f) { tinglovchilar.add(f); return () => tinglovchilar.delete(f) },
  }
}
