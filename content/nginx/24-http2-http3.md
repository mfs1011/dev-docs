# 24 — HTTP/2 va HTTP/3

[Mundarija](README.md)

## Tushuncha

HTTP protokolining uchta versiyasi bir xil narsani — so'rov va javobni — turlicha tashiydi:

| Versiya | Transport | Asosiy farq |
| --- | --- | --- |
| HTTP/1.1 | TCP (+TLS) | Bitta ulanishda so'rovlar navbat bilan |
| HTTP/2 | TCP + TLS | Bitta ulanishda ko'p so'rov **parallel** (oqimlar, streams) |
| HTTP/3 | **QUIC** (UDP ustida) + TLS 1.3 | TCP o'rniga QUIC |

Brauzer HTTPS ulanishida qaysi versiyada gaplashishni TLS handshake ichida kelishadi — **ALPN** (Application-Layer Protocol Negotiation) kengaytmasi bilan. NG v2 module: HTTP/2 TLS orqali ALPN'ni talab qiladi (OpenSSL 1.0.2 dan).

HTTP/3 boshqacha: u UDP'da ishlaydi, shuning uchun brauzer uni oldindan bilmaydi. Server avval HTTP/1.1 yoki HTTP/2 javobida **`Alt-Svc`** header'i bilan "men shu portda HTTP/3 ham beraman" deb e'lon qiladi. Mijoz keyingi so'rovlarni HTTP/3 orqali yuboradi.

nginx'da:

| | Direktiva | Hujjat |
| --- | --- | --- |
| HTTP/2 | `http2 on;` (1.25.1 dan; standart `off`) | NG v2 module |
| HTTP/3 | `listen 443 quic reuseport;` va `http3 on;` (standart `on`) | NG v3 module, NG QUIC and HTTP/3 |

NG QUIC and HTTP/3: QUIC va HTTP/3 1.25.0 dan bor va Linux paketlariga kiritilgan. NG v3 module uni hali **experimental** (tajriba bosqichida) deb ataydi.

> **Chiqishlar haqida.** Sinov VPS'ida haqiqiy domen bilan sinalgan, domen `example.com` bilan almashtirilgan. HTTP/3 mijozi — noutbukdagi Homebrew curl (macOS'ning o'z curl'i HTTP/3 bilmaydi).

## Tekshiramiz: nginx nima bilan qurilgan

```text vps
$ nginx -V 2>&1 | tr " " "\n" | grep -E "v2|v3|quic"
--with-http_v2_module
--with-http_v3_module
$ ufw status | grep 443
443                        ALLOW       Anywhere                  
443 (v6)                   ALLOW       Anywhere (v6)
```

- nginx.org paketida ikkala modul ham bor.
- Firewall'da `443` qoidasi protokolsiz yozilgan (`443/tcp` emas) — TCP ham, UDP ham ochiq (firewall — Linux kitobi, 43-bob). HTTP/3 uchun **UDP 443** kerak.

## Yoqish

Hozir HTTP/1.1 (noutbukdan):

```text tashqi
$ curl -sI https://example.com/ | head -1
HTTP/1.1 200 OK
```

NG v3 module misolidagidek, HTTP/3 uchun TCP bilan **bir xil port** va `Alt-Svc`:

```text vps
$ sed -n "/listen 443/,\$p" /etc/nginx/conf.d/sayt.conf
    listen 443 ssl;
    listen 443 quic reuseport;
    http2 on;
    server_name example.com www.example.com;
    root /var/www/sayt;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    add_header Strict-Transport-Security "max-age=300" always;
    add_header Alt-Svc 'h3=":443"; ma=86400';

    add_header_inherit merge;

    location /rasmlar/ {
        add_header Cache-Control "public, max-age=86400";
    }
}
$ nginx -t -q && nginx -s reload; sleep 2
$ ss -tulnp | grep ":443 " | awk "{print \$1, \$5}" | sort -u
tcp 0.0.0.0:443
udp 0.0.0.0:443
```

- `listen 443 quic` — shu portda UDP'da QUIC. NG QUIC: `reuseport` — bir nechta worker bilan to'g'ri ishlashi uchun. `reuseport` bir manzil:port uchun **bitta** `listen` da yoziladi.
- `http2 on` — HTTP/2.
- `Alt-Svc: h3=":443"; ma=86400` — "HTTP/3 shu hostning 443-portida, 86400 soniya (1 kun) eslab qol".
- `ss` da 443 endi TCP'da ham, UDP'da ham.
- HSTS (23-bob) va `add_header_inherit merge` joyida qoldi.

## Natija

Noutbukdan:

```text tashqi
$ curl -sI https://example.com/ | grep -iE "^(HTTP|alt-svc)"
HTTP/2 200 
alt-svc: h3=":443"; ma=86400
$ /opt/homebrew/opt/curl/bin/curl --version | head -1
curl 8.22.0 (aarch64-apple-darwin25.6.0) libcurl/8.22.0 OpenSSL/4.0.3 zlib/1.2.12 brotli/1.2.0 zstd/1.5.7 AppleIDN libpsl/0.23.3 libssh2/1.11.1 nghttp2/1.70.0 ngtcp2/1.25.0 nghttp3/1.18.0 mit-krb5/1.7-prerelease OpenLDAP/2.4.28/Apple
$ /opt/homebrew/opt/curl/bin/curl -sI --http3-only https://example.com/ | head -1
HTTP/3 200 
```

- Oddiy curl endi **HTTP/2** da gaplashdi (ALPN) va `alt-svc` ni oldi. HTTP/2 header nomlari kichik harfda.
- Homebrew curl'da `ngtcp2` va `nghttp3` — QUIC va HTTP/3 kutubxonalari. `--http3-only` — faqat HTTP/3: `HTTP/3 200`.

Brauzer qanday o'tadi — curl'ning Alt-Svc keshi bilan (`--alt-svc fayl`; xuddi 23-bobdagi `--hsts` kabi):

```text tashqi
$ /opt/homebrew/opt/curl/bin/curl -s --alt-svc altsvc.txt -o /dev/null -w "%{http_version}\n" https://example.com/
2
$ grep -v "^#" altsvc.txt
h2 example.com 443 h3 example.com 443 "20261110 12:07:32" 0 0
$ /opt/homebrew/opt/curl/bin/curl -s --alt-svc altsvc.txt -o /dev/null -w "%{http_version}\n" https://example.com/
3
```

1. Birinchi so'rov HTTP/2 da (`2`). Javobdagi `Alt-Svc` faylga yozildi: "`h2` dagi `example.com:443` uchun `h3` muqobil, 1 kungacha".
2. Ikkinchi so'rov o'zi HTTP/3 ga o'tdi (`3`).

Serverda ham ko'rinadi — access log'dagi protokol (log — 10-bob):

```text vps
$ tail -5 /var/log/nginx/access.log | cut -d" " -f6-9
"HEAD / HTTP/1.1" 200
"HEAD / HTTP/2.0" 200
"HEAD / HTTP/3.0" 200
"GET / HTTP/2.0" 200
"GET / HTTP/3.0" 200
```

NG v3 module log uchun yana `$http3` o'zgaruvchisini beradi: HTTP/3 da `h3`, aks holda bo'sh.

## Variantlar

| Holat | Sozlama |
| --- | --- |
| Har qanday HTTPS sayt | `http2 on` — xavf kam, mijoz bilmasa HTTP/1.1 da qoladi |
| HTTP/3 sinab ko'rish | `listen … quic reuseport` + `Alt-Svc`, UDP port ochiq |
| UDP yopiq tarmoqlar | Mijoz HTTP/2 da qoladi — `Alt-Svc` faqat taklif |
| Bir nechta `server` 443 da | `reuseport` faqat bittasida, qolganlarida `listen 443 quic;` |

NG QUIC hujjatidagi qo'shimcha sozlamalar: `quic_retry on` (manzilni tekshirish), `ssl_early_data on` (0-RTT; OpenSSL 3.5.1+), `quic_gso on` (tarmoq kartasi qo'llasa). QUIC TLS 1.3 ni talab qiladi — u standart `ssl_protocols` da yoqilgan (22-bob).

## Tipik xatolar

| Xato | Belgisi | To'g'ri yo'l |
| --- | --- | --- |
| UDP 443 firewall'da yopiq | HTTP/3 hech qachon ishlamaydi, xato ham yo'q (mijoz jim HTTP/2 da qoladi) | `ss -ulnp` va firewall qoidalarini tekshirish |
| `Alt-Svc` yo'q | Brauzer HTTP/3 borligini bilmaydi | `add_header Alt-Svc 'h3=":443"; ma=86400';` |
| `Alt-Svc` dagi port boshqa | Mijoz noto'g'ri portga urinadi | QUIC `listen` porti bilan bir xil |
| `reuseport` ni ikki `server` da yozish | `nginx -t`: `duplicate listen options for 0.0.0.0:443` | Bir marta |
| `ssl_protocols` dan TLS 1.3 ni olib tashlash | QUIC ishlamaydi | TLS 1.3 yoqilgan bo'lishi shart |
| Tekshiruvni brauzerdan boshlash | NG QUIC: brauzerlar sertifikatlarga juda talabchan | Avval konsol mijoz (bizda — curl `--http3-only`) |

## Amaliyot

1. `http2 on` ni olib tashlab, `curl -sI https://example.com/` ning birinchi qatori qanday bo'ladi?
2. `log_format` ga `$http3` qo'shing (NG v3 module misoli) va HTTP/2 va HTTP/3 so'rovlari log'da qanday farq qilishini ko'ring.
3. `ufw delete allow 443` va `ufw allow 443/tcp` qilsangiz (faqat sinov serverida!), `--http3-only` nima qaytaradi? Oddiy `curl -sI` chi?
4. Nega `Alt-Svc` ni HTTP (80-port) javobiga qo'yish ma'nosiz?

## Rasmiy hujjat

- NG — `ngx_http_v2_module`: <https://nginx.org/en/docs/http/ngx_http_v2_module.html>
- NG — Support for QUIC and HTTP/3: <https://nginx.org/en/docs/quic.html>
- NG — `ngx_http_v3_module`: <https://nginx.org/en/docs/http/ngx_http_v3_module.html>
- NG — `listen` (`quic`, `reuseport`): <https://nginx.org/en/docs/http/ngx_http_core_module.html#listen>
- curl — `--http3-only`, `--alt-svc`: <https://curl.se/docs/manpage.html>
- RFC 7838 — HTTP Alternative Services (`Alt-Svc`): <https://www.rfc-editor.org/rfc/rfc7838>
