# Docker trenajori

Saytdagi `/docker/trenajor` sahifasi. **Bu simulyator**: brauzerda haqiqiy Docker ishlay olmaydi (v86 — 32-bit, Docker
uchun yadro imkoniyatlari yo'q). Shuning uchun boshqa trenajorlardan farqli yo'l tanlangan:

1. Sinov VPS'ida (Ubuntu 26.04, Docker Engine 29.9.3) har buyruq **haqiqatan bajarilib, yozib olinadi** — chiqish,
   chiqish kodi, vaqti va TTY'dagi ko'rinishi (masalan `docker pull` progress chiziqlari) bilan.
2. Simulyator (`src/docker/`) shu yozuvlar asosida yozilgan: image'lar, qatlamlar, digest'lar, image'larning fayl
   tizimlari, `--help` matnlari, xato xabarlari, nginx loglari, busybox formatlari — hammasi yozuvdan olinadi.
3. **Moslik testi** yozib olingan har buyruqni simulyatorda shu tartibda bajarib, chiqishni so'zma-so'z solishtiradi.

Natija (2026-11-23): **469/469 buyruq mos (100%)**, 16 ta istisno — sababi testda yozilgan (pastda).

## Tuzilma

| Nima | Qayerda |
| --- | --- |
| Sahifa | `src/views/DockerTrenajorPage.vue` (terminal, Host xaritasi, "Nima bo'ldi?", mashqlar) |
| Daemon modeli (image, konteyner, tarmoq, volume, port, events) | `src/docker/dvigatel.js` |
| Konteyner jarayonlari (PID 1 va signallar, nginx, hello-world, `--init`) | `src/docker/dasturlar.js` |
| Konteyner ichidagi qobiq va buyruqlar (busybox ash / dash / bash, ls, ps, ip, wget, curl …) | `src/docker/ichki/konteynerQobiq.js` |
| `docker` CLI (bayroqlar `--help` dan, `--format` Go shablonlari, tabwriter) | `src/docker/cli/docker.js`, `bayroq.js`, `shablon.js`, `pull.js` |
| Host qobig'i (bash: quvur, `&&`, heredoc, `$(…)`, `for/while/if`) va host buyruqlari (curl, ls …) | `src/docker/qobiq/` |
| Qatlamli fayl tizimi (overlay: image + yozuv qatlami + mount'lar, whiteout, `docker diff`) | `src/docker/vfs.js` |
| Terminal qator muharriri, maslahatlar, hikoya, xarita | `src/docker/satr.js`, `maslahat.js`, `hikoya.js`, `Xarita.vue` |
| Mashqlar (kitobning 2–6-boblari) | `src/docker/mashqlar.js` |
| Yozuvdan olingan ma'lumot (avtomatik) | `src/docker/data/katalog.json`, `src/docker/data/matnlar.js`, `public/docker-trenajor/fs/` |

Image katalogi kitob yozilgan kundagi digest'larga bog'langan (`yozuv/pin.json`): `hello-world`, `alpine`
(3.24.4), `nginx:1.29` (1.29.8), `debian`/`debian:trixie` (13.7), `busybox:1.37`. `alpine:latest` va `hello-world`
teglari kitobdan keyin yangilangan — trenajor kitobdagi image'larni beradi. Katalogda yo'q image (`ubuntu`, `redis` …)
so'ralsa, bu ochiq aytiladi.

## Yozib olish (sinov VPS'ida)

```sh
cd docker-trenajor/yozuv
sh vps.sh katalog                 # natija/katalog.json + natija/fs/ (image metadata, manifest'lar, fayl tizimlari, hajmlar)
sh vps.sh yoz ssenariylar/04-*.txt   # natija/yozuvlar/04-konteynerlar.json
COLS=120 sh vps.sh yoz ssenariylar/13-pull-keng.txt   # keng terminal (progress chizig'i 110 ustundan keyin chiqadi)
sh vps.sh host                    # natija/host.txt — docker version/info/compose/buildx VPS'ning o'zidan
python3 korish.py natija/yozuvlar/04-konteynerlar.json   # o'qish uchun (--xom — ESC ketma-ketliklari bilan)
node ../scripts/tayyorla.mjs      # yozuvlardan src/docker/data/* va public/docker-trenajor/fs/
```

- Har ssenariy **toza** Docker'da: `docker:29.9.3-dind` konteyneri ichida (VPS'ning o'z konteynerlari aralashmaydi).
  dind o'zi VPS'ning 172.17 tarmog'ida bo'lgani uchun uning bridge'i 172.18 — test manzillarni host'nikiga keltiradi.
- Buyruqlar haqiqiy terminal (pty, 100×30) orqali; `<` qatorlari — klaviaturadan yoziladigan matn, `<! \x03` — Ctrl+C.
- Docker Hub anonim limiti tugaganda (429) image'lar `mirror.gcr.io` orqali digest bo'yicha olinadi — chiqish o'zgarmaydi.
- Ssenariy fayllari formati — `yozuv/yoz.py` boshida.

Yozuvdan topilgan, simulyatorda takrorlangan faktlar (tanlab):

- PID 1 o'zi ushlamagan SIGTERM'ni e'tiborsiz qoldiradi: `docker stop` (alpine `sleep`) 10 s kutadi va kod 137;
  `--init` bilan Ctrl+C darhol ishlaydi (kod 130). TTY'siz `docker run` ga 3 marta Ctrl+C — "got 3 SIGTERM/SIGINTs,
  forcefully exiting", konteyner esa ishlashda qoladi.
- nginx image'ining STOPSIGNAL'i SIGQUIT — to'xtashda "gracefully shutting down"; SIGTERM/SIGINT bilan — "exiting".
- `docker exec` jarayonlari `umask 0000` bilan: `touch` → `-rw-rw-rw-`.
- Konteyner yozuv qatlami: asos 4096 bayt, ishlayotgan nginx 81920, image'da yo'q har mount nuqtasi +4096.
- `docker image ls` (Docker 29): TTY'da rangli, "U" — ishlatilayotgan image; `--format` da digest yozuvlari ko'rinmaydi.
- nginx xato sahifalari CRLF bilan (404 — 153 bayt); `docker inspect` JSON'ida `<`/`>` escape qilinmaydi,
  `--format json` da qilinadi.

## Testlar

```sh
node docker-trenajor/test/moslik.mjs [04] [--batafsil]   # yozuvlar bilan so'zma-so'z solishtirish
node docker-trenajor/test/mashqlar.mjs                    # har mashq oxirigacha (10/10)
URL=http://localhost:5180/docker/trenajor node docker-trenajor/test/brauzer.mjs [--kenglik 390]   # sahifa, skrinshot
```

Moslik testidagi istisnolar (`ISTISNO` ro'yxati): dind'ga xos chiqishlar (`docker version/info` — dind ichida; host
tarmog'i; 172.17.0.2 ga so'rov), Docker Hub 429, alpine tegining kitobdan keyin yangilangani, stdout/stderr kelish
tartibi tasodifiy bo'lgan ikki buyruq, vaqtga bog'liq uchta buyruq (`restart` urinishlari soni, `events --since 1s`,
overlay "total" bloklari). Niqoblanadigan qismlar: konteyner ID, tasodifiy nom (testda yozuvdagi nomlar beriladi), vaqt,
PID, MAC, DNS serverlar; hajmlar 0.6% gacha farq bilan.

## Hali yo'q (keyingi bosqichlar)

- `docker build` (Dockerfile muharriri bilan, BuildKit chiqishi) — kitobning II qismi;
- `docker compose` — III qism;
- `docker stats` jonli rejimi (hozir `--no-stream` natijasi), `docker cp`, `commit`, `save/load`, `push`/`login`.
