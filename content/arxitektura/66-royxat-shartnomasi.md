# 66 — Ro'yxat shartnomasi

[← Oldingi: Kesh kelishuvi](65-kesh-kelishuvi.md) · [Mundarija](README.md) · [Keyingi: Cheklovlar shartnomasi →](67-cheklovlar.md)

## Tushuncha

Deyarli har ilovada ro'yxatlar bor: buyurtmalar, mahsulotlar, foydalanuvchilar. Ro'yxat shartnomasi — **sahifalash, filtr, saralash va qidiruv** qanday ifodalanishi. Uni bir marta to'g'ri loyihalab, hamma joyda bir xil ishlatish — frontend uchun katta yengillik (bitta jadval komponenti, bitta ma'lumot qatlami).

## Nega shunday

Har endpoint o'z uslubida bo'lsa (`?page=2`, `?offset=20&limit=20`, `?p=2&size=20`, `?cursor=...`), frontend har biri uchun alohida kod yozadi. Va sahifalash usuli **unumdorlik va to'g'rilikka** ta'sir qiladi — bu shunchaki uslub emas.

## Psevdokod: offset va cursor

```text
OFFSET:   GET /orders?page=3&perSize=20        →  SQL: ORDER BY created_at DESC LIMIT 20 OFFSET 40
  + "3-sahifaga o'tish", jami sahifalar soni
  − Katta OFFSET — sekin (DB 40 000 qatorni o'tkazib yuboradi)
  − Ma'lumot o'zgarsa — dublikat yoki o'tkazib yuborilgan qatorlar (yangi buyurtma qo'shildi → hammasi suriladi)

CURSOR (keyset):  GET /orders?limit=20&after=eyJjIjoiMjAyNi0wOS0zMCIsImlkIjoiN2YzYSJ9
  →  SQL: WHERE (created_at, id) < (:c, :id) ORDER BY created_at DESC, id DESC LIMIT 21
  + Har sahifa bir xil tez (indeks bo'yicha)
  + O'zgarishlarda barqaror (dublikat yo'q)
  − "N-sahifaga sakrash" yo'q; jami son — alohida (va qimmat)
```

| Kerak | Tanlov |
| --- | --- |
| Admin jadval, "sahifa 7", kichik/o'rta ro'yxat | Offset |
| Cheksiz lenta, mobil, katta jadvallar, eksport | Cursor |
| Ikkalasi | Cursor + taxminiy jami ("~12 000 natija") |

Cursor — klient uchun **shaffof bo'lmagan** (opaque) satr: frontend uni ochmaydi, faqat qaytarib yuboradi. Server ichki tuzilmani (qaysi ustunlar) keyin o'zgartira oladi.

## Psevdokod: javob shakli

```text
{
  "items": [ ... ],
  "page": {
    "nextCursor": "eyJ...",          // yoki null — oxirgi sahifa
    "prevCursor": null,
    "limit": 20,
    "total": 1842                    // ixtiyoriy: qimmat bo'lsa — yo'q yoki taxminiy
  }
}
```

Saralash uchun `id` ni **ikkinchi kalit** sifatida qo'shish shart (`ORDER BY created_at DESC, id DESC`): bir xil `created_at` li qatorlar sahifalar orasida aralashib ketmasin.

## Psevdokod: filtr va saralash

```text
GET /orders?status=paid,shipped&createdFrom=2026-09-01&createdTo=2026-09-30&q=ali&sort=-createdAt,total&limit=20

Qoidalar:
  - filtrlar — oq ro'yxat (faqat ruxsat etilgan maydonlar va operatorlar)
  - saralash — oq ro'yxat va faqat indekslangan maydonlar
  - sana — ISO 8601, oraliq — From/To (yoki [gte]/[lte] bir xil uslubda)
  - ko'p qiymat — vergul bilan YOKI takroriy kalit (bittasi, hamma joyda)
  - limit — maksimum bilan (limit=10000 → 100 ga cheklash)
  - noma'lum parametr — e'tiborsiz qoldirish yoki 400 (siyosat bitta bo'lsin)
```

Erkin `?filter={"$where":...}` yoki to'g'ridan-to'g'ri SQL qismlari — **injection** va DoS manbai. Faqat aniq ro'yxat.

## Psevdokod: frontend bilan bog'lanish

```text
URL ↔ ro'yxat holati (44-bob):
  /orders?status=paid&sort=-createdAt&after=eyJ...
  - havolani ulashsa — xuddi shu ko'rinish
  - "orqaga" — oldingi filtr
  - filtr o'zgarsa — cursor tashlanadi (yangi so'rov boshidan)

Ma'lumot qatlami: kalit = [resurs, filtrlar, cursor] → kesh va eskirgan javobni bekor qilish (42-bob)
Cheksiz lenta: oxiriga yaqinlashganda nextCursor bilan keyingi sahifa; virtual scroll (katta ro'yxat)
```

## Framework'larda

| Ehtiyoj | Backend | Frontend |
| --- | --- | --- |
| Offset | Laravel `paginate()`; Doctrine Paginator — [Symfony 17-bob](../symfony/17-repository-va-dql.md) | Sahifa raqami URL'da |
| Cursor | Laravel `cursorPaginate()` — [Laravel 20-bob](../laravel/20-api-resurslar.md); API Platform cursor | `useInfiniteQuery` — [React 32-bob](../react/32-tanstack-query.md) |
| Filtr/saralash | API Platform filtrlari — [Symfony 38-bob](../symfony/38-api-pro.md); Spatie Query Builder | Query parametrlar — [Angular 41-bob](../angular/41-parametrlar.md) |
| Katta ro'yxat UI | — | Virtual scroll — [Angular 66-bob](../angular/66-material-va-cdk.md) |

Angular'da tekshirilgan nozik joy: `HttpClient` `params` dagi `null`/`undefined` so'zma-so'z `?status=null` bo'lib ketadi — filtrlarni yuborishdan oldin tozalash kerak ([Angular 55-bob](../angular/55-http-client.md)).

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| Offset | Sahifaga sakrash, jami son | Katta sahifalarda sekin, o'zgarishda beqaror |
| Cursor | Tez, barqaror | Sakrash yo'q, jami son alohida |
| Jami son har doim | Foydalanuvchiga qulay | `COUNT(*)` katta jadvalda qimmat |
| Erkin filtr tili | Moslashuvchan | Xavfsizlik, indekssiz so'rovlar |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Har endpoint o'z sahifalash uslubi | Frontend kodi takrorlanadi | Bitta shartnoma |
| Saralashda ikkinchi kalit yo'q | Sahifalar orasida qatorlar aralashadi | `..., id` |
| Limit cheklanmagan | Bitta so'rov DB'ni yiqitadi | Maksimum limit |
| Indekssiz saralash maydoni | Sekin so'rovlar | Oq ro'yxat — faqat indekslanganlar |
| Filtr o'zgarsa cursor qoladi | Noto'g'ri natijalar | Cursor'ni tashlash |
| Cursor ichini frontend parse qiladi | Server o'zgartira olmaydi | Opaque |

## Amaliyot

1. API'ingizdagi barcha ro'yxat endpoint'larini sahifalash/filtr uslubi bo'yicha solishtiring.
2. Eng katta jadval uchun offset va cursor so'rov vaqtini 100-sahifada o'lchang.
3. Saralash va filtr parametrlari uchun oq ro'yxat yozing.
4. Frontend'da filtr va cursor URL'da saqlanishini tekshiring.

## Manbalar

- Markus Winand — *No Offset* <https://use-the-index-luke.com/no-offset>
- Slack Engineering — *Evolving API Pagination at Slack*
- JSON:API — *Pagination*, *Sorting*, *Filtering* bo'limlari
