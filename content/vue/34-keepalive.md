# 34 — `<KeepAlive>`

[← Oldingi: TransitionGroup va animatsiya](33-transitiongroup-va-animatsiya.md) · [Mundarija](README.md) · [Keyingi: Teleport →](35-teleport.md)

## Tushuncha

Dinamik komponent almashganda eskisi **yo'q qilinadi**: holati, scroll pozitsiyasi, forma ma'lumoti yo'qoladi. `<KeepAlive>` uni yo'q qilish o'rniga **keshda saqlaydi**:

```vue
<template>
    <KeepAlive>
        <component :is="currentTab" />
    </KeepAlive>
</template>
```

Endi tab'lar orasida o'tganda har birining holati saqlanadi.

## Kod: `include` / `exclude` / `max`

```vue
<!-- Faqat nomlangan komponentlar keshlanadi -->
<KeepAlive include="TabProfile,TabSettings">
    <component :is="current" />
</KeepAlive>

<!-- Regex -->
<KeepAlive :include="/^Tab/">
    <component :is="current" />
</KeepAlive>

<!-- Massiv -->
<KeepAlive :include="['TabProfile', 'TabSettings']" :exclude="['TabHeavy']">
    <component :is="current" />
</KeepAlive>

<!-- Keshda eng ko'pi bilan 5 ta nusxa (LRU) -->
<KeepAlive :max="5">
    <component :is="current" />
</KeepAlive>
```

`include`/`exclude` komponent **nomiga** qaraydi. `<script setup>` da nom fayl nomidan olinadi; aniq berish uchun:

```js
defineOptions({ name: 'TabProfile' })
```

## Kod: `onActivated` / `onDeactivated`

Keshlangan komponent `unmounted` bo'lmaydi, shuning uchun `onUnmounted` ishlamaydi. O'rniga ikkita hook bor:

::: options
```js
export default {
  activated() {
    this.refresh()              // keshdan qaytdi
  },
  deactivated() {
    this.pausePolling()         // keshga ketdi
  },
}
```
:::

::: composition
```js
import { onActivated, onDeactivated } from 'vue'

onActivated(() => {
  refresh()                     // keshdan qaytdi
})

onDeactivated(() => {
  pausePolling()                // keshga ketdi
})
```
:::

Tartib: birinchi marta — `onMounted` → `onActivated`. Keyin har qaytishda faqat `onActivated`.

## Kod: router bilan

```vue
<template>
    <RouterView v-slot="{ Component }">
        <KeepAlive :include="['ProductList']">
            <component :is="Component" />
        </KeepAlive>
    </RouterView>
</template>
```

Tipik ssenariy: foydalanuvchi mahsulotlar ro'yxatini 3 sahifa pastga aylantirdi, mahsulotni ochdi, orqaga qaytdi — va ro'yxat o'sha joyida qoldi, qayta yuklanmadi.

Faqat ba'zi marshrutlarni keshlash uchun `meta` ishlatiladi (40-bob):

```js
{ path: '/products', component: ProductList, meta: { keepAlive: true } }
```

```vue
<RouterView v-slot="{ Component, route }">
    <KeepAlive>
        <component :is="Component" v-if="route.meta.keepAlive" :key="route.path" />
    </KeepAlive>
    <component :is="Component" v-if="!route.meta.keepAlive" :key="route.path" />
</RouterView>
```

## Kod: `Transition` bilan birga

```vue
<RouterView v-slot="{ Component }">
    <Transition name="fade" mode="out-in">
        <KeepAlive>
            <component :is="Component" />
        </KeepAlive>
    </Transition>
</RouterView>
```

Tartib muhim: `Transition` tashqarida, `KeepAlive` ichkarida.

## Muhandislik nuqtai nazari: kesh — xotira demakdir

`KeepAlive` hech narsani bepul bermaydi: keshlangan har bir komponent xotirada qoladi, uning kuzatuvchilari va timerlari **ishlashda davom etadi**.

Shuning uchun:

```js
// Keshlangan komponentda so'rovlarni to'xtatib turing
onDeactivated(() => clearInterval(pollTimer))
onActivated(() => { pollTimer = setInterval(poll, 5000) })
```

Va `max` ni belgilang: `:max="5"` bo'lsa, eng kam ishlatilgan nusxa (LRU) chiqarib yuboriladi va `onUnmounted` chaqiriladi.

Qachon keshlamaslik kerak:

| Holat | Sabab |
| --- | --- |
| Ma'lumot tez eskiradigan sahifa | Foydalanuvchi eski ma'lumotni ko'radi |
| Og'ir komponent (xarita, grafik) | Xotira o'sadi |
| Forma yuborilgandan keyin | Eski qiymatlar qolib ketadi |
| Kamdan-kam qaytiladigan sahifa | Keshdan foyda yo'q |

## Muhandislik nuqtai nazari: kesh yoki holatni yuqoriga ko'chirish

Ko'pincha `KeepAlive` o'rniga holatni **yuqoriga** (store yoki URL ga) ko'chirish to'g'riroq:

```js
// Ro'yxat filtri URL'da — sahifa qayta yuklansa ham saqlanadi
const route = useRoute()
const router = useRouter()

const page = computed({
  get: () => Number(route.query.page ?? 1),
  set: (value) => router.replace({ query: { ...route.query, page: value } }),
})
```

Farqi:

| | `KeepAlive` | Holatni ko'chirish |
| --- | --- | --- |
| Sahifa yangilansa (F5) | Yo'qoladi | Saqlanadi (URL/store) |
| Havola ulashilsa | Ishlamaydi | Ishlaydi |
| Xotira | Butun komponent daraxti | Faqat qiymat |
| Scroll pozitsiyasi | Saqlanadi | Qo'lda (`scrollBehavior`, 40-bob) |

Amaliy tavsiya: **filtr, sahifa raqami, tanlangan tab — URL'da; scroll va murakkab lokal UI holati — `KeepAlive` da.**

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `KeepAlive` bilan `onUnmounted` ga tayanish | Chaqirilmaydi | `onDeactivated` |
| Keshlangan komponentda timer'ni to'xtatmaslik | Ko'rinmasa ham so'rov yuboraveradi | `onDeactivated` da to'xtatish |
| `max` siz hamma narsani keshlash | Xotira o'sadi | `:max="5"` |
| Eskiradigan ma'lumotni keshlash | Foydalanuvchi eski holatni ko'radi | `onActivated` da yangilash |
| `include` da fayl nomi bilan komponent nomi mos kelmasligi | Kesh ishlamaydi, sabab ko'rinmaydi | `defineOptions({ name })` |
| `Transition` ni `KeepAlive` ichiga qo'yish | Animatsiya ishlamaydi | `Transition` tashqarida |

## Amaliyot

1. Uchta tab'li interfeys yasang, har birida input bo'lsin. `KeepAlive` siz va bilan solishtiring.
2. Router bilan ro'yxat sahifasini keshlang: scroll pozitsiyasi va filtr saqlanishini tekshiring.
3. Keshlangan komponentga `setInterval` qo'ying va `onDeactivated` siz qoldiring — konsolda u ishlashda davom etishini ko'ring, keyin tuzating.
4. `:max="2"` qo'yib, uchta tab orasida aylanib, LRU chiqarib yuborishini `onUnmounted` log'i orqali kuzating.

## Rasmiy hujjat

- KeepAlive: <https://vuejs.org/guide/built-ins/keep-alive.html>
- `<KeepAlive>` API: <https://vuejs.org/api/built-in-components.html#keepalive>
