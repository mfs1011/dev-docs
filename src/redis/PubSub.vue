<script setup>
// Pub/Sub: sahifadan haqiqiy obunachi ulanishlar (SUBSCRIBE/PSUBSCRIBE) yaratiladi; PUBLISH panel ulanishidan.
// Xabar kelganda (obunachi uni haqiqatan oldi) kartochka yonadi.
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'

const props = defineProps({
  holat: { type: Object, required: true },
  kanal: { type: Object, required: true },
})
const yangi = reactive({ nom: '', kanallar: 'yangiliklar' })
const pub = reactive({ kanal: 'yangiliklar', xabar: 'Yangi maqola chiqdi' })
const natija = ref(null)
const yonish = reactive({})
const oxirgi = reactive({})

async function bajar(f, matn) {
  natija.value = null
  try { const j = await f(); natija.value = { ok: true, matn: typeof matn === 'function' ? matn(j) : matn } } catch (e) { natija.value = { ok: false, matn: e.message } }
}
function obunaQosh() {
  const qism = yangi.kanallar.split(/[\s,]+/).filter(Boolean)
  const kanallar = qism.filter((x) => !/[*?[]/.test(x)), naqshlar = qism.filter((x) => /[*?[]/.test(x))
  return bajar(() => props.kanal.buyruq('obuna', { nom: yangi.nom, kanallar, naqshlar }), (j) => `“${j.obunachi}” obuna bo‘ldi: ${qism.join(', ')}`)
}
const ochir = (nom) => bajar(() => props.kanal.buyruq('obuna.stop', { nom }), `“${nom}” obunani bekor qildi`)
const nashr = () => bajar(() => props.kanal.redis(`PUBLISH ${pub.kanal} ${JSON.stringify(pub.xabar)}`),
  (n) => `PUBLISH → ${n} — xabarni ${n.match(/\d+/)?.[0] ?? 0} ta obunachi oldi${n.includes(' 0') ? ' (hech kim tinglamayapti — xabar yo‘qoldi, saqlanmaydi)' : ''}`)

function hodisa(x) {
  if (x.t !== 'pubsub') return
  yonish[x.obunachi] = Date.now()
  oxirgi[x.obunachi] = `${x.kanal}: ${x.xabar}`
  setTimeout(() => { if (Date.now() - yonish[x.obunachi] >= 1100) delete yonish[x.obunachi] }, 1200)
}
let bekor
onMounted(() => { bekor = props.kanal.tingla(hodisa) })
onBeforeUnmount(() => bekor?.())
</script>

<template>
    <div class="pubsub">
        <h4>Pub/Sub</h4>
        <div class="obunachilar">
            <p v-if="!holat.obunachilar.length" class="bosh">Obunachi yo‘q. PUBLISH qilingan xabar hech kimga yetmaydi — Redis Pub/Sub xabarni saqlamaydi.</p>
            <div v-for="o in holat.obunachilar" :key="o.nom" class="o" :class="{ yondi: yonish[o.nom] }">
                <div class="o-bosh"><b>{{ o.nom }}</b><button type="button" class="x" title="UNSUBSCRIBE" @click="ochir(o.nom)">✕</button></div>
                <small>{{ [...o.kanallar, ...o.naqshlar].join(', ') }} · {{ o.olindi }} ta oldi</small>
                <p v-if="oxirgi[o.nom]" class="oxirgi">✉ {{ oxirgi[o.nom] }}</p>
            </div>
        </div>
        <div class="forma">
            <input v-model="yangi.nom" placeholder="obunachi nomi" spellcheck="false">
            <input v-model="yangi.kanallar" placeholder="kanal(lar) yoki naqsh: yangilik.*" spellcheck="false">
            <button type="button" class="t" @click="obunaQosh">+ Obunachi</button>
        </div>
        <div class="forma">
            <input v-model="pub.kanal" placeholder="kanal" spellcheck="false">
            <input v-model="pub.xabar" placeholder="xabar" spellcheck="false">
            <button type="button" class="t asosiy" @click="nashr">PUBLISH</button>
        </div>
        <p v-if="natija" class="natija" :class="{ xato: !natija.ok }">{{ natija.matn }}</p>
    </div>
</template>

<style scoped>
h4 { margin: 0 0 8px; font: 600 11px var(--font-mono); letter-spacing: .12em; text-transform: uppercase; color: var(--text-subtle); }
.bosh { margin: 0; font-size: 12.5px; color: var(--text-subtle); }
.obunachilar { display: grid; gap: 8px; margin-bottom: 10px; }
.o { padding: 8px 10px; border: 1px solid var(--border); border-left: 4px solid #0d9488; border-radius: 10px; transition: box-shadow .25s; }
.o.yondi { box-shadow: 0 0 0 4px color-mix(in srgb, #0d9488 25%, transparent); }
.o-bosh { display: flex; justify-content: space-between; align-items: center; }
.o b { font: 600 13px var(--font-mono); }
.o small { font: 11px var(--font-mono); color: var(--text-subtle); }
.oxirgi { margin: 3px 0 0; font: 11.5px var(--font-mono); color: #0d9488; overflow-wrap: anywhere; }
.x { border: 0; background: none; color: var(--text-subtle); cursor: pointer; }
.forma { display: grid; grid-template-columns: 1fr 1.4fr auto; gap: 6px; margin-top: 6px; }
input { min-width: 0; padding: 6px 9px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-sunken); color: var(--text); font: 12.5px var(--font-mono); }
.t { padding: 6px 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-elevated); color: var(--text); font: 12px var(--font-mono); cursor: pointer; white-space: nowrap; }
.t.asosiy { border-color: #0d9488; color: #0d9488; font-weight: 700; }
.natija { margin: 8px 0 0; font-size: 12.5px; color: var(--success); }
.natija.xato { color: var(--danger, #dc2626); }
</style>
