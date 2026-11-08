# 05 — Statik sayt

[Mundarija](README.md)

## Tushuncha

### `root`

NA (Serve Static Content), NG (core module): `root` — fayl qidiriladigan **ildiz papka**. Fayl yo'li = `root` qiymati + **so'rov URI'si**. `root` ni `http`, `server` yoki `location` da yozish mumkin; ichki kontekstlar meros oladi (3-bob).

```nginx
server {
    root /www/data;

    location / {
    }
    location /images/ {
    }
    location ~ \.(mp3|mp4) {
        root /www/media;
    }
}
```

`/images/x.gif` → `/www/data/images/x.gif`; `.mp3` bilan tugaydigan URI esa `/www/media/` dan qidiriladi — mos location'da o'z `root` i bor (NA misoli).

### `alias`

NG: `alias` — location'ga mos qismni **almashtiradi**:

```nginx
location /i/ {
    alias /data/w3/images/;
}
```

`/i/top.gif` → `/data/w3/images/top.gif` (`/i/` o'rniga `/data/w3/images/`). `root` bilan esa URI to'liq qo'shilardi: `/data/w3/images/i/top.gif`.

| | `root` | `alias` |
| --- | --- | --- |
| Yo'l | `root` + **butun** URI | `alias` + URI'ning location'dan **keyingi** qismi |
| Kontekst | `http`, `server`, `location` | Faqat `location` |
| Qachon | URI papka tuzilishiga to'g'ri kelsa | URI'ni o'zgartirish kerak bo'lsa (NG) |

NG maslahati: location `alias` qiymatining oxirgi qismiga mos kelsa (`location /images/ { alias /data/w3/images/; }`), `root` ishlatgan yaxshiroq: `root /data/w3;`. Muntazam ifodali location'da `alias` — **to'liq fayl yo'li**, odatda ifodadagi guruhlar bilan: `alias /data/w3/images/$1;`.

### `index` va `autoindex`

NA: so'rov `/` bilan tugasa — bu papka so'rovi; nginx papkada **index fayl**ni qidiradi (`index`, standart — `index.html`). Bir nechta nom berilsa — tartib bilan, birinchi topilgani. Index fayl topilsa, nginx **ichki yo'naltirish** (internal redirect) qiladi — yangi URI uchun location qayta tanlanadi (masalan, `index.php` PHP location'iga tushishi mumkin). `autoindex on;` — index fayl bo'lmasa, papka ro'yxatini ko'rsatish.

### `try_files`

NG, NA: `try_files fayl … uri;` yoki `try_files fayl … =kod;` — fayllar mavjudligini **tartib bilan** tekshiradi va birinchi topilganini ishlatadi. Yo'l `root`/`alias` bo'yicha quriladi; oxirida `/` — papka (`$uri/`). Hech biri topilmasa — oxirgi parametrga: URI'ga ichki yo'naltirish, `=404` kabi kod yoki nomli location (`@backend`).

```nginx
location / {
    try_files $uri $uri/ $uri.html =404;
}
location / {
    try_files $uri $uri/ @backend;
}
```

## Ko'rib chiqamiz

VPS'da (nginx 1.31.8). Sinov sayti `127.0.0.1:8095` da (faqat lokal).

### Fayllar va konfiguratsiya

```text vps
$ mkdir -p /var/www/sinov/images /var/www/sinov/papka /var/www/sinov/app /var/www/media; echo 'bosh sahifa' > /var/www/sinov/index.html; echo 'rasm' > /var/www/sinov/images/a.txt; echo 'qo'"'"'shiq' > /var/www/media/t.mp3; echo 'hujjat' > /var/www/sinov/papka/hujjat.txt; echo 'SPA ilova' > /var/www/sinov/app/index.html; find /var/www -type f | sort
/var/www/media/t.mp3
/var/www/sinov/app/index.html
/var/www/sinov/images/a.txt
/var/www/sinov/index.html
/var/www/sinov/papka/hujjat.txt
$ cat /etc/nginx/conf.d/statik.conf; nginx -t -q && nginx -s reload; sleep 0.5
server {
    listen 127.0.0.1:8095;
    root /var/www/sinov;

    location / {
        try_files $uri $uri/ =404;
    }
    location /images/ {
    }
    location ~ \.mp3$ {
        root /var/www/media;
    }
    location /i/ {
        alias /var/www/sinov/images/;
    }
    location /r/ {
        root /var/www/sinov/images/;
    }
    location /papka-royxat/ {
        alias /var/www/sinov/papka/;
        autoindex on;
    }
    location /app/ {
        try_files $uri /app/index.html;
    }
}
```

### `root`, `alias` va 404

`k URI` — HTTP kodi va javob boshi:

```text vps
$ k() { printf '%-28s %s\n' "$1" "$(curl -s -o /tmp/javob -w '%{http_code}' http://127.0.0.1:8095$1) $(head -c 40 /tmp/javob | tr '\n' ' ')"; }; k /; k /index.html; k /images/a.txt; k /t.mp3; k /i/a.txt; k /r/a.txt; k /yoq.html
/                            200 bosh sahifa 
/index.html                  200 bosh sahifa 
/images/a.txt                200 rasm 
/t.mp3                       200 qo'shiq 
/i/a.txt                     200 rasm 
/r/a.txt                     404 <html> <head><title>404 Not Found</titl
/yoq.html                    404 <html> <head><title>404 Not Found</titl
$ tail -n 2 /var/log/nginx/error.log | grep -o 'open() "[^"]*" failed ([^)]*)'
open() "/var/www/sinov/images/r/a.txt" failed (2: No such file or directory)
```

| URI | Natija | Nega |
| --- | --- | --- |
| `/` | `index.html` | `try_files $uri $uri/` → papka → `index` |
| `/images/a.txt` | 200 | Bo'sh location — server `root` i meros olindi: `/var/www/sinov/images/a.txt` |
| `/t.mp3` | 200 | Regex location o'z `root` i bilan: `/var/www/media/t.mp3` |
| `/i/a.txt` | 200 | `alias`: `/i/` → `/var/www/sinov/images/` |
| `/r/a.txt` | **404** | `root` URI'ni to'liq qo'shdi — jurnalda: `/var/www/sinov/images/r/a.txt` |
| `/yoq.html` | 404 | `try_files … =404` |

Xato jurnali nginx **qaysi faylni** qidirganini aniq ko'rsatadi — `root`/`alias` muammosini topishning eng tez yo'li.

### Papka: index yo'q

```text vps
$ k /papka/; k /papka/hujjat.txt; tail -n 1 /var/log/nginx/error.log | grep -o 'directory index of "[^"]*" is forbidden'
/papka/                      403 <html> <head><title>403 Forbidden</titl
/papka/hujjat.txt            200 hujjat 
directory index of "/var/www/sinov/papka/" is forbidden
$ curl -s http://127.0.0.1:8095/papka-royxat/ | sed 's/<[^>]*>//g' | grep -v '^\s*$'
Index of /papka-royxat/
Index of /papka-royxat/../
hujjat.txt                                         08-Nov-2026 17:15                   7
```

- `/papka/` — index fayl yo'q, `autoindex` o'chiq → **403**, jurnalda `directory index … is forbidden`. Papka ichidagi fayl — ochiladi.
- `autoindex on` bilan — fayllar ro'yxati (nomi, sanasi, hajmi).

### SPA: har qanday yo'l — `index.html`

```text vps
$ k /app/; k /app/profil/42; k /app/index.html
/app/                        200 SPA ilova 
/app/profil/42               200 SPA ilova 
/app/index.html              200 SPA ilova 
```

`/app/profil/42` diskda yo'q, lekin `try_files $uri /app/index.html` uni ilovaning `index.html` iga yo'naltirdi — brauzerdagi marshrutlash (SPA) uchun.

```text vps
$ rm /etc/nginx/conf.d/statik.conf; rm -rf /var/www/sinov /var/www/media; nginx -t -q && nginx -s reload; echo ok
ok
```

## Variantlar

| Vazifa | Konfiguratsiya |
| --- | --- |
| Oddiy statik sayt | `root` + `try_files $uri $uri/ =404` |
| URI papka nomiga mos emas | `alias` |
| SPA (React, Vue) | `try_files $uri /index.html` |
| Fayl topilmasa ilovaga | `try_files $uri $uri/ @backend` (11-bob) |
| Papka ro'yxati | `autoindex on` (faqat kerak bo'lsa) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| `alias` o'rniga `root` (yoki aksincha) | Yo'l noto'g'ri quriladi (sinovda `/r/a.txt` → 404) | Jurnaldagi `open() "…"` yo'liga qarash |
| `alias` ni location qiymatining oxiriga mos holda ishlatish | Ortiqcha murakkablik | NG: bunday holda `root` |
| Regex location'da `alias` ni oddiy papka deb yozish | Regex'da `alias` — to'liq fayl yo'li | Guruhlar bilan: `alias /path/$1;` |
| SPA'ni `try_files` siz | Ichki sahifani yangilaganda 404 | `try_files $uri /index.html` |
| `autoindex on` ni hamma joyda | Barcha fayllar ro'yxati ko'rinadi | Faqat kerakli location'da |
| 403 ni "huquq muammosi" deb o'ylash | Ko'pincha index fayl yo'q (sinovda shunday) | Jurnaldagi `directory index … is forbidden` |

## Amaliyot

1. `root /var/www;` bilan `/img/a.png` so'rovi qaysi faylni qidiradi?
2. `location /i/ { alias /data/img/; }` bilan `/i/a.png` qaysi fayl?
3. Xuddi shu holatda `alias` o'rniga `root /data/img/;` bo'lsa-chi?
4. Index fayl yo'q papkaga so'rov nima qaytardi va nega?
5. SPA uchun qanday `try_files` yoziladi?
6. `root`/`alias` xatosini qanday tez topasiz?

<details>
<summary>Javoblar</summary>

1. `/var/www/img/a.png`.
2. `/data/img/a.png`.
3. `/data/img/i/a.png` — topilmaydi (sinovdagi `/r/` holati).
4. 403 — `autoindex` o'chiq va index fayl yo'q.
5. `try_files $uri /index.html;` (yoki ilova papkasi bilan).
6. Xato jurnalidagi `open() "…" failed` qatoridan — nginx qidirgan to'liq yo'l.

</details>

## Rasmiy hujjat

- [NA: Serve Static Content](https://docs.nginx.com/nginx/admin-guide/web-server/serving-static-content/)
- [NG: root](https://nginx.org/en/docs/http/ngx_http_core_module.html#root) · [alias](https://nginx.org/en/docs/http/ngx_http_core_module.html#alias) · [try_files](https://nginx.org/en/docs/http/ngx_http_core_module.html#try_files)
- [NG: index module](https://nginx.org/en/docs/http/ngx_http_index_module.html) · [autoindex module](https://nginx.org/en/docs/http/ngx_http_autoindex_module.html)
