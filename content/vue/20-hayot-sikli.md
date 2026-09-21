# 20 — Hayot sikli

[← Oldingi: Komponent asoslari](19-komponent-asoslari.md) · [Mundarija](README.md) · [Keyingi: Registratsiya →](21-registratsiya.md)

## Tushuncha

Har bir komponent nusxasi tug'iladi, yashaydi va o'ladi. Vue shu yo'lning muhim nuqtalarida sizning kodingizni chaqirishga imkon beradi.

| Bosqich | Composition API | Options API | Nima bo'ldi |
| --- | --- | --- | --- |
| Yaratilish | (`setup()` tanasi) | `beforeCreate`, `created` | Holat tayyor, DOM yo'q |
| Birinchi render oldidan | `onBeforeMount` | `beforeMount` | Shablon kompilyatsiya qilingan |
| DOM'ga joylashdi | `onMounted` | `mounted` | DOM mavjud, o'lchash mumkin |
| Yangilanish oldidan | `onBeforeUpdate` | `beforeUpdate` | Holat o'zgardi, DOM hali eski |
| Yangilanish tugadi | `onUpdated` | `updated` | DOM yangilangan |
| O'chirilish oldidan | `onBeforeUnmount` | `beforeUnmount` | Hali DOM'da |
| O'chirildi | `onUnmounted` | `unmounted` | Tinglovchilar va kuzatuvchilar to'xtadi |
| Xato ushlandi | `onErrorCaptured` | `errorCaptured` | Bola komponentda xato |
| KeepAlive: faollashdi | `onActivated` | `activated` | Keshdan qaytdi (34-bob) |
| KeepAlive: to'xtadi | `onDeactivated` | `deactivated` | Keshga ketdi |

## Kod: eng ko'p ishlatiladigan juftlik

::: options
```js
export default {
  data() {
    return { width: 0 }
  },
  mounted() {
    this.onResize()
    window.addEventListener('resize', this.onResize)
  },
  unmounted() {
    window.removeEventListener('resize', this.onResize)
  },
  methods: {
    onResize() {
      this.width = window.innerWidth
    },
  },
}
```
:::

::: composition
```js
import { onMounted, onUnmounted, ref } from 'vue'

const width = ref(0)
const onResize = () => { width.value = window.innerWidth }

onMounted(() => {
  onResize()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})
```

Composition API'da bu juftlikni composable'ga chiqarish tabiiy (29-bob) — shunda tozalash kodi ham u bilan birga ko'chadi:

```js
const { width } = useWindowSize()
```
:::

## Kod: nimani qayerda qilish

```js
// ❶ setup tanasi — sinxron boshlang'ich holat
const items = ref([])
const loading = ref(true)

// ❷ onMounted — DOM va brauzer API'lari
onMounted(async () => {
  // DOM o'lchash
  height.value = box.value.offsetHeight

  // Brauzer API'lari (SSR'da server'da ishlamaydi — 56-bob)
  observer = new IntersectionObserver(onIntersect)
  observer.observe(box.value)

  // Ma'lumot yuklash (SSR kerak bo'lmasa)
  items.value = await fetchItems()
  loading.value = false
})

// ❸ onUnmounted — har qanday tashqi resurs
onUnmounted(() => {
  observer?.disconnect()
  clearInterval(timer)
  socket?.close()
})
```

Ma'lumotni `onMounted` da yuklash SPA uchun normal. SSR'da esa u **serverda ishlamaydi** (server faqat `setup` va render qiladi) — SSR uchun ma'lumot yuklash 57 va 60-boblarda.

## Kod: `onBeforeUpdate` / `onUpdated`

```js
onUpdated(() => {
  // DOM yangilangan — lekin bu hook HAR yangilanishda ishlaydi
  console.log('yangilandi')
})
```

Bu ikkisi kamdan-kam kerak bo'ladi va tez-tez noto'g'ri ishlatiladi:

```js
// ✗ Cheksiz sikl: holat o'zgardi → update → holat o'zgardi → …
onUpdated(() => {
  count.value++
})

// ✓ Aniq manbani kuzatish
watch(count, () => { /* ... */ })
```

Qoida: "biror narsa o'zgarganda ish bajarish" uchun `watch` ishlating (16-bob). `onUpdated` faqat "DOM butunlay yangilangandan keyin o'lchash" kabi umumiy holatlar uchun.

## Kod: `onErrorCaptured` — xato chegarasi

```vue
<!-- ErrorBoundary.vue -->
<script setup>
import { onErrorCaptured, ref } from 'vue'

const error = ref(null)

onErrorCaptured((cause, instance, info) => {
  error.value = cause
  console.error('[boundary]', info, cause)

  return false      // xato yuqoriga ko'tarilmasin
})
</script>

<template>
    <slot v-if="!error" />
    <div v-else class="error">
        <p>Nimadir xato ketdi.</p>
        <button @click="error = null">Qayta urinish</button>
    </div>
</template>
```

```vue
<ErrorBoundary>
    <RiskyWidget />
</ErrorBoundary>
```

`false` qaytarish — "men hal qildim, yuqoriga uzatmang" degani. Qaytarmasangiz, xato `app.config.errorHandler` gacha ko'tariladi (68-bob).

## Kod: `async setup` va hooklar

Hooklar **sinxron** ro'yxatdan o'tishi kerak — Vue ularni joriy komponent nusxasiga bog'laydi:

```js
// ✗ await dan keyin — Vue qaysi komponentga bog'lashni bilmaydi
const data = await fetchData()
onMounted(() => {})          // ogohlantirish yoki umuman ishlamaydi

// ✓
onMounted(() => {})
const data = await fetchData()
```

Xuddi shu sabab `setTimeout` ichida hook yozib bo'lmaydi.

## Muhandislik nuqtai nazari: har `on...` uchun juftlik

Amaliy qoida: **`onMounted` da nimadir ochsangiz, `onUnmounted` da yoping.**

| Ochildi | Yopilishi |
| --- | --- |
| `addEventListener` | `removeEventListener` |
| `setInterval` / `setTimeout` | `clearInterval` / `clearTimeout` |
| `IntersectionObserver`, `ResizeObserver`, `MutationObserver` | `disconnect()` |
| WebSocket, EventSource | `close()` |
| Tashqi kutubxona nusxasi (xarita, grafik, editor) | `destroy()` / `dispose()` |
| `requestAnimationFrame` sikli | `cancelAnimationFrame` |

Tozalanmagan resurs — xotira oqishi. SPA'da bu ayniqsa og'riqli: sahifa qayta yuklanmaydi, shuning uchun oqish soatlab to'planadi. Belgisi: foydalanuvchi bir necha sahifa aylangach ilova sekinlashadi.

Tekshirish usuli: DevTools → Memory → heap snapshot, sahifalar orasida bir necha marta yurib, "Detached elements" ni qidirish.

## Muhandislik nuqtai nazari: hooklar tartibi

Ota-bola daraxtida tartib quyidagicha:

```
Ota setup
 └ Bola setup
   └ Bola onBeforeMount
   └ Bola onMounted      ← bola oldin
 └ Ota onBeforeMount
 └ Ota onMounted         ← ota keyin
```

Ya'ni **`onMounted` pastdan yuqoriga** ishlaydi: bola avval joylashadi. Shuning uchun otada `onMounted` ichida bolaning DOM'i allaqachon mavjud.

O'chirishda esa teskari: ota `onBeforeUnmount` avval, keyin bolalar `onUnmounted`.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Tinglovchini tozalamaslik | Xotira oqishi, komponent o'chgach ham ishlaydi | `onUnmounted` juftligi |
| `onMounted` ichida `await` dan keyin hook e'lon qilish | Bog'lanmaydi | Hooklarni sinxron e'lon qiling |
| SSR'da `onMounted` ga tayanib ma'lumot yuklash | Serverda ishlamaydi, SEO yo'qoladi | `useFetch`/`useAsyncData` (60-bob) |
| `onUpdated` da holat o'zgartirish | Cheksiz sikl | `watch` |
| `created` da DOM'ga murojaat | DOM hali yo'q | `onMounted` |
| Timer'ni `onUnmounted` da tozalamaslik | Komponent yo'q, timer ishlaydi va `ref` ga yozadi | `clearInterval` |

## Amaliyot

1. `useWindowSize` composable yozing: `onMounted` da tinglovchi, `onUnmounted` da tozalash.
2. Komponentda `setInterval` bilan soat yasang. Tozalashsiz variantda komponentni `v-if` bilan o'chiring va konsolda timer ishlashda davom etishini ko'ring. Keyin tuzating.
3. `ErrorBoundary` yozing va ichidagi komponentda ataylab xato tashlang.
4. Ota va bolaga barcha hooklarga `console.log` qo'yib, tartibni chop eting va yuqoridagi sxema bilan solishtiring.

## Rasmiy hujjat

- Hayot sikli: <https://vuejs.org/guide/essentials/lifecycle.html>
- Hooklar API: <https://vuejs.org/api/composition-api-lifecycle.html>
- Hayot sikli diagrammasi: <https://vuejs.org/guide/essentials/lifecycle.html#lifecycle-diagram>
