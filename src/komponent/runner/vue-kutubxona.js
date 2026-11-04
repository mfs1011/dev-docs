// Vue natija oynasi uchun kutubxonalar kuzatuvi: Pinia (rasmiy `$onAction`, `$subscribe`, plugin API) va
// Vue Router (guard'lar o'ralib, har biri nima qaytargani yoziladi; tarix — xotirada, iframe URL'i o'zgarmaydi).
import * as Pinia from 'pinia'
import * as VueRouter from 'vue-router-lab'
import { getCurrentInstance, toRaw } from './vue-lab.js'
import { kor } from './umumiy.js'

// ── Pinia ─────────────────────────────────────────────────────────────────────────────────────────
// https://pinia.vuejs.org/core-concepts/actions.html#Subscribing-to-actions
export function piniaYarat(ev) {
  const pinia = Pinia.createPinia()
  const storlar = new Map()
  pinia.use(({ store }) => {
    storlar.set(store.$id, store)
    store.$onAction(({ name, args, after, onError }) => {
      const t0 = performance.now()
      ev({ k: 'action', store: store.$id, name, args: args.map((a) => kor(a)).join(', ') })
      after((r) => ev({ k: 'actionTugadi', store: store.$id, name, natija: r === undefined ? null : kor(r), ms: +(performance.now() - t0).toFixed(1) }))
      onError((e) => ev({ k: 'actionXato', store: store.$id, name, xato: e?.message ?? String(e) }))
    })
    // to'g'ridan-to'g'ri o'zgarishlar reaktivlik orqali ko'rinadi; $patch alohida belgilanadi
    store.$subscribe((m) => {
      if (m.type !== 'direct') ev({ k: 'patch', store: store.$id, turi: m.type, payload: m.type === 'patch object' ? kor(m.payload) : null })
    }, { flush: 'sync', detached: true })
  })
  return { pinia, storlar }
}

// Store tarkibi: state, getter (computed) va action'lar
export function storSurati(store, computeds) {
  const raw = toRaw(store)
  const state = Object.entries(store.$state).map(([k, v]) => [k, kor(v)])
  const getters = []
  const actions = []
  for (const k of Object.keys(raw)) {
    if (k.startsWith('$') || k.startsWith('_') || k in store.$state) continue
    const v = raw[k]
    if (computeds.has(v)) getters.push([k, kor(v._value)])
    else if (typeof v === 'function') actions.push(k)
  }
  return { id: store.$id, state, getters, actions }
}

// ── Vue Router ────────────────────────────────────────────────────────────────────────────────────
// Guard natijasi: https://router.vuejs.org/guide/advanced/navigation-guards.html
function natija(v) {
  if (v === undefined || v === true) return { tur: 'ruxsat' }
  if (v === false) return { tur: 'bekor' }
  if (v instanceof Error) return { tur: 'xato', matn: v.message }
  return { tur: 'yonaltirdi', manzil: typeof v === 'string' ? v : v.path ?? v.name ?? kor(v) }
}

export function routerShim(ev) {
  const holat = { router: null }

  // Router guard'ning argumentlar sonidan `next` ishlatilishini aniqlaydi — o'rama ham shu sonni saqlashi kerak
  function ora(fn, nom, joy) {
    const yoz = (to, v) => ev({ k: 'guard', nom, joy, to: to.fullPath, ...natija(v) })
    if (fn.length >= 3) {
      return function (to, from, next) {
        return fn.call(this, to, from, (v) => {
          yoz(to, v)
          next(v)
        })
      }
    }
    return function (to, from) {
      let r
      try {
        r = fn.call(this, to, from)
      } catch (e) {
        yoz(to, e)
        throw e
      }
      if (r && typeof r.then === 'function') return r.then((v) => (yoz(to, v), v), (e) => (yoz(to, e), Promise.reject(e)))
      yoz(to, r)
      return r
    }
  }
  const komNomi = (c) => c?.__name || c?.name || c?.__file?.replace(/\.vue$/, '') || 'komponent'
  const IN_KOMP = ['beforeRouteEnter', 'beforeRouteUpdate', 'beforeRouteLeave']
  function yollar(list, ota = '') {
    return list.map((r) => {
      const y = { ...r }
      const p = r.path.startsWith('/') ? r.path : `${ota.replace(/\/$/, '')}/${r.path}`
      if (r.beforeEnter) y.beforeEnter = [].concat(r.beforeEnter).map((g) => ora(g, 'beforeEnter', `yo‘l ${p}`))
      if (r.component && typeof r.component === 'object' && IN_KOMP.some((k) => r.component[k])) {
        y.component = { ...r.component }
        for (const k of IN_KOMP) if (r.component[k]) y.component[k] = ora(r.component[k], k, `<${komNomi(r.component)}>`)
      }
      if (r.children) y.children = yollar(r.children, p)
      return y
    })
  }
  function createRouter(opts) {
    const router = VueRouter.createRouter({ ...opts, history: VueRouter.createMemoryHistory(), routes: yollar(opts.routes) })
    holat.router = router
    // birinchi ro'yxatdan o'tgan guard — o'tish boshlanishi; afterEach — tugashi
    router.beforeEach((to, from) => {
      ev({ k: 'nav', faza: 'boshlandi', from: from.matched.length ? from.fullPath : null, to: to.fullPath })
    })
    router.afterEach((to, from, failure) => {
      ev({
        k: 'nav',
        faza: 'tugadi',
        to: to.fullPath,
        ok: !failure,
        sabab: failure ? (VueRouter.isNavigationFailure(failure, VueRouter.NavigationFailureType.aborted) ? 'bekor qilindi' : VueRouter.isNavigationFailure(failure, VueRouter.NavigationFailureType.duplicated) ? 'allaqachon shu sahifada' : 'to‘xtatildi') : null,
        komponent: to.matched.map((m) => komNomi(m.components?.default)),
        params: Object.entries(to.params).map(([k, v]) => [k, String(v)]),
      })
    })
    for (const g of ['beforeEach', 'beforeResolve']) {
      const asl = router[g].bind(router)
      router[g] = (fn) => asl(ora(fn, g, 'global'))
    }
    const aslAfter = router.afterEach.bind(router)
    router.afterEach = (fn) => aslAfter((to, from, f) => (ev({ k: 'guard', nom: 'afterEach', joy: 'global', to: to.fullPath, tur: 'ruxsat' }), fn(to, from, f)))
    return router
  }
  const kompGuard = (asl, nom) => (fn) => asl(ora(fn, nom, `<${komNomi(getCurrentInstance()?.type)}>`))
  const mod = {
    ...VueRouter,
    createRouter,
    // natija oynasida brauzer manzili yo'q — har qanday tarix xotirada
    createWebHistory: () => VueRouter.createMemoryHistory(),
    createWebHashHistory: () => VueRouter.createMemoryHistory(),
    onBeforeRouteLeave: kompGuard(VueRouter.onBeforeRouteLeave, 'onBeforeRouteLeave'),
    onBeforeRouteUpdate: kompGuard(VueRouter.onBeforeRouteUpdate, 'onBeforeRouteUpdate'),
  }
  return { mod, holat }
}

export function yollarJadvali(router) {
  const komNomi = (c) => c?.__name || c?.name || c?.__file?.replace(/\.vue$/, '') || ''
  return router.getRoutes().map((r) => ({ path: r.path, name: typeof r.name === 'string' ? r.name : null, komponent: komNomi(r.components?.default), meta: Object.keys(r.meta ?? {}) }))
}
