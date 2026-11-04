<script setup>
// Xaritadagi bitta komponent qutisi: nomi, necha marta chizilgani, o'z ma'lumotlari, otasidan kelgan props
// va ichidagi bola komponentlar (o'zi kabi qutilar). Oxirgi hodisada o'zgargan narsa yonadi.
import { computed } from 'vue'

const props = defineProps({ node: Object, bolalar: Map, chaqnash: Map, ozgarish: Object, fw: String })

const holat = computed(() => props.chaqnash.get(props.node.id))
const kids = computed(() => props.bolalar.get(props.node.id) ?? [])
const yondi = (k) => props.ozgarish?.m.get(props.node.id)?.has(k) || (props.fw === 'vue' && props.ozgarish?.setlar.has(k))
const holatProps = computed(() => props.node.props.filter(([k]) => k !== 'children' && k !== 'key'))
const TUR = { ref: 'ref', computed: 'ƒ', reactive: 'obyekt', state: '' }
</script>

<template>
  <div class="quti" :class="[holat?.tur && `h-${holat.tur}`]">
    <span v-if="holat" :key="holat.seq" class="nur" :class="holat.tur" />
    <div class="bosh">
      <span class="ism">&lt;{{ node.name }}&gt;</span>
      <span v-if="node.memo" class="memo">memo</span>
      <span class="son" :title="`${node.renders} marta qayta chizildi`">{{ node.renders ? `${node.renders}× chizildi` : 'yangi' }}</span>
      <span v-if="holat?.tur === 'skip'" :key="'s' + holat.seq" class="skip">⏭ o‘tkazildi</span>
    </div>
    <div v-if="holatProps.length" class="qator">
      <span class="yorliq" title="Otasidan kelgan qiymatlar (props)">otasidan ⬇</span>
      <span v-for="[k, v] in holatProps" :key="k + (yondi(k) ? ozgarish.seq : '')" class="chip prop" :class="{ yon: yondi(k) }"><b>{{ k }}</b> {{ v }}</span>
    </div>
    <div v-if="node.state.length" class="qator">
      <span class="yorliq" :title="fw === 'vue' ? 'Komponentning o‘z reaktiv qiymatlari' : 'Komponentning o‘z state’i'">{{ fw === 'vue' ? 'ma’lumoti' : 'state' }}</span>
      <span v-for="[k, v, t] in node.state" :key="k + (yondi(k) ? ozgarish.seq : '')" class="chip st" :class="{ yon: yondi(k) }"><i v-if="TUR[t]">{{ TUR[t] }}</i><b>{{ k }}</b> {{ v }}</span>
    </div>
    <div v-if="node.effektlar?.length" class="qator">
      <span class="yorliq" title="Komponentdagi useEffect'lar">effektlar</span>
      <span v-for="e in node.effektlar" :key="e.qator" class="chip ef">⚡ {{ e.qator }}-qator: {{ e.ishladi }}× ishladi<template v-if="e.tozalandi">, {{ e.tozalandi }}× tozalandi</template></span>
    </div>
    <div v-if="kids.length" class="bolalar">
      <XaritaQuti v-for="k in kids" :key="k.id" :node="k" :bolalar="bolalar" :chaqnash="chaqnash" :ozgarish="ozgarish" :fw="fw" />
    </div>
  </div>
</template>

<style scoped>
.quti { position: relative; flex: 1 1 180px; min-width: 0; padding: 8px 10px 10px; border: 2px solid var(--border-strong); border-radius: 10px; background: var(--bg-elevated); }
.quti .quti { background: var(--bg); }
.quti .quti .quti { background: var(--bg-elevated); }
.nur { position: absolute; inset: -2px; border-radius: 10px; pointer-events: none; animation: nur 1.8s ease-out forwards; }
.nur.render { box-shadow: 0 0 0 3px #2fbf71, inset 0 0 0 999px #2fbf7122; }
.nur.mount { box-shadow: 0 0 0 3px #3b82f6, inset 0 0 0 999px #3b82f622; }
.nur.skip { border: 2px dashed #8a94a6; }
@keyframes nur { 0%, 40% { opacity: 1; } 100% { opacity: 0; } }
.bosh { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.ism { font: 700 13px var(--font-mono); color: var(--accent-text); }
.memo { padding: 0 6px; border: 1px solid var(--border-strong); border-radius: 10px; color: var(--text-subtle); font-size: 11px; }
.son { margin-left: auto; color: var(--text-subtle); font-size: 11.5px; }
.skip { padding: 0 6px; border: 1px dashed var(--border-strong); border-radius: 4px; color: var(--text-subtle); font-size: 11.5px; animation: nur 2.4s ease-out forwards; }
.qator { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; margin-top: 6px; }
.yorliq { color: var(--text-subtle); font-size: 11px; }
.chip { padding: 1px 7px; border-radius: 6px; font: 12px var(--font-mono); word-break: break-word; }
.chip b { font-weight: 600; }
.chip i { margin-right: 4px; color: var(--text-subtle); font-style: normal; font-size: 10.5px; }
.chip.st { background: var(--success-soft); }
.chip.prop { background: var(--warning-soft); }
.chip.ef { background: #e6efff; }
:root[data-theme='dark'] .chip.ef { background: #172440; }
.chip.yon { animation: yon 1.8s ease-out; }
@keyframes yon { 0%, 35% { box-shadow: 0 0 0 2px #f5a524; background: #f5a52455; } 100% { box-shadow: none; } }
.bolalar { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
</style>
