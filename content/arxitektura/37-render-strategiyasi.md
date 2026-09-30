# 37 — Render strategiyasi

[← Oldingi: Frontend arxitekturasi nimani hal qiladi](36-frontend-arxitekturasi.md) · [Mundarija](README.md) · [Keyingi: Modul tuzilmasi →](38-modul-tuzilmasi.md)

## Tushuncha

HTML qayerda va qachon yaratiladi — frontend'ning eng katta arxitektura qarori:

| Strategiya | HTML qachon | Qayerda | Misol |
| --- | --- | --- | --- |
| **CSR** | Har ochilishda | Brauzerda (JS) | Admin panel, dashboard |
| **SSR** | Har so'rovda | Serverda | Qidiruv natijalari, shaxsiy bo'lmagan dinamik sahifalar |
| **SSG** (prerender) | Build vaqtida | Build serverda | Blog, hujjatlar, landing |
| **ISR** / revalidatsiya | Build + vaqti-vaqti bilan | Serverda, keshlanadi | Katalog, yangiliklar |
| **Islands** / partial hydration | Server HTML + faqat interaktiv qismlar jonlanadi | Aralash | Kontent saytlari |
| **Streaming SSR** | Qismlab, tayyor bo'lgani darhol | Serverda | Og'ir sahifalar |

## Nega shunday

Har strategiya — sifat atributlari (2-bob) orasidagi boshqa muvozanat:

| | CSR | SSR | SSG |
| --- | --- | --- | --- |
| Birinchi kontent (LCP) | Sekin (JS kutiladi) | Tez | Eng tez (CDN) |
| SEO / preview | Qiyin | ✅ | ✅ |
| Server narxi | Statik hosting | Har so'rovga CPU | Statik hosting |
| Ma'lumot yangiligi | Doim yangi | Doim yangi | Build vaqtidagi |
| Shaxsiy kontent | ✅ oson | Murakkab (kesh xavfi) | ❌ |
| Murakkablik | Past | Yuqori (kod ikki muhitda) | O'rta |

## Psevdokod: qaror daraxti — marshrut bo'yicha

Butun ilova uchun bitta strategiya emas — **har marshrutga**:

```text
Sahifa hamma uchun bir xilmi?
├── Ha
│   ├── Kontent build vaqtida ma'lummi va kam o'zgaradimi?  → SSG
│   ├── Tez-tez o'zgaradi, lekin bir necha daqiqa eskirish OK → SSG/SSR + revalidatsiya/CDN kesh
│   └── Har so'rovda boshqacha (qidiruv, filtr)              → SSR (+ qisqa CDN kesh)
└── Yo'q (shaxsiy)
    ├── SEO kerakmi?                  → odatda yo'q → CSR
    └── Tez birinchi ochilish kritik  → SSR, private kesh, ehtiyotkorlik bilan
```

```text
Onlayn do'kon misoli:
  /                  SSG                (kuniga bir necha marta rebuild yoki revalidatsiya)
  /products/:slug    SSG mashhurlari + SSR fallback
  /search            SSR + CDN s-maxage=60
  /cart, /checkout   CSR
  /account/**        CSR
  **                 SSR, status 404
```

## Psevdokod: SSR'ning yashirin narxi

```text
1. Kod ikki muhitda: window, localStorage, document serverda yo'q
2. Hydration: server HTML va klient render mos kelishi kerak
3. Server holati izolyatsiyasi: modul darajasidagi o'zgaruvchi — barcha foydalanuvchilar uchun umumiy
4. Keshlash: shaxsiy sahifa "public" keshlansa — boshqa foydalanuvchiga ko'rinadi
5. Xavfsizlik: SSR server — yangi hujum yuzasi (SSRF, Host sarlavhasi)
6. TTFB: server sekin API'ni kutsa — foydalanuvchi bo'sh ekranni CSR'dan ham uzoqroq ko'radi
```

Har biri frontend kitoblarida real sinalgan — pastdagi jadvalga qarang.

## Framework'larda

| Imkoniyat | Angular 22 | Next.js | Vue / Nuxt |
| --- | --- | --- | --- |
| Marshrut bo'yicha rejim | `RenderMode.Prerender/Server/Client` — [Angular 63-bob](../angular/63-server-marshrutlar.md) | Statik/dinamik segmentlar, `revalidate` — [Next.js 3](../nextjs/03-render-strategiyalari.md), [19-bob](../nextjs/19-revalidatsiya.md) | Nuxt `routeRules` — [Vue 58-bob](../vue/58-ssg-va-prerender.md), [59-bob](../vue/59-nuxt-asoslari.md) |
| Qisman hydration | Incremental hydration, `@defer (hydrate on ...)` — v22 da sukut — [Angular 64-bob](../angular/64-hydration.md) | Server Components (klient JS faqat `"use client"`) — [Next.js 16-bob](../nextjs/16-server-components.md) | Lazy hydration (Nuxt) |
| Streaming | — | Suspense streaming — [Next.js 20-bob](../nextjs/20-streaming-suspense.md) | — |
| SSG | `outputMode: "static"` — [Angular 65-bob](../angular/65-prerender-va-deploy.md) | `output: 'export'` | [Vue 58-bob](../vue/58-ssg-va-prerender.md) |

Angular 22'da tekshirilgan SSR nozik joylari ([62–65-boblar](../angular/62-ssr-asoslari.md)):
- `allowedHosts` bo'lmasa — **har so'rov 400** (SSRF himoyasi).
- Serverda `window` — sahifa o'rniga 404 (Express'ga o'tib ketadi).
- Statik build'da Client marshrutlar uchun fallback — `index.csr.html`, `index.html` emas.
- `page.route` E2E mock'i SSR so'roviga ta'sir qilmaydi — ma'lumot serverda olingan.

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| Hamma narsa CSR | Oddiy, arzon hosting | Sekin birinchi ochilish, SEO yo'q |
| Hamma narsa SSR | Tez, SEO | Server narxi, murakkablik, keshlash xavflari |
| Marshrut bo'yicha gibrid | Har sahifa optimal | Konfiguratsiya va qoidalarni bilish |
| SSG | Eng tez, eng arzon | Build vaqti, eskirish |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Admin panelga SSR | Murakkablik, foyda yo'q | CSR |
| Ommaviy katalog CSR | SEO va LCP yomon | SSR/SSG |
| Shaxsiy sahifa `public` kesh | Ma'lumot sizishi | `private, no-store` yoki CSR |
| 10 000 sahifani SSG | Build soatlab | Mashhurlari + SSR fallback |
| Soft 404 (200 bilan "topilmadi") | Google indekslaydi | Haqiqiy 404 status |
| SSR'ni "o'lchovsiz tezroq" deb bilish | Sekin API bilan TTFB yomonroq | LCP/TTFB o'lchash |

## Amaliyot

1. Ilovangizning barcha marshrutlari uchun qaror daraxti bo'yicha strategiya tanlang.
2. Hozirgi strategiya bilan solishtiring — qaysilari noto'g'ri?
3. Bitta ommaviy sahifaning LCP va TTFB'ini CSR va SSR'da o'lchang.
4. SSR sahifalarida `Cache-Control` sarlavhalarini tekshiring.

## Manbalar

- web.dev — *Rendering on the Web* <https://web.dev/articles/rendering-on-the-web>
- Jason Miller — *Islands Architecture* <https://jasonformat.com/islands-architecture/>
- Angular — *Hybrid rendering* <https://angular.dev/guide/hybrid-rendering>
