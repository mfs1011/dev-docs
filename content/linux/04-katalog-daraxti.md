# 04 — Katalog daraxti

[← Oldingi: Yordamni topish](03-yordam.md) · [Mundarija](README.md) · [Keyingi: Fayllar bilan ishlash →](05-fayllar.md)

## Tushuncha

Windows'da har disk alohida harf bilan belgilanadi: `C:`, `D:`. Linux'da esa **bitta daraxt** bor. U `/` dan, ya'ni **ildiz** (root directory) papkadan boshlanadi. Boshqa disklar, USB-fleshkalar va hatto yadroning ma'lumotlari ham shu daraxtning biror papkasiga ulanadi (mount, 10-bob).

```text
/                      ← ildiz
├── etc/               ← sozlamalar (konfiguratsiya)
├── home/              ← oddiy foydalanuvchilarning uy papkalari
├── root/              ← root foydalanuvchining uy papkasi
├── usr/               ← o'rnatilgan dasturlar (paketlardan)
│   ├── bin/           ← buyruqlar: ls, bash, systemctl ...
│   ├── lib/           ← kutubxonalar va ichki fayllar
│   ├── share/         ← umumiy fayllar: man sahifalari, hujjatlar
│   └── local/         ← administrator o'zi o'rnatgan dasturlar
├── var/               ← o'zgarib turadigan ma'lumot
│   ├── log/           ← loglar
│   ├── lib/           ← dasturlarning doimiy ma'lumoti (bazalar)
│   └── cache/         ← kesh: o'chirsa ham bo'ladi
├── tmp/               ← vaqtinchalik fayllar
├── run/               ← ishlab turgan tizimning ma'lumoti (xotirada)
├── srv/               ← server tarqatadigan ma'lumot
├── opt/               ← qo'shimcha (add-on) dasturlar
└── dev/  proc/  sys/  ← maxsus fayl tizimlari (9-bob)
```

Bu tartib o'ylab topilmagan. Uni ikki hujjat belgilaydi:

- **FHS** (Filesystem Hierarchy Standard, 3.0) — Linux Foundation standarti.
- **file-hierarchy(7)** — systemd loyihasining hujjati.

Debian va Ubuntu shu tartibga amal qiladi. Shuning uchun notanish serverda ham log qayerda, sozlama qayerda ekanini oldindan bilasiz.

Trenajorda ildizga qarang:

```text
$ ls /
bin  boot  dev	etc  home  lib	media  mnt  opt  proc  root  run  sbin	srv  sys  tmp  usr  var
```

## Papkalar: nima qayerda

Quyidagi tavsiflar file-hierarchy(7) (Debian 12 dagi systemd 252 versiyasi) va FHS 3.0 dan olingan.

| Papka | Nima turadi | Muhim jihati |
| --- | --- | --- |
| `/etc` | Shu tizimning sozlamalari | Paketlar odatda tayyor sozlama fayllarini qo'yadi. Ilova esa sozlama bo'lmasa ham standart qiymatlar bilan ishlay olishi kerak |
| `/home` | Oddiy foydalanuvchilarning uy papkalari | Tizim (servis) foydalanuvchilari uchun **emas**. Dastur bu yo'lni qattiq yozib qo'ymasdan, `$HOME` orqali ishlatishi kerak |
| `/root` | root'ning uy papkasi | `/home` dan tashqarida joylashgan: `/home` ulanmagan bo'lsa ham root tizimga kira olishi uchun |
| `/usr` | Paketlardan o'rnatilgan tizim fayllari | Administrator uni **qo'lda o'zgartirmasligi kerak**. O'zgarish faqat paket o'rnatish va o'chirishda bo'ladi |
| `/usr/bin` | `$PATH` dagi buyruqlar | Shelldan chaqirilmaydigan dasturlar (daemon'lar) `/usr/lib/` ostiga qo'yiladi |
| `/usr/lib` | Kutubxonalar va dasturlarning ichki fayllari | Masalan, `/usr/lib/systemd/system/` — paketlar bergan systemd unit'lari |
| `/usr/share` | Arxitekturaga bog'liq bo'lmagan umumiy fayllar | Man sahifalari, hujjatlar, vaqt zonalari, shriftlar |
| `/usr/local` | Administrator **o'zi** o'rnatgan dasturlar | FHS: tizim yangilanganda bu yer qayta yozilmasligi kerak |
| `/var` | O'zgarib turadigan, saqlanib qoladigan ma'lumot | Tizim ishlayotganda yoziladi |
| `/var/log` | Loglar | Ko'p loglar systemd journal'ga yoziladi (37-bob) |
| `/var/lib` | Dasturlarning doimiy ma'lumoti | Masalan, ma'lumotlar bazasi fayllari |
| `/var/cache` | Kesh | O'chirilsa, dastur ishlayveradi, faqat kesh qayta yaratilguncha sekinroq bo'ladi |
| `/var/tmp` | Katta va qayta ishga tushirishdan keyin ham saqlanadigan vaqtinchalik fayllar | Uzoq vaqt ishlatilmagan fayllar avtomatik tozalanishi mumkin |
| `/tmp` | Kichik vaqtinchalik fayllar | Odatda tizim yonganda tozalanadi. Katta fayllar uchun `/var/tmp` ishlatiladi |
| `/run` | Ishlab turgan tizimning ma'lumoti: socket'lar, PID fayllar | tmpfs, ya'ni xotirada. Har yonishda tozalanadi |
| `/srv` | Server tarqatadigan ma'lumot | Ichki tuzilishini administrator belgilaydi |
| `/opt` | Qo'shimcha (add-on) dastur paketlari | FHS: har biri o'z `/opt/<paket>` papkasida |
| `/boot` | Yuklash uchun fayllar: yadro, initramfs | Faqat yangi yadro yoki yuklovchi o'rnatilganda o'zgaradi (33-bob) |
| `/dev`, `/proc`, `/sys` | Qurilmalar, jarayonlar va yadro ma'lumoti | Diskdagi papka emas, yadro yaratadigan maxsus fayl tizimlari (9-bob) |
| `/media`, `/mnt` | Disklarni ulash joyi | `/media` — almashtiriladigan disklar, `/mnt` — vaqtincha qo'lda ulash |

<div data-animatsiya="daraxt"></div>

Buni o'zingiz tekshiring:

```text
$ ls /usr
bin  games  include  lib  libexec  local  sbin	share  src
$ ls /var
backups  cache	lib  local  lock  log  mail  opt  run  spool  tmp
$ ls /usr/lib/systemd/system | head -5
apt-daily-upgrade.service
apt-daily-upgrade.timer
apt-daily.service
apt-daily.timer
autovt@.service
```

## merged-/usr: `/bin` aslida `/usr/bin`

Eski Unix tizimlarida dasturlar ikki joyga bo'lingan edi: yuklash uchun zarurlari `/bin` va `/lib` da, qolganlari `/usr/bin` va `/usr/lib` da. Hozirgi Debian va Ubuntu'da ular bitta joyda turadi. Eski yo'llar esa yangisiga ishora qiluvchi **havola** (symlink, 6-bob) bo'lib qolgan:

```text
$ ls -ld /bin /sbin /lib /var/run
lrwxrwxrwx 1 root root 7 Feb 16  2025 /bin -> usr/bin
lrwxrwxrwx 1 root root 7 Dec 18  2022 /lib -> usr/lib
lrwxrwxrwx 1 root root 8 Oct 19  2022 /sbin -> usr/sbin
lrwxrwxrwx 1 root root 4 Nov  5 10:43 /var/run -> /run
```

`ls -l` chiqishining boshidagi `l` harfi va `->` belgisi havolani bildiradi. file-hierarchy(7) bu havolalarni **moslik havolalari** (compatibility symlinks) deb ataydi: eski yo'lni yozgan skriptlar ham kerakli dasturni topaveradi. Shuning uchun `#!/bin/bash` va `#!/usr/bin/bash` bir xil faylga olib boradi.

Buyruq qayerda turganini ko'rish:

```text
$ command -v systemctl bash cron
/usr/bin/systemctl
/usr/bin/bash
/usr/sbin/cron
```

`/usr/sbin` da asosan administrator buyruqlari turadi. Ular odatda root huquqi bilan ishlatiladi.

## Dasturchi uchun: ilovaning fayllari qayerga

Serverga o'z ilovangizni (masalan, Node.js yoki Python xizmatini) qo'yayotganda, uning fayllari shu daraxtga mos joylashtiriladi. Standartlar har tur fayl uchun joyni belgilaydi:

| Nima | Qayerga | Asos |
| --- | --- | --- |
| Ilova kodi | `/opt/ilova/` yoki `/srv/ilova/` | FHS: `/opt` — qo'shimcha dasturlar, `/srv` — server tarqatadigan ma'lumot |
| Sozlama | `/etc/ilova/` | `/etc` — shu tizimning sozlamalari |
| Doimiy ma'lumot (SQLite bazasi, yuklangan fayllar) | `/var/lib/ilova/` | `/var/lib` — dasturlarning doimiy ma'lumoti |
| Kesh | `/var/cache/ilova/` | O'chirilsa, ilova uni qayta yaratadi |
| Loglar | systemd journal yoki `/var/log/ilova/` | 37-bob |
| Socket, PID fayl | `/run/ilova/` | Xotirada, har yonishda tozalanadi |

Kodni qayerga qo'yish bo'yicha bir nechta yo'l bor, ularning har biri o'z asosiga ega:

| Variant | Qachon mos | Kamchiligi |
| --- | --- | --- |
| `/opt/ilova` | Ilova o'zi bilan kelgan bitta papka bo'lib o'rnatiladi (kod + bog'liqliklar) | FHS bo'yicha bu yer "statik" fayllar uchun: ilova o'zgaradigan ma'lumotni `/opt` ga emas, `/var/lib` ga yozishi kerak |
| `/srv/ilova` | Server "tarqatadigan" narsa: sayt, API, fayllar | FHS uning ichki tuzilishini belgilamaydi. Jamoa kelishib olishi kerak |
| `/home/deploy/ilova` | Bitta foydalanuvchi qo'lda deploy qiladi | file-hierarchy(7) ga ko'ra `/home` tizim (servis) foydalanuvchilari uchun emas. Ruxsatlar chalkashib ketadi (7-bob) |
| `/usr/local/bin/ilova` | Bitta bajariladigan fayl (masalan, Go'da yozilgan dastur) | Faqat dasturning o'zi uchun. Ma'lumot va sozlama baribir `/var/lib` va `/etc` ga boradi |

systemd servisida bu papkalarni systemd'ning o'zi yaratib bera oladi (`StateDirectory=`, `LogsDirectory=` va boshqalar, 35-bob).

## Debian va Ubuntu: farqlar

Asosiy tuzilish bir xil. VPS'dagi farqlar:

```text vps
$ ls -ld /lib64 /lost+found
lrwxrwxrwx 1 root root     9 Aug 24 13:33 /lib64 -> usr/lib64
drwx------ 2 root root 16384 Oct 28 11:31 /lost+found
$ findmnt -n -o TARGET,FSTYPE /
/ ext4
$ findmnt -n -o TARGET,FSTYPE /tmp
/tmp tmpfs
```

- **`/lib64`** — 64-bitli tizimdagi moslik havolasi. file-hierarchy(7) ga ko'ra u dinamik yuklovchi (dynamic loader) shu yo'lda turishi kerak bo'lgan arxitekturalarda bo'ladi. VPS'da u yerda `ld-linux-x86-64.so.2` turibdi. 32-bitli trenajorda bu havola yo'q.
- **`/lost+found`** — ext4 fayl tizimining papkasi. mklost+found(8) ga ko'ra `e2fsck` buzilgan fayl tizimini tiklayotganda topgan "egasiz" fayllarni shu yerga joylaydi. Trenajorning ildizi ext4 emas, shuning uchun unda bu papka yo'q.
- **`/tmp` xotirada (tmpfs).** Debian 13 reliz izohlariga ko'ra, trixie'dan boshlab `/tmp` standart holatda tmpfs'da, ya'ni xotirada turadi. U tezroq ishlaydi, lekin katta fayl xotirani to'ldirib qo'yishi mumkin. Unga xotiraning ko'pi bilan 50% i ajratiladi. VPS'dagi Ubuntu 26.04 da ham `/tmp` tmpfs. Debian 12 da esa standart holatda `/tmp` oddiy papka. Trenajorda biz uni Debian 13 dagidek tmpfs qilib qo'yganmiz. Debian 12 da buning uchun tayyor `tmp.mount` unit'i bor (`/usr/share/systemd/tmp.mount`), u `/etc/systemd/system/` ga nusxalanib yoqiladi:

```text
$ findmnt -n -o TARGET,FSTYPE /tmp
/tmp   tmpfs
$ findmnt -n -o TARGET,FSTYPE /run
/run   tmpfs
```

Xulosa: **katta fayllarni `/tmp` ga emas, `/var/tmp` ga yozing**.

- **`/var/log`.** VPS'da `syslog` va `auth.log` kabi matnli loglar bor, trenajorda esa faqat systemd journal (`journal/`). Bu farq 37-bobda tushuntiriladi.

## Tipik xatolar

**1. O'z fayllarini `/usr/bin` yoki `/usr/lib` ga qo'yish.**
`/usr` ni paket menejeri boshqaradi. Paket yangilanganda u yerdagi fayllaringiz qayta yozilishi yoki o'chirilishi mumkin.
To'g'risi: qo'lda o'rnatilgan dasturlar uchun `/usr/local/bin`, ilovalar uchun `/opt/<ilova>`.

**2. Paket bergan faylni `/usr/lib/systemd/system/` da tahrirlash.**
Paket yangilanganda tahririm yo'qoladi.
To'g'risi: `/etc` dagi nusxa yoki "drop-in" fayl (36-bob). `/etc` dagi sozlama `/usr` dagisidan ustun turadi.

**3. Katta fayllarni `/tmp` ga yozish.**
Debian 13 va Ubuntu 26.04 da `/tmp` xotirada turadi. Katta fayl serverning xotirasini egallaydi, `/tmp` dagi fayllar esa qayta ishga tushirishda yo'qoladi.
To'g'risi: katta yoki saqlanishi kerak bo'lgan vaqtinchalik fayllar uchun `/var/tmp`.

**4. Ilova ma'lumotini kod papkasiga yozish.**
Masalan, `/opt/ilova/data.db`. Yangi versiyani deploy qilganda bu papka almashtiriladi va baza o'chib ketishi mumkin.
To'g'risi: kod `/opt/ilova` da, ma'lumot `/var/lib/ilova` da.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=04-katalog-daraxti)** "Ilovaga joy tayyorlash": trenajorda daraxt bo'ylab yurasiz va ilova uchun standart papkalarni yaratasiz.

Savollar:

1. `nginx` paketining sozlamalari qaysi papkada bo'lishini kutasiz? Ma'lumotlari va loglari-chi?
2. Nega root'ning uy papkasi `/home/root` emas, `/root`?
3. `#!/bin/sh` deb yozilgan skript merged-/usr tizimida qaysi faylni ishga tushiradi?
4. 2 GB lik vaqtinchalik faylni qayerga yozasiz va nega?

<details>
<summary>Javoblar</summary>

1. Sozlamalar `/etc` ostida: Debian'ning `nginx-common` paketi `/etc/nginx/nginx.conf` faylini o'rnatadi. Loglar `/var/log` ostida, doimiy ma'lumot `/var/lib` ostida, dastur fayllari esa `/usr` ostida bo'ladi. Aniq yo'llarni "Nginx" kitobida o'rnatib ko'ramiz.
2. file-hierarchy(7) ga ko'ra `/home` ulanmagan yoki ishlamay qolgan bo'lsa ham root tizimga kira olishi uchun.
3. `/usr/bin/sh`, chunki `/bin` — `usr/bin` ga havola.
4. `/var/tmp` ga. `/tmp` xotirada turishi mumkin va u kichik vaqtinchalik fayllar uchun mo'ljallangan.

</details>

## Rasmiy hujjat

- [file-hierarchy(7) — Debian 12 (systemd 252)](https://manpages.debian.org/bookworm/systemd/file-hierarchy.7.en.html)
- [file-hierarchy(7) — systemd (latest)](https://www.freedesktop.org/software/systemd/man/latest/file-hierarchy.html) — so'nggi versiyada tavsif [UAPI.9 Linux File System Hierarchy](https://uapi-group.org/specifications/specs/linux_file_system_hierarchy/) spetsifikatsiyasiga ko'chirilgan
- [Filesystem Hierarchy Standard 3.0](https://refspecs.linuxfoundation.org/FHS_3.0/fhs/index.html)
- [hier(7)](https://man7.org/linux/man-pages/man7/hier.7.html)
- [Debian Reference 1.2.1 — Unix file basics](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_unix_file_basics)
- [Ubuntu Server — The Filesystem Hierarchy Standard](https://ubuntu.com/server/docs/tutorial/welcome-to-the-terminal/)
- [Debian 13 release notes — /tmp is now stored in a tmpfs](https://www.debian.org/releases/trixie/release-notes/issues.en.html)
- [mklost+found(8)](https://manpages.debian.org/bookworm/e2fsprogs/mklost+found.8.en.html)
- [systemd.exec(5) — StateDirectory=](https://www.freedesktop.org/software/systemd/man/latest/systemd.exec.html)
