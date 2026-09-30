# 33 — Ko'p ijarachilik

[← Oldingi: Fayl va media](32-fayl-va-media.md) · [Mundarija](README.md) · [Keyingi: Rejalashtirilgan ishlar →](34-rejalashtirilgan-ishlar.md)

## Tushuncha

Ko'p ijarachilik (multi-tenancy) — bitta tizim ko'p mijoz tashkilotiga (**tenant**) xizmat qiladi, har biri o'z ma'lumotini ko'radi va boshqalarnikini ko'rmaydi. SaaS'ning asosi: CRM, ERP, onlayn do'kon konstruktori.

Uch asosiy model:

| Model | Tuzilish | Izolyatsiya | Narx |
| --- | --- | --- | --- |
| **Umumiy jadvallar** | Bitta DB, har jadvalda `tenant_id` | Mantiqiy (kodda) | Eng arzon |
| **Alohida sxema** | Bitta DB, har tenant — o'z sxemasi | O'rta | O'rta |
| **Alohida DB** | Har tenant — o'z bazasi (yoki serveri) | Eng kuchli | Eng qimmat |

## Nega shunday

Ko'p ijarachilikda eng qo'rqinchli xato — **tenantlararo ma'lumot sizishi**: A kompaniya B kompaniyaning mijozlarini ko'radi. Bu — ishonch va huquqiy muammo. Shuning uchun asosiy savol: **izolyatsiya qayerda kafolatlanadi** — har dasturchining har so'rovidami, yoki tizim darajasida?

## Psevdokod: umumiy jadvallar — izolyatsiyani majburlash

```text
// Xavfli: har so'rovda qo'lda
SELECT * FROM invoices WHERE tenant_id = :t AND status = 'unpaid'
// Bitta unutilgan "AND tenant_id" — sizish

// Yaxshiroq: markaziy filtr — ORM global scope / query filter
TenantContext.current = resolveTenant(request)        // subdomen, token, header
ORM filter: har SELECT/UPDATE/DELETE ga avtomatik "tenant_id = current"
INSERT: tenant_id avtomatik qo'yiladi

// Eng kuchli: DB darajasida — PostgreSQL Row Level Security
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON invoices USING (tenant_id = current_setting('app.tenant_id')::uuid);
-- har ulanishda: SET app.tenant_id = '...'
-- kod xato qilsa ham DB boshqa tenant satrini qaytarmaydi
```

## Psevdokod: tenant qanday aniqlanadi

```text
Variantlar:
  subdomen:   acme.shop.uz           → tenant "acme"
  domen:      shop.acme.uz (custom)  → domenlar jadvali orqali
  token:      JWT ichida tenant_id   (foydalanuvchi bir necha tenantda bo'lsa — tanlangani)
  header:     X-Tenant-Id            → FAQAT token bilan solishtirib (klient bergan qiymatga ishonmaslik!)

Qoida: tenant — foydalanuvchi a'zoligi bilan tekshiriladi. "Men acme'da a'zomanmi?" — har so'rovda.
```

## Psevdokod: adolat va "shovqinli qo'shni"

```text
Bitta katta tenant eksport boshladi → DB yuklandi → hamma tenantlar sekinlashdi

Himoya:
  - Tenant bo'yicha rate limit va kvotalar (30-bob)
  - Og'ir ishlar navbatda, tenant bo'yicha adolatli navbat (har tenantga ulush)
  - Juda katta tenant — alohida DB/servisga ko'chirish (gibrid model)
```

Gibrid — amalda keng tarqalgan: kichik tenantlar umumiy jadvallarda, yirik ("enterprise") mijozlar — alohida DB'da. Kod bir xil, ulanish konfiguratsiyasi farqli.

## Psevdokod: kesh, fayl, qidiruv — ham tenant bo'yicha

```text
kesh kaliti:      "t:{tenant}:product:{id}"          (25-bob)
fayl kaliti:      "tenants/{tenant}/invoices/{uuid}.pdf"   (32-bob)
qidiruv filtri:   tenant_id — so'rov ichida majburiy (29-bob)
navbat xabari:    { tenantId, ... } — worker kontekstni tiklaydi
loglar:           har yozuvda tenant_id
```

Izolyatsiya faqat DB'da bo'lsa, kesh yoki qidiruv orqali sizish mumkin.

## Framework'larda

| Ehtiyoj | Symfony | Laravel | Frontend |
| --- | --- | --- | --- |
| Global filtr | Doctrine SQL filter (`addFilterConstraint`) | Global scope (`addGlobalScope`), paketlar: stancl/tenancy, spatie/laravel-multitenancy | — |
| Tenant konteksti | Request listener → servis — [Symfony 12-bob](../symfony/12-event-listener.md) | Middleware — [Laravel 10-bob](../laravel/10-middleware.md) | Subdomen/marshrut prefiksi |
| Worker'da kontekst | Messenger stamp bilan tenant ID | Job'da tenant ID, `tenancy()->initialize()` | — |
| UI | — | — | Tenant almashtirgich, har tenant uchun tema (dizayn tokenlari — 43-bob) |

Frontend uchun muhim nozik joy: tenant almashtirilganda **barcha klient keshini tozalash** (TanStack Query `clear()`, store'larni `reset()`) — aks holda oldingi tenant ma'lumoti bir lahza ko'rinadi. Bu — Angular kitobidagi "logout'da tozalash" naqshining ([Angular 39-bob](../angular/39-di-naqshlari.md)) tenant versiyasi.

## Trade-off

| Model | Yutuq | Narx |
| --- | --- | --- |
| Umumiy jadvallar | Arzon, oson migratsiya, bitta sxema | Izolyatsiya — kod intizomi yoki RLS; shovqinli qo'shni |
| Alohida sxema | Yaxshiroq izolyatsiya, tenant bo'yicha zaxira | 1000 sxemaga migratsiya — sekin |
| Alohida DB | Maksimal izolyatsiya, alohida masshtab, ma'lumot joylashuvi talablari | Ops narxi, har DB'ga migratsiya, tenantlararo hisobot qiyin |
| Gibrid | Kichik va katta mijozlarga mos | Ikki xil yo'l — murakkablik |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Har so'rovda qo'lda `tenant_id` | Bitta unutish — sizish | Global filtr + RLS |
| Klient bergan `X-Tenant-Id` ga ishonish | Boshqa tenantga kirish | A'zolikni server tekshiradi |
| Kesh kalitida tenant yo'q | Keshdan sizish | Barcha kalitlarda tenant |
| Worker'da tenant konteksti yo'q | Fon ishlari noto'g'ri tenant ma'lumotida | Xabarda tenant ID |
| Tenantlararo testlar yo'q | Sizish testda ko'rinmaydi | "A tenant B ma'lumotini ko'rmaydi" avtomatik testi |
| Tenant almashganda frontend kesh tozalanmaydi | Bir lahza begona ma'lumot | Barcha klient holatini reset |

## Amaliyot

1. Loyihangizdagi barcha so'rovlarda tenant filtri bormi — global filtr bilan markazlashtiring.
2. Bitta jadvalga PostgreSQL RLS qo'shib sinang.
3. "Tenant A foydalanuvchisi tenant B resursini ID bo'yicha so'raydi" avtomatik testini yozing.
4. Kesh, fayl va qidiruv kalitlarida tenant borligini tekshiring.

## Manbalar

- Microsoft — *Multitenant SaaS patterns* <https://learn.microsoft.com/azure/azure-sql/database/saas-tenancy-app-design-patterns>
- PostgreSQL — *Row Security Policies* <https://www.postgresql.org/docs/current/ddl-rowsecurity.html>
- AWS — *SaaS Tenant Isolation Strategies* (whitepaper)
