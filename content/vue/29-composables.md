# 29 — Composables

[← Oldingi: Async komponentlar](28-async-komponentlar.md) · [Mundarija](README.md) · [Keyingi: Custom direktivalar →](30-custom-direktivalar.md)

## Tushuncha

Composable — **reaktiv holatdan foydalanadigan qayta ishlatiladigan funksiya**. Konvensiya bo'yicha nomi `use` bilan boshlanadi.

```js
// composables/useWindowSize.js
import { onMounted, onUnmounted, ref } from 'vue'

export function useWindowSize() {
  const width = ref(0)
  const height = ref(0)

  function update() {
    width.value = window.innerWidth
    height.value = window.innerHeight
  }

  onMounted(() => {
    update()
    window.addEventListener('resize', update)
  })

  onUnmounted(() => window.removeEventListener('resize', update))

  return { width, height }
}
```

```vue
<script setup>
import { useWindowSize } from '@/composables/useWindowSize'

const { width, height } = useWindowSize()
</script>

<template>
    <p>{{ width }} × {{ height }}</p>
</template>
```

Composable komponentning hayot siklidan foydalanadi — shuning uchun tozalash ham uning ichida qoladi. Bu mixin'lardan (05-bob) asosiy farq: kod va uning tozalanishi bir joyda.

## Kod: ma'lumot yuklash composable'i

```js
// composables/useFetch.js
import { ref, toValue, watchEffect } from 'vue'

export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)
  const loading = ref(false)

  async function load() {
    const target = toValue(url)        // ref, getter yoki oddiy qiymat bo'lishi mumkin
    if (!target) return

    loading.value = true
    error.value = null
    data.value = null

    const controller = new AbortController()

    try {
      const response = await fetch(target, { signal: controller.signal })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      data.value = await response.json()
    } catch (cause) {
      if (cause.name !== 'AbortError') error.value = cause
    } finally {
      loading.value = false
    }

    return () => controller.abort()
  }

  watchEffect((onCleanup) => {
    const promise = load()

    onCleanup(async () => (await promise)?.())
  })

  return { data, error, loading, reload: load }
}
```

```js
const route = useRoute()
const { data: user, loading } = useFetch(() => `/api/users/${route.params.id}`)
```

`toValue()` (Vue 3.3+) — composable'lar uchun muhim yordamchi: argument `ref`, getter funksiya yoki oddiy qiymat bo'lishi mumkin va composable uchalasini ham qabul qiladi.

## Kod: argumentlarni moslashuvchan qabul qilish

```js
import { toValue, computed } from 'vue'

export function useFiltered(source, predicate) {
  return computed(() => toValue(source).filter((item) => toValue(predicate)(item)))
}

// Uchala chaqiruv ham ishlaydi
useFiltered(items, (i) => !i.done)                 // ref
useFiltered(() => props.items, isPending)          // getter
useFiltered([1, 2, 3], (n) => n > 1)               // oddiy qiymat
```

Bu konvensiya VueUse kutubxonasida standart va o'z composable'laringizda ham qo'llash tavsiya etiladi.

## Kod: holatli va holatsiz composable

```js
// Holatsiz — faqat hisob (oddiy funksiya ham bo'lardi)
export function useFormatPrice() {
  return (value) => new Intl.NumberFormat('uz-UZ').format(value)
}

// Holatli — o'z reaktiv holati bor
export function useCounter(initial = 0) {
  const count = ref(initial)

  return {
    count,
    increment: () => count.value++,
    reset: () => (count.value = initial),
  }
}

// Umumiy (shared) holat — modul darajasida, barcha chaqiruvlar bo'lishadi
const theme = ref('light')

export function useTheme() {
  return {
    theme: readonly(theme),
    setTheme: (value) => (theme.value = value),
  }
}
```

Uchinchi shakl — "oddiy odamning store'i". Kichik ilovada yetarli, lekin SSR'da xavfli: modul darajasidagi holat serverda barcha foydalanuvchilarga umumiy bo'ladi (04, 56-bob). SSR bo'lsa — Pinia (42-bob).

## Kod: composable'lar bir-birini ishlatadi

```js
export function useUserProfile(userId) {
  const { data: user, loading } = useFetch(() => `/api/users/${toValue(userId)}`)
  const { data: posts } = useFetch(() => (user.value ? `/api/users/${user.value.id}/posts` : null))

  const displayName = computed(() => user.value?.name ?? 'Noma\'lum')

  return { user, posts, displayName, loading }
}
```

Bu — Composition API'ning asosiy yutug'i: mantiq qatlam-qatlam yig'iladi, komponent esa faqat ko'rinish bilan shug'ullanadi.

## Muhandislik nuqtai nazari: composable yozish qoidalari

1. **`use` bilan nomlang** — o'quvchi darhol "bu reaktiv holat bilan ishlaydi" deb tushunadi.
2. **`setup` sinxron qismida chaqiring.** Hayot sikli hooklarini ro'yxatdan o'tkazish uchun Vue joriy komponentni bilishi kerak (20-bob):

```js
// ✗
onMounted(async () => {
  const { data } = useFetch(url)     // hook bog'lanmaydi
})

// ✓
const { data } = useFetch(url)
```

3. **`ref` qaytaring, `reactive` emas** — chaqiruvchi destrukturizatsiya qilishi mumkin bo'lsin (17-bob).
4. **Tozalashni o'zingiz qiling** — `onUnmounted`/`onScopeDispose` ichida.
5. **Argumentlarni `toValue` orqali o'qing** — moslashuvchan API.
6. **Nojo'ya ta'sirni cheklang** — composable global holatni jimgina o'zgartirmasin.

## Muhandislik nuqtai nazari: composable yoki oddiy funksiya

Hamma narsani composable qilish shart emas:

| Kod | Nima bo'lishi kerak |
| --- | --- |
| Sana formatlash, matn kesish | Oddiy funksiya (`utils/format.js`) |
| API chaqiruvi (reaktivliksiz) | Oddiy funksiya (`api/users.js`) |
| Reaktiv holat + hayot sikli | Composable |
| Global holat (foydalanuvchi, savat) | Pinia store |
| DOM bilan ishlash (observer, event) | Composable |

Belgi: agar funksiyada `ref`, `computed`, `watch` yoki hayot sikli hooki yo'q bo'lsa — u composable emas, oddiy yordamchi funksiya. `use` prefiksini qo'yish faqat chalg'itadi.

## Muhandislik nuqtai nazari: VueUse

Ko'p uchraydigan composable'lar allaqachon yozilgan:

```bash
npm i @vueuse/core
```

```js
import { useLocalStorage, useDebounceFn, useIntersectionObserver, useEventListener } from '@vueuse/core'

const theme = useLocalStorage('theme', 'light')          // localStorage bilan sinxron ref
const search = useDebounceFn(doSearch, 300)
useEventListener(window, 'keydown', onKey)               // tozalash avtomatik
```

200+ tayyor composable bor. O'zingiz yozishdan oldin qarab chiqing — lekin butun kutubxonani "shunchaki bo'lsin" deb qo'shmang: kerakli 3–4 tasi tree-shaking bilan olinadi, qolgani bundle'ga kirmaydi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `async` funksiya ichida composable chaqirish | Hayot sikli hooklari bog'lanmaydi | `setup` sinxron qismida |
| `reactive` obyekt qaytarish | Destrukturizatsiya bog'lanishni uzadi | `ref` lar obyekti |
| Composable ichida tozalashni unutish | Xotira oqishi | `onUnmounted` / `onScopeDispose` |
| Modul darajasidagi holat + SSR | Foydalanuvchilar holati aralashadi | Pinia yoki `provide` |
| Oddiy yordamchiga `use` prefiksi | Chalg'itadi | `formatPrice()` |
| Har composable'da `fetch` ni takrorlash | Xato boshqaruvi har joyda boshqacha | Bitta `useFetch`/`useApi` qatlami (44-bob) |
| Composable'da `props` ni to'g'ridan-to'g'ri qabul qilish | Reaktivlik yo'qoladi | Getter: `useX(() => props.id)` |

## Amaliyot

1. `useWindowSize` ni yozing va ikkita komponentda ishlating. Ular mustaqil `ref` olishini tasdiqlang.
2. `useFetch` ni yozing; URL sifatida getter uzatib, `route.params.id` o'zgarganda qayta yuklanishini tekshiring.
3. `useLocalStorage` ni o'zingiz yozing (`watch` + `JSON.stringify`), keyin VueUse versiyasi bilan solishtiring.
4. Mavjud komponentingizdan bitta mustaqil vazifani (masalan klaviatura yorlig'i) composable'ga ajrating. Komponent nechta qatorga qisqardi?

## Rasmiy hujjat

- Composables: <https://vuejs.org/guide/reusability/composables.html>
- `toValue`: <https://vuejs.org/api/reactivity-utilities.html#tovalue>
- VueUse: <https://vueuse.org>
