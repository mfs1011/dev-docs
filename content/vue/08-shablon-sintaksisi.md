# 08 — Shablon sintaksisi

[← Oldingi: Reaktivlik mental modeli](07-reaktivlik-mental-modeli.md) · [Mundarija](README.md) · [Keyingi: Reaktivlik asoslari →](09-reaktivlik-asoslari.md)

## Tushuncha

Vue shabloni — **haqiqiy HTML**. Brauzer uni parse qila oladi, IDE rang beradi, prettier formatlaydi. Ustiga uchta qo'shimcha qo'yilgan:

1. **Interpolyatsiya** — `{{ ifoda }}`, matn ichiga qiymat qo'yish;
2. **Direktivalar** — `v-` bilan boshlanadigan maxsus atributlar (`v-if`, `v-for`, `v-bind`, `v-on`…);
3. **Bog'lanish qisqartmalari** — `:` (`v-bind`) va `@` (`v-on`).

```vue
<template>
    <h1>{{ title }}</h1>

    <img :src="logoUrl" :alt="title">
    <button @click="open = !open">{{ open ? 'Yopish' : 'Ochish' }}</button>

    <p v-if="open">Matn</p>
</template>
```

## Nega shunday

Shablon HTML bo'lib qolgani bejiz emas. Vue kompilyatori shablonni **statik tahlil** qila oladi va shu tahlil natijasida render kodini optimallashtiradi: qaysi tugun hech qachon o'zgarmasligini, qaysi atribut dinamikligini oldindan biladi (46-bob). JSX'da bunday tahlil ancha qiyin, chunki u to'liq JavaScript.

Ikkinchi sabab — mehnat taqsimoti. Dizayner yoki HTML/CSS bilan ishlaydigan odam shablonni o'zgartira oladi: u yerda `className`, fragment, `key` prop kabi JavaScript tushunchalari emas, tanish HTML turadi.

## Kod: interpolyatsiya va ifodalar

```vue
<template>
    <!-- Oddiy qiymat -->
    <p>{{ message }}</p>

    <!-- Ifoda — bitta ifoda bo'lishi shart -->
    <p>{{ message.split('').reverse().join('') }}</p>
    <p>{{ count * price }}</p>
    <p>{{ isAdmin ? 'Administrator' : 'Foydalanuvchi' }}</p>

    <!-- ✗ Ishlamaydi: bu ifoda emas, ko'rsatma -->
    <p>{{ if (isAdmin) { return 'Ha' } }}</p>

    <!-- ✗ Ishlamaydi: e'lon -->
    <p>{{ const x = 1 }}</p>
</template>
```

Qoida: **bitta ifoda** (`expression`), ya'ni `return` dan keyin yozish mumkin bo'lgan narsa.

Interpolyatsiya HTML'ni matn sifatida chiqaradi — bu XSS'dan himoya (65-bob):

```vue
<!-- messageHtml = '<b>qalin</b>' -->
<p>{{ messageHtml }}</p>          <!-- ekranda: <b>qalin</b> -->
<p v-html="messageHtml"></p>      <!-- ekranda: qalin (HTML sifatida) -->
```

`v-html` — faqat o'zingiz ishonadigan (yoki tozalangan) HTML uchun.

## Kod: atribut bog'lash (`v-bind`)

```vue
<template>
    <!-- To'liq va qisqa shakl -->
    <img v-bind:src="url">
    <img :src="url">

    <!-- Boolean atribut: false/null/undefined bo'lsa atribut umuman qo'yilmaydi -->
    <button :disabled="isLoading">Saqlash</button>

    <!-- Dinamik atribut nomi -->
    <a :[attributeName]="value">Havola</a>

    <!-- Bir nechta atributni birdan -->
    <input v-bind="inputProps">
    <!-- inputProps = { type: 'email', placeholder: 'Pochta', required: true } -->

    <!-- Bir xil nomdagi qisqartma (Vue 3.4+) -->
    <UserCard :id :name />
    <!-- :id="id" :name="name" bilan bir xil -->
</template>
```

## Kod: hodisa bog'lash (`v-on`)

```vue
<template>
    <button v-on:click="increment">+1</button>
    <button @click="increment">+1</button>

    <!-- Inline ifoda -->
    <button @click="count++">+1</button>

    <!-- Argument bilan; hodisa obyekti kerak bo'lsa — $event -->
    <button @click="remove(item.id, $event)">O'chirish</button>

    <!-- Bir nechta ishlov beruvchi -->
    <button @click="track('cta'), submit()">Yuborish</button>

    <!-- Modifikatorlar (14-bob) -->
    <form @submit.prevent="save">…</form>
    <input @keyup.enter="search">
</template>
```

## Kod: direktiva anatomiyasi

```
v-on:submit.prevent="onSubmit"
│  │      │         │
│  │      │         └─ qiymat (JS ifodasi)
│  │      └─────────── modifikator
│  └────────────────── argument
└───────────────────── direktiva nomi
```

Kundalik direktivalar ro'yxati:

| Direktiva | Vazifasi | Bob |
| --- | --- | --- |
| `v-bind` (`:`) | Atribut/props bog'lash | shu bob |
| `v-on` (`@`) | Hodisa tinglash | 14 |
| `v-if` / `v-else-if` / `v-else` | Shartli render (DOM'dan olib tashlaydi) | 12 |
| `v-show` | Shartli ko'rsatish (`display: none`) | 12 |
| `v-for` | Ro'yxat | 13 |
| `v-model` | Ikki tomonlama bog'lanish | 15, 24 |
| `v-slot` (`#`) | Slot mazmuni | 26 |
| `v-html` | Xom HTML (ehtiyot bo'ling) | 65 |
| `v-text` | Matn (kamdan-kam; `{{ }}` afzal) | — |
| `v-pre` | Ichidagini kompilyatsiya qilmaslik | — |
| `v-once` | Bir marta render qilib, muzlatish | 62 |
| `v-memo` | Shartli qayta render | 62 |
| `v-cloak` | Kompilyatsiyagacha yashirish (CDN rejimi) | — |

## Kod: `<template>` tegi bilan guruhlash

Bir nechta elementga bitta shart yoki tsikl qo'llash kerak bo'lsa, ortiqcha `<div>` qo'shish shart emas:

```vue
<template>
    <template v-if="user">
        <h2>{{ user.name }}</h2>
        <p>{{ user.email }}</p>
    </template>

    <dl>
        <template v-for="row in rows" :key="row.id">
            <dt>{{ row.label }}</dt>
            <dd>{{ row.value }}</dd>
        </template>
    </dl>
</template>
```

`<template>` DOM'da qolmaydi — faqat guruhlash vositasi. `<dl>` misolida bu muhim: `<dl>` ichida `<div>` semantikani buzardi.

## Muhandislik nuqtai nazari: shablonda qancha mantiq bo'lishi kerak

Shablonda murakkab ifoda yozish mumkin, lekin kerak emas:

```vue
<!-- ✗ O'qib bo'lmaydi, test qilib bo'lmaydi -->
<p>{{ items.filter(i => !i.done).sort((a,b) => a.due - b.due).slice(0,3).map(i => i.title).join(', ') }}</p>

<!-- ✓ Nomlangan, keshlanadigan, testga tushadigan -->
<p>{{ upcomingTitles }}</p>
```

Chegara qoidasi: shablondagi ifoda **bir qarashda o'qilishi** kerak. Bundan murakkabi — `computed` (10-bob). Sabab faqat chiroylilik emas: `computed` keshlanadi, shablondagi ifoda esa har renderda qayta hisoblanadi.

Ikkinchi qoida: **shablonda nojo'ya ta'sir (side effect) bo'lmasin.** `{{ counter++ }}` yoki `{{ fetchUser() }}` — render paytida holatni o'zgartirish yoki so'rov yuborish cheksiz siklga olib keladi, chunki render → o'zgarish → render.

## Muhandislik nuqtai nazari: shablon qanday kompilyatsiya qilinadi

`.vue` fayldagi shablon build vaqtida render funksiyasiga aylanadi:

```vue
<template>
    <h1 class="title">{{ msg }}</h1>
</template>
```

taxminan:

```js
import { createElementVNode as _createElementVNode, toDisplayString as _toDisplayString } from 'vue'

export function render(_ctx) {
  return _createElementVNode('h1', { class: 'title' }, _toDisplayString(_ctx.msg), 1 /* TEXT */)
}
```

Oxiridagi `1` — **patch flag**: "bu tugunda faqat matn o'zgarishi mumkin". Keyingi renderlarda Vue class'ni ham, atributlarni ham solishtirmaydi, faqat matnni tekshiradi. Shu tufayli Vue'ning virtual DOM solishtiruvi React'nikidan tezroq ishlaydi — kompilyator ko'p ishni oldindan qilib qo'yadi (46-bob).

Buni o'z ko'zingiz bilan ko'rish mumkin: <https://play.vuejs.org> → o'ng tarafdagi **Compiled Code** paneli.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `<img src="{{ url }}">` | Atribut ichida interpolyatsiya ishlamaydi | `:src="url"` |
| Shablonda `if/for` ko'rsatmalari | Faqat ifoda ruxsat etilgan | `v-if`, `v-for`, yoki `computed` |
| `v-html` ga foydalanuvchi matnini berish | XSS: `<img onerror=...>` ishlaydi | Tozalash (DOMPurify) yoki oddiy `{{ }}` |
| Shablonda `{{ user.profile.name }}` (user hali `null`) | Render xatosi | `v-if="user"` yoki `{{ user?.profile?.name }}` |
| Uzun ifodalarni shablonga to'plash | Test qilinmaydi, keshlanmaydi | `computed` |
| Komponent nomini `<my-component>` va `<MyComponent>` aralash yozish | Chalkashlik; `.vue` faylda PascalCase konvensiya | `<MyComponent />` (21-bob) |

## Amaliyot

1. `{{ }}` ichida to'rt xil ifoda yozib ko'ring: arifmetika, ternar, metod chaqiruvi, `?.` bilan xavfsiz kirish.
2. Bitta tugmaga `@click` orqali ikki funksiyani ulang. Keyin uni `methods`/funksiyaga ko'chiring — qaysi biri o'qilishi oson?
3. `<template v-for>` bilan `<dl>` ichida 3 ta `dt/dd` juftligini chiqaring.
4. <https://play.vuejs.org> da kichik shablon yozing va **Compiled Code** panelida patch flag'larni toping. `class` ni dinamik qilsangiz flag qanday o'zgaradi?

## Rasmiy hujjat

- Shablon sintaksisi: <https://vuejs.org/guide/essentials/template-syntax.html>
- Yangi bir xil nomli qisqartma: <https://vuejs.org/guide/essentials/template-syntax.html#same-name-shorthand>
- Direktivalar API: <https://vuejs.org/api/built-in-directives.html>
