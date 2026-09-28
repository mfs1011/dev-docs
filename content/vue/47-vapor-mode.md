# 47 — Vapor mode va Vue 3.6

[← Oldingi: Render mexanizmi](46-render-mexanizmi.md) · [Mundarija](README.md) · [Keyingi: TypeScript'ni sozlash →](48-typescript-sozlash.md)

## Tushuncha

Vue 3.6 ikkita katta o'zgarish olib keladi:

1. **Vapor mode** — virtual DOM'siz kompilyatsiya rejimi: shablon to'g'ridan-to'g'ri DOM ko'rsatmalariga aylanadi;
2. **Yangi reaktivlik yadrosi** — `@vue/reactivity` alien-signals asosida qayta yozilgan: tezroq va kamroq xotira.

> **Status (2026-yil sentabr):** barqaror versiya — **3.5.43**. 3.6 hozircha **RC** bosqichida (`3.6.0-rc.9`). Ya'ni API to'plami tugallangan, lekin production'da ishlatishdan oldin barqaror relizni kutish to'g'ri bo'ladi. Versiyani o'zingiz tekshiring: `npm view vue dist-tags`.

## Nega shunday: virtual DOM narxi

46-bobda ko'rdik: Vue kompilyatori patch flag va blok daraxti bilan virtual DOM ishini keskin kamaytiradi. Lekin baribir har renderda VNode obyektlari yaratiladi va solishtiriladi.

Vapor mode bu qatlamni butunlay olib tashlaydi. Shablon shunday kodga aylanadi:

```js
// Taxminiy Vapor natijasi (soddalashtirilgan)
const n0 = document.createElement('p')
const n1 = document.createTextNode('')

n0.appendChild(n1)

renderEffect(() => {
  n1.data = count.value          // faqat shu matn tuguni yangilanadi
})
```

Ya'ni bog'lanish **DOM tuguni darajasida** o'rnatiladi: `count` o'zgarsa, komponent qayta render qilinmaydi — bitta `textNode.data` yoziladi. Bu Solid va Svelte 5 ishlatadigan yondashuv va uchinchi tomon benchmarklarida Vapor ular bilan bir darajada natija ko'rsatgan.

Qo'shimcha yutuq — **bundle hajmi**: Vapor faqat o'zi kerak bo'lgan runtime bo'lagini olib keladi, virtual DOM kodi bundle'ga umuman kirmaydi (agar ilovada VDOM komponentlari bo'lmasa).

## Kod: Vapor komponent

```vue
<script setup vapor>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
    <button @click="count++">Bosildi: {{ count }}</button>
</template>
```

Butun ilovani Vapor'da ishga tushirish:

```js
import { createVaporApp } from 'vue'
import App from './App.vue'

createVaporApp(App).mount('#app')
```

Aralash rejim ham mumkin: Vapor ilovasi ichida VDOM komponentini va aksincha ishlatish uchun `vaporInteropPlugin` beriladi.

## Kod: Vapor cheklovlari

Vapor — **to'liq API emas, ataylab tanlangan qism**:

| Qo'llab-quvvatlanadi | Qo'llab-quvvatlanmaydi |
| --- | --- |
| `<script setup>` va shablon | Options API |
| `ref`, `computed`, `watch`, composable'lar | Render funksiyalari / JSX |
| Props, emits, slotlar, `provide`/`inject` | `<Transition>` ning ba'zi rejimlari (RC bosqichida cheklangan) |
| Direktivalar (asosiy to'plam) | Ba'zi ichki komponentlar (holat RC davomida o'zgarmoqda) |

Shuning uchun Vapor "hamma narsani almashtiradi" degani emas: u **opt-in** — qaysi komponentni Vapor qilishni o'zingiz tanlaysiz.

## Kod: yangi reaktivlik yadrosi

3.6 dagi ikkinchi o'zgarish foydalanuvchiga ko'rinmaydi: `ref`, `computed`, `watch` — hammasi o'sha-o'sha API. Lekin ichkarida bog'liqliklarni kuzatish alien-signals algoritmiga ko'chirilgan:

- Bog'liqlik grafi yengilroq tuzilma bilan saqlanadi → kamroq xotira;
- Yangilanishlarni tarqatish (propagation) tezroq;
- Chuqur `computed` zanjirlarida sezilarli farq.

Sizning kodingizda hech narsa o'zgarmaydi — bu "bepul tezlik" turidagi yangilanish. Shuning uchun 3.6 ga o'tish, Vapor'ni ishlatmasangiz ham, foydali.

## Kod: 3.5 va 3.6 orasidagi boshqa o'zgarishlar

3.5 da kelgan va hozir barqaror bo'lgan narsalar (ular qo'llanmada allaqachon ishlatilgan):

| Imkoniyat | Bob |
| --- | --- |
| `useTemplateRef()` | 18 |
| `useId()` — SSR'ga xavfsiz noyob id | 45 |
| Props destrukturizatsiyasi reaktiv qoladi | 17, 22 |
| `onWatcherCleanup()` | 16 |
| Lazy hydration (`hydrateOnVisible` va h.k.) | 28 |
| `watch` uchun `deep: <son>` | 16 |

3.6 esa asosan ichki o'zgarishlar + Vapor olib keladi; sintaksis darajasida yangi narsa kam.

## Muhandislik nuqtai nazari: o'tish kerakmi

| Vaziyat | Tavsiya |
| --- | --- |
| Mavjud production ilova | 3.6 barqaror chiqqach oddiy minor yangilanish sifatida o'ting; Vapor'ni darhol yoqmang |
| Unumdorlik muammosi bor ekran (katta jadval, real-time grafik) | O'sha **bitta komponentni** Vapor qilib sinab ko'ring |
| Yangi loyiha, RC bilan tajriba | Mumkin, lekin CI'da versiyani qat'iy qulflang (`npm ci` + lock) |
| Options API'da yozilgan kod | Vapor ishlamaydi — avval Composition API'ga ko'chirish kerak (05-bob) |

Eng muhim qoida: **Vapor — optimizatsiya vositasi, arxitektura qarori emas.** Avval 62-bobdagi oddiy usullarni (virtualizatsiya, `shallowRef`, kamroq element) qo'llang; ular ko'p hollarda yetarli va hech qanday RC'ga bog'liqlik keltirmaydi.

## Muhandislik nuqtai nazari: signal'lar dunyosi

Vapor mode Vue'ni Solid, Svelte 5 (runes), Angular (signals), Preact signals bilan bir qatorga qo'yadi — hammasi bir xil g'oyaga keldi:

> Komponentni qayta ishga tushirish o'rniga, **qiymatni ishlatgan aniq joyni** yangilash.

07-bobdagi `track`/`trigger` mexanizmi aynan shu. Vue'ning farqi — u bu g'oyani **mavjud API'ni buzmasdan** olib kirmoqda: `ref` va `computed` o'zgarmaydi, faqat kompilyator boshqa kod chiqaradi.

Amaliy xulosa: reaktivlikni tushunish (07, 17-boblar) endi yanada foydali — u nafaqat Vue'da, balki butun zamonaviy frontend'da bir xil tushuncha.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Production'ga RC versiyani chiqarish | API o'zgarishi mumkin, xatolar bor | Barqaror relizni kuting |
| Vapor'ni Options API bilan ishlatishga urinish | Qo'llab-quvvatlanmaydi | Composition API'ga ko'chiring |
| "Vapor tez ekan" deb butun ilovani ko'chirish | Ko'p ish, foyda o'lchanmagan | Avval o'lchang (46-bob), keyin nuqtaviy qo'llang |
| 3.6 ga o'tishni "katta migratsiya" deb kutish | U minor versiya, API buzilmaydi | Oddiy yangilanish + regress testlar |
| Versiyalarni maqoladan o'qib ishonish | Tez eskiradi | `npm view vue dist-tags` bilan tekshiring |

## Amaliyot

1. `npm view vue dist-tags` ni ishga tushiring: bugungi barqaror va RC versiyalarni yozib qo'ying.
2. Test loyihada `vue@rc` ni o'rnatib, bitta komponentga `<script setup vapor>` qo'ying va ishlashini tekshiring (alohida branchda).
3. Katta ro'yxatli komponentni oldin 62-bobdagi usullar bilan, keyin Vapor bilan o'lchang — farqni raqamlarda solishtiring.
4. Vue changelog'ini o'qing va 3.6 da o'zingizga tegishli o'zgarishlar bor-yo'qligini aniqlang.

## Rasmiy hujjat

- Vue core changelog: <https://github.com/vuejs/core/blob/main/CHANGELOG.md>
- Vapor mode muhokamasi: <https://github.com/orgs/vuejs/discussions/13134>
- alien-signals: <https://github.com/stackblitz/alien-signals>
