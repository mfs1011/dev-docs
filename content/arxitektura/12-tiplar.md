# 12 — Tiplar orqali dizayn

[← Oldingi: Modulning ochiq API'si](11-ochiq-api.md) · [Mundarija](README.md) · [Keyingi: Domen modeli →](13-domen-modeli.md)

## Tushuncha

Tiplar — nafaqat "string yoki number" tekshiruvi. Yaxshi tiplar **biznes qoidalarini** kodlashtiradi, shunda noto'g'ri holatni **yozib bo'lmaydi** — kompilyator (yoki statik tahlil) xatoni ish vaqtidan oldin ushlaydi.

Yaron Minsky qoidasi: *"Noto'g'ri holatlarni ifodalab bo'lmaydigan qiling"* (make illegal states unrepresentable).

## Nega shunday

Tiplar zaif bo'lsa, qoidalar kod bo'ylab `if` tekshiruvlari sifatida tarqaladi — va birortasi unutiladi:

```text
type Order = {
  status: string            // "paid"? "PAID"? "payed"?
  paidAt: Date | null       // status "paid" bo'lsa null bo'lmasligi kerak — tip buni bilmaydi
  trackingNumber: string | null   // faqat "shipped" da bo'ladi
}
```

Bu tipda `{ status: "shipped", paidAt: null, trackingNumber: null }` — yozish mumkin, lekin ma'nosiz. Har joyda tekshirish kerak.

## Psevdokod: holatlarni tipga aylantirish

**Discriminated union** (tagged union) — har holat o'z maydonlari bilan:

```text
type Order =
  | { status: "draft";   items: Item[] }
  | { status: "paid";    items: Item[]; paidAt: Date }
  | { status: "shipped"; items: Item[]; paidAt: Date; trackingNumber: string }
  | { status: "cancelled"; items: Item[]; reason: string }

function label(o: Order):
    switch o.status:
        "draft":     "Qoralama"
        "paid":      "To'langan " + format(o.paidAt)           // paidAt — aniq bor
        "shipped":   "Yo'lda: " + o.trackingNumber              // trackingNumber — aniq bor
        "cancelled": "Bekor: " + o.reason
        // yangi holat qo'shilsa va bu yerda unutilsa — kompilyator xatosi (exhaustive check)
```

## Psevdokod: primitive obsession'dan chiqish

```text
function transfer(from: string, to: string, amount: number)
transfer(toId, fromId, 100)     // argumentlar almashib ketdi — tip jim
transfer(a, b, -500)            // manfiy summa — tip jim
transfer(a, b, 100.004)         // so'm tiyinlari? — tip jim
```

**Branded tip** (nominal tip) va **value object**:

```text
type AccountId = string & { __brand: "AccountId" }
type Money = { amount: integer /* tiyinda */, currency: "UZS" | "USD" }

function money(amount, currency): Money
    if amount < 0: error "Summa manfiy bo'lmaydi"
    return { amount: round(amount * 100), currency }

function transfer(from: AccountId, to: AccountId, amount: Money)
```

Endi `transfer(orderId, ...)` — kompilyatsiya xatosi (OrderId ≠ AccountId), noto'g'ri summa — yaratilish paytida rad etiladi.

## Psevdokod: parse, don't validate

Alexis King tamoyili: kirish ma'lumotini **tekshirib, keyin xom holda ishlatish** o'rniga — **bir marta tipli qiymatga aylantiring**:

```text
// validate: tekshiruv natijasi yo'qoladi
function handle(input: unknown):
    if not isValidEmail(input.email): error
    sendWelcome(input.email)        // tip hali ham "string" — keyingi funksiya yana tekshiradimi?

// parse: tekshiruv tipga "muhrlanadi"
function parseEmail(s: string): Email | Error
function handle(input: unknown):
    email = parseEmail(input.email) or return error
    sendWelcome(email)              // sendWelcome(Email) — xom string qabul qilmaydi
```

Tizim **chegaralarida** (HTTP so'rov, API javobi, fayl, navbat xabari) — parse. Ichkarida — faqat tipli qiymatlar.

## Framework'larda

| Texnika | Frontend (TypeScript) | Backend (PHP) |
| --- | --- | --- |
| Discriminated union | Holat mashinalari, `@switch` + `@default never` — [Angular 10-bob](../angular/10-if-va-switch.md) | PHP 8.1 `enum` + `match` (exhaustive — tashlanmagan holatda `UnhandledMatchError`) |
| Tip toraytirish | `applyWhenValue` + type guard — [Angular 50-bob](../angular/50-signal-forms-sxema.md) | PHPStan/Psalm `@phpstan-assert` |
| Parse at boundary | Zod `parse` `httpResource` da — [Angular 57-bob](../angular/57-http-xatolar.md), Zod + Signal Forms — [49-bob](../angular/49-signal-forms-validatsiya.md) | Symfony Serializer + Validator DTO — [Symfony 20-bob](../symfony/20-serializer-va-dto.md); Laravel FormRequest — [Laravel 13-bob](../laravel/13-validatsiya.md) |
| Value object | Branded tiplar | Doctrine `#[Embeddable]`, readonly klasslar |
| Literal tuzog'i | NgRx `addEntity({ done: false })` → literal `false`, TS2345 — [Angular 61-bob](../angular/61-ngrx.md) | — |

Muhim nozik joy — **tip e'lon qilish ≠ tekshiruv**: `http.get<Product>(url)` faqat TypeScript'ga va'da beradi, server boshqa shakl qaytarsa ham kompilyator jim ([Angular 55-bob](../angular/55-http-client.md)). Chegarada runtime parse kerak.

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| Primitivlar (`string`, `number`) | Tez, oddiy | Qoidalar tarqaladi, argument almashishi |
| Kuchli tiplar (union, branded, VO) | Xatolar kompilyatsiyada, kod o'zini hujjatlaydi | Ko'proq tip kodi, o'giruvchilar (DB ↔ VO) |
| Runtime parse (Zod, Serializer) | Chegarada kafolat | Ish vaqtidagi xarajat (odatda kichik), sxema takrorlanishi |
| Sxemadan tip generatsiyasi (OpenAPI) | Frontend va backend bir manbadan | Qurilish jarayoni murakkablashadi (54-bob) |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Holat — `string`, bog'liq maydonlar — `nullable` | Ma'nosiz kombinatsiyalar | Discriminated union |
| Pul — `float` | Yaxlitlash xatolari | Butun son (tiyin) + valyuta |
| `as Type` bilan API javobini "tiplash" | Runtime'da boshqa shakl | Chegarada parse |
| Har joyda qayta validatsiya | Takror, nomuvofiqlik | Bir marta parse, keyin tip |
| `any` / `mixed` "vaqtincha" | Doimiy bo'lib qoladi | `unknown` + parse |

## Amaliyot

1. Loyihangizdagi eng muhim entity holatlarini discriminated union bilan yozib ko'ring — nechta "imkonsiz" kombinatsiya yo'qoldi?
2. Pul yoki ID uchun bitta branded tip / value object kiriting.
3. Bitta API chegarasiga runtime parse (Zod / DTO + Validator) qo'shing.
4. `as` / `@var` bilan "majburan tiplash" joylarini qidirib, ro'yxatini tuzing.

## Manbalar

- Yaron Minsky — *Effective ML* (make illegal states unrepresentable)
- Alexis King — *Parse, don't validate* <https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/>
- Scott Wlaschin — *Domain Modeling Made Functional*
