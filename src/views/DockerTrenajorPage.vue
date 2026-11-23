<script setup>
// Docker trenajori — SIMULYATOR. Brauzerda haqiqiy Docker ishlay olmaydi, shuning uchun sinov VPS'idagi Docker Engine
// 29.9.3 da har buyruq yozib olingan (docker-trenajor/yozuv) va simulyator shu yozuvlar bilan so'zma-so'z solishtiriladi
// (docker-trenajor/test/moslik.mjs). Image'lar, qatlamlar, fayl tizimlari, help va xato matnlari — haqiqiy.
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Terminal from '@/trenajor/Terminal.vue'
import MashqTanlash from '@/trenajor/MashqTanlash.vue'
import Xarita from '@/docker/Xarita.vue'
import { muhitYarat } from '@/docker/muhit'
import { SatrMuharrir } from '@/docker/satr'
import { dockerSuggest } from '@/docker/maslahat'
import { hikoyaYarat } from '@/docker/hikoya'
import { DOCKER_MASHQLAR } from '@/docker/mashqlar'
import { Toxtatildi } from '@/docker/qobiq/ijro'
import { findPage } from '@/docs'

const BASE = import.meta.env.BASE_URL
const term = ref(null)
const muhit = shallowRef(null)
const konteynerRejim = ref(null) // -it sessiya: maslahatlar konteyner buyruqlari bo'yicha
const hikoyalar = ref([])
const tarix = ref([])             // [{ cmd, kod, vaqt }]
let satr = null, avlod = 0, offHodisa = null

// ---------------------------------------------------------------- mashqlar
const route = useRoute()
const router = useRouter()
const BAJARILGAN_KALITI = 'docker-mashq-bajarilgan'
const mashqId = ref('')
const qadam = ref(0)
const bajarilgan = ref(oqiBajarilgan())
function oqiBajarilgan() {
  try { return new Set(JSON.parse(localStorage.getItem(BAJARILGAN_KALITI) ?? '[]')) } catch { return new Set() }
}
const ERKIN = [{ id: '', title: 'Erkin rejim', note: 'bo‘sh Docker — image\'lar Docker Hub\'dan (katalogdan) yuklanadi' }]
const mashq = computed(() => DOCKER_MASHQLAR.find((m) => m.id === mashqId.value) ?? null)
const tugadi = computed(() => mashq.value && qadam.value >= mashq.value.steps.length)
const keyingi = computed(() => { const i = DOCKER_MASHQLAR.indexOf(mashq.value); return i >= 0 ? DOCKER_MASHQLAR[i + 1] ?? null : null })
const bobNomi = computed(() => (mashq.value ? findPage(mashq.value.bob)?.title ?? '' : ''))
const qismlar = (t) => t.split('`').map((x, i) => ({ t: x, code: i % 2 === 1 }))
let mashqBoshi = 0
function tekshir() {
  const m = mashq.value
  if (!m || !muhit.value) return
  const h = { d: muhit.value.daemon, fs: muhit.value.fs, tarix: tarix.value.filter((x) => x.vaqt >= mashqBoshi) }
  while (qadam.value < m.steps.length && m.steps[qadam.value].tekshir(h)) qadam.value++
  if (qadam.value === m.steps.length && !bajarilgan.value.has(m.id)) {
    bajarilgan.value = new Set([...bajarilgan.value, m.id])
    try { localStorage.setItem(BAJARILGAN_KALITI, JSON.stringify([...bajarilgan.value])) } catch { /* saqlanmasa ham ishlaydi */ }
  }
}
const tanla = (id) => { mashqId.value = id }
watch(mashqId, (id) => {
  if ((route.query.mashq ?? '') !== id) router.replace({ query: id ? { mashq: id } : {} })
  if (satr) yarat()
})
watch(() => route.query.mashq, (id) => {
  if (typeof id === 'string' && DOCKER_MASHQLAR.some((m) => m.id === id)) tanla(id)
}, { immediate: true })

// ---------------------------------------------------------------- terminal va muhit
const yozT = (m) => term.value?.write(m)
const terminalIf = {
  cols: () => term.value?.size().cols ?? 100,
  uzilish: (f) => { if (satr) satr.uzilishF = f },
  uzilishOl: () => satr?.uzilishF,
  ajralish: (f) => { if (satr) satr.ajralishF = f },
}
const stdinTerm = {
  tty: true,
  oqi: async () => '',
  qator: async ({ konteyner } = {}) => {
    konteynerRejim.value = konteyner ?? null
    const x = await satr.oqiPromptsiz()
    konteynerRejim.value = null
    return x
  },
}
const promptMatn = (cwd) => `\x1b[01;32mroot@lab\x1b[00m:\x1b[01;34m${cwd === '/root' ? '~' : cwd.startsWith('/root/') ? '~' + cwd.slice(5) : cwd}\x1b[00m# `

function yarat() {
  const meniki = ++avlod
  offHodisa?.()
  term.value?.reset()
  hikoyalar.value = []
  tarix.value = []
  qadam.value = 0
  mashqBoshi = Date.now()
  konteynerRejim.value = null
  satr = new SatrMuharrir(yozT)
  const m = muhitYarat({ fsYukla: (nom) => fetch(BASE + 'docker-trenajor/fs/' + nom).then((r) => r.json()), terminal: terminalIf })
  if (mashq.value?.tayyor) m.tayyorla(mashq.value.tayyor)
  muhit.value = m
  const hikoya = hikoyaYarat(m.daemon)
  let navbat = 0
  offHodisa = m.daemon.tingla((h) => {
    const x = hikoya(h)
    if (x) hikoyalar.value = [{ ...x, vaqt: new Date().toTimeString().slice(0, 8), n: ++navbat }, ...hikoyalar.value].slice(0, 80)
    if (h.tur === 'container' && (h.amal === 'die' || h.amal === 'start')) setTimeout(tekshir, 50)
  })
  yozT('\x1b[1mDocker trenajori\x1b[0m — Docker Engine 29.9.3 simulyatori. Har chiqish sinov VPS\'ida yozib olingan haqiqiy natija asosida.\r\n')
  yozT(`\x1b[2mImage'lar: hello-world, alpine, nginx:1.29, debian, busybox:1.37 · \`help\` — yordam · Tab — maslahat\x1b[0m\r\n`)
  if (mashq.value?.tayyor) yozT(`\x1b[2mMashq uchun yuklab qo'yilgan: ${mashq.value.tayyor.join(', ')}\x1b[0m\r\n`)
  yozT('\r\n')
  tsikl(meniki, m)
}

async function tsikl(meniki, m) {
  const stdout = { tty: true, yoz: (x) => { if (meniki === avlod) satr.yoz(x) } }
  for (;;) {
    const qator = await satr.oqi(promptMatn(m.qobiq.cwd))
    if (meniki !== avlod) return
    if (!qator.trim()) continue
    m.qobiq.tarix.push(qator)
    const ac = new AbortController()
    satr.uzilishF = () => ac.abort(new Toxtatildi())
    let kod
    try {
      kod = await m.qobiq.bajar(qator, { stdout, stderr: stdout, stdin: stdinTerm, signal: ac.signal, tty: true })
    } catch (e) {
      if (e instanceof Toxtatildi || e?.name === 'AbortError' || ac.signal.aborted) { satr.yoz('\n'); kod = 130 } else { console.error(e); satr.yoz(`\x1b[31mtrenajor xatosi: ${e.message}\x1b[0m\n`); kod = 1 }
    }
    if (meniki !== avlod) return
    m.qobiq.oxirgiKod = kod
    m.qobiq.chiqdi = null
    satr.uzilishF = null
    satr.ajralishF = null
    tarix.value = [...tarix.value, { cmd: qator.trim(), kod, vaqt: Date.now() }]
    tekshir()
  }
}

const send = (data) => satr?.kirish(data)
// tayyor buyruq tugmasi: joriy qatorni almashtiradi
function yoz(cmd) {
  if (!satr?.kutuvchi) return
  satr.kirish('\x15' + cmd)
  term.value?.focus()
}
const suggest = computed(() => (muhit.value ? dockerSuggest(muhit.value.daemon) : () => []))
const holat = computed(() => (konteynerRejim.value ? { konteyner: konteynerRejim.value } : null))
const TEZ = ['docker run hello-world', 'docker ps -a', 'docker images', 'docker run -d --name veb -p 8080:80 nginx:1.29', 'curl localhost:8080', 'docker logs veb', 'docker exec -it veb sh', 'docker rm -f veb']

onMounted(() => requestAnimationFrame(yarat))
onBeforeUnmount(() => { avlod++; offHodisa?.() })
</script>

<template>
  <div class="app">
    <header>
      <div class="title">
        <strong>Docker trenajori</strong>
        <span class="muted">simulyator · chiqishlar sinov VPS'idagi Docker Engine 29.9.3 dan yozib olingan</span>
      </div>
      <MashqTanlash :model-value="mashqId" class="pick" :mashqlar="DOCKER_MASHQLAR" :erkin="ERKIN" :done="bajarilgan" @update:model-value="tanla" />
      <button v-if="mashq" type="button" class="btn" @click="yarat">Qaytadan</button>
      <button type="button" class="btn" title="Hammasini boshlang'ich holatga qaytarish" @click="yarat">↺ Qayta boshlash</button>
      <RouterLink to="/docker" class="back">← Qo'llanmaga qaytish</RouterLink>
    </header>
    <main>
      <section v-if="mashq" class="quti mashq">
        <div>
          <h3>{{ mashq.title }}</h3>
          <p class="intro"><template v-for="(p, k) in qismlar(mashq.intro)" :key="k"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template></p>
        </div>
        <ol class="steps">
          <li v-for="(st, i) in mashq.steps" :key="i" :class="{ ok: i < qadam, cur: i === qadam, keyin: i > qadam }">
            <p><template v-for="(p, k) in qismlar(st.text)" :key="k"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template></p>
            <p v-if="i < qadam" class="natija"><template v-for="(p, k) in qismlar(st.natija)" :key="k"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template></p>
          </li>
        </ol>
        <div>
          <div v-if="tugadi" class="tugadi">
            <strong>✓ Mashq tugadi.</strong>
            <button v-if="keyingi" type="button" class="btn" @click="tanla(keyingi.id)">Keyingi: {{ keyingi.title }} →</button>
          </div>
          <RouterLink :to="mashq.bob" class="bob">Mavzu bo'yicha bob: {{ bobNomi }}</RouterLink>
        </div>
      </section>

      <div class="ish">
        <div class="term" @wheel.stop>
          <Terminal ref="term" :suggest="suggest" :holat="holat" @send="send" />
          <div class="tez">
            <button v-for="b in TEZ" :key="b" type="button" @click="yoz(b)">{{ b }}</button>
          </div>
        </div>
        <section class="quti xarita-quti">
          <Xarita v-if="muhit" :key="muhit.daemon.id" :daemon="muhit.daemon" />
        </section>
      </div>

      <section class="quti hikoya">
        <h3>Nima bo‘ldi? <small>har buyruqdan keyin Docker ichida sodir bo‘lgan ishlar — oddiy tilda</small></h3>
        <p v-if="!hikoyalar.length" class="kutish">Hali hech narsa bo‘lmadi. Terminalda <code>docker run hello-world</code> deb yozing.</p>
        <ol class="voqealar">
          <li v-for="h in hikoyalar" :key="h.n" :class="[h.tur, { xato: h.xato }]">
            <span class="ikon">{{ h.ikon }}</span>
            <span class="v">{{ h.vaqt }}</span>
            <span><template v-for="(p, k) in qismlar(h.matn)" :key="k"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template></span>
          </li>
        </ol>
      </section>
    </main>
  </div>
</template>

<style scoped>
.app { min-height: calc(100vh - var(--topbar-height)); display: flex; flex-direction: column; background: var(--bg); color: var(--text); font-family: var(--font-sans); }
header { display: flex; flex-wrap: wrap; gap: 10px 16px; align-items: center; padding: 10px 18px; border-bottom: 1px solid var(--border); background: var(--bg-elevated); }
.title { display: grid; }
.title strong { font-size: 16px; }
.muted { color: var(--text-subtle); font-size: 12.5px; }
.btn { padding: 6px 12px; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); background: var(--bg-elevated); color: var(--text); font: inherit; font-size: 13px; cursor: pointer; }
.back { margin-left: auto; font-size: 13px; }
main { flex: 1; display: grid; gap: 14px; padding: 14px 18px 18px; max-width: 1600px; width: 100%; margin: 0 auto; box-sizing: border-box; align-content: start; }
.quti { padding: 14px 16px; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 16px; box-shadow: var(--shadow-sm); min-width: 0; }
.ish { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 14px; align-items: start; }
.term { position: relative; height: 560px; display: flex; flex-direction: column; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; background: var(--code-bg); min-width: 0; }
.term > :first-child { flex: 1; min-height: 0; }
.tez { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; padding: 6px 8px; border-top: 1px solid #2f3b52; }
.tez button { padding: 3px 8px; border: 1px solid #2f3b52; border-radius: 4px; background: transparent; color: #7ee787; font: 12px var(--font-mono); cursor: pointer; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.xarita-quti { max-height: 560px; overflow: auto; }
.kutish { margin: 0; color: var(--text-subtle); font-size: 13px; }
.kutish code { font: 12px var(--font-mono); }
.hikoya h3 { margin: 0 0 8px; font-size: 14px; }
.hikoya h3 small { font-weight: 400; color: var(--text-subtle); font-size: 12px; }
.voqealar { margin: 0; padding: 0; list-style: none; display: grid; gap: 4px; max-height: 260px; overflow: auto; }
.voqealar li { display: grid; grid-template-columns: 22px 62px 1fr; gap: 6px; align-items: baseline; padding: 4px 8px; border-radius: 8px; font-size: 13px; background: var(--bg-sunken); animation: kel .3s ease-out both; }
.voqealar li:first-child { background: var(--accent-soft, rgba(37, 96, 255, .1)); }
.voqealar li.xato { background: rgba(220, 38, 38, .08); }
@keyframes kel { from { opacity: 0; transform: translateY(-4px) } }
.voqealar .v { color: var(--text-subtle); font: 11px var(--font-mono); }
.voqealar code { font: 12px var(--font-mono); padding: 0 3px; border-radius: 4px; background: var(--bg-elevated); }

.mashq { display: grid; grid-template-columns: minmax(220px, 1fr) 2fr minmax(180px, .8fr); gap: 18px; align-items: start; }
.mashq h3 { margin: 0 0 4px; font-size: 15px; }
.intro { margin: 0 0 8px; color: var(--text-muted); font-size: 13px; }
.steps { margin: 0; padding: 0; list-style: none; counter-reset: q; display: grid; gap: 4px; }
.steps li { position: relative; padding: 4px 0 8px 30px; counter-increment: q; font-size: 13px; }
.steps li::before { content: counter(q); position: absolute; left: 0; top: 3px; width: 20px; height: 20px; border-radius: 50%; display: grid; place-items: center; font: 700 11px var(--font-sans); background: var(--bg-sunken); border: 1px solid var(--border); color: var(--text-subtle); }
.steps li.cur::before { background: var(--accent); color: var(--bg-elevated); border-color: var(--accent); }
.steps li.ok::before { content: '✓'; background: var(--success-soft); color: var(--success); border-color: var(--success); }
.steps li.keyin { opacity: .55; }
.steps p { margin: 0 0 4px; }
.natija { padding: 6px 8px; border-radius: var(--radius-sm); background: var(--success-soft); }
.mashq code { font: 12px var(--font-mono); padding: 1px 4px; border-radius: 4px; background: var(--bg-sunken); overflow-wrap: anywhere; }
.tugadi { display: grid; gap: 6px; justify-items: start; margin: 6px 0; font-size: 13px; }
.bob { font-size: 12.5px; color: var(--accent-text); }
@media (max-width: 1100px) { .ish, .mashq { grid-template-columns: 1fr; } .xarita-quti { max-height: none; } }
@media (max-width: 600px) { main { padding: 10px; } .term { height: 460px; } header { padding: 10px; } .back { margin-left: 0; } }
</style>
