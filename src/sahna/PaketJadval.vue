<script setup>
// Paketlar jadvali: qatorlar paket yo'lga chiqqanda qo'shiladi. "Hammasi" — yozuvdagi barcha paketlar (ACK va h.k.
// xira). Qatorni bosish — inspektor. docs/vizualizator/paket-yoli.md 1.4
import { computed, nextTick, ref, watch } from 'vue'

const props = defineProps({
  yozuv: { type: Object, default: null },
  korsatilgan: { type: Array, default: () => [] },  // [{ n, rang, faol }]
  hammasi: { type: Boolean, default: false },
  tanlangan: { type: Number, default: null },
})
const emit = defineEmits(['tanla'])

const darsdagi = computed(() => new Map(props.korsatilgan.map((k) => [k.n, k])))
const oxirgiN = computed(() => Math.max(0, ...props.korsatilgan.map((k) => k.n)))
const qatorlar = computed(() => {
  const p = props.yozuv?.paketlar ?? []
  if (props.hammasi) return p.filter((x) => x.n <= oxirgiN.value).map((x) => ({ ...x, d: darsdagi.value.get(x.n) }))
  return props.korsatilgan.map((k) => ({ ...p.find((x) => x.n === k.n), d: k })).filter((x) => x.n)
})
const sek = (t) => `${t.toFixed(3)} s`
const hajm = (b) => (b >= 1024 ? `${(b / 1024).toFixed(1)} KB` : `${b} B`)

const quti = ref(null)
watch(() => qatorlar.value.length, async () => {
  await nextTick()
  quti.value?.scrollTo({ top: quti.value.scrollHeight, behavior: 'smooth' })
})
</script>

<template>
  <div ref="quti" class="jadval-quti">
    <table class="jadval">
      <thead>
        <tr><th>№</th><th>Vaqt</th><th>Kimdan</th><th>Kimga</th><th>Protokol</th><th class="info">Ma’lumot</th><th>Hajm</th></tr>
      </thead>
      <tbody>
        <tr v-if="!qatorlar.length"><td colspan="7" class="bosh">Hali paket yuborilmadi — ▶ Ijro yoki → Keyingi qadam.</td></tr>
        <tr v-for="p in qatorlar" :key="p.n" tabindex="0"
            :class="{ xira: !p.d, faol: p.d?.faol, tanlangan: tanlangan === p.n }"
            @click="emit('tanla', p.n)" @keydown.enter="emit('tanla', p.n)">
          <td><span :class="['rn', p.d?.rang ?? 'boshqa']">{{ p.n }}</span></td>
          <td class="mono">{{ sek(p.t) }}</td>
          <td class="mono">{{ p.src }}</td>
          <td class="mono">{{ p.dst }}</td>
          <td class="mono">{{ p.proto }}</td>
          <td class="mono info" :title="p.info">{{ p.info }}</td>
          <td class="mono">{{ hajm(p.len) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.jadval-quti { overflow: auto; height: 100%; }
.jadval { width: 100%; border-collapse: collapse; font-size: 12.5px; }
th { position: sticky; top: 0; z-index: 1; padding: 6px 10px; background: var(--bg-elevated); border-bottom: 1px solid var(--border); color: var(--text-subtle); font: 700 10.5px var(--font-sans); letter-spacing: .07em; text-transform: uppercase; text-align: left; white-space: nowrap; }
td { padding: 5px 10px; border-bottom: 1px solid var(--border); white-space: nowrap; color: var(--text); }
td.info { max-width: 460px; min-width: 200px; overflow: hidden; text-overflow: ellipsis; }
.mono { font-family: var(--font-mono); font-size: 12px; }
tbody tr { cursor: pointer; }
tbody tr:hover { background: var(--surface-hover); }
tr.faol { background: var(--accent-soft); }
tr.tanlangan { box-shadow: inset 3px 0 0 var(--accent); background: var(--accent-soft); }
tr.xira td { color: var(--text-subtle); }
.bosh { color: var(--text-subtle); font-style: italic; cursor: default; }
.rn { display: inline-grid; place-items: center; min-width: 22px; height: 22px; padding: 0 4px; border-radius: 11px; color: var(--bg); font: 700 11px var(--font-mono); box-sizing: border-box; }
.rn.sorov { background: var(--info); } .rn.javob { background: var(--success); } .rn.ulanish { background: var(--insight); }
.rn.ogoh { background: var(--warning); } .rn.xato { background: var(--danger); } .rn.boshqa { background: var(--text-subtle); }
</style>
