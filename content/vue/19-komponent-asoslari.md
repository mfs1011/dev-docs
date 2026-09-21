# 19 — Komponent asoslari

[← Oldingi: Shablon ref'lari](18-shablon-reflari.md) · [Mundarija](README.md) · [Keyingi: Hayot sikli →](20-hayot-sikli.md)

## Tushuncha

Komponent — o'z shabloni, mantiqi va uslubiga ega qayta ishlatiladigan bo'lak. Ilova komponentlar **daraxti** shaklida quriladi:

```
App
├── AppHeader
│   └── UserMenu
├── ProductList
│   ├── ProductCard
│   ├── ProductCard
│   └── ProductCard
└── AppFooter
```

Har bir `ProductCard` — alohida **nusxa**: o'z holati, o'z hayot sikli. Bitta fayl, ko'p nusxa.

## Kod: komponent yaratish va ishlatish

```vue
<!-- components/ProductCard.vue -->
<script setup>
defineProps({
  product: { type: Object, required: true },
})
</script>

<template>
    <article class="card">
        <h3>{{ product.title }}</h3>
        <p>{{ product.price }} so'm</p>
    </article>
</template>

<style scoped>
.card { border: 1px solid #ddd; border-radius: 8px; padding: 12px; }
</style>
```

```vue
<!-- ProductList.vue -->
<script setup>
import ProductCard from '@/components/ProductCard.vue'

const products = [
  { id: 1, title: 'Klaviatura', price: 350000 },
  { id: 2, title: 'Sichqoncha', price: 120000 },
]
</script>

<template>
    <div class="grid">
        <ProductCard v-for="product in products" :key="product.id" :product="product" />
    </div>
</template>
```

`<script setup>` da import qilingan komponent **avtomatik** shablonda ishlatiladi — alohida ro'yxatdan o'tkazish shart emas (21-bob buni kengaytiradi).

## Kod: har nusxaning o'z holati

```vue
<!-- Counter.vue -->
<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
    <button @click="count++">Bosildi: {{ count }}</button>
</template>
```

```vue
<Counter />
<Counter />
<Counter />
```

Uchta tugma, uchta mustaqil sanoq. Sabab — `<script setup>` bloki har nusxa uchun **qaytadan** ishlaydi.

::: options
Options API'da `data` aynan shu sababdan funksiya:

```js
export default {
  // ✗ Barcha nusxalar bitta obyektni bo'lishardi
  // data: { count: 0 },

  // ✓ Har nusxaga yangi obyekt
  data() {
    return { count: 0 }
  },
}
```
:::

::: composition
Composition API'da bu tabiiy: `setup`/`<script setup>` har nusxa uchun qayta bajariladi, demak `ref(0)` ham har safar yangi yaratiladi.

Diqqat qilinadigan joy — **modul darajasidagi** holat:

```js
// ✗ Fayl darajasida: barcha nusxalar bo'lishadi
const count = ref(0)

export default { /* ... */ }
```

Bu ba'zan ataylab qilinadi (oddiy global store, 41-bob), lekin tasodifan qilinsa — chalkash xatolar manbai.
:::

## Kod: bir nechta ildiz element

Vue 3 da komponent bir nechta ildiz elementga ega bo'lishi mumkin (fragment):

```vue
<template>
    <dt>{{ label }}</dt>
    <dd>{{ value }}</dd>
</template>
```

Bu `<dl>`, `<tr>`, `<ul>` ichidagi komponentlar uchun zarur — ortiqcha `<div>` HTML semantikasini buzardi.

Narxi: fallthrough atributlar avtomatik tushmaydi (25-bob) — Vue qaysi ildizga qo'yishni bilmaydi.

## Kod: komponentlar aloqasi

Ma'lumot oqimining asosiy qoidasi: **pastga props, yuqoriga hodisa.**

```vue
<!-- Ota -->
<script setup>
import { ref } from 'vue'
import ProductCard from './ProductCard.vue'

const cart = ref([])

function addToCart(product) {
  cart.value.push(product)
}
</script>

<template>
    <ProductCard
        v-for="p in products"
        :key="p.id"
        :product="p"
        @add="addToCart"
    />

    <p>Savatda: {{ cart.length }}</p>
</template>
```

```vue
<!-- Bola -->
<script setup>
const props = defineProps({ product: Object })
const emit = defineEmits(['add'])
</script>

<template>
    <article>
        <h3>{{ product.title }}</h3>
        <button @click="emit('add', product)">Savatga</button>
    </article>
</template>
```

Props (22-bob) va emit (23-bob) keyingi boblarda batafsil.

## Kod: dinamik komponent

```vue
<script setup>
import { shallowRef } from 'vue'
import TabProfile from './TabProfile.vue'
import TabSettings from './TabSettings.vue'

const tabs = { profile: TabProfile, settings: TabSettings }
const current = shallowRef(TabProfile)
</script>

<template>
    <button v-for="(comp, name) in tabs" :key="name" @click="current = comp">
        {{ name }}
    </button>

    <component :is="current" />
</template>
```

`shallowRef` bu yerda ataylab: komponent ta'rifini chuqur reaktiv qilish shart emas va foydasiz (17-bob).

`<component :is>` satr ham qabul qiladi (global ro'yxatdan o'tgan komponent nomi) va hatto HTML tegi (`:is="'h' + level"`).

## Muhandislik nuqtai nazari: komponentni qachon ajratish

Boshlovchilar ikki chekkaga boradi: hamma narsa bitta 800 qatorli `App.vue` da, yoki har `<div>` uchun alohida komponent. Foydali mezonlar:

| Belgi | Ajratish kerak |
| --- | --- |
| Bir xil bo'lak 2+ joyda takrorlanadi | Ha |
| Bo'lakning o'z holati va mantiqi bor (modal, forma, jadval) | Ha |
| Shablon 150+ qator va bo'limlari aniq ajralib turadi | Ha |
| Faqat "chiroyliroq ko'rinsin" uchun | Yo'q — props orqali uzatiladigan narsalar ko'payadi |
| Bo'lak faqat bitta joyda, 10 qator va holatsiz | Yo'q |

Qo'shimcha mezon — **o'zgarish chastotasi**: birga o'zgaradigan narsalar birga tursin. Agar bo'lakni o'zgartirganda har safar ota komponentga ham tegishga to'g'ri kelsa, ajratish noto'g'ri joydan qilingan.

## Muhandislik nuqtai nazari: komponent — shartnoma

Komponentning tashqi dunyoga ko'rinadigan yuzasi to'rtta narsadan iborat:

1. **Props** — nima kiradi (22-bob);
2. **Emits** — nima chiqadi (23-bob);
3. **Slotlar** — qayerga mazmun qo'yiladi (26-bob);
4. **Expose** — qanday metodlarni chaqirish mumkin (18-bob).

Shu to'rtligi — komponentning API'si. Uni barqaror saqlang: ichini istagancha qayta yozing, lekin shartnomani o'zgartirsangiz, hamma ishlatgan joy sinadi. Bu backend'dagi API versiyalash bilan bir xil mas'uliyat.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Modul darajasida `const state = ref()` yozib, komponentda ishlatish | Barcha nusxalar bitta holatni bo'lishadi | Holatni `<script setup>` ichida e'lon qiling |
| Options API'da `data: { ... }` (funksiya emas) | Nusxalar holatni bo'lishadi | `data() { return {...} }` |
| Bolaga ma'lumotni `$parent` orqali olish | Qattiq bog'lanish, test qilib bo'lmaydi | Props |
| Bolada ota holatini o'zgartirish | Oqim buziladi, kim o'zgartirganini topib bo'lmaydi | `emit` |
| Har kichik `<div>` uchun komponent | Props "prop drilling" ga aylanadi | Mezonlar jadvaliga qarang |
| `<component :is>` ga `ref` (chuqur reaktiv) ishlatish | Ortiqcha Proxy, ba'zan ogohlantirish | `shallowRef` |

## Amaliyot

1. `ProductCard` va `ProductList` ni yozing, 5 ta mahsulotni render qiling.
2. `Counter` komponentini uch marta joylang va ular mustaqil ishlashini tasdiqlang. Keyin `count` ni modul darajasiga ko'chirib, farqni ko'ring.
3. Tab almashtirgichni `<component :is>` bilan yozing.
4. Mavjud katta komponentingizni oling va yuqoridagi mezonlar bo'yicha uni qaysi chiziq bo'ylab bo'lish kerakligini yozib chiqing.

## Rasmiy hujjat

- Komponent asoslari: <https://vuejs.org/guide/essentials/component-basics.html>
- Dinamik komponentlar: <https://vuejs.org/guide/essentials/component-basics.html#dynamic-components>
