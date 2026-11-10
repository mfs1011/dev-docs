# 10 — Qo'shimcha marshrutlash

[Mundarija](README.md)

## Tushuncha

6-bobda binding'i yo'q xabar jimgina yo'qoldi (`NOT routed`), 7-bobda esa xabar faqat navbatga yo'naltirildi. RabbitMQ'da ikki qo'shimcha imkoniyat bor.

### Alternate exchange (AE)

RQ (Alternate Exchanges): exchange yo'naltira olmagan xabarlarni (bog'langan navbat yo'q yoki birorta binding mos emas) ilovaga qayta ishlash imkonini beradi. Odatiy hollar:

- mijozlar tasodifan yoki yomon niyat bilan yo'naltirib bo'lmaydigan xabar yuborayotganini **aniqlash**;
- "aks holda" mantig'i: ba'zi xabarlar alohida ishlanadi, qolganlari — umumiy ishlov beruvchiga.

| Qoida (RQ) | Nima |
| --- | --- |
| Qanday ishlaydi | Exchange xabarni hech qaysi navbatga yo'naltira olmasa, kanal uni **AE'ga qayta yuboradi**. AE ham yo'naltira olmasa — o'zining AE'siga va hokazo: xabar yo'naltirilguncha, zanjir tugaguncha yoki xabarni allaqachon ko'rgan AE'ga yetguncha |
| AE mavjud bo'lmasa | Jurnalga ogohlantirish yoziladi |
| Qanday belgilanadi | **Policy** bilan — tavsiya etiladi (o'zgartirish, yangilash oson); yoki exchange e'lonida `alternate-exchange` argumenti — tavsiya etilmaydi. Ikkalasi bo'lsa — argument ustun |
| Standart exchange | AE'ni **qo'llamaydi** (u kodda alohida holat, "haqiqiy" exchange emas) |
| `mandatory` | AE orqali yo'naltirilgan xabar `mandatory` uchun **yo'naltirilgan** hisoblanadi; xabarning o'zi o'zgarmaydi |

### Exchange'dan exchange'ga binding

RQ (Exchange to Exchange Bindings): AMQP 0-9-1 ning `queue.bind` i navbatni exchange'ga bog'laydi. RabbitMQ `exchange.bind` qo'shgan — bitta exchange'ni **boshqa exchange**'ga bog'laydi. Ma'nosi exchange→navbat binding bilan bir xil: bir tomonlama, binding kalitlari va exchange turlari odatdagidek ishlaydi. Shunday qilib murakkabroq yo'naltirish sxemalari quriladi.

RQ: tsikllar yetkazish paytida aniqlanadi va yo'q qilinadi. Har qanday sxemada xabar yo'naltirilgan **har bir navbat** uning **aynan bitta nusxasini** oladi.

## Ko'rib chiqamiz

VPS'da (RabbitMQ 4.4.0), `rabbitmqadmin` v2 va `rabbitmqctl` bilan.

```text
AE:   my-direct (direct) ──key1──▶ routed
          └─ (yo'naltirilmasa) ─▶ my-ae (fanout) ──▶ unrouted

E2E:  ex.hammasi (topic) ──tolov.#──▶ ex.tolov (fanout) ──▶ q.buxgalteriya, q.audit
            ├─────────#───────────▶ q.log
            └─────────#───────────▶ q.audit
```

```bash
#!/bin/bash
A="rabbitmqadmin --non-interactive"
# Alternate exchange (RQ misoli)
$A exchanges declare --name my-direct --type direct --durable true
$A exchanges declare --name my-ae --type fanout --durable true
for q in routed unrouted q.log q.buxgalteriya q.audit; do $A queues declare --name $q --type quorum --durable true; done
$A bindings declare --source my-direct --destination-type queue --destination routed --routing-key key1
$A bindings declare --source my-ae --destination-type queue --destination unrouted --routing-key ""
# Exchange'dan exchange'ga
$A exchanges declare --name ex.hammasi --type topic --durable true
$A exchanges declare --name ex.tolov --type fanout --durable true
$A bindings declare --source ex.hammasi --destination-type exchange --destination ex.tolov --routing-key "tolov.#"
$A bindings declare --source ex.tolov --destination-type queue --destination q.buxgalteriya --routing-key ""
$A bindings declare --source ex.tolov --destination-type queue --destination q.audit --routing-key ""
$A bindings declare --source ex.hammasi --destination-type queue --destination q.log --routing-key "#"
$A bindings declare --source ex.hammasi --destination-type queue --destination q.audit --routing-key "#"
```

```bash
#!/bin/bash
# yubor.sh EXCHANGE KALIT NAVBAT... — yuboradi, navbatlardagi sonni ko'rsatadi, tozalaydi
ex=$1; k=$2; shift 2
rabbitmqadmin --non-interactive publish message --exchange "$ex" --routing-key "$k" --payload "test" | tr -s ' ' | sed 's/ $//'
for q in "$@"; do printf '%s=%s ' $q "$(rabbitmqctl -q list_queues name messages | awk -v q=$q '$1==q {print $2}')"; done; echo
for q in "$@"; do rabbitmqadmin --non-interactive queues purge --name $q >/dev/null; done
```

```text vps
$ bash /root/sozla.sh; rabbitmqctl -q list_bindings source_name destination_name destination_kind routing_key | grep -E '^(my-|ex\.)' | sort
ex.hammasi	ex.tolov	exchange	tolov.#
ex.hammasi	q.audit	queue	#
ex.hammasi	q.log	queue	#
ex.tolov	q.audit	queue	
ex.tolov	q.buxgalteriya	queue	
my-ae	unrouted	queue	
my-direct	routed	queue	key1
```

`destination_kind` ustunida — `exchange` (`ex.hammasi` → `ex.tolov`) va `queue`.

### Alternate exchange

AE'siz:

```text vps
$ bash /root/yubor.sh my-direct key2 routed unrouted
Message published but NOT routed
routed=0 unrouted=0 
```

`key2` uchun binding yo'q — xabar yo'qoldi. Endi policy bilan AE:

```text vps
$ rabbitmqctl set_policy AE "^my-direct$" '{"alternate-exchange":"my-ae"}' --apply-to exchanges; rabbitmqctl -q list_policies | cut -f2-6
Setting policy "AE" for pattern "^my-direct$" to "{"alternate-exchange":"my-ae"}" with priority "0" for vhost "/" ...
name	pattern	apply-to	definition	priority
AE	^my-direct$	exchanges	{"alternate-exchange":"my-ae"}	0
$ rabbitmqctl -q list_exchanges name policy | grep '^my-direct'
my-direct	AE
$ bash /root/yubor.sh my-direct key1 routed unrouted
Message published and routed successfully
routed=1 unrouted=0 
$ bash /root/yubor.sh my-direct key2 routed unrouted
Message published and routed successfully
routed=0 unrouted=1 
```

- `my-direct` ga `AE` policy'si qo'llandi.
- `key1` — odatdagidek `routed` ga.
- `key2` — endi **yo'qolmadi**: AE (`my-ae`) orqali `unrouted` ga tushdi. `rabbitmqadmin` ham uni "routed successfully" deb ko'rsatdi — RQ aytganidek, AE orqali o'tgan xabar yo'naltirilgan hisoblanadi.

### Exchange'dan exchange'ga

```text vps
$ bash /root/yubor.sh ex.hammasi tolov.qabul q.log q.buxgalteriya q.audit
Message published and routed successfully
q.log=1 q.buxgalteriya=1 q.audit=1 
$ bash /root/yubor.sh ex.hammasi buyurtma.yangi q.log q.buxgalteriya q.audit
Message published and routed successfully
q.log=1 q.buxgalteriya=0 q.audit=1 
```

| Routing key | `q.log` | `q.buxgalteriya` | `q.audit` |
| --- | --- | --- | --- |
| `tolov.qabul` | 1 | 1 (`ex.tolov` orqali) | **1** — ikki yo'l, bitta nusxa |
| `buyurtma.yangi` | 1 | 0 (`tolov.#` mos emas) | 1 |

`tolov.qabul` `q.audit` ga ikki yo'l bilan yetdi: to'g'ridan-to'g'ri (`#`) va `ex.tolov` orqali. Navbatda esa **bitta** xabar — RQ kafolati.

```text vps
$ rabbitmqctl -q clear_policy AE; for e in my-direct my-ae ex.hammasi ex.tolov; do rabbitmqadmin exchanges delete --name $e; done; for q in routed unrouted q.log q.buxgalteriya q.audit; do rabbitmqadmin queues delete --name $q; done; rm /root/sozla.sh /root/yubor.sh; rabbitmqctl -q list_policies | wc -l; rabbitmqctl -q list_queues name
1
name
hello
rpc_queue
task_queue
```

Sinov obyektlari va policy o'chirildi.

## Variantlar

| Kerak | Usul |
| --- | --- |
| Yo'naltirib bo'lmagan xabarlarni yo'qotmaslik | Alternate exchange (policy) |
| Publisher o'zi bilsin | `mandatory` bayrog'i — xabar publisher'ga qaytariladi |
| Bir guruh xabarni bitta joyda boshqa qoidalar bilan tarqatish | Exchange → exchange |
| Rad etilgan yoki muddati o'tgan xabarlar | Dead lettering (15-bob) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| AE'ni exchange argumenti bilan berish | O'zgartirish qiyin; RQ tavsiya etmaydi | Policy |
| Standart exchange'ga AE kutish | Qo'llanmaydi (RQ) | O'z exchange'ingiz |
| AE'ga hech qaysi navbatni bog'lamaslik | Xabar baribir yo'qoladi | AE'ga navbat (masalan, fanout + `unrouted`) |
| E2E'da navbat ikki nusxa oladi deb qo'rqish | Har navbatga bitta nusxa (RQ, sinovda) | — |
| Mavjud bo'lmagan AE nomi | Faqat jurnalda ogohlantirish (RQ) | Avval AE'ni e'lon qilish |

## Amaliyot

1. Alternate exchange qachon ishga tushadi?
2. AE'ni belgilashning tavsiya etilgan yo'li qaysi?
3. AE'ning o'zi xabarni yo'naltira olmasa nima bo'ladi?
4. Exchange'dan exchange'ga binding nima beradi?
5. Sinovda `tolov.qabul` `q.audit` ga nechta nusxada tushdi va nega?

<details>
<summary>Javoblar</summary>

1. Exchange xabarni hech qaysi navbatga yo'naltira olmaganda.
2. Policy (`alternate-exchange` kaliti).
3. O'zining AE'siga yuboradi — yo'naltirilguncha yoki zanjir tugaguncha.
4. Murakkabroq sxemalar: bir exchange boshqasiga xabar o'tkazadi, odatdagi binding qoidalari bilan.
5. Bitta — har navbat aynan bitta nusxa oladi.

</details>

## Rasmiy hujjat

- [RQ: Alternate Exchanges](https://www.rabbitmq.com/docs/ae)
- [RQ: Exchange to Exchange Bindings](https://www.rabbitmq.com/docs/e2e)
- [RQ: Policies](https://www.rabbitmq.com/docs/policies) (17-bob)
