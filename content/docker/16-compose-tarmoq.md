# 16 — Compose'da tarmoq

[← Oldingi: Compose asoslari](15-compose-asoslari.md) · [Mundarija](README.md)

## Tushuncha

5-bobda: konteynerlar bir-birini **nom** bilan faqat o'z (user-defined) tarmog'ida topadi. Compose buni o'zi qiladi. Docker hujjati (Networking in Compose):

1. `docker compose up` loyiha uchun `<loyiha>_default` tarmog'ini yaratadi (`bridge` drayveri).
2. Har servis konteyneri shu tarmoqqa **servis nomi** bilan qo'shiladi.
3. Servis nomi ichki DNS'ga yoziladi — boshqa servislar unga nom bilan ulanadi, IP kerak emas.

15-bobdagi `REDIS_URL: redis://redis:6379` aynan shunday ishladi.

## Ikki port: ichki va tashqi

Hujjat misoli: `db` servisida `ports: "8001:5432"`.

| Kim ulanadi | Manzil | Qaysi port |
| --- | --- | --- |
| Shu tarmoqdagi boshqa servis | `db:5432` | Konteyner porti (`CONTAINER_PORT`) |
| Serverning o'zi / tashqaridan | `localhost:8001` | Host porti (`HOST_PORT`) |

Servislar o'rtasidagi aloqa uchun `ports:` **umuman kerak emas** — u faqat tarmoq tashqarisidan kirish uchun. 15-bobdagi Redis'da `ports:` yo'q edi, lekin `web` unga ulandi.

### IP o'zgaradi, nom — yo'q

Hujjat: konteyner har ishga tushganda tarmoqdan IP manzilni dinamik oladi; konfiguratsiya o'zgarib `up` qilinsa, eski konteyner o'chirilib, yangisi **boshqa IP** bilan, lekin **o'sha nom** bilan tarmoqqa qo'shiladi. Eski IP'ga ochiq ulanishlar uziladi — qayta nom bilan ulanish ilovaning vazifasi. Shuning uchun har doim servis nomi.

## O'z tarmoqlaringiz

Hujjatdagi namuna: `proxy` — tashqi dunyoga qaragan, `db` — ichkarida, `app` — ikkalasining o'rtasida. `proxy` bazaga umuman yeta olmasligi kerak. Buning uchun yuqori darajadagi `networks:` da tarmoqlar e'lon qilinadi va har servisga o'zinikilari beriladi.

Bundan tashqari `internal: true` — hujjat: bunday tarmoq xostning tarmoq interfeyslariga ulanmaydi, tashqariga chiqish yo'lagi (default gateway) yo'q. Bazalar kabi tashqaridan butunlay yetib bo'lmasligi kerak bo'lgan servislar uchun.

15-bobdagi hisoblagich bilan:

```text vps
$ cat compose.yaml
services:
  proxy:
    image: nginx:1.29
    networks:
      - frontend
  web:
    build: ../hisob
    environment:
      REDIS_URL: redis://redis:6379
    networks:
      - frontend
      - backend
  redis:
    image: redis:8-alpine
    networks:
      - backend

networks:
  frontend:
  backend:
    internal: true
```

```text vps
$ docker compose up -d 2>&1 | grep -E 'Network .* Created|Started'
 Network s16_backend Created 
 Network s16_backend Created 
 Network s16_frontend Created 
 Network s16_frontend Created 
 Container s16-web-1 Started 
 Container s16-proxy-1 Started 
 Container s16-redis-1 Started 
$ docker network ls --filter name=s16
NETWORK ID     NAME           DRIVER    SCOPE
ec8310f05955   s16_backend    bridge    local
3d222bfcdb81   s16_frontend   bridge    local
```

Ikki tarmoq: `s16_frontend` va `s16_backend` (loyiha nomi — papka `s16`).

<div data-animatsiya="qadamli" data-nom="tarmoq"></div>

```text vps
$ docker compose exec proxy getent hosts web
172.19.0.2      web
$ docker compose exec proxy getent hosts redis; echo "kod: $?"
kod: 2
$ sleep 2; docker compose exec proxy curl -s http://web:3000/
Salom! Bu sahifa 1 marta ochildi.
```

- `proxy` → `web`: ikkalasi `frontend` da — nom topildi.
- `proxy` → `redis`: umumiy tarmoq yo'q — `getent` hech narsa topmadi (kod 2).
- `proxy` → `web` → `redis`: `web` ikkala tarmoqda, so'rov o'tdi — hisoblagich ishladi.

```text vps
$ docker compose exec web wget -qO- -T 5 https://registry.npmjs.org/ > /dev/null && echo "web: internet bor"
web: internet bor
$ docker compose exec redis wget -qO- -T 5 https://registry.npmjs.org/ > /dev/null; echo "redis kod: $?"
wget: bad address 'registry.npmjs.org'
redis kod: 1
```

- `web` `frontend` (oddiy tarmoq) orqali internetga chiqa oladi.
- `redis` faqat `internal` tarmoqda — tashqi nomni ham aniqlay olmadi. Hujjat: servis internal va oddiy tarmoqqa birga ulangan bo'lsa, oddiy tarmoq orqali internetga chiqa oladi.

```text vps
$ docker compose down 2>&1 | grep Network
 Network s16_frontend Removing 
 Network s16_backend Removing 
 Network s16_frontend Removed 
 Network s16_backend Removed 
```

## Boshqa imkoniyatlar

Hujjatda yana:

| Imkoniyat | Qachon |
| --- | --- |
| `network_mode: host` | Konteyner serverning tarmog'ini to'g'ridan-to'g'ri ishlatadi: port xaritasi yo'q, servis nomi DNS'i ishlamaydi. Hujjat: faqat chindan kerak bo'lsa (masalan, tarmoq monitoringi) — u serverning barcha portlari va trafigini ko'radi |
| `network_mode: none` | Tarmoq butunlay o'chiq |
| `external: true` | `docker network create` bilan oldindan yaratilgan tarmoqqa ulanish — masalan, bir nechta Compose loyihasini bog'lash |

Standart holat — loyihaning `bridge` tarmog'i, hujjat bo'yicha eng xavfsiz rejim.

## Tipik xatolar

**1. Servislar o'rtasidagi aloqa uchun `ports:` ochish.**
Kerak emas — va port tashqariga ham ochiladi (5-bob).
To'g'risi: servis nomi va konteyner porti.

**2. Ichkarida host portini ishlatish.**
`db:8001` — noto'g'ri; ichkarida `db:5432`.

**3. Hamma servislar bitta tarmoqda.**
Proxy bazaga yeta oladi — keraksiz yo'l.
To'g'risi: `frontend`/`backend` va bazaga `internal: true`.

**4. IP manzillarni sozlamaga yozish.**
Qayta yaratilganda o'zgaradi.
To'g'risi: servis nomi.

## Amaliyot

Savollar:

1. `myapp` papkasida `docker compose up` qanday tarmoq yaratadi?
2. `db` servisida `ports: "8001:5432"`. `web` servisi bazaga qaysi manzil bilan ulanadi?
3. `proxy` va `db` umumiy tarmoqsiz. `proxy` ichida `getent hosts db` nima beradi?
4. `internal: true` nima qiladi?
5. Servis faqat internal tarmoqqa ulangan. U npm registry'dan paket yuklay oladimi?

<details>
<summary>Javoblar</summary>

1. `myapp_default` (`bridge`).
2. `db:5432` — ichkarida konteyner porti.
3. Hech narsa (kod 2): nom topilmaydi.
4. Tarmoqni xost interfeyslariga ulamaydi — tashqi aloqa (default gateway) yo'q.
5. Yo'q — tashqi nomni ham aniqlay olmaydi.

</details>

## Rasmiy hujjat

- [Networking in Compose](https://docs.docker.com/compose/how-tos/networking/) — standart tarmoq, servis nomlari, portlar, o'z tarmoqlari, `internal`, `network_mode`, `external`
- [Networks top-level element](https://docs.docker.com/reference/compose-file/networks/)
- [Networking overview](https://docs.docker.com/engine/network/) · [Bridge network driver](https://docs.docker.com/engine/network/drivers/bridge/)
