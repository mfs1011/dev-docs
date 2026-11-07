# 35 — O'z servisingiz

[← Oldingi: systemctl](34-systemctl.md) · [Mundarija](README.md) · [Keyingi: Unit'ni o'zgartirish →](36-unitni-ozgartirish.md)

## Tushuncha

30-bobda ilovani `nohup` bilan ishga tushirmaslikni aytgandik: server qayta yonganda u qaytmaydi, yiqilsa hech kim qayta ishga tushirmaydi. To'g'ri yo'l — ilovani **systemd servisi** qilish:

| | `nohup ilova &` | systemd servisi |
| --- | --- | --- |
| Server yonganda | Ishga tushmaydi | `enable` qilingan bo'lsa, ishga tushadi |
| Yiqilsa | Yiqilganicha qoladi | `Restart=` bo'yicha qayta ishga tushadi |
| Qaysi foydalanuvchi | Siz (ko'pincha root) | `User=` da yozilgani |
| Chiqish (log) | `nohup.out` | Jurnal: `journalctl -u` (37-bob) |
| Sozlamalar | Terminalingiz muhiti | `Environment=` / `EnvironmentFile=` |

Servis — `/etc/systemd/system/` dagi bitta `.service` fayli (33-bob).

## Servis yozamiz

Trenajorda node.js ham, Python ham yo'q, shuning uchun "ilova" o'rnida kichik shell skript bo'ladi. U ishga tushganda o'z muhitini jurnalga yozadi va to'xtamay ishlaydi. Haqiqiy veb-ilova bilan VPS'dagi misol pastda.

### 1. Foydalanuvchi, papka, ilova

Ilova root nomidan emas, o'z tizim foydalanuvchisi nomidan ishlaydi (22-bob):

```text
$ adduser --system --group --no-create-home ilova
Adding system user `ilova' (UID 101) ...
Adding new group `ilova' (GID 107) ...
Adding new user `ilova' (UID 101) with group `ilova' ...
Not creating `/nonexistent'.
$ mkdir -p /opt/ilova
$ cat > /opt/ilova/ilova.sh <<'EOF'
> #!/bin/sh
> echo "ishga tushdim: PORT=$PORT MUHIT=$MUHIT foydalanuvchi=$(id -un) papka=$(pwd)"
> while true; do sleep 10; done
> EOF
$ chmod 755 /opt/ilova/ilova.sh
$ printf 'PORT=8080\n' > /etc/ilova.env
```

`/etc/ilova.env` — ilova sozlamalari alohida faylda. Maxfiy qiymatlar (parol, kalit) bo'lsa, faylga `chmod 600` qo'yiladi (7-bob).

### 2. Unit fayli

```text
$ cat > /etc/systemd/system/ilova.service <<'EOF'
> [Unit]
> Description=Ilova (sinov)
> After=network.target
> [Service]
> Type=exec
> User=ilova
> Group=ilova
> WorkingDirectory=/opt/ilova
> EnvironmentFile=/etc/ilova.env
> Environment=MUHIT=sinov
> ExecStart=/opt/ilova/ilova.sh
> Restart=on-failure
> [Install]
> WantedBy=multi-user.target
> EOF
```

| Qator | Ma'nosi (systemd.service(5), systemd.exec(5)) |
| --- | --- |
| `Description=` | `status` da ko'rinadigan nom |
| `After=network.target` | Tarmoq ishga tushgandan keyin |
| `Type=exec` | Dastur muvaffaqiyatli ishga tushgach, servis "ishga tushdi" deb hisoblanadi (pastda) |
| `User=`, `Group=` | Kim nomidan ishlaydi. Standart — root |
| `WorkingDirectory=` | Joriy papka. Berilmasa — `/` |
| `EnvironmentFile=` | O'zgaruvchilar fayldan. `-/yo'l` — fayl bo'lmasa xato bermaydi. Fayldagi qiymatlar `Environment=` dagidan ustun |
| `Environment=` | O'zgaruvchi to'g'ridan-to'g'ri unit'da |
| `ExecStart=` | Ishga tushiriladigan buyruq. To'liq yo'l tavsiya etiladi; faqat nom yozilsa, standart papkalardan (`/usr/bin` va h.k.) qidiriladi. Qobiq (shell) sintaksisi — `|`, `>`, `&&` — ishlamaydi |
| `Restart=on-failure` | Xato bilan tugasa yoki signal bilan o'ldirilsa, qayta ishga tushirish |
| `WantedBy=multi-user.target` | `enable` qilinganda server yonishida ishga tushish (34-bob) |

### 3. Ishga tushirish

```text
$ systemctl daemon-reload
$ systemctl enable --now ilova
Created symlink /etc/systemd/system/multi-user.target.wants/ilova.service → /etc/systemd/system/ilova.service.
$ sleep 1
$ systemctl status ilova --no-pager
● ilova.service - Ilova (sinov)
     Loaded: loaded (/etc/systemd/system/ilova.service; enabled; preset: enabled)
     Active: active (running) since Sat 2026-11-07 05:30:31 UTC; 1s ago
   Main PID: 279 (ilova.sh)
      Tasks: 2 (limit: 527)
     Memory: 276.0K
        CPU: 164ms
     CGroup: /system.slice/ilova.service
             ├─279 /bin/sh /opt/ilova/ilova.sh
             └─283 sleep 10

Nov 07 05:30:31 trenajor systemd[1]: Starting ilova.service - Ilova (sinov)...
Nov 07 05:30:31 trenajor systemd[1]: Started ilova.service - Ilova (sinov).
Nov 07 05:30:31 trenajor ilova.sh[279]: ishga tushdim: PORT=8080 MUHIT=sinov foydalanuvchi=il…/ilova
Hint: Some lines were ellipsized, use -l to show in full.
$ journalctl -u ilova --no-pager -o cat
Starting ilova.service - Ilova (sinov)...
Started ilova.service - Ilova (sinov).
ishga tushdim: PORT=8080 MUHIT=sinov foydalanuvchi=ilova papka=/opt/ilova
```

- `daemon-reload` — systemd yangi (yoki o'zgargan) unit faylini o'qisin.
- Ilova o'zi yozgan qatorda: `PORT=8080` (fayldan), `MUHIT=sinov` (unit'dan), foydalanuvchi `ilova`, papka `/opt/ilova`. Hammasi unit faylida aytilgandek.
- Ilovaning stdout'i jurnalga tushdi — hech qanday `nohup.out` yo'q.

## Yiqilsa: `Restart=`

Ilova kutilmaganda o'ldirilganini SIGKILL bilan "o'ynaymiz":

```text
$ systemctl show -p MainPID ilova
MainPID=279
$ kill -9 $(systemctl show -p MainPID --value ilova)
$ sleep 1
$ systemctl show -p MainPID ilova
MainPID=290
$ journalctl -u ilova --no-pager -o cat | tail -n 7
ilova.service: Main process exited, code=killed, status=9/KILL
ilova.service: Failed with result 'signal'.
ilova.service: Scheduled restart job, restart counter is at 1.
Stopped ilova.service - Ilova (sinov).
Starting ilova.service - Ilova (sinov)...
Started ilova.service - Ilova (sinov).
ishga tushdim: PORT=8080 MUHIT=sinov foydalanuvchi=ilova papka=/opt/ilova
```

- `Main process exited, code=killed, status=9/KILL` — ilova SIGKILL bilan o'ldi (29-bob).
- `Scheduled restart job, restart counter is at 1` — systemd uni qayta ishga tushirdi. `MainPID` yangi.
- systemd.service(5) ga ko'ra qayta ishga tushirishdan oldin standart holatda 100 ms kutiladi (`RestartSec=`).

systemd.service(5) dagi muhim qoida: jarayon systemd'ning **o'z** amali (`systemctl stop`, `restart`) natijasida to'xtasa, u qayta ishga tushirilmaydi:

```text
$ systemctl stop ilova
$ sleep 1
$ systemctl is-active ilova
inactive
```

`Restart=` qiymatlari (systemd.service(5)):

| Qiymat | Qachon qayta ishga tushiradi |
| --- | --- |
| `no` (standart) | Hech qachon |
| `on-failure` | Noldan farqli kod, signal (SIGHUP, SIGINT, SIGTERM, SIGPIPE dan tashqari), vaqt tugashi |
| `on-abnormal` | Signal yoki vaqt tugashi (kod bilan chiqishda emas) |
| `always` | Har doim, toza chiqishda ham |

`on-failure` da ilova o'zi `0` kodi bilan chiqsa, qayta ishga tushirilmaydi — ataylab to'xtash xatodan shunday ajratiladi.

## `Type=`: servis qachon "ishga tushdi"

systemd.service(5) dan asosiylari:

| Type | systemd servisni qachon "ishga tushdi" deb hisoblaydi |
| --- | --- |
| `simple` (standart) | Jarayon yaratilishi bilan — dastur haqiqatan ishga tushdimi, tekshirmaydi |
| `exec` | Dastur muvaffaqiyatli ishga tushgach (`execve`, 28-bob) |
| `notify` | Ilova o'zi "tayyorman" deb xabar bergach (`sd_notify(3)`) |
| `oneshot` | Jarayon tugagach — bir martalik ishlar uchun (38-bob) |

`simple` va `exec` farqini systemd.service(5) aniq aytadi: `simple` da dastur ishga tusha olmasa ham (masalan, `User=` da yozilgan foydalanuvchi yo'q bo'lsa), `systemctl start` **muvaffaqiyat** qaytaradi. `exec` da esa xatoni darhol ko'rasiz. Mavjud bo'lmagan foydalanuvchi bilan sinaymiz:

```text
$ systemd-run --unit=t-simple -p Type=simple -p User=yoqfoydalanuvchi sleep 100; echo "kod: $?"
Running as unit: t-simple.service
kod: 0
$ systemd-run --unit=t-exec -p Type=exec -p User=yoqfoydalanuvchi sleep 100; echo "kod: $?"
Job for t-exec.service failed because the control process exited with error code.
See "systemctl status t-exec.service" and "journalctl -xeu t-exec.service" for details.
kod: 1
$ sleep 1
$ systemctl is-failed t-simple t-exec
failed
failed
```

`simple` "ishga tushdi" deb `0` qaytardi, lekin servis allaqachon yiqilgan. Deploy skriptida bunday "muvaffaqiyat" xatoni yashiradi. Shuning uchun yangi servislarda `Type=exec`.

## VPS'da: haqiqiy veb-ilova

VPS'da Python bor. Uning o'rnatilgan oddiy veb-serveri (`python3 -m http.server`) bilan sahifa beradigan servis yaratamiz:

```text vps
$ cat /etc/systemd/system/salom.service
[Unit]
Description=Salom veb-ilovasi (python http.server)
After=network.target
[Service]
Type=exec
User=salom
Group=salom
WorkingDirectory=/srv/salom
EnvironmentFile=/etc/salom.env
ExecStart=/usr/bin/python3 -m http.server ${PORT} --bind 127.0.0.1
Restart=on-failure
[Install]
WantedBy=multi-user.target
```

- `salom` — `adduser --system --group --no-create-home salom` bilan yaratilgan foydalanuvchi; `/srv/salom/index.html` — sahifa; `/etc/salom.env` da `PORT=8000`.
- `${PORT}` — systemd.service(5) ga ko'ra `ExecStart=` da o'zgaruvchini qo'yish mumkin: u qiymati bilan almashtiriladi.
- `--bind 127.0.0.1` — faqat serverning o'zidan ochiq (40-bob). Uni tashqariga chiqarish — Nginx qo'llanmasida.

```text vps
$ systemctl daemon-reload
$ systemctl enable --now salom
Created symlink '/etc/systemd/system/multi-user.target.wants/salom.service' → '/etc/systemd/system/salom.service'.
$ ps -o user,pid,cmd -p $(systemctl show -p MainPID --value salom)
USER         PID CMD
salom       1380 /usr/bin/python3 -m http.server 8000 --bind 127.0.0.1
```

`${PORT}` `8000` ga almashdi, jarayon `salom` nomidan ishlayapti. Yiqilish sinovi VPS'da ham bir xil:

```text vps
$ kill -9 $(systemctl show -p MainPID --value salom)
$ journalctl -u salom --no-pager -o cat | tail -n 6
Started salom.service - Salom veb-ilovasi (python http.server).
salom.service: Main process exited, code=killed, status=9/KILL
salom.service: Failed with result 'signal'.
salom.service: Scheduled restart job, restart counter is at 1.
Starting salom.service - Salom veb-ilovasi (python http.server).
Started salom.service - Salom veb-ilovasi (python http.server).
```

Qayta ishga tushgan ilova sahifani beryapti — yangi PID bilan:

```text vps
$ curl -s http://127.0.0.1:8000/
<h1>Salom, systemd!</h1>
$ ss -tlnp 'sport = :8000'
State  Recv-Q Send-Q Local Address:Port Peer Address:PortProcess                           
LISTEN 0      5          127.0.0.1:8000      0.0.0.0:*    users:(("python3",pid=1393,fd=3))
```

### "Ishga tushdi" ≠ "tayyor"

`Type=exec` uchun servis dastur ishga tushishi bilan "ishga tushdi" hisoblanadi. Ilova esa portni biroz keyin ochadi:

```text vps
$ systemctl restart salom; curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8000/; sleep 1; curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8000/
000
200
```

`restart` dan darhol keyin so'rov ulanmadi (`000`), bir soniyadan keyin — `200`. Deploy skriptida servisni qayta ishga tushirgandan keyin darhol "tekshiruv" so'rovi yuborsangiz, u shu sababli yiqilishi mumkin. Yechimlar: tekshiruvni bir necha marta qaytarish yoki ilova `sd_notify(3)` ni qo'llasa, `Type=notify` — shunda systemd ilova "tayyorman" deguncha kutadi.

<div data-animatsiya="qadamli" data-nom="servis"></div>

## Node.js va boshqalar

Unit fayli dasturlash tiliga bog'liq emas — faqat `ExecStart=` o'zgaradi. Masalan, Node.js ilovasi uchun `ExecStart=/usr/bin/node /srv/ilova/server.js`, Python virtual muhitidagi ilova uchun `ExecStart=/srv/ilova/.venv/bin/python app.py`. Dastur yo'lini `command -v node` bilan aniqlang. Standart papkalardan tashqarida (masalan, foydalanuvchining uy papkasida) o'rnatilgan dastur faqat to'liq yo'l bilan topiladi.

## Debian va Ubuntu

| | Debian 12 (trenajor) | Ubuntu 26.04 (VPS) |
| --- | --- | --- |
| systemd | 252 | 259 |
| Python | Yo'q | 3 (`/usr/bin/python3`) |
| `/etc/systemd/system/` dagi servislar | Bir xil ishlaydi | Bir xil ishlaydi |

## Tipik xatolar

**1. `ExecStart=` da qobiq (shell) sintaksisi.**
`ExecStart=cd /srv/ilova && node server.js > log` ishlamaydi: systemd.service(5) ga ko'ra `&&`, `|`, `>` kabi qobiq imkoniyatlari qo'llab-quvvatlanmaydi.
To'g'risi: `WorkingDirectory=` va to'liq yo'l; chiqish o'zi jurnalga tushadi.

**2. Unit faylini o'zgartirib, `daemon-reload` ni unutish.**
systemd eski nusxa bilan ishlayveradi.
To'g'risi: `systemctl daemon-reload && systemctl restart ilova`.

**3. Ilovani root nomidan ishga tushirish.**
To'g'risi: `User=` bilan alohida tizim foydalanuvchisi.

**4. `Type=simple` va "muvaffaqiyatli" deploy.**
Dastur ishga tushmasa ham `systemctl start` muvaffaqiyat qaytaradi.
To'g'risi: `Type=exec` va deploy'dan keyin `systemctl is-active`.

**5. `Restart=` sababni yashiradi, deb o'ylamaslik.**
Ilova darhol yiqilaversa, systemd uni cheksiz qayta ishga tushirmaydi: systemd-system.conf(5) ga ko'ra standart holatda 10 soniya ichida 5 martadan ko'p ishga tushirilmaydi (`StartLimitIntervalSec=`, `StartLimitBurst=`, systemd.unit(5)). Servis `failed` holatida qoladi.
To'g'risi: sababni jurnaldan qidirish (37-bob).

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=35-servis)** "Ilovani servis qilish": unit fayl yozasiz, ishga tushirasiz, yonishga qo'shasiz va yiqilganda o'zi tiklanishini tekshirasiz.

Savollar:

1. Ilovani `nohup` emas, servis qilishning uchta afzalligini ayting.
2. Unit faylini o'zgartirdingiz. Qaysi ikki buyruq kerak?
3. `Restart=on-failure` bilan servisni `systemctl stop` qilsangiz, u qayta ishga tushadimi?
4. `Type=simple` da `systemctl start` muvaffaqiyatli bo'ldi. Bu ilova ishlayapti degani mi?
5. Maxfiy sozlamalarni qayerda saqlaysiz?

<details>
<summary>Javoblar</summary>

1. Yonishda ishga tushadi, yiqilsa qayta ishga tushadi, alohida foydalanuvchi nomidan ishlaydi, chiqishi jurnalda.
2. `systemctl daemon-reload` va `systemctl restart servis`.
3. Yo'q: systemd'ning o'z amali bilan to'xtagan jarayon qayta ishga tushirilmaydi.
4. Yo'q: `simple` dastur haqiqatan ishga tushganini tekshirmaydi. `systemctl is-active` va jurnalni ko'ring, yoki `Type=exec`.
5. `EnvironmentFile=` dagi faylda, `chmod 600` bilan.

</details>

## Rasmiy hujjat

- [systemd.service(5)](https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html) — `Type=`, `ExecStart=`, `Restart=`, `RestartSec=`
- [systemd.exec(5)](https://www.freedesktop.org/software/systemd/man/latest/systemd.exec.html) — `User=`, `WorkingDirectory=`, `Environment=`, `EnvironmentFile=`
- [sd_notify(3)](https://www.freedesktop.org/software/systemd/man/latest/sd_notify.html)
- Trenajorda: `man systemd.service`, `man systemd.exec`
