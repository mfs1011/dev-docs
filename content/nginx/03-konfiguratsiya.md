# 03 — Konfiguratsiya tuzilishi

[Mundarija](README.md)

## Tushuncha

NG (Beginner's Guide): nginx **modullar**dan iborat, ular konfiguratsiya faylidagi **direktivalar** bilan boshqariladi.

### Direktivalar

| Tur | Ko'rinishi |
| --- | --- |
| **Oddiy direktiva** | Nom va bo'sh joy bilan ajratilgan parametrlar, oxirida **nuqtali vergul** (`;`): `worker_processes 1;` |
| **Blok direktiva** | Xuddi shunday, lekin `;` o'rniga **jingalak qavslar** (`{ }`) ichida boshqa direktivalar |
| **Kontekst** | Ichida boshqa direktivalar bo'la oladigan blok: `events`, `http`, `server`, `location` |

`#` dan keyingi qator qismi — izoh.

### Kontekstlar

Hech qanday kontekstga kirmagan direktivalar — **main** (asosiy) kontekstda. NG va NA:

| Kontekst | Qayerda | Nima |
| --- | --- | --- |
| main | Fayl ildizi | Umumiy: `user`, `worker_processes`, `error_log`, `pid` |
| `events` | main | Ulanishlarni qayta ishlash |
| `http` | main | HTTP trafik, barcha virtual serverlarga ta'sir qiladi |
| `server` | `http` | **Virtual server** — ma'lum domen yoki IP manzil uchun so'rovlar (6-bob) |
| `location` | `server` | URI'larning ma'lum to'plami (6-bob) |
| `mail`, `stream` | main | Pochta, TCP/UDP trafik (bu qo'llanmada yo'q) |

```nginx
user nobody;               # main kontekstdagi direktiva

events {
    # ulanishlarni qayta ishlash sozlamalari
}

http {
    # HTTP uchun, barcha virtual serverlarga ta'sir qiladi
    server {
        # 1-virtual server
        location /one {
            # '/one' bilan boshlanadigan URI'lar
        }
        location /two {
            # '/two' bilan boshlanadigan URI'lar
        }
    }
    server {
        # 2-virtual server
    }
}
```

(NA'dagi namuna.)

### Meros

NA: odatda ichki kontekst (child) tashqi kontekst (parent) sozlamalarini **meros oladi**. Bir direktiva bir nechta kontekstda bo'la olsa, ichki kontekstda uni qayta belgilab, merosni almashtirish mumkin.

Muhim istisno — **massiv** direktivalar: masalan `add_header` (NG, headers module): bir nechta `add_header` bo'lishi mumkin, ular tashqi darajadan **faqat joriy darajada bitta ham `add_header` bo'lmasa** meros olinadi (1.29.3 dan qoidani `add_header_inherit` bilan o'zgartirish mumkin; 9-bob).

### Fayllarga bo'lish: `include`

NG: `include fayl | maska;` — boshqa faylni yoki maskaga mos fayllarni shu joyga qo'shadi; har qanday kontekstda. Qo'shilayotgan fayllar sintaksis jihatidan to'g'ri direktivalar va bloklardan iborat bo'lishi kerak. NA: konfiguratsiyani boshqarish oson bo'lishi uchun uni vazifa bo'yicha fayllarga bo'lib, `/etc/nginx/conf.d` ga qo'yish va `nginx.conf` da `include` bilan ulash.

### Tekshirish va ko'rish

NG (Command-line parameters):

| Parametr | Nima |
| --- | --- |
| `nginx -t` | Konfiguratsiyani tekshirish: sintaksis to'g'rimi, keyin unda ko'rsatilgan fayllarni ochishga urinadi |
| `nginx -T` | `-t` + barcha konfiguratsiya fayllarini ekranga chiqarish (1.9.2 dan) |
| `nginx -q` | Tekshirishda xato bo'lmagan xabarlarni chiqarmaslik |
| `nginx -c fayl` | Boshqa konfiguratsiya fayli |
| `nginx -g "direktivalar"` | Umumiy direktivalarni buyruq qatoridan berish |

Konfiguratsiyadagi o'zgarish **qayta yuklash**siz kuchga kirmaydi (NA) — 4-bob.

## Ko'rib chiqamiz

VPS'da (nginx 1.31.8).

### Rasmiy paketdagi `nginx.conf`

```text vps
$ grep -vE '^\s*(#|$)' /etc/nginx/nginx.conf
user  nginx;
worker_processes  auto;
error_log  /var/log/nginx/error.log notice;
pid        /run/nginx.pid;
events {
    worker_connections  1024;
}
http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';
    access_log  /var/log/nginx/access.log  main;
    sendfile        on;
    keepalive_timeout  65;
    include /etc/nginx/conf.d/*.conf;
}
```

- main: `user`, `worker_processes`, `error_log`, `pid` (2-bob).
- `events` ichida `worker_connections 1024` — bitta worker'ning bir vaqtdagi ulanishlari chegarasi.
- `http` ichida: MIME turlari (`include /etc/nginx/mime.types`), kirish jurnali formati, va **`include /etc/nginx/conf.d/*.conf;`** — saytlar shu papkadagi alohida fayllarda.

```text vps
$ nginx -t
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### `nginx -t` xatolarni ko'rsatadi

`conf.d/sinov.conf` ga ataylab xatolar:

```text vps
$ printf '%s\n' 'server {' '    listen 8081' '    location / { return 200 "salom\n"; }' '}' > /etc/nginx/conf.d/sinov.conf; nginx -t
nginx: [emerg] directive "listen" is not terminated by ";" in /etc/nginx/conf.d/sinov.conf:3
nginx: configuration file /etc/nginx/nginx.conf test failed
$ printf '%s\n' 'location / { return 200 "salom\n"; }' > /etc/nginx/conf.d/sinov.conf; nginx -t
nginx: [emerg] "location" directive is not allowed here in /etc/nginx/conf.d/sinov.conf:1
nginx: configuration file /etc/nginx/nginx.conf test failed
$ printf '%s\n' 'server {' '    listen 8081;' '    lisen 8082;' '}' > /etc/nginx/conf.d/sinov.conf; nginx -t
nginx: [emerg] unknown directive "lisen" in /etc/nginx/conf.d/sinov.conf:3
nginx: configuration file /etc/nginx/nginx.conf test failed
$ printf '%s\n' 'server {' '    listen 8081;' '    location / { return 200 "salom\n"; }' > /etc/nginx/conf.d/sinov.conf; nginx -t
nginx: [emerg] unexpected end of file, expecting "}" in /etc/nginx/conf.d/sinov.conf:4
nginx: configuration file /etc/nginx/nginx.conf test failed
```

| Xato | `nginx -t` |
| --- | --- |
| `listen 8081` dan keyin `;` yo'q | `is not terminated by ";"` — **3-qatorni** ko'rsatdi: nginx keyingi qatorni ham shu direktivaning parametri deb o'qishda davom etgan |
| `location` `server` dan tashqarida | `"location" directive is not allowed here` — noto'g'ri kontekst |
| `lisen` (yozuv xatosi) | `unknown directive "lisen"` |
| Yopilmagan `{` | `unexpected end of file, expecting "}"` |

Har safar fayl nomi va qator raqami — `[emerg]` darajasi (eng og'ir).

### Meros: `add_header`

```text vps
$ printf '%s\n' 'add_header X-Http "http darajasi";' 'server {' '    listen 8081;' '    add_header X-Server "server darajasi";' '    location /a { return 200 "a\n"; }' '    location /b { add_header X-Location "location darajasi"; return 200 "b\n"; }' '}' > /etc/nginx/conf.d/sinov.conf; cat /etc/nginx/conf.d/sinov.conf; nginx -t && nginx -s reload; sleep 0.5
add_header X-Http "http darajasi";
server {
    listen 8081;
    add_header X-Server "server darajasi";
    location /a { return 200 "a\n"; }
    location /b { add_header X-Location "location darajasi"; return 200 "b\n"; }
}
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
$ curl -si http://127.0.0.1:8081/a | grep -E '^(HTTP|X-)'; curl -si http://127.0.0.1:8081/b | grep -E '^(HTTP|X-)'
HTTP/1.1 200 OK
X-Server: server darajasi
HTTP/1.1 200 OK
X-Location: location darajasi
```

- `http` da `X-Http`, `server` da `X-Server`, `/b` location'da `X-Location`.
- `/a` — `X-Server` keldi, lekin **`X-Http` kelmadi**: `server` darajasida o'z `add_header` i bor, shuning uchun `http` dagisi meros olinmadi.
- `/b` — faqat `X-Location`: endi `server` dagisi ham meros olinmadi.

Bu — NG'dagi "faqat joriy darajada `add_header` bo'lmasa" qoidasining natijasi.

### `nginx -T`

```text vps
$ nginx -T 2>/dev/null | grep -E '^# configuration file'
# configuration file /etc/nginx/nginx.conf:
# configuration file /etc/nginx/mime.types:
# configuration file /etc/nginx/conf.d/default.conf:
# configuration file /etc/nginx/conf.d/sinov.conf:
```

Barcha ulangan fayllar (`include` orqali ham) bitta chiqishda — muammo topishda butun konfiguratsiyani ko'rish uchun (29-bob).

```text vps
$ rm /etc/nginx/conf.d/sinov.conf; nginx -t 2>&1 | tail -1; nginx -s reload
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

Sinov fayli o'chirildi, konfiguratsiya qayta yuklandi.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| `;` ni unutish | Keyingi qator ham parametr bo'lib qoladi, xato boshqa qatorda ko'rsatiladi | `nginx -t` xabari qatoridan **oldingi** qatorni ham tekshirish |
| Direktivani noto'g'ri kontekstga yozish | `not allowed here` | Hujjatdagi `Context:` qatorini tekshirish |
| `server` darajasida bitta `add_header` qo'shib, `http` dagilar ishlaydi deb o'ylash | Meros to'xtaydi (sinovda `X-Http` yo'qoldi) | Kerakli header'larni shu darajada ham yozish yoki `add_header_inherit` |
| `nginx -t` siz qayta yuklash | Xatolik bilan reload (4-bob) | Avval `nginx -t` |
| Hamma saytni bitta `nginx.conf` ga yozish | Boshqarish qiyin (NA) | `conf.d/*.conf` va `include` |
| Muammoda faqat bitta faylga qarash | `include` qilingan fayllar ta'sir qiladi | `nginx -T` |

## Amaliyot

1. Oddiy va blok direktiva farqi nima? Kontekst nima?
2. `server` va `location` qaysi kontekstlar ichida bo'ladi?
3. Ichki kontekst tashqi kontekst sozlamalarini meros oladimi? `add_header` da-chi?
4. Sinovda `/a` ga nega `X-Http` header'i kelmadi?
5. `nginx -t` va `nginx -T` farqi nima?
6. `;` yo'q bo'lganda `nginx -t` nega boshqa qatorni ko'rsatdi?

<details>
<summary>Javoblar</summary>

1. Oddiy — `;` bilan tugaydi; blok — `{ }` ichida boshqa direktivalar. Ichida direktivalar bo'la oladigan blok — kontekst.
2. `server` — `http` ichida; `location` — `server` ichida.
3. Odatda ha; `add_header` — faqat joriy darajada `add_header` bo'lmasa.
4. `server` darajasida o'z `add_header` i bor edi.
5. `-t` — tekshiradi; `-T` — tekshiradi va barcha fayllarni chiqaradi.
6. nginx keyingi qatorni ham shu direktivaning davomi deb o'qidi.

</details>

## Rasmiy hujjat

- [NG: Beginner's Guide — Configuration File's Structure](https://nginx.org/en/docs/beginners_guide.html)
- [NA: Creating NGINX Configuration Files](https://docs.nginx.com/nginx/admin-guide/basic-functionality/managing-configuration-files/)
- [NG: Command-line parameters](https://nginx.org/en/docs/switches.html) · [NG: include](https://nginx.org/en/docs/ngx_core_module.html#include) · [NG: add_header](https://nginx.org/en/docs/http/ngx_http_headers_module.html#add_header)
