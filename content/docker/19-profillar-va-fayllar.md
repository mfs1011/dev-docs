# 19 — Profillar va bir nechta fayl

[← Oldingi: Lokal ishlab chiqish muhiti](18-lokal-muhit.md) · [Mundarija](README.md)

## Tushuncha

Bitta ilova turli joylarda turlicha ishlaydi: ishlab chiqishda port ochiq va loglar batafsil, serverda — `restart` siyosati va boshqa sozlamalar; ba'zan qo'shimcha vosita (debug, admin panel) faqat kerak bo'lganda. Har muhit uchun alohida, deyarli bir xil Compose fayli — takrorlanish va xatolar manbai. Compose'ning ikki vositasi:

| Vosita | Nima qiladi |
| --- | --- |
| **Profillar** | Ba'zi servislarni faqat so'ralganda ishga tushirish |
| **Bir nechta fayl** | Asosiy faylni muhitga qarab boshqa fayl bilan **birlashtirish** (override) |

## Profillar

Docker hujjati (Using profiles with Compose): servisga `profiles:` ro'yxati beriladi. **Profilsiz servislar doim yoqilgan**, profillilari — faqat o'sha profil yoqilganda. Hujjat maslahati: ilovaning asosiy servislariga profil bermang — ular doim ishga tushsin.

Profil yoqish: `--profile NOM` yoki `COMPOSE_PROFILES=NOM`.

Misol: 15-bobdagi hisoblagich + Redis'ga kelayotgan buyruqlarni ko'rsatib turadigan `kuzatuvchi` (`redis-cli monitor`) — faqat debug uchun:

```yaml
services:
  web:
    build: ../hisob
    environment:
      REDIS_URL: redis://redis:6379
      LOG_DARAJASI: info
  redis:
    image: redis:8-alpine
  kuzatuvchi:
    image: redis:8-alpine
    command: ["redis-cli", "-h", "redis", "monitor"]
    profiles: [debug]
```

```text vps
$ docker compose config --services
redis
web
$ docker compose --profile debug config --services
kuzatuvchi
redis
web
```

`config --services` — Compose qaysi servislarni ishga tushirishini ko'rsatadi: profilsiz — ikkita, `--profile debug` bilan — uchta.

```text vps
$ docker compose up -d 2>&1 | grep Started
 Container s19-web-1 Started 
 Container s19-redis-1 Started 
$ docker compose ps --format '{{.Service}}'
redis
web
$ docker compose --profile debug up -d 2>&1 | grep Started
 Container s19-kuzatuvchi-1 Started 
$ docker compose ps --format '{{.Service}}'
kuzatuvchi
redis
web
$ sleep 3; curl -s http://127.0.0.1:3000/ > /dev/null; docker compose logs kuzatuvchi | tail -2
kuzatuvchi-1  | 1794086715.834071 [0 172.18.0.2:54292] "CLIENT" "SETINFO" "LIB-NAME" "node-redis"
kuzatuvchi-1  | 1794086718.946766 [0 172.18.0.2:54292] "INCR" "tashriflar"
$ docker compose --profile debug down 2>&1 | tail -1
 Network s19_default Removed 
```

- Oddiy `up` — `kuzatuvchi` ishga tushmadi.
- `--profile debug up` — faqat yetishmayotgani qo'shildi (`web` va `redis` allaqachon ishlayapti, Compose deklarativ — 15-bob).
- `kuzatuvchi` Redis'ga kelgan buyruqni ko'rdi: `INCR tashriflar`.
- `down` da ham `--profile debug` kerak — aks holda `kuzatuvchi` to'xtatilmaydi (u tarmoqni band qilib turadi).

Hujjat yana: profilli servisni buyruqda **nomi bilan** ko'rsatsangiz (masalan, `docker compose run kuzatuvchi`), profilni yoqish shart emas — faqat o'sha servis (va uning `depends_on` dagilari) ishga tushadi. Bir martalik vositalar uchun qulay.

## Bir nechta fayl: override

Docker hujjati (Merge Compose files): Compose standart holatda **ikki** faylni o'qiydi — `compose.yaml` va (bo'lsa) `compose.override.yaml`. Odatda birinchisida asosiy sozlama, ikkinchisida — o'zgartirishlar yoki qo'shimcha servislar. Boshqa fayllar — `-f` bilan (yoki `COMPOSE_FILE`): ular buyruqdagi **tartibda** birlashtiriladi, keyingisi oldingisini o'zgartiradi yoki unga qo'shadi.

Uchta fayl:

```text vps
$ ls
compose.override.yaml
compose.prod.yaml
compose.yaml
```

`compose.override.yaml` — ishlab chiqish uchun (port ochiq, batafsil log):

```yaml
services:
  web:
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      LOG_DARAJASI: debug
```

`compose.prod.yaml` — server uchun (restart siyosati, 27-bob):

```yaml
services:
  web:
    restart: unless-stopped
  redis:
    restart: unless-stopped
```

Natijani `docker compose config` bilan solishtiramiz:

```text vps
$ docker compose config | grep -E 'LOG_DARAJASI|published|restart'
      LOG_DARAJASI: debug
        published: "3000"
$ docker compose -f compose.yaml config | grep -E 'LOG_DARAJASI|published|restart'
      LOG_DARAJASI: info
$ docker compose -f compose.yaml -f compose.prod.yaml config | grep -E 'LOG_DARAJASI|published|restart'
    restart: unless-stopped
    restart: unless-stopped
      LOG_DARAJASI: info
```

| Buyruq | Qaysi fayllar | Natija |
| --- | --- | --- |
| `docker compose …` | `compose.yaml` + `compose.override.yaml` (avtomatik) | `debug`, port 3000 |
| `docker compose -f compose.yaml …` | Faqat asosiy | `info`, port yo'q |
| `docker compose -f compose.yaml -f compose.prod.yaml …` | Asosiy + prod | `info`, port yo'q, `restart` |

`-f` berilsa, `compose.override.yaml` **avtomatik o'qilmaydi** — shuning uchun serverda override'dagi ishlab chiqish porti ochilmaydi. Tipik tuzilma: `compose.yaml` (umumiy), `compose.override.yaml` (lokal ishlab chiqish, avtomatik), `compose.prod.yaml` (server, `-f` bilan).

Birlashtirish qoidalari (hujjat va Compose Specification — Merge): oddiy qiymatlar va map'lar (masalan, `environment:`) keyingi fayldagisi bilan **almashtiriladi**, ro'yxatlar **qo'shiladi**. Nisbiy yo'llar birinchi fayl papkasiga nisbatan.

## `include` va `extends`

Hujjat yana ikki yo'lni beradi:

- **`include`** — boshqa Compose faylini o'z faylingizga qo'shish. Har kiritilgan fayl o'z papkasiga nisbatan yuklanadi (nisbiy yo'l muammosi yo'q), keyin uning resurslari joriy modelga ko'chiriladi. Katta jamoalarda: bir jamoa o'z servisini (baza va uning yordamchilari bilan) alohida faylda yuritadi, boshqalari uni `include` bilan ishlatadi.
- **`extends`** — boshqa fayldagi servis sozlamasini olib, ustidan ba'zi qiymatlarni o'zgartirish.

## Tipik xatolar

**1. Asosiy servislarga profil berish.**
Oddiy `up` ularni ishga tushirmaydi.
To'g'risi: profil — faqat ixtiyoriy vositalarga.

**2. `--profile` siz `down`.**
Profilli konteynerlar qoladi:

```text vps
$ docker compose --profile debug up -d 2>&1 | grep -c Started
3
$ docker compose down 2>&1 | grep -E "kuzatuvchi|Network"
 Network s19_default Removing 
 Network s19_default Resource is still in use 
$ docker ps --format "{{.Names}}" | grep s19
s19-kuzatuvchi-1
$ docker compose --profile debug down 2>&1 | tail -2
 Network s19_default Removing 
 Network s19_default Removed 
```

To'g'risi: `docker compose --profile debug down`.

**3. Serverda `compose.override.yaml` borligini unutish.**
`-f` siz `up` — ishlab chiqish sozlamalari (ochiq port) serverga ham tushadi.
To'g'risi: serverda `-f compose.yaml -f compose.prod.yaml`, yoki override faylini serverga qo'ymaslik.

**4. Fayllar birlashganini taxmin qilish.**
To'g'risi: `docker compose … config` bilan yakuniy natijani ko'rish.

## Amaliyot

Savollar:

1. `profiles: [debug]` li servis oddiy `docker compose up` da ishga tushadimi?
2. `compose.override.yaml` qachon avtomatik o'qilmaydi?
3. `compose.yaml` da `LOG: info`, override'da `LOG: debug`. Natija?
4. Serverda ishlab chiqish portini ochmaslik uchun nima qilasiz?
5. `include` ning `-f` bilan birlashtirishdan farqi nimada?

<details>
<summary>Javoblar</summary>

1. Yo'q — faqat `--profile debug`, `COMPOSE_PROFILES=debug` yoki servis nomi bilan aniq chaqirilganda.
2. `-f` (yoki `COMPOSE_FILE`) bilan fayllar ko'rsatilganda.
3. `debug` — map qiymati keyingi fayldagisi bilan almashtiriladi.
4. `docker compose -f compose.yaml -f compose.prod.yaml up -d` — override o'qilmaydi.
5. `include` qilingan fayl o'z papkasiga nisbatan yuklanadi va resurslari modelga ko'chiriladi; `-f` esa fayllarni bitta model qilib birlashtiradi (nisbiy yo'llar birinchi fayl papkasiga nisbatan).

</details>

## Rasmiy hujjat

- [Using profiles with Compose](https://docs.docker.com/compose/how-tos/profiles/)
- [Working with multiple Compose files](https://docs.docker.com/compose/how-tos/multiple-compose-files/) · [Merge](https://docs.docker.com/compose/how-tos/multiple-compose-files/merge/) · [Include](https://docs.docker.com/compose/how-tos/multiple-compose-files/include/) · [Extend](https://docs.docker.com/compose/how-tos/multiple-compose-files/extends/)
- [Compose Specification: Merge](https://docs.docker.com/reference/compose-file/merge/)
- [docker compose config](https://docs.docker.com/reference/cli/docker/compose/config/)
