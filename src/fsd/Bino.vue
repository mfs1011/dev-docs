<script setup>
// FSD «bino»: qatlamlar — qavatlar (app tepada, shared pastda), slice'lar — xonalar, segmentlar — xona ichidagi
// bo'limlar, index.ts — eshik. Import — xonadan xonaga strelka: pastga yashil; yuqoriga, qo'shniga yoki
// derazadan (public API'ni chetlab) — qizil. Xatolarni haqiqiy Steiger topadi, bino ularni joyida ko'rsatadi.
// Hamma import birdan chizilsa chiziqlar chalkashadi — shuning uchun doim faqat qizillari; xona bosilsa (yoki
// ustiga olib borilsa) — faqat o'sha xonaning bog'lanishlari, qolganlari xiralashadi.
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { QAVATLAR, XONASIZ, izoh } from './izohlar.js'
import { importlar, joyi } from './importlar.js'

const props = defineProps({ fayllar: Object, muammolar: Array, tanlangan: Object })
const emit = defineEmits(['tanla', 'xona'])

const IMPORT_QOIDA = new Set(['forbidden-imports', 'no-public-api-sidestep'])

const xonalar = computed(() => {
  const m = new Map()
  for (const f of Object.keys(props.fayllar)) {
    const j = joyi(f)
    if (!j) continue
    if (!m.has(j.xona)) m.set(j.xona, { id: j.xona, qatlam: j.qatlam, nom: j.xona.split('/')[1], segmentlar: new Set(), eshik: false })
    const x = m.get(j.xona)
    const ichki = f.replace(/^src\//, '').split('/').slice(XONASIZ.has(j.qatlam) ? 2 : 2)
    if (XONASIZ.has(j.qatlam)) {
      if (j.xona.endsWith('(ildiz)')) x.eshik = true
      else if (ichki.length === 1 && /^index\.[jt]sx?$/.test(ichki[0])) x.eshik = true
    } else if (ichki.length === 1 && /^index\.[jt]sx?$/.test(ichki[0])) x.eshik = true
    else if (ichki.length > 1) x.segmentlar.add(ichki[0])
  }
  return [...m.values()]
})
// xona yoki undagi segment bo'yicha Steiger xatolari (import xatolari strelkada)
const xonaXatolari = computed(() => {
  const m = new Map()
  for (const d of props.muammolar) {
    if (IMPORT_QOIDA.has(d.qoida)) continue
    const j = joyi(d.yol + '/x')
    if (j) m.set(j.xona, [...(m.get(j.xona) ?? []), d])
  }
  return m
})
const strelkalar = computed(() => {
  const m = new Map()
  for (const imp of importlar(props.fayllar)) {
    const k = `${imp.dan}>${imp.ga}`
    if (!m.has(k)) m.set(k, { id: k, dan: imp.dan, ga: imp.ga, importlar: [], xatolar: [] })
    const s = m.get(k)
    s.importlar.push(imp)
    s.xatolar.push(...props.muammolar.filter((d) => IMPORT_QOIDA.has(d.qoida) && d.yol === imp.yol && d.qator === imp.qator))
  }
  return [...m.values()]
})

// ── qaysi bog'lanishlar ko'rinadi ─────────────────────────────────────────────────────────────────
const faol = ref(null) // bosilgan xona
const ustida = ref(null) // sichqoncha ustidagi xona
const hammasi = ref(false)
const markaz = computed(() => ustida.value ?? faol.value)
const korinadi = (s) => hammasi.value || s.xatolar.length > 0 || (markaz.value && (s.dan === markaz.value || s.ga === markaz.value))
const boglanish = computed(() => {
  const m = markaz.value
  if (!m) return null
  const nom = (id) => ({ id, nom: id.split('/')[1].replace('(ildiz)', 'ildiz fayllar'), qatlam: id.split('/')[0] })
  return {
    ...nom(m),
    chiqadi: strelkalar.value.filter((s) => s.dan === m).map((s) => ({ ...nom(s.ga), xato: s.xatolar.length > 0 })),
    kiradi: strelkalar.value.filter((s) => s.ga === m).map((s) => ({ ...nom(s.dan), xato: s.xatolar.length > 0 })),
  }
})
const xonaHolati = (id) => {
  const b = boglanish.value
  if (!b) return null
  if (id === b.id) return 'markaz'
  if (b.chiqadi.some((x) => x.id === id)) return 'foyd'
  if (b.kiradi.some((x) => x.id === id)) return 'iste'
  return 'xira'
}
function bos(x) {
  faol.value = faol.value === x.id ? null : x.id
  if (xonaXatolari.value.has(x.id)) emit('tanla', xonaXatolari.value.get(x.id)[0])
  else emit('xona', x.id)
}

// ── strelkalarni chizish: xonalar joylashuvi o'lchanadi ───────────────────────────────────────────
const bino = ref(null)
const yollar = ref([])
const olcham = ref({ w: 0, h: 0 })
function chiz() {
  const el = bino.value
  if (!el) return
  const b = el.getBoundingClientRect()
  const rect = (id) => {
    const x = el.querySelector(`[data-xona="${CSS.escape(id)}"]`)
    if (!x) return null
    const r = x.getBoundingClientRect()
    return { x: r.left - b.left + el.scrollLeft, y: r.top - b.top + el.scrollTop, w: r.width, h: r.height }
  }
  const qavat = (id) => QAVATLAR.findIndex((q) => q.nom === id.split('/')[0])
  // xona atrofida yorug' ramka (box-shadow, 3–4 px) bor: chiziq undan tashqarida boshlanadi, nayza uchi unga tegadi
  const CHET = 4, UCH = 4
  // har qavatning yuqori/pastki chegarasi va undagi eng o'ngdagi xonaning o'ng cheti
  const qavatlar = [...el.querySelectorAll('.qavat')].map((q) => {
    const r = q.getBoundingClientRect()
    const ong = Math.max(0, ...[...q.querySelectorAll('.xona')].map((x) => x.getBoundingClientRect().right - b.left + el.scrollLeft))
    return { top: r.top - b.top + el.scrollTop, bottom: r.bottom - b.top + el.scrollTop, ong }
  })
  // Nayza: uchi (x, y), yo'nalishi — chiziqning oxirgi urinmasi (px, py → x, y). Chiziq nayza ASOSIDA tugaydi,
  // shuning uchun nayza uni to'liq yopadi va egri chiziqda nayza ham chiziq yo'nalishida buriladi.
  const NL = 12, NW = 10
  function nayza(px, py, x, y) {
    const len = Math.hypot(x - px, y - py) || 1
    const ux = (x - px) / len, uy = (y - py) / len
    const bx = x - ux * NL, by = y - uy * NL
    const nx = -uy * (NW / 2), ny = ux * (NW / 2)
    return { bx, by, ux, uy, uch: `${x},${y} ${bx + nx},${by + ny} ${bx - nx},${by - ny}` }
  }
  // kubik egri: oxirgi boshqaruv nuqtasi (c2) va uch (x, y) — chiziq nayza asosigacha, urinma saqlanadi
  function egri(x1, y1, c1x, c1y, c2x, c2y, x, y) {
    const n = nayza(c2x, c2y, x, y)
    return { d: `M${x1} ${y1} C${c1x} ${c1y} ${c2x - n.ux * NL} ${c2y - n.uy * NL} ${n.bx} ${n.by}`, uch: n.uch }
  }
  const chiqish = new Map()
  const yolak = new Map() // o'ng tomondagi aylanma yo'laklar soni (bir-birining ustiga tushmasin)
  const out = []
  for (const s of strelkalar.value) {
    const a = rect(s.dan), t = rect(s.ga)
    if (!a || !t) continue
    const n = chiqish.get(s.dan) ?? 0
    chiqish.set(s.dan, n + 1)
    const farq = qavat(s.ga) - qavat(s.dan)
    let d, uch, mx, my
    if (Math.abs(farq) >= 2) {
      // bir nechta qavatdan o'tadi — xonalar ustidan emas: qavatlar orasidagi bo'shliq → o'ng yo'lak →
      // nishon qavati ustidagi bo'shliq → xonaga (oxiri tik — nayza ham tik)
      const k = yolak.get(s.dan) ?? 0
      yolak.set(s.dan, k + 1)
      const [q1, q2] = [qavat(s.dan), qavat(s.ga)]
      const past = farq > 0
      const oraliq = qavatlar.slice(Math.min(q1, q2), Math.max(q1, q2) + 1)
      const lx = Math.max(...oraliq.map((q) => q.ong)) + 18 + k * 10
      const sx = a.x + a.w / 2 + ((n % 5) - 2) * 8
      const tx = t.x + t.w / 2 + ((k % 3) - 1) * 8
      const y1 = past ? a.y + a.h + CHET : a.y - CHET
      const g1 = past ? qavatlar[q1].bottom + 10 + k * 3 : qavatlar[q1].top - 10 - k * 3
      const g2 = past ? qavatlar[q2].top - 10 - k * 3 : qavatlar[q2].bottom + 10 + k * 3
      const y2 = past ? t.y - UCH : t.y + t.h + UCH
      const r = 8, v = past ? 1 : -1
      const nz = nayza(tx, g2, tx, y2)
      d = `M${sx} ${y1} V${g1 - v * r} Q${sx} ${g1} ${sx + r} ${g1} H${lx - r} Q${lx} ${g1} ${lx} ${g1 + v * r} V${g2 - v * r} Q${lx} ${g2} ${lx - r} ${g2} H${tx + r} Q${tx} ${g2} ${tx} ${g2 + v * r} V${nz.by}`
      uch = nz.uch
      mx = lx
      my = (g1 + g2) / 2
    } else if (farq === 0) {
      // bir qavatda: tepadan yoy; nishonga qiya tushadi
      const sx = a.x + a.w / 2, tx = t.x + t.w / 2
      ;({ d, uch } = egri(sx, a.y - CHET, sx, a.y - 40, tx - (tx - sx) * 0.3, t.y - 40, tx, t.y - UCH))
      mx = (sx + tx) / 2
      my = a.y - 30
    } else {
      // qo'shni qavat: S-egri; oxirgi boshqaruv nuqtasi biroz yon tomonda — chiziq nishonga qiya kiradi
      const sx = a.x + a.w / 2 + ((n % 5) - 2) * 10
      const tx = t.x + t.w / 2 + ((n % 3) - 1) * 6
      const [y1, y2] = farq > 0 ? [a.y + a.h + CHET, t.y - UCH] : [a.y - CHET, t.y + t.h + UCH]
      const dy = y2 - y1
      // kirish qiyaligi cheklangan (~45°): nayza qutiga yonidan emas, tepadan kirsin
      const yon = Math.max(-Math.abs(dy) * 0.4, Math.min(Math.abs(dy) * 0.4, (tx - sx) * 0.35))
      ;({ d, uch } = egri(sx, y1, sx, y1 + dy * 0.45, tx - yon, y2 - dy * 0.4, tx, y2))
      mx = (sx + tx) / 2
      my = (y1 + y2) / 2
    }
    out.push({ ...s, d, uch, mx, my })
  }
  yollar.value = out
  // SVG o'lchami kontentdan (scrollWidth/Height'dan emas): aks holda SVG o'zi scroll o'lchamini kattalashtirib,
  // scrollbar paydo bo'lishi → qayta chizish → yo'qolishi aylanib, rasm «pirillaydi»
  olcham.value = { w: el.clientWidth, h: qavatlar.at(-1)?.bottom ?? 0 }
}
let ro
onMounted(() => {
  // faqat kenglik o'zgarganda (balandlik o'zgarishi — scrollbar paydo bo'lishi ham — qayta chizishni boshlamaydi)
  let kenglik = 0
  ro = new ResizeObserver(([e]) => {
    const w = Math.round(e.contentRect.width)
    if (w === kenglik) return
    kenglik = w
    chiz()
  })
  ro.observe(bino.value)
  nextTick(chiz)
})
onBeforeUnmount(() => ro?.disconnect())
watch(() => [props.fayllar, props.muammolar], () => nextTick(chiz), { deep: false })

const tanlanganmi = (d) => props.tanlangan && d && props.tanlangan.yol === d.yol && props.tanlangan.qator === d.qator && props.tanlangan.qoida === d.qoida && props.tanlangan.xabar === d.xabar
const strelkaTanlanganmi = (s) => s.xatolar.some(tanlanganmi)
const xonaTanlanganmi = (id) => (xonaXatolari.value.get(id) ?? []).some(tanlanganmi)
const belgi = (s) => izoh(s.xatolar[0]).ikon
</script>

<template>
  <div ref="bino" class="bino">
    <div class="tushuntir">
      <template v-if="boglanish">
        <p>
          <b>{{ boglanish.nom }}</b> <small>({{ boglanish.qatlam }})</small>
          <template v-if="boglanish.chiqadi.length"> foydalanadi →
            <span v-for="x in boglanish.chiqadi" :key="x.id" class="ch" :class="x.xato ? 'qizil' : 'yashil'">{{ x.nom }} <small>{{ x.qatlam }}</small></span>
          </template>
          <template v-else> hech bir xonadan foydalanmaydi</template>
        </p>
        <p v-if="boglanish.kiradi.length">uni ishlatadi ←
          <span v-for="x in boglanish.kiradi" :key="x.id" class="ch" :class="x.xato ? 'qizil' : 'kok'">{{ x.nom }} <small>{{ x.qatlam }}</small></span>
        </p>
      </template>
      <p v-else class="yordam">Xonani bosing yoki ustiga olib boring — u qaysi xonalardan foydalanishini ko‘rasiz. Qizil chiziq — qoida buzilgan import.</p>
      <label class="hammasi"><input v-model="hammasi" type="checkbox" /> hamma importlar</label>
    </div>
    <svg class="strelkalar orqa" :width="olcham.w" :height="olcham.h">
      <g v-for="s in yollar.filter((s) => !s.xatolar.length && korinadi(s))" :key="s.id" :class="{ xato: s.xatolar.length, on: strelkaTanlanganmi(s), kiradi: markaz && s.ga === markaz }" @click="s.xatolar.length && emit('tanla', s.xatolar[0])">
        <title>{{ s.importlar.map((i) => `${i.yol}:${i.qator}  ${i.spec}`).join('\n') }}</title>
        <path :d="s.d" class="iz" />
        <path :d="s.d" class="chiziq" />
        <polygon :points="s.uch" class="nayza" />
        <g v-if="s.xatolar.length" :transform="`translate(${s.mx} ${s.my})`" class="belgi">
          <circle r="12" />
          <text text-anchor="middle" dy="5">{{ belgi(s) }}</text>
        </g>
      </g>
    </svg>
    <section v-for="q in QAVATLAR" :key="q.nom" class="qavat" :class="q.nom">
      <div class="qbosh">
        <span class="ikon">{{ q.ikon }}</span>
        <div><b>{{ q.nom }}</b><small>{{ q.izoh }}</small></div>
      </div>
      <div class="xonalar">
        <div
          v-for="x in xonalar.filter((x) => x.qatlam === q.nom)"
          :key="x.id"
          class="xona"
          :class="[{ xato: xonaXatolari.has(x.id), on: xonaTanlanganmi(x.id), tanl: faol === x.id }, xonaHolati(x.id)]"
          :data-xona="x.id"
          :title="x.id"
          @mouseenter="ustida = x.id"
          @mouseleave="ustida = null"
          @click="bos(x)"
        >
          <div class="nom">
            <span>{{ XONASIZ.has(q.nom) ? (x.nom === '(ildiz)' ? 'ildiz fayllar' : x.nom) : x.nom }}</span>
            <span v-if="!XONASIZ.has(q.nom) || x.nom !== '(ildiz)'" class="eshik" :class="{ yoq: !x.eshik }" :title="x.eshik ? 'index.ts — eshik (public API) bor' : 'index.ts yo‘q — eshiksiz xona'">🚪<i v-if="!x.eshik">✕</i></span>
          </div>
          <div v-if="x.segmentlar.size" class="seglar">
            <span v-for="s in x.segmentlar" :key="s" class="seg" :class="{ yomon: (xonaXatolari.get(x.id) ?? []).some((d) => d.yol.endsWith('/' + s)) }">{{ s }}</span>
          </div>
          <span v-if="xonaXatolari.has(x.id)" class="nishon">{{ izoh(xonaXatolari.get(x.id)[0]).ikon }}</span>
        </div>
        <p v-if="!xonalar.some((x) => x.qatlam === q.nom)" class="bosh">bo‘sh qavat</p>
      </div>
    </section>
    <svg class="strelkalar old" :width="olcham.w" :height="olcham.h">
      <g v-for="s in yollar.filter((s) => s.xatolar.length)" :key="s.id" :class="{ xato: s.xatolar.length, on: strelkaTanlanganmi(s) }" @click="s.xatolar.length && emit('tanla', s.xatolar[0])">
        <title>{{ s.importlar.map((i) => `${i.yol}:${i.qator}  ${i.spec}`).join('\n') }}</title>
        <path :d="s.d" class="iz" />
        <path :d="s.d" class="chiziq" />
        <polygon :points="s.uch" class="nayza" />
        <g v-if="s.xatolar.length" :transform="`translate(${s.mx} ${s.my})`" class="belgi">
          <circle r="12" />
          <text text-anchor="middle" dy="5">{{ belgi(s) }}</text>
        </g>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.bino { position: relative; overflow-x: hidden; overflow-y: auto; padding: 0 12px 14px; }
/* balandligi qat'iy: hover paytida matn o'zgarsa ham bino surilmasin — aks holda sichqoncha xonadan «chiqib»,
   izoh qaytadi va hammasi pirillaydi */
.tushuntir { position: sticky; top: 0; z-index: 3; display: flex; flex-wrap: wrap; align-items: flex-start; align-content: flex-start; gap: 0 12px; height: 72px; overflow-y: auto; margin: 0 -12px 10px; padding: 8px 12px; border-bottom: 1px solid var(--border); background: var(--bg-elevated); font-size: 13px; box-sizing: border-box; }
.tushuntir p { flex: 1 1 100%; margin: 0; line-height: 1.8; }
.tushuntir p:first-child { flex: 1; }
.tushuntir small { color: var(--text-subtle); }
.tushuntir .yordam { color: var(--text-muted); }
.ch { display: inline-block; margin: 0 4px 0 2px; padding: 0 8px; border-radius: 10px; font: 600 12px/1.7 var(--font-mono); }
.ch small { font-weight: 400; }
.ch.yashil { background: var(--success-soft); color: var(--success); }
.ch.kok { background: #e6efff; color: #2f6fe0; }
.ch.qizil { background: var(--danger-soft); color: #e5484d; }
:root[data-theme='dark'] .ch.kok { background: #172440; color: #7aa7ff; }
.hammasi { display: flex; align-items: center; gap: 4px; margin-left: auto; color: var(--text-muted); font-size: 12px; white-space: nowrap; cursor: pointer; }
.qavat { position: relative; z-index: 1; display: grid; grid-template-columns: 150px 1fr; gap: 10px; margin-bottom: 26px; padding: 10px; border: 2px solid var(--border-strong); border-radius: 10px; background: transparent; }
.qavat::after { content: ''; position: absolute; left: 10px; right: 10px; bottom: -16px; height: 4px; border-radius: 2px; background: var(--border); }
.qavat.app { border-top-width: 6px; }
.qavat.shared { border-style: dashed; }
.qbosh { display: flex; gap: 8px; align-items: flex-start; }
.qbosh .ikon { font-size: 20px; line-height: 1; }
.qbosh b { display: block; font: 700 13.5px var(--font-mono); }
.qbosh small { display: block; margin-top: 2px; color: var(--text-subtle); font-size: 11.5px; line-height: 1.35; }
.xonalar { display: flex; flex-wrap: wrap; gap: 10px 14px; align-items: flex-start; min-height: 46px; }
.xona { position: relative; z-index: 1; min-width: 110px; padding: 6px 9px 7px; border: 2px solid var(--accent); border-radius: 8px; background: var(--bg-elevated); cursor: pointer; }
.xona.xato { border-color: #e5484d; background: var(--danger-soft); }
.xona.on { box-shadow: 0 0 0 4px #e5484d55; }
.xona { transition: opacity .2s, box-shadow .2s; }
.xona.xira { opacity: .3; }
.xona.markaz { box-shadow: 0 0 0 4px var(--accent); }
.xona.foyd { box-shadow: 0 0 0 3px #2fbf71; }
.xona.iste { box-shadow: 0 0 0 3px #3b82f6; }
.xona.tanl .nom::after { content: '📌'; font-size: 11px; }
.nom { display: flex; align-items: center; justify-content: space-between; gap: 8px; font: 600 12.5px var(--font-mono); }
.eshik { position: relative; font-size: 14px; }
.eshik.yoq { opacity: .55; }
.eshik i { position: absolute; right: -4px; top: -6px; color: #e5484d; font-style: normal; font-weight: 800; font-size: 12px; }
.seglar { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 5px; }
.seg { padding: 0 6px; border: 1px solid var(--border-strong); border-radius: 4px; background: var(--bg-sunken); font: 11px/1.6 var(--font-mono); }
.seg.yomon { border-color: #e5484d; color: #e5484d; text-decoration: line-through; }
.nishon { position: absolute; right: -10px; top: -10px; width: 22px; height: 22px; display: grid; place-items: center; border-radius: 50%; background: #e5484d; font-size: 12px; }
.bosh { margin: 10px 0; color: var(--text-subtle); font-size: 12px; font-style: italic; }
.strelkalar { position: absolute; left: 0; top: 0; pointer-events: none; overflow: visible; }
/* strelkalar xonalarni aylanib o'tadi — qavat chegaralari ustidan ko'rinsin; oddiylari sichqonchani ushlamaydi
   (aks holda kursor strelkaga tushganda xona «tark etildi» deb, hover pirillaydi) */
.strelkalar.orqa { z-index: 2; }
.strelkalar.orqa g { pointer-events: none; }
.strelkalar.old { z-index: 3; }
.strelkalar g { pointer-events: auto; }
.iz { fill: none; stroke: transparent; stroke-width: 12; cursor: default; }
.chiziq { fill: none; stroke: #2fbf71; stroke-width: 2.2; }
g.kiradi .chiziq { stroke: #3b82f6; }
.nayza { fill: #2fbf71; }
g.kiradi .nayza { fill: #3b82f6; }
g.xato .nayza { fill: #e5484d; }
g.xato .chiziq { stroke: #e5484d; stroke-width: 2.6; stroke-dasharray: 7 5; opacity: 1; animation: oqim 1s linear infinite; }
g.xato .iz { cursor: pointer; }
g.on .chiziq { stroke-width: 4; }
@keyframes oqim { to { stroke-dashoffset: -24; } }
.belgi { cursor: pointer; }
.belgi circle { fill: var(--bg-elevated); stroke: #e5484d; stroke-width: 2; }
.belgi text { font-size: 13px; }
</style>
