# 29 — Qidiruv arxitekturasi

[← Oldingi: CQRS va o'qish modellari](28-cqrs.md) · [Mundarija](README.md) · [Keyingi: Rate limiting va kvotalar →](30-rate-limiting.md)

## Tushuncha

Qidiruv — "filtr" emas. Filtr — aniq shart (`status = 'paid'`, `price < 100 000`). Qidiruv — **noaniq** so'rov bo'yicha **eng mos** natijalarni tartiblash: "qizil krossovka 42" — xato yozilgan so'zlar, sinonimlar, morfologiya ("krossovkalar"), relevantlik.

| Ehtiyoj | Vosita |
| --- | --- |
| Aniq filtr, saralash, sahifalash | Oddiy SQL + indekslar (66-bob) |
| Kichik hajmdagi matn qidiruvi | DB full-text (PostgreSQL `tsvector`, MySQL FULLTEXT) |
| Katta hajm, relevantlik, xato tuzatish, facet'lar | Qidiruv dvigateli: Elasticsearch/OpenSearch, Meilisearch, Typesense |
| Ma'no bo'yicha qidiruv ("qishki poyabzal" → etiklar) | Vektor qidiruv (86-bob) |

## Nega shunday

`WHERE title LIKE '%krossovka%'` — indeksdan foydalanmaydi, katta jadvalda sekin, morfologiya va xatolarni bilmaydi, relevantlik bo'yicha tartiblamaydi. Qidiruv dvigateli boshqa ma'lumot tuzilmasidan foydalanadi — **teskari indeks** (so'z → hujjatlar ro'yxati) — va tahlil (analyzer): tokenlash, kichik harf, stemming, sinonimlar.

Lekin qidiruv dvigateli — **yana bir ma'lumot ombori**: uni DB bilan sinxron ushlash — asosiy arxitektura muammosi.

## Psevdokod: sinxronlash

Qidiruv indeksi — 28-bobdagi **o'qish modeli**. Haqiqat manbai — DB.

```text
// 1. Sinxron (so'rov ichida) — oddiy, lekin mo'rt
function updateProduct(id, data):
    db.update(id, data)
    search.index(id, toDocument(data))     // qidiruv yiqilsa — mahsulot saqlanmaydimi? yoki nomuvofiq?

// 2. Hodisa orqali — tavsiya etiladi
BEGIN; db.update(id, data); outbox.add(ProductChanged(id)); COMMIT
worker: on ProductChanged(e): doc = buildDocument(db.find(e.id)); search.index(e.id, doc)

// 3. CDC (change data capture) — DB log'idan (Debezium) — kodga tegmasdan, katta tizimlar uchun
```

**Qayta indekslash** har doim mumkin bo'lsin:

```text
reindex():
    newIndex = "products_v" + timestamp
    for batch in db.products.batches(1000): search.bulk(newIndex, batch.map(buildDocument))
    search.alias("products").swap(to = newIndex)      // nol to'xtov: alias almashtiriladi
    search.delete(oldIndex)
```

Analyzer o'zgarsa, maydon qo'shilsa, sinxron buzilsa — qayta indekslash yagona ishonchli yo'l.

## Psevdokod: hujjat — qidiruv uchun shakl

```text
// DB'dagi 5 ta jadval → bitta denormalizatsiyalangan hujjat
{
  id: "p_42",
  title: "Nike Air Zoom krossovka",
  title_suggest: "...",                 // avtoto'ldirish uchun
  brand: "Nike",                        // facet
  category_path: ["Poyabzal", "Sport"], // facet
  price: 890000,                        // filtr/saralash
  in_stock: true,                       // filtr
  popularity: 0.87,                     // relevantlikka qo'shimcha
  locale_uz: { title, description },    // tilga xos analyzer
}
```

Qidiruv hujjati — **sahifa ehtiyojiga** moslangan, DB sxemasiga emas.

## Psevdokod: ruxsatlar

```text
Muammo: qidiruv indeksida hamma mahsulot, lekin foydalanuvchi faqat o'z tashkilotinikini ko'rishi kerak

a) Indeksda ruxsat maydoni (tenant_id, visibility) + har so'rovda majburiy filtr
b) Har tenant — alohida indeks (kichik tenantlar ko'p bo'lsa — noqulay)
c) Qidiruvdan keyin DB'da tekshirish — sahifalash buziladi (20 ta topildi, 12 tasi ruxsatsiz)

Qoida: ruxsat filtri — qidiruv so'rovining ICHIDA, server tomonda qo'shiladi, klient bermaydi.
```

## Framework'larda

| Ehtiyoj | Backend | Frontend |
| --- | --- | --- |
| DB full-text | Doctrine native SQL / PostgreSQL `tsvector`; Laravel `whereFullText` | — |
| Qidiruv dvigateli | Laravel Scout (Meilisearch, Typesense, Algolia drayverlari); Symfony — FOSElastica, Meilisearch bundle | — |
| Indekslash fonda | Messenger/Queue (26-bob) | — |
| Qidiruv UI | — | Debounce + bekor qilish — [Angular 68-bob](../angular/68-rxjs-chuqur.md) (`switchMap`), [22-bob](../angular/22-debounced-signallar.md) (`debounced` + `httpResource`) |
| Filtr holati URL'da | — | [Angular 41-bob](../angular/41-parametrlar.md), [Next.js 11-bob](../nextjs/11-navigatsiya.md) |

Frontend'ning qidiruvdagi asosiy vazifalari: debounce (har harfda so'rov emas), **eskirgan javobni bekor qilish** (`switchMap` — sekin eski javob yangisini bosib o'tmasin), filtr va so'rovni URL'da saqlash, bo'sh/xato holatlari.

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| `LIKE` | Oddiy | Sekin, relevantlik yo'q |
| DB full-text | Qo'shimcha tizim yo'q, tranzaksion izchil | Imkoniyatlar cheklangan, katta yukda DB'ga bosim |
| Meilisearch/Typesense | Tez sozlash, yaxshi standartlar | Kamroq moslashuvchan |
| Elasticsearch/OpenSearch | Maksimal imkoniyat, analitika | Ops murakkabligi, resurs talab qiladi |
| Hodisa orqali sinxron | Ishonchli, ajratilgan | Qidiruvda bir necha soniya kechikish |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Qidiruv indeksi — haqiqat manbai | Qayta tiklab bo'lmaydi | DB manba, indeks — qayta quriladi |
| Sinxron indekslash so'rov ichida | Qidiruv yiqilsa yozish yiqiladi | Outbox + worker |
| Qayta indekslash imkoni yo'q | Analyzer o'zgarishi — og'riq | Alias bilan nol to'xtovli reindex |
| Ruxsat filtri klientdan | Boshqa tenant ma'lumoti ko'rinadi | Server majburiy filtr |
| Frontend'da har harfga so'rov, bekor qilishsiz | Yuk, noto'g'ri natija tartibi | Debounce + `switchMap` |
| O'zbek tili uchun ingliz analyzer | Qo'shimchalar ("-lar", "-ni") tanilmaydi | Tilga mos tahlil, sinonimlar |

## Amaliyot

1. Qidiruvingiz `LIKE` bilanmi? 100 000 yozuvda vaqtni o'lchang.
2. PostgreSQL full-text yoki Meilisearch bilan bitta qidiruvni qayta yozing va natijalarni solishtiring.
3. Indekslashni hodisa + worker orqali qiling va qayta indekslash skriptini yozing.
4. Frontend qidiruvida debounce va eskirgan javobni bekor qilish borligini tekshiring.

## Manbalar

- *Elasticsearch: The Definitive Guide* (asosiy tushunchalar — teskari indeks, analyzer)
- Meilisearch hujjati: <https://www.meilisearch.com/docs>
- Debezium (CDC): <https://debezium.io>
