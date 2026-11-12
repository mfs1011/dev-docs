<script setup>
// Web asoslari — HTTP laboratoriyasi. Brauzerdagi haqiqiy Debian 12 + nginx 1.31.8 (nginx trenajori tasviri, v86).
// Sahifa ochilganda laboratoriya sozlanadi (web-trenajor/lab): nginx'ga 8080-portda mavzular bo'yicha manzillar
// (redirect, kesh, cookie, Basic auth, CORS, gzip, Range…), /etc/hosts'ga api.test va sayt.test.
// So'rovlar haqiqiy curl bilan yuboriladi (ikkinchi serial port, src/web/lab.js) — natija sxemada, xom ko'rinishda
// va Network panelida. Terminal — birinchi serial port, o'quvchi curl'ni o'zi ham yozishi mumkin.
import { computed, onBeforeUnmount, onMounted, reactive, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { V86 } from 'v86'
import Terminal from '@/trenajor/Terminal.vue'
import MashqTanlash from '@/trenajor/MashqTanlash.vue'
import SorovYoli from '@/web/SorovYoli.vue'
import XomXabar from '@/web/XomXabar.vue'
import Tarmoq from '@/web/Tarmoq.vue'
import { JAR, hdr, q, yangiLab } from '@/web/lab'
import { BASIC, HOST, MAVZULAR, tushuntir } from '@/web/izohlar'
import { WEB_MASHQLAR } from '@/web/mashqlar'
import { LAB_FAYLLAR, SOZLA } from '@/web/labFayllar'
import { linuxSuggest } from '@/trenajor/linuxMaslahat'
import { symlinkTuzat } from '../../linux-trenajor/scripts/v86-tuzat.mjs'
import { findPage } from '@/docs'

const BASE = import.meta.env.BASE_URL
const term = ref(null)
const tayyor = ref(false)
const labTayyor = ref(false)
const progress = ref('')
const vaqt = ref('')
const lab = shallowRef(null)
let vm = null, t0 = 0, sozlandi = false

// ---------------------------------------------------------------- so'rov konstruktori
const USULLAR = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS']
const soz = reactive({ usul: 'GET', url: HOST + '/', headerlar: [], tana: '', ergash: false, cookie: true, siqish: false })
const mavzu = ref('asosiy')
const tarix = ref([])
const tanlangan = ref(0)
const hop = ref(-1)
const band = ref(false)
const xato = ref('')
const tezlik = ref(1)
const n = computed(() => tarix.value[tanlangan.value] ?? null)
const tanli = computed(() => ['POST', 'PUT'].includes(soz.usul))

function tayyorniOl(t) {
  soz.usul = t.usul
  soz.url = HOST + t.yol
  soz.headerlar = (t.headerlar ?? []).map(([k, v]) => [k, v])
  soz.tana = t.tana ?? ''
  soz.ergash = !!t.ergash
  if ('cookie' in t) soz.cookie = t.cookie
  soz.siqish = !!t.siqish
}
const oxirgiJavob = (nom) => {
  for (const r of tarix.value) { const v = hdr(r.hoplar.at(-1)?.javob.headerlar, nom); if (v) return v }
  return null
}
const tezHeaderlar = computed(() => [
  ['Origin', 'http://sayt.test'], ['Origin', 'http://yomon.test'], ['Access-Control-Request-Method', 'PUT'],
  ...(oxirgiJavob('ETag') ? [['If-None-Match', oxirgiJavob('ETag')]] : []),
  ...(oxirgiJavob('Last-Modified') ? [['If-Modified-Since', oxirgiJavob('Last-Modified')]] : []),
  ['Range', 'bytes=0-99'], ['Authorization', BASIC], ['Accept', 'application/json'], ['Content-Type', 'application/json'],
])
function headerQosh(k, v) {
  const i = soz.headerlar.findIndex(([x]) => x.toLowerCase() === k.toLowerCase())
  if (i >= 0) soz.headerlar.splice(i, 1, [k, v])
  else soz.headerlar.push([k, v])
}
const curlBuyruq = computed(() => {
  const a = ['curl -v']
  if (soz.usul === 'HEAD') a.push('--head')
  else if (!(soz.usul === 'GET' || (soz.usul === 'POST' && soz.tana))) a.push(`-X ${soz.usul}`)
  for (const [k, v] of soz.headerlar) if (k.trim()) a.push(`-H ${q(`${k}: ${v}`)}`)
  if (soz.ergash) a.push('-L')
  if (soz.cookie) a.push(`-b ${JAR} -c ${JAR}`)
  if (soz.siqish) a.push('--compressed')
  if (tanli.value && soz.tana) a.push(`--data-binary ${q(soz.tana)}`)
  a.push(q(soz.url))
  return a.join(' ')
})

async function yubor() {
  if (!lab.value || !labTayyor.value || band.value) return
  band.value = true
  xato.value = ''
  try {
    const r = await lab.value.sorov({ ...soz, headerlar: soz.headerlar.map((x) => [...x]), tana: tanli.value ? soz.tana : '' })
    tarix.value = [r, ...tarix.value].slice(0, 60)
    tanlangan.value = 0
    hop.value = r.hoplar.length - 1
    tekshir()
  } catch (e) {
    xato.value = e.message
  } finally {
    band.value = false
  }
}
async function cookieTozala() {
  try { await lab.value.bajar(`rm -f ${JAR}`) } catch { /* bo'lmasa ham */ }
  if (tarix.value[0]) tarix.value[0] = { ...tarix.value[0], cookielar: [] }
}
const cookielar = computed(() => tarix.value.find((r) => r.sorov.cookie)?.cookielar ?? [])
const izohlar = computed(() => (n.value ? tushuntir(n.value) : []))
watch(tanlangan, () => { hop.value = (n.value?.hoplar.length ?? 0) - 1 })

// ---------------------------------------------------------------- mashqlar
const route = useRoute()
const router = useRouter()
const BAJARILGAN_KALITI = 'web-mashq-bajarilgan'
const mashqId = ref('')
const qadam = ref(0)
const bajarilgan = ref(oqiBajarilgan())
function oqiBajarilgan() {
  try { return new Set(JSON.parse(localStorage.getItem(BAJARILGAN_KALITI) ?? '[]')) } catch { return new Set() }
}
const ERKIN = [{ id: '', title: 'Erkin rejim', note: 'laboratoriya tayyor — istalgan so‘rovni yuboring' }]
const mashq = computed(() => WEB_MASHQLAR.find((m) => m.id === mashqId.value) ?? null)
const tugadi = computed(() => mashq.value && qadam.value >= mashq.value.steps.length)
const keyingi = computed(() => { const i = WEB_MASHQLAR.indexOf(mashq.value); return i >= 0 ? WEB_MASHQLAR[i + 1] ?? null : null })
const bobNomi = computed(() => (mashq.value ? findPage(mashq.value.bob)?.title ?? '' : ''))
const qismlar = (t) => t.split('`').map((x, i) => ({ t: x, code: i % 2 === 1 }))
let mashqBoshi = 0
function tekshir() {
  const m = mashq.value
  if (!m) return
  const t = tarix.value.filter((r) => r.vaqt >= mashqBoshi)
  while (qadam.value < m.steps.length && m.steps[qadam.value].tekshir(t)) qadam.value++
  if (qadam.value === m.steps.length && !bajarilgan.value.has(m.id)) {
    bajarilgan.value = new Set([...bajarilgan.value, m.id])
    try { localStorage.setItem(BAJARILGAN_KALITI, JSON.stringify([...bajarilgan.value])) } catch { /* saqlanmasa ham ishlaydi */ }
  }
}
async function mashqniBoshla() {
  qadam.value = 0
  mashqBoshi = Date.now()
  const BOSH = { 'kesh': 'kesh', 'cookie': 'cookie', 'basic-auth': 'auth', 'cors': 'cors', 'siqish-range': 'siqish', 'redirect': 'redirect', 'metodlar': 'metod' }
  if (mashq.value) mavzu.value = BOSH[mashq.value.id] ?? 'asosiy'
  if (labTayyor.value && mashq.value) await cookieTozala()
}
const tanla = (id) => { mashqId.value = id }
watch(mashqId, (id) => {
  if ((route.query.mashq ?? '') !== id) router.replace({ query: id ? { mashq: id } : {} })
  mashqniBoshla()
})
watch(() => route.query.mashq, (id) => {
  if (typeof id === 'string' && WEB_MASHQLAR.some((m) => m.id === id)) tanla(id)
}, { immediate: true })

// ---------------------------------------------------------------- VM
function yarat() {
  tayyor.value = false
  labTayyor.value = false
  sozlandi = false
  progress.value = ''
  vaqt.value = ''
  t0 = performance.now()
  vm = new V86({
    wasm_path: BASE + 'trenajor/v86.wasm',
    bios: { url: BASE + 'trenajor/bios/seabios.bin' },
    vga_bios: { url: BASE + 'trenajor/bios/vgabios.bin' },
    filesystem: { basefs: BASE + 'nginx-trenajor/fs/fs.json', baseurl: BASE + 'nginx-trenajor/fs/base/' },
    initial_state: { url: BASE + 'nginx-trenajor/holat.zst' },
    memory_size: 256 * 1024 * 1024,
    uart1: true,
    autostart: true,
    disable_keyboard: true,
    disable_mouse: true,
    disable_speaker: true,
  })
  symlinkTuzat(vm)
  lab.value = yangiLab((b) => vm?.serial_send_bytes(1, b))
  lab.value.tingla((x) => {
    if (x.t !== 'tayyor') return
    labTayyor.value = true
    if (mashq.value) mashqniBoshla()
    else if (!tarix.value.length) yubor()   // birinchi ko'rinish: GET /
  })
  let pending = [], scheduled = false
  vm.add_listener('serial0-output-byte', (b) => {
    pending.push(b)
    if (scheduled) return
    scheduled = true
    queueMicrotask(() => { scheduled = false; const c = Uint8Array.from(pending); pending = []; term.value?.write(c) })
  })
  vm.add_listener('serial1-output-byte', (b) => lab.value?.bayt(b))
  vm.add_listener('download-progress', (e) => {
    if (e.lengthComputable && e.file_name) progress.value = `${e.file_name.split('/').pop()} — ${Math.round((e.loaded / e.total) * 100)}%`
  })
  vm.add_listener('emulator-ready', () => {
    const kut = async () => {
      if (!vm || !vm.is_running()) return void setTimeout(kut, 50)
      for (const [nom, matn] of Object.entries(LAB_FAYLLAR)) await vm.create_file(`/root/.lab-${nom}`, new TextEncoder().encode(matn))
      const { cols, rows } = term.value.size()
      vm.serial0_send(`${Math.floor(Date.now() / 1000)} ${cols} ${rows}\n`)
    }
    kut()
  })
}
const send = (t) => vm?.serial0_send(String.fromCharCode(...new TextEncoder().encode(t)))
const yoz = (cmd) => { send('\x15' + cmd); term.value?.focus() }
function onPrompt() {
  if (!tayyor.value) {
    tayyor.value = true
    vaqt.value = ((performance.now() - t0) / 1000).toFixed(1)
  }
  if (!sozlandi) { sozlandi = true; send(SOZLA + '\n') }
}
function qaytaBoshla() {
  vm?.destroy()
  vm = null
  tarix.value = []
  term.value?.reset()
  yarat()
}
onMounted(() => requestAnimationFrame(yarat))
onBeforeUnmount(() => { vm?.destroy(); vm = null })
const sana = (s) => (s ? new Date(s * 1000).toLocaleString('uz', { hour12: false }) : 'sessiya')
</script>

<template>
    <div class="app">
        <header>
            <div class="title">
                <strong>HTTP laboratoriyasi</strong>
                <span class="muted">haqiqiy nginx 1.31.8 va curl · Debian 12 · brauzerda</span>
            </div>
            <MashqTanlash :model-value="mashqId" class="pick" :mashqlar="WEB_MASHQLAR" :erkin="ERKIN" :done="bajarilgan" @update:model-value="tanla" />
            <button v-if="mashq" type="button" class="btn" @click="mashqniBoshla">Qaytadan</button>
            <button type="button" class="btn" title="Laboratoriyani boshlang'ich holatiga qaytarish" @click="qaytaBoshla">↺ Qayta boshlash</button>
            <RouterLink to="/web-asoslari" class="back">← Qo'llanmaga qaytish</RouterLink>
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
                <div class="mashq-oxir">
                    <div v-if="tugadi" class="tugadi">
                        <strong>✓ Mashq tugadi.</strong>
                        <button v-if="keyingi" type="button" class="btn" @click="tanla(keyingi.id)">Keyingi: {{ keyingi.title }} →</button>
                    </div>
                    <RouterLink :to="mashq.bob" class="bob">Mavzu bo'yicha bob: {{ bobNomi }}</RouterLink>
                </div>
            </section>

            <section class="quti konstruktor">
                <div class="mavzular">
                    <button v-for="m in MAVZULAR" :key="m.id" type="button" :class="{ on: mavzu === m.id }" @click="mavzu = m.id">{{ m.nom }}</button>
                </div>
                <div class="tayyorlar">
                    <button v-for="t in MAVZULAR.find((m) => m.id === mavzu).tayyorlar" :key="t.nom" type="button" @click="tayyorniOl(t)">
                        <b>{{ t.nom }}</b><small>{{ t.izoh }}</small>
                    </button>
                </div>
                <div class="qator">
                    <div class="seg">
                        <button v-for="u in USULLAR" :key="u" type="button" :class="{ on: soz.usul === u }" @click="soz.usul = u">{{ u }}</button>
                    </div>
                    <input v-model="soz.url" class="url" spellcheck="false" aria-label="URL" @keydown.enter="yubor">
                    <button type="button" class="asosiy" :disabled="!labTayyor || band" @click="yubor">{{ band ? '…' : '▶ Yuborish' }}</button>
                </div>
                <div class="ikki">
                    <div>
                        <label>Sarlavhalar (headers)</label>
                        <div v-for="(h, i) in soz.headerlar" :key="i" class="hdr-qator">
                            <input v-model="h[0]" placeholder="Nomi" spellcheck="false">
                            <input v-model="h[1]" placeholder="Qiymati" spellcheck="false">
                            <button type="button" class="x" title="O‘chirish" @click="soz.headerlar.splice(i, 1)">✕</button>
                        </div>
                        <div class="chiplar">
                            <button v-for="[k, v] in tezHeaderlar" :key="k + v" type="button" :title="`${k}: ${v}`" @click="headerQosh(k, v)">+ {{ k }}: {{ v.length > 22 ? v.slice(0, 22) + '…' : v }}</button>
                            <button type="button" @click="soz.headerlar.push(['', ''])">+ boshqa</button>
                        </div>
                    </div>
                    <div>
                        <label>Sozlamalar</label>
                        <div class="tugmalar">
                            <button type="button" class="t" :class="{ on: soz.ergash }" @click="soz.ergash = !soz.ergash">↪ Redirectga ergashish <code>-L</code></button>
                            <button type="button" class="t" :class="{ on: soz.cookie }" @click="soz.cookie = !soz.cookie">🍪 Cookie’larni saqlash</button>
                            <button type="button" class="t" :class="{ on: soz.siqish }" @click="soz.siqish = !soz.siqish">🗜 Siqishni so‘rash <code>--compressed</code></button>
                        </div>
                        <template v-if="tanli">
                            <label>Tana (body)</label>
                            <textarea v-model="soz.tana" rows="2" spellcheck="false" />
                        </template>
                        <label>Shu so‘rov — terminal uchun</label>
                        <div class="curl">
                            <code>{{ curlBuyruq }}</code>
                            <button type="button" class="t" title="Terminal qatoriga yozadi (Enter'ni o'zingiz bosasiz)" @click="yoz(curlBuyruq)">⌨ Terminalga</button>
                        </div>
                    </div>
                </div>
                <p v-if="xato" class="xato">{{ xato }}</p>
                <p v-if="!labTayyor" class="kutish">{{ tayyor ? 'Laboratoriya sozlanmoqda…' : 'Debian va nginx yuklanmoqda…' }}</p>
            </section>

            <div class="asosiy-qator">
                <section class="quti"><SorovYoli :n="n" :tanlangan-hop="hop" :tezlik="tezlik" :kutilmoqda="band ? `${soz.usul} ${soz.url}` : ''" @hop="hop = $event" /></section>
                <aside class="quti tushuntirish">
                    <h4>Nima bo‘ldi?</h4>
                    <p v-if="!izohlar.length" class="bosh">So‘rov yuborilgach, javob shu yerda oddiy tilda tushuntiriladi.</p>
                    <ul>
                        <li v-for="(x, i) in izohlar" :key="i" :class="x.s">{{ x.m }}</li>
                    </ul>
                    <h4 class="cookie-sar">
                        Cookie’lar <small>(curl cookie fayli — brauzer xotirasi o‘rnida)</small>
                        <button v-if="cookielar.length" type="button" class="t kichik" @click="cookieTozala">tozalash</button>
                    </h4>
                    <p v-if="!cookielar.length" class="bosh">Saqlangan cookie yo‘q.</p>
                    <table v-else class="cookie">
                        <tr v-for="c in cookielar" :key="c.domen + c.nom"><td><b>{{ c.nom }}</b>={{ c.qiymat }}</td><td>{{ c.domen }}{{ c.yol }}</td><td>{{ c.httpOnly ? 'HttpOnly' : '' }}</td><td>{{ sana(c.muddat) }} gacha</td></tr>
                    </table>
                </aside>
            </div>

            <div class="ikkilik">
                <section class="quti"><XomXabar v-if="n" :key="n.vaqt" :n="n" :hop="hop" /><p v-else class="bosh">Xom so‘rov va javob shu yerda.</p></section>
                <section class="quti"><Tarmoq :tarix="tarix" :tanlangan="tanlangan" @tanla="tanlangan = $event" /></section>
            </div>

            <div class="term" @wheel.prevent>
                <Terminal ref="term" :suggest="linuxSuggest" @send="send" @prompt="onPrompt" />
                <div v-if="!tayyor" class="boot">
                    <div class="spin" />
                    <p>Debian va nginx yuklanmoqda…</p>
                    <small>{{ progress }}</small>
                </div>
                <div v-else class="tez">
                    <button type="button" @click="yoz('curl -v http://api.test:8080/')">curl -v</button>
                    <button type="button" @click="yoz('cat /etc/hosts')">/etc/hosts</button>
                    <button type="button" @click="yoz('cat /etc/nginx/conf.d/web-lab.conf')">nginx sozlamasi</button>
                    <button type="button" @click="yoz('tail -5 /var/log/nginx/access.log')">access.log</button>
                    <small class="ochildi">{{ vaqt }} s da ochildi</small>
                </div>
            </div>
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
main { flex: 1; display: grid; gap: 14px; padding: 14px 18px 18px; max-width: 1560px; width: 100%; margin: 0 auto; box-sizing: border-box; }
.quti { padding: 16px 18px; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 16px; box-shadow: var(--shadow-sm); min-width: 0; }
.bosh { margin: 0; font-size: 13px; color: var(--text-subtle); }
h4 { margin: 0 0 10px; font: 600 11px var(--font-mono); letter-spacing: .12em; text-transform: uppercase; color: var(--text-subtle); }
h4 small { letter-spacing: 0; text-transform: none; font-weight: 400; }
label { display: block; margin: 0 0 6px; font: 600 10.5px var(--font-mono); letter-spacing: .1em; text-transform: uppercase; color: var(--text-subtle); }
label:not(:first-child) { margin-top: 12px; }
input, textarea { min-width: 0; padding: 7px 10px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-sunken); color: var(--text); font: 13px var(--font-mono); }
textarea { width: 100%; box-sizing: border-box; resize: vertical; }

.konstruktor { display: grid; gap: 12px; }
.mavzular { display: flex; flex-wrap: wrap; gap: 4px; padding: 3px; border-radius: 12px; background: var(--bg-sunken); border: 1px solid var(--border); justify-self: start; }
.mavzular button { padding: 6px 12px; border: 0; border-radius: 9px; background: none; color: var(--text-muted); font: 500 13px var(--font-sans); cursor: pointer; }
.mavzular button.on { background: var(--accent); color: #fff; font-weight: 600; }
.tayyorlar { display: flex; flex-wrap: wrap; gap: 8px; }
.tayyorlar button { display: grid; gap: 1px; text-align: left; padding: 7px 12px; border: 1px dashed var(--border-strong); border-radius: 10px; background: none; color: var(--text); cursor: pointer; }
.tayyorlar button:hover { border-style: solid; border-color: var(--accent); background: color-mix(in srgb, var(--accent) 6%, transparent); }
.tayyorlar b { font: 600 12.5px var(--font-mono); color: var(--accent-text); }
.tayyorlar small { font-size: 11.5px; color: var(--text-subtle); }
.qator { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.seg { display: inline-flex; padding: 3px; gap: 2px; border-radius: 11px; background: var(--bg-sunken); border: 1px solid var(--border); flex-wrap: wrap; }
.seg button { padding: 6px 10px; border: 0; border-radius: 8px; background: none; color: var(--text-muted); font: 600 12.5px var(--font-mono); cursor: pointer; }
.seg button.on { background: var(--accent); color: #fff; }
.url { flex: 1; min-width: 240px; font-size: 14px; padding: 9px 12px; }
.asosiy { padding: 10px 22px; border: 0; border-radius: 11px; background: var(--accent); color: #fff; font: 700 15px var(--font-sans); cursor: pointer; box-shadow: 0 4px 14px color-mix(in srgb, var(--accent) 35%, transparent); }
.asosiy:disabled { opacity: .55; cursor: default; }
.ikki { display: grid; grid-template-columns: 1.1fr 1fr; gap: 22px; }
.hdr-qator { display: grid; grid-template-columns: minmax(0, .8fr) minmax(0, 1.4fr) 30px; gap: 6px; margin-bottom: 6px; }
.x { border: 1px solid var(--border); border-radius: 8px; background: none; color: var(--text-subtle); cursor: pointer; }
.chiplar, .tugmalar { display: flex; flex-wrap: wrap; gap: 6px; }
.chiplar button { padding: 4px 9px; border: 1px dashed var(--border-strong); border-radius: 7px; background: none; color: var(--accent-text); font: 11.5px var(--font-mono); cursor: pointer; }
.t { padding: 6px 11px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-elevated); color: var(--text); font: 12.5px var(--font-sans); cursor: pointer; }
.t.on { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 10%, transparent); color: var(--accent-text); }
.t code { font-size: 11px; color: var(--text-subtle); }
.t.kichik { padding: 2px 8px; font-size: 11px; margin-left: auto; }
.curl { display: flex; gap: 8px; align-items: flex-start; }
.curl code { flex: 1; padding: 8px 10px; border-radius: 9px; background: var(--code-bg); color: #d7dde8; font: 12px/1.5 var(--font-mono); overflow-wrap: anywhere; }
.xato { margin: 0; color: var(--danger, #dc2626); font-size: 13px; }
.kutish { margin: 0; color: var(--text-subtle); font-size: 13px; }

.asosiy-qator { display: grid; grid-template-columns: minmax(0, 1fr) 380px; gap: 14px; align-items: start; }
.tushuntirish ul { margin: 0 0 14px; padding: 0; list-style: none; display: grid; gap: 8px; }
.tushuntirish li { position: relative; padding-left: 16px; font-size: 13px; line-height: 1.5; color: var(--text-muted); }
.tushuntirish li::before { content: ''; position: absolute; left: 0; top: 7px; width: 7px; height: 7px; border-radius: 50%; background: var(--text-subtle); }
.tushuntirish li.ok::before { background: var(--success); }
.tushuntirish li.xato::before { background: var(--danger, #dc2626); }
.tushuntirish li.xato { color: var(--text); }
.cookie-sar { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.cookie { width: 100%; border-collapse: collapse; font: 11.5px var(--font-mono); }
.cookie td { padding: 4px 4px; border-bottom: 1px solid var(--border); overflow-wrap: anywhere; }
.ikkilik { display: grid; grid-template-columns: 1.3fr 1fr; gap: 14px; align-items: start; }

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
.mashq code { font: 12px var(--font-mono); padding: 1px 4px; border-radius: 4px; background: var(--bg-sunken); }
.tugadi { display: grid; gap: 6px; justify-items: start; margin: 6px 0; font-size: 13px; }
.bob { font-size: 12.5px; color: var(--accent-text); }

.term { position: relative; height: 320px; display: flex; flex-direction: column; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; background: var(--code-bg); }
.term > :first-child { flex: 1; min-height: 0; }
.boot { position: absolute; inset: 0; display: grid; place-content: center; justify-items: center; gap: 8px; color: #d7dde8; background: var(--code-bg); }
.boot p { margin: 0; }
.boot small { color: #9aa6ba; }
.spin { width: 28px; height: 28px; border: 3px solid #2f3b52; border-top-color: #7ee787; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.tez { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; padding: 6px 8px; border-top: 1px solid #2f3b52; }
.tez button { padding: 3px 8px; border: 1px solid #2f3b52; border-radius: 4px; background: transparent; color: #7ee787; font: 12px var(--font-mono); cursor: pointer; }
.ochildi { margin-left: auto; color: #6b7689; font-size: 11px; }
@media (max-width: 1100px) {
  .asosiy-qator, .ikkilik, .ikki, .mashq { grid-template-columns: 1fr; }
}
</style>
