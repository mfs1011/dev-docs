# 39 — Arxitektura: qatlamlar, CQRS-lite, modullar

[← Oldingi: API pro](38-api-pro.md) · [Mundarija](README.md) · [Keyingi: Deploy va checklist →](40-deploy-va-checklist.md)

---

## Standart tuzilma qachon yetmaydi

Symfony'ning standart tuzilmasi (`Controller/`, `Entity/`, `Repository/`, `Service/`) 20–50 klassli loyihada mukammal ishlaydi. 300+ klassda esa muammo paydo bo'ladi: `Service/` papkasida 80 ta fayl bo'ladi va ularning qaysi biri qaysi biznes sohasiga tegishli ekani ko'rinmay qoladi.

**Muhim ogohlantirish:** arxitekturani "kelajak uchun" oldindan murakkablashtirmang. Har qatlam — qo'shimcha kod, qo'shimcha xarajat. Quyidagilar **muammo paydo bo'lganda** qo'llaniladigan vositalar, majburiy standart emas.

---

## Qatlamli tuzilma

```
src/
├─ Domain/              ← biznes qoidalari, framework'ga bog'liq emas
│  ├─ Order/
│  │  ├─ Order.php
│  │  ├─ OrderStatus.php
│  │  ├─ OrderRepositoryInterface.php
│  │  └─ Exception/OrderCannotBeCancelled.php
├─ Application/         ← stsenariylar (use case)
│  ├─ Order/
│  │  ├─ PlaceOrder/PlaceOrderCommand.php
│  │  ├─ PlaceOrder/PlaceOrderHandler.php
│  │  └─ GetOrderList/GetOrderListQuery.php
├─ Infrastructure/      ← Doctrine, HTTP mijozlar, fayl tizimi
│  ├─ Doctrine/DoctrineOrderRepository.php
│  └─ Payment/StripeGateway.php
└─ UI/                  ← kirish nuqtalari
   ├─ Http/OrderController.php
   └─ Cli/ImportOrdersCommand.php
```

Bog'liqlik yo'nalishi qat'iy: `UI → Application → Domain`, `Infrastructure → Domain`. **Domen hech kimga bog'lanmaydi.**

```php
// src/Domain/Order/OrderRepositoryInterface.php
namespace App\Domain\Order;

interface OrderRepositoryInterface
{
    public function find(OrderId $id): ?Order;

    public function save(Order $order): void;
}
```

```php
// src/Infrastructure/Doctrine/DoctrineOrderRepository.php
namespace App\Infrastructure\Doctrine;

use App\Domain\Order\Order;
use App\Domain\Order\OrderId;
use App\Domain\Order\OrderRepositoryInterface;
use Doctrine\ORM\EntityManagerInterface;

final class DoctrineOrderRepository implements OrderRepositoryInterface
{
    public function __construct(private EntityManagerInterface $em)
    {
    }

    public function find(OrderId $id): ?Order
    {
        return $this->em->find(Order::class, $id->value);
    }

    public function save(Order $order): void
    {
        $this->em->persist($order);
        $this->em->flush();
    }
}
```

Interfeys **domenda**, implementatsiya **infratuzilmada** — bu Dependency Inversion prinsipi ([05-bob](05-service-container.md)). Natijada domen mantiqini Doctrine'siz test qilish mumkin, va saqlash texnologiyasini almashtirish nazariy emas.

**Halol baho:** bu yondashuvning narxi bor — ko'proq klass, ko'proq xaritalash. U murakkab domenli tizimlarda (buxgalteriya, logistika, to'lovlar) o'zini oqlaydi; oddiy CRUD'da esa ortiqcha.

---

## CQRS-lite

To'liq CQRS (alohida yozish/o'qish bazalari, event sourcing) — kam holatda kerak. Lekin uning **arzon qismi** deyarli har doim foydali: **buyruqlar va so'rovlarni ajratish**.

```php
// Yozish: Messenger command bus orqali
final readonly class PlaceOrderCommand
{
    public function __construct(
        public int $customerId,
        /** @var list<array{productId: int, quantity: int}> */
        public array $items,
    ) {
    }
}

#[AsMessageHandler]
final class PlaceOrderHandler
{
    public function __invoke(PlaceOrderCommand $command): OrderId
    {
        // domen mantiqi, invariantlar, tranzaksiya
    }
}
```

```php
// O'qish: to'g'ridan-to'g'ri optimallashtirilgan so'rov, domen ob'ektlarisiz
final class OrderListQueryHandler
{
    public function __construct(private Connection $connection)
    {
    }

    /**
     * @return list<array{id: int, total: int, status: string}>
     */
    public function __invoke(int $customerId, int $limit): array
    {
        return $this->connection->fetchAllAssociative(
            'SELECT id, total, status FROM orders WHERE customer_id = :id ORDER BY created_at DESC LIMIT :limit',
            ['id' => $customerId, 'limit' => $limit],
        );
    }
}
```

**Nega bu foydali?** Yozish va o'qishning talablari tubdan farq qiladi:

| | Yozish | O'qish |
| --- | --- | --- |
| Maqsad | Invariantlarni saqlash | Tez va mos ko'rinish berish |
| Model | Boy domen ob'ekti | Yassi DTO / massiv |
| Optimizatsiya | To'g'rilik | Tezlik, kesh |

Ikkalasini bitta model bilan qondirishga urinish — "hamma narsa uchun bitta Entity" — ikkala tomonni ham buzadi.

---

## Modulli monolit

```
src/
├─ Catalog/
│  ├─ Domain/ Application/ Infrastructure/ UI/
├─ Ordering/
│  ├─ Domain/ Application/ Infrastructure/ UI/
└─ Shared/
```

Har modul — mustaqil "bo'lak", va **modullar bir-birining ichki klasslariga murojaat qilmaydi**. Aloqa ikki yo'l bilan: ommaviy interfeys (port) yoki hodisa ([27-bob](27-event-va-doctrine-hodisalari.md)).

Bu yondashuv mikroservislarga o'tishdan ancha arzon va ko'pincha yetarli: siz modullilik foydasini (aniq chegaralar, mustaqil rivojlanish) tarmoq murakkabligi va taqsimlangan tranzaksiyalar narxisiz olasiz.

---

## Qoidalarni majburlash

Arxitektura hujjatda emas, **vositada** yashashi kerak:

```yaml
# deptrac.yaml (qisqartirilgan)
deptrac:
    paths: ['./src']
    layers:
        - name: Domain
          collectors: [{ type: directory, value: 'src/.*/Domain/.*' }]
        - name: Application
          collectors: [{ type: directory, value: 'src/.*/Application/.*' }]
        - name: Infrastructure
          collectors: [{ type: directory, value: 'src/.*/Infrastructure/.*' }]
        - name: UI
          collectors: [{ type: directory, value: 'src/.*/UI/.*' }]
    ruleset:
        Domain: []
        Application: [Domain]
        Infrastructure: [Domain, Application]
        UI: [Application, Domain]
```

```shell
vendor/bin/deptrac analyse
```

CI'da bu bosqich bo'lsa, "shoshib turgan edim, kontrollerdan to'g'ridan-to'g'ri EntityManager chaqirdim" degan holat **pull request bosqichida** to'xtatiladi ([34-bob](34-kod-sifati.md)). Muqobil — compiler pass bilan tekshirish ([06-bob](06-container-chuqur.md)).

---

## Muhandislik nuqtai nazari: qachon murakkablashtirish kerak

Arxitektura qarorlarini quyidagi savollar bilan tekshiring:

1. **Qaysi muammoni yechyapman?** "Toza bo'lsin" — muammo emas. "Yangi to'lov provayderi qo'shish uchun 12 ta faylni o'zgartirish kerak" — muammo.
2. **Bu qaror qaytariladimi?** Papka tuzilmasi — arzon (o'zgartirish oson). Baza sxemasi, API kontrakti, xabar formati — qimmat. Qimmat qarorlarga ko'proq vaqt ajrating.
3. **Jamoa buni qo'llab-quvvatlay oladimi?** Jamoa tushunmaydigan arxitektura — buzilgan arxitektura. Eng zo'r naqsh, agar uni jamoaning yarmi noto'g'ri ishlatsa, oddiy tuzilmadan yomonroq.
4. **Qanday o'lchayman?** Arxitektura yaxshilanishining o'lchovi: o'zgartirish uchun tegiladigan fayllar soni, yangi dasturchining birinchi PR gacha vaqti, test suite tezligi, incident tiklanish vaqti.

Va eng muhim qoida: **arxitekturaviy qarorlarni yozib boring** (ADR — Architecture Decision Record). Bir sahifa: kontekst, qaror, sabab, oqibatlar. Olti oydan keyin "nega bu shunday?" savoliga javob bo'ladi va bir xil bahsni qayta o'tkazish kerak bo'lmaydi.

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Kichik loyihada to'liq DDD/CQRS | Ortiqcha kod, sekin rivojlanish | Standart tuzilmadan boshlang |
| Qatlamlarni faqat papka sifatida yaratish | Bog'liqlik yo'nalishi buziladi | `deptrac` / compiler pass |
| Domen ichida Doctrine atributlari | Domen ORM'ga bog'lanadi | XML mapping yoki alohida persistence model |
| Modul ichki klassiga to'g'ridan-to'g'ri murojaat | Modullilik yo'qoladi | Ommaviy interfeys yoki hodisa |
| "Har servisga interfeys" qoidasi | Bitta implementatsiyali interfeyslar shovqini | Interfeys — almashtiruvchanlik kerak bo'lganda |
| Arxitektura qarorlarini hujjatlashtirmaslik | Bahs takrorlanadi, sabab unutiladi | ADR fayllar |
| Mikroservislarga erta o'tish | Tarmoq, tranzaksiya, deploy murakkabligi | Avval modulli monolit |

---

## Amaliyot

1. Bitta biznes sohasini (masalan, "Ordering") `Domain/Application/Infrastructure/UI` ga ajrating.
2. `OrderRepositoryInterface` ni domenga, implementatsiyasini infratuzilmaga qo'ying; kontroller faqat interfeysni bilsin.
3. `deptrac` ni o'rnating va qoidalarni buzuvchi bitta import qo'shib, tahlil yiqilishini tasdiqlang.
4. Bitta o'qish endpoint'ini DBAL so'rovi bilan qayta yozing (CQRS-lite) va so'rovlar sonini solishtiring.
5. Birinchi ADR faylingizni yozing: `docs/adr/0001-modulli-monolit.md`.

---

## Bog'liq patternlar

[A-01 … A-16 — nima qilmaslik kerak](patterns/07-antipatternlar.md) — [pattern katalogi](patterns/README.md).

---

## Rasmiy hujjat

- Best Practices: <https://symfony.com/doc/current/best_practices.html>
- Messenger (command/query bus): <https://symfony.com/doc/current/messenger/multiple_buses.html>
- Deptrac: <https://qossmic.github.io/deptrac/>
- Symfony Demo (namunaviy tuzilma): <https://github.com/symfony/demo>
- ADR haqida: <https://adr.github.io/>

---

[← Oldingi: API pro](38-api-pro.md) · [Mundarija](README.md) · [Keyingi: Deploy va checklist →](40-deploy-va-checklist.md)
