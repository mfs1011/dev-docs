# 17 — Reaktivlik: chuqur qatlam

[← Oldingi: Kuzatuvchilar](16-watch-va-watcheffect.md) · [Mundarija](README.md) · [Keyingi: Shablon ref'lari →](18-shablon-reflari.md)

## Tushuncha

07-bobda mexanizmni ko'rdik, 09-bobda `ref`/`reactive` ni. Bu bobda kundalik ishda chiqadigan nozik holatlar: destrukturizatsiya, `shallow` variantlar, `readonly`, `effectScope`, `toRaw` va reaktivlikni qo'lda boshqarish.

## Kod: `toRef` va `toRefs`

Muammo: reaktiv obyektni destrukturizatsiya qilsangiz, bog'lanish uziladi.

```js
const state = reactive({ count: 0, name: 'Aziz' })

const { count } = state        // oddiy son — o'lik nusxa
```

`toRefs` har bir xossani `ref` ga aylantiradi va bog'lanishni saqlaydi:

```js
import { toRef, toRefs } from 'vue'

const { count, name } = toRefs(state)

count.value++                  // state.count ham oshadi
console.log(state.count)       // 1
```

Bitta xossa uchun `toRef`:

```js
const count = toRef(state, 'count')

// Vue 3.3+: getter'dan ham ref yasash mumkin (faqat o'qish)
const userName = toRef(() => props.user.name)
```

Eng ko'p ishlatiladigan joyi — composable'dan `reactive` holatni qaytarish:

```js
function useCounter() {
  const state = reactive({ count: 0 })

  // ✗ Foydalanuvchi destrukturizatsiya qilsa bog'lanish uziladi
  // return state

  // ✓
  return { ...toRefs(state), increment: () => state.count++ }
}
```

## Kod: `props` va reaktivlik

`props` — reaktiv obyekt, lekin uni destrukturizatsiya qilish bog'lanishni uzadi:

```js
// ✗
const { userId } = defineProps(['userId'])
watch(() => userId, ...)        // hech qachon ishlamaydi

// ✓ getter orqali
const props = defineProps(['userId'])
watch(() => props.userId, ...)

// ✓ toRef bilan
const userId = toRef(props, 'userId')
```

**Vue 3.5+ da muhim o'zgarish:** `<script setup>` ichida `defineProps` destrukturizatsiyasi kompilyator tomonidan qo'llab-quvvatlanadi va reaktiv qoladi:

```js
// Vue 3.5+ — ishlaydi, kompilyator `props.userId` ga aylantiradi
const { userId, size = 'md' } = defineProps(['userId', 'size'])

watch(() => userId, (id) => fetchUser(id))       // ✓
```

Diqqat: bu faqat `defineProps` natijasiga taalluqli va faqat `<script setup>` ichida. Oddiy `reactive` obyektga bu qoida tarqalmaydi.

## Kod: `shallowRef` va `shallowReactive`

Chuqur reaktivlik — har bir ichki obyektni Proxy bilan o'rash demakdir. Katta ma'lumot uchun bu qimmat.

```js
import { shallowRef, triggerRef } from 'vue'

// Faqat `.value` almashtirilganda reaksiya bo'ladi
const chartData = shallowRef({ series: [/* 50 000 nuqta */] })

chartData.value.series.push(point)     // ✗ hech kim bilmaydi
triggerRef(chartData)                  // qo'lda xabar berish

chartData.value = { ...chartData.value }  // ✓ odatiy yo'l
```

Qachon kerak:

| Holat | Sabab |
| --- | --- |
| Katta massiv/obyekt (grafik ma'lumoti, jadval 10k qator) | Proxy yaratish narxi tejaladi |
| Tashqi kutubxona nusxasi (xarita, video pleer, editor) | Uni Proxy bilan o'rash kutubxonani buzishi mumkin |
| O'zgarmas (immutable) ma'lumot oqimi | Har safar butun obyekt almashtiriladi |

Tashqi kutubxona nusxasi uchun `markRaw` ham bor:

```js
import { markRaw, ref } from 'vue'

const map = ref(null)

onMounted(() => {
  map.value = markRaw(new maplibregl.Map({ /* ... */ }))
})
```

`markRaw` obyektni "hech qachon reaktiv qilinmasin" deb belgilaydi — Vue uni Proxy bilan o'ramaydi.

## Kod: `readonly` va `shallowReadonly`

```js
import { readonly, ref } from 'vue'

const state = ref({ count: 0 })
const publicState = readonly(state)

publicState.value.count++      // ogohlantirish: Set operation failed
```

Ishlatiladigan joy — `provide` orqali pastga ma'lumot berish (27-bob): bolalar o'qisin, lekin o'zgartira olmasin:

```js
provide('user', readonly(user))
provide('updateUser', (patch) => Object.assign(user.value, patch))
```

Bu — "yagona yozish nuqtasi" naqshi: ma'lumot pastga oqadi, o'zgarishlar yuqoriga funksiya orqali qaytadi.

## Kod: `effectScope`

Komponent ichidagi `watch` va `computed` komponent o'chganda avtomatik to'xtaydi. Komponentdan tashqarida (masalan, store yoki global composable) bunday avtomatik tozalash yo'q:

```js
import { effectScope, ref, watch } from 'vue'

const scope = effectScope()

scope.run(() => {
  const count = ref(0)

  watch(count, () => console.log(count.value))
  watchEffect(() => document.title = `Soni: ${count.value}`)
})

// Hamma effektni birdan to'xtatish
scope.stop()
```

Bu — Pinia ichkarida ishlatadigan mexanizm: store o'z scope'iga ega va `$dispose()` chaqirilganda hamma kuzatuvchi bir vaqtda to'xtaydi.

## Kod: `toRaw` va identiklik masalasi

```js
import { reactive, toRaw, isReactive } from 'vue'

const original = { id: 1 }
const proxy = reactive(original)

console.log(proxy === original)       // false
console.log(toRaw(proxy) === original) // true
console.log(isReactive(proxy))         // true
```

Identiklik qachon muhim bo'ladi:

```js
const selected = ref(null)
const items = reactive([{ id: 1 }, { id: 2 }])

selected.value = items[0]              // proxy saqlandi

// Boshqa joyda xom obyekt bilan solishtirish
if (selected.value === rawItems[0]) {} // ✗ false — bu boshqa obyekt
```

Shuning uchun tanlovni obyekt bilan emas, **ID bilan** saqlash amalda ishonchliroq (13, 15-boblarda ham shu tavsiya chiqqan edi).

`toRaw` yana bitta joyda kerak: tashqi API'ga (masalan `structuredClone`, IndexedDB, `postMessage`) Proxy'ni uzatib bo'lmaydi:

```js
await db.put('drafts', toRaw(form))
```

## Kod: `customRef` — o'z reaktivligingiz

```js
import { customRef } from 'vue'

export function useDebouncedRef(value, delay = 300) {
  let timer

  return customRef((track, trigger) => ({
    get() {
      track()
      return value
    },
    set(next) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        value = next
        trigger()
      }, delay)
    },
  }))
}
```

```js
const query = useDebouncedRef('', 400)   // odatdagi ref kabi ishlatiladi
```

07-bobdagi `track`/`trigger` shu yerda ochiq ko'rinadi — `customRef` sizga o'sha ikki tugmani qo'lga beradi.

## Muhandislik nuqtai nazari: reaktivlik va xotira

Har bir reaktiv obyekt uchun Vue Proxy va bog'liqlik xaritasini (`Map`/`Set`) saqlaydi. Katta ro'yxatda bu sezilarli bo'ladi:

| Ma'lumot | Taxminiy yondashuv |
| --- | --- |
| < 1 000 oddiy obyekt | `ref`/`reactive` — muammo yo'q |
| 10 000+ qator jadval | `shallowRef` + virtualizatsiya (62-bob) |
| Tashqi kutubxona nusxasi | `markRaw` |
| Faqat o'qiladigan katta katalog | `shallowRef` yoki umuman reaktiv qilmaslik |

Reaktiv qilmaslik ham variant: konstantalar, tarjima lug'ati, statik ro'yxat modul darajasida oddiy `const` bo'lib qolaversin — ular o'zgarmaydi, demak kuzatishga hojat yo'q.

## Muhandislik nuqtai nazari: mutatsiya yoki almashtirish

Ikki uslub ham ishlaydi:

```js
items.value.push(item)                    // mutatsiya
items.value = [...items.value, item]      // almashtirish
```

Mutatsiya tezroq (yangi massiv yaratilmaydi), almashtirish esa **oldingi holatni saqlash** kerak bo'lganda qulay (undo/redo, vaqt bo'ylab sayohat, `watch` da eski qiymat). `watch` ning ikkinchi argumenti (`oldValue`) mutatsiyada foydasiz: bir xil obyektga havola keladi.

Amaliy tanlov: **ichki holatda mutatsiya, tashqariga chiqadigan ma'lumot oqimida almashtirish.**

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `reactive` obyektni destrukturizatsiya qilish | Bog'lanish uziladi | `toRefs` / `toRef` |
| Vue 3.4 va undan eski versiyada `defineProps` destrukturizatsiyasi | Reaktivlik yo'qoladi | `props.x` yoki `toRef(props, 'x')` |
| Tashqi kutubxona nusxasini `ref` ga solish | Proxy kutubxona ichki mantiqini buzadi | `markRaw` yoki `shallowRef` |
| `shallowRef` ichini o'zgartirib, `triggerRef` ni unutish | Ekran yangilanmaydi | `triggerRef` yoki butunlay almashtirish |
| Komponentdan tashqarida `watch` yaratib to'xtatmaslik | Xotira oqishi | `effectScope` yoki `stop()` |
| Proxy obyektni `structuredClone`/IndexedDB ga uzatish | "could not be cloned" xatosi | `toRaw(...)` yoki `JSON.parse(JSON.stringify(...))` |

## Amaliyot

1. `useCounter` composable yozing: ichida `reactive`, tashqariga `toRefs` bilan qaytaring. Destrukturizatsiya qilib ishlatib ko'ring.
2. 10 000 elementli massivni avval `ref`, keyin `shallowRef` bilan render qiling va Performance panelida farqni o'lchang.
3. `useDebouncedRef` ni yozing va qidiruv maydoniga ulang (16-bobdagi debounce bilan solishtiring).
4. `effectScope` yaratib, ichida 3 ta `watch` oching, keyin `scope.stop()` bilan hammasini to'xtating va konsolda tasdiqlang.
5. `markRaw` bilan tashqi kutubxona nusxasini saqlang (masalan `new Date()` o'rniga oddiy sinf yarating) va `isReactive` bilan tekshiring.

## Rasmiy hujjat

- Reaktivlik yordamchilari: <https://vuejs.org/api/reactivity-utilities.html>
- Ilg'or reaktivlik API: <https://vuejs.org/api/reactivity-advanced.html>
- Props destrukturizatsiyasi: <https://vuejs.org/guide/components/props.html#reactive-props-destructure>
