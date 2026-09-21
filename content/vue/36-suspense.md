# 36 — `<Suspense>`

[← Oldingi: Teleport](35-teleport.md) · [Mundarija](README.md) · [Keyingi: SFC ichki tuzilishi →](37-sfc-ichki-tuzilishi.md)

## Tushuncha

`<Suspense>` — daraxtdagi **bir nechta async bog'liqlikni** kutib turadigan va tayyor bo'lguncha zaxira mazmun ko'rsatadigan ichki komponent.

```vue
<template>
    <Suspense>
        <!-- Asosiy mazmun: ichida async setup yoki async komponent bo'lishi mumkin -->
        <UserDashboard />

        <!-- Kutish paytida -->
        <template #fallback>
            <UiSkeleton />
        </template>
    </Suspense>
</template>
```

> **Status:** Vue 3.5 da `<Suspense>` hamon **eksperimental** deb belgilangan. API o'zgarishi mumkin. Production'da ehtiyot bilan ishlating; oddiy holatlar uchun `loading` bayrog'i yoki `defineAsyncComponent` ning `loadingComponent` i ishonchliroq.

## Kod: `async setup`

`<Suspense>` ikki narsani kutadi: async komponentlar (28-bob) va `async setup()` ishlatadigan komponentlar.

```vue
<!-- UserDashboard.vue -->
<script setup>
// `<script setup>` ichida yuqori darajali await — komponentni "async" qiladi
const user = await fetch('/api/me').then((r) => r.json())
const stats = await fetch('/api/stats').then((r) => r.json())
</script>

<template>
    <h1>{{ user.name }}</h1>
    <StatsGrid :stats="stats" />
</template>
```

Bunday komponent **faqat `<Suspense>` ichida** ishlaydi; tashqarida "async setup() is used without a suspense boundary" ogohlantirishi chiqadi.

## Kod: hodisalar

```vue
<Suspense @pending="onPending" @resolve="onResolve" @fallback="onFallback">
    <UserDashboard />
    <template #fallback><UiSkeleton /></template>
</Suspense>
```

| Hodisa | Qachon |
| --- | --- |
| `pending` | Yangi async bog'liqlik boshlandi |
| `resolve` | Hammasi tayyor, asosiy mazmun ko'rsatildi |
| `fallback` | Zaxira mazmun ko'rsatildi |

## Kod: xatolarni ushlash

`<Suspense>` xatolarni o'zi ushlamaydi — buni `onErrorCaptured` bilan qilasiz (20-bob):

```vue
<script setup>
import { onErrorCaptured, ref } from 'vue'

const error = ref(null)

onErrorCaptured((cause) => {
  error.value = cause

  return false
})
</script>

<template>
    <UiError v-if="error" :error="error" />

    <Suspense v-else>
        <UserDashboard />
        <template #fallback><UiSkeleton /></template>
    </Suspense>
</template>
```

Amalda uch holat (`loading` / `error` / `data`) uchun `<Suspense>` + `onErrorCaptured` juftligi kerak bo'ladi — bu 12-bobdagi to'rt holat naqshidan ko'p farq qilmaydi.

## Kod: marshrut darajasida

```vue
<RouterView v-slot="{ Component }">
    <Suspense timeout="0">
        <component :is="Component" />
        <template #fallback>
            <UiPageSkeleton />
        </template>
    </Suspense>
</RouterView>
```

Bu naqsh bilan har bir sahifa o'z ma'lumotini `async setup` da yuklaydi va yagona skelet butun sahifa uchun ishlaydi.

## Muhandislik nuqtai nazari: Suspense yoki lokal loading

| Mezon | `<Suspense>` | Lokal `loading` ref |
| --- | --- | --- |
| Bir nechta so'rovni birlashtirish | Avtomatik | Qo'lda (`Promise.all`) |
| Qisman ko'rsatish (ba'zi bo'lak tayyor) | Yo'q — hammasi yoki hech nima | Ha |
| Qayta yuklash (refresh) | Qiyin — komponent qayta yaratilishi kerak | Oson (`reload()`) |
| Xato boshqaruvi | Alohida mexanizm | Bir joyda |
| Barqarorlik | Eksperimental | Barqaror |

Amaliy tavsiya: **ma'lumot yuklash uchun composable (44-bob) ishlating**, `<Suspense>` ni esa butun sahifa darajasidagi birinchi yuklanish uchun sinab ko'ring.

SSR'da `<Suspense>` foydali bo'ladi: server async komponentlarni kutib, to'liq HTML qaytaradi — lekin Nuxt buni o'z mexanizmi bilan hal qiladi (60-bob).

## Muhandislik nuqtai nazari: skelet yoki spinner

`fallback` ichida nima bo'lishi kerak?

| Kutish vaqti | Tavsiya |
| --- | --- |
| < 200 ms | Hech narsa (miltillash yomonroq) |
| 200 ms – 1 s | Skelet (kelajakdagi tuzilmani ko'rsatadi) |
| > 1 s | Skelet + progress belgisi |
| > 5 s | Progress + "bekor qilish" imkoniyati |

Skelet spinner'dan yaxshiroq, chunki u **layout siljishini** (CLS) oldini oladi: joy oldindan band qilinadi va ma'lumot kelganda sahifa sakramaydi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `async setup` ni `<Suspense>` siz ishlatish | Ogohlantirish, komponent render bo'lmaydi | O'rab qo'ying yoki `loading` ref |
| `<Suspense>` ga ikkita ildiz bola berish | Faqat bitta default slot bolasi qo'llab-quvvatlanadi | Bitta o'ram komponent |
| Xato boshqaruvini unutish | Xato bo'lsa fallback abadiy qoladi | `onErrorCaptured` |
| Har komponentda `async setup` | Butun sahifa eng sekin so'rovni kutadi | Parallel yuklash (`Promise.all`) yoki lokal loading |
| Eksperimental API'ga production'da tayanish | API o'zgarishi mumkin | Muqobilni ham tayyorlab qo'ying |
| Fallback'da spinner + layout siljishi | CLS yomonlashadi | Skelet |

## Amaliyot

1. `async setup` bilan ma'lumot yuklaydigan komponent yozing va `<Suspense>` ichida ishlating.
2. `@pending`/`@resolve` hodisalarini konsolga chiqarib, tartibni kuzating.
3. So'rovni ataylab xato qildiring (`/api/yo'q`) va `onErrorCaptured` bilan ushlang.
4. Xuddi shu ekranni composable (`useFetch`) bilan qayta yozing va ikkalasini o'qilishi, qayta yuklash imkoniyati bo'yicha solishtiring.

## Rasmiy hujjat

- Suspense: <https://vuejs.org/guide/built-ins/suspense.html>
- `<Suspense>` API: <https://vuejs.org/api/built-in-components.html#suspense>
