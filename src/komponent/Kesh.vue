<script setup>
// TanStack Query keshi «javon» ko'rinishida: har kalit — bitta quti, rangi holatini bildiradi (yangi, eskirgan,
// yuklanmoqda, nofaol), nechta komponent kuzatayotgani va yangiligi qancha qolgani. Pastida — tarmoq so'rovlari.
import { computed } from 'vue'

const props = defineProps({ kesh: Array, toplamlar: Array })

function holati(q) {
  if (q.fetchStatus === 'fetching') return { nom: 'yuklanmoqda', izoh: 'serverdan so‘ralmoqda', rang: 'kok' }
  if (q.status === 'error') return { nom: 'xato', izoh: 'so‘rov muvaffaqiyatsiz', rang: 'qizil' }
  if (q.status === 'pending') return { nom: 'kutilmoqda', izoh: 'hali ma’lumot yo‘q', rang: 'kul' }
  if (!q.kuzatuvchi) return { nom: 'nofaol', izoh: `hech kim ishlatmayapti — ${Math.round(q.gcTime / 1000)} s dan keyin o‘chiriladi`, rang: 'kul' }
  if (q.eskirgan) return { nom: 'eskirgan', izoh: 'keyingi safar fonda qayta so‘raladi', rang: 'sariq' }
  return { nom: 'yangi', izoh: 'qayta so‘ralmaydi', rang: 'yashil' }
}
// yangilik (staleTime) qancha qoldi: 0..1
function qoldi(q) {
  if (q.status !== 'success' || !isFinite(q.staleTime) || q.staleTime <= 0) return null
  return Math.max(0, Math.min(1, 1 - (q.hozir - q.yangilangan) / q.staleTime))
}
const sorovlar = computed(() => {
  const m = new Map()
  for (const t of props.toplamlar) for (const e of t.ev) if (e.k === 'tarmoq') m.set(e.id, { ...m.get(e.id), ...(e.faza === 'yuborildi' ? { url: e.url } : { ms: e.ms, ok: e.ok }), id: e.id })
  return [...m.values()].slice(-6).reverse()
})
</script>

<template>
  <div class="kesh">
    <div class="izoh">
      <span><i class="yashil" /> yangi</span><span><i class="sariq" /> eskirgan</span><span><i class="kok" /> yuklanmoqda</span><span><i class="kul" /> nofaol</span>
    </div>
    <h4>Kesh javoni <small>QueryCache</small></h4>
    <div v-for="q in kesh" :key="q.kalit" class="quti" :class="holati(q).rang">
      <div class="bosh">
        <code class="kalit">{{ q.kalit }}</code>
        <span class="pill">{{ holati(q).nom }}</span>
        <span class="koz" :title="`${q.kuzatuvchi} ta komponent kuzatyapti`">👁 {{ q.kuzatuvchi }}</span>
      </div>
      <p class="hiz">{{ holati(q).izoh }}</p>
      <div v-if="qoldi(q) != null" class="bar" :title="`yangilik: staleTime ${q.staleTime / 1000} s`"><span :style="{ width: `${qoldi(q) * 100}%` }" /></div>
      <p class="data">{{ q.data }}</p>
    </div>
    <p v-if="!kesh.length" class="bosh-m">Kesh bo‘sh. Ma’lumotni so‘raydigan komponent ekranga chiqsa, shu yerda quti paydo bo‘ladi.</p>
    <h4>Tarmoq <small>serverga so‘rovlar</small></h4>
    <div v-for="s in sorovlar" :key="s.id" class="sorov" :class="{ kutyapti: s.ms == null }">
      <code>GET {{ s.url }}</code>
      <span>{{ s.ms == null ? 'kutilmoqda…' : `${(s.ms / 1000).toFixed(1)} s` }}</span>
    </div>
    <p v-if="!sorovlar.length" class="bosh-m">Hali so‘rov yuborilmadi.</p>
  </div>
</template>

<style scoped>
.kesh { overflow: auto; padding: 12px 14px; }
.izoh { display: flex; flex-wrap: wrap; gap: 4px 14px; margin-bottom: 10px; color: var(--text-subtle); font-size: 11.5px; }
.izoh i { display: inline-block; width: 10px; height: 10px; margin-right: 4px; border-radius: 3px; vertical-align: -1px; }
i.yashil { background: #2fbf71; } i.sariq { background: #f5a524; } i.kok { background: #3b82f6; } i.kul { background: #9aa3b2; }
h4 { margin: 12px 0 8px; color: var(--text-subtle); font-size: 11.5px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
h4 small { text-transform: none; font-weight: 400; }
.quti { margin-bottom: 8px; padding: 8px 10px; border: 2px solid var(--border-strong); border-left-width: 6px; border-radius: 10px; background: var(--bg-elevated); transition: border-color .3s; }
.quti.yashil { border-color: #2fbf71; } .quti.sariq { border-color: #f5a524; } .quti.kok { border-color: #3b82f6; } .quti.kul { border-color: #9aa3b2; } .quti.qizil { border-color: var(--danger); }
.bosh { display: flex; align-items: center; gap: 8px; }
.kalit { font: 600 13px var(--font-mono); }
.pill { padding: 0 8px; border-radius: 10px; background: var(--bg-sunken); font-size: 12px; font-weight: 600; }
.koz { margin-left: auto; color: var(--text-muted); font-size: 12.5px; }
.hiz { margin: 4px 0; color: var(--text-muted); font-size: 12.5px; }
.bar { height: 5px; border-radius: 3px; background: var(--bg-sunken); overflow: hidden; }
.bar span { display: block; height: 100%; background: #2fbf71; transition: width .5s linear; }
.data { margin: 6px 0 0; color: var(--text-subtle); font: 11.5px var(--font-mono); word-break: break-word; }
.sorov { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 5px; padding: 5px 9px; border-radius: 6px; background: var(--bg-sunken); font-size: 12.5px; }
.sorov.kutyapti { background: repeating-linear-gradient(45deg, #3b82f622 0 8px, transparent 8px 16px); animation: oqim 1s linear infinite; background-size: 22px 22px; }
@keyframes oqim { to { background-position: 22px 0; } }
.sorov code { font: 12px var(--font-mono); }
.bosh-m { color: var(--text-subtle); font-size: 12.5px; }
</style>
