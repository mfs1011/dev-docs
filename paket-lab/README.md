# Paket yo'li laboratoriyasi

"Paket yo'li" darslari (`/paketlar`) uchun haqiqiy paket yozuvlari shu yerda olinadi. Reja:
[docs/vizualizator/paket-yoli.md](../docs/vizualizator/paket-yoli.md) 3-bo'lim.

Sinov VPS'ida ishlaydi (Docker Compose, `tshark` VPS'ning o'zida). Tarmoqlar `internal: true` — internetga chiqmaydi,
manzillar hujjatlar uchun ajratilgan diapazonlardan (`192.168.1.0/24` uy tarmog'i, `203.0.113.0/24` "internet").

| Konteyner | Manzil | Nima |
| --- | --- | --- |
| `klient` | 192.168.1.10 | curl, tcpdump; GRO o'chirilgan, DNS — laboratoriya rezolveri |
| `router` | 192.168.1.1 / 203.0.113.1 | NAT (`MASQUERADE`), har tomonga 10 ms `netem`, GSO/TSO o'chirilgan (paketlar ≤ 1514 bayt) |
| `dns` | 203.0.113.53 | dnsmasq: `sayt.test` → 203.0.113.10, `.test` mahalliy zona |
| `veb` | 203.0.113.10 | nginx 1.30.6, ~5,6 KB sahifa (bir nechta TCP segmentiga bo'linadi) |

Profil `dns` (faqat DNS darsi uchun, boshqa darslarga ta'sir qilmaydi):

| Konteyner | Manzil | Nima |
| --- | --- | --- |
| `rezolver` | 192.168.1.53 | Unbound — rekursiv rezolver, ildiz ro'yxati `rezolver/ildiz.hints` (laboratoriya ildizi), DNSSEC'siz |
| `ildiz` | 203.0.113.101 | NSD — ildiz zonasi `.`, `test.` ni `ns.test` ga topshiradi |
| `tld` | 203.0.113.102 | NSD — `test.` zonasi, `sayt.test.` ni `ns.sayt.test` ga topshiradi |
| `domen` | 203.0.113.103 | NSD — `sayt.test.` zonasi: `A 203.0.113.10`, TTL 300 |

```bash
./yoz.sh http-1-1        # ssenariy/http-1-1.sh ni klientda bajaradi, klient tomonida tcpdump → chiqish/http-1-1.pcap
./eksport.sh http-1-1    # tshark: .pdml (maydonlar, pos/size), .cols (jadval), .hex (baytlar)
# noutbukda:
rsync -az lab:/root/paket-lab/chiqish/ <papka>/
TAQIQ="<vps-ip>,…" node scripts/paket/aylantir.mjs <papka> http-1-1   # → src/sahna/paket/yozuvlar/http-1-1.json
```

TLS darsi: `yoz.sh` har safar `tls/yarat.sh` ni chaqiradi — sinov CA zanjiri (ildiz → oraliq → `sayt.test`) faqat bir marta
`tls/sinov/` ga yaratiladi (git'da yo'q), `veb` (nginx 443, faqat TLS 1.3) va `klient` (`/tls/ildiz.pem`) ga ulanadi. Klient
ssenariysi `SSLKEYLOGFILE` ga kalitlarni yozsa, `yoz.sh` ularni `chiqish/<dars>.keys` ga oladi, `eksport.sh` esa kalit bilan
ochilgan ko'rinishni (`.ochiq.pdml`, `.ochiq.cols`) chiqaradi. Kalitlar fayli repo'ga tushmaydi — faqat ochilgan daraxt.

```bash
./yoz.sh tls && ./eksport.sh tls
```

`tls/sayt.conf` da yana: `www.sayt.test` (80) → `301 https://sayt.test$request_uri` — redirect darsi uchun. Boshqa darslar
`sayt.test` yoki IP bilan so'raydi, ularga ta'sir qilmaydi. Kesh darsi (`kesh-304`) qo'shimcha sozlamasiz: nginx statik faylga
`ETag` va `Last-Modified` ni o'zi qo'shadi.

Siqish darsi (`siqish`): `veb/Dockerfile` nginx'ga `gzip on; gzip_vary on;` qo'shadi. Siqish faqat so'rovda
`Accept-Encoding: gzip` bo'lsa ishlaydi — boshqa darslardagi curl uni yubormaydi; qayta yozilsa ularning javobida faqat
`Vary: Accept-Encoding` sarlavhasi ortadi. Ssenariy bitta `curl` da uch so'rov (`--next` — ulanish qayta ishlatiladi).

HTTP/2 darsi (`http2`): `tls/sayt.conf` da `http2 on;` (ALPN'da `h2`); `--http1.1` bilan so'raydigan TLS darsi o'zgarmaydi.
`veb/` ga ikki kichik fayl (`uslub.css`, `ilova.js`) — `curl --http2 -Z` uchalasini bitta ulanishda parallel so'raydi.
Kadrlar shifrlangan, shuning uchun ssenariy ham `SSLKEYLOGFILE` yozadi.

Cookie darsi (`cookie`): `veb/cookie.conf` — alohida nom `hisob.sayt.test` (sayt.test javoblari o'zgarmaydi). `/kirish`
uchta `Set-Cookie` beradi (sessiya qiymati — nginx'ning `$request_id`), `/profil` server ko'rgan `Cookie` ni qaytaradi,
`/chiqish` — `Max-Age=0`. curl cookie faylini `-c`/`-b` bilan yuritadi.

nginx'da 80-portning asosiy serveri — rasmdagi `default.conf` (`veb/Dockerfile` unga `default_server` qo'shadi). Busiz
`conf.d` dagi alifbo bo'yicha birinchi fayl (`api.conf`, `cookie.conf`) asosiy bo'lib qoladi va `sayt.test` ga 404 beradi.

CORS darsi (`cors`): CORS'ni faqat brauzer qo'llaydi, shuning uchun ssenariyni haqiqiy headless Chromium bajaradi —
profil `brauzer` (uy tarmog'ida 192.168.1.20). `veb/api.conf` — `api.sayt.test` (ruxsat faqat `http://sayt.test` ga,
GET va PUT), `veb/cors.html` — uch `fetch` (GET, JSON bilan PUT, DELETE). Nomlar `--host-resolver-rules` bilan, qolgan
hamma nom topilmaydi va fon xizmatlari o'chirilgan — yozuvda faqat dars paketlari:

```bash
PROFIL=brauzer KIM=brauzer QAYERDA=brauzer ./yoz.sh cors
```

`KIM` — ssenariy qaysi konteynerda ishlaydi (standart `klient`).

HTTP autentifikatsiya darsi (`auth`): `veb/panel.conf` — `panel.sayt.test`, `auth_basic`. Sinov foydalanuvchisi
`lab` / `sinov-parol` (faqat laboratoriya); parol fayli build paytida `openssl passwd -apr1` bilan yaratiladi. Kontent
fayldan — himoyalangan joyda `return` `auth_basic` ni chetlab o'tadi.

MITM darsi (`mitm`): yozuv routerda — `QAYERDA=router ./yoz.sh mitm`. `yoz.sh` tcpdump'ni konteynerning uy tarmog'i
(192.168.1.x) interfeysida ishga tushiradi: klientda u yagona, routerda — Wi-Fi tomoni. Login formasi `/kirish` —
ochiq HTTP'da `veb/kirish.inc` (default.conf ga qo'shiladi), HTTPS'da `tls/sayt.conf` (u yerda HSTS sarlavhasi ham).

HTTP/3 darsi (`http3`): Debian'dagi curl (va `curlimages/curl` 8.18.0) HTTP/3 siz yig'ilgan, shuning uchun brauzer — Chromium.
nginx'da `listen 443 quic` (`tls/sayt.conf`), sahifa `veb/h3.html` uslub va skriptni chaqiradi. Laboratoriya CA'si bilan
QUIC uchun Chromium hujjati ("Playing with QUIC") talab qilganidek: `--origin-to-force-quic-on` va leaf sertifikat SPKI'si
bilan `--ignore-certificate-errors-spki-list`. Kalitlar jurnali `KIM` konteyneridan olinadi:

```bash
PROFIL=brauzer KIM=brauzer QAYERDA=brauzer ./yoz.sh http3
```

HTTPS darsi (`https`): `tls/sayt.conf` da `ssl_protocols TLSv1.2 TLSv1.3` — TLS 1.2 faqat solishtirish uchun, boshqa darslar
`--tlsv1.3` bilan so'raydi. Ssenariy nomni laboratoriya DNS'idan oladi (`--resolve` yo'q).

Metodlar darsi (`metodlar`): `veb/fayl.conf` — `fayl.sayt.test`, nginx WebDAV moduli (`dav_methods PUT DELETE`) fayl yaratadi va
o'chiradi; `/tashqi` — hech narsa tinglamayotgan portga proxy (502). Fayllar konteyner ichida, har ishga tushishda bo'sh.

DNS darsi: yozuv rezolverning interfeysida olinadi (klient so'rovi ham, iyerarxiya bo'ylab so'rovlar ham ko'rinadi):

```bash
PROFIL=dns QAYERDA=rezolver ./yoz.sh dns
```

`TAQIQ` — natijada uchramasligi kerak bo'lgan qatorlar (VPS'ning haqiqiy IP'si va h.k.); uchrasa fayl yozilmaydi.

Saboqlar:

- `veth` orqali katta GSO bloklari (2896 bayt) bo'linmasdan o'tadi — router'da `ethtool -K … gso off tso off`.
- dnsmasq'da `--local=/test/` bo'lmasa AAAA so'roviga `REFUSED` qaytadi; bilan — NODATA (to'g'ri javob).
- Unbound `.test` ni sukut bo'yicha o'zi NXDOMAIN bilan yopadi (RFC 6761 6.2) — `local-zone: "test." nodefault` kerak.
- Unbound QNAME minimisation (RFC 9156) bilan ishlaydi: ildizga to'liq nom emas, faqat `test` so'raladi.
- tshark kalit bilan ochganda qayta yig'ish kerak: aks holda bir nechta segmentdagi TLS yozuvi ochilmaydi.
- `eksport.sh` da `TZ=UTC` — aks holda tshark sertifikat vaqtlarini VPS'ning mahalliy zonasida ko'rsatadi.
- tshark `/root` dagi faylni o'qishni rad etdi ("permission") — fayl stdin orqali beriladi (`tshark -r - < fayl`).
