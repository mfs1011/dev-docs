# 22 — Node.js va Next.js

[← Oldingi: PHP: Laravel va Symfony](21-php-laravel-symfony.md) · [Mundarija](README.md) · [Keyingi: SPA: React, Vue, Angular →](23-spa.md)

## Tushuncha

Docker'ning ikki qo'llanmasi: **Node.js** (backend API) va **Next.js** (React framework'i, server tomonida render — SSR bilan). Node.js uchun kerakli hamma narsa oldingi boblarda bor — bu bobda ularni qo'llanma bilan bog'laymiz. Next.js'da esa bitta muhim yangilik bor — **standalone** build.

## Node.js: qo'llanma va bizning boblar

Docker hujjati (Node.js language-specific guide) TypeScript'da yozilgan Express API'ni bosqichma-bosqich konteynerga joylaydi. Qo'llanmadagi har qadam kitobning qaysi bobida:

| Qo'llanmada | Bob |
| --- | --- |
| Multi-stage Dockerfile: TypeScript `builder` da kompilyatsiya, yakuniy image'da faqat `dist` va production bog'liqliklari | 10 |
| `compose.yaml` va `docker compose up --build` | 15 |
| `.dockerignore` | 9 |
| PostgreSQL servisi, nomli volume | 6, 15, 24 |
| Compose Watch — kod o'zgarishi avtomatik konteynerga | 18 |
| `target: dev` — Compose ishlab chiqishda Dockerfile'ning `dev` bosqichini ishlatadi (unda `tsx` kabi vositalar), production image'da esa ular yo'q | 10, 19 |
| Ishlab turgan production konteynerida qobiq kerak bo'lsa — `docker debug` | 11 |

Qo'shimcha, kitobda ko'rganimiz: exec shaklidagi `CMD` va `SIGTERM` ishlovchisi (8-bob), `USER node` (12-bob), `npm ci` va cache mount (9-, 13-boblar).

## Next.js: standalone

Docker hujjati (Next.js guide) ikki yo'lni beradi:

| `output` | Natija | Kim beradi |
| --- | --- | --- |
| `"standalone"` | O'zi yetarli Node.js server: `node server.js` — SSR, API marshrutlari, ISR bilan | Node.js konteyneri |
| `"export"` | Faqat statik fayllar | Nginx (23-bob) |

Hujjat: `output: "standalone"` bilan Next.js build faqat ilovani ishga tushirish uchun **kerakli fayllar va bog'liqliklarni** o'z ichiga olgan papka (`.next/standalone`) yaratadi — bitta `node server.js` uni xizmat qiladi.

### Ilova

Next.js loyihasi odatda `create-next-app` bilan yaratiladi; bizga eng kichigi yetarli — to'rt fayl:

`package.json` (bog'liqliklar konteyner ichida `npm install next react react-dom` bilan qo'shildi — Next.js 16.4.5, React 19.3.1):

```json
{
  "name": "next-ilova",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "next build",
    "start": "next start"
  }
}
```

`next.config.mjs`:

```js
const nextConfig = {
  output: 'standalone',
};

export default nextConfig;
```

`app/layout.js` va `app/page.js` — sahifa har so'rovda serverda render bo'ladi (`force-dynamic`) va server vaqtini ko'rsatadi:

```js
export const dynamic = 'force-dynamic';

export default function Page() {
  return <h1>Salom, Next.js! Server vaqti: {new Date().toISOString()}</h1>;
}
```

### Dockerfile

Qo'llanmadagi Dockerfile — uch bosqich. Biz uni rasmiy `node` image'i bilan (qo'llanmada Node.js 24, bizda — 26, 7-bob) va faqat `npm` uchun qisqartirib oldik:

```dockerfile
FROM node:26-slim AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

FROM node:26-slim AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build

FROM node:26-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
COPY --from=builder --chown=node:node /app/public ./public
RUN mkdir .next && chown node:node .next
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3000
CMD ["node", "server.js"]
```

| Bosqich | Nima |
| --- | --- |
| `dependencies` | `npm ci` cache mount bilan (13-bob) |
| `builder` | `npm run build` → `.next/standalone` va `.next/static` |
| `runner` | Faqat `standalone`, `static` va `public`; `USER node`; `node server.js` |

- `PORT` va `HOSTNAME` — Next.js hujjati (output): `server.js` qaysi port va manzilda tinglashini shu o'zgaruvchilar belgilaydi; `HOSTNAME=0.0.0.0` — konteynerning barcha interfeyslarida, shunda `-p` orqali kelgan so'rov serverga yetadi.
- `.next/static` va `public` — Next.js hujjati: minimal `server.js` ularni standart holatda o'zi nusxalamaydi (ular CDN orqali berilishi ko'zda tutilgan); `standalone` ichiga qo'lda nusxalansa, `server.js` ularni o'zi beradi. Shuning uchun alohida `COPY`.
- `mkdir .next && chown` — qo'llanmadagi izoh: prerender keshi uchun yozish huquqi (12-bob: `USER node`).

Taqqoslash uchun — "oddiy" Dockerfile: hammasini nusxalab, `npm start` (`next start`):

```dockerfile
FROM node:26-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### Yig'ish va natija

```text vps
$ time docker build -q -t next-ilova:standalone .
sha256:b3b8405c39610156a6b9688944296e7a696233f85b43c49bfc9d07a052792971

real	1m7.590s
user	0m0.175s
sys	0m0.222s
$ docker build -q -f Dockerfile.oddiy -t next-ilova:oddiy .
sha256:01d581f8a66f49cc239d374c15cee0d9210ec2a1494c758c2b920a3a549c542e
$ docker image ls --format 'table {{.Repository}}:{{.Tag}}\t{{.Size}}' next-ilova
REPOSITORY:TAG          SIZE
next-ilova:oddiy        1.08GB
next-ilova:standalone   406MB
$ docker run --rm next-ilova:standalone ls -a
.
..
.next
node_modules
package.json
public
server.js
```

- Standalone image — **406MB**, "oddiy"i — **1.08GB**: ikkinchisida butun `node_modules` (build vositalari bilan), manba kod va `.next` ning hammasi.
- Standalone image ichida faqat `server.js`, `package.json`, `public`, `.next` va kuzatib (trace) tanlangan minimal `node_modules`.
- Build 1 CPU'li serverda ~1 daqiqa.

```text vps
$ docker run -d --name nx -p 127.0.0.1:3000:3000 next-ilova:standalone
d2ce964645980a181e42e3069e654ae36811fc94f22c50b4b2edf9b9b808e613
$ sleep 3; curl -s http://127.0.0.1:3000/ | grep -o '<h1>.*</h1>'
<h1>Salom, Next.js! Server vaqti: <!-- -->2026-11-07T22:07:38.593Z</h1>
$ docker logs nx
▲ Next.js 16.4.5
- Local:         http://localhost:3000
- Network:       http://0.0.0.0:3000
✓ Ready in 0ms
✓ Running next.config took 8ms
$ docker exec nx id
uid=1000(node) gid=1000(node) groups=1000(node)
$ time docker stop nx
nx

real	0m0.215s
user	0m0.016s
sys	0m0.017s
$ docker rm nx
nx
```

- Sahifa serverda render bo'ldi — vaqt har so'rovda yangi (`force-dynamic`).
- Loglarda `Network: http://0.0.0.0:3000` — `HOSTNAME` ishladi.
- `uid=1000(node)` — root emas (12-bob).
- `docker stop` 0.2 soniya: `node server.js` exec shaklida, Next.js serveri `SIGTERM` da to'xtadi (8-bob).

## Tipik xatolar

**1. Next.js'ni `npm start` bilan, butun `node_modules` va manba kod bilan.**
Image katta, ichida keraksiz manba kod va bog'liqliklar.
To'g'risi: `output: "standalone"` va `node server.js`.

**2. `PORT`/`HOSTNAME` ni o'ylamaslik.**
`server.js` qayerda tinglashi shu o'zgaruvchilarga bog'liq.
To'g'risi: qo'llanmadagidek `PORT=3000`, `HOSTNAME="0.0.0.0"`.

**3. `.next/static` va `public` ni unutish.**
Sahifa ochiladi, lekin CSS/JS/rasmlar 404.
To'g'risi: ikkalasini ham `runner` ga `COPY`.

**4. Development vositalarini production image'ga olib kirish.**
To'g'risi: `dev` bosqichi alohida, `target:` bilan (Node.js qo'llanmasi).

## Amaliyot

Savollar:

1. `output: "standalone"` nima beradi?
2. Standalone image'da `server.js` qayerdan keladi?
3. `HOSTNAME="0.0.0.0"` nima qiladi?
4. `output: "export"` qachon tanlanadi va uni kim xizmat qiladi?
5. Node.js qo'llanmasidagi `target: dev` nima uchun?

<details>
<summary>Javoblar</summary>

1. Faqat ishlash uchun kerakli fayl va bog'liqliklardan iborat papka — `node server.js` bilan ishlaydigan o'zi yetarli server.
2. `npm run build` uni `.next/standalone` ga yaratadi; `runner` bosqichi shu papkani nusxalaydi.
3. `server.js` shu manzilda tinglaydi: `0.0.0.0` — konteynerning barcha interfeyslari, shunda `-p` orqali kelgan so'rov yetadi.
4. Ilova to'liq statik bo'lsa (SSR/API yo'q); statik fayllarni Nginx beradi (23-bob).
5. Ishlab chiqishda Dockerfile'ning dev vositalari bor bosqichidan foydalanish, production image'ni toza qoldirish.

</details>

## Rasmiy hujjat

- [Docker Guides: Node.js](https://docs.docker.com/guides/nodejs/)
- [Docker Guides: Next.js](https://docs.docker.com/guides/nextjs/) — standalone va export, uch bosqichli Dockerfile
- [Next.js: output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output) — `standalone`
