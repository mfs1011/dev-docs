<script setup>
// Sahna: tugunlar (karta + ikonka), chiziqlar, yuradigan paket (paket darslari) va davomli oqim nuqtalari
// (tizim darslari). Ranglar faqat main.css tokenlaridan. docs/vizualizator/README.md 3.3, 4.1
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { IKONKALAR } from './ikonkalar.js'

const props = defineProps({
  dars: { type: Object, required: true },
  korinadi: { type: Array, default: () => [] },
  chiziqlar: { type: Array, default: null },     // qadamdagi chiziqlar (bo'lmasa — darsniki)
  kamera: { type: Array, default: () => [] },
  teglar: { type: Object, default: () => ({}) },
  faol: { type: Object, default: null },        // { h, p }
  yozildi: { type: String, default: null },     // manzil satri (yozish hodisasi tugagan)
  oqimlar: { type: Array, default: () => [] },
  jonli: { type: Boolean, default: true },      // oqimlar harakatlanadimi
  tezlik: { type: Number, default: 1 },
  kamaytir: { type: Boolean, default: false },  // prefers-reduced-motion
})
const emit = defineEmits(['tugun'])

// Tor (tik) konteynerda sxema 90° buriladi: chapdan o'ngga oqim yuqoridan pastga bo'ladi, yozuvlar kattaroq
const ildiz = ref(null)
const tik = ref(false)
let ro = null
onMounted(() => {
  ro = new ResizeObserver(([e]) => { const { width, height } = e.contentRect; tik.value = width < 560 && height > width * 0.9 })
  ro.observe(ildiz.value)
})
onBeforeUnmount(() => ro?.disconnect())
const BW = computed(() => (tik.value ? 196 : 168))
const BH = computed(() => (tik.value ? 72 : 62))
const tugunlar = computed(() => {
  const t = props.dars.tugunlar
  if (!tik.value) return t
  const ys = Object.values(t).map((n) => n.y)
  const markaz = (Math.min(...ys) + Math.max(...ys)) / 2
  return Object.fromEntries(Object.entries(t).map(([k, n]) => [k, { ...n, x: markaz + (n.y - markaz) * 1.35, y: n.x * 0.8 }]))
})
const kor = computed(() => new Set(props.korinadi))
const T = (id) => tugunlar.value[id]

// ── kamera: ko'rinadigan maydon kamera tugunlariga moslanadi, silliq o'tadi ──
function maqsadVb(ids) {
  const nodes = ids.map(T).filter(Boolean)
  if (!nodes.length) return [0, 0, 1000, 620]
  let x0 = Math.min(...nodes.map((n) => n.x)) - BW.value / 2 - 70
  let x1 = Math.max(...nodes.map((n) => n.x)) + BW.value / 2 + 70
  let y0 = Math.min(...nodes.map((n) => n.y)) - BH.value / 2 - 90
  let y1 = Math.max(...nodes.map((n) => n.y)) + BH.value / 2 + 70
  const minW = tik.value ? 420 : 560, minH = tik.value ? 520 : 380
  if (x1 - x0 < minW) { const c = (x0 + x1) / 2; x0 = c - minW / 2; x1 = c + minW / 2 }
  if (y1 - y0 < minH) { const c = (y0 + y1) / 2; y0 = c - minH / 2; y1 = c + minH / 2 }
  return [x0, y0, x1 - x0, y1 - y0]
}
// tik ekranda joy kam — kamera hamma ko'rinadigan tugunni oladi (bir qismi chetda kesilib qolmasin)
const kameraIds = () => (tik.value ? props.korinadi : props.kamera)
const vb = ref(maqsadVb(props.kamera))
let kameraRaf = 0
watch(() => kameraIds().join(',') + tik.value, () => {
  const dan = [...vb.value], ga = maqsadVb(kameraIds())
  cancelAnimationFrame(kameraRaf)
  if (props.kamaytir) { vb.value = ga; return }
  const bosh = performance.now()
  const kadr = (now) => {
    const p = Math.min(1, (now - bosh) / 650)
    const e = 1 - Math.pow(1 - p, 3)
    vb.value = dan.map((v, i) => v + (ga[i] - v) * e)
    if (p < 1) kameraRaf = requestAnimationFrame(kadr)
  }
  kameraRaf = requestAnimationFrame(kadr)
})

const chiziqlar = computed(() => (props.chiziqlar ?? props.dars.chiziqlar)
  .filter(([a, b]) => kor.value.has(a) && kor.value.has(b))
  .map(([a, b]) => ({ id: `${a}-${b}`, a: T(a), b: T(b) })))

// ── paket: yo'l bo'ylab (masalan, klient → router → dns) ──
const yol = (dan, ga) => props.dars.yollar?.[`${dan}>${ga}`] ?? [dan, ga]
function nuqta(ids, p) {
  const pts = ids.map(T)
  const seg = pts.slice(1).map((b, i) => Math.hypot(b.x - pts[i].x, b.y - pts[i].y))
  let d = p * seg.reduce((s, x) => s + x, 0)
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) {
      const k = seg[i] ? Math.min(1, d / seg[i]) : 1
      return { x: pts[i].x + (pts[i + 1].x - pts[i].x) * k, y: pts[i].y + (pts[i + 1].y - pts[i].y) * k }
    }
    d -= seg[i]
  }
  return pts[0]
}
const ease = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2)
const paket = computed(() => {
  const f = props.faol
  if (!f || f.h.tur !== 'paket') return null
  const ids = yol(f.h.dan, f.h.ga)
  const pos = nuqta(ids, ease(f.p))
  return { ...pos, h: f.h, ids }
})
const faolTugunlar = computed(() => {
  const f = props.faol?.h
  return f?.tur === 'paket' ? new Set([f.dan, f.ga]) : new Set()
})
const yozish = computed(() => {
  const f = props.faol
  if (f?.h.tur === 'yozish') return { tugun: T(f.h.tugun), matn: f.h.matn.slice(0, Math.round(f.h.matn.length * f.p)), kursor: true }
  if (props.yozildi) return { tugun: T(props.dars.yozishTuguni ?? 'klient'), matn: props.yozildi, kursor: false }
  return null
})

// ── davomli oqim nuqtalari (tizim darslari) ──
const nuqtalar = shallowRef([])
let oqimRaf = 0, oxirgi = 0
const hisob = new Map()
function oqimKadr(now) {
  const dt = Math.min(0.1, (now - (oxirgi || now)) / 1000) * props.tezlik
  oxirgi = now
  const yangi = []
  for (const d of nuqtalar.value) {
    const t = d.t + dt / d.davom
    if (t < 1) yangi.push({ ...d, t })
  }
  for (const o of props.oqimlar) {
    const [a, b] = o.chiziq
    if (!kor.value.has(a) || !kor.value.has(b)) continue
    const key = o.id ?? `${a}>${b}`
    const h = (hisob.get(key) ?? { acc: 0, i: 0 })
    h.acc += dt * (o.tezlik ?? 2)
    while (h.acc >= 1) {
      h.acc -= 1
      const naqsh = o.naqsh ?? ['sorov']
      const tur = naqsh[h.i++ % naqsh.length]
      yangi.push({ id: `${key}-${now}-${h.i}`, a, b, tur, t: 0, davom: o.davom ?? 1.1, toxta: tur === 'xato' ? 0.55 : 1 })
    }
    hisob.set(key, h)
  }
  nuqtalar.value = yangi.slice(-160).filter((d) => d.t <= d.toxta)
  oqimRaf = requestAnimationFrame(oqimKadr)
}
watch(() => props.jonli && props.oqimlar.length > 0, (on) => {
  cancelAnimationFrame(oqimRaf)
  oxirgi = 0
  if (on) oqimRaf = requestAnimationFrame(oqimKadr)
}, { immediate: true })
watch(() => props.oqimlar, () => { nuqtalar.value = []; hisob.clear() })
onBeforeUnmount(() => { cancelAnimationFrame(oqimRaf); cancelAnimationFrame(kameraRaf) })
const nuqtaPos = (d) => ({ x: T(d.a).x + (T(d.b).x - T(d.a).x) * d.t, y: T(d.a).y + (T(d.b).y - T(d.a).y) * d.t })

const tegRang = { ok: 'ok', ogoh: 'ogoh', xato: 'xato', info: 'info', insight: 'insight' }
const bandRang = (b) => (b >= 0.9 ? 'xato' : b >= 0.7 ? 'ogoh' : 'ok')
const ariaMatn = computed(() => props.korinadi.map((id) => T(id)?.nom).filter(Boolean).join(', '))
</script>

<template>
  <svg ref="ildiz" class="sahna-svg" :class="{ tik }" :viewBox="vb.join(' ')" preserveAspectRatio="xMidYMid meet" role="img" :aria-label="`Sxema: ${ariaMatn}`">
    <defs>
      <pattern id="sahna-nuqta" width="22" height="22" patternUnits="userSpaceOnUse">
        <circle cx="1.5" cy="1.5" r="1.2" class="to-nuqta" />
      </pattern>
      <marker id="sahna-uch" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0 0 10 5 0 10z" class="uch" />
      </marker>
    </defs>
    <rect :x="vb[0] - 2000" :y="vb[1] - 2000" :width="vb[2] + 4000" :height="vb[3] + 4000" fill="url(#sahna-nuqta)" />

    <g class="chiziqlar">
      <line v-for="c in chiziqlar" :key="c.id" :x1="c.a.x" :y1="c.a.y" :x2="c.b.x" :y2="c.b.y"
            :class="{ faol: paket && paket.ids.some((id, i) => i && ((T(paket.ids[i - 1]) === c.a && T(id) === c.b) || (T(paket.ids[i - 1]) === c.b && T(id) === c.a))) }" />
    </g>

    <g class="nuqtalar">
      <g v-for="d in nuqtalar" :key="d.id" :transform="`translate(${nuqtaPos(d).x} ${nuqtaPos(d).y})`" :class="['oq', d.tur]">
        <rect v-if="d.tur === 'ogir'" x="-6" y="-6" width="12" height="12" rx="2" />
        <path v-else-if="d.tur === 'xato'" d="M-5 -5 5 5 M5 -5 -5 5" />
        <circle v-else :r="d.tur === 'tekshiruv' ? 5 : 4.5" />
      </g>
    </g>

    <TransitionGroup name="tugun" tag="g">
      <g v-for="id in korinadi" :key="id" class="tugun" :class="{ faol: faolTugunlar.has(id), yiqildi: teglar[id]?.yiqildi }"
         :transform="`translate(${T(id).x - BW / 2} ${T(id).y - BH / 2})`" @click="emit('tugun', id)">
        <rect :width="BW" :height="BH" rx="10" class="karta" />
        <g transform="translate(12 19) scale(1.0)" class="ikonka">
          <path :d="IKONKALAR[T(id).ikonka] ?? IKONKALAR.server" />
        </g>
        <text x="46" y="27" class="nom">{{ T(id).nom }}</text>
        <text x="46" y="45" class="izoh">{{ T(id).izoh }}</text>
        <g v-if="teglar[id]?.band != null" :transform="`translate(12 ${BH - 9})`">
          <rect :width="BW - 24" height="4" rx="2" class="band-fon" />
          <rect :width="(BW - 24) * Math.min(1, teglar[id].band)" height="4" rx="2" :class="['band', bandRang(teglar[id].band)]" />
        </g>
        <path v-if="teglar[id]?.yiqildi" :d="`M${BW - 22} 8 l12 12 M${BW - 10} 8 l-12 12`" class="x-belgi" />
        <g v-if="teglar[id]?.matn" :transform="`translate(${BW / 2} -14)`" :class="['teg', tegRang[teglar[id].rang] ?? 'info']">
          <rect :x="-(teglar[id].matn.length * 3.7 + 12)" y="-11" :width="teglar[id].matn.length * 7.4 + 24" height="22" rx="11" />
          <text text-anchor="middle" y="4">{{ teglar[id].matn }}</text>
        </g>
      </g>
    </TransitionGroup>

    <g v-if="yozish" :transform="`translate(${yozish.tugun.x - 130} ${yozish.tugun.y - BH / 2 - 76})`" class="manzil">
      <rect width="260" height="34" rx="17" />
      <path transform="translate(10 5) scale(1)" :d="IKONKALAR.dns" class="m-ikonka" />
      <text x="42" y="22">{{ yozish.matn }}<tspan v-if="yozish.kursor" class="kursor">▍</tspan></text>
    </g>

    <g v-if="paket" :transform="`translate(${paket.x} ${paket.y})`" :class="['paket', paket.h.rang ?? 'sorov']">
      <circle r="6" class="p-nuqta" />
      <g transform="translate(-92 -66)">
        <rect width="184" :height="24 + (paket.h.qatorlar?.length ?? 0) * 17" rx="7" class="p-fon" />
        <rect width="5" :height="24 + (paket.h.qatorlar?.length ?? 0) * 17" rx="2" class="p-chet" />
        <path v-if="paket.h.qulf" transform="translate(160 3) scale(.75)" :d="IKONKALAR.qulf" class="p-qulf" />
        <text x="14" y="17" class="p-yorliq">{{ paket.h.yorliq }}</text>
        <text v-for="(q, i) in paket.h.qatorlar ?? []" :key="i" x="14" :y="35 + i * 17" class="p-qator">{{ q }}</text>
      </g>
    </g>
  </svg>
</template>

<style scoped>
.sahna-svg { width: 100%; height: 100%; display: block; user-select: none; }
.to-nuqta { fill: var(--grid-dot); }
.uch { fill: var(--border-strong); }
.chiziqlar line { stroke: var(--border-strong); stroke-width: 1.6; stroke-dasharray: 5 5; }
.chiziqlar line.faol { stroke: var(--accent); stroke-dasharray: none; stroke-width: 2; }
.tugun { cursor: default; transition: opacity .35s ease; }
.tugun .karta { fill: var(--bg-elevated); stroke: var(--border-strong); stroke-width: 1.2; filter: drop-shadow(0 1px 2px rgba(16, 24, 40, .08)); transition: stroke .25s; }
.tugun.faol .karta { stroke: var(--accent); stroke-width: 2; }
.tugun.yiqildi { opacity: .55; }
.tugun.yiqildi .karta { stroke: var(--danger); stroke-dasharray: 4 3; }
.ikonka path { fill: none; stroke: var(--accent-text); stroke-width: 1.75; stroke-linecap: round; stroke-linejoin: round; }
.nom { font: 600 14px var(--font-sans); fill: var(--text); }
.tik .nom { font-size: 18px; } .tik .izoh { font-size: 14px; } .tik .p-yorliq, .tik .p-qator { font-size: 14px; } .tik .teg text { font-size: 13px; }
.izoh { font: 500 11.5px var(--font-mono); fill: var(--text-muted); }
.band-fon { fill: var(--bg-sunken); }
.band.ok { fill: var(--success); } .band.ogoh { fill: var(--warning); } .band.xato { fill: var(--danger); }
.x-belgi { stroke: var(--danger); stroke-width: 2.5; stroke-linecap: round; }
.teg rect { stroke-width: 1; }
.teg text { font: 600 11px var(--font-mono); }
.teg.ok rect { fill: var(--success-soft); stroke: var(--success); } .teg.ok text { fill: var(--success); }
.teg.ogoh rect { fill: var(--warning-soft); stroke: var(--warning); } .teg.ogoh text { fill: var(--warning); }
.teg.xato rect { fill: var(--danger-soft); stroke: var(--danger); } .teg.xato text { fill: var(--danger); }
.teg.info rect { fill: var(--info-soft); stroke: var(--info); } .teg.info text { fill: var(--info); }
.teg.insight rect { fill: var(--insight-soft); stroke: var(--insight); } .teg.insight text { fill: var(--insight); }
.manzil rect { fill: var(--bg-elevated); stroke: var(--accent); stroke-width: 1.5; }
.manzil text { font: 600 14px var(--font-mono); fill: var(--text); }
.m-ikonka { fill: none; stroke: var(--text-muted); stroke-width: 1.6; }
.kursor { fill: var(--accent); animation: miltillash 1s steps(1) infinite; }
@keyframes miltillash { 50% { opacity: 0; } }
.paket .p-fon { fill: var(--bg-elevated); stroke: currentColor; stroke-width: 1.3; filter: drop-shadow(0 4px 10px rgba(16, 24, 40, .16)); }
.paket .p-chet, .paket .p-nuqta { fill: currentColor; }
.p-yorliq { font: 700 11.5px var(--font-mono); fill: currentColor; letter-spacing: .04em; }
.p-qator { font: 500 11.5px var(--font-mono); fill: var(--text); }
.p-qulf { fill: none; stroke: currentColor; stroke-width: 1.8; }
.paket.sorov { color: var(--info); } .paket.javob { color: var(--success); } .paket.ulanish { color: var(--insight); }
.paket.ogoh { color: var(--warning); } .paket.xato { color: var(--danger); }
.oq circle, .oq rect { stroke: none; }
.oq.sorov circle { fill: var(--info); } .oq.javob circle { fill: var(--success); }
.oq.ogir rect { fill: var(--warning); }
.oq.tekshiruv circle { fill: none; stroke: var(--insight); stroke-width: 1.8; }
.oq.xato path { stroke: var(--danger); stroke-width: 2.4; stroke-linecap: round; }
.tugun-enter-from, .tugun-leave-to { opacity: 0; }
.tugun-enter-active, .tugun-leave-active { transition: opacity .4s ease; }
@media (prefers-reduced-motion: reduce) { .tugun, .tugun-enter-active, .tugun-leave-active { transition: none; } .kursor { animation: none; } }
</style>
