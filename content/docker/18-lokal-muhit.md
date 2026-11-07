# 18 — Lokal ishlab chiqish muhiti

[← Oldingi: Ishga tushish tartibi va healthcheck](17-healthcheck.md) · [Mundarija](README.md) · [Keyingi: Profillar va bir nechta fayl →](19-profillar-va-fayllar.md)

## Tushuncha

Ishlab chiqishda kodni har o'zgartirganda `docker compose up --build` yozish — sekin. Ikki yo'l bor:

| Yo'l | Nima qiladi | Qachon |
| --- | --- | --- |
| **Bind mount** (6-bob) | Kompyuterdagi papka konteynerga to'g'ridan-to'g'ri ulanadi | Oddiy holatlar; fayllar ikkala tomonda bir xil |
| **Compose Watch** | Fayl o'zgarishini kuzatib, konteynerga sinxronlaydi, servisni qayta ishga tushiradi yoki image'ni qayta yig'adi | Qaysi fayllar, qanday ta'sir qilishini aniq boshqarish kerak bo'lsa |

Ikkinchi mavzu — **o'zgaruvchilar**: bir Compose faylini turli kompyuterlarda (port, versiya, sozlama) o'zgartirmasdan ishlatish.

## Compose Watch

Docker hujjati (Use Compose Watch): `watch` bind mount'ni almashtirmaydi — u konteynerda ishlab chiqish uchun **yordamchi**. Uning afzalligi — nozik nazorat: ma'lum fayl va papkalarni e'tiborsiz qoldirish mumkin. Masalan, Node.js loyihasida `node_modules` ni sinxronlamaslik tavsiya etiladi: ko'p mayda fayl I/O yuklamasini oshiradi va npm paketlarida turli platformalarga ko'chmaydigan native kod bo'lishi mumkin (13-bob: noutbuk arm64, konteyner boshqa).

Uch xil `action`:

| `action` | Nima bo'ladi | Hujjatdagi qo'llanish |
| --- | --- | --- |
| `sync` | O'zgargan fayl konteynerga nusxalanadi | "Hot reload"li framework'lar |
| `sync+restart` | Nusxalanadi va servis konteyneri qayta ishga tushadi | Sozlama fayllari (`nginx.conf`), hot reload'siz ilovalar |
| `rebuild` | Image qayta yig'iladi va servis almashtiriladi (`up --build` kabi) | `package.json` kabi, image'ni qayta yig'ishni talab qiladigan fayllar |

Hujjatdagi qoidalar:

- `watch` faqat `build:` li servislar uchun ishlaydi (`image:` dagi tayyor image'lar kuzatilmaydi).
- Yo'llar loyiha papkasiga nisbatan; papkalar ichma-ich kuzatiladi; `.dockerignore` qoidalari amal qiladi; `.git` va muharrirlarning vaqtinchalik fayllari avtomatik e'tiborsiz qoladi.
- Image'da `stat`, `mkdir`, `rmdir` bo'lishi kerak.
- **Konteynerning `USER` i maqsad papkaga yoza olishi kerak** — shuning uchun fayllar `COPY --chown` bilan nusxalanadi.

15-bobdagi Dockerfile'da `server.js` root nomidan nusxalangan edi (`USER node` undan keyin) — `watch` uni yangilay olmaydi. Bitta qatorni o'zgartiramiz:

```dockerfile
COPY --chown=node:node server.js ./
```

`compose.yaml`:

```yaml
services:
  web:
    build: .
    ports:
      - "127.0.0.1:${WEB_PORT:-3000}:3000"
    environment:
      REDIS_URL: redis://redis:6379
    develop:
      watch:
        - action: sync+restart
          path: ./server.js
          target: /app/server.js
        - action: rebuild
          path: package.json
  redis:
    image: redis:8-alpine
```

- `server.js` o'zgarsa — nusxalanadi va servis qayta ishga tushadi (Node.js o'zi kodni qayta yuklamaydi).
- `package.json` o'zgarsa — yangi bog'liqliklar bilan image qayta yig'iladi.
- `${WEB_PORT:-3000}` — o'zgaruvchi, pastda.

```text vps
$ docker compose up -d --build 2>&1 | grep Started
 Container s18-web-1 Started 
 Container s18-redis-1 Started 
$ sleep 4; curl -s http://127.0.0.1:3001/
Salom! Bu sahifa 1 marta ochildi.
```

`docker compose watch` — ilovani ishga tushiradi (kerak bo'lsa yig'ib) va fayllarni kuzatadi; u oldingi rejimda ishlaydi — biz uni fonga yubordik va chiqishini faylga yozdik. Endi `server.js` ni o'zgartiramiz:

```text vps
$ nohup docker compose watch > watch.log 2>&1 &
$ sleep 5; sed -i 's/Salom!/Assalomu alaykum!/' server.js
$ sleep 6; curl -s http://127.0.0.1:3001/
Assalomu alaykum! Bu sahifa 2 marta ochildi.
$ grep -vE '^#|^$' watch.log
 Image s18-web Building 
 Image s18-web Built 
 Container s18-web-1 Running 
 Container s18-redis-1 Running 
Watch enabled
Syncing service "web" after 1 changes were detected
 Container s18-web-1 Restarting 
 Container s18-web-1 Started 
service(s) ["web"] restarted
```

- `Syncing service "web" after 1 changes were detected` → `Restarting` → `Started`: o'zgarish konteynerga yetdi va servis qayta ishga tushdi — biz hech qanday buyruq yozmadik.
- Hisoblagich 2 — Redis ma'lumoti joyida (faqat `web` qayta ishga tushdi).

```text vps
$ kill %1; sleep 1; docker compose down 2>&1 | tail -1
 Network s18_default Removed 
```

## O'zgaruvchilar: interpolatsiya

Docker hujjati (Interpolation): Compose faylida o'zgaruvchilar ishlatish mumkin — qiymatlari ishga tushirishda qo'yiladi. Ular qobiqdan (shell) yoki loyiha papkasidagi `.env` faylidan olinadi.

| Sintaksis | Natija |
| --- | --- |
| `${VAR}` | `VAR` qiymati |
| `${VAR:-standart}` | `VAR` berilgan va bo'sh bo'lmasa — uning qiymati, aks holda `standart` |
| `${VAR:?xabar}` | `VAR` bo'sh yoki yo'q bo'lsa — xato bilan to'xtash |
| `$$` | `$` belgisining o'zi (17-bob) |

`docker compose config` — hujjat: barcha o'zgaruvchilar qo'yilgan **yakuniy** konfiguratsiyani chiqaradi:

```text vps
$ cat .env
WEB_PORT=3001
$ docker compose config | grep -A4 ports
    ports:
      - mode: ingress
        host_ip: 127.0.0.1
        target: 3000
        published: "3001"
$ WEB_PORT=4000 docker compose config | grep published
        published: "4000"
```

- `.env` dagi `WEB_PORT=3001` qo'yildi.
- Qobiqdagi o'zgaruvchi (`WEB_PORT=4000 docker compose …`) `.env` dagidan ustun.
- Hech qayerda berilmasa — `:-3000` standarti.

### `.env` va konteynerning muhiti — boshqa-boshqa narsa

| | Kimga | Qayerda |
| --- | --- | --- |
| `.env` (interpolatsiya) | **Compose'ga** — faylni to'ldirish uchun | `${VAR}` |
| `environment:`, `env_file:` | **Konteynerga** — ilova o'qiydigan muhit o'zgaruvchilari | Servis ichida |

`.env` dagi o'zgaruvchi konteynerga **o'z-o'zidan tushmaydi** — faqat Compose faylida `${…}` orqali ishlatilsa. Konteynerga berish — `environment:` (15-bobdagi `REDIS_URL`) yoki `env_file: ilova.env`.

Hujjat (Environment variables precedence) bir xil o'zgaruvchi bir necha joyda berilsa, ustunlik tartibi (yuqoridan pastga):

1. `docker compose run -e` (buyruq qatorida);
2. `environment:`/`env_file:` dagi, qiymati qobiqdan yoki `.env` dan interpolatsiya qilingani;
3. faqat `environment:` da yozilgani;
4. `env_file:` dagisi;
5. image'dagi `ENV` (7-bob).

Hujjatdagi ogohlantirish (best practices): muhit o'zgaruvchilariga maxfiy ma'lumot qo'yishda ehtiyot bo'ling — sirlar uchun Compose'ning `secrets` imkoniyati bor (27-bob).

## Tipik xatolar

**1. `node_modules` ni bind mount yoki `sync` bilan ulash.**
Noutbukdagi (masalan, macOS) native modullar Linux konteynerda ishlamasligi mumkin.
To'g'risi: `node_modules` — image ichida (`npm ci`), `watch` da e'tiborsiz.

**2. `USER` bilan, lekin `--chown` siz `COPY`.**
`watch` fayllarni yangilay olmaydi.
To'g'risi: `COPY --chown=node:node …`.

**3. `.env` ni konteynerga beriladi deb o'ylash.**
U faqat Compose faylini to'ldiradi.
To'g'risi: `environment:` yoki `env_file:`.

**4. `.env` ni (sirlar bilan) git'ga qo'shish.**
To'g'risi: `.gitignore`, namunani `.env.example` qilib saqlash.

## Amaliyot

Savollar:

1. `sync`, `sync+restart` va `rebuild` qachon ishlatiladi?
2. `watch` nega `image: redis` servisini kuzatmaydi?
3. `.env` da `TAG=2` va qobiqda `TAG=3`. `image: ilova:${TAG}` qaysi teg oladi?
4. `.env` dagi `DB_PASSWORD` konteyner ichida ko'rinadimi?
5. Yakuniy konfiguratsiyani qanday ko'rasiz?

<details>
<summary>Javoblar</summary>

1. `sync` — hot reload'li ilovalarda fayllarni nusxalash; `sync+restart` — qayta ishga tushirish kerak bo'lganda (sozlama, hot reload'siz ilova); `rebuild` — image'ni qayta yig'ish kerak bo'lganda (`package.json`).
2. `watch` faqat `build:` li servislar uchun.
3. `3` — qobiqdagi `.env` dan ustun.
4. Yo'q — faqat Compose faylida `${DB_PASSWORD}` bilan `environment:` ga berilsa.
5. `docker compose config`.

</details>

## Rasmiy hujjat

- [Use Compose Watch](https://docs.docker.com/compose/how-tos/file-watch/) — `action`lar, qoidalar, bind mount bilan farqi
- [Compose file: develop](https://docs.docker.com/reference/compose-file/develop/)
- [Interpolation](https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/) · [Environment variables precedence](https://docs.docker.com/compose/how-tos/environment-variables/envvars-precedence/) · [Set environment variables](https://docs.docker.com/compose/how-tos/environment-variables/set-environment-variables/)
- [docker compose config](https://docs.docker.com/reference/cli/docker/compose/config/)
