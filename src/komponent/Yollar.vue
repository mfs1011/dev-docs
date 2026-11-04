<script setup>
// Vue Router: manzillar jadvali (hozirgi qator yashil) va oxirgi o'tishning yo'li — nazorat punktlari (guard)
// birin-ketin: qaysi biri o'tkazdi, to'xtatdi yoki boshqa joyga yo'naltirdi.
import { computed } from 'vue'

const props = defineProps({ yollar: Array, toplamlar: Array, joriy: String })

const oxirgi = computed(() => [...props.toplamlar].reverse().find((t) => t.ev.some((e) => e.k === 'nav')) ?? null)
const bekatlar = computed(() => (oxirgi.value?.ev ?? []).filter((e) => e.k === 'nav' || e.k === 'guard').map((e) => {
  if (e.k === 'nav' && e.faza === 'boshlandi') return { ikon: '🧭', nom: 'o‘tish', matn: `${e.from ?? '(boshlanish)'} → ${e.to}`, tur: 'bosh' }
  if (e.k === 'nav') return e.ok ? { ikon: '📍', nom: 'ochildi', matn: e.to, tur: 'ok' } : { ikon: '⛔', nom: 'bekor', matn: e.sabab, tur: 'stop' }
  const joy = e.joy === 'global' ? 'global' : e.joy
  if (e.tur === 'ruxsat') return { ikon: '🚦', nom: e.nom, matn: `${joy} · ✓ o‘tkazdi`, tur: 'ok' }
  if (e.tur === 'bekor') return { ikon: '⛔', nom: e.nom, matn: `${joy} · to‘xtatdi`, tur: 'stop' }
  if (e.tur === 'yonaltirdi') return { ikon: '↪️', nom: e.nom, matn: `${joy} · → ${e.manzil}`, tur: 'yon' }
  return { ikon: '💥', nom: e.nom, matn: `${joy} · xato`, tur: 'stop' }
}))
// yo'l shabloni hozirgi manzilga mosmi (/mahsulot/:id ↔ /mahsulot/2)
const mos = (path) => new RegExp('^' + path.replace(/:[^/]+/g, '[^/]+') + '/?$').test(props.joriy ?? '')
</script>

<template>
  <div class="yollar">
    <h4>Oxirgi o‘tish — nazorat punktlari</h4>
    <div v-if="bekatlar.length" :key="oxirgi.b" class="bekatlar">
      <template v-for="(b, i) in bekatlar" :key="i">
        <span v-if="i" class="ok-strelka" :style="{ animationDelay: `${i * 0.3}s` }">→</span>
        <div class="bekat" :class="b.tur" :style="{ animationDelay: `${i * 0.3}s` }">
          <span class="ikon">{{ b.ikon }}</span>
          <b>{{ b.nom }}</b>
          <small>{{ b.matn }}</small>
        </div>
      </template>
    </div>
    <p v-else class="bosh">Havolani bosing — o‘tish shu yerda bosqichma-bosqich ko‘rinadi.</p>
    <h4>Manzillar jadvali <small>(routes)</small></h4>
    <table>
      <thead><tr><th>Yo‘l (path)</th><th>Komponent</th><th>meta</th></tr></thead>
      <tbody>
        <tr v-for="y in yollar" :key="y.path" :class="{ on: mos(y.path) }">
          <td><code>{{ y.path }}</code></td>
          <td><code>&lt;{{ y.komponent }}&gt;</code></td>
          <td>{{ y.meta.join(', ') }}</td>
        </tr>
      </tbody>
    </table>
    <p class="izoh">Yashil qator — hozir ochiq sahifa. <code>:id</code> kabi qism — parametr: manzildagi istalgan qiymat unga tushadi.</p>
  </div>
</template>

<style scoped>
.yollar { overflow: auto; padding: 12px 14px; }
h4 { margin: 0 0 8px; color: var(--text-subtle); font-size: 11.5px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
h4 small { text-transform: none; font-weight: 400; }
.bekatlar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 18px; }
.bekat, .ok-strelka { opacity: 0; animation: chiq .4s ease-out forwards; }
@keyframes chiq { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: none; } }
.bekat { display: grid; justify-items: center; gap: 2px; min-width: 96px; padding: 8px 10px; border: 2px solid var(--border-strong); border-radius: 10px; background: var(--bg-elevated); text-align: center; }
.bekat .ikon { font-size: 20px; }
.bekat b { font: 600 12px var(--font-mono); }
.bekat small { color: var(--text-muted); font-size: 11.5px; }
.bekat.ok { border-color: var(--success); background: var(--success-soft); }
.bekat.stop { border-color: var(--danger); background: var(--danger-soft); }
.bekat.yon { border-color: #f5a524; background: var(--warning-soft); }
.ok-strelka { color: var(--text-subtle); font-size: 18px; }
table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
th, td { padding: 5px 8px; border-bottom: 1px solid var(--border); text-align: left; }
th { color: var(--text-subtle); font-weight: 600; }
tr.on td { background: var(--success-soft); }
tr.on td:first-child { box-shadow: inset 3px 0 var(--success); }
code { font: 12px var(--font-mono); }
.bosh, .izoh { color: var(--text-subtle); font-size: 12.5px; }
.izoh { margin-top: 8px; }
</style>
