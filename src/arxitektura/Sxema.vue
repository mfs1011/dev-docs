<script setup>
// Tizim sxemasi: foydalanuvchilar → (CDN) → load balancer → serverlar → kesh / baza / replikalar.
// Chiziqlar bo'ylab nuqtalar — so'rovlar oqimi (qanchalik ko'p bo'lsa, shuncha zich). Har qutida bandlik
// chizig'i: yashil — erkin, sariq — band, qizil — tiqilib qolgan. Serverni bosing — u yiqiladi yoki tiklanadi.
import { computed } from 'vue'

const props = defineProps({ m: Object, c: Object, tanlangan: String })
const emit = defineEmits(['server', 'tanla'])

const W = 820
const BW = 146, BH = 54
const foiz = (b) => (b === Infinity ? '∞' : `${Math.round(b * 100)}%`)
const rang = (b) => (b >= 1 ? 'qizil' : b >= 0.85 ? 'sariq' : 'yashil')

const tugunlar = computed(() => {
  const c = props.c, m = props.m
  const n = c.serverlar.length
  const svH = Math.max(1, n) * (BH + 10) - 10
  const H = Math.max(360, svH + 60, 120 + (c.replikalar + 1) * (BH + 14) + 40)
  const markaz = H / 2
  const out = [{ id: 'foyd', x: 20, y: markaz - BH / 2, nom: '👥 Foydalanuvchilar', izoh: `${c.oqim.toLocaleString('uz')} so‘rov/s`, tur: 'foyd' }]
  if (c.cdn) out.push({ id: 'cdn', x: 190, y: 24, nom: '🌍 CDN', izoh: `${Math.round(m.cdn.oqim)} /s statik`, tur: 'cdn', band: 0 })
  if (c.lb) out.push({ id: 'lb', x: 190, y: markaz - BH / 2, nom: '🔀 Load balancer', izoh: 'teng taqsimlaydi', tur: 'lb', band: 0 })
  const sy = markaz - svH / 2
  c.serverlar.forEach((tirik, i) => {
    const s = m.serverlar[i] ?? { band: 0, oqim: 0 }
    out.push({ id: `s${i}`, i, x: 380, y: sy + i * (BH + 10), nom: `🖥️ Server ${i + 1}`, izoh: tirik ? `${Math.round(s.oqim)} /s` : 'yiqilgan', tur: 'server', band: tirik ? s.band : 0, yiqilgan: !tirik })
  })
  if (c.kesh) out.push({ id: 'kesh', x: 610, y: 24, nom: '⚡ Kesh', izoh: `${Math.round(m.kesh.hit)} /s topildi`, tur: 'kesh', band: m.kesh.band })
  out.push({ id: 'db', x: 610, y: markaz - BH / 2, nom: '🗄️ Baza (asosiy)', izoh: `${Math.round(m.db.oqim)} /s`, tur: 'db', band: m.db.band })
  for (let r = 0; r < c.replikalar; r++) {
    out.push({ id: `r${r}`, x: 610, y: markaz + BH / 2 + 14 + r * (BH + 14), nom: `📚 Replika ${r + 1}`, izoh: `${Math.round(m.replikalar[r]?.oqim ?? 0)} /s o‘qish`, tur: 'replika', band: m.replikalar[r]?.band ?? 0 })
  }
  return { list: out, H }
})
const top = (id) => tugunlar.value.list.find((t) => t.id === id)

// chiziqlar: [dan, ga, oqim]
const chiziqlar = computed(() => {
  const c = props.c, m = props.m
  const out = []
  if (c.cdn) out.push(['foyd', 'cdn', m.cdn.oqim])
  c.serverlar.forEach((_, i) => {
    const o = m.serverlar[i]?.oqim ?? 0
    if (c.lb) out.push(['lb', `s${i}`, o])
    else if (i === 0) out.push(['foyd', 's0', o])
  })
  if (c.lb) out.push(['foyd', 'lb', m.lb.oqim])
  const tirik = c.serverlar.map((x, i) => (x ? i : -1)).filter((i) => i >= 0)
  for (const i of tirik) {
    const ulush = (m.serverlar[i]?.oqim ?? 0) / Math.max(1, m.serverlar.reduce((a, s) => a + (s.yiqilgan ? 0 : s.oqim), 0))
    if (c.kesh) out.push([`s${i}`, 'kesh', m.kesh.oqim * ulush])
    out.push([`s${i}`, 'db', m.db.oqim * ulush])
    for (let r = 0; r < c.replikalar; r++) out.push([`s${i}`, `r${r}`, (m.replikalar[r]?.oqim ?? 0) * ulush])
  }
  return out.map(([a, b, oqim]) => {
    const p = top(a), q = top(b)
    if (!p || !q) return null
    const x1 = p.x + BW, y1 = p.y + BH / 2, x2 = q.x, y2 = q.y + BH / 2
    const mx = (x1 + x2) / 2
    return { id: `${a}-${b}`, d: `M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`, oqim }
  }).filter(Boolean)
})
// nuqtalar soni oqimga mutanosib (eng ko'pi 8)
const nuqta = (o) => (o <= 0.5 ? 0 : Math.max(1, Math.min(8, Math.round((o / Math.max(1, props.c.oqim)) * 16))))
</script>

<template>
  <div class="sxema">
    <svg :viewBox="`0 0 ${W} ${tugunlar.H}`" :style="{ minHeight: `${Math.min(tugunlar.H, 640)}px` }">
      <g v-for="l in chiziqlar" :key="l.id">
        <path :id="`yol-${l.id}`" :d="l.d" class="chiziq" :class="{ bosh: l.oqim <= 0.5 }" />
        <circle v-for="k in nuqta(l.oqim)" :key="`${l.id}-${k}-${nuqta(l.oqim)}`" r="3.2" class="nuqta">
          <animateMotion :dur="'1.6s'" :begin="`${(k - 1) * (1.6 / nuqta(l.oqim))}s`" repeatCount="indefinite"><mpath :href="`#yol-${l.id}`" /></animateMotion>
        </circle>
      </g>
      <g
        v-for="t in tugunlar.list"
        :key="t.id"
        class="tugun"
        :class="[t.tur, t.band != null && rang(t.band), { yiqilgan: t.yiqilgan, on: tanlangan === t.id, tiqildi: t.band >= 1 }]"
        :transform="`translate(${t.x} ${t.y})`"
        @click="t.tur === 'server' ? emit('server', t.i) : emit('tanla', t.id)"
      >
        <title>{{ t.tur === 'server' ? 'Bosing — serverni yiqitish yoki tiklash' : t.nom }}</title>
        <rect :width="BW" :height="BH" rx="9" class="quti" />
        <text x="10" y="19" class="nom">{{ t.nom }}</text>
        <text x="10" y="35" class="izoh">{{ t.izoh }}</text>
        <template v-if="t.band != null && !t.yiqilgan && t.tur !== 'lb' && t.tur !== 'cdn'">
          <rect x="10" :y="BH - 12" :width="BW - 50" height="5" rx="2.5" class="bar-orqa" />
          <rect x="10" :y="BH - 12" :width="Math.min(1, t.band) * (BW - 50)" height="5" rx="2.5" class="bar" />
          <text :x="BW - 10" :y="BH - 7" text-anchor="end" class="foiz">{{ foiz(t.band) }}</text>
        </template>
        <text v-if="t.yiqilgan" :x="BW - 14" y="22" class="xoch">✕</text>
        <text v-if="t.band >= 1 && !t.yiqilgan" :x="BW / 2" y="-6" text-anchor="middle" class="tiqil">🔥 tiqilib qoldi</text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.sxema { overflow: auto; padding: 10px; }
svg { display: block; width: 100%; height: auto; }
.chiziq { fill: none; stroke: var(--border-strong); stroke-width: 1.6; }
.chiziq.bosh { stroke-dasharray: 3 4; opacity: .5; }
.nuqta { fill: var(--accent); }
.tugun { cursor: pointer; }
.quti { fill: var(--bg-elevated); stroke: var(--border-strong); stroke-width: 1.6; }
.tugun.yashil .quti { stroke: #2fbf71; }
.tugun.sariq .quti { stroke: #f5a524; fill: var(--warning-soft); }
.tugun.qizil .quti { stroke: #e5484d; fill: var(--danger-soft); stroke-width: 2.4; }
.tugun.tiqildi { animation: titra .5s ease-in-out infinite; }
@keyframes titra { 0%, 100% { translate: 0 0; } 25% { translate: -1.5px 0; } 75% { translate: 1.5px 0; } }
.tugun.yiqilgan .quti { fill: var(--bg-sunken); stroke-dasharray: 5 4; }
.tugun.yiqilgan text { fill: var(--text-subtle); }
.tugun.on .quti { stroke: var(--accent); stroke-width: 3.5; }
.tugun.foyd .quti, .tugun.lb .quti, .tugun.cdn .quti { stroke: var(--accent); }
.nom { fill: var(--text); font: 600 12.5px var(--font-sans); }
.izoh { fill: var(--text-subtle); font: 11px var(--font-mono); }
.bar-orqa { fill: var(--bg-sunken); }
.bar { transition: width .4s; }
.yashil .bar { fill: #2fbf71; } .sariq .bar { fill: #f5a524; } .qizil .bar { fill: #e5484d; }
.foiz { fill: var(--text-muted); font: 600 10.5px var(--font-mono); }
.xoch { fill: #e5484d; font: 800 16px var(--font-sans); }
.tiqil { fill: #e5484d; font: 700 11px var(--font-sans); }
</style>
