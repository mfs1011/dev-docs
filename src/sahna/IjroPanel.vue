<script setup>
// Ijro boshqaruvi: tezlik, orqaga, ijro/pauza, bittadan, qaytadan.
import { TEZLIKLAR } from './ijro.js'
defineProps({ ijroda: Boolean, tezlik: Number, bittaNom: { type: String, default: 'Bitta' } })
const emit = defineEmits(['ijro', 'bitta', 'oldingi', 'qayta', 'tezlik'])
</script>

<template>
  <div class="ijro" role="group" aria-label="Ijro">
    <select class="tz" :value="tezlik" aria-label="Tezlik ([ va ])" @change="emit('tezlik', +$event.target.value)">
      <option v-for="t in TEZLIKLAR" :key="t" :value="t">{{ t }}×</option>
    </select>
    <button class="i-t" aria-label="Oldingi qadam (←)" @click="emit('oldingi')">‹</button>
    <button class="i-t asosiy" :aria-label="ijroda ? 'Pauza (Space)' : 'Ijro (Space)'" @click="emit('ijro')">
      <span aria-hidden="true">{{ ijroda ? '❚❚' : '▶' }}</span> {{ ijroda ? 'Pauza' : 'Ijro' }}
    </button>
    <button class="i-t" :title="`${bittaNom} (S)`" @click="emit('bitta')">{{ bittaNom }}</button>
    <button class="i-t" aria-label="Boshidan (R)" title="Boshidan (R)" @click="emit('qayta')">↺</button>
  </div>
</template>

<style scoped>
.ijro { display: flex; gap: 6px; align-items: center; }
.i-t, .tz { height: 32px; padding: 0 12px; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); background: var(--bg-elevated); color: var(--text); font: 600 12.5px var(--font-sans); cursor: pointer; }
.tz { padding: 0 6px; }
.i-t:hover { border-color: var(--accent); }
.i-t.asosiy { min-width: 96px; border-color: var(--accent); background: var(--accent); color: var(--bg); }
</style>
