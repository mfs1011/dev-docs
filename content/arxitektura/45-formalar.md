# 45 — Formalar arxitekturasi

[← Oldingi: Marshrutlash arxitekturasi](44-marshrutlash.md) · [Mundarija](README.md) · [Keyingi: Erishimlilik va ko'p tillilik →](46-a11y-va-i18n.md)

## Tushuncha

Forma — frontend'ning eng murakkab qismlaridan biri: foydalanuvchi kiritmasi, validatsiya, server xatolari, asinxron tekshiruvlar, shartli maydonlar, qoralama saqlash. Arxitektura savollari:

| Savol | Qaror |
| --- | --- |
| Forma modeli kimniki? | Forma kutubxonasi, sizning signal/state'ingiz, yoki DOM |
| Validatsiya qayerda? | Klientda (UX) **va** serverda (haqiqat) |
| Qoidalar qayerda yoziladi? | Sxemada (qayta ishlatiladigan) yoki komponentda |
| Server xatolari qanday qaytadi? | Maydonlarga xaritalangan shartnoma (59-bob) |
| Forma modeli = API DTO? | Yo'q — alohida, o'giruvchi bilan |

## Nega shunday

Formada ikki haqiqat manbai muammosi eng ko'p uchraydi: ma'lumot bir joyda (store/props), formaning ichki nusxasi — boshqa joyda. Ular orasidagi sinxronlash — xatolar manbai ("saqladim, lekin eski qiymat ketdi").

## Psevdokod: uch model

```text
Forma modeli (UI uchun)            API DTO (server uchun)          Domen (server ichida)
{ age: number | null,              { age: number,                  Customer.age (invariant: 18+)
  tags: "a, b",                      tags: ["a", "b"],
  birthDate: "2000-01-31" }          birthDate: "2000-01-31T00:00Z" }

toDto(form): DTO   — yuborishda o'girish, bo'sh qiymatlarni tozalash
fromDto(dto): Form — tahrirlashda boshlang'ich qiymat
```

Forma modeli — **UI ehtiyojiga** moslangan (bo'sh maydon `null` bo'lishi mumkin); DTO — shartnoma; domen — qoidalar. Bittasini ikkinchisi o'rnida ishlatish — tiplar yolg'onga aylanadi (57, 68-boblar).

## Psevdokod: validatsiya qatlamlari

```text
1. Native (HTML)       type="email", required — erishimlilik va mobil klaviatura uchun
2. Klient sxemasi      required, format, maydonlararo qoidalar — darhol fikr-mulohaza
3. Async klient        "login bandmi?" — debounce bilan server so'rovi
4. Server              HAQIQAT: barcha qoidalar qayta tekshiriladi + biznes qoidalari
5. Server javobi       422 { errors: { email: ["band"] } } → forma maydonlariga

Qoidalar takrorlanishi (klient + server): umumiy sxema (Zod/OpenAPI dan generatsiya) yoki
klientda faqat UX uchun muhim qismi, qolgani serverdan.
```

## Psevdokod: yuborish oqimi

```text
submit:
  if invalid: barcha maydonlarni touched qilish → birinchi xatoga fokus → to'xtash
  submitting = true (tugma o'chiriladi — ikki marta yuborishdan UX himoyasi)
  result = api.send(toDto(form))
  if 422: xatolarni maydonlarga qo'yish (foydalanuvchi o'sha maydonni tahrirlasa — xato yo'qoladi)
  if boshqa xato: umumiy xabar, forma qiymatlari saqlanadi
  if ok: reset yoki navigatsiya
  submitting = false
```

## Framework'larda

| Imkoniyat | Angular | React | Vue |
| --- | --- | --- | --- |
| Tanlov | Signal Forms / Reactive / template-driven — [47-bob](../angular/47-formalar-tanlov.md) | [38-bob](../react/38-formalar.md), Server Actions — [Next.js 21–22](../nextjs/22-formalar.md) | [45-bob](../vue/45-formalar-arxitekturasi.md) |
| Sxema va qoidalar | `schema`, `apply`, `applyWhen` — [50-bob](../angular/50-signal-forms-sxema.md) | Zod + resolver | VeeValidate + Zod |
| Server xatolari | `submit` → `fieldTree` bilan — [51-bob](../angular/51-signal-forms-yuborish.md) | `setError` | `setErrors` |
| Standard Schema | `validateStandardSchema` (Zod) — [49-bob](../angular/49-signal-forms-validatsiya.md) | Zod | Zod |

Angular Signal Forms'da tekshirilgan arxitekturaviy xususiyatlar: model — **bitta** (sizning signalingiz, forma nusxa saqlamaydi); `disabled`/`hidden` maydonlar validatsiya qilinmaydi, lekin `value()` da qoladi; server xatosi maydon tahrirlanganda o'zi yo'qoladi; `debounce` model yangilanishini ham kechiktiradi.

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| Forma modeli = DTO | Kam kod | Bo'sh qiymatlar, formatlar — tiplar yolg'on |
| Alohida forma modeli + o'giruvchi | Aniq, xavfsiz | Mapper kodi |
| Qoidalar faqat serverda | Bitta manba | Sekin fikr-mulohaza |
| Qoidalar ikki joyda | Tez UX | Nomuvofiqlik xavfi — umumiy sxema bilan kamayadi |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Faqat klient validatsiyasi | Chetlab o'tiladi | Server — haqiqat |
| 422 ni umumiy toast bilan | Qaysi maydon — noma'lum | Maydonlarga xaritalash |
| Xato matni har harfda | Yomon UX | `touched` dan keyin |
| Yuborish tugmasi `invalid` da o'chiriladi | Foydalanuvchi nima noto'g'riligini bilmaydi | Bosadi → xatolar + fokus |
| Forma va store — ikki manba | Sinxron xatolari | Bitta model |

## Amaliyot

1. Eng murakkab formangiz uchun forma modeli, DTO va o'giruvchi funksiyani ajrating.
2. Server 422 javobini maydonlarga xaritalang.
3. Yaroqsiz yuborishda birinchi xatoli maydonga fokus bering.
4. Klient va server qoidalarini solishtiring — nomuvofiqlik bormi?

## Manbalar

- Adam Silver — *Form Design Patterns*
- GOV.UK Design System — *Validation* naqshi <https://design-system.service.gov.uk/patterns/validation/>
- Angular — *Signal Forms* <https://angular.dev/guide/forms/signals/overview>
