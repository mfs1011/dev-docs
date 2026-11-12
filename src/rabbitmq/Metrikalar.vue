<script setup>
// Metrikalar: sahifa ochilgandan beri brokerdan kelgan hodisalar soni va navbatlar chuqurligi (har holat yangilanishida).
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

const props = defineProps({
  holat: { type: Object, required: true },
  tingla: { type: Function, required: true },
})

const s = reactive({ yuborilgan: 0, ack: 0, requeue: 0, dead: 0, yoqolgan: 0 })
const vaqtlar = []      // oxirgi publish vaqtlari (throughput)
const tezlik = ref(0)
const chuqurlik = ref([])   // jami (tayyor + unacked) tarixi

const dlx = (q) => { const n = props.holat.navbatlar.find((x) => x.nom === q); return n?.args?.['x-dead-letter-exchange'] ?? n?.policy?.['dead-letter-exchange'] }
function hodisa(x) {
  if (x.t === 'oqim' && x.tur === 'publish') {
    s.yuborilgan++
    vaqtlar.push(Date.now())
    const ex = x.nom ?? ''
    const q = x.navbatlar ?? []
    if (!q.length) s.yoqolgan++
    else if (ex !== '' && q.some((n) => !props.holat.boglanishlar.some((b) => b.exchange === ex && b.navbat === n))) s.dead++
  } else if (x.t === 'ishlov') {
    if (x.xulq === 'ack' || x.xulq === 'auto') s.ack++
    else if (x.xulq === 'nack' || x.xulq === 'crash') s.requeue++
    else if (x.xulq === 'reject' && dlx(x.navbat) != null) s.dead++
  }
}
let bekor, taymer
onMounted(() => {
  bekor = props.tingla(hodisa)
  taymer = setInterval(() => {
    const chegara = Date.now() - 10000
    while (vaqtlar.length && vaqtlar[0] < chegara) vaqtlar.shift()
    tezlik.value = vaqtlar.length / 10
  }, 1000)
})
onBeforeUnmount(() => { bekor?.(); clearInterval(taymer) })
watch(() => props.holat.navbatlar, (n) => {
  chuqurlik.value = [...chuqurlik.value, n.reduce((a, x) => a + (x.tayyor ?? 0) + (x.unacked ?? 0), 0)].slice(-90)
})

const W = 600, H = 70
const chiziq = computed(() => {
  const d = chuqurlik.value
  if (d.length < 2) return ''
  const mx = Math.max(1, ...d)
  return d.map((v, i) => `${((i / (d.length - 1)) * W).toFixed(1)},${(H - 4 - (v / mx) * (H - 12)).toFixed(1)}`).join(' ')
})
const oxirgi = computed(() => chuqurlik.value.at(-1) ?? 0)
const KARTALAR = [
  ['yuborilgan', 'Yuborilgan', ''], ['ack', 'Yetkazilgan (ack)', 'ok'], ['requeue', 'Requeue', 'qayt'],
  ['dead', 'Dead letter / AE', 'xato'], ['yoqolgan', 'Yo‘qolgan (unroutable)', 'xato'],
]
</script>

<template>
    <div class="metrikalar">
        <h4>Metrikalar <small>— sahifa ochilgandan beri</small></h4>
        <div class="kartalar">
            <div v-for="[k, nom, r] in KARTALAR" :key="k" class="m" :class="r">
                <b>{{ s[k] }}</b><small>{{ nom }}</small>
            </div>
            <div class="m"><b>{{ tezlik.toFixed(1) }}<i> msg/s</i></b><small>Throughput (10 s)</small></div>
        </div>
        <div class="chuqur">
            <small>Navbatlar chuqurligi — jami kutayotgan xabar</small>
            <b>{{ oxirgi }}</b>
        </div>
        <svg :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" class="grafik" aria-hidden="true">
            <polyline v-if="chiziq" :points="chiziq" />
        </svg>
    </div>
</template>

<style scoped>
h4 { margin: 0 0 10px; font: 600 11px var(--font-mono); letter-spacing: .12em; text-transform: uppercase; color: var(--text-subtle); }
h4 small { letter-spacing: 0; text-transform: none; font-weight: 400; }
.kartalar { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 8px; }
.m { display: grid; gap: 2px; padding: 10px 12px; border-radius: 10px; background: var(--bg-sunken); border: 1px solid var(--border); }
.m b { font: 700 20px var(--font-mono); }
.m i { font: 11px var(--font-mono); font-style: normal; color: var(--text-subtle); }
.m small { font: 600 9.5px var(--font-mono); letter-spacing: .06em; text-transform: uppercase; color: var(--text-subtle); }
.m.ok b { color: var(--success); } .m.qayt b { color: #d97706; } .m.xato b { color: var(--danger, #dc2626); }
.chuqur { display: flex; justify-content: space-between; align-items: baseline; margin-top: 12px; }
.chuqur small { font: 600 10px var(--font-mono); letter-spacing: .08em; text-transform: uppercase; color: var(--text-subtle); }
.chuqur b { font: 700 15px var(--font-mono); color: var(--accent-text); }
.grafik { width: 100%; height: 70px; margin-top: 4px; border-bottom: 1px solid var(--border); }
.grafik polyline { fill: none; stroke: var(--accent); stroke-width: 2; vector-effect: non-scaling-stroke; }
</style>
