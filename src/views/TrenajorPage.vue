<script setup>
// Git trenajori: brauzerdagi Linux (v86) ichida haqiqiy git, yonida graf, uch quti va .git papka.
// Ikki rejim: erkin (~/loyiha — bo'sh papka) va tayyor mashq (?mashq=<id>, src/trenajor/mashqlar.js).
import { computed, nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Terminal from '@/trenajor/Terminal.vue'
import Graf from '@/trenajor/Graf.vue'
import UchQuti from '@/trenajor/UchQuti.vue'
import GitPapka from '@/trenajor/GitPapka.vue'
import MashqTanlash from '@/trenajor/MashqTanlash.vue'
import { startVM } from '@/trenajor/vm.js'
import { parseHolat, diffHolat } from '@/trenajor/holat.js'
import { MASHQLAR, findMashq, setupScript } from '@/trenajor/mashqlar.js'
import { findPage } from '@/docs'

const route = useRoute()
const router = useRouter()
const term = ref(null)
const mashqEl = ref(null)
const holat = shallowRef(null)
const diff = shallowRef(null)
const log = ref([])
const stage = ref('boot') // boot -> setup -> ready
const progress = ref('')
const bootStart = performance.now()
const bootTime = ref(0)
let vm = null
let pendingCmd = null
let starting = false // mashq tayyorlanmoqda: keyingi holat — boshlang'ich holat, izoh yozilmaydi

// ---------- mashqlar ----------
const mashqId = ref(findMashq(route.query.mashq) ? route.query.mashq : '')
const mashq = computed(() => findMashq(mashqId.value))
const cur = ref(0) // joriy qadam
const tab = ref(mashq.value ? 'mashq' : 'log')
const bobTitle = computed(() => findPage(mashq.value?.bob)?.title ?? '')
const finished = computed(() => mashq.value && cur.value >= mashq.value.steps.length)
const nextMashq = computed(() => {
  const i = MASHQLAR.findIndex((m) => m.id === mashqId.value)
  return i >= 0 ? MASHQLAR[i + 1] ?? null : null
})

const DONE_KEY = 'git-trenajor:bajarilgan'
const done = ref(new Set())
try { done.value = new Set(JSON.parse(localStorage.getItem(DONE_KEY) ?? '[]')) } catch {}
function markDone(id) {
  done.value = new Set([...done.value, id])
  try { localStorage.setItem(DONE_KEY, JSON.stringify([...done.value])) } catch {}
}

// `kod` qismlari bilan matn: ['oddiy', 'kod', 'oddiy', ...]
const parts = (s) => s.split('`').map((t, i) => ({ t, code: i % 2 === 1 }))

async function startMashq(m) {
  starting = true
  cur.value = 0
  log.value = []
  tab.value = 'mashq'
  // /tmp VM ichida tmpfs — 9p orqali yozilgan fayl u yerda ko'rinmaydi; nom har safar yangi (9p keshi)
  const f = `/usr/local/lib/trenajor/m-${m.id}-${Date.now()}.sh`
  await vm.writeFile(f, setupScript(m))
  // Ctrl+U — yarim yozilgan qatorni tozalaydi; bosh joy — buyruq tarixga yozilmaydi
  vm.send(`\x15 clear; bash ${f}; rm -f ${f}; cd ~/mashq/${m.id}; clear\r`)
  term.value.focus()
}

function startFree() {
  starting = true
  log.value = []
  tab.value = 'log'
  vm.send('\x15 cd ~/loyiha; clear; trenajor-salom\r')
  term.value.focus()
}

// tugmani bosganda buyruq terminalga yoziladi, Enter'ni o'quvchi o'zi bosadi
function typeCmd(cmd) {
  vm.send('\x15' + cmd)
  term.value.focus()
}

// joriy qadam (yoki yakun) panel ichida ko'rinib tursin — sahifa surilmaydi
watch(cur, async () => {
  await nextTick()
  const box = mashqEl.value, el = box?.querySelector('.tugadi') ?? box?.querySelector('li.cur')
  if (!el) return
  const y = el.getBoundingClientRect().top - box.getBoundingClientRect().top
  box.scrollTo({ top: box.scrollTop + y - 12, behavior: 'smooth' })
})

watch(mashqId, (id) => {
  router.replace({ query: id ? { mashq: id } : {} })
  if (stage.value !== 'ready') return
  if (mashq.value) startMashq(mashq.value)
  else startFree()
})

function onHolat(text) {
  const next = parseHolat(text)
  if (starting) {
    starting = false
    pendingCmd = null
    holat.value = next
    diff.value = null
    return
  }
  const d = diffHolat(holat.value, next)
  if (pendingCmd && (pendingCmd.startsWith('git') || d.izoh.length)) {
    log.value.unshift({ id: Date.now(), cmd: pendingCmd, items: d.izoh.length ? d.izoh : [{ t: 'muted', m: 'Repo holati o‘zgarmadi.' }] })
    if (log.value.length > 60) log.value.length = 60
  }
  const m = mashq.value
  if (m && pendingCmd && cur.value < m.steps.length && m.steps[cur.value].check(next, pendingCmd)) {
    cur.value++
    if (cur.value === m.steps.length) markDone(m.id)
  }
  pendingCmd = null
  holat.value = next
  diff.value = d
}

function onPrompt() {
  if (stage.value === 'boot') {
    stage.value = 'setup'
    const { cols, rows } = term.value.size()
    // bosh joy bilan — tarixga yozilmaydi (HISTCONTROL=ignorespace)
    vm.send(` stty cols ${cols} rows ${rows}; mkdir -p ~/loyiha; cd ~/loyiha; clear; trenajor-salom\r`)
  } else if (stage.value === 'setup') {
    stage.value = 'ready'
    bootTime.value = ((performance.now() - bootStart) / 1000).toFixed(1)
    if (mashq.value) startMashq(mashq.value)
    else term.value.focus()
  }
}

onMounted(() => {
  vm = startVM({
    onOutput: (chunk) => term.value.write(chunk),
    onProgress: (e) => {
      if (e.lengthComputable && e.file_name) progress.value = `${e.file_name.split('/').pop()} — ${Math.round((e.loaded / e.total) * 100)}%`
    },
  })
})

// Sahifadan chiqilganda VM to'xtaydi (aks holda fonda protsessorni band qiladi)
onUnmounted(() => vm?.raw.destroy())
</script>

<template>
  <div class="app">
    <header>
      <div class="title">
        <strong>Git trenajori</strong>
        <span class="muted">haqiqiy git · brauzerdagi Linux<template v-if="bootTime"> · {{ bootTime }} s da ishga tushdi</template></span>
      </div>
      <MashqTanlash v-model="mashqId" class="pick" :done="done" :disabled="stage !== 'ready'" />
      <button v-if="mashq" type="button" class="btn" :disabled="stage !== 'ready'" @click="startMashq(mashq)">Qaytadan</button>
      <RouterLink to="/git" class="back">← Qo‘llanmaga qaytish</RouterLink>
    </header>
    <main>
      <div class="left">
        <div class="panel term-panel">
          <Terminal ref="term" :holat="holat" @send="(t) => vm?.send(t)" @holat="onHolat" @prompt="onPrompt" @command="(c) => (pendingCmd = c)" />
          <div v-if="stage !== 'ready'" class="boot">
            <div class="spin"></div>
            <p>Linux va git yuklanmoqda…</p>
            <small>{{ progress }}</small>
          </div>
        </div>
        <div class="panel izoh">
          <div class="tabs">
            <button v-if="mashq" type="button" :class="{ on: tab === 'mashq' }" @click="tab = 'mashq'">Mashq</button>
            <button type="button" :class="{ on: tab === 'log' || !mashq }" @click="tab = 'log'">Nima bo‘ldi</button>
          </div>
          <div v-if="mashq && tab === 'mashq'" ref="mashqEl" class="mashq">
            <h3>{{ mashq.title }}</h3>
            <p class="intro">{{ mashq.intro }}</p>
            <ol class="steps">
              <li v-for="(s, i) in mashq.steps" :key="i" :class="{ ok: i < cur, cur: i === cur, keyin: i > cur }">
                <p>{{ s.text }}</p>
                <button v-if="i <= cur" type="button" class="cmd" title="Terminalga yozish (Enter'ni o‘zingiz bosasiz)" @click="typeCmd(s.cmd)">$ {{ s.cmd }}</button>
                <p v-if="i < cur" class="natija"><template v-for="(p, k) in parts(s.natija)" :key="k"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template></p>
              </li>
            </ol>
            <div v-if="finished" class="tugadi">
              <strong>✓ Mashq tugadi.</strong> Terminalda erkin davom etishingiz mumkin.
              <button v-if="nextMashq" type="button" class="btn" @click="mashqId = nextMashq.id">Keyingi: {{ nextMashq.title }} →</button>
            </div>
            <RouterLink :to="mashq.bob" class="bob">Mavzu bo‘yicha bob: {{ bobTitle }}</RouterLink>
          </div>
          <div v-else class="log">
            <TransitionGroup name="log" tag="div">
              <div v-for="e in log" :key="e.id" class="entry">
                <code>$ {{ e.cmd }}</code>
                <p v-for="(it, i) in e.items" :key="i" :class="it.t">{{ it.m }}</p>
              </div>
            </TransitionGroup>
            <p v-if="!log.length" class="muted">Har git buyrug‘idan keyin bu yerda o‘zbekcha izoh chiqadi.</p>
          </div>
        </div>
      </div>
      <div class="mid">
        <div class="panel"><h2>Commit grafi</h2><Graf :holat="holat" :diff="diff" /></div>
        <div class="panel"><h2>Uch quti</h2><UchQuti :holat="holat" /></div>
      </div>
      <div class="panel right"><h2>.git papka</h2><GitPapka :holat="holat" :diff="diff" :read-file="(p) => vm.readFile(p)" /></div>
    </main>
  </div>
</template>

<style scoped>
/* Sayt mavzusi (yorug'/qorong'i) tokenlari: src/styles/main.css. Terminal — kod bloklari kabi doim to'q. */
.app {
  /* graf yo'laklari: yorug' mavzuda to'qroq, qorong'ida ochroq */
  --lane-0: #16a34a; --lane-1: #2563eb; --lane-2: #db2777; --lane-3: #b45309;
  --lane-4: #7c3aed; --lane-5: #ea580c; --lane-6: #0d9488; --lane-7: #dc2626;
  --lane-ink: #fff;
  height: calc(100vh - var(--topbar-height)); display: flex; flex-direction: column;
  background: var(--bg); color: var(--text); font-family: var(--font-sans);
}
:global(:root[data-theme="dark"]) .app {
  --lane-0: #4ade80; --lane-1: #60a5fa; --lane-2: #f472b6; --lane-3: #facc15;
  --lane-4: #a78bfa; --lane-5: #fb923c; --lane-6: #2dd4bf; --lane-7: #f87171;
  --lane-ink: #0d1117;
}
header { display: flex; flex-wrap: wrap; gap: 10px 16px; align-items: center; padding: 10px 18px; border-bottom: 1px solid var(--border); background: var(--bg-elevated); }
.title { display: grid; }
.title strong { font-size: 16px; }
.muted { color: var(--text-subtle); font-size: 12.5px; }
.btn { padding: 6px 12px; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); background: var(--bg-elevated); color: var(--text); font: inherit; font-size: 13px; cursor: pointer; }
.btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent-text); }
.back { margin-left: auto; color: var(--text-muted); font-size: 13px; text-decoration: none; white-space: nowrap; }
.back:hover { color: var(--accent-text); }
main { flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(420px, 1fr) minmax(420px, 1.25fr) minmax(280px, .75fr); gap: 10px; padding: 10px; }
.left, .mid { display: grid; gap: 10px; min-height: 0; }
.left { grid-template-rows: 1.5fr 1fr; }
.mid { grid-template-rows: 1.4fr 1fr; }
.panel { position: relative; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow-sm); overflow: hidden; display: flex; flex-direction: column; min-height: 0; }
.panel > :not(h2):not(.tabs) { flex: 1; min-height: 0; }
h2 { margin: 0; padding: 8px 14px; font: 700 11px var(--font-sans); color: var(--text-subtle); text-transform: uppercase; letter-spacing: .08em; border-bottom: 1px solid var(--border); }
.term-panel { padding: 0; background: var(--code-bg); border-color: var(--code-bg); }
.boot { position: absolute; inset: 0; background: var(--code-bg); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; color: #9aa6ba; }
.boot small { color: #6b7689; font-family: var(--font-mono); }
.spin { width: 34px; height: 34px; border: 3px solid #263044; border-top-color: #7ee787; border-radius: 50%; animation: s 0.9s linear infinite; }
@keyframes s { to { transform: rotate(1turn); } }

.tabs { display: flex; gap: 2px; padding: 0 8px; border-bottom: 1px solid var(--border); }
.tabs button { padding: 8px 10px; border: 0; border-bottom: 2px solid transparent; background: none; color: var(--text-subtle); font: 700 11px var(--font-sans); text-transform: uppercase; letter-spacing: .08em; cursor: pointer; }
.tabs button.on { color: var(--accent-text); border-bottom-color: var(--accent); }
.log, .mashq { overflow: auto; padding: 8px 14px 14px; }
.entry { padding: 8px 0; border-bottom: 1px dashed var(--border); }
.entry code { color: var(--accent-text); font: 13px var(--font-mono); }
.entry p { margin: 4px 0 0; font-size: 13.5px; line-height: 1.45; color: var(--text-muted); padding-left: 10px; border-left: 2px solid var(--info); }
.entry p.ok { border-color: var(--success); } .entry p.warn { border-color: var(--warning); } .entry p.err { border-color: var(--danger); color: var(--danger); } .entry p.muted { border-color: var(--border-strong); color: var(--text-subtle); }
.log > .muted { padding: 4px 0; }
.log-enter-active { transition: all .4s; } .log-enter-from { opacity: 0; transform: translateY(-10px); }

.mashq h3 { margin: 4px 0 6px; font-size: 16px; }
.intro { margin: 0 0 12px; color: var(--text-muted); font-size: 13.5px; line-height: 1.5; }
.steps { margin: 0; padding: 0; list-style: none; counter-reset: q; }
.steps li { position: relative; padding: 6px 0 10px 34px; counter-increment: q; }
.steps li::before { content: counter(q); position: absolute; left: 0; top: 4px; width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; font: 700 12px var(--font-sans); background: var(--bg-sunken); color: var(--text-subtle); border: 1px solid var(--border); }
.steps li.cur::before { background: var(--accent); color: var(--bg-elevated); border-color: var(--accent); }
.steps li.ok::before { content: '✓'; background: var(--success-soft); color: var(--success); border-color: var(--success); }
.steps li.keyin { opacity: .55; }
.steps p { margin: 0 0 6px; font-size: 13.5px; line-height: 1.45; }
.cmd { display: block; max-width: 100%; padding: 6px 10px; border: 0; border-radius: var(--radius-sm); background: var(--code-bg); color: #7ee787; font: 13px var(--font-mono); text-align: left; white-space: pre-wrap; word-break: break-all; cursor: pointer; }
.cur .cmd { outline: 2px solid color-mix(in srgb, var(--accent) 45%, transparent); }
.cmd:hover { outline: 2px solid var(--accent); }
.natija { margin-top: 8px !important; padding: 8px 10px; border-radius: var(--radius-sm); background: var(--success-soft); color: var(--text); }
.natija code, .intro code { font: 12.5px var(--font-mono); padding: 1px 4px; border-radius: 4px; background: var(--bg-elevated); }
.tugadi { margin: 6px 0 12px; padding: 10px 12px; border: 1px solid var(--success); border-radius: var(--radius-sm); font-size: 13.5px; display: grid; gap: 8px; justify-items: start; }
.bob { display: inline-block; margin-top: 4px; color: var(--accent-text); font-size: 13px; }

/* Tor ekranda ustunlar ketma-ket, sahifa pastga suriladi */
@media (max-width: 1180px) {
  .app { height: auto; min-height: calc(100vh - var(--topbar-height)); }
  main { grid-template-columns: minmax(0, 1fr); }
  .left { grid-template-rows: 70vh 50vh; }
  .mid { grid-template-rows: 60vh 40vh; }
  .right { height: 70vh; }
}
@media (max-width: 640px) {
  header { padding: 10px 16px; }
  .title .muted { display: none; }
  .pick { flex: 1 1 100%; }
}
</style>
