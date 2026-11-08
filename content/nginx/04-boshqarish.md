# 04 — nginx'ni boshqarish

[Mundarija](README.md)

## Tushuncha

NG (Controlling nginx): nginx **signallar** bilan boshqariladi. Master jarayon ID'si `pid` direktivasida ko'rsatilgan faylda (rasmiy paketda — `/run/nginx.pid`, 2-bob).

### Master signallari

| Signal | `nginx -s` | Nima (NG) |
| --- | --- | --- |
| `TERM`, `INT` | `stop` | Tez to'xtatish |
| `QUIT` | `quit` | Joriy so'rovlarni tugatib to'xtatish |
| `HUP` | `reload` | Konfiguratsiyani qayta yuklash: yangi worker'lar yangi sozlama bilan, eskilari asta to'xtaydi |
| `USR1` | `reopen` | Jurnal fayllarini qayta ochish |
| `USR2` | — | Bajariladigan faylni yangilash |
| `WINCH` | — | Worker'larni asta to'xtatish |

Alohida worker'larga ham signal yuborish mumkin, lekin shart emas. Signal `kill` bilan ham yuboriladi: `kill -s QUIT <pid>`. `nginx -s` nginx'ni ishga tushirgan foydalanuvchi nomidan bajarilishi kerak (NG, Beginner's Guide).

### Qayta yuklash (`HUP`)

NG:

1. Master yangi konfiguratsiya **sintaksisini** tekshiradi, so'ng uni qo'llashga urinadi (jurnal fayllari va yangi tinglash soketlarini ochadi).
2. **Muvaffaqiyatsiz** bo'lsa — o'zgarishlarni bekor qiladi va **eski** konfiguratsiya bilan ishlashda davom etadi.
3. Muvaffaqiyatli bo'lsa — **yangi worker'lar**ni ishga tushiradi, eskilariga asta to'xtash xabarini yuboradi.
4. Eski worker'lar tinglash soketlarini yopadi (yangi ulanish olmaydi) va **joriy mijozlarga xizmatni davom ettiradi**; hammasi tugagach — chiqadi.

### Jurnallarni almashtirish (`USR1`)

NG: avval jurnal fayllarini qayta nomlash, keyin master'ga `USR1`. Master barcha ochiq jurnal fayllarini qayta ochadi va ularning egasini worker'lar foydalanuvchisiga o'tkazadi, so'ng worker'larga ham qayta ochishni buyuradi. Eski fayllar deyarli darhol bo'shaydi — masalan, siqish uchun.

### Bajariladigan faylni "uchishda" yangilash (`USR2`)

NG: yangi binar faylni eskisining o'rniga qo'yib, master'ga `USR2`:

1. Master PID faylini `.oldbin` qo'shimchali nomga o'zgartiradi va **yangi binar faylni** ishga tushiradi — u o'z worker'larini ochadi. Eski va yangi worker'lar birga so'rov qabul qiladi.
2. Eski master'ga `WINCH` — uning worker'lari asta to'xtaydi; endi faqat yangilari ishlaydi. Eski master tinglash soketlarini yopmaydi — kerak bo'lsa, `HUP` bilan o'z worker'larini qayta ochib, **orqaga qaytish** mumkin.
3. Yangisi yaxshi ishlasa — eski master'ga `QUIT`.

### Control REST API

NA (Control NGINX Processes at Runtime): nginx 1.31.5 dan — **Control REST API**: worker jarayonlar haqida ma'lumot, xotiradagi konfiguratsiya, qayta yuklashni ishga tushirish (`/1/control/processes`, `/1/control/config`, `/1/nginx`). Standart o'chiq; `nginx -l unix:/tmp/nginx.sock` bilan yoqiladi, nginx `--with-control-api` bilan yig'ilgan bo'lishi kerak. NA: **hech qachon internetga ochmang** — UNIX soketda, fayl huquqlari bilan.

## Ko'rib chiqamiz

VPS'da (nginx 1.31.8, rasmiy paket).

### systemd servisi

```text vps
$ systemctl cat nginx | grep -E '^(Type|PIDFile|ExecStart|ExecReload|ExecStop)='
Type=forking
PIDFile=/run/nginx.pid
ExecStart=/usr/sbin/nginx -c ${CONFFILE} $cmdopts
ExecReload=/bin/sh -c "/bin/kill -s HUP $(/bin/cat /run/nginx.pid)"
ExecStop=/bin/sh -c "/bin/kill -s TERM $(/bin/cat /run/nginx.pid)"
```

`systemctl reload nginx` — master'ga `HUP`; `systemctl stop nginx` — `TERM` (tez to'xtatish). `Type=forking` va `PIDFile` — systemd master'ni PID fayl orqali kuzatadi.

### Uzun yuklab olish vaqtida qayta yuklash

Sinov uchun 8082-portda tezligi cheklangan server (`limit_rate 1m` — 1 MB/s) va 4 MB fayl:

```text vps
$ head -c 4194304 /dev/zero > /usr/share/nginx/html/katta.bin; printf '%s\n' 'server {' '    listen 8082;' '    root /usr/share/nginx/html;' '    limit_rate 1m;' '}' > /etc/nginx/conf.d/sekin.conf; nginx -t -q && nginx -s reload; sleep 1; ps -o pid=,ppid=,user=,cmd= -p $(cat /run/nginx.pid) --ppid $(cat /run/nginx.pid)
 172694       1 root     nginx: master process /usr/sbin/nginx -c /etc/nginx/nginx.conf
 173064  172694 nginx    nginx: worker process
$ (curl -s -o /dev/null -w 'yuklab olish: HTTP %{http_code}, %{size_download} bayt, %{time_total} s\n' http://127.0.0.1:8082/katta.bin) & sleep 1; nginx -s reload; sleep 0.5; ps -o pid=,ppid=,user=,cmd= -p $(cat /run/nginx.pid) --ppid $(cat /run/nginx.pid); wait; ps -o pid=,ppid=,user=,cmd= -p $(cat /run/nginx.pid) --ppid $(cat /run/nginx.pid)
 172694       1 root     nginx: master process /usr/sbin/nginx -c /etc/nginx/nginx.conf
 173064  172694 nginx    nginx: worker process is shutting down
 173075  172694 nginx    nginx: worker process
yuklab olish: HTTP 200, 4194304 bayt, 3.006185 s
 172694       1 root     nginx: master process /usr/sbin/nginx -c /etc/nginx/nginx.conf
 173075  172694 nginx    nginx: worker process
```

- Yuklab olish boshlandi, 1 soniyadan keyin `nginx -s reload`.
- Eski worker (173064) — **"is shutting down"**: yangi ulanish olmaydi, lekin yuklab olishni davom ettiryapti; yangi worker (173075) ishga tushdi.
- Yuklab olish **uzilmadi**: HTTP 200, to'liq 4 194 304 bayt, ~3 s. Tugagach eski worker chiqib ketdi.

### Xatoli konfiguratsiya bilan qayta yuklash

```text vps
$ echo 'server { listen 8083 }' > /etc/nginx/conf.d/xato.conf; nginx -s reload; echo "chiqish kodi: $?"; kill -HUP $(cat /run/nginx.pid); sleep 0.5; tail -n 3 /var/log/nginx/error.log | cut -d' ' -f3-; curl -s -o /dev/null -w 'sayt: HTTP %{http_code}\n' http://127.0.0.1/; rm /etc/nginx/conf.d/xato.conf
nginx: [emerg] unexpected "}" in /etc/nginx/conf.d/xato.conf:1
chiqish kodi: 1
[notice] 172694#172694: signal 1 (SIGHUP) received from 173056, reconfiguring
[notice] 172694#172694: reconfiguring
[emerg] 172694#172694: unexpected "}" in /etc/nginx/conf.d/xato.conf:1
sayt: HTTP 200
```

- `nginx -s reload` avval konfiguratsiyani tekshirdi, xato topdi va signal **yubormadi** (chiqish kodi 1).
- `kill -HUP` bilan to'g'ridan-to'g'ri yuborilganda master qayta yuklashga urindi (`reconfiguring`), xato topdi (`[emerg]`) va **eski konfiguratsiya bilan ishlashda davom etdi** — sayt 200 qaytaryapti.

### Jurnallarni almashtirish

```text vps
$ cd /var/log/nginx && mv access.log access.log.1 && curl -s -o /dev/null http://127.0.0.1/birinchi; ls -l /var/log/nginx | awk 'NR>1 {print $1, $3, $NF}'; nginx -s reopen; sleep 0.5; curl -s -o /dev/null http://127.0.0.1/ikkinchi; ls -l /var/log/nginx | awk 'NR>1 {print $1, $3, $NF}'; grep -c birinchi access.log.1; grep -c ikkinchi access.log
-rw-r--r-- nginx access.log.1
-rw-r----- nginx error.log
-rw-r--r-- nginx access.log
-rw-r--r-- nginx access.log.1
-rw-r----- nginx error.log
1
1
```

- `access.log` → `access.log.1` qayta nomlandi; keyingi so'rov (`/birinchi`) **eski faylga** (`.1`) yozildi — nginx fayl nomini emas, ochiq faylni ishlatadi; `access.log` yo'q.
- `nginx -s reopen` — yangi `access.log` yaratildi, egasi `nginx` (NG aytganidek); keyingi so'rov (`/ikkinchi`) yangi faylda.

### Binar faylni yangilash

Paketda `--with-control-api` ham bor:

```text vps
$ nginx -V 2>&1 | grep -c -- '--with-control-api'
1
```

Bir xil binar fayl bilan `USR2` jarayonini ko'ramiz:

```text vps
$ old=$(cat /run/nginx.pid); kill -USR2 $old; sleep 1; ls /run/nginx.pid*; ps -o pid=,ppid=,user=,cmd= -C nginx | grep -v 'daemon off' | grep -v ' 1 .*nginx -g'
/run/nginx.pid
/run/nginx.pid.oldbin
 104123  104023 redis    nginx: worker process
 172694       1 root     nginx: master process /usr/sbin/nginx -c /etc/nginx/nginx.conf
 173075  172694 nginx    nginx: worker process
 173104  172694 root     nginx: master process /usr/sbin/nginx -c /etc/nginx/nginx.conf
 173106  173104 nginx    nginx: worker process
$ kill -WINCH $old; sleep 1; ps -o pid=,ppid=,user=,cmd= -C nginx | grep -E "^ *$old |^ *[0-9]+ +$old " 
 172694       1 root     nginx: master process /usr/sbin/nginx -c /etc/nginx/nginx.conf
 173104  172694 root     nginx: master process /usr/sbin/nginx -c /etc/nginx/nginx.conf
$ kill -QUIT $old; sleep 1; ls /run/nginx.pid*; ps -o pid=,ppid=,user=,cmd= -p $(cat /run/nginx.pid) --ppid $(cat /run/nginx.pid); systemctl is-active nginx; curl -s -o /dev/null -w 'sayt: HTTP %{http_code}\n' http://127.0.0.1/
/run/nginx.pid
 173104       1 root     nginx: master process /usr/sbin/nginx -c /etc/nginx/nginx.conf
 173106  173104 nginx    nginx: worker process
active
sayt: HTTP 200
```

1. `USR2` → `nginx.pid.oldbin` paydo bo'ldi; ikkita master (172694 — eski, 173104 — yangi, eskisining bolasi) va har birining worker'i. (104123 — Docker konteyneridagi nginx, 2-bob.)
2. Eski master'ga `WINCH` — uning worker'i chiqdi, ikkala master qoldi.
3. Eski master'ga `QUIT` — faqat yangi master (endi uning ota-jarayoni — `1`) va uning worker'i; systemd servisi `active`, sayt ishlayapti.

```text vps
$ rm -f /etc/nginx/conf.d/sekin.conf /usr/share/nginx/html/katta.bin /var/log/nginx/access.log.1; systemctl restart nginx; systemctl is-active nginx
active
```

Sinov fayllari o'chirildi, nginx qayta ishga tushirildi.

## Variantlar

| Vazifa | Buyruq | Izoh |
| --- | --- | --- |
| Konfiguratsiyani qo'llash | `nginx -t && nginx -s reload` yoki `systemctl reload nginx` | Ulanishlar uzilmaydi |
| To'xtatish | `nginx -s quit` / `systemctl stop nginx` | `quit` — so'rovlarni tugatib; systemd unit'i — `TERM` (tez) |
| Jurnal almashtirish | Qayta nomlash + `nginx -s reopen` | Eski fayl darhol bo'shaydi (NG) |
| Versiya yangilash | `USR2` → `WINCH` → `QUIT` | To'xtovsiz; xato bo'lsa — eski master'ga `HUP` |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Konfiguratsiyani o'zgartirish uchun `restart` | Joriy ulanishlar uziladi | `reload` |
| `nginx -t` siz `kill -HUP` | Xato faqat jurnalda ko'rinadi (sinovda `[emerg]`), siz o'zgarish qo'llandi deb o'ylaysiz | `nginx -t`, keyin `reload`; jurnalni tekshirish |
| Jurnalni qayta nomlab, `reopen` qilmaslik | nginx eski faylga yozishda davom etadi (sinovda shunday) | `nginx -s reopen` (USR1) |
| `systemctl stop` ni "asta to'xtatish" deb o'ylash | Rasmiy unit `TERM` yuboradi | Kerak bo'lsa `nginx -s quit` |
| Control API'ni tarmoq portida ochish | NA: hech qachon internetga | UNIX soket |

## Amaliyot

1. `reload` paytida eski worker'lar nima qiladi?
2. Yangi konfiguratsiyada xato bo'lsa, `nginx -s reload` va `kill -HUP` qanday farq qildi?
3. Jurnalni qanday to'g'ri almashtirish kerak? Nega `reopen` siz ishlamaydi?
4. `USR2` dan keyin nechta master jarayon bo'ladi? `WINCH` nima qiladi?
5. Yangi binar fayl yomon ishlasa qanday orqaga qaytiladi?
6. Rasmiy systemd unit'ida `systemctl stop` qaysi signalni yuboradi?

<details>
<summary>Javoblar</summary>

1. Yangi ulanish qabul qilmaydi, joriy mijozlarga xizmatni tugatib, keyin chiqadi.
2. `nginx -s reload` avval tekshirib, xato bo'lsa signal yubormadi (kod 1); `kill -HUP` da master urindi, xatoni jurnalga yozdi va eski konfiguratsiyada qoldi.
3. Faylni qayta nomlash, keyin `nginx -s reopen`; nginx ochiq faylga yozadi, nom o'zgargani ta'sir qilmaydi.
4. Ikkita (eski va yangi); `WINCH` eski master worker'larini asta to'xtatadi.
5. Eski master'ga `HUP` — u worker'larini konfiguratsiyani qayta o'qimasdan ochadi; keyin yangi master to'xtatiladi.
6. `TERM` (tez to'xtatish).

</details>

## Rasmiy hujjat

- [NG: Controlling nginx](https://nginx.org/en/docs/control.html)
- [NG: Command-line parameters](https://nginx.org/en/docs/switches.html)
- [NA: Control NGINX Processes at Runtime](https://docs.nginx.com/nginx/admin-guide/basic-functionality/runtime-control/)
