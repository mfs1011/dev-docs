# 32 — Klaster

[Mundarija](README.md)

## Tushuncha

RQ (Clustering): **klaster** — bir yoki bir nechta (uch, besh, yetti …) tugunning mantiqiy guruhi. Ular foydalanuvchilar, vhost'lar, navbatlar, stream'lar, exchange'lar, binding'lar va boshqa umumiy holatni baham ko'radi.

### Nima replikatsiya qilinadi (RQ)

- Brokerning ishlashi uchun kerak bo'lgan barcha ma'lumot (metama'lumot) **hamma tugunlarga** nusxalanadi.
- **Istisno — navbatlar**: standartda navbat bitta tugunda turadi, boshqalardan ko'rinadi va ulanish mumkin. Navbatni nusxalash uchun — replikatsiya qiladigan tur: **quorum** navbat (12-bob) yoki stream.
- Tugunlar **teng huquqli**: maxsus "bosh" tugun yo'q. CLI va HTTP API istalgan tugunga murojaat qila oladi.

### Talablar (RQ)

| Talab | Nima |
| --- | --- |
| **Tugun nomi** | `prefiks@host` (masalan, `rabbit@lab`), klasterda noyob. Bitta hostda bir nechta tugun — har xil prefiks |
| **Hostname** | Har tugun nomining host qismi **ochilishi** (resolve) kerak |
| **Erlang cookie** | Tugunlar va CLI bir-birini umumiy maxfiy satr — **cookie** bilan taniydi |
| **Portlar** | 4369 (epmd), 25672 (tugunlararo va CLI; AMQP porti + 20000), 35672–35682 (CLI), 6000–6500 (stream replikatsiyasi). Bu portlar tashqariga ochilmasligi kerak |

### Tugunlar soni (RQ)

**Toq son** qat'iyan tavsiya etiladi: 1, 3, 5, 7. **Ikki tugunli** klaster qat'iyan tavsiya etilmaydi: aloqa uzilsa, tugunlar ko'pchilikni aniqlay olmaydi va quorum navbatlar ishlamay qoladi. Kelishuv (consensus) nuqtai nazaridan 4 tugun 3 tadan, 6 tugun 5 tadan yaxshiroq emas.

### Klaster tuzish (RQ)

- **Deklarativ** (peer discovery): konfiguratsiya faylidagi ro'yxat (`cluster_formation.classic_config.nodes.N`), DNS, AWS, Kubernetes, Consul, etcd. Production uchun **qat'iyan tavsiya etiladi**.
- **Qo'lda**: `rabbitmqctl join_cluster`. RQ: xato qilish oson, faqat ishlab chiqish va sinov uchun. 4.1 dan boshlab tugunni avval to'xtatib, tozalash shart emas. Klasterga qo'shilish — qo'shilayotgan tugun uchun **ma'lumotni o'chiradigan** amal.
- **Olib tashlash**: tugunda `stop_app`, boshqa tugunda `forget_cluster_node`. O'sha tugundagi quorum va stream replikalari ham olib tashlanadi.

### Tarmoq bo'linishi (RQ: Network Partitions)

4.3.0 dan barcha replikatsiya qilinadigan qismlar **Raft** asosida ishlaydi: metama'lumot ombori (Khepri), quorum navbatlar, stream coordinator. Eski "partition handling" strategiyalari olib tashlangan. Bo'linishda **ko'pchilik** tomoni ishlashda davom etadi:

- **Lider uzilsa**: ko'pchilik tomonida yangi lider saylanadi. Saylovgacha yozish rad etiladi yoki kechikadi (bir necha soniya). Tasdiqlanmagan xabarlar qayta yetkaziladi — dublikat bo'lishi mumkin.
- Kuzatish: `cluster_status` (uzilgan tugun "Running Nodes" da bo'lmaydi), `rabbitmq-queues quorum_status`, `check_if_node_is_quorum_critical`.

### Bitta mashinada klaster (RQ)

Sinov uchun bir hostda bir nechta tugun ishlatish mumkin. Har biriga noyob tugun nomi, port, ma'lumotlar va log joyi, plagin portlari kerak (`RABBITMQ_NODENAME`, `RABBITMQ_NODE_PORT`, `RABBITMQ_CONFIG_FILE` …). RQ: ilovalarni ko'p tugunga qarshi sinash uchun konteynerlar ma'qul.

## Ko'rib chiqamiz

VPS'da (RabbitMQ 4.4.0). Mavjud `rabbit@lab` ga yana ikkita tugun qo'shiladi: `n1@lab` (5673) va `n2@lab` (5674). Har biriga alohida konfiguratsiya, plagin portlari to'qnashmasin:

```ini
# n1@lab — bitta mashinadagi klasterning qo'shimcha tuguni: portlar to'qnashmasin (RQ: A Cluster on a Single Machine)
listeners.tcp.default = 5673
management.tcp.port = 15673
prometheus.tcp.port = 15693
stream.listeners.tcp.default = 5553
stream.advertised_host = localhost
```

### Tugunlarni ishga tushirish

```text vps
$ install -d -o rabbitmq -g rabbitmq /var/lib/rabbitmq/klaster && install -m 644 -o rabbitmq -g rabbitmq /root/rabbit-ilova/n1.conf /root/rabbit-ilova/n2.conf /var/lib/rabbitmq/klaster/ && ls /var/lib/rabbitmq/klaster
n1.conf
n2.conf
$ free -m | sed -n 2p | awk '{print "bo`sh xotira:", $7, "MB"}'
bo`sh xotira: 851 MB
$ RABBITMQ_NODENAME=n1 RABBITMQ_NODE_PORT=5673 RABBITMQ_CONFIG_FILE=/var/lib/rabbitmq/klaster/n1.conf rabbitmq-server -detached; rabbitmqctl -n n1@lab -q await_startup --timeout 120; echo "n1 kod: $?"
n1 kod: 0
$ RABBITMQ_NODENAME=n2 RABBITMQ_NODE_PORT=5674 RABBITMQ_CONFIG_FILE=/var/lib/rabbitmq/klaster/n2.conf rabbitmq-server -detached; rabbitmqctl -n n2@lab -q await_startup --timeout 120; echo "n2 kod: $?"
n2 kod: 0
$ free -m | sed -n 2p | awk '{print "bo`sh xotira:", $7, "MB"}'; rabbitmq-diagnostics -n n1@lab -q listeners | awk -F, '{print $2, $3}'
bo`sh xotira: 518 MB
 port: 15673  protocol: http
 port: 5553  protocol: stream
 port: 15693  protocol: http/prometheus
 port: 25673  protocol: clustering
 port: 5673  protocol: amqp
```

- Har tugun ~170 MB xotira oldi.
- `n1` portlari: 5673, 15673, 15693, 5553, tugunlararo — **25673** (AMQP porti + 20000, RQ).

### Klasterga qo'shish

```text vps
$ rabbitmqctl -n n1@lab join_cluster rabbit@lab
Clustering node n1@lab with rabbit@lab
$ rabbitmqctl -n n2@lab join_cluster n1@lab
Clustering node n2@lab with n1@lab
$ rabbitmqadmin queues delete --name klaster-q; cd /root/rabbit-ilova && node kl.js elon; rabbitmq-queues -q quorum_status klaster-q --formatter json | python3 qs.py
n1 orqali 3 xabar yuborildi va tasdiqlandi
n1@lab      leader    term=1
n2@lab      follower  term=1
rabbit@lab  follower  term=1
```

`n2` `n1` orqali qo'shildi — klasterdagi istalgan tugunni ko'rsatish yetarli (RQ). Uchta tugun ham ishlayapti.

### Quorum navbat va liderni yo'qotish

Skript `n1` ga ulanib quorum navbat e'lon qiladi (lider shu tugunda bo'ladi), keyin `rabbit@lab` dan o'qiydi:

```js
// Quorum navbat klasterda: n1 tuguniga ulanib e'lon qilish (lider o'sha tugunda bo'ladi) va boshqa tugundan o'qish
const amqp = require('amqplib');
(async () => {
  if (process.argv[2] === 'elon') {
    const c = await amqp.connect('amqp://localhost:5673');          // n1@lab
    const ch = await c.createConfirmChannel();
    await ch.assertQueue('klaster-q', { durable: true, arguments: { 'x-queue-type': 'quorum' } });
    for (let i = 1; i <= 3; i++) ch.sendToQueue('klaster-q', Buffer.from(`xabar ${i}`), { persistent: true });
    await ch.waitForConfirms(); console.log('n1 orqali 3 xabar yuborildi va tasdiqlandi');
    await c.close();
  } else {
    const c = await amqp.connect('amqp://localhost:5672');          // rabbit@lab
    const ch = await c.createChannel(); const olindi = [];
    let m; while ((m = await ch.get('klaster-q', { noAck: true }))) olindi.push(m.content.toString());
    console.log(`rabbit@lab orqali olindi: ${olindi.join(', ')}`);
    await c.close();
  }
})();
```

`quorum_status` ning JSON chiqishini qisqartirish:

```python
# rabbitmq-queues quorum_status --formatter json chiqishidan: tugun, Raft holati, term
import json, sys
for r in json.load(sys.stdin):
    print(f'{r["Node Name"]:11} {r["Raft State"]:9} term={r["Term"]}')
```

```text vps
$ rabbitmqctl -q list_queues name type messages leader members | grep -E '^name|klaster'
name	type	messages	leader	members
klaster-q	quorum	3	n1@lab	[n1@lab, rabbit@lab, n2@lab]
$ rabbitmq-diagnostics -n n1@lab -q check_if_node_is_quorum_critical; echo "kod: $?"
Node n1@lab reported no queues/streams with minimum quorum
kod: 0
$ rabbitmqctl -n n1@lab stop_app; sleep 5; cd /root/rabbit-ilova && rabbitmq-queues -q quorum_status klaster-q --formatter json | python3 qs.py
Stopping rabbit application on node n1@lab ...
n1@lab      noproc    term=1
n2@lab      follower  term=2
rabbit@lab  leader    term=2
$ rabbitmqctl -q cluster_status | sed -n '/^Running Nodes/,/^Versions/p' | grep -v '^Versions' | grep -v '^$'
Running Nodes
n2@lab
rabbit@lab
$ rabbitmq-diagnostics -n n2@lab -q check_if_node_is_quorum_critical; echo "kod: $?"
queue 'klaster-q' in vhost '/' will become unavailable if node n2@lab stops
rabbit_stream_coordinator will become unavailable if node n2@lab stops
rabbitmq_metadata will become unavailable if node n2@lab stops
kod: 69
$ cd /root/rabbit-ilova && node kl.js ol
rabbit@lab orqali olindi: xabar 1, xabar 2, xabar 3
$ rabbitmqctl -n n1@lab start_app; sleep 3; cd /root/rabbit-ilova && rabbitmq-queues -q quorum_status klaster-q --formatter json | python3 qs.py
Starting node n1@lab ...
n1@lab      follower  term=2
n2@lab      follower  term=2
rabbit@lab  leader    term=2
```

- Navbat uchala tugunda, lider — `n1@lab`. 3 ta tugun ishlab turganda `n1` "kritik" emas: u to'xtasa ham ko'pchilik (2/3) qoladi.
- `n1` to'xtatildi: **yangi lider** — `rabbit@lab`, term 1 → 2 (yangi saylov).
- Endi `n2` kritik: u ham to'xtasa, `klaster-q`, stream coordinator va metama'lumot ombori (`rabbitmq_metadata`) ko'pchilikni yo'qotadi (kod 69).
- `n1` o'chiq turganda 3 xabar boshqa tugundan to'liq o'qildi — replikatsiya ishladi.
- `n1` qaytdi va **follower** sifatida qo'shildi, lider o'zgarmadi.

### Tugunlarni olib tashlash — va kuzatilgan muammo

```text vps
$ rabbitmqadmin queues delete --name klaster-q; rabbitmqctl -n n2@lab stop_app; rabbitmqctl forget_cluster_node n2@lab
Stopping rabbit application on node n2@lab ...
Removing node n2@lab from the cluster
$ rabbitmqctl -n n1@lab stop_app; rabbitmqctl forget_cluster_node n1@lab
Stopping rabbit application on node n1@lab ...
Removing node n1@lab from the cluster
Error:
RabbitMQ failed to shrink some entities on node n1@lab : Stream coordinator
$ rabbitmqctl -q cluster_status | sed -n '/^Running Nodes/,/^Versions/p' | grep -v '^Versions' | grep -v '^$'; rabbitmqctl -q list_queues name leader members
Running Nodes
rabbit@lab
name	leader	members
hello	rabbit@lab	[rabbit@lab]
rpc_queue	rabbit@lab	[rabbit@lab]
task_queue	rabbit@lab	[rabbit@lab]
$ rabbitmqctl -n n1@lab stop; rabbitmqctl -n n2@lab stop; sleep 2; rm -rf /var/lib/rabbitmq/klaster /var/lib/rabbitmq/mnesia/n1@lab* /var/lib/rabbitmq/mnesia/n2@lab* /var/log/rabbitmq/n1@lab* /var/log/rabbitmq/n2@lab* /root/rabbit-ilova/n1.conf /root/rabbit-ilova/n2.conf; ls /var/lib/rabbitmq/mnesia; free -m | sed -n 2p | awk '{print "bo`sh xotira:", $7, "MB"}'
Stopping and halting node n1@lab ...
Stopping and halting node n2@lab ...
rabbit@lab
rabbit@lab-feature_flags
rabbit@lab-plugins-expand
rabbit@lab.pid
bo`sh xotira: 1019 MB
$ rabbitmq-diagnostics -q check_running; rabbitmq-diagnostics -q check_port_connectivity --address 127.0.0.1 | tail -1
RabbitMQ on node rabbit@lab is fully booted and running
Successfully connected to ports 5552, 5671, 5672, 15672, 15692, 25672 on node rabbit@lab (using 127.0.0.1 for target IP address)
```

- `n2` muammosiz olib tashlandi. `n1` ni olib tashlashda: `RabbitMQ failed to shrink some entities on node n1@lab : Stream coordinator`.
- Sababi: `n2` chiqqandan keyin stream coordinator'da (Raft guruhi) ikki a'zo qoldi — `rabbit@lab` va `n1@lab`. `n1` to'xtatilganda ikkidan bittasi ishlayapti — **ko'pchilik yo'q**, a'zoni olib tashlash ham mumkin emas. Bu RQ'dagi "ikki tugunli klaster tavsiya etilmaydi" qoidasining amaldagi ko'rinishi.
- Klaster va navbatlar tartibda ko'rindi, lekin stream'lar ishlamay qoldi. `coordinator_status`: `n1@lab` — `noconnection`, `rabbit@lab` — `pre_vote` (lider yo'q):

```text vps
$ timeout 60 rabbitmqadmin queues declare --name sinov-stream --type stream --durable true; echo "kod: $?"
Encountered an error when performing an HTTP request: error sending request for url (http://localhost:15672/api/queues/%2F/sinov%2Dstream)
kod: 65
```

**Sinov muhitini tiklash** — Ra kutubxonasining ichki funksiyasi. U coordinator'ni faqat mahalliy a'zoga qisqartiradi. ⚠️ Bu buyruq rasmiy hujjatda yo'q, RabbitMQ manba kodida (`rabbit_quorum_queue.erl`) quorum navbatlar uchun ishlatiladi. Production'da qo'llanmaydi:

```text vps
$ rabbitmqctl eval 'ra_server_proc:force_shrink_members_to_current_member({rabbit_stream_coordinator, node()}).'
ok
$ rabbitmq-streams -q coordinator_status --formatter json | python3 -c 'import json,sys; [print(r["Node Name"], r["Raft State"]) for r in json.load(sys.stdin)]'
rabbit@lab leader
$ timeout 60 rabbitmqadmin queues declare --name sinov-stream --type stream --durable true; echo "kod: $?"
kod: 0
```

Coordinator tiklandi va stream yaratish yana ishladi. Metama'lumot ombori (Khepri) — `rabbit@lab` lider, yozish ishlaydi. Klaster yana bitta tugun.

Xulosa: klasterni 3 tadan 1 tugunga tushirishda oraliq 2 tugunli holat Raft guruhlari uchun xavfli.

## Variantlar

| Holat | Tanlov |
| --- | --- |
| Production klaster | 3 yoki 5 tugun, peer discovery (RQ) |
| Navbat nusxalari | Quorum navbat yoki stream |
| Sinov | Konteynerlar (RQ) yoki bitta mashinada bir nechta tugun |
| Tugun qo'shish | `join_cluster` (sinovda) yoki peer discovery |
| Tugunni chiqarish | `stop_app` + `forget_cluster_node`; oldin `check_if_node_is_quorum_critical` |
| Bir nechta ma'lumot markazi | RQ: kamida 3 markaz yoki Shovel/Federation |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| 2 tugunli klaster | Ko'pchilik yo'q (RQ; sinovda stream coordinator ishlamay qoldi) | Toq son |
| Classic navbat klasterda nusxalanadi deb o'ylash | Bitta tugunda (RQ) | Quorum |
| Ma'lumotli tugunni klasterga qo'shish | Qo'shilish uning ma'lumotini o'chiradi (RQ) | Blue-green yoki zaxira |
| Tugunlararo portlarni internetga ochish | Faqat ichki tarmoq (RQ) | Firewall |
| Tugunni to'xtatishdan oldin tekshirmaslik | Quorum yo'qolishi mumkin | `check_if_node_is_quorum_critical` |

## Amaliyot

1. Klasterda nima avtomatik nusxalanadi va nima nusxalanmaydi?
2. Nega ikki tugunli klaster tavsiya etilmaydi?
3. Bitta hostda ikkinchi tugun uchun nimalar alohida bo'lishi kerak?
4. Sinovda lider tugun to'xtatilganda nima bo'ldi?
5. Sinovda `n1` ni olib tashlash nega xato berdi?

<details>
<summary>Javoblar</summary>

1. Metama'lumot (foydalanuvchilar, vhost'lar, exchange'lar …) — ha; navbat xabarlari — faqat quorum navbat yoki stream bo'lsa.
2. Aloqa uzilganda ko'pchilikni aniqlab bo'lmaydi, quorum navbatlar ishlamay qoladi.
3. Tugun nomi, portlar (AMQP, plaginlar), ma'lumotlar va log joyi.
4. Qolgan ikki tugun yangi lider sayladi (term 2), xabarlar boshqa tugundan o'qildi.
5. Stream coordinator'da 2 a'zo qolgan edi, bittasi to'xtatilgach ko'pchilik yo'qoldi.

</details>

## Rasmiy hujjat

- [RQ: Clustering Guide](https://www.rabbitmq.com/docs/clustering) — A Cluster on a Single Machine, How to Remove a Node
- [RQ: Cluster Formation and Peer Discovery](https://www.rabbitmq.com/docs/cluster-formation)
- [RQ: Clustering and Network Partitions](https://www.rabbitmq.com/docs/partitions)
- [rabbit_quorum_queue.erl (force_shrink)](https://github.com/rabbitmq/rabbitmq-server/blob/main/deps/rabbit/src/rabbit_quorum_queue.erl)
