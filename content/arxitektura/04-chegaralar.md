# 04 — Chegaralar: modul, kontekst, servis

[← Oldingi: Talabdan qarorga](03-talabdan-qarorga.md) · [Mundarija](README.md) · [Keyingi: Bog'liqlik va bog'lanish →](05-bogliqlik.md)

## Tushuncha

Arxitekturaning eng muhim qarori — **chiziqni qayerga tortish**: qaysi kod birga yashaydi, qaysi biri alohida, ular qanday gaplashadi.

Chegaraning uch darajasi:

| Daraja | Nima | O'tish narxi | Misol |
| --- | --- | --- | --- |
| **Modul** | Bitta kod bazasi ichidagi papka/paket, ochiq API bilan | Funksiya chaqiruvi | `orders/`, `billing/` |
| **Bounded context** | Bitta model va til amal qiladigan soha (DDD) | Model tarjimasi | "Buyurtma" savdoda va omborda boshqa narsa |
| **Servis** | Alohida deploy, alohida jarayon, tarmoq orqali | Tarmoq: kechikish, xato, versiya | `orders-service` |

Ular mustaqil: bitta servisda bir nechta kontekst bo'lishi mumkin (modulli monolit, 20-bob), bitta kontekst bir nechta servisga bo'linishi ham mumkin (ko'pincha xato).

## Nega shunday

Chegarasiz kodda hamma narsa hamma narsaga bog'liq: `Order` klassi to'lovni, emailni, omborni, PDF'ni biladi. O'zgarish tarqaladi, test qilish qiyin, jamoalar bir-biriga xalaqit beradi.

Yaxshi chegara ikki xususiyatga ega:

- **Ichki bog'liqlik yuqori** (cohesion) — birga o'zgaradigan narsa birga turadi.
- **Tashqi bog'lanish past** (coupling) — boshqa modul ichki tuzilishni bilmaydi, faqat ochiq API'ni.

Chegara qayerda ekanini **o'zgarish** ko'rsatadi: "bu ikki narsa odatda birga o'zgaradimi?" Ha — bir modul. Yo'q — alohida.

## Psevdokod: chegara nima beradi

```text
// Chegarasiz: billing buyurtma jadvaliga to'g'ridan-to'g'ri kiradi
billing.createInvoice(orderId):
    row = db.query("SELECT total, customer_email, status FROM orders WHERE id = ?", orderId)
    if row.status != "paid": error
    ...
// orders jadvalida "status" → "state" deb o'zgarsa — billing buziladi.
// Buyurtma jamoasi buni bilmaydi.
```

```text
// Chegara bilan: billing faqat ochiq API'ni biladi
module orders:
    public function getOrderSummary(orderId) -> OrderSummary { id, total, customerEmail, isPaid }
    // ichki jadval, ustun nomlari, holat mashinasi — yopiq

billing.createInvoice(orderId):
    summary = orders.getOrderSummary(orderId)
    if not summary.isPaid: error
    ...
// orders ichini xohlagancha o'zgartirish mumkin — shartnoma (OrderSummary) saqlansa.
```

Farq — **qaysi o'zgarish kimga ta'sir qiladi**. Chegara — ta'sir radiusini cheklash vositasi.

## Psevdokod: chegarani qayerga qo'yish — evristikalar

```text
Birga turishi kerak, agar:
  - birga o'zgaradi (bir feature — bir modul)
  - bitta invariantni birga himoya qiladi ("buyurtma summasi = qatorlar yig'indisi")
  - bitta tilni ishlatadi (bir so'z — bir ma'no)

Ajratish kerak, agar:
  - turli tezlikda o'zgaradi (to'lov qoidalari yiliga bir marta, katalog — har kuni)
  - turli egalar (jamoalar)
  - turli sifat talablari (hisobot — sekin bo'lsa mayli, checkout — yo'q)
  - bir so'z turli ma'noda ("mahsulot" katalogda — tavsif, omborda — qoldiq)
```

## Framework'larda

**Backend** — modul chegarasi papka va namespace orqali, framework majburlamaydi:

```text
src/
├── Orders/        Domain/, Application/, Infrastructure/, OrdersApi.php  ← ochiq API
├── Billing/
└── Catalog/
```

- Symfony'da bu tuzilma va bundle'lar haqida — [Symfony 39-bob](../symfony/39-arxitektura.md).
- Laravel'da `app/` ichida domen papkalari, har modul o'z service provider'i bilan ulanadi — [Laravel 6-bob](../laravel/06-service-provider.md).
- Chegarani majburlash: Deptrac (PHP) — "Billing Orders\Infrastructure ga murojaat qilmasin" qoidasi CI'da.

**Frontend** — xuddi shu g'oya, boshqa vositalar:

- Angular: marshrut + `loadChildren` — bo'lim chegarasi ham kod chegarasi, ham bundle chegarasi ([Angular 43-bob](../angular/43-lazy-loading.md)); holat chegarasi — injector darajasi ([37-bob](../angular/37-injector-iyerarxiyasi.md)).
- React: feature papkalari va ochiq `index.ts` — [React 34-bob](../react/34-arxitektura.md).
- Vue: feature modullar va composable'lar — [Vue 29-bob](../vue/29-composables.md).
- Frontend chegaralarining eng tizimli metodologiyasi — **Feature-Sliced Design** (alohida qo'llanma).

Umumiy qoida ikki tomonda bir xil: **modulning ochiq API'si** (11-bob) — bitta kirish nuqtasi (`OrdersApi`, `index.ts`), qolgani ichki.

## Trade-off

| Chegara | Yutuq | Narx |
| --- | --- | --- |
| Kam chegara (bitta katta modul) | Oddiy, tez boshlash | O'sganda "big ball of mud" |
| Ko'p mayda chegara | Izolyatsiya | Har o'zaro ta'sir — API, DTO, tarjima; ortiqcha marosim |
| Noto'g'ri chegara | — | **Eng qimmat**: har feature ikki modulni birga o'zgartiradi — chegara foyda emas, zarar |
| Servis chegarasi (tarmoq) | Mustaqil deploy va masshtab | Kechikish, qisman xato, taqsimlangan tranzaksiya (21-bob) |

Qoida: chegarani avval **modul** sifatida qo'ying — arzon va qaytariladigan. Servisga faqat modul chegarasi vaqt sinovidan o'tgach va aniq sabab bo'lsa (22-bob).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Texnik qatlam bo'yicha chegara (`controllers/`, `services/`) | Bitta feature hamma papkaga tarqaladi | Feature/domen bo'yicha (16-bob) |
| Boshqa modul jadvaliga to'g'ridan-to'g'ri SQL | Yashirin bog'lanish | Ochiq API yoki hodisa |
| "Common/Shared" hamma narsa uchun | Yangi "big ball of mud" | Shared — faqat biznesdan xabarsiz narsalar |
| Birinchi kundan mikroservislar | Noto'g'ri chegara tarmoq bilan "betonlanadi" | Avval modulli monolit |
| Chegara bor, majburlash yo'q | 3 oyda buziladi | Deptrac / ESLint boundaries CI'da |

## Amaliyot

1. Loyihangizdagi eng oxirgi 5 feature'ni oling: har biri nechta papkaga tegdi? 3+ bo'lsa — chegara noto'g'ri bo'lishi mumkin.
2. Bir so'zni tanlang ("buyurtma", "foydalanuvchi") va u turli modullarda nimani anglatishini yozing.
3. Bitta modul uchun ochiq API faylini yarating; boshqa modullardan ichki importlarni shunga yo'naltiring.
4. Deptrac yoki ESLint bilan bitta chegara qoidasini CI'ga qo'shing.

## Manbalar

- Eric Evans — *Domain-Driven Design*, IV qism (Strategic Design)
- Vlad Khononov — *Learning Domain-Driven Design*, 3-bob (bounded context)
- Deptrac: <https://qossmic.github.io/deptrac/>
