<script setup>
// Linux kitobidagi terminal: boblarda — ekran pastidan chiqadigan tezkor panel, trenajor sahifasida — sahifadagi
// joyga Teleport bilan ko'chiriladi (VM bitta, qayta yaratilmaydi).
// Brauzerdagi haqiqiy Debian 12 + systemd (v86) yuklangan holatdan tiklanadi: sahifa vaqt va terminal o'lchamini
// yuboradi, VM ichidagi `read` uni olib soatni to'g'rilaydi (linux-trenajor/scripts/holat.mjs).
// Panel App darajasida turadi: boblar orasida o'tganda VM va undagi ish saqlanadi.
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { V86 } from 'v86'
import Terminal from '@/trenajor/Terminal.vue'
// 9p'da yangi symlink hajmi 0 va huquqi 0000 bo'lib qolmasin (ln -s dan keyin `ls -l` to'g'ri ko'rinsin)
import { symlinkTuzat } from '../../linux-trenajor/scripts/v86-tuzat.mjs'
import { bajarildi, boshqaruv, terminal, terminalniOch } from '@/trenajor/linuxTerminal'
import { LINUX_MASHQLAR, mashqSkripti } from '@/trenajor/linuxMashqlar'

const props = defineProps({
  /** Linux kitobi sahifasidami — boshqa kitobda panel yashirinadi va VM to'xtatiladi */
  korinadi: { type: Boolean, default: false },
})

// trenajor sahifasi o'z joyini (#linux-trenajor-terminal) yaratganda true bo'ladi
const sahifada = computed(() => terminal.sahifada)
const BASE = import.meta.env.BASE_URL
const BALANDLIK_KALITI = 'linux-terminal-balandlik'
const term = ref(null)
const tayyor = ref(false)
const progress = ref('')
const vaqt = ref('')
const balandlik = ref(oqiBalandlik())
/** panel ekran balandligigacha kattalashtirilgan (sahifa almashmaydi) */
const katta = ref(false)
let vm = null
let t0 = 0
// mashq: joriysi, birinchi holat (boshlang'ich — qadam emas) va o'quvchi oxirgi yozgan buyruq
let joriy = null
let boshlanmoqda = false
// bash tarixidagi oxirgi buyruq raqami — bo'sh Enter yangi buyruq hisoblanmasin
let oxirgiRaqam = null

function oqiBalandlik() {
  try {
    return Number(localStorage.getItem(BALANDLIK_KALITI)) || Math.round(window.innerHeight * 0.42)
  } catch {
    return Math.round(window.innerHeight * 0.42)
  }
}

const panelKorinadi = computed(() => sahifada.value || (props.korinadi && terminal.ochiq))

function yarat() {
  tayyor.value = false
  progress.value = ''
  vaqt.value = ''
  t0 = performance.now()
  vm = new V86({
    wasm_path: BASE + 'trenajor/v86.wasm',
    bios: { url: BASE + 'trenajor/bios/seabios.bin' },
    vga_bios: { url: BASE + 'trenajor/bios/vgabios.bin' },
    filesystem: { basefs: BASE + 'linux-trenajor/fs/fs.json', baseurl: BASE + 'linux-trenajor/fs/base/' },
    initial_state: { url: BASE + 'linux-trenajor/holat.zst' },
    memory_size: 256 * 1024 * 1024,
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
  vm.add_listener('download-progress', (e) => {
    if (e.lengthComputable && e.file_name) progress.value = `${e.file_name.split('/').pop()} — ${Math.round((e.loaded / e.total) * 100)}%`
  })
  vm.add_listener('emulator-ready', () => {
    // brauzerda emulator-ready holat to'liq tiklanmasdan keladi — erta yuborilgan baytlar yo'qoladi
    const kut = () => {
      if (!vm || !vm.is_running()) return void setTimeout(kut, 50)
      const { cols, rows } = term.value.size()
      vm.serial0_send(`${Math.floor(Date.now() / 1000)} ${cols} ${rows}\n`)
    }
    kut()
  })
}

const send = (t) => vm?.serial0_send(String.fromCharCode(...new TextEncoder().encode(t)))

/** Navbatdagi buyruq faqat prompt kelganda yuboriladi — oldingisi tugaguncha kutadi */
function keyingisi() {
  if (!tayyor.value || !terminal.navbat.length) return
  // Ctrl+U — qatorda yarim yozilgan narsa qolgan bo'lsa, o'chiradi
  send('\x15' + terminal.navbat.shift() + '\n')
}

function onPrompt() {
  if (!tayyor.value) {
    tayyor.value = true
    vaqt.value = ((performance.now() - t0) / 1000).toFixed(1)
    if (terminal.mashqId) return void mashqniBoshla()
  }
  keyingisi()
  term.value?.focus()
}

/** Tanlangan mashqni VM ichida noldan tayyorlaydi; '' — erkin rejim (tekshiruv o'chadi) */
async function mashqniBoshla() {
  if (!vm || !tayyor.value) return
  joriy = LINUX_MASHQLAR.find((m) => m.id === terminal.mashqId) ?? null
  terminal.qadam = 0
  if (!joriy) {
    boshlanmoqda = false
    send('\x15 unset PROMPT_COMMAND; cd ~; clear\n')
    return
  }
  boshlanmoqda = true
  // 9p keshi: har safar yangi nom; fayl sourcedan keyin darhol o'chiriladi
  const f = `/root/.mashq-${Date.now()}.sh`
  await vm.create_file(f, new TextEncoder().encode(mashqSkripti(joriy)))
  send(`\x15 . ${f}; rm -f ${f}\n`)
  term.value?.focus()
}

/** VM'dagi __mashq funksiyasi har prompt oldidan yuboradi: mashq:<id>:<har qadam uchun 1/0>:<history 1> */
function onHolat(matn) {
  const [tur, id, bitlar = '', ...qolgan] = matn.split(':')
  if (tur !== 'mashq' || !joriy || id !== joriy.id) return
  const tarix = qolgan.join(':').match(/^\s*(\d+)\s+(.*)$/)
  const raqam = tarix?.[1] ?? null
  const oxirgiBuyruq = raqam && raqam !== oxirgiRaqam ? tarix[2].trim() : null
  oxirgiRaqam = raqam
  // birinchi holat — mashq skriptining o'zi; qadam emas
  if (boshlanmoqda) {
    boshlanmoqda = false
    return
  }
  let buyruqIshlatildi = false
  while (terminal.qadam < joriy.steps.length) {
    const q = joriy.steps[terminal.qadam]
    const ok = q.ran
      ? !buyruqIshlatildi && oxirgiBuyruq != null && q.ran.test(oxirgiBuyruq)
      : bitlar[terminal.qadam] === '1'
    if (!ok) break
    if (q.ran) buyruqIshlatildi = true
    terminal.qadam++
  }
  if (terminal.qadam === joriy.steps.length) bajarildi(joriy.id)
}

function qaytaBoshla() {
  vm?.destroy()
  vm = null
  terminal.navbat.splice(0)
  term.value?.reset()
  yarat()
}

function yop() {
  terminal.ochiq = false
  katta.value = false
}

// panelni yuqori chetidan tortib balandligini o'zgartirish
function tortishniBoshla(e) {
  const y0 = e.clientY, h0 = balandlik.value
  const harakat = (ev) => {
    balandlik.value = Math.min(Math.round(window.innerHeight * 0.85), Math.max(160, h0 + y0 - ev.clientY))
  }
  const tugat = () => {
    window.removeEventListener('pointermove', harakat)
    window.removeEventListener('pointerup', tugat)
    try { localStorage.setItem(BALANDLIK_KALITI, String(balandlik.value)) } catch { /* saqlanmasa ham ishlaydi */ }
  }
  window.addEventListener('pointermove', harakat)
  window.addEventListener('pointerup', tugat)
}

// sahifa pastki qismi panel ostida qolmasin
watch([panelKorinadi, balandlik, sahifada], () => {
  const h = panelKorinadi.value && !sahifada.value ? `${balandlik.value}px` : '0px'
  document.documentElement.style.setProperty('--linux-terminal-h', h)
}, { immediate: true })

// boshqa kitobga o'tilganda VM protsessorni band qilmasin
watch(() => props.korinadi || sahifada.value, (k) => {
  if (!vm) return
  if (k) vm.run()
  else vm.stop()
})

watch(() => terminal.navbat.length, keyingisi)
watch(() => [terminal.mashqId, terminal.boshlash], mashqniBoshla)
boshqaruv.yoz = (buyruq) => { send('\x15' + buyruq); term.value?.focus() }
watch(panelKorinadi, (k) => { if (k && tayyor.value) setTimeout(() => term.value?.focus()) })

// VM (~23 MB yuklanadi) faqat terminal birinchi marta ochilganda yaratiladi; trenajor sahifasi uni darhol ochadi
watch(() => terminal.faol || sahifada.value, (f) => {
  if (!f || vm) return
  terminal.faol = true
  requestAnimationFrame(yarat)
}, { immediate: true })
onBeforeUnmount(() => {
  vm?.destroy()
  document.documentElement.style.setProperty('--linux-terminal-h', '0px')
})
</script>

<template>
    <!-- `to` o'zgarganda Vue nishonni qayta topadi; `disabled` almashganda esa eski (topilmagan) nishonda qoladi -->
    <Teleport :to="sahifada ? '#linux-trenajor-terminal' : 'body'">
    <section
        v-show="panelKorinadi"
        class="linux-terminal"
        :class="{ 'is-page': sahifada, 'is-max': katta && !sahifada }"
        :style="sahifada || katta ? null : { height: `${balandlik}px` }"
        aria-label="Linux trenajori terminali"
    >
        <div v-if="!sahifada && !katta" class="lt-handle" title="Tortib balandlikni o'zgartiring" @pointerdown.prevent="tortishniBoshla" />
        <header class="lt-bar">
            <span class="lt-title">
                <span class="lt-dot" :class="{ 'is-on': tayyor }" />
                Debian 12 · systemd
                <small v-if="vaqt">{{ vaqt }} s da ochildi</small>
                <small v-else>yuklanmoqda…</small>
            </span>
            <span class="lt-actions">
                <!-- trenajor haqidagi eslatma VM ichidagi /etc/motd da (linux-trenajor/scripts/motd) -->
                <button type="button" title="Bu terminal haqida (cat /etc/motd)" aria-label="Bu terminal haqida" @click="terminal.navbat.push('cat /etc/motd')">ⓘ</button>
                <button type="button" title="Tizimni boshlang'ich holatiga qaytarish" @click="qaytaBoshla">↺ Qayta boshlash</button>
                <button
                    v-if="!sahifada"
                    type="button"
                    :title="katta ? 'Kichraytirish' : 'Ekran bo\'yi kattalashtirish'"
                    :aria-label="katta ? 'Kichraytirish' : 'Kattalashtirish'"
                    @click="katta = !katta"
                >{{ katta ? '⤡' : '⤢' }}</button>
                <button v-if="!sahifada" type="button" title="Yashirish (tizim ishlab turadi)" aria-label="Yashirish" @click="yop">—</button>
            </span>
        </header>
        <!-- g'ildirak terminalni suradi (xterm o'zi), sahifaga o'tib ketmasin — chegaraga yetganda ham -->
        <div v-if="terminal.faol" class="lt-body" @wheel.prevent>
            <Terminal ref="term" @send="send" @prompt="onPrompt" @holat="onHolat" />
            <div v-if="!tayyor" class="lt-boot">
                <div class="lt-spin" />
                <p>Debian yuklanmoqda…</p>
                <small>{{ progress }}</small>
            </div>
        </div>
    </section>
    </Teleport>

    <button
        v-if="korinadi && !terminal.ochiq && !sahifada"
        type="button"
        class="lt-open"
        @click="terminalniOch()"
    >
        <span aria-hidden="true">&gt;_</span> Terminal
    </button>
</template>

<style scoped>
.linux-terminal {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 40;
    display: flex;
    flex-direction: column;
    background: var(--code-bg);
    border-top: 1px solid var(--border);
    box-shadow: 0 -8px 24px rgba(0, 0, 0, .18);
}
.linux-terminal.is-max { top: var(--topbar-height); }
/* trenajor sahifasida: sahifadagi ramka ichida, oqimda */
.linux-terminal.is-page {
    position: static;
    flex: 1;
    min-width: 0;
    border-top: 0;
    box-shadow: none;
}
.lt-handle {
    position: absolute;
    top: -5px;
    left: 0;
    right: 0;
    height: 10px;
    cursor: ns-resize;
    touch-action: none;
}
.lt-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 6px 12px;
    border-bottom: 1px solid #263044;
    color: #c9d1de;
    font-size: 0.85rem;
}
.lt-title { display: flex; align-items: center; gap: 8px; white-space: nowrap; overflow: hidden; }
.lt-title small { color: #6b7689; }
.lt-dot { width: 8px; height: 8px; border-radius: 50%; background: #e3b341; flex: none; }
.lt-dot.is-on { background: #7ee787; }
.lt-actions { display: flex; gap: 4px; flex: none; }
.lt-actions button,
.lt-actions a {
    background: none;
    border: 1px solid transparent;
    border-radius: 6px;
    color: #9aa6ba;
    padding: 2px 8px;
    font: inherit;
    cursor: pointer;
    text-decoration: none;
}
.lt-actions button:hover,
.lt-actions a:hover { color: #fff; background: rgba(255, 255, 255, .08); }
.lt-body { position: relative; flex: 1; min-height: 0; display: flex; overscroll-behavior: contain; }
.lt-body > :first-child { flex: 1; min-width: 0; }
.lt-boot {
    position: absolute;
    inset: 0;
    background: var(--code-bg);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: #9aa6ba;
}
.lt-boot small { color: #6b7689; font-family: var(--font-mono); }
.lt-spin { width: 30px; height: 30px; border: 3px solid #263044; border-top-color: #7ee787; border-radius: 50%; animation: lt-s 0.9s linear infinite; }
@keyframes lt-s { to { transform: rotate(360deg); } }
.lt-open {
    position: fixed;
    right: 20px;
    bottom: 20px;
    z-index: 40;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: var(--code-bg);
    color: #d7dde8;
    font: 600 0.9rem system-ui, sans-serif;
    box-shadow: 0 6px 20px rgba(0, 0, 0, .25);
    cursor: pointer;
}
.lt-open span { color: #7ee787; font-family: var(--font-mono); }
.lt-open:hover { transform: translateY(-1px); }
</style>
