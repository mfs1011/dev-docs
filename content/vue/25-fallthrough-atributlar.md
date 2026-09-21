# 25 — Fallthrough atributlar

[← Oldingi: Komponent `v-model`](24-komponent-v-model.md) · [Mundarija](README.md) · [Keyingi: Slotlar →](26-slotlar.md)

## Tushuncha

Komponentga berilgan, lekin `props` va `emits` da e'lon qilinmagan atributlar **ildiz elementga avtomatik tushadi**. Buni "fallthrough" (o'tib ketuvchi) atributlar deyiladi.

```vue
<!-- UiButton.vue -->
<template>
    <button class="btn"><slot /></button>
</template>
```

```vue
<UiButton class="mt-4" id="save" data-testid="save-btn" @click="save">Saqlash</UiButton>
```

Natija:

```html
<button class="btn mt-4" id="save" data-testid="save-btn">Saqlash</button>
```

`class` va `style` **birlashadi**, qolgan atributlar shunchaki qo'shiladi, `@click` esa ildiz elementga ulanadi.

## Nega shunday

Bu mexanizm komponentni "HTML elementiga o'xshash" qiladi. Agar u bo'lmasa, har bir o'ram komponent uchun `id`, `title`, `aria-*`, `data-*`, `tabindex` kabi o'nlab atributni props sifatida e'lon qilishga to'g'ri kelardi.

Natijada `<UiButton>` xuddi `<button>` kabi ishlatiladi: dizayn tizimi komponentlari uchun bu juda muhim.

## Kod: `$attrs` va `inheritAttrs: false`

Ba'zan atributlar ildizga emas, ichkaridagi elementga kerak:

```vue
<!-- ✗ Atributlar tashqi div'ga tushadi, input'ga emas -->
<template>
    <div class="field">
        <label>{{ label }}</label>
        <input>
    </div>
</template>
```

```vue
<!-- ✓ -->
<script setup>
defineOptions({ inheritAttrs: false })

defineProps({ label: String })
</script>

<template>
    <div class="field">
        <label>{{ label }}</label>
        <input v-bind="$attrs">
    </div>
</template>
```

`inheritAttrs: false` avtomatik tushishni o'chiradi, `v-bind="$attrs"` esa hammasini qo'lda kerakli joyga qo'yadi.

::: options
```js
export default {
  inheritAttrs: false,
  props: { label: String },
}
```
:::

::: composition
`<script setup>` ichida `defineOptions` makrosi (Vue 3.3+):

```js
defineOptions({ inheritAttrs: false })
```

Eski versiyalarda ikkinchi `<script>` bloki yoziladi:

```vue
<script>
export default { inheritAttrs: false }
</script>

<script setup>
// ...
</script>
```
:::

## Kod: atributlarni ajratib joylashtirish

Ba'zan class'ni tashqi o'ramga, qolganini inputga berish kerak:

```vue
<script setup>
import { computed, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()

const wrapperAttrs = computed(() => ({ class: attrs.class, style: attrs.style }))
const inputAttrs = computed(() => {
  const { class: _c, style: _s, ...rest } = attrs

  return rest
})
</script>

<template>
    <div class="field" v-bind="wrapperAttrs">
        <label>{{ label }}</label>
        <input v-bind="inputAttrs">
    </div>
</template>
```

`useAttrs()` — `$attrs` ning `<script>` ichidagi ko'rinishi. U **reaktiv, lekin `ref` emas** (`attrs.class` deb o'qiladi) va har renderda yangilanadi.

## Kod: ko'p ildizli komponent

```vue
<!-- Fragment: Vue qayerga qo'yishni bilmaydi → ogohlantirish -->
<template>
    <dt>{{ label }}</dt>
    <dd>{{ value }}</dd>
</template>
```

Yechim — aniq ko'rsatish:

```vue
<template>
    <dt>{{ label }}</dt>
    <dd v-bind="$attrs">{{ value }}</dd>
</template>
```

## Kod: hodisalar ham fallthrough

```vue
<UiButton @click="save" @focus="onFocus" />
```

E'lon qilinmagan `@focus` ildiz `<button>` ga ulanadi. Lekin komponent `emits: ['click']` deb e'lon qilsa, `@click` endi **fallthrough emas** — u komponent hodisasi bo'ladi va faqat `emit('click')` chaqirilganda ishlaydi.

Bu tuzoqni bilib qo'ying:

```vue
<!-- Bola emits: ['click'] deb e'lon qilgan, lekin hech qachon emit qilmaydi -->
<script setup>
defineEmits(['click'])       // ✗ endi native click ota'ga yetmaydi
</script>
```

Qoida: **native hodisa nomini emits'da e'lon qilmang**, agar uni o'zingiz chiqarmasangiz.

## Muhandislik nuqtai nazari: dizayn tizimi komponentlari uchun

`UiButton`, `UiInput`, `UiCard` kabi komponentlar uchun fallthrough — asosiy mexanizm. Tavsiya qilinadigan naqsh:

```vue
<script setup>
defineOptions({ inheritAttrs: false })

defineProps({
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
})
</script>

<template>
    <button
        class="btn"
        :class="[`btn-${variant}`, `btn-${size}`]"
        v-bind="$attrs"
    >
        <slot />
    </button>
</template>
```

Shunda ishlatuvchi `type="submit"`, `aria-label`, `data-testid`, `@click` — hammasini odatdagidek beradi, siz esa faqat `variant`/`size` ni props sifatida boshqarasiz.

## Muhandislik nuqtai nazari: testlash va `data-testid`

Fallthrough atributlarining amaliy foydasi test yozishda ko'rinadi:

```vue
<UserCard data-testid="user-card-42" :user="user" />
```

```js
// Playwright (54-bob)
await page.getByTestId('user-card-42').click()
```

`data-testid` ni props sifatida e'lon qilish shart emas — u o'zi ildiz elementga tushadi. Komponentga `inheritAttrs: false` qo'ysangiz, buni qayta ta'minlashni unutmang, aks holda testlar "element topilmadi" deb yiqiladi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| O'ram div bor komponentda atributlar inputga tushishini kutish | Ular ildizga tushadi | `inheritAttrs: false` + `v-bind="$attrs"` |
| Ko'p ildizli komponentga atribut berish | "Extraneous non-props attributes" ogohlantirishi | Ildizni tanlab `v-bind="$attrs"` |
| Native hodisani `emits` da e'lon qilib, emit qilmaslik | Hodisa ota'ga yetmaydi | E'lon qilmang yoki qo'lda `emit` qiling |
| `inheritAttrs: false` qo'yib, `$attrs` ni umuman ishlatmaslik | `class`, `data-testid`, `aria-*` yo'qoladi | Kerakli joyga `v-bind` |
| `$attrs` ni props bilan aralashtirib yuborish | E'lon qilingan props `$attrs` ga tushmaydi | Ikkisining chegarasini eslang |
| `useAttrs()` natijasini destrukturizatsiya qilish | Reaktivlik yo'qoladi | `attrs.x` orqali o'qing yoki `computed` |

## Amaliyot

1. `UiInput` yozing: `<label>` + `<input>`, `inheritAttrs: false` bilan barcha atributlarni inputga uzating. `placeholder`, `required`, `@focus` berib tekshiring.
2. Class'ni o'ramga, qolganini inputga ajratadigan variantni yozing.
3. Ko'p ildizli komponent yarating va atribut berib, ogohlantirishni o'qing. Keyin `v-bind="$attrs"` bilan tuzating.
4. `defineEmits(['click'])` ni qo'shib, native `@click` ishlamay qolishini kuzating, keyin olib tashlang.

## Rasmiy hujjat

- Fallthrough atributlar: <https://vuejs.org/guide/components/attrs.html>
- `useAttrs`: <https://vuejs.org/api/composition-api-helpers.html#useattrs>
