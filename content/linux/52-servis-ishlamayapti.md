# 52 — Servis ishlamayapti

[← Oldingi: Amaliy: zaxira skripti](51-zaxira-skripti.md) · [Mundarija](README.md)

> ⚑ Bu qismdagi tekshiruv **tartibi** rasmiy hujjatlarda bitta joyda yozilmagan. Har buyruq rasmiy manbadan olingan, ketma-ketlik esa trenajor va VPS'da sinalgan amaliyot.

## Tushuncha

"Sayt ochilmayapti", "API javob bermayapti" — serverdagi eng ko'p uchraydigan muammo. Sabablari ko'p, lekin ularni topish tartibi deyarli doim bir xil: avval systemd nima deyotganini, keyin dasturning o'zi nima deyotganini o'qiymiz va har qadamda bitta gumonni tekshiramiz.

| # | Savol | Buyruq | Qaysi bobda |
| --- | --- | --- | --- |
| 1 | Servis qaysi holatda? Qanday kod bilan tugagan? | `systemctl status NOM` | 34 |
| 2 | Dastur nima deb yozib qoldirgan? | `journalctl -u NOM -n 20` | 37 |
| 3 | Port tinglanayaptimi? Kim tinglayapti? | `ss -tlnp` | 32 |
| 4 | Dastur fayllariga yeta oladimi? | `ls -l`, unit'dagi `User=` | 7, 35 |
| 5 | Sozlama to'g'rimi? | `systemd-analyze verify`, dasturning o'z tekshiruvi (`sshd -t`) | 33 |

Bu bobda trenajorda kichik servis yasaymiz, uni beshta usulda ataylab buzamiz va har safar sababni shu tartibda topamiz.

## Sinov servisi

Servis 8080-portni tinglaydi va har ulanishga `salom` deb javob beradi. Portni 32-bobdagidek `systemd-socket-activate` ochadi. Ishga tushirish skripti avval sozlama faylini o'qiydi:

```text
$ adduser --system --group --no-create-home ilova >/dev/null
$ mkdir -p /opt/ilova
$ cat > /opt/ilova/ishga.sh <<'EOF'
> #!/bin/sh
> set -eu
> . /etc/ilova.conf
> echo "port: $PORT"
> exec systemd-socket-activate -l "$PORT" -a --inetd /opt/ilova/javob.sh
> EOF
$ printf '%s\n' '#!/bin/sh' 'echo salom' > /opt/ilova/javob.sh
$ chmod 755 /opt/ilova/ishga.sh /opt/ilova/javob.sh
$ echo 'PORT=8080' > /etc/ilova.conf
$ cat > /etc/systemd/system/ilova.service <<'EOF'
> [Unit]
> Description=Sinov ilovasi
> 
> [Service]
> User=ilova
> ExecStart=/opt/ilova/ishga.sh
> EOF
$ systemctl daemon-reload
$ systemctl start ilova
```

- `. /etc/ilova.conf` — faylni joriy qobiqda o'qish: undagi `PORT=8080` o'zgaruvchiga aylanadi.
- `exec` — qobiq o'rniga `systemd-socket-activate` ishlaydi (28-bob), servisning asosiy jarayoni shu bo'ladi.
- `User=ilova` — servis root emas, alohida tizim foydalanuvchisi nomidan ishlaydi (35-bob).

Sog'lom holat — keyin buzilganini shu bilan solishtiramiz:

```text
$ systemctl status ilova --no-pager
● ilova.service - Sinov ilovasi
     Loaded: loaded (/etc/systemd/system/ilova.service; static)
     Active: active (running) since Sat 2026-11-07 16:46:40 UTC; 424ms ago
   Main PID: 211 (systemd-socket-)
      Tasks: 1 (limit: 527)
     Memory: 804.0K
        CPU: 74ms
     CGroup: /system.slice/ilova.service
             └─211 systemd-socket-activate -l 8080 -a --inetd /opt/ilova/javob.sh

Nov 07 16:46:40 trenajor systemd[1]: Started ilova.service - Sinov ilovasi.
Nov 07 16:46:40 trenajor ishga.sh[211]: port: 8080
Nov 07 16:46:40 trenajor ishga.sh[211]: Listening on [::]:8080 as 3.
$ exec 3<>/dev/tcp/127.0.0.1/8080; cat <&3; exec 3<&-
salom
$ ss -tlnp | grep 8080
LISTEN 0      0                  *:8080            *:*    users:(("systemd-socket-",pid=211,fd=3))
```

- `Active: active (running)` va pastdagi jurnal qatorlari: `port: 8080` — skriptning o'z xabari.
- `/dev/tcp` — bash orqali portga qo'lda ulanish (32-bob). Debian Reference (6.7) ham servisni tekshirishning birinchi usuli sifatida unga qo'lda ulanishni (`telnet`) beradi.
- `ss` — 8080-portni aynan bizning servis tinglayapti.

## 1. Fayl topilmadi

Unit faylidagi yo'lda harf xato:

```text
$ sed -i 's|ishga.sh|isga.sh|' /etc/systemd/system/ilova.service
$ systemctl daemon-reload
$ systemctl restart ilova; echo "kod: $?"
kod: 0
$ systemctl status ilova --no-pager -n 0
× ilova.service - Sinov ilovasi
     Loaded: loaded (/etc/systemd/system/ilova.service; static)
     Active: failed (Result: exit-code) since Sat 2026-11-07 16:46:44 UTC; 280ms ago
   Duration: 64ms
    Process: 237 ExecStart=/opt/ilova/isga.sh (code=exited, status=203/EXEC)
   Main PID: 237 (code=exited, status=203/EXEC)
        CPU: 6ms
```

Birinchi tuzoq: `restart` **muvaffaqiyat** (`kod: 0`) qaytardi, servis esa yiqilgan. 35-bobda ko'rganimizdek, standart `Type=simple` da systemd jarayon yaratilishi bilan "ishga tushdi" deydi. Shuning uchun buyruq kodiga emas, `status` ga qarash kerak.

`status` ni o'qish (`-n 0` — pastdagi jurnal qatorlarisiz, ular keyingi qadamda):

- `Active: failed (Result: exit-code)` — jarayon xato kodi bilan tugagan.
- `status=203/EXEC` — systemd.exec(5) jadvali: `203` (`EXIT_EXEC`) — jarayonni ishga tushirib bo'lmadi, "ko'pincha bajariladigan fayl yo'q yoki unga kirish imkoni yo'q".

Aniq sabab — jurnalda:

```text
$ journalctl -u ilova -n 4 --no-pager -o cat
ilova.service: Failed to locate executable /opt/ilova/isga.sh: No such file or directory
ilova.service: Failed at step EXEC spawning /opt/ilova/isga.sh: No such file or directory
ilova.service: Main process exited, code=exited, status=203/EXEC
ilova.service: Failed with result 'exit-code'.
```

`-o cat` — faqat xabar matni, vaqt va xost nomisiz (37-bob). `No such file or directory` — `/opt/ilova/isga.sh` yo'q. Tuzatamiz:

```text
$ sed -i 's|isga.sh|ishga.sh|' /etc/systemd/system/ilova.service
$ systemctl daemon-reload
```

## 2. Bajarish ruxsati yo'q

```text
$ chmod 644 /opt/ilova/ishga.sh
$ systemctl restart ilova
$ systemctl status ilova --no-pager | grep -E 'Active|Process'
     Active: failed (Result: exit-code) since Sat 2026-11-07 16:46:47 UTC; 260ms ago
    Process: 259 ExecStart=/opt/ilova/ishga.sh (code=exited, status=203/EXEC)
$ journalctl -u ilova -n 3 --no-pager -o cat
ilova.service: Failed at step EXEC spawning /opt/ilova/ishga.sh: Permission denied
ilova.service: Main process exited, code=exited, status=203/EXEC
ilova.service: Failed with result 'exit-code'.
```

Kod yana `203/EXEC`, lekin jurnalda boshqa sabab: `Permission denied`. Fayl bor, lekin unda `x` ruxsati yo'q (48-bob). Kod bir xil — shuning uchun jurnalni o'qish shart.

```text
$ ls -l /opt/ilova/ishga.sh
-rw-r--r-- 1 root root 126 Nov  7 16:46 /opt/ilova/ishga.sh
$ chmod 755 /opt/ilova/ishga.sh
```

## 3. Servis faylni o'qiy olmaydi

Sozlama fayliga faqat root o'qiy oladigan ruxsat beramiz. Bunday xatoni ko'pincha "maxfiy ma'lumot bor" deb faylni yopib qo'yganda qilishadi:

```text
$ chmod 600 /etc/ilova.conf
$ systemctl restart ilova
$ systemctl status ilova --no-pager | grep -E 'Active|Process'
     Active: failed (Result: exit-code) since Sat 2026-11-07 16:46:47 UTC; 120ms ago
    Process: 268 ExecStart=/opt/ilova/ishga.sh (code=exited, status=2)
$ journalctl -u ilova -n 3 --no-pager -o cat
/opt/ilova/ishga.sh: 3: .: cannot open /etc/ilova.conf: Permission denied
ilova.service: Main process exited, code=exited, status=2/INVALIDARGUMENT
ilova.service: Failed with result 'exit-code'.
```

- Endi `status=2` — bu systemd kodi emas, skriptning o'z kodi: dash `.` faylni ocha olmadi (`Permission denied`) va chiqdi. Jurnaldagi `2/INVALIDARGUMENT` — systemd kod 2 ga beradigan umumiy nom, u bu yerda hech narsani anglatmaydi; muhimi — skriptning xabari.
- Sabab: servis `User=ilova` nomidan ishlaydi, fayl esa `root`, `-rw-------`.

Kim nomidan ishlashini va ruxsatni yonma-yon ko'ramiz:

```text
$ systemctl show ilova -p User
User=ilova
$ ls -l /etc/ilova.conf
-rw------- 1 root root 10 Nov  7 16:46 /etc/ilova.conf
$ chmod 644 /etc/ilova.conf
```

Haqiqatan maxfiy fayl bo'lsa, uni hammaga ochmasdan, guruh orqali berish to'g'riroq: `chown root:ilova` va `chmod 640` (7-bob).

## 4. Sozlama faylida xato

```text
$ echo 'PORT = 8080' > /etc/ilova.conf
$ systemctl restart ilova
$ journalctl -u ilova -n 3 --no-pager -o cat
/opt/ilova/ishga.sh: 1: /etc/ilova.conf: PORT: not found
ilova.service: Main process exited, code=exited, status=127/n/a
ilova.service: Failed with result 'exit-code'.
```

Qobiqda `=` atrofida bo'sh joy bo'lmaydi (13-bob): `PORT = 8080` — `PORT` degan **buyruq** bo'lib qoldi. Kod `127` — "buyruq topilmadi" (50-bob).

Haqiqiy dasturlarda sozlama sintaksisini oldindan tekshiradigan buyruq bo'ladi. Masalan, OpenSSH serverida — `sshd -t` (pastda, VPS'da). Sozlamani o'zgartirgandan keyin servisni qayta ishga tushirishdan **oldin** tekshirish kerak.

```text
$ echo 'PORT=8080' > /etc/ilova.conf
```

## 5. Port band

Boshqa dastur 8080-portni egallab olgan:

```text
$ systemd-socket-activate -l 8080 cat >/dev/null 2>&1 &
[1] 280
$ systemctl restart ilova
$ journalctl -u ilova -n 3 --no-pager -o cat
Failed to open '8080': Address already in use
ilova.service: Main process exited, code=exited, status=1/FAILURE
ilova.service: Failed with result 'exit-code'.
$ ss -tlnp | grep 8080
LISTEN 0      0                  *:8080            *:*    users:(("systemd-socket-",pid=280,fd=3))
```

`Address already in use` (32-bob). `ss -p` portni kim egallaganini ko'rsatadi: jarayon raqami (PID) bizning servisniki emas. Uni to'xtatib, servisni qayta ishga tushiramiz:

```text
$ kill %1
$ systemctl restart ilova
[1]+  Terminated              systemd-socket-activate -l 8080 cat > /dev/null 2>&1
$ systemctl is-active ilova
active
```

## 6. Unit faylida xato

```text
$ sed -i 's/^ExecStart=/ExecStrat=/' /etc/systemd/system/ilova.service
$ systemctl daemon-reload
$ systemctl restart ilova; echo "kod: $?"
Failed to restart ilova.service: Unit ilova.service has a bad unit file setting.
See system logs and 'systemctl status ilova.service' for details.
kod: 1
$ systemctl status ilova --no-pager | grep Loaded
     Loaded: bad-setting (Reason: Unit ilova.service has a bad unit file setting.)
$ systemd-analyze verify /etc/systemd/system/ilova.service
/etc/systemd/system/ilova.service:6: Unknown key 'ExecStrat' in section [Service], ignoring.
ilova.service: Service has no ExecStart=, ExecStop=, or SuccessAction=. Refusing.
Unit ilova.service has a bad unit file setting.
```

- Bu safar `restart` ning o'zi xato berdi: systemd unit'ni umuman yuklay olmadi, `Loaded: bad-setting`.
- `systemd-analyze verify` — systemd-analyze(1) bo'yicha unit fayllarini yuklab, xatolarni ko'rsatadi: noma'lum bo'lim va kalitlar, topilmagan buyruqlar va boshqalar. Xato qatorning raqami bilan: `ilova.service:6: Unknown key 'ExecStrat'`.

Unit faylini o'zgartirgandan keyin `daemon-reload` dan oldin `verify` qilish odat bo'lsin.

<div data-animatsiya="qadamli" data-nom="servis"></div>

Tozalash:

```text
$ systemctl stop ilova
$ rm /etc/systemd/system/ilova.service /etc/ilova.conf
$ rm -r /opt/ilova
$ systemctl daemon-reload
$ systemctl reset-failed
$ userdel ilova
```

## VPS'da

Serverga kirganda birinchi qadam — xato bilan to'xtagan unit'lar bormi (34-bob):

```text vps
$ systemctl list-units --failed --no-pager
  UNIT LOAD ACTIVE SUB DESCRIPTION

0 loaded units listed.
```

Hozir xato bilan to'xtagan unit yo'q.

OpenSSH serverining sozlamasini tekshirish. sshd(8): `-t` — test rejimi, faqat sozlama fayli va kalitlarning to'g'riligini tekshiradi; `-f` — boshqa sozlama faylini berish. Haqiqiy sozlamaga tegmaslik uchun uning nusxasini buzamiz:

```text vps
$ sshd -t; echo "kod: $?"
kod: 0
$ cp /etc/ssh/sshd_config /tmp/sshd_sinov
$ echo "PermitRootLogn no" >> /tmp/sshd_sinov
$ sshd -t -f /tmp/sshd_sinov; echo "kod: $?"
/tmp/sshd_sinov: line 146: Bad configuration option: PermitRootLogn
/tmp/sshd_sinov: terminating, 1 bad configuration options
kod: 255
$ rm /tmp/sshd_sinov
```

Muammo bo'lmasa `sshd -t` hech narsa chiqarmaydi va `0` qaytaradi. Xato bo'lsa — fayl, qator raqami, sabab va `255` kodi. SSH sozlamasini o'zgartirgandan keyin `systemctl reload ssh` dan **oldin** `sshd -t` qilish shart: buzuq sozlama bilan serverga kira olmay qolish mumkin (45-bob).

## Debian va Ubuntu

| | Debian 12 (trenajor) | Ubuntu 26.04 (VPS) |
| --- | --- | --- |
| systemd | 252 | 259 |
| `status=203/EXEC` va jurnal xabarlari | bir xil | bir xil |
| SSH servisi nomi | `ssh` | `ssh` (socket activation, 32-bob) |

## Tipik xatolar

**1. `systemctl restart` xato bermadi — demak ishlayapti, deb o'ylash.**
`Type=simple` da `restart` jarayon yaratilishi bilan qaytadi.
To'g'risi: `systemctl status` yoki `systemctl is-active`.

**2. Faqat `status` dagi kodga qarash.**
`203/EXEC` — fayl yo'q ham, ruxsat yo'q ham.
To'g'risi: `journalctl -u NOM` dagi xabar.

**3. Servisni root nomidan sinab, "ishlayapti" deyish.**
Servis `User=` nomidan ishlaydi, ruxsatlar boshqacha.
To'g'risi: `systemctl show NOM -p User`, fayllar ruxsatini shu foydalanuvchi uchun tekshirish (yoki `sudo -u NOM`, 23-bob).

**4. Sozlamani tekshirmasdan qayta ishga tushirish.**
Servis yiqiladi — SSH bo'lsa, serverga kira olmay qolasiz.
To'g'risi: `systemd-analyze verify`, `sshd -t` va dasturning o'z tekshiruvi.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=52-servis)** "Servis ishlamayapti": `ilova` servisi ishlamayapti. Sababni `status` va jurnaldan topib, tuzatasiz — keyin yana bittasi.

Savollar:

1. `systemctl restart` `0` qaytardi, lekin sayt ochilmayapti. Nimani tekshirasiz?
2. `status=203/EXEC` ko'rdingiz. Qanday ikki sabab bo'lishi mumkin va qayerdan aniqlaysiz?
3. Jurnalda `Address already in use`. Kim aybdorligini qanday topasiz?
4. Servis root bilan qo'lda ishga tushganda ishlaydi, systemd orqali — `Permission denied`. Nega?
5. Unit faylini o'zgartirdingiz. `daemon-reload` dan oldin nima qilasiz?

<details>
<summary>Javoblar</summary>

1. `systemctl status` (yoki `is-active`) va `journalctl -u`.
2. Fayl yo'q yoki bajarish ruxsati yo'q (systemd.exec(5): bajariladigan fayl yo'q yoki unga kirib bo'lmaydi); aniq sabab — `journalctl -u` da.
3. `ss -tlnp | grep PORT` — `users:` qismida jarayon nomi va PID.
4. Servis `User=` dagi foydalanuvchi nomidan ishlaydi, unda fayllarga ruxsat yo'q.
5. `systemd-analyze verify FAYL`.

</details>

## Rasmiy hujjat

- [Debian Reference 6.7](https://www.debian.org/doc/manuals/debian-reference/ch06.en.html#_the_diagnosis_of_the_system_daemons) — servisga qo'lda ulanib tekshirish
- [systemctl(1)](https://www.freedesktop.org/software/systemd/man/latest/systemctl.html) — `status`, `is-active`, `show`, `--failed`
- [journalctl(1)](https://www.freedesktop.org/software/systemd/man/latest/journalctl.html) — `-u`, `-n`, `-o cat`
- [systemd.exec(5): Process Exit Codes](https://www.freedesktop.org/software/systemd/man/latest/systemd.exec.html#Process%20Exit%20Codes) — `203/EXEC` va boshqalar
- [systemd-analyze(1)](https://www.freedesktop.org/software/systemd/man/latest/systemd-analyze.html) — `verify`
- [sshd(8)](https://man.openbsd.org/sshd) — `-t`, `-f`
