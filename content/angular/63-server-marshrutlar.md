# 63 — Server marshrutlari va `RenderMode`

[← Oldingi: SSR asoslari](62-ssr-asoslari.md) · [Mundarija](README.md) · [Keyingi: Hydration va incremental hydration →](64-hydration.md)

## Tushuncha

Angular "hybrid rendering" — har marshrut uchun **alohida** render usuli:

| `RenderMode` | Qachon HTML yaratiladi | `ng-server-context` |
| --- | --- | --- |
| `Prerender` (SSG) | **Build vaqtida**, bir marta | `ssg` |
| `Server` (SSR) | Har so'rovda | `ssr` |
| `Client` (CSR) | Hech qachon — brauzerda | — (bo'sh `<app-root>`) |

Sozlash — `app.routes.server.ts`:

```ts
import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'about', renderMode: RenderMode.Prerender },
  {
    path: 'products/:id',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Server,
    async getPrerenderParams() {
      const ids = await inject(ProductApi).popularIds();
      return ids.map((id) => ({ id }));
    },
  },
  { path: 'search', renderMode: RenderMode.Server },
  { path: 'account/**', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Server, status: 404 },
];
```

`ng new --ssr` sukut qiymati — `{ path: '**', renderMode: RenderMode.Prerender }`: hamma narsa prerender.

## Nega shunday

Bir ilovada sahifalar turlicha:

| Sahifa | Tabiati | Eng yaxshi rejim |
| --- | --- | --- |
| Bosh sahifa, "Biz haqimizda" | Kam o'zgaradi, hammaga bir xil | Prerender |
| Mashhur mahsulotlar | Kuniga bir necha marta o'zgaradi | Prerender + qayta build / Server |
| Qidiruv natijalari | Har so'rov boshqacha | Server |
| Shaxsiy kabinet | Login ortida, SEO kerak emas | Client |

Hammasini bitta rejimda — yo keraksiz server yuki (hammasi SSR), yo eskirgan kontent (hammasi SSG).

## Kod: tekshirilgan xulq

Real build va server bilan (Angular 22.2):

| Marshrut | Sozlama | Natija |
| --- | --- | --- |
| `/` | Prerender | `browser/index.html`, `ng-server-context="ssg"` |
| `/products/1`, `/products/2` | `getPrerenderParams` → `[{id:'1'},{id:'2'}]` | `browser/products/1/index.html`... — "Prerendered 3 static routes." |
| `/products/7` | Prerender qilinmagan, `fallback: Server` | So'rov vaqtida SSR bilan render — "Mahsulot 7" |
| `/dashboard` | Client | Bo'sh `<app-root>` (`index.csr.html`) |
| `/account` | Server + `headers: { 'Cache-Control': 'no-store' }` | `ng-server-context="ssr"`, sarlavha javobda |
| `/nope` | `**` Server + `status: 404` | HTTP **404** |

## Kod: `getPrerenderParams`

```ts
{
  path: 'blog/:slug',
  renderMode: RenderMode.Prerender,
  async getPrerenderParams() {
    const posts = await firstValueFrom(inject(BlogApi).list());
    return posts.map((p) => ({ slug: p.slug }));
  },
}
```

- Build vaqtida, **injection kontekstida** ishlaydi — `inject()` mumkin.
- Build paytida API mavjud bo'lishi kerak (CI'da ham).
- `**` bilan: `{ path: 'docs/**', ... }` → `[{ '**': 'guide/intro' }]`.

### `fallback`

| `PrerenderFallback` | Prerender qilinmagan yo'l so'ralsa |
| --- | --- |
| `Server` (sukut) | SSR bilan render |
| `Client` | Bo'sh CSR qobig'i |
| `None` | Angular javob bermaydi (keyingi middleware / 404) |

Amaliy strategiya: 1000 ta mahsulotdan **100 ta mashhurini** prerender, qolgani — `fallback: Server`. Build tez, mashhur sahifalar bir zumda.

## Kod: `status` va `headers`

```ts
{ path: 'old-catalog/**', renderMode: RenderMode.Server, status: 301, headers: { Location: '/catalog' } },
{ path: 'account/**', renderMode: RenderMode.Server, headers: { 'Cache-Control': 'private, no-store' } },
{ path: '**', renderMode: RenderMode.Server, status: 404 },
```

Tekshirildi: `old/**` → `301`, `Location: /`.

**Diqqat:** `status` — faqat `Server` va `Client` rejimlarida. `Prerender` tipida `status` maydoni **yo'q** (`Omit`) — statik fayl sifatida xizmat qilinadi, kod server tomonidan beriladi.

Dinamik status (ma'lumot topilmadi) — komponentda `RESPONSE_INIT` (62-bob). Tekshirildi: komponent `RESPONSE_INIT.status` ni o'zgartirsa, u marshrutdagi `status` dan **ustun** (marshrut `301`, komponent `404` qo'ydi → javob `404`):

```ts
export class ProductPage {
  constructor() {
    const res = inject(RESPONSE_INIT);
    effect(() => {
      if (res && this.product.error()) res.status = 404;
    });
  }
}
```

## Kod: Client rejimi va auth

```ts
{ path: 'account/**', renderMode: RenderMode.Client },
```

Nega shaxsiy sahifalarni Client? SSR'da foydalanuvchini aniqlash uchun cookie'ni serverga o'qib, API'ga uzatish, tokenni yangilash kerak — murakkab va xato qilish oson. Kabinet uchun SEO kerak emas, SSR foydasi kichik. Client rejimi — oddiy va xavfsiz.

SSR kerak bo'lsa (masalan, shaxsiy dashboard tez ochilsin): `REQUEST` dan cookie → interceptor orqali backendga uzatish, va **hech qachon** umumiy keshga tushmasligi uchun `Cache-Control: private, no-store`.

## Kod: app shell

Client marshrutlar uchun minimal qobiq (header, skelet) prerender qilish:

```ts
provideServerRendering(withRoutes(serverRoutes), withAppShell(AppShell))
```

`AppShell` — yengil komponent (logo, skelet). Foydalanuvchi JS yuklanguncha bo'sh oq ekran emas, qobiq ko'radi.

## Muhandislik nuqtai nazari

**Kesh — rejimning davomi.** Server rejimidagi ommaviy sahifa uchun CDN keshi:

```ts
{ path: 'search', renderMode: RenderMode.Server, headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300' } },
```

5 daqiqa CDN'da — server har so'rovni render qilmaydi. Shaxsiy sahifada `public` — **katta xato**: bir foydalanuvchining sahifasi boshqasiga ko'rinadi.

Qaror jadvali:

| Savol | Ha | Yo'q |
| --- | --- | --- |
| Kontent hammaga bir xilmi? | Prerender / Server + CDN kesh | Server (`private`) yoki Client |
| SEO kerakmi? | Prerender / Server | Client |
| Build vaqtida ma'lummi? | Prerender | Server |

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| Hamma narsa `**` Prerender (sukut) va dinamik sahifalar | Eskirgan yoki bo'sh sahifalar | Marshrut bo'yicha rejim |
| Prerender'ga `status` berish | TS xatosi | Server rejimi yoki `RESPONSE_INIT` |
| 10 000 sahifani prerender | Build soatlab | Mashhurlari + `fallback: Server` |
| Shaxsiy sahifa `public` kesh | Ma'lumot sizib chiqadi | `private, no-store` yoki Client |
| `getPrerenderParams` build'da API'ga ulana olmaydi | Build yiqiladi | CI'da API manzili, zaxira ro'yxat |
| `**` 404 Prerender qilingan | 200 bilan "topilmadi" (soft 404) | `**` Server + `status: 404` |

## Amaliyot

1. Uch rejimli marshrutlar: bosh sahifa Prerender, qidiruv Server, kabinet Client.
2. `getPrerenderParams` bilan 2 ta mahsulotni prerender qiling, uchinchisini `fallback: Server` bilan oching.
3. `dist/.../browser` papkasida prerender fayllarni toping.
4. `curl -I` bilan har marshrutning status va `Cache-Control` ini tekshiring.
5. `**` ni Server + 404 qiling; `curl -I /noto-g-ri-yol` → 404.
6. Kabinet uchun `withAppShell` qobig'i.

## Rasmiy hujjat

- Hybrid rendering: <https://angular.dev/guide/hybrid-rendering>
- Server marshrutlari: <https://angular.dev/guide/hybrid-rendering#server-routing>
- Prerender parametrlari: <https://angular.dev/guide/hybrid-rendering#parameterized-routes>
