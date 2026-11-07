# 43 — Port va ulanishni tekshirish

[← Oldingi: DNS va nom aniqlash](42-dns-va-nom-aniqlash.md) · [Mundarija](README.md) · [Keyingi: Vaqt va xost nomi →](44-vaqt-va-xost-nomi.md)

## Tushuncha

"Saytga ulanib bo'lmayapti" — bitta belgi, lekin sababi har xil bo'lishi mumkin:

| Qatlam | Savol | Tekshirish |
| --- | --- | --- |
| Nom | Nom to'g'ri IP'ga aylanyaptimi? | `getent hosts`, `dig` (42-bob) |
| Servis | Servis ishlayaptimi va qaysi manzil:portda kutyapti? | `ss -tln` (32, 40-boblar) |
| Server ichida | Serverning o'zidan ulanish ishlaydimi? | `curl http://127.0.0.1:PORT/` |
| Firewall | Port tashqaridan ochiqmi? | `ufw status`, tashqi kompyuterdan `curl` |

Debian Reference (6.7) servislarni tekshirishning eng oddiy yo'lini ko'rsatadi: unga qo'lda ulanib ko'rish. HTTP servis uchun bunga eng qulay vosita — `curl`.

curl(1) ning chiqish kodlari muammoni farqlashga yordam beradi:

| Kod | curl(1) dagi ma'nosi |
| --- | --- |
| `6` | Xost nomi aniqlanmadi (DNS) |
| `7` | Xostga ulanib bo'lmadi |
| `28` | Kutish vaqti tugadi |

> **Chiqishlar haqida.** VPS'ning ochiq IP manzili 40-bobdagi kabi `203.0.113.10` bilan almashtirilgan — buyruqlarda ham, chiqishlarda ham. "Tashqi kompyuter" bloklari — serverga muallifning noutbukidan (macOS, curl 8.7.1) yuborilgan haqiqiy so'rovlar.

## `curl -v`: so'rov va javobni ko'rish

VPS'da sinov uchun oddiy veb-servis ishga tushiramiz (`/srv/bosh` — bo'sh katalog, `nobody` foydalanuvchisi nomidan):

```text vps
$ mkdir -p /srv/bosh
$ systemd-run --unit=sinov8080 -p User=nobody python3 -m http.server 8080 --directory /srv/bosh
Running as unit: sinov8080.service; invocation ID: fe054804e26b49e39a6adb0dea1cfa31
$ sleep 1
$ ss -tln | grep 8080
LISTEN 0      5            0.0.0.0:8080      0.0.0.0:*   
```

Servis `0.0.0.0:8080` da kutyapti. Serverning o'zidan tekshiramiz:

```text vps
$ curl -sv -o /dev/null http://127.0.0.1:8080/
*   Trying 127.0.0.1:8080...
* Established connection to 127.0.0.1 (127.0.0.1 port 8080) from 127.0.0.1 port 44742 
* using HTTP/1.x
> GET / HTTP/1.1
> Host: 127.0.0.1:8080
> User-Agent: curl/8.18.0
> Accept: */*
> 
* Request completely sent off
* HTTP 1.0, assume close after body
< HTTP/1.0 200 OK
< Server: SimpleHTTP/0.6 Python/3.14.4
< Date: Sat, 07 Nov 2026 10:40:51 GMT
< Content-type: text/html; charset=utf-8
< Content-Length: 256
< 
{ [256 bytes data]
* shutting down connection #0
```

curl(1) bo'yicha `-v` (verbose) bilan:

- `>` bilan boshlangan qatorlar — curl yuborgan header'lar (so'rov);
- `<` — qabul qilingan header'lar (javob), `HTTP/1.0 200 OK` — holat kodi;
- `*` — curl'ning qo'shimcha ma'lumoti: qayerga ulandi, ulanish o'rnatildimi.

`-s` progress chizig'ini o'chiradi, `-o /dev/null` sahifa tanasini tashlab yuboradi.

## Tajriba: firewall va servis

VPS'da ufw ishlayapti. Standart holatda kiruvchi ulanishlar taqiqlangan, faqat ro'yxatdagi portlar ochiq:

```text vps
$ ufw status verbose
Status: active
Logging: on (low)
Default: deny (incoming), allow (outgoing), disabled (routed)
New profiles: skip

To                         Action      From
--                         ------      ----
80/tcp                     ALLOW IN    Anywhere                  
443                        ALLOW IN    Anywhere                  
22/tcp                     ALLOW IN    Anywhere                  
1500/tcp (ispmanager)      ALLOW IN    Anywhere                  
80/tcp (v6)                ALLOW IN    Anywhere (v6)             
443 (v6)                   ALLOW IN    Anywhere (v6)             
22/tcp (v6)                ALLOW IN    Anywhere (v6)             
1500/tcp (ispmanager (v6)) ALLOW IN    Anywhere (v6)             

```

8080 ro'yxatda yo'q. Servis ishlab turibdi, serverning o'zidan ulanish ham ishlaydi (yuqorida). Endi xuddi shu servisga tashqaridan ulanamiz.

**1. Firewall port'ni yopgan (`deny`), servis ishlayapti:**

```text tashqi
$ curl -sS -o /dev/null -w '%{http_code}\n' --max-time 5 http://203.0.113.10:8080/; echo "kod: $?"
curl: (28) Connection timed out after 5001 milliseconds
000
kod: 28
```

**2. Port ochildi:**

```text vps
$ ufw allow 8080/tcp
Rule added
Rule added (v6)
```

```text tashqi
$ curl -sS -o /dev/null -w '%{http_code}\n' --max-time 5 http://203.0.113.10:8080/; echo "kod: $?"
200
kod: 0
```

**3. Port ochiq, lekin servis to'xtatildi:**

```text vps
$ systemctl stop sinov8080
$ ss -tln | grep -c 8080
0
```

```text tashqi
$ curl -sS -o /dev/null -w '%{http_code}\n' --max-time 5 http://203.0.113.10:8080/; echo "kod: $?"
curl: (7) Failed to connect to 203.0.113.10 port 8080 after 55 ms: Couldn't connect to server
000
kod: 7
```

**4. Firewall rad etadi (`reject`), servis yana ishlayapti:**

```text vps
$ ufw delete allow 8080/tcp
Rule deleted
Rule deleted (v6)
$ ufw reject 8080/tcp
Rule added
Rule added (v6)
$ systemd-run --unit=sinov8080 -p User=nobody python3 -m http.server 8080 --directory /srv/bosh
Running as unit: sinov8080.service; invocation ID: 8fdaa54a20284ad7b6801811efe52702
$ sleep 1
$ ss -tln | grep 8080
LISTEN 0      5            0.0.0.0:8080      0.0.0.0:*   
```

```text tashqi
$ curl -sS -o /dev/null -w '%{http_code}\n' --max-time 5 http://203.0.113.10:8080/; echo "kod: $?"
curl: (7) Failed to connect to 203.0.113.10 port 8080 after 54 ms: Couldn't connect to server
000
kod: 7
```

Natija:

| Holat | Tashqaridan | Vaqt |
| --- | --- | --- |
| Firewall `deny`, servis ishlayapti | `(28)` — kutish vaqti tugadi | 5 soniya (`--max-time 5`) |
| Firewall ochiq, servis ishlayapti | `200` | — |
| Firewall ochiq, servis to'xtagan | `(7)` — ulanib bo'lmadi | 55 ms |
| Firewall `reject`, servis ishlayapti | `(7)` — ulanib bo'lmadi | 54 ms |

- **Javobsizlik — firewall.** ufw(8): `deny` paketni shunchaki e'tiborsiz qoldiradi. Mijoz javob kutib, vaqt tugaguncha osilib turadi.
- **Darhol rad etish — ikki xil sabab.** ufw(8) ga ko'ra `reject` jo'natuvchiga ulanish rad etilganini bildiradi. Natijada tashqaridan u "servis ishlamayapti" holatidan farq qilmaydi (3 va 4). Ularni faqat serverning o'zida `ss -tln` ajratadi: servis ro'yxatda bormi.

<div data-animatsiya="qadamli" data-nom="port"></div>

Tajribadan keyin hammasini qaytaramiz:

```text vps
$ ufw delete reject 8080/tcp
Rule deleted
Rule deleted (v6)
$ systemctl stop sinov8080
$ rm -r /srv/bosh
$ ufw status | grep -c 8080
0
```

## Tekshirish tartibi

1. **Servis ishlayaptimi va qayerda kutyapti:** `ss -tln` — port ro'yxatda yo'q bo'lsa, servisni tekshirish (`systemctl status`, `journalctl -u`, 34–37-boblar). Port `127.0.0.1` da bo'lsa, tashqaridan ulanib bo'lmaydi (40-bob).
2. **Server ichidan ishlaydimi:** `curl http://127.0.0.1:PORT/` — ishlamasa, muammo servisning o'zida.
3. **Tashqaridan:** `curl` boshqa kompyuterdan. Ichkarida ishlaydi, tashqarida yo'q — firewall. Javobsizlik (`28`) — `deny`, darhol rad etish (`7`) — `reject` yoki servis.
4. **Firewall qoidalari:** `ufw status verbose`.

## Debian va Ubuntu

| | Debian 12 (trenajor) | Ubuntu 26.04 (VPS) |
| --- | --- | --- |
| Firewall | yo'q (`nft`, `iptables`, `ufw` o'rnatilmagan) | ufw yoqilgan: standart holatda `deny (incoming)` |
| `curl` | yo'q (trenajorda tarmoq ham yo'q) | 8.18.0 |

Trenajorda ulanishni 32 va 40-boblardagidek bash'ning `/dev/tcp` imkoniyati bilan tekshirsa bo'ladi.

## Tipik xatolar

**1. "Connection refused" ni doim firewall deb o'ylash.**
Ko'pincha servis ishlamayapti yoki faqat `127.0.0.1` da kutyapti.
To'g'risi: avval serverda `ss -tln`.

**2. Kutish vaqti tugashini servis xatosi deb o'ylash.**
Servisni qayta-qayta restart qilish yordam bermaydi.
To'g'risi: javobsizlik ko'pincha firewall `deny` — `ufw status`.

**3. Faqat server ichidan tekshirish.**
`curl 127.0.0.1` ishlasa ham, tashqaridan yopiq bo'lishi mumkin.
To'g'risi: tashqi kompyuterdan ham tekshirish.

**4. Bitta port uchun firewall'ni butunlay o'chirish (`ufw disable`).**
Hamma portlar ochilib qoladi.
To'g'risi: kerakli portni ochish — `ufw allow 8080/tcp`.

## Amaliyot

Bu bob VPS'da: trenajorda firewall va `curl` yo'q, shuning uchun mashq yo'q.

Savollar:

1. Tashqaridan `curl` 30 soniya osilib, so'ng `(28)` bilan tugadi. Eng ehtimol sabab nima?
2. `curl: (7) ... Couldn't connect to server` chiqdi. Qaysi ikki sababdan biri bo'lishi mumkin va ularni qanday ajratasiz?
3. Server ichida `curl http://127.0.0.1:8080/` ishlaydi, tashqaridan esa yo'q. Nimalarni tekshirasiz?
4. `curl -v` dagi `>` va `<` belgilari nimani bildiradi?
5. Firewall'da `deny` va `reject` farqi nima?

<details>
<summary>Javoblar</summary>

1. Firewall paketni jim tashlab yuboryapti (`deny`).
2. Servis bu portda kutmayapti yoki firewall `reject` qilyapti. Serverda `ss -tln`: port ro'yxatda bo'lsa — firewall.
3. Servis qaysi manzilda kutayotganini (`ss -tln`, `0.0.0.0` yoki `127.0.0.1`) va firewall qoidalarini (`ufw status`).
4. `>` — curl yuborgan header'lar, `<` — serverdan kelgan header'lar.
5. `deny` paketni jim tashlab yuboradi (mijoz kutib qoladi), `reject` jo'natuvchiga rad etilganini bildiradi (darhol xato).

</details>

## Rasmiy hujjat

- [Debian Reference 6.7](https://www.debian.org/doc/manuals/debian-reference/ch06.en.html#_the_diagnosis_of_the_system_daemons) — servisga qo'lda ulanib tekshirish
- [ss(8)](https://man7.org/linux/man-pages/man8/ss.8.html)
- [curl(1)](https://manpages.ubuntu.com/manpages/resolute/man1/curl.1.html) — `-v`, `-s`, `-o`, `-w`, `--max-time`, chiqish kodlari
- [ufw(8)](https://manpages.ubuntu.com/manpages/resolute/man8/ufw.8.html) — `allow`, `deny`, `reject`
