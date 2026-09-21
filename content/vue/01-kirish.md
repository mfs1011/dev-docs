# 01 — Vue nima va nega shunday

[Mundarija](README.md) · [Keyingi: O'rnatish va ishga tushirish →](02-ornatish-va-ishga-tushirish.md)

## Tushuncha

Vue — foydalanuvchi interfeysi quradigan JavaScript framework'i. Uning ishi bitta jumlaga sig'adi: **ma'lumot o'zgarsa, ekran o'zi o'zgarsin.**

Bu nimani anglatishini ko'rish uchun avval Vue'siz yozib ko'ramiz. Tugma bosilganda sanoqni oshiradigan eng oddiy interfeys:

```html
<p>Bosildi: <span id="output">0</span> marta</p>
<button id="btn">Bosish</button>

<script>
  let count = 0
  const output = document.getElementById('output')

  document.getElementById('btn').addEventListener('click', () => {
    count++
    output.textContent = count      // ← qo'lda yangilash
  })
</script>
```

E'tibor bering: `count` o'zgargandan keyin biz **qo'lda** `output.textContent` ni yangilashimiz kerak. Bu yerda ikkita mustaqil haqiqat bor — JavaScript'dagi `count` va DOM'dagi matn — va ularni sinxron ushlab turish dasturchining zimmasida.

Endi xuddi shu narsa Vue'da:

::: options
```js
import { createApp } from 'vue'

createApp({
  data() {
    return { count: 0 }
  },
}).mount('#app')
```
:::

::: composition
```js
import { createApp, ref } from 'vue'

createApp({
  setup() {
    const count = ref(0)

    return { count }
  },
}).mount('#app')
```
:::

```html
<div id="app">
  <p>Bosildi: {{ count }} marta</p>
  <button @click="count++">Bosish</button>
</div>
```

`output.textContent = count` qatori yo'q. Biz faqat `count` ni oshiramiz — DOM'ni Vue yangilaydi. Qo'llanmaning qolgan qismi asosan shu bitta jumlaning oqibatlari haqida.

Vue ikki g'oyaga tayanadi:

1. **Deklarativ render.** Shablonda "DOM qanday ko'rinishi kerak" ni holatning funksiyasi sifatida yozasiz: `UI = f(state)`. "Qanday qilib shu holatga o'tish kerak" ni Vue hal qiladi.
2. **Reaktivlik.** Vue qaysi ma'lumot qaysi joyda ishlatilganini **kuzatib turadi**, shuning uchun o'zgarganda faqat kerakli joyni yangilaydi.

## Nega shunday

### Nega deklarativ

Imperativ (qo'lda DOM yangilaydigan) kod kichik misolda soddaroq ko'rinadi. Muammo o'sishda boshlanadi: ekranda 40 ta element bo'lsa, har bir holat o'zgarishi uchun "qaysi elementni qanday yangilash kerak" ni yozish — bu holatlar **kombinatsiyasi** bo'yicha o'sadigan kod. `isLoading && hasError && isEmpty` uchligining 8 ta kombinatsiyasi bor va imperativ kodda har biriga alohida o'tish yo'li kerak.

Deklarativ yondashuvda siz faqat **oxirgi ko'rinish**ni tasvirlaysiz. Kombinatsiyalar soni o'zgarmaydi, lekin ular haqidagi kod chiziqli o'sadi: har bir shart shablonda bir marta yoziladi.

### Nega reaktivlik (va nega React'nikidan boshqacha)

Interfeysni yangilashning ikki maktabi bor:

| Yondashuv | Kim | Qanday ishlaydi |
| --- | --- | --- |
| Qayta ishga tushirish | React | Holat o'zgarsa, komponent funksiyasi butunlay qayta chaqiriladi; farq virtual DOM solishtiruvi orqali topiladi |
| Kuzatuv (reaktivlik) | Vue, Svelte, Solid | Har bir ma'lumot o'qilganda kim o'qiganini eslab qoladi; o'zgarganda faqat o'sha "obunachilar" qayta ishlaydi |

Vue'da `count` o'zgarsa, `count` ishlatilgan joygina qayta hisoblanadi. Buning amaliy natijasi: **memoizatsiya qo'lda qilinmaydi.** React'da `useMemo`, `useCallback`, `React.memo` — bu qayta ishga tushirish modelining narxi. Vue'da bunday qavatlar deyarli kerak emas, chunki bog'liqlik grafi allaqachon aniq.

Buning narxi ham bor: Vue ma'lumotni **o'rab** oladi (`ref`, `reactive` → Proxy), shuning uchun "oddiy JavaScript o'zgaruvchisi" bilan reaktiv qiymat orasida farq paydo bo'ladi — mana shu `.value` ning kelib chiqishi. 07-bobda buni ichkarisidan ko'ramiz.

### Nega "progressive framework"

Vue o'zini shunday ataydi, chunki uni **bosqichma-bosqich** qo'shish mumkin:

- Bitta HTML sahifaga `<script>` teg orqali — build qadamisiz, jQuery o'rniga;
- Mavjud serverda render qilinadigan ilovaning bitta bo'lagi sifatida (Laravel/Symfony blade/twig ichida);
- To'liq SPA sifatida (router + store + build);
- Server'da render qilinadigan universal ilova sifatida (Nuxt).

Bir xil sintaksis, bir xil komponent modeli — faqat atrofdagi qatlam boshqacha. 04-bobda beshta usulni ham ko'rib chiqamiz.

## Kod: birinchi to'liq komponent

Quyidagi — bitta fayldagi komponent (Single-File Component, SFC). Uchta blok: shablon, mantiq, uslub.

::: options
```vue
<script>
export default {
  data() {
    return {
      title: 'Vazifalar',
      items: ['Sut olish', 'Vue o\'rganish'],
      draft: '',
    }
  },
  computed: {
    count() {
      return this.items.length
    },
  },
  methods: {
    add() {
      const value = this.draft.trim()
      if (!value) return

      this.items.push(value)
      this.draft = ''
    },
  },
}
</script>

<template>
    <section>
        <h2>{{ title }} ({{ count }})</h2>

        <form @submit.prevent="add">
            <input v-model="draft" placeholder="Yangi vazifa">
            <button type="submit">Qo'shish</button>
        </form>

        <ul>
            <li v-for="item in items" :key="item">{{ item }}</li>
        </ul>
    </section>
</template>

<style scoped>
section { max-width: 360px; }
</style>
```
:::

::: composition
```vue
<script setup>
import { computed, ref } from 'vue'

const title = 'Vazifalar'
const items = ref(['Sut olish', 'Vue o\'rganish'])
const draft = ref('')

const count = computed(() => items.value.length)

function add() {
  const value = draft.value.trim()
  if (!value) return

  items.value.push(value)
  draft.value = ''
}
</script>

<template>
    <section>
        <h2>{{ title }} ({{ count }})</h2>

        <form @submit.prevent="add">
            <input v-model="draft" placeholder="Yangi vazifa">
            <button type="submit">Qo'shish</button>
        </form>

        <ul>
            <li v-for="item in items" :key="item">{{ item }}</li>
        </ul>
    </section>
</template>

<style scoped>
section { max-width: 360px; }
</style>
```
:::

Shu 30 qatorda Vue'ning deyarli butun kundalik lug'ati bor: holat, hisoblanuvchi qiymat, hodisa, ro'yxat, ikki tomonlama bog'lanish, komponentga tegishli CSS. Har biri keyingi boblarda alohida ochiladi.

## Muhandislik nuqtai nazari: `UI = f(state)` nimani anglatadi

Bu formula matematik hazil emas, u ikkita amaliy qoidani keltirib chiqaradi.

**1. Haqiqatning yagona manbai (single source of truth).** Agar ekranda ko'ringan narsa holatdan kelib chiqsa, DOM'ni "o'qib" qaror qabul qilish — xato. Masalan, tugma faolligini `button.disabled` dan tekshirish o'rniga, holatdagi `isSubmitting` dan tekshiriladi. DOM — natija, manba emas.

**2. Hosila ma'lumotni saqlamang, hisoblang.** `items` bor bo'lsa, `count` ni alohida holatda saqlash — ikkita haqiqat manbai demakdir va ular albatta bir kun farq qiladi (masalan, element o'chirildi-yu, `count` kamaymadi). Shuning uchun `count` — `computed` (10-bob).

Xuddi shu mantiq server tomonda ham tanish: normalizatsiya qilingan ma'lumotlar bazasida hosila qiymat ustun sifatida saqlanmaydi, `COUNT(*)` bilan hisoblanadi yoki ataylab denormalizatsiya qilinadi. Frontendda ham tanlov aynan shunday: hisoblash (to'g'rilik) yoki keshlash (tezlik) — va `computed` ikkalasini birga beradi, chunki natijani keshlab, bog'liqlik o'zgarganda o'zi bekor qiladi.

## Muhandislik nuqtai nazari: framework tanlash mezonlari

"Vue yaxshimi yoki React?" — noto'g'ri savol. To'g'ri savollar:

| Mezon | Vue holati |
| --- | --- |
| Jamoa tajribasi | HTML/CSS kuchli jamoa uchun kirish narxi past: shablon — kengaytirilgan HTML |
| Tayyor yechimlar | Router va store **rasmiy** (vue-router, pinia) — arxitektura bahsi kamayadi |
| Build'siz ishlata olish | Ha, `<script src>` orqali; React'da amalda yo'q |
| Migratsiya yo'li | Progressive: sahifaning bir bo'lagidan boshlash mumkin |
| Ish bozori | React'dan kichikroq, lekin Osiyo va Yevropa'da kuchli; Nuxt ekotizimi barqaror |
| Ichki murakkablik | Reaktivlik "sehrli" tuyuladi — 07 va 17-boblarni o'tmasdan debug qilish qiyin |

Vue tanlashga eng kuchli sabab — **bir xil vazifani bajarish uchun kamroq qaror qabul qilish kerak**: routing, store, build, SFC formati — hammasi standart. Eng kuchli sabab qarshi — ekotizimning React'dagi kabi ulkan emasligi (ba'zi niche kutubxonalar yo'q).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Vue ichida `document.getElementById()` bilan DOM'ni o'zgartirish | Vue keyingi renderda o'z holatiga qaytaradi — o'zgarish yo'qoladi yoki "miltillaydi" | Holatni o'zgartiring, DOM'ni Vue yangilasin (18-bob: haqiqatan DOM kerak bo'lsa `ref`) |
| Hosila qiymatni alohida `data`/`ref` da saqlash | Ikki manba bir kun farq qiladi | `computed` (10-bob) |
| Vue 2 bo'yicha eski maqolalarga qarab yozish | `Vue.set`, filtrlar, `beforeDestroy` — 3-versiyada yo'q yoki boshqacha | Faqat 3.x hujjatiga tayaning (vuejs.org), Vue 2 hujjati v2.vuejs.org'da alohida |
| "Framework o'rganish" ni JavaScript o'rniga qo'yish | `map/filter`, `async/await`, modul tizimini bilmasdan Vue kodi tushunarsiz qoladi | Avval JS asoslari — Vue ularning ustiga qo'shimcha 10 ta tushuncha qo'shadi, xolos |

## Amaliyot

1. Yuqoridagi "Vazifalar" komponentini qog'ozda imperativ (DOM API) uslubda yozib chiqing. Nechta qator chiqdi, qaysi joylarda `count` ni yangilashni unutish mumkin?
2. Shablondagi `{{ count }}` ni `{{ items.length }}` ga almashtiring. Natija bir xil. Nega baribir `computed` afzal? (Javob 10-bobda — lekin avval o'zingiz taxmin qiling.)
3. Bu qo'llanmaning yuqorisidagi `Options` / `Composition` almashtirgichini bosing va shu bobdagi ikkala variantni solishtiring. Farqni bitta jumlada yozib qo'ying — 05-bobda tekshirasiz.

## Rasmiy hujjat

- Kirish: <https://vuejs.org/guide/introduction.html>
- Vue'dan foydalanish usullari: <https://vuejs.org/guide/extras/ways-of-using-vue.html>
- Reaktivlik chuqur: <https://vuejs.org/guide/extras/reactivity-in-depth.html>
