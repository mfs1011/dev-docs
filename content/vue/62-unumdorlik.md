# 62 — Unumdorlik

[← Oldingi: SEO va meta](61-seo-va-meta.md) · [Mundarija](README.md) · [Keyingi: Bundle va yuklanish →](63-bundle-va-yuklash.md)

## Tushuncha

Vue ilovalarida sekinlik odatda to'rt sababdan biri:

| Sabab | Belgisi | Bob |
| --- | --- | --- |
| Juda ko'p DOM tuguni | Ro'yxat/jadval sekin aylanadi | shu bob |
| Ortiqcha qayta render | Har harfda butun sahifa yangilanadi | shu bob |
| Og'ir hisob | Input javobi kechikadi | shu bob |
| Katta bundle | Birinchi yuklanish sekin | 63-bob |

Har biri boshqacha hal qilinadi, shuning uchun **avval o'lchash** kerak (46-bob): Vue DevTools Timeline va Chrome Performance.

## Kod: 1 — kamroq DOM

Eng samarali optimizatsiya — elementlarni umuman render qilmaslik.

```js
// Sahifalash
const visible = computed(() => items.value.slice((page.value - 1) * 50, page.value * 50))
```

Virtualizatsiya — faqat ko'rinadigan qatorlarni render qilish:

```bash
npm i vue-virtual-scroller
```

```vue
<script setup>
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
</script>

<template>
    <RecycleScroller
        v-slot="{ item }"
        :items="rows"
        :item-size="48"
        key-field="id"
        class="scroller"
    >
        <UserRow :user="item" />
    </RecycleScroller>
</template>
```

10 000 qator uchun DOM'da 20–30 element qoladi. Chegara: har qator balandligi ma'lum bo'lishi kerak (yoki `DynamicScroller` ishlatiladi).

## Kod: 2 — kamroq render

```vue
<!-- ✗ Har renderda yangi obyekt/funksiya → bola qayta render (46-bob) -->
<UserCard v-for="u in users" :key="u.id" :config="{ compact: true }" @select="() => pick(u)" />

<!-- ✓ -->
<script setup>
const cardConfig = { compact: true }
</script>

<UserCard v-for="u in users" :key="u.id" :config="cardConfig" @select="pick" />
```

Katta statik bo'laklar uchun:

```vue
<!-- Bir marta render qilinadi va muzlatiladi -->
<div v-once>
    <ComplexStaticHeader />
</div>

<!-- Faqat ko'rsatilgan bog'liqlik o'zgarganda qayta render -->
<TableRow v-for="row in rows" :key="row.id" v-memo="[row.id, row.selected]" :row="row" />
```

`v-memo` — o'lchangan muammo uchun oxirgi chora: massivdagi qiymatlar o'zgarmasa, Vue butun pastki daraxtni o'tkazib yuboradi. Noto'g'ri ro'yxat bersangiz, eskirgan ko'rinish qoladi — shuning uchun ehtiyot bilan.

## Kod: 3 — arzonroq reaktivlik

```js
// Katta, faqat butunlay almashtiriladigan ma'lumot (17-bob)
const rows = shallowRef([])

// Tashqi kutubxona nusxasi
const chart = shallowRef(markRaw(new Chart(el, config)))

// Chuqur kuzatuv o'rniga aniq maydon (16-bob)
watch(() => state.filters.query, onQueryChange)      // `deep: true` emas
```

`shallowRef` 10 000 elementli massivda sezilarli farq beradi: Vue har obyektni Proxy bilan o'ramaydi.

## Kod: 4 — og'ir hisobni siqib chiqarish

```js
// Debounce: har harfda emas, to'xtaganda (16-bob)
const query = ref('')
const debounced = refDebounced(query, 300)           // VueUse
const results = computed(() => search(debounced.value))

// Web Worker: asosiy oqimni bloklamaslik
const worker = new Worker(new URL('./heavy.worker.js', import.meta.url), { type: 'module' })

worker.postMessage({ rows: toRaw(rows.value) })
worker.onmessage = (event) => (result.value = event.data)
```

Web Worker kerak bo'ladigan chegara: hisob **50 ms** dan uzoq bo'lsa, foydalanuvchi kechikishni sezadi (INP ko'rsatkichi, 61-bob).

## Kod: 5 — rasmlar va shriftlar

```html
<!-- Birinchi ekran: tez, o'lcham bilan (CLS) -->
<img src="/hero.avif" width="1200" height="600" fetchpriority="high" alt="...">

<!-- Qolganlari -->
<img src="/thumb.avif" width="320" height="180" loading="lazy" decoding="async" alt="...">
```

```css
@font-face {
    font-family: 'Inter';
    src: url('/fonts/inter.woff2') format('woff2');
    font-display: swap;          /* matn shrift kelguncha ko'rinadi */
}
```

Amalda rasm optimizatsiyasi ko'pincha JS optimizatsiyasidan ko'ra ko'proq foyda beradi: 2 MB PNG bitta kartinada butun bundle'dan katta bo'lishi mumkin.

## Kod: o'lchash

```js
// 1. Render sabablarini topish (faqat dev)
onRenderTriggered((event) => console.log('render:', event.key, event.type))

// 2. Vue Performance markerlari
app.config.performance = true

// 3. Real foydalanuvchilar ko'rsatkichlari (68-bob)
import { onCLS, onINP, onLCP } from 'web-vitals'

onLCP((metric) => sendToAnalytics(metric))
onINP((metric) => sendToAnalytics(metric))
onCLS((metric) => sendToAnalytics(metric))
```

Lokal mashinada hammasi tez ko'rinadi. Haqiqiy tasvir uchun: DevTools → Performance → CPU 4× slowdown + Network Slow 4G.

## Muhandislik nuqtai nazari: optimizatsiya tartibi

Foydali tartib — eng ko'p foyda beradigandan boshlash:

1. **Kamroq ma'lumot yuklash** (sahifalash, `pick`, 60-bob)
2. **Kamroq DOM** (virtualizatsiya, `v-if`)
3. **Kamroq JS** (code splitting, 63-bob)
4. **Kamroq render** (barqaror props, `v-memo`)
5. **Arzonroq reaktivlik** (`shallowRef`)
6. **Mikro-optimizatsiya** (deyarli hech qachon kerak emas)

Boshlovchilar odatda 5–6 dan boshlaydi va 1–3 e'tibordan chetda qoladi. 10 000 qatorni `shallowRef` bilan render qilish — baribir 10 000 DOM tuguni.

## Muhandislik nuqtai nazari: budjetlar

Raqamlarsiz "tez" degan gap ma'nosiz. Amaliy budjet:

| Ko'rsatkich | Maqsad |
| --- | --- |
| LCP | < 2.5 s (4G, o'rta telefon) |
| INP | < 200 ms |
| CLS | < 0.1 |
| Boshlang'ich JS | < 200 KB gzip |
| Marshrut chunk'i | < 100 KB gzip |
| Ro'yxatdagi DOM tugunlari | < 1 500 |

CI'da tekshirish mumkin (63-bob): bundle hajmi oshsa — PR ogohlantiradi.

## Muhandislik nuqtai nazari: erta optimizatsiya tuzog'i

```vue
<!-- ✗ 20 elementli ro'yxatga virtualizatsiya -->
<RecycleScroller :items="twentyItems" />

<!-- ✗ Har komponentga v-memo -->
<UserCard v-memo="[user]" :user="user" />
```

Bu kod murakkablashtiradi, xato xavfini oshiradi va hech qanday o'lchanadigan foyda bermaydi. Qoida: **optimizatsiya — o'lchangan muammoga javob**, odat emas.

Teskarisi ham to'g'ri: 5 000 qatorli jadvalni "keyinroq tuzatamiz" deb qoldirish — foydalanuvchi uchun ilova buzilgan degani.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| O'lchamasdan optimizatsiya qilish | Vaqt behuda, kod murakkablashadi | DevTools Timeline |
| Katta ro'yxatni to'liq render qilish | Sahifa qotadi | Sahifalash/virtualizatsiya |
| Shablonda inline obyekt/funksiya | Bola har renderda yangilanadi | Konstanta/`computed` |
| `deep: true` watcher katta obyektda | Har o'zgarishda to'liq aylanish | Aniq maydon |
| Og'ir hisobni asosiy oqimda | INP yomonlashadi | Debounce yoki Worker |
| Rasm o'lchamlarini bermaslik | CLS | `width`/`height` |
| `v-memo` ni noto'g'ri ro'yxat bilan | Eskirgan ko'rinish | Barcha ishlatilgan qiymatlarni kiriting |

## Amaliyot

1. 5 000 qatorli jadval yasang va render vaqtini o'lchang. Keyin sahifalash, so'ng virtualizatsiya qo'shib, uch natijani solishtiring.
2. Bolaga inline obyekt uzating va DevTools Timeline'da ortiqcha renderni ko'ring; tuzating.
3. `onRenderTriggered` bilan bitta komponentning qayta render sabablarini ro'yxatlang.
4. Og'ir hisobni (masalan 1 mln elementni saralash) Web Worker'ga ko'chiring va INP farqini o'lchang.
5. CPU 4× slowdown bilan ilovangizni aylanib chiqing: qaysi ekran eng sekin?

## Rasmiy hujjat

- Unumdorlik: <https://vuejs.org/guide/best-practices/performance.html>
- `v-memo`: <https://vuejs.org/api/built-in-directives.html#v-memo>
- web-vitals: <https://github.com/GoogleChrome/web-vitals>
