# 07 — Ruxsatlar

[← Oldingi: Inode va havolalar](06-inode-va-havolalar.md) · [Mundarija](README.md) · [Keyingi: Maxsus bitlar va ACL →](08-maxsus-bitlar-va-acl.md)

## Tushuncha

Serverda bir nechta foydalanuvchi va servis ishlaydi: siz, deploy foydalanuvchisi, `www-data` (veb-server), `postgres` (baza). Ruxsatlar har birining **qaysi faylni o'qishi, o'zgartirishi va ishga tushirishi mumkinligini** belgilaydi. "Permission denied" xatosining 90% i shu bobdagi narsalardan kelib chiqadi.

Debian Reference'ga ko'ra ruxsatlar uch toifa foydalanuvchi uchun alohida beriladi:

| Toifa | Harf | Kim |
| --- | --- | --- |
| Egasi (user) | `u` | Faylning egasi |
| Guruh (group) | `g` | Fayl tegishli bo'lgan guruhning boshqa a'zolari |
| Boshqalar (others) | `o` | Qolgan hamma |

Har toifa uchun uchta huquq bor. Ular **fayl** va **papka** uchun turlicha ishlaydi:

| Huquq | Faylda | Papkada |
| --- | --- | --- |
| `r` (read) | Mazmunini o'qish | Ichidagi nomlar ro'yxatini ko'rish |
| `w` (write) | Mazmunini o'zgartirish | Ichiga fayl qo'shish va **o'chirish** |
| `x` (execute) | Buyruq sifatida ishga tushirish | Ichiga kirish va undagi fayllarga murojaat qilish |

## `ls -l` ni o'qish

```text
$ ls -l /etc/passwd /etc/shadow
-rw-r--r-- 1 root root   1037 Nov  5 11:24 /etc/passwd
-rw-r----- 1 root shadow  580 Nov  5 11:24 /etc/shadow
```

```text
 -   rw-   r--   r--   1   root   root   1037  ...  /etc/passwd
 │    │     │     │    │    │      │
 │    │     │     │    │    │      └── guruh
 │    │     │     │    │    └── egasi
 │    │     │     │    └── hard link'lar soni (6-bob)
 │    │     │     └── boshqalar (o): faqat o'qish
 │    │     └── guruh (g): faqat o'qish
 │    └── egasi (u): o'qish va yozish
 └── fayl turi
```

Birinchi belgi — fayl turi. Debian Reference'dagi ro'yxat:

| Belgi | Tur |
| --- | --- |
| `-` | Oddiy fayl |
| `d` | Papka |
| `l` | Symlink |
| `c`, `b` | Qurilma fayllari (9-bob) |
| `p` | Nomli pipe |
| `s` | Socket |

`/etc/passwd` ni hamma o'qiy oladi: unda foydalanuvchilar ro'yxati bor, parollar yo'q. Parol xeshlari `/etc/shadow` da turadi va uni faqat root va `shadow` guruhi o'qiy oladi (22-bob).

## Tajriba: ikki foydalanuvchi

Trenajorda ikki foydalanuvchi va bitta guruh yaratamiz (`useradd` va `usermod` — 22-bob). `runuser -u ali -- buyruq` buyruqni `ali` nomidan bajaradi. Bu shunchaki boshqa foydalanuvchi bo'lib tekshirishning qulay yo'li.

```text
$ useradd -m ali && useradd -m vali && groupadd jamoa && usermod -aG jamoa ali
$ id ali
uid=1000(ali) gid=1000(ali) groups=1000(ali),1002(jamoa)
$ mkdir -p /tmp/rx && cd /tmp/rx
$ echo "maxfiy" > sir.txt
$ ls -l sir.txt
-rw-r--r-- 1 root root 7 Nov  5 11:24 sir.txt
$ runuser -u ali -- cat sir.txt
maxfiy
```

Fayl hamma uchun o'qiladigan bo'lib yaratildi (`r--` boshqalarda). Buning sababi `umask`, uni pastda ko'ramiz. Boshqalarning o'qish huquqini olib tashlaymiz:

```text
$ chmod o-r sir.txt
$ ls -l sir.txt
-rw-r----- 1 root root 7 Nov  5 11:24 sir.txt
$ runuser -u ali -- cat sir.txt
cat: sir.txt: Permission denied
```

Endi faylni `jamoa` guruhiga beramiz. `ali` shu guruhda, `vali` esa yo'q:

```text
$ chgrp jamoa sir.txt
$ chmod 640 sir.txt
$ ls -l sir.txt
-rw-r----- 1 root jamoa 7 Nov  5 11:24 sir.txt
$ runuser -u ali -- cat sir.txt
maxfiy
$ runuser -u vali -- cat sir.txt
cat: sir.txt: Permission denied
```

Server uchun odatiy usul shu: kerakli odamlar va servislarni bitta **guruh**ga qo'shib, faylni shu guruhga ochish.

## `chmod`: ikki xil yozuv

### Belgili yozuv

Debian Reference'dagi sintaksis: `chmod [ugoa][+-=][rwxXst] fayl`.

| Qism | Ma'nosi |
| --- | --- |
| `u`, `g`, `o`, `a` | Egasi, guruh, boshqalar, hammasi (all) |
| `+` / `-` / `=` | Qo'shish / olib tashlash / aynan shunday qilish |
| `r`, `w`, `x` | Huquqlar |
| `X` | Faqat papkalarga, yoki kimdadir allaqachon `x` bo'lgan fayllarga `x` beradi |

Misollar: `chmod u+x skript.sh`, `chmod go-w fayl`, `chmod o= maxfiy` (boshqalarning hamma huquqi olinadi).

### Sonli yozuv

Har bir huquqning qiymati bor: `r=4`, `w=2`, `x=1`. Ular har toifa uchun qo'shiladi:

<div data-animatsiya="ruxsat"></div>

| Son | Huquq | Odatiy ishlatilishi |
| --- | --- | --- |
| `644` | `rw-r--r--` | Oddiy fayl: hamma o'qiydi, egasi yozadi |
| `640` | `rw-r-----` | Sozlama fayli: egasi va guruhi o'qiydi |
| `600` | `rw-------` | Maxfiy: kalit, `.env`, parol. Faqat egasi |
| `755` | `rwxr-xr-x` | Dastur yoki papka: hamma kiradi va ishga tushiradi |
| `750` | `rwxr-x---` | Papka: egasi va guruhi kiradi, boshqalar kira olmaydi |
| `700` | `rwx------` | Shaxsiy papka |

Debian Reference'ning maslahati: ruxsatlarni skriptda tekshirmoqchi bo'lsangiz, `ls -l` chiqishini qirqmang, `stat` ishlating:

```text
$ stat -c '%a %A %U %G' sir.txt
640 -rw-r----- root jamoa
```

## Bajarish huquqi (`x`)

Skript fayli `x` huquqisiz ishga tushmaydi:

```text
$ echo 'echo salom' > ishga.sh
$ ./ishga.sh
-bash: ./ishga.sh: Permission denied
$ chmod u+x ishga.sh
$ ls -l ishga.sh
-rwxr--r-- 1 root root 11 Nov  5 11:24 ishga.sh
$ ./ishga.sh
salom
```

## Papkada `r` va `x` farqi

Papkada `r` — "ichidagi nomlarni ko'rish", `x` — "ichiga kirib, fayllarga murojaat qilish". Ular alohida ishlaydi:

```text
$ mkdir -p d && echo ichki > d/f && chmod 744 d
$ runuser -u ali -- ls d
f
$ runuser -u ali -- cat d/f
cat: d/f: Permission denied
$ chmod 711 d
$ runuser -u ali -- ls d
ls: cannot open directory 'd': Permission denied
$ runuser -u ali -- cat d/f
ichki
```

- `744` (boshqalarga faqat `r`): `ali` nomlarni ko'radi, lekin faylni ocha olmaydi.
- `711` (boshqalarga faqat `x`): nomlarni ko'ra olmaydi, lekin nomini bilsa, faylni ochadi.

Shuning uchun veb-server `/var/www/sayt/index.html` ni o'qishi uchun **yo'ldagi har bir papkada** unga `x` kerak. Fayldagi `r` ning o'zi yetmaydi.

## Faylni kim o'chiradi

Faylni o'chirish uchun **faylda emas, papkada** `w` kerak. O'chirish papkadagi nomlar ro'yxatini o'zgartiradi (6-bob):

```text
$ mkdir umumiy && chmod 777 umumiy && echo root > umumiy/root.txt && ls -l umumiy/root.txt
-rw-r--r-- 1 root root 5 Nov  5 11:24 umumiy/root.txt
$ runuser -u ali -- rm -f umumiy/root.txt
$ ls umumiy
```

`ali` root'ning faylini o'chirdi, garchi o'sha faylga yoza olmasa ham. Hammaga ochiq papkalarni (`/tmp` kabi) bundan **sticky bit** himoya qiladi (8-bob).

## Egasini o'zgartirish: `chown` va `chgrp`

```text
$ chown ali:jamoa ishga.sh
$ ls -l ishga.sh
-rwxr--r-- 1 ali jamoa 11 Nov  5 11:24 ishga.sh
$ runuser -u ali -- chown vali ishga.sh
chown: changing ownership of 'ishga.sh': Operation not permitted
```

Debian Reference'ga ko'ra egasini faqat root o'zgartiradi. Guruhni esa fayl egasi ham o'zgartira oladi, lekin faqat o'zi a'zo bo'lgan guruhga. `chown egasi:guruh` ikkalasini bir yo'la qo'yadi. `-R` esa papkani ichidagilari bilan birga o'zgartiradi.

Debian Reference'dagi misol: papkalar daraxtini bir guruh uchun umumiy qilish:

```text
$ chmod -R ug+rwX,o=rX d
$ ls -ld d d/f
drwxrwxr-x 2 root root 60 Nov  5 11:24 d
-rw-rw-r-- 1 root root  6 Nov  5 11:24 d/f
```

`X` tufayli papka `x` oldi, oddiy fayl esa bajariladigan bo'lib qolmadi.

## `umask`: yangi fayl qanday ruxsat bilan tug'iladi

Debian Reference'ga ko'ra yangi fayl va papkaning ruxsatini `umask` cheklaydi: so'ralgan ruxsatdan umask'dagi bitlar olib tashlanadi. Dasturlar odatda fayl uchun `666`, papka uchun `777` so'raydi.

```text
$ umask
0022
$ umask 077
$ touch yangi && mkdir yangid
$ ls -ld yangi yangid
-rw------- 1 root root  0 Nov  5 11:24 yangi
drwx------ 2 root root 40 Nov  5 11:24 yangid
$ umask 022
```

| umask | Yangi fayl | Yangi papka | Qachon |
| --- | --- | --- | --- |
| `022` | `rw-r--r--` | `rwxr-xr-x` | Standart: faqat egasi yozadi |
| `002` | `rw-rw-r--` | `rwxrwxr-x` | Guruh birga ishlaydi |
| `077` | `rw-------` | `rwx------` | Maxfiy ma'lumot bilan ishlaydigan servis |

Debian har bir foydalanuvchiga uning nomidagi shaxsiy guruhni yaratadi (user private group). Debian Reference'ga ko'ra shu sababli `002` ham xavfsiz bo'ladi: har kimning guruhida faqat o'zi bor. `umask` buyrug'i faqat joriy qobiqqa (shell) ta'sir qiladi. Doimiy qilish uchun u `~/.bashrc` ga yoziladi (15-bob), servis uchun esa systemd'dagi `UMask=` (39-bob).

## Debian va Ubuntu

Ruxsat qoidalari yadroniki, shuning uchun ular ikkala tizimda bir xil ishlaydi. Ubuntu 26.04 da `chmod` va `chown` rust-coreutils'dan keladi, lekin bu yerdagi xato xabari ikkalasida bir xil:

```text vps
$ chmod --version | head -1
chmod (uutils coreutils) 0.10.0
$ chmod 640 yoq
chmod: cannot access 'yoq': No such file or directory
```

## Tipik xatolar

**1. "Ishlamayapti — `chmod 777` qilib qo'yaman".**
Muammo yo'qoladi, lekin endi istalgan foydalanuvchi va istalgan buzilgan servis faylni o'zgartira oladi va o'chira oladi.
To'g'risi: kim kirishi kerakligini aniqlang (`ls -l`, `id`) va egasini yoki guruhini to'g'rilang (`chown`, `chgrp`). Huquqni faqat o'sha toifaga bering.

**2. Faylga `r` beriladi, lekin servis baribir o'qiy olmaydi.**
Yo'ldagi papkalardan birida `x` yo'q.
To'g'risi: yo'ldagi har bir papkani tekshiring. `namei -l` (util-linux) yo'lni pog'onama-pog'ona ko'rsatadi:

```text
$ mkdir -p /tmp/www/sayt && touch /tmp/www/sayt/index.html && chmod 700 /tmp/www
$ namei -l /tmp/www/sayt/index.html
f: /tmp/www/sayt/index.html
drwxr-xr-x root root /
drwxrwxrwt root root tmp
drwx------ root root www
drwxr-xr-x root root sayt
-rw-r--r-- root root index.html
```

`www` papkasi `700`: boshqalar undan o'ta olmaydi, `index.html` ning `r` huquqi ularga yordam bermaydi.

**3. Maxfiy fayl hammaga ochiq turadi.**
`.env` yoki SSH kaliti `644` bilan yaratilgan, chunki umask `022`.
To'g'risi: `chmod 600 .env`. SSH esa juda ochiq kalit faylini ishlatishdan bosh tortadi (45-bob).

**4. `chown -R` ni noto'g'ri papkada bajarish.**
`chown -R www-data /` kabi xato tizimni buzadi.
To'g'risi: yo'lni `ls -ld` bilan tekshirib, keyin bajaring.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=07-ruxsatlar)** "Ilova fayllariga to'g'ri ruxsat": sozlama faylini guruhga ochasiz, maxfiy kalitni yopasiz va skriptni ishga tushiriladigan qilasiz.

Savollar:

1. `750` qaysi belgili yozuvga teng?
2. Nega `chmod 644 papka` dan keyin hech kim (egasidan boshqa) papkaga kira olmaydi?
3. `ali` root'ga tegishli faylni o'chira oldi. Qanday qilib?
4. umask `027` bo'lsa, yangi fayl qanday ruxsat oladi?

<details>
<summary>Javoblar</summary>

1. `rwxr-x---` (`u=rwx,g=rx,o=`).
2. Papkada `x` yo'q: ichiga kirib, fayllarga murojaat qilib bo'lmaydi. Egasining ham `x` i yo'q (`rw-`), lekin root uchun ruxsat tekshirilmaydi.
3. Papkada uning `w` huquqi bor edi. O'chirish faylni emas, papkani o'zgartiradi.
4. `666` dan `027` olib tashlanadi: `640` (`rw-r-----`).

</details>

## Rasmiy hujjat

- [Debian Reference 1.2.3 — Filesystem permissions](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_filesystem_permissions)
- [Debian Reference 1.2.4 — umask](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_control_of_permissions_for_newly_created_files_umask)
- [Debian Reference 1.2.5 — Permissions for groups of users](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_permissions_for_groups_of_users_group)
- [Ubuntu Server — Users, groups, and permissions](https://ubuntu.com/server/docs/tutorial/welcome-to-the-terminal/)
- [GNU Coreutils — chmod, chown, chgrp invocation](https://www.gnu.org/software/coreutils/manual/coreutils.html#chmod-invocation)
- [GNU Coreutils — File permissions](https://www.gnu.org/software/coreutils/manual/coreutils.html#File-permissions)
- [credentials(7)](https://man7.org/linux/man-pages/man7/credentials.7.html)
- [runuser(1)](https://manpages.debian.org/bookworm/util-linux/runuser.1.en.html)
