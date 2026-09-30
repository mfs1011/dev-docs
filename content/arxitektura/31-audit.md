# 31 — Audit va o'zgarishlar tarixi

[← Oldingi: Rate limiting va kvotalar](30-rate-limiting.md) · [Mundarija](README.md) · [Keyingi: Fayl va media →](32-fayl-va-media.md)

## Tushuncha

Ko'p tizimlarda "hozir nima bor" yetarli emas — **"kim, qachon, nimani, nimadan nimaga o'zgartirdi"** ham kerak:

| Ehtiyoj | Misol |
| --- | --- |
| Xavfsizlik tekshiruvi | "Admin kim narxni 1 so'mga tushirdi?" |
| Huquqiy/moliyaviy | Buxgalteriya yozuvlari, shartnoma o'zgarishlari |
| Qo'llab-quvvatlash | "Mijoz buyurtmasi nega bekor bo'ldi?" |
| Qaytarish | O'chirilgan yozuvni tiklash |

To'rt texnika:

| Texnika | Nima saqlanadi |
| --- | --- |
| **Audit log** | Har o'zgarish: kim, qachon, nima, eski → yangi |
| **Soft delete** | O'chirish o'rniga `deleted_at` belgisi |
| **Versiyalangan yozuvlar** (temporal) | Har o'zgarish — yangi versiya satri |
| **Event sourcing** | Holat emas, hodisalar (27-bob) |

## Nega shunday

Audit — keyinga qoldirilganda eng qimmat narsalardan biri: o'tmishni tiklab bo'lmaydi. Hodisa bo'lgandan keyin "kim qildi?" savoliga javob — faqat audit oldindan yozilgan bo'lsa.

## Psevdokod: audit log

```text
audit_log(
  id, occurred_at,
  actor_type ('user' | 'system' | 'api_key'), actor_id,
  action ('order.cancelled', 'product.price_changed'),
  entity_type, entity_id,
  changes JSON          -- { "price": [890000, 1] }
  context JSON          -- { ip, user_agent, request_id, reason }
)
```

Qayerda yozish:

```text
a) Domen hodisalaridan — eng mazmunli: "OrderCancelled { reason: 'mijoz iltimosi' }"
b) ORM hook'laridan (onFlush) — hamma o'zgarishni avtomatik ushlaydi, lekin "nega"ni bilmaydi
c) DB trigger'lari — kod chetlab o'tsa ham ishlaydi, lekin foydalanuvchi kontekstini bilmaydi
```

Amalda: muhim biznes amallari — **(a)**, qolgan tahrirlashlar — **(b)**; ikkalasida ham `request_id` va `actor` bo'lsin.

Audit log — **faqat qo'shish** (append-only): yozuvni o'zgartirish yoki o'chirish huquqi hech kimda (ilova foydalanuvchisida ham) bo'lmasin. Aks holda buzg'unchi izini o'chiradi.

## Psevdokod: soft delete — ehtiyotkorlik bilan

```text
products(..., deleted_at NULL)
SELECT * FROM products WHERE deleted_at IS NULL     -- HAR so'rovda

Muammolar:
  - Har so'rovga filtr — unutilsa, "o'chirilgan" narsa ko'rinadi
  - UNIQUE (email) — o'chirilgan akkaunt email'ni "band" qiladi → UNIQUE (email) WHERE deleted_at IS NULL
  - FK: o'chirilgan mahsulotga faol buyurtma qatorlari
  - Jadval o'sishda davom etadi
```

Muqobillar:

```text
- Arxiv jadvali: o'chirishda satrni products_archive ga ko'chirish — asosiy jadval toza
- Holat maydoni: status = 'discontinued' — "o'chirish" emas, biznes holati (ko'pincha aynan shu kerak)
- Audit log + haqiqiy o'chirish — tiklash kerak bo'lsa, audit'dan
```

"Mahsulot sotuvdan olindi" — bu **o'chirish emas**, biznes holati. Soft delete ko'pincha noto'g'ri modellashtirilgan holat.

## Psevdokod: GDPR va "unutilish huquqi"

```text
Ziddiyat: audit hamma narsani saqlashni xohlaydi, qonun — shaxsiy ma'lumotni o'chirishni talab qiladi

Yechimlar:
  - Auditda shaxsiy ma'lumot emas, ID saqlash (actor_id, entity_id); shaxsiy ma'lumot — asosiy jadvalda
  - Foydalanuvchi o'chirilganda — anonimlashtirish (name → "O'chirilgan foydalanuvchi #1842")
  - Crypto-shredding: har foydalanuvchi ma'lumoti o'z kaliti bilan shifrlangan; kalitni o'chirish = ma'lumot o'qib bo'lmaydi
  - Saqlash muddati (retention): audit 5 yil, loglar 90 kun — va avtomatik tozalash
```

O'zbekiston "Shaxsga doir ma'lumotlar to'g'risida"gi qonun ham shaxsiy ma'lumotlarni lokalizatsiya va himoya qilishni talab qiladi — audit va loglar ham shu doiraga kiradi.

## Framework'larda

| Ehtiyoj | Symfony | Laravel | Frontend |
| --- | --- | --- | --- |
| ORM hook'lari | Doctrine `onFlush`/`postUpdate` — [Symfony 27-bob](../symfony/27-event-va-doctrine-hodisalari.md) | Model observers — [Laravel 26-bob](../laravel/26-hodisalar-va-observerlar.md) | — |
| Soft delete | Gedmo SoftDeleteable / Doctrine filter | `SoftDeletes` trait (global scope avtomatik) | O'chirishda "Qaytarish" (undo) toast |
| Tayyor audit | `DAMADoctrineAuditBundle` kabi paketlar | `owen-it/laravel-auditing`, `spatie/laravel-activitylog` | — |
| Kontekst (kim, IP) | Security token, RequestStack | `auth()->id()`, `request()->ip()` | — |

Frontend tomondan: "kim o'zgartirdi" tarixi — alohida API (`GET /orders/42/history`), sahifada vaqt chizig'i. Optimistik UI'da o'chirish uchun "Bekor qilish" imkoniyati — soft delete yoki kechiktirilgan o'chirish bilan birga ishlaydi.

## Trade-off

| Texnika | Yutuq | Narx |
| --- | --- | --- |
| Audit log | To'liq iz, alohida saqlash | Hajm, shaxsiy ma'lumot masalasi |
| Soft delete | Oson tiklash | Har so'rovda filtr, UNIQUE/FK muammolari |
| Temporal jadvallar | "X sanada holat qanday edi?" | Murakkab so'rovlar, hajm |
| Event sourcing | Mukammal tarix | Butun arxitektura o'zgaradi |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Audit keyinga | O'tmish tiklanmaydi | Muhim amallar uchun birinchi kundan |
| Audit yozuvini tahrirlash mumkin | Iz o'chiriladi | Append-only, alohida huquqlar |
| Auditda "nega" yo'q | "Kim" bor, sabab yo'q | Domen hodisasidan, `reason` bilan |
| Soft delete hamma jadvalda | Murakkablik, xatolar | Holat maydoni yoki arxiv |
| Auditda parol, token, karta raqami | Sizib chiqish | Maxfiy maydonlarni maskalash |
| Saqlash muddati yo'q | Cheksiz o'sish, qonun buzilishi | Retention siyosati |

## Amaliyot

1. Tizimingizdagi 5 ta eng xavfli amal (narx, rol, to'lov qaytarish) uchun audit bormi?
2. Soft delete ishlatilgan jadvallarni ko'rib chiqing: qaysi biri aslida "holat"?
3. Audit jadvaliga ilova foydalanuvchisi `UPDATE/DELETE` qila oladimi? Huquqlarni cheklang.
4. Foydalanuvchini o'chirish so'rovi kelsa — qaysi jadvallarda nima qilinadi? Rejani yozing.

## Manbalar

- Martin Fowler — *Audit Log* <https://martinfowler.com/eaaDev/AuditLog.html>
- OWASP — *Logging Cheat Sheet* <https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html>
- GDPR, 17-modda (Right to erasure)
