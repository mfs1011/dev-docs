<script setup>
// Ombor (Pinia store yoki Zustand): bitta katta quti — ichida ma'lumot (state), hisoblanganlar (getter) va
// amallar (action). Pastida: qaysi komponent ombordan nimani olayotgani. Oxirgi hodisada ishlatilgan amal va
// o'zgargan qiymat yonadi.
import { computed } from 'vue'

const props = defineProps({ omborlar: Array, nodes: Array, toplam: Object, fw: String })

// oxirgi hodisa: chaqirilgan amallar va o'zgargan maydonlar
const faol = computed(() => {
  const ev = props.toplam?.b > 1 ? props.toplam.ev : []
  const amal = new Set(ev.filter((e) => e.k === 'action' || e.k === 'zaction').map((e) => `${e.store}.${e.name}`))
  const maydon = new Set()
  for (const e of ev) {
    if (e.k === 'set' && e.label) maydon.add(e.label.replace(' (ro‘yxat)', '').split(/[[]/)[0].split('.').slice(0, 2).join('.'))
    if (e.k === 'zset') for (const o of e.ozgargan) maydon.add(`${e.store}.${o.k}`)
    if (e.k === 'compute') maydon.add(e.label)
  }
  return { amal, maydon, seq: props.toplam?.b ?? 0 }
})
// Vue: komponent render paytida o'qigan ombor maydonlari; Zustand: selector'lar
function foydalanuvchilar(o) {
  if (props.fw === 'react') return o.tanlovlar.map((t) => ({ komp: t.komp, nima: t.matn, val: t.val }))
  const out = []
  for (const n of props.nodes) {
    const d = (n.deps ?? []).filter((x) => x.startsWith(`${o.id}.`))
    if (d.length) out.push({ komp: n.name, nima: [...new Set(d.map((x) => x.replace(' (ro‘yxat)', '').split(/[[]/)[0]))].join(', ') })
  }
  return out
}
const yon = (k) => faol.value.maydon.has(k)
</script>

<template>
  <div class="omborlar">
    <section v-for="o in omborlar" :key="o.id ?? o.nom" class="ombor">
      <header>
        <span class="ikon">🏪</span>
        <div><b>{{ o.id ?? o.nom }}</b><small>{{ fw === 'vue' ? 'Pinia ombori (store)' : 'Zustand ombori (store)' }} — hamma komponentlar uchun umumiy ma’lumot joyi</small></div>
      </header>
      <div class="ustunlar">
        <div class="ustun">
          <h4>Ma’lumot <small>state</small></h4>
          <p v-for="[k, v] in o.state" :key="k + (yon(`${o.id ?? o.nom}.${k}`) ? faol.seq : '')" class="maydon" :class="{ yon: yon(`${o.id ?? o.nom}.${k}`) }"><b>{{ k }}</b> {{ v }}</p>
        </div>
        <div v-if="o.getters?.length" class="ustun">
          <h4>Hisoblanganlar <small>getters</small></h4>
          <p v-for="[k, v] in o.getters" :key="k + (yon(`${o.id}.${k}`) ? faol.seq : '')" class="maydon g" :class="{ yon: yon(`${o.id}.${k}`) }"><i>ƒ</i><b>{{ k }}</b> {{ v }}</p>
        </div>
        <div class="ustun">
          <h4>Amallar <small>actions</small></h4>
          <p v-for="a in o.actions" :key="a + (faol.amal.has(`${o.id ?? o.nom}.${a}`) ? faol.seq : '')" class="amal" :class="{ yon: faol.amal.has(`${o.id ?? o.nom}.${a}`) }">{{ a }}()</p>
        </div>
      </div>
      <div class="kim">
        <h4>Kim foydalanadi</h4>
        <p v-for="(f, i) in foydalanuvchilar(o)" :key="i"><code>&lt;{{ f.komp }}&gt;</code> <span class="strelka">⬅</span> <code class="nima">{{ f.nima }}</code><span v-if="f.val" class="val"> = {{ f.val }}</span></p>
        <p v-if="!foydalanuvchilar(o).length" class="bosh">Hali hech bir komponent bu ombordan o‘qimadi.</p>
      </div>
    </section>
    <p v-if="!omborlar.length" class="bosh pad">Bu mashqda ombor yo‘q.</p>
  </div>
</template>

<style scoped>
.omborlar { overflow: auto; padding: 12px; }
.ombor { margin-bottom: 12px; border: 2px solid #c08a2b; border-radius: 12px; background: var(--bg-elevated); }
header { display: flex; gap: 10px; align-items: center; padding: 10px 12px; border-bottom: 1px solid var(--border); }
.ikon { font-size: 26px; }
header b { display: block; font: 700 15px var(--font-mono); }
header small { color: var(--text-subtle); font-size: 12px; }
.ustunlar { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; padding: 10px 12px; }
h4 { margin: 0 0 6px; color: var(--text-subtle); font-size: 11.5px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
h4 small { text-transform: none; font-weight: 400; letter-spacing: 0; }
.maydon, .amal { margin: 0 0 5px; padding: 4px 8px; border-radius: 6px; font: 12.5px var(--font-mono); word-break: break-word; }
.maydon { background: var(--success-soft); }
.maydon.g { background: #efe9ff; }
.maydon i { margin-right: 4px; color: #7c5ce0; font-style: normal; }
.amal { border: 1px solid var(--border-strong); background: var(--bg-sunken); }
.yon { animation: yon 2s ease-out; }
@keyframes yon { 0%, 40% { box-shadow: 0 0 0 2px #f5a524; background: #f5a52455; } 100% { box-shadow: none; } }
.kim { padding: 8px 12px 10px; border-top: 1px dashed var(--border); }
.kim p { margin: 4px 0; font-size: 12.5px; }
.kim code { font: 600 12px var(--font-mono); color: var(--accent-text); }
.kim .nima { color: var(--text); font-weight: 400; }
.strelka, .val { color: var(--text-subtle); }
.bosh { color: var(--text-subtle); font-size: 12.5px; }
.pad { padding: 4px; }
:root[data-theme='dark'] .maydon.g { background: #2a2350; }
</style>
