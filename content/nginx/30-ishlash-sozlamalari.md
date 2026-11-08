# 30 — Ishlash sozlamalari

[Mundarija](README.md)

## Tushuncha

### Worker'lar va ulanishlar

NG (core functionality):

| Direktiva | Standart | Nima |
| --- | --- | --- |
| `worker_processes son \| auto;` | `1` | Worker jarayonlar soni. Optimal qiymat ko'p narsaga bog'liq (yadrolar, disklar, yuklama turi); ikkilansangiz — yadrolar soni (`auto`) yaxshi boshlanish |
| `worker_connections son;` | `512` | Bitta worker'ning bir vaqtdagi ulanishlari chegarasi — **barcha** ulanishlar, jumladan backend'lar bilan ham |
| `worker_rlimit_nofile son;` | — | Worker'lar uchun ochiq fayllar chegarasi (RLIMIT_NOFILE) — asosiy jarayonni qayta ishga tushirmasdan oshirish |
| `multi_accept on \| off;` | `off` | `off` — worker yangi ulanishlarni bittadan qabul qiladi, `on` — hammasini birdan |

NG: haqiqiy bir vaqtdagi ulanishlar soni ochiq fayllar chegarasidan oshmaydi.

### Ulanishlarni qayta ishlash usullari

NG (Connection processing methods): `select`, `poll` (standart usullar), `kqueue` (FreeBSD, macOS), **`epoll`** (Linux 2.6+), `/dev/poll`, `eventport`. Bir nechtasi bo'lsa, nginx **eng samaralisini o'zi tanlaydi**; `use` bilan aniq ko'rsatish odatda kerak emas.

### Keep-alive

| Direktiva | Standart (NG) | Nima |
| --- | --- | --- |
| `keepalive_timeout vaqt [header_vaqt];` | `75s` | Bo'sh keep-alive ulanish server tomonda shuncha ochiq turadi; `0` — o'chiriladi; ikkinchi parametr — `Keep-Alive: timeout=…` header'i |
| `keepalive_requests son;` | `1000` (1.19.10 gacha 100) | Bitta ulanishda shuncha so'rovdan keyin ulanish yopiladi — ulanish xotirasini bo'shatish uchun; juda katta qiymat tavsiya etilmaydi |

### Fayl uzatish

| Direktiva | Standart | Nima (NG, NA) |
| --- | --- | --- |
| `sendfile on;` | `off` | Faylni nginx buferiga nusxalamasdan, yadro orqali to'g'ridan-to'g'ri uzatish (`sendfile()`) |
| `tcp_nopush on;` | `off` | Faqat `sendfile` bilan: header va fayl boshini bitta paketda, faylni to'liq paketlarda (Linux'da `TCP_CORK`) |
| `tcp_nodelay on;` | `on` | Nagle algoritmini o'chirish — keep-alive, SSL, bufersiz proksi va WebSocket'da |

NA (Serve Static Content — Optimize Performance): `sendfile` va `tcp_nopush` birga; katta fayllar uchun `sendfile_max_chunk`. Kiruvchi ulanishlar navbati (**listen backlog**) — `listen … backlog=…` va OS sozlamasi.

## Ko'rib chiqamiz

VPS'da (nginx 1.31.8).

### Asosiy server

```text vps
$ nginx -T 2>/dev/null | grep -E '^\s*(worker_processes|worker_connections|keepalive_timeout|sendfile|tcp_nopush)\b' | sort -u; nproc; grep -h 'event method' /var/log/nginx/error.log | tail -1 | cut -d' ' -f3-; w=$(pgrep -P $(cat /run/nginx.pid) | head -1); grep 'Max open files' /proc/$w/limits
    keepalive_timeout  65;
    sendfile        on;
    worker_connections  1024;
worker_processes  auto;
1
[notice] 188895#188895: using the "epoll" event method
Max open files            1024                 524288               files     
```

- Paket sozlamasi: `worker_processes auto` (1 yadro — 1 worker), `worker_connections 1024`, `keepalive_timeout 65`, `sendfile on`.
- nginx o'zi `epoll` ni tanladi (jurnal, `notice`).
- Worker'ning ochiq fayllar chegarasi (yumshoq) — 1024: bu `worker_connections` bilan teng; ko'proq ulanish kerak bo'lsa — `worker_rlimit_nofile`.

### Kichik `worker_connections`

Asosiy serverga tegmaslik uchun alohida nginx nusxasi (`nginx -c`):

```nginx
# Sinov uchun alohida nginx nusxasi (asosiy serverga tegmaydi)
worker_processes 1;
error_log /tmp/n30/error.log notice;
pid /tmp/n30/nginx.pid;

events {
    worker_connections 8;
}

http {
    access_log off;
    sendfile on;
    server {
        listen 127.0.0.1:8119;
        root /tmp/n30/www;
        keepalive_timeout 2s;
        keepalive_requests 3;
        location /sekin/ { limit_rate 100k; }
    }
}
```

```text vps
$ mkdir -p /tmp/n30/www/sekin && mv /root/cfg/nginx.conf /tmp/n30/ && rm -rf /root/cfg && mv /root/ka.py /tmp/n30/; echo salom > /tmp/n30/www/a.html; head -c 1048576 /dev/zero > /tmp/n30/www/sekin/f.bin; nginx -t -c /tmp/n30/nginx.conf 2>&1 | tail -1; nginx -c /tmp/n30/nginx.conf; sleep 0.5; grep 'event method' /tmp/n30/error.log | cut -d' ' -f3-
nginx: configuration file /tmp/n30/nginx.conf test is successful
[notice] 189073#189073: using the "epoll" event method
$ for i in $(seq 1 10); do (curl -s -o /dev/null -m 20 -w "%{http_code} " http://127.0.0.1:8119/sekin/f.bin >> /tmp/n30/natija &); done; sleep 1; curl -s -o /dev/null -w "qo'shimcha so'rov: %{http_code} (curl kodi " http://127.0.0.1:8119/a.html; echo "$?)"; grep -c 'worker_connections are not enough' /tmp/n30/error.log | sed 's/^/jurnalda "worker_connections are not enough": /'; sleep 12; echo "10 ta sekin yuklab olish: $(cat /tmp/n30/natija)"
qo'shimcha so'rov: 000 (curl kodi 52)
jurnalda "worker_connections are not enough": 5
10 ta sekin yuklab olish: 000 000 000 000 200 200 200 200 200 200 
```

`worker_connections 8` — bitta worker uchun 8 ta ulanish. 10 ta sekin yuklab olish:

- 4 tasi — `000` (ulanish yopildi), qo'shimcha so'rov ham — curl kodi 52;
- jurnalda `worker_connections are not enough`;
- qolgan 6 tasi — 200.

### `keepalive_requests 3`

```text vps
$ curl -sv -o /dev/null -o /dev/null -o /dev/null -o /dev/null -o /dev/null http://127.0.0.1:8119/a.html http://127.0.0.1:8119/a.html http://127.0.0.1:8119/a.html http://127.0.0.1:8119/a.html http://127.0.0.1:8119/a.html 2>&1 | grep -iE 'reus|connected to|^< connection:|left intact|closing connection' | sed -E 's/^[*<] //; s/ \(#[0-9]+\)//'
Connection: keep-alive
Connection #0 to host 127.0.0.1:8119 left intact
Reusing existing http: connection with host 127.0.0.1
Connection: keep-alive
Connection #0 to host 127.0.0.1:8119 left intact
Reusing existing http: connection with host 127.0.0.1
Connection: close
Connection: keep-alive
Connection #1 to host 127.0.0.1:8119 left intact
Reusing existing http: connection with host 127.0.0.1
Connection: keep-alive
Connection #1 to host 127.0.0.1:8119 left intact
```

Bitta ulanishda (`#0`) 3 so'rov; uchinchisiga javobda `Connection: close` — keyingi so'rovlar yangi ulanishda (`#1`).

### `keepalive_timeout 2s`

```text vps
$ python3 /tmp/n30/ka.py 1; python3 /tmp/n30/ka.py 3
0 s kutib: HTTP 200, o'sha ulanish
1 s kutib: HTTP 200, o'sha ulanish
0 s kutib: HTTP 200, o'sha ulanish
3 s kutib: server ulanishni yopgan (RemoteDisconnected)
```

Bitta ulanishda ikki so'rov: 1 soniya orada — o'sha ulanish ishladi; 3 soniya — server ulanishni allaqachon yopgan.

```text vps
$ nginx -c /tmp/n30/nginx.conf -s quit; sleep 0.5; rm -rf /tmp/n30; echo ok
ok
```

## Variantlar

| Vaziyat | Sozlama |
| --- | --- |
| Ko'p yadroli server | `worker_processes auto;` |
| Ko'p bir vaqtdagi ulanish | `worker_connections` ↑ va `worker_rlimit_nofile` ↑ |
| Ko'p statik fayl | `sendfile on; tcp_nopush on;` |
| Ko'p bo'sh keep-alive ulanish xotirani egallaydi | `keepalive_timeout` ↓ |
| Backend bilan keep-alive | `upstream { keepalive N; }` (NG, upstream module) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| `worker_connections` ni oshirib, fayl chegarasini unutish | Haqiqiy chegara — ochiq fayllar soni (NG) | `worker_rlimit_nofile` |
| Proksida `worker_connections` ni faqat mijozlar uchun hisoblash | Backend ulanishlari ham hisoblanadi (NG) | Zaxira bilan |
| `use epoll;` ni majburan yozish | nginx o'zi eng samaralisini tanlaydi (NG) | Odatda yozmaslik |
| `tcp_nopush` ni `sendfile` siz | Faqat `sendfile` bilan ishlaydi (NG) | Ikkalasini birga |
| Juda katta `keepalive_requests` | Xotira (NG) | Standart 1000 |

## Amaliyot

1. `worker_processes auto` nimani bildiradi?
2. `worker_connections` ga qaysi ulanishlar kiradi?
3. Haqiqiy bir vaqtdagi ulanishlar sonini yana nima cheklaydi?
4. Linux'da nginx qaysi usulni tanladi va uni qo'lda yozish kerakmi?
5. `keepalive_timeout` va `keepalive_requests` farqi?
6. Sinovda `worker_connections 8` bilan nima bo'ldi?

<details>
<summary>Javoblar</summary>

1. Worker'lar sonini yadrolar soniga qarab avtomatik aniqlash.
2. Barcha ulanishlar — mijozlar va backend'lar bilan.
3. Ochiq fayllar chegarasi (RLIMIT_NOFILE, `worker_rlimit_nofile`).
4. `epoll`; odatda yo'q — nginx eng samaralisini o'zi tanlaydi.
5. Birinchisi — bo'sh ulanish qancha ochiq turadi; ikkinchisi — bitta ulanishda nechta so'rov.
6. 10 ta ulanishdan 4 tasi va qo'shimcha so'rov uzildi; jurnalda `worker_connections are not enough`.

</details>

## Rasmiy hujjat

- [NG: Core functionality](https://nginx.org/en/docs/ngx_core_module.html) — `worker_processes`, `worker_connections`, `worker_rlimit_nofile`, `multi_accept`
- [NG: Connection processing methods](https://nginx.org/en/docs/events.html)
- [NG: ngx_http_core_module](https://nginx.org/en/docs/http/ngx_http_core_module.html) — `keepalive_timeout`, `keepalive_requests`, `sendfile`, `tcp_nopush`, `tcp_nodelay`
- [NA: Serve Static Content — Optimize Performance](https://docs.nginx.com/nginx/admin-guide/web-server/serving-static-content/)
