# 47 — SSH tunnel

[← Oldingi: Fayl ko'chirish](46-fayl-kochirish.md) · [Mundarija](README.md) · [Keyingi: Birinchi skript →](48-birinchi-skript.md)

## Tushuncha

Serverdagi ba'zi servislar faqat `127.0.0.1` da kutadi: baza, Redis, boshqaruv paneli. To'g'ri — ular internetga ochiq bo'lmasligi kerak (40-bob). Lekin ba'zan ularga o'z kompyuteringizdan ulanish kerak bo'ladi. Bunday paytda SSH **tunnel** ishlatiladi: ulanish shifrlangan SSH kanali ichidan o'tadi.

| Turi | Kalit | Nima qiladi |
| --- | --- | --- |
| Lokal (local forwarding) | `-L` | Noutbukdagi port → server orqali → server tomondagi manzil |
| Teskari (remote forwarding) | `-R` | Serverdagi port → SSH orqali → noutbuk tomondagi manzil |
| Oraliq server (jump host) | `-J`, `ProxyJump` | Avval bitta serverga, u orqali ichki serverga ulanish |

Debian Reference (6.3.7) `-L` ni SMTP va POP3 servislariga xavfsiz ulanish uchun ko'rsatadi va serverda `AllowTcpForwarding yes` bo'lishi kerakligini aytadi. Bizning VPS'da u yoqilgan (`sshd -T` → `allowtcpforwarding yes`).

> **Chiqishlar haqida.** Trenajorda SSH yo'q. Bob noutbuk (macOS) va VPS'da sinalgan, VPS manzili `203.0.113.10` bilan yashirilgan. Ulanish 45–46-boblardagi kabi alohida `config` fayli bilan.

```text tashqi
$ cat config
Host lab
    HostName 203.0.113.10
    User root
    IdentityFile ~/.ssh/docs_web_lab
    IdentitiesOnly yes

Host ichki
    HostName 127.0.0.1
    User root
    ProxyJump lab
    IdentityFile ~/.ssh/docs_web_lab
    IdentitiesOnly yes
    UserKnownHostsFile ./known_hosts_ichki
    StrictHostKeyChecking accept-new
```

## `-L`: serverdagi yopiq servisga ulanish

VPS'da faqat `127.0.0.1:8090` da kutadigan "ichki" servis ishga tushiramiz:

```text vps
$ mkdir -p /srv/ichki
$ echo 'ichki servis' > /srv/ichki/index.html
$ systemd-run --unit=ichki -p User=nobody python3 -m http.server 8090 --bind 127.0.0.1 --directory /srv/ichki
Running as unit: ichki.service; invocation ID: f9b245fa59044d3895ad443266da79a0
$ sleep 1
$ ss -tln | grep 8090
LISTEN 0      5          127.0.0.1:8090      0.0.0.0:*   
```

Tashqaridan unga yetib bo'lmaydi (servis `127.0.0.1` da, ustiga firewall ham yopiq — 43-bob). Tunnel orqali esa bo'ladi:

```text tashqi
$ curl -sS --max-time 5 http://203.0.113.10:8090/; echo "kod: $?"
curl: (28) Connection timed out after 5006 milliseconds
kod: 28
$ ssh -F config -f -N -L 9090:127.0.0.1:8090 lab
$ lsof -nP -iTCP:9090 -sTCP:LISTEN
COMMAND   PID USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
ssh     39786 mfsv    5u  IPv6 0xb93896751b1ac09f      0t0  TCP [::1]:9090 (LISTEN)
ssh     39786 mfsv    6u  IPv4 0xd60de3454a668c6d      0t0  TCP 127.0.0.1:9090 (LISTEN)
$ curl -s http://127.0.0.1:9090/
ichki servis
$ pkill -f 'ssh -F config -f -N -L 9090'
$ curl -sS http://127.0.0.1:9090/; echo "kod: $?"
curl: (7) Failed to connect to 127.0.0.1 port 9090 after 1 ms: Couldn't connect to server
kod: 7
```

ssh(1) bo'yicha:

- `-L 9090:127.0.0.1:8090` — mahalliy (mijoz) kompyuterdagi `9090`-portga kelgan ulanishlar server tomonidagi `127.0.0.1:8090` ga uzatiladi. `127.0.0.1` bu yerda **server tomondan** qaraladi, ya'ni serverning o'zi.
- `-N` — serverda buyruq bajarmaslik: faqat port uzatish uchun.
- `-f` — ssh fonga o'tadi va terminal bo'shaydi.

`lsof` ko'rsatyapti: noutbukda `9090` ni `ssh` jarayoni tinglayapti. Tunnel yopilgach (`pkill`), port ham yopildi.

<div data-animatsiya="qadamli" data-nom="tunnel"></div>

Amalda shu usul bilan serverdagi bazaga ulaniladi: masalan, `ssh -L 5433:127.0.0.1:5432 server`, keyin mahalliy dastur `127.0.0.1:5433` ga ulanadi. Bazaning porti internetga ochilmaydi.

## `-R`: noutbukdagi servisni serverga ko'rsatish

Teskari yo'nalish: serverdagi port noutbukdagi servisga olib boradi.

```text tashqi
$ mkdir -p noutbuk && echo 'noutbukdagi sahifa' > noutbuk/index.html
$ python3 -m http.server 7070 --bind 127.0.0.1 --directory noutbuk >/dev/null 2>&1 &
$ sleep 1
$ curl -s http://127.0.0.1:7070/
noutbukdagi sahifa
$ ssh -F config -f -N -R 7071:127.0.0.1:7070 lab
```

```text vps
$ sleep 1
$ ss -tln | grep 7071
LISTEN 0      128        127.0.0.1:7071      0.0.0.0:*   
LISTEN 0      128            [::1]:7071         [::]:*   
$ curl -s http://127.0.0.1:7071/
noutbukdagi sahifa
```

Serverda `7071` ochildi va undagi so'rov noutbukdagi sahifani qaytardi. Port faqat `127.0.0.1` va `::1` da: sshd_config(5) bo'yicha sshd standart holatda (`GatewayPorts no`) teskari uzatilgan portlarni loopback manziliga bog'laydi — boshqa kompyuterlar ularga ulana olmaydi.

```text tashqi
$ pkill -f 'ssh -F config -f -N -R 7071'
$ pkill -f 'http.server 7070'
```

```text vps
$ ss -tln | grep -c ':7071 '
0
```

## `ProxyJump`: oraliq server orqali

Katta tizimlarda ichki serverlar internetdan ko'rinmaydi, ularga faqat bitta "darvoza" server (jump host, bastion) orqali kiriladi. ssh_config(5): `ProxyJump` — ssh avval oraliq serverga ulanadi, u orqali esa maqsadli serverga. Buyruq qatorida xuddi shu narsa `-J` bilan.

Bizda bitta server bor, shuning uchun "ichki server" rolida serverning o'zi turibdi: `ichki` — `lab` orqali `127.0.0.1` ga ulanish (yuqoridagi `config`):

```text tashqi
$ ssh -F config ichki 'hostname; whoami'
Warning: Permanently added '127.0.0.1' (ED25519) to the list of known hosts.
lab
root
```

ssh avval `lab` ga ulandi, u yerdan `127.0.0.1:22` ga TCP ulanish ochdi va shu ulanish ustida ikkinchi SSH sessiyasini o'rnatdi. Ikkinchi sessiyaning kaliti va host kaliti tekshiruvi noutbukning o'zida bajariladi — `127.0.0.1` uchun alohida `known_hosts` yozuvi shundan.

Tajribadan keyin VPS'ni tozalaymiz:

```text vps
$ systemctl stop ichki
$ rm -r /srv/ichki
$ ss -tln | grep -cE ':(8090|7071) '
0
```

## Debian va Ubuntu

| | Debian 12 (trenajor) | Ubuntu 26.04 (VPS) |
| --- | --- | --- |
| SSH | o'rnatilmagan | `AllowTcpForwarding yes`, `GatewayPorts no` (standart) |

## Tipik xatolar

**1. `-L` dagi manzilni noutbuk tomonidan deb o'ylash.**
`-L 9090:127.0.0.1:8090` dagi `127.0.0.1` — **server** tomonidagi manzil.

**2. Tunnelni ochiq qoldirish.**
`-f` bilan fonga o'tgan ssh terminal yopilganda ham ishlab turadi.
To'g'risi: ishingiz tugagach to'xtatish (`pkill -f '...'` yoki jarayon PID'i bilan `kill`).

**3. Ichki servisni tunnel o'rniga internetga ochish.**
Baza portini firewall'da ochish xavfli.
To'g'risi: `-L` tunnel — port yopiq qoladi.

**4. `-R` bilan ochilgan portga boshqa kompyuterlar ulana olmayapti.**
Bu xato emas: sshd standart holatda uni loopback'ga bog'laydi (`GatewayPorts`).

## Amaliyot

Trenajorda SSH yo'q, shuning uchun mashq yo'q.

Savollar:

1. Serverdagi `127.0.0.1:5432` dagi bazaga noutbukdan qanday ulanasiz?
2. `-N` va `-f` nima qiladi?
3. `-R 7071:127.0.0.1:7070` dan keyin serverda `127.0.0.1:7071` ga so'rov qayerga boradi?
4. Ichki serverga oraliq server orqali kirish uchun `~/.ssh/config` da qaysi sozlama ishlatiladi?
5. Debian Reference bo'yicha `-L` ishlashi uchun serverda nima yoqilgan bo'lishi kerak?

<details>
<summary>Javoblar</summary>

1. `ssh -L 5433:127.0.0.1:5432 server`, keyin mahalliy dastur `127.0.0.1:5433` ga ulanadi.
2. `-N` — buyruq bajarmaslik, faqat port uzatish; `-f` — ssh'ni fonga o'tkazish.
3. SSH kanali orqali noutbukdagi `127.0.0.1:7070` ga.
4. `ProxyJump` (buyruq qatorida `-J`).
5. `AllowTcpForwarding yes`.

</details>

## Rasmiy hujjat

- [Debian Reference 6.3.7](https://www.debian.org/doc/manuals/debian-reference/ch06.en.html#_port_forwarding_for_smtp_pop3_tunneling) — port uzatish
- [ssh(1)](https://man.openbsd.org/ssh) — `-L`, `-R`, `-J`, `-N`, `-f`
- [ssh_config(5)](https://man.openbsd.org/ssh_config) — `ProxyJump`
- [sshd_config(5)](https://man.openbsd.org/sshd_config) — `AllowTcpForwarding`, `GatewayPorts`
