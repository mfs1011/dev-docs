<script setup>
// Komponentlar daraxti: har tugunda render soni, oxirgi render sababi va chaqnash
// (yashil — chizildi, ko'k — yaratildi, kulrang — o'tkazib yuborildi). Tugun bosilsa — props va holati.
import { computed } from 'vue'

const props = defineProps({ nodes: Array, chaqnash: Object, sabablar: Object, tanlangan: [Number, String], fw: String })
const emit = defineEmits(['tanla'])

const qatorlar = computed(() => {
  const bolalar = new Map()
  for (const n of props.nodes) bolalar.set(n.parent ?? null, [...(bolalar.get(n.parent ?? null) ?? []), n])
  const out = []
  const yur = (pid, d) => {
    for (const n of bolalar.get(pid) ?? []) {
      out.push({ ...n, d })
      yur(n.id, d + 1)
    }
  }
  yur(null, 0)
  return out
})
const tanlanganTugun = computed(() => props.nodes.find((n) => n.id === props.tanlangan) ?? null)

// sabab → qisqa yorliq
function yorliq(s) {
  if (s.ota) return 'ota chizildi'
  if (s.ozi) return 'o‘zi'
  if (s.context) return `context: ${s.label}`
  if (s.computed) return `${s.label} (computed)`
  if (s.tur === 'funksiya') return `${s.label}: yangi funksiya`
  if (s.tur === 'obyekt') return `${s.label}: yangi obyekt`
  if (s.tur === 'element') return `${s.label}: yangi element`
  return s.old !== undefined ? `${s.label}: ${s.old} → ${s.new}` : s.label
}
const turi = (s) => (s.ota || s.ozi ? 'ota' : s.context ? 'ctx' : s.props ? 'prop' : 'st')
</script>

<template>
  <div class="daraxt">
    <ul class="tree" role="tree">
      <li
        v-for="n in qatorlar"
        :key="n.id"
        role="treeitem"
        :aria-selected="n.id === tanlangan"
        :class="{ on: n.id === tanlangan }"
        :style="{ '--d': n.d }"
        @click="emit('tanla', n.id)"
      >
        <span v-if="chaqnash.get(n.id)" :key="chaqnash.get(n.id).seq" class="nur" :class="chaqnash.get(n.id).tur" />
        <span class="ism">&lt;{{ n.name }}&gt;</span>
        <span v-if="n.memo" class="memo">memo</span>
        <span class="son" :title="`${n.renders} marta qayta chizildi`">{{ n.renders }}</span>
        <span v-if="chaqnash.get(n.id)?.tur === 'skip'" class="chip skip">o‘tkazib yuborildi</span>
        <template v-else-if="sabablar.get(n.id)">
          <span v-for="(s, i) in sabablar.get(n.id).slice(0, 2)" :key="i" class="chip" :class="turi(s)">{{ yorliq(s) }}</span>
        </template>
      </li>
    </ul>
    <p v-if="!nodes.length" class="bosh">Ilova ishga tushmoqda…</p>
    <div v-if="tanlanganTugun" class="tafsilot">
      <h3>&lt;{{ tanlanganTugun.name }}&gt; <small>{{ tanlanganTugun.renders }} marta qayta chizildi</small></h3>
      <dl v-if="tanlanganTugun.props.length">
        <dt>props</dt>
        <dd v-for="[k, v] in tanlanganTugun.props" :key="k"><code>{{ k }}</code> {{ v }}</dd>
      </dl>
      <dl v-if="tanlanganTugun.state.length">
        <dt>{{ fw === 'vue' ? 'setup holati' : 'state' }}</dt>
        <dd v-for="[k, v, t] in tanlanganTugun.state" :key="k"><code>{{ k }}</code> {{ v }} <small v-if="t">{{ t }}</small></dd>
      </dl>
      <dl v-if="tanlanganTugun.deps?.length">
        <dt>render paytida o‘qigan (bog‘liqliklar)</dt>
        <dd><code v-for="d in tanlanganTugun.deps" :key="d" class="dep">{{ d }}</code></dd>
      </dl>
    </div>
  </div>
</template>

<style scoped>
.daraxt { display: flex; flex-direction: column; min-height: 0; overflow: auto; }
.tree { margin: 0; padding: 8px 0; list-style: none; }
.tree li { position: relative; display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; padding: 4px 12px 4px calc(14px + var(--d) * 18px); cursor: pointer; font-size: 13px; }
.tree li::before { content: ''; position: absolute; left: calc(6px + var(--d) * 18px); top: 0; bottom: 0; border-left: 1px dashed var(--border); }
.tree li:hover { background: var(--bg-sunken); }
.tree li.on { background: var(--accent-soft, var(--bg-sunken)); }
.ism { position: relative; font: 600 13px var(--font-mono); color: var(--accent-text); }
.memo { padding: 0 6px; border: 1px solid var(--border-strong); border-radius: 10px; color: var(--text-subtle); font-size: 11px; }
.son { position: relative; min-width: 20px; padding: 0 6px; border-radius: 10px; background: var(--bg-sunken); color: var(--text-muted); font: 600 11.5px/18px var(--font-mono); text-align: center; }
.chip { position: relative; padding: 0 7px; border-radius: 4px; font: 11.5px/18px var(--font-mono); white-space: nowrap; }
.chip.st { background: var(--success-soft); color: var(--success); }
.chip.prop { background: var(--warning-soft); color: var(--warning); }
.chip.ctx { background: #ece6ff; color: #5b4bd6; }
.chip.ota { background: var(--bg-sunken); color: var(--text-muted); }
.chip.skip { border: 1px dashed var(--border-strong); color: var(--text-subtle); }
.nur { position: absolute; inset: 1px 4px; border-radius: 6px; pointer-events: none; animation: nur 1.6s ease-out forwards; }
.nur.render { background: #2fbf71; }
.nur.mount { background: #3b82f6; }
.nur.skip { background: transparent; outline: 2px dashed #8a94a6; }
@keyframes nur { 0% { opacity: .55; } 100% { opacity: 0; } }
.bosh { padding: 14px; color: var(--text-subtle); font-size: 13px; }
.tafsilot { margin-top: auto; padding: 10px 14px; border-top: 1px solid var(--border); background: var(--bg-sunken); font-size: 12.5px; }
.tafsilot h3 { margin: 0 0 6px; font: 600 13px var(--font-mono); }
.tafsilot h3 small { color: var(--text-subtle); font: 12px var(--font-sans); }
dl { margin: 6px 0 0; }
dt { color: var(--text-subtle); font-size: 11px; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; }
dd { margin: 2px 0 0 8px; font: 12px var(--font-mono); word-break: break-word; }
dd small { color: var(--text-subtle); }
dd code { color: var(--accent-text); }
.dep { display: inline-block; margin: 0 6px 4px 0; padding: 0 6px; border: 1px solid var(--border); border-radius: 4px; background: var(--bg-elevated); }
:root[data-theme='dark'] .chip.ctx { background: #2a2350; color: #b9adff; }
</style>
