# 12 — PHP-FPM bilan

[Mundarija](README.md)

## Tushuncha

nginx PHP kodini o'zi bajarmaydi. U so'rovni **FastCGI** protokoli bilan alohida jarayonga — odatda **PHP-FPM** (FastCGI Process Manager) ga — uzatadi, javobni mijozga qaytaradi (NA: proksi HTTP bo'lmagan protokol bilan ham bo'ladi, 11-bob).

### `fastcgi_pass`

NG (`ngx_http_fastcgi_module`):

```nginx
fastcgi_pass localhost:9000;            # TCP port
fastcgi_pass unix:/tmp/fastcgi.socket;  # UNIX soket
```

Server guruhi (15-bob) ham bo'lishi mumkin.

### `fastcgi_param`

PHP'ga qaysi faylni bajarish va so'rov ma'lumotlari **parametrlar** orqali beriladi. NG: PHP uchun minimal kerakli parametrlar:

```nginx
fastcgi_param SCRIPT_FILENAME /home/www/scripts/php$fastcgi_script_name;
fastcgi_param QUERY_STRING    $query_string;
```

POST uchun yana `REQUEST_METHOD`, `CONTENT_TYPE`, `CONTENT_LENGTH`. `SCRIPT_FILENAME` — PHP **qaysi faylni** bajarishini shundan biladi.

- `fastcgi_param` lar ham **meros**: faqat joriy darajada bittasi ham bo'lmasa (3-bob).
- `include fastcgi_params;` — paketdagi tayyor ro'yxat (`QUERY_STRING`, `REQUEST_METHOD`, `REMOTE_ADDR`, `SERVER_NAME` …). Kuzatildi: nginx.org paketidagi `fastcgi_params` da **`SCRIPT_FILENAME` yo'q** — uni o'zingiz yozasiz.
- `$fastcgi_script_name` — so'rov URI'si (oxiri `/` bo'lsa — `fastcgi_index` qo'shilgan).
- `fastcgi_split_path_info regex;` — ikki guruh: birinchisi `$fastcgi_script_name`, ikkinchisi `$fastcgi_path_info` (`/show.php/article/0001` → skript `/show.php`, `PATH_INFO` `/article/0001`).

NG'dagi oddiy PHP sayt (6-bob ham shuni tahlil qiladi):

```nginx
server {
    listen      80;
    server_name example.org www.example.org;
    root        /data/www;

    location / {
        index   index.html index.php;
    }
    location ~* \.(gif|jpg|png)$ {
        expires 30d;
    }
    location ~ \.php$ {
        fastcgi_pass  localhost:9000;
        fastcgi_param SCRIPT_FILENAME
                      $document_root$fastcgi_script_name;
        include       fastcgi_params;
    }
}
```

`$document_root` — `root` qiymati.

## Ko'rib chiqamiz

VPS'da (nginx 1.31.8, PHP-FPM — Ubuntu 26.04 paketi).

### PHP-FPM

```text vps
$ apt-get install -y -q php-fpm 2>&1 | grep -E '^Setting up php8\.5-fpm' ; systemctl is-active php8.5-fpm; ls -l /run/php/ | awk 'NR>1 {print $1, $3, $4, $NF}'; grep -E '^(user|group|listen|listen\.(owner|group|mode)) ' /etc/php/8.5/fpm/pool.d/www.conf
active
lrwxrwxrwx root root /etc/alternatives/php-fpm.sock
-rw-r--r-- root root php8.5-fpm.pid
srw-rw---- www-data www-data php8.5-fpm.sock
user = www-data
group = www-data
listen = /run/php/php8.5-fpm.sock
listen.owner = www-data
listen.group = www-data
```

- `php-fpm` paketi — PHP 8.5 FPM; servis `php8.5-fpm` ishlayapti.
- Standart pool `www`: jarayonlar `www-data` nomidan, UNIX soket `/run/php/php8.5-fpm.sock`, egasi va guruhi `www-data`, huquqi `srw-rw----` — faqat egasi va guruhi yoza oladi.

TCP portda ham ko'rsatish uchun ikkinchi pool (`127.0.0.1:9100`):

```text vps
$ printf '%s\n' '[tcp]' 'user = www-data' 'group = www-data' 'listen = 127.0.0.1:9100' 'pm = ondemand' 'pm.max_children = 2' > /etc/php/8.5/fpm/pool.d/tcp.conf; systemctl restart php8.5-fpm; ss -ltn | grep -c ':9100 '
1
```

### Sinov skripti va konfiguratsiya

```php
<?php
// Sinov skripti: PHP-FPM nginx'dan nima olganini ko'rsatadi
echo "PHP ", PHP_VERSION, " (", PHP_SAPI, ")\n";
foreach (['SCRIPT_FILENAME', 'SCRIPT_NAME', 'PATH_INFO', 'QUERY_STRING', 'REQUEST_METHOD', 'HTTP_HOST'] as $k) {
    echo "  $k = ", $_SERVER[$k] ?? '(yo\'q)', "\n";
}
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    echo "  POST ism = ", $_POST['ism'] ?? '(yo\'q)', "\n";
}
```

```nginx
server {
    listen 127.0.0.1:8106;
    server_name php.test;
    root /var/www/php;
    index index.php index.html;

    location ~ ^/yol(/.+\.php)(/.*)$ {
        fastcgi_split_path_info ^/yol(/.+\.php)(/.*)$;
        fastcgi_pass unix:/run/php/php8.5-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param PATH_INFO $fastcgi_path_info;
        include fastcgi_params;
    }
    location ~ ^/tcp(/.+\.php)$ {
        fastcgi_pass 127.0.0.1:9100;
        fastcgi_param SCRIPT_FILENAME $document_root$1;
        include fastcgi_params;
    }
    location ~ ^/paramsiz(/.+\.php)$ {
        fastcgi_pass unix:/run/php/php8.5-fpm.sock;
        include fastcgi_params;
    }
    # umumiy PHP location — oxirida, chunki regex'lar tartib bilan tekshiriladi
    location ~ \.php$ {
        try_files $uri =404;
        fastcgi_pass unix:/run/php/php8.5-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

```text vps
$ mkdir -p /var/www/php && mv /root/info.php /var/www/php/index.php && echo '<?php echo "ikkinchi skript\n";' > /var/www/php/show.php; cp /root/php.conf /etc/nginx/conf.d/php.conf; rm /root/php.conf; nginx -t -q && nginx -s reload; sleep 0.5; echo yuklandi
yuklandi
```

### Birinchi so'rov — 502

```text vps
$ f() { curl -s -o /tmp/j -w '%{http_code}' -H 'Host: php.test' "$@" > /tmp/k; echo "HTTP $(cat /tmp/k)"; cat /tmp/j; }; f 'http://127.0.0.1:8106/?q=salom'; tail -n 1 /var/log/nginx/error.log | grep -oE '\(13: Permission denied\) while connecting to upstream'
HTTP 502
<html>
<head><title>502 Bad Gateway</title></head>
<body>
<center><h1>502 Bad Gateway</h1></center>
<hr><center>nginx/1.31.8</center>
</body>
</html>
(13: Permission denied) while connecting to upstream
```

**502** va jurnalda `(13: Permission denied) while connecting to upstream`. Sabab: nginx.org paketida worker'lar **`nginx`** foydalanuvchisi nomidan ishlaydi (2-bob), Ubuntu'ning PHP-FPM soketi esa faqat `www-data` uchun. Kuzatildi: bu rasmiy nginx paketi + Ubuntu PHP-FPM birikmasida chiqadi.

Yechimlardan biri — `nginx` foydalanuvchisini `www-data` guruhiga qo'shish (boshqasi — pool'da `listen.owner`/`listen.group` ni o'zgartirish):

```text vps
$ id nginx; usermod -aG www-data nginx; systemctl restart nginx; id nginx | grep -o 'www-data'
uid=999(nginx) gid=986(nginx) groups=986(nginx)
www-data
$ f 'http://127.0.0.1:8106/?q=salom'; f -d 'ism=Ali' http://127.0.0.1:8106/index.php
HTTP 200
PHP 8.5.4 (fpm-fcgi)
  SCRIPT_FILENAME = /var/www/php/index.php
  SCRIPT_NAME = /index.php
  PATH_INFO = (yo'q)
  QUERY_STRING = q=salom
  REQUEST_METHOD = GET
  HTTP_HOST = php.test
HTTP 200
PHP 8.5.4 (fpm-fcgi)
  SCRIPT_FILENAME = /var/www/php/index.php
  SCRIPT_NAME = /index.php
  PATH_INFO = (yo'q)
  QUERY_STRING = 
  REQUEST_METHOD = POST
  HTTP_HOST = php.test
  POST ism = Ali
```

- `SCRIPT_FILENAME` = `/var/www/php/index.php` (`$document_root$fastcgi_script_name`); `?q=salom` — `QUERY_STRING`; `Host` — `HTTP_HOST`.
- POST — `REQUEST_METHOD` va forma maydoni PHP'ga yetdi (`fastcgi_params` dagi `CONTENT_TYPE`/`CONTENT_LENGTH`).

### Yo'q fayl, `PATH_INFO`, TCP

```text vps
$ f http://127.0.0.1:8106/yoq.php; f http://127.0.0.1:8106/yol/index.php/maqola/0001; f http://127.0.0.1:8106/tcp/show.php
HTTP 404
<html>
<head><title>404 Not Found</title></head>
<body>
<center><h1>404 Not Found</h1></center>
<hr><center>nginx/1.31.8</center>
</body>
</html>
HTTP 200
PHP 8.5.4 (fpm-fcgi)
  SCRIPT_FILENAME = /var/www/php/index.php
  SCRIPT_NAME = /index.php
  PATH_INFO = /maqola/0001
  QUERY_STRING = 
  REQUEST_METHOD = GET
  HTTP_HOST = php.test
HTTP 200
ikkinchi skript
```

| So'rov | Natija | Nega |
| --- | --- | --- |
| `/yoq.php` | nginx 404 | `try_files $uri =404` — fayl yo'q, PHP'ga umuman bormadi |
| `/yol/index.php/maqola/0001` | `PATH_INFO = /maqola/0001` | `fastcgi_split_path_info` |
| `/tcp/show.php` | 200 | TCP port (`127.0.0.1:9100`) orqali |

### `SCRIPT_FILENAME` siz

```text vps
$ f http://127.0.0.1:8106/paramsiz/index.php; tail -n 1 /var/log/nginx/error.log | grep -oE 'FastCGI sent in stderr: "[^"]*"'
HTTP 404
File not found.
FastCGI sent in stderr: "Primary script unknown"
```

`include fastcgi_params` bor, lekin `SCRIPT_FILENAME` yo'q: PHP-FPM bajariladigan faylni bilmadi — javob `File not found.` (404), nginx jurnalida PHP'ning `Primary script unknown` xabari.

```text vps
$ rm /etc/nginx/conf.d/php.conf /etc/php/8.5/fpm/pool.d/tcp.conf; rm -rf /var/www/php; gpasswd -d nginx www-data > /dev/null; systemctl restart php8.5-fpm nginx; systemctl is-active nginx php8.5-fpm
active
active
```

Sinov fayllari va ikkinchi pool o'chirildi, `nginx` foydalanuvchisi `www-data` guruhidan chiqarildi (PHP-FPM paketi VPS'da qoldi).

## Variantlar

| | UNIX soket | TCP port |
| --- | --- | --- |
| Manzil | `unix:/run/php/php8.5-fpm.sock` | `127.0.0.1:9000` |
| Qachon | nginx va PHP-FPM bitta serverda | Boshqa serverda yoki konteynerda |
| Kirish nazorati | Fayl huquqlari (sinovdagi 502) | Tarmoq: faqat ishonchli manzildan |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| `SCRIPT_FILENAME` ni yozmaslik (nginx.org paketi) | `File not found.`, `Primary script unknown` (sinovda) | `fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;` |
| nginx.org nginx + Ubuntu PHP-FPM, soket huquqini tekshirmaslik | 502, `Permission denied` (sinovda) | Guruh yoki `listen.owner/group` |
| Maxsus PHP location'larni umumiy `\.php$` dan keyin yozish | Regex'lar tartib bilan — umumiysi birinchi ushlaydi (sinovning birinchi urinishida shunday bo'ldi) | Maxsuslarini oldin (6-bob) |
| PHP location'da faylni tekshirmaslik | Yo'q fayl ham PHP'ga boradi | `try_files $uri =404;` |
| Location'da bitta `fastcgi_param` qo'shib, server'dagilar qoladi deb o'ylash | Meros to'xtaydi (NG) | Hammasini shu darajada yoki `include` ni takrorlash |
| PHP-FPM TCP portini tashqariga ochish | Har kim PHP'ga so'rov yubora oladi | `127.0.0.1` yoki ichki tarmoq |

## Amaliyot

1. nginx PHP kodini qanday bajaradi?
2. PHP uchun minimal kerakli `fastcgi_param` lar qaysilar?
3. Sinovda birinchi so'rov nega 502 berdi va qanday tuzatildi?
4. `SCRIPT_FILENAME` bo'lmasa nima bo'ldi?
5. `try_files $uri =404;` PHP location'ida nima uchun?
6. `fastcgi_split_path_info` nimani ajratadi?

<details>
<summary>Javoblar</summary>

1. O'zi bajarmaydi — FastCGI orqali PHP-FPM ga uzatadi va javobni qaytaradi.
2. `SCRIPT_FILENAME` va `QUERY_STRING`; POST uchun `REQUEST_METHOD`, `CONTENT_TYPE`, `CONTENT_LENGTH`.
3. nginx worker'lari `nginx` foydalanuvchisidan, soket faqat `www-data` uchun; `nginx` ni `www-data` guruhiga qo'shib.
4. PHP-FPM fayl topmadi: `File not found.` (404), jurnalda `Primary script unknown`.
5. Diskda yo'q `.php` so'rovlari PHP'ga bormasdan nginx'ning o'zida 404.
6. URI'ni skript nomi (`$fastcgi_script_name`) va qolgan yo'l (`$fastcgi_path_info`) ga.

</details>

## Rasmiy hujjat

- [NG: ngx_http_fastcgi_module](https://nginx.org/en/docs/http/ngx_http_fastcgi_module.html) — `fastcgi_pass`, `fastcgi_param`, `fastcgi_split_path_info`, `fastcgi_index`
- [NG: How nginx processes a request — A simple PHP site configuration](https://nginx.org/en/docs/http/request_processing.html)
