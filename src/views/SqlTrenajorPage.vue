<script setup>
// SQL trenajori: brauzerda haqiqiy PostgreSQL (PGlite) va SQLite (WASM). Konsol, jonli ER diagramma,
// EXPLAIN reja daraxti va kitob boblariga bog'langan mashqlar (src/sqltrenajor/mashqlar.js).
import { computed, nextTick, onUnmounted, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SqlKonsol from '@/sqltrenajor/SqlKonsol.vue'
import ErDiagramma from '@/sqltrenajor/ErDiagramma.vue'
import RejaTugun from '@/sqltrenajor/RejaTugun.vue'
import MashqTanlash from '@/trenajor/MashqTanlash.vue'
import { DVIGATELLAR } from '@/sqltrenajor/dvigatel.js'
import { boshlash } from '@/sqltrenajor/baza.js'
import { bajar, kontekst } from '@/sqltrenajor/ijro.js'
import { xatoTuri } from '@/sqltrenajor/xatolar.js'
import { MASHQLAR, findMashq, setupMatni, yordamMatni } from '@/sqltrenajor/mashqlar.js'
import { rangla } from '@/sqltrenajor/rang.js'
import { findPage } from '@/docs'

const route = useRoute()
const router = useRouter()

const ERKIN = [
  { id: '', title: 'Erkin rejim — do‘kon bazasi', note: '4 ta jadval: mijozlar, mahsulotlar, buyurtmalar, buyurtma_qatorlari' },
  { id: 'bosh', title: 'Erkin rejim — bo‘sh baza', note: 'hech qanday jadval yo‘q, hammasini o‘zingiz yaratasiz' },
]

const dvId = ref(route.query.db === 'sqlite' ? 'sqlite' : 'pg')
const dvigatellar = new Map() // id -> dvigatel obyekti
const eng = shallowRef(null)
const loglar = ref({ pg: [], sqlite: [] })
const log = computed(() => loglar.value[dvId.value])
const schema = shallowRef(null)
const plan = shallowRef(null)
const flash = shallowRef(null)
const loading = ref('')
const busy = ref(false)
const konsol = ref(null)
let n = 0

const mashqId = ref(findMashq(route.query.mashq) || route.query.mashq === 'bosh' ? route.query.mashq : '')
const mashq = computed(() => findMashq(mashqId.value))
const cur = ref(0)
const finished = computed(() => mashq.value && cur.value >= mashq.value.steps.length)
const nextMashq = computed(() => { const i = MASHQLAR.findIndex((m) => m.id === mashqId.value); return i >= 0 ? MASHQLAR[i + 1] ?? null : null })
const bobTitle = computed(() => findPage(mashq.value?.bob)?.title ?? '')
const ochiq = ref(new Set()) // yordami ochilgan qadamlar

const VIEW_KEY = 'sql-trenajor:korinish', DONE_KEY = 'sql-trenajor:bajarilgan'
const view = ref('terminal')
try { view.value = localStorage.getItem(VIEW_KEY) === 'jadval' ? 'jadval' : 'terminal' } catch {}
watch(view, (v) => { try { localStorage.setItem(VIEW_KEY, v) } catch {} })
const done = ref(new Set())
try { done.value = new Set(JSON.parse(localStorage.getItem(DONE_KEY) ?? '[]')) } catch {}
const markDone = (id) => { done.value = new Set([...done.value, id]); try { localStorage.setItem(DONE_KEY, JSON.stringify([...done.value])) } catch {} }

const parts = (s) => s.split('`').map((t, i) => ({ t, code: i % 2 === 1 }))

async function dvigatel(id) {
  if (!dvigatellar.has(id)) {
    loading.value = `${DVIGATELLAR[id].name} yuklanmoqda…`
    dvigatellar.set(id, await DVIGATELLAR[id].yarat())
  }
  return dvigatellar.get(id)
}

// bazani mashq (yoki erkin rejim) uchun noldan tayyorlaydi
async function tayyorla() {
  busy.value = true
  const id = dvId.value
  const e = await dvigatel(id)
  loading.value = 'Baza tayyorlanmoqda…'
  await e.reset()
  const m = mashq.value
  await bajar(e, boshlash(id, mashqId.value === 'bosh') + (m ? setupMatni(m, id) : ''))
  eng.value = e
  schema.value = await e.schema()
  plan.value = null
  cur.value = 0
  ochiq.value = new Set()
  const tz = m ? `Mashq «${m.title}» uchun baza tayyorlandi.` : mashqId.value === 'bosh' ? 'Bo‘sh baza tayyor.' : 'Do‘kon bazasi tayyor: diagrammadagi jadvallardan so‘rov yozing.'
  loglar.value[id] = [{ id: ++n, tizim: tz, results: [{}] }]
  loading.value = ''
  busy.value = false
  await nextTick()
  konsol.value?.focus()
}

// tashqi kalit xatosida diagrammadagi tegishli bog'lanish yonadi
function fkFlash(r) {
  const fks = new Set(), tables = new Set()
  if (r.error.constraint) fks.add(r.error.constraint)
  else {
    const m = /^\s*(?:insert\s+into|update|delete\s+from)\s+"?([A-Za-z_][\w]*)/i.exec(r.sql)
    if (m) {
      tables.add(m[1])
      // o'chirishda — shu jadvalga ishora qiluvchi bog'lanishlar
      if (/^\s*delete/i.test(r.sql)) schema.value?.fks.filter((f) => f.to === m[1]).forEach((f) => fks.add(f.name))
    }
  }
  flash.value = { fks, tables }
  setTimeout(() => { if (flash.value?.fks === fks) flash.value = null }, 2600)
}

async function run(text) {
  if (!eng.value || busy.value) return
  busy.value = true
  const res = await bajar(eng.value, text)
  loglar.value[dvId.value].push({ id: ++n, results: res })
  for (const r of res) {
    if (r.error && xatoTuri(eng.value.id, r.error) === 'foreign_key') fkFlash(r)
    if (r.plan) plan.value = { ...r.plan, sql: r.sql }
  }
  schema.value = await eng.value.schema()
  // mashq: har natija navbatdagi qadamni tekshiradi
  const m = mashq.value
  for (const r of res) {
    if (!m || cur.value >= m.steps.length) break
    if (await m.steps[cur.value].check(kontekst(eng.value, [r]))) {
      cur.value++
      if (cur.value === m.steps.length) markDone(m.id)
    }
  }
  busy.value = false
}

const yordam = (s) => yordamMatni(s, dvId.value)
const yoz = (t) => konsol.value?.setInput(t)

watch(mashqId, (id) => {
  router.replace({ query: { ...(id ? { mashq: id } : {}), ...(dvId.value === 'sqlite' ? { db: 'sqlite' } : {}) } })
  tayyorla()
})
watch(dvId, (id) => {
  router.replace({ query: { ...(mashqId.value ? { mashq: mashqId.value } : {}), ...(id === 'sqlite' ? { db: 'sqlite' } : {}) } })
  tayyorla()
})

tayyorla()
onUnmounted(() => { for (const e of dvigatellar.values()) e.close() })
</script>

<template>
  <div class="app">
    <header>
      <div class="title">
        <strong>SQL trenajori</strong>
        <span class="muted">haqiqiy ma’lumotlar bazasi — brauzer ichida</span>
      </div>
      <div class="seg" role="group" aria-label="Ma’lumotlar bazasi">
        <button v-for="(d, id) in DVIGATELLAR" :key="id" type="button" :class="{ on: dvId === id }" :disabled="busy" @click="dvId = id">{{ d.name }}</button>
      </div>
      <MashqTanlash v-model="mashqId" class="pick" :mashqlar="MASHQLAR" :erkin="ERKIN" :done="done" :disabled="busy" />
      <button type="button" class="btn" :disabled="busy" title="Bazani boshlang‘ich holatiga qaytarish" @click="tayyorla">Qaytadan</button>
      <RouterLink to="/sql" class="back">← Qo‘llanmaga qaytish</RouterLink>
    </header>
    <main>
      <div class="left">
        <div class="panel kons">
          <SqlKonsol v-if="eng" ref="konsol" v-model:view="view" :dvigatel="eng" :log="log" :schema="schema" :busy="busy" @run="run" @plan="(r) => (plan = { ...r.plan, sql: r.sql })" />
          <div v-if="loading" class="boot"><div class="spin"></div><p>{{ loading }}</p></div>
        </div>
        <div class="panel pastki">
          <h2>{{ mashq ? 'Mashq' : 'Qo‘llanma' }}</h2>
          <div v-if="mashq" class="mashq">
            <h3>{{ mashq.title }}</h3>
            <p class="intro">{{ mashq.intro }}</p>
            <ol class="steps">
              <li v-for="(s, i) in mashq.steps" :key="i" :class="{ ok: i < cur, cur: i === cur, keyin: i > cur }">
                <p><template v-for="(p, k) in parts(s.text)" :key="k"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template></p>
                <template v-if="i <= cur">
                  <button v-if="i === cur && !ochiq.has(i)" type="button" class="yordam" @click="ochiq = new Set([...ochiq, i])">Yordam: javobni ko‘rsatish</button>
                  <button v-else type="button" class="cmd" title="Konsolga yozish" @click="yoz(yordam(s))"><pre v-html="rangla(yordam(s))" /></button>
                </template>
                <p v-if="i < cur" class="natija"><template v-for="(p, k) in parts(s.natija)" :key="k"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template></p>
              </li>
            </ol>
            <div v-if="finished" class="tugadi">
              <strong>✓ Mashq tugadi.</strong> Konsolda erkin davom etishingiz mumkin.
              <button v-if="nextMashq" type="button" class="btn" @click="mashqId = nextMashq.id">Keyingi: {{ nextMashq.title }} →</button>
            </div>
            <RouterLink :to="mashq.bob" class="bob">Mavzu bo‘yicha bob: {{ bobTitle }}</RouterLink>
          </div>
          <div v-else class="mashq">
            <p class="intro" v-if="mashqId !== 'bosh'">Do‘konning to‘rtta jadvali diagrammada. Sarlavhasini bosing — ichini ko‘rish so‘rovi konsolga yoziladi. Masalan:</p>
            <p class="intro" v-else>Baza bo‘sh. Jadval yarating — u diagrammada paydo bo‘ladi:</p>
            <button
              v-for="t in mashqId === 'bosh' ? ['CREATE TABLE talabalar (\n  id integer PRIMARY KEY,\n  ism text NOT NULL\n);'] : ['SELECT * FROM mijozlar;', 'SELECT kategoriya, count(*), avg(narx)\nFROM mahsulotlar\nGROUP BY kategoriya;', 'EXPLAIN SELECT * FROM buyurtmalar WHERE mijoz_id = 1;']"
              :key="t" type="button" class="cmd" @click="yoz(t)"
            ><pre v-html="rangla(t)" /></button>
            <p class="tips"><b>Enter</b> — so‘rov <code>;</code> bilan tugagan bo‘lsa bajariladi · <b>Shift+Enter</b> — yangi qator · <b>Ctrl/⌘+Enter</b> — darhol bajarish · <b>Tab</b> — maslahat · <b>↑↓</b> — tarix</p>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="panel"><h2>ER diagramma</h2><ErDiagramma :key="dvId + mashqId" :schema="schema" :flash="flash" @ochish="(t) => yoz(`SELECT * FROM ${t} LIMIT 20;`)" /></div>
        <div class="panel">
          <h2>So‘rov rejasi (EXPLAIN)</h2>
          <div class="reja">
            <template v-if="plan">
              <pre class="rsql" v-html="rangla(plan.sql)" />
              <p v-if="plan.total != null" class="muted">bajarilish vaqti: {{ plan.total.toFixed(3) }} ms<template v-if="plan.planning != null"> · rejalash: {{ plan.planning.toFixed(3) }} ms</template></p>
              <ul class="tree"><RejaTugun :n="plan.root" :total="plan.total" /></ul>
            </template>
            <p v-else class="muted pad">
              <code>EXPLAIN</code> bilan boshlangan so‘rov yozing (PostgreSQL’da <code>EXPLAIN ANALYZE</code> haqiqiy vaqtni ham ko‘rsatadi,
              SQLite’da <code>EXPLAIN QUERY PLAN</code>) — reja shu yerda daraxt bo‘lib chiziladi.
            </p>
          </div>
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
.muted { color: var(--text-subtle); font-size: 12.5px; }
.seg { display: flex; padding: 3px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-sunken); }
.seg button { padding: 5px 12px; border: 0; border-radius: 6px; background: none; color: var(--text-muted); font: 600 13px var(--font-sans); cursor: pointer; }
.seg button.on { background: var(--bg-elevated); color: var(--accent-text); box-shadow: var(--shadow-sm); }
.btn { padding: 6px 12px; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); background: var(--bg-elevated); color: var(--text); font: inherit; font-size: 13px; cursor: pointer; }
.btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent-text); }
.back { margin-left: auto; color: var(--text-muted); font-size: 13px; text-decoration: none; white-space: nowrap; }
.back:hover { color: var(--accent-text); }
main { flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(440px, 1fr) minmax(440px, 1.1fr); gap: 10px; padding: 10px; }
.left, .right { display: grid; gap: 10px; min-height: 0; }
.left { grid-template-rows: 1.55fr 1fr; }
.right { grid-template-rows: 1.25fr 1fr; }
.panel { position: relative; display: flex; flex-direction: column; min-height: 0; overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-elevated); box-shadow: var(--shadow-sm); }
.panel > :not(h2) { flex: 1; min-height: 0; }
h2 { margin: 0; padding: 8px 14px; border-bottom: 1px solid var(--border); color: var(--text-subtle); font: 700 11px var(--font-sans); letter-spacing: .08em; text-transform: uppercase; }
.kons { border-color: var(--code-bg); background: var(--code-bg); }
.boot { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; background: var(--code-bg); color: #9aa6ba; }
.spin { width: 34px; height: 34px; border: 3px solid #263044; border-top-color: #7ee787; border-radius: 50%; animation: s .9s linear infinite; }
@keyframes s { to { transform: rotate(1turn); } }
.mashq { overflow: auto; padding: 10px 14px 14px; }
.mashq h3 { margin: 4px 0 6px; font-size: 16px; }
.intro { margin: 0 0 12px; color: var(--text-muted); font-size: 13.5px; line-height: 1.5; }
.steps { margin: 0; padding: 0; list-style: none; counter-reset: q; }
.steps li { position: relative; padding: 6px 0 10px 34px; counter-increment: q; }
.steps li::before { content: counter(q); position: absolute; left: 0; top: 4px; width: 22px; height: 22px; display: grid; place-items: center; border: 1px solid var(--border); border-radius: 50%; background: var(--bg-sunken); color: var(--text-subtle); font: 700 12px var(--font-sans); }
.steps li.cur::before { border-color: var(--accent); background: var(--accent); color: var(--bg-elevated); }
.steps li.ok::before { content: '✓'; border-color: var(--success); background: var(--success-soft); color: var(--success); }
.steps li.keyin { opacity: .55; }
.steps p { margin: 0 0 6px; font-size: 13.5px; line-height: 1.45; }
.cmd { display: block; width: 100%; margin: 4px 0; padding: 7px 10px; border: 0; border-radius: var(--radius-sm); background: var(--code-bg); color: #e6e9f0; text-align: left; cursor: pointer; }
.cmd pre { margin: 0; font: 12.5px/1.45 var(--font-mono); white-space: pre-wrap; }
.cmd:hover { outline: 2px solid var(--accent); }
.yordam { padding: 4px 10px; border: 1px dashed var(--border-strong); border-radius: var(--radius-sm); background: none; color: var(--text-muted); font: inherit; font-size: 12.5px; cursor: pointer; }
.yordam:hover { border-color: var(--accent); color: var(--accent-text); }
.natija { margin-top: 8px !important; padding: 8px 10px; border-radius: var(--radius-sm); background: var(--success-soft); }
.natija code, .steps code, .intro code, .tips code, .pad code { padding: 1px 4px; border-radius: 4px; background: var(--bg-sunken); font: 12.5px var(--font-mono); }
.tugadi { display: grid; justify-items: start; gap: 8px; margin: 6px 0 12px; padding: 10px 12px; border: 1px solid var(--success); border-radius: var(--radius-sm); font-size: 13.5px; }
.bob { display: inline-block; margin-top: 4px; color: var(--accent-text); font-size: 13px; }
.tips { margin: 12px 0 0; color: var(--text-subtle); font-size: 12.5px; line-height: 1.6; }
.reja { overflow: auto; padding: 10px 14px; }
.rsql { margin: 0 0 4px; padding: 6px 10px; border-radius: var(--radius-sm); background: var(--code-bg); color: #e6e9f0; font: 12.5px/1.45 var(--font-mono); white-space: pre-wrap; }
.tree { display: flex; justify-content: center; margin: 0; padding: 0; }
.pad { padding: 10px 0; line-height: 1.6; }
:deep(.s-kw) { color: #ff9ec4; } :deep(.s-str) { color: #9ede9b; } :deep(.s-num) { color: #f5c77e; } :deep(.s-com) { color: #7f8a9e; } :deep(.s-fn) { color: #8dc6ff; } :deep(.s-id) { color: #c7a6ff; }
@media (max-width: 1100px) {
  .app { height: auto; min-height: calc(100vh - var(--topbar-height)); }
  main { grid-template-columns: minmax(0, 1fr); }
  .left { grid-template-rows: 70vh 50vh; }
  .right { grid-template-rows: 60vh 50vh; }
}
@media (max-width: 640px) {
  header { padding: 10px 16px; }
  .title .muted { display: none; }
  .pick { flex: 1 1 100%; }
}
</style>
