# 40 — IP, interfeys va marshrut

[← Oldingi: Servisni cheklash](39-servisni-cheklash.md) · [Mundarija](README.md) · [Keyingi: Tarmoqni kim boshqaradi →](41-tarmoqni-kim-boshqaradi.md)

## Tushuncha

Server tarmoqqa uch narsa orqali ulanadi:

| Tushuncha | Nima | Buyruq |
| --- | --- | --- |
| Interfeys (interface) | Tarmoqqa ulanish nuqtasi: tarmoq kartasi yoki virtual qurilma (masalan, `lo`) | `ip link` |
| IP manzil | Interfeysga berilgan manzil: shu orqali boshqa kompyuterlar serverni topadi | `ip addr` |
| Marshrut (route) | Paket qaysi interfeys orqali va qaysi shlyuzga (gateway) yuborilishini belgilaydigan qoida | `ip route` |

Ubuntu Server hujjati asosiy atamalarni shunday ta'riflaydi:

- **IP manzil** — tarmoqdagi qurilmaning noyob identifikatori. IPv4 — 0–255 oralig'idagi to'rtta son, nuqta bilan ajratilgan (32 bit). IPv6 — ikki nuqta bilan ajratilgan sakkizta o'n oltilik guruh (128 bit).
- **Tarmoq niqobi (netmask)** — manzilning qaysi qismi tarmoqqa tegishli ekanini ko'rsatadi. CIDR yozuvida `/24` = `255.255.255.0`: dastlabki 24 bit — tarmoq.
- **Shlyuz (gateway)** — boshqa tarmoqdagi manzilga paketni shu orqali yuboriladigan manzil.

Debian Reference (5.5.1) tarmoqni quyi darajada ko'rish va sozlash uchun iproute2 to'plamidagi `ip` buyrug'ini ishlatishni aytadi. Eski net-tools buyruqlari unda "eskirgan" deb belgilangan:

| Eskirgan (net-tools) | Yangi (iproute2) | Nima uchun |
| --- | --- | --- |
| `ifconfig` | `ip addr` | interfeysdagi manzillar |
| `route` | `ip route` | marshrutlar jadvali |
| `arp` | `ip neigh` | qo'shni qurilmalar (ARP/NDISC keshi) |

DR 5.5.2 ga ko'ra `ip addr show`, `ip route show` va `ip neigh` sozlamani o'zgartirmaydi, ularni xavfsiz ishlatsa bo'ladi.

> **VPS chiqishlari haqida.** Sinov VPS'ining ochiq IPv4 manzili repozitoriyga yozilmaydi. Chiqishlarda u hujjatlar uchun ajratilgan `203.0.113.10` manzili bilan almashtirilgan (RFC 5737). Qolgan hamma narsa — haqiqiy chiqish.

## Interfeyslar: `ip link`

Trenajorda tarmoq yo'q, faqat `lo` bor:

```text
$ ip -br link
lo               UNKNOWN        00:00:00:00:00:00 <LOOPBACK,UP,LOWER_UP> 
```

VPS'da:

```text vps
$ ip -br link
lo               UNKNOWN        00:00:00:00:00:00 <LOOPBACK,UP,LOWER_UP> 
ens3             UP             52:54:00:15:dd:4b <BROADCAST,MULTICAST,UP,LOWER_UP> 
```

- `-br` (brief) — har interfeys bitta qatorda.
- `lo` — loopback: kompyuterning o'zi bilan gaplashish uchun virtual interfeys.
- `ens3` — tarmoq kartasi. Debian Reference (5.1.2): systemd interfeyslarga "oldindan aytsa bo'ladigan" nomlar beradi (Predictable Network Interface Names), masalan `enp0s25`; eski `eth0` o'rniga.
- `52:54:00:15:dd:4b` — kartaning MAC manzili.
- netdevice(7) bo'yicha: `UP` — interfeys yoqilgan, `LOWER_UP` — drayver fizik ulanish bor deb xabar qilyapti.

## IP manzillar: `ip addr`

```text
$ ip -br addr
lo               UNKNOWN        127.0.0.1/8 ::1/128 
$ ip addr show dev lo
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host noprefixroute 
       valid_lft forever preferred_lft forever
```

`lo` da ikkita manzil: IPv4 `127.0.0.1/8` va IPv6 `::1/128`. `scope host` — bu manzil faqat shu kompyuter ichida amal qiladi.

VPS'da:

```text vps
$ ip -br addr
lo               UNKNOWN        127.0.0.1/8 ::1/128 
ens3             UP             203.0.113.10/32 fe80::5054:ff:fe15:dd4b/64 
$ ip addr show dev ens3
2: ens3: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 52:54:00:15:dd:4b brd ff:ff:ff:ff:ff:ff
    altname enp0s3
    altname enx52540015dd4b
    inet 203.0.113.10/32 brd 203.0.113.10 scope global ens3
       valid_lft forever preferred_lft forever
    inet6 fe80::5054:ff:fe15:dd4b/64 scope link proto kernel_ll 
       valid_lft forever preferred_lft forever
```

- `inet` — IPv4 manzil, `scope global` — internetda amal qiladi.
- `/32` — 32 bitning hammasi tarmoq qismi, ya'ni "tarmoq" bitta manzildan iborat. Provayder serverga faqat bitta manzil bergan.
- `altname` — interfeysning muqobil nomlari.
- `mtu 1500` — bitta paketning eng katta hajmi (bayt).

Debian Reference (5.1.3) ichki (LAN) tarmoqlar uchun ajratilgan manzillarni sanaydi. Ular internetda ishlatilmaydi:

| Sinf | Oraliq | CIDR |
| --- | --- | --- |
| A | `10.x.x.x` | `/8` |
| B | `172.16.x.x` — `172.31.x.x` | `/16` |
| C | `192.168.0.x` — `192.168.255.x` | `/24` |

## IPv6

- `::1` — IPv6 loopback, `127.0.0.1` ning juftligi (ipv6(7)).
- `fe80::...` — link-local manzil: faqat bitta tarmoq segmenti ichida ishlaydi, `scope link` shuni bildiradi. RFC 4291 bo'yicha `fe80::/10` link-local manzillar uchun ajratilgan.

Bizning VPS'da global IPv6 manzil yo'q, faqat link-local. Shuning uchun IPv6 marshrutlar jadvalida internetga yo'l yo'q:

```text vps
$ ip -6 route
fe80::/64 dev ens3 proto kernel metric 256 pref medium
```

## Marshrutlar: `ip route`

Trenajorda marshrut yo'q — tarmoq ham yo'q:

```text
$ ip route
```

VPS'da:

```text vps
$ ip route
default via 10.0.0.1 dev ens3 onlink 
$ ip route get 1.1.1.1
1.1.1.1 via 10.0.0.1 dev ens3 src 203.0.113.10 uid 0 
    cache 
$ ping -c 2 1.1.1.1
PING 1.1.1.1 (1.1.1.1) 56(84) bytes of data.
64 bytes from 1.1.1.1: icmp_seq=1 ttl=56 time=1.56 ms
64 bytes from 1.1.1.1: icmp_seq=2 ttl=56 time=1.74 ms

--- 1.1.1.1 ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 1002ms
rtt min/avg/max/mdev = 1.558/1.646/1.735/0.088 ms
$ ip neigh
10.0.0.1 dev ens3 lladdr 02:00:00:00:00:01 REACHABLE 
```

- `default` — standart marshrut: boshqa qoida mos kelmagan har qanday manzil `10.0.0.1` shlyuzi orqali `ens3` dan chiqadi.
- `onlink` — ip-route(8): shlyuz interfeysning prefiksiga to'g'ri kelmasa ham, bevosita shu kanalga ulangan deb hisoblash. Bizda manzil `/32`, shlyuz `10.0.0.1` esa unga kirmaydi — shuning uchun `onlink` kerak.
- `ip route get` — aniq bir manzilga paket qaysi yo'l bilan ketishini ko'rsatadi: shlyuz, interfeys va jo'natuvchi manzil (`src`).
- `ip neigh` — shlyuzning MAC manzili topilgan (`REACHABLE`).

## `127.0.0.1`, `localhost` va `0.0.0.0`

Server dasturi (veb-server, baza) ulanishlarni qaysi manzilda kutishini o'zi tanlaydi. ip(7) bo'yicha:

- `0.0.0.0` (`INADDR_ANY`) da kutgan soket kompyuterning **barcha** manzillariga ulanadi;
- `127.0.0.1` (`INADDR_LOOPBACK`) — faqat loopback orqali, ya'ni faqat shu kompyuterning o'zidan.

IPv6 da ularning juftligi — `::` va `::1` (ipv6(7)). `localhost` nomi esa `/etc/hosts` orqali `127.0.0.1` va `::1` ga aylanadi (42-bob).

Trenajorda sinaymiz. `lo` ga qo'shimcha manzil (`192.0.2.10`, hujjatlar uchun ajratilgan) qo'shamiz va ikkita servisni ishga tushiramiz: biri `127.0.0.1:8081` da, ikkinchisi `0.0.0.0:8082` da (32-bobdagi `systemd-socket-activate`):

```text
$ ip addr add 192.0.2.10/32 dev lo
$ systemd-socket-activate -l 127.0.0.1:8081 -a --inetd cat 2>/dev/null &
[1] 193
$ systemd-socket-activate -l 0.0.0.0:8082 -a --inetd cat 2>/dev/null &
[2] 194
$ sleep 1
$ ss -tln
State      Recv-Q     Send-Q         Local Address:Port           Peer Address:Port     Process     
LISTEN     0          0                    0.0.0.0:8082                0.0.0.0:*                    
LISTEN     0          0                  127.0.0.1:8081                0.0.0.0:*                    
$ echo salom > /dev/tcp/192.0.2.10/8082 && echo ulandi
ulandi
$ echo salom > /dev/tcp/192.0.2.10/8081 && echo ulandi
-bash: connect: Connection refused
-bash: /dev/tcp/192.0.2.10/8081: Connection refused
```

`0.0.0.0` dagi servisga kompyuterning boshqa manzili orqali ham ulanib bo'ldi, `127.0.0.1` dagisiga esa yo'q. Haqiqiy serverda "boshqa manzil" — internetdagi ochiq IP. Shuning uchun:

- tashqaridan kirilishi kerak bo'lgan servis (veb-server, SSH) `0.0.0.0` (yoki aniq ochiq IP) da kutadi;
- ichki servis (baza, Redis) `127.0.0.1` da kutishi kerak — shunda u internetga umuman chiqmaydi.

<div data-animatsiya="qadamli" data-nom="bind"></div>

VPS'da xuddi shu ko'rinish:

```text vps
$ ss -tln
State  Recv-Q Send-Q Local Address:Port Peer Address:Port
LISTEN 0      4096   127.0.0.53%lo:53        0.0.0.0:*   
LISTEN 0      4096      127.0.0.54:53        0.0.0.0:*   
LISTEN 0      4096         0.0.0.0:22        0.0.0.0:*   
LISTEN 0      4096            [::]:22           [::]:*   
```

SSH (`22`) barcha IPv4 va IPv6 manzillarda kutadi. `127.0.0.53` va `127.0.0.54` dagi `53`-port — systemd-resolved'ning ichki DNS xizmati (42-bob), u tashqaridan ko'rinmaydi.

## Debian va Ubuntu

| | Debian 12 (trenajor) | Ubuntu 26.04 (VPS) |
| --- | --- | --- |
| Interfeyslar | faqat `lo` (trenajorda tarmoq yo'q) | `lo`, `ens3` |
| IPv4 | `127.0.0.1/8` | `127.0.0.1/8` va bitta ochiq manzil (`/32`) |
| IPv6 | `::1/128` | `::1/128`, link-local `fe80::` |
| Marshrut | yo'q | `default via 10.0.0.1 ... onlink` |

`ip` buyruqlari ikkalasida bir xil. Doimiy tarmoq sozlamasi qayerda saqlanishi tizimga bog'liq — 41-bobda.

## Tipik xatolar

**1. Ilova faqat `127.0.0.1` da kutadi, tashqaridan "Connection refused".**
Bu ilovaning standart sozlamasi bo'lishi mumkin (ko'p dev-serverlar shunday).
To'g'risi: tashqaridan kerak bo'lsa — `0.0.0.0` yoki aniq manzil; `ss -tln` bilan tekshirish.

**2. Ichki servis `0.0.0.0` da kutadi.**
Baza yoki Redis internetga ochilib qoladi.
To'g'risi: `127.0.0.1`; firewall — ikkinchi himoya qatlami ("Server xavfsizligi" kitobi).

**3. `ifconfig` yoki `route` topilmadi.**
net-tools eskirgan va o'rnatilmagan bo'lishi mumkin.
To'g'risi: `ip addr`, `ip route` (DR 5.5.1).

**4. `ip addr add` bilan qo'shilgan manzil reboot'dan keyin yo'qoldi.**
`ip` ishlayotgan yadro holatini o'zgartiradi, doimiy sozlamani emas.
To'g'risi: doimiy sozlama tarmoq boshqaruvchisida (41-bob).

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=40-ip)** "IP va manzil": `lo` ga manzil qo'shasiz, bitta servisni `127.0.0.1` da, ikkinchisini `0.0.0.0` da ishga tushirib, qaysi biriga qaysi manzil orqali ulanish mumkinligini ko'rasiz.

Savollar:

1. Serverning IP manzillarini qaysi buyruq ko'rsatadi?
2. `ip route` da `default via 10.0.0.1 dev ens3` nimani anglatadi?
3. `192.168.1.0/24` tarmog'ida nechta manzil bor?
4. PostgreSQL `0.0.0.0:5432` da kutyapti. Bu nima uchun xavfli bo'lishi mumkin?
5. `fe80::` bilan boshlanadigan manzil bilan internetga chiqsa bo'ladimi?

<details>
<summary>Javoblar</summary>

1. `ip addr` (yoki qisqa ko'rinishda `ip -br addr`).
2. Boshqa qoida mos kelmagan har qanday manzilga paketlar `ens3` orqali `10.0.0.1` shlyuziga yuboriladi.
3. 256 ta (oxirgi 8 bit: 0–255).
4. U serverning barcha manzillarida, jumladan ochiq IP'da ham ulanish kutadi. Ichki baza `127.0.0.1` da kutishi kerak.
5. Yo'q: bu link-local manzil, faqat bitta tarmoq segmenti ichida ishlaydi.

</details>

## Rasmiy hujjat

- [Ubuntu Server: Networking key concepts](https://ubuntu.com/server/docs/explanation/networking/networking-key-concepts/) — IP manzil, netmask, shlyuz, marshrutlash
- [Debian Reference 5.1](https://www.debian.org/doc/manuals/debian-reference/ch05.en.html#_the_basic_network_infrastructure) — interfeys nomlari, LAN manzillari
- [Debian Reference 5.5](https://www.debian.org/doc/manuals/debian-reference/ch05.en.html#_iproute2_commands) — iproute2 buyruqlari, xavfsiz buyruqlar
- [ip(8)](https://man7.org/linux/man-pages/man8/ip.8.html), [ip-route(8)](https://man7.org/linux/man-pages/man8/ip-route.8.html) — `onlink`
- [ip(7)](https://man7.org/linux/man-pages/man7/ip.7.html), [ipv6(7)](https://man7.org/linux/man-pages/man7/ipv6.7.html) — `INADDR_ANY`, `INADDR_LOOPBACK`, `::1`
- [netdevice(7)](https://man7.org/linux/man-pages/man7/netdevice.7.html) — `UP`, `LOWER_UP`
- [RFC 4291](https://www.rfc-editor.org/rfc/rfc4291) — IPv6 manzillari (link-local), [RFC 5737](https://www.rfc-editor.org/rfc/rfc5737) — hujjatlar uchun IPv4 manzillari
- Trenajorda: `man ip`, `man ip-route`, `man 7 ip`
