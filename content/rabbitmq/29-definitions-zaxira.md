# 29 — Definitions va zaxira

[Mundarija](README.md)

## Tushuncha

### Tugundagi ikki xil ma'lumot (RQ: Backup and Restore)

| Tur | Nima | Xususiyati |
| --- | --- | --- |
| **Definitions** (sxema, metama'lumot, topologiya) | Foydalanuvchilar, vhost'lar, navbatlar, exchange'lar, binding'lar, policy'lar, runtime parametrlar | Asosan o'zgarmaydi; ichki bazada, klasterning **har tugunida** to'liq nusxasi bor |
| **Xabarlar** | Navbat va stream'lardagi xabarlar | Doim oqib turadi; har tugun o'z navbatlari xabarlarini o'zida saqlaydi: `msg_stores` (classic), `quorum`, `stream` kataloglari |

### Definitions (RQ: Schema Definition Export and Import)

- **JSON** faylga eksport qilinadi va boshqa klasterga import qilinadi — sxemani zaxiralash yoki oldindan to'ldirish uchun.
- Klasterning istalgan tugunidan eksport qilish mumkin — natija bir xil.
- Eksport usullari: `rabbitmqctl export_definitions` (boshqaruv plagini **shart emas**), `rabbitmqadmin definitions export`, `GET /api/definitions`.
- Import: `rabbitmqctl import_definitions`, `rabbitmqadmin definitions import`, `POST /api/definitions`.
- **Maxfiy**: faylda parol **xeshlari** va xeshlash funksiyasi bor. SHA-256/512 xeshlarini taxmin qilish oson bo'lmasa ham, foydalanuvchi yozuvlari maxfiy ma'lumot hisoblanadi.
- `rabbitmqadmin` v2 eksportni o'zgartira oladi (`--transformations`): `exclude_users`, `exclude_permissions`, `obfuscate_usernames`, `exclude_policies` va boshqalar.
- **Ishga tushishda import**: `definitions.import_backend = local_filesystem` + `definitions.local.path`. RQ: tugunlarni joylashtirishda oldindan sozlashning **tavsiya etilgan** usuli. `definitions.skip_if_unchanged = true` — fayl o'zgarmagan bo'lsa qayta import qilinmaydi. Import mavjud narsalarni **ustidan yozmaydi**. Bo'sh tugun import qilsa, standart vhost va `guest` yaratilmaydi.

### Zaxira (RQ)

- Definitions'ni zaxiralashning tavsiya etilgan usuli — **JSON eksport**. U faqat ishlab turgan tugundan olinadi.
- **Xabarlar**: yagona usul — ma'lumotlar katalogini nusxalash, tugun **to'xtatilgan** holda. Ishlab turgan tugundan nusxalash qat'iyan tavsiya etilmaydi — nomuvofiq holat bo'lishi mumkin.
- Diskdagi zaxira faqat **aynan o'sha tugun nomi** bilan tiklanadi. Quorum navbat yoki stream ishlatilsa, tugunni qayta nomlash mumkin emas.
- Xabarlar tiklanishi uchun definitions oldindan bo'lishi kerak. Noma'lum vhost va navbat xabarlari yuklanmaydi.
- RQ: tiklash uchun boshqa yechimlarga yoki alohida zaxira klasterga tayangan ma'qul.

## Ko'rib chiqamiz

VPS'da (RabbitMQ 4.4.0). Sinov topologiyasi: `dokon` vhost, `dokon-app` foydalanuvchisi (paroli generatsiya qilingan, faylda), policy, topic exchange, quorum navbat, binding:

```text vps
$ rabbitmqctl -q delete_user dokon-app 2>/dev/null; rm -f /root/dokon-parol; rabbitmqctl -q add_vhost dokon; umask 077; openssl rand -hex 24 > /root/dokon-parol; rabbitmqctl -q add_user dokon-app "$(cat /root/dokon-parol)" >/dev/null; rabbitmqctl -q set_permissions -p dokon dokon-app "^buyurtma.*" "^buyurtma.*" "^buyurtma.*"; rabbitmqctl -q set_permissions -p dokon guest ".*" ".*" ".*"; rabbitmqctl -q set_policy -p dokon uzunlik "^buyurtma\." '{"max-length":1000}' --apply-to queues
$ rabbitmqadmin --vhost dokon exchanges declare --name buyurtma --type topic --durable true >/dev/null; rabbitmqadmin --vhost dokon queues declare --name buyurtma.yangi --type quorum --durable true >/dev/null; rabbitmqadmin --vhost dokon bindings declare --source buyurtma --destination-type queue --destination buyurtma.yangi --routing-key 'yangi.#' >/dev/null; for i in 1 2 3; do rabbitmqadmin --vhost dokon publish message --exchange buyurtma --routing-key yangi.web --payload "buyurtma $i" >/dev/null; done; rabbitmqctl -q list_queues -p dokon name type messages
name	type	messages
buyurtma.yangi	quorum	0
```

Kuzatildi: `messages` darhol 0 ko'rsatdi — hisoblagich bir oz kechikib yangilanadi (keyinroq 3 ko'rindi).

### Eksport

Definitions faylining qisqa ko'rinishi uchun skript (parol xeshi yashiriladi):

```python
# Definitions faylining qisqa ko'rinishi: bo'limlar va har biridagi yozuvlar soni; parol xeshi yashiriladi
import json, sys
d = json.load(open(sys.argv[1]) if sys.argv[1] != '-' else sys.stdin)
for k, v in d.items():
    print(f"{k}: {len(v) if isinstance(v, list) else v}")
for u in d.get('users', []):
    if u['name'] == 'dokon-app':
        print('dokon-app:', {k: ('…' if k == 'password_hash' else v) for k, v in u.items()})
```

```text vps
$ mkdir -p /root/zaxira && chmod 700 /root/zaxira && rabbitmqctl export_definitions /root/zaxira/defs.json 2>&1 | head -1
Error (argument validation): Bad argument: Directory /root/zaxira does not exist
$ install -d -m 700 -o rabbitmq -g rabbitmq /var/backups/rabbitmq && rabbitmqctl export_definitions /var/backups/rabbitmq/defs.json && ls -l /var/backups/rabbitmq | tail -1 | awk '{print $1, $3, $NF}'
Exporting definitions in JSON to a file at "/var/backups/rabbitmq/defs.json" ...
-rw-r--r-- rabbitmq defs.json
$ python3 /root/rabbit-ilova/defs.py /var/backups/rabbitmq/defs.json
permissions: 3
bindings: 1
queues: 4
parameters: 0
policies: 1
rabbitmq_version: 4.4.0
rabbit_version: 4.4.0
exchanges: 5
vhosts: 2
users: 2
global_parameters: 1
topic_permissions: 0
dokon-app: {'hashing_algorithm': 'rabbit_password_hashing_sha256', 'limits': {}, 'name': 'dokon-app', 'password_hash': '…', 'tags': []}
$ rabbitmqadmin definitions export --stdout --transformations exclude_users,exclude_permissions | python3 /root/rabbit-ilova/defs.py - | head -4
server_version: 4.4.0
users: 0
virtual_hosts: 2
permissions: 0
```

- Kuzatildi: `/root` dagi katalogga eksport — `Directory … does not exist`. Debian paketidagi `rabbitmqctl` buyrug'i ishni `rabbitmq` foydalanuvchisi nomidan bajaradi (`/usr/sbin/rabbitmqctl` — `run_script_as_rabbitmq`), u esa `/root` ichini ko'rmaydi. Zaxira katalogi — `rabbitmq` ga tegishli `/var/backups/rabbitmq`, `700`.
- Faylda: 2 vhost, 2 foydalanuvchi, ruxsatlar, policy, navbatlar, exchange'lar, binding. Foydalanuvchida `password_hash` va `hashing_algorithm` (SHA-256).
- `exclude_users,exclude_permissions` bilan — foydalanuvchi va ruxsatlarsiz.

### O'chirish va import

```text vps
$ rabbitmqctl -q delete_vhost dokon; rabbitmqctl -q delete_user dokon-app; rabbitmqctl -q list_vhosts name; rabbitmqctl -q list_users | grep -c dokon
name
/
0
$ rabbitmqctl import_definitions /var/backups/rabbitmq/defs.json
Importing definitions in JSON from a file at "/var/backups/rabbitmq/defs.json" ...
Successfully started definition import. This process is asynchronous and can take some time. Watch target node logs for completion.
$ rabbitmqctl -q list_vhosts name; rabbitmqctl -q list_queues -p dokon name type messages; rabbitmqctl -q list_policies -p dokon | cut -f2-5; rabbitmqctl -q authenticate_user dokon-app "$(cat /root/dokon-parol)" | tail -1
name
dokon
/
name	type	messages
buyurtma.yangi	quorum	0
name	pattern	apply-to	definition
uzunlik	^buyurtma\.	queues	{"max-length":1000}
Success
```

- `dokon` vhost va foydalanuvchi o'chirildi, so'ng import qilindi. Import **asinxron** — natija log'da.
- Vhost, quorum navbat, policy qaytdi. `dokon-app` **eski parol** bilan autentifikatsiyadan o'tdi — xesh fayldan tiklandi.
- Navbat **bo'sh** (0): definitions xabarlarni saqlamaydi.

### Xabarlar zaxirasi — tugun to'xtatilgan holda

```text vps
$ rabbitmqctl -q purge_queue -p dokon buyurtma.yangi; for i in 1 2 3; do rabbitmqadmin --vhost dokon publish message --exchange buyurtma --routing-key yangi.web --payload "buyurtma $i" >/dev/null; done; sleep 1; rabbitmq-diagnostics -q status | grep -A1 'Node data directory'; rabbitmqctl -q list_queues -p dokon name messages
Node data directory: /var/lib/rabbitmq/mnesia/rabbit@lab
Raft data directory: /var/lib/rabbitmq/mnesia/rabbit@lab/quorum/rabbit@lab
name	messages
buyurtma.yangi	3
$ systemctl stop rabbitmq-server && tar -C /var/lib/rabbitmq -czf /var/backups/rabbitmq/mnesia.tgz mnesia && systemctl start rabbitmq-server && ls -lh /var/backups/rabbitmq/mnesia.tgz | awk '{print $5, $NF}'
257K /var/backups/rabbitmq/mnesia.tgz
$ rabbitmqctl -q purge_queue -p dokon buyurtma.yangi; rabbitmqctl -q list_queues -p dokon name messages
name	messages
buyurtma.yangi	0
$ systemctl stop rabbitmq-server && mv /var/lib/rabbitmq/mnesia /var/backups/rabbitmq/mnesia.eski && tar -C /var/lib/rabbitmq -xzf /var/backups/rabbitmq/mnesia.tgz && systemctl start rabbitmq-server && rabbitmqctl -q list_queues -p dokon name messages
name	messages
buyurtma.yangi	3
$ rabbitmqadmin --vhost dokon get messages --queue buyurtma.yangi --count 3 --ack-mode ack_requeue_false | grep -o 'buyurtma [0-9]'
buyurtma 1
buyurtma 2
buyurtma 3
```

- Navbatda 3 xabar. Tugun to'xtatildi, ma'lumotlar katalogi arxivlandi, tugun qayta ishga tushirildi.
- Navbat tozalandi (0) — "yo'qotish".
- Tugun to'xtatildi, katalog arxivdan tiklandi (tugun nomi o'sha — `rabbit@lab`), ishga tushirildi — 3 xabar qaytdi.

```text vps
$ rabbitmqctl -q delete_vhost dokon; rabbitmqctl -q delete_user dokon-app; rm -rf /var/backups/rabbitmq /root/zaxira /root/dokon-parol; rabbitmqctl -q list_vhosts name; rabbitmqctl -q list_users
name
/
user	tags
guest	[administrator]
```

Sinov obyektlari va zaxira fayllari o'chirildi.

## Variantlar

| Kerak | Usul |
| --- | --- |
| Sxemani muntazam zaxiralash | `rabbitmqctl export_definitions` (cron), fayl maxfiy saqlanadi |
| Sxemani boshqa muhitga o'tkazish | Eksport → `exclude_users,exclude_permissions` → import |
| Yangi tugunni tayyor sxema bilan | `definitions.local.path` (ishga tushishda) |
| Xabarlar zaxirasi | Tugunni to'xtatib, ma'lumotlar katalogini nusxalash |
| Ishonchli tiklash | Alohida zaxira klaster (RQ) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Definitions xabarlarni ham saqlaydi deb o'ylash | Faqat sxema (sinovda navbat bo'sh qaytdi) | Xabarlar — alohida |
| Ishlab turgan tugun katalogini nusxalash | Nomuvofiq holat (RQ) | Avval to'xtatish |
| Boshqa nomli tugunga diskdan tiklash | Faqat o'sha nom (RQ) | Definitions import |
| Definitions faylini ochiq saqlash | Parol xeshlari bor (RQ) | `700` katalog, shifrlash |
| `/root` ga eksport | `rabbitmq` foydalanuvchisi ko'rmaydi (sinovda) | `rabbitmq` ga tegishli katalog |

## Amaliyot

1. Tugunda qanday ikki turdagi ma'lumot bor?
2. Definitions'ni qaysi buyruq boshqaruv plaginisiz eksport qiladi?
3. Nega definitions fayli maxfiy?
4. Sinovda import qilingandan keyin navbatda nechta xabar bor edi va nega?
5. Xabarlarni zaxiralashning sharti nima?

<details>
<summary>Javoblar</summary>

1. Definitions (sxema) va xabarlar.
2. `rabbitmqctl export_definitions`.
3. Unda parol xeshlari bor.
4. 0 — definitions faqat sxemani saqlaydi.
5. Tugun to'xtatilgan bo'lishi va tiklashda tugun nomi o'sha bo'lishi.

</details>

## Rasmiy hujjat

- [RQ: Schema Definition Export and Import](https://www.rabbitmq.com/docs/definitions)
- [RQ: Backup and Restore](https://www.rabbitmq.com/docs/backup)
