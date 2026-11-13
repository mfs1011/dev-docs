// Redis trenajori: sahifa <-> VM ichidagi redis-boshqaruv xizmati (ikkinchi serial port, ttyS1).
// Har qator — bitta JSON. Sahifa buyruq yuboradi ({id, op, ...}) va javobni id bo'yicha kutadi.
// VM'dan: "holat" (kalitlar, INFO, obunachilar), "buyruq" (MONITOR), "hodisa" (keyspace bildirishnomasi),
// "pubsub" (obunachi xabar oldi), "tashlandi" (ko'p hodisa — ortig'i sanab o'tildi), "javob", "tayyor".
import { reactive } from 'vue'

const JURNAL_CHEGARA = 200

export function yangiKanal(yuborBayt) {
  const holat = reactive({
    tayyor: false,
    kalitlar: [],
    jami: 0,
    info: {},
    obunachilar: [],
    kanallar: [],
    jurnal: [],      // buyruq / hodisa / pubsub — eng yangisi boshida
    xato: '',
    vaqt: 0,         // oxirgi holat kelgan payt (TTL hisobi uchun)
  })
  const kutilmoqda = new Map()
  const tinglovchilar = new Set()
  let id = 0
  let bufer = []
  const dekoder = new TextDecoder()

  function qator(matn) {
    let x
    try { x = JSON.parse(matn) } catch { return }
    switch (x.t) {
      case 'tayyor':
        holat.tayyor = true
        break
      case 'holat':
        holat.tayyor = true
        holat.kalitlar = x.kalitlar
        holat.jami = x.jami
        holat.info = x.info
        holat.obunachilar = x.obunachilar
        holat.kanallar = x.kanallar
        holat.vaqt = Date.now()
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
      case 'buyruq':
      case 'hodisa':
      case 'pubsub':
      case 'tashlandi':
      case 'xato':
        holat.jurnal.unshift({ vaqt: Date.now(), ...x })
        if (holat.jurnal.length > JURNAL_CHEGARA) holat.jurnal.length = JURNAL_CHEGARA
        break
    }
    tinglovchilar.forEach((f) => f(x))
  }

  return {
    holat,
    bayt(b) {
      if (b !== 10) return void bufer.push(b)
      const m = dekoder.decode(Uint8Array.from(bufer))
      bufer = []
      qator(m)
    },
    buyruq(op, maydonlar = {}, { kutish = 30000 } = {}) {
      const bid = ++id
      const p = new Promise((resolve, reject) => {
        kutilmoqda.set(bid, { resolve, reject })
        setTimeout(() => { if (kutilmoqda.delete(bid)) reject(new Error(`javob kelmadi (${kutish / 1000} s)`)) }, kutish)
      })
      yuborBayt(new TextEncoder().encode(JSON.stringify({ id: bid, op, ...maydonlar }) + '\n'))
      return p
    },
    /** Redis buyrug'i (panel ulanishi orqali). Javob: redis-cli ko'rinishidagi matn */
    async redis(qator) {
      const j = await this.buyruq('buyruq', { qator })
      return j.natija
    },
    tingla(f) { tinglovchilar.add(f); return () => tinglovchilar.delete(f) },
  }
}
