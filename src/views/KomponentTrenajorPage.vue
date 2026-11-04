<script setup>
// Komponent trenajori (Vue va React): kod brauzerda kompilyatsiya qilinib, haqiqiy Vue/React bilan iframe'da
// ishlaydi (lab/*.html, src/komponent/runner). Har hodisa yangi boshlovchi uchun tushuntiriladi: «Nima bo'ldi?»
// (oddiy tildagi qadamlar), «Xarita» (ichma-ich qutilar), natija oynasining o'zida o'zgargan joy belgisi. Mashqlar — src/komponent/mashqlar.js.
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import KodMuharrir from '@/komponent/KodMuharrir.vue'
import KomponentDaraxt from '@/komponent/KomponentDaraxt.vue'
import Hikoya from '@/komponent/Hikoya.vue'
import Xarita from '@/komponent/Xarita.vue'
import Ombor from '@/komponent/Ombor.vue'
import Yollar from '@/komponent/Yollar.vue'
import Kesh from '@/komponent/Kesh.vue'
import VoqeaJurnal from '@/komponent/VoqeaJurnal.vue'
import MashqTanlash from '@/trenajor/MashqTanlash.vue'
import { ERKIN, MASHQLAR, findMashq, kirishFayli } from '@/komponent/mashqlar.js'
import { korinish, yangiStat, yoz } from '@/komponent/stat.js'
import { findPage } from '@/docs'

const route = useRoute()
const router = useRouter()
const fw = computed(() => route.meta.fw)
const NOMI = { vue: 'Vue', react: 'React' }

const mashqId = ref(findMashq(fw.value, route.query.mashq) ? route.query.mashq : '')
const mashq = computed(() => findMashq(fw.value, mashqId.value))
const fayllar = ref({})
const faol = ref('')
const cur = ref(0)
const ochiq = ref(new Set())
const finished = computed(() => mashq.value && cur.value >= mashq.value.steps.length)
const nextMashq = computed(() => {
  const list = MASHQLAR[fw.value]
  const i = list.findIndex((m) => m.id === mashqId.value)
  return i >= 0 ? list[i + 1] ?? null : null
})
const bobTitle = computed(() => findPage(mashq.value?.bob)?.title ?? '')

const DONE_KEY = 'komponent-trenajor:bajarilgan'
const done = ref(new Set())
try { done.value = new Set(JSON.parse(localStorage.getItem(DONE_KEY) ?? '[]')) } catch {}
const markDone = (id) => { done.value = new Set([...done.value, id]); try { localStorage.setItem(DONE_KEY, JSON.stringify([...done.value])) } catch {} }

const parts = (s) => s.split('`').map((t, i) => ({ t, code: i % 2 === 1 }))

// ── iframe va undan keladigan voqealar ────────────────────────────────────────────────────────
const frame = ref(null)
const frameKey = ref(0)
const src = computed(() => `${import.meta.env.BASE_URL}lab/${fw.value}.html`)
const xato = ref(null)
const nodes = ref([])
const graf = shallowRef({ nodes: [], edges: [] })
const toplamlar = ref([])
const loglar = ref([])
const omborlar = ref([])
const yollar = ref([])
const joriyYol = ref('/')
const yolMatn = ref('/')
const kesh = ref([])
const chaqnash = ref(new Map())
const sabablar = ref(new Map())
const tanlangan = ref(null)
const korinishTab = ref('hikoya')
let stat = yangiStat()
let flashSeq = 0

function tozala() {
  xato.value = null
  nodes.value = []
  graf.value = { nodes: [], edges: [] }
  toplamlar.value = []
  loglar.value = []
  omborlar.value = []
  yollar.value = []
  joriyYol.value = yolMatn.value = '/'
  kesh.value = []
  chaqnash.value = new Map()
  sabablar.value = new Map()
  stat = yangiStat()
}
function ishgaTushir() {
  tozala()
  frameKey.value++
}

function toplam(b) {
  let t = toplamlar.value.find((x) => x.b === b)
  if (!t) {
    t = { b, ev: [], sabab: null, ekran: null }
    toplamlar.value.push(t)
    if (toplamlar.value.length > 80) toplamlar.value.splice(0, toplamlar.value.length - 80)
  }
  return t
}

let checkTimer = 0
function onMessage(e) {
  if (e.source !== frame.value?.contentWindow || !e.data?.lab) return
  const m = e.data
  if (m.t === 'ready') frame.value.contentWindow.postMessage({ lab: 1, t: 'run', fayllar: { ...fayllar.value }, kirish: kirishFayli(fayllar.value) }, '*')
  else if (m.t === 'error') xato.value = m
  else if (m.t === 'log') loglar.value.push(m)
  else if (m.t === 'dom') { const t = toplam(m.b); t.sabab ??= m }
  else if (m.t === 'ekran') toplam(m.b).ekran = m.list
  else if (m.t === 'ev') {
    const t = toplam(m.b)
    t.ev.push(m)
    if (m.k === 'render' || m.k === 'mount' || m.k === 'skip') {
      const map = new Map(chaqnash.value)
      map.set(m.id, { tur: m.k, seq: ++flashSeq })
      chaqnash.value = map
    }
    if (m.k === 'render') sabablar.value = new Map(sabablar.value).set(m.id, m.reasons)
    if (m.k === 'mount') { const s = new Map(sabablar.value); s.delete(m.id); sabablar.value = s }
    if (m.k === 'nav' && m.faza === 'tugadi' && m.ok) joriyYol.value = yolMatn.value = m.to
  } else if (m.t === 'daraxt') {
    nodes.value = m.nodes
    omborlar.value = m.storlar ?? m.omborlar ?? []
  } else if (m.t === 'yollar') yollar.value = m.list
  else if (m.t === 'kesh') kesh.value = m.list
  else if (m.t === 'graf') graf.value = { nodes: m.nodes, edges: m.edges }
  else if (m.t === 'amalTugadi') amalKutish.get(m.id)?.(m.xato)
  yoz(stat, m)
  clearTimeout(checkTimer)
  checkTimer = setTimeout(tekshir, 120)
}
addEventListener('message', onMessage)
onBeforeUnmount(() => removeEventListener('message', onMessage))

// mashq qadami: voqealar statistikasi bo'yicha jonli tekshiruv
function tekshir() {
  const m = mashq.value
  if (!m || cur.value >= m.steps.length) return
  let doc = null
  try { doc = frame.value?.contentDocument } catch {}
  if (m.steps[cur.value].check(korinish(stat, fayllar.value, doc))) {
    cur.value++
    stat = yangiStat()
    if (cur.value === m.steps.length) markDone(m.id)
  }
}

// «Ko'rsatish»: qadam harakatlarini natija oynasida o'zi bajaradi
const amalKutish = new Map()
let amalSeq = 0
const bajarilmoqda = ref(false)
async function korsat(s) {
  bajarilmoqda.value = true
  const id = ++amalSeq
  const err = await new Promise((res) => {
    amalKutish.set(id, res)
    frame.value.contentWindow.postMessage({ lab: 1, t: 'amal', id, list: s.amal }, '*')
  })
  amalKutish.delete(id)
  bajarilmoqda.value = false
  if (err) xato.value = { phase: 'amal', message: err }
}

// ── kod tahriri ───────────────────────────────────────────────────────────────────────────────
let runTimer = 0
function ozgar(f, text) {
  fayllar.value = { ...fayllar.value, [f]: text }
  clearTimeout(runTimer)
  runTimer = setTimeout(ishgaTushir, 700)
}
function yechimniQoy(s) {
  fayllar.value = { ...fayllar.value, ...s.yechim }
  faol.value = Object.keys(s.yechim)[0]
  clearTimeout(runTimer)
  ishgaTushir()
}

function boshla() {
  const m = mashq.value
  fayllar.value = { ...(m ? m.fayllar : ERKIN[fw.value].fayllar) }
  faol.value = kirishFayli(fayllar.value)
  cur.value = 0
  ochiq.value = new Set()
  tanlangan.value = null
  ishgaTushir()
}

watch(mashqId, (id) => {
  router.replace({ query: id ? { mashq: id } : {} })
  boshla()
})
watch(fw, () => {
  mashqId.value = findMashq(fw.value, route.query.mashq) ? route.query.mashq : ''
  boshla()
})
boshla()

// natija oynasidagi router: manzil satridan o'tish, orqaga, oldinga
function yolga(amal, path) {
  frame.value?.contentWindow.postMessage({ lab: 1, t: 'yol', amal, path }, '*')
}
// o'ng panel tablari: kutubxona ishlatilsa — o'z ko'rinishi
const tablar = computed(() => {
  const t = { hikoya: 'Nima bo‘ldi?', xarita: 'Xarita' }
  if (omborlar.value.length) t.ombor = 'Ombor'
  if (yollar.value.length) t.yollar = 'Yo‘llar'
  if (kesh.value.length || toplamlar.value.some((x) => x.ev.some((e) => e.k === 'tarmoq'))) t.kesh = 'Kesh'
  t.daraxt = 'Daraxt'
  return t
})
watch(tablar, (t) => { if (!t[korinishTab.value]) korinishTab.value = 'hikoya' })

// xarita uchun: oxirgi hodisada qaysi komponentda qaysi qiymat o'zgardi (render sabablari va set'lar)
const asosNom = (l) => l.replace(/^.*props\./, '').split(/[.[ ]/)[0]
const ozgarish = computed(() => {
  const t = toplamlar.value.at(-1)
  const m = new Map()
  const setlar = new Set()
  if (!t || t.b === 1) return { m, setlar, seq: 0 }
  for (const e of t.ev) {
    if (e.k === 'set') setlar.add(asosNom(e.label))
    if (e.k === 'render') for (const r of e.reasons ?? []) if (r.label) m.set(e.id, (m.get(e.id) ?? new Set()).add(asosNom(r.label)))
  }
  return { m, setlar, seq: t.b }
})
const grafNomlar = computed(() => new Map(graf.value.nodes.map((n) => [n.id, n.label])))
const ERKIN_ROYXAT = computed(() => [ERKIN[fw.value]])
</script>

<template>
  <div class="app">
    <header>
      <div class="title">
        <strong>{{ NOMI[fw] }} trenajori</strong>
        <span class="muted">{{ fw === 'vue' ? 'reaktivlik va qayta render — jonli' : 'render va qayta render — jonli' }}</span>
      </div>
      <div class="seg" role="group" aria-label="Framework">
        <RouterLink v-for="(n, id) in NOMI" :key="id" :to="`/${id}/trenajor`" :class="{ on: fw === id }">{{ n }}</RouterLink>
      </div>
      <MashqTanlash v-model="mashqId" class="pick" :mashqlar="MASHQLAR[fw]" :erkin="ERKIN_ROYXAT" :done="done" />
      <button type="button" class="btn" title="Kodni boshlang‘ich holatiga qaytarish" @click="boshla">Qaytadan</button>
      <RouterLink :to="`/${fw}`" class="back">← Qo‘llanmaga qaytish</RouterLink>
    </header>
    <main>
      <div class="panel kod">
        <KodMuharrir v-model:faol="faol" :fayllar="fayllar" :xato="xato" @ozgar="ozgar" />
        <div v-if="xato" class="xato" role="alert">
          <b>{{ xato.phase === 'compile' ? 'Kompilyatsiya xatosi' : xato.phase === 'amal' ? 'Harakat bajarilmadi' : 'Xato' }}<template v-if="xato.file"> — {{ xato.file }}</template></b>
          <pre>{{ xato.message }}</pre>
        </div>
      </div>
      <div class="ust">
        <div class="panel natija">
          <h2>Natija <span class="muted">— haqiqiy {{ NOMI[fw] }}, kod o‘zgarsa qayta ishga tushadi</span></h2>
          <form v-if="yollar.length" class="manzil" @submit.prevent="yolga('push', yolMatn)">
            <button type="button" title="Orqaga" @click="yolga('back')">‹</button>
            <button type="button" title="Oldinga" @click="yolga('forward')">›</button>
            <input v-model="yolMatn" aria-label="Manzil" spellcheck="false" />
            <button type="submit">O‘tish</button>
          </form>
          <iframe :key="frameKey" ref="frame" :src="src" title="Natija" />
        </div>
        <div class="panel pastki">
          <h2>{{ mashq ? 'Mashq' : 'Qo‘llanma' }}</h2>
          <div v-if="mashq" class="mashq">
            <h3>{{ mashq.title }}</h3>
            <p class="intro">{{ mashq.intro }}</p>
            <ol class="steps">
              <li v-for="(s, i) in mashq.steps" :key="i" :class="{ ok: i < cur, cur: i === cur, keyin: i > cur }">
                <p><template v-for="(p, k) in parts(s.text)" :key="k"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template></p>
                <div v-if="i === cur" class="amallar">
                  <button v-if="s.yechim && !ochiq.has(i)" type="button" class="yordam" @click="ochiq = new Set([...ochiq, i])">Yordam: yechimni ko‘rsatish</button>
                  <button v-if="s.yechim && ochiq.has(i)" type="button" class="btn" @click="yechimniQoy(s)">Yechimni kodga qo‘yish</button>
                  <button type="button" class="btn" :disabled="bajarilmoqda" title="Harakatni natija oynasida o‘zi bajaradi" @click="korsat(s)">▶ Bajarib ko‘rsatish</button>
                </div>
                <pre v-if="i === cur && s.yechim && ochiq.has(i)" class="yechim">{{ Object.entries(s.yechim).map(([f, t]) => `// ${f}\n${t}`).join('\n') }}</pre>
                <p v-if="i < cur" class="natija-matn"><template v-for="(p, k) in parts(s.natija)" :key="k"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template></p>
              </li>
            </ol>
            <div v-if="finished" class="tugadi">
              <strong>✓ Mashq tugadi.</strong> Kodni erkin o‘zgartirib, davom etishingiz mumkin.
              <button v-if="nextMashq" type="button" class="btn" @click="mashqId = nextMashq.id">Keyingi: {{ nextMashq.title }} →</button>
            </div>
            <RouterLink :to="mashq.bob" class="bob">Mavzu bo‘yicha bob: {{ bobTitle }}</RouterLink>
            <p class="manba">Rasmiy hujjat: <a v-for="u in mashq.manba" :key="u" :href="u" target="_blank" rel="noopener">{{ u.replace(/^https:\/\//, '') }}</a></p>
          </div>
          <div v-else class="mashq">
            <p class="intro">Chapda — kod. Uni o‘zgartiring: natija o‘zi qayta ishga tushadi. Natija oynasida bosing yoki yozing va o‘ng tomonni kuzating:</p>
            <ul class="izoh">
              <li><b>Nima bo‘ldi?</b> — har bosishdan keyin oddiy tilda, qadamma-qadam: nima o‘zgardi, qaysi komponent qayta chizildi va nega, ekranda nima yangilandi.</li>
              <li><b>Natija oynasida</b> o‘zgargan joy sariq ramka bilan yonadi.</li>
              <li><b>Xarita</b> — sahifa ichma-ich qutilar: har komponentning o‘z {{ fw === 'vue' ? 'ma’lumoti' : 'state’i' }} va otasidan kelgan props. Chizilgani yashil, o‘tkazib yuborilgani kulrang.</li>
              <li><b>Daraxt</b> va <b>Voqealar</b> — batafsil ko‘rinish (render soni, sabablar ro‘yxati).</li>
            </ul>
            <p class="intro">Yuqoridagi ro‘yxatdan mashq tanlang — har biri bitta mexanizmni qadamma-qadam ko‘rsatadi.</p>
          </div>
        </div>
      </div>
      <div class="ung">
        <div class="panel">
          <div class="tab" role="tablist">
            <button v-for="(n, id) in tablar" :key="id" type="button" role="tab" :aria-selected="korinishTab === id" :class="{ on: korinishTab === id }" @click="korinishTab = id">{{ n }}</button>
          </div>
          <Hikoya v-if="korinishTab === 'hikoya'" :toplamlar="toplamlar" :fw="fw" :graf="graf" :nodes="nodes" />
          <Xarita v-else-if="korinishTab === 'xarita'" :nodes="nodes" :chaqnash="chaqnash" :ozgarish="ozgarish" :fw="fw" />
          <Ombor v-else-if="korinishTab === 'ombor'" :omborlar="omborlar" :nodes="nodes" :toplam="toplamlar.at(-1)" :fw="fw" />
          <Yollar v-else-if="korinishTab === 'yollar'" :yollar="yollar" :toplamlar="toplamlar" :joriy="joriyYol" />
          <Kesh v-else-if="korinishTab === 'kesh'" :kesh="kesh" :toplamlar="toplamlar" />
          <KomponentDaraxt v-else :nodes="nodes" :chaqnash="chaqnash" :sabablar="sabablar" :tanlangan="tanlangan" :fw="fw" @tanla="(id) => (tanlangan = tanlangan === id ? null : id)" />
        </div>
        <div class="panel">
          <VoqeaJurnal :toplamlar="toplamlar" :loglar="loglar" :fw="fw" :nomlar="grafNomlar" />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app { height: calc(100vh - var(--topbar-height)); display: flex; flex-direction: column; background: var(--bg); color: var(--text); font-family: var(--font-sans); }
header { display: flex; flex-wrap: wrap; gap: 10px 16px; align-items: center; padding: 10px 18px; border-bottom: 1px solid var(--border); background: var(--bg-elevated); }
.title { display: grid; }
.title strong { font-size: 16px; }
.muted { color: var(--text-subtle); font-size: 12.5px; font-weight: 400; letter-spacing: 0; text-transform: none; }
.seg { display: flex; padding: 3px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-sunken); }
.seg a { padding: 5px 12px; border-radius: 6px; color: var(--text-muted); font: 600 13px var(--font-sans); text-decoration: none; }
.seg a.on { background: var(--bg-elevated); color: var(--accent-text); box-shadow: var(--shadow-sm); }
.btn { padding: 6px 12px; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); background: var(--bg-elevated); color: var(--text); font: inherit; font-size: 13px; cursor: pointer; }
.btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent-text); }
.btn:disabled { opacity: .55; cursor: default; }
.back { margin-left: auto; color: var(--text-muted); font-size: 13px; text-decoration: none; white-space: nowrap; }
.back:hover { color: var(--accent-text); }
main { flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(360px, 1fr) minmax(340px, 1fr) minmax(360px, 1fr); gap: 10px; padding: 10px; }
.ust, .ung { display: grid; gap: 10px; min-height: 0; }
.ust { grid-template-rows: 1fr 1.25fr; }
.ung { grid-template-rows: 1.7fr 1fr; }
.panel { position: relative; display: flex; flex-direction: column; min-height: 0; overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-elevated); box-shadow: var(--shadow-sm); }
.panel > :not(h2):not(.tab):not(.xato):not(.manzil) { flex: 1; min-height: 0; }
h2 { margin: 0; padding: 8px 14px; border-bottom: 1px solid var(--border); color: var(--text-subtle); font: 700 11px var(--font-sans); letter-spacing: .08em; text-transform: uppercase; }
.kod { border-color: var(--code-bg); background: var(--code-bg); }
.xato { max-height: 40%; overflow: auto; padding: 10px 14px; border-top: 2px solid #ff8a80; background: #2a1614; color: #ffb4ab; font-size: 13px; }
.xato pre { margin: 4px 0 0; font: 12.5px/1.5 var(--font-mono); white-space: pre-wrap; }
iframe { width: 100%; border: 0; background: #fff; }
.manzil { display: flex; gap: 4px; padding: 6px 8px; border-bottom: 1px solid var(--border); background: var(--bg-sunken); }
.manzil button { padding: 3px 9px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-elevated); color: var(--text); font: inherit; font-size: 13px; cursor: pointer; }
.manzil input { flex: 1; min-width: 0; padding: 3px 10px; border: 1px solid var(--border); border-radius: 14px; background: var(--bg-elevated); color: var(--text); font: 13px var(--font-mono); }
.tab { display: flex; gap: 4px; padding: 6px 10px; border-bottom: 1px solid var(--border); }
.tab button { padding: 3px 10px; border: 0; border-radius: 6px; background: none; color: var(--text-muted); font: 600 12px var(--font-sans); cursor: pointer; }
.tab button.on { background: var(--bg-sunken); color: var(--accent-text); }
.mashq { overflow: auto; padding: 10px 14px 14px; }
.mashq h3 { margin: 4px 0 6px; font-size: 16px; }
.intro { margin: 0 0 12px; color: var(--text-muted); font-size: 13.5px; line-height: 1.5; }
.izoh { margin: 0 0 12px; padding-left: 18px; color: var(--text-muted); font-size: 13.5px; line-height: 1.55; }
.izoh li { margin-bottom: 6px; }
.steps { margin: 0; padding: 0; list-style: none; counter-reset: q; }
.steps li { position: relative; padding: 6px 0 10px 34px; counter-increment: q; }
.steps li::before { content: counter(q); position: absolute; left: 0; top: 4px; width: 22px; height: 22px; display: grid; place-items: center; border: 1px solid var(--border); border-radius: 50%; background: var(--bg-sunken); color: var(--text-subtle); font: 700 12px var(--font-sans); }
.steps li.cur::before { border-color: var(--accent); background: var(--accent); color: var(--bg-elevated); }
.steps li.ok::before { content: '✓'; border-color: var(--success); background: var(--success-soft); color: var(--success); }
.steps li.keyin { opacity: .55; }
.steps p { margin: 0 0 6px; font-size: 13.5px; line-height: 1.45; }
.amallar { display: flex; flex-wrap: wrap; gap: 6px; margin: 6px 0; }
.yordam { padding: 4px 10px; border: 1px dashed var(--border-strong); border-radius: var(--radius-sm); background: none; color: var(--text-muted); font: inherit; font-size: 12.5px; cursor: pointer; }
.yordam:hover { border-color: var(--accent); color: var(--accent-text); }
.yechim { max-height: 220px; margin: 4px 0; padding: 8px 10px; overflow: auto; border-radius: var(--radius-sm); background: var(--code-bg); color: #e6e9f0; font: 12px/1.5 var(--font-mono); }
.natija-matn { margin-top: 8px !important; padding: 8px 10px; border-radius: var(--radius-sm); background: var(--success-soft); }
.steps code, .intro code, .izoh code, .natija-matn code { padding: 1px 4px; border-radius: 4px; background: var(--bg-sunken); font: 12.5px var(--font-mono); }
.tugadi { display: grid; justify-items: start; gap: 8px; margin: 6px 0 12px; padding: 10px 12px; border: 1px solid var(--success); border-radius: var(--radius-sm); font-size: 13.5px; }
.bob { display: inline-block; margin-top: 4px; color: var(--accent-text); font-size: 13px; }
.manba { margin: 8px 0 0; color: var(--text-subtle); font-size: 12px; }
.manba a { display: block; color: var(--text-muted); }
@media (max-width: 1200px) {
  .app { height: auto; min-height: calc(100vh - var(--topbar-height)); }
  main { grid-template-columns: minmax(0, 1fr); }
  .kod { height: 60vh; }
  .ust { grid-template-rows: 45vh auto; }
  .ung { grid-template-rows: 60vh 45vh; }
}
@media (max-width: 640px) {
  header { padding: 10px 16px; }
  .title .muted { display: none; }
  .pick { flex: 1 1 100%; }
}
</style>
