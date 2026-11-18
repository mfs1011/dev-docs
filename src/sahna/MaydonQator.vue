<script setup>
// Inspektordagi maydonlar daraxtining bitta qatori (ichma-ich). Nom — o'zbekcha (maydonlar.js), qiymat — tshark.
import { computed, ref } from 'vue'
import { MAYDONLAR } from './paket/maydonlar.js'

defineOptions({ name: 'MaydonQator' })
const props = defineProps({ f: Object, tanlangan: Object, chuqurlik: { type: Number, default: 0 } })
const emit = defineEmits(['tanla', 'ustida'])
const ochiq = ref(props.chuqurlik < 1)
const izoh = computed(() => MAYDONLAR[props.f.k])
const qiymat = computed(() => {
  const s = props.f.s ?? ''
  const i = s.indexOf(': ')
  return izoh.value && i > 0 ? s.slice(i + 2) : s
})
const bolalar = computed(() => props.f.m ?? [])
</script>

<template>
  <li>
    <div class="q" :class="{ tanlangan: tanlangan === f, izohli: izoh, hosila: f.len === 0 && chuqurlik > 0 }" :title="f.len === 0 && chuqurlik > 0 ? 'tshark hisoblagan qiymat — paket baytlarida yo‘q' : undefined" :style="{ paddingLeft: 8 + chuqurlik * 14 + 'px' }"
         @click="emit('tanla', f)" @mouseenter="emit('ustida', f)" @mouseleave="emit('ustida', null)">
      <button v-if="bolalar.length" class="och" :aria-label="ochiq ? 'Yopish' : 'Ochish'" @click.stop="ochiq = !ochiq">{{ ochiq ? '▾' : '▸' }}</button>
      <span v-else class="och" />
      <span v-if="izoh" class="nom">{{ izoh.nom }}</span>
      <span class="qiy" :class="{ asl: !izoh }">{{ qiymat }}</span>
      <span v-if="izoh?.misol" class="nishon misol" title="Bu yozuvdagi qiymat — har safar boshqacha">misol</span>
    </div>
    <ul v-if="ochiq && bolalar.length">
      <MaydonQator v-for="(b, i) in bolalar" :key="i" :f="b" :tanlangan="tanlangan" :chuqurlik="chuqurlik + 1"
                   @tanla="emit('tanla', $event)" @ustida="emit('ustida', $event)" />
    </ul>
  </li>
</template>

<style scoped>
li { list-style: none; }
ul { margin: 0; padding: 0; }
.q { display: flex; align-items: baseline; gap: 8px; padding: 3px 8px; border-radius: 5px; cursor: pointer; font-size: 12.5px; line-height: 1.45; }
.q:hover { background: var(--surface-hover); }
.q.tanlangan { background: var(--accent-soft); box-shadow: inset 2px 0 0 var(--accent); }
.och { flex: none; width: 14px; padding: 0; border: 0; background: none; color: var(--text-subtle); font-size: 11px; cursor: pointer; }
.nom { flex: none; color: var(--text); font-weight: 600; }
.qiy { color: var(--text-muted); font-family: var(--font-mono); font-size: 12px; word-break: break-word; }
.qiy.asl { color: var(--text); }
.nishon { flex: none; padding: 0 6px; border-radius: 9px; font: 700 10px var(--font-mono); letter-spacing: .04em; }
.q.hosila { opacity: .6; font-style: italic; }
.misol { background: var(--warning-soft); color: var(--warning); }
</style>
