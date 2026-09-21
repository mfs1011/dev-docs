# 35 — `<Teleport>`

[← Oldingi: KeepAlive](34-keepalive.md) · [Mundarija](README.md) · [Keyingi: Suspense →](36-suspense.md)

## Tushuncha

`<Teleport>` komponent mazmunini DOM daraxtining **boshqa joyiga** ko'chiradi, mantiqiy joylashuvni esa o'zgartirmaydi:

```vue
<template>
    <div class="card">
        <button @click="open = true">Ochish</button>

        <Teleport to="body">
            <div v-if="open" class="modal">
                <p>Men `body` ichida turibman, lekin holatim shu komponentda.</p>
                <button @click="open = false">Yopish</button>
            </div>
        </Teleport>
    </div>
</template>
```

DOM'da modal `<body>` ning bevosita bolasi bo'ladi, lekin props, emit, `provide/inject` va reaktivlik — hammasi joyida ishlaydi.

## Nega shunday: CSS tuzog'i

Modal, tooltip va dropdown'ni ota element ichida qoldirish uchta muammo tug'diradi:

1. **`overflow: hidden`** — ota elementda bo'lsa, modal kesiladi;
2. **`transform`, `filter`, `will-change`** — ota elementda bo'lsa, `position: fixed` unga nisbatan hisoblanadi (CSS spetsifikatsiyasi: bu xossalar yangi "containing block" yaratadi) va modal ekran markaziga tushmaydi;
3. **`z-index` stacking context** — ota `z-index: 1` bo'lsa, ichidagi `z-index: 9999` ham uning ustidan chiqa olmaydi.

Bu muammolarni CSS bilan hal qilib bo'lmaydi. Yagona yechim — elementni DOM'da yuqoriga ko'chirish, ya'ni teleport.

## Kod: maqsad tanlash

```vue
<!-- CSS selektor -->
<Teleport to="body">…</Teleport>
<Teleport to="#modals">…</Teleport>

<!-- Element havolasi -->
<Teleport :to="containerEl">…</Teleport>

<!-- Shartli: `disabled` bo'lsa joyida qoladi -->
<Teleport to="body" :disabled="isMobile">…</Teleport>
```

`disabled` foydali bo'ladigan holat: desktopda modal `body` da, mobilda esa oddiy blok sifatida oqimda ko'rinadi.

Maqsad element `mount` paytida **mavjud bo'lishi shart**. `index.html` ga qo'shib qo'yish odatiy yo'l:

```html
<body>
    <div id="app"></div>
    <div id="modals"></div>
</body>
```

## Kod: bir nechta teleport bitta maqsadga

```vue
<Teleport to="#modals"><ModalA v-if="a" /></Teleport>
<Teleport to="#modals"><ModalB v-if="b" /></Teleport>
```

Ular **ketma-ket** qo'shiladi (oxirgisi pastda), ya'ni bir-birini o'chirmaydi. Bir nechta modal ochilsa, ustma-ust chiqish tartibi DOM tartibi bilan belgilanadi.

## Kod: Transition bilan

```vue
<Teleport to="body">
    <Transition name="modal">
        <div v-if="open" class="modal-backdrop" @click.self="open = false">
            <div class="modal-dialog">
                <slot />
            </div>
        </div>
    </Transition>
</Teleport>
```

Tartib: `Teleport` tashqarida, `Transition` ichkarida.

## Kod: to'liq modal komponenti

```vue
<!-- UiModal.vue -->
<script setup>
import { onUnmounted, watch } from 'vue'

const open = defineModel('open', { type: Boolean, default: false })

// Orqa fon scroll qilmasin
watch(open, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
})

onUnmounted(() => {
  document.body.style.overflow = ''
})

function onKeydown(event) {
  if (event.key === 'Escape') open.value = false
}

watch(open, (isOpen) => {
  if (isOpen) document.addEventListener('keydown', onKeydown)
  else document.removeEventListener('keydown', onKeydown)
})

onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
    <Teleport to="body">
        <Transition name="modal">
            <div
                v-if="open"
                class="modal-backdrop"
                role="dialog"
                aria-modal="true"
                @click.self="open = false"
            >
                <div class="modal-dialog">
                    <slot />
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
```

Erishimlilik uchun yetishmayotgani (64-bob): fokus tuzog'i (focus trap), ochilishda fokusni ichkariga olish va yopilganda qaytarish. Amalda bu qismni tayyor kutubxonadan olish ma'qul (`focus-trap`, Radix Vue, Headless UI).

## Muhandislik nuqtai nazari: SSR va teleport

Serverda `body` hali "mavjud emas" — Vue teleport mazmunini alohida render qiladi va klientda joyiga qo'yadi. Bu bir nechta nozik joy tug'diradi:

- Maqsad element SSR chiqishida bo'lishi kerak (`index.html` da statik yozilgan bo'lsa — muammo yo'q);
- Teleport ichida `onMounted` ga tayanadigan kod SSR'da ishlamaydi (normal);
- Nuxt'da `<ClientOnly>` bilan o'rash ko'p hollarda soddaroq yechim (59-bob).

## Muhandislik nuqtai nazari: modal arxitekturasi

Uch yondashuv bor:

**1. Lokal modal** — komponent ichida `v-if` bilan:

```vue
<UiModal v-model:open="showConfirm">O'chirilsinmi?</UiModal>
```

Sodda, lekin har joyda takrorlanadi.

**2. Modal xizmati** (store yoki plugin):

```js
const { confirm } = useDialog()

async function remove() {
  if (await confirm('O\'chirilsinmi?')) await api.delete(`/items/${id}`)
}
```

Chaqiruv joyida `await` bilan ishlaydi — kod tabiiy o'qiladi. Ichkarida modal komponenti bitta joyda (`App.vue` da) turadi va store orqali boshqariladi.

**3. Router modal** — modal URL bilan bog'lanadi (`/products/12/edit`). Havola ulashiladi, orqaga tugmasi ishlaydi. Murakkabroq, lekin "modal ochiq holat" ni ham URL'ga chiqaradi (40-bob).

Kichik ilovada 1, o'rtachada 2, murakkab ilovada 3.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Maqsad element mount paytida mavjud emas | "Invalid Teleport target" xatosi | `index.html` da statik element |
| `scoped` CSS teleport ichida ishlamasligidan hayron bo'lish | `data-v-` atributi qo'yiladi, lekin ota selektor zanjiri buziladi | Global class yoki `:deep()` |
| Modal ochilganda `body` scroll'ini bloklamaslik | Orqa fon aylanadi | `overflow: hidden` + tozalash |
| `Escape` va backdrop bosilishini qo'shmaslik | Klaviatura foydalanuvchilari qamalib qoladi | `@click.self`, `keydown` |
| Fokusni boshqarmaslik | Skrinriderlar modalni ko'rmaydi | `aria-modal`, focus trap (64-bob) |
| Teleport'ni `v-if` bilan o'rash (`<Teleport v-if>`) | Ichidagi holat har safar yo'qoladi | `v-if` ni ichidagi elementga qo'ying |

## Amaliyot

1. `UiModal` ni yozing: `v-model:open`, `Escape`, backdrop, body scroll bloki.
2. Modal ichiga uzun ro'yxat qo'ying va `overflow: hidden` bo'lgan ota element ichida `Teleport` siz sinab ko'ring — kesilishini kuzating.
3. `:disabled="isMobile"` bilan mobil variantni yasang.
4. `useDialog()` xizmatini yozing: `await confirm('...')` naqshi ishlasin.

## Rasmiy hujjat

- Teleport: <https://vuejs.org/guide/built-ins/teleport.html>
- `<Teleport>` API: <https://vuejs.org/api/built-in-components.html#teleport>
