# 56 — SSR mexanizmi

[← Oldingi: Kod sifati](55-kod-sifati.md) · [Mundarija](README.md) · [Keyingi: Qo'lda SSR qurish →](57-qolda-ssr.md)

## Tushuncha

SPA'da brauzer bo'sh HTML oladi va sahifani JavaScript quradi:

```html
<div id="app"></div>
<script type="module" src="/assets/index.js"></script>
```

SSR'da server HTML'ni **tayyor holda** yuboradi, keyin brauzerda o'sha HTML "jonlantiriladi" (hydration):

```html
<div id="app">
    <h1>Mahsulotlar</h1>
    <ul><li>Klaviatura</li><li>Sichqoncha</li></ul>
</div>
<script type="module" src="/assets/entry-client.js"></script>
```

Foydalanuvchi mazmunni JS yuklanishidan oldin ko'radi; qidiruv tizimi va ijtimoiy tarmoq preview'lari ham shu HTML'ni o'qiydi.

## Nega shunday: hydration nima qiladi

Klientda Vue xuddi shu komponent daraxtini qayta quradi, lekin DOM yaratish o'rniga **mavjud DOM'ga ulanadi**:

1. Komponentlar `setup` ishlaydi, holat tiklanadi;
2. Har VNode server yaratgan DOM tuguniga bog'lanadi;
3. Hodisa tinglovchilari ulanadi;
4. Shundan keyin sahifa interaktiv bo'ladi.

Shuning uchun **server va klient bir xil natija berishi shart**. Farq bo'lsa — "hydration mismatch": Vue konsolga ogohlantirish yozadi va muammoli qismni qaytadan render qiladi (sekin, ba'zan ko'z bilan ko'rinadigan miltillash bilan).

## Kod: mismatch sabablari

```vue
<script setup>
// ✗ Server va klientda boshqa qiymat
const now = new Date().toLocaleTimeString()
const id = Math.random()

// ✗ Server'da `window` yo'q
const width = window.innerWidth

// ✗ Server'da `localStorage` yo'q
const theme = localStorage.getItem('theme')
</script>

<template>
    <p>{{ now }}</p>
</template>
```

To'g'ri yo'llar:

```vue
<script setup>
import { onMounted, ref } from 'vue'
import { useId } from 'vue'

// ✓ Noyob id — SSR'ga xavfsiz (Vue 3.5+)
const id = useId()

// ✓ Brauzerga xos narsalar faqat mount'dan keyin
const width = ref(0)
const theme = ref('light')

onMounted(() => {
  width.value = window.innerWidth
  theme.value = localStorage.getItem('theme') ?? 'light'
})
</script>
```

Qo'shimcha vosita — faqat klientda render qilish:

```vue
<ClientOnly>
    <MapWidget />          <!-- server'da umuman render qilinmaydi -->
</ClientOnly>
```

`<ClientOnly>` Nuxt'da tayyor keladi (59-bob); qo'lda SSR'da uni o'zingiz yozasiz:

```vue
<script setup>
import { onMounted, ref } from 'vue'

const mounted = ref(false)

onMounted(() => (mounted.value = true))
</script>

<template>
    <slot v-if="mounted" />
    <slot v-else name="fallback" />
</template>
```

## Kod: SSR'da eng muhim qoida — holat izolyatsiyasi

```js
// ✗ Modul darajasidagi holat — barcha so'rovlarga umumiy
const cart = reactive({ items: [] })

export function useCart() {
  return cart            // serverda foydalanuvchilar ma'lumoti aralashadi
}
```

Serverda ilova **bir marta** yuklanadi va minglab so'rovga xizmat qiladi. Shuning uchun:

```js
// ✓ Har so'rovga yangi ilova va yangi store
export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  const router = createRouter({ history: createMemoryHistory(), routes })

  app.use(pinia)
  app.use(router)

  return { app, pinia, router }
}
```

Bu — 41 va 43-boblarda takrorlangan ogohlantirishning sababi. Xatoning oqibati og'ir: bir foydalanuvchi boshqasining ma'lumotini ko'radi.

## Kod: universal kod yozish

```js
// Muhitni aniqlash
const isServer = typeof window === 'undefined'

// Brauzer API'lari — shartli
if (!isServer) {
  window.addEventListener('resize', onResize)
}

// Vite'da `import.meta.env.SSR` ham bor
if (import.meta.env.SSR) {
  // faqat server
}
```

Hayot sikli hooklari SSR'da qanday ishlaydi:

| Hook | Serverda | Klientda (hydration) |
| --- | --- | --- |
| `setup()` | ✅ ishlaydi | ✅ ishlaydi |
| `onBeforeMount` | ❌ | ✅ |
| `onMounted` | ❌ | ✅ |
| `onUnmounted` | ❌ | ✅ |
| `watch` (immediate) | ✅ | ✅ |
| `onServerPrefetch` | ✅ | ❌ |

Shundan kelib chiqadi: **tozalash kodini (`onUnmounted`) serverda ishlatib bo'lmaydi**, shuning uchun serverda taymer/tinglovchi yaratmang.

## Kod: ma'lumotni serverda yuklash

```vue
<script setup>
import { onServerPrefetch, ref } from 'vue'

const users = ref([])

async function load() {
  users.value = await api.get('/users')
}

// Server: render'dan oldin kutadi
onServerPrefetch(load)

// Klient: server yuklamagan bo'lsa (SPA navigatsiyasi) yuklaydi
onMounted(() => {
  if (!users.value.length) load()
})
</script>
```

Amalda bu naqsh qo'lda yozilmaydi — Nuxt'ning `useAsyncData`/`useFetch` (60-bob) yoki `Suspense` (36-bob) shu ishni qiladi.

## Kod: holatni serverdan klientga uzatish

Server yuklagan ma'lumot klientda qayta so'ralmasligi kerak:

```js
// server
const state = JSON.stringify(pinia.state.value).replace(/</g, '\\u003c')

html = html.replace('<!--state-->', `<script>window.__STATE__=${state}</script>`)
```

```js
// klient
if (window.__STATE__) pinia.state.value = window.__STATE__
```

`replace(/</g, ...)` — XSS himoyasi: ma'lumot ichida `</script>` bo'lsa sahifa buziladi va skript in'ektsiyasi mumkin bo'ladi (65-bob).

## Muhandislik nuqtai nazari: SSR nimani yaxshilaydi, nimani yomonlashtiradi

| Ko'rsatkich | SSR ta'siri |
| --- | --- |
| FCP / LCP (mazmun ko'rinishi) | ✅ Sezilarli yaxshi |
| SEO va ijtimoiy preview | ✅ Ishlaydi |
| TTFB (birinchi bayt) | ❌ Sekinroq (server hisoblaydi) |
| TTI (interaktivlik) | ⚖️ O'zgarmaydi yoki biroz yomonroq (hydration) |
| Server narxi | ❌ Har so'rovga CPU |
| Murakkablik | ❌ Ikki muhit, mismatch, kesh, cookie |

Shuning uchun qaror **maqsadga qarab** qilinadi (04-bob): login orqasidagi admin panelga SSR kerak emas; marketing sahifasi va katalogga — kerak.

## Muhandislik nuqtai nazari: hydration narxini kamaytirish

Hydration — bepul emas: butun daraxt qayta quriladi. Uchta zamonaviy yondashuv:

1. **Lazy hydration** (Vue 3.5+, 28-bob) — komponent ko'rinishga kirganda yoki foydalanuvchi bosganda jonlanadi;
2. **Islands** — sahifaning faqat interaktiv "orollari" hydration qilinadi (Astro yondashuvi; Nuxt'da qisman `<ClientOnly>` va lazy hydration orqali);
3. **Server Components / Vapor** — kelajak yo'nalishi (47-bob).

Amaliy qadam: statik bo'limlarni (footer, matn bloklari) alohida komponentga ajratib, ularni hydration'dan chiqarish yoki kechiktirish.

## Muhandislik nuqtai nazari: kesh qatlamlari

SSR'da kesh — unumdorlikning asosiy vositasi:

| Qatlam | Nima keshlanadi | Misol |
| --- | --- | --- |
| CDN | To'liq HTML | Anonim foydalanuvchi uchun katalog sahifasi |
| Server (Redis) | Render natijasi yoki ma'lumot | Mahsulot ro'yxati 60 s |
| Komponent | Alohida bo'lak | Footer, menyu |
| Klient | API javoblari | 44-bobdagi kesh |

Muhim qoida: **shaxsiy ma'lumot bor sahifani CDN'da keshlamang.** `Cache-Control: private` yoki cookie'ga qarab kesh kalitini ajrating — aks holda bir foydalanuvchi boshqasining sahifasini oladi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Modul darajasidagi holat | Foydalanuvchilar ma'lumoti aralashadi | Har so'rovga yangi ilova/store |
| `window`/`document` ni `setup` da ishlatish | Serverda xato | `onMounted` yoki `import.meta.env.SSR` tekshiruvi |
| `new Date()`, `Math.random()` shablonda | Hydration mismatch | `useId`, serverdan uzatilgan qiymat |
| Holatni klientga uzatmaslik | Ma'lumot ikki marta yuklanadi | `window.__STATE__` |
| State'ni escape qilmasdan HTML'ga yozish | XSS | `<` ni escape qiling |
| Shaxsiy sahifani CDN'da keshlash | Ma'lumot sizishi | `Cache-Control: private` |
| Hamma narsani SSR qilish | Server yuki, murakkablik | Faqat kerakli sahifalar (58-bob) |

## Amaliyot

1. SPA loyihangizdagi komponentlarni ko'rib chiqing: qaysilari `window`/`localStorage` ga `setup` da murojaat qiladi? Ro'yxat tuzing.
2. `<ClientOnly>` komponentini yozing va uni xarita yoki grafik bilan ishlatib ko'ring.
3. Modul darajasida `reactive` holat yarating va nega SSR'da xavfli ekanini bir paragrafda tushuntiring.
4. `useId()` bilan forma maydonlarini bog'lang (45-bob) va nega `Math.random()` bu yerda ishlamasligini ayting.
5. Keyingi bobga tayyorgarlik: `renderToString` nima qaytarishini hujjatdan o'qing.

## Rasmiy hujjat

- SSR: <https://vuejs.org/guide/scaling-up/ssr.html>
- Hydration mismatch: <https://vuejs.org/guide/scaling-up/ssr.html#hydration-mismatch>
- `useId`: <https://vuejs.org/api/composition-api-helpers.html#useid>
