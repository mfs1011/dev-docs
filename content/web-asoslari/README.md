# Web asoslari — sayt qanday ishlaydi

Bu qo'llanma brauzer manzilini kiritgandan sahifa ochilguncha nima bo'lishini tushuntiradi: URL, domen va DNS, IP va port, HTTP so'rovi va javobi, holat kodlari, keshlash, cookie va sessiya, brauzer xavfsizligi (same-origin, CORS, CSRF, XSS) va HTTPS. Bu frontend va backend kitoblari tayanadigan umumiy poydevor.

Mundarija veb standartlariga (IETF RFC'lari, WHATWG standartlari) va ularni tushuntiruvchi MDN Web Docs (Mozilla) tuzilmasiga solishtirib tuzilgan. Har bob yonida u tayanadigan sahifalar ko'rsatilgan. Har bobni yozishdan oldin shu sahifalar qayta o'qiladi. Misollar real muhitda ishga tushirilib tekshiriladi, chiqishlar haqiqiy.

Manbalar va versiyalar (2026-11-07 da tekshirilgan):

| Narsa | Versiya | Qayerdan olindi |
| --- | --- | --- |
| HTTP | RFC 9110 (semantika), RFC 9111 (keshlash), RFC 9112 (HTTP/1.1), RFC 9113 (HTTP/2), RFC 9114 (HTTP/3) — 2022-yil iyun | <https://www.rfc-editor.org/rfc/rfc9110> |
| QUIC | RFC 9000 — 2021-yil may | <https://www.rfc-editor.org/rfc/rfc9000> |
| TLS 1.3 | RFC 9846 — 2026-yil iyul; RFC 8446 o'rnini egallagan | <https://www.rfc-editor.org/rfc/rfc9846> |
| Cookie | RFC 6265 — 2011-yil aprel. `SameSite` kabi yangi atributlar uning yangi tahririda (RFC 6265bis), u hali qoralama | <https://www.rfc-editor.org/rfc/rfc6265> · <https://datatracker.ietf.org/doc/draft-ietf-httpbis-rfc6265bis/> |
| DNS | RFC 1034, RFC 1035 — 1987-yil noyabr | <https://www.rfc-editor.org/rfc/rfc1034> |
| URL | WHATWG URL Standard (brauzerlar shunga amal qiladi); RFC 3986 | <https://url.spec.whatwg.org/> · <https://www.rfc-editor.org/rfc/rfc3986> |
| CORS | WHATWG Fetch Standard | <https://fetch.spec.whatwg.org/> |
| HSTS | RFC 6797 — 2012-yil noyabr | <https://www.rfc-editor.org/rfc/rfc6797> |
| MDN Web Docs | 2026-11-07 holati | <https://developer.mozilla.org/en-US/docs/Web/HTTP> |
| VPS vositalari | curl 8.18.0, OpenSSL 3.5.5, dig (BIND 9.20.24) | VPS: `apt-cache policy curl openssl bind9-dnsutils` |

Muhit tanlovi haqida:

- **Standart va MDN.** Rasmiy asos — standartlarning o'zi (RFC, WHATWG). Ular uzun va texnik, shuning uchun tushuntirishda MDN'ga tayaniladi. MDN — Mozilla'ga tegishli ochiq loyiha, uni Mozilla jamoasi ko'ngillilar va hamkorlar bilan birga yuritadi. Har bobda ikkalasiga ham havola bor.
- **Ikki muhit.** Serverdagi tomon (`curl -v`, `dig`, `openssl s_client`, kichik test server) VPS'da ko'rsatiladi. Brauzerdagi tomon (cookie, CORS xatosi, Network paneli) Chromium'da Playwright bilan sinaladi. Chiqishlar — brauzerning haqiqiy konsol va tarmoq ma'lumotlari.

Qisqartmalar:

- **MDN** — MDN Web Docs (developer.mozilla.org).
- **RFC** — IETF standartlari (rfc-editor.org).
- **WHATWG** — brauzer standartlari (Fetch, URL, HTML).

"Muhit" ustunida:

- **V** — VPS'da: `curl`, `dig`, `openssl` va test server.
- **B** — brauzerda (Chromium, Playwright bilan).
- **B+V** — ikkalasida.
- **—** — tushuncha bobi, buyruqsiz.

⚑ belgisi: bobdagi har bir buyruq rasmiy manbadan olingan, lekin tekshirish ketma-ketligi sinalgan amaliyot, rasmiy hujjatda bitta joyda yozilmagan.

Bu qo'llanmaga kirmaydigan mavzular:

- IP manzil, marshrut, `ss` va server tarmog'i — **"Linux"** kitobida (IX qism).
- nginx'da HTTPS'ni sozlash va sertifikat olish — **"Nginx va HTTPS"** kitobida.
- Frontend framework'larda so'rov yuborish — framework kitoblarida.

> **Holat.** Qo'llanma yozilmoqda: 21/30 bob tayyor. Havolasi borlari — tayyor boblar.

---

## Har bobning skeleti

- **Tushuncha** — mavzu nima, oddiy so'zlar bilan. Qiyin joy animatsiya bilan.
- **Ko'rib chiqamiz** — `curl -v`, `dig` yoki brauzer Network panelidagi **haqiqiy** so'rov va javob.
- **Standartda nima deyilgan** — tegishli RFC yoki WHATWG bo'limi qisqacha.
- **Tipik xatolar** — xato → nega yomon → to'g'ri yo'l.
- **Amaliyot** — savollar va javoblar.
- **Rasmiy hujjat** — bob tayangan sahifalar.

---

## I qism — Internet va veb (1–4)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 01 | [Veb qanday ishlaydi](01-veb-qanday-ishlaydi.md) | Mijoz (brauzer) va server. Manzil kiritilgandan sahifa chizilguncha: DNS → ulanish → TLS → HTTP → sahifani yig'ish | — | [MDN How the web works](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works) · [MDN How browsers load websites](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_browsers_load_websites) · [MDN What is a web server?](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_web_server) |
| 02 | [URL](02-url.md) | Sxema, xost, port, yo'l, so'rov qatori (query), fragment. Maxsus belgilarni kodlash. Origin — sxema, xost va port uchligi | B+V | [MDN What is a URL?](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_URL) · [MDN Origin](https://developer.mozilla.org/en-US/docs/Glossary/Origin) · [WHATWG URL Standard](https://url.spec.whatwg.org/) |
| 03 | [IP, port va TCP](03-ip-port-tcp.md) | IP manzil (IPv4, IPv6), port, TCP ulanish. Internet tarmoqlar tarmog'i sifatida | V | [MDN How does the Internet work?](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/How_does_the_Internet_work) · [MDN IP Address](https://developer.mozilla.org/en-US/docs/Glossary/IP_Address) · [MDN Port](https://developer.mozilla.org/en-US/docs/Glossary/Port) · [MDN TCP](https://developer.mozilla.org/en-US/docs/Glossary/TCP) |
| 04 | [Domen va DNS](04-domen-dns.md) | Domen nomining tuzilishi. DNS nomni IP'ga qanday aylantiradi. Yozuv turlari (A, AAAA, CNAME, MX, TXT, NS) va TTL. `dig` bilan ko'rish | V | [MDN What is a Domain Name?](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_domain_name) · [MDN DNS](https://developer.mozilla.org/en-US/docs/Glossary/DNS) · [RFC 1034](https://www.rfc-editor.org/rfc/rfc1034) · [RFC 1035](https://www.rfc-editor.org/rfc/rfc1035) |

## II qism — HTTP (5–13)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 05 | [HTTP'ga umumiy nazar](05-http-umumiy.md) | So'rov va javob. HTTP holatni eslab qolmaydi (stateless). HTTP versiyalarining tarixi | V | [MDN Overview of HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview) · [MDN Evolution of HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Evolution_of_HTTP) · [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110) |
| 06 | [HTTP xabarlari](06-http-xabarlari.md) | So'rov qatori, header'lar, tana (body). Javobning holat qatori. `curl -v` bilan ko'rish | V | [MDN HTTP messages](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Messages) · [MDN A typical HTTP session](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Session) · [RFC 9112](https://www.rfc-editor.org/rfc/rfc9112) |
| 07 | [Metodlar](07-metodlar.md) | `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`. Xavfsiz (safe) va idempotent (necha marta yuborilsa ham natija bir xil) metodlar | V | [MDN HTTP request methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods) · [RFC 9110 §9](https://www.rfc-editor.org/rfc/rfc9110#name-methods) |
| 08 | [Holat kodlari](08-holat-kodlari.md) | 1xx–5xx guruhlari va eng ko'p uchraydiganlari: 200, 201, 204, 304, 400, 401, 403, 404, 409, 429, 500, 502, 503, 504 | V | [MDN HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status) · [RFC 9110 §15](https://www.rfc-editor.org/rfc/rfc9110#name-status-codes) · [RFC 6585](https://www.rfc-editor.org/rfc/rfc6585) |
| 09 | [Header'lar va kontent turi](09-headerlar-kontent-turi.md) | `Content-Type` va MIME turlari, `Content-Length`. Mijoz va server qaysi formatni tanlashi (content negotiation) | V | [MDN HTTP headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers) · [MDN MIME types](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types) · [MDN Content negotiation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Content_negotiation) |
| 10 | [Redirect'lar](10-redirectlar.md) | 301, 302, 303, 307, 308 farqi. `Location` header'i | B+V | [MDN Redirections in HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Redirections) · [RFC 9110 §15.4](https://www.rfc-editor.org/rfc/rfc9110#name-redirection-3xx) |
| 11 | [HTTP keshlash](11-http-keshlash.md) | `Cache-Control` (`max-age`, `no-cache`, `no-store`). `ETag` va `Last-Modified`. Shartli so'rov va 304 javobi | B+V | [MDN HTTP caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching) · [MDN HTTP conditional requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Conditional_requests) · [RFC 9111](https://www.rfc-editor.org/rfc/rfc9111) |
| 12 | [Siqish va qismli yuklash](12-siqish-qismli-yuklash.md) | `Accept-Encoding` va `Content-Encoding`. Faylning bir qismini so'rash (`Range`, 206) | V | [MDN Compression in HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Compression) · [MDN HTTP range requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Range_requests) |
| 13 | [HTTP/1.1, HTTP/2 va HTTP/3](13-http-versiyalari.md) | Ulanishni qayta ishlatish (keep-alive). HTTP/2 da bitta ulanishda parallel so'rovlar. HTTP/3 va QUIC (UDP ustida) | V | [MDN Connection management in HTTP/1.x](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Connection_management_in_HTTP_1.x) · [RFC 9113](https://www.rfc-editor.org/rfc/rfc9113) · [RFC 9114](https://www.rfc-editor.org/rfc/rfc9114) · [RFC 9000](https://www.rfc-editor.org/rfc/rfc9000) |

## III qism — Holat va kirish (14–17)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 14 | [Cookie](14-cookie.md) | `Set-Cookie` va `Cookie`. Atributlar: `Expires`/`Max-Age`, `Domain`, `Path`, `Secure`, `HttpOnly`, `SameSite` | B+V | [MDN Using HTTP cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies) · [MDN Secure cookie configuration](https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/Cookies) · [RFC 6265](https://www.rfc-editor.org/rfc/rfc6265) |
| 15 | [Sessiya](15-sessiya.md) | Serverdagi sessiya va cookie'dagi uning identifikatori. Sessiyani xavfsiz boshqarish | B+V | [MDN Session management](https://developer.mozilla.org/en-US/docs/Web/Security/Authentication/Session_management) |
| 16 | [HTTP autentifikatsiyasi](16-http-autentifikatsiya.md) | `Authorization` header'i. Basic va Bearer token. 401 javobi va `WWW-Authenticate` | V | [MDN HTTP authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Authentication) · [RFC 9110 §11](https://www.rfc-editor.org/rfc/rfc9110#name-http-authentication) · [RFC 6750](https://www.rfc-editor.org/rfc/rfc6750) |
| 17 | [Parol, bir martalik kod va passkey](17-parol-otp-passkey.md) | Foydalanuvchini tanish usullari va har birining zaif tomoni | B+V | [MDN Passwords](https://developer.mozilla.org/en-US/docs/Web/Security/Authentication/Passwords) · [MDN One-time passwords](https://developer.mozilla.org/en-US/docs/Web/Security/Authentication/OTP) · [MDN Passkeys](https://developer.mozilla.org/en-US/docs/Web/Security/Authentication/Passkeys) |

## IV qism — Brauzer xavfsizligi (18–24)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 18 | [Same-origin siyosati](18-same-origin.md) | Sahifa boshqa origin'dagi ma'lumotni nega o'qiy olmaydi. Nima mumkin va nima mumkin emas | B | [MDN Same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Same-origin_policy) |
| 19 | [CORS](19-cors.md) | Server boshqa origin'ga ruxsat beradi: `Access-Control-Allow-Origin`. Oldindan tekshiruv so'rovi (preflight, `OPTIONS`). Cookie bilan so'rov (credentials). Konsoldagi CORS xatosini o'qish | B+V | [MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS) · [MDN CORS configuration](https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/CORS) · [WHATWG Fetch → CORS protocol](https://fetch.spec.whatwg.org/#http-cors-protocol) |
| 20 | [CSRF](20-csrf.md) | Foydalanuvchi nomidan soxta so'rov. Himoya: `SameSite` cookie, CSRF token | B | [MDN CSRF](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/CSRF) |
| 21 | [XSS va CSP](21-xss-csp.md) | Sahifaga begona skript kiritish (XSS). `Content-Security-Policy` bilan cheklash | B | [MDN XSS](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS) · [MDN CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP) |
| 22 | Clickjacking va himoya header'lari | Sahifani ko'rinmas freym ichiga olish. `frame-ancestors`, `Referrer-Policy`, `X-Content-Type-Options` | B+V | [MDN Clickjacking](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/Clickjacking) · [MDN Referrer policy configuration](https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/Referrer_policy) · [MDN MIME type verification](https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/MIME_types) |
| 23 | Aralash kontent va xavfsiz kontekst | HTTPS sahifadagi HTTP resurs. Faqat HTTPS'da ishlaydigan brauzer imkoniyatlari | B | [MDN Mixed content](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Mixed_content) · [MDN Secure contexts](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Secure_Contexts) |
| 24 | Subresource Integrity | Boshqa saytdan (CDN) yuklangan skript o'zgartirilmaganini `integrity` bilan tekshirish | B | [MDN Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Subresource_Integrity) |

## V qism — HTTPS (25–28)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 25 | TLS nima beradi | Shifrlash, server haqiqiyligini tekshirish, ma'lumot o'zgarmaganini kafolatlash. TLS 1.3 da ulanish qanday o'rnatiladi (handshake) | V | [MDN Transport Layer Security](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Transport_Layer_Security) · [RFC 9846](https://www.rfc-editor.org/rfc/rfc9846) |
| 26 | Sertifikatlar | Sertifikat va tasdiqlovchi markaz (CA), sertifikatlar zanjiri, domen nomi mosligi. `openssl s_client` bilan ko'rish. Certificate Transparency | V | [MDN TLS configuration](https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/TLS) · [MDN Certificate Transparency](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Certificate_Transparency) |
| 27 | HSTS | `Strict-Transport-Security`: brauzer saytga keyingi safar faqat HTTPS orqali kiradi | B+V | [MDN Strict-Transport-Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security) · [RFC 6797](https://www.rfc-editor.org/rfc/rfc6797) |
| 28 | O'rtadagi odam hujumi | Tarmoq yo'lidagi kimdir so'rovni o'qishi yoki o'zgartirishi (MITM). HTTPS bunga qanday to'sqinlik qiladi | — | [MDN Manipulator in the Middle](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/MITM) |

## VI qism — Amaliyot (29–30)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 29 | Brauzerning Network paneli | So'rovlar ro'yxati, header'lar, vaqt diagrammasi (waterfall), kesh, so'rovni qayta yuborish | B | [Chrome DevTools: Network](https://developer.chrome.com/docs/devtools/network) · [Firefox: Network Monitor](https://firefox-source-docs.mozilla.org/devtools-user/network_monitor/) |
| 30 | ⚑ Sayt ochilmayapti | Bosqichma-bosqich: DNS → port va ulanish → TLS → HTTP holat kodi → brauzer konsoli (CORS, aralash kontent) | B+V | Oldingi boblardagi manbalar |

---

## Animatsiyalar (qiyin tushunchalar)

| Bob | Nimani ko'rsatadi |
| --- | --- |
| 01 | Manzil kiritilgandan sahifa chizilguncha: DNS, TCP, TLS, HTTP qadamlari |
| 04 | DNS so'rovi: rezolver → ildiz server → `.uz` serveri → domen serveri |
| 11 | Kesh: birinchi so'rov, `max-age` ichida, muddat o'tgach shartli so'rov va 304 |
| 19 | CORS: oddiy so'rov va preflight bilan so'rov |
| 20 | CSRF: boshqa saytdagi forma foydalanuvchi cookie'si bilan so'rov yuboradi |
