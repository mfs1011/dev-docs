# 05 — Ikki API uslubi: Options va Composition

[← Oldingi: Vue'dan foydalanish usullari](04-foydalanish-usullari.md) · [Mundarija](README.md) · [Keyingi: Loyiha tuzilmasi va Vite →](06-loyiha-tuzilmasi-va-vite.md)

## Tushuncha

Vue'da bir xil komponentni ikki xil yozish mumkin:

- **Options API** — komponent obyekt bo'lib, uning `data`, `computed`, `methods`, `watch` kabi **bo'limlari** bor. Holatga `this` orqali murojaat qilinadi.
- **Composition API** — komponent mantiqi funksiya ichida yoziladi; holat `ref()`/`reactive()` bilan e'lon qilinadi, `this` yo'q. `.vue` faylda odatda `<script setup>` bilan yoziladi.

Ikkalasi bir xil dvigatel ustida ishlaydi. Options API'ni Vue ichkarida Composition API'ga aylantiradi — ya'ni "ikki framework" emas, ikkita interfeys.

Sahifaning yuqorisidagi almashtirgich orqali bu qo'llanmadagi barcha misollarni istalgan uslubda ko'rishingiz mumkin.

## Kod: bir xil komponent, ikki uslub

::: options
```vue
<script>
export default {
  props: {
    userId: { type: Number, required: true },
  },
  data() {
    return {
      user: null,
      loading: false,
      error: null,
    }
  },
  computed: {
    displayName() {
      return this.user ? `${this.user.firstName} ${this.user.lastName}` : 'Yuklanmoqda…'
    },
  },
  watch: {
    userId: {
      immediate: true,
      handler(id) {
        this.fetchUser(id)
      },
    },
  },
  methods: {
    async fetchUser(id) {
      this.loading = true
      this.error = null

      try {
        const response = await fetch(`/api/users/${id}`)
        if (!response.ok) throw new Error('Foydalanuvchi topilmadi')

        this.user = await response.json()
      } catch (cause) {
        this.error = cause.message
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<template>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-else>{{ displayName }}</p>
</template>
```
:::

::: composition
```vue
<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  userId: { type: Number, required: true },
})

const user = ref(null)
const loading = ref(false)
const error = ref(null)

const displayName = computed(() =>
  user.value ? `${user.value.firstName} ${user.value.lastName}` : 'Yuklanmoqda…',
)

async function fetchUser(id) {
  loading.value = true
  error.value = null

  try {
    const response = await fetch(`/api/users/${id}`)
    if (!response.ok) throw new Error('Foydalanuvchi topilmadi')

    user.value = await response.json()
  } catch (cause) {
    error.value = cause.message
  } finally {
    loading.value = false
  }
}

watch(() => props.userId, fetchUser, { immediate: true })
</script>

<template>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-else>{{ displayName }}</p>
</template>
```
:::

Qatorlar soni deyarli teng. Farq bitta komponentda ko'rinmaydi — u **mantiq qayta ishlatilganda** ko'rinadi.

## Nega shunday: mantiqni qayta ishlatish masalasi

Tasavvur qiling, komponentda uch mustaqil vazifa bor: foydalanuvchini yuklash, oynaning o'lchamini kuzatish, klaviatura yorlig'ini tinglash.

**Options API'da** har bir vazifaning bo'laklari bo'limlar bo'ylab **sochilib** ketadi:

```js
export default {
  data() {
    return {
      user: null,        // 1-vazifa
      width: 0,          // 2-vazifa
      isPaletteOpen: false, // 3-vazifa
    }
  },
  mounted() {
    this.fetchUser()                                   // 1-vazifa
    window.addEventListener('resize', this.onResize)   // 2-vazifa
    window.addEventListener('keydown', this.onKey)     // 3-vazifa
  },
  unmounted() {
    window.removeEventListener('resize', this.onResize) // 2
    window.removeEventListener('keydown', this.onKey)   // 3
  },
  methods: {
    fetchUser() { /* 1 */ },
    onResize() { /* 2 */ },
    onKey() { /* 3 */ },
  },
}
```

200 qatorli komponentda bitta vazifani tushunish uchun faylning 4 joyiga sakrashga to'g'ri keladi. Buni Vue jamoasi "fragmentation" deb ataydi.

**Composition API'da** bir vazifaning kodi yonma-yon turadi va butunligicha alohida faylga ko'chirilishi mumkin — bu **composable** (29-bob):

```js
// composables/useWindowWidth.js
import { onUnmounted, ref } from 'vue'

export function useWindowWidth() {
  const width = ref(window.innerWidth)
  const onResize = () => { width.value = window.innerWidth }

  window.addEventListener('resize', onResize)
  onUnmounted(() => window.removeEventListener('resize', onResize))

  return { width }
}
```

```js
// komponentda
const { width } = useWindowWidth()
```

Options API'da xuddi shuni qilish uchun **mixin** ishlatilardi va mixin ikkita hal qilinmaydigan muammo tug'dirardi: nom to'qnashuvi (ikki mixin ham `loading` e'lon qilsa?) va manba noaniqligi (`this.loading` qaysi mixindan keldi?). Composition API'da javob ochiq-oydin — o'zingiz yozgan `const { loading } = useUser()` qatoridan ko'rinib turadi.

## Nega shunday: `<script setup>`

`<script setup>` — Composition API uchun kompilyatsiya vaqtidagi shakar:

```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>
```

kompilyatordan keyin taxminan quyidagiga aylanadi:

```js
export default {
  setup() {
    const count = ref(0)

    return { count }   // shablonga avtomatik ochildi
  },
}
```

Foydasi: `return` yozilmaydi, importlar komponent sifatida avtomatik ishlaydi, `defineProps`/`defineEmits`/`defineModel` makroslari orqali tiplar to'g'ri chiqadi, runtime proxy kamayadi (tezroq). Zamonaviy Vue kodi amalda **har doim** `<script setup>` bilan yoziladi.

## Muhandislik nuqtai nazari: `this` ning narxi

Options API `this` ga tayanadi. `this` esa JavaScript'da kontekstga bog'liq va u uch joyda muammo tug'diradi:

1. **Strelka funksiyasi** — `data: () => ({...})` ichida `this` komponent emas; `methods` ichida strelka yozsangiz ham shunday.
2. **Destrukturizatsiya** — `const { count } = this` reaktivlikni uzadi.
3. **TypeScript** — `this` tipini chiqarish uchun `defineComponent` o'ramasi kerak (50-bob), baribir generic komponentlar bilan chegara bor.

Composition API'da `this` umuman yo'q: qiymatlar oddiy `const`, funksiyalar oddiy funksiya. Shuning uchun TypeScript inference tabiiy ishlaydi va kod IDE'da "ta'riflashga o'tish" bilan to'liq kuzatiladi.

Buning evaziga `.value` paydo bo'ladi — Composition API'ning eng ko'p tanqid qilinadigan joyi (07 va 09-boblarda nega boshqacha bo'lishi mumkin emasligini ko'rasiz).

## Muhandislik nuqtai nazari: qaysi birini tanlash

| Holat | Tavsiya |
| --- | --- |
| Yangi loyiha, build bilan | Composition API + `<script setup>` |
| Mavjud Vue 2 → 3 migratsiyasi | Options API'da qoldiring, yangi kodni Composition'da yozing (ikkalasi bir loyihada yashaydi) |
| Build qadamisiz, CDN orqali kichik vidjet | Options API soddaroq (`.value` yo'q, `this` bilan qulay) |
| TypeScript kuchli ishlatiladigan jamoa | Composition API — inference sezilarli yaxshi |
| Mantiq kutubxonaga chiqariladi (VueUse uslubida) | Composition API — boshqa yo'l yo'q |

Aralashtirish ham mumkin: `<script setup>` va oddiy `<script>` bir faylda birga tura oladi (masalan, `export default { inheritAttrs: false }` uchun).

```vue
<script>
export default { inheritAttrs: false }
</script>

<script setup>
const props = defineProps(['title'])
</script>
```

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Bitta komponentda `data()` va `ref()` ni aralashtirib, ikkalasidan `this` orqali foydalanish | Chalkash: `setup()` dagi qiymat `this` da bor, teskarisi yo'q | Bitta komponent — bitta uslub |
| Options API'da mixin bilan mantiq ulashish | Nom to'qnashuvi, manba noaniq | Composition API + composable (29-bob) |
| `setup()` ichida `this` ishlatish | `setup` komponent nusxasidan oldin ishlaydi, `this` — `undefined` | `props` argumenti va `getCurrentInstance()` (kamdan-kam) |
| "Composition API — faqat katta loyiha uchun" deb o'ylash | Kichik komponentda ham `<script setup>` kamroq kod | Standart tanlov sifatida qabul qiling |
| Options API'ni "eskirgan" deb hisoblash | U eskirmagan, olib tashlanmaydi, Vue o'zi ham unda yozilgan kodni qo'llab-quvvatlaydi | Mavjud kodni majburan ko'chirmang |

## Amaliyot

1. Yuqoridagi foydalanuvchi komponentini almashtirgich orqali ikki uslubda o'qing va qaysi qator qayerga mos kelishini daftarga chizing.
2. Komponentga ikkinchi vazifa qo'shing: `Escape` bosilganda xatoni tozalash. Options API'da nechta bo'limga tegish kerak bo'ldi, Composition'da nechta joyga?
3. `useWindowWidth` composable'ini yozing va uni ikki xil komponentda ishlating.
4. `<script setup>` ichida `this` ni `console.log` qiling. Natijani tushuntiring.

## Rasmiy hujjat

- API uslublari: <https://vuejs.org/guide/introduction.html#api-styles>
- Composition API FAQ: <https://vuejs.org/guide/extras/composition-api-faq.html>
- `<script setup>`: <https://vuejs.org/api/sfc-script-setup.html>
