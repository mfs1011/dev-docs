<script setup>
// EXPLAIN rejasining bitta tuguni va uning bolalari (daraxt: ota tepada, bolalar pastda).
// Rang: to'liq o'qish (Seq Scan / SCAN) — sariq, indeks orqali — yashil, birlashtirish — ko'k.
import { computed } from 'vue'

const props = defineProps({ n: Object, total: Number })
const tur = computed(() => {
  const t = props.n.type
  if (/Seq Scan|^SCAN/.test(t)) return 'scan'
  if (/Index|Bitmap|^SEARCH|USING (COVERING )?INDEX/.test(t)) return 'index'
  if (/Join|Nested Loop|Hash$/.test(t)) return 'join'
  if (/Sort|Aggregate|Group|Unique|Limit|Window|TEMP B-TREE/.test(t)) return 'calc'
  return ''
})
const ms = (v) => (v == null ? '' : v < 1 ? `${v.toFixed(3)} ms` : `${v.toFixed(1)} ms`)
const ulush = computed(() => (props.total && props.n.time != null ? Math.min(100, (props.n.time / props.total) * 100) : null))
</script>

<template>
  <li>
    <div class="node" :class="tur">
      <strong>{{ n.type }}</strong>
      <span v-if="n.rel" class="rel">{{ n.rel }}</span>
      <span v-if="n.index" class="idx">indeks: {{ n.index }}</span>
      <code v-if="n.cond">{{ n.cond }}</code>
      <span v-if="n.sort" class="mut">saralash: {{ n.sort }}</span>
      <span v-if="n.group" class="mut">guruh: {{ n.group }}</span>
      <span v-if="n.rows != null" class="rows">{{ n.rows }} qator<template v-if="n.loops > 1"> × {{ n.loops }}</template> <em>(taxmin: {{ n.est }})</em></span>
      <span v-if="n.removed" class="rem">filtr tashladi: {{ n.removed }}</span>
      <span v-if="n.time != null" class="time">{{ ms(n.time) }}<i v-if="ulush != null" :style="{ width: ulush + '%' }" /></span>
    </div>
    <ul v-if="n.children?.length">
      <RejaTugun v-for="(c, i) in n.children" :key="i" :n="c" :total="total" />
    </ul>
  </li>
</template>

<style scoped>
li { display: flex; flex-direction: column; align-items: center; position: relative; padding: 18px 6px 0; list-style: none; }
li::before, li::after { content: ''; position: absolute; top: 0; width: 50%; height: 18px; border-top: 1.5px solid var(--border-strong); }
li::before { right: 50%; }
li::after { left: 50%; border-left: 1.5px solid var(--border-strong); }
li:only-child::before, li:only-child::after { border-top: 0; }
li:first-child::before, li:last-child::after { border-top: 0; }
li:last-child::before { border-right: 1.5px solid var(--border-strong); border-radius: 0 6px 0 0; }
li:first-child::after { border-radius: 6px 0 0 0; }
ul { display: flex; justify-content: center; position: relative; margin: 0; padding: 18px 0 0; }
ul::before { content: ''; position: absolute; top: 0; left: 50%; height: 18px; border-left: 1.5px solid var(--border-strong); }
.node { display: grid; gap: 2px; min-width: 170px; max-width: 280px; padding: 8px 10px; border: 1px solid var(--border-strong); border-left-width: 4px; border-radius: 8px; background: var(--bg-elevated); font-size: 12px; text-align: left; }
.node.scan { border-left-color: var(--warning); }
.node.index { border-left-color: var(--success); }
.node.join { border-left-color: var(--info); }
.node.calc { border-left-color: var(--insight); }
strong { font: 700 13px var(--font-mono); }
.rel { color: var(--accent-text); font-family: var(--font-mono); }
.idx { color: var(--success); font-family: var(--font-mono); }
code { overflow-wrap: anywhere; color: var(--text-muted); font: 11.5px var(--font-mono); }
.mut, em { color: var(--text-subtle); font-style: normal; }
.rem { color: var(--warning); }
.time { position: relative; color: var(--text-muted); font-family: var(--font-mono); }
.time i { position: absolute; left: 0; bottom: -3px; height: 3px; border-radius: 2px; background: var(--warning); opacity: .7; }
</style>
