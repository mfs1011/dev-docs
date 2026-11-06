# 02 — Terminal va qobiq (shell)

[← Oldingi: Linux, Debian va Ubuntu](01-linux-debian-ubuntu.md) · [Mundarija](README.md) · [Keyingi: Yordamni topish →](03-yordam.md)

## Tushuncha

Serverda grafik oyna, sichqoncha va tugmalar odatda bo'lmaydi. Ubuntu hujjati sababini shunday tushuntiradi: qobiq (shell) grafik interfeysdan ancha kam resurs talab qiladi va tezroq ishlaydi, chunki rasm chizishga hisoblash sarflamaydi. Shuning uchun serverlarga grafik interfeys deyarli o'rnatilmaydi. Server bilan matn orqali gaplashiladi: siz buyruq yozasiz, u javobni matn qilib qaytaradi.

Bunda ikki narsa ishtirok etadi va ularni ajratish foydali:

- **Terminal** — matn kiritiladigan va chiqadigan **oyna**. Noutbukingizdagi "Terminal" dasturi, SSH ulanish oynasi yoki shu sahifadagi trenajor oynasi.
- **Qobiq** (shell) — oyna ichida ishlaydigan **dastur**. U siz yozgan qatorni o'qiydi, tushunadi va bajaradi. Debian va Ubuntu'da standart qobiq (shell) — **bash**.

Bash qo'llanmasi qobiqni (shell) ikki tomonlama ta'riflaydi:

- **Buyruq tarjimoni** (command interpreter). Siz yozgan buyruqni ishga tushiradi.
- **Dasturlash tili.** Buyruqlarni birlashtirib, faylga yozib, yangi buyruq yasash mumkin. Bu skriptlar, ularga XI qism bag'ishlangan.

Qobiq (shell) ikki rejimda ishlaydi. **Interaktiv** rejimda klaviaturadan yozilganini o'qiydi: siz hozir shu rejimdasiz. **Interaktiv bo'lmagan** rejimda esa fayldagi buyruqlarni bajaradi.

Qaysi qobiqda (shell) ekaningizni tekshiring:

```text
$ echo $SHELL
/bin/bash
```

`echo` — berilgan matnni ekranga chiqaradi. `$SHELL` — foydalanuvchining qobig'i (shell) yozilgan o'zgaruvchi (o'zgaruvchilar 13-bobda).

## Prompt: buyruq qayerga yoziladi

Terminal ochilganda qobiq (shell) **prompt** (taklif belgisi) chiqarib, sizdan buyruq kutadi. Trenajorda u shunday:

```text
root@trenajor:~#
```

| Qism | Ma'nosi |
| --- | --- |
| `root` | Foydalanuvchi nomi — kim bo'lib ishlayapsiz |
| `trenajor` | Kompyuter nomi (hostname) — qaysi mashinadasiz. Bir nechta serverga ulanganda adashmaslik uchun muhim |
| `~` | Joriy papka. `~` — uy papkangizning qisqa belgisi; root uchun bu `/root` |
| `#` | `#` — siz **root**siz. Oddiy foydalanuvchida bu yerda `$` turadi |

Ubuntu hujjatidagi oddiy foydalanuvchi prompt'i esa `ubuntu@tutorial:~$` ko'rinishida bo'ladi. Oxiridagi belgi — `$`.

### Kitobdagi yozuv

Debian Reference ham shu an'anaga amal qiladi: `#` bilan boshlangan misol root'da, `$` bilan boshlangan misol oddiy foydalanuvchida bajariladi. Bu kitobda esa misollar shunday yoziladi:

```text
$ hostname
trenajor
```

- `$ ` dan keyingi qism — **siz yozadigan buyruq**. `$` ning o'zini yozmaysiz.
- `$` siz qatorlar — buyruqning **chiqishi** (javobi).
- Root huquqi kerak bo'lgan buyruq matnda alohida aytiladi.

Trenajorda siz root'siz, shuning uchun u yerdagi prompt `#` bilan tugaydi. Kod blokidagi **▶ Trenajorda** tugmasi blokdagi buyruqlarni pastdagi terminalda birma-bir bajaradi.

## root — hamma narsaga ruxsati bor foydalanuvchi

Debian Reference'ga ko'ra **root** (superuser — "superfoydalanuvchi") quyidagilarni qila oladi:

- tizimdagi **istalgan** faylni, ruxsatlaridan qat'i nazar, o'qish, o'zgartirish va o'chirish;
- istalgan faylning egasini va ruxsatlarini o'zgartirish;
- istalgan foydalanuvchining parolini o'zgartirish;
- istalgan foydalanuvchi bo'lib uning parolisiz kirish.

Hujjatning o'zi ogohlantiradi: bu cheksiz kuch ehtiyotkorlik va mas'uliyat talab qiladi. Ruxsat bilan bog'liq muammoni root bo'lib "tez yechib qo'yish" mumkin, lekin to'g'ri yechim — ruxsatlar va guruhlarni to'g'ri sozlash (7-bob).

Siz kimligingizni ikki buyruq aytadi:

```text
$ whoami
root
$ id
uid=0(root) gid=0(root) groups=0(root)
```

`whoami` — foydalanuvchi nomi. `id` — foydalanuvchi raqami (`uid`), asosiy guruhi (`gid`) va qo'shimcha guruhlari. Root'ning raqami har doim `0`.

Distributivlar root'ga turlicha yondashadi:

- **Ubuntu** standart o'rnatishda root akkauntini o'chirib qo'yadi. Akkaunt bor, lekin hech qanday parolga mos kelmaydigan parol bilan, shuning uchun to'g'ridan-to'g'ri kirib bo'lmaydi. Administrator ishlari `sudo` orqali bajariladi (23-bob).
- **Ko'p VPS provayderlari** esa serverni root bilan kirishga tayyorlab beradi. Sinov VPS'imiz ham shunday. Bunday serverni himoyalash — "Server xavfsizligi" kitobining mavzusi.

Trenajorda root bo'lish xavfsiz: tizimni buzsangiz, **↺ Qayta boshlash** hammasini tiklaydi.

## Buyruq tuzilishi

Bash qo'llanmasiga ko'ra oddiy buyruq — bu probel bilan ajratilgan **so'zlar** ketma-ketligi. Birinchi so'z — **ishga tushiriladigan buyruq**, qolganlari — uning **argumentlari**.

```text
buyruq  -opsiya  --uzun-opsiya  argument
  │        │           │            │
  │        └───────────┴── xatti-harakatni o'zgartiradi
  │                                 └── nima ustida ishlash (fayl, papka, matn)
  └── nima qilish
```

Debian Reference'ga ko'ra `-` yoki `--` bilan boshlanadigan argumentlar **opsiya** deyiladi. Ular buyruqning xatti-harakatini boshqaradi. Debian Reference'dagi misol:

```text
$ date
Thu Nov  5 10:11:36 UTC 2026
$ date -R
Thu, 05 Nov 2026 10:11:36 +0000
```

`date` sanani odatdagi ko'rinishda chiqaradi. `-R` opsiyasi esa uni elektron pochta standarti (RFC 2822 va unga mos RFC 5322) formatida chiqaradi.

### Qisqa va uzun opsiyalar

Ko'p buyruqlarda bir opsiyaning ikki yozilishi bor: qisqa (`-h`) va uzun (`--human-readable`). `ls -l` — fayl haqida batafsil ma'lumot. `-h` esa hajmni odam o'qiydigan ko'rinishda chiqaradi:

```text
$ ls -l /usr/bin/bash
-rwxr-xr-x 1 root root 1408088 May  7 20:32 /usr/bin/bash
$ ls -l -h /usr/bin/bash
-rwxr-xr-x 1 root root 1.4M May  7 20:32 /usr/bin/bash
$ ls -lh /usr/bin/bash
-rwxr-xr-x 1 root root 1.4M May  7 20:32 /usr/bin/bash
$ ls -l --human-readable /usr/bin/bash
-rwxr-xr-x 1 root root 1.4M May  7 20:32 /usr/bin/bash
```

Oxirgi uchtasi bir xil ishlaydi:

- qisqa opsiyalarni birlashtirish mumkin: `-l -h` = `-lh`;
- uzun opsiya skriptlarda o'qilishi oson, qisqasi qo'lda yozishga tez.

GNU Coreutils qo'llanmasiga ko'ra GNU dasturlari uzun opsiyaning **bir ma'noli qisqartmasini** ham qabul qiladi. Agar qisqartma bir nechta opsiyaga mos kelsa, xato chiqadi:

```text
$ ls -l --hum /usr/bin/bash
-rwxr-xr-x 1 root root 1.4M May  7 20:32 /usr/bin/bash
$ ls --h
ls: option '--h' is ambiguous; possibilities: '--human-readable' '--hide-control-chars' '--hide' '--hyperlink' '--help'
Try 'ls --help' for more information.
```

### Opsiyaning qiymati

Ba'zi opsiyalarga qiymat kerak. Masalan, `touch -r FAYL` boshqa faylning vaqtini nusxalaydi. Qiymat berilmasa, buyruq nima yetishmayotganini aytadi:

```text
$ touch -r
touch: option requires an argument -- 'r'
Try 'touch --help' for more information.
```

### `--` — opsiyalar shu yerda tugadi

Agar fayl nomi `-` bilan boshlansa, buyruq uni opsiya deb o'ylaydi. GNU Coreutils qo'llanmasiga ko'ra `--` opsiyalar ro'yxatini tugatadi: undan keyingi hamma narsa, `-` bilan boshlansa ham, oddiy argument hisoblanadi.

```text
$ mkdir ~/mashq
$ cd ~/mashq
$ touch -- -r
$ ls
-r
$ rm -- -r
$ ls
```

`touch -- -r` "-r" nomli bo'sh fayl yaratdi, `rm -- -r` uni o'chirdi. `cd` — papkaga o'tish, `mkdir` — papka yaratish (5-bob).

### Probel — so'zlarni ajratadi

Qobiq (shell) qatorni probellar bo'yicha so'zlarga bo'ladi. Shuning uchun probelli nom **qo'shtirnoq** ichida yoziladi:

```text
$ mkdir mening papkam
$ ls
mening  papkam
$ mkdir "mening papkam"
$ ls
 mening  'mening papkam'   papkam
```

Birinchi buyruq **ikkita** papka yaratdi: `mening` va `papkam`. Qo'shtirnoq bilan esa bitta, nomida probel bor papka yaratildi. `ls` uni ekranda bitta tirnoq ichida ko'rsatadi, nom bitta ekanini bildirish uchun. Qo'shtirnoq turlari va boshqa qoidalar 14-bobda.

### Katta va kichik harf farq qiladi

Linux'da buyruq va fayl nomlarida katta va kichik harf **har xil** belgi hisoblanadi. Debian Reference bu qoidani foydalanuvchi nomi va paroliga nisbatan ham aytadi:

```text
$ LS
-bash: LS: command not found
```

## Buyruq qayerdan keladi

Ba'zi buyruqlar alohida dastur fayli, ba'zilari esa qobiqning (shell) o'z ichida. `type` buni aytadi:

```text
$ type cd
cd is a shell builtin
$ type ls
ls is /usr/bin/ls
$ type type
type is a shell builtin
```

- `ls` — `/usr/bin/ls` faylidagi alohida dastur.
- `cd` — qobiqning (shell) **ichki buyrug'i** (builtin).

Bash qo'llanmasi buning sababini aytadi: `cd` qobiqning (shell) o'zini (uning joriy papkasini) o'zgartiradi, shuning uchun uni qobiqdan (shell) tashqarida yozib bo'lmaydi.

### Topilmagan buyruq va chiqish kodi

Har buyruq tugaganda qobiqqa (shell) **chiqish kodi** (exit status) qaytaradi. Oxirgisini `$?` saqlaydi:

```text
$ salom
-bash: salom: command not found
$ echo $?
127
```

Bash qo'llanmasi bo'yicha:

| Kod | Ma'nosi |
| --- | --- |
| `0` | Muvaffaqiyat |
| `0` dan farqli | Xato. Har dastur o'z kodlarini o'zi belgilaydi |
| `126` | Buyruq topildi, lekin uni bajarib bo'lmaydi (masalan, bajarish ruxsati yo'q) |
| `127` | Buyruq topilmadi |
| `128+N` | Buyruq N-raqamli signal bilan to'xtatildi (29-bob) |

Chiqish kodi skriptlarda "oldingi buyruq muvaffaqiyatli bo'ldimi?" degan savolga javob beradi (12-bob).

## Foydali tugmalar

Debian Reference'dagi bash tugmalari ro'yxatidan eng kerakli qismi:

| Tugma | Nima qiladi |
| --- | --- |
| `Tab` | Buyruq yoki fayl nomini oxirigacha yozadi. Variant ko'p bo'lsa, ikki marta bosing — ro'yxat chiqadi |
| `↑` / `↓` | Oldingi buyruqlar tarixi bo'ylab yurish |
| `Ctrl+R` | Tarixdan so'z bo'yicha qidirish |
| `Ctrl+C` | Ishlayotgan dasturni to'xtatish |
| `Ctrl+D` | Kiritishni tugatish. Bo'sh qatorda bosilsa, qobiqdan (shell) chiqadi |
| `Ctrl+U` | Kursordan oldingi qismni o'chirish |
| `Ctrl+Z` | Dasturni vaqtincha to'xtatib, fonga o'tkazish (30-bob) |
| `Ctrl+S` / `Ctrl+Q` | Ekranga chiqishni to'xtatish / davom ettirish. Terminal "qotib qolsa", avval `Ctrl+Q` ni bosib ko'ring |

> **Trenajorda.** Brauzer ba'zi tugmalarni o'zi ushlab qoladi. Masalan, `Ctrl+W` bash'da so'zni o'chiradi, brauzerda esa yorliqni (tab) yopadi. Trenajorda undan foydalanmang.

## Chiqish, tozalash va o'chirish

- **Sessiyadan chiqish:** `exit` yoki bo'sh qatorda `Ctrl+D` (Debian Reference 1.1.7). SSH sessiyasida bu ulanishni yopadi. Trenajorda esa yangi kirish avtomatik ochiladi.
- **Ekranni tozalash:** `clear`.
- **Konsol "aqldan ozsa":** Debian Reference'ga ko'ra, masalan, ikkilik (binary) fayl `cat` bilan ekranga chiqarilganda, ekran g'alati belgilar bilan to'lib qoladi. Shunda `reset` buyrug'ini yozing, yozayotganingiz ko'rinmasa ham. Ekranni tozalash uchun `clear` ham ishlaydi.
- **Tizimni o'chirish:** `shutdown -h now` (root huquqi kerak). Debian Reference'ga ko'ra tizim to'g'ri o'chirilishi kerak: shunda xotirada turgan o'zgarishlar diskka yoziladi va fayllar butun qoladi.

> **VPS'da ehtiyot bo'ling.** `shutdown` VPS'ni o'chiradi. O'chgan serverga SSH orqali ulanib, uni qayta yoqib bo'lmaydi: buning uchun hosting provayderining paneli kerak. Serverni qayta ishga tushirish uchun boshqa buyruq bor: `shutdown -r now` (reboot).

## Debian va Ubuntu: xato xabarlari boshqacha

Ubuntu 26.04 da `ls`, `touch` va boshqa asosiy buyruqlar rust-coreutils (uutils) dan keladi (1-bob). Buyruqlar va opsiyalar asosan bir xil, lekin **xato xabarlari** boshqacha. VPS'da:

```text vps
$ ls --version
ls (uutils coreutils) 0.10.0
$ ls --h
error: unexpected argument '--h' found

  tip: a similar argument exists: '--hide'
$ touch -r
error: a value is required for '--reference <FILE>' but none was supplied

For more information, try '--help'.
```

Trenajorda xuddi shu buyruqlar:

```text
$ ls --version | head -1
ls (GNU coreutils) 9.1
```

`ls --h` va `touch -r` ning trenajordagi chiqishi yuqorida berilgan. Internetda xato xabarini qidirsangiz, qaysi tizimda ekaningizni hisobga oling: GNU va uutils xabarlari boshqacha so'zlar bilan yozilgan.

## Tipik xatolar

**1. Misoldagi `$` ni ham yozib yuborish.**

```text
$ $ ls
-bash: $: command not found
```

To'g'risi: `$` — prompt belgisi, uni yozmaysiz. Faqat undan keyingi qismni yozing.

**2. Probelli nomni qo'shtirnoqsiz yozish.**
`mkdir mening papkam` bitta emas, ikkita papka yaratadi. `rm -r mening papkam` esa ikkita **boshqa** papkani o'chirishi mumkin.
To'g'risi: `"mening papkam"`. Undan ham yaxshisi, serverdagi fayl va papka nomlariga probel qo'ymang.

**3. Katta harf bilan yozish.**
`LS`, `Cd`, `/Etc` ishlamaydi. Linux'da katta va kichik harf farq qiladi.

**4. Serverda doim root bo'lib ishlash.**
Root'da xato buyruq ham tekshiruvsiz bajariladi. Masalan, noto'g'ri papkada `rm -r`.
To'g'risi: kundalik ishni oddiy foydalanuvchi bilan qiling, root kerak bo'lgandagina `sudo` bilan (23-bob). Trenajorda root'da ishlash mumkin, chunki u qum qutisi (sandbox).

**5. `-` bilan boshlanadigan fayl.**
`rm -r` ni "-r nomli faylni o'chir" deb yozsangiz, buyruq `-r` ni opsiya deb tushunadi.
To'g'risi: `rm -- -r` yoki `rm ./-r`.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=02-buyruq-tuzilishi)** "Buyruq, opsiya va argument": trenajorda qadamma-qadam bajarasiz, har qadam haqiqiy tizim holatidan tekshiriladi.

Savollar:

1. `root@trenajor:~#` prompt'ida qaysi qism joriy papkani bildiradi? Siz root ekaningizni qaysi belgi bildiradi?
2. `ls -lh` va `ls -l -h` farq qiladimi?
3. `-v` nomli faylni qanday o'chirasiz?
4. `pwd` buyrug'i builtin'mi yoki alohida dastur? Tekshiring.
5. Mavjud bo'lmagan buyruqdan keyin `echo $?` nima chiqaradi?

<details>
<summary>Javoblar</summary>

1. `~` — joriy papka (uy papkasi). `#` — siz root'siz.
2. Yo'q. Qisqa opsiyalarni birlashtirish mumkin.
3. `rm -- -v` yoki `rm ./-v`.
4. `type pwd` → `pwd is a shell builtin`. Bash'da `pwd` ichki buyruq. Shu bilan birga `/usr/bin/pwd` dasturi ham bor: `type -a pwd` ikkalasini ko'rsatadi.
5. `127`.

</details>

## Rasmiy hujjat

- [Debian Reference 1.1 — Console basics](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_console_basics)
- [Debian Reference 1.4.3 — Special key strokes](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_special_key_strokes)
- [Debian Reference 1.5.5 — Command line options](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_command_line_options)
- [Debian Reference — Conventions](https://www.debian.org/doc/manuals/debian-reference/pr01.en.html#_conventions)
- [Ubuntu Server — Welcome to the terminal](https://ubuntu.com/server/docs/tutorial/welcome-to-the-terminal/)
- [Ubuntu Server — User management: Where is root?](https://ubuntu.com/server/docs/how-to/security/user-management/)
- [Bash Reference Manual — What is a shell?](https://www.gnu.org/software/bash/manual/bash.html#What-is-a-shell_003f)
- [Bash Reference Manual — Simple Commands](https://www.gnu.org/software/bash/manual/bash.html#Simple-Commands)
- [Bash Reference Manual — Exit Status](https://www.gnu.org/software/bash/manual/bash.html#Exit-Status)
- [GNU Coreutils — Common options](https://www.gnu.org/software/coreutils/manual/coreutils.html#Common-options)
