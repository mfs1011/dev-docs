# 13 — Ro'yxat render (`v-for`)

[← Oldingi: Shartli render](12-shartli-render.md) · [Mundarija](README.md) · [Keyingi: Hodisalar →](14-hodisalar.md)

## Tushuncha

```vue
<template>
    <li v-for="item in items" :key="item.id">{{ item.title }}</li>

    <!-- indeks bilan -->
    <li v-for="(item, index) in items" :key="item.id">{{ index + 1 }}. {{ item.title }}</li>

    <!-- obyekt bo'yicha: qiymat, kalit, indeks -->
    <li v-for="(value, key, index) in user" :key="key">{{ key }}: {{ value }}</li>

    <!-- son bo'yicha: 1 dan boshlanadi -->
    <span v-for="n in 5" :key="n">{{ n }}</span>

    <!-- `of` ham ishlaydi -->
    <li v-for="item of items" :key="item.id">{{ item.title }}</li>
</template>
```

`v-for` ichida tashqi doiradagi hamma narsaga kirish mumkin — bu oddiy JavaScript doirasi kabi ishlaydi.

## Nega shunday: `key` nima uchun kerak

Ro'yxat o'zgarganda Vue eski va yangi ro'yxatni solishtiradi. Savol: eski 2-element bilan yangi 2-element **bir xil narsami**, yoki boshqa narsa o'sha joyga tushib qoldimi?

`key` bo'lmasa, Vue joylashuvga qarab taxmin qiladi ("in-place patch"): 2-o'rindagi DOM tugunini qayta ishlatib, ichidagi matnni almashtiradi. Bu tez, lekin element **ichida holat bo'lsa** — xato natija beradi.

Klassik misol:

```vue
<!-- key yo'q -->
<li v-for="user in users">
    <input :placeholder="user.name">
</li>
```

Ro'yxat boshiga yangi foydalanuvchi qo'shilsa: Vue birinchi `<li>` ni qayta ishlatadi, `placeholder` ni yangilaydi — lekin **inputga yozilgan matn o'sha joyda qoladi** va endi boshqa foydalanuvchiga tegishli bo'lib ko'rinadi. Checkbox holati, fokus, video pozitsiyasi — hammasi shunday "siljiydi".

`key` berilsa, Vue har bir elementni shaxsiy nomi bilan taniydi va DOM tugunini **element bilan birga** ko'chiradi.

```vue
<li v-for="user in users" :key="user.id">
    <input :placeholder="user.name">
</li>
```

## Kod: to'g'ri va noto'g'ri `key`

```vue
<!-- ✓ Barqaror, noyob identifikator -->
<li v-for="item in items" :key="item.id">

<!-- ✗ Indeks: ro'yxat tartibi o'zgarsa, key ham o'zgaradi — foydasi qolmaydi -->
<li v-for="(item, i) in items" :key="i">

<!-- ✗ Tasodifiy: har renderda yangi key → hamma element qayta yaratiladi -->
<li v-for="item in items" :key="Math.random()">

<!-- ~ Faqat o'zgarmaydigan ro'yxat uchun maqbul -->
<li v-for="(tag, i) in staticTags" :key="i">
```

Indeksni `key` qilish faqat uchta shart birga bajarilsa xavfsiz: ro'yxat qayta tartiblanmaydi, elementlar qo'shilmaydi/o'chirilmaydi va element ichida holat yo'q.

Server ID hali yo'q bo'lgan yangi elementlar uchun (masalan, forma qatorlari) klient tomonda ID yarating:

```js
let nextId = 1
function addRow() {
  rows.value.push({ localId: `tmp-${nextId++}`, title: '' })
}
```

## Kod: massivni o'zgartirish

```js
const items = ref([])

// Mutatsiya — Vue ko'radi
items.value.push(newItem)
items.value.splice(index, 1)
items.value.sort((a, b) => a.order - b.order)
items.value.reverse()

// Yangi massiv — qayta o'zlashtiring
items.value = items.value.filter((i) => !i.done)
items.value = items.value.map((i) => ({ ...i, checked: false }))
items.value = [...items.value, newItem]
```

Vue 3.x da massivning `toSorted`, `toReversed`, `toSpliced`, `with` kabi yangi (mutatsiyasiz) metodlari ham to'liq ishlaydi va ular `computed` ichida ayniqsa qulay:

```js
const sorted = computed(() => items.value.toSorted((a, b) => a.title.localeCompare(b.title)))
```

## Kod: filtrlangan/tartiblangan ro'yxat

```js
const query = ref('')

const visible = computed(() => {
  const term = query.value.trim().toLowerCase()
  if (!term) return items.value

  return items.value.filter((item) => item.title.toLowerCase().includes(term))
})
```

```vue
<input v-model="query" placeholder="Qidirish">
<li v-for="item in visible" :key="item.id">{{ item.title }}</li>
```

Ichma-ich `v-for` da ham xuddi shu qoida — ichki ro'yxatni metod yoki `computed` orqali tayyorlang:

```vue
<li v-for="group in groups" :key="group.id">
    <h3>{{ group.title }}</h3>
    <ul>
        <li v-for="item in itemsOf(group)" :key="item.id">{{ item.title }}</li>
    </ul>
</li>
```

## Kod: komponent bilan ro'yxat

```vue
<UserCard
    v-for="user in users"
    :key="user.id"
    :user="user"
    @remove="removeUser(user.id)"
/>
```

`v-for` komponentga qo'yilsa ham `key` shart. Ma'lumot avtomatik uzatilmaydi — `props` orqali aniq beriladi (22-bob).

## Muhandislik nuqtai nazari: `v-for` va render narxi

Ro'yxat — sahifadagi eng qimmat joy. Uch bosqichli optimallashtirish tartibi:

1. **Kamroq element ko'rsating** — sahifalash yoki "yana yuklash". 1 000 qatorli jadval odatda foydalanuvchiga ham kerak emas.
2. **`key` ni to'g'ri qo'ying** — noto'g'ri `key` butun ro'yxatni qayta yaratadi.
3. **Virtualizatsiya** — faqat ko'rinadigan qatorlarni render qiling (`vue-virtual-scroller`, 62-bob). 10 000 qator uchun yagona ishlaydigan yechim.

Bundan tashqari, `v-for` ichidagi har bir element uchun og'ir `computed` yoki yangi obyekt yaratmang:

```vue
<!-- ✗ Har renderda yangi obyekt → bola komponent har safar yangilanadi -->
<UserCard v-for="u in users" :key="u.id" :config="{ compact: true }" />

<!-- ✓ Bir marta yaratilgan obyekt -->
<script setup>
const cardConfig = { compact: true }
</script>
<UserCard v-for="u in users" :key="u.id" :config="cardConfig" />
```

## Muhandislik nuqtai nazari: ro'yxat ma'lumotini qanday saqlash

Serverdan kelgan ro'yxatni ikki shaklda saqlash mumkin:

```js
// Massiv — tartib muhim bo'lsa
const users = ref([{ id: 1, name: 'Aziz' }, { id: 2, name: 'Bek' }])

// Xarita (normalizatsiya) — tez-tez ID bo'yicha topish kerak bo'lsa
const usersById = ref({ 1: { id: 1, name: 'Aziz' }, 2: { id: 2, name: 'Bek' } })
const userIds = ref([1, 2])
```

Ikkinchi shakl (normalizatsiya) katta ilovalarda afzal: bitta foydalanuvchini yangilash uchun butun massivni aylanib chiqish shart emas va bir xil obyekt bir nechta ro'yxatda takrorlanmaydi. Narxi — render oldidan `userIds.map(id => usersById[id])` ko'rinishidagi `computed`. Pinia bilan birga bu naqsh 43-bobda ko'riladi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `key` yozmaslik | Holat siljiydi (input, checkbox, fokus) | `:key="item.id"` |
| `:key="index"` tartib o'zgaradigan ro'yxatda | Indeks barqaror emas — `key` foydasiz | Barqaror ID |
| `:key="Math.random()"` | Har render — butunlay yangi DOM, animatsiya va fokus yo'qoladi | Barqaror ID |
| Bir elementda `v-for` + `v-if` | `v-if` oldin ishlaydi (12-bob) | `computed` filtr |
| `v-for` ichida og'ir hisob | Har element uchun qayta ishlaydi | `computed` bilan oldindan tayyorlang |
| 5 000 qatorni birdan render qilish | Sahifa qotib qoladi | Sahifalash yoki virtualizatsiya |
| `items[0] = x` o'rniga `items.value[0] = x` ni unutish | `ref` ustida ishlamaydi | `.value` |

## Amaliyot

1. Foydalanuvchilar ro'yxatini `key` siz render qiling, har qatorga `<input>` qo'ying, matn yozing va ro'yxat boshiga yangi element qo'shing. Matn qayerda qolganini kuzating. Keyin `key` qo'shib takrorlang.
2. `query` bilan filtrlashni `computed` orqali yozing. Keyin uni `v-if` bilan qilib ko'ring va qaysi biri kamroq ish bajarishini o'ylang.
3. `toSorted` bilan tartiblangan `computed` yozing va manba massiv o'zgarmasligini tekshiring.
4. 5 000 ta element yarating (`Array.from({ length: 5000 })`) va render vaqtini Performance panelida o'lchang. Keyin 50 tagacha sahifalash qo'shib, farqni solishtiring.

## Rasmiy hujjat

- Ro'yxat render: <https://vuejs.org/guide/essentials/list.html>
- `key` maxsus atributi: <https://vuejs.org/api/built-in-special-attributes.html#key>
