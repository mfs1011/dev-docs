<script setup>
// ER diagramma: jadvallar — kartochkalar, tashqi kalitlar — ustundan ustunga chiziq (crow's foot belgisi bilan).
// Joylashuv: bog'liqlik darajasi bo'yicha ustunlar (ishora qilinadigan jadval chapda, ishora qiluvchi o'ngda).
// Kartochkani sarlavhasidan sudrab surish mumkin; joylar shu sessiyada eslab qolinadi.
import { computed, reactive, ref, watch } from 'vue'

const props = defineProps({ schema: Object, flash: Object })
const emit = defineEmits(['ochish'])

const W = 220, HEAD = 34, ROW = 24, GAPX = 130, GAPY = 28, PAD = 24
const joy = reactive(new Map()) // faqat qo'lda sudralgan jadvallar: jadval -> { x, y }
const svg = ref(null)
const yangi = ref(new Set())
const ozgargan = ref(new Set())

const tables = computed(() => props.schema?.tables ?? [])
const fks = computed(() => props.schema?.fks ?? [])

// yangi jadval / ustun / qatorlar soni o'zgarishi — bir necha soniya yonadi
watch(() => props.schema, (s, prev) => {
  if (!s) return
  const pm = new Map((prev?.tables ?? []).map((t) => [t.name, t]))
  const n = new Set(), o = new Set()
  for (const t of s.tables) {
    const p = pm.get(t.name)
    if (!p) { if (prev) n.add(t.name); continue }
    if (p.count !== t.count) o.add(t.name)
    for (const c of t.columns) if (!p.columns.some((x) => x.name === c.name)) n.add(t.name + '.' + c.name)
  }
  for (const name of [...joy.keys()]) if (!s.tables.some((t) => t.name === name)) joy.delete(name)
  yangi.value = n
  ozgargan.value = o
  setTimeout(() => { if (yangi.value === n) { yangi.value = new Set(); ozgargan.value = new Set() } }, 3500)
})

const height = (t) => HEAD + t.columns.length * ROW + 8

// daraja: ishora qiladigan jadvallar o'zi ishora qilganlardan bir ustun o'ngda
const layout = computed(() => {
  const ts = tables.value
  const lvl = new Map(ts.map((t) => [t.name, 0]))
  for (let k = 0; k < ts.length; k++) {
    let changed = false
    for (const f of fks.value) {
      if (f.from === f.to || !lvl.has(f.to)) continue
      const v = lvl.get(f.to) + 1
      if (v > (lvl.get(f.from) ?? 0)) { lvl.set(f.from, v); changed = true }
    }
    if (!changed) break
  }
  // ishora qilinadigan jadval unga ishora qiluvchilarning eng yaqinidan bir ustun chapda tursin
  // (aks holda uzoq chiziq oradagi kartochkalar ostidan o'tadi)
  for (let k = 0; k < ts.length; k++) {
    let changed = false
    for (const t of ts) {
      const kids = fks.value.filter((f) => f.to === t.name && f.from !== t.name).map((f) => lvl.get(f.from))
      if (!kids.length) continue
      const v = Math.min(...kids) - 1
      if (v > lvl.get(t.name)) { lvl.set(t.name, v); changed = true }
    }
    if (!changed) break
  }
  const colY = new Map()
  const pos = new Map()
  for (const t of ts) {
    const l = Math.min(lvl.get(t.name), 6)
    const auto = { x: PAD + l * (W + GAPX), y: colY.get(l) ?? PAD }
    colY.set(l, auto.y + height(t) + GAPY)
    // avtomatik joy har safar qayta hisoblanadi (sxema o'zgarsa kartochkalar silliq ko'chadi)
    pos.set(t.name, joy.get(t.name) ?? auto)
  }
  return pos
})

const colIndex = (t, name) => Math.max(0, t.columns.findIndex((c) => c.name === name))
const edges = computed(() => {
  const pos = layout.value
  const out = []
  for (const f of fks.value) {
    const a = tables.value.find((t) => t.name === f.from), b = tables.value.find((t) => t.name === f.to)
    if (!a || !b) continue
    const pa = pos.get(a.name), pb = pos.get(b.name)
    const ya = pa.y + HEAD + colIndex(a, f.fromCols[0]) * ROW + ROW / 2
    const yb = pb.y + HEAD + colIndex(b, f.toCols[0]) * ROW + ROW / 2
    // chiziq yaqin yon tomondan chiqadi
    const right = pb.x + W / 2 > pa.x + W / 2
    const xa = right ? pa.x + W : pa.x, xb = right ? pb.x : pb.x + W
    const s = right ? 1 : -1
    const self = a === b
    // oradagi kartochkalar: chiziq ularning ostidan aylanib o'tadi (aks holda kartochka ortida yo'qoladi)
    const lo = Math.min(xa, xb), hi = Math.max(xa, xb)
    const mid = tables.value.filter((t) => t !== a && t !== b && pos.get(t.name).x > lo - 1 && pos.get(t.name).x + W < hi + 1)
    let d
    if (self) d = `M${pa.x + W},${ya} H${pa.x + W + 24} C${pa.x + W + 70},${ya} ${pa.x + W + 70},${yb} ${pa.x + W + 24},${yb} H${pa.x + W}`
    else if (mid.length) {
      const yr = Math.max(...mid.map((t) => pos.get(t.name).y + height(t))) + GAPY / 2
      const x1 = xa + s * GAPX / 2, x2 = xb - s * GAPX / 2, r = 12
      d = `M${xa},${ya} H${x1 - s * r} Q${x1},${ya} ${x1},${ya + r} V${yr - r} Q${x1},${yr} ${x1 + s * r},${yr} H${x2 - s * r} Q${x2},${yr} ${x2},${yr - r} V${yb + r} Q${x2},${yb} ${x2 + s * r},${yb} H${xb}`
    } else {
      // uchlarida to'g'ri qism: crow's foot va | belgilari egri emas, to'g'ri chiziq ustida tursin
      const L = 24, k = Math.max(24, (Math.abs(xb - xa) - 2 * L) / 2) // egrilik bo'sh joyga mos
      d = `M${xa},${ya} H${xa + s * L} C${xa + s * (L + k)},${ya} ${xb - s * (L + k)},${yb} ${xb - s * L},${yb} H${xb}`
    }
    out.push({ key: f.name, d, xa: self ? pa.x + W : xa, ya, xb: self ? pa.x + W : xb, yb, s: self ? 1 : s, fk: f })
  }
  return out
})

const box = computed(() => {
  let w = 300, h = 160
  for (const t of tables.value) { const p = layout.value.get(t.name); w = Math.max(w, p.x + W + PAD + 40); h = Math.max(h, p.y + height(t) + PAD) }
  return { w, h }
})

const isFk = (t, c) => fks.value.some((f) => f.from === t.name && f.fromCols.includes(c.name))
const lit = (f) => props.flash?.fks?.has(f.name) || props.flash?.tables?.has(f.from)

// sudrash: svg koordinatalariga o'tkazib
let drag = null
function pt(e) {
  const m = svg.value.getScreenCTM().inverse()
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m)
  return { x: p.x, y: p.y }
}
function down(e, t) {
  const p = pt(e), j = layout.value.get(t.name)
  drag = { name: t.name, dx: p.x - j.x, dy: p.y - j.y, moved: false }
  e.currentTarget.setPointerCapture(e.pointerId)
}
function move(e) {
  if (!drag) return
  const p = pt(e)
  joy.set(drag.name, { x: Math.max(4, p.x - drag.dx), y: Math.max(4, p.y - drag.dy) })
  drag.moved = true
}
function up(t) {
  if (drag && !drag.moved) emit('ochish', t.name)
  drag = null
}
defineExpose({ tozala: () => joy.clear() })
</script>

<template>
  <div class="er">
    <p v-if="!tables.length" class="empty">Bazada hali jadval yo‘q. <code>CREATE TABLE</code> bilan yarating — shu yerda paydo bo‘ladi.</p>
    <svg v-else ref="svg" :viewBox="`0 0 ${box.w} ${box.h}`" preserveAspectRatio="xMidYMin meet" @pointermove="move">
      <g v-for="e in edges" :key="e.key" class="edge" :class="{ lit: lit(e.fk) }">
        <title>{{ e.fk.from }}({{ e.fk.fromCols.join(', ') }}) → {{ e.fk.to }}({{ e.fk.toCols.join(', ') }})</title>
        <path :d="e.d" />
        <!-- ko'p tomoni (ishora qiluvchi): crow's foot -->
        <path :d="`M${e.xa + e.s * 14},${e.ya} L${e.xa},${e.ya - 7} M${e.xa + e.s * 14},${e.ya} L${e.xa},${e.ya} M${e.xa + e.s * 14},${e.ya} L${e.xa},${e.ya + 7}`" />
        <!-- bitta tomoni (ishora qilinadigan): chiziqcha -->
        <path :d="`M${e.xb - e.s * 10},${e.yb - 7} L${e.xb - e.s * 10},${e.yb + 7}`" />
      </g>
      <g
        v-for="t in tables" :key="t.name" class="card"
        :class="{ view: t.view, fresh: yangi.has(t.name), changed: ozgargan.has(t.name) }"
        :style="{ transform: `translate(${layout.get(t.name).x}px, ${layout.get(t.name).y}px)` }"
      >
        <rect class="bg" :width="W" :height="height(t)" rx="10" />
        <g class="head" @pointerdown="down($event, t)" @pointerup="up(t)">
          <rect :width="W" :height="HEAD" rx="10" />
          <rect :y="HEAD - 10" :width="W" height="10" />
          <text x="12" y="22" class="name">{{ t.name }}</text>
          <text :x="W - 12" y="22" class="count" text-anchor="end">{{ t.view ? 'view' : `${t.count} qator` }}</text>
          <title>Bosing — jadval ichini ko‘rish so‘rovi; sudrang — joyini o‘zgartirish</title>
        </g>
        <g v-for="(c, i) in t.columns" :key="c.name" class="col" :class="{ fresh: yangi.has(t.name + '.' + c.name) }" :transform="`translate(0, ${HEAD + i * ROW})`">
          <rect class="rowbg" :width="W" :height="ROW" />
          <text x="12" :y="ROW / 2 + 4" class="cname" :class="{ pk: c.pk }">{{ c.name }}</text>
          <text v-if="c.pk" :x="12 + c.name.length * 7.3 + 6" :y="ROW / 2 + 4" class="badge pkb">PK</text>
          <text v-else-if="isFk(t, c)" :x="12 + c.name.length * 7.3 + 6" :y="ROW / 2 + 4" class="badge fkb">FK</text>
          <text :x="W - 12" :y="ROW / 2 + 4" class="type" text-anchor="end">{{ c.type.replace('character varying', 'varchar').replace(' without time zone', '') }}{{ c.notnull && !c.pk ? ' •' : '' }}</text>
        </g>
      </g>
    </svg>
    <p v-if="tables.length" class="legend">PK — birlamchi kalit · FK — tashqi kalit · • NOT NULL · sarlavhani bosing — ichini ko‘rish</p>
  </div>
</template>

<style scoped>
.er { position: relative; height: 100%; min-height: 0; overflow: auto; }
svg { display: block; width: 100%; height: calc(100% - 26px); min-height: 200px; }
.empty { padding: 30px; color: var(--text-muted); font-size: 14px; }
.empty code { padding: 1px 6px; border-radius: 4px; background: var(--bg-sunken); color: var(--accent-text); font-family: var(--font-mono); }
.legend { position: absolute; left: 12px; bottom: 6px; margin: 0; color: var(--text-subtle); font-size: 11.5px; }
.card { transition: transform .5s cubic-bezier(.3, .8, .3, 1); }
.card.fresh .bg { animation: pop 1.2s; }
.card.fresh { animation: fade .5s; }
.bg { fill: var(--bg-elevated); stroke: var(--border-strong); stroke-width: 1.2; }
.card.view .bg { stroke-dasharray: 5 4; }
.head { cursor: grab; }
.head rect { fill: var(--accent-soft); }
.name { fill: var(--accent-text); font: 700 13.5px var(--font-mono); }
.count { fill: var(--text-subtle); font: 11px var(--font-sans); }
.card.changed .count { fill: var(--warning); font-weight: 700; animation: blink 1.2s 2; }
.rowbg { fill: transparent; }
.col.fresh .rowbg { fill: var(--success-soft); }
.cname { fill: var(--text); font: 12.5px var(--font-mono); }
.cname.pk { font-weight: 700; }
.badge { font: 700 9.5px var(--font-sans); }
.pkb { fill: var(--warning); }
.fkb { fill: var(--info); }
.type { fill: var(--text-subtle); font: 11px var(--font-mono); }
.edge path { fill: none; stroke: var(--info); stroke-width: 1.8; transition: stroke .3s; }
.edge.lit path { stroke: var(--danger); stroke-width: 3; animation: blink .6s 4; }
@keyframes fade { from { opacity: 0; } }
@keyframes pop { 0%, 40% { stroke: var(--success); stroke-width: 3; } }
@keyframes blink { 50% { opacity: .25; } }
</style>
