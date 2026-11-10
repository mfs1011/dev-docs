# 04 — Boshqaruv vositalari

[Mundarija](README.md)

## Tushuncha

RabbitMQ'ni boshqarishning uch yo'li bor: server bilan birga keladigan **CLI vositalari**, brauzerdagi **boshqaruv paneli** (management UI) va uning **HTTP API**'si ustida ishlaydigan `rabbitmqadmin`.

### CLI vositalari (RQ: CLI)

| Vosita | Nima uchun |
| --- | --- |
| `rabbitmqctl` | Servisni boshqarish va umumiy operator vazifalari (foydalanuvchilar, ruxsatlar, vhost'lar …) |
| `rabbitmq-diagnostics` | Diagnostika, monitoring va sog'liq tekshiruvlari |
| `rabbitmq-plugins` | Plaginlarni yoqish/o'chirish |
| `rabbitmq-queues` | Navbatlarga (ayniqsa quorum) xizmat ko'rsatish |
| `rabbitmq-streams` | Stream'larga xizmat ko'rsatish |
| `rabbitmq-upgrade` | Yangilash bilan bog'liq vazifalar |

RQ: `rabbitmqctl` tugunni **to'liq** boshqaradi (foydalanuvchilar, ruxsatlar, ma'lumotni o'chiradigan amallar) — shuning uchun odatda faqat administratorga ochiq. CLI vositalari tugunga Erlang distribution porti (25672) orqali ulanadi va **Erlang cookie** bilan autentifikatsiyadan o'tadi (`sudo` bilan ishlatiladi).

### Management plagini (RQ: Management Plugin)

- RabbitMQ bilan birga keladi, lekin **yoqish kerak**: `rabbitmq-plugins enable rabbitmq_management`; tugunni qayta ishga tushirish shart emas.
- Panel va HTTP API — `http://hostname:15672/`. Bu port AMQP, MQTT va STOMP ulanishlari uchun **emas**.
- Kirish — autentifikatsiya va foydalanuvchi **teglari** bilan (`management`, `monitoring`, `administrator` …); yangi foydalanuvchida teg yo'q — panelga kira olmaydi (26-bob).

### `rabbitmqadmin` v2 (RQ: rabbitmqadmin v2)

- HTTP API ustida ishlaydigan CLI; faqat HTTP API porti ochiq bo'lishi kerak.
- RabbitMQ'dan **alohida** loyiha, o'z reliz sikli bilan; tayyor binar fayl sifatida GitHub relizlarida (Linux x86-64/aarch64, macOS, Windows) yoki Homebrew'da.
- RabbitMQ 4.x, 3.13.x, 3.12.x bilan ishlaydi.
- Odatda jadval chiqaradi; skriptlar uchun — `--non-interactive` (global bayroq, buyruqdan **oldin**).
- Ulanish sozlamalari — `$HOME/.rabbitmqadmin.conf` yoki `--host`, `--username` va boshqa bayroqlar.

## Ko'rib chiqamiz

VPS'da (RabbitMQ 4.4.0).

### Management plaginini yoqish

```text vps
$ rabbitmq-plugins list -e
Listing plugins with pattern ".*" ...
 Configured: E = explicitly enabled; e = implicitly enabled
 | Status: * = running on rabbit@lab
 |/
$ rabbitmq-plugins enable rabbitmq_management 2>&1 | grep -E 'enabling|started|^  rabbitmq_management$|set of'
  rabbitmq_management
  rabbitmq_management
started 3 plugins.
$ sleep 3; rabbitmq-diagnostics -q listeners
Interface: [::], port: 25672, protocol: clustering, purpose: inter-node and CLI tool communication
Interface: [::], port: 5672, protocol: amqp, purpose: AMQP 0-9-1 and AMQP 1.0
Interface: [::], port: 15672, protocol: http, purpose: HTTP API
```

Avval hech qanday plagin yoqilmagan edi. Yoqilgach (3 ta plagin — management va u bog'liq bo'lganlar) yangi tinglovchi paydo bo'ldi: 15672, HTTP API. Qayta ishga tushirish kerak bo'lmadi.

### HTTP API

```text vps
$ ss -ltn | grep ':15672 ' | awk '{print $4}'; ufw status | grep -c '^15672'
*:15672
0
$ curl -s -u guest:guest http://127.0.0.1:15672/api/overview | python3 -c "import json,sys; d=json.load(sys.stdin); print('rabbitmq_version:', d['rabbitmq_version'], '| erlang:', d['erlang_version'], '| node:', d['node'])"
rabbitmq_version: 4.4.0 | erlang: 27.3.4.19 | node: rabbit@lab
$ curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:15672/api/overview
401
```

- 15672 ham barcha interfeyslarda tinglaydi; ufw'da unga ruxsat yo'q.
- `guest` bilan (localhost'dan) — API javob berdi: versiya, Erlang, tugun nomi.
- Login/parolsiz — `401` (autentifikatsiya kerak).

Tashqaridan (kompyuterdan):

```text tashqi
$ curl -s -m 5 -o /dev/null -w "%{http_code}\n" http://203.0.113.10:15672/api/overview; echo "curl kodi: $?"
000
curl kodi: 28
```

Javob yo'q (`curl` kodi 28 — vaqt tugadi): ufw yopib turibdi. Panelni kompyuterdan ochish kerak bo'lsa, portni tashqariga ochmasdan **SSH tunnel** bilan ochish mumkin (`ssh -L 15672:127.0.0.1:15672 …`, keyin `http://localhost:15672/`).

### `rabbitmqadmin` v2

Rasmiy GitHub relizidan, SHA256 tekshiruvi bilan:

```text vps
$ cd /tmp && V=2.35.0; F=rabbitmqadmin-$V-x86_64-unknown-linux-gnu.tar.gz; curl -sSfLO https://github.com/rabbitmq/rabbitmqadmin-ng/releases/download/v$V/$F && curl -sSfLO https://github.com/rabbitmq/rabbitmqadmin-ng/releases/download/v$V/$F.sha256 && sha256sum -c $F.sha256 && tar -xzf $F && install -m 755 $(tar -tzf $F | grep -m1 'rabbitmqadmin$') /usr/local/bin/rabbitmqadmin && rm -f $F $F.sha256 && rabbitmqadmin --version
rabbitmqadmin-2.35.0-x86_64-unknown-linux-gnu.tar.gz: OK
rabbitmqadmin 2.35.0
```

```text vps
$ rabbitmqadmin --non-interactive show overview | grep -E '^(Product version|Erlang version|Connected node|Queue count|Connection count|Exchange count)'
Product version                                                    4.4.0
Erlang version                                                     27.3.4.19
$ rabbitmqadmin queues declare --name "admin-sinov" --type "quorum" --durable true
$ rabbitmqadmin --non-interactive queues list | awk '{print $1, $2, $3, $4}'
admin-sinov / quorum true
hello / quorum true
$ rabbitmqadmin queues delete --name "admin-sinov"; rabbitmqadmin --non-interactive queues list | awk '{print $1, $2, $3}'
hello / quorum
```

- `show overview` — tugun ma'lumoti (versiya, Erlang).
- Navbat yaratildi va o'chirildi — HTTP API orqali; `hello` — 3-bobdagi navbat.
- Kuzatildi: sozlama faylisiz `rabbitmqadmin` `localhost:15672` ga `guest` bilan ulandi — shu serverning o'zida standart qiymatlar yetarli.

### Sog'liq tekshiruvlari

```text vps
$ rabbitmq-diagnostics -q check_running && rabbitmq-diagnostics -q check_port_connectivity && echo "sog'liq tekshiruvlari: OK"
RabbitMQ on node rabbit@lab is fully booted and running
Will connect to lab:25672
Will connect to lab:5672
Will connect to lab:15672
Successfully connected to ports 5672, 15672, 25672 on node rabbit@lab (using node hostname resolution)
sog'liq tekshiruvlari: OK
```

`check_running` — tugun to'liq ishga tushgan; `check_port_connectivity` — tinglovchi portlarga ulanish mumkin. Ikkalasi ham xato bo'lsa nol bo'lmagan kod qaytaradi — monitoring skriptlari uchun qulay (31-bob).

## Variantlar

| Vosita | Qayerdan ishlaydi | Qachon |
| --- | --- | --- |
| `rabbitmqctl`, `rabbitmq-diagnostics` | Serverda (Erlang cookie) | Administrator vazifalari, diagnostika |
| Boshqaruv paneli | Brauzer, 15672 | Ko'rish, qo'lda tekshirish |
| `rabbitmqadmin` v2 | HTTP API bor istalgan joydan | Skriptlar, avtomatlashtirish |
| HTTP API (`curl`) | HTTP API bor istalgan joydan | O'z vositalari, monitoring |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Panel 15672 ni ochiq Internetga chiqarish | Login sahifasi hammaga ochiq | Firewall, SSH tunnel yoki ishonchli tarmoq |
| `guest` bilan panelga tashqaridan kirishga urinish | `guest` faqat localhost (2-bob) | Alohida foydalanuvchi, teg bilan (26-bob) |
| 15672 ga AMQP klientini ulash | Bu port faqat HTTP (RQ) | 5672 |
| `rabbitmqadmin` jadvalini skriptda tahlil qilish | Chegaralar va bo'shliqlar (RQ) | `--non-interactive` |
| `rabbitmqctl` ni hamma foydalanuvchiga berish | Tugunni to'liq boshqaradi (RQ) | Faqat administratorlar; boshqalarga — teglar |

## Amaliyot

1. `rabbitmqctl` va `rabbitmq-diagnostics` farqi?
2. Management plaginini qanday yoqasiz, qayta ishga tushirish kerakmi?
3. 15672-port nima uchun?
4. `rabbitmqadmin` v2 nima orqali ishlaydi va qayerdan olinadi?
5. Panelni portni ochmasdan kompyuterdan qanday ko'rish mumkin?

<details>
<summary>Javoblar</summary>

1. `rabbitmqctl` — boshqarish va operator vazifalari; `rabbitmq-diagnostics` — diagnostika va sog'liq tekshiruvlari.
2. `rabbitmq-plugins enable rabbitmq_management`; qayta ishga tushirish shart emas.
3. Boshqaruv paneli va HTTP API (AMQP uchun emas).
4. HTTP API orqali; GitHub relizlaridan binar fayl (yoki Homebrew).
5. SSH tunnel: `ssh -L 15672:127.0.0.1:15672 …`.

</details>

## Rasmiy hujjat

- [RQ: Command Line Tools](https://www.rabbitmq.com/docs/cli)
- [RQ: Management Plugin](https://www.rabbitmq.com/docs/management)
- [RQ: rabbitmqadmin v2](https://www.rabbitmq.com/docs/management-cli) · [GitHub relizlari](https://github.com/rabbitmq/rabbitmqadmin-ng/releases)
