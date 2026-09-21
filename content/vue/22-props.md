# 22 — Props

[← Oldingi: Registratsiya](21-registratsiya.md) · [Mundarija](README.md) · [Keyingi: Emits →](23-emits.md)

## Tushuncha

Props — otadan bolaga uzatiladigan ma'lumot. Bola uchun ular **faqat o'qish uchun**.

::: options
```js
export default {
  // Oddiy ro'yxat
  props: ['title', 'count'],

  // To'liq shakl — tavsiya etiladi
  props: {
    title: String,
    count: {
      type: Number,
      required: true,
    },
    tags: {
      type: Array,
      default: () => [],
    },
  },
}
```

Shablonda va mantiqda `this.title` orqali ishlatiladi.
:::

::: composition
```vue
<script setup>
const props = defineProps({
  title: String,
  count: {
    type: Number,
    required: true,
  },
  tags: {
    type: Array,
    default: () => [],
  },
})

console.log(props.count)
</script>

<template>
    <h2>{{ title }}</h2>      <!-- shablonda props. shart emas -->
</template>
```

`defineProps` — kompilyator makrosi: import qilinmaydi, faqat `<script setup>` ichida ishlaydi.
:::

## Kod: uzatish shakllari

```vue
<template>
    <!-- Statik satr -->
    <UserCard title="Profil" />

    <!-- Dinamik (JS ifodasi) -->
    <UserCard :title="pageTitle" />

    <!-- Son, boolean, massiv, obyekt — har doim `:` bilan -->
    <UserCard :count="5" :active="true" :tags="['a', 'b']" :user="{ id: 1 }" />

    <!-- Boolean qisqartma: mavjud bo'lsa true -->
    <UserCard active />

    <!-- Obyektni butunlay yoyish -->
    <UserCard v-bind="userProps" />

    <!-- Bir xil nomdagi qisqartma (Vue 3.4+) -->
    <UserCard :title :count />
</template>
```

`title="5"` va `:title="5"` farqi muhim: birinchisi **satr** `'5'`, ikkinchisi **son** `5`.

Nomlash: shablonda `kebab-case`, JS'da `camelCase` — Vue ikkalasini bir-biriga moslaydi.

```vue
<UserCard :user-name="name" />    <!-- props: { userName } -->
```

## Kod: validatsiya

```js
defineProps({
  // Bir nechta tur
  id: [String, Number],

  // Majburiy
  user: { type: Object, required: true },

  // Standart qiymat
  size: { type: String, default: 'md' },

  // Obyekt/massiv uchun default — funksiya bo'lishi SHART
  config: { type: Object, default: () => ({ compact: false }) },

  // Maxsus tekshiruv
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'ghost', 'danger'].includes(value),
  },

  // Funksiya prop (default — funksiyani qaytaruvchi emas, o'zi)
  formatter: { type: Function, default: (value) => String(value) },
})
```

Obyekt/massiv default'i funksiya bo'lishi kerak, chunki aks holda **barcha nusxalar bitta obyektni bo'lishardi** — bittasida o'zgarish hammasiga ta'sir qilardi (19-bobdagi `data()` bilan bir xil sabab).

Validatsiya faqat **dev rejimida** ishlaydi va konsolga ogohlantirish yozadi; production'da tekshirilmaydi.

## Kod: Boolean props qoidalari

```js
defineProps({ disabled: Boolean, loading: Boolean })
```

```vue
<UiButton disabled />                  <!-- true -->
<UiButton :disabled="false" />         <!-- false -->
<UiButton />                           <!-- false (Boolean default'i) -->
<UiButton disabled="" />               <!-- true -->
```

Boolean tur maxsus: atribut mavjud bo'lsa `true`, yo'q bo'lsa `false`. Bu HTML'ning `disabled`, `checked` semantikasiga mos.

## Kod: bir tomonlama oqim

```js
const props = defineProps({ count: Number })

// ✗ Xato: props faqat o'qish uchun
props.count++

// ✗ Obyekt prop ichini o'zgartirish — texnik jihatdan ishlaydi, lekin yomon
props.user.name = 'Yangi'
```

Uchta to'g'ri yo'l:

```js
// 1. Lokal nusxa (boshlang'ich qiymat sifatida ishlatish)
const localCount = ref(props.count)

// 2. Hosila qiymat
const doubled = computed(() => props.count * 2)

// 3. Otaga xabar berish (23-bob)
const emit = defineEmits(['update:count'])
emit('update:count', props.count + 1)
```

Nega bunday cheklov? **Ma'lumot oqimi bir tomonlama bo'lsa, xatoni topish oson.** Ekranda noto'g'ri son ko'rinsa, uni faqat bitta joy — ma'lumot egasi bo'lgan komponent o'zgartirgan bo'ladi. Ikki tomonlama o'zgartirishga ruxsat bersangiz, 10 ta komponent orasida "kim o'zgartirdi?" degan savol qiyinlashadi.

Obyekt propni o'zgartirish JavaScript'da mumkin (havola uzatiladi), lekin Vue buni ogohlantirmaydi — shuning uchun intizom sizdan. Kerak bo'lsa `readonly` (17-bob) bilan himoyalang.

## Kod: props destrukturizatsiyasi (Vue 3.5+)

```js
// Vue 3.5+ — reaktivlik saqlanadi (kompilyator qo'llab-quvvatlaydi)
const { title, size = 'md' } = defineProps(['title', 'size'])

watch(() => size, (value) => console.log(value))     // ✓ ishlaydi
```

Eski versiyalarda esa bu bog'lanishni uzardi (17-bob). Loyihangizdagi Vue versiyasini tekshiring: `npm ls vue`.

## Muhandislik nuqtai nazari: props API'sini loyihalash

Yomon props dizayni komponentni ishlatib bo'lmas holga keltiradi:

```vue
<!-- ✗ 14 ta boolean: kombinatsiyalar portlaydi -->
<UiButton primary large rounded outlined loading disabled block icon-only />

<!-- ✓ Kam sonli, ma'noli props -->
<UiButton variant="primary" size="lg" :loading="saving" />
```

Qoidalar:

1. **Bir o'lchov — bitta prop.** `primary`/`danger`/`ghost` — bu bitta `variant` o'lchovi, uchta boolean emas.
2. **Boolean faqat haqiqiy ha/yo'q uchun** (`disabled`, `loading`).
3. **5–7 props dan oshsa** — komponent juda ko'p ish qilyapti; slotlarga (26-bob) yoki kichikroq komponentlarga bo'ling.
4. **Standart qiymat "eng ko'p ishlatiladigan" bo'lsin** — shunda chaqiruvlar qisqaradi.
5. **Obyekt prop o'rniga aniq maydonlar** — `:config="{...}"` har renderda yangi obyekt yaratadi va bola komponentni ortiqcha yangilaydi.

## Muhandislik nuqtai nazari: prop drilling va uning chegarasi

Ma'lumotni 4–5 daraja pastga uzatish (`props` → `props` → `props`) — "prop drilling". Bir necha yechim bor:

| Chuqurlik | Yechim |
| --- | --- |
| 1–2 daraja | Props — normal |
| 3+ daraja, bir domen ichida | `provide`/`inject` (27-bob) |
| Butun ilova bo'ylab | Pinia (42-bob) |
| Ko'p daraja, lekin faqat ko'rinish | Slotlar (26-bob) — mazmunni yuqorida yozib, pastga uzatish |

Slot yechimini boshlovchilar kamdan-kam eslaydi, lekin u ko'pincha eng toza: ma'lumot pastga tushmaydi — ko'rinish yuqorida qoladi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `<Comp count="5" />` (`:` yo'q) | Satr uzatiladi | `:count="5"` |
| Obyekt default'ini funksiyasiz berish | Nusxalar bitta obyektni bo'lishadi | `default: () => ({})` |
| Props'ni to'g'ridan-to'g'ri o'zgartirish | Oqim buziladi, ogohlantirish | `emit` yoki lokal nusxa |
| Props'ni `ref(props.x)` qilib, keyin ota o'zgartirganda yangilanmasligidan hayron bo'lish | Nusxa bir marta olinadi | `computed` yoki `watch` bilan sinxron |
| 10+ boolean props | Kombinatsiyalar boshqarib bo'lmas holga keladi | `variant`/`size` kabi o'lchovlar |
| `:style`/`:config` ni inline obyekt bilan berish | Har renderda yangi obyekt | Konstanta yoki `computed` |
| Vue 3.4 va undan eskida props destrukturizatsiyasi | Reaktivlik yo'qoladi | `props.x` orqali |

## Amaliyot

1. `UiButton` yozing: `variant`, `size`, `loading`, `disabled` props'lari, validator bilan. Noto'g'ri `variant` bering va konsoldagi ogohlantirishni o'qing.
2. `tags: { type: Array, default: [] }` deb yozing (funksiyasiz), ikkita nusxa yarating va bittasida massivga element qo'shing. Nima bo'lishini kuzating, keyin tuzating.
3. Bolada `props.count++` yozib ko'ring — ogohlantirish matnini o'qing.
4. Uch darajali prop drilling yasang, keyin uni slot yoki `provide` bilan qayta yozing va qaysi biri qisqaroq ekanini solishtiring.

## Rasmiy hujjat

- Props: <https://vuejs.org/guide/components/props.html>
- `defineProps`: <https://vuejs.org/api/sfc-script-setup.html#defineprops-defineemits>
