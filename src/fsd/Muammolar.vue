<script setup>
// Steiger topgan muammolar — oddiy tilda: nima bo'ldi, nega yomon, qanday tuzatiladi. Asl Steiger xabari va
// qoida nomi ham ko'rinadi (CI'da shu xabarni ko'rasiz).
import { izoh } from './izohlar.js'

const props = defineProps({ muammolar: Array, tanlangan: Object, yuklanmoqda: Boolean })
const emit = defineEmits(['tanla', 'ochish'])
const tengmi = (a, b) => a && b && a.yol === b.yol && a.qator === b.qator && a.qoida === b.qoida && a.xabar === b.xabar
const parts = (s) => (s ?? '').split('`').map((t, i) => ({ t, code: i % 2 === 1 }))
</script>

<template>
  <div class="muammolar">
    <p v-if="yuklanmoqda" class="holat">Steiger yuklanmoqda…</p>
    <div v-else-if="!muammolar.length" class="toza">
      <span>✅</span>
      <div><b>Muammo yo‘q</b><small>Steiger 17 ta qoidaning birortasi ham buzilmaganini tasdiqladi.</small></div>
    </div>
    <article v-for="(m, i) in muammolar" :key="i" :class="{ on: tengmi(m, tanlangan) }" @click="emit('tanla', m)">
      <header>
        <span class="ikon">{{ izoh(m).ikon }}</span>
        <p><template v-for="(p, k) in parts(izoh(m).sarlavha)" :key="k"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template></p>
      </header>
      <template v-if="tengmi(m, tanlangan)">
        <p class="b"><b>Nega yomon:</b> <template v-for="(p, k) in parts(izoh(m).nega)" :key="k"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template></p>
        <p class="b"><b>Qanday tuzatiladi:</b> <template v-for="(p, k) in parts(izoh(m).qanday)" :key="k"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template></p>
        <p class="asl"><span>fsd/{{ m.qoida }}</span> {{ m.xabar }}</p>
        <button type="button" @click.stop="emit('ochish', m)">📄 {{ m.yol.replace(/^src\//, '') }}{{ m.qator ? `:${m.qator}` : '' }} — ochish</button>
      </template>
    </article>
  </div>
</template>

<style scoped>
.muammolar { overflow: auto; padding: 8px 10px; }
.holat { color: var(--text-subtle); font-size: 13px; }
.toza { display: flex; gap: 10px; align-items: center; padding: 12px; border: 1px solid var(--success); border-radius: 10px; background: var(--success-soft); }
.toza span { font-size: 24px; }
.toza b { display: block; }
.toza small { color: var(--text-muted); }
article { margin-bottom: 8px; padding: 8px 10px; border: 1px solid var(--border); border-left: 4px solid #e5484d; border-radius: 8px; background: var(--bg-elevated); cursor: pointer; }
article.on { border-color: #e5484d; background: var(--danger-soft); }
header { display: flex; gap: 8px; align-items: flex-start; }
.ikon { font-size: 18px; line-height: 1.2; }
header p { margin: 0; font-size: 13.5px; font-weight: 600; line-height: 1.4; }
.b { margin: 6px 0 0 26px; color: var(--text-muted); font-size: 13px; line-height: 1.5; }
.b b { color: var(--text); }
code { padding: 0 4px; border-radius: 4px; background: var(--bg-sunken); font: 12px var(--font-mono); }
.asl { margin: 8px 0 0 26px; padding: 5px 8px; border-radius: 6px; background: var(--code-bg); color: #e6e9f0; font: 11.5px/1.5 var(--font-mono); }
.asl span { color: #ff9ec4; }
button { margin: 8px 0 2px 26px; padding: 3px 9px; border: 1px solid var(--border-strong); border-radius: 6px; background: var(--bg-elevated); color: var(--text); font: 12px var(--font-mono); cursor: pointer; }
</style>
