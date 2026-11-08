# 27 — Kirishni cheklash

[Mundarija](README.md)

## Tushuncha

### IP bo'yicha: `allow` va `deny`

NG (`ngx_http_access_module`): ma'lum mijoz manzillariga kirishni cheklaydi.

```nginx
location / {
    deny  192.168.1.1;
    allow 192.168.1.0/24;
    allow 10.1.1.0/16;
    allow 2001:0db8::/32;
    deny  all;
}
```

Qoidalar **ketma-ket**, **birinchi mos** kelgani bilan to'xtaydi. Bu misolda faqat ikki IPv4 tarmog'i (`192.168.1.1` dan tashqari) va bitta IPv6 tarmog'i. Qoidalar ko'p bo'lsa — `ngx_http_geo_module` o'zgaruvchilari afzal (NG).

### Parol bilan: HTTP Basic

NA (Restricting Access with HTTP Basic Authentication):

1. Parollar fayli — `htpasswd` utilitasi bilan (`apache2-utils` paketi, Debian/Ubuntu): `-c` — yangi fayl, keyin foydalanuvchilar qo'shiladi.
2. `auth_basic "Hudud nomi";` — himoyalangan hudud (nomi parol oynasida ko'rinadi).
3. `auth_basic_user_file /yo'l/.htpasswd;`.
4. Ichki qismni ochiq qoldirish: `auth_basic off;`.

**Fayl formati** (NG): `nom:parol[:izoh]`, `#` — izoh. Parol turlari:

| Tur | Qanday yaratiladi |
| --- | --- |
| `crypt()` | `htpasswd` yoki `openssl passwd` |
| apr1 (Apache MD5 varianti) | Xuddi shu asboblar |
| `{SCHEME}data` (RFC 2307) | `PLAIN` (ishlatmang), `SHA` (tuzsiz SHA-1 — **ishlatmang**, rainbow table hujumiga zaif), `SSHA` (tuzli) |

### Ikkalasi birga: `satisfy`

NA: IP va parolni birlashtirish — `satisfy all` (standart: **ikkalasi** ham shart) yoki `satisfy any` (**bittasi** yetarli — masalan, ofis tarmog'idan parolsiz, boshqa joydan parol bilan).

HTTP Basic'da login va parol har so'rovda `Authorization: Basic …` header'ida **base64** bilan — shifrlanmagan holda ketadi; faqat HTTPS ustida ishlating (Web asoslari kitobi, 16-bob; 21-bob).

## Ko'rib chiqamiz

VPS'da (nginx 1.31.8). `curl --interface 127.0.0.2` — boshqa manzildan kelgan mijoz:

```nginx
server {
    listen 127.0.0.1:8116;
    root /var/www/kirish;

    location /admin/ {
        allow 127.0.0.1;
        deny  all;
    }
    location /tartib/ {
        deny  127.0.0.2;
        allow 127.0.0.0/8;
        deny  all;
    }
    location /maxfiy/ {
        auth_basic           "Maxfiy bo'lim";
        auth_basic_user_file /etc/nginx/.htpasswd;

        location /maxfiy/ochiq/ {
            auth_basic off;
        }
    }
    location /yoki/ {
        satisfy any;
        allow 127.0.0.1;
        deny  all;
        auth_basic           "Ichki yoki parol";
        auth_basic_user_file /etc/nginx/.htpasswd;
    }
}
```

```text vps
$ for d in admin tartib maxfiy maxfiy/ochiq yoki; do mkdir -p /var/www/kirish/$d; echo "ichida: $d" > /var/www/kirish/$d/a.html; done; cp /root/kirish.conf /etc/nginx/conf.d/kirish.conf; rm /root/kirish.conf; echo ok
ok
```

### Parollar fayli

Sinov uchun parollar buyruq qatorida (`-b`); haqiqiy ishda `htpasswd` parolni interaktiv so'raydi (NA) — buyruqlar tarixida qolmasligi uchun:

```text vps
$ apt-get install -y -q apache2-utils 2>&1 | grep -E '^Setting up apache2-utils'; htpasswd -cbB /etc/nginx/.htpasswd ali 'Uzun-Parol-2026'; htpasswd -b /etc/nginx/.htpasswd vali 'Boshqa-Parol-7'; printf 'sami:%s\n' "$(openssl passwd -apr1 'Sami-Parol-9')" >> /etc/nginx/.htpasswd; sed -E 's/(:\$[a-z0-9]+\$[^$]{2}).*/\1…/' /etc/nginx/.htpasswd; chown root:nginx /etc/nginx/.htpasswd; chmod 640 /etc/nginx/.htpasswd; ls -l /etc/nginx/.htpasswd | awk '{print $1, $3, $4}'; nginx -t -q && nginx -s reload; sleep 0.5
Setting up apache2-utils (2.4.66-2ubuntu2.6) ...
Adding password for user ali
Adding password for user vali
ali:$2y$05…
vali:$apr1$Oo…
sami:$apr1$qM…
-rw-r----- root nginx
```

- `ali` — `-B` (bcrypt, `$2y$`), `vali` — standart `htpasswd` (apr1), `sami` — `openssl passwd -apr1`. Ekranda xeshning faqat boshi.
- Fayl `root:nginx`, `640` — worker o'qiy oladi, boshqalar yo'q.

### IP bo'yicha

`k [curl parametrlari] URL` — HTTP kodi:

```text vps
$ k() { printf '%-36s %s\n' "$*" "$(curl -s -o /dev/null -w '%{http_code}' "$@")"; }; k http://127.0.0.1:8116/admin/a.html; k --interface 127.0.0.2 http://127.0.0.1:8116/admin/a.html; tail -n 1 /var/log/nginx/error.log | grep -oE 'access forbidden by rule'
http://127.0.0.1:8116/admin/a.html   200
--interface 127.0.0.2 http://127.0.0.1:8116/admin/a.html 403
access forbidden by rule
$ k --interface 127.0.0.2 http://127.0.0.1:8116/tartib/a.html; k --interface 127.0.0.3 http://127.0.0.1:8116/tartib/a.html
--interface 127.0.0.2 http://127.0.0.1:8116/tartib/a.html 403
--interface 127.0.0.3 http://127.0.0.1:8116/tartib/a.html 200
```

- `/admin/`: `127.0.0.1` — 200, `127.0.0.2` — **403**, jurnalda `access forbidden by rule`.
- `/tartib/`: `deny 127.0.0.2` birinchi turgani uchun `.2` — 403, `.3` esa `allow 127.0.0.0/8` ga mos — 200. Tartib muhim.

### Parol

```text vps
$ curl -s -D - -o /dev/null http://127.0.0.1:8116/maxfiy/a.html | grep -E '^HTTP|^WWW-Authenticate' | tr -d '\r'; k -u ali:xato http://127.0.0.1:8116/maxfiy/a.html; tail -n 1 /var/log/nginx/error.log | grep -oE 'user "ali": password mismatch'; k -u ali:Uzun-Parol-2026 http://127.0.0.1:8116/maxfiy/a.html; k -u sami:Sami-Parol-9 http://127.0.0.1:8116/maxfiy/a.html; k http://127.0.0.1:8116/maxfiy/ochiq/a.html
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Basic realm="Maxfiy bo'lim"
-u ali:xato http://127.0.0.1:8116/maxfiy/a.html 401
user "ali": password mismatch
-u ali:Uzun-Parol-2026 http://127.0.0.1:8116/maxfiy/a.html 200
-u sami:Sami-Parol-9 http://127.0.0.1:8116/maxfiy/a.html 200
http://127.0.0.1:8116/maxfiy/ochiq/a.html 200
```

| So'rov | Natija |
| --- | --- |
| Parolsiz | **401** + `WWW-Authenticate: Basic realm="Maxfiy bo'lim"` — brauzer parol oynasini ochadi |
| Noto'g'ri parol | 401, jurnalda `user "ali": password mismatch` |
| `ali` (bcrypt) | 200 — kuzatildi: bcrypt ham ishladi (tizimning `crypt()` i orqali) |
| `sami` (`openssl` apr1) | 200 |
| `/maxfiy/ochiq/` (`auth_basic off`) | 200, parolsiz |

### `satisfy any`

```text vps
$ k http://127.0.0.1:8116/yoki/a.html; k --interface 127.0.0.2 http://127.0.0.1:8116/yoki/a.html; k --interface 127.0.0.2 -u vali:Boshqa-Parol-7 http://127.0.0.1:8116/yoki/a.html
http://127.0.0.1:8116/yoki/a.html    200
--interface 127.0.0.2 http://127.0.0.1:8116/yoki/a.html 401
--interface 127.0.0.2 -u vali:Boshqa-Parol-7 http://127.0.0.1:8116/yoki/a.html 200
```

`127.0.0.1` dan — parolsiz 200; `127.0.0.2` dan — 401, parol bilan — 200.

### Parol tarmoqda

```text vps
$ curl -s -v -o /dev/null -u ali:Uzun-Parol-2026 http://127.0.0.1:8116/maxfiy/a.html 2>&1 | grep -i '^> Authorization'; echo 'YWxpOlV6dW4tUGFyb2wtMjAyNg==' | base64 -d; echo
> Authorization: Basic YWxpOlV6dW4tUGFyb2wtMjAyNg==
ali:Uzun-Parol-2026
```

`Authorization` header'idagi qiymat — shunchaki base64: bir buyruq bilan ochildi. HTTPS'siz har kim (tarmoqni tinglay olsa) parolni ko'radi.

```text vps
$ rm /etc/nginx/conf.d/kirish.conf /etc/nginx/.htpasswd; rm -rf /var/www/kirish; nginx -t -q && nginx -s reload; echo ok
ok
```

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| `deny all` ni `allow` lardan oldin | Birinchi mos qoida — hammasi rad | Aniqlari avval, `deny all` oxirida |
| HTTP Basic'ni HTTPS'siz | Parol base64 — ochiq (sinovda) | Faqat HTTPS (21-bob) |
| Parollar faylini veb-papka (`root`) ichida | Faylni yuklab olish mumkin | `/etc/nginx/` kabi joyda |
| `{SHA}` yoki `{PLAIN}` | Zaif (NG) | bcrypt yoki apr1 |
| Parolni buyruq qatorida (`-b`) production'da | Buyruqlar tarixida qoladi | Interaktiv `htpasswd` |
| Proksi ortida `allow`/`deny` | Hamma proksi manzilidan keladi | Avval realip (17-bob) |
| Parolli location ichida `return` | `return` parol tekshiruvidan oldin ishlaydi (Web asoslari, 16-bob) | Statik fayl yoki `proxy_pass` |

## Amaliyot

1. `allow`/`deny` qoidalari qanday tartibda tekshiriladi?
2. `deny 192.168.1.1; allow 192.168.1.0/24; deny all;` — `192.168.1.5` kira oladimi? `192.168.1.1`-chi?
3. Parollar faylini qanday yaratasiz?
4. `satisfy any` nima qiladi?
5. Parolsiz so'rovga nginx qaysi kod va header bilan javob beradi?
6. Nega Basic auth faqat HTTPS bilan?

<details>
<summary>Javoblar</summary>

1. Ketma-ket, birinchi mos kelgani bilan to'xtaydi.
2. `192.168.1.5` — ha; `192.168.1.1` — yo'q (birinchi qoida).
3. `htpasswd -c fayl foydalanuvchi` (keyingilari `-c` siz) yoki `openssl passwd`.
4. IP qoidasi yoki parol — bittasi bajarilsa kirishga ruxsat.
5. 401 va `WWW-Authenticate: Basic realm="…"`.
6. Login va parol base64 bilan ochiq ketadi.

</details>

## Rasmiy hujjat

- [NA: Restricting Access with HTTP Basic Authentication](https://docs.nginx.com/nginx/admin-guide/security-controls/configuring-http-basic-authentication/)
- [NG: ngx_http_access_module](https://nginx.org/en/docs/http/ngx_http_access_module.html)
- [NG: ngx_http_auth_basic_module](https://nginx.org/en/docs/http/ngx_http_auth_basic_module.html) · [satisfy](https://nginx.org/en/docs/http/ngx_http_core_module.html#satisfy)
