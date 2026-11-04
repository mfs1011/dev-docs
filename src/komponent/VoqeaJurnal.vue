<script setup>
// Voqealar jurnali: har bosish/harf — bitta to'plam. Ichida tartib bilan: nima o'zgardi → nima qayta
// hisoblandi → kim chizildi (sababi bilan) yoki o'tkazib yuborildi. Yonida — konsol.
import { computed, ref } from 'vue'

// nomlar: graf tugunlari (id → nom) — setup tugamasidan oldingi voqealar ham nomi bilan chiqsin
const props = defineProps({ toplamlar: Array, loglar: Array, fw: String, nomlar: Map })
const nom = (e) => props.nomlar?.get(e.node) ?? e.label
const tab = ref('jurnal')

const sabab = (s) => {
  if (s.ota) return props.fw === 'vue' ? 'ota (slot)' : 'ota chizildi'
  if (s.ozi) return 'o‘zi'
  if (s.context) return `context ${s.label}`
  if (s.tur === 'funksiya') return `${s.label} — yangi funksiya`
  if (s.tur === 'obyekt') return `${s.label} — yangi obyekt`
  if (s.tur === 'element') return `${s.label} — yangi element`
  return s.old !== undefined ? `${s.label}: ${s.old} → ${s.new}` : s.label
}
const xulosa = (t) => {
  const set = t.ev.filter((e) => e.k === 'set').length
  const r = t.ev.filter((e) => e.k === 'render').length
  const m = t.ev.filter((e) => e.k === 'mount').length
  const p = []
  if (m) p.push(`${m} ta yaratildi`)
  if (set) p.push(`${set} ta o‘zgarish`)
  p.push(`${r} ta render`)
  return p.join(' → ')
}
const harakat = (s) => (!s ? '' : s.type === 'click' ? `bosish${s.text ? ` «${s.text.slice(0, 24)}»` : ''}` : 'yozish')
const teskari = computed(() => [...props.toplamlar].reverse())
</script>

<template>
  <div class="jurnal">
    <div class="tab" role="tablist">
      <button type="button" role="tab" :aria-selected="tab === 'jurnal'" :class="{ on: tab === 'jurnal' }" @click="tab = 'jurnal'">Voqealar</button>
      <button type="button" role="tab" :aria-selected="tab === 'konsol'" :class="{ on: tab === 'konsol' }" @click="tab = 'konsol'">
        Konsol <span v-if="loglar.length" class="n">{{ loglar.length }}</span>
      </button>
    </div>
    <div v-if="tab === 'jurnal'" class="ichi">
      <p v-if="!toplamlar.length" class="bosh">Natija oynasida tugmani bosing yoki yozing — har hodisa shu yerda zanjir bo‘lib chiqadi.</p>
      <section v-for="t in teskari" :key="t.b" class="toplam">
        <header><b>{{ t.b === 1 ? 'Ishga tushdi' : `#${t.b} ${harakat(t.sabab)}` }}</b><span>{{ xulosa(t) }}</span></header>
        <ul>
          <li v-for="(e, i) in t.ev" :key="i" :class="e.k">
            <template v-if="e.k === 'set'"><i>✎</i><code>{{ nom(e) }}</code> {{ e.old !== undefined ? `${e.old} → ` : '= ' }}{{ e.new }}</template>
            <template v-else-if="e.k === 'compute'"><i>ƒ</i><code>{{ nom(e) }}</code> {{ e.birinchi ? 'hisoblandi' : 'qayta hisoblandi' }} = {{ e.value }}<em v-if="!e.birinchi && !e.ozgardi"> (qiymat o‘zgarmadi)</em></template>
            <template v-else-if="e.k === 'watch'"><i>◉</i><code>{{ nom(e) }}</code> ishladi</template>
            <template v-else-if="e.k === 'mount'"><i>+</i><code>&lt;{{ e.name }}&gt;</code> yaratildi</template>
            <template v-else-if="e.k === 'unmount'"><i>−</i><code>&lt;{{ e.name }}&gt;</code> olib tashlandi</template>
            <template v-else-if="e.k === 'skip'"><i>⏸</i><code>&lt;{{ e.name }}&gt;</code> o‘tkazib yuborildi<em>{{ e.memo ? ' — memo: props o‘zgarmagan' : fw === 'vue' ? ' — computed qiymati o‘zgarmadi' : '' }}</em></template>
            <template v-else-if="e.k === 'render'"><i>▶</i><code>&lt;{{ e.name }}&gt;</code> qayta chizildi <small>({{ e.n }}-marta)</small><span class="sab">sabab: {{ e.reasons.map(sabab).join(', ') }}</span></template>
          </li>
        </ul>
      </section>
    </div>
    <div v-else class="ichi konsol">
      <p v-if="!loglar.length" class="bosh">Konsol bo‘sh. Kodda <code>console.log(…)</code> yozing.</p>
      <pre v-for="(l, i) in loglar" :key="i" :class="l.level">{{ l.text }}</pre>
    </div>
  </div>
</template>

<style scoped>
.jurnal { display: flex; flex-direction: column; min-height: 0; }
.tab { display: flex; gap: 4px; padding: 6px 10px; border-bottom: 1px solid var(--border); }
.tab button { padding: 3px 10px; border: 0; border-radius: 6px; background: none; color: var(--text-muted); font: 600 12px var(--font-sans); cursor: pointer; }
.tab button.on { background: var(--bg-sunken); color: var(--accent-text); }
.n { padding: 0 5px; border-radius: 8px; background: var(--accent); color: var(--bg-elevated); font-size: 10.5px; }
.ichi { flex: 1; min-height: 0; overflow: auto; padding: 8px 12px; }
.bosh { margin: 4px 0; color: var(--text-subtle); font-size: 13px; }
.toplam { margin-bottom: 8px; padding: 6px 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); }
.toplam:first-of-type { border-color: var(--accent); }
.toplam header { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 4px; font-size: 12px; }
.toplam header span { color: var(--text-subtle); }
ul { margin: 0; padding: 0; list-style: none; }
li { padding: 1px 0; font-size: 12.5px; line-height: 1.5; }
li i { display: inline-block; width: 18px; color: var(--text-subtle); font-style: normal; text-align: center; }
li code { font: 600 12px var(--font-mono); }
li.set code { color: var(--warning); }
li.compute code { color: #7c5ce0; }
li.render code, li.watch code { color: var(--success); }
li.mount code { color: #2f6fe0; }
li.skip { color: var(--text-subtle); }
li em { color: var(--text-subtle); font-style: normal; }
.sab { display: block; margin-left: 18px; color: var(--text-subtle); font-size: 11.5px; }
.konsol pre { margin: 0; padding: 2px 0; border-bottom: 1px solid var(--border); font: 12px/1.5 var(--font-mono); white-space: pre-wrap; }
.konsol pre.warn { color: var(--warning); }
.konsol pre.error { color: var(--danger); }
</style>
