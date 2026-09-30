# 08 — SOLID amalda

[← Oldingi: Hujjatlashtirish: C4 va ADR](07-c4-va-adr.md) · [Mundarija](README.md) · [Keyingi: Kompozitsiya va meros →](09-kompozitsiya.md)

## Tushuncha

SOLID — Robert Martin tomonidan jamlangan beshta tamoyil. Ular qoida emas, **og'riqqa qarshi dori**: har biri aniq bir muammoni yechadi va noto'g'ri qo'llansa, o'z muammosini keltiradi.

| Tamoyil | Qisqasi | Qaysi og'riq |
| --- | --- | --- |
| **S** — Single Responsibility | Modulning o'zgarish uchun bitta sababi bo'lsin | Bir o'zgarish boshqa narsani buzadi |
| **O** — Open/Closed | Kengaytirishga ochiq, o'zgartirishga yopiq | Har yangi holat uchun eski kodni tahrirlash |
| **L** — Liskov Substitution | Voris ota o'rnida ishlasin | "Aslida bu turda boshqacha" — `instanceof` tekshiruvlari |
| **I** — Interface Segregation | Mijoz ishlatmaydigan metodga bog'lanmasin | Katta interfeys — hamma amalga oshiruvchi ortiqcha narsani yozadi |
| **D** — Dependency Inversion | Yuqori daraja past darajaga emas, abstraksiyaga tayansin | Biznes qoidasi DB/HTTP tafsilotiga bog'langan |

## Nega shunday

SOLID'ning umumiy maqsadi — 5-bobdagi **bog'lanishni kamaytirish** va **o'zgarishni lokal qilish**. Uni "har klassga interfeys", "har metodga klass" deb tushunish — 6-bobdagi ortiqcha abstraksiya.

## Psevdokod: S — o'zgarish sababi

"Bitta vazifa" emas — **bitta o'zgarish sababi** (bitta "aktyor"):

```text
class Invoice:
    calculateTotal()      // buxgalteriya qoidalari o'zgarsa
    renderPdf()           // dizayn o'zgarsa
    saveToDatabase()      // sxema o'zgarsa
// Uch aktyor — uch sabab. Dizayner PDF'ni o'zgartirib, hisobni buzishi mumkin.
```

```text
class Invoice:        calculateTotal()        // domen
class InvoicePdf:     render(invoice)         // taqdimot
class InvoiceRepo:    save(invoice)           // saqlash
```

Oshirib yuborish: `InvoiceTotalCalculator`, `InvoiceTaxCalculator`, `InvoiceDiscountCalculator` — ular doim birga o'zgaradi, demak bitta sabab — ajratish zararli.

## Psevdokod: O — yangi holat, eski kod o'zgarmaydi

```text
function shippingCost(order):
    if order.method == "courier": return 25_000
    if order.method == "pickup":  return 0
    if order.method == "post":    return 15_000 + order.weight * 1000
    // yangi usul — yana bir if, shu funksiya tahrirlanadi
```

```text
interface ShippingMethod { cost(order) }
registry = { courier: Courier(), pickup: Pickup(), post: Post() }
function shippingCost(order) = registry[order.method].cost(order)
// yangi usul — yangi klass + ro'yxatga yozish; mavjud kod tegilmaydi
```

Qachon **kerak emas**: holatlar 2–3 ta va kam o'zgaradi. `if/switch` o'qish uchun oddiyroq. O/C — **tez-tez qo'shiladigan** o'zgaruvchanlik uchun (to'lov usullari, eksport formatlari, bildirishnoma kanallari).

## Psevdokod: L — voris va'dani buzmasin

```text
class Rectangle { setWidth(w); setHeight(h); area() }
class Square extends Rectangle { setWidth(w) { width = height = w } }

function test(r: Rectangle):
    r.setWidth(5); r.setHeight(4)
    assert r.area() == 20        // Square uchun 16 — va'da buzildi
```

Amaliy belgisi — chaqiruvchi kodda tur tekshiruvi:

```text
if file instanceof ReadOnlyFile: skip else file.save()
// ReadOnlyFile "File" emas — u save va'dasini bera olmaydi
```

Yechim — merosni emas, kichikroq interfeyslarni (`Readable`, `Writable`) ishlatish (I va 9-bob).

## Psevdokod: I — kichik interfeyslar

```text
interface Storage { read(k); write(k, v); delete(k); listAll(); backup(); migrate() }
// Kesh uchun faqat read/write kerak — lekin 6 metodni amalga oshirish majbur

interface Reader { read(k) }
interface Writer { write(k, v) }
class Cache(reader: Reader, writer: Writer)
```

## Psevdokod: D — biznes tafsilotdan mustaqil

```text
// Past daraja yuqoriga kirib ketgan
class PlaceOrder:
    run(cmd):
        pg = new PostgresConnection("...")
        pg.insert("orders", ...)
        new SmtpMailer("...").send(...)

// Teskari: biznes o'z ehtiyojini interfeys sifatida e'lon qiladi
interface Orders { save(order) }             // biznes qatlamida e'lon qilingan
interface Notifier { orderPlaced(order) }

class PlaceOrder(orders: Orders, notifier: Notifier):
    run(cmd): order = Order.place(cmd); orders.save(order); notifier.orderPlaced(order)

class PostgresOrders implements Orders { ... }   // infratuzilma qatlamida
```

Muhim nuqta — **interfeysning egasi**: u biznes qatlamida turadi, infratuzilma unga moslashadi. Bog'liqlik strelkasi "teskari" — shuning uchun *inversion*. Bu olti burchakli va Clean arxitekturaning asosi (15-bob).

## Framework'larda

| Tamoyil | Framework'da tabiiy ko'rinishi | Qayerda |
| --- | --- | --- |
| S | Controller yupqa, mantiq xizmatda | [Symfony 10-bob](../symfony/10-kontrollerlar.md), [Laravel 11-bob](../laravel/11-kontrollerlar.md) |
| O | Tagged xizmatlar (strategiyalar ro'yxati), `multi` provayderlar | [Symfony 6-bob](../symfony/06-container-chuqur.md), [Angular 36-bob](../angular/36-provayder-turlari.md) (`multi: true`) |
| L | Komponent vorislik o'rniga kompozitsiya | [React 14-bob](../react/14-kompozitsiya.md), [Vue 26-bob](../vue/26-slotlar.md) |
| I | Kichik composable/hook — bitta vazifa | [Vue 29-bob](../vue/29-composables.md), [React 26-bob](../react/26-custom-hooklar.md) |
| D | Interfeysni konteynerga bog'lash | [Laravel 5-bob](../laravel/05-service-container.md), [Angular 36-bob](../angular/36-provayder-turlari.md) (abstrakt klass token) |

Frontend'da S ning eng ko'p buziladigan joyi — "hamma narsa qiladigan" komponent: HTTP, holat, validatsiya, navigatsiya, ko'rinish bir faylda. Yechim — ko'rinish komponentda, qolgani xizmat/store/composable'da ([Angular 39-bob](../angular/39-di-naqshlari.md)).

## Trade-off

| Tamoyil | To'g'ri qo'llanganda | Oshirib yuborilganda |
| --- | --- | --- |
| S | Lokal o'zgarishlar | Mayda klasslar dengizi, oqimni topib bo'lmaydi |
| O | Yangi holat — yangi fayl | 2 holat uchun strategiya + registry + factory |
| L | Ishonchli polimorfizm | — (buzilishi xavfli, oshirib yuborish kam) |
| I | Aniq bog'liqliklar | Har metodga interfeys |
| D | Test, almashtirish | Bitta amalga oshirish uchun interfeys (6-bob) |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| S = "bitta metod" | Mantiqan bir butun narsa parchalanadi | Bitta o'zgarish sababi |
| O/C ni hamma `if` ga | Keraksiz murakkablik | Tez-tez kengayadigan joylarga |
| Merosni kodni qayta ishlatish uchun | L buziladi | Kompozitsiya (9-bob) |
| Interfeysni infratuzilma qatlamida e'lon qilish | D ma'nosi yo'qoladi | Biznes egasi — interfeys egasi |
| SOLID'ni kod review'da "qoida" sifatida | Kontekstsiz bahs | "Qaysi og'riqni yechadi?" savoli |

## Amaliyot

1. Eng katta klass/komponentingizni oling: nechta "aktyor" uni o'zgartiradi? Ajrating.
2. Tez-tez kengayadigan bitta `switch` ni toping (to'lov, eksport) — strategiyaga o'tkazish kerakmi?
3. Kodda `instanceof` / tur tekshiruvlarini qidiring — L buzilishi bormi?
4. Biznes qatlamidagi bitta klass infratuzilmani (`new PDO`, `fetch`) to'g'ridan-to'g'ri yaratayotganini toping va D bilan tuzating.

## Manbalar

- Robert C. Martin — *Clean Architecture*, III qism (SOLID)
- Barbara Liskov, Jeannette Wing — *A Behavioral Notion of Subtyping* (1994)
- Dan North — *CUPID — for joyful coding* (SOLID'ga muqobil qarash) <https://dannorth.net/cupid-for-joyful-coding/>
