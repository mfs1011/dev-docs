# 10 — Disk va mount

[← Oldingi: Hamma narsa — fayl](09-hamma-narsa-fayl.md) · [Mundarija](README.md)

## Tushuncha

4-bobda Linux'da bitta daraxt borligini aytdik. Disklar daraxtga **ulanadi** (mount): diskdagi fayl tizimi daraxtning biror papkasida ko'rina boshlaydi. Bu papka **ulanish nuqtasi** (mount point) deyiladi. Masalan, VPS'da `/dev/vda3` diski `/` ga, `/dev/vda2` esa `/boot/efi` ga ulangan.

Serverda bu bob ikki savolga javob beradi:

1. **Qaysi disk qayerga ulangan va unda qancha joy bor?** `lsblk`, `findmnt`, `df`.
2. **Joyni nima egallagan?** `du`. Joy topilmasa, o'chirilgan, lekin hali ochiq turgan fayllar.

Debian Reference'ga ko'ra disk hajmini uch vosita ko'rsatadi:

- `mount` — ulangan barcha fayl tizimlari;
- `df` — har bir fayl tizimidagi bo'sh va band joy;
- `du` — papkalar daraxti qancha joy egallaganini.

## Disklar va bo'limlar: `lsblk`

Trenajorda haqiqiy disk yo'q: uning fayl tizimi brauzer orqali ulanadi (9-bob). Shuning uchun disk misollari VPS'dan olingan.

```text vps
$ lsblk -f
NAME   FSTYPE FSVER LABEL UUID                                 FSAVAIL FSUSE% MOUNTPOINTS
sr0
zram0  swap   1     zram0 5a013717-9955-4e21-8775-be67ebdc9016                [SWAP]
vda
├─vda1
├─vda2 vfat   FAT16 EFI   01BF-9315                              95.3M     4% /boot/efi
└─vda3 ext4   1.0   ROOT  caaa98a8-869e-4008-a15d-d75d96af40f7   36.4G     2% /
```

- `vda` — butun virtual disk (40 GB). `vda1`, `vda2`, `vda3` — uning **bo'limlari** (partition).
- `FSTYPE` — bo'limdagi fayl tizimi: `ext4` (Linux'ning asosiy fayl tizimi), `vfat` (UEFI yuklash bo'limi uchun).
- `UUID` — fayl tizimining noyob identifikatori.
- `MOUNTPOINTS` — qayerga ulangan.
- `zram0` — xotirada siqilgan swap.
- `sr0` — virtual CD-ROM.

## Ulanishlar: `findmnt` va `/etc/fstab`

```text vps
$ findmnt /
TARGET SOURCE    FSTYPE OPTIONS
/      /dev/vda3 ext4   rw,relatime
$ cat /etc/fstab
UUID=caaa98a8-869e-4008-a15d-d75d96af40f7 / ext4 defaults 0 1
UUID=01BF-9315 /boot/efi vfat defaults 0 0
```

`/etc/fstab` — tizim yonganda qaysi fayl tizimi qayerga ulanishini belgilaydigan fayl (fstab(5)). Har qator: **qurilma**, **ulanish nuqtasi**, **turi**, **opsiyalari**, keyin ikki son (zaxira va tekshirish tartibi).

E'tibor bering: qurilma `/dev/vda3` deb emas, **UUID** bilan yozilgan. Debian Reference'ga ko'ra bo'limlar qayta sozlanganda yoki disklar boshqa tartibda ulanganda qurilma nomlari o'zgarishi mumkin. UUID esa o'zgarmaydi. UUID'ni `blkid` yoki `lsblk -f` ko'rsatadi.

> **Ehtiyot bo'ling.** `/etc/fstab` dagi xato server **yonmay qolishiga** olib kelishi mumkin. VPS'da esa bunda SSH ham ishlamaydi. Faylni o'zgartirgach, qayta ishga tushirishdan oldin `findmnt --verify` bilan tekshiring va `mount -a` bilan sinab ko'ring.

`findmnt --verify` util-linux'ning `findmnt(8)` buyrug'idagi opsiya: u fstab'ni o'qib, xatolarni ko'rsatadi.

```text vps
$ findmnt --verify; echo "kod $?"
Success, no errors or warnings detected
kod 0
```

Trenajorda `/etc/fstab` umuman yo'q: u brauzer orqali ulanadi, ulanishlarni esa systemd o'zi qiladi.

### Qo'lda ulash: `mount` va `umount`

Trenajorda xotiradagi fayl tizimini (tmpfs) ulab ko'ramiz. Bu disk ulash bilan bir xil ishlaydi, faqat qurilma o'rnida xotira turadi:

```text
$ mkdir -p /mnt/sinov
$ mount -t tmpfs -o size=10M tmpfs /mnt/sinov
$ findmnt /mnt/sinov
TARGET     SOURCE FSTYPE OPTIONS
/mnt/sinov tmpfs  tmpfs  rw,relatime,size=10240k
$ df -h /mnt/sinov
Filesystem      Size  Used Avail Use% Mounted on
tmpfs            10M     0   10M   0% /mnt/sinov
$ head -c 12M /dev/zero > /mnt/sinov/f
head: error writing 'standard output': No space left on device
$ umount /mnt/sinov
$ findmnt /mnt/sinov; echo "kod: $?"
kod: 1
```

- `mount -t TUR -o OPSIYALAR MANBA NUQTA` — ulash. Disk uchun manba `/dev/vdb1` yoki `UUID=...` bo'ladi.
- 10 MB lik fayl tizimiga 12 MB sig'madi: "No space left on device".
- `umount` — uzish. U yerdagi fayllar shu fayl tizimiga tegishli edi: tmpfs uzilgach, ular yo'qoldi.

## Joy: `df`

`df` har bir **fayl tizimi** bo'yicha joyni ko'rsatadi. `-h` (human-readable) hajmni K, M, G bilan chiqaradi:

```text vps
$ df -h
Filesystem      Size  Used Avail Use% Mounted on
tmpfs           359M  680K  359M   1% /run
/dev/vda3        40G  864M   37G   3% /
tmpfs           897M     0  897M   0% /dev/shm
efivarfs        256K   19K  233K   8% /sys/firmware/efi/efivars
none            1.0M     0  1.0M   0% /run/credentials/systemd-journald.service
none            1.0M     0  1.0M   0% /run/credentials/systemd-resolved.service
tmpfs           897M     0  897M   0% /tmp
/dev/vda2       100M  4.5M   96M   5% /boot/efi
none            1.0M     0  1.0M   0% /run/credentials/getty@tty1.service
tmpfs           180M  4.0K  180M   1% /run/user/0
```

Ro'yxatda xotiradagi fayl tizimlari ko'p. Faqat haqiqiy disklarni ko'rish uchun `-T` (turini ko'rsatish) va `-x` (turni chiqarib tashlash) ishlatiladi:

```text vps
$ df -hT -x tmpfs -x devtmpfs -x efivarfs
Filesystem     Type  Size  Used Avail Use% Mounted on
/dev/vda3      ext4   40G  864M   37G   3% /
/dev/vda2      vfat  100M  4.5M   96M   5% /boot/efi
```

Bitta papka qaysi fayl tizimida turganini bilish uchun uning yo'lini bering:

```text
$ df -h /tmp
Filesystem      Size  Used Avail Use% Mounted on
tmpfs           111M     0  111M   0% /tmp
```

## Joyni nima egallagan: `du`

`du` **papkalar** qancha joy egallaganini sanaydi. `-s` — faqat jami, `-h` — o'qishga qulay:

```text vps
$ du -sh /var/log /var/cache /usr
19M	/var/log
9.9M	/var/cache
732M	/usr
$ du -h --max-depth=1 /var | sort -h | tail -5
28K	/var/tmp
9.9M	/var/cache
16M	/var/lib
19M	/var/log
44M	/var
```

`--max-depth=1` faqat birinchi pog'onadagi papkalarni ko'rsatadi, `sort -h` ularni hajm bo'yicha saralaydi (20-bob), `tail -5` eng kattalarini oladi. Disk to'lganda katta papkani shu usulda pog'onama-pog'ona topasiz (54-bob).

## "Disk to'la, lekin fayl topilmayapti"

Debian Reference bu holatni alohida ko'rsatadi: **o'chirilgan, lekin ochiq turgan** fayllar diskda joy egallayveradi, oddiy `du` esa ularni ko'rmaydi.

6-bobdan eslang: `rm` faylni emas, nomni o'chiradi. Ma'lumot oxirgi nom **va** faylni ochib turgan oxirgi jarayon yo'qolganda o'chadi. Odatiy misol: ilova log faylga yozib turibdi, kimdir joy bo'shatish uchun logni `rm` qildi. Ilova esa faylni hali ochiq tutib turibdi.

Trenajorda shu holatni yaratamiz. `tail -f` faylni ochiq tutib turadi (fonda, `&`):

```text
$ head -c 30M /dev/zero > /tmp/katta.log
$ tail -f /tmp/katta.log > /dev/null 2>&1 &
[1] 177
$ rm /tmp/katta.log
$ du -sh /tmp
0	/tmp
$ df -h /tmp
Filesystem      Size  Used Avail Use% Mounted on
tmpfs           111M   30M   81M  28% /tmp
```

`du` "0" deydi, `df` esa 30 MB band ekanini ko'rsatadi. Joyni kim egallaganini `lsof` topadi. lsof(8) ga ko'ra `+L1` havolalar soni 1 dan kam, ya'ni **o'chirilgan**, lekin ochiq fayllarni tanlaydi:

```text
$ lsof +L1
COMMAND PID USER   FD   TYPE DEVICE SIZE/OFF NLINK NODE NAME
tail    177 root    3r   REG   0,29 31457280     0   10 /tmp/katta.log (deleted)
$ kill %1
```

`NLINK` 0, ya'ni nom yo'q, lekin `tail` (PID 177) faylni ochib turibdi. Jarayon to'xtagach (`kill`, 29-bob) joy bo'shaydi:

```text
$ df -h /tmp
Filesystem      Size  Used Avail Use% Mounted on
tmpfs           111M     0  111M   0% /tmp
```

`lsof` o'rnatilmagan serverda xuddi shu ma'lumotni `/proc` dan olish mumkin. Har bir jarayonning ochiq fayllari `/proc/<PID>/fd/` da havola bo'lib turadi (9-bob). Sinov VPS'ida `lsof` yo'q, shuning uchun bu usul u yerda sinab ko'rildi:

```text vps
$ find /proc/[0-9]*/fd -lname "*(deleted)" 2>/dev/null
/proc/1/fd/66
/proc/5859/fd/6
$ ls -l /proc/*/fd 2>/dev/null | grep deleted
lrwx------  1 root root 64 Nov  5 09:23 66 -> /memfd:systemd-udevd (deleted)
lr-x------ 1 root root 64 Nov  5  2026 6 -> /var/tmp/katta.log (deleted)
```

`/var/tmp/katta.log (deleted)` — biz ataylab qoldirgan fayl. `memfd:systemd-udevd` esa diskdagi fayl emas, xotiradagi ichki ob'ekt, u normal holat.

**Yechim.** Jarayonni to'xtatmasdan joyni bo'shatish uchun faylni o'chirish o'rniga uni **bo'shatish** kerak: `: > /var/log/ilova.log` (yoki `truncate -s 0`). Fayl o'sha-o'sha qoladi, faqat hajmi 0 ga tushadi. Logni to'g'ri aylantirish (logrotate) esa 37-bobda.

## Debian va Ubuntu

| | Trenajor (Debian 12) | VPS (Ubuntu 26.04) |
| --- | --- | --- |
| `df` | GNU coreutils 9.1 | GNU coreutils 9.7 |
| `du` | GNU coreutils 9.1 | rust-coreutils (uutils) 0.10.0 |
| `lsof` | o'rnatilgan | o'rnatilmagan |
| Ildiz fayl tizimi | 9p (brauzer orqali) | ext4, `/dev/vda3` |

```text vps
$ df --version | head -1
df (GNU coreutils) 9.7
$ du --version | head -1
du (uutils coreutils) 0.10.0
```

Bu bobdagi buyruqlarning chiqish formati ikkala tizimda bir xil.

## Tipik xatolar

**1. Joy bo'shatish uchun ochiq log faylni `rm` qilish.**
`df` o'zgarmaydi, chunki ilova faylni ochib turibdi.
To'g'risi: `: > fayl.log` bilan bo'shating yoki ilovani qayta ishga tushiring. Kelajakda logrotate (37-bob).

**2. `/etc/fstab` da `/dev/sdb1` kabi nom yozish.**
Disklar tartibi o'zgarsa, noto'g'ri disk ulanadi yoki server yonmaydi.
To'g'risi: `UUID=...` yozing (`blkid` yoki `lsblk -f` dan).

**3. fstab'ni tekshirmasdan qayta ishga tushirish.**
Bitta xato qator VPS'ni yonmaydigan qilib qo'yishi mumkin. Bunda faqat provayder konsoli orqali tuzatish mumkin.
To'g'risi: `findmnt --verify`, keyin `mount -a`.

**4. `du` va `df` ni solishtirib adashish.**
`du` papka daraxtini sanaydi, `df` fayl tizimini. O'chirilgan-ochiq fayllar va papka ichiga boshqa fayl tizimi ulangan joylar tufayli ular farq qilishi mumkin.
To'g'risi: farq katta bo'lsa, avval `lsof +L1` (yoki `/proc/*/fd`) ni tekshiring.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=10-disk)** "Yo'qolgan joyni topish": fayl tizimini ulaysiz, o'chirilgan-ochiq faylni topasiz va joyni bo'shatasiz.

Savollar:

1. `lsblk` va `df` ning farqi nima?
2. Nega `/etc/fstab` da UUID ishlatiladi?
3. `du -sh /` 2 GB, `df -h /` esa 10 GB band deyapti. Nimani tekshirasiz?
4. Ilova ochib turgan log faylni jarayonni to'xtatmasdan qanday bo'shatasiz?

<details>
<summary>Javoblar</summary>

1. `lsblk` qurilmalar va bo'limlarni (ulangan yoki ulanmaganini) ko'rsatadi. `df` esa faqat ulangan fayl tizimlaridagi joyni.
2. Qurilma nomlari (`/dev/vda3`) disk tartibi o'zgarganda o'zgarishi mumkin, UUID esa o'zgarmaydi.
3. O'chirilgan-ochiq fayllarni: `lsof +L1` yoki `find /proc/[0-9]*/fd -lname "*(deleted)"`.
4. `: > fayl.log` yoki `truncate -s 0 fayl.log`.

</details>

## Rasmiy hujjat

- [Debian Reference 9.6.1 — Disk space usage](https://www.debian.org/doc/manuals/debian-reference/ch09.en.html#_disk_space_usage)
- [Debian Reference 9.6.3 — Accessing partition using UUID](https://www.debian.org/doc/manuals/debian-reference/ch09.en.html#_accessing_partition_using_uuid)
- [Debian Reference 9.8.12 — Invisible disk space consumption](https://www.debian.org/doc/manuals/debian-reference/ch09.en.html#_invisible_disk_space_consumption)
- [lsblk(8)](https://manpages.debian.org/bookworm/util-linux/lsblk.8.en.html) · [findmnt(8)](https://manpages.debian.org/bookworm/util-linux/findmnt.8.en.html) · [mount(8)](https://manpages.debian.org/bookworm/mount/mount.8.en.html) · [fstab(5)](https://manpages.debian.org/bookworm/mount/fstab.5.en.html)
- [GNU Coreutils — df invocation](https://www.gnu.org/software/coreutils/manual/coreutils.html#df-invocation) · [du invocation](https://www.gnu.org/software/coreutils/manual/coreutils.html#du-invocation)
- [lsof(8)](https://manpages.debian.org/bookworm/lsof/lsof.8.en.html)
- [proc(5) — /proc/pid/fd](https://man7.org/linux/man-pages/man5/proc.5.html)
