# 10 — Multi-stage build

[← Oldingi: Build kesh](09-build-kesh.md) · [Mundarija](README.md)

## Tushuncha

Docker hujjati (Multi-stage builds): oddiy build'da hamma ish — bog'liqliklarni yuklash, kodni kompilyatsiya qilish, qadoqlash — bitta muhitda bajariladi va **barcha qatlamlar** yakuniy image'ga tushadi. Natija — og'ir image va kattaroq xavfsizlik riski: ishlab turgan ilovaga kerak bo'lmagan kompilyator va vositalar ham production'ga boradi.

**Multi-stage build** — Dockerfile'da bir nechta **bosqich** (stage), har biri o'z `FROM` i bilan:

| Bosqich | Nima qiladi | Asos |
| --- | --- | --- |
| Build | Vositalarni o'rnatadi, kodni yig'adi/kompilyatsiya qiladi | Vositalari bor image |
| Yakuniy | Faqat tayyor natijani (artefaktni) build bosqichidan oladi va ishga tushiradi | Kichikroq image |

Hujjat: multi-stage build **har qanday ilova** uchun tavsiya etiladi — kompilyatsiya qilinadigan tillarda (Go, Rust) yakuniy image'ga faqat tayyor dastur, interpretatsiya qilinadiganlarda (JavaScript, Python) — yig'ilgan va siqilgan production fayllari tushadi.

## Ilova: TypeScript

TypeScript kodi to'g'ridan-to'g'ri ishlamaydi — avval `tsc` uni JavaScript'ga kompilyatsiya qiladi. `tsc` (TypeScript) va Node.js tiplari (`@types/node`) faqat **yig'ish** uchun kerak: `devDependencies`.

`src/server.ts`:

```ts
import http from 'node:http';

const port = Number(process.env.PORT ?? 3000);

const server = http.createServer((req, res) => {
  res.end(`Salom, TypeScript! Node.js ${process.version}\n`);
});

server.listen(port, () => console.log(`Tinglayapti: ${port}`));

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "es2023",
    "module": "nodenext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "types": ["node"]
  }
}
```

Bog'liqliklarni 9-bobdagidek konteyner ichida qo'shdik:

```text vps
$ docker run --rm -v /root/ms:/app -w /app node:26-alpine npm install -D typescript @types/node

added 4 packages, and audited 5 packages in 11s

found 0 vulnerabilities
npm notice
npm notice New major version of npm available! 11.20.0 -> 12.2.2
npm notice Changelog: https://github.com/npm/cli/releases/tag/v12.2.2
npm notice To update run: npm install -g npm@12.2.2
npm notice
```

`npm install` TypeScript 7.0.2 ni o'rnatdi. Sinovda `"types": ["node"]` siz `tsc` `Cannot find name 'process'` xatosini berdi va o'zi `types` maydoniga `node` ni qo'shishni maslahat qildi — shuning uchun u `tsconfig.json` da bor.

## Ikki Dockerfile

Bitta bosqichli (`Dockerfile.bitta`) — 9-bobdagi to'g'ri tartib bilan:

```dockerfile
FROM node:26-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["node", "dist/server.js"]
```

Ko'p bosqichli (`Dockerfile`):

```dockerfile
FROM node:26-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:26-alpine AS ishga
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
CMD ["node", "dist/server.js"]
```

- `FROM … AS build` — bosqichga nom (hujjat: nomlar Dockerfile'dagi tartib o'zgarsa ham `COPY --from` ni buzmaydi; nomsiz bosqichlarga raqam bilan murojaat qilinadi — `--from=0`).
- `build` bosqichi: barcha bog'liqliklar (TypeScript bilan) va `npm run build` → `dist/server.js`.
- `ishga` bosqichi: **toza** `node:26-alpine` dan boshlanadi, faqat production bog'liqliklari (`npm ci --omit=dev`) va `COPY --from=build /app/dist ./dist` — build bosqichidan faqat tayyor JavaScript.
- Yakuniy image — **oxirgi** bosqich. `build` bosqichining qatlamlari unga tushmaydi.

## Yig'ish va solishtirish

```text vps
$ docker build -q -t ts-ilova:bitta -f Dockerfile.bitta .
sha256:0c31f08adb9b134c7b2413c44ad92aa1c7175c7876ef35629a6cf98892f47461
$ docker build --progress=plain -t ts-ilova:2 . 2>&1 | grep -E '^#[0-9]+ \[(build|ishga) [0-9]/[0-9]\]'
#5 [build 1/6] FROM docker.io/library/node:26-alpine@sha256:8996bb5821d62a8fd9bb27c1cb07462f3fdce6e47d640c6a881ead0b064ce216
#6 [build 2/6] WORKDIR /app
#7 [build 3/6] COPY package.json package-lock.json ./
#8 [build 4/6] RUN npm ci
#9 [build 5/6] COPY . .
#10 [build 6/6] RUN npm run build
#11 [ishga 4/5] RUN npm ci --omit=dev
#12 [ishga 5/5] COPY --from=build /app/dist ./dist
$ docker image ls ts-ilova
IMAGE            ID             DISK USAGE   CONTENT SIZE   EXTRA
ts-ilova:2       9888f2857049        255MB         63.5MB        
ts-ilova:bitta   0c31f08adb9b        322MB         84.6MB        
```

- `[build …]` va `[ishga …]` — qaysi bosqichning qaysi qadami. `ishga` ning 1–3-qadamlari ro'yxatda yo'q: ular `build` ning 1–3-qadamlari bilan aynan bir xil, BuildKit ularni bir marta bajardi (kuzatildi).
- Hajm: 322MB → 255MB (`DISK USAGE`), 84.6MB → 63.5MB (`CONTENT SIZE`). Asos image (`node:26-alpine`) ning o'zi 251MB edi (7-bob) — demak bitta bosqichlida ilovaning "o'zi" ~71MB, ko'p bosqichlida ~4MB.

Ichida nima bor:

```text vps
$ docker run --rm ts-ilova:bitta ls
dist
node_modules
package-lock.json
package.json
src
tsconfig.json
$ docker run --rm ts-ilova:2 ls
dist
package-lock.json
package.json
$ docker run --rm ts-ilova:bitta ls node_modules
@types
@typescript
typescript
undici-types
$ docker run --rm ts-ilova:2 sh -c 'ls node_modules | wc -l'
0
ls: node_modules: No such file or directory
```

- Bitta bosqichlida: manba kod (`src`), `tsconfig.json` va butun TypeScript kompilyatori — ishlab turgan server uchun keraksiz.
- Ko'p bosqichlida: faqat `dist` va paket fayllari. Bu ilovaning production bog'liqligi yo'q — `npm ci --omit=dev` hech narsa o'rnatmadi, `node_modules` ham yo'q. Express kabi bog'liqlik bo'lsa, faqat o'sha bo'lardi.

Ishlayaptimi:

```text vps
$ docker run -d --name ts -p 127.0.0.1:3000:3000 ts-ilova:2
0dd09ab8058dc0590144a1049e6489a7e7c001756724dd4d93a73086efa2af5c
$ sleep 1; curl -s http://127.0.0.1:3000/
Salom, TypeScript! Node.js v26.13.0
$ docker rm -f ts
ts
```

## Ma'lum bosqichda to'xtash: `--target`

Hujjat: `docker build --target <bosqich>` — butun Dockerfile'ni emas, ko'rsatilgan bosqichgacha yig'adi. Qo'llanishlari: bitta bosqichni tekshirish (debug), debug vositalari bor bosqich va yengil production bosqichi, test bosqichi.

```text vps
$ docker build -q --target build -t ts-ilova:build .
sha256:e102c7bbdd9c5dd89cd4f083c25f134f7c8b4a1dc1796886cc912fc5912b7806
$ docker run --rm ts-ilova:build ls dist
server.js
```

`build` bosqichi alohida image bo'ldi — unda kompilyatsiya natijasi bor, kerak bo'lsa ichida testlar ishga tushiriladi (26-bob).

Hujjat yana bir farqni aytadi: eski (legacy) builder `--target` gacha bo'lgan **hamma** bosqichlarni quradi, BuildKit esa faqat tanlangan bosqich **bog'liq** bo'lganlarini — keraksiz bosqichlar o'tkazib yuboriladi.

## Boshqa image'dan nusxalash

`COPY --from` faqat o'z bosqichlaringizdan emas, istalgan image'dan ham fayl oladi (hujjatdagi misol):

```dockerfile
COPY --from=nginx:latest /etc/nginx/nginx.conf /nginx.conf
```

## Tipik xatolar

**1. Kompilyator va manba kodni production image'ga olib ketish.**
Image og'ir, hujum yuzasi katta.
To'g'risi: build bosqichida yig'ish, yakuniy bosqichga faqat natija.

**2. Yakuniy bosqichda `npm ci` (barcha bog'liqliklar).**
`devDependencies` ham tushadi.
To'g'risi: `npm ci --omit=dev`.

**3. Bosqichlarga nom bermaslik.**
`--from=0` — bosqichlar tartibi o'zgarsa buziladi.
To'g'risi: `AS build` va `--from=build`.

**4. `COPY --from=build` da noto'g'ri yo'l.**
Yo'l build bosqichining ichidagi yo'l (`/app/dist`), kompyuteringizniki emas.

## Amaliyot

Savollar:

1. Multi-stage build'da yakuniy image qaysi bosqichdan olinadi?
2. `COPY --from=build /app/dist ./dist` nima qiladi?
3. Bizning misolda image nega 322MB dan 255MB ga kamaydi?
4. `docker build --target build` qachon foydali?
5. BuildKit va eski builder `--target` da qanday farq qiladi?

<details>
<summary>Javoblar</summary>

1. Oxirgi bosqichdan.
2. `build` bosqichining fayl tizimidagi `/app/dist` ni joriy bosqichga nusxalaydi.
3. Yakuniy image'ga TypeScript kompilyatori, `@types` va manba kod tushmadi — faqat kompilyatsiya qilingan `dist`.
4. Bitta bosqichni tekshirish, test yoki debug bosqichini alohida yig'ish uchun.
5. Eski builder targetgacha hamma bosqichni quradi; BuildKit — faqat target bog'liq bo'lganlarini.

</details>

## Rasmiy hujjat

- [Multi-stage builds (concept)](https://docs.docker.com/get-started/docker-concepts/building-images/multi-stage-builds/) — nega kerak
- [Multi-stage builds](https://docs.docker.com/build/building/multi-stage/) — `AS`, `COPY --from`, `--target`, tashqi image'dan nusxalash, BuildKit farqi
- [npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci) — `--omit=dev`
- [TypeScript: tsconfig `types`](https://www.typescriptlang.org/tsconfig/#types)
