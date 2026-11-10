# 30 — Xotira va disk chegaralari

[Mundarija](README.md)

## Tushuncha

### Resurs alarmlari (RQ: Resource Alarms)

Yuklamaga qarab tugun turli miqdorda xotira va disk ishlatadi. Xotira tugasa, OS tugunni o'ldirishi mumkin (Linux'da **OOM killer**). Disk to'lsa, tugun ko'p ichki amallarni bajara olmaydi. Shuning uchun ikkita **chegara** (watermark) bor:

| Alarm | Qachon | Standart |
| --- | --- | --- |
| **Xotira** | Ishlatilgan xotira chegaradan **oshsa** | `vm_memory_high_watermark.relative = 0.6` (RAM'ning 60%) |
| **Disk** | Bo'sh disk joyi chegaradan **kamaysa** | `disk_free_limit` — 50MB |

Alarm yoqilganda (RQ):

- **Yuboruvchi** ulanishlar **bloklanadi**: tugun ulardan o'qishni to'xtatadi (TCP back pressure). Ulanish holati — `blocked` (yuborishga urindi), `blocking` (hali yubormagan, yuborsa bloklanadi).
- **Faqat o'quvchi** ulanishlar bloklanmaydi — yetkazish davom etadi.
- Heartbeat kuzatuvi ham o'chiriladi.
- Klasterda alarm **butun klaster bo'yicha**: bitta tugun chegaraga yetsa, hamma tugunlar bloklaydi.
- Mos klientlarga `connection.blocked` xabari keladi (22-bob).
- RQ maslahati: yuborish va o'qish uchun **alohida ulanishlar**.
- Ma'lumot xavfsizligi: yuborish oxir-oqibat timeout yoki xato bilan tugaydi. Ilova bunga tayyor bo'lishi va publisher confirms ishlatishi kerak (20-bob).

### Xotira chegarasi (RQ: Memory Threshold and Limit)

- Chegara — xotira ishlatishni **taqiqlamaydi**. Bu faqat yuboruvchilar sekinlashtiriladigan nuqta.
- **Nisbiy**: `vm_memory_high_watermark.relative = 0.6`. **Mutlaq**: `vm_memory_high_watermark.absolute = 1024MiB`. Konteynerlarda (Kubernetes) **mutlaq** qiymat qat'iyan tavsiya etiladi — tugun cgroups chegarasini har doim ham aniqlay olmaydi.
- Ishlab turgan tugunda: `rabbitmqctl set_vm_memory_high_watermark 0.7` yoki `… absolute "4G"`. Qayta ishga tushirilguncha amal qiladi.
- `set_vm_memory_high_watermark 0` — xotira alarmi darhol yoqiladi: **barcha yuborishni vaqtincha to'xtatish** usuli.

### Disk chegarasi (RQ: Free Disk Space Alarms)

- Bo'sh joy kamida **10 soniyada** bir tekshiriladi, chegaraga yaqinlashganda — tez-tez (soniyasiga 10 martagacha).
- Juda past chegara xavfli: tekshiruvlar oralig'ida disk to'lishi mumkin. Ehtiyotkor yondashuv — chegarani tizimdagi **RAM hajmicha** qo'yish.
- `disk_free_limit.absolute = 1GB` — tavsiya etilgan (nisbiydan tushunarliroq). Ishlab turganda — `rabbitmqctl set_disk_free_limit`.

### Xotira qayerga ketyapti (RQ: Reasoning About Memory Use)

`rabbitmq-diagnostics memory_breakdown` xotirani toifalar bo'yicha ko'rsatadi: ulanishlar, quorum va stream replikalari, classic navbat xabarlari ombori, binary, metrics (boshqaruv statistikasi), plaginlar, `allocated_unused` (ajratilgan, lekin hali ishlatilmagan), kod, ETS jadvallari, atom'lar va boshqalar.

## Ko'rib chiqamiz

VPS'da (RabbitMQ 4.4.0, RAM 1.8 GB).

### Chegaralar va xotira taqsimoti

```text vps
$ grep -E 'Memory high watermark set to|Disk free limit set to' /var/log/rabbitmq/rabbit@lab.log | tail -2 | sed 's/^.*> //'
Memory high watermark set to 1076 MiB (1128446361 bytes) of 1793 MiB (1880743936 bytes) total
Disk free limit set to 50MB
$ free -m | head -2; df -h /var/lib/rabbitmq | tail -1 | awk '{print "disk:", $4, "bo`sh"}'
               total        used        free      shared  buff/cache   available
Mem:            1793         933         329          34         730         859
disk: 33G bo`sh
$ rabbitmq-diagnostics -q memory_breakdown --unit mb | head -8
allocated_unused: 224.6893 mb (55.47%)
other_system: 126.9279 mb (31.34%)
code: 23.8942 mb (5.9%)
other_proc: 22.8921 mb (5.65%)
metrics: 6.6173 mb (1.63%)
msg_index: 1.157 mb (0.29%)
atom: 1.1308 mb (0.28%)
plugins: 0.8322 mb (0.21%)
$ rabbitmq-diagnostics -q alarms; rabbitmq-diagnostics -q check_local_alarms; echo "kod: $?"
Node rabbit@lab reported no alarms, local or clusterwide
Node rabbit@lab reported no local alarms
kod: 0
```

- Xotira chegarasi — 1793 MiB'ning 60%i (standart 0.6), disk — 50MB. Ikkalasi ham ishga tushishda log'ga yoziladi (RQ).
- Ish yo'q tugunda xotiraning yarmidan ko'pi `allocated_unused` (ajratilgan, ishlatilmagan) va `other_system`.

### Disk alarmi — yuboruvchi va o'quvchi

Disk chegarasini vaqtincha mavjud bo'sh joydan 1 GB ko'p qilib qo'yamiz — alarm yoqiladi. Navbatda oldindan 3 xabar bor. Skriptda ikki **alohida** ulanish ochiladi (RQ maslahati):

```js
// Disk alarmi paytida: yuboruvchi ulanish bloklanadi, iste'molchi ishlashda davom etadi
const amqp = require('amqplib');
const t = () => new Date().toTimeString().slice(0, 8);
(async () => {
  const iste = await amqp.connect('amqp://localhost', { clientProperties: { connection_name: 'istemolchi' } });
  const yub = await amqp.connect('amqp://localhost', { clientProperties: { connection_name: 'yuboruvchi' } });
  yub.on('blocked', r => console.log(`${t()} yuboruvchi: blocked (${r})`));
  yub.on('unblocked', () => console.log(`${t()} yuboruvchi: unblocked`));
  const ich = await iste.createChannel(); await ich.prefetch(1);
  await ich.consume('alarm-q', async m => {
    console.log(`${t()} iste'molchi oldi: ${m.content}`);
    await new Promise(r => setTimeout(r, 1000)); ich.ack(m);
  });
  const ych = await yub.createConfirmChannel();
  console.log(`${t()} yuboruvchi: xabar yuborildi`);
  ych.sendToQueue('alarm-q', Buffer.from('yangi'), {}, () => console.log(`${t()} yuboruvchi: tasdiq keldi`));
  setTimeout(() => process.exit(0), 16000);
})();
```

Ulanish holatini ko'rsatish uchun (`connection_name` va `state`):

```python
# rabbitmqctl list_connections client_properties state chiqishidan: ulanish nomi va holati
import sys, re
for l in sys.stdin.read().splitlines()[1:]:
    n = re.search(r'\{"connection_name","([^"]+)"\}', l)
    print(f'{n.group(1) if n else "-":12} {l.rsplit(None, 1)[-1]}')
```

```text vps
$ rabbitmqadmin queues declare --name alarm-q --durable true >/dev/null; for i in 1 2 3; do rabbitmqadmin publish message --routing-key alarm-q --payload "eski $i" >/dev/null; done; B=$(df -B1 --output=avail /var/lib/rabbitmq | tail -1); rabbitmqctl -q set_disk_free_limit $((B + 1000000000)); sleep 12; rabbitmq-diagnostics -q alarms
Free disk space alarm on node rabbit@lab
$ cd /root/rabbit-ilova && node ikki.js > /root/ikki.log 2>&1 & sleep 4; rabbitmqctl -q list_connections client_properties state | python3 /root/rabbit-ilova/holat.py; rabbitmqctl -q set_disk_free_limit 50MB; echo "$(date +%T) --- chegara 50MB"; sleep 15; rabbitmq-diagnostics -q alarms; rabbitmqctl -q list_connections client_properties state | python3 /root/rabbit-ilova/holat.py; rabbitmqctl -q list_queues name messages | grep alarm; sleep 20; cat /root/ikki.log
yuboruvchi   blocked
istemolchi   blocking
09:31:49 --- chegara 50MB
Node rabbit@lab reported no alarms, local or clusterwide
alarm-q	0
09:31:36 iste'molchi oldi: eski 1
09:31:36 yuboruvchi: xabar yuborildi
09:31:36 yuboruvchi: blocked (low on disk)
09:31:37 iste'molchi oldi: eski 2
09:31:38 iste'molchi oldi: eski 3
09:31:49 yuboruvchi: unblocked
09:31:49 yuboruvchi: tasdiq keldi
09:31:49 iste'molchi oldi: yangi
```

- Alarm 12 soniyada yoqildi (tekshiruv oralig'i ≈ 10 s).
- Yuboruvchi xabarni yubordi va darhol `blocked (low on disk)` oldi; holati — `blocked`. Iste'molchi — `blocking`: u yubormagan, shuning uchun eski 3 xabarni **olishda davom etdi**.
- Chegara 50MB ga qaytarilgan soniyadayoq: `unblocked`, kutib turgan xabar uchun tasdiq keldi va iste'molchi uni oldi. Xabar yo'qolmadi.

### `check_alarms` va `check_local_alarms`

```text vps
$ B=$(df -B1 --output=avail /var/lib/rabbitmq | tail -1); rabbitmqctl -q set_disk_free_limit $((B + 1000000000)); sleep 12; rabbitmq-diagnostics -q alarms; rabbitmq-diagnostics -q check_alarms; echo "check_alarms kod: $?"; rabbitmq-diagnostics -q check_local_alarms; echo "check_local_alarms kod: $?"
Free disk space alarm on node rabbit@lab
Free disk space alarm on node rabbit@lab
check_alarms kod: 69
Node rabbit@lab reported no local alarms
check_local_alarms kod: 0
$ rabbitmqctl -q set_disk_free_limit 50MB; sleep 3; rabbitmq-diagnostics -q check_alarms; echo "kod: $?"
Node rabbit@lab reported no alarms, local or clusterwide
kod: 0
```

Kuzatildi: 4.4.0 da disk alarmi yoqiq turganda `check_alarms` uni ko'rdi (kod 69), `check_local_alarms` esa "no local alarms" dedi (kod 0). Monitoring tekshiruvlarida (31-bob) disk alarmi uchun `check_alarms` ishonchliroq.

## Variantlar

| Holat | Tanlov |
| --- | --- |
| Oddiy server | Nisbiy xotira chegarasi 0.6 (standart) |
| Konteyner, Kubernetes | `vm_memory_high_watermark.absolute` (RQ) |
| Disk tez to'lishi mumkin | `disk_free_limit.absolute` ≈ RAM hajmi (RQ) |
| Barcha yuborishni vaqtincha to'xtatish | `set_vm_memory_high_watermark 0` (RQ) |
| Xotira qayerga ketayotganini topish | `memory_breakdown` |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Chegara xotirani cheklaydi deb o'ylash | Faqat yuboruvchilarni sekinlashtiradi (RQ) | Yetarli RAM, monitoring |
| Yuborish va o'qish bitta ulanishda | Alarmda o'quvchi ham to'xtashi mumkin (RQ) | Alohida ulanishlar |
| Standart 50MB disk chegarasi production'da | Tekshiruvlar oralig'ida disk to'lishi mumkin (RQ) | RAM hajmicha |
| Konteynerda nisbiy chegara | cgroups chegarasi aniqlanmasligi mumkin (RQ) | Mutlaq qiymat |
| `set_…` buyrug'i bilan o'zgartirib, faylga yozmaslik | Qayta ishga tushirilganda qaytadi (RQ) | `rabbitmq.conf` |
| Alarmni `check_local_alarms` bilan kuzatish | Disk alarmini ko'rmadi (sinovda) | `check_alarms` |

## Amaliyot

1. Ikki resurs alarmi qachon yoqiladi va standart chegaralar qancha?
2. Alarm yoqilganda qaysi ulanishlar bloklanadi?
3. `blocked` va `blocking` holatlarining farqi nima?
4. Konteynerda xotira chegarasi qanday beriladi va nega?
5. Sinovda alarm o'chganda bloklangan xabar bilan nima bo'ldi?

<details>
<summary>Javoblar</summary>

1. Xotira 60% dan oshsa; bo'sh disk 50MB dan kamaysa.
2. Yuboruvchi ulanishlar; faqat o'quvchilar bloklanmaydi.
3. `blocked` — yuborishga urinib to'xtatilgan; `blocking` — hali yubormagan.
4. Mutlaq qiymat bilan — tugun cgroups chegarasini aniqlay olmasligi mumkin.
5. Ulanish ochildi, tasdiq keldi, xabar navbatga tushib iste'molchiga yetdi.

</details>

## Rasmiy hujjat

- [RQ: Resource Alarms](https://www.rabbitmq.com/docs/alarms)
- [RQ: Memory Threshold and Limit](https://www.rabbitmq.com/docs/memory)
- [RQ: Free Disk Space Alarms](https://www.rabbitmq.com/docs/disk-alarms)
- [RQ: Reasoning About Memory Use](https://www.rabbitmq.com/docs/memory-use)
