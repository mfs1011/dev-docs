# 48 — Deploy: Docker va self-host

[← Oldingi: Deploy: Vercel](47-vercel.md) · [Mundarija](README.md) · [Keyingi: Monitoring va xatolar →](49-monitoring.md)

## Tushuncha

Next'ni o'z serveringizda yuritish mumkin va ko'p hollarda mantiqiy: ma'lumot chegarada qolishi kerak, trafik katta, yoki mavjud infratuzilma bor.

Vercel sizga bepul berayotgan narsalar — endi sizning ishingiz:

| Narsa | Vercel'da | Self-host'da |
| --- | --- | --- |
| CDN | Avtomatik | nginx / Cloudflare |
| Rasm optimizatsiyasi | Avtomatik | `sharp` (o'rnatilgan) yoki tashqi |
| ISR keshi | Avtomatik, bo'lishilgan | Disk yoki Redis (qo'lda) |
| Cron | `vercel.json` | Tizim cron / Kubernetes CronJob |
| Avtomatik masshtab | Avtomatik | O'zingiz |
| SSL | Avtomatik | Let's Encrypt |
| Fon ishlari | Navbat kerak | Alohida konteyner (oson) |

Oxirgi qatorda self-host **yutadi**: uzluksiz protsess bo'lgani uchun navbat ishchisi, WebSocket (37-bob), `LISTEN/NOTIFY` — hammasi tabiiy ishlaydi.

## Nega shunday

Next'ning `standalone` chiqishi — self-host uchun kalit:

```
next build (odatiy)
  .next/ + node_modules/ kerak   →  ~500 MB konteyner

next build (output: 'standalone')
  .next/standalone/ o'zi yetarli  →  ~150 MB konteyner
```

`standalone` rejimda Next **faqat kerakli** `node_modules` fayllarini nusxalaydi va o'z `server.js` faylini yaratadi.

::: ts
```ts
// next.config.ts
import type { NextConfig } from 'next'

const config: NextConfig = {
  output: 'standalone',

  // Monorepo'da umumiy paketlar ham qamrab olinsin
  outputFileTracingRoot: process.env.MONOREPO ? join(__dirname, '../../') : undefined,

  // Konteyner ichidan tashqariga so'rov yuborilsa
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.example.com' }],
  },
}

export default config
```
:::

::: js
```js
// next.config.mjs
const config = {
  output: 'standalone',

  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.example.com' }],
  },
}

export default config
```
:::

## Kod: Dockerfile

Ko'p bosqichli build — hajm va xavfsizlik uchun:

```dockerfile
# syntax=docker/dockerfile:1

# ── 1. Bog'liqliklar ────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

# Faqat manifest fayllari — kesh qatlami uchun
COPY package.json package-lock.json ./
COPY prisma ./prisma

# npm ci — lock fayliga qat'iy amal qiladi
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# ── 2. Build ────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build vaqtida kerak bo'lgan ochiq o'zgaruvchilar
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

ENV NEXT_TELEMETRY_DISABLED=1

RUN npx prisma generate
RUN npm run build

# ── 3. Ishga tushirish ──────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Root bo'lmagan foydalanuvchi
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# standalone chiqishi
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# ISR keshi uchun papka
RUN mkdir -p .next/cache && chown -R nextjs:nodejs .next

# Migratsiya uchun Prisma (agar kerak bo'lsa)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
```

```
# .dockerignore — MAJBURIY
node_modules
.next
.git
.env*
!.env.example
**/*.test.*
e2e
playwright-report
coverage
README.md
.github
```

`.dockerignore` bo'lmasa: `node_modules` konteyner kontekstiga nusxalanadi (sekin), `.env.local` esa **imijga tushadi** (sirlar sizadi).

**Sirlar `ARG` orqali berilmaydi.** `ARG` qiymatlari imij tarixida qoladi:

```bash
docker history my-image --no-trunc | grep SECRET   # ko'rinadi!
```

Faqat `NEXT_PUBLIC_` o'zgaruvchilar `ARG` bo'lishi mumkin — ular baribir ochiq (45-bob). Maxfiylari ish vaqtida `env` orqali beriladi.

## Kod: `docker-compose`

```yaml
# compose.yaml
services:
  web:
    build:
      context: .
      args:
        NEXT_PUBLIC_APP_URL: https://example.com
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: pk_live_xxx
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql://app:${DB_PASSWORD}@db:5432/app
      REDIS_URL: redis://cache:6379
      AUTH_SECRET: ${AUTH_SECRET}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
    depends_on:
      db: { condition: service_healthy }
      cache: { condition: service_started }
    volumes:
      # ISR keshi konteyner qayta ishga tushganda yo'qolmasin
      - isr-cache:/app/.next/cache
    ports: ['3000:3000']

  # Fon ishlari — ALOHIDA konteyner (36-bob)
  worker:
    build:
      context: .
      dockerfile: Dockerfile.worker
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql://app:${DB_PASSWORD}@db:5432/app
      REDIS_URL: redis://cache:6379
      RESEND_API_KEY: ${RESEND_API_KEY}
    depends_on:
      db: { condition: service_healthy }
    deploy:
      replicas: 2

  db:
    image: postgres:17-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: app
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./backups:/backups
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U app']
      interval: 10s
      timeout: 5s
      retries: 5

  cache:
    image: redis:8-alpine
    restart: unless-stopped
    command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru --appendonly yes
    volumes:
      - redisdata:/data

  proxy:
    image: nginx:alpine
    restart: unless-stopped
    ports: ['80:80', '443:443']
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on: [web]

volumes:
  pgdata:
  redisdata:
  isr-cache:
```

```bash
# .env — compose o'qiydi (git'ga QO'SHILMAYDI)
DB_PASSWORD=...
AUTH_SECRET=...
STRIPE_SECRET_KEY=sk_live_...
RESEND_API_KEY=re_...
```

Ishchi konteyneri alohida `Dockerfile.worker` bilan:

```dockerfile
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist/worker.js ./worker.js

USER node

CMD ["node", "worker.js"]
```

## Kod: nginx

```nginx
# nginx.conf
worker_processes auto;

events {
  worker_connections 2048;
}

http {
  include       /etc/nginx/mime.types;
  default_type  application/octet-stream;

  sendfile      on;
  tcp_nopush    on;
  keepalive_timeout 65;

  # Siqish
  gzip on;
  gzip_vary on;
  gzip_min_length 1024;
  gzip_types text/plain text/css application/json application/javascript
             application/x-javascript text/xml application/xml image/svg+xml;

  # Brotli bo'lsa yaxshiroq (nginx moduli kerak)
  # brotli on;
  # brotli_types text/css application/javascript application/json;

  upstream nextjs {
    server web:3000;
    keepalive 64;
  }

  # Tezlik chegarasi (45-bob) — nginx darajasida ham
  limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;
  limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;

  server {
    listen 80;
    server_name example.com;

    return 301 https://$host$request_uri;
  }

  server {
    listen 443 ssl;
    http2 on;
    server_name example.com;

    ssl_certificate     /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_session_cache   shared:SSL:10m;

    client_max_body_size 10M;

    # Statik fayllar — o'zgarmas, uzoq kesh
    location /_next/static/ {
      proxy_pass http://nextjs;
      proxy_cache_valid 200 365d;
      add_header Cache-Control "public, max-age=31536000, immutable";
      access_log off;
    }

    location /public/ {
      proxy_pass http://nextjs;
      add_header Cache-Control "public, max-age=86400";
    }

    # Auth — qat'iy chegara
    location /api/auth/ {
      limit_req zone=auth burst=3 nodelay;
      proxy_pass http://nextjs;
      include /etc/nginx/proxy_params.conf;
    }

    # API
    location /api/ {
      limit_req zone=api burst=20 nodelay;
      proxy_pass http://nextjs;
      include /etc/nginx/proxy_params.conf;
    }

    # Qolgan hammasi
    location / {
      proxy_pass http://nextjs;
      include /etc/nginx/proxy_params.conf;
    }
  }
}
```

```nginx
# proxy_params.conf
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_cache_bypass $http_upgrade;

# Streaming (20, 37-bob) uchun MAJBURIY
proxy_buffering off;
proxy_read_timeout 300s;
proxy_send_timeout 300s;
```

Uch kritik sozlama:

1. **`proxy_buffering off`** — busiz streaming va SSE ishlamaydi: nginx butun javobni kutadi.
2. **`X-Forwarded-For`** — `$proxy_add_x_forwarded_for` (qo'shadi), `$remote_addr` emas. Tezlik chegarasi shunga tayanadi (45-bob).
3. **`X-Forwarded-Proto`** — Next `secure` cookie'larni to'g'ri qo'yishi uchun.

## Kod: ISR keshi va bir necha instansiya

Bu self-host'dagi **eng ko'p e'tibordan chetda qoladigan** masala.

Sukut bo'yicha ISR keshi konteyner diskida (`.next/cache`). Uch instansiya bo'lsa:

```
Instansiya A: sahifani revalidatsiya qildi  → A ning keshida yangi
Instansiya B: eski kesh                      → foydalanuvchi eskisini ko'radi
Instansiya C: eski kesh                      → tasodifiy natija
```

Yechim — **bo'lishilgan kesh handler**:

::: ts
```ts
// cache-handler.ts
import { createClient } from 'redis'

const client = createClient({ url: process.env.REDIS_URL })

client.on('error', (error) => console.error('Redis kesh xatosi', error))

let connected: Promise<unknown> | null = null

function ensureConnected() {
  connected ??= client.connect().catch((error) => {
    console.error('Redis ulanmadi', error)
    connected = null
  })

  return connected
}

const PREFIX = `next:${process.env.BUILD_ID ?? 'dev'}:`

export default class CacheHandler {
  async get(key: string) {
    try {
      await ensureConnected()

      const value = await client.get(PREFIX + key)

      return value ? JSON.parse(value) : null
    } catch {
      return null                                 // kesh yo'q bo'lsa — sahifa baribir render bo'ladi
    }
  }

  async set(key: string, data: unknown, ctx: { revalidate?: number | false; tags?: string[] }) {
    try {
      await ensureConnected()

      const payload = JSON.stringify({ value: data, lastModified: Date.now(), tags: ctx.tags })
      const ttl = typeof ctx.revalidate === 'number' ? ctx.revalidate * 2 : 60 * 60 * 24

      await client.set(PREFIX + key, payload, { EX: ttl })

      // Teg → kalitlar bog'lanishi (revalidateTag uchun)
      for (const tag of ctx.tags ?? []) {
        await client.sAdd(`${PREFIX}tag:${tag}`, key)
      }
    } catch (error) {
      console.error('Keshga yozib bo\'lmadi', error)
    }
  }

  async revalidateTag(tags: string | string[]) {
    const list = Array.isArray(tags) ? tags : [tags]

    try {
      await ensureConnected()

      for (const tag of list) {
        const keys = await client.sMembers(`${PREFIX}tag:${tag}`)

        if (keys.length) await client.del(keys.map((k) => PREFIX + k))

        await client.del(`${PREFIX}tag:${tag}`)
      }
    } catch (error) {
      console.error('Tegni tozalab bo\'lmadi', error)
    }
  }
}
```

```ts
// next.config.ts
const config: NextConfig = {
  output: 'standalone',
  cacheHandler: require.resolve('./cache-handler.js'),
  cacheMaxMemorySize: 0,                          // o'rnatilgan xotira keshini o'chirish
}
```
:::

::: js
```js
// cache-handler.js
import { createClient } from 'redis'

const client = createClient({ url: process.env.REDIS_URL })

client.on('error', (error) => console.error('Redis kesh xatosi', error))

let connected = null

function ensureConnected() {
  connected ??= client.connect().catch(() => { connected = null })

  return connected
}

const PREFIX = `next:${process.env.BUILD_ID ?? 'dev'}:`

export default class CacheHandler {
  async get(key) {
    try {
      await ensureConnected()

      const value = await client.get(PREFIX + key)

      return value ? JSON.parse(value) : null
    } catch {
      return null
    }
  }

  async set(key, data, ctx) {
    try {
      await ensureConnected()

      const payload = JSON.stringify({ value: data, lastModified: Date.now(), tags: ctx.tags })
      const ttl = typeof ctx.revalidate === 'number' ? ctx.revalidate * 2 : 86400

      await client.set(PREFIX + key, payload, { EX: ttl })

      for (const tag of ctx.tags ?? []) {
        await client.sAdd(`${PREFIX}tag:${tag}`, key)
      }
    } catch (error) {
      console.error('Keshga yozib bo\'lmadi', error)
    }
  }
}
```
:::

`PREFIX` da `BUILD_ID` bo'lishi muhim: yangi deploy eski keshni o'qimasin (sahifa tuzilmasi o'zgargan bo'lishi mumkin).

Kesh xatosi **ilovani sindirmasligi** kerak — `catch` bilan `null` qaytariladi va sahifa oddiygina qayta render qilinadi.

Bitta instansiya bo'lsa, `volumes: - isr-cache:/app/.next/cache` yetadi.

## Kod: rasm optimizatsiyasi

`standalone` rejimda `sharp` avtomatik ishlaydi, lekin u **CPU yeydi**:

| Yondashuv | CPU | Kesh | Qachon |
| --- | --- | --- | --- |
| O'rnatilgan `sharp` | Yuqori | Diskda | Kam rasm |
| nginx `proxy_cache` bilan | O'rtacha | nginx'da | O'rta |
| Cloudflare oldida | Past | Cloudflare | Ko'p rasm |
| Tashqi loader (imgproxy, Cloudinary) | Yo'q | Xizmatda | Juda ko'p rasm |

Tashqi loader:

::: ts
```ts
// next.config.ts
const config: NextConfig = {
  images: {
    loader: 'custom',
    loaderFile: './image-loader.ts',
  },
}
```

```ts
// image-loader.ts
export default function loader({
  src,
  width,
  quality,
}: {
  src: string
  width: number
  quality?: number
}) {
  if (src.startsWith('data:') || src.startsWith('blob:')) return src

  const params = new URLSearchParams({
    url: src.startsWith('http') ? src : `${process.env.NEXT_PUBLIC_APP_URL}${src}`,
    w: String(width),
    q: String(quality ?? 80),
    fm: 'webp',
  })

  return `${process.env.NEXT_PUBLIC_IMGPROXY_URL}/resize?${params}`
}
```
:::

::: js
```js
// image-loader.js
export default function loader({ src, width, quality }) {
  if (src.startsWith('data:') || src.startsWith('blob:')) return src

  const params = new URLSearchParams({
    url: src.startsWith('http') ? src : `${process.env.NEXT_PUBLIC_APP_URL}${src}`,
    w: String(width),
    q: String(quality ?? 80),
    fm: 'webp',
  })

  return `${process.env.NEXT_PUBLIC_IMGPROXY_URL}/resize?${params}`
}
```
:::

Rasm optimizatsiyasini butunlay o'chirish ham mumkin (`unoptimized: true`), lekin unda LCP yomonlashadi (43-bob) — faqat rasmlar allaqachon optimallashtirilgan bo'lsa.

## Kod: deploy va nol uzilish

```bash
#!/usr/bin/env bash
# scripts/deploy.sh
set -euo pipefail

cd /srv/app

echo "→ Kod tortilmoqda"
git fetch origin
git reset --hard origin/main

echo "→ Imij qurilmoqda"
docker compose build web worker

echo "→ Migratsiya (orqaga mos bo'lishi shart)"
docker compose run --rm web npx prisma migrate deploy

echo "→ Yangi instansiyalar ko'tarilmoqda"
docker compose up -d --no-deps --scale web=4 --no-recreate web

echo "→ Sog'liq kutilmoqda"
for i in {1..30}; do
  if curl -fsS http://localhost:3000/api/health > /dev/null; then
    echo "  ✓ Sog'lom"
    break
  fi

  [ "$i" -eq 30 ] && { echo "  ✗ Sog'liq tekshiruvi o'tmadi"; exit 1; }
  sleep 2
done

echo "→ Eskilari to'xtatilmoqda"
docker compose up -d --no-deps --scale web=2 web

echo "→ Tozalash"
docker image prune -f

echo "✅ Deploy tugadi"
```

Nol uzilish uchun kerak:

1. **Sog'liq endpointi** (47-bob) — yangi konteyner tayyor bo'lgunicha eskisi ishlaydi;
2. **Nozik to'xtash** — ishlab turgan so'rovlar tugatilsin;
3. **Orqaga mos migratsiya** — ikkala versiya bir sxemada ishlasin.

Nozik to'xtash Next'ning `server.js` da avtomatik emas — o'ramingiz kerak bo'lishi mumkin:

::: ts
```ts
// server.js (standalone chiqishini o'raydi)
const { createServer } = require('node:http')
const next = require('next')

const app = next({ dev: false, hostname: '0.0.0.0', port: 3000 })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => handle(req, res))

  server.listen(3000)

  let shuttingDown = false

  const shutdown = (signal) => {
    if (shuttingDown) return

    shuttingDown = true
    console.log(`${signal} — nozik to'xtash boshlandi`)

    server.close(() => {
      console.log('Barcha so\'rovlar tugadi')
      process.exit(0)
    })

    // 30 soniyadan keyin majburan
    setTimeout(() => process.exit(1), 30_000).unref()
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
})
```
:::

::: js
```js
// server.js
const { createServer } = require('node:http')
const next = require('next')

const app = next({ dev: false, hostname: '0.0.0.0', port: 3000 })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => handle(req, res))

  server.listen(3000)

  const shutdown = () => {
    server.close(() => process.exit(0))
    setTimeout(() => process.exit(1), 30_000).unref()
  }

  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
})
```
:::

## Kod: cron

Vercel cron o'rniga tizim cron:

```bash
# crontab -e
0 3 * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://example.com/api/cron/cleanup >> /var/log/cron-app.log 2>&1
0 8 * * 1 curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://example.com/api/cron/weekly-report
```

Yoki konteyner ichida `ofelia`:

```yaml
  scheduler:
    image: mcuadros/ofelia:latest
    restart: unless-stopped
    depends_on: [web]
    command: daemon --docker
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    labels:
      ofelia.job-local.cleanup.schedule: "@every 24h"
      ofelia.job-local.cleanup.command: >-
        curl -fsS -H "Authorization: Bearer ${CRON_SECRET}" http://web:3000/api/cron/cleanup
```

Kubernetes'da `CronJob`:

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: app-cleanup
spec:
  schedule: "0 3 * * *"
  concurrencyPolicy: Forbid
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
            - name: curl
              image: curlimages/curl:latest
              args:
                - -fsS
                - -H
                - "Authorization: Bearer $(CRON_SECRET)"
                - http://app-web:3000/api/cron/cleanup
              env:
                - name: CRON_SECRET
                  valueFrom:
                    secretKeyRef: { name: app-secrets, key: cron-secret }
```

## Kod: Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-web
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate: { maxSurge: 1, maxUnavailable: 0 }
  selector:
    matchLabels: { app: app-web }
  template:
    metadata:
      labels: { app: app-web }
    spec:
      terminationGracePeriodSeconds: 40
      containers:
        - name: web
          image: registry.example.com/app:${GIT_SHA}
          ports: [{ containerPort: 3000 }]

          envFrom:
            - secretRef: { name: app-secrets }
            - configMapRef: { name: app-config }

          resources:
            requests: { cpu: 250m, memory: 512Mi }
            limits:   { cpu: 1000m, memory: 1Gi }

          # Trafik qabul qilishga tayyormi
          readinessProbe:
            httpGet: { path: /api/health, port: 3000 }
            initialDelaySeconds: 10
            periodSeconds: 5
            failureThreshold: 3

          # Tirikmi (osilib qolmadimi)
          livenessProbe:
            httpGet: { path: /api/health, port: 3000 }
            initialDelaySeconds: 30
            periodSeconds: 20
            failureThreshold: 3

          # Sekin startda podni o'ldirmaslik
          startupProbe:
            httpGet: { path: /api/health, port: 3000 }
            failureThreshold: 30
            periodSeconds: 2

          lifecycle:
            preStop:
              exec:
                # Servis ro'yxatidan chiqishga ulgursin
                command: ['sh', '-c', 'sleep 5']
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: app-web
spec:
  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: app-web }
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource: { name: cpu, target: { type: Utilization, averageUtilization: 70 } }
```

`maxUnavailable: 0` + `readinessProbe` = nol uzilish.

`preStop` dagi `sleep 5` — pod o'chishidan oldin yuk balansi uni ro'yxatdan chiqarishga ulgursin.

## Kod: zaxira nusxa

Eng ko'p unutiladigan qism:

```bash
#!/usr/bin/env bash
# scripts/backup.sh
set -euo pipefail

STAMP=$(date +%Y%m%d-%H%M%S)
FILE="/backups/db-$STAMP.sql.gz"

# Zaxira
docker compose exec -T db pg_dump -U app --no-owner --clean app | gzip > "$FILE"

# Shifrlash (ixtiyoriy, lekin tavsiya etiladi)
age -r "$BACKUP_PUBLIC_KEY" -o "$FILE.age" "$FILE" && rm "$FILE"

# Uzoq saqlashga (34-bobdagi S3/R2)
aws s3 cp "$FILE.age" "s3://backups/db/" --endpoint-url "$S3_ENDPOINT"

# 7 kundan eski lokal nusxalarni o'chirish
find /backups -name 'db-*.sql.gz*' -mtime +7 -delete

echo "✅ Zaxira: $FILE.age"
```

**Tiklashni sinamagan zaxira — zaxira emas.** Oyiga bir marta:

```bash
# Tiklashni sinash
gunzip -c /backups/db-latest.sql.gz | docker compose exec -T db psql -U app -d app_restore_test
docker compose exec -T db psql -U app -d app_restore_test -c 'SELECT count(*) FROM users'
```

## Muhandislik nuqtai nazari: Vercel yoki self-host

| Mezon | Vercel | Self-host |
| --- | --- | --- |
| Boshlash vaqti | Daqiqalar | Kunlar |
| Oylik narx (kichik loyiha) | $0–20 | $5–20 (VPS) |
| Oylik narx (katta trafik) | $$$ (chiziqli) | $$ (bosqichli) |
| Ishlash vaqti (DevOps) | ~0 | Haftasiga 2–5 soat |
| CDN | Kiritilgan | Cloudflare (bepul) |
| Avtomatik masshtab | ✅ | Qo'lda / K8s |
| Fon ishlari | Navbat kerak | ✅ Tabiiy |
| WebSocket | ❌ | ✅ |
| Ma'lumot joylashuvi | Vercel regionlari | ✅ To'liq nazorat |
| Rollback | Bir bosish | Skript |
| Preview deploylar | ✅ Avtomatik | Qo'lda sozlash |
| Sovuq start | Bor (Node runtime) | Yo'q |

**Amaliy tavsiya:** Vercel'dan boshlang. Narx sezilarli bo'lganda yoki self-host'ga xos ehtiyoj paydo bo'lganda ko'chiring. Boshidan Kubernetes qurish — ko'pincha erta optimizatsiya.

Oraliq variantlar ham bor: **Railway**, **Render**, **Fly.io**, **Coolify** — Docker qabul qiladi, lekin DevOps ishining ko'pini o'zlari qiladi.

## Muhandislik nuqtai nazari: self-host'da nima buziladi

Vercel'dan ko'chirganda eng ko'p uchraydigan muammolar:

| Muammo | Sabab | Yechim |
| --- | --- | --- |
| Streaming ishlamaydi | nginx buferlaydi | `proxy_buffering off` |
| ISR instansiyalar orasida mos emas | Kesh diskda | Redis cache handler |
| `secure` cookie o'rnatilmaydi | Proksi HTTPS'ni bildirmaydi | `X-Forwarded-Proto` |
| Tezlik chegarasi hammani bloklaydi | Hamma so'rov bir IP'dan (proksi) | `X-Forwarded-For` |
| Rasm optimizatsiyasi CPU yeydi | `sharp` har so'rovda | Kesh yoki tashqi loader |
| Deploy'da so'rovlar yo'qoladi | Nozik to'xtash yo'q | `SIGTERM` ishlovi |
| Xotira oshib ketadi | Cheklov yo'q | `--max-old-space-size`, K8s limits |
| Cron ikki marta ishlaydi | Bir necha instansiya | Bitta joydan chaqirish, `Forbid` |
| Sirlar imijda | `ARG` bilan berilgan | Ish vaqtida `env` |
| `.env.local` imijda | `.dockerignore` yo'q | Qo'shing |

## Tipik xatolar

| Xato | Oqibat | To'g'ri yechim |
| --- | --- | --- |
| `output: 'standalone'` yo'q | 500 MB imij | Yoqing |
| `.dockerignore` yo'q | Sirlar imijda, sekin build | Yarating |
| Root sifatida ishlatish | Xavfsizlik | `USER nextjs` |
| `proxy_buffering` yoqiq | Streaming sinadi | `off` |
| ISR keshi bo'lishilmagan | Instansiyalar turlicha javob | Redis handler |
| Sog'liq tekshiruvi yo'q | Deploy'da uzilish | `/api/health` |
| Zaxira yo'q yoki sinalmagan | Ma'lumot yo'qolishi | Kunlik + oylik tiklash sinovi |
| Migratsiya orqaga mos emas | Rollback sindiradi | Ikki bosqichli |
| Resurs cheklovlari yo'q | Bitta konteyner serverni yeydi | `limits` |
| Loglar diskni to'ldiradi | Server to'xtaydi | `logrotate`, log drayveri |
| `BUILD_ID` keshga kirmagan | Eski kesh yangi kodga | Prefiksga qo'shing |

## Amaliyot

1. `output: 'standalone'` bilan Dockerfile yozing va imij hajmini `docker images` bilan solishtiring (oldin/keyin).
2. `.dockerignore` ni olib tashlab, build qiling va `docker run --rm -it image sh` bilan `.env.local` bor-yo'qligini tekshiring.
3. `compose.yaml` bilan to'liq stekni (web, worker, db, redis, nginx) ko'taring.
4. nginx'da `proxy_buffering on` qilib, SSE sahifasini oching — ishlamasligini ko'ring. Keyin `off` qiling.
5. Redis cache handler'ni ulang; ikki instansiya ko'tarib, `revalidateTag` ikkalasiga ham ta'sir qilishini tekshiring.
6. Deploy skriptini yozing va `curl` loop bilan deploy paytida uzilish bor-yo'qligini o'lchang.
7. Bazani zaxiralang va **bo'sh bazaga tiklang** — ishlashini tasdiqlang.
8. `docker stats` bilan xotira va CPU ishlatilishini kuzating; yuk berib (`ab` yoki `k6`) chegaralarni toping.

## Rasmiy hujjat

- Self-hosting: <https://nextjs.org/docs/app/guides/self-hosting>
- `output: 'standalone'`: <https://nextjs.org/docs/app/api-reference/config/next-config-js/output>
- Kesh handler: <https://nextjs.org/docs/app/api-reference/config/next-config-js/incrementalCacheHandlerPath>
- Rasm loader: <https://nextjs.org/docs/app/api-reference/config/next-config-js/images>
- Rasmiy Docker misoli: <https://github.com/vercel/next.js/tree/canary/examples/with-docker>
