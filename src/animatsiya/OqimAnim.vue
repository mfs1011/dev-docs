<script setup>
// 11-bob: uchta oqim (0, 1, 2) va yo'naltirish. Bash qo'llanmasi: yo'naltirishlar chapdan o'ngga bajariladi —
// shuning uchun `> fayl 2>&1` va `2>&1 > fayl` turlicha ishlaydi. Har qadam bitta operatorni bajaradi.
import { computed, ref } from 'vue'

const L = 'ls /etc/hostname /yoq'
const QADAMLAR = [
  { cmd: [[L]], t1: 'ekran', t2: 'ekran', fayl: '',
    izoh: 'Har dasturda uchta oqim bor: 0 — kirish (klaviatura), 1 — natija (stdout), 2 — xatolar (stderr). 1 ham, 2 ham ekranga boradi, shuning uchun ular bitta oqimdek ko‘rinadi.' },
  { cmd: [[L + ' '], ['> natija.txt', 1]], t1: 'fayl', t2: 'ekran', fayl: 'natija.txt',
    izoh: '`>` faqat 1-oqimni faylga buradi. Xato xabari (2) ekranda qoldi — shuning uchun faylga yozganda ham xatoni ko‘rasiz.' },
  { cmd: [[L + ' '], ['2> xato.txt', 1]], t1: 'ekran', t2: 'fayl', fayl: 'xato.txt',
    izoh: '`2>` — 2-oqimni faylga. Ekranda faqat natija qoldi, xato faylga yozildi.' },
  { cmd: [[L + ' '], ['> hammasi.txt', 1], [' 2>&1']], t1: 'fayl', t2: 'ekran', fayl: 'hammasi.txt',
    izoh: 'Yo‘naltirishlar chapdan o‘ngga bajariladi. Avval `> hammasi.txt`: 1-oqim faylga ketdi.' },
  { cmd: [[L + ' > hammasi.txt '], ['2>&1', 1]], t1: 'fayl', t2: 'fayl', fayl: 'hammasi.txt',
    izoh: 'Keyin `2>&1`: "2-oqimni 1-oqim HOZIR qayerga ketayotgan bo‘lsa, o‘sha yerga bur". 1 allaqachon faylda — ikkalasi faylga.' },
  { cmd: [[L + ' '], ['2>&1', 1], [' > faqat.txt']], t1: 'ekran', t2: 'ekran', fayl: 'faqat.txt',
    izoh: 'Tartib teskari bo‘lsa: avval `2>&1`. Shu paytda 1 ekranga ketyapti — demak 2 ham EKRANGA qotib qoladi.' },
  { cmd: [[L + ' 2>&1 '], ['> faqat.txt', 1]], t1: 'fayl', t2: 'ekran', fayl: 'faqat.txt',
    izoh: 'Endi `> faqat.txt` 1-oqimni faylga burdi, 2 esa ekranda qoldi. Bash qo‘llanmasi aynan shu misolni keltiradi: tartib muhim.' },
]

const i = ref(0)
const q = computed(() => QADAMLAR[i.value])
const qismlar = (s) => s.split('`').map((t, k) => ({ t, code: k % 2 === 1 }))
// chiqish portidan (330, y) nishonga: ekran (520, 65) yoki fayl (520, 195)
const yol = (y, t) => {
  const ty = t === 'ekran' ? 65 : 195
  return `M330 ${y} C 430 ${y}, 420 ${ty}, 514 ${ty}`
}
</script>

<template>
  <div class="oqim-anim">
    <div class="oa-cmd"><span class="oa-dollar">$</span><template v-for="(p, k) in q.cmd" :key="k"><span :class="{ 'oa-hl': p[1] }">{{ p[0] }}</span></template></div>
    <svg viewBox="0 0 720 250" role="img" :aria-label="q.izoh">
      <defs>
        <marker id="oa-uch" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0L10 5L0 10z" fill="context-stroke" />
        </marker>
      </defs>

      <rect x="10" y="95" width="130" height="40" rx="8" class="oa-quti" />
      <text x="75" y="120" text-anchor="middle" class="oa-nom">klaviatura</text>
      <path d="M140 115 L 196 115" class="oa-yol oa-0" marker-end="url(#oa-uch)" />
      <text x="168" y="108" text-anchor="middle" class="oa-fd oa-0t">0</text>

      <rect x="200" y="45" width="130" height="160" rx="10" class="oa-quti oa-jarayon" />
      <text x="265" y="120" text-anchor="middle" class="oa-nom">ls</text>
      <text x="265" y="140" text-anchor="middle" class="oa-meta">jarayon</text>
      <text x="342" y="92" class="oa-fd oa-1t">1</text>
      <text x="342" y="174" class="oa-fd oa-2t">2</text>

      <rect x="520" y="40" width="180" height="50" rx="8" class="oa-quti" />
      <text x="610" y="70" text-anchor="middle" class="oa-nom">ekran</text>
      <g class="oa-el" :class="{ 'is-off': !q.fayl }">
        <rect x="520" y="170" width="180" height="50" rx="8" class="oa-quti oa-fayl" />
        <text x="610" y="200" text-anchor="middle" class="oa-nom">{{ q.fayl }}</text>
      </g>

      <path :d="yol(100, q.t1)" class="oa-yol oa-1" marker-end="url(#oa-uch)" />
      <path :d="yol(160, q.t2)" class="oa-yol oa-2" marker-end="url(#oa-uch)" />
    </svg>

    <p class="oa-izoh"><template v-for="(p, k) in qismlar(q.izoh)" :key="k"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template></p>
    <div class="oa-legend"><span class="oa-1t">● 1 — stdout (natija)</span><span class="oa-2t">● 2 — stderr (xato)</span></div>

    <div class="oa-boshqaruv">
      <button type="button" :disabled="i === 0" @click="i--">← Oldingi</button>
      <span class="oa-nuqtalar">
        <button v-for="(_, k) in QADAMLAR" :key="k" type="button" :class="{ on: k === i }" :aria-label="`${k + 1}-qadam`" @click="i = k" />
      </span>
      <button type="button" :disabled="i === QADAMLAR.length - 1" @click="i++">Keyingi →</button>
    </div>
  </div>
</template>

<style scoped>
.oqim-anim { margin: 20px 0; padding: 14px 16px 12px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-elevated); }
.oa-cmd { font: 14px var(--font-mono); color: #d7dde8; background: var(--code-bg); padding: 8px 12px; border-radius: var(--radius-sm); white-space: pre-wrap; }
.oa-dollar { color: #6b7689; margin-right: 8px; }
.oa-hl { color: #0d1117; background: #7ee787; border-radius: 4px; padding: 0 3px; }
svg { display: block; width: 100%; height: auto; margin: 10px 0 2px; }
.oa-quti { fill: var(--bg); stroke: var(--border-strong); stroke-width: 1.5; }
.oa-jarayon { stroke: var(--accent); }
.oa-fayl { fill: var(--success-soft); stroke: var(--success); }
.oa-nom { font: 14px var(--font-mono); fill: var(--text); }
.oa-meta { font: 12px var(--font-sans); fill: var(--text-subtle); }
.oa-fd { font: 700 14px var(--font-mono); }
.oa-yol { fill: none; stroke-width: 2.5; transition: d .6s ease; }
.oa-0 { stroke: var(--text-muted); }
.oa-1 { stroke: #16a34a; }
.oa-2 { stroke: #dc2626; }
.oa-0t { fill: var(--text-muted); }
.oa-1t { fill: #16a34a; color: #16a34a; }
.oa-2t { fill: #dc2626; color: #dc2626; }
.oa-el { transition: opacity .45s ease; }
.is-off { opacity: 0; }
.oa-izoh { margin: 6px 0 6px; min-height: 3em; font-size: 15px; line-height: 1.55; }
.oa-izoh code { font: 13px var(--font-mono); padding: 1px 4px; border-radius: 4px; background: var(--bg-sunken); }
.oa-legend { display: flex; gap: 18px; margin-bottom: 10px; font: 12.5px var(--font-mono); }
.oa-boshqaruv { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.oa-boshqaruv > button { padding: 6px 12px; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); background: var(--bg-elevated); color: var(--text); font: inherit; font-size: 13px; cursor: pointer; }
.oa-boshqaruv > button:disabled { opacity: .4; cursor: default; }
.oa-boshqaruv > button:not(:disabled):hover { border-color: var(--accent); color: var(--accent-text); }
.oa-nuqtalar { display: flex; gap: 6px; }
.oa-nuqtalar button { width: 10px; height: 10px; padding: 0; border-radius: 50%; border: 0; background: var(--border-strong); cursor: pointer; }
.oa-nuqtalar button.on { background: var(--accent); }
</style>
