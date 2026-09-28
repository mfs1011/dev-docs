# 67 — Deploy

[← Oldingi: Ko'p tillilik (i18n)](66-i18n.md) · [Mundarija](README.md) · [Keyingi: Monitoring va xatolar →](68-monitoring-va-xatolar.md)

## Tushuncha

Deploy varianti render strategiyasiga bog'liq (04, 58-bob):

| Rejim | Nima kerak | Misol |
| --- | --- | --- |
| SPA | Statik fayl serveri | GitHub Pages, Netlify, S3+CloudFront, nginx |
| SSG | Statik fayl serveri | Xuddi shu |
| SSR | Node (yoki Edge) runtime | VPS, Docker, Vercel, Cloudflare Workers |
| Gibrid (ISR/SWR) | Nitro qo'llab-quvvatlaydigan platforma | Vercel, Netlify, Cloudflare |

## Kod: SPA/SSG — nginx

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    root /var/www/app/dist;
    index index.html;

    # Hash'li fayllar — abadiy kesh (63-bob)
    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    # index.html — hech qachon keshlanmaydi
    location = /index.html {
        add_header Cache-Control "no-cache, must-revalidate";
    }

    # SPA fallback: har qanday yo'l index.html ga
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Siqish
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1024;

    # Xavfsizlik sarlavhalari (65-bob)
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
```

`try_files ... /index.html` — SPA uchun eng muhim qator: usiz `/products/12` ni yangilaganda 404 chiqadi (04, 39-bob).

## Kod: GitHub Pages

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0              # sahifa sanalari uchun (git tarixi)

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci
      - run: npm run build
        env:
          BASE_PATH: /${{ github.event.repository.name }}/

      - name: SPA uchun 404.html
        run: cp dist/index.html dist/404.html

      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Ikkita nozik joy:

1. **`BASE_PATH`** — sayt ildizda emas, `/repo-nomi/` da joylashsa, Vite'ga aytish kerak:

```js
// vite.config.js
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
})
```

2. **`404.html`** — GitHub Pages `try_files` ni bilmaydi, lekin mavjud bo'lmagan yo'lda `404.html` ni beradi. Uni `index.html` nusxasi qilsak, SPA ishlaydi (status kodi 404 bo'lib qoladi, bu SEO uchun muhim bo'lsa — SSG yoki boshqa hosting).

## Kod: Docker (SSR uchun)

```dockerfile
# Build bosqichi
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Ishga tushirish bosqichi — faqat kerakli fayllar
FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/.output ./.output

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports: ['3000:3000']
    environment:
      NUXT_PUBLIC_API_BASE: https://api.example.com
      NUXT_API_SECRET: ${API_SECRET}
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'wget', '-qO-', 'http://localhost:3000/api/health']
      interval: 30s
```

Ikki bosqichli build (`multi-stage`) — image hajmini bir necha barobar kamaytiradi: `node_modules` dagi dev bog'liqliklar yakuniy image'ga tushmaydi.

Nuxt'da `runtimeConfig` (59-bob) tufayli **bir xil image** turli muhitlarda ishlaydi: qiymatlar muhit o'zgaruvchilaridan o'qiladi.

## Kod: statik hosting (Netlify/Vercel/Cloudflare)

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

Nuxt uchun odatda konfiguratsiya kerak emas: Nitro platformani aniqlaydi va mos build chiqaradi (`nitro.preset`).

## Kod: muhitlar va sirlar

```
.env                 # lokal, git'ga kirmaydi
.env.example         # namuna, git'ga kiradi
```

```bash
# .env.example
VITE_API_URL=http://localhost:8000/api
VITE_SENTRY_DSN=
```

Production sirlar hech qachon repoda bo'lmaydi:

| Platforma | Qayerda |
| --- | --- |
| GitHub Actions | Repository secrets |
| Docker | `--env-file` yoki secret manager |
| Vercel/Netlify | Dashboard → Environment variables |
| VPS | `.env` fayl (chmod 600) yoki systemd `EnvironmentFile` |

Eslatma (06, 65-bob): `VITE_` prefiksli qiymat **bundle'da ochiq** — u "sir" emas, faqat konfiguratsiya.

## Kod: deploy oqimi

```
PR ochildi
  → CI: lint + typecheck + test + build      (55-bob)
  → preview deploy (ixtiyoriy)
  → review
main'ga merge
  → CI: build
  → deploy
  → smoke test (asosiy sahifalar 200 qaytaradimi)
  → monitoring (68-bob)
```

Smoke test namunasi:

```yaml
- name: Smoke test
  run: |
    for path in / /products /about; do
      code=$(curl -s -o /dev/null -w '%{http_code}' "https://example.com$path")
      [ "$code" = "200" ] || { echo "$path → $code"; exit 1; }
    done
```

## Muhandislik nuqtai nazari: nol to'xtovli deploy

Statik saytda muammo yo'q, lekin SSR'da eski jarayonni darhol o'ldirish — ishlayotgan so'rovlarni uzadi. To'g'ri tartib:

1. Yangi versiyani ko'tarish;
2. Health check kutish;
3. Trafikni yangi versiyaga o'tkazish;
4. Eskisiga **graceful shutdown** (yangi so'rov qabul qilmaydi, joriylarini tugatadi).

```js
// Nitro/Node
process.on('SIGTERM', () => {
  server.close(() => process.exit(0))
})
```

Docker Compose, Kubernetes, PM2 — hammasida shu naqsh bor, faqat nomlari boshqacha.

## Muhandislik nuqtai nazari: deploy paytidagi chunk muammosi

28-bobda ko'rilgan holat: foydalanuvchi sahifani ochgan, siz deploy qildingiz, endi u eski chunk nomini so'raydi — fayl yo'q.

Uch qatlamli yechim:

1. **Eski fayllarni saqlang** — kamida 7 kun (statik hostinglarda odatda avtomatik);
2. **Xatoni ushlang** — `defineAsyncComponent` `onError` da sahifani yangilang;
3. **Yangi versiya haqida xabar bering**:

```js
// Har 5 daqiqada versiyani tekshirish
setInterval(async () => {
  const res = await fetch('/version.json', { cache: 'no-store' })
  const { version } = await res.json()

  if (version !== import.meta.env.VITE_APP_VERSION) {
    showToast('Yangi versiya mavjud', { action: 'Yangilash', onAction: () => location.reload() })
  }
}, 5 * 60 * 1000)
```

## Muhandislik nuqtai nazari: reliz checklist

- [ ] CI yashil (lint, types, test, build)
- [ ] `npm run build && npm run preview` lokal tekshirildi
- [ ] Muhit o'zgaruvchilari production'da sozlangan
- [ ] Sirlar bundle'da yo'q (`grep`)
- [ ] Kesh sarlavhalari to'g'ri (`index.html` — no-cache)
- [ ] SPA fallback ishlaydi (ichki URL'ni yangilab ko'ring)
- [ ] HTTPS va HSTS yoqilgan
- [ ] Xato monitoringi ulangan (68-bob)
- [ ] Orqaga qaytarish (rollback) yo'li ma'lum
- [ ] Smoke test o'tdi

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| SPA fallback sozlanmagan | Ichki URL'da 404 | `try_files` / `404.html` |
| `index.html` uzoq keshlangan | Foydalanuvchi eski versiyada qoladi | `no-cache` |
| `base` ni sozlamasdan sub-yo'lga deploy | Asset yo'llari buziladi | `base: '/repo/'` |
| Sirlarni repoda saqlash | Ochiq qoladi | Secret manager |
| Deploy'dan keyin tekshirmaslik | Buzilgan sayt soatlab turadi | Smoke test |
| Eski chunk'larni darhol o'chirish | Ochiq sahifalar buziladi | 7 kun saqlash |
| Rollback rejasi yo'qligi | Xato bo'lsa vahima | Oldingi artefaktni saqlash |

## Amaliyot

1. SPA'ni nginx bilan deploy qiling va ichki URL'ni yangilab, fallback ishlashini tekshiring.
2. GitHub Pages workflow'ini yozing, `BASE_PATH` va `404.html` bilan.
3. SSR ilovasi uchun ko'p bosqichli Dockerfile yozing va image hajmini bir bosqichli variant bilan solishtiring.
4. CI'ga smoke test qo'shing va ataylab buzilgan build bilan uni ishga tushiring.
5. Versiya tekshiruvi (`/version.json`) mexanizmini yozing.

## Rasmiy hujjat

- Vite deploy: <https://vite.dev/guide/static-deploy.html>
- Nuxt deploy: <https://nuxt.com/docs/getting-started/deployment>
- GitHub Pages Actions: <https://github.com/actions/deploy-pages>
