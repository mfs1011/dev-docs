# 01 — Veb qanday ishlaydi

[Mundarija](README.md)

## Tushuncha

Brauzer manzil satriga `https://example.com` yozib, Enter bosasiz — bir lahzadan keyin sahifa ochiladi. Bu bobda shu lahza ichida nima bo'lishini **umumiy** ko'ramiz. Har bosqich keyingi boblarda alohida, chuqur ochiladi.

### Mijoz va server

MDN (How the web works): internetga ulangan kompyuterlar ikki rolda bo'ladi:

| Rol | Nima | Misol |
| --- | --- | --- |
| **Mijoz** (client) | Foydalanuvchining internetga ulangan qurilmasi va undagi vebga kiradigan dastur | Telefon yoki kompyuter, unda brauzer (Firefox, Chrome) |
| **Server** | Veb-sahifalar, saytlar yoki ilovalarni saqlaydigan kompyuter | Sayt joylashgan mashina |

Mijoz **so'rov** (request) yuboradi, server **javob** (response) qaytaradi. Sahifa kodi serverdan mijozga nusxa bo'lib yuklanadi va brauzer uni chizadi.

### Yo'ldagi qismlar

MDN o'xshatishi: internet — yo'l; bir uchida mijoz (uyingiz), boshqa uchida server (do'kon). Ma'lumot borib-kelishi uchun:

| Qism | Vazifasi | O'xshatishda | Bob |
| --- | --- | --- | --- |
| Internet ulanishi | Ma'lumot yuborish va qabul qilish | Uy va do'kon orasidagi ko'cha | — |
| **TCP/IP** | Ma'lumot internet bo'ylab qanday yurishini belgilaydigan protokollar | Buyurtma berib, do'konga borib, mol olishga imkon beruvchi transport | 3 |
| **DNS** (Domain Name System) | Sayt nomini haqiqiy manzilga — **IP manzil**ga — aylantiradigan "manzillar kitobi" | Do'konning aniq manzilini topish | 4 |
| **HTTP** | Mijoz va server bir-biri bilan gaplashadigan til — protokol | Mol buyurtma qilishda ishlatiladigan til | 5–13 |
| Fayllar | Sayt tarkibi: **kod** (HTML, CSS, JavaScript) va **asset**lar (rasm, video, PDF…) | Do'kondan olinadigan mollar | — |

Ulardan tashqari, `https://` manzillarida ulanish **shifrlanadi** — **TLS** (Transport Layer Security), 25-bob.

### Aniq nima bo'ladi

MDN qadamlari:

1. Brauzer **DNS** serveriga murojaat qilib, sayt joylashgan serverning haqiqiy manzilini topadi.
2. Brauzer serverga **HTTP so'rovi** yuboradi — sayt nusxasini so'raydi. Bu so'rov va mijoz bilan server orasidagi boshqa barcha ma'lumot internet ulanishi orqali **TCP/IP** bilan yuboriladi.
3. Server so'rovni qabul qilsa, **"200 OK"** javobini yuboradi va sayt fayllarini kichik bo'laklar — **paket**lar ko'rinishida jo'nata boshlaydi.
4. Brauzer bo'laklarni yig'ib, to'liq sahifani ko'rsatadi.

**Paketlar** (MDN): ma'lumot kichik bo'laklarda yuboriladi; har paketda **sarlavha** (server va mijoz IP manzili, paket raqami, protokollar haqida) va **yuk** (payload — haqiqiy ma'lumot). Sabablari: paket yo'qolsa yoki buzilsa — butun faylni emas, faqat shu paketni qayta so'rash tezroq; paketlar turli yo'llardan borib, tarmoqni samaraliroq ishlatadi.

### Brauzer sahifani yig'adi

MDN (How browsers load websites): sahifaga o'tganda **bir nechta** HTTP so'rovi yuboriladi. Avval HTML keladi. Brauzer uni tahlil qilib (parse), daraxt ko'rinishidagi tuzilmaga — **DOM** (Document Object Model) ga aylantiradi. HTML'dagi ba'zi elementlar **yangi so'rovlar** chaqiradi:

- `<link>` — tashqi CSS fayllari;
- `<script>` — tashqi JavaScript fayllari;
- `<img>`, `<video>`, `<audio>` — media fayllar.

Keyin CSS qo'llanadi: sahifa joylashadi (layout) va ekranga chiziladi (painting).

### Veb-server

MDN (What is a web server?): "veb-server" deganda **apparat**, **dastur** yoki ikkalasi tushuniladi. Dastur tomonida kamida **HTTP server** — URL va HTTP'ni tushunadigan dastur. Ikki tur:

| Tur | Nima | Javob |
| --- | --- | --- |
| **Statik** | Kompyuter + HTTP server | Fayllarni **o'zgartirmasdan** yuboradi |
| **Dinamik** | Statik server + **ilova serveri** va odatda **baza** | Javobni yuborishdan oldin **yasaydi** (masalan, HTML shablonni bazadagi ma'lumot bilan to'ldiradi) |

## Ko'rib chiqamiz

### Bitta so'rovning bosqichlari

Serverda (VPS) `curl` — buyruq satridagi HTTP mijozi. `-w` bilan u har bosqich qachon tugaganini yozadi (`curl` qo'llanmasi: `time_namelookup` — nom aniqlangan payt, `time_connect` — TCP ulanish tugagan payt, `time_appconnect` — TLS kelishuvi tugagan payt, `time_starttransfer` — birinchi bayt kelgan payt; hammasi so'rov boshidan, soniyalarda):

```text vps
$ curl --version | head -1
curl 8.18.0 (x86_64-pc-linux-gnu) libcurl/8.18.0 OpenSSL/3.5.5 zlib/1.3.1 brotli/1.2.0 zstd/1.5.7 libidn2/2.3.8 libpsl/0.21.2 libssh2/1.11.1 nghttp2/1.68.0 librtmp/2.3 mit-krb5/1.22.1 OpenLDAP/2.6.10
$ curl -sS -o /dev/null -w 'dns: %{time_namelookup}\ntcp: %{time_connect}\ntls: %{time_appconnect}\nbirinchi bayt: %{time_starttransfer}\njami: %{time_total}\nip: %{remote_ip}\nhttp: %{http_version} %{response_code}\nhajm: %{size_download}\n' https://example.com/
dns: 0.005166
tcp: 0.007364
tls: 0.049467
birinchi bayt: 0.064853
jami: 0.065024
ip: 8.47.69.0
http: 2 200
hajm: 577
```

| Bosqich | Qachon tugadi | O'zi qancha davom etdi |
| --- | --- | --- |
| DNS: `example.com` → IP | 5 ms | 5 ms |
| TCP ulanish | 7 ms | 2 ms |
| TLS kelishuvi (shifrlash) | 49 ms | 42 ms |
| So'rov va javobning birinchi bayti | 65 ms | 15 ms |

- `ip: 8.47.69.0` — DNS topgan manzil.
- `http: 2 200` — HTTP/2, javob kodi **200**.
- `hajm: 577` — sahifa 577 bayt.
- Eng uzun bosqich — TLS: shifrlangan ulanish uchun mijoz va server bir necha marta xabar almashadi (25-bob).

Xuddi shu so'rov `-v` (batafsil) bilan, asosiy qatorlar:

```text vps
$ curl -v -o /dev/null https://example.com/ 2>&1 | grep -E '^\* (Host|  Trying|Connected|SSL connection|ALPN)|^> (GET|Host)|^< HTTP|^< content-type' 
*   Trying [2a06:98c1:3123:8000::]:443...
*   Trying 8.47.69.0:443...
* ALPN: curl offers h2,http/1.1
* SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384 / X25519MLKEM768 / id-ecPublicKey
* ALPN: server accepted h2
> GET / HTTP/2
> Host: example.com
< HTTP/2 200 
< content-type: text/html; charset=utf-8
```

- `Trying [2a06:…]:443` va `Trying 8.47.69.0:443` — DNS ikki xil manzil berdi: IPv6 va IPv4 (3-bob); `443` — HTTPS porti.
- `SSL connection using TLSv1.3` — shifrlangan ulanish o'rnatildi.
- `>` bilan boshlangan qatorlar — **so'rov**: `GET /` va `Host: example.com`.
- `<` bilan boshlanganlar — **javob**: `HTTP/2 200` va `content-type: text/html` (bu HTML sahifa).

### Brauzer: bitta sahifa — bir nechta so'rov

Lokal kompyuterda kichik sahifa:

```html
<!doctype html>
<html lang="uz">
<head>
  <meta charset="utf-8">
  <title>Salom</title>
  <link rel="stylesheet" href="uslub.css">
</head>
<body>
  <h1>Salom, veb!</h1>
  <img src="logo.svg" alt="logo">
  <script src="ilova.js"></script>
</body>
</html>
```

`python3 -m http.server` bilan berilib, Chromium'da (Playwright orqali) ochildi; brauzer yuborgan so'rovlar va natija:

```text tashqi
GET 200 document   /
GET 200 stylesheet /uslub.css
GET 200 image      /logo.svg
GET 200 script     /ilova.js
h1: Salom, veb! (JS ishladi)
```

- Avval **HTML** (`document`) — bitta so'rov.
- HTML'ni o'qib, brauzer undagi `<link>`, `<img>`, `<script>` uchun yana **uchta** so'rov yubordi.
- `ilova.js` ishladi — sarlavhaga matn qo'shdi: brauzer kodni nafaqat yukladi, balki **bajardi** ham.

Haqiqiy saytlarda bu son o'nlab va yuzlab bo'ladi — sahifa tezligi ko'p jihatdan shunga bog'liq (11-bob: keshlash).

## Standartda nima deyilgan

Bu bob — umumiy ko'rinish; har qism o'z standartiga ega va keyingi boblarda o'sha standart bilan ochiladi:

| Qism | Standart | Bob |
| --- | --- | --- |
| URL | WHATWG URL Standard, RFC 3986 | 2 |
| DNS | RFC 1034, RFC 1035 | 4 |
| HTTP | RFC 9110 (semantika), 9112 (HTTP/1.1), 9113 (HTTP/2), 9114 (HTTP/3) | 5–13 |
| TLS | RFC 9846 (TLS 1.3) | 25 |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| "Sayt — bitta fayl" | Sahifa bir nechta so'rov bilan yig'iladi (sinovda 4 ta) | HTML + CSS + JS + rasmlar — har biri alohida so'rov |
| "Domen — server manzili" | Domen — nom; manzil — IP, uni DNS topadi | 4-bob |
| "Sekin sayt — sekin server" | Vaqt DNS, ulanish, TLS, server javobi va resurslar orasida bo'linadi (sinovda TLS eng uzuni) | `curl -w` bilan bosqichlarni o'lchash |
| "Veb-server — faqat kompyuter" | MDN: apparat, dastur yoki ikkalasi | Kontekstga qarab |

## Amaliyot

1. Mijoz va server nima? Brauzer qaysi rolda?
2. DNS nimani nimaga aylantiradi?
3. Statik va dinamik veb-server farqi nima?
4. Sinovdagi sahifa uchun brauzer nechta so'rov yubordi va nega?
5. `curl -w` natijasida qaysi bosqich eng ko'p vaqt oldi?

<details>
<summary>Javoblar</summary>

1. Mijoz — so'rov yuboradigan qurilma va dastur; server — sahifalarni saqlaydigan va javob qaytaradigan kompyuter. Brauzer — mijoz.
2. Sayt nomini (domen) serverning IP manziliga.
3. Statik fayllarni o'zgartirmasdan yuboradi; dinamik javobni ilova serveri va baza yordamida yasaydi.
4. To'rtta: HTML, keyin undagi CSS, rasm va JS uchun.
5. TLS kelishuvi (~42 ms).

</details>

## Rasmiy hujjat

- [MDN: How the web works](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works)
- [MDN: How browsers load websites](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_browsers_load_websites)
- [MDN: What is a web server?](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_web_server)
- [curl qo'llanmasi: `-w`, `--write-out`](https://curl.se/docs/manpage.html#-w)
