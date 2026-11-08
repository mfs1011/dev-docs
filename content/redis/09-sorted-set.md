# 09 — Sorted set

[Mundarija](README.md)

## Tushuncha

RD (Redis sorted sets): **sorted set** (tartiblangan to'plam) — har a'zosiga **ball** (score) bog'langan, takrorlanmaydigan satrlar to'plami. A'zolar ball bo'yicha **tartiblangan** holda saqlanadi.

RD: uni set va hash aralashmasi deb tasavvur qilish mumkin — set kabi a'zolar takrorlanmaydi, hash kabi har a'zoga qiymat (kasr son — ball) bog'langan.

Tartib qoidasi (RD):

- ballari har xil bo'lsa — balli kattasi katta;
- ballari teng bo'lsa — **leksikografik** (satr bo'yicha) tartib.

Tartib so'ralganda hisoblanmaydi — u tuzilmaning o'zida. RD: sorted set **skip list** va **xesh jadval**dan iborat qo'sh tuzilma; har qo'shish — O(log N), tartiblangan o'qish uchun qo'shimcha ish kerak emas.

Qo'llanishlar (RD): **reyting jadvallari** (o'yindagi eng yuqori ballar, "siz 4932-o'rindasiz"), **suriluvchi oynali** tezlik cheklovchi (20-bob).

### Buyruqlar

| Buyruq | Nima |
| --- | --- |
| `ZADD k ball a [ball b …]` | Qo'shish yoki ballni yangilash (O(log N)); yangi qo'shilganlar sonini qaytaradi |
| `ZADD … NX` / `XX` | Faqat yangi qo'shish / faqat mavjudini yangilash |
| `ZADD … GT` / `LT` | Mavjud a'zo ballini faqat yangisi **katta** / **kichik** bo'lsa yangilash (yangi a'zo qo'shishga to'sqinlik qilmaydi) |
| `ZADD … CH` | Qo'shilgan **va** o'zgargan a'zolar sonini qaytarish |
| `ZINCRBY k n a` | Ballni oshirish; yangi ballni qaytaradi |
| `ZRANGE k boshi oxiri [REV] [WITHSCORES]` | Indeks bo'yicha oraliq (o'sish tartibida; `REV` — kamayish) |
| `ZRANGE k min max BYSCORE` | Ball bo'yicha oraliq; `-inf`, `+inf`; `(10` — 10 kirmaydi |
| `ZRANGE k min max BYLEX` | Ballari teng bo'lganda satr bo'yicha oraliq: `[A` — kiradi, `(A` — kirmaydi, `-`/`+` — cheksiz |
| `ZRANK` / `ZREVRANK k a` | O'rni (0 dan) — o'sish / kamayish tartibida |
| `ZSCORE`, `ZCARD`, `ZREM`, `ZREMRANGEBYSCORE` | Ball, soni, o'chirish, ball oralig'ini o'chirish |

**Tezlik** (RD): ko'p amal — O(log n). `ZRANGE` — O(log n + m), m — qaytarilgan elementlar soni: o'n minglab natija qaytaradigan so'rovdan ehtiyot bo'ling.

**Ichki ko'rinish** (`OBJECT ENCODING`): kichik — `listpack` (7.0 dan), aks holda — `skiplist`.

## Ko'rib chiqamiz

VPS'da (Redis 8.10.3), RD'dagi poygachilar misoli.

### Qo'shish va tartib

```text vps
$ redis-cli FLUSHALL
OK
$ redis-cli ZADD racer_scores 10 "Norem"; redis-cli ZADD racer_scores 12 "Castilla"; redis-cli ZADD racer_scores 8 "Sam-Bodden" 10 "Royce" 6 "Ford" 14 "Prickett"
1
1
4
$ redis-cli ZRANGE racer_scores 0 -1 | tr '\n' ' '; echo; redis-cli ZRANGE racer_scores 0 -1 REV | tr '\n' ' '; echo
Ford Sam-Bodden Norem Royce Castilla Prickett 
Prickett Castilla Royce Norem Sam-Bodden Ford 
$ redis-cli ZRANGE racer_scores 0 -1 WITHSCORES | paste - - | tr '\t' ' '
Ford 6
Sam-Bodden 8
Norem 10
Royce 10
Castilla 12
Prickett 14
```

`Norem` va `Royce` — ikkalasida 10 ball: teng ballda **alifbo tartibi** (N < R).

### Oraliqlar va o'rin

```text vps
$ redis-cli ZRANGE racer_scores -inf 10 BYSCORE | tr '\n' ' '; echo; redis-cli ZRANGE racer_scores '(10' +inf BYSCORE | tr '\n' ' '; echo
Ford Sam-Bodden Norem Royce 
Castilla Prickett 
$ redis-cli ZRANK racer_scores Norem; redis-cli ZREVRANK racer_scores Norem; redis-cli ZSCORE racer_scores Prickett; redis-cli ZCARD racer_scores
2
3
14
6
```

- `-inf 10 BYSCORE` — 10 va kichiklari; `(10 +inf` — 10 dan **katta**lari.
- `ZRANK Norem` — `2` (o'sishda 0 dan sanaganda uchinchi); `ZREVRANK` — `3`.

### O'chirish

```text vps
$ redis-cli ZREM racer_scores Castilla; redis-cli ZREMRANGEBYSCORE racer_scores -inf 9; redis-cli ZRANGE racer_scores 0 -1 WITHSCORES | paste - - | tr '\t' ' '
1
2
Norem 10
Royce 10
Prickett 14
```

`ZREMRANGEBYSCORE … -inf 9` — 9 va kichik ballilar (Ford, Sam-Bodden) o'chdi.

### Reyting jadvali: ballni yangilash

```text vps
$ redis-cli ZADD racer_scores 100 Henshaw; redis-cli ZADD racer_scores 150 Henshaw; redis-cli ZINCRBY racer_scores 50 Henshaw; redis-cli ZINCRBY racer_scores 50 Wood
1
0
200
50
$ redis-cli ZRANGE racer_scores 0 2 REV WITHSCORES | paste - - | tr '\t' ' '
Henshaw 200
Wood 50
Prickett 14
$ redis-cli ZADD racer_scores GT 10 Henshaw; redis-cli ZSCORE racer_scores Henshaw; redis-cli ZADD racer_scores XX CH 5 Wood; redis-cli ZSCORE racer_scores Wood
0
200
1
5
```

| Buyruq | Natija | Ma'nosi |
| --- | --- | --- |
| `ZADD 100 Henshaw` | `1` | Yangi a'zo |
| `ZADD 150 Henshaw` | `0` | Mavjud — ball avvalgisiga qaramay **almashtirildi** |
| `ZINCRBY 50 Henshaw` | `200` | 150 ga **qo'shildi** — yangi ball qaytdi |
| `ZINCRBY 50 Wood` | `50` | Yo'q a'zo — 0 dan boshlab yaratildi |
| `ZRANGE 0 2 REV` | Top-3 | Eng yuqori ballilar |
| `ZADD GT 10 Henshaw` | `0`, ball 200 | 10 < 200 — yangilanmadi ("eng yaxshi natijani saqla") |
| `ZADD XX CH 5 Wood` | `1`, ball 5 | `CH` bilan o'zgargan a'zo sanaldi |

### Satr bo'yicha oraliq

```text vps
$ redis-cli DEL lex > /dev/null; redis-cli ZADD lex 0 Norem 0 Sam-Bodden 0 Royce 0 Castilla 0 Prickett 0 Ford; redis-cli ZRANGE lex '[A' '[L' BYLEX | tr '\n' ' '; echo; redis-cli ZLEXCOUNT lex - +
6
Castilla Ford 
6
```

Hamma ball `0` — a'zolar alifbo tartibida; `[A` dan `[L` gacha — `Castilla`, `Ford`. RD: bu sorted set'ni umumiy **indeks** sifatida ishlatishga imkon beradi.

### Ichki ko'rinish

```text vps
$ redis-cli ZADD kichik 1 a 2 b; redis-cli OBJECT ENCODING kichik; for i in $(seq 1 200); do echo "ZADD katta $i m$i"; done | redis-cli > /dev/null; redis-cli OBJECT ENCODING katta; redis-cli CONFIG GET zset-max-listpack-entries | tail -1
2
listpack
skiplist
128
```

200 a'zoli — `skiplist`; chegara `zset-max-listpack-entries` — 128.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Ballga qo'shish uchun `ZADD` | `ZADD` almashtiradi | `ZINCRBY` |
| "Eng yaxshi natija"ni `ZSCORE` + taqqoslash + `ZADD` bilan | Poyga holati | `ZADD … GT` |
| Reytingni har safar mijozda tartiblash | Tuzilma allaqachon tartiblangan | `ZRANGE … REV` |
| Teng ballilar tartibini tasodifiy deb o'ylash | Leksikografik tartib aniq | Kerak bo'lsa ballga ikkinchi mezon qo'shish |
| Katta oraliqni bir yo'la `ZRANGE 0 -1` | O(log n + m) | Sahifalab (`LIMIT` yoki indeks oraliqlari) |
| `ZRANK` ni 1 dan boshlanadi deb o'ylash | 0 dan | Ko'rsatishda +1 |

## Amaliyot

1. Sorted set set'dan va hash'dan nimasi bilan farq qiladi?
2. Ballari teng a'zolar qanday tartiblanadi?
3. `ZADD` va `ZINCRBY` farqi nima?
4. Top-10 o'yinchini qanday olasiz? O'yinchining o'rnini-chi?
5. `ZADD … GT` nima uchun kerak?
6. `ZRANGE k (10 +inf BYSCORE` nimani qaytaradi?

<details>
<summary>Javoblar</summary>

1. Set'dan — har a'zoga ball bog'langan va tartiblangan; hash'dan — a'zolar takrorlanmaydi, qiymat faqat ball.
2. Leksikografik (satr bo'yicha).
3. `ZADD` ballni almashtiradi; `ZINCRBY` mavjud ballga qo'shadi va yangi ballni qaytaradi.
4. `ZRANGE k 0 9 REV WITHSCORES`; o'rni — `ZREVRANK k o'yinchi` (+1).
5. Ballni faqat yangisi katta bo'lsa yangilash — eng yaxshi natijani bitta atomar buyruqda saqlash.
6. Bali 10 dan katta a'zolarni (10 kirmaydi).

</details>

## Rasmiy hujjat

- [RD: Redis sorted sets](https://redis.io/docs/latest/develop/data-types/sorted-sets/)
- [RD: ZADD](https://redis.io/docs/latest/commands/zadd/) · [ZRANGE](https://redis.io/docs/latest/commands/zrange/) · [ZINCRBY](https://redis.io/docs/latest/commands/zincrby/) · [ZRANK](https://redis.io/docs/latest/commands/zrank/)
