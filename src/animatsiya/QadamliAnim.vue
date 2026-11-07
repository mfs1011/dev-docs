<script setup>
// Umumiy qadamli animatsiya: har qadamda buyruq, uning haqiqiy chiqishi (trenajor/VPS), "holat" paneli va izoh.
// Ma'lumot — qadamlar.js da, markdown'da: <div data-animatsiya="qadamli" data-nom="..."></div>
import { computed, ref } from 'vue'
import { QADAMLI } from './qadamlar.js'

const props = defineProps({ nom: { type: String, required: true } })
const d = QADAMLI[props.nom]
const i = ref(0)
const q = computed(() => d.qadamlar[i.value])
const qismlar = (s) => s.split('`').map((t, k) => ({ t, code: k % 2 === 1 }))
</script>

<template>
  <div v-if="d" class="qadamli-anim" :class="{ keng: d.keng }">
    <div class="qa-ustun">
      <div class="qa-terminal">
        <div v-for="(c, k) in q.cmd" :key="'c' + i + k" class="qa-cmd"><span>$</span> {{ c }}</div>
        <pre v-if="q.chiqish" :key="'o' + i" class="qa-chiqish">{{ q.chiqish }}</pre>
      </div>
      <div class="qa-panel">
        <div class="qa-sar">{{ d.panel }}</div>
        <TransitionGroup name="qa" tag="ul">
          <li v-for="r in q.holat" :key="r.k ?? r.yol" :class="r.belgi">
            <code class="qa-yol">{{ r.yol }}</code>
            <span v-if="r.qiymat" class="qa-qiymat">{{ r.qiymat }}</span>
          </li>
        </TransitionGroup>
      </div>
    </div>
    <p class="qa-izoh"><template v-for="(p, k) in qismlar(q.izoh)" :key="k"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template></p>
    <div class="qa-boshqaruv">
      <button type="button" :disabled="i === 0" @click="i--">← Oldingi</button>
      <span class="qa-nuqtalar"><button v-for="(_, k) in d.qadamlar" :key="k" type="button" :class="{ on: k === i }" :aria-label="`${k + 1}-qadam`" @click="i = k" /></span>
      <button type="button" :disabled="i === d.qadamlar.length - 1" @click="i++">Keyingi →</button>
    </div>
  </div>
</template>

<style scoped>
.qadamli-anim { margin: 20px 0; padding: 14px 16px 12px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-elevated); }
.qa-ustun { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: 12px; }
.qa-terminal { padding: 10px 12px; border-radius: var(--radius-sm); background: var(--code-bg); font: 13.5px/1.55 var(--font-mono); min-height: 120px; }
.qa-cmd { color: #7ee787; white-space: pre-wrap; word-break: break-word; animation: qa-kir .4s ease; }
.qa-cmd span { color: #6b7689; margin-right: 6px; }
.qa-chiqish { margin: 4px 0 0; color: #d7dde8; font: inherit; white-space: pre-wrap; word-break: break-word; animation: qa-kir .5s ease; }
/* keng: true — keng chiqishli (vmstat kabi) animatsiyalar: terminal butun kenglikda, qatorlar bo'linmaydi */
.keng .qa-ustun { grid-template-columns: minmax(0, 1fr); }
.keng .qa-chiqish { white-space: pre; word-break: normal; overflow-x: auto; font-size: 12.5px; }
.qa-panel { padding: 10px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg); }
.qa-sar { margin-bottom: 8px; font: 600 11px var(--font-sans); letter-spacing: .08em; text-transform: uppercase; color: var(--text-subtle); }
.qa-panel ul { display: grid; gap: 6px; margin: 0; padding: 0; list-style: none; }
.qa-panel li { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 4px 10px; padding: 6px 9px; border: 1px solid var(--border); border-radius: 7px; background: var(--bg-elevated); transition: background .4s, border-color .4s, opacity .4s; }
.qa-yol { font: 13.5px var(--font-mono); background: none; border: 0; padding: 0; color: var(--text); }
.qa-qiymat { font: 12.5px var(--font-mono); color: var(--text-muted); }
.qa-panel li.yangi { border-color: var(--success); background: var(--success-soft); }
.qa-panel li.xato { border-color: var(--danger); background: color-mix(in srgb, var(--danger) 10%, var(--bg-elevated)); }
.qa-panel li.xato .qa-qiymat { color: var(--danger); font-weight: 600; }
.qa-panel li.ochiq { border-color: #e3b341; background: color-mix(in srgb, #e3b341 14%, var(--bg-elevated)); }
.qa-panel li.yoq { opacity: .45; border-style: dashed; }
.qa-panel li.yoq .qa-yol { text-decoration: line-through; }
.qa-enter-active { transition: opacity .45s, transform .45s; }
.qa-enter-from { opacity: 0; transform: translateY(-6px); }
.qa-leave-active { display: none; }
@keyframes qa-kir { from { opacity: 0; transform: translateY(-3px); } }
.qa-izoh { margin: 12px 0 12px; min-height: 3em; font-size: 15px; line-height: 1.55; }
.qa-izoh code { font: 13px var(--font-mono); padding: 1px 4px; border-radius: 4px; background: var(--bg-sunken); }
.qa-boshqaruv { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.qa-boshqaruv > button { padding: 6px 12px; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); background: var(--bg-elevated); color: var(--text); font: inherit; font-size: 13px; cursor: pointer; }
.qa-boshqaruv > button:disabled { opacity: .4; cursor: default; }
.qa-boshqaruv > button:not(:disabled):hover { border-color: var(--accent); color: var(--accent-text); }
.qa-nuqtalar { display: flex; gap: 6px; }
.qa-nuqtalar button { width: 10px; height: 10px; padding: 0; border-radius: 50%; border: 0; background: var(--border-strong); cursor: pointer; }
.qa-nuqtalar button.on { background: var(--accent); }
@media (max-width: 640px) { .qa-ustun { grid-template-columns: 1fr; } }
</style>
