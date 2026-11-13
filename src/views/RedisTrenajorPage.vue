<script setup>
// Redis trenajori: brauzerdagi haqiqiy Debian 12 + Redis 8.10.3 (v86, redis-trenajor/build/web).
// Terminal — birinchi serial port (redis-cli). Ikkinchisi (ttyS1) — redis-boshqaruv xizmati bilan JSON kanal:
// panel buyruqlari Redis'da bajariladi; kalitlar holati, MONITOR, keyspace hodisalari va Pub/Sub sahifaga keladi.
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { V86 } from 'v86'
import Terminal from '@/trenajor/Terminal.vue'
import MashqTanlash from '@/trenajor/MashqTanlash.vue'
import Kalitlar from '@/redis/Kalitlar.vue'
import Oqim from '@/redis/Oqim.vue'
import PubSub from '@/redis/PubSub.vue'
import Statistika from '@/redis/Statistika.vue'
import { yangiKanal } from '@/redis/kanal'
import { GURUHLAR, IZOH } from '@/redis/izohlar'
import { REDIS_MASHQLAR } from '@/redis/mashqlar'
import { linuxSuggest } from '@/trenajor/linuxMaslahat'
import { symlinkTuzat } from '../../linux-trenajor/scripts/v86-tuzat.mjs'
import { findPage } from '@/docs'

const BASE = import.meta.env.BASE_URL
const term = ref(null)
const tayyor = ref(false)
const progress = ref('')
const vaqt = ref('')
const kanal = shallowRef(null)
let vm = null, t0 = 0

// ---------------------------------------------------------------- buyruq paneli
const guruh = ref('kalit')
const qator = ref('SET salom "dunyo"')
const tarix = ref([])     // [{ qator, natija, ok }]
const band = ref(false)
const izoh = computed(() => IZOH[(qator.value.trim().split(/\s+/)[0] ?? '').toUpperCase()] ?? '')
async function bajar(q = qator.value) {
  if (!kanal.value?.holat.tayyor || band.value || !q.trim()) return
  band.value = true
  try {
    const natija = await kanal.value.redis(q)
    tarix.value = [{ qator: q, natija, ok: true }, ...tarix.value].slice(0, 12)
  } catch (e) {
    tarix.value = [{ qator: q, natija: e.message, ok: false }, ...tarix.value].slice(0, 12)
  } finally {
    band.value = false
  }
}
const tanlaBuyruq = (q) => { qator.value = q }

// ---------------------------------------------------------------- mashqlar
const route = useRoute()
const router = useRouter()
const BAJARILGAN_KALITI = 'redis-mashq-bajarilgan'
const mashqId = ref('')
const qadam = ref(0)
const bajarilgan = ref(oqiBajarilgan())
function oqiBajarilgan() {
  try { return new Set(JSON.parse(localStorage.getItem(BAJARILGAN_KALITI) ?? '[]')) } catch { return new Set() }
}
const ERKIN = [{ id: '', title: 'Erkin rejim', note: 'bo‘sh Redis — panel va terminal bilan erkin sinash' }]
const mashq = computed(() => REDIS_MASHQLAR.find((m) => m.id === mashqId.value) ?? null)
const tugadi = computed(() => mashq.value && qadam.value >= mashq.value.steps.length)
const keyingi = computed(() => { const i = REDIS_MASHQLAR.indexOf(mashq.value); return i >= 0 ? REDIS_MASHQLAR[i + 1] ?? null : null })
const bobNomi = computed(() => (mashq.value ? findPage(mashq.value.bob)?.title ?? '' : ''))
const qismlar = (t) => t.split('`').map((x, i) => ({ t: x, code: i % 2 === 1 }))
let mashqBoshi = 0
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
const MASHQ_GURUH = { 'kalit-muddat': 'kalit', 'string-sanagich': 'string', 'list-navbat': 'list', 'hash-obyekt': 'hash', 'set-teglar': 'set', 'zset-reyting': 'zset', 'stream-guruh': 'stream', tranzaksiya: 'tranz', evikt: 'xotira' }
async function mashqniBoshla() {
  qadam.value = 0
  mashqBoshi = Date.now()
  tarix.value = []
  if (mashq.value) guruh.value = MASHQ_GURUH[mashq.value.id] ?? guruh.value
  if (kanal.value?.holat.tayyor) {
    try { await kanal.value.buyruq('tozala') } catch { /* bo'sh bo'lsa ham */ }
    mashqBoshi = Date.now()
  }
}
const tanla = (id) => { mashqId.value = id }
watch(mashqId, (id) => {
  if ((route.query.mashq ?? '') !== id) router.replace({ query: id ? { mashq: id } : {} })
  mashqniBoshla()
})
watch(() => route.query.mashq, (id) => {
  if (typeof id === 'string' && REDIS_MASHQLAR.some((m) => m.id === id)) tanla(id)
}, { immediate: true })

// ---------------------------------------------------------------- VM
function yarat() {
  tayyor.value = false
  progress.value = ''
  vaqt.value = ''
  t0 = performance.now()
  vm = new V86({
    wasm_path: BASE + 'trenajor/v86.wasm',
    bios: { url: BASE + 'trenajor/bios/seabios.bin' },
    vga_bios: { url: BASE + 'trenajor/bios/vgabios.bin' },
    filesystem: { basefs: BASE + 'redis-trenajor/fs/fs.json', baseurl: BASE + 'redis-trenajor/fs/base/' },
    initial_state: { url: BASE + 'redis-trenajor/holat.zst' },
    memory_size: 256 * 1024 * 1024,   // profil.json "vm" bilan bir xil
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
const yoz = (cmd) => { send('\x15' + cmd); term.value?.focus() }
function onPrompt() {
  if (!tayyor.value) {
    tayyor.value = true
    vaqt.value = ((performance.now() - t0) / 1000).toFixed(1)
  }
}
function qaytaBoshla() {
  vm?.destroy()
  vm = null
  tarix.value = []
  term.value?.reset()
  yarat()
}
const tingla = (f) => kanal.value?.tingla(f)
onMounted(() => requestAnimationFrame(yarat))
onBeforeUnmount(() => { vm?.destroy(); vm = null })
</script>

<template>
    <div class="app">
        <header>
            <div class="title">
                <strong>Redis trenajori</strong>
                <span class="muted">haqiqiy Redis 8.10.3 · Debian 12 · brauzerda</span>
            </div>
            <MashqTanlash :model-value="mashqId" class="pick" :mashqlar="REDIS_MASHQLAR" :erkin="ERKIN" :done="bajarilgan" @update:model-value="tanla" />
            <button v-if="mashq" type="button" class="btn" @click="mashqniBoshla">Qaytadan</button>
            <button type="button" class="btn" title="Redis'ni boshlang'ich holatiga qaytarish" @click="qaytaBoshla">↺ Qayta boshlash</button>
            <RouterLink to="/redis" class="back">← Qo'llanmaga qaytish</RouterLink>
        </header>
        <main v-if="kanal">
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

            <div class="tepa">
                <section class="quti panel">
                    <div class="guruhlar">
                        <button v-for="g in GURUHLAR" :key="g.id" type="button" :class="{ on: guruh === g.id }" @click="guruh = g.id">{{ g.nom }}</button>
                    </div>
                    <div class="tayyorlar">
                        <button v-for="[b, iz] in GURUHLAR.find((g) => g.id === guruh).buyruqlar" :key="b" type="button" :title="b" @click="tanlaBuyruq(b)" @dblclick="bajar(b)">
                            <code>{{ b.length > 46 ? b.slice(0, 46) + '…' : b }}</code><small>{{ iz }}</small>
                        </button>
                    </div>
                    <div class="qator">
                        <span class="prompt">127.0.0.1:6379&gt;</span>
                        <input v-model="qator" spellcheck="false" aria-label="Redis buyrug'i" @keydown.enter="bajar()">
                        <button type="button" class="asosiy" :disabled="!kanal.holat.tayyor || band" @click="bajar()">▶ Bajarish</button>
                    </div>
                    <p v-if="izoh" class="izoh"><b>{{ qator.trim().split(/\s+/)[0].toUpperCase() }}</b> — {{ izoh }}</p>
                    <div v-if="tarix.length" class="javoblar">
                        <div v-for="(t, i) in tarix" :key="i" class="javob" :class="{ xato: !t.ok, eski: i > 0 }">
                            <code class="b">&gt; {{ t.qator }}</code>
                            <pre>{{ t.natija }}</pre>
                        </div>
                    </div>
                    <p v-if="!kanal.holat.tayyor" class="kutish">Redis bilan ulanish kutilmoqda…</p>
                    <p v-else class="maslahat">Tayyor buyruqni bosing (ikki marta bossangiz — darhol bajariladi) yoki o‘zingiz yozing. Pastdagi terminalda <code>redis-cli</code> ham shu serverga ulanadi.</p>
                </section>
                <aside class="quti"><Statistika :info="kanal.holat.info" /></aside>
            </div>

            <div class="orta">
                <section class="quti">
                    <Kalitlar v-if="kanal.holat.tayyor" :key="kanal" :holat="kanal.holat" :tingla="tingla" />
                    <p v-else class="kutish">Debian va Redis yuklanmoqda…</p>
                    <p v-if="kanal.holat.xato" class="xato">{{ kanal.holat.xato }}</p>
                </section>
                <aside class="quti"><PubSub v-if="kanal.holat.tayyor" :holat="kanal.holat" :kanal="kanal" /></aside>
            </div>

            <section class="quti oqim-quti"><Oqim :jurnal="kanal.holat.jurnal" /></section>

            <div class="term" @wheel.prevent>
                <Terminal ref="term" :suggest="linuxSuggest" @send="send" @prompt="onPrompt" />
                <div v-if="!tayyor" class="boot">
                    <div class="spin" />
                    <p>Debian va Redis yuklanmoqda…</p>
                    <small>{{ progress }}</small>
                </div>
                <div v-else class="tez">
                    <button type="button" @click="yoz('redis-cli')">redis-cli</button>
                    <button type="button" @click="yoz('redis-cli --scan')">--scan</button>
                    <button type="button" @click="yoz('redis-cli INFO keyspace')">INFO keyspace</button>
                    <button type="button" @click="yoz('redis-cli --stat')">--stat</button>
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
.tepa, .orta { display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 14px; align-items: start; }
.kutish { margin: 0; color: var(--text-subtle); font-size: 13px; }
.xato { margin: 8px 0 0; color: var(--danger, #dc2626); font-size: 12.5px; }

.panel { display: grid; gap: 10px; }
.guruhlar { display: flex; flex-wrap: wrap; gap: 3px; padding: 3px; border-radius: 12px; background: var(--bg-sunken); border: 1px solid var(--border); justify-self: start; }
.guruhlar button { padding: 6px 11px; border: 0; border-radius: 9px; background: none; color: var(--text-muted); font: 500 13px var(--font-sans); cursor: pointer; }
.guruhlar button.on { background: var(--accent); color: #fff; font-weight: 600; }
.tayyorlar { display: flex; flex-wrap: wrap; gap: 7px; }
.tayyorlar button { display: grid; gap: 1px; text-align: left; padding: 6px 10px; border: 1px dashed var(--border-strong); border-radius: 9px; background: none; color: var(--text); cursor: pointer; max-width: 100%; }
.tayyorlar button:hover { border-style: solid; border-color: var(--accent); }
.tayyorlar code { font: 600 12px var(--font-mono); color: var(--accent-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tayyorlar small { font-size: 11px; color: var(--text-subtle); }
.qator { display: flex; gap: 8px; align-items: center; padding: 6px 6px 6px 12px; border-radius: 12px; background: var(--code-bg); }
.prompt { font: 13px var(--font-mono); color: #7ee787; white-space: nowrap; }
.qator input { flex: 1; min-width: 0; padding: 7px 4px; border: 0; background: none; color: #e6edf3; font: 14px var(--font-mono); outline: none; }
.asosiy { padding: 8px 18px; border: 0; border-radius: 9px; background: var(--accent); color: #fff; font: 700 14px var(--font-sans); cursor: pointer; }
.asosiy:disabled { opacity: .55; }
.izoh { margin: 0; font-size: 12.5px; color: var(--text-muted); }
.javoblar { display: grid; gap: 4px; max-height: 220px; overflow: auto; }
.javob { padding: 6px 10px; border-radius: 9px; background: var(--bg-sunken); }
.javob.eski { opacity: .6; }
.javob .b { font: 12px var(--font-mono); color: var(--text-subtle); }
.javob pre { margin: 2px 0 0; font: 13px/1.45 var(--font-mono); white-space: pre-wrap; overflow-wrap: anywhere; }
.javob.xato pre { color: var(--danger, #dc2626); }
.maslahat { margin: 0; font-size: 12px; color: var(--text-subtle); }
.maslahat code { font: 11.5px var(--font-mono); }
.oqim-quti { max-height: 360px; overflow: auto; }

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
@media (max-width: 1100px) { .tepa, .orta, .mashq { grid-template-columns: 1fr; } }
</style>
