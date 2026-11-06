# 08 — Maxsus bitlar va ACL

[← Oldingi: Ruxsatlar](07-ruxsatlar.md) · [Mundarija](README.md) · [Keyingi: Hamma narsa — fayl →](09-hamma-narsa-fayl.md)

## Tushuncha

7-bobdagi `rwx` bitlari ko'p ishni hal qiladi, lekin hammasini emas. Masalan:

- `/tmp` ga hamma yozadi. Unda nega boshqa foydalanuvchi sizning faylingizni o'chira olmaydi?
- Oddiy foydalanuvchi o'z parolini o'zgartiradi, parollar esa faqat root yoza oladigan `/etc/shadow` da turadi. Bu qanday ishlaydi?
- Jamoaning umumiy papkasida har kim yaratgan fayl avtomatik jamoa guruhida bo'lishi kerak.
- Bitta faylni **bitta qo'shimcha odamga** ochish kerak, guruhni o'zgartirmasdan.

Birinchi uchtasini **maxsus bitlar** (setuid, setgid, sticky) hal qiladi, to'rtinchisini **ACL** (Access Control List).

Bu bob misollari trenajorda `/tmp` da bajariladi (6-bobdagi izohga qarang). Avval ikki foydalanuvchi va umumiy guruh yarataylik:

```text
$ useradd -m ali && useradd -m vali && groupadd jamoa && usermod -aG jamoa ali && usermod -aG jamoa vali
```

## Uchta maxsus bit

Debian Reference'ga ko'ra oddiy `rwx` dan tashqari yana uchta bit bor. `ls -l` ularni `x` o'rnida ko'rsatadi:

| Bit | `ls -l` da | Faylda | Papkada |
| --- | --- | --- | --- |
| **setuid** | egasining `x` o'rnida `s` | Dastur **fayl egasi** nomidan ishlaydi | — |
| **setgid** | guruhning `x` o'rnida `s` | Dastur fayl guruhi nomidan ishlaydi | Ichida yaratilgan fayllar **papkaning guruhini** oladi |
| **sticky** | boshqalarning `x` o'rnida `t` | — | Faylni faqat uning **egasi** (yoki papka egasi, root) o'chira oladi |

Agar ostidagi `x` bo'lmasa, harf katta bo'ladi: `S` yoki `T`. Bu odatda xato belgisi: bit qo'yilgan, lekin ishga tushirish huquqi yo'q.

```text
$ mkdir -p /tmp/sb && cd /tmp/sb
$ touch f && chmod u+s f && ls -l f
-rwSr--r-- 1 root root 0 Nov  5 11:27 f
```

Sonli yozuvda ular to'rtinchi (eng chap) raqam bo'ladi: setuid `4`, setgid `2`, sticky `1`. Masalan, `chmod 2775`, `chmod 1777`.

<div data-animatsiya="qadamli" data-nom="sticky"></div>

### Sticky bit: `/tmp`

```text
$ ls -ld /tmp
drwxrwxrwt 7 root root 140 Nov  5 11:27 /tmp
$ runuser -u ali -- touch /tmp/ali.txt
$ runuser -u vali -- rm -f /tmp/ali.txt
rm: cannot remove '/tmp/ali.txt': Operation not permitted
$ ls -l /tmp/ali.txt
-rw-r--r-- 1 ali ali 0 Nov  5 11:27 /tmp/ali.txt
```

`/tmp` hammaga yozishga ochiq (`rwxrwxrwt`). 7-bobda ko'rganimizdek, papkaga yoza oladigan har kim undagi istalgan faylni o'chira olardi. Oxiridagi `t` (sticky) buni to'xtatadi: `vali` `ali` ning faylini o'chira olmadi.

Debian Reference ogohlantiradi: umumiy papkadagi faylni himoyalash uchun faylning `w` huquqini olib tashlashning o'zi yetmaydi. Papkaga sticky bit ham kerak. Aks holda papkaga yoza oladigan kishi faylni o'chirib, o'rniga shu nomli boshqa fayl qo'ya oladi.

### setuid: `passwd`

```text
$ ls -l /usr/bin/passwd
-rwsr-xr-x 1 root root 70476 Dec 14  2025 /usr/bin/passwd
```

Egasining `s` i `passwd` ni ishga tushirgan **har kim** uchun dastur **root** huquqi bilan ishlashini bildiradi. Shuning uchun u `/etc/shadow` ga yoza oladi. Dasturning o'zi esa faqat sizning parolingizni o'zgartirishga ruxsat beradi.

Debian Reference ogohlantiradi: setuid va setgid xavfsizlik xavfini tug'diradi, shuning uchun ularni yoqishda alohida ehtiyot bo'lish kerak. Tizimda setuid dasturlar ko'p emas va ularni bilib turish foydali:

```text
$ find /usr/bin /usr/sbin -perm -4000 -type f
/usr/bin/ping
/usr/bin/newgrp
/usr/bin/mount
/usr/bin/umount
/usr/bin/chfn
/usr/bin/chsh
/usr/bin/gpasswd
/usr/bin/passwd
/usr/bin/sudo
/usr/bin/su
```

(`find` — 19-bob.) Ro'yxatda bo'lmasligi kerak bo'lgan setuid dastur paydo bo'lsa, bu xavf belgisi. O'z skriptingizga setuid qo'ymang. Root kerak bo'lsa, `sudo` qoidasi yozing (23-bob).

### setgid papka: jamoa uchun umumiy joy

Debian Reference'ga ko'ra papkadagi setgid bit "BSD uslubidagi" yaratish tartibini yoqadi: papkada yaratilgan hamma fayl **papkaning guruhini** oladi. Ikki papkani solishtiramiz:

```text
$ mkdir oddiy umumiy && chgrp jamoa oddiy umumiy && chmod 775 oddiy && chmod 2775 umumiy
$ ls -ld oddiy umumiy
drwxrwxr-x 2 root jamoa 40 Nov  5 11:27 oddiy
drwxrwsr-x 2 root jamoa 40 Nov  5 11:27 umumiy
$ runuser -u ali -- touch oddiy/a umumiy/a
$ ls -l oddiy/a umumiy/a
-rw-r--r-- 1 ali ali   0 Nov  5 11:27 oddiy/a
-rw-r--r-- 1 ali jamoa 0 Nov  5 11:27 umumiy/a
```

`oddiy` da fayl `ali` ning shaxsiy guruhida yaratildi: jamoaning boshqa a'zolari uni guruh orqali ola olmaydi. `umumiy` da esa fayl avtomatik `jamoa` guruhida. Umumiy deploy papkalari uchun shu kerak.

Sticky va setgid'ni birga ham ishlatish mumkin:

```text
$ chmod 1777 umumiy && ls -ld umumiy
drwxrwsrwt 2 root jamoa 60 Nov  5 11:27 umumiy
```

## ACL: bitta odamga alohida ruxsat

Debian Reference'ga ko'ra ACL oddiy ruxsatlarning **kengaytmasi**. acl(5) ga ko'ra u har bir fayl va papkaga alohida foydalanuvchi va guruhlar uchun huquq yozish imkonini beradi.

Vazifa: `sir.txt` faqat root'niki (`600`), lekin uni `vali` ham o'qishi kerak. Guruhni o'zgartirmaymiz:

```text
$ echo maxfiy > sir.txt && chmod 600 sir.txt
$ setfacl -m u:vali:r sir.txt
$ ls -l sir.txt
-rw-r-----+ 1 root root 7 Nov  5 11:27 sir.txt
$ getfacl sir.txt
# file: sir.txt
# owner: root
# group: root
user::rw-
user:vali:r--
group::---
mask::r--
other::---

$ runuser -u vali -- cat sir.txt
maxfiy
$ runuser -u ali -- cat sir.txt
cat: sir.txt: Permission denied
```

- `ls -l` dagi `+` — faylda ACL borligi belgisi.
- `user::`, `group::`, `other::` — oddiy egasi/guruh/boshqalar huquqlari.
- `user:vali:r--` — `vali` uchun alohida yozuv.
- `mask::` — Debian Reference'ga ko'ra nomlangan yozuvlar uchun **yuqori chegara**.

`setfacl` ning asosiy opsiyalari: `-m` (qo'shish/o'zgartirish), `-x` (yozuvni olib tashlash), `-b` (hamma ACL'ni olib tashlash), `-d` (default ACL, pastda).

### Tuzoq: `chmod` mask'ni o'zgartiradi

ACL bor faylda `ls -l` dagi **guruh** ustuni aslida guruhni emas, **mask** ni ko'rsatadi. Shuning uchun `chmod g-...` mask'ni o'zgartiradi va nomlangan yozuvlarni "o'chirib" qo'yadi:

```text
$ chmod g-r sir.txt
$ getfacl sir.txt
# file: sir.txt
# owner: root
# group: root
user::rw-
user:vali:r--			#effective:---
group::---
mask::---
other::---

$ runuser -u vali -- cat sir.txt
cat: sir.txt: Permission denied
```

`user:vali:r--` yozuvi turibdi, lekin `#effective:---`: mask uni hech narsaga cheklab qo'ydi. ACL ishlatilgan faylda ruxsatni `chmod` bilan emas, `setfacl` bilan o'zgartiring.

<div data-animatsiya="acl"></div>

### Default ACL: yangi fayllar uchun

acl(5) ga ko'ra papkada **default ACL** ham bo'lishi mumkin. U papkada yangi yaratilgan fayllarning boshlang'ich ACL'ini belgilaydi:

```text
$ mkdir loyiha && setfacl -m g:jamoa:rwx loyiha && setfacl -d -m g:jamoa:rwX loyiha
$ touch loyiha/yangi.txt && mkdir loyiha/ichki
$ getfacl -c loyiha/yangi.txt
user::rw-
group::r-x			#effective:r--
group:jamoa:rwx			#effective:rw-
mask::rw-
other::r--

$ getfacl -c loyiha/ichki
user::rwx
group::r-x
group:jamoa:rwx
mask::rwx
other::r-x
default:user::rwx
default:group::r-x
default:group:jamoa:rwx
default:mask::rwx
default:other::r-x

```

- Yangi fayl `jamoa` guruhiga `rw` oldi. Mask'ning `x` i yo'q, chunki fayl `x` siz yaratildi.
- Ichki papka ham default ACL'ni meros qilib oldi: undagi fayllar ham shunday bo'ladi.

ACL'ni butunlay olib tashlash:

```text
$ setfacl -b sir.txt && ls -l sir.txt
-rw------- 1 root root 7 Nov  5 11:27 sir.txt
```

## Variantlar: guruh, setgid yoki ACL

| Vazifa | Yechim | Nega |
| --- | --- | --- |
| Bir nechta odam bitta papkada ishlaydi | Guruh + setgid papka (`2775`) | Oddiy, `ls -l` da hammasi ko'rinadi, har qanday vosita tushunadi |
| Hammaga ochiq papka, lekin har kim faqat o'z faylini o'chirsin | Sticky bit (`1777`) | `/tmp` shunday ishlaydi |
| Bitta faylga bitta qo'shimcha odam yoki servis | ACL (`setfacl -m u:nom:r`) | Guruhni o'zgartirish boshqalarga ham ta'sir qilardi |
| Papkadagi yangi fayllar ham avtomatik ochiq bo'lsin | Default ACL yoki setgid + `umask 002` | Default ACL har faylga aniq huquq beradi. setgid esa faqat guruhni beradi, huquqni umask belgilaydi |
| Dastur root huquqi bilan ishlashi kerak | **setuid emas** — `sudo` qoidasi yoki systemd servisi | setuid xavfsizlik xavfini tug'diradi (Debian Reference) |

ACL'ning kamchiligi: u ko'zga ko'rinmaydi (faqat `+` belgisi bor) va har vosita uni saqlamaydi. Masalan, GNU `tar` ACL'ni faqat `--acls` opsiyasi bilan arxivlaydi. Shuning uchun avval guruh bilan hal qilishga urinib ko'ring.

## Debian va Ubuntu

Maxsus bitlar va ACL — yadro va fayl tizimining imkoniyati. Ular ikkala tizimda bir xil ishlaydi. Farq vositalarda:

```text vps
$ command -v setfacl getfacl || echo "setfacl yoq"
setfacl yoq
$ dpkg -l acl | tail -1
un  acl            <none>       <none>       (no description available)
$ ls -l /usr/bin/sudo /usr/lib/cargo/bin/sudo
lrwxrwxrwx 1 root root    22 Oct  6 16:13 /usr/bin/sudo -> /etc/alternatives/sudo
-rwsr-xr-x 1 root root 1090848 Aug 27 11:15 /usr/lib/cargo/bin/sudo
```

- Sinov VPS'ida `setfacl` va `getfacl` yo'q: `acl` paketi o'rnatilmagan. Kerak bo'lsa, `apt install acl` bilan o'rnatiladi (24-bob).
- Ubuntu 26.04 da `sudo` — rust'dagi sudo-rs. U ham setuid dastur (`-rwsr-xr-x`), faqat `/usr/lib/cargo/bin/` da turadi.

## Tipik xatolar

**1. Umumiy papkada fayllar har xil guruhda yaratiladi.**
Jamoa a'zosi yaratgan faylni boshqalar o'zgartira olmaydi.
To'g'risi: papkaga `chmod g+s` (setgid). Yangi fayllar papka guruhini oladi.

**2. ACL bor faylga `chmod` qilish.**
Nomlangan yozuvlar mask orqali jim o'chib qoladi (`#effective:---`).
To'g'risi: `setfacl -m`. Holatni `getfacl` bilan tekshiring.

**3. "Root kerak" deb dasturga setuid qo'yish.**
Debian Reference'ga ko'ra setuid xavfsizlik xavfini tug'diradi: dasturdagi har bir xato root huquqi bilan ishlaydi.
To'g'risi: aniq bir buyruq uchun `sudo` qoidasi (23-bob).

**4. `S` yoki `T` (katta harf) ni sezmaslik.**
Bit qo'yilgan, lekin ostidagi `x` yo'q, ya'ni bit ishlamaydi.
To'g'risi: `ls -l` dagi katta harfni xato belgisi deb tekshiring.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=08-maxsus-bitlar)** "Jamoa papkasi": setgid va sticky bit bilan umumiy papka quriladi, bitta faylga ACL bilan ruxsat beriladi.

Savollar:

1. `drwxrwsrwt` qanday sonli ruxsatga teng?
2. Nega `/tmp` da boshqa foydalanuvchining faylini o'chira olmaysiz?
3. `ls -l` da `-rw-r-----+` ko'rdingiz. `+` nimani bildiradi va kim faylni o'qiy olishini qanday bilasiz?
4. setgid papkada yaratilgan fayl qaysi guruhni oladi?

<details>
<summary>Javoblar</summary>

1. `3777`: setgid (2) + sticky (1) = 3, keyin `777`.
2. `/tmp` da sticky bit bor: faylni faqat egasi, papka egasi yoki root o'chira oladi.
3. Faylda ACL bor. To'liq ro'yxatni `getfacl` ko'rsatadi.
4. Papkaning guruhini.

</details>

## Rasmiy hujjat

- [Debian Reference 1.2.3 — Filesystem permissions (setuid, setgid, sticky)](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_filesystem_permissions)
- [Debian Reference 4.7.1 — Access control lists (ACLs)](https://www.debian.org/doc/manuals/debian-reference/ch04.en.html#_access_control_lists)
- [acl(5)](https://manpages.debian.org/bookworm/acl/acl.5.en.html)
- [setfacl(1)](https://manpages.debian.org/bookworm/acl/setfacl.1.en.html) · [getfacl(1)](https://manpages.debian.org/bookworm/acl/getfacl.1.en.html)
- [inode(7) — The set-user-ID, set-group-ID, and sticky bits](https://man7.org/linux/man-pages/man7/inode.7.html)
- [GNU Coreutils — Mode structure](https://www.gnu.org/software/coreutils/manual/coreutils.html#Mode-Structure)
