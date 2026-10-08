# 15 — Tree va index

[← Oldingi: Obyektlar: blob va hash](14-obyektlar-blob.md) · [Mundarija](README.md) · [Keyingi: Commit obyekti →](16-commit-obyekti.md)

## Tushuncha

[14-bobda](14-obyektlar-blob.md) omborga blob'lar yozdik va ikki muammo bilan qoldik: fayl **nomi** hech qayerda saqlanmaydi, va bir nechta faylni **birga** — bitta loyiha holati sifatida — saqlashning yo'li yo'q. Ikkalasini **tree** obyekti hal qiladi.

**Tree** — Git'dagi **papka**. U ro'yxat: har qatorida bitta element turadi — fayl yoki ichki papka. Har element uchun uch narsa yoziladi:

1. **rejim** (mode) — bu oddiy faylmi, bajariladigan faylmi, symlink'mi, papkami yoki submodule'mi;
2. **obyekt ID** — fayl bo'lsa blob hash'i, ichki papka bo'lsa boshqa tree hash'i;
3. **nom** — `README`, `test.txt`, `src`.

Pro Git o'xshatishi: Git kontentni UNIX fayl tizimiga o'xshab saqlaydi, faqat soddaroq. Tree — UNIX'dagi papka yozuvlari (directory entries), blob — taxminan inode yoki fayl mazmuni.

```text
            tree 3c4e9cd
           /     |      \
     "bak"    "new.txt"  "test.txt"
       |         |          |
  tree d8329fc  blob fa49b07  blob 1f7a7a4
       |        "new file"   "version 2"
   "test.txt"
       |
  blob 83baae6
  "version 1"
```

Nomlar **tree'da** turadi, mazmun **blob'da**. Shuning uchun bitta blob bir nechta tree'da turli nomlar bilan uchrashi mumkin — u baribir bitta obyekt.

Tree'ni Git qayerdan oladi? Odatda — **index**'dan. **Index** (boshqa nomi **staging area**, "tayyorlash maydoni") — `.git/index` faylida turadigan, keyingi commit'ga kiradigan fayllar ro'yxati. `gitdatamodel` hujjati uni shunday ta'riflaydi: index — fayllar va ularning mazmuni (blob sifatida) ro'yxati; tree'dan farqli ravishda u **tekis** (ichma-ich emas) ro'yxat. Commit qilganda Git bu tekis ro'yxatni papkalar daraxtiga — tree'larga aylantiradi.

Index'dagi har yozuvning to'rt asosiy maydoni bor:

| Maydon | Misol | Izoh |
| --- | --- | --- |
| Fayl turi (rejim) | `100644` | Oddiy, bajariladigan, symlink yoki gitlink |
| Blob ID | `83baae6...` | Submodule bo'lsa — commit ID |
| Stage raqami | `0` | Odatda 0; merge konfliktida 1, 2, 3 ([22-bob](22-konfliktlar.md)) |
| Yo'l | `bak/test.txt` | To'liq yo'l, `/` bilan |

[5-bobda](05-uch-holat.md) uch hududni ko'rgan edik: working tree → index → repository. Bu bobda o'rtadagi hudud ichiga kiramiz: `git add` aslida index faylida nimani yozadi, `git commit` undan qanday qilib tree yasaydi.

## Nega shunday: nega to'g'ridan-to'g'ri working tree'dan emas, index orqali?

Bir qarashda ortiqcha qatlam: fayllar papkada bor, nega ulardan to'g'ridan-to'g'ri tree yasamaslik kerak? Index uchta muammoni hal qiladi:

1. **Commit'ni qismlab yig'ish.** Index — keyingi commit'ning qoralamasi. Working tree'da 10 ta fayl o'zgargan bo'lsa ham, index'ga 2 tasini qo'yib, faqat ularni commit qilasiz ([6-bob](06-ozgarishlarni-yozish.md), [37-bob](37-interaktiv-staging.md)).
2. **Tezlik.** Index har fayl uchun `stat` ma'lumotini (o'zgartirilgan vaqt, hajm, inode) saqlaydi. `git status` har faylni o'qib hash'lamaydi — avval `stat` qiymatlarini solishtiradi va faqat o'zgarganlarinigina ochadi. 100 000 faylli repo'da bu soniyalar va daqiqalar orasidagi farq.
3. **Merge holati.** Konflikt paytida bitta yo'l uchun bir nechta versiya (stage 1, 2, 3) saqlanishi kerak. Bunga tree'da joy yo'q, index'da esa bor.

Tree esa aksincha — **o'zgarmas obyekt**: commit qilingan holat abadiy shunday qoladi. Index — o'zgaruvchan "ish stoli", tree — "arxivga topshirilgan papka".

## Kod: boshlang'ich holat — index yo'q

14-bobdagi repo nusxasida davom etamiz. Omborda to'rtta blob bor: `test content` (`d670460`), `version 1` (`83baae6`), `version 2` (`1f7a7a4`) va `what is up, doc?` (`bd9dbf5`):

```bash
$ cp -r 14-obyektlar 15-tree-index && cd 15-tree-index
$ rm boshqa-nom.txt
$ echo 'version 2' > test.txt
$ ls .git
HEAD
config
description
hooks
info
objects
refs
$ ls .git/index
ls: .git/index: No such file or directory
$ git ls-files -s
$
```

`.git/index` fayli umuman yo'q. Git uni birinchi kerak bo'lganda yaratadi. `git ls-files -s` (`--stage`) — index tarkibini ko'rsatadigan plumbing buyruq; hozir bo'sh.

## Kod: `git update-index` — index'ga yozuv qo'shish

Pro Git misolini takrorlaymiz: `test.txt` nomi ostida **birinchi versiya** blob'ini (`83baae6`) index'ga qo'yamiz. Diskdagi `test.txt` boshqa mazmunda bo'lsa ham farqi yo'q — biz faylni emas, ombordagi obyektni ko'rsatamiz:

```bash
$ git update-index --add --cacheinfo 100644,83baae61804e65cc73a7201a7252750c76066a30,test.txt
$ ls -l .git/index
-rw-r--r--@ 1 ali   staff  104 Oct  8 07:38 .git/index
$ git ls-files -s
100644 83baae61804e65cc73a7201a7252750c76066a30 0	test.txt
```

Ikki opsiya:

- `--add` — fayl index'da hali bo'lmasa, qo'shish. Busiz `update-index` yangi fayllarni e'tiborsiz qoldiradi (buni pastda ko'ramiz).
- `--cacheinfo <rejim>,<obyekt>,<yo'l>` — yozuvni **to'g'ridan-to'g'ri** berish: diskdagi faylga qaramasdan "shu yo'lda shu rejim va shu obyekt bor" deyish. Ma'lumotnomaga ko'ra eski uch argumentli shakl (`--cacheinfo 100644 83baae6... test.txt`, Pro Git'dagidek) ham ishlaydi, lekin yangi foydalanuvchilarga vergulli bitta parametr tavsiya etiladi.

`ls-files -s` chiqishi: `<rejim> <obyekt> <stage>	<yo'l>`. Stage `0` — oddiy, konfliktsiz yozuv.

Endi `.git/objects` ga qaraymiz:

```bash
$ find .git/objects -type f | sort
.git/objects/1f/7a7a472abf3dd9643fd615f6da379c4acb3e3a
.git/objects/83/baae61804e65cc73a7201a7252750c76066a30
.git/objects/bd/9dbf5aae1a3862dd1526723246b20206e5fc37
.git/objects/d6/70460b4b4aece5915caf5c68d12f560a9fe3e4
```

**Hech narsa o'zgarmadi.** `update-index --cacheinfo` faqat `.git/index` faylini o'zgartiradi, ombordagi obyekt allaqachon bor deb hisoblaydi. `git status` esa bu holatni ikki tomonlama ko'radi:

```bash
$ git status
On branch main

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
	new file:   test.txt

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   test.txt

```

Index'da `test.txt` = `version 1`, diskda = `version 2`. Shuning uchun fayl bir vaqtda ham "staged" (index HEAD'dan farq qiladi — HEAD umuman yo'q), ham "modified" (working tree index'dan farq qiladi). Bu [5-bobdagi](05-uch-holat.md) uch hudud modelining aniq namoyishi.

## Kod: `.git/index` fayli baytlar darajasida

`.git/index` — binar fayl. Uning formati rasmiy `gitformat-index` hujjatida tasvirlangan. 104 baytning hammasini ko'ramiz:

```bash
$ xxd .git/index
00000000: 4449 5243 0000 0002 0000 0001 0000 0000  DIRC............
00000010: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000020: 0000 0000 0000 81a4 0000 0000 0000 0000  ................
00000030: 0000 0000 83ba ae61 804e 65cc 73a7 201a  .......a.Ne.s. .
00000040: 7252 750c 7606 6a30 0008 7465 7374 2e74  rRu.v.j0..test.t
00000050: 7874 0000 83a8 b402 8da3 0cc7 105d 83e0  xt...........]..
00000060: db6c 7a7d c915 bd52                      .lz}...R
```

Barcha sonlar **big-endian** (network byte order). Qismlarga ajratamiz:

```text
ofset  baytlar                         ma'nosi
-----  ------------------------------  -------------------------------------------
0x00   44 49 52 43                     imzo "DIRC" (dircache)
0x04   00 00 00 02                     format versiyasi: 2
0x08   00 00 00 01                     yozuvlar soni: 1
                                       ── 1-yozuv ──────────────────────────────
0x0c   00000000 00000000               ctime (soniya, nanosoniya)
0x14   00000000 00000000               mtime (soniya, nanosoniya)
0x1c   00000000                        dev   (qurilma raqami)
0x20   00000000                        ino   (inode raqami)
0x24   000081a4                        rejim: 0x81a4 = 0o100644
0x28   00000000 00000000               uid, gid
0x30   00000000                        fayl hajmi (diskdagi)
0x34   83baae61...76066a30 (20 bayt)   obyekt ID — xom baytlarda, hex emas
0x48   0008                            flags: nom uzunligi = 8
0x4a   74 65 73 74 2e 74 78 74         "test.txt"
0x52   00 00                           NUL to'ldirish (yozuv 8 ga karrali bo'lsin)
                                       ── oxiri ──────────────────────────────────
0x54   83a8b402...c915bd52 (20 bayt)   butun fayl uchun SHA-1 checksum
```

Bir nechta tafsilot:

- **Stat maydonlari nol.** `--cacheinfo` diskdagi faylga qaramaydi, shuning uchun ctime, mtime, dev, ino, uid, gid, hajm — hammasi 0. Oddiy `git add` bu maydonlarni haqiqiy qiymatlar bilan to'ldiradi (pastda ko'ramiz).
- **Rejim 32 bitda.** `gitformat-index` bo'yicha: yuqori 16 bit ishlatilmaydi, keyin 4 bit obyekt turi (`1000` — oddiy fayl, `1010` — symlink, `1110` — gitlink), 3 bit bo'sh, 9 bit UNIX huquqlari. `0x81a4` = `1000 000 110100100` → oddiy fayl, huquq `644`. Oddiy fayllar uchun faqat `0755` va `0644` ruxsat etilgan.
- **flags** 16 bit: 1 bit "assume-valid", 1 bit "extended", 2 bit **stage**, 12 bit nom uzunligi.
- **To'ldirish.** Yozuvning qat'iy qismi 62 bayt (40 bayt stat + 20 bayt hash + 2 bayt flags), keyin nom. `62 + 8 = 70`, 8 ga karrali bo'lishi uchun 2 ta NUL qo'shildi → 72 bayt. Nom doim kamida bitta NUL bilan tugaydi (1–8 ta NUL).
- **Checksum.** Oxirgi 20 bayt — undan oldingi hamma baytlarning SHA-1'i. Tekshiramiz:

```bash
$ head -c 84 .git/index | shasum
83a8b4028da30cc7105d83e0db6c7a7dc915bd52  -
$ tail -c 20 .git/index | xxd -p
83a8b4028da30cc7105d83e0db6c7a7dc915bd52
```

Mos keldi. Index buzilsa (masalan disk xatosi), Git uni checksum orqali sezadi va o'qishdan bosh tortadi.

## Kod: `git write-tree` — index'dan tree yasash

```bash
$ git write-tree
d8329fc1cc938780ffdd9f94e0d364e0ea74f579
$ find .git/objects -type f | sort
.git/objects/1f/7a7a472abf3dd9643fd615f6da379c4acb3e3a
.git/objects/83/baae61804e65cc73a7201a7252750c76066a30
.git/objects/bd/9dbf5aae1a3862dd1526723246b20206e5fc37
.git/objects/d6/70460b4b4aece5915caf5c68d12f560a9fe3e4
.git/objects/d8/329fc1cc938780ffdd9f94e0d364e0ea74f579
```

Yangi obyekt paydo bo'ldi — `d8/329fc...`. `hash-object` dan farqli, `-w` kerak emas: `write-tree` doim yozadi (obyekt allaqachon bo'lsa — qayta yozmaydi). Hash Pro Git'dagi bilan aynan bir xil, chunki tree'da sana yoki muallif yo'q — faqat rejim, nom va blob hash'i.

```bash
$ git cat-file -t d8329fc
tree
$ git cat-file -s d8329fc
36
$ git cat-file -p d8329fc
100644 blob 83baae61804e65cc73a7201a7252750c76066a30	test.txt
```

Ma'lumotnoma ikki shartni aytadi: index **to'liq birlashgan** (fully merged) bo'lishi kerak — ya'ni stage 1/2/3 yozuvlari bo'lmasligi; va index'dagi yozuvlar ko'rsatgan obyektlar omborda bo'lishi kerak (buni `--missing-ok` o'chiradi).

Lekin `write-tree` index faylini ham o'zgartirdi — hajmi 104 dan 137 baytga oshdi:

```bash
$ ls -l .git/index
-rw-r--r--@ 1 ali   staff  137 Oct  8 07:38 .git/index
$ xxd .git/index
00000000: 4449 5243 0000 0002 0000 0001 0000 0000  DIRC............
...
00000040: 7252 750c 7606 6a30 0008 7465 7374 2e74  rRu.v.j0..test.t
00000050: 7874 0000 5452 4545 0000 0019 0031 2030  xt..TREE.....1 0
00000060: 0ad8 329f c1cc 9387 80ff dd9f 94e0 d364  ..2............d
00000070: e0ea 74f5 79b9 c841 7795 877e a1de 4495  ..t.y..Aw..~..D.
00000080: 9b09 d92c 060f edd6 36                   ...,....6
```

Yozuvdan keyin, checksum'dan oldin **kengaytma** (extension) qo'shildi:

```text
54 52 45 45        "TREE" — cache tree kengaytmasi imzosi
00 00 00 19        kengaytma hajmi: 25 bayt
00                 yo'l: "" (ildiz papka), NUL bilan tugaydi
31 20 30 0a        "1 0\n" — 1 ta yozuvni qamraydi, 0 ta ichki tree
d8 32 9f ...       shu qism uchun tree ID (20 bayt)
```

**Cache tree** nima uchun? `gitformat-index` tushuntiradi: index papkalarni yozmaydi, shuning uchun har `write-tree` da hamma tree'larni qaytadan hisoblash kerak bo'lardi. Cache tree "index'ning shu qismi aynan shu tree'ga mos" degan eslatmani saqlaydi. Keyingi commit'da faqat o'zgargan papkalar uchun yangi tree hisoblanadi — katta repo'da bu sezilarli tezlik.

## Kod: ikkinchi tree — yangi fayl va yangilangan versiya

`test.txt` yozuvini ikkinchi versiyaga (`1f7a7a4`) almashtiramiz va yangi `new.txt` faylini qo'shamiz:

```bash
$ echo 'new file' > new.txt
$ git update-index --cacheinfo 100644 1f7a7a472abf3dd9643fd615f6da379c4acb3e3a test.txt
$ xxd .git/index | tail -3
00000050: 7874 0000 5452 4545 0000 0006 002d 3120  xt..TREE.....-1 
00000060: 300a 3e00 376b b292 2e2f 694f d097 875a  0.>.7k.../iO...Z
00000070: 19aa a1fd 0bd5                           ......
```

`test.txt` index'da allaqachon bor, shuning uchun `--add` kerak bo'lmadi (bu yerda Pro Git'dagidek eski uch argumentli shakl ishlatildi). TREE kengaytmasiga qarang: endi u 6 bayt — `\0-1 0\n`. `-1` — "bu tugun **yaroqsiz**": ildiz papkadagi yozuv o'zgardi, saqlangan tree ID endi to'g'ri emas, hash ham olib tashlandi. Hujjatga ko'ra, index'da yo'l yangilanganda Git uning barcha ota papkalari tugunlarini shu tarzda bekor qiladi.

Endi `new.txt` ni qo'shamiz. Avval `--add` siz:

```bash
$ git update-index new.txt
error: new.txt: cannot add to the index - missing --add option?
fatal: Unable to process path new.txt
$ git update-index --add new.txt
$ git ls-files -s
100644 fa49b077972391ad58037050f2a75f74e3671e92 0	new.txt
100644 1f7a7a472abf3dd9643fd615f6da379c4acb3e3a 0	test.txt
$ find .git/objects -type f | sort
.git/objects/1f/7a7a472abf3dd9643fd615f6da379c4acb3e3a
.git/objects/83/baae61804e65cc73a7201a7252750c76066a30
.git/objects/bd/9dbf5aae1a3862dd1526723246b20206e5fc37
.git/objects/d6/70460b4b4aece5915caf5c68d12f560a9fe3e4
.git/objects/d8/329fc1cc938780ffdd9f94e0d364e0ea74f579
.git/objects/fa/49b077972391ad58037050f2a75f74e3671e92
```

Bu safar `--cacheinfo` yo'q — fayl nomi berildi. Shuning uchun `update-index` ikki ish qildi: faylni o'qib **blob yozdi** (`fa/49b07...` paydo bo'ldi) va index'ga yozuv qo'shdi. Bu aynan `git add new.txt` qiladigan ish.

Index'ning yangi baytlariga qarang — `new.txt` yozuvida stat maydonlari endi to'la:

```bash
$ xxd .git/index
00000000: 4449 5243 0000 0002 0000 0002 6ac7 0241  DIRC........j..A
00000010: 2eec 92ed 6ac7 0241 2eec 92ed 0100 000f  ....j..A........
00000020: 01ce 0194 0000 81a4 0000 01f5 0000 0000  ................
00000030: 0000 0009 fa49 b077 9723 91ad 5803 7050  .....I.w.#..X.pP
00000040: f2a7 5f74 e367 1e92 0007 6e65 772e 7478  .._t.g....new.tx
00000050: 7400 0000 0000 0000 0000 0000 0000 0000  t...............
00000060: 0000 0000 0000 0000 0000 0000 0000 81a4  ................
00000070: 0000 0000 0000 0000 0000 0000 1f7a 7a47  .............zzG
00000080: 2abf 3dd9 643f d615 f6da 379c 4acb 3e3a  *.=.d?....7.J.>:
00000090: 0008 7465 7374 2e74 7874 0000 5452 4545  ..test.txt..TREE
000000a0: 0000 0006 002d 3120 300a 986e 90c4 0f36  .....-1 0..n...6
000000b0: 7382 4d3d 265b 9103 3ef5 b0d6 884d       s.M=&[..>....M
```

- Yozuvlar soni `2`.
- `new.txt` (birinchi yozuv): ctime va mtime `6ac70241` soniya, dev `0100000f`, inode `01ce0194`, uid `01f5` (501), hajm `00000009` — `new file\n` 9 bayt. Bular diskdagi faylning haqiqiy `stat` qiymatlari.
- `test.txt` (ikkinchi yozuv): `--cacheinfo` bilan qo'yilgan — stat nol.
- Yozuvlar **nom bo'yicha tartiblangan**: `new.txt` < `test.txt`, garchi `test.txt` oldin qo'shilgan bo'lsa ham.
- `new.txt` nomi 7 bayt: `62 + 7 = 69` → 72 gacha 3 ta NUL.

```bash
$ git write-tree
0155eb4229851634a0f03eb265b69f5a2d56f341
$ git cat-file -p 0155eb4
100644 blob fa49b077972391ad58037050f2a75f74e3671e92	new.txt
100644 blob 1f7a7a472abf3dd9643fd615f6da379c4acb3e3a	test.txt
```

Ikkinchi tree. `test.txt` endi `version 2` blob'ini ko'rsatadi. Birinchi tree (`d8329fc`) esa omborda o'zgarmay turibdi — obyektlar hech qachon o'zgarmaydi.

## Kod: `git read-tree` — tree'ni index'ga o'qish

`read-tree` — `write-tree` ning teskarisi: tree'ni index'ga yuklaydi. `--prefix` bilan tree **ichki papka** sifatida qo'shiladi. Birinchi tree'ni `bak/` papkasiga qo'yamiz:

```bash
$ git read-tree --prefix=bak d8329fc1cc938780ffdd9f94e0d364e0ea74f579
$ git ls-files -s
100644 83baae61804e65cc73a7201a7252750c76066a30 0	bak/test.txt
100644 fa49b077972391ad58037050f2a75f74e3671e92 0	new.txt
100644 1f7a7a472abf3dd9643fd615f6da379c4acb3e3a 0	test.txt
$ git write-tree
3c4e9cd789d88d8d89c1073707c3585e41b0e614
$ git cat-file -p 3c4e9cd
040000 tree d8329fc1cc938780ffdd9f94e0d364e0ea74f579	bak
100644 blob fa49b077972391ad58037050f2a75f74e3671e92	new.txt
100644 blob 1f7a7a472abf3dd9643fd615f6da379c4acb3e3a	test.txt
```

Bu yerda butun bobning asosiy g'oyasi ko'rinadi:

- **Index tekis**: `bak/test.txt` — bitta yozuv, yo'l ichida `/` bor. "bak" degan alohida papka yozuvi yo'q.
- **Tree ichma-ich**: `write-tree` tekis ro'yxatni `/` bo'yicha bo'lib, har papka uchun alohida tree yasadi. `bak` uchun tree — aynan `d8329fc`, chunki uning ichida `test.txt` → `83baae6` dan iborat bitta yozuv bor, va bunday tree avval ham yasalgan edi. Yangi obyekt yaratilmadi — qayta ishlatildi.

Index endi uch qismni qamragan cache tree'ga ega:

```bash
$ xxd .git/index | tail -6
000000e0: 0008 7465 7374 2e74 7874 0000 5452 4545  ..test.txt..TREE
000000f0: 0000 0035 0033 2031 0a3c 4e9c d789 d88d  ...5.3 1.<N.....
00000100: 8d89 c107 3707 c358 5e41 b0e6 1462 616b  ....7..X^A...bak
00000110: 0031 2030 0ad8 329f c1cc 9387 80ff dd9f  .1 0..2.........
00000120: 94e0 d364 e0ea 74f5 795f 0fcf 68b8 bc00  ...d..t.y_..h...
00000130: c92a 48a0 3a20 5998 ecd4 0741 8f         .*H.: Y....A.
```

```text
""   3 1  → 3c4e9cd   ildiz: 3 ta yozuvni qamraydi, 1 ta ichki tree
"bak" 1 0 → d8329fc   bak/: 1 ta yozuv, ichki tree yo'q
```

Tartib — hujjatda aytilganidek "yuqoridan pastga, avval chuqurga" (depth-first).

Working tree'ga qarang:

```bash
$ ls bak
ls: bak: No such file or directory
$ git status --short
AD bak/test.txt
A  new.txt
A  test.txt
```

`read-tree` **faqat index'ni** o'zgartiradi, diskdagi fayllarga tegmaydi (ma'lumotnomada aniq yozilgan). `AD` — "index'ga qo'shilgan (A), lekin working tree'da o'chirilgan (D)". Diskka chiqarish uchun alohida plumbing buyruq — `git checkout-index`:

```bash
$ git checkout-index -a -f
$ ls -R
bak
new.txt
test.txt

./bak:
test.txt
$ cat bak/test.txt
version 1
```

`-a` — index'dagi hamma fayllar, `-f` — mavjud fayllarni ustidan yozish. Endi `bak/test.txt` diskda bor. (Porcelain darajasida bu ishni `git restore`/`git switch` qiladi.)

### `--prefix` siz `read-tree`

`--prefix` bo'lmasa, `read-tree` index'ni butunlay **almashtiradi**:

```bash
$ git read-tree d8329fc
$ git ls-files -s
100644 83baae61804e65cc73a7201a7252750c76066a30 0	test.txt
$ git read-tree 3c4e9cd
$ git ls-files -s
100644 83baae61804e65cc73a7201a7252750c76066a30 0	bak/test.txt
100644 fa49b077972391ad58037050f2a75f74e3671e92 0	new.txt
100644 1f7a7a472abf3dd9643fd615f6da379c4acb3e3a 0	test.txt
```

Bu `git reset --mixed` ning ichki asosi: index'ni berilgan tree holatiga keltirish ([39-bob](39-reset-sirlari.md)).

`read-tree` ning boshqa opsiyalari (ma'lumotnomadan):

| Opsiya | Nima qiladi |
| --- | --- |
| `-m` | O'qish emas, **merge**: 2 ta tree bilan fast-forward, 3 ta tree bilan uch tomonlama merge |
| `-u` | `-m` dan keyin working tree'dagi fayllarni ham yangilash |
| `--reset` | `-m` kabi, lekin birlashmagan yozuvlarni xatosiz tashlab yuboradi |
| `--prefix=<papka>/` | Tree'ni ichki papka sifatida qo'shish; mavjud yozuvlarni ustidan yozmaydi |
| `--index-output=<fayl>` | Natijani `.git/index` o'rniga boshqa faylga yozish |
| `--empty` | Index'ni bo'shatish |
| `-n`, `--dry-run` | Xato bo'lishini tekshirish, hech narsani o'zgartirmasdan |

`write-tree --prefix=<papka>/` esa teskari ish qiladi — index'ning faqat bir papkasidan tree yasaydi:

```bash
$ git write-tree --prefix=bak/
d8329fc1cc938780ffdd9f94e0d364e0ea74f579
```

## Kod: tree obyektining xom baytlari

`git cat-file -p` tree'ni chiroyli formatda ko'rsatadi, lekin diskdagi shakli boshqacha. Rejimlarni o'rganish uchun yangi repo yasaymiz — oddiy fayl, bajariladigan skript, symlink va ichki papka bilan:

```bash
$ git init -q 15-rejimlar && cd 15-rejimlar
$ printf '#!/bin/sh\necho salom\n' > run.sh; chmod +x run.sh
$ echo 'oddiy' > README
$ ln -s README havola
$ mkdir src; echo 'x = 1' > src/main.py
$ git add .
$ git ls-files -s
100644 05bd6b43aff76d9d6a34bec20ed048b1f72b0b6f 0	README
120000 100b93820ade4c16225673b4ca62bb3ade63c313 0	havola
100755 fdb75e014b92c9287170dc4dbeca005b7aaf285f 0	run.sh
100644 7d4290a117a4ddcc11daae7ea675841033830c8f 0	src/main.py
$ git write-tree
2d0d09e850aa9b13a557c34c7d1b686f98dbfab4
$ git cat-file -p 2d0d09e
100644 blob 05bd6b43aff76d9d6a34bec20ed048b1f72b0b6f	README
120000 blob 100b93820ade4c16225673b4ca62bb3ade63c313	havola
100755 blob fdb75e014b92c9287170dc4dbeca005b7aaf285f	run.sh
040000 tree 1ee8339b11b3d3561418b3dc02cff620dcbd9380	src
```

Endi zlib'dan ochilgan, sarlavhasiz mazmun (`cat-file tree` — 14-bobdagi `<tur>` shakli):

```bash
$ git cat-file -s 2d0d09e
132
$ git cat-file tree 2d0d09e | xxd
00000000: 3130 3036 3434 2052 4541 444d 4500 05bd  100644 README...
00000010: 6b43 aff7 6d9d 6a34 bec2 0ed0 48b1 f72b  kC..m.j4....H..+
00000020: 0b6f 3132 3030 3030 2068 6176 6f6c 6100  .o120000 havola.
00000030: 100b 9382 0ade 4c16 2256 73b4 ca62 bb3a  ......L."Vs..b.:
00000040: de63 c313 3130 3037 3535 2072 756e 2e73  .c..100755 run.s
00000050: 6800 fdb7 5e01 4b92 c928 7170 dc4d beca  h...^.K..(qp.M..
00000060: 005b 7aaf 285f 3430 3030 3020 7372 6300  .[z.(_40000 src.
00000070: 1ee8 339b 11b3 d356 1418 b3dc 02cf f620  ..3....V....... 
00000080: dcbd 9380                                ....
```

Har yozuv shunday tuzilgan:

```text
<rejim ASCII'da> <bo'sh joy> <nom> <NUL> <hash, 20 xom bayt>
 "100644"          " "      "README" 00   05 bd 6b 43 ... 0b 6f
```

E'tibor bering:

- Tree'da yozuvlar orasida yangi qator **yo'q**. Keyingi yozuv hash'ning 20-baytidan keyin darhol boshlanadi.
- Hash **xom** (binar) 20 bayt, hex matn emas. Shu sababli tree o'qib bo'lmaydigan ko'rinadi.
- Obyekt turi (`blob`/`tree`) diskda **yozilmaydi** — `cat-file -p` uni rejimdan yoki obyektni o'qib aniqlaydi.
- Papka rejimi xom baytlarda **`40000`** — boshidagi nolsiz (5 belgi). `cat-file -p` va `ls-tree` uni chiroyli bo'lishi uchun `040000` qilib to'ldirib ko'rsatadi.

Shu bilimdan foydalanib Python'da tree hash'ini Git'siz hisoblaymiz — 14-bobdagi blob hisobining davomi:

```bash
$ python3 - <<'EOF'
import hashlib, binascii
def tree(entries):
    body = b''.join(m.encode() + b' ' + n.encode() + b'\0' + binascii.unhexlify(s)
                    for m, n, s in entries)
    return hashlib.sha1(b'tree %d\0' % len(body) + body).hexdigest()
bak = tree([('100644', 'test.txt', '83baae61804e65cc73a7201a7252750c76066a30')])
print(bak)
print(tree([('40000', 'bak', bak),
            ('100644', 'new.txt', 'fa49b077972391ad58037050f2a75f74e3671e92'),
            ('100644', 'test.txt', '1f7a7a472abf3dd9643fd615f6da379c4acb3e3a')]))
EOF
d8329fc1cc938780ffdd9f94e0d364e0ea74f579
3c4e9cd789d88d8d89c1073707c3585e41b0e614
```

Ikkala hash `write-tree` bergan bilan bir xil. Formula o'sha-o'sha: `"tree " + hajm + "\0" + mazmun` → SHA-1 → zlib.

Bundan muhim xulosa: ichki papkadagi bitta fayl o'zgarsa, uning blob hash'i o'zgaradi → o'sha papka tree'si o'zgaradi → uning ota tree'si o'zgaradi → ... ildiz tree'gacha. O'zgarmagan papkalar tree'lari esa aynan o'sha hash bilan qayta ishlatiladi. Bu **Merkle daraxti**: ildiz hash'i butun daraxt mazmunining kafolati.

## Kod: rejimlar

`gitdatamodel` bo'yicha tree yozuvi beshta turdan biri bo'lishi shart. Rejim UNIX rejimlariga o'xshatib yozilgan, lekin ancha cheklangan:

| Rejim | Ma'nosi | Obyekt turi | Index'dagi 32-bitli qiymat |
| --- | --- | --- | --- |
| `100644` | Oddiy fayl | `blob` | `0x81a4` |
| `100755` | Bajariladigan fayl | `blob` | `0x81ed` |
| `120000` | Symbolic link | `blob` | `0xa000` |
| `040000` | Papka | `tree` | (index'da yo'q*) |
| `160000` | Gitlink (submodule) | `commit` | `0xe000` |

\* Sparse index yoqilgan maxsus holatda index'da `040000` yozuvlar ham bo'lishi mumkin (`gitformat-index`), lekin oddiy repo'da index faqat fayllarni saqlaydi.

Har birini ko'rib chiqamiz.

**`100644` va `100755`.** Git fayl huquqlaridan faqat bitta narsani saqlaydi: **bajariladiganmi yoki yo'q**. `640`, `600`, `664` kabi huquqlar yo'qoladi — boshqa kompyuterda fayl `644` yoki `755` bo'lib chiqadi. Bajariladigan bitni diskdagi faylga tegmasdan index'da o'zgartirish mumkin:

```bash
$ git update-index --chmod=-x run.sh
$ git ls-files -s run.sh
100644 fdb75e014b92c9287170dc4dbeca005b7aaf285f 0	run.sh
$ ls -l run.sh | cut -c1-10
-rwxr-xr-x
$ git update-index --chmod=+x run.sh
$ git ls-files -s run.sh
100755 fdb75e014b92c9287170dc4dbeca005b7aaf285f 0	run.sh
```

Blob hash'i o'zgarmadi — bajariladiganlik blob'da emas, rejimda. Bu Windows'da foydali: u yerda fayl tizimi `x` bitni bilmaydi, lekin `git update-index --chmod=+x` (yoki `git add --chmod=+x`) bilan skriptni Linux foydalanuvchilari uchun bajariladigan qilish mumkin.

**`120000` — symlink.** Symlink blob sifatida saqlanadi, mazmuni — **havola ko'rsatgan yo'l matni**:

```bash
$ git cat-file -p 100b938 | xxd
00000000: 5245 4144 4d45                           README
```

6 bayt `README`, oxirida yangi qatorsiz. Git havola ortidagi faylni emas, havolaning o'zini saqlaydi.

**`040000` — papka.** Faqat tree ichida uchraydi. Git **bo'sh papkani saqlay olmaydi**: papka index'da alohida yozuv emas, yo'llardan kelib chiqadi; ichida fayl bo'lmasa, yo'l ham yo'q. Shuning uchun loyihalarda bo'sh papka o'rniga ichida `.gitkeep` kabi bo'sh fayl qo'yiladi (bu Git qoidasi emas, odat).

```bash
$ mkdir bosh
$ git add .
$ git ls-files -s | grep bosh
$
```

**`160000` — gitlink.** Submodule uchun: tree yozuvi blob'ni emas, **boshqa repo'dagi commit'ni** ko'rsatadi ([43-bob](43-submodule-bundle-replace.md)). Uni qo'lda yasab ko'ramiz (hash — 16-bobda yasaladigan commit'niki, bu repo'da u yo'q):

```bash
$ git update-index --add --cacheinfo 160000,1a410efbd13591db07496601ebc7a059dd55cfe9,vendor/lib
$ git write-tree
c61b968757603e4fe71253c7fb385ca7f5c98580
$ git ls-tree -r -l c61b968
100644 blob 05bd6b43aff76d9d6a34bec20ed048b1f72b0b6f       6	README
120000 blob 100b93820ade4c16225673b4ca62bb3ade63c313       6	havola
100755 blob fdb75e014b92c9287170dc4dbeca005b7aaf285f      21	run.sh
100644 blob 7d4290a117a4ddcc11daae7ea675841033830c8f       6	src/main.py
160000 commit 1a410efbd13591db07496601ebc7a059dd55cfe9       -	vendor/lib
```

Ikki nuqta: `write-tree` gitlink obyekti omborda yo'qligidan **shikoyat qilmadi** — commit boshqa repo'da bo'lishi kutiladi. Va `ls-tree -l` gitlink uchun hajm o'rniga `-` ko'rsatdi.

Pro Git ham shuni aytadi: fayllar (blob'lar) uchun faqat uch rejim — `100644`, `100755`, `120000` — yaroqli; papka va submodule'lar uchun boshqa rejimlar ishlatiladi.

## Kod: `git ls-tree` va `git ls-files` opsiyalari

Ikki o'xshash buyruqni chalkashtirmang:

| Buyruq | Nimani ko'rsatadi |
| --- | --- |
| `git ls-tree <tree-ish>` | **Tree obyekti** (yoki commit'ning tree'si) tarkibini |
| `git ls-files` | **Index** tarkibini (va working tree bilan solishtirishni) |

`ls-tree` 15-tree-index repo'sida, `3c4e9cd` tree'si ustida:

```bash
$ git ls-tree 3c4e9cd
040000 tree d8329fc1cc938780ffdd9f94e0d364e0ea74f579	bak
100644 blob fa49b077972391ad58037050f2a75f74e3671e92	new.txt
100644 blob 1f7a7a472abf3dd9643fd615f6da379c4acb3e3a	test.txt
$ git ls-tree -r 3c4e9cd
100644 blob 83baae61804e65cc73a7201a7252750c76066a30	bak/test.txt
100644 blob fa49b077972391ad58037050f2a75f74e3671e92	new.txt
100644 blob 1f7a7a472abf3dd9643fd615f6da379c4acb3e3a	test.txt
$ git ls-tree -r -t 3c4e9cd
040000 tree d8329fc1cc938780ffdd9f94e0d364e0ea74f579	bak
100644 blob 83baae61804e65cc73a7201a7252750c76066a30	bak/test.txt
100644 blob fa49b077972391ad58037050f2a75f74e3671e92	new.txt
100644 blob 1f7a7a472abf3dd9643fd615f6da379c4acb3e3a	test.txt
$ git ls-tree -l 3c4e9cd
040000 tree d8329fc1cc938780ffdd9f94e0d364e0ea74f579       -	bak
100644 blob fa49b077972391ad58037050f2a75f74e3671e92       9	new.txt
100644 blob 1f7a7a472abf3dd9643fd615f6da379c4acb3e3a      10	test.txt
$ git ls-tree --name-only -r 3c4e9cd
bak/test.txt
new.txt
test.txt
$ git ls-tree -d 3c4e9cd
040000 tree d8329fc1cc938780ffdd9f94e0d364e0ea74f579	bak
$ git ls-tree --format='%(objectname) %(path)' 3c4e9cd
d8329fc1cc938780ffdd9f94e0d364e0ea74f579 bak
fa49b077972391ad58037050f2a75f74e3671e92 new.txt
1f7a7a472abf3dd9643fd615f6da379c4acb3e3a test.txt
```

| Opsiya | Ma'nosi |
| --- | --- |
| `-r` | Ichki tree'larga kirish (rekursiv) |
| `-t` | `-r` bilan birga tree yozuvlarining o'zini ham ko'rsatish |
| `-d` | Faqat tree yozuvlari |
| `-l`, `--long` | Blob hajmi (tree uchun `-`) |
| `--name-only` | Faqat yo'llar |
| `--object-only` | Faqat hash'lar |
| `--abbrev[=<n>]` | Qisqa hash |
| `--format=<f>` | `%(objectmode)`, `%(objecttype)`, `%(objectname)`, `%(objectsize)`, `%(path)` |

Ma'lumotnoma ta'kidlaydi: `ls-tree` ning standart chiqishi `git update-index --index-info` kutadigan format bilan mos. Ya'ni bir tree'ni o'zgartirib, boshqa index'ga "quyish" mumkin (pastda ko'ramiz).

`ls-files` asosiy opsiyalari:

| Opsiya | Nimani ko'rsatadi |
| --- | --- |
| (yo'q) yoki `-c` | Index'dagi barcha fayl nomlari (kuzatilayotganlar) |
| `-s`, `--stage` | Rejim, obyekt, stage va yo'l |
| `-m` | Working tree'da o'zgargan (unstaged) fayllar |
| `-d` | Working tree'da o'chirilgan fayllar |
| `-o` | Kuzatilmayotgan fayllar (`--exclude-standard` bilan `.gitignore` hisobga olinadi) |
| `-u` | Faqat birlashmagan (konfliktli) yozuvlar |
| `-t` | Har fayl oldida holat belgisi (`H` — oddiy kuzatilayotgan) |
| `--debug` | Har yozuvning stat ma'lumoti |
| `--format=<f>` | `%(objectmode)`, `%(objectname)`, `%(objecttype)`, `%(objectsize)`, `%(stage)`, `%(path)` va boshqalar |

```bash
$ git ls-files --format='%(objectmode) %(objecttype) %(objectsize) %(path)'
100644 blob 10 bak/test.txt
100644 blob 9 new.txt
100644 blob 10 test.txt
```

## Kod: tree'dagi tartib qoidasi

Index yozuvlari to'liq yo'l bo'yicha bayt tartibida (`memcmp`) saralanadi. Tree yozuvlari ham nom bo'yicha saralanadi, lekin bitta nozik qoida bor: **papka nomi oxiriga `/` qo'shilgandek solishtiriladi**. Buni ko'rish uchun `a-b`, `a.b` fayllari va `a/` papkasini olamiz:

```bash
$ git init -q 15-tartib && cd 15-tartib
$ mkdir a; echo 1 > a-b; echo 2 > a.b; echo 3 > a/x
$ git add .
$ git ls-files -s
100644 d00491fd7e5bb6fa28c517a0bb32b8b506539d4d 0	a-b
100644 0cfbf08886fca9a91cb753ec8734c84fcbe52c9f 0	a.b
100644 00750edc07d6415dcc07ae0351e9397b0222b7ba 0	a/x
$ git ls-tree $(git write-tree)
100644 blob d00491fd7e5bb6fa28c517a0bb32b8b506539d4d	a-b
100644 blob 0cfbf08886fca9a91cb753ec8734c84fcbe52c9f	a.b
040000 tree edc566508fc1a91964d1ad1c27574fdab11e3da1	a
```

Oddiy alifbo bo'yicha `a` eng birinchi bo'lishi kerak edi (`a` < `a-b`). Lekin tree'da papka `a` oxirida: u `a/` deb solishtiriladi, `/` (0x2f) esa `-` (0x2d) va `.` (0x2e) dan katta. Shu tufayli tree tartibi index tartibiga mos keladi va `write-tree` index'ni bir marta o'tib tree'larni yasay oladi.

Bu qoida nima uchun muhim? Agar siz tree'ni o'zingiz yasasangiz (masalan `git mktree` yoki boshqa kutubxona bilan) va noto'g'ri tartiblasangiz, hash boshqa chiqadi va `git fsck` bunday tree'ni `treeNotSorted` deb xato beradi.

## Kod: bo'sh tree

Index bo'sh bo'lsa ham `write-tree` ishlaydi:

```bash
$ git read-tree --empty
$ git ls-files -s | wc -l
       0
$ git write-tree
4b825dc642cb6eb9a060e54bf8d69288fbee4904
$ printf 'tree 0\0' | shasum
4b825dc642cb6eb9a060e54bf8d69288fbee4904  -
$ ls .git/objects/4b
ls: .git/objects/4b: No such file or directory
$ git cat-file -t 4b825dc642cb6eb9a060e54bf8d69288fbee4904
tree
$ git cat-file -t 4b825dc
fatal: Not a valid object name 4b825dc
```

`4b825dc...` — **bo'sh tree**, mazmuni 0 bayt. U 14-bobdagi bo'sh blob (`e69de29`) kabi har repo'da bir xil. Qiziq tomoni: Git uni diskka yozmadi, lekin to'liq hash bilan so'rasak — taniydi. Bo'sh tree Git ichiga "o'rnatilgan" — u omborda bo'lmasa ham mavjud deb hisoblanadi. Qisqa prefiks bilan esa topilmaydi, chunki qisqa nomlar faqat diskdagi obyektlar orasidan qidiriladi.

Bo'sh tree amalda foydali: `git diff 4b825dc642cb6eb9a060e54bf8d69288fbee4904 HEAD` — "hech narsadan" hozirgi holatgacha bo'lgan to'liq diff, ya'ni birinchi commit'ning ham diff'i.

## Kod: `git add` = `hash-object -w` + `update-index`

Endi `git add` ni faqat plumbing bilan takrorlaymiz va natijani taqqoslaymiz. Avval porcelain:

```bash
$ git init -q 15-add && cd 15-add
$ echo 'salom' > salom.txt
$ git add salom.txt
$ git ls-files -s
100644 4de65895076ffaf8572ae06909fa475a10567eea 0	salom.txt
$ find .git/objects -type f
.git/objects/4d/e65895076ffaf8572ae06909fa475a10567eea
$ git ls-files --debug
salom.txt
  ctime: 1791427197:263043938
  mtime: 1791427197:263043938
  dev: 16777231	ino: 30288838
  uid: 501	gid: 0
  size: 6	flags: 0
```

`git add` ikki ish qildi: blob yozdi va index yozuvini stat ma'lumoti bilan to'ldirdi. Stat qiymatlari aynan operatsion tizim bergan qiymatlar:

```bash
$ stat -f '%c %m %d %i %u %g %z' salom.txt
1791427197 1791427197 16777231 30288838 501 0 6
```

(`stat -f` — macOS sintaksisi; Linux'da `stat -c '%Z %Y %d %i %u %g %s'`.)

Endi index va obyektni o'chirib, xuddi shuni plumbing bilan qilamiz:

```bash
$ rm .git/index; rm -rf .git/objects/??
$ H=$(git hash-object -w salom.txt); echo $H
4de65895076ffaf8572ae06909fa475a10567eea
$ git update-index --add --cacheinfo 100644,$H,salom.txt
$ git ls-files --debug
salom.txt
  ctime: 0:0
  mtime: 0:0
  dev: 0	ino: 0
  uid: 0	gid: 0
  size: 0	flags: 0
```

Obyekt va index yozuvi bir xil, faqat stat nol — `--cacheinfo` faylga qaramaydi. Bu xato emas: Git keyingi safar faylni tekshirganda stat'ni yangilaydi. Buni qo'lda `--refresh` bilan qilamiz:

```bash
$ git update-index --refresh
$ git ls-files --debug
salom.txt
  ctime: 1791427197:263043938
  mtime: 1791427197:263043938
  dev: 16777231	ino: 30288838
  uid: 501	gid: 0
  size: 6	flags: 0
```

Endi index `git add` yaratgan bilan bir xil. Xulosa:

```text
git add fayl   ≈   git hash-object -w fayl            # blob → .git/objects
                   git update-index --add fayl        # yozuv + stat → .git/index
```

(`git update-index --add fayl` ning o'zi ham blob yozadi — ikkinchi qatorning bittasi yetarli. Ikkiga ajratdik, qadamlar ko'rinsin.)

## Kod: stat kesh qanday ishlaydi

`--refresh` haqida ma'lumotnoma aniq aytadi: u yangi hash hisoblamaydi va mazmun o'zgarishini index'ga yozmaydi; faqat faylning stat ma'lumotini index bilan "qayta moslaydi". Buni sinaymiz. Faylni o'zgartirmasdan, faqat vaqtini o'zgartiramiz:

```bash
$ touch -t 202610081200 salom.txt
$ git diff-files
:100644 100644 4de65895076ffaf8572ae06909fa475a10567eea 0000000000000000000000000000000000000000 M	salom.txt
$ git diff-files -p
$
```

`git diff-files` (index ↔ working tree solishtiradigan plumbing) faylni "o'zgargan" deb belgiladi — stat mos kelmadi, hash `0000...` ("hali hisoblanmagan"). Lekin `-p` bilan haqiqiy diff bo'sh: mazmun bir xil. Bu "stat dirty" holat — stat o'zgargan, mazmun yo'q.

```bash
$ git update-index --refresh
$ git diff-files
$
$ git ls-files --debug | grep mtime
  mtime: 1791442800:0
```

`--refresh` faylni o'qidi, hash index'dagi bilan bir xil ekanini ko'rdi va faqat stat'ni yangiladi. Endi mazmunni haqiqatan o'zgartiramiz:

```bash
$ echo 'xayr!' > salom.txt
$ git update-index --refresh
salom.txt: needs update
$ echo $?
1
```

`needs update` — "mazmun o'zgargan, buni `--refresh` tuzata olmaydi, `git add` kerak". `git status` ham ichkarida xuddi shu refresh'ni bajaradi va natijani (agar huquqi bo'lsa) index'ga yozib qo'yadi — shuning uchun `git status` ba'zan `.git/index` vaqtini o'zgartiradi.

`assume-unchanged` va `skip-worktree` bitlari ham shu mexanizm ustiga qurilgan (`git update-index --assume-unchanged`, `--skip-worktree`): ular Git'ga "bu faylning stat'ini tekshirma" deydi. Ma'lumotnomaga ko'ra `assume-unchanged` — sekin `lstat` li fayl tizimlari uchun tezlik vositasi, "o'zgarishlarimni e'tiborsiz qoldir" degan vosita **emas**: Git bu faylni o'zgartirishi kerak bo'lsa (masalan merge'da), xato beradi.

## Kod: vaqtincha index — `GIT_INDEX_FILE`

Index — oddiy fayl, va Git qaysi faylni index sifatida ishlatishni `GIT_INDEX_FILE` muhit o'zgaruvchisidan oladi. Bu skriptlarda asosiy index'ga tegmasdan tree yasash imkonini beradi:

```bash
$ GIT_INDEX_FILE=.git/vaqtincha git read-tree 0155eb4
$ GIT_INDEX_FILE=.git/vaqtincha git ls-files -s
100644 fa49b077972391ad58037050f2a75f74e3671e92 0	new.txt
100644 1f7a7a472abf3dd9643fd615f6da379c4acb3e3a 0	test.txt
$ git ls-files -s | wc -l
       3
```

Asosiy index'da 3 ta yozuv qoldi — tegilmadi. Endi `ls-tree` chiqishini o'zgartirib, `--index-info` ga quyamiz (`new.txt` nomini `yangi.txt` qilib):

```bash
$ git ls-tree 0155eb4 | sed 's/new.txt/yangi.txt/' | GIT_INDEX_FILE=.git/vaqtincha git update-index --index-info
$ GIT_INDEX_FILE=.git/vaqtincha git ls-files -s
100644 fa49b077972391ad58037050f2a75f74e3671e92 0	new.txt
100644 1f7a7a472abf3dd9643fd615f6da379c4acb3e3a 0	test.txt
100644 fa49b077972391ad58037050f2a75f74e3671e92 0	yangi.txt
$ GIT_INDEX_FILE=.git/vaqtincha git write-tree
b1c0df9657b54681181a3f5aa59373135bc0348f
$ rm .git/vaqtincha
```

`--index-info` yozuvlarni **qo'shdi** yoki yangiladi, lekin mavjud `new.txt` ni o'chirmadi — yozuvni o'chirish uchun rejimi `0` bo'lgan qator yuboriladi. `--index-info` uchta kirish formatini qabul qiladi: `ls-tree` chiqishi (`rejim tur hash<TAB>yo'l`), `ls-files -s` chiqishi (`rejim hash stage<TAB>yo'l`) va eski `rejim hash<TAB>yo'l`.

Bunday "vaqtincha index" usulini `git stash` va ko'p CI vositalari ichkarida ishlatadi.

## Kod: yo'q obyektga ishora va `--missing-ok`

```bash
$ git update-index --add --cacheinfo 100644,1234567890123456789012345678901234567890,yoq.txt
$ git write-tree
error: invalid object 100644 1234567890123456789012345678901234567890 for 'yoq.txt'
fatal: git-write-tree: error building trees
$ git write-tree --missing-ok
32eb30f2144e9c1887ff4528474dfa2f90fa5d17
$ git update-index --force-remove yoq.txt
```

`write-tree` standart holatda index ko'rsatgan har obyekt omborda borligini tekshiradi. `--missing-ok` tekshiruvni o'chiradi va **buzuq tree** yasaydi (ichida yo'q blob'ga ishora). Bu faqat obyektlar keyinroq keladigan maxsus holatlar uchun (masalan, qisman klonlash vositalari). `--force-remove` — yozuvni index'dan o'chirish, diskda fayl bo'lsa ham.

## Muhandislik nuqtai nazari: index versiyalari va katta repo'lar

Index formati uch versiyada mavjud: 2, 3, 4. Hujjatga ko'ra standart — 2 yoki 3 (3 faqat `git add -N` kabi qo'shimcha flag'lar kerak bo'lganda). **4-versiya** yo'llarni prefiks bilan siqadi: har yozuv yo'li oldingi yozuv yo'lidan farq qiladigan qismi bilan yoziladi va NUL to'ldirish yo'q:

```bash
$ git update-index --show-index-version
2
$ git update-index --index-version 4 --verbose
index-version: was 2, set to 4
$ ls -l .git/index | awk '{print $5}'
293
$ git update-index --index-version 2
$ ls -l .git/index | awk '{print $5}'
298
```

Uchta faylda farq 5 bayt, lekin ma'lumotnomaga ko'ra katta repo'larda 4-versiya index hajmini 30–50% kamaytiradi va yuklashni tezlashtiradi. U Git 1.8.0 (2012) dan beri qo'llab-quvvatlanadi va endi "yetuk texnologiya" deb hisoblanadi. Doimiy yoqish uchun — `index.version = 4` sozlamasi ([45-bob](45-config-chuqur.md)).

Katta monorepo'lar uchun index atrofida yana bir nechta mexanizm bor (har biri `update-index` opsiyasi va config sozlamasi sifatida):

| Mexanizm | Muammo | Yechim |
| --- | --- | --- |
| **Split index** (`--split-index`) | Index juda katta, har o'zgarishda butunlay qayta yoziladi | Asosiy "umumiy" index + kichik o'zgarishlar fayli |
| **Untracked cache** (`--untracked-cache`) | `git status` har safar barcha papkalarni kuzatilmagan fayllar uchun aylanib chiqadi | Papkalar `stat`ini keshlash |
| **FSMonitor** (`--fsmonitor`) | 100 000 fayl uchun `lstat` chaqiruvlari sekin | Operatsion tizimdan "nima o'zgardi" ro'yxatini olish |
| **Sparse index** | Sparse checkout'da index baribir hamma fayllarni saqlaydi | Kerak bo'lmagan papkalar bitta `040000` yozuv bilan |

Kichik va o'rta loyihalarda bularning hech biri kerak emas — standart sozlamalar yetarli.

## Muhandislik nuqtai nazari: index — bu ochiq o'zgaruvchan holat

Index'ning tabiati tree'dan tubdan farq qiladi va bu amaliy oqibatlarga ega:

- **Index hash bilan himoyalangan, lekin tarixga ega emas.** `.git/index` ni noto'g'ri `read-tree` bilan ustidan yozsangiz, oldingi holati reflog'da saqlanmaydi. Index'da bo'lgan, lekin hech qachon commit qilinmagan o'zgarishlar faqat blob sifatida qoladi (`git add` ularni yozgan) — `git fsck --lost-found` bilan topish mumkin ([42-bob](42-reflog-va-tiklash.md)).
- **Bir vaqtda faqat bitta yozuvchi.** Git index'ni o'zgartirganda avval `.git/index.lock` yaratadi, yangi index'ni shu faylga yozadi va oxirida `rename` bilan almashtiradi. Ikkinchi Git jarayoni lock'ni ko'rsa, xato beradi (`Unable to create '.../index.lock': File exists`). Git jarayoni to'satdan o'lsa, lock fayl qolib ketishi mumkin — boshqa hech qanday Git jarayoni ishlamayotganiga ishonch hosil qilgandan keyingina uni qo'lda o'chiring.
- **Index'ni o'chirish ma'lumotni yo'qotmaydi, lekin staging'ni yo'qotadi.** `rm .git/index` dan keyin `git read-tree HEAD` (yoki `git reset`) index'ni oxirgi commit holatiga qaytaradi; staged, lekin commit qilinmagan o'zgarishlar index'dan ketadi (blob'lari omborda qoladi).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Index — bu `git add` qilingan "o'zgarishlar ro'yxati" deb o'ylash | Index keyingi commit'ning **to'liq** surati: o'zgarmagan fayllar ham unda bor | `git ls-files -s` bilan tekshiring |
| `update-index` dan keyin `--add` siz yangi fayl qo'shishga urinish | `missing --add option?` xatosi | `--add` qo'shing yoki `git add` ishlating |
| `read-tree` diskdagi fayllarni ham yangilaydi deb kutish | Faqat index o'zgaradi, status chalkashadi (`AD`) | `checkout-index -a`, `read-tree -u -m` yoki porcelain `git restore` |
| `--prefix` siz `read-tree` qilib index'ni yo'qotish | Index butunlay almashtiriladi | `--prefix=papka/` yoki vaqtincha `GIT_INDEX_FILE` |
| Bo'sh papkani commit qilishga urinish | Git papkalarni alohida saqlamaydi | Ichiga `.gitkeep` kabi fayl qo'ying |
| Fayl huquqlarini (`600`, `640`) Git saqlaydi deb o'ylash | Faqat `644`/`755` farqi saqlanadi | Huquqlarni deploy skripti bilan o'rnating |
| Windows'da skriptni bajariladigan qila olmaslik | Fayl tizimida `x` bit yo'q | `git update-index --chmod=+x skript.sh` |
| `assume-unchanged` bilan lokal sozlama faylini "yashirish" | Bu tezlik vositasi; merge'da xato beradi | `.gitignore` + namuna fayl (`config.example`), yoki `skip-worktree` |
| Qolib ketgan `index.lock`ni darhol o'chirish | Boshqa Git jarayoni ishlayotgan bo'lsa, index buziladi | Avval jarayon yo'qligini tekshiring |
| `cat-file -p` dagi `040000` ni diskda ham shunday deb hisoblab tree yasash | Xom formatda `40000`; hash mos kelmaydi | `git mktree` yoki `write-tree` dan foydalaning |

## Amaliyot

1. Yangi repo'da `.git/index` yo'qligini tekshiring. Bitta fayl uchun `git add` qiling va `xxd .git/index` chiqishida imzo, versiya, yozuvlar soni, rejim, hash va nomni toping. Oxirgi 20 bayt checksum ekanini `head -c` va `shasum` bilan isbotlang.
2. Bir xil faylni avval `git update-index --add --cacheinfo`, keyin `git add` bilan index'ga qo'ying. `git ls-files --debug` chiqishidagi farqni tushuntiring. `git update-index --refresh` dan keyin nima o'zgaradi?
3. `git write-tree` dan oldin va keyin `.git/index` hajmini o'lchang. Qo'shilgan baytlar nima? Bitta faylni o'zgartirib, `update-index` dan keyin TREE kengaytmasi qanday ko'rinishini kuzating.
4. Ikki papka va to'rtta fayldan iborat tree yasang. Ichki papkadagi bitta faylni o'zgartirib, yana `write-tree` qiling. `find .git/objects -type f` bilan nechta yangi obyekt paydo bo'lganini oldindan ayting va tekshiring.
5. `git read-tree --prefix=eski/ <tree>` bilan mavjud tree'ni ichki papka qilib qo'shing, keyin `git checkout-index -a` bilan diskka chiqaring. `git status --short` har qadamda nima ko'rsatadi?
6. Bajariladigan skript, symlink va oddiy fayl qo'shing. `git cat-file tree <hash> | xxd` chiqishida har uch rejimni va papka uchun `40000` ni toping. Symlink blob'ining mazmuni nima?
7. `GIT_INDEX_FILE` bilan vaqtincha index'da `ls-tree | sed | update-index --index-info` usuli bilan faylni qayta nomlangan tree yasang. Asosiy index o'zgarmaganini isbotlang.
8. (Qiyinroq) Python'da index parser'ini yozing: imzo, versiya, har yozuvning rejimi, hajmi, mtime'i, hash'i, stage'i va nomini chiqarsin, kengaytma imzolarini (`TREE`, ...) ham ko'rsatsin. Keyin tree'ni Python'da index'dan yasang (papkalarni `/` bo'yicha guruhlab, to'g'ri tartib bilan) va hash'ni `git write-tree` bilan solishtiring.

## Rasmiy hujjat

- Pro Git — Git Objects (Tree Objects): <https://git-scm.com/book/en/v2/Git-Internals-Git-Objects>
- `gitdatamodel` — tree va index: <https://git-scm.com/docs/gitdatamodel>
- `gitformat-index` — index fayl formati: <https://git-scm.com/docs/gitformat-index>
- `git update-index`: <https://git-scm.com/docs/git-update-index>
- `git write-tree`: <https://git-scm.com/docs/git-write-tree>
- `git read-tree`: <https://git-scm.com/docs/git-read-tree>
- `git ls-files`: <https://git-scm.com/docs/git-ls-files>
- `git ls-tree`: <https://git-scm.com/docs/git-ls-tree>
- `git checkout-index`: <https://git-scm.com/docs/git-checkout-index>
