<script setup>
// Tizim dizayni simulyatori: o'quvchi komponentlarni qo'shadi (server, load balancer, kesh, replika, CDN) va
// yuklamani o'zgartiradi — model (src/arxitektura/model.js) har 0,1 soniyada oqim, bandlik, javob vaqti va
// xatolarni hisoblaydi. Har o'zgarishdan keyin «Nima bo'ldi?» — oddiy tilda. Model TAXMINIY (sahifada aytiladi).
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sxema from '@/arxitektura/Sxema.vue'
import Tanishtiruv from '@/arxitektura/Tanishtiruv.vue'
import { TANISHTIRUV, komponentIzohi } from '@/arxitektura/izoh.js'
import MashqTanlash from '@/trenajor/MashqTanlash.vue'
import { BOSHLANGICH, TAXMIN, qadam, yangiHolat } from '@/arxitektura/model.js'
import { hikoya } from '@/arxitektura/hikoya.js'
import { ERKIN, MASHQLAR, findMashq } from '@/arxitektura/mashqlar.js'
import { findPage } from '@/docs'

// Vue proxy'ni structuredClone nusxalay olmaydi — sozlama oddiy JSON
const klon = (o) => JSON.parse(JSON.stringify(o))
const route = useRoute()
const router = useRouter()

const mashqId = ref(findMashq(route.query.mashq) ? route.query.mashq : '')
const mashq = computed(() => findMashq(mashqId.value))
const c = ref(klon(BOSHLANGICH))
const m = shallowRef(null)
const tanlangan = ref(null)
const tarix = ref([]) // { p95, xato } har 0,5 s
const qadamlar = ref([])
const takror = ref(0)
const cur = ref(0)
const ochiq = ref(new Set())
const finished = computed(() => mashq.value && cur.value >= mashq.value.steps.length)
const nextMashq = computed(() => { const i = MASHQLAR.findIndex((x) => x.id === mashqId.value); return i >= 0 ? MASHQLAR[i + 1] ?? null : null })
const bobTitle = computed(() => findPage(mashq.value?.bob)?.title ?? '')

// ── tanishtiruv: birinchi kirishda o'zi ochiladi (mashq havolasi bilan kelinsa — yo'q), keyin — tugma bilan ──
const TANISH_KEY = 'arxitektura-trenajor:tanishtirildi'
const tanishtiruv = ref(false)
const ustida = ref(null)
const izohMatn = computed(() => komponentIzohi(ustida.value, c.value, m.value))
function tanishtir() {
  if (mashqId.value) mashqId.value = ''
  else boshla()
  tanishtiruv.value = true
}
function tanishtiruvTugadi() {
  tanishtiruv.value = false
  try { localStorage.setItem(TANISH_KEY, '1') } catch {}
}

const DONE_KEY = 'arxitektura-trenajor:bajarilgan'
const done = ref(new Set())
try { done.value = new Set(JSON.parse(localStorage.getItem(DONE_KEY) ?? '[]')) } catch {}
const markDone = (id) => { done.value = new Set([...done.value, id]); try { localStorage.setItem(DONE_KEY, JSON.stringify([...done.value])) } catch {} }
const parts = (s) => (s ?? '').split('`').map((t, i) => ({ t, code: i % 2 === 1 }))

// ── simulyatsiya: har 0,1 s model bir qadam; mashq sharti 2 s davomida bajarilsa — qadam o'tadi ─────
let holat = yangiHolat()
let sanoq = 0
let barqarorlik = 0
const timer = setInterval(() => {
  m.value = qadam(holat, c.value, 0.1)
  if (++sanoq % 5 === 0) {
    tarix.value = [...tarix.value.slice(-119), { p95: m.value.p95, xato: m.value.xato }]
  }
  const mq = mashq.value
  if (mq && cur.value < mq.steps.length) {
    const ok = mq.steps[cur.value].check({ c: c.value, m: m.value, tanlangan: tanlangan.value })
    barqarorlik = ok ? barqarorlik + 1 : 0
    // bosish qadami darhol, raqamli shartlar — 2 soniya ushlanib tursa
    if (ok && (mq.steps[cur.value].yechim?.tanla || barqarorlik >= 20)) {
      cur.value++
      barqarorlik = 0
      if (cur.value === mq.steps.length) markDone(mq.id)
    }
  }
}, 100)
onBeforeUnmount(() => clearInterval(timer))

// ── hikoya: sozlama o'zgarganda (biroz kutib) — eski va yangi holat solishtiriladi ─────────────────
let oxirgi = null
let hTimer = 0
watch(c, () => {
  clearTimeout(hTimer)
  hTimer = setTimeout(() => {
    qadamlar.value = hikoya(oxirgi, c.value)
    oxirgi = klon(c.value)
    takror.value++
  }, 350)
}, { deep: true, immediate: true })

// ── boshqaruv ─────────────────────────────────────────────────────────────────────────────────
function server(d) {
  const s = [...c.value.serverlar]
  if (d > 0 && s.length < 16) s.push(true)
  if (d < 0 && s.length > 1) s.pop()
  c.value.serverlar = s
}
function yiqit(i) {
  const s = [...c.value.serverlar]
  s[i] = !s[i]
  c.value.serverlar = s
}
const replika = (d) => (c.value.replikalar = Math.max(0, Math.min(4, c.value.replikalar + d)))
function yechimniQoy(s) {
  const { tanla, ...oz } = s.yechim
  if (tanla) tanlangan.value = tanla
  c.value = { ...c.value, ...klon(oz) }
}

function boshla() {
  c.value = klon(mashq.value ? mashq.value.sozlama : BOSHLANGICH)
  holat = yangiHolat()
  tarix.value = []
  tanlangan.value = null
  oxirgi = null
  cur.value = 0
  barqarorlik = 0
  ochiq.value = new Set()
}
watch(mashqId, (id) => {
  router.replace({ query: id ? { mashq: id } : {} })
  boshla()
})
boshla()
try { if (!mashqId.value && !localStorage.getItem(TANISH_KEY)) tanishtiruv.value = true } catch {}

// ── ko'rsatkichlar ────────────────────────────────────────────────────────────────────────────
const holatRang = (p95, xato) => (xato >= 0.05 || p95 >= 1000 ? 'yomon' : xato >= 0.01 || p95 >= 400 ? 'ortacha' : 'yaxshi')
function chiziq(k, max) {
  const t = tarix.value
  if (t.length < 2) return ''
  return t.map((x, i) => `${(i / 119) * 200},${40 - Math.min(1, x[k] / max) * 38}`).join(' ')
}
const son = (n) => Math.round(n).toLocaleString('uz')
</script>

<template>
  <div class="app">
    <header class="bosh">
      <div class="title">
        <strong>Tizim dizayni simulyatori</strong>
        <span class="muted">server, load balancer, kesh, replika, CDN — yuklama ostida</span>
      </div>
      <MashqTanlash v-model="mashqId" class="pick" :mashqlar="MASHQLAR" :erkin="ERKIN" :done="done" />
      <button type="button" class="btn" title="Boshlang‘ich holatga qaytarish" @click="boshla">Qaytadan</button>
      <button type="button" class="btn" title="Simulyator bilan qadamma-qadam tanishuv" @click="tanishtir">🎓 Tanishtiruv</button>
      <RouterLink to="/arxitektura" class="back">← Qo‘llanmaga qaytish</RouterLink>
    </header>
    <main v-if="m">
      <div class="chap">
        <div class="panel boshqaruv">
          <h2>Boshqaruv</h2>
          <div class="ichi">
            <label class="sl">
              <span>👥 Foydalanuvchi so‘rovlari <b>{{ son(c.oqim) }} /s</b></span>
              <input v-model.number="c.oqim" type="range" min="100" max="20000" step="100" />
            </label>
            <div class="tez">
              <button type="button" data-t="chooqi" @click="c.oqim = Math.min(20000, c.oqim * 3)">Cho‘qqi vaqti ×3</button>
              <button type="button" @click="c.oqim = Math.max(100, Math.round(c.oqim / 300) * 100)">Tinch vaqt ÷3</button>
            </div>
            <label class="sl"><span>📖 O‘qish ulushi <b>{{ Math.round(c.oqishUlushi * 100) }}%</b></span><input v-model.number="c.oqishUlushi" type="range" min="0.1" max="0.99" step="0.01" /></label>
            <label class="sl"><span>🖼️ Statik fayllar <b>{{ Math.round(c.statikUlushi * 100) }}%</b></span><input v-model.number="c.statikUlushi" type="range" min="0" max="0.8" step="0.05" /></label>
            <div class="qator" data-t="server-qosh"><span>🖥️ Serverlar</span><div class="son"><button type="button" @click="server(-1)">−</button><b>{{ c.serverlar.length }}</b><button type="button" @click="server(1)">+ Server</button></div></div>
            <label class="qator"><span>🔀 Load balancer</span><input v-model="c.lb" type="checkbox" class="sw" /></label>
            <label class="qator"><span>⚡ Kesh</span><input v-model="c.kesh" type="checkbox" class="sw" /></label>
            <label v-if="c.kesh" class="sl ich"><span>keshda topilish <b>{{ Math.round(c.keshHit * 100) }}%</b></span><input v-model.number="c.keshHit" type="range" min="0.5" max="0.95" step="0.05" /></label>
            <div class="qator"><span>📚 Replikalar</span><div class="son"><button type="button" @click="replika(-1)">−</button><b>{{ c.replikalar }}</b><button type="button" @click="replika(1)">+ Replika</button></div></div>
            <label class="qator"><span>🌍 CDN</span><input v-model="c.cdn" type="checkbox" class="sw" /></label>
          </div>
        </div>
        <div class="panel taxmin">
          <h2>Taxminlar</h2>
          <div class="ichi">
            <p>Bu — <b>soddalashtirilgan model</b>, o‘rgatish uchun. Raqamlar tanlangan, o‘lchanmagan: haqiqiy sig‘im yuklama sinovida aniqlanadi (90-bob).</p>
            <ul>
              <li>Bitta server: {{ TAXMIN.server.sigim }} so‘rov/s, {{ TAXMIN.server.vaqt }} ms</li>
              <li>Baza: {{ TAXMIN.db.sigim }} so‘rov/s, {{ TAXMIN.db.vaqt }} ms · kesh: {{ TAXMIN.kesh.vaqt }} ms</li>
              <li>Tarmoq: {{ TAXMIN.tarmoq }} ms · CDN: {{ TAXMIN.cdn.vaqt }} ms · navbat chegarasi: {{ TAXMIN.timeout / 1000 }} s</li>
              <li>Bandlik = oqim ÷ sig‘im; kutish ≈ xizmat vaqti ÷ (1 − bandlik)</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="orta">
        <div class="metrik" data-t="metrik">
          <div class="karta" :class="holatRang(m.p95, 0)">
            <small>Javob vaqti (p95)</small><b>{{ son(m.p95) }} <i>ms</i></b><small>o‘rtacha {{ son(m.ortacha) }} ms</small>
            <svg viewBox="0 0 200 40" preserveAspectRatio="none"><polyline :points="chiziq('p95', 3000)" /></svg>
          </div>
          <div class="karta" :class="holatRang(0, m.xato)">
            <small>Xatolar</small><b>{{ (m.xato * 100).toFixed(1) }} <i>%</i></b><small>{{ son(m.oqim - m.bajarildi) }} so‘rov/s javobsiz</small>
            <svg viewBox="0 0 200 40" preserveAspectRatio="none"><polyline :points="chiziq('xato', 1)" /></svg>
          </div>
          <div class="karta">
            <small>Bajarildi</small><b>{{ son(m.bajarildi) }} <i>/s</i></b><small>{{ c.serverlar.filter(Boolean).length + c.replikalar + 1 + (c.kesh ? 1 : 0) }} ta mashina ishlayapti</small>
          </div>
        </div>
        <div class="panel sx" data-t="sxema">
          <h2>Sxema <span class="muted">— serverni bosing: yiqiladi / tiklanadi · boshqa komponentni bosing: tanlanadi</span></h2>
          <p class="bu-nima" :class="{ bosh: !izohMatn }">{{ izohMatn ?? 'Qutiga sichqonchani olib boring — u nima ekani va hozir qanchalik bandligi shu yerda yoziladi.' }}</p>
          <Sxema :m="m" :c="c" :tanlangan="tanlangan" @server="yiqit" @tanla="(id) => (tanlangan = id)" @ustida="(id) => (ustida = id)" />
        </div>
      </div>
      <div class="ung">
        <div class="panel" data-t="hikoya">
          <h2>Nima bo‘ldi?</h2>
          <ol :key="takror" class="hikoya">
            <li v-for="(q, i) in qadamlar" :key="i" :class="{ yashil: q.yashil, ogoh: q.ogoh }" :style="{ animationDelay: `${i * 0.3}s` }">
              <span class="ikon">{{ q.ikon }}</span>
              <div>
                <p class="sar"><template v-for="(p, k) in parts(q.sarlavha)" :key="k"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template></p>
                <p v-if="q.matn" class="matn"><template v-for="(p, k) in parts(q.matn)" :key="k"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template></p>
              </div>
            </li>
          </ol>
        </div>
        <div class="panel">
          <h2>{{ mashq ? 'Mashq' : 'Qo‘llanma' }}</h2>
          <div v-if="mashq" class="mashq">
            <h3>{{ mashq.title }}</h3>
            <p class="intro">{{ mashq.intro }}</p>
            <ol class="steps">
              <li v-for="(s, i) in mashq.steps" :key="i" :class="{ ok: i < cur, cur: i === cur, keyin: i > cur }">
                <p><template v-for="(p, k) in parts(s.text)" :key="k"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template></p>
                <div v-if="i === cur && s.yechim" class="amallar">
                  <button v-if="!ochiq.has(i)" type="button" class="yordam" @click="ochiq = new Set([...ochiq, i])">Yordam</button>
                  <button v-else type="button" class="btn" @click="yechimniQoy(s)">Yechimni qo‘llash</button>
                </div>
                <p v-if="i < cur" class="natija">{{ s.natija }}</p>
              </li>
            </ol>
            <div v-if="finished" class="tugadi">
              <strong>✓ Mashq tugadi.</strong> Erkin sinab ko‘rishingiz mumkin.
              <button v-if="nextMashq" type="button" class="btn" @click="mashqId = nextMashq.id">Keyingi: {{ nextMashq.title }} →</button>
            </div>
            <RouterLink :to="mashq.bob" class="bob">Mavzu bo‘yicha bob: {{ bobTitle }}</RouterLink>
          </div>
          <div v-else class="mashq">
            <p class="intro">Chapdagi boshqaruv bilan tizimni o‘zgartiring va kuzating: sxemada so‘rovlar oqimi (nuqtalar), har qutida bandlik. Qizil 🔥 — tiqilib qolgan joy.</p>
            <ul class="izoh">
              <li>«Cho‘qqi vaqti ×3» ni bosing — qaysi komponent birinchi tiqiladi?</li>
              <li>Serverni bosib yiqiting — load balancer nima qiladi?</li>
              <li>O‘qish ulushini kamaytiring — kesh va replika qachon yordam bermay qo‘yadi?</li>
            </ul>
            <p class="intro">Yoki yuqoridan mashq tanlang.</p>
          </div>
        </div>
      </div>
    </main>
    <Tanishtiruv v-if="tanishtiruv && m" :qadamlar="TANISHTIRUV" :holat="{ c, m }" @yop="tanishtiruvTugadi" />
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
main { flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(260px, .75fr) minmax(480px, 1.7fr) minmax(320px, 1fr); gap: 10px; padding: 10px; }
.chap, .orta, .ung { display: grid; gap: 10px; min-height: 0; }
.chap { grid-template-rows: auto 1fr; }
.orta { grid-template-rows: auto 1fr; }
.ung { grid-template-rows: 1.15fr 1fr; }
.panel { display: flex; flex-direction: column; min-height: 0; overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-elevated); box-shadow: var(--shadow-sm); }
.panel > :not(h2):not(.bu-nima) { flex: 1; min-height: 0; }
/* qat'iy balandlik: matn o'zgarsa ham sxema surilmasin (aks holda sichqoncha qutidan «chiqib» qoladi) */
.bu-nima { height: 58px; margin: 0; padding: 8px 14px; overflow-y: auto; border-bottom: 1px solid var(--border); background: var(--bg-sunken); color: var(--text); font-size: 13px; line-height: 1.5; box-sizing: border-box; }
.bu-nima.bosh { color: var(--text-subtle); }
h2 { margin: 0; padding: 8px 14px; border-bottom: 1px solid var(--border); color: var(--text-subtle); font: 700 11px var(--font-sans); letter-spacing: .08em; text-transform: uppercase; }
.ichi { overflow: auto; padding: 10px 14px; }
.sl { display: grid; gap: 4px; margin-bottom: 10px; font-size: 13px; }
.sl span { display: flex; justify-content: space-between; }
.sl.ich { margin-left: 22px; }
input[type='range'] { width: 100%; accent-color: var(--accent); }
.tez { display: flex; gap: 6px; margin: -4px 0 12px; }
.tez button, .son button { padding: 3px 9px; border: 1px solid var(--border-strong); border-radius: 6px; background: var(--bg-elevated); color: var(--text); font: inherit; font-size: 12.5px; cursor: pointer; }
.qator { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 0; border-top: 1px solid var(--border); font-size: 13px; cursor: pointer; }
.son { display: flex; align-items: center; gap: 8px; }
.son b { min-width: 18px; text-align: center; }
.sw { width: 34px; height: 18px; accent-color: var(--accent); cursor: pointer; }
.taxmin p, .taxmin li { color: var(--text-muted); font-size: 12.5px; line-height: 1.5; }
.taxmin p { margin: 0 0 6px; }
.taxmin ul { margin: 0; padding-left: 18px; }
.metrik { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.karta { position: relative; display: grid; padding: 10px 12px 6px; border: 1px solid var(--border); border-left-width: 5px; border-radius: var(--radius); background: var(--bg-elevated); }
.karta.yaxshi { border-left-color: #2fbf71; } .karta.ortacha { border-left-color: #f5a524; } .karta.yomon { border-left-color: #e5484d; }
.karta small { color: var(--text-subtle); font-size: 12px; }
.karta b { font: 700 24px var(--font-sans); }
.karta b i { color: var(--text-subtle); font: 400 13px var(--font-sans); }
.karta svg { width: 100%; height: 28px; margin-top: 4px; }
.karta polyline { fill: none; stroke: var(--accent); stroke-width: 1.5; vector-effect: non-scaling-stroke; }
.hikoya { overflow: auto; margin: 0; padding: 10px 14px; list-style: none; }
.hikoya li { display: flex; gap: 10px; padding-bottom: 12px; opacity: 0; animation: chiq .4s ease-out forwards; }
@keyframes chiq { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.hikoya .ikon { flex: none; width: 32px; height: 32px; display: grid; place-items: center; border: 1px solid var(--border); border-radius: 50%; background: var(--bg-sunken); font-size: 16px; }
.hikoya li.yashil .ikon { border-color: var(--success); background: var(--success-soft); }
.hikoya li.ogoh .ikon { border-color: var(--warning); background: var(--warning-soft); }
.sar { margin: 4px 0 0; font-size: 13.5px; font-weight: 600; line-height: 1.4; }
.matn { margin: 3px 0 0; color: var(--text-muted); font-size: 12.5px; line-height: 1.5; }
code { padding: 0 4px; border-radius: 4px; background: var(--bg-sunken); font: 12px var(--font-mono); }
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
.natija { margin-top: 8px !important; padding: 8px 10px; border-radius: var(--radius-sm); background: var(--success-soft); }
.tugadi { display: grid; justify-items: start; gap: 8px; margin: 6px 0 12px; padding: 10px 12px; border: 1px solid var(--success); border-radius: var(--radius-sm); font-size: 13.5px; }
.bob { display: inline-block; margin-top: 4px; color: var(--accent-text); font-size: 13px; }
@media (max-width: 1200px) {
  .app { height: auto; min-height: calc(100vh - var(--topbar-height)); }
  main { grid-template-columns: minmax(0, 1fr); }
  .sx { min-height: 70vh; }
  .ung { grid-template-rows: auto auto; }
}
@media (max-width: 640px) {
  .bosh { padding: 10px 16px; }
  .title .muted { display: none; }
  .pick { flex: 1 1 100%; }
  .metrik { grid-template-columns: 1fr; }
}
</style>
