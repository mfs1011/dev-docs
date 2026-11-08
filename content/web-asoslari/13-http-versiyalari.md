# 13 — HTTP/1.1, HTTP/2 va HTTP/3

[Mundarija](README.md)

## Tushuncha

5-bobda versiyalar tarixini ko'rdik. Bu bobda ularning asosiy farqiga to'xtalamiz: **ulanishni qanday boshqarishi**. MDN (Connection management in HTTP/1.x): ulanishlarni ochish va saqlash sayt tezligiga juda katta ta'sir qiladi.

Barcha versiyalarda **ma'no bir xil**: metodlar, holat kodlari, header'lar o'zgarmaydi (RFC 9110). Farq — xabarlar simda qanday ko'rinishi va qanday transport ishlatilishi.

### HTTP/1.x: uch model

| Model | Qanday ishlaydi (MDN) | Muammo |
| --- | --- | --- |
| **Qisqa ulanish** (short-lived) | Har so'rovga yangi TCP ulanish, javobdan keyin yopiladi. HTTP/1.0 da standart; HTTP/1.1 da faqat `Connection: close` bilan | Har safar TCP kelishuvi (3-bob) va TLS; yangi ("sovuq") ulanish sekinroq |
| **Doimiy ulanish** (persistent, keep-alive) | Ulanish ochiq qoladi va ketma-ket so'rovlar uchun qayta ishlatiladi. HTTP/1.1 da standart | Bo'sh turgan ulanish ham server resursini band qiladi; ma'lum vaqtdan keyin yopiladi |
| **Konveyer** (pipelining) | Javobni kutmasdan bir nechta so'rov ketma-ket yuboriladi | Javoblar so'rovlar **tartibida** qaytishi shart; xato proksilar, murakkab amalga oshirish — zamonaviy brauzerlarda **o'chiq** |

**Navbat boshida tiqilish** (head-of-line blocking, HOL, MDN): HTTP/1.1 da bitta ulanishda keyingi so'rov oldingi javobni kutadi; konveyerda ham javoblar tartib bilan qaytgani uchun bitta sekin javob keyingilarini to'xtatadi.

Chetlab o'tish yo'llari: brauzer bitta domenga **bir nechta** (odatda oltitagacha) ulanish ochadi; ilgari resurslarni bir nechta domenga bo'lish (**domain sharding**: `www1.`, `www2.`…) ham qo'llangan — MDN: bu eskirgan usul, HTTP/2 da hatto zarar qiladi.

### HTTP/2: bitta ulanish, ko'p oqim

MDN (HTTP/2): asosiy maqsadlar — kechikish va HOL'ni kamaytirish, header'larni samarali siqish (HPACK).

- Xabarlar ikkilik **freym**larga bo'linadi (6-bob).
- Bitta TCP ulanishda raqamlangan **oqimlar** (streams) — so'rov va javoblar bir vaqtda, aralashib boradi: **multiplexing**. Oqim 9 oqim 7 tugashini kutmaydi.
- Oqimlarga ustuvorlik berish mumkin.
- **Server Push** (server so'ralmagan resursni oldindan yuborishi) — MDN: amalda qiyin bo'lib chiqdi, asosiy brauzerlardan olib tashlangan; o'rniga `rel="preload"` va `103 Early Hints`.

Qolgan muammo (MDN, HOL): HTTP/2 TCP ustida. Bitta TCP segmenti yo'qolsa, u qayta yuborilguncha shu ulanishdagi **barcha** oqimlar kutadi.

### HTTP/3: QUIC, UDP ustida

MDN (HTTP/3, QUIC): HTTP/3 TCP o'rniga **QUIC** dan foydalanadi. QUIC — UDP ustidagi ko'p oqimli transport protokoli:

| Muammo | TCP + TLS (HTTP/2) | QUIC (HTTP/3) |
| --- | --- | --- |
| Ulanish o'rnatish | Avval TCP kelishuvi, keyin alohida TLS kelishuvi | TLS kelishuvi QUIC kelishuvining **ichida** — kamroq xabar almashinuvi |
| Paket yo'qolishi | Butun ulanish (barcha oqimlar) kutadi | Yo'qolish har oqim uchun alohida tiklanadi — faqat shu paketdagi oqim kutadi |

**HTTP/3 qanday topiladi** (RFC 9114, 3.1): server javobida `Alt-Svc: h3=":443"` bilan "shu manzilda HTTP/3 ham bor" deb e'lon qiladi (5-bobdagi `alt-svc`). Mijoz keyingi safar QUIC ulanishni sinab ko'rishi mumkin.

## Ko'rib chiqamiz

### Doimiy ulanish: vaqt farqi

VPS'da `https://example.com/` ga 5 ta so'rov. Avval — 5 ta alohida `curl` (har biri yangi ulanish). `%{num_connects}` — shu so'rov uchun ochilgan yangi ulanishlar soni (curl qo'llanmasi):

```text vps
$ for i in 1 2 3 4 5; do curl -s --http1.1 -o /dev/null -w '%{num_connects} yangi ulanish | tls tugadi %{time_appconnect} | jami %{time_total}\n' https://example.com/; done
1 yangi ulanish | tls tugadi 0.109243 | jami 0.170454
1 yangi ulanish | tls tugadi 0.084719 | jami 0.128709
1 yangi ulanish | tls tugadi 0.088645 | jami 0.136718
1 yangi ulanish | tls tugadi 0.116616 | jami 0.171648
1 yangi ulanish | tls tugadi 0.162839 | jami 0.402505
```

Endi bitta `curl` da 5 ta URL — ulanish qayta ishlatiladi:

```text vps
$ curl -s --http1.1 -w '%{num_connects} yangi ulanish | tls tugadi %{time_appconnect} | jami %{time_total}\n' -o /dev/null -o /dev/null -o /dev/null -o /dev/null -o /dev/null https://example.com/ https://example.com/ https://example.com/ https://example.com/ https://example.com/
1 yangi ulanish | tls tugadi 0.441003 | jami 0.460117
0 yangi ulanish | tls tugadi 0.000000 | jami 0.019106
0 yangi ulanish | tls tugadi 0.000000 | jami 0.018787
0 yangi ulanish | tls tugadi 0.000000 | jami 0.017637
0 yangi ulanish | tls tugadi 0.000000 | jami 0.018065
```

- Birinchi so'rov ulanish va TLS'ni ochdi.
- Qolgan to'rttasi — `0 yangi ulanish`, TLS yo'q, har biri **~18 ms**. Alohida ulanishlarda har so'rov 130–400 ms edi: vaqtning katta qismi ulanish va TLS'ga ketgan.
- Server `Connection: keep-alive` deb javob beradi:

```text vps
$ curl -sI --http1.1 https://example.com/ | tr -d '\r' | grep -i '^connection\|^keep-alive'
Connection: keep-alive
```

(Har o'lchov vaqti tarmoqqa qarab o'zgaradi; birinchi so'rovning 441 ms i ham shu — muhimi nisbat.)

### Parallel so'rovlar: HTTP/1.1 va HTTP/2

`-Z` (`--parallel`) — curl so'rovlarni **bir vaqtda** yuboradi (qo'llanma). 5 ta parallel so'rov — nechta ulanish ochildi:

```text vps
$ curl -sv --http1.1 -Z --parallel-immediate -o /dev/null -o /dev/null -o /dev/null -o /dev/null -o /dev/null https://example.com/ https://example.com/ https://example.com/ https://example.com/ https://example.com/ 2>&1 | grep -c 'Established connection'
5
$ curl -sv --http2 -Z -o /dev/null -o /dev/null -o /dev/null -o /dev/null -o /dev/null https://example.com/ https://example.com/ https://example.com/ https://example.com/ https://example.com/ 2>&1 | grep -c 'Established connection'
1
```

- **HTTP/1.1**: bir vaqtda 5 so'rov — **5 ta** TCP+TLS ulanish (bitta ulanishda bir vaqtda faqat bitta so'rov).
- **HTTP/2**: **bitta** ulanish.

HTTP/2 da qanday:

```text vps
$ curl -sv --http2 -Z -o /dev/null -o /dev/null -o /dev/null -o /dev/null -o /dev/null https://example.com/ https://example.com/ https://example.com/ https://example.com/ https://example.com/ 2>&1 | grep -E 'OPENED stream|Multiplexed|multiplex' | sort | uniq -c
      4 * Multiplexed connection found
      4 * Waiting on connection to negotiate possible multiplexing.
      1 * [HTTP/2] [1] OPENED stream for https://example.com/
      1 * [HTTP/2] [3] OPENED stream for https://example.com/
      1 * [HTTP/2] [5] OPENED stream for https://example.com/
      1 * [HTTP/2] [7] OPENED stream for https://example.com/
      1 * [HTTP/2] [9] OPENED stream for https://example.com/
```

- To'rtta so'rov birinchi ulanish HTTP/2 ni kelishishini kutdi, keyin unga qo'shildi (`Multiplexed connection found`).
- 5 ta **oqim**: `1`, `3`, `5`, `7`, `9`. RFC 9113 (5.1.1): mijoz ochgan oqimlar **toq** raqamli bo'lishi shart (juftlari — serverniki, `0` — ulanishni boshqarish uchun).

### HTTP/3

VPS'dagi Ubuntu `curl` HTTP/3 siz (5-bob). Shuning uchun bu qism **noutbukda**: Homebrew `curl` HTTP/3 (ngtcp2, nghttp3) bilan yig'ilgan. `example.com` ga uch versiya bilan, har biri uch marta. `time_connect` — ulanish (TCP yoki QUIC) tugagan payt, `time_appconnect` — TLS tugagan payt, `time_starttransfer` — birinchi bayt:

```text tashqi
$ curl -V | head -1
curl 8.23.0 (aarch64-apple-darwin25.6.0)
--http1.1: http 1.1 | ulanish 0.040235 | tls 0.329853 | birinchi bayt 0.449578
--http1.1: http 1.1 | ulanish 0.035765 | tls 0.263399 | birinchi bayt 0.381969
--http1.1: http 1.1 | ulanish 0.082737 | tls 0.332879 | birinchi bayt 0.481787
--http2: http 2 | ulanish 0.072646 | tls 0.260450 | birinchi bayt 0.389488
--http2: http 2 | ulanish 0.044479 | tls 0.253874 | birinchi bayt 0.393212
--http2: http 2 | ulanish 0.143292 | tls 0.314798 | birinchi bayt 0.448239
--http3-only: http 3 | ulanish 0.111278 | tls 0.118982 | birinchi bayt 0.246161
--http3-only: http 3 | ulanish 0.144854 | tls 0.146935 | birinchi bayt 0.289205
--http3-only: http 3 | ulanish 0.153209 | tls 0.159376 | birinchi bayt 0.377944
```

- HTTP/1.1 va HTTP/2: TCP ulanishdan keyin TLS uchun yana **~200 ms** (`tls` − `ulanish`) — alohida bosqich.
- HTTP/3: `tls` deyarli `ulanish` bilan bir xil (farq 2–8 ms): curl QUIC ulanishni TLS bilan birga o'rnatdi (kuzatildi; MDN: QUIC TLS kelishuvini o'z kelishuviga qo'shadi).
- Natijada birinchi bayt HTTP/3 da odatda ertaroq keldi. Bu bitta tarmoqda, bitta paytdagi o'lchov — boshqa tarmoqda raqamlar boshqacha bo'ladi.

So'rov:

```text tashqi
* SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384 / X25519MLKEM768 / id-ecPublicKey
* using HTTP/3
* [HTTP/3] [0] OPENED stream for https://example.com/
* [HTTP/3] [0] [:method: GET]
< HTTP/3 200 
```

HTTP/3 da ham TLS 1.3, ham HTTP/2 dagi kabi psevdo-header'lar (`:method`) va oqimlar; oqim raqami `0` dan boshlanadi (QUIC'ning o'z raqamlashi).

## Standartda nima deyilgan

| Hujjat | Bo'lim | Gap |
| --- | --- | --- |
| RFC 9112 | 9.3 | HTTP/1.1 da doimiy ulanish — standart |
| RFC 9112 | 9.3.2 | Konveyer: server javoblarni so'rovlar kelgan **tartibda** yuborishi shart |
| RFC 9112 | 9.4 | Mijoz bitta serverga ochiq ulanishlar sonini cheklashi kerak; aniq son belgilanmagan |
| RFC 9113 (2022-yil iyun) | 5.1.1 | HTTP/2 oqimlari: mijozniki toq, serverniki juft, `0` — ulanish uchun |
| RFC 9114 (2022-yil iyun) | 3.1 | HTTP/3 `Alt-Svc` (`h3`) orqali e'lon qilinadi |
| RFC 9000 (2021-yil may) | — | QUIC transport protokoli; kriptografik kelishuv (TLS) va transport parametrlari birga |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Har so'rovga yangi ulanish ochadigan mijoz yozish | Har safar TCP+TLS (sinovda 130–400 ms vs ~18 ms) | HTTP kutubxonasida ulanishlar pulini (keep-alive) yoqish |
| HTTP/2 da domain sharding | Bitta ulanish yetadi; bo'lish zarar qiladi (MDN) | Bitta domen |
| HTTP/2 da ko'p kichik faylni birlashtirishga majburlanish | Multiplexing parallel so'rovlarni bitta ulanishda ko'taradi | Keshlash va o'lchamni hisobga olib, kerakli darajada bo'lish |
| Server Push'ga tayanish | Asosiy brauzerlardan olib tashlangan (MDN) | `rel="preload"`, `103 Early Hints` |
| "HTTP/3 — boshqa API" | Ma'no bir xil; faqat transport boshqa | Ilova kodi o'zgarmaydi |
| UDP 443 ni xavfsizlik devorida yopib qo'yish va HTTP/3 kutish | QUIC UDP ustida | UDP 443 ochiq bo'lishi kerak; aks holda mijoz HTTP/2 ga qaytadi |

## Amaliyot

1. HTTP/1.x dagi uch ulanish modelini ayting. Qaysi biri HTTP/1.1 da standart?
2. Nega konveyer (pipelining) brauzerlarda o'chiq?
3. HTTP/2 multiplexing nimani hal qildi va nimani hal qilmadi?
4. Sinovda HTTP/1.1 va HTTP/2 parallel 5 so'rov uchun nechta ulanish ochdi?
5. HTTP/2 oqim raqamlari nega `1, 3, 5, 7, 9`?
6. QUIC TCP+TLS'dan nimasi bilan tezroq ulanadi?

<details>
<summary>Javoblar</summary>

1. Qisqa ulanish, doimiy ulanish, konveyer. HTTP/1.1 da — doimiy.
2. Xato proksilar, amalga oshirish murakkab, HOL — javoblar tartib bilan qaytadi (MDN).
3. Bitta ulanishda parallel so'rovlar — ilova darajasidagi HOL'ni yo'qotdi. TCP darajasidagi HOL qoldi: yo'qolgan segment barcha oqimlarni to'xtatadi.
4. HTTP/1.1 — 5 ta, HTTP/2 — 1 ta.
5. Mijoz ochgan oqimlar toq bo'lishi shart (RFC 9113, 5.1.1).
6. TLS kelishuvi QUIC kelishuvining ichida — alohida bosqich yo'q (sinovda `tls` ≈ `ulanish`).

</details>

## Rasmiy hujjat

- [MDN: Connection management in HTTP/1.x](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Connection_management_in_HTTP_1.x)
- [MDN: HTTP/2](https://developer.mozilla.org/en-US/docs/Glossary/HTTP_2) · [HTTP/3](https://developer.mozilla.org/en-US/docs/Glossary/HTTP_3) · [QUIC](https://developer.mozilla.org/en-US/docs/Glossary/QUIC) · [Head-of-line blocking](https://developer.mozilla.org/en-US/docs/Glossary/Head_of_line_blocking)
- [RFC 9112 §9: Connection Management](https://www.rfc-editor.org/rfc/rfc9112#name-connection-management)
- [RFC 9113: HTTP/2](https://www.rfc-editor.org/rfc/rfc9113)
- [RFC 9114: HTTP/3](https://www.rfc-editor.org/rfc/rfc9114)
- [RFC 9000: QUIC](https://www.rfc-editor.org/rfc/rfc9000)
- [curl qo'llanmasi: `-Z`, `--http3-only`, `-w`](https://curl.se/docs/manpage.html)
