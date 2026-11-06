<script setup>
// 14-bob: bash bitta qatorni qanday kengaytiradi. Tartib Bash qo'llanmasidan (3.5 Shell Expansions):
// brace → tilde/o'zgaruvchi/$( )/$(( )) (chapdan o'ngga) → so'zlarga bo'lish → fayl nomlari → qo'shtirnoqni olib tashlash.
// Yakuniy natija trenajordagi `set -x` chiqishi bilan bir xil.
import { computed, ref } from 'vue'

const QADAMLAR = [
  { nom: 'Asl qator', so: ['echo', '~/{a,b}.log', '"$USER"', '$(date +%Y)', '*.log'], yangi: [],
    izoh: 'Qobiq qatorni so‘zlarga (token) bo‘ladi: probellar bo‘yicha, qo‘shtirnoq ichidagisi esa bitta so‘z.' },
  { nom: '1. Jingalak qavs (brace)', so: ['echo', '~/a.log', '~/b.log', '"$USER"', '$(date +%Y)', '*.log'], yangi: [1, 2],
    izoh: '`{a,b}` ikki so‘zga aylandi. Bu birinchi bosqich: fayl mavjudligi tekshirilmaydi, shunchaki matn yasaladi.' },
  { nom: '2. Tilde, o‘zgaruvchi, $( ), $(( ))', so: ['echo', '/root/a.log', '/root/b.log', '"root"', '2026', '*.log'], yangi: [1, 2, 3, 4],
    izoh: '`~` → uy papkasi, `$USER` → `root`, `$(date +%Y)` → buyruqning chiqishi `2026`. Bular chapdan o‘ngga, bir bosqichda bajariladi.' },
  { nom: '3. So‘zlarga bo‘lish', so: ['echo', '/root/a.log', '/root/b.log', '"root"', '2026', '*.log'], yangi: [],
    izoh: 'Qo‘shtirnoqsiz kengaytma natijasi probellar bo‘yicha qayta bo‘linadi. Bu yerda hech biri probelli emas — o‘zgarish yo‘q. `$NOM` = "mening fayl.txt" bo‘lganda esa u IKKI so‘zga bo‘linardi.' },
  { nom: '4. Fayl nomlari (glob)', so: ['echo', '/root/a.log', '/root/b.log', '"root"', '2026', 'c.log'], yangi: [5],
    izoh: '`*.log` papkadagi mos fayllar ro‘yxatiga almashtirildi: `c.log`. Mos fayl bo‘lmaganda `*.log` o‘zgarishsiz qolardi.' },
  { nom: '5. Qo‘shtirnoqlarni olib tashlash', so: ['echo', '/root/a.log', '/root/b.log', 'root', '2026', 'c.log'], yangi: [3],
    izoh: 'Oxirida asl qatordagi qo‘shtirnoqlar olib tashlanadi. `echo` 5 ta argument oladi va ularni ko‘rsatadi.' },
]

const i = ref(0)
const q = computed(() => QADAMLAR[i.value])
const sozlar = computed(() => q.value.so)
const qismlar = (s) => s.split('`').map((t, k) => ({ t, code: k % 2 === 1 }))
</script>

<template>
  <div class="kengaytma-anim">
    <ol class="ka-bosqichlar">
      <li v-for="(b, k) in QADAMLAR" :key="k" :class="{ on: k === i, otdi: k < i }" @click="i = k">{{ b.nom }}</li>
    </ol>

    <div class="ka-qator">
      <span class="ka-dollar">$</span>
      <TransitionGroup name="ka">
        <span v-for="(s, k) in sozlar" :key="i + ':' + k + s" class="ka-soz" :class="{ yangi: q.yangi.includes(k), buyruq: k === 0 }">{{ s }}</span>
      </TransitionGroup>
    </div>
    <div class="ka-soni">{{ sozlar.length - 1 }} ta argument</div>

    <pre v-if="i === QADAMLAR.length - 1" class="ka-chiqish">+ echo /root/a.log /root/b.log root 2026 c.log
/root/a.log /root/b.log root 2026 c.log</pre>

    <p class="ka-izoh"><template v-for="(p, k) in qismlar(q.izoh)" :key="k"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template></p>

    <div class="ka-boshqaruv">
      <button type="button" :disabled="i === 0" @click="i--">← Oldingi</button>
      <button type="button" :disabled="i === QADAMLAR.length - 1" @click="i++">Keyingi →</button>
    </div>
  </div>
</template>

<style scoped>
.kengaytma-anim { margin: 20px 0; padding: 14px 16px 12px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-elevated); }
.ka-bosqichlar { display: flex; flex-wrap: wrap; gap: 6px; margin: 0 0 14px; padding: 0; list-style: none; }
.ka-bosqichlar li { padding: 4px 10px; border-radius: 999px; border: 1px solid var(--border); font-size: 12.5px; color: var(--text-subtle); cursor: pointer; }
.ka-bosqichlar li.otdi { color: var(--text-muted); border-color: var(--border-strong); }
.ka-bosqichlar li.on { color: var(--bg-elevated); background: var(--accent); border-color: var(--accent); }
.ka-qator { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; min-height: 52px; padding: 10px 12px; border-radius: var(--radius-sm); background: var(--code-bg); }
.ka-dollar { color: #6b7689; font: 15px var(--font-mono); }
.ka-soz { padding: 4px 9px; border-radius: 6px; border: 1px solid #2f3b52; background: #1b2230; color: #d7dde8; font: 15px var(--font-mono); white-space: pre; transition: background .4s, border-color .4s; }
.ka-soz.buyruq { color: #7ee787; }
.ka-soz.yangi { border-color: #e3b341; background: #3a3016; color: #ffe08a; }
.ka-soni { margin: 6px 2px 0; font-size: 12.5px; color: var(--text-subtle); }
.ka-enter-active { transition: opacity .45s, transform .45s; }
.ka-enter-from { opacity: 0; transform: translateY(-6px); }
.ka-leave-active { display: none; }
.ka-chiqish { margin: 10px 0 0; padding: 8px 12px; border-radius: var(--radius-sm); background: var(--code-bg); color: #d7dde8; font: 13.5px var(--font-mono); }
.ka-izoh { margin: 10px 0 12px; min-height: 3em; font-size: 15px; line-height: 1.55; }
.ka-izoh code { font: 13px var(--font-mono); padding: 1px 4px; border-radius: 4px; background: var(--bg-sunken); }
.ka-boshqaruv { display: flex; justify-content: space-between; gap: 10px; }
.ka-boshqaruv button { padding: 6px 12px; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); background: var(--bg-elevated); color: var(--text); font: inherit; font-size: 13px; cursor: pointer; }
.ka-boshqaruv button:disabled { opacity: .4; cursor: default; }
.ka-boshqaruv button:not(:disabled):hover { border-color: var(--accent); color: var(--accent-text); }
</style>
