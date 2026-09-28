# 46 — Render mexanizmi

[← Oldingi: Formalar arxitekturasi](45-formalar-arxitekturasi.md) · [Mundarija](README.md) · [Keyingi: Vapor mode va Vue 3.6 →](47-vapor-mode.md)

## Tushuncha

Shablon yozganingizda Vue uni uch bosqichda ekranga chiqaradi:

```
Shablon  →  render funksiyasi  →  virtual DOM (VNode daraxti)  →  haqiqiy DOM
         kompilyatsiya            chaqiruv                       patch
```

1. **Kompilyatsiya** — build vaqtida (`.vue` fayl) yoki brauzerda (CDN rejimi, 02-bob);
2. **Render** — funksiya chaqirilib, VNode daraxti hosil bo'ladi;
3. **Patch** — yangi daraxt eskisi bilan solishtirilib, faqat farq DOM'ga yoziladi.

## Kod: VNode nima

VNode — DOM tugunini tasvirlaydigan oddiy JavaScript obyekti:

```js
import { h } from 'vue'

// h(tur, props, bolalar)
const vnode = h('div', { class: 'card' }, [
  h('h3', null, 'Sarlavha'),
  h('p', null, 'Matn'),
])
```

Taxminan:

```js
{
  type: 'div',
  props: { class: 'card' },
  children: [ /* ... */ ],
  el: null,            // patch'dan keyin haqiqiy DOM elementi
  patchFlag: 0,
  // ...
}
```

Shablon aynan shunday chaqiruvlar to'plamiga aylanadi. Buni <https://play.vuejs.org> ning **Compiled Code** panelida ko'rish mumkin (37-bob).

## Kod: kompilyator optimizatsiyalari

Vue kompilyatori shablonni **statik tahlil** qiladi va ish hajmini keskin kamaytiradi. Uch asosiy texnika:

**1. Statik hoisting** — o'zgarmaydigan tugunlar render funksiyasidan tashqariga chiqariladi va bir marta yaratiladi:

```js
// Shablon:  <div class="card"><h3>Statik sarlavha</h3><p>{{ text }}</p></div>

const _hoisted_1 = createElementVNode('h3', null, 'Statik sarlavha', -1 /* HOISTED */)

function render(_ctx) {
  return createElementVNode('div', { class: 'card' }, [
    _hoisted_1,                                             // qayta yaratilmaydi
    createElementVNode('p', null, toDisplayString(_ctx.text), 1 /* TEXT */),
  ])
}
```

**2. Patch flag** — har bir dinamik tugunga "nimasi o'zgarishi mumkin" belgisi qo'yiladi:

| Flag | Ma'nosi |
| --- | --- |
| `1` TEXT | Faqat matn |
| `2` CLASS | Faqat class |
| `4` STYLE | Faqat style |
| `8` PROPS | Ro'yxati ma'lum props |
| `16` FULL_PROPS | Dinamik kalitli props — to'liq solishtirish |
| `-1` HOISTED | Statik, umuman solishtirilmaydi |

Patch paytida Vue butun elementni emas, faqat belgilangan qismni tekshiradi. React'da bunday ma'lumot yo'q — u har renderda butun props obyektini solishtiradi.

**3. Blok daraxti (block tree)** — dinamik tugunlar bitta tekis massivga yig'iladi. Shu sababli 100 qatorli statik razmetka ichida bitta `{{ count }}` bo'lsa, patch faqat o'sha bitta tugunni ko'radi, daraxtni to'liq aylanmaydi.

Natijada Vue'da virtual DOM narxi React'nikidan ancha past: kompilyator ishning katta qismini oldindan bajargan.

## Kod: render funksiyasi qo'lda yozish

Ba'zi hollarda shablon noqulay bo'ladi — masalan tegning o'zi dinamik bo'lsa:

```vue
<script setup>
import { h } from 'vue'

const props = defineProps({ level: { type: Number, default: 2 } })
</script>

<template>
    <component :is="`h${level}`"><slot /></component>
</template>
```

Xuddi shu narsa render funksiyasi bilan:

```js
// UiHeading.js (oddiy .js fayl, .vue emas)
import { h } from 'vue'

export default {
  props: { level: { type: Number, default: 2 } },
  setup(props, { slots }) {
    return () => h(`h${props.level}`, { class: 'heading' }, slots.default?.())
  },
}
```

Render funksiyasi qachon shablondan yaxshiroq:

| Holat | Sabab |
| --- | --- |
| Tur dasturiy hisoblanadi (`h1`–`h6`, tablitsa yacheykalari) | Shablonda `<component :is>` zanjiri o'qilmaydi |
| Bolalarni dasturiy o'zgartirish (slot'ga o'ram qo'shish) | Shablon buni qila olmaydi |
| Yuqori darajali komponent (HOC) | Kompozitsiya mantiqi JS'da tabiiy |
| Kutubxona ichki komponentlari | `.vue` build talab qilmaydi |

Narxi: kompilyator optimizatsiyalari **ishlamaydi** (patch flag yo'q), o'qish qiyinroq, IDE yordami kamroq. Shuning uchun standart tanlov — shablon.

## Kod: slot'lar va `h`

```js
setup(props, { slots }) {
  return () =>
    h('div', { class: 'card' }, {
      default: () => slots.default?.(),
      // scoped slot'ga ma'lumot uzatish
      footer: () => slots.footer?.({ total: props.total }),
    })
}
```

Bolalar obyekt shaklida berilsa, u **slot'lar** deb qabul qilinadi; massiv bo'lsa — oddiy bolalar.

## Kod: JSX

```bash
npm i -D @vitejs/plugin-vue-jsx
```

```jsx
// UiHeading.jsx
export default {
  props: { level: { type: Number, default: 2 } },
  setup(props, { slots }) {
    const Tag = `h${props.level}`

    return () => <Tag class="heading">{slots.default?.()}</Tag>
  },
}
```

Vue'da JSX — qo'llab-quvvatlanadi, lekin kamchilik: React'dagidek emas (`v-model`, direktivalar boshqacha yoziladi) va kompilyator optimizatsiyalari yo'qoladi. Amalda faqat React'dan kelgan jamoalar yoki juda dinamik komponentlar uchun ishlatiladi.

## Muhandislik nuqtai nazari: nega Vue qayta renderni kamroq qiladi

Reaktivlik (07-bob) va kompilyator birgalikda ishlaydi:

1. Har komponentning render funksiyasi **reaktiv effekt** ichida ishlaydi;
2. Render paytida o'qilgan `ref`/`reactive` qiymatlar o'sha komponentning bog'liqligi bo'ladi;
3. Qiymat o'zgarsa — **faqat o'sha komponent** qayta render qilinadi (bolalar props orqali o'zgarmasa, ular tegilmaydi);
4. Qayta render ichida patch flag'lar tufayli faqat dinamik tugunlar solishtiriladi.

React'da esa holat o'zgarsa komponent funksiyasi butunlay qayta chaqiriladi va bolalar ham (memo qilinmasa) qayta render bo'ladi. Shuning uchun Vue'da `React.memo`/`useMemo` ekvivalentlari deyarli kerak emas.

Istisno: bolaga **har renderda yangi obyekt/funksiya** uzatsangiz, props o'zgargan hisoblanadi va bola qayta render bo'ladi:

```vue
<!-- ✗ har renderda yangi obyekt -->
<UserCard :config="{ compact: true }" />

<!-- ✓ -->
<script setup>
const cardConfig = { compact: true }
</script>
<UserCard :config="cardConfig" />
```

## Muhandislik nuqtai nazari: qayta renderni o'lchash

Taxmin qilmang — o'lchang:

1. **Vue DevTools → Timeline → Component render** — qaysi komponent necha marta render bo'lganini ko'rsatadi;
2. `app.config.performance = true` (03-bob) + Chrome Performance;
3. Qo'lda tekshiruv: `onRenderTriggered` hooki qaysi bog'liqlik renderni qo'zg'atganini aytadi:

```js
import { onRenderTracked, onRenderTriggered } from 'vue'

onRenderTriggered((event) => {
  console.log('render sababi:', event.key, event.type, event.target)
})
```

Bu ikki hook faqat dev rejimida ishlaydi va "nega bu komponent qayta render bo'lyapti?" savoliga eng to'g'ridan-to'g'ri javob beradi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Shablonda inline obyekt/massiv/funksiya uzatish | Har renderda yangi havola → bola qayta render | Konstanta yoki `computed` |
| Hamma joyda render funksiya/JSX | Kompilyator optimizatsiyalari yo'qoladi | Shablon; `h` faqat kerak bo'lganda |
| `v-for` da `key` sifatida indeks | Patch noto'g'ri elementlarni moslashtiradi (13-bob) | Barqaror ID |
| "Sekin" degan taxmin bilan optimallashtirish | Vaqt behuda ketadi | DevTools Timeline bilan o'lchash |
| `v-once`/`v-memo` ni keng ishlatish | Eskirgan ko'rinish xavfi | Faqat o'lchangan muammo uchun (62-bob) |
| Katta ro'yxatni to'liq render qilish | Patch flag ham yordam bermaydi | Virtualizatsiya (62-bob) |

## Amaliyot

1. <https://play.vuejs.org> da uch xil shablon yozing: to'liq statik, bitta matn dinamik, `class` dinamik. Har birining patch flag'larini solishtiring.
2. `onRenderTriggered` ni komponentga qo'ying va qaysi holat o'zgarishi renderni qo'zg'atayotganini kuzating.
3. Bolaga inline obyekt uzating, DevTools'da uning qayta renderini ko'ring, keyin konstantaga o'tkazib, farqni tasdiqlang.
4. `UiHeading` ni avval shablon bilan, keyin `h()` bilan yozing. Ikkalasining kompilyatsiya natijasini solishtiring.

## Rasmiy hujjat

- Render mexanizmi: <https://vuejs.org/guide/extras/rendering-mechanism.html>
- Render funksiyalar va JSX: <https://vuejs.org/guide/extras/render-function.html>
- `h()` API: <https://vuejs.org/api/render-function.html>
