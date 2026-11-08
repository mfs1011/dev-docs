# 28 — Backend bilan shifrlangan ulanish

[Mundarija](README.md)

## Tushuncha

Odatda HTTPS nginx'da tugaydi va nginx backend'ga oddiy HTTP bilan boradi (11-bob). Backend boshqa serverda yoki ishonchsiz tarmoq orqali bo'lsa, nginx → backend ulanishini ham **shifrlash** kerak.

NA (Securing HTTP Traffic to Upstream Servers):

1. `proxy_pass` da protokol — **`https`**.
2. Backend serverlari HTTPS qabul qilishi kerak (`listen 443 ssl`, `ssl_certificate`, `ssl_certificate_key`). Sertifikat — ishonchli CA'dan sotib olingan yoki OpenSSL bilan yaratilgan **ichki CA** dan.
3. O'z CA'ngiz yoki self-signed sertifikat bo'lsa — `proxy_ssl_trusted_certificate` (PEM) va `proxy_ssl_verify on`.
4. Ixtiyoriy: nginx backend'ga **mijoz sertifikati** bilan o'zini tanitadi — `proxy_ssl_certificate`, `proxy_ssl_certificate_key`; backend `ssl_client_certificate` va `ssl_verify_client` bilan tekshiradi.
5. `proxy_ssl_session_reuse on` — oldingi sessiya parametrlari bilan qisqa handshake (to'liq handshake protsessorga og'ir).
6. `proxy_ssl_protocols`, `proxy_ssl_ciphers` — protokol va shifrlar.

### Muhim standart qiymatlar

| Direktiva | Standart (NG) | Ma'nosi |
| --- | --- | --- |
| `proxy_ssl_verify` | **`off`** | Backend sertifikati **tekshirilmaydi** — shifrlangan, lekin kim bilan ekani noma'lum |
| `proxy_ssl_name` | `$proxy_host` | Sertifikatni tekshirishda va SNI'da ishlatiladigan nom — `proxy_pass` dagi host |
| `proxy_ssl_server_name` | `off` | SNI yuborilmaydi |
| `proxy_ssl_verify_depth` | `1` | Sertifikat zanjiri tekshiruvi chuqurligi |
| `proxy_ssl_session_reuse` | `on` | Sessiyalarni qayta ishlatish |

## Ko'rib chiqamiz

VPS'da (nginx 1.31.8). Backend — o'sha nginx'dagi alohida TLS server (`127.0.0.1:8443`); sertifikatlar — sinov uchun 1 kunlik ichki CA'dan:

```text vps
$ mkdir -p /etc/nginx/tls-sinov && cd /etc/nginx/tls-sinov && for ca in ca begona-ca; do openssl req -x509 -newkey rsa:2048 -nodes -days 1 -subj "/CN=$ca" -keyout $ca.key -out $ca.crt 2>/dev/null; done; openssl req -newkey rsa:2048 -nodes -subj /CN=backend.ichki -addext 'subjectAltName=DNS:backend.ichki' -keyout backend.key -out backend.csr 2>/dev/null; openssl x509 -req -in backend.csr -CA ca.crt -CAkey ca.key -CAcreateserial -days 1 -copy_extensions copy -out backend.crt 2>/dev/null; openssl req -newkey rsa:2048 -nodes -subj /CN=oldingi-nginx -keyout mijoz.key -out mijoz.csr 2>/dev/null; openssl x509 -req -in mijoz.csr -CA ca.crt -CAkey ca.key -CAcreateserial -days 1 -out mijoz.crt 2>/dev/null; chmod 640 *.key; chgrp nginx *.key; openssl x509 -in backend.crt -noout -subject -issuer -ext subjectAltName
subject=CN=backend.ichki
issuer=CN=ca
X509v3 Subject Alternative Name: 
    DNS:backend.ichki
```

Backend sertifikati `backend.ichki` nomiga (SAN), `ca` tomonidan imzolangan. `begona-ca` — boshqa, aloqasiz CA; `mijoz` — oldingi nginx uchun mijoz sertifikati.

```nginx
# "Backend": TLS bilan, nginx'ning o'zi (sinov uchun)
server {
    listen 127.0.0.1:8443 ssl;
    server_name backend.ichki;
    ssl_certificate        /etc/nginx/tls-sinov/backend.crt;
    ssl_certificate_key    /etc/nginx/tls-sinov/backend.key;
    ssl_client_certificate /etc/nginx/tls-sinov/ca.crt;
    ssl_verify_client      optional;
    location / {
        return 200 "backend: $ssl_protocol, mijoz sertifikati: $ssl_client_verify\n";
    }
}

# Oldingi nginx: backend'ga HTTPS bilan
server {
    listen 127.0.0.1:8117;
    proxy_ssl_session_reuse off;

    location /tekshirmasdan/ {
        proxy_pass https://127.0.0.1:8443/;
    }
    location /nom-mos-emas/ {
        proxy_pass https://127.0.0.1:8443/;
        proxy_ssl_verify              on;
        proxy_ssl_trusted_certificate /etc/nginx/tls-sinov/ca.crt;
    }
    location /tekshir/ {
        proxy_pass https://127.0.0.1:8443/;
        proxy_ssl_verify              on;
        proxy_ssl_trusted_certificate /etc/nginx/tls-sinov/ca.crt;
        proxy_ssl_name                backend.ichki;
        proxy_ssl_server_name         on;
    }
    location /begona-ca/ {
        proxy_pass https://127.0.0.1:8443/;
        proxy_ssl_verify              on;
        proxy_ssl_trusted_certificate /etc/nginx/tls-sinov/begona-ca.crt;
        proxy_ssl_name                backend.ichki;
    }
    location /mijoz-sert/ {
        proxy_pass https://127.0.0.1:8443/;
        proxy_ssl_verify              on;
        proxy_ssl_trusted_certificate /etc/nginx/tls-sinov/ca.crt;
        proxy_ssl_name                backend.ichki;
        proxy_ssl_certificate         /etc/nginx/tls-sinov/mijoz.crt;
        proxy_ssl_certificate_key     /etc/nginx/tls-sinov/mijoz.key;
    }
}
```

```text vps
$ cp /root/upstream-tls.conf /etc/nginx/conf.d/; rm /root/upstream-tls.conf; nginx -t -q && nginx -s reload; sleep 0.5; echo tayyor
tayyor
```

### Tekshiruvsiz va nom mos emas

`u URI` — kod va backend javobi:

```text vps
$ u() { printf '%-16s %s' "$1" "$(curl -s -o /tmp/j -w '%{http_code}' http://127.0.0.1:8117$1)"; echo " $(head -1 /tmp/j | grep -v '<html>')"; }; u /tekshirmasdan/; u /nom-mos-emas/; tail -n 1 /var/log/nginx/error.log | grep -oE 'upstream SSL certificate does not match "[^"]*"|certificate verify error[^,]*'
/tekshirmasdan/  200 backend: TLSv1.3, mijoz sertifikati: NONE
/nom-mos-emas/   502 
upstream SSL certificate does not match "127.0.0.1"
```

- `/tekshirmasdan/` — **200**: standart `proxy_ssl_verify off`, nginx sertifikatni umuman tekshirmadi. Ulanish shifrlangan (TLSv1.3), lekin backend o'rnida boshqa server bo'lsa ham farqi bo'lmasdi.
- `/nom-mos-emas/` — tekshiruv yoqilgan, lekin `proxy_pass https://127.0.0.1:8443` → nom `127.0.0.1`, sertifikat esa `backend.ichki` ga: **502**, `upstream SSL certificate does not match "127.0.0.1"`.

### To'g'ri tekshiruv, begona CA, mijoz sertifikati

```text vps
$ u /tekshir/; u /begona-ca/; tail -n 1 /var/log/nginx/error.log | grep -oE 'upstream SSL certificate verify error: \([^)]*\)'; u /mijoz-sert/
/tekshir/        200 backend: TLSv1.3, mijoz sertifikati: NONE
/begona-ca/      502 
upstream SSL certificate verify error: (21:unable to verify the first certificate)
/mijoz-sert/     200 backend: TLSv1.3, mijoz sertifikati: SUCCESS
```

| Location | Natija | Nega |
| --- | --- | --- |
| `/tekshir/` | 200 | Ishonchli CA + `proxy_ssl_name backend.ichki` |
| `/begona-ca/` | **502**, `unable to verify the first certificate` | Backend sertifikatini imzolagan CA ishonchlilar ro'yxatida yo'q |
| `/mijoz-sert/` | 200, backend: `SUCCESS` | nginx mijoz sertifikati bilan o'zini tanitdi |

Bu natijalar `proxy_ssl_session_reuse off` (server darajasida) bilan olindi.

### Sessiyani qayta ishlatish — kuzatilgan holat

Xuddi shu konfiguratsiya, lekin standart `proxy_ssl_session_reuse on` bilan:

```text vps
$ u() { printf '%-16s %s' "$1" "$(curl -s -o /tmp/j -w '%{http_code}' http://127.0.0.1:8117$1)"; echo " $(head -1 /tmp/j | grep -v '<html>')"; }; u /tekshir/; u /begona-ca/; grep -c 'certificate verify error' /var/log/nginx/error.log | sed 's/^/jurnalda verify error: /'; u /mijoz-sert/
/tekshir/        200 backend: TLSv1.3, mijoz sertifikati: NONE
/begona-ca/      200 backend: TLSv1.3, mijoz sertifikati: NONE
jurnalda verify error: 2
/mijoz-sert/     200 backend: TLSv1.3, mijoz sertifikati: NONE
```

Kuzatildi: avval `/tekshir/` backend bilan TLS sessiya o'rnatdi; keyin xuddi shu backend manziliga boradigan `/begona-ca/` **200** berdi (jurnalda tekshiruv xatosi bor, lekin so'rov o'tdi), `/mijoz-sert/` da esa backend mijoz sertifikatini ko'rmadi (`NONE`). Bir xil backend'ga boradigan location'larda **turli** tekshiruv yoki mijoz sertifikati sozlamalari bo'lsa, sessiya qayta ishlatilganda kutilgan tekshiruv bajarilmasligi mumkin. Hujjatda bu holat tasvirlanmagan; sinovda `proxy_ssl_session_reuse off` uni bartaraf etdi.

```text vps
$ rm /etc/nginx/conf.d/upstream-tls.conf; rm -rf /etc/nginx/tls-sinov; nginx -t -q && nginx -s reload; echo ok
ok
```

## Variantlar

| Vaziyat | Sozlama |
| --- | --- |
| Backend ichki CA bilan | `proxy_ssl_verify on` + `proxy_ssl_trusted_certificate ca.crt` |
| `proxy_pass` da IP, sertifikat nomga | `proxy_ssl_name <nom>` |
| Bir IP'da bir nechta TLS sayt | `proxy_ssl_server_name on` (SNI) |
| Backend kim kelganini tekshirsin | `proxy_ssl_certificate` + backend'da `ssl_verify_client` |
| Bir backend'ga turli tekshiruvli location'lar | Bir xil sozlamalar yoki `proxy_ssl_session_reuse off` (kuzatildi) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| `https://` yozib, xavfsiz deb o'ylash | `proxy_ssl_verify` standart `off` — sertifikat tekshirilmaydi (sinovda) | `proxy_ssl_verify on` + ishonchli CA |
| `proxy_pass` da IP, tekshiruv yoqilgan | Nom mos emas — 502 (sinovda) | `proxy_ssl_name` |
| Ichki CA sertifikatini ko'rsatmaslik | `unable to verify …` — 502 | `proxy_ssl_trusted_certificate` |
| Zanjirda oraliq CA bor, `proxy_ssl_verify_depth` standart | Chuqurlik 1 — tekshiruv yiqilishi mumkin | `proxy_ssl_verify_depth 2` (NA misoli) |
| Kalitlarni hamma o'qiy oladigan qilish | Maxfiy kalit oshkor | `640`, guruh `nginx` |

## Amaliyot

1. `proxy_pass https://…` bo'lsa, nginx standart holatda backend sertifikatini tekshiradimi?
2. Sinovda `/nom-mos-emas/` nega 502 berdi va qanday tuzatildi?
3. `proxy_ssl_trusted_certificate` nima uchun?
4. nginx backend'ga o'zini qanday tanitadi?
5. `proxy_ssl_name` ning standart qiymati nima?
6. Sinovda `proxy_ssl_session_reuse on` bilan nima kuzatildi?

<details>
<summary>Javoblar</summary>

1. Yo'q — `proxy_ssl_verify off` standart.
2. Tekshiruv `127.0.0.1` nomi bilan bo'ldi, sertifikat `backend.ichki` ga; `proxy_ssl_name backend.ichki` bilan.
3. Backend sertifikatini imzolagan (ichki) CA'ni ishonchli deb ko'rsatish uchun.
4. `proxy_ssl_certificate` va `proxy_ssl_certificate_key` (mijoz sertifikati).
5. `$proxy_host` — `proxy_pass` dagi host.
6. Bir backend'ga boradigan boshqa location (begona CA) sessiya qayta ishlatilgani uchun 200 berdi, mijoz sertifikati yuborilmadi; `off` bilan to'g'ri ishladi.

</details>

## Rasmiy hujjat

- [NA: Securing HTTP Traffic to Upstream Servers](https://docs.nginx.com/nginx/admin-guide/security-controls/securing-http-traffic-upstream/)
- [NG: ngx_http_proxy_module](https://nginx.org/en/docs/http/ngx_http_proxy_module.html) — `proxy_ssl_verify`, `proxy_ssl_trusted_certificate`, `proxy_ssl_name`, `proxy_ssl_server_name`, `proxy_ssl_certificate`, `proxy_ssl_session_reuse`
- [NG: ngx_http_ssl_module](https://nginx.org/en/docs/http/ngx_http_ssl_module.html) — `ssl_client_certificate`, `ssl_verify_client`
