# 43 — Pinia: chuqur qatlam

[← Oldingi: Pinia](42-pinia.md) · [Mundarija](README.md) · [Keyingi: HTTP qatlami →](44-http-qatlami.md)

## Tushuncha

42-bobda store yozishni ko'rdik. Bu bobda production'da kerak bo'ladigan narsalar: pluginlar, saqlash (persistence), SSR, testlash, HMR, store'lar o'rtasidagi aloqa va normalizatsiya.

## Kod: Pinia plugini

Plugin — **har bir store'ga** qo'shiladigan imkoniyat. `createPinia()` ga ulanadi:

```js
// plugins/pinia-persist.js
export function persistPlugin({ store, options }) {
  // Faqat `persist: true` bergan store'lar uchun
  if (!options.persist) return

  const key = `store:${store.$id}`
  const saved = localStorage.getItem(key)

  if (saved) store.$patch(JSON.parse(saved))

  store.$subscribe((mutation, state) => {
    localStorage.setItem(key, JSON.stringify(state))
  })
}
```

```js
// main.js
const pinia = createPinia()

pinia.use(persistPlugin)
app.use(pinia)
```

```js
export const useCartStore = defineStore('cart', () => { /* ... */ }, { persist: true })
```

Plugin qaytargan obyekt **har bir store'ga xossa sifatida qo'shiladi**:

```js
pinia.use(({ store }) => ({
  // endi har store'da `store.$api` bor
  $api: createApi(),
  // va `store.$reset()` setup store'lar uchun ham
}))
```

Tayyor yechim: `pinia-plugin-persistedstate` — kalit nomi, saqlash joyi (`localStorage`/`sessionStorage`/cookie), qaysi maydonlarni saqlash (`paths`), seriyalash sozlamalari bor.

## Kod: setup store uchun `$reset`

Options store'da `$reset()` avtomatik ishlaydi, setup store'da esa yo'q — `state()` funksiyasi bo'lmagani uchun Pinia boshlang'ich holatni bilmaydi. Ikki yechim:

```js
// 1. Qo'lda reset action
export const useFilterStore = defineStore('filter', () => {
  const initial = () => ({ query: '', page: 1, sort: 'created' })

  const state = ref(initial())

  function $reset() {
    state.value = initial()
  }

  return { state, $reset }
})
```

```js
// 2. Plugin orqali barcha store'lar uchun
pinia.use(({ store }) => {
  const initial = JSON.parse(JSON.stringify(store.$state))

  store.$reset = () => store.$patch(JSON.parse(JSON.stringify(initial)))
})
```

Ikkinchisi qulay, lekin `JSON` orqali nusxa olgani uchun `Date`, `Map`, `Set` kabi turlarni yo'qotadi — loyihangizda shunday qiymatlar bo'lsa `structuredClone(toRaw(store.$state))` ishlating (17-bob).

## Kod: SSR'da Pinia

SSR'ning asosiy qoidasi: **har so'rovga yangi holat** (04, 56-bob). Pinia buni `createPinia()` ni har so'rovda chaqirish orqali hal qiladi:

```js
// entry-server.js
export function render(url) {
  const app = createSSRApp(App)
  const pinia = createPinia()

  app.use(pinia)

  // ...ma'lumot yuklash...

  return {
    html: await renderToString(app),
    state: JSON.stringify(pinia.state.value),     // klientga uzatiladi
  }
}
```

```html
<!-- server javobida -->
<script>window.__PINIA__ = {{ state }}</script>
```

```js
// entry-client.js
const pinia = createPinia()

if (window.__PINIA__) pinia.state.value = window.__PINIA__

app.use(pinia)
```

Bu — "state hydration": server yuklagan ma'lumot klientda qayta so'ralmaydi. Nuxt buni avtomatik qiladi (`useState`, 60-bob).

Xavfsizlik eslatmasi: `pinia.state.value` ichida token yoki boshqa maxfiy ma'lumot bo'lmasin — u HTML'ga ochiq matn sifatida yoziladi (65-bob).

## Kod: store'larni testlash

```js
// stores/cart.spec.js
import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCartStore } from './cart'

describe('cart store', () => {
  beforeEach(() => {
    // Har testga toza Pinia
    setActivePinia(createPinia())
  })

  it('bir xil mahsulot qo\'shilsa miqdor oshadi', () => {
    const cart = useCartStore()

    cart.add({ id: 1, price: 1000 })
    cart.add({ id: 1, price: 1000 })

    expect(cart.items).toHaveLength(1)
    expect(cart.items[0].qty).toBe(2)
    expect(cart.subtotal).toBe(2000)
  })
})
```

Komponent testida store'ni mock qilish (52-bob):

```js
import { createTestingPinia } from '@pinia/testing'

const wrapper = mount(CartButton, {
  global: {
    plugins: [
      createTestingPinia({
        initialState: { cart: { items: [{ id: 1, qty: 2, price: 1000 }] } },
        stubActions: true,          // action'lar chaqirilgani yoziladi, lekin bajarilmaydi
      }),
    ],
  },
})

await wrapper.find('button').trigger('click')

expect(useCartStore().add).toHaveBeenCalledOnce()
```

## Kod: HMR

Fayl saqlanganda store holati yo'qolmasligi uchun:

```js
export const useCartStore = defineStore('cart', () => { /* ... */ })

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCartStore, import.meta.hot))
}
```

`acceptHMRUpdate` ni `pinia` dan import qiling. Busiz store fayli o'zgarganda sahifa to'liq qayta yuklanadi va savat bo'shab qoladi.

## Kod: store'lar aloqasi va aylanma bog'liqlik

```js
// stores/auth.js
export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)

  async function logout() {
    user.value = null

    // ✗ import qilib chaqirish aylanma bog'liqlik yaratishi mumkin
    // useCartStore().clear()

    // ✓ hodisa orqali
    bus.emit('auth:logout')
  }

  return { user, logout }
})
```

```js
// stores/cart.js
export const useCartStore = defineStore('cart', () => {
  const items = ref([])

  bus.on('auth:logout', () => (items.value = []))

  return { items }
})
```

Oddiyroq yechim — `$onAction` bilan tashqaridan bog'lash:

```js
// plugins/wire-stores.js — barcha bog'lanishlar bitta joyda
const auth = useAuthStore()
const cart = useCartStore()

auth.$onAction(({ name, after }) => {
  if (name === 'logout') after(() => cart.$reset())
})
```

Nima uchun muhim: store'lar bir-birini to'g'ridan-to'g'ri chaqirsa, ikkisini alohida test qilib bo'lmaydi va import grafida halqa paydo bo'ladi.

## Muhandislik nuqtai nazari: normalizatsiya

Server ro'yxati kelganda ikki shakl bor (13-bob):

```js
// Massiv
const users = ref([{ id: 1, name: 'Aziz' }, { id: 2, name: 'Bek' }])

// Normalizatsiya
const byId = ref({ 1: { id: 1, name: 'Aziz' }, 2: { id: 2, name: 'Bek' } })
const ids = ref([1, 2])
```

Store'da normalizatsiya foydali bo'ladigan holatlar:

| Holat | Sabab |
| --- | --- |
| Bir obyekt bir nechta ro'yxatda uchraydi | Bitta nusxa — yangilanish hamma joyda ko'rinadi |
| ID bo'yicha tez-tez qidiriladi | `O(1)` o'rniga `O(n)` |
| Qisman yangilanish (`PATCH /users/2`) | Faqat bitta kalit almashadi |
| Ro'yxat katta (1 000+) | Har o'zgarishda massiv aylanmaydi |

```js
export const useUsersStore = defineStore('users', () => {
  const byId = ref({})
  const listIds = ref([])

  const list = computed(() => listIds.value.map((id) => byId.value[id]))

  function upsert(users) {
    for (const user of users) byId.value[user.id] = { ...byId.value[user.id], ...user }
  }

  async function loadList() {
    const users = await api.get('/users')

    upsert(users)
    listIds.value = users.map((u) => u.id)
  }

  return { byId, list, upsert, loadList }
})
```

Narxi — qo'shimcha kod. 200 qatorli ilovada kerak emas; jadval + detal + tahrirlash ekranlari bir xil ma'lumotni ko'rsatadigan ilovada esa deyarli majburiy.

## Muhandislik nuqtai nazari: store yoki so'rov keshi

Serverdan kelgan ma'lumotni store'da saqlash — eng ko'p uchraydigan qaror va ko'pincha noto'g'ri:

| Savol | Store | So'rov keshi (44-bob / TanStack Query) |
| --- | --- | --- |
| Eskirish (staleness) | Qo'lda | Avtomatik (`staleTime`) |
| Takroriy so'rovlarni birlashtirish | Qo'lda | Avtomatik |
| Fon'da yangilash | Qo'lda | Avtomatik |
| Sahifa fokusga qaytganda yangilash | Qo'lda | Avtomatik |
| Optimistik yangilash | Qo'lda | Yordamchilar bor |

Amaliy chegara: **klient holati** (savat, tanlov, tema, forma qoralamasi) — store'da; **server holati** (foydalanuvchilar ro'yxati, mahsulot) — so'rov qatlamida, kerak bo'lsa store'da faqat ID'lar saqlanadi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| SSR'da bitta global `createPinia()` | Foydalanuvchilar holati aralashadi | Har so'rovga yangi pinia |
| Setup store'da `$reset()` kutish | Avtomatik ishlamaydi | Qo'lda action yoki plugin |
| `$subscribe` ichida yana store'ni o'zgartirish | Cheksiz sikl | Shart qo'ying yoki `$onAction` |
| Store'lar bir-birini to'g'ridan-to'g'ri chaqirishi | Aylanma bog'liqlik, test qiyin | `$onAction` yoki hodisa |
| HMR sozlamasini qo'shmaslik | Har tahrirda holat yo'qoladi | `acceptHMRUpdate` |
| Butun server javobini store'da keshlash | Eskirish mantiqini o'zingiz yozasiz | So'rov qatlami (44-bob) |
| Maxfiy ma'lumotni SSR state'ga solish | HTML'da ochiq ko'rinadi | Faqat serverda saqlang |

## Amaliyot

1. `persistPlugin` ni yozing va uni faqat `cart` store'iga qo'llang. Sahifani yangilab, savat saqlanishini tekshiring.
2. Setup store uchun `$reset` pluginini yozing va uni ikki store'da sinab ko'ring.
3. `cart` store'iga test yozing: qo'shish, o'chirish, jami hisoblash. `setActivePinia` ni olib tashlab, qanday xato chiqishini ko'ring.
4. `acceptHMRUpdate` qo'shing va store faylini tahrirlab, holat saqlanishini tasdiqlang.
5. `users` store'ini normalizatsiya bilan yozing va bitta foydalanuvchini yangilaganingizda ikkita ro'yxatda ham o'zgarishini ko'ring.

## Rasmiy hujjat

- Pinia pluginlari: <https://pinia.vuejs.org/core-concepts/plugins.html>
- SSR: <https://pinia.vuejs.org/ssr/>
- Testlash: <https://pinia.vuejs.org/cookbook/testing.html>
- HMR: <https://pinia.vuejs.org/cookbook/hot-module-replacement.html>
