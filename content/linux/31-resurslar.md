# 31 — Resurslar

[← Oldingi: Fon rejimi](30-fon-rejimi.md) · [Mundarija](README.md) · [Keyingi: Ochiq fayllar va portlar →](32-ochiq-fayllar-va-portlar.md)

## Tushuncha

Server sekinlashsa yoki ilova yiqilsa, birinchi savol: **qaysi resurs yetmayapti?** Asosiylari:

| Resurs | Nimani ko'rish kerak | Buyruq |
| --- | --- | --- |
| CPU | Yuklama (load average), kim CPU yeyapti | `uptime`, `top`, `ps` |
| Xotira (RAM) | Qancha **haqiqatan** bo'sh | `free` |
| Ustuvorlik | Qaysi jarayon CPU'ni birinchi oladi | `nice`, `renice` |
| Xotira tugasa | Yadro kimni o'ldiradi | jurnal, `oom_score_adj` |

Disk to'lishi — 54-bobda, disk sekinligi (I/O) — 53-bobda.

## Yuklama: `uptime` va load average

```text
$ nproc
1
$ uptime
 04:42:35 up 0 min,  1 user,  load average: 0.93, 0.22, 0.07
$ cat /proc/loadavg
0.93 0.22 0.07 3/56 186
```

uptime(1) ga ko'ra qatorda: hozirgi vaqt, tizim qancha vaqtdan beri ishlayotgani, foydalanuvchilar soni va **oxirgi 1, 5 va 15 daqiqadagi o'rtacha yuklama** (load average).

Yuklama nimani sanaydi (uptime(1) va proc(5)):

- **ishga tayyor** (runnable) jarayonlar — CPU ishlatayotgan yoki navbat kutayotganlar (`ps` da `R`);
- **uzib bo'lmaydigan kutishdagi** jarayonlar — odatda disk javobini kutayotganlar (`D`).

uptime(1) dagi muhim izoh: yuklama CPU soniga **bo'linmaydi**. 1 ta CPU'li tizimda `1.00` — CPU doim band degani. 4 ta CPU'li tizimda esa xuddi shu `1.00` — vaqtning 75% bo'sh turgani. Shuning uchun yuklamani doim `nproc` (CPU soni) bilan birga o'qing.

`/proc/loadavg` ning qolgan maydonlari (proc(5)): `2/55` — hozir ishga tayyor / jami rejalashtiriladigan birliklar (jarayon va oqimlar), oxirgisi — eng oxirgi yaratilgan jarayonning PID'i.

### Yuklamani o'z ko'zimiz bilan

Trenajorda 1 ta CPU bor. Ikkita CPU yeydigan jarayon ishga tushiramiz. `yes` to'xtovsiz `y` yozadi, biz chiqishni `/dev/null` ga (9-bob) tashlaymiz. Ikkinchisini `nice` bilan "kamtar" qilamiz (pastda):

```text
$ yes > /dev/null &
[1] 187
$ nice -n 19 yes > /dev/null &
[2] 189
$ sleep 30
$ cat /proc/loadavg
1.46 0.43 0.15 3/55 236
$ ps -o pid,ni,pcpu,stat,cmd -C yes
  PID  NI %CPU STAT CMD
  187   0 79.5 R    yes
  189  19  1.7 RN   yes
```

- Uchala qiymat ham o'sdi. Ikki jarayon doim ishga tayyor (`R`), CPU esa bitta — 1 daqiqalik yuklama 2 ga intiladi. (Boshidagi ~0.9 — trenajor endigina yonganidan qolgan yuklama.)
- `%CPU` deyarli hammasi oddiy jarayonga ketdi, `nice` qilinganiga juda oz qoldi. `STAT` dagi `N` — past ustuvorlik (28-bob).

## `top`

`top` jarayonlarni jonli, CPU yeyishi bo'yicha saralab ko'rsatadi. Debian Reference uni g'ayritabiiy ishlayotgan jarayonni topish uchun interaktiv kuzatuvchi deb ta'riflaydi. Bir martalik "rasm" uchun `-b` (batch) va `-n 1` (bitta yangilanish):

```text
$ top -b -n 1 | head -n 12
top - 04:43:10 up 1 min,  1 user,  load average: 1.58, 0.47, 0.16
Tasks:  56 total,   3 running,  53 sleeping,   0 stopped,   0 zombie
%Cpu(s): 31.6 us, 68.4 sy,  0.0 ni,  0.0 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st 
MiB Mem :    222.0 total,    178.4 free,     23.4 used,     28.7 buff/cache     
MiB Swap:      0.0 total,      0.0 free,      0.0 used.    198.6 avail Mem 

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
  187 root      20   0    3184    964    904 R  50.0   0.4   0:25.91 yes
  238 root      20   0    8528   4632   3128 R  23.1   2.0   0:00.52 top
   15 root      20   0       0      0      0 I   3.8   0.0   0:01.62 rcu_preem+
   23 root      20   0       0      0      0 I   1.9   0.0   0:00.74 kworker/u+
    1 root      20   0   37208  10580   8788 S   0.0   4.7   0:06.52 systemd
```

Yuqori qism:

| Qator | Ma'nosi |
| --- | --- |
| 1-qator | `uptime` dagi bilan bir xil: vaqt, ish vaqti, yuklama |
| `Tasks` | Jami, ishlayotgan, uxlayotgan, to'xtatilgan, zombi jarayonlar (28-bob) |
| `%Cpu(s)` | CPU vaqti qayerga ketyapti (pastda) |
| `MiB Mem`, `MiB Swap` | Xotira — `free` dagi bilan bir xil ma'lumot |

`%Cpu(s)` maydonlari (top(1)):

| Maydon | Ma'nosi |
| --- | --- |
| `us` | Oddiy (nice qilinmagan) foydalanuvchi jarayonlari |
| `sy` | Yadro |
| `ni` | Nice qilingan foydalanuvchi jarayonlari |
| `id` | Bo'sh |
| `wa` | Disk/kiritish-chiqarish (I/O) javobini kutish |
| `st` | Virtual mashinadan gipervizor "o'g'irlagan" vaqt |

`wa` va `st` ning katta bo'lishi qanday muammoga ishora qilishini 53-bobda ("Server sekin") ko'ramiz.

Interaktiv `top` dagi tugmalar (top(1)):

| Tugma | Vazifasi |
| --- | --- |
| `P` | CPU bo'yicha saralash |
| `M` | Xotira bo'yicha saralash |
| `k` | Jarayonga signal yuborish (standart — SIGTERM, 29-bob) |
| `r` | Jarayonning nice qiymatini o'zgartirish |
| `1` | Har bir CPU alohida |
| `h` | Yordam |
| `q` | Chiqish |

## Ustuvorlik: `nice` va `renice`

Har bir jarayonning **nice** qiymati bor. nice(1) ga ko'ra u `-20` (jarayonga eng qulay) dan `19` gacha (eng noqulay). Ko'p jarayon CPU talab qilganda, nice qiymati past bo'lgani ko'proq vaqt oladi. Yuqoridagi tajribada `0` va `19` farqini ko'rdik.

| Buyruq | Vazifasi |
| --- | --- |
| `nice -n 19 buyruq` | Buyruqni past ustuvorlik bilan ishga tushirish |
| `renice -n 10 -p PID` | Ishlab turgan jarayonning qiymatini o'zgartirish |

Ishlab turgan oddiy `yes` ni ham kamtar qilamiz:

```text
$ renice -n 10 -p $(pgrep -o yes)
187 (process ID) old priority 0, new priority 10
$ ps -o pid,ni,cmd -C yes
  PID  NI CMD
  187  10 yes
  189  19 yes
$ kill %1 %2
```

- `pgrep -o` — eng eski (birinchi ishga tushgan) mos jarayon.
- top(1) ga ko'ra oddiy foydalanuvchi nice qiymatini faqat **oshira** oladi, kamaytirish (ustuvorlikni ko'tarish) — root ishi.
- Debian Reference ogohlantiradi: haddan tashqari nice qiymatlari ba'zan foydadan ko'ra ko'proq zarar keltiradi.

Amalda: zaxira, siqish, indekslash kabi og'ir, lekin shoshilmaydigan ishni `nice -n 19` bilan ishga tushiring — ilova sekinlashmaydi.

## Xotira: `free`

```text
$ free -h
               total        used        free      shared  buff/cache   available
Mem:           222Mi        23Mi       178Mi       120Ki        28Mi       198Mi
Swap:             0B          0B          0B
[1]-  Terminated              yes > /dev/null
[2]+  Terminated              nice -n 19 yes > /dev/null
$ grep -E '^(MemTotal|MemFree|MemAvailable|Buffers|Cached):' /proc/meminfo
MemTotal:         227356 kB
MemFree:          182652 kB
MemAvailable:     203600 kB
Buffers:               0 kB
Cached:            22804 kB
```

free(1) ga ko'ra ustunlar `/proc/meminfo` dan olinadi:

| Ustun | Ma'nosi |
| --- | --- |
| `total` | Jami xotira |
| `used` | Ishlatilgan: `total - available` |
| `free` | Umuman ishlatilmayotgan |
| `buff/cache` | Yadro bufer va keshlari (fayllar keshi) |
| `available` | **Yangi ilovalar uchun swap'siz qancha joy bor** — taxmin |

Eng ko'p uchraydigan xato — `free` ustuniga qarab "xotira tugayapti" deyish. Yadro bo'sh xotirani fayllar keshiga ishlatadi va kerak bo'lganda uni bo'shatadi. Debian Reference ham shuni aytadi: `used` va `free` raqamlari keshlar sababli qo'rqinchli ko'rinadi. Qarash kerak bo'lgan ustun — **`available`**.

VPS'da:

```text vps
$ free -h
               total        used        free      shared  buff/cache   available
Mem:           1.8Gi       487Mi       500Mi       4.6Mi       957Mi       1.3Gi
Swap:          896Mi          0B       896Mi
$ swapon --show
NAME       TYPE        SIZE USED PRIO
/dev/zram0 partition 896.5M   0B  100
```

`free` faqat 500 MiB deydi, lekin `available` — 1.3 GiB: 957 MiB kesh kerak bo'lsa bo'shatiladi. VPS'da **swap** ham bor — diskdagi emas, `/dev/zram0`, ya'ni xotiraning siqilgan qismida turgan swap. Trenajorda swap yo'q.

## Xotira tugasa: OOM

Xotira butunlay tugasa, yadro **OOM killer** (out-of-memory — xotira tugashi) ni ishga tushiradi va jarayonlardan birini o'ldiradi. proc(5) ga ko'ra qaysi jarayonni tanlash "yomonlik bahosi"ga (badness) bog'liq: 0 (hech qachon o'ldirilmaydi) dan 1000 gacha, asosan jarayon ishlatayotgan xotira ulushi bo'yicha. Bu bahoni `/proc/PID/oom_score_adj` (-1000 dan 1000 gacha) bilan o'zgartirish mumkin.

Xotira cheklovi (limit) ham bo'lishi mumkin. proc(5) ga ko'ra OOM killer shunda o'sha cheklov doirasida ishlaydi. systemd servisiga `MemoryMax=` bilan cheklov qo'yiladi (39-bob). Butun serverni xavf ostiga qo'ymaslik uchun OOM'ni aynan shunday — 50 MB cheklangan vaqtinchalik servisda chaqiramiz. Dastur xotirani har safar 1 MB dan, to'xtamay egallaydi:

```text
$ systemd-run --wait --unit=ochkoz -p MemoryMax=50M perl -e 'my @a; while (1) { push @a, "a" x (1024*1024) }'
Running as unit: ochkoz.service
[   69.861790] Memory cgroup out of memory: Killed process 246 (perl) total-vm:59900kB, anon-rss:51032kB, file-rss:2076kB, shmem-rss:0kB, UID:0 pgtables:72kB oom_score_adj:0
Finished with result: oom-kill
Main processes terminated with: code=killed/status=KILL
Service runtime: 1.217s
CPU time consumed: 630ms
$ journalctl -u ochkoz --no-pager -o cat
Started ochkoz.service - /usr/bin/perl -e my @a; while (1) { push @a, "a" x (1024*1024) }.
ochkoz.service: A process of this unit has been killed by the OOM killer.
ochkoz.service: Main process exited, code=killed, status=9/KILL
ochkoz.service: Failed with result 'oom-kill'.
$ journalctl -k --no-pager -o cat | grep 'out of memory'
Memory cgroup out of memory: Killed process 246 (perl) total-vm:59900kB, anon-rss:51032kB, file-rss:2076kB, shmem-rss:0kB, UID:0 pgtables:72kB oom_score_adj:0
```

- Yadro jarayonni o'ldirdi: `Memory cgroup out of memory: Killed process ... (perl)`. Bu yadro xabari trenajor terminalida darhol chiqdi, chunki trenajor terminali — serverning konsoli. SSH sessiyasida uni `journalctl -k` (yadro jurnali, 37-bob) da ko'rasiz.
- systemd: `code=killed, status=9/KILL` — jarayon **SIGKILL** bilan o'ldirilgan (29-bob: chiqish kodi 137).
- `Failed with result 'oom-kill'` — sabab OOM ekanini systemd o'zi yozdi.

<div data-animatsiya="qadamli" data-nom="oom"></div>

VPS'da xuddi shu tajriba bitta farq bilan o'tdi:

```text vps
$ systemd-run --wait --unit=ochkoz -p MemoryMax=50M python3 -c "a=[]
while True: a.append(bytearray(1024*1024))"
Running as unit: ochkoz.service; invocation ID: 5c46c19c4608425187695bc221aef4b7
          Finished with result: oom-kill
Main processes terminated with: code=killed, status=9/KILL
               Service runtime: 1.753s
             CPU time consumed: 1.654s
                   Memory peak: 50M (swap: 896.2M)
```

`swap: 896.2M` — o'ldirilishidan oldin jarayon **butun swap'ni** to'ldirdi: `MemoryMax=` RAM'ni cheklaydi, swap'ni emas. Swap'ni ham cheklash (`MemorySwapMax=`) — 39-bobda.

Amalda OOM belgilari:

- ilova to'satdan to'xtaydi, chiqish kodi `137` yoki `status=9/KILL`;
- `journalctl -k` da `Out of memory` yoki `oom-kill` yozuvlari;
- systemd servisida `Failed with result 'oom-kill'`.

## Debian va Ubuntu

| | Debian 12 (trenajor) | Ubuntu 26.04 (VPS) |
| --- | --- | --- |
| CPU / RAM | 1 / 222 MiB | 1 / 1.8 GiB |
| Swap | Yo'q | `/dev/zram0`, 896 MiB |
| procps-ng (`top`, `free`, `uptime`) | 4.0.2 | 4.0.4 |

## Tipik xatolar

**1. Yuklamani CPU sonisiz o'qish.**
`load average: 4.00` — 1 ta CPU'da jiddiy navbat, 8 ta CPU'da yarmi bo'sh.
To'g'risi: `nproc` bilan solishtirish.

**2. `free` ustuniga qarab xotira tugadi deyish.**
To'g'risi: `available`.

**3. Og'ir fon ishini oddiy ustuvorlikda ishga tushirish.**
Ilova sekinlashadi.
To'g'risi: `nice -n 19`.

**4. Ilova "o'zi o'chib qoldi" deb qayta ishga tushirib qo'yish.**
Sabab OOM bo'lsa, yana takrorlanadi.
To'g'risi: `journalctl -k | grep -i 'out of memory'` va servis holatida `oom-kill` ni tekshirish.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=31-resurs)** "CPU va xotira": yuklamani ko'tarasiz, ustuvorlikni o'zgartirasiz va OOM'ni cheklangan servisda ko'rasiz.

Savollar:

1. 2 ta CPU'li serverda `load average: 2.00, 1.50, 0.80`. Nima bo'lyapti?
2. `free -h` da `free` 80 MiB, `available` 1.2 GiB. Xotira yetarlimi?
3. Zaxira skriptini ilovaga xalaqit bermaydigan qilib qanday ishga tushirasiz?
4. Servis `status=9/KILL` bilan to'xtagan. OOM ekanini qanday tekshirasiz?

<details>
<summary>Javoblar</summary>

1. Oxirgi daqiqada ikkala CPU to'liq band (o'rtacha 2 ta ishga tayyor jarayon); 15 daqiqa oldin yuklama kamroq edi — o'syapti.
2. Ha: `available` — yangi ilovalar uchun swap'siz qancha joy borligi. `free` kichikligi kesh tufayli.
3. `nice -n 19 ./zaxira.sh`.
4. `journalctl -u servis` da `oom-kill`, `journalctl -k` da `out of memory` yozuvi.

</details>

## Rasmiy hujjat

- [Debian Reference 9.4.2 (nice), 9.4.4 (top)](https://www.debian.org/doc/manuals/debian-reference/ch09.en.html#_the_top_command)
- [Debian Reference 9.5.9 — Memory usage](https://www.debian.org/doc/manuals/debian-reference/ch09.en.html#_memory_usage)
- [free(1)](https://man7.org/linux/man-pages/man1/free.1.html), [uptime(1)](https://man7.org/linux/man-pages/man1/uptime.1.html), [top(1)](https://man7.org/linux/man-pages/man1/top.1.html) — man7.org
- [proc(5) — /proc/loadavg, /proc/meminfo, oom_score_adj](https://man7.org/linux/man-pages/man5/proc.5.html)
- [zram — Linux kernel documentation](https://docs.kernel.org/admin-guide/blockdev/zram.html)
- [nice(1) — GNU Coreutils](https://www.gnu.org/software/coreutils/manual/coreutils.html#nice-invocation), [renice(1)](https://man7.org/linux/man-pages/man1/renice.1.html)
- Trenajorda: `man uptime`, `man top`, `man free`, `man 5 proc`, `man nice`, `man renice`
