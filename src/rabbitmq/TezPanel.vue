<script setup>
// Tez boshqaruv: bir bosishda haqiqiy brokerda amal. Exchange turi (qayta e'lon qilinadi), routing key / header'lar,
// xabar tanasi, ack rejimi (consumer'lar qayta ulanadi), test xabarlari (x-trenajor header'i — consumer shu xabarni
// nack yoki reject qiladi), persistent, consumer'larni o'chirish, broker restart (rabbitmqctl stop_app/start_app),
// navbat + binding + worker'lar qo'shish, namuna topologiya, auto-demo.
import { computed, onBeforeUnmount, ref } from 'vue'
import {
  HEADERLAR, KALITLAR, NAMUNA, NAMUNA_KECHIKISH, TANALAR, headerlarniOqi, namunaQur, turAlmashtir,
} from '@/rabbitmq/namuna'

const props = defineProps({
  holat: { type: Object, required: true },
  buyruq: { type: Function, required: true },
  soz: { type: Object, required: true },
})

const xabar = ref(null)   // { ok, matn }
const band = ref('')      // qaysi amal bajarilmoqda
const oflayn = ref(null)  // "Consumer offline": to'xtatilgan consumer sozlamalari
const yangi = ref({ nom: 'promo', kalit: 'order.created', workerlar: 1, durable: true })
const soni = ref(1)

const TURLAR = ['direct', 'fanout', 'topic', 'headers']
const exlar = computed(() => props.holat.exchangelar.filter((e) => e.nom === '' || !e.nom.startsWith('amq.')))
const faol = computed(() => props.holat.exchangelar.find((e) => e.nom === props.soz.exchange))
const faolTur = computed(() => faol.value?.tur ?? 'direct')
const kalitlar = computed(() => [...new Set([...KALITLAR,
  ...props.holat.boglanishlar.filter((b) => b.exchange === props.soz.exchange && b.kalit).map((b) => b.kalit)])])
const jsonmi = computed(() => { try { JSON.parse(props.soz.tana); return true } catch { return false } })

async function amal(nomi, f, muvaffaqiyat) {
  if (band.value) return
  band.value = nomi
  xabar.value = null
  try {
    const j = await f()
    if (muvaffaqiyat) xabar.value = { ok: true, matn: typeof muvaffaqiyat === 'function' ? muvaffaqiyat(j) : muvaffaqiyat }
  } catch (e) {
    xabar.value = { ok: false, matn: e.message }
  } finally {
    band.value = ''
  }
}

function xossalar(ilova, sinov) {
  const headers = faolTur.value === 'headers' ? headerlarniOqi(props.soz.headers) : {}
  if (sinov) headers['x-trenajor'] = sinov
  return { delivery_mode: props.soz.persistent ? 2 : 1, app_id: ilova, ...(Object.keys(headers).length ? { headers } : {}) }
}
function yubor(ilova = props.soz.ilova, sinov = '', n = soni.value) {
  props.soz.ilova = ilova
  return amal('yubor', () => props.buyruq('publish', {
    exchange: props.soz.exchange, kalit: faolTur.value === 'headers' ? '' : props.soz.kalit,
    tana: props.soz.tana, soni: n, xossalar: xossalar(ilova, sinov),
  }), (j) => (j.routed ? '' : 'routed: false — hech bir navbatga tushmadi'))
}

const namuna = () => amal('namuna', async () => {
  await namunaQur(props.buyruq, { tur: props.soz.exchange === '' ? 'direct' : faolTur.value, avtoAck: props.soz.ack === 'auto', bosqich: (m) => { props.soz.izoh = m } })
  props.soz.exchange = NAMUNA.exchange
  oflayn.value = null
}, 'Namuna topologiya tayyor: Web App’dan “▶ yubor” ni bosing.')

const tozala = () => amal('tozala', async () => { await props.buyruq('tozala'); oflayn.value = null }, 'Broker tozalandi.')

function turTanla(t) {
  if (!faol.value || props.soz.exchange === '' || t === faolTur.value) return
  amal('tur', () => turAlmashtir(props.buyruq, props.holat, props.soz.exchange, t),
    `${props.soz.exchange} endi ${t}: exchange o‘chirilib, yangi tur bilan e’lon qilindi va binding’lar qayta qo‘yildi (RabbitMQ’da exchange turi o‘zgarmaydi).`)
}

async function consumerlarniQayta(f) {
  for (const c of [...props.holat.consumerlar]) {
    await props.buyruq('consumer.stop', { consumer: c.id })
    await props.buyruq('consumer.start', { navbat: c.navbat, nom: c.id, prefetch: c.prefetch, kechikish_ms: c.kechikish_ms, ...f(c) })
  }
}
function ackTanla(rejim) {
  if (props.soz.ack === rejim) return
  props.soz.ack = rejim
  amal('ack', () => consumerlarniQayta(() => ({ avto_ack: rejim === 'auto' })),
    rejim === 'auto' ? 'auto-ack: xabar yetkazilgan zahoti o‘chiriladi — consumer xato qilsa ham qaytmaydi.' : 'manual-ack: xabar consumer ack qilgandagina o‘chiriladi.')
}

function oflaynAlmashtir() {
  if (oflayn.value) {
    const eski = oflayn.value
    amal('oflayn', async () => {
      for (const c of eski) await props.buyruq('consumer.start', { navbat: c.navbat, nom: c.id, prefetch: c.prefetch, avto_ack: c.avto_ack, kechikish_ms: c.kechikish_ms, xulq: c.xulq })
      oflayn.value = null
    }, 'Consumer’lar qayta ulandi — navbatda yig‘ilganlarni olishyapti.')
  } else {
    const eski = [...props.holat.consumerlar]
    amal('oflayn', async () => {
      for (const c of eski) await props.buyruq('consumer.stop', { consumer: c.id })
      oflayn.value = eski
    }, 'Consumer’lar o‘chdi. Xabar yuboring — navbatda yig‘ilib turadi, yo‘qolmaydi.')
  }
}

function restart() {
  props.soz.izoh = 'Broker qayta ishga tushmoqda (rabbitmqctl stop_app → start_app), emulatorda ~30 s…'
  amal('restart', async () => {
    try { await props.buyruq('broker.restart', {}, { kutish: 240000 }) } finally { props.soz.izoh = '' }
  }, 'Broker qayta ishga tushdi. Durable navbatdagi persistent xabarlar qoldi, non-persistent’lar yo‘qoldi.')
}

function qosh() {
  const y = { ...yangi.value }
  amal('qosh', async () => {
    const dlx = props.holat.exchangelar.some((e) => e.nom === NAMUNA.dlx) ? { 'x-dead-letter-exchange': NAMUNA.dlx } : {}
    await props.buyruq('queue.declare', { nom: y.nom, durable: y.durable, args: { 'x-queue-type': 'classic', ...dlx } })
    if (props.soz.exchange !== '') {
      await props.buyruq('bind', faolTur.value === 'headers'
        ? { exchange: props.soz.exchange, navbat: y.nom, kalit: '', args: { 'x-match': 'all', ...headerlarniOqi(props.soz.headers) } }
        : { exchange: props.soz.exchange, navbat: y.nom, kalit: y.kalit })
    }
    for (let i = 1; i <= y.workerlar; i++) {
      await props.buyruq('consumer.start', { navbat: y.nom, nom: y.workerlar > 1 ? `${y.nom} worker ${i}` : `${y.nom} worker`, prefetch: 1, avto_ack: props.soz.ack === 'auto', kechikish_ms: NAMUNA_KECHIKISH })
    }
  }, `Navbat "${y.nom}" qo‘shildi${props.soz.exchange !== '' ? ` va ${props.soz.exchange} ga bog‘landi` : ''}.`)
}

// ---------------------------------------------------------------- auto-demo
const DEMO = [
  { izoh: '1/6 · Web App: order.created — mos binding’li navbatlarga', ilova: 'Web App', kalit: 'order.created', headers: 'kanal=email' },
  { izoh: '2/6 · Mobile App: order.shipped — qaysi navbatlar oladi?', ilova: 'Mobile App', kalit: 'order.shipped', headers: 'kanal=sms, urgent=yes' },
  { izoh: '3/6 · Cron Job: payment.done — mos binding yo‘q bo‘lsa → AE → DLQ', ilova: 'Cron Job', kalit: 'payment.done', headers: 'kanal=push' },
  { izoh: '4/6 · Ishlov xatosi: consumer nack qiladi → xabar qaytadi → qayta keladi', ilova: 'Web App', kalit: 'order.created', headers: 'kanal=email', sinov: 'xato' },
  { izoh: '5/6 · Poison xabar: consumer reject qiladi → DLX → DLQ', ilova: 'Mobile App', kalit: 'order.created', headers: 'kanal=email', sinov: 'poison' },
  { izoh: '6/6 · 5 ta xabar birdan — worker’lar orasida taqsimlanadi (prefetch=1)', ilova: 'Web App', kalit: 'order.created', headers: 'kanal=sms, urgent=yes', soni: 5 },
]
const demo = ref(false)
let demoTaymer = 0
const kut = (ms) => new Promise((r) => { demoTaymer = setTimeout(r, ms) })
async function autoDemo() {
  if (demo.value) { demo.value = false; clearTimeout(demoTaymer); props.soz.izoh = ''; return }
  demo.value = true
  try {
    if (!props.holat.exchangelar.some((e) => e.nom === NAMUNA.exchange)) {
      await namunaQur(props.buyruq, { tur: 'topic', avtoAck: props.soz.ack === 'auto', bosqich: (m) => { props.soz.izoh = m } })
    }
    props.soz.exchange = NAMUNA.exchange
    for (const q of DEMO) {
      if (!demo.value) break
      props.soz.izoh = q.izoh
      props.soz.kalit = q.kalit
      props.soz.headers = q.headers
      await yubor(q.ilova, q.sinov ?? '', q.soni ?? 1)
      await kut(4200 / props.soz.tezlik)
    }
  } finally {
    demo.value = false
    props.soz.izoh = ''
  }
}
onBeforeUnmount(() => { demo.value = false; clearTimeout(demoTaymer) })

defineExpose({ yubor, namuna })
</script>

<template>
    <div class="tez-panel">
        <div class="guruh">
            <label>Exchange</label>
            <select v-model="soz.exchange" @change="soz.qolda = true">
                <option v-for="e in exlar" :key="e.nom" :value="e.nom">{{ e.nom === '' ? '(default)' : e.nom }}</option>
            </select>
        </div>
        <div class="guruh">
            <label>Exchange turi</label>
            <div class="seg" :class="{ ochiq: soz.exchange === '' }">
                <button v-for="t in TURLAR" :key="t" type="button" :class="{ on: faolTur === t }" :disabled="!!band || soz.exchange === ''" @click="turTanla(t)">{{ t }}</button>
            </div>
        </div>
        <div v-if="faolTur !== 'headers'" class="guruh keng">
            <label>Routing key</label>
            <input v-model="soz.kalit" spellcheck="false">
            <div class="chiplar">
                <button v-for="k in kalitlar" :key="k" type="button" :class="{ on: soz.kalit === k }" @click="soz.kalit = k">{{ k }}</button>
            </div>
        </div>
        <div v-else class="guruh keng">
            <label>Xabar header’lari (key=value)</label>
            <input v-model="soz.headers" spellcheck="false">
            <div class="chiplar">
                <button v-for="k in HEADERLAR" :key="k" type="button" :class="{ on: soz.headers === k }" @click="soz.headers = k">{{ k }}</button>
            </div>
        </div>

        <div class="guruh keng">
            <label>Xabar body <span :class="jsonmi ? 'yaxshi' : 'yomon'">{{ jsonmi ? '✓ JSON' : 'matn' }}</span></label>
            <input v-model="soz.tana" spellcheck="false">
            <div class="chiplar">
                <button v-for="t in TANALAR" :key="t" type="button" :class="{ on: soz.tana === t }" @click="soz.tana = t">{{ t }}</button>
            </div>
        </div>
        <div class="guruh">
            <label>Tasdiqlash (ack)</label>
            <div class="seg">
                <button type="button" :class="{ on: soz.ack === 'manual' }" :disabled="!!band" @click="ackTanla('manual')">manual-ack</button>
                <button type="button" :class="{ on: soz.ack === 'auto' }" :disabled="!!band" @click="ackTanla('auto')">auto-ack</button>
            </div>
        </div>

        <div class="guruh">
            <label>Test</label>
            <div class="tugmalar">
                <button type="button" class="t sariq" :disabled="!!band" title="Consumer bu xabarni birinchi marta nack qiladi (requeue), qayta kelganda ack" @click="yubor(soz.ilova, 'xato', 1)">⚠ Ishlov xato</button>
                <button type="button" class="t qizil" :disabled="!!band" title="Consumer bu xabarni reject qiladi (requeue=false) → DLX" @click="yubor(soz.ilova, 'poison', 1)">☠ Poison xabar</button>
            </div>
        </div>
        <div class="guruh">
            <label>Barqarorlik</label>
            <div class="tugmalar">
                <button type="button" class="t" :class="{ on: soz.persistent }" @click="soz.persistent = !soz.persistent">💾 {{ soz.persistent ? 'Persistent' : 'Non-persistent' }}</button>
                <button type="button" class="t" :class="{ on: oflayn }" :disabled="!!band || (!oflayn && !holat.consumerlar.length)" @click="oflaynAlmashtir">📥 {{ oflayn ? 'Consumer’larni qaytarish' : 'Consumer offline' }}</button>
                <button type="button" class="t binafsha" :disabled="!!band" @click="restart">⚡ Broker restart</button>
            </div>
        </div>

        <div class="guruh keng">
            <label>Yangi queue + binding</label>
            <div class="qosh">
                <input v-model="yangi.nom" placeholder="navbat nomi" spellcheck="false">
                <input v-if="faolTur !== 'headers' && faolTur !== 'fanout'" v-model="yangi.kalit" placeholder="binding key" spellcheck="false">
                <select v-model.number="yangi.workerlar">
                    <option :value="0">worker’siz</option>
                    <option :value="1">1 worker</option>
                    <option :value="2">2 worker</option>
                    <option :value="3">3 worker</option>
                </select>
                <button type="button" class="t" :class="{ on: yangi.durable }" title="RabbitMQ 4.3+ da durable bo‘lmagan (transient) classic navbat rad etiladi — sinab ko‘ring" @click="yangi.durable = !yangi.durable">💾 {{ yangi.durable ? 'durable' : 'transient' }}</button>
                <button type="button" class="t" :disabled="!!band || !yangi.nom" @click="qosh">+ Qo‘shish</button>
            </div>
        </div>
        <div class="guruh">
            <label>Demo</label>
            <div class="tugmalar">
                <button type="button" class="t binafsha" :class="{ on: demo }" :disabled="!!band && !demo" @click="autoDemo">{{ demo ? '■ To‘xtatish' : '▶ Auto-demo' }}</button>
                <span class="tezlik">Tezlik <input v-model.number="soz.tezlik" type="range" min="0.5" max="2" step="0.25"> <b>{{ soz.tezlik.toFixed(2).replace(/0$/, '') }}×</b></span>
            </div>
        </div>

        <div class="pastki">
            <button type="button" class="asosiy" :disabled="!!band" @click="yubor()">▶ Yubor: {{ soz.ilova }}</button>
            <select v-model.number="soni" class="soni" title="Nechta xabar">
                <option :value="1">×1</option>
                <option :value="5">×5</option>
                <option :value="20">×20</option>
            </select>
            <button type="button" class="t" :disabled="!!band" @click="namuna">⟲ Namuna topologiya</button>
            <button type="button" class="t" :disabled="!!band" @click="tozala">Tozalash</button>
            <span v-if="band" class="band">bajarilmoqda…</span>
            <span v-else-if="xabar?.matn" class="natija" :class="{ xato: !xabar.ok }">{{ xabar.matn }}</span>
        </div>
    </div>
</template>

<style scoped>
.tez-panel { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 14px 22px; align-items: start; }
.guruh { display: grid; gap: 6px; min-width: 0; }
.guruh.keng { grid-column: span 2; }
label { font: 600 10.5px var(--font-mono); letter-spacing: .1em; text-transform: uppercase; color: var(--text-subtle); }
label span { letter-spacing: 0; text-transform: none; margin-left: 6px; }
.yaxshi { color: var(--success); } .yomon { color: var(--text-subtle); }
input:not([type=range]), select { min-width: 0; padding: 7px 10px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-sunken); color: var(--text); font: 13px var(--font-mono); }
.seg { display: inline-flex; padding: 3px; gap: 2px; border-radius: 11px; background: var(--bg-sunken); border: 1px solid var(--border); justify-self: start; flex-wrap: wrap; }
.seg button { padding: 6px 12px; border: 0; border-radius: 8px; background: none; color: var(--text-muted); font: 500 13px var(--font-sans); cursor: pointer; }
.seg button.on { background: var(--accent); color: #fff; font-weight: 600; box-shadow: var(--shadow-sm); }
.seg button:disabled { cursor: default; }
.seg.ochiq { opacity: .5; }
.chiplar, .tugmalar { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.chiplar button { padding: 4px 9px; border: 1px dashed var(--border-strong); border-radius: 7px; background: none; color: var(--accent-text); font: 12px var(--font-mono); cursor: pointer; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.chiplar button.on { border-style: solid; border-color: var(--accent); background: color-mix(in srgb, var(--accent) 10%, transparent); }
.t { padding: 6px 11px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-elevated); color: var(--text); font: 12.5px var(--font-mono); cursor: pointer; }
.t:hover:not(:disabled) { border-color: var(--border-strong); }
.t:disabled { opacity: .5; cursor: default; }
.t.on { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 10%, transparent); color: var(--accent-text); }
.t.sariq { color: #b45309; border-style: dashed; }
.t.qizil { color: #dc2626; border-style: dashed; }
.t.binafsha { color: #7c3aed; border-color: color-mix(in srgb, #7c3aed 40%, var(--border)); }
.t.binafsha.on { background: color-mix(in srgb, #7c3aed 12%, transparent); }
.qosh { display: flex; flex-wrap: wrap; gap: 6px; }
.qosh input { width: 140px; }
.tezlik { display: inline-flex; align-items: center; gap: 6px; font: 12px var(--font-mono); color: var(--text-muted); }
.tezlik input { width: 100px; accent-color: var(--accent); }
.tezlik b { color: var(--accent-text); }
.pastki { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; padding-top: 4px; }
.asosiy { padding: 10px 20px; border: 0; border-radius: 11px; background: var(--accent); color: #fff; font: 700 15px var(--font-sans); cursor: pointer; box-shadow: 0 4px 14px color-mix(in srgb, var(--accent) 35%, transparent); }
.asosiy:disabled { opacity: .6; }
.soni { padding: 9px 8px !important; }
.band { font-size: 13px; color: var(--text-subtle); }
.natija { font-size: 13px; color: var(--success); }
.natija.xato { color: var(--danger, #dc2626); }
@media (max-width: 640px) { .guruh.keng { grid-column: auto; } }
</style>
