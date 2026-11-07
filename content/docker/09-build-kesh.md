# 09 — Build kesh

[← Oldingi: CMD va ENTRYPOINT](08-cmd-va-entrypoint.md) · [Mundarija](README.md) · [Keyingi: Multi-stage build →](10-multi-stage.md)

## Tushuncha

Docker hujjati (Using the build cache): `docker build` Dockerfile ko'rsatmalarini tartib bilan bajaradi va har biri uchun qatlam yaratadi. Har ko'rsatmada Docker oldingi build'dagi natijani qayta ishlata olishini tekshiradi: xuddi shunday ko'rsatma oldin bajarilgan bo'lsa, uni qayta bajarmaydi — **keshdan** oladi (build chiqishida `CACHED`).

Kesh qachon buziladi (hujjat):

| Sabab | Misol |
| --- | --- |
| `RUN` buyrug'ining o'zi o'zgardi | `RUN npm ci` → `RUN npm ci --omit=dev` |
| `COPY`/`ADD` bilan nusxalanadigan fayllar o'zgardi | Mazmun yoki xossalar (ruxsatlar) |
| **Oldingi qatlam buzildi** | Bir qatlam qayta qurilsa, undan keyingi **hamma** qatlamlar ham qayta quriladi |

Uchinchi qoida eng muhimi: Dockerfile'dagi tartib qaysi qadamlar qayta bajarilishini belgilaydi.

## Ilova: bog'liqligi bor

7-bobdagi ilova bog'liqliksiz edi. Endi Express bilan — `npm install` ishi bor. Bog'liqlikni Node.js'ni serverga o'rnatmasdan, konteyner ichida qo'shdik: `docker run --rm -v /root/kesh:/app -w /app node:26-alpine npm install express@5` (6-bob: bind mount; `-w` — ishchi papka). Natija:

```text vps
$ docker run --rm -v /root/kesh:/app -w /app node:26-alpine npm install express@5
Read from remote host 203.0.113.10: Operation timed out
client_loop: send disconnect: Broken pipe
{
    "express": "^5.3.0"
  }
```

`package-lock.json` — bog'liqliklarning aniq versiyalari; `npm ci` aynan shu fayl bo'yicha o'rnatadi.

## Yomon tartib

Hujjat (Optimize cache usage) "samarasiz" deb keltiradigan namuna — hamma narsani bir martada nusxalab, keyin o'rnatish:

```text vps
$ cat Dockerfile.yomon
FROM node:26-alpine
WORKDIR /app
COPY . .
RUN npm ci --omit=dev
CMD ["node", "server.js"]
$ docker build --progress=plain -t kesh:yomon -f Dockerfile.yomon . 2>&1 | grep -E '^#[0-9]+ (\[[0-9]/[0-9]\]|CACHED|DONE)|transferring context:'
#1 DONE 0.1s
#2 DONE 0.1s
#3 transferring context: 2B done
#3 DONE 0.0s
#4 DONE 0.0s
#5 [1/4] FROM docker.io/library/node:26-alpine@sha256:8996bb5821d62a8fd9bb27c1cb07462f3fdce6e47d640c6a881ead0b064ce216
#5 DONE 0.0s
#6 [2/4] WORKDIR /app
#6 CACHED
#4 transferring context: 2.38MB 0.3s done
#4 DONE 0.3s
#7 [3/4] COPY . .
#7 DONE 0.3s
#8 [4/4] RUN npm ci --omit=dev
#8 DONE 7.3s
#9 DONE 1.7s
```

Birinchi build — hammasi bajarildi, `npm ci` 7.3 soniya. Endi kodda bitta izoh qo'shamiz va qayta yig'amiz:

```text vps
$ echo '// 1-ozgarish' >> server.js
$ docker build --progress=plain -t kesh:yomon -f Dockerfile.yomon . 2>&1 | grep -E '^#[0-9]+ (\[[0-9]/[0-9]\]|CACHED|DONE)|transferring context:'
#1 DONE 0.0s
#2 DONE 0.1s
#3 transferring context:
#3 transferring context: 2B done
#3 DONE 0.0s
#4 [1/4] FROM docker.io/library/node:26-alpine@sha256:8996bb5821d62a8fd9bb27c1cb07462f3fdce6e47d640c6a881ead0b064ce216
#4 DONE 0.1s
#5 transferring context: 39.65kB 0.1s done
#5 DONE 0.1s
#6 [2/4] WORKDIR /app
#6 CACHED
#7 [3/4] COPY . .
#7 DONE 0.3s
#8 [4/4] RUN npm ci --omit=dev
#8 DONE 6.4s
#9 DONE 1.6s
```

`COPY . .` — `server.js` o'zgargani uchun qayta bajarildi. U buzilgani uchun undan keyingi `RUN npm ci` ham **qayta** bajarildi (6.4 soniya) — bog'liqliklar umuman o'zgarmagan bo'lsa ham. Haqiqiy loyihada bu har build'da daqiqalar.

## Yaxshi tartib

Hujjatdagi yechim: `COPY` ni ikkiga bo'lish — avval faqat paket menejeri fayllari, so'ng o'rnatish, eng oxirida — tez-tez o'zgaradigan kod. Qoida: **qimmat va kam o'zgaradigan qadamlar — yuqorida, tez-tez o'zgaradiganlar — pastda**.

```text vps
$ cat Dockerfile
FROM node:26-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
CMD ["node", "server.js"]
$ docker build --progress=plain -t kesh:yaxshi . 2>&1 | grep -E '^#[0-9]+ (\[[0-9]/[0-9]\]|CACHED|DONE)|transferring context:'
#1 DONE 0.0s
#2 DONE 0.0s
#3 transferring context: 2B done
#3 DONE 0.0s
#4 transferring context: 39.30kB 0.1s done
#4 DONE 0.1s
#5 [1/5] FROM docker.io/library/node:26-alpine@sha256:8996bb5821d62a8fd9bb27c1cb07462f3fdce6e47d640c6a881ead0b064ce216
#5 DONE 0.1s
#6 [2/5] WORKDIR /app
#6 CACHED
#7 [3/5] COPY package.json package-lock.json ./
#7 DONE 0.2s
#8 [4/5] RUN npm ci --omit=dev
#8 DONE 5.9s
#9 [5/5] COPY . .
#9 DONE 0.3s
#10 DONE 1.6s
```

Yana kodni o'zgartiramiz:

```text vps
$ echo '// 2-ozgarish' >> server.js
$ docker build --progress=plain -t kesh:yaxshi . 2>&1 | grep -E '^#[0-9]+ (\[[0-9]/[0-9]\]|CACHED|DONE)|transferring context:'
#1 DONE 0.0s
#2 DONE 0.0s
#3 transferring context: 2B done
#3 DONE 0.0s
#4 transferring context: 39.66kB 0.1s done
#4 DONE 0.1s
#5 [1/5] FROM docker.io/library/node:26-alpine@sha256:8996bb5821d62a8fd9bb27c1cb07462f3fdce6e47d640c6a881ead0b064ce216
#5 DONE 0.1s
#6 [2/5] WORKDIR /app
#6 CACHED
#7 [3/5] COPY package.json package-lock.json ./
#7 CACHED
#8 [4/5] RUN npm ci --omit=dev
#8 CACHED
#9 [5/5] COPY . .
#9 DONE 0.4s
#10 DONE 0.7s
```

`COPY package.json package-lock.json` — fayllar o'zgarmagan: `CACHED`. Shuning uchun `npm ci` ham `CACHED`. Faqat oxirgi `COPY . .` qayta bajarildi — build 0.7 soniya.

<div data-animatsiya="qadamli" data-nom="kesh"></div>

7-bobdagi Dockerfile'da `package.json` va `server.js` alohida `COPY` qilingani ham shuning uchun edi.

## `.dockerignore`

`COPY . .` kontekstdagi **hamma narsani** nusxalaydi. Yaxshi tartibdagi image ichiga qaraymiz:

```text vps
$ docker run --rm kesh:yaxshi ls
Dockerfile
Dockerfile.yomon
node_modules
package-lock.json
package.json
server.js
$ docker builder prune -af > /dev/null
$ docker build --progress=plain -t kesh:yaxshi . 2>&1 | grep 'transferring context:'
#3 transferring context: 2B done
#4 transferring context: 2.38MB 0.4s done
```

- Image'ga `Dockerfile` va `Dockerfile.yomon` ham tushib qolgan — ular ilovaga kerak emas.
- Kontekst — 2.38MB: serverdagi `node_modules` ham builder'ga yuborildi, keyin `COPY . .` uni image'dagi `npm ci` o'rnatganining **ustiga** yozdi.

(Kontekst hajmini ko'rish uchun avval build keshini tozaladik — `docker builder prune -af`. Kuzatildi: keshli qayta build'larda `transferring context` atigi 39kB ko'rsatgan edi, kesh tozalangandan keyin — 2.38MB.)

Docker hujjati (Build context): `.dockerignore` fayli kontekstdan fayl va papkalarni chiqarib tashlaydi — keraksiz narsa builder'ga yuborilmaydi va build tezlashadi. U `.gitignore` ga o'xshash ishlaydi va kontekstning barcha ichki papkalariga ta'sir qiladi:

```text vps
$ printf '%s\n' node_modules 'Dockerfile*' .dockerignore > .dockerignore
$ cat .dockerignore
node_modules
Dockerfile*
.dockerignore
$ docker builder prune -af > /dev/null
$ docker build --progress=plain -t kesh:yaxshi . 2>&1 | grep 'transferring context:'
#3 transferring context: 79B done
#4 transferring context: 30.52kB done
$ docker run --rm kesh:yaxshi ls
node_modules
package-lock.json
package.json
server.js
```

- Kontekst 2.38MB → 30.52kB.
- Image'da faqat ilova fayllari va `npm ci` o'rnatgan `node_modules`.
- `Dockerfile*` va `.dockerignore` ning o'zini ham chiqarib tashlash mumkin. Hujjat: ular baribir builder'ga yuboriladi (build uchun kerak), lekin `COPY` bilan image'ga tushmaydi.

Shablonlar Go tilidagi `filepath.Match` qoidalari bo'yicha; qo'shimcha `**` — istalgan chuqurlikdagi papkalar (`**/*.log`). Odatda chiqariladigan narsalar: `node_modules`, `.git`, loglar, `.env` (sirlar image'ga tushmasin, 12-bob), build natijalari.

## Tipik xatolar

**1. `COPY . .` dan keyin `RUN npm install`.**
Har kod o'zgarishida bog'liqliklar qayta o'rnatiladi.
To'g'risi: avval `package.json` + lock fayl, `npm ci`, keyin `COPY . .`.

**2. `.dockerignore` yo'q.**
`node_modules`, `.git`, `.env` image'ga va builder'ga ketadi; serverdagi `node_modules` image'dagisini bosib ketadi.
To'g'risi: `.dockerignore`.

**3. Kesh "ishlamayapti" deb hayron bo'lish.**
Yuqoriroqdagi biror qatlam o'zgargan — undan pastdagilarning hammasi qayta quriladi.
To'g'risi: build chiqishida birinchi `CACHED` bo'lmagan qadamni toping.

**4. Lock faylsiz `npm install`.**
Har build'da bog'liqliklarning boshqa versiyasi tushishi mumkin.
To'g'risi: `package-lock.json` va `npm ci`.

## Amaliyot

Savollar:

1. Dockerfile'da `RUN apt-get update` dan oldingi `COPY . .` qatori nega yomon?
2. Uchinchi qatlam qayta qurildi. To'rtinchi va beshinchi bilan nima bo'ladi?
3. `.dockerignore` ga `Dockerfile` ni yozsangiz, build ishlaydimi?
4. Kontekst hajmi qayerda ko'rinadi?
5. Nega `package.json` va `package-lock.json` alohida, kodga qadar nusxalanadi?

<details>
<summary>Javoblar</summary>

1. Har fayl o'zgarishida `COPY . .` buziladi va undan keyingi `RUN` ham qayta bajariladi.
2. Ular ham qayta quriladi: bir qatlam buzilsa, keyingilarining hammasi buziladi.
3. Ha: Dockerfile baribir builder'ga yuboriladi, faqat `COPY` bilan image'ga tushmaydi.
4. Build chiqishidagi `transferring context: …` qatorida.
5. Ular kam o'zgaradi: bog'liqliklar o'zgarmasa, `npm ci` qatlami keshdan olinadi, kod o'zgarishi esa faqat oxirgi `COPY` ni qayta quradi.

</details>

## Rasmiy hujjat

- [Using the build cache](https://docs.docker.com/get-started/docker-concepts/building-images/using-the-build-cache/) — kesh qachon buziladi
- [Build cache invalidation](https://docs.docker.com/build/cache/invalidation/)
- [Optimize cache usage in builds](https://docs.docker.com/build/cache/optimize/) — qatlamlar tartibi, kontekstni kichik tutish
- [Build context: .dockerignore](https://docs.docker.com/build/concepts/context/#dockerignore-files) — sintaksis, Dockerfile'ni chiqarib tashlash
- [docker builder prune](https://docs.docker.com/reference/cli/docker/builder/prune/)
- [npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci) — lock fayl bo'yicha o'rnatish
