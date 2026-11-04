<script setup>
// FSD trenajori: loyiha fayllari brauzerda, ularni haqiqiy Steiger (src/fsd/steiger.js) tekshiradi. Natija
// «bino» bo'lib ko'rinadi (qavat — qatlam, xona — slice, eshik — index.ts, strelka — import) va har muammo oddiy
// tilda tushuntiriladi. Mashqlar — src/fsd/mashqlar.js.
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FaylDaraxti from '@/fsd/FaylDaraxti.vue'
import KodOyna from '@/fsd/KodOyna.vue'
import Bino from '@/fsd/Bino.vue'
import Muammolar from '@/fsd/Muammolar.vue'
import MashqTanlash from '@/trenajor/MashqTanlash.vue'
import { ASOS, ERKIN, MASHQLAR, findMashq } from '@/fsd/mashqlar.js'
import { tekshir } from '@/fsd/steiger.js'
import { findPage } from '@/docs'

const route = useRoute()
const router = useRouter()

const mashqId = ref(findMashq(route.query.mashq) ? route.query.mashq : '')
const mashq = computed(() => findMashq(mashqId.value))
const fayllar = ref({})
const tanlanganFayl = ref(null)
const muammolar = ref([])
const tanlangan = ref(null)
const yuklanmoqda = ref(true)
const cur = ref(0)
const ochiq = ref(new Set())
const finished = computed(() => mashq.value && cur.value >= mashq.value.steps.length)
const nextMashq = computed(() => { const i = MASHQLAR.findIndex((m) => m.id === mashqId.value); return i >= 0 ? MASHQLAR[i + 1] ?? null : null })
const bobTitle = computed(() => findPage(mashq.value?.bob)?.title ?? '')

const DONE_KEY = 'fsd-trenajor:bajarilgan'
const done = ref(new Set())
try { done.value = new Set(JSON.parse(localStorage.getItem(DONE_KEY) ?? '[]')) } catch {}
const markDone = (id) => { done.value = new Set([...done.value, id]); try { localStorage.setItem(DONE_KEY, JSON.stringify([...done.value])) } catch {} }
const parts = (s) => s.split('`').map((t, i) => ({ t, code: i % 2 === 1 }))

// ── tekshiruv: har o'zgarishdan keyin (biroz kutib) Steiger qayta ishlaydi ────────────────────────
let navbat = 0
let timer = 0
async function lint() {
  const n = ++navbat
  const r = await tekshir(fayllar.value)
  if (n !== navbat) return
  muammolar.value = r
  yuklanmoqda.value = false
  // hech fayl ochilmagan bo'lsa — birinchi muammoli fayl
  if (!tanlanganFayl.value && r.length) ochish(r[0])
  if (tanlangan.value && !r.some((m) => m.xabar === tanlangan.value.xabar && m.yol === tanlangan.value.yol)) tanlangan.value = null
  qadam()
}
watch(fayllar, () => {
  clearTimeout(timer)
  timer = setTimeout(lint, 250)
})

function qadam() {
  const m = mashq.value
  if (!m || cur.value >= m.steps.length) return
  if (m.steps[cur.value].check({ muammolar: muammolar.value, fayllar: fayllar.value, tanlangan: tanlangan.value })) {
    cur.value++
    if (cur.value === m.steps.length) markDone(m.id)
    qadam()
  }
}

function tanla(m) {
  tanlangan.value = m
  qadam()
}
function ochish(m) {
  tanlanganFayl.value = fayllar.value[m.yol] !== undefined ? m.yol : Object.keys(fayllar.value).find((f) => f.startsWith(m.yol + '/')) ?? null
}
const tanlanganQator = computed(() => (tanlangan.value && tanlangan.value.yol === tanlanganFayl.value ? tanlangan.value.qator : null))

// ── fayl amallari ─────────────────────────────────────────────────────────────────────────────
function ozgar(t) {
  fayllar.value = { ...fayllar.value, [tanlanganFayl.value]: t }
}
function yarat(yol) {
  if (fayllar.value[yol] !== undefined) return
  fayllar.value = { ...fayllar.value, [yol]: '' }
  tanlanganFayl.value = yol
}
function kochir(eski, yangi) {
  const f = {}
  for (const [k, v] of Object.entries(fayllar.value)) {
    if (k === eski) f[yangi] = v
    else if (k.startsWith(eski + '/')) f[yangi + k.slice(eski.length)] = v
    else f[k] = v
  }
  fayllar.value = f
  tanlanganFayl.value = yangi
}
function ochir(yol) {
  fayllar.value = Object.fromEntries(Object.entries(fayllar.value).filter(([k]) => k !== yol && !k.startsWith(yol + '/')))
  tanlanganFayl.value = null
}
function yechimniQoy(s) {
  const f = { ...fayllar.value }
  for (const [k, v] of Object.entries(s.yechim)) (v === null ? delete f[k] : (f[k] = v))
  fayllar.value = f
  tanlanganFayl.value = Object.entries(s.yechim).find(([, v]) => v !== null)?.[0] ?? null
}
const xatoliYollar = computed(() => {
  const s = new Set()
  for (const m of muammolar.value) {
    const q = m.yol.split('/')
    for (let i = 2; i <= q.length; i++) s.add(q.slice(0, i).join('/'))
  }
  return s
})

function boshla() {
  fayllar.value = { ...(mashq.value ? mashq.value.fayllar : ASOS) }
  tanlanganFayl.value = null
  tanlangan.value = null
  cur.value = 0
  ochiq.value = new Set()
}
watch(mashqId, (id) => {
  router.replace({ query: id ? { mashq: id } : {} })
  boshla()
})
boshla()
</script>

<template>
  <div class="app">
    <header class="bosh">
      <div class="title">
        <strong>FSD trenajori</strong>
        <span class="muted">qatlamlar va import qoidalari — haqiqiy Steiger bilan</span>
      </div>
      <MashqTanlash v-model="mashqId" class="pick" :mashqlar="MASHQLAR" :erkin="ERKIN" :done="done" />
      <button type="button" class="btn" title="Loyihani boshlang‘ich holatiga qaytarish" @click="boshla">Qaytadan</button>
      <RouterLink to="/fsd" class="back">← Qo‘llanmaga qaytish</RouterLink>
    </header>
    <main>
      <div class="chap">
        <div class="panel"><h2>Loyiha fayllari</h2><FaylDaraxti :fayllar="fayllar" :tanlangan="tanlanganFayl" :xatoli="xatoliYollar" @tanla="(y) => (tanlanganFayl = y)" @yarat="yarat" @kochir="kochir" @ochir="ochir" /></div>
        <div class="panel kod"><KodOyna :yol="tanlanganFayl" :matn="fayllar[tanlanganFayl]" :qator="tanlanganQator" @ozgar="ozgar" /></div>
      </div>
      <div class="panel orta">
        <h2>Bino <span class="muted">— qavat: qatlam · xona: slice · 🚪 eshik: index.ts · strelka: import</span></h2>
        <Bino :fayllar="fayllar" :muammolar="muammolar" :tanlangan="tanlangan" @tanla="tanla" @xona="(id) => (tanlanganFayl = Object.keys(fayllar).find((f) => f.startsWith(`src/${id}/`)) ?? null)" />
      </div>
      <div class="ung">
        <div class="panel"><h2>Muammolar <span v-if="!yuklanmoqda" class="soni" :class="{ nol: !muammolar.length }">{{ muammolar.length }}</span></h2><Muammolar :muammolar="muammolar" :tanlangan="tanlangan" :yuklanmoqda="yuklanmoqda" @tanla="tanla" @ochish="ochish" /></div>
        <div class="panel">
          <h2>{{ mashq ? 'Mashq' : 'Qo‘llanma' }}</h2>
          <div v-if="mashq" class="mashq">
            <h3>{{ mashq.title }}</h3>
            <p class="intro"><template v-for="(p, k) in parts(mashq.intro)" :key="k"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template></p>
            <ol class="steps">
              <li v-for="(s, i) in mashq.steps" :key="i" :class="{ ok: i < cur, cur: i === cur, keyin: i > cur }">
                <p><template v-for="(p, k) in parts(s.text)" :key="k"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template></p>
                <div v-if="i === cur && s.yechim" class="amallar">
                  <button v-if="!ochiq.has(i)" type="button" class="yordam" @click="ochiq = new Set([...ochiq, i])">Yordam: yechimni ko‘rsatish</button>
                  <button v-else type="button" class="btn" @click="yechimniQoy(s)">Yechimni loyihaga qo‘llash</button>
                </div>
                <ul v-if="i === cur && s.yechim && ochiq.has(i)" class="yechim">
                  <li v-for="(v, f) in s.yechim" :key="f">{{ v === null ? '🗑 o‘chiriladi' : '✎' }} <code>{{ f.replace(/^src\//, '') }}</code></li>
                </ul>
                <p v-if="i < cur" class="natija"><template v-for="(p, k) in parts(s.natija)" :key="k"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template></p>
              </li>
            </ol>
            <div v-if="finished" class="tugadi">
              <strong>✓ Mashq tugadi.</strong> Loyihani erkin o‘zgartirib ko‘rishingiz mumkin.
              <button v-if="nextMashq" type="button" class="btn" @click="mashqId = nextMashq.id">Keyingi: {{ nextMashq.title }} →</button>
            </div>
            <RouterLink :to="mashq.bob" class="bob">Mavzu bo‘yicha bob: {{ bobTitle }}</RouterLink>
            <p class="manba">Rasmiy hujjat: <a v-for="u in mashq.manba" :key="u" :href="u" target="_blank" rel="noopener">{{ u.replace(/^https:\/\//, '') }}</a></p>
          </div>
          <div v-else class="mashq">
            <p class="intro">Bu — xatosiz «do‘kon» loyihasi. FSD’da loyiha <b>bino</b> kabi: qatlamlar — qavatlar, har qavat faqat o‘zidan <b>pastdagi</b> qavatlardan foydalana oladi.</p>
            <ul class="izoh">
              <li><b>Xona</b> — slice (masalan <code>features/add-to-cart</code>), ichida bo‘limlar (<code>ui</code>, <code>model</code>, …).</li>
              <li><b>🚪 Eshik</b> — <code>index.ts</code>: boshqalar xonaga faqat shu orqali kiradi.</li>
              <li><b>Strelka</b> — import. Yashil — to‘g‘ri, qizil — qoida buzilgan (bosing — tushuntirish chiqadi).</li>
            </ul>
            <p class="intro">Kodni o‘zgartirib qoidani buzib ko‘ring (masalan, <code>shared</code> dagi faylda <code>@/entities/product</code> dan import qiling) — tekshiruv darhol ishlaydi. Yoki yuqoridan mashq tanlang.</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app { height: calc(100vh - var(--topbar-height)); display: flex; flex-direction: column; background: var(--bg); color: var(--text); font-family: var(--font-sans); }
.bosh { display: flex; flex-wrap: wrap; gap: 10px 16px; align-items: center; padding: 10px 18px; border-bottom: 1px solid var(--border); background: var(--bg-elevated); }
.title { display: grid; }
.title strong { font-size: 16px; }
.muted { color: var(--text-subtle); font-size: 12.5px; font-weight: 400; letter-spacing: 0; text-transform: none; }
.btn { padding: 6px 12px; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); background: var(--bg-elevated); color: var(--text); font: inherit; font-size: 13px; cursor: pointer; }
.btn:hover { border-color: var(--accent); color: var(--accent-text); }
.back { margin-left: auto; color: var(--text-muted); font-size: 13px; text-decoration: none; white-space: nowrap; }
.back:hover { color: var(--accent-text); }
main { flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(280px, .8fr) minmax(460px, 1.6fr) minmax(340px, 1fr); gap: 10px; padding: 10px; }
.chap, .ung { display: grid; gap: 10px; min-height: 0; }
.chap { grid-template-rows: 1fr 1fr; }
.ung { grid-template-rows: 1fr 1.1fr; }
.panel { position: relative; display: flex; flex-direction: column; min-height: 0; overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-elevated); box-shadow: var(--shadow-sm); }
.panel > :not(h2) { flex: 1; min-height: 0; }
h2 { margin: 0; padding: 8px 14px; border-bottom: 1px solid var(--border); color: var(--text-subtle); font: 700 11px var(--font-sans); letter-spacing: .08em; text-transform: uppercase; }
.soni { margin-left: 6px; padding: 0 7px; border-radius: 9px; background: #e5484d; color: #fff; font-size: 11px; }
.soni.nol { background: var(--success); }
.kod { border-color: var(--code-bg); background: var(--code-bg); }
.mashq { overflow: auto; padding: 10px 14px 14px; }
.mashq h3 { margin: 4px 0 6px; font-size: 16px; }
.intro { margin: 0 0 12px; color: var(--text-muted); font-size: 13.5px; line-height: 1.5; }
.izoh { margin: 0 0 12px; padding-left: 18px; color: var(--text-muted); font-size: 13.5px; line-height: 1.55; }
.steps { margin: 0; padding: 0; list-style: none; counter-reset: q; }
.steps > li { position: relative; padding: 6px 0 10px 34px; counter-increment: q; }
.steps > li::before { content: counter(q); position: absolute; left: 0; top: 4px; width: 22px; height: 22px; display: grid; place-items: center; border: 1px solid var(--border); border-radius: 50%; background: var(--bg-sunken); color: var(--text-subtle); font: 700 12px var(--font-sans); }
.steps > li.cur::before { border-color: var(--accent); background: var(--accent); color: var(--bg-elevated); }
.steps > li.ok::before { content: '✓'; border-color: var(--success); background: var(--success-soft); color: var(--success); }
.steps > li.keyin { opacity: .55; }
.steps p { margin: 0 0 6px; font-size: 13.5px; line-height: 1.45; }
.amallar { display: flex; gap: 6px; margin: 6px 0; }
.yordam { padding: 4px 10px; border: 1px dashed var(--border-strong); border-radius: var(--radius-sm); background: none; color: var(--text-muted); font: inherit; font-size: 12.5px; cursor: pointer; }
.yechim { margin: 4px 0; padding: 6px 10px; border-radius: var(--radius-sm); background: var(--bg-sunken); list-style: none; font-size: 12.5px; }
.natija { margin-top: 8px !important; padding: 8px 10px; border-radius: var(--radius-sm); background: var(--success-soft); }
.steps code, .intro code, .izoh code, .natija code, .yechim code { padding: 1px 4px; border-radius: 4px; background: var(--bg-sunken); font: 12.5px var(--font-mono); }
.tugadi { display: grid; justify-items: start; gap: 8px; margin: 6px 0 12px; padding: 10px 12px; border: 1px solid var(--success); border-radius: var(--radius-sm); font-size: 13.5px; }
.bob { display: inline-block; margin-top: 4px; color: var(--accent-text); font-size: 13px; }
.manba { margin: 8px 0 0; color: var(--text-subtle); font-size: 12px; }
.manba a { display: block; color: var(--text-muted); }
@media (max-width: 1200px) {
  .app { height: auto; min-height: calc(100vh - var(--topbar-height)); }
  main { grid-template-columns: minmax(0, 1fr); }
  .chap { grid-template-rows: 40vh 50vh; }
  .orta { height: 80vh; }
  .ung { grid-template-rows: 50vh auto; }
}
@media (max-width: 640px) {
  .bosh { padding: 10px 16px; }
  .title .muted { display: none; }
  .pick { flex: 1 1 100%; }
}
</style>
