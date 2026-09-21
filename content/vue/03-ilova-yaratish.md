# 03 — Ilova yaratish va sozlash

[← Oldingi: O'rnatish va ishga tushirish](02-ornatish-va-ishga-tushirish.md) · [Mundarija](README.md) · [Keyingi: Vue'dan foydalanish usullari →](04-foydalanish-usullari.md)

## Tushuncha

Har bir Vue interfeysi **ilova nusxasi** (application instance) bilan boshlanadi:

```js
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

app.mount('#app')
```

`createApp` ikki narsani qiladi: ildiz komponentni oladi va shu ildiz atrofida **alohida dunyo** yaratadi — o'z global komponentlari, direktivalari, pluginlari va konfiguratsiyasi bilan. `mount('#app')` esa shu dunyoni sahifadagi haqiqiy DOM elementiga ulaydi.

## Nega shunday

Vue 2 da `Vue.component(...)`, `Vue.use(...)` global edi: bitta sahifadagi ikki Vue ilovasi bir-birining sozlamasini ko'rar edi. Bu test va mikro-frontendlarda muammo tug'dirdi — bitta testda ro'yxatdan o'tgan komponent boshqa testga "sizib" o'tardi.

Vue 3 da hamma narsa **ilova nusxasiga bog'langan**:

```js
const admin = createApp(AdminRoot)
const widget = createApp(Widget)

admin.component('UiButton', UiButton)   // faqat admin ichida ko'rinadi
widget.mount('#chat-widget')            // o'z konfiguratsiyasi bilan
```

Natijada bitta sahifada bir nechta mustaqil Vue ilovasi yashay oladi va testda har bir test o'z ilovasini yaratadi — ifloslanish yo'q.

## Kod: ilova API'si

```js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import UiButton from './components/UiButton.vue'
import './assets/main.css'

const app = createApp(App)

// 1. Pluginlar — zanjir qilib yozish mumkin
app.use(createPinia())
app.use(router)

// 2. Global komponent — har joyda import qilmasdan ishlatiladi
app.component('UiButton', UiButton)

// 3. Global direktiva (30-bob)
app.directive('focus', {
  mounted: (el) => el.focus(),
})

// 4. Global xossa — ehtiyotkorlik bilan (pastda "Tipik xatolar")
app.config.globalProperties.$formatDate = (value) => new Date(value).toLocaleDateString('uz-UZ')

// 5. Ilova darajasidagi qiymat (provide/inject, 27-bob)
app.provide('apiBaseUrl', import.meta.env.VITE_API_URL)

// 6. Xatolarni ushlash (68-bob)
app.config.errorHandler = (error, instance, info) => {
  console.error('[vue]', info, error)
}

app.mount('#app')
```

Muhim tartib qoidasi: **`mount()` — oxirgi chaqiruv.** Undan keyin ro'yxatdan o'tkazilgan plugin yoki komponent allaqachon render qilingan daraxtga ta'sir qilmaydi.

## Kod: ildiz komponent va `mount` qaytaradigan qiymat

```js
const app = createApp(App, {
  // ildiz komponentga props uzatish
  locale: 'uz',
})

const vm = app.mount('#app')   // ildiz komponent nusxasi qaytadi
```

`mount` qaytargan qiymat — ildiz komponent nusxasi. Unga tashqi (Vue'dan tashqaridagi) kod orqali murojaat qilish mumkin, masalan eski jQuery kodidan:

```js
window.__app = vm
// ...
window.__app.reload()   // ildiz komponentda expose qilingan metod
```

Bu — oxirgi chora. Odatiy yo'l — hodisa yoki store orqali (41-bob).

## Kod: ilovani to'xtatish

```js
app.unmount()
```

Butun daraxtni yechadi, hayot sikli hooklarini chaqiradi, kuzatuvchilarni to'xtatadi. Mikro-frontend yoki sahifaning bir bo'lagi almashadigan holatlarda ishlatiladi; oddiy SPA'da kerak emas.

## Kod: `app.config` sozlamalari

```js
// Ishlab chiqish rejimida ogohlantirishlarni boshqarish
app.config.warnHandler = (msg, instance, trace) => {
  if (msg.includes('Extraneous non-emits event listeners')) return

  console.warn(msg, trace)
}

// Ba'zi tag'larni Vue komponent deb o'ylamasin (web components, 04-bob)
app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('ion-')

// Unumdorlikni Performance panelida ko'rish (62-bob)
app.config.performance = true
```

`compilerOptions` faqat **brauzerda kompilyatsiya** qilinadigan shablonlarga ta'sir qiladi. `.vue` fayllar build vaqtida kompilyatsiya qilinadi, shuning uchun u yerda xuddi shu sozlama `vite.config.js` ichida beriladi:

```js
// vite.config.js
import vue from '@vitejs/plugin-vue'

export default {
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('ion-'),
        },
      },
    }),
  ],
}
```

Bu ikkilik (runtime config va build config) boshlovchilarni eng ko'p chalg'itadigan joylardan biri.

## Muhandislik nuqtai nazari: nima global bo'lishi kerak

Global registratsiya qulay, lekin narxi bor:

| Narsa | Global qilinsinmi | Sabab |
| --- | --- | --- |
| Dizayn tizimi komponentlari (`UiButton`, `UiInput`) | Ha | 50 joyda import yozilmaydi; tree-shaking baribir ishlaydi (build ularni ko'radi) |
| Sahifaga xos komponent | Yo'q | Faqat bitta joyda kerak; global ro'yxat ifloslanadi |
| `$formatDate` kabi yordamchi | Yo'q (composable afzal) | IDE topa olmaydi, TypeScript tipini bilmaydi, testda mock qilish qiyin |
| Router, Pinia | Ha (plugin sifatida) | Ular ilova darajasidagi xizmatlar |

Umumiy qoida: **global narsa import grafida ko'rinmaydi.** Ko'rinmagan bog'liqlik — refaktoringda sinadigan bog'liqlik. Shuning uchun zamonaviy Vue kodida `globalProperties` deyarli ishlatilmaydi, o'rniga composable (29-bob) yoki `provide/inject` (27-bob) qo'llaniladi.

## Muhandislik nuqtai nazari: `mount` va DOM tayyorligi

`mount('#app')` chaqirilganda `#app` elementi DOM'da bo'lishi shart. `main.js` `<head>` ichida `defer`siz ulansa, element hali yo'q bo'ladi va Vue "Failed to mount app: mount target selector returned null" deydi.

Vite yaratgan `index.html` da skript `<body>` oxirida va `type="module"` bilan ulanadi — module skriptlari avtomatik `defer` bo'ladi, shuning uchun bu muammo o'z-o'zidan hal bo'lgan.

`#app` ichidagi mavjud HTML `mount` paytida **o'chiriladi** (SSR hydration holatidan tashqari, 56-bob). Shuning uchun u yerga "yuklanmoqda…" skeletini qo'yish mumkin: Vue tayyor bo'lishi bilan uni almashtiradi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `app.use(router)` ni `app.mount()` dan keyin yozish | Plugin render qilingan daraxtga ta'sir qilmaydi, marshrutlar ishlamaydi | Barcha `use/component/directive` — `mount` dan oldin |
| Bitta ilovada `createApp` ni bir necha marta chaqirib, bir xil `#app` ga mount qilish | Ikkinchisi birinchisining DOM'ini o'chiradi | Har ilovaga o'z elementi; yoki bitta ilova ichida router |
| `globalProperties` ga xizmatlarni to'plash | Test va TypeScript bilan ishlamaydi, bog'liqlik ko'rinmaydi | Composable yoki `provide/inject` |
| `app.config.globalProperties.$http = axios` | Har komponent butun HTTP qatlamga bog'lanadi | 44-bobdagi `useApi()` composable |
| SSR'da bitta global `app` nusxasini qayta ishlatish | Foydalanuvchilar holati aralashib ketadi | Har so'rovga yangi `createApp` (56-bob) |

## Amaliyot

1. Loyihangizda `UiButton.vue` yarating va uni global ro'yxatdan o'tkazing. Keyin o'chirib, oddiy importga o'tkazing — qaysi biri qulayroq ekanini ikki sahifada sinab ko'ring.
2. `app.config.errorHandler` yozing va komponent ichida ataylab `throw new Error('sinov')` qiling. Xato konsolda qanday ko'rinishini kuzating.
3. `main.js` ga ikkinchi ilova qo'shing: `createApp(Widget).mount('#widget')`, `index.html` ga `<div id="widget"></div>`. Ikki ilova bir sahifada yonma-yon ishlashiga ishonch hosil qiling.
4. `app.provide('apiBaseUrl', '...')` qiling va ildiz komponentda `inject('apiBaseUrl')` bilan o'qing (27-bobning avansi).

## Rasmiy hujjat

- Ilova yaratish: <https://vuejs.org/guide/essentials/application.html>
- Application API: <https://vuejs.org/api/application.html>
- Application config: <https://vuejs.org/api/application.html#app-config>
