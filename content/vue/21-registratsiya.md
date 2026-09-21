# 21 — Komponentlarni ro'yxatdan o'tkazish

[← Oldingi: Hayot sikli](20-hayot-sikli.md) · [Mundarija](README.md) · [Keyingi: Props →](22-props.md)

## Tushuncha

Vue shablonda uchragan `<UserCard />` ni qayerdan topishni bilishi kerak. Ikki yo'l bor:

- **Lokal** — komponent import qilinadi va faqat shu faylda ishlaydi;
- **Global** — `app.component()` bilan bir marta ro'yxatdan o'tkaziladi va hamma joyda ishlaydi.

```vue
<!-- Lokal: <script setup> da import yetarli -->
<script setup>
import UserCard from '@/components/UserCard.vue'
</script>

<template>
    <UserCard />
</template>
```

```js
// Global: main.js
import UiButton from '@/components/UiButton.vue'

app.component('UiButton', UiButton)
```

::: options
Options API'da lokal registratsiya `components` xossasi orqali:

```js
import UserCard from '@/components/UserCard.vue'

export default {
  components: { UserCard },
}
```
:::

::: composition
`<script setup>` da alohida `components` ro'yxati yo'q — import qilingan har qanday komponent shablonda ishlatilishi mumkin. Bu `<script setup>` ning eng sezilarli qulayliklaridan biri.

Oddiy `setup()` funksiyasida esa Options API'dagidek `components` kerak bo'ladi.
:::

## Kod: nomlash

```vue
<!-- Fayl: UserCard.vue -->
<UserCard />        <!-- ✓ PascalCase — tavsiya etiladi -->
<user-card />       <!-- ✓ kebab-case ham ishlaydi -->
```

PascalCase afzal, chunki:

- HTML tegidan (`<header>`, `<section>`) vizual farq qiladi;
- IDE "ta'rifga o'tish" ni to'g'ri bajaradi;
- Bir so'zli komponentlar HTML elementlari bilan to'qnashmaydi (`<Button />` va `<button>`).

**Muhim istisno:** DOM ichidagi shablonda (build qadamisiz, 02-bob) HTML parseri teg nomlarini kichik harfga aylantiradi, shuning uchun u yerda faqat kebab-case ishlaydi.

Ikki so'zli nom qoidasi (`UserCard`, emas `Card`) — kelajakdagi HTML elementlari bilan to'qnashmaslik uchun.

## Kod: global registratsiya qachon oqlanadi

```js
// main.js — dizayn tizimi
import UiButton from '@/components/ui/UiButton.vue'
import UiInput from '@/components/ui/UiInput.vue'
import UiModal from '@/components/ui/UiModal.vue'

const app = createApp(App)

for (const [name, component] of Object.entries({ UiButton, UiInput, UiModal })) {
  app.component(name, component)
}
```

Yoki Vite'ning `import.meta.glob` bilan avtomatik:

```js
const modules = import.meta.glob('./components/ui/*.vue', { eager: true })

for (const path in modules) {
  const name = path.split('/').pop().replace('.vue', '')

  app.component(name, modules[path].default)
}
```

Narxi: bu komponentlar **har doim** bundle'ga kiradi, chunki `app.component` ularni ishlatilgan-ishlatilmaganidan qat'i nazar ro'yxatga oladi. Dizayn tizimi uchun bu maqbul (ular baribir hamma joyda kerak), sahifaga xos komponentlar uchun — yo'q.

## Kod: avtomatik import (`unplugin-vue-components`)

Global registratsiya narxisiz qulaylikni beradigan uchinchi yo'l:

```bash
npm i -D unplugin-vue-components
```

```js
// vite.config.js
import Components from 'unplugin-vue-components/vite'

export default {
  plugins: [
    vue(),
    Components({
      dirs: ['src/components'],
      dts: true,        // TypeScript uchun ta'riflar fayli
    }),
  ],
}
```

Endi `<UserCard />` yozsangiz, plugin kerakli importni **build vaqtida** qo'shadi. Natija: import yozilmaydi, lekin faqat ishlatilgan komponentlar bundle'ga kiradi.

Kamchiligi — "sehr": faylni ochgan odam komponent qayerdan kelganini ko'rmaydi. Jamoada kelishib olish kerak.

## Kod: rekursiv komponent

Komponent o'zini chaqirishi mumkin (daraxt, izohlar, menyu):

```vue
<!-- TreeNode.vue -->
<script setup>
defineProps({ node: Object })
</script>

<template>
    <li>
        {{ node.title }}

        <ul v-if="node.children?.length">
            <!-- O'z nomi bilan o'zini chaqiradi -->
            <TreeNode v-for="child in node.children" :key="child.id" :node="child" />
        </ul>
    </li>
</template>
```

`<script setup>` da komponent o'z fayl nomi bilan avtomatik tanib olinadi. To'xtash sharti (`v-if`) bo'lmasa — cheksiz rekursiya va stack overflow.

Nomni aniq berish kerak bo'lsa:

```js
defineOptions({ name: 'TreeNode' })
```

## Muhandislik nuqtai nazari: papka tuzilishi va nomlash

Ikki konvensiya keng tarqalgan:

```
components/
├── ui/              ← dizayn tizimi: UiButton, UiInput, UiModal
├── layout/          ← TheHeader, TheSidebar, TheFooter
└── user/            ← UserCard, UserList, UserAvatar
```

- **`Ui` prefiksi** — umumiy, holatsiz, qayta ishlatiladigan elementlar;
- **`The` prefiksi** — ilovada faqat bitta nusxada bo'ladigan komponentlar (`TheHeader`);
- **Domen prefiksi** (`User...`, `Product...`) — bir mavzuga tegishli komponentlar yonma-yon turadi va alifbo bo'yicha guruhlanadi.

Bu Vue'ning eski rasmiy uslub qo'llanmasidan kelgan va hamon foydali: fayl nomiga qarab komponentning roli ko'rinadi.

## Muhandislik nuqtai nazari: registratsiya va bundle hajmi

| Usul | Import ko'rinadimi | Bundle'ga ta'siri |
| --- | --- | --- |
| Lokal import | Ha | Faqat ishlatilgani kiradi, code splitting ishlaydi |
| Global (`app.component`) | Yo'q | Hammasi kiradi |
| Avtomatik (`unplugin`) | Yo'q (kodda), ha (build'da) | Faqat ishlatilgani |
| Async (`defineAsyncComponent`) | Ha | Alohida chunk (28-bob) |

Katta ilovada tavsiya: **dizayn tizimi — global yoki avtomatik, qolgani — lokal, og'ir komponentlar — async.**

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Import qilib, `components` ga qo'shishni unutish (Options API) | "Failed to resolve component" | `components: { UserCard }` yoki `<script setup>` |
| DOM shablonida `<UserCard />` | HTML parseri kichik harfga aylantiradi | `<user-card />` |
| Bir so'zli nom (`<Card />`) | Kelajakdagi HTML elementlari bilan to'qnashuv | Ikki so'z: `<UserCard />` |
| Hamma komponentni global qilish | Bundle shishadi, bog'liqlik ko'rinmaydi | Faqat dizayn tizimi |
| Rekursiv komponentda to'xtash sharti yo'q | Cheksiz rekursiya | `v-if` bilan chegara |
| Bir komponentni ikki nom bilan ro'yxatdan o'tkazish | Ikkita nusxa bundle'da bo'lishi mumkin | Bitta nom |

## Amaliyot

1. `UiButton` ni global qiling, `UserCard` ni lokal qoldiring. `npm run build` dan keyin chunk hajmlarini solishtiring.
2. `import.meta.glob` bilan `components/ui/*.vue` ni avtomatik ro'yxatdan o'tkazing.
3. `TreeNode` rekursiv komponentini yozing va uch darajali menyuni render qiling.
4. `unplugin-vue-components` ni o'rnating va bitta komponentdan importni olib tashlab, ishlashini tekshiring.

## Rasmiy hujjat

- Registratsiya: <https://vuejs.org/guide/components/registration.html>
- Uslub qo'llanmasi (nomlash): <https://vuejs.org/style-guide/rules-strongly-recommended.html>
