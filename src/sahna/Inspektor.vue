<script setup>
// Paket inspektori: qatlamlar chizig'i, maydonlar daraxti (o'zbekcha izoh + RFC havolasi), hex dump + ASCII.
// Maydon ustiga kelinsa — baytlari belgilanadi; baytni bosish — uni o'z ichiga olgan eng ichki maydon.
// "Kalit bilan ochish" (TLS): paketda `ochiq` bo'lsa — almashtirgich; yoqilganda daraxt laboratoriya kaliti bilan ochilgan
// ko'rinishga o'tadi. Ochilgan maydonlar shifrlangan baytlarga mos kelmaydi — hex ustida belgilanmaydi.
// docs/vizualizator/paket-yoli.md 1.5
import { computed, ref, watch } from 'vue'
import MaydonQator from './MaydonQator.vue'
import { maydonIzohi, QATLAMLAR } from './paket/maydonlar.js'

const props = defineProps({ paket: Object, yorliq: String, rang: String, yozuvNuqta: String, bor: { type: Object, default: () => ({}) } })
const emit = defineEmits(['yop', 'oldingi', 'keyingi'])

const tanlangan = ref(null)
const ustida = ref(null)
// paketdan paketga o'tganda ham saqlanadi
const ochiqRejim = ref(false)
const ochiq = computed(() => ochiqRejim.value && !!props.paket?.ochiq)
const daraxt = computed(() => (ochiq.value ? props.paket.ochiq.qatlamlar : props.paket?.qatlamlar) ?? [])
watch(() => [props.paket?.n, ochiq.value], () => { tanlangan.value = daraxt.value[daraxt.value.length - 1] ?? null; ustida.value = null }, { immediate: true })

const baytlar = computed(() => (props.paket?.hex ?? '').match(/../g)?.map((h) => parseInt(h, 16)) ?? [])
const qatlamlar = computed(() => daraxt.value.map((q) => ({ ...q, info: QATLAMLAR[q.k] })))
const jami = computed(() => baytlar.value.length || 1)

const belgi = computed(() => ustida.value ?? tanlangan.value)
const ichida = (i) => !ochiq.value && belgi.value && belgi.value.len > 0 && i >= belgi.value.pos && i < belgi.value.pos + belgi.value.len

function engIchki(i) {
  if (ochiq.value) return tanlangan.value
  let topildi = null
  const yur = (f) => {
    if (f.len > 0 && i >= f.pos && i < f.pos + f.len) { topildi = f; (f.m ?? []).forEach(yur) }
  }
  props.paket.qatlamlar.forEach(yur)
  return topildi
}
const qatorlar = computed(() => {
  const out = []
  for (let i = 0; i < baytlar.value.length; i += 16) out.push(i)
  return out
})
const h2 = (b) => b.toString(16).padStart(2, '0')
const asc = (b) => (b >= 32 && b < 127 ? String.fromCharCode(b) : '·')

const izoh = computed(() => {
  const f = tanlangan.value
  if (!f) return null
  return maydonIzohi(f) ?? QATLAMLAR[f.k] ?? null
})
const qatlamFoiz = (q) => `${Math.max(6, (q.len / jami.value) * 100)}%`
</script>

<template>
  <section class="inspektor" aria-label="Paket inspektori">
    <header class="i-bosh">
      <span :class="['rn', rang ?? 'boshqa']">{{ paket.n }}</span>
      <div class="i-sar">
        <strong>{{ yorliq || (ochiq ? paket.ochiq.info : paket.info) }}</strong>
        <span class="mono">{{ paket.t.toFixed(3) }} s · {{ paket.src }} → {{ paket.dst }} · {{ paket.proto }} · {{ paket.len }} B</span>
      </div>
      <div class="i-tug">
        <button class="kv" :disabled="!bor.oldingi" aria-label="Oldingi paket" @click="emit('oldingi')">‹</button>
        <button class="kv" :disabled="!bor.keyingi" aria-label="Keyingi paket" @click="emit('keyingi')">›</button>
        <button class="kv" aria-label="Yopish (Esc)" @click="emit('yop')">✕</button>
      </div>
    </header>

    <div class="yozuv-nuqta">{{ yozuvNuqta ?? 'Klient tomonida yozilgan (uy tarmog‘i)' }} · har bayt haqiqiy yozuvdan</div>
    <div v-if="paket.ochiq" :class="['kalit', { yoqiq: ochiq }]">
      <label><input v-model="ochiqRejim" type="checkbox" /> <strong>Kalit bilan ochish</strong></label>
      <span v-if="ochiq">Bu kalit faqat shu laboratoriya yozuvida saqlangan (klient uni <code>SSLKEYLOGFILE</code> ga yozdi). Tarmoqdagi boshqa odamda u yo‘q — u faqat shifrlangan baytlarni ko‘radi.</span>
      <span v-else>Hozir — tarmoqdagi kuzatuvchi ko‘radigan holat: mazmun shifrlangan.</span>
    </div>
    <div class="qatlam-chiziq">
      <button v-for="q in qatlamlar" :key="q.k + q.pos" :style="{ width: qatlamFoiz(q) }" :class="['qc', q.k, { tanlangan: tanlangan === q }]"
              @click="tanlangan = daraxt.find((x) => x.k === q.k && x.pos === q.pos)"
              @mouseenter="ustida = daraxt.find((x) => x.k === q.k && x.pos === q.pos)" @mouseleave="ustida = null">
        <span>{{ q.info?.nom ?? q.k }}</span><small>{{ q.len }} B</small>
      </button>
    </div>

    <div class="i-tana">
      <ul class="daraxt">
        <MaydonQator v-for="(q, i) in daraxt" :key="i" :f="q" :tanlangan="tanlangan" @tanla="tanlangan = $event" @ustida="ustida = $event" />
      </ul>
      <div class="o-ustun">
        <div class="izoh-quti">
          <template v-if="izoh">
            <strong>{{ izoh.nom }}</strong>
            <p>{{ izoh.izoh }}</p>
            <a v-if="izoh.manba?.url" :href="izoh.manba.url" target="_blank" rel="noopener">{{ izoh.manba.nom }} ↗</a>
            <p v-if="izoh.misol" class="misol-izoh">misol — bu yozuvdagi qiymat, har safar boshqacha bo‘ladi.</p>
          </template>
          <p v-else-if="tanlangan" class="muted">{{ tanlangan.s }}</p>
          <p v-else class="muted">Maydonni tanlang — izohi shu yerda.</p>
        </div>
        <div class="hex" aria-label="Baytlar">
          <div class="hex-sar"><span>BAYTLAR</span><span class="muted">{{ baytlar.length }} bayt</span></div>
          <p v-if="ochiq" class="hex-izoh">Simdagi baytlar shifrlangan holicha — ochilgan maydonlar ularga to‘g‘ridan-to‘g‘ri mos kelmaydi.</p>
          <div v-for="o in qatorlar" :key="o" class="hq">
            <span class="ofs">{{ o.toString(16).padStart(4, '0') }}</span>
            <span class="hh">
              <span v-for="i in Math.min(16, baytlar.length - o)" :key="i" :class="{ b: ichida(o + i - 1) }" @click="tanlangan = engIchki(o + i - 1)">{{ h2(baytlar[o + i - 1]) }}</span>
            </span>
            <span class="aa">
              <span v-for="i in Math.min(16, baytlar.length - o)" :key="i" :class="{ b: ichida(o + i - 1) }" @click="tanlangan = engIchki(o + i - 1)">{{ asc(baytlar[o + i - 1]) }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.inspektor { display: flex; flex-direction: column; height: 100%; min-height: 0; background: var(--bg-elevated); }
.i-bosh { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-bottom: 1px solid var(--border); }
.i-sar { display: grid; flex: 1; min-width: 0; }
.i-sar strong { font-family: var(--font-mono); font-size: 14px; }
.i-sar span { color: var(--text-muted); font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.i-tug { display: flex; gap: 6px; }
.kv { width: 30px; height: 30px; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); background: var(--bg-elevated); color: var(--text); font-size: 15px; cursor: pointer; }
.kv:disabled { opacity: .4; cursor: default; }
.kv:not(:disabled):hover { border-color: var(--accent); color: var(--accent-text); }
.yozuv-nuqta { padding: 6px 14px 0; color: var(--text-subtle); font-size: 11.5px; }
.kalit { display: grid; gap: 2px; margin: 6px 14px 0; padding: 6px 10px; border: 1px dashed var(--border-strong); border-radius: var(--radius-sm); font-size: 12px; color: var(--text-muted); }
.kalit label { display: flex; align-items: center; gap: 6px; color: var(--text); cursor: pointer; }
.kalit.yoqiq { border-style: solid; border-color: var(--warning); background: color-mix(in srgb, var(--warning) 8%, transparent); }
.kalit code { font-size: 11px; }
.hex-izoh { margin: 0 0 6px; color: var(--warning); font: 12px var(--font-sans); }
.qatlam-chiziq { display: flex; gap: 3px; padding: 6px 14px 10px; border-bottom: 1px solid var(--border); }
.qc { display: grid; min-width: 0; padding: 4px 6px; border: 0; border-top: 4px solid var(--border-strong); background: none; color: var(--text); text-align: left; cursor: pointer; }
.qc span { overflow: hidden; font: 700 11px var(--font-mono); text-overflow: ellipsis; white-space: nowrap; }
.qc small { color: var(--text-subtle); font: 500 10.5px var(--font-mono); }
.qc.eth { border-color: var(--text-subtle); } .qc.ip { border-color: var(--info); } .qc.tcp, .qc.udp { border-color: var(--insight); }
.qc.dns, .qc.http, .qc.tls { border-color: var(--warning); } .qc.data-text-lines, .qc.data { border-color: var(--success); }
.qc.tanlangan { background: var(--accent-soft); }
.i-tana { flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); }
.daraxt { margin: 0; padding: 8px 6px; overflow: auto; border-right: 1px solid var(--border); }
.o-ustun { display: flex; flex-direction: column; min-height: 0; }
.izoh-quti { padding: 10px 14px; border-bottom: 1px solid var(--border); background: var(--bg-sunken); font-size: 13px; min-height: 92px; }
.izoh-quti strong { display: block; margin-bottom: 4px; }
.izoh-quti p { margin: 0 0 6px; color: var(--text); line-height: 1.5; }
.izoh-quti a { color: var(--accent-text); font-size: 12px; }
.misol-izoh { color: var(--warning) !important; font-size: 12px; }
.muted { color: var(--text-subtle) !important; }
.hex { flex: 1; overflow: auto; padding: 8px 14px; font: 12px/1.6 var(--font-mono); }
.hex-sar { display: flex; justify-content: space-between; margin-bottom: 4px; color: var(--text-subtle); font: 700 10.5px var(--font-sans); letter-spacing: .07em; }
.hq { display: flex; gap: 14px; white-space: nowrap; }
.ofs { color: var(--text-subtle); }
.hh span { display: inline-block; width: 2.6ch; cursor: pointer; }
.aa span { cursor: pointer; }
.hh span.b, .aa span.b { background: var(--accent-soft); color: var(--accent-text); font-weight: 700; }
.mono { font-family: var(--font-mono); }
.rn { display: inline-grid; place-items: center; min-width: 26px; height: 26px; padding: 0 5px; border-radius: 13px; color: var(--bg); font: 700 12px var(--font-mono); box-sizing: border-box; }
.rn.sorov { background: var(--info); } .rn.javob { background: var(--success); } .rn.ulanish { background: var(--insight); }
.rn.ogoh { background: var(--warning); } .rn.xato { background: var(--danger); } .rn.boshqa { background: var(--text-subtle); }
@media (max-width: 900px) {
  .i-tana { grid-template-columns: 1fr; grid-template-rows: auto auto; overflow: auto; }
  .daraxt { border-right: 0; border-bottom: 1px solid var(--border); overflow: visible; }
  .hex { overflow-x: auto; }
}
</style>
