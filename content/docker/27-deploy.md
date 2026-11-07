# 27 — Serverga deploy

[← Oldingi: CI'da Docker](26-ci.md) · [Mundarija](README.md)

## Tushuncha

Docker hujjati (Use Compose in production): ilovani joylashning (deploy) eng oson yo'li — uni **bitta serverda**, xuddi ishlab chiqish muhitidagidek Compose bilan ishga tushirish. Hujjat production uchun o'zgartirishlarni sanaydi:

| Hujjatda | Kitobda |
| --- | --- |
| Ilova kodi uchun bind mount'larni olib tashlash — kod konteyner ichida, tashqaridan o'zgartirilmaydi | 6-, 18-boblar |
| Serverda boshqa portlar | 5-bob |
| Muhit o'zgaruvchilarini boshqacha berish (log darajasi, tashqi servislar) | 15-bob |
| Restart policy — `restart: always` kabi, to'xtab qolmaslik uchun | Bu bob |
| Qo'shimcha servislar (masalan, log yig'uvchi) | — |

Hujjat tavsiyasi — production sozlamalarini alohida faylga (`compose.production.yaml`) yozib, asosiy fayl ustidan qo'llash (19-bob):

```text sxema
$ docker compose -f compose.yaml -f compose.production.yaml up -d
```

Bu bobda yana uch narsa: resurs cheklovlari, loglar hajmi va versiyani almashtirish/qaytarish.

## Image registry'dan, teg — o'zgaruvchida

25–26-boblardagi oqim: image CI'da yig'iladi va registry'ga yuboriladi; serverda faqat `pull`. Serverdagi `compose.yaml`:

```yaml
services:
  web:
    image: localhost:5000/spa:${TEG:?TEG kerak}
    restart: unless-stopped
    ports:
      - "127.0.0.1:8085:8080"
    deploy:
      resources:
        limits:
          cpus: "0.50"
          memory: 64M
    logging:
      driver: local
      options:
        max-size: "10m"
        max-file: "3"
```

- `build:` yo'q — faqat `image:`. Teg `TEG` o'zgaruvchisidan; `${TEG:?…}` — o'zgaruvchi bo'lmasa, Compose ishlamaydi (15-bob).
- Registry — 25-bobdagi lokal registry (o'rniga `ghcr.io/…` yoki Docker Hub bo'lishi mumkin; ularda avval `docker login`).
- `127.0.0.1` — oldida teskari proksi (reverse proxy — so'rovni ichkaridagi servisga uzatadigan veb-server, masalan Nginx) bo'ladi deb hisoblaymiz (5-bob: tashqariga to'g'ridan-to'g'ri ochmaslik).

Ikki versiyani tayyorlaymiz: `1.0.0` — 23-bobdagi to'g'ri SPA, `1.0.1` — fallback'siz, "xatoli" variant:

```text vps
$ docker run -d -p 127.0.0.1:5000:5000 --restart unless-stopped --name registry registry:3
0f7a39684befa416630de4d8f4ff9e18123c8245e754a7e0b741f23cb296a0ae
$ docker tag spa:1 localhost:5000/spa:1.0.0
$ docker tag spa:fallbacksiz localhost:5000/spa:1.0.1
$ docker push -q localhost:5000/spa:1.0.0
localhost:5000/spa:1.0.0
$ docker push -q localhost:5000/spa:1.0.1
localhost:5000/spa:1.0.1
$ docker rmi localhost:5000/spa:1.0.0 localhost:5000/spa:1.0.1 >/dev/null
```

### Deploy

```text vps
$ docker compose up -d
error while interpolating services.web.image: required variable TEG is missing a value: TEG kerak
$ echo "TEG=1.0.0" > .env
$ docker compose up -d
 Image localhost:5000/spa:1.0.0 Pulling 
 Image localhost:5000/spa:1.0.0 Pulled 
 Network deploy_default Creating 
 Network deploy_default Creating 
 Network deploy_default Created 
 Network deploy_default Created 
 Container deploy-web-1 Creating 
 Container deploy-web-1 Created 
 Container deploy-web-1 Starting 
 Container deploy-web-1 Started 
$ sleep 1; curl -s -o /dev/null -w '/profil %{http_code}\n' http://127.0.0.1:8085/profil
/profil 200
```

`TEG` siz — xato, hech narsa ishga tushmadi. `.env` da `TEG=1.0.0` — image registry'dan tortildi, `/profil` — `200`.

### Yangi versiya

```text vps
$ echo "TEG=1.0.1" > .env
$ docker compose pull
 Image localhost:5000/spa:1.0.1 Pulling 
 Image localhost:5000/spa:1.0.1 Pulled 
$ docker compose up -d
 Container deploy-web-1 Recreate 
 Container deploy-web-1 Recreated 
 Container deploy-web-1 Starting 
 Container deploy-web-1 Started 
$ docker compose ps --format 'table {{.Service}}\t{{.Image}}\t{{.Status}}'
SERVICE   IMAGE                      STATUS
web       localhost:5000/spa:1.0.1   Up Less than a second
$ sleep 1; curl -s -o /dev/null -w '/profil %{http_code}\n' http://127.0.0.1:8085/profil
/profil 404
```

- `docker compose pull` — yangi image alohida qadamda yuklanadi; eski konteyner bu vaqtda ishlashda davom etadi.
- `up -d` — konfiguratsiya o'zgargan servis **qayta yaratiladi** (`Recreate`).
- `/profil` — `404`: yangi versiyada xato bor.

### Qaytarish (rollback)

```text vps
$ echo "TEG=1.0.0" > .env
$ docker compose up -d
 Container deploy-web-1 Recreate 
 Container deploy-web-1 Recreated 
 Container deploy-web-1 Starting 
 Container deploy-web-1 Started 
$ sleep 1; curl -s -o /dev/null -w '/profil %{http_code}\n' http://127.0.0.1:8085/profil
/profil 200
```

Eski teg — eski image (u serverda allaqachon bor, `pull` shart emas). 25-bobdagi qoida shu yerda foyda beradi: `1.0.0` tegi hech qachon ko'chirilmagan, shuning uchun u aynan eski image.

Bir nechta servisli stack'da faqat bitta servisni yangilash — hujjatdagi buyruq (`--no-deps` — u bog'liq bo'lgan servislarni qayta yaratmaslik):

```text sxema
$ docker compose up --no-deps -d web
```

## Restart policy

Docker hujjati (Start containers automatically):

| Policy | Xatti-harakati |
| --- | --- |
| `no` | Qayta ishga tushirmaydi (standart) |
| `on-failure[:max-retries]` | Faqat xato bilan (nol bo'lmagan kod) chiqqanda; ixtiyoriy urinishlar soni. Daemon qayta ishga tushganda qaytarmaydi |
| `always` | Har doim. Qo'lda to'xtatilgan bo'lsa — faqat daemon qayta ishga tushganda yoki konteyner qo'lda qayta ishga tushirilganda |
| `unless-stopped` | `always` kabi, lekin to'xtatilgan konteyner daemon qayta ishga tushganda ham qaytmaydi |

### `on-failure:3`

```text vps
$ docker run -d --name xato --restart on-failure:3 busybox:1.37 sh -c 'echo ishga tushdi; exit 1'
Unable to find image 'busybox:1.37' locally
1.37: Pulling from library/busybox
Digest: sha256:a7dbc319b1438115a207e11930dc4bb3e643dcb3ec0bdd694bb36cd8fad289ec
Status: Downloaded newer image for busybox:1.37
ca35feb0f1dd16fddaef4ef4332504bfd80027bc58bf3bf35f44c0d2393ed87b
$ sleep 15; docker inspect --format 'status={{.State.Status}} exit={{.State.ExitCode}} restarts={{.RestartCount}}' xato
status=exited exit=1 restarts=3
$ docker logs xato
ishga tushdi
ishga tushdi
ishga tushdi
ishga tushdi
```

Bir marta ishga tushish + 3 qayta urinish = 4 marta `ishga tushdi`, keyin `exited`, `restarts=3`. Hujjatdagi qo'shimcha qoida: policy konteyner **muvaffaqiyatli ishga tushgandan** keyin (kamida 10 soniya ishlagach) to'liq kuchga kiradi — umuman ishlamaydigan konteyner cheksiz aylanib qolmasligi uchun. Kuzatildi: bizning darhol yiqiladigan konteynerimiz ham 3 marta qayta ishga tushirildi.

### Daemon qayta ishga tushganda

Uch konteyner: `always`, `unless-stopped`, siyosatsiz. Birinchi ikkitasini qo'lda to'xtatamiz, so'ng Docker daemon'ini qayta ishga tushiramiz (server qayta yuklanganda ham xuddi shunday):

```text vps
$ docker run -d --name doim --restart always busybox:1.37 sleep infinity
8cda8f1ead7f20aff58565893f611268252e7e5f1ba2c1ee9978352af85f40c2
$ docker run -d --name toxtatilmasa --restart unless-stopped busybox:1.37 sleep infinity
1fd1409f5c86c4eafc87ef1909c0201514bfa4cbb6ee6f8aef8410c501aba389
$ docker run -d --name siyosatsiz busybox:1.37 sleep infinity
c253b4de8de4f3fc82c33b786905774a5d2d602d7f1feffb281ac60dde649e47
$ docker stop doim toxtatilmasa
doim
toxtatilmasa
$ docker ps -a --filter name=doim --filter name=toxtatilmasa --filter name=siyosatsiz --format 'table {{.Names}}\t{{.Status}}'
NAMES          STATUS
siyosatsiz     Up 10 seconds
toxtatilmasa   Exited (137) Less than a second ago
doim           Exited (137) Less than a second ago
$ systemctl restart docker
$ sleep 3; docker ps -a --filter name=doim --filter name=toxtatilmasa --filter name=siyosatsiz --filter name=deploy-web-1 --format 'table {{.Names}}\t{{.Status}}'
NAMES          STATUS
siyosatsiz     Exited (137) 6 seconds ago
toxtatilmasa   Exited (137) 16 seconds ago
doim           Up 5 seconds
deploy-web-1   Up 5 seconds
$ docker rm -f doim toxtatilmasa siyosatsiz
doim
toxtatilmasa
siyosatsiz
```

| Konteyner | Policy | Daemon'dan oldin | Keyin |
| --- | --- | --- | --- |
| `doim` | `always` | To'xtatilgan | **Up** — qaytdi |
| `toxtatilmasa` | `unless-stopped` | To'xtatilgan | Exited — qaytmadi |
| `siyosatsiz` | — | Ishlayotgan | Exited — daemon bilan to'xtadi, qaytmadi |
| `deploy-web-1` | `unless-stopped` | Ishlayotgan | **Up** — qaytdi |

Xulosa: production servislar uchun `unless-stopped` (yoki `always`) — server qayta yuklansa, ular o'zi ko'tariladi; texnik ish uchun qo'lda to'xtatilgan `unless-stopped` konteyner esa o'zboshimchalik bilan qaytmaydi. (`Exited (137)` — `sleep` PID 1 sifatida `SIGTERM` ni e'tiborsiz qoldirdi, 10 soniyadan keyin `SIGKILL`, 8-bob.)

## Resurs cheklovlari

Docker hujjati (Resource constraints): standart holatda konteynerda resurs chegarasi **yo'q** — u xostdagi barcha xotira va CPU'ni ishlatishi mumkin. Xotira tugasa, Linux yadrosi OOME (out of memory exception) bilan jarayonlarni o'ldiradi; hujjat: Docker daemon'ining OOM ustuvorligi pasaytirilgan, konteynerlarniki esa — yo'q, shuning uchun ko'pincha konteyner o'ldiriladi.

Compose'da — `deploy.resources.limits` (Compose hujjati: Deploy specification); yuqoridagi servisda `cpus: "0.50"`, `memory: 64M`:

```text vps
$ docker inspect --format 'restart={{.HostConfig.RestartPolicy.Name}} memory={{.HostConfig.Memory}} nanocpus={{.HostConfig.NanoCpus}} log={{.HostConfig.LogConfig.Type}} {{json .HostConfig.LogConfig.Config}}' deploy-web-1
restart=unless-stopped memory=67108864 nanocpus=500000000 log=local {"max-file":"3","max-size":"10m"}
$ docker stats --no-stream --format 'table {{.Name}}\t{{.MemUsage}}\t{{.CPUPerc}}' deploy-web-1
NAME           MEM USAGE / LIMIT   CPU %
deploy-web-1   2.688MiB / 64MiB    0.00%
```

`memory=67108864` — 64 MiB, `nanocpus=500000000` — 0.5 CPU. `docker stats` da `/ 64MiB` — chegara ko'rinadi.

Chegaradan oshsa nima bo'ladi — 32 MB chegara bilan 100 MB xotira ishlatishga urinamiz (`tail` kiritmani to'liq xotirada saqlaydi):

```text vps
$ docker run --name oom --memory 32m busybox:1.37 sh -c 'head -c 100m /dev/zero | tail'; echo "chiqish kodi: $?"
Killed
chiqish kodi: 137
$ docker inspect --format 'OOMKilled={{.State.OOMKilled}} exit={{.State.ExitCode}}' oom
OOMKilled=true exit=137
```

`OOMKilled=true`, kod `137` — konteyner o'ldirildi, lekin server va boshqa konteynerlar zarar ko'rmadi. Chegarani ilovaning haqiqiy iste'molidan (`docker stats`, 28-bob) kelib chiqib qo'ying.

## Loglar hajmi

Docker hujjati (Configure logging drivers): standart log drayveri — `json-file`, va u **log aylantirishni (rotation) qilmaydi** — loglar diskni to'ldirishi mumkin. Hujjat tavsiyasi — `local` drayveri: standart holatda aylantiradi va samaraliroq formatda saqlaydi (`local` hujjati: standart 20 MB × 5 fayl = 100 MB, siqilgan).

Aylantirish qanday ishlashini kichik chegara bilan ko'ramiz (`json-file`, 1 KB × 2 fayl):

```text vps
$ docker run -d --name gap --log-opt max-size=1k --log-opt max-file=2 busybox:1.37 sh -c 'i=1; while [ $i -le 200 ]; do echo "qator $i"; i=$((i+1)); done; sleep 3600'
f1cebb693e0fbb8498510c2d91f8e683f408b9af3cee384b6707c53a6ea59c45
$ sleep 2; ls -l $(dirname $(docker inspect --format '{{.LogPath}}' gap)) | grep json
-rw------- 1 root root 3316 Nov  8 01:34 config.v2.json
-rw-r----- 1 root root  400 Nov  8 01:34 f1cebb693e0fbb8498510c2d91f8e683f408b9af3cee384b6707c53a6ea59c45-json.log
-rw-r----- 1 root root 1037 Nov  8 01:34 f1cebb693e0fbb8498510c2d91f8e683f408b9af3cee384b6707c53a6ea59c45-json.log.1
-rw------- 1 root root 1511 Nov  8 01:34 hostconfig.json
$ docker logs gap | head -2; docker logs gap | wc -l
qator 183
qator 184
18
```

200 qatordan faqat oxirgi 18 tasi qoldi (`qator 183` dan) — eski loglar o'chirildi, ikki fayl (`.log` va `.log.1`) 1 KB atrofida.

Ikki yo'l:

| Qayerda | Qanday |
| --- | --- |
| Servisda | `logging: driver: local` + `options` (yuqoridagi `compose.yaml`) |
| Butun server uchun | `/etc/docker/daemon.json` da `"log-driver": "local"` (hujjat), keyin daemon'ni qayta ishga tushirish; hujjat: faqat shundan keyin **yaratilgan** konteynerlarga ta'sir qiladi |

## Tipik xatolar

**1. Restart policy yo'q.**
Server qayta yuklansa, ilova ko'tarilmaydi.
To'g'risi: `restart: unless-stopped`.

**2. Serverda `latest` bilan deploy.**
Qaytarish uchun "oldingi versiya" yo'q.
To'g'risi: aniq teg `.env` da; rollback — eski tegni qaytarish.

**3. Xotira chegarasisiz konteyner.**
Bitta servis butun serverni to'xtatishi mumkin.
To'g'risi: `deploy.resources.limits.memory`.

**4. `json-file` aylantirishsiz.**
Bir necha oyda disk to'ladi.
To'g'risi: `local` drayveri yoki `max-size`/`max-file`.

**5. Serverda `docker build`.**
Build serverning CPU va xotirasini ilova bilan bo'lishadi (21-, 22-boblarda 1 CPU'li serverda build daqiqalab davom etdi); serverda manba kod va build keshi turadi.
To'g'risi: CI'da build → registry → serverda `pull` (25–26-boblar).

## Amaliyot

Savollar:

1. `${TEG:?TEG kerak}` nima qiladi?
2. `always` va `unless-stopped` farqi qachon ko'rinadi?
3. `on-failure:3` da `docker logs` nega 4 qator chiqardi?
4. `OOMKilled=true` nimani bildiradi?
5. `json-file` drayverining standart holatdagi xavfi nima?

<details>
<summary>Javoblar</summary>

1. `TEG` berilmasa, Compose xato bilan to'xtaydi — teg tasodifan bo'sh qolmaydi.
2. Qo'lda to'xtatilgan konteynerda daemon qayta ishga tushganda: `always` — qaytadi, `unless-stopped` — qaytmaydi.
3. Bir marta ishga tushish va 3 marta qayta urinish.
4. Konteyner xotira chegarasidan oshdi va yadro uni o'ldirdi (kod 137).
5. Log aylantirish yo'q — loglar cheksiz o'sib, diskni to'ldirishi mumkin.

</details>

## Rasmiy hujjat

- [Compose: Use Compose in production](https://docs.docker.com/compose/how-tos/production/)
- [Engine: Start containers automatically](https://docs.docker.com/engine/containers/start-containers-automatically/) — restart policy'lar
- [Engine: Resource constraints](https://docs.docker.com/engine/containers/resource_constraints/) · [Compose: Deploy specification — resources](https://docs.docker.com/reference/compose-file/deploy/#resources)
- [Engine: Configure logging drivers](https://docs.docker.com/engine/logging/configure/) · [Local file logging driver](https://docs.docker.com/engine/logging/drivers/local/)
