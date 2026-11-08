# 08 — Set

[Mundarija](README.md)

## Tushuncha

RD (Redis sets): **set** — **takrorlanmaydigan** satrlarning (a'zolar, members) **tartibsiz** to'plami. Qo'llanishi (RD):

- **noyob** narsalarni hisobga olish — masalan, blog postini ochgan barcha noyob IP manzillar;
- **munosabatlar** — masalan, ma'lum rolga ega barcha foydalanuvchilar;
- to'plam amallari — **kesishma**, **birlashma**, **ayirma**.

Tartib **kafolatlanmaydi**: Redis elementlarni har chaqiruvda istalgan tartibda qaytarishi mumkin (RD). Tartib kerak bo'lsa — sorted set (9-bob).

### Buyruqlar

| Buyruq | Nima |
| --- | --- |
| `SADD k a …` | Qo'shish; **yangi** qo'shilganlar sonini qaytaradi — mavjud a'zo e'tiborsiz qoldiriladi |
| `SREM k a …` | O'chirish |
| `SISMEMBER k a` / `SMISMEMBER k a b …` | A'zomi (`1`/`0`) — bitta yoki bir nechta |
| `SCARD k` | A'zolar soni |
| `SMEMBERS k` | Hamma a'zo — **O(n)** |
| `SINTER`, `SUNION`, `SDIFF` | Kesishma, birlashma, ayirma (ayirmada to'plamlar **tartibi muhim**) |
| `SINTERSTORE`, `SUNIONSTORE`, `SDIFFSTORE` | Natijani yangi kalitga yozish |
| `SRANDMEMBER k` / `SPOP k` | Tasodifiy a'zo — olib tashlamasdan / olib tashlab |
| `SSCAN k kursor` | A'zolarni bo'lib-bo'lib ko'rib chiqish (4-bobdagi `SCAN` kabi) |

**Tezlik** (RD): qo'shish, o'chirish, a'zolikni tekshirish — **O(1)**. Yuz minglab a'zoli to'plamda `SMEMBERS` dan ehtiyot bo'ling: O(n) va butun to'plamni bitta javobda qaytaradi — o'rniga `SSCAN`.

Maksimal hajm — 2^32 − 1 a'zo. **Muqobillar** (RD): juda katta to'plamda a'zolikni tekshirish ko'p xotira oladi — aniqlik shart bo'lmasa, Bloom yoki Cuckoo filtri; to'plamni indeks sifatida ishlatsangiz va ma'lumotni qidirish kerak bo'lsa — JSON va Redis Search.

**Ichki ko'rinish** (`OBJECT ENCODING`): faqat butun sonlardan iborat kichik to'plam — `intset`; boshqa kichik to'plam — `listpack` (7.2 dan); aks holda — `hashtable`.

## Ko'rib chiqamiz

VPS'da (Redis 8.10.3), RD'dagi poyga misoli: Fransiya, AQSh va Italiya poygalaridagi velosipedlar.

### Qo'shish va a'zolik

```text vps
$ redis-cli FLUSHALL
OK
$ redis-cli SADD bikes:racing:france bike:1; redis-cli SADD bikes:racing:france bike:1; redis-cli SADD bikes:racing:france bike:2 bike:3; redis-cli SADD bikes:racing:usa bike:1 bike:4
1
0
2
2
$ redis-cli SISMEMBER bikes:racing:usa bike:1; redis-cli SISMEMBER bikes:racing:usa bike:2; redis-cli SMISMEMBER bikes:racing:france bike:2 bike:3 bike:4
1
0
1
1
0
```

- Ikkinchi `SADD … bike:1` — `0`: allaqachon bor, e'tiborsiz qoldirildi.
- `SMISMEMBER` — har biri uchun `1`/`0`.

### Kesishma, birlashma, ayirma

```text vps
$ redis-cli SINTER bikes:racing:france bikes:racing:usa; redis-cli SCARD bikes:racing:france
bike:1
3
$ redis-cli SADD bikes:racing:italy bike:1 bike:2 bike:3 bike:4; redis-cli SUNION bikes:racing:france bikes:racing:usa bikes:racing:italy | sort | tr '\n' ' '; echo
4
bike:1 bike:2 bike:3 bike:4 
$ redis-cli SDIFF bikes:racing:france bikes:racing:usa; redis-cli SDIFF bikes:racing:usa bikes:racing:france; redis-cli SDIFF bikes:racing:france bikes:racing:usa bikes:racing:italy | od -c | head -1
bike:2
bike:3
bike:4
0000000  \n
$ redis-cli SINTERSTORE ikkalasida bikes:racing:france bikes:racing:usa; redis-cli SMEMBERS ikkalasida
1
bike:1
```

| Buyruq | Natija | Ma'nosi |
| --- | --- | --- |
| `SINTER france usa` | `bike:1` | Ikkala poygada |
| `SUNION france usa italy` | 4 ta | Hech bo'lmaganda bittasida (`sort` bilan tartiblandi — set o'zi tartib bermaydi) |
| `SDIFF france usa` | `bike:2`, `bike:3` | Fransiyada bor, AQSh'da yo'q |
| `SDIFF usa france` | `bike:4` | Tartib o'zgardi — natija boshqa |
| `SDIFF france usa italy` | bo'sh | Hammasi Italiyada ham bor |
| `SINTERSTORE` | `1` | Natija yangi kalitda saqlandi |

### O'chirish va tasodifiy a'zo

```text vps
$ redis-cli SREM bikes:racing:france bike:1; redis-cli SCARD bikes:racing:france; redis-cli SRANDMEMBER bikes:racing:italy > /dev/null && echo "SRANDMEMBER: bitta tasodifiy element"; redis-cli SCARD bikes:racing:italy; redis-cli SPOP bikes:racing:italy > /dev/null; redis-cli SCARD bikes:racing:italy
1
2
SRANDMEMBER: bitta tasodifiy element
4
3
```

`SRANDMEMBER` — a'zolar soni o'zgarmadi (4); `SPOP` — bittasi olib tashlandi (3).

### Noyob qiymatlarni sanash

```text vps
$ for ip in 10.0.0.1 10.0.0.2 10.0.0.1 10.0.0.3 10.0.0.2 10.0.0.1; do redis-cli SADD post:42:ip $ip > /dev/null; done; redis-cli SCARD post:42:ip
3
```

6 ta tashrif, 3 ta **noyob** IP — takrorlar avtomatik tashlandi.

### Ichki ko'rinish

```text vps
$ redis-cli SADD sonlar 3 1 2; redis-cli OBJECT ENCODING sonlar; redis-cli SADD sozlar olma nok; redis-cli OBJECT ENCODING sozlar
3
intset
2
listpack
```

### Katta to'plam: `SMEMBERS` va `SSCAN`

300 000 a'zo:

```text vps
$ redis-cli DEL katta > /dev/null; seq 1 300000 | awk 'BEGIN{printf ""} {printf "*3\r\n$4\r\nSADD\r\n$5\r\nkatta\r\n$%d\r\n%d\r\n", length($1), $1}' | redis-cli --pipe | tail -1; redis-cli SCARD katta
errors: 0, replies: 300000
300000
$ TIMEFORMAT='SMEMBERS (300 ming): %R s'; time redis-cli SMEMBERS katta > /dev/null; TIMEFORMAT='SISMEMBER: %R s'; time redis-cli SISMEMBER katta 150000
SMEMBERS (300 ming): 0.232 s
1
SISMEMBER: 0.007 s
$ c=0; n=0; t=0; while :; do r=$(redis-cli SSCAN katta $c COUNT 1000); c=$(echo "$r" | head -1); t=$((t+$(echo "$r" | tail -n +2 | grep -c .))); n=$((n+1)); [ "$c" = 0 ] && break; done; echo "SSCAN chaqiruvlari: $n, jami: $t"
SSCAN chaqiruvlari: 300, jami: 300000
```

- `SMEMBERS` — butun to'plam bitta javobda: 0,23 soniya (server shu vaqt davomida boshqa ishni qilmaydi).
- `SISMEMBER` — 7 ms (bu vaqtning asosiy qismi — `redis-cli` ni ishga tushirish; buyruqning o'zi O(1)).
- `SSCAN … COUNT 1000` — 300 kichik qadam bilan barcha 300 000 a'zo; har qadam qisqa.

## Variantlar

| Vazifa | Set | Muqobil |
| --- | --- | --- |
| Noyob tashrifchilar soni | `SADD` + `SCARD` — aniq | Ehtimoliy turlar (HyperLogLog, Bloom) — juda kam xotira, taxminiy |
| "Kim qaysi guruhda" | Har guruhga set | — |
| Reyting, tartib | — | Sorted set (9-bob) |
| Kalitlar indeksi (`KEYS` o'rniga) | Kerakli kalitlarni set'da saqlash (4-bob) | — |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Set'dan tartib kutish | Tartib kafolatlanmaydi (RD) | Sorted set yoki natijani mijozda tartiblash |
| Katta set'ga `SMEMBERS` | O(n), bitta katta javob (sinovda 0,23 s) | `SSCAN` |
| Noyoblikni ro'yxatda tekshirish (`LRANGE` + qidirish) | O(n) | `SADD` + `SISMEMBER` — O(1) |
| `SDIFF` da to'plamlar tartibini e'tiborsiz qoldirish | Ayirma kommutativ emas | Birinchi — "nimadan ayiramiz" |
| Juda katta to'plamda aniq a'zolik, xotira cheklangan | Ko'p xotira | Bloom/Cuckoo filtri (aniqlik shart bo'lmasa) |

## Amaliyot

1. Set ro'yxatdan qanday farq qiladi?
2. `SADD` qaytargan son nimani bildiradi?
3. `SDIFF a b` va `SDIFF b a` bir xilmi?
4. Blog postining noyob tashrifchilarini qanday sanaysiz?
5. Nega katta to'plamda `SMEMBERS` o'rniga `SSCAN`?
6. `intset` qachon ishlatiladi?

<details>
<summary>Javoblar</summary>

1. Set — takrorsiz va tartibsiz; ro'yxat — takrorlar bo'lishi mumkin va qo'shilish tartibi saqlanadi.
2. Yangi qo'shilgan a'zolar soni (mavjudlari hisoblanmaydi).
3. Yo'q — ayirma kommutativ emas (sinovda `bike:2, bike:3` va `bike:4`).
4. Har tashrifda `SADD post:42:ip <ip>`, soni — `SCARD`.
5. `SMEMBERS` O(n) va butun to'plamni bitta javobda qaytaradi, serverni band qiladi; `SSCAN` — kichik qadamlar.
6. Kichik to'plam faqat butun sonlardan iborat bo'lganda.

</details>

## Rasmiy hujjat

- [RD: Redis sets](https://redis.io/docs/latest/develop/data-types/sets/)
- [RD: SADD](https://redis.io/docs/latest/commands/sadd/) · [SINTER](https://redis.io/docs/latest/commands/sinter/) · [SDIFF](https://redis.io/docs/latest/commands/sdiff/) · [SSCAN](https://redis.io/docs/latest/commands/sscan/) · [OBJECT ENCODING](https://redis.io/docs/latest/commands/object-encoding/)
