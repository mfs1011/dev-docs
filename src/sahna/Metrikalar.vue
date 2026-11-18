<script setup>
// Metrikalar qatori. Har kartada manba nishoni: "o'lchangan" (VPS laboratoriyasi) yoki "model" (taxminiy).
// docs/vizualizator/tizim-dizayni.md 1.3
defineProps({ royxat: Array, qiymatlar: Object, manba: Object })
const qiymat = (m, v) => (v == null ? '—' : m.format ? m.format(v) : String(v))
</script>

<template>
  <div class="metr">
    <div v-for="m in royxat" :key="m.k" :class="['mk', qiymatlar[m.k]?.holat ?? 'neytral']">
      <span class="mk-sar">{{ m.nom }}</span>
      <strong class="mk-q">{{ qiymat(m, qiymatlar[m.k]?.v) }}</strong>
      <span v-if="qiymatlar[m.k]?.manba" :class="['mk-manba', qiymatlar[m.k].manba]"
            :title="qiymatlar[m.k].manba === 'olchangan' ? manba?.olchangan : manba?.model">{{ qiymatlar[m.k].manba === 'olchangan' ? 'o‘lchangan' : 'model' }}</span>
    </div>
  </div>
</template>

<style scoped>
.metr { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 2px; }
.mk { flex: 1 0 118px; display: grid; gap: 2px; padding: 7px 10px; border: 1px solid var(--border); border-left: 4px solid var(--border-strong); border-radius: var(--radius-sm); background: var(--bg-elevated); }
.mk.ok { border-left-color: var(--success); } .mk.ogoh { border-left-color: var(--warning); } .mk.xato { border-left-color: var(--danger); }
.mk-sar { color: var(--text-subtle); font: 700 10px var(--font-sans); letter-spacing: .07em; text-transform: uppercase; white-space: nowrap; }
.mk-q { font: 700 17px var(--font-mono); color: var(--text); }
.mk-manba { justify-self: start; padding: 0 6px; border-radius: 8px; font: 600 10px var(--font-mono); cursor: help; }
.mk-manba.olchangan { background: var(--success-soft); color: var(--success); }
.mk-manba.model { background: var(--warning-soft); color: var(--warning); }
</style>
