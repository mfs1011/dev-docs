# 12 — Xavfsiz va to'g'ri image

[← Oldingi: Base image tanlash](11-base-image.md) · [Mundarija](README.md) · [Keyingi: BuildKit imkoniyatlari →](13-buildkit.md)

## Tushuncha

Kichik base image (11-bob) — xavfsizlikning birinchi qadami. Bu bobda yana to'rttasi:

| Xavf | Chora | Rasmiy manba |
| --- | --- | --- |
| Konteynerdagi ilova root huquqi bilan ishlaydi | `USER` — oddiy foydalanuvchi | Best practices: USER |
| Parol yoki token image ichida qoladi | Build secret (`RUN --mount=type=secret`) | Build secrets |
| Dockerfile'dagi xato va yomon amaliyotlar | Build checks (`docker build --check`) | Build checks |
| Base image va kutubxonalardagi ma'lum zaifliklar | Docker Scout bilan skanerlash | Docker Scout |

## Root'siz konteyner: `USER`

7-bobdagi image kim nomidan ishlaydi?

```text vps
$ docker run --rm salom-ilova:2 id
uid=0(root) gid=0(root) groups=0(root),0(root),1(bin),2(daemon),3(sys),4(adm),6(disk),10(wheel),11(floppy),20(dialout),26(tape),27(video)
```

`uid=0(root)`. Ilovada zaiflik topilib, kimdir buyruq bajara olsa — konteyner ichida u root. Docker hujjati (Best practices — USER): servis imtiyozsiz ishlay olsa, `USER` bilan root bo'lmagan foydalanuvchiga o'ting.

Rasmiy Node.js image'ida tayyor `node` foydalanuvchisi bor:

```text vps
$ cat Dockerfile.user
FROM node:26-alpine
WORKDIR /app
COPY package.json server.js ./
USER node
CMD ["node", "server.js"]
$ docker build -q -t salom-ilova:user -f Dockerfile.user .
sha256:2f84bb9a8ef8ddd84eaeb3514efc403e856104bfbc1a1264936bca22fcb9b46f
$ docker run --rm salom-ilova:user id
uid=1000(node) gid=1000(node) groups=1000(node),1000(node)
$ docker run --rm salom-ilova:user touch /etc/sinov
touch: /etc/sinov: Permission denied
```

- `USER node` — keyingi `RUN` va konteynerning o'zi `node` (UID 1000) nomidan.
- `/etc` ga yozib bo'lmaydi — `Permission denied`: tizim fayllari root'niki.
- `USER` dan oldingi `COPY` fayllari root'ga tegishli — ilova ularni o'qiy oladi, lekin o'zgartira olmaydi. Ilova biror papkaga yozishi kerak bo'lsa, unga huquqni alohida bering (`COPY --chown=node:node …` yoki volume, 6-bob).

O'z foydalanuvchingizni yaratish kerak bo'lsa, hujjat misoli: `RUN groupadd -r ilova && useradd --no-log-init -r -g ilova ilova`. Hujjat eslatmasi: UID/GID aniq ko'rsatilmasa, ular har build'da boshqacha bo'lishi mumkin — muhim bo'lsa, aniq UID/GID bering (volume'dagi fayllar egasi mos kelishi uchun).

Bu konteyner ichidagi root haqida. Daemon'ning o'zini root'siz ishga tushirish (Rootless mode) — boshqa narsa (2-bob).

## Sirlar build'ga qanday tushmasligi kerak

Ilova yig'ilishida ba'zan sir kerak bo'ladi: yopiq npm registry tokeni, yopiq Git repozitoriysi. Docker hujjati (Build secrets): build argumentlari (`ARG`) va muhit o'zgaruvchilari (`ENV`) sir uchun **yaramaydi — ular yakuniy image'da qoladi**.

Tekshiramiz — soxta token bilan:

```text vps
$ cat Dockerfile.arg
FROM alpine
ARG TOKEN
RUN echo "token uzunligi: ${#TOKEN}"
$ docker build --progress=plain -t sir:arg -f Dockerfile.arg --build-arg TOKEN=SINOV-TOKEN-123 . 2>&1 | grep -E 'token uzunligi|warning|Lint|SecretsUsed'
#5 [2/2] RUN echo "token uzunligi: ${#TOKEN}"
#5 0.481 token uzunligi: 15
 1 warning found (use docker --debug to expand):
 - SecretsUsedInArgOrEnv: Do not use ARG or ENV instructions for sensitive data (ARG "TOKEN") (line 2)
$ docker image history sir:arg --no-trunc --format '{{.CreatedBy}}' | head -2
RUN |1 TOKEN=SINOV-TOKEN-123 /bin/sh -c echo "token uzunligi: ${#TOKEN}" # buildkit
ARG TOKEN=SINOV-TOKEN-123
```

- Build ishladi va BuildKit **o'zi ogohlantirdi**: `SecretsUsedInArgOrEnv` (pastda — build checks).
- `docker image history` — token **ochiq** turibdi: `ARG TOKEN=SINOV-TOKEN-123`. Image'ni olgan har kim (registry'dan ham, 25-bob) uni o'qiy oladi.

To'g'ri yo'l — **secret mount**. Hujjat: sir build mijozidan olinadi va faqat bitta `RUN` ko'rsatmasi davomida vaqtincha build konteyneriga ulanadi; standart holatda `/run/secrets/<id>` fayli sifatida.

```text vps
$ cat Dockerfile.secret
FROM alpine
RUN --mount=type=secret,id=token echo "token uzunligi: $(wc -c < /run/secrets/token)"
$ printf '%s' 'SINOV-TOKEN-123' > token.txt
$ docker build --progress=plain -t sir:secret -f Dockerfile.secret --secret id=token,src=token.txt . 2>&1 | grep -E 'token uzunligi'
#5 [stage-0 2/2] RUN --mount=type=secret,id=token echo "token uzunligi: $(wc -c < /run/secrets/token)"
#5 0.486 token uzunligi: 15
$ docker image history sir:secret --no-trunc --format '{{.CreatedBy}}' | head -1
RUN /bin/sh -c echo "token uzunligi: $(wc -c < /run/secrets/token)" # buildkit
$ rm token.txt
```

- `--secret id=token,src=token.txt` — sirni build'ga berish (fayldan; `env=` bilan muhit o'zgaruvchisidan ham bo'ladi).
- `RUN --mount=type=secret,id=token` — shu qadam davomida `/run/secrets/token` mavjud.
- Ilova tokenni ishlatdi (uzunligi 15), lekin `history` da token **yo'q** — faqat buyruq matni.

Yopiq Git repozitoriylari uchun hujjatda SSH mount (`--mount=type=ssh`) ham bor.

## Build checks: Dockerfile'ni tekshirish

Docker hujjati (Build checks): Dockerfile 1.8 dan beri Docker build'dan oldin Dockerfile va build parametrlarini tekshiradi — Dockerfile uchun linter (kod tekshiruvchi) kabi. Odatiy `docker build` da tekshiruvlar **avtomatik** ishlaydi va ogohlantirishlar chiqishda ko'rinadi (yuqorida — `SecretsUsedInArgOrEnv`). `--check` — build qilmasdan, faqat tekshirish:

```text vps
$ cat Dockerfile.tekshir
FROM node:26-alpine as build
ENV API_TOKEN=abc
WORKDIR /app
COPY . .
CMD node server.js
$ docker build --check -f Dockerfile.tekshir .
#0 building with "default" instance using docker driver

#1 [internal] load build definition from Dockerfile.tekshir
#1 transferring dockerfile: 133B done
#1 DONE 0.0s

#2 [internal] load metadata for docker.io/library/node:26-alpine
#2 DONE 0.1s

#3 [internal] load .dockerignore
#3 transferring context: 2B done
#3 DONE 0.0s
Check complete, 3 warnings have been found!

WARNING: FromAsCasing - https://docs.docker.com/go/dockerfile/rule/from-as-casing/
'as' and 'FROM' keywords' casing do not match
Dockerfile.tekshir:1
--------------------
   1 | >>> FROM node:26-alpine as build
   2 |     ENV API_TOKEN=abc
   3 |     WORKDIR /app
--------------------

WARNING: SecretsUsedInArgOrEnv - https://docs.docker.com/go/dockerfile/rule/secrets-used-in-arg-or-env/
Do not use ARG or ENV instructions for sensitive data (ENV "API_TOKEN")
Dockerfile.tekshir:2
--------------------
   1 |     FROM node:26-alpine as build
   2 | >>> ENV API_TOKEN=abc
   3 |     WORKDIR /app
   4 |     COPY . .
--------------------

WARNING: JSONArgsRecommended - https://docs.docker.com/go/dockerfile/rule/json-args-recommended/
JSON arguments recommended for CMD to prevent unintended behavior related to OS signals
Dockerfile.tekshir:5
--------------------
   3 |     WORKDIR /app
   4 |     COPY . .
   5 | >>> CMD node server.js
   6 |     
--------------------
```

Uchta qoida buzilgan:

| Qoida | Nima | Qaysi bobda |
| --- | --- | --- |
| `FromAsCasing` | `FROM` katta harfda, `as` kichik — bir xil yozing (`AS`) | 10 |
| `SecretsUsedInArgOrEnv` | `ENV API_TOKEN` — sir `ENV` da | shu bob |
| `JSONArgsRecommended` | `CMD` shell shaklida — signallar muammosi | 8 |

Har ogohlantirishda qoidaning hujjatiga havola bor. Barcha qoidalar ro'yxati — Build checks reference.

## Zaifliklarni skanerlash: Docker Scout

Docker hujjati (Docker Scout): Scout image tarkibini (paketlar va kutubxonalar) tahlil qiladi va ulardagi ma'lum zaifliklarni (CVE) topadi; qaysi base image yoki versiyaga o'tish kerakligini ham tavsiya qiladi. Asosiy buyruqlar:

```text sxema
docker scout quickview IMAGE      # qisqa xulosa
docker scout cves IMAGE           # barcha topilgan zaifliklar
docker scout recommendations IMAGE
```

Scout CLI plagini Docker Desktop bilan birga keladi; Docker Engine'ga alohida o'rnatiladi (hujjatdagi o'rnatish skripti), va ishlatish uchun Docker hisobiga kirish (`docker login`) kerak. Bizning VPS'da plagin o'rnatilmagan va Docker hisobi ulanmagan — shuning uchun bu bo'limni ishga tushirib ko'rsatmadik.

## Tipik xatolar

**1. `USER` siz image.**
Ilova konteyner ichida root.
To'g'risi: `USER node` (yoki o'z foydalanuvchingiz).

**2. Tokenni `ARG`/`ENV` bilan berish.**
`docker image history` da ochiq qoladi (`ENV` esa `docker image inspect` da ham).
To'g'risi: `--secret` va `RUN --mount=type=secret`.

**3. `.env` faylini image'ga nusxalash.**
`COPY . .` uni ham olib ketadi.
To'g'risi: `.dockerignore` ga `.env` (9-bob); sozlama — ishga tushirishda `-e`/`--env-file` (4-bob).

**4. Build ogohlantirishlariga e'tibor bermaslik.**
Ular aniq muammolarni ko'rsatadi.
To'g'risi: `docker build --check` — CI'da ham (26-bob).

## Amaliyot

Savollar:

1. Konteynerdagi ilova kim nomidan ishlayotganini qanday bilasiz?
2. `ARG TOKEN` bilan berilgan token yakuniy image'da qayerda ko'rinadi?
3. Secret mount'dagi sir build paytida qayerda bo'ladi?
4. `docker build --check` oddiy `docker build` dan nimasi bilan farq qiladi?
5. `FROM node AS build` va `FROM node as build` — qaysi biri ogohlantirish beradi?

<details>
<summary>Javoblar</summary>

1. `docker run --rm IMAGE id` yoki `docker exec KONTEYNER id`.
2. `docker image history` (`ARG TOKEN=…` va `RUN |1 TOKEN=…`).
3. Faqat o'sha `RUN` davomida `/run/secrets/<id>` faylida; image'ga yozilmaydi.
4. Build qadamlarini bajarmaydi — faqat tekshiruvlarni ishga tushirib, natijani chiqaradi.
5. `as` (kichik harf) — `FromAsCasing`.

</details>

## Rasmiy hujjat

- [Best practices: USER](https://docs.docker.com/build/building/best-practices/#user)
- [Build secrets](https://docs.docker.com/build/building/secrets/) — `ARG`/`ENV` nega yaramaydi, secret va SSH mount
- [Build checks](https://docs.docker.com/build/checks/) · [Build checks reference](https://docs.docker.com/reference/build-checks/)
- [Docker Scout quickstart](https://docs.docker.com/scout/quickstart/) · [Install Docker Scout](https://docs.docker.com/scout/install/) · [docker scout cves](https://docs.docker.com/reference/cli/docker/scout/cves/)
