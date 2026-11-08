# Nginx va HTTPS — veb-server, reverse proxy va sertifikat

Bu qo'llanma nginx'ni dasturchi ko'zi bilan o'rgatadi: statik saytni berish, ilovani (Node.js, PHP) nginx ortiga qo'yish (reverse proxy), yuklamani taqsimlash va keshlash, Let's Encrypt'dan bepul sertifikat olib HTTPS'ni yoqish, so'rovlarni cheklash va muammolarni topish.

Mundarija nginx'ning rasmiy hujjati (nginx.org), NGINX Admin Guide (docs.nginx.com) va Let's Encrypt hamda Certbot hujjatlari tuzilmasiga solishtirib tuzilgan. Har bob yonida u tayanadigan rasmiy sahifalar ko'rsatilgan. Har bobni yozishdan oldin shu sahifalar qayta o'qiladi. Buyruqlar real muhitda ishga tushirilib tekshiriladi, chiqishlar haqiqiy.

Manbalar va versiyalar (2026-11-07 da tekshirilgan):

| Narsa | Versiya | Qayerdan olindi |
| --- | --- | --- |
| nginx | Mainline 1.31.8 (2026-10-21), stable 1.30.6 (2026-10-14) | <https://nginx.org/en/download.html> · <https://nginx.org/> (yangiliklar) |
| Versiya tanlovi | Mainline. NGINX Admin Guide: mainline production uchun tavsiya etiladi, faqat barqarorlikka qat'iy talab bo'lsa stable afzal. O'rnatish — rasmiy nginx omboridan, u production uchun tavsiya etilgan. OS omboridagi paket "o'rganish yoki sinov uchun" mos, lekin odatda eskirgan | <https://docs.nginx.com/nginx/admin-guide/installing-nginx/installing-nginx-open-source/> |
| Ubuntu 26.04 paketi | 1.28.3 (main). nginx.org'da 1.28 — "legacy" versiyalar ro'yxatida | VPS: `apt-cache policy nginx` · <https://nginx.org/en/download.html> |
| nginx ombori | Ubuntu 26.04 "resolute" qo'llab-quvvatlanadi | <https://nginx.org/en/linux_packages.html> |
| Certbot | 5.9.0 (2026-10-29). O'rnatishning tavsiya etilgan yo'li — snap. Ubuntu 26.04 omboridagi paket — 4.0.0 (universe) | <https://github.com/certbot/certbot/releases> · <https://eff-certbot.readthedocs.io/en/stable/install.html> |
| Let's Encrypt | Standart (`classic`) profil — 90 kunlik sertifikat. 2028-yil fevralgacha maksimal muddat 45 kunga tushiriladi. `shortlived` profili — 160 soatlik sertifikat, domen nomidan tashqari IP manzil uchun ham | <https://letsencrypt.org/docs/profiles/> · <https://letsencrypt.org/docs/cert-lifetimes/> |
| Sinov VPS | Ubuntu 26.04 LTS | — |

Muhit tanlovi haqida:

- **HTTPS boblari uchun domen kerak.** Let's Encrypt standart holatda sertifikatni domen nomiga beradi va domen VPS'ga yo'naltirilgan bo'lishi kerak. Domen bo'lmasa, `shortlived` profili IP manzilga qisqa muddatli sertifikat beradi. Qaysi ACME klienti buni qo'llashi bobni yozishda tekshiriladi.
- **Sertifikatning ikki yo'li.** Let's Encrypt ko'pchilik uchun Certbot'ni tavsiya qiladi. nginx'ning o'zida ham ACME moduli bor (`ngx_http_acme_module`, nginx ombordagi `nginx-module-acme` paketi). Ikkalasi alohida boblarda ko'rsatiladi.
- **NGINX Plus.** NGINX Admin Guide pullik NGINX Plus'ni ham yoritadi. Faqat Plus'da bor imkoniyatlar (faol health check, API orqali dinamik sozlash va boshqalar) bu qo'llanmaga kirmaydi.

Qisqartmalar:

- **NG** — nginx.org rasmiy hujjati.
- **NA** — NGINX Admin Guide (docs.nginx.com).
- **LE** — Let's Encrypt hujjati.
- **CB** — Certbot hujjati.

"Muhit" ustunida:

- **V** — VPS'da: nginx rasmiy nginx omboridan.
- **V+D** — VPS va unga yo'naltirilgan domen (yoki `shortlived` profilidagi IP sertifikat).
- **—** — tushuncha bobi, buyruqsiz.

Bu qo'llanmaga kirmaydigan mavzular:

- HTTP, DNS va TLS'ning o'zi qanday ishlashi — **"Web asoslari"** kitobida.
- Firewall va serverni himoyalash — **"Server xavfsizligi"** kitobida.
- Domen, CI/CD va nol to'xtovli deploy — **"Deploy amaliyoti"** kitobida.
- Pochta proksi (mail), TCP/UDP proksi (stream), njs skriptlari — hujjatda: [NG docs](https://nginx.org/en/docs/).

> **Holat.** Qo'llanma yozilmoqda: 17/30 bob tayyor. Havolasi borlari — tayyor boblar.

---

## Har bobning skeleti

- **Tushuncha** — mavzu nima, oddiy so'zlar bilan. Qiyin joy animatsiya bilan.
- **Konfiguratsiya va buyruqlar** — VPS'da sinalgan konfiguratsiya va buyruqlarning **haqiqiy** chiqishi (`curl -i`, loglar).
- **Variantlar** — bir ishning bir necha yo'li bo'lsa, jadvalda: qachon qaysi biri, yutug'i va kamchiligi.
- **Tipik xatolar** — xato → nega yomon → to'g'ri yo'l.
- **Amaliyot** — savollar va javoblar.
- **Rasmiy hujjat** — bob tayangan sahifalar.

---

## I qism — Kirish (1–4)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 01 | [nginx nima qiladi](01-nginx-nima.md) | Veb-server, reverse proxy (so'rovni orqadagi ilovaga uzatuvchi), yuklamani taqsimlovchi, HTTPS'ni tugatuvchi. Master va worker jarayonlar | — | [NG Beginner's Guide](https://nginx.org/en/docs/beginners_guide.html) · [NA Web Server](https://docs.nginx.com/nginx/admin-guide/web-server/web-server/) |
| 02 | [O'rnatish](02-ornatish.md) | Rasmiy nginx ombori (mainline), Ubuntu paketi bilan farqi. Servis, `nginx -v` va `nginx -V` | V | [NG Linux packages](https://nginx.org/en/linux_packages.html) · [NA Installing NGINX Open Source](https://docs.nginx.com/nginx/admin-guide/installing-nginx/installing-nginx-open-source/) |
| 03 | [Konfiguratsiya tuzilishi](03-konfiguratsiya.md) | Direktivalar va bloklar: `events`, `http`, `server`, `location`. `include`. `nginx -t` bilan tekshirish | V | [NG Beginner's Guide](https://nginx.org/en/docs/beginners_guide.html) · [NA Configuration Files](https://docs.nginx.com/nginx/admin-guide/basic-functionality/managing-configuration-files/) |
| 04 | [nginx'ni boshqarish](04-boshqarish.md) | Signallar. `nginx -s reload`: yangi worker'lar yangi sozlama bilan ishga tushadi, eskilari ulanishlarni tugatib chiqadi. Loglarni qayta ochish (USR1). systemd bilan | V | [NG Controlling nginx](https://nginx.org/en/docs/control.html) · [NG Command-line parameters](https://nginx.org/en/docs/switches.html) · [NA Runtime Control](https://docs.nginx.com/nginx/admin-guide/basic-functionality/runtime-control/) |

## II qism — Veb-server (5–10)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 05 | [Statik sayt](05-statik-sayt.md) | `root` va `alias` farqi, `index`, `try_files` | V | [NA Serve Static Content](https://docs.nginx.com/nginx/admin-guide/web-server/serving-static-content/) · [NG core module](https://nginx.org/en/docs/http/ngx_http_core_module.html) · [NG index module](https://nginx.org/en/docs/http/ngx_http_index_module.html) |
| 06 | [So'rov qaysi server'ga tushadi](06-server-tanlash.md) | `listen` va `server_name` bo'yicha tanlash, `default_server`. `location` turlari (`=`, `^~`, `~`, prefiks) va tanlash tartibi | V | [NG How nginx processes a request](https://nginx.org/en/docs/http/request_processing.html) · [NG Server names](https://nginx.org/en/docs/http/server_names.html) · [NG core module → location](https://nginx.org/en/docs/http/ngx_http_core_module.html#location) |
| 07 | [Redirect va rewrite](07-redirect-rewrite.md) | `return 301`, `rewrite`. Regex'dagi guruhlarni ishlatish | V | [NG rewrite module](https://nginx.org/en/docs/http/ngx_http_rewrite_module.html) · [NG Converting rewrite rules](https://nginx.org/en/docs/http/converting_rewrite_rules.html) · [NG Regular expression captures](https://nginx.org/en/docs/regex_captures.html) |
| 08 | [Siqish](08-siqish.md) | `gzip`, `gzip_types`, oldindan siqilgan fayllar (`gzip_static`) | V | [NA Compression and Decompression](https://docs.nginx.com/nginx/admin-guide/web-server/compression/) · [NG gzip module](https://nginx.org/en/docs/http/ngx_http_gzip_module.html) · [NG gzip_static module](https://nginx.org/en/docs/http/ngx_http_gzip_static_module.html) |
| 09 | [Javob header'lari va keshlash muddati](09-headerlar-expires.md) | `add_header`, `expires` (`Cache-Control`). `always` parametri | V | [NG headers module](https://nginx.org/en/docs/http/ngx_http_headers_module.html) |
| 10 | [Loglar](10-loglar.md) | `access_log` va `log_format`, `error_log` darajalari, syslog'ga yozish | V | [NA Configuring Logging](https://docs.nginx.com/nginx/admin-guide/monitoring/logging/) · [NG log module](https://nginx.org/en/docs/http/ngx_http_log_module.html) · [NG Logging to syslog](https://nginx.org/en/docs/syslog.html) |

## III qism — Reverse proxy (11–17)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 11 | [Reverse proxy](11-reverse-proxy.md) | `proxy_pass` bilan orqadagi ilovaga uzatish. URI oxiridagi `/` farqi. `Host`, `X-Forwarded-For`, `X-Forwarded-Proto` header'lari | V | [NA Reverse Proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/) · [NG proxy module](https://nginx.org/en/docs/http/ngx_http_proxy_module.html) |
| 12 | [PHP-FPM bilan](12-php-fpm.md) | `fastcgi_pass` (Unix socket yoki port), `SCRIPT_FILENAME`, `fastcgi_params` | V | [NG fastcgi module](https://nginx.org/en/docs/http/ngx_http_fastcgi_module.html) |
| 13 | [WebSocket](13-websocket.md) | `Upgrade` va `Connection` header'larini uzatish, `proxy_http_version 1.1` | V | [NG WebSocket proxying](https://nginx.org/en/docs/http/websocket.html) |
| 14 | [Timeout va bufer](14-timeout-bufer.md) | `proxy_connect_timeout`, `proxy_read_timeout`, `proxy_buffering`. 502 va 504 qayerdan chiqadi | V | [NG proxy module](https://nginx.org/en/docs/http/ngx_http_proxy_module.html) · [NA Reverse Proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/) |
| 15 | [Yuklamani taqsimlash](15-yuklama.md) | `upstream`. Round-robin, `least_conn`, `ip_hash`, `hash`. Og'irlik (`weight`). Ishdan chiqqan serverni passiv aniqlash (`max_fails`, `fail_timeout`). `backup` server | V | [NG Using nginx as HTTP load balancer](https://nginx.org/en/docs/http/load_balancing.html) · [NG upstream module](https://nginx.org/en/docs/http/ngx_http_upstream_module.html) · [NA HTTP Load Balancing](https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/) |
| 16 | [Proxy kesh](16-proxy-kesh.md) | `proxy_cache_path`, `proxy_cache`, `proxy_cache_valid`. Backend ishlamaganda eski javobni berish (`proxy_cache_use_stale`) | V | [NA Content Caching](https://docs.nginx.com/nginx/admin-guide/content-cache/content-caching/) · [NG proxy module](https://nginx.org/en/docs/http/ngx_http_proxy_module.html) |
| 17 | [Mijozning haqiqiy IP manzili](17-haqiqiy-ip.md) | Boshqa proxy yoki CDN ortida: `set_real_ip_from`, `real_ip_header` | V | [NG realip module](https://nginx.org/en/docs/http/ngx_http_realip_module.html) |

## IV qism — HTTPS (18–25)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 18 | Sertifikat qanday olinadi | Let's Encrypt qanday ishlaydi: ACME protokoli, domen egasi ekanini isbotlash (challenge: HTTP-01, DNS-01). Sinov muhiti (staging) | — | [LE How It Works](https://letsencrypt.org/how-it-works/) · [LE Challenge Types](https://letsencrypt.org/docs/challenge-types/) · [LE Staging Environment](https://letsencrypt.org/docs/staging-environment/) |
| 19 | Certbot | Snap bilan o'rnatish. `certbot --nginx` va `certbot certonly --webroot`. Avtomatik yangilanishni tekshirish (`renew --dry-run`) | V+D | [LE Getting Started](https://letsencrypt.org/getting-started/) · [CB Install](https://eff-certbot.readthedocs.io/en/stable/install.html) · [CB User Guide](https://eff-certbot.readthedocs.io/en/stable/using.html) |
| 20 | nginx'ning ACME moduli | `nginx-module-acme` paketi. `acme_issuer` va `acme_certificate`: sertifikatni nginx o'zi oladi va yangilaydi | V+D | [NG acme module](https://nginx.org/en/docs/http/ngx_http_acme_module.html) · [NA ACME](https://docs.nginx.com/nginx/admin-guide/dynamic-modules/acme/) |
| 21 | HTTPS server | `listen 443 ssl`, `ssl_certificate`, `ssl_certificate_key`. Sertifikat zanjiri. Bir nechta domen bitta IP'da (SNI). HTTP'dan HTTPS'ga yo'naltirish | V+D | [NG Configuring HTTPS servers](https://nginx.org/en/docs/http/configuring_https_servers.html) · [NG ssl module](https://nginx.org/en/docs/http/ngx_http_ssl_module.html) |
| 22 | TLS sozlamalari | `ssl_protocols`, `ssl_ciphers`, sessiya keshi (`ssl_session_cache`) | V+D | [NG Configuring HTTPS servers](https://nginx.org/en/docs/http/configuring_https_servers.html) · [NG ssl module](https://nginx.org/en/docs/http/ngx_http_ssl_module.html) |
| 23 | HSTS | `Strict-Transport-Security` header'i: brauzer saytga faqat HTTPS orqali kiradi. Xavfi va to'g'ri yoqish | V+D | [NG headers module](https://nginx.org/en/docs/http/ngx_http_headers_module.html) · [RFC 6797](https://www.rfc-editor.org/rfc/rfc6797) |
| 24 | HTTP/2 va HTTP/3 | `http2 on`. QUIC va HTTP/3 (`listen ... quic`), UDP porti | V+D | [NG v2 module](https://nginx.org/en/docs/http/ngx_http_v2_module.html) · [NG QUIC and HTTP/3](https://nginx.org/en/docs/quic.html) · [NG v3 module](https://nginx.org/en/docs/http/ngx_http_v3_module.html) |
| 25 | Sertifikat muammolari | Muddati o'tgan, zanjiri to'liq bo'lmagan yoki nomi mos kelmaydigan sertifikat. `openssl s_client` bilan tekshirish. Let's Encrypt chegaralari (rate limits). 80-port nega ochiq turishi kerak | V+D | [NG Configuring HTTPS servers](https://nginx.org/en/docs/http/configuring_https_servers.html) · [LE Rate Limits](https://letsencrypt.org/docs/rate-limits/) · [LE Keep Port 80 Open](https://letsencrypt.org/docs/allow-port-80/) |

## V qism — Himoya va kuzatish (26–30)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 26 | So'rovlarni cheklash | `limit_req`: tezlik, `burst`, `nodelay`. `limit_conn`: bir vaqtdagi ulanishlar soni | V | [NA Limiting Access to Proxied HTTP Resources](https://docs.nginx.com/nginx/admin-guide/security-controls/controlling-access-proxied-http/) · [NG limit_req module](https://nginx.org/en/docs/http/ngx_http_limit_req_module.html) · [NG limit_conn module](https://nginx.org/en/docs/http/ngx_http_limit_conn_module.html) |
| 27 | Kirishni cheklash | IP bo'yicha `allow`/`deny`. Parol bilan kirish (basic auth, `htpasswd`) | V | [NG access module](https://nginx.org/en/docs/http/ngx_http_access_module.html) · [NG auth_basic module](https://nginx.org/en/docs/http/ngx_http_auth_basic_module.html) · [NA HTTP Basic Authentication](https://docs.nginx.com/nginx/admin-guide/security-controls/configuring-http-basic-authentication/) |
| 28 | Backend bilan shifrlangan ulanish | Proxy'dan orqadagi serverga TLS: `proxy_ssl_*`, sertifikatni tekshirish | V | [NA Securing HTTP Traffic to Upstream Servers](https://docs.nginx.com/nginx/admin-guide/security-controls/securing-http-traffic-upstream/) · [NG proxy module](https://nginx.org/en/docs/http/ngx_http_proxy_module.html) |
| 29 | Holat va muammolarni topish | `stub_status`. Debug log. `nginx -T` bilan to'liq konfiguratsiyani ko'rish. 413, 502, 504 kodlarining sabablari | V | [NG stub_status module](https://nginx.org/en/docs/http/ngx_http_stub_status_module.html) · [NG A debugging log](https://nginx.org/en/docs/debugging_log.html) · [NA Debugging NGINX](https://docs.nginx.com/nginx/admin-guide/monitoring/debugging/) |
| 30 | Ishlash sozlamalari | `worker_processes`, `worker_connections`, `keepalive_timeout`, `sendfile`. Ulanishlarni qayta ishlash usullari | V | [NG core functionality](https://nginx.org/en/docs/ngx_core_module.html) · [NG Connection processing methods](https://nginx.org/en/docs/events.html) · [NG core module](https://nginx.org/en/docs/http/ngx_http_core_module.html) |

---

## Animatsiyalar (qiyin tushunchalar)

| Bob | Nimani ko'rsatadi |
| --- | --- |
| 04 | Reload: yangi worker'lar ishga tushadi, eskilari joriy so'rovlarni tugatib chiqadi |
| 06 | Bitta so'rov uchun `location` tanlash tartibi qadamma-qadam |
| 11 | `proxy_pass` oxirida `/` bor va yo'q: backend'ga qaysi URI boradi |
| 18 | ACME: HTTP-01 challenge'da Let's Encrypt serverga qanday murojaat qiladi |
| 26 | `limit_req`: `burst` va `nodelay` bilan so'rovlar navbati |
