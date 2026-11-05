# 09 — Hamma narsa — fayl

[← Oldingi: Maxsus bitlar va ACL](08-maxsus-bitlar-va-acl.md) · [Mundarija](README.md) · [Keyingi: Disk va mount →](10-disk-va-mount.md)

## Tushuncha

Debian Reference Unix an'anasini shunday tushuntiradi: disklar, ekran, klaviatura, jarayonlar va hatto yadroning ichki ma'lumoti ham **fayl** ko'rinishida beriladi. Bu juda qulay: bitta buyruq (`cat`, `echo`, `ls`) bir-biridan butunlay farq qiladigan narsalar ustida bir xil ishlaydi. Yadro qanday ishlashini ham ba'zan maxsus faylga yozib o'zgartirish mumkin.

`ls -l` ning birinchi belgisi faylning turini ko'rsatadi (7-bob). Bu bobda oddiy fayl (`-`), papka (`d`) va symlink'dan (`l`) boshqa turlarni ko'ramiz:

| Belgi | Tur | Misol |
| --- | --- | --- |
| `c` | Belgili qurilma (character device) | `/dev/null`, `/dev/ttyS0` |
| `b` | Blokli qurilma (block device) | `/dev/vda` (disk) |
| `p` | Nomli pipe (FIFO) | `mkfifo` bilan yaratiladi |
| `s` | Socket | `/run/dbus/system_bus_socket` |

Bundan tashqari diskda umuman turmaydigan butun fayl tizimlari bor: `/proc`, `/sys`, tmpfs.

## Qurilma fayllari

Debian Reference'ga ko'ra qurilma fayllari ikki xil bo'ladi:

- **belgili** (`c`) qurilmaga bir baytdan murojaat qilinadi: klaviatura, serial port;
- **blokli** (`b`) qurilmaga kattaroq bo'laklar (bloklar) bilan murojaat qilinadi: disk.

```text
$ ls -l /dev/null /dev/zero /dev/urandom /dev/full /dev/ttyS0
crw-rw-rw- 1 root root 1,  7 Nov  5 11:27 /dev/full
crw-rw-rw- 1 root root 1,  3 Nov  5 11:27 /dev/null
crw------- 1 root tty  4, 64 Nov  5 11:30 /dev/ttyS0
crw-rw-rw- 1 root root 1,  9 Nov  5 11:27 /dev/urandom
crw-rw-rw- 1 root root 1,  5 Nov  5 11:27 /dev/zero
```

Hajm o'rnida ikki raqam turibdi: **major** (qurilma turi) va **minor** (shu turdagi aniq qurilma). `/dev/ttyS0` — trenajorning serial porti: siz yozayotgan terminal shu port orqali ishlaydi.

Trenajorda disk qurilmasi yo'q, chunki uning fayl tizimi brauzer orqali ulanadi. VPS'da esa haqiqiy virtual disk bor:

```text vps
$ lsblk
NAME   MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
sr0     11:0    1  1024M  1 rom
zram0  251:0    0 896.5M  0 disk [SWAP]
vda    253:0    0    40G  0 disk
├─vda1 253:1    0     2M  0 part
├─vda2 253:2    0   100M  0 part /boot/efi
└─vda3 253:3    0  39.9G  0 part /
$ ls -l /dev/vda /dev/vda1
brw-rw---- 1 root disk 253, 0 Nov  5 09:23 /dev/vda
brw-rw---- 1 root disk 253, 1 Nov  5 09:23 /dev/vda1
```

`vda` — butun disk, `vda1`–`vda3` — uning bo'limlari (partition, 10-bob). `/dev/vda` ga faqat root va `disk` guruhi kira oladi. Debian Reference ogohlantiradi: qurilma fayliga to'g'ridan-to'g'ri yozish katta falokatga olib kelishi mumkin. Diskka xato yozilgan bitta buyruq undagi butun fayl tizimini buzadi.

Debian Reference'ga ko'ra zamonaviy tizimda `/dev` dagi fayllarni **udev** mexanizmi avtomatik yaratadi.

## Maxsus qurilmalar: `/dev/null` va boshqalar

Debian Reference'dagi jadval:

| Fayl | O'qilganda | Yozilganda |
| --- | --- | --- |
| `/dev/null` | Darhol "fayl tugadi" | Hamma narsani yutib yuboradi ("tubsiz chuqur") |
| `/dev/zero` | Cheksiz nol baytlar (`\0`) | — |
| `/dev/urandom` | Kriptografik xavfsiz tasodifiy baytlar | — |
| `/dev/random` | Tasodifiy baytlar (haqiqiy entropiya manbai, sekin) | — |
| `/dev/full` | — | Har doim "disk to'la" (ENOSPC) xatosi |

```text
$ echo "keraksiz" > /dev/null
$ cat /dev/null
$ head -c 16 /dev/urandom | od -An -tx1
 48 6d 22 90 59 0d 64 55 0f 83 bd ae ba ff 40 3a
$ head -c 8 /dev/zero | od -An -tx1
 00 00 00 00 00 00 00 00
$ echo salom > /dev/full
-bash: echo: write error: No space left on device
```

(Tasodifiy baytlar sizda boshqacha chiqadi. `od` baytlarni o'n oltilik sonlar bilan ko'rsatadi.)

Amalda eng ko'p ishlatiladigani — `/dev/null`. Keraksiz chiqishni unga yo'naltirib yuborish mumkin (11-bob):

```text
$ ls /usr/bin/nope 2>/dev/null; echo "kod: $?"
kod: 2
```

Xato xabari ekranga chiqmadi, chiqish kodi esa qoldi. `/dev/full` dasturingiz "disk to'lgan" holatni to'g'ri ushlashini sinash uchun qulay.

## Nomli pipe (FIFO)

Debian Reference'ga ko'ra nomli pipe — pipe kabi ishlaydigan fayl. Bir tomondan yozilgani ikkinchi tomondan chiqadi: birinchi kirgan birinchi chiqadi (FIFO, First-In-First-Out). Uning hajmi doim `0`: u ma'lumotni saqlamaydi, faqat ikki jarayonni bog'laydi. Qobiqdagi `|` dan (12-bob) farqi: uning nomi bor. Shuning uchun ikki jarayon bitta buyruq qatorida, hatto bitta foydalanuvchi nomidan ishlashi shart emas.

```text
$ cd /tmp && mkfifo quvur
$ ls -l quvur
prw-r--r-- 1 root root 0 Nov  5 11:30 quvur
$ echo "salom quvurdan" > quvur &
[1] 187
$ cat quvur
salom quvurdan
[1]+  Done                    echo "salom quvurdan" > quvur
$ rm quvur
```

Yozuvchi (`echo`) kimdir o'qimaguncha kutib turadi. Shuning uchun u `&` bilan fonga yuborildi (30-bob). `cat` o'qishi bilan ikkalasi ham tugadi.

## Socket

Debian Reference'ga ko'ra socket ham jarayonlar o'rtasida ma'lumot almashadi. Pipe'dan farqi: jarayonlar bir vaqtda ishlashi shart emas, aloqa esa tarmoq orqali boshqa kompyuterlar bilan ham bo'lishi mumkin. Ikki asosiy turi bor:

- **Internet socket** — `IP:port` (40–43-boblar);
- **Unix socket** — fayl tizimidagi nom.

Unix socket'lar odatda `/run` da turadi:

```text
$ ls -l /run/systemd/journal/stdout /run/dbus/system_bus_socket
srw-rw-rw- 1 root root 0 Nov  5 11:27 /run/dbus/system_bus_socket
srw-rw-rw- 1 root root 0 Nov  5 11:27 /run/systemd/journal/stdout
```

Socket'ga ruxsat (`rw`) — u orqali servis bilan gaplashish huquqi. Masalan, `docker` buyrug'i Docker servisiga socket orqali ulanadi. [Docker hujjatiga](https://docs.docker.com/engine/install/linux-postinstall/) ko'ra `docker` guruhi (ya'ni shu socket'ga kirish huquqi) foydalanuvchiga **root darajasidagi** huquq beradi. Batafsil — "Docker" kitobida. Ochiq socket'lar ro'yxatini `ss` ko'rsatadi (32-bob).

## `/proc` va `/sys`: yadroga oyna

Debian Reference'ga ko'ra `/proc` (procfs) va `/sys` (sysfs) — **soxta fayl tizimlari** (pseudo-filesystem). Ular yadroning ichki ma'lumotlarini fayl ko'rinishida ko'rsatadi. Diskda hech narsa yo'q: fayl o'qilgan paytda yadro javobni o'sha zahoti hosil qiladi.

```text
$ findmnt -n -o TARGET,FSTYPE -t proc,sysfs,tmpfs,devtmpfs
/proc       proc
/sys        sysfs
/dev        devtmpfs
└─/dev/shm  tmpfs
/run        tmpfs
└─/run/lock tmpfs
/tmp        tmpfs
```

### `/proc` — jarayonlar va tizim holati

Debian Reference'ga ko'ra `/proc` da har bir ishlab turgan jarayon uchun uning raqami (PID) bilan atalgan papka bor. `ps` kabi vositalar ma'lumotni shu yerdan oladi (28-bob).

```text
$ ls /proc | head -12
1
10
11
12
125
13
137
14
15
150
151
153
$ cat /proc/loadavg
1.03 0.24 0.08 1/53 193
$ head -3 /proc/meminfo
MemTotal:         227324 kB
MemFree:          186724 kB
MemAvailable:     204952 kB
```

`/proc/self` — o'qiyotgan jarayonning o'zi:

```text
$ cat /proc/self/status | head -6
Name:	cat
Umask:	0022
State:	R (running)
Tgid:	195
Ngid:	0
Pid:	195
$ ls -l /proc/self/cwd /proc/self/exe
lrwxrwxrwx 1 root root 0 Nov  5 11:30 /proc/self/cwd -> /tmp
lrwxrwxrwx 1 root root 0 Nov  5 11:30 /proc/self/exe -> /usr/bin/ls
```

Birinchi buyruqda `self` — `cat`, ikkinchisida — `ls`. `cwd` jarayonning joriy papkasini, `exe` esa ishlab turgan dastur faylini ko'rsatadi. Notanish jarayon qayerdan ishga tushganini aniqlashda shu juda foydali (28-bob).

Debian Reference'ga ko'ra `/proc/sys/` dagi fayllar orqali yadro sozlamalarini ishlayotgan paytda o'zgartirish mumkin. Doimiy qilish uchun `sysctl` va `/etc/sysctl.d/*.conf` ishlatiladi.

```text
$ cat /proc/sys/kernel/hostname
trenajor
```

Debian Reference'ning izohi: `/proc/kcore` juda katta ko'rinadi va bu odamlarni qo'rqitadi. Aslida u kompyuter xotirasiga ishora qiluvchi virtual fayl, diskda joy egallamaydi:

```text
$ du -sh /proc 2>/dev/null; ls -l /proc/kcore
0	/proc
-r-------- 1 root root 1052770304 Nov  5 11:30 /proc/kcore
```

### `/sys` — qurilmalar va yadro obyektlari

Debian Reference'ga ko'ra `/sys` yadro tuzilmalarini, ularning xususiyatlarini va o'zaro bog'lanishini ko'rsatadi:

```text
$ ls /sys/class/net
lo
$ cat /sys/class/net/lo/address
00:00:00:00:00:00
```

Trenajorda tarmoq yo'q, faqat `lo` (localhost) interfeysi bor. VPS'da yana `ens3` bor: bu serverning haqiqiy tarmoq kartasi (40-bob).

## tmpfs

Debian Reference'ga ko'ra tmpfs — hamma faylni virtual xotirada saqlaydigan vaqtinchalik fayl tizimi. Kerak bo'lsa, uning ma'lumoti diskdagi swap'ga chiqarilishi mumkin. `/run` yuklanishning eng boshida tmpfs bo'lib ulanadi. Shuning uchun ildiz `/` faqat o'qishga ulangan bo'lsa ham, `/run` ga yozish mumkin. Debian 13 va Ubuntu 26.04 da `/tmp` ham tmpfs (4-bob).

tmpfs'dagi hamma narsa **qayta ishga tushirishda yo'qoladi**. Saqlanishi kerak bo'lgan narsani u yerga yozmang.

## Tipik xatolar

**1. Xatolarni `/dev/null` ga yutdirib, muammoni yashirish.**
`buyruq 2>/dev/null` xato xabarini o'chiradi va keyin nima bo'lganini hech kim bilmaydi.
To'g'risi: faqat ma'nosi aniq bo'lgan xabarlarni yutdiring. Chiqish kodini (`$?`) baribir tekshiring.

**2. Qurilma nomini adashtirish.**
`dd` yoki `mkfs` da `/dev/vdb` o'rniga `/dev/vda` yozilsa, tizim diski yo'q bo'ladi.
To'g'risi: avval `lsblk` bilan qurilma, hajm va ulangan joyni (MOUNTPOINTS) tekshiring (10-bob).

**3. `/proc/kcore` yoki `/proc` hajmidan qo'rqish.**
Bu virtual fayllar, diskda joy egallamaydi.

**4. Socket'ni oddiy fayl deb o'chirish yoki hammaga ochish.**
`/run` dagi socket servis ishlayotganda kerak. Socket'ni hammaga ochish (`chmod 666`) esa unga ulanadigan servisni hammaga ochadi. Docker socket'i bo'lsa, bu hammaga root huquqini berish bilan teng.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=09-maxsus-fayllar)** "Maxsus fayllar bilan tanishuv": `/proc` dan tizim ma'lumotini olasiz, nomli pipe orqali ma'lumot uzatasiz va keraksiz chiqishni `/dev/null` ga yo'naltirasiz.

Savollar:

1. `ls -l` da `c`, `b`, `p`, `s` harflari nimani bildiradi?
2. Joriy bash jarayonining PID raqamini `/proc` orqali qanday bilasiz?
3. Nega `/proc` diskda joy egallamaydi?
4. `/run` ga yozilgan fayl server qayta yongach qoladimi?

<details>
<summary>Javoblar</summary>

1. Belgili qurilma, blokli qurilma, nomli pipe, socket.
2. `ls -l /proc/self` — `self` o'qiyotgan jarayonga ishora qiladi. Bash'ning o'zi uchun `echo $$` ham bor (13-bob).
3. U soxta fayl tizimi: yadro ma'lumotni o'qish paytida hosil qiladi.
4. Yo'q. `/run` — tmpfs, u xotirada turadi va har yonishda tozalanadi.

</details>

## Rasmiy hujjat

- [Debian Reference 1.2.8 — Named pipes (FIFOs)](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_named_pipes_fifos)
- [Debian Reference 1.2.9 — Sockets](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_sockets)
- [Debian Reference 1.2.10–1.2.11 — Device files](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_device_files)
- [Debian Reference 1.2.12 — procfs and sysfs](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_procfs_and_sysfs)
- [Debian Reference 1.2.13 — tmpfs](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_tmpfs)
- [proc(5)](https://man7.org/linux/man-pages/man5/proc.5.html)
- [null(4)](https://man7.org/linux/man-pages/man4/null.4.html) · [random(4)](https://man7.org/linux/man-pages/man4/random.4.html)
- [fifo(7)](https://man7.org/linux/man-pages/man7/fifo.7.html) · [unix(7)](https://man7.org/linux/man-pages/man7/unix.7.html)
