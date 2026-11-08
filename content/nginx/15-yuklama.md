# 15 — Yuklamani taqsimlash

[Mundarija](README.md)

## Tushuncha

NG (Using nginx as HTTP load balancer): bir ilovaning bir nechta nusxasiga yuklamani taqsimlash — resurslardan samarali foydalanish, o'tkazish qobiliyatini oshirish, kechikishni kamaytirish va nosozlikka chidamlilik uchun keng tarqalgan usul.

### `upstream`

```nginx
http {
    upstream myapp1 {
        server srv1.example.com;
        server srv2.example.com;
        server srv3.example.com;
    }
    server {
        listen 80;
        location / {
            proxy_pass http://myapp1;
        }
    }
}
```

Usul ko'rsatilmasa — **round-robin** (navbat bilan). HTTP, HTTPS, FastCGI (`fastcgi_pass`), uwsgi, SCGI, memcached, gRPC uchun ham (NG).

### Usullar

| Usul | Direktiva | Nima (NG) |
| --- | --- | --- |
| Round-robin | (standart) | Navbat bilan |
| Eng kam ulanish | `least_conn;` | Faol ulanishlari eng kam serverga — ba'zi so'rovlar uzoq davom etsa adolatliroq |
| Eng kam vaqt | `least_time header \| last_byte [inflight];` | O'rtacha javob vaqti va faol ulanishlari eng kam serverga |
| IP xesh | `ip_hash;` | Mijoz IP manzili bo'yicha — bitta mijoz doim bitta serverga (server ishlamasa — boshqasiga) |
| Ixtiyoriy kalit xeshi | `hash kalit [consistent];` | Kalit (o'zgaruvchilar) bo'yicha; `consistent` — ketama: server qo'shilsa/olinsa, kalitlarning faqat ozi boshqa serverga o'tadi |

NG: round-robin va least-connected da keyingi so'rov **boshqa** serverga tushishi mumkin — sessiyani bitta serverga bog'lash ("sticky") kerak bo'lsa — `ip_hash` (yoki `hash`).

### Og'irlik va server parametrlari

`server manzil [parametrlar];` (NG, upstream module):

| Parametr | Standart | Nima |
| --- | --- | --- |
| `weight=n` | 1 | Og'irlik: `weight=3` + ikki oddiy server → har 5 so'rovdan 3 tasi birinchisiga |
| `max_fails=n` | 1 | `fail_timeout` ichida shuncha muvaffaqiyatsiz urinish — server "ishlamaydi"; `0` — hisoblanmaydi |
| `fail_timeout=vaqt` | 10s | Urinishlar hisoblanadigan oraliq **va** server ishlamaydi deb hisoblanadigan muddat |
| `backup` | — | Zaxira: asosiylar ishlamasagina so'rov oladi (`hash`, `ip_hash`, `random` bilan emas) |
| `down` | — | Doimiy ishlamaydi |

### Passiv tekshiruv

NG: nginx'da **passiv** (in-band) health check bor: serverga so'rov xato bilan tugasa, nginx uni ishlamaydi deb belgilaydi va biroz vaqt tanlamaydi. `fail_timeout` o'tgach, haqiqiy mijoz so'rovlari bilan **ehtiyotkorlik bilan sinab** ko'radi; muvaffaqiyatli bo'lsa — yana tirik. Nima "muvaffaqiyatsiz" hisoblanishi — `proxy_next_upstream` (standart: ulanish xatosi va timeout). Faol tekshiruv (alohida so'rovlar bilan) — NGINX Plus'da (README).

## Ko'rib chiqamiz

VPS'da (nginx 1.31.8). Ilova — qaysi port (nusxa) javob berganini qaytaradi; `?s=N` — N soniya kutish, ikkinchi argument — har so'rovga kechikish:

```python
# Sinov ilovasi: qaysi nusxa javob berganini aytadi
import sys, time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

PORT = int(sys.argv[1])
KECHIKISH = float(sys.argv[2]) if len(sys.argv) > 2 else 0

class A(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    def do_GET(self):
        q = parse_qs(urlparse(self.path).query)
        time.sleep(float(q.get("s", [KECHIKISH])[0]))
        d = f"{PORT}\n".encode()
        self.send_response(200)
        self.send_header("Content-Length", str(len(d)))
        self.end_headers()
        self.wfile.write(d)
    def log_message(self, *a):
        pass

ThreadingHTTPServer(("127.0.0.1", PORT), A).serve_forever()
```

```nginx
upstream rr {
    server 127.0.0.1:9031;
    server 127.0.0.1:9032;
    server 127.0.0.1:9033;
}
upstream vazn {
    server 127.0.0.1:9031 weight=3;
    server 127.0.0.1:9032;
    server 127.0.0.1:9033;
}
upstream lc {
    least_conn;
    server 127.0.0.1:9031;
    server 127.0.0.1:9032;
}
upstream hsh {
    hash $arg_user consistent;
    server 127.0.0.1:9031;
    server 127.0.0.1:9032;
    server 127.0.0.1:9033;
}
upstream lt {
    least_time header;
    server 127.0.0.1:9031;
    server 127.0.0.1:9034;
}
upstream zaxira {
    server 127.0.0.1:9031;
    server 127.0.0.1:9032 backup;
}

server {
    listen 127.0.0.1:8109;
    location /rr/     { proxy_pass http://rr/; }
    location /vazn/   { proxy_pass http://vazn/; }
    location /lc/     { proxy_pass http://lc/; }
    location /hsh/    { proxy_pass http://hsh/; }
    location /lt/     { proxy_pass http://lt/; }
    location /zaxira/ { proxy_pass http://zaxira/; }
}
```

```text vps
$ mkdir -p /opt/lb && mv /root/app.py /opt/lb/; for p in 9031 9032 9033; do (nohup python3 /opt/lb/app.py $p > /dev/null 2>&1 &); done; (nohup python3 /opt/lb/app.py 9034 0.3 > /dev/null 2>&1 &); sleep 1; cp /root/lb.conf /etc/nginx/conf.d/lb.conf; rm /root/lb.conf; nginx -t -q && nginx -s reload; sleep 0.5; echo tayyor
tayyor
```

Nusxalar 9031, 9032, 9033; 9034 — har so'rovga 0,3 s kechikadi.

### Round-robin va og'irlik

`n URI son` — shuncha so'rov, kim javob berdi:

```text vps
$ n() { for i in $(seq 1 $2); do curl -s "http://127.0.0.1:8109$1"; done | tr '\n' ' '; echo; }; echo -n 'rr:   '; n /rr/ 6; echo -n 'vazn: '; n /vazn/ 10
rr:   9031 9032 9033 9031 9032 9033 
vazn: 9031 9032 9031 9033 9031 9031 9032 9031 9033 9031 
```

- Round-robin: 9031 → 9032 → 9033 → …
- `weight=3`: 10 so'rovdan 6 tasi 9031 ga, 2 tadan 9032 va 9033 ga — 3:1:1; nginx ularni bir joyga to'plamay aralashtirdi.

### Kalit xeshi

```text vps
$ for u in ali vali ali sami vali ali; do echo -n "$u→$(curl -s "http://127.0.0.1:8109/hsh/?user=$u") "; done; echo
ali→9033 vali→9031 ali→9033 sami→9031 vali→9031 ali→9033 
```

`hash $arg_user consistent`: bir foydalanuvchi — doim bir nusxa (`ali` → 9033, `vali` → 9031).

### `least_conn`

9031 ga 3 soniyalik so'rov yuborildi; u band paytida 4 ta tez so'rov:

```text vps
$ (curl -s 'http://127.0.0.1:8109/lc/?s=3' > /tmp/sekin.txt &); sleep 0.3; echo -n 'least_conn, biri band: '; n /lc/ 4; sleep 3; echo "sekin so'rov javobi: $(cat /tmp/sekin.txt)"
least_conn, biri band: 9032 9032 9032 9032 
sekin so'rov javobi: 9031
```

Hammasi 9032 ga — faol ulanishi kam server. (Round-robin bo'lsa, navbat bilan band 9031 ga ham tushardi.)

### `least_time`

```text vps
$ echo -n 'least_time (9034 — 0,3 s sekin): '; n /lt/ 8
least_time (9034 — 0,3 s sekin): 9031 9034 9031 9031 9031 9031 9031 9031 
```

Kuzatildi: `least_time` 1.31.8 bepul nginx'da ishladi (hujjatda tijoriy obuna belgisi yo'q). 9034 bir marta sinaldi va sekinligi aniqlangach, so'rovlar tez 9031 ga ketdi.

### Nusxa ishdan chiqdi

```text vps
$ pkill -f 'app.py 9032'; sleep 0.5; echo -n 'rr, 9032 o'"'"'chiq: '; for i in $(seq 1 6); do curl -s -o /tmp/j -w '%{http_code}:' http://127.0.0.1:8109/rr/; cat /tmp/j | tr -d '\n'; echo -n ' '; done; echo; grep -c '127.0.0.1:9032' /var/log/nginx/error.log | sed 's/^/jurnalda 9032 xatolari: /'
rr, 9032 o'chiq: 200:9031 200:9033 200:9033 200:9031 200:9033 200:9031 
jurnalda 9032 xatolari: 6
```

9032 to'xtatildi: mijoz **har doim 200** oldi — nginx ulanish xatosidan keyin so'rovni keyingi serverga o'tkazdi (`proxy_next_upstream`), 9032 ni esa `fail_timeout` davomida chetlatdi. Xatolar faqat jurnalda (`grep` butun jurnal faylini, shu jumladan oldingi sinov urinishlarini sanadi).

### `backup` va `fail_timeout`

```text vps
$ echo -n 'zaxira, asosiy ishlaydi: '; n /zaxira/ 3; pkill -f 'app.py 9031'; sleep 0.5; echo -n 'zaxira, 9031 ham o'"'"'chdi, 9032 yoq: '; for i in 1 2; do curl -s -o /dev/null -w '%{http_code} ' http://127.0.0.1:8109/zaxira/; done; echo
zaxira, asosiy ishlaydi: 9031 9031 9031 
zaxira, 9031 ham o'chdi, 9032 yoq: 502 502 
$ (nohup python3 /opt/lb/app.py 9032 > /dev/null 2>&1 &); sleep 1; echo -n 'backup qaytdi, darhol: '; curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8109/zaxira/; tail -n 1 /var/log/nginx/error.log | grep -o 'no live upstreams[^,]*'; sleep 10; echo -n '10 s dan keyin: '; n /zaxira/ 3
backup qaytdi, darhol: 502
no live upstreams while connecting to upstream
10 s dan keyin: 9032 9032 9032 
```

- Asosiy (9031) ishlayotganda — hamma so'rov unga; `backup` (9032) bo'sh turadi.
- 9031 ham to'xtatildi, zaxira ham yo'q — 502.
- Zaxira qaytdi, lekin **darhol** — yana 502, jurnalda `no live upstreams`: oldingi xatolar sababli guruhdagi ikkala server ham `fail_timeout` (10 s) davomida ishlamaydi deb belgilangan.
- 10 soniyadan keyin — so'rovlar zaxiraga.

```text vps
$ rm /etc/nginx/conf.d/lb.conf /tmp/sekin.txt; pkill -f /opt/lb/app.py; rm -rf /opt/lb; nginx -t -q && nginx -s reload; echo ok
ok
```

## Variantlar

| Vaziyat | Usul |
| --- | --- |
| Bir xil, tez so'rovlar | Round-robin |
| So'rovlar davomiyligi har xil | `least_conn` |
| Nusxalar tezligi har xil | `least_time` yoki `weight` |
| Sessiya serverda saqlanadi | `ip_hash` yoki `hash $cookie_…` |
| Kesh serverlari | `hash $request_uri consistent` |
| Zaxira server | `backup` |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Sessiyani serverda saqlab, round-robin | Keyingi so'rov boshqa serverga (NG) | Sessiyani umumiy joyda (Redis) yoki `ip_hash`/`hash` |
| Kesh serverlari uchun `consistent` siz `hash` | Server qo'shilsa ko'p kalit ko'chadi (NG) | `hash … consistent` |
| `backup` ni `ip_hash` bilan | NG: birga ishlatilmaydi | Boshqa usul |
| Server qaytgach darhol ishlaydi deb kutish | `fail_timeout` davomida chetlatilgan (sinovda 502) | `fail_timeout` ni hisobga olish |
| Nosozlikni faqat mijozdan kuzatish | Passiv tekshiruv xatoni yashiradi (sinovda mijoz 200 oldi) | Xato jurnali, monitoring |
| Bitta kompyuterdagi nusxalar bilan "nosozlikka chidamlilik" | Kompyuter ishdan chiqsa — hammasi | Har xil serverlar |

## Amaliyot

1. Standart taqsimlash usuli qaysi?
2. `weight=3` bilan uch serverda 5 so'rov qanday taqsimlanadi?
3. `least_conn` qachon round-robin'dan yaxshi?
4. `hash … consistent` nimasi bilan foydali?
5. `max_fails=1 fail_timeout=10s` nimani bildiradi? Sinovda u qanday ko'rindi?
6. `backup` server qachon so'rov oladi?

<details>
<summary>Javoblar</summary>

1. Round-robin.
2. 3 tasi og'irlikli serverga, qolganlarga bittadan.
3. So'rovlarning davomiyligi har xil bo'lsa.
4. Server qo'shilsa/olinsa, kalitlarning faqat ozi boshqa serverga o'tadi — kesh samaradorligi saqlanadi.
5. 10 s ichida 1 ta xato — server 10 s ishlamaydi deb hisoblanadi; zaxira qaytgach ham 10 s davomida 502 (`no live upstreams`).
6. Asosiy serverlar ishlamaganda.

</details>

## Rasmiy hujjat

- [NG: Using nginx as HTTP load balancer](https://nginx.org/en/docs/http/load_balancing.html)
- [NG: ngx_http_upstream_module](https://nginx.org/en/docs/http/ngx_http_upstream_module.html)
- [NA: HTTP Load Balancing](https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/)
