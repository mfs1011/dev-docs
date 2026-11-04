<script setup>
// «Nima bo'ldi?» — oxirgi hodisa qadamma-qadam, oddiy tilda (hikoya.js). Qadamlar ketma-ket paydo bo'ladi;
// oldingi hodisalarga qaytish, qayta ko'rsatish va sekin rejim bor.
import { computed, ref, watch } from 'vue'
import { hikoya } from './hikoya.js'

const props = defineProps({ toplamlar: Array, fw: String, graf: Object, nodes: Array })

const tanlangan = ref(null) // null — doim oxirgisi
const sekin = ref(false)
const takror = ref(0)
const joriy = computed(() => {
  const list = props.toplamlar
  if (!list.length) return null
  return list.find((t) => t.b === tanlangan.value) ?? list.at(-1)
})
const qadamlar = computed(() => hikoya(joriy.value, props))
const indeks = computed(() => props.toplamlar.indexOf(joriy.value))
watch(() => props.toplamlar.at(-1)?.b, () => { tanlangan.value = null })

function bor(d) {
  const t = props.toplamlar[indeks.value + d]
  if (t) tanlangan.value = t === props.toplamlar.at(-1) ? null : t.b
}
const parts = (s) => (s ?? '').split('`').map((t, i) => ({ t, code: i % 2 === 1 }))
const dt = computed(() => (sekin.value ? 1.1 : 0.32))
</script>

<template>
  <div class="hikoya">
    <div class="bosh">
      <button type="button" class="nav" :disabled="indeks <= 0" title="Oldingi hodisa" @click="bor(-1)">‹</button>
      <span class="raqam">{{ joriy ? (joriy.b === 1 ? 'Boshlanish' : `${indeks}-hodisa`) : '' }}<small v-if="tanlangan != null"> (eski)</small></span>
      <button type="button" class="nav" :disabled="indeks >= toplamlar.length - 1" title="Keyingi hodisa" @click="bor(1)">›</button>
      <span class="joy" />
      <label class="sekin"><input v-model="sekin" type="checkbox" /> sekin</label>
      <button type="button" class="qayta" @click="takror++">▶ Qayta ko‘rsatish</button>
    </div>
    <ol :key="`${joriy?.b}-${takror}-${joriy?.ev.length}`" class="qadamlar">
      <li
        v-for="(q, i) in qadamlar"
        :key="i"
        :class="{ yashil: q.yashil, kulrang: q.kulrang, xulosa: q.xulosa, ogoh: q.ogoh }"
        :style="{ animationDelay: `${i * dt}s` }"
      >
        <span class="ikon" aria-hidden="true">{{ q.ikon }}</span>
        <div class="ichi">
          <p class="sar"><template v-for="(p, k) in parts(q.sarlavha)" :key="k"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template></p>
          <p v-if="q.matn" class="matn"><template v-for="(p, k) in parts(q.matn)" :key="k"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template></p>
          <div v-if="q.qutilar?.length" class="qutilar">
            <template v-for="(v, k) in q.qutilar" :key="k">
              <span v-if="k" class="strelka">→</span>
              <span class="quti" :class="{ eski: k < q.qutilar.length - 1 }">{{ v }}</span>
            </template>
          </div>
          <div v-if="q.chiplar?.length" class="chiplar"><span v-for="ch in q.chiplar" :key="ch" class="chip">{{ ch }}</span></div>
          <ul v-if="q.tanlovlar" class="tanlov">
            <li v-for="(x, k) in q.tanlovlar" :key="k">
              <code>&lt;{{ x.komp }}&gt;</code> <code class="sel">{{ x.matn }}</code>
              <span class="qiy">{{ x.old }} <span class="strelka">→</span> {{ x.new }}</span>
              <b :class="x.teng ? 'teng' : 'farq'">{{ x.teng ? '= bir xil → chizilmaydi' : '≠ o‘zgardi → chiziladi' }}</b>
            </li>
          </ul>
          <ul v-if="q.ekran" class="ekran">
            <li v-for="(e, k) in q.ekran" :key="k">
              <template v-if="e.tur === 'matn'"><s v-if="e.old != null">{{ e.old || '(bo‘sh)' }}</s><span v-if="e.old != null" class="strelka">→</span><b>{{ e.new || '(bo‘sh)' }}</b></template>
              <template v-else-if="e.tur === 'qoshildi'"><span class="yangi">+ yangi {{ e.el }}</span> {{ e.matn }}</template>
              <template v-else-if="e.tur === 'olindi'"><span class="olindi">− olib tashlandi {{ e.el }}</span> {{ e.matn }}</template>
              <template v-else>{{ e.el }} da <code>{{ e.nom }}</code>: <s>{{ e.old || '—' }}</s><span class="strelka">→</span><b>{{ e.new || '—' }}</b></template>
            </li>
          </ul>
        </div>
      </li>
    </ol>
    <p v-if="!joriy" class="kut">Ilova ishga tushmoqda…</p>
  </div>
</template>

<style scoped>
.hikoya { display: flex; flex-direction: column; min-height: 0; overflow: auto; }
.bosh { position: sticky; top: 0; z-index: 1; display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-bottom: 1px solid var(--border); background: var(--bg-elevated); font-size: 12.5px; }
.nav { width: 26px; height: 26px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-elevated); color: var(--text); font-size: 16px; line-height: 1; cursor: pointer; }
.nav:disabled { opacity: .35; cursor: default; }
.raqam { min-width: 92px; text-align: center; font-weight: 600; }
.raqam small { color: var(--warning); font-weight: 400; }
.joy { flex: 1; }
.sekin { display: flex; align-items: center; gap: 4px; color: var(--text-muted); cursor: pointer; }
.qayta { padding: 4px 10px; border: 1px solid var(--border-strong); border-radius: 6px; background: var(--bg-elevated); color: var(--text); font: inherit; cursor: pointer; }
.qayta:hover { border-color: var(--accent); color: var(--accent-text); }
.qadamlar { margin: 0; padding: 12px 14px 16px; list-style: none; }
.qadamlar > li { position: relative; display: flex; gap: 12px; padding-bottom: 14px; opacity: 0; animation: chiq .45s ease-out forwards; }
.qadamlar > li:not(:last-child)::after { content: ''; position: absolute; left: 17px; top: 38px; bottom: 2px; border-left: 2px dotted var(--border-strong); }
@keyframes chiq { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.ikon { flex: none; width: 36px; height: 36px; display: grid; place-items: center; border: 1px solid var(--border); border-radius: 50%; background: var(--bg-sunken); font-size: 18px; }
.yashil .ikon { border-color: var(--success); background: var(--success-soft); }
.ogoh .ikon { border-color: var(--warning); background: var(--warning-soft); }
.kulrang { color: var(--text-muted); }
.xulosa .ikon { border-color: var(--accent); }
.xulosa .sar { color: var(--accent-text); }
.ichi { min-width: 0; padding-top: 6px; }
.sar { margin: 0; font-size: 14px; font-weight: 600; line-height: 1.4; }
.matn { margin: 3px 0 0; color: var(--text-muted); font-size: 13px; line-height: 1.5; }
code { padding: 1px 5px; border-radius: 4px; background: var(--bg-sunken); font: 600 12.5px var(--font-mono); }
.qutilar { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-top: 8px; }
.quti { min-width: 30px; padding: 4px 10px; border: 2px solid #f5a524; border-radius: 8px; background: var(--warning-soft); font: 600 13px var(--font-mono); text-align: center; }
.quti.eski { border-color: var(--border-strong); background: var(--bg-sunken); color: var(--text-subtle); text-decoration: line-through; }
.strelka { margin: 0 4px; color: var(--text-subtle); }
.chiplar { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.chip { padding: 2px 9px; border: 1px solid var(--border-strong); border-radius: 12px; background: var(--bg-elevated); font: 600 12px var(--font-mono); }
.ekran { margin: 8px 0 0; padding: 0; list-style: none; }
.ekran li { margin-top: 4px; padding: 5px 9px; border-left: 3px solid #f5a524; border-radius: 0 6px 6px 0; background: var(--warning-soft); font-size: 13px; }
.ekran s { color: var(--text-subtle); }
.yangi { color: #2f6fe0; font-weight: 600; }
.olindi { color: var(--danger); font-weight: 600; }
.tanlov { margin: 8px 0 0; padding: 0; list-style: none; }
.tanlov li { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-top: 4px; padding: 5px 9px; border-radius: 6px; background: var(--bg-sunken); font-size: 12.5px; }
.tanlov .sel { font-weight: 400; }
.tanlov .qiy { font: 12px var(--font-mono); }
.teng { color: var(--text-subtle); font-weight: 600; }
.farq { color: var(--success); font-weight: 600; }
.kut { padding: 14px; color: var(--text-subtle); font-size: 13px; }
</style>
