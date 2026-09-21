# 37 — SFC ichki tuzilishi

[← Oldingi: Suspense](36-suspense.md) · [Mundarija](README.md) · [Keyingi: Tooling →](38-tooling.md)

## Tushuncha

`.vue` fayl — uchta (yoki undan ko'p) blokdan iborat:

```vue
<script setup>
// mantiq
</script>

<template>
    <!-- ko'rinish -->
</template>

<style scoped>
/* uslub */
</style>
```

Build vaqtida `@vitejs/plugin-vue` bu fayllarni **uchta alohida modulga** ajratadi: JS moduli, render funksiyasi va CSS. Shuning uchun `.vue` faylni to'g'ridan-to'g'ri brauzer o'qiy olmaydi (02-bob).

## Kod: barcha blok turlari

```vue
<!-- Asosiy mantiq -->
<script setup>
const count = ref(0)
</script>

<!-- Qo'shimcha oddiy script: modul darajasidagi kod, defineOptions o'rniga -->
<script>
export default { inheritAttrs: false }
</script>

<!-- Shablon -->
<template>
    <p>{{ count }}</p>
</template>

<!-- Uslub: bir nechta blok bo'lishi mumkin -->
<style scoped>
p { color: red; }
</style>

<style module>
.title { font-weight: 700; }
</style>

<!-- Ixtiyoriy blok: build vositasi o'qiydi (masalan i18n) -->
<i18n>
{ "uz": { "hello": "Salom" } }
</i18n>
```

Har blokka `lang` berish mumkin: `<script setup lang="ts">`, `<style lang="scss">`, `<template lang="pug">`.

## Kod: `scoped` CSS qanday ishlaydi

```vue
<style scoped>
.card { border: 1px solid #ddd; }
</style>
```

Kompilyatsiyadan keyin:

```css
.card[data-v-7ba5bd90] { border: 1px solid #ddd; }
```

```html
<div class="card" data-v-7ba5bd90>…</div>
```

Ya'ni izolyatsiya **atribut selektori** orqali. Uchta oqibat bor:

1. **Bola komponentning ichki elementlari** ota CSS'idan ta'sirlanmaydi — ularda boshqa `data-v-` bo'ladi;
2. **Bola komponentning ildiz elementi** ota selektoriga tushadi (ataylab: joylashuvni ota boshqaradi);
3. **Dinamik yaratilgan HTML** (`v-html`) atribut olmaydi va scoped CSS unga ta'sir qilmaydi.

## Kod: `:deep()`, `:slotted()`, `:global()`

```vue
<style scoped>
/* Bola komponent ichidagi elementga yetib borish */
.wrapper :deep(.child-title) { color: red; }

/* Slot orqali kelgan mazmunga */
.list :slotted(li) { padding: 4px; }

/* Umuman scoped bo'lmasin */
:global(body) { margin: 0; }
</style>
```

`:deep()` — kerak, lekin ehtiyot bilan: u bola komponentning **ichki tuzilmasiga bog'lanadi**, ya'ni bola o'zgarsa ota CSS'i sinadi. Yaxshiroq yo'l — bola komponentga prop yoki CSS o'zgaruvchi berish.

## Kod: CSS Modules

```vue
<template>
    <p :class="$style.title">Sarlavha</p>
</template>

<style module>
.title { font-size: 20px; font-weight: 700; }
</style>
```

Nom bilan:

```vue
<template>
    <p :class="classes.title">Sarlavha</p>
</template>

<script setup>
import { useCssModule } from 'vue'

const classes = useCssModule('classes')
</script>

<style module="classes">
.title { font-size: 20px; }
</style>
```

CSS Modules class nomlarini **noyob** qiladi (`_title_x1y2z`), ya'ni to'qnashuv mumkin emas. `scoped` dan farqi: `scoped` da class nomi o'zgarmaydi, faqat atribut qo'shiladi.

| | `scoped` | CSS Modules |
| --- | --- | --- |
| Class nomi | O'zgarmaydi | Xesh bilan almashadi |
| DevTools'da o'qish | Oson | Qiyinroq |
| Shablonda ishlatish | `class="title"` | `:class="$style.title"` |
| Dinamik class yasash | Ishlaydi | JS obyekti orqali |
| Global to'qnashuv | Mumkin (bir xil nom, boshqa komponent — muammosiz, lekin global CSS bilan to'qnashadi) | Mumkin emas |

## Kod: CSS'da komponent holati — `v-bind()`

```vue
<script setup>
import { computed, ref } from 'vue'

const progress = ref(40)
const barColor = computed(() => (progress.value < 30 ? '#e5484d' : '#42b883'))
</script>

<template>
    <div class="bar"><span class="fill" /></div>
</template>

<style scoped>
.fill {
    width: v-bind(progress + '%');
    background: v-bind(barColor);
    transition: width .2s ease;
}
</style>
```

Vue buni CSS custom property'ga aylantiradi (`--7ba5bd90-progress`) va qiymat o'zgarganda inline style orqali yangilaydi. Inline `:style` dan afzalligi — CSS fayl ichida qoladi va boshqa qoidalar bilan birga o'qiladi.

## Kod: `defineOptions`, `defineSlots`, `defineExpose`

```vue
<script setup>
defineOptions({
  name: 'UserCard',
  inheritAttrs: false,
})

defineSlots({
  default: (props: { user: User }) => any,      // TS'da slot tiplari
})

defineExpose({ refresh })                        // tashqariga ochiladigan API
</script>
```

Bu makroslar import qilinmaydi va faqat `<script setup>` ichida ishlaydi — ular kompilyator ko'rsatmalari.

## Muhandislik nuqtai nazari: CSS strategiyasini tanlash

| Yondashuv | Qachon |
| --- | --- |
| `scoped` | Standart tanlov; komponentga xos uslublar |
| CSS Modules | Katta jamoa, class nomlari to'qnashuvi xavfi yuqori |
| Tailwind (utility) | Tez prototip, dizayn tizimi tokenlar bilan |
| Global CSS + BEM | Eski loyihalar, dizayn tizimini komponentdan tashqarida saqlash |
| CSS o'zgaruvchilari | Tema (dark/light), komponentga sozlanuvchi nuqtalar |

Eng barqaror kombinatsiya: **global CSS o'zgaruvchilari (tokenlar) + komponentda `scoped`**:

```css
/* assets/tokens.css */
:root {
    --color-accent: #42b883;
    --radius-md: 8px;
    --space-3: 12px;
}
```

```vue
<style scoped>
.btn {
    background: var(--color-accent);
    border-radius: var(--radius-md);
    padding: var(--space-3);
}
</style>
```

Shunda tema almashtirish (dark mode) bitta joyda bo'ladi va komponentlar o'zgarmaydi.

## Muhandislik nuqtai nazari: kompilyatsiya natijasini ko'rish

<https://play.vuejs.org> da o'ng paneldagi **Compiled Code** ni oching. U yerda:

- `<script setup>` qanday `setup()` funksiyasiga aylanganini;
- Shablon qanday render funksiyasiga aylanganini;
- Patch flag'lar va statik hoisting qanday qo'llanganini ko'rasiz (46-bob).

Bu — Vue "sehri" ni yo'qotadigan eng tez yo'l. Ayniqsa `defineModel`, `defineProps` makroslarining nimaga aylanishini ko'rish foydali.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `scoped` CSS bilan bola komponent ichini o'zgartirishga urinish | Selektor ta'sir qilmaydi | `:deep()` yoki prop/CSS o'zgaruvchi |
| `v-html` mazmuniga `scoped` CSS yozish | Atribut qo'yilmaydi | `:deep()` yoki global CSS |
| `:deep()` ni keng ishlatish | Bola ichki tuzilmasiga bog'lanish | Bola API'siga (props, CSS var) tayaning |
| Har komponentda global CSS yozish | To'qnashuvlar, o'chirish qo'rqinchli | `scoped` yoki modules |
| `<style>` da `lang="scss"` yozib, `sass` ni o'rnatmaslik | Build xatosi | `npm i -D sass` |
| `v-bind()` ni tez-tez o'zgaradigan qiymat bilan (har kadr) | Har o'zgarishda inline style yangilanadi | `transform` bilan CSS animatsiya |

## Amaliyot

1. Bitta komponentni `scoped`, CSS Modules va global CSS bilan uch marta yozing. DevTools'da natijaviy CSS'ni solishtiring.
2. `v-bind()` bilan progress bar yasang.
3. Bola komponent ichidagi elementga `:deep()` bilan yeting, keyin uni CSS o'zgaruvchisi bilan qayta yozing — qaysi biri sinishga kamroq moyil?
4. <https://play.vuejs.org> da `defineModel` ishlatgan komponent yozing va kompilyatsiya natijasida qanday props/emit paydo bo'lganini ko'ring.

## Rasmiy hujjat

- SFC spetsifikatsiyasi: <https://vuejs.org/api/sfc-spec.html>
- SFC CSS imkoniyatlari: <https://vuejs.org/api/sfc-css-features.html>
- `<script setup>`: <https://vuejs.org/api/sfc-script-setup.html>
