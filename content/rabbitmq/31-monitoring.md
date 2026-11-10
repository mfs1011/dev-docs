# 31 — Monitoring

[Mundarija](README.md)

## Tushuncha

RQ (Monitoring): **monitoring** — tizim xatti-harakatini health check'lar va **metrikalar** orqali vaqt davomida yozib borish. U g'ayrioddiy holatni topishga yordam beradi: tizim ishlamay qolgan, yuklama odatdagidan yuqori yoki biror resurs tugagan bo'lsa. Uzoq muddat saqlangan metrikalar sababni topish, tendensiyalarni ko'rish va sig'imni rejalash uchun ham kerak. Monitoring odatda ogohlantirish (alerting) tizimi bilan ulanadi.

### Ikki xil metrika (RQ)

| Tur | Misollar |
| --- | --- |
| **Infratuzilma (kernel)** | CPU, xotira, kernel page cache (ayniqsa stream'larda), disk I/O, ma'lumotlar katalogidagi bo'sh joy, `beam.smp` ning fayl deskriptorlari, TCP ulanishlar holati, tarmoq tezligi va kechikishi |
| **RabbitMQ** | Ulanishlar, navbatlar, xabarlar, xotira chegarasi, alarmlar, xabar tezliklari |

### Usullar (RQ)

- **Prometheus plagini** (`rabbitmq_prometheus`, port 15692) — kam yuklama beradi, production uchun **qat'iyan tavsiya etiladi**. Prometheus + Grafana bilan ishlatiladi. Afzalliklari: monitoring kuzatilayotgan tizimdan ajralgan, metrikalar uzoq saqlanadi, tugun ishdan chiqsa ham ma'lumot qoladi.
- **Boshqaruv plagini HTTP API** (15672, 4-bob).
- **CLI** — `rabbitmq-diagnostics`.

**Endpoint'lar** (RQ: Prometheus):

| Yo'l | Nima |
| --- | --- |
| `/metrics` | **Yig'ilgan** (aggregated) metrikalar: obyektlar soni oshsa ham hajmi o'zgarmaydi — katta tizimlar uchun |
| `/metrics/per-object` | Har obyekt (navbat, ulanish) uchun alohida — obyekt ko'p bo'lsa juda katta |
| `/metrics/memory-breakdown` | `memory_breakdown` ga o'xshash. Barcha Erlang jarayonlarini aylanib chiqadi, shuning uchun katta tizimda kam so'raladi |

**Chastota** (RQ): production'da metrikalarni har **30 soniyada** (30–60 oralig'ida) yig'ish. Prometheus uchun — 15–30 s. Ishlab chiqishda — 5 s, undan kam emas. Juda tez-tez va ortiqcha so'rovlar tugun CPU'sini yeydi.

### Health check bosqichlari (RQ)

Har keyingi bosqich oldingisini o'z ichiga oladi va chuqurroq tekshiradi. Lekin soxta xato (false positive) ehtimoli ham ortadi:

| Bosqich | Buyruq | Tekshiradi |
| --- | --- | --- |
| 1 | `rabbitmq-diagnostics -q ping` | Runtime ishlayapti, CLI ulana oladi |
| 2 | `status` | + asosiy tizim ma'lumotlari |
| 3 | `check_running && check_local_alarms` | + RabbitMQ ilovasi to'xtatilmagan, mahalliy alarm yo'q |
| 4 | `check_port_connectivity` | + barcha tinglovchilarga TCP ulanish |
| 5 | `check_virtual_hosts` | + ishdan chiqqan vhost yo'q |

Muvaffaqiyat — chiqish kodi `0`. Bu buyruqlar orkestratorlarda **readiness probe** sifatida ham ishlatiladi.

## Ko'rib chiqamiz

VPS'da (RabbitMQ 4.4.0).

### Health check'lar

```text vps
$ rabbitmq-diagnostics -q ping; echo "ping kod: $?"
Ping succeeded
ping kod: 0
$ rabbitmq-diagnostics -q status | grep -E '^RabbitMQ version|^Erlang configuration|^Uptime|^Total memory used|^Memory high watermark|^Free bytes|^Used:|^Total:' | head -8
Uptime (seconds): 719
RabbitMQ version: 4.4.0
Erlang configuration: Erlang/OTP 27 [erts-15.2.7.14] [source] [64-bit] [smp:240:1] [ds:240:1:10] [async-threads:1] [jit:ns]
Total memory used: 0.3234 gb
Memory high watermark setting: 0.6 of available memory, computed to: 1.1284 gb
$ rabbitmq-diagnostics -q check_running && rabbitmq-diagnostics -q check_local_alarms; echo "3-bosqich kod: $?"
RabbitMQ on node rabbit@lab is fully booted and running
Node rabbit@lab reported no local alarms
3-bosqich kod: 0
$ rabbitmq-diagnostics -q check_port_connectivity --address 127.0.0.1; echo "4-bosqich kod: $?"
Will connect to 127.0.0.1:15672
Will connect to 127.0.0.1:5552
Will connect to 127.0.0.1:25672
Will connect to 127.0.0.1:5672
Will connect to 127.0.0.1:5671
Successfully connected to ports 5552, 5671, 5672, 15672, 25672 on node rabbit@lab (using 127.0.0.1 for target IP address)
4-bosqich kod: 0
$ rabbitmq-diagnostics -q check_virtual_hosts; echo "5-bosqich kod: $?"
Node rabbit@lab reported all vhosts as running
5-bosqich kod: 0
```

Beshala bosqich o'tdi. 4-bosqich barcha tinglovchilarni tekshirdi: stream (5552), TLS (5671), AMQP (5672), HTTP API (15672), klaster (25672).

30-bobdagi kuzatuvni eslang: `check_local_alarms` disk alarmini ko'rmagan edi. Shuning uchun alarmlar uchun `check_alarms` ham kerak.

### Prometheus plagini

```text vps
$ rabbitmq-plugins enable rabbitmq_prometheus 2>&1 | grep -E 'started|enabling'; sleep 2; rabbitmq-diagnostics -q listeners | grep prometheus
started 1 plugins.
Interface: [::], port: 15692, protocol: http/prometheus, purpose: Prometheus exporter API over HTTP
$ curl -s localhost:15692/metrics | wc -l; curl -s localhost:15692/metrics | grep -E '^rabbitmq_(build_info|connections |queues |queue_messages_ready |resident_memory_limit_bytes|disk_space_available_bytes)' | cut -c1-170
29513
rabbitmq_disk_space_available_bytes 34715672576
rabbitmq_resident_memory_limit_bytes 1128446361
rabbitmq_queue_messages_ready 0
rabbitmq_connections 0
rabbitmq_queues 3
rabbitmq_build_info{rabbitmq_version="4.4.0",prometheus_plugin_version="4.4.0",prometheus_client_version="6.1.1",erlang_version="27.3.4.19"} 1
```

- Tinglovchi — 15692.
- `/metrics` ~29 ming qator. Muhim metrikalar: bo'sh disk, xotira chegarasi, ulanishlar, navbatlar, versiya.

Kuzatildi:

```text vps
$ curl -s localhost:15692/metrics | grep -v '^#' | grep -c '^erlang_vm_msacc'; nproc; rabbitmq-diagnostics -q status | grep -o 'smp:[0-9:]*'
3451
1
smp:240:1
```

VPS'da 1 ta CPU (`nproc`), lekin Erlang 240 ta mantiqiy protsessor ko'rmoqda (`smp:240:1` — 240 scheduler, 1 tasi ishlayapti). Shu sabab har scheduler uchun alohida `erlang_vm_msacc_*` qatorlari bor — `/metrics` hajmining asosiy qismi shular. Bu VPS virtualizatsiyasiga xos holat; 27-bobdagi `Failed to create dirty cpu scheduler thread` ogohlantirishi ham shunga bog'liq ko'rinadi.

### Yig'ilgan va obyekt bo'yicha

```text vps
$ rabbitmqadmin queues declare --name mon-q --durable true >/dev/null; for i in 1 2 3; do rabbitmqadmin publish message --routing-key mon-q --payload "m$i" >/dev/null; done; sleep 6; curl -s localhost:15692/metrics/per-object | grep -E '^rabbitmq_queue_messages_ready\{' | grep -v 'messages_ready{[^}]*} 0$'
rabbitmq_queue_messages_ready{vhost="/",queue="mon-q"} 3
$ curl -s localhost:15692/metrics | grep -E '^rabbitmq_queue_messages_ready '
rabbitmq_queue_messages_ready 3
```

`/metrics/per-object` da `mon-q` navbatining o'zi chiqdi. `/metrics` da esa barcha navbatlar yig'indisi chiqdi. Bu sinovda ikkalasi ham 3, chunki xabar bor yagona navbat — `mon-q`.

```text vps
$ curl -s localhost:15692/metrics/memory-breakdown | grep -E '^rabbitmq_memory_(code_module|allocated_unused|quorum_queue_procs|classic_queue_procs)_bytes'
rabbitmq_memory_code_module_bytes 26415294
```

`memory-breakdown` toifalari — `rabbitmq_memory_*_bytes`.

### HTTP API

```text vps
$ curl -s -u guest:guest localhost:15672/api/overview | python3 -c "import json,sys; d=json.load(sys.stdin); print('object_totals:', d['object_totals']); print('queue_totals:', {k: d['queue_totals'][k] for k in ('messages','messages_ready','messages_unacknowledged')})"
object_totals: {'channels': 0, 'consumers': 0, 'exchanges': 11, 'queues': 4, 'connections': 0}
queue_totals: {'messages': 3, 'messages_ready': 3, 'messages_unacknowledged': 0}
$ curl -s -u guest:guest localhost:15672/api/queues/%2F/mon-q | python3 -c "import json,sys; d=json.load(sys.stdin); print({k: d.get(k) for k in ('name','type','messages','consumers','state')})"
{'name': 'mon-q', 'type': 'classic', 'messages': 3, 'consumers': 0, 'state': 'running'}
$ curl -s -u guest:guest localhost:15672/api/health/checks/alarms; echo; curl -s -u guest:guest localhost:15672/api/health/checks/virtual-hosts; echo
{"status":"ok"}
{"status":"ok"}
$ rabbitmqadmin queues delete --name mon-q
```

- `/api/overview` — obyektlar va xabarlar soni butun klaster bo'yicha.
- `/api/queues/{vhost}/{nom}` — bitta navbat (`/` vhost — `%2F`).
- `/api/health/checks/…` — HTTP orqali health check'lar.

## Variantlar

| Kerak | Tanlov |
| --- | --- |
| Production monitoring | Prometheus + Grafana, `rabbitmq_prometheus` (RQ tavsiyasi) |
| Navbat bo'yicha ogohlantirish | `/metrics/per-object` (obyekt kam bo'lsa) |
| Konteyner readiness probe | `check_running`, `check_port_connectivity` |
| Tez qo'lda tekshiruv | `rabbitmq-diagnostics status`, boshqaruv UI'si |
| Skriptdan kuzatish | HTTP API (`/api/overview`, `/api/health/checks/*`) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Faqat health check bilan cheklanish | Bir lahzadagi holat; tendensiyani ko'rsatmaydi (RQ) | Metrikalar vaqt davomida |
| Har soniyada so'rash | CPU yuklamasi (RQ) | 15–60 s |
| Katta tizimda `per-object` | Juda katta javob (RQ) | `/metrics` |
| Faqat RabbitMQ metrikalari | Disk, CPU, deskriptorlar ham kerak (RQ) | Infratuzilma metrikalari ham |
| Alarmni `check_local_alarms` bilan | Disk alarmini ko'rmadi (30-bob, sinovda) | `check_alarms` |
| Eskirgan "intruziv" health check | RQ: undan qochish kerak | 1–5 bosqichlar |

## Amaliyot

1. Monitoring nima va health check undan qanday farq qiladi?
2. Qaysi monitoring usuli production uchun tavsiya etiladi?
3. `/metrics` va `/metrics/per-object` farqi nima?
4. 3-bosqich health check qaysi buyruqlardan iborat?
5. Metrikalarni qanchalik tez-tez yig'ish tavsiya etiladi?

<details>
<summary>Javoblar</summary>

1. Metrikalarni vaqt davomida yig'ish; health check — bir lahzadagi bitta yoki bir nechta tekshiruv.
2. `rabbitmq_prometheus` + Prometheus/Grafana.
3. Yig'ilgan (hajmi doimiy) va har obyekt uchun alohida.
4. `check_running && check_local_alarms`.
5. Production'da har 30 s (30–60), Prometheus — 15–30 s, ishlab chiqishda 5 s dan kam emas.

</details>

## Rasmiy hujjat

- [RQ: Monitoring](https://www.rabbitmq.com/docs/monitoring)
- [RQ: Monitoring with Prometheus and Grafana](https://www.rabbitmq.com/docs/prometheus)
