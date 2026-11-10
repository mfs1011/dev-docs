# 33 — Yangilash

[Mundarija](README.md)

## Tushuncha

### Uch strategiya (RQ: Upgrading RabbitMQ)

| Strategiya | Nima | RQ bahosi |
| --- | --- | --- |
| **Rolling** (joyida, in-place) | Tugunlar **birma-bir**: to'xtatish → RabbitMQ (kerak bo'lsa Erlang) ni yangilash → ishga tushirish → monitoringda tekshirish | **Tavsiya etiladi** |
| **Blue-green** | Yangi versiyadagi yangi ("green") klaster. Definitions import, federation, avval consumer'lar, so'ng publisher'lar ko'chiriladi, eski ("blue") klaster o'chiriladi | **Eng xavfsiz**: muammo bo'lsa eski klasterga qaytish mumkin |
| Grow-then-shrink | Yangi tugun qo'shish, replikalarni ko'chirish, eskisini chiqarish | Butun klaster uchun **qat'iyan tavsiya etilmaydi**; faqat bitta tugunni almashtirish uchun |

### Rolling yangilashdan oldin (RQ: Rolling Upgrade)

1. **Yangilash yo'li** bormi — versiyalar jadvali. Bir release series ichidagi patch'lar o'rtasida doim bor. RQ ogohlantirishi: 3.13.x, 4.0.x va 4.1.x dan 4.3/4.4/5.0 ga o'tishdan oldin avval **4.2.x** ga yangilash kerak.
2. **Erlang** talablari — yangi versiya boshqa Erlang talab qilishi mumkin.
3. Joriy va maqsad versiya orasidagi barcha **release notes**'ni o'qish.
4. Barcha **stable feature flag'lar yoqilgan** bo'lishi kerak. Aks holda yangilash muvaffaqiyatsiz tugashi mumkin. `rabbitmqctl enable_feature_flag all` xavfsiz — yoqilganlarga hech narsa qilmaydi.
5. Paketlar (Erlang ham) mavjudligi.
6. Klaster sog'ligi: alarm yo'q, tarmoq bo'linishi yo'q, replika sinxronizatsiyasi ketmayapti, yuklama me'yorda. Navbatlar va xabarlar sonini yozib qo'yish — keyin solishtirish uchun.
7. Klaster bitta tugunsiz ham ishlay oladimi (sig'im). Yangilashni kam trafik paytida qilish.

**Feature flag'lar** (RQ): yangi versiyadagi o'zgarishni hamma tugunlar qo'llaganda yoqish mexanizmi. Qoidalari:

- Flag faqat **barcha** tugunlar qo'llasa yoqiladi.
- Yoqilgan flag'ni **o'chirib bo'lmaydi**.
- Tugun klasterga faqat yoqilgan barcha flag'larni qo'llasa qo'shila oladi.
- Yangilashdan **keyin** yangi stable flag'lar yoqiladi.

### Yangilash paytida (RQ)

| Narsa | Nima |
| --- | --- |
| **Zaxira** | Yangilashdan oldin tugun ma'lumotlar katalogini zaxiralash qat'iyan tavsiya etiladi (29-bob) |
| **Quorum** | 3 tugunda doim 2 tasi ishlab turishi kerak. `check_if_node_is_quorum_critical` — to'xtatish xavfsizmi. Avtomatlashtirishda — `rabbitmq-upgrade await_online_quorum_plus_one` |
| **Maintenance mode** | `rabbitmq-upgrade drain`: yangi ulanishlar qabul qilinmaydi, mavjudlari yopiladi, quorum liderlari boshqa tugunlarga o'tkaziladi. Qisqa muddat (5–30 daqiqa) uchun. Qayta ishga tushirish rejimni o'zi bekor qiladi; kerak bo'lsa — `revive` |
| **Rebalance** | Yangilashdan keyin liderlar notekis taqsimlanadi — `rabbitmq-queues rebalance all` |
| **Downgrade** | Rasman **qo'llanmaydi**. Ortga qaytish kerak bo'lsa — blue-green |
| **Bitta tugun** | Klasterdan farqi yo'q. Dev muhitda ma'lumot muhim bo'lmasa — yangidan o'rnatish (definitions eksport/import bilan) |

## Ko'rib chiqamiz

VPS'da (bitta tugun).

### Versiyalar va feature flag'lar

```text vps
$ rabbitmqctl -q version; apt-cache policy rabbitmq-server erlang-base | grep -E '^[a-z]|Installed|Candidate'
4.4.0
rabbitmq-server:
  Installed: 4.4.0-1
  Candidate: 4.4.0-1
erlang-base:
  Installed: 1:27.3.4.19-1
  Candidate: 1:27.3.4.19-1
$ rabbitmqctl -q list_feature_flags name state stability | awk 'NR>1 {print $2, $3}' | sort | uniq -c
     28 enabled required
      6 enabled stable
$ rabbitmqctl -q list_feature_flags name state stability | awk '$2!="enabled"'
name	state	stability
```

- O'rnatilgan va repozitoriydagi eng yangi versiya bir xil: 4.4.0 / Erlang 27.3.4.19. Hozir yangilanadigan versiya yo'q. Shu sabab bu bob yangilashning o'zini emas, tayyorgarlik va maintenance amallarini ko'rsatadi.
- 34 flag: 28 tasi `required` (majburiy), 6 tasi `stable` — **hammasi yoqilgan**, yoqilmagani yo'q. Yangilashga tayyor.

### Quorum tekshiruvlari

```text vps
$ rabbitmq-diagnostics -q check_if_node_is_quorum_critical; echo "kod: $?"
Node rabbit@lab seems to be the only one in a single node cluster, the check does not apply
kod: 0
$ rabbitmq-upgrade -q await_online_quorum_plus_one; echo "kod: $?"
kod: 0
```

Bitta tugunda bu tekshiruvlar qo'llanmaydi (kod 0). 3 tugunli klasterda `check_if_node_is_quorum_critical` qanday ishlashini 32-bob ko'rsatgan.

### Maintenance mode

Ochiq ulanish va 12 soniyadan keyingi yangi ulanish:

```js
// Drain (maintenance mode) paytida: ochiq ulanish yopiladimi, yangisi ulana oladimi
const amqp = require('amqplib');
const t = () => new Date().toTimeString().slice(0, 8);
(async () => {
  const c = await amqp.connect('amqp://localhost');
  console.log(`${t()} ulanish ochildi`);
  c.on('close', e => console.log(`${t()} ulanish yopildi: ${e ? e.message.slice(0, 160) : ''}`));
  c.on('error', () => {});
  setTimeout(async () => {
    try { const d = await amqp.connect('amqp://localhost'); console.log(`${t()} yangi ulanish: OK`); await d.close(); }
    catch (e) { console.log(`${t()} yangi ulanish: ${e.code || e.message.slice(0, 60)}`); }
    process.exit(0);
  }, 12000);
})();
```

```text vps
$ cd /root/rabbit-ilova && node drain.js > /root/drain.log 2>&1 & sleep 3; rabbitmq-upgrade drain; echo "$(date +%T) --- drain"; sleep 12; cat /root/drain.log; rm /root/drain.log
Will put node rabbit@lab into maintenance mode. The node will no longer serve any client traffic!
09:50:12 --- drain
09:50:05 ulanish ochildi
09:50:12 ulanish yopildi: Connection closed: 320 (CONNECTION-FORCED) with message "CONNECTION_FORCED - Node was put into maintenance mode"
09:50:17 yangi ulanish: ECONNREFUSED
$ rabbitmqctl -q cluster_status | grep -A2 -i 'maintenance'; rabbitmqctl -q status | grep -i -A1 'maintenance'
Maintenance status

Node: rabbit@lab, status: marked for maintenance

Alarms
--
Flag: maintenance_mode_status, state: enabled
Flag: message_containers, state: enabled
Flag: message_containers_deaths_v2, state: enabled
Is under maintenance?: true
RabbitMQ version: 4.4.0
$ rabbitmq-upgrade revive; rabbitmqctl -q status | grep -i -A1 'maintenance'
Will put node rabbit@lab back into regular operating mode. The node will again serve client traffic and host primary queue replicas.
Is under maintenance?: false
RabbitMQ version: 4.4.0
```

- `drain` dan keyin ochiq ulanish **darhol** yopildi: `320 CONNECTION_FORCED - Node was put into maintenance mode`. Yangi ulanish — `ECONNREFUSED`: tinglovchilar to'xtatildi.
- `cluster_status` va `status` — `marked for maintenance`, `Is under maintenance?: true`.
- `revive` dan keyin — `false`, ulanish yana ishlaydi.
- Ilovalar uchun xulosa: ular uzilishdan keyin **qayta ulanishi** kerak (klasterda — boshqa tugunga).

### Rebalance

```text vps
$ rabbitmq-queues -q rebalance all --formatter json
{"node":"rabbit@lab","value":[{"Node name":"rabbit@lab","Number of quorum queues":3}],"result":"ok"}
```

Bitta tugunda barcha 3 quorum navbat lideri — shu tugunda.

## Variantlar

| Holat | Tanlov |
| --- | --- |
| Patch yangilash (4.4.0 → 4.4.x) | Rolling |
| Bir nechta series oshib o'tish | Yo'l bo'yicha bosqichma-bosqich yoki blue-green |
| Ortga qaytish imkoni muhim | Blue-green |
| Tugun (server) almashtirish | Grow-then-shrink (faqat bitta tugun) |
| Dev muhit | Yangidan o'rnatish + definitions |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Feature flag'larni yoqmasdan yangilash | Yangilash muvaffaqiyatsiz tugashi mumkin (RQ) | `enable_feature_flag all` |
| Release notes'ni o'qimaslik | Qo'shimcha qadamlar bo'lishi mumkin (RQ) | Oraliqdagi barcha versiyalar |
| Ikki tugunni birdan to'xtatish (3 tugunda) | Quorum yo'qoladi (RQ) | Birma-bir, `check_if_node_is_quorum_critical` |
| Downgrade'ga tayanish | Rasman qo'llanmaydi (RQ) | Blue-green |
| Zaxirasiz yangilash | Qaytish yo'li yo'q | Ma'lumotlar katalogi zaxirasi (RQ) |
| Ilova qayta ulanmaydi | `drain`/restart'da ulanish uziladi (sinovda) | Qayta ulanish mantig'i |

## Amaliyot

1. RQ qaysi yangilash strategiyasini tavsiya etadi va qaysi biri eng xavfsiz?
2. 4.1.x dan 4.4.x ga qanday o'tiladi?
3. Feature flag'ni o'chirib bo'ladimi?
4. `rabbitmq-upgrade drain` nima qiladi?
5. Sinovda `drain` dan keyin ochiq va yangi ulanishlar bilan nima bo'ldi?

<details>
<summary>Javoblar</summary>

1. Rolling — tavsiya etiladi; blue-green — eng xavfsiz.
2. Avval 4.2.x ga, keyin 4.4.x ga.
3. Yo'q — yoqilgan flag o'chirilmaydi.
4. Yangi ulanishlarni to'xtatadi, mavjudlarini yopadi, quorum liderlarini boshqa tugunlarga o'tkazadi.
5. Ochiq ulanish `320 CONNECTION_FORCED` bilan yopildi, yangisi `ECONNREFUSED` oldi.

</details>

## Rasmiy hujjat

- [RQ: Upgrading RabbitMQ](https://www.rabbitmq.com/docs/upgrade)
- [RQ: Rolling Upgrade](https://www.rabbitmq.com/docs/rolling-upgrade)
- [RQ: Blue-Green Deployment](https://www.rabbitmq.com/docs/blue-green-upgrade)
- [RQ: Feature Flags](https://www.rabbitmq.com/docs/feature-flags)
- [RabbitMQ release notes](https://github.com/rabbitmq/rabbitmq-server/releases)
