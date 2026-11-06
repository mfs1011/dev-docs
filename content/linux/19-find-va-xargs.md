# 19 — find va xargs

[← Oldingi: grep va regex](18-grep-va-regex.md) · [Mundarija](README.md) · [Keyingi: Matnni o'zgartirish →](20-matnni-ozgartirish.md)

## Tushuncha

`grep` fayl **ichidan** qidiradi. `find` esa **fayllarning o'zini** qidiradi: nomi, turi, hajmi, o'zgartirilgan vaqti bo'yicha. Keyin topilgan har bir faylga buyruq qo'llash mumkin: o'chirish, ruxsatini o'zgartirish, sanash.

Serverdagi tipik savollar:

- "Qaysi loglar 7 kundan eski?" — ularni o'chirish uchun.
- "Diskni nima to'ldiryapti?" — 100 MB dan katta fayllar.
- "`.env` fayllari qayerlarda yotibdi?"

Misollar uchun papka tuzamiz. Loglarning vaqtini `touch -d` bilan orqaga suramiz. Bitta log nomida probel bor:

```text
$ mkdir -p /tmp/izla && cd /tmp/izla
$ mkdir -p app/src logs && echo 'DB=1' > app/.env && echo 'x' > app/src/main.js && echo 'y' > app/README.md
$ for d in 1 5 10 20; do echo log > logs/app-$d.log; touch -d "$d days ago" logs/app-$d.log; done
$ echo bo > 'logs/eski yozuv.log'; touch -d '30 days ago' 'logs/eski yozuv.log'
$ head -c 2M /dev/zero > logs/dump.bin; : > bosh.txt
```

## `find` qanday yoziladi

```text
find  QAYERDAN  SHARTLAR  AMAL
find  logs      -name '*.log' -mtime +7   -delete
```

- **Qayerdan** — boshlang'ich papka(lar). `find` uning ichiga, barcha pastki papkalarga kiradi.
- **Shartlar** (test) — har bir fayl tekshiriladi.
- **Amal** (action) — mos kelgan faylga nima qilish. Amal berilmasa — `-print`, ya'ni nomini chiqarish.

## Nomi va turi bo'yicha

```text
$ find . -name '*.log'
./logs/eski yozuv.log
./logs/app-20.log
./logs/app-10.log
./logs/app-5.log
./logs/app-1.log
$ find . -type d
.
./logs
./app
./app/src
$ find . -maxdepth 1
.
./bosh.txt
./logs
./app
$ find . -name '.env'
./app/.env
```

| Shart | Ma'nosi |
| --- | --- |
| `-name '*.log'` | Nomi shablonga mos (glob, 14-bob). `-iname` — katta-kichik harfni farqlamaydi |
| `-type f` / `-type d` / `-type l` | Oddiy fayl / papka / simvolik havola |
| `-maxdepth N` | N darajadan chuqur kirmaydi. `-maxdepth 1` — faqat shu papka |
| `-path '*/node_modules/*'` | To'liq yo'l shablonga mos |

`-name` shablonini doim **qo'shtirnoqqa** oling. Aks holda qobiq (shell) `*.log` ni joriy papkadagi fayl nomlariga kengaytirib yuboradi (18-bobdagi `grep` tuzog'i bilan bir xil). Man sahifaga ko'ra `-name` faqat fayl nomining o'ziga qaraydi, papkalarga emas: `-name 'a/b'` hech narsa topmaydi, buning uchun `-path` bor.

Natijalar alifbo bo'yicha saralanmaydi.

## Hajmi bo'yicha

```text
$ find . -type f -size +1M
./logs/dump.bin
```

`+` — katta, `-` — kichik, belgisiz — aynan. Birliklar: `c` bayt, `k` KiB, `M` MiB, `G` GiB. Belgisiz son 512 baytli bloklar degani.

Disk to'lganda katta fayllarni shunday topasiz: `find / -xdev -type f -size +100M`. `-xdev` boshqa fayl tizimlariga (masalan, `/proc`) kirmaydi (10-bob).

### Yaxlitlash tuzog'i

Man sahifaga ko'ra `-size` hajmni birlikka **yuqoriga yaxlitlaydi**. Shuning uchun:

```text
$ find . -type f -size -1M
./bosh.txt
$ find . -type f -empty
./bosh.txt
```

Papkada 2–5 baytli fayllar bor, lekin `-size -1M` faqat bo'sh faylni topdi. 5 bayt yuqoriga yaxlitlansa **1M** bo'ladi, `-1M` esa "1 dan kam", ya'ni 0. "1 MB dan kichik" kerak bo'lsa, kichikroq birlikda yozing: `-size -1024k`.

## Vaqti bo'yicha

```text
$ find logs -name '*.log' -mtime +7
logs/eski yozuv.log
logs/app-20.log
logs/app-10.log
$ find logs -name '*.log' -mtime -7
logs/app-5.log
logs/app-1.log
```

| Shart | Ma'nosi |
| --- | --- |
| `-mtime +7` | Mazmuni 7 kundan **ko'proq** oldin o'zgargan |
| `-mtime -7` | 7 kundan **kamroq** oldin |
| `-mmin -30` | So'nggi 30 daqiqada |
| `-newer fayl` | Berilgan fayldan keyin o'zgargan |

Man sahifaga ko'ra `find` necha **24 soatlik davr** o'tganini hisoblaganda kasr qismini tashlab yuboradi. Shuning uchun `-mtime +1` ga mos kelishi uchun fayl kamida **ikki kun** oldin o'zgargan bo'lishi kerak. `+7` amalda "8 kun va undan eski" degani.

`-newer` deploy'dan keyin nima o'zgarganini topishda qulay:

```text
$ find app -type f -newer logs/app-1.log
app/README.md
app/.env
app/src/main.js
```

## Topilgan fayllar bilan ish

### `-delete`

```text
$ find logs -name '*.log' -mtime +7 -print
logs/eski yozuv.log
logs/app-20.log
logs/app-10.log
$ find logs -name '*.log' -mtime +7 -delete
$ ls logs
app-1.log  app-5.log  dump.bin
```

Avval `-print` bilan **nima o'chishini ko'ring**, keyin xuddi shu buyruqda `-print` ni `-delete` ga almashtiring.

Man sahifadagi ogohlantirish: `find` buyruq qatorini **ifoda** sifatida chapdan o'ngga hisoblaydi. `-delete` ni boshiga qo'ysangiz (`find logs -delete -name '*.log'`), u shartlardan oldin bajariladi va papkadagi **hamma narsani** o'chiradi. `-delete` doim oxirida turadi.

### `-exec`

```text
$ find logs -name 'app-*' -exec echo chaqiruv: {} \;
chaqiruv: logs/app-20.log
chaqiruv: logs/app-10.log
chaqiruv: logs/app-5.log
chaqiruv: logs/app-1.log
$ find logs -name 'app-*' -exec echo chaqiruv: {} +
chaqiruv: logs/app-20.log logs/app-10.log logs/app-5.log logs/app-1.log
```

- `{}` — topilgan fayl nomi bilan almashtiriladi.
- `\;` bilan tugasa, buyruq **har bir fayl uchun alohida** ishga tushadi: 4 fayl — 4 ta jarayon.
- `+` bilan tugasa, `find` nomlarni yig'ib, buyruqni **imkon qadar kam marta** ishga tushiradi: bu yerda bir marta. Minglab fayl bo'lsa, farq sezilarli.
- `;` qobiq (shell) uchun maxsus belgi, shuning uchun `\;` yoki `';'` yoziladi.

Man sahifaga ko'ra `-exec` ning xavfsizlik muammolari bor va o'rniga `-execdir` tavsiya qilinadi: u buyruqni topilgan fayl turgan papkadan ishga tushiradi.

## `xargs`

`xargs` stdin'dan nomlarni o'qib, ularni buyruqqa **argument** qilib beradi. Pipe (12-bob) faqat stdin'ga ma'lumot uzatadi, ko'p buyruqlar (`rm`, `wc`, `ls`) esa nomlarni argument sifatida kutadi. `xargs` shu ikkisini ulaydi.

### Probelli nomlar

```text
$ find logs -name '*.log' | xargs wc -l
wc: logs/eski: No such file or directory
wc: yozuv.log: No such file or directory
 1 logs/app-20.log
 1 logs/app-10.log
 1 logs/app-5.log
 1 logs/app-1.log
 4 total
```

`xargs` standart holatda nomlarni **probel va yangi qator** bo'yicha ajratadi. `eski yozuv.log` ikki bo'lakka bo'linib ketdi. `rm` bilan bu boshqa faylni o'chirishga olib kelishi mumkin.

Yechim — nomlarni **null belgisi** (`\0`) bilan ajratish. Fayl nomida bu belgi bo'lishi mumkin emas:

```text
$ find logs -name '*.log' -print0 | xargs -0 wc -l
 1 logs/eski yozuv.log
 1 logs/app-20.log
 1 logs/app-10.log
 1 logs/app-5.log
 1 logs/app-1.log
 5 total
```

Man sahifaga ko'ra `-print0` nom oxiriga yangi qator o'rniga null qo'yadi va bu `xargs -0` ga mos keladi. Debian Reference ham fayllar ustida buyruq takrorlashda `find ... -print0 | xargs -0` ni aynan "g'alati" (probelli) nomlarni to'g'ri ishlash uchun ko'rsatadi.

Ko'pincha `xargs` umuman kerak emas: `find ... -exec wc -l {} +` ham xuddi shu natijani beradi va nomlarni hech qachon bo'lmaydi.

<div data-animatsiya="qadamli" data-nom="xargs"></div>

### Bo'sh kirish: `-r`

```text
$ find logs -name '*.zip' | xargs ls -l
total 0
drwxr-xr-x 3 root root 100 Nov  6 04:11 app
-rw-r--r-- 1 root root   0 Nov  6 04:11 bosh.txt
drwxr-xr-x 2 root root 160 Nov  6 04:11 logs
$ find logs -name '*.zip' | xargs -r ls -l; echo "kod: $?"
kod: 0
```

`.zip` fayl topilmadi, lekin `xargs` baribir `ls -l` ni **argumentsiz** ishga tushirdi va joriy papka chiqdi. Man sahifaga ko'ra kirish bo'sh bo'lsa ham buyruq bir marta ishga tushadi; `-r` (`--no-run-if-empty`) buni to'xtatadi. `ls` o'rnida `rm -rf` kabi buyruq bo'lsa, `-r` juda muhim.

### Bittadan: `-n`

```text
$ find logs -name 'app-*' | xargs -n 1 echo bitta:
bitta: logs/app-5.log
bitta: logs/app-1.log
```

`-n 1` buyruqqa har safar bittadan argument beradi.

## Shartlarni birlashtirish

Shartlar ketma-ket yozilsa — **VA**. `-o` — **YOKI**, `!` — **EMAS**:

```text
$ find . -name '*.log' -o -name '*.txt'
./bosh.txt
./logs/eski yozuv.log
./logs/app-20.log
./logs/app-10.log
./logs/app-5.log
./logs/app-1.log
```

Lekin amal qo'shilganda tuzoq bor:

```text
$ find . -name '*.log' -o -name '*.txt' -exec echo topildi: {} \;
topildi: ./bosh.txt
$ find . \( -name '*.log' -o -name '*.txt' \) -exec echo topildi: {} \;
topildi: ./bosh.txt
topildi: ./logs/eski yozuv.log
topildi: ./logs/app-20.log
topildi: ./logs/app-10.log
topildi: ./logs/app-5.log
topildi: ./logs/app-1.log
```

Debian Reference'ga ko'ra `-o` (YOKI) VA'dan **kuchsizroq** bog'lanadi. Shuning uchun birinchi buyruq `-name '*.log'  YOKI  (-name '*.txt' VA -exec ...)` deb o'qildi: `-exec` faqat `.txt` ga tegishli bo'ldi. Qavslar guruhlaydi. Ular qobiq (shell) uchun maxsus, shuning uchun `\(` va `\)` yoziladi.

## Debian va Ubuntu

| | Debian 12 (trenajor) | Ubuntu 26.04 (VPS) |
| --- | --- | --- |
| `find`, `xargs` | GNU findutils 4.9.0 | GNU findutils 4.10.0 |

Ubuntu 26.04 dagi rust-coreutils findutils'ga tegishli emas. `-size` yaxlitlashi, probelli nomning bo'linishi va `xargs -r` VPS'da ham sinaldi, natija bir xil.

## Tipik xatolar

**1. `-delete` ni oldinroq yozish.**
`find papka -delete -name '*.log'` — papkadagi hamma narsa o'chadi.
To'g'risi: avval `-print`, keyin oxiriga `-delete`.

**2. `find | xargs rm` probelli nomlar bilan.**
Nom bo'linib ketadi, boshqa fayl o'chishi mumkin.
To'g'risi: `-print0 | xargs -0` yoki `-exec rm {} +`.

**3. Bo'sh natijada `xargs` ishga tushishi.**
To'g'risi: `xargs -r`.

**4. `-size -1M` ni "1 MB dan kichik" deb tushunish.**
Yuqoriga yaxlitlash sababli faqat bo'sh fayllar topiladi.
To'g'risi: `-size -1024k`.

**5. `-name` shablonini qo'shtirnoqsiz yozish.**
To'g'risi: `-name '*.log'`.

**6. `-o` bilan amalni qavssiz ishlatish.**
To'g'risi: `\( ... -o ... \) -exec ...`.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=19-find)** "Eski loglarni tozalash": loglarni topasiz, katta faylni aniqlaysiz va eskilarini xavfsiz o'chirasiz.

Savollar:

1. `grep -r` va `find` ning farqi nima?
2. `-exec cmd {} \;` va `-exec cmd {} +` farqi nima?
3. `find . -name '*.log' | xargs rm` nega xavfli?
4. `find /var/log -mtime +30` qaysi fayllarni topadi?
5. `find . -name '*.tmp' | xargs rm` bitta ham `.tmp` topmasa, nima bo'ladi? `-r` bilan-chi?

<details>
<summary>Javoblar</summary>

1. `grep -r` fayllarning ichidan matn qidiradi. `find` fayllarni nomi, turi, hajmi, vaqti bo'yicha qidiradi.
2. `\;` — har fayl uchun alohida jarayon. `+` — nomlar yig'ilib, buyruq kam marta ishga tushadi.
3. Probelli nom bo'laklarga bo'linadi va `rm` boshqa narsalarni o'chirishga urinadi.
4. Mazmuni 30 kundan ko'proq (amalda 31 kun va undan eski) oldin o'zgargan fayllarni.
5. `rm` argumentsiz ishga tushadi: `rm: missing operand` xatosi va chiqish kodi `123`. `-r` bilan `rm` umuman ishga tushmaydi.

</details>

## Rasmiy hujjat

- [GNU Findutils manual](https://www.gnu.org/software/findutils/manual/find.html)
- [Debian Reference 9.4.9 — Repeating a command looping over files](https://www.debian.org/doc/manuals/debian-reference/ch09.en.html#_repeating_a_command_looping_over_files)
- [Debian Reference 10.1.5 — Idioms for the selection of files](https://www.debian.org/doc/manuals/debian-reference/ch10.en.html#_idioms_for_the_selection_of_files)
- [find(1) — Debian bookworm](https://manpages.debian.org/bookworm/findutils/find.1.en.html)
- [xargs(1) — Debian bookworm](https://manpages.debian.org/bookworm/findutils/xargs.1.en.html)
- Trenajorda: `man find`, `man xargs`
