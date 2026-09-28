# 64 — Erishimlilik (a11y)

[← Oldingi: Bundle va yuklanish](63-bundle-va-yuklash.md) · [Mundarija](README.md) · [Keyingi: Xavfsizlik →](65-xavfsizlik.md)

## Tushuncha

Erishimlilik — interfeysning klaviatura, skrinrider, kattalashtirish, rang ko'rlik va boshqa sharoitlarda ishlashi. Bu "qo'shimcha imkoniyat" emas: klaviatura bilan ishlash, fokus ko'rinishi va kontrast **har bir foydalanuvchiga** foyda beradi.

Vue tomonidan asosiy vositalar: semantik HTML, fokus boshqaruvi (18-bob), ARIA atributlari va animatsiya sozlamalarini hurmat qilish (32-bob).

## Kod: semantik HTML — birinchi va eng muhim qadam

```vue
<!-- ✗ Hech qanday semantika yo'q -->
<div class="btn" @click="save">Saqlash</div>
<div class="link" @click="router.push('/about')">Biz haqimizda</div>

<!-- ✓ -->
<button type="button" @click="save">Saqlash</button>
<RouterLink to="/about">Biz haqimizda</RouterLink>
```

`<div @click>` bilan nima yo'qoladi:

| Imkoniyat | `<div>` | `<button>` |
| --- | --- | --- |
| Tab bilan fokus | ✗ | ✅ |
| Enter/Space bilan bosish | ✗ | ✅ |
| Skrinrider "tugma" deb o'qiydi | ✗ | ✅ |
| `disabled` holati | ✗ | ✅ |
| Formada `submit` | ✗ | ✅ |

Xuddi shunday: ro'yxat — `<ul>/<li>`, sarlavhalar — `<h1>`–`<h6>` (tartibni buzmasdan), navigatsiya — `<nav>`, asosiy mazmun — `<main>`.

## Kod: formalar va yorliqlar

```vue
<script setup>
import { useId } from 'vue'

const id = useId()                        // SSR'ga xavfsiz (45, 56-bob)
</script>

<template>
    <div class="field">
        <label :for="id">Pochta</label>

        <input
            :id="id"
            v-model="email"
            type="email"
            :aria-invalid="!!error"
            :aria-describedby="error ? `${id}-error` : undefined"
            autocomplete="email"
        >

        <p v-if="error" :id="`${id}-error`" role="alert">{{ error }}</p>
    </div>
</template>
```

Uch qoida:

1. Har input'ning `<label>` i bo'lsin (`placeholder` yorliq o'rnini bosmaydi — u yozilganda yo'qoladi);
2. Xato `aria-describedby` orqali bog'lansin va `role="alert"` bilan e'lon qilinsin;
3. `autocomplete` qiymatlarini bering — bu hammaga qulaylik.

## Kod: modal va fokus tuzog'i

```vue
<script setup>
import { nextTick, onUnmounted, ref, watch } from 'vue'

const open = defineModel('open', { type: Boolean })
const dialog = useTemplateRef('dialog')

let lastFocused = null

watch(open, async (isOpen) => {
  if (isOpen) {
    lastFocused = document.activeElement
    await nextTick()
    dialog.value?.querySelector('[autofocus], button, input')?.focus()
  } else {
    lastFocused?.focus()                 // fokusni qaytarish — majburiy
  }
})

function onKeydown(event) {
  if (event.key !== 'Tab' || !open.value) return

  const focusable = dialog.value.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
  )

  const first = focusable[0]
  const last = focusable[focusable.length - 1]

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}
</script>

<template>
    <Teleport to="body">
        <div
            v-if="open"
            ref="dialog"
            class="modal"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="titleId"
            @keydown="onKeydown"
            @keydown.esc="open = false"
        >
            <h2 :id="titleId"><slot name="title" /></h2>
            <slot />
        </div>
    </Teleport>
</template>
```

Amalda buni tayyor kutubxonadan olish ma'qul: `focus-trap`, Radix Vue, Headless UI — ular chekka holatlarni (iframe, dinamik mazmun, inert) ham qamrab olgan.

## Kod: dinamik mazmunni e'lon qilish

```vue
<template>
    <!-- Muhim xabarlar: darhol o'qiladi -->
    <div role="alert" aria-live="assertive">
        <p v-if="error">{{ error }}</p>
    </div>

    <!-- Odatiy yangilanishlar: navbat bilan -->
    <div aria-live="polite" class="sr-only">
        {{ resultCount }} ta natija topildi
    </div>

    <!-- Yuklanish holati -->
    <div v-if="loading" role="status" aria-live="polite">
        <span class="sr-only">Yuklanmoqda…</span>
        <UiSpinner aria-hidden="true" />
    </div>
</template>
```

```css
/* Faqat skrinriderlar uchun ko'rinadigan matn */
.sr-only {
    position: absolute;
    width: 1px; height: 1px;
    padding: 0; margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}
```

SPA'da alohida muammo: sahifa almashganda skrinrider hech narsa aytmaydi. Yechim — marshrut o'zgarganda sarlavhani e'lon qilish:

```js
router.afterEach((to) => {
  announcer.value = `${to.meta.title} sahifasi yuklandi`      // aria-live blokiga
  document.title = `${to.meta.title} — Ilova`
})
```

## Kod: klaviatura bilan navigatsiya

```vue
<template>
    <!-- Mazmunga o'tish havolasi — birinchi fokuslanadigan element -->
    <a href="#main" class="skip-link">Asosiy mazmunga o'tish</a>

    <nav><!-- 50 ta havola --></nav>

    <main id="main" tabindex="-1">
        <slot />
    </main>
</template>

<style>
.skip-link {
    position: absolute;
    left: -9999px;
}
.skip-link:focus {
    left: 8px; top: 8px;
    z-index: 100;
}

/* Fokus ko'rinishini HECH QACHON shunchaki o'chirmang */
:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
}
</style>
```

`outline: none` — eng ko'p uchraydigan a11y buzilishi. Agar dizayn talab qilsa, o'rniga **boshqa ko'rinadigan belgi** bering (soya, ramka).

## Kod: animatsiya va harakat

```css
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
}
```

JS tomonda:

```js
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

router.options.scrollBehavior = (to) => ({
  top: 0,
  behavior: reducedMotion ? 'auto' : 'smooth',
})
```

## Muhandislik nuqtai nazari: ARIA qoidalari

Birinchi qoida: **ARIA ishlatmang, agar semantik HTML yetsa.** `role="button"` qo'yilgan `<div>` — `<button>` dan yomonroq: siz klaviatura, fokus va holatni qo'lda qo'shishingiz kerak bo'ladi.

Kerak bo'ladigan holatlar:

| Holat | ARIA |
| --- | --- |
| Modal | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| Tab'lar | `role="tablist"/"tab"/"tabpanel"`, `aria-selected`, `aria-controls` |
| Akkordeon | `aria-expanded`, `aria-controls` |
| Dinamik xabar | `aria-live`, `role="alert"/"status"` |
| Ikonka tugma | `aria-label="Yopish"` |
| Dekorativ rasm/ikonka | `aria-hidden="true"` |
| Yuklanayotgan tugma | `aria-busy="true"` |

Noto'g'ri ARIA — ARIA yo'qligidan yomonroq: skrinrider foydalanuvchiga yolg'on ma'lumot beradi.

## Muhandislik nuqtai nazari: tekshirish

| Vosita | Nima topadi |
| --- | --- |
| **Klaviatura** (Tab, Shift+Tab, Enter, Esc) | Fokus tartibi, qamalib qolish — eng tez tekshiruv |
| **axe DevTools** (kengaytma) | Kontrast, yorliqlar, ARIA xatolari |
| **Lighthouse → Accessibility** | Umumiy bal |
| **`@axe-core/playwright`** (54-bob) | CI'da avtomatik |
| **VoiceOver** (macOS: Cmd+F5) / **NVDA** (Windows) | Haqiqiy tajriba |
| **eslint-plugin-vuejs-accessibility** | Yozayotganda |

```bash
npm i -D eslint-plugin-vuejs-accessibility
```

```js
// eslint.config.js
import pluginA11y from 'eslint-plugin-vuejs-accessibility'

export default [
  // ...
  ...pluginA11y.configs['flat/recommended'],
]
```

Avtomatik vositalar muammolarning ~30% ini topadi. Qolgani — qo'lda tekshiruv, ayniqsa klaviatura bilan.

## Muhandislik nuqtai nazari: kontrast va o'lchamlar

| Talab | Qiymat (WCAG AA) |
| --- | --- |
| Oddiy matn kontrasti | 4.5:1 |
| Katta matn (18pt+) | 3:1 |
| Interaktiv element chegarasi | 3:1 |
| Bosiladigan maydon | 24×24 px (AAA: 44×44) |
| Matn kattalashtirish | 200% da ishlashi kerak |

Amaliy tekshiruv: brauzerda `Cmd/Ctrl +` bilan 200% qiling — interfeys buzilmadimi? Matn kesilib qolmadimi?

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `<div @click>` tugma sifatida | Klaviatura, skrinrider ishlamaydi | `<button>` |
| `outline: none` | Klaviatura foydalanuvchisi fokusni ko'rmaydi | `:focus-visible` uslubi |
| `placeholder` ni yorliq sifatida | Yozilganda yo'qoladi | `<label>` |
| Modalda fokus tuzog'i yo'q | Fokus orqa fonga chiqib ketadi | Focus trap + qaytarish |
| Ikonka tugmada matn yo'q | Skrinrider "tugma" deydi, xolos | `aria-label` |
| Dinamik xatoni jim ko'rsatish | Skrinrider bilmaydi | `role="alert"` |
| `prefers-reduced-motion` ni e'tiborsiz qoldirish | Jismoniy noqulaylik | Media query |
| Sarlavha darajalarini buzish (`h1` → `h4`) | Navigatsiya buziladi | Ketma-ketlik |

## Amaliyot

1. Ilovangizni **faqat klaviatura** bilan aylanib chiqing: hamma joyga yeta olasizmi, fokus ko'rinadimi, modaldan chiqa olasizmi?
2. axe DevTools bilan uchta sahifani tekshiring va topilgan muammolarni tuzating.
3. `UiField` komponentiga `aria-invalid`, `aria-describedby`, `useId` qo'shing (45-bob).
4. Modalga focus trap va fokus qaytarishni qo'shing.
5. `eslint-plugin-vuejs-accessibility` ni o'rnating va chiqqan ogohlantirishlarni ko'ring.
6. VoiceOver/NVDA bilan bitta forma to'ldirib ko'ring.

## Rasmiy hujjat

- Vue erishimlilik: <https://vuejs.org/guide/best-practices/accessibility.html>
- WAI-ARIA naqshlari: <https://www.w3.org/WAI/ARIA/apg/patterns/>
- WCAG 2.2 qisqacha: <https://www.w3.org/WAI/WCAG22/quickref/>
- eslint-plugin-vuejs-accessibility: <https://vue-a11y.github.io/eslint-plugin-vuejs-accessibility/>
