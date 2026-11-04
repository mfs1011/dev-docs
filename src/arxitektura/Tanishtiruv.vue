<script setup>
// Simulyator bilan birinchi tanishuv: ekranning bitta qismi yoritiladi (qolgani xiralashadi), yonida oddiy
// tilda izoh. Ba'zi qadamlarda o'quvchi o'zi harakat qiladi — shart bajarilganda keyingi qadamga o'zi o'tadi.
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({ qadamlar: Array, holat: Object })
const emit = defineEmits(['yop'])

const i = ref(0)
const q = computed(() => props.qadamlar[i.value])
const rect = ref(null)
const oyna = ref({ w: innerWidth, h: innerHeight })

// yoritiladigan element joyi — sahifa o'zgarib turadi (sxema, scroll), shuning uchun tez-tez o'lchanadi
function olcha() {
  oyna.value = { w: innerWidth, h: innerHeight }
  const el = q.value?.nishon ? document.querySelector(q.value.nishon) : null
  if (!el) return (rect.value = null)
  const r = el.getBoundingClientRect()
  const p = 6
  rect.value = { x: r.left - p, y: r.top - p, w: r.width + p * 2, h: r.height + p * 2 }
}
let timer
onMounted(() => {
  olcha()
  timer = setInterval(olcha, 150)
})
onBeforeUnmount(() => clearInterval(timer))
watch(i, () => {
  const el = q.value?.nishon && document.querySelector(q.value.nishon)
  el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  olcha()
})

// harakat qadami: shart bajarilsa — biroz kutib (o'quvchi natijani ko'rsin) keyingisiga
const bajarildi = ref(false)
watch(() => props.holat, (h) => {
  if (!q.value?.shart || bajarildi.value) return
  if (q.value.shart(h)) {
    bajarildi.value = true
    setTimeout(() => keyingi(), 1600)
  }
}, { deep: false })
function keyingi() {
  bajarildi.value = false
  if (i.value < props.qadamlar.length - 1) i.value++
  else emit('yop', 'tugadi')
}
function oldingi() {
  bajarildi.value = false
  if (i.value > 0) i.value--
}

// izoh kartasi: yoritilgan joyning ostida yoki ustida, ekrandan chiqmasin
const karta = computed(() => {
  const W = Math.min(380, oyna.value.w - 32)
  const r = rect.value
  if (!r) return { left: `${(oyna.value.w - W) / 2}px`, top: `${oyna.value.h * 0.28}px`, width: `${W}px` }
  const left = Math.max(16, Math.min(oyna.value.w - W - 16, r.x + r.w / 2 - W / 2))
  const pastda = r.y + r.h + 220 < oyna.value.h
  const yon = r.h > oyna.value.h * 0.55 // juda katta joy — yoniga
  if (yon) {
    const chap = r.x > W + 32
    return { left: `${chap ? r.x - W - 16 : Math.min(oyna.value.w - W - 16, r.x + r.w + 16)}px`, top: `${Math.max(16, r.y + 40)}px`, width: `${W}px` }
  }
  return pastda ? { left: `${left}px`, top: `${r.y + r.h + 14}px`, width: `${W}px` } : { left: `${left}px`, top: `${Math.max(16, r.y - 14)}px`, width: `${W}px`, transform: 'translateY(-100%)' }
})
const parts = (s) => (s ?? '').split('`').map((t, k) => ({ t, code: k % 2 === 1 }))
</script>

<template>
  <div class="tanishtiruv" role="dialog" aria-modal="true" :aria-label="q.sarlavha">
    <div v-if="rect" class="teshik" :class="{ harakat: q.shart }" :style="{ left: `${rect.x}px`, top: `${rect.y}px`, width: `${rect.w}px`, height: `${rect.h}px` }" />
    <div v-else class="parda" />
    <div class="karta" :style="karta">
      <p class="raqam">{{ i + 1 }} / {{ qadamlar.length }}</p>
      <h3>{{ q.ikon }} {{ q.sarlavha }}</h3>
      <p v-for="(m, k) in [].concat(q.matn)" :key="k" class="matn"><template v-for="(p, n) in parts(m)" :key="n"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template></p>
      <p v-if="q.shart" class="vazifa" :class="{ ok: bajarildi }">{{ bajarildi ? '✓ Zo‘r! Natijaga qarang…' : `👉 ${q.vazifa}` }}</p>
      <div class="tugmalar">
        <button type="button" class="otkaz" @click="emit('yop', 'otkazildi')">O‘tkazib yuborish</button>
        <span class="joy" />
        <button v-if="i > 0" type="button" @click="oldingi">← Orqaga</button>
        <button v-if="!q.shart" type="button" class="asosiy" @click="keyingi">{{ i === qadamlar.length - 1 ? 'Boshladik!' : 'Keyingi →' }}</button>
        <button v-else-if="!bajarildi" type="button" class="otkaz" @click="keyingi">bajarmasdan o‘tish</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tanishtiruv { position: fixed; inset: 0; z-index: 1000; pointer-events: none; }
.parda { position: absolute; inset: 0; background: rgba(8, 12, 20, .6); pointer-events: auto; }
/* yoritilgan joy: atrofi qorong'i, o'zi ochiq — harakat qadamida bosish mumkin */
.teshik { position: absolute; border-radius: 12px; box-shadow: 0 0 0 9999px rgba(8, 12, 20, .6); outline: 3px solid var(--accent); transition: all .3s ease; pointer-events: none; }
.teshik.harakat { animation: puls 1.6s ease-in-out infinite; }
@keyframes puls { 50% { outline-color: #f5a524; outline-width: 5px; } }
.karta { position: absolute; padding: 14px 16px 12px; border: 1px solid var(--border); border-radius: 14px; background: var(--bg-elevated); box-shadow: 0 12px 40px rgba(0, 0, 0, .35); pointer-events: auto; transition: top .3s, left .3s; }
.raqam { margin: 0; color: var(--text-subtle); font-size: 12px; }
h3 { margin: 4px 0 8px; font-size: 17px; }
.matn { margin: 0 0 8px; color: var(--text-muted); font-size: 14px; line-height: 1.55; }
code { padding: 0 4px; border-radius: 4px; background: var(--bg-sunken); font: 12.5px var(--font-mono); }
.vazifa { margin: 10px 0 4px; padding: 8px 10px; border-radius: 8px; background: var(--warning-soft); font-size: 14px; font-weight: 600; }
.vazifa.ok { background: var(--success-soft); color: var(--success); }
.tugmalar { display: flex; align-items: center; gap: 8px; margin-top: 10px; }
.joy { flex: 1; }
button { padding: 6px 12px; border: 1px solid var(--border-strong); border-radius: 8px; background: var(--bg-elevated); color: var(--text); font: inherit; font-size: 13px; cursor: pointer; }
button.asosiy { border-color: var(--accent); background: var(--accent); color: var(--bg-elevated); font-weight: 600; }
button.otkaz { border-color: transparent; background: none; color: var(--text-subtle); }
button:hover { border-color: var(--accent); }
</style>
