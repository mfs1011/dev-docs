# 06 — Inode va havolalar

[← Oldingi: Fayllar bilan ishlash](05-fayllar.md) · [Mundarija](README.md) · [Keyingi: Ruxsatlar →](07-ruxsatlar.md)

## Tushuncha

Fayl nomi va faylning o'zi — **alohida narsalar**. Shu bitta fikrni tushunsangiz, quyidagilar o'z-o'zidan tushunarli bo'ladi:

- nega `mv` bir zumda tugaydi;
- nega o'chirilgan fayl ba'zan diskda joy egallab turaveradi (10-bob);
- deploy paytida `current` havolasi qanday almashtiriladi.

Debian Reference'ga ko'ra tizimdagi har bir fayl, papka, nomli pipe va qurilmaning **inode** degan ma'lumot tuzilmasi bor. Unda fayl haqidagi ma'lumot turadi. inode(7) bo'yicha inode'da quyidagilar bor:

- inode raqami;
- fayl turi va ruxsatlari;
- **havolalar soni** (link count);
- egasi va guruhi;
- hajmi;
- vaqtlari.

Inode'da faylning **nomi yo'q**. Nom papkada turadi: papka — bu "nom → inode raqami" juftliklari ro'yxati.

```text
 papka /tmp/havola              inode 11                      ma'lumot bloklari
┌──────────────┬──────┐        ┌───────────────────────┐      ┌──────────────┐
│ foo          │  11 ─┼───────►│ turi: oddiy fayl      │─────►│ "Asl matn\n" │
│ bar          │  11 ─┼───────►│ ruxsat: rw-r--r--     │      └──────────────┘
│ baz          │  12  │        │ egasi: root           │
└──────────────┴──────┘        │ havolalar soni: 2     │
                               │ hajmi: 9 bayt, vaqtlar│
                               └───────────────────────┘
```

GNU Coreutils qo'llanmasi buni qisqa aytadi: inode faylning barcha ma'lumotini saqlaydi, shuning uchun "inode — bu faylning o'zi" desa ham xato bo'lmaydi.

## Inode'ni ko'rish: `ls -i` va `stat`

```text
$ mkdir -p /tmp/havola && cd /tmp/havola
$ echo "Asl matn" > foo
$ ls -li foo
11 -rw-r--r-- 1 root root 9 Nov  5 11:21 foo
```

Birinchi ustun — inode raqami (`11`). Ruxsatlardan keyingi `1` — havolalar soni: bu inode'ga hozircha bitta nom ishora qilyapti.

`stat` inode'dagi hamma narsani chiqaradi:

```text
$ stat foo
  File: foo
  Size: 9         	Blocks: 8          IO Block: 4096   regular file
Device: 0,29	Inode: 11          Links: 2
Access: (0644/-rw-r--r--)  Uid: (    0/    root)   Gid: (    0/    root)
Access: 2026-11-05 11:21:44.684000000 +0000
Modify: 2026-11-05 11:21:44.684000000 +0000
Change: 2026-11-05 11:21:44.836000000 +0000
 Birth: 2026-11-05 11:21:44.684000000 +0000
```

(Bu chiqish pastdagi `ln foo bar` dan keyin olingan, shuning uchun `Links: 2`.)

> **Trenajorda.** Bu bob misollari `/tmp` da bajariladi. Trenajorning ildiz fayl tizimi brauzer orqali ulanadi (9p) va unda inode raqamlari, havola ruxsatlari va vaqtlar haqiqiy diskdagidan farq qiladi. `/tmp` esa xotiradagi haqiqiy Linux fayl tizimi (tmpfs). Unda natija VPS'dagi ext4 bilan bir xil chiqadi.

## Hard link va symlink

Debian Reference'ga ko'ra faylga ikkinchi nom berishning ikki yo'li bor:

| | Hard link | Symlink (ramziy havola) |
| --- | --- | --- |
| Buyruq | `ln foo bar` | `ln -s foo baz` |
| Nima | Mavjud faylga **yana bitta nom** | Boshqa faylning **nomini** saqlaydigan alohida maxsus fayl |
| Inode | Asl fayl bilan **bir xil** | O'z inode'i bor |
| Asl nom o'chirilsa | Ishlayveradi: ma'lumot oxirgi nom o'chguncha turadi | "Osilib" qoladi (dangling): nom bor, fayl yo'q |
| Papkaga | Mumkin emas | Mumkin |
| Boshqa fayl tizimiga | Mumkin emas | Mumkin |

Debian Reference'dagi misolni trenajorda takrorlaymiz:

```text
$ ln foo bar
$ ln -s foo baz
$ ls -li foo bar baz
11 -rw-r--r-- 2 root root 9 Nov  5 11:21 bar
12 lrwxrwxrwx 1 root root 3 Nov  5 11:21 baz -> foo
11 -rw-r--r-- 2 root root 9 Nov  5 11:21 foo
```

- `foo` va `bar` — bitta inode (`11`), havolalar soni `2`. Ular teng huquqli: qaysi biri "asl" ekanini ajratib bo'lmaydi.
- `baz` — alohida inode (`12`), turi `l` (link). Hajmi `3` bayt, ya'ni ichida "foo" degan 3 harfli nom saqlangan.
- Symlink'ning ruxsatlari doim `rwxrwxrwx`. Debian Reference'ga ko'ra haqiqiy ruxsatni u ishora qilgan fayl belgilaydi.

Endi `foo` ni o'chirib, o'rniga yangisini yozamiz:

```text
$ rm foo
$ echo "Yangi matn" > foo
$ ls -li foo bar baz
11 -rw-r--r-- 1 root root  9 Nov  5 11:21 bar
12 lrwxrwxrwx 1 root root  3 Nov  5 11:21 baz -> foo
13 -rw-r--r-- 1 root root 11 Nov  5 11:21 foo
$ cat bar
Asl matn
$ cat baz
Yangi matn
```

- `rm foo` faylni emas, faqat **nomni** o'chirdi. inode `11` ning havolalar soni `1` ga tushdi, `bar` orqali eski matn turibdi.
- Yangi `foo` — butunlay boshqa inode (`13`).
- `baz` nom bo'yicha ishora qiladi, shuning uchun u endi yangi `foo` ni ko'rsatadi.

`foo` umuman bo'lmasa, symlink osilib qoladi:

```text
$ rm foo
$ cat baz
cat: baz: No such file or directory
$ ls -l baz
lrwxrwxrwx 1 root root 3 Nov  5 11:21 baz -> foo
$ readlink baz
foo
```

`readlink` symlink ichida yozilgan nomni ko'rsatadi. `readlink -f` esa havolalar zanjirini oxirigacha yechib, haqiqiy faylni topadi:

```text
$ readlink -f /bin/sh
/usr/bin/dash
```

Debian'da `sh` — bu `dash` qobig'i (48-bob).

### Hard link cheklovlari

```text
$ ln /etc/hostname h
ln: failed to create hard link 'h' => '/etc/hostname': Invalid cross-device link
$ mkdir papka && ln papka papka2
ln: papka: hard link not allowed for directory
```

- inode(7) ga ko'ra inode raqami faqat **bitta fayl tizimi ichida** noyob. Shuning uchun hard link boshqa fayl tizimiga o'ta olmaydi. `/tmp` (tmpfs) va `/etc` — ikki xil fayl tizimi.
- GNU Coreutils'ga ko'ra ko'p tizimlar papkaga hard link qilishni taqiqlaydi: havolalar aylanasi (cycle) ko'p dasturlarni buzadi.

### Papkaning havolalar soni

Debian Reference'ga ko'ra yangi papkaning havolalar soni `2` dan boshlanadi: papkaning o'z nomi va uning ichidagi `.`. Har yangi ichki papka uni bittaga oshiradi, chunki ichki papkadagi `..` unga ishora qiladi:

```text
$ ls -ld papka
drwxr-xr-x 2 root root 40 Nov  5 11:21 papka
$ mkdir papka/ichki && ls -ld papka
drwxr-xr-x 3 root root 60 Nov  5 11:21 papka
```

## Dasturchi uchun: deploy'da `current` havolasi

Ko'p deploy usullari har bir versiyani alohida papkaga qo'yadi. Ishlab turgan versiyani esa `current` symlink'i ko'rsatadi. Yangi versiyaga o'tish uchun faqat havola almashtiriladi:

```text
$ mkdir -p releases/v1 releases/v2
$ ln -s releases/v1 current
$ ls -l current
lrwxrwxrwx 1 root root 11 Nov  5 11:21 current -> releases/v1
$ ln -sfn releases/v2 current
$ ls -l current
lrwxrwxrwx 1 root root 11 Nov  5 11:21 current -> releases/v2
```

- `-f` mavjud `current` ni almashtiradi. GNU Coreutils'ga ko'ra almashtirish paytida havola bir lahza ham yo'qolib qolmaydi. Bu POSIX'dan tashqari GNU kengaytmasi.
- `-n` muhim. Busiz `current` papkaga ishora qiluvchi havola bo'lgani uchun `ln` uni **papka** deb tushunadi va yangi havolani uning **ichida** yaratadi:

```text
$ ln -sf releases/v1 current
$ ls -l current releases/v2
lrwxrwxrwx 1 root root 11 Nov  5 11:21 current -> releases/v2

releases/v2:
total 0
lrwxrwxrwx 1 root root 11 Nov  5 11:21 v1 -> releases/v1
```

`current` o'zgarmadi. Buning o'rniga `releases/v2/v1` degan keraksiz (va osilgan) havola paydo bo'ldi. GNU Coreutils qo'llanmasi `-n` ni aynan shu holat uchun tavsiflaydi.

## Uch xil vaqt

Debian Reference'ga ko'ra faylda uchta vaqt bor:

| Vaqt | Ma'nosi | `ls` |
| --- | --- | --- |
| **mtime** | Mazmuni o'zgargan vaqt | `ls -l` |
| **ctime** | Holati (inode'i) o'zgargan vaqt: ruxsat, egasi, havolalar soni | `ls -lc` |
| **atime** | Oxirgi o'qilgan vaqt | `ls -lu` |

**ctime — yaratilgan vaqt emas.** Debian Reference buni alohida ta'kidlaydi. Yaratilgan vaqt ba'zi fayl tizimlarida `stat` dagi `Birth` qatorida ko'rinadi.

```text
$ touch -d '2026-01-01 10:00' sana.txt
$ stat -c 'mtime=%y | ctime=%z' sana.txt
mtime=2026-01-01 10:00:00.000000000 +0000 | ctime=2026-11-05 11:21:46.176000000 +0000
$ chmod 600 sana.txt
$ stat -c 'mtime=%y | ctime=%z' sana.txt
mtime=2026-01-01 10:00:00.000000000 +0000 | ctime=2026-11-05 11:21:46.300000000 +0000
$ echo yangi > sana.txt
$ stat -c 'mtime=%y | ctime=%z' sana.txt
mtime=2026-11-05 11:21:46.356000000 +0000 | ctime=2026-11-05 11:21:46.356000000 +0000
```

- `touch -d` mtime'ni istalgan sanaga qo'yadi. ctime'ni esa bunday o'zgartirib bo'lmaydi: u har inode o'zgarishida joriy vaqtni oladi.
- `chmod` faqat ctime'ni o'zgartirdi, mazmun o'zgarmadi.
- Faylga yozish ikkalasini ham o'zgartirdi.

**atime** haqida: Debian Reference'ga ko'ra zamonaviy Linux'da standart `relatime` rejimida atime faqat birinchi o'qishda yoki bir kundan keyin yangilanadi. Bu diskka ortiqcha yozishni kamaytiradi. Shuning uchun "fayl oxirgi marta qachon o'qilgan" degan savolga atime aniq javob bermaydi.

## Inode'lar ham tugashi mumkin

Fayl tizimida inode'lar soni cheklangan. Juda ko'p mayda fayl (masalan, kesh yoki sessiya fayllari) diskda joy bo'lsa ham inode'larni tugatib qo'yishi mumkin. Shunda `df -h` bo'sh joyni ko'rsatadi, yangi fayl esa yaratilmaydi. `df -i` inode'larni ko'rsatadi:

```text
$ df -i /tmp | tail -1
tmpfs          1048576    18 1048558    1% /tmp
```

`IUsed` (18) — ishlatilgan inode'lar, `IFree` — bo'shlari. Disk muammolari 10- va 54-boblarda.

## Tipik xatolar

**1. `ln -sf` ni `-n` siz ishlatish.**
Havola papkaga ishora qilsa, yangi havola uning ichida yaratiladi va `current` almashmaydi. Deploy "o'tdi", lekin eski versiya ishlayveradi.
To'g'risi: `ln -sfn yangi current`.

**2. Symlink'ni nisbiy yo'l bilan noto'g'ri papkada yaratish.**
`ln -s releases/v1 /var/www/current` — havola ichida `releases/v1` yozilib qoladi va u `/var/www/` dan hisoblanadi.
To'g'risi: mutlaq yo'l yozing yoki havola turadigan papkaga o'tib yarating. `readlink -f` bilan tekshiring.

**3. "Fayl o'chirildi, joy bo'shamadi."**
Faylning boshqa hard link'i bor, yoki uni ishlab turgan jarayon hali ochib turibdi. Ma'lumot oxirgi nom va oxirgi ochiq dastur yo'qolguncha turadi (10-bob).

**4. ctime'ni "yaratilgan vaqt" deb o'qish.**
To'g'risi: ctime — inode o'zgargan vaqt. Yaratilgan vaqt `stat` dagi `Birth` qatorida (fayl tizimi qo'llab-quvvatlasa).

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=06-havolalar)** "Havolalar bilan versiya almashtirish": hard link'ning xatti-harakatini ko'rasiz va `current` havolasini to'g'ri almashtirasiz.

Savollar:

1. Faylning 3 ta hard link'i bor. Bittasini `rm` qilsangiz, ma'lumot o'chadimi?
2. Nega `/home` dagi faylga `/tmp` dan hard link qilib bo'lmasligi mumkin?
3. `ls -l` da `lrwxrwxrwx` ko'rdingiz. Bu fayl hammaga yozishga ochiqmi?
4. `chmod` faylning qaysi vaqtini o'zgartiradi?

<details>
<summary>Javoblar</summary>

1. Yo'q. Havolalar soni 2 ga tushadi, ma'lumot qolgan ikki nom orqali turadi.
2. Agar ular ikki xil fayl tizimida bo'lsa: inode raqamlari faqat bitta fayl tizimi ichida noyob.
3. Yo'q. Bu symlink, uning ruxsatlari doim shunday. Haqiqiy ruxsatni u ishora qilgan fayl belgilaydi.
4. Faqat ctime'ni: inode o'zgaradi, mazmun o'zgarmaydi.

</details>

## Rasmiy hujjat

- [Debian Reference 1.2.2 — Filesystem internals](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_filesystem_internals)
- [Debian Reference 1.2.6 — Timestamps](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_timestamps)
- [Debian Reference 1.2.7 — Links](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_links)
- [inode(7)](https://man7.org/linux/man-pages/man7/inode.7.html)
- [symlink(7)](https://man7.org/linux/man-pages/man7/symlink.7.html)
- [GNU Coreutils — ln invocation](https://www.gnu.org/software/coreutils/manual/coreutils.html#ln-invocation)
- [GNU Coreutils — stat invocation](https://www.gnu.org/software/coreutils/manual/coreutils.html#stat-invocation)
