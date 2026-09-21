# 15 — Forma bog'lash (`v-model`)

[← Oldingi: Hodisalar](14-hodisalar.md) · [Mundarija](README.md) · [Keyingi: Kuzatuvchilar →](16-watch-va-watcheffect.md)

## Tushuncha

`v-model` — "qiymatni ko'rsat va o'zgarganda holatga yoz" naqshining qisqartmasi:

```vue
<!-- Bu ikkisi bir xil -->
<input v-model="query">
<input :value="query" @input="query = $event.target.value">
```

Ikki tomonlama bog'lanish deyiladi, lekin ichkarida hech qanday sehr yo'q: bir tomonga `v-bind`, ikkinchi tomonga `v-on`.

## Kod: input turlari

```vue
<script setup>
import { ref } from 'vue'

const text = ref('')
const message = ref('')
const agreed = ref(false)
const interests = ref([])          // checkbox guruhi → massiv
const plan = ref('pro')            // radio
const country = ref('uz')          // select
const languages = ref([])          // multiple select
</script>

<template>
    <input v-model="text" type="text">
    <textarea v-model="message"></textarea>

    <!-- Yakka checkbox → boolean -->
    <input v-model="agreed" type="checkbox">

    <!-- Checkbox guruhi → massiv (value kerak) -->
    <input v-model="interests" type="checkbox" value="vue">
    <input v-model="interests" type="checkbox" value="node">

    <!-- Radio -->
    <input v-model="plan" type="radio" value="free">
    <input v-model="plan" type="radio" value="pro">

    <select v-model="country">
        <option value="uz">O'zbekiston</option>
        <option value="kz">Qozog'iston</option>
    </select>

    <select v-model="languages" multiple>
        <option value="uz">O'zbek</option>
        <option value="en">Ingliz</option>
    </select>
</template>
```

`<textarea>` ichiga interpolyatsiya yozib bo'lmaydi — `{{ message }}` emas, `v-model` ishlatiladi.

## Kod: checkbox uchun maxsus qiymatlar

```vue
<input
    v-model="status"
    type="checkbox"
    true-value="active"
    false-value="archived"
>
```

Endi `status` `true`/`false` emas, `'active'`/`'archived'` bo'ladi. Obyekt qiymat kerak bo'lsa `:true-value="{...}"` shaklida bog'lanadi.

## Kod: `<option>` ga obyekt bog'lash

```vue
<select v-model="selectedUser">
    <option v-for="user in users" :key="user.id" :value="user">
        {{ user.name }}
    </option>
</select>
```

`:value="user"` — obyektning **o'zi**. `v-model` uni tanlanganda `selectedUser` ga yozadi. Bu satrga aylantirishdan (`JSON.stringify`) toza, lekin identiklikka e'tibor bering: serverdan qayta yuklangan ro'yxatdagi obyekt eski obyekt bilan `===` bo'yicha teng bo'lmaydi va select bo'sh ko'rinadi. Shuning uchun amalda ko'pincha ID bog'lanadi:

```vue
<select v-model="selectedUserId">
    <option v-for="user in users" :key="user.id" :value="user.id">{{ user.name }}</option>
</select>
```

## Kod: modifikatorlar

```vue
<!-- .lazy — `input` emas, `change` hodisasida yangilanadi -->
<input v-model.lazy="query">

<!-- .number — songa aylantiradi (bo'sh bo'lsa satr qoladi) -->
<input v-model.number="age" type="number">

<!-- .trim — boshi/oxiridagi bo'shliqni olib tashlaydi -->
<input v-model.trim="username">

<!-- Birga ishlatish -->
<input v-model.lazy.trim="title">
```

`.lazy` foydali bo'ladigan joy — har harfda og'ir hisob yoki so'rov bo'lganda (lekin qidiruv uchun `debounce` afzal, 16-bob).

## Kod: `v-model` va obyekt forma

```vue
<script setup>
import { reactive } from 'vue'

const form = reactive({
  name: '',
  email: '',
  password: '',
})

function submit() {
  console.log({ ...form })
}
</script>

<template>
    <form @submit.prevent="submit">
        <input v-model.trim="form.name" placeholder="Ism">
        <input v-model.trim="form.email" type="email" placeholder="Pochta">
        <input v-model="form.password" type="password" placeholder="Parol">

        <button type="submit">Yuborish</button>
    </form>
</template>
```

Forma maydonlari bir butun bo'lgani uchun `reactive` bu yerda tabiiy ko'rinadi. `ref` bilan ham bo'ladi: `form.value.name`.

## Kod: komponentda `v-model`

```vue
<!-- Ota -->
<CurrencyInput v-model="amount" />
```

```vue
<!-- CurrencyInput.vue — Vue 3.4+ -->
<script setup>
const model = defineModel({ type: Number, default: 0 })
</script>

<template>
    <input
        :value="model"
        type="number"
        @input="model = Number($event.target.value)"
    >
</template>
```

`defineModel` va bir nechta model, modifikatorlar — 24-bobda to'liq.

## Muhandislik nuqtai nazari: nazoratli va nazoratsiz input

Vue'da `v-model` ishlatilgan input **nazoratli**: ekranda ko'ringan qiymat holatdan keladi. Bu ikkita foydani beradi:

1. Qiymatni istalgan paytda dasturiy o'zgartirish mumkin (tozalash, formatlash, serverdan to'ldirish);
2. Ekrandagi narsa va holat hech qachon farq qilmaydi.

Narxi — har bosishda render. 99% holatda bu sezilmaydi. Lekin katta formada (50+ maydon) yoki har harfda og'ir `computed` ishlaganda sezilishi mumkin; unda `.lazy` yoki lokal komponentga ajratish yordam beradi.

Ba'zi holatlarda nazoratsiz ishlash to'g'ri bo'ladi: masalan `<input type="file">` — uning qiymatini dastur o'rnata olmaydi (xavfsizlik cheklovi), shuning uchun `v-model` ishlamaydi:

```vue
<input type="file" @change="onFileChange">
```

```js
function onFileChange(event) {
  files.value = Array.from(event.target.files)
}
```

## Muhandislik nuqtai nazari: forma qiymati va formatlash

"Ekranda ko'rinadigan matn" va "saqlanadigan qiymat" ko'pincha bir xil emas: telefon raqami `+998 90 123-45-67` ko'rinadi, bazaga `998901234567` yoziladi.

Yechim — yozuvchi `computed` (10-bob):

```js
const raw = ref('998901234567')

const formatted = computed({
  get: () => raw.value.replace(/^(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})$/, '+$1 $2 $3-$4-$5'),
  set(value) {
    raw.value = value.replace(/\D/g, '')
  },
})
```

```vue
<input v-model="formatted">
```

Bu naqsh valyuta, sana, foiz — hamma formatlangan maydon uchun ishlaydi va komponentga o'ralsa (`<CurrencyInput>`), butun ilova bo'ylab qayta ishlatiladi.

## Muhandislik nuqtai nazari: validatsiya qayerda

Qisqa javob: **ikkala tomonda ham.** Klientdagi validatsiya — UX (tez javob), serverdagi — haqiqiy himoya. Klient validatsiyasini chetlab o'tish trivial (DevTools yoki to'g'ridan-to'g'ri so'rov).

Klient tomonda uch daraja bor:

1. **HTML atributlari** (`required`, `type="email"`, `minlength`) — eng arzon, brauzer o'zi qiladi;
2. **Qo'lda `computed` tekshiruvlar** — kichik formalar uchun yetarli;
3. **Sxema kutubxonasi** (zod, valibot) + forma kutubxonasi (VeeValidate) — katta formalar uchun (45-bob).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `v-model` bilan birga `:value` yozish | Ikkisi bir-birini bosadi | Faqat `v-model` |
| `<textarea>{{ text }}</textarea>` | Interpolyatsiya ishlamaydi | `<textarea v-model="text">` |
| Checkbox guruhida `value` bermaslik | Hammasi bitta boolean'ga bog'lanadi | Har biriga `value` |
| `type="number"` da `.number` ni unutish | Qiymat satr bo'lib qoladi (`'5' + 1 === '51'`) | `v-model.number` |
| `<input type="file" v-model="file">` | Brauzer file inputga qiymat o'rnatishga ruxsat bermaydi | `@change` bilan qo'lda |
| Props'ni to'g'ridan-to'g'ri `v-model` qilish | Props faqat o'qish uchun (22-bob) | `defineModel` yoki lokal nusxa |
| Faqat klient validatsiyasiga ishonish | Osongina chetlab o'tiladi | Serverda ham tekshirish |

## Amaliyot

1. Ro'yxatdan o'tish formasini yig'ing: ism, pochta, parol, "shartlarga roziman" checkbox, tarif radio, davlat select. Yuborishda `console.log` qiling.
2. `v-model.number` va usiz `type="number"` ni solishtiring: `typeof` ni ekranga chiqaring.
3. Telefon maskasi uchun yozuvchi `computed` yozing.
4. Checkbox guruhi bilan tanlangan qiziqishlarni massivga yig'ing va ekranda `join(', ')` bilan ko'rsating.

## Rasmiy hujjat

- Forma bog'lash: <https://vuejs.org/guide/essentials/forms.html>
- `v-model` API: <https://vuejs.org/api/built-in-directives.html#v-model>
