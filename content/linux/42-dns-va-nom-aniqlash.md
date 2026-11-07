# 42 — DNS va nom aniqlash

[← Oldingi: Tarmoqni kim boshqaradi](41-tarmoqni-kim-boshqaradi.md) · [Mundarija](README.md) · [Keyingi: Port va ulanishni tekshirish →](43-port-va-ulanishni-tekshirish.md)

## Tushuncha

Dastur `example.com` ga ulanmoqchi bo'lsa, avval nomni IP manzilga aylantirishi kerak. Bu **nom aniqlash** (name resolution) deyiladi. Linux'da dasturlar buni o'zi qilmaydi: C kutubxonasidagi (glibc) NSS (Name Service Switch) mexanizmidan so'raydi. NSS esa qayerdan qidirishni `/etc/nsswitch.conf` dan o'qiydi.

Debian Reference (5.1.1) bo'yicha `hosts: files dns` qatori tartibni belgilaydi:

1. **files** — avval `/etc/hosts` fayli. Nom topilsa, javob qaytadi va qidiruv tugaydi.
2. **dns** — topilmasa, `/etc/resolv.conf` da ko'rsatilgan DNS serveridan so'raladi.

nsswitch.conf(5): qatordagi xizmatlar tartibi ular qaysi ketma-ketlikda so'ralishini belgilaydi, natija topilguncha.

<div data-animatsiya="qadamli" data-nom="nom"></div>

## `/etc/hosts` va tartib

Trenajorda DNS yo'q, lekin `/etc/hosts` va NSS bor:

```text
$ grep '^hosts:' /etc/nsswitch.conf
hosts:          files dns
$ cat /etc/hosts
127.0.0.1	localhost
127.0.1.1	trenajor
$ cat /etc/hostname
trenajor
$ getent hosts localhost
127.0.0.1       localhost
$ getent hosts trenajor
127.0.1.1       trenajor
```

- Har qatorda IP manzil va unga mos nom(lar).
- `127.0.1.1 trenajor` — Debian Reference'ga ko'ra Debian o'rnatuvchisi doimiy IP manzili yo'q tizim uchun shunday qator qo'shadi. Nom `/etc/hostname` dagi kompyuter nomi bilan bir xil (44-bob). Doimiy IP'li tizimda `127.0.1.1` o'rniga o'sha IP yoziladi.
- `getent hosts` — nomni dasturlar qanday ko'rsa, xuddi shunday aniqlaydi: NSS orqali, `/etc/nsswitch.conf` tartibida.

`/etc/hosts` ga o'z yozuvimizni qo'shamiz:

```text
$ echo '192.0.2.30 sinov.lan' >> /etc/hosts
$ getent hosts sinov.lan
192.0.2.30      sinov.lan
$ getent hosts example.com; echo "kod: $?"
kod: 2
$ ls -l /etc/resolv.conf
ls: cannot access '/etc/resolv.conf': No such file or directory
```

`sinov.lan` DNS'siz topildi — `files` usuli. `example.com` esa topilmadi: trenajorda `/etc/resolv.conf` yo'q, ya'ni `dns` usuli so'raydigan server ham yo'q. getent(1) bo'yicha `2` kodi — "kalit bazada topilmadi".

## VPS'da: systemd-resolved

```text vps
$ grep '^hosts:' /etc/nsswitch.conf
hosts:          files dns
$ cat /etc/hosts
127.0.0.1 localhost.localdomain localhost

203.0.113.10 lab
$ ls -l /etc/resolv.conf
lrwxrwxrwx 1 root root 37 Oct 28 11:31 /etc/resolv.conf -> /run/systemd/resolve/stub-resolv.conf
$ grep -v '^#' /etc/resolv.conf

nameserver 127.0.0.53
options edns0 trust-ad
search .
```

(Ochiq IP 40-bobdagi kabi `203.0.113.10` bilan almashtirilgan.)

- `/etc/hosts` dagi `lab` — VPS'ning nomi, doimiy IP bilan (Debian Reference'dagi tavsiyaga mos).
- `/etc/resolv.conf` — oddiy fayl emas, symlink. Debian Reference (5.1.1): u `resolvconf` paketi bo'lmasa — oddiy fayl, bo'lsa — symlink va mazmunini boshqa dastur boshqaradi. Bizda uni systemd-resolved boshqaradi.
- `nameserver 127.0.0.53` — dasturlar DNS so'rovini shu manzilga yuboradi. systemd-resolved(8): bu systemd-resolved'ning loopback'dagi "stub" tinglovchisi. U so'rovni haqiqiy DNS serverlarga uzatadi. 40-bobdagi `ss -tln` da ko'ringan `127.0.0.53:53` va `127.0.0.54:53` — shular. `127.0.0.54` — cheklangan, faqat "proksi" rejimidagi stub.

Haqiqiy DNS serverlar qaysi ekanini `resolvectl` ko'rsatadi:

```text vps
$ resolvectl status --no-pager
Global
         Protocols: -LLMNR -mDNS -DNSOverTLS DNSSEC=no/unsupported
  resolv.conf mode: stub
Current DNS Server: 188.120.247.2
       DNS Servers: 2a01:230:1:1::229 2a01:230:1:1::230 188.120.247.2
                    188.120.247.8 82.146.59.250 185.60.132.11

Link 2 (ens3)
    Current Scopes: DNS
         Protocols: +DefaultRoute -LLMNR -mDNS -DNSOverTLS DNSSEC=no/unsupported
Current DNS Server: 188.120.247.2
       DNS Servers: 2a01:230:1:1::229 2a01:230:1:1::230 188.120.247.2
                    188.120.247.8 82.146.59.250 185.60.132.11
     Default Route: yes
$ dpkg -S /etc/network/if-up.d/resolved
ifupdown: /etc/network/if-up.d/resolved
```

Bu serverlar — 41-bobdagi `/etc/network/interfaces` dagi `dns-nameservers`. Ularni systemd-resolved'ga ifupdown paketidagi `if-up.d/resolved` skripti uzatadi.

## Nomni tekshirish: `getent`, `resolvectl`, `dig`

```text vps
$ getent hosts example.com
2a06:98c1:3122:8000:: example.com
2a06:98c1:3123:8000:: example.com
$ resolvectl query example.com
example.com: 8.47.69.0                                      -- link: ens3
             8.6.112.0                                      -- link: ens3
             2a06:98c1:3123:8000::                          -- link: ens3
             2a06:98c1:3122:8000::                          -- link: ens3

-- Information acquired via protocol DNS in 1.7ms.
-- Data is authenticated: no; Data was acquired via local or encrypted transport: no
-- Data from: cache network
$ dig example.com

; <<>> DiG 9.20.24-1ubuntu0.5-Ubuntu <<>> example.com
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 33832
;; flags: qr rd ra; QUERY: 1, ANSWER: 2, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 65494
;; QUESTION SECTION:
;example.com.			IN	A

;; ANSWER SECTION:
example.com.		203	IN	A	8.6.112.0
example.com.		203	IN	A	8.47.69.0

;; Query time: 1 msec
;; SERVER: 127.0.0.53#53(127.0.0.53) (UDP)
;; WHEN: Sat Nov 07 13:34:09 MSK 2026
;; MSG SIZE  rcvd: 72

```

| Vosita | Nimani ko'rsatadi |
| --- | --- |
| `getent hosts` | Dasturlar ko'radigan javob: NSS orqali, `/etc/hosts` ham hisobga olinadi |
| `resolvectl query` | systemd-resolved'ning javobi: qaysi interfeys orqali, qancha vaqtda, keshdanmi |
| `dig` | To'g'ridan-to'g'ri DNS so'rovi va to'liq javob |

`dig` chiqishida:

- `status: NOERROR` — so'rov muvaffaqiyatli (nom yo'q bo'lsa — `NXDOMAIN`).
- `ANSWER SECTION` — yozuvlar. `203` — TTL: javob yana necha soniya keshda saqlanishi mumkin. `A` — IPv4 yozuvi.
- `SERVER: 127.0.0.53` — so'rov `/etc/resolv.conf` dagi serverga, ya'ni systemd-resolved'ga ketdi.

Boshqa yozuv turlari va aniq bir serverdan so'rash:

```text vps
$ dig +short example.com AAAA
2a06:98c1:3123:8000::
2a06:98c1:3122:8000::
$ dig +short example.com MX
0 .
$ dig +short @1.1.1.1 example.com
8.47.69.0
8.6.112.0
```

- `+short` — faqat javobning o'zi (dig(1)).
- `AAAA` — IPv6 yozuvi, `MX` — pochta serveri. `0 .` — "null MX": RFC 7505 bo'yicha bu domen pochta qabul qilmasligini bildiradi.
- `@1.1.1.1` — `/etc/resolv.conf` ni chetlab, so'rovni to'g'ridan-to'g'ri shu serverga yuborish.

## `/etc/hosts` va DNS: kim nimani ko'radi

`/etc/hosts` ga yozuv qo'shib, uni turli yo'llar bilan so'raymiz:

```text vps
$ echo '192.0.2.30 sinov.lan' >> /etc/hosts
$ getent hosts sinov.lan
192.0.2.30      sinov.lan
$ dig +short sinov.lan
$ sleep 3
$ dig +short sinov.lan
192.0.2.30
$ dig @1.1.1.1 sinov.lan | grep status
;; ->>HEADER<<- opcode: QUERY, status: NXDOMAIN, id: 39526
$ sed -i '/sinov\.lan/d' /etc/hosts
$ getent hosts sinov.lan
192.0.2.30      sinov.lan
$ sleep 3
$ getent hosts sinov.lan; echo "kod: $?"
kod: 2
```

1. `getent` yozuvni darhol topdi — `files` usuli faylni o'qiydi.
2. `dig` (stub orqali) avval bo'sh qaytdi, bir necha soniyadan keyin topdi. systemd-resolved(8): `/etc/hosts` dagi yozuvlarni systemd-resolved ham beradi. Biz sinaganda u yangi yozuvni darhol emas, bir necha soniyadan keyin ko'rdi.
3. `@1.1.1.1` — tashqi DNS server bizning `/etc/hosts` ni bilmaydi: `NXDOMAIN`.
4. Yozuvni o'chirgandan keyin `getent` uni hali ham topdi. Sababi tartibda: `files` da endi yo'q, navbat `dns` ga keldi, so'rov `127.0.0.53` ga bordi — systemd-resolved esa o'zgarishni hali ko'rmagan edi. Bir necha soniyadan keyin yozuv yo'qoldi (`kod: 2`).

## Debian va Ubuntu

| | Debian 12 (trenajor) | Ubuntu 26.04 (VPS) |
| --- | --- | --- |
| `hosts:` (nsswitch) | `files dns` | `files dns` |
| `/etc/resolv.conf` | yo'q — DNS ishlamaydi | symlink → systemd-resolved stub (`127.0.0.53`) |
| DNS serverlar qayerdan | — | `/etc/network/interfaces` → `if-up.d/resolved` |
| `dig`, `resolvectl` | yo'q | bor |

## Tipik xatolar

**1. `/etc/hosts` ni o'zgartirib, `dig @server` bilan tekshirish.**
Tashqi server `/etc/hosts` ni bilmaydi.
To'g'risi: dasturlar ko'radigan natijani `getent hosts` ko'rsatadi.

**2. `/etc/resolv.conf` ni qo'lda tahrirlash.**
Bu symlink, uning mazmunini systemd-resolved boshqaradi.
To'g'risi: DNS serverlar tarmoq boshqaruvchisida (41-bob) yoki systemd-resolved sozlamasida beriladi.

**3. DNS yozuvini o'zgartirib, natija darhol ko'rinishini kutish.**
Javoblar TTL muddatigacha keshda saqlanadi (`dig` dagi ikkinchi ustun).
To'g'risi: TTL o'tishini kutish. Serverdagi systemd-resolved keshini `resolvectl flush-caches` tozalaydi (resolvectl(1)).

**4. Nom topilmasa, darhol DNS'ni ayblash.**
To'g'risi: tartib bo'yicha tekshirish — `getent hosts` (dastur nimani ko'radi), `resolvectl query` (resolved), `dig @server` (DNS serverning o'zi).

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=42-hosts)** "Nom aniqlash": nsswitch tartibini ko'rasiz, `/etc/hosts` ga yozuv qo'shib, uni `getent` bilan topasiz va o'chirasiz.

Savollar:

1. `hosts: files dns` qatori nimani bildiradi?
2. `/etc/hosts` ga yozuv qo'shdingiz, `getent` uni topadi, `dig @1.1.1.1` esa topmaydi. Nega?
3. Serverda qaysi DNS serverlar ishlatilayotganini qanday bilasiz?
4. `dig` chiqishidagi `status: NXDOMAIN` nimani bildiradi?
5. `/etc/resolv.conf` da `nameserver 127.0.0.53`. Bu qanday server?

<details>
<summary>Javoblar</summary>

1. Nom avval `/etc/hosts` dan, topilmasa DNS'dan qidiriladi.
2. `getent` NSS orqali `/etc/hosts` ni o'qiydi, tashqi DNS server esa bu faylni bilmaydi.
3. `resolvectl status`.
4. Bunday nom yo'q.
5. systemd-resolved'ning shu kompyuterdagi stub tinglovchisi: u so'rovni haqiqiy DNS serverlarga uzatadi.

</details>

## Rasmiy hujjat

- [Debian Reference 5.1.1](https://www.debian.org/doc/manuals/debian-reference/ch05.en.html#_the_hostname_resolution) — `/etc/nsswitch.conf`, `/etc/hosts`, `/etc/resolv.conf`
- [Debian Reference 4.5](https://www.debian.org/doc/manuals/debian-reference/ch04.en.html#_pam_and_nss) — NSS
- [nsswitch.conf(5)](https://man7.org/linux/man-pages/man5/nsswitch.conf.5.html) · [getent(1)](https://man7.org/linux/man-pages/man1/getent.1.html)
- [systemd-resolved(8)](https://www.freedesktop.org/software/systemd/man/latest/systemd-resolved.html) — stub tinglovchilar, `/etc/hosts`
- [resolvectl(1)](https://www.freedesktop.org/software/systemd/man/latest/resolvectl.html) — `status`, `query`, `flush-caches`
- [dig(1)](https://manpages.ubuntu.com/manpages/resolute/man1/dig.1.html) · [RFC 7505](https://www.rfc-editor.org/rfc/rfc7505) — null MX
