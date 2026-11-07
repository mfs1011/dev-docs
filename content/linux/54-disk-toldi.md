# 54 — Disk to'ldi

[← Oldingi: ⚑ Server sekin](53-server-sekin.md) · [Mundarija](README.md)

> ⚑ Bu qismdagi tekshiruv **tartibi** rasmiy hujjatlarda bitta joyda yozilmagan. Har buyruq rasmiy manbadan olingan, ketma-ketlik esa trenajor va VPS'da sinalgan amaliyot.

## Tushuncha

`No space left on device` — bu xatoni ko'rgan servis yozolmaydi: loglar to'xtaydi, ma'lumotlar bazasi yiqiladi, ba'zan SSH bilan kirish ham qiyinlashadi. Shoshilib `rm -rf` qilishdan oldin uch narsani aniqlash kerak:

| # | Savol | Buyruq | Qaysi bobda |
| --- | --- | --- | --- |
| 1 | Qaysi fayl tizimi to'lgan: joymi yoki inode'mi? | `df -h`, `df -i` | 10, shu bob |
| 2 | Joyni nima egallagan? | `du -xh --max-depth=1`, `du --inodes` | 10 |
| 3 | `du` bilan `df` mos kelmasa — o'chirilgan, lekin ochiq fayllar | `lsof +L1` | 10 |

So'ng xavfsiz tozalanadigan joylar: systemd jurnali, apt keshi va eski yadrolar.

## Trenajorda: kichik disk yasaymiz

Trenajorning asosiy fayl tizimi juda katta (256 GB, 10-bob) — uni to'ldirib bo'lmaydi. Shuning uchun 4 MB lik va atigi 64 ta inode'li kichik xotira fayl tizimini (tmpfs) ulaymiz. `size=` va `nr_inodes=` — tmpfs parametrlari (tmpfs(5)):

```text
$ mkdir -p /mnt/kichik
$ mount -t tmpfs -o size=4M,nr_inodes=64 sinov /mnt/kichik
$ df -h /mnt/kichik
Filesystem      Size  Used Avail Use% Mounted on
sinov           4.0M     0  4.0M   0% /mnt/kichik
$ df -i /mnt/kichik
Filesystem     Inodes IUsed IFree IUse% Mounted on
sinov              64     1    63    2% /mnt/kichik
```

`df -i` (df(1): bloklar o'rniga inode'lar) — **inode** (6-bob: faylning "pasporti") nechta bor va nechtasi band.

### Joy tugadi

```text
$ head -c 5M /dev/zero > /mnt/kichik/katta.log; echo "kod: $?"
head: error writing 'standard output': No space left on device
kod: 1
$ df -h /mnt/kichik
Filesystem      Size  Used Avail Use% Mounted on
sinov           4.0M  4.0M     0 100% /mnt/kichik
$ echo salom > /mnt/kichik/yangi.txt; echo "kod: $?"
-bash: echo: write error: No space left on device
kod: 1
```

4 MB dan keyin yozish to'xtadi, `Use%` 100. Endi hech kim bu fayl tizimiga hech narsa yoza olmaydi.

### Inode tugadi

Joy bo'shatamiz, lekin bo'sh fayllar ko'p yaratamiz:

```text
$ rm /mnt/kichik/katta.log /mnt/kichik/yangi.txt
$ mkdir /mnt/kichik/kesh
$ for i in $(seq 1 100); do touch /mnt/kichik/kesh/s$i 2>/dev/null || { echo "$i-faylda xato"; break; }; done
63-faylda xato
$ touch /mnt/kichik/yana
touch: cannot touch '/mnt/kichik/yana': No space left on device
$ df -h /mnt/kichik
Filesystem      Size  Used Avail Use% Mounted on
sinov           4.0M     0  4.0M   0% /mnt/kichik
$ df -i /mnt/kichik
Filesystem     Inodes IUsed IFree IUse% Mounted on
sinov              64    64     0  100% /mnt/kichik
```

Klassik tuzoq: `df -h` — `0%` band, `4.0M` bo'sh, lekin fayl yaratib bo'lmaydi va xato o'sha — `No space left on device`. Sabab `df -i` da: inode'lar 100%. Har fayl (bo'sh bo'lsa ham) bitta inode oladi. Real serverlarda buni millionlab mayda fayl qoldiradigan dasturlar (kesh, sessiya fayllari, navbatdagi xatlar) qiladi.

Inode'ni kim yeganini `du --inodes` topadi (du(1): bloklar o'rniga inode'lar soni):

```text
$ du --inodes -x /mnt/kichik | sort -n
63	/mnt/kichik/kesh
64	/mnt/kichik
$ rm -r /mnt/kichik/kesh
$ df -i /mnt/kichik
Filesystem     Inodes IUsed IFree IUse% Mounted on
sinov              64     1    63    2% /mnt/kichik
$ umount /mnt/kichik
```

`-x` — faqat shu fayl tizimi ichida qolish (du(1)): boshqa ulangan disklarni sanamaslik.

<div data-animatsiya="qadamli" data-nom="disk"></div>

## Joyni nima egallagan

10-bobdagi usul — ildizdan boshlab pog'onama-pog'ona eng katta papkaga tushish. `-x` bilan `/proc`, `/run`, `/tmp` kabi boshqa fayl tizimlari sanalmaydi:

```text
$ du -xh --max-depth=1 / 2>/dev/null | sort -h | tail -5
2.5K	/root
368K	/etc
16M	/var
135M	/usr
151M	/
$ journalctl --disk-usage
Archived and active journals take up 8.0M in the file system.
$ dpkg -l 'linux-image-*' 2>&1 | tail -1
dpkg-query: no packages found matching linux-image-*
```

Eng kattasi `/usr` (dasturlar), keyin `/var` — serverda odatda aynan `/var` o'sadi: loglar, jurnal, keshlar, ma'lumotlar bazalari. Keyingi qadam: `du -xh --max-depth=1 /var | sort -h | tail -5` va hokazo.

Agar `df` to'la desa, `du` esa shuncha joyni topa olmasa — o'chirilgan, lekin ochiq fayl (10-bob). Debian Reference (9.8.12) ularni hajmi bilan ko'rish uchun `lsof -s -X / | grep deleted` ni beradi; 10-bobdagi `lsof +L1` ham shu ishni qiladi. Yechim — faylni ochib turgan jarayonni qayta ishga tushirish yoki keyingi safar faylni o'chirmasdan bo'shatish (`: > fayl`).

## VPS'da: haqiqiy disk

```text vps
$ df -h /
Filesystem      Size  Used Avail Use% Mounted on
/dev/vda3        40G  1.5G   36G   4% /
$ df -i /
Filesystem      Inodes IUsed   IFree IUse% Mounted on
/dev/vda3      2513920 48758 2465162    2% /
$ du -xh --max-depth=1 / 2>/dev/null | sort -h | tail -6
60K	/root
4.9M	/etc
135M	/boot
427M	/var
930M	/usr
1.5G	/
$ tune2fs -l /dev/vda3 | grep -E "^(Block count|Reserved block count|Block size)"
Block count:              10459072
Reserved block count:     522938
Block size:               4096
```

- `df -h`: 40 GB, 1.5 GB band, lekin bo'sh joy 36 GB — 38.5 emas.
- `df -i`: 2.5 million inode, 2% band — bu serverda inode muammosi yo'q.
- `du` — eng katta papkalar.

### Root uchun zaxira

`Size - Used ≠ Avail` farqi tasodif emas. mke2fs(8): ext4 yaratilganda bloklarning **5%** i super-foydalanuvchi (root) uchun zaxiralanadi — oddiy jarayonlar yozolmay qolganda ham root'ning xizmatlari (masalan, loglar) ishlashda davom etishi uchun. `tune2fs -l` dagi raqamlar: 522938 / 10459072 = 5%, 522938 × 4096 bayt ≈ 2 GiB.

Amaliy oqibat: oddiy foydalanuvchi uchun disk "to'lgan" bo'lishi mumkin, root esa hali yozadi. `df` dagi `Avail` — oddiy foydalanuvchi uchun qolgan joy.

### Jurnal

```text vps
$ journalctl --disk-usage
Archived and active journals take up 116.4M in the file system.
$ journalctl --vacuum-size=50M 2>&1 | tail -1 | sed -E 's|journal/[0-9a-f]{32}|journal/MASHINA-ID|'
Vacuuming done, freed 84.4M of archived journals from /var/log/journal/MASHINA-ID.
$ journalctl --disk-usage
Archived and active journals take up 32M in the file system.
```

- 37-bobda ko'rgan journald.conf(5): jurnal fayl tizimining ko'pi bilan 10% ini (`SystemMaxUse=`) egallaydi, 15% (`SystemKeepFree=`) bo'sh qoldiradi, har biri ko'pi bilan 4G. 40 GB lik diskda bu — 4 GB gacha jurnal.
- `--vacuum-size=50M` — journalctl(1): **arxivlangan** jurnal fayllarining eskilarini, ular egallagan joy 50M dan kamayguncha o'chiradi. Joriy (faol) fayllarga tegmaydi, shuning uchun natija 50M dan oshishi mumkin (bizda 32M qoldi).
- Chiqishdagi papka nomi — mashina identifikatori (machine-id). U maxfiy (machine-id(5), 44-bob), shuning uchun buyruqqa `sed` qo'shib, uni yashirdik.

Doimiy cheklov kerak bo'lsa — `/etc/systemd/journald.conf` dagi `SystemMaxUse=` (37-bob).

### apt keshi va eski yadrolar

```text vps
$ du -sh /var/cache/apt/archives
4.7M	/var/cache/apt/archives
$ apt-get clean
$ du -sh /var/cache/apt/archives
8.0K	/var/cache/apt/archives
$ uname -r
7.0.0-42-generic
$ dpkg -l "linux-image-*" | grep ^ii
ii  linux-image-7.0.0-38-generic          7.0.0-38.38  amd64        Signed kernel image generic
ii  linux-image-7.0.0-42-generic          7.0.0-42.42  amd64        Signed kernel image generic
ii  linux-image-virtual                   7.0.0-42.42  amd64        Virtual Linux kernel image
$ du -sh /lib/modules/*
172M	/lib/modules/7.0.0-38-generic
173M	/lib/modules/7.0.0-42-generic
$ apt-get -s autoremove | tail -1
0 upgraded, 0 newly installed, 0 to remove and 5 not upgraded.
$ apt-mark showmanual | grep linux-image
linux-image-7.0.0-38-generic
linux-image-virtual
```

- apt-get(8): `clean` — `/var/cache/apt/archives/` dagi yuklab olingan paket fayllarini o'chiradi. Ular o'rnatilgan dasturlarga kerak emas — kerak bo'lsa qayta yuklanadi.
- Yadrolar: ikkitasi o'rnatilgan, ishlayotgani — `7.0.0-42` (33-bobda VPS qayta yondirilgandan beri). Har birining modullari ~170 MB.
- `autoremove` hech narsani o'chirmadi. apt-get(8): u faqat **avtomatik** o'rnatilgan va endi kerak bo'lmagan paketlarni o'chiradi. `apt-mark showmanual` ko'rsatadiki, eski `7.0.0-38` yadro "qo'lda o'rnatilgan" deb belgilangan (provayder shablonidan), shuning uchun apt uni o'zi o'chirmaydi.

Eski yadroni o'chirish — `apt purge linux-image-7.0.0-38-generic` (24-bob). Biz uni qoldirdik: yangi yadro bilan muammo bo'lsa, yonishda eskisini tanlash mumkin. Ishlayotgan yadroni (`uname -r`) hech qachon o'chirmang.

## Tartib: disk to'lganda

1. `df -h` va `df -i` — qaysi fayl tizimi, joymi yoki inode'mi.
2. Tezkor joy kerak bo'lsa — xavfsiz tozalashlar: `journalctl --vacuum-size=`, `apt-get clean`.
3. `du -xh --max-depth=1` (yoki `du --inodes -x`) bilan aybdor papkaga tushish.
4. `df` va `du` mos kelmasa — `lsof +L1`.
5. Sababini tuzatish: logni aylantirish (logrotate, 37-bob), jurnalga cheklov, dasturning kesh tozalashi — aks holda disk yana to'ladi.

## Debian va Ubuntu

| | Debian 12 (trenajor) | Ubuntu 26.04 (VPS) |
| --- | --- | --- |
| Asosiy fayl tizimi | 9p (brauzer), to'ldirib bo'lmaydi | ext4, 5% root zaxirasi |
| Jurnal hajmi | 8 MB | 116 MB → tozalangandan keyin 32 MB |
| Yadro paketlari | o'rnatilmagan: yadroni brauzer emulyatori yuklaydi | 2 ta, eskisi "qo'lda" belgilangan |

## Tipik xatolar

**1. Faqat `df -h` ga qarash.**
Joy bor, fayl yaratib bo'lmaydi — inode'lar tugagan.
To'g'risi: `df -i` ham.

**2. Katta log faylni ishlab turgan servisda `rm` qilish.**
Joy bo'shamaydi: fayl ochiq (10-bob).
To'g'risi: `: > fayl` yoki servisni qayta ishga tushirish.

**3. `/var/log/journal` ichidagi fayllarni qo'lda o'chirish.**
journald ishlayotgan faylni buzish mumkin.
To'g'risi: `journalctl --vacuum-size=` / `--vacuum-time=`.

**4. Ishlayotgan yadroni yoki "keraksiz" ko'ringan tizim papkalarini o'chirish.**
Server yonmay qolishi mumkin.
To'g'risi: `uname -r` ni tekshirish, yadrolarni apt orqali o'chirish.

**5. Faqat tozalab, sababni qoldirish.**
Disk bir necha kundan keyin yana to'ladi.
To'g'risi: logrotate, jurnal cheklovi, monitoring.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=54-disk)** "Disk to'ldi": `/mnt/m54` ga fayl yozib bo'lmayapti, lekin `df -h` joy bor deydi. Sababni topib, aybdor papkani aniqlaysiz va tozalaysiz.

Savollar:

1. `df -h` — 40% band, lekin `touch` — `No space left on device`. Nimani tekshirasiz?
2. Inode'larni qaysi papka yeganini qanday topasiz?
3. `df -h` da `Size 40G`, `Used 1.5G`, `Avail 36G`. Qolgan 2.5 GB qayerda?
4. `journalctl --vacuum-size=50M` dan keyin `--disk-usage` 50M dan katta. Nega?
5. `apt autoremove` eski yadroni o'chirmadi. Nega bo'lishi mumkin?

<details>
<summary>Javoblar</summary>

1. `df -i` — inode'lar tugagan bo'lishi mumkin.
2. `du --inodes -x PAPKA | sort -n`.
3. Asosan ext4 ning root uchun 5% zaxirasi (`tune2fs -l` dagi `Reserved block count`), qolgani yaxlitlash.
4. Vacuum faqat arxivlangan fayllarni o'chiradi, faol jurnal fayllari qoladi.
5. `autoremove` faqat avtomatik o'rnatilgan paketlarni o'chiradi; yadro "qo'lda" (`apt-mark showmanual`) belgilangan.

</details>

## Kitob tugadi

Bu — Linux qo'llanmasining oxirgi bobi. Endi sizda serverni boshqarish uchun kerakli asos bor: fayllar va ruxsatlar, jarayonlar va servislar, tarmoq va SSH, skriptlar va muammolarni topish. Keyingi qadam — shu server ustida haqiqiy xizmatlar: Nginx va HTTPS, ma'lumotlar bazasi, deploy. Ular uchun alohida qo'llanmalar tayyorlanmoqda.

## Rasmiy hujjat

- [Debian Reference 9.8.12](https://www.debian.org/doc/manuals/debian-reference/ch09.en.html#_invisible_disk_space_consumption) — ko'rinmaydigan disk sarfi
- [df(1)](https://manpages.debian.org/bookworm/coreutils/df.1.en.html) · [du(1)](https://manpages.debian.org/bookworm/coreutils/du.1.en.html) — `-i`, `--inodes`, `-x`
- [tmpfs(5)](https://man7.org/linux/man-pages/man5/tmpfs.5.html) — `size=`, `nr_inodes=`
- [mke2fs(8)](https://manpages.debian.org/bookworm/e2fsprogs/mke2fs.8.en.html) — `-m`: root uchun 5% zaxira · [tune2fs(8)](https://manpages.debian.org/bookworm/e2fsprogs/tune2fs.8.en.html) — `-l`
- [journalctl(1)](https://www.freedesktop.org/software/systemd/man/latest/journalctl.html) — `--disk-usage`, `--vacuum-size=` · [journald.conf(5)](https://www.freedesktop.org/software/systemd/man/latest/journald.conf.html) — `SystemMaxUse=`
- [apt-get(8)](https://manpages.debian.org/bookworm/apt/apt-get.8.en.html) — `clean`, `autoremove`
