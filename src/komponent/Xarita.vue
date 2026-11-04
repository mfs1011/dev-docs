<script setup>
// Xarita: komponentlar sahifadagidek ichma-ich qutilar. Har qutida — o'z ma'lumoti va otasidan kelgan props.
// Hodisadan keyin: chizilgan quti yashil, yaratilgani ko'k, o'tkazib yuborilgani kulrang; o'zgargan qiymat sariq.
import { computed } from 'vue'
import XaritaQuti from './XaritaQuti.vue'

const props = defineProps({ nodes: Array, chaqnash: Map, ozgarish: Object, fw: String })
const bolalar = computed(() => {
  const m = new Map()
  for (const n of props.nodes) m.set(n.parent ?? null, [...(m.get(n.parent ?? null) ?? []), n])
  return m
})
</script>

<template>
  <div class="xarita">
    <div class="izoh">
      <span><i class="r" /> qayta chizildi</span><span><i class="m" /> yaratildi</span><span><i class="s" /> o‘tkazib yuborildi</span><span><i class="o" /> o‘zgargan qiymat</span>
    </div>
    <XaritaQuti v-for="n in bolalar.get(null) ?? []" :key="n.id" :node="n" :bolalar="bolalar" :chaqnash="chaqnash" :ozgarish="ozgarish" :fw="fw" />
    <p v-if="!nodes.length" class="bosh">Ilova ishga tushmoqda…</p>
  </div>
</template>

<style scoped>
.xarita { overflow: auto; padding: 10px 12px 14px; }
.izoh { display: flex; flex-wrap: wrap; gap: 4px 14px; margin-bottom: 10px; color: var(--text-subtle); font-size: 11.5px; }
.izoh i { display: inline-block; width: 10px; height: 10px; margin-right: 4px; border-radius: 3px; vertical-align: -1px; }
.r { background: #2fbf71; } .m { background: #3b82f6; } .s { border: 1.5px dashed #8a94a6; } .o { background: #f5a524; }
.bosh { color: var(--text-subtle); font-size: 13px; }
</style>
