# "Paket yo'li" — protokollar paketma-paket (reja)

Holat: **reja** (2026-11-18). Umumiy dvigatel, dizayn, ovoz va testlar — [README.md](README.md). Bu yerda faqat shu
vizualizatorga xos narsalar.

Namuna — Protocol Explorer (README 1.1). Bizning versiyaning asosiy farqlari:

1. **Har paket haqiqiy.** Paketlar VPS'dagi izolyatsiyalangan laboratoriyada `tcpdump` bilan yozib olinadi,
   `tshark` bilan ochiladi. Namunada baytlar dastur ichida "yasalgan", bizda ular haqiqiy yozuvdan olinadi.
2. **Ovoz.** Har qadam o'zbekcha o'qiladi, paket ovoz aytgan paytda yuradi.
3. **Kitoblar bilan bog'liq.** Har dars Web asoslari, Nginx, Server xavfsizligi, SQL, Redis, RabbitMQ, Kafka boblariga
   ulanadi. Bizda namunada yo'q protokollar ham bor: PostgreSQL, Redis, AMQP, Kafka.
4. **Yozuvni yuklab olish.** Har darsning `.pcap` fayli — o'quvchi uni o'z Wireshark'ida ochib, o'zi tekshira oladi.
5. **Shifrlangan qismni "kalit bilan ochish".** TLS darsida shifrlangan yozuv avval baytlar bo'lib ko'rinadi. Tugma bosilsa,
   o'sha yozuvda saqlangan kalit (`SSLKEYLOGFILE`) bilan ichidagi HTTP ko'rinadi.

Sahifa: `/paketlar` (ro'yxat), `/paketlar/<protokol>/<qadam>?k=ketma&p=6`.

---

## 1. Ekran

### 1.1. Joylashuv (README 3.4 qobig'i)

| Joy | Tarkib |
| --- | --- |
| Sahna ustida | **qatlam ko'rsatkichi** — joriy protokolning qatlami (9-bo'lim, 1-savol) + ko'rinish almashtirgichi **Tarmoq / Ketma-ketlik** |
| Chap | protokollar ro'yxati: filtr **Hammasi · Web · Server · Ma'lumot · Xavfsizlik** (soni bilan); protokol ochilsa — qadamlari (raqam doirasi, o'tilgani ✓, joriysi `--accent`). Progress: "HTTPS 4/6" |
| Markaz | sahna (Tarmoq yoki Ketma-ketlik) yoki **paket inspektori** (qator bosilganda sahna o'rnida) |
| O'ng | ijrodan oldin — **Protokol haqida** (izoh + faktlar: qatlam, port, transport, format, standart (RFC havolasi bilan), bog'liq bob). Ijroda — **Qadam kartasi** (README 4.2): nishon, "2 / 5", sarlavha, matn, joriy paket kartasi, faktlar, "nima o'zgardi" |
| Pastda | **Paketlar jadvali** + ijro paneli (README `IjroPanel.vue`) |

### 1.2. Tarmoq ko'rinishi

- Tugunlar (README 3.3 uslubi):
  - **uy tarmog'i:** noutbuk, router;
  - **internet:** bulut tugun;
  - **serverlar:** DNS rezolver, root, TLD, domen serveri, veb-server, proxy, baza, broker.
- Har tugunda nom va mono shriftda manzil (`192.168.1.10`, `203.0.113.10:443`).
- **Kamera:** har qadam `kamera: [tugunlar]` beradi, ramka silliq o'tadi. Mobilda faqat shu tugunlar ko'rinadi,
  qolganlari xira.
- **Paket** — chiziq bo'ylab yuradigan kapsula:
  - rangli chap chegara (README 3.2), yorliq ("DNS SO'ROVI"), 1–2 qator mazmun ("A? sayt.test");
  - shifrlangan bo'lsa qulf belgisi va xira mazmun.
- **Tugun holati teglari:** "kalit hisoblandi", "sertifikat tekshirildi ✓", "keshda bor", "ulanish ochiq".
- 1-qadamda manzil satriga matn yozilishi (namunadagi `type-url`) — bizda `tur: 'yozish'` hodisasi.

### 1.3. Ketma-ketlik ko'rinishi

- Vertikal hayot chiziqlari (har ishtirokchi uchun bitta), tepada nom va manzil.
- Chap chetda **qadam chegaralari** ("2-qadam · DNS") va **haqiqiy vaqt** (yozuvdan, `0.012 s`).
- Strelka qiyaligi vaqtga mutanosib. Natijada kechikish ko'rinib turadi: uzoq server — qiya strelka.
- Holat chiplari chiziq ustida: "UMUMIY KALIT HISOBLANDI", "ZANJIR ISHONCHLI ILDIZGA OLIB BORADI".
- Joriy paket ajralib turadi. Strelkani bosish = jadval qatorini bosish (inspektor ochiladi).

### 1.4. Paketlar jadvali

| Ustun | Manba |
| --- | --- |
| № | yozuvdagi tartib |
| Vaqt | birinchi paketdan beri, `0.000 s` (tshark `frame.time_relative`) |
| Kimdan / Kimga | IP (port — "Ma'lumot" ustunida) |
| Protokol | tshark eng yuqori qatlam nomi |
| Ma'lumot | tshark `_ws.col.Info`, o'zgarishsiz |
| Hajm | `frame.len` |

- Qatorlar paket "jo'natilganda" paydo bo'ladi. Joriysi ajratiladi. Rang nuqtasi paket turida.
- **"Hamma paketlar" almashtirgichi.** Standart holatda faqat darsga kerakli paketlar ko'rinadi. Yoqilsa, yozuvdagi
  hammasi (ma'lumot ACK'lari, takrorlar) xira ko'rinadi. Namunada faqat "Data ACKs not shown" yozuvi bor edi, bizda esa
  hammasini ko'rish mumkin.
- **Yozuv nuqtasi** tanlovi (NAT va proxy darslarida): "uy tarmog'ida" / "internet tomonida" / "proxy ortida". Bitta
  so'rovning ikki joydagi ko'rinishini solishtirish mumkin.
- Pastda: **".pcap yuklab olish"** (niqoblangan yozuv; 3.4) va "Wireshark'da qanday ochish" havolasi.

### 1.5. Paket inspektori

- **Sarlavha:** yorliq, vaqt, kimdan → kimga, protokol, hajm; `←`/`→` oldingi/keyingi; `Esc` yopish.
- **Qatlamlar chizig'i:** Ethernet 14 B · IPv4 20 B · TCP 32 B · TLS 517 B — kengligi baytlarga mutanosib. Qatlam
  bosilsa, uning maydonlariga o'tadi.
- **Maydonlar daraxti:**
  - har qatlam ochiladi/yopiladi;
  - har maydonda: nomi (o'zbekcha + asl nomi qavsda, masalan "Yashash vaqti (TTL)"), qiymati (tshark `showname`),
    **oddiy tildagi izohi** (2-bo'lim) va RFC bo'limiga havola.
- **Hex dump + ASCII:**
  - maydon ustiga kelinsa, uning baytlari belgilanadi (tshark `_raw` dagi `pos`, `len`);
  - teskarisi ham ishlaydi: baytni bosish uni o'z ichiga olgan maydonni ochadi.
- **Nishonlar:**
  - `misol` — bu yozuvdagi qiymat, har safar boshqacha (port, seq, ID, vaqt belgisi, tasodifiy son);
  - `shifrlangan` — baytlar haqiqiy, lekin ma'nosi kalitsiz ko'rinmaydi;
  - `niqoblangan` — maxfiylik uchun almashtirilgan (3.4).
- **"Kalit bilan ochish"** (TLS/QUIC). Almashtirgich yoqilganda shifrlangan yozuv o'rnida ichki protokol daraxti chiqadi
  (tshark keylog bilan ochgan holat). Matnda ochiq aytiladi: "Bu kalit faqat shu laboratoriya yozuvida saqlangan.
  Tarmoqdagi boshqa odamda u yo'q — shuning uchun u buni ko'ra olmaydi."
- Inspektor ochilganda ovoz pauza qiladi (README 5.4).

### 1.6. Klaviatura

README `klaviatura.js` umumiy ro'yxati + shu vizualizatorga xoslari:

| Tugma | Ish |
| --- | --- |
| `V` | Tarmoq / Ketma-ketlik |
| `S` | bittadan (har paketdan keyin to'xtash) |
| `A` | hamma paketlar / faqat darsdagilar |
| `N` / `P` | keyingi / oldingi protokol |
| `Enter` (jadvalda) | inspektorni ochish |
| `K` (inspektorda) | kalit bilan ochish |

---

## 2. Maydon izohlari — `src/sahna/paket/maydonlar.js`

Har maydonning o'zbekcha nomi va izohi bir marta yoziladi, hamma darslarda qayta ishlatiladi. Kalit — tshark maydon nomi:

```js
export const MAYDONLAR = {
  'ip.ttl': {
    nom: 'Yashash vaqti (TTL)',
    izoh: 'Har router 1 ga kamaytiradi; 0 bo‘lsa paket tashlanadi va jo‘natuvchiga ICMP xabari boradi. Shu sababli paket tarmoqda abadiy aylanib qolmaydi.',
    manba: 'RFC 791, 3.1',
  },
  'tcp.flags.syn': { nom: 'SYN bayrog‘i', izoh: '…', manba: 'RFC 9293, 3.1' },
  'tcp.seq': { nom: 'Ketma-ketlik raqami', izoh: '…', manba: 'RFC 9293, 3.4', misol: true },
  // …
}
```

- `misol: true` — har yozuvda boshqacha bo'ladigan maydonlar. Inspektorda nishon avtomatik qo'yiladi.
- Izoh **faqat RFC yoki rasmiy hujjatdan** yoziladi. `manba` — aniq bo'lim, saytda havola bo'lib chiqadi.
- Validator (`sahna-tekshir.mjs`) darsda ko'rsatiladigan har maydon uchun izoh borligini tekshiradi. Yo'q bo'lsa —
  ro'yxat chiqaradi, PR ochilmaydi. Juda mayda maydonlar (masalan, `tcp.options` ichidagi `NOP`) guruh izohi bilan
  yopilishi mumkin.

---

## 3. Haqiqiy yozuv — laboratoriya va quvur

### 3.1. Laboratoriya — `paket-lab/` (VPS'da Docker Compose)

Internetdan ajratilgan (`internal: true`) tarmoqlar va hujjatlar uchun ajratilgan manzillar. Shu sababli yozuvda
niqoblanadigan narsa deyarli qolmaydi:

```text
  uy tarmog'i 192.168.1.0/24              "internet" 203.0.113.0/24, 198.51.100.0/24, 192.0.2.0/24
 ┌──────────────────────┐   ┌────────┐   ┌───────────────────────────────────────────────────────┐
 │ klient 192.168.1.10  │───│ router │───│ rezolver (unbound)   root / TLD / domen (BIND)        │
 │ (curl, openssl,      │   │ NAT +  │   │ veb (nginx) 203.0.113.10   proxy (nginx)               │
 │  psql, redis-cli, …) │   │ netem  │   │ postgres · redis · rabbitmq · kafka (kerakli darsda)  │
 └──────────────────────┘   └────────┘   └───────────────────────────────────────────────────────┘
```

**Router** — ikki tarmoqqa ulangan konteyner. Unda:

- `iptables MASQUERADE` — haqiqiy NAT. NAT darsida LAN va WAN tomonlari yozuvi solishtiriladi.
- `tc qdisc … netem delay` — haqiqiy yadro mexanizmi bilan kechikish. Laboratoriyada hamma narsa bir mashinada,
  shuning uchun vaqtlar ~0,1 ms bo'lib qoladi. Kechikish qo'yilsa, vaqtlar real internetga yaqin bo'ladi.
- Kechikish qiymati darsda ochiq yoziladi: "bu yozuvda klient va server orasiga 20 ms kechikish qo'yilgan".

**DNS iyerarxiyasi** (qilindi, 2026-11-19; compose profili `dns`) — o'zimizning root zonasi, `.test` TLD va `sayt.test`
domen serveri (uchalasi NSD 4.6.1). Rezolver (Unbound 1.17.1, 192.168.1.53 — uy tarmog'ida) `root-hints` sifatida bizning
root'ni ko'radi. Natijada "rezolver → root → TLD → domen serveri" yo'li **haqiqiy so'rovlar bilan** ko'rinadi. `.test` —
sinov uchun ajratilgan domen (RFC 2606); RFC 6761 6.2 bo'yicha keshlovchi rezolver uni sukut bo'yicha o'zi NXDOMAIN bilan
yopadi, shuning uchun Unbound'da `local-zone: "test." nodefault`.

**TLS:**

- o'zimizning sinov CA'si: ildiz → oraliq → `sayt.test` sertifikati. Zanjir darsda to'liq ko'rinadi;
- klient `SSLKEYLOGFILE` bilan ishga tushadi: curl/OpenSSL kalitlarni faylga yozadi, tshark shu fayl bilan ochadi.
- Qilindi (2026-11-20): `paket-lab/tls/yarat.sh` (ECDSA P-256 zanjir, bir marta, `tls/sinov/` — git'da yo'q), nginx 443 faqat
  TLS 1.3. `eksport.sh` kalitlar jurnali bo'lsa `.ochiq.pdml` ni TCP qayta yig'ish **yoqilgan** holda chiqaradi — bir nechta
  segmentga bo'lingan yozuv (HTTP javobi) oxirgi segmentida ochiladi. `aylantir.mjs` farq qilgan paketlarga `ochiq` qo'shadi;
  inspektordagi "Kalit bilan ochish" shuni ko'rsatadi (ochilgan maydonlar hex ustida belgilanmaydi).

**Qolganlari:**

- Statik MAC manzillar (`mac_address`) — yozuvlar takrorlanuvchan bo'ladi.
- Versiyalar har yozuvda `yoz.sh` tomonidan yig'iladi (`curl --version`, `nginx -v`, `tshark --version`, `openssl version`,
  …) va dars `sinov.versiyalar` ga yoziladi.
- `CLAUDE.md` qoidasi: "nima o'rnatish kerak bo'lsa VPS ga". Laboratoriya to'liq VPS'da. VPS'ning SSH va firewall
  sozlamalariga tegilmaydi — hamma narsa konteynerlar ichida.

### 3.2. Yozib olish — `paket-lab/yoz.sh <dars>`

```text
1. compose up (darsga kerakli servislar profili bilan)
2. har yozuv nuqtasida tcpdump (-i <bridge> yoki konteyner namespace'ida), -w <dars>-<nuqta>.pcap
3. darsning ssenariysi: paket-lab/ssenariy/<dars>.sh  (masalan: curl -v http://sayt.test/)
4. tcpdump to'xtaydi; keylog, versiyalar, ssenariy chiqishi saqlanadi
5. compose down
```

Ssenariy fayli repo'da: o'quvchi va kelajakdagi muallif yozuvni xuddi shunday qayta olishi mumkin.

### 3.3. Aylantirish — `scripts/paket/aylantir.mjs`

```bash
tshark -r http.pcap -o tls.keylog_file:keys.log -T json -x > http.json        # maydonlar + _raw (pos, len)
tshark -r http.pcap -T fields -e frame.number -e frame.time_relative -e _ws.col.Protocol -e _ws.col.Info
```

Chiqish: `src/sahna/paket/yozuvlar/<dars>.json`. Tarkibi:

- har paket: raqam, vaqt, manba/manzil, protokol, info, hajm, `hex`;
- qatlamlar daraxti — har maydon: tshark nomi, `showname`, `pos`, `len`, ichki maydonlar;
- shifrlangan va kalit bilan ochilgan variant alohida.

Darsdagi `paket` hodisasi yozuvga havola qiladi:

```js
{ tur: 'paket', id: 'p3', raqam: 3, dan: 'klient', ga: 'veb', yorliq: 'SYN', qatorlar: ['ulanish so‘rovi'] }
```

`raqam` bo'yicha jadval qatori, inspektor va vaqt yozuvdan olinadi. Qo'lda yozilgan bayt yo'q.

### 3.4. Niqoblash va maxfiylik

Laboratoriya manzillari allaqachon hujjat diapazonlarida. Shunga qaramay, `aylantir.mjs` oxirida tekshiruv bor:

- yozuvda VPS'ning haqiqiy IP'si, hostname'i, MAC'i (statik bo'lmagan) yoki ma'lum maxfiy qatorlar (`.env` dagi kalitlar,
  `boshqaruv` paroli) uchrasa — **xato**, fayl yozilmaydi;
- `.pcap` yuklab olish fayli ham shu tekshiruvdan o'tadi. Laboratoriyaga tashqi tarmoq ulanmagani uchun begona trafik
  yozuvga tushmaydi (`internal: true`).

### 3.5. Yozuvni tekshirish (test)

- `tshark -z expert` — checksum yoki buzilgan paket xatosi yo'q (NIC offload sababli `tcp.checksum` "unverified" bo'lishi
  mumkin — bu hujjatlashtiriladi va testda ruxsat beriladi).
- Har paketning har bayti kamida bitta maydonga tegishli (inspektorda "egasiz" bayt yo'q). Istisno — `shifrlangan`.
- Dars `paket` hodisalaridagi `raqam`lar yozuvda mavjud, tartib to'g'ri.
- Vaqtlar monoton.

---

## 4. Darslar ro'yxati (to'lqinlar)

Qoida: dars faqat kitoblarimizda **bobi bor** mavzu bo'yicha. Har dars `kitob` maydonida bobga havola qiladi. Boblar
raqami `content/*/README.md` dan 2026-11-18 holatida.

### 4.1. 1-to'lqin — Web asoslari (`content/web-asoslari`)

| # | Dars | Qadamlar (taxminiy) | Bob | Standart |
| --- | --- | --- | --- | --- |
| 1 | **Sahifa ochilishi: HTTP/1.1** | manzil yozildi → DNS → TCP ulanish → GET → 200 OK (bir necha segment) → sahifa | 01, 05, 06 | RFC 9110, 9112 |
| 2 | **DNS: nomdan manzilgacha** ✅ | klient → rezolver → root → `.test` TLD → domen serveri → javob → keyingi so'rov keshdan (paket yo'q!) | 04 | RFC 1034, 1035 |
| 3 | **TCP ulanishi** ✅ | SYN → SYN-ACK → ACK → ma'lumot + ACK → FIN/ACK; yopiq port → RST | 03 | RFC 9293 |
| 4 | **TLS 1.3** ✅ | ClientHello (SNI, kalit ulushi) → ServerHello → shifrlangan: sertifikat, tekshiruv, Finished → zanjir tekshiruvi → "kalit bilan ochish" | 25, 26 | RFC 8446 |
| 5 | **HTTPS so'rovi** | TCP + TLS + HTTP birga, vaqt qayerga ketgani (har bosqich ms) | 25 | RFC 9110, 8446 |
| 6 | **Redirect** ✅ | `http://` → 301 `Location: https://…` → yangi ulanish | 10 | RFC 9110 §15.4 |
| 7 | **Kesh va 304** ✅ | 1-so'rov 200 + `ETag` → `If-None-Match` → 304 (tana yo'q, hajmni solishtirish) | 11 | RFC 9111 |
| 8 | **Siqish va qism** ✅ | `Accept-Encoding: gzip` → `Content-Encoding` (hajm farqi); `Range` → 206 | 12 | RFC 9110 |
| 9 | **HTTP/2** ✅ | ALPN `h2` → SETTINGS → bitta ulanishda bir nechta oqim (stream ID), HPACK | 13 | RFC 9113 |
| 10 | **Cookie va sessiya** ✅ | `Set-Cookie` → keyingi so'rovda `Cookie`; atributlar | 14, 15 | RFC 6265 |
| 11 | **CORS preflight** ✅ | `OPTIONS` + `Origin` → `Access-Control-Allow-*` → asl so'rov | 19 | Fetch standarti |
| 12 | **HTTP autentifikatsiya** | 401 + `WWW-Authenticate` → `Authorization: Basic` (base64 — shifr emas!) | 16 | RFC 9110 §11 |
| 13 | **Yo'ldagi kuzatuvchi (MITM)** | bitta login HTTP va HTTPS'da; router nuqtasidan: HTTP'da parol ochiq ko'rinadi, HTTPS'da — faqat SNI va hajmlar. Mavzu himoya uchun: "nega HTTPS va HSTS kerak" | 27, 28 | RFC 8446, 6797 |
| — | ⚑ **HTTP/3 (QUIC)** | VPS'dagi curl va nginx QUIC qo'llashi tekshiriladi. Bo'lmasa — yozilmaydi, egasiga aytiladi | 13 | RFC 9000, 9114 |

### 4.2. 2-to'lqin — Server tomoni (Nginx, Linux, Server xavfsizligi, Docker)

| Dars | Nima | Kitob (bob mavjudligi yozishdan oldin tekshiriladi) |
| --- | --- | --- |
| **NAT** | uy tarmog'ida va internet tomonida bitta so'rov: manba manzil/port almashadi | Docker (tarmoq) / Linux |
| **Reverse proxy** | klient → nginx va nginx → backend — ikki alohida ulanish; `X-Forwarded-For`, `Host` | Nginx |
| **TLS terminatsiya** | tashqarida TLS, ichkarida ochiq HTTP (proxy ortidagi nuqta) | Nginx |
| **Firewall: DROP va REJECT** | REJECT — darhol RST/ICMP; DROP — klient qayta urinadi (SYN takrorlari, vaqt) | Server xavfsizligi (firewall boblari egasining tasdig'ini kutmoqda — dars ham shunga bog'liq) |
| **SSH ulanishi** | versiya almashinuvi → `KEXINIT` → kalit almashinuvi → `NEWKEYS` → keyin hammasi shifrlangan (ko'rinadigan va ko'rinmaydigan) | Server xavfsizligi IV qism |
| **ping va traceroute** | ICMP echo; TTL 1, 2, 3 … va "Time Exceeded" javoblari | Linux (tarmoq bobi bo'lsa) |

### 4.3. 3-to'lqin — Ma'lumot va xabar protokollari (bu namunada yo'q)

| Dars | Nima | Kitob |
| --- | --- | --- |
| **PostgreSQL ulanishi** | `StartupMessage` → SCRAM-SHA-256 autentifikatsiya → `ReadyForQuery` → oddiy so'rov (`Query` → `RowDescription`/`DataRow`/`CommandComplete`) | SQL |
| **Tayyorlangan so'rov** | `Parse` → `Bind` → `Execute` → `Sync`; parametr alohida boradi — SQL injection nega ishlamaydi | SQL |
| **Redis (RESP)** | `SET`/`GET` baytlari; pipelining — bir nechta buyruq bitta paketda | Redis |
| **RabbitMQ (AMQP 0-9-1)** | `Connection.Start/Tune/Open` → `Channel.Open` → `Basic.Publish` → `Basic.Deliver` → `Basic.Ack`; publisher confirm | RabbitMQ, Xabar tizimlari |
| **Kafka** | `ApiVersions` → `Metadata` → `Produce` (`acks`) → `Fetch` | Kafka |

Har protokol uchun **tshark dissektori borligi** (`tshark -G protocols`) laboratoriyada tekshiriladi:

- Wireshark'da `pgsql`, `amqp`, `kafka` dissektorlari bor;
- RESP uchun dissektor bor-yo'qligi tekshiriladi. Yo'q bo'lsa — RESP matnli protokol, maydon daraxti `aylantir.mjs` da
  `redis-cli --verbose`/protokol hujjati asosida quriladi va bu darsda ochiq aytiladi.

### 4.4. Kitob README'laridagi "Animatsiyalar" jadvali bilan bog'liqlik

`content/web-asoslari/README.md` "Animatsiyalar" jadvalidagi bandlarning hammasi 4.1 da bor:

- 01 — sahifa ochilishi;
- 04 — DNS;
- 11 — kesh;
- 19 — CORS;
- 20 — CSRF. Bu band paket emas, brauzer xatti-harakati — "Tizim dizayni"ga ham tegishli emas. Alohida mini sahna
  sifatida qoladi.

---

## 5. Namunaviy dars — "Sahifa ochilishi: HTTP/1.1" (MVP)

Ssenariy: `curl -v http://sayt.test/` (klient konteynerida), router'da 20 ms netem.

| Qadam | Nishon | Ekranda | Ovoz (taxminiy matn, `{p…}` — langar) | Paketlar |
| --- | --- | --- | --- | --- |
| 1 Manzil | sozlash | manzil satriga `sayt.test` yoziladi; kamera klient + router | "Brauzerga sayt.test deb yozdik. Lekin paketlar nomga emas, manzilga boradi. Shuning uchun avval manzilni topish kerak." | — |
| 2 DNS | texnika | rezolver paydo bo'ladi | "Klient rezolverdan so'raydi: sayt.test ning manzili qanday? {p1} Rezolver javob beradi {p2}." | DNS so'rov, javob |
| 3 TCP | texnika | veb-server paydo bo'ladi; ulanish holati tegi | "Endi server bilan ulanish ochiladi: uchta paket. Klient salom beradi {p3}, server javob qaytaradi {p4}, klient tasdiqlaydi {p5}." | SYN, SYN-ACK, ACK |
| 4 So'rov | texnika | so'rov kartasi: `GET / HTTP/1.1`, `Host` | "Brauzer bosh sahifani so'raydi {p6}. Host sarlavhasi qaysi saytni so'rayotganini aytadi: bitta serverda ko'p sayt bo'lishi mumkin." | GET |
| 5 Javob | texnika | `200 OK`, tana bir necha segmentda | "Server 200 OK bilan javob beradi {p7}. Sahifa bitta paketga sig'maydi, shuning uchun TCP uni bo'laklab yuboradi." | 200 OK |
| 6 Vaqt | xulosa | sahna ustida "vaqt qayerga ketdi" kartasi (DNS, ulanish, javob — yozuvdan ms) | "Eng ko'p vaqt server ishiga emas, yo'lga ketdi: har borib-kelish yigirma millisekund." | — |

"Siz o'rganasiz": nima uchun avval DNS kerak; TCP uch qadamli ulanishi; so'rov va javob tuzilishi; vaqt qayerga ketadi.

Bog'liq bob: Web asoslari 01, 05, 06. "O'zingiz sinang" → `/web-asoslari/trenajor` (HTTP laboratoriyasi, xuddi shu
`curl -v`).

---

## 6. Mavjud narsalar bilan munosabat

| Mavjud | Munosabat |
| --- | --- |
| HTTP laboratoriyasi (`/web-asoslari/trenajor`, `src/web/SorovYoli.vue`) | u — **o'quvchining o'z so'rovi** (haqiqiy curl), bu — **tayyorlangan dars** (paket darajasida). Dars oxirida "o'zingiz yuboring" → lab'ga. Lab'dagi "So'rov yo'li" uslubi yangi ikonkalarga o'tkaziladi |
| Nginx trenajoridagi "So'rov yo'li" | reverse proxy darsi bilan bir xil g'oya; ikonkalar va ranglar bir xil bo'ladi |
| `src/animatsiya/*` (Linux kitobi) | o'zgarmaydi; faqat ikonkalar keyinroq umumiy to'plamga o'tkaziladi |

---

## 7. Bosqichlar

1. **Laboratoriya:**
   - `paket-lab/` (VPS): compose, router (NAT + netem), DNS iyerarxiyasi, sinov CA, `yoz.sh`;
   - 1-dars yozuvi;
   - `aylantir.mjs` + yozuv testlari (3.5).
2. **MVP sahifa** (umumiy dvigatel MVP bilan birga, README 8):
   - `/paketlar/http-1-1`: Tarmoq ko'rinishi, jadval, inspektor, jim rejim;
   - 390 px va qorong'i temada skrinshot auditi.
3. Ketma-ketlik ko'rinishi; `maydonlar.js` 1-dars uchun to'liq.
4. **Ovoz** — 1-dars ovozlanadi, langarlar, egasi tinglaydi.
5. 1-to'lqinning qolgan darslari, PR'da 2–4 tadan.
6. 2- va 3-to'lqinlar. Har biridan oldin bob mavjudligi va dissektor tekshiriladi.

---

## 8. Xatarlar

| Xatar | Yechim |
| --- | --- |
| Laboratoriya vaqtlari realga o'xshamaydi | `netem` bilan ochiq belgilangan kechikish (3.1); matnda aytiladi |
| Yozuvda keraksiz paketlar ko'p (IPv6 ND, ARP, mDNS) | `internal` tarmoq, IPv6 o'chirilgan konteynerlar; qolganlari "hamma paketlar" rejimida xira |
| tshark versiyasi o'zgarsa maydon nomlari o'zgaradi | versiya yozuv bilan saqlanadi; `maydonlar.js` validatori yangi/yo'qolgan maydonlarni ko'rsatadi |
| Katta yozuv (masalan, rasm yuklanishi) bundle'ni og'irlashtiradi | dars yozuvi lazy JSON; katta tana `hex` da qisqartiriladi ("… yana 11 KB", `.pcap` da to'liq) |
| Ovoz matni va yozuv nomuvofiq (masalan, "uchta paket" deydi, yozuvda to'rtta) | validator: ovozdagi `{p…}` langarlar soni va tartibi hodisalar bilan solishtiriladi; matndagi sonlar qo'lda tekshiriladi (PR checklist) |

---

## 9. Ochiq savollar (egasiga)

1. **Qatlam ko'rsatkichi:** OSI 7 qatlam (namunadagidek) yoki TCP/IP 4 qatlam? Web asoslari 03-bobidagi model bilan
   bir xil bo'lishi kerak — yozishdan oldin bobdan tekshiriladi. Tavsiya: bob qaysi modelni ishlatsa, o'sha.
2. **`.pcap` yuklab olish** — saytda bo'lsinmi? Tavsiya: ha. Hajmi kichik, o'quvchi uchun haqiqiylikning isboti.
3. **3-to'lqin** (PostgreSQL, Redis, AMQP, Kafka) — 1-to'lqindan keyinmi yoki SQL/Redis kitoblari bilan parallelmi?
4. **MITM darsi** (4.1, 13) — server xavfsizligi qoidasi bo'yicha faqat himoya nuqtai nazaridan. Ma'qulmi?
