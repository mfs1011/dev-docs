<script setup>
// RabbitMQ topologiyasi: yuboruvchi → exchange'lar → (bog'lanishlar) → navbatlar → consumer'lar.
// Ma'lumot — VM'dagi haqiqiy brokerdan (HTTP API, har soniyada). Harakatlanuvchi nuqtalar — haqiqiy hodisalar:
// firehose "publish" (exchange'ga kelgan xabar, routed_queues — qaysi navbatlarga tushgani) va consumer "ishlov".
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  holat: { type: Object, required: true },
  tingla: { type: Function, required: true },
})
const emit = defineEmits(['tanla'])

const QATOR = 64
const X = { yub: 30, ex: 170, nv: 430, con: 690 }
const KENGLIK = 820

const exchangelar = computed(() =>
  props.holat.exchangelar.filter((e) => e.nom === '' || !e.nom.startsWith('amq.') || props.holat.boglanishlar.some((b) => b.exchange === e.nom)))
const navbatlar = computed(() => props.holat.navbatlar)
const consumerlar = computed(() => props.holat.consumerlar)

const y = (i) => 60 + i * QATOR
const exY = computed(() => Object.fromEntries(exchangelar.value.map((e, i) => [e.nom, y(i)])))
const nvY = computed(() => Object.fromEntries(navbatlar.value.map((n, i) => [n.nom, y(i)])))
const conY = computed(() => Object.fromEntries(consumerlar.value.map((c, i) => [c.id, y(i)])))
const balandlik = computed(() => Math.max(220, 80 + Math.max(exchangelar.value.length, navbatlar.value.length, consumerlar.value.length) * QATOR))

const exNomi = (n) => (n === '' ? '(default)' : n)
const dlx = (n) => n.args?.['x-dead-letter-exchange'] ?? n.policy?.['dead-letter-exchange']

// default exchange har navbatga uning nomi bilan yashirin bog'langan (HTTP API bu bog'lanishlarni source="" bilan beradi)
const yashirin = computed(() => (exY.value[''] == null ? [] : navbatlar.value.map((n) => ({ navbat: n.nom, y1: exY.value[''], y2: nvY.value[n.nom] }))))
const chiziqlar = computed(() => props.holat.boglanishlar
  .filter((b) => exY.value[b.exchange] != null && nvY.value[b.navbat] != null)
  .map((b) => ({ ...b, y1: exY.value[b.exchange], y2: nvY.value[b.navbat] })))

// --- animatsiya: har nuqta bir segment bo'ylab 700 ms yuradi
const nuqtalar = ref([])
let raqam = 0
function nuqta(x1, y1, x2, y2, rang, kechikish = 0) {
  const id = ++raqam
  setTimeout(() => {
    nuqtalar.value.push({ id, x1, y1, x2, y2, rang })
    setTimeout(() => { nuqtalar.value = nuqtalar.value.filter((n) => n.id !== id) }, 750)
  }, kechikish)
}
function hodisa(x) {
  if (x.t === 'oqim' && x.tur === 'publish') {
    const ey = exY.value[x.nom ?? '']
    if (ey == null) return
    nuqta(X.yub + 90, 40, X.ex, ey, 'var(--accent)')
    for (const q of x.navbatlar ?? []) {
      if (nvY.value[q] != null) nuqta(X.ex + 150, ey, X.nv, nvY.value[q], 'var(--accent)', 700)
    }
  } else if (x.t === 'ishlov') {
    const ny = nvY.value[x.navbat], cy = conY.value[x.consumer]
    if (ny == null || cy == null) return
    const rang = x.xulq === 'nack' || x.xulq === 'reject' ? 'var(--danger, #d1495b)' : x.xulq === 'crash' ? '#e3a008' : 'var(--success)'
    nuqta(X.nv + 170, ny, X.con, cy, rang)
  }
}
let bekor
onMounted(() => { bekor = props.tingla(hodisa) })
onBeforeUnmount(() => bekor?.())

const tolganlik = (n) => Math.min(1, (n.tayyor + n.unacked) / 50)
</script>

<template>
    <svg class="sxema" :viewBox="`0 0 ${KENGLIK} ${balandlik}`" role="img" aria-label="RabbitMQ topologiyasi">
        <text :x="X.yub" y="18" class="sarlavha">yuboruvchi</text>
        <text :x="X.ex" y="18" class="sarlavha">exchange</text>
        <text :x="X.nv" y="18" class="sarlavha">navbat</text>
        <text :x="X.con" y="18" class="sarlavha">consumer</text>

        <g class="yub"><rect :x="X.yub" y="26" width="90" height="28" rx="6" /><text :x="X.yub + 45" y="44">publish</text></g>

        <g v-for="b in chiziqlar" :key="b.exchange + '>' + b.navbat + b.props" class="bog">
            <path :d="`M${X.ex + 150},${b.y1} C${X.ex + 230},${b.y1} ${X.nv - 80},${b.y2} ${X.nv},${b.y2}`" />
            <text :x="(X.ex + 150 + X.nv) / 2" :y="(b.y1 + b.y2) / 2 - 4">{{ b.kalit || '∅' }}</text>
        </g>
        <g v-for="b in yashirin" :key="'d>' + b.navbat" class="bog yashirin">
            <path :d="`M${X.ex + 150},${b.y1} C${X.ex + 230},${b.y1} ${X.nv - 80},${b.y2} ${X.nv},${b.y2}`" />
        </g>
        <g v-for="c in consumerlar" :key="'l' + c.id" class="bog con-chiziq">
            <path v-if="nvY[c.navbat] != null" :d="`M${X.nv + 170},${nvY[c.navbat]} L${X.con},${conY[c.id]}`" />
        </g>

        <g v-for="e in exchangelar" :key="'e' + e.nom" class="ex" @click="emit('tanla', { tur: 'exchange', nom: e.nom })">
            <rect :x="X.ex" :y="exY[e.nom] - 18" width="150" height="36" rx="8" />
            <text :x="X.ex + 10" :y="exY[e.nom] - 2" class="nom">{{ exNomi(e.nom) }}</text>
            <text :x="X.ex + 10" :y="exY[e.nom] + 12" class="tur">{{ e.tur }}</text>
        </g>

        <g v-for="n in navbatlar" :key="'q' + n.nom" class="nv" @click="emit('tanla', { tur: 'navbat', nom: n.nom })">
            <rect :x="X.nv" :y="nvY[n.nom] - 22" width="170" height="44" rx="6" />
            <rect :x="X.nv" :y="nvY[n.nom] + 16" :width="170 * tolganlik(n)" height="6" class="bar" />
            <text :x="X.nv + 10" :y="nvY[n.nom] - 6" class="nom">{{ n.nom }}</text>
            <text :x="X.nv + 10" :y="nvY[n.nom] + 10" class="tur">
                {{ n.tur }} · tayyor {{ n.tayyor }} · unacked {{ n.unacked }}
            </text>
            <text v-if="dlx(n) != null" :x="X.nv + 166" :y="nvY[n.nom] - 6" class="belgi" text-anchor="end">DLX→{{ dlx(n) || '(default)' }}</text>
        </g>

        <g v-for="c in consumerlar" :key="'c' + c.id" class="con" @click="emit('tanla', { tur: 'consumer', nom: c.id })">
            <rect :x="X.con" :y="conY[c.id] - 18" width="120" height="36" rx="18" />
            <text :x="X.con + 12" :y="conY[c.id] - 2" class="nom">{{ c.id }} · {{ c.xulq }}</text>
            <text :x="X.con + 12" :y="conY[c.id] + 12" class="tur">prefetch {{ c.prefetch || '∞' }} · {{ c.ishlandi }} ta</text>
        </g>

        <circle v-for="p in nuqtalar" :key="p.id" r="6" :fill="p.rang" class="xabar">
            <animate attributeName="cx" :from="p.x1" :to="p.x2" dur="0.7s" fill="freeze" />
            <animate attributeName="cy" :from="p.y1" :to="p.y2" dur="0.7s" fill="freeze" />
        </circle>
    </svg>
</template>

<style scoped>
.sxema { width: 100%; height: auto; font-family: var(--font-sans); }
.sarlavha { font-size: 11px; fill: var(--text-subtle); text-transform: uppercase; letter-spacing: .06em; }
.yub rect { fill: var(--bg-sunken); stroke: var(--border-strong); }
.yub text { font-size: 12px; text-anchor: middle; fill: var(--text); }
.bog path { fill: none; stroke: var(--border-strong); stroke-width: 1.5; }
.bog text { font: 11px var(--font-mono); fill: var(--text-muted); text-anchor: middle; }
.con-chiziq path { stroke-dasharray: 4 4; }
.yashirin path { stroke-dasharray: 2 5; opacity: .45; }
.ex, .nv, .con { cursor: pointer; }
.ex rect { fill: color-mix(in srgb, var(--accent) 12%, var(--bg-elevated)); stroke: var(--accent); }
.nv rect:first-child { fill: var(--bg-elevated); stroke: var(--border-strong); }
.nv .bar { fill: color-mix(in srgb, var(--accent) 55%, transparent); }
.con rect { fill: color-mix(in srgb, var(--success) 12%, var(--bg-elevated)); stroke: var(--success); }
.nom { font-size: 12.5px; font-weight: 600; fill: var(--text); }
.tur { font-size: 10.5px; fill: var(--text-muted); }
.belgi { font-size: 10px; fill: var(--danger, #d1495b); }
.xabar { filter: drop-shadow(0 0 3px rgba(0, 0, 0, .25)); }
</style>
