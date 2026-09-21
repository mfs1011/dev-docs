# 28 — Async komponentlar

[← Oldingi: Provide / inject](27-provide-inject.md) · [Mundarija](README.md) · [Keyingi: Composables →](29-composables.md)

## Tushuncha

Ilova katta bo'lganda hamma komponentni birinchi yuklanishda berish isrof: foydalanuvchi grafik sahifasiga kirmasligi mumkin, lekin grafik kutubxonasi (300 KB) baribir yuklanadi.

`defineAsyncComponent` komponentni **alohida chunk** qilib ajratadi va faqat kerak bo'lganda yuklaydi:

```js
import { defineAsyncComponent } from 'vue'

const ChartPanel = defineAsyncComponent(() => import('./ChartPanel.vue'))
```

Endi `ChartPanel` render qilinishi kerak bo'lgan paytda brauzer uning JS faylini so'raydi.

## Kod: yuklanish va xato holatlari

```js
const ChartPanel = defineAsyncComponent({
  loader: () => import('./ChartPanel.vue'),

  loadingComponent: UiSpinner,
  delay: 200,                     // 200 ms dan tez yuklansa spinner ko'rsatilmaydi

  errorComponent: UiLoadError,
  timeout: 10000,                 // 10 s dan keyin xato deb hisoblanadi

  onError(error, retry, fail, attempts) {
    if (attempts <= 3) {
      retry()                     // tarmoq uzilsa qayta urinish
    } else {
      fail()
    }
  },
})
```

`delay: 200` — muhim UX detali: tez tarmoqda spinner miltillab o'tmasligi uchun.

## Kod: marshrutlarda (eng ko'p ishlatiladigan joy)

```js
// router/index.js
const routes = [
  { path: '/', component: () => import('@/views/HomeView.vue') },
  { path: '/reports', component: () => import('@/views/ReportsView.vue') },
]
```

Router uchun `defineAsyncComponent` shart emas — u dinamik importni o'zi tushunadi (40-bob).

## Kod: `Suspense` bilan

```vue
<Suspense>
    <ChartPanel />

    <template #fallback>
        <UiSkeleton />
    </template>
</Suspense>
```

`Suspense` bir nechta async komponentning yuklanishini birlashtiradi (36-bob). Vue 3.5 da u hamon eksperimental deb belgilangan — production'da `loadingComponent` ishonchliroq.

## Kod: lazy hydration (Vue 3.5+)

SSR'da komponent server'da render qilinadi, keyin klientda "jonlantiriladi" (04, 56-bob). Vue 3.5 dan jonlantirishni **kechiktirish** mumkin:

```js
import { defineAsyncComponent, hydrateOnVisible, hydrateOnIdle, hydrateOnInteraction } from 'vue'

// Ko'rinish maydoniga kirganda
const Comments = defineAsyncComponent({
  loader: () => import('./Comments.vue'),
  hydrate: hydrateOnVisible(),
})

// Brauzer bo'sh bo'lganda
const Analytics = defineAsyncComponent({
  loader: () => import('./Analytics.vue'),
  hydrate: hydrateOnIdle(),
})

// Foydalanuvchi bosganda
const RichEditor = defineAsyncComponent({
  loader: () => import('./RichEditor.vue'),
  hydrate: hydrateOnInteraction(['click', 'focus']),
})
```

Bu — "islands" yondashuvining Vue'dagi ko'rinishi: sahifa HTML sifatida darhol ko'rinadi, JS esa qismlarga bo'linib, kerak bo'lganda jonlanadi.

## Kod: shartli og'ir komponent

```vue
<script setup>
import { defineAsyncComponent, ref } from 'vue'

const showEditor = ref(false)

// Faqat foydalanuvchi bosganda yuklanadi
const RichEditor = defineAsyncComponent(() => import('./RichEditor.vue'))
</script>

<template>
    <button v-if="!showEditor" @click="showEditor = true">Tahrirlash</button>

    <RichEditor v-if="showEditor" v-model="content" />
</template>
```

## Muhandislik nuqtai nazari: nimani ajratish kerak

Har komponentni async qilish — xato: har chunk uchun alohida HTTP so'rov va kutish vaqti qo'shiladi. Foydali mezonlar:

| Ajratish arziydi | Ajratish arzimaydi |
| --- | --- |
| Marshrut darajasidagi sahifalar | Kichik UI komponentlari (`UiButton`) |
| Og'ir kutubxonaga tayanadigan bo'lak (grafik, xarita, editor, PDF) | Har sahifada ko'rinadigan bo'lak (header, sidebar) |
| Modal ichidagi murakkab forma | Statik matn bo'lagi |
| Admin/debug paneli | Birinchi ekranda ko'rinadigan narsa |

Amaliy chegara: chunk 30 KB dan kichik bo'lsa, ajratishdan foyda yo'q — so'rov narxi tejalgan hajmdan katta.

O'lchash usuli — `rollup-plugin-visualizer` (63-bob):

```bash
npm i -D rollup-plugin-visualizer
```

## Muhandislik nuqtai nazari: kutish vaqtini yashirish

Async komponent yuklanayotganda ekran "sakramasligi" kerak. Uch texnika:

1. **Skelet** (`loadingComponent`) — bo'shliqni haqiqiy komponent o'lchamida to'ldiradi;
2. **Prefetch** — foydalanuvchi tugma ustiga kursor olib kelganda oldindan yuklash:

```vue
<button @mouseenter="preload" @click="showEditor = true">Tahrirlash</button>

<script setup>
function preload() {
  import('./RichEditor.vue')      // brauzer keshiga tushadi
}
</script>
```

3. **`<link rel="modulepreload">`** — Vite muhim chunklar uchun buni o'zi qo'shadi.

## Muhandislik nuqtai nazari: xatolarga chidamlilik

Tarmoq uzilganda chunk yuklanmaydi va komponent umuman ko'rinmaydi. Bu SPA'ning tipik production muammosi, ayniqsa **deploy'dan keyin**: eski sahifa ochiq turgan foydalanuvchi eski chunk nomini so'raydi, lekin server'da yangi hash bilan fayllar bor.

Yechimlar:

```js
const View = defineAsyncComponent({
  loader: () => import('./View.vue'),
  onError(error, retry, fail, attempts) {
    // Chunk topilmadi → deploy bo'lgan → sahifani yangilash
    if (error.message.includes('Failed to fetch dynamically imported module')) {
      window.location.reload()
      return
    }

    if (attempts <= 2) retry()
    else fail()
  },
})
```

Bundan tashqari, eski chunk fayllarini serverda bir muddat saqlash (masalan 7 kun) bu muammoni deyarli yo'q qiladi (67-bob).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Har komponentni async qilish | Ko'p kichik chunk, ko'p so'rov | Faqat og'ir/kam ishlatiladiganlarini |
| `defineAsyncComponent` ni shablon ichida yaratish | Har renderda yangi komponent — cheksiz qayta yuklash | Modul darajasida bir marta |
| `delay: 0` bilan spinner | Tez tarmoqda miltillaydi | `delay: 200` |
| Xato holatini ko'rsatmaslik | Foydalanuvchi bo'sh ekran ko'radi | `errorComponent` |
| Deploy'dan keyingi chunk xatosini boshqarmaslik | "Failed to fetch dynamically imported module" | `onError` da `reload` |
| Birinchi ekrandagi komponentni async qilish | LCP yomonlashadi | Statik import |

## Amaliyot

1. Og'ir komponentni (masalan Chart.js ishlatadigan) async qiling. `npm run build` da yangi chunk paydo bo'lishini ko'ring.
2. `loadingComponent` va `delay` qo'shing; Network panelida Slow 3G bilan sinab ko'ring.
3. `@mouseenter` bilan prefetch qo'shing va Network panelida qachon yuklanishini kuzating.
4. `onError` yozing, tarmoqni o'chirib ko'ring (DevTools → Offline) va qayta urinish ishlashini tekshiring.

## Rasmiy hujjat

- Async komponentlar: <https://vuejs.org/guide/components/async.html>
- Lazy hydration: <https://vuejs.org/guide/components/async.html#lazy-hydration>
