<script setup>
// Linux trenajori sahifasi: terminal + mashqlar. Terminalning o'zi (LinuxTerminal.vue) App darajasida turadi va shu
// sahifadagi joyga Teleport bilan ko'chiriladi: boblardagi tezkor terminal bilan VM bitta.
// Mashq tekshiruvi ham LinuxTerminal'da (VM'dan keladigan holat) — bu sahifa faqat tanlash va qadamlarni ko'rsatadi.
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MashqTanlash from '@/trenajor/MashqTanlash.vue'
import { LINUX_MASHQLAR } from '@/trenajor/linuxMashqlar'
import { boshqaruv, terminal } from '@/trenajor/linuxTerminal'
import { findPage } from '@/docs'

const route = useRoute()
const router = useRouter()
const mashqEl = ref(null)

const ERKIN = [{ id: '', title: 'Erkin rejim', note: 'oddiy terminal, hech narsa tayyorlanmaydi' }]
const mashq = computed(() => LINUX_MASHQLAR.find((m) => m.id === terminal.mashqId) ?? null)
const tugadi = computed(() => mashq.value && terminal.qadam >= mashq.value.steps.length)
const keyingi = computed(() => {
  const i = LINUX_MASHQLAR.indexOf(mashq.value)
  return i >= 0 ? LINUX_MASHQLAR[i + 1] ?? null : null
})
const bobNomi = computed(() => (mashq.value ? findPage(mashq.value.bob)?.title ?? '' : ''))
const qismlar = (s) => s.split('`').map((t, i) => ({ t, code: i % 2 === 1 }))

// bobdagi "Mashqni boshlash" havolasi: /linux/trenajor?mashq=<id>
const tanla = (id) => { terminal.mashqId = id }
watch(() => route.query.mashq, (id) => {
  if (typeof id === 'string' && LINUX_MASHQLAR.some((m) => m.id === id)) tanla(id)
}, { immediate: true })
// tanlov manzilda ham tursin — sahifani yangilasa yoki havolani ulashsa, o'sha mashq ochiladi
watch(() => terminal.mashqId, (id) => {
  if ((route.query.mashq ?? '') !== id) router.replace({ query: id ? { mashq: id } : {} })
})

// joriy qadam (yoki yakun) panel ichida ko'rinib tursin
watch(() => terminal.qadam, async () => {
  await nextTick()
  const box = mashqEl.value
  const el = box?.querySelector('.tugadi') ?? box?.querySelector('li.cur')
  if (box && el) box.scrollTo({ top: el.offsetTop - box.clientHeight / 3, behavior: 'smooth' })
})

// joy DOM'da paydo bo'lgandan keyingina terminal ko'chiriladi (sahifa komponenti kech yuklanishi mumkin)
onMounted(() => { terminal.sahifada = true })
onBeforeUnmount(() => { terminal.sahifada = false })
</script>

<template>
    <div class="app">
        <header>
            <div class="title">
                <strong>Linux trenajori</strong>
                <span class="muted">haqiqiy Debian 12 · systemd · brauzerda</span>
            </div>
            <MashqTanlash
                :model-value="terminal.mashqId"
                class="pick"
                :mashqlar="LINUX_MASHQLAR"
                :erkin="ERKIN"
                :done="terminal.bajarilgan"
                @update:model-value="tanla"
            />
            <button v-if="mashq" type="button" class="btn" @click="terminal.boshlash++">Qaytadan</button>
            <RouterLink to="/linux" class="back">← Qo'llanmaga qaytish</RouterLink>
        </header>
        <main :class="{ 'has-side': mashq }">
            <div id="linux-trenajor-terminal" class="term" />
            <aside v-if="mashq" ref="mashqEl" class="side">
                <h3>{{ mashq.title }}</h3>
                <p class="intro">
                    <template v-for="(p, k) in qismlar(mashq.intro)" :key="k"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template>
                </p>
                <ol class="steps">
                    <li
                        v-for="(s, i) in mashq.steps"
                        :key="i"
                        :class="{ ok: i < terminal.qadam, cur: i === terminal.qadam, keyin: i > terminal.qadam }"
                    >
                        <p><template v-for="(p, k) in qismlar(s.text)" :key="k"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template></p>
                        <button
                            v-if="i <= terminal.qadam"
                            type="button"
                            class="cmd"
                            title="Terminalga yozish (Enter'ni o'zingiz bosasiz)"
                            @click="boshqaruv.yoz(s.cmd)"
                        >$ {{ s.cmd }}</button>
                        <p v-if="i < terminal.qadam" class="natija">
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
main { flex: 1; min-height: 0; display: grid; grid-template-columns: 1fr; gap: 12px; padding: 14px 18px 18px; }
main.has-side { grid-template-columns: minmax(0, 1fr) minmax(300px, 380px); }
.term { min-width: 0; min-height: 0; display: flex; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; background: var(--code-bg); }
.side { min-height: 0; overflow: auto; padding: 12px 16px 16px; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow-sm); }

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

/* tor ekranda: terminal tepada, mashq pastda */
@media (max-width: 900px) {
    .app { height: auto; min-height: calc(100vh - var(--topbar-height)); }
    main.has-side { grid-template-columns: 1fr; grid-template-rows: 60vh auto; }
    main:not(.has-side) { grid-template-rows: 70vh; }
}
</style>
