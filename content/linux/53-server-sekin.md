# 53 — Server sekin

[← Oldingi: ⚑ Servis ishlamayapti](52-servis-ishlamayapti.md) · [Mundarija](README.md)

> ⚑ Bu qismdagi tekshiruv **tartibi** rasmiy hujjatlarda bitta joyda yozilmagan. Har buyruq rasmiy manbadan olingan, ketma-ketlik esa trenajor va VPS'da sinalgan amaliyot.

## Tushuncha

"Server sekin" — bu belgi, sabab emas. Sabab deyarli doim to'rt resursdan birida:

| Resurs | Nima bo'ladi | Asosiy belgisi |
| --- | --- | --- |
| CPU | Jarayonlar navbat kutadi | Yuklama CPU sonidan katta, `id` (bo'sh) ≈ 0 |
| Xotira | Yadro sahifalarni swap'ga chiqaradi, keshni tashlaydi | `available` kam, swap faol (`si`/`so`) |
| Disk | Jarayonlar disk javobini kutadi | `wa` katta, `D` holatidagi jarayonlar |
| Virtual mashina | Gipervizor CPU vaqtini boshqa mashinalarga beradi | `st` katta |

31-bobda `uptime`, `top` va `free` ni alohida ko'rdik. Endi ularni bitta tekshiruvga birlashtiramiz va har resursni ataylab "bo'g'ib", belgilari qanday ko'rinishini ko'ramiz. Debian Reference (9.4) bu ish uchun `procps` paketidagi vositalarni (`ps`, `top`, `vmstat`, …) asosiy deb biladi.

## Birinchi qarash: vmstat va bosim

`vmstat` — bitta jadvalda hamma resurs. `vmstat 2 3` — 2 soniya oraliq bilan 3 ta hisobot:

```text
$ nproc
1
$ vmstat 1 3
procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
 1  0      0 187528      0  26172    0    0     0     0 1132 1150 30 50 20  0  0
 1  0      0 187528      0  26172    0    0     0     0  354   43  0  3 97  0  0
 1  0      0 187528      0  26172    0    0     0     0  249   15  0  0 100  0  0
$ cat /proc/pressure/cpu
some avg10=36.90 avg60=13.77 avg300=3.27 total=10070487
full avg10=0.00 avg60=0.00 avg300=0.00 total=0
```

vmstat(8) bo'yicha ustunlar (eng keraklilari):

| Guruh | Ustun | Ma'nosi |
| --- | --- | --- |
| procs | `r` | Ishga tayyor jarayonlar (ishlayotgan yoki CPU navbatida) |
| | `b` | Kiritish-chiqarish (I/O) tugashini kutib bloklangan jarayonlar |
| memory | `free`, `buff`, `cache` | Bo'sh, bufer va kesh xotira (KiB) |
| swap | `si`, `so` | Swap'dan o'qilgan / swap'ga yozilgan (sekundiga) |
| io | `bi`, `bo` | Blokli qurilmadan o'qilgan / yozilgan (KiB/s) |
| cpu | `us`, `sy`, `id`, `wa`, `st` | Foydalanuvchi kodi, yadro, bo'sh, I/O kutish, gipervizor o'g'irlagan vaqt (%) |

**Muhim:** vmstat(8) — birinchi qator **yonganidan beri o'rtacha**, keyingilari — oraliq davomidagi qiymatlar. Hozirgi holat — ikkinchi qatordan boshlab (`-y` birinchisini umuman chiqarmaydi). Trenajorda buni yaqqol ko'rish mumkin: u endigina yongan, birinchi qatordagi `us 30, sy 50` — yonish paytidagi ish; keyingi qatorlarda CPU deyarli bo'sh.

`/proc/pressure/` — **bosim** (Pressure Stall Information, PSI). Kernel hujjati bo'yicha har resurs (`cpu`, `memory`, `io`) uchun:

- `some` — kamida **ba'zi** jarayonlar shu resursni kutib qolgan vaqt ulushi (%);
- `full` — **barcha** (bo'sh bo'lmagan) jarayonlar bir vaqtda kutib qolgan vaqt ulushi — bu paytda CPU behuda turadi;
- `avg10`, `avg60`, `avg300` — oxirgi 10, 60 va 300 soniya bo'yicha.

`vmstat` "nima bo'lyapti"ni, PSI esa "bu ishga qanchalik xalaqit beryapti"ni ko'rsatadi.

VPS'da tinch holat:

```text vps
$ nproc
1
$ uptime
 19:56:09 up 11:43,  1 user,  load average: 0.12, 0.16, 0.11
$ vmstat 2 3
procs -----------memory---------- ---swap-- -----io---- -system-- -------cpu-------
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st gu
 0  0      0 802064  42776 638904    0    0    10    23  140    0  1  0 99  0  0  0
 0  0      0 802064  42776 638944    0    0     0     0  135   66  0  1 99  0  0  0
 0  0      0 802064  42776 638944    0    0     0     0  123   60  0  0 100  0  0  0
$ cat /proc/pressure/cpu /proc/pressure/memory /proc/pressure/io
some avg10=0.80 avg60=0.37 avg300=0.17 total=143252278
full avg10=0.00 avg60=0.00 avg300=0.00 total=0
some avg10=0.00 avg60=0.00 avg300=0.00 total=1
full avg10=0.00 avg60=0.00 avg300=0.00 total=1
some avg10=0.25 avg60=0.17 avg300=0.04 total=14901492
full avg10=0.25 avg60=0.17 avg300=0.04 total=12142706
```

Ubuntu'dagi `vmstat` da yana bitta ustun bor — `gu` (pastda, "Debian va Ubuntu").

## CPU

Trenajorda 1 ta CPU. Ikkita CPU yeydigan jarayon (31-bobdagidek `yes`):

```text
$ yes > /dev/null &
[1] 179
$ yes > /dev/null &
[2] 180
$ sleep 5; vmstat 2 3
procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
 3  0      0 186868      0  26636    0    0     0     0  928  912 28 50 22  0  0
 3  0      0 186868      0  26636    0    0     0     0  253  255 34 67  0  0  0
 3  0      0 186868      0  26636    0    0     0     0  254  255 34 66  0  0  0
$ cat /proc/pressure/cpu
some avg10=68.44 avg60=24.11 avg300=5.86 total=19749737
full avg10=0.00 avg60=0.00 avg300=0.00 total=0
$ top -b -n 1 | sed -n '1,3p;7,10p'
top - 17:01:37 up 0 min,  1 user,  load average: 1.02, 0.25, 0.09
Tasks:  57 total,   3 running,  54 sleeping,   0 stopped,   0 zombie
%Cpu(s): 23.8 us, 76.2 sy,  0.0 ni,  0.0 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st 
  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
  179 root      20   0    3184    964    900 R  29.4   0.4   0:04.98 yes
  180 root      20   0    3184    896    832 R  29.4   0.4   0:04.96 yes
  184 root      20   0    8528   4452   2944 R   8.8   2.0   0:00.16 top
```

- `r` — 3: ikkita `yes` va `vmstat` ning o'zi, CPU esa bitta.
- `id` 0 — CPU umuman bo'sh emas.
- `cpu some` o'sdi: vaqtning katta qismida kimdir CPU navbatida turibdi.
- `top` aybdorni ko'rsatadi: ikki `yes`.

`us` emas, `sy` kattaligiga e'tibor bering: `yes` hech narsa hisoblamaydi, faqat yozadi — vaqti yadroning yozish ishiga ketadi. Dastur o'zi hisob-kitob qilsa, `us` katta bo'ladi.

Aybdorni topishda `ps` ning `%CPU` iga ishonmang. ps(1): bu — jarayonning butun umri davomidagi o'rtacha (CPU vaqti / ishlagan vaqt), hozirgi yuklama emas. Hozirgi holat uchun — `top`.

```text
$ kill %1 %2; sleep 1
[1]-  Terminated              yes > /dev/null
[2]+  Terminated              yes > /dev/null
```

### Qaysi servis?

Serverda CPU yeyayotgan jarayon ko'pincha biror servisning qismi. systemctl(1): `systemctl status PID` — shu jarayon tegishli unit'ni ko'rsatadi:

```text
$ systemd-run --unit=hisobot sh -c 'while :; do :; done'
Running as unit: hisobot.service
$ sleep 3; top -b -n 1 | sed -n '7,8p'
  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
  188 root      20   0    2860   1528   1452 R  76.9   0.7   0:03.39 sh
$ systemctl status $(pgrep -f 'while :') --no-pager -n 0
● hisobot.service - /usr/bin/sh -c while :; do :; done
     Loaded: loaded (/run/systemd/transient/hisobot.service; transient)
  Transient: yes
     Active: active (running) since Sat 2026-11-07 17:01:39 UTC; 4s ago
   Main PID: 188 (sh)
      Tasks: 1 (limit: 527)
     Memory: 240.0K
        CPU: 3.736s
     CGroup: /system.slice/hisobot.service
             └─188 /usr/bin/sh -c "while :; do :; done"
$ systemctl stop hisobot
```

`top` faqat `sh` deydi, `systemctl status` esa — `hisobot.service`, uning tavsifi va qachondan beri ishlayotgani. Endi kimga murojaat qilish yoki qaysi servisni cheklash (39-bob) ma'lum.

VPS'da (1 ta CPU) xuddi shu tajriba:

```text vps
$ yes > /dev/null & yes > /dev/null &
$ vmstat 2 3
procs -----------memory---------- ---swap-- -----io---- -system-- -------cpu-------
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st gu
 3  0      0 785180  42792 638952    0    0    10    23  141    0  1  1 99  0  0  0
 2  0      0 787336  42792 638952    0    0     0     0 1089 1050  3 97  0  0  0  0
 2  0      0 787376  42792 638952    0    0     0   492 1155 1052  3 98  0  0  0  0
$ cat /proc/pressure/cpu
some avg10=84.83 avg60=27.24 avg300=6.44 total=162364679
full avg10=0.00 avg60=0.00 avg300=0.00 total=0
$ top -b -n 1 | sed -n "1,3p;7,9p"
top - 19:56:41 up 11:44,  1 user,  load average: 0.75, 0.30, 0.16
Tasks: 132 total,   3 running, 129 sleeping,   0 stopped,   0 zombie
%Cpu(s):  7.1 us, 92.9 sy,  0.0 ni,  0.0 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st 
    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
  18014 root      20   0   18680   8748   6460 R  50.0   0.5   0:09.55 yes
  18013 root      20   0   18680   8636   6352 R  41.7   0.5   0:09.54 yes
$ pkill yes
```

## Xotira

Trenajorda swap yo'q (31-bob). Katta matnni xotirada ushlab turadigan `perl` jarayoni:

```text
$ free -m
               total        used        free      shared  buff/cache   available
Mem:             221          22         177           0          30         199
Swap:              0           0           0
$ perl -e '$a = "a" x (80*1024*1024); sleep 30' &
[1] 197
$ sleep 6; free -m
               total        used        free      shared  buff/cache   available
Mem:             221         182          14           0          33          39
Swap:              0           0           0
$ top -b -n 1 -o RES | sed -n '7,8p'
  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
  197 root      20   0  172348 168256   4232 S   0.0  74.0   0:00.39 perl
$ kill %1; sleep 1
[1]+  Terminated              perl -e '$a = "a" x (80*1024*1024); sleep 30'
```

- `available` 200 dan ~40 MiB ga tushdi — yangi dasturlar uchun joy qolmayapti.
- `top -o RES` — xotirada haqiqatan turgan hajm (RES) bo'yicha saralash: aybdor birinchi qatorda.

Swap'li serverda manzara boshqacha. VPS'da (1.8 GiB xotira, 896 MiB zram swap, 31-bob) 1300 MiB band qiladigan Python jarayoni:

```text vps
$ python3 -c "import time; a = bytearray(1300 * 1024 * 1024); time.sleep(40)" &
$ vmstat 2 4
procs -----------memory---------- ---swap-- -----io---- -system-- -------cpu-------
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st gu
 1  0   1136 1269396    372 212348    0    0    10    23  141    0  1  1 99  0  0  0
 0  0 109620 203052    196  75884   48 24742    80 24742  968  244 10 77 13  0  0  0
 0  0 109492 203052    204  75936   66    0    96     0  129   66  0  0 100  0  0  0
 0  0 109492 203052    212  75936    0    0     0    10  128   70  0  0 100  0  0  0
$ free -m
               total        used        free      shared  buff/cache   available
Mem:            1793        1629         195           3          76         163
Swap:            896         106         789
$ cat /proc/pressure/memory
some avg10=4.51 avg60=1.33 avg300=0.34 total=1049811
full avg10=2.85 avg60=0.79 avg300=0.19 total=606252
$ top -b -n 1 -o RES | sed -n "7,8p"
    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
  18210 root      20   0 1352852   1.2g   6556 S   0.0  69.7   0:01.35 python3
$ kill %1
$ free -m
               total        used        free      shared  buff/cache   available
Mem:            1793         441        1376           3          89        1351
Swap:            896          47         849
```

- `so` (swap'ga yozish) bir lahzada 24742 ga sakradi: yadro joy ochish uchun sahifalarni swap'ga chiqardi; `swpd` 109 MiB ga o'sdi.
- `cache` 212 MiB dan 76 MiB ga tushdi — fayllar keshi ham bo'shatildi. Kesh kamaysa, disk o'qishlari sekinlashadi.
- `memory full` > 0: hamma jarayon xotira kutib qolgan paytlar bo'lgan — PSI hujjati bo'yicha bu ishning jiddiy sekinlashishi.
- Jarayon to'xtagach, `available` qaytdi, lekin swap'ga chiqqan qism (`47`) darhol qaytmaydi.

Xotira butunlay tugasa — OOM killer (31-bob), uning izi `journalctl -k` da.

## Disk

Trenajorda disk yuklamasini ko'rsatib bo'lmaydi: uning fayl tizimi brauzerdagi 9p, blokli qurilma emas — `bi`, `bo`, `wa` doim 0 bo'lib qoladi (sinab ko'rdik). Shuning uchun VPS'da.

Katta faylni bir martada yozish VPS diskida bir necha soniyada tugadi va `vmstat` hech narsa ushlay olmadi. Haqiqiy serverlarda sekinlikni ko'pincha **ko'p mayda sinxron yozuvlar** beradi (masalan, ma'lumotlar bazasi har tranzaksiyani diskka yozadi). `dd` ning `oflag=dsync` parametri (dd(1)) har blokni diskka yozib bo'lguncha kutadi:

```text vps
$ dd if=/dev/zero of=/root/katta bs=4k count=5000 oflag=dsync status=none &
$ vmstat 2 3
procs -----------memory---------- ---swap-- -----io---- -system-- -------cpu-------
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st gu
 0  1  46856 1378264   6560 129376    0    1    12    73  141    0  1  1 99  0  0  0
 0  1  46856 1370452  13900 133076    0    0     0 11368 3251 6553  1  8  0 91  0  0
 0  1  46856 1363396  15344 137296    0    0     2 12660 3593 7460  0 10  0 90  0  0
$ cat /proc/pressure/io
some avg10=40.06 avg60=9.42 avg300=2.13 total=21838295
full avg10=38.29 avg60=8.47 avg300=1.87 total=18312013
$ ps -eo pid,stat,comm | awk '$2 ~ /D/'
    328 D    jbd2/vda3-8
  18343 Dl   dd
$ wait
$ rm /root/katta
```

- `b` 1 — bitta jarayon disk kutib bloklangan; `bo` ~12 MiB/s.
- `wa` 90 — CPU vaqtining 90% "disk javobini kutish". CPU bo'sh (`id` 0, lekin `us`+`sy` kichik) — muammo CPU'da emas.
- `io some` va `full` ~40%: ish vaqtining katta qismi diskni kutishga ketyapti.
- `D` holatidagi jarayonlar (28-bob: uzib bo'lmaydigan kutish) — `dd` va yadroning disk bilan ishlaydigan oqimi.

Yuklama (`load average`) ham `D` jarayonlarni sanaydi (31-bob). Shuning uchun **yuklama katta, lekin CPU bo'sh** — disk muammosining klassik belgisi.

## st: qo'shnilar

`st` (steal) — virtual mashina CPU olishi kerak bo'lgan, lekin gipervizor boshqa mashinalarga bergan vaqt (vmstat(8), top(1)). Bizning VPS'da hamma o'lchovda `0`. Agar `st` doimiy katta bo'lsa, server ichida tuzatadigan narsa yo'q: muammo provayderning jismoniy serverida.

Uchala tajriba yonma-yon:

<div data-animatsiya="qadamli" data-nom="sekin"></div>

## Xulosa jadvali

| Belgi | Ehtimoliy sabab | Keyingi qadam |
| --- | --- | --- |
| `r` > CPU soni, `id` ≈ 0, `cpu some` katta | CPU yetmayapti | `top` → `systemctl status PID` → cheklash (39-bob) yoki optimallashtirish |
| `available` kam, `si`/`so` > 0, `memory full` > 0 | Xotira yetmayapti | `top -o RES`; jurnalda OOM (`journalctl -k`) |
| `wa` katta, `b` > 0, `D` jarayonlar, `io full` > 0 | Disk sekin yoki band | Kim yozyapti/o'qiyapti; disk to'lib qolmadimi (54-bob) |
| `st` katta | Gipervizor | Provayder |
| Hammasi normal | Muammo serverdan tashqarida | Tarmoq, tashqi xizmat, ilovaning o'zi |

## Debian va Ubuntu

| | Debian 12 (trenajor) | Ubuntu 26.04 (VPS) |
| --- | --- | --- |
| procps (`vmstat`, `top`, `ps`) | 4.0.2 | 4.0.4 |
| `vmstat` CPU ustunlari | `us sy id wa st` | `us sy id wa st gu` |
| Swap | yo'q | 896 MiB zram |
| `/proc/pressure` | bor | bor |

`gu` — KVM mehmon kodi vaqti (vmstat(8)); Ubuntu'dagi yangiroq procps uni ham ko'rsatadi.

## Tipik xatolar

**1. Yuklama katta — demak CPU yetmayapti.**
Yuklama `D` holatidagi (disk kutayotgan) jarayonlarni ham sanaydi.
To'g'risi: `vmstat` da `wa` va `b` ga qarash.

**2. `vmstat` ning birinchi qatoriga qarab xulosa qilish.**
U — yonganidan beri o'rtacha.
To'g'risi: ikkinchi qatordan, yoki `vmstat -y`.

**3. `ps` dagi `%CPU` ni hozirgi yuklama deb o'ylash.**
U jarayonning butun umri bo'yicha o'rtacha.
To'g'risi: `top`.

**4. `free` ustunidagi kichik son — "xotira tugadi".**
Kesh kerak bo'lganda bo'shatiladi (31-bob).
To'g'risi: `available`, swap faolligi (`si`/`so`) va `memory` bosimi.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=53-sekin)** "Server sekin": trenajorda nimadir CPU'ni yeb qo'ygan. Belgilarini `vmstat` va bosimdan topib, aybdor jarayon va uning servisini aniqlaysiz va to'xtatasiz.

Savollar:

1. 1 ta CPU'li serverda `load average: 4.0`, `vmstat` da `id` 70, `wa` 25, `b` 3. Sabab nimada?
2. `vmstat` da `so` doim noldan katta. Bu nimani bildiradi?
3. `top` da jarayon `sh` deb ko'rinadi. U qaysi servisga tegishli ekanini qanday bilasiz?
4. `/proc/pressure/memory` da `full avg10=15.00`. Bu nima degani?
5. `st` 40%. Nima qilasiz?

<details>
<summary>Javoblar</summary>

1. CPU emas, disk: `wa` va `b` katta, CPU asosan bo'sh. Yuklama `D` holatdagi jarayonlar hisobiga o'sgan.
2. Yadro sahifalarni doim swap'ga chiqaryapti — xotira yetmayapti.
3. `systemctl status PID`.
4. Oxirgi 10 soniyaning 15% ida barcha ishlayotgan jarayonlar xotirani kutib turgan.
5. Server ichida tuzatadigan narsa yo'q — gipervizor CPU'ni boshqalarga beryapti; provayderga murojaat yoki boshqa tarif/server.

</details>

## Rasmiy hujjat

- [Debian Reference 9.4](https://www.debian.org/doc/manuals/debian-reference/ch09.en.html#_monitoring_controlling_and_starting_program_activities) — jarayonlarni kuzatish vositalari
- [Debian Reference 3.7](https://www.debian.org/doc/manuals/debian-reference/ch03.en.html#_other_system_monitors) — systemd ostidagi kuzatish buyruqlari
- [vmstat(8)](https://manpages.debian.org/bookworm/procps/vmstat.8.en.html) — ustunlar, birinchi hisobot
- [top(1)](https://manpages.debian.org/bookworm/procps/top.1.en.html) · [ps(1)](https://manpages.debian.org/bookworm/procps/ps.1.en.html) — `%CPU`
- [proc(5)](https://man7.org/linux/man-pages/man5/proc.5.html) — `/proc/loadavg`, `/proc/meminfo`
- [Linux kernel: PSI — Pressure Stall Information](https://docs.kernel.org/accounting/psi.html) — `/proc/pressure/`, `some` va `full`
- [systemctl(1)](https://www.freedesktop.org/software/systemd/man/latest/systemctl.html) — `status PID`
- [dd(1)](https://manpages.debian.org/bookworm/coreutils/dd.1.en.html) — `oflag=dsync`
