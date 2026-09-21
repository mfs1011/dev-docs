# 11 — Class va style bog'lash

[← Oldingi: Hisoblanuvchi xossalar](10-computed.md) · [Mundarija](README.md) · [Keyingi: Shartli render →](12-shartli-render.md)

## Tushuncha

`class` va `style` — eng ko'p dinamik o'zgaradigan atributlar. Shuning uchun Vue ularga maxsus muomala qiladi: satrdan tashqari **obyekt** va **massiv** ham berish mumkin, va berilgan qiymat statik atribut bilan **birlashtiriladi** (almashtirilmaydi).

```vue
<template>
    <!-- Obyekt: kalit — class nomi, qiymat — shart -->
    <div :class="{ active: isActive, 'text-danger': hasError }"></div>

    <!-- Massiv -->
    <div :class="[baseClass, isActive ? 'active' : '']"></div>

    <!-- Aralash -->
    <div :class="['card', { 'card-selected': isSelected }]"></div>

    <!-- Statik + dinamik birlashadi -->
    <div class="card" :class="{ 'card-selected': isSelected }"></div>
    <!-- natija: class="card card-selected" -->
</template>
```

## Kod: `style` bog'lash

```vue
<script setup>
import { computed, ref } from 'vue'

const progress = ref(40)
const color = ref('#42b883')

const barStyle = computed(() => ({
  width: `${progress.value}%`,
  backgroundColor: color.value,
}))
</script>

<template>
    <!-- Obyekt: camelCase yoki kebab-case (tirnoq bilan) -->
    <div :style="{ color: color, fontSize: '14px' }"></div>
    <div :style="{ 'font-size': '14px' }"></div>

    <!-- computed obyekt — o'qish oson -->
    <div class="bar" :style="barStyle"></div>

    <!-- Massiv: bir nechta obyektni qo'shish -->
    <div :style="[baseStyles, overrideStyles]"></div>

    <!-- Bir nechta qiymat: brauzer tushunganini oladi -->
    <div :style="{ display: ['-webkit-box', 'flex'] }"></div>
</template>
```

Birlik (`px`, `%`) **avtomatik qo'shilmaydi** — `width: 40` ishlamaydi, `width: '40px'` kerak.

## Kod: komponentga class berish

Komponentga qo'yilgan `class` uning ildiz elementiga tushadi (fallthrough atribut, 25-bob):

```vue
<!-- Ota komponent -->
<UserCard class="mt-4" :class="{ 'is-selected': selected }" />
```

```vue
<!-- UserCard.vue -->
<template>
    <article class="user-card">…</article>
</template>
<!-- Natija: <article class="user-card mt-4 is-selected"> -->
```

Komponentda bir nechta ildiz element bo'lsa, Vue qayerga qo'yishni bilmaydi — o'zingiz ko'rsatasiz:

```vue
<template>
    <header>…</header>
    <article :class="$attrs.class">…</article>
</template>

<script setup>
defineOptions({ inheritAttrs: false })
</script>
```

## Kod: `scoped` CSS bilan birga

```vue
<template>
    <button class="btn" :class="[`btn-${variant}`, { 'is-loading': loading }]">
        <slot />
    </button>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'primary' },
  loading: Boolean,
})
</script>

<style scoped>
.btn { padding: 6px 14px; border-radius: 8px; }
.btn-primary { background: var(--accent); color: #fff; }
.btn-ghost { background: transparent; border: 1px solid var(--border); }
.is-loading { opacity: .6; pointer-events: none; }
</style>
```

Nozik joy: `scoped` CSS har bir selektorga `[data-v-xxxx]` atributini qo'shadi. Dinamik yaratilgan class nomi (`btn-${variant}`) shablonda **matn** sifatida yozilgani uchun mos keladi — lekin CSS'da `.btn-primary` yozilgan bo'lishi shart. Shablonda yo'q, faqat JS'da hisoblangan nomlar uchun `scoped` ba'zan ishlamay qoladi — 37-bobda sabablari bilan.

## Kod: CSS'da komponent holatidan foydalanish

`v-bind()` CSS ichida (37-bobda batafsil):

```vue
<script setup>
import { ref } from 'vue'

const accent = ref('#42b883')
</script>

<template>
    <p class="note">Matn</p>
</template>

<style scoped>
.note {
    border-left: 3px solid v-bind(accent);
}
</style>
```

Vue buni CSS o'zgaruvchisiga aylantiradi va `accent` o'zgarganda o'zi yangilaydi — inline style yozishdan toza.

## Muhandislik nuqtai nazari: qachon class, qachon style

| Holat | Tanlov |
| --- | --- |
| Oldindan ma'lum bir necha ko'rinish (primary/ghost/danger) | `class` — CSS'da yoziladi, dizayn tizimiga bo'ysunadi |
| Uzluksiz hisoblangan qiymat (progress bar kengligi, koordinata) | `style` — CSS'da yozib bo'lmaydi |
| Tema ranglari | CSS o'zgaruvchi (`var(--accent)`) + `class` |
| Animatsiya holati | `class` + CSS transition (32-bob) |

Umumiy qoida: **`style` — faqat CSS oldindan bila olmaydigan qiymatlar uchun.** Inline style CSS kaskadidan qochib qutuladi (specificity eng yuqori) va keyin uni bekor qilish qiyin bo'ladi.

## Muhandislik nuqtai nazari: class nomlarini qayerda hisoblash

Shablon o'sganda class ifodalari o'qib bo'lmas holga keladi:

```vue
<!-- ✗ -->
<div :class="['row', { 'row-active': isActive && !disabled, 'row-muted': disabled || isArchived, [`row-${size}`]: true }]">
```

Buni `computed` ga chiqaring:

```js
const rowClass = computed(() => ({
  'row-active': isActive.value && !disabled.value,
  'row-muted': disabled.value || isArchived.value,
  [`row-${size.value}`]: true,
}))
```

```vue
<div class="row" :class="rowClass">
```

Yutuq ikki tomonlama: shablon o'qiladi va class mantiqi **test qilinadigan** joyga ko'chadi (52-bob).

## Muhandislik nuqtai nazari: Tailwind bilan

Tailwind ishlatilsa, dinamik class nomlarini **qismlardan yasamang**:

```js
// ✗ Tailwind build vaqtida bu class'ni topa olmaydi va CSS'ga qo'shmaydi
const cls = `text-${color}-500`

// ✓ To'liq nomlar ro'yxati
const COLORS = {
  green: 'text-green-500',
  red: 'text-red-500',
}
const cls = COLORS[color]
```

Sabab: Tailwind fayl matnini skanerlab, uchragan class nomlarini CSS'ga qo'shadi. Runtime'da yig'ilgan satrni ko'ra olmaydi. Xuddi shu muammo boshqa "atomik CSS" tizimlarida ham bor.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `:class="active"` (satr o'rniga boolean) | `class="true"` chiqadi | `:class="{ active: isActive }"` |
| `:style="{ width: progress }"` | Birliksiz son ishlamaydi | `width: `${progress}px`` |
| `class="a" :class="'b'"` ikkalasi almashadi deb o'ylash | Ular birlashadi, almashmaydi | Kutilgan natijani tekshiring |
| Ko'p ildizli komponentga class berish | Qayerga tushishi noaniq, ogohlantirish chiqadi | `$attrs.class` ni qo'lda joylashtiring (25-bob) |
| Shablonda 5 qatorlik class ifodasi | O'qilmaydi, test qilinmaydi | `computed` |
| Tailwind class'ini `text-${x}` bilan yasash | Build CSS'ga qo'shmaydi | To'liq nomlar jadvali |

## Amaliyot

1. `UiButton` komponentini yozing: `variant` (primary/ghost/danger) va `loading` props'lari class orqali ishlasin.
2. Progress bar yasang: `progress` (0–100) `style.width` orqali, rang esa `progress < 30` bo'lsa qizil, aks holda yashil — `computed` bilan.
3. Ota komponentdan `UiButton` ga `class="mt-4"` bering va DevTools'da natijaviy `class` ni tekshiring.
4. `v-bind()` ni `<style scoped>` ichida ishlatib, rangni input orqali o'zgartiring. DevTools'da qanday CSS o'zgaruvchi yaratilganini ko'ring.

## Rasmiy hujjat

- Class va style: <https://vuejs.org/guide/essentials/class-and-style.html>
- SFC CSS imkoniyatlari: <https://vuejs.org/api/sfc-css-features.html>
