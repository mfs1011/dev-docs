# 06 — Hash

[Mundarija](README.md)

## Tushuncha

RD (Redis hashes): **hash** — **maydon-qiymat** (field-value) juftlaridan iborat yozuv. U bilan oddiy **obyektlar**ni (foydalanuvchi, mahsulot) yoki bir guruh **hisoblagichlar**ni saqlash qulay.

```text
bike:1  →  model: Deimos
           brand: Ergonom
           type:  Enduro bikes
           price: 4972
```

String'da butun obyektni bitta satr (masalan, JSON) qilib saqlasangiz, bitta maydonni o'zgartirish uchun hammasini o'qib-yozish kerak. Hash'da har maydon alohida o'qiladi va o'zgartiriladi.

### Asosiy buyruqlar

| Buyruq | Nima |
| --- | --- |
| `HSET k f1 v1 [f2 v2 …]` | Maydonlarni yozish; **yangi** qo'shilgan maydonlar sonini qaytaradi |
| `HGET k f` | Bitta maydon |
| `HMGET k f1 f2 …` | Bir nechta maydon (massiv; yo'q maydon — `nil`) |
| `HGETALL k` | Hamma maydon va qiymat |
| `HDEL k f …`, `HEXISTS k f`, `HLEN k`, `HKEYS k`, `HVALS k` | O'chirish, borligi, soni, nomlari, qiymatlari |
| `HINCRBY k f n` | Maydonni butun songa oshirish (atomar, 5-bobdagi `INCR` kabi) |

RD: hash'dagi maydonlar sonining **amaliy chegarasi yo'q** (xotiradan tashqari): nazariy maksimal — 2^32 − 1 juft. Ko'p buyruq **O(1)**; `HKEYS`, `HVALS`, `HGETALL` va muddat bilan bog'liq ko'p buyruqlar — **O(n)** (n — maydonlar soni).

**Kichik hash'lar** xotirada maxsus, juda tejamkor ko'rinishda saqlanadi (RD). `OBJECT ENCODING` bo'yicha: Redis 7.0 dan — `listpack` (kichik hash), aks holda — `hashtable`.

### Maydon muddati

Redis 7.4 dan har **maydon**ga alohida muddat berish mumkin (RD) — kalit muddati (4-bob) kabi, lekin bitta maydonga:

| Buyruq | Nima |
| --- | --- |
| `HEXPIRE k soniya FIELDS n f1 …` / `HPEXPIRE` | Muddat soniya / millisekundda |
| `HEXPIREAT`, `HPEXPIREAT` | Tugash vaqti — Unix vaqti |
| `HTTL`, `HPTTL` | Qolgan vaqt |
| `HEXPIRETIME`, `HPEXPIRETIME` | Tugash vaqti |
| `HPERSIST` | Maydon muddatini olib tashlash |
| `HSETEX`, `HGETEX` (Redis 8.0 dan) | Maydonni yozish yoki o'qish bilan birga muddat berish |

`HEXPIRE` har maydon uchun natija qaytaradi: `1` — muddat berildi, `0` — `NX`/`XX`/`GT`/`LT` sharti bajarilmadi, `2` — muddat `0` (maydon darhol o'chirildi), `-2` — maydon yoki kalit yo'q. `HTTL`: `-1` — muddat yo'q, `-2` — maydon yo'q.

RD'dagi qo'llanishlar: oxirgi bir soatdagi hodisalar (har maydon — bir soat muddat bilan, `HLEN` — soni); faol sessiyalar ro'yxati (faoliyatsiz sessiya maydoni o'zi o'chadi).

## Ko'rib chiqamiz

VPS'da (Redis 8.10.3, xom rejim).

### Obyekt sifatida

```text vps
$ redis-cli FLUSHALL
OK
$ redis-cli HSET bike:1 model Deimos brand Ergonom type 'Enduro bikes' price 4972; redis-cli HGET bike:1 model; redis-cli HMGET bike:1 model price no-such-field
4
Deimos
Deimos
4972
$ redis-cli HGETALL bike:1; redis-cli HLEN bike:1; redis-cli HEXISTS bike:1 brand; redis-cli HKEYS bike:1
model
Deimos
brand
Ergonom
type
Enduro bikes
price
4972
4
1
model
brand
type
price
$ redis-cli HSET bike:1 price 4500 color qora; redis-cli HDEL bike:1 color; redis-cli HGET bike:1 price
1
1
4500
```

- `HSET` birinchi safar `4` (to'rt yangi maydon). Ikkinchi `HSET bike:1 price 4500 color qora` — `1`: `price` yangilandi (yangi emas), `color` — yangi.
- `HMGET` dagi `no-such-field` — bo'sh qator (`nil`).

### Hisoblagichlar

```text vps
$ redis-cli HINCRBY bike:1 price 100; redis-cli HINCRBY bike:1 price -100
4600
4500
$ redis-cli HINCRBY bike:1:stats rides 1; redis-cli HINCRBY bike:1:stats rides 1; redis-cli HINCRBY bike:1:stats crashes 1; redis-cli HGETALL bike:1:stats
1
2
1
rides
2
crashes
1
```

Bitta kalit — bir velosiped uchun bir nechta hisoblagich (RD misoli).

### Maydon muddati

```text vps
$ redis-cli HSET sensor:sensor1 air_quality 256 battery_level 89; redis-cli HEXPIRE sensor:sensor1 60 FIELDS 2 air_quality battery_level; redis-cli HTTL sensor:sensor1 FIELDS 2 air_quality battery_level; redis-cli TTL sensor:sensor1
2
1
1
60
60
-1
$ redis-cli HEXPIRE sensor:sensor1 3 FIELDS 1 air_quality; sleep 4; redis-cli HGETALL sensor:sensor1; redis-cli HTTL sensor:sensor1 FIELDS 2 air_quality battery_level
1
battery_level
89
-2
56
$ redis-cli HPERSIST sensor:sensor1 FIELDS 1 battery_level; redis-cli HTTL sensor:sensor1 FIELDS 1 battery_level
1
-1
```

- Ikki maydonga 60 soniya: `HEXPIRE` har biri uchun `1`, `HTTL` — `60`. **Kalit**ning o'zida muddat yo'q: `TTL` — `-1`.
- `air_quality` ga 3 soniya: 4 soniyadan keyin u yo'q (`HTTL` — `-2`), `battery_level` qoldi.
- `HPERSIST` — muddat olindi (`-1`).

```text vps
$ redis-cli HSETEX sessiyalar EX 2 FIELDS 2 s1 ali s2 vali; redis-cli HLEN sessiyalar; sleep 3; redis-cli HLEN sessiyalar; redis-cli EXISTS sessiyalar
1
2
0
0
```

`HSETEX … EX 2` — ikki maydon 2 soniyalik muddat bilan. Hammasi o'chgach, **kalitning o'zi ham yo'qoldi** (`EXISTS` — `0`) — bo'sh hash saqlanmaydi.

### Xotirada qanday saqlanadi

```text vps
$ redis-cli HSET kichik a 1 b 2; redis-cli OBJECT ENCODING kichik; for i in $(seq 1 200); do echo "HSET katta f$i v$i"; done | redis-cli > /dev/null; redis-cli OBJECT ENCODING katta
2
listpack
listpack
$ for i in $(seq 1 600); do echo "HSET katta2 f$i v$i"; done | redis-cli > /dev/null; redis-cli HLEN katta2; redis-cli OBJECT ENCODING katta2
600
hashtable
$ redis-cli CONFIG GET hash-max-listpack-entries
hash-max-listpack-entries
512
```

- Kichik hash va 200 maydonli hash — `listpack` (tejamkor ko'rinish).
- 600 maydonli — `hashtable`. Chegara `hash-max-listpack-entries` sozlamasida — standart **512** maydon (kuzatildi: 512 dan oshganda o'zgardi).

## Variantlar: obyektni qanday saqlash

| Usul | Qachon | Kamchiligi |
| --- | --- | --- |
| **Hash** | Tekis obyekt, maydonlar alohida o'qiladi/yoziladi, hisoblagichlar, maydon muddati kerak | Ichma-ich tuzilma yo'q; qiymatlar — satr |
| String'da JSON matn | Obyekt doim butunligicha o'qiladi | Bitta maydonni o'zgartirish — hammasini qayta yozish |
| JSON turi (11-bob) | Ichma-ich tuzilma, yo'l bilan qism o'zgartirish | Qo'shimcha imkoniyat, xotira ko'proq bo'lishi mumkin |

Tanlash — 12-bob.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Katta hash'ga `HGETALL` | O(n) — ko'p maydonda sekin va trafik katta | `HMGET` kerakli maydonlar bilan yoki `HSCAN` |
| Obyektni JSON satr qilib saqlab, maydonni o'zgartirish | Hammasini o'qib-yozish, poyga xavfi | Hash |
| Hisoblagichni `HGET` + `HSET` bilan oshirish | Atomar emas | `HINCRBY` |
| `HSET` javobini "yozilgan maydonlar soni" deb o'qish | Faqat **yangi** maydonlar soni | Yangilash `0` qaytarishi mumkin |
| Maydon muddatini kalit muddati bilan aralashtirish | `HEXPIRE` kalitga muddat bermaydi (`TTL` `-1`) | Kerak bo'lsa ikkalasini alohida |
| Har kichik obyekt uchun alohida string kalitlar (`user:1:ism`, `user:1:yosh`…) | Kalitlar ko'payadi | Bitta hash: `user:1` |

## Amaliyot

1. Hash nima va u string'dan obyekt saqlashda nimasi bilan yaxshi?
2. `HSET` qaytargan son nimani bildiradi?
3. Qaysi hash buyruqlari O(n)?
4. `HEXPIRE` va `EXPIRE` farqi nima? Sinovda kalitning `TTL` i qancha edi?
5. Hash'ning barcha maydonlari muddati tugasa, kalit bilan nima bo'ladi?
6. `listpack` va `hashtable` nima?

<details>
<summary>Javoblar</summary>

1. Maydon-qiymat juftlari yozuvi; har maydon alohida o'qiladi va o'zgartiriladi, butun obyektni qayta yozish shart emas.
2. Yangi qo'shilgan maydonlar soni (mavjudini yangilash hisoblanmaydi).
3. `HKEYS`, `HVALS`, `HGETALL` va muddat bilan bog'liq ko'p buyruqlar.
4. `HEXPIRE` — bitta maydonga, `EXPIRE` — butun kalitga. Sinovda kalit `TTL` — `-1` (muddatsiz).
5. Kalit ham yo'qoladi (sinovda `EXISTS` — `0`).
6. Ichki saqlash ko'rinishlari: `listpack` — kichik hash uchun tejamkor, `hashtable` — oddiy; standart chegara 512 maydon.

</details>

## Rasmiy hujjat

- [RD: Redis hashes](https://redis.io/docs/latest/develop/data-types/hashes/)
- [RD: HSET](https://redis.io/docs/latest/commands/hset/) · [HEXPIRE](https://redis.io/docs/latest/commands/hexpire/) · [HSETEX](https://redis.io/docs/latest/commands/hsetex/) · [OBJECT ENCODING](https://redis.io/docs/latest/commands/object-encoding/)
