# 23 — Emits (komponent hodisalari)

[← Oldingi: Props](22-props.md) · [Mundarija](README.md) · [Keyingi: Komponent `v-model` →](24-komponent-v-model.md)

## Tushuncha

Props — pastga, emits — yuqoriga. Bola komponent "menda shunday bo'ldi" deb xabar beradi, otada qaror qabul qilinadi.

::: options
```js
export default {
  emits: ['remove', 'select'],
  methods: {
    onDelete() {
      this.$emit('remove', this.user.id)
    },
  },
}
```
:::

::: composition
```vue
<script setup>
const emit = defineEmits(['remove', 'select'])

function onDelete() {
  emit('remove', props.user.id)
}
</script>

<template>
    <button @click="emit('select', user.id)">Tanlash</button>
</template>
```
:::

```vue
<!-- Ota -->
<UserCard :user="user" @remove="deleteUser" @select="openUser" />
```

## Kod: emits deklaratsiyasi va validatsiya

```js
// Oddiy ro'yxat
const emit = defineEmits(['submit', 'cancel'])

// Validatsiya bilan (dev rejimida tekshiriladi)
const emit = defineEmits({
  submit: (payload) => {
    if (!payload.email) {
      console.warn('submit: email majburiy')
      return false
    }

    return true
  },
  cancel: null,        // tekshiruvsiz
})
```

Emits'ni **e'lon qilish majburiy emas**, lekin kerak. Sabablari:

1. Komponent shartnomasi hujjatlashadi — faylni ochgan odam nimalar chiqishini ko'radi;
2. E'lon qilingan hodisa `$attrs` ga tushmaydi (25-bob), ya'ni ildiz elementga ikki marta ulanmaydi;
3. TypeScript'da to'liq tip chiqadi (49-bob).

## Kod: argumentlar va `$event`

```js
emit('update', { id: 1, title: 'Yangi' })
emit('change', value, oldValue)          // bir nechta argument
```

```vue
<!-- Ota tomonda -->
<Comp @update="onUpdate" />              <!-- onUpdate(payload) -->
<Comp @update="onUpdate($event, 'qo\'shimcha')" />
<Comp @change="(v, old) => log(v, old)" />
```

Inline ishlov beruvchida birinchi argument `$event` deb ataladi (bir nechta argument bo'lsa, faqat birinchisi).

## Kod: native hodisalarni uzatish

```vue
<!-- Bola: UiInput.vue -->
<template>
    <input class="input">
</template>
```

```vue
<!-- Ota -->
<UiInput @focus="onFocus" @keyup.enter="search" />
```

Bu ishlaydi: e'lon qilinmagan tinglovchilar ildiz elementga **avtomatik** tushadi (fallthrough, 25-bob). Lekin bola komponent o'zi ham `@focus` chiqarsa, ikki marta ishlaydi — shuning uchun chiqariladigan hodisalarni e'lon qilish muhim.

Ildiz element ko'p bo'lsa yoki input ichkarida bo'lsa, qo'lda uzatish kerak:

```vue
<template>
    <label class="field">
        <span>{{ label }}</span>
        <input v-bind="$attrs">
    </label>
</template>

<script setup>
defineOptions({ inheritAttrs: false })
</script>
```

## Kod: `update:` konvensiyasi

`v-model` shu konvensiyaga tayanadi (24-bob):

```js
const emit = defineEmits(['update:modelValue', 'update:open'])

emit('update:modelValue', newValue)
```

```vue
<Comp v-model="text" />                  <!-- = :model-value + @update:model-value -->
<Comp v-model:open="isOpen" />
```

## Muhandislik nuqtai nazari: hodisa nomlash

| Yomon | Yaxshi | Sabab |
| --- | --- | --- |
| `@click-button` | `@submit` | Hodisa **nima bo'lganini** bildirsin, qanday bosilganini emas |
| `@change-user-name` | `@update:name` | Konvensiyaga mos |
| `@do-save` | `@save` | Buyruq emas, faktni bildiring |
| `@onSave` | `@save` | `on` prefiksi shablonda `@` bilan takrorlanadi |

Umumiy tamoyil: **bola nima sodir bo'lganini aytadi, ota nima qilishni hal qiladi.** `@delete` emas, `@remove-requested` deb nomlash ba'zan aniqroq: bola o'chirmaydi, u faqat so'raydi.

## Muhandislik nuqtai nazari: emit yoki callback prop

Ikkala yondashuv ham ishlaydi:

```vue
<!-- Emit -->
<UserCard @remove="deleteUser" />

<!-- Callback prop -->
<UserCard :on-remove="deleteUser" />
```

Vue'da **emit — standart**, chunki:

- Shablonda `@` sintaksisi va modifikatorlar (`.once`, `.prevent`) ishlaydi;
- Bir hodisaga bir nechta tinglovchi ulanishi mumkin;
- Fallthrough mexanizmi bilan tabiiy birlashadi.

Callback prop qulay bo'ladigan holat — natija qaytarish kerak bo'lganda:

```vue
<DataTable :row-class="(row) => row.overdue ? 'is-late' : ''" />
```

Emit hech narsa qaytara olmaydi (u faqat xabar), shuning uchun "so'rab-natija olish" uchun callback prop yoki slot ishlatiladi.

## Muhandislik nuqtai nazari: hodisa yoki store

Chuqur daraxtda hodisani har qavatda qayta chiqarish (`emit` zanjiri) zerikarli:

```
CartButton → CartItem → CartList → CartPage → App
```

Bunday holatda ikki alternativa bor:

1. **Pinia action** (42-bob) — `cart.remove(id)` to'g'ridan-to'g'ri chaqiriladi;
2. **`provide` orqali funksiya uzatish** (27-bob) — `const removeItem = inject('removeItem')`.

Qoida: 2 darajagacha emit, undan chuqurroqda store yoki inject. Lekin "hamma narsa store'ga" ham noto'g'ri — lokal UI hodisalari (modal yopildi, tab almashdi) store'da yashamasligi kerak.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Emits'ni e'lon qilmaslik | Hodisa `$attrs` ga tushadi va ikki marta ishlashi mumkin | `defineEmits([...])` |
| `@update` o'rniga props'ni o'zgartirish | Bir tomonlama oqim buziladi | `emit('update:x', value)` |
| Ota'ga butun komponent nusxasini uzatish | Qattiq bog'lanish | Faqat kerakli ma'lumot (ID, qiymat) |
| `emit` ni `setup` tashqarisida ishlatish | `defineEmits` faqat `<script setup>` ichida | `setup(props, { emit })` |
| Hodisa nomini `camelCase` yozib, shablonda `kebab-case` kutish | Vue moslaydi, lekin aralash yozuv chalkashtiradi | Bitta uslub: `update:modelValue` / `@update:model-value` |
| Har qavatda emit zanjiri (5 daraja) | Har o'zgarishda 5 ta fayl tahrirlanadi | Store yoki `provide` |

## Amaliyot

1. `UserCard` ga `@remove` va `@select` qo'shing, otada ro'yxatdan o'chirishni amalga oshiring.
2. `defineEmits` validatorini yozing va noto'g'ri payload bilan chaqirib, ogohlantirishni ko'ring.
3. `UiInput` yozing: ichida `<input>`, `$attrs` ni qo'lda uzating, `inheritAttrs: false` bilan. Ota'dan `@focus` va `placeholder` bering.
4. Uch qavatli emit zanjirini yasang, keyin uni `provide` bilan qayta yozing va farqni solishtiring.

## Rasmiy hujjat

- Hodisalar: <https://vuejs.org/guide/components/events.html>
- `defineEmits`: <https://vuejs.org/api/sfc-script-setup.html#defineprops-defineemits>
