# 17 — Policy'lar

[Mundarija](README.md)

## Tushuncha

Oldingi boblarda TTL (13), uzunlik chegarasi (14), dead lettering (15) va alternate exchange (10) policy bilan berildi. Bu bob — policy'ning o'zi haqida.

RQ (Policies): ko'p sozlama konfiguratsiya faylida turadi. Lekin klasterning barcha tugunlarida bir xil bo'lishi yoki ish paytida o'zgarishi kerak bo'lgan qiymatlar **ish vaqti parametrlari** (runtime parameters) sifatida saqlanadi. Policy — ulardan biri: navbatlar, stream'lar va exchange'lar **guruhi**ning xususiyatlarini **deklarativ** sozlash usuli. Har vhost'ning o'z policy'lari bor.

### Nega kerak (RQ)

Ilova e'londa beradigan `x-` argumentlar egiluvchan emas: ularni o'zgartirish uchun ilovani o'zgartirish, qayta deploy va navbatni qayta e'lon qilish (o'chirish bilan) kerak. Navbatlar guruhini birdan boshqarib ham bo'lmaydi. Policy navbatlarni **nomi bo'yicha** (regex) tanlaydi va ularning argumentlariga o'z ta'rifini qo'shadi. Policy yangilansa — ta'siri barcha mos navbatlarga **qayta qo'llanadi** (odatda darhol; juda band navbatlarda bir necha soniya).

### Tuzilishi

| Atribut | Nima (RQ) |
| --- | --- |
| Nom | Bo'shliqsiz ASCII tavsiya etiladi |
| Pattern (naqsh) | Navbat yoki exchange nomlariga mos regex |
| Ta'rif (definition) | JSON — mos obyektlarga qo'shiladigan kalit-qiymatlar |
| Priority | Bir nechta policy mos kelsa qaysi biri qo'llanishi |
| `apply-to` | `queues`, `exchanges`, `all` yoki navbatning ma'lum turi |

### Qoidalar (RQ)

- Bitta navbat yoki exchange'ga **ko'pi bilan bitta** policy qo'llanadi. Bir nechta mos kelsa — **eng yuqori priority**'li (standart 0). Priority'lar teng bo'lsa — tanlov **tasodifiy**: bunga yo'l qo'ymaslik kerak.
- Ta'riflar **birlashtirilmaydi**: bir nechta xususiyat kerak bo'lsa (masalan, TTL va uzunlik), ular **bitta** policy ta'rifida yoziladi.
- Policy bilan **berib bo'lmaydiganlar**: navbat turi va classic navbatning maksimal ustuvorligi — ular e'londa beriladi va o'zgarmaydi.
- Policy faqat yaratilganda emas, har yangi navbat yoki exchange yaratilganda ham qo'llanadi.

### Operator policy (RQ)

Administrator cheklovni **majburlashi** kerak, lekin foydalanuvchilarga o'z policy'larini boshqarishga ham ruxsat berilishi kerak bo'lgan holat uchun. Operator policy oddiy policy bilan **birlashtiriladi**; bir xil kalitda **ehtiyotkorroq** (kichikroq) qiymat tanlanadi. Faqat cheklangan kalitlar: `max-length`, `max-length-bytes`, `message-ttl`, `expires`, `delivery-limit` va boshqa bir nechtasi.

## Ko'rib chiqamiz

VPS'da (RabbitMQ 4.4.0). Ikki navbat, ikki policy: `umumiy` (`^pol\.`, priority 0) va `maxsus` (faqat `pol.buyurtma`, priority 10):

```text vps
$ for q in pol.buyurtma pol.log; do rabbitmqadmin --non-interactive queues declare --name $q --type quorum --durable true; done; rabbitmqctl -q set_policy umumiy "^pol\." '{"max-length":100}' --priority 0 --apply-to queues; rabbitmqctl -q set_policy maxsus "^pol\.buyurtma$" '{"max-length":1000,"message-ttl":60000}' --priority 10 --apply-to queues; rabbitmqctl -q list_policies | cut -f2-6
name	pattern	apply-to	definition	priority
umumiy	^pol\.	queues	{"max-length":100}	0
maxsus	^pol\.buyurtma$	queues	{"max-length":1000,"message-ttl":60000}	10
$ rabbitmqctl -q list_queues name policy effective_policy_definition | grep -E '^name|^pol\.'
name	policy	effective_policy_definition
pol.log	umumiy	[{<<"max-length">>, 100}]
pol.buyurtma	maxsus	[{<<"max-length">>, 1000}, {<<"message-ttl">>, 60000}]
```

- `pol.log` ga faqat `umumiy` mos — `max-length: 100`.
- `pol.buyurtma` ga ikkalasi ham mos, lekin **faqat** `maxsus` qo'llandi (priority 10 > 0). Uning ta'rifi to'liq olindi, `umumiy` dagi qiymat aralashmadi.

### Operator policy

```text vps
$ rabbitmqctl -q set_operator_policy cheklov "^pol\." '{"max-length":500}' --apply-to queues; rabbitmqctl -q list_queues name policy operator_policy effective_policy_definition | grep -E '^name|^pol\.'
name	policy	operator_policy	effective_policy_definition
pol.log	umumiy	cheklov	[{<<"max-length">>, 100}]
pol.buyurtma	maxsus	cheklov	[{<<"max-length">>, 500}, {<<"message-ttl">>, 60000}]
```

`cheklov` — `max-length: 500`:

- `pol.buyurtma`: oddiy policy 1000, operator 500 → **500** (ehtiyotkorrog'i);
- `pol.log`: oddiy policy 100, operator 500 → **100** — operator policy foydalanuvchining qat'iyroq qiymatini buzmadi.

### Policy o'zgardi — navbatni qayta e'lon qilmasdan

```text vps
$ rabbitmqctl -q set_policy umumiy "^pol\." '{"max-length":200}' --priority 0 --apply-to queues; sleep 1; rabbitmqctl -q list_queues name effective_policy_definition | grep '^pol\.log'
pol.log	[{<<"max-length">>, 200}]
```

`umumiy` 200 ga o'zgartirildi — `pol.log` ning amaldagi qiymati ham darhol 200 bo'ldi.

### Policy bilan navbat turi

```text vps
$ rabbitmqctl -q set_policy turi "^pol\.log$" '{"x-queue-type":"classic"}' --priority 20 --apply-to queues 2>&1 | tail -2
[{<<"x-queue-type">>,<<"classic">>}] are not recognised policy settings
```

`x-queue-type` ni policy bilan berib bo'lmadi — RQ aytganidek, tur faqat e'londa.

```text vps
$ rabbitmqctl -q clear_operator_policy cheklov; rabbitmqctl -q clear_policy maxsus; rabbitmqctl -q clear_policy umumiy; for q in pol.buyurtma pol.log; do rabbitmqadmin queues delete --name $q; done; rabbitmqctl -q list_policies | wc -l; rabbitmqctl -q list_operator_policies | wc -l
1
1
```

Hammasi tozalandi (faqat sarlavha qatori qoldi).

## Variantlar

| Kerak | Usul |
| --- | --- |
| Navbatlar guruhiga bir xil sozlama | Policy (naqsh bilan) |
| Ba'zi navbatlarga alohida | Yuqori priority'li policy, to'liq ta'rif bilan |
| Administrator cheklovi | Operator policy |
| Navbat turi, classic ustuvorlik soni | Faqat e'londa (`x-` argument) |
| Policy'ni vaqtincha almashtirish | Yuqori priority'li vaqtinchalik policy (RQ: override) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Ikki policy bir xil priority bilan bitta navbatga mos | Tanlov tasodifiy (RQ) | Turli priority |
| Ikki policy'dan ikki xususiyat kutish | Faqat bittasi qo'llanadi (sinovda) | Hamma kalitlar bitta ta'rifda |
| Policy'ni kerakli vhost'da emas, boshqasida yaratish | Mos navbat topilmaydi (RQ: Troubleshooting) | `--vhost` |
| Navbat turini policy bilan o'zgartirishga urinish | "not recognised policy settings" (sinovda) | Yangi navbat |
| Naqsh juda keng (`.*`) | Kutilmagan navbatlarga ham tushadi | Aniq prefiks: `^pol\.` |

## Amaliyot

1. Policy nima uchun `x-` argumentlardan qulayroq?
2. Bitta navbatga uchta policy mos kelsa, nechtasi qo'llanadi?
3. TTL va uzunlik chegarasini bitta navbatga qanday berasiz?
4. Sinovda operator policy `pol.log` ga nega ta'sir qilmadi?
5. Policy bilan nimani berib bo'lmaydi?

<details>
<summary>Javoblar</summary>

1. Ilovani o'zgartirmasdan, qayta e'lon qilmasdan va bir guruhga birdan o'zgartiriladi.
2. Bittasi — eng yuqori priority'li.
3. Bitta policy ta'rifida ikkala kalit bilan.
4. Ehtiyotkorroq qiymat tanlanadi: foydalanuvchining 100 i operatorning 500 idan kichik.
5. Navbat turi va classic navbatning maksimal ustuvorligi.

</details>

## Rasmiy hujjat

- [RQ: Policies](https://www.rabbitmq.com/docs/policies) — Policy Priorities, Operator Policies
- [RQ: Runtime Parameters](https://www.rabbitmq.com/docs/parameters)
