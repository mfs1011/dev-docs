<script setup>
// Kalitlar xaritasi: Redis'dagi har kalit o'z turining shaklida (holat — SCAN/TYPE/PTTL va qiymat, har ~0.7 s).
// Buyruq kelganda (MONITOR) tegishli kartochka yonadi va buyruq nomi ko'rinadi; muddati tugagan, evict qilingan
// yoki o'chirilgan kalit (keyspace bildirishnomasi) bir necha soniya "arvoh" bo'lib turadi.
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { HODISA_IZOH, TURLAR, argumentlar, buyruqNomi } from '@/redis/izohlar'

const props = defineProps({
  holat: { type: Object, required: true },
  tingla: { type: Function, required: true },
})

const hozir = ref(Date.now())
let taymer
onMounted(() => { taymer = setInterval(() => { hozir.value = Date.now() }, 200) })

// muddat: holat kelgandagi PTTL'dan o'tgan vaqt ayiriladi
const qoldi = (k) => (k.pttl > 0 ? Math.max(0, k.pttl - (hozir.value - props.holat.vaqt)) : k.pttl)
const halqa = (k) => {
  const q = qoldi(k)
  const boshi = boshMuddat[k.nom] ?? k.pttl
  return Math.max(0, Math.min(1, q / boshi))
}
const boshMuddat = reactive({})   // kalit -> birinchi ko'rilgan (eng katta) PTTL — halqa uchun

// ---------------------------------------------------------------- yonish va arvohlar
const yonish = reactive({})        // kalit -> { buyruq, vaqt }
const arvohlar = ref([])           // [{ kalit (oxirgi holatdagi nusxa), sabab, id }]
let arvohId = 0
const taymerlar = []
const kalitlarMap = computed(() => new Map(props.holat.kalitlar.map((k) => [k.nom, k])))

function hodisa(x) {
  if (x.t === 'buyruq') {
    const a = argumentlar(x)
    const nom = buyruqNomi(x)
    for (const arg of a.slice(1)) {
      if (kalitlarMap.value.has(arg) || /^(SET|LPUSH|RPUSH|HSET|SADD|ZADD|XADD|INCR|INCRBY|MSET|APPEND)$/.test(nom)) {
        yonish[arg] = { buyruq: nom, vaqt: Date.now() }
        taymerlar.push(setTimeout(() => { if (Date.now() - (yonish[arg]?.vaqt ?? 0) >= 1150) delete yonish[arg] }, 1200))
        if (!/^(MSET|DEL|UNLINK|SINTER|SUNION|SDIFF|EXISTS|MGET)$/.test(nom)) break
      }
    }
  } else if (x.t === 'hodisa' && ['expired', 'evicted', 'del'].includes(x.tur)) {
    const k = kalitlarMap.value.get(x.kalit)
    if (!k) return
    const id = ++arvohId
    arvohlar.value = [...arvohlar.value.filter((a) => a.kalit.nom !== k.nom), { kalit: k, sabab: x.tur, id }].slice(-12)
    taymerlar.push(setTimeout(() => { arvohlar.value = arvohlar.value.filter((a) => a.id !== id) }, x.tur === 'evicted' ? 2500 : 3500))
    delete boshMuddat[k.nom]
  }
}
let bekor
onMounted(() => { bekor = props.tingla(hodisa) })
onBeforeUnmount(() => { bekor?.(); clearInterval(taymer); taymerlar.forEach(clearTimeout) })

const kartalar = computed(() => {
  for (const k of props.holat.kalitlar) {
    if (k.pttl > 0 && (!boshMuddat[k.nom] || k.pttl > boshMuddat[k.nom])) boshMuddat[k.nom] = k.pttl
    if (k.pttl <= 0) delete boshMuddat[k.nom]
  }
  const tirik = new Set(props.holat.kalitlar.map((k) => k.nom))
  return [
    ...props.holat.kalitlar.map((k) => ({ k, arvoh: null })),
    ...arvohlar.value.filter((a) => !tirik.has(a.kalit.nom)).map((a) => ({ k: a.kalit, arvoh: a.sabab })),
  ].sort((a, b) => a.k.nom.localeCompare(b.k.nom))
})

const sonmi = (v) => typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v)
const zMax = (k) => Math.max(1, ...k.qiymat.map(([, s]) => Math.abs(s)))
const sekund = (ms) => (ms >= 10000 ? `${Math.round(ms / 1000)} s` : `${(ms / 1000).toFixed(1)} s`)
const ARVOH = { expired: '⏱ muddati tugadi', evicted: '🧹 evict qilindi', del: '🗑 o‘chirildi' }
const elementNomi = { list: 'element', hash: 'maydon', set: 'element', zset: 'a’zo', stream: 'yozuv', string: 'belgi' }
</script>

<template>
    <div class="kalitlar">
        <div class="sarlavha">
            <span>KALITLAR · KEYSPACE</span>
            <span class="jami">{{ holat.jami }} ta kalit{{ holat.jami > holat.kalitlar.length ? ` (birinchi ${holat.kalitlar.length} tasi ko‘rsatilgan)` : '' }}</span>
        </div>
        <p v-if="!kartalar.length" class="bosh">Baza bo‘sh. Tepada buyruq tanlang yoki yozing — masalan, <code>SET salom dunyo</code> — kalit shu yerda paydo bo‘ladi.</p>
        <TransitionGroup name="karta" tag="div" class="panjara">
            <article
                v-for="{ k, arvoh } in kartalar" :key="k.nom" class="karta" :class="{ yondi: yonish[k.nom], arvoh }"
                :style="{ '--r': TURLAR[k.tur]?.rang ?? '#64748b' }"
            >
                <header>
                    <span class="tur">{{ TURLAR[k.tur]?.nom ?? k.tur }}</span>
                    <b class="nom" :title="k.nom">{{ k.nom }}</b>
                    <span v-if="k.pttl > 0 && !arvoh" class="ttl" :title="`TTL: ${sekund(qoldi(k))}`">
                        <svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" class="fon" /><circle cx="10" cy="10" r="8" class="qism" :style="{ strokeDashoffset: 50.27 * (1 - halqa(k)) }" /></svg>
                        {{ sekund(qoldi(k)) }}
                    </span>
                    <span v-else-if="!arvoh" class="ttl doimiy" title="muddatsiz (TTL -1)">∞</span>
                </header>
                <span v-if="yonish[k.nom]" class="buyruq-belgi">{{ yonish[k.nom].buyruq }}</span>

                <!-- string -->
                <div v-if="k.tur === 'string'" class="str" :class="{ son: sonmi(k.qiymat) }">
                    <Transition name="sakra" mode="out-in"><span :key="k.qiymat">{{ k.qiymat }}</span></Transition>
                </div>

                <!-- list: chap — bosh (LPUSH/LPOP), o'ng — oxir (RPUSH/RPOP) -->
                <div v-else-if="k.tur === 'list'" class="list">
                    <small>L · bosh</small>
                    <TransitionGroup name="el" tag="div" class="zanjir">
                        <span v-for="(v, i) in k.qiymat" :key="v + '#' + k.qiymat.slice(0, i).filter((x) => x === v).length">{{ v }}</span>
                    </TransitionGroup>
                    <small>oxir · R</small>
                </div>

                <!-- hash -->
                <table v-else-if="k.tur === 'hash'" class="hash">
                    <TransitionGroup name="el" tag="tbody">
                        <tr v-for="(v, f) in k.qiymat" :key="f"><td>{{ f }}</td><td>{{ v }}</td></tr>
                    </TransitionGroup>
                </table>

                <!-- set -->
                <TransitionGroup v-else-if="k.tur === 'set'" name="el" tag="div" class="set">
                    <span v-for="v in k.qiymat" :key="v">{{ v }}</span>
                </TransitionGroup>

                <!-- sorted set: ball bo'yicha, kattadan -->
                <TransitionGroup v-else-if="k.tur === 'zset'" name="el" tag="ol" class="zset">
                    <li v-for="([v, s], i) in [...k.qiymat].reverse()" :key="v">
                        <span class="o">{{ i + 1 }}</span>
                        <span class="z">{{ v }}</span>
                        <span class="chiziq"><i :style="{ width: `${(Math.abs(s) / zMax(k)) * 100}%` }" /></span>
                        <b>{{ s }}</b>
                    </li>
                </TransitionGroup>

                <!-- stream -->
                <div v-else-if="k.tur === 'stream'" class="stream">
                    <TransitionGroup name="el" tag="ol">
                        <li v-for="[id, maydon] in k.qiymat" :key="id">
                            <code>{{ id }}</code>
                            <span>{{ Object.entries(maydon).map(([a, b]) => `${a}=${b}`).join(' ') }}</span>
                            <em v-for="g in k.guruhlar.filter((g) => g.oxirgi === id)" :key="g.nom">◀ {{ g.nom }}</em>
                        </li>
                    </TransitionGroup>
                    <div v-for="g in k.guruhlar" :key="g.nom" class="guruh">
                        guruh <b>{{ g.nom }}</b> · consumer {{ g.consumerlar }} · pending <b :class="{ bor: g.pending }">{{ g.pending }}</b>{{ g.lag != null ? ` · lag ${g.lag}` : '' }}
                    </div>
                </div>

                <footer>
                    <span v-if="arvoh" class="arvoh-matn" :title="HODISA_IZOH[arvoh]">{{ ARVOH[arvoh] }}</span>
                    <span v-else>{{ k.uzunlik }} ta {{ elementNomi[k.tur] ?? '' }}{{ k.uzunlik > (Array.isArray(k.qiymat) ? k.qiymat.length : Object.keys(k.qiymat ?? {}).length) && k.tur !== 'string' ? ' (bir qismi ko‘rsatilgan)' : '' }}</span>
                </footer>
            </article>
        </TransitionGroup>
    </div>
</template>

<style scoped>
.sarlavha { display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; padding-bottom: 10px; margin-bottom: 12px; border-bottom: 1px solid var(--border); font: 600 11px var(--font-mono); letter-spacing: .1em; color: var(--text-subtle); }
.sarlavha .jami { letter-spacing: 0; font-weight: 400; }
.bosh { margin: 8px 0; font-size: 13.5px; color: var(--text-muted); }
.bosh code { font: 12.5px var(--font-mono); color: var(--accent-text); }
.panjara { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 14px; align-items: start; position: relative; }
.karta { position: relative; display: grid; gap: 8px; padding: 12px 14px; border: 1px solid var(--border); border-top: 4px solid var(--r); border-radius: 14px; background: var(--bg-elevated); box-shadow: var(--shadow-sm); transition: box-shadow .25s, border-color .25s, opacity .4s, filter .4s; min-width: 0; }
.karta.yondi { box-shadow: 0 0 0 4px color-mix(in srgb, var(--r) 28%, transparent); }
.karta.arvoh { opacity: .45; filter: grayscale(1); border-style: dashed; }
header { display: flex; align-items: center; gap: 8px; min-width: 0; }
.tur { font: 600 9.5px var(--font-mono); text-transform: uppercase; letter-spacing: .06em; padding: 2px 7px; border-radius: 5px; background: color-mix(in srgb, var(--r) 14%, transparent); color: var(--r); white-space: nowrap; }
.nom { font: 600 14px var(--font-mono); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
.ttl { display: inline-flex; align-items: center; gap: 4px; font: 600 11px var(--font-mono); color: #d97706; white-space: nowrap; }
.ttl.doimiy { color: var(--text-subtle); font-size: 14px; }
.ttl svg { width: 16px; height: 16px; transform: rotate(-90deg); }
.ttl circle { fill: none; stroke-width: 3; }
.ttl .fon { stroke: var(--border); }
.ttl .qism { stroke: #d97706; stroke-dasharray: 50.27; transition: stroke-dashoffset .2s linear; }
.buyruq-belgi { position: absolute; top: -11px; right: 12px; padding: 1px 8px; border-radius: 6px; background: var(--r); color: #fff; font: 700 10.5px var(--font-mono); animation: chiq .25s ease-out; }
@keyframes chiq { from { transform: translateY(4px); opacity: 0; } }
footer { font: 11px var(--font-mono); color: var(--text-subtle); }
.arvoh-matn { color: var(--danger, #dc2626); font-weight: 700; }

.str { padding: 10px 12px; border-radius: 10px; background: var(--bg-sunken); font: 14px var(--font-mono); overflow-wrap: anywhere; }
.str.son { font: 700 26px var(--font-mono); text-align: center; color: var(--r); }
.list { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 6px; }
.list small { font: 600 9.5px var(--font-mono); color: var(--text-subtle); writing-mode: vertical-rl; transform: rotate(180deg); }
.list small:last-child { transform: none; }
.zanjir { display: flex; flex-wrap: wrap; gap: 4px; min-height: 30px; }
.zanjir span { padding: 5px 8px; border-radius: 7px; background: color-mix(in srgb, var(--r) 14%, var(--bg-elevated)); border: 1px solid color-mix(in srgb, var(--r) 40%, transparent); font: 12px var(--font-mono); }
.hash { width: 100%; border-collapse: collapse; font: 12px var(--font-mono); }
.hash td { padding: 4px 6px; border-bottom: 1px solid var(--border); overflow-wrap: anywhere; }
.hash td:first-child { color: var(--r); font-weight: 600; width: 40%; }
.set { display: flex; flex-wrap: wrap; gap: 5px; }
.set span { padding: 4px 10px; border-radius: 999px; background: color-mix(in srgb, var(--r) 14%, transparent); color: var(--text); font: 12px var(--font-mono); }
.zset { list-style: none; margin: 0; padding: 0; display: grid; gap: 5px; }
.zset li { display: grid; grid-template-columns: 20px minmax(0, 70px) 1fr auto; align-items: center; gap: 6px; font: 12px var(--font-mono); }
.zset .o { font-weight: 700; color: var(--text-subtle); }
.zset .z { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.zset .chiziq { height: 8px; border-radius: 4px; background: var(--bg-sunken); overflow: hidden; }
.zset .chiziq i { display: block; height: 100%; background: var(--r); transition: width .4s; }
.stream ol { list-style: none; margin: 0; padding: 0 0 0 10px; border-left: 2px solid color-mix(in srgb, var(--r) 45%, transparent); display: grid; gap: 4px; }
.stream li { display: grid; gap: 1px; font: 11.5px var(--font-mono); position: relative; }
.stream li::before { content: ''; position: absolute; left: -15px; top: 4px; width: 8px; height: 8px; border-radius: 50%; background: var(--r); }
.stream code { color: var(--text-subtle); }
.stream em { font-style: normal; color: #7c3aed; font-weight: 700; }
.guruh { margin-top: 6px; font: 11.5px var(--font-mono); color: var(--text-muted); }
.guruh b.bor { color: #d97706; }

.karta-enter-from { opacity: 0; transform: scale(.94); }
.karta-enter-active { transition: opacity .35s, transform .35s; }
.karta-leave-active { display: none; }
.karta-move { transition: transform .35s; }
.el-enter-from { opacity: 0; transform: translateY(-6px) scale(.8); }
.el-enter-active { transition: all .35s ease-out; }
.el-leave-to { opacity: 0; transform: scale(.6); }
.el-leave-active { transition: all .3s; position: absolute; }
.el-move { transition: transform .35s; }
.sakra-enter-from { transform: translateY(-10px); opacity: 0; }
.sakra-leave-to { transform: translateY(10px); opacity: 0; }
.sakra-enter-active, .sakra-leave-active { transition: all .2s; }
</style>
