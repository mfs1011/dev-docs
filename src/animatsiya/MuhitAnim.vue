<script setup>
// 13-bob: qobiq (shell) o'zgaruvchisi va muhit (environment). Bola jarayon faqat export qilinganlarning NUSXASINI oladi,
// uni o'zgartirsa ota jarayonga ta'sir qilmaydi. Chiqishlar trenajordan.
import { computed, ref } from 'vue'

const QADAMLAR = [
  {
    cmd: 'SALOM="Assalomu alaykum"',
    ota: [['SALOM', 'Assalomu alaykum', false]], bola: null, chiqish: '',
    izoh: 'O‘zgaruvchi faqat shu qobiqda (shell) paydo bo‘ldi. U hali muhitda (environment) emas — qobiqning (shell) shaxsiy qutisi.',
  },
  {
    cmd: `bash -c 'echo "[$SALOM]"'`,
    ota: [['SALOM', 'Assalomu alaykum', false]], bola: [], chiqish: '[]',
    izoh: 'Yangi jarayon (bola) faqat MUHITNING nusxasini oladi. SALOM export qilinmagan — bolaga yetib bormadi, `[]` bo‘sh.',
  },
  {
    cmd: 'export SALOM',
    ota: [['SALOM', 'Assalomu alaykum', true]], bola: null, chiqish: '',
    izoh: '`export` o‘zgaruvchini muhitga qo‘shdi: endi u har bir bola jarayonga nusxalanadi.',
  },
  {
    cmd: `bash -c 'echo "[$SALOM]"'`,
    ota: [['SALOM', 'Assalomu alaykum', true]], bola: [['SALOM', 'Assalomu alaykum']], chiqish: '[Assalomu alaykum]',
    izoh: 'Bola nusxani oldi va qiymatni ko‘rdi.',
  },
  {
    cmd: `bash -c 'SALOM="Xayr"; echo "bolada: $SALOM"'; echo "otada: $SALOM"`,
    ota: [['SALOM', 'Assalomu alaykum', true]], bola: [['SALOM', 'Xayr']], chiqish: 'bolada: Xayr\notada: Assalomu alaykum',
    izoh: 'Bola o‘z NUSXASINI o‘zgartirdi — ota o‘zgarmadi. Muhit faqat pastga (otadan bolaga) oqadi, hech qachon yuqoriga emas.',
  },
]

const i = ref(0)
const q = computed(() => QADAMLAR[i.value])
const qismlar = (s) => s.split('`').map((t, k) => ({ t, code: k % 2 === 1 }))
</script>

<template>
  <div class="muhit-anim">
    <div class="ma-cmd"><span>$</span> {{ q.cmd }}</div>

    <div class="ma-sahna">
      <div class="ma-jarayon">
        <div class="ma-sar">ota: bash (siz yozayotgan qobiq (shell))</div>
        <div class="ma-qism">
          <small>faqat shu qobiqda (shell)</small>
          <template v-for="v in q.ota" :key="'o' + v[0]">
            <code v-if="!v[2]" class="ma-ozg">{{ v[0] }}="{{ v[1] }}"</code>
          </template>
        </div>
        <div class="ma-qism ma-env">
          <small>muhit (export) → bolaga nusxa</small>
          <code class="ma-ozg ma-xira">HOME=/root</code>
          <code class="ma-ozg ma-xira">PATH=…</code>
          <template v-for="v in q.ota" :key="'e' + v[0]">
            <code v-if="v[2]" class="ma-ozg">{{ v[0] }}="{{ v[1] }}"</code>
          </template>
        </div>
      </div>

      <div class="ma-oq" :class="{ 'is-off': !q.bola }">→<small>nusxa</small></div>

      <div class="ma-jarayon ma-bola" :class="{ 'is-off': !q.bola }">
        <div class="ma-sar">bola: bash -c '…'</div>
        <div class="ma-qism ma-env">
          <small>olgan muhiti</small>
          <code class="ma-ozg ma-xira">HOME=/root</code>
          <code class="ma-ozg ma-xira">PATH=…</code>
          <code v-for="v in q.bola ?? []" :key="v[0]" class="ma-ozg">{{ v[0] }}="{{ v[1] }}"</code>
          <code v-if="q.bola && !q.bola.length" class="ma-ozg ma-yoq">SALOM — yo‘q</code>
        </div>
      </div>
    </div>

    <pre v-if="q.chiqish" class="ma-chiqish">{{ q.chiqish }}</pre>
    <p class="ma-izoh"><template v-for="(p, k) in qismlar(q.izoh)" :key="k"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template></p>

    <div class="ma-boshqaruv">
      <button type="button" :disabled="i === 0" @click="i--">← Oldingi</button>
      <span class="ma-nuqtalar">
        <button v-for="(_, k) in QADAMLAR" :key="k" type="button" :class="{ on: k === i }" :aria-label="`${k + 1}-qadam`" @click="i = k" />
      </span>
      <button type="button" :disabled="i === QADAMLAR.length - 1" @click="i++">Keyingi →</button>
    </div>
  </div>
</template>

<style scoped>
.muhit-anim { margin: 20px 0; padding: 14px 16px 12px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-elevated); }
.ma-cmd { font: 14px var(--font-mono); color: #7ee787; background: var(--code-bg); padding: 8px 12px; border-radius: var(--radius-sm); white-space: pre-wrap; word-break: break-all; }
.ma-cmd span { color: #6b7689; margin-right: 6px; }
.ma-sahna { display: grid; grid-template-columns: 1fr auto 1fr; align-items: stretch; gap: 12px; margin: 14px 0 10px; }
.ma-jarayon { display: grid; gap: 8px; align-content: start; padding: 10px 12px; border: 1.5px solid var(--accent); border-radius: 10px; background: var(--bg); transition: opacity .45s; }
.ma-bola { border-style: dashed; }
.ma-sar { font: 600 13px var(--font-mono); }
.ma-qism { display: grid; gap: 4px; justify-items: start; padding: 8px; border-radius: 8px; background: var(--bg-sunken); min-height: 44px; }
.ma-env { background: var(--success-soft); }
.ma-qism small { font-size: 11.5px; color: var(--text-subtle); }
.ma-ozg { font: 13px var(--font-mono); padding: 2px 6px; border-radius: 5px; background: var(--bg-elevated); border: 1px solid var(--border); animation: ma-kir .45s ease; }
.ma-xira { opacity: .55; }
.ma-yoq { color: var(--danger); border-color: var(--danger); }
.ma-oq { display: grid; place-items: center; align-content: center; font: 700 22px var(--font-mono); color: var(--accent-text); transition: opacity .45s; }
.ma-oq small { font: 11px var(--font-sans); color: var(--text-subtle); }
.is-off { opacity: 0; }
@keyframes ma-kir { from { opacity: 0; transform: translateY(-4px); } }
.ma-chiqish { margin: 0 0 8px; padding: 8px 12px; border-radius: var(--radius-sm); background: var(--code-bg); color: #d7dde8; font: 13.5px var(--font-mono); }
.ma-izoh { margin: 6px 0 12px; min-height: 3em; font-size: 15px; line-height: 1.55; }
.ma-izoh code { font: 13px var(--font-mono); padding: 1px 4px; border-radius: 4px; background: var(--bg-sunken); }
.ma-boshqaruv { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.ma-boshqaruv > button { padding: 6px 12px; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); background: var(--bg-elevated); color: var(--text); font: inherit; font-size: 13px; cursor: pointer; }
.ma-boshqaruv > button:disabled { opacity: .4; cursor: default; }
.ma-boshqaruv > button:not(:disabled):hover { border-color: var(--accent); color: var(--accent-text); }
.ma-nuqtalar { display: flex; gap: 6px; }
.ma-nuqtalar button { width: 10px; height: 10px; padding: 0; border-radius: 50%; border: 0; background: var(--border-strong); cursor: pointer; }
.ma-nuqtalar button.on { background: var(--accent); }
@media (max-width: 640px) {
  .ma-sahna { grid-template-columns: 1fr; }
  .ma-oq { transform: rotate(90deg); }
}
</style>
