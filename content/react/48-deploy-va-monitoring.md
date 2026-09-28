# 48 — Deploy va monitoring

[← Oldingi: Xavfsizlik](47-xavfsizlik.md) · [Mundarija](README.md) · [Keyingi: Amaliy loyiha →](49-amaliy-loyiha.md)

## Tushuncha

Vite SPA — statik fayllar to'plami, ya'ni deploy arzon: CDN yoki oddiy fayl serveri yetarli. Lekin uchta narsa sozlanishi shart:

1. **SPA fallback** — har qanday yo'l `index.html` ga (04-bob);
2. **Kesh sarlavhalari** — hash'li fayllar abadiy, `index.html` hech qachon;
3. **Monitoring** — production'dagi xatolarni siz ko'rmaysiz, foydalanuvchi ko'radi.

## Kod: nginx

```nginx
server {
    listen 443 ssl http2;
    server_name app.example.com;

    root /var/www/app/dist;
    index index.html;

    # Hash'li fayllar — abadiy kesh
    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    # index.html — hech qachon keshlanmaydi
    location = /index.html {
        add_header Cache-Control "no-cache, must-revalidate";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;

    # Xavfsizlik sarlavhalari (47-bob)
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
```

## Kod: statik hosting

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

```json
// vercel.json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
```

GitHub Pages uchun: `BASE_PATH` sozlash va `404.html` nusxasi (Vue qo'llanmasining 67-bobida shu naqsh batafsil).

## Kod: muhit o'zgaruvchilari va versiya

```bash
# .env.production
VITE_API_URL=https://api.example.com
VITE_SENTRY_DSN=https://...
```

```js
// vite.config.ts — build vaqtidagi ma'lumot
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.GIT_SHA ?? 'dev'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
})
```

Versiyani bilish deploy'dan keyin muammoni tekshirishda juda foydali.

## Kod: Sentry bilan monitoring

```bash
npm i @sentry/react
```

::: ts
```tsx
// main.tsx
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  release: __APP_VERSION__,

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
  ],

  tracesSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],

  beforeSend(event) {
    if (event.request?.cookies) delete event.request.cookies

    return event
  },
})

// Foydalanuvchi konteksti — faqat ID
Sentry.setUser({ id: user.id })
```
:::

::: js
```jsx
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  release: __APP_VERSION__,
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration({ maskAllText: true })],
  tracesSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})
```
:::

Error Boundary bilan bog'lash (33-bob):

```jsx
<Sentry.ErrorBoundary fallback={({ error, resetError }) => <FullPageError error={error} onRetry={resetError} />}>
  <App />
</Sentry.ErrorBoundary>
```

## Kod: global xatolar va Web Vitals

```js
window.addEventListener('unhandledrejection', (event) => {
  Sentry.captureException(event.reason)
})

import { onCLS, onINP, onLCP } from 'web-vitals'

function send(metric) {
  navigator.sendBeacon?.('/api/metrics', JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    path: location.pathname,
  }))
}

onLCP(send)
onINP(send)
onCLS(send)
```

Lokal Lighthouse — laboratoriya natijasi; bu esa haqiqiy foydalanuvchilar ma'lumoti (RUM, 41-bob).

## Kod: source map

Minifikatsiya qilingan kodda stack trace o'qib bo'lmaydi. Yechim — map'ni monitoringga yuklab, saytdan o'chirish:

```js
// vite.config.ts
build: {
  sourcemap: 'hidden',       // fayl yaratiladi, lekin bundle'ga havola qo'yilmaydi
}
```

```yaml
# CI
- run: npm run build
- run: npx sentry-cli sourcemaps upload --release ${{ github.sha }} dist/assets
- run: find dist -name '*.map' -delete
```

## Kod: deploy oqimi

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }

      - run: npm ci
      - run: npm run verify            # lint + types + test + build (46-bob)

      - name: Deploy
        run: rsync -az --delete dist/ deploy@server:/var/www/app/dist/

      - name: Smoke test
        run: |
          for path in / /products /login; do
            code=$(curl -s -o /dev/null -w '%{http_code}' "https://app.example.com$path")
            [ "$code" = "200" ] || { echo "$path → $code"; exit 1; }
          done
```

## Kod: deploy'dan keyingi chunk muammosi

Foydalanuvchi sahifani ochgan, siz deploy qildingiz — endi u eski chunk nomini so'raydi va uni topa olmaydi (33, 41-bob):

```js
// 1. Xatoni ushlash
const Dashboard = lazy(() =>
  import('./Dashboard').catch((error) => {
    if (String(error.message).includes('Failed to fetch dynamically imported module')) {
      window.location.reload()
    }

    throw error
  }),
)

// 2. Yangi versiya haqida xabar berish
setInterval(async () => {
  const res = await fetch('/version.json', { cache: 'no-store' })
  const { version } = await res.json()

  if (version !== __APP_VERSION__) {
    toast('Yangi versiya mavjud', { action: { label: 'Yangilash', onClick: () => location.reload() } })
  }
}, 5 * 60 * 1000)
```

Qo'shimcha: eski chunk fayllarini serverda kamida 7 kun saqlang.

## Muhandislik nuqtai nazari: nimani kuzatish kerak

| Qatlam | Ko'rsatkich | Vosita |
| --- | --- | --- |
| Xatolar | Xato soni, ta'sirlangan foydalanuvchilar | Sentry |
| Unumdorlik | LCP, INP, CLS (RUM) | web-vitals |
| Tarmoq | API xato darajasi, javob vaqti | Sentry tracing / backend |
| Biznes | Ro'yxatdan o'tish, buyurtma voronkasi | Analitika |
| Mavjudlik | Sayt ochiladimi | Tashqi uptime monitoring |

Birinchi kunda hammasi kerak emas. Minimal to'plam: **xato monitoringi + uptime**.

## Muhandislik nuqtai nazari: shovqin bilan kurash

Monitoring ishga tushgan birinchi haftada minglab hodisa keladi:

| Manba | Nima qilish |
| --- | --- |
| Brauzer kengaytmalari | `ignoreErrors`, `denyUrls` |
| `ResizeObserver loop limit exceeded` | Filtrlash (zararsiz) |
| Bot va skanerlar | User-Agent filtri |
| Tarmoq uzilishlari | Alohida guruh, alert qo'ymaslik |
| Eski chunk xatolari | Yuqoridagi `reload` bilan hal qilish |

Maqsad — **har alert harakatga arziydigan** bo'lishi.

## Muhandislik nuqtai nazari: maxfiylik

- `Sentry.setUser({ id })` — faqat ID, ism/email emas;
- Session Replay'da `maskAllText: true`;
- `beforeSend` da cookie, token, parol maydonlarini tozalang;
- URL query'da shaxsiy ma'lumot bo'lsa, uni ham tozalang.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| SPA fallback sozlanmagan | Ichki URL'da 404 | `try_files` / rewrites |
| `index.html` uzoq keshlangan | Foydalanuvchi eski versiyada qoladi | `no-cache` |
| Monitoring yo'q | Xatolar haqida bilmaysiz | Sentry yoki muqobil |
| Source map yuklanmagan | Stack o'qib bo'lmaydi | `sourcemap: 'hidden'` + upload |
| Source map'ni saytda qoldirish | Kod ochiq | Upload'dan keyin o'chirish |
| Deploy'dan keyin tekshirmaslik | Buzilgan sayt soatlab turadi | Smoke test |
| Eski chunk'larni darhol o'chirish | Ochiq sahifalar buziladi | 7 kun saqlash |
| Shaxsiy ma'lumotni monitoringga yuborish | Maxfiylik buzilishi | `beforeSend` tozalash |

## Amaliyot

1. Vite SPA'ni nginx (yoki Netlify) bilan deploy qiling va ichki URL'ni yangilab, fallback ishlashini tekshiring.
2. Kesh sarlavhalarini sozlang va `curl -I` bilan tekshiring.
3. Sentry'ni ulang (bepul tarif) va ataylab xato tashlab, panelda ko'ring.
4. `sourcemap: 'hidden'` bilan build qiling, map'ni yuklang va stack trace o'qilishini tasdiqlang.
5. `web-vitals` bilan LCP/INP/CLS ni o'z endpointingizga yuboring.
6. Deploy workflow'iga smoke test qo'shing va ataylab buzilgan build bilan sinang.

## Rasmiy hujjat

- Vite deploy: <https://vite.dev/guide/static-deploy.html>
- Sentry React: <https://docs.sentry.io/platforms/javascript/guides/react/>
- web-vitals: <https://github.com/GoogleChrome/web-vitals>
