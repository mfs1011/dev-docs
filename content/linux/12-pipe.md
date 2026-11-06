# 12 — Pipe va buyruqlar zanjiri

[← Oldingi: Standart oqimlar](11-standart-oqimlar.md) · [Mundarija](README.md) · [Keyingi: O'zgaruvchilar va muhit →](13-ozgaruvchilar.md)

## Tushuncha

Bu bobda buyruqlarni bir-biriga ulashning ikki xil yo'li bor. Ular ko'p chalkashtiriladi:

| | **Pipe** (`\|`) | **Zanjir** (`;`, `&&`, `\|\|`) |
| --- | --- | --- |
| Nima uzatiladi | **Ma'lumot**: birinchi buyruqning stdout'i ikkinchisining stdin'iga | Hech narsa. Faqat **qaysi buyruq ishlashi** hal qilinadi |
| Qachon ishlaydi | Hammasi **bir vaqtda** | **Ketma-ket** |
| Nimaga qaraydi | — | Oldingi buyruqning chiqish kodiga (2-bob) |

Ubuntu hujjati pipe'ni Unix falsafasining eng kuchli g'oyalaridan biri deb ataydi: bitta buyruqning natijasi keyingisining kirishiga aylanadi. Zanjir haqida esa shunday deydi: u buyruqlar qaysi tartibda va umuman ishlashi yoki ishlamasligini boshqaradi.

## Pipe: `|`

```text
$ mkdir -p /tmp/pipe && cd /tmp/pipe
$ ls /usr/bin | wc -l
421
$ ls -lt /usr/bin | head -n 3
total 40318
-rwxr-xr-x 1 root root    1408088 May  7 20:32 bash
-rwxr-xr-x 1 root root       6861 May  7 20:32 bashbug
```

- Birinchi buyruq `/usr/bin` dagi nomlarni chiqaradi, `wc -l` ularni sanaydi.
- Ikkinchisida `ls -lt` vaqt bo'yicha saralaydi, `head -n 3` birinchi uch qatorni oladi. Ubuntu hujjatidagi misol shu.

```text
 ls /usr/bin  ──stdout──►│pipe│──stdin──►  wc -l  ──stdout──►  ekran
     ▲                                        
     └─ stderr (xatolar) pipe'ga KIRMAYDI, ekranga chiqadi
```

Bash qo'llanmasiga ko'ra pipe buyruqning **stdout**'ini keyingisining stdin'iga ulaydi. **Xatolar (stderr) pipe'dan o'tmaydi**:

```text
$ ls /etc/hostname /yoq | wc -l
ls: cannot access '/yoq': No such file or directory
1
$ ls /etc/hostname /yoq |& wc -l
2
```

`|&` stderr'ni ham pipe'ga qo'shadi. Bash qo'llanmasiga ko'ra bu `2>&1 |` ning qisqa yozuvi.

Pipe'dagi har bir buyruq **alohida jarayon** bo'lib, hammasi bir vaqtda ishlaydi. Ubuntu hujjatiga ko'ra shuning uchun pipe uzun ma'lumot oqimi bilan ham ishlay oladi: birinchi buyruq hali yozib tugatmasdan, ikkinchisi o'qishni boshlaydi.

### `tee`: ham ekranga, ham faylga

```text
$ ls /etc | tee etc.txt | wc -l
97
$ head -3 etc.txt
adduser.conf
alternatives
apparmor.d
```

`tee` kirishni ikkiga ajratadi: bir nusxasini faylga yozadi, ikkinchisini keyingi buyruqqa beradi. Uzoq buyruqning natijasini ko'rib turgan holda logga ham yozish uchun qulay. `tee -a` faylga qo'shib boradi.

## Zanjir: `;`, `&&`, `||`

Bash qo'llanmasiga ko'ra:

- `A ; B` — A tugagach, B **har doim** ishlaydi.
- `A && B` — B faqat A **muvaffaqiyatli** (chiqish kodi 0) tugasa ishlaydi.
- `A || B` — B faqat A **muvaffaqiyatsiz** tugasa ishlaydi.

```text
$ ls /yoq; echo "davom etdi"
ls: cannot access '/yoq': No such file or directory
davom etdi
$ cd /tmp && echo "o'tdi"
o'tdi
$ cd /yoq || echo "Papkaga o'tib bo'lmadi"
-bash: cd: /yoq: No such file or directory
Papkaga o'tib bo'lmadi
```

Ubuntu hujjati `&&` ning skriptdagi foydasini aytadi: agar `cd` muvaffaqiyatsiz bo'lsa, keyingi buyruq umuman ishlamaydi. Masalan, `cd /var/www/eski && rm -rf *`: papka yo'q bo'lsa, `rm` ishlamaydi. Bu yerda `;` qo'yilgan bo'lsa, `rm` joriy papkadagi hamma narsani o'chirgan bo'lardi.

<div data-animatsiya="zanjir"></div>

### Tuzoq: `A && B || C` — "if-else" emas

Ubuntu hujjatida `&&` va `||` ni birlashtirgan misol bor:

```text
$ ping -c1 localhost > /dev/null && echo "Host ishlayapti" || echo "Host javob bermadi"
Host ishlayapti
```

Bu "agar A bo'lsa B, aks holda C" kabi ko'rinadi, lekin unday emas. Bash qo'llanmasiga ko'ra `&&` va `||` bir xil ustuvorlikka ega va chapdan o'ngga bajariladi. Shuning uchun **B yiqilsa ham C ishlaydi**:

```text
$ true && false || echo "bu ham ishladi"
bu ham ishladi
```

`true` muvaffaqiyatli, `false` esa yiqildi. Natijada `||` dan keyingisi ham ishladi. B — `echo` bo'lsa, odatda muammo chiqmaydi, chunki `echo` deyarli hech qachon yiqilmaydi. B jiddiy buyruq bo'lsa, haqiqiy `if` ishlating (49-bob). Yuqoridagi animatsiyada "A && B || C" ni tanlab, B ni "xato" qiling.

## Pipe'ning chiqish kodi

Bash qo'llanmasiga ko'ra pipe'ning chiqish kodi — **oxirgi** buyruqniki. Oldingilarining xatosi yo'qolib ketadi:

```text
$ false | true; echo $?
0
$ false | true; echo "${PIPESTATUS[@]}"
1 0
$ set -o pipefail; false | true; echo $?; set +o pipefail
1
```

- `PIPESTATUS` massivi har bir buyruqning kodini saqlaydi.
- `set -o pipefail` yoqilsa, pipe'ning kodi xato bilan tugagan oxirgi buyruqniki bo'ladi. Hammasi muvaffaqiyatli bo'lsa, 0.

Skriptlarda bu muhim. Masalan, `mysqldump baza | gzip > zaxira.gz`: `mysqldump` yiqilsa ham `gzip` muvaffaqiyatli tugaydi va skript "zaxira olindi" deb o'ylaydi. `pipefail` buni ushlaydi (48-bob).

## Buyruqlarni guruhlash

`{ ...; }` bir nechta buyruqni bitta guruhga oladi. Masalan, ularning chiqishini birga yo'naltirish uchun:

```text
$ { echo bir; echo ikki; } > guruh.txt; cat guruh.txt
bir
ikki
```

Bash qo'llanmasiga ko'ra guruh ichidagi har buyruq `;` yoki yangi qator bilan tugashi kerak, `{` dan keyin esa probel bo'lishi shart.

## Debian va Ubuntu

Pipe va zanjirni bash bajaradi, ular ikkala tizimda bir xil. Pipe'dagi buyruqlar esa Ubuntu 26.04 da rust-coreutils'dan kelishi mumkin (`wc`, `head`, `sort`). Ularning natijasi bir xil, faqat xato xabarlari farq qiladi (2-bob).

## Tipik xatolar

**1. `;` bilan xavfli zanjir.**
`cd /papka; rm -rf *` — `cd` yiqilsa, `rm` noto'g'ri papkada ishlaydi.
To'g'risi: `cd /papka && rm -rf ./*` yoki skriptda `set -e`.

**2. Xatolar pipe'dan o'tadi deb kutish.**
`buyruq | grep ERROR` — buyruqning stderr'idagi xatolar `grep` ga yetib bormaydi.
To'g'risi: `buyruq 2>&1 | grep ERROR` yoki `|&`.

**3. Pipe'dagi xatoni yo'qotish.**
`dump | gzip > fayl` muvaffaqiyatli ko'rinadi, `dump` esa yiqilgan.
To'g'risi: `set -o pipefail` yoki `PIPESTATUS`.

**4. `A && B || C` ni if-else deb ishlatish.**
To'g'risi: `if A; then B; else C; fi`.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=12-pipe)** "Pipe va zanjir": ma'lumotni buyruqdan buyruqqa o'tkazasiz va xavfsiz zanjir tuzasiz.

Savollar:

1. Pipe va `&&` ning asosiy farqi nima?
2. `ls /yoq | wc -l` nega xato xabarini sanamaydi?
3. `false | true` ning chiqish kodi nima va nega?
4. `mkdir zaxira && cp -a ilova zaxira/` da `mkdir` yiqilsa, nima bo'ladi?

<details>
<summary>Javoblar</summary>

1. Pipe ma'lumotni uzatadi va buyruqlar bir vaqtda ishlaydi. `&&` faqat oldingi buyruq muvaffaqiyatli bo'lsa, keyingisini ishga tushiradi.
2. Xato stderr'ga chiqadi, pipe esa faqat stdout'ni uzatadi.
3. `0`: pipe'ning kodi oxirgi buyruqniki. `pipefail` bilan `1` bo'ladi.
4. `cp` ishlamaydi.

</details>

## Rasmiy hujjat

- [Ubuntu Server — The command line in depth: Pipes, Chaining commands](https://ubuntu.com/server/docs/tutorial/cli-in-depth/)
- [Bash Reference Manual — Pipelines](https://www.gnu.org/software/bash/manual/bash.html#Pipelines)
- [Bash Reference Manual — Lists of Commands](https://www.gnu.org/software/bash/manual/bash.html#Lists)
- [Bash Reference Manual — Command Grouping](https://www.gnu.org/software/bash/manual/bash.html#Command-Grouping)
- [Bash Reference Manual — Bash Variables (PIPESTATUS)](https://www.gnu.org/software/bash/manual/bash.html#Bash-Variables)
- [GNU Coreutils — tee invocation](https://www.gnu.org/software/coreutils/manual/coreutils.html#tee-invocation)
- [Debian Reference 1.5.7–1.5.8](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_return_value_of_the_command)
