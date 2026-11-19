<script setup>
// Vizual darslar sahifasi ("Sahna" dvigateli): Paket yo'li (/paketlar) va Tizim dizayni darslari (/arxitektura/darslar).
// Reja va qoidalar: docs/vizualizator/README.md
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { DARSLAR, TURLAR, darsTopish } from '@/sahna/darslar/index.js'
import { useIjro, yigilganHolat } from '@/sahna/ijro.js'
import { syncedMap, entryOf, putEntry } from '@/store'
import SahnaSvg from '@/sahna/SahnaSvg.vue'
import KetmaKetlik from '@/sahna/KetmaKetlik.vue'
import PaketJadval from '@/sahna/PaketJadval.vue'
import Inspektor from '@/sahna/Inspektor.vue'
import QadamKarta from '@/sahna/QadamKarta.vue'
import QadamRelsi from '@/sahna/QadamRelsi.vue'
import Metrikalar from '@/sahna/Metrikalar.vue'
import IjroPanel from '@/sahna/IjroPanel.vue'
import YordamOyna from '@/sahna/YordamOyna.vue'
import { mini } from '@/sahna/matn.js'

const progress = syncedMap('sahna', 'docs-sahna-v1')
const route = useRoute()
const router = useRouter()
const tur = computed(() => route.meta.sahna)
const T = computed(() => TURLAR[tur.value])
const royxat = computed(() => DARSLAR.filter((d) => d.tur === tur.value))
const guruhlar = computed(() => {
  const m = new Map()
  for (const d of royxat.value) m.set(d.guruh, [...(m.get(d.guruh) ?? []), d])
  return [...m]
})

const dars = shallowRef(null)
const yuklanmoqda = ref(false)
const ijro = useIjro(dars)
const { qi, faol, qadam, qadamlar, bajarilgan, ijroda, tezlik } = ijro

const kamaytir = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
const korinish = ref(route.query.k === 'ketma' ? 'ketma' : 'tarmoq')
const hammasi = ref(false)
const tanlanganPaket = ref(route.query.p ? +route.query.p : null)
const yordam = ref(false)
const royxatOchiq = ref(false)
const oqimPauza = ref(false)
// Sahna kartalari (hisob, vaqt jadvali) keng sahnada uning ustida, torida — qadam kartasi ichida (tugunlarni yopmasin)
const sahnaPanel = ref(null)
const kengSahna = ref(true)
let sahnaRo = null
watch(sahnaPanel, (el) => {
  sahnaRo?.disconnect()
  if (!el) return
  sahnaRo = new ResizeObserver(([e]) => { kengSahna.value = e.contentRect.width >= 720 })
  sahnaRo.observe(el)
})
onBeforeUnmount(() => sahnaRo?.disconnect())

// ── dars yuklash va URL bilan sinxron ──
async function ochish() {
  const meta = darsTopish(route.params.dars) ?? royxat.value.find((d) => !d.reja)
  if (!meta) return
  if (route.params.dars !== meta.id) {
    router.replace({ path: `${T.value.yol}/${meta.id}` })
    return
  }
  if (dars.value?.id !== meta.id) {
    yuklanmoqda.value = true
    ijro.toxta()
    const mod = await meta.yukla()
    dars.value = mod.default
    yuklanmoqda.value = false
    const q = Math.max(1, Math.min(+(route.query.q || 1), dars.value.qadamlar.length)) - 1
    ijro.qadamga(q, { oynash: false, tugagan: q > 0 })
    royxatOchiq.value = false
  }
}
watch(() => [route.params.dars, tur.value], ochish, { immediate: true })
// URL: /paketlar/<dars>?q=<qadam>&k=ketma&p=<paket> — qadam query'da, chunki App RouterView'ni yo'l bo'yicha qayta yaratadi
watch([qi, korinish, tanlanganPaket], () => {
  if (!dars.value) return
  const query = { ...route.query, q: qi.value > 0 ? String(qi.value + 1) : undefined, k: korinish.value === 'ketma' ? 'ketma' : undefined, p: tanlanganPaket.value ?? undefined }
  if (JSON.stringify(query) !== JSON.stringify({ ...route.query })) router.replace({ query })
})
watch(() => +(route.query.q || 1) - 1, (i) => { if (dars.value && i !== qi.value && i >= 0 && i < qadamlar.value.length) ijro.qadamga(i) })

// ── progress: qadam hodisalari tugasa — o'tilgan ──
const otilgan = computed(() => new Set(entryOf(progress, dars.value?.id)?.otgan ?? []))
watch(() => [ijro.qadamTugadi.value, qi.value, dars.value?.id], ([tugadi, i, id]) => {
  if (!tugadi || !id) return
  const eski = entryOf(progress, id)?.otgan ?? []
  if (!eski.includes(i)) putEntry(progress, id, { otgan: [...eski, i].sort((a, b) => a - b) })
})

// ── yig'ilgan holat ──
const holat = computed(() => (dars.value ? yigilganHolat(dars.value, qi.value, bajarilgan.value) : null))
const yozuv = computed(() => dars.value?.yozuv ?? null)
const yozuvPaket = (n) => yozuv.value?.paketlar.find((p) => p.n === n)
const paketlar = computed(() => bajarilgan.value.filter(({ h }) => h.tur === 'paket')
  .map(({ h, qadam: q, faol: f }) => ({ n: h.n, h, qadam: q, rang: h.rang ?? 'sorov', faol: !!f, p: f ? faol.value?.p ?? 0 : 1 })))
const joriyPaket = computed(() => {
  const f = faol.value?.h.tur === 'paket' ? faol.value.h : null
  const h = f ?? [...bajarilgan.value].reverse().find((b) => b.qadam === qi.value && b.h.tur === 'paket')?.h
  return h ? { h, p: yozuvPaket(h.n) } : null
})
const inspektorPaket = computed(() => (tanlanganPaket.value ? yozuvPaket(tanlanganPaket.value) : null))
const inspektorHodisa = computed(() => dars.value?.qadamlar.flatMap((q) => q.hodisalar ?? []).find((h) => h.tur === 'paket' && h.n === tanlanganPaket.value))
const inspektorQator = computed(() => {
  const ns = hammasi.value ? yozuv.value?.paketlar.map((p) => p.n) ?? [] : paketlar.value.map((p) => p.n)
  const i = ns.indexOf(tanlanganPaket.value)
  return { ns, i }
})
function paketOch(n) {
  tanlanganPaket.value = n
  if (ijroda.value) ijro.ijro()
}
const paketQadam = (d) => {
  const { ns, i } = inspektorQator.value
  if (ns[i + d]) tanlanganPaket.value = ns[i + d]
}
const metrikalar = computed(() => holat.value?.metrikalar ?? {})
const organasiz = computed(() => (dars.value?.organasiz ?? []).map((o) => ({ ...o, ok: otilgan.value.has(o.qadam) || qi.value > o.qadam })))

// ── klaviatura ──
const TUGMALAR = computed(() => [
  { nom: 'Ijro', tugmalar: [['Space', 'ijro / pauza'], ['→', 'keyingi qadam'], ['←', 'oldingi qadam'], ['S', tur.value === 'paket' ? 'bitta paket' : 'bitta hodisa'], ['1 … 9', 'qadamga o‘tish'], ['[ ]', 'sekinroq / tezroq'], ['R', 'boshidan']] },
  { nom: 'Ko‘rinish', tugmalar: [...(tur.value === 'paket' ? [['V', 'tarmoq / ketma-ketlik'], ['A', 'hamma paketlar']] : []), ['L', 'darslar ro‘yxati'], ['?', 'shu oyna']] },
  ...(tur.value === 'paket' ? [{ nom: 'Inspektor', tugmalar: [['← →', 'oldingi / keyingi paket'], ['Esc', 'yopish']] }] : []),
])
function tugma(e) {
  if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest('input, textarea, select, [contenteditable]')) return
  const k = e.key
  if (tanlanganPaket.value) {
    if (k === 'Escape') { tanlanganPaket.value = null; e.preventDefault(); return }
    if (k === 'ArrowLeft') { paketQadam(-1); e.preventDefault(); return }
    if (k === 'ArrowRight') { paketQadam(1); e.preventDefault(); return }
  }
  if (yordam.value && k === 'Escape') { yordam.value = false; return }
  const ish = {
    ' ': () => ijro.ijro(),
    ArrowRight: () => ijro.keyingi(),
    ArrowLeft: () => ijro.oldingi(),
    s: () => ijro.bitta(), S: () => ijro.bitta(),
    r: () => ijro.qayta(), R: () => ijro.qayta(),
    '[': () => ijro.tezlikniOzgartir(-1),
    ']': () => ijro.tezlikniOzgartir(1),
    v: () => tur.value === 'paket' && (korinish.value = korinish.value === 'tarmoq' ? 'ketma' : 'tarmoq'),
    a: () => tur.value === 'paket' && (hammasi.value = !hammasi.value),
    l: () => (royxatOchiq.value = !royxatOchiq.value),
    '?': () => (yordam.value = !yordam.value),
  }[k]
  if (ish) { ish(); e.preventDefault(); return }
  if (/^[1-9]$/.test(k) && +k <= qadamlar.value.length) { ijro.qadamga(+k - 1); e.preventDefault() }
}
onMounted(() => window.addEventListener('keydown', tugma))
onBeforeUnmount(() => { window.removeEventListener('keydown', tugma); ijro.toxta() })
const oynaKo = () => { if (document.hidden && ijroda.value) ijro.ijro() }
onMounted(() => document.addEventListener('visibilitychange', oynaKo))
onBeforeUnmount(() => document.removeEventListener('visibilitychange', oynaKo))
</script>

<template>
  <div class="sahna-app" :class="tur">
    <header class="s-bosh">
      <button class="kv royxat-tug" aria-label="Darslar ro‘yxati (L)" @click="royxatOchiq = !royxatOchiq">☰</button>
      <div class="s-nom">
        <span class="s-tur">{{ T.nom }}</span>
        <strong v-if="dars">{{ dars.sarlavha }}</strong>
      </div>
      <div v-if="dars" class="chiplar">
        <span class="chip">{{ dars.daqiqa }} daqiqa</span>
        <span class="chip">{{ dars.daraja }}</span>
        <span class="chip">{{ dars.qadamlar.length }} qadam</span>
        <span class="chip jim" title="Ovoz keyingi bosqichda (docs/vizualizator/README.md 5)">ovoz: tez orada</span>
      </div>
      <div class="s-ong">
        <div v-if="tur === 'paket'" class="almash" role="tablist" aria-label="Ko‘rinish (V)">
          <button role="tab" :aria-selected="korinish === 'tarmoq'" :class="{ on: korinish === 'tarmoq' }" @click="korinish = 'tarmoq'">Tarmoq</button>
          <button role="tab" :aria-selected="korinish === 'ketma'" :class="{ on: korinish === 'ketma' }" @click="korinish = 'ketma'">Ketma-ketlik</button>
        </div>
        <button class="kv" aria-label="Tezkor tugmalar (?)" @click="yordam = true">?</button>
        <RouterLink class="orqa" :to="T.kitob.yol">← {{ T.kitob.nom }}</RouterLink>
      </div>
    </header>

    <main v-if="dars" class="s-main">
      <aside class="chap" :class="{ ochiq: royxatOchiq }">
        <div class="panel">
          <h2>{{ T.nom }}</h2>
          <p class="t-shior">{{ T.shior }}</p>
          <nav class="royxat">
            <div v-for="[g, ds] in guruhlar" :key="g" class="guruh">
              <span class="g-nom">{{ g }}</span>
              <template v-for="d in ds" :key="d.id">
                <span v-if="d.reja" class="d-q reja" title="Rejada — docs/vizualizator">
                  <b>{{ d.sarlavha }}</b><small>{{ d.izoh }}</small><em>rejada</em>
                </span>
                <RouterLink v-else :to="`${T.yol}/${d.id}`" class="d-q" :class="{ joriy: d.id === dars.id }">
                  <b>{{ d.sarlavha }}</b><small>{{ d.izoh }}</small>
                  <span v-if="entryOf(progress, d.id)" class="d-pr">{{ entryOf(progress, d.id).otgan.length }}/{{ d.id === dars.id ? dars.qadamlar.length : '…' }}</span>
                </RouterLink>
                <ol v-if="d.id === dars.id" class="qadam-royxat">
                  <li v-for="(q, i) in dars.qadamlar" :key="i" :class="{ joriy: i === qi, otgan: otilgan.has(i) }" @click="ijro.qadamga(i)">
                    <span class="qn">{{ otilgan.has(i) && i !== qi ? '✓' : i + 1 }}</span>
                    <span><b>{{ q.qisqa }}</b><small>{{ q.sarlavha }}</small></span>
                  </li>
                </ol>
              </template>
            </div>
          </nav>
        </div>
      </aside>
      <div v-if="royxatOchiq" class="chap-fon" @click="royxatOchiq = false" />

      <section class="orta">
        <Metrikalar v-if="tur === 'tizim'" :royxat="dars.metrikaRoyxat" :qiymatlar="metrikalar" :manba="dars.metrikaManba" />
        <div ref="sahnaPanel" class="panel sahna-panel">
          <Inspektor v-if="inspektorPaket" :paket="inspektorPaket" :yorliq="inspektorHodisa?.yorliq" :rang="inspektorHodisa?.rang"
                     :bor="{ oldingi: inspektorQator.i > 0, keyingi: inspektorQator.i < inspektorQator.ns.length - 1 }"
                     @yop="tanlanganPaket = null" @oldingi="paketQadam(-1)" @keyingi="paketQadam(1)" />
          <KetmaKetlik v-else-if="tur === 'paket' && korinish === 'ketma'" :dars="dars" :yozuv="yozuv" :qatorlar="paketlar" :tanlangan="tanlanganPaket" @tanla="paketOch" />
          <template v-else>
            <SahnaSvg :dars="dars" :korinadi="holat.korinadi" :chiziqlar="holat.chiziqlar" :kamera="holat.kamera" :teglar="holat.teglar" :faol="faol"
                      :yozildi="holat.yozildi" :oqimlar="holat.oqimlar" :jonli="!oqimPauza" :tezlik="tezlik" :kamaytir="kamaytir" />
            <div v-for="(k, i) in (kengSahna ? holat.kartalar : [])" :key="i" :class="['s-karta', k.joy ?? 'past-ong']">
              <span class="c-sar">{{ k.sarlavha }}</span>
              <table><tr v-for="(r, j) in k.qatorlar" :key="j" :class="{ ajrat: r[2] }"><td>{{ r[0] }}</td><td>{{ r[1] }}</td></tr></table>
              <small v-if="k.izoh">{{ k.izoh }}</small>
            </div>
            <div v-if="dars.afsona" class="afsona">
              <span v-for="a in dars.afsona" :key="a.k" :class="['af', a.k]"><i />{{ a.nom }}</span>
              <button v-if="tur === 'tizim'" class="af-tug" @click="oqimPauza = !oqimPauza">{{ oqimPauza ? '▶ oqim' : '❚❚ oqim' }}</button>
            </div>
          </template>
        </div>
        <div class="panel past">
          <div class="past-bosh">
            <template v-if="tur === 'paket'">
              <h2>Paketlar</h2>
              <label class="hammasi"><input v-model="hammasi" type="checkbox" /> hamma paketlar ({{ yozuv?.paketlar.length }})</label>
            </template>
            <h2 v-else>Darsdagi qadamlar</h2>
            <IjroPanel :ijroda="ijroda" :tezlik="tezlik" :bitta-nom="tur === 'paket' ? 'Bitta paket' : 'Bitta qadam'"
                       @ijro="ijro.ijro()" @bitta="tur === 'paket' ? ijro.bitta() : ijro.keyingi()" @oldingi="ijro.oldingi()" @qayta="ijro.qayta()" @tezlik="tezlik = $event" />
          </div>
          <PaketJadval v-if="tur === 'paket'" :yozuv="yozuv" :korsatilgan="paketlar" :hammasi="hammasi" :tanlangan="tanlanganPaket" @tanla="paketOch" />
          <QadamRelsi v-else :qadamlar="qadamlar" :qi="qi" :otilgan="otilgan" @tanla="ijro.qadamga($event)" />
        </div>
      </section>

      <aside class="ong">
        <div class="panel karta-panel">
          <QadamKarta v-if="qadam" :dars="dars" :qadam="qadam" :qi="qi" :jami="qadamlar.length" :joriy-paket="tur === 'paket' ? joriyPaket : null" :kartalar="kengSahna ? [] : holat.kartalar"
                      @oldingi="ijro.oldingi()" @keyingi="ijro.keyingi()" @paket="paketOch" />
        </div>
        <div class="panel kichik">
          <h2>Siz o‘rganasiz</h2>
          <ul class="org">
            <li v-for="(o, i) in organasiz" :key="i" :class="{ ok: o.ok }"><span class="cb">{{ o.ok ? '✓' : '' }}</span>{{ o.matn }}</li>
          </ul>
          <template v-if="dars.protokol">
            <h2>Protokol haqida</h2>
            <p class="pr-izoh" v-html="mini(dars.protokol.izoh)" />
            <table class="pr-f"><tr v-for="[k, v] in dars.protokol.faktlar" :key="k"><th>{{ k }}</th><td>{{ v }}</td></tr></table>
          </template>
          <h2>Manba va sinov</h2>
          <ul class="manba">
            <li v-for="m in dars.manba" :key="m.url"><a :href="m.url" target="_blank" rel="noopener">{{ m.nom }} ↗</a></li>
            <li v-for="b in dars.kitob" :key="b.yol"><RouterLink :to="b.yol">{{ b.nom }}</RouterLink></li>
          </ul>
          <p class="sinov">{{ dars.sinov }}</p>
          <RouterLink v-if="dars.trenajor" class="sina" :to="dars.trenajor.yol">{{ dars.trenajor.nom }} →</RouterLink>
        </div>
      </aside>
    </main>
    <p v-else class="yuk">{{ yuklanmoqda ? 'Yuklanmoqda…' : '' }}</p>

    <YordamOyna v-if="yordam" :guruhlar="TUGMALAR" @yop="yordam = false" />
  </div>
</template>

<style scoped>
.sahna-app { min-height: calc(100vh - var(--topbar-height)); display: flex; flex-direction: column; background: var(--bg); color: var(--text); font-family: var(--font-sans); }
.s-bosh { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 14px; padding: 10px 16px; border-bottom: 1px solid var(--border); background: var(--bg-elevated); }
.s-nom { display: grid; }
.s-tur { color: var(--text-subtle); font: 700 10.5px var(--font-sans); letter-spacing: .08em; text-transform: uppercase; }
.s-nom strong { font-size: 17px; }
.chiplar { display: flex; flex-wrap: wrap; gap: 6px; }
.chip { padding: 2px 10px; border: 1px solid var(--border-strong); border-radius: 12px; font: 600 11.5px var(--font-mono); color: var(--text-muted); }
.chip.jim { border-style: dashed; color: var(--text-subtle); }
.s-ong { display: flex; align-items: center; gap: 8px; margin-left: auto; }
.almash { display: flex; padding: 3px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg-sunken); }
.almash button { padding: 4px 10px; border: 0; border-radius: 4px; background: none; color: var(--text-muted); font: 600 12.5px var(--font-sans); cursor: pointer; }
.almash button.on { background: var(--bg-elevated); color: var(--accent-text); box-shadow: var(--shadow-sm); }
.kv { width: 32px; height: 32px; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); background: var(--bg-elevated); color: var(--text); font: 700 14px var(--font-sans); cursor: pointer; }
.royxat-tug { display: none; }
.orqa { color: var(--text-muted); font-size: 13px; text-decoration: none; white-space: nowrap; }
.orqa:hover { color: var(--accent-text); }

.s-main { flex: none; display: grid; grid-template-columns: 270px minmax(0, 1fr) 360px; grid-template-rows: minmax(0, 1fr); gap: 10px; padding: 10px; height: calc(100vh - var(--topbar-height) - 62px); min-height: 560px; box-sizing: border-box; }
.s-main > * { min-height: 0; }
.panel { min-height: 0; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-elevated); box-shadow: var(--shadow-sm); }
.panel h2 { margin: 0; padding: 10px 14px 6px; color: var(--text-subtle); font: 700 10.5px var(--font-sans); letter-spacing: .08em; text-transform: uppercase; }
.chap .panel { height: 100%; overflow: auto; }
.t-shior { margin: 0; padding: 0 14px 8px; color: var(--text-muted); font-size: 12.5px; }
.royxat { padding: 0 8px 12px; }
.g-nom { display: block; margin: 10px 6px 4px; color: var(--text-subtle); font: 700 10px var(--font-sans); letter-spacing: .08em; text-transform: uppercase; }
.d-q { position: relative; display: grid; gap: 1px; padding: 7px 10px; border-radius: var(--radius-sm); color: var(--text); text-decoration: none; }
.d-q b { font-size: 13.5px; } .d-q small { color: var(--text-muted); font-size: 11.5px; }
a.d-q:hover { background: var(--surface-hover); }
.d-q.joriy { background: var(--accent-soft); box-shadow: inset 3px 0 0 var(--accent); }
.d-q.reja { opacity: .55; }
.d-q.reja em { position: absolute; top: 8px; right: 8px; color: var(--text-subtle); font: 600 10px var(--font-mono); font-style: normal; }
.d-pr { position: absolute; top: 8px; right: 8px; color: var(--accent-text); font: 600 10.5px var(--font-mono); }
.qadam-royxat { margin: 4px 0 8px 12px; padding: 0 0 0 10px; border-left: 2px solid var(--border); list-style: none; }
.qadam-royxat li { display: flex; gap: 8px; padding: 5px 6px; border-radius: 5px; cursor: pointer; }
.qadam-royxat li:hover { background: var(--surface-hover); }
.qadam-royxat li b { display: block; font-size: 12.5px; } .qadam-royxat li small { color: var(--text-muted); font-size: 11px; }
.qn { flex: none; display: grid; place-items: center; width: 20px; height: 20px; border: 1.5px solid var(--border-strong); border-radius: 50%; font: 700 10.5px var(--font-mono); color: var(--text-muted); }
.qadam-royxat li.otgan .qn { border-color: var(--accent); color: var(--accent-text); background: var(--accent-soft); }
.qadam-royxat li.joriy .qn { border-color: var(--accent); background: var(--accent); color: var(--bg); }

.orta { display: flex; flex-direction: column; gap: 10px; min-height: 0; min-width: 0; }
.sahna-panel { position: relative; flex: 1 1 0; min-height: 260px; overflow: hidden; background: var(--bg-sunken); }
.past { flex: 0 0 34%; display: flex; flex-direction: column; overflow: hidden; }
.tizim .past { flex: 0 0 auto; }
.chap { height: 100%; }
.past-bosh { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; padding: 6px 10px 6px 0; border-bottom: 1px solid var(--border); }
.past-bosh h2 { padding: 4px 14px; }
.hammasi { display: flex; gap: 6px; align-items: center; color: var(--text-muted); font-size: 12.5px; cursor: pointer; }
.past-bosh .ijro { margin-left: auto; }
.tizim .past :deep(.rels) { padding: 10px 8px 10px; }
.s-karta { position: absolute; max-width: 300px; padding: 10px 12px; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); background: var(--bg-elevated); box-shadow: var(--shadow-lg); font-size: 12.5px; }
.s-karta.past-ong { right: 12px; bottom: 44px; } .s-karta.past-chap { left: 12px; bottom: 44px; } .s-karta.yuqori-ong { right: 12px; top: 12px; } .s-karta.yuqori-chap { left: 12px; top: 12px; }
.s-karta table { width: 100%; margin-top: 6px; border-collapse: collapse; font-family: var(--font-mono); font-size: 12px; }
.s-karta td { padding: 2px 4px; } .s-karta td:last-child { text-align: right; white-space: nowrap; }
.s-karta tr.ajrat { background: var(--success-soft); font-weight: 700; }
.s-karta small { display: block; margin-top: 6px; color: var(--text-subtle); }
.c-sar { color: var(--text-subtle); font: 700 10.5px var(--font-sans); letter-spacing: .08em; text-transform: uppercase; }
.afsona { position: absolute; left: 12px; bottom: 10px; right: 12px; display: flex; flex-wrap: wrap; gap: 4px 12px; align-items: center; color: var(--text-muted); font-size: 11.5px; }
.af { display: inline-flex; align-items: center; gap: 5px; }
.af i { width: 9px; height: 9px; border-radius: 50%; background: var(--info); }
.af.javob i { background: var(--success); } .af.ulanish i { background: var(--insight); } .af.ogir i { border-radius: 2px; background: var(--warning); }
.af.tekshiruv i { background: none; border: 1.8px solid var(--insight); } .af.xato i { border-radius: 0; background: none; color: var(--danger); }
.af.xato i::before { content: '✕'; font-style: normal; font-size: 10px; line-height: 9px; color: var(--danger); }
.af-tug { margin-left: auto; padding: 2px 8px; border: 1px solid var(--border-strong); border-radius: 5px; background: var(--bg-elevated); color: var(--text-muted); font: 600 11px var(--font-sans); cursor: pointer; }

.ong { display: flex; flex-direction: column; gap: 10px; min-height: 0; }
.karta-panel { flex: 1 1 auto; overflow: auto; padding: 14px; }
.kichik { flex: 0 1 auto; max-height: 42%; overflow: auto; padding-bottom: 10px; }
.org { margin: 0; padding: 0 14px; list-style: none; display: grid; gap: 6px; font-size: 13px; }
.org li { display: flex; gap: 8px; color: var(--text-muted); }
.org li.ok { color: var(--text); }
.cb { flex: none; display: grid; place-items: center; width: 16px; height: 16px; border: 1.5px solid var(--border-strong); border-radius: 4px; font-size: 11px; color: var(--accent-text); }
.org li.ok .cb { border-color: var(--accent); background: var(--accent-soft); }
.pr-izoh { margin: 0; padding: 0 14px 6px; font-size: 13px; line-height: 1.55; }
.pr-f { width: calc(100% - 28px); margin: 0 14px; border-collapse: collapse; font-size: 12px; }
.pr-f th { width: 42%; padding: 5px 6px 5px 0; border-top: 1px solid var(--border); color: var(--text-muted); text-align: left; font-weight: 600; }
.pr-f td { padding: 5px 0; border-top: 1px solid var(--border); font-family: var(--font-mono); }
.manba { margin: 0; padding: 0 14px; list-style: none; display: grid; gap: 4px; font-size: 12.5px; }
.manba a { color: var(--accent-text); }
.sinov { margin: 8px 14px 0; color: var(--text-subtle); font-size: 11.5px; line-height: 1.5; }
.sina { display: inline-block; margin: 8px 14px 0; color: var(--accent-text); font-size: 13px; font-weight: 600; }
.yuk { padding: 40px; color: var(--text-subtle); }
.chap-fon { display: none; }

@media (max-width: 1279px) {
  .s-main { grid-template-columns: minmax(0, 1fr) 340px; }
  .royxat-tug { display: inline-block; }
  .chap { position: fixed; z-index: 50; top: var(--topbar-height); bottom: 0; left: 0; width: min(300px, 86vw); padding: 10px; transform: translateX(-105%); transition: transform .25s ease; }
  .chap.ochiq { transform: none; }
  .chap-fon { display: block; position: fixed; inset: var(--topbar-height) 0 0 0; z-index: 49; background: rgba(10, 14, 20, .35); }
}
@media (max-width: 900px) {
  .s-main { display: flex; flex-direction: column; height: auto; min-height: 0; }
  .orta { display: contents; }
  .sahna-panel { order: 1; flex: none; height: 56vh; min-height: 330px; }
  .ong { order: 2; }
  .tizim :deep(.metr) { order: 0; }
  .past { order: 3; flex: none; max-height: none; }
  .paket .past :deep(.jadval-quti) { max-height: 46vh; }
  .past-bosh { position: sticky; bottom: 0; }
  .past-bosh .ijro { position: fixed; z-index: 40; left: 0; right: 0; bottom: 0; justify-content: center; padding: 8px 12px calc(8px + env(safe-area-inset-bottom)); border-top: 1px solid var(--border); background: var(--bg-elevated); }
  .sahna-app { padding-bottom: 56px; }
  .kichik { max-height: none; }
  .chiplar { display: none; }
  .s-ong .orqa { display: none; }
  .s-karta { max-width: 62%; font-size: 11.5px; }
  .s-karta.past-ong, .s-karta.past-chap { bottom: 52px; }
}
@media (prefers-reduced-motion: reduce) { .chap { transition: none; } }

/* ── Tungi rejim: ko'zga yumshoq ──
   Qoida: urg'u rangi faqat JORIY narsada (joriy qadam, Ijro). O'tilganlar — neytral.
   Kitob urg'usi (masalan, binafsha #a99bff) qorong'i fonda juda yorqin — kulrangga aralashtirib xiralashtiramiz.
   O'z-o'ziga havola (cycle) bo'lmasligi uchun: asl rang .sahna-app da, yangisi uning bolalarida. */
:root[data-theme="dark"] .sahna-app {
  --urgu-asl: var(--accent);
  --text: #d5dae3;
}
:root[data-theme="dark"] .sahna-app > * {
  --accent: color-mix(in srgb, var(--urgu-asl) 72%, #7c8597);
  --accent-text: color-mix(in srgb, var(--urgu-asl) 78%, #a3acbb);
  --accent-soft: color-mix(in srgb, var(--urgu-asl) 12%, var(--bg-elevated));
}
/* O'tilgan qadamlar va belgilangan maqsadlar — neytral */
:root[data-theme="dark"] .qadam-royxat li.otgan:not(.joriy) .qn,
:root[data-theme="dark"] .org li.ok .cb { border-color: var(--border-strong); background: none; color: var(--text-muted); }
:root[data-theme="dark"] .sahna-app :deep(.otgan:not(.joriy) .r-n) { border-color: var(--border-strong); background: var(--bg-elevated); color: var(--text-muted); }
:root[data-theme="dark"] .sahna-app :deep(li.otgan + li::before) { background: var(--border-strong); }
:root[data-theme="dark"] .sahna-app :deep(li.joriy::before) { background: var(--border-strong); }
:root[data-theme="dark"] .sahna-app :deep(.joriy .r-n) { box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 16%, transparent); }
/* Ijro: to'liq bo'yalgan emas — yumshoq fon, rangli chegara va matn */
:root[data-theme="dark"] .sahna-app :deep(.i-t.asosiy) { background: var(--accent-soft); color: var(--accent-text); }
/* Metrikalar: holat rangi bor, lekin xira va ingichka */
:root[data-theme="dark"] .sahna-app :deep(.mk) { border-left-width: 3px; }
:root[data-theme="dark"] .sahna-app :deep(.mk.ok) { border-left-color: color-mix(in srgb, var(--success) 55%, var(--border)); }
:root[data-theme="dark"] .sahna-app :deep(.mk.ogoh) { border-left-color: color-mix(in srgb, var(--warning) 55%, var(--border)); }
:root[data-theme="dark"] .sahna-app :deep(.mk.xato) { border-left-color: color-mix(in srgb, var(--danger) 60%, var(--border)); }
</style>
