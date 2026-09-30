# 13 — Domen modeli

[← Oldingi: Tiplar orqali dizayn](12-tiplar.md) · [Mundarija](README.md) · [Keyingi: DDD: til va kontekst →](14-ddd.md)

## Tushuncha

Domen modeli — biznes tushunchalari va **qoidalari**ni kodda ifodalash. Uning to'rt qurilish bloki (DDD "taktik" naqshlari):

| Blok | Nima | Misol |
| --- | --- | --- |
| **Entity** | Identifikatorga ega, vaqt o'tishi bilan o'zgaradi | `Order#42` — holati o'zgarsa ham o'sha buyurtma |
| **Value object** | Identifikatorsiz, qiymati bilan teng, o'zgarmas | `Money(100 000, UZS)`, `Address`, `DateRange` |
| **Aggregate** | Bir butun sifatida o'zgaradigan entity'lar guruhi, bitta "ildiz" orqali | `Order` + `OrderLine` lar |
| **Invariant** | Doim to'g'ri bo'lishi shart bo'lgan qoida | "Buyurtma summasi = qatorlar yig'indisi", "to'langan buyurtmaga qator qo'shilmaydi" |

## Nega shunday

Ko'p ilovalarda "model" — faqat ma'lumot to'plami (getter/setter), qoidalar esa xizmatlarda tarqalgan. Martin Fowler buni **anemic domain model** deydi:

```text
order.setStatus("paid")                  // kim tekshiradi — to'lov bo'lganmi?
order.getLines().add(newLine)            // to'langan buyurtmaga qator qo'shildi — hech narsa to'xtatmadi
order.setTotal(order.getTotal() + 10)    // summa qatorlarga mos kelmay qoldi
```

Har xizmat qoidalarni **o'zi** eslab qolishi kerak — va birortasi unutadi. Boy domen modelida qoidalar ob'ektning o'zida, uni noto'g'ri holatga keltirib bo'lmaydi.

## Psevdokod: boy entity va aggregate

```text
class Order:                                   // aggregate ildizi
    private id: OrderId
    private status: OrderStatus
    private lines: OrderLine[]

    static place(customerId, items): Order
        if items.isEmpty(): error "Bo'sh buyurtma"
        order = new Order(OrderId.new(), Draft, items.map(OrderLine.from))
        order.record(OrderPlaced(order.id))
        return order

    addLine(product, qty):
        if status != Draft: error "Faqat qoralamaga qo'shish mumkin"
        if qty <= 0: error "Miqdor musbat bo'lsin"
        lines.push(OrderLine(product, qty))

    markPaid(payment: PaymentConfirmation):
        if status != Draft: error "Allaqachon to'langan yoki bekor"
        if payment.amount != total(): error "Summa mos emas"
        status = Paid
        record(OrderPaid(id, payment.id))

    total(): Money = lines.sum(l => l.subtotal())     // saqlanmaydi — har doim hisoblanadi
```

Farq: `setStatus` yo'q — faqat **biznes amallari** (`markPaid`, `cancel`). Har amal o'z invariantlarini tekshiradi.

## Psevdokod: aggregate chegarasi

```text
Qoidalar (Vaughn Vernon):
1. Invariantlar bitta aggregate ichida himoyalanadi
2. Tashqaridan faqat ildizga murojaat (OrderLine ni to'g'ridan-to'g'ri o'zgartirib bo'lmaydi)
3. Boshqa aggregate'ga — ID orqali (Order ichida Customer ob'ekti emas, customerId)
4. Bitta tranzaksiya — bitta aggregate
5. Aggregate'lar orasidagi izchillik — hodisalar orqali, keyinroq (eventual)
```

```text
// Noto'g'ri: bitta "aggregate" butun dunyoni o'z ichiga oladi
class Customer { orders: Order[]; addresses; payments; reviews; wishlist }
// Har o'zgarish — butun graf yuklanadi va qulflanadi

// To'g'ri: kichik aggregate'lar, ID bilan bog'langan
class Customer { id; name; defaultAddressId }
class Order    { id; customerId; lines }
```

Aggregate qanchalik **kichik** bo'lsa — shunchalik yaxshi: kam qulflash, kam konflikt, tez yuklash.

## Psevdokod: value object

```text
class Money:
    constructor(amount: integer, currency): immutable
    add(other): Money
        if currency != other.currency: error "Valyutalar har xil"
        return Money(amount + other.amount, currency)
    equals(other) = amount == other.amount and currency == other.currency

class DateRange(start, end):
    constructor: if end < start: error
    overlaps(other): ...
```

Value object — qoidani **bir marta** yozish joyi: "sana oralig'i teskari bo'lmaydi" endi hech qayerda qayta tekshirilmaydi.

## Framework'larda

ORM'lar domen modeliga ta'sir qiladi — ba'zan yordam beradi, ba'zan halaqit:

| Framework | Domen modeliga munosabat | Qayerda |
| --- | --- | --- |
| Doctrine (Symfony) | **Data Mapper** — entity oddiy PHP klass, ORM'dan mustaqil; boy model oson | [Symfony 15-bob](../symfony/15-doctrine-asoslari.md), [18-bob](../symfony/18-aloqalar.md) |
| Eloquent (Laravel) | **Active Record** — model = jadval qatori + `save()`; anemic modelga moyil, `$fillable` bilan har maydon ochiq | [Laravel 16-bob](../laravel/16-eloquent-asoslari.md) |
| Frontend | Domen qoidalari odatda backend'da; frontend'da — forma sxemalari va hisob-kitoblar (`computed`) | [Angular 50-bob](../angular/50-signal-forms-sxema.md) (`addressSchema` — domen qoidasi) |

Eloquent bilan boy model ham mumkin: `setStatus` o'rniga `markPaid()` metodi, `$guarded` bilan to'g'ridan-to'g'ri tayinlashni cheklash, qoidalarni model metodlarida. Lekin Active Record `$order->status = 'x'; $order->save()` ni doim imkon qiladi — intizom kerak.

Frontend'da "domen modeli" ko'pincha **UI modeli** bilan aralashadi — ular farqli (68-bob): API'dan kelgan `Order` va forma modelidagi `OrderDraft` bir narsa emas.

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| Anemic model + xizmatlar | Oddiy, CRUD uchun yetarli | Qoidalar tarqaladi, invariant buzilishi |
| Boy domen modeli | Qoidalar bir joyda, noto'g'ri holat imkonsiz | Ko'proq dizayn; ORM bilan moslash |
| Katta aggregate | Barcha qoidalar bir tranzaksiyada | Qulflash, sekinlik, konfliktlar |
| Kichik aggregate + hodisalar | Masshtab, kam konflikt | Eventual consistency (27-bob) |

**CRUD uchun boy model shart emas.** Admin paneldagi "sozlamalar" jadvali — Active Record yetarli. Boy model — murakkab qoidalar bor joyda (buyurtma, to'lov, ombor, bron).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Har maydonga setter | Invariantlar himoyasiz | Biznes amallari metodlari |
| Aggregate ichida boshqa aggregate ob'ekti | Katta graf, noaniq tranzaksiya chegarasi | ID bilan murojaat |
| Hisoblanadigan qiymatni saqlash (`total`) | Nomuvofiqlik | Hisoblash yoki qat'iy yangilash bir joyda |
| Pul, sana oralig'i — primitivlar | Qoidalar takrorlanadi | Value object (12-bob) |
| Hamma joyda boy model | CRUD'ga ortiqcha murakkablik | Murakkab qoidalar bor joyda |

## Amaliyot

1. Eng muhim entity'ngizdagi barcha setter'larni toping va ularni biznes amallariga almashtirish rejasini tuzing.
2. Bitta invariantni ("to'langan buyurtma o'zgarmaydi") entity ichiga ko'chiring va unit test yozing.
3. Aggregate chegarasini chizing: bitta tranzaksiyada nechta jadval o'zgaradi?
4. Pul uchun `Money` value object kiriting.

## Manbalar

- Eric Evans — *Domain-Driven Design*, II qism (taktik naqshlar)
- Vaughn Vernon — *Effective Aggregate Design* <https://www.dddcommunity.org/library/vernon_2011/>
- Martin Fowler — *AnemicDomainModel* <https://martinfowler.com/bliki/AnemicDomainModel.html>
