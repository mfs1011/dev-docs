# 02 — O'rnatish

[Mundarija](README.md)

## Tushuncha

RQ (Debian and Ubuntu): RabbitMQ'ni **Team RabbitMQ'ning apt omborlari**dan o'rnatish tavsiya etiladi. Standart Debian va Ubuntu omborlarida ham `rabbitmq-server` paketi bor, lekin RQ ogohlantiradi:

- u eng yangi versiyadan **ko'p relizlar orqada** va odatda hamjamiyat qo'llab-quvvatlashidan chiqqan yoki muddati tugagan;
- Debian relizlari orasidagi yillab tanaffus tufayli uni oldingi relizdagi versiyadan to'g'ridan-to'g'ri **yangilab bo'lmaydi**;
- standart omborlardagi **Erlang/OTP** ham ancha eski bo'lishi mumkin. RabbitMQ Erlang'da yozilgan va zamonaviy versiyalari uchun mos Erlang kerak.

RQ (Erlang Version Requirements): RabbitMQ 4.4.0 — Erlang 27, 28 va 29 bilan ishlaydi.

RQ: qo'llab-quvvatlanadigan distributivlar — Ubuntu 22.04, 24.04 va **26.04**; Debian 11, 12, 13. Ubuntu 26.04 va 24.04 uchun bitta ko'rsatma — **noble** omborlari.

### O'rnatish qadamlari (RQ)

1. Team RabbitMQ imzo kaliti (`0A9AF2115F4687BD29803A206B73A36E6026DFCA`) — `/usr/share/keyrings/com.rabbitmq.team.gpg`.
2. Ikki ombor: zamonaviy **Erlang** va eng yangi **RabbitMQ** (har biri ikki oynada: `deb1`, `deb2`).
3. Ixtiyoriy — **pinning** (`/etc/apt/preferences.d/`): bir paket bir nechta omborda bo'lsa qaysi biri afzal. RQ misoli: `erlang*` paketlari `Pin: origin RabbitMQ` dan, `Pin-Priority: 1001`.
4. Erlang paketlari, keyin `rabbitmq-server`.

### Portlar (RQ: Networking)

| Port | Nima |
| --- | --- |
| 5672, 5671 | AMQP 0-9-1 va AMQP 1.0 klientlari (TLS'siz / TLS bilan) |
| 5552, 5551 | RabbitMQ Stream protokoli (23-bob) |
| 4369 | `epmd` — tugunlar va CLI vositalari bir-birini topish xizmati |
| 25672 | Tugunlar va CLI vositalari aloqasi (Erlang distribution) |
| 15672, 15671 | HTTP API, boshqaruv paneli, `rabbitmqadmin` — faqat management plagini yoqilganda (4-bob) |
| 15692 | Prometheus metrikalari — plagin yoqilganda (31-bob) |

RQ: 25672 kabi portlar haqiqatan kerak bo'lmasa (federation, subnet tashqarisidagi CLI), **ochiq tarmoqqa chiqarilmasligi kerak**.

RQ (Default User Access): broker `guest` foydalanuvchisini `guest` paroli bilan yaratadi; standart holatda u **faqat localhost'dan** ulanishda ishlaydi (26-bob).

## Ko'rib chiqamiz

VPS'da (Ubuntu 26.04). O'rnatish — RQ'dagi "Ubuntu 26.04 and 24.04" skripti qadamlari bo'yicha, har qadam alohida (o'rnatish 2026-11-09 da bajarilgan).

### Ubuntu'ning o'z paketlari

```text vps
$ apt-cache policy rabbitmq-server erlang-base | grep -E '^[a-z]|Candidate'
rabbitmq-server:
  Candidate: 4.0.5-10ubuntu5.2
erlang-base:
  Candidate: 1:27.3.4.6+dfsg-1ubuntu0.2
```

Ubuntu 26.04: `rabbitmq-server` **4.0.5**, Erlang 27.3.4.6. RQ (Release Information) bo'yicha hamjamiyat qo'llab-quvvatlashi faqat 4.4 va 4.3 seriyalarida — 4.0 yo'q.

### Kalit va omborlar

```text vps
$ DEBIAN_FRONTEND=noninteractive apt-get install -y -q curl gnupg apt-transport-https 2>&1 | grep -E 'is already the newest|^Setting up' | head -4
curl is already the newest version (8.18.0-1ubuntu2.8).
gnupg is already the newest version (2.4.8-4ubuntu3.1).
Setting up apt-transport-https (3.2.1ubuntu0.1) ...
$ curl -1sLf "https://keys.openpgp.org/vks/v1/by-fingerprint/0A9AF2115F4687BD29803A206B73A36E6026DFCA" | gpg --dearmor | tee /usr/share/keyrings/com.rabbitmq.team.gpg > /dev/null; gpg --show-keys --with-fingerprint /usr/share/keyrings/com.rabbitmq.team.gpg 2>/dev/null | grep -E '^ +[0-9A-F ]{40,}|^uid' | sed 's/  */ /g'
 0A9A F211 5F46 87BD 2980 3A20 6B73 A36E 6026 DFCA
uid RabbitMQ Release Signing Key <info@rabbitmq.com>
```

Kalit izi RQ'dagi bilan bir xil: `0A9A F211 … 6026 DFCA`.

```text vps
$ cat /etc/apt/sources.list.d/rabbitmq.list; cat /etc/apt/preferences.d/erlang
## Modern Erlang/OTP releases
##
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb1.rabbitmq.com/rabbitmq-erlang/ubuntu/noble noble main
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb2.rabbitmq.com/rabbitmq-erlang/ubuntu/noble noble main

## Latest RabbitMQ releases
##
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb1.rabbitmq.com/rabbitmq-server/ubuntu/noble noble main
deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb2.rabbitmq.com/rabbitmq-server/ubuntu/noble noble main
# /etc/apt/preferences.d/erlang
Package: erlang*
Pin: origin RabbitMQ
# Note: priority of 1001 (greater than 1000) allows for downgrading.
# To make package downgrading impossible, use a value of 999
Pin-Priority: 1001
$ apt-get update -y 2>&1 | grep -E 'rabbitmq' | sed -E 's/ \[[0-9.,]+ [kMG]?B\]//' | cut -c1-110
Hit:5 https://deb2.rabbitmq.com/rabbitmq-erlang/ubuntu/noble noble InRelease
Hit:7 https://deb2.rabbitmq.com/rabbitmq-server/ubuntu/noble noble InRelease
Hit:8 https://deb1.rabbitmq.com/rabbitmq-erlang/ubuntu/noble noble InRelease
Hit:10 https://deb1.rabbitmq.com/rabbitmq-server/ubuntu/noble noble InRelease
```

Kuzatildi: birinchi urinishda ombor faylini hujjat sahifasidan kesib olishda unga qo'shimcha qatorlar tushib qolgan edi. `apt` butunlay ishlamay qoldi: `E: Malformed line 10 in source list /etc/apt/sources.list.d/rabbitmq.list (type)`. Ombor faylini qo'shgandan keyin darhol `apt-get update` qilish — xato shu zahoti ko'rinadi.

### Endi qaysi versiya

```text vps
$ apt-cache policy rabbitmq-server erlang-base | grep -E '^[a-z]|Candidate'
rabbitmq-server:
  Candidate: 4.4.0-1
erlang-base:
  Candidate: 1:27.3.4.19-1
```

RabbitMQ **4.4.0**, Erlang **27.3.4.19** — Team RabbitMQ omboridan (pinning bilan).

### O'rnatish

```text vps
$ DEBIAN_FRONTEND=noninteractive apt-get install -y -q erlang-base erlang-asn1 erlang-crypto erlang-eldap erlang-ftp erlang-inets erlang-mnesia erlang-os-mon erlang-parsetools erlang-public-key erlang-runtime-tools erlang-snmp erlang-ssl erlang-syntax-tools erlang-tftp erlang-tools erlang-xmerl 2>&1 | grep -cE '^Setting up erlang' | sed 's/^/o.rnatilgan erlang paketlari: /'
o.rnatilgan erlang paketlari: 17
$ DEBIAN_FRONTEND=noninteractive apt-get install -y -q rabbitmq-server --fix-missing 2>&1 | grep -E '^Setting up rabbitmq-server'; systemctl is-active rabbitmq-server; systemctl is-enabled rabbitmq-server
Setting up rabbitmq-server (4.4.0-1) ...
active
enabled
```

RQ ro'yxatidagi 17 ta Erlang paketi, keyin `rabbitmq-server`. Servis darhol ishga tushdi va yoqilgan (`enabled`).

### Servis va holat

```text vps
$ rabbitmqctl version; rabbitmq-diagnostics -q erlang_version
4.4.0
Erlang/OTP 27.3.4.19
$ rabbitmq-diagnostics ping
Will ping rabbit@lab. This only checks if the OS process is running and registered with epmd. Timeout: 60000 ms.
Ping succeeded
$ systemctl status rabbitmq-server --no-pager | grep -E 'Loaded:|Active:|Main PID:|Status:' | sed -E 's/since .*;/since …;/; s/[0-9]+ \(beam/… (beam/'
     Loaded: loaded (/usr/lib/systemd/system/rabbitmq-server.service; enabled; preset: enabled)
     Active: active (running) since …; 1 day 2h ago
   Main PID: … (beam.smp)
$ journalctl -u rabbitmq-server --no-pager -o cat | grep -E 'RabbitMQ [0-9]|Logs:|Starting broker' | head -3
  ##  ##      RabbitMQ 4.4.0
  Logs: /var/log/rabbitmq/rabbit@lab.log
  Starting broker... completed with 0 plugins.
$ ls /var/log/rabbitmq/; rabbitmq-diagnostics -q status | grep -E 'RabbitMQ version|Erlang configuration|Total memory used|Memory high watermark setting|Free bytes|Low free disk' | head -6
rabbit@lab.log
RabbitMQ version: 4.4.0
Erlang configuration: Erlang/OTP 27 [erts-15.2.7.14] [source] [64-bit] [smp:240:1] [ds:240:1:10] [async-threads:1] [jit:ns]
Total memory used: 0.1818 gb
Memory high watermark setting: 0.6 of available memory, computed to: 1.1284 gb
Low free disk space watermark: 0.05 gb
```

- `rabbitmq-diagnostics ping` — tugun (`rabbit@lab`) ishlayapti va `epmd` da ro'yxatdan o'tgan.
- Jurnal: versiya, log fayli (`/var/log/rabbitmq/rabbit@lab.log`), "0 plugins" — management plagini hali yoqilmagan (4-bob).
- Xotira chegarasi — mavjud xotiraning 0.6 qismi (30-bob). Kuzatildi: `smp:240:1` — Erlang 240 ta scheduler ko'rdi, lekin bittasi faol (VPS'da bitta protsessor).

### Portlar va foydalanuvchilar

```text vps
$ rabbitmq-diagnostics -q listeners
Interface: [::], port: 25672, protocol: clustering, purpose: inter-node and CLI tool communication
Interface: [::], port: 5672, protocol: amqp, purpose: AMQP 0-9-1 and AMQP 1.0
$ ss -ltnp | grep -E 'beam|epmd' | awk '{print $4, $NF}' | sed -E 's/pid=[0-9]+/pid=…/g; s/,fd=[0-9]+//g'
0.0.0.0:25672 users:(("beam.smp",pid=…))
*:5672 users:(("beam.smp",pid=…))
*:4369 users:(("epmd",pid=…),("systemd",pid=…))
$ ufw status | grep -cE '^(5672|25672|4369)' | sed 's/^/ufw ruxsat qatorlari (5672, 25672, 4369): /'
ufw ruxsat qatorlari (5672, 25672, 4369): 0
$ rabbitmqctl -q list_users
user	tags
guest	[administrator]
```

- AMQP — 5672, tugunlararo aloqa — 25672, `epmd` — 4369. Hammasi **barcha interfeyslarda** (`*`, `0.0.0.0`) tinglaydi.
- ufw'da ular uchun ruxsat **yo'q**, standart siyosat — kiruvchi ulanishlarni rad etish.
- Yagona foydalanuvchi — `guest` (`administrator`).

Tashqaridan (kompyuterdan) — AMQP protokol sarlavhasini yuborib, broker javob berishini tekshiradigan kichik skript:

```python
# AMQP 0-9-1 protokol sarlavhasini yuborib, broker javob berishini tekshiradi
import socket, sys
host, port = sys.argv[1], int(sys.argv[2])
try:
    s = socket.create_connection((host, port), timeout=5)
    s.sendall(b"AMQP\x00\x00\x09\x01")
    s.settimeout(5)
    d = s.recv(64)
    print(f"{port}: javob {len(d)} bayt" + (" — AMQP Connection.Start" if d[:1] == b"\x01" else ""))
except OSError as e:
    print(f"{port}: javob yo'q ({type(e).__name__})")
```

```text tashqi
$ python3 amqp_tekshir.py 203.0.113.10 5672
5672: javob yo'q (TimeoutError)
```

```text vps
$ python3 /root/amqp_tekshir.py 127.0.0.1 5672; rm /root/amqp_tekshir.py
5672: javob 64 bayt — AMQP Connection.Start
```

Tashqaridan javob yo'q — ufw portni yopib turibdi. Serverning o'zida broker darhol javob beradi (`Connection.Start` — AMQP'da broker yuboradigan birinchi xabar). Kuzatildi: kompyuterdagi `nc -z` VPS'dagi istalgan portni, hatto hech narsa tinglamaydiganini ham "ochiq" deb ko'rsatgan (lokal tarmoq ulanishni o'zi qabul qiladi). Shuning uchun tekshiruv protokol javobi bilan qilindi.

## Variantlar

| Usul | Qachon | Kamchiligi |
| --- | --- | --- |
| Team RabbitMQ apt omborlari | RQ tavsiyasi | Uchinchi tomon ombori |
| Launchpad PPA (Erlang) | `arm64` uchun (RQ) | — |
| Ubuntu paketi (`apt install rabbitmq-server`) | — | 4.0.5, qo'llab-quvvatlanmaydi (RQ) |
| `dpkg -i` bilan qo'lda | — | RQ: qat'iyan tavsiya etilmaydi |
| Docker image | Sinov, konteyner muhiti | Docker kitobi |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Ubuntu omboridan o'rnatish | Eski, qo'llab-quvvatlanmaydi, yangilab bo'lmasligi mumkin (RQ) | Team RabbitMQ omborlari |
| Erlang'ni tekshirmaslik | Mos kelmasa RabbitMQ ishlamaydi | `which-erlang` jadvali, pinning |
| 25672, 4369 ni ochiq tarmoqqa | RQ: kerak bo'lmasa chiqarilmasin | Firewall yopiq |
| `guest` bilan tashqaridan ulanishga urinish | Faqat localhost (RQ) | Alohida foydalanuvchi (26-bob) |
| Ombor faylini qo'shib, `apt update` qilmaslik | Xato keyinroq, boshqa o'rnatishda chiqadi (sinovda) | Darhol `apt-get update` |
| Portni `nc` bilan tekshirish | Oraliq tarmoq aldashi mumkin (sinovda) | Protokol javobi bilan |

## Amaliyot

1. Nega Ubuntu'ning `rabbitmq-server` paketi ishlatilmaydi?
2. RabbitMQ 4.4.0 qaysi Erlang versiyalari bilan ishlaydi?
3. Ubuntu 26.04 uchun qaysi ombor (distributiv nomi) ishlatiladi?
4. 5672, 25672 va 4369 portlari nima uchun?
5. `guest` foydalanuvchisi bilan qayerdan ulanish mumkin?
6. Sinovda tashqaridan 5672-port tekshirilganda nima chiqdi va nega?

<details>
<summary>Javoblar</summary>

1. Eski (4.0.5), hamjamiyat qo'llab-quvvatlamaydi, to'g'ridan-to'g'ri yangilab bo'lmasligi mumkin.
2. 27, 28, 29.
3. `noble` (Ubuntu 24.04) omborlari.
4. AMQP klientlari, tugunlararo va CLI aloqasi, `epmd` (tugunlarni topish).
5. Faqat localhost'dan.
6. Javob yo'q — ufw kiruvchi ulanishni rad etadi (5672 uchun ruxsat yo'q).

</details>

## Rasmiy hujjat

- [RQ: Installing on Debian and Ubuntu](https://www.rabbitmq.com/docs/install-debian)
- [RQ: Erlang Version Requirements](https://www.rabbitmq.com/docs/which-erlang)
- [RQ: Networking](https://www.rabbitmq.com/docs/networking) — Port Access
- [RQ: Release Information](https://www.rabbitmq.com/release-information)
