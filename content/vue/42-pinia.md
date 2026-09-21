# 42 — Pinia

[← Oldingi: Holat boshqaruvi](41-holat-boshqaruvi.md) · [Mundarija](README.md) · [Keyingi: Pinia: chuqur →](43-pinia-chuqur.md)

## Tushuncha

Pinia — Vue'ning **rasmiy** store kutubxonasi (Vuex o'rnini egallagan). Uch narsani beradi: SSR'ga xavfsiz nusxalash, DevTools integratsiyasi va TypeScript inference.

```bash
npm i pinia
```

```js
// main.js
import { createPinia } from 'pinia'

app.use(createPinia())
```

## Kod: setup store (tavsiya etiladi)

```js
// stores/cart.js
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', () => {
  // state
  const items = ref([])
  const promoCode = ref(null)

  // getters
  const count = computed(() => items.value.reduce((sum, i) => sum + i.qty, 0))
  const subtotal = computed(() => items.value.reduce((sum, i) => sum + i.price * i.qty, 0))
  const total = computed(() => subtotal.value * (promoCode.value ? 0.9 : 1))

  // actions
  function add(product, qty = 1) {
    const existing = items.value.find((i) => i.id === product.id)

    if (existing) existing.qty += qty
    else items.value.push({ ...product, qty })
  }

  function remove(id) {
    items.value = items.value.filter((i) => i.id !== id)
  }

  async function checkout() {
    const order = await api.post('/orders', { items: items.value, promoCode: promoCode.value })

    items.value = []

    return order
  }

  return { items, promoCode, count, subtotal, total, add, remove, checkout }
})
```

```vue
<script setup>
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/cart'

const cart = useCartStore()

// Reaktivlikni saqlab destrukturizatsiya qilish
const { items, total } = storeToRefs(cart)

// Action'larni to'g'ridan-to'g'ri olish mumkin (ular funksiya, reaktiv emas)
const { add, remove } = cart
</script>

<template>
    <p>Jami: {{ total }}</p>
    <button @click="add(product)">Savatga</button>
</template>
```

**`storeToRefs` ni unutmang:** `const { items } = cart` reaktivlikni uzadi (17-bob), chunki store — `reactive` obyekt.

## Kod: options store

::: options
Options API uslubiga yaqin shakl:

```js
export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    promoCode: null,
  }),
  getters: {
    count: (state) => state.items.reduce((sum, i) => sum + i.qty, 0),
    subtotal: (state) => state.items.reduce((sum, i) => sum + i.price * i.qty, 0),
    total() {
      return this.subtotal * (this.promoCode ? 0.9 : 1)
    },
  },
  actions: {
    add(product, qty = 1) {
      const existing = this.items.find((i) => i.id === product.id)

      if (existing) existing.qty += qty
      else this.items.push({ ...product, qty })
    },
  },
})
```

Komponentda:

```js
import { mapState, mapActions } from 'pinia'

export default {
  computed: { ...mapState(useCartStore, ['items', 'total']) },
  methods: { ...mapActions(useCartStore, ['add', 'remove']) },
}
```
:::

::: composition
Setup store (yuqoridagi birinchi misol) Composition API bilan bir xil yoziladi va tavsiya etiladi: `ref` → state, `computed` → getter, funksiya → action.

Options shaklini ham qo'llab-quvvatlaydi — o'ng tomondagi almashtirgichni bosib ko'ring. Ikkalasi bir xil imkoniyatga ega; setup shakli composable'lardan foydalanish (masalan `useLocalStorage`) osonroq bo'lgani uchun afzal.
:::

## Kod: store API'si

```js
const cart = useCartStore()

// Butun holatni almashtirish
cart.$patch({ promoCode: 'SALE10' })

// Funksiya bilan (murakkab o'zgarishlar, bitta tranzaksiya sifatida)
cart.$patch((state) => {
  state.items.push(product)
  state.promoCode = null
})

// Boshlang'ich holatga qaytarish (faqat options store'da avtomatik)
cart.$reset()

// O'zgarishlarni kuzatish
cart.$subscribe((mutation, state) => {
  localStorage.setItem('cart', JSON.stringify(state.items))
})

// Action'larni ushlash (log, xato, analitika)
cart.$onAction(({ name, args, after, onError }) => {
  after((result) => console.log(`${name} tugadi`, result))
  onError((error) => reportError(error))
})
```

## Kod: store'lar bir-birini ishlatadi

```js
export const useCheckoutStore = defineStore('checkout', () => {
  const cart = useCartStore()          // boshqa store
  const auth = useAuthStore()

  const canCheckout = computed(() => auth.isLoggedIn && cart.count > 0)

  async function submit() {
    if (!canCheckout.value) throw new Error('Checkout mumkin emas')

    return cart.checkout()
  }

  return { canCheckout, submit }
})
```

Store ichida boshqa store'ni **funksiya tanasida** chaqiring (modul darajasida emas) — aks holda Pinia hali faol bo'lmasligi mumkin.

## Kod: `localStorage` bilan saqlash

```js
export const useSettingsStore = defineStore('settings', () => {
  const theme = ref(localStorage.getItem('theme') ?? 'light')

  watch(theme, (value) => localStorage.setItem('theme', value))

  return { theme }
})
```

Yoki VueUse bilan bir qatorda:

```js
import { useLocalStorage } from '@vueuse/core'

export const useSettingsStore = defineStore('settings', () => ({
  theme: useLocalStorage('theme', 'light'),
}))
```

Butun store'ni saqlash uchun `pinia-plugin-persistedstate` bor (43-bob).

## Muhandislik nuqtai nazari: action nima qilishi kerak

Action — **holatni o'zgartirishning yagona yo'li** bo'lishi kerak. Shuning uchun:

```js
// ✗ Komponentda to'g'ridan-to'g'ri
cart.items.push(product)

// ✓ Action orqali
cart.add(product)
```

Farqi texnik emas (Pinia ikkalasiga ham ruxsat beradi), balki **kuzatuvchanlikda**: `$onAction` va DevTools faqat action'larni ko'radi. Ikkinchi sabab — mantiq bir joyda: `add` ichida "bor bo'lsa qty oshsin" qoidasi bitta nusxada yashaydi.

Action ichida so'rov yuborish normal. Lekin so'rov **natijasini** ham, xato holatini ham store'da saqlashdan oldin o'ylab ko'ring: bu server holati keshi (41-bob) va u alohida qatlamga (44-bob) tegishli bo'lishi mumkin.

## Muhandislik nuqtai nazari: store hajmi

Store 300 qatordan oshsa, uni bo'lish vaqti keldi. Ajratish chiziqlari:

- **Domen bo'yicha**: `auth`, `cart`, `catalog`;
- **Server holati vs klient holati**: mahsulotlar keshi alohida, tanlangan filtrlar alohida;
- **Composable'ga chiqarish**: murakkab hisoblar store ichida emas, alohida faylda yozilib, store'da chaqirilsin.

Belgisi: agar store'ning yarmi bitta ekranga tegishli bo'lsa — u store emas, komponent holati bo'lishi kerak edi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `const { items } = useCartStore()` | Reaktivlik uziladi | `storeToRefs(cart)` |
| Store'ni modul darajasida chaqirish | Pinia hali ulanmagan | Funksiya/`setup` ichida |
| Komponentdan `cart.items.push(...)` | Mantiq tarqaladi, DevTools ko'rmaydi | Action |
| Hamma narsani bitta store'ga | 800 qatorli fayl | Domen bo'yicha bo'lish |
| Lokal UI holatini store'da saqlash | Komponent qayta ishlatilmaydi | `ref` |
| `$reset()` ni setup store'da kutish | Setup store'da avtomatik ishlamaydi | O'zingiz `reset()` action yozing |

## Amaliyot

1. `useCartStore` ni yozing: qo'shish, o'chirish, miqdorni o'zgartirish, jami hisoblash.
2. `storeToRefs` siz destrukturizatsiya qilib ko'ring va nima buzilishini kuzating.
3. `$subscribe` bilan savatni `localStorage` ga saqlang, sahifani yangilab tiklang.
4. `useAuthStore` yarating va `useCheckoutStore` dan unga murojaat qiling.
5. DevTools'ning Pinia panelida holatni o'zgartirib, ekran yangilanishini ko'ring.

## Rasmiy hujjat

- Pinia: <https://pinia.vuejs.org>
- Setup store: <https://pinia.vuejs.org/core-concepts/#setup-stores>
- `storeToRefs`: <https://pinia.vuejs.org/api/modules/pinia.html#storetorefs>
