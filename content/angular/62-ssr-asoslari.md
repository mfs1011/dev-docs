# 62 — SSR asoslari

[← Oldingi: NgRx: Store va SignalStore](61-ngrx.md) · [Mundarija](README.md) · [Keyingi: Server marshrutlari va `RenderMode` →](63-server-marshrutlar.md)

## Tushuncha

**SSR** (Server-Side Rendering) — sahifa HTML'i serverda tayyorlanib, brauzerga **to'liq** yuboriladi. Keyin brauzerda Angular yuklanadi va tayyor HTML'ni "jonlantiradi" (**hydration**, 64-bob).

| | CSR (oddiy SPA) | SSR |
| --- | --- | --- |
| Birinchi javob | Bo'sh `<app-root>` + JS | Tayyor HTML |
| Birinchi kontent ko'rinishi | JS yuklanib, ishlagach | Darhol |
| Qidiruv tizimlari, ijtimoiy tarmoq preview | Qiyin | To'liq HTML |
| Server | Statik fayllar | Node.js (yoki prerender — 65-bob) |
| Murakkablik | Past | Yuqoriroq: kod ikki muhitda ishlaydi |

## Nega shunday

SPA ning ikki zaif joyi: birinchi ochilish sekin (ayniqsa sekin telefon va internetda) va SEO — kontent JS'dan keyin paydo bo'ladi. SSR ikkalasini hal qiladi, lekin narxi bor: kodingiz **serverda ham** ishlaydi, u yerda `window`, `document`, `localStorage` yo'q.

SSR kerakmi?

| Ilova | SSR |
| --- | --- |
| Ommaviy sayt: katalog, blog, landing | ✅ Deyarli har doim |
| Login ortidagi admin panel | ❌ Odatda keraksiz |
| Aralash (ommaviy + kabinet) | ✅ Marshrut bo'yicha tanlab (63-bob) |

## Kod: yangi loyiha yoki mavjudiga qo'shish

```bash
ng new shop --ssr          # yangi
ng add @angular/ssr        # mavjud loyihaga
```

Tekshirildi — `ng new --ssr` (Angular 22.2) yaratadigan fayllar:

| Fayl | Vazifa |
| --- | --- |
| `src/main.server.ts` | Serverda ishga tushirish (`bootstrap(context)`) |
| `src/server.ts` | Express 5 server |
| `src/app/app.config.server.ts` | Server provayderlari |
| `src/app/app.routes.server.ts` | Har marshrut qanday render qilinishi (63-bob) |

```ts
// app.config.ts — brauzer + umumiy
providers: [
  provideBrowserGlobalErrorListeners(),
  provideRouter(routes),
  provideClientHydration(),
]
```

```ts
// app.config.server.ts
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering(withRoutes(serverRoutes))],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
```

```ts
// main.server.ts
import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { config } from './app/app.config.server';

const bootstrap = (context: BootstrapContext) => bootstrapApplication(App, config, context);
export default bootstrap;
```

## Kod: Node server

```ts
// server.ts (qisqartirilgan)
import { AngularNodeAppEngine, createNodeRequestHandler, isMainModule, writeResponseToNodeResponse } from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');
const app = express();
const angularApp = new AngularNodeAppEngine({ allowedHosts: ['shop.uz', 'www.shop.uz'] });

app.use(express.static(browserDistFolder, { maxAge: '1y', index: false, redirect: false }));

app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

if (isMainModule(import.meta.url) || process.env['pm_id']) {
  app.listen(process.env['PORT'] || 4000);
}

export const reqHandler = createNodeRequestHandler(app);
```

```bash
ng build
node dist/shop/server/server.mjs     # yoki: npm run serve:ssr:shop
```

`ng serve` ishlab chiqishda SSR'ni o'zi qo'llaydi.

### `allowedHosts` — majburiy

Tekshirildi: `allowedHosts` siz production build'da **har so'rov 400** qaytardi, hatto `localhost` uchun ham:

```
ERROR: Bad Request ("http://localhost:4610/").
Header "host" with value "localhost:4610" is not allowed.
```

Bu SSRF (Server-Side Request Forgery) himoyasi: server `Host` sarlavhasiga qarab nisbiy URL'larni to'liq URL'ga aylantiradi; soxta `Host` bilan serverni ichki tarmoqqa so'rov yuborishga majburlash mumkin edi. Ruxsat etilgan domenlarni ko'rsating:

```ts
new AngularNodeAppEngine({ allowedHosts: ['shop.uz'] })
```

yoki `angular.json` da `"security": { "allowedHosts": [...] }`. Reverse proxy (nginx) orqasida — `trustProxyHeaders` ni **faqat** proxy `X-Forwarded-*` ni o'zi qo'yganiga ishonchingiz komil bo'lsa.

Qo'shimcha API endpointlar — `server.ts` da, Angular handler'dan **oldin**:

```ts
app.get('/api/health', (_req, res) => res.json({ ok: true }));
```

## Kod: ikki muhitda ishlaydigan kod

Tekshirildi: komponentda `window.innerWidth` — serverda:

```
ERROR ReferenceError: window is not defined
```

va sahifa o'rniga Express'ning **"Cannot GET /bad"** 404 sahifasi qaytdi (Angular javob bermadi → `next()`). Foydalanuvchi uchun — sahifa yo'q. Qoidalar:

**1. Brauzer API'larini `afterNextRender` ichida** — u faqat brauzerda ishlaydi (31–32-boblar):

```ts
constructor() {
  afterNextRender(() => {
    this.width.set(window.innerWidth);
    this.chart = new Chart(this.canvas().nativeElement, ...);
  });
}
```

**2. Platformani tekshirish:**

```ts
import { isPlatformBrowser } from '@angular/common';

private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

save(key: string, value: string) {
  if (this.isBrowser) localStorage.setItem(key, value);
}
```

**3. Adapter/token** — eng toza yo'l (38–39-boblar): `WINDOW` tokeni, `KeyValueStorage` adapteri — serverda xotira varianti.

**4. `document` — `inject(DOCUMENT)`** orqali: serverda Angular o'zining DOM emulyatsiyasini beradi.

| API | Serverda |
| --- | --- |
| `window`, `localStorage`, `navigator` | ❌ Yo'q |
| `inject(DOCUMENT)` | ✅ Emulyatsiya |
| `setTimeout`, `fetch` | ✅ Node'da bor |
| `afterNextRender` / `afterRenderEffect` | Ishlamaydi (to'g'ri — shunday bo'lishi kerak) |
| `effect` | ✅ Ishlaydi — ichida brauzer API bo'lmasin |

## Kod: so'rov va javobga kirish

`@angular/core` tokenlari:

```ts
import { REQUEST, RESPONSE_INIT, REQUEST_CONTEXT } from '@angular/core';

export class Account {
  private readonly request = inject(REQUEST);        // Request | null (brauzerda null)
  protected readonly ua = this.request?.headers.get('user-agent');
}

export class Gone {
  constructor() {
    const res = inject(RESPONSE_INIT);               // ResponseInit | null
    if (res) res.status = 410;
  }
}
```

Tekshirildi: `REQUEST` orqali `user-agent` o'qildi; `RESPONSE_INIT.status = 410` — javob kodi **410** bo'ldi. Brauzerda ikkalasi `null` — `?.` yoki `if` shart.

Cookie'larni SSR'da o'qish (masalan, auth) — `request.headers.get('cookie')`. Lekin foydalanuvchiga xos sahifalarni keshlanadigan rejimda render qilmang (63-bob).

## Kod: HTTP so'rovlar va transfer cache

Serverda qilingan `HttpClient` / `httpResource` so'rovlari javobi HTML ichiga yoziladi va brauzer **qayta so'ramaydi**:

Tekshirildi: SSR'da `httpResource` so'rovi → HTML'da `<script id="ng-state" type="application/json">` ichida javob; brauzerda sahifa ochilganda shu URL'ga **0 ta** so'rov.

Sukut qoidalari: faqat `GET`/`HEAD`, `Authorization` sarlavhali so'rovlar keshlanmaydi. Sozlash:

```ts
provideClientHydration(withHttpTransferCacheOptions({ includePostRequests: true }))
provideClientHydration(withNoHttpTransferCache())     // o'chirish
```

So'rov darajasida: `http.get(url, { transferCache: false })`.

**Nisbiy URL** (`/api/products`) — serverda to'liq URL'ga aylantiriladi (shu uchun `allowedHosts` muhim). Backend boshqa serverda bo'lsa — to'liq URL yoki interceptor.

## Muhandislik nuqtai nazari

**SSR — ishlash tezligi vositasi, avtomatik emas.** Server sekin API'ni kutsa, foydalanuvchi bo'sh ekranni CSR'dan ham uzoqroq ko'radi. O'lchang: TTFB (serverning birinchi bayti), LCP.

**Holat izolyatsiyasi:** serverda `@Service()` — **har so'rov uchun alohida** ilova nusxasi, lekin modul darajasidagi o'zgaruvchilar (`const cache = new Map()` fayl ichida) — **barcha foydalanuvchilar uchun umumiy**. U yerda foydalanuvchi ma'lumotini saqlamang — boshqa foydalanuvchiga ko'rinib qoladi.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| `allowedHosts` yo'q | Hamma so'rov 400 | Domenlarni ko'rsatish |
| Komponentda `window` | Sahifa o'rniga 404 | `afterNextRender`, `isPlatformBrowser`, token |
| `localStorage` servisda to'g'ridan-to'g'ri | Server xatosi | Adapter |
| Modul darajasida foydalanuvchi keshi | Ma'lumot sizib chiqishi | Xizmat ichida (har so'rovga) |
| `REQUEST` ni `null` tekshirmasdan | Brauzerda xato | `?.` |
| `trustProxyHeaders: true` ishonchsiz muhitda | Host soxtalashtirish | Faqat ishonchli proxy |
| Sekin API'ni SSR'da kutish | TTFB katta | `@defer`, keshlash, Client rejim |

## Amaliyot

1. `ng new shop --ssr` yarating, `ng build` va `node dist/shop/server/server.mjs` — 400 ni ko'ring, `allowedHosts` bilan tuzating.
2. Sahifani `curl` bilan oching — HTML'da kontent borligini tekshiring.
3. Komponentga `window.innerWidth` qo'shing, xatoni ko'ring; `afterNextRender` bilan tuzating.
4. `httpResource` bilan ma'lumot yuklang; HTML'da `ng-state` ni va brauzerda qayta so'rov yo'qligini tekshiring.
5. 410 sahifasi uchun `RESPONSE_INIT`.
6. `/api/health` endpoint'ini `server.ts` ga qo'shing.

## Rasmiy hujjat

- SSR: <https://angular.dev/guide/ssr>
- SSRF himoyasi: <https://angular.dev/best-practices/security#preventing-server-side-request-forgery-ssrf>
- Transfer cache: <https://angular.dev/guide/ssr#caching-data-when-using-httpclient>
