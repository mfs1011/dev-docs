# 22 — Foydalanuvchi va guruh

[← Oldingi: Amaliy: log tahlili](21-log-tahlili.md) · [Mundarija](README.md) · [Keyingi: sudo →](23-sudo.md)

## Tushuncha

7-bobda har faylning **egasi** va **guruhi** bor ekanini ko'rdik. Bu bobda o'sha egalar qayerdan kelishini ko'ramiz.

Serverda foydalanuvchi ikki xil bo'ladi:

| | Odam (oddiy foydalanuvchi) | Servis (tizim foydalanuvchisi) |
| --- | --- | --- |
| Misol | `ali` — dasturchi | `www-data`, `postgres`, `ilova` |
| Tizimga kiradimi | Ha (SSH orqali) | Yo'q: qobig'i (shell) `nologin` |
| UID | 1000 va undan katta | 1000 dan kichik |
| Nima uchun | Ishlash, deploy qilish | Bitta dasturni o'z huquqlari bilan ishga tushirish |

**Guruh** — foydalanuvchilar to'plami. Faylga guruh orqali ruxsat berib, uni bir nechta odamga birdan ochasiz.

## Hisob ma'lumoti qayerda

Debian Reference'ga ko'ra oddiy Unix autentifikatsiyasi uchta faylga tayanadi:

```text
$ ls -l /etc/passwd /etc/shadow /etc/group /etc/gshadow
-rw-r--r-- 1 root root   562 Nov  5 11:40 /etc/group
-rw-r----- 1 root shadow 470 Nov  5 11:40 /etc/gshadow
-rw-r--r-- 1 root root   965 Nov  5 11:40 /etc/passwd
-rw-r----- 1 root shadow 529 Nov  5 11:40 /etc/shadow
```

| Fayl | Nima saqlanadi | Kim o'qiy oladi |
| --- | --- | --- |
| `/etc/passwd` | Hisoblar: nom, UID, guruh, uy papkasi, qobiq (shell) | Hamma |
| `/etc/shadow` | Parol xeshlari va parol muddatlari | Faqat root va `shadow` guruhi |
| `/etc/group` | Guruhlar va ularning a'zolari | Hamma |

Nomi `passwd` bo'lsa ham, parol unda emas. Debian Reference'ga ko'ra ikkinchi maydon avval shifrlangan parol uchun ishlatilgan. Endi u yerda `x` turadi va parol hamma o'qiy olmaydigan `/etc/shadow` ga ko'chirilgan.

Uchala fayldagi qatorlar bir-biriga nom va raqamlar orqali bog'langan. Maydonni bosing:

<div data-animatsiya="hisob"></div>

Qatorni o'qish uchun `getent` ishlatiladi. Debian Reference'ga ko'ra hisoblar boshqa joyda ham saqlanishi mumkin (masalan, LDAP). `getent` qayerda bo'lsa ham topadi:

```text
$ getent passwd root
root:x:0:0:root:/root:/bin/bash
$ head -n 3 /etc/passwd
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
```

Yangi serverda odam hisobi deyarli yo'q. Qolganlari tizim hisoblari:

```text
$ awk -F: '$3 >= 1000' /etc/passwd
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
```

## Foydalanuvchi qo'shish: `adduser`

Debian va Ubuntu'da `adduser` ishlatiladi. U pastroq darajadagi `useradd` ustiga qurilgan va kerakli ishlarni o'zi qiladi: guruh, uy papkasi, `/etc/skel` dan boshlang'ich fayllar.

```text
$ adduser --disabled-password --gecos 'Ali Valiyev' ali
Adding user `ali' ...
Adding new group `ali' (1000) ...
Adding new user `ali' (1000) with group `ali (1000)' ...
Creating home directory `/home/ali' ...
Copying files from `/etc/skel' ...
Adding new user `ali' to supplemental / extra groups `users' ...
Adding user `ali' to group `users' ...
$ getent passwd ali
ali:x:1000:1000:Ali Valiyev,,,:/home/ali:/bin/bash
$ getent shadow ali
ali:!:20763:0:99999:7:::
$ id ali
uid=1000(ali) gid=1000(ali) groups=1000(ali),100(users)
```

- Har foydalanuvchiga **o'z nomidagi guruh** yaratildi (`ali`, GID 1000) — bu uning asosiy guruhi.
- `--disabled-password` — parol so'ralmaydi va o'rnatilmaydi. `/etc/shadow` dagi `!` shuni bildiradi: parol bilan kirib bo'lmaydi. Serverda odamlar SSH kalit bilan kiradi (45-bob).
- `--gecos` — izoh maydoni. Bermasangiz, `adduser` ism, telefon kabi ma'lumotlarni so'raydi.
- `id` — foydalanuvchining UID, asosiy guruhi va barcha guruhlari.

Parolni keyin o'rnatish yoki o'zgartirish — `passwd ali`. Parol holati:

```text
$ passwd -S ali
ali L 2026-11-06 0 99999 7 -1
```

`L` — locked: parol bilan kirish yopiq.

### Uy papkasi ruxsatlari

```text
$ ls -ld /home/ali
drwx------ 2 ali ali 0 Nov  6  2026 /home/ali
```

Debian 12 da yangi uy papkasi `700`: boshqalar ichiga kira olmaydi. Ubuntu VPS'da:

```text vps
$ ls -ld /home/sinovchi
drwxr-x--- 2 sinovchi sinovchi 4096 Nov  6 12:55 /home/sinovchi
```

Ubuntu hujjatiga ko'ra 21.10 dan beri uy papkalari `750` bilan yaratiladi (oldin `755` edi va hamma boshqalarning uy papkasini o'qiy olardi). Standart qiymat `/etc/adduser.conf` dagi `DIR_MODE` bilan o'zgartiriladi.

## Guruhlar

```text
$ addgroup jamoa
Adding group `jamoa' (GID 1001) ...
Done.
$ adduser ali jamoa
Adding user `ali' to group `jamoa' ...
Done.
$ id ali
uid=1000(ali) gid=1000(ali) groups=1000(ali),100(users),1001(jamoa)
$ getent group jamoa
jamoa:x:1001:ali
```

`adduser FOYDALANUVCHI GURUH` — mavjud foydalanuvchini guruhga qo'shadi. Ubuntu hujjati aynan shu shaklni ko'rsatadi.

Boshqa tizimlarda ko'p uchraydigan yo'l — `usermod -aG`. Undagi `-a` (append, qo'shish) **majburiy**. Yangi trenajorda `vali` ni yaratib, `jamoa` ga qo'shamiz, keyin `sudo` guruhini `-a` siz beramiz:

```text
$ id vali
uid=1000(vali) gid=1000(vali) groups=1000(vali),100(users),1001(jamoa)
$ usermod -G sudo vali
$ id vali
uid=1000(vali) gid=1000(vali) groups=1000(vali),27(sudo)
```

`-a` siz `-G` qo'shimcha guruhlar ro'yxatini **almashtiradi**: `vali` `jamoa` va `users` dan chiqib ketdi. Teskari holat ham bo'ladi: `usermod -G docker admin` yozilsa, `admin` `sudo` guruhidan chiqadi va serverni boshqarish huquqini yo'qotadi. To'g'risi:

```text
$ usermod -aG jamoa vali
$ id vali
uid=1000(vali) gid=1000(vali) groups=1000(vali),27(sudo),1001(jamoa)
```

### Guruh qachon kuchga kiradi

Foydalanuvchi guruhga qo'shilganda u allaqachon ishlatayotgan jarayonlar buni **bilmaydi**. Guruhlar jarayon ishga tushganda belgilanadi. Sinab ko'ramiz: `ali` nomidan jarayon ishga tushiramiz, keyin uni guruhga qo'shamiz:

```text
$ runuser -u ali -- sleep 600 &
[1] 212
$ adduser ali jamoa
Adding user `ali' to group `jamoa' ...
Done.
$ id ali
uid=1000(ali) gid=1000(ali) groups=1000(ali),100(users),1001(jamoa)
$ grep Groups /proc/$!/status
Groups:	100 1000 
$ runuser -u ali -- id -nG
ali users jamoa
```

- `id ali` fayllardan o'qiydi: `jamoa` bor.
- Ishlab turgan jarayonning guruhlari (`/proc/PID/status`, 9-bob) — faqat `100` va `1000`. `jamoa` (1001) yo'q.
- Yangi ishga tushgan jarayonda `jamoa` bor.

Amalda: o'zingizni guruhga qo'shsangiz — SSH'dan chiqib, qayta kiring. Servis foydalanuvchisini qo'shsangiz — servisni qayta ishga tushiring (34-bob).

### Jamoa uchun umumiy papka

8-bobdagi setgid papka guruh bilan birga ishlaydi:

```text
$ mkdir /srv/umumiy && chgrp jamoa /srv/umumiy && chmod 2770 /srv/umumiy
$ runuser -u ali -- touch /srv/umumiy/a.txt && ls -l /srv/umumiy
total 1
-rw-r--r-- 1 ali jamoa 0 Nov  6 09:55 a.txt
```

`jamoa` a'zolari papkada ishlaydi, boshqalar (`0`) ichiga kira olmaydi. Fayl papkaning guruhini oldi.

## Servis foydalanuvchisi

Ilovani root nomidan ishga tushirmang: undagi xato butun serverni xavf ostiga qo'yadi. Har servis uchun alohida tizim foydalanuvchisi yaratiladi:

```text
$ adduser --system --group --no-create-home ilova
Adding system user `ilova' (UID 101) ...
Adding new group `ilova' (GID 107) ...
Adding new user `ilova' (UID 101) with group `ilova' ...
Not creating `/nonexistent'.
$ getent passwd ilova
ilova:x:101:107::/nonexistent:/usr/sbin/nologin
```

- `--system` — man sahifaga ko'ra UID `/etc/adduser.conf` dagi tizim oralig'idan (`FIRST_SYSTEM_UID`–`LAST_SYSTEM_UID`) olinadi; natijada qobiq (shell) `/usr/sbin/nologin`.
- `--group` — shu nomli guruh ham yaratiladi.
- `--no-create-home` — uy papkasi yo'q (`/nonexistent`).

Bu foydalanuvchi bilan tizimga kirib bo'lmaydi:

```text
$ su - ilova
su: warning: cannot change directory to /nonexistent: No such file or directory
This account is currently not available.
$ runuser -u ilova -- whoami
ilova
```

Lekin root uning nomidan buyruq ishga tushira oladi: `runuser` yoki `sudo -u` (23-bob). systemd servisida esa `User=ilova` yoziladi (35-bob). Ilova fayllari egaligi uchun 7-bob mashqiga qarang.

## Foydalanuvchini o'chirish

```text
$ deluser ali
Removing crontab ...
Removing user `ali' ...
Done.
$ ls -ld /home/ali
drwx------ 2 1000 1000 0 Nov  6 09:55 /home/ali
$ ls -ln /srv/umumiy
total 1
-rw-r--r-- 1 1000 1001 0 Nov  6 09:55 a.txt
```

Ubuntu hujjati ogohlantiradi: hisob o'chirilganda uy papkasi **o'chirilmaydi**. Endi uning egasi nom emas, raqam (`1000`): bu UID'ga hech kim to'g'ri kelmaydi. Yangi foydalanuvchi yaratilsa va u ham `1000` ni olsa, eski fayllar **unga** tegishli bo'lib qoladi.

Shuning uchun:

- Uy papkasini ham o'chirish: `deluser --remove-home ali`. Avval kerakli narsalarni zaxiralang.
- Boshqa joylarda qolgan fayllarni topish — `-nouser` (egasi hech bir hisobga mos kelmaydigan fayllar, 19-bob):

```text
$ find / -xdev -nouser
/home/vali
/home/vali/.bash_logout
/home/vali/.bashrc
/home/vali/.profile
```

- Faqat kirishni to'xtatish kerak bo'lsa, o'chirmasdan bloklash: `usermod -L ali` (man: parol xeshi oldiga `!` qo'yadi) va SSH kalitini olib tashlash (45-bob).

> Trenajorda `deluser --remove-home` ishlamaydi: unga `perl` paketi kerak, trenajorda esa u yo'q. U yerda `deluser` dan keyin `rm -r /home/ali` qiling.

## Debian va Ubuntu

| | Debian 12 (trenajor) | Ubuntu 26.04 (VPS) |
| --- | --- | --- |
| `adduser` | 3.134 | 3.153ubuntu1 |
| Yangi uy papkasi | `700` (`drwx------`) | `750` (`drwxr-x---`) |
| Yangi foydalanuvchi qo'shiladigan guruh | `users` | `users` |
| `adduser` chiqishi | Har qadamni yozadi | Jim ishlaydi (faqat xatolar) |

Ubuntu hujjatiga ko'ra o'rnatuvchi yaratgan birinchi foydalanuvchi `sudo` guruhiga a'zo, root esa to'g'ridan-to'g'ri kira olmaydi. Provayder shablonidan o'rnatilgan VPS'da bu boshqacha bo'lishi mumkin. Bizning VPS'da odam hisobi yo'q, `sudo` guruhi bo'sh — kirish faqat root bilan:

```text vps
$ awk -F: '$3 >= 1000' /etc/passwd
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
$ getent group sudo
sudo:x:27:
```

Bunday serverda birinchi ish — o'zingiz uchun foydalanuvchi yaratib, unga `sudo` berish (23-bob).

## Tipik xatolar

**1. `usermod -G` ni `-a` siz ishlatish.**
Foydalanuvchi boshqa guruhlardan, jumladan `sudo` dan chiqib ketadi.
To'g'risi: `usermod -aG guruh foydalanuvchi` yoki `adduser foydalanuvchi guruh`.

**2. Guruhga qo'shib, darhol ishlashini kutish.**
Ochiq sessiya va ishlab turgan servis eski guruhlar bilan qoladi.
To'g'risi: qayta kirish yoki servisni qayta ishga tushirish.

**3. Ilovani root nomidan ishga tushirish.**
To'g'risi: `adduser --system --group` va servisda `User=`.

**4. Hisobni o'chirib, fayllarini unutish.**
Egasiz fayllar keyingi foydalanuvchiga o'tib ketishi mumkin.
To'g'risi: `--remove-home` va `find / -xdev -nouser`.

**5. `/etc/passwd` ni qo'lda tahrirlash.**
Xato qator hamma kirishni buzishi mumkin.
To'g'risi: `adduser`, `usermod`, `deluser`. Qo'lda kerak bo'lsa — `vipw`: man sahifaga ko'ra u faylni buzilishdan saqlash uchun qulflaydi.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=22-foydalanuvchi)** "Jamoa va servis": dasturchi va servis foydalanuvchisini yaratasiz, umumiy guruh va papka sozlaysiz.

Savollar:

1. Parol qaysi faylda saqlanadi va uni kim o'qiy oladi?
2. `usermod -G docker ali` va `usermod -aG docker ali` farqi nima?
3. `ali` ni `docker` guruhiga qo'shdingiz, lekin uning ochiq SSH sessiyasida `docker` hali "ruxsat yo'q" deyapti. Nega?
4. Servis foydalanuvchisi odam foydalanuvchisidan nimasi bilan farq qiladi?
5. `deluser ali` dan keyin `/home/ali` nima bo'ladi?

<details>
<summary>Javoblar</summary>

1. `/etc/shadow` da, xesh ko'rinishida. Uni faqat root va `shadow` guruhi o'qiy oladi.
2. `-G` qo'shimcha guruhlar ro'yxatini almashtiradi, `-aG` esa qo'shadi.
3. Guruhlar jarayon ishga tushganda belgilanadi. Ochiq sessiyada eski guruhlar qoladi, qayta kirish kerak.
4. UID 1000 dan kichik, qobig'i (shell) `nologin` — tizimga kira olmaydi, odatda uy papkasi yo'q. Faqat bitta servisni ishga tushirish uchun.
5. O'chirilmaydi. Egasi raqam (`1000`) bo'lib qoladi.

</details>

## Rasmiy hujjat

- [Debian Reference 4.1 — Normal Unix authentication](https://www.debian.org/doc/manuals/debian-reference/ch04.en.html#_normal_unix_authentication)
- [Debian Reference 4.2 — Managing account and password information](https://www.debian.org/doc/manuals/debian-reference/ch04.en.html#_managing_account_and_password_information)
- [Ubuntu Server — User management](https://ubuntu.com/server/docs/how-to/security/user-management/)
- [adduser(8) — Debian bookworm](https://manpages.debian.org/bookworm/adduser/adduser.8.en.html)
- [usermod(8) — Debian bookworm](https://manpages.debian.org/bookworm/passwd/usermod.8.en.html)
- Trenajorda: `man adduser`, `man usermod`, `man 5 passwd`, `man 5 shadow`
