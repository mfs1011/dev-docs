# 17 — Xatolar modeli

[← Oldingi: Vertical slice va feature-based](16-vertical-slice.md) · [Mundarija](README.md) · [Keyingi: Konfiguratsiya va muhitlar →](18-konfiguratsiya.md)

## Tushuncha

Har tizimda xato bo'ladi. Arxitektura savoli — xato **qanday ifodalanadi**, **qayerda ushlanadi** va **kimga qanday ko'rsatiladi**.

Xatolarning uch turi — ularni farqlash asosiy qaror:

| Tur | Misol | Kim hal qiladi | Qanday ifodalash |
| --- | --- | --- | --- |
| **Biznes (kutilgan) xato** | "Omborda yo'q", "Summa limitdan oshdi", "Email band" | Foydalanuvchi | Natija qiymati, aniq tip |
| **Texnik vaqtinchalik xato** | Tarmoq uzildi, timeout, 503 | Tizim (qayta urinish) | Exception / xato qiymat + retry siyosati |
| **Dasturiy xato (bug)** | `null` ga murojaat, noto'g'ri holat | Dasturchi | Exception → log → alert |

## Nega shunday

Barcha xatolarni bir xil — exception bilan — ifodalash muammo keltiradi:

```text
try:
    placeOrder(cmd)
catch e:
    show("Xatolik yuz berdi")      // "omborda yo'q" ham, "DB yiqildi" ham — bir xil xabar
```

- Biznes xatosi foydalanuvchiga **aniq** ko'rsatilishi kerak ("Bu mahsulot tugadi — o'xshashlarini ko'ring").
- Texnik xato — umumiy xabar + qayta urinish.
- Bug — log va alert; foydalanuvchiga ichki tafsilot emas.

## Psevdokod: exception va result

```text
// Exception — oqimni to'xtatadi, imzoda ko'rinmaydi
function reserve(sku, qty): Reservation
    if stock(sku) < qty: throw OutOfStock(sku)    // chaqiruvchi bilishi kerak — lekin imzodan ko'rinmaydi
```

```text
// Result — xato natijaning bir qismi, imzoda ko'rinadi
type ReserveResult = Ok(Reservation) | OutOfStock(available) | ProductDiscontinued

function reserve(sku, qty): ReserveResult

match reserve(sku, 2):
    Ok(r)               -> continue(r)
    OutOfStock(n)       -> suggest("Faqat " + n + " dona qoldi")
    ProductDiscontinued -> suggest("Sotuvdan olingan")
    // yangi holat qo'shilsa va bu yerda unutilsa — kompilyator xatosi (12-bob)
```

Amaliy qoida:

| Holat | Tanlov |
| --- | --- |
| Biznes xatosi, chaqiruvchi **albatta** hal qilishi kerak | Result / discriminated union |
| Kutilmagan, chaqiruvchi hal qila olmaydi | Exception |
| Framework chegarasi (HTTP, navbat) | Exception → yagona handler → javob formati |

## Psevdokod: xato chegaralari

Xato qayerda ushlanadi — **qatlam chegaralarida**, har joyda emas:

```text
Domen          → biznes xatolarini qaytaradi/tashlaydi (OutOfStock)
Application    → biznes xatosini buyruq natijasiga aylantiradi
HTTP chegara   → yagona handler: xato turi → status kod + RFC 9457 javob
                   OutOfStock        → 409 { type: ".../out-of-stock", detail, available: 1 }
                   ValidationFailed  → 422 { errors: { email: [...] } }
                   NotFound          → 404
                   boshqa (bug)      → 500 { type: "about:blank" } + log (stack trace faqat logda)
Frontend       → turga qarab: maydon xatosi → forma; 409 → xabar + taklif; 5xx → umumiy + qayta urinish
```

Har funksiyada `try/catch` — **anti-naqsh**: xato yutiladi yoki ma'nosiz qayta o'raladi.

## Psevdokod: qayta tiklanish

```text
Vaqtinchalik xato (timeout, 503):
    retry(count = 3, backoff = exponential + jitter)   — faqat idempotent amallar (70-bob)
    bo'lmasa → circuit breaker ochiladi (79-bob) → zaxira javob (kesh, "keyinroq")

Qisman xato (5 ta blokdan 1 tasi yiqildi):
    sahifaning qolgan qismi ishlaydi — xato faqat o'sha blokda ko'rsatiladi
```

## Framework'larda

| Qatlam | Framework mexanizmi | Qayerda |
| --- | --- | --- |
| Backend yagona handler | Symfony `kernel.exception` listener / `ProblemNormalizer`; Laravel `bootstrap/app.php` → `withExceptions` | [Symfony 24-bob](../symfony/24-xatolik-va-log.md), [Laravel 23-bob](../laravel/23-xatoliklar-va-loglar.md) |
| Validatsiya xatolari → 422 | Symfony Validator, Laravel FormRequest | [Symfony 13-bob](../symfony/13-validatsiya.md), [Laravel 13-bob](../laravel/13-validatsiya.md) |
| Frontend HTTP xatolari | Angular `HttpErrorResponse` (`status: 0` — tarmoq/timeout) va interceptor | [Angular 57-bob](../angular/57-http-xatolar.md) |
| Server xatosini formaga | Signal Forms `submit` → `fieldTree` bilan xato | [Angular 51-bob](../angular/51-signal-forms-yuborish.md) |
| UI xato chegarasi | React Error Boundary; Next.js `error.tsx` | [React 33-bob](../react/33-xatolar.md), [Next.js 10-bob](../nextjs/10-loading-va-error.md) |
| Resurs holatlari | `httpResource`: `error()` / `hasValue()`; TanStack Query `isError` | [Angular 21-bob](../angular/21-http-resource.md), [React 32-bob](../react/32-tanstack-query.md) |

Angular'da tekshirilgan nozik joy: `resource` xato holatida `value()` ni o'qish **xato tashlaydi** — `hasValue()` bilan tekshirish shart ([Angular 20-bob](../angular/20-resource.md)). Xatolar modeli kutubxona darajasida ham arxitektura qarori.

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| Faqat exception'lar | Tilga tabiiy, kam kod | Biznes xatolari yashirin, `catch` ko'r-ko'rona |
| Result tiplari hamma joyda | Aniq, kompilyator yordam beradi | Ko'p kod (PHP'da ayniqsa), zanjirlash noqulay |
| **Aralash**: biznes — result/aniq exception, qolgani — exception + yagona handler | Muvozanat | Jamoa kelishuvi kerak |
| Xato kodlari (satr) API'da | Frontend tarjima qila oladi, barqaror | Ro'yxatni saqlash va versiyalash |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `catch (e) {}` | Xato yo'qoladi | Ushlash — faqat hal qilish mumkin bo'lsa |
| Hamma xato 500 | Frontend biznes xatosini ajrata olmaydi | Turga qarab status + tur kodi |
| Stack trace javobda | Ichki tuzilma oshkor | Faqat logda |
| Foydalanuvchiga `e.message` | Tushunarsiz, texnik | Tur kodi → frontend tarjimasi (59-bob) |
| Idempotent bo'lmagan amalni retry | Ikki marta to'lov | Idempotency key (70-bob) |
| Har funksiyada try/catch | Shovqin, xato ma'nosi yo'qoladi | Chegaralarda ushlash |

## Amaliyot

1. Loyihangizdagi barcha `catch` bloklarini sanang: nechtasi xatoni "yutadi"?
2. Eng muhim use case'ning biznes xatolari ro'yxatini tuzing va ularni tur kodlari bilan API javobiga chiqaring.
3. Backend'da yagona xato handler RFC 9457 formatida javob bersin.
4. Frontend'da xato turlariga qarab uch xil ko'rsatish: maydon, xabar, umumiy + "qayta urinish".

## Manbalar

- RFC 9457 — *Problem Details for HTTP APIs* <https://www.rfc-editor.org/rfc/rfc9457>
- Scott Wlaschin — *Railway Oriented Programming* <https://fsharpforfunandprofit.com/rop/>
- Michael Nygard — *Release It!*, 4–5-boblar (barqarorlik naqshlari)
