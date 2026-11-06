# 14 — Kengaytmalar va qo'shtirnoq

[← Oldingi: O'zgaruvchilar va muhit](13-ozgaruvchilar.md) · [Mundarija](README.md) · [Keyingi: Bash'ni sozlash →](15-bash-sozlash.md)

## Tushuncha

Siz yozgan qator buyruqqa **aynan** shu holida yetib bormaydi. Avval qobiq (shell) uni o'zgartiradi:

- `~` → uy papkasi;
- `$USER` → `root`;
- `*.log` → fayllar ro'yxati.

Buyruq faqat shundan keyin ishga tushadi. Bu **kengaytma** (expansion) deyiladi. "Fayl topilmadi", "probelli nom ikkiga bo'linib ketdi", "skriptda `$` almashib ketdi" kabi xatolarning ko'pi shu yerdan chiqadi.

Bash qo'llanmasiga ko'ra kengaytmalar qat'iy tartibda bajariladi:

1. jingalak qavs (brace);
2. tilde, o'zgaruvchi, buyruq o'rniga qo'yish va arifmetika (chapdan o'ngga, bir bosqichda);
3. so'zlarga bo'lish (word splitting);
4. fayl nomlari (filename expansion, glob);
5. qo'shtirnoqlarni olib tashlash (quote removal) — har doim oxirida.

<div data-animatsiya="kengaytma"></div>

Natijani o'zingiz ko'rishning eng oson yo'li — `set -x`. Debian Reference'ga ko'ra u qobiq (shell) bajarayotgan har bir buyruqni chiqarib boradi. Bu nosozliklarni topishda juda qo'l keladi:

```text
$ mkdir -p /tmp/kg && cd /tmp/kg && touch a.txt b.txt c.log "mening fayl.txt"
$ set -x; echo ~/{a,b}.log "$USER" $(date +%Y) *.log; set +x
++ date +%Y
+ echo /root/a.log /root/b.log root 2026 c.log
/root/a.log /root/b.log root 2026 c.log
+ set +x
```

`+` bilan boshlangan qator — kengaytmadan **keyin** `echo` ga aynan nima berilgani. `++` — ichki buyruq (`date`).

## Har bir kengaytma

### Jingalak qavs: `{a,b}` va `{1..5}`

```text
$ echo {1..5}
1 2 3 4 5
$ echo fayl-{a,b,c}.txt
fayl-a.txt fayl-b.txt fayl-c.txt
$ mkdir -p loyiha/{src,test,docs} && ls loyiha
docs  src  test
```

Bash qo'llanmasiga ko'ra bu fayl nomlariga o'xshaydi, lekin yasalgan nomlar **mavjud bo'lishi shart emas**. Bir nechta papkani bir buyruqda yaratishda qulay.

### Tilde: `~`

```text
$ echo ~ ~root
/root /root
```

`~` — sizning uy papkangiz, `~nom` — boshqa foydalanuvchiniki (Debian Reference 1.5.4).

### O'zgaruvchi: `$NOM`, `${NOM:-standart}`

```text
$ echo "${PORT:-3000}"
3000
$ PORT=8080; echo "${PORT:-3000}"
8080
```

Bash qo'llanmasiga ko'ra `${NOM:-qiymat}` o'zgaruvchi bo'sh yoki o'rnatilmagan bo'lsa, berilgan standart qiymatni qaytaradi. Skriptlarda sozlamaning standart qiymati uchun qulay.

### Buyruq o'rniga qo'yish: `$(...)`

```text
$ echo "Bugun: $(date +%F)"
Bugun: 2026-11-06
```

`$(buyruq)` o'rniga shu buyruqning chiqishi qo'yiladi. Eski yozuvi — teskari tirnoq: `` `buyruq` ``.

### Arifmetika: `$((...))`

```text
$ echo $((2 + 3 * 4))
14
```

### Fayl nomlari: `*`, `?`, `[...]`

Debian Reference'dagi qoidalar:

| Belgi | Nimaga mos keladi |
| --- | --- |
| `*` | Istalgan belgilar (bo'sh ham) |
| `?` | Bitta istalgan belgi |
| `[...]` | Qavs ichidagi belgilardan bittasi |

```text
$ echo *.txt
a.txt b.txt mening fayl.txt
$ echo ?.txt
a.txt b.txt
$ echo [ab].txt
a.txt b.txt
$ echo *.yoq
*.yoq
```

Oxirgisiga e'tibor bering: mos fayl topilmasa, bash shablonni **o'zgartirmasdan** qoldiradi. `rm *.yoq` "fayl topilmadi" deydi, chunki u `*.yoq` degan faylni qidiradi.

## Qo'shtirnoq

Bash qo'llanmasiga ko'ra:

| Yozuv | Nima bo'ladi |
| --- | --- |
| `'...'` (bitta tirnoq) | **Hech narsa** almashtirilmaydi, har belgi o'zi bo'lib qoladi |
| `"..."` (qo'sh tirnoq) | Bitta so'z bo'lib qoladi, lekin `$`, `` ` `` va `\` ishlaydi |
| `\` | Keyingi bitta belgini oddiy qiladi |

```text
$ echo "$HOME" '$HOME'
/root $HOME
$ echo "narx: \$5"
narx: $5
$ echo 'Unda "qo'"'"'shtirnoq" bor'
Unda "qo'shtirnoq" bor
```

Oxirgi misol: bitta tirnoq ichida bitta tirnoq yozib bo'lmaydi. Shuning uchun matn uch bo'lakdan yig'iladi: `'...qo'` + `"'"` + `'shtirnoq" bor'`.

## Asosiy tuzoq: so'zlarga bo'lish

Bash qo'llanmasiga ko'ra o'zgaruvchi va `$(...)` natijasi, agar **qo'sh tirnoq ichida bo'lmasa**, probellar bo'yicha so'zlarga bo'linadi:

```text
$ NOM="mening fayl.txt"
$ ls $NOM
ls: cannot access 'mening': No such file or directory
ls: cannot access 'fayl.txt': No such file or directory
$ ls "$NOM"
'mening fayl.txt'
```

Qo'shtirnoqsiz `$NOM` `ls` ga **ikki** argument bo'lib bordi. `"$NOM"` esa bitta argument bo'lib qoldi.

**Qoida: o'zgaruvchini deyarli har doim qo'sh tirnoqqa oling: `"$NOM"`.** Ayniqsa `rm`, `cp`, `mv` va skriptlarda. Qo'shtirnoqsiz `rm -rf $PAPKA/` o'zgaruvchi bo'sh bo'lsa, `rm -rf /` ga aylanadi (48-bob).

## Debian va Ubuntu

Kengaytmalarni bash bajaradi, ular ikkala tizimda bir xil. Debian'dagi `sh` (dash) esa bash'ning ayrim kengaytmalarini bilmaydi, masalan `{a,b}`. Shuning uchun skriptning birinchi qatori muhim (48-bob).

## Tipik xatolar

**1. O'zgaruvchini qo'shtirnoqsiz ishlatish.**
Probelli fayl nomi ikkiga bo'linadi, bo'sh o'zgaruvchi esa butunlay yo'qoladi.
To'g'risi: `"$NOM"`.

**2. Bitta tirnoq ichida o'zgaruvchi kutish.**
`echo 'Salom $USER'` aynan `$USER` ni chiqaradi.
To'g'risi: `"Salom $USER"`.

**3. Glob topmasa nima bo'lishini bilmaslik.**
`for f in *.log` papkada log bo'lmasa, `f` ga `*.log` matnining o'zi tushadi.
To'g'risi: siklda faylning borligini tekshiring (49-bob).

**4. Kengaytmani ko'rmasdan xavfli buyruq bajarish.**
To'g'risi: avval `echo` bilan tekshiring (`echo rm *.tmp`) yoki `set -x` yoqing.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=14-kengaytmalar)** "Kengaytmalar bilan ishlash": bir buyruqda papkalar yaratasiz, probelli fayl bilan ishlaysiz va natijani `set -x` bilan tekshirasiz.

Savollar:

1. `echo ~/*.txt` qaysi tartibda kengayadi?
2. Nega `ls $NOM` ikki xato berdi?
3. `echo '$((1+1))'` va `echo "$((1+1))"` nima chiqaradi?
4. `mkdir -p app/{logs,data,tmp}` nechta papka yaratadi?

<details>
<summary>Javoblar</summary>

1. Avval `~` (tilde), keyin `*.txt` (fayl nomlari). Jingalak qavs yo'q.
2. Qo'shtirnoqsiz o'zgaruvchi probel bo'yicha ikki so'zga bo'lindi.
3. Birinchisi `$((1+1))` (bitta tirnoqda hech narsa almashmaydi), ikkinchisi `2`.
4. Uchta (va kerak bo'lsa `app` ning o'zini).

</details>

## Rasmiy hujjat

- [Bash Reference Manual — Shell Expansions](https://www.gnu.org/software/bash/manual/bash.html#Shell-Expansions)
- [Bash Reference Manual — Quoting](https://www.gnu.org/software/bash/manual/bash.html#Quoting)
- [Bash Reference Manual — Shell Parameter Expansion](https://www.gnu.org/software/bash/manual/bash.html#Shell-Parameter-Expansion)
- [Bash Reference Manual — Word Splitting](https://www.gnu.org/software/bash/manual/bash.html#Word-Splitting)
- [Ubuntu Server — The command line in depth: Shell expansion](https://ubuntu.com/server/docs/tutorial/cli-in-depth/)
- [Debian Reference 12.1.6 — The shell command-line processing sequence](https://www.debian.org/doc/manuals/debian-reference/ch12.en.html#_the_shell_command_line_processing_sequence)
- [Debian Reference 1.5.6 — Shell glob](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_shell_glob)
- [glob(7)](https://man7.org/linux/man-pages/man7/glob.7.html)
