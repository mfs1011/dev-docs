# 24 — Tranzaksiya va konkurentlik

[← Oldingi: Ma'lumotlar bazasi dizayni](23-malumotlar-bazasi.md) · [Mundarija](README.md) · [Keyingi: Kesh strategiyalari →](25-kesh.md)

## Tushuncha

Tranzaksiya — bir nechta o'zgarishni **"hammasi yoki hech biri"** qilib bajarish. ACID:

| Harf | Ma'no | Amalda |
| --- | --- | --- |
| **A**tomicity | Hammasi yoki hech biri | Buyurtma + qatorlar birga saqlanadi yoki umuman |
| **C**onsistency | Cheklovlar buzilmaydi | FK, UNIQUE, CHECK |
| **I**solation | Parallel tranzaksiyalar bir-biriga xalaqit bermaydi | Darajasiga bog'liq — pastda |
| **D**urability | Tasdiqlangan — yo'qolmaydi | Server qayta ishga tushsa ham |

Konkurentlik — bir vaqtda bir ma'lumotni bir nechta so'rov o'zgartirganda nima bo'lishi. Bu xatolar testda kamdan-kam chiqadi, production'da — yuk ostida.

## Nega shunday

Klassik muammo — **lost update**:

```text
Qoldiq = 1. Ikki xaridor bir vaqtda "sotib olish" bosadi.

So'rov A: SELECT stock → 1        So'rov B: SELECT stock → 1
So'rov A: 1 > 0 ✓, stock = 0       So'rov B: 1 > 0 ✓, stock = 0
So'rov A: UPDATE stock = 0         So'rov B: UPDATE stock = 0
Natija: 2 ta sotuv, 1 ta mahsulot
```

Tranzaksiya o'zi buni **to'xtatmaydi** (sukut izolyatsiya darajasida). Ataylab himoya kerak.

## Psevdokod: izolyatsiya darajalari

| Daraja | Oldini oladi | PostgreSQL sukuti | MySQL (InnoDB) sukuti |
| --- | --- | --- | --- |
| Read Committed | Iflos o'qish | ✅ | |
| Repeatable Read | + takrorlanmaydigan o'qish | | ✅ |
| Serializable | + fantom, write skew — xuddi ketma-ket bajarilgandek | | |

Yuqoriroq daraja — ko'proq to'qnashuv va qayta urinish. Serializable'da tranzaksiya "serialization failure" bilan rad etilishi mumkin — kod **qayta urinishga** tayyor bo'lishi kerak.

## Psevdokod: uch himoya usuli

```text
// 1. Atomik UPDATE — eng oddiy va ko'pincha yetarli
UPDATE products SET stock = stock - 1 WHERE id = ? AND stock >= 1
if affectedRows == 0: error "Tugadi"
```

```text
// 2. Pessimistik qulflash — satrni tranzaksiya oxirigacha band qilish
BEGIN
  SELECT stock FROM products WHERE id = ? FOR UPDATE      -- boshqalar kutadi
  if stock < qty: ROLLBACK; error
  UPDATE products SET stock = stock - qty WHERE id = ?
COMMIT
// Qisqa tranzaksiyalar uchun; uzoq kutish — deadlock va sekinlik
```

```text
// 3. Optimistik qulflash — versiya ustuni
SELECT id, title, price, version FROM products WHERE id = ?     -- version = 7
... foydalanuvchi formani 3 daqiqa tahrirlaydi ...
UPDATE products SET title = ?, price = ?, version = 8 WHERE id = ? AND version = 7
if affectedRows == 0: error "Boshqa kimdir o'zgartirdi — qayta yuklang"
```

| Usul | Qachon |
| --- | --- |
| Atomik UPDATE | Hisoblagichlar, qoldiq, balans — bitta satr, oddiy shart |
| Pessimistik (`FOR UPDATE`) | Qisqa, murakkab tekshiruv; to'qnashuv tez-tez |
| Optimistik (versiya) | Foydalanuvchi tahrirlash oqimlari (formalar); to'qnashuv kam |

## Psevdokod: tranzaksiya chegarasi

```text
// Noto'g'ri: tashqi chaqiruv tranzaksiya ichida
BEGIN
  save(order)
  paymentGateway.charge(...)      // 3 soniya — satrlar qulflangan; yiqilsa — rollback, lekin pul yechilgan bo'lishi mumkin
  sendEmail(...)
COMMIT

// To'g'ri: tranzaksiya — faqat DB ishlari; tashqi ta'sirlar — tranzaksiyadan keyin, outbox orqali
BEGIN
  save(order)
  outbox.add(ChargeRequested(order.id))
COMMIT
worker: outbox → payment → natija hodisasi → order.markPaid()   (27-bob)
```

Qoida: **tranzaksiya qisqa** va ichida tarmoq yo'q. "Bitta tranzaksiya — bitta aggregate" (13-bob).

## Framework'larda

| Mavzu | Symfony / Doctrine | Laravel | Frontend tomoni |
| --- | --- | --- | --- |
| Tranzaksiya | `wrapInTransaction()` | `DB::transaction()` (deadlock'da qayta urinish soni bilan) | — |
| Optimistik | `#[ORM\Version]` → `OptimisticLockException` | Versiya ustuni qo'lda | 409 → "qayta yuklang" xabari |
| Pessimistik | `LockMode::PESSIMISTIC_WRITE` | `lockForUpdate()` | — |
| Taqsimlangan qulf | Lock komponenti — [Symfony 28-bob](../symfony/28-cache-lock-httpclient.md) | `Cache::lock()` — [Laravel 27-bob](../laravel/27-kesh-va-fayllar.md) | — |
| Ikki marta yuborish | — | — | `exhaustMap`, `submitting()` bilan tugmani o'chirish — [Angular 68](../angular/68-rxjs-chuqur.md), [51-bob](../angular/51-signal-forms-yuborish.md) |

Frontend konkurentlikni **hal qilmaydi**, lekin xabar qiladi: optimistik qulflash 409 qaytarsa — "Bu yozuv boshqa foydalanuvchi tomonidan o'zgartirildi" + yangi versiyani ko'rsatish. Ikki marta bosishdan himoya — UX, lekin server idempotentligi (70-bob) — kafolat.

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| Sukut izolyatsiya + atomik UPDATE | Tez, oddiy | Murakkab invariantlar uchun yetmaydi |
| Serializable | Eng kuchli kafolat | To'qnashuvlar, retry mantiqi |
| Pessimistik qulf | Aniq, oldindan himoya | Kutish, deadlock, masshtab |
| Optimistik qulf | Qulf yo'q, masshtab | Konfliktda foydalanuvchi qayta urinadi |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| "SELECT, tekshir, UPDATE" himoyasiz | Lost update | Atomik UPDATE / qulf |
| Tarmoq chaqiruvi tranzaksiya ichida | Uzoq qulflar, nomuvofiq holat | Outbox |
| Uzoq tranzaksiyalar | Deadlock, sekinlik | Qisqa, bitta aggregate |
| Serializable'siz retry'ga tayyorlanmaslik | Kutilmagan 500 | Retry siyosati |
| Konkurentlikni faqat frontend'da to'sish | Ikki tab, API — baribir o'tadi | Server kafolati |

## Amaliyot

1. "Qoldiqni kamaytirish" kodingizni toping — lost update'dan himoyalanganmi?
2. Ikki parallel so'rov bilan sinang (`ab`, `k6` yoki ikki terminal) — natija to'g'rimi?
3. Admin tahrirlash formasiga optimistik qulf qo'shing va 409 ni frontend'da ko'rsating.
4. Tranzaksiya ichida tarmoq chaqiruvlarini qidiring.

## Manbalar

- Martin Kleppmann — *Designing Data-Intensive Applications*, 7-bob (tranzaksiyalar)
- PostgreSQL — *Transaction Isolation* <https://www.postgresql.org/docs/current/transaction-iso.html>
- Martin Fowler — *PoEAA*: Optimistic / Pessimistic Offline Lock
