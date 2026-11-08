# 05 — HTTP'ga umumiy nazar

[Mundarija](README.md)

## Tushuncha

MDN (Overview of HTTP): **HTTP** (HyperText Transfer Protocol) — HTML hujjat kabi resurslarni olish uchun **protokol**; vebdagi har qanday ma'lumot almashinuvining asosi. U **mijoz-server** protokoli: so'rovni doim qabul qiluvchi tomon — odatda brauzer — boshlaydi.

### So'rov va javob

Mijoz va server ma'lumot oqimi bilan emas, alohida **xabarlar** bilan almashadi:

- mijoz yuboradigan xabar — **so'rov** (request);
- server qaytaradigan xabar — **javob** (response).

MDN bo'yicha HTTP almashinuvi to'rt qadamda bo'ladi:

1. **TCP ulanish ochiladi** (3-bob) — yoki eskisi qayta ishlatiladi.
2. **So'rov yuboriladi:**

   ```http
   GET / HTTP/1.1
   Host: developer.mozilla.org
   Accept-Language: fr
   ```

3. **Javob o'qiladi:** birinchi qatorda versiya, **holat kodi** va qisqa izoh (`HTTP/1.1 200 OK`), keyin header'lar, bo'sh qator va tana (masalan, HTML).
4. Ulanish **yopiladi** yoki keyingi so'rovlar uchun qoldiriladi.

So'rov va javob tuzilishi 6-bobda batafsil.

### Kim qatnashadi

| Qatnashchi | Nima (MDN) |
| --- | --- |
| **User-agent** (foydalanuvchi agenti) | Foydalanuvchi nomidan ishlaydigan har qanday vosita. Ko'pincha brauzer, lekin qidiruv tizimi roboti yoki dasturchining vositasi (`curl`) ham. So'rovni **doim** u boshlaydi, server emas |
| **Server** | Hujjatni "beradi" (serve). Tashqaridan bitta mashinadek ko'rinadi, aslida yuklamani bo'lishuvchi bir nechta server, kesh, baza bo'lishi mumkin. Bir mashinada bir nechta server dasturi ishlashi va HTTP/1.1 dagi `Host` header'i tufayli ular bitta IP manzilni bo'lishishi ham mumkin |
| **Proksi** (proxy) | Brauzer va server orasidagi, HTTP darajasida ishlaydigan oraliq dasturlar. Vazifalari: keshlash, filtrlash (antivirus, ota-ona nazorati), yuklamani bo'lish (load balancing), autentifikatsiya, jurnal yozish |

RFC 9110 (3.7) oraliq qatnashchilarning uch turini aytadi: **proksi**, **shlyuz** (gateway) va **tunnel**. Zanjirdan o'tgan xabar har bo'g'in orasida **alohida** ulanish orqali boradi.

### HTTP qatlamlarda

MDN: HTTP — **ilova qatlami** (application layer) protokoli. U TCP ustidan yoki TLS bilan shifrlangan TCP ustidan yuboriladi. HTTP'ga faqat **ishonchli** transport kerak — xabarni yo'qotmaydigan, yo'qotsa xato beradigan. Shuning uchun HTTP UDP emas, TCP'ga tayanadi. Istisno — HTTP/3, u UDP ustidagi QUIC'da ishlaydi (pastda).

Yo'ldagi routerlar va modemlar tarmoq va transport qatlamlarida yashiringan; HTTP ularni ko'rmaydi.

### HTTP'ning asosiy xususiyatlari

| Xususiyat | Ma'nosi (MDN) |
| --- | --- |
| **Sodda** | Xabarlarni odam o'qiy oladi (HTTP/1.x da). HTTP/2 ularni ikkilik **freym**larga o'rasa ham, ma'nosi o'zgarmaydi |
| **Kengaytiriladigan** | HTTP/1.0 dan beri **header**'lar bor: mijoz va server yangi header ma'nosiga kelishib, yangi imkoniyat qo'shishi mumkin |
| **Holatsiz** (stateless), lekin sessiyasiz emas | Bitta ulanishdagi ketma-ket ikki so'rov orasida **hech qanday bog'liqlik yo'q**. Savatcha kabi narsalar uchun **cookie** ishlatiladi: u har so'rovga bir xil kontekstni qo'shib, **sessiya** yaratadi (14–15-boblar) |

RFC 9110 (1-bo'lim): HTTP — holatsiz, ilova darajasidagi so'rov-javob protokollari oilasi; har so'rovni **alohida**, oldingi qadamlarga bog'lamasdan ko'rib chiqish mumkin.

### HTTP nimalarni boshqaradi

MDN ro'yxati — kitobning keyingi boblari aynan shular:

| Imkoniyat | Bob |
| --- | --- |
| Keshlash: nima va qancha saqlanadi | 11 |
| Origin cheklovini yumshatish (CORS) | 19 |
| Autentifikatsiya | 16 |
| Proksi va tunnel | — |
| Sessiyalar (cookie) | 14–15 |

### Versiyalar tarixi

MDN (Evolution of HTTP):

| Versiya | Qachon | Nima o'zgardi |
| --- | --- | --- |
| **HTTP/0.9** | 1989–1991, CERN, Tim Berners-Lee | Bir qatorli so'rov: faqat `GET` va yo'l. Javob — faqat faylning o'zi. Header yo'q, holat kodi yo'q, faqat HTML |
| **HTTP/1.0** | 1991–1995 amalda; RFC 1945 (1996-yil may) | So'rovga versiya qo'shildi (`GET /… HTTP/1.0`). Javob boshida **holat qatori**. **Header**'lar paydo bo'ldi. `Content-Type` tufayli HTML'dan boshqa fayllar ham. Har so'rov uchun alohida TCP ulanish |
| **HTTP/1.1** | RFC 2068 (1997-yil yanvar) — birinchi standart | Ulanishni **qayta ishlatish**. Pipelining. Bo'laklab javob (chunked). Ko'proq kesh boshqaruvi. Kontentni kelishish (til, kodlash, tur). **`Host`** header'i — bitta IP'da bir nechta domen |
| **HTTPS** | 1994-yil oxiri, Netscape: SSL; keyinchalik TLS bo'lib standartlashdi | HTTP shifrlangan qatlam ustida (25-bob) |
| **HTTP/2** | 2015-yil may | **Ikkilik** (binary) protokol. Bitta ulanishda parallel so'rovlar (**multiplexing**). Header'larni siqish. Asosi — Google'ning SPDY tajribasi |
| **HTTP/3** | RFC 9114 (2022-yil iyun) | Ma'nosi oldingi versiyalar bilan bir xil, lekin TCP o'rniga **QUIC** (UDP ustida). Paket yo'qolsa, faqat shu paketdagi oqim kutadi, qolganlari emas |

2022-yil iyunida butun HTTP qayta yozildi va qismlarga bo'lindi: semantika — RFC 9110, keshlash — RFC 9111 (barcha versiyalar uchun umumiy), HTTP/1.1 — RFC 9112, HTTP/2 — RFC 9113, HTTP/3 — RFC 9114.

HTTP/1.1 da ulanish qayta ishlatilsa ham, mijoz har resurs yuklanishini kutib, keyin keyingisini so'raydi (**navbat boshida tiqilish**, head-of-line blocking). Shuni chetlab o'tish uchun ko'p brauzerlar bitta sayt (origin) ga **oltitagacha** TCP ulanish ochadi (MDN).

## Ko'rib chiqamiz

Hammasi VPS'da.

### Xabar — oddiy matn

Lokal (`127.0.0.1:8080`) Python serveri (`python3 -m http.server`, Python 3.14.4) ishga tushirildi. `nc` (netcat) — TCP ulanish ochib, kiritilgan matnni o'zgartirmasdan yuboradi. HTTP/1.1 so'rovini qo'lda yozamiz (`\r\n` — qator oxiri, bo'sh qator — header'lar tugadi):

```text vps
$ printf 'GET / HTTP/1.1\r\nHost: 127.0.0.1:8080\r\n\r\n' | nc -q 2 127.0.0.1 8080
HTTP/1.0 200 OK
Server: SimpleHTTP/0.6 Python/3.14.4
Date: Sun, 08 Nov 2026 08:28:46 GMT
Content-type: text/html
Content-Length: 15
Last-Modified: Sun, 08 Nov 2026 08:28:45 GMT

<h1>Salom</h1>
```

- Birinchi qator — **holat qatori**: versiya, kod `200`, izoh `OK`.
- Keyin header'lar: server nomi, sana, kontent turi (`text/html`), uzunligi (15 bayt).
- Bo'sh qatordan keyin — **tana**: HTML.
- Biz `HTTP/1.1` so'radik, server `HTTP/1.0` bilan javob berdi: Python hujjatiga ko'ra `http.server` orqaga moslik uchun standart holatda `HTTP/1.0` ni e'lon qiladi.

### HTTP/1.0 va HTTP/0.9

```text vps
$ printf 'GET / HTTP/1.0\r\n\r\n' | nc -q 2 127.0.0.1 8080
HTTP/1.0 200 OK
Server: SimpleHTTP/0.6 Python/3.14.4
Date: Sun, 08 Nov 2026 08:28:48 GMT
Content-type: text/html
Content-Length: 15
Last-Modified: Sun, 08 Nov 2026 08:28:45 GMT

<h1>Salom</h1>
$ printf 'GET /\r\n' | nc -q 2 127.0.0.1 8080
<h1>Salom</h1>
```

Ikkinchisi — HTTP/0.9 uslubidagi bir qatorli so'rov: versiya yo'q. Javob ham MDN aytgandek — **faqat fayl**: holat qatori ham, header ham yo'q.

Server jurnali:

```text vps
$ cat /tmp/h.log
127.0.0.1 - - [08/Nov/2026 11:28:46] "GET / HTTP/1.1" 200 -
127.0.0.1 - - [08/Nov/2026 11:28:48] "GET / HTTP/1.0" 200 -
127.0.0.1 - - [08/Nov/2026 11:28:50] "GET /" 200 -
```

Haqiqiy saytda HTTP/0.9 ishlamadi:

```text vps
$ printf 'GET /\r\n' | nc -4 -q 5 example.com 80 | head -3; echo "javob qatorlari: ${PIPESTATUS[1]}"
Cloudflare encountered an error processing this request: javob qatorlari: 0
```

`example.com` (Cloudflare orqasida) holat qatorisiz qisqa xato matnini qaytardi (oxirida qator oxiri yo'q, shuning uchun `echo` matni shu qatorga yopishdi; `0` — aslida `nc` ning chiqish kodi, `PIPESTATUS[1]`). RFC 9112 (C.1): HTTP/0.9 da header'lar yo'q, demak `Host` ham yo'q, shuning uchun bitta IP'da ko'p domen saqlaydigan serverlar HTTP/0.9 ni o'chirib qo'yishi kerak.

### `Host` majburiy

```text vps
$ printf 'GET / HTTP/1.1\r\nConnection: close\r\n\r\n' | nc -q 5 example.com 80 | head -3
HTTP/1.1 400 Bad Request
Server: cloudflare
Date: Sun, 08 Nov 2026 08:27:48 GMT
```

`Host` siz HTTP/1.1 so'rovi — **400 Bad Request**. RFC 9112 (3.2): server `Host` header'i bo'lmagan har qanday HTTP/1.1 so'roviga 400 bilan javob berishi **shart**. Bitta IP manzilda (`8.47.69.0`) ko'p sayt bo'lishi mumkin — server qaysi sayt so'ralganini faqat `Host` dan biladi.

### Ulanish: HTTP/1.0 va HTTP/1.1

`curl` bitta buyruqda bir xil URL'ni ikki marta so'raydi. Avval HTTP/1.0:

```text vps
$ curl -4 -sv --http1.0 -o /dev/null -o /dev/null http://example.com/ http://example.com/ 2>&1 | grep -E '^\*|^> GET|^< HTTP'
* Host example.com:80 was resolved.
* IPv6: (none)
* IPv4: 8.6.112.0, 8.47.69.0
*   Trying 8.6.112.0:80...
* Established connection to example.com (8.6.112.0 port 80) from 203.0.113.10 port 51864 
* using HTTP/1.x
> GET / HTTP/1.0
* Request completely sent off
< HTTP/1.1 200 OK
* shutting down connection #0
* Hostname example.com was found in DNS cache
*   Trying 8.6.112.0:80...
* Established connection to example.com (8.6.112.0 port 80) from 203.0.113.10 port 51874 
* using HTTP/1.x
> GET / HTTP/1.0
* Request completely sent off
< HTTP/1.1 200 OK
* shutting down connection #1
```

Ikki so'rov — **ikki** TCP ulanish (`#0`, `#1`; mijoz porti `51864` va `51874`). Har javobdan keyin ulanish yopildi — MDN aytgan HTTP/1.0 xatti-harakati.

HTTP/1.1:

```text vps
$ curl -4 -sv --http1.1 -o /dev/null -o /dev/null http://example.com/ http://example.com/ 2>&1 | grep -E '^\*|^> GET|^< HTTP'
* Host example.com:80 was resolved.
* IPv6: (none)
* IPv4: 8.6.112.0, 8.47.69.0
*   Trying 8.6.112.0:80...
* Established connection to example.com (8.6.112.0 port 80) from 203.0.113.10 port 51886 
* using HTTP/1.x
> GET / HTTP/1.1
* Request completely sent off
< HTTP/1.1 200 OK
* Connection #0 to host example.com:80 left intact
* Reusing existing http: connection with host example.com
> GET / HTTP/1.1
* Request completely sent off
< HTTP/1.1 200 OK
* Connection #0 to host example.com:80 left intact
```

Ikki so'rov — **bitta** ulanish (`#0`): `left intact` — ochiq qoldirildi, `Reusing existing … connection` — ikkinchi so'rov shu ulanish orqali ketdi. Yangi TCP kelishuvi (3-bob) kerak bo'lmadi.

Holatsizlik shu yerda ham ko'rinadi: ulanish bitta bo'lsa ham, ikkinchi `GET` to'liq, **mustaqil** xabar — server birinchisini "eslab" qolishi shart emas.

### Versiyalar

```text vps
$ curl -sI --http1.1 https://example.com/ | head -1
HTTP/1.1 200 OK
$ curl -sI --http2 https://example.com/ | head -1
HTTP/2 200 
$ curl -sI https://example.com/ | grep -i '^alt-svc\|^server'
server: cloudflare
alt-svc: h3=":443"; ma=86400
```

- Bitta server HTTP/1.1 ni ham, HTTP/2 ni ham qo'llaydi; `curl` HTTPS'da standart holatda HTTP/2 ni oldi (1-bobdagi `ALPN: server accepted h2`).
- `alt-svc: h3=":443"` — server "443-portda **HTTP/3** ham bor" deb bildiryapti. `Alt-Svc` header'i 2016-yilda paydo bo'lgan kengaytmalardan biri (MDN).

```text vps
$ curl -V | grep -i '^features'
Features: alt-svc AsynchDNS brotli GSS-API HSTS HTTP2 HTTPS-proxy IDN IPv6 Kerberos Largefile libz NTLM PSL SPNEGO SSL threadsafe TLS-SRP UnixSockets zstd
$ curl -sI --http3-only https://example.com/ | head -1; echo "exit: $?"
curl: option --http3-only: the installed libcurl version does not support this
curl: try 'curl --help' or 'curl --manual' for more information
```

Ubuntu'dagi `curl` HTTP/3 siz yig'ilgan: `Features` ro'yxatida `HTTP2` bor, `HTTP3` yo'q. HTTP/3 haqida — 13-bob.

## Standartda nima deyilgan

| Hujjat | Nima |
| --- | --- |
| RFC 9110 (2022-yil iyun) | HTTP semantikasi — barcha versiyalar uchun umumiy: metodlar, holat kodlari, header'lar. 1-bo'lim: HTTP — holatsiz so'rov-javob protokollari oilasi. 3.7 — oraliq qatnashchilar (proksi, shlyuz, tunnel) |
| RFC 9111 | Keshlash (11-bob) |
| RFC 9112 | HTTP/1.1 xabar formati. 3.2 — `Host` bo'lmasa 400. C.1 — HTTP/0.9 dan farqlar |
| RFC 9113 | HTTP/2 |
| RFC 9114 | HTTP/3 |
| RFC 1945 (1996-yil may) | HTTP/1.0 — amaldagi tajribani tavsiflovchi hujjat (informational) |
| RFC 2068 (1997-yil yanvar) | HTTP/1.1 ning birinchi nashri |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| "Server so'rov yuboradi" | MDN: so'rovni doim user-agent boshlaydi | Serverdan xabar kerak bo'lsa — server-sent events, WebSocket |
| "Server meni oldingi so'rovdan eslaydi" | HTTP holatsiz | Holat cookie va sessiya orqali (14–15-boblar) |
| `Host` siz so'rov yozish (skript, `nc`) | HTTP/1.1 da majburiy — 400 | `Host: domen` ni qo'shish |
| "Bitta IP — bitta sayt" | `Host` tufayli bitta IP'da ko'p sayt | Domen nomi bilan so'rash |
| "Har so'rov — yangi ulanish" | HTTP/1.1 ulanishni qayta ishlatadi (`Reusing existing … connection`) | Ulanishni ochiq saqlash (13-bob) |
| "HTTP/2 — boshqa metodlar, boshqa header'lar" | Ma'nosi bir xil, faqat uzatish usuli boshqa (ikkilik freymlar) | Semantika — RFC 9110, hammasi uchun umumiy |
| "Brauzer va server orasida faqat ikkalasi" | Proksi, CDN, yuklama bo'luvchi bo'lishi mumkin (`server: cloudflare`) | Javob header'larini ko'rish |

## Amaliyot

1. HTTP qaysi qatlam protokoli va qaysi transportga tayanadi? Nega UDP emas?
2. "HTTP holatsiz" nimani anglatadi? Unda internet-do'kon savatchasi qanday ishlaydi?
3. HTTP/0.9 javobida nima bo'lmagan?
4. Nega `Host` siz HTTP/1.1 so'rovi 400 oladi?
5. Sinovda HTTP/1.0 va HTTP/1.1 da nechta TCP ulanish ochildi?
6. `alt-svc: h3=":443"` nimani bildiradi?

<details>
<summary>Javoblar</summary>

1. Ilova qatlami; TCP (yoki TLS ustidagi TCP). HTTP'ga ishonchli transport kerak, UDP esa yetkazishni kafolatlamaydi. (HTTP/3 — istisno: QUIC ishonchlilikni UDP ustida o'zi ta'minlaydi.)
2. Ikki so'rov orasida bog'liqlik yo'q. Savatcha cookie bilan: har so'rovga sessiya identifikatori qo'shiladi.
3. Versiya, holat qatori, header'lar — faqat fayl.
4. RFC 9112 shuni talab qiladi: bitta IP'da ko'p sayt bo'lishi mumkin, qaysi biri so'ralganini server `Host` dan biladi.
5. HTTP/1.0 — ikki so'rovga ikki ulanish; HTTP/1.1 — bitta ulanish qayta ishlatildi.
6. Server shu saytni 443-portda HTTP/3 orqali ham bera oladi.

</details>

## Rasmiy hujjat

- [MDN: Overview of HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview)
- [MDN: Evolution of HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Evolution_of_HTTP)
- [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110)
- [RFC 9112: HTTP/1.1](https://www.rfc-editor.org/rfc/rfc9112)
- [RFC 9114: HTTP/3](https://www.rfc-editor.org/rfc/rfc9114)
- [RFC 1945: HTTP/1.0](https://www.rfc-editor.org/rfc/rfc1945) · [RFC 2068: HTTP/1.1 (birinchi nashr)](https://www.rfc-editor.org/rfc/rfc2068)
- [Python: http.server (`protocol_version`)](https://docs.python.org/3/library/http.server.html)
