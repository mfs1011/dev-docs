<script setup>
// 06-bob: nom → inode → ma'lumot. Debian Reference 1.2.7 dagi misol qadamma-qadam (trenajordagi haqiqiy inode raqamlari).
import { computed, ref } from 'vue'

const QADAMLAR = [
  {
    cmd: 'echo "Asl matn" > foo',
    izoh: 'Papkada "foo" nomi paydo bo‘ldi. U 11-inode’ga ishora qiladi, inode esa diskdagi ma’lumotga. Inode’da nom yo‘q — nom papkada turadi.',
    nomlar: ['foo'], havola: { 11: 1 }, symlink: false, rmFoo: false, yangi: false,
  },
  {
    cmd: 'ln foo bar',
    izoh: 'Hard link: "bar" — xuddi o‘sha 11-inode’ga ikkinchi nom. Yangi fayl yaratilmadi, faqat havolalar soni 2 bo‘ldi.',
    nomlar: ['foo', 'bar'], havola: { 11: 2 }, symlink: false, rmFoo: false, yangi: false,
  },
  {
    cmd: 'ln -s foo baz',
    izoh: 'Symlink: "baz" — o‘z inode’i (12) bor alohida fayl. Uning ichida faqat "foo" degan NOM yozilgan. U faylga emas, nomga ishora qiladi.',
    nomlar: ['foo', 'bar', 'baz'], havola: { 11: 2 }, symlink: true, rmFoo: false, yangi: false,
  },
  {
    cmd: 'rm foo',
    izoh: '`rm` faylni emas, NOMNI o‘chirdi. 11-inode’ning havolalari 1 ga tushdi — ma’lumot "bar" orqali turibdi. "baz" esa endi yo‘q nomga ishora qilyapti: osilib qoldi.',
    nomlar: ['bar', 'baz'], havola: { 11: 1 }, symlink: true, rmFoo: true, yangi: false,
  },
  {
    cmd: 'echo "Yangi matn" > foo',
    izoh: 'Yangi "foo" — butunlay boshqa fayl (13-inode). "baz" nom bo‘yicha ishlagani uchun endi yangi faylni ko‘rsatadi, "bar" esa eski matnni saqlab turibdi.',
    nomlar: ['bar', 'baz', 'foo2'], havola: { 11: 1, 13: 1 }, symlink: true, rmFoo: true, yangi: true,
  },
]

const i = ref(0)
const q = computed(() => QADAMLAR[i.value])
const bor = (n) => q.value.nomlar.includes(n)
const qismlar = (s) => s.split('`').map((t, k) => ({ t, code: k % 2 === 1 }))

// papkadagi qatorlar (y), inode va ma'lumot qutilari joylashuvi
const QATOR = { foo: 58, bar: 110, baz: 162, foo2: 214 }
</script>

<template>
  <div class="inode-anim">
    <div class="ia-cmd"><span>$</span> {{ q.cmd }}</div>
    <svg viewBox="0 0 720 270" role="img" :aria-label="q.izoh">
      <defs>
        <marker id="ia-uch" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill="context-stroke" />
        </marker>
      </defs>

      <text x="20" y="28" class="ia-sar">papka /tmp/havola</text>
      <text x="300" y="28" class="ia-sar">inode</text>
      <text x="555" y="28" class="ia-sar">disk (ma’lumot)</text>

      <!-- papka: nom → inode raqami -->
      <g v-for="(n, k) in ['foo', 'bar', 'baz', 'foo2']" :key="n" class="ia-el" :class="{ 'is-off': !bor(n) && !(n === 'foo' && q.rmFoo), 'is-del': n === 'foo' && q.rmFoo }">
        <rect x="20" :y="QATOR[n] - 20" width="180" height="36" rx="6" class="ia-quti" />
        <text x="34" :y="QATOR[n] + 3" class="ia-nom">{{ n === 'foo2' ? 'foo' : n }}</text>
        <text x="186" :y="QATOR[n] + 3" text-anchor="end" class="ia-son">{{ { foo: 11, bar: 11, baz: 12, foo2: 13 }[n] }}</text>
      </g>

      <!-- nom → inode strelkalari -->
      <line x1="200" y1="58" x2="296" y2="80" class="ia-str" :class="{ 'is-off': !bor('foo') }" marker-end="url(#ia-uch)" />
      <line x1="200" y1="110" x2="296" y2="96" class="ia-str" :class="{ 'is-off': !bor('bar') }" marker-end="url(#ia-uch)" />
      <line x1="200" y1="162" x2="296" y2="170" class="ia-str" :class="{ 'is-off': !bor('baz') }" marker-end="url(#ia-uch)" />
      <line x1="200" y1="214" x2="296" y2="232" class="ia-str" :class="{ 'is-off': !q.yangi }" marker-end="url(#ia-uch)" />

      <!-- inode'lar -->
      <g class="ia-el">
        <rect x="298" y="52" width="170" height="70" rx="8" class="ia-quti ia-inode" />
        <text x="312" y="76" class="ia-nom">inode 11</text>
        <text x="312" y="100" class="ia-meta">havolalar: <tspan class="ia-hl">{{ q.havola[11] }}</tspan></text>
      </g>
      <g class="ia-el" :class="{ 'is-off': !q.symlink }">
        <rect x="298" y="144" width="170" height="52" rx="8" class="ia-quti ia-sym" />
        <text x="312" y="166" class="ia-nom">inode 12 · symlink</text>
        <text x="312" y="186" class="ia-meta">ichida: "foo"</text>
      </g>
      <g class="ia-el" :class="{ 'is-off': !q.yangi }">
        <rect x="298" y="208" width="170" height="46" rx="8" class="ia-quti ia-inode" />
        <text x="312" y="230" class="ia-nom">inode 13</text>
        <text x="312" y="246" class="ia-meta">havolalar: 1</text>
      </g>

      <!-- inode → ma'lumot -->
      <line x1="468" y1="87" x2="551" y2="87" class="ia-str" marker-end="url(#ia-uch)" />
      <line x1="468" y1="231" x2="551" y2="231" class="ia-str" :class="{ 'is-off': !q.yangi }" marker-end="url(#ia-uch)" />
      <g class="ia-el">
        <rect x="553" y="68" width="150" height="38" rx="6" class="ia-quti ia-data" />
        <text x="566" y="92" class="ia-nom">"Asl matn"</text>
      </g>
      <g class="ia-el" :class="{ 'is-off': !q.yangi }">
        <rect x="553" y="212" width="150" height="38" rx="6" class="ia-quti ia-data" />
        <text x="566" y="236" class="ia-nom">"Yangi matn"</text>
      </g>

      <!-- symlink nom bo'yicha: eski foo'ga, o'chgach — hech qayerga, keyin yangi foo'ga -->
      <path d="M298 170 C 250 150, 240 80, 202 62" class="ia-str ia-nomga" :class="{ 'is-off': !q.symlink || q.rmFoo }" marker-end="url(#ia-uch)" />
      <path d="M298 182 C 255 200, 245 205, 202 212" class="ia-str ia-nomga" :class="{ 'is-off': !q.yangi }" marker-end="url(#ia-uch)" />
      <g class="ia-el ia-osilgan" :class="{ 'is-off': !(q.rmFoo && !q.yangi) }">
        <path d="M298 166 C 266 140, 258 96, 250 72" class="ia-str" />
        <text x="208" y="62" class="ia-xato">✕ foo yo‘q</text>
      </g>
    </svg>

    <p class="ia-izoh"><template v-for="(p, k) in qismlar(q.izoh)" :key="k"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template></p>

    <div class="ia-boshqaruv">
      <button type="button" :disabled="i === 0" @click="i--">← Oldingi</button>
      <span class="ia-nuqtalar">
        <button v-for="(_, k) in QADAMLAR" :key="k" type="button" :class="{ on: k === i }" :aria-label="`${k + 1}-qadam`" @click="i = k" />
      </span>
      <button type="button" :disabled="i === QADAMLAR.length - 1" @click="i++">Keyingi →</button>
    </div>
  </div>
</template>

<style scoped>
.inode-anim { margin: 20px 0; padding: 14px 16px 12px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-elevated); }
.ia-cmd { font: 14px var(--font-mono); color: #7ee787; background: var(--code-bg); padding: 8px 12px; border-radius: var(--radius-sm); }
.ia-cmd span { color: #6b7689; margin-right: 6px; }
svg { display: block; width: 100%; height: auto; margin: 10px 0 4px; }
.ia-sar { font: 600 11px var(--font-sans); letter-spacing: .08em; text-transform: uppercase; fill: var(--text-subtle); }
.ia-quti { fill: var(--bg); stroke: var(--border-strong); stroke-width: 1.5; }
.ia-inode { stroke: var(--accent); }
.ia-sym { stroke: var(--accent); stroke-dasharray: 5 4; }
.ia-data { fill: var(--success-soft); stroke: var(--success); }
.ia-nom { font: 14px var(--font-mono); fill: var(--text); }
.ia-son, .ia-meta { font: 12.5px var(--font-mono); fill: var(--text-muted); }
.ia-hl { fill: var(--accent-text); font-weight: 700; }
.ia-str { fill: none; stroke: var(--text-muted); stroke-width: 1.6; }
.ia-nomga { stroke: var(--accent); stroke-dasharray: 5 4; }
.ia-osilgan .ia-str { stroke: var(--danger); stroke-dasharray: 4 4; }
.ia-xato { font: 600 12px var(--font-sans); fill: var(--danger); }
.ia-el, .ia-str { transition: opacity .45s ease; }
.is-off { opacity: 0; }
.is-del { opacity: .35; }
.is-del .ia-nom { text-decoration: line-through; }
.is-del .ia-quti { stroke: var(--danger); stroke-dasharray: 4 4; }
.ia-izoh { margin: 6px 0 12px; min-height: 3em; font-size: 15px; line-height: 1.55; }
.ia-izoh code { font: 13px var(--font-mono); padding: 1px 4px; border-radius: 4px; background: var(--bg-sunken); }
.ia-boshqaruv { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.ia-boshqaruv > button { padding: 6px 12px; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); background: var(--bg-elevated); color: var(--text); font: inherit; font-size: 13px; cursor: pointer; }
.ia-boshqaruv > button:disabled { opacity: .4; cursor: default; }
.ia-boshqaruv > button:not(:disabled):hover { border-color: var(--accent); color: var(--accent-text); }
.ia-nuqtalar { display: flex; gap: 6px; }
.ia-nuqtalar button { width: 10px; height: 10px; padding: 0; border-radius: 50%; border: 0; background: var(--border-strong); cursor: pointer; }
.ia-nuqtalar button.on { background: var(--accent); }
</style>
