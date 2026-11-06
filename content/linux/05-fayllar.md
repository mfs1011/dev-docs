# 05 — Fayllar bilan ishlash

[← Oldingi: Katalog daraxti](04-katalog-daraxti.md) · [Mundarija](README.md) · [Keyingi: Inode va havolalar →](06-inode-va-havolalar.md)

## Tushuncha

Bu bob kundalik ishning asosi: daraxt bo'ylab yurish (`pwd`, `cd`, `ls`) va fayl hamda papkalarni yaratish, nusxalash, ko'chirish, o'chirish (`touch`, `mkdir`, `cp`, `mv`, `rm`). Buyruqlar oddiy, lekin ular serverda **so'roqsiz** ishlaydi. Shuning uchun har birining qachon fayl ustidan yozib yuborishini va qachon nimani o'chirishini aniq bilish kerak.

## Qayerdaman va qanday yuraman

Har bir jarayonning **joriy papkasi** (current working directory) bo'ladi. Nisbiy yo'llar shu papkadan hisoblanadi. `pwd` (print working directory) uni ko'rsatadi:

```text
$ cd ~
$ pwd
/root
$ cd /etc/apt
$ pwd
/etc/apt
$ cd ..
$ pwd
/etc
$ cd -
/etc/apt
$ cd
$ pwd
/root
```

| Yozuv | Ma'nosi |
| --- | --- |
| `/etc/apt` | **Mutlaq yo'l** (absolute path) — `/` dan boshlanadi, qayerda turganingizdan qat'i nazar bir joyni bildiradi |
| `apt`, `src/lib` | **Nisbiy yo'l** (relative path) — joriy papkadan hisoblanadi |
| `.` | Joriy papkaning o'zi |
| `..` | Bir pog'ona yuqoridagi papka. `../..` — ikki pog'ona |
| `~` | Uy papkangiz (root uchun `/root`, boshqalar uchun `/home/<nom>`) |
| `cd` (argumentsiz) | Uy papkaga qaytish |
| `cd -` | Oldingi papkaga qaytish. U qayerga qaytganini ham chiqaradi |

**Tab** tugmasi papka va fayl nomlarini oxirigacha yozadi (2-bob). Ubuntu hujjati uni buyruq qatorining eng foydali imkoniyatlaridan biri deb ataydi.

### Yashirin fayllar

Nomi nuqta bilan boshlanadigan fayllar `ls` da ko'rinmaydi. Ularni `-a` (all) ko'rsatadi:

```text
$ ls -a
.  ..  .bashrc	.profile  .ssh
```

`.bashrc` va `.profile` — bash sozlamalari (15-bob), `.ssh` — SSH kalitlari (45-bob). Bular "yashirin", lekin himoyalanmagan: ular shunchaki ekranni to'ldirmasligi uchun ko'rsatilmaydi.

## Yaratish: `touch` va `mkdir`

```text
$ mkdir loyiha
$ cd loyiha
$ touch a.txt b.txt
$ ls
a.txt  b.txt
```

`touch` fayl bo'lmasa bo'sh fayl yaratadi. Fayl bo'lsa, faqat uning vaqtini yangilaydi (6-bob). `mkdir` — papka yaratadi.

Ichma-ich papka bir buyruqda yaratilmaydi, agar yuqoridagisi hali yo'q bo'lsa:

```text
$ mkdir src/lib
mkdir: cannot create directory ‘src/lib’: No such file or directory
$ mkdir -p src/lib
$ ls -R
.:
a.txt  b.txt  src

./src:
lib

./src/lib:
```

`-p` (parents) yo'ldagi yetishmayotgan papkalarni ham yaratadi. Papka allaqachon bo'lsa, xato bermaydi. Shuning uchun skriptlarda deyarli doim `mkdir -p` ishlatiladi. `ls -R` (recursive) papkalarni ichma-ich ko'rsatadi.

## Nusxalash: `cp`

Ubuntu hujjatidagi qoida: avval **nima**, oxirida **qayerga** yoziladi. Bular joylashuvi muhim argumentlar (positional arguments).

```text
$ cp a.txt c.txt
$ cp src s2
cp: -r not specified; omitting directory 'src'
$ cp -r src src-zaxira
```

- Fayl nusxalanadi, papka esa `-r` (recursive)siz nusxalanmaydi.
- `cp -a` (archive) papkani ruxsatlar, egasi va vaqtlari bilan birga aynan nusxalaydi. Ubuntu hujjati zaxira nusxa olish uchun shuni tavsiya qiladi.
- Oxirgi argument mavjud papka bo'lsa (`cp a.txt src/`), fayl o'z nomi bilan shu papka ichiga tushadi.

## Ko'chirish va nomini o'zgartirish: `mv`

```text
$ mv b.txt src/
$ mv c.txt yangi.txt
$ ls
a.txt  src  src-zaxira	yangi.txt
$ ls src
b.txt  lib
```

`mv` ikki ishni qiladi: boshqa papkaga ko'chiradi yoki nomini o'zgartiradi. Ikkalasini bir yo'la ham qilish mumkin: `mv yangi.txt ../eski.txt`. `mv` uchun papka ham oddiy fayl kabi ko'chadi, `-r` kerak emas.

## Ustidan yozish: so'roqsiz

Ubuntu hujjatining ogohlantirishi: terminal nomlar to'qnashuvini **tekshirmaydi va ogohlantirmaydi**. Shu nomdagi fayl bo'lsa, uning ustidan yozib yuboradi:

```text
$ echo birinchi > a.txt
$ echo ikkinchi > yangi.txt
$ cp a.txt yangi.txt
$ cat yangi.txt
birinchi
```

`yangi.txt` dagi "ikkinchi" so'zi hech qanday savolsiz yo'qoldi. (`echo ... >` faylga matn yozadi, 11-bob. `cat` faylni ekranga chiqaradi.)

<div data-animatsiya="qadamli" data-nom="cp-mv"></div>

Himoyalanish yo'llari:

| Yo'l | Nima qiladi | Qachon |
| --- | --- | --- |
| `cp -i`, `mv -i` | Ustidan yozishdan oldin so'raydi | Qo'lda ishlaganda |
| `cp --update=none` | Mavjud faylga tegmaydi, jim o'tkazib yuboradi | Skriptda. Faqat **coreutils 9.3+** da bor (pastda) |
| `cp -n` | Shunga o'xshash, lekin GNU qo'llanmasida **eskirgan** (deprecated) deb belgilangan | Faqat eski tizimda |
| `cp --backup=numbered` | Eski faylni `nom.~1~` qilib saqlab, keyin yozadi | O'zgarishni qaytarish imkoni kerak bo'lsa |

```text
$ echo ikkinchi > yangi.txt
$ cp -n a.txt yangi.txt
$ cat yangi.txt
ikkinchi
$ cp --backup=numbered a.txt yangi.txt
$ ls
a.txt  src  src-zaxira	yangi.txt  yangi.txt.~1~
```

## O'chirish: `rmdir` va `rm`

```text
$ rmdir src
rmdir: failed to remove 'src': Directory not empty
$ rm src
rm: cannot remove 'src': Is a directory
$ rm -r src-zaxira
```

- **`rmdir`** faqat **bo'sh** papkani o'chiradi. Ubuntu hujjati buni xavfsiz yo'l deydi: ichida nimadir borligini bilmagan papkangizni tasodifan o'chirmaysiz.
- **`rm`** fayl o'chiradi. Papkani `-r` bilan, ichidagi hamma narsa bilan birga o'chiradi va **hech narsa so'ramaydi**.
- Linux terminalida **savat (recycle bin) yo'q**. `rm` qilingan fayl ketdi.

`rm` ning GNU Coreutils qo'llanmasidagi opsiyalari:

| Opsiya | Nima qiladi |
| --- | --- |
| `-r` | Papkani ichidagilari bilan o'chiradi |
| `-i` | Har bir fayldan oldin so'raydi |
| `-I` | 3 tadan ko'p fayl yoki `-r` bo'lsa, **bir marta** so'raydi |
| `-f` | So'ramaydi, yo'q fayl uchun xato bermaydi |
| `-d` | Bo'sh papkani o'chiradi (`rmdir` kabi) |

GNU `rm` ildizni himoya qiladi (`--preserve-root` standart holatda yoqilgan):

```text
# rm -rf /
rm: it is dangerous to operate recursively on '/'
rm: use --no-preserve-root to override this failsafe
```

Bu himoya faqat `/` ning o'zi uchun. `rm -rf /etc` yoki `rm -rf ~` ni u to'xtatmaydi.

## Debian va Ubuntu: versiya farqi

Ubuntu 26.04 da `cp`, `mv` va `rm` hali GNU'niki (1-bob), lekin yangiroq versiyada: Debian 12 da coreutils 9.1, Ubuntu 26.04 da 9.7. Bu farq bevosita ko'rinadi:

```text
$ cp --update=none a.txt yangi.txt
cp: option '--update' doesn't allow an argument
Try 'cp --help' for more information.
```

```text vps
$ cp --version | head -1
cp (GNU coreutils) 9.7
$ cp --update=none a b; echo "kod $?"
kod 0
$ cp -n a b; echo "n kod $?"
cp: warning: behavior of -n is non-portable and may change in future; use --update=none instead
n kod 0
```

Debian 12 da `--update=none` yo'q, Ubuntu 26.04 da esa `-n` uchun ogohlantirish chiqadi. Ikkala tizimda ishlashi kerak bo'lgan skriptda ikkalasidan ham qochish mumkin: avval fayl borligini tekshirib, keyin nusxalash (`[ -e b ] || cp a b`, shartlar — 49-bob).

`mkdir` esa VPS'da rust-coreutils'dan keladi. Uning xato xabari qisqaroq:

```text vps
$ mkdir src/lib
mkdir: No such file or directory
```

## Tipik xatolar

**1. Bo'sh joy yoki o'zgaruvchi bilan `rm -rf`.**
`rm -rf /var/lib/ilova /*` ga o'xshash qatorda bitta ortiqcha probel `rm` ga `/*` ni ham beradi.
To'g'risi: o'chirishdan oldin xuddi shu argumentlar bilan `ls` qiling. Skriptlarda o'zgaruvchi bo'sh bo'lsa to'xtating (`set -u`, 48-bob).

**2. Nusxa olayotganda ustidan yozib yuborish.**
`cp config.yml config.yml.bak` ni ikkinchi marta qilganda birinchi zaxira yo'qoladi.
To'g'risi: sana bilan nom (`config.yml.2026-11-05`) yoki `--backup=numbered`.

**3. `cp -r` bilan ruxsatlarni yo'qotish.**
`cp -r` faylning egasi va vaqtini saqlamaydi. Zaxira nusxa esa aynan bo'lishi kerak.
To'g'risi: `cp -a`.

**4. Nisbiy yo'lni noto'g'ri papkada ishlatish.**
`rm -r src` ni boshqa papkada turib bajarsangiz, boshqa `src` o'chadi.
To'g'risi: muhim o'chirishda mutlaq yo'l yozing yoki avval `pwd` qiling. Prompt'dagi papka nomiga ham qarang.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=05-fayllar)** "Loyiha papkasini tartibga solish": papka yaratish, nusxalash, ko'chirish va xavfsiz o'chirish.

Savollar:

1. `/var/log` da turibsiz. `cd ../lib` sizni qayerga olib boradi?
2. `mkdir a/b/c` xato beryapti. Nega va qanday tuzatasiz?
3. `cp -r` va `cp -a` farqi nima?
4. Bo'sh bo'lmagan papkani nega `rmdir` o'chirmaydi va bu nimasi bilan yaxshi?

<details>
<summary>Javoblar</summary>

1. `/var/lib`.
2. `a` yoki `a/b` hali yo'q. `mkdir -p a/b/c`.
3. `-a` ruxsatlar, egasi, vaqtlar va havolalarni ham saqlaydi. Zaxira uchun aynan shu kerak.
4. Ichida nima borligini bilmasdan o'chirib yubormaslik uchun. Bo'sh emasligini ko'rsangiz, avval ichini tekshirasiz.

</details>

## Rasmiy hujjat

- [Ubuntu Server — Welcome to the terminal: Navigating the filesystem, Working with files](https://ubuntu.com/server/docs/tutorial/welcome-to-the-terminal/)
- [GNU Coreutils — cp invocation](https://www.gnu.org/software/coreutils/manual/coreutils.html#cp-invocation)
- [GNU Coreutils — mv invocation](https://www.gnu.org/software/coreutils/manual/coreutils.html#mv-invocation)
- [GNU Coreutils — rm invocation](https://www.gnu.org/software/coreutils/manual/coreutils.html#rm-invocation)
- [GNU Coreutils — mkdir invocation](https://www.gnu.org/software/coreutils/manual/coreutils.html#mkdir-invocation)
- [Debian Reference 1.4.10 — Basic Unix commands](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_basic_unix_commands)
- [Bash Reference Manual — Bourne Shell Builtins (cd, pwd)](https://www.gnu.org/software/bash/manual/bash.html#Bourne-Shell-Builtins)
