# 29 — Signallar

[← Oldingi: Jarayon nima](28-jarayon.md) · [Mundarija](README.md) · [Keyingi: Fon rejimi →](30-fon-rejimi.md)

## Tushuncha

Ishlab turgan jarayonga "to'xta", "to'xtab tur", "davom et" deyish kerak bo'ladi. Buning yo'li — **signal**: jarayonga yuboriladigan raqamli xabar. Signalni boshqa jarayon (masalan, siz `kill` buyrug'i bilan), terminal (Ctrl+C) yoki yadro yuboradi.

signal(7) ga ko'ra har bir signalning **standart harakati** (default disposition) bor:

| Harakat | Ma'nosi |
| --- | --- |
| Term | Jarayonni tugatish |
| Ign | E'tiborsiz qoldirish |
| Core | Tugatish va xotira nusxasini (core dump) yozish |
| Stop | To'xtatib turish (muzlatish) |
| Cont | To'xtatilgan bo'lsa, davom ettirish |

Jarayon bu harakatni o'zgartira oladi: signalni e'tiborsiz qoldirishi yoki **ushlab** (catch), o'z ishlovchisini (signal handler) ishga tushirishi mumkin. Ilovaning "to'xtashdan oldin ishini tugatib chiqishi" (graceful shutdown) shunga asoslanadi.

Signallar ro'yxati:

```text
$ kill -l | head -n 2
 1) SIGHUP	 2) SIGINT	 3) SIGQUIT	 4) SIGILL	 5) SIGTRAP
 6) SIGABRT	 7) SIGBUS	 8) SIGFPE	 9) SIGKILL	10) SIGUSR1
$ kill -l TERM; kill -l KILL; kill -l HUP; kill -l INT
15
9
1
2
```

Eng ko'p ishlatiladiganlari (signal(7) jadvali va Debian Reference 9.4.12):

| Raqam | Nom | Harakat | Qachon |
| --- | --- | --- | --- |
| 1 | `SIGHUP` | Term | Boshqaruvchi terminal uzildi (hangup) |
| 2 | `SIGINT` | Term | Klaviaturadan uzish: Ctrl+C |
| 3 | `SIGQUIT` | Core | Klaviaturadan chiqish: Ctrl+\ |
| 9 | `SIGKILL` | Term | Majburiy to'xtatish |
| 15 | `SIGTERM` | Term | To'xtatish so'rovi — `kill` ning standart signali |
| 10 | `SIGUSR1` | Term | Ma'nosini dasturning o'zi belgilaydi |
| 17 | `SIGCHLD` | Ign | Bola jarayon to'xtadi yoki tugadi |
| 18 | `SIGCONT` | Cont | To'xtatilgan jarayonni davom ettirish |
| 19 | `SIGSTOP` | Stop | To'xtatib turish |
| 20 | `SIGTSTP` | Stop | Terminaldan to'xtatish: Ctrl+Z (30-bob) |

signal(7) dagi eng muhim qoida: **`SIGKILL` va `SIGSTOP` ni ushlab, bloklab yoki e'tiborsiz qoldirib bo'lmaydi.**

> Raqamlar arxitekturaga bog'liq. signal(7) jadvaliga ko'ra 1, 2, 3, 9, 15 hamma joyda bir xil, `SIGUSR1`, `SIGCHLD`, `SIGCONT`, `SIGSTOP`, `SIGTSTP` esa, masalan, Alpha, SPARC va MIPS'da boshqacha. Yuqoridagi qiymatlar — x86 va ARM uchun (trenajor ham, VPS ham x86). Skriptlarda raqam emas, **nom** yozing: `kill -TERM`, `kill -USR1`.

## `kill`: signal yuborish

Nomi "o'ldirish" bo'lsa ham, `kill` istalgan signalni yuboradi. U ikki xil bo'ladi:

```text
$ type -a kill
kill is a shell builtin
kill is /usr/bin/kill
kill is /bin/kill
$ help kill | head -n 6
kill: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ... or kill -l [sigspec]
    Send a signal to a job.
    
    Send the processes identified by PID or JOBSPEC the signal named by
    SIGSPEC or SIGNUM.  If neither SIGSPEC nor SIGNUM is present, then
    SIGTERM is assumed.
```

- bash'ning ichki buyrug'i (builtin) — terminalda aynan shu ishlaydi;
- `/usr/bin/kill` — procps paketidagi alohida dastur.

`help kill` ga ko'ra signal ko'rsatilmasa, **`SIGTERM`** yuboriladi:

```text
$ sleep 300 &
[1] 181
$ kill $!
$ sleep 1
[1]+  Terminated              sleep 300
$ sleep 300 &
[1] 183
$ kill -KILL $!
$ sleep 1
[1]+  Killed                  sleep 300
```

`$!` — oxirgi fon jarayonining PID'i (13-bob). Signal nom (`-TERM`, `-KILL`, `-HUP`) yoki raqam (`-15`, `-9`, `-1`) bilan beriladi. bash fon ishining qanday tugaganini yozadi: `Terminated` (SIGTERM) yoki `Killed` (SIGKILL).

## Nom bo'yicha: `pgrep` va `pkill`

PID'ni qidirib o'tirmaslik uchun procps paketida `pgrep` (qidirish) va `pkill` (nom bo'yicha signal yuborish) bor:

```text
$ sleep 300 &
[1] 185
$ sleep 301 &
[2] 186
$ pgrep -a sleep
185 sleep 300
186 sleep 301
$ pkill -f 'sleep 300'
[1]-  Terminated              sleep 300
$ sleep 1
$ pgrep -a sleep
186 sleep 301
$ pkill -x sleep
[2]+  Terminated              sleep 301
$ sleep 1
$ pgrep -a sleep || echo "sleep qolmadi"
sleep qolmadi
```

| Bayroq | Ma'nosi |
| --- | --- |
| `-a` | PID bilan birga to'liq buyruq qatori |
| `-x` | Jarayon nomi **aynan** mos kelishi kerak |
| `-f` | Faqat nomdan emas, **butun buyruq qatoridan** qidirish |
| `-u ali` | Faqat `ali` ning jarayonlari |

### `pkill -f` xavfi

`-f` buyruq qatorining istalgan joyidagi moslikni oladi. Qidiruv so'zi qisqa bo'lsa, kutilmagan jarayonlar ham tushadi. VPS'da `sh` so'zini qidiramiz:

```text vps
$ pgrep -a -f sh
7 [kworker/R-slub_flushwq]
731 /bin/sh /usr/lib/systemd/scripts/chronyd-starter.sh -n -F 1
987 /usr/bin/python3 /usr/share/unattended-upgrades/unattended-upgrade-shutdown --wait-for-signal
1135 sshd-session: root [priv]
1175 sshd-session: root@pts/0
1176 -bash
30495 sshd: /usr/sbin/sshd -D [listener] 1 of 10-100 startups
```

`pkill -f sh` bularning hammasiga SIGTERM yuboradi. Ular orasida `sshd` ning asosiy jarayoni (`[listener]`) bor: u to'xtasa, serverga **yangi SSH ulanish** qilib bo'lmaydi.

O'zingizning qobig'ingiz (shell) esa omon qoladi. bash qo'llanmasiga ko'ra interaktiv bash, `trap` o'rnatilmagan bo'lsa, SIGTERM'ni e'tiborsiz qoldiradi. Trenajorda tekshiramiz:

```text
$ kill -TERM $$; echo "qobiq hali tirik: $$"
qobiq hali tirik: 167
$ sh -c 'sleep 1000' &
[1] 194
$ pgrep -a -f sh
5 [slub_flushwq]
58 [zswap-shrink]
167 -bash
194 sh -c sleep 1000
$ pkill -f sh; sleep 1
[1]+  Terminated              sh -c 'sleep 1000'
$ pgrep -a -f sh
5 [slub_flushwq]
58 [zswap-shrink]
167 -bash
```

`sh -c 'sleep 1000'` to'xtadi, `-bash` qoldi. Kvadrat qavsdagilar yadro oqimlari (28-bob) — ular ham ro'yxatga tushdi, lekin signal ularga ta'sir qilmadi.

Qoida: **avval `pgrep -a -f ...` bilan nima tushishini ko'ring**, keyin aynan o'sha so'z bilan `pkill`. Imkon bo'lsa — `-x` yoki PID.

## SIGTERM va SIGKILL

| | SIGTERM (15) | SIGKILL (9) |
| --- | --- | --- |
| Ma'nosi | "Iltimos, to'xta" | Majburiy to'xtatish |
| Ilova ushlay oladimi | Ha: ishlovchi ishga tushadi, ilova ishini tugatib chiqadi | Yo'q (signal(7)) |
| Ilova ushlamasa | Standart harakat — Term: darhol tugaydi | — |

Trenajorda ikkalasini bir xil skriptda sinaymiz. Skript ishga tushganda PID faylini yozadi. `trap` (50-bob) bilan SIGTERM kelganda "tozalayapman" deb, faylni o'chirib chiqadi:

```text
$ printf '#!/bin/sh\ntrap "echo tozalayapman; rm -f /tmp/app.pid; exit 0" TERM\necho $$ > /tmp/app.pid\nwhile true; do sleep 1; done\n' > /tmp/app.sh
$ chmod +x /tmp/app.sh
$ /tmp/app.sh &
[1] 201
$ sleep 1
$ cat /tmp/app.pid
201
$ kill -TERM $!
$ sleep 1
tozalayapman
[1]+  Done                    /tmp/app.sh
$ ls /tmp/app.pid 2>/dev/null || echo "fayl o'chirildi: tozalash ishladi"
fayl o'chirildi: tozalash ishladi
```

Endi xuddi shu skriptga SIGKILL:

```text
$ /tmp/app.sh &
[1] 209
$ sleep 1
$ kill -KILL $!
$ sleep 1
[1]+  Killed                  /tmp/app.sh
$ ls /tmp/app.pid 2>/dev/null && echo "fayl qoldi: tozalash ishlamadi"
/tmp/app.pid
fayl qoldi: tozalash ishlamadi
```

SIGKILL ilovaga hech qanday imkon bermadi: `trap` bajarilmadi, PID fayli diskda qoldi. Haqiqiy ilovada bu tugallanmagan yozuv, yopilmagan ulanish yoki "ilova allaqachon ishlayapti" deb xato beradigan eski PID fayli bo'lishi mumkin.

Bosqichma-bosqich:

<div data-animatsiya="qadamli" data-nom="signal"></div>

## SIGINT va SIGHUP

**SIGINT** — Ctrl+C. Debian Reference jadvaliga ko'ra Ctrl+C bosilganda oldingi plandagi (foreground) jarayonga SIGINT, Ctrl+\ bosilganda SIGQUIT yuboriladi.

**SIGHUP** — "aloqa uzildi". signal(7) ga ko'ra u boshqaruvchi terminal uzilganda keladi. bash qo'llanmasiga ko'ra qobiq (shell) SIGHUP olsa chiqib ketadi. Interaktiv qobiq esa chiqishdan oldin SIGHUP ni o'zining barcha ishlariga (jobs) — ishlayotgan va to'xtatilganlariga — qayta yuboradi. SSH uzilganda fon jarayonlari nega to'xtashi va buning oldini olish (`nohup`, `disown`, `tmux`) — 30-bobda, VPS'da sinab ko'riladi.

## `exec` va signallar

28-bobda ishga tushirish skriptlarida `exec` nega yozilishini signallar bilan ko'rsatishni va'da qilgandik.

Skript ilovani oddiy chaqiradi (`exec` siz). Ilova o'zi SIGTERM'ni ushlaydi:

```text
$ printf '#!/bin/sh\ntrap "echo ilova: TERM oldim, tozalayapman; exit 0" TERM\necho "ilova: ishga tushdim, PID=$$"\nwhile true; do sleep 1; done\n' > /tmp/ilova.sh
$ chmod +x /tmp/ilova.sh
$ printf '#!/bin/sh\necho "skript: ishga tushdim, PID=$$"\n/tmp/ilova.sh\n' > /tmp/oddiy.sh
$ chmod +x /tmp/oddiy.sh
$ /tmp/oddiy.sh &
[1] 231
$ sleep 1
skript: ishga tushdim, PID=231
ilova: ishga tushdim, PID=234
$ pgrep -a -f 'ilova.sh|oddiy.sh'
231 /bin/sh /tmp/oddiy.sh
234 /bin/sh /tmp/ilova.sh
$ kill -TERM $!
$ sleep 1
[1]+  Terminated              /tmp/oddiy.sh
$ pgrep -a -f ilova.sh || echo "ilova tugagan"
234 /bin/sh /tmp/ilova.sh
```

Skript (`$!`) to'xtadi, ilova esa **ishlashda davom etdi**: signal faqat skriptga bordi, skript uni bolasiga uzatmadi.

Endi `exec` bilan:

```text
$ pkill -f ilova.sh
$ printf '#!/bin/sh\necho "skript: ishga tushdim, PID=$$"\nexec /tmp/ilova.sh\n' > /tmp/exec-bilan.sh
$ chmod +x /tmp/exec-bilan.sh
$ /tmp/exec-bilan.sh &
[1] 281
$ sleep 1
skript: ishga tushdim, PID=281
ilova: ishga tushdim, PID=281
ilova: TERM oldim, tozalayapman
$ pgrep -a -f 'ilova.sh|exec-bilan.sh'
281 /bin/sh /tmp/ilova.sh
$ kill -TERM $!
$ sleep 1
ilova: TERM oldim, tozalayapman
[1]+  Done                    /tmp/exec-bilan.sh
$ pgrep -a -f ilova.sh || echo "ilova tugagan"
ilova tugagan
```

Birinchi `ilova: TERM oldim` qatori — oldingi misoldan qolgan ilova: blok boshidagi `pkill -f ilova.sh` uni to'xtatdi.

Yangi ilova skriptning o'rnini egalladi — PID o'sha-o'sha (28-bob, execve). `kill -TERM $!` to'g'ridan-to'g'ri ilovaga yetdi, u tozalab chiqdi.

### systemd'da-chi?

systemd servisni boshqacha to'xtatadi. systemd.kill(5) ga ko'ra:

- `KillMode=` standart holatda `control-group`: unit to'xtatilganda uning **barcha** jarayonlari to'xtatiladi;
- avval `KillSignal=` (standart — SIGTERM) yuboriladi;
- jarayonlar `TimeoutStopSec=` vaqtida tugamasa, SIGKILL yuboriladi (`SendSIGKILL=yes`).

`exec` siz o'sha skriptni vaqtinchalik servis qilib ishga tushirib, to'xtatamiz:

```text
$ systemd-run --unit=sinov /tmp/oddiy.sh
Running as unit: sinov.service
$ sleep 1
$ systemctl show -p KillMode -p KillSignal sinov
KillMode=control-group
KillSignal=15
$ systemd-cgls --no-pager -u sinov.service
Unit sinov.service (/system.slice/sinov.service):
├─289 /bin/sh /tmp/oddiy.sh
├─290 /bin/sh /tmp/ilova.sh
└─297 sleep 1
$ systemctl stop sinov
$ pgrep -a -f 'ilova.sh|oddiy.sh' || echo "hammasi to'xtadi"
hammasi to'xtadi
$ journalctl -u sinov --no-pager -o cat
Started sinov.service - /tmp/oddiy.sh.
skript: ishga tushdim, PID=289
ilova: ishga tushdim, PID=290
Terminated
ilova: TERM oldim, tozalayapman
Stopping sinov.service - /tmp/oddiy.sh...
sinov.service: Deactivated successfully.
Stopped sinov.service - /tmp/oddiy.sh.
```

systemd SIGTERM'ni unit guruhidagi har ikkala jarayonga yubordi: ilova ham `TERM oldim` dedi. Demak:

| Kim to'xtatadi | `exec` siz skript |
| --- | --- |
| systemd (`systemctl stop`) | Muammo yo'q: standart `KillMode=control-group` hammaga yuboradi |
| Qo'lda `kill PID` | Signal faqat skriptga boradi, ilova qoladi |
| Konteyner (`docker stop`) | Docker hujjatiga ko'ra signalni konteynerning **asosiy jarayoni** oladi, 10 soniyadan keyin SIGKILL. Asosiy jarayon `exec` siz skript bo'lsa, ilova SIGTERM'ni olmaydi va tozalashsiz o'ldiriladi |

`exec` — eng ishonchli yo'l: kim to'xtatmasin, signal ilovaning o'ziga boradi.

## Chiqish kodi: 128 + N

bash qo'llanmasiga ko'ra buyruq `N` raqamli signal bilan tugasa, chiqish kodi **128 + N** bo'ladi:

```text
$ sleep 300 &
[1] 302
$ kill -TERM $!
$ wait $!; echo "SIGTERM: $?"
[1]+  Terminated              sleep 300
SIGTERM: 143
$ sleep 300 &
[1] 303
$ kill -KILL $!
$ wait $!; echo "SIGKILL: $?"
[1]+  Killed                  sleep 300
SIGKILL: 137
$ sleep 300 &
[1] 304
$ kill -INT $!
$ wait $!; echo "SIGINT: $?"
[1]+  Interrupt               sleep 300
SIGINT: 130
```

| Kod | Hisob | Signal |
| --- | --- | --- |
| 130 | 128 + 2 | SIGINT |
| 137 | 128 + 9 | SIGKILL |
| 143 | 128 + 15 | SIGTERM |

Logda yoki CI'da `137` ko'rsangiz — jarayon SIGKILL bilan o'ldirilgan; `143` — SIGTERM bilan to'xtatilgan. Kim yuborganini jurnaldan qidirasiz (37-bob); xotira tugaganda yadro o'ldirishi — 31-bobda.

## Debian va Ubuntu

| | Debian 12 (trenajor) | Ubuntu 26.04 (VPS) |
| --- | --- | --- |
| bash (`kill` builtin) | 5.2.15 | 5.3.9 |
| procps-ng (`pgrep`, `pkill`, `/usr/bin/kill`) | 4.0.2 | 4.0.4 |

```text vps
$ bash --version | head -1
GNU bash, version 5.3.9(1)-release (x86_64-pc-linux-gnu)
$ pkill --version
pkill from procps-ng 4.0.4
$ type kill
kill is a shell builtin
```

`pgrep`/`pkill` rust-coreutils'ga kirmaydi: ikkala tizimda ham procps-ng.

## Tipik xatolar

**1. Darhol `kill -9`.**
SIGKILL tozalashga imkon bermaydi (yuqoridagi PID fayli). systemd ham avval SIGTERM yuboradi va faqat `TimeoutStopSec` o'tgach SIGKILL ishlatadi.
To'g'risi: avval `kill PID`, bir oz kuting (`pgrep` bilan tekshiring), kerak bo'lsagina `kill -KILL`.

**2. `pkill -f` ni qisqa so'z bilan.**
`pkill -f sh` serverda `sshd` ni ham to'xtatadi.
To'g'risi: avval `pgrep -a -f`; imkon bo'lsa `pkill -x` yoki PID.

**3. Zombini `kill` bilan "o'ldirish".**
Zombi allaqachon tugagan (ps(1)), signal unga ta'sir qilmaydi.
To'g'risi: Debian Reference'ga ko'ra uning otasini (PPID) to'xtatish.

**4. Ishga tushirish skriptida `exec` ni unutish.**
Qo'lda `kill` yoki `docker stop` signali ilovaga yetmaydi.
To'g'risi: skript oxirida `exec ilova ...`.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=29-signal)** "Jarayonni to'xtatish": jarayonlarni `pgrep` bilan topasiz, `pkill` va `kill` bilan to'xtatasiz va `trap` bilan tozalab chiqishni tekshirasiz.

Savollar:

1. `kill 1234` qaysi signalni yuboradi?
2. Ilova qaysi signalni ushlay oladi: SIGTERM'nimi, SIGKILL'nimi?
3. Jarayonning chiqish kodi 137. Nima bo'lgan?
4. Nega `pkill -f sh` serverda xavfli?
5. `exec` siz ishga tushirish skripti `systemctl stop` da muammo beradimi? `docker stop` da-chi?

<details>
<summary>Javoblar</summary>

1. SIGTERM (`help kill`: signal ko'rsatilmasa).
2. SIGTERM'ni. SIGKILL'ni ushlab, bloklab yoki e'tiborsiz qoldirib bo'lmaydi.
3. 137 − 128 = 9: jarayon SIGKILL bilan o'ldirilgan.
4. `-f` butun buyruq qatoridan qidiradi: `sshd`, `chronyd-starter.sh` kabi jarayonlar ham tushadi.
5. `systemctl stop` da yo'q: standart `KillMode=control-group` signalni hamma jarayonga yuboradi. `docker stop` da ha: signalni faqat asosiy jarayon oladi.

</details>

## Rasmiy hujjat

- [signal(7) — man7.org](https://man7.org/linux/man-pages/man7/signal.7.html)
- [Debian Reference 9.4.12 — Killing a process](https://www.debian.org/doc/manuals/debian-reference/ch09.en.html#_killing_a_process)
- [GNU Bash: Signals](https://www.gnu.org/software/bash/manual/bash.html#Signals), [Exit Status](https://www.gnu.org/software/bash/manual/bash.html#Exit-Status)
- [pgrep(1), pkill(1) — man7.org](https://man7.org/linux/man-pages/man1/pgrep.1.html)
- [systemd.kill(5)](https://www.freedesktop.org/software/systemd/man/latest/systemd.kill.html)
- [docker container stop — Docker Docs](https://docs.docker.com/reference/cli/docker/container/stop/)
- Trenajorda: `man 7 signal`, `help kill`, `man pkill`, `man bash` (SIGNALS bo'limi)
