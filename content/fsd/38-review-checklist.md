# 38 — Code review checklist

[← Oldingi: Amaliy loyiha: do'kon frontendi](37-amaliy-loyiha.md) · [Mundarija](README.md) · [Keyingi: Tez-tez beriladigan savollar →](39-faq.md)

## Qisqacha

Steiger va ESLint mexanik qoidalarni ushlaydi: yuqoriga import, chuqur import, taqiqlangan nomlar. Lekin "bu kod to'g'ri qatlamdami?", "bu slice kerakmi?", "nomi biznesni aks ettiradimi?" — bu savollarga faqat odam javob beradi. Bu ro'yxat — PR ko'rigida aynan shular uchun. Har band yonida — batafsil bob.

## Qoida: avtomatik darvoza (odamdan oldin)

```text
□ npx steiger src — toza                                         (33-bob)
□ lint (ESLint/oxlint) — toza                                    (34-bob)
□ typecheck va build — toza                                      (27–31-boblar)
□ testlar — yashil                                               (35-bob)
Bular qizil bo'lsa — review'ni boshlamang.
```

## Shablon: odam tekshiradigan savollar

```text
Joylashuv
□ Yangi kod eng LOKAL joydami? Bir joyda ishlatilsa — sahifa/slice ichida          (2, 19-boblar)
□ Pastga tushirilgan bo'lsa — haqiqiy 2+ foydalanuvchi bormi (yoki "kelajak uchun")?  (2, 18-boblar)
□ Feature'mi yoki entity'mi? Fe'l — feature, ot — entity                            (9, 19-boblar)
□ Widget'mi yoki sahifa ichidagi blokmi? Qayta ishlatilmasa — sahifada              (10-bob)
□ shared'ga biznes mantiqi tushmaganmi?                                             (7-bob)
□ app'da faqat yig'ish va sozlash bormi (sahifa kodi emas)?                         (12-bob)

Chegaralar
□ Yangi cross-import bormi? Bo'lsa — ongli, izohli, A–D strategiyalardan qaysi biri?  (15-bob)
□ @x faqat entities'da va oxirgi chora sifatidami?                                  (15-bob)
□ Slice'lar yuqori qatlamda kompozitsiya bilan ulanganmi (slot/props/projection)?   (16-bob)
□ Entity UI harakatni o'zi import qilmaydimi?                                       (8, 16-boblar)

Public API
□ index.ts'da faqat tashqariga kerak narsalar, aniq nomlar bilan (export * yo'q)?    (14-bob)
□ Public API o'zgargan bo'lsa — bu ataylabmi, ishlatuvchilar yangilanganmi?           (14-bob)
□ Server-only kod klient index'ida emasmi (Next.js — index.server.ts)?               (14, 28-boblar)

Nomlash
□ Slice nomi biznes tilidami (add-to-cart, order), texnik emas (forms, modals)?      (4-bob)
□ Fayl nomlari domenli (delivery.ts), umumiy emas (utils.ts, types.ts)?             (17-bob)
□ Yangi segment nomi maqsadni bildiradimi?                                          (5-bob)

Tipik vazifalar
□ So'rov to'g'ri joydami: umumiy — shared/api, bir slice'ga — slice/api?            (20-bob)
□ Kesh kalitlari query factory'dami, qo'lda yozilgan satr emasmi?                   (21-bob)
□ Token/sessiya sahifa yoki widget'da emasmi?                                       (22-bob)
□ DTO va mapper so'rov yonidami; backend nomlari UI'ga tarqalmaganmi?               (23-bob)
□ Rasm ishlatiladigan joy yonidami (umumiy assets/ emas)?                           (25-bob)
□ Lazy import sahifaning public API'si orqalimi?                                    (26-bob)

Testlar
□ Test kod yonidami, boshqa slice'larga faqat public API orqali kiradimi?           (35-bob)
```

## Kod: PR shabloni

```markdown
<!-- .github/pull_request_template.md -->
## FSD
- [ ] Yangi slice'lar: … (nega aynan shu qatlam: …)
- [ ] Pastga tushirilgan kod: … (qaysi 2+ joy ishlatadi: …)
- [ ] Yangi cross-import / `@x` / Steiger istisnosi: yo'q | bor — sabab: …
- [ ] Public API o'zgarishi: yo'q | bor — ishlatuvchilar: …
```

## Qachon / qachon emas

| Holat | Nima qilish |
| --- | --- |
| Kichik bugfix bitta slice ichida | Faqat avtomatik darvoza yetarli |
| Yangi slice yoki qatlam | To'liq ro'yxat |
| Steiger istisnosi qo'shilgan | Albatta muhokama, sabab izohda |
| Bahsli "feature yoki entity?" | 19-bobdagi daraxt; baribir bahs bo'lsa — jamoa qarori yoziladi (ADR) |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Review'da linter ushlaydigan narsalarni muhokama qilish | Vaqt isrofi | Avtomatik darvoza avval |
| "Keyin to'g'rilaymiz" bilan noto'g'ri qatlamni qabul qilish | Boshqalar unga bog'lanadi, ko'chirish qimmatlashadi | PR'da tuzatish |
| Har PR'da arxitektura bahsi | Charchoq | Kelishuvlarni ADR'ga yozib, havola berish |

## Manbalar

- Arxitektura qo'llanmasi: [91-bob — Checklist](../arxitektura/91-checklist.md), [84-bob — Qaror qabul qilish](../arxitektura/84-qaror-qabul-qilish.md)
