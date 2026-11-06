<script setup>
// 16-bob: vim rejimlari. Yangi boshlovchi uchun eng chalkash joy — NORMAL rejimda harflar matn emas, buyruq.
// Tugmalar Debian Reference 1.4.8 dagi jadvaldan (i, ESC, :w, :q, :q!).
import { computed, ref } from 'vue'

const QADAMLAR = [
  { tugma: '$ vi salom.txt', rejim: 'NORMAL', matn: '', pastki: '"salom.txt" [New]',
    izoh: 'vim NORMAL rejimida ochiladi. Bu rejimda bosilgan harflar matnga yozilmaydi — ular BUYRUQ. Yangi boshlovchilar shu yerda adashadi.' },
  { tugma: 'i', rejim: 'INSERT', matn: '', pastki: '-- INSERT --',
    izoh: '`i` — INSERT (yozish) rejimiga o‘tish. Pastda `-- INSERT --` yozuvi chiqdi.' },
  { tugma: 'Salom, server!', rejim: 'INSERT', matn: 'Salom, server!', pastki: '-- INSERT --',
    izoh: 'Endi yozilgan matn faylga tushadi, oddiy muharrirdagi kabi.' },
  { tugma: 'Esc', rejim: 'NORMAL', matn: 'Salom, server!', pastki: '',
    izoh: '`Esc` — NORMAL rejimga qaytish. Adashib qolsangiz, avval doim `Esc` ni bosing.' },
  { tugma: ':wq', rejim: 'BUYRUQ', matn: 'Salom, server!', pastki: ':wq',
    izoh: '`:` buyruq qatorini ochadi. `w` — yozish (saqlash), `q` — chiqish. `:q!` — saqlamasdan chiqish.' },
  { tugma: 'Enter', rejim: 'qobiq', matn: '', pastki: '', qobiq: ['$ cat salom.txt', 'Salom, server!'],
    izoh: 'Fayl saqlandi, vim yopildi va qobiqqa (shell) qaytdingiz.' },
]

const i = ref(0)
const q = computed(() => QADAMLAR[i.value])
const qismlar = (s) => s.split('`').map((t, k) => ({ t, code: k % 2 === 1 }))
</script>

<template>
  <div class="vim-anim">
    <div class="va-tugma">bosildi: <kbd>{{ q.tugma }}</kbd><span class="va-rejim" :class="q.rejim">{{ q.rejim }}</span></div>
    <div class="va-ekran">
      <template v-if="!q.qobiq">
        <div class="va-qator">{{ q.matn }}<span v-if="q.rejim === 'INSERT'" class="va-kursor" /></div>
        <div v-for="n in 4" :key="n" class="va-qator va-tilda">~</div>
        <div class="va-pastki">{{ q.pastki }}<span v-if="q.rejim === 'BUYRUQ'" class="va-kursor" /></div>
      </template>
      <template v-else>
        <div v-for="(s, k) in q.qobiq" :key="k" class="va-qator">{{ s }}</div>
      </template>
    </div>
    <p class="va-izoh"><template v-for="(p, k) in qismlar(q.izoh)" :key="k"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template></p>
    <div class="va-boshqaruv">
      <button type="button" :disabled="i === 0" @click="i--">← Oldingi</button>
      <span class="va-nuqtalar"><button v-for="(_, k) in QADAMLAR" :key="k" type="button" :class="{ on: k === i }" :aria-label="`${k + 1}-qadam`" @click="i = k" /></span>
      <button type="button" :disabled="i === QADAMLAR.length - 1" @click="i++">Keyingi →</button>
    </div>
  </div>
</template>

<style scoped>
.vim-anim { margin: 20px 0; padding: 14px 16px 12px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-elevated); }
.va-tugma { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; font-size: 13.5px; color: var(--text-muted); }
.va-tugma kbd { font: 14px var(--font-mono); padding: 2px 8px; border: 1px solid var(--border-strong); border-bottom-width: 3px; border-radius: 6px; background: var(--bg); color: var(--text); }
.va-rejim { margin-left: auto; padding: 2px 10px; border-radius: 999px; font: 700 12px var(--font-mono); background: var(--bg-sunken); color: var(--text-muted); }
.va-rejim.INSERT { background: #16a34a; color: #fff; }
.va-rejim.NORMAL { background: var(--accent); color: var(--bg-elevated); }
.va-rejim.BUYRUQ { background: #e3b341; color: #1b1b1b; }
.va-ekran { min-height: 150px; padding: 10px 12px; border-radius: var(--radius-sm); background: var(--code-bg); color: #d7dde8; font: 14.5px/1.5 var(--font-mono); }
.va-qator { min-height: 1.5em; white-space: pre; }
.va-tilda { color: #4a6b9a; }
.va-pastki { margin-top: 4px; min-height: 1.5em; color: #e3b341; font-weight: 600; }
.va-kursor { display: inline-block; width: .6em; height: 1.1em; margin-left: 1px; vertical-align: -2px; background: #7ee787; animation: va-blink 1s steps(1) infinite; }
@keyframes va-blink { 50% { opacity: 0; } }
.va-izoh { margin: 10px 0 12px; min-height: 3em; font-size: 15px; line-height: 1.55; }
.va-izoh code { font: 13px var(--font-mono); padding: 1px 4px; border-radius: 4px; background: var(--bg-sunken); }
.va-boshqaruv { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.va-boshqaruv > button { padding: 6px 12px; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); background: var(--bg-elevated); color: var(--text); font: inherit; font-size: 13px; cursor: pointer; }
.va-boshqaruv > button:disabled { opacity: .4; cursor: default; }
.va-nuqtalar { display: flex; gap: 6px; }
.va-nuqtalar button { width: 10px; height: 10px; padding: 0; border-radius: 50%; border: 0; background: var(--border-strong); cursor: pointer; }
.va-nuqtalar button.on { background: var(--accent); }
</style>
