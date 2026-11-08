# 17 — Ishga tushish tartibi va healthcheck

[← Oldingi: Compose'da tarmoq](16-compose-tarmoq.md) · [Mundarija](README.md) · [Keyingi: Lokal ishlab chiqish muhiti →](18-lokal-muhit.md)

## Tushuncha

15-bobda `curl` dan oldin `sleep 2` qo'yishga to'g'ri keldi: konteyner `Started`, lekin ilova hali tayyor emas edi. Docker hujjati (Control startup and shutdown order) buni aniq aytadi: **Compose konteyner "tayyor" bo'lishini emas, faqat ishga tushishini (running) kutadi.** Masalan, baza ulanishlarni qabul qilishdan oldin o'z ichki servislarini ishga tushirishi kerak — shu paytda unga ulangan ilova yiqiladi.

| Vosita | Nima qiladi |
| --- | --- |
| `depends_on` | Servislar **qaysi tartibda** yaratilishi va to'xtatilishi |
| `healthcheck` | Konteyner **sog'lommi** — buni tekshiradigan buyruq |
| `condition: service_healthy` | Bog'liq servis **sog'lom** bo'lguncha kutish |

## Muammo

Muammoni ko'rinarli qilish uchun Redis'ni 5 soniya kechikib ishga tushadigan qilamiz (`command:` — image'dagi standart buyruq o'rniga, 8-bob) — og'ir baza shunday sekin tayyor bo'ladi:

```text vps
$ cat compose.yaml
services:
  web:
    build: ../hisob
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      REDIS_URL: redis://redis:6379
  redis:
    image: redis:8-alpine
    command: ["sh", "-c", "sleep 5 && exec redis-server"]
$ docker compose up -d 2>&1 | grep Started
 Container s17-web-1 Started 
 Container s17-redis-1 Started 
$ sleep 8; docker compose ps -a --format "table {{.Service}}\t{{.Status}}"
SERVICE   STATUS
redis     Up 9 seconds
web       Exited (1) 7 seconds ago
```

```text vps
$ sleep 8; docker compose logs web | grep -m1 Error
web-1  | Error: connect ECONNREFUSED 172.18.0.3:6379
```

```text vps
$ curl -s -m 3 http://127.0.0.1:3000/; echo "kod: $?"
kod: 7
$ docker compose down 2>&1 | tail -1
 Network s17_default Removed 
```

- Ikkala servis birga ishga tushdi; `web` darhol Redis'ga ulanmoqchi bo'ldi — port hali yopiq: `ECONNREFUSED`.
- `web` yiqildi — `Exited (1)` — va o'zi qayta ishga tushmadi (restart policy — 27-bob). Sayt ishlamayapti (`curl` kodi 7 — ulanib bo'lmadi).

## healthcheck

`healthcheck` — Docker konteyner ichida vaqti-vaqti bilan bajaradigan tekshiruv buyrug'i. Dockerfile ma'lumotnomasi (`HEALTHCHECK`) bo'yicha konteyner holati avval `starting`, tekshiruv muvaffaqiyatli bo'lsa — `healthy`, ketma-ket `retries` marta muvaffaqiyatsiz bo'lsa — `unhealthy`.

| Parametr | Ma'nosi | Standart (Dockerfile) |
| --- | --- | --- |
| `test` | Tekshiruv buyrug'i: `["CMD", …]` (exec) yoki `["CMD-SHELL", "…"]` (qobiq orqali) | — |
| `interval` | Tekshiruvlar oralig'i | 30s |
| `timeout` | Bitta tekshiruv uchun vaqt; oshsa — muvaffaqiyatsiz | 30s |
| `retries` | Nechta ketma-ket muvaffaqiyatsizlikdan keyin `unhealthy` | 3 |
| `start_period` | Ishga tushish davri: bu vaqtdagi muvaffaqiyatsizliklar hisoblanmaydi | 0s |

Tekshiruv buyrug'i kodi `0` bo'lsa — sog'lom. Redis uchun tabiiy tekshiruv — `redis-cli ping`.

Hujjatdagi `depends_on` misoli PostgreSQL uchun:

```yaml
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
```

(`$$` — Compose faylida `$` ning o'zi; Compose uni o'z o'zgaruvchisi deb ochmasin, 18-bob.)

## Yechim: `condition: service_healthy`

Hujjat: tayyorlikni kutish uchun `depends_on` ga `condition`:

| `condition` | Kutadi |
| --- | --- |
| `service_started` | Bog'liq servis ishga tushishini (standart) |
| `service_healthy` | Bog'liq servisning `healthcheck` i o'tishini |
| `service_completed_successfully` | Bog'liq servis muvaffaqiyatli **tugashini** (masalan, migratsiya, 21-bob) |

```text vps
$ cat compose.healthy.yaml
services:
  web:
    build: ../hisob
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      REDIS_URL: redis://redis:6379
    depends_on:
      redis:
        condition: service_healthy
  redis:
    image: redis:8-alpine
    command: ["sh", "-c", "sleep 5 && exec redis-server"]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 2s
      timeout: 3s
      retries: 10
```

<div data-animatsiya="qadamli" data-nom="sogliq"></div>

```text vps
$ time docker compose -f compose.healthy.yaml up -d 2>&1 | grep -E "Waiting|Healthy|Started"
 Container s17-redis-1 Started 
 Container s17-redis-1 Waiting 
 Container s17-redis-1 Healthy 
 Container s17-web-1 Started 

real	0m7.823s
user	0m0.144s
sys	0m0.047s
$ docker compose -f compose.healthy.yaml ps --format "table {{.Service}}\t{{.Status}}"
SERVICE   STATUS
redis     Up 7 seconds (healthy)
web       Up Less than a second
$ sleep 2; curl -s http://127.0.0.1:3000/
Salom! Bu sahifa 1 marta ochildi.
```

- `Waiting` → `Healthy` → shundan keyingina `web` `Started`. `up` 7.8 soniya oldi — Redis'ning kechikishi va tekshiruvlar.
- `docker compose ps` — `Up 7 seconds (healthy)`: holat ko'rinadi.
- Sayt ishlayapti.

Tekshiruvlar tarixi `docker inspect` da saqlanadi:

```text vps
$ docker inspect -f "{{json .State.Health.Log}}" s17-redis-1 | head -c 200; echo
[{"Start":"2026-11-08T00:07:05.163971643+03:00","End":"2026-11-08T00:07:05.238703896+03:00","ExitCode":1,"Output":"Could not connect to Redis at 127.0.0.1:6379: Connection refused\n"},{"Start":"2026-1
$ docker compose -f compose.healthy.yaml down 2>&1 | tail -1
 Network s17_default Removed 
```

Birinchi tekshiruvlar — `ExitCode: 1`, `Connection refused` (Redis hali uxlayapti); keyinroqlari muvaffaqiyatli bo'lgan.

### Qayta ishga tushirish va to'xtatish

Hujjat:

- `depends_on` dagi `restart: true` — bog'liq servis Compose buyrug'i bilan (masalan, `docker compose restart db`) qayta ishga tushirilsa, unga bog'liq servis ham qayta ishga tushadi — ulanishlarni yangilash uchun.
- Compose servislarni o'chirishda ham shu tartibga rioya qiladi, faqat teskari: avval `web`, keyin `db`.

### `healthcheck` faqat ishga tushishda emas

`service_healthy` faqat **ishga tushishdagi** tartibni hal qiladi. Ishlash davomida Redis yiqilsa, ilova buni o'zi ko'tarishi kerak (qayta ulanish) — hujjat 16-bobda aytganidek, bu ilovaning vazifasi. Ilovaning o'ziga ham healthcheck qo'yish foydali: `docker ps` va monitoring uning holatini ko'radi (27–28-boblar).

## Tipik xatolar

**1. `depends_on` ni "kutish" deb o'ylash.**
Shartsiz `depends_on` faqat tartib beradi — tayyorlikni emas.
To'g'risi: `condition: service_healthy` + `healthcheck`.

**2. `sleep 10` bilan "kutish".**
Bir serverda yetadi, boshqasida — yo'q.
To'g'risi: healthcheck.

**3. Healthcheck faqat "jarayon tirikmi" ni tekshiradi.**
Masalan, port ochiq, lekin baza hali so'rovga javob bermaydi.
To'g'risi: haqiqiy so'rov — `pg_isready`, `redis-cli ping`, HTTP `/health`.

**4. Image'da yo'q vosita bilan tekshirish.**
`curl` yo'q image'da `test: curl …` doim yiqiladi → `unhealthy`.
To'g'risi: image'dagi vosita (11-bob: `slim`/`alpine` da nimalar borligi).

## Amaliyot

Savollar:

1. `depends_on: [db]` bo'lsa, Compose `db` tayyor bo'lishini kutadimi?
2. Healthcheck holatlari qanday o'zgaradi?
3. `interval: 2s`, `retries: 10`. Doim yiqiladigan tekshiruvda konteyner qachon `unhealthy` bo'ladi?
4. Migratsiya servisi tugagandan keyin ilova ishga tushishi uchun qaysi `condition`?
5. Compose faylida `$${POSTGRES_USER}` nega ikki `$` bilan?

<details>
<summary>Javoblar</summary>

1. Yo'q — faqat ishga tushishini (running).
2. `starting` → `healthy`; ketma-ket `retries` marta muvaffaqiyatsiz bo'lsa — `unhealthy`.
3. Taxminan 10 ta ketma-ket muvaffaqiyatsiz tekshiruvdan keyin — ~20 soniyada (`start_period` bo'lmasa).
4. `service_completed_successfully`.
5. `$$` — Compose `$` ni o'zgaruvchi sifatida ochmasligi uchun; tekshiruv konteyner ichida o'zining muhit o'zgaruvchilari bilan ishlaydi.

</details>

## Rasmiy hujjat

- [Control startup and shutdown order](https://docs.docker.com/compose/how-tos/startup-order/) — `depends_on`, `condition`, `restart: true`
- [Services: healthcheck](https://docs.docker.com/reference/compose-file/services/#healthcheck) · [Services: depends_on](https://docs.docker.com/reference/compose-file/services/#depends_on)
- [Dockerfile reference: HEALTHCHECK](https://docs.docker.com/reference/dockerfile/#healthcheck) — holatlar va standart qiymatlar
