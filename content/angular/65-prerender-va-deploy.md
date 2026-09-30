# 65 — Prerendering va deploy

[← Oldingi: Hydration va incremental hydration](64-hydration.md) · [Mundarija](README.md) · [Keyingi: Angular Material va CDK →](66-material-va-cdk.md)

## Tushuncha

Build natijasi `outputMode` ga bog'liq (`angular.json`):

| `outputMode` | Natija | Kerakli hosting |
| --- | --- | --- |
| `"static"` | Faqat `browser/` — HTML/JS/CSS fayllar | Har qanday statik hosting (nginx, S3, GitHub Pages, Netlify) |
| `"server"` | `browser/` + `server/server.mjs` | Node.js (VPS, Docker, Cloud Run, Vercel/Netlify funksiyalari) |

`outputMode` siz, SSR'siz loyiha — oddiy SPA (`browser/index.html`).

## Nega shunday

Prerender (SSG) sahifalar — oddiy HTML fayllar: server kerak emas, CDN'dan eng tez beriladi, deyarli tekin. SSR sahifalar — Node jarayoni, monitoring, masshtablash. Qoida: **imkon qadar statik**, kerak joyda server.

## Kod: statik build (SSG)

```json
// angular.json → architect.build.options
"outputMode": "static"
```

```ts
// app.routes.server.ts — faqat Prerender va Client
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  {
    path: 'products/:id',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Client,
    async getPrerenderParams() { return [{ id: '1' }, { id: '2' }]; },
  },
  { path: '**', renderMode: RenderMode.Client },
];
```

Tekshirildi — natija:

```
dist/shop/
├── browser/
│   ├── index.html              ← prerender qilingan bosh sahifa
│   ├── index.csr.html          ← CSR qobig'i (Client marshrutlar uchun)
│   ├── products/1/index.html
│   ├── products/2/index.html
│   └── main-XXXX.js, chunk-XXXX.js, styles-XXXX.css
└── prerendered-routes.json
```

`static` rejimida `Server` marshrut bo'lsa — build **xato** beradi (tekshirildi):

```
Route '/account' is configured with server render mode, but the build 'outputMode' is set to 'static'.
```

### Statik hosting sozlamasi

Prerender fayllar — o'z yo'lida (`/products/1/` → `products/1/index.html`). Qolgan yo'llar (Client marshrutlar) uchun fallback — **`index.csr.html`**, `index.html` emas: `index.html` endi prerender qilingan **bosh sahifa**, unga fallback qilinsa `/account` ochilganda bir lahza bosh sahifa ko'rinadi va hydration mismatch.

```nginx
location / {
  try_files $uri $uri/index.html /index.csr.html;
}

location ~* \.(js|css|woff2|svg|png|jpg|webp)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

location ~* \.html$ {
  add_header Cache-Control "no-cache";
}
```

Fayl nomlaridagi hash (`main-IO5RRVZW.js`) — o'zgarsa nom o'zgaradi, shuning uchun JS/CSS 1 yil keshlanadi. HTML esa — `no-cache` (har safar tekshiriladi), aks holda foydalanuvchi eski versiyaga yopishib qoladi.

**GitHub Pages** kabi `try_files` yo'q hostinglar: `index.csr.html` ni `404.html` sifatida nusxalash (yoki `withHashLocation`, 40-bob). Pastki papkaga joylashtirish: `ng build --base-href /repo-nomi/`.

## Kod: server build (SSR)

```json
"outputMode": "server"
```

```bash
ng build
node dist/shop/server/server.mjs
```

`server.mjs` — mustaqil Express ilova; `PORT` muhit o'zgaruvchisi (sukut 4000).

### Docker

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx ng build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=4000
COPY --from=build /app/dist/shop ./dist/shop
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev
USER node
EXPOSE 4000
CMD ["node", "dist/shop/server/server.mjs"]
```

Server bundle Angular'ni o'z ichiga oladi, lekin `express` kabi tashqi paketlar `node_modules` dan olinishi mumkin — shuning uchun `npm ci --omit=dev`.

### Production nazorat ro'yxati

| Punkt | Nega |
| --- | --- |
| `allowedHosts` | Busiz — hamma so'rov 400 (62-bob) |
| Reverse proxy (nginx) + HTTPS | TLS, gzip/brotli, statik fayllar |
| `trustProxyHeaders` faqat proxy orqasida | `X-Forwarded-Host` soxtalashtirish |
| Health check (`/api/health`) | Orkestrator jarayonni qayta ishga tushirsin |
| PM2 yoki konteyner restart siyosati | Jarayon yiqilsa |
| Loglar va xatolar (Sentry) | SSR xatolari faqat serverda ko'rinadi |
| `Cache-Control` har marshrutga | Shaxsiy sahifalar keshlanmasin (63-bob) |

## Kod: platformalar

| Platforma | Qanday |
| --- | --- |
| Netlify, Vercel | `outputMode: "server"` — ular `reqHandler` ni funksiya sifatida ishga tushiradi (adapter/preset hujjatiga qarang) |
| Firebase App Hosting | `ng deploy` yoki GitHub integratsiya |
| Cloud Run, Fly.io, VPS | Docker |
| S3 + CloudFront, GitHub Pages | `outputMode: "static"` |

`server.ts` oxiridagi `export const reqHandler = createNodeRequestHandler(app)` — aynan serverless platformalar uchun.

## Kod: prerender va ma'lumot yangilanishi

SSG sahifa build vaqtidagi ma'lumotni ko'rsatadi. Mahsulot narxi o'zgarsa — qayta build kerak. Yondashuvlar:

| Usul | Qachon |
| --- | --- |
| CMS o'zgarganda webhook → CI build | Blog, hujjatlar |
| Tunda cron bilan build | Katalog (kunlik yangilanish yetarli) |
| Prerender + brauzerda `httpResource` bilan yangilash | Asosiy qism statik, narx/qoldiq jonli |
| `RenderMode.Server` + CDN `s-maxage` | Tez-tez o'zgaradi, lekin kesh qabul qilinadi |

Uchinchi usul keng tarqalgan: SEO uchun nom/tavsif prerender, narx esa `@defer (on idle)` ichida jonli so'rov.

## Muhandislik nuqtai nazari

**CI pipeline:**

```
npm ci → ng lint → ng test --watch=false → ng build → (e2e) → deploy
```

Build byudjetlari (`angular.json` → `budgets`) CI'da buzilsa — pipeline to'xtasin. Bundle hajmi sezilmay o'sadigan narsa.

**Versiyani aniqlash:** foydalanuvchi uzoq ochiq tab'da eski versiyada qolishi mumkin; yangi chunk'lar serverda bo'lmasa — lazy yuklash xatosi (43-bob). Eski chunk'larni bir necha deploy davomida saqlang yoki `withNavigationErrorHandler` bilan qayta yuklang.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| Statik hostingda fallback `index.html` ga | Client marshrutlarda bosh sahifa miltillaydi | `index.csr.html` |
| `static` rejimida `Server` marshrut | Build xatosi | Prerender/Client yoki `server` rejim |
| HTML fayllar uzoq keshlanadi | Yangi versiya ko'rinmaydi | HTML `no-cache`, hashli fayllar `immutable` |
| Konteynerda `allowedHosts` yo'q | 400 | Domen ro'yxati |
| Pastki papkada `--base-href` yo'q | JS/CSS 404 | `--base-href /yo'l/` |
| Prerender ma'lumoti eskiradi | Noto'g'ri narxlar | Qayta build yoki jonli qism |
| Root foydalanuvchi bilan Node | Xavfsizlik | `USER node` |

## Amaliyot

1. `outputMode: "static"` bilan build qiling; `dist` tuzilmasini yuqoridagi bilan solishtiring.
2. Bitta marshrutni `Server` qilib, build xatosini ko'ring.
3. `npx serve dist/shop/browser` (yoki nginx) bilan oching; Client marshrutni to'g'ridan-to'g'ri oching — fallback'ni `index.csr.html` ga sozlang.
4. `outputMode: "server"` + Docker image; `docker run -p 4000:4000` bilan sinang.
5. CI'da `ng build` + byudjet tekshiruvi.
6. Mahsulot sahifasida nomni prerender, narxni `@defer (on idle)` + `httpResource` bilan jonli qiling.

## Rasmiy hujjat

- Hybrid rendering va output: <https://angular.dev/guide/hybrid-rendering>
- Deploy: <https://angular.dev/tools/cli/deployment>
- Build sozlamalari: <https://angular.dev/tools/cli/build>
