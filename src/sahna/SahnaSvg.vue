<script setup>
// Sahna (izometrik): tugunlar — o'zimiz chizgan 3D bloklar (server, baza silindri, noutbuk, router, odamlar),
// pol to'ri, chiziqlar, yuradigan paket va davomli oqim nuqtalari. Ranglar faqat main.css tokenlaridan —
// kitob rangiga va qorong'i temaga moslashadi. Geometriya: izo.js. docs/vizualizator/README.md 3.3, 4.1
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { IKONKALAR } from './ikonkalar.js'
import { P, TOR, blok } from './izo.js'

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

// Tor (tik) konteynerda sxema buriladi: chapdan o'ngga oqim yuqoridan pastga bo'ladi, yozuvlar kattaroq
const ildiz = ref(null)
const tik = ref(false)
let ro = null
onMounted(() => {
  ro = new ResizeObserver(([e]) => { const { width, height } = e.contentRect; tik.value = width < 560 && height > width * 0.9 })
  ro.observe(ildiz.value)
})
onBeforeUnmount(() => ro?.disconnect())

/** Tugunlar: u, v — pol (dars koordinatalari), x, y — ekrandagi asos markazi, b — blok geometriyasi */
const tugunlar = computed(() => {
  let t = props.dars.tugunlar
  if (tik.value) {
    // tik ekran: oqim (x) ekranda to'g'ri pastga (pol yo'nalishi u−, v+), yoyilish (y) — gorizontal (u+, v+)
    const ys = Object.values(t).map((n) => n.y)
    const m = (Math.min(...ys) + Math.max(...ys)) / 2
    t = Object.fromEntries(Object.entries(t).map(([k, n]) => [k, { ...n, x: -n.x * 1.15 + (n.y - m) * 0.62, y: n.x * 1.15 + (n.y - m) * 0.62 }]))
  }
  return Object.fromEntries(Object.entries(t).map(([k, n]) => {
    const g = { ...n, u: n.x, v: n.y }
    const [x, y] = P(g.u, g.v)
    return [k, { ...g, x, y, b: blok(g) }]
  }))
})
const kor = computed(() => new Set(props.korinadi))
const T = (id) => tugunlar.value[id]
// chuqurlik bo'yicha tartib: orqadagilar avval chiziladi
const tartib = computed(() => [...props.korinadi].filter(T).sort((a, b) => T(a).y - T(b).y))

const yorliqEni = (n) => Math.max(n.nom.length * 8.2, (n.izoh ?? '').length * 7) + 26

// ── kamera ──
function maqsadVb(ids) {
  const nodes = ids.map(T).filter(Boolean)
  if (!nodes.length) return [0, -300, 1000, 620]
  let x0 = Math.min(...nodes.map((n) => n.x - Math.max(n.b.w * 1.4, yorliqEni(n) / 2))) - 40
  let x1 = Math.max(...nodes.map((n) => n.x + Math.max(n.b.w * 1.4, yorliqEni(n) / 2))) + 40
  let y0 = Math.min(...nodes.map((n) => n.b.tepa[1])) - 100
  let y1 = Math.max(...nodes.map((n) => n.b.past[1])) + (tik.value ? 150 : 110)
  // manzil satri (klient ustida, 260 px)
  const yt = T(props.dars.yozishTuguni ?? 'klient')
  if ((props.yozildi || props.faol?.h.tur === 'yozish') && yt && ids.includes(props.dars.yozishTuguni ?? 'klient')) {
    x0 = Math.min(x0, yt.b.tepa[0] - 150); x1 = Math.max(x1, yt.b.tepa[0] + 150); y0 = Math.min(y0, yt.b.tepa[1] - 90)
  }
  const minW = tik.value ? 380 : 560, minH = tik.value ? 480 : 360
  if (x1 - x0 < minW) { const c = (x0 + x1) / 2; x0 = c - minW / 2; x1 = c + minW / 2 }
  if (y1 - y0 < minH) { const c = (y0 + y1) / 2; y0 = c - minH / 2; y1 = c + minH / 2 }
  return [x0, y0, x1 - x0, y1 - y0]
}
const kameraIds = () => props.korinadi
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
const tor = TOR(46)

const chiziqlar = computed(() => (props.chiziqlar ?? props.dars.chiziqlar)
  .filter(([a, b]) => kor.value.has(a) && kor.value.has(b))
  .map(([a, b]) => ({ id: `${a}-${b}`, a: T(a), b: T(b) })))

// ── paket: pol bo'ylab yo'l (masalan, klient → router → dns), kapsula uning ustida ──
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
const faolChiziq = (c) => paket.value && paket.value.ids.some((id, i) => i && ((T(paket.value.ids[i - 1]) === c.a && T(id) === c.b) || (T(paket.value.ids[i - 1]) === c.b && T(id) === c.a)))
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
// nuqta polda emas, biroz ko'tarilgan (chiziq ustida "uchadi")
const nuqtaPos = (d) => ({ x: T(d.a).x + (T(d.b).x - T(d.a).x) * d.t, y: T(d.a).y + (T(d.b).y - T(d.a).y) * d.t - 10 })

const tegRang = { ok: 'ok', ogoh: 'ogoh', xato: 'xato', info: 'info', insight: 'insight' }
const bandRang = (b) => (b >= 0.9 ? 'xato' : b >= 0.7 ? 'ogoh' : 'ok')
const ariaMatn = computed(() => props.korinadi.map((id) => T(id)?.nom).filter(Boolean).join(', '))
</script>

<template>
  <svg ref="ildiz" class="sahna-svg" :class="{ tik }" :viewBox="vb.join(' ')" preserveAspectRatio="xMidYMid meet" role="img" :aria-label="`Sxema: ${ariaMatn}`">
    <defs>
      <pattern id="sahna-tor" :width="tor.w" :height="tor.h" patternUnits="userSpaceOnUse">
        <path :d="tor.d" class="tor-chiziq" />
      </pattern>
    </defs>
    <rect :x="vb[0] - 2000" :y="vb[1] - 2000" :width="vb[2] + 4000" :height="vb[3] + 4000" fill="url(#sahna-tor)" />

    <g class="chiziqlar">
      <line v-for="c in chiziqlar" :key="c.id" :x1="c.a.x" :y1="c.a.y" :x2="c.b.x" :y2="c.b.y" :class="{ faol: faolChiziq(c) }" />
    </g>

    <g class="nuqtalar">
      <g v-for="d in nuqtalar" :key="d.id" :transform="`translate(${nuqtaPos(d).x} ${nuqtaPos(d).y})`" :class="['oq', d.tur]">
        <ellipse class="soya" cx="0" cy="10" rx="5" ry="2.5" />
        <rect v-if="d.tur === 'ogir'" x="-6" y="-6" width="12" height="12" rx="2.5" />
        <path v-else-if="d.tur === 'xato'" d="M-5 -5 5 5 M5 -5 -5 5" />
        <circle v-else :r="d.tur === 'tekshiruv' ? 5 : 5" />
      </g>
    </g>

    <TransitionGroup name="tugun" tag="g">
      <g v-for="id in tartib" :key="id" class="tugun" :class="[`ton-${T(id).b.ton}`, { faol: faolTugunlar.has(id), yiqildi: teglar[id]?.yiqildi }]"
         @click="emit('tugun', id)">
        <g class="blok">
          <ellipse class="soya" :cx="T(id).x + 4" :cy="T(id).y + 3" :rx="T(id).b.w * 1.45" :ry="T(id).b.w * 0.75" />
          <!-- silindr (baza) -->
          <template v-if="T(id).b.silindr">
            <path :d="T(id).b.silindr.tana" class="yuz" />
            <path :d="T(id).b.silindr.tana" class="soyalash o" />
            <path v-for="z in T(id).b.halqa" :key="z" class="halqa"
                  :d="`M${T(id).b.silindr.cx - T(id).b.silindr.rx} ${T(id).b.silindr.cy - z} A${T(id).b.silindr.rx} ${T(id).b.silindr.ry} 0 0 0 ${T(id).b.silindr.cx + T(id).b.silindr.rx} ${T(id).b.silindr.cy - z}`" />
            <ellipse :cx="T(id).b.silindr.cx" :cy="T(id).b.silindr.cy - T(id).b.silindr.h" :rx="T(id).b.silindr.rx" :ry="T(id).b.silindr.ry" class="yuz ust" />
          </template>
          <!-- quti -->
          <template v-else>
            <path :d="T(id).b.chap" class="yuz" /><path :d="T(id).b.chap" class="soyalash c" />
            <path :d="T(id).b.ong" class="yuz" /><path :d="T(id).b.ong" class="soyalash o" />
            <path :d="T(id).b.ust" class="yuz ust" />
            <path v-for="(c, i) in T(id).b.chiziq ?? []" :key="'c' + i" :d="c" class="tirqish" />
            <circle v-for="(c, i) in T(id).b.chiroq ?? []" :key="'l' + i" :cx="c[0]" :cy="c[1]" r="2.4" class="chiroq" />
            <template v-if="T(id).b.ekran">
              <path :d="T(id).b.klaviatura" class="klaviatura" />
              <path :d="T(id).b.ekran" class="yuz ekran" />
              <path :d="T(id).b.ekranIchi" class="ekran-ichi" />
            </template>
            <template v-if="T(id).b.antenna">
              <line :x1="T(id).b.antenna.dan[0]" :y1="T(id).b.antenna.dan[1]" :x2="T(id).b.antenna.ga[0]" :y2="T(id).b.antenna.ga[1]" class="antenna" />
              <circle :cx="T(id).b.antenna.ga[0]" :cy="T(id).b.antenna.ga[1]" r="3.5" class="chiroq" />
            </template>
            <g v-for="(o, i) in T(id).b.odamlar ?? []" :key="'o' + i" :class="['odam', `ton-${o.ton}`]">
              <rect :x="o.x - 5" :y="o.y - 20" width="10" height="18" rx="5" class="odam-tana" />
              <circle :cx="o.x" :cy="o.y - 25" r="5" class="odam-bosh" />
            </g>
          </template>
          <path v-if="T(id).b.ikonkaMatritsa" :transform="T(id).b.ikonkaMatritsa" :d="IKONKALAR[T(id).ikonka] ?? IKONKALAR.server" class="ust-ikonka" />
          <path v-if="teglar[id]?.yiqildi" :d="`M${T(id).b.tepa[0] - 10} ${T(id).b.tepa[1] - 22} l20 20 M${T(id).b.tepa[0] + 10} ${T(id).b.tepa[1] - 22} l-20 20`" class="x-belgi" />
        </g>

        <!-- nom yorlig'i blok ostida -->
        <g :transform="`translate(${T(id).b.past[0]} ${T(id).b.past[1] + 14})`" class="yorliq">
          <rect class="yorliq-fon" :x="-yorliqEni(T(id)) / 2" y="0" :width="yorliqEni(T(id))" :height="teglar[id]?.band != null ? 46 : 40" rx="9" />
          <text y="17" text-anchor="middle" class="nom">{{ T(id).nom }}</text>
          <text y="32" text-anchor="middle" class="izoh">{{ T(id).izoh }}</text>
          <g v-if="teglar[id]?.band != null" :transform="`translate(${-yorliqEni(T(id)) / 2 + 12} 38)`">
            <rect :width="yorliqEni(T(id)) - 24" height="3.5" rx="1.75" class="band-fon" />
            <rect :width="(yorliqEni(T(id)) - 24) * Math.min(1, teglar[id].band)" height="3.5" rx="1.75" :class="['band', bandRang(teglar[id].band)]" />
          </g>
        </g>

        <g v-if="teglar[id]?.matn" :transform="`translate(${T(id).b.tepa[0]} ${T(id).b.tepa[1] - 20})`" :class="['teg', tegRang[teglar[id].rang] ?? 'info']">
          <rect :x="-(teglar[id].matn.length * 3.7 + 12)" y="-11" :width="teglar[id].matn.length * 7.4 + 24" height="22" rx="11" />
          <text text-anchor="middle" y="4">{{ teglar[id].matn }}</text>
        </g>
      </g>
    </TransitionGroup>

    <g v-if="yozish" :transform="`translate(${yozish.tugun.b.tepa[0] - 130} ${yozish.tugun.b.tepa[1] - 70})`" class="manzil">
      <rect width="260" height="34" rx="17" />
      <path transform="translate(10 5)" :d="IKONKALAR.dns" class="m-ikonka" />
      <text x="42" y="22">{{ yozish.matn }}<tspan v-if="yozish.kursor" class="kursor">▍</tspan></text>
    </g>

    <g v-if="paket" :transform="`translate(${paket.x} ${paket.y})`" :class="['paket', paket.h.rang ?? 'sorov']">
      <ellipse class="soya" cx="0" cy="0" rx="9" ry="4.5" />
      <line x1="0" y1="0" x2="0" y2="-26" class="p-ip" />
      <circle cy="-26" r="6" class="p-nuqta" />
      <g transform="translate(-92 -92)">
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
.tor-chiziq { fill: none; stroke: var(--grid-dot); stroke-width: 1; }
.chiziqlar line { stroke: var(--border-strong); stroke-width: 2; stroke-dasharray: 6 6; stroke-linecap: round; }
.chiziqlar line.faol { stroke: var(--accent); stroke-dasharray: none; stroke-width: 2.6; }

/* ton: blok rangi (yuz — yumshoq, chegara — to'q) */
.ton-info { --t: var(--info); --ts: var(--info-soft); }
.ton-success { --t: var(--success); --ts: var(--success-soft); }
.ton-insight { --t: var(--insight); --ts: var(--insight-soft); }
.ton-warning { --t: var(--warning); --ts: var(--warning-soft); }
.ton-neytral { --t: var(--text-muted); --ts: var(--bg-elevated); }
.tugun { cursor: default; transition: opacity .35s ease; }
.soya { fill: #000; opacity: .06; }
.yuz { fill: var(--ts); stroke: var(--t); stroke-width: 1.5; stroke-linejoin: round; }
.yuz.ust { stroke-width: 1.6; }
.soyalash { fill: #000; stroke: none; pointer-events: none; }
.soyalash.c { opacity: .05; } .soyalash.o { opacity: .14; }
.tirqish { stroke: var(--t); stroke-width: 1.4; opacity: .55; }
.chiroq { fill: var(--t); }
.halqa { fill: none; stroke: var(--t); stroke-width: 1.2; opacity: .5; }
.antenna { stroke: var(--t); stroke-width: 2; stroke-linecap: round; }
.klaviatura { fill: none; stroke: var(--t); stroke-width: 1; opacity: .45; stroke-dasharray: 2 3; }
.ekran { fill: var(--bg-elevated); }
.ekran-ichi { fill: var(--accent-soft); stroke: var(--accent); stroke-width: 1; opacity: .9; }
.ust-ikonka { fill: none; stroke: var(--t); stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }
.odam-tana { fill: var(--ts); stroke: var(--t); stroke-width: 1.3; }
.odam-bosh { fill: var(--bg-elevated); stroke: var(--t); stroke-width: 1.3; }
.tugun.faol .yuz { stroke: var(--accent); stroke-width: 2.2; }
.tugun.faol .yorliq-fon { stroke: var(--accent); }
.tugun.yiqildi .blok { opacity: .45; filter: grayscale(1); }
.tugun.yiqildi .yorliq-fon { stroke: var(--danger); stroke-dasharray: 4 3; }
.x-belgi { stroke: var(--danger); stroke-width: 3.5; stroke-linecap: round; }

.yorliq-fon { fill: var(--bg-elevated); stroke: var(--border-strong); stroke-width: 1.2; filter: drop-shadow(0 1px 2px rgba(16, 24, 40, .1)); }
.nom { font: 700 13.5px var(--font-sans); fill: var(--text); }
.izoh { font: 500 11px var(--font-mono); fill: var(--text-muted); }
.tik .nom { font-size: 17px; } .tik .izoh { font-size: 13.5px; } .tik .p-yorliq, .tik .p-qator { font-size: 14px; } .tik .teg text { font-size: 13px; }
.band-fon { fill: var(--bg-sunken); }
.band.ok { fill: var(--success); } .band.ogoh { fill: var(--warning); } .band.xato { fill: var(--danger); }

.teg rect { stroke-width: 1.2; }
.teg text { font: 700 11px var(--font-mono); }
.teg.ok rect { fill: var(--success-soft); stroke: var(--success); } .teg.ok text { fill: var(--success); }
.teg.ogoh rect { fill: var(--warning-soft); stroke: var(--warning); } .teg.ogoh text { fill: var(--warning); }
.teg.xato rect { fill: var(--danger-soft); stroke: var(--danger); } .teg.xato text { fill: var(--danger); }
.teg.info rect { fill: var(--info-soft); stroke: var(--info); } .teg.info text { fill: var(--info); }
.teg.insight rect { fill: var(--insight-soft); stroke: var(--insight); } .teg.insight text { fill: var(--insight); }

.manzil rect { fill: var(--bg-elevated); stroke: var(--accent); stroke-width: 1.6; filter: drop-shadow(0 2px 6px rgba(16, 24, 40, .12)); }
.manzil text { font: 600 14px var(--font-mono); fill: var(--text); }
.m-ikonka { fill: none; stroke: var(--text-muted); stroke-width: 1.6; }
.kursor { fill: var(--accent); animation: miltillash 1s steps(1) infinite; }
@keyframes miltillash { 50% { opacity: 0; } }

.paket .p-fon { fill: var(--bg-elevated); stroke: currentColor; stroke-width: 1.4; filter: drop-shadow(0 6px 12px rgba(16, 24, 40, .18)); }
.paket .p-chet, .paket .p-nuqta { fill: currentColor; }
.paket .p-ip { stroke: currentColor; stroke-width: 1.5; stroke-dasharray: 2 3; }
.p-yorliq { font: 700 11.5px var(--font-mono); fill: currentColor; letter-spacing: .04em; }
.p-qator { font: 500 11.5px var(--font-mono); fill: var(--text); }
.p-qulf { fill: none; stroke: currentColor; stroke-width: 1.8; }
.paket.sorov { color: var(--info); } .paket.javob { color: var(--success); } .paket.ulanish { color: var(--insight); }
.paket.ogoh { color: var(--warning); } .paket.xato { color: var(--danger); }

.oq circle, .oq rect { stroke: var(--bg-elevated); stroke-width: 1.2; }
.oq.sorov circle { fill: var(--info); } .oq.javob circle { fill: var(--success); }
.oq.ogir rect { fill: var(--warning); }
.oq.tekshiruv circle { fill: none; stroke: var(--insight); stroke-width: 1.8; }
.oq.xato path { stroke: var(--danger); stroke-width: 2.6; stroke-linecap: round; }
.tugun-enter-from, .tugun-leave-to { opacity: 0; }
.tugun-enter-active, .tugun-leave-active { transition: opacity .4s ease; }
@media (prefers-reduced-motion: reduce) { .tugun, .tugun-enter-active, .tugun-leave-active { transition: none; } .kursor { animation: none; } }
</style>
