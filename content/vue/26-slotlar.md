# 26 — Slotlar

[← Oldingi: Fallthrough atributlar](25-fallthrough-atributlar.md) · [Mundarija](README.md) · [Keyingi: Provide / inject →](27-provide-inject.md)

## Tushuncha

Props ma'lumot uzatadi, slot esa **mazmun** (shablon bo'lagi) uzatadi:

```vue
<!-- UiCard.vue -->
<template>
    <article class="card">
        <slot />
    </article>
</template>
```

```vue
<UiCard>
    <h3>Sarlavha</h3>
    <p>Istalgan mazmun — komponent buni bilmaydi.</p>
</UiCard>
```

Slot mazmuni **ota komponentda** kompilyatsiya qilinadi: u ota holatiga kirish huquqiga ega, bola holatiga esa yo'q (scoped slot bundan mustasno).

## Kod: standart mazmun

```vue
<template>
    <button class="btn">
        <slot>Yuborish</slot>       <!-- hech narsa berilmasa shu ko'rinadi -->
    </button>
</template>
```

## Kod: nomli slotlar

```vue
<!-- UiModal.vue -->
<template>
    <div class="modal">
        <header class="modal-head">
            <slot name="header">
                <h2>{{ title }}</h2>
            </slot>
        </header>

        <div class="modal-body">
            <slot />                     <!-- name="default" -->
        </div>

        <footer class="modal-foot">
            <slot name="footer" />
        </footer>
    </div>
</template>
```

```vue
<UiModal title="Tasdiqlash">
    <template #header>
        <h2 class="danger">Diqqat!</h2>
    </template>

    <p>Bu amalni ortga qaytarib bo'lmaydi.</p>

    <template #footer>
        <UiButton variant="ghost" @click="close">Bekor</UiButton>
        <UiButton variant="danger" @click="confirm">O'chirish</UiButton>
    </template>
</UiModal>
```

`#header` — `v-slot:header` ning qisqartmasi.

## Kod: slot mavjudligini tekshirish

```vue
<script setup>
import { useSlots } from 'vue'

const slots = useSlots()
</script>

<template>
    <footer v-if="slots.footer" class="modal-foot">
        <slot name="footer" />
    </footer>
</template>
```

Shablonda `$slots` sifatida ham mavjud:

```vue
<footer v-if="$slots.footer">
    <slot name="footer" />
</footer>
```

Bu naqsh bo'sh `<footer>` chiqib qolmasligi uchun kerak — chegara, padding va border ko'rinib qoladi.

## Kod: scoped slot — bolaning ma'lumotini yuqoriga berish

Slot mazmuni otada yozilgani uchun bolaning ma'lumotini ko'rmaydi. Buni hal qilish uchun bola slotga ma'lumot **uzatadi**:

```vue
<!-- UserList.vue -->
<template>
    <ul>
        <li v-for="user in users" :key="user.id">
            <slot :user="user" :index="users.indexOf(user)">
                {{ user.name }}          <!-- standart ko'rinish -->
            </slot>
        </li>
    </ul>
</template>
```

```vue
<UserList :users="users">
    <template #default="{ user, index }">
        <strong>{{ index + 1 }}.</strong> {{ user.name }}
        <UiBadge v-if="user.isAdmin">admin</UiBadge>
    </template>
</UserList>
```

Qisqaroq shakl (faqat default slot bo'lsa):

```vue
<UserList :users="users" #default="{ user }">
    {{ user.name }}
</UserList>
```

## Kod: renderless komponent

Scoped slotning eng kuchli qo'llanilishi — **ko'rinishsiz** komponent: u faqat mantiqni beradi, HTML'ni chaqiruvchi yozadi.

```vue
<!-- FetchData.vue -->
<script setup>
import { ref, watchEffect } from 'vue'

const props = defineProps({ url: { type: String, required: true } })

const data = ref(null)
const error = ref(null)
const loading = ref(true)

watchEffect(async () => {
  loading.value = true
  error.value = null

  try {
    const response = await fetch(props.url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    data.value = await response.json()
  } catch (cause) {
    error.value = cause
  } finally {
    loading.value = false
  }
})
</script>

<template>
    <slot :data="data" :error="error" :loading="loading" />
</template>
```

```vue
<FetchData url="/api/users" #default="{ data, error, loading }">
    <UiSpinner v-if="loading" />
    <UiError v-else-if="error" :error="error" />
    <UserList v-else :users="data" />
</FetchData>
```

> **Muhim:** Composition API paydo bo'lgandan keyin renderless komponentlarning ko'p vazifasini **composable** (29-bob) qoplaydi va u odatda soddaroq. Renderless komponent hamon foydali bo'ladigan joy — mantiq bilan birga **shablon tuzilmasi** ham kerak bo'lganda (masalan, `v-for` ni o'zi qiladigan ro'yxat komponenti).

## Kod: dinamik slot nomi

```vue
<template>
    <table>
        <td v-for="column in columns" :key="column.key">
            <slot :name="`cell-${column.key}`" :row="row">
                {{ row[column.key] }}
            </slot>
        </td>
    </table>
</template>
```

```vue
<DataTable :columns="columns" :rows="rows">
    <template #cell-status="{ row }">
        <UiBadge :variant="row.status">{{ row.status }}</UiBadge>
    </template>
</DataTable>
```

Bu — jadval komponentlari (Element Plus, PrimeVue, Vuetify) ishlatadigan asosiy naqsh.

## Muhandislik nuqtai nazari: slot yoki props

| Uzatiladigan narsa | Vosita |
| --- | --- |
| Ma'lumot (satr, son, obyekt) | Props |
| Ko'rinish bo'lagi (HTML, boshqa komponent) | Slot |
| Ko'rinishni ma'lumot bilan (ro'yxat qatori) | Scoped slot |
| Mantiq (funksiya) | Props (callback) yoki composable |

Belgilar: agar props `type: String` bo'lsa-yu, unga HTML yozish istagi tug'ilsa — bu slot bo'lishi kerak edi. `:title="'<b>Salom</b>'"` — bu yo'l `v-html` va XSS'ga olib boradi.

Slot yana **prop drilling** ni kesadi (22-bob): ma'lumot pastga tushmaydi, chunki mazmun yuqorida yoziladi:

```vue
<!-- Ma'lumot `user` pastga uzatilmadi — u yuqorida ishlatildi -->
<PageLayout>
    <template #header>
        <UserGreeting :user="user" />
    </template>
</PageLayout>
```

## Muhandislik nuqtai nazari: slot va unumdorlik

Slot mazmuni ota komponentda kompilyatsiya qilinadi va ota qayta render qilinganda slot funksiyasi ham qayta chaqiriladi. Ya'ni bolani `v-memo` yoki `shallowRef` bilan optimallashtirish bu bog'liqlikni uzmaydi.

Amaliy natija: og'ir bola komponentga slot uzatayotganingizda, ota tez-tez render qilinsa, bola ham render qilinadi. Yechim — mazmun o'zgarmas bo'lsa `v-once` yoki mazmunni o'z komponentiga ajratish.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Slot ichida bolaning holatiga murojaat qilish | Slot ota doirasida kompilyatsiya qilinadi | Scoped slot orqali uzating |
| HTML'ni props sifatida uzatish | XSS xavfi, formatlash qiyin | Slot |
| Bo'sh slot uchun o'ramni shartsiz render qilish | Bo'sh border/padding ko'rinadi | `v-if="$slots.footer"` |
| `#header` ni `<template>` siz elementga yozish | Faqat `<template>` yoki komponentning o'zida ishlaydi | `<template #header>` |
| Har bir variatsiya uchun yangi prop qo'shish (`showFooter`, `footerText`, `footerAlign`) | Props portlaydi | Slot bering |
| Scoped slot o'rniga `provide/inject` bilan ma'lumot uzatish | Ortiqcha murakkablik | Scoped slot |

## Amaliyot

1. `UiCard` yozing: `header`, default, `footer` slotlari; `footer` bo'lmasa o'ram chiqmasin.
2. `UserList` ni scoped slot bilan yozing va ikki xil ko'rinishda ishlating (oddiy ro'yxat va kartochkalar).
3. `FetchData` renderless komponentini yozing, keyin xuddi shu vazifani composable bilan ham qiling (29-bobdan keyin qaytib keling) va ikkalasini solishtiring.
4. `DataTable` ni dinamik slot nomlari bilan yozing: `#cell-<column>` orqali ustunni moslashtirish imkoni bo'lsin.

## Rasmiy hujjat

- Slotlar: <https://vuejs.org/guide/components/slots.html>
- Renderless komponentlar: <https://vuejs.org/guide/components/slots.html#renderless-components>
