# 15 — Qatlamli, olti burchakli, Clean

[← Oldingi: DDD: til va kontekst](14-ddd.md) · [Mundarija](README.md) · [Keyingi: Vertical slice va feature-based →](16-vertical-slice.md)

## Tushuncha

Uch mashhur yondashuv — bitta g'oyaning uch ko'rinishi: **biznes mantiqni texnik tafsilotdan himoya qilish**.

```text
Qatlamli (Layered)          Olti burchakli (Hexagonal, Ports & Adapters)     Clean Architecture
┌────────────────┐                  ┌─────────────┐                        ┌───────────────────────┐
│ Presentation   │         HTTP ───▶│   Port      │◀─── CLI                │ Frameworks & Drivers  │
├────────────────┤                  │  ┌───────┐  │                        │ ┌───────────────────┐ │
│ Application    │                  │  │ Domen │  │                        │ │ Interface Adapters│ │
├────────────────┤                  │  └───────┘  │                        │ │ ┌───────────────┐ │ │
│ Domain         │          DB ◀────│   Port      │────▶ Email             │ │ │ Use Cases     │ │ │
├────────────────┤                  └─────────────┘                        │ │ │ ┌───────────┐ │ │ │
│ Infrastructure │                                                         │ │ │ │ Entities  │ │ │ │
└────────────────┘                                                         └─┴─┴─┴───────────┴─┴─┴─┘
 bog'liqlik: yuqoridan pastga      bog'liqlik: tashqaridan ichkariga        bog'liqlik: faqat ichkariga
```

| Yondashuv | Asosiy qoida |
| --- | --- |
| Qatlamli | Har qatlam faqat pastdagisiga murojaat qiladi |
| Hexagonal (Alistair Cockburn) | Domen **portlar** (interfeyslar) e'lon qiladi, tashqi dunyo **adapterlar** orqali ulanadi |
| Clean (Robert Martin) | Bog'liqlik faqat markazga qarab; ichki doira tashqisini bilmaydi |

## Nega shunday

Klassik qatlamli arxitekturada `Domain` → `Infrastructure` ga bog'liq (domen DB'ni chaqiradi). Natijada biznes qoidalari ORM, SQL, framework'ga bog'lanadi: testda DB kerak, framework yangilanishi domenni buzadi.

Hexagonal va Clean — **8-bobdagi D** (dependency inversion) ni arxitektura darajasiga ko'taradi: infratuzilma domenga bog'liq, aksincha emas.

```text
Klassik:     Domain ──────▶ Infrastructure (Doctrine, SMTP)
Teskari:     Domain ◀────── Infrastructure
             (Domain: interface OrderRepository)   (Infrastructure: DoctrineOrderRepository implements OrderRepository)
```

## Psevdokod: portlar va adapterlar

```text
// Domen / Application — framework'siz
interface OrderRepository    { save(order); get(id) }              // chiquvchi port
interface PaymentGateway     { charge(money, token) -> Result }    // chiquvchi port
class PlaceOrderHandler(orders: OrderRepository, payments: PaymentGateway):   // kiruvchi port (use case)
    handle(cmd: PlaceOrder):
        order = Order.place(cmd.customerId, cmd.items)
        result = payments.charge(order.total(), cmd.paymentToken)
        if result.failed: return Error(result.reason)
        order.markPaid(result.confirmation)
        orders.save(order)
        return Ok(order.id)

// Adapterlar — framework bilan
class HttpOrderController:                 // kiruvchi adapter
    post(request): handler.handle(PlaceOrder.from(request.json))
class CliImportCommand:                    // yana bir kiruvchi adapter — o'sha use case
class DoctrineOrderRepository implements OrderRepository    // chiquvchi adapter
class ClickPaymentGateway implements PaymentGateway         // chiquvchi adapter
class InMemoryOrderRepository implements OrderRepository    // test adapteri
```

Foyda: `PlaceOrderHandler` ni **DB, HTTP va to'lov tizimisiz** millisekundlarda test qilish mumkin. HTTP o'rniga CLI yoki navbat xabari — use case o'zgarmaydi.

## Psevdokod: papka tuzilishi

```text
src/Ordering/
├── Domain/            Order, OrderLine, Money, OrderRepository (interfeys), hodisalar
├── Application/       PlaceOrderHandler, GetOrderQuery, PaymentGateway (interfeys)
├── Infrastructure/    DoctrineOrderRepository, ClickPaymentGateway
└── UI/ (yoki Http/)   Controller'lar, DTO'lar, CLI buyruqlar

Qoidalar (CI'da tekshiriladi):
  Domain        → hech narsaga (faqat standart kutubxona)
  Application   → Domain
  Infrastructure→ Application, Domain, framework
  UI            → Application
```

## Framework'larda

| Stack | Qanday qo'llanadi | Qayerda |
| --- | --- | --- |
| Symfony | Konteyner interfeysni adapterga bog'laydi (autowiring alias); Messenger — kiruvchi adapter; Deptrac qatlam qoidalari | [Symfony 39-bob](../symfony/39-arxitektura.md), [5-bob](../symfony/05-service-container.md) |
| Laravel | Service provider'da `bind(OrderRepository::class, EloquentOrderRepository::class)`; Eloquent — Active Record, domen modelini ajratish qiyinroq | [Laravel 5](../laravel/05-service-container.md), [6-bob](../laravel/06-service-provider.md) |
| Angular | Abstrakt klass — port, `useClass` — adapter; komponent → fasad → API xizmati yo'nalishi | [Angular 36-bob](../angular/36-provayder-turlari.md), [39-bob](../angular/39-di-naqshlari.md) |
| React / Vue | Custom hook/composable — use case; API qatlami — adapter; komponent — UI | [React 34-bob](../react/34-arxitektura.md), [Vue 44-bob](../vue/44-http-qatlami.md) |

Frontend'da to'liq Clean Architecture kamdan-kam kerak — ko'p frontend kodi **UI mantiq**, biznes qoidalari esa backend'da. Lekin bitta qoida qimmatli: **komponent API/HTTP ni to'g'ridan-to'g'ri bilmasin** — oradagi xizmat/hook/composable adapter vazifasini bajaradi.

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| Framework'ga to'g'ridan-to'g'ri (controller → ORM) | Eng kam kod, tez | Biznes framework'ga bog'lanadi; test DB bilan |
| Qatlamli | Tushunarli, keng tarqalgan | Domen infratuzilmaga bog'liq (klassik variantda) |
| Hexagonal / Clean | Domen izolyatsiyasi, tez testlar, almashtirish | Ko'proq fayl va interfeys; CRUD uchun ortiqcha |

**Qayerda arziydi:** murakkab biznes qoidalari, uzoq yashaydigan tizim, bir nechta kirish nuqtasi (HTTP + navbat + CLI). **Qayerda ortiqcha:** oddiy CRUD, admin panellar, prototiplar — u yerda framework yo'li yetarli. Bir loyihada ikkalasi bo'lishi mumkin: "Ordering" moduli — hexagonal, "Settings" — oddiy CRUD.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Domen ORM annotatsiyalari/Eloquent'ga bog'liq | Izolyatsiya nominal | Mapping infratuzilmada (XML/atributlar — kelishuv bilan) yoki alohida model |
| Interfeys infratuzilma papkasida | Inversiya yo'q | Port — domen/application'da |
| Har CRUD uchun 5 qatlam | Marosim | Murakkablikka qarab tanlash |
| Qatlam qoidalari tekshirilmaydi | Tez buziladi | Deptrac / ESLint boundaries |
| Controller'da biznes mantiq | Boshqa kirish nuqtasi (CLI) takrorlaydi | Use case klassi |

## Amaliyot

1. Eng muhim use case'ingizni oling: uni DB va HTTP'siz test qilish mumkinmi?
2. Bitta tashqi xizmat uchun port (interfeys) va ikki adapter (haqiqiy + test) yozing.
3. Modulingiz uchun qatlam qoidalarini Deptrac/ESLint'da yozing va buzilishlarni sanang.
4. Qaysi modullaringiz hexagonal'ga arziydi, qaysilari oddiy CRUD — ro'yxat tuzing.

## Manbalar

- Alistair Cockburn — *Hexagonal Architecture* <https://alistair.cockburn.us/hexagonal-architecture/>
- Robert C. Martin — *Clean Architecture*
- Herberto Graça — *DDD, Hexagonal, Onion, Clean, CQRS… How I put it all together* <https://herbertograca.com/2017/11/16/explicit-architecture-01-ddd-hexagonal-onion-clean-cqrs-how-i-put-it-all-together/>
