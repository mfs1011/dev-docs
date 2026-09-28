# 36 — Klient holati: Zustand

[← Oldingi: React Router](35-react-router.md) · [Mundarija](README.md) · [Keyingi: Holat qayerda yashaydi →](37-holat-qayerda.md)

## Tushuncha

Context (20-bob) ma'lumot uzatish uchun yaxshi, lekin **tez-tez o'zgaradigan global holat** uchun yomon: qiymat o'zgarsa, barcha iste'molchilar qayta render bo'ladi.

Zustand — kichik (~1 KB) store kutubxonasi. Uning asosiy farqi — **selektorlar**: komponent faqat kerakli qismga obuna bo'ladi.

```bash
npm i zustand
```

## Kod: store yaratish

::: ts
```ts
// features/cart/store.ts
import { create } from 'zustand'

type CartLine = { productId: number; title: string; price: number; qty: number }

type CartStore = {
  lines: CartLine[]
  add: (product: Product, qty?: number) => void
  setQty: (productId: number, qty: number) => void
  remove: (productId: number) => void
  clear: () => void
}

export const useCartStore = create<CartStore>((set) => ({
  lines: [],

  add: (product, qty = 1) =>
    set((state) => {
      const existing = state.lines.find((l) => l.productId === product.id)

      if (!existing) {
        return { lines: [...state.lines, { productId: product.id, title: product.title, price: product.price, qty }] }
      }

      return {
        lines: state.lines.map((l) => (l.productId === product.id ? { ...l, qty: l.qty + qty } : l)),
      }
    }),

  setQty: (productId, qty) =>
    set((state) => ({
      lines: qty <= 0
        ? state.lines.filter((l) => l.productId !== productId)
        : state.lines.map((l) => (l.productId === productId ? { ...l, qty } : l)),
    })),

  remove: (productId) => set((state) => ({ lines: state.lines.filter((l) => l.productId !== productId) })),

  clear: () => set({ lines: [] }),
}))
```
:::

::: js
```js
// features/cart/store.js
import { create } from 'zustand'

export const useCartStore = create((set) => ({
  lines: [],

  add: (product, qty = 1) =>
    set((state) => {
      const existing = state.lines.find((l) => l.productId === product.id)

      if (!existing) {
        return { lines: [...state.lines, { productId: product.id, title: product.title, price: product.price, qty }] }
      }

      return { lines: state.lines.map((l) => (l.productId === product.id ? { ...l, qty: l.qty + qty } : l)) }
    }),

  setQty: (productId, qty) =>
    set((state) => ({
      lines: qty <= 0
        ? state.lines.filter((l) => l.productId !== productId)
        : state.lines.map((l) => (l.productId === productId ? { ...l, qty } : l)),
    })),

  remove: (productId) => set((state) => ({ lines: state.lines.filter((l) => l.productId !== productId) })),

  clear: () => set({ lines: [] }),
}))
```
:::

Provider kerak emas — store modul darajasida yashaydi va istalgan komponentdan chaqiriladi.

## Kod: selektorlar — eng muhim qism

```jsx
// ✗ Butun store'ga obuna: har o'zgarishda qayta render
const store = useCartStore()

// ✓ Faqat kerakli qismga obuna
const lines = useCartStore((s) => s.lines)
const add = useCartStore((s) => s.add)

// ✓ Hosila qiymat
const count = useCartStore((s) => s.lines.reduce((sum, l) => sum + l.qty, 0))
```

**Muhim tuzoq:** selektor har renderda yangi obyekt qaytarsa, u har safar "o'zgargan" hisoblanadi:

```jsx
// ✗ Har renderda yangi obyekt → cheksiz qayta renderlar
const { lines, add } = useCartStore((s) => ({ lines: s.lines, add: s.add }))

// ✓ Alohida selektorlar
const lines = useCartStore((s) => s.lines)
const add = useCartStore((s) => s.add)

// ✓ Yoki useShallow bilan
import { useShallow } from 'zustand/react/shallow'

const { lines, add } = useCartStore(useShallow((s) => ({ lines: s.lines, add: s.add })))
```

## Kod: hosila qiymatlar va yordamchi hooklar

::: ts
```ts
// Store tashqarisida hisoblash — komponentlar uchun toza API
export const useCartCount = () => useCartStore((s) => s.lines.reduce((sum, l) => sum + l.qty, 0))
export const useCartSubtotal = () => useCartStore((s) => s.lines.reduce((sum, l) => sum + l.price * l.qty, 0))
export const useCartActions = () =>
  useCartStore(useShallow((s) => ({ add: s.add, remove: s.remove, clear: s.clear })))
```
:::

::: js
```js
export const useCartCount = () => useCartStore((s) => s.lines.reduce((sum, l) => sum + l.qty, 0))
export const useCartSubtotal = () => useCartStore((s) => s.lines.reduce((sum, l) => sum + l.price * l.qty, 0))
export const useCartActions = () =>
  useCartStore(useShallow((s) => ({ add: s.add, remove: s.remove, clear: s.clear })))
```
:::

Action'lar hech qachon o'zgarmaydi, shuning uchun faqat ularni oladigan komponent (masalan "Savatga" tugmasi) savat o'zgarganda qayta render bo'lmaydi.

## Kod: middleware — persist va devtools

::: ts
```ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export const useCartStore = create<CartStore>()(
  devtools(
    persist(
      (set) => ({ /* ... */ }),
      {
        name: 'cart',
        partialize: (state) => ({ lines: state.lines }),   // faqat kerakli qismni saqlash
        version: 1,
        migrate: (persisted, version) => (version === 0 ? { lines: [] } : persisted),
      },
    ),
    { name: 'CartStore' },
  ),
)
```
:::

::: js
```js
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export const useCartStore = create(
  devtools(
    persist(
      (set) => ({ /* ... */ }),
      {
        name: 'cart',
        partialize: (state) => ({ lines: state.lines }),
        version: 1,
        migrate: (persisted, version) => (version === 0 ? { lines: [] } : persisted),
      },
    ),
    { name: 'CartStore' },
  ),
)
```
:::

`version` va `migrate` muhim: saqlangan ma'lumot tuzilmasi o'zgarganda eski foydalanuvchilarda ilova buzilmasin.

`devtools` — Redux DevTools kengaytmasi bilan ishlaydi: action tarixi, time-travel.

## Kod: React tashqarisida ishlatish

```js
// Komponentdan tashqarida o'qish va yozish
const lines = useCartStore.getState().lines
useCartStore.getState().clear()

// O'zgarishlarga obuna bo'lish
const unsubscribe = useCartStore.subscribe((state) => {
  analytics.track('cart_changed', { count: state.lines.length })
})
```

Bu — masalan chiqishda savatni tozalash uchun qulay:

```js
useAuthStore.subscribe((state, prev) => {
  if (prev.user && !state.user) useCartStore.getState().clear()
})
```

## Kod: testlash

```js
import { beforeEach, expect, it } from 'vitest'
import { useCartStore } from './store'

const initial = useCartStore.getState()

beforeEach(() => {
  useCartStore.setState(initial, true)        // har testga toza holat
})

it('bir xil mahsulotda miqdorni oshiradi', () => {
  const { add } = useCartStore.getState()

  add({ id: 1, title: 'Klaviatura', price: 1000 })
  add({ id: 1, title: 'Klaviatura', price: 1000 })

  expect(useCartStore.getState().lines).toHaveLength(1)
  expect(useCartStore.getState().lines[0].qty).toBe(2)
})
```

Store React'dan mustaqil, shuning uchun test komponentsiz yoziladi (44-bob).

## Muhandislik nuqtai nazari: Zustand yoki Context yoki boshqa

| Ehtiyoj | Vosita |
| --- | --- |
| Tema, til, joriy foydalanuvchi (kamdan-kam o'zgaradi) | Context (20-bob) |
| Savat, modal navbati, UI holati (tez-tez o'zgaradi) | Zustand |
| Server ma'lumoti | TanStack Query (32-bob) |
| URL'da bo'lishi mantiqiy | `useSearchParams` (35-bob) |
| Bir komponent ichidagi holat | `useState` |
| Murakkab holat mashinasi | `useReducer` yoki XState |

Alternativalar: **Jotai** (atomlar, pastdan yuqoriga), **Valtio** (proxy, mutatsiya uslubi), **Redux Toolkit** (katta jamoa, qat'iy konvensiyalar), **MobX**. Zustand — eng kam boilerplate bilan eng ko'p foyda beradigan variant.

## Muhandislik nuqtai nazari: store'ni bo'lish

Bitta katta store o'rniga domen bo'yicha:

```
features/cart/store.ts       — savat
features/auth/store.ts       — foydalanuvchi, tokenlar
shared/ui/toast-store.ts     — bildirishnomalar
```

Store'lar bir-birini chaqirishi mumkin, lekin **bir tomonlama** bo'lsin (34-bobdagi qatlam qoidasi). Aylanma bog'liqlik bo'lsa — `subscribe` orqali bog'lang.

## Muhandislik nuqtai nazari: server holatini store'ga solmang

```js
// ✗ Query'dan olingan ma'lumotni store'ga ko'chirish
const { data } = useQuery(...)
useEffect(() => setUsersInStore(data), [data])

// ✓ Har ma'lumot o'z qatlamida
const { data: users } = useQuery(...)              // server holati
const selectedId = useUiStore((s) => s.selectedId)  // klient holati
```

Bu — 17, 32 va 37-boblarda takrorlanadigan asosiy qoida: **ikki manba — ikki haqiqat.**

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Selektorsiz `useStore()` | Har o'zgarishda qayta render | Selektor bilan |
| Selektorda yangi obyekt qaytarish | Cheksiz renderlar | Alohida selektorlar yoki `useShallow` |
| Holatni mutatsiya qilish | React sezmaydi | Yangi obyekt (yoki `immer` middleware) |
| Server ma'lumotini store'da saqlash | Kesh mantiqi qo'lda | Query kutubxonasi |
| `persist` da `version` yozmaslik | Eski saqlangan ma'lumot ilovani buzadi | `version` + `migrate` |
| Bitta store'ga hamma narsani solish | Katta fayl, bog'liqlik chalkash | Domen bo'yicha bo'lish |
| Testda holatni tiklamaslik | Testlar bir-biriga ta'sir qiladi | `setState(initial, true)` |

## Amaliyot

1. `useCartStore` ni yozing: qo'shish, miqdor, o'chirish, tozalash.
2. Selektorsiz va selektor bilan ishlatib, Profiler'da qayta renderlarni solishtiring.
3. Selektorda obyekt qaytaring va cheksiz render muammosini ko'ring; `useShallow` bilan tuzating.
4. `persist` qo'shing, sahifani yangilang, keyin `version` ni oshirib `migrate` ishlashini tekshiring.
5. `subscribe` bilan chiqishda savatni tozalashni amalga oshiring.
6. Store uchun test yozing.

## Rasmiy hujjat

- Zustand: <https://zustand.docs.pmnd.rs>
- Selektorlar va `useShallow`: <https://zustand.docs.pmnd.rs/guides/prevent-rerenders-with-use-shallow>
- Middleware: <https://zustand.docs.pmnd.rs/integrations/persisting-store-data>
