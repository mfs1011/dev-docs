# 10 — Stream

[Mundarija](README.md)

## Tushuncha

RD (Redis streams): **stream** — faqat oxiriga yoziladigan **jurnal** (append-only log) kabi ishlaydigan tuzilma, lekin oddiy jurnal cheklovlarini yengadigan amallari bor: istalgan yozuvga tez murojaat va murakkab o'qish usullari (masalan, **iste'molchilar guruhlari** — consumer groups). Hodisalarni yozib borish va bir vaqtda tarqatish uchun.

Qo'llanishlar (RD): hodisalar manbai (event sourcing — foydalanuvchi harakatlari, bosishlar), sensor ko'rsatkichlari, bildirishnomalar (har foydalanuvchiga alohida stream). Amaliy hodisalar oqimi — 23-bob.

Har **yozuv** (entry) — bir yoki bir nechta maydon-qiymat juftlari (kichik hash kabi) va noyob **ID**.

### ID

```text
<millisoniyadagi vaqt>-<tartib raqami>
```

RD:

- Vaqt — yozuvni yaratgan Redis serverining mahalliy vaqti; soat orqaga ketsa, avvalgi yozuv vaqti olinadi — ID doim **o'sib boradi**.
- Tartib raqami — bir millisoniya ichidagi yozuvlar uchun.
- ID vaqtga bog'langani uchun **vaqt oralig'i bo'yicha** so'rov tekin.
- `XADD k * …` — ID'ni Redis tanlaydi; o'zingiz ham berishingiz mumkin, lekin u oxirgisidan **katta** bo'lishi shart; Redis 7 dan `vaqt-*` — tartib raqamini Redis qo'yadi.

Maxsus ID'lar (RD):

| ID | Qayerda | Ma'nosi |
| --- | --- | --- |
| `*` | `XADD` | ID'ni avtomatik tanlash |
| `-`, `+` | `XRANGE` | Eng kichik / eng katta mumkin bo'lgan ID |
| `$` | `XREAD`, `XGROUP CREATE` | Shu stream'dagi **hozirgi** oxirgi ID — "faqat bundan keyingi yangilar" |
| `>` | `XREADGROUP` | Guruhda hali **hech kimga berilmagan** xabarlar |

`$` va `+` — har xil: `+` — umuman mumkin bo'lgan eng katta ID, `$` — shu stream'dagi oxirgisi.

### O'qishning uch usuli

| Usul | Buyruq | Nima |
| --- | --- | --- |
| Oraliq | `XRANGE k boshi oxiri [COUNT n]`, `XREVRANGE` | ID (vaqt) oralig'i; sahifalash: oxirgi ID'ni `(` bilan keyingi boshlanish qilish |
| Yangilarni kuzatish | `XREAD [COUNT n] [BLOCK ms] STREAMS k id` | Berilgan ID'dan keyingilar; `BLOCK` — kutish (`0` — cheksiz) |
| Guruh bo'lib ishlash | `XREADGROUP GROUP g iste'molchi … STREAMS k >` | Xabarlar guruh a'zolari orasida **bo'linadi** |

RD — `XREAD` va list/Pub/Sub farqi:

1. Yangi yozuv kutayotgan **har bir** mijozga yetkaziladi (list'da har mijoz boshqa elementni oladi).
2. Yozuvlar **saqlanib qoladi** (list'da olingan element o'chadi; Pub/Sub'da umuman saqlanmaydi) — tarix aniq.
3. Iste'molchilar guruhlari — Pub/Sub yoki list bera olmaydigan nazorat.

### Iste'molchilar guruhi

RD: guruh — stream'dan o'qib, bir nechta iste'molchiga xizmat qiluvchi "soxta iste'molchi":

1. Har xabar **faqat bitta** iste'molchiga beriladi.
2. Iste'molchi **nom** bilan tanilgan — uzilib qayta ulansa ham holat saqlanadi.
3. Guruh "keyingi beriladigan" ID'ni biladi (`last-delivered-id`).
4. Xabar ishlangani **aniq tasdiqlanishi** kerak — `XACK`.
5. Berilgan, lekin tasdiqlanmagan xabarlar — **kutilayotganlar ro'yxati** (Pending Entries List, PEL).

| Buyruq | Nima |
| --- | --- |
| `XGROUP CREATE k g id [MKSTREAM]` | Guruh yaratish; `id` — qayerdan boshlash (`$` — faqat yangilar, `0` — boshidan); `MKSTREAM` — stream yo'q bo'lsa yaratadi |
| `XREADGROUP … STREAMS k >` | Yangi xabarlar; `>` o'rniga `0` — **shu iste'molchining** tasdiqlanmagan xabarlari (qulagandan keyin tiklanish) |
| `XACK k g id …` | Ishlandi — PEL'dan chiqarish |
| `XPENDING k g [- + n [iste'molchi]]` | Kutilayotganlar: kimda, qancha vaqtdan beri (idle, ms), necha marta berilgan |
| `XCLAIM`, `XAUTOCLAIM k g iste'molchi min-idle boshi` | Uzoq turib qolgan xabarni boshqa iste'molchiga o'tkazish (6.2 dan avtomatik) |
| `XNACK k g SILENT\|FAIL\|FATAL IDS n id …` | Xabarni tasdiqlamasdan guruhga **qaytarish** (Redis 8.8 dan) |
| `XINFO STREAM\|GROUPS\|CONSUMERS` | Kuzatish |

`XNACK` rejimlari (RD): `SILENT` — yetkazish sanog'ini kamaytiradi (to'xtatish paytida), `FAIL` — o'zgartirmaydi (boshqasi uddalashi mumkin), `FATAL` — maksimal qiladi ("o'lik xabar"). Qaytarilgan xabar PEL'da **bo'sh iste'molchi** bilan ko'rinadi.

Yetkazish sanog'i nega kerak (RD): ba'zi xabar (buzilgan) hech qachon ishlanmaydi va qayta-qayta beriladi; sanoq chegaradan oshsa, uni alohida ("o'lik xabarlar") stream'ga o'tkazib, tasdiqlash mumkin.

### Kafka bilan farqi

RD: Redis guruhlari Kafka guruhlariga funksional jihatdan o'xshaydi, lekin amalda boshqacha — bo'linmalar (partitions) yo'q, xabarlar bitta kalitda; tezroq iste'molchi ko'proq xabar oladi.

- 1 stream → 1 iste'molchi — xabarlar **tartib bilan**.
- 1 stream → N iste'molchi — yuk taqsimlanadi, lekin bir obyektga oid xabarlar **tartibsiz** ishlanishi mumkin.
- Kafka bo'linmalariga o'xshash — N ta alohida kalit.

### Hajmni cheklash

RD: `XADD k MAXLEN n * …` — eski yozuvlar o'chirilib, uzunlik `n` da turadi. Aniq `MAXLEN` qimmat (stream ichida yozuvlar o'nlab elementli "makro tugunlar"da saqlanadi) — `MAXLEN ~ n`: **kamida** `n` ta qoladi, butun tugun o'chirilishi mumkin bo'lgandagina kesiladi. `XTRIM k MAXLEN|MINID …` — alohida buyruq; `MINID` — shu ID'dan kichiklarni o'chiradi. Redis 8.2 dan `KEEPREF` (standart), `DELREF`, `ACKED` (faqat hamma guruhlar tasdiqlaganlarni o'chirish).

**Bo'sh stream o'chmaydi** (RD): boshqa turlardan farqli (7-bob) — guruhlar holati yo'qolmasligi uchun.

### Ishonchlilik

RD: stream va guruhlar holati AOF/RDB'ga yoziladi va replikalarga uzatiladi, lekin:

- xabarlar muhim bo'lsa — AOF kuchli `fsync` siyosati bilan (28-bob);
- replikatsiya **asinxron** — failover'dan keyin nimadir yo'qolishi mumkin; `WAIT` ehtimolni kamaytiradi, lekin to'liq kafolat bermaydi.

**Tezlik** (RD): qo'shish — O(1); bitta yozuvga murojaat amalda o'zgarmas vaqt (stream — radix daraxt).

## Ko'rib chiqamiz

VPS'da (Redis 8.10.3), RD'dagi poyga misollari. ID'lardagi vaqt — sinov payti (2026-11-08).

### Qo'shish va ID

```text vps
$ redis-cli FLUSHALL
OK
$ redis-cli XADD race:france '*' rider Castilla speed 30.2 position 1 location_id 1; redis-cli XADD race:france '*' rider Norem speed 28.8 position 3 location_id 1; redis-cli XADD race:france '*' rider Prickett speed 29.7 position 2 location_id 1; redis-cli XLEN race:france
1794141196269-0
1794141196274-0
1794141196279-0
3
$ redis-cli XADD race:usa 0-1 racer Castilla; redis-cli XADD race:usa 0-2 racer Norem; redis-cli XADD race:usa 0-1 racer Prickett; redis-cli XADD race:usa '0-*' racer Prickett
0-1
0-2
ERR The ID specified in XADD is equal or smaller than the target stream top item

0-3
```

- `*` bilan — vaqtga asoslangan ID'lar.
- Qo'lda `0-1` ni qayta berish — xato: ID oxirgisidan katta bo'lishi shart.
- `0-*` — tartib raqamini Redis qo'ydi: `0-3`.

### Oraliq

```text vps
$ redis-cli --no-raw XRANGE race:france - + COUNT 2
1) 1) "1794141196269-0"
   2) 1) "rider"
      2) "Castilla"
      3) "speed"
      4) "30.2"
      5) "position"
      6) "1"
      7) "location_id"
      8) "1"
2) 1) "1794141196274-0"
   2) 1) "rider"
      2) "Norem"
      3) "speed"
      4) "28.8"
      5) "position"
      6) "3"
      7) "location_id"
      8) "1"
$ redis-cli --no-raw XREVRANGE race:france + - COUNT 1
1) 1) "1794141196279-0"
   2) 1) "rider"
      2) "Prickett"
      3) "speed"
      4) "29.7"
      5) "position"
      6) "2"
      7) "location_id"
      8) "1"
```

Har yozuv — ID va maydon-qiymat juftlari. `XREVRANGE` da boshi va oxiri **teskari** (`+ -`) — oxirgi yozuvni olishning qulay yo'li.

### `XREAD`: kuzatish

```text vps
$ redis-cli --no-raw XREAD COUNT 1 STREAMS race:france 0
1) 1) "race:france"
   2) 1) 1) "1794141196269-0"
         2) 1) "rider"
            2) "Castilla"
            3) "speed"
            4) "30.2"
            5) "position"
            6) "1"
            7) "location_id"
            8) "1"
$ ( sleep 1; redis-cli XADD race:france '*' rider Wood speed 31.1 position 4 location_id 2 > /dev/null ) & TIMEFORMAT='kutildi: %R s'; time redis-cli --no-raw XREAD BLOCK 0 STREAMS race:france '$'; wait
1) 1) "race:france"
   2) 1) 1) "1794141197341-0"
         2) 1) "rider"
            2) "Wood"
            3) "speed"
            4) "31.1"
            5) "position"
            6) "4"
            7) "location_id"
            8) "2"
kutildi: 1.019 s
```

- `STREAMS race:france 0` — `0-0` dan keyingilar; javobda stream nomi ham bor (bir nechta stream o'qish mumkin).
- `BLOCK 0` + `$` — faqat **bundan keyingi** yozuv kutildi; 1 soniyadan keyin `Wood` qo'shildi va darhol keldi.

Ikki mijoz bir stream'ni kutmoqda:

```text vps
$ for m in A B; do ( redis-cli XREAD BLOCK 5000 STREAMS race:france '$' | sed -n 3,4p | tr '\n' ' ' | sed "s/^/$m mijoz oldi: /"; echo ) & done; sleep 0.5; redis-cli XADD race:france '*' rider Henshaw speed 27.0 > /dev/null; wait
A mijoz oldi: rider Henshaw 
B mijoz oldi: rider Henshaw 
```

**Ikkalasi ham** `Henshaw` ni oldi — list'dagi `BLPOP` dan farqli (7-bobda har mijoz boshqa element olgan edi).

### Iste'molchilar guruhi

```text vps
$ redis-cli XGROUP CREATE race:italy italy_riders '$' MKSTREAM; for r in Castilla Royce Sam-Bodden Prickett Norem; do redis-cli XADD race:italy '*' rider $r > /dev/null; done; redis-cli XLEN race:italy
OK
5
$ redis-cli --no-raw XREADGROUP GROUP italy_riders Alice COUNT 1 STREAMS race:italy '>'
1) 1) "race:italy"
   2) 1) 1) "1794141197895-0"
         2) 1) "rider"
            2) "Castilla"
$ redis-cli --no-raw XREADGROUP GROUP italy_riders Alice STREAMS race:italy 0
1) 1) "race:italy"
   2) 1) 1) "1794141197895-0"
         2) 1) "rider"
            2) "Castilla"
$ id=$(redis-cli XREADGROUP GROUP italy_riders Alice STREAMS race:italy 0 | sed -n 2p); redis-cli XACK race:italy italy_riders $id; redis-cli --no-raw XREADGROUP GROUP italy_riders Alice STREAMS race:italy 0
1
1) 1) "race:italy"
   2) (empty array)
$ redis-cli --no-raw XREADGROUP GROUP italy_riders Bob COUNT 2 STREAMS race:italy '>' | grep -E 'rider|"[A-Z]' | grep -v rider
            2) "Royce"
            2) "Sam-Bodden"
```

- `XGROUP CREATE … $ MKSTREAM` — stream yo'q edi, yaratildi; guruh faqat **yangi** xabarlarni beradi.
- Alice `>` bilan 1 ta oldi — `Castilla`.
- `0` bilan — Alice'ning tasdiqlanmagan xabarlari: yana `Castilla` (qulagandan keyin shunday tiklanadi).
- `XACK` dan keyin Alice'ning kutilayotgan ro'yxati bo'sh.
- Bob `>` bilan keyingi 2 tasini oldi — `Royce`, `Sam-Bodden`: xabarlar **bo'lindi**, Alice olgani Bob'ga berilmadi.

### Kutilayotganlar va boshqaga o'tkazish

Bob ikki xabarni olib, tasdiqlamay "qulab" qoldi:

```text vps
$ redis-cli --no-raw XPENDING race:italy italy_riders
1) (integer) 2
2) "1794141197900-0"
3) "1794141197905-0"
4) 1) 1) "Bob"
      2) "2"
$ sleep 2; redis-cli --no-raw XPENDING race:italy italy_riders - + 10
1) 1) "1794141197900-0"
   2) "Bob"
   3) (integer) 2016
   4) (integer) 1
2) 1) "1794141197905-0"
   2) "Bob"
   3) (integer) 2016
   4) (integer) 1
```

- Umumiy: 2 ta kutilayotgan, eng kichik va eng katta ID, hammasi Bob'da.
- Batafsil: ID, iste'molchi, oxirgi berilgandan beri o'tgan vaqt (~2016 ms), necha marta berilgan (`1`).

```text vps
$ redis-cli --no-raw XAUTOCLAIM race:italy italy_riders Alice 1000 0-0 COUNT 1 | grep -E 'rider|"[A-Z]' | grep -v rider; redis-cli --no-raw XPENDING race:italy italy_riders | tail -4
         2) "Royce"
4) 1) 1) "Alice"
      2) "1"
   2) 1) "Bob"
      2) "1"
```

`XAUTOCLAIM … Alice 1000` — 1 soniyadan ko'p turib qolgan birinchi xabar (`Royce`) Alice'ga o'tdi. Endi Alice'da 1, Bob'da 1.

```text vps
$ id=$(redis-cli XPENDING race:italy italy_riders - + 10 Bob | head -1); redis-cli XNACK race:italy italy_riders FAIL IDS 1 $id; redis-cli --no-raw XPENDING race:italy italy_riders - + 10 | grep -A1 "$id"
1
2) 1) "1794141197905-0"
   2) ""
```

`XNACK … FAIL` — Bob qolgan xabarni guruhga qaytardi: PEL'da iste'molchi **bo'sh** (`""`) — boshqa iste'molchi darhol olishi mumkin.

```text vps
$ redis-cli --no-raw XINFO GROUPS race:italy | head -14
1)  1) "name"
    2) "italy_riders"
    3) "consumers"
    4) (integer) 2
    5) "pending"
    6) (integer) 2
    7) "last-delivered-id"
    8) "1794141197905-0"
    9) "entries-read"
   10) (integer) 3
   11) "lag"
   12) (integer) 2
```

`lag` — guruh hali o'qimagan yozuvlar soni: 5 tadan 3 tasi berilgan, 2 tasi kutmoqda.

### Hajmni cheklash

```text vps
$ redis-cli DEL qisqa > /dev/null; for i in $(seq 1 10); do redis-cli XADD qisqa MAXLEN 3 '*' n $i > /dev/null; done; redis-cli XLEN qisqa; redis-cli XRANGE qisqa - + | grep -x '[0-9]*' | tr '\n' ' '; echo
3
8 9 10 
$ redis-cli DEL taxminiy > /dev/null; for i in $(seq 1 2050); do echo "XADD taxminiy MAXLEN ~ 1000 * n $i"; done | redis-cli > /dev/null; redis-cli XLEN taxminiy; redis-cli CONFIG GET stream-node-max-entries | tail -1
1050
100
```

- `MAXLEN 3` — 10 ta qo'shildi, oxirgi 3 tasi qoldi.
- `MAXLEN ~ 1000` — 2050 ta qo'shildi, **1050** qoldi: kamida 1000, butun tugunlar (`stream-node-max-entries` — 100) bo'yicha kesildi.

### Bo'sh stream

```text vps
$ id=$(redis-cli XADD bosh '*' a 1); redis-cli XDEL bosh $id; redis-cli XLEN bosh; redis-cli EXISTS bosh; redis-cli TYPE bosh
1
0
1
stream
```

Yagona yozuv o'chirildi: `XLEN` — `0`, lekin kalit **bor** (`EXISTS` — `1`), turi `stream`. List bo'lganida kalit o'chardi.

## Variantlar: qaysi tuzilma navbat uchun

| Ehtiyoj | Tanlov |
| --- | --- |
| Oddiy ish navbati, har vazifa bitta ishlovchiga | List + `BLMOVE` (7-bob) |
| Hodisalar saqlanishi, tarix, qayta o'qish | Stream |
| Bir hodisani bir necha xil xizmat o'qishi | Stream + har xizmatga alohida guruh |
| Ishlovchilar orasida taqsimlash va tasdiqlash | Stream + iste'molchilar guruhi |
| Saqlash shart emas, faqat hozir ulanganlarga yuborish | Pub/Sub (22-bob) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| `XACK` ni unutish | PEL o'sib boradi, xabar "ishlanmagan" qoladi | Ishlagandan keyin `XACK` |
| Qayta ulanganda faqat `>` o'qish | Qulashdan oldin olingan, tasdiqlanmagan xabarlar unutiladi | Avval `0` bilan o'z PEL'ini o'qish |
| Qulab qolgan iste'molchining xabarlarini kuzatmaslik | Xabar abadiy kutadi | `XPENDING` + `XAUTOCLAIM` |
| `MAXLEN`/`XTRIM` siz stream | Cheksiz o'sadi | `MAXLEN ~ n` yoki `MINID` |
| `$` va `+` ni aralashtirish | Har xil ma'no | `$` — shu stream'dagi oxirgi; `+` — eng katta mumkin bo'lgan |
| Bo'sh stream o'chdi deb kutish | Stream bo'sh qolsa ham kalit qoladi | Kerak bo'lsa `DEL` |
| Bir obyekt xabarlari tartib bilan ishlanadi deb, N iste'molchili guruh | Tartib buziladi | Tartib kerak bo'lsa — 1 iste'molchi yoki N kalit |
| Asinxron replikatsiyada hech narsa yo'qolmaydi deb o'ylash | Failover'da yo'qolishi mumkin (RD) | AOF `fsync`, `WAIT`, ilova darajasida tekshiruv |

## Amaliyot

1. Stream ID qanday tuzilgan va nega vaqtga bog'langan?
2. `XREAD BLOCK` ikki mijozga qanday xabar yetkazadi? List'dan farqi?
3. `XREADGROUP` da `>` va `0` farqi nima?
4. Iste'molchi qulab qolsa, uning xabarlari bilan nima qilinadi?
5. `MAXLEN 1000` va `MAXLEN ~ 1000` farqi nima? Sinovda nechta qoldi?
6. Stream'dagi oxirgi yozuv o'chirilsa kalit bilan nima bo'ladi? Nega?

<details>
<summary>Javoblar</summary>

1. `millisoniya-tartib raqami`; vaqt bo'yicha oraliq so'rovlari uchun.
2. Ikkalasiga ham bir xil yozuv; list'da har mijoz boshqa elementni oladi va element o'chadi.
3. `>` — hech kimga berilmagan yangi xabarlar; `0` — shu iste'molchining tasdiqlanmagan xabarlari.
4. `XPENDING` bilan topiladi va `XCLAIM`/`XAUTOCLAIM` bilan boshqa iste'molchiga o'tkaziladi (yoki iste'molchining o'zi `XNACK` bilan qaytaradi).
5. Aniq 1000 yoki kamida 1000 (tugunlar butunligicha o'chiriladi, tejamkor); sinovda 1050.
6. Kalit qoladi (`XLEN` 0) — guruhlar holati yo'qolmasligi uchun.

</details>

## Rasmiy hujjat

- [RD: Redis Streams](https://redis.io/docs/latest/develop/data-types/streams/)
- [RD: XADD](https://redis.io/docs/latest/commands/xadd/) · [XREAD](https://redis.io/docs/latest/commands/xread/) · [XREADGROUP](https://redis.io/docs/latest/commands/xreadgroup/) · [XPENDING](https://redis.io/docs/latest/commands/xpending/) · [XAUTOCLAIM](https://redis.io/docs/latest/commands/xautoclaim/) · [XNACK](https://redis.io/docs/latest/commands/xnack/) · [XTRIM](https://redis.io/docs/latest/commands/xtrim/)
