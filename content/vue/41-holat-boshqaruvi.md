# 41 — Holat boshqaruvi

[← Oldingi: Vue Router: chuqur](40-router-chuqur.md) · [Mundarija](README.md) · [Keyingi: Pinia →](42-pinia.md)

## Tushuncha

"State management" — qo'rqinchli ibora, lekin muammo oddiy: **bir xil ma'lumot bir nechta komponentga kerak bo'lsa, u qayerda yashaydi?**

Javob darajama-daraja o'sadi:

1. Komponent ichida (`ref`) — 09-bob;
2. Ota komponentda, pastga props (22-bob), yuqoriga emit (23-bob);
3. `provide`/`inject` — bir shox uchun (27-bob);
4. Modul darajasidagi reaktiv obyekt — oddiy global store;
5. Pinia — to'liq yechim (42-bob).

Har darajaga o'tishdan oldin oldingisi yetarli emasligiga ishonch hosil qiling.

## Kod: 4-daraja — qo'lda yasalgan store

```js
// stores/counter.js
import { computed, readonly, ref } from 'vue'

const count = ref(0)

export function useCounter() {
  return {
    count: readonly(count),
    double: computed(() => count.value * 2),
    increment: () => count.value++,
  }
}
```

```vue
<script setup>
import { useCounter } from '@/stores/counter'

const { count, increment } = useCounter()
</script>
```

Ishlaydi va hech qanday kutubxona kerak emas. Kamchiliklari:

| Muammo | Tafsilot |
| --- | --- |
| SSR xavfi | Modul darajasidagi holat serverda **barcha foydalanuvchilarga umumiy** (04, 56-bob) |
| DevTools | Ko'rinmaydi, time-travel yo'q |
| Test | Holatni tozalash uchun qo'lda reset kerak |
| HMR | Fayl o'zgarganda holat yo'qoladi |
| Konvensiya | Har dasturchi o'zicha yozadi |

Kichik, faqat klientda ishlaydigan ilovada bu yetarli. Qolgan hollarda — Pinia.

## Kod: 2-daraja — "holatni ko'taring"

Ikki aka-uka komponent bir ma'lumotni bo'lishishi kerak bo'lsa, uni umumiy otaga ko'taring:

```vue
<!-- ProductsPage.vue -->
<script setup>
const selectedId = ref(null)
</script>

<template>
    <ProductList :selected-id="selectedId" @select="selectedId = $event" />
    <ProductDetails :id="selectedId" />
</template>
```

Bu — eng sodda va eng ko'p o'tkazib yuboriladigan yechim. Global store'ga shoshilmang: holat qanchalik yuqorida bo'lsa, uni tushunish shunchalik qiyin.

## Kod: 3-daraja — `provide` bilan modul konteksti

```js
// features/cart/context.js
import { computed, inject, provide, ref } from 'vue'

const CartKey = Symbol('cart')

export function provideCart() {
  const items = ref([])

  const total = computed(() => items.value.reduce((sum, i) => sum + i.price * i.qty, 0))

  function add(product) {
    const existing = items.value.find((i) => i.id === product.id)

    if (existing) existing.qty++
    else items.value.push({ ...product, qty: 1 })
  }

  const context = { items: readonly(items), total, add }

  provide(CartKey, context)

  return context
}

export function useCart() {
  const context = inject(CartKey)
  if (!context) throw new Error('useCart: provideCart() chaqirilmagan')

  return context
}
```

Bu naqsh SSR'da xavfsiz (holat komponent daraxtiga bog'langan) va bir nechta mustaqil nusxa kerak bo'lsa ham ishlaydi.

## Muhandislik nuqtai nazari: qaysi ma'lumot store'ga tegishli

Ilovadagi ma'lumotni to'rt turga ajrating:

| Tur | Misol | Qayerda |
| --- | --- | --- |
| **Server holati** | Foydalanuvchilar ro'yxati, mahsulot | Kesh qatlami (44-bob) yoki store |
| **Global klient holati** | Kirgan foydalanuvchi, til, tema, savat | Store |
| **URL holati** | Filtr, sahifa, ochilgan resurs | URL (39-bob) |
| **Lokal UI holati** | Modal ochiqligi, input matni, hover | Komponent |

Eng ko'p uchraydigan xato — birinchi va oxirgi turlarni store'ga tiqish. Server ma'lumotini store'da saqlasangiz, kesh, eskirish, qayta yuklash mantiqini o'zingiz yozasiz; lokal UI holatini store'ga chiqarsangiz, komponent qayta ishlatilmaydigan bo'lib qoladi.

## Muhandislik nuqtai nazari: store'ning uch qismi

Har qanday store — uch narsadan iborat:

```
state    — haqiqat manbai (minimal, normalizatsiyalangan)
getters  — hosila qiymatlar (computed)
actions  — holatni o'zgartirish yo'llari (yagona yozish nuqtasi)
```

Bu bo'linish Vuex/Redux/Pinia da bir xil, chunki u konkret kutubxonadan emas, muammodan kelib chiqadi:

1. Holat bitta joyda bo'lsa — "kim o'zgartirdi?" javobi oson;
2. O'zgartirish faqat action orqali bo'lsa — log, undo, test, DevTools ishlaydi;
3. Hosila qiymatlar hisoblansa — nomuvofiqlik bo'lmaydi (10-bob).

## Muhandislik nuqtai nazari: store'ni bo'lish

Bitta katta `useStore()` o'rniga, domen bo'yicha bo'ling:

```
stores/
├── auth.js        — foydalanuvchi, token, ruxsatlar
├── cart.js        — savat
├── catalog.js     — mahsulotlar keshi
└── ui.js          — tema, til, global modal
```

Mezon: **bir store — bir mas'uliyat**. Store'lar bir-birini chaqira oladi (`useAuthStore()` ni `cart` ichida), lekin aylanma bog'liqlikdan qoching.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Hamma narsani global store'ga solish | Komponentlar qayta ishlatilmaydi, test murakkab | Holatni ishlatilish joyiga yaqin saqlang |
| Modul darajasidagi `ref` + SSR | Foydalanuvchilar holati aralashadi | Pinia yoki `provide` |
| Server ma'lumotini store'da qo'lda keshlash | Eskirish, qayta yuklash, poyga holatlari qo'lda yoziladi | So'rov qatlami (44-bob) |
| Filtrlarni store'da saqlash | URL ulashib bo'lmaydi | `query` |
| Store'da hosila qiymatni saqlash | Ikki manba | `getters`/`computed` |
| Store'ni to'g'ridan-to'g'ri o'zgartirish (action'siz) | O'zgarish manbasi ko'rinmaydi | Action |

## Amaliyot

1. Ikki aka-uka komponent orasidagi holatni avval store'ga chiqaring, keyin umumiy otaga ko'taring. Qaysi biri qisqaroq?
2. `provideCart`/`useCart` naqshini yozing va bitta sahifada ikkita mustaqil savat yarating.
3. Modul darajasidagi `ref` bilan store yozing va uni SSR'da qanday muammo tug'dirishini tushuntiring (56-bobdan keyin qaytib keling).
4. Ilovangizdagi butun holatni yuqoridagi to'rt turga ajratib ro'yxat qiling: qaysi biri noto'g'ri joyda?

## Rasmiy hujjat

- Holat boshqaruvi: <https://vuejs.org/guide/scaling-up/state-management.html>
- Reaktivlik API: <https://vuejs.org/api/reactivity-core.html>
