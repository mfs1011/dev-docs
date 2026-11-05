# 03 — Yordamni topish

[← Oldingi: Terminal va qobiq](02-terminal-va-qobiq.md) · [Mundarija](README.md)

## Tushuncha

Linux'da yuzlab buyruq bor, har birida o'nlab opsiya. Ularni yodlash shart emas. Ubuntu hujjatining aytishicha, Linux'da keng qamrovli ichki qo'llanma bor va undan foydalanishni o'rgansangiz, ko'p narsani o'zingiz topa olasiz.

Bu bobda to'rt vosita bor. Ular bitta savolga turli chuqurlikda javob beradi:

| Savol | Vosita | Qanday javob |
| --- | --- | --- |
| Bu buyruq nima qiladi? | `whatis` | Bir qator |
| Qaysi opsiyasi bor edi? | `buyruq --help` | Qisqa ro'yxat, ekranga darhol chiqadi |
| Hamma tafsilot kerak | `man buyruq` | To'liq qo'llanma sahifasi |
| Qaysi buyruq kerakligini bilmayman | `apropos` (`man -k`) | Tavsifida so'z uchragan barcha buyruqlar |

Qobiqning ichki buyruqlari (`cd`, `type` va boshqalar) uchun esa bash'ning `help` buyrug'i bor.

## `man` — qo'llanma sahifasi

`man` — tizimning qo'llanma ko'ruvchisi (manual pager). U buyruq nomini oladi, unga tegishli sahifani topadi va ko'rsatadi.

```text
$ man ls | head -12
LS(1)                                     User Commands                                     LS(1)

NAME
       ls - list directory contents

SYNOPSIS
       ls [OPTION]... [FILE]...

DESCRIPTION
       List  information about the FILEs (the current directory by default).  Sort entries alpha‐
       betically if none of -cftuvSUX nor --sort is specified.

```

Bu yerda `| head -12` faqat birinchi 12 qatorni ko'rsatish uchun qo'shilgan (pipe — 12-bob). Terminalda shunchaki `man ls` deb yozing: sahifa butun ekranda ochiladi.

### Sahifada yurish

Ubuntu hujjatidagi tugmalar:

| Tugma | Nima qiladi |
| --- | --- |
| `Enter` yoki `↓` | Bir qator pastga |
| `Space` | Bir ekran pastga |
| `g` / `G` | Boshiga / oxiriga |
| `/so'z` + `Enter` | Sahifadan qidirish. Keyingi topilgani — `n` |
| `h` | Yo'riqnoma (barcha tugmalar) |
| `q` | Chiqish |

### Sahifa tuzilishi

`man(1)` sahifasiga ko'ra qo'llanma sahifasi odatiy bo'limlarga bo'linadi. Eng kerakli bo'limlari:

- `NAME` — nomi va bir qatorli tavsifi;
- `SYNOPSIS` — buyruqni qanday yozish (sintaksis);
- `DESCRIPTION` — batafsil tavsif;
- `OPTIONS` — opsiyalar;
- `EXIT STATUS` — chiqish kodlari;
- `FILES` — buyruq ishlatadigan fayllar;
- `EXAMPLES` — misollar;
- `SEE ALSO` — tegishli boshqa sahifalar.

`SYNOPSIS` bo'limidagi belgilar:

| Yozuv | Ma'nosi |
| --- | --- |
| `[-abc]` | Kvadrat qavsdagi narsa ixtiyoriy |
| `-a\|-b` | `\|` bilan ajratilganlarni birga ishlatib bo'lmaydi |
| `argument ...` | Argument bir necha marta takrorlanishi mumkin |
| qalin matn | Aynan shunday yoziladi |
| qiya matn (terminalda tagiga chizilgan) | O'z qiymatingiz bilan almashtiriladi |

Demak, `ls [OPTION]... [FILE]...` degani: opsiyalar ham, fayllar ham ixtiyoriy va har biri bir nechta bo'lishi mumkin.

### Bo'limlar: bitta nom, bir nechta sahifa

Qo'llanma raqamlangan **bo'limlarga** bo'lingan. Raqam sahifa sarlavhasida turadi: `LS(1)`. `man(1)` dagi jadval:

| Bo'lim | Nima bor |
| --- | --- |
| **1** | Bajariladigan dasturlar va qobiq buyruqlari |
| 2 | Tizim chaqiruvlari (yadro beradigan funksiyalar) |
| 3 | Kutubxona funksiyalari |
| 4 | Maxsus fayllar (odatda `/dev` da) |
| **5** | Fayl formatlari va qoidalari, masalan `/etc/passwd` |
| 6 | O'yinlar |
| **7** | Turli mavzular va qoidalar |
| **8** | Tizim boshqaruvi buyruqlari (odatda faqat root uchun) |

Dasturchiga eng ko'p kerak bo'ladigani: 1 (buyruqlar), 5 (konfiguratsiya fayllari) va 8 (administrator buyruqlari).

Bitta nom bir nechta bo'limda uchrashi mumkin:

```text
$ whatis passwd
passwd (1)           - change user password
passwd (5)           - the password file
```

`passwd(1)` — parolni o'zgartiradigan buyruq, `passwd(5)` — `/etc/passwd` faylining formati. Bo'lim ko'rsatilmasa, `man` belgilangan tartibda qidiradi va birinchi topilganini ochadi. Kerakli bo'limni raqam bilan bering. `man -w` sahifani ochmaydi, faqat qaysi fayl ochilishini ko'rsatadi:

```text
$ man -w passwd
/usr/share/man/man1/passwd.1.gz
$ man -w 5 passwd
/usr/share/man/man5/passwd.5.gz
```

Shuning uchun hujjatlarda buyruq nomi yonida bo'lim yoziladi: `passwd(5)`. Bu "5-bo'limdagi passwd sahifasi" degani, ochish uchun `man 5 passwd`. 1-bobdagi `/etc/os-release` faylining ham sahifasi bor:

```text
$ man 5 os-release | head -8
OS-RELEASE(5)                               os-release                              OS-RELEASE(5)

NAME
       os-release, initrd-release, extension-release - Operating system identification

SYNOPSIS
       /etc/os-release

```

## `--help` — tezkor ma'lumot

Ko'p buyruqlar `--help` opsiyasini qabul qiladi va qisqa yo'riqnomani darhol ekranga chiqaradi. GNU Coreutils qo'llanmasiga ko'ra har bir GNU dasturi `--help` va `--version` opsiyalarini qabul qiladi (yoki qabul qilishi kerak).

```text
$ ls --help | head -6
Usage: ls [OPTION]... [FILE]...
List information about the FILEs (the current directory by default).
Sort entries alphabetically if none of -cftuvSUX nor --sort is specified.

Mandatory arguments to long options are mandatory for short options too.
  -a, --all                  do not ignore entries starting with .
```

Ubuntu hujjati aytganidek, bitta opsiyani tekshirmoqchi bo'lsangiz, bu `man` ni ochishdan tezroq.

## `whatis` va `apropos` — qidirish

`whatis` buyruq nomi bo'yicha bir qatorli tavsifni chiqaradi. `man(1)` ga ko'ra `man -f` ham xuddi shunday ishlaydi:

```text
$ whatis ls
ls (1)               - list directory contents
$ man -f ls
ls (1)               - list directory contents
```

Buyruq nomini bilmasangiz, **`apropos`** (yoki `man -k`) kerak bo'ladi. U barcha sahifalarning nomi va qisqa tavsifidan so'z qidiradi:

```text
$ apropos "list directory"
dir (1)              - list directory contents
ls (1)               - list directory contents
vdir (1)             - list directory contents
$ man -k hostname
hostname (1)         - show or set the system's host name
hostname (5)         - Local hostname configuration file
hostname (7)         - hostname resolution description
hostnamectl (1)      - Control the system hostname
hosts (5)            - static table lookup for hostnames
org.freedesktop.hostname1 (5) - The D-Bus interface of systemd-hostnamed
systemd-hostnamed (8) - Daemon to control system hostname from programs
systemd-hostnamed.service (8) - Daemon to control system hostname from programs
```

Qidiruv **inglizcha** tavsiflar bo'yicha ishlaydi. Shuning uchun qidiradigan so'zni inglizcha yozing: `copy`, `user`, `network`, `disk`.

Hech narsa topilmasa:

Bir nechta so'z berilsa, `apropos` ulardan **istalgan birini** qidiradi. `-a` (`--and`) opsiyasi bilan esa faqat **hammasi** uchragan sahifalarni chiqaradi:

```text
$ apropos -a add user
adduser.conf (5)     - configuration file for adduser (8) and addgroup (8)
addgroup (8)         - add or manipulate users or groups
adduser (8)          - add or manipulate users or groups
adduser.local (8)    - hook for local actions in adduser and deluser
deluser.local (8)    - hook for local actions in adduser and deluser
pam_issue (8)        - PAM module to add issue file to user prompt
useradd (8)          - create a new user or update default new user information
```

```text
$ whatis salomdunyo
salomdunyo: nothing appropriate.
$ echo $?
16
```

`man(1)` ning `EXIT STATUS` bo'limiga ko'ra `16` — "kamida bitta sahifa, fayl yoki kalit so'z topilmadi".

## `help` va `type` — qobiqning ichki buyruqlari

2-bobdan eslang: `cd` alohida dastur emas, bash'ning ichki buyrug'i. Ichki buyruqlar haqida ma'lumot `help` bilan olinadi. Bash qo'llanmasiga ko'ra `-d` opsiyasi qisqa tavsif beradi:

```text
$ help -d cd
cd - Change the shell working directory.
$ help cd | head -4
cd: cd [-L|[-P [-e]] [-@]] [dir]
    Change the shell working directory.

    Change the current directory to DIR.  The default DIR is the value of the
```

Ba'zi buyruqlar ham ichki, ham alohida dastur ko'rinishida bor. `type -a` ularning hammasini ko'rsatadi:

```text
$ type -a echo
echo is a shell builtin
echo is /usr/bin/echo
echo is /bin/echo
```

Bash ichki `echo` ni ishlatadi (ro'yxatdagi birinchisi). Shuning uchun `man echo` ochgan sahifa `/usr/bin/echo` dasturiga tegishli, bash'dagi `echo` uchun esa `help echo` to'g'riroq javob beradi. Ikkalasining opsiyalari farq qilishi mumkin.

`/bin/echo` ham chiqqanining sababi: `/bin` — `/usr/bin` ga yo'naltirilgan havola (merged-/usr, 4-bob).

## Debian va Ubuntu: `whatis` hech narsa topmasa

`whatis` va `apropos` sahifalarni bevosita qidirmaydi. Ular `mandb` buyrug'i qurgan **indeks** (`/var/cache/man`) bo'yicha ishlaydi. Indeksni odatda `man-db.timer` har kuni yangilab turadi.

Sinov VPS'ida yangi o'rnatilgan Ubuntu 26.04 da indeks hali qurilmagan edi:

```text vps
$ whatis cp
cp: nothing appropriate.
$ ls -la /var/cache/man
total 8
drwxr-xr-x 2 man  man  4096 Oct 28 11:33 .
drwxr-xr-x 9 root root 4096 Oct 28 11:31 ..
```

Papka bo'sh. `mandb` ni root bilan bir marta qo'lda ishga tushirish yetarli (chiqishning oxirgi qatorlari):

```text vps
$ mandb
85 man subdirectories contained newer manual pages.
3842 manual pages were added.
0 stray cats were added.
0 old database entries were purged.
$ whatis cp
cp (1)               - copy files and directories
```

Shu yerda 1-bobdagi farq yana ko'rinadi. Ubuntu 26.04 da `ls` sahifasi rust-coreutils'niki, GNU versiyasi esa `gnuls` nomi bilan alohida turadi:

```text vps
$ man -w ls
/usr/share/man/man1/rust-ls.1.gz
$ apropos "directory contents"
dir (1)              - List directory contents. Ignore files and directories ...
gnudir (1)           - list directory contents
gnuls (1)            - list directory contents
gnuvdir (1)          - list directory contents
ls (1)               - List directory contents. Ignore files and directories ...
rust-dir (1)         - List directory contents. Ignore files and directories ...
rust-ls (1)          - List directory contents. Ignore files and directories ...
rust-vdir (1)        - List directory contents. Ignore files and directories ...
vdir (1)             - List directory contents. Ignore files and directories ...
```

Demak, Ubuntu 26.04 da `man ls` rust-coreutils'dagi `ls` ni tavsiflaydi. GNU `ls` ning sahifasi esa `man gnuls` bilan ochiladi.

## Variantlar: qaysi birini qachon

| Holat | Tanlov | Nega |
| --- | --- | --- |
| Opsiya nomini eslash kerak | `buyruq --help` | Eng tezi, ekrandan chiqmaysiz |
| Opsiya qanday ishlashini aniq bilish kerak | `man buyruq` | To'liq va rasmiy tavsif, `EXAMPLES` va `SEE ALSO` bilan |
| Buyruq nomini bilmayman | `apropos so'z` | Tavsiflardan qidiradi |
| `cd`, `export`, `alias` kabi ichki buyruq | `help buyruq` | `man` ularni alohida tavsiflamaydi (ular `man bash` ichida) |
| Server yo'q, brauzer bor | Onlayn man sahifalar ([manpages.debian.org](https://manpages.debian.org), [manpages.ubuntu.com](https://manpages.ubuntu.com)) | Versiyani tanlash mumkin. Lekin serverdagi versiya bilan farq qilishi mumkin |

Serverdagi `man` — aynan shu serverda o'rnatilgan versiyaning hujjati. Internetdagi maqola esa boshqa versiya uchun yozilgan bo'lishi mumkin. Shuning uchun opsiya ishlamasa, avval serverdagi `man` ni tekshiring.

## Tipik xatolar

**1. Ichki buyruqni `man` dan qidirish.**
`man cd` → `No manual entry for cd`. `cd` — bash'ning ichki buyrug'i.
To'g'risi: `help cd`. Qaysi turdagi buyruq ekanini `type cd` aytadi.

**2. Noto'g'ri bo'limni o'qish.**
`man passwd` buyruq sahifasini ochadi, sizga esa `/etc/passwd` fayli formati kerak edi.
To'g'risi: `whatis passwd` bilan bo'limlarni ko'ring, keyin `man 5 passwd`.

**3. `apropos` ni o'zbekcha so'z bilan ishlatish.**
Tavsiflar inglizcha. Shuning uchun `apropos nusxa` hech narsa topmaydi.
To'g'risi: `apropos copy`.

**4. "whatis ishlamayapti" deb o'ylash.**
Yangi serverda indeks hali qurilmagan bo'lishi mumkin. Shunda `whatis` va `apropos` hech narsa topmaydi, `man` esa ishlayveradi.
To'g'risi: root bilan `mandb` ni ishga tushiring.

> **Trenajorda.** Joy tejash uchun trenajorga inglizcha man sahifalari va paketlarning litsenziya fayllari o'rnatilgan. `/usr/share/doc` dagi qo'shimcha hujjatlar, tarjimalar va `info` sahifalari esa o'rnatilmagan. Haqiqiy serverda `/usr/share/doc/<paket>/` papkasida qo'shimcha hujjatlar bo'lishi mumkin.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=03-yordam)** "Kerakli buyruqni o'zingiz toping": trenajorda qadamma-qadam bajarasiz.

Savollar:

1. `crontab` nomi qaysi bo'limlarda bor? Fayl formati qaysi bo'limda?
2. `ls` ning qaysi opsiyasi fayllarni hajmi bo'yicha saralaydi? (`man ls` ichida `/size` deb qidiring.)
3. Foydalanuvchi qo'shadigan buyruqni `apropos` bilan toping.
4. `export` haqida qayerdan ma'lumot olasiz?

<details>
<summary>Javoblar</summary>

1. `whatis crontab` → `crontab (1)` va `crontab (5)`. Format 5-bo'limda: `man 5 crontab`.
2. `-S` ("sort by file size, largest first").
3. `apropos -a add user` — `-a` (`--and`) ikkala so'z ham uchragan sahifalarni chiqaradi. Natijada `adduser (8)` va `useradd (8)` bor. `apropos "add a user"` esa hech narsa topmaydi: bunday ibora tavsiflarda yo'q.
4. `export` — bash'ning ichki buyrug'i: `help export`.

</details>

## Rasmiy hujjat

- [man(1) — man-db](https://manpages.debian.org/bookworm/man-db/man.1.en.html)
- [apropos(1)](https://manpages.debian.org/bookworm/man-db/apropos.1.en.html) · [whatis(1)](https://manpages.debian.org/bookworm/man-db/whatis.1.en.html) · [mandb(8)](https://manpages.debian.org/bookworm/man-db/mandb.8.en.html)
- [Ubuntu Server — Welcome to the terminal: Getting help](https://ubuntu.com/server/docs/tutorial/welcome-to-the-terminal/)
- [Bash Reference Manual — Bash Builtins (help)](https://www.gnu.org/software/bash/manual/bash.html#Bash-Builtins)
- [GNU Coreutils — Common options](https://www.gnu.org/software/coreutils/manual/coreutils.html#Common-options)
- [Debian Reference 1.4.10 — Basic Unix commands](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_basic_unix_commands)
