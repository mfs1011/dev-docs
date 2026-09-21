# 12 — Shartli render

[← Oldingi: Class va style bog'lash](11-class-va-style.md) · [Mundarija](README.md) · [Keyingi: Ro'yxat render →](13-royxat-render.md)

## Tushuncha

Ikkita vosita bir xil natijaga o'xshaydi, lekin ichkarida butunlay boshqacha ishlaydi:

- **`v-if`** — shart yolg'on bo'lsa, element **DOM'da umuman bo'lmaydi**. Komponent bo'lsa — yaratilmaydi (yoki yo'q qilinadi), hayot sikli hooklari ishlaydi.
- **`v-show`** — element har doim DOM'da turadi, faqat `display: none` qo'yiladi.

```vue
<template>
    <p v-if="isLoggedIn">Xush kelibsiz</p>
    <p v-else>Iltimos, tizimga kiring</p>

    <div v-show="isPanelOpen">Panel</div>
</template>
```

## Kod: `v-if` / `v-else-if` / `v-else`

```vue
<template>
    <div v-if="status === 'loading'" class="spinner">Yuklanmoqda…</div>
    <div v-else-if="status === 'error'" class="error">{{ error }}</div>
    <div v-else-if="items.length === 0" class="empty">Ma'lumot yo'q</div>
    <ul v-else>
        <li v-for="item in items" :key="item.id">{{ item.title }}</li>
    </ul>
</template>
```

`v-else` va `v-else-if` **darhol** oldingi `v-if` dan keyin turishi shart — orasida boshqa element bo'lsa, Vue ogohlantiradi.

Bir nechta elementni bitta shart bilan boshqarish uchun `<template>`:

```vue
<template>
    <template v-if="user">
        <h2>{{ user.name }}</h2>
        <p>{{ user.email }}</p>
        <UserActions :user="user" />
    </template>
</template>
```

## Kod: `v-show` chegaralari

```vue
<template>
    <!-- ✓ ishlaydi -->
    <div v-show="open">Panel</div>

    <!-- ✗ <template> bilan ishlamaydi (qo'yadigan element yo'q) -->
    <template v-show="open">…</template>

    <!-- ✗ v-else bilan ishlamaydi -->
    <div v-show="a">A</div>
    <div v-else>B</div>
</template>
```

`v-show` komponentga qo'yilsa, komponent ildiz elementiga `display: none` tushadi — komponent **yaratiladi va ishlaydi**, faqat ko'rinmaydi. Bu muhim farq: ichidagi `onMounted`, so'rovlar, timerlar ishlab turadi.

## Muhandislik nuqtai nazari: qaysi birini tanlash

| Mezon | `v-if` | `v-show` |
| --- | --- | --- |
| Boshlang'ich narx | Shart yolg'on bo'lsa — nol (render qilinmaydi) | Har doim render qilinadi |
| Almashish narxi | Yuqori (yaratish/yo'q qilish) | Past (bitta CSS xossa) |
| Hayot sikli | Har safar `mounted`/`unmounted` | Faqat bir marta |
| Holat | Yo'qoladi (forma tozalanadi) | Saqlanadi |
| SEO / DOM o'lchami | DOM kichik | DOM'da qoladi |

Qoida:

- **Kamdan-kam o'zgaradigan yoki og'ir shart** (`v-if="isAdmin"`, `v-if="hasSubscription"`) → `v-if`;
- **Tez-tez almashadigan ko'rinish** (tab, tooltip, dropdown) → `v-show`;
- **Ichidagi holat saqlanishi kerak** (forma, video pleer, xarita) → `v-show` yoki `<KeepAlive>` (34-bob).

Og'ir komponent (masalan grafik kutubxonasi) uchun `v-show` yomon tanlov: u har doim ishga tushadi va xotira egallaydi. Aksincha, tez almashadigan kichik blok uchun `v-if` ortiqcha ish qiladi.

## Muhandislik nuqtai nazari: `v-if` + `v-for` bir elementda

Bu Vue'dagi eng mashhur qoidalardan biri:

```vue
<!-- ✗ Vue 3 da xato: v-if v-for dan oldin ishlaydi, `item` hali mavjud emas -->
<li v-for="item in items" v-if="!item.done" :key="item.id">{{ item.title }}</li>
```

Vue 3 da `v-if` ning prioriteti yuqori, shuning uchun u `item` ni ko'ra olmaydi va xato beradi. Ikki to'g'ri yo'l:

```vue
<!-- 1. computed bilan oldindan filtrlash (afzal) -->
<li v-for="item in pending" :key="item.id">{{ item.title }}</li>

<!-- 2. <template> bilan ajratish -->
<template v-for="item in items" :key="item.id">
    <li v-if="!item.done">{{ item.title }}</li>
</template>
```

Birinchi variant tezroq: filtr `computed` da keshlanadi, har renderda qayta hisoblanmaydi.

## Muhandislik nuqtai nazari: to'rt holat naqshi

Ma'lumot yuklaydigan har bir ekranda kamida to'rtta holat bor: yuklanmoqda, xato, bo'sh, ma'lumot bor. Boshlovchilar odatda ikkitasini yozadi va qolgan ikkitasi production'da "oq ekran" bo'lib chiqadi.

```vue
<script setup>
const { data, error, pending } = useUsers()     // 44-bob
const isEmpty = computed(() => !pending.value && !error.value && data.value?.length === 0)
</script>

<template>
    <UiSpinner v-if="pending" />
    <UiError v-else-if="error" :error="error" @retry="refresh" />
    <UiEmpty v-else-if="isEmpty" title="Foydalanuvchi topilmadi" />
    <UserList v-else :users="data" />
</template>
```

Shu to'rtlikni odat qilib oling. Uni komponentga ham chiqarish mumkin (`<AsyncState>` naqshi, 26-bobdagi slotlar bilan).

## Muhandislik nuqtai nazari: shart va maxfiylik

`v-if="isAdmin"` — bu **interfeys** darajasidagi shart, xavfsizlik emas. Klientdagi kod va ma'lumot foydalanuvchiga ochiq: DevTools'da holatni o'zgartirib, yashiringan tugmani ko'rsatish mumkin.

Demak:

- Ruxsat tekshiruvi **serverda** bo'lishi shart (65-bob);
- Maxfiy ma'lumotni klientga umuman yubormang — `v-if` bilan yashirish yetarli emas.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `v-if` va `v-for` bir elementda | `v-if` oldin ishlaydi, `item` yo'q | `computed` bilan filtr yoki `<template v-for>` |
| Og'ir komponentga `v-show` | Doim yaratiladi, so'rov yuboradi, xotira egallaydi | `v-if` (+ `KeepAlive` kerak bo'lsa) |
| Tez almashadigan tab uchun `v-if` | Har almashishda qayta yaratish | `v-show` |
| `v-else` ni boshqa element bilan ajratib qo'yish | Vue bog'lay olmaydi | `v-if` dan keyin darhol |
| Faqat `loading` va `data` holatlari | Xato va bo'sh holat ko'rinmaydi | To'rt holat naqshi |
| `v-if="user.name"` (user — `null`) | Render xatosi | `v-if="user?.name"` yoki tashqi `v-if="user"` |

## Amaliyot

1. To'rt holat naqshini qo'llang: `loading` / `error` / `empty` / `data`. Har birini sun'iy ravishda ishga tushirib ko'ring.
2. Bitta bo'limni avval `v-if`, keyin `v-show` bilan yozing. Ichiga `onMounted(() => console.log('mount'))` qo'ying va almashtirganda konsolni kuzating.
3. Ichida input bo'lgan panelni `v-if` bilan yoping-oching — kiritilgan matn yo'qolishini ko'ring. Keyin `v-show` ga o'tkazing.
4. `v-if` + `v-for` ni bir elementda yozib, Vue bergan ogohlantirishni o'qing, keyin `computed` bilan tuzating.

## Rasmiy hujjat

- Shartli render: <https://vuejs.org/guide/essentials/conditional.html>
- Ro'yxat va shart tartibi: <https://vuejs.org/guide/essentials/list.html#v-for-with-v-if>
