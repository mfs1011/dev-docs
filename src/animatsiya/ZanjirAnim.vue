<script setup>
// 12-bob: `;`, `&&`, `||` qaysi buyruqni ishga tushiradi. Bash qo'llanmasi (Lists of Commands): && va || chapdan
// o'ngga, bir xil ustuvorlikda bajariladi — shuning uchun `A && B || C` "if-else" emas: B yiqilsa ham C ishlaydi.
import { computed, ref } from 'vue'

const SHAKLLAR = [
  { k: ';', yoz: 'A ; B', b: ['A', 'B'] },
  { k: '&&', yoz: 'A && B', b: ['A', 'B'] },
  { k: '||', yoz: 'A || B', b: ['A', 'B'] },
  { k: '&&||', yoz: 'A && B || C', b: ['A', 'B', 'C'] },
]
const shakl = ref(SHAKLLAR[3])
const ok = ref({ A: true, B: false, C: true })

// har buyruq: ishladimi va chiqish kodi; oxirgi $?
const natija = computed(() => {
  const ish = {}
  const yur = (n) => { ish[n] = true; return ok.value[n] ? 0 : 1 }
  let s
  switch (shakl.value.k) {
    case ';': yur('A'); s = yur('B'); break
    case '&&': s = yur('A'); if (s === 0) s = yur('B'); break
    case '||': s = yur('A'); if (s !== 0) s = yur('B'); break
    default:
      s = yur('A')
      if (s === 0) s = yur('B')
      if (s !== 0) s = yur('C')
  }
  return { ish, s }
})
const izoh = computed(() => {
  const { ish } = natija.value
  const k = shakl.value.k
  if (k === ';') return '`;` — har doim ketma-ket: A qanday tugashidan qat’i nazar B ham ishlaydi.'
  if (k === '&&') return ish.B ? 'A muvaffaqiyatli (0) — shuning uchun B ishladi.' : 'A yiqildi — `&&` B ni o‘tkazib yubordi.'
  if (k === '||') return ish.B ? 'A yiqildi — `||` "zaxira" B ni ishga tushirdi.' : 'A muvaffaqiyatli — B kerak bo‘lmadi.'
  if (ok.value.A && !ok.value.B) return 'Tuzoq: A ishladi, B YIQILDI — va C ham ishladi. `A && B || C` "agar A bo‘lsa B, aks holda C" emas: oldingi natija xato bo‘lsa, C har doim ishlaydi.'
  return ish.C ? 'A yiqildi — B o‘tkazildi, C ishladi.' : 'A va B muvaffaqiyatli — C o‘tkazildi.'
})
</script>

<template>
  <div class="zanjir-anim">
    <div class="za-shakllar" role="group" aria-label="Zanjir turi">
      <button v-for="s in SHAKLLAR" :key="s.k" type="button" :class="{ on: shakl.k === s.k }" @click="shakl = s">{{ s.yoz }}</button>
    </div>

    <div class="za-qator">
      <template v-for="(n, k) in shakl.b" :key="n">
        <span v-if="k" class="za-op">{{ shakl.k === '&&||' ? (k === 1 ? '&&' : '||') : shakl.k }}</span>
        <div class="za-buyruq" :class="{ ishladi: natija.ish[n], otkazildi: !natija.ish[n] }">
          <strong>{{ n }}</strong>
          <button type="button" class="za-holat" :class="ok[n] ? 'yaxshi' : 'yomon'" @click="ok[n] = !ok[n]">
            {{ ok[n] ? '✓ 0 (muvaffaqiyat)' : '✕ 1 (xato)' }}
          </button>
          <small>{{ natija.ish[n] ? 'ishladi' : 'o‘tkazib yuborildi' }}</small>
        </div>
      </template>
    </div>

    <div class="za-natija">
      <code>$ {{ shakl.yoz }}; echo $?</code>
      <code class="za-kod">{{ natija.s }}</code>
    </div>
    <p class="za-izoh"><template v-for="(p, k) in izoh.split('`')" :key="k"><code v-if="k % 2">{{ p }}</code><template v-else>{{ p }}</template></template></p>
    <p class="za-maslahat">Har buyruqning natijasini bosib almashtiring (muvaffaqiyat ↔ xato).</p>
  </div>
</template>

<style scoped>
.zanjir-anim { margin: 20px 0; padding: 14px 16px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-elevated); }
.za-shakllar { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
.za-shakllar button { padding: 5px 12px; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); background: var(--bg); color: var(--text); font: 13.5px var(--font-mono); cursor: pointer; }
.za-shakllar button.on { border-color: var(--accent); background: var(--accent); color: var(--bg-elevated); }
.za-qator { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.za-op { font: 700 18px var(--font-mono); color: var(--accent-text); }
.za-buyruq { min-width: 150px; display: grid; gap: 6px; justify-items: start; padding: 10px 12px; border: 1.5px solid var(--border-strong); border-radius: 10px; background: var(--bg); transition: opacity .35s, border-color .35s; }
.za-buyruq strong { font: 700 18px var(--font-mono); }
.za-buyruq small { font-size: 12px; color: var(--text-subtle); }
.za-buyruq.ishladi { border-color: var(--accent); }
.za-buyruq.otkazildi { opacity: .45; border-style: dashed; }
.za-holat { padding: 3px 8px; border-radius: 6px; border: 1px solid; font: 12.5px var(--font-mono); cursor: pointer; background: none; }
.za-holat.yaxshi { color: var(--success); border-color: var(--success); background: var(--success-soft); }
.za-holat.yomon { color: var(--danger); border-color: var(--danger); }
.za-natija { display: flex; justify-content: space-between; gap: 10px; margin-top: 14px; padding: 8px 12px; border-radius: var(--radius-sm); background: var(--code-bg); }
.za-natija code { font: 14px var(--font-mono); color: #d7dde8; background: none; border: 0; padding: 0; }
.za-natija .za-kod { color: #7ee787; font-weight: 700; }
.za-izoh { margin: 10px 0 4px; min-height: 2.6em; font-size: 15px; line-height: 1.55; }
.za-izoh code, .za-maslahat code { font: 13px var(--font-mono); padding: 1px 4px; border-radius: 4px; background: var(--bg-sunken); }
.za-maslahat { margin: 0; font-size: 13px; color: var(--text-subtle); }
</style>
