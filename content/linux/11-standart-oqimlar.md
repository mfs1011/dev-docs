# 11 — Standart oqimlar

[← Oldingi: Disk va mount](10-disk-va-mount.md) · [Mundarija](README.md) · [Keyingi: Pipe va buyruqlar zanjiri →](12-pipe.md)

## Tushuncha

Ubuntu hujjatiga ko'ra ishlayotgan har bir dasturda standart holatda **uchta aloqa kanali** ochiq bo'ladi:

| Raqam | Nomi | Nima uchun | Standart holatda |
| --- | --- | --- | --- |
| `0` | **stdin** (standart kirish) | Dastur ma'lumotni shu yerdan oladi | Klaviatura |
| `1` | **stdout** (standart chiqish) | Dastur natijasini shu yerga yozadi | Ekran |
| `2` | **stderr** (standart xato) | Dastur xato xabarlarini shu yerga yozadi | Ekran, lekin **alohida** kanal |

Raqamlar — **fayl deskriptorlari** (file descriptor): dastur ochgan "fayl"larning tartib raqami. Ubuntu hujjati bu oqimlarning nega uchta ekanini ham tushuntiradi: natija va xatolar alohida bo'lgani uchun natijani faylga saqlab, xatolarni ekranda ko'rish yoki xatolarni butunlay o'chirib, faqat natijani olish mumkin.

Dasturning ochiq deskriptorlarini `/proc` ko'rsatadi (9-bob):

```text
$ mkdir -p /tmp/oqim && cd /tmp/oqim
$ ls -l /proc/self/fd
total 0
lrwx------ 1 root root 64 Nov  6 02:05 0 -> /dev/ttyS0
lrwx------ 1 root root 64 Nov  6 02:05 1 -> /dev/ttyS0
lrwx------ 1 root root 64 Nov  6 02:05 2 -> /dev/ttyS0
lr-x------ 1 root root 64 Nov  6 02:05 3 -> /proc/178/fd
```

`0`, `1` va `2` uchalasi ham terminalga ulangan. Trenajorda terminal — `/dev/ttyS0` serial porti. (`3` — `ls` ning o'zi `/proc/self/fd` ni o'qish uchun ochgan papka.)

**Yo'naltirish** (redirection) — shu kanallarni buyruq ishga tushishidan oldin boshqa joyga burish. Bash qo'llanmasiga ko'ra bu ishni dastur emas, **qobiq (shell)** qiladi: `ls` o'zi faylga yozayotganini bilmaydi ham.

<div data-animatsiya="oqim"></div>

## stdout va stderr — ikki xil kanal

Bitta buyruq ham natija, ham xato chiqaradigan holat:

```text
$ ls /etc/hostname /yoq
ls: cannot access '/yoq': No such file or directory
/etc/hostname
```

Ekranda ikkalasi aralash ko'rinadi, lekin ular ikki xil kanaldan keldi. Ularni ajratamiz.

### `>` — natijani faylga

```text
$ ls /etc/hostname /yoq > natija.txt
ls: cannot access '/yoq': No such file or directory
$ cat natija.txt
/etc/hostname
```

`>` `1>` ning qisqa yozuvi. Bash qo'llanmasiga ko'ra fayl bo'lmasa, yaratiladi. Fayl bo'lsa, u **nol hajmgacha kesiladi**, ya'ni eski mazmuni o'chadi. Xato ekranda qoldi.

### `2>` — xatolarni faylga

```text
$ ls /etc/hostname /yoq 2> xato.txt
/etc/hostname
$ cat xato.txt
ls: cannot access '/yoq': No such file or directory
```

### Ikkalasini bitta faylga

```text
$ ls /etc/hostname /yoq > hammasi.txt 2>&1
$ cat hammasi.txt
ls: cannot access '/yoq': No such file or directory
/etc/hostname
$ ls /etc/hostname /yoq &> ikkalasi.txt
$ cat ikkalasi.txt
ls: cannot access '/yoq': No such file or directory
/etc/hostname
```

`2>&1` — "2-kanalni 1-kanal ketayotgan joyga yo'naltir". `&>` esa Bash qo'llanmasiga ko'ra `>fayl 2>&1` ning qisqa yozuvi. Ikkalasi bir xil natija beradi. `&>` faqat bash'da ishlaydi. Debian'dagi `sh` (dash, 48-bob) uni `&` (fonda ishga tushirish) va bo'sh `>` deb tushunadi, natijada xato faylga tushmaydi:

```text
$ cd /tmp && sh -c "ls /yoq &> f.txt; sleep 0.2; echo fayl:; cat f.txt"
ls: cannot access '/yoq': No such file or directory
fayl:
```

`> fayl 2>&1` esa ikkala qobiqda (shell) ham ishlaydi.

### Tartib muhim

Bash qo'llanmasining o'z misoli:

```text
$ ls /etc/hostname /yoq 2>&1 > faqat.txt
ls: cannot access '/yoq': No such file or directory
$ cat faqat.txt
/etc/hostname
```

Xato faylga emas, ekranga chiqdi. Sababi: yo'naltirishlar **chapdan o'ngga** bajariladi. `2>&1` bajarilganda 1-kanal hali ekranga ketayotgan edi, shuning uchun 2-kanal ham ekranga "qotib qoldi". Keyingi `> faqat.txt` faqat 1-kanalni o'zgartirdi. Yuqoridagi animatsiyaning 4–7-qadamlari shuni ko'rsatadi.

Qoida: **avval fayl, keyin `2>&1`**: `buyruq > fayl 2>&1`.

## `>>` — oxiriga qo'shish

```text
$ echo bir > log.txt
$ echo ikki >> log.txt
$ cat log.txt
bir
ikki
$ echo uch > log.txt
$ cat log.txt
uch
```

`>>` faylni kesmaydi, yangi qatorni oxiriga qo'shadi. `>` esa birinchi ikki qatorni so'roqsiz o'chirib yubordi.

### `noclobber`: tasodifan ustidan yozishdan himoya

Bash qo'llanmasiga ko'ra `set -o noclobber` yoqilgan bo'lsa, `>` mavjud faylni qayta yozmaydi. Ataylab yozish uchun `>|` ishlatiladi:

```text
$ set -o noclobber
$ echo tort > log.txt
-bash: log.txt: cannot overwrite existing file
$ echo tort >| log.txt
$ set +o noclobber
```

`set -o` yoqadi, `set +o` o'chiradi. Doimiy qilish uchun `~/.bashrc` ga yoziladi (15-bob).

## Kirishni yo'naltirish: `<`, here-document, here-string

`<` faylni buyruqning **stdin**'iga beradi:

```text
$ wc -l < /etc/passwd
20
$ wc -l /etc/passwd
20 /etc/passwd
```

Farqiga qarang: ikkinchi holatda `wc` faylni o'zi ochdi va nomini ham chiqardi. Birinchisida u faqat oqimni ko'rdi va fayl nomini bilmaydi.

**Here-document** (`<<`) — bir necha qator matnni to'g'ridan-to'g'ri buyruqqa berish. Bash qo'llanmasiga ko'ra matn ajratuvchi so'z yolg'iz turgan qatorgacha o'qiladi:

```text
$ cat <<EOF
> Salom, $USER
> Uy papkangiz: $HOME
> EOF
Salom, root
Uy papkangiz: /root
$ cat <<'EOF'
> Salom, $USER
> EOF
Salom, $USER
```

- `>` bilan boshlangan qatorlar qobiqning (shell) davom etish belgisi (PS2), ularni yozmaysiz.
- Ajratuvchi qo'shtirnoqsiz bo'lsa (`EOF`), matn ichidagi `$USER` almashtiriladi.
- Qo'shtirnoq ichida bo'lsa (`'EOF'`), matn **aynan** qoladi.

Konfiguratsiya faylini skript ichidan yaratishda shu juda qulay. Agar matnda `$` bo'lsa, qo'shtirnoqli variantni ishlating.

**Here-string** (`<<<`) — bitta qatorni stdin'ga berish:

```text
$ wc -w <<< "bir ikki uch"
3
```

## O'z skriptingizda: xatoni stderr'ga

Skriptdagi xato xabari ham 2-kanalga yozilishi kerak. Shunda foydalanuvchi natijani faylga yo'naltirsa, xato xabari faylga aralashmaydi:

```text
$ echo "xato xabari" >&2
xato xabari
```

`>&2` — `1>&2` ning qisqa yozuvi: "1-kanalni 2-kanalga".

## Variantlar

| Maqsad | Yozuv | Izoh |
| --- | --- | --- |
| Natijani faylga, xatoni ekranga | `buyruq > fayl` | Eng ko'p ishlatiladi |
| Xatolarni alohida faylga | `buyruq 2> xato.log` | |
| Hammasini bitta faylga | `buyruq > fayl 2>&1` | Har qanday `sh` da ishlaydi |
| Hammasini bitta faylga (bash) | `buyruq &> fayl` | Qisqa, faqat bash |
| Faylga qo'shish | `buyruq >> fayl 2>&1` | Loglar uchun |
| Xatolarni yo'q qilish | `buyruq 2>/dev/null` | Ehtiyot bo'ling (9-bob) |
| Natijani ham ko'rish, ham saqlash | `buyruq \| tee fayl` | 12-bob |

## Debian va Ubuntu

Yo'naltirishni bash bajaradi. Bash ikkala tizimda ham bor: trenajorda 5.2, VPS'da 5.3. Bu bobdagi hamma narsa ikkalasida bir xil ishlaydi.

## Tipik xatolar

**1. `2>&1` ni oldin yozish.**
`buyruq 2>&1 > fayl` xatolarni faylga emas, ekranga chiqaradi.
To'g'risi: `buyruq > fayl 2>&1`.

**2. `>` bilan muhim faylni tasodifan o'chirish.**
`sort data.txt > data.txt` — qobiq (shell) avval `data.txt` ni bo'shatadi, keyin `sort` bo'sh faylni o'qiydi:

```text
$ cd /tmp && printf "c\nb\na\n" > data.txt && sort data.txt > data.txt; wc -c data.txt
0 data.txt
```
To'g'risi: boshqa faylga yozing, keyin `mv`. Yoki `set -o noclobber`.

**3. Xato xabarini stdout'ga yozish.**
Skriptingiz `echo "Xato!"` qiladi va bu xabar natija fayliga aralashib ketadi.
To'g'risi: `echo "Xato!" >&2`.

**4. Here-document'da `$` almashib ketishi.**
`cat <<EOF > skript.sh` ichidagi `$1` skript yozilayotgan paytdayoq almashtiriladi.
To'g'risi: `<<'EOF'`.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=11-oqimlar)** "Natija va xatoni ajratish": bitta buyruqning natijasi va xatolarini turli joylarga yo'naltirasiz.

Savollar:

1. `buyruq > a.txt 2>&1` va `buyruq 2>&1 > a.txt` farqi nima?
2. Nega `>` bilan yozganda xato xabari baribir ekranda ko'rinadi?
3. Logga yangi qator qo'shish uchun qaysi operator kerak?
4. `wc -l < fayl` va `wc -l fayl` chiqishlari nega farq qiladi?

<details>
<summary>Javoblar</summary>

1. Birinchisida natija ham, xato ham faylga ketadi. Ikkinchisida xato ekranga chiqadi: `2>&1` bajarilgan paytda 1-kanal hali ekranga ketayotgan edi.
2. `>` faqat 1-kanalni (stdout) buradi. Xato esa 2-kanaldan (stderr) chiqadi.
3. `>>`.
4. `<` da faylni qobiq (shell) ochadi va `wc` faqat oqimni ko'radi. Fayl nomini u bilmaydi, shuning uchun nom chiqmaydi.

</details>

## Rasmiy hujjat

- [Ubuntu Server — The command line in depth: Standard streams](https://ubuntu.com/server/docs/tutorial/cli-in-depth/)
- [Bash Reference Manual — Redirections](https://www.gnu.org/software/bash/manual/bash.html#Redirections)
- [Bash Reference Manual — The Set Builtin (noclobber)](https://www.gnu.org/software/bash/manual/bash.html#The-Set-Builtin)
- [Debian Reference 1.5.8 — Typical command sequences and shell redirection](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_typical_command_sequences_and_shell_redirection)
- [stdin(3)](https://man7.org/linux/man-pages/man3/stdin.3.html)
