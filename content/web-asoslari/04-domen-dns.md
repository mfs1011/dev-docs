# 04 — Domen va DNS

[Mundarija](README.md)

## Tushuncha

3-bobda ko'rdik: kompyuterlar bir-birini **IP manzil** bilan topadi (`8.47.69.0`, `2a06:98c1:3123:8000::`). MDN (What is a Domain Name?): bunday manzillarni eslab qolish qiyin, ular vaqt o'tib **o'zgarishi** ham mumkin, va ulardan serverni kim yuritayotgani yoki sayt nima xizmat ko'rsatishi bilinmaydi. Shuning uchun odamlar **domen nomi**dan foydalanadi: `example.com`, `developer.mozilla.org`.

### Domen nomining tuzilishi

Domen — nuqta bilan ajratilgan qismlar (**yorliq**, label). MDN: ular **o'ngdan chapga** o'qiladi.

```text
developer . mozilla . org
    │          │       └── TLD — yuqori darajadagi domen
    │          └────────── ikkinchi darajali domen (SLD)
    └───────────────────── subdomen
```

| Qism | Misolda | Nima (MDN) |
| --- | --- | --- |
| **TLD** (top-level domain) | `org` | Eng oxirgi, eng umumiy qism. Har TLD'ni boshqaradigan tashkilotni ICANN tayinlaydi. Ba'zilari qoidali: `.gov` — faqat davlat idoralari, `.edu` — faqat ta'lim muassasalari; davlat TLD'lari (`.uz`, `.fr`) til yoki mamlakatni bildiradi |
| **SLD** (secondary level domain) | `mozilla` | TLD'dan oldingi yorliq; `mozilla.org` — ro'yxatdan o'tkaziladigan nom |
| **Subdomen** | `developer` | Domen egasi o'zi yaratadi: `developer.mozilla.org`, `support.mozilla.org` — har biri alohida kontent bilan |

Yorliqlar soni majburiy emas: ikkita, uchta va undan ko'p bo'lishi mumkin. RFC 1035 (2.3.4) chegaralari: yorliq — **63** baytgacha, butun nom — **255** baytgacha.

IANA TLD'larni guruhlarga ajratadi (MDN: TLD), masalan: davlat kodi TLD'lari (ccTLD: `.uz`), xalqaro (lotin bo'lmagan) davlat TLD'lari (IDN ccTLD), umumiy TLD'lar (gTLD: `.com`, `.org`).

### Domen kimga tegishli

MDN: domenni **sotib olib bo'lmaydi** — bir yoki bir necha yilga undan **foydalanish huquqi** to'lanadi. Huquqni uzaytirish mumkin, uzaytirishda siz boshqalardan ustunsiz, lekin domen hech qachon to'liq mulkingiz bo'lmaydi. Bu ishlatilmay qolgan nomlar keyinchalik boshqalarga bo'shashi uchun. Domenni **registrator** (registrar) kompaniyalari ro'yxatdan o'tkazadi; domen bandmi yoki yo'qligini `whois` xizmati ko'rsatadi.

### DNS

MDN (DNS): **DNS** (Domain Name System) — internet resurslari uchun **ierarxik** va **markazlashmagan** nomlash tizimi. U domen nomlari va ularga bog'liq ma'lumotlarni (masalan, IP manzil) saqlaydi.

- **DNS so'rovi** (DNS lookup) — nomdan IP manzilni topish.
- **Teskari DNS so'rovi** (reverse DNS lookup, rDNS) — IP manzildan nomni topish.

### Nom qanday topiladi

MDN qadamlari:

1. Brauzerga `mozilla.org` yoziladi.
2. Brauzer kompyuterdan so'raydi: bu nomning IP manzili **lokal DNS keshida** bormi? Bo'lsa — darhol ishlatiladi.
3. Bo'lmasa — kompyuter **DNS serveri**dan so'raydi.
4. IP manzil topilgach, brauzer veb-server bilan bog'lanadi.

3-qadamdagi server odatda **rekursiv rezolver** (recursive resolver): javobni o'zi qidiradi va keshlaydi. Kompyuterdagi qism esa — **stub rezolver**: o'zi to'liq qidira olmaydi, rekursiv rezolverga tayanadi (RFC 9499 atamalari). Rekursiv rezolver javobni bilmasa, daraxt bo'ylab tepadan pastga yuradi:

```text
rezolver ──► ildiz (.) serveri:    "kun.uz ?"  →  ".uz ni ns1.uz … ns8.uz biladi"
         ──► .uz serveri:          "kun.uz ?"  →  "kun.uz ni daniella/jeremy.ns.cloudflare.com biladi"
         ──► kun.uz domen serveri: "kun.uz ?"  →  "172.67.213.163, 104.21.23.207"
```

Oxirgi javobni beradigan server — **avtoritativ server** (authoritative server): domen zonasining ma'lumotini o'zi biladi, boshqalardan so'ramaydi; u domenning **NS** yozuvida ko'rsatiladi (RFC 9499). Bu yo'lni pastda `dig +trace` bilan ko'ramiz.

### Yozuv turlari

DNS'da ma'lumot **resurs yozuvlari** (resource record, RR) ko'rinishida saqlanadi. Asosiylari (RFC 1035, 3.2.2; AAAA — RFC 3596):

| Tur | Nima saqlaydi | Misol (pastdagi sinovdan) |
| --- | --- | --- |
| **A** | IPv4 manzil | `example.com. A 8.47.69.0` |
| **AAAA** | IPv6 manzil | `2a06:98c1:3123:8000::` |
| **CNAME** | Taxallus (alias): bu nom aslida boshqa nomning ("kanonik nom") o'zi | `www.github.com. CNAME github.com.` |
| **MX** | Domen pochtasini qabul qiladigan server va uning ustuvorligi | `mozilla.org. MX 1 aspmx.l.google.com.` |
| **TXT** | Ixtiyoriy matn. Ko'pincha tekshiruv va pochta sozlamalari (masalan, SPF) | `"v=spf1 …"` |
| **NS** | Domenning avtoritativ serverlari | `example.com. NS hera.ns.cloudflare.com.` |
| SOA | Zona boshlanishi va uning sozlamalari | `uz. SOA ns.uz. …` |
| PTR | Teskari so'rov uchun nom | `8.8.8.8` → `dns.google.` |

### TTL

Har yozuvda **TTL** (time to live) bor. RFC 1035 (3.2.1): yozuvni manbadan qayta so'ramasdan **keshda saqlash mumkin bo'lgan vaqt**, soniyalarda; `0` — keshlanmaydi.

MDN (DNS refreshing): domen ma'lumoti o'zgarganda, uni bilgan DNS serverlar eski nusxani muddati tugaguncha ishlatadi, keyin avtoritativ serverdan yangisini oladi. Shuning uchun o'zgarish hammaga **birdaniga** yetib bormaydi.

## Ko'rib chiqamiz

Hammasi VPS'da, `dig` (BIND 9.20.24) bilan.

### To'liq javob

```text vps
$ dig -v
DiG 9.20.24-1ubuntu0.5-Ubuntu
$ dig example.com A

; <<>> DiG 9.20.24-1ubuntu0.5-Ubuntu <<>> example.com A
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 15929
;; flags: qr rd ra; QUERY: 1, ANSWER: 2, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 65494
;; QUESTION SECTION:
;example.com.			IN	A

;; ANSWER SECTION:
example.com.		137	IN	A	8.47.69.0
example.com.		137	IN	A	8.6.112.0

;; Query time: 1 msec
;; SERVER: 127.0.0.53#53(127.0.0.53) (UDP)
;; MSG SIZE  rcvd: 72
```

| Qator | Ma'nosi |
| --- | --- |
| `status: NOERROR` | So'rov muvaffaqiyatli |
| `flags: qr rd ra` | RFC 1035 (4.1.1): `qr` — bu javob; `rd` (recursion desired) — biz rekursiv qidiruv so'radik; `ra` (recursion available) — server rekursiyani qo'llaydi |
| `QUESTION SECTION` | Nima so'raldi: `example.com.` ning `A` yozuvi. Oxiridagi `.` — ildiz |
| `ANSWER SECTION` | Ikkita `A` yozuvi. Ustunlar: nom, TTL (`137` soniya), sinf (`IN` — internet), tur, qiymat |
| `SERVER: 127.0.0.53#53 … (UDP)` | Javob bergan server. `127.0.0.53` — systemd-resolved'ning lokal stub tinglovchisi (systemd hujjati); `#53` — DNS porti; so'rov UDP orqali ketdi |
| `Query time: 1 msec` | Javob keshdan keldi — tez |

### Yozuv turlari

`+short` — faqat qiymat; `+noall +answer` — faqat javob bo'limi (dig qo'llanmasi):

```text vps
$ dig +short example.com AAAA
2a06:98c1:3123:8000::
2a06:98c1:3122:8000::
$ dig +noall +answer www.github.com A
www.github.com.		2198	IN	CNAME	github.com.
github.com.		5	IN	A	140.82.121.3
```

`www.github.com` — **CNAME**: rezolver kanonik nom `github.com` ga o'tib, uning `A` yozuvini ham berdi. RFC 1034 (3.6.2): server so'ralgan yozuvni topmasa va nomda CNAME bo'lsa, javobga CNAME'ni qo'shib, so'rovni kanonik nom bilan qaytadan boshlaydi. Yana bir qoida: CNAME bor nomda **boshqa yozuv bo'lmasligi** kerak.

`github.com` ning TTL'i atigi `5` soniya — manzilni tez almashtirish kerak bo'lsa, TTL kichik qo'yiladi.

```text vps
$ dig +noall +answer mozilla.org MX
mozilla.org.		60	IN	MX	10 aspmx3.googlemail.com.
mozilla.org.		60	IN	MX	1 aspmx.l.google.com.
mozilla.org.		60	IN	MX	5 alt1.aspmx.l.google.com.
mozilla.org.		60	IN	MX	5 alt2.aspmx.l.google.com.
$ dig +noall +answer mozilla.org TXT | grep -i 'v=spf1'
mozilla.org.		60	IN	TXT	"v=spf1 include:%{i}._ip.%{h}._ehlo.%{d}._spf.vali.email include:_spf.mozilla.com include:_spf.google.com include:spf.fundraiseup.com ~all"
```

- **MX**: son — ustuvorlik; RFC 1035 (3.3.9): **kichigi afzal**. Pochta avval `1 aspmx.l.google.com.` ga yuboriladi.
- **TXT**: `v=spf1 …` — domen nomidan pochta yuborishga ruxsat berilgan serverlar ro'yxati (SPF; bu kitob mavzusi emas).

```text vps
$ dig +noall +answer example.com NS
example.com.		3818	IN	NS	elliott.ns.cloudflare.com.
example.com.		3818	IN	NS	hera.ns.cloudflare.com.
$ dig +noall +answer uz. NS
uz.			1774	IN	NS	ns7.uz.
uz.			1774	IN	NS	ns6.uz.
uz.			1774	IN	NS	ns3.uz.
uz.			1774	IN	NS	ns4.uz.
uz.			1774	IN	NS	ns1.uz.
uz.			1774	IN	NS	ns2.uz.
uz.			1774	IN	NS	ns5.uz.
uz.			1774	IN	NS	ns8.uz.
```

`example.com` zonasini Cloudflare serverlari yuritadi; `.uz` TLD'sini — `ns1.uz` … `ns8.uz`.

### Teskari so'rov

```text vps
$ dig -x 8.8.8.8 +short
dns.google.
```

`-x` — IP manzildan nomni topish (PTR yozuvi).

### TTL kamayadi

Bir xil so'rov, 5 soniya oraliq bilan:

```text vps
$ dig +noall +answer kun.uz A; sleep 5; dig +noall +answer kun.uz A
kun.uz.			95	IN	A	172.67.213.163
kun.uz.			95	IN	A	104.21.23.207
kun.uz.			89	IN	A	104.21.23.207
kun.uz.			89	IN	A	172.67.213.163
```

TTL `95` → `89`: javob rezolver **keshidan** keldi va qolgan vaqt kamaymoqda. Nolga yetganda rezolver avtoritativ serverdan qayta so'raydi. (Pastdagi `+trace` da avtoritativ server shu yozuvni TTL `300` bilan beradi — kesh shu 300 soniyadan qolganini ko'rsatyapti.)

### Mavjud bo'lmagan domen

```text vps
$ dig nomavjud-domen-7f3k2.uz A | grep -E 'status|AUTHORITY|SOA'
;; ->>HEADER<<- opcode: QUERY, status: NXDOMAIN, id: 32842
;; flags: qr rd ra; QUERY: 1, ANSWER: 0, AUTHORITY: 1, ADDITIONAL: 1
;; AUTHORITY SECTION:
uz.			1422	IN	SOA	ns.uz. hostmaster.cctld.uz. 2026125553 3600 900 5184000 14400
```

- `NXDOMAIN` — bunday nom yo'q (RFC 1035: "Name Error"); `ANSWER: 0`.
- `AUTHORITY` bo'limida `.uz` zonasining **SOA** yozuvi. RFC 2308: "yo'q" javobi ham keshlanadi va uning TTL'i SOA'ning TTL'i va oxirgi maydoni (`MINIMUM`) ning kichigidan olinadi. Ya'ni domen endi ro'yxatdan o'tkazilgan bo'lsa ham, keshlangan "yo'q" javobi bir muddat qaytishi mumkin.

### Ildizdan boshlab: `+trace`

dig qo'llanmasi: `+trace` ildiz serverlardan boshlab **iterativ** so'rovlar yuboradi va har yo'llanmani (referral) kuzatib, har bosqich javobini ko'rsatadi. `-4` — faqat IPv4 (bu VPS'da IPv6 ulanish yo'q, 3-bob):

```text vps
$ dig -4 +trace +nodnssec kun.uz A

; <<>> DiG 9.20.24-1ubuntu0.5-Ubuntu <<>> -4 +trace +nodnssec kun.uz A
;; global options: +cmd
.			1346	IN	NS	g.root-servers.net.
.			1346	IN	NS	f.root-servers.net.
.			1346	IN	NS	h.root-servers.net.
.			1346	IN	NS	b.root-servers.net.
.			1346	IN	NS	c.root-servers.net.
.			1346	IN	NS	m.root-servers.net.
.			1346	IN	NS	j.root-servers.net.
.			1346	IN	NS	i.root-servers.net.
.			1346	IN	NS	e.root-servers.net.
.			1346	IN	NS	a.root-servers.net.
.			1346	IN	NS	d.root-servers.net.
.			1346	IN	NS	l.root-servers.net.
.			1346	IN	NS	k.root-servers.net.
;; Received 239 bytes from 127.0.0.53#53(127.0.0.53) in 1 ms

uz.			172800	IN	NS	ns4.uz.
uz.			172800	IN	NS	ns6.uz.
uz.			172800	IN	NS	ns8.uz.
uz.			172800	IN	NS	ns7.uz.
uz.			172800	IN	NS	ns3.uz.
uz.			172800	IN	NS	ns5.uz.
uz.			172800	IN	NS	ns2.uz.
uz.			172800	IN	NS	ns1.uz.
;; Received 435 bytes from 192.112.36.4#53(g.root-servers.net) in 55 ms

kun.uz.			14400	IN	NS	daniella.ns.cloudflare.com.
kun.uz.			14400	IN	NS	jeremy.ns.cloudflare.com.
;; Received 124 bytes from 72.167.34.137#53(ns7.uz) in 181 ms

kun.uz.			300	IN	A	172.67.213.163
kun.uz.			300	IN	A	104.21.23.207
;; Received 67 bytes from 162.159.38.228#53(daniella.ns.cloudflare.com) in 6 ms
```

| Bosqich | Kimdan so'raldi | Javob |
| --- | --- | --- |
| 0 | Lokal rezolver | Ildiz (`.`) serverlari ro'yxati: `a` … `m.root-servers.net` |
| 1 | Ildiz serveri `g.root-servers.net` | "`.uz` ni `ns1.uz` … `ns8.uz` biladi" (yo'llanma) |
| 2 | `.uz` serveri `ns7.uz` | "`kun.uz` ni Cloudflare'ning `daniella`/`jeremy` serverlari biladi" |
| 3 | Avtoritativ server `daniella.ns.cloudflare.com` | Javob: ikkita `A` yozuvi, TTL `300` |

Har bosqich nomni o'ngdan chapga bir yorliqqa aniqlashtiradi: `.` → `uz.` → `kun.uz.`. Butun yo'l ~240 ms oldi; rekursiv rezolver bu ishni bir marta qilib, keyin TTL davomida keshdan javob beradi (yuqoridagi `Query time: 1 msec`).

## Standartda nima deyilgan

| Standart | Nima |
| --- | --- |
| RFC 1034 (1987-yil noyabr) | DNS tushunchalari: nomlar daraxti, zonalar, rezolverlar. 3.6.2 — CNAME qoidalari |
| RFC 1035 (1987-yil noyabr) | Amalga oshirish: 2.3.4 — o'lcham chegaralari (yorliq 63, nom 255 bayt), 3.2.1 — TTL, 3.2.2 — yozuv turlari (A=1, NS=2, CNAME=5, SOA=6, PTR=12, MX=15, TXT=16), 3.3.9 — MX ustuvorligi, 4.1.1 — sarlavha bayroqlari va javob kodlari |
| RFC 3596 (2003-yil oktabr) | AAAA yozuvi — bitta IPv6 manzil, tur raqami 28 |
| RFC 2308 (1998-yil mart) | "Yo'q" javoblarini keshlash (negative caching) |
| RFC 9499 (2024-yil mart) | DNS atamalari: stub, rekursiv rezolver, avtoritativ server; RFC 8499 o'rnini egallagan |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| "DNS'ni o'zgartirdim — hamma darhol yangi manzilni ko'radi" | Rezolverlar eski yozuvni TTL tugaguncha keshdan beradi (sinovda kesh 300 soniyalik) | O'zgarishdan oldin TTL'ni kamaytirib qo'yish; kutish |
| "Domenni sotib oldim" | MDN: faqat foydalanish huquqi, muddatli | Muddatini kuzatib, uzaytirib turish |
| CNAME bor nomga boshqa yozuv qo'shish | RFC 1034: CNAME bor nomda boshqa ma'lumot bo'lmasligi kerak | Yo CNAME, yo A/AAAA/MX… |
| `dig` va brauzer natijasi farq qilsa — "DNS buzilgan" | Ular turli keshlardan foydalanishi mumkin (brauzer, tizim, rezolver) | Qaysi server javob berganini ko'rish (`SERVER:`), kerak bo'lsa `+trace` |
| Domen yangi ro'yxatdan o'tgach `NXDOMAIN` — "registrator xato qildi" | Avvalgi "yo'q" javobi ham keshlangan (RFC 2308) | SOA'dagi muddat o'tishini kutish |
| `www.example.com` ni sozlab, `example.com` ni unutish | Bular — alohida nomlar, alohida yozuvlar | Ikkalasini ham sozlash |
| MX'dagi katta sonni "muhimroq" deb hisoblash | RFC 1035: kichik qiymat afzal | `1` — birinchi navbatda |

## Amaliyot

1. `support.mozilla.org` da TLD, SLD va subdomen qaysi?
2. `A`, `AAAA`, `CNAME`, `MX`, `NS` yozuvlari nimani saqlaydi?
3. `dig` javobidagi `137` soni nima va nega ikkinchi so'rovda kamaydi?
4. `+trace` da `kun.uz` ning manzili topilguncha qaysi serverlardan so'raldi?
5. `NXDOMAIN` nimani anglatadi va nega javobda SOA yozuvi bor?
6. Saytni boshqa serverga ko'chirmoqchisiz. DNS'da nima qilish kerak va nega darhol hammaga ko'rinmaydi?

<details>
<summary>Javoblar</summary>

1. TLD — `org`, SLD — `mozilla`, subdomen — `support`.
2. A — IPv4, AAAA — IPv6, CNAME — boshqa nomga taxallus, MX — pochta serveri va ustuvorligi, NS — domenning avtoritativ serverlari.
3. TTL — yozuvni keshda saqlash mumkin bo'lgan qolgan vaqt (soniya). Javob rezolver keshidan keldi, vaqt o'tgan sari kamayadi.
4. Ildiz serveri (`g.root-servers.net`) → `.uz` serveri (`ns7.uz`) → avtoritativ server (`daniella.ns.cloudflare.com`).
5. Bunday nom yo'q. SOA "yo'q" javobini qancha keshlash mumkinligini bildiradi (RFC 2308).
6. `A`/`AAAA` yozuvini yangi IP'ga o'zgartirish. Rezolverlar eski yozuvni TTL tugaguncha keshdan beradi — oldindan TTL'ni kichraytirib qo'yish mumkin.

</details>

## Rasmiy hujjat

- [MDN: What is a Domain Name?](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_domain_name)
- [MDN: DNS](https://developer.mozilla.org/en-US/docs/Glossary/DNS) · [Domain name](https://developer.mozilla.org/en-US/docs/Glossary/Domain_name) · [TLD](https://developer.mozilla.org/en-US/docs/Glossary/TLD)
- [RFC 1034: Domain Names — Concepts and Facilities](https://www.rfc-editor.org/rfc/rfc1034)
- [RFC 1035: Domain Names — Implementation and Specification](https://www.rfc-editor.org/rfc/rfc1035)
- [RFC 3596: DNS Extensions to Support IPv6 (AAAA)](https://www.rfc-editor.org/rfc/rfc3596)
- [RFC 2308: Negative Caching of DNS Queries](https://www.rfc-editor.org/rfc/rfc2308)
- [RFC 9499: DNS Terminology](https://www.rfc-editor.org/rfc/rfc9499)
- [BIND 9: dig qo'llanmasi](https://bind9.readthedocs.io/en/stable/manpages.html)
- [systemd-resolved (127.0.0.53 stub)](https://www.freedesktop.org/software/systemd/man/latest/systemd-resolved.service.html)
