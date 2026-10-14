# 98 — Taqsimlangan ID generatsiyasi

[← Oldingi: CAP, PACELC va izchillik modellari](97-cap-va-pacelc.md) · [Mundarija](README.md) · [Keyingi: Fan-out va lenta dizayni →](99-fan-out-va-lenta.md)

## Tushuncha

Bitta bazada ID oddiy: avto-oshadigan son (SQL kitobi, 13- va 39-boblar). Lekin ma'lumot bir nechta shard'ga bo'linganda (95-bob) yoki yozuvlar bir nechta datamarkazda yaratilganda, savol tug'iladi: **noyob** ID ni kim beradi?

RFC 9562 (UUID'ning 2024-yilgi yangilangan standarti) muammoni aniq aytadi: zamonaviy ilovalar tobora **taqsimlangan**. Bunday holatda bazalar ko'p ishlatadigan "auto-increment" sxemalari **yaxshi ishlamaydi** — ketma-ket sonli identifikatorlarni tarmoq bo'ylab muvofiqlashtirish osongina og'ir yukka aylanadi. UUID esa **muvofiqlashtirmasdan** noyob qiymat yaratadi.

### Talablar

Twitter Snowflake README'si (2010) taqsimlangan ID uchun talablarni yaxshi sanaydi:

| Talab | Snowflake'dagi ma'nosi |
| --- | --- |
| Unumdorlik | Har jarayon sekundiga kamida 10 000 ID; javob ~2 ms (tarmoqdan tashqari) |
| **Muvofiqlashtirishsiz** | ID yaratuvchi mashinalar bir-biri bilan kelishishi shart emas — datamarkazlar ichida ham, o'rtasida ham yuqori mavjudlik uchun |
| **(Taxminan) vaqt bo'yicha tartibli** | API'larda "shu ID dan keyingilar" so'rovlari bor |
| **To'g'ridan-to'g'ri saralanadi** | Obyektlarni yuklamasdan ID bo'yicha saralash |
| **Ixcham** | 128 bit emas — 64 bitdan kichik |
| Yuqori mavjudlik | Bog'liq servislar (saqlash) kabi mavjud |

Motivatsiya ham README'da: Twitter MySQL'dan Cassandra'ga o'tganda ketma-ket ID kerak bo'ldi, Cassandra'da esa ketma-ket ID yaratish imkoni **yo'q va bo'lmasligi ham kerak**.

### Variantlar

**1. Bitta bazadagi avto-oshish.** Oddiy va ixcham, lekin barcha yozuvlar bitta joyga bog'liq — RFC 9562 aytgan muvofiqlashtirish yuki.

**2. UUIDv4 (tasodifiy).** Muvofiqlashtirish kerak emas, 128 bit. RFC 9562 uning kamchiligini aniq ko'rsatadi: vaqt bo'yicha tartiblanmagan UUID'lar (masalan, v4) **indeksda lokallik yomon** — ketma-ket yaratilgan qiymatlar indeksda bir-biriga yaqin emas, qo'shishlar tasodifiy joylarga tushadi. SQL kitobi 39-bobdagi o'lchov shuni ko'rsatdi: bir xil 200 000 qatorda UUIDv4 indeksi UUIDv7 nikidan ~39% katta.

**3. UUIDv7 (vaqt bo'yicha tartibli).** RFC 9562 (5.7-bo'lim):

```text
 48 bit           4 bit   12 bit    2 bit   62 bit
┌───────────────┬───────┬────────┬───────┬──────────────┐
│ unix_ts_ms    │ ver=7 │ rand_a │ var   │ rand_b       │
└───────────────┴───────┴────────┴───────┴──────────────┘
  Unix vaqti (millisekund)           qolgan 74 bit — tasodifiy
```

- eng muhim 48 bit — Unix vaqti millisekundlarda; qolgan 74 bit (versiya va variant bitlaridan tashqari) — har yangi UUID uchun tasodifiy;
- ixtiyoriy ravishda, bitta millisekund ichida ham **monotonlik** uchun: millisekunddan kichik vaqt qismi (12 bitgacha) va/yoki ehtiyotkorlik bilan boshlangan hisoblagich;
- RFC tavsiyasi: imkon bo'lsa v1 va v6 o'rniga **v7** ishlatilsin.

PostgreSQL 18 da `uuidv7()` funksiyasi bor (SQL 9- va 39-boblar).

**4. Snowflake (64 bit).** README'dagi tuzilma:

```text
 41 bit                   10 bit           12 bit
┌──────────────────────┬────────────────┬──────────────┐
│ vaqt (ms, o'z epoch) │ mashina ID     │ ketma-ketlik │
└──────────────────────┴────────────────┴──────────────┘
```

- **vaqt** — 41 bit, millisekund aniqlik va o'z epoch'i bilan **69 yil** (2⁴¹ ms ≈ 69.7 yil);
- **mashina ID** — 10 bit, oldindan sozlanadi: **1024** tagacha mashina;
- **ketma-ketlik** — 12 bit, har mashinada 4096 da qaytadan boshlanadi (bitta millisekund ichida qaytmaslik himoyasi bilan). Ya'ni bitta mashina nazariy jihatdan millisekundiga 4096, sekundiga ~4 mln ID beradi.

**Soat muammosi.** README ogohlantiradi: tizim soatini aniq saqlash uchun NTP kerak. Snowflake **orqaga ketadigan** soatdan himoyalanadi: soat oldinga ketib, NTP uni bir necha millisekund orqaga qaytarsa, Snowflake oxirgi ID yaratilgan vaqtdan keyingi vaqt kelguncha ID yaratishni **rad etadi**. Yaxshiroq — NTP soatni orqaga surmaydigan rejimda ishlash.

**"Taxminan" tartib.** README: ID'lar **k-sorted** — ma'lum chegara ichida tartiblangan (va'da — 1 soniya, maqsad — o'nlab millisekund). Turli mashinalar soatlari biroz farq qiladi, shuning uchun ID tartibi yaratilish tartibiga **aniq** mos kelmaydi.

## Nega shunday

| Talab | Avto-oshish | UUIDv4 | UUIDv7 | Snowflake |
| --- | --- | --- | --- | --- |
| Muvofiqlashtirishsiz | Yo'q | Ha | Ha | Ha (mashina ID oldindan beriladi) |
| Vaqt bo'yicha tartib | Ha (bitta bazada) | Yo'q | Ha (ms) | Ha (k-sorted) |
| Indeks lokalligi | Yaxshi | **Yomon** (RFC 9562) | Yaxshi | Yaxshi |
| Hajmi | 4–8 bayt | 16 bayt | 16 bayt | 8 bayt |
| Qo'shimcha infratuzilma | Yo'q | Yo'q | Yo'q | Mashina ID boshqaruvi, soat |

Shuning uchun:

- bitta baza yetarli bo'lsa — avto-oshish (39-bob);
- taqsimlangan, standart va infratuzilmasiz — **UUIDv7**;
- 64 bit muhim (masalan, juda katta indekslar, son sifatida API) — Snowflake tipidagi sxema.

## Psevdokod: Snowflake generatori

```text
EPOCH = 2026-01-01T00:00:00Z (ms)
machineId  = config.machineId        // 0..1023, har jarayonga noyob
lastMs = -1; seq = 0

function nextId():
    now = currentTimeMs()
    if now < lastMs:
        throw ClockMovedBackwards        // README: orqaga ketgan soatda rad etish
    if now == lastMs:
        seq = (seq + 1) & 4095           // 12 bit
        if seq == 0:                     // bu ms da 4096 ta tugadi
            now = waitUntilNextMs(lastMs)
    else:
        seq = 0
    lastMs = now
    return ((now - EPOCH) << 22) | (machineId << 12) | seq
```

## Psevdokod: xavfsizlik

```text
// ❌ ID — ruxsat belgisi sifatida
GET /invoice/0192f3a1-7c8e-7...     // "faqat havolani bilgan ko'radi"

// RFC 9562 (Security Considerations):
//   - UUID'larni taxmin qilish qiyin deb HISOBLAMANG;
//   - ularni xavfsizlik imkoniyati sifatida (egalik qilishning o'zi kirish beradigan) ISHLATMANG;
//   - UUID ichidagi vaqt yaratilish tartibini ochadi;
//   - xavfsizlik amali uchun UUID kerak bo'lsa — v4.

// ✅ ID — faqat identifikator, kirish — avtorizatsiya bilan (62-bob)
GET /invoice/{id}  →  authorize(user, invoice)
```

## Framework'larda

| Vazifa | Qayerda |
| --- | --- |
| `uuidv7()`, `uuidv4()`, `uuid_extract_timestamp()` | PostgreSQL 18 — [SQL 9-bob](../sql/09-boolean-uuid-enum.md), [SQL 39-bob](../sql/39-birlamchi-kalitni-tanlash.md) |
| MySQL'da UUID — `UUID_TO_BIN`, `BINARY(16)` | [SQL 39-bob](../sql/39-birlamchi-kalitni-tanlash.md) |
| Identity va sequence | [SQL 13-bob](../sql/13-identity-va-sequence.md) |
| ID va avtorizatsiya | 62-bob |

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| Avto-oshish | Ixcham, oddiy, tartibli | Bitta muvofiqlashtirish nuqtasi; shard'lar o'rtasida to'qnashuv |
| UUIDv4 | Muvofiqlashtirishsiz, taxmin qilib bo'lmaydi | Indeks lokalligi yomon, 16 bayt |
| UUIDv7 | Muvofiqlashtirishsiz, tartibli, standart | 16 bayt; yaratilish vaqtini ochadi |
| Snowflake | 8 bayt, tartibli | Mashina ID boshqaruvi; soatga bog'liq; nostandart |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Har shard'da alohida avto-oshish | Takror ID'lar | UUIDv7, Snowflake yoki shard'larga ajratilgan oraliqlar |
| Katta jadvalda UUIDv4 birlamchi kalit | RFC 9562: indeks lokalligi yomon | UUIDv7 |
| UUID'ni "maxfiy havola" sifatida ishlatish | RFC 9562: taxmin qilish qiyin deb hisoblanmasin | Avtorizatsiya; kerak bo'lsa alohida tasodifiy token |
| Snowflake'da bir xil mashina ID ikki jarayonda | Bir millisekundda takror ID | Mashina ID'ni markazdan, noyob berish |
| Soat sinxronizatsiyasini e'tiborsiz qoldirish | Orqaga ketgan soat — takror yoki to'xtash | NTP, orqaga qaytmaydigan rejim, tekshiruv |
| ID tartibini aniq yaratilish tartibi deb olish | Snowflake k-sorted; turli mashinalar soati farqli | Aniq tartib kerak bo'lsa — alohida maydon |

## Amaliyot

1. Loyihangizdagi ID'lar qayerda yaratiladi? Ikkinchi baza yoki datamarkaz qo'shilsa nima bo'ladi?
2. PostgreSQL'da `uuidv7()` bilan 10 ta ID yarating va ularni saralang — tartib yaratilish tartibiga mosmi? `uuid_extract_timestamp()` bilan vaqtni oling.
3. Yuqoridagi Snowflake psevdokodini o'z tilingizda yozing va bitta millisekundda 5000 ta ID so'raganda nima bo'lishini sinang.
4. Ochiq URL'larda ID ishlatiladimi? Ular orqali ruxsatsiz kirish mumkinmi?
5. Jadvallaringizdan birida UUIDv4 kalitni UUIDv7 bilan almashtirsangiz indeks hajmi qancha o'zgaradi (SQL 39-bob usuli bilan o'lchang)?

## Manbalar

- RFC 9562 — *Universally Unique IDentifiers (UUIDs)* (2.1 Update Motivation, 5.7 UUIDv7, 6.2 Monotonicity, 8 Security Considerations): <https://www.rfc-editor.org/rfc/rfc9562>
- Twitter — *Snowflake* README (2010): <https://github.com/twitter-archive/snowflake/tree/snowflake-2010>
