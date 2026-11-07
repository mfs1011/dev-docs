# 49 — Shart va sikl

[← Oldingi: Birinchi skript](48-birinchi-skript.md) · [Mundarija](README.md) · [Keyingi: Funksiya va xatolar →](50-funksiya-va-xatolar.md)

## Tushuncha

Skript har doim bir xil buyruqlarni bajarsa, uning foydasi kam. Vaziyatga qarab boshqacha ish qilish uchun **shart** (conditional), bir ishni ko'p narsa uchun takrorlash uchun **sikl** (loop) kerak.

Qobiq (shell)da shartning asosi oddiy: Debian Reference (12.1.3) bo'yicha har buyruq chiqish kodini qaytaradi va shartda shu ishlatiladi:

| Kod | Ma'nosi shartda |
| --- | --- |
| `0` | Muvaffaqiyat — **rost** (true) |
| `0` dan farqli | Xato — **yolg'on** (false) |

Debian Reference alohida eslatadi: C tilida `0` — yolg'on, qobiqda esa aksincha — rost.

| Tuzilma | Nima qiladi |
| --- | --- |
| `if … then … else … fi` | Shart rost bo'lsa bir ish, aks holda boshqasi |
| `test` / `[ ]` / `[[ ]]` | Fayl, matn va sonni tekshirib, `0` yoki `1` qaytaradi |
| `case … esac` | Qiymatni bir nechta naqsh bilan solishtirish |
| `for` | Ro'yxatdagi har element uchun takrorlash |
| `while` / `until` | Shart rost (yoki yolg'on) ekan takrorlash |

Bu bobdagi buyruqlar uchun alohida papka ochamiz:

```text
$ mkdir sikl && cd sikl
$ touch a.log "b c.log" eski.txt
$ ls
 a.log	'b c.log'   eski.txt
```

`ls` bo'sh joyli nomni qo'shtirnoqqa olib ko'rsatdi: `'b c.log'` — bitta fayl.

## if: buyruq — shart

Bash qo'llanmasi: `if` dan keyingi buyruqlar bajariladi, chiqish kodi `0` bo'lsa — `then` qismi, aks holda (`elif` lar ham rost bo'lmasa) — `else` qismi. Shart sifatida **istalgan buyruq** ishlatilishi mumkin:

```text
$ if grep -q '^root:' /etc/passwd; then echo "root bor"; else echo "root yo'q"; fi
root bor
$ if grep -q '^qovun:' /etc/passwd; then echo "qovun bor"; else echo "qovun yo'q"; fi
qovun yo'q
```

`grep -q` hech narsa chiqarmaydi, faqat kod qaytaradi (18-bob) — shart uchun aynan shu kerak.

Skriptda `if` odatda bir necha qatorga yoziladi. Bash qo'llanmasi: sintaksisdagi har `;` o'rniga yangi qator yozish mumkin.

## test va [ ]

Ko'pincha shart — buyruq emas, savol: "fayl bormi?", "o'zgaruvchi bo'shmi?". Buning uchun `test` buyrug'i bor. `[` — uning boshqa nomi (Debian Reference 12.1.3), faqat oxirgi argument `]` bo'lishi shart.

Debian Reference jadvallaridan eng kerakligi:

| Fayl | Rost, agar… | Matn | Rost, agar… | Son | Rost, agar… |
| --- | --- | --- | --- | --- | --- |
| `-e f` | `f` mavjud | `-z s` | `s` bo'sh | `a -eq b` | teng |
| `-f f` | oddiy fayl | `-n s` | `s` bo'sh emas | `a -ne b` | teng emas |
| `-d f` | papka | `s1 = s2` | teng | `a -lt b` | kichik |
| `-x f` | bajariladigan | `s1 != s2` | teng emas | `a -gt b` | katta |

```text
$ [ -f "b c.log" ] && echo "fayl bor"
fayl bor
$ [ -d "b c.log" ] || echo "papka emas"
papka emas
$ s=; [ -z "$s" ] && echo "bo'sh"
bo'sh
$ [ 10 -lt 9 ] && echo "10 < 9"; [ 10 \< 9 ] && echo "matn sifatida 10 < 9"
matn sifatida 10 < 9
```

Oxirgi qator: sonlar `-lt` bilan solishtiriladi. `<` — matn solishtirish (Debian Reference: "sorts before"), `"10"` matn sifatida `"9"` dan oldin keladi. `[ ]` ichida `<` ni `\` bilan himoyalash kerak, aks holda qobiq uni yo'naltirish deb tushunadi (11-bob).

### `[ ]` ning tuzoqlari

Bash qo'llanmasi: `test` da **har operator va operand alohida argument** bo'lishi kerak. `[` — oddiy buyruq, shuning uchun bo'sh joylar majburiy:

```text
$ a=x; [ "$a"="b" ] && echo "teng?"
teng?
$ [$a = x] && echo ok
-bash: [x: command not found
$ b=; [ $b = x ]; echo "kod: $?"
-bash: [: =: unary operator expected
kod: 2
```

1. `"$a"="b"` — bo'sh joysiz bitta argument (`x=b`). Bash qo'llanmasi: bitta argumentli ifoda argument bo'sh bo'lmasa — rost. Shuning uchun `x` va `b` "teng" chiqdi.
2. `[$a` — `[x` degan buyruq qidirildi.
3. Bo'sh `$b` qo'shtirnoqsiz yo'qolib qoldi, `[ = x ]` qoldi — xato, kod `2`.

Qoida: `[ ]` ichida o'zgaruvchilar doim qo'shtirnoqda, har belgi atrofida bo'sh joy: `[ "$b" = x ]`.

## [[ ]]: bash'ning sharti

`[[ ]]` — bash'ning o'z tuzilmasi (dash'da yo'q, 48-bob). Bash qo'llanmasi: `[[` va `]]` orasidagi so'zlar **bo'linmaydi va fayl nomiga yoyilmaydi**. Shuning uchun:

```text
$ b=; [[ $b = x ]]; echo "kod: $?"
kod: 1
$ f=jurnal.log; [[ $f == *.log ]] && echo "log fayl"
log fayl
$ [ "$f" == *.log ] && echo "log fayl"; echo "kod: $?"
-bash: [: too many arguments
kod: 2
$ v=26.04; [[ $v =~ ^[0-9]+\.[0-9]+$ ]] && echo "versiya: $v"
versiya: 26.04
$ sh -c '[[ a == a ]]'
sh: 1: [[: not found
```

- Bo'sh `$b` qo'shtirnoqsiz ham xato bermadi — oddiy "teng emas" (`1`).
- `==` ning o'ng tomoni — **naqsh** (pattern): `*.log` "`.log` bilan tugaydi" degani. Naqshning qo'shtirnoqdagi qismi esa aynan solishtiriladi.
- `[ ]` da esa `*.log` joriy papkadagi fayllarga yoyildi (`a.log`, `b c.log`) va argument ko'payib ketdi.
- `=~` — o'ng tomoni kengaytirilgan muntazam ifoda (ERE, 18-bob).
- `sh` (dash) `[[` ni bilmaydi.

## case: naqsh bo'yicha tanlash

Bash qo'llanmasi: `case` so'zni naqshlar bilan yuqoridan pastga solishtiradi va **birinchi** mos kelgan naqshning buyruqlarini bajaradi. `|` — "yoki", oxirgi `*)` — "qolgan hamma holat". Har bo'lim `;;` bilan tugaydi.

Skriptlarda `case` ko'pincha birinchi argumentni ajratish uchun ishlatiladi:

```text
$ cat > xizmat.sh <<'EOF'
> #!/bin/sh
> case "$1" in
>   start|boshla) echo "ishga tushirilmoqda" ;;
>   stop)         echo "to'xtatilmoqda" ;;
>   *.conf)       echo "sozlama fayli: $1" ;;
>   *)            echo "foydalanish: $0 start|stop|FAYL.conf" >&2; exit 1 ;;
> esac
> EOF
$ chmod +x xizmat.sh
$ ./xizmat.sh boshla
ishga tushirilmoqda
$ ./xizmat.sh nginx.conf
sozlama fayli: nginx.conf
$ ./xizmat.sh qayta; echo "kod: $?"
foydalanish: ./xizmat.sh start|stop|FAYL.conf
kod: 1
```

`case` — POSIX tuzilma, dash'da ham ishlaydi: `[[ == ]]` siz naqsh bilan solishtirishning yo'li.

## for: ro'yxat bo'yicha

Debian Reference (12.1.4): `for x in foo1 foo2 …; do buyruq; done` — `x` ga ro'yxatdagi elementlar navbatma-navbat beriladi. Ro'yxat ko'pincha naqsh (glob) dan olinadi:

```text
$ for f in *.log; do echo "[$f]"; done
[a.log]
[b c.log]
$ for f in $(ls *.log); do echo "[$f]"; done
[a.log]
[b]
[c.log]
```

<div data-animatsiya="qadamli" data-nom="sikl"></div>

- `*.log` — qobiq har fayl nomini **bitta so'z** qilib beradi: `b c.log` butun qoldi.
- `$(ls …)` — `ls` chiqishi matn, qobiq uni bo'sh joydan bo'ladi: `b` va `c.log` — ikki "fayl".

Qoida: fayllar ustida sikl — glob bilan, `$(ls)` bilan emas. Sikl ichida — `"$f"`.

Mos fayl bo'lmasa, glob o'zgarmay qoladi:

```text
$ for f in *.csv; do echo "[$f]"; done
[*.csv]
$ for f in *.csv; do [ -e "$f" ] || continue; echo "[$f]"; done
```

Birinchi siklda `*.csv` degan "fayl" bilan ishlandi. Debian Reference (9.4.9) misolida shuning uchun sikl ichida fayl bor-yo'qligi tekshiriladi. `continue` — keyingi aylanishga o'tish, `break` — sikldan chiqish (12.1.4).

Sonlar bo'yicha sikl: Debian Reference `seq(1)` ni maslahat beradi. bash'da C uslubidagi `for (( ; ; ))` ham bor (dash'da yo'q):

```text
$ for i in $(seq 1 3); do echo "qadam $i"; done
qadam 1
qadam 2
qadam 3
$ for ((i=1; i<=3; i++)); do echo "qadam $i"; done
qadam 1
qadam 2
qadam 3
```

Sikl va 48-bobdagi `${o'zgaruvchi%naqsh}` (oxiridan eng qisqa mosni olib tashlash, Debian Reference 12.1.2) birga — fayllarni ommaviy qayta nomlash:

```text
$ for f in *.log; do mv -- "$f" "${f%.log}.txt"; done
$ ls
 a.txt	'b c.txt'   eski.txt   xizmat.sh
```

`--` — opsiyalar shu yerda tugadi (2-bob): `-` bilan boshlanadigan fayl nomi ham opsiya deb tushunilmaydi.

## while read: qatorma-qator o'qish

`while` — shart rost ekan takrorlaydi; `until` — aksincha, shart rost bo'lguncha (Debian Reference 12.1.4). Eng ko'p uchraydigan ishlatilishi — faylni qatorma-qator o'qish, `read` buyrug'i bilan:

```text
$ printf '%s\n' 'C:\temp' '  ikki probel' > yol.txt
$ while read q; do echo "[$q]"; done < yol.txt
[C:temp]
[ikki probel]
$ while IFS= read -r q; do echo "[$q]"; done < yol.txt
[C:\temp]
[  ikki probel]
```

Bash qo'llanmasi (`read`):

- `\` standart holatda maxsus belgi: `C:\temp` dagi `\` yo'qoldi. `-r` bilan `\` oddiy belgi bo'lib qoladi.
- Qator `IFS` dagi belgilar bo'yicha so'zlarga bo'linadi va boshi-oxiridagi bo'sh joylar olib tashlanadi. `IFS=` (bo'sh) — bo'lish yo'q, qator o'zgarmaydi.

Shuning uchun qatorni o'zgartirmasdan o'qish — `while IFS= read -r q`.

Bir nechta nom berilsa, `read` qatorni bo'lib, so'zlarni ularga tarqatadi. `IFS=:` bilan `/etc/passwd` (22-bob) ni ustunlarga ajratamiz; keraksiz ustunlar `_` ga:

```text
$ while IFS=: read -r nom _ uid _; do [ "$uid" -ge 1000 ] && echo "$nom $uid"; done < /etc/passwd
nobody 65534
```

Bash qo'llanmasi: so'zlar nomlardan ko'p bo'lsa, qolgani **oxirgi** nomga tushadi — shuning uchun oxirgi `_` qolgan barcha ustunlarni oldi.

### Tuzoq: pipe va while

```text
$ n=0; cat yol.txt | while read -r q; do n=$((n+1)); done; echo "n=$n"
n=0
$ n=0; while read -r q; do n=$((n+1)); done < yol.txt; echo "n=$n"
n=2
```

Bash qo'llanmasi (Pipelines): ko'p buyruqli pipeline'dagi har buyruq **alohida qobiqcha**da (subshell, alohida jarayon) bajariladi. `while` qobiqchada `n` ni oshirdi, lekin bu o'zgarish asosiy qobiqqa qaytmadi. Faylni `< fayl` bilan bersangiz, sikl joriy qobiqda ishlaydi.

## Fayllarni xavfsiz aylanish

Fayl nomida bo'sh joy, hatto yangi qator ham bo'lishi mumkin. Debian Reference (9.4.9) shunday nomlarni to'g'ri ishlaydigan usullarni beradi: glob bilan `for`, `find -print0 | xargs -0` va `find -exec` (19-bob). `find` natijasini siklda ishlash kerak bo'lsa — nomlarni NUL belgi bilan ajratib o'qish. Bash qo'llanmasi: `read -d ''` qatorni NUL belgida tugatadi:

```text
$ find . -name '*.txt' -print0 | while IFS= read -r -d '' f; do echo "[$f]"; done
[./eski.txt]
[./a.txt]
[./b c.txt]
[./yol.txt]
```

NUL belgisi fayl nomida bo'la olmaydi, shuning uchun bu usul har qanday nomda ishlaydi. `-d ''` — bash imkoniyati (dash `read` ida yo'q), skript `#!/bin/bash` bilan bo'lsin.

Tozalash:

```text
$ cd .. && rm -rf sikl
```

## Debian va Ubuntu

Shu bobdagi tuzilmalar ikkala tizimda bir xil ishlaydi: Debian 12 da bash 5.2, Ubuntu 26.04 da bash 5.3, ikkalasida `/bin/sh` — dash (48-bob). VPS'da ikkita tuzoq va `/etc/passwd` misoli:

```text vps
$ bash --version | head -1
GNU bash, version 5.3.9(1)-release (x86_64-pc-linux-gnu)
$ a=x; [ "$a"="b" ] && echo "teng?"
teng?
$ printf "%s\n" a b > yol.txt; n=0; cat yol.txt | while read -r q; do n=$((n+1)); done; echo "n=$n"
n=0
$ while IFS=: read -r nom _ uid _; do [ "$uid" -ge 1000 ] && echo "$nom $uid"; done < /etc/passwd
nobody 65534
```

Natija trenajordagi bilan bir xil. VPS'da ham UID 1000 dan katta oddiy foydalanuvchi yo'q (biz root bilan ishlaymiz, 45-bob), faqat `nobody`.

## Tipik xatolar

**1. `[` atrofida bo'sh joy yo'q.**
`[$a = x]` — `[x: command not found`; `[ "$a"="b" ]` — doim rost.
To'g'risi: `[ "$a" = "b" ]`.

**2. Qo'shtirnoqsiz o'zgaruvchi `[ ]` ichida.**
Bo'sh bo'lsa — `unary operator expected`.
To'g'risi: `[ "$b" = x ]` yoki bash'da `[[ $b = x ]]`.

**3. Sonlarni `<`, `>` bilan solishtirish.**
`[ 10 \< 9 ]` — rost (matn sifatida).
To'g'risi: `-lt`, `-gt`.

**4. `for f in $(ls)`.**
Bo'sh joyli nomlar bo'linadi.
To'g'risi: `for f in *`, ichida `"$f"`.

**5. `while read` da `-r` va `IFS=` yo'q.**
`\` yo'qoladi, boshidagi bo'sh joylar kesiladi.
To'g'risi: `while IFS= read -r q`.

**6. `… | while` ichida o'zgaruvchini o'zgartirish.**
Sikl qobiqchada — o'zgarish yo'qoladi.
To'g'risi: `while …; done < fayl`.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=49-sikl)** "Shart va sikl": bo'sh joyli nomlar ustida glob va `$(ls)` ni solishtirasiz, `case` li skript yozasiz va fayllarni sikl bilan qayta nomlaysiz.

Savollar:

1. `if` ning sharti nima bo'lishi mumkin?
2. `[ "$a"="b" ]` nega har doim rost?
3. `[[ $f == *.log ]]` va `[ "$f" == *.log ]` ning farqi nimada?
4. Papkada `.csv` fayl yo'q. `for f in *.csv; do rm "$f"; done` nima qiladi?
5. `cat f | while read -r q; do n=$((n+1)); done` dan keyin `n` nega o'zgarmagan?

<details>
<summary>Javoblar</summary>

1. Istalgan buyruq: chiqish kodi `0` — rost, boshqasi — yolg'on.
2. Bo'sh joysiz `"$a"="b"` bitta argument; bitta argumentli `test` u bo'sh bo'lmasa rost.
3. `[[ ]]` da `*.log` naqsh sifatida solishtiriladi; `[ ]` da u joriy papkadagi fayllarga yoyiladi.
4. `rm "*.csv"` ni bajaradi — `No such file or directory`. Oldini olish: `[ -e "$f" ] || continue`.
5. Pipeline'dagi `while` alohida qobiqchada ishladi. To'g'risi: `done < f`.

</details>

## Rasmiy hujjat

- [Debian Reference 12.1.3](https://www.debian.org/doc/manuals/debian-reference/ch12.en.html#_shell_conditionals) — shartlar, `test` operatorlari
- [Debian Reference 12.1.4](https://www.debian.org/doc/manuals/debian-reference/ch12.en.html#_shell_loops) — `for`, `while`, `until`, `break`, `continue`
- [Debian Reference 9.4.9](https://www.debian.org/doc/manuals/debian-reference/ch09.en.html#_repeating_a_command_looping_over_files) — fayllar ustida sikl
- [GNU Bash: Conditional Constructs](https://www.gnu.org/software/bash/manual/bash.html#Conditional-Constructs) — `if`, `case`, `[[ ]]`
- [GNU Bash: Looping Constructs](https://www.gnu.org/software/bash/manual/bash.html#Looping-Constructs) — `for`, `while`, `until`
- [GNU Bash: Bourne Shell Builtins](https://www.gnu.org/software/bash/manual/bash.html#Bourne-Shell-Builtins) — `test`, `[`
- [GNU Bash: Bash Builtins](https://www.gnu.org/software/bash/manual/bash.html#Bash-Builtins) — `read`
- [GNU Bash: Pipelines](https://www.gnu.org/software/bash/manual/bash.html#Pipelines) — pipeline buyruqlari qobiqchada
