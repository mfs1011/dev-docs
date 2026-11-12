<script setup>
// Xabar oqimi: Producer → Exchange → Navbat → Consumer, pastda o'lik xatlar (DLX/AE → DLQ).
// Tuzilma — brokerning HTTP API'sidan (har soniyada), harakat — firehose "publish" (routed_queues, app_id)
// va consumer "ishlov" hodisalaridan. Xat belgisi haqiqiy yo'l bo'ylab yuradi: tushgan navbat yonadi,
// yo'naltirilmagan xabar qizil, nack — navbatga qaytadi, reject — DLX orqali DLQ'ga.
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { EX_IZOH, ILOVALAR, headerMatn } from '@/rabbitmq/namuna'

const props = defineProps({
  holat: { type: Object, required: true },
  tingla: { type: Function, required: true },
  tezlik: { type: Number, default: 1 },
  faolEx: { type: String, default: '' },
  ilova: { type: String, default: 'Web App' },
  izoh: { type: String, default: '' },
})
const emit = defineEmits(['yubor', 'ilova'])

const exNomi = (n) => (n === '' ? '(default)' : n)
const dlx = (n) => n.args?.['x-dead-letter-exchange'] ?? n.policy?.['dead-letter-exchange']
const ae = (e) => e?.args?.['alternate-exchange']
const exTopi = (nom) => props.holat.exchangelar.find((e) => e.nom === nom)
const nvTopi = (nom) => props.holat.navbatlar.find((n) => n.nom === nom)

// ---------------------------------------------------------------- tuzilma
const defaultKorindi = ref(false)
const boshqaKorindi = ref(false)
// DLX yoki alternate-exchange sifatida ishlatilgan exchange'lar — pastki qatorga
const olikEx = computed(() => new Set([
  ...props.holat.navbatlar.map(dlx), ...props.holat.exchangelar.map(ae),
].filter((x) => x != null && x !== '')))
const dlqlar = computed(() => props.holat.navbatlar.filter((n) => {
  const b = props.holat.boglanishlar.filter((x) => x.navbat === n.nom)
  return b.length && b.every((x) => olikEx.value.has(x.exchange))
}))
const asosiyNv = computed(() => props.holat.navbatlar.filter((n) => !dlqlar.value.includes(n)))
const userEx = computed(() => props.holat.exchangelar.filter((e) =>
  e.nom !== '' && !olikEx.value.has(e.nom) && (!e.nom.startsWith('amq.') || props.holat.boglanishlar.some((b) => b.exchange === e.nom))))
const bogsizNv = computed(() => asosiyNv.value.filter((n) => !props.holat.boglanishlar.some((b) => b.navbat === n.nom)))
const defaultKorsat = computed(() => !userEx.value.length || bogsizNv.value.length > 0 || defaultKorindi.value)
const asosiyEx = computed(() => [...(defaultKorsat.value ? [exTopi('')].filter(Boolean) : []), ...userEx.value])
const pastkiEx = computed(() => props.holat.exchangelar.filter((e) => olikEx.value.has(e.nom)))
const conlar = (q) => props.holat.consumerlar.filter((c) => c.navbat === q)
const guruhlar = (nvlar) => nvlar.map((n) => ({ navbat: n.nom, consumerlar: conlar(n.nom) })).filter((g) => g.consumerlar.length)
const asosiyGuruh = computed(() => guruhlar(asosiyNv.value))
const pastkiGuruh = computed(() => guruhlar(dlqlar.value))
const pastkiBor = computed(() => pastkiEx.value.length || dlqlar.value.length)
const tashqi = (n) => Math.max(0, (n.consumerlar ?? 0) - conlar(n.nom).length)

function boglarMatn(n) {
  return props.holat.boglanishlar.filter((b) => b.navbat === n.nom).map((b) => {
    const t = exTopi(b.exchange)?.tur
    if (t === 'headers') return { ex: b.exchange, k: `${headerMatn(b.args) || '—'} (${b.args?.['x-match'] ?? 'all'})` }
    if (t === 'fanout') return { ex: b.exchange, k: '(kalit kerak emas)' }
    return { ex: b.exchange, k: b.kalit || '∅' }
  })
}
function belgilar(n) {
  const a = n.args ?? {}, p = n.policy ?? {}, b = []
  const ttl = a['x-message-ttl'] ?? p['message-ttl']
  const max = a['x-max-length'] ?? p['max-length']
  if (ttl != null) b.push(`TTL ${ttl} ms`)
  if (max != null) b.push(`max ${max}`)
  if (a['x-overflow']) b.push(a['x-overflow'])
  if (a['x-delivery-limit'] != null) b.push(`delivery-limit ${a['x-delivery-limit']}`)
  if (dlx(n) != null) b.push(`DLX → ${exNomi(dlx(n))}`)
  return b
}

// ---------------------------------------------------------------- o'lchash
const quti = ref(null)
const R = reactive({})    // tugun kaliti -> { l, r, t, b, cx, cy }
const olcham = reactive({ w: 0, h: 0 })
function olcha() {
  const q = quti.value
  if (!q) return
  const r0 = q.getBoundingClientRect()
  const yangi = {}
  for (const el of q.querySelectorAll('[data-tugun]')) {
    const r = el.getBoundingClientRect()
    const l = r.left - r0.left, t = r.top - r0.top
    yangi[el.dataset.tugun] = { l, r: l + r.width, t, b: t + r.height, cx: l + r.width / 2, cy: t + Math.min(r.height / 2, 52) }
  }
  for (const k of Object.keys(R)) if (!yangi[k]) delete R[k]
  Object.assign(R, yangi)
  olcham.w = q.clientWidth
  olcham.h = q.scrollHeight
}
let ro
onMounted(() => { ro = new ResizeObserver(() => olcha()); ro.observe(quti.value); nextTick(olcha) })
watch(() => [props.holat.navbatlar, props.holat.consumerlar, props.holat.boglanishlar, props.holat.exchangelar, defaultKorsat.value, boshqaKorindi.value],
  () => nextTick(olcha))

// a → b egri (kubik bezye): o'ngga, chapga yoki pastga — joylashuvga qarab
function seg(a, b) {
  if (!a || !b) return null
  if (b.l >= a.r - 4) {
    const d = Math.max(36, (b.l - a.r) / 2)
    return [a.r, a.cy, a.r + d, a.cy, b.l - d, b.cy, b.l, b.cy]
  }
  if (a.l >= b.r - 4) {
    if (b.t > a.b - 10) {   // pastki qatorga (navbat → DLX): pastdan chiqib, chapga
      return [a.cx, a.b, a.cx, a.b + 50, b.r + 70, b.cy, b.r, b.cy]
    }
    const d = Math.max(36, (a.l - b.r) / 2)
    return [a.l, a.cy, a.l - d, a.cy, b.r + d, b.cy, b.r, b.cy]
  }
  return b.t >= a.b
    ? [a.cx, a.b, a.cx, a.b + 40, b.cx, b.t - 40, b.cx, b.t]
    : [a.cx, a.t, a.cx, a.t - 40, b.cx, b.b + 40, b.cx, b.b]
}
const dYoz = (s) => (s ? `M${s[0]},${s[1]} C${s[2]},${s[3]} ${s[4]},${s[5]} ${s[6]},${s[7]}` : '')

const chiziqlar = computed(() => {
  const l = []
  const qosh = (k, a, b, tur) => { const s = seg(R[a], R[b]); if (s) l.push({ k, d: dYoz(s), tur }) }
  const manbalar = [...ILOVALAR.map((i) => 'p:' + i.nom), ...(boshqaKorindi.value ? ['p:boshqa'] : [])]
  for (const p of manbalar) qosh(p + '>', p, 'e:' + props.faolEx, 'yub')
  for (const b of props.holat.boglanishlar) {
    qosh(`b:${b.exchange}>${b.navbat}:${b.kalit}:${b.props}`, 'e:' + b.exchange, 'q:' + b.navbat, olikEx.value.has(b.exchange) ? 'olik' : 'bog')
  }
  if (defaultKorsat.value) for (const n of bogsizNv.value) qosh('d>' + n.nom, 'e:', 'q:' + n.nom, 'yashirin')
  for (const c of props.holat.consumerlar) qosh('c:' + c.id, 'q:' + c.navbat, 'c:' + c.id, 'con')
  for (const n of props.holat.navbatlar) if (dlx(n) != null) qosh('dlx:' + n.nom, 'q:' + n.nom, 'e:' + dlx(n), 'dlx')
  for (const e of props.holat.exchangelar) if (ae(e)) qosh('ae:' + e.nom, 'e:' + e.nom, 'e:' + ae(e), 'dlx')
  return l
})

// ---------------------------------------------------------------- xat belgilari (JS animatsiya)
const xatlar = ref([])
let raqam = 0, rafId = 0
const nuqta = (s, t) => {
  const u = 1 - t
  return [u * u * u * s[0] + 3 * u * u * t * s[2] + 3 * u * t * t * s[4] + t * t * t * s[6],
    u * u * u * s[1] + 3 * u * u * t * s[3] + 3 * u * t * t * s[5] + t * t * t * s[7]]
}
function uchir(seglar, rang, { ms = 750, yorliq = '', tugadi } = {}) {
  seglar = seglar.filter(Boolean)
  if (!seglar.length) return void tugadi?.()
  const [x, y] = nuqta(seglar[0], 0)
  xatlar.value.push({ id: ++raqam, seglar, rang, ms: (ms * seglar.length) / props.tezlik, t0: performance.now(), x, y, yorliq, tugadi })
  if (!rafId) rafId = requestAnimationFrame(kadr)
}
function kadr(now) {
  const qoldi = []
  for (const x of xatlar.value) {
    const p = Math.max(0, Math.min(1, (now - x.t0) / x.ms))   // rAF vaqti push'dan oldingi kadrga tegishli bo'lishi mumkin
    const tt = p * x.seglar.length, i = Math.min(x.seglar.length - 1, Math.floor(tt))
    const e = p >= 1 ? 1 : tt - i, ease = e < 0.5 ? 2 * e * e : 1 - (-2 * e + 2) ** 2 / 2
    ;[x.x, x.y] = nuqta(x.seglar[i], ease)
    if (p < 1) qoldi.push(x)
    else x.tugadi?.()
  }
  xatlar.value = qoldi
  rafId = qoldi.length ? requestAnimationFrame(kadr) : 0
}

// ---------------------------------------------------------------- vaqtinchalik holatlar
const yonish = reactive({})   // tugun -> 'ok' | 'xato' | 'xira' | 'qayt'
const conHolat = reactive({})
const exXabar = reactive({})  // exchange -> qisqa izoh (masalan, "yo'naltirilmadi")
const taymerlar = []
function yondir(k, tur, ms = 1200) {
  yonish[k] = tur
  taymerlar.push(setTimeout(() => { if (yonish[k] === tur) delete yonish[k] }, ms / Math.max(0.5, props.tezlik)))
}
function exYoz(ex, matn, ms) {
  exXabar[ex] = matn
  taymerlar.push(setTimeout(() => { if (exXabar[ex] === matn) delete exXabar[ex] }, ms / Math.max(0.5, props.tezlik)))
}

// Ketma-ketlik: xat avval navbatga yetadi, keyin consumer'ga o'tadi. Broker xabarni consumer'ga animatsiyadan ancha
// tez beradi (ishlov hodisasi xat hali yo'lda bo'lganda keladi), shuning uchun vaqt jadvali yuritiladi:
// qYetish[navbat] — shu navbatga yo'ldagi oxirgi xat yetadigan payt, conBand[consumer] — consumer'ning oldingi
// animatsiyasi tugaydigan payt. Ishlov animatsiyasi ikkalasidan keyin boshlanadi.
const MS_YOL = 750, MS_CON = 600, ORALIQ = 120, MAX_KECH = 5000
const izla = (tur, m) => { if (import.meta.env.DEV && window.__rmqIz) window.__rmqIz.push({ t: performance.now(), tur, ...m }) }
const qYetish = {}
const conBand = {}
// nvBand[navbat] — navbatga tegadigan oxirgi rejalashtirilgan animatsiya payti. Navbatdagi sonlar (brokerdan darhol
// keladi) shu paytgacha eski holicha ko'rsatiladi — son xat yetib kelganda o'zgaradi.
const nvBand = {}
const band = (q, t) => { nvBand[q] = Math.max(nvBand[q] ?? 0, t) }
// yolda[navbat] — shu navbatga hali yetib kelmagan xatlar (publish, nack bilan qaytish, reject → DLQ).
// Vaqt rejasi sahifa band bo'lsa kechikishi mumkin, shuning uchun son haqiqiy yetib kelishni ham kutadi.
const yolda = {}
const yolgaChiqdi = (q) => { yolda[q] = (yolda[q] ?? 0) + 1 }
const yetdi = (q) => { yolda[q] = Math.max(0, (yolda[q] ?? 0) - 1); sonYangila() }
const korsat = reactive({})
const sonTaymer = {}
function sonYangila() {
  const now = performance.now()
  for (const n of props.holat.navbatlar) {
    const b = nvBand[n.nom] ?? 0
    // xavfsizlik: xat 3 s dan ortiq "yo'lda" qolsa (masalan, sxema qayta chizilgan), son baribir yangilanadi
    if (now >= b && (!yolda[n.nom] || now > b + 3000)) {
      const eski = korsat[n.nom]
      if (eski && n.tayyor > eski.tayyor) izla('son', { q: n.nom, tayyor: n.tayyor })
      korsat[n.nom] = { tayyor: n.tayyor, unacked: n.unacked }
    } else if (!sonTaymer[n.nom]) {
      sonTaymer[n.nom] = setTimeout(() => { sonTaymer[n.nom] = 0; sonYangila() }, Math.max(b - now, 0) + (yolda[n.nom] ? 3030 : 30))
    }
  }
}
watch(() => props.holat.navbatlar, () => sonYangila(), { immediate: true })
const son = (n) => korsat[n.nom] ?? n

function publish(x) {
  const ex = x.nom ?? ''
  if (ex === '' && !defaultKorsat.value) defaultKorindi.value = true
  const manba = ILOVALAR.some((i) => i.nom === x.ilova) ? 'p:' + x.ilova : 'p:boshqa'
  if (manba === 'p:boshqa') boshqaKorindi.value = true
  const rang = ILOVALAR.find((i) => i.nom === x.ilova)?.rang ?? '#64748b'
  const qlar = x.navbatlar ?? []
  // har navbatga yetish paytini oldindan hisoblash (exchange'gacha 1 bo'lak, keyin 1 yoki AE orqali 2 bo'lak)
  const t0 = performance.now(), bolak = MS_YOL / props.tezlik
  for (const q of qlar) {
    const togri = ex === '' || props.holat.boglanishlar.some((b) => b.exchange === ex && b.navbat === q)
    const yetish = t0 + bolak * (togri || !ae(exTopi(ex)) ? 2 : 3)
    qYetish[q] = Math.max(qYetish[q] ?? 0, yetish)
    band(q, yetish)
    yolgaChiqdi(q)
  }
  izla('publish', { qlar })
  nextTick(() => {
    olcha()
    yondir(manba, 'ok', 700)
    uchir([seg(R[manba], R['e:' + ex])], rang, {
      yorliq: (x.kalitlar ?? []).join(',') || '∅',
      tugadi: () => {
        if (!qlar.length) {
          yondir('e:' + ex, 'xato', 1800)
          exYoz(ex, 'yo‘naltirilmadi — xabar yo‘qoldi', 1800)
          return
        }
        yondir('e:' + ex, 'ok')
        for (const n of asosiyNv.value) if (!qlar.includes(n.nom)) yondir('q:' + n.nom, 'xira')
        const exObj = exTopi(ex)
        for (const q of qlar) {
          const togri = ex === '' || props.holat.boglanishlar.some((b) => b.exchange === ex && b.navbat === q)
          const a = ae(exObj)
          const yol = togri || !a
            ? [seg(R['e:' + ex], R['q:' + q])]
            : [seg(R['e:' + ex], R['e:' + a]), seg(R['e:' + a], R['q:' + q])]
          if (!togri && a) exYoz(ex, `binding mos kelmadi → AE ${a}`, 2200)
          uchir(yol, togri ? rang : 'var(--rmq-xato)', { tugadi: () => { yondir('q:' + q, togri ? 'ok' : 'xato'); izla('navbatga-yetdi', { q }); yetdi(q) } })
        }
      },
    })
  })
}

const NATIJA = {
  ack: ['✓ ack — bajarildi', 'ok'], auto: ['✓ auto-ack — olindi', 'ok'],
  nack: ['↺ ishlov xatosi: nack → navbatga qaytdi', 'qayt'], reject: ['✗ reject → DLX', 'xato'], crash: ['☠ ack’siz o‘ldi → navbatga qaytdi', 'xato'],
}
function ishlov(x) {
  const now = performance.now()
  const boshi = Math.min(now + MAX_KECH, Math.max(now, (qYetish[x.navbat] ?? 0) + ORALIQ, conBand[x.consumer] ?? 0))
  let oxiri = boshi + MS_CON / props.tezlik
  band(x.navbat, boshi)
  if (x.xulq === 'nack' || x.xulq === 'crash') {
    // qaytgan xat navbatga yetmaguncha uni qayta olish (redelivered) chizilmaydi
    oxiri += MS_YOL / props.tezlik
    qYetish[x.navbat] = Math.max(qYetish[x.navbat] ?? 0, oxiri)
    band(x.navbat, oxiri)
    yolgaChiqdi(x.navbat)
  }
  if (x.xulq === 'reject') {
    // reject → DLX → DLQ: o'lik xatlar navbatidagi son ham xat yetganda o'zgarsin
    const n = nvTopi(x.navbat), d = n && dlx(n)
    if (d != null) {
      const yetish = oxiri + (2 * MS_YOL) / props.tezlik
      for (const b of props.holat.boglanishlar) {
        if (b.exchange === d) { qYetish[b.navbat] = Math.max(qYetish[b.navbat] ?? 0, yetish); band(b.navbat, yetish); yolgaChiqdi(b.navbat) }
      }
    }
  }
  conBand[x.consumer] = oxiri + ORALIQ
  taymerlar.push(setTimeout(() => ishlovChiz(x), boshi - now))
}

function ishlovChiz(x) {
  const q = 'q:' + x.navbat, c = 'c:' + x.consumer
  izla('consumerga', { q: x.navbat, c: x.consumer, xulq: x.xulq })
  conHolat[x.consumer] = { matn: 'ishlov berilmoqda…', tur: 'ish', tana: x.tana }
  uchir([seg(R[q], R[c])], 'var(--rmq-q)', {
    ms: MS_CON,
    tugadi: () => {
      const [matn, tur] = NATIJA[x.xulq] ?? [x.xulq, 'ok']
      conHolat[x.consumer] = { matn: (x.redelivered ? '(qayta keldi) ' : '') + matn, tur, tana: x.tana }
      yondir(c, tur === 'ok' ? 'ok' : tur === 'qayt' ? 'qayt' : 'xato')
      if (x.xulq === 'nack' || x.xulq === 'crash') {
        uchir([seg(R[c], R[q])], 'var(--rmq-qayt)', { tugadi: () => { yondir(q, 'qayt'); izla('qaytdi', { q: x.navbat }); yetdi(x.navbat) } })
      }
      if (x.xulq === 'reject') {
        const n = nvTopi(x.navbat), d = n && dlx(n)
        if (d != null) {
          const dlq = props.holat.boglanishlar.filter((b) => b.exchange === d).map((b) => b.navbat)
          for (const t of dlq) {
            // uchir yo'l chizib bo'lmasa ham tugadi'ni chaqiradi — "yo'lda" sanog'i albatta kamayadi
            uchir([seg(R[q], R['e:' + d]), seg(R['e:' + d], R['q:' + t])], 'var(--rmq-xato)', { tugadi: () => { yondir('q:' + t, 'xato'); izla('navbatga-yetdi', { q: t }); yetdi(t) } })
          }
        }
      }
    },
  })
}

function hodisa(x) {
  if (x.t === 'oqim' && x.tur === 'publish') publish(x)
  else if (x.t === 'ishlov') ishlov(x)
}
let bekor
onMounted(() => { bekor = props.tingla(hodisa) })
onBeforeUnmount(() => { bekor?.(); ro?.disconnect(); taymerlar.forEach(clearTimeout); Object.values(sonTaymer).forEach(clearTimeout); cancelAnimationFrame(rafId) })

const CHEGARA = 14
const xatSoni = (n) => Math.min(n ?? 0, CHEGARA)
</script>

<template>
    <div class="oqim-quti">
        <div class="sarlavha">
            <span>XABAR OQIMI · MESSAGE FLOW</span>
            <span v-if="exTopi(faolEx)" class="faol">exchange: <b>{{ exNomi(faolEx) }}</b> · {{ exTopi(faolEx).tur }}</span>
        </div>
        <transition name="izoh"><div v-if="izoh" class="izoh">{{ izoh }}</div></transition>

        <div ref="quti" class="oqim">
            <svg class="qatlam chiziqlar" :width="olcham.w" :height="olcham.h" aria-hidden="true">
                <path v-for="l in chiziqlar" :key="l.k" :d="l.d" :class="l.tur" />
            </svg>

            <section class="ustun c1">
                <h4>Producer</h4>
                <div
                    v-for="p in ILOVALAR" :key="p.nom" class="karta yub" :class="[{ tanlangan: ilova === p.nom }, yonish['p:' + p.nom]]"
                    :style="{ '--r': p.rang }" :data-tugun="'p:' + p.nom" @click="emit('ilova', p.nom)"
                >
                    <span class="ikon">➜</span>
                    <small>ISHLAB CHIQARUVCHI</small>
                    <b>{{ p.nom }}</b>
                    <p>{{ p.izoh }}</p>
                    <button type="button" class="yubor" @click.stop="emit('yubor', p.nom)">▶ yubor</button>
                </div>
                <div v-if="boshqaKorindi" class="karta yub boshqa" data-tugun="p:boshqa">
                    <small>BOSHQA</small>
                    <p>Terminal yoki batafsil paneldan (app_id’siz)</p>
                </div>
            </section>

            <section class="ustun c2">
                <h4>Exchange</h4>
                <p v-if="!asosiyEx.length" class="bosh">Exchange yo‘q</p>
                <div v-for="e in asosiyEx" :key="e.nom" class="karta ex" :class="yonish['e:' + e.nom]" :data-tugun="'e:' + e.nom">
                    <span class="ikon">⇄</span>
                    <small>AYIRBOSHLAGICH</small>
                    <b>{{ exNomi(e.nom) }}</b>
                    <p>Xabarni <em>saqlamaydi</em>. {{ e.nom === '' ? 'Har navbatga uning nomi bilan yashirin bog‘langan.' : EX_IZOH[e.tur] }}</p>
                    <div class="qator">
                        <span class="nishon">type: {{ e.tur }}</span>
                        <span v-if="ae(e)" class="nishon qizil">AE → {{ ae(e) }}</span>
                    </div>
                    <span v-if="exXabar[e.nom]" class="ogoh" :class="{ xato: yonish['e:' + e.nom] === 'xato' }">{{ exXabar[e.nom] }}</span>
                </div>
            </section>

            <section class="ustun c3">
                <h4>Queue · Navbat</h4>
                <p v-if="!asosiyNv.length" class="bosh">Navbat yo‘q — tepada “+ Qo‘shish”.</p>
                <div v-for="n in asosiyNv" :key="n.nom" class="karta nv" :class="yonish['q:' + n.nom]" :data-tugun="'q:' + n.nom">
                    <div class="nv-bosh">
                        <span class="ikon">☰</span>
                        <span class="son-katta" :class="{ bor: son(n).tayyor }">{{ son(n).tayyor }}</span>
                    </div>
                    <small>NAVBAT</small>
                    <b>{{ n.nom }} <em class="tur">{{ n.tur }}</em></b>
                    <p v-for="b in boglarMatn(n)" :key="b.ex + b.k" class="bog-kalit">binding: <code>{{ b.k }}</code></p>
                    <div v-if="belgilar(n).length || tashqi(n)" class="arglar">
                        <span v-for="a in belgilar(n)" :key="a">{{ a }}</span>
                        <span v-if="tashqi(n)" class="tashqi">+{{ tashqi(n) }} tashqi consumer</span>
                    </div>
                    <div class="xatlar">
                        <i v-for="i in xatSoni(son(n).tayyor)" :key="'r' + i" class="tayyor" />
                        <i v-for="i in xatSoni(son(n).unacked)" :key="'u' + i" class="unacked" />
                        <span v-if="son(n).tayyor > CHEGARA || son(n).unacked > CHEGARA" class="kop">…</span>
                    </div>
                    <span class="son">tayyor {{ son(n).tayyor }} · unacked {{ son(n).unacked }}</span>
                </div>
            </section>

            <section class="ustun c4">
                <h4>Consumer</h4>
                <p v-if="!asosiyGuruh.length" class="bosh">Consumer yo‘q — xabarlar navbatda kutadi.</p>
                <div v-for="g in asosiyGuruh" :key="g.navbat" class="pool" :class="{ yakka: g.consumerlar.length === 1 }">
                    <small v-if="g.consumerlar.length > 1" class="pool-nom">WORKER POOL · {{ g.navbat }} · PREFETCH={{ g.consumerlar[0].prefetch || '∞' }}</small>
                    <div v-for="c in g.consumerlar" :key="c.id" class="karta con" :class="yonish['c:' + c.id]" :data-tugun="'c:' + c.id">
                        <span class="ikon">⤓</span>
                        <small>ISTE’MOLCHI</small>
                        <b>{{ c.id }}</b>
                        <p class="holat" :class="conHolat[c.id]?.tur">{{ conHolat[c.id]?.matn ?? 'kutmoqda…' }}</p>
                        <p v-if="conHolat[c.id]?.tana" class="tana">«{{ conHolat[c.id].tana }}»</p>
                        <span class="meta">{{ c.avto_ack ? 'auto-ack' : 'manual-ack' }} · {{ c.ishlandi }} ta ishlandi</span>
                    </div>
                </div>
            </section>

            <template v-if="pastkiBor">
                <div class="ajratgich" />
                <section class="ustun c1 past">
                    <div class="olik-izoh">
                        <small>O‘LIK XABARLAR</small>
                        <p>Rad etilgan (reject), muddati o‘tgan yoki hech qayerga yo‘naltirilmagan xabarlar shu yerga tushadi.</p>
                    </div>
                </section>
                <section class="ustun c2 past">
                    <div v-for="e in pastkiEx" :key="e.nom" class="karta ex olik" :class="yonish['e:' + e.nom]" :data-tugun="'e:' + e.nom">
                        <span class="ikon">☠</span>
                        <small>DLX / ALTERNATE EXCHANGE</small>
                        <b>{{ e.nom }}</b>
                        <span class="nishon">type: {{ e.tur }}</span>
                    </div>
                </section>
                <section class="ustun c3 past">
                    <div v-for="n in dlqlar" :key="n.nom" class="karta nv olik" :class="yonish['q:' + n.nom]" :data-tugun="'q:' + n.nom">
                        <div class="nv-bosh">
                            <span class="ikon">☠</span>
                            <span class="son-katta" :class="{ bor: son(n).tayyor }">{{ son(n).tayyor }}</span>
                        </div>
                        <small>O‘LIK XABARLAR NAVBATI (DLQ)</small>
                        <b>{{ n.nom }}</b>
                        <p>oladi: <code>reject</code> + <code>yo‘naltirilmagan</code></p>
                        <div class="xatlar">
                            <i v-for="i in xatSoni(son(n).tayyor)" :key="'r' + i" class="tayyor olik" />
                        </div>
                    </div>
                </section>
                <section class="ustun c4 past">
                    <div v-for="g in pastkiGuruh" :key="g.navbat" class="pool yakka">
                        <div v-for="c in g.consumerlar" :key="c.id" class="karta con" :class="yonish['c:' + c.id]" :data-tugun="'c:' + c.id">
                            <small>ISTE’MOLCHI</small>
                            <b>{{ c.id }}</b>
                            <p class="holat" :class="conHolat[c.id]?.tur">{{ conHolat[c.id]?.matn ?? 'kutmoqda…' }}</p>
                        </div>
                    </div>
                </section>
            </template>

            <svg class="qatlam xat-qatlam" :width="olcham.w" :height="olcham.h" aria-hidden="true">
                <g v-for="x in xatlar" :key="x.id" :transform="`translate(${x.x},${x.y})`">
                    <rect x="-11" y="-8" width="22" height="16" rx="3.5" :fill="x.rang" />
                    <path d="M-10,-7 L0,1.5 L10,-7" fill="none" stroke="#fff" stroke-width="1.7" />
                    <text v-if="x.yorliq" y="-13" text-anchor="middle">{{ x.yorliq }}</text>
                </g>
            </svg>
        </div>
    </div>
</template>

<style scoped>
.oqim-quti { --rmq-ex: #8b5cf6; --rmq-q: #16a34a; --rmq-xato: #dc2626; --rmq-qayt: #d97706; position: relative; }
.sarlavha { display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; padding: 2px 4px 12px; margin-bottom: 8px; border-bottom: 1px solid var(--border); font: 600 11px var(--font-mono); letter-spacing: .1em; color: var(--text-subtle); }
.sarlavha .faol { letter-spacing: 0; font-weight: 400; color: var(--text-muted); }
.sarlavha .faol b { color: var(--accent-text); }
.izoh { position: absolute; z-index: 5; left: 50%; top: 40px; transform: translateX(-50%); max-width: 90%; padding: 8px 16px; border-radius: 999px; background: var(--text); color: var(--bg-elevated); font-size: 13.5px; font-weight: 600; box-shadow: 0 6px 20px rgba(0, 0, 0, .18); text-align: center; }
.izoh-enter-active, .izoh-leave-active { transition: opacity .25s, transform .25s; }
.izoh-enter-from, .izoh-leave-to { opacity: 0; transform: translate(-50%, -6px); }

.oqim { position: relative; display: grid; grid-template-columns: minmax(150px, .85fr) minmax(180px, 1fr) minmax(200px, 1.1fr) minmax(180px, 1fr); column-gap: 64px; row-gap: 18px; padding: 8px 6px 14px; font-family: var(--font-sans); }
.qatlam { position: absolute; inset: 0; pointer-events: none; overflow: visible; }
.chiziqlar { z-index: 0; }
.xat-qatlam { z-index: 4; }
.chiziqlar path { fill: none; stroke: color-mix(in srgb, var(--text-subtle) 45%, transparent); stroke-width: 1.6; }
.chiziqlar path.yub { opacity: .55; }
.chiziqlar path.yashirin { stroke-dasharray: 2 5; opacity: .55; }
.chiziqlar path.con { stroke-dasharray: 5 4; }
.chiziqlar path.dlx, .chiziqlar path.olik { stroke: var(--rmq-xato); stroke-dasharray: 6 4; opacity: .45; }
.xat-qatlam text { font: 600 10.5px var(--font-mono); fill: var(--text); paint-order: stroke; stroke: var(--bg-elevated); stroke-width: 3px; }

.ustun { display: flex; flex-direction: column; gap: 14px; min-width: 0; position: relative; z-index: 1; }
.c1, .c2 { justify-content: center; }
.c1 { grid-column: 1; } .c2 { grid-column: 2; } .c3 { grid-column: 3; } .c4 { grid-column: 4; }
.ustun:not(.past) { grid-row: 1; }
.past { grid-row: 3; justify-content: flex-start; }
h4 { margin: 0 0 2px; text-align: center; font: 600 11px var(--font-mono); letter-spacing: .12em; text-transform: uppercase; color: var(--text-subtle); }
.bosh { margin: 0; padding: 14px 10px; border: 1px dashed var(--border); border-radius: 12px; color: var(--text-subtle); font-size: 12.5px; text-align: center; }
.ajratgich { grid-column: 1 / -1; grid-row: 2; border-top: 1px dashed var(--border-strong); margin: 6px 0 4px; }

.karta { position: relative; display: grid; gap: 3px; padding: 12px 14px; border: 1px solid var(--border); border-radius: 14px; background: var(--bg-elevated); box-shadow: var(--shadow-sm); transition: border-color .25s, box-shadow .25s, opacity .3s; }
.ikon { width: 32px; height: 32px; display: grid; place-items: center; border-radius: 9px; font-size: 15px; margin-bottom: 4px; }
.karta small { font: 600 10px var(--font-mono); letter-spacing: .1em; color: var(--text-subtle); }
.karta b { font-size: 15.5px; display: flex; gap: 6px; align-items: center; flex-wrap: wrap; overflow-wrap: anywhere; }
.karta p { margin: 0; font-size: 12.5px; color: var(--text-muted); line-height: 1.4; }
.karta em { font-style: normal; color: var(--accent-text); font-weight: 600; }
.tur { font: 600 9.5px var(--font-mono) !important; text-transform: uppercase; padding: 1px 6px; border-radius: 5px; background: var(--bg-sunken); color: var(--text-muted) !important; border: 1px solid var(--border); }
.qator { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 5px; }
.nishon { justify-self: start; font: 11px var(--font-mono); padding: 2px 8px; border-radius: 6px; background: color-mix(in srgb, var(--rmq-ex) 12%, transparent); color: var(--rmq-ex); }
.nishon.qizil { background: color-mix(in srgb, var(--rmq-xato) 10%, transparent); color: var(--rmq-xato); }

.yub { --r: var(--accent); border-left: 4px solid var(--r); cursor: pointer; }
.yub .ikon { background: color-mix(in srgb, var(--r) 14%, transparent); color: var(--r); }
.yub.tanlangan { border-color: var(--r); box-shadow: 0 0 0 3px color-mix(in srgb, var(--r) 22%, transparent); }
.yubor { margin-top: 6px; padding: 5px 8px; border: 1px solid color-mix(in srgb, var(--r) 45%, transparent); border-radius: 8px; background: color-mix(in srgb, var(--r) 10%, transparent); color: var(--r); font: 600 12.5px var(--font-sans); cursor: pointer; }
.yubor:hover { background: color-mix(in srgb, var(--r) 18%, transparent); }
.yub.boshqa { --r: #64748b; cursor: default; padding: 8px 12px; }

.ex { border-color: color-mix(in srgb, var(--rmq-ex) 40%, var(--border)); background: color-mix(in srgb, var(--rmq-ex) 5%, var(--bg-elevated)); text-align: center; justify-items: center; }
.ex .ikon { background: color-mix(in srgb, var(--rmq-ex) 15%, transparent); color: var(--rmq-ex); }
.ex .qator { justify-content: center; }
.nv .ikon { background: color-mix(in srgb, var(--rmq-q) 14%, transparent); color: var(--rmq-q); margin: 0; }
.nv-bosh { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.son-katta { font: 700 22px var(--font-mono); color: var(--text-subtle); }
.son-katta.bor { color: var(--accent-text); }
.con .ikon { background: color-mix(in srgb, var(--accent) 14%, transparent); color: var(--accent-text); }
.olik { border-style: dashed; border-color: color-mix(in srgb, var(--rmq-xato) 50%, var(--border)); background: color-mix(in srgb, var(--rmq-xato) 4%, var(--bg-elevated)); }
.olik .ikon { background: color-mix(in srgb, var(--rmq-xato) 12%, transparent); color: var(--rmq-xato); }
.olik .nishon { background: color-mix(in srgb, var(--rmq-xato) 10%, transparent); color: var(--rmq-xato); }
.olik-izoh small { font: 600 10px var(--font-mono); letter-spacing: .1em; color: var(--rmq-xato); }
.olik-izoh p { margin: 4px 0 0; font-size: 12px; color: var(--text-muted); }
.olik code, .bog-kalit code { font: 11.5px var(--font-mono); color: var(--accent-text); }

.karta.ok { border-color: var(--rmq-q); box-shadow: 0 0 0 4px color-mix(in srgb, var(--rmq-q) 22%, transparent); }
.ex.ok { border-color: var(--rmq-ex); box-shadow: 0 0 0 4px color-mix(in srgb, var(--rmq-ex) 25%, transparent); }
.karta.xato { border-color: var(--rmq-xato); box-shadow: 0 0 0 4px color-mix(in srgb, var(--rmq-xato) 22%, transparent); }
.karta.qayt { border-color: var(--rmq-qayt); box-shadow: 0 0 0 4px color-mix(in srgb, var(--rmq-qayt) 22%, transparent); }
.karta.xira { opacity: .35; }
.ogoh { margin-top: 4px; font-size: 11.5px; color: var(--rmq-qayt); font-weight: 600; }
.ogoh.xato { color: var(--rmq-xato); }

.arglar { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 3px; }
.arglar span { font: 10.5px var(--font-mono); padding: 1px 6px; border-radius: 5px; background: color-mix(in srgb, var(--rmq-qayt) 12%, transparent); color: var(--rmq-qayt); }
.arglar .tashqi { background: var(--bg-sunken); color: var(--text-muted); }
.xatlar { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; min-height: 14px; margin-top: 6px; }
.xatlar i { width: 16px; height: 11px; border-radius: 2px; position: relative; overflow: hidden; background: var(--accent); animation: tush .35s ease-out; }
.xatlar i::after { content: ''; position: absolute; left: 50%; top: -6px; width: 10px; height: 10px; border: 1.4px solid #fff; transform: translateX(-50%) rotate(45deg); }
.xatlar i.unacked { background: var(--rmq-qayt); opacity: .75; }
.xatlar i.olik { background: var(--rmq-xato); }
.kop { font: 11px var(--font-mono); color: var(--text-subtle); }
@keyframes tush { from { transform: translateY(-6px); opacity: 0; } }
.son { font: 11px var(--font-mono); color: var(--text-subtle); text-align: right; }

.pool { display: grid; gap: 10px; padding: 10px; border: 1px dashed var(--border-strong); border-radius: 16px; background: color-mix(in srgb, var(--bg-sunken) 60%, transparent); }
.pool.yakka { padding: 0; border: 0; background: none; }
.pool-nom { font: 600 10px var(--font-mono); letter-spacing: .08em; color: var(--text-subtle); }
.holat { font: 12px var(--font-mono) !important; }
.holat.ok { color: var(--rmq-q) !important; }
.holat.xato { color: var(--rmq-xato) !important; }
.holat.qayt, .holat.ish { color: var(--rmq-qayt) !important; }
.tana { font: 11.5px var(--font-mono) !important; color: var(--text-subtle) !important; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.meta { font: 10.5px var(--font-mono); color: var(--text-subtle); }

@media (max-width: 900px) {
  .oqim { grid-template-columns: 1fr 1fr; column-gap: 14px; }
  .ustun, .past { grid-column: auto !important; grid-row: auto !important; }
  .ajratgich { grid-row: auto; }
  .qatlam.chiziqlar { display: none; }
}
</style>
