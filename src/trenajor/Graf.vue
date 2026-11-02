<script setup>
// Commit grafi: ustun — commit chuqurligi (ota-onasidan bittaga o'ngda), yo'lak — branch.
// Elementlar hash/ref nomi bilan kalitlanadi: holat o'zgarsa CSS transition ularni yangi joyga silliq suradi.
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { grafLayout } from './grafLayout.js'

const props = defineProps({ holat: Object, diff: Object })
const wrap = ref(null)
const layout = computed(() => grafLayout(props.holat, props.diff))

// ---------- zoom ----------
// «fit» rejimida graf panelga o'zi sig'adi (faqat kichraytiriladi); +/− yoki Ctrl+g'ildirak — qo'lda rejim
const MIN = 0.3, MAX = 2.5
const zoom = ref(1)
const fit = ref(true)
const size = ref({ w: 0, h: 0 })
const fitZoom = computed(() => {
  const l = layout.value
  if (!l || !size.value.w) return 1
  // 50% dan maydalashtirmaymiz — undan uzun tarix suriladi
  return Math.max(0.5, Math.min(1, (size.value.w - 8) / l.w, (size.value.h - 8) / (l.h + l.top)))
})
const z = computed(() => (fit.value ? fitZoom.value : zoom.value))
const clamp = (v) => Math.min(MAX, Math.max(MIN, v))

// (cx, cy) — panel ichidagi nuqta: zoom'dan keyin ham o'sha joy kursor ostida qoladi
async function setZoom(v, cx, cy) {
  const el = wrap.value, old = z.value
  v = clamp(v)
  if (!el || v === old) { fit.value = false; zoom.value = v; return }
  cx ??= el.clientWidth / 2; cy ??= el.clientHeight / 2
  const px = (el.scrollLeft + cx) / old, py = (el.scrollTop + cy) / old
  fit.value = false
  zoom.value = v
  await nextTick()
  el.scrollLeft = px * v - cx
  el.scrollTop = py * v - cy
}
const step = (k) => setZoom(Math.round(z.value * k * 20) / 20)
function onWheel(e) {
  if (!(e.ctrlKey || e.metaKey) || !layout.value) return // oddiy g'ildirak — odatdagidek surish
  e.preventDefault()
  const r = wrap.value.getBoundingClientRect()
  // sichqoncha g'ildiragi bir pog'onada ~100 beradi, trackpad pinch esa 1–10: bitta qadam cheklanadi
  const d = Math.max(-50, Math.min(50, e.deltaY))
  setZoom(z.value * Math.exp(-d * 0.006), e.clientX - r.left, e.clientY - r.top)
}

// sichqoncha bilan sudrab surish
let drag = null
const dragging = ref(false)
function onDown(e) {
  if (e.button !== 0 || e.pointerType === 'touch' || !layout.value) return
  drag = { x: e.clientX, y: e.clientY, l: wrap.value.scrollLeft, t: wrap.value.scrollTop }
  dragging.value = true
  wrap.value.setPointerCapture(e.pointerId)
}
function onMove(e) {
  if (!drag) return
  wrap.value.scrollLeft = drag.l - (e.clientX - drag.x)
  wrap.value.scrollTop = drag.t - (e.clientY - drag.y)
}
const onUp = () => { drag = null; dragging.value = false }

let ro
onMounted(() => {
  ro = new ResizeObserver(([e]) => { size.value = { w: e.contentRect.width, h: e.contentRect.height } })
  ro.observe(wrap.value)
  // passive: false — Ctrl+g'ildirakda brauzerning o'z sahifa zoom'ini to'xtatish uchun
  wrap.value.addEventListener('wheel', onWheel, { passive: false })
})
onBeforeUnmount(() => { ro?.disconnect(); wrap.value?.removeEventListener('wheel', onWheel) })

// yangi commit paydo bo'lganda o'ng chetga suriladi (graf panelga sig'magan bo'lsa)
watch(() => props.holat?.commits?.length, async () => {
  await nextTick()
  const el = wrap.value
  if (el && el.scrollWidth > el.clientWidth) el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' })
})
</script>

<template>
  <div class="box">
  <div class="graf" ref="wrap" :class="{ dragging, pan: layout }" @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" @pointercancel="onUp">
    <div v-if="!holat?.repo" class="empty">
      Bu papkada hali git repo yo‘q.<br>Boshlash uchun: <code>git init</code>
    </div>
    <div v-else-if="!layout" class="empty">Repo bor, lekin hali commit yo‘q.<br>Fayl yarating, <code>git add</code> va <code>git commit</code> qiling.</div>
    <svg v-else :width="layout.w * z" :height="(layout.h + layout.top) * z" :viewBox="`0 ${-layout.top} ${layout.w} ${layout.h + layout.top}`">
      <path v-for="e in layout.edges" :key="e.key" class="edge" :class="{ lost: e.lost }" :style="{ d: `path('${e.d}')`, stroke: e.color }" />
      <g v-for="c in layout.nodes" :key="c.hash" class="node" :class="{ lost: c.lost, fresh: c.fresh }" :style="{ transform: `translate(${c.x}px, ${c.y}px)` }">
        <title>{{ c.hash.slice(0, 7) }} — {{ c.subject }}{{ c.lost ? ' (hech qaysi branch ko‘rmaydi; reflog’da bor)' : '' }}</title>
        <circle v-if="c.isHead" r="27" class="ring" :style="{ stroke: c.color }" />
        <circle :r="c.parents.length > 1 ? 21 : 19" class="dot" :style="{ stroke: c.color }" />
        <text class="hash" y="5">{{ c.hash.slice(0, 4) }}</text>
        <text class="subj" y="40">{{ c.subject.length > 16 ? c.subject.slice(0, 15) + '…' : c.subject }}</text>
      </g>
      <g v-for="l in layout.labels" :key="l.key" class="label" :class="[l.kind, { moved: l.moved }]" :style="{ transform: `translate(${l.x}px, ${l.y}px)` }">
        <rect :x="-(l.text.length * 4.1 + 10)" y="-11" :width="l.text.length * 8.2 + 20" height="22" rx="11" :style="{ fill: l.color }" />
        <text y="4">{{ l.text }}</text>
      </g>
    </svg>
  </div>
  <div v-if="layout" class="zoom" @pointerdown.stop>
    <button type="button" title="Kichraytirish" aria-label="Kichraytirish" @click="step(1 / 1.25)">−</button>
    <button type="button" class="pct" title="Asl o‘lcham (100%)" @click="setZoom(1)">{{ Math.round(z * 100) }}%</button>
    <button type="button" title="Kattalashtirish" aria-label="Kattalashtirish" @click="step(1.25)">+</button>
    <button type="button" class="fit" :class="{ on: fit }" title="Butun grafni panelga sig‘dirish" @click="fit = true">Sig‘dirish</button>
  </div>
  </div>
</template>

<style scoped>
.box { position: relative; height: 100%; min-height: 0; }
.graf { height: 100%; overflow: auto; }
.graf.pan { cursor: grab; }
.graf.dragging { cursor: grabbing; user-select: none; }
.zoom { position: absolute; right: 10px; bottom: 10px; display: flex; align-items: center; gap: 2px; padding: 3px; border: 1px solid var(--border); border-radius: 8px; background: color-mix(in srgb, var(--bg-elevated) 92%, transparent); box-shadow: var(--shadow-sm); backdrop-filter: blur(6px); }
.zoom button { min-width: 28px; height: 26px; padding: 0 6px; border: 0; border-radius: 5px; background: none; color: var(--text); font: 600 14px var(--font-sans); cursor: pointer; }
.zoom button:hover { background: var(--surface-hover); }
.zoom .pct { min-width: 48px; font: 12px var(--font-mono); color: var(--text-muted); }
.zoom .fit { font-size: 12px; }
.zoom .fit.on { background: var(--accent-soft); color: var(--accent-text); }
.empty { color: var(--text-muted); padding: 40px; line-height: 1.8; font-size: 15px; }
.empty code { background: var(--bg-sunken); color: var(--accent-text); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); }
svg { display: block; }
.edge { fill: none; stroke-width: 3; transition: d .6s cubic-bezier(.3, .8, .3, 1), opacity .4s; }
.edge.lost { stroke-dasharray: 5 6; opacity: .35; }
.node { transition: transform .6s cubic-bezier(.3, .8, .3, 1), opacity .4s; }
.node.lost { opacity: .35; }
.node.fresh .dot { animation: pop .55s cubic-bezier(.3, 1.6, .5, 1); }
.dot { fill: var(--bg-elevated); stroke-width: 3.5; transform-box: fill-box; transform-origin: center; }
.node.lost .dot { stroke-dasharray: 4 4; }
.ring { fill: none; stroke-width: 2; opacity: .55; }
.hash { fill: var(--text); font: 600 11px var(--font-mono); text-anchor: middle; }
.subj { fill: var(--text-muted); font: 11px var(--font-sans); text-anchor: middle; }
.label { transition: transform .6s cubic-bezier(.3, .8, .3, 1); }
.label.moved rect { animation: flash 1.2s; }
.label text { fill: var(--lane-ink); font: 700 12px var(--font-mono); text-anchor: middle; }
.label.tag text, .label.remote text { font-weight: 600; }
.label.cur rect { stroke: var(--text); stroke-width: 1.5; }
@keyframes pop { from { transform: scale(0); } to { transform: scale(1); } }
@keyframes flash { 0%, 60% { filter: drop-shadow(0 0 8px var(--accent)); } 100% { filter: none; } }
</style>
