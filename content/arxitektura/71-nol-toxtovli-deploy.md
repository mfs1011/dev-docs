# 71 — Migratsiya va nol to'xtovli deploy

[← Oldingi: Idempotentlik](70-idempotentlik.md) · [Mundarija](README.md) · [Keyingi: Uchinchi tomon integratsiyalari →](72-integratsiyalar.md)

## Tushuncha

Nol to'xtovli deploy (zero-downtime) — yangi versiya chiqayotganda foydalanuvchilar xato ko'rmaydi. Buning uchun bir paytning o'zida **eski va yangi versiyalar birga ishlashi** kerak:

```text
Deploy davomida:
  server nusxalari:   [v1] [v1] [v2]  →  [v1] [v2] [v2]  →  [v2] [v2] [v2]   (rolling)
  frontend tablari:   v1 kodi hali ochiq (49-bob), mobil ilovalar — haftalab eski (58-bob)
  DB sxemasi:         BITTA — ikkala versiyaga ham mos bo'lishi shart
```

Asosiy qiyinchilik — kod emas, **ma'lumotlar bazasi**: kod nusxalari ko'p, sxema bitta.

## Nega shunday

"Migratsiya + deploy" bitta qadam bo'lsa:

```text
1. Migratsiya: ALTER TABLE orders RENAME COLUMN total TO total_minor
2. v1 nusxalari hali ishlayapti → SELECT total ... → XATO (ustun yo'q)
3. v2 nusxalari ko'tarilguncha — 500'lar
```

Yoki teskarisi: v2 kod yangi ustunni kutadi, migratsiya hali ishlamagan. Har ikki holda — to'xtash.

## Psevdokod: expand / contract

```text
Maqsad: orders.total (float) → orders.total_minor (bigint, tiyin)

Reliz 1 — EXPAND (sxema kengayadi, eski kod buzilmaydi)
  migratsiya: ADD COLUMN total_minor BIGINT NULL
  kod v2:     ikkalasiga YOZADI (total va total_minor), eskisidan O'QIYDI

Fon ishi — BACKFILL
  UPDATE orders SET total_minor = round(total * 100) WHERE total_minor IS NULL  -- partiyalab, 1000 tadan

Reliz 2 — O'QISHNI O'TKAZISH
  kod v3:     total_minor dan o'qiydi, ikkalasiga yozadi
  migratsiya: total_minor NOT NULL (backfill tugagach)

Reliz 3 — CONTRACT (eski narsa olib tashlanadi)
  kod v4:     faqat total_minor
  migratsiya: DROP COLUMN total   (v3 ham endi ishlamayotganiga ishonch hosil qilingach)
```

Har reliz — alohida, har birini **orqaga qaytarish mumkin**. Bitta katta "big bang" o'rniga — uch kichik, xavfsiz qadam.

## Psevdokod: xavfli DB amallari

```text
Katta jadvalda qulf olishi mumkin bo'lgan amallar (PostgreSQL misolida):
  ADD COLUMN ... DEFAULT <volatile>      — jadvalni qayta yozishi mumkin
  ADD COLUMN NOT NULL siz default        — mavjud qatorlar bilan xato
  CREATE INDEX                           — yozishni bloklaydi → CREATE INDEX CONCURRENTLY
  ALTER COLUMN TYPE                      — jadvalni qayta yozadi → yangi ustun + backfill
  ADD FOREIGN KEY                        — tekshiruv qulfi → NOT VALID, keyin VALIDATE CONSTRAINT

Qoidalar:
  - migratsiyaga lock_timeout (masalan 5s) — kutib qolmasin, yiqilsin va qayta urinilsin
  - katta backfill — migratsiyada emas, fon ishida, partiyalab
  - migratsiya — kod deploy'idan OLDIN (expand) yoki KEYIN (contract), hech qachon "orasida buzuvchi"
```

## Psevdokod: API va hodisalar ham xuddi shunday

```text
API maydoni:     expand (yangi maydon) → klientlar ko'chadi → contract (58-bob)
Hodisa sxemasi:  OrderPlaced.v1 va v2 — iste'molchilar yangilanguncha ikkalasi (27-bob)
Navbat xabari:   eski worker'lar yangi xabarni tushunishi kerak (yoki yangi xabar turi)
Frontend:        eski chunk'lar serverda bir muddat qoladi (49-bob)
```

## Psevdokod: deploy strategiyalari

```text
Rolling     — nusxalar birma-bir almashtiriladi; eski va yangi birga (expand/contract shart)
Blue/green  — yangi muhit to'liq ko'tariladi, trafik bir zumda o'tkaziladi; tez rollback
Canary      — trafikning 1–5% yangi versiyaga; metrikalar yaxshi bo'lsa — kengaytiriladi (80-bob)
Feature flag— kod deploy qilinadi, lekin o'chiq; yoqish — alohida qaror (18-bob)
```

## Framework'larda

| Ehtiyoj | Symfony / Doctrine | Laravel | Frontend |
| --- | --- | --- | --- |
| Migratsiyalar | Doctrine Migrations — [Symfony 16-bob](../symfony/16-migratsiyalar.md) | — [Laravel 15-bob](../laravel/15-migratsiyalar.md) | — |
| Deploy | [Symfony 40-bob](../symfony/40-deploy-va-checklist.md) | [Laravel 32-bob](../laravel/32-optimallashtirish-va-deploy.md) | [Angular 65](../angular/65-prerender-va-deploy.md), [Vue 67-bob](../vue/67-deploy.md) |
| Backfill | Messenger fon ishi | Queue job, `chunkById` | — |
| Eski tablar | — | — | Eski chunk'larni saqlash, "yangi versiya" xabari — PWA (51-bob) |
| Worker restart | `messenger:stop-workers` deploy'da | `queue:restart` | — |

Deploy'da worker'larni qayta ishga tushirish unutilsa — **eski kod** navbatdagi xabarlarni qayta ishlashda davom etadi (26, 34-boblar). Bu ham "eski va yangi birga" muammosi.

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| Maintenance oynasi ("tunda 10 daqiqa to'xtatamiz") | Oddiy migratsiyalar | To'xtash, tungi ish, global auditoriyaga yaroqsiz |
| Expand/contract | Nol to'xtov, har qadam qaytariladi | Bir o'zgarish — 2–3 reliz, vaqtinchalik ikki tomonlama kod |
| Blue/green | Tez rollback | Ikki muhit narxi; DB baribir umumiy |
| Canary | Xavf cheklangan | Metrika va avtomatlashtirish kerak |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `RENAME COLUMN` bitta relizda | Eski nusxalar yiqiladi | Expand/contract |
| Katta backfill migratsiya ichida | Uzoq qulf, deploy osilib qoladi | Fon ishi, partiyalar |
| `CREATE INDEX` CONCURRENTLY'siz | Yozish bloklanadi | `CONCURRENTLY` |
| "down" migratsiyaga ishonish | Production'da ma'lumot yo'qotishi | Oldinga tuzatuvchi migratsiya |
| Worker'lar deploy'da qayta ishga tushmaydi | Eski kod ishlaydi | Restart deploy skriptida |
| Contract juda erta | Eski klient/nusxa hali ishlatadi | Foydalanishni o'lchab, keyin |

## Amaliyot

1. So'nggi buzuvchi migratsiyangizni expand/contract qadamlari bo'yicha qayta yozing.
2. Migratsiyalaringizga `lock_timeout` qo'shing.
3. Katta jadvaldagi indekslar `CONCURRENTLY` bilan yaratilganmi — tekshiring.
4. Deploy skriptingizda worker restart borligini tasdiqlang.

## Manbalar

- Martin Fowler — *ParallelChange* <https://martinfowler.com/bliki/ParallelChange.html>
- Pramod Sadalage, Scott Ambler — *Refactoring Databases*
- GitLab — *Avoiding downtime in migrations* (amaliy qo'llanma)
