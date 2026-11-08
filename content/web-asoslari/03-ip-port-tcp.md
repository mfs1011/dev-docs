# 03 — IP, port va TCP

[Mundarija](README.md)

## Tushuncha

1-bobda brauzer serverga "ulanadi" dedik. Bu bobda ulanish nimadan iborat ekanini ko'ramiz: kompyuter qanday topiladi (**IP manzil**), undagi qaysi dasturga murojaat qilinadi (**port**) va ma'lumot qanday ishonchli yetkaziladi (**TCP**).

### Internet — tarmoqlar tarmog'i

MDN (How does the Internet work?) internetni bosqichma-bosqich quradi:

| Bosqich | Nima | Muammo yoki yechim |
| --- | --- | --- |
| Ikki kompyuter | Kabel yoki simsiz (Wi-Fi, Bluetooth) ulanish | — |
| O'nta kompyuter | Har biri har biri bilan ulansa — 45 ta kabel | Juda ko'p |
| **Kommutator** (switch) | Har kompyuter bitta kichik qurilmaga ulanadi, u xabarni kerakli kompyuterga uzatadi; 10 ta kabel yetadi | Kompyuterlarni **MAC manzil** bilan ajratadi — tarmoq kartasining "barmoq izi" |
| Kommutatorlar zanjiri | Bitta lokal tarmoq kattalashadi | MAC manzilda tartib (ierarxiya) yo'q: milliardlab qurilmani eslab qolish va qidirish qimmat |
| **Marshrutizator** (router) | Kompyuterlar alohida lokal tarmoqlarga bo'linadi, tarmoqlar router bilan ulanadi | **IP manzil** ishlatadi — "ko'cha manzili", tarmoqqa ulanganda beriladi; bir tarmoqdagilarning boshi (**prefiks**) umumiy |
| **Provayder** (ISP) | Bir-biriga va boshqa provayderlarga ulangan maxsus routerlarni boshqaradigan kompaniya | Xabar provayderlar tarmog'i orqali kerakli tarmoqqa yetadi |

MDN xulosasi: **internet** — shu tarmoqlarning butun infratuzilmasi; **veb** — uning ustidagi xizmatlardan biri (boshqalari: elektron pochta, IRC). Uydagi router ko'pincha kommutator, router va modemni bitta qurilmada birlashtiradi.

### IP manzil

MDN (IP Address): IP manzil — IP tarmog'idagi har qurilmaga beriladigan **noyob raqam**; IP — Internet Protocol. Ikki versiyasi bor:

| | IPv4 | IPv6 |
| --- | --- | --- |
| Uzunligi | 32 bit (RFC 791) | 128 bit (RFC 8200, RFC 4291) |
| Yozilishi | 4 ta son, nuqta bilan: `8.47.69.0` | 16 bitli 8 guruh, o'n oltilik, `:` bilan: `2a06:98c1:3123:8000::` |
| MDN | Keng tarqalgan birinchi versiya, 1981-yilda rasmiylashgan | Hozirgi versiya; IPv4 o'rnini **sekin** egallayapti, sabablaridan biri — juda ko'p manzil |

IPv6'da `::` — ketma-ket nol guruhlar qisqartmasi, manzilda faqat **bir marta** keladi (RFC 4291, 2.2). `2a06:98c1:3123:8000::` oxiri nollardan iborat.

Maxsus manzillar:

| Manzil | Nima | Manba |
| --- | --- | --- |
| `127.0.0.0/8` (odatda `127.0.0.1`) va `::1` | **Loopback** — kompyuterning o'zi; paket tarmoqqa chiqmaydi | RFC 6890, RFC 1122, RFC 4291 |
| `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` | **Xususiy** (private) tarmoqlar — uy va ofis tarmoqlari | RFC 1918 |
| `192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24` va `2001:db8::/32` | **Hujjatlar uchun** — misollarda ishlatiladi, internetda yo'q | RFC 5737, RFC 3849 |

`/8`, `/24` — **prefiks uzunligi**: manzilning boshidagi nechta bit tarmoqni bildiradi (Linux kitobi, IX qism).

> Bu qo'llanmada VPS'ning haqiqiy manzili chiqishlarda `203.0.113.10` bilan almashtirilgan — hujjatlar uchun ajratilgan manzil.

### Paket

MDN (Packet): ma'lumot tarmoqda **paket**larda yuboriladi. Paketda:

- **yuk** (payload) — dasturning haqiqiy ma'lumoti;
- **boshqaruv ma'lumoti** — jo'natuvchi va qabul qiluvchi manzili, tartib raqami, xatoni aniqlash kodi (odatda paket sarlavhasida).

**Sakrash chegarasi** (hop limit): paket bir tarmoqdan keyingisiga o'tganda maydon bittaga kamayadi; nolga yetsa — paket tashlab yuboriladi. IPv4'da bu maydon **TTL** (Time to Live) deyiladi: RFC 791 bo'yicha paketni ishlagan har qurilma uni kamida bittaga kamaytiradi — shunda yetkazib bo'lmaydigan paketlar tarmoqda abadiy aylanmaydi.

### Port

Bitta serverda bir nechta dastur ishlaydi: veb-server, pochta, baza. IP manzil **kompyuterni** topadi, **port** esa undagi **dasturni**.

MDN (Port): port — IP manzilli kompyuterdagi aloqa nuqtasi, raqam bilan belgilanadi; 1024 dan kichik portlar odatda muayyan protokolga biriktirilgan: HTTP — 80, HTTPS — 443, SMTP — 25, POP — 110, IMAP — 143.

RFC 6335 port raqamlarini uch oraliqqa bo'ladi:

| Oraliq | Nomi | Kim beradi |
| --- | --- | --- |
| 0–1023 | System Ports (Well Known Ports) | IANA |
| 1024–49151 | User Ports (Registered Ports) | IANA |
| 49152–65535 | Dynamic Ports (Private, Ephemeral) | Hech kimga berilmaydi |

Ulanishning **ikki** uchida ham port bor. Server ma'lum portda **tinglaydi** (listen), masalan 443. Mijoz tomonida tizim har ulanishga **vaqtinchalik** (ephemeral) portni o'zi tanlaydi. Linux uni `ip_local_port_range` oralig'idan oladi (yadro hujjati: standart qiymati 32768–60999 — RFC 6335 oralig'idan farq qiladi).

RFC 9293: ulanish **soketlar juftligi** bilan aniqlanadi; soket — IP manzil va port. Ya'ni bitta TCP ulanish: mijoz IP:port ↔ server IP:port.

### TCP

MDN (TCP): **TCP** (Transmission Control Protocol) ikki kompyuterni ulaydi va ular orasida **ma'lumot oqimi**ni yuboradi. TCP ma'lumot **yetib borishini** va yuborilgan **tartibda** kelishini kafolatlaydi, xatosiz yetkazishni ta'minlaydi. Tarmoq tiqilib qolmasligi uchun boshida kam yuboradi va tarmoq ko'tara oladigan hajmgacha oshiradi (congestion control).

**Uch qadamli kelishuv** (three-way handshake, MDN: TCP handshake) — ulanish ochilishi:

1. Brauzer serverga **SYN** (synchronize) yuboradi.
2. Server **SYN-ACK** (synchronize-acknowledgement) qaytaradi.
3. Brauzer **ACK** (acknowledge) yuboradi — ulanish o'rnatildi.

Bu qadam DNS so'rovidan **keyin** va TLS kelishuvidan **oldin** bo'ladi (1-bobdagi `curl -w`: dns → tcp → tls).

**Yopilish** — har tomon o'z yo'nalishini alohida yopadi: **FIN** (finish) va unga **ACK**. Bir tomon yopgach, ikkinchisi hali ma'lumot yuborishi mumkin (yarim yopiq ulanish).

**UDP** (MDN: UDP) — boshqa transport protokoli: ulanish o'rnatmaydi, kelishuv yo'q, yetkazish, tartib va takrorlanmaslikni kafolatlamaydi; tezlik muhimroq bo'lgan joyda ishlatiladi. HTTP/3 UDP ustida ishlaydi (13-bob).

## Ko'rib chiqamiz

Hammasi VPS'da.

### Bitta nom — bir nechta manzil

`getent` tizimning nom aniqlash xizmati orqali domen manzillarini ko'rsatadi:

```text vps
$ getent ahostsv4 example.com | awk '{print $1}' | sort -u
8.47.69.0
8.6.112.0
$ getent ahostsv6 example.com | awk '{print $1}' | sort -u
2a06:98c1:3122:8000::
2a06:98c1:3123:8000::
```

`example.com` ning ikkita IPv4 va ikkita IPv6 manzili bor (DNS — 4-bob).

### Ulanishning ikki uchi

`curl -w` da `remote_ip`/`remote_port` — server, `local_ip`/`local_port` — biz:

```text vps
$ curl -4 -sS -o /dev/null -w 'server: %{remote_ip}:%{remote_port}\nmen:    %{local_ip}:%{local_port}\n' https://example.com/
server: 8.47.69.0:443
men:    203.0.113.10:33740
$ curl -4 -sS -o /dev/null -w 'server: %{remote_ip}:%{remote_port}\nmen:    %{local_ip}:%{local_port}\n' https://example.com/
server: 8.6.112.0:443
men:    203.0.113.10:33136
$ cat /proc/sys/net/ipv4/ip_local_port_range
32768	60999
```

- Server porti — **443** (HTTPS), ikkala safar ham.
- Bizning port har safar **boshqa** (`33740`, `33136`) — tizim tanlagan vaqtinchalik port, `32768–60999` oralig'ida.
- Server manzili ham har xil chiqdi: ikki IPv4 manzildan biri olindi.

IPv6 orqali:

```text vps
$ curl -6 -sS -o /dev/null -w 'server: [%{remote_ip}]:%{remote_port}\n' https://example.com/; echo "exit: $?"
curl: (7) Failed to connect to example.com port 443 after 4 ms: Could not connect to server
server: []:-1
exit: 7
```

Bu VPS'da IPv6 orqali tashqariga ulanish yo'q — `curl` xato `7` (ulanib bo'lmadi) qaytardi. Shuning uchun 1-bobda `curl` avval IPv6'ni sinab, keyin IPv4 bilan ulangan edi (`Trying [2a06:…]` → `Trying 8.47.69.0`).

### TCP kelishuvini ko'rish

Lokal (`127.0.0.1`, loopback) `8080` portda kichik server ochildi (`python3 -m http.server`). `ss -tln` — tinglayotgan TCP portlar:

```text vps
$ ss -tln '( sport = :8080 )'
State  Recv-Q Send-Q Local Address:Port Peer Address:Port
LISTEN 0      5          127.0.0.1:8080      0.0.0.0:*   
```

`tcpdump` (tcpdump 4.99.6) — tarmoqdagi paketlarni ko'rsatadi. U ishlab turgan paytda `curl http://127.0.0.1:8080/` yuborildi:

```text vps
$ cat /tmp/td.txt
IP 127.0.0.1.35882 > 127.0.0.1.8080: Flags [S], seq 3540567484, win 65495, options [mss 65495,sackOK,TS val 2138943839 ecr 0,nop,wscale 8], length 0
IP 127.0.0.1.8080 > 127.0.0.1.35882: Flags [S.], seq 723218339, ack 3540567485, win 65483, options [mss 65495,sackOK,TS val 3194211752 ecr 2138943839,nop,wscale 8], length 0
IP 127.0.0.1.35882 > 127.0.0.1.8080: Flags [.], ack 1, win 256, options [nop,nop,TS val 2138943839 ecr 3194211752], length 0
IP 127.0.0.1.35882 > 127.0.0.1.8080: Flags [P.], seq 1:79, ack 1, win 256, options [nop,nop,TS val 2138943840 ecr 3194211752], length 78: HTTP: GET / HTTP/1.1
IP 127.0.0.1.8080 > 127.0.0.1.35882: Flags [.], ack 79, win 256, options [nop,nop,TS val 3194211753 ecr 2138943840], length 0
IP 127.0.0.1.8080 > 127.0.0.1.35882: Flags [P.], seq 1:185, ack 79, win 256, options [nop,nop,TS val 3194211759 ecr 2138943840], length 184: HTTP: HTTP/1.0 200 OK
IP 127.0.0.1.35882 > 127.0.0.1.8080: Flags [.], ack 185, win 256, options [nop,nop,TS val 2138943846 ecr 3194211759], length 0
IP 127.0.0.1.8080 > 127.0.0.1.35882: Flags [P.], seq 185:191, ack 79, win 256, options [nop,nop,TS val 3194211760 ecr 2138943846], length 6: HTTP
IP 127.0.0.1.35882 > 127.0.0.1.8080: Flags [.], ack 191, win 256, options [nop,nop,TS val 2138943847 ecr 3194211760], length 0
IP 127.0.0.1.35882 > 127.0.0.1.8080: Flags [F.], seq 79, ack 191, win 256, options [nop,nop,TS val 2138943847 ecr 3194211760], length 0
IP 127.0.0.1.8080 > 127.0.0.1.35882: Flags [F.], seq 191, ack 80, win 256, options [nop,nop,TS val 3194211761 ecr 2138943847], length 0
IP 127.0.0.1.35882 > 127.0.0.1.8080: Flags [.], ack 192, win 256, options [nop,nop,TS val 2138943848 ecr 3194211761], length 0
```

Har qator — bitta paket: `jo'natuvchi.port > qabul qiluvchi.port`. `Flags` (tcpdump qo'llanmasi): `S` — SYN, `F` — FIN, `P` — PSH, `R` — RST, `.` — ACK.

| Qator | Kimdan | Flags | Nima |
| --- | --- | --- | --- |
| 1 | mijoz (`35882`) | `[S]` | SYN — ulanish so'rovi |
| 2 | server (`8080`) | `[S.]` | SYN-ACK |
| 3 | mijoz | `[.]` | ACK — **ulanish o'rnatildi** |
| 4 | mijoz | `[P.]` | 78 bayt ma'lumot: `GET / HTTP/1.1` |
| 5 | server | `[.]` | "78 baytni oldim" (`ack 79`) |
| 6, 8 | server | `[P.]` | Javob: 184 bayt header (`HTTP/1.0 200 OK`) va 6 bayt tana (`salom` + qator oxiri) |
| 7, 9 | mijoz | `[.]` | Olinganini tasdiqlash |
| 10–12 | ikkalasi | `[F.]`, `[F.]`, `[.]` | Yopilish: mijoz FIN, server FIN, mijoz oxirgi ACK |

- Birinchi uch qator — uch qadamli kelishuv; HTTP so'rovi faqat **undan keyin** ketdi.
- `seq`/`ack` — tartib raqamlari: tomon qaysi baytgacha olganini bildiradi. Shu tufayli TCP yo'qolgan qismni qayta yuboradi va tartibni tiklaydi.
- Mijoz porti `35882` — yana vaqtinchalik port.
- Bitta kichik sahifa uchun 12 ta paket: ulanishni ochish va yopish ham vaqt oladi (13-bob: ulanishni qayta ishlatish).
- Yopilishda server FIN'ni ACK bilan birga yubordi (`[F.]`), shuning uchun 4 emas, 3 paket.

### Yopiq port

Hech kim tinglamayotgan `8081` portga:

```text vps
$ cat /tmp/td2.txt
IP 127.0.0.1.48396 > 127.0.0.1.8081: Flags [S], seq 2226500409, win 65495, options [mss 65495,sackOK,TS val 140124609 ecr 0,nop,wscale 8], length 0
IP 127.0.0.1.8081 > 127.0.0.1.48396: Flags [R.], seq 0, ack 2226500410, win 0, length 0
```

```text vps
curl: (7) Failed to connect to 127.0.0.1 port 8081 after 0 ms: Could not connect to server
exit: 7
```

Mijoz SYN yubordi, javobga **RST** (reset) keldi — "bu portda hech kim yo'q". `curl` buni darhol (`after 0 ms`) "Could not connect to server" deb ko'rsatdi. Bu RFC 9293 (3.5.2) dagi qoida: ulanish mavjud bo'lmasa, kelgan segmentga RST yuboriladi.

### TTL

`ping` serverga kichik paket yuborib, javobni kutadi:

```text vps
$ ping -4 -c 3 example.com
PING example.com (8.47.69.0) 56(84) bytes of data.
64 bytes from 8.47.69.0: icmp_seq=1 ttl=52 time=34.6 ms
64 bytes from 8.47.69.0: icmp_seq=2 ttl=52 time=18.7 ms
64 bytes from 8.47.69.0: icmp_seq=3 ttl=52 time=18.2 ms

--- example.com ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2004ms
rtt min/avg/max/mdev = 18.164/23.833/34.645/7.648 ms
```

- `ttl=52` — javob paketi bizga yetganda TTL maydonida qolgan qiymat: yo'ldagi har router uni kamaytirgan.
- `time` — paket borib-kelish vaqti (~18 ms).

## Standartda nima deyilgan

| Mavzu | Standart | Asosiy gap |
| --- | --- | --- |
| IPv4 | RFC 791 (1981-yil sentabr) | Manzil — 4 oktet, 32 bit. TTL: har qurilma kamida 1 ga kamaytiradi, nol bo'lsa paket yo'q qilinadi |
| IPv6 | RFC 8200 (2017-yil iyul) | Manzil 32 bitdan 128 bitga oshirilgan. Hop Limit: har uzatuvchi tugun 1 ga kamaytiradi |
| IPv6 manzillari | RFC 4291 (2006-yil fevral) | Yozilishi; `::` — nol guruhlar, bir marta; `::1` — loopback |
| TCP | RFC 9293 (2022-yil avgust) | RFC 793 o'rnini egallagan. 3.5 — ulanish o'rnatish (three-way handshake), 3.5.2 — RST qachon yuboriladi, 3.6 — ulanishni yopish |
| Portlar | RFC 6335 (2011-yil avgust) | 0–1023, 1024–49151, 49152–65535 oraliqlari |
| Xususiy manzillar | RFC 1918 (1996-yil fevral) | `10/8`, `172.16/12`, `192.168/16` |
| Hujjat manzillari | RFC 5737 (2010-yil yanvar), RFC 3849 (2004-yil iyul) | TEST-NET-1/2/3, `2001:db8::/32` |

RFC 9293 (3.5) kelishuvning asosiy sababini aytadi: eski, takrorlangan ulanish so'rovlari chalkashlik keltirib chiqarmasligi uchun.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| "Internet va veb — bir narsa" | Internet — infratuzilma, veb — uning ustidagi xizmat (MDN) | Pochta, IRC ham internet ustida |
| "Domenning bitta IP manzili bor" | `example.com` — 2 ta IPv4 va 2 ta IPv6 | DNS bir nechta manzil berishi mumkin (4-bob) |
| "Port — faqat serverda" | Mijoz tomonida ham port bor — vaqtinchalik, har ulanishda yangi | Ulanish = ikki IP:port juftligi |
| "Connection refused — server o'chgan" | Kompyuter ishlayapti, lekin shu portda dastur yo'q — RST qaytardi | Dastur ishlayaptimi va to'g'ri portdami — tekshirish (`ss -tln`) |
| "IPv6 manzil bor — demak IPv6 ishlaydi" | Bu VPS'da DNS IPv6 berdi, lekin ulanib bo'lmadi | `curl -6` bilan alohida sinash |
| `127.0.0.1` da ishlayotgan serverga tashqaridan kirish | Loopback — faqat shu kompyuter ichida (RFC 1122: bunday manzil kompyuterdan tashqarida ko'rinmasligi shart) | Server tashqi interfeys manzilida tinglashi kerak (Linux kitobi, IX qism) |
| Misollarda haqiqiy manzil yozish | Kimningdir manzili bo'lishi mumkin | `192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24`, `2001:db8::/32` |

## Amaliyot

1. MAC manzil va IP manzil farqi nima? Nega internet uchun MAC yetmaydi?
2. `8.47.69.0` va `2a06:98c1:3123:8000::` — qaysi biri IPv4, qaysi IPv6? Uzunliklari necha bit?
3. Brauzer `https://example.com` ga ulanganda server porti qaysi? Mijoz porti-chi?
4. tcpdump chiqishida HTTP so'rovi nechanchi paketda ketdi va nega undan oldin emas?
5. Yopiq portga ulanganda qaysi paket qaytadi va `curl` nima deydi?
6. TCP va UDP ning asosiy farqi nima?

<details>
<summary>Javoblar</summary>

1. MAC — tarmoq kartasining identifikatori, faqat lokal tarmoqda yetkazish uchun; IP — tarmoqqa ulanganda beriladigan "ko'cha manzili", prefiksi bor. MAC'da ierarxiya yo'q — milliardlab qurilmani eslab qolish imkonsiz.
2. `8.47.69.0` — IPv4, 32 bit; `2a06:…::` — IPv6, 128 bit.
3. Server — 443; mijoz — tizim tanlagan vaqtinchalik port (sinovda 33740, 33136).
4. To'rtinchi: avval uch qadamli kelishuv (SYN, SYN-ACK, ACK) ulanishni o'rnatishi kerak.
5. RST; `curl: (7) … Could not connect to server`.
6. TCP ulanish o'rnatadi, yetkazish va tartibni kafolatlaydi; UDP ulanishsiz, kafolatsiz, lekin tezroq.

</details>

## Rasmiy hujjat

- [MDN: How does the Internet work?](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/How_does_the_Internet_work)
- [MDN: IP Address](https://developer.mozilla.org/en-US/docs/Glossary/IP_Address) · [IPv4](https://developer.mozilla.org/en-US/docs/Glossary/IPv4) · [IPv6](https://developer.mozilla.org/en-US/docs/Glossary/IPv6)
- [MDN: Port](https://developer.mozilla.org/en-US/docs/Glossary/Port)
- [MDN: Packet](https://developer.mozilla.org/en-US/docs/Glossary/Packet)
- [MDN: TCP](https://developer.mozilla.org/en-US/docs/Glossary/TCP) · [TCP handshake](https://developer.mozilla.org/en-US/docs/Glossary/TCP_handshake) · [UDP](https://developer.mozilla.org/en-US/docs/Glossary/UDP)
- [RFC 791: Internet Protocol](https://www.rfc-editor.org/rfc/rfc791) · [RFC 8200: IPv6](https://www.rfc-editor.org/rfc/rfc8200) · [RFC 4291: IPv6 Addressing](https://www.rfc-editor.org/rfc/rfc4291)
- [RFC 9293: TCP](https://www.rfc-editor.org/rfc/rfc9293)
- [RFC 6335: port raqamlari](https://www.rfc-editor.org/rfc/rfc6335) · [RFC 1918](https://www.rfc-editor.org/rfc/rfc1918) · [RFC 6890](https://www.rfc-editor.org/rfc/rfc6890) · [RFC 1122](https://www.rfc-editor.org/rfc/rfc1122) · [RFC 5737](https://www.rfc-editor.org/rfc/rfc5737) · [RFC 3849](https://www.rfc-editor.org/rfc/rfc3849)
- [Linux yadrosi: ip-sysctl (`ip_local_port_range`)](https://docs.kernel.org/networking/ip-sysctl.html)
- [tcpdump qo'llanmasi](https://www.tcpdump.org/manpages/tcpdump.1.html)
