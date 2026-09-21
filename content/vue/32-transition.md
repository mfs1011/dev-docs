# 32 — `<Transition>`

[← Oldingi: Pluginlar](31-pluginlar.md) · [Mundarija](README.md) · [Keyingi: TransitionGroup va animatsiya →](33-transitiongroup-va-animatsiya.md)

## Tushuncha

`<Transition>` — element yoki komponent **paydo bo'lganda va yo'qolganda** animatsiya qo'shadigan ichki komponent. U CSS yozmaydi; u faqat kerakli paytda **class qo'shadi va olib tashlaydi**.

```vue
<template>
    <button @click="show = !show">Almashtirish</button>

    <Transition>
        <p v-if="show">Salom</p>
    </Transition>
</template>

<style scoped>
.v-enter-active, .v-leave-active { transition: opacity .3s ease; }
.v-enter-from, .v-leave-to { opacity: 0; }
</style>
```

## Nega shunday: olti class

```
Kirish:   v-enter-from → v-enter-active → v-enter-to
Chiqish:  v-leave-from → v-leave-active → v-leave-to
```

| Class | Qachon |
| --- | --- |
| `v-enter-from` | Element qo'yilishidan oldingi kadr (boshlang'ich holat) |
| `v-enter-active` | Butun kirish davomida (`transition`/`animation` shu yerda) |
| `v-enter-to` | Keyingi kadrdan animatsiya oxirigacha (yakuniy holat) |
| `v-leave-from` | Chiqish boshlanishida |
| `v-leave-active` | Butun chiqish davomida |
| `v-leave-to` | Yakuniy holat, keyin element o'chiriladi |

`v-` prefiksi — standart. `name` bersangiz, u almashadi:

```vue
<Transition name="fade">
    <p v-if="show">Salom</p>
</Transition>
```

```css
.fade-enter-active, .fade-leave-active { transition: opacity .3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
```

Vue element o'chirilishini **animatsiya tugaguncha kechiktiradi** — `transitionend`/`animationend` hodisasini kutadi. Mana shuning uchun `v-if` bilan yo'qolayotgan element darhol yo'q bo'lmaydi.

## Kod: rejimlar (`mode`)

```vue
<!-- Standart: ikkalasi bir vaqtda (ustma-ust tushadi) -->
<Transition>
    <ComponentA v-if="showA" />
    <ComponentB v-else />
</Transition>

<!-- Avval eskisi chiqsin, keyin yangisi kirsin -->
<Transition mode="out-in">
    <component :is="currentTab" />
</Transition>
```

`mode="out-in"` — amalda eng ko'p ishlatiladigan sozlama: sahifa va tab almashinuvida ikkita element bir-birining ustiga tushmasin.

## Kod: boshlang'ich renderda animatsiya

```vue
<Transition appear>
    <div class="hero">…</div>
</Transition>
```

`appear` — birinchi renderda ham kirish animatsiyasi ishlasin.

## Kod: CSS animatsiyalar va kutubxonalar

```vue
<Transition
    enter-active-class="animate__animated animate__fadeInUp"
    leave-active-class="animate__animated animate__fadeOut"
>
    <div v-if="show">…</div>
</Transition>
```

Animate.css, Tailwind kabi tashqi class'lar shunday ulanadi.

## Kod: JavaScript hooklari

```vue
<Transition
    :css="false"
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @after-enter="onAfterEnter"
    @enter-cancelled="onEnterCancelled"
    @before-leave="onBeforeLeave"
    @leave="onLeave"
    @after-leave="onAfterLeave"
>
    <div v-if="show" ref="box">…</div>
</Transition>
```

```js
function onEnter(el, done) {
  // GSAP, Motion One yoki Web Animations API
  el.animate(
    [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }],
    { duration: 300, easing: 'ease-out' },
  ).onfinish = done                  // `done` ni chaqirish MAJBURIY
}
```

`:css="false"` — Vue CSS class'larini umuman qo'shmasin (ortiqcha ish qilmaydi). `done` chaqirilmasa, Vue element chiqib ketganini bilmaydi va u DOM'da qolib ketadi.

## Kod: balandlik animatsiyasi (`auto` muammosi)

CSS `height: auto` ni animatsiya qilib bo'lmaydi. Klassik yechim — JS hooklari:

```js
function onEnter(el, done) {
  el.style.height = '0'
  el.offsetHeight                                 // reflow majburlash
  el.style.transition = 'height .25s ease'
  el.style.height = `${el.scrollHeight}px`

  el.addEventListener('transitionend', () => {
    el.style.height = 'auto'                      // moslashuvchan qolsin
    done()
  }, { once: true })
}
```

Zamonaviy brauzerlarda `interpolate-size: allow-keywords` va `calc-size()` bu muammoni CSS darajasida yechmoqda, lekin qo'llab-quvvatlash hali to'liq emas.

## Muhandislik nuqtai nazari: animatsiya va ishlash

Faqat ikki xossa arzon: `transform` va `opacity`. Ular kompozitor qatlamida ishlaydi va layout/paint ni qayta hisoblamaydi.

| Xossa | Narxi |
| --- | --- |
| `transform`, `opacity` | Arzon (GPU) |
| `width`, `height`, `top`, `margin` | Qimmat (layout qayta hisoblanadi) |
| `box-shadow`, `filter` | O'rtacha/qimmat (paint) |

Shuning uchun "pastdan chiqib kelish" ni `top` bilan emas, `transform: translateY()` bilan qiling.

## Muhandislik nuqtai nazari: erishimlilik

Foydalanuvchining tizim sozlamasini hurmat qiling:

```css
@media (prefers-reduced-motion: reduce) {
    .fade-enter-active, .fade-leave-active { transition: none; }
}
```

Bu — vestibulyar buzilishi bor odamlar uchun jiddiy masala, kosmetik detal emas (64-bob).

## Muhandislik nuqtai nazari: qachon animatsiya kerak emas

- **Ma'lumot yuklanishi** — spinner o'rniga skelet ko'proq foyda beradi;
- **Har bir hover** — sahifa "o'ynoqi" bo'lib, qimmatli e'tiborni tortadi;
- **200 ms dan uzoq kutish** — foydalanuvchi sekinlik deb qabul qiladi. Interfeys animatsiyalari uchun 150–250 ms — yaxshi oraliq.

Animatsiyaning vazifasi — o'zgarishni **tushuntirish** (nima qayerdan kelib, qayerga ketdi), bezash emas.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `<Transition>` ichida bir nechta element | U faqat bitta bola bilan ishlaydi | `<TransitionGroup>` (33-bob) yoki bitta o'ram |
| `v-show` va `v-if` ni chalkashtirish | `v-show` bilan `leave` ishlaydi, lekin element DOM'da qoladi | Ikkalasi ham qo'llab-quvvatlanadi, maqsadga qarang |
| JS hookda `done()` ni chaqirmaslik | Element DOM'da qolib ketadi | Har doim `done()` |
| `height`/`width` ni animatsiya qilish | Layout qayta hisoblanadi, sekin | `transform: scaleY()` yoki JS hook |
| `mode` siz komponent almashtirish | Ikkalasi ustma-ust tushadi | `mode="out-in"` |
| `prefers-reduced-motion` ni e'tiborsiz qoldirish | Ba'zi foydalanuvchilarga jismoniy noqulaylik | Media query |

## Amaliyot

1. Modal uchun fade + scale animatsiyasi yozing (`transform: scale(.96)` dan `1` gacha).
2. Tab almashinuvini `mode="out-in"` bilan qiling va `out-in` siz variant bilan solishtiring.
3. Akkordeon yasang: balandlik animatsiyasi JS hooklari orqali.
4. `prefers-reduced-motion` uchun barcha animatsiyalarni o'chiruvchi CSS qo'shing va OS sozlamasida yoqib tekshiring.

## Rasmiy hujjat

- Transition: <https://vuejs.org/guide/built-ins/transition.html>
- `<Transition>` API: <https://vuejs.org/api/built-in-components.html#transition>
