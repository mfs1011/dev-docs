# 58 — Versiyalash va orqaga moslik

[← Oldingi: gRPC va RPC uslubi](57-grpc.md) · [Mundarija](README.md) · [Keyingi: Xato modeli: serverdan UI gacha →](59-xato-modeli-ui.md)

## Tushuncha

API o'zgaradi — bu muqarrar. Versiyalash — o'zgarishni **iste'molchilarni buzmasdan** qilish san'ati. Ikki strategiya:

| Strategiya | G'oya | Misol |
| --- | --- | --- |
| **Evolyutsiya** (versiyasiz) | Faqat moslikni buzmaydigan o'zgarishlar; buzish kerak bo'lsa — yangi maydon/endpoint | Stripe ichki, GraphQL odatda |
| **Versiyalar** | Buzuvchi o'zgarish — yangi versiya, eskisi bir muddat yashaydi | `/v1/` → `/v2/` |

Ko'p jamoalar uchun eng yaxshi yo'l: **imkon qadar evolyutsiya, zarur bo'lganda versiya**.

## Nega shunday

Frontend va backend **turli vaqtda** deploy bo'ladi (49-bob): ochiq tablar eski frontend kodi bilan yangi API'ni chaqiradi, mobil ilovalar esa haftalab (ba'zan oylab) yangilanmaydi. Mobil ilova bo'lsa, eski API versiyasi yillar yashashi mumkin. Shuning uchun "backend va frontend bir vaqtda o'zgaradi" taxmini — xavfli.

## Psevdokod: versiya qayerda

```text
URL:          GET /v2/orders                     ko'rinadi, oson marshrutlash va kesh, eng keng tarqalgan
Sarlavha:     Accept: application/vnd.shop.v2+json   URL toza, lekin debug va keshlash qiyinroq
Sana:         Stripe-Version: 2026-09-30         har o'zgarish sanali; klient o'z versiyasida "muzlaydi"
Query:        ?version=2                          kamdan-kam tavsiya etiladi
```

Ichki API (bitta frontend) uchun ko'pincha versiya **umuman kerak emas** — expand/contract yetarli. Ommaviy API uchun — URL versiyasi eng tushunarli.

## Psevdokod: expand/contract — buzmasdan o'zgartirish

```text
Maqsad: "total": 890000  →  "total": { "amount": 890000, "currency": "UZS" }

1. EXPAND   — yangi maydon qo'shiladi, eskisi qoladi:
              { "total": 890000, "totalMoney": { "amount": 890000, "currency": "UZS" } }
2. MIGRATE  — barcha iste'molchilar yangi maydonga o'tadi (frontend deploy, mobil reliz)
3. DEPRECATE— eski maydon belgilanadi: hujjatda, sxemada (deprecated: true), Deprecation/Sunset sarlavhalari
4. MEASURE  — eski maydon hali o'qilyaptimi? (log, metrika, klient versiyasi bo'yicha)
5. CONTRACT — hech kim ishlatmayotgani tasdiqlangach — o'chiriladi
```

Xuddi shu naqsh DB migratsiyalarida (71-bob) va hodisa sxemalarida (27-bob) ishlaydi.

## Psevdokod: deprecation signallari

```text
HTTP/1.1 200 OK
Deprecation: @1767225600             (RFC 9745 — qachondan eskirgan)
Sunset: Wed, 01 Apr 2027 00:00:00 GMT   (RFC 8594 — qachon o'chiriladi)
Link: <https://api.shop.uz/docs/migrations/v2>; rel="deprecation"
```

Signal yetarli emas — **o'lchash** kerak: eski versiya/maydondan kim, qancha foydalanmoqda (API kalit, `User-Agent`, ilova versiyasi sarlavhasi). Sunset sanasi o'lchovga qarab belgilanadi.

## Psevdokod: mobil va eski klientlar

```text
Klient har so'rovda:   X-Client-Version: ios/4.12.0
Server:
  - versiya bo'yicha xulqni moslashtirish (zarur bo'lsa)
  - minimal qo'llab-quvvatlanadigan versiya: < 4.0 → 426 Upgrade Required + "ilovani yangilang" ekrani
Frontend (web): versiya nomuvofiqligi — "Yangi versiya mavjud" (49, 51-boblar)
```

## Framework'larda

| Mavzu | Backend | Frontend |
| --- | --- | --- |
| URL versiyalari | Symfony marshrut prefikslari / API Platform; Laravel `routes/api.php` guruhlari — [Laravel 9-bob](../laravel/09-marshrutlash.md) | API klientda base URL (`/v2`) |
| Resurs shakllari | API Resource'lar / Serializer guruhlari — versiyaga qarab turli shakl ([Laravel 20](../laravel/20-api-resurslar.md), [Symfony 20-bob](../symfony/20-serializer-va-dto.md)) | — |
| Sxemada deprecated | OpenAPI `deprecated: true`, `oasdiff` (54-bob) | Generatsiya qilingan tiplarda `@deprecated` — IDE ogohlantiradi |
| Eski tab | — | Chunk xatosi → qayta yuklash, "yangi versiya" banneri ([Angular 43-bob](../angular/43-lazy-loading.md)) |

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| Faqat evolyutsiya | Bitta kod yo'li, oddiy | Eskirgan maydonlar to'planadi |
| URL versiyalari | Aniq, iste'molchi tanlaydi | Ikki (yoki ko'p) versiyani saqlash, kod takrorlanishi |
| Sana asosidagi versiyalar | Juda mayda o'zgarishlar, klient muzlaydi | Murakkab ichki transformatsiya qatlami |
| Majburiy yangilash (426) | Eski klientlardan qutilish | Foydalanuvchi noroziligi |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Maydonni bir reliz ichida o'chirish | Eski tablar va mobil ilovalar buziladi | Expand/contract |
| Har kichik o'zgarishga yangi versiya | v1…v9, hammasini saqlash | Evolyutsiya, versiya — kamdan-kam |
| Sunset sanasi o'lchovsiz | Faol iste'molchilar buziladi | Foydalanishni o'lchash |
| Klient versiyasi yuborilmaydi | Kim eski ekanini bilib bo'lmaydi | `X-Client-Version` |
| Deprecated maydon sxemada belgilanmagan | Iste'molchilar bilmaydi | `deprecated: true` + sarlavhalar |

## Amaliyot

1. Oxirgi buzuvchi API o'zgarishingizni expand/contract qadamlari bo'yicha qayta rejalashtiring.
2. Eskirgan maydonlar ro'yxatini tuzing va har biridan foydalanishni o'lchang.
3. Deprecated endpoint'larga `Deprecation` va `Sunset` sarlavhalarini qo'shing.
4. Frontend/mobil so'rovlariga klient versiyasi sarlavhasini qo'shing.

## Manbalar

- Stripe — *APIs as infrastructure: future-proofing Stripe with versioning* <https://stripe.com/blog/api-versioning>
- RFC 8594 — *Sunset HTTP Header*; RFC 9745 — *Deprecation HTTP Header*
- Phil Sturgeon — *API Versioning Has No "Right Way"*
