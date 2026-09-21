# 16 — Kuzatuvchilar: `watch` va `watchEffect`

[← Oldingi: Forma bog'lash](15-forma-bogash.md) · [Mundarija](README.md) · [Keyingi: Reaktivlik: chuqur qatlam →](17-reaktivlik-chuqur.md)

## Tushuncha

`computed` qiymat hisoblaydi. `watch` esa **ish bajaradi**: so'rov yuboradi, `localStorage` ga yozadi, marshrutni o'zgartiradi, tashqi kutubxonaga xabar beradi.

::: options
```js
export default {
  data() {
    return { query: '', results: [] }
  },
  watch: {
    // kalit — kuzatiladigan xossa nomi
    query(newValue, oldValue) {
      this.search(newValue)
    },

    // obyekt shakli: sozlamalar bilan
    userId: {
      immediate: true,        // darhol bir marta ishlasin
      handler(id) {
        this.fetchUser(id)
      },
    },

    // ichki xossani kuzatish
    'form.email'(value) {
      this.checkEmail(value)
    },

    // chuqur kuzatuv
    form: {
      deep: true,
      handler(value) {
        localStorage.setItem('draft', JSON.stringify(value))
      },
    },
  },
}
```
:::

::: composition
```js
import { ref, watch, watchEffect } from 'vue'

const query = ref('')
const userId = ref(1)

// 1. Bitta manbani kuzatish
watch(query, (newValue, oldValue) => {
  search(newValue)
})

// 2. Getter orqali (props yoki ichki xossa uchun)
watch(() => props.userId, (id) => fetchUser(id), { immediate: true })

// 3. Bir nechta manba
watch([query, page], ([newQuery, newPage]) => {
  search(newQuery, newPage)
})

// 4. watchEffect — bog'liqlik avtomatik aniqlanadi
watchEffect(() => {
  console.log(`So'rov: ${query.value}, sahifa: ${page.value}`)
})
```
:::

## Nega shunday: `watch` va `watchEffect` farqi

| | `watch` | `watchEffect` |
| --- | --- | --- |
| Bog'liqlik | Aniq ko'rsatiladi | Funksiya ichida o'qilganidan aniqlanadi |
| Birinchi ishga tushish | Yo'q (`immediate: true` bo'lmasa) | Darhol |
| Eski qiymat | Bor | Yo'q |
| Qachon qulay | Aniq manbaga reaksiya, eski qiymat kerak | Bir nechta qiymatdan "hosila effekt" |

Amaliy tavsiya: **standart holatda `watch`.** Sababi — `watchEffect` bog'liqliklarni yashiradi va `async` kod bilan tuzoq yaratadi:

```js
watchEffect(async () => {
  // `userId` track bo'ladi (await dan oldin o'qildi)
  const user = await fetchUser(userId.value)

  // ✗ `locale` track BO'LMAYDI: await dan keyin o'qilgan
  format(user, locale.value)
})
```

Bog'liqlik faqat birinchi `await` gacha yig'iladi. `watch` da bunday tuzoq yo'q, chunki manba aniq yozilgan.

## Kod: `deep`, `immediate`, `once`

```js
const form = reactive({ name: '', address: { city: '' } })

// Ichki o'zgarishlarni ham ko'rish
watch(form, (value) => save(value), { deep: true })

// Darhol bir marta ishga tushirish
watch(userId, fetchUser, { immediate: true })

// Faqat bir marta (Vue 3.4+)
watch(isReady, init, { once: true })

// Chuqurlik darajasi (Vue 3.5+): butun daraxt o'rniga faqat 2 daraja
watch(state, handler, { deep: 2 })
```

`deep` — qimmat: har o'zgarishda butun obyekt aylanib chiqiladi. Katta obyektlarda aniq maydonni kuzating:

```js
// ✗ butun store
watch(state, save, { deep: true })

// ✓ faqat kerakli qism
watch(() => state.form.email, save)
```

`reactive` obyektni to'g'ridan-to'g'ri kuzatsangiz, `deep` **avtomatik yoqiladi** — bu ko'pincha kutilmagan sekinlik manbai.

## Kod: `flush` — qachon ishlaydi

```js
// Standart: DOM yangilanishidan OLDIN
watch(source, handler)                              // flush: 'pre'

// DOM yangilangandan KEYIN (o'lchov, scroll uchun)
watch(source, handler, { flush: 'post' })

// Sinxron, navbatsiz (kamdan-kam; cheksiz sikl xavfi)
watch(source, handler, { flush: 'sync' })
```

`post` kerak bo'ladigan tipik holat:

```js
watch(messages, async () => {
  container.value.scrollTop = container.value.scrollHeight
}, { flush: 'post' })
```

`pre` bo'lsa, yangi xabar hali DOM'da yo'q va scroll noto'g'ri joyga tushadi. Muqobil yo'l — `await nextTick()`.

## Kod: kuzatuvni to'xtatish va tozalash

```js
const stop = watch(query, search)

stop()      // qo'lda to'xtatish
```

Komponent ichida yaratilgan `watch` komponent o'chganda **avtomatik** to'xtaydi. Lekin `setTimeout`/`async` ichida yaratilgani — yo'q:

```js
// ✗ Komponent o'chsa ham yashab qoladi
setTimeout(() => {
  watch(query, search)
}, 1000)
```

Eskirgan so'rovni bekor qilish uchun `onCleanup` (uchinchi argument):

```js
watch(query, async (value, oldValue, onCleanup) => {
  const controller = new AbortController()
  onCleanup(() => controller.abort())

  const response = await fetch(`/api/search?q=${value}`, { signal: controller.signal })
  results.value = await response.json()
})
```

Bu naqsh **poyga holatini** (race condition) yo'q qiladi: foydalanuvchi tez yozganda eski so'rov bekor qilinadi va sekin kelgan eski javob yangi natijani bosib ketmaydi. Vue 3.5+ da `onWatcherCleanup()` global funksiyasi ham bor:

```js
import { onWatcherCleanup, watch } from 'vue'

watch(query, async (value) => {
  const controller = new AbortController()
  onWatcherCleanup(() => controller.abort())
  // ...
})
```

## Kod: debounce bilan qidiruv

```js
import { ref, watch } from 'vue'

const query = ref('')
const results = ref([])
let timer

watch(query, (value) => {
  clearTimeout(timer)

  if (!value.trim()) {
    results.value = []
    return
  }

  timer = setTimeout(async () => {
    results.value = await searchApi(value)
  }, 300)
})
```

Amalda buni composable qilib olasiz (`useDebouncedRef`, 29-bob) yoki VueUse'dagi `watchDebounced` ishlatasiz.

## Muhandislik nuqtai nazari: `watch` — oxirgi chora

Boshlovchilar `watch` ni haddan tashqari ko'p ishlatadi. Har safar yozishdan oldin uchta savolni bering:

1. **Bu qiymat hosilami?** → `computed` (10-bob).
2. **Bu foydalanuvchi harakatiga javobmi?** → hodisa ishlov beruvchisi (`@click`, `@submit`). Ma'lumotni `watch` bilan "o'g'irlash" o'rniga to'g'ridan-to'g'ri o'sha joyda yozing.
3. **Bu ikki holatni sinxron ushlash urinishimi?** → ikkitasining biri ortiqcha; bittasini `computed` qiling.

Qolgani — haqiqiy `watch` ishi: URL o'zgarganda ma'lumot yuklash, holatni `localStorage` ga saqlash, tashqi kutubxonaga (xarita, grafik) yangi ma'lumot berish, analitika yuborish.

Anti-naqsh ko'rinishi:

```js
// ✗ Ikki holatni qo'lda sinxron ushlash
watch(items, () => {
  itemCount.value = items.value.length
})

// ✓
const itemCount = computed(() => items.value.length)
```

## Muhandislik nuqtai nazari: `watch` va cheksiz sikl

```js
// ✗ O'zi kuzatayotgan narsani o'zgartiradi
watch(total, () => {
  total.value = total.value + 1
})
```

Vue buni aniqlab ogohlantiradi ("Maximum recursive updates exceeded"), lekin murakkabroq shakllarda (A → B → A) o'zi topa olmaydi. Qoida: **`watch` ichida o'z manbasini yozmang.** Agar zarur bo'lsa, shart qo'ying (`if (next !== current)`).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `watch(props.userId, ...)` | `props.userId` — oddiy qiymat, reaktiv manba emas | `watch(() => props.userId, ...)` |
| Hosila qiymat uchun `watch` | Ortiqcha kod, sinxronlik xatolari | `computed` |
| `deep: true` ni odat qilish | Har o'zgarishda butun obyekt aylanadi | Aniq maydonni kuzating |
| `async watch` da eski so'rovni bekor qilmaslik | Poyga holati: eski javob yangisini bosadi | `onCleanup` + `AbortController` |
| DOM'ni `flush: 'pre'` da o'lchash | Hali yangilanmagan | `flush: 'post'` yoki `nextTick` |
| `watchEffect` ichida `await` dan keyin reaktiv qiymat o'qish | Bog'liqlik yig'ilmaydi | `watch` bilan aniq manba |
| Komponentdan tashqarida `watch` yaratib, to'xtatmaslik | Xotira oqishi | `stop()` yoki `effectScope` (17-bob) |

## Amaliyot

1. Qidiruv maydonini yasang: `watch` + debounce + `AbortController` bilan bekor qilish. Tarmoqni sekinlashtirib, eski javob kelmasligini tekshiring.
2. Formani `localStorage` ga saqlang (`deep` bilan), sahifani yangilaganda tiklang.
3. Chat oynasi yasang: yangi xabar qo'shilganda pastga scroll qilsin (`flush: 'post'`).
4. Ataylab cheksiz sikl yozing va Vue bergan ogohlantirishni o'qing, keyin tuzating.

## Rasmiy hujjat

- Watchers: <https://vuejs.org/guide/essentials/watchers.html>
- `watch` API: <https://vuejs.org/api/reactivity-core.html#watch>
- `onWatcherCleanup`: <https://vuejs.org/api/reactivity-core.html#onwatchercleanup>
