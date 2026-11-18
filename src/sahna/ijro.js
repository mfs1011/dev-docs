/**
 * Sahna ijro mashinasi (docs/vizualizator/README.md 4.3).
 *
 * Holat: qadam (`qi`), shu qadamda bajarilgan hodisalar soni (`hi`), ijro (`ijroda`), tezlik.
 * Har qadamga to'g'ridan-to'g'ri o'tish mumkin: ko'rinadigan holat (jadvaldagi paketlar, teglar, metrikalar)
 * oldingi qadamlardan **yig'iladi**, animatsiyani qayta o'ynash shart emas.
 *
 * Qoidalar:
 *  - qadamga o'tilganda uning hodisalari o'ynaladi va qadam oxirida to'xtaydi;
 *  - "Ijro" bosilgan bo'lsa (`davomli`) — qadam tugagach keyingisiga o'zi o'tadi;
 *  - natija sabab yetib kelgandan keyin ko'rinadi: paket qatori jadvalga paket yo'lga chiqqanda, teg esa
 *    hodisa navbati kelganda qo'shiladi (RabbitMQ trenajoridagi `ketmaketlik.mjs` saboqi).
 */
import { computed, ref, shallowRef } from 'vue'

export const TEZLIKLAR = [0.5, 0.75, 1, 1.25, 1.5]

/** Hodisaning standart davomiyligi, ms (1× tezlikda) */
export const DAVOM = { paket: 1150, yozish: 900, teg: 250, metrika: 250, kutish: 400 }
const ORALIQ = 220
const QADAM_ORALIQ = 1300

/** Ovozsiz davomli ijroda qadam matnini o'qishga beriladigan vaqt (so'z soniga qarab), ms */
export function oqishVaqti(q) {
  if (!q) return QADAM_ORALIQ
  const soz = [q.sarlavha, ...(q.matn ?? []), q.callout?.matn ?? ''].join(' ').split(/\s+/).length
  const hodisaVaqti = (q.hodisalar ?? []).reduce((s, h) => s + (h.ms ?? DAVOM[h.tur] ?? 300), 0)
  return Math.max(QADAM_ORALIQ, Math.min(10000, soz * 200 - hodisaVaqti))
}

export function useIjro(darsRef) {
  const qi = ref(0)
  const hi = ref(0)
  const ijroda = ref(false)
  const davomli = ref(false)
  const tezlik = ref(1)
  /** Hozir animatsiya bo'layotgan hodisa: { h, p } (p — 0..1) */
  const faol = shallowRef(null)
  let token = 0

  const qadamlar = computed(() => darsRef.value?.qadamlar ?? [])
  const qadam = computed(() => qadamlar.value[qi.value] ?? null)
  const hodisalar = (i) => qadamlar.value[i]?.hodisalar ?? []

  /** Bajarilgan hodisalar (oldingi qadamlar to'liq + joriysidan `hi` ta) — har biri { h, qadam } */
  const bajarilgan = computed(() => {
    const out = []
    for (let i = 0; i < qi.value; i++) for (const h of hodisalar(i)) out.push({ h, qadam: i })
    hodisalar(qi.value).slice(0, hi.value).forEach((h) => out.push({ h, qadam: qi.value }))
    if (faol.value) out.push({ h: faol.value.h, qadam: qi.value, faol: true })
    return out
  })

  const qadamTugadi = computed(() => hi.value >= hodisalar(qi.value).length && !faol.value)

  const kut = (ms, t) => new Promise((ok) => setTimeout(() => ok(t === token), ms))

  function animatsiya(h, t) {
    const davom = (h.ms ?? DAVOM[h.tur] ?? 300) / tezlik.value
    return new Promise((ok) => {
      const bosh = performance.now()
      const kadr = (now) => {
        if (t !== token) return ok(false)
        const p = Math.min(1, (now - bosh) / davom)
        faol.value = { h, p }
        if (p < 1) requestAnimationFrame(kadr)
        else ok(true)
      }
      requestAnimationFrame(kadr)
    })
  }

  async function yurgiz(t, faqatBitta = false) {
    ijroda.value = true
    while (t === token) {
      const hs = hodisalar(qi.value)
      if (hi.value < hs.length) {
        const h = hs[hi.value]
        if (!(await animatsiya(h, t))) return
        faol.value = null
        hi.value++
        if (faqatBitta) break
        if (!(await kut(ORALIQ / tezlik.value, t))) return
        continue
      }
      if (!davomli.value || qi.value >= qadamlar.value.length - 1) break
      if (!(await kut(oqishVaqti(qadam.value) / tezlik.value, t))) return
      qi.value++
      hi.value = 0
    }
    if (t === token) {
      ijroda.value = false
      if (qi.value >= qadamlar.value.length - 1 && qadamTugadi.value) davomli.value = false
    }
  }

  function toxta() {
    token++
    faol.value = null
    ijroda.value = false
  }

  /** Qadamga o'tish: hodisalari o'ynaladi (o'ynash = false bo'lsa — faqat ko'rsatiladi) */
  function qadamga(i, { oynash = true, tugagan = false } = {}) {
    if (i < 0 || i >= qadamlar.value.length) return
    toxta()
    qi.value = i
    hi.value = tugagan ? hodisalar(i).length : 0
    if (oynash && !tugagan) yurgiz(token)
  }

  function ijro() {
    if (ijroda.value) {
      davomli.value = false
      toxta()
      return
    }
    davomli.value = true
    if (qadamTugadi.value && qi.value >= qadamlar.value.length - 1) qadamga(0)
    else if (qadamTugadi.value) qadamga(qi.value + 1)
    else yurgiz(++token)
  }

  /** Bitta hodisa (paket) va to'xtash */
  function bitta() {
    davomli.value = false
    toxta()
    if (qadamTugadi.value) {
      if (qi.value >= qadamlar.value.length - 1) return
      qi.value++
      hi.value = 0
    }
    yurgiz(++token, true)
  }

  const keyingi = () => { davomli.value = false; qadamga(qi.value + 1) }
  const oldingi = () => { davomli.value = false; qadamga(qi.value - 1) }
  function qayta() {
    davomli.value = false
    toxta()
    qi.value = 0
    hi.value = 0
  }
  function tezlikniOzgartir(qadamSoni) {
    const i = TEZLIKLAR.indexOf(tezlik.value)
    tezlik.value = TEZLIKLAR[Math.max(0, Math.min(TEZLIKLAR.length - 1, i + qadamSoni))]
  }

  return { qi, hi, ijroda, davomli, tezlik, faol, qadam, qadamlar, bajarilgan, qadamTugadi, qadamga, ijro, bitta, keyingi, oldingi, qayta, toxta, tezlikniOzgartir }
}

/** Yig'ilgan holat: ko'rinadigan tugunlar, kamera, teglar, metrikalar, oqimlar, kartalar */
export function yigilganHolat(dars, qi, bajarilgan) {
  const q = dars.qadamlar
  let korinadi = [], kamera = null, oqimlar = [], kartalar = [], metrikalar = {}, chiziqlar = dars.chiziqlar
  for (let i = 0; i <= qi; i++) {
    const s = q[i]
    if (s.korinadi) korinadi = s.korinadi
    if (s.chiziqlar) chiziqlar = s.chiziqlar
    if (s.kamera) kamera = s.kamera
    if (s.oqimlar) oqimlar = s.oqimlar
    if (s.metrikalar) metrikalar = { ...metrikalar, ...s.metrikalar }
  }
  kartalar = q[qi]?.kartalar ?? []
  const teglar = {}
  let bosh = 0
  for (let i = 0; i <= qi; i++) if (q[i].teglar) { bosh = i; for (const k of Object.keys(teglar)) delete teglar[k]; Object.assign(teglar, q[i].teglar) }
  for (const { h, qadam } of bajarilgan) if (h.tur === 'teg' && qadam >= bosh) teglar[h.tugun] = h.matn ? h : null
  for (const k of Object.keys(teglar)) if (!teglar[k]) delete teglar[k]
  const yozildi = bajarilgan.filter(({ h }) => h.tur === 'yozish').pop()?.h.matn ?? null
  return { korinadi, chiziqlar, kamera: kamera ?? korinadi, teglar, oqimlar, kartalar, metrikalar, yozildi }
}
