# 28 — CQRS va o'qish modellari

[← Oldingi: Hodisaga asoslangan arxitektura](27-hodisalar.md) · [Mundarija](README.md) · [Keyingi: Qidiruv arxitekturasi →](29-qidiruv.md)

## Tushuncha

CQRS (Command Query Responsibility Segregation) — **yozish** va **o'qish** uchun alohida modellar.

```text
Buyruqlar (yozish)                         So'rovlar (o'qish)
PlaceOrder ──▶ [Domen modeli] ──▶ DB       GET /orders ──▶ [O'qish modeli] ──▶ tayyor ko'rinish
                invariantlar                               JOIN'siz, denormalizatsiyalangan
```

Uch daraja — hammasi ham "katta CQRS" emas:

| Daraja | Nima | Murakkablik |
| --- | --- | --- |
| 1. Kod darajasida | Buyruq handler'lari domen modelidan, so'rovlar — to'g'ridan-to'g'ri SQL | Past |
| 2. Alohida o'qish jadvallari | Hodisalar asosida yangilanadigan "ko'rinish" jadvallari | O'rtacha |
| 3. Alohida o'qish bazasi | Elasticsearch, alohida replika, boshqa DB turi | Yuqori |

## Nega shunday

Yozish va o'qish ehtiyojlari **boshqacha**:

| Yozish | O'qish |
| --- | --- |
| Invariantlarni tekshirish | Tez va qulay shakl |
| Bitta aggregate (13-bob) | Ko'p aggregate birlashtirilgan |
| Kam, lekin muhim | Ko'p (odatda 10–100× ko'p) |
| Normalizatsiyalangan | Sahifaga moslangan |

Bitta model ikkalasiga xizmat qilsa — domen modeli o'qish uchun keraksiz maydonlar bilan "semiradi", o'qish so'rovlari esa ORM orqali N+1 va sekin JOIN'lar bilan og'irlashadi.

## Psevdokod: 1-daraja — eng ko'p kerak bo'ladigani

```text
// Yozish — domen modeli orqali
class CancelOrderHandler:
    handle(cmd):
        order = orders.get(cmd.orderId)      // aggregate
        order.cancel(cmd.reason)             // invariantlar
        orders.save(order)

// O'qish — domen modelini chetlab, sahifaga kerakli shaklda
class ListCustomerOrdersQuery:
    handle(customerId, page):
        return sql("""
            SELECT o.id, o.placed_at, o.status, o.total, COUNT(l.*) AS items
            FROM orders o JOIN order_lines l ON l.order_id = o.id
            WHERE o.customer_id = :c GROUP BY o.id ORDER BY o.placed_at DESC LIMIT 20 OFFSET :off
        """) → OrderListItem[]              // DTO, entity emas
```

Bu — vertical slice (16-bob) bilan tabiiy mos: har so'rov o'z optimal SQL'i bilan.

## Psevdokod: 2-daraja — proyeksiya

```text
// Dashboard: "mijozning jami xaridlari, oxirgi buyurtma sanasi, sevimli kategoriya"
// Har ochilishda hisoblash — qimmat

customer_stats(customer_id PK, total_spent, orders_count, last_order_at, top_category)

on OrderPaid(e):
    UPSERT customer_stats SET total_spent += e.total, orders_count += 1, last_order_at = e.at
on OrderRefunded(e):
    UPDATE customer_stats SET total_spent -= e.amount

// Proyeksiyani qayta qurish imkoni bo'lsin: hodisalar/asosiy jadvallardan to'liq hisoblash skripti
```

Proyeksiya — **nusxa**, haqiqat manbai emas. Buzilsa — o'chirib, qayta quriladi.

## Psevdokod: izchillik va UX

```text
Foydalanuvchi buyurtmani bekor qildi → yozish tugadi → proyeksiya 500 ms keyin yangilanadi
Sahifa darhol ro'yxatni qayta yuklasa — buyurtma hali "faol" ko'rinadi

Yechimlar:
a) Buyruq javobida yangi holatni qaytarish; frontend uni ishlatadi (optimistik yangilash)
b) Frontend'da optimistik UI (42-bob)
c) Kritik joylarda o'qishni yozish modelidan ("o'z yozuvimni o'qish" — read-your-writes)
```

## Framework'larda

| Ehtiyoj | Backend | Frontend |
| --- | --- | --- |
| Buyruq/so'rov ajratish | Symfony Messenger — command bus va query bus (`HandleTrait`) — [26-bob](../symfony/26-messenger.md) | — |
| O'qish DTO | Doctrine `NEW` DTO so'rovlari, DBAL — [Symfony 17-bob](../symfony/17-repository-va-dql.md); Laravel Query Builder → API Resource — [Laravel 20-bob](../laravel/20-api-resurslar.md) | Frontend'ga sahifaga moslangan DTO keladi |
| Proyeksiyalar | Hodisa tinglovchilari (Messenger / queued listeners) | — |
| Frontend'da ajratish | — | O'qish: `httpResource`/TanStack Query; yozish: alohida metodlar + `reload()`/invalidatsiya — [Angular 60-bob](../angular/60-signal-xizmatlar.md), [React 32-bob](../react/32-tanstack-query.md) |

Frontend'da bu ajratish allaqachon tabiiy: `httpResource` — **faqat o'qish uchun**, mutatsiyalar — `HttpClient` metodlari ([Angular 55-bob](../angular/55-http-client.md)). TanStack Query'da `useQuery` va `useMutation`. G'oya — CQRS'ning klient tomoni.

## Trade-off

| Daraja | Yutuq | Narx |
| --- | --- | --- |
| Bitta model | Oddiy | O'qish sekinlashadi, model semiradi |
| 1-daraja (kod) | Tez o'qish, toza domen | Deyarli yo'q — ko'p loyiha uchun eng yaxshi nisbat |
| 2-daraja (proyeksiya) | Og'ir hisoblar oldindan | Eventual consistency, qayta qurish mexanizmi |
| 3-daraja (alohida DB) | Maksimal masshtab, maxsus qidiruv | Sinxronlash infratuzilmasi, ikki tizim |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| O'qish uchun aggregate'larni yuklash | N+1, sekin | O'qish uchun to'g'ridan-to'g'ri so'rov |
| CQRS = albatta alohida DB | Keraksiz murakkablik | 1-darajadan boshlash |
| Proyeksiyani haqiqat manbai deb bilish | Buzilsa — tiklab bo'lmaydi | Qayta qurish skripti |
| Eventual consistency'ni UX'da e'tiborsiz | "Bekor qildim, lekin ko'rinmayapti" | Read-your-writes, optimistik UI |
| Buyruq handler'i ma'lumot qaytaradi (katta) | Ajratish ma'nosi yo'qoladi | Buyruq — ID/natija; o'qish — alohida |

## Amaliyot

1. Eng sekin ro'yxat sahifangizni domen modelisiz, bitta SQL bilan qayta yozing va vaqtni solishtiring.
2. Dashboard uchun bitta proyeksiya jadvali va uni qayta quruvchi skript yozing.
3. Bekor qilish/yangilashdan keyin UI eski holatni ko'rsatadigan joy bormi? Tuzating.
4. Frontend'da o'qish va yozish kodi aralashgan joyni toping.

## Manbalar

- Martin Fowler — *CQRS* <https://martinfowler.com/bliki/CQRS.html>
- Greg Young — *CQRS Documents* <https://cqrs.files.wordpress.com/2010/11/cqrs_documents.pdf>
- Microsoft — *CQRS pattern* <https://learn.microsoft.com/azure/architecture/patterns/cqrs>
