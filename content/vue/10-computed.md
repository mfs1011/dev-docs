# 10 — Hisoblanuvchi xossalar (`computed`)

[← Oldingi: Reaktivlik asoslari](09-reaktivlik-asoslari.md) · [Mundarija](README.md) · [Keyingi: Class va style bog'lash →](11-class-va-style.md)

## Tushuncha

`computed` — boshqa reaktiv qiymatlardan **hosil qilinadigan** qiymat. U ikki xususiyatga ega:

1. **Keshlanadi** — bog'liqliklari o'zgarmasa, qayta hisoblanmaydi;
2. **Reaktiv** — bog'liqligi o'zgarsa, o'zi yangilanadi va uni ishlatgan joylarga xabar beradi.

::: options
```js
export default {
  data() {
    return {
      items: [
        { title: 'Sut', done: true },
        { title: 'Non', done: false },
      ],
    }
  },
  computed: {
    pending() {
      return this.items.filter((item) => !item.done)
    },
    summary() {
      return `${this.pending.length} ta bajarilmagan`
    },
  },
}
```
:::

::: composition
```js
import { computed, ref } from 'vue'

const items = ref([
  { title: 'Sut', done: true },
  { title: 'Non', done: false },
])

const pending = computed(() => items.value.filter((item) => !item.done))
const summary = computed(() => `${pending.value.length} ta bajarilmagan`)
```
:::

`computed` boshqa `computed` ga tayanishi mumkin — Vue bog'liqlik grafini o'zi quradi.

## Nega shunday: kesh nimani tejaydi

Metod bilan solishtiring:

::: options
```vue
<template>
    <!-- Metod: har renderda qayta ishlaydi -->
    <p>{{ getPending().length }}</p>
    <p>{{ getPending().length }}</p>
    <p>{{ getPending().length }}</p>

    <!-- computed: bir marta hisoblanadi, uch marta o'qiladi -->
    <p>{{ pending.length }}</p>
    <p>{{ pending.length }}</p>
    <p>{{ pending.length }}</p>
</template>
```
:::

::: composition
```vue
<template>
    <!-- Funksiya: har renderda qayta ishlaydi -->
    <p>{{ getPending().length }}</p>
    <p>{{ getPending().length }}</p>
    <p>{{ getPending().length }}</p>

    <!-- computed: bir marta hisoblanadi, uch marta o'qiladi -->
    <p>{{ pending.length }}</p>
    <p>{{ pending.length }}</p>
    <p>{{ pending.length }}</p>
</template>
```
:::

Ro'yxatda 10 ta element bo'lsa farq sezilmaydi. 5 000 ta element va har renderda `filter + sort` bo'lsa — sezilarli. Muhimi, kesh **avtomatik bekor qilinadi**: `items` o'zgarsa, keyingi o'qishda qayta hisoblanadi.

Kesh ishlashi uchun bitta shart bor: **`computed` faqat reaktiv bog'liqliklarga tayanishi kerak**. Quyidagi buziq:

```js
const now = computed(() => Date.now())     // ✗ Date.now() reaktiv emas
```

Bu qiymat bir marta hisoblanadi va **hech qachon** yangilanmaydi, chunki bog'liqlik yo'q — bekor qiladigan narsa yo'q.

## Kod: yozuvchi `computed` (getter + setter)

Ba'zan hosila qiymatga yozish kerak bo'ladi:

::: options
```js
export default {
  data() {
    return { firstName: 'Aziz', lastName: 'Karimov' }
  },
  computed: {
    fullName: {
      get() {
        return `${this.firstName} ${this.lastName}`
      },
      set(value) {
        const [first, ...rest] = value.split(' ')

        this.firstName = first
        this.lastName = rest.join(' ')
      },
    },
  },
}
```
:::

::: composition
```js
import { computed, ref } from 'vue'

const firstName = ref('Aziz')
const lastName = ref('Karimov')

const fullName = computed({
  get: () => `${firstName.value} ${lastName.value}`,
  set(value) {
    const [first, ...rest] = value.split(' ')

    firstName.value = first
    lastName.value = rest.join(' ')
  },
})
```
:::

```vue
<input v-model="fullName">
```

Eng ko'p ishlatiladigan joyi — `props` ustiga `v-model` qo'yish (24-bob) va Pinia store maydonini formaga bog'lash.

## Kod: `computed` bilan tartiblash va filtrlash zanjiri

```js
const query = ref('')
const sortKey = ref('title')
const onlyPending = ref(false)

const filtered = computed(() => {
  const term = query.value.trim().toLowerCase()

  return items.value.filter((item) => {
    if (onlyPending.value && item.done) return false
    if (term && !item.title.toLowerCase().includes(term)) return false

    return true
  })
})

const sorted = computed(() =>
  [...filtered.value].sort((a, b) => a[sortKey.value].localeCompare(b[sortKey.value])),
)
```

Ikki narsaga e'tibor:

- Zanjir bo'laklarga ajratilgan — har biri alohida keshlanadi. `sortKey` o'zgarsa, `filtered` **qayta hisoblanmaydi**.
- `sort` massivni joyida o'zgartiradi, shuning uchun `[...filtered.value]` nusxasi olindi. Aks holda `computed` o'z bog'liqligini o'zgartirgan bo'lardi — bu keyingi bo'limdagi qoidani buzadi.

## Muhandislik nuqtai nazari: `computed` — toza funksiya bo'lishi shart

`computed` ichida:

- **holat o'zgartirilmasin** (`items.value.push(...)`, `count.value++`);
- **so'rov yuborilmasin** (`fetch`, `axios`);
- **DOM o'zgartirilmasin**;
- **`Math.random()`, `Date.now()` ishlatilmasin.**

Sabab texnik: `computed` qachon va necha marta chaqirilishini siz nazorat qilmaysiz. U kesh bekor bo'lganda, kimdir o'qiganda ishlaydi. Nojo'ya ta'sir bo'lsa — natija oldindan aytib bo'lmaydigan bo'ladi (masalan, DevTools'da qiymatga qarash ham qayta hisoblatishi mumkin).

Nojo'ya ta'sir kerak bo'lsa — `watch` yoki `watchEffect` (16-bob). Bu ikkisi orasidagi chegara Vue arxitekturasining eng foydali qoidalaridan biri:

> **`computed` — qiymat hisoblaydi. `watch` — ish bajaradi.**

## Muhandislik nuqtai nazari: `computed` vs `watch` vs metod

| Vazifa | Vosita |
| --- | --- |
| Mavjud holatdan yangi qiymat | `computed` |
| Holat o'zgarganda so'rov yuborish, `localStorage` ga yozish, log | `watch` / `watchEffect` |
| Foydalanuvchi hodisasiga javob | Metod (`@click="save"`) |
| Argument qabul qiladigan hisob (`price(item)`) | Metod yoki `computed` qaytargan funksiya |

Oxirgi qatorga misol — `computed` argument qabul qila olmaydi, lekin funksiya qaytara oladi:

```js
const priceFor = computed(() => {
  const rate = currencyRate.value          // bog'liqlik shu yerda yig'iladi

  return (item) => (item.price * rate).toFixed(2)
})
```

```vue
<td>{{ priceFor(item) }}</td>
```

Bu naqshda kesh faqat `rate` uchun ishlaydi, har bir `item` uchun emas — lekin `rate` ni har chaqiruvda o'qishdan qutulasiz.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `computed` ichida `fetch` yoki holat o'zgartirish | Nazoratsiz va takroriy ishlaydi, cheksiz sikl bo'lishi mumkin | `watch` (16-bob) |
| `computed` ichida `sort()` ni nusxasiz chaqirish | Manba massivni o'zgartiradi → o'zini qayta ishga tushiradi | `[...arr].sort()` |
| Reaktiv bo'lmagan narsaga tayanish (`Date.now()`, `localStorage`) | Hech qachon yangilanmaydi | Reaktiv manba (`ref`) yoki `watch` |
| Hosila qiymatni `ref` da saqlab, `watch` bilan yangilash | Ortiqcha kod, sinxronlik xatolari | `computed` |
| Juda uzun bitta `computed` | Kesh donadorligi yo'qoladi, test qiyin | Zanjirga bo'ling |
| `computed` ga `.value` yozmaslik (`<script>` ichida) | Funksiya emas, `ComputedRef` obyekt | `pending.value` |

## Amaliyot

1. Vazifalar ro'yxatiga `query`, `onlyPending`, `sortKey` qo'shib, yuqoridagi zanjirni yozing.
2. `console.log` ni `filtered` ichiga qo'ying va `sortKey` ni o'zgartiring — `filtered` qayta hisoblanmasligini tasdiqlang.
3. `fullName` yozuvchi `computed` ini yozing va `v-model` bilan inputga ulang.
4. `computed` ichida `items.value.push(...)` qilib ko'ring (keyin o'chiring) — konsolda nima bo'lishini ko'ring va nega ekanini tushuntiring.

## Rasmiy hujjat

- Computed: <https://vuejs.org/guide/essentials/computed.html>
- `computed` API: <https://vuejs.org/api/reactivity-core.html#computed>
