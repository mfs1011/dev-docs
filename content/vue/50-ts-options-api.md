# 50 — TypeScript + Options API

[← Oldingi: TS + Composition API](49-ts-composition-api.md) · [Mundarija](README.md) · [Keyingi: Testlash strategiyasi →](51-testlash-strategiyasi.md)

## Tushuncha

Options API'da `this` orqali ishlanadi, shuning uchun TypeScript komponent nusxasining tipini bilishi kerak. Buning uchun komponent `defineComponent()` bilan o'raladi.

Bu bob asosan **mavjud Options API kodini tiplash** uchun: yangi kod uchun Composition API (49-bob) afzal.

## Kod: `defineComponent`

```vue
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'UserCard',

  props: {
    userId: { type: Number, required: true },
    variant: { type: String, default: 'primary' },
  },

  data() {
    return {
      user: null as User | null,
      loading: false,
    }
  },

  computed: {
    displayName(): string {
      return this.user?.name ?? 'Noma\'lum'
    },
  },

  methods: {
    async load(): Promise<void> {
      this.loading = true

      try {
        this.user = await api.get<User>(`/users/${this.userId}`)
      } finally {
        this.loading = false
      }
    },
  },
})
</script>
```

`defineComponent` — runtime'da deyarli hech narsa qilmaydi (obyektni qaytaradi), lekin TypeScript uchun `this` ning tipini hosil qiladi: `this.userId` → `number`, `this.user` → `User | null`, `this.load()` → mavjud metod.

`defineComponent` siz `this` — `any` bo'ladi va tekshiruv yo'qoladi.

## Kod: props tiplash

```ts
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  props: {
    // Oddiy turlar — avtomatik
    title: String,                                   // string | undefined
    count: { type: Number, required: true },         // number

    // Murakkab turlar — PropType kerak
    user: {
      type: Object as PropType<User>,
      required: true,
    },
    tags: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    variant: {
      type: String as PropType<'primary' | 'ghost' | 'danger'>,
      default: 'primary',
    },
    formatter: {
      type: Function as PropType<(value: number) => string>,
      default: (value: number) => String(value),
    },
  },
})
```

`Object as PropType<User>` naqshi — Options API'da eng ko'p takrorlanadigan sintaksis. Composition API'da bu shunchaki `defineProps<{ user: User }>()` bo'lardi.

## Kod: emits

```ts
export default defineComponent({
  emits: {
    // Validator funksiyasi tiplarni ham beradi
    select: (id: number) => typeof id === 'number',
    update: (payload: { id: number; value: string }) => !!payload.id,
    close: null,
  },

  methods: {
    onClick() {
      this.$emit('select', 12)           // to'g'ri
      // this.$emit('select', 'x')       // tip xatosi
    },
  },
})
```

## Kod: `data` va murakkab qiymatlar

```ts
data() {
  return {
    // Bo'sh boshlang'ich qiymat — tipni ko'rsating
    user: null as User | null,
    items: [] as Product[],
    filters: {} as Record<string, string>,

    // Aniq qiymat bo'lsa — chiqariladi
    page: 1,
    query: '',
  }
}
```

`as` ishlatilishi bu yerda majbur: `null` va `[]` dan TypeScript foydali tip chiqara olmaydi.

## Kod: composable'larni Options API'da ishlatish

```ts
import { defineComponent } from 'vue'
import { useWindowSize } from '@/composables/useWindowSize'

export default defineComponent({
  setup() {
    // Composition API funksiyalari shu yerda ishlaydi
    const { width, height } = useWindowSize()

    return { width, height }        // `this.width` sifatida ochiladi
  },

  computed: {
    isMobile(): boolean {
      return this.width < 768       // tip to'g'ri chiqadi
    },
  },
})
```

Bu — migratsiya paytidagi eng foydali naqsh: butun komponentni qayta yozmasdan, yangi mantiqni composable sifatida qo'shasiz.

## Kod: global xossalarni tiplash

Agar `globalProperties` ishlatilsa (31-bobda tavsiya etilmagan, lekin eski kodda uchraydi):

```ts
// env.d.ts
import type { Api } from '@/api/client'

declare module 'vue' {
  interface ComponentCustomProperties {
    $api: Api
    $formatDate: (value: string) => string
  }
}

export {}
```

Shundan keyin `this.$api.get(...)` tip bilan ishlaydi. `export {}` majburiy — fayl modul bo'lishi kerak.

## Kod: `$refs` tiplash

```ts
export default defineComponent({
  methods: {
    focusInput() {
      // $refs — Record<string, unknown>, shuning uchun aniqlashtirish kerak
      const input = this.$refs.search as HTMLInputElement

      input?.focus()
    },
  },
})
```

Composition API'da bu `useTemplateRef<HTMLInputElement>('search')` bo'lardi va `as` kerak bo'lmasdi (18-bob).

## Muhandislik nuqtai nazari: Options API va TS chegaralari

TypeScript Options API bilan ishlaydi, lekin uchta joyda kuchsizroq:

1. **Generik komponentlar** — `generic="T"` faqat `<script setup>` da. Options API'da generik komponent yozish amalda mumkin emas.
2. **Mixin'lar** — `this` ga qo'shilgan xossalar tipini birlashtirish chalkash va tez-tez ishlamaydi (05-bobda mixin'dan qochish sabablaridan biri).
3. **`this` ning chuqurligi** — `data` + `computed` + `methods` + `props` + mixin'lar birlashib, IDE ba'zan sekinlashadi yoki noto'g'ri taklif beradi.

Shuning uchun **TypeScript kuchli ishlatiladigan jamoada Composition API amalda yagona mantiqiy tanlov** (05-bob).

## Muhandislik nuqtai nazari: bosqichma-bosqich ko'chirish

Mavjud Options API + JS loyihani ko'chirishning amaliy tartibi:

1. `lang="ts"` + `defineComponent` — hech narsa buzilmaydi, tiplar paydo bo'ladi;
2. `PropType` bilan props'ni tiplang — komponent shartnomasi aniqlashadi;
3. Yangi mantiqni `setup()` ichida composable sifatida yozing;
4. Komponent asosan `setup()` ga ko'chgach, `<script setup lang="ts">` ga o'tkazing;
5. Mixin'larni composable'larga ko'chiring (eng oxirida — ular eng ko'p bog'langan qism).

Bir vaqtda hammasini emas: har qadamda ilova ishlab turadi va testlar yashil qoladi (51-bob).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `defineComponent` siz `lang="ts"` | `this` — `any`, tekshiruv yo'q | `export default defineComponent({...})` |
| Murakkab prop uchun `type: Object` | Tip `Record<string, any>` bo'lib qoladi | `Object as PropType<User>` |
| `data()` da `user: null` | Tip `null` bo'lib qoladi | `null as User | null` |
| `computed` da qaytarish tipini yozmaslik | Ba'zi holatlarda `any` chiqadi | `displayName(): string` |
| Mixin'lar bilan tip birlashtirishga urinish | Ishonchsiz, chalkash | Composable'ga ko'chiring |
| `this.$refs.x` ni tipsiz ishlatish | `unknown` | `as HTMLInputElement` yoki `setup` + `useTemplateRef` |

## Amaliyot

1. Mavjud Options API komponentini `lang="ts"` + `defineComponent` ga o'tkazing va chiqqan xatolarni tuzating.
2. Uchta propni `PropType` bilan tiplang: obyekt, massiv, birlashma (`'a' | 'b'`).
3. `data()` dagi `null` boshlang'ich qiymatli maydonni to'g'ri tiplang.
4. Bitta composable'ni `setup()` orqali Options API komponentiga ulang va `computed` da ishlating.
5. Shu komponentni to'liq `<script setup lang="ts">` ga ko'chiring va qancha qator qisqarganini o'lchang.

## Rasmiy hujjat

- TS + Options API: <https://vuejs.org/guide/typescript/options-api.html>
- `defineComponent`: <https://vuejs.org/api/general.html#definecomponent>
- `PropType`: <https://vuejs.org/guide/typescript/options-api.html#typing-component-props>
