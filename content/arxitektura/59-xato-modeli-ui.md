# 59 — Xato modeli: serverdan UI gacha

[← Oldingi: Versiyalash va orqaga moslik](58-versiyalash.md) · [Mundarija](README.md) · [Keyingi: Autentifikatsiya oqimlari →](60-autentifikatsiya.md)

## Tushuncha

17-bobda — xatolar modeli bitta tizim ichida. Bu bob — xato **chegaradan o'tganda**: backend'da paydo bo'lib, tarmoq orqali frontend'ga, u yerdan foydalanuvchiga — tushunarli xabar sifatida yetib borishi.

```text
Domen xatosi        →  HTTP javob             →  Frontend tasnifi        →  UI
OutOfStock(sku, 1)     409 problem+json          "conflict / out-of-stock"   "Faqat 1 dona qoldi" + taklif
ValidationFailed       422 { errors: {...} }     "validation"                maydon ostida xabar
NotAuthenticated       401                       "auth"                      refresh → login
DB yiqildi             500 (tafsilotsiz)         "server"                    "Xatolik, qayta urinib ko'ring"
— (tarmoq yo'q)        —                         "network"                   "Internet aloqasi yo'q"
```

## Nega shunday

Uch tomonning ehtiyoji har xil:

| Kim | Kerak |
| --- | --- |
| **Foydalanuvchi** | Nima bo'ldi va **nima qilish kerak** — o'z tilida |
| **Frontend kodi** | Barqaror, mashina o'qiydigan xato turi — xabar matniga qarab `if` qilmaslik |
| **Dasturchi** | To'liq tafsilot — lekin logda, foydalanuvchiga emas |

Backend `"message": "SQLSTATE[23000]: Integrity constraint violation..."` qaytarsa — uchalasi ham yutqazadi: foydalanuvchi tushunmaydi, frontend ishlay olmaydi, ichki tuzilma oshkor.

## Psevdokod: shartnoma — barqaror xato turlari

```text
Backend (RFC 9457):
{
  "type": "https://api.shop.uz/problems/out-of-stock",     ← BARQAROR kod: frontend shunga tayanadi
  "title": "Out of stock",                                  ← inglizcha, dasturchilar uchun
  "status": 409,
  "detail": "Only 1 item left",                              ← ixtiyoriy, log/debug uchun
  "sku": "NK-42", "available": 1,                            ← kontekst — UI xabarini to'ldirish uchun
  "traceId": "4bf92f35..."                                   ← support va logda topish uchun
}

Validatsiya:
{
  "type": ".../validation",
  "status": 422,
  "errors": [
    { "field": "email", "code": "taken" },
    { "field": "items[0].qty", "code": "min", "params": { "min": 1 } }
  ]
}
```

**Xabar matnlarini kim yozadi?** Ikki yondashuv:

| Yondashuv | Qachon |
| --- | --- |
| Backend lokalizatsiya qilingan xabar qaytaradi (`Accept-Language`) | Bitta klient, oddiy |
| Backend **kod** qaytaradi, frontend tarjima qiladi | Ko'p klient, ko'p til, UI'ga mos matn kerak — tavsiya etiladi |

## Psevdokod: frontend'da tasniflash

```text
function classify(error):
    if error is TimeoutError or (status == 0 and not reachable):   return "network"   (navigator.onLine'ga ishonmang, 51-bob)
    if status == 401:  return "auth"         → refresh oqimi (61-bob), bo'lmasa login
    if status == 403:  return "forbidden"    → "Ruxsat yo'q", logout EMAS
    if status == 404:  return "not-found"
    if status == 409 or 412: return "conflict"   → type bo'yicha aniq xabar
    if status == 422:  return "validation"   → forma maydonlariga (45-bob)
    if status == 429:  return "rate-limited" → Retry-After (67-bob)
    if status >= 500:  return "server"       → umumiy xabar + qayta urinish (vaqtinchalik bo'lsa)

function message(problem):
    return t("errors." + slug(problem.type), problem)    // "errors.out-of-stock": "Faqat {available} dona qoldi"
           ?? t("errors.generic." + classify(problem))
```

## Psevdokod: xato qayerda ko'rsatiladi

```text
Maydon xatosi (422)          → maydon ostida, aria-describedby bilan
Biznes xatosi (409)          → amal yonida (tugma ostida) yoki dialog — taklif bilan ("O'xshashlarini ko'ring")
Sahifa ma'lumoti yuklanmadi  → sahifa ichida, "Qayta urinish" tugmasi
Fon amali yiqildi            → toast
Tarmoq yo'q                  → global banner (bir marta, har so'rovga emas)
Ruxsat yo'q (403)            → amal o'rnida xabar; ko'p bo'lsa — ruxsatlarni yangilash
```

## Framework'larda

| Qatlam | Backend | Frontend |
| --- | --- | --- |
| Domen → HTTP | Symfony exception listener / `ProblemNormalizer` — [Symfony 24-bob](../symfony/24-xatolik-va-log.md); Laravel `withExceptions` — [Laravel 23-bob](../laravel/23-xatoliklar-va-loglar.md) | — |
| Validatsiya → 422 | [Symfony 13](../symfony/13-validatsiya.md), [Laravel 13-bob](../laravel/13-validatsiya.md) | — |
| HTTP → tasnif | — | Interceptor, `userMessage()` — [Angular 57-bob](../angular/57-http-xatolar.md) |
| 422 → forma | — | Signal Forms `submit` + `fieldTree` — [Angular 51-bob](../angular/51-signal-forms-yuborish.md); React — [38-bob](../react/38-formalar.md) |
| Tarjima | — | i18n kalitlari — [Angular 77](../angular/77-i18n.md), [Vue 66-bob](../vue/66-i18n.md) |

Angular'da tekshirilgan nozik joy: tarmoq xatosi va timeout ikkalasi `status: 0` bilan keladi — farqlash uchun `error.name === 'TimeoutError'` tekshiriladi ([Angular 57-bob](../angular/57-http-xatolar.md)). Xato tasnifi — framework darajasidagi tafsilotlarni ham bilishni talab qiladi.

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| Backend tayyor matn qaytaradi | Frontend oddiy | Klientlarda UI'ga mos bo'lmagan matn, til boshqaruvi backend'da |
| Kod + frontend tarjimasi | UI'ga mos, ko'p til | Kodlar ro'yxatini sinxron saqlash (OpenAPI'da enum) |
| Har endpoint o'z xato formati | — | Frontend har birini alohida |
| Yagona format (RFC 9457) | Bitta tasniflash kodi | Backend'da yagona handler intizomi |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Frontend xabar matniga qarab `if` | Backend matnni o'zgartirsa — buziladi | Barqaror `type`/`code` |
| SQL/stack trace javobda | Xavfsizlik, tushunarsiz | Faqat logda, `traceId` javobda |
| 403 da logout | Foydalanuvchi bekorga chiqariladi | Xabar, ruxsatlarni yangilash |
| Har tarmoq xatosiga toast | 10 ta bir xil toast | Global banner |
| 422 ni umumiy xabar bilan | Qaysi maydon — noma'lum | Maydonlarga xaritalash |
| `traceId` yo'q | Support xatoni topa olmaydi | Har javobda va UI'da ("Xato kodi: 4bf9…") |

## Amaliyot

1. Backend'ingizning barcha xato turlarini ro'yxatlang va har biriga barqaror `type` bering.
2. Frontend'da yagona `classify()` va `message()` funksiyasini yozing; xato matnlarini i18n kalitlariga o'tkazing.
3. Javoblarga `traceId` qo'shing va UI'da "xato kodi" sifatida ko'rsating.
4. Xato turlarini OpenAPI sxemasiga enum sifatida kiriting (54-bob).

## Manbalar

- RFC 9457 — *Problem Details for HTTP APIs*
- Nielsen Norman Group — *Error-Message Guidelines* <https://www.nngroup.com/articles/error-message-guidelines/>
- W3C — *Trace Context* <https://www.w3.org/TR/trace-context/>
