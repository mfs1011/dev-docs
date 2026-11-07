# 48 — Birinchi skript

[← Oldingi: SSH tunnel](47-ssh-tunnel.md) · [Mundarija](README.md)

## Tushuncha

Shu paytgacha buyruqlarni birma-bir terminalga yozdik. Bir xil buyruqlar ketma-ketligi qayta-qayta kerak bo'lsa, ularni faylga yozib qo'yish mumkin. Bunday fayl — **skript** (shell script).

Debian Reference (12.1) ta'rifi bo'yicha skript — bu:

| Belgi | Nima | Nima uchun |
| --- | --- | --- |
| Matnli fayl | Ichida buyruqlar, terminalda yozgandek | Qobiq (shell) uni qatorma-qator o'qib bajaradi |
| Birinchi qator `#!/bin/sh` | **Shebang** — qaysi dastur (interpretator) bu faylni o'qishini aytadi | Faylni nomi bilan ishga tushirganda tizim shu dasturni chaqiradi |
| Bajarish ruxsati (`x`) | `chmod +x` bilan yoqiladi (7-bob) | Usiz faylni nomi bilan ishga tushirib bo'lmaydi |

Bu bobda skriptga parametr berishni, `sh` va `bash` farqini hamda skriptni xatoga chidamli qiladigan `set -e`, `set -u`, `set -o pipefail` ni ko'ramiz. Shartlar va sikllar — 49-bobda, funksiyalar — 50-bobda.

## Birinchi skript

Skriptni here-document (`<<'EOF'`, 11-bob) bilan yozamiz. Odatda skript matn muharririda (masalan, `nano`, 16-bob) yoziladi — natija bir xil:

```text
$ cat > salom.sh <<'EOF'
> #!/bin/sh
> echo "Salom, $(whoami)!"
> EOF
$ ./salom.sh
-bash: ./salom.sh: Permission denied
$ ls -l salom.sh
-rw-r--r-- 1 root root 35 Nov  7 15:41 salom.sh
$ chmod +x salom.sh
$ stat -c '%A %n' salom.sh
-rwxr-xr-x salom.sh
$ ./salom.sh
Salom, root!
```

- Birinchi urinish — `Permission denied`: faylda bajarish ruxsati yo'q (`-rw-r--r--`).
- `chmod +x` dan keyin ruxsatlarda `x` paydo bo'ldi va skript ishladi.
- `$(whoami)` — buyruq natijasini matn ichiga qo'yish (command substitution, 14-bob).

Nega `./` kerak? Bash qo'llanmasi (3.8): nomida `/` bo'lmagan buyruqni qobiq `PATH` dagi papkalardan qidiradi (13-bob). Joriy papka `PATH` da yo'q:

```text
$ salom.sh
-bash: salom.sh: command not found
$ sh salom.sh
Salom, root!
```

`sh salom.sh` — boshqa yo'l: interpretatorni o'zimiz chaqirib, faylni unga argument qilib beramiz. Bunda bajarish ruxsati kerak emas, shebang esa **hisobga olinmaydi** — faylni biz tanlagan `sh` o'qiydi. Bu "sh va bash" bo'limida muhim bo'ladi.

## Shebang

bash(1): fayl `#!` bilan boshlansa, birinchi qatorning qolgan qismi interpretatorni ko'rsatadi; interpretatorga argument sifatida skript nomi va keyin skriptga berilgan argumentlar uzatiladi. Ya'ni `./salom.sh olma` bajarilganda tizim aslida `/bin/sh ./salom.sh olma` ni ishga tushiradi.

Tizimdagi ko'p buyruqlar ham aslida skript:

```text
$ head -1 /usr/bin/zcat /usr/sbin/service
==> /usr/bin/zcat <==
#!/bin/sh

==> /usr/sbin/service <==
#!/bin/sh
$ file /usr/bin/zcat
/usr/bin/zcat: POSIX shell script, ASCII text executable
```

Uchta keng uchraydigan shebang:

| Shebang | Interpretator | Qachon |
| --- | --- | --- |
| `#!/bin/sh` | Debian va Ubuntu'da dash (pastda) | Faqat POSIX imkoniyatlari ishlatilgan skript |
| `#!/bin/bash` | bash | bash'ning qo'shimcha imkoniyatlari kerak bo'lsa |
| `#!/usr/bin/env bash` | `PATH` dagi birinchi `bash` | Bash qo'llanmasi (3.8): bash boshqa papkaga o'rnatilgan tizimlarda ham topish uchun |

## Parametrlar

Skriptga buyruq qatoridan berilgan so'zlar — **pozitsion parametrlar** (positional parameters). Debian Reference (12.1.2) jadvali:

| Parametr | Qiymati |
| --- | --- |
| `$0` | Skript nomi |
| `$1` … `$9` | Birinchi … to'qqizinchi argument |
| `$#` | Argumentlar soni |
| `"$@"` | `"$1" "$2" "$3"` … — har argument alohida so'z |
| `"$*"` | `"$1 $2 $3"` … — hammasi bitta so'z |
| `$?` | Oxirgi buyruqning chiqish kodi |

```text
$ cat > param.sh <<'EOF'
> #!/bin/sh
> echo "skript: $0"
> echo "birinchi: $1"
> echo "ikkinchi: $2"
> echo "soni: $#"
> printf '[%s]\n' "$@"
> printf '<%s>\n' "$*"
> printf '{%s}\n' $@
> EOF
$ chmod +x param.sh
$ ./param.sh olma "qizil nok"
skript: ./param.sh
birinchi: olma
ikkinchi: qizil nok
soni: 2
[olma]
[qizil nok]
<olma qizil nok>
{olma}
{qizil}
{nok}
```

- `"qizil nok"` qo'shtirnoqda — bitta argument: `$#` — 2.
- `printf` har so'z uchun shablonni takrorlaydi, shuning uchun qavslar argumentlar qanday bo'linganini ko'rsatadi:
  - `"$@"` — ikkita so'z, bo'sh joy saqlandi;
  - `"$*"` — bitta so'z;
  - qo'shtirnoqsiz `$@` — uchta so'z: `qizil nok` bo'sh joydan bo'linib ketdi.

Argumentlarni boshqa buyruqqa uzatganda deyarli doim `"$@"` kerak.

Argumentsiz:

```text
$ ./param.sh
skript: ./param.sh
birinchi: 
ikkinchi: 
soni: 0
[]
<>
{}
```

Berilmagan parametr bo'sh qatorga aylandi, xato chiqmadi. Buning xavfini `set -u` bo'limida ko'ramiz.

## sh va bash

Debian Reference (12.1.1): tizimning standart interaktiv bo'lmagan POSIX qobig'i `/usr/bin/sh` — `/usr/bin/dash` ga ko'rsatgan symlink, ko'p tizim dasturlari uni ishlatadi. Interaktiv qobiq (biz yozayotgan terminal) esa — bash.

```text
$ readlink -f /bin/sh
/usr/bin/dash
```

**dash** — kichik va tez POSIX qobig'i. bash POSIX'dan tashqari qo'shimcha imkoniyatlarga ega; ularni Debian Reference "bashism" deb ataydi va hamma POSIX qobiqlarida ishlashi kerak bo'lgan skriptlarda ishlatmaslikni maslahat beradi. Uning jadvalidan:

| POSIX (to'g'ri) | Bashism (`sh` da ishlamaydi) |
| --- | --- |
| `if [ "$a" = "$b" ]` | `if [ "$a" == "$b" ]` |
| `mkdir /foobar /foobaz` | `mkdir /foo{bar,baz}` |
| `funcname() { … }` | `function funcname() { … }` |

Bitta skriptni ikkala qobiqda sinaymiz:

```text
$ cat > farq.sh <<'EOF'
> #!/bin/bash
> [ "a" == "a" ] && echo teng
> echo fayl{1,2,3}.txt
> EOF
$ chmod +x farq.sh
$ ./farq.sh
teng
fayl1.txt fayl2.txt fayl3.txt
$ sh farq.sh
farq.sh: 2: [: a: unexpected operator
fayl{1,2,3}.txt
```

`./farq.sh` shebang'ni o'qib, bash'ni chaqirdi. `sh farq.sh` esa shebang'ni chetlab, faylni dash'ga berdi: `==` xato berdi, `{1,2,3}` yoyilmadi.

Qoida: skriptdagi shebang ichidagi sintaksisga mos bo'lsin. bash imkoniyatlari ishlatilgan bo'lsa — `#!/bin/bash` va skriptni `./skript` yoki `bash skript` bilan ishga tushirish. Debian Reference skriptdagi bashism'larni `checkbashisms(1)` bilan topishni aytadi (`devscripts` paketi; trenajorda o'rnatilmagan).

## set -e: xatoda to'xtash

Standart holatda skriptdagi buyruq xato bersa ham, qobiq keyingi qatorga o'tadi. Bu xavfli bo'lishi mumkin. Misol — eski fayllarni tozalaydigan skript, unda `/srv/ilova` papkasi yo'q:

```text
$ mkdir eski
$ cat > tozala.sh <<'EOF'
> #!/bin/sh
> cd /srv/ilova
> rm -rf eski
> echo "tozalandi"
> EOF
$ chmod +x tozala.sh
$ ./tozala.sh
./tozala.sh: 2: cd: can't cd to /srv/ilova
tozalandi
$ ls -d eski
ls: cannot access 'eski': No such file or directory
```

`cd` muvaffaqiyatsiz bo'ldi, lekin skript davom etdi va `rm -rf eski` ni **joriy papkada** bajardi: `/srv/ilova/eski` emas, `/root/eski` o'chdi.

<div data-animatsiya="qadamli" data-nom="set-e"></div>

bash(1) bo'yicha `set -e`: pipeline, ro'yxat yoki murakkab buyruq noldan farqli kod bilan tugasa, qobiq darhol chiqadi.

Skriptning ikkinchi qatoriga `set -e` qo'shamiz (`sed -i` — 20-bob; `2i` — 2-qatordan oldin qator qo'shish):

```text
$ mkdir eski
$ sed -i '2i set -e' tozala.sh
$ cat tozala.sh
#!/bin/sh
set -e
cd /srv/ilova
rm -rf eski
echo "tozalandi"
$ ./tozala.sh; echo "kod: $?"
./tozala.sh: 3: cd: can't cd to /srv/ilova
kod: 2
$ ls -d eski
eski
```

Endi skript `cd` da to'xtadi, `eski` joyida.

### `set -e` ning tuzoqlari

bash(1) `set -e` ishlamaydigan joylarni sanab o'tadi: `while`/`until` sharti, `if` va `elif` sharti, `&&` yoki `||` ro'yxatidagi oxirgisidan boshqa buyruq, pipeline'dagi oxirgisidan boshqa buyruq va `!` bilan teskari qilingan buyruq. Ikkita amaliy oqibat:

```text
$ sh -ec 'false && echo bajarilmaydi; echo davom'
davom
$ sh -ec 'n=$(grep -c qovun /etc/passwd); echo "soni: $n"'; echo "kod: $?"
kod: 1
$ sh -ec 'n=$(grep -c qovun /etc/passwd) || true; echo "soni: $n"'
soni: 0
```

- `false && …` — `&&` dan oldingi buyruq: skript to'xtamadi.
- `grep -c` hech narsa topmasa `0` chiqaradi, lekin kodi `1` (topilmadi). `set -e` buni xato deb hisoblab, skriptni **jimgina** to'xtatdi — `soni:` qatori ham chiqmadi.
- Debian Reference (12.1.3) yechimi: kutilgan "xato"ni `|| true` bilan belgilash.

`sh -ec '…'` — `-e` parametrini buyruq qatorida berish; skript ichidagi `set -e` bilan bir xil.

## set -u: berilmagan o'zgaruvchi — xato

bash(1): `set -u` berilmagan o'zgaruvchi yoki parametrni ochishni xato deb hisoblaydi, xabar chiqaradi va interaktiv bo'lmagan qobiq chiqib ketadi. Odatda nomni xato yozish shunday ushlanadi:

```text
$ sh -c 'PAPKA=/tmp/eski; echo "tozalanadi: $PAKPA/*"'
tozalanadi: /*
$ sh -uc 'PAPKA=/tmp/eski; echo "tozalanadi: $PAKPA/*"'; echo "kod: $?"
sh: 1: PAKPA: parameter not set
kod: 2
```

`$PAKPA` (harflar almashgan) bo'sh qatorga aylanib, `/tmp/eski/*` o'rniga `/*` hosil bo'ldi — `rm -rf` bilan bu falokat. `-u` bilan qobiq to'xtadi.

Ixtiyoriy parametrga standart qiymat kerak bo'lsa — `${o'zgaruvchi:-qiymat}` (Debian Reference 12.1.2): o'zgaruvchi berilmagan yoki bo'sh bo'lsa, `qiymat` olinadi. Bu `-u` bilan ham ishlaydi:

```text
$ cat > salom2.sh <<'EOF'
> #!/bin/sh
> set -eu
> echo "Salom, ${1:-mehmon}!"
> EOF
$ chmod +x salom2.sh
$ ./salom2.sh
Salom, mehmon!
$ ./salom2.sh Aziz
Salom, Aziz!
```

## set -o pipefail: quvurdagi xato

12-bobda ko'rganimizdek, bash(1) bo'yicha pipeline'ning chiqish kodi — oxirgi buyruqning kodi. Oldingi buyruq xato bersa ham, oxirgisi muvaffaqiyatli bo'lsa, butun pipeline "muvaffaqiyatli" va `set -e` uni sezmaydi. `pipefail` yoqilganda pipeline kodi — noldan farqli kod bilan tugagan oxirgi (eng o'ngdagi) buyruqniki.

```text
$ bash -ec 'grep root /yoq.txt | wc -l; echo davom'
grep: /yoq.txt: No such file or directory
0
davom
$ bash -ec 'set -o pipefail; grep root /yoq.txt | wc -l; echo davom'; echo "kod: $?"
grep: /yoq.txt: No such file or directory
0
kod: 2
```

Birinchisida `grep` xatosi `wc` ortida qoldi, skript davom etdi. `pipefail` bilan pipeline `grep` ning kodi (`2`) ni qaytardi va `-e` skriptni to'xtatdi.

**Tuzoq:** Debian 12 dagi dash `pipefail` ni bilmaydi:

```text
$ sh -c 'set -o pipefail; echo ok'
sh: 1: set: Illegal option -o pipefail
```

Shuning uchun `pipefail` kerak bo'lsa, skript bash'da bo'lishi kerak. Uchala parametrni bitta `set` bilan yoqish mumkin:

```text
$ cat > hisob.sh <<'EOF'
> #!/bin/bash
> set -euo pipefail
> echo "foydalanuvchilar: $(cut -d: -f1 /etc/passwd | wc -l)"
> grep root /yoq.txt | wc -l
> echo "bu qator chiqmaydi"
> EOF
$ chmod +x hisob.sh
$ ./hisob.sh; echo "kod: $?"
foydalanuvchilar: 20
grep: /yoq.txt: No such file or directory
0
kod: 2
```

## Tekshirish: `-n` va `-x`

Debian Reference (12.1) skriptni tekshirishning ikki usulini beradi:

- `sh -n skript` — sintaksisni tekshiradi, buyruqlarni bajarmaydi (bash(1): `-n` — o'qiydi, lekin bajarmaydi);
- `sh -x skript` — har buyruqni bajarishdan oldin, o'zgaruvchilar ochilgan holda, `+` belgisi bilan standart xato oqimiga chiqaradi.

```text
$ sh -n tozala.sh; echo "kod: $?"
kod: 0
$ printf '%s\n' 'if true; then' 'echo a' > buzuq.sh
$ sh -n buzuq.sh; echo "kod: $?"
buzuq.sh: 3: Syntax error: end of file unexpected (expecting "fi")
kod: 2
$ sh -x param.sh olma
+ echo skript: param.sh
skript: param.sh
+ echo birinchi: olma
birinchi: olma
+ echo ikkinchi: 
ikkinchi: 
+ echo soni: 1
soni: 1
+ printf [%s]\n olma
[olma]
+ printf <%s>\n olma
<olma>
+ printf {%s}\n olma
{olma}
```

`-x` qaysi qatorda nima bo'layotganini ko'rsatadi — xato qidirishda birinchi yordamchi.

Tozalash:

```text
$ rm -f salom.sh salom2.sh param.sh farq.sh tozala.sh hisob.sh buzuq.sh
$ rm -rf eski
```

## Debian va Ubuntu

Trenajorda (Debian 12):

```text
$ bash --version | head -1
GNU bash, version 5.2.15(1)-release (i686-pc-linux-gnu)
$ dpkg-query -W dash
dash	0.5.12-2
```

VPS'da (Ubuntu 26.04):

```text vps
$ bash --version | head -1
GNU bash, version 5.3.9(1)-release (x86_64-pc-linux-gnu)
$ readlink -f /bin/sh
/usr/bin/dash
$ dpkg-query -W dash
dash	0.5.12-12ubuntu3
$ sh -c 'set -o pipefail; echo ok'
ok
```

| | Debian 12 (trenajor) | Ubuntu 26.04 (VPS) |
| --- | --- | --- |
| bash | 5.2.15 | 5.3.9 |
| `/bin/sh` | dash 0.5.12-2 | dash 0.5.12-12ubuntu3 |
| `set -o pipefail` dash'da | yo'q (`Illegal option`) | bor |

Ikkala tizimda `/bin/sh` — dash, `==` va `{a,b}` bilan farq bir xil. Lekin Ubuntu dash'i `pipefail` ni qabul qiladi, Debian 12 niki — yo'q: Ubuntu'da sinalgan `#!/bin/sh` skript Debian'da `Illegal option` bilan yiqiladi. Skript ikkala tizimda ishlashi kerak bo'lsa, `pipefail` ni faqat bash skriptlarda ishlating.

## Tipik xatolar

**1. `salom.sh` — `command not found`.**
Joriy papka `PATH` da yo'q.
To'g'risi: `./salom.sh`.

**2. `Permission denied`.**
Faylda bajarish ruxsati yo'q.
To'g'risi: `chmod +x salom.sh` (yoki `sh salom.sh`).

**3. bash skriptini `sh skript.sh` bilan ishga tushirish.**
Shebang hisobga olinmaydi, fayl dash'da bajariladi: `==`, `{a,b}` va boshqa bashism'lar buziladi.
To'g'risi: `./skript.sh` yoki `bash skript.sh`.

**4. `$@` ni qo'shtirnoqsiz yozish.**
Bo'sh joyli argument bo'linib ketadi.
To'g'risi: `"$@"`.

**5. `set -e` hamma xatoni ushlaydi deb o'ylash.**
`if` sharti, `&&`/`||` ichidagi va pipeline o'rtasidagi buyruqlarda u ishlamaydi; aksincha, "topilmadi" kabi kutilgan kodda skriptni jimgina to'xtatadi.
To'g'risi: kutilgan kodni `|| true` bilan belgilash, pipeline uchun `pipefail` (bash).

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=48-skript)** "Birinchi skript": skript yozasiz, unga bajarish ruxsatini berasiz, parametr bilan ishga tushirasiz va `set -u` ni sinaysiz.

Savollar:

1. Skript `-rw-r--r--` ruxsatli. `./skript.sh` nima deydi va `sh skript.sh` nima uchun ishlaydi?
2. `#!/bin/bash` li skriptni `sh skript.sh` bilan ishga tushirsangiz, uni qaysi qobiq bajaradi?
3. `./s.sh "a b" c` da `$#` nechaga teng?
4. `set -e` bor skriptda `grep -q xato log.txt && echo topildi` qatori topmasa, skript to'xtaydimi?
5. Debian 12 da `#!/bin/sh` skriptga `set -o pipefail` yozsangiz nima bo'ladi?

<details>
<summary>Javoblar</summary>

1. `Permission denied`. `sh skript.sh` da faylni bajarmaymiz, `sh` uni o'qiydi — o'qish ruxsati yetarli.
2. dash (`/bin/sh`): shebang hisobga olinmaydi.
3. 2.
4. Yo'q: `&&` dan oldingi buyruqda `set -e` ishlamaydi. (Lekin bu qator skriptning oxirgi qatori bo'lsa, skriptning chiqish kodi 1 bo'ladi.)
5. `Illegal option -o pipefail` — dash 0.5.12-2 bu parametrni bilmaydi.

</details>

## Rasmiy hujjat

- [Debian Reference 12.1](https://www.debian.org/doc/manuals/debian-reference/ch12.en.html#_the_shell_script) — skript, shebang
- [Debian Reference 12.1.1](https://www.debian.org/doc/manuals/debian-reference/ch12.en.html#_posix_shell_compatibility) — dash, bashism'lar
- [Debian Reference 12.1.2](https://www.debian.org/doc/manuals/debian-reference/ch12.en.html#_shell_parameters) — `$0`, `$1`, `$#`, `"$@"`, `${var:-string}`
- [GNU Bash: Shell Scripts](https://www.gnu.org/software/bash/manual/bash.html#Shell-Scripts) — `#!`, `PATH` bo'yicha qidirish, `#!/usr/bin/env bash`
- [GNU Bash: The Set Builtin](https://www.gnu.org/software/bash/manual/bash.html#The-Set-Builtin) — `-e`, `-u`, `-n`, `-x`, `pipefail`
- [GNU Bash: Pipelines](https://www.gnu.org/software/bash/manual/bash.html#Pipelines) — pipeline chiqish kodi
