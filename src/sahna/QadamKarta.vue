<script setup>
// Qadam kartasi: nishon, "N / M", sarlavha, matn, callout, joriy paket, faktlar, nima o'zgardi, bashorat, bob havolasi.
// docs/vizualizator/README.md 4.2, tizim-dizayni.md 1.4
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { mini } from './matn.js'

const props = defineProps({
  dars: Object, qadam: Object, qi: Number, jami: Number,
  joriyPaket: { type: Object, default: null }, // { h, p }
  kartalar: { type: Array, default: () => [] },  // tor sahnada sahna kartalari shu yerda
})
const emit = defineEmits(['oldingi', 'keyingi', 'paket'])

const NISHON = { muammo: 'Muammo', sozlash: 'Sozlash', texnika: 'Texnika', tushuncha: 'Tushuncha', keys: 'Keys', xulosa: 'Xulosa' }
const CALLOUT = { goya: 'Asosiy g‘oya', maslahat: 'Bilib qo‘ying', ogoh: 'Ehtiyot bo‘ling' }
const keyingi = computed(() => props.dars.qadamlar[props.qi + 1])
const javob = ref(null)
watch(() => props.qi, () => { javob.value = null })
const belgi = (s) => ({ '+': 'qosh', '~': 'ozg', '−': 'ol', '-': 'ol' }[s[0]] ?? 'ozg')
</script>

<template>
  <article class="qk">
    <div class="qk-bosh">
      <span class="qk-n">QADAM {{ qi + 1 }} / {{ jami }}</span>
      <span :class="['nishon', qadam.nishon]">{{ NISHON[qadam.nishon] ?? qadam.nishon }}</span>
    </div>
    <h2 class="qk-sar">{{ qadam.sarlavha }}</h2>
    <div class="qk-matn">
      <p v-for="(m, i) in qadam.matn" :key="i" v-html="mini(m)" />
    </div>

    <button v-if="joriyPaket" :class="['pk', joriyPaket.h.rang ?? 'sorov']" @click="emit('paket', joriyPaket.h.n)">
      <span class="pk-bosh"><b>{{ joriyPaket.h.yorliq }}</b><span>{{ dars.tugunlar[joriyPaket.h.dan].nom }} → {{ dars.tugunlar[joriyPaket.h.ga].nom }}</span></span>
      <span v-for="(q, i) in joriyPaket.h.qatorlar" :key="i" class="pk-q">{{ q }}</span>
      <span v-if="joriyPaket.p" class="pk-oyoq">{{ joriyPaket.p.n }}-paket · {{ joriyPaket.p.proto }} · {{ joriyPaket.p.len }} B · baytlarini ko‘rish →</span>
    </button>

    <div v-for="(k, i) in kartalar" :key="'k' + i" class="ichki-karta">
      <span class="c-sar">{{ k.sarlavha }}</span>
      <table><tr v-for="(r, j) in k.qatorlar" :key="j" :class="{ ajrat: r[2] }"><td>{{ r[0] }}</td><td>{{ r[1] }}</td></tr></table>
      <small v-if="k.izoh">{{ k.izoh }}</small>
    </div>

    <div v-if="qadam.callout" :class="['callout', qadam.callout.tur]">
      <span class="c-sar">{{ CALLOUT[qadam.callout.tur] ?? 'Eslatma' }}</span>
      <p v-html="mini(qadam.callout.matn)" />
    </div>

    <table v-if="qadam.faktlar?.length" class="faktlar">
      <tr v-for="[k, v] in qadam.faktlar" :key="k"><th>{{ k }}</th><td v-html="mini(v)" /></tr>
    </table>

    <div v-if="qadam.ozgardi?.length" class="ozg">
      <span class="c-sar">Nima o‘zgardi</span>
      <ul><li v-for="(o, i) in qadam.ozgardi" :key="i" :class="belgi(o)"><span class="b">{{ o[0] }}</span>{{ o.slice(1).trim() }}</li></ul>
    </div>

    <div v-if="qadam.bashorat" class="bashorat">
      <span class="c-sar">Bashorat qiling</span>
      <p>{{ qadam.bashorat.savol }}</p>
      <button v-for="(v, i) in qadam.bashorat.variantlar" :key="i" class="variant"
              :class="{ togri: javob != null && i === qadam.bashorat.togri, notogri: javob === i && i !== qadam.bashorat.togri }"
              :disabled="javob != null" @click="javob = i">{{ v }}</button>
      <p v-if="javob != null" class="b-izoh">{{ javob === qadam.bashorat.togri ? '✓ To‘g‘ri.' : '✗ Unday emas.' }} {{ qadam.bashorat.izoh }}</p>
    </div>

    <p v-if="qadam.bob" class="bob">Bobda batafsil: <RouterLink :to="qadam.bob.yol">{{ qadam.bob.nom }}</RouterLink></p>

    <div class="qk-tug">
      <button class="tug" :disabled="qi === 0" @click="emit('oldingi')">← Orqaga</button>
      <button v-if="keyingi" class="tug asosiy" @click="emit('keyingi')">Keyingi: {{ keyingi.qisqa }} →</button>
    </div>
    <p class="eslat"><kbd>←</kbd> <kbd>→</kbd> qadam · <kbd>Space</kbd> ijro · <kbd>?</kbd> tugmalar</p>
  </article>
</template>

<style scoped>
.qk { display: flex; flex-direction: column; gap: 12px; }
.qk-bosh { display: flex; align-items: center; justify-content: space-between; }
.qk-n { color: var(--text-subtle); font: 700 11px var(--font-mono); letter-spacing: .08em; }
.nishon { padding: 2px 10px; border: 1px solid; border-radius: 12px; font: 700 10.5px var(--font-sans); letter-spacing: .07em; text-transform: uppercase; }
.nishon.muammo { background: var(--danger-soft); color: var(--danger); }
.nishon.sozlash { background: var(--bg-sunken); color: var(--text-muted); }
.nishon.texnika { background: var(--info-soft); color: var(--info); }
.nishon.tushuncha { background: var(--insight-soft); color: var(--insight); }
.nishon.keys { background: var(--warning-soft); color: var(--warning); }
.nishon.xulosa { background: var(--success-soft); color: var(--success); }
.qk-sar { margin: 0; font-size: 19px; line-height: 1.3; }
.qk-matn p { margin: 0 0 8px; color: var(--text); font-size: 14px; line-height: 1.6; }
.qk-matn :deep(code), .callout :deep(code), .faktlar :deep(code) { padding: 1px 5px; border-radius: 4px; background: var(--bg-sunken); font: 12.5px var(--font-mono); }
.pk { display: grid; gap: 3px; padding: 10px 12px; border: 1px solid currentColor; border-left-width: 4px; border-radius: var(--radius-sm); background: var(--bg-elevated); text-align: left; cursor: pointer; font: inherit; color: var(--info); }
.pk.javob { color: var(--success); } .pk.ulanish { color: var(--insight); } .pk.ogoh { color: var(--warning); } .pk.xato { color: var(--danger); }
.pk-bosh { display: flex; flex-wrap: wrap; gap: 8px; align-items: baseline; }
.pk-bosh b { font: 700 12px var(--font-mono); letter-spacing: .04em; }
.pk-bosh span { color: var(--text-muted); font-size: 12px; }
.pk-q { color: var(--text); font: 12.5px var(--font-mono); }
.pk-oyoq { color: var(--text-subtle); font-size: 11.5px; }
.pk:hover .pk-oyoq { color: var(--accent-text); }
.callout { padding: 10px 12px; border-radius: var(--radius-sm); background: var(--insight-soft); }
.callout.maslahat { background: var(--success-soft); } .callout.ogoh { background: var(--warning-soft); }
.callout p { margin: 4px 0 0; font-size: 13.5px; line-height: 1.55; color: var(--text); }
.c-sar { color: var(--text-subtle); font: 700 10.5px var(--font-sans); letter-spacing: .08em; text-transform: uppercase; }
.ichki-karta { padding: 10px 12px; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); }
.ichki-karta table { width: 100%; margin-top: 6px; border-collapse: collapse; font: 12px var(--font-mono); }
.ichki-karta td { padding: 2px 4px; } .ichki-karta td:last-child { text-align: right; }
.ichki-karta tr.ajrat { background: var(--success-soft); font-weight: 700; }
.ichki-karta small { display: block; margin-top: 6px; color: var(--text-subtle); font-size: 11.5px; }
.faktlar { width: 100%; border-collapse: collapse; font-size: 12.5px; }
.faktlar th { width: 40%; padding: 6px 8px 6px 0; border-top: 1px solid var(--border); color: var(--text-muted); font-weight: 600; text-align: left; vertical-align: top; }
.faktlar td { padding: 6px 0; border-top: 1px solid var(--border); font-family: var(--font-mono); font-size: 12px; }
.ozg ul { margin: 6px 0 0; padding: 0; list-style: none; display: grid; gap: 4px; font-size: 13px; }
.ozg .b { display: inline-grid; place-items: center; width: 18px; height: 18px; margin-right: 8px; border-radius: 4px; font: 700 12px var(--font-mono); }
.ozg .qosh .b { background: var(--success-soft); color: var(--success); }
.ozg .ozg .b { background: var(--warning-soft); color: var(--warning); }
.ozg .ol .b { background: var(--danger-soft); color: var(--danger); }
.bashorat { display: grid; gap: 6px; padding: 10px 12px; border: 1px dashed var(--border-strong); border-radius: var(--radius-sm); }
.bashorat p { margin: 0; font-size: 13.5px; }
.variant { padding: 7px 10px; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); background: var(--bg-elevated); color: var(--text); text-align: left; font: inherit; font-size: 13px; cursor: pointer; }
.variant:not(:disabled):hover { border-color: var(--accent); }
.variant.togri { border-color: var(--success); background: var(--success-soft); }
.variant.notogri { border-color: var(--danger); background: var(--danger-soft); }
.b-izoh { color: var(--text-muted); font-size: 13px !important; }
.bob { margin: 0; color: var(--text-muted); font-size: 13px; }
.bob a { color: var(--accent-text); }
.qk-tug { display: flex; gap: 8px; margin-top: 4px; }
.tug { padding: 8px 12px; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); background: var(--bg-elevated); color: var(--text); font: inherit; font-size: 13.5px; cursor: pointer; }
.tug.asosiy { flex: 1; border-color: var(--accent); background: var(--accent); color: var(--bg); font-weight: 600; text-align: left; }
.tug:disabled { opacity: .45; cursor: default; }
.eslat { margin: 0; color: var(--text-subtle); font-size: 11.5px; }
kbd { padding: 0 5px; border: 1px solid var(--border-strong); border-radius: 4px; font: 11px var(--font-mono); }
</style>
