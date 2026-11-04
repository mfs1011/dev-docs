// Vue ishga tushiruvchisi (iframe ichida). Haqiqiy Vue — dev build (vue.runtime.esm-browser.js): faqat
// unda `renderTracked`/`renderTriggered` va computed/watch'ning `onTrack`/`onTrigger` debug ilgaklari ishlaydi
// (https://vuejs.org/guide/extras/reactivity-in-depth.html#reactivity-debugging).
// .vue fayllar brauzerda @vue/compiler-sfc bilan kompilyatsiya qilinadi. Pinia va Vue Router ham shu Vue'da
// (vue-lab.js, vue-kutubxona.js).
import * as Vue from 'vue/dist/vue.runtime.esm-browser.js'
import * as VueLab from './vue-lab.js'
import * as Pinia from 'pinia'
import { piniaYarat, routerShim, storSurati, yollarJadvali } from './vue-kutubxona.js'
import { parse, compileScript, compileTemplate, compileStyle } from '@vue/compiler-sfc/dist/compiler-sfc.esm-browser.js'
import './natija.css'
import { domKuzatuvchi, konsolniUlash, kor, modullar, tingla, toplam, yubor } from './umumiy.js'

const { isRef, isProxy, toRaw } = Vue

// ── nomlar va tugunlar ────────────────────────────────────────────────────────────────────────
const ids = new WeakMap()
let seq = 0
const oid = (o) => (ids.has(o) || ids.set(o, ++seq), ids.get(o))

const computeds = new WeakSet()
const tugunlar = new Map() // id → { id, kind, target, key }
const deps = new Map() // obunachi id → Set(tugun id)
const obunachilar = new Map() // obunachi id → { id, kind, label }
const propsRaw = new WeakMap() // props xom obyekti → komponent nomi

function tugun(target, key) {
  let id, kind
  if (target?.__v_isRef) {
    id = `r${oid(target)}`
    kind = computeds.has(target) ? 'computed' : 'ref'
  } else {
    id = `o${oid(target)}:${String(key)}`
    kind = propsRaw.has(target) ? 'props' : 'reactive'
  }
  if (!tugunlar.has(id)) tugunlar.set(id, { id, kind, target, key })
  return tugunlar.get(id)
}

// Nom: modul eksportlari va komponentlarning setup holatidan qidiriladi (ichma-ich obyektlar ham)
let nomlar = new WeakMap()
let eksport = {}
function royxatla(v, label, d = 0) {
  if (v === null || typeof v !== 'object') return
  if (isRef(v)) {
    if (!nomlar.has(v)) nomlar.set(v, label)
    if (!computeds.has(v)) royxatla(v._rawValue, label, d + 1)
    return
  }
  const raw = isProxy(v) ? toRaw(v) : v
  if (nomlar.has(raw) || d > 3 || v.__v_skip || raw instanceof Node) return
  nomlar.set(raw, label)
  if (Array.isArray(raw)) raw.slice(0, 20).forEach((x, i) => royxatla(x, `${label}[${i}]`, d + 1))
  else if (Object.getPrototypeOf(raw) === Object.prototype) for (const k of Object.keys(raw)) royxatla(raw[k], `${label}.${k}`, d + 1)
}
let storlar = new Map()
function nomlarniYangila() {
  nomlar = new WeakMap()
  // Pinia: `savat.items`, `savat.jami` — state obyekti va store'dagi ref/computed'lar
  // router'ning joriy manzili — `route` (useRoute() ham shu qiymatni ko'rsatadi)
  if (yol.holat.router) nomlar.set(yol.holat.router.currentRoute, 'route')
  for (const [id, store] of storlar) {
    royxatla(store.$state, id)
    for (const [k, v] of Object.entries(toRaw(store))) if (!k.startsWith('$') && !k.startsWith('_')) royxatla(v, `${id}.${k}`)
  }
  for (const ex of Object.values(eksport)) for (const [k, v] of Object.entries(ex)) if (k !== 'default') royxatla(v, k)
  for (const inst of komponentlar()) {
    for (const [k, v] of Object.entries(inst.devtoolsRawSetupState ?? {})) royxatla(v, k)
    // Options API: data()
    for (const [k, v] of Object.entries(toRaw(inst.data) ?? {})) royxatla(v, k)
  }
}
const iterNom = (key) => (typeof key === 'symbol' ? ' (ro‘yxat)' : `.${key}`)
function yorliq(n) {
  if (n.kind === 'ref' || n.kind === 'computed') return nomlar.get(n.target) ?? (n.kind === 'computed' ? 'computed' : 'ref')
  if (n.kind === 'props') return `${propsRaw.get(n.target)}: props${iterNom(n.key)}`
  const base = nomlar.get(n.target) ?? 'reactive'
  return /^\d+$/.test(String(n.key)) ? `${base}[${n.key}]` : base + iterNom(n.key)
}
function qiymat(n) {
  try {
    if (n.kind === 'ref' || n.kind === 'computed') return kor(n.target._value)
    if (typeof n.key === 'symbol') return Array.isArray(n.target) ? `${n.target.length} ta element` : kor(n.target)
    return kor(n.target[n.key])
  } catch {
    return ''
  }
}

// ── to'plam (bitta hodisa) va voqealar ──────────────────────────────────────────────────────────
let sanoq = new Map() // komponent uid → render soni
let tetiklar = new Set() // shu to'plamda o'zgargan tugunlar
let sabablar = new Map() // uid → [{ label, old, new }] yoki { computed: true }
let yuborilgan = new Set() // shu to'plamda 'set' voqeasi yuborilgan tugunlar
let app = null

const ekran = domKuzatuvchi(document.getElementById('app'))
const keyingi = toplam((b) => {
  // o'zgarish xabari kelgan, lekin qayta chizilmagan komponentlar: masalan computed qayta hisoblandi,
  // ammo qiymati o'zgarmadi (Vue 3.4+) — render o'tkazib yuborildi
  for (const [uid, list] of sabablar) {
    const inst = komponentlar().find((i) => i.uid === uid)
    if (inst) ev({ k: 'skip', id: uid, name: nomi(inst), reasons: list.filter((s) => !s.computed) })
  }
  sabablar = new Map()
  tetiklar = new Set()
  yuborilgan = new Set()
  surat()
  ekran(b)
})
const ev = (e) => yubor({ t: 'ev', b: keyingi(), ...e })

function tetik(e) {
  if (!e.target) return
  const n = tugun(e.target, e.key)
  tetiklar.add(n.id)
  // bitta o'zgarish har obunachining onTrigger'ida qayta keladi — bir marta yozamiz
  const kalit = `${n.id}|${kor(e.newValue)}|${kor(e.oldValue)}`
  if (n.kind === 'props' || yuborilgan.has(kalit)) return n
  yuborilgan.add(kalit)
  nomlarniYangila()
  ev({ k: 'set', node: n.id, kind: n.kind, label: yorliq(n), turi: e.type, old: kor(e.oldValue), new: kor(e.newValue) })
  return n
}

// ── computed / watch o'ramlari: foydalanuvchi kodi shu versiyalarni oladi ─────────────────────
function labComputed(g, dbg) {
  const get = typeof g === 'function' ? g : g.get
  let c
  const wrapped = (old) => {
    deps.set(`r${oid(c)}`, new Set())
    const v = get(old)
    nomlarniYangila()
    const id = `r${oid(c)}`
    ev({ k: 'compute', node: id, label: nomlar.get(c) ?? 'computed', value: kor(v), birinchi: !obunachilar.get(id)?.hisoblangan, ozgardi: !Object.is(v, old) })
    obunachilar.set(id, { id, kind: 'computed', hisoblangan: true })
    return v
  }
  c = Vue.computed(typeof g === 'function' ? wrapped : { get: wrapped, set: g.set }, {
    onTrack(e) {
      const s = deps.get(`r${oid(c)}`) ?? new Set()
      deps.set(`r${oid(c)}`, s.add(tugun(e.target, e.key).id))
      dbg?.onTrack?.(e)
    },
    onTrigger(e) {
      tetik(e)
      tetiklar.add(`r${oid(c)}`)
      dbg?.onTrigger?.(e)
    },
  })
  computeds.add(c)
  obunachilar.set(`r${oid(c)}`, { id: `r${oid(c)}`, kind: 'computed' })
  return c
}

let wSeq = 0
function kuzatuvchi(kind, opts = {}) {
  const id = `w${++wSeq}`
  const label = `${kind} #${wSeq}`
  obunachilar.set(id, { id, kind: 'watch', label })
  deps.set(id, new Set())
  return {
    id,
    label,
    opts: {
      ...opts,
      onTrack(e) {
        deps.get(id).add(tugun(e.target, e.key).id)
        opts.onTrack?.(e)
      },
      onTrigger(e) {
        tetik(e)
        opts.onTrigger?.(e)
      },
    },
    run: () => ev({ k: 'watch', node: id, label }),
  }
}
function labWatch(source, cb, opts) {
  const w = kuzatuvchi('watch', opts)
  return Vue.watch(source, (...a) => (w.run(), cb(...a)), w.opts)
}
function labWatchEffect(fn, opts) {
  const w = kuzatuvchi('watchEffect', opts)
  return Vue.watchEffect((...a) => (deps.set(w.id, new Set()), w.run(), fn(...a)), w.opts)
}

// ── komponent daraxti ───────────────────────────────────────────────────────────────────────────
const nomi = (i) => i.type.__name || i.type.name || i.type.__file?.replace(/\.vue$/, '') || 'Anonim'
// kutubxonaning o'z komponentlari (RouterLink, RouterView) yangi boshlovchini chalg'itadi — ko'rsatilmaydi
const YASHIRIN = new Set(['RouterLink', 'RouterView'])
const yashirin = (i) => YASHIRIN.has(i.type.name)
const otasi = (i) => { let p = i.parent; while (p && yashirin(p)) p = p.parent; return p }
function bolalar(vnode, out) {
  if (!vnode) return out
  if (vnode.component) out.push(vnode.component)
  else if (vnode.suspense) bolalar(vnode.suspense.activeBranch, out)
  else if (Array.isArray(vnode.children)) for (const c of vnode.children) bolalar(c, out)
  return out
}
function komponentlar(inst = app?._instance, out = []) {
  if (!inst) return out
  if (!yashirin(inst)) out.push(inst)
  for (const c of bolalar(inst.subTree, [])) komponentlar(c, out)
  return out
}
function holati(inst) {
  const out = []
  for (const [k, v] of Object.entries(inst.devtoolsRawSetupState ?? {})) {
    if (typeof v === 'function' || (v && typeof v === 'object' && !isRef(v) && !isProxy(v))) continue
    out.push([k, isRef(v) ? kor(v._value ?? v.value) : kor(v), computeds.has(v) ? 'computed' : isRef(v) ? 'ref' : isProxy(v) ? 'reactive' : ''])
  }
  return out
}
function surat() {
  nomlarniYangila()
  const list = komponentlar()
  const tirik = new Set(list.map((i) => `c${i.uid}`))
  yubor({
    t: 'daraxt',
    storlar: [...storlar.values()].map((st) => storSurati(st, computeds)),
    nodes: list.map((i) => ({
      id: i.uid,
      name: nomi(i),
      parent: otasi(i) && list.includes(otasi(i)) ? otasi(i).uid : null,
      renders: sanoq.get(i.uid) ?? 0,
      props: Object.entries(toRaw(i.props)).map(([k, v]) => [k, kor(v)]),
      state: holati(i),
      deps: [...(deps.get(`c${i.uid}`) ?? [])].map((d) => tugunlar.get(d)).filter((n) => n && n.kind !== 'props').map(yorliq),
    })),
  })
  // reaktivlik grafi: manbalar → computed/watch → komponentlar
  const ishlatilgan = new Set()
  const edges = []
  const subs = []
  for (const [sid, set] of deps) {
    if (sid.startsWith('c') && !tirik.has(sid)) continue
    let any = false
    for (const d of set) {
      const n = tugunlar.get(d)
      if (!n || n.kind === 'props') continue
      edges.push([d, sid])
      ishlatilgan.add(d)
      any = true
    }
    if (any || sid.startsWith('c')) subs.push(sid)
  }
  const nodes = []
  for (const d of ishlatilgan) {
    const n = tugunlar.get(d)
    nodes.push({ id: d, kind: n.kind, label: yorliq(n), value: qiymat(n) })
  }
  for (const sid of subs) {
    if (nodes.some((n) => n.id === sid)) continue
    if (sid.startsWith('c')) {
      const inst = list.find((i) => `c${i.uid}` === sid)
      nodes.push({ id: sid, kind: 'component', label: inst ? nomi(inst) : '?' })
    } else {
      const o = obunachilar.get(sid)
      const n = tugunlar.get(sid)
      nodes.push({ id: sid, kind: o?.kind ?? 'computed', label: n ? yorliq(n) : o?.label ?? sid, value: n ? qiymat(n) : undefined })
    }
  }
  yubor({ t: 'graf', nodes, edges })
}

// Har komponentga: render boshlanishi (bog'liqliklar qaytadan yig'iladi), kuzatish, sabab va render soni.
// Voqealar beforeMount/beforeUpdate'da yoziladi — ular otadan bolaga tartibda keladi (mounted/updated esa teskari).
const mixin = {
  beforeMount() {
    if (yashirin(this.$)) return // kutubxona komponentlari kuzatilmaydi
    propsRaw.set(toRaw(this.$.props), nomi(this.$))
    deps.set(`c${this.$.uid}`, new Set())
    sanoq.set(this.$.uid, 0)
    ev({ k: 'mount', id: this.$.uid, name: nomi(this.$) })
  },
  beforeUpdate() {
    if (yashirin(this.$)) return
    const uid = this.$.uid
    sanoq.set(uid, (sanoq.get(uid) ?? 0) + 1)
    let list = sabablar.get(uid) ?? []
    sabablar.delete(uid)
    if (list.some((s) => s.computed)) {
      // computed orqali kelgan o'zgarish: komponent oldingi render'da o'qigan computed'lardan shu to'plamda o'zgarganlari
      const prev = list.filter((s) => !s.computed)
      const cs = [...(deps.get(`c${uid}`) ?? [])].filter((d) => tetiklar.has(d) && tugunlar.get(d)?.kind === 'computed')
      list = [...prev, ...cs.map((d) => ({ label: yorliq(tugunlar.get(d)), new: qiymat(tugunlar.get(d)), computed: true }))]
    }
    const seen = new Set()
    list = list.filter((s) => !seen.has(s.label) && seen.add(s.label))
    ev({ k: 'render', id: uid, name: nomi(this.$), n: sanoq.get(uid), reasons: list.length ? list : [{ ota: true }] })
    deps.set(`c${uid}`, new Set())
  },
  renderTracked(e) {
    if (yashirin(this.$)) return
    deps.get(`c${this.$.uid}`)?.add(tugun(e.target, e.key).id)
  },
  renderTriggered(e) {
    if (yashirin(this.$)) return
    const list = sabablar.get(this.$.uid) ?? []
    if (e.target) {
      const n = tetik(e)
      list.push({ label: yorliq(n), old: kor(e.oldValue), new: kor(e.newValue), props: n.kind === 'props' })
    } else list.push({ computed: true })
    sabablar.set(this.$.uid, list)
  },
  unmounted() {
    if (yashirin(this.$)) return
    ev({ k: 'unmount', id: this.$.uid, name: nomi(this.$) })
    deps.delete(`c${this.$.uid}`)
  },
}

// ── kompilyatsiya ───────────────────────────────────────────────────────────────────────────────
let hashN = 0
function kompil(name, src) {
  if (!name.endsWith('.vue')) return src
  const { descriptor, errors } = parse(src, { filename: name })
  if (errors.length) throw new Error(errors[0].message)
  const id = `l${++hashN}`
  const scoped = descriptor.styles.some((s) => s.scoped)
  let code = 'const __sfc__ = {}'
  let bindings
  if (descriptor.script || descriptor.scriptSetup) {
    const s = compileScript(descriptor, { id, inlineTemplate: false, genDefaultAs: '__sfc__' })
    code = s.content
    bindings = s.bindings
  }
  if (descriptor.template) {
    const t = compileTemplate({
      source: descriptor.template.content,
      filename: name,
      id,
      scoped,
      slotted: descriptor.slotted,
      compilerOptions: { bindingMetadata: bindings, scopeId: scoped ? `data-v-${id}` : undefined },
    })
    if (t.errors.length) throw new Error(typeof t.errors[0] === 'string' ? t.errors[0] : t.errors[0].message)
    code += '\n' + t.code.replace(/\nexport (function|const) (render|ssrRender)/, '\n$1 render') + '\n__sfc__.render = render'
  }
  for (const st of descriptor.styles) {
    const r = compileStyle({ source: st.content, filename: name, id: `data-v-${id}`, scoped: st.scoped })
    const el = document.createElement('style')
    el.textContent = r.code
    document.head.append(el)
  }
  const base = name.replace(/\.vue$/, '').split('/').pop()
  code += `\n__sfc__.__file = ${JSON.stringify(name)}\nif (!__sfc__.__name && !__sfc__.name) __sfc__.__name = ${JSON.stringify(base)}`
  if (scoped) code += `\n__sfc__.__scopeId = "data-v-${id}"`
  return code + '\nexport default __sfc__'
}

VueLab.ilgak.computed = labComputed
const shim = { ...VueLab, watch: labWatch, watchEffect: labWatchEffect }
const yol = routerShim(ev)

konsolniUlash(keyingi)
tingla(async (fayllar, kirish) => {
  const m = modullar(fayllar, kompil, { vue: shim, pinia: Pinia, 'vue-router': yol.mod })
  eksport = m.eksport
  app = Vue.createApp(m.yukla(kirish).default)
  app.mixin(mixin)
  // Pinia har doim o'rnatilgan (main.js o'rniga); router — `router.js` fayli bo'lsa, uning default eksporti
  const p = piniaYarat(ev)
  storlar = p.storlar
  app.use(p.pinia)
  const routerFayli = Object.keys(fayllar).find((f) => /(^|\/)router(\/index)?\.js$/.test(f))
  if (routerFayli) {
    app.use(m.yukla(routerFayli).default)
    yubor({ t: 'yollar', list: yollarJadvali(yol.holat.router) })
  }
  app.config.errorHandler = (err, inst, info) => {
    console.error(err)
    yubor({ t: 'error', phase: 'runtime', message: `${err?.message ?? err} (${inst ? nomi(inst.$) : ''}, ${info})` })
  }
  app.config.warnHandler = (msg) => yubor({ t: 'log', level: 'warn', text: `[Vue] ${msg}` })
  if (yol.holat.router) await yol.holat.router.isReady()
  app.mount('#app')
  yubor({ t: 'ishga' })
}, {
  // ota sahifadagi manzil satri: o'tish, orqaga, oldinga
  yol(m) {
    const r = yol.holat.router
    if (!r) return
    if (m.amal === 'push') r.push(m.path)
    if (m.amal === 'back') r.back()
    if (m.amal === 'forward') r.forward()
  },
})
