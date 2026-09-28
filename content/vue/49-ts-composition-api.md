# 49 — TypeScript + Composition API

[← Oldingi: TypeScript'ni sozlash](48-typescript-sozlash.md) · [Mundarija](README.md) · [Keyingi: TS + Options API →](50-ts-options-api.md)

## Tushuncha

Composition API TypeScript uchun ataylab qulay qilingan: `this` yo'q, qiymatlar oddiy `const`, shuning uchun inference tabiiy ishlaydi. Bu bobda props, emits, ref, composable, provide/inject va slot'larni tiplash.

## Kod: props

```vue
<script setup lang="ts">
interface Props {
  title: string
  count?: number
  user: { id: number; name: string }
  variant?: 'primary' | 'ghost' | 'danger'
  onSelect?: (id: number) => void
}

const props = defineProps<Props>()
</script>
```

Standart qiymatlar — destrukturizatsiya bilan (Vue 3.5+ da reaktiv qoladi, 17-bob):

```ts
const { title, count = 0, variant = 'primary' } = defineProps<Props>()
```

Eski usul (`withDefaults`) hamon ishlaydi:

```ts
const props = withDefaults(defineProps<Props>(), {
  count: 0,
  variant: 'primary',
  tags: () => [],            // massiv/obyekt — funksiya
})
```

Tashqi fayldan import qilingan tip ham ishlaydi (Vue 3.3+):

```ts
import type { User } from '@/types'

defineProps<{ user: User; readonly?: boolean }>()
```

## Kod: emits

```ts
// Qisqa shakl (Vue 3.3+) — tavsiya etiladi
const emit = defineEmits<{
  select: [id: number]
  update: [value: string, oldValue: string]
  close: []
}>()

emit('select', 12)
emit('update', 'yangi', 'eski')
emit('close')
```

Eski (chaqiruv imzosi) shakli:

```ts
const emit = defineEmits<{
  (event: 'select', id: number): void
  (event: 'close'): void
}>()
```

Noto'g'ri nom yoki argument yozsangiz — kompilyatsiya xatosi. Bu komponent shartnomasini (19-bob) haqiqiy shartnomaga aylantiradi.

## Kod: `ref` va `computed`

```ts
import { computed, ref, shallowRef, type Ref } from 'vue'

const count = ref(0)                          // Ref<number>
const user = ref<User | null>(null)           // aniq ko'rsatish
const items = ref<User[]>([])

const names = computed(() => items.value.map((u) => u.name))    // ComputedRef<string[]>

// Yozuvchi computed
const fullName = computed<string>({
  get: () => `${first.value} ${last.value}`,
  set: (value) => { /* ... */ },
})

// Funksiya argumenti sifatida
function useSelection(list: Ref<User[]>) { /* ... */ }
```

`ref<User | null>(null)` naqshini eslab qoling: boshlang'ich qiymat `null` bo'lsa, TS `Ref<null>` deb chiqarib qo'yadi va keyin obyekt yozib bo'lmaydi.

## Kod: `defineModel` va slotlar

```ts
const model = defineModel<string>()                       // string | undefined
const count = defineModel<number>({ required: true })     // number
const open = defineModel<boolean>('open', { default: false })
```

```ts
defineSlots<{
  default(props: { user: User; index: number }): any
  footer?(props: { total: number }): any
}>()
```

Endi ishlatuvchi `<template #default="{ user }">` yozganda `user` tipi ma'lum bo'ladi.

## Kod: composable'larni tiplash

```ts
// composables/useFetch.ts
import { ref, shallowRef, toValue, watchEffect, type MaybeRefOrGetter, type Ref } from 'vue'

export interface UseFetchReturn<T> {
  data: Ref<T | null>
  error: Ref<Error | null>
  loading: Ref<boolean>
  refresh: () => Promise<void>
}

export function useFetch<T>(url: MaybeRefOrGetter<string>): UseFetchReturn<T> {
  const data = shallowRef<T | null>(null)
  const error = shallowRef<Error | null>(null)
  const loading = ref(false)

  async function refresh() {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(toValue(url))
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      data.value = (await response.json()) as T
    } catch (cause) {
      error.value = cause as Error
    } finally {
      loading.value = false
    }
  }

  watchEffect(refresh)

  return { data, error, loading, refresh }
}
```

```ts
const { data: user } = useFetch<User>(() => `/api/users/${route.params.id}`)
// user: Ref<User | null>
```

`MaybeRefOrGetter<T>` — `T | Ref<T> | (() => T)` (29-bobdagi moslashuvchan argument naqshi uchun standart tip).

## Kod: `provide` / `inject`

```ts
// keys.ts
import type { InjectionKey, Ref } from 'vue'

export interface ThemeContext {
  theme: Readonly<Ref<'light' | 'dark'>>
  setTheme: (value: 'light' | 'dark') => void
}

export const ThemeKey: InjectionKey<ThemeContext> = Symbol('theme')
```

```ts
// Provider
provide(ThemeKey, { theme: readonly(theme), setTheme })

// Consumer — tip avtomatik chiqadi
const context = inject(ThemeKey)          // ThemeContext | undefined

// Majburiy bo'lsa
function useTheme(): ThemeContext {
  const context = inject(ThemeKey)
  if (!context) throw new Error('useTheme: ThemeProvider topilmadi')

  return context
}
```

`InjectionKey<T>` — `Symbol` ustiga tip biriktiradi; shu sababli `inject` da qo'lda tip yozish shart emas (27-bob).

## Kod: shablon ref va komponent nusxasi

```ts
import { useTemplateRef } from 'vue'
import type VideoPlayer from './VideoPlayer.vue'

const input = useTemplateRef<HTMLInputElement>('input')
const player = useTemplateRef<InstanceType<typeof VideoPlayer>>('player')

onMounted(() => {
  input.value?.focus()
  player.value?.play()          // defineExpose bilan ochilgan metodlar ko'rinadi
})
```

`InstanceType<typeof Component>` — komponent nusxasining tipini olish uchun standart naqsh (18-bob).

## Kod: generik komponent

```vue
<!-- UiSelect.vue -->
<script setup lang="ts" generic="T extends { id: number }">
defineProps<{
  items: T[]
  labelKey: keyof T
}>()

const model = defineModel<T | null>()

defineEmits<{ select: [item: T] }>()
</script>

<template>
    <select v-model="model">
        <option v-for="item in items" :key="item.id" :value="item">
            {{ item[labelKey] }}
        </option>
    </select>
</template>
```

```vue
<UiSelect v-model="selectedUser" :items="users" label-key="name" />
<!-- selectedUser tipi User | null deb chiqariladi -->
```

`generic` atributi (Vue 3.3+) — bir komponentni har xil ma'lumot turi bilan tip xavfsizligini saqlab ishlatish imkonini beradi. Jadval, select, ro'yxat komponentlarida juda foydali.

## Muhandislik nuqtai nazari: tipni qayerda yozish, qayerda chiqarish

| Joy | Tavsiya |
| --- | --- |
| Funksiya qaytaruvchi qiymati (public API) | Aniq yozing — o'zgarishlarni ushlaydi |
| Lokal o'zgaruvchi | Chiqarilsin (`const n = ref(0)`) |
| Bo'sh boshlang'ich qiymat (`null`, `[]`, `{}`) | Aniq yozing (`ref<User[]>([])`) |
| Props/emits | Aniq (interfeys bilan) |
| Composable qaytarishi | Aniq interfeys — ishlatuvchi hujjat sifatida o'qiydi |

Umumiy qoida: **chegarada aniq, ichkarida chiqarilsin.** Bu ham o'qishni yengillashtiradi, ham refaktoringda xatolarni chegarada ushlaydi.

## Muhandislik nuqtai nazari: tip xavfsizligi qayerda tugaydi

TypeScript **kompilyatsiya vaqtida** ishlaydi. Runtime'da hech narsa tekshirilmaydi:

```ts
const user = await api.get<User>('/users/1')     // TS "User" deb ishonadi
console.log(user.name.toUpperCase())             // server `name: null` qaytarsa — xato
```

Chegaralar (server javobi, `localStorage`, URL query, `postMessage`) — **runtime tekshiruv** joyi:

```ts
import { userSchema } from '@/schemas/user'

const raw = await api.get('/users/1')
const user = userSchema.parse(raw)               // endi haqiqatan User
```

Bu — 45 va 48-boblarda ko'rilgan naqsh: tip sxemadan chiqadi, tekshiruv ham o'sha sxemadan.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `ref(null)` keyin obyekt yozish | Tip `Ref<null>` bo'lib qoladi | `ref<User | null>(null)` |
| Server javobiga `as User` | Runtime'da tekshirilmaydi | zod `parse` |
| Props uchun runtime deklaratsiya + TS interfeys ikkalasi | Takror, mos kelmay qolishi mumkin | Faqat `defineProps<Props>()` |
| `any` bilan xatoni "tuzatish" | Tekshiruv o'chadi | `unknown` + tekshiruv yoki generik |
| Komponent nusxasi tipini qo'lda yozish | Sinxrondan chiqadi | `InstanceType<typeof Comp>` |
| Har xil ma'lumot turi uchun alohida komponent nusxasi | Takror kod | `generic="T"` |

## Amaliyot

1. `UserCard` komponentini to'liq tiplang: `defineProps<Props>`, `defineEmits<{...}>`, `defineSlots`.
2. `useFetch<T>` composable'ini yozing va uni `User` hamda `Product` bilan ishlatib ko'ring.
3. `ThemeKey: InjectionKey<ThemeContext>` bilan provide/inject ni tiplang va provider'siz ishlatib, xatoni ko'ring.
4. `UiSelect` generik komponentini yozing va ikki xil ma'lumot turi bilan ishlating.
5. API javobiga `as User` yozing, serverdan boshqa shakl qaytaring va runtime xatosini kuzating; keyin zod bilan tuzating.

## Rasmiy hujjat

- TS + Composition API: <https://vuejs.org/guide/typescript/composition-api.html>
- Generik komponentlar: <https://vuejs.org/api/sfc-script-setup.html#generics>
- `InjectionKey`: <https://vuejs.org/guide/typescript/composition-api.html#typing-provide-inject>
