// React natija oynasi uchun kutubxonalar kuzatuvi: useEffect (bog'liqliklar va tozalash), Zustand (action, set,
// selector'lar), TanStack Query (kesh holatlari — rasmiy QueryCache.subscribe) va soxta /api server.
// Manba kodga nom va joy belgilari qo'shiladi (manbaniBelgila): effekt qaysi komponentda, bog'liqliklari nomi.
import * as Z from 'zustand'
import * as RQ from '@tanstack/react-query'
import { kor } from './umumiy.js'

// ── manba kodini belgilash ────────────────────────────────────────────────────────────────────────
// `(` dan boshlab mos `)` gacha: argumentlar matni (satr, shablon, qavslar hisobga olinadi)
function argumentlar(src, i) {
  const args = []
  let d = 0, bosh = i + 1, q = null
  for (let j = i; j < src.length; j++) {
    const ch = src[j]
    if (q) {
      if (ch === '\\') j++
      else if (ch === q) q = null
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') q = ch
    else if ('([{'.includes(ch)) d++
    else if (')]}'.includes(ch)) {
      d--
      if (d === 0) {
        args.push(src.slice(bosh, j).trim())
        return { args: args.filter(Boolean), oxiri: j }
      }
    } else if (ch === ',' && d === 1) {
      args.push(src.slice(bosh, j).trim())
      bosh = j + 1
    }
  }
  return { args, oxiri: src.length }
}
const qatori = (src, i) => src.slice(0, i).split('\n').length
// eng yaqin oldingi komponent: `function Nom(` yoki `const Nom = (` / `memo(function Nom(`
function komponenti(src, i) {
  let nom = null
  for (const m of src.slice(0, i).matchAll(/(?:function\s+([A-Z][\w$]*)\s*\(|const\s+([A-Z][\w$]*)\s*=\s*(?:memo\(\s*)?(?:\([^)]*\)|[\w$]+)\s*=>)/g)) nom = m[1] ?? m[2]
  return nom
}

export function manbaniBelgila(src) {
  const almash = []
  // useEffect / useLayoutEffect
  for (const m of src.matchAll(/\b(?:React\.)?(useEffect|useLayoutEffect)\s*\(/g)) {
    const qavs = m.index + m[0].length - 1
    const { args } = argumentlar(src, qavs)
    const depsMatn = args.length > 1 ? args.at(-1) : null
    const deps = depsMatn?.startsWith('[') ? argumentlar(depsMatn.replace(/^\[/, '(').replace(/\]$/, ')'), 0).args : null
    const info = { komp: komponenti(src, m.index), qator: qatori(src, m.index), deps, depsMatn }
    almash.push([m.index, qavs + 1, `__lab.${m[1]}(${JSON.stringify(info)}, `])
  }
  // Zustand: `const useSavat = create(` → `const useSavat = (__lab.omborNomi = "useSavat", create)(` (ombor nomi)
  const omborlar = []
  for (const m of src.matchAll(/\b(?:const|let)\s+([\w$]+)\s*=\s*create\b/g)) {
    omborlar.push(m[1])
    const c = m.index + m[0].length - 'create'.length
    almash.push([c, c + 'create'.length, `(__lab.omborNomi = ${JSON.stringify(m[1])}, create)`])
  }
  return { almash, omborlar }
}

// Barcha fayllardagi ombor hook'lari (useSavat(...)) chaqiruvi → __lab.tanla({komp, matn}, useSavat, ...)
export function belgila(src, omborHooklari) {
  const { almash } = manbaniBelgila(src)
  if (omborHooklari.length) {
    const re = new RegExp(`\\b(${omborHooklari.map((h) => h.replace(/\$/g, '\\$')).join('|')})\\s*\\(`, 'g')
    for (const m of src.matchAll(re)) {
      if (/[.\w$]$/.test(src.slice(m.index - 1, m.index))) continue
      const qavs = m.index + m[0].length - 1
      const { args } = argumentlar(src, qavs)
      const info = { komp: komponenti(src, m.index), matn: args[0] ?? null }
      almash.push([m.index, qavs + 1, `__lab.tanla(${JSON.stringify(info)}, ${m[1]}${args.length ? ', ' : ''}`])
    }
  }
  let out = src
  for (const [a, b, t] of almash.sort((x, y) => y[0] - x[0])) out = out.slice(0, a) + t + out.slice(b)
  return out
}
export const omborNomlari = (fayllar) => Object.values(fayllar).flatMap((s) => [...s.matchAll(/\b(?:const|let)\s+([\w$]+)\s*=\s*create\s*(?:<[^>]*>)?\s*\(/g)].map((m) => m[1]))

// ── useEffect ─────────────────────────────────────────────────────────────────────────────────────
// https://react.dev/learn/lifecycle-of-reactive-effects
export function effektlar(React, ev) {
  const sanoq = new Map() // `${komp}:${qator}` → { ishladi, tozalandi }
  const hisob = (k, f) => sanoq.set(k, { ishladi: 0, tozalandi: 0, ...sanoq.get(k), [f]: (sanoq.get(k)?.[f] ?? 0) + 1 })
  function orama(asl, tur) {
    return (info, fn, deps) => {
      const oldingi = React.useRef(null)
      const kalit = `${info.komp}:${info.qator}`
      return asl(() => {
        const p = oldingi.current
        const ozgargan = deps && p ? deps.map((d, i) => (Object.is(d, p[i]) ? null : { nom: info.deps?.[i] ?? `#${i + 1}`, old: kor(p[i]), new: kor(d) })).filter(Boolean) : null
        oldingi.current = deps ?? null
        hisob(kalit, 'ishladi')
        ev({ k: 'effect', tur, komp: info.komp, qator: info.qator, depsMatn: info.depsMatn, birinchi: !p, ozgargan, depsYoq: !deps, n: sanoq.get(kalit).ishladi })
        const tozala = fn()
        if (typeof tozala !== 'function') return tozala
        return () => {
          hisob(kalit, 'tozalandi')
          ev({ k: 'cleanup', tur, komp: info.komp, qator: info.qator, depsMatn: info.depsMatn })
          tozala()
        }
      }, deps)
    }
  }
  return { useEffect: orama(React.useEffect, 'useEffect'), useLayoutEffect: orama(React.useLayoutEffect, 'useLayoutEffect'), sanoq }
}

// ── Zustand ───────────────────────────────────────────────────────────────────────────────────────
// https://zustand.docs.pmnd.rs/ — set chaqirilganda har komponent selector'i qayta hisoblanadi va natija
// avvalgisi bilan Object.is bilan solishtiriladi: teng bo'lsa — qayta chizilmaydi
export function zustandShim(ev, lab) {
  const omborlar = new Map() // nom → { api, tanlovlar }
  function create(init) {
    if (init === undefined) return create // create()(…) ko'rinishi
    const nom = lab.omborNomi ?? `ombor${omborlar.size + 1}`
    lab.omborNomi = null
    const tanlovlar = new Map()
    const useStore = Z.create((set, get, api) => {
      const kuzatSet = (partial, replace) => {
        const oldin = api.getState()
        set(partial, replace)
        const keyin = api.getState()
        const ozgargan = Object.keys({ ...oldin, ...keyin }).filter((k) => typeof keyin[k] !== 'function' && !Object.is(oldin[k], keyin[k])).map((k) => ({ k, old: kor(oldin[k]), new: kor(keyin[k]) }))
        ev({ k: 'zset', store: nom, ozgargan })
        for (const t of tanlovlar.values()) {
          if (t.shallow) continue // useShallow o'z xotirasiga ega — tashqaridan chaqirilmaydi
          let v
          try {
            v = t.fn(keyin)
          } catch {
            continue
          }
          const butun = t.matn === '(butun ombor)'
          ev({ k: 'tanlov', store: nom, komp: t.komp, matn: t.matn, old: butun ? 'eski obyekt' : kor(t.val), new: butun ? 'yangi obyekt' : kor(v), teng: Object.is(t.val, v) })
        }
      }
      const st = init(kuzatSet, get, api)
      for (const [k, v] of Object.entries(st)) {
        // onClick={amal} bo'lsa birinchi argument — React hodisasi; u ko'rsatilmaydi
        if (typeof v === 'function') st[k] = (...a) => (ev({ k: 'zaction', store: nom, name: k, args: a.filter((x) => !x?.nativeEvent && !(x instanceof Event)).map((x) => kor(x)).join(', ') }), v(...a))
      }
      return st
    })
    omborlar.set(nom, { api: useStore, tanlovlar })
    const hook = (sel, ...rest) => useStore(sel, ...rest)
    Object.assign(hook, useStore)
    hook.__lab = { nom, useStore, tanlovlar }
    return hook
  }
  // komponent ichidagi `useSavat(selector)` — kim nimani tanlayotganini yozib boradi
  function tanla(info, hook, sel, ...rest) {
    const v = hook(sel, ...rest)
    const l = hook.__lab
    if (l) {
      const kalit = `${info.komp}|${info.matn ?? '(butun ombor)'}`
      l.tanlovlar.set(kalit, { komp: info.komp, matn: info.matn ?? '(butun ombor)', fn: sel ?? ((s) => s), shallow: /useShallow/.test(info.matn ?? ''), val: v })
    }
    return v
  }
  const surat = () => [...omborlar].map(([nom, o]) => ({
    nom,
    state: Object.entries(o.api.getState()).filter(([, v]) => typeof v !== 'function').map(([k, v]) => [k, kor(v)]),
    actions: Object.entries(o.api.getState()).filter(([, v]) => typeof v === 'function').map(([k]) => k),
    tanlovlar: [...o.tanlovlar.values()].map((t) => ({ komp: t.komp, matn: t.matn, val: kor(t.val) })),
  }))
  return { mod: { ...Z, create }, tanla, surat }
}

// ── TanStack Query va soxta server ────────────────────────────────────────────────────────────────
// https://tanstack.com/query/latest/docs/reference/QueryCache#querycachesubscribe
const MALUMOT = {
  '/api/vazifalar': [
    { id: 1, matn: 'Vue bobini o‘qish', bajarildi: true },
    { id: 2, matn: 'React mashqini bajarish', bajarildi: false },
    { id: 3, matn: 'Pinia’ni sinash', bajarildi: false },
  ],
  '/api/foydalanuvchi': { id: 1, ism: 'Ali', shahar: 'Toshkent' },
}
export function soxtaServer(ev) {
  const asl = window.fetch.bind(window)
  let n = 0
  window.fetch = async (url, opts) => {
    const u = String(url)
    if (!u.startsWith('/api/')) return asl(url, opts)
    const id = ++n
    const t0 = performance.now()
    ev({ k: 'tarmoq', faza: 'yuborildi', id, url: u })
    await new Promise((r) => setTimeout(r, 900))
    const yol = u.split('?')[0]
    const data = MALUMOT[yol] ?? MALUMOT[yol.replace(/\/\d+$/, '')]
    ev({ k: 'tarmoq', faza: 'keldi', id, url: u, ms: Math.round(performance.now() - t0), ok: !!data })
    return new Response(JSON.stringify(data ?? { xato: 'topilmadi' }), { status: data ? 200 : 404, headers: { 'Content-Type': 'application/json' } })
  }
}

export function queryShim(ev, yubor) {
  const mijozlar = []
  const surat = () => mijozlar.flatMap((c) => c.getQueryCache().getAll().map((q) => ({
    kalit: JSON.stringify(q.queryKey),
    status: q.state.status,
    fetchStatus: q.state.fetchStatus,
    eskirgan: q.isStale(),
    kuzatuvchi: q.getObserversCount(),
    data: kor(q.state.data),
    yangilangan: q.state.dataUpdatedAt,
    staleTime: q.observers[0]?.options.staleTime ?? c.getDefaultOptions().queries?.staleTime ?? 0,
    gcTime: q.options.gcTime ?? 300000,
    hozir: Date.now(),
  })))
  class QueryClient extends RQ.QueryClient {
    constructor(o) {
      super(o)
      mijozlar.push(this)
      this.getQueryCache().subscribe((e) => {
        const kalit = JSON.stringify(e.query.queryKey)
        if (e.type === 'updated' && ['fetch', 'success', 'error', 'invalidate'].includes(e.action.type)) ev({ k: 'kesh', kalit, amal: e.action.type })
        if (e.type === 'added' || e.type === 'removed') ev({ k: 'kesh', kalit, amal: e.type })
        if (e.type === 'observerAdded' || e.type === 'observerRemoved') ev({ k: 'kesh', kalit, amal: e.type, kuzatuvchi: e.query.getObserversCount() })
        yubor({ t: 'kesh', list: surat() })
      })
    }
  }
  // vaqt o'tishi bilan «yangi → eskirgan» va tozalanish hisoblagichi o'zgaradi — har 0,5 s holat
  setInterval(() => mijozlar.length && yubor({ t: 'kesh', list: surat() }), 500)
  return { ...RQ, QueryClient }
}
