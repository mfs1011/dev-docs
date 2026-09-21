# 14 — Hodisalar (`v-on`)

[← Oldingi: Ro'yxat render](13-royxat-render.md) · [Mundarija](README.md) · [Keyingi: Forma bog'lash →](15-forma-bogash.md)

## Tushuncha

```vue
<template>
    <!-- Metod nomi -->
    <button @click="save">Saqlash</button>

    <!-- Inline ifoda -->
    <button @click="count++">+1</button>

    <!-- Argument bilan -->
    <button @click="remove(item.id)">O'chirish</button>

    <!-- Hodisa obyekti kerak bo'lsa -->
    <button @click="remove(item.id, $event)">O'chirish</button>
    <input @input="(event) => (query = event.target.value)">
</template>
```

Metodga argument berilmasa, hodisa obyekti **avtomatik** birinchi argument bo'lib keladi:

::: options
```js
export default {
  methods: {
    save(event) {
      console.log(event.target)     // <button>
    },
  },
}
```
:::

::: composition
```js
function save(event) {
  console.log(event.target)         // <button>
}
```
:::

## Kod: hodisa modifikatorlari

Modifikatorlar — tez-tez takrorlanadigan `event` amallarining qisqartmasi:

```vue
<template>
    <!-- event.preventDefault() -->
    <form @submit.prevent="save">…</form>

    <!-- event.stopPropagation() -->
    <div @click="onOuter">
        <button @click.stop="onInner">Ichki</button>
    </div>

    <!-- Faqat elementning o'zida bo'lgan hodisa (bola emas) -->
    <div class="modal-backdrop" @click.self="close">…</div>

    <!-- Bir marta ishlaydi -->
    <button @click.once="startTrial">Boshlash</button>

    <!-- Capture bosqichida -->
    <div @click.capture="onCapture">…</div>

    <!-- Passive: scroll ni bloklamaydi (mobil unumdorlik) -->
    <div @scroll.passive="onScroll">…</div>
</template>
```

Modifikatorlarni zanjirlash mumkin: `@click.stop.prevent="..."`. Tartib muhim — `@click.prevent.self` va `@click.self.prevent` boshqacha ishlaydi.

## Kod: klaviatura va sichqoncha modifikatorlari

```vue
<template>
    <input @keyup.enter="search">
    <input @keyup.esc="clear">
    <input @keydown.tab.prevent="insertTab">

    <!-- Kombinatsiya: Ctrl/Cmd + S -->
    <div @keydown.ctrl.s.prevent="save">…</div>
    <div @keydown.meta.k.prevent="openPalette">…</div>

    <!-- Aniq tugma: faqat Ctrl bosilgan bo'lsa (boshqasi bo'lmasa) -->
    <button @click.ctrl.exact="onCtrlClick">…</button>

    <!-- Sichqoncha tugmalari -->
    <div @click.middle="openInNewTab" @click.right.prevent="showMenu">…</div>
</template>
```

Kalit nomlari `KeyboardEvent.key` dan kebab-case ko'rinishida olinadi: `.page-down`, `.arrow-up`, `.delete`.

## Kod: komponent hodisalari

Komponent o'z hodisasini chiqaradi (23-bob):

```vue
<!-- Bola: UserCard.vue -->
<script setup>
const emit = defineEmits(['remove', 'select'])
</script>

<template>
    <article @click="emit('select', user.id)">
        <button @click.stop="emit('remove', user.id)">O'chirish</button>
    </article>
</template>
```

```vue
<!-- Ota -->
<UserCard :user="user" @remove="onRemove" @select="onSelect" />
```

`@click.stop` bu yerda muhim: usiz "O'chirish" tugmasi bosilganda `select` ham ishga tushadi (hodisa ko'tarilishi).

## Kod: hodisani to'xtatish va tozalash

Vue shablondagi tinglovchilarni **avtomatik** olib tashlaydi. Lekin `window`/`document` ga qo'lda qo'shilganini o'zingiz tozalaysiz:

::: options
```js
export default {
  mounted() {
    window.addEventListener('keydown', this.onKey)
  },
  unmounted() {
    window.removeEventListener('keydown', this.onKey)
  },
  methods: {
    onKey(event) {
      if (event.key === 'Escape') this.close()
    },
  },
}
```
:::

::: composition
```js
import { onMounted, onUnmounted } from 'vue'

function onKey(event) {
  if (event.key === 'Escape') close()
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
```

Bu juftlikni har safar yozmaslik uchun composable qiling (29-bob) yoki VueUse'ning `useEventListener` funksiyasidan foydalaning — u tozalashni o'zi qiladi.
:::

## Muhandislik nuqtai nazari: hodisa oqimi

Brauzerda hodisa uch bosqichda yuradi: **capture** (yuqoridan pastga), **target**, **bubble** (pastdan yuqoriga). Vue standart holatda bubble bosqichida tinglaydi.

Bu bilim ikki joyda kerak bo'ladi:

1. **Modal tashqarisiga bosilganda yopish.** `@click.self` backdrop uchun to'g'ri yechim; `document` ga tinglovchi qo'yish esa boshqa muammolar keltiradi (masalan, tugmani bosganda modal darhol yopiladi).
2. **Ro'yxatdagi ko'p tinglovchi.** 1 000 qatorga 1 000 ta `@click` o'rniga bitta ota elementga qo'yib, `event.target.closest('[data-id]')` orqali aniqlash mumkin (event delegation). Vue'da bu kamdan-kam kerak, chunki ro'yxatlar odatda virtualizatsiya qilinadi, lekin bilib qo'yish foydali.

## Muhandislik nuqtai nazari: hodisa ichida nima qilinadi

Hodisa ishlov beruvchisi — **nojo'ya ta'sirlar joyi**: so'rov yuborish, marshrutni o'zgartirish, store'ga yozish. Lekin uni katta qilib yubormang:

```js
// ✗ 40 qatorlik ishlov beruvchi
async function onSubmit() { /* validatsiya + so'rov + xato + toast + navigatsiya */ }

// ✓ Har qism o'z joyida
async function onSubmit() {
  if (!validate()) return

  await saveUser(form)
  notify('Saqlandi')
  router.push('/users')
}
```

Ikkinchi qoida — **ikki marta bosilishdan himoya**. Foydalanuvchi tugmani ikki marta bosishi tabiiy:

```js
const saving = ref(false)

async function onSubmit() {
  if (saving.value) return
  saving.value = true

  try {
    await saveUser(form)
  } finally {
    saving.value = false
  }
}
```

```vue
<button :disabled="saving" @click="onSubmit">{{ saving ? 'Saqlanmoqda…' : 'Saqlash' }}</button>
```

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `@click="save()"` metodga hodisa kerak bo'lganda | Qavs bilan yozilsa `$event` avtomatik kelmaydi | `@click="save"` yoki `@click="save($event)"` |
| `@submit="save"` da `preventDefault` ni unutish | Sahifa qayta yuklanadi | `@submit.prevent="save"` |
| Ichki tugmada `.stop` ni unutish | Ota elementning hodisasi ham ishlaydi | `@click.stop` |
| `window` tinglovchisini tozalamaslik | Xotira oqishi, komponent o'chgach ham ishlaydi | `onUnmounted` da `removeEventListener` |
| Ikki marta bosishdan himoyasiz forma | Ikkita buyurtma yaratiladi | `saving` bayrog'i + `:disabled` |
| `@keyup.enter` ni `textarea` da ishlatish | Yangi qator kiritish buziladi | `@keydown.enter.exact` yoki `.ctrl.enter` |
| Hodisa ishlov beruvchisida `v-for` indeksiga tayanish | Ro'yxat o'zgarsa noto'g'ri element | ID uzating |

## Amaliyot

1. Modal yasang: backdrop'ga `@click.self="close"`, `Escape` uchun `window` tinglovchisi (tozalash bilan).
2. `Cmd/Ctrl + K` bilan ochiladigan qidiruv oynasini qiling (`@keydown.meta.k.prevent`).
3. Formaga ikki marta bosishdan himoya qo'shing va tarmoqni sekinlashtirib (DevTools → Network → Slow 3G) sinab ko'ring.
4. Ota va bola elementga `@click` qo'yib, `.stop`, `.self`, `.capture` ning har birini navbat bilan sinab, konsolga tartibni chiqaring.

## Rasmiy hujjat

- Hodisalar: <https://vuejs.org/guide/essentials/event-handling.html>
- Modifikatorlar ro'yxati: <https://vuejs.org/api/built-in-directives.html#v-on>
