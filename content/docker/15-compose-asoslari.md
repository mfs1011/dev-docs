# 15 — Compose asoslari

[← Oldingi: Image hajmini kamaytirish](14-image-hajmi.md) · [Mundarija](README.md)

## Tushuncha

Docker hujjati (What is Docker Compose): konteynerlar bilan ishlashning yaxshi amaliyoti — **har konteyner bitta ishni** qiladi. Haqiqiy ilova esa bir nechta qismdan iborat: veb-server, baza, kesh, navbat. Ularni alohida `docker run` lar bilan ishga tushirish mumkin, lekin tarmoqlar, parametrlar va tozalash tez orada chalkashib ketadi (4–6-boblar).

**Docker Compose** — barcha konteynerlar va ularning sozlamalarini **bitta YAML faylda** yozish. Fayl repozitoriyda tursa, uni klonlagan har kim ilovani bitta buyruq bilan ishga tushiradi.

Hujjat ikki muhim narsani ta'kidlaydi:

| | |
| --- | --- |
| **Deklarativ** | Nima bo'lishi kerakligini yozasiz. O'zgartirib, yana `docker compose up` qilsangiz, Compose faqat farqni qo'llaydi |
| **Dockerfile ≠ Compose fayli** | Dockerfile — image qanday **yig'iladi**; Compose fayli — konteynerlar qanday **ishlaydi**. Compose fayli ko'pincha servis uchun Dockerfile'ga ishora qiladi |

## Compose modeli

Docker hujjati (Compose application model):

| Tushuncha | Ma'nosi | Bob |
| --- | --- | --- |
| **Servis** (service) | Ilovaning bir qismi: bir image va sozlama bilan bir yoki bir nechta konteyner | shu bob |
| **Tarmoq** | Servislar o'rtasidagi aloqa | 16 |
| **Volume** | Doimiy ma'lumot | shu bob, 6 |
| **Configs**, **secrets** | Sozlama va maxfiy ma'lumot — konteynerga fayl sifatida | 18, 27 |
| **Loyiha** (project) | Bitta ilova to'plami; nomi resurslarni guruhlaydi va boshqa ilovalardan ajratadi | shu bob |

Fayl nomi — `compose.yaml` (afzal) yoki `compose.yml`; eski `docker-compose.yml` ham ishlaydi. Docker Compose — Compose Specification (rasmiy spetsifikatsiya) ning Docker'dagi ijrosi.

## Ilova: tashriflar hisoblagichi

Compose hujjatidagi Quickstart'dagi kabi: veb-ilova har ochilganda Redis'dagi hisoblagichni oshiradi. Ikki servis — Node.js ilova va Redis.

`server.js` (Express va `redis` kutubxonasi, 9-bobdagidek konteyner ichida o'rnatilgan):

```js
const express = require('express');
const { createClient } = require('redis');

const redis = createClient({ url: process.env.REDIS_URL });
const app = express();

app.get('/', async (req, res) => {
  const soni = await redis.incr('tashriflar');
  res.send(`Salom! Bu sahifa ${soni} marta ochildi.\n`);
});

redis.connect().then(() => {
  const server = app.listen(3000, () => console.log('Tinglayapti: 3000'));
  process.on('SIGTERM', () => server.close(() => redis.quit().then(() => process.exit(0))));
});
```

`Dockerfile` — oldingi qismdagi barcha qoidalar bilan (9-bob tartibi, 8-bob exec shakli, 12-bob `USER`):

```dockerfile
FROM node:26-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY server.js ./
USER node
CMD ["node", "server.js"]
```

`compose.yaml`:

```text vps
$ cat compose.yaml
services:
  web:
    build: .
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      REDIS_URL: redis://redis:6379
  redis:
    image: redis:8-alpine
```

| Kalit | Ma'nosi | `docker run` dagi |
| --- | --- | --- |
| `services:` | Servislar ro'yxati | — |
| `web:`, `redis:` | Servis nomlari — tarmoqdagi **nomi** ham shu (16-bob) | `--name` ga yaqin |
| `build: .` | Image'ni shu papkadagi Dockerfile'dan yig'ish | `docker build .` |
| `image: redis:8-alpine` | Tayyor image | `docker run redis:8-alpine` |
| `ports:` | Portni ochish (5-bob: `127.0.0.1` bilan) | `-p` |
| `environment:` | Muhit o'zgaruvchilari | `-e` |

`REDIS_URL: redis://redis:6379` — ilova Redis'ga **servis nomi** bilan ulanadi.

## up, ps, logs, exec

```text vps
$ docker compose up -d --build 2>&1 | grep -vE '^#|^ *$'
 Image hisob-web Building 
 Image hisob-web Built 
 Network hisob_default Creating 
 Network hisob_default Creating 
 Network hisob_default Created 
 Network hisob_default Created 
 Container hisob-web-1 Creating 
 Container hisob-redis-1 Creating 
 Container hisob-web-1 Created 
 Container hisob-redis-1 Created 
 Container hisob-web-1 Starting 
 Container hisob-redis-1 Starting 
 Container hisob-web-1 Started 
 Container hisob-redis-1 Started 
$ docker compose ps
NAME            IMAGE            COMMAND                  SERVICE   CREATED         STATUS         PORTS
hisob-redis-1   redis:8-alpine   "docker-entrypoint.s…"   redis     4 seconds ago   Up 2 seconds   6379/tcp
hisob-web-1     hisob-web        "docker-entrypoint.s…"   web       4 seconds ago   Up 3 seconds   127.0.0.1:3000->3000/tcp
```

- `docker compose up -d` — `-d` — fonda (4-bob). `--build` — `build:` dagi image'ni (qayta) yig'ish.
- Compose o'zi yaratdi: tarmoq `hisob_default` va konteynerlar `hisob-web-1`, `hisob-redis-1`. Hammasi **loyiha nomi** bilan boshlanadi — `hisob`.
- `docker compose ps` — faqat **shu loyiha** konteynerlari.

Loyiha nomi (Compose hujjati, Project name): standart holatda Compose fayli turgan **papka nomi**; `-p` parametri, `COMPOSE_PROJECT_NAME` o'zgaruvchisi yoki fayldagi `name:` bilan o'zgartiriladi. Shu tufayli bir faylni bir serverda ikki xil nom bilan ikki marta ishga tushirish mumkin.

```text vps
$ sleep 2; curl -s http://127.0.0.1:3000/
Salom! Bu sahifa 1 marta ochildi.
$ curl -s http://127.0.0.1:3000/
Salom! Bu sahifa 2 marta ochildi.
$ docker compose logs web
web-1  | Tinglayapti: 3000
$ docker network ls --filter name=hisob
NETWORK ID     NAME            DRIVER    SCOPE
079af97d173c   hisob_default   bridge    local
$ docker compose exec redis redis-cli get tashriflar
2
```

- Hisoblagich ishlayapti: `web` Redis'ni `redis` nomi bilan topdi.
- `docker compose logs web` — servis loglari, `web-1 |` prefiksi bilan (bir nechta servis loglari aralashganda qaysi biriniki ekani ko'rinadi).
- `docker compose exec redis …` — servis konteynerida buyruq (4-bobdagi `docker exec`, lekin konteyner nomi o'rniga **servis** nomi).

`curl` dan oldingi `sleep 2` tasodif emas: konteyner `Started` bo'lgani ilova tayyor degani emas. Birinchi sinovimizda `sleep` siz `curl` bo'sh javob oldi — ilova hali Redis'ga ulanayotgan edi. Buni to'g'ri hal qilish — 17-bobda.

## down va ma'lumot

```text vps
$ docker compose down
 Container hisob-web-1 Stopping 
 Container hisob-redis-1 Stopping 
 Container hisob-web-1 Stopped 
 Container hisob-web-1 Removing 
 Container hisob-redis-1 Stopped 
 Container hisob-redis-1 Removing 
 Container hisob-redis-1 Removed 
 Container hisob-web-1 Removed 
 Network hisob_default Removing 
 Network hisob_default Removed 
$ docker compose up -d 2>&1 | tail -2
 Container hisob-web-1 Started 
 Container hisob-redis-1 Started 
$ sleep 2; curl -s http://127.0.0.1:3000/
Salom! Bu sahifa 1 marta ochildi.
$ docker compose down 2>&1 | tail -1
 Network hisob_default Removed 
```

`docker compose down` (ma'lumotnoma): servis konteynerlarini va standart tarmoqni **to'xtatib, o'chiradi**. Qayta `up` — hisoblagich yana **1** dan: Redis ma'lumoti konteynerning yoziladigan qatlamida edi va u bilan birga yo'qoldi (6-bob).

Yechim — nomli volume. Compose'da u ikki joyda yoziladi: servisda (`volumes:` — qayerga ulash) va fayl oxirida, yuqori darajada (`volumes:` — e'lon):

```text vps
$ cat compose.yaml
services:
  web:
    build: .
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      REDIS_URL: redis://redis:6379
  redis:
    image: redis:8-alpine
    volumes:
      - redis-data:/data

volumes:
  redis-data:
$ docker compose up -d 2>&1 | grep -E 'Volume|Started'
 Volume hisob_redis-data Creating 
 Volume hisob_redis-data Creating 
 Volume hisob_redis-data Created 
 Volume hisob_redis-data Created 
 Container hisob-web-1 Started 
 Container hisob-redis-1 Started 
$ sleep 2; curl -s http://127.0.0.1:3000/; curl -s http://127.0.0.1:3000/
Salom! Bu sahifa 1 marta ochildi.
Salom! Bu sahifa 2 marta ochildi.
$ docker compose down 2>&1 | tail -1
 Network hisob_default Removed 
$ docker volume ls --filter name=hisob
DRIVER    VOLUME NAME
local     hisob_redis-data
$ docker compose up -d 2>&1 | tail -1
 Container hisob-redis-1 Started 
$ sleep 2; curl -s http://127.0.0.1:3000/
Salom! Bu sahifa 3 marta ochildi.
$ docker compose down -v 2>&1 | grep -E 'Volume'
 Volume hisob_redis-data Removing 
 Volume hisob_redis-data Removed 
```

- Compose `hisob_redis-data` volume'ini yaratdi.
- `down` dan keyin volume **qoldi**, qayta `up` — hisoblagich davom etdi (3).
- `down -v` — volume'larni ham o'chiradi. Ma'lumotnoma: standart holatda `down` faqat konteynerlar va tarmoqlarni o'chiradi; tashqi (`external`) tarmoq va volume'lar hech qachon o'chirilmaydi; nomsiz volume'lar `down` da o'chmaydi, lekin keyingi `up` ularni qayta ulamaydi — saqlanishi kerak bo'lgan ma'lumot uchun nomli volume yoki bind mount ishlating.

## Tipik xatolar

**1. Bitta konteynerga hamma narsani joylash.**
Ilova va baza bitta konteynerda — alohida yangilab, kengaytirib, kuzatib bo'lmaydi.
To'g'risi: har servis — alohida konteyner, Compose bilan birga.

**2. Bazaga volume bermaslik.**
`docker compose down` bilan ma'lumot yo'qoladi.
To'g'risi: nomli volume.

**3. `down -v` ni odatiy buyruq qilib olish.**
Bazaning volume'i ham o'chadi.
To'g'risi: `-v` faqat ma'lumotni ataylab o'chirish kerak bo'lganda.

**4. Kod o'zgargandan keyin `--build` siz `up`.**
Eski image bilan ishlaydi.
To'g'risi: `docker compose up -d --build` (yoki 18-bobdagi `watch`).

**5. Servislarni IP bilan ulash.**
To'g'risi: servis nomi (`redis:6379`).

## Amaliyot

Savollar:

1. Dockerfile va Compose fayli farqi nima?
2. `/srv/blog/compose.yaml` dan ishga tushgan loyiha konteynerlari qanday nomlanadi?
3. `docker compose down` dan keyin nima qoladi?
4. Redis hisoblagichi `down`/`up` dan keyin nega yo'qoldi va qanday saqlanadi?
5. `web` servisi Redis'ga qaysi manzil bilan ulanadi va nega?

<details>
<summary>Javoblar</summary>

1. Dockerfile — image qanday yig'iladi; Compose fayli — konteynerlar (servislar) qanday ishga tushadi va bog'lanadi.
2. `blog-<servis>-1`: loyiha nomi papka nomidan (`blog`).
3. Nomli volume'lar, image'lar va tashqi resurslar; konteynerlar va standart tarmoq o'chadi.
4. Ma'lumot konteyner qatlamida edi; nomli volume (`redis-data:/data`) bilan saqlanadi.
5. `redis://redis:6379`: Compose tarmog'ida servislar bir-birini servis nomi bilan topadi.

</details>

## Rasmiy hujjat

- [What is Docker Compose?](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-docker-compose/)
- [How Compose works (application model)](https://docs.docker.com/compose/intro/compose-application-model/) — servis, tarmoq, volume, loyiha, fayl nomi
- [Compose Quickstart](https://docs.docker.com/compose/gettingstarted/)
- [Services top-level element](https://docs.docker.com/reference/compose-file/services/) · [Volumes top-level element](https://docs.docker.com/reference/compose-file/volumes/)
- [Specify a project name](https://docs.docker.com/compose/how-tos/project-name/)
- [docker compose down](https://docs.docker.com/reference/cli/docker/compose/down/)
