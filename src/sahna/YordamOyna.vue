<script setup>
// "?" — tezkor tugmalar ro'yxati (klaviatura.js dagi bilan bir xil).
defineProps({ guruhlar: Array })
const emit = defineEmits(['yop'])
</script>

<template>
  <div class="fon" @click.self="emit('yop')">
    <div class="oyna" role="dialog" aria-modal="true" aria-label="Tezkor tugmalar">
      <header><strong>Tezkor tugmalar</strong><button aria-label="Yopish" @click="emit('yop')">✕</button></header>
      <section v-for="g in guruhlar" :key="g.nom">
        <h3>{{ g.nom }}</h3>
        <dl><template v-for="[t, ish] in g.tugmalar" :key="t"><dt><kbd v-for="k in t.split(' ')" :key="k">{{ k }}</kbd></dt><dd>{{ ish }}</dd></template></dl>
      </section>
    </div>
  </div>
</template>

<style scoped>
.fon { position: fixed; inset: 0; z-index: 60; display: grid; place-items: center; padding: 16px; background: rgba(10, 14, 20, .45); }
.oyna { width: min(460px, 100%); max-height: calc(100vh - 32px); overflow: auto; padding: 14px 18px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-elevated); box-shadow: var(--shadow-lg); }
header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
header button { border: 0; background: none; color: var(--text-muted); font-size: 16px; cursor: pointer; }
h3 { margin: 12px 0 6px; color: var(--text-subtle); font: 700 10.5px var(--font-sans); letter-spacing: .08em; text-transform: uppercase; }
dl { display: grid; grid-template-columns: auto 1fr; gap: 6px 14px; margin: 0; font-size: 13px; }
dd { margin: 0; color: var(--text-muted); }
kbd { margin-right: 3px; padding: 1px 6px; border: 1px solid var(--border-strong); border-radius: 4px; background: var(--bg-sunken); font: 11.5px var(--font-mono); }
</style>
