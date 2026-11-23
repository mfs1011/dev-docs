<script setup>
// Host xaritasi: Docker daemon holati yangi boshlovchi uchun rasm ko'rinishida.
//   Image javoni — qoliplar (qatlamlar ustma-ust, o'zgarmaydi);
//   Tarmoqlar — har bridge tarmoq alohida maydon, ichida konteynerlar (IP bilan);
//   Konteyner — image qatlamlari + ustida o'z yozuv qatlami; holat chirog'i; portlar — host devoridagi eshiklar;
//   Ombor — volume'lar va ular qaysi konteynerga qayerga ulangani.
import { computed, onBeforeUnmount, ref, shallowRef } from 'vue'
import { hajm } from './birlik.js'

const props = defineProps({ daemon: Object })
const versiya = ref(0)
const yorqin = shallowRef(new Map()) // id → { tur, vaqt } — yaqinda o'zgargan narsa yonadi
const http = ref([]) // so'nggi HTTP so'rovlar: { id, yol, holat, kimdan, vaqt }
let t = 0
const off = props.daemon.tingla((h) => {
  if (h.tur === 'events' || (h.tur === 'container' && h.amal === 'log')) return
  const m = new Map(yorqin.value)
  if (h.id) m.set(h.id, { amal: h.amal, vaqt: Date.now() })
  if (h.tur === 'network' && h.konteyner) m.set(h.konteyner, { amal: 'connect', vaqt: Date.now() })
  yorqin.value = m
  if (h.tur === 'http' && h.amal === 'javob') http.value = [{ ...h, vaqt: Date.now() }, ...http.value].slice(0, 6)
  clearTimeout(t)
  t = setTimeout(() => { versiya.value++ }, 16)
})
const taymer = setInterval(() => { versiya.value++ }, 1000)
onBeforeUnmount(() => { off(); clearInterval(taymer); clearTimeout(t) })
const yangimi = (id) => { const x = yorqin.value.get(id); return x && Date.now() - x.vaqt < 1600 }

const qisqa = (id) => id.replace('sha256:', '').slice(0, 12)
const holatNomi = { running: 'ishlayapti', exited: 'to‘xtagan', created: 'yaratilgan', paused: 'muzlatilgan', restarting: 'qayta yonmoqda' }

const model = computed(() => {
  void versiya.value
  const d = props.daemon
  const imagelar = [...d.imagelar.values()].map((im) => ({
    id: im.id, nomlar: [...im.teglar].filter((x) => !x.includes('@')), digestNom: [...im.teglar].some((x) => x.includes('@')),
    qatlamlar: im.kat.qatlamlar.map((l) => ({ id: qisqa(l.d), s: l.s })), disk: hajm(im.kat.disk, 3),
    ishlatadi: d.ishlatyapti(im).map((k) => k.nom),
  }))
  const konteyner = (k) => ({
    id: k.id, nom: k.nom, image: k.image, holat: k.holat, kod: k.chiqishKodi,
    qatlam: k.im.kat.qatlamlar.length, ozgarish: k.fs ? k.fs.diff().length : 0,
    tarmoqlar: [...k.tarmoqlar].map(([tid, u]) => ({ nom: d.tarmoqlar.get(tid)?.nom, ip: u.ip })),
    portlar: k.portBerildi.filter((b) => b.ip !== '::').map((b) => ({ tashqi: b.tashqi, ichki: b.ichki, ip: b.ip })),
    eshik: Object.keys(k.config.exposed).map((x) => x.split('/')[0]),
    mountlar: k.mountlar.map((m) => ({ tur: m.tur, nom: m.tur === 'volume' ? (m.anonim ? m.nom.slice(0, 8) + '…' : m.nom) : m.tur === 'bind' ? m.manba : 'tmpfs', manzil: m.manzil, ro: m.ro })),
    jarayon: [...k.config.entrypoint, ...k.config.cmd].join(' '),
  })
  const barcha = [...d.konteynerlar.values()].sort((a, b) => a.yaratildi - b.yaratildi)
  const tarmoqlar = [...d.tarmoqlar.values()].filter((t) => t.drayver === 'bridge').map((t) => ({
    id: t.id, nom: t.nom, subnet: t.subnet, gw: t.gateway, standart: t.standart,
    konteynerlar: barcha.filter((k) => k.tarmoqlar.has(t.id)).map(konteyner),
  }))
  const boshqa = barcha.filter((k) => ![...k.tarmoqlar.keys()].some((tid) => d.tarmoqlar.get(tid)?.drayver === 'bridge')).map(konteyner)
  const volumelar = [...d.volumelar.values()].map((v) => ({
    nom: v.anonim ? v.nom.slice(0, 12) + '…' : v.nom, toliq: v.nom, anonim: v.anonim, hajm: hajm(d.volumeHajm(v), 3),
    kimda: d.volumeIshlatuvchilar(v).map((k) => ({ nom: k.nom, manzil: k.mountlar.find((m) => m.nom === v.nom)?.manzil })),
  }))
  const eshiklar = [...d.konteynerlar.values()].flatMap((k) => k.portBerildi.filter((b) => b.ip !== '::').map((b) => ({ id: k.id, nom: k.nom, ...b })))
  return { imagelar, tarmoqlar, boshqa, volumelar, eshiklar }
})
const httpKonteyner = (id) => http.value.find((x) => x.id === id && Date.now() - x.vaqt < 2500)
</script>

<template>
  <div class="xarita">
    <div class="host">
      <div class="host-bosh">
        <span class="host-nom">🖥 Host: <b>lab</b> <small>Ubuntu 26.04 · Docker Engine 29.9.3</small></span>
        <span class="eshiklar">
          <span v-if="!model.eshiklar.length" class="bosh">ochiq eshik (port) yo‘q</span>
          <span v-for="e in model.eshiklar" :key="e.kalit" class="eshik" :class="{ yon: yangimi(e.id) || httpKonteyner(e.id) }" :title="`Host ${e.ip}:${e.tashqi} → ${e.nom}:${e.ichki}`">
            🚪 {{ e.ip === '0.0.0.0' ? '' : e.ip + ':' }}{{ e.tashqi }} → {{ e.nom }}:{{ e.ichki }}
          </span>
        </span>
      </div>

      <div class="qismlar">
        <section class="javon">
          <h4>Image javoni <small>qoliplar — o‘zgarmaydi</small></h4>
          <p v-if="!model.imagelar.length" class="bosh">Bo‘sh. <code>docker pull</code> yoki <code>docker run</code> image'ni Docker Hub'dan olib keladi.</p>
          <div v-for="im in model.imagelar" :key="im.id" class="image" :class="{ yon: yangimi(im.id) }">
            <div class="qatlamlar" :title="`${im.qatlamlar.length} qatlam`">
              <span v-for="(q, i) in [...im.qatlamlar].reverse()" :key="q.id + i" class="qatlam" :style="{ width: Math.max(22, Math.min(100, 18 + Math.log10(q.s + 10) * 11)) + '%' }" :title="`${q.id} — ${hajm(q.s, 3)}`" />
            </div>
            <div class="im-matn">
              <b>{{ im.nomlar.join(', ') || '<untagged>' }}</b>
              <small>{{ im.qatlamlar.length }} qatlam · {{ im.disk }}</small>
              <small v-if="im.ishlatadi.length" class="ishlatadi">ishlatadi: {{ im.ishlatadi.join(', ') }}</small>
            </div>
          </div>
        </section>

        <section class="tarmoqlar">
          <div v-for="t in model.tarmoqlar" :key="t.id" class="tarmoq" :class="{ standart: t.standart, yon: yangimi(t.id) }">
            <div class="t-bosh">
              <b>🕸 {{ t.nom }}</b>
              <small>{{ t.subnet }} · shlyuz {{ t.gw }}</small>
              <small class="dns">{{ t.standart ? 'nom bilan topish yo‘q' : 'ichki DNS: konteyner nomi → IP' }}</small>
            </div>
            <p v-if="!t.konteynerlar.length" class="bosh">ulangan konteyner yo‘q</p>
            <div class="kartalar">
              <article v-for="k in t.konteynerlar" :key="k.id + t.id" class="konteyner" :class="[k.holat, { yon: yangimi(k.id) }]">
                <header>
                  <span class="chiroq" :title="holatNomi[k.holat]" />
                  <b>{{ k.nom }}</b>
                  <small>{{ holatNomi[k.holat] }}</small>
                </header>
                <div class="kqatlam">
                  <span class="yozuv" :title="'Konteynerning o‘z yozuv qatlami'">✎ yozuv qatlami{{ k.ozgarish ? ` · ${k.ozgarish} o‘zgarish` : '' }}</span>
                  <span class="imq" :title="'Image qatlamlari (faqat o‘qish)'">{{ k.image }} · {{ k.qatlam }} qatlam</span>
                </div>
                <div class="tafsil">
                  <code>{{ k.tarmoqlar.find((x) => x.nom === t.nom)?.ip }}</code>
                  <span v-for="p in k.eshik" :key="p" class="port">:{{ p }}</span>
                </div>
                <div v-if="k.mountlar.length" class="mlar">
                  <span v-for="m in k.mountlar" :key="m.manzil" class="mount" :class="m.tur">{{ m.tur === 'volume' ? '🛢' : m.tur === 'bind' ? '📁' : '💭' }} {{ m.nom }} → {{ m.manzil }}{{ m.ro ? ' (ro)' : '' }}</span>
                </div>
                <div v-if="httpKonteyner(k.id)" class="http" :class="{ yaxshi: httpKonteyner(k.id).holat < 400 }">
                  {{ httpKonteyner(k.id).holat }} {{ httpKonteyner(k.id).yol }}
                </div>
              </article>
            </div>
          </div>
          <div v-if="model.boshqa.length" class="tarmoq toxtagan">
            <div class="t-bosh"><b>To‘xtagan / tarmoqsiz konteynerlar</b><small>IP yo‘q — ishga tushganda beriladi</small></div>
            <div class="kartalar">
              <article v-for="k in model.boshqa" :key="k.id" class="konteyner" :class="[k.holat, { yon: yangimi(k.id) }]">
                <header>
                  <span class="chiroq" />
                  <b>{{ k.nom }}</b>
                  <small>{{ holatNomi[k.holat] }}{{ k.holat === 'exited' ? ` (${k.kod})` : '' }}</small>
                </header>
                <div class="kqatlam">
                  <span class="yozuv">✎ yozuv qatlami{{ k.ozgarish ? ` · ${k.ozgarish} o‘zgarish` : '' }}</span>
                  <span class="imq">{{ k.image }}</span>
                </div>
                <div v-if="k.mountlar.length" class="mlar">
                  <span v-for="m in k.mountlar" :key="m.manzil" class="mount" :class="m.tur">{{ m.tur === 'volume' ? '🛢' : '📁' }} {{ m.nom }} → {{ m.manzil }}</span>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section class="ombor">
          <h4>Ombor <small>volume'lar — konteynerdan alohida</small></h4>
          <p v-if="!model.volumelar.length" class="bosh">Volume yo‘q. <code>-v nom:/yol</code> — ma’lumot konteyner o‘chsa ham qoladi.</p>
          <div v-for="v in model.volumelar" :key="v.toliq" class="volume" :class="{ yon: yangimi(v.toliq) }">
            <span class="silindr">🛢</span>
            <div>
              <b>{{ v.nom }}</b> <small>{{ v.hajm }}{{ v.anonim ? ' · anonim' : '' }}</small>
              <small v-for="x in v.kimda" :key="x.nom" class="kimda">↔ {{ x.nom }}:{{ x.manzil }}</small>
              <small v-if="!v.kimda.length" class="kimda bosh">hech kim ishlatmayapti</small>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.xarita { font-size: 13px; }
.host { border: 2px solid var(--border-strong); border-radius: 14px; padding: 10px 12px 12px; background: var(--bg-sunken); }
.host-bosh { display: flex; flex-wrap: wrap; gap: 8px 14px; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.host-nom small { color: var(--text-subtle); margin-left: 4px; }
.eshiklar { display: flex; flex-wrap: wrap; gap: 6px; }
.eshik { padding: 3px 8px; border-radius: 999px; background: var(--bg-elevated); border: 1px solid var(--border); font: 12px var(--font-mono); transition: background .3s, border-color .3s; }
.eshik.yon { border-color: var(--accent); background: var(--accent-soft, rgba(37, 96, 255, .12)); }
.qismlar { display: grid; grid-template-columns: minmax(200px, 0.9fr) minmax(0, 2fr); grid-template-areas: 'javon tarmoq' 'ombor tarmoq'; gap: 10px; align-items: start; }
.javon { grid-area: javon; }
.tarmoqlar { grid-area: tarmoq; display: grid; gap: 10px; }
.ombor { grid-area: ombor; }
h4 { margin: 0 0 6px; font-size: 13px; }
h4 small { font-weight: 400; color: var(--text-subtle); }
.bosh { margin: 0; color: var(--text-subtle); font-size: 12px; }
.bosh code { font-size: 11px; }
.image { display: flex; gap: 8px; align-items: center; padding: 6px; border-radius: 10px; border: 1px solid transparent; transition: background .4s, border-color .4s; }
.image.yon { background: var(--accent-soft, rgba(37, 96, 255, .12)); border-color: var(--accent); }
.qatlamlar { width: 46px; display: flex; flex-direction: column; align-items: center; gap: 2px; flex-shrink: 0; }
.qatlam { display: block; height: 5px; border-radius: 2px; background: linear-gradient(90deg, #5b8def, #3f6fd8); animation: tush .5s ease-out both; }
@keyframes tush { from { transform: translateY(-8px); opacity: 0 } }
.im-matn { display: grid; min-width: 0; }
.im-matn b { font: 600 12.5px var(--font-mono); overflow-wrap: break-word; }
.im-matn small { color: var(--text-subtle); font-size: 11px; }
.ishlatadi { color: var(--success) !important; }
.tarmoq { border: 1.5px dashed var(--border-strong); border-radius: 12px; padding: 8px 10px 10px; background: var(--bg-elevated); transition: border-color .4s; }
.tarmoq.yon { border-color: var(--accent); }
.tarmoq.standart { border-style: solid; }
.tarmoq.toxtagan { opacity: .85; border-style: dotted; }
.t-bosh { display: flex; flex-wrap: wrap; gap: 4px 10px; align-items: baseline; margin-bottom: 6px; }
.t-bosh small { color: var(--text-subtle); font-size: 11px; }
.t-bosh .dns { font-style: italic; }
.kartalar { display: flex; flex-wrap: wrap; gap: 8px; }
.konteyner { position: relative; width: 210px; max-width: 100%; border: 1px solid var(--border); border-radius: 10px; padding: 7px 9px; background: var(--bg); transition: box-shadow .4s, border-color .4s, opacity .3s; animation: paydo .35s ease-out both; }
@keyframes paydo { from { transform: scale(.92); opacity: 0 } }
.konteyner.yon { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft, rgba(37, 96, 255, .18)); }
.konteyner header { display: flex; gap: 6px; align-items: center; }
.konteyner header b { font: 600 12.5px var(--font-mono); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.konteyner header small { margin-left: auto; color: var(--text-subtle); font-size: 10.5px; white-space: nowrap; }
.chiroq { width: 9px; height: 9px; border-radius: 50%; background: #9aa6ba; flex-shrink: 0; }
.running .chiroq { background: #22c55e; box-shadow: 0 0 6px #22c55e; }
.paused .chiroq { background: #eab308; }
.restarting .chiroq { background: #f97316; animation: miltilla .6s infinite alternate; }
.created .chiroq { background: #60a5fa; }
.exited { opacity: .75; }
@keyframes miltilla { to { opacity: .3 } }
.kqatlam { display: grid; gap: 2px; margin: 6px 0 4px; }
.kqatlam span { padding: 2px 6px; border-radius: 4px; font-size: 10.5px; }
.yozuv { background: rgba(234, 179, 8, .18); border: 1px dashed rgba(234, 179, 8, .7); }
.imq { background: rgba(91, 141, 239, .18); font-family: var(--font-mono); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tafsil { display: flex; gap: 6px; align-items: center; font-size: 11px; }
.tafsil code { font: 11px var(--font-mono); }
.port { padding: 0 5px; border-radius: 4px; background: var(--bg-sunken); font: 10.5px var(--font-mono); }
.mlar { display: grid; gap: 2px; margin-top: 4px; }
.mount { font: 10.5px var(--font-mono); color: var(--text-muted); overflow-wrap: anywhere; }
.http { position: absolute; top: -9px; right: 8px; padding: 1px 7px; border-radius: 999px; background: #dc2626; color: #fff; font: 600 10.5px var(--font-mono); animation: paydo .3s ease-out both; }
.http.yaxshi { background: #16a34a; }
.volume { display: flex; gap: 8px; align-items: flex-start; padding: 5px 6px; border-radius: 10px; border: 1px solid transparent; transition: background .4s; }
.volume.yon { background: var(--accent-soft, rgba(37, 96, 255, .12)); border-color: var(--accent); }
.silindr { font-size: 20px; line-height: 1; }
.volume b { font: 600 12px var(--font-mono); }
.volume small { color: var(--text-subtle); font-size: 11px; }
.kimda { display: block; font-family: var(--font-mono); }
@media (max-width: 760px) {
  .qismlar { grid-template-columns: 1fr; grid-template-areas: 'tarmoq' 'javon' 'ombor'; }
  .konteyner { width: 100%; }
}
</style>
