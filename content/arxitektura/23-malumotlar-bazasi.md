# 23 — Ma'lumotlar bazasi dizayni

[← Oldingi: Servis chegarasini topish](22-servis-chegarasi.md) · [Mundarija](README.md) · [Keyingi: Tranzaksiya va konkurentlik →](24-tranzaksiya.md)

## Tushuncha

Ma'lumotlar bazasi — ko'pincha tizimning **eng uzoq yashaydigan** qismi. Kod qayta yoziladi, framework almashadi, lekin ma'lumot va uning sxemasi yillar davomida qoladi. Shuning uchun DB dizayni — eng qimmat arxitektura qarorlaridan biri.

Asosiy qarorlar:

| Qaror | Variantlar |
| --- | --- |
| Model | Relyatsion (PostgreSQL, MySQL), hujjat (MongoDB), kalit-qiymat (Redis), grafik, vaqt qatorlari |
| Normalizatsiya darajasi | 3NF ↔ denormalizatsiya |
| Identifikatorlar | Auto-increment, UUID v4, UUID v7 / ULID |
| Indekslar | Qaysi so'rovlar uchun |
| Sxema o'zgarishi | Migratsiya siyosati |

## Nega shunday

Ma'lumot xatolari kod xatolaridan qimmatroq: kod xatosi keyingi deploy bilan tuzatiladi, **noto'g'ri saqlangan ma'lumot** esa qolgan, uni tozalash — migratsiya, skript, ba'zan qo'lda tekshiruv. Shuning uchun qoidalarni **DB darajasida** ham himoyalash kerak — faqat kodda emas.

## Psevdokod: sukut — relyatsion + normalizatsiya

Ko'p biznes ilovalari uchun sukut tanlov — PostgreSQL va 3NF:

```text
customers(id, email UNIQUE, name)
orders(id, customer_id → customers, status, placed_at)
order_lines(order_id → orders, product_id → products, qty CHECK (qty > 0), unit_price)
products(id, sku UNIQUE, title, price)

-- Qoidalar DB'da ham:
NOT NULL, UNIQUE, FOREIGN KEY, CHECK — kod xato qilsa ham ma'lumot buzilmaydi
```

`order_lines.unit_price` — `products.price` ning **nusxasi**, denormalizatsiya emas: buyurtma paytidagi narx — tarixiy fakt (22-bob).

## Psevdokod: denormalizatsiya — ongli ravishda

```text
-- Muammo: buyurtmalar ro'yxatida mijoz nomi va jami summa — har sahifada JOIN + SUM
SELECT o.id, c.name, SUM(l.qty * l.unit_price) FROM orders o JOIN customers c ... GROUP BY ...

-- Denormalizatsiya: orders.total, orders.customer_name
-- Narxi: ikki joyda — yangilash qoidasi kerak (trigger, kod, hodisa)
```

Qoida: avval **normalizatsiya + indeks + o'lchash**. Denormalizatsiya — faqat o'lchangan muammo uchun va yangilash mexanizmi bilan. Ko'p hollarda yaxshiroq yechim — alohida o'qish modeli (28-bob) yoki materializatsiyalangan view.

## Psevdokod: identifikatorlar

| Tur | Afzallik | Kamchilik |
| --- | --- | --- |
| Auto-increment | Kichik, tez, tartibli | Taxmin qilinadi (`/orders/1001` → `/orders/1002`), taqsimlangan tizimda noqulay |
| UUID v4 | Global noyob, taxmin qilinmaydi, klientda yaratish mumkin | Tasodifiy — B-tree indeks fragmentatsiyasi, kattaroq |
| **UUID v7 / ULID** | Noyob + vaqt bo'yicha tartibli — indeksga yaxshi | Yaratilish vaqti oshkor |

Amaliy tavsiya: tashqi (API, URL) identifikator — UUID v7; ichki birlashtirishlar uchun bigint ham mumkin. Auto-increment ID'ni URL'da ko'rsatish + avtorizatsiya tekshiruvi yo'qligi — BOLA zaifligi (77-bob).

## Psevdokod: indekslar — so'rovdan kelib chiqib

```text
So'rov:  SELECT * FROM orders WHERE customer_id = ? AND status = 'paid' ORDER BY placed_at DESC LIMIT 20
Indeks:  (customer_id, status, placed_at DESC)

Qoidalar:
- Indeks — aniq so'rov uchun; "har ustunga indeks" — yozish sekinlashadi
- Kompozit indeksda tartib muhim: tenglik → diapazon → saralash
- EXPLAIN ANALYZE — taxmin emas, o'lchov
- Tashqi kalitlarga (FK) — deyarli har doim indeks
```

## Psevdokod: migratsiya siyosati

```text
1. Har o'zgarish — versiyalangan migratsiya fayli, git'da
2. Migratsiya — oldinga; production'da "down" ga ishonmang — yangi oldinga migratsiya
3. Nol to'xtovli o'zgarish — expand/contract (71-bob):
   ustun nomini o'zgartirish ≠ bitta ALTER; ↓
   a) yangi ustun qo'shish   b) ikkalasiga yozish   c) eski ma'lumotni ko'chirish
   d) o'qishni yangiga o'tkazish   e) eski ustunni o'chirish (keyingi reliz)
4. Katta jadvalda indeks — CONCURRENTLY (PostgreSQL), qulflashsiz
```

## Framework'larda

| Mavzu | Symfony (Doctrine) | Laravel (Eloquent) |
| --- | --- | --- |
| Sxema va migratsiya | [Symfony 15](../symfony/15-doctrine-asoslari.md), [16-bob](../symfony/16-migratsiyalar.md) | [Laravel 14](../laravel/14-malumotlar-bazasi.md), [15-bob](../laravel/15-migratsiyalar.md) |
| Aloqalar va N+1 | [Symfony 18](../symfony/18-aloqalar.md), [37-bob](../symfony/37-ilgor-doctrine.md) | [Laravel 17-bob](../laravel/17-eloquent-aloqalar.md) (eager loading) |
| So'rov yozish | DQL / QueryBuilder — [Symfony 17-bob](../symfony/17-repository-va-dql.md) | Query Builder — [Laravel 14-bob](../laravel/14-malumotlar-bazasi.md) |
| TypeScript ORM | — | [Next.js 32 (Prisma)](../nextjs/32-prisma.md), [33 (Drizzle)](../nextjs/33-drizzle.md) |

ORM avtomatik yaratgan sxemani (`doctrine:schema:update`, "auto migrate") production'da ishlatmang — har o'zgarish ko'rib chiqiladigan migratsiya bo'lsin.

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| Normalizatsiya | Bir haqiqat manbai, izchillik | JOIN'lar, murakkab o'qish so'rovlari |
| Denormalizatsiya | Tez o'qish | Nomuvofiqlik xavfi, yangilash mantiqi |
| Relyatsion DB | Tranzaksiyalar, cheklovlar, SQL kuchi | Sxema o'zgarishi rejali bo'lishi kerak |
| Hujjat DB | Moslashuvchan sxema | Cheklovlar kodda, JOIN'siz — ko'pincha takrorlanish |
| DB darajasidagi cheklovlar | Ma'lumot himoyasi | Xato xabarlari kamroq qulay (kodda ham tekshirish) |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Qoidalar faqat kodda | Skript, boshqa servis, bug — ma'lumotni buzadi | NOT NULL, UNIQUE, FK, CHECK |
| Pul `FLOAT` | Yaxlitlash xatolari | `NUMERIC` yoki butun (tiyin) |
| Har ustunga indeks | Yozish sekin | So'rovdan kelib chiqib |
| `ALTER TABLE ... RENAME` production'da bitta qadam | Eski kod yiqiladi | Expand/contract |
| Vaqt zonasi siz sana | Soatlar chalkashadi | `timestamptz`, UTC saqlash |
| Soft delete hamma jadvalda | Har so'rovda `WHERE deleted_at IS NULL`, UNIQUE muammolari | Faqat kerak joyda (31-bob) |

## Amaliyot

1. Eng muhim 3 jadval uchun barcha biznes qoidalarini DB cheklovi sifatida yozish mumkinmi — tekshiring.
2. Eng sekin 5 so'rov uchun `EXPLAIN ANALYZE` — indeks yetishmayaptimi?
3. URL'da auto-increment ID ko'rinadigan joylarni toping; avtorizatsiya tekshiruvi bormi?
4. Oxirgi ustun o'zgarishingiz nol to'xtovli bo'lganmi? Expand/contract rejasini yozing.

## Manbalar

- Martin Kleppmann — *Designing Data-Intensive Applications*, 2–3-boblar
- Markus Winand — *Use The Index, Luke* <https://use-the-index-luke.com>
- RFC 9562 — UUID (v7) <https://www.rfc-editor.org/rfc/rfc9562>
