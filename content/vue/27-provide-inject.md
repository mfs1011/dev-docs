# 27 — Provide / inject

[← Oldingi: Slotlar](26-slotlar.md) · [Mundarija](README.md) · [Keyingi: Async komponentlar →](28-async-komponentlar.md)

## Tushuncha

Props ma'lumotni bir qavat pastga uzatadi. Chuqur daraxtda bu zerikarli bo'ladi:

```
App (theme) → Layout → Sidebar → Menu → MenuItem (theme kerak)
```

`provide`/`inject` bu zanjirni kesadi: ota istalgan chuqurlikdagi avlodga to'g'ridan-to'g'ri qiymat beradi.

::: options
```js
// Ota
export default {
  provide() {
    return {
      theme: this.theme,          // diqqat: reaktiv emas
    }
  },
}

// Avlod
export default {
  inject: ['theme'],
}
```

Reaktivlik kerak bo'lsa `computed` uzatiladi:

```js
import { computed } from 'vue'

export default {
  provide() {
    return {
      theme: computed(() => this.theme),
    }
  },
}
```
:::

::: composition
```js
// Ota
import { provide, ref } from 'vue'

const theme = ref('dark')

provide('theme', theme)           // ref uzatilsa — reaktiv
```

```js
// Avlod (istalgan chuqurlikda)
import { inject } from 'vue'

const theme = inject('theme')              // ref keladi
const locale = inject('locale', 'uz')      // standart qiymat
```
:::

## Kod: ilova darajasida

```js
// main.js
app.provide('apiBaseUrl', import.meta.env.VITE_API_URL)
```

Bu qiymat butun ilovadagi har bir komponentga ochiq bo'ladi (03-bob).

## Kod: `Symbol` kalitlar

Satr kalitlar to'qnashishi mumkin (ayniqsa kutubxona yozayotgan bo'lsangiz):

```js
// keys.js
export const ThemeKey = Symbol('theme')
export const FormKey = Symbol('form')
```

```js
import { ThemeKey } from '@/keys'

provide(ThemeKey, theme)
const theme = inject(ThemeKey)
```

TypeScript'da `InjectionKey<T>` tipni ham olib yuradi (49-bob):

```ts
import type { InjectionKey, Ref } from 'vue'

export const ThemeKey: InjectionKey<Ref<string>> = Symbol('theme')
```

## Kod: faqat o'qish uchun + yozish funksiyasi

Eng muhim naqsh — **o'zgartirish huquqini ota'da qoldirish**:

```js
// Ota
import { provide, readonly, ref } from 'vue'

const user = ref(null)

function updateUser(patch) {
  user.value = { ...user.value, ...patch }
}

provide('user', readonly(user))
provide('updateUser', updateUser)
```

```js
// Avlod
const user = inject('user')
const updateUser = inject('updateUser')

updateUser({ name: 'Yangi ism' })       // ✓
user.value = {}                          // ✗ ogohlantirish: readonly
```

Nega shunday? `provide` bilan uzatilgan `ref` ni istalgan avlod o'zgartira olsa, "kim o'zgartirdi?" savoli yana javobsiz qoladi. `readonly` + funksiya — o'zgarishni bitta joyga to'playdi.

## Kod: komponentlar oilasi uchun kontekst

`provide`/`inject` ning eng tabiiy qo'llanilishi — bir-biriga bog'liq komponentlar to'plami:

```vue
<!-- UiTabs.vue -->
<script setup>
import { provide, ref } from 'vue'

const active = ref(null)
const tabs = ref([])

function register(tab) {
  tabs.value.push(tab)
  if (active.value === null) active.value = tab.name
}

provide('tabs', { active, register, select: (name) => (active.value = name) })
</script>

<template>
    <div class="tabs">
        <nav>
            <button
                v-for="tab in tabs"
                :key="tab.name"
                :class="{ 'is-active': tab.name === active }"
                @click="active = tab.name"
            >
                {{ tab.label }}
            </button>
        </nav>

        <slot />
    </div>
</template>
```

```vue
<!-- UiTab.vue -->
<script setup>
import { inject, onMounted } from 'vue'

const props = defineProps({ name: String, label: String })
const tabs = inject('tabs')

onMounted(() => tabs.register({ name: props.name, label: props.label }))
</script>

<template>
    <div v-show="tabs.active.value === name">
        <slot />
    </div>
</template>
```

```vue
<UiTabs>
    <UiTab name="profile" label="Profil">…</UiTab>
    <UiTab name="settings" label="Sozlamalar">…</UiTab>
</UiTabs>
```

Foydalanuvchi hech qanday props uzatmaydi — komponentlar bir-birini kontekst orqali topadi.

## Muhandislik nuqtai nazari: `provide/inject` va Pinia

Ikkalasi ham "props'siz ma'lumot berish" muammosini yechadi. Farqi:

| | `provide`/`inject` | Pinia |
| --- | --- | --- |
| Qamrov | Daraxtning bir shoxi | Butun ilova |
| Nusxalar | Har bir provider — alohida kontekst | Bitta global store (SSR'da so'rovga bitta) |
| DevTools | Ko'rinmaydi | To'liq ko'rinadi, time-travel |
| Test | Provider bilan o'rash kerak | `createTestingPinia` |
| Tipik ishlatilishi | Komponentlar oilasi, tema, forma konteksti | Foydalanuvchi, savat, keshlangan ma'lumot |

Qoida: **bir necha nusxada bo'lishi mumkin bo'lgan kontekst** → `provide`; **ilovada bitta bo'lgan holat** → Pinia.

Masalan, sahifada ikkita `<UiTabs>` bo'lishi mumkin — ular bir-birini bilmasligi kerak. Foydalanuvchi esa bitta — u store'da.

## Muhandislik nuqtai nazari: yashirin bog'liqlik narxi

`inject('theme')` — komponent fayliga qarab bilib bo'lmaydigan bog'liqlik: uni ishlatgan komponent faqat mos provider ichida ishlaydi. Bu ikki muammo tug'diradi:

1. **Test** — komponentni alohida mount qilib bo'lmaydi, provider kerak;
2. **Qayta ishlatish** — komponentni boshqa joyga ko'chirsangiz, jim ishlamay qo'yishi mumkin.

Yumshatish usullari:

```js
// 1. Standart qiymat berish
const theme = inject('theme', 'light')

// 2. Aniq xato
const tabs = inject('tabs')
if (!tabs) throw new Error('<UiTab> faqat <UiTabs> ichida ishlaydi')

// 3. Composable'ga o'rash — bog'liqlik bitta joyda
export function useTabs() {
  const tabs = inject(TabsKey)
  if (!tabs) throw new Error('useTabs: <UiTabs> topilmadi')

  return tabs
}
```

Uchinchi variant eng yaxshisi: `inject` kaliti bitta faylda qoladi va xato xabari aniq.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `provide('user', user.value)` | Qiymat uzatildi — reaktivlik yo'q | `provide('user', user)` (ref) |
| Avlodda `inject` qilingan `ref` ni o'zgartirish | Kim o'zgartirgani ko'rinmaydi | `readonly` + yangilash funksiyasi |
| Provider bo'lmasa `undefined` bilan davom etish | Tushunarsiz xatolar keyinroq chiqadi | Standart qiymat yoki aniq `throw` |
| Hamma narsani `provide` qilish | Yashirin bog'liqliklar, test qiyin | 2 daraja props, chuqurroq — inject/store |
| `setup` tashqarisida (masalan `onMounted` ichida) `inject` | Faqat `setup` davomida ishlaydi | `setup` tanasida chaqiring |
| Satr kalitlar bilan kutubxona yozish | Foydalanuvchi kaliti bilan to'qnashadi | `Symbol` |

## Amaliyot

1. `ThemeProvider` yozing: `theme` `ref` ni `readonly` bilan bering, `toggleTheme` funksiyasini alohida. Uch daraja pastdagi komponentdan almashtiring.
2. `UiTabs`/`UiTab` juftligini yozing (yuqoridagi misol asosida) va bir sahifada ikkita mustaqil tab guruhini joylang.
3. `useTabs()` composable'ini yozing, `<UiTab>` ni `<UiTabs>` tashqarisida ishlatib, xato xabarini ko'ring.
4. Bitta `inject` ni `Symbol` kalitga ko'chiring va TypeScript loyihasida `InjectionKey` bilan tiplang (49-bobdan keyin).

## Rasmiy hujjat

- Provide / inject: <https://vuejs.org/guide/components/provide-inject.html>
- `InjectionKey` (TS): <https://vuejs.org/guide/typescript/composition-api.html#typing-provide-inject>
