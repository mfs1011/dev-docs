<script setup>
// RabbitMQ trenajori: brauzerdagi haqiqiy Debian 12 + Erlang/OTP 28 + RabbitMQ 4.4.0 (v86, rabbitmq-trenajor/build/web).
// Terminal — birinchi serial port (rabbitmqctl va boshqalar). Ikkinchisi (ttyS1) — rmq-boshqaruv xizmati bilan JSON kanal:
// panel buyruqlari brokerda bajariladi, holat va hodisalar (firehose) sxemaga keladi.
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MashqTanlash from '@/trenajor/MashqTanlash.vue'
import { RABBITMQ_MASHQLAR } from '@/rabbitmq/mashqlar'
import { findPage } from '@/docs'
import { V86 } from 'v86'
import Terminal from '@/trenajor/Terminal.vue'
import Sxema from '@/rabbitmq/Sxema.vue'
import Boshqaruv from '@/rabbitmq/Boshqaruv.vue'
import Jurnal from '@/rabbitmq/Jurnal.vue'
import { yangiKanal } from '@/rabbitmq/kanal'
import { linuxSuggest } from '@/trenajor/linuxMaslahat'
import { symlinkTuzat } from '../../linux-trenajor/scripts/v86-tuzat.mjs'

const BASE = import.meta.env.BASE_URL
const term = ref(null)
const tayyor = ref(false)
const progress = ref('')
const vaqt = ref('')
const kanal = shallowRef(null)
const tanlangan = ref(null)
const route = useRoute()
const router = useRouter()
const BAJARILGAN_KALITI = 'rabbitmq-mashq-bajarilgan'
const mashqId = ref('')
const qadam = ref(0)
const bajarilgan = ref(oqiBajarilgan())
function oqiBajarilgan() {
  try { return new Set(JSON.parse(localStorage.getItem(BAJARILGAN_KALITI) ?? '[]')) } catch { return new Set() }
}
const ERKIN = [{ id: '', title: 'Erkin rejim', note: 'bo‘sh broker — panel va terminal bilan erkin sinash' }]
const mashq = computed(() => RABBITMQ_MASHQLAR.find((m) => m.id === mashqId.value) ?? null)
const tugadi = computed(() => mashq.value && qadam.value >= mashq.value.steps.length)
const keyingi = computed(() => { const i = RABBITMQ_MASHQLAR.indexOf(mashq.value); return i >= 0 ? RABBITMQ_MASHQLAR[i + 1] ?? null : null })
const bobNomi = computed(() => (mashq.value ? findPage(mashq.value.bob)?.title ?? '' : ''))
const qismlar = (t) => t.split('`').map((x, i) => ({ t: x, code: i % 2 === 1 }))
let mashqBoshi = 0
// har holat yangilanishida va har hodisada joriy qadamni tekshirish (faqat mashq boshlangandan keyingi hodisalar)
function tekshir() {
  const m = mashq.value, k = kanal.value
  if (!m || !k) return
  const j = k.holat.jurnal.filter((x) => x.vaqt >= mashqBoshi)
  while (qadam.value < m.steps.length && m.steps[qadam.value].tekshir(k.holat, j)) qadam.value++
  if (qadam.value === m.steps.length && !bajarilgan.value.has(m.id)) {
    bajarilgan.value = new Set([...bajarilgan.value, m.id])
    try { localStorage.setItem(BAJARILGAN_KALITI, JSON.stringify([...bajarilgan.value])) } catch { /* saqlanmasa ham ishlaydi */ }
  }
}
async function mashqniBoshla() {
  qadam.value = 0
  mashqBoshi = Date.now()
  if (kanal.value?.holat.tayyor) {
    try { await kanal.value.buyruq('tozala') } catch { /* bo'sh broker bo'lsa ham davom */ }
  }
}
const tanla = (id) => { mashqId.value = id }
watch(mashqId, (id) => {
  if ((route.query.mashq ?? '') !== id) router.replace({ query: id ? { mashq: id } : {} })
  mashqniBoshla()
})
watch(() => route.query.mashq, (id) => {
  if (typeof id === 'string' && RABBITMQ_MASHQLAR.some((m) => m.id === id)) tanla(id)
}, { immediate: true })

let vm = null
let t0 = 0

function yarat() {
  tayyor.value = false
  progress.value = ''
  vaqt.value = ''
  t0 = performance.now()
  vm = new V86({
    wasm_path: BASE + 'trenajor/v86.wasm',
    bios: { url: BASE + 'trenajor/bios/seabios.bin' },
    vga_bios: { url: BASE + 'trenajor/bios/vgabios.bin' },
    filesystem: { basefs: BASE + 'rabbitmq-trenajor/fs/fs.json', baseurl: BASE + 'rabbitmq-trenajor/fs/base/' },
    initial_state: { url: BASE + 'rabbitmq-trenajor/holat.zst' },
    // holat.mjs bilan bir xil qurilmalar (profil.json "vm")
    memory_size: 512 * 1024 * 1024,
    uart1: true,
    autostart: true,
    disable_keyboard: true,
    disable_mouse: true,
    disable_speaker: true,
  })
  symlinkTuzat(vm)
  kanal.value = yangiKanal((baytlar) => vm?.serial_send_bytes(1, baytlar))
  kanal.value.tingla(() => tekshir())
  let pending = [], scheduled = false
  vm.add_listener('serial0-output-byte', (b) => {
    pending.push(b)
    if (scheduled) return
    scheduled = true
    queueMicrotask(() => { scheduled = false; const c = Uint8Array.from(pending); pending = []; term.value?.write(c) })
  })
  vm.add_listener('serial1-output-byte', (b) => kanal.value?.bayt(b))
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

function onPrompt() {
  if (!tayyor.value) {
    tayyor.value = true
    vaqt.value = ((performance.now() - t0) / 1000).toFixed(1)
  }
}

function qaytaBoshla() {
  vm?.destroy()
  vm = null
  term.value?.reset()
  yarat()
}

const yoz = (cmd) => { send('\x15' + cmd); term.value?.focus() }
const buyruq = (op, m) => kanal.value.buyruq(op, m)
const tingla = (f) => kanal.value?.tingla(f)

onMounted(() => requestAnimationFrame(yarat))
onBeforeUnmount(() => { vm?.destroy(); vm = null })
</script>

<template>
    <div class="app">
        <header>
            <div class="title">
                <strong>RabbitMQ trenajori</strong>
                <span class="muted">haqiqiy RabbitMQ 4.4.0 · Erlang/OTP 28 · Debian 12 · brauzerda</span>
            </div>
            <MashqTanlash :model-value="mashqId" class="pick" :mashqlar="RABBITMQ_MASHQLAR" :erkin="ERKIN" :done="bajarilgan" @update:model-value="tanla" />
            <button v-if="mashq" type="button" class="btn" @click="mashqniBoshla">Qaytadan</button>
            <button type="button" class="btn" title="Brokerni boshlang'ich holatiga qaytarish" @click="qaytaBoshla">↺ Qayta boshlash</button>
            <RouterLink to="/rabbitmq" class="back">← Qo'llanmaga qaytish</RouterLink>
        </header>
        <main v-if="kanal">
            <section class="sxema-quti">
                <div v-if="!kanal.holat.tayyor" class="kutish">RabbitMQ bilan ulanish kutilmoqda…</div>
                <Sxema v-else :key="kanal" :holat="kanal.holat" :tingla="tingla" @tanla="tanlangan = $event" />
                <p v-if="kanal.holat.xato" class="xato">{{ kanal.holat.xato }}</p>
            </section>
            <aside class="panel-quti">
                <div v-if="mashq" class="mashq">
                    <h3>{{ mashq.title }}</h3>
                    <p class="intro"><template v-for="(p, k) in qismlar(mashq.intro)" :key="k"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template></p>
                    <ol class="steps">
                        <li v-for="(st, i) in mashq.steps" :key="i" :class="{ ok: i < qadam, cur: i === qadam, keyin: i > qadam }">
                            <p><template v-for="(p, k) in qismlar(st.text)" :key="k"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template></p>
                            <p v-if="i < qadam" class="natija"><template v-for="(p, k) in qismlar(st.natija)" :key="k"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template></p>
                        </li>
                    </ol>
                    <div v-if="tugadi" class="tugadi">
                        <strong>✓ Mashq tugadi.</strong>
                        <button v-if="keyingi" type="button" class="btn" @click="tanla(keyingi.id)">Keyingi: {{ keyingi.title }} →</button>
                    </div>
                    <RouterLink :to="mashq.bob" class="bob">Mavzu bo'yicha bob: {{ bobNomi }}</RouterLink>
                </div>
                <Boshqaruv :holat="kanal.holat" :buyruq="buyruq" />
            </aside>
            <section class="jurnal-quti">
                <Jurnal :jurnal="kanal.holat.jurnal" />
            </section>
            <div class="term" @wheel.prevent>
                <Terminal ref="term" :suggest="linuxSuggest" @send="send" @prompt="onPrompt" />
                <div v-if="!tayyor" class="boot">
                    <div class="spin" />
                    <p>Debian va RabbitMQ yuklanmoqda…</p>
                    <small>{{ progress }}</small>
                </div>
                <div v-else class="tez">
                    <button type="button" @click="yoz('rabbitmqctl list_queues name type messages consumers')">list_queues</button>
                    <button type="button" @click="yoz('rabbitmqctl list_exchanges name type')">list_exchanges</button>
                    <button type="button" @click="yoz('rabbitmqctl list_bindings')">list_bindings</button>
                    <button type="button" @click="yoz('rabbitmq-diagnostics status | head -30')">status</button>
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
main { flex: 1; display: grid; gap: 12px; padding: 14px 18px 18px;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 360px);
  grid-template-areas: "sxema panel" "jurnal panel" "term term"; }
.sxema-quti { grid-area: sxema; min-height: 260px; align-self: start; }
.panel-quti { grid-area: panel; }
.jurnal-quti { grid-area: jurnal; max-height: 260px; overflow: auto; align-self: start; }
.term { grid-area: term; position: relative; height: 340px; display: flex; flex-direction: column; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; background: var(--code-bg); }
.term > :first-child { flex: 1; min-height: 0; }
.sxema-quti, .panel-quti, .jurnal-quti { padding: 12px 14px; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow-sm); }
.kutish { padding: 40px; text-align: center; color: var(--text-subtle); }
.xato { margin: 6px 0 0; color: var(--danger, #d1495b); font-size: 12.5px; }
.boot { position: absolute; inset: 0; display: grid; place-content: center; justify-items: center; gap: 8px; color: #d7dde8; background: var(--code-bg); }
.boot p { margin: 0; }
.boot small { color: #9aa6ba; }
.spin { width: 28px; height: 28px; border: 3px solid #2f3b52; border-top-color: #7ee787; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.tez { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; padding: 6px 8px; border-top: 1px solid #2f3b52; }
.tez button { padding: 3px 8px; border: 1px solid #2f3b52; border-radius: 4px; background: transparent; color: #7ee787; font: 12px var(--font-mono); cursor: pointer; }
.ochildi { margin-left: auto; color: #6b7689; font-size: 11px; }
.mashq { margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
.mashq h3 { margin: 0 0 4px; font-size: 15px; }
.intro { margin: 0 0 8px; color: var(--text-muted); font-size: 13px; }
.steps { margin: 0; padding: 0; list-style: none; counter-reset: q; }
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
@media (max-width: 1000px) {
  main { grid-template-columns: 1fr; grid-template-areas: "sxema" "panel" "jurnal" "term"; }
}
</style>
