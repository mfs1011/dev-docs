# 09 — Reaktivlik asoslari

[← Oldingi: Shablon sintaksisi](08-shablon-sintaksisi.md) · [Mundarija](README.md) · [Keyingi: Hisoblanuvchi xossalar →](10-computed.md)

## Tushuncha

Reaktiv holat e'lon qilishning ikki yo'li bor.

::: options
Options API'da holat `data()` funksiyasidan qaytariladigan obyekt:

```js
export default {
  data() {
    return {
      count: 0,
      user: { name: 'Aziz', age: 30 },
      tags: ['vue', 'frontend'],
    }
  },
  methods: {
    increment() {
      this.count++            // `this` orqali
      this.user.age++         // ichki xossa ham reaktiv
      this.tags.push('web')   // massiv metodlari ham
    },
  },
}
```

Vue `data()` qaytargan obyektni `reactive()` bilan o'raydi va `this` orqali ochadi.
:::

::: composition
Composition API'da ikkita funksiya bor: `ref()` va `reactive()`.

```js
import { reactive, ref } from 'vue'

const count = ref(0)                                  // istalgan tur
const user = reactive({ name: 'Aziz', age: 30 })      // faqat obyekt

count.value++          // ref — `.value` orqali
user.age++             // reactive — to'g'ridan-to'g'ri
```
:::

## Nega shunday: `ref` va `reactive` farqi

::: options
Options API'da bu tanlov ko'rinmaydi — `data()` hammasini o'zi hal qiladi. Lekin `data()` ichkarida `reactive()` ni ishlatadi, shuning uchun uning cheklovlari (pastdagi jadval) bu yerda ham amal qiladi: `data()` faqat obyekt qaytaradi, primitiv holat ham o'sha obyektning xossasi bo'ladi.

Composition API'ga o'tganingizda bu tanlov ochiq chiqadi — o'ng tomondagi almashtirgichni bosib ko'ring.
:::

::: composition
| | `ref` | `reactive` |
| --- | --- | --- |
| Qanday qiymat | Har qanday: son, satr, boolean, obyekt, massiv, `null` | Faqat obyekt/massiv/`Map`/`Set` |
| Kirish | `.value` (shablonda avtomatik) | To'g'ridan-to'g'ri |
| Butunlay almashtirish | ✓ `state.value = {...}` | ✗ bog'lanish uziladi |
| Destrukturizatsiya | ✗ (`toRefs` kerak) | ✗ (`toRefs` kerak) |
| Ichkarida | Obyekt qiymat uchun `reactive` ni chaqiradi | `Proxy` |

Amaliy tavsiya: **standart holatda `ref` ishlating.** Sabablari:

1. Bitta qoida yetarli — "hamma joyda `.value`", tanlov qilib o'tirilmaydi;
2. Qiymatni butunlay almashtirish mumkin (`data.value = await fetchAll()`), `reactive` da esa `Object.assign` kerak;
3. Composable'lardan `ref` qaytarish standart konvensiya (29-bob).

`reactive` qulay bo'ladigan joy — o'zaro bog'liq bir nechta maydonli lokal holat, masalan forma modeli:

```js
const form = reactive({ email: '', password: '', remember: false })
```
:::

## Kod: `ref` chuqurroq

```js
import { ref } from 'vue'

const count = ref(0)
const user = ref({ name: 'Aziz', skills: ['vue'] })

count.value++                     // 1
user.value.name = 'Bekzod'        // ichki o'zgarish ham reaktiv
user.value.skills.push('vite')    // massiv ham
user.value = { name: 'Dilnoza', skills: [] }   // butunlay almashtirish ham mumkin
```

`ref` obyekt qiymat olsa, uni ichkarida `reactive` bilan **chuqur** reaktiv qiladi. Chuqurlik kerak bo'lmasa — `shallowRef` (17 va 62-boblar).

Shablonda `.value` yozilmaydi:

```vue
<template>
    <p>{{ count }}</p>          <!-- .value avtomatik ochiladi -->
    <p>{{ user.name }}</p>
</template>
```

Bu "ochish" (unwrapping) faqat **yuqori darajadagi** `ref` uchun ishlaydi:

```js
const state = { count: ref(0) }    // oddiy obyekt ichida
```

```vue
<p>{{ state.count }}</p>           <!-- ✗ [object Object] -->
<p>{{ state.count.value }}</p>     <!-- ✓ -->
```

Shuning uchun `ref` larni oddiy obyekt ichiga tiqib qo'ymaslik kerak (`reactive` ichida esa avtomatik ochiladi).

## Kod: `reactive` cheklovlari

```js
import { reactive } from 'vue'

const state = reactive({ count: 0 })

// 1. Butunlay almashtirib bo'lmaydi
let s = reactive({ count: 0 })
s = reactive({ count: 5 })       // eski proxy'ni kuzatayotgan komponent yangisini ko'rmaydi

// 2. Destrukturizatsiya aloqani uzadi
const { count } = state          // oddiy son nusxasi
count++                          // state.count o'zgarmaydi

// 3. Funksiyaga qiymat sifatida uzatish ham uzadi
doSomething(state.count)         // ichkarida faqat son ko'rinadi

// 4. Primitiv bilan ishlamaydi
const n = reactive(0)            // ogohlantirish: value cannot be made reactive
```

Yechimlar 17-bobda (`toRefs`, `toRef`), lekin eng oddiy yechim — `ref` ishlatish.

## Kod: massivlar va to'plamlar

```js
const list = ref([1, 2, 3])

// Mutatsiya qiladigan metodlar — reaktiv
list.value.push(4)
list.value.splice(0, 1)
list.value.sort()

// Yangi massiv qaytaradigan metodlar — natijani qayta o'zlashtirish kerak
list.value = list.value.filter((n) => n % 2 === 0)
list.value = list.value.concat([9])

// Map va Set ham reaktiv
const seen = reactive(new Set())
seen.add('a')        // ✓ kuzatiladi
```

## Kod: DOM qachon yangilanadi

```js
import { nextTick, ref } from 'vue'

const count = ref(0)

async function bump() {
  count.value++
  console.log(el.textContent)      // ESKI qiymat

  await nextTick()
  console.log(el.textContent)      // YANGI qiymat
}
```

Vue o'zgarishlarni to'playdi va joriy sinxron blok tugagach bir marta render qiladi (07-bob). Shuning uchun:

- Bir funksiyada 10 ta qiymatni o'zgartirsangiz — bitta render;
- DOM'ga bog'liq o'lchov (`offsetHeight`, scroll pozitsiyasi) kerak bo'lsa — `await nextTick()`.

## Muhandislik nuqtai nazari: holatni qayerda saqlash

Holat joylashuvi bo'yicha to'rt daraja bor va ular orasidagi tanlov arxitektura qarori:

| Daraja | Vosita | Qachon |
| --- | --- | --- |
| Komponent ichida | `ref` / `data()` | Faqat shu komponentga tegishli (ochiq/yopiq, draft matn) |
| Bir nechta komponent | Props + emit (22, 23-bob) | Ota-bola munosabati aniq |
| Uzoq daraxt | `provide`/`inject` (27-bob) | Tema, til, forma konteksti |
| Butun ilova | Pinia (42-bob) | Foydalanuvchi, savat, keshlangan server ma'lumoti |

Eng keng tarqalgan xato — hamma narsani global store'ga chiqarish. Holatni **ishlatiladigan joyga eng yaqin** saqlang: shunda o'chirish oson, test oson, xotira tez bo'shaydi.

## Muhandislik nuqtai nazari: hosila holatni saqlamang

```js
// ✗ Ikkita haqiqat manbai
const items = ref([])
const itemCount = ref(0)          // qo'lda yangilanadi → bir kun farq qiladi

// ✓ Bitta manba
const items = ref([])
const itemCount = computed(() => items.value.length)
```

Bu ma'lumotlar bazasidagi normalizatsiya bilan bir xil g'oya: bir faktni ikki joyda saqlasangiz, ular orasidagi sinxronlik — sizning muammoyingiz. Keshlash zarur bo'lsa, uni ataylab va aniq joyda qiling (`computed` aynan shuni beradi — 10-bob).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `count++` (`.value` siz) | `ref` obyekt; natija `NaN` yoki xato | `count.value++` |
| `const { user } = reactive({...})` | Reaktivlik uziladi | `toRefs()` yoki `ref` |
| `let state = reactive({}); state = {...}` | Kuzatuvchilar eski proxy'da qoladi | `Object.assign(state, yangi)` yoki `ref` |
| `ref` ni oddiy obyektga solib shablonga berish | Avtomatik ochilmaydi | Yuqori darajada `ref`, yoki `reactive` ichida |
| `props` ni o'zgartirish | Bir tomonlama oqim buziladi (22-bob) | `emit` yoki lokal nusxa |
| Har bir qiymat uchun alohida `watch` bilan "sinxron ushlash" | Qo'lda sinxronlash — xatolar manbai | `computed` |

## Amaliyot

1. `ref` va `reactive` bilan bir xil sanoqni yozing. Ikkalasini ham butunlay almashtirib ko'ring (`= {...}`) va farqni kuzating.
2. `const { count } = reactive({ count: 0 })` qilib, `count++` dan keyin shablon yangilanmasligini tasdiqlang. Keyin `toRefs` bilan tuzating (17-bobning avansi).
3. `list.value.push(...)` va `list.value = [...list.value, x]` — ikkalasi ham ishlaydi. Qaysi biri qachon afzal? Javobingizni 62-bobda tekshirasiz.
4. Tugma bosilganda `count` ni 3 marta oshiring va har oshirishdan keyin `console.log(el.textContent)` qiling. Nechta render bo'ldi? `nextTick` qo'shib qayta tekshiring.

## Rasmiy hujjat

- Reaktivlik asoslari: <https://vuejs.org/guide/essentials/reactivity-fundamentals.html>
- `ref` API: <https://vuejs.org/api/reactivity-core.html#ref>
- `reactive` API: <https://vuejs.org/api/reactivity-core.html#reactive>
