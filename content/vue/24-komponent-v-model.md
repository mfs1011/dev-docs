# 24 — Komponent `v-model`

[← Oldingi: Emits](23-emits.md) · [Mundarija](README.md) · [Keyingi: Fallthrough atributlar →](25-fallthrough-atributlar.md)

## Tushuncha

`v-model` faqat `<input>` uchun emas — o'z komponentingizga ham qo'yish mumkin:

```vue
<CurrencyInput v-model="price" />
<UiModal v-model:open="isOpen" />
```

Ichkarida bu props + emit juftligi. Vue 3.4 dan boshlab buni `defineModel()` bitta qatorga qisqartiradi.

## Kod: `defineModel` (Vue 3.4+, tavsiya etiladi)

```vue
<!-- CurrencyInput.vue -->
<script setup>
const model = defineModel({ type: Number, default: 0 })

function onInput(event) {
  model.value = Number(event.target.value)
}
</script>

<template>
    <input :value="model" type="number" @input="onInput">
</template>
```

```vue
<CurrencyInput v-model="price" />
```

`model` — oddiy `ref` kabi ishlaydi: o'qiysiz, yozasiz. Yozganingizda Vue avtomatik `update:modelValue` chiqaradi va ota holatini yangilaydi.

## Kod: `defineModel` siz (Vue 3.3 va undan eski)

::: options
```js
export default {
  props: { modelValue: Number },
  emits: ['update:modelValue'],
  computed: {
    model: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      },
    },
  },
}
```
:::

::: composition
```vue
<script setup>
const props = defineProps({ modelValue: Number })
const emit = defineEmits(['update:modelValue'])

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script>

<template>
    <input :value="model" @input="model = Number($event.target.value)">
</template>
```
:::

Ya'ni `defineModel` — shu 10 qatorning qisqartmasi. Mexanizmni bilib turish foydali: `v-model` hech qanday maxsus sehr emas.

## Kod: bir nechta model

```vue
<!-- UserForm.vue -->
<script setup>
const firstName = defineModel('firstName')
const lastName = defineModel('lastName')
</script>

<template>
    <input v-model="firstName">
    <input v-model="lastName">
</template>
```

```vue
<UserForm v-model:first-name="user.firstName" v-model:last-name="user.lastName" />
```

Nomli model juda foydali bo'ladigan joy — ko'rinish holati:

```vue
<UiModal v-model:open="isSettingsOpen">
    <SettingsForm />
</UiModal>
```

```vue
<!-- UiModal.vue -->
<script setup>
const open = defineModel('open', { type: Boolean, default: false })
</script>

<template>
    <div v-if="open" class="backdrop" @click.self="open = false">
        <div class="dialog">
            <slot />
            <button @click="open = false">Yopish</button>
        </div>
    </div>
</template>
```

Modal o'zini yopa oladi (`open = false`), lekin holat egasi — ota. Bu naqsh "controlled component" deb ataladi.

## Kod: modifikatorlar

O'z modifikatoringizni yozish mumkin:

```vue
<script setup>
const [model, modifiers] = defineModel({
  set(value) {
    if (modifiers.capitalize) {
      return value.charAt(0).toUpperCase() + value.slice(1)
    }

    return value
  },
})
</script>

<template>
    <input v-model="model">
</template>
```

```vue
<MyInput v-model.capitalize="title" />
```

`get`/`set` transformatorlari `defineModel` ning ikkinchi kuchli tomoni: qiymat komponentga kirishda va chiqishda o'zgartiriladi.

```js
// Sana: ichkarida Date, tashqarida ISO satr
const model = defineModel({
  get: (value) => (value ? new Date(value) : null),
  set: (value) => (value ? value.toISOString() : null),
})
```

## Kod: `required` va validatsiya

```js
const model = defineModel({ required: true })
const count = defineModel('count', { type: Number, default: 0, validator: (v) => v >= 0 })
```

`defineModel` prop sifatida ro'yxatdan o'tadi, shuning uchun `props` ning barcha sozlamalari (type, required, default, validator) ishlaydi.

## Muhandislik nuqtai nazari: `v-model` yoki oddiy props+emit

`v-model` — shakar. Uni qachon ishlatish kerak:

| Holat | Tanlov |
| --- | --- |
| Komponentning **asosiy qiymati** (input, select, date picker) | `v-model` |
| Ko'rinish holati (`open`, `expanded`, `active-tab`) | `v-model:open` |
| Bir nechta teng huquqli maydon | Nomli `v-model` lar yoki bitta obyekt prop |
| Hodisa "biror narsa bo'ldi" (`@submit`, `@remove`) | Oddiy emit — `v-model` emas |

Chegara: `v-model` "ikki tomonlama bog'lanish" bo'lgani uchun **ma'lumot egasi kimligi** xiralashadi. 5–6 ta `v-model` li komponent — bu allaqachon forma, uni bitta obyekt bilan boshqarish osonroq:

```vue
<!-- Ko'p model o'rniga -->
<UserForm v-model="form" />
```

```js
const form = defineModel({ type: Object, required: true })

function updateField(key, value) {
  form.value = { ...form.value, [key]: value }    // yangi obyekt — o'zgarishlarni kuzatish oson
}
```

## Muhandislik nuqtai nazari: obyekt model va mutatsiya

Obyekt `v-model` da ikki uslub bor:

```js
// 1. Mutatsiya — ota obyektni to'g'ridan-to'g'ri o'zgartiradi (props ichini o'zgartirish!)
form.value.email = 'a@b.c'

// 2. Almashtirish — yangi obyekt, ota `update:modelValue` oladi
form.value = { ...form.value, email: 'a@b.c' }
```

Birinchisi ishlaydi (obyekt havolasi bir xil), lekin `watch` ota tomonda ishlamaydi va "kim o'zgartirdi" ko'rinmaydi. Ikkinchisi to'g'ri, garchi biroz ko'proq kod bo'lsa ham.

Bu qoida katta formalarda unumdorlikka ta'sir qiladi: har harfda yangi obyekt yaratiladi. 20+ maydonli formada maydon darajasida `v-model` (`v-model="form.email"`) afzal — Vue faqat o'sha maydonni yangilaydi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `props.modelValue` ni to'g'ridan-to'g'ri o'zgartirish | Props faqat o'qish uchun | `defineModel` yoki `emit('update:modelValue')` |
| `v-model` va `:model-value` ni birga yozish | Ikkisi to'qnashadi | Faqat `v-model` |
| Vue 3.3 da `defineModel` ishlatish | Makros mavjud emas | Versiyani tekshiring yoki `computed` naqshi |
| Modal'da `open` ni faqat ichkarida saqlash | Ota holatni bilmaydi, sinxronlik yo'qoladi | `v-model:open` |
| 8 ta `v-model` li komponent | Shartnoma o'qib bo'lmas holga keladi | Obyekt model yoki slotlar |
| Obyekt model ichini mutatsiya qilib, otada `watch` kutish | Havola o'zgarmagani uchun ishlamaydi | Yangi obyekt bilan almashtirish yoki `deep: true` |

## Amaliyot

1. `CurrencyInput` yozing: ichkarida son, tashqarida ham son; `1 000 000` ko'rinishida formatlab ko'rsating (15-bobdagi formatlash naqshi bilan).
2. `UiModal` ni `v-model:open` bilan yozing; `Escape` va backdrop bosilganda yopilsin.
3. `defineModel` ning `get`/`set` transformatorlari bilan sana maydonini yozing (ichkarida `Date`, tashqarida ISO satr).
4. `.capitalize` modifikatorini yozing va ishlatib ko'ring.

## Rasmiy hujjat

- Komponent `v-model`: <https://vuejs.org/guide/components/v-model.html>
- `defineModel`: <https://vuejs.org/api/sfc-script-setup.html#definemodel>
