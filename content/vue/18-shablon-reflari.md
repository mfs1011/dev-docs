# 18 — Shablon ref'lari

[← Oldingi: Reaktivlik: chuqur qatlam](17-reaktivlik-chuqur.md) · [Mundarija](README.md) · [Keyingi: Komponent asoslari →](19-komponent-asoslari.md)

## Tushuncha

Ba'zan haqiqiy DOM elementi kerak bo'ladi: inputga fokus berish, canvas'ga chizish, scroll pozitsiyasini o'lchash, tashqi kutubxonaga element uzatish. Buning uchun `ref` atributi ishlatiladi.

::: options
```vue
<script>
export default {
  mounted() {
    this.$refs.search.focus()
  },
}
</script>

<template>
    <input ref="search">
</template>
```
:::

::: composition
```vue
<script setup>
import { onMounted, useTemplateRef } from 'vue'

// Vue 3.5+ — tavsiya etiladigan usul
const search = useTemplateRef('search')

onMounted(() => {
  search.value.focus()
})
</script>

<template>
    <input ref="search">
</template>
```

Vue 3.5 gacha (hozir ham ishlaydi): o'zgaruvchi nomi `ref` atributi bilan bir xil bo'lishi kerak edi.

```vue
<script setup>
import { onMounted, ref } from 'vue'

const search = ref(null)

onMounted(() => search.value.focus())
</script>

<template>
    <input ref="search">
</template>
```
:::

## Nega shunday: qachon to'ldiriladi

`ref` **render qilingandan keyin** to'ladi. Shuning uchun:

```js
const el = useTemplateRef('box')

console.log(el.value)        // null — hali render bo'lmagan

onMounted(() => {
  console.log(el.value)      // <div class="box">
})
```

`v-if` ichidagi element yashiringanda `ref` yana `null` bo'ladi. Shuning uchun undan foydalanishdan oldin tekshiring:

```js
watch(isOpen, async (open) => {
  if (!open) return

  await nextTick()           // DOM yangilanishini kuting
  modal.value?.focus()
})
```

## Kod: `v-for` ichidagi ref

```vue
<script setup>
import { useTemplateRef } from 'vue'

const rows = useTemplateRef('rows')   // massiv bo'ladi

function scrollTo(index) {
  rows.value[index]?.scrollIntoView({ block: 'center' })
}
</script>

<template>
    <li v-for="item in items" :key="item.id" ref="rows">{{ item.title }}</li>
</template>
```

Massiv tartibi manba massiv tartibiga **mos kelishi kafolatlanmaydi** — Vue hujjati shunday ogohlantiradi. Aniq elementga murojaat kerak bo'lsa, funksiya-ref ishonchliroq:

```vue
<script setup>
const rowById = new Map()

function setRow(el, id) {
  if (el) rowById.set(id, el)
  else rowById.delete(id)
}
</script>

<template>
    <li v-for="item in items" :key="item.id" :ref="(el) => setRow(el, item.id)">
        {{ item.title }}
    </li>
</template>
```

## Kod: komponentga ref

Komponentga qo'yilgan `ref` uning **nusxasini** beradi:

```vue
<script setup>
import { useTemplateRef } from 'vue'
import VideoPlayer from './VideoPlayer.vue'

const player = useTemplateRef('player')

function playFromStart() {
  player.value.seek(0)
  player.value.play()
}
</script>

<template>
    <VideoPlayer ref="player" :src="src" />
    <button @click="playFromStart">Boshidan</button>
</template>
```

Lekin `<script setup>` ishlatilgan komponent **yopiq**: uning ichidagi hech narsa tashqaridan ko'rinmaydi. Ochish uchun `defineExpose` kerak:

```vue
<!-- VideoPlayer.vue -->
<script setup>
import { ref } from 'vue'

const video = useTemplateRef('video')

function play() { video.value.play() }
function seek(time) { video.value.currentTime = time }

defineExpose({ play, seek })   // faqat shu ikkisi tashqariga ochiq
</script>

<template>
    <video ref="video" :src="src"></video>
</template>
```

`defineExpose` — ataylab qilingan cheklov: komponentning ichki holati tasodifan API'ga aylanib qolmasin.

## Kod: tashqi kutubxonani ulash

```vue
<script setup>
import { markRaw, onMounted, onUnmounted, shallowRef, useTemplateRef } from 'vue'
import Chart from 'chart.js/auto'

const canvas = useTemplateRef('canvas')
const chart = shallowRef(null)

onMounted(() => {
  chart.value = markRaw(new Chart(canvas.value, { type: 'bar', data: props.data }))
})

onUnmounted(() => {
  chart.value?.destroy()          // tozalash — majburiy
})

watch(() => props.data, (data) => {
  chart.value.data = data
  chart.value.update()
})
</script>

<template>
    <canvas ref="canvas"></canvas>
</template>
```

Uchta qoida shu misolda: kutubxona nusxasini `markRaw`/`shallowRef` bilan saqlash (17-bob), `onUnmounted` da yo'q qilish (20-bob), ma'lumot o'zgarishini `watch` orqali uzatish (16-bob).

## Muhandislik nuqtai nazari: `ref` — oxirgi chora

Har safar `ref` yozishdan oldin so'rang: buni deklarativ qilib bo'ladimi?

| Vazifa | `ref` siz yo'l |
| --- | --- |
| Elementni yashirish | `v-if` / `v-show` |
| Class qo'shish | `:class` |
| Matnni o'zgartirish | `{{ }}` |
| Inputga qiymat yozish | `v-model` |
| Scroll pozitsiyasi (router) | `scrollBehavior` (40-bob) |
| Fokus | **`ref`** — deklarativ yo'l yo'q |
| O'lcham o'lchash | **`ref`** + `ResizeObserver` |
| Canvas, xarita, video | **`ref`** |

DOM'ni `ref` orqali o'zgartirish (masalan `el.innerHTML = ...`) esa deyarli har doim xato: Vue keyingi renderda uni o'z holatiga qaytaradi.

## Muhandislik nuqtai nazari: fokus va erishimlilik

Fokus boshqaruvi — `ref` ning eng ko'p uchraydigan to'g'ri ishlatilishi va u erishimlilik (64-bob) uchun muhim:

```js
// Modal ochilganda fokusni ichkariga olish
watch(isOpen, async (open) => {
  if (open) {
    previouslyFocused = document.activeElement
    await nextTick()
    dialog.value?.querySelector('[autofocus]')?.focus()
  } else {
    previouslyFocused?.focus()      // qaytarish ham shart
  }
})
```

Modal yopilganda fokusni **oldingi joyiga qaytarish** — klaviatura bilan ishlaydigan foydalanuvchi uchun majburiy, lekin ko'pincha unutiladi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `setup()` tanasida `ref.value` ni o'qish | Hali `null` | `onMounted` yoki `watch` + `nextTick` |
| `v-if` ichidagi elementga darhol murojaat | Element hali yo'q | `await nextTick()` va `?.` |
| `<script setup>` komponentiga `ref` qo'yib metod chaqirish | Komponent yopiq | `defineExpose` |
| DOM'ni `ref` orqali o'zgartirish | Vue qayta renderda bekor qiladi | Holat orqali |
| `v-for` ref massiv tartibiga ishonish | Tartib kafolatlanmagan | Funksiya-ref + `Map` |
| Tashqi kutubxonani `onUnmounted` da yo'q qilmaslik | Xotira oqishi, tinglovchilar qoladi | `destroy()` / `dispose()` |

## Amaliyot

1. Sahifa ochilganda qidiruv inputiga fokus bering (`onMounted`).
2. Modal yasang: ochilganda ichkariga fokus, yopilganda oldingi elementga qaytish.
3. `v-for` da funksiya-ref bilan `Map` to'ldiring va tugma orqali 5-elementga scroll qiling.
4. `VideoPlayer` komponenti yozing: ichida `<video>`, tashqariga faqat `play`/`pause` ni `defineExpose` bilan chiqaring.

## Rasmiy hujjat

- Template refs: <https://vuejs.org/guide/essentials/template-refs.html>
- `useTemplateRef`: <https://vuejs.org/api/composition-api-helpers.html#usetemplateref>
- `defineExpose`: <https://vuejs.org/api/sfc-script-setup.html#defineexpose>
