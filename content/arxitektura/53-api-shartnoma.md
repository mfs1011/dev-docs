# 53 — API shartnomasi kimniki

[← Oldingi: Frontend testlash strategiyasi](52-frontend-testlash.md) · [Mundarija](README.md) · [Keyingi: Shartnoma birinchi: OpenAPI va kod generatsiyasi →](54-openapi.md)

## Tushuncha

API shartnomasi — frontend va backend (yoki ikki servis) orasidagi kelishuv: qaysi endpoint'lar bor, qanday so'rov va javob shakli, qanday xatolar, qanday kafolatlar (idempotentlik, tartib, cheklovlar).

Bu V qismning markaziy savoli: **shartnoma kimga tegishli?** Javobga qarab jamoalar qanday ishlashi, kim kimni kutishi, va buzilganda kim javobgar ekani o'zgaradi.

| Model | Kim loyihalaydi | Qachon |
| --- | --- | --- |
| **Provayder egasi** (backend-first) | Backend o'z API'sini e'lon qiladi, iste'molchilar moslashadi | Ommaviy API, ko'p iste'molchi |
| **Iste'molchi boshqaradi** (consumer-driven) | Frontend nimani kutishini yozadi, backend shuni ta'minlaydi | Bitta asosiy klient, ichki jamoalar |
| **Birgalikda, shartnoma birinchi** (contract-first) | Sxema avval kelishiladi, keyin ikkala tomon parallel yozadi | Ikki jamoa, ikki tezlik |

## Nega shunday

Shartnomasiz ishlash qanday ko'rinadi:

```text
Backend: "status" maydonini "state" deb o'zgartirdi (refaktor)
Frontend: hech narsa bilmaydi → production'da buyurtmalar sahifasi bo'sh
Kim aybdor?  Backend: "API — bizniki"   Frontend: "bizga aytmadingiz"
```

Muammo texnik emas — **egalik** va **jarayon** muammosi. Shartnoma aniq bo'lsa, buzilish CI'da ushlanadi va bahs bo'lmaydi.

## Psevdokod: shartnomaning qismlari

```text
Endpoint:      POST /orders
So'rov:        { items: [{ sku: string, qty: integer ≥ 1 }], promoCode?: string }
Javob 201:     { id: uuid, status: "pending_payment", total: { amount: integer, currency: "UZS" } }
Xatolar:       422 { type: ".../validation", errors: { field: [message] } }
               409 { type: ".../out-of-stock", sku, available }
               401, 403, 429 (umumiy)
Kafolatlar:    Idempotency-Key sarlavhasi bilan takror yuborish xavfsiz (70-bob)
               Javob vaqti p95 ≤ 500 ms
Versiya:       v1; maydon qo'shish — moslikni buzmaydi; o'chirish — deprecation bilan (58-bob)
Ega:           Ordering jamoasi; o'zgarishlar — PR + iste'molchilar ogohlantiriladi
```

Faqat "endpoint va JSON" emas — **xatolar, kafolatlar, versiya siyosati va ega** ham shartnoma.

## Psevdokod: o'zgarishlar turi

```text
Moslikni buzmaydigan (backward compatible):
  + yangi endpoint
  + javobga yangi maydon
  + so'rovga yangi IXTIYORIY maydon
  + yangi enum qiymati — FAQAT agar iste'molchilar noma'lum qiymatga tayyor bo'lsa

Moslikni buzadigan (breaking):
  - maydonni o'chirish / nomini o'zgartirish
  - maydon tipini o'zgartirish (number → string)
  - ixtiyoriy maydonni majburiy qilish
  - xato kodlari yoki semantikasini o'zgartirish
  - default xulqni o'zgartirish (sahifa hajmi 20 → 50)
```

Postel qonuni (ehtiyotkorlik bilan): "yuborishda qat'iy, qabul qilishda bag'rikeng bo'l" — frontend noma'lum maydonlarni e'tiborsiz qoldirsin, noma'lum enum qiymatiga yiqilmasin.

## Framework'larda

| Tomon | Shartnomani ifodalash | Qayerda |
| --- | --- | --- |
| Symfony | DTO + Serializer + Validator; API Platform — OpenAPI avtomatik | [Symfony 20](../symfony/20-serializer-va-dto.md), [21](../symfony/21-rest-api.md), [38-bob](../symfony/38-api-pro.md) |
| Laravel | FormRequest + API Resource | [Laravel 13](../laravel/13-validatsiya.md), [20-bob](../laravel/20-api-resurslar.md) |
| Frontend | API klient + tiplar + runtime parse (Zod) | [Angular 55](../angular/55-http-client.md), [57-bob](../angular/57-http-xatolar.md) |
| Next.js | Tashqi backend bilan ishlash | [Next.js 29-bob](../nextjs/29-server-sorovlar.md) |

Frontend tomonida asosiy himoya — **chegarada parse** (12-bob): `get<Order>()` faqat TypeScript'ga va'da, Zod esa haqiqatan tekshiradi va shartnoma buzilganda aniq joyda xato beradi.

## Trade-off

| Model | Yutuq | Narx |
| --- | --- | --- |
| Backend-first | Backend tezkor, bitta haqiqat | Frontend kutadi yoki moslashadi |
| Consumer-driven | Frontend ehtiyoji aniq, ortiqcha API yo'q | Ko'p iste'molchida murakkab |
| Contract-first | Parallel ishlash, erta kelishuv | Sxemani yozish va saqlash intizomi |
| Shartnomasiz ("kodni o'qing") | Tez boshlash | Buzilishlar production'da topiladi |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Shartnoma — faqat og'zaki | Esdan chiqadi, nomuvofiq | Yozilgan sxema (54-bob) |
| Xatolar shartnomaga kirmaydi | Frontend xatoni taxmin qiladi | Xato formati va kodlari (59-bob) |
| "Kichik" maydon o'zgarishi xabarsiz | Klient buziladi | Breaking change siyosati |
| Frontend noma'lum enum'da yiqiladi | Backend yangi holat qo'shsa — UI buziladi | Default tarmoq (`else`) |
| Ega yo'q | Hech kim javob bermaydi | Har API'ning egasi |

## Amaliyot

1. Eng muhim 5 endpoint uchun yuqoridagi shablon bo'yicha shartnoma yozing — xatolar va kafolatlar bilan.
2. So'nggi 3 oydagi API o'zgarishlarini ko'rib chiqing: qaysilari breaking edi va qanday yetkazildi?
3. Frontend'da noma'lum enum qiymati kelsa nima bo'ladi — sinab ko'ring.
4. Har API uchun ega jamoani yozing.

## Manbalar

- Martin Fowler — *Consumer-Driven Contracts* <https://martinfowler.com/articles/consumerDrivenContracts.html>
- Google — *API Design Guide* <https://cloud.google.com/apis/design>
- Hyrum's Law <https://www.hyrumslaw.com>
