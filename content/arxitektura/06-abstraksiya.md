# 06 — Abstraksiya darajalari

[← Oldingi: Bog'liqlik va bog'lanish](05-bogliqlik.md) · [Mundarija](README.md) · [Keyingi: Hujjatlashtirish: C4 va ADR →](07-c4-va-adr.md)

## Tushuncha

Abstraksiya — tafsilotni yashirib, **muhim**ini qoldirish. `sendEmail(to, subject, body)` — SMTP ulanishi, TLS, qayta urinishni yashiradi. Yaxshi abstraksiya fikrlash yukini kamaytiradi: chaqiruvchi faqat "nima" haqida o'ylaydi, "qanday" haqida emas.

Lekin abstraksiya **bepul emas**. Har qatlam:
- o'qishda bir qadam ko'proq ("bu aslida nima qiladi?"),
- o'zgartirishda qo'shimcha joy,
- noto'g'ri tanlansa — keraksiz cheklov.

## Nega shunday

Ikki xato bir xil zararli:

| Kam abstraksiya | Ortiqcha abstraksiya |
| --- | --- |
| Tafsilot hamma joyga tarqaladi (har joyda `fetch` + token + xato) | `IUserRepositoryFactoryProvider` — bitta amalga oshirish uchun 5 qatlam |
| O'zgarish ko'p joyda | Oddiy o'zgarish 5 faylda |
| | "Kelajakda kerak bo'ladi" — hech qachon kerak bo'lmaydi |

**Qoida:** abstraksiya **haqiqiy** o'zgaruvchanlikni yashirsin — bo'lishi mumkin bo'lganini emas.

## Psevdokod: qachon abstraksiya foyda

```text
// Foydali: haqiqatan almashtiriladi yoki test qilinadi
interface PaymentGateway { charge(amount, token) -> PaymentResult }
class ClickGateway implements PaymentGateway { ... }
class PaymeGateway implements PaymentGateway { ... }
class FakeGateway  implements PaymentGateway { ... }   // testlar uchun
```

```text
// Ortiqcha: bitta amalga oshirish, almashtirish rejasi yo'q
interface UserServiceInterface { find(id) }
class UserService implements UserServiceInterface { find(id) = repo.find(id) }
// Interfeys hech narsa yashirmaydi; keyin kerak bo'lsa — IDE bir daqiqada ajratadi
```

Uch savol — abstraksiya qo'shishdan oldin:

```text
1. Bugun kamida ikkita amalga oshirish bormi (test soxtasi ham hisoblanadi)?
2. Yashirilayotgan tafsilot haqiqatan o'zgaradimi (provayder, format, protokol)?
3. Abstraksiya chaqiruvchi kodini soddalashtiradimi yoki faqat ko'chiradimi?
Kamida bittasiga "ha" bo'lmasa — hali erta.
```

## Psevdokod: sizib chiquvchi abstraksiya

Joel Spolsky qonuni: *"Har qanday noan'anaviy abstraksiya ma'lum darajada sizib chiqadi."*

```text
// ORM "SQL'ni yashiradi"
for order in orders.findAll():          // 1 so'rov
    print(order.customer.name)          // + har buyurtmaga 1 so'rov → N+1
// Abstraksiya SQL'ni yashirdi, lekin uning narxini emas
```

```text
// HTTP klient "tarmoqni yashiradi"
user = api.getUser(id)                  // lokal funksiya kabi ko'rinadi
// Lekin: 3 soniya kutishi, timeout, 503, qisman javob mumkin — lokal funksiyada bular yo'q
```

Sizib chiqishga qarshi: abstraksiya **narxni ham** ko'rsatsin. `getUser()` emas — `fetchUser()` va natija turi `Result<User, NetworkError>` (17-bob); ORM'da — eager loading'ni aniq so'rash.

## Psevdokod: darajalarni aralashtirmaslik

Bitta funksiya ichida bitta abstraksiya darajasi:

```text
// Aralash: biznes qoidasi va past darajadagi tafsilot yonma-yon
function checkout(cart):
    if cart.total > 1_000_000: applyDiscount(cart, 5)
    conn = pg.connect("postgres://...")
    conn.query("BEGIN")
    stmt = conn.prepare("INSERT INTO orders ...")
    ...

// Bir daraja: har qadam — bir xil "balandlikda"
function checkout(cart):
    applyPromotions(cart)
    order = placeOrder(cart)
    requestPayment(order)
    return order
```

Ikkinchisini biznes egasi ham o'qiy oladi. Tafsilot — quyi funksiyalarda.

## Framework'larda

Framework'lar — tayyor abstraksiyalar to'plami. Ularning sizishini bilish muhim:

| Abstraksiya | Nimani yashiradi | Qayerda sizib chiqadi | Qayerda o'qish |
| --- | --- | --- | --- |
| Doctrine / Eloquent ORM | SQL | N+1, lazy loading, katta natijalar | [Symfony 37-bob](../symfony/37-ilgor-doctrine.md), [Laravel 17-bob](../laravel/17-eloquent-aloqalar.md) |
| `HttpClient` / `fetch` | Tarmoq | Timeout, `status: 0`, `null` params so'zma-so'z | [Angular 55](../angular/55-http-client.md), [57-bob](../angular/57-http-xatolar.md) |
| Signallar / reaktivlik | Yangilanish mexanizmi | Mutatsiya sezilmaydi, effect tartibi | [Angular 16-bob](../angular/16-signal-asoslari.md), [Vue 17-bob](../vue/17-reaktivlik-chuqur.md) |
| React Server Components | Server/klient chegarasi | Serializatsiya, "use client" chegarasi | [Next.js 4-bob](../nextjs/04-server-klient-chegarasi.md) |
| Router input binding | URL → komponent | Yo'q parametr → `undefined`, standart qiymat emas | [Angular 41-bob](../angular/41-parametrlar.md) |

Oxirgi qator — real misol: Angular 22'da `input('def')` routed komponentda standart qiymat bermaydi. Abstraksiya "URL parametrlari oddiy input" deydi, lekin router ularni `undefined` bilan qayta yozadi. Sizib chiqishni bilmasangiz — sirli xato.

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| Abstraksiyani erta qo'shish | Keyin almashtirish oson (agar to'g'ri taxmin qilingan bo'lsa) | Noto'g'ri taxmin — noto'g'ri shakl, uni olib tashlash qiyinroq |
| Kech qo'shish (ikkinchi holat paydo bo'lganda) | Haqiqiy ehtiyojdan kelib chiqadi | Birinchi amalga oshirishni refaktor qilish kerak |
| Framework abstraksiyasini o'rash (o'z `HttpService`) | Almashtirish, umumiy mantiq | Framework imkoniyatlari yashirinadi, hujjat yo'q |

"Uch qoida" (Rule of Three): birinchi marta — yozing, ikkinchi — ko'chiring, uchinchi — abstraksiya qiling.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Har klassga interfeys | Marosim, foyda yo'q | Faqat almashtirish/test ehtiyoji bo'lsa |
| Framework'ni "himoya qilish" uchun o'rash | Framework'ni almashtirish deyarli hech qachon bo'lmaydi | Domen chegarasida o'rash, hamma joyda emas |
| Tarmoq chaqiruvini lokal funksiya kabi ko'rsatish | Xato holatlari yashirinadi | Natija turida xatoni ifodalash |
| Bitta funksiyada turli darajalar | O'qish qiyin | Bir funksiya — bir daraja |
| ORM'ga ko'r-ko'rona ishonish | N+1, sekin sahifalar | So'rovlar logini kuzatish |

## Amaliyot

1. Loyihangizda bitta amalga oshirishga ega 3 ta interfeysni toping; ular nimani yashiradi?
2. Bitta sahifada ORM so'rovlar sonini o'lchang (Symfony Profiler, Laravel Debugbar) — N+1 bormi?
3. Bitta uzun funksiyani "bir daraja" qoidasi bilan qayta yozing.
4. Loyihangizdagi eng ko'p "sizib chiqqan" abstraksiyani yozing va hujjatlashtiring.

## Manbalar

- Joel Spolsky — *The Law of Leaky Abstractions* <https://www.joelonsoftware.com/2002/11/11/the-law-of-leaky-abstractions/>
- John Ousterhout — *A Philosophy of Software Design* (chuqur va sayoz modullar)
- Sandi Metz — *The Wrong Abstraction* <https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction>
