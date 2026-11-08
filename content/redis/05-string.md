# 05 — String

[Mundarija](README.md)

## Tushuncha

RD (Redis strings): **string** — Redis'dagi eng oddiy qiymat turi: **baytlar ketma-ketligi** — matn, seriyalangan obyekt, ikkilik ma'lumot (masalan, JPEG). Kalit ham string bo'lgani uchun bu "satrni satrga bog'lash". Ko'pincha **kesh** uchun (HTML bo'laklari, sahifalar), lekin hisoblagich va bit amallari uchun ham.

Bitta string qiymat — ko'pi bilan **512 MB** (RD).

### `SET` va `GET`

`SET` — **almashtirish** (assignment): kalit bo'lsa, eski qiymat — hatto **boshqa turdagi** (list, hash…) bo'lsa ham — almashtiriladi (RD).

`SET` parametrlari (RD, SET):

| Parametr | Nima |
| --- | --- |
| `NX` | Faqat kalit **yo'q** bo'lsa yozish |
| `XX` | Faqat kalit **bor** bo'lsa yozish |
| `IFEQ qiymat` | Faqat joriy qiymat **shunga teng** bo'lsa (Redis 8.4 dan) — "solishtir va almashtir" (compare-and-swap, CAS); kalit yo'q bo'lsa yaratilmaydi |
| `IFNE`, `IFDEQ`, `IFDNE` | Teng **emas** bo'lsa; qiymat o'rniga uning xesh-dayjesti bilan solishtirish (`DIGEST` buyrug'i) |
| `GET` | Eski qiymatni qaytarish (eski qiymat string bo'lmasa — xato) |
| `EX` / `PX` | Muddat soniya / millisekundda |
| `EXAT` / `PXAT` | Muddat tugash vaqti — Unix vaqtida |
| `KEEPTTL` | Mavjud muddatni saqlash |

Shartlar (`NX`, `XX`, `IFEQ`…) bir-birini istisno qiladi; muddat parametrlari ham.

`DELEX k IFEQ qiymat` — "solishtir va o'chir": faqat qiymat mos bo'lsa o'chiradi (RD).

`GETSET` — **eskirgan** (6.2.0 dan; o'rniga `SET … GET`).

### Bir nechta kalit birdan

`MSET k1 v1 k2 v2 …`, `MGET k1 k2 …` — bitta buyruqda ko'p kalit: RD bo'yicha bu **kechikishni kamaytiradi** (bitta borib-kelish). `MGET` massiv qaytaradi; yo'q kalit — `nil`.

### Hisoblagich

`INCR` qiymatni butun son sifatida o'qiydi, birga oshiradi va natijani yozadi; `INCRBY`, `DECR`, `DECRBY` — xuddi shu buyruqning turlari; `INCRBYFLOAT` — kasr son uchun.

**Atomarlik** (RD): ko'p mijoz bir vaqtda bir kalitga `INCR` yuborsa ham **poyga holati** (race condition) bo'lmaydi: "1-mijoz 10 ni o'qidi, 2-mijoz ham 10 ni o'qidi, ikkalasi 11 yozdi" holati hech qachon yuz bermaydi — o'qish-oshirish-yozish boshqa buyruqlar bajarilmayotgan paytda bitta qadamda bo'ladi.

### Tezlik

RD: ko'p string amallari **O(1)**. Lekin `SUBSTR`, `GETRANGE`, `SETRANGE` — O(n) bo'lishi mumkin; katta satrlarda ehtiyot bo'ling. Tuzilgan ma'lumotni seriyalangan satr sifatida saqlash o'rniga — hash (6-bob) yoki JSON (11-bob).

## Ko'rib chiqamiz

VPS'da (Redis 8.10.3; xom rejimda `nil` — bo'sh qator, `od -c` bilan ko'rsatilgan).

### `SET`, `NX`, `XX`

```text vps
$ redis-cli FLUSHALL
OK
$ redis-cli SET bike:1 Deimos; redis-cli GET bike:1
OK
Deimos
$ redis-cli SET bike:1 bike NX | od -c | head -1; redis-cli SET bike:1 bike XX; redis-cli SET yangi:1 x XX | od -c | head -1
0000000  \n
OK
0000000  \n
```

- `SET … NX` — kalit bor edi, yozilmadi (`nil`).
- `SET … XX` — kalit bor, yozildi.
- `SET yangi:1 x XX` — kalit yo'q, yozilmadi.

### `SET` boshqa turni ham almashtiradi

```text vps
$ redis-cli LPUSH ruyxat a; redis-cli GET ruyxat; redis-cli SET ruyxat matn; redis-cli TYPE ruyxat
1
WRONGTYPE Operation against a key holding the wrong kind of value

OK
string
```

`GET` ro'yxatga — `WRONGTYPE` xatosi; `SET` esa ro'yxatni **almashtirdi** — endi tur `string`.

### Solishtir va almashtir (`IFEQ`)

```text vps
$ redis-cli SET bike:1 Deimos; redis-cli SET bike:1 Ares IFEQ Deimos; redis-cli SET bike:1 Zeus IFEQ Deimos | od -c | head -1; redis-cli GET bike:1; redis-cli DELEX bike:1 IFEQ Deimos; redis-cli DELEX bike:1 IFEQ Ares
OK
OK
0000000  \n
Ares
0
1
```

| Buyruq | Natija | Sabab |
| --- | --- | --- |
| `SET bike:1 Ares IFEQ Deimos` | `OK` | Joriy qiymat `Deimos` edi |
| `SET bike:1 Zeus IFEQ Deimos` | `nil` | Endi qiymat `Ares` — yozilmadi |
| `DELEX bike:1 IFEQ Deimos` | `0` | Mos emas — o'chirilmadi |
| `DELEX bike:1 IFEQ Ares` | `1` | O'chirildi |

Bu — ikki mijoz bir qiymatni bir vaqtda o'zgartirganda birining o'zgarishini ikkinchisi bilmasdan ustidan yozib yubormasligi uchun (RD).

### `SET … GET`, `MSET`/`MGET`

```text vps
$ redis-cli SET tashrif 42; redis-cli SET tashrif 0 GET; redis-cli GET tashrif
OK
42
0
$ redis-cli MSET bike:1 "Deimos" bike:2 "Ares" bike:3 "Vanth"; redis-cli MGET bike:1 bike:2 bike:3 bike:9
OK
Deimos
Ares
Vanth
```

`SET tashrif 0 GET` — eski qiymatni (`42`) qaytardi va `0` ni yozdi: hisoblagichni "o'qib, nolga tushirish" bitta buyruqda (RD'dagi `GETSET` misoli). `MGET` da yo'q `bike:9` — bo'sh qator (`nil`).

### Hisoblagichlar

```text vps
$ redis-cli SET total_crashes 0; redis-cli INCR total_crashes; redis-cli INCRBY total_crashes 10; redis-cli DECR total_crashes; redis-cli INCRBYFLOAT narx 2.5; redis-cli INCRBYFLOAT narx 0.1
OK
1
11
10
2.5
2.6
$ redis-cli SET ism Ali; redis-cli INCR ism
OK
ERR value is not an integer or out of range
```

Butun son bo'lmagan qiymatga `INCR` — xato.

### Muddat va `KEEPTTL`

```text vps
$ redis-cli SET kod 123 EX 100; redis-cli SET kod 456 KEEPTTL; redis-cli TTL kod; redis-cli SET kod 789; redis-cli TTL kod
OK
OK
100
OK
-1
```

`KEEPTTL` bilan qiymat almashdi, muddat (100) qoldi; oddiy `SET` — muddat yo'qoldi (4-bob).

### `APPEND`, `STRLEN`, `GETRANGE`

```text vps
$ redis-cli SET xabar Salom; redis-cli APPEND xabar ", dunyo"; redis-cli GET xabar; redis-cli STRLEN xabar; redis-cli GETRANGE xabar 0 4
OK
12
Salom, dunyo
12
Salom
```

### Atomarlik: `INCR` va `GET` + `SET`

10 ta parallel mijoz, har biri 1000 marta `INCR`:

```text vps
$ redis-cli SET sanoq 0 > /dev/null; for i in $(seq 1 10); do redis-cli -r 1000 INCR sanoq > /dev/null & done; wait; redis-cli GET sanoq
10000
```

Natija aniq **10000**.

Endi xuddi shu ishni "o'qib, oshirib, yozish" bilan — 10 ta parallel mijoz, har biri 100 marta `GET`, keyin `SET v+1`:

```text vps
$ redis-cli SET sanoq2 0 > /dev/null; for i in $(seq 1 10); do ( for j in $(seq 1 100); do v=$(redis-cli GET sanoq2); redis-cli SET sanoq2 $((v+1)) > /dev/null; done ) & done; wait; redis-cli GET sanoq2
183
```

1000 o'rniga — **183**. Mijozlar bir xil qiymatni o'qib, bir-birining yozganini ustidan yozdi — RD aytgan poyga holati. Hisoblagich — faqat `INCR` bilan.

### 512 MB chegarasi

```text vps
$ redis-cli CONFIG GET proto-max-bulk-len
proto-max-bulk-len
536870912
```

`proto-max-bulk-len` — bitta satr argumentining maksimal hajmi: 536 870 912 bayt = 512 MB.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Hisoblagichni `GET` + `SET` bilan oshirish | Parallel mijozlarda yangilanishlar yo'qoladi (sinovda 1000 dan 183) | `INCR`/`INCRBY` |
| Mavjud kalitni bilmasdan `SET` qilish | Boshqa turdagi qiymat ham o'chib ketadi | `NX` yoki kalit nomlash sxemasi |
| Kesh qiymatini yangilashda muddatni yo'qotish | `SET` muddatni o'chiradi | `SET … EX` yoki `KEEPTTL` |
| Ko'p kalitni siklda `GET` bilan olish | Har biri alohida borib-kelish | `MGET` |
| Obyektni JSON satr qilib saqlab, bitta maydon uchun hammasini qayta yozish | Ortiqcha trafik va poyga xavfi | Hash yoki JSON turi |
| `GETSET` | Eskirgan | `SET … GET` |
| Boshqa mijoz o'zgartirishini sezmasdan ustidan yozish | Yo'qolgan yangilanish | `SET … IFEQ` (8.4+) yoki tranzaksiya (14-bob) |

## Amaliyot

1. String qanday ma'lumotni saqlay oladi va maksimal hajmi qancha?
2. `SET k v NX` va `SET k v XX` farqi nima?
3. Nega hisoblagich uchun `INCR` kerak, `GET` + `SET` emas? Sinovda nima bo'ldi?
4. `SET … IFEQ` qanday muammoni hal qiladi?
5. Muddatli kalitning qiymatini muddatni saqlab qanday almashtirasiz?
6. Nega `MGET` siklda `GET` dan yaxshiroq?

<details>
<summary>Javoblar</summary>

1. Istalgan baytlar ketma-ketligi (matn, seriyalangan obyekt, ikkilik ma'lumot); 512 MB.
2. `NX` — faqat kalit yo'q bo'lsa yozadi; `XX` — faqat bor bo'lsa.
3. `INCR` atomar; `GET` + `SET` orasida boshqa mijoz yozib ulguradi va yangilanish yo'qoladi. Sinovda 10 000 ta `INCR` — 10000; 1000 ta `GET`+`SET` — 183.
4. Boshqa mijoz o'zgartirgan qiymatni bilmasdan ustidan yozishni (solishtir va almashtir).
5. `SET k yangi KEEPTTL`.
6. Hammasi bitta buyruq — bitta borib-kelish, kechikish kamroq.

</details>

## Rasmiy hujjat

- [RD: Redis strings](https://redis.io/docs/latest/develop/data-types/strings/)
- [RD: SET](https://redis.io/docs/latest/commands/set/) · [DELEX](https://redis.io/docs/latest/commands/delex/) · [INCR](https://redis.io/docs/latest/commands/incr/) · [MGET](https://redis.io/docs/latest/commands/mget/) · [GETSET](https://redis.io/docs/latest/commands/getset/)
