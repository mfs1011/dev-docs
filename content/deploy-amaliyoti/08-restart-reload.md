# 08 — Restart va reload

[Mundarija](README.md)

## Tushuncha

Deploydan keyin servis yangi kod yoki yangi sozlama bilan ishlashi kerak. Ikki yo'l bor:

| Buyruq | SD (systemctl(1)) |
| --- | --- |
| `systemctl restart` | Unit'ni **to'xtatadi va qayta ishga tushiradi** (ishlamayotgan bo'lsa — ishga tushiradi) |
| `systemctl reload` | Unit'dan **o'z sozlamasini** qayta o'qishni so'raydi — servisning sozlamasini (masalan, Apache'ning `httpd.conf`), systemd unit faylini emas |
| `systemctl reload-or-restart` | Qo'llasa — reload, aks holda to'xtatib, ishga tushiradi |
| `systemctl daemon-reload` | systemd'ning o'zi **unit fayllarini** qayta o'qiydi — `reload` bilan adashtirilmasin (SD) |

Restart paytida jarayon to'xtaydi: unga kelib turgan so'rovlar **uziladi**. Reload'ni esa servis o'zi qo'llashi kerak — unit faylida `ExecReload=` bo'lishi lozim.

### nginx: `HUP` signali

NG (Controlling nginx): master jarayon signallar bilan boshqariladi. `HUP` — sozlamani o'zgartirish:

1. Master avval sozlama **sintaksisini** tekshiradi, keyin uni qo'llashga urinadi (log fayllarni va yangi `listen` socket'larni ochadi).
2. Muvaffaqiyatsiz bo'lsa — o'zgarishlarni **bekor qiladi** va eski sozlama bilan ishlashda davom etadi.
3. Muvaffaqiyatli bo'lsa — **yangi worker**'larni ishga tushiradi va eskilariga ishni **ohista** (gracefully) tugatish xabarini yuboradi.
4. Eski worker'lar `listen` socket'larni yopadi va **eski mijozlarga xizmat qilishda davom etadi**; hammasi tugagach, to'xtaydi.

| Signal | NG |
| --- | --- |
| `TERM`, `INT` | Tez to'xtash |
| `QUIT` | Ohista to'xtash |
| `HUP` | Sozlamani qayta o'qish, yangi worker'lar |
| `USR1` | Log fayllarni qayta ochish |
| `USR2` | Bajariladigan faylni yangilash |
| `WINCH` | Worker'larni ohista to'xtatish |

## Ko'rib chiqamiz

VPS'da (Ubuntu 26.04, nginx 1.31.8). Har so'rovga **6 soniyada** javob beradigan sekin backend — reload va restart paytida "yo'lda" turgan so'rovni ko'rish uchun:

```python
# Sekin backend: har so'rovga 6 soniyada javob beradi
import http.server, time, os
class H(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        time.sleep(6)
        self.send_response(200); self.end_headers()
        self.wfile.write(f"javob, backend pid {os.getpid()}\n".encode())
http.server.ThreadingHTTPServer(("127.0.0.1", 8093), H).serve_forever()
```

nginx — uning oldida:

```nginx
server {
    listen 127.0.0.1:8092;
    location / {
        proxy_pass http://127.0.0.1:8093;
    }
}
```

### Ishga tushirish

```text vps
$ systemd-run -q --unit=sekin-sinov python3 /root/sekin.py; mv /root/deploy-sinov.conf /etc/nginx/conf.d/; nginx -t 2>&1 | tail -1; systemctl reload nginx; sleep 1; curl -s -o /dev/null -w '%{http_code} %{time_total}s\n' http://127.0.0.1:8092/
nginx: configuration file /etc/nginx/nginx.conf test is successful
200 6.003671s
$ ps -o pid=,cmd= --ppid $(cat /run/nginx.pid) | sed 's/  */ /g'
 15463 nginx: worker process
```

Backend — vaqtinchalik systemd unit (`systemd-run`). So'rov 6 soniyada 200 qaytardi; nginx'da bitta worker (`15463`).

nginx unit faylida reload — xuddi `HUP` signali:

```text
ExecReload=/bin/sh -c "/bin/kill -s HUP $(/bin/cat /run/nginx.pid)"
```

### Uzoq so'rov paytida nginx reload

So'rov boshlanadi, 2 soniyadan keyin — `systemctl reload nginx`:

```text vps
$ (curl -s -w '%{http_code} %{time_total}s\n' http://127.0.0.1:8092/ > /tmp/uzun.txt &); sleep 2; systemctl reload nginx; sleep 0.5; ps -o pid=,cmd= --ppid $(cat /run/nginx.pid) | sed 's/  */ /g'; sleep 5; echo "uzun so'rov:"; cat /tmp/uzun.txt; ps -o pid=,cmd= --ppid $(cat /run/nginx.pid) | sed 's/  */ /g'
 15463 nginx: worker process is shutting down
 15511 nginx: worker process
uzun so'rov:
javob, backend pid 15452
200 6.004027s
 15511 nginx: worker process
```

- Reload'dan keyin: eski worker `15463` — **`is shutting down`**, yangi worker `15511` paydo bo'ldi (NG'dagi misol kabi).
- Uzoq so'rov **200** bilan tugadi — eski worker uni oxirigacha xizmat qildi.
- So'rov tugagach eski worker chiqib ketdi, faqat yangisi qoldi.

### Uzoq so'rov paytida backend restart

```text vps
$ (curl -s -w '%{http_code} %{time_total}s\n' http://127.0.0.1:8092/ > /tmp/uzun.txt &); sleep 2; systemctl restart sekin-sinov; sleep 1; echo "uzun so'rov:"; cat /tmp/uzun.txt | tail -1; tail -1 /var/log/nginx/error.log | grep -oE 'upstream prematurely closed connection|Connection reset by peer|connect\(\) failed[^,]*' | head -1
uzun so'rov:
502 2.016972s
upstream prematurely closed connection
```

Backend restart qilindi — yo'ldagi so'rov 2 soniyada **502** bilan tugadi; nginx jurnalida — `upstream prematurely closed connection`. Bu — oddiy restart'dagi to'xtash (16-bob).

```text vps
$ systemctl reload sekin-sinov 2>&1
Failed to reload sekin-sinov.service: Job type reload is not applicable for unit sekin-sinov.service.
```

Backend'da `ExecReload=` yo'q — reload qo'llanmaydi.

### Xato sozlama bilan reload

Nuqta-vergul tushib qolgan sozlama (`listen 127.0.0.1:8094 }`):

```text vps
$ echo 'server { listen 127.0.0.1:8094 }' > /etc/nginx/conf.d/xato-sinov.conf; systemctl reload nginx; echo "reload kodi: $?"; sleep 1; rm /etc/nginx/conf.d/xato-sinov.conf; tail -2 /var/log/nginx/error.log | grep -oE '\[emerg\].*' | sed 's/ in \/etc.*//' | head -1; curl -s -o /dev/null -w '%{http_code}\n' -m 10 http://127.0.0.1:8092/
reload kodi: 0
[emerg] 966#966: unexpected "}"
200
```

- `systemctl reload` **0** (muvaffaqiyat) qaytardi — u faqat signal yuboradi.
- nginx jurnalida — `[emerg] unexpected "}"`: master yangi sozlamani qabul qilmadi va **eski** sozlama bilan ishlashda davom etdi — sayt 200 qaytaryapti (NG: rollback).
- Kuzatildi: xato sozlama faqat jurnalda ko'rinadi. Shuning uchun reload'dan oldin — `nginx -t`.

```text vps
$ rm /etc/nginx/conf.d/deploy-sinov.conf /root/sekin.py /tmp/uzun.txt; nginx -t 2>&1 | tail -1; systemctl reload nginx; systemctl stop sekin-sinov; echo tozalandi
nginx: configuration file /etc/nginx/nginx.conf test is successful
tozalandi
```

## Variantlar

| Vaziyat | Buyruq |
| --- | --- |
| nginx sozlamasi o'zgardi | `nginx -t && systemctl reload nginx` |
| Ilova kodi yangilandi (reload qo'llamaydi) | `systemctl restart` — yo'ldagi so'rovlar uziladi (16–18-boblar) |
| Unit fayli o'zgardi | `systemctl daemon-reload`, keyin restart |
| Servis reload'ni qo'llashi noma'lum | `systemctl reload-or-restart` |
| nginx log fayllari almashtirildi | `USR1` (NG) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| nginx sozlamasidan keyin `restart` | Barcha ulanishlar uziladi | `reload` — eski worker'lar ishini tugatadi |
| `nginx -t` siz reload | `systemctl reload` 0 qaytaradi, xato faqat jurnalda (sinovda) | `nginx -t && systemctl reload nginx` |
| `reload` bilan `daemon-reload` ni adashtirish | Biri servis sozlamasi, biri unit fayllari (SD) | Kerakli buyruq |
| Ilovani yuklama ostida `restart` | Yo'ldagi so'rovlar 502 (sinovda) | Ikki nusxa (17-bob) yoki socket activation (18-bob) |
| Unit faylini o'zgartirib, `daemon-reload` qilmaslik | systemd eski unit bilan ishlaydi | `daemon-reload` |

## Amaliyot

1. `restart` va `reload` farqi?
2. nginx `HUP` olganda qanday qadamlarni bajaradi?
3. Sinovda nginx reload paytida uzoq so'rov bilan nima bo'ldi?
4. Backend restart paytida-chi?
5. Xato sozlama bilan reload qilinsa, nginx qanday ishlaydi va buni qanday bilasiz?
6. `daemon-reload` nima qiladi?

<details>
<summary>Javoblar</summary>

1. Restart — to'xtatib qayta ishga tushirish; reload — servis o'z sozlamasini qayta o'qiydi.
2. Sintaksisni tekshiradi, qo'llaydi, yangi worker'lar ishga tushiradi, eskilarini ohista to'xtatadi; muvaffaqiyatsiz bo'lsa — eskisida qoladi.
3. Eski worker uni oxirigacha xizmat qildi — 200.
4. So'rov 502 bilan uzildi.
5. Eski sozlama bilan ishlayveradi; `systemctl reload` 0 qaytaradi, xato — nginx jurnalida. Oldindan `nginx -t`.
6. systemd unit fayllarini qayta o'qiydi.

</details>

## Rasmiy hujjat

- [NG: Controlling nginx](https://nginx.org/en/docs/control.html)
- [SD: systemctl(1)](https://www.freedesktop.org/software/systemd/man/latest/systemctl.html) — restart, reload, reload-or-restart, daemon-reload
