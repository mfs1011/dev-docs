# 14 — Obyektlar: blob va hash

[← Oldingi: Plumbing, porcelain va `.git` papkasi](13-plumbing-va-porcelain.md) · [Mundarija](README.md) · [Keyingi: Tree va index →](15-tree-va-index.md)

## Tushuncha

Git'ning eng ichki qatlami — juda oddiy **kalit-qiymat ombori** (key-value store). Unga istalgan baytlarni berasiz, Git ularni saqlab qo'yadi va sizga **kalit** qaytaradi. Keyin shu kalit bilan baytlarni aynan o'sha holida qaytarib olasiz.

Muhim jihati: kalitni siz tanlamaysiz va Git ham tasodifiy tanlamaydi. Kalit — **saqlanayotgan kontentning o'zidan hisoblangan hash**. Shuning uchun Pro Git Git'ni **content-addressable filesystem** deb ataydi: "manzili mazmunidan kelib chiqadigan fayl tizimi". Kutubxonaga o'xshatsak: kitobga javon raqami emas, kitob matnining "barmoq izi" yopishtiriladi. Bir xil matnli ikki kitob — bitta barmoq izi, bitta joy.

**Hash** — istalgan uzunlikdagi ma'lumotdan qat'iy uzunlikdagi "barmoq izi" hisoblaydigan funksiya natijasi. Git hozir standart bo'yicha **SHA-1** ishlatadi: natija 160 bit, ya'ni 40 ta o'n oltilik belgi (`d670460b4b4aece5915caf5c68d12f560a9fe3e4`). Kirishdagi bitta bit o'zgarsa, hash butunlay boshqacha bo'ladi.

Bu omborda saqlanadigan har narsa **obyekt** deyiladi. Rasmiy `gitdatamodel` hujjatiga ko'ra obyektning uch xususiyati bor:

1. **ID** (obyekt nomi) — obyektning turi va mazmunidan hisoblangan kriptografik hash;
2. **tur** — to'rttadan biri: `blob`, `tree`, `commit`, `tag`;
3. **mazmun** — tuzilishi turga bog'liq.

Va eng muhim qoida: **obyekt yaratilgandan keyin hech qachon o'zgarmaydi**. O'zgartirsangiz, hash ham o'zgaradi — demak bu endi boshqa obyekt.

To'rt tur qisqacha:

| Tur | Nimani saqlaydi | Bob |
| --- | --- | --- |
| `blob` | Fayl **mazmuni** (nomisiz, huquqlarisiz) | shu bob |
| `tree` | Papka: nomlar, rejimlar va ichidagi blob/tree hash'lari | [15-bob](15-tree-va-index.md) |
| `commit` | Tree + ota commit'lar + muallif + xabar | [16-bob](16-commit-obyekti.md) |
| `tag` | Annotated teg: obyekt + teg qo'yuvchi + xabar | [17-bob](17-reflar-va-head.md) |

Bu bobda eng soddasi — **blob** (binary large object). Blob faqat baytlar ketma-ketligi. Unda fayl nomi ham, sanasi ham, huquqlari ham yo'q. Nom va papka tuzilishi keyingi bobdagi tree'da saqlanadi.

## Nega shunday: nega kalit — mazmunning hash'i?

Kalitni mazmundan hisoblash bir nechta muammoni birdaniga hal qiladi:

1. **Takrorlanish o'z-o'zidan yo'qoladi.** Loyihada 50 ta bir xil `LICENSE` fayli bo'lsa ham yoki bitta fayl 100 ta commit davomida o'zgarmasa ham — obyekt bitta. Bir xil mazmun → bir xil hash → bitta fayl. `gitdatamodel` misoli: 1000 ta faylli repo'da 2 ta faylni o'zgartirgan commit faqat 2 ta yangi blob yaratadi, qolgan 998 tasi uchun eski blob ID'lari qayta ishlatiladi.
2. **Butunlik tekshiruvi tekin.** Diskdagi bitta bit buzilsa, mazmun o'z nomiga (hash'iga) mos kelmay qoladi va `git fsck` buni darhol topadi. Git'dan bilmasdan buzilgan ma'lumot olish deyarli imkonsiz.
3. **Taqsimlangan tizimda kelishuv.** Ikki dasturchi bir-biridan mustaqil ravishda bir xil faylni yaratsa, ikkalasida ham bir xil hash chiqadi. Server bilan "menda bormi, sizda bormi?" savoli faqat hash'larni solishtirish bilan hal bo'ladi — fayllarni uzatish shart emas ([29-bob](29-fetch-push-ichidan.md)).
4. **O'zgarmaslik.** Obyektni "joyida tahrirlash" degan tushuncha yo'q. Shuning uchun commit hash'i butun tarixning kafolati: tarixdagi biror narsa o'zgarsa, undan keyingi barcha hash'lar o'zgaradi.

Narxi ham bor: Git diff saqlamaydi, har versiyaning **to'liq** mazmunini saqlaydi. Disk tejash keyinroq, packfile'larda delta siqish bilan qilinadi ([18-bob](18-packfile-va-gc.md)).

## Kod: bo'sh obyektlar ombori

Yangi repo yarating va `objects` papkasiga qarang:

```bash
$ git init 14-obyektlar
Initialized empty Git repository in .../14-obyektlar/.git/
$ cd 14-obyektlar
$ find .git/objects
.git/objects
.git/objects/pack
.git/objects/info
$ find .git/objects -type f
```

Ikki bo'sh papka bor: `pack` (siqilgan to'plamlar, 18-bob) va `info` (qo'shimcha ma'lumot). Oddiy fayl esa bitta ham yo'q — ombor bo'sh.

## Kod: `git hash-object` — obyekt yaratish

`git hash-object` — plumbing buyruq: mazmunni oladi, uning hash'ini hisoblaydi va (`-w` bo'lsa) omborga yozadi.

```bash
$ echo 'test content' | git hash-object --stdin
d670460b4b4aece5915caf5c68d12f560a9fe3e4
$ find .git/objects -type f | wc -l
       0
```

`-w` yo'q — Git faqat "agar saqlasam, kalit shu bo'lardi" deb javob berdi, diskka hech narsa yozmadi. Endi `-w` (write) bilan:

```bash
$ echo 'test content' | git hash-object -w --stdin
d670460b4b4aece5915caf5c68d12f560a9fe3e4
$ find .git/objects -type f
.git/objects/d6/70460b4b4aece5915caf5c68d12f560a9fe3e4
```

Opsiyalar:

- `-w` — obyektni haqiqatan omborga yozish;
- `--stdin` — mazmunni standart kirishdan o'qish (aks holda oxirida fayl nomi kutiladi).

Fayl qayerda paydo bo'lganiga e'tibor bering: hash'ning **birinchi 2 belgisi** — papka nomi (`d6`), **qolgan 38 belgisi** — fayl nomi. Nega shunday bo'linadi? Agar millionlab obyekt bitta papkada tursa, ko'p fayl tizimlari sekinlashadi. Birinchi bayt bo'yicha 256 ta papkaga taqsimlash har papkadagi fayllar sonini taxminan 256 marta kamaytiradi.

Endi fayldan obyekt yaratamiz — bitta faylning ikki versiyasi:

```bash
$ echo 'version 1' > test.txt
$ git hash-object -w test.txt
83baae61804e65cc73a7201a7252750c76066a30
$ echo 'version 2' > test.txt
$ git hash-object -w test.txt
1f7a7a472abf3dd9643fd615f6da379c4acb3e3a
$ find .git/objects -type f | sort
.git/objects/1f/7a7a472abf3dd9643fd615f6da379c4acb3e3a
.git/objects/83/baae61804e65cc73a7201a7252750c76066a30
.git/objects/d6/70460b4b4aece5915caf5c68d12f560a9fe3e4
```

Omborda endi uch obyekt: birinchi matn va `test.txt`ning ikki versiyasi. Bu eng oddiy versiya nazorati — lekin ikkita kamchiligi bor: hash'larni eslab qolish kerak va **fayl nomi hech qayerda saqlanmagan**. Buni isbotlash oson — boshqa nomli, lekin bir xil mazmunli fayl:

```bash
$ printf 'version 1\n' > boshqa-nom.txt
$ git hash-object boshqa-nom.txt
83baae61804e65cc73a7201a7252750c76066a30
```

Hash `test.txt`ning birinchi versiyasi bilan aynan bir xil. Blob uchun nom ahamiyatsiz — faqat baytlar muhim.

Shu sababli bo'sh fayl ham doim bir xil hash'ga ega, qaysi repo'da bo'lmasin:

```bash
$ printf '' | git hash-object --stdin
e69de29bb2d1d6434b8b29ae775ad8c2e48c5391
```

`e69de29` ni tez-tez ko'rasiz — bu "bo'sh blob".

## Kod: `git cat-file` — obyektni o'qish

`git cat-file` — obyektlarni ko'rishning "shveytsar pichog'i". Asosiy rejimlar:

| Opsiya | Nima chiqaradi |
| --- | --- |
| `-t` | Obyekt turi (`blob`, `tree`, `commit`, `tag`) |
| `-s` | Mazmun hajmi baytlarda |
| `-p` | Turiga qarab chiroyli chiqarilgan mazmun (pretty-print) |
| `-e` | Hech narsa chiqarmaydi; obyekt bor va to'g'ri bo'lsa chiqish kodi 0 |
| `<tur> <obyekt>` | Xom (lekin zlib'dan ochilgan) mazmun, tur kutilgandek bo'lsa |

```bash
$ git cat-file -t 1f7a7a472abf3dd9643fd615f6da379c4acb3e3a
blob
$ git cat-file -s 1f7a7a472abf3dd9643fd615f6da379c4acb3e3a
10
$ git cat-file -p 83baae61804e65cc73a7201a7252750c76066a30
version 1
$ git cat-file blob 83baae6
version 1
```

Hajm 10 — `version 2` (9 bayt) va `echo` qo'shgan yangi qator belgisi `\n`. Oxirgi buyruqda qisqa hash `83baae6` ishlatildi: u bir ma'noli bo'lsa, Git to'liq hash'ni o'zi topadi (qisqa hash qoidalari — [19-bob](19-revision-tanlash.md)).

Obyektdan faylni tiklash — shunchaki mazmunni faylga yo'naltirish:

```bash
$ git cat-file -p 83baae61804e65cc73a7201a7252750c76066a30 > test.txt
$ cat test.txt
version 1
```

`-e` skriptlarda foydali — natija chiqish kodida:

```bash
$ git cat-file -e 83baae6; echo "exit=$?"
exit=0
$ git cat-file -e 0000000000000000000000000000000000000001; echo "exit=$?"
exit=1
$ git cat-file -e 1234567; echo "exit=$?"
fatal: Not a valid object name 1234567
exit=128
```

To'liq, lekin mavjud bo'lmagan hash — jim, kod 1. Qisqa nom hech narsaga mos kelmasa — Git uni nom sifatida tushuna olmaydi va `fatal` bilan 128 qaytaradi.

`<tur>` shakli haqida bir nozik nuqta: ma'lumotnomaga ko'ra, so'ralgan tur obyektdan "oson yechilsa", Git ruxsat beradi. Masalan commit hash'i bilan `git cat-file tree <commit>` — commit ichidagi tree'ni chiqaradi (16-bobda ko'ramiz).

## Kod: obyekt faylining ichi — baytlar darajasida

Endi eng qiziq qism: `.git/objects/d6/70460b...` faylida aynan nima yozilgan? `xxd` bilan xom baytlarni ko'ramiz:

```bash
$ xxd .git/objects/d6/70460b4b4aece5915caf5c68d12f560a9fe3e4
00000000: 7801 4bca c94f 5230 3466 2849 2d2e 5148  x.K..OR04f(I-.QH
00000010: cecf 2b49 cd2b e102 004b df07 09         ..+I.+...K...
```

O'qib bo'lmaydi — chunki fayl **zlib** bilan siqilgan. `78 01` — zlib oqimining sarlavhasi. Python'dagi `zlib.decompress` bilan ochamiz:

```bash
$ python3 -c "import zlib,sys;print(zlib.decompress(open(sys.argv[1],'rb').read()))" \
    .git/objects/d6/70460b4b4aece5915caf5c68d12f560a9fe3e4
b'blob 13\x00test content\n'
```

Mana obyektning haqiqiy shakli. Ochilgan baytlarni `xxd` bilan ham ko'ramiz:

```bash
$ python3 -c "import zlib,sys;sys.stdout.buffer.write(zlib.decompress(open(sys.argv[1],'rb').read()))" \
    .git/objects/d6/70460b4b4aece5915caf5c68d12f560a9fe3e4 | xxd
00000000: 626c 6f62 2031 3300 7465 7374 2063 6f6e  blob 13.test con
00000010: 7465 6e74 0a                             tent.
```

Tuzilish:

```text
 b  l  o  b     1  3  \0  t  e  s  t     c  o  n  t  e  n  t  \n
62 6c 6f 62 20 31 33 00 74 65 73 74 20 63 6f 6e 74 65 6e 74 0a
└──── tur ──┘ └┘ └─┘ └┘ └──────────── mazmun (13 bayt) ───────────┘
            bo'sh hajm NUL
            joy  (o'nlik)
```

Ya'ni har obyekt diskda shunday saqlanadi:

```text
zlib( "<tur>" + " " + "<mazmun hajmi o'nlik sonda>" + "\0" + <mazmun> )
```

Fayl nomi esa — **siqilmagan** shu ketma-ketlikning SHA-1 hash'i.

Ikki tafsilot:

- Sarlavhadagi hajm — **mazmunniki**, sarlavhaniki emas. `test content\n` — 13 bayt.
- `78 01` — zlib'ning "eng tez" siqish darajasi belgisi. Ma'lumotnomaga ko'ra loose obyektlar uchun `core.looseCompression` sozlamasi, u berilmasa `core.compression`, u ham bo'lmasa **1 (best speed)** ishlatiladi. Pro Git'dagi Ruby misolida `78 9C` (zlib'ning standart darajasi) ko'rinadi — ikkalasi ham to'g'ri zlib, `git` ikkalasini o'qiydi. Siqish darajasi hash'ga ta'sir qilmaydi, chunki hash siqishdan **oldin** hisoblanadi.

## Kod: hash'ni qo'lda hisoblash va `hash-object` bilan solishtirish

Sarlavha formatini bilsak, hash'ni Git'siz hisoblay olamiz. Avval shell'da `printf` va `shasum` bilan (`printf` `\0` ni NUL baytga aylantiradi):

```bash
$ printf 'blob 13\0test content\n' | shasum
d670460b4b4aece5915caf5c68d12f560a9fe3e4  -
```

`git hash-object` bergan natija bilan bir xil. Taqqoslash uchun — sarlavhasiz faqat mazmunning SHA-1'i:

```bash
$ printf 'test content\n' | shasum
4fe2b8dd12cd9cd6a413ea960cd8c09c25f19527  -
```

Butunlay boshqa. Ya'ni Git hash'i — "fayl SHA-1'i" emas, "sarlavha + mazmun" SHA-1'i. Shu sababli `sha1sum fayl` natijasi hech qachon blob hash'iga to'g'ri kelmaydi.

Pro Git bu jarayonni Ruby'da ko'rsatadi; xuddi shuni Python'da qilamiz, `"what is up, doc?"` satri bilan:

```bash
$ python3 -c "
import hashlib
content = b'what is up, doc?'
header = b'blob %d\x00' % len(content)
store = header + content
print(store)
print(hashlib.sha1(store).hexdigest())
"
b'blob 16\x00what is up, doc?'
bd9dbf5aae1a3862dd1526723246b20206e5fc37
```

Git bilan solishtiramiz. Bu yerda oxirida yangi qator bo'lmasligi muhim, shuning uchun `echo` emas, `printf` (zsh va bash'da `echo -n` har xil ishlashi mumkin):

```bash
$ printf 'what is up, doc?' | git hash-object --stdin
bd9dbf5aae1a3862dd1526723246b20206e5fc37
```

Bir xil.

## Kod: obyektni Git'siz yozish

Endi Git ishtirokisiz haqiqiy obyekt yaratamiz — `hash-object -w` ichkarida qiladigan ishning to'liq nusxasi:

```bash
$ python3 - <<'EOF'
import hashlib, zlib, os
content = b'what is up, doc?'
store = b'blob %d\x00' % len(content) + content
sha1 = hashlib.sha1(store).hexdigest()
path = '.git/objects/' + sha1[:2] + '/' + sha1[2:]
os.makedirs(os.path.dirname(path), exist_ok=True)
data = zlib.compress(store)
with open(path, 'wb') as f:
    f.write(data)
print(path, len(data))
EOF
.git/objects/bd/9dbf5aae1a3862dd1526723246b20206e5fc37 32
```

Qadamlar: sarlavha yasash → mazmunga ulash → SHA-1 → zlib → `objects/<2 belgi>/<38 belgi>` ga yozish. Git buni o'zining obyekti deb taniydimi?

```bash
$ git cat-file -p bd9dbf5aae1a3862dd1526723246b20206e5fc37
what is up, doc?
$ git cat-file -t bd9dbf5
blob
$ git cat-file -s bd9dbf5
16
```

Taniydi. Pro Git xulosasi: hamma Git obyektlari aynan shunday saqlanadi, faqat sarlavhadagi so'z boshqacha (`tree`, `commit`, `tag`). Blob mazmuni har narsa bo'lishi mumkin, tree va commit mazmuni esa qat'iy formatlangan — keyingi ikki bobda ularni ham qo'lda tahlil qilamiz.

Fayl huquqlariga qarang:

```bash
$ ls -l .git/objects/d6/ .git/objects/bd/
.git/objects/bd/:
total 8
-rw-r--r--@ 1 ali   staff  32 Oct  7 17:21 9dbf5aae1a3862dd1526723246b20206e5fc37

.git/objects/d6/:
total 8
-r--r--r--@ 1 ali   staff  29 Oct  7 17:21 70460b4b4aece5915caf5c68d12f560a9fe3e4
```

Git yozgan obyekt **faqat o'qish uchun** (`-r--r--r--`) — "obyektlar o'zgarmaydi" qoidasining fayl tizimidagi ifodasi. Biz Python'da yozgani oddiy `rw` qoldi. Hajmlarga ham qarang: 13 baytlik mazmun 29 baytga "siqildi" — kichik fayllarda zlib sarlavhasi va sarlavha qatori tufayli fayl mazmundan katta bo'lishi mumkin.

## Kod: buzilgan obyektni `fsck` qanday topadi

Hash — butunlik kafolati deganimizni sinab ko'ramiz. Repo nusxasida (asl repo'da emas!) `83baae6` obyektining ichidagi `version 1` ni `version 9` ga almashtiramiz, faylni esa eski nomida qoldiramiz:

```bash
$ cp -r 14-obyektlar 14-buzuq && cd 14-buzuq
$ f=.git/objects/83/baae61804e65cc73a7201a7252750c76066a30
$ chmod u+w $f
$ python3 -c "
import zlib,sys
p=sys.argv[1]
d=zlib.decompress(open(p,'rb').read()).replace(b'version 1',b'version 9')
open(p,'wb').write(zlib.compress(d))" $f
$ git cat-file -p 83baae6
version 9
```

E'tibor bering: `cat-file -p` buzilishni sezmadi — u tezlik uchun har o'qishda hash'ni qayta hisoblamaydi. Lekin `git fsck` (file system check) hammasini tekshiradi:

```bash
$ git fsck
error: 3df36505176f83bd58c684adb3a2dbaf4539c22f: hash-path mismatch, found at: .git/objects/83/baae61804e65cc73a7201a7252750c76066a30
notice: No default references
dangling blob d670460b4b4aece5915caf5c68d12f560a9fe3e4
dangling blob bd9dbf5aae1a3862dd1526723246b20206e5fc37
dangling blob 1f7a7a472abf3dd9643fd615f6da379c4acb3e3a
$ echo $?
1
```

`hash-path mismatch` — "mazmunning haqiqiy hash'i `3df365...`, lekin u `83/baae...` nomi ostida yotibdi". Bu Git'ning eng muhim himoyasi: mazmun o'z nomiga mos kelmasa, buzilish isbotlangan.

Qolgan qatorlar ham ma'lumotli:

- `notice: No default references` — repo'da hali birorta branch yo'q (17-bob).
- `dangling blob` — "osilib qolgan" blob: hech bir tree yoki commit unga ishora qilmaydi. Biz ularni qo'lda yaratdik, hech narsaga ulamadik. Bunday obyektlar vaqt o'tib `git gc` tomonidan o'chirilishi mumkin ([18-bob](18-packfile-va-gc.md)).

## Kod: ko'p obyekt bilan ishlash — `--batch` rejimlari

Har obyekt uchun alohida `git cat-file` jarayonini ishga tushirish sekin. Skriptlar uchun **batch** rejimi bor: obyekt nomlari standart kirishdan, bittadan qatorda o'qiladi.

`--batch-check` — faqat ma'lumot (`<hash> <tur> <hajm>`):

```bash
$ printf 'bd9dbf5\n83baae6\nyoq\nd670460b4b4aece5915caf5c68d12f560a9fe3e4\n' | git cat-file --batch-check
bd9dbf5aae1a3862dd1526723246b20206e5fc37 blob 16
83baae61804e65cc73a7201a7252750c76066a30 blob 10
yoq missing
d670460b4b4aece5915caf5c68d12f560a9fe3e4 blob 13
```

Topilmagan nom xato bilan to'xtatmaydi, `missing` deb belgilanadi — skript davom etadi.

`--batch` — ma'lumot qatori, keyin mazmun, keyin bo'sh qator:

```bash
$ printf '83baae6\n' | git cat-file --batch
83baae61804e65cc73a7201a7252750c76066a30 blob 10
version 1

```

`--batch-all-objects` — standart kirish o'rniga ombordagi **hamma** obyektlar (ulanganmi-yo'qmi, farqi yo'q):

```bash
$ git cat-file --batch-check --batch-all-objects
1f7a7a472abf3dd9643fd615f6da379c4acb3e3a blob 10
83baae61804e65cc73a7201a7252750c76066a30 blob 10
bd9dbf5aae1a3862dd1526723246b20206e5fc37 blob 16
d670460b4b4aece5915caf5c68d12f560a9fe3e4 blob 13
```

Chiqish formatini `%(atom)` lar bilan o'zingiz belgilaysiz. Asosiy atomlar: `objectname`, `objecttype`, `objectsize`, `objectsize:disk` (diskda egallagan joy), `deltabase` (18-bob), `objectmode`, `rest`:

```bash
$ git cat-file --batch-all-objects --batch-check='%(objectname) %(objectsize) %(objectsize:disk)'
1f7a7a472abf3dd9643fd615f6da379c4acb3e3a 10 26
83baae61804e65cc73a7201a7252750c76066a30 10 26
bd9dbf5aae1a3862dd1526723246b20206e5fc37 16 32
d670460b4b4aece5915caf5c68d12f560a9fe3e4 13 29
```

`objectsize:disk` — biz `ls -l` da ko'rgan siqilgan fayl hajmlari. Bu atomlar `git for-each-ref` dagilarga o'xshaydi, lekin to'plami cheklangan: masalan `%(objectname:short)` bu yerda ishlamaydi (`fatal: bad cat-file format`).

Boshqa batch opsiyalari (ma'lumotnomadan):

- `--batch-command` — `contents <obyekt>`, `info <obyekt>`, `flush` buyruqlarini qabul qiladigan interaktiv rejim;
- `--buffer` — chiqishni har obyektdan keyin emas, bufer bilan yuborish (katta ro'yxatlarda tezroq);
- `--unordered` — `--batch-all-objects` bilan hash tartibida emas, diskdagi qulay tartibda (tezroq);
- `--filter=blob:none`, `--filter=object:type=tree` — ba'zi obyektlarni chiqarmaslik;
- `-Z` — kirish va chiqish NUL bilan ajratiladi (bo'sh joyli nomlar uchun xavfsiz).

## Kod: `hash-object`ning boshqa opsiyalari

Ko'p faylni bir jarayonda hash'lash — `--stdin-paths` (fayl nomlari standart kirishdan):

```bash
$ printf 'test.txt\nboshqa-nom.txt\n' | git hash-object --stdin-paths
1f7a7a472abf3dd9643fd615f6da379c4acb3e3a
83baae61804e65cc73a7201a7252750c76066a30
```

`-t <tur>` — blob'dan boshqa tur yaratish. Git mazmunni tekshiradi va noto'g'ri formatni rad etadi:

```bash
$ echo 'salom' | git hash-object -t commit --stdin
error: object fails fsck: missingTree: invalid format - expected 'tree' line
fatal: refusing to create malformed object
```

`--literally` bu tekshiruvni o'chiradi. Ma'lumotnoma aniq aytadi: bu Git'ni stress-test qilish yoki buzilgan obyektlarni qayta yaratish uchun, kundalik ish uchun emas:

```bash
$ echo 'salom' | git hash-object -t commit --literally --stdin
b586cf8f4a166fc1c3998934fa3b1bddf7cb96c4
```

**Filtrlar.** Fayldan hash'laganda Git `.gitattributes` va `core.autocrlf` filtrlarini qo'llashi mumkin ([45-](45-config-chuqur.md), [46-bob](46-gitattributes.md)). Ya'ni omborga tushadigan blob diskdagi fayldan farq qilishi mumkin. Windows qator oxirlari (`\r\n`) bilan fayl:

```bash
$ printf 'a\r\nb\r\n' > crlf.txt
$ git hash-object crlf.txt
c30dea8a3641ea99b125d04d599d843712292759
$ git -c core.autocrlf=true hash-object crlf.txt
422c2b7ab3b3c668038da977e4e93a5fc623169c
$ git -c core.autocrlf=true hash-object --no-filters crlf.txt
c30dea8a3641ea99b125d04d599d843712292759
$ printf 'a\nb\n' | git hash-object --stdin
422c2b7ab3b3c668038da977e4e93a5fc623169c
```

`autocrlf=true` bilan Git `\r\n` ni `\n` ga aylantirib hash'ladi — natija `a\nb\n` blob'i bilan bir xil. `--no-filters` — mazmunni filtrlarsiz, "boricha" hash'lash. `--stdin` bilan esa filtr doim o'chiq, faqat `--path=<yo'l>` bersangiz, Git o'sha yo'l uchun belgilangan filtrlarni qo'llaydi.

## Muhandislik nuqtai nazari: SHA-1, SHA-256 va Git 3.0

**Muammo.** SHA-1 — kriptografik jihatdan zaiflashgan algoritm. Rasmiy `BreakingChanges` hujjati hujumlarni sanab o'tadi: SHAppening (2015), SHAttered (2017, bir xil SHA-1'li ikki xil PDF), 2019 va 2020 yillardagi chosen-prefix hujumlar. NIST SHA-1'ni 2011 yildayoq eskirgan deb e'lon qilgan.

**Hozirgi himoya.** `hash-function-transition` hujjatiga ko'ra Git v2.13.0 dan beri standart bo'yicha **hardened SHA-1** ishlatadi — u SHAttered turidagi to'qnashuvga urinishni aniqlaydi. Lekin bu yamoq, yechim emas: SHA-1 baribir zaif deb hisoblanadi.

**Yechim — SHA-256.** 2018 yil oxirida loyiha SHA-256 ni vorisi sifatida tanladi (256 bit, ko'p kutubxonalarda tez implementatsiyalar bor). Hozir uni yangi repo uchun yoqish mumkin:

```bash
$ git init -q --object-format=sha256 14-sha256
$ cd 14-sha256
$ cat .git/config
[extensions]
	objectformat = sha256
[core]
	repositoryformatversion = 1
	...
$ git rev-parse --show-object-format
sha256
```

Ikki narsa o'zgardi: `repositoryformatversion` 0 dan 1 ga ko'tarildi va `extensions.objectformat` paydo bo'ldi. Bu — eski Git versiyalariga "bu repo'ni tushunmasang, tegma" degan signal: ular bunday repo'ni ochishdan bosh tortadi.

Bir xil mazmun endi boshqa, uzunroq (64 belgili) nom oladi:

```bash
$ echo 'test content' | git hash-object -w --stdin
13b7e821533d3fe3728a3c4560606a65aab99f4390b9df0714f9075c0ef4c2d6
$ find .git/objects -type f
.git/objects/13/b7e821533d3fe3728a3c4560606a65aab99f4390b9df0714f9075c0ef4c2d6
$ printf 'blob 13\0test content\n' | shasum -a 256
13b7e821533d3fe3728a3c4560606a65aab99f4390b9df0714f9075c0ef4c2d6  -
```

Sarlavha formati o'sha-o'sha (`blob 13\0`), faqat hash funksiyasi boshqa. Papka/fayl bo'linishi ham o'sha: 2 + 62 belgi. Commit'lar ham 64 belgili:

```bash
$ git commit -q --allow-empty -m init
$ git log --oneline
b174353 init
$ git rev-parse HEAD
b1743533649d95f31d9db3b50174885759ce165b48c3ec4be349c578424bf748
```

Cheklovlar (rasmiy hujjatlardan):

- `init --object-format` uchun ma'lumotnoma ogohlantiradi: hozircha SHA-256 va SHA-1 repo'lari o'rtasida **o'zaro muvofiqlik yo'q**. SHA-1 server bilan push/fetch qilib bo'lmaydi; ko'p hosting xizmatlari SHA-256 repo'ni hali qabul qilmaydi.
- `hash-function-transition` rejasi kelajakda ikki tomonlama xarita (SHA-256 ↔ SHA-1) orqali muvofiqlikni ko'zda tutadi (`extensions.compatObjectFormat`), lekin bu hali to'liq tayyor emas.
- Mavjud SHA-1 repo'ni joyida SHA-256 ga "aylantiradigan" oddiy buyruq yo'q.

**Git 3.0.** `BreakingChanges` ga ko'ra Git 3.0 da **yangi** repo'lar uchun standart hash SHA-256 bo'ladi. Shart — ekotizim (kutubxonalar, ilovalar, hosting'lar) tayyor bo'lishi. SHA-1 formatini bekor qilish rejasi hozircha yo'q.

Amaliy xulosa: hozir jamoaviy loyihalar uchun SHA-1 (standart) bilan qoling; SHA-256 ni sinab ko'ring va skriptlaringiz 40 belgili hash'ga "qotib qolmaganini" tekshiring — uzunlikni `git rev-parse --show-object-format` dan oling.

## Muhandislik nuqtai nazari: "har versiya to'liq saqlanadi" — bu isrofmi?

Blob model'i bo'yicha 1 MB faylga bitta qator qo'shsangiz, ombor yana ~1 MB (siqilgan holda kamroq) yangi blob oladi. Bir qarashda isrof. Lekin:

- Loose obyektlar — faqat **boshlang'ich** holat. `git gc` ularni packfile'ga yig'adi va o'xshash obyektlarni delta (farq) sifatida saqlaydi ([18-bob](18-packfile-va-gc.md)). Ya'ni "snapshot model'i" — mantiqiy model; diskdagi saqlash esa baribir siqilgan.
- To'liq snapshot tufayli istalgan versiyani olish uchun hech qanday "patch zanjiri"ni qo'llash shart emas — model sodda va ishonchli.
- Takrorlanish hash darajasida yo'qoladi: o'zgarmagan fayllar uchun yangi obyekt umuman yaratilmaydi.

Hajmni ko'rish uchun:

```bash
$ git count-objects -v
count: 4
size: 16
in-pack: 0
packs: 0
size-pack: 0
prune-packable: 0
garbage: 0
size-garbage: 0
```

`count` — loose obyektlar soni, `size` — ular egallagan joy (KiB). Bu maydonlar 18-bobda batafsil.

## Muhandislik nuqtai nazari: blob'da nima YO'Q

Blob haqida yanglish tasavvurlar ko'p bo'lgani uchun ro'yxat:

| Blob'da saqlanmaydi | Qayerda saqlanadi |
| --- | --- |
| Fayl nomi | Tree yozuvida ([15-bob](15-tree-va-index.md)) |
| Papka | Tree ichidagi tree |
| Bajariladigan bit (`chmod +x`) | Tree yozuvidagi rejim (`100755`) |
| O'zgartirilgan sana | Hech qayerda (faqat commit sanasi bor) |
| Kim yozgani | Commit'da ([16-bob](16-commit-obyekti.md)) |
| Diff | Hech qayerda — kerak bo'lganda hisoblanadi |

Oxirgi qator muhim: `gitdatamodel` hujjati aytadiki, Git commit uchun diff'ni saqlamaydi — `git show` uni ota commit bilan solishtirib, o'sha zahoti hisoblaydi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `sha1sum fayl` natijasini blob hash'i bilan solishtirish | Git hash'i `blob <hajm>\0` sarlavhasi bilan hisoblanadi — hech qachon mos kelmaydi | `git hash-object fayl` yoki `printf 'blob N\0...' \| shasum` |
| `echo -n` bilan sinash va har shell'da har xil natija olish | Ba'zi `sh`/`echo` lar `-n` ni matn deb chiqaradi | `printf` ishlating |
| `hash-object` dan keyin obyekt omborda deb o'ylash | `-w` bo'lmasa hech narsa yozilmaydi | `-w` qo'shing, `cat-file -e` bilan tekshiring |
| `.git/objects` ichidagi faylni qo'lda tahrirlash | Mazmun nomga mos kelmay qoladi — repo buziladi | Obyektlar o'zgarmaydi; yangi obyekt yarating |
| `cat-file -p` xato bermadi, demak obyekt butun deb hisoblash | `cat-file` hash'ni qayta tekshirmaydi | `git fsck --full` |
| Fayl nomini o'zgartirish yangi blob yaratadi deb kutish | Blob'da nom yo'q — o'sha blob qayta ishlatiladi | Nom o'zgarishi faqat tree'da ko'rinadi (15-bob) |
| Skriptda hash uzunligini 40 deb qotirib qo'yish | SHA-256 repo'da 64 belgi | `git rev-parse --show-object-format` |
| `--literally` bilan "tezroq" obyekt yaratish | Buzilgan obyekt repo'ga kirib qoladi | Faqat test/tadqiqot uchun |

## Amaliyot

1. Yangi repo yarating va `find .git/objects -type f` bo'sh ekanini tekshiring. `echo 'salom' | git hash-object -w --stdin` dan keyin qaysi papka va fayl paydo bo'lganini toping.
2. O'sha hash'ni `printf 'blob 6\0salom\n' | shasum` bilan qo'lda hisoblang. Nega hajm 6?
3. Uch xil nomli, lekin bir xil mazmunli fayl yarating va `git hash-object --stdin-paths` bilan hammasining hash'ini oling. Nechta obyekt yaratilishini oldindan ayting, keyin `-w` bilan tekshiring.
4. Obyekt faylini Python bilan zlib'dan oching, `xxd` bilan `\0` baytning qayerda turganini ko'rsating va sarlavhadagi hajm mazmun uzunligiga tengligini tekshiring.
5. `git cat-file --batch-all-objects --batch-check='%(objectname) %(objecttype) %(objectsize) %(objectsize:disk)'` ni ishga tushiring. Qaysi obyektda diskdagi hajm mazmundan katta va nega?
6. Repo nusxasida bitta obyektni buzing (yuqoridagi misol kabi) va `git fsck` chiqishini tahlil qiling. Keyin asl obyektni `git hash-object -w` bilan qayta yarata olasizmi?
7. `git init --object-format=sha256` bilan repo yarating, `test content` uchun hash'ni `shasum -a 256` bilan qo'lda hisoblab solishtiring. `.git/config` da nima o'zgarganini tushuntiring.
8. (Qiyinroq) Python'da `hash-object -w` ning kichik nusxasini yozing: fayl nomini argument sifatida olsin, obyektni `.git/objects` ga yozsin va hash'ni chiqarsin. Natijani `git cat-file -p` va `git fsck` bilan tekshiring. Keyin uni SHA-256 repo uchun ham ishlaydigan qiling.

## Rasmiy hujjat

- Pro Git — Git Objects (Object Storage): <https://git-scm.com/book/en/v2/Git-Internals-Git-Objects>
- `git hash-object`: <https://git-scm.com/docs/git-hash-object>
- `git cat-file`: <https://git-scm.com/docs/git-cat-file>
- `gitdatamodel` — Git'ning asosiy ma'lumot modeli: <https://git-scm.com/docs/gitdatamodel>
- `git fsck`: <https://git-scm.com/docs/git-fsck>
- `git init` (`--object-format`): <https://git-scm.com/docs/git-init>
- Hash funksiyasini almashtirish rejasi: <https://git-scm.com/docs/hash-function-transition>
- Git 3.0 dagi o'zgarishlar (`BreakingChanges`): <https://git-scm.com/docs/BreakingChanges>
