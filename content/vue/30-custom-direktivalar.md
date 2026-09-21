# 30 — Custom direktivalar

[← Oldingi: Composables](29-composables.md) · [Mundarija](README.md) · [Keyingi: Pluginlar →](31-pluginlar.md)

## Tushuncha

Direktiva — **DOM elementiga to'g'ridan-to'g'ri past darajali kirish** vositasi. Vue o'zining `v-if`, `v-model` larini shu mexanizm ustida qurgan; siz ham o'zingiznikini yozishingiz mumkin.

```vue
<script setup>
// `v` bilan boshlangan o'zgaruvchi — lokal direktiva
const vFocus = {
  mounted: (el) => el.focus(),
}
</script>

<template>
    <input v-focus>
</template>
```

Global:

```js
// main.js
app.directive('focus', {
  mounted: (el) => el.focus(),
})
```

## Kod: hooklar to'plami

```js
const vTooltip = {
  // element yaratilgan, lekin hali DOM'da emas
  created(el, binding, vnode) {},

  // DOM'ga qo'yilishidan oldin
  beforeMount(el, binding) {},

  // DOM'da, ota komponent mount bo'lgan
  mounted(el, binding) {
    el._tip = createTooltip(el, binding.value)
  },

  // ota komponent yangilanishidan oldin/keyin
  beforeUpdate(el, binding) {},
  updated(el, binding) {
    if (binding.value !== binding.oldValue) el._tip.setText(binding.value)
  },

  beforeUnmount(el) {},
  unmounted(el) {
    el._tip.destroy()        // tozalash — majburiy
  },
}
```

`binding` obyekti:

```vue
<div v-tooltip:top.hover="message">
```

```js
{
  value: message,           // ifoda natijasi
  oldValue: /* oldingi */,
  arg: 'top',               // argument
  modifiers: { hover: true },
  instance: /* komponent nusxasi */,
  dir: /* direktiva ta'rifi */,
}
```

Qisqartma: faqat `mounted` va `updated` kerak bo'lsa, funksiya yozish mumkin:

```js
app.directive('color', (el, binding) => {
  el.style.color = binding.value
})
```

## Kod: amaliy direktivalar

**1. Tashqariga bosish:**

```js
export const vClickOutside = {
  mounted(el, binding) {
    el._handler = (event) => {
      if (!el.contains(event.target)) binding.value(event)
    }

    // `capture` va keyingi tick — shu elementning o'z clicki hisoblanmasin
    setTimeout(() => document.addEventListener('click', el._handler))
  },
  unmounted(el) {
    document.removeEventListener('click', el._handler)
  },
}
```

```vue
<div v-click-outside="closeMenu" class="dropdown">…</div>
```

**2. Avtomatik o'lchamli textarea:**

```js
export const vAutosize = {
  mounted(el) {
    el._resize = () => {
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }

    el.addEventListener('input', el._resize)
    el._resize()
  },
  unmounted(el) {
    el.removeEventListener('input', el._resize)
  },
}
```

**3. Ruxsat bo'yicha yashirish:**

```js
export const vCan = {
  mounted(el, binding) {
    if (!auth.can(binding.value)) el.remove()
  },
}
```

```vue
<button v-can="'user.delete'">O'chirish</button>
```

> Eslatma: bu **ko'rinish** darajasidagi cheklov. Haqiqiy ruxsat serverda tekshiriladi (12, 65-bob).

## Kod: komponentga direktiva

```vue
<MyComponent v-focus />
```

Direktiva komponentning **ildiz elementiga** qo'llanadi. Ko'p ildizli komponentda ishlamaydi (ogohlantirish chiqadi) — bu `$attrs` bilan bir xil cheklov (25-bob).

## Muhandislik nuqtai nazari: direktiva yoki komponent yoki composable

| Vazifa | To'g'ri vosita |
| --- | --- |
| Elementga past darajali DOM xatti-harakati (fokus, o'lcham, observer) | Direktiva |
| Ko'rinish + holat + mantiq | Komponent |
| Reaktiv mantiq, DOM shart emas | Composable |
| Bir nechta element bilan koordinatsiya | Komponent (`provide` bilan) |

Vue hujjati aniq aytadi: **direktiva — oxirgi chora.** Deklarativ yo'l bor bo'lsa (komponent, `:class`, `v-if`), o'shani tanlang. Sabab: direktiva DOM'ni Vue'dan yashirin o'zgartiradi, bu SSR va hydration bilan muammo tug'dirishi mumkin.

Qo'shimcha kamchilik: direktivada TypeScript tiplari kuchsiz va test yozish qiyinroq (element bilan bevosita ishlanadi).

## Muhandislik nuqtai nazari: SSR va direktivalar

SSR'da `mounted`/`updated` **serverda ishlamaydi** — server faqat HTML matnini yaratadi. Shuning uchun:

```js
// SSR'da bu direktiva hech narsa qilmaydi va HTML boshqacha chiqadi
const vHighlight = {
  mounted(el) {
    el.classList.add('highlighted')     // server bu class'ni qo'shmaydi
  },
}
```

Natija — hydration mismatch (56-bob). SSR loyihasida direktivaning `getSSRProps` funksiyasi yoziladi:

```js
const vHighlight = {
  mounted(el) { el.classList.add('highlighted') },
  getSSRProps() {
    return { class: 'highlighted' }
  },
}
```

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Tinglovchini `unmounted` da tozalamaslik | Xotira oqishi | Har `addEventListener` uchun juftlik |
| Direktiva bilan holat boshqarish | Vue holatdan bexabar, DOM va holat farq qiladi | Komponent yoki composable |
| Ko'p ildizli komponentga direktiva | Qo'llanmaydi, ogohlantirish | Bitta ildiz yoki ichkarida ishlating |
| SSR'da `getSSRProps` siz DOM o'zgartirish | Hydration mismatch | `getSSRProps` |
| Direktivada og'ir hisob (`updated` har renderda) | Sekinlik | `binding.value !== binding.oldValue` tekshiruvi |
| Elementga xossa yozish (`el._handler`) o'rniga global `Map` ishlatib, tozalamaslik | Xotira oqishi | Elementning o'zida saqlang yoki `WeakMap` |

## Amaliyot

1. `v-focus` ni yozing va modal ochilganda inputga fokus berishda ishlating.
2. `v-click-outside` ni yozing, dropdown menyuda ishlating. `setTimeout` ni olib tashlab, nima buzilishini ko'ring.
3. `v-autosize` ni yozing va uzun matn kiritganda textarea o'sishini tekshiring.
4. Xuddi shu vazifalarni composable bilan ham qilib ko'ring (`useFocus`, `useClickOutside`) va qaysi holatda qaysi biri qulayroq ekanini yozib qo'ying.

## Rasmiy hujjat

- Custom direktivalar: <https://vuejs.org/guide/reusability/custom-directives.html>
- SSR direktivalari: <https://vuejs.org/guide/scaling-up/ssr.html#custom-directives>
