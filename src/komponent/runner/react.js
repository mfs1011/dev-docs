// React ishga tushiruvchisi (iframe ichida). Haqiqiy React 19. Har commit'dan keyin React DevTools
// ilgagi (`__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot`) orqali fiber daraxti o'qiladi: qaysi komponent
// chizildi, qaysi biri o'tkazib yuborildi (memo) va nega — props, state yoki context o'zgardi yoki ota chizildi.
// JSX va import'lar brauzerda sucrase bilan o'giriladi.
import './natija.css'
import { domKuzatuvchi, konsolniUlash, kor, modullar, tingla, toplam, yubor } from './umumiy.js'

// ── state nomlari: `const [count, setCount] = useState(…)` → setter orqali hook'ni taniymiz ────
const setterNomi = new WeakMap() // React'ning asl setter'i → state nomi
const orama = new WeakMap() // asl setter → jurnalga yozuvchi o'rama (barqaror identifikator)

// ── fiber daraxti ───────────────────────────────────────────────────────────────────────────────
const KOMP = new Set([0, 1, 11, 14, 15]) // Function, Class, ForwardRef, Memo, SimpleMemo
const PERFORMED_WORK = 1
const fIds = new WeakMap()
let fSeq = 0
// fiber va uning alternate'i bitta komponent nusxasi — bitta id
function fid(f) {
  const id = fIds.get(f) ?? (f.alternate && fIds.get(f.alternate))
  if (id) {
    fIds.set(f, id)
    return id
  }
  fIds.set(f, ++fSeq)
  return fSeq
}
function turi(f) {
  let t = f.type
  if (f.tag === 14 || f.tag === 15) t = t?.type ?? t
  if (t?.render) t = t.render
  return t
}
const nomi = (f) => f.type?.displayName || turi(f)?.displayName || turi(f)?.name || 'Anonim'
// MemoComponent (14) ichida alohida fiber bor — daraxtda bitta tugun bo'lsin
const korinadi = (f) => KOMP.has(f.tag) && f.tag !== 14 && !turi(f)?.__lab
const memomi = (f) => f.tag === 15 || f.return?.tag === 14

const sanoq = new Map()
let holat = new Map() // fid → 'mount' | 'render' | 'skip'
let sabab = new Map()

function propsFarqi(prev, next) {
  const out = []
  const keys = new Set([...Object.keys(prev ?? {}), ...Object.keys(next ?? {})])
  for (const k of keys) {
    const a = prev?.[k], b = next?.[k]
    if (Object.is(a, b)) continue
    let tur = 'qiymat'
    if (typeof b === 'function') tur = 'funksiya'
    else if (k === 'children' || b?.$$typeof) tur = 'element'
    else if (b && typeof b === 'object') tur = 'obyekt'
    out.push({ props: true, label: `props.${k}`, tur, old: kor(a), new: kor(b) })
  }
  return out
}
function stateFarqi(f, p) {
  const out = []
  if (f.tag === 1) {
    if (f.memoizedState !== p.memoizedState) out.push({ label: 'this.state', old: kor(p.memoizedState), new: kor(f.memoizedState) })
    return out
  }
  let h = f.memoizedState, q = p.memoizedState
  while (h && q) {
    if (h.queue?.dispatch && !Object.is(h.memoizedState, q.memoizedState)) {
      out.push({ label: setterNomi.get(h.queue.dispatch) ?? 'state', old: kor(q.memoizedState), new: kor(h.memoizedState) })
    }
    // useSyncExternalStore (Zustand, TanStack Query): tashqi ombordan olingan qiymat o'zgardi
    if (h.queue && 'getSnapshot' in h.queue && !h.queue.dispatch && !Object.is(h.memoizedState, q.memoizedState)) {
      const sorov = (v) => v && typeof v === 'object' && 'fetchStatus' in v
      const qiy = (v) => (sorov(v) ? `${v.status}, ${v.fetchStatus}` : kor(v))
      out.push({ label: sorov(h.memoizedState) ? 'useQuery natijasi' : 'ombor tanlovi', tashqi: true, old: qiy(q.memoizedState), new: qiy(h.memoizedState) })
    }
    h = h.next
    q = q.next
  }
  return out
}
function contextFarqi(f, p) {
  const out = []
  let d = f.dependencies?.firstContext, e = p.dependencies?.firstContext
  while (d) {
    if (e && !Object.is(d.memoizedValue, e.memoizedValue)) out.push({ context: true, label: d.context.displayName ?? 'Context', new: kor(d.memoizedValue) })
    d = d.next
    e = e?.next
  }
  return out
}

// React DevTools'dagi kabi: oldingi va yangi daraxt parallel yuriladi; bolalar ko'rsatkichi o'zgarmagan
// bo'lsa — butun shox tegilmagan (render ham, bailout ham bo'lmagan)
function yur(next, prev, otaChizildi) {
  let ota = otaChizildi
  if (korinadi(next)) {
    const id = fid(next)
    if (!prev) {
      holat.set(id, 'mount')
      ota = true
    } else if (next.flags & PERFORMED_WORK) {
      holat.set(id, 'render')
      const st = [...stateFarqi(next, prev), ...contextFarqi(next, prev)]
      let pr = next.memoizedProps !== prev.memoizedProps ? propsFarqi(prev.memoizedProps, next.memoizedProps) : []
      const list = [...st, ...pr]
      if (!list.length) list.push(otaChizildi ? { ota: true } : { ozi: true })
      else if (!st.length && otaChizildi && pr.every((x) => x.tur !== 'qiymat')) list.push({ ota: true })
      sabab.set(id, list)
      ota = true
    } else {
      if (otaChizildi) holat.set(id, 'skip')
      ota = false
    }
  }
  if (prev && next.child === prev.child) return
  for (let c = next.child; c; c = c.sibling) yur(c, prev ? c.alternate : null, ota)
}

function daraxt(root) {
  const nodes = []
  const walk = (f, parent) => {
    for (let c = f; c; c = c.sibling) {
      let p = parent
      if (korinadi(c)) {
        const id = fid(c)
        const hooks = []
        if (c.tag !== 1) {
          for (let h = c.memoizedState; h; h = h.next) if (h.queue?.dispatch) hooks.push([setterNomi.get(h.queue.dispatch) ?? 'state', kor(h.memoizedState), 'state'])
        } else if (c.memoizedState) hooks.push(['this.state', kor(c.memoizedState), 'state'])
        nodes.push({
          id,
          name: nomi(c),
          parent,
          memo: memomi(c),
          renders: sanoq.get(id) ?? 0,
          props: Object.entries(c.memoizedProps ?? {}).map(([k, v]) => [k, kor(v)]),
          state: hooks,
          effektlar: [...(lab.ef?.sanoq ?? [])].filter(([k]) => k.startsWith(`${nomi(c)}:`)).map(([k, v]) => ({ qator: +k.split(':')[1], ...v })),
        })
        p = id
      }
      walk(c.child, p)
    }
  }
  walk(root.current.child, null)
  return nodes
}

const ekran = domKuzatuvchi(document.getElementById('app'))
// passiv effektlar (useEffect) commit'dan keyin alohida vazifada ishlaydi — to'plam biroz kechroq yopiladi
const lab = {} // kutubxona o'ramlari (React yuklangach to'ldiriladi)
const keyingi = toplam((b) => ekran(b), 40)
const ev = (e) => yubor({ t: 'ev', b: keyingi(), ...e })

window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
  renderers: new Map(),
  supportsFiber: true,
  isDisabled: false,
  inject(r) {
    const id = this.renderers.size + 1
    this.renderers.set(id, r)
    return id
  },
  checkDCE() {},
  onScheduleFiberRoot() {},
  onCommitFiberUnmount(_id, f) {
    if (korinadi(f) && fIds.has(f)) ev({ k: 'unmount', id: fid(f), name: nomi(f) })
  },
  onPostCommitFiberRoot() {},
  onCommitFiberRoot(_id, root) {
    holat = new Map()
    sabab = new Map()
    yur(root.current, root.current.alternate, false)
    const nodes = daraxt(root)
    for (const n of nodes) {
      const h = holat.get(n.id)
      if (h === 'mount') ev({ k: 'mount', id: n.id, name: n.name })
      if (h === 'render') {
        sanoq.set(n.id, (sanoq.get(n.id) ?? 0) + 1)
        n.renders = sanoq.get(n.id)
        ev({ k: 'render', id: n.id, name: n.name, n: n.renders, memo: n.memo, reasons: sabab.get(n.id) })
      }
      if (h === 'skip') ev({ k: 'skip', id: n.id, name: n.name, memo: n.memo })
    }
    yubor({ t: 'daraxt', nodes, omborlar: lab.zs?.surat() ?? [] })
  },
}

// `import` hoisting'i hook'dan oldin React'ni yuklab qo'ymasligi uchun — dinamik
Promise.all([import('react'), import('react/jsx-runtime'), import('react-dom'), import('react-dom/client'), import('./react-kutubxona.js'), import('zustand/react/shallow')]).then(([React, jsx, ReactDOM, ReactDOMClient, K, zShallow]) => {
  // nomlar: [state nomi, setter nomi] — manbadan olinadi (nomla)
  function useState(nomlar, init) {
    const r = React.useState(init)
    return [r[0], yozuvchi(r[1], nomlar)]
  }
  function useReducer(nomlar, reducer, init, initFn) {
    const r = React.useReducer(reducer, init, initFn)
    return [r[0], yozuvchi(r[1], nomlar)]
  }
  function yozuvchi(asl, [name, setter]) {
    if (!orama.has(asl)) {
      setterNomi.set(asl, name)
      orama.set(asl, (v) => {
        ev({ k: 'set', label: name, setter, new: typeof v === 'function' ? `${kor(v)} (yangilovchi funksiya)` : kor(v) })
        asl(v)
      })
    }
    return orama.get(asl)
  }
  lab.ef = K.effektlar(React, ev)
  window.__lab = { useState, useReducer, useEffect: lab.ef.useEffect, useLayoutEffect: lab.ef.useLayoutEffect, omborNomi: null }
  lab.zs = K.zustandShim(ev, window.__lab)
  window.__lab.tanla = lab.zs.tanla
  K.soxtaServer(ev)
  const query = K.queryShim(ev, yubor)

  // `const [a, setA] = useState(` → `const [a, setA] = __lab.useState("a", ` (state'ga nom beriladi)
  const nomla = (src) =>
    src.replace(/(\[\s*([A-Za-z_$][\w$]*)\s*,\s*([A-Za-z_$][\w$]*)\s*\]\s*=\s*)(?:React\.)?(useState|useReducer)\s*\(\s*(\)?)/g, (_m, pre, nom, setter, hook, yopiq) =>
      `${pre}__lab.${hook}(${JSON.stringify([nom, setter])}${yopiq ? ')' : ', '}`)

  const reactShim = { ...React, default: React }

  class Chegara extends React.Component {
    static __lab = true
    state = { xato: null }
    static getDerivedStateFromError(xato) {
      return { xato }
    }
    componentDidCatch(err) {
      yubor({ t: 'error', phase: 'runtime', message: err?.message ?? String(err) })
    }
    render() {
      return this.state.xato ? React.createElement('pre', { className: 'lab-xato' }, String(this.state.xato.message)) : this.props.children
    }
  }

  konsolniUlash(keyingi)
  tingla(async (fayllar, kirish) => {
    const hooklar = K.omborNomlari(fayllar)
    const m = modullar(fayllar, (_name, src) => K.belgila(nomla(src), hooklar), {
      react: reactShim,
      'react/jsx-runtime': jsx,
      'react/jsx-dev-runtime': jsx,
      'react-dom': ReactDOM,
      'react-dom/client': ReactDOMClient,
      zustand: lab.zs.mod,
      'zustand/react/shallow': zShallow,
      '@tanstack/react-query': query,
    }, ['jsx'])
    const App = m.yukla(kirish).default
    const root = ReactDOMClient.createRoot(document.getElementById('app'))
    root.render(React.createElement(Chegara, null, React.createElement(App)))
    yubor({ t: 'ishga' })
  })
})
