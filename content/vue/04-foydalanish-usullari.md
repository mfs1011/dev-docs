# 04 — Vue'dan foydalanish usullari

[← Oldingi: Ilova yaratish va sozlash](03-ilova-yaratish.md) · [Mundarija](README.md) · [Keyingi: Ikki API uslubi →](05-ikki-api-uslubi.md)

## Tushuncha

Vue bitta stsenariy uchun emas, beshta uchun yaratilgan. Qaysi birini tanlaganingiz build sozlamasini, SEO holatini, deploy usulini va hatto jamoa tuzilishini o'zgartiradi.

| Usul | Qachon | Build | SEO |
| --- | --- | --- | --- |
| Sahifaga qo'shilgan vidjet | Serverda render bo'ladigan mavjud ilova (Laravel, Django, WordPress) | Shart emas | Server HTML'i indekslanadi |
| Single-Page Application (SPA) | Admin panel, dashboard, ichki tizim | Ha | Yomon (klientda render) |
| Fullstack / SSR | Marketing sayti, e-commerce, blog | Ha + Node server | Yaxshi |
| Statik generatsiya (SSG) | Hujjat sayti, blog, landing | Ha (build vaqtida HTML) | Juda yaxshi |
| Web Component | Boshqa framework ichida ishlatiladigan bo'lak | Ha | Kontekstga bog'liq |

## Nega shunday

Vue'ning yadrosi (`@vue/runtime-core`) render qilish maqsadidan **ajratilgan**: u komponent daraxtini qanday qilib "biror narsaga" aylantirishni biladi, lekin bu "biror narsa" DOM bo'lishi shart emas — u satr (SSR), boshqa platforma (`@vue/runtime-dom` o'rniga custom renderer) yoki Vapor mode'dagi to'g'ridan-to'g'ri DOM ko'rsatmalari bo'lishi mumkin.

Shuning uchun bitta komponent kodi ham brauzerda, ham serverda, ham statik generatsiyada bir xil ishlaydi. Farq — atrofdagi qatlamda.

## Kod: 1-usul — mavjud sahifaga vidjet

Symfony/Laravel shablonida bitta bo'lakni interaktiv qilish:

```html
{# Twig / Blade shabloni #}
<div id="cart-widget" data-product-id="{{ product.id }}"></div>

<script type="module">
  import { createApp } from 'https://unpkg.com/vue@3.5.43/dist/vue.esm-browser.prod.js'
  import CartWidget from '/js/CartWidget.js'

  const el = document.getElementById('cart-widget')

  createApp(CartWidget, { productId: Number(el.dataset.productId) }).mount(el)
</script>
```

Ikki narsaga e'tibor:

- Server bergan ma'lumot komponentga `data-*` atribut orqali **props** sifatida kiritildi. Bu — global o'zgaruvchi (`window.__DATA__`) dan toza usul.
- Bir sahifada bir nechta vidjet bo'lsa, har biri o'z `createApp` iga ega bo'ladi (03-bob).

> **Muhim.** Bu usulda sahifaning qolgan qismini Vue **bilmaydi**: server render qilgan HTML o'z holicha qoladi, Vue faqat o'z konteyneri ichini boshqaradi.

## Kod: 2-usul — SPA

`npm create vue@latest` beradigan standart holat: `index.html` bitta, marshrutlash klientda (39-bob), server faqat statik fayllarni beradi.

```
dist/
├── index.html          ← barcha URL shu faylga yo'naltiriladi
└── assets/
    ├── index-a1b2.js
    └── index-c3d4.css
```

Serverda **fallback** sozlash shart, aks holda `/mahsulotlar/12` ni yangilaganda 404 chiqadi:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

SPA'ning kuchli tomoni — sahifalararo o'tish tezligi va murakkab klient holati. Zaif tomoni — birinchi yuklanish (bo'sh HTML + JS kutish) va SEO.

## Kod: 3-usul — SSR

Server HTML'ni tayyor holda qaytaradi, keyin brauzerda o'sha HTML "jonlantiriladi" (hydration):

```js
// server.js (soddalashtirilgan; to'liq variant 57-bobda)
import { renderToString } from 'vue/server-renderer'
import { createSSRApp } from 'vue'
import App from './src/App.vue'

app.get('*', async (req, res) => {
  const vueApp = createSSRApp(App)          // har so'rovga yangi nusxa
  const html = await renderToString(vueApp)

  res.send(`<!doctype html><div id="app">${html}</div><script type="module" src="/entry-client.js"></script>`)
})
```

Amalda buni qo'lda emas, **Nuxt** bilan qilishadi (59-bob) — chunki SSR'da yo'l-yo'lakay o'nlab masala chiqadi: ma'lumotni server'dan klientga uzatish, kesh, cookie, xatolik sahifalari, streaming.

## Kod: 4-usul — SSG

Build vaqtida har bir marshrut uchun HTML fayl yaratiladi. Natijada server umuman kerak emas — CDN yetarli:

```
dist/
├── index.html
├── blog/index.html
├── blog/vue-3-6/index.html
└── assets/...
```

Vue ekotizmida bu ikki vosita orqali qilinadi: **VitePress** (hujjat/blog uchun, shu qo'llanmaning o'zi shunaqa tizimda ham qurilishi mumkin edi) va **Nuxt** ning `nuxt generate` rejimi. 58-bobda batafsil.

## Kod: 5-usul — Web Component

Vue komponentini standart custom element'ga aylantirib, React/Angular/oddiy HTML ichida ishlatish mumkin:

```js
import { defineCustomElement } from 'vue'
import RatingStars from './RatingStars.ce.vue'   // .ce.vue — custom element uchun

const RatingElement = defineCustomElement(RatingStars)

customElements.define('rating-stars', RatingElement)
```

```html
<!-- Endi istalgan sahifada -->
<rating-stars value="4" max="5"></rating-stars>
```

Nozik joylar: `.ce.vue` fayldagi `<style>` shadow DOM ichiga kiradi (tashqi CSS ta'sir qilmaydi), props faqat atribut orqali satr sifatida keladi (raqam/obyekt uchun `props` deklaratsiyasi kerak), provide/inject ilovalar orasida ishlamaydi.

## Muhandislik nuqtai nazari: render qayerda bo'ladi

Uch variantni bitta o'lchovda solishtiramiz — foydalanuvchi mazmunni qachon ko'radi:

| | SPA | SSR | SSG |
| --- | --- | --- | --- |
| Birinchi bayt (TTFB) | Tez (statik HTML) | Sekinroq (server hisoblaydi) | Eng tez (CDN) |
| Birinchi mazmun (FCP) | Sekin (JS yuklanishi kerak) | Tez | Eng tez |
| Interaktivlik (TTI) | JS yuklangach | Hydration tugagach | Hydration tugagach |
| Server narxi | Yo'q | Har so'rovga CPU | Build vaqtida bir marta |
| Dinamik ma'lumot | Cheklovsiz | Cheklovsiz | Build vaqtidagi holat (yoki ISR) |

Qaror daraxti oddiy: **mazmun hammaga bir xilmi va kamdan-kam o'zgaradimi?** → SSG. **Har foydalanuvchiga boshqacha va SEO kerakmi?** → SSR. **Login orqasidagi ichki tizimmi?** → SPA (SEO ahamiyatsiz, murakkablik kamayadi).

## Muhandislik nuqtai nazari: hydration narxi

SSR/SSG'da brauzer ikki marta ish qiladi: server yuborgan HTML'ni ko'rsatadi, keyin JS yuklanib **xuddi shu daraxtni** qayta quradi va hodisalarni ulaydi. Bu — hydration. Uning ikki oqibati bor:

1. **JS hajmi baribir muhim.** HTML tez ko'rinadi, lekin tugma bosilmaydi — JS kelmaguncha.
2. **Server va klient bir xil natija berishi shart.** `Math.random()`, `new Date()`, `window` ga bog'liq shart — hydration mismatch keltirib chiqaradi (56-bob).

Vue 3.5 dan **lazy hydration** bor: komponentni ko'rinishga kirganda yoki bo'sh vaqtda jonlantirish mumkin (`defineAsyncComponent` + `hydrateOnVisible`, 28-bob).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Marketing sahifasini SPA qilish | Google indekslaydi, lekin sekin; ijtimoiy tarmoq preview'lari bo'sh | SSG yoki SSR (Nuxt) |
| Admin panelni SSR qilish | Serverda render qilishdan foyda yo'q, murakkablik ikki barobar | SPA yetarli |
| Vidjet usulida global `window.__DATA__` | Global holat, tiplar yo'q, ikkita vidjet bir-biriga xalaqit beradi | `data-*` atributdan props |
| `.vue` ni web component qilib eksport qilganda oddiy `<style>` ishlatish | Shadow DOM ichida tashqi CSS ishlamaydi va aksincha | `.ce.vue`, style'ni komponent ichida saqlash |
| SSR'da modul darajasida holat saqlash (`const cart = reactive({})`) | Server nusxasi barcha foydalanuvchilarga umumiy — ma'lumot sizib chiqadi | Har so'rovga yangi ilova va yangi store (56, 43-bob) |

## Amaliyot

1. Mavjud (yoki yangi) server-rendered sahifaga Vue vidjeti qo'shing: mahsulot miqdorini o'zgartiradigan bo'lak, boshlang'ich qiymati `data-*` dan kelsin.
2. SPA loyihangizni `npm run build` qiling va `dist/` ni oddiy static server orqali oching. `/mavjud-emas` manzilini so'rang — 404 chiqishini ko'ring, keyin fallback sozlab, `index.html` qaytishiga erishing.
3. Bitta komponentni `defineCustomElement` orqali web component qiling va uni Vue'siz oddiy HTML faylda ishlating.
4. Har uch usul uchun (SPA/SSR/SSG) loyihangizga mos ustunni tanlang va sababini bir jumlada yozing — 56-bobda shu qarorni qayta ko'rib chiqasiz.

## Rasmiy hujjat

- Foydalanish usullari: <https://vuejs.org/guide/extras/ways-of-using-vue.html>
- Vue va Web Components: <https://vuejs.org/guide/extras/web-components.html>
- SSR: <https://vuejs.org/guide/scaling-up/ssr.html>
