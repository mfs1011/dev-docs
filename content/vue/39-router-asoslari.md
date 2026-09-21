# 39 — Vue Router: asoslar

[← Oldingi: Tooling](38-tooling.md) · [Mundarija](README.md) · [Keyingi: Vue Router: chuqur →](40-router-chuqur.md)

## Tushuncha

Router URL'ni komponentga bog'laydi: `/products/12` → `ProductView` komponenti, `id = 12`.

```bash
npm i vue-router@5
```

```js
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/products', name: 'products', component: () => import('@/views/ProductsView.vue') },
    { path: '/products/:id', name: 'product', component: () => import('@/views/ProductView.vue') },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFound.vue') },
  ],
})

export default router
```

```js
// main.js
app.use(router)
```

```vue
<!-- App.vue -->
<template>
    <nav>
        <RouterLink to="/">Bosh sahifa</RouterLink>
        <RouterLink :to="{ name: 'products' }">Mahsulotlar</RouterLink>
    </nav>

    <RouterView />
</template>
```

## Nega shunday: history rejimlari

| Rejim | URL | Server sozlash |
| --- | --- | --- |
| `createWebHistory()` | `/products/12` | Kerak: barcha yo'llar `index.html` ga (04-bob) |
| `createWebHashHistory()` | `/#/products/12` | Kerak emas |
| `createMemoryHistory()` | URL yo'q | SSR va testlar uchun |

Standart tanlov — `createWebHistory`. Hash rejimi faqat serverni sozlay olmaydigan holatlarda (masalan statik fayl xosting cheklovlari).

## Kod: dinamik segmentlar

```js
{ path: '/users/:id', component: UserView }
{ path: '/users/:id/posts/:postId', component: PostView }
{ path: '/files/:path(.*)', component: FileView }        // slashli yo'l
{ path: '/products/:id(\\d+)', component: ProductView }  // faqat raqam
{ path: '/tags/:tags+', component: TagsView }            // bir yoki ko'p
{ path: '/opt/:page?', component: OptView }              // ixtiyoriy
```

Komponentda:

```vue
<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

console.log(route.params.id)      // '12' — har doim satr
console.log(route.query.sort)     // ?sort=price
console.log(route.hash)           // #reviews
</script>
```

`params` **har doim satr** (yoki massiv). Songa aylantirish sizning zimmangizda:

```js
const id = computed(() => Number(route.params.id))
```

## Kod: props orqali uzatish (tavsiya etiladi)

```js
{ path: '/users/:id', component: UserView, props: true }
```

```vue
<!-- UserView.vue — endi route'ga bog'liq emas -->
<script setup>
defineProps({ id: String })
</script>
```

Bu komponentni **router'dan mustaqil** qiladi: uni testda oddiy props bilan mount qilish mumkin (52-bob).

Funksiya shakli — moslashtirish uchun:

```js
{
  path: '/users/:id',
  component: UserView,
  props: (route) => ({ id: Number(route.params.id), tab: route.query.tab ?? 'profile' }),
}
```

## Kod: navigatsiya

```vue
<template>
    <!-- Deklarativ -->
    <RouterLink to="/products">Mahsulotlar</RouterLink>
    <RouterLink :to="{ name: 'product', params: { id: 12 } }">Mahsulot</RouterLink>
    <RouterLink :to="{ path: '/search', query: { q: 'vue' } }">Qidirish</RouterLink>
    <RouterLink replace to="/login">Kirish</RouterLink>
</template>
```

```js
// Dasturiy
import { useRouter } from 'vue-router'

const router = useRouter()

router.push('/products')
router.push({ name: 'product', params: { id: 12 } })
router.replace('/login')          // tarixga yozmasdan
router.back()
router.go(-2)
```

**Nomlangan marshrutlardan foydalaning:** URL o'zgarsa, bitta joyda (`routes` da) tuzatasiz, 40 ta havolada emas.

## Kod: aktiv havola uslublari

```vue
<RouterLink to="/products" class="nav-link">Mahsulotlar</RouterLink>
```

Vue Router avtomatik ikkita class qo'shadi:

```css
.router-link-active { }           /* yo'l boshlanishi mos (masalan /products/12 da ham) */
.router-link-exact-active { }     /* aniq mos */
```

Moslashtirish:

```vue
<RouterLink to="/products" active-class="is-active" exact-active-class="is-current">
```

To'liq nazorat kerak bo'lsa — `v-slot`:

```vue
<RouterLink v-slot="{ href, navigate, isActive }" to="/products" custom>
    <li :class="{ active: isActive }">
        <a :href="href" @click="navigate">Mahsulotlar</a>
    </li>
</RouterLink>
```

## Kod: 404 va yo'naltirish

```js
{ path: '/:pathMatch(.*)*', component: NotFound },
{ path: '/eski-yol', redirect: '/yangi-yol' },
{ path: '/home', redirect: { name: 'home' } },
{ path: '/user/:id', redirect: (to) => ({ name: 'profile', params: { id: to.params.id } }) },
```

404 marshruti **oxirgi** bo'lishi kerak — marshrutlar yozilish tartibida tekshiriladi.

## Muhandislik nuqtai nazari: URL — bu ham holat

Eng ko'p uchraydigan boshlovchi xatosi: filtr, sahifa raqami, tanlangan tab'ni faqat komponent ichida saqlash. Natijada:

- Sahifa yangilansa holat yo'qoladi;
- Havolani ulashib bo'lmaydi;
- Orqaga tugmasi kutilganidek ishlamaydi.

To'g'ri yondashuv — bunday holatni `query` ga chiqarish:

```js
const route = useRoute()
const router = useRouter()

const page = computed({
  get: () => Number(route.query.page ?? 1),
  set: (value) => router.replace({ query: { ...route.query, page: value } }),
})

const sort = computed({
  get: () => route.query.sort ?? 'created',
  set: (value) => router.replace({ query: { ...route.query, sort: value } }),
})
```

`replace` (`push` emas) — filtr o'zgarishi tarixni to'ldirmasin.

Qoidalar:

| Holat turi | Qayerda |
| --- | --- |
| Sahifa, filtr, saralash, qidiruv | URL `query` |
| Ochilgan resurs identifikatori | URL `params` |
| Modal ochiqligi (ulashilsa mazmunli bo'lsa) | URL |
| Forma qoralamasi, scroll, ochiq akkordeon | Komponent holati yoki `KeepAlive` (34-bob) |
| Foydalanuvchi, savat | Store (42-bob) |

## Muhandislik nuqtai nazari: papka tuzilishi

```
src/
├── views/            ← marshrutga to'g'ridan-to'g'ri bog'langan komponentlar
│   ├── HomeView.vue
│   ├── ProductsView.vue
│   └── ProductView.vue
├── components/       ← qayta ishlatiladigan bo'laklar
└── router/index.js
```

`views/` va `components/` ni ajratish foydali: `views` — sahifa (URL bor), `components` — bo'lak (URL yo'q). Sahifa ma'lumot yuklaydi va bo'laklarga props tarqatadi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `params.id` ni son deb o'ylash | U har doim satr | `Number(route.params.id)` yoki `props` funksiyasi |
| 404 marshrutini ro'yxat boshiga qo'yish | Hamma yo'l unga tushadi | Oxirida |
| `history` rejimida server fallback sozlamaslik | Sahifa yangilanganda 404 | `try_files ... /index.html` |
| `router.push` ni `await` qilmasdan keyin DOM'ga murojaat | Navigatsiya hali tugamagan | `await router.push(...)` |
| Har joyda URL'ni qo'lda yozish (`/products/12`) | O'zgarsa hammasini tuzatish kerak | Nomlangan marshrutlar |
| Filtrlarni komponent holatida saqlash | Yangilanish/ulashish ishlamaydi | `query` |

## Amaliyot

1. To'rt marshrutli ilova yarating: bosh sahifa, ro'yxat, detal (`:id`), 404.
2. `props: true` bilan detal sahifasini router'dan mustaqil qiling.
3. Ro'yxat sahifasiga qidiruv va sahifalashni qo'shing, holatni `query` da saqlang. Sahifani yangilab, holat saqlanishini tekshiring.
4. `RouterLink` ning `v-slot` variantini ishlatib, `<li>` ichidagi maxsus havolani yasang.

## Rasmiy hujjat

- Vue Router: <https://router.vuejs.org>
- Dinamik marshrutlar: <https://router.vuejs.org/guide/essentials/dynamic-matching.html>
- Marshrutga props: <https://router.vuejs.org/guide/essentials/passing-props.html>
