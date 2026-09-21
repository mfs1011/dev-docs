# 40 — Vue Router: chuqur qatlam

[← Oldingi: Vue Router: asoslar](39-router-asoslari.md) · [Mundarija](README.md) · [Keyingi: Holat boshqaruvi →](41-holat-boshqaruvi.md)

## Tushuncha

Bu bobda: ichma-ich marshrutlar, navigatsiya guard'lari, meta ma'lumot, scroll boshqaruvi, lazy loading va autentifikatsiya oqimi.

## Kod: ichma-ich marshrutlar

```js
{
  path: '/settings',
  component: SettingsLayout,
  children: [
    { path: '', redirect: { name: 'settings-profile' } },
    { path: 'profile', name: 'settings-profile', component: ProfileTab },
    { path: 'security', name: 'settings-security', component: SecurityTab },
  ],
}
```

```vue
<!-- SettingsLayout.vue -->
<template>
    <aside>
        <RouterLink :to="{ name: 'settings-profile' }">Profil</RouterLink>
        <RouterLink :to="{ name: 'settings-security' }">Xavfsizlik</RouterLink>
    </aside>

    <main>
        <RouterView />          <!-- bolalar shu yerda render bo'ladi -->
    </main>
</template>
```

Bola `path` da bosh `/` yozilmaydi — u otaga nisbatan.

## Kod: nomlangan ko'rinishlar

Bir sahifada bir nechta `RouterView`:

```js
{
  path: '/dashboard',
  components: {
    default: DashboardMain,
    sidebar: DashboardSidebar,
  },
}
```

```vue
<RouterView />
<RouterView name="sidebar" />
```

## Kod: navigatsiya guard'lari

Uch daraja bor:

```js
// 1. Global — har navigatsiyada
router.beforeEach((to, from) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // true yoki undefined — davom etsin
})

router.afterEach((to, from, failure) => {
  if (!failure) trackPageView(to.fullPath)
})

// 2. Marshrut darajasida
{
  path: '/admin',
  component: AdminView,
  beforeEnter: (to) => useAuthStore().isAdmin || { name: 'forbidden' },
}

// 3. Komponent ichida
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

onBeforeRouteLeave((to, from) => {
  if (hasUnsavedChanges.value) {
    return window.confirm('Saqlanmagan o\'zgarishlar bor. Chiqasizmi?')
  }
})

onBeforeRouteUpdate(async (to) => {
  // Bir xil komponent, boshqa params (/users/1 → /users/2)
  await loadUser(to.params.id)
})
```

Guard qaytaradigan qiymatlar: `true`/`undefined` (davom), `false` (bekor), obyekt/satr (yo'naltirish).

## Kod: `meta` ma'lumoti

```js
{
  path: '/admin/users',
  component: AdminUsers,
  meta: {
    requiresAuth: true,
    roles: ['admin'],
    layout: 'admin',
    title: 'Foydalanuvchilar',
    keepAlive: true,
  },
}
```

```js
router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) return { name: 'login' }
  if (to.meta.roles && !to.meta.roles.some((r) => auth.roles.includes(r))) return { name: 'forbidden' }
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} — Ilova` : 'Ilova'
})
```

`meta` ichma-ich marshrutlarda **to'planadi**: `to.meta` — ota va bola meta'larining birlashmasi.

## Kod: scroll boshqaruvi

```js
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition          // orqaga/oldinga tugmasi
    if (to.hash) return { el: to.hash, top: 80, behavior: 'smooth' }

    return { top: 0 }
  },
})
```

Async ma'lumot yuklangandan keyin scroll qilish kerak bo'lsa, `Promise` qaytariladi:

```js
scrollBehavior(to, from, savedPosition) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(savedPosition ?? { top: 0 }), 300)
  })
}
```

## Kod: autentifikatsiya oqimi (to'liq)

```js
// router/index.js
router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // Sahifa yangilanganda foydalanuvchini bir marta tiklash
  if (!auth.resolved) await auth.restore()

  if (to.meta.requiresAuth && !auth.user) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // Kirgan foydalanuvchi login sahifasiga kirmasin
  if (to.name === 'login' && auth.user) {
    return { name: 'home' }
  }
})
```

```vue
<!-- LoginView.vue -->
<script setup>
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

async function submit() {
  await auth.login(form)

  router.replace(route.query.redirect ?? { name: 'home' })
}
</script>
```

Diqqat: guard'da `useAuthStore()` ni **funksiya ichida** chaqiring. Modul darajasida chaqirilsa, Pinia hali ulanmagan bo'lishi mumkin (31-bobdagi plugin tartibi).

## Kod: lazy loading va guruhlash

```js
{ path: '/admin', component: () => import('@/views/AdminView.vue') }

// Bir nechta marshrutni bitta chunk'ga yig'ish
const AdminUsers = () => import(/* webpackChunkName: "admin" */ '@/views/AdminUsers.vue')
```

Vite'da chunk nomlarini `build.rollupOptions.output.manualChunks` orqali boshqarasiz (63-bob).

## Kod: ma'lumotni qayerda yuklash

Uch variant:

```js
// 1. Komponent ichida (eng oddiy) — sahifa darhol ochiladi, skelet ko'rinadi
onMounted(() => loadProduct(props.id))

// 2. Guard'da (navigatsiya ma'lumot kelguncha kutadi)
beforeEnter: async (to) => {
  await useProductStore().load(to.params.id)
}

// 3. Komponent ichida watch bilan (params o'zgarganda ham ishlaydi)
watch(() => props.id, loadProduct, { immediate: true })
```

Amaliy tavsiya: **1 yoki 3** — foydalanuvchi navigatsiya darhol sodir bo'lganini ko'radi va skelet ko'rsatiladi. 2-variant "oq ekranda kutish" hissini beradi, lekin SEO va to'liq tayyor sahifa kerak bo'lsa (SSR) foydali.

## Muhandislik nuqtai nazari: guard'larda nima qilinmaydi

Guard — **navigatsiya qarori** joyi, ish bajarish joyi emas:

```js
// ✗ Har navigatsiyada og'ir so'rov
router.beforeEach(async () => {
  await fetchAllSettings()
})

// ✓ Bir marta, kerak bo'lganda
router.beforeEach(async (to) => {
  if (to.meta.requiresAuth && !auth.resolved) await auth.restore()
})
```

Guard sekin bo'lsa, butun ilova sekin ko'rinadi: foydalanuvchi bosgan havola darhol javob bermaydi.

Ikkinchi qoida: **guard'da cheksiz yo'naltirish** eng ko'p uchraydigan xato:

```js
// ✗ /login ham requiresAuth bo'lsa — cheksiz sikl
router.beforeEach((to) => {
  if (!auth.user) return { name: 'login' }
})

// ✓ Chiqish sharti bor
router.beforeEach((to) => {
  if (!auth.user && to.name !== 'login') return { name: 'login' }
})
```

## Muhandislik nuqtai nazari: layout naqshlari

Ikki keng tarqalgan yondashuv:

**1. Ichma-ich marshrut bilan** (router-first):

```js
{
  path: '/',
  component: DefaultLayout,
  children: [ /* sahifalar */ ],
}
```

**2. `meta.layout` bilan** (komponent-first):

```vue
<script setup>
const route = useRoute()
const layouts = { default: DefaultLayout, admin: AdminLayout, empty: EmptyLayout }
const layout = computed(() => layouts[route.meta.layout ?? 'default'])
</script>

<template>
    <component :is="layout">
        <RouterView />
    </component>
</template>
```

Birinchisi aniqroq va `RouterView` ichma-ichligi tabiiy; ikkinchisi moslashuvchan, lekin layout almashganda komponentlar qayta yaratiladi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Guard'da `next()` ni chaqirmaslik (eski API) | Navigatsiya muzlab qoladi | Yangi API'da `return` yetarli |
| Guard'da cheksiz yo'naltirish | Sahifa ochilmaydi, brauzer qotadi | Chiqish shartini qo'shing |
| `beforeEach` da `useStore()` ni modul darajasida chaqirish | Pinia hali yo'q | Funksiya ichida |
| `/users/1` → `/users/2` da ma'lumot yangilanmaydi | Komponent qayta yaratilmaydi | `onBeforeRouteUpdate` yoki `watch(() => props.id)` |
| Har marshrutda statik import | Bitta katta bundle | `() => import(...)` |
| `savedPosition` ni e'tiborsiz qoldirish | Orqaga qaytganda scroll boshiga tushadi | `scrollBehavior` |

## Amaliyot

1. Ichma-ich marshrutlar bilan sozlamalar sahifasini qiling (profil/xavfsizlik tab'lari).
2. `meta.requiresAuth` va global guard bilan himoyalangan sahifa yasang; `redirect` query'si bilan kirishdan keyin qaytishni amalga oshiring.
3. `onBeforeRouteLeave` bilan saqlanmagan forma haqida ogohlantirish qo'shing.
4. `scrollBehavior` yozing: hash bo'lsa smooth scroll, orqaga qaytganda saqlangan pozitsiya.
5. `/users/:id` sahifasida `onBeforeRouteUpdate` bilan bir foydalanuvchidan boshqasiga o'tishda ma'lumot yangilanishini ta'minlang.

## Rasmiy hujjat

- Navigatsiya guard'lari: <https://router.vuejs.org/guide/advanced/navigation-guards.html>
- Ichma-ich marshrutlar: <https://router.vuejs.org/guide/essentials/nested-routes.html>
- Scroll behavior: <https://router.vuejs.org/guide/advanced/scroll-behavior.html>
