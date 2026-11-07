# 13 — BuildKit imkoniyatlari

[← Oldingi: Xavfsiz va to'g'ri image](12-xavfsiz-image.md) · [Mundarija](README.md)

## Tushuncha

Docker hujjati (BuildKit): **BuildKit** — Docker'ning image yig'uvchisi (builder backend); eski builder'ga qaraganda tezroq va ko'proq imkoniyatli. Oldingi boblarda uning ishini ko'rdik, endi nomini bilamiz:

| BuildKit imkoniyati | Qayerda ko'rdik |
| --- | --- |
| Ishlatilmaydigan bosqichlarni o'tkazib yuborish | 10-bob (`--target`) |
| Mustaqil bosqichlarni parallel qurish | — (hujjatda) |
| Kontekstdagi faqat o'zgargan fayllarni uzatish | 9-bob |
| `RUN --mount` — secret, cache, SSH | 12-bob, shu bob |
| Build checks | 12-bob |

Bu bobda uchta mavzu: builder'lar, **cache mount** va **multi-platform** image.

## Builder'lar

Hujjat (Builders): builder — build'larni bajaradigan BuildKit daemon'i. Docker Engine o'zi **standart builder** yaratadi: u daemon ichidagi BuildKit'dan foydalanadi, `docker` drayveri bilan ishlaydi va sozlash talab qilmaydi.

```text vps
$ docker buildx ls
NAME/NODE     DRIVER/ENDPOINT   STATUS    BUILDKIT   PLATFORMS
default*      docker                                 
 \_ default    \_ default       running   v0.34.2    linux/amd64 (+4)
$ docker buildx inspect default | grep Platforms
Platforms:        linux/amd64, linux/amd64/v2, linux/amd64/v3, linux/amd64/v4
```

- `default*` — standart (va tanlangan) builder, drayveri `docker`.
- `BUILDKIT v0.34.2` — daemon ichidagi BuildKit versiyasi.
- `linux/amd64 (+4)` va `Platforms:` — builder **o'zi** bajara oladigan platformalar: amd64 va uning variantlari (`v2`–`v4`). arm64 bu ro'yxatda yo'q.

Boshqa drayverlar (`docker-container`, masofaviy builder'lar) bor — CI'da (26-bob) yoki kuchliroq kompyuterda yig'ish uchun. Bu kitobda standart builder yetarli.

## Cache mount

9-bobdagi qatlam keshi "hammasi yoki hech narsa": `package.json` o'zgarsa, `npm ci` qatlami **butunlay** qayta bajariladi va barcha paketlar qaytadan yuklanadi. Hujjat (Optimize cache usage — Use cache mounts): **cache mount** — build'lar orasida saqlanadigan doimiy kesh papkasi. Qatlam qayta qurilsa ham, paket menejeri faqat **yangi yoki o'zgargan** paketlarni yuklaydi, qolganlari keshdan olinadi.

Ikki Dockerfile — farqi faqat `--mount=type=cache` da. `/root/.npm` — npm keshining standart papkasi (hujjatdagi misolda ham shu). Internetdan nechta paket yuklanganini sanash uchun npm'ning HTTP logidan `fetch GET 200` qatorlarini sanaymiz:

```text vps
$ cat Dockerfile.kesh
FROM node:26-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --loglevel=http > /tmp/npm.log 2>&1; echo "yuklandi: $(grep -c 'fetch GET 200' /tmp/npm.log)"
$ docker build --progress=plain -f Dockerfile.keshsiz -t k:yoq . 2>&1 | grep yuklandi
#8 [4/4] RUN npm ci --omit=dev --loglevel=http > /tmp/npm.log 2>&1; echo "yuklandi: $(grep -c 'fetch GET 200' /tmp/npm.log)"
#8 6.134 yuklandi: 66
$ docker build --progress=plain -f Dockerfile.kesh -t k:bor . 2>&1 | grep yuklandi
#8 [stage-0 4/4] RUN --mount=type=cache,target=/root/.npm     npm ci --omit=dev --loglevel=http > /tmp/npm.log 2>&1; echo "yuklandi: $(grep -c 'fetch GET 200' /tmp/npm.log)"
#8 6.365 yuklandi: 66
```

Birinchi build'da ikkalasi ham 66 paket yukladi — kesh hali bo'sh. Endi yangi bog'liqlik qo'shamiz — `package.json` o'zgaradi, `npm ci` qatlami **ikkalasida ham** buziladi:

```text vps
$ docker run --rm -v /root/kesh:/app -w /app node:26-alpine npm install --silent dayjs
$ grep -A3 '"dependencies"' package.json
  "dependencies": {
    "dayjs": "^1.11.23",
    "express": "^5.3.0"
  }
$ docker build --progress=plain -f Dockerfile.keshsiz -t k:yoq . 2>&1 | grep yuklandi
#8 [4/4] RUN npm ci --omit=dev --loglevel=http > /tmp/npm.log 2>&1; echo "yuklandi: $(grep -c 'fetch GET 200' /tmp/npm.log)"
#8 6.500 yuklandi: 67
$ docker build --progress=plain -f Dockerfile.kesh -t k:bor . 2>&1 | grep yuklandi
#8 [stage-0 4/4] RUN --mount=type=cache,target=/root/.npm     npm ci --omit=dev --loglevel=http > /tmp/npm.log 2>&1; echo "yuklandi: $(grep -c 'fetch GET 200' /tmp/npm.log)"
#8 5.234 yuklandi: 1
```

```text vps
$ docker buildx du --filter type=exec.cachemount
ID                           RECLAIMABLE   SIZE      LAST ACCESSED
afni99dz8dxr123e4xf19r464*   true          2.376MB   1 second ago
```

- Cache mount'siz — **67** paketning hammasi qaytadan yuklandi.
- Cache mount bilan — **1** ta: faqat yangi `dayjs`, qolgan 66 tasi keshdan.
- Kesh BuildKit'da alohida saqlanadi (`exec.cachemount`, 2.376MB) va image'ga tushmaydi.

Hujjatda boshqa vositalar uchun misollar ham bor: Go (`/go/pkg/mod`), apt (`/var/cache/apt`), pip (`/root/.cache/pip`).

## Multi-platform image

Hujjat (Multi-platform builds): konteynerlar xost yadrosini bo'lishadi (1-bob), shuning uchun konteynerdagi kod xost **arxitekturasiga** mos bo'lishi kerak — `linux/amd64` konteyner arm64 xostda (emulyatsiyasiz) ishlamaydi. Bu muhim: noutbuk ko'pincha arm64 (Apple silicon), server esa amd64.

**Multi-platform image** — bitta nom ostida bir nechta variant. Hujjat: oddiy image'da bitta manifest (bir sozlama va bir qatlamlar to'plami), multi-platform image'da esa **manifest list** — har platforma uchun alohida manifestga ko'rsatkichlar ro'yxati. Docker ishga tushirishda xostga mosini o'zi tanlaydi.

Hujjat bo'yicha talablar: Docker Engine'da containerd image store (bizda bor, 3-bob) va boshqa arxitektura uchun `RUN` qadamlari bo'lsa — emulyatsiya (QEMU). Hujjat: rasmiy BuildKit relizlarida QEMU emulyatorlari bor, odatda alohida o'rnatish shart emas; emulyatsiya ishlamasa, QEMU qo'lda o'rnatiladi.

7-bobdagi ilovani ikki platforma uchun yig'amiz:

```text vps
$ docker buildx build --platform linux/amd64,linux/arm64 -t salom-ilova:multi . 2>&1 | grep -E '^#[0-9]+ \[linux/(amd64|arm64) [0-9]/[0-9]\]|exporting manifest list|ERROR'
#6 [linux/arm64 1/4] FROM docker.io/library/node:26-alpine@sha256:8996bb5821d62a8fd9bb27c1cb07462f3fdce6e47d640c6a881ead0b064ce216
#7 [linux/amd64 1/4] FROM docker.io/library/node:26-alpine@sha256:8996bb5821d62a8fd9bb27c1cb07462f3fdce6e47d640c6a881ead0b064ce216
#8 [linux/arm64 2/4] WORKDIR /app
#9 [linux/arm64 3/4] COPY package.json ./
#10 [linux/arm64 4/4] COPY server.js ./
#11 [linux/amd64 2/4] WORKDIR /app
#12 [linux/amd64 3/4] COPY package.json ./
#13 [linux/amd64 4/4] COPY server.js ./
#14 exporting manifest list sha256:a8420fb4d84ad4588e41179a685cf3c8bb595308090c1ae44c3447e07aa35a00 0.0s done
$ docker image ls --tree salom-ilova:multi
IMAGE                ID             DISK USAGE   CONTENT SIZE   EXTRA
salom-ilova:multi    a8420fb4d84a        509MB          131MB        
├─ linux/amd64       6c3c03b3091f        251MB           63MB        
└─ linux/arm64       ba75466cc759        258MB           68MB        

```

- `[linux/arm64 …]` va `[linux/amd64 …]` — ikkala platforma qadamlari bitta build'da.
- `exporting manifest list` — bitta nom, ikki variant.
- `docker image ls --tree` (hujjatda — eksperimental imkoniyat) — `salom-ilova:multi` ichida ikki image: amd64 251MB, arm64 258MB.

Bizning Dockerfile'da `RUN` yo'q (faqat `COPY`) — shuning uchun arm64 uchun hech narsa emulyatsiyada bajarilmadi. Hujjat ogohlantiradi: QEMU emulyatsiyasi, ayniqsa kompilyatsiya kabi og'ir ishlarda, native build'dan **ancha sekin**; muqobillari — har platforma uchun alohida native builder yoki cross-compilation (multi-stage bilan).

Ishga tushirish:

```text vps
$ docker run --rm salom-ilova:multi uname -m
x86_64
$ docker run --rm --platform linux/arm64 salom-ilova:multi uname -m
exec /usr/local/bin/docker-entrypoint.sh: exec format error
```

- Platforma ko'rsatilmasa — xostnikini (`x86_64` = amd64) oldi.
- `--platform linux/arm64` — `exec format error`: arm64 dasturini amd64 serverda emulyatsiyasiz ishga tushirib bo'lmaydi. Image to'g'ri — u arm64 serverda (yoki Apple silicon'dagi Docker Desktop'da) ishlaydi.

Registry'ga yuborilganda (`docker push`, 25-bob) ikkala variant bitta teg ostida ketadi.

## Tipik xatolar

**1. Noutbukda (arm64) yig'ib, serverga (amd64) yuborish.**
Serverda `exec format error`.
To'g'risi: `--platform linux/amd64,linux/arm64` yoki serverning platformasi uchun yig'ish.

**2. Bog'liqliklar o'zgarganda hamma narsani qaytadan yuklash.**
Katta loyihalarda daqiqalar va trafik.
To'g'risi: `RUN --mount=type=cache,target=<paket menejeri keshi>`.

**3. Cache mount'ni image'da deb o'ylash.**
U faqat build paytida ulanadi va image'ga tushmaydi — ilova uchun kerakli fayllarni u yerga qo'ymang.

**4. Emulyatsiyada og'ir kompilyatsiya.**
Juda sekin.
To'g'risi: cross-compilation yoki native builder.

## Amaliyot

Savollar:

1. Qatlam keshi va cache mount farqi nimada?
2. `package.json` ga bitta paket qo'shildi. Cache mount bilan `npm ci` nechta paketni internetdan oladi?
3. Multi-platform image ichida nima bor?
4. `exec format error` nimani bildiradi?
5. Standart builder qaysi drayverda ishlaydi?

<details>
<summary>Javoblar</summary>

1. Qatlam keshi — butun qatlam qayta ishlatiladi yoki butunlay qayta bajariladi; cache mount — qatlam qayta bajarilsa ham saqlanib qoladigan papka (masalan, paketlar keshi).
2. Faqat yangisini (bizning tajribada — 1 ta).
3. Manifest list — har platforma uchun alohida manifest va qatlamlar.
4. Dastur boshqa protsessor arxitekturasi uchun yig'ilgan — xost uni bajara olmaydi.
5. `docker` drayverida — daemon ichidagi BuildKit.

</details>

## Rasmiy hujjat

- [BuildKit](https://docs.docker.com/build/buildkit/) — imkoniyatlar
- [Builders](https://docs.docker.com/build/builders/) — standart builder, drayverlar
- [Optimize cache usage: Use cache mounts](https://docs.docker.com/build/cache/optimize/#use-cache-mounts)
- [Multi-platform builds](https://docs.docker.com/build/building/multi-platform/) — manifest list, QEMU, strategiyalar
- [docker image ls](https://docs.docker.com/reference/cli/docker/image/ls/) — `--tree`
