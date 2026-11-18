<script setup>
// Pastdagi qadamlar relsi: raqam + qisqa nom; o'tilgani belgilanadi.
defineProps({ qadamlar: Array, qi: Number, otilgan: { type: Object, default: () => new Set() } })
const emit = defineEmits(['tanla'])
</script>

<template>
  <ol class="rels" aria-label="Darsdagi qadamlar">
    <li v-for="(q, i) in qadamlar" :key="i" :class="{ joriy: i === qi, otgan: i < qi || otilgan.has(i) }">
      <button :aria-current="i === qi ? 'step' : undefined" :title="q.sarlavha" @click="emit('tanla', i)">
        <span class="r-n">{{ otilgan.has(i) && i !== qi ? '✓' : i + 1 }}</span>
        <span class="r-nom">{{ q.qisqa }}</span>
      </button>
    </li>
  </ol>
</template>

<style scoped>
.rels { display: flex; margin: 0; padding: 0; list-style: none; overflow-x: auto; }
li { flex: 1 0 74px; position: relative; }
li + li::before { content: ''; position: absolute; top: 13px; left: -50%; width: 100%; height: 2px; background: var(--border); }
li.otgan + li::before, li.joriy::before { background: var(--accent); }
button { position: relative; display: grid; justify-items: center; gap: 4px; width: 100%; padding: 0 2px; border: 0; background: none; color: var(--text-muted); font: inherit; cursor: pointer; }
.r-n { display: grid; place-items: center; width: 26px; height: 26px; border: 1.5px solid var(--border-strong); border-radius: 50%; background: var(--bg-elevated); font: 700 11.5px var(--font-mono); }
.otgan .r-n { border-color: var(--accent); background: var(--accent-soft); color: var(--accent-text); }
.joriy .r-n { border-color: var(--accent); background: var(--accent); color: var(--bg); box-shadow: 0 0 0 4px var(--accent-soft); }
.r-nom { font-size: 11.5px; line-height: 1.25; text-align: center; }
.joriy .r-nom { color: var(--text); font-weight: 700; }
@media (max-width: 640px) { li { flex-basis: 34px; } .r-nom { display: none; } .joriy .r-nom { display: block; position: absolute; top: 30px; white-space: nowrap; } .rels { padding-bottom: 18px; } }
</style>
