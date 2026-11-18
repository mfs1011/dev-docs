<script setup>
// Ketma-ketlik ko'rinishi: ishtirokchilarning hayot chiziqlari, har paket — strelka. Vaqt — klientdagi yozuvdan
// (paket qachon ketgani/kelgani shu nuqtada o'lchangan; serverga yetib borish vaqti yozuvda yo'q, shuning uchun
// strelka qiyaligi bir xil). docs/vizualizator/paket-yoli.md 1.3
import { computed, nextTick, ref, watch } from 'vue'

const props = defineProps({
  dars: Object,
  yozuv: Object,
  qatorlar: { type: Array, default: () => [] }, // [{ n, h, qadam, faol, p }]
  tanlangan: Number,
})
const emit = defineEmits(['tanla'])

const ish = computed(() => props.dars.ishtirokchilar)
const W = 760, X0 = 150, QH = 46
const ustunX = (id) => X0 + (ish.value.indexOf(id) + 0.5) * ((W - X0) / ish.value.length)
const paket = (n) => props.yozuv?.paketlar.find((p) => p.n === n)
const qatorlar = computed(() => props.qatorlar.map((q, i) => {
  const y = 74 + i * QH
  const x1 = ustunX(q.h.dan), x2 = ustunX(q.h.ga)
  const p = q.faol ? q.p : 1
  const prev = props.qatorlar[i - 1]
  return { ...q, y, x1, x2, xe: x1 + (x2 - x1) * p, ye: y + 14 * p, t: paket(q.h.n)?.t, chegara: !prev || prev.qadam !== q.qadam }
}))
const H = computed(() => Math.max(300, 100 + qatorlar.value.length * QH))
const quti = ref(null)
watch(() => qatorlar.value.length, async () => { await nextTick(); quti.value?.scrollTo({ top: quti.value.scrollHeight, behavior: 'smooth' }) })
</script>

<template>
  <div ref="quti" class="kk-quti">
    <svg :viewBox="`0 0 ${W} ${H}`" class="kk" role="img" aria-label="Ketma-ketlik diagrammasi">
      <g v-for="id in ish" :key="id">
        <text :x="ustunX(id)" y="24" text-anchor="middle" class="kk-nom">{{ dars.tugunlar[id].nom }}</text>
        <text :x="ustunX(id)" y="41" text-anchor="middle" class="kk-ip">{{ dars.tugunlar[id].izoh }}</text>
        <line :x1="ustunX(id)" y1="52" :x2="ustunX(id)" :y2="H - 10" class="hayot" />
      </g>
      <g v-for="q in qatorlar" :key="q.h.n">
        <template v-if="q.chegara">
          <line x1="8" :x2="W - 8" :y1="q.y - 18" :y2="q.y - 18" class="chegara" />
          <text x="10" :y="q.y - 6" class="kk-qadam">{{ q.qadam + 1 }} · {{ dars.qadamlar[q.qadam].qisqa }}</text>
        </template>
        <text x="10" :y="q.y + 18" class="kk-vaqt">{{ q.t != null ? q.t.toFixed(3) + ' s' : '' }}</text>
        <g :class="['kk-o', q.h.rang ?? 'sorov', { tanlangan: tanlangan === q.h.n }]" @click="emit('tanla', q.h.n)">
          <line :x1="q.x1" :y1="q.y" :x2="q.xe" :y2="q.ye" class="o-chiziq" />
          <line :x1="q.x1" :y1="q.y" :x2="q.x2" :y2="q.y + 14" class="o-bosish" />
          <path v-if="!q.faol || q.p > 0.97" :transform="`translate(${q.x2} ${q.y + 14}) rotate(${q.x2 > q.x1 ? 0 : 180})`" d="M0 0 -9 -5 -9 5z" class="o-uch" />
          <text :x="(q.x1 + q.x2) / 2" :y="q.y - 2" text-anchor="middle" class="o-yorliq">{{ q.h.yorliq }}</text>
        </g>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.kk-quti { height: 100%; overflow: auto; }
.kk { width: 100%; min-width: 560px; display: block; }
.kk-nom { font: 700 13px var(--font-sans); fill: var(--text); }
.kk-ip { font: 500 11px var(--font-mono); fill: var(--text-muted); }
.hayot { stroke: var(--border-strong); stroke-dasharray: 3 4; }
.chegara { stroke: var(--border); }
.kk-qadam { font: 700 10.5px var(--font-sans); fill: var(--text-subtle); letter-spacing: .06em; text-transform: uppercase; }
.kk-vaqt { font: 500 11px var(--font-mono); fill: var(--text-subtle); }
.kk-o { cursor: pointer; color: var(--info); }
.kk-o.javob { color: var(--success); } .kk-o.ulanish { color: var(--insight); } .kk-o.ogoh { color: var(--warning); } .kk-o.xato { color: var(--danger); }
.o-chiziq { stroke: currentColor; stroke-width: 1.8; }
.o-bosish { stroke: transparent; stroke-width: 14; }
.o-uch { fill: currentColor; }
.o-yorliq { font: 700 11px var(--font-mono); fill: currentColor; paint-order: stroke; stroke: var(--bg-elevated); stroke-width: 4px; }
.kk-o.tanlangan .o-chiziq { stroke-width: 3; }
</style>
