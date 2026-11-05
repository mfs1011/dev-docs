<script setup>
// 07-bob: rwx bitlari ↔ sonli yozuv. Bitni bosib yoqing/o'chiring — `ls -l` ko'rinishi, `chmod` soni va
// har toifa nima qila olishi darhol o'zgaradi. Fayl va papka uchun ma'nolar Debian Reference 1.2.3 dan.
import { computed, ref } from 'vue'

const TOIFALAR = [
  { k: 'u', nom: 'Egasi (u)' },
  { k: 'g', nom: 'Guruh (g)' },
  { k: 'o', nom: 'Boshqalar (o)' },
]
const BITLAR = [
  { k: 'r', qiymat: 4 },
  { k: 'w', qiymat: 2 },
  { k: 'x', qiymat: 1 },
]
const MANO = {
  fayl: { r: 'o‘qiydi', w: 'o‘zgartiradi', x: 'ishga tushiradi' },
  papka: { r: 'nomlarni ko‘radi', w: 'fayl qo‘shadi va o‘chiradi', x: 'ichiga kiradi' },
}
const TAYYOR = ['644', '640', '600', '755', '750', '700']

const tur = ref('fayl')
// [u, g, o] — har biri r/w/x bayroqlari
const holat = ref(sondan('640'))

function sondan(son) {
  return [...son].map((r) => ({ r: (r & 4) > 0, w: (r & 2) > 0, x: (r & 1) > 0 }))
}
const raqam = (t) => BITLAR.reduce((s, b) => s + (t[b.k] ? b.qiymat : 0), 0)
const son = computed(() => holat.value.map(raqam).join(''))
const belgi = computed(() => (tur.value === 'papka' ? 'd' : '-') + holat.value.map((t) => BITLAR.map((b) => (t[b.k] ? b.k : '-')).join('')).join(''))
const tavsif = (t) => {
  // papkada x siz w ishlamaydi: ichiga kira olmasa, fayl ham qo'sha olmaydi (trenajorda sinalgan: chmod 772 → Permission denied)
  if (tur.value === 'papka' && t.w && !t.x) {
    const bor = t.r ? [MANO.papka.r] : []
    return [...bor, '(w bor, lekin x siz fayl qo‘sha olmaydi)'].join(', ')
  }
  const bor = BITLAR.filter((b) => t[b.k]).map((b) => MANO[tur.value][b.k])
  return bor.length ? bor.join(', ') : 'hech narsa qila olmaydi'
}
const qism = (t) => BITLAR.map((b) => (t[b.k] ? b.qiymat : 0)).join('+')
</script>

<template>
  <div class="ruxsat-anim">
    <div class="ra-yuqori">
      <div class="ra-tur" role="group" aria-label="Turi">
        <button v-for="t in ['fayl', 'papka']" :key="t" type="button" :class="{ on: tur === t }" @click="tur = t">{{ t }}</button>
      </div>
      <div class="ra-tayyor">
        <span>tayyor:</span>
        <button v-for="t in TAYYOR" :key="t" type="button" :class="{ on: son === t }" @click="holat = sondan(t)">{{ t }}</button>
      </div>
    </div>

    <div class="ra-jadval">
      <div v-for="(t, i) in holat" :key="i" class="ra-qator">
        <span class="ra-toifa">{{ TOIFALAR[i].nom }}</span>
        <span class="ra-bitlar">
          <button
            v-for="b in BITLAR"
            :key="b.k"
            type="button"
            class="ra-bit"
            :class="{ on: t[b.k] }"
            :aria-pressed="t[b.k]"
            :aria-label="`${TOIFALAR[i].nom}: ${b.k}`"
            @click="t[b.k] = !t[b.k]"
          >
            <b>{{ t[b.k] ? b.k : '-' }}</b><small>{{ b.qiymat }}</small>
          </button>
        </span>
        <span class="ra-hisob">{{ qism(t) }} = <b>{{ raqam(t) }}</b></span>
        <span class="ra-mano">{{ tavsif(t) }}</span>
      </div>
    </div>

    <div class="ra-natija">
      <div><span class="ra-izoh">ls -l</span><code>{{ belgi }}</code></div>
      <div><span class="ra-izoh">chmod</span><code>chmod {{ son }} {{ tur === 'papka' ? 'papka' : 'fayl' }}</code></div>
    </div>
    <p class="ra-maslahat">Bitni bosing: har uch harf bir raqamga aylanadi — <code>r=4</code>, <code>w=2</code>, <code>x=1</code> qo‘shiladi.</p>
  </div>
</template>

<style scoped>
.ruxsat-anim { margin: 20px 0; padding: 14px 16px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-elevated); }
.ra-yuqori { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
.ra-tur, .ra-tayyor { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.ra-tayyor span { color: var(--text-subtle); font-size: 13px; }
.ra-yuqori button { padding: 4px 10px; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); background: var(--bg); color: var(--text); font: 13px var(--font-mono); cursor: pointer; }
.ra-yuqori button.on { border-color: var(--accent); background: var(--accent); color: var(--bg-elevated); }
.ra-jadval { display: grid; gap: 8px; }
.ra-qator { display: grid; grid-template-columns: 120px auto 96px 1fr; align-items: center; gap: 12px; }
.ra-toifa { font-size: 14px; font-weight: 600; }
.ra-bitlar { display: flex; gap: 4px; }
.ra-bit { width: 40px; height: 44px; display: grid; place-items: center; gap: 0; padding: 2px 0; border: 1.5px solid var(--border-strong); border-radius: 8px; background: var(--bg); color: var(--text-subtle); cursor: pointer; transition: background .25s, border-color .25s, color .25s, transform .15s; }
.ra-bit b { font: 700 17px var(--font-mono); line-height: 1; }
.ra-bit small { font: 11px var(--font-mono); opacity: .7; }
.ra-bit.on { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 14%, var(--bg)); color: var(--accent-text); }
.ra-bit:active { transform: scale(.94); }
.ra-hisob { font: 13px var(--font-mono); color: var(--text-muted); }
.ra-hisob b { color: var(--accent-text); font-size: 16px; }
.ra-mano { font-size: 14px; color: var(--text-muted); }
.ra-natija { display: flex; flex-wrap: wrap; gap: 10px 24px; margin-top: 14px; padding: 10px 12px; border-radius: var(--radius-sm); background: var(--code-bg); }
.ra-natija div { display: flex; align-items: baseline; gap: 10px; }
.ra-natija code { font: 16px var(--font-mono); color: #7ee787; background: none; border: 0; padding: 0; }
.ra-izoh { font: 11px var(--font-mono); color: #6b7689; text-transform: uppercase; letter-spacing: .08em; }
.ra-maslahat { margin: 10px 0 0; font-size: 13.5px; color: var(--text-muted); }
.ra-maslahat code { font: 12.5px var(--font-mono); padding: 1px 4px; border-radius: 4px; background: var(--bg-sunken); }
@media (max-width: 640px) {
  .ra-qator { grid-template-columns: auto auto; row-gap: 4px; }
  .ra-toifa { grid-column: 1 / -1; }
  .ra-mano { grid-column: 1 / -1; font-size: 13px; }
}
</style>
