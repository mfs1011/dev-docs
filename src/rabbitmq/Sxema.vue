<script setup>
// RabbitMQ xabar oqimi: yuboruvchi → exchange → navbat → consumer, kartochkalar va ular orasidagi egri chiziqlar.
// Hammasi VM'dagi haqiqiy brokerdan: tuzilma — HTTP API (har soniyada), harakat — firehose "publish" (routed_queues)
// va consumer "ishlov" hodisalari. Xabar belgisi chiziq bo'ylab yuradi; tushgan navbat yonadi, tushmaganlari xiralashadi.
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

const props = defineProps({
  holat: { type: Object, required: true },
  tingla: { type: Function, required: true },
})
const emit = defineEmits(['tanla'])

const EX_IZOH = {
  direct: 'Routing key binding key bilan aynan teng bo‘lgan navbatga.',
  fanout: 'Kalitga qaramaydi — har bog‘langan navbatga nusxa.',
  topic: 'Kalit andozasi: * — bitta so‘z, # — nol yoki ko‘p so‘z.',
  headers: 'Kalit emas, xabar header’lari bo‘yicha.',
}
const exNomi = (n) => (n === '' ? '(default)' : n)

// --- ko'rsatiladigan tugunlar
const exchangelar = computed(() => props.holat.exchangelar.filter((e) =>
  e.nom === '' || !e.nom.startsWith('amq.') || props.holat.boglanishlar.some((b) => b.exchange === e.nom)))
const navbatlar = computed(() => props.holat.navbatlar)
// consumer'lar navbat bo'yicha guruhlanadi (worker pool)
const guruhlar = computed(() => navbatlar.value
  .map((n) => ({ navbat: n.nom, consumerlar: props.holat.consumerlar.filter((c) => c.navbat === n.nom) }))
  .filter((g) => g.consumerlar.length))

const dlx = (n) => n.args?.['x-dead-letter-exchange'] ?? n.policy?.['dead-letter-exchange']
function belgilar(n) {
  const a = n.args ?? {}, p = n.policy ?? {}, b = []
  const ttl = a['x-message-ttl'] ?? p['message-ttl']
  const max = a['x-max-length'] ?? p['max-length']
  if (ttl != null) b.push(`TTL ${ttl} ms`)
  if (max != null) b.push(`max ${max}`)
  if (a['x-overflow']) b.push(a['x-overflow'])
  if (a['x-delivery-limit'] != null) b.push(`delivery-limit ${a['x-delivery-limit']}`)
  if (dlx(n) != null) b.push(`DLX → ${exNomi(dlx(n))}`)
  return b
}

// --- vaqtinchalik holatlar: yonish, xiralashish, consumer holati
const yonish = reactive({})          // tugun kaliti -> 'ok' | 'xato' | 'xira'
const conHolat = reactive({})        // consumer id -> { matn, tur }
const taymerlar = []
function yondir(kalit, tur, ms = 1100) {
  yonish[kalit] = tur
  taymerlar.push(setTimeout(() => { if (yonish[kalit] === tur) delete yonish[kalit] }, ms))
}

// --- chiziqlar: kartochkalar o'rnini o'lchab, SVG'da egri chizish
const quti = ref(null)
const nuqtalar = reactive({})        // kalit -> { x1 (chap o'rta), x2 (o'ng o'rta), y }
function olcha() {
  const q = quti.value
  if (!q) return
  const r0 = q.getBoundingClientRect()
  for (const el of q.querySelectorAll('[data-tugun]')) {
    const r = el.getBoundingClientRect()
    nuqtalar[el.dataset.tugun] = { x1: r.left - r0.left, x2: r.right - r0.left, y: r.top - r0.top + Math.min(r.height / 2, 46) }
  }
  olcham.w = q.scrollWidth
  olcham.h = q.scrollHeight
}
const olcham = reactive({ w: 0, h: 0 })
let ro
onMounted(() => { ro = new ResizeObserver(olcha); ro.observe(quti.value); nextTick(olcha) })
watch(() => [exchangelar.value.length, navbatlar.value.length, props.holat.consumerlar.length, props.holat.boglanishlar.length], () => nextTick(olcha))

function egri(a, b) {
  if (!a || !b) return ''
  const x1 = a.x2, y1 = a.y, x2 = b.x1, y2 = b.y, d = Math.max(40, (x2 - x1) / 2)
  return `M${x1},${y1} C${x1 + d},${y1} ${x2 - d},${y2} ${x2},${y2}`
}
const chiziqlar = computed(() => {
  const l = []
  for (const e of exchangelar.value) l.push({ k: 'p>' + e.nom, d: egri(nuqtalar.yub, nuqtalar['e:' + e.nom]), tur: 'yub' })
  for (const b of props.holat.boglanishlar) {
    l.push({ k: `b:${b.exchange}>${b.navbat}:${b.kalit}`, d: egri(nuqtalar['e:' + b.exchange], nuqtalar['q:' + b.navbat]), tur: 'bog', kalit: b.kalit || '∅' })
  }
  if (nuqtalar['e:'] ) for (const n of navbatlar.value) l.push({ k: 'd>' + n.nom, d: egri(nuqtalar['e:'], nuqtalar['q:' + n.nom]), tur: 'yashirin' })
  for (const c of props.holat.consumerlar) l.push({ k: 'c:' + c.id, d: egri(nuqtalar['q:' + c.navbat], nuqtalar['c:' + c.id]), tur: 'con' })
  for (const n of navbatlar.value) {
    const d = dlx(n)
    if (d != null && nuqtalar['e:' + d] && nuqtalar['q:' + n.nom]) {
      const a = nuqtalar['q:' + n.nom], b = nuqtalar['e:' + d]
      l.push({ k: 'dlx:' + n.nom, tur: 'dlx', d: `M${a.x1 + 30},${a.y + 30} C${a.x1 - 60},${a.y + 140} ${b.x2 + 60},${b.y + 120} ${b.x2 - 30},${b.y + 26}` })
    }
  }
  return l.filter((x) => x.d)
})

// --- xabar belgilari chiziq bo'ylab (animateMotion)
const oxirgi = ref(null)            // yuboruvchi kartochkasida — oxirgi yuborilgan xabar
const xatlar = ref([])
let raqam = 0
function xat(d, rang, kechikish = 0, ms = 650) {
  if (!d) return
  const id = ++raqam
  taymerlar.push(setTimeout(() => {
    xatlar.value.push({ id, d, rang, ms })
    taymerlar.push(setTimeout(() => { xatlar.value = xatlar.value.filter((x) => x.id !== id) }, ms + 60))
  }, kechikish))
}

function hodisa(x) {
  if (x.t === 'oqim' && x.tur === 'publish') {
    const ex = x.nom ?? ''
    oxirgi.value = { ex, kalit: (x.kalitlar ?? []).join(', '), tana: x.tana, yetdi: (x.navbatlar ?? []).length }
    const qlar = (x.navbatlar ?? []).filter((q) => nuqtalar['q:' + q])
    xat(egri(nuqtalar.yub, nuqtalar['e:' + ex]), 'var(--rmq-ex)')
    taymerlar.push(setTimeout(() => {
      yondir('e:' + ex, qlar.length ? 'ok' : 'xato')
      for (const n of navbatlar.value) if (!qlar.includes(n.nom)) yondir('q:' + n.nom, 'xira')
    }, 650))
    for (const q of qlar) {
      xat(egri(nuqtalar['e:' + ex], nuqtalar['q:' + q]), 'var(--rmq-ex)', 650)
      taymerlar.push(setTimeout(() => yondir('q:' + q, 'ok'), 1300))
    }
  } else if (x.t === 'ishlov') {
    const q = nuqtalar['q:' + x.navbat], c = nuqtalar['c:' + x.consumer]
    xat(egri(q, c), 'var(--rmq-q)')
    const HOLAT = {
      ack: ['✓ ack — bajarildi', 'ok'], auto: ['✓ auto-ack', 'ok'],
      nack: ['↺ nack — navbatga qaytdi', 'qayt'], reject: ['✗ reject — rad etildi', 'xato'], crash: ['☠ o‘ldi — tasdiqsiz', 'xato'],
    }
    const [matn, tur] = HOLAT[x.xulq] ?? [x.xulq, 'ok']
    taymerlar.push(setTimeout(() => {
      conHolat[x.consumer] = { matn: (x.redelivered ? '(redelivered) ' : '') + matn, tur, tana: x.tana }
      yondir('c:' + x.consumer, tur === 'ok' ? 'ok' : 'xato')
      if (x.xulq === 'nack' || x.xulq === 'crash') xat(egri(c, q).length ? `M${c.x1},${c.y} C${c.x1 - 60},${c.y + 40} ${q.x2 + 60},${q.y + 40} ${q.x2},${q.y}` : '', '#e3a008', 0, 700)
      if (x.xulq === 'reject') {
        const n = navbatlar.value.find((v) => v.nom === x.navbat)
        const d = n && dlx(n)
        if (d != null && nuqtalar['e:' + d]) xat(chiziqlar.value.find((l) => l.k === 'dlx:' + x.navbat)?.d ?? '', 'var(--rmq-xato)', 0, 900)
      }
    }, 650))
  }
}
let bekor
onMounted(() => { bekor = props.tingla(hodisa) })
onBeforeUnmount(() => { bekor?.(); ro?.disconnect(); taymerlar.forEach(clearTimeout) })

const XAT_CHEGARA = 12
const xatSoni = (n) => Math.min(n, XAT_CHEGARA)
</script>

<template>
    <div ref="quti" class="oqim">
        <svg class="chiziqlar" :width="olcham.w" :height="olcham.h" aria-hidden="true">
            <path v-for="l in chiziqlar" :key="l.k" :d="l.d" :class="l.tur" />
            <g v-for="x in xatlar" :key="x.id">
                <g>
                    <rect x="-9" y="-6.5" width="18" height="13" rx="3" :fill="x.rang" />
                    <path d="M-9,-6 L0,1 L9,-6" fill="none" stroke="#fff" stroke-width="1.6" />
                    <animateMotion :dur="x.ms + 'ms'" fill="freeze" :path="x.d" />
                </g>
            </g>
        </svg>

        <section class="ustun">
            <h4>Yuboruvchi</h4>
            <div class="karta yub" data-tugun="yub">
                <span class="ikon">➜</span>
                <small>PRODUCER</small>
                <b>Panel · “Yuborish”</b>
                <p>Xabarni exchange’ga routing key bilan yuboradi.</p>
                <div v-if="oxirgi" class="oxirgi">
                    <span>→ <b>{{ exNomi(oxirgi.ex) }}</b></span>
                    <span>key: <code>{{ oxirgi.kalit || '∅' }}</code></span>
                    <span class="tana">«{{ oxirgi.tana }}»</span>
                    <span :class="oxirgi.yetdi ? 'yetdi' : 'yetmadi'">{{ oxirgi.yetdi ? `${oxirgi.yetdi} ta navbatga` : 'hech qayerga' }}</span>
                </div>
            </div>
        </section>

        <section class="ustun">
            <h4>Exchange</h4>
            <div
                v-for="e in exchangelar" :key="e.nom" class="karta ex" :class="yonish['e:' + e.nom]"
                :data-tugun="'e:' + e.nom" @click="emit('tanla', { tur: 'exchange', nom: e.nom })"
            >
                <span class="ikon">⇄</span>
                <small>AYIRBOSHLAGICH</small>
                <b>{{ exNomi(e.nom) }}</b>
                <p>{{ e.nom === '' ? 'Har navbatga uning nomi bilan yashirin bog‘langan.' : EX_IZOH[e.tur] }}</p>
                <span class="nishon">type: {{ e.tur }}</span>
                <span v-if="yonish['e:' + e.nom] === 'xato'" class="ogoh">yo‘naltirilmadi — xabar yo‘qoldi</span>
            </div>
        </section>

        <section class="ustun">
            <h4>Navbat</h4>
            <p v-if="!navbatlar.length" class="bosh">Hali navbat yo‘q — panelda “Navbat”.</p>
            <div
                v-for="n in navbatlar" :key="n.nom" class="karta nv" :class="yonish['q:' + n.nom]"
                :data-tugun="'q:' + n.nom" @click="emit('tanla', { tur: 'navbat', nom: n.nom })"
            >
                <span class="ikon">☰</span>
                <small>NAVBAT</small>
                <b>{{ n.nom }} <em class="tur">{{ n.tur }}</em></b>
                <p v-if="props.holat.boglanishlar.some((b) => b.navbat === n.nom)" class="bog-kalit">
                    binding: <code v-for="b in props.holat.boglanishlar.filter((b) => b.navbat === n.nom)" :key="b.exchange + b.kalit">{{ b.kalit || '∅' }}</code>
                </p>
                <div v-if="belgilar(n).length" class="arglar"><span v-for="a in belgilar(n)" :key="a">{{ a }}</span></div>
                <div class="xatlar">
                    <i v-for="i in xatSoni(n.tayyor)" :key="'r' + i" class="tayyor" title="tayyor (ready)" />
                    <i v-for="i in xatSoni(n.unacked)" :key="'u' + i" class="unacked" title="tasdiqlanmagan (unacked)" />
                    <span class="son">{{ n.tayyor }} tayyor · {{ n.unacked }} unacked</span>
                </div>
            </div>
        </section>

        <section class="ustun">
            <h4>Consumer</h4>
            <p v-if="!guruhlar.length" class="bosh">Consumer yo‘q — xabarlar navbatda kutadi.</p>
            <div v-for="g in guruhlar" :key="g.navbat" class="pool" :class="{ yakka: g.consumerlar.length === 1 }">
                <small v-if="g.consumerlar.length > 1" class="pool-nom">WORKER POOL · {{ g.navbat }}</small>
                <div
                    v-for="c in g.consumerlar" :key="c.id" class="karta con" :class="yonish['c:' + c.id]"
                    :data-tugun="'c:' + c.id" @click="emit('tanla', { tur: 'consumer', nom: c.id })"
                >
                    <span class="ikon">⤓</span>
                    <small>ISTE’MOLCHI · prefetch={{ c.prefetch || '∞' }}{{ c.avto_ack ? ' · auto-ack' : '' }}</small>
                    <b>{{ c.id }} <em class="tur">{{ c.avto_ack ? 'auto' : c.xulq }}</em></b>
                    <p class="holat" :class="conHolat[c.id]?.tur">{{ conHolat[c.id]?.matn ?? 'kutmoqda…' }}</p>
                    <p v-if="conHolat[c.id]?.tana" class="tana">«{{ conHolat[c.id].tana }}»</p>
                    <span class="nishon">{{ c.ishlandi }} ta ishlandi{{ c.kechikish_ms ? ` · ${c.kechikish_ms} ms` : '' }}</span>
                </div>
            </div>
        </section>
    </div>
</template>

<style scoped>
.oqim {
  --rmq-ex: #8b5cf6; --rmq-q: #16a34a; --rmq-xato: #dc2626; --rmq-qayt: #d97706;
  position: relative; display: grid; grid-template-columns: minmax(150px, .8fr) minmax(190px, 1fr) minmax(210px, 1.15fr) minmax(190px, 1fr);
  gap: 72px; padding: 6px 4px 10px; font-family: var(--font-sans);
}
.chiziqlar { position: absolute; inset: 0; pointer-events: none; overflow: visible; z-index: 2; }
.chiziqlar path { fill: none; stroke: color-mix(in srgb, var(--text-subtle) 55%, transparent); stroke-width: 1.6; }
.chiziqlar path.yashirin { stroke-dasharray: 2 5; opacity: .5; }
.chiziqlar path.con { stroke-dasharray: 5 4; }
.chiziqlar path.dlx { stroke: var(--rmq-xato); stroke-dasharray: 6 4; opacity: .6; }
.chiziqlar g path { stroke: #fff; }
.ustun { display: flex; flex-direction: column; gap: 14px; min-width: 0; position: relative; z-index: 1; }
h4 { margin: 0 0 2px; text-align: center; font: 600 11px var(--font-mono); letter-spacing: .12em; text-transform: uppercase; color: var(--text-subtle); }
.bosh { margin: 0; padding: 14px 10px; border: 1px dashed var(--border); border-radius: 12px; color: var(--text-subtle); font-size: 12.5px; text-align: center; }

.karta { position: relative; display: grid; gap: 3px; padding: 12px 14px; border: 1px solid var(--border); border-radius: 14px; background: var(--bg-elevated); box-shadow: var(--shadow-sm); cursor: pointer; transition: border-color .25s, box-shadow .25s, opacity .3s, transform .25s; }
.karta:hover { border-color: var(--border-strong); }
.ikon { width: 30px; height: 30px; display: grid; place-items: center; border-radius: 9px; font-size: 15px; margin-bottom: 4px; }
.karta small { font: 600 10px var(--font-mono); letter-spacing: .1em; color: var(--text-subtle); }
.karta b { font-size: 15px; display: flex; gap: 6px; align-items: center; flex-wrap: wrap; overflow-wrap: anywhere; }
.karta p { margin: 0; font-size: 12.5px; color: var(--text-muted); line-height: 1.4; }
.tur { font: 600 9.5px var(--font-mono); font-style: normal; text-transform: uppercase; padding: 1px 6px; border-radius: 5px; background: var(--bg-sunken); color: var(--text-muted); border: 1px solid var(--border); }
.nishon { justify-self: start; margin-top: 4px; font: 11px var(--font-mono); padding: 2px 7px; border-radius: 6px; background: var(--bg-sunken); color: var(--text-muted); }

.yub .ikon { background: color-mix(in srgb, var(--accent) 16%, transparent); color: var(--accent-text); }
.yub { border-color: color-mix(in srgb, var(--accent) 55%, var(--border)); }
.ex .ikon { background: color-mix(in srgb, var(--rmq-ex) 15%, transparent); color: var(--rmq-ex); }
.ex { border-color: color-mix(in srgb, var(--rmq-ex) 35%, var(--border)); background: color-mix(in srgb, var(--rmq-ex) 4%, var(--bg-elevated)); }
.ex .nishon { background: color-mix(in srgb, var(--rmq-ex) 12%, transparent); color: var(--rmq-ex); }
.nv .ikon { background: color-mix(in srgb, var(--rmq-q) 14%, transparent); color: var(--rmq-q); }
.con .ikon { background: color-mix(in srgb, var(--accent) 14%, transparent); color: var(--accent-text); }

.karta.ok { border-color: var(--rmq-q); box-shadow: 0 0 0 3px color-mix(in srgb, var(--rmq-q) 22%, transparent); }
.ex.ok { border-color: var(--rmq-ex); box-shadow: 0 0 0 3px color-mix(in srgb, var(--rmq-ex) 25%, transparent); }
.karta.xato { border-color: var(--rmq-xato); box-shadow: 0 0 0 3px color-mix(in srgb, var(--rmq-xato) 22%, transparent); }
.karta.xira { opacity: .38; }
.ogoh { font-size: 11.5px; color: var(--rmq-xato); font-weight: 600; }

.bog-kalit code { font: 11.5px var(--font-mono); color: var(--accent-text); margin-right: 6px; }
.arglar { display: flex; flex-wrap: wrap; gap: 4px; }
.arglar span { font: 10.5px var(--font-mono); padding: 1px 6px; border-radius: 5px; background: color-mix(in srgb, var(--rmq-qayt) 12%, transparent); color: var(--rmq-qayt); }
.xatlar { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; min-height: 18px; margin-top: 4px; }
.xatlar i { width: 14px; height: 10px; border-radius: 2px; position: relative; }
.xatlar i::after { content: ''; position: absolute; inset: 1px 2px auto; height: 5px; border-bottom: 1.4px solid #fff; border-left: 1.4px solid transparent; border-right: 1.4px solid transparent; }
.xatlar i.tayyor { background: var(--accent); }
.xatlar i.unacked { background: var(--rmq-qayt); opacity: .75; }
.son { margin-left: auto; font: 11px var(--font-mono); color: var(--text-subtle); }

.oxirgi { display: grid; gap: 2px; margin-top: 6px; padding: 7px 9px; border-radius: 9px; background: var(--bg-sunken); font: 11.5px var(--font-mono); color: var(--text-muted); }
.oxirgi b { font-size: 11.5px; display: inline; }
.oxirgi code { color: var(--accent-text); }
.oxirgi .yetdi { color: var(--rmq-q); }
.oxirgi .yetmadi { color: var(--rmq-xato); }
.pool { display: grid; gap: 10px; padding: 10px; border: 1px dashed var(--border-strong); border-radius: 16px; background: color-mix(in srgb, var(--bg-sunken) 60%, transparent); }
.pool.yakka { padding: 0; border: 0; background: none; }
.pool-nom { font: 600 10px var(--font-mono); letter-spacing: .1em; color: var(--text-subtle); }
.holat { font: 12px var(--font-mono) !important; }
.holat.ok { color: var(--rmq-q) !important; }
.holat.xato { color: var(--rmq-xato) !important; }
.holat.qayt { color: var(--rmq-qayt) !important; }
.tana { font: 11.5px var(--font-mono) !important; color: var(--text-subtle) !important; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

@media (max-width: 900px) {
  .oqim { grid-template-columns: 1fr 1fr; }
  .chiziqlar { display: none; }
}
</style>
