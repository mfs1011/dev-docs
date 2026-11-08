# 01 — Redis nima

[Mundarija](README.md)

## Tushuncha

RD (Redis as an in-memory data structure store): **Redis** — "Remote Dictionary Server" (masofaviy lug'at serveri). U ma'lumotni **xotirada** (in-memory) saqlaydigan **ma'lumot tuzilmalari serveri**: dasturlash tilingizdagi turlar — satr, lug'at, ro'yxat, to'plam — Redis'da **serverda** turadi va ularga tarmoq orqali buyruq bilan murojaat qilinadi.

Har bir element **kalit** (key) ostida saqlanadi; barcha kalitlar — Redis'ning **kalitlar fazosi** (keyspace).

```text
kalit         tur        qiymat
bike:1    →   string  →  "Process 134"
bike:2    →   hash    →  { model: Deimos, brand: Ergonom, … }
navbat    →   list    →  [ ish-1, ish-2, ish-3 ]
```

Kalit-qiymat ombori: qiymatni olish uchun kalitni bilish kerak. SQL'dagi kabi jadval, ustun va ixtiyoriy so'rovlar yo'q — buning o'rniga har turning o'z buyruqlari bor.

### Ma'lumot turlari

RD (Understand Redis data types): Redis Open Source quyidagi turlarni beradi; kitobning II qismida asosiylari alohida boblarda:

| Tur | Nima (RD) | Bob |
| --- | --- | --- |
| **String** | Eng oddiy tur — baytlar ketma-ketligi: matn, seriyalangan obyekt, hisoblagich | 5 |
| **Hash** | Maydon-qiymat juftlari to'plami — obyekt yozuvi (Python'dagi `dict`, Java'dagi `HashMap` ga o'xshash) | 6 |
| **List** | Qo'shilish tartibida saqlanadigan satrlar ro'yxati | 7 |
| **Set** | Tartibsiz, **takrorlanmaydigan** satrlar to'plami; qo'shish, o'chirish va borligini tekshirish O(1) — element soniga bog'liq emas | 8 |
| **Sorted set** | Takrorlanmaydigan satrlar, har biri **ball** (score) bo'yicha tartiblangan | 9 |
| **Stream** | Faqat oxiriga yoziladigan jurnal (append-only log): hodisalarni sodir bo'lish tartibida yozib, ishlovchilarga tarqatadi | 10 |
| **JSON** | Ichma-ich obyekt va massivlar | 11 |
| Bitmap, bitfield | String ustida bitlar bilan ishlash | — |
| Geospatial | Joylashuv bo'yicha qidirish (radius, to'rtburchak) | — |
| Ehtimoliy turlar | Taxminiy, lekin juda tejamkor statistika | — |
| Time series, vector sets | Vaqt belgili qiymatlar; vektorlar bo'yicha o'xshashlik qidiruvi | — |

Qaysi turni tanlash — 12-bob (RD: Compare data types).

### Qayerda ishlatiladi

RD (Use cases) amaliy naqshlari — kitobning IV qismi shularga tayanadi:

| Naqsh | Qisqacha (RD) | Bob |
| --- | --- | --- |
| **Cache-aside** | Bazadan o'qilgan ma'lumotni muddat (TTL) bilan keshlash | 17 |
| **Oldindan yuklangan kesh** (prefetch cache) | Ma'lumot oldindan yuklanadi, har o'qish keshdan | 18 |
| **Sessiyalar** | Veb-sessiyalarni muddat bilan saqlash | 19 |
| **Rate limiting** | So'rovlar tezligini cheklash (token bucket) | 20 |
| **Fon ishlari navbati** (job queue) | Kamida bir marta yetkazish va muddat o'tgan ishni qaytarib olish | 21 |
| **Pub/Sub** | Real vaqt hodisalarini ko'p obunachiga tarqatish | 22 |
| **Streaming** | Tartibli hodisalar oqimi, consumer group'lar, qayta o'qish | 23 |
| **Reyting jadvali** (leaderboard) | Sorted set bilan tartiblangan reyting | 24 |

Hujjatda yana: vaqt qatorlari paneli, tavsiya tizimi, sun'iy intellekt uchun kesh va xotira — bu kitob doirasidan tashqari (README).

## Ko'rib chiqamiz

RD'ning "data store" qo'llanmasidagi misollar — VPS'dagi Redis 8.10.3 da (o'rnatish — 2-bob; `redis-cli` — 3-bob):

```text vps
$ redis-cli SET bike:1 "Process 134"
OK
$ redis-cli GET bike:1
Process 134
$ redis-cli HSET bike:2 model Deimos brand Ergonom type 'Enduro bikes' price 4972
4
$ redis-cli HGET bike:2 model
Deimos
$ redis-cli HGETALL bike:2
model
Deimos
brand
Ergonom
type
Enduro bikes
price
4972
$ redis-cli SCAN 0 MATCH "bike:*" COUNT 100
0
bike:2
bike:1
$ redis-cli TYPE bike:1; redis-cli TYPE bike:2
string
hash
```

- `SET`/`GET` — string: kalit `bike:1`, qiymat — matn.
- `HSET` — hash'ga to'rt maydon yozdi (`4` — qo'shilgan maydonlar soni); `HGET` — bitta maydon, `HGETALL` — hammasi (maydon va qiymat navbatma-navbat).
- `SCAN 0 MATCH "bike:*" COUNT 100` — `bike:` bilan boshlanadigan kalitlarni ko'rib chiqish. Birinchi qator — keyingi **kursor**: `0` — ko'rib chiqish tugadi (RD; 4-bob).
- `TYPE` — kalit ostidagi qiymat turi.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Redis'ni asosiy va yagona baza deb boshlash | Ma'lumot xotirada; diskka saqlash sozlamaga bog'liq (28-bob) | Avval vazifani aniqlash: kesh, sessiya, navbat… |
| Hamma narsani string'da JSON matn sifatida saqlash | Bitta maydonni o'zgartirish uchun butun qiymatni o'qib-yozish kerak | Mos tur: hash, JSON (6, 11, 12-boblar) |
| Redis'dan SQL kabi so'rov kutish | Kalit-qiymat: qiymat kalit orqali olinadi | Kalitlarni rejalab nomlash (4-bob), kerakli tuzilma |
| Production'da hamma kalitni `KEYS *` bilan ko'rish | Serverni bloklaydi (4-bob) | `SCAN` |

## Amaliyot

1. "Redis" so'zi nimani anglatadi va u qanday ombor?
2. String, hash va list farqi nima?
3. Set va sorted set farqi?
4. Qaysi naqshlar uchun Redis ishlatiladi? Uchtasini ayting.
5. `SCAN` javobidagi birinchi qator (`0`) nima?

<details>
<summary>Javoblar</summary>

1. Remote Dictionary Server. Ma'lumotni xotirada saqlaydigan kalit-qiymat ko'rinishidagi ma'lumot tuzilmalari serveri.
2. String — baytlar ketma-ketligi (bitta qiymat); hash — maydon-qiymat juftlari (obyekt); list — qo'shilish tartibidagi satrlar ro'yxati.
3. Ikkalasida ham qiymatlar takrorlanmaydi; set tartibsiz, sorted set har elementning bali bo'yicha tartiblangan.
4. Masalan: kesh (cache-aside), sessiyalar, rate limiting, fon ishlari navbati, pub/sub, reyting jadvali.
5. Keyingi kursor; `0` — ko'rib chiqish tugadi.

</details>

## Rasmiy hujjat

- [RD: Redis as an in-memory data structure store](https://redis.io/docs/latest/develop/get-started/data-store/)
- [RD: Understand Redis data types](https://redis.io/docs/latest/develop/data-types/)
- [RD: Use cases](https://redis.io/docs/latest/develop/use-cases/)
