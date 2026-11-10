# 06 — Exchange turlari

[Mundarija](README.md)

## Tushuncha

RQ (Exchanges): **exchange** — xabar yuboriladigan joy. U xabarni olib, nol yoki undan ko'p navbatga (yoki boshqa exchange'ga) yo'naltiradi. Qanday yo'naltirishi exchange **turi**ga va **binding**'larga bog'liq. Endigina e'lon qilingan exchange hech qaysi navbatni bilmaydi — u bo'sh yo'naltirish jadvali. Jadvalni binding'lar to'ldiradi.

**Binding** (RQ): manba (exchange), maqsad (navbat, stream yoki boshqa exchange), maqsad turi va ixtiyoriy argumentlar (masalan, headers exchange uchun).

### To'rt asosiy tur

| Tur | Qanday yo'naltiradi |
| --- | --- |
| **Direct** | Binding kaliti xabarning routing key'i bilan **aynan teng** bo'lsa: `abc` faqat `abc` ga (RQ) |
| **Fanout** | Har xabar nusxasini **barcha** bog'langan navbatlarga; routing key butunlay e'tiborga olinmaydi (RQ) |
| **Topic** | Routing key **naqsh** bilan solishtiriladi; bo'laklar nuqta bilan ajratiladi: `*` — aynan bitta bo'lak, `#` — nol yoki ko'p bo'lak (RQ) |
| **Headers** | Routing key e'tiborga olinmaydi; xabar **header**'lari binding qiymatlari bilan solishtiriladi. `x-match: all` — hammasi mos, `any` — bittasi yetarli (RT) |

Topic misollari (RQ):

- `regions.na.cities.*` → `regions.na.cities.toronto` mos, `regions.na.cities` **mos emas** (`*` — aynan bitta bo'lak);
- `audit.events.#` → `audit.events`, `audit.events.users.signup` mos, `audit.users` mos emas;
- `#` — har qanday kalit: bunday binding'lar uchun topic exchange fanout kabi ishlaydi.

RT: headers'da `any` va `all` uchun `x-` bilan boshlanadigan header'lar solishtirilmaydi (`any-with-x`, `all-with-x` — ularni ham hisobga oladi).

### Oldindan e'lon qilingan exchange'lar (RQ)

AMQP 0-9-1 spetsifikatsiyasi bo'yicha har virtual host'da bor:

- **standart exchange** (nomi bo'sh satr, direct) — har navbat unga o'z nomi bilan bog'langan (3-bob);
- har tur uchun bittadan `amq.*`: `amq.direct`, `amq.fanout`, `amq.topic`, `amq.headers` (va `amq.match`).

Plaginlar boshqa turlarni ham qo'shadi (consistent hashing, random, recent history va boshqalar).

### Xususiyatlar (RQ)

| Xususiyat | Nima |
| --- | --- |
| Durable | Broker qayta ishga tushganda saqlanadi. RQ: amalda durable ishlatish kerak — 4.x seriyasida Khepri yagona metadata ombori bo'lganda transient (durable bo'lmagan) obyektlar qo'llovi olib tashlanadi |
| Auto-delete | Oxirgi binding o'chirilganda exchange ham o'chadi |
| Argumentlar | Plaginlar va qo'shimcha imkoniyatlar uchun (masalan, alternate exchange — 10-bob) |

## Ko'rib chiqamiz

VPS'da (RabbitMQ 4.4.0), `rabbitmqadmin` v2 bilan. To'rt exchange (`ex.direct`, `ex.fanout`, `ex.topic`, `ex.headers`), uch navbat (`q.a`, `q.b`, `q.c`) va binding'lar:

```bash
#!/bin/bash
# Sinov uchun exchange'lar, navbatlar va binding'lar (rabbitmqadmin v2)
A="rabbitmqadmin --non-interactive"
for q in q.a q.b q.c; do $A queues declare --name $q --type quorum --durable true; done
for t in direct fanout topic headers; do $A exchanges declare --name ex.$t --type $t --durable true; done
# direct: aniq kalit
$A bindings declare --source ex.direct --destination-type queue --destination q.a --routing-key buyurtma.yaratildi
$A bindings declare --source ex.direct --destination-type queue --destination q.b --routing-key buyurtma.tolandi
# fanout: kalitga qaramaydi
for q in q.a q.b q.c; do $A bindings declare --source ex.fanout --destination-type queue --destination $q --routing-key ""; done
# topic: naqsh (* — bitta bo'lak, # — nol yoki ko'p bo'lak)
$A bindings declare --source ex.topic --destination-type queue --destination q.a --routing-key "buyurtma.*"
$A bindings declare --source ex.topic --destination-type queue --destination q.b --routing-key "*.tolandi"
$A bindings declare --source ex.topic --destination-type queue --destination q.c --routing-key "#"
# headers: x-match all / any
$A bindings declare --source ex.headers --destination-type queue --destination q.a --routing-key "" --arguments '{"x-match":"all","tur":"buyurtma","holat":"yangi"}'
$A bindings declare --source ex.headers --destination-type queue --destination q.b --routing-key "" --arguments '{"x-match":"any","tur":"buyurtma","holat":"yangi"}'
```

Yuborish skripti — bitta xabar yuboradi, navbatlardagi sonni ko'rsatadi va navbatlarni tozalaydi. Xabarning header'lari doim bir xil: `tur: buyurtma`, `holat: tolangan`:

```bash
#!/bin/bash
# yubor.sh EXCHANGE KALIT — bitta xabar yuborib, qaysi navbatga tushganini ko'rsatadi, so'ng navbatlarni tozalaydi
A="rabbitmqadmin --non-interactive"
$A publish message --exchange "$1" --routing-key "$2" --payload "buyurtma #7" --properties '{"headers":{"tur":"buyurtma","holat":"tolangan"}}' | tr -s ' ' | sed 's/ $//'
for q in q.a q.b q.c; do printf '%s=%s ' $q "$(rabbitmqctl -q list_queues name messages | awk -v q=$q '$1==q {print $2}')"; done; echo
for q in q.a q.b q.c; do $A queues purge --name $q >/dev/null; done
```

### Exchange'lar va binding'lar

```text vps
$ bash /root/sozla.sh; rabbitmqctl -q list_exchanges name type | grep -E '^(ex\.|amq\.direct|amq\.fanout|amq\.topic|amq\.headers|amq\.match)' | sort
amq.direct	direct
amq.fanout	fanout
amq.headers	headers
amq.match	headers
amq.topic	topic
ex.direct	direct
ex.fanout	fanout
ex.headers	headers
ex.topic	topic
$ rabbitmqctl -q list_bindings source_name destination_name routing_key arguments | grep '^ex\.' | sort
ex.direct	q.a	buyurtma.yaratildi	[]
ex.direct	q.b	buyurtma.tolandi	[]
ex.fanout	q.a		[]
ex.fanout	q.b		[]
ex.fanout	q.c		[]
ex.headers	q.a		[{"holat","yangi"},{"tur","buyurtma"},{"x-match","all"}]
ex.headers	q.b		[{"holat","yangi"},{"tur","buyurtma"},{"x-match","any"}]
ex.topic	q.a	buyurtma.*	[]
ex.topic	q.b	*.tolandi	[]
ex.topic	q.c	#	[]
```

Bizning to'rttamizdan tashqari `amq.*` exchange'lari ham bor — ularni broker o'zi yaratgan.

### Bitta xabar — to'rt exchange

```text vps
$ bash /root/yubor.sh ex.direct buyurtma.yaratildi
Message published and routed successfully
q.a=1 q.b=0 q.c=0 
$ bash /root/yubor.sh ex.fanout buyurtma.yaratildi
Message published and routed successfully
q.a=1 q.b=1 q.c=1 
$ bash /root/yubor.sh ex.topic buyurtma.yaratildi
Message published and routed successfully
q.a=1 q.b=0 q.c=1 
$ bash /root/yubor.sh ex.topic tolov.tolandi
Message published and routed successfully
q.a=0 q.b=1 q.c=1 
$ bash /root/yubor.sh ex.headers buyurtma.yaratildi
Message published and routed successfully
q.a=0 q.b=1 q.c=0 
```

| Exchange, routing key | `q.a` | `q.b` | `q.c` | Nega |
| --- | --- | --- | --- | --- |
| direct, `buyurtma.yaratildi` | ✅ | — | — | Faqat `q.a` ning kaliti aynan teng |
| fanout | ✅ | ✅ | ✅ | Kalitga qaramaydi — hammasiga |
| topic, `buyurtma.yaratildi` | ✅ | — | ✅ | `buyurtma.*` va `#` mos; `*.tolandi` mos emas |
| topic, `tolov.tolandi` | — | ✅ | ✅ | `*.tolandi` va `#` |
| headers (`holat: tolangan`) | — | ✅ | — | `q.a` — `all`: `holat` mos emas; `q.b` — `any`: `tur` mos |

### Hech qayerga tushmagan xabar

```text vps
$ bash /root/yubor.sh ex.direct boshqa.kalit
Message published but NOT routed
q.a=0 q.b=0 q.c=0 
```

`boshqa.kalit` bilan direct'da binding yo'q — xabar qabul qilindi, lekin **hech qaysi navbatga yo'naltirilmadi** (`NOT routed`) va jimgina yo'qoldi. Uni ushlab qolish yo'llari: publisher'ga qaytarish (`mandatory`) yoki alternate exchange (10-bob).

### Standart exchange

```text vps
$ bash /root/yubor.sh "" q.c
Message published and routed successfully
q.a=0 q.b=0 q.c=1 
```

Exchange nomi bo'sh, routing key — navbat nomi (`q.c`): xabar shu navbatga tushdi. Hech qanday binding yaratmadik — har navbat standart exchange'ga o'z nomi bilan avtomatik bog'langan (3-bob).

```text vps
$ for t in direct fanout topic headers; do rabbitmqadmin exchanges delete --name ex.$t; done; for q in q.a q.b q.c; do rabbitmqadmin queues delete --name $q; done; rm /root/sozla.sh /root/yubor.sh; rabbitmqctl -q list_queues name
name
hello
task_queue
```

Sinov obyektlari o'chirildi; `hello` va `task_queue` — 3- va 5-boblardan.

## Variantlar

| Kerak | Tur | Bob |
| --- | --- | --- |
| Bitta ishni bitta navbatga | Direct yoki standart exchange | 3, 5 |
| Bitta hodisani hamma oluvchilarga | Fanout | 7 |
| Kalit bo'yicha tanlab yuborish | Direct | 8 |
| Naqsh bo'yicha (`buyurtma.*`, `*.xato`) | Topic | 8 |
| Bir nechta atribut bo'yicha | Headers | — |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Binding'siz exchange'ga yuborish | Xabar hech qayerga bormaydi (sinovda `NOT routed`) | Binding yoki alternate exchange (10-bob) |
| Topic'da `*` bir nechta bo'lakni qamraydi deb o'ylash | `*` — aynan bitta bo'lak (RQ) | Ko'p bo'lak uchun `#` |
| Fanout'da routing key'ga tayanish | Fanout kalitni e'tiborga olmaydi (RQ) | Direct yoki topic |
| Headers'da `x-match` ni unutish | Qaysi qoida (`all`/`any`) ishlashi aniq bo'lmaydi | Har doim aniq ko'rsatish |
| Transient exchange | 4.x da qo'llov olib tashlanadi (RQ) | Durable |
| Standart exchange'ga binding qo'shish | RabbitMQ'da ruxsat yo'q — xato (RT) | O'z exchange'ingiz |

## Amaliyot

1. Exchange e'lon qilinganda navbatlarni biladimi?
2. Direct, fanout, topic va headers qanday farq qiladi?
3. Topic'da `*` va `#` farqi nima?
4. Sinovda headers exchange'da nega faqat `q.b` ga tushdi?
5. Binding'i yo'q xabar bilan nima bo'ldi?
6. Standart exchange'ga yuborganda routing key nima bo'ladi?

<details>
<summary>Javoblar</summary>

1. Yo'q — bo'sh yo'naltirish jadvali; uni binding'lar to'ldiradi.
2. Direct — kalit aynan teng; fanout — hammaga; topic — naqsh bo'yicha; headers — header'lar bo'yicha.
3. `*` — aynan bitta bo'lak, `#` — nol yoki ko'p bo'lak.
4. `q.a` — `x-match: all`, `holat` mos kelmadi; `q.b` — `any`, `tur` mos keldi.
5. Hech qaysi navbatga yo'naltirilmadi va yo'qoldi.
6. Navbat nomi.

</details>

## Rasmiy hujjat

- [RQ: Exchanges](https://www.rabbitmq.com/docs/exchanges)
- [RT: AMQP 0-9-1 Model Explained](https://www.rabbitmq.com/tutorials/amqp-concepts) — Exchanges and Exchange Types
- [RQ: rabbitmqadmin v2](https://www.rabbitmq.com/docs/management-cli)
