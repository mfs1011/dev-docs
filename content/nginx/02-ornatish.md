# 02 — O'rnatish

[Mundarija](README.md)

## Tushuncha

### Qaysi paket

NA (Installing NGINX Open Source): nginx'ni o'rnatishning ikki yo'li — tayyor paket yoki manbadan kompilyatsiya. Tayyor paketlar:

| Manba | Versiya | NA bahosi |
| --- | --- | --- |
| **Rasmiy nginx ombori** (nginx.org) | So'nggi mainline yoki stable | Production uchun tavsiya etiladi |
| OS ombori (Ubuntu) | Odatda eskirgan | O'rganish yoki sinov uchun mos |

**Mainline** — yangi imkoniyatlar va tuzatishlar; **stable** — faqat jiddiy tuzatishlar. NA: mainline production uchun ham tavsiya etiladi; faqat barqarorlikka qat'iy talab bo'lsa — stable. Bu qo'llanma — mainline (README'dagi versiyalar jadvali).

### Rasmiy ombordan (Ubuntu)

NG (nginx: Linux packages) tartibi:

1. Kerakli paketlar: `curl gnupg2 ca-certificates lsb-release ubuntu-keyring`.
2. nginx imzo kalitini olish (`apt` paketlar haqiqiyligini tekshirishi uchun) va **barmoq izini tekshirish**: chiqishda `573BFD6B3D8FBC641079A6ABABF5BD827BD9BF62` bo'lishi kerak; boshqa kalitlar ham bo'lishi mumkin.
3. Ombor: stable — `https://nginx.org/packages/ubuntu`, mainline — `https://nginx.org/packages/mainline/ubuntu`.
4. **Pinning** — `apt` nginx.org paketlarini Ubuntu paketlaridan ustun qo'yishi uchun (`Pin-Priority: 900`).
5. `apt update`, `apt install nginx`.

## Ko'rib chiqamiz

VPS'da (Ubuntu 26.04, root foydalanuvchi — shuning uchun `sudo` siz).

### Ubuntu ombori nima taklif qiladi

```text vps
$ lsb_release -cs; apt-cache policy nginx | head -3
resolute
nginx:
  Installed: (none)
  Candidate: 1.28.3-2ubuntu1.12
```

Ubuntu 26.04 ("resolute") — 1.28.3; nginx.org'da 1.28 — eski ("legacy") versiyalar ro'yxatida.

### Kalit va ombor

```text vps
$ apt-get install -y -q curl gnupg2 ca-certificates lsb-release ubuntu-keyring 2>&1 | tail -1
No VM guests are running outdated hypervisor (qemu) binaries on this host.
$ mkdir -p -m 700 /root/.gnupg; curl -s https://nginx.org/keys/nginx_signing.key | gpg --dearmor | tee /usr/share/keyrings/nginx-archive-keyring.gpg >/dev/null; gpg --dry-run --quiet --no-keyring --import --import-options import-show /usr/share/keyrings/nginx-archive-keyring.gpg
pub   rsa4096 2024-05-29 [SC]
      8540A6F18833A80E9C1653A42FD21310B49F6B46
uid                      nginx signing key <signing-key-2@nginx.com>

pub   rsa2048 2011-08-19 [SC] [expires: 2027-05-24]
      573BFD6B3D8FBC641079A6ABABF5BD827BD9BF62
uid                      nginx signing key <signing-key@nginx.com>

pub   rsa4096 2024-05-29 [SC]
      9E9BE90EACBCDE69FE9B204CBCDCD8A38D88A2B3
uid                      nginx signing key <signing-key-3@nginx.com>
```

Barmoq izi `573BFD6B…BF62` — NG ko'rsatgan kalit bor; yana ikki 2024-yilgi kalit (NG: "boshqa kalitlar ham bo'lishi mumkin").

```text vps
$ echo "deb [signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] https://nginx.org/packages/mainline/ubuntu `lsb_release -cs` nginx" | tee /etc/apt/sources.list.d/nginx.list
deb [signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] https://nginx.org/packages/mainline/ubuntu resolute nginx
$ echo -e "Package: *\nPin: origin nginx.org\nPin: release o=nginx\nPin-Priority: 900\n" | tee /etc/apt/preferences.d/99nginx
Package: *
Pin: origin nginx.org
Pin: release o=nginx
Pin-Priority: 900
$ apt-get update -q 2>&1 | grep -i nginx; apt-cache policy nginx | head -8
Get:5 https://nginx.org/packages/mainline/ubuntu resolute InRelease [3281 B]
Get:6 https://nginx.org/packages/mainline/ubuntu resolute/nginx amd64 Packages [28.7 kB]
nginx:
  Installed: (none)
  Candidate: 1.31.8-1~resolute
  Version table:
     1.31.8-1~resolute 900
        900 https://nginx.org/packages/mainline/ubuntu resolute/nginx amd64 Packages
     1.31.7-1~resolute 900
        900 https://nginx.org/packages/mainline/ubuntu resolute/nginx amd64 Packages
```

Pinning ishladi: endi nomzod (Candidate) — **1.31.8** nginx.org mainline omboridan, prioritet 900.

### O'rnatish va ishga tushirish

```text vps
$ apt-get install -y -q nginx 2>&1 | grep -E '^(Setting up|Unpacking) nginx|Thanks for using|^ *nginx ' | head -5
Thanks for using nginx!
Unpacking nginx (1.31.8-1~resolute) ...
Setting up nginx (1.31.8-1~resolute) ...
$ nginx -v; systemctl is-enabled nginx; systemctl is-active nginx
nginx version: nginx/1.31.8
enabled
inactive
```

nginx 1.31.8 o'rnatildi; systemd servisi yoqilgan (`enabled` — kompyuter yonganda ishga tushadi), lekin hali ishlamayapti (`inactive`) — kuzatildi: rasmiy paket o'rnatishdan keyin uni avtomatik ishga tushirmadi.

```text vps
$ systemctl start nginx; systemctl is-active nginx; ps -o user=,pid=,cmd= -C nginx; nproc
active
redis     104023 nginx: master process nginx -c /etc/nginx/nginx.conf -g daemon off;
redis     104123 nginx: worker process
root      171898 nginx: master process /usr/sbin/nginx -c /etc/nginx/nginx.conf
nginx     171899 nginx: worker process
1
```

- `systemctl start` — `active`.
- `ps -C nginx` nomi `nginx` bo'lgan **hamma** jarayonni ko'rsatdi, jumladan bu VPS'dagi Docker konteyneri ichidagi nginx'ni ham (Docker kitobidan qolgan; konteynerdagi `nginx` foydalanuvchisi ID'si 101, xostda 101 — `redis`, shuning uchun `ps` uni `redis` deb ko'rsatdi). Faqat xostdagi nginx'ni ko'rish uchun — PID fayli bo'yicha:

```text vps
$ grep -E '^(user|worker_processes|pid|error_log)' /etc/nginx/nginx.conf; ps -o user=,pid=,ppid=,cmd= -p $(cat /run/nginx.pid) --ppid $(cat /run/nginx.pid)
user  nginx;
worker_processes  auto;
error_log  /var/log/nginx/error.log notice;
pid        /run/nginx.pid;
root      171898       1 nginx: master process /usr/sbin/nginx -c /etc/nginx/nginx.conf
nginx     171899  171898 nginx: worker process
```

- `user nginx;` — worker'lar `nginx` foydalanuvchisi nomidan; master — `root`.
- `worker_processes auto;` — yadrolar soniga qarab; VPS'da 1 yadro (`nproc`) — 1 worker.
- `pid /run/nginx.pid` — master jarayon ID'si (4-bobdagi signallar uchun).

### Tekshirish

```text vps
$ curl -sI http://127.0.0.1/ | head -5; ss -ltn | awk 'NR==1 || /:80 /'
HTTP/1.1 200 OK
Server: nginx/1.31.8
Date: Sun, 08 Nov 2026 17:02:47 GMT
Content-Type: text/html
Content-Length: 896
State  Recv-Q Send-Q Local Address:Port Peer Address:Port
LISTEN 0      511          0.0.0.0:80        0.0.0.0:*   
```

Standart sahifa javob beryapti (`Server: nginx/1.31.8`), 80-port barcha IPv4 manzillarda tinglanmoqda.

### `nginx -V`

```text vps
$ nginx -V 2>&1 | head -4 | cut -c1-200; nginx -V 2>&1 | tr ' ' '\n' | grep -E '^--with-(http_v2|http_v3|http_ssl|http_gzip_static|http_realip|stream|compat)' | sort
nginx version: nginx/1.31.8
built by gcc 15.2.0 (Ubuntu 15.2.0-16ubuntu1) 
built with OpenSSL 3.5.5 27 Jan 2026
TLS SNI support enabled
--with-compat
--with-http_gzip_static_module
--with-http_realip_module
--with-http_ssl_module
--with-http_v2_module
--with-http_v3_module
--with-stream
--with-stream_realip_module
--with-stream_ssl_module
--with-stream_ssl_preread_module
```

`-v` — faqat versiya; `-V` — yana kompilyator, OpenSSL versiyasi va yig'ish parametrlari. Paketda HTTP/2, HTTP/3, SSL, `gzip_static`, `realip` va stream modullari bor — keyingi boblarda kerak bo'ladi.

### Fayllar

```text vps
$ ls /etc/nginx /etc/nginx/conf.d; grep -vE '^\s*(#|$)' /etc/nginx/conf.d/default.conf
/etc/nginx:
conf.d
fastcgi_params
mime.types
modules
nginx.conf
scgi_params
uwsgi_params

/etc/nginx/conf.d:
default.conf
server {
    listen       80;
    server_name  localhost;
    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
    }
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
```

`/etc/nginx/nginx.conf` — asosiy fayl; `conf.d/default.conf` — standart sayt: 80-port, `/usr/share/nginx/html` papkasi, 5xx xatolar uchun `/50x.html`. Tuzilishi — 3-bob.

## Variantlar

| Yo'l | Qachon | Kamchiligi |
| --- | --- | --- |
| nginx.org mainline | Production (NA tavsiyasi), yangi imkoniyatlar | Tez-tez yangilanadi |
| nginx.org stable | Barqarorlik qat'iy talab | Yangi imkoniyatlar kechroq |
| Ubuntu paketi | O'rganish, sinov (NA) | Eskirgan (1.28.3) |
| Docker obrazi | Konteyner ichida | Sozlash konteynerda (Docker kitobi) |
| Manbadan kompilyatsiya | Maxsus modullar | Yangilashni o'zingiz qilasiz |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Kalit barmoq izini tekshirmaslik | Soxta kalit bilan soxta paket o'rnatilishi mumkin | NG'dagi barmoq izi bilan solishtirish |
| Pinning'siz rasmiy ombor | Ubuntu paketi tanlanishi mumkin | `/etc/apt/preferences.d/99nginx` |
| Mainline va stable omborini aralashtirish | Kutilmagan versiya | Bitta `nginx.list` |
| `ps aux \| grep nginx` natijasini ko'r-ko'rona o'qish | Konteynerlardagi nginx ham ko'rinadi (sinovda shunday) | `/run/nginx.pid` yoki `systemctl status nginx` |
| O'rnatilgach ishlayapti deb o'ylash | Paket uni ishga tushirmagan bo'lishi mumkin (sinovda `inactive`) | `systemctl is-active nginx` |
| Ubuntu paketi va nginx.org hujjatidagi direktivalar farqini e'tiborsiz qoldirish | Eski versiyada yangi direktiva yo'q | `nginx -v` va hujjatdagi versiya belgisi |

## Amaliyot

1. NA bo'yicha qaysi ombor production uchun tavsiya etiladi? Mainline yoki stable?
2. Nega imzo kaliti barmoq izini tekshirish kerak?
3. Pinning nima qiladi?
4. `nginx -v` va `nginx -V` farqi nima?
5. nginx'ning qaysi jarayoni qaysi foydalanuvchidan ishlaydi?
6. `ps -C nginx` nega VPS'da kutilgandan ko'p jarayon ko'rsatdi?

<details>
<summary>Javoblar</summary>

1. Rasmiy nginx ombori; mainline (stable — faqat barqarorlikka qat'iy talab bo'lsa).
2. `apt` paketlarning haqiqiyligini shu kalit bilan tekshiradi; soxta kalit — soxta paket.
3. `apt` ga nginx.org paketlarini Ubuntu paketlaridan ustun qo'yishni aytadi (prioritet 900).
4. `-v` — versiya; `-V` — versiya, kompilyator, OpenSSL va yig'ish parametrlari (modullar).
5. Master — `root`, worker — `nginx` (`user nginx;`).
6. Docker konteyneri ichidagi nginx jarayonlari ham xostda ko'rinadi.

</details>

## Rasmiy hujjat

- [NG: nginx: Linux packages](https://nginx.org/en/linux_packages.html)
- [NA: Installing NGINX Open Source](https://docs.nginx.com/nginx/admin-guide/installing-nginx/installing-nginx-open-source/)
- [NG: download](https://nginx.org/en/download.html)
