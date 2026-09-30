# 35 — Backend testlash strategiyasi

[← Oldingi: Rejalashtirilgan ishlar](34-rejalashtirilgan-ishlar.md) · [Mundarija](README.md) · [Keyingi: Frontend arxitekturasi nimani hal qiladi →](36-frontend-arxitekturasi.md)

## Tushuncha

Test strategiyasi — "qanday test yozish" emas, **qaysi riskni qaysi test bilan qoplash** qarori. Backend uchun asosiy qatlamlar:

| Tur | Nimani tekshiradi | Tezlik | Mo'rtlik |
| --- | --- | --- | --- |
| **Birlik** (unit) | Domen qoidalari, sof funksiyalar | ms | Past |
| **Integratsiya** | Kod + haqiqiy DB / navbat / kesh | 10–500 ms | O'rta |
| **API (funksional)** | HTTP so'rov → javob, oxirigacha | 50–500 ms | O'rta |
| **Kontrakt** | Servislar/klient bilan shartnoma | ms–s | Past |
| **E2E** | Butun tizim, brauzer bilan | soniyalar | Yuqori |

## Nega shunday

Klassik "test piramidasi" (ko'p unit, kam E2E) — backend uchun ko'pincha to'g'ri, lekin bitta tuzatish bilan: **integratsiya va API testlari** zamonaviy vositalar bilan (konteynerdagi haqiqiy DB, tranzaksion rollback) yetarlicha tez va ular **haqiqiy xatolarni** ko'proq ushlaydi. Ko'p backend xatolari — SQL, ORM mapping, tranzaksiya, serializatsiya, ruxsat — mock'langan unit testda ko'rinmaydi.

Arxitektura testlashga ta'sir qiladi: hexagonal (15-bob) domenni DB'siz testlash imkonini beradi; "hamma narsa controller'da" — faqat sekin API testlari.

## Psevdokod: nimani qaysi darajada

```text
Domen invariantlari        → unit (Order.markPaid rad etadi, Money valyutalarni aralashtirmaydi)
Use case oqimi             → unit + fake portlar (InMemoryOrders, FakePayments)
Repository so'rovlari      → integratsiya (haqiqiy PostgreSQL, Testcontainers)
HTTP: status, validatsiya, ruxsat, serializatsiya → API testlari
Tashqi API integratsiyasi  → kontrakt/"recorded" testlar + sandbox'da vaqti-vaqti bilan
Asosiy biznes oqimi (checkout) → bir nechta E2E (frontend kitoblaridagi Playwright)
```

## Psevdokod: ruxsat testlari — eng ko'p unutiladigan

```text
test "boshqa foydalanuvchi buyurtmasini ko'ra olmaydi":
    alice = createUser(); bob = createUser()
    order = createOrder(owner = alice)
    response = as(bob).GET("/api/orders/" + order.id)
    assert response.status == 404          // 403 emas — mavjudligini ham oshkor qilmaslik

test "oddiy foydalanuvchi admin endpoint'iga kira olmaydi"
test "tenant A tenant B ma'lumotini ko'rmaydi"         (33-bob)
test "login 6-urinishda 429"                            (30-bob)
```

BOLA (Broken Object Level Authorization) — API xavflarining birinchisi (77-bob). Har resurs endpoint'i uchun "begona resurs" testi — shablon qilib qo'ying.

## Psevdokod: test ma'lumotlari

```text
Qoidalar:
  - Har test o'z ma'lumotini yaratadi (factory), umumiy "fixture" holatiga tayanmaydi
  - Test oxirida rollback yoki toza DB — testlar tartibdan mustaqil
  - Vaqt, UUID, tasodif — boshqariladigan (Clock, 10-bob)
  - Tashqi tizimlar — fake yoki HTTP mock (so'rovni tekshirish bilan)

Anti-naqsh: 3000 qatorli umumiy fixture fayli — bitta testni o'zgartirish 40 ta boshqasini buzadi
```

## Psevdokod: kontrakt testlar

```text
Muammo: backend javob formatini o'zgartirdi → frontend buzildi → faqat production'da ma'lum bo'ldi

Consumer-driven contract (Pact):
  1. Frontend (iste'molchi) kutganini yozadi: GET /orders/42 → { id, status, total }
  2. Backend (provayder) CI'da shu kutishlarni o'z kodiga qarshi tekshiradi
  3. Buzilsa — backend PR'i o'tmaydi

Yengilroq variant — OpenAPI sxemasi (54-bob):
  - Backend javoblari sxemaga mosligini API testlarida tekshirish
  - Frontend tiplari sxemadan generatsiya
```

## Framework'larda

| Ehtiyoj | Symfony | Laravel |
| --- | --- | --- |
| Unit | PHPUnit — [Symfony 30-bob](../symfony/30-testlash.md) | PHPUnit / Pest — [Laravel 29-bob](../laravel/29-testlash.md) |
| API testlari | `WebTestCase`, `KernelBrowser` | `$this->getJson()`, `assertJson` |
| Ma'lumot | Foundry factory'lari, DAMA DoctrineTestBundle (rollback) — [Symfony 19-bob](../symfony/19-fixtures.md) | Model factory'lar, `RefreshDatabase` — [Laravel 18-bob](../laravel/18-factory-va-seeder.md) |
| Tashqi HTTP | `MockHttpClient` | `Http::fake()` |
| Navbat/hodisa | Messenger `in-memory` transport | `Queue::fake()`, `Event::fake()` |
| Arxitektura qoidalari | Deptrac CI'da | Pest `arch()` testlari, Deptrac |

Frontend testlash strategiyasi — 52-bob va frontend kitoblari ([Angular 71–73](../angular/71-birlik-testlari.md), [React 43](../react/43-testlash-strategiyasi.md), [Vue 51-bob](../vue/51-testlash-strategiyasi.md)). Ikki tomon kelishuvi: frontend E2E'da **asosiy oqimlar**, backend'da — **ruxsat va biznes qoidalari**; shartnoma — kontrakt/OpenAPI bilan.

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| Ko'p unit, mock'lar bilan | Juda tez | Integratsiya xatolari o'tib ketadi, refaktorda mock'lar buziladi |
| Ko'p integratsiya/API | Haqiqiy xatolar ushlanadi | Sekinroq, infratuzilma (DB konteyner) |
| Ko'p E2E | Foydalanuvchi ko'zi bilan | Sekin, mo'rt, debug qiyin |
| Kontrakt testlar | Servislar/klient buzilishi erta | Sozlash va intizom |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Repository'ni mock qilib "integratsiya" deb atash | SQL xatolari ko'rinmaydi | Haqiqiy DB bilan |
| Ruxsat testlari yo'q | BOLA zaifliklari | Har resursga "begona" testi |
| Umumiy fixture holati | Testlar bir-biriga bog'liq | Har test o'z factory ma'lumoti |
| Coverage — maqsad | Ma'nosiz testlar | Riskka qarab |
| Beqaror (flaky) testlarni e'tiborsiz qoldirish | Jamoa yiqilishlarga e'tibor bermay qo'yadi | Darhol tuzatish yoki karantin |
| Testlar faqat lokal | Regressiya o'tib ketadi | CI'da har PR'da |

## Amaliyot

1. Eng muhim 5 endpoint uchun "begona foydalanuvchi" ruxsat testini yozing.
2. Bitta repository testini mock'dan haqiqiy DB (Testcontainers yoki test DB) ga o'tkazing.
3. Test to'plamining vaqtini o'lchang: eng sekin 10 testni toping.
4. API javoblaringizni OpenAPI sxemasiga qarshi tekshiruvchi test qo'shing.

## Manbalar

- Martin Fowler — *The Practical Test Pyramid* <https://martinfowler.com/articles/practical-test-pyramid.html>
- Kent C. Dodds — *The Testing Trophy* <https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications>
- Pact: <https://docs.pact.io>
