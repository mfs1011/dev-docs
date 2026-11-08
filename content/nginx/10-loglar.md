# 10 — Loglar

[Mundarija](README.md)

## Tushuncha

NA (Configuring Logging): loglar muammolarni topish va trafik qanday o'tayotganini tushunish uchun zarur. nginx'da ikki jurnal: **xato jurnali** (error log) va **kirish jurnali** (access log).

### Xato jurnali: `error_log`

```text
error_log fayl | stderr | syslog:… [daraja];
```

- Standart yo'l `nginx -V` dagi `--error-log-path` da; Ubuntu paketida — `/var/log/nginx/error.log`. Docker obrazlarida `/dev/stderr` ga simvolik havola (NA).
- **Darajalar** (NG, ortib borish tartibida): `debug`, `info`, `notice`, `warn`, `error`, `crit`, `alert`, `emerg`. Berilgan daraja va undan **og'irroqlar** yoziladi. Masalan, `warn` — `warn`, `error`, `crit`, `alert`, `emerg`.
- NA: standart sozlama global ishlaydi; o'zgartirish uchun `error_log` ni main kontekstga qo'ying — main'dagi sozlamalar boshqa kontekstlarga doim meros bo'ladi. Pastki darajalarda (`server`, `location`) qayta belgilash mumkin.
- Faylda: `[daraja]`, jarayon `pid#tid`, ulanish raqami `*N` va xabar.

### Kirish jurnali: `access_log`

```text
access_log yo'l [format [buffer=hajm] [gzip[=daraja]] [flush=vaqt] [if=shart]];
access_log off;
```

NA: so'rovga ishlov berilgach darhol yoziladi. Oldindan belgilangan format — **`combined`**:

```text
$remote_addr - $remote_user [$time_local] "$request" $status $body_bytes_sent "$http_referer" "$http_user_agent"
```

`log_format nom [escape=default|json|none] satr …;` — o'z formatingiz (NG):

- `escape=default` — `"`, `\` va boshqarish belgilari `\xXX` ko'rinishida;
- `escape=json` — JSON satrida ruxsat etilmagan belgilar JSON qoidasi bilan (`\"`, `\\`, `\n` …) — JSON jurnal uchun;
- topilmagan o'zgaruvchi — `-`.

Foydali o'zgaruvchilar (NA, NG): `$request_time` (so'rovga umumiy vaqt), `$upstream_connect_time`, `$upstream_header_time`, `$upstream_response_time` (orqadagi server bilan vaqtlar, 11-bob), `$gzip_ratio` (8-bob), `$bytes_sent`, `$request_length`, `$msec`.

**Shartli yozish** (NA): `if=` — o'zgaruvchi `0` yoki bo'sh bo'lsa yozilmaydi. NA misoli — faqat 2xx/3xx bo'lmaganlarni yozish:

```nginx
map $status $loggable {
    ~^[23]  0;
    default 1;
}
access_log /path/to/access.log combined if=$loggable;
```

**Meros** (NA): ma'lum darajada belgilangan `access_log` oldingi darajadagilarni almashtiradi.

**Unumdorlik** (NA): `buffer=` — yozuvlar avval buferda; `open_log_file_cache` — fayl deskriptorlari keshi.

### syslog

NG (Logging to syslog): `error_log` va `access_log` syslog'ga yoza oladi:

| Parametr | Nima | Standart |
| --- | --- | --- |
| `server=` | Manzil: IP/domen (port bilan) yoki `unix:` soket | UDP 514 |
| `facility=` | RFC 3164 facility | `local7` |
| `severity=` | `access_log` uchun daraja | `info` |
| `tag=` | Teg | `nginx` |
| `nohostname` | Sarlavhaga hostname qo'shmaslik (1.9.7) | — |

```nginx
error_log syslog:server=192.168.1.1 debug;
access_log syslog:server=unix:/var/log/nginx.sock,nohostname;
```

## Ko'rib chiqamiz

VPS'da (nginx 1.31.8), `127.0.0.1:8102`:

```nginx
log_format json_log escape=json '{"vaqt":"$time_iso8601","ip":"$remote_addr",'
                                '"so_rov":"$request","holat":$status,'
                                '"bayt":$body_bytes_sent,"vaqt_s":$request_time,'
                                '"ua":"$http_user_agent"}';

map $status $xato_bolsa {
    ~^[23]  0;
    default 1;
}

server {
    listen 127.0.0.1:8102;
    root /var/www/lg;
    error_log /var/log/nginx/sinov-error.log error;

    location /oddiy/ {
        access_log /var/log/nginx/sinov-combined.log combined;
    }
    location /json/ {
        access_log /var/log/nginx/sinov-json.log json_log;
    }
    location /faqat-xato/ {
        access_log /var/log/nginx/sinov-xato.log combined if=$xato_bolsa;
    }
    location /jim/ {
        access_log off;
        error_log /var/log/nginx/sinov-error.log crit;
    }
    location /syslog/ {
        access_log syslog:server=unix:/dev/log,tag=nginx_sinov combined;
    }
    location /syslog2/ {
        access_log syslog:server=unix:/dev/log,tag=nginx_sinov,nohostname combined;
    }
}
```

```text vps
$ mkdir -p /var/www/lg/oddiy /var/www/lg/json /var/www/lg/faqat-xato /var/www/lg/jim /var/www/lg/syslog /var/www/lg/syslog2; for d in oddiy json faqat-xato jim syslog syslog2; do echo ok > /var/www/lg/$d/a.html; done; cp /root/log.conf /etc/nginx/conf.d/log.conf; rm /root/log.conf; nginx -t -q && nginx -s reload; sleep 0.5; echo yuklandi
yuklandi
```

### `combined`

```text vps
$ curl -s -o /dev/null -A 'Mozilla/5.0 "test"' -e https://example.uz/ 'http://127.0.0.1:8102/oddiy/a.html?q=1'; cat /var/log/nginx/sinov-combined.log
127.0.0.1 - - [08/Nov/2026:20:26:46 +0300] "GET /oddiy/a.html?q=1 HTTP/1.1" 200 3 "https://example.uz/" "Mozilla/5.0 \x22test\x22"
```

IP, vaqt, so'rov qatori (argumentlar bilan), holat 200, javob tanasi 3 bayt, Referer, User-Agent. UA'dagi `"` — `\x22` (standart ekranlash).

### JSON jurnal

```text vps
$ curl -s -o /dev/null -A 'Mozilla/5.0 "test"' http://127.0.0.1:8102/json/a.html; curl -s -o /dev/null http://127.0.0.1:8102/json/yoq.html; cat /var/log/nginx/sinov-json.log; python3 -c "import json,sys; [print(json.loads(l)['so_rov'], json.loads(l)['holat']) for l in open('/var/log/nginx/sinov-json.log')]"
{"vaqt":"2026-11-08T20:26:46+03:00","ip":"127.0.0.1","so_rov":"GET /json/a.html HTTP/1.1","holat":200,"bayt":3,"vaqt_s":0.000,"ua":"Mozilla/5.0 \"test\""}
{"vaqt":"2026-11-08T20:26:46+03:00","ip":"127.0.0.1","so_rov":"GET /json/yoq.html HTTP/1.1","holat":404,"bayt":153,"vaqt_s":0.000,"ua":"curl/8.18.0"}
GET /json/a.html HTTP/1.1 200
GET /json/yoq.html HTTP/1.1 404
```

`escape=json` bilan `"` — `\"`; har qator to'g'ri JSON — Python uni xatosiz o'qidi.

### Faqat xatolar

```text vps
$ for u in a.html yoq.html a.html yoq2.html; do curl -s -o /dev/null http://127.0.0.1:8102/faqat-xato/$u; done; cut -d'"' -f2,3 /var/log/nginx/sinov-xato.log
GET /faqat-xato/yoq.html HTTP/1.1" 404 153 
GET /faqat-xato/yoq2.html HTTP/1.1" 404 153 
```

4 so'rovdan faqat ikkita 404 yozildi — `if=$xato_bolsa`.

### Xato jurnali va daraja

```text vps
$ curl -s -o /dev/null http://127.0.0.1:8102/jim/yoq.html; curl -s -o /dev/null http://127.0.0.1:8102/oddiy/yoq.html; cut -d' ' -f3- /var/log/nginx/sinov-error.log | sed -E 's/[0-9]+#[0-9]+: \*[0-9]+ //; s/, client.*//'
[error] open() "/var/www/lg/json/yoq.html" failed (2: No such file or directory)
[error] open() "/var/www/lg/faqat-xato/yoq.html" failed (2: No such file or directory)
[error] open() "/var/www/lg/faqat-xato/yoq2.html" failed (2: No such file or directory)
[error] open() "/var/www/lg/oddiy/yoq.html" failed (2: No such file or directory)
```

`/jim/` da `error_log … crit` — 404 ning `open() … failed` xabari `error` darajasida, `crit` dan past — **yozilmadi**. Qolgan location'larda (server darajasidagi `error`) — yozildi. Jurnal fayl qaysi faylni qidirganini ko'rsatadi (5-bob).

### syslog (journald)

Ubuntu'da `/dev/log` — systemd-journald soketi:

```text vps
$ curl -s -o /dev/null http://127.0.0.1:8102/syslog/a.html; curl -s -o /dev/null http://127.0.0.1:8102/syslog2/a.html; sleep 0.5; echo '--- hostname bilan:'; journalctl --since -1min --no-pager -o short | grep 'GET /syslog/' | cut -d' ' -f4-; echo '--- nohostname, journalctl -t nginx_sinov:'; journalctl -t nginx_sinov --since -1min --no-pager -o cat
--- hostname bilan:
lab nginx[176297]: lab nginx_sinov: 127.0.0.1 - - [08/Nov/2026:20:25:57 +0300] "GET /syslog/a.html HTTP/1.1" 200 3 "-" "curl/8.18.0"
lab nginx[176515]: lab nginx_sinov: 127.0.0.1 - - [08/Nov/2026:20:26:27 +0300] "GET /syslog/a.html HTTP/1.1" 200 3 "-" "curl/8.18.0"
lab nginx[176706]: lab nginx_sinov: 127.0.0.1 - - [08/Nov/2026:20:26:46 +0300] "GET /syslog/a.html HTTP/1.1" 200 3 "-" "curl/8.18.0"
--- nohostname, journalctl -t nginx_sinov:
127.0.0.1 - - [08/Nov/2026:20:26:27 +0300] "GET /syslog2/a.html HTTP/1.1" 200 3 "-" "curl/8.18.0"
127.0.0.1 - - [08/Nov/2026:20:26:46 +0300] "GET /syslog2/a.html HTTP/1.1" 200 3 "-" "curl/8.18.0"
```

- Hostname bilan: journald nginx yuborgan sarlavhani to'liq ajratmadi — yozuv `nginx[pid]` nomidan, `lab nginx_sinov:` matn ichida qoldi (kuzatildi; oxirgi daqiqadagi barcha sinovlardan uchta yozuv).
- `nohostname` bilan: teg to'g'ri ajratildi — `journalctl -t nginx_sinov` faqat shu yozuvlarni ko'rsatdi.

```text vps
$ rm /etc/nginx/conf.d/log.conf /var/log/nginx/sinov-*.log; rm -rf /var/www/lg; nginx -t -q && nginx -s reload; echo ok
ok
```

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Location'da `access_log` yozib, umumiy jurnal ham davom etadi deb o'ylash | Yangi daraja oldingisini almashtiradi (NA) | Kerak bo'lsa ikkala `access_log` ni shu darajada |
| JSON jurnalni `escape=json` siz | `"` yoki `\` JSON'ni buzadi | `log_format … escape=json` |
| `error_log … debug` ni production'da | Juda ko'p yozuv | `error` yoki `warn`; debug — vaqtincha (29-bob) |
| Statik fayllar uchun 2xx'larni ham yozish | Jurnal tez o'sadi | `if=` bilan shartli yozish |
| Local journald'ga hostname bilan syslog | Teg ajratilmaydi (sinovda) | `nohostname` |
| Jurnallarni almashtirmaslik | Disk to'ladi | Qayta nomlash + `nginx -s reopen` (4-bob) |

## Amaliyot

1. `error_log … warn` qaysi darajalarni yozadi?
2. `combined` formatda qaysi maydonlar bor?
3. JSON jurnal uchun nega `escape=json` kerak?
4. Faqat 4xx/5xx javoblarni qanday yozasiz?
5. Sinovda `/jim/` dagi 404 nega xato jurnalida yo'q?
6. syslog'ga yozishda `nohostname` nima o'zgartirdi?

<details>
<summary>Javoblar</summary>

1. `warn`, `error`, `crit`, `alert`, `emerg`.
2. Mijoz IP, foydalanuvchi, vaqt, so'rov qatori, holat, javob tanasi baytlari, Referer, User-Agent.
3. `"`, `\` va boshqarish belgilari JSON qoidasi bilan ekranlanishi uchun — aks holda qator yaroqsiz JSON.
4. `map $status $x { ~^[23] 0; default 1; }` va `access_log … if=$x;`.
5. `error_log … crit` — `open() failed` xabari `error` darajasida, `crit` dan past.
6. Sarlavhada hostname yo'q — journald tegni to'g'ri ajratdi (`journalctl -t`).

</details>

## Rasmiy hujjat

- [NA: Configuring Logging](https://docs.nginx.com/nginx/admin-guide/monitoring/logging/)
- [NG: ngx_http_log_module](https://nginx.org/en/docs/http/ngx_http_log_module.html)
- [NG: error_log](https://nginx.org/en/docs/ngx_core_module.html#error_log) · [NG: Logging to syslog](https://nginx.org/en/docs/syslog.html)
