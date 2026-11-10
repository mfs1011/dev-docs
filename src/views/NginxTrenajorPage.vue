<script setup>
// Nginx trenajori: brauzerdagi haqiqiy Debian 12 + nginx 1.31.8 (v86, nginx-trenajor/build/web).
// Terminal — birinchi serial port; "So'rov yo'li" — ikkinchisi (ttyS1): VM ichidagi nginx-kuzatuv servisi nginx debug va
// trenajor access log'idan kerakli qatorlarni yuboradi, kuzatuv.js ularni so'rovlarga yig'adi.
// Mashq tekshiruvi Linux trenajoridagi bilan bir xil (mashqSkripti: har prompt oldidan OSC 7771).
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, triggerRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { V86 } from 'v86'
import Terminal from '@/trenajor/Terminal.vue'
import MashqTanlash from '@/trenajor/MashqTanlash.vue'
import SorovYoli from '@/nginx/SorovYoli.vue'
import { qatorQosh, yangiKuzatuv } from '@/nginx/kuzatuv'
import { NGINX_MASHQLAR } from '@/nginx/mashqlar'
import { mashqSkripti } from '@/trenajor/linuxMashqlar'
import { linuxSuggest } from '@/trenajor/linuxMaslahat'
import { symlinkTuzat } from '../../linux-trenajor/scripts/v86-tuzat.mjs'
import { findPage } from '@/docs'

const BASE = import.meta.env.BASE_URL
const BAJARILGAN_KALITI = 'nginx-mashq-bajarilgan'
const route = useRoute()
const router = useRouter()

const term = ref(null)
const tayyor = ref(false)
const progress = ref('')
const vaqt = ref('')
const kuzatuv = shallowRef(yangiKuzatuv())
const versiya = ref(0)
const mashqId = ref('')
const qadam = ref(0)
const bajarilgan = ref(oqiBajarilgan())
const mashqEl = ref(null)

let vm = null
let t0 = 0
let joriy = null
let boshlanmoqda = false
let oxirgiRaqam = null
let navbat = []

function oqiBajarilgan() {
  try { return new Set(JSON.parse(localStorage.getItem(BAJARILGAN_KALITI) ?? '[]')) } catch { return new Set() }
}
function bajarildi(id) {
  bajarilgan.value = new Set([...bajarilgan.value, id])
  try { localStorage.setItem(BAJARILGAN_KALITI, JSON.stringify([...bajarilgan.value])) } catch { /* saqlanmasa ham ishlaydi */ }
}

function yarat() {
  tayyor.value = false
  progress.value = ''
  vaqt.value = ''
  kuzatuv.value = yangiKuzatuv()
  versiya.value++
  t0 = performance.now()
  vm = new V86({
    wasm_path: BASE + 'trenajor/v86.wasm',
    bios: { url: BASE + 'trenajor/bios/seabios.bin' },
    vga_bios: { url: BASE + 'trenajor/bios/vgabios.bin' },
    filesystem: { basefs: BASE + 'nginx-trenajor/fs/fs.json', baseurl: BASE + 'nginx-trenajor/fs/base/' },
    initial_state: { url: BASE + 'nginx-trenajor/holat.zst' },
    memory_size: 256 * 1024 * 1024,
    // holat.mjs bilan bir xil qurilmalar: ikkinchi serial port — sxema uchun kanal
    uart1: true,
    autostart: true,
    disable_keyboard: true,
    disable_mouse: true,
    disable_speaker: true,
  })
  symlinkTuzat(vm)
  let pending = [], scheduled = false
  vm.add_listener('serial0-output-byte', (b) => {
    pending.push(b)
    if (scheduled) return
    scheduled = true
    queueMicrotask(() => { scheduled = false; const c = Uint8Array.from(pending); pending = []; term.value?.write(c) })
  })
  // ttyS1: qatorlarga bo'lib, kuzatuv'ga
  let bayt = []
  const dekoder = new TextDecoder()
  vm.add_listener('serial1-output-byte', (b) => {
    if (b !== 10) return void bayt.push(b)
    const qator = dekoder.decode(Uint8Array.from(bayt))
    bayt = []
    if (qatorQosh(kuzatuv.value, qator)) { versiya.value++; triggerRef(kuzatuv) }
  })
  vm.add_listener('download-progress', (e) => {
    if (e.lengthComputable && e.file_name) progress.value = `${e.file_name.split('/').pop()} — ${Math.round((e.loaded / e.total) * 100)}%`
  })
  vm.add_listener('emulator-ready', () => {
    const kut = () => {
      if (!vm || !vm.is_running()) return void setTimeout(kut, 50)
      const { cols, rows } = term.value.size()
      vm.serial0_send(`${Math.floor(Date.now() / 1000)} ${cols} ${rows}\n`)
    }
    kut()
  })
}

const send = (t) => vm?.serial0_send(String.fromCharCode(...new TextEncoder().encode(t)))
/** Buyruqni qatorga yozadi, Enter'ni o'quvchi o'zi bosadi */
const yoz = (cmd) => { send('\x15' + cmd); term.value?.focus() }

function onPrompt() {
  if (!tayyor.value) {
    tayyor.value = true
    vaqt.value = ((performance.now() - t0) / 1000).toFixed(1)
    if (mashqId.value) return void mashqniBoshla()
  }
  if (navbat.length) send('\x15' + navbat.shift() + '\n')
  term.value?.focus()
}

async function mashqniBoshla() {
  if (!vm || !tayyor.value) return
  joriy = NGINX_MASHQLAR.find((m) => m.id === mashqId.value) ?? null
  qadam.value = 0
  // yangi mashq — sxema ham toza
  kuzatuv.value = yangiKuzatuv()
  versiya.value++
  if (!joriy) {
    boshlanmoqda = false
    send('\x15 unset PROMPT_COMMAND; cd ~; clear\n')
    return
  }
  boshlanmoqda = true
  const f = `/root/.mashq-${Date.now()}.sh`
  await vm.create_file(f, new TextEncoder().encode(mashqSkripti(joriy)))
  send(`\x15 . ${f}; rm -f ${f}\n`)
  term.value?.focus()
}

function onHolat(matn) {
  const [tur, id, bitlar = '', ...qolgan] = matn.split(':')
  if (tur !== 'mashq' || !joriy || id !== joriy.id) return
  const tarix = qolgan.join(':').match(/^\s*(\d+)\s+(.*)$/)
  const raqam = tarix?.[1] ?? null
  const oxirgiBuyruq = raqam && raqam !== oxirgiRaqam ? tarix[2].trim() : null
  oxirgiRaqam = raqam
  if (boshlanmoqda) { boshlanmoqda = false; return }
  let buyruqIshlatildi = false
  while (qadam.value < joriy.steps.length) {
    const q = joriy.steps[qadam.value]
    const ok = q.ran ? !buyruqIshlatildi && oxirgiBuyruq != null && q.ran.test(oxirgiBuyruq) : bitlar[qadam.value] === '1'
    if (!ok) break
    if (q.ran) buyruqIshlatildi = true
    qadam.value++
  }
  if (qadam.value === joriy.steps.length) bajarildi(joriy.id)
}

function qaytaBoshla() {
  vm?.destroy()
  vm = null
  navbat = []
  term.value?.reset()
  yarat()
}

// --- mashq tanlash (Linux trenajor sahifasi bilan bir xil) ---
const ERKIN = [{ id: '', title: 'Erkin rejim', note: 'nginx ishlab turibdi, hech narsa tayyorlanmaydi' }]
const mashq = computed(() => NGINX_MASHQLAR.find((m) => m.id === mashqId.value) ?? null)
const tugadi = computed(() => mashq.value && qadam.value >= mashq.value.steps.length)
const keyingi = computed(() => {
  const i = NGINX_MASHQLAR.indexOf(mashq.value)
  return i >= 0 ? NGINX_MASHQLAR[i + 1] ?? null : null
})
const bobNomi = computed(() => (mashq.value ? findPage(mashq.value.bob)?.title ?? '' : ''))
const qismlar = (s) => s.split('`').map((t, i) => ({ t, code: i % 2 === 1 }))
const tanla = (id) => { mashqId.value = id }
watch(mashqId, (id) => {
  if ((route.query.mashq ?? '') !== id) router.replace({ query: id ? { mashq: id } : {} })
  mashqniBoshla()
})
watch(() => route.query.mashq, (id) => {
  if (typeof id === 'string' && NGINX_MASHQLAR.some((m) => m.id === id)) tanla(id)
}, { immediate: true })
watch(qadam, async () => {
  await nextTick()
  const box = mashqEl.value
  const el = box?.querySelector('.tugadi') ?? box?.querySelector('li.cur')
  if (box && el) box.scrollTo({ top: el.offsetTop - box.clientHeight / 3, behavior: 'smooth' })
})

onMounted(() => requestAnimationFrame(yarat))
onBeforeUnmount(() => { vm?.destroy(); vm = null })
</script>

<template>
    <div class="app">
        <header>
            <div class="title">
                <strong>Nginx trenajori</strong>
                <span class="muted">haqiqiy nginx 1.31.8 · Debian 12 · brauzerda</span>
            </div>
            <MashqTanlash
                :model-value="mashqId"
                class="pick"
                :mashqlar="NGINX_MASHQLAR"
                :erkin="ERKIN"
                :done="bajarilgan"
                @update:model-value="tanla"
            />
            <button v-if="mashq" type="button" class="btn" @click="mashqniBoshla">Qaytadan</button>
            <button type="button" class="btn" title="Tizimni boshlang'ich holatiga qaytarish" @click="qaytaBoshla">↺ Qayta boshlash</button>
            <RouterLink to="/nginx" class="back">← Qo'llanmaga qaytish</RouterLink>
        </header>
        <main :class="{ 'has-side': mashq }">
            <aside v-if="mashq" ref="mashqEl" class="side">
                <h3>{{ mashq.title }}</h3>
                <p class="intro">
                    <template v-for="(p, k) in qismlar(mashq.intro)" :key="k"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template>
                </p>
                <ol class="steps">
                    <li
                        v-for="(s, i) in mashq.steps"
                        :key="i"
                        :class="{ ok: i < qadam, cur: i === qadam, keyin: i > qadam }"
                    >
                        <p><template v-for="(p, k) in qismlar(s.text)" :key="k"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template></p>
                        <button
                            v-if="i <= qadam"
                            type="button"
                            class="cmd"
                            title="Terminalga yozish (Enter'ni o'zingiz bosasiz)"
                            @click="yoz(s.cmd)"
                        >$ {{ s.cmd }}</button>
                        <p v-if="i < qadam" class="natija">
                            <template v-for="(p, k) in qismlar(s.natija)" :key="k"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template>
                        </p>
                    </li>
                </ol>
                <div v-if="tugadi" class="tugadi">
                    <strong>✓ Mashq tugadi.</strong> Terminalda erkin davom etishingiz mumkin.
                    <button v-if="keyingi" type="button" class="btn" @click="tanla(keyingi.id)">Keyingi: {{ keyingi.title }} →</button>
                </div>
                <RouterLink :to="mashq.bob" class="bob">Mavzu bo'yicha bob: {{ bobNomi }}</RouterLink>
            </aside>
            <div class="term" @wheel.prevent>
                <Terminal ref="term" :suggest="linuxSuggest" @send="send" @prompt="onPrompt" @holat="onHolat" />
                <div v-if="!tayyor" class="boot">
                    <div class="spin" />
                    <p>Debian va nginx yuklanmoqda…</p>
                    <small>{{ progress }}</small>
                </div>
                <small v-else class="ochildi">{{ vaqt }} s da ochildi</small>
            </div>
            <div class="yol-quti">
                <SorovYoli :sorovlar="kuzatuv.sorovlar" :versiya="versiya" />
            </div>
        </main>
    </div>
</template>

<style scoped>
.app { height: calc(100vh - var(--topbar-height)); display: flex; flex-direction: column; background: var(--bg); color: var(--text); font-family: var(--font-sans); }
header { position: relative; z-index: 50; display: flex; flex-wrap: wrap; gap: 10px 16px; align-items: center; padding: 10px 18px; border-bottom: 1px solid var(--border); background: var(--bg-elevated); }
.title { display: grid; }
.title strong { font-size: 16px; }
.muted { color: var(--text-subtle); font-size: 12.5px; }
.btn { padding: 6px 12px; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); background: var(--bg-elevated); color: var(--text); font: inherit; font-size: 13px; cursor: pointer; }
.btn:hover { border-color: var(--accent); color: var(--accent-text); }
.back { margin-left: auto; font-size: 13px; }
main { flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr) minmax(320px, 420px); gap: 12px; padding: 14px 18px 18px; }
main.has-side { grid-template-columns: minmax(260px, 320px) minmax(0, 1fr) minmax(320px, 400px); }
.term { position: relative; min-width: 0; min-height: 0; display: flex; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; background: var(--code-bg); }
.term > :first-child { flex: 1; min-width: 0; }
.boot { position: absolute; inset: 0; display: grid; place-content: center; justify-items: center; gap: 8px; color: #d7dde8; background: var(--code-bg); }
.boot p { margin: 0; }
.boot small { color: #9aa6ba; }
.spin { width: 28px; height: 28px; border: 3px solid #2f3b52; border-top-color: #7ee787; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.ochildi { position: absolute; right: 10px; top: 6px; color: #6b7689; font-size: 11px; pointer-events: none; }
.yol-quti, .side { min-height: 0; overflow: auto; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow-sm); }
.side { padding: 12px 16px 16px; }

.side h3 { margin: 2px 0 6px; font-size: 16px; }
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
.side code { font: 12.5px var(--font-mono); padding: 1px 4px; border-radius: 4px; background: var(--bg-sunken); }
.natija code { background: var(--bg-elevated); }
.tugadi { margin: 6px 0 12px; padding: 10px 12px; border: 1px solid var(--success); border-radius: var(--radius-sm); font-size: 13.5px; display: grid; gap: 8px; justify-items: start; }
.bob { display: inline-block; margin-top: 4px; color: var(--accent-text); font-size: 13px; }

@media (max-width: 1100px) {
    .app { height: auto; min-height: calc(100vh - var(--topbar-height)); }
    main, main.has-side { grid-template-columns: 1fr; grid-template-rows: auto; }
    .term { height: 60vh; }
    .side, .yol-quti { max-height: none; }
}
</style>
