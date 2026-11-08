# 12 — Qaysi turni tanlash

[Mundarija](README.md)

## Tushuncha

RD (Compare data types): umumiy turlarning imkoniyatlari bir-biriga qisman o'xshaydi — "ozgina ijodkorlik bilan istalganini string bilan ham taqlid qilish mumkin". Lekin har turda **tezlik, xotira va imkoniyat** muvozanati boshqacha. Quyidagi tavsiyalar — qat'iy qoida emas, "tajribaviy qoidalar" (rules of thumb) (RD).

### Turlar

| Tur | Tuzilma | Nima uchun (RD) | Bob |
| --- | --- | --- | --- |
| String | Matn, ikkilik ma'lumot, son, bitlar | Tuzilmasiz hujjat, hisoblagich, bayroq, bitmap | 5 |
| Hash | Maydon → qiymat | Kam maydonli oddiy obyekt; maydon muddati | 6 |
| JSON | Ichma-ich obyekt va massivlar | Ko'p maydonli murakkab obyekt | 11 |
| List | Satrlar ketma-ketligi | Navbat, stek, jurnal | 7 |
| Set | Noyob satrlar | Qo'shimcha ma'lumotsiz noyob elementlar | 8 |
| Sorted set | Noyob satrlar + ball | Tartiblangan to'plam, ustuvorlik navbati | 9 |
| Stream | Maydon-qiymatli yozuvlar ketma-ketligi | Jurnal, vaqt qatori, guruh bo'lib o'qish | 10 |

Maxsus turlar (RD): **geo** (koordinatali satrlar, yaqin nuqtalarni topish), **ehtimoliy turlar** (katta to'plamlar uchun taxminiy hisob), **vaqt qatorlari** (time series), **vektor to'plamlari** (vector sets — o'xshashlik qidiruvi). Yangi **Array** turi (indeks bo'yicha murojaat, siyrak indekslar, server tomonida yig'ma hisob) — RD bo'yicha **sinov bosqichida** (preview), o'zgarishi mumkin; bu qo'llanmada yoritilmaydi.

### Hujjat (obyekt): string, hash yoki JSON

RD: xotira va hisoblash talabi — JSON eng ko'p, keyin hash, keyin string. Qaror daraxti (RD):

1. Ichma-ich tuzilma yoki Redis Search bilan geo-qidiruv kerakmi? → **JSON**.
2. Redis Search bilan indekslash kerak, ichma-ichlik shart emasmi? → **Hash** (JSON'dan kam xotira, maydonga tezroq murojaat).
3. Hujjat ichidagi alohida qismlarga **muddat** kerakmi? → **Hash** (faqat hash maydon muddatini qo'llaydi).
4. Alohida maydonlarga tez-tez murojaat kerak, lekin ular butun indeksli oddiy son yoki bitlarmi? → **String** (bit maydonlari — ixchamroq).
5. Satr yoki ikkilik qiymatli maydonlarga tez-tez murojaat kerakmi? → **Hash**; aks holda → **String**.

### To'plam: sorted set, set, hash yoki bitmap

RD: xotira talabi — sorted set eng ko'p, keyin set, keyin string.

1. Elementlarni ixtiyoriy yoki alifbo tartibida saqlash/olish kerakmi? → **Sorted set**.
2. Har element uchun qo'shimcha ma'lumot kerak va to'plam amallari (kesishma, birlashma, ayirma) kerak emasmi? → **Hash**.
3. Elementlar — ma'lum oraliqdagi oddiy butun sonlarmi? → **String (bitmap)**: eng kam xotira, bit amallari to'plam amallariga teng.
4. Aks holda → **Set**.

Set yoki sorted set elementlari uchun qo'shimcha ma'lumot kerak bo'lsa — maydon nomlari elementlarga mos keluvchi yordamchi hash yoki JSON (RD).

### Ketma-ketlik: sorted set, list yoki stream

1. Ixtiyoriy ustuvorlik yoki alifbo tartibi, to'plam amallari kerakmi? → **Sorted set**.
2. (Array — sinov bosqichida, yuqoriga qarang.)
3. Asosan vaqt tartibida saqlash yoki bir nechta o'quvchini boshqarish kerakmi? → **Stream** (iste'molchilar guruhlari, "kamida bir marta" yetkazish).
4. Aks holda → **List**.

### Geo

RD: koordinatalarni saqlash va radius yoki to'rtburchak ichidagi yaqin nuqtalarni topish. `GEOADD k uzunlik kenglik nom` (avval **uzunlik** — longitude), `GEOSEARCH k FROMLONLAT … BYRADIUS r km [WITHDIST] [ASC]`, `GEODIST`. RD ogohlantiradi: bu tur Redis Search'dagi geo imkoniyatlari bilan bir xil emas — oddiyroq holatlar uchun.

### HyperLogLog

RD: to'plamning **noyob elementlar sonini** (kardinallik) **taxminan** hisoblaydi. Redis'dagi amalga oshirilishi — ko'pi bilan **12 KB** xotira, standart xato **0,81%**. Element o'zi saqlanmaydi — faqat holat; shuning uchun hajm elementlar soniga bog'liq emas.

- `PFADD k element …` — hisobga qo'shish; `PFCOUNT k` — taxminiy son; `PFMERGE yangi k1 k2` — birlashtirish.
- Ichida — oddiy string (`GET`/`SET` bilan ko'chirish mumkin).
- Qo'llanish: kunlik noyob qidiruvlar, sahifaning noyob tashrifchilari; har sahifa/davr uchun bitta HLL.
- RD eslatmasi: IP manzil yoki boshqa shaxsiy identifikatorni saqlash ba'zi mamlakatlarda qonunga zid.
- `PFADD` va `PFCOUNT` — o'zgarmas vaqt va xotira.

### Bloom filtri

RD: element to'plamda **bormi** — juda kam, qat'iy o'lchamli xotirada tekshirish. Elementlar o'zi emas, ularning xeshlari saqlanadi:

- "**yo'q**" javobi — **aniq**;
- "**bor**" javobi — **taxminiy**: N tadan biri noto'g'ri (false positive).

`BF.RESERVE k xato_ulushi sig'im [EXPANSION n] [NONSCALING]`:

- `xato_ulushi` — masalan, 0,1% uchun `0.001`;
- `sig'im` — kutilgan elementlar soni (ortiqcha — xotira isrofi, kam — xato ko'payadi);
- sig'im to'lsa — filtr yangi qism-filtr qo'shib kengayadi; `NONSCALING` — kengaymaydi (bitta xesh funksiya kam), to'lganda xato ulushi o'sadi.

Xotira (RD): 1% xato — har element uchun ~9,6 bit; 0,1% — ~14,4 bit; 0,01% — ~19,2 bit. Set'da esa har element ~`192 bit + qiymat` (IP manzil uchun ~320 bit).

`BF.ADD` javobi (RD): `1` — qo'shildi, `0` — element **ehtimol allaqachon bor**.

Qo'llanishlar (RD): foydalanuvchi nomi band-bandmasligini tez tekshirish ("yo'q" bo'lsa — darhol yaratish, "bor" bo'lsa — asosiy bazadan tekshirish), reklama ko'rsatilganmi, firibgarlikni aniqlash.

### Bitmap

String bit amallari (RD — Compare data types): `SETBIT k n 1`, `GETBIT k n`, `BITCOUNT k`. Masalan, n-raqamli foydalanuvchi bugun onlayn bo'lganmi.

## Ko'rib chiqamiz

VPS'da (Redis 8.10.3).

### Geo

```text vps
$ redis-cli FLUSHALL
OK
$ redis-cli GEOADD bikes:rentable -122.27652 37.805186 station:1; redis-cli GEOADD bikes:rentable -122.2674626 37.8062344 station:2; redis-cli GEOADD bikes:rentable -122.2469854 37.8104049 station:3
1
1
1
$ redis-cli GEOSEARCH bikes:rentable FROMLONLAT -122.2612767 37.7936847 BYRADIUS 5 km WITHDIST | paste - -; redis-cli GEOSEARCH bikes:rentable FROMLONLAT -122.2612767 37.7936847 BYRADIUS 2 km ASC; redis-cli GEODIST bikes:rentable station:1 station:3 km; redis-cli TYPE bikes:rentable
station:1	1.8523
station:2	1.4979
station:3	2.2441
station:2
station:1
2.6597
zset
```

- 5 km ichida — uchala stansiya, masofasi bilan; 2 km ichida, yaqinidan boshlab — `station:2`, `station:1`.
- `TYPE` — `zset` (kuzatildi: geo ma'lumot sorted set ichida saqlanadi).

### HyperLogLog

```text vps
$ redis-cli PFADD bikes Hyperion Deimos Phoebe Quaoar; redis-cli PFCOUNT bikes; redis-cli PFADD commuter_bikes Salacia Mimas Quaoar; redis-cli PFMERGE all_bikes bikes commuter_bikes; redis-cli PFCOUNT all_bikes; redis-cli TYPE all_bikes
1
4
1
OK
6
string
```

`Quaoar` ikkala HLL'da — birlashmada 6 ta noyob (7 emas).

Million noyob element — HLL va set:

```text vps
$ seq 1 1000000 | awk '{printf "*3\r\n$5\r\nPFADD\r\n$3\r\nhll\r\n$%d\r\n%d\r\n", length($1), $1}' | redis-cli --pipe | tail -1; seq 1 1000000 | awk '{v="ip:" $1; printf "*3\r\n$4\r\nSADD\r\n$3\r\nset\r\n$%d\r\n%s\r\n", length(v), v}' | redis-cli --pipe | tail -1
errors: 0, replies: 1000000
errors: 0, replies: 1000000
$ redis-cli PFCOUNT hll; redis-cli SCARD set; echo "HLL xotirasi: $(redis-cli MEMORY USAGE hll) bayt"; echo "Set xotirasi: $(redis-cli MEMORY USAGE set SAMPLES 0) bayt"
1009972
1000000
HLL xotirasi: 14358 bayt
Set xotirasi: 35277582 bayt
```

| | Son | Xotira |
| --- | --- | --- |
| HLL | 1 009 972 (xato ~1,0%) | 14 358 bayt (~14 KB) |
| Set | 1 000 000 (aniq) | 35 277 582 bayt (~34 MB) |

HLL ~2500 marta kam xotira oldi, lekin son taxminiy. (`MEMORY USAGE` kalit nomi va ichki sarfni ham hisoblaydi — shuning uchun 12 KB dan biroz ko'p.)

### Bloom filtri

```text vps
$ redis-cli BF.RESERVE bikes:models 0.001 1000000; redis-cli BF.ADD bikes:models "Smoky Mountain Striker"; redis-cli BF.EXISTS bikes:models "Smoky Mountain Striker"; redis-cli BF.MADD bikes:models "Rocky Mountain Racer" "Cloudy City Cruiser" "Windy City Wippet" | tr '\n' ' '; echo; redis-cli BF.EXISTS bikes:models "Mountain Racer"; redis-cli TYPE bikes:models
OK
1
1
1 1 1 
0
MBbloom--
```

Qo'shilmagan `"Mountain Racer"` — `0`: aniq yo'q. Kalit turi — `MBbloom--`.

Xato ulushini o'lchaymiz: 1% xato, 10 000 sig'imli filtrga 10 000 nom qo'shib, 100 000 ta **qo'shilmagan** nomni tekshiramiz:

```text vps
$ redis-cli BF.RESERVE nomlar 0.01 10000 NONSCALING; seq 1 10000 | awk '{print "BF.ADD nomlar user" $1}' | redis-cli | grep -c 1; seq 10001 110000 | awk '{print "BF.EXISTS nomlar user" $1}' | redis-cli | grep -c '^1$' | awk '{printf "100000 ta qo%sshilmagan nomdan \"bor\" deyilgani: %d (%.2f%%)\n", "\047", $1, $1/1000}'
OK
9986
100000 ta qo'shilmagan nomdan "bor" deyilgani: 1038 (1.04%)
$ echo "Bloom (10000, 1%): $(redis-cli MEMORY USAGE nomlar) bayt"; seq 1 10000 | awk '{print "SADD nomlarset user" $1}' | redis-cli > /dev/null; echo "Set (10000): $(redis-cli MEMORY USAGE nomlarset SAMPLES 0) bayt"
Bloom (10000, 1%): 12112 bayt
Set (10000): 455586 bayt
```

- 10 000 ta `BF.ADD` dan 9986 tasi `1`: 14 tasida filtr "ehtimol allaqachon bor" dedi — qo'shish paytidagi false positive.
- Qo'shilmagan 100 000 nomdan 1038 tasiga "bor" deyildi — **1,04%**, berilgan 1% ga yaqin.
- Xotira: Bloom 12 112 bayt, xuddi shu 10 000 nomli set — 455 586 bayt (~37 marta ko'p).

### Bitmap

```text vps
$ redis-cli SETBIT onlayn:2026-11-08 5 1 > /dev/null; redis-cli SETBIT onlayn:2026-11-08 1000 1 > /dev/null; redis-cli GETBIT onlayn:2026-11-08 5; redis-cli GETBIT onlayn:2026-11-08 6; redis-cli BITCOUNT onlayn:2026-11-08; redis-cli STRLEN onlayn:2026-11-08
1
0
2
126
```

5- va 1000-foydalanuvchi onlayn: `BITCOUNT` — 2. Satr uzunligi — 126 bayt (1001 bit uchun) — kuzatildi: eng katta bit raqamigacha joy ajratildi.

### Array

```text vps
$ redis-cli COMMAND INFO ARINSERT | head -1 | od -c | head -1
0000000   a   r   i   n   s   e   r   t  \n
```

`ARINSERT` buyrug'i Redis 8.10.3 da bor; RD bo'yicha tur hali sinov bosqichida.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Hamma narsani string'da JSON matn qilib saqlash | Qism yangilash qimmat, poyga | Hash yoki JSON |
| Tekis obyekt uchun JSON | Hash'dan ko'p xotira va hisoblash (RD) | Hash |
| Million noyob tashrifni aniq kerak bo'lmasa ham set'da sanash | Sinovda ~34 MB | HyperLogLog (~14 KB, ~1% xato) |
| Bloom "bor" javobini aniq deb ishlatish | False positive (sinovda 1,04%) | "Bor" bo'lsa — asosiy manbadan tekshirish |
| Bloom sig'imini kam belgilab `NONSCALING` | To'lganda xato o'sadi yoki xato javob qaytadi | To'g'ri sig'im yoki kengayuvchi filtr |
| `GEOADD` da kenglikni birinchi yozish | Avval uzunlik (longitude) | `GEOADD k uzunlik kenglik nom` |
| Siyrak katta bit raqamlari bilan bitmap | Eng katta raqamgacha joy ajratiladi | Siyrak bo'lsa — set |
| HLL ga shaxsiy ma'lumot (IP) yozishni bemalol deb o'ylash | Ba'zi mamlakatlarda qonunga zid (RD) | Mahalliy qonunni tekshirish |

## Amaliyot

1. Ichma-ich obyekt uchun qaysi tur? Maydon muddati kerak bo'lsa-chi?
2. Elementlarga tartib kerak bo'lgan to'plam uchun qaysi tur?
3. Bir necha xizmat bir hodisalar ketma-ketligini o'qishi kerak — qaysi tur?
4. HyperLogLog qancha xotira oladi va qanday xato bilan? Sinovda qancha chiqdi?
5. Bloom filtrining "yo'q" va "bor" javoblari qanchalik ishonchli?
6. Geo ma'lumot Redis ichida qaysi turda saqlanadi (sinov bo'yicha)?

<details>
<summary>Javoblar</summary>

1. JSON; maydon muddati kerak bo'lsa — hash.
2. Sorted set.
3. Stream (har xizmatga alohida iste'molchilar guruhi).
4. Ko'pi bilan 12 KB, standart xato 0,81%; sinovda million element uchun ~14 KB, xato ~1,0%.
5. "Yo'q" — aniq; "bor" — taxminiy (sinovda 1,04% noto'g'ri "bor").
6. `zset` (sorted set).

</details>

## Rasmiy hujjat

- [RD: Compare data types](https://redis.io/docs/latest/develop/data-types/compare-data-types/)
- [RD: Geospatial](https://redis.io/docs/latest/develop/data-types/geospatial/)
- [RD: HyperLogLog](https://redis.io/docs/latest/develop/data-types/probabilistic/hyperloglogs/)
- [RD: Bloom filter](https://redis.io/docs/latest/develop/data-types/probabilistic/bloom-filter/) · [BF.ADD](https://redis.io/docs/latest/commands/bf.add/)
