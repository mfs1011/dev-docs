<script setup>
// Hodisalar jurnali: firehose (publish/deliver) va consumer'lar ishlovi — eng yangisi tepada.
defineProps({ jurnal: { type: Array, required: true } })

const soat = (t) => new Date(t).toLocaleTimeString('uz', { hour12: false })
const exNomi = (n) => (n === '' || n == null ? '(default)' : n)
function matn(x) {
  if (x.t === 'oqim' && x.tur === 'publish') {
    const q = x.navbatlar?.length ? `→ ${x.navbatlar.join(', ')}` : "→ hech qayerga (yo'naltirilmadi)"
    return `publish: ${exNomi(x.nom)} [${(x.kalitlar ?? []).join(', ')}] ${q}`
  }
  if (x.t === 'oqim' && x.tur === 'deliver') return `deliver: ${x.nom}${x.redelivered ? ' (redelivered)' : ''}`
  if (x.t === 'ishlov') return `${x.consumer} (${x.navbat}): ${x.xulq}${x.redelivered ? ', redelivered' : ''}`
  if (x.t === 'consumer-xato') return `${x.consumer}: ${x.xato}`
  return JSON.stringify(x)
}
const sinf = (x) => (x.t === 'oqim' ? x.tur : x.t === 'ishlov' ? `ishlov ${x.xulq}` : 'xato')
</script>

<template>
    <div class="jurnal">
        <h4>Hodisalar <small>— brokerdan (firehose) va consumer'lardan</small></h4>
        <p v-if="!jurnal.length" class="bosh">Hozircha hodisa yo'q. Panel orqali xabar yuboring.</p>
        <ol>
            <li v-for="(x, i) in jurnal" :key="x.vaqt + '-' + i" :class="sinf(x)">
                <time>{{ soat(x.vaqt) }}</time>
                <span>{{ matn(x) }}</span>
                <q v-if="x.tana">{{ x.tana }}</q>
            </li>
        </ol>
    </div>
</template>

<style scoped>
h4 { margin: 0 0 6px; font-size: 13px; }
h4 small { color: var(--text-subtle); font-weight: 400; }
.bosh { margin: 0; color: var(--text-subtle); font-size: 12.5px; }
ol { margin: 0; padding: 0; list-style: none; display: grid; gap: 2px; font: 12px var(--font-mono); }
li { display: flex; gap: 8px; align-items: baseline; padding: 2px 4px; border-radius: 4px; }
time { color: var(--text-subtle); }
q { color: var(--text-muted); quotes: '«' '»'; }
.publish { background: color-mix(in srgb, var(--accent) 8%, transparent); }
.deliver { background: color-mix(in srgb, var(--success) 8%, transparent); }
.ishlov.nack, .ishlov.reject, .xato { background: color-mix(in srgb, var(--danger, #d1495b) 10%, transparent); }
.ishlov.crash { background: color-mix(in srgb, #e3a008 14%, transparent); }
</style>
