# 06 — O'zgarishlarni yozish: `status`, `add`, `commit`

[← Oldingi: Uch holat va uch hudud](05-uch-holat.md) · [Mundarija](README.md) · [Keyingi: `diff`: nima o'zgardi →](07-diff.md)

## Tushuncha

[5-bobda](05-uch-holat.md) uch hududni ko'rdik: **working tree** (diskdagi fayllar), **index** yoki staging area (keyingi commit qoralamasi, `.git/index`) va **repository** (commit'lar bazasi, `.git`). Kundalik ishning 90 foizi shu uchlik orasida uchta buyruq bilan o'tadi:

| Buyruq | Savol yoki amal | Hududlar |
| --- | --- | --- |
| `git status` | "Hozir qaysi fayl qaysi holatda?" | Uchalasini solishtiradi, hech narsani o'zgartirmaydi (index'dagi stat keshdan tashqari) |
| `git add` | "Shu mazmunni keyingi commit'ga qo'sh" | working tree → index |
| `git commit` | "Index'dagi holatni tarixga yoz" | index → repository |

Sikl oddiy: fayllarni o'zgartirasiz → kerakli o'zgarishlarni stage qilasiz → commit qilasiz → yana o'zgartirasiz. Har commit — loyihaning keyinchalik qaytish yoki solishtirish mumkin bo'lgan to'liq surati (snapshot).

Bobda har fayl ikki o'q bo'yicha qaraladi:

- **tracked** (kuzatiladigan) — oxirgi snapshot'da bo'lgan yoki yangi stage qilingan, ya'ni Git biladigan fayl. U **unmodified**, **modified** yoki **staged** bo'ladi;
- **untracked** (kuzatilmaydigan) — qolgan hamma fayl: oxirgi commit'da ham, index'da ham yo'q.

Repo'ni `clone` qilganingizdan keyin hamma fayl tracked va unmodified bo'ladi — Git ularni hozirgina chiqarib berdi, siz hali hech narsani tahrirlamadingiz.

## Nega shunday: nega Git yangi fayllarni o'zi qo'shmaydi

Yangi fayl yaratsangiz, Git uni ko'radi, lekin commit'ga **o'zi qo'shmaydi** — buni aniq aytishingiz kerak (`git add`). Pro Git sababini shunday tushuntiradi: build natijasida hosil bo'lgan binar fayllar, loglar va boshqa keraksiz narsalar tasodifan tarixga tushib qolmasin. Tarixga tushgan fayl, keyin o'chirilsa ham, eski commit'larda abadiy qoladi ([42-bob](42-reflog-va-tiklash.md)) — shuning uchun "qo'shish" ataylab qilinadigan qaror.

Xuddi shu sababdan `git add`ni "faylni loyihaga qo'shish" emas, **"aynan shu mazmunni keyingi commit'ga qo'shish"** deb tushunish to'g'ri. `add` ko'p vazifali: yangi faylni kuzatishni boshlaydi, o'zgargan faylni stage qiladi, o'chirilganni o'chirilgan deb belgilaydi, konflikt hal bo'lganini bildiradi ([22-bob](22-konfliktlar.md)). Hammasining umumiy ma'nosi bitta: index'ni working tree'dagi hozirgi mazmunga moslash.

Commit xabari esa muharrirda yoziladi, chunki xabar — keyingi o'quvchi (ko'pincha o'zingiz, bir yildan keyin) uchun "nima va nega" tushuntirishi. Bir qatorlik `-m` qulay, lekin muharrir bo'sh qatorlar, tana va izohlar uchun joy beradi ([10-bob](10-yaxshi-commit.md)).

## Kod: `git status` — uzun format

Mashqlar uchun markaziy repo'dan klonlangan loyiha olamiz:

```text
$ git clone .../markaz.git kutubxona
$ cd kutubxona
$ git status
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

Uch qator uch narsani aytadi: qaysi branch'dasiz (`main`), u server'dagi nusxasidan (`origin/main`, [28-bob](28-remote-branchlar.md)) farq qiladimi, va working tree tozami (hech bir tracked fayl o'zgarmagan, untracked fayl yo'q).

Yangi fayl va papka yaratamiz:

```text
$ echo "MIT litsenziyasi" > LICENSE
$ mkdir -p src/util
$ echo "export const a = 1" > src/index.js
$ echo "export const b = 2" > src/util/sana.js
$ git status
On branch main
Your branch is up to date with 'origin/main'.

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	LICENSE
	src/

nothing added to commit but untracked files present (use "git add" to track)
```

E'tibor bering: `src/` ichidagi fayllar alohida emas, papka bitta qator bo'lib chiqdi. Bu standart `normal` rejim. `-u` (`--untracked-files`) opsiyasi uni o'zgartiradi:

```text
$ git status -uall
...
Untracked files:
  (use "git add <file>..." to include in what will be committed)
	LICENSE
	src/index.js
	src/util/sana.js
...
$ git status -uno
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit (use -u to show untracked files)
```

| Rejim | Nima ko'rsatadi |
| --- | --- |
| `-uno` | Untracked fayllarni umuman ko'rsatmaydi (eng tez) |
| `-unormal` (standart) | Untracked fayl va papkalarni, papka ichiga kirmasdan |
| `-uall` (yoki shunchaki `-u`) | Untracked papkalar ichidagi har faylni |

Qiymat opsiyaga yopishib yozilishi shart (`-uno`, `-u no` emas). Standartni `status.showUntrackedFiles` sozlamasi bilan o'zgartirish mumkin. Katta repo'larda `-uno` tezlik beradi, lekin yangi faylni `add` qilishni unutish xavfi bor — `git status` hujjatining "UNTRACKED FILES AND PERFORMANCE" bo'limi `core.untrackedCache` va `core.fsmonitor` kabi muqobillarni sanaydi.

### Status bo'limlari

Uzun formatda har fayl uchta bo'limdan biriga tushadi. `git status` hujjati ularni aniq ta'riflaydi:

| Bo'lim | Nima solishtiriladi | Ma'nosi |
| --- | --- | --- |
| `Changes to be committed` | index va `HEAD` | Hozir `git commit` qilsangiz, **kiradigan** narsa |
| `Changes not staged for commit` | working tree va index | `git add` qilsangiz kirishi **mumkin** bo'lgan narsa |
| `Untracked files` | working tree'da bor, index'da yo'q (va ignore qilinmagan) | `git add` qilsangiz kuzatila boshlaydigan narsa |

Har bo'lim ostidagi qavsdagi maslahatlar (`use "git add <file>..."`) — Git hozirgi holatga mos keladigan keyingi buyruqlarni eslatadi. Ular versiyadan versiyaga o'zgaradi (pastda Pro Git bilan farqlarni ko'ramiz), shuning uchun ularni o'qing, yodlamang.

> Uzun format odamlar uchun mo'ljallangan va hujjatga ko'ra uning "mazmuni va formati istalgan vaqtda o'zgarishi mumkin". Skriptlarda uni tahlil qilmang — buning uchun `--porcelain` bor (pastda).

## Kod: `git add` — kuzatishni boshlash va stage qilish

Papka nomini bersangiz, `add` ichidagi hamma faylni rekursiv qo'shadi. Avval `-n` (`--dry-run`) bilan nima bo'lishini ko'ramiz — u hech narsa qo'shmaydi:

```text
$ git add -n src
add 'src/index.js'
add 'src/util/sana.js'
$ git add -v src
add 'src/index.js'
add 'src/util/sana.js'
$ git status
On branch main
Your branch is up to date with 'origin/main'.

Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	new file:   src/index.js
	new file:   src/util/sana.js

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	LICENSE
```

`-v` (`--verbose`) haqiqatda qo'shadi va nima qilganini yozadi. Ikki fayl endi tracked va staged — `Changes to be committed` ostida `new file`. Hozir commit qilinsa, ular **`git add` ishlagan paytdagi** mazmuni bilan yoziladi.

### O'zgargan faylni stage qilish

Allaqachon kuzatiladigan faylni o'zgartiramiz:

```text
$ echo "Barcha PR'lar review'dan o'tadi." >> CONTRIBUTING.md
$ git status
...
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	new file:   src/index.js
	new file:   src/util/sana.js

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   CONTRIBUTING.md

Untracked files:
  ...
	LICENSE
```

`CONTRIBUTING.md` — tracked fayl, working tree'da o'zgargan, lekin hali stage qilinmagan. Uni ham `git add` bilan stage qilamiz. Keyin, commit qilishdan oldin, yana bir kichik tuzatish kiritamiz:

```text
$ git add CONTRIBUTING.md
$ echo "Kod uslubi: Prettier." >> CONTRIBUTING.md
$ git status
...
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	modified:   CONTRIBUTING.md
	new file:   src/index.js
	new file:   src/util/sana.js

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   CONTRIBUTING.md
...
```

`CONTRIBUTING.md` ikkala ro'yxatda ham. Bu [5-bobdagi](05-uch-holat.md) uch versiya holati: index'da birinchi qatorli versiya, diskda ikki qatorli. Hozir commit qilinsa, **ikkinchi qator kirmaydi**. Uni ham qo'shish uchun `add`ni qayta ishlatamiz:

```text
$ git add CONTRIBUTING.md
```

### `status` yo'llari joriy papkaga nisbatan

Ko'p Git buyruqlaridan farqli o'laroq, `git status` yo'llarni **joriy papkaga nisbatan** chiqaradi — hujjatga ko'ra bu ataylab, nusxalab joylashtirish qulay bo'lishi uchun:

```text
$ cd src
$ git status -s
 M ../CONTRIBUTING.md
A  index.js
A  util/sana.js
?? ../LICENSE
```

Buni `status.relativePaths = false` bilan o'chirish mumkin.

### Qaysi fayllar qo'shiladi: `.`, `-A`, `-u`

`git add` ga **pathspec** (yo'l namunasi) beriladi: fayl, papka yoki glob. Ammo uchta keng tarqalgan shakl turlicha ishlaydi. Alohida repo'da bitta faylni o'zgartiramiz, bittasini o'chiramiz va ikkita yangi fayl yaratamiz:

```text
$ git status -s
 M eski.txt
 D ochiriladi.txt
?? docs/yangi.txt
?? yangi.txt
```

```text
$ git add -u                    # faqat allaqachon kuzatiladiganlar
$ git status -s
M  eski.txt
D  ochiriladi.txt
?? docs/yangi.txt
?? yangi.txt
```

```text
$ git add -A                    # hammasi: yangi, o'zgargan, o'chirilgan
$ git status -s
A  docs/yangi.txt
M  eski.txt
D  ochiriladi.txt
A  yangi.txt
```

```text
$ git add --no-all .            # o'chirilganlarni e'tiborsiz qoldiradi
$ git status -s
A  docs/yangi.txt
M  eski.txt
 D ochiriladi.txt
A  yangi.txt
```

| Shakl | Yangi fayllar | O'zgarganlar | O'chirilganlar | Qamrov |
| --- | --- | --- | --- | --- |
| `git add <papka>` / `git add .` | ha | ha | ha | Faqat berilgan yo'l ostida |
| `git add -A` (`--all`) | ha | ha | ha | Butun working tree (pathspec bo'lmasa) |
| `git add -u` (`--update`) | **yo'q** | ha | ha | Butun working tree (pathspec bo'lmasa) |
| `git add --no-all <yo'l>` | ha | ha | **yo'q** | Berilgan yo'l ostida |

Qamrov farqi ichki papkada seziladi. `docs/` ichida turib:

```text
$ cd docs
$ git add .
$ git status -s
A  yangi.txt
 M ../eski.txt
 D ../ochiriladi.txt
?? ../yangi.txt
```

`.` — "joriy papka", shuning uchun faqat `docs/yangi.txt` qo'shildi. `-A` esa shu yerda ham butun repo'ni qamrab oladi:

```text
$ git add -A
$ git status -s
A  yangi.txt
M  ../eski.txt
D  ../ochiriladi.txt
A  ../yangi.txt
```

> **Eski Git'dan farq.** Hujjatda qayd etilgan: Git 2.0 gacha `git add <yo'l>` o'chirilgan fayllarni e'tiborsiz qoldirardi, `-A`/`-u` esa pathspec'siz faqat joriy papkada ishlardi. Eski maqolalardagi "`git add .` o'chirishni qo'shmaydi, `git add -A` ishlating" degan maslahat endi to'g'ri emas — `git add .` o'chirishlarni ham stage qiladi.

### Glob: qo'shtirnoq muhim

```text
$ git add '*.txt' -n
add 'eski.txt'
remove 'ochiriladi.txt'
add 'docs/yangi.txt'
add 'yangi.txt'
$ git add *.txt -n
add 'eski.txt'
add 'yangi.txt'
```

Qo'shtirnoqsiz `*.txt`ni **shell** ochadi — u faqat joriy papkadagi, diskda mavjud fayllarni beradi. Qo'shtirnoq (yoki `\*.txt`) bilan namunani **Git** o'zi tekshiradi: ichki papkalardagi (`docs/yangi.txt`) va diskda yo'q, lekin index'da bor (`ochiriladi.txt`) fayllar ham tushadi. `git add` hujjatidagi `Documentation/\*.txt` misoli aynan shu farqni ko'rsatadi.

### Ignore qilingan fayllar

```text
$ echo "*.log" > .gitignore
$ echo xato > debug.log
$ git add debug.log
The following paths are ignored by one of your .gitignore files:
debug.log
hint: Use -f if you really want to add them.
hint: Disable this message with "git config set advice.addIgnoredFile false"
$ git add .
$ git status -s
A  .gitignore
```

Ignore qilingan faylni nomi bilan bersangiz — xato. Papka yoki glob orqali tushsa — jimgina tashlab ketiladi (`git add .` faqat `.gitignore`ni qo'shdi). Majburan qo'shish — `-f` (`--force`). `.gitignore` sintaksisi — [8-bob](08-gitignore-rm-mv.md).

### Boshqa foydali opsiyalar

**`-N` (`--intent-to-add`)** — "bu faylni keyin qo'shaman" deb belgilash. Index'ga mazmunsiz yozuv tushadi:

```text
$ echo "reja" > reja.md
$ git add -N reja.md
$ git status -s
R  yangi.txt -> boshqa.txt
 A reja.md
$ git ls-files -s reja.md
100644 e69de29bb2d1d6434b8b29ae775ad8c2e48c5391 0	reja.md
```

`e69de29...` — bo'sh blob hash'i. ` A` (o'ng ustunda `A`) — fayl index'da "bo'sh joy" sifatida bor, mazmuni hali working tree'da. Bundan ikki foyda: `git diff` yangi fayl mazmunini ko'rsatadi (oddiy untracked faylni ko'rsatmaydi) va `git commit -a` uni qo'shadi.

**`--chmod=+x`** — bajariladigan bitni faqat **index'da** o'rnatadi, diskdagi fayl o'zgarmaydi:

```text
$ echo '#!/bin/sh' > ishga.sh
$ git add --chmod=+x ishga.sh
$ git ls-files -s ishga.sh
100755 1a2485251c33a70432394c93fb89330ef214bfc9 0	ishga.sh
$ ls -l ishga.sh | cut -c1-10
-rw-r--r--
```

Index'da `100755`, diskda `-rw-r--r--`. Commit'dan keyin bu farq `git status`da `modified: ishga.sh` (`old mode 100755` / `new mode 100644`) bo'lib ko'rinadi — chunki rejim ham kuzatiladi. Windows kabi bajariladigan bit yo'q tizimlarda foydali; Unix'da odatda `chmod +x` + oddiy `add` yaxshiroq.

**`-p` (`--patch`)** va **`-i`** — faylning faqat bir qismini stage qilish. Bu alohida mavzu: [37-bob](37-interaktiv-staging.md).

## Kod: qisqa status — `git status -s`

Uzun format to'liq, lekin ko'p so'zli. `-s` (`--short`) har faylni bitta qatorda beradi. Pro Git misolidagi holatni takrorlaymiz:

```text
$ git status -s
 M README
MM Rakefile
D  eski.rb
A  lib/git.rb
M  lib/simplegit.rb
?? LICENSE.txt
```

Har qator boshida **ikki belgi**: `XY`.

```text
  X  Y
  │  └── o'ng ustun: working tree index'ga nisbatan
  └───── chap ustun: index HEAD'ga nisbatan
```

| Qator | Ma'nosi |
| --- | --- |
| ` M README` | Working tree'da o'zgargan, stage qilinmagan |
| `MM Rakefile` | O'zgargan, stage qilingan, keyin yana o'zgargan — ham staged, ham unstaged qismi bor |
| `D  eski.rb` | O'chirish stage qilingan (`git rm`) |
| `A  lib/git.rb` | Yangi fayl, index'ga qo'shilgan |
| `M  lib/simplegit.rb` | O'zgargan va to'liq stage qilingan |
| `?? LICENSE.txt` | Untracked |

Belgilar (`git status` hujjati bo'yicha):

| Belgi | Ma'nosi |
| --- | --- |
| ` ` (bo'sh joy) | o'zgarmagan |
| `M` | modified — o'zgargan |
| `T` | type changed — turi o'zgargan (oddiy fayl ↔ symlink ↔ submodule) |
| `A` | added — qo'shilgan |
| `D` | deleted — o'chirilgan |
| `R` | renamed — nomi o'zgargan |
| `C` | copied — nusxalangan (`status.renames = copies` bo'lsa) |
| `U` | updated but unmerged — konfliktli |
| `??` | untracked |
| `!!` | ignored (faqat `--ignored` bilan) |

Merge konflikti paytida `X` va `Y` boshqa ma'no oladi — har bir tomonning umumiy ajdodga nisbatan o'zgarishi (`UU` — ikkalasi o'zgartirgan, `AA` — ikkalasi qo'shgan, `DU`, `UD` va hokazo). Bularni [22-bobda](22-konfliktlar.md) ko'ramiz.

Nom o'zgarishi uchun qator ikki yo'lli bo'ladi:

```text
$ mv yangi.txt boshqa.txt
$ git status -s
 D yangi.txt
?? boshqa.txt
$ git add -A
$ git status -s
R  yangi.txt -> boshqa.txt
```

Diskda nomni almashtirsangiz, Git avval "biri o'chdi, biri paydo bo'ldi" deb ko'radi. Ikkalasi index'ga tushgach, mazmun o'xshashligidan nom o'zgarganini o'zi aniqlaydi — Git nom o'zgarishini alohida saqlamaydi ([8-bob](08-gitignore-rm-mv.md)).

`-b` (`--branch`) qisqa formatga branch qatorini qo'shadi:

```text
$ git status -sb
## main...origin/main
 M CONTRIBUTING.md
A  src/index.js
A  src/util/sana.js
?? LICENSE
```

## Kod: skriptlar uchun — `--porcelain`

Skriptda qaysi fayl o'zgarganini bilish kerak bo'lsa, `-s` emas, `--porcelain` ishlating. Ko'rinishi qisqa formatga o'xshaydi, lekin hujjat uni **Git versiyalari va foydalanuvchi sozlamalaridan qat'i nazar barqaror** bo'lishini kafolatlaydi: rang yo'q, `status.relativePaths` hisobga olinmaydi, yo'llar doim repo ildiziga nisbatan:

```text
$ cd src
$ git status --porcelain
 M CONTRIBUTING.md
A  src/index.js
A  src/util/sana.js
?? LICENSE
```

`src/` ichida turib ham yo'llar ildizdan — `-s` dagi `../` lar yo'q.

Ko'proq ma'lumot kerak bo'lsa — 2-versiya:

```text
$ git status --porcelain=v2 --branch
# branch.oid 43bc981f17a3a4c294660dc53adf6d53418454dd
# branch.head main
# branch.upstream origin/main
# branch.ab +0 -0
1 .M N... 100644 100644 100644 2f6f0de4e622d50627e454e476e937044f74d838 2f6f0de4e622d50627e454e476e937044f74d838 CONTRIBUTING.md
1 A. N... 000000 100644 100644 0000000000000000000000000000000000000000 41715495f45f651e6cf7d38f58a3d512abcfa440 src/index.js
1 A. N... 000000 100644 100644 0000000000000000000000000000000000000000 2e9a7c1c293ee8abc264b364d0ec940f09d7fc87 src/util/sana.js
? LICENSE
```

`#` bilan boshlanadigan sarlavhalar: joriy commit, branch, upstream va `+ahead -behind`. `1` bilan boshlanadigan qatorlar — oddiy o'zgarishlar: `XY` (o'zgarmagan joyda bo'sh joy o'rniga `.`), submodule holati (`N...` — submodule emas), HEAD/index/working tree'dagi rejimlar va HEAD hamda index'dagi obyekt hash'lari. Yangi faylning HEAD'dagi rejimi va hash'i nollar — HEAD'da u yo'q. Nom o'zgarishi uchun `2`, konflikt uchun `u` qatorlari bor. `-z` qo'shilsa, qatorlar NUL bilan tugaydi va g'alati belgili fayl nomlari qo'shtirnoqsiz chiqadi — mashina uchun eng ishonchli shakl.

Fayl nomlari emas, o'zgargan qatorlarning o'zi kerak bo'lsa: `git status -v` stage qilingan o'zgarishlar matnini ham chiqaradi (`git diff --cached` kabi), `-vv` — stage qilinmaganlarini ham. Odatda buning uchun `git diff` va `git diff --staged` ishlatiladi ([7-bob](07-diff.md)).

## Kod: `git commit` — muharrir bilan

Index tayyor (`CONTRIBUTING.md` ikkinchi marta `add` qilingan):

```text
$ git status -s
M  CONTRIBUTING.md
A  src/index.js
A  src/util/sana.js
?? LICENSE
```

Eng oddiy shakl — argumentsiz `git commit`. U muharrirni ochadi va ichiga shablon qo'yadi. Shablon `.git/COMMIT_EDITMSG` fayliga yoziladi:

```text

# Please enter the commit message for your changes. Lines starting
# with '#' will be ignored, and an empty message aborts the commit.
#
# On branch main
# Your branch is up to date with 'origin/main'.
#
# Changes to be committed:
#	modified:   CONTRIBUTING.md
#	new file:   src/index.js
#	new file:   src/util/sana.js
#
# Untracked files:
#	LICENSE
#
```

Tepada bo'sh qator — xabar uchun joy. Pastda — `git status` chiqishi, `#` bilan izohga aylantirilgan: nima commit qilinayotganini eslatish uchun. `#` qatorlari xabarga kirmaydi.

Hech narsa yozmasdan muharrirni yopsangiz, commit bekor bo'ladi:

```text
$ git commit
Aborting commit due to empty commit message.
```

Bu xavfsiz chiqish yo'li: muharrirni ochib, fikringizni o'zgartirsangiz, xabarni o'chirib saqlang — commit yaratilmaydi, index o'zgarmaydi.

### Qaysi muharrir ochiladi

`git commit` hujjati tartibni belgilaydi: `GIT_EDITOR` muhit o'zgaruvchisi → `core.editor` sozlamasi → `VISUAL` → `EDITOR`. Hech biri bo'lmasa — `vi`. Natijani `git var GIT_EDITOR` ko'rsatadi:

```text
$ git var GIT_EDITOR
vi
$ EDITOR=nano git var GIT_EDITOR
nano
$ EDITOR=nano VISUAL=code git var GIT_EDITOR
code
$ git config core.editor "code --wait"
$ EDITOR=nano VISUAL=code git var GIT_EDITOR
code --wait
$ GIT_EDITOR=vim git var GIT_EDITOR
vim
```

`core.editor`ni sozlash — [3-bob](03-birinchi-sozlash.md). Grafik muharrirlar uchun `--wait` (yoki muharrirning shunga o'xshash opsiyasi) shart: aks holda muharrir darhol "tugadim" deb qaytadi va Git bo'sh xabar bilan commit'ni bekor qiladi.

### `-v`: diff'ni muharrirda ko'rish

`git commit -v` shablon ostiga butun diff'ni qo'shadi:

```text
#
# Untracked files:
#	LICENSE
#
# ------------------------ >8 ------------------------
# Do not modify or remove the line above.
# Everything below it will be ignored.
diff --git a/CONTRIBUTING.md b/CONTRIBUTING.md
index 2f6f0de..f69aae6 100644
--- a/CONTRIBUTING.md
+++ b/CONTRIBUTING.md
@@ -1,3 +1,5 @@
 # Hissa qo'shish
 
 PR oching.
+Barcha PR'lar review'dan o'tadi.
+Kod uslubi: Prettier.
...
```

`>8` — "qaychi" chizig'i: undan pastdagi hamma narsa (diff qatorlari `#`siz bo'lsa ham) xabarga kirmaydi. Xabarni yozayotganda nimani o'zgartirganingizni ko'rib turasiz. Doimiy yoqish — `commit.verbose = true`. `-vv` stage qilinmagan o'zgarishlarni ham qo'shadi.

Xabar yozib saqlaymiz:

```text
Kodga src/ papkasini qo'shish

index.js va util/sana.js - kutubxonaning
boshlang'ich modullari.

# Please enter the commit message for your changes. ...
```

```text
$ git commit -v
[main 33aa8ba] Kodga src/ papkasini qo'shish
 3 files changed, 4 insertions(+)
 create mode 100644 src/index.js
 create mode 100644 src/util/sana.js
```

Chiqish: qaysi branch'ga (`main`), yangi commit'ning qisqa hash'i (`33aa8ba`), xabarning birinchi qatori, nechta fayl va qator o'zgargani, yangi fayllar rejimi bilan (`create mode 100644`). O'chirilgan fayllar `delete mode`, birinchi commit esa `(root-commit)` bilan belgilanadi.

Saqlangan xabardan izohlar va diff tozalandi:

```text
$ git log -1 --format=%B
Kodga src/ papkasini qo'shish

index.js va util/sana.js - kutubxonaning
boshlang'ich modullari.
```

Birinchi qator — **sarlavha** (subject), bo'sh qatordan keyin — **tana** (body). `git commit` hujjatining DISCUSSION bo'limi tavsiyasi: sarlavha 50 belgidan oshmasin, keyin bo'sh qator, keyin batafsil tavsif — Git ko'p joyda (masalan `format-patch` email mavzusida) faqat sarlavhani ishlatadi. Batafsil — [10-bob](10-yaxshi-commit.md).

### Commit ichkarida nima qildi

```text
$ git cat-file -p HEAD
tree 2c771811360314179ef46bf2cf075d67fcfe4b8c
parent 43bc981f17a3a4c294660dc53adf6d53418454dd
author Ali Valiyev <ali@example.com> 1791349200 +0500
committer Ali Valiyev <ali@example.com> 1791349200 +0500

Kodga src/ papkasini qo'shish

index.js va util/sana.js - kutubxonaning
boshlang'ich modullari.

$ cat .git/refs/heads/main
33aa8bad7bbdb00923e62057c6ca02e75fac02b1
$ tail -1 .git/logs/HEAD
43bc981... 33aa8ba... Ali Valiyev <ali@example.com> 1791349200 +0500	commit: Kodga src/ papkasini qo'shish
```

Rasmiy ta'rif (`gitglossary`, commit fe'l sifatida): index'ning hozirgi holatini ifodalovchi yangi commit yaratish va `HEAD`ni unga siljitish. Aniqrog'i:

1. Index tekis ro'yxatidan **tree** obyektlari yoziladi (blob'lar `add` paytida allaqachon yozilgan — [5-bob](05-uch-holat.md)).
2. **Commit** obyekti yoziladi: tree, ota (`parent` — avvalgi `HEAD`), muallif, commit qiluvchi, xabar ([16-bob](16-commit-obyekti.md)).
3. Joriy branch (`refs/heads/main`) yangi commit'ga siljiydi ([20-bob](20-branch-bu-ref.md)), reflog'ga yozuv qo'shiladi ([42-bob](42-reflog-va-tiklash.md)).

Muallif va commit qiluvchi `GIT_AUTHOR_*`/`GIT_COMMITTER_*` muhit o'zgaruvchilaridan, ular bo'lmasa `user.name`/`user.email` sozlamasidan olinadi ([3-bob](03-birinchi-sozlash.md), [48-bob](48-muhit-ozgaruvchilari.md)).

Commit faqat lokal — server hali bilmaydi:

```text
$ git status
On branch main
Your branch is ahead of 'origin/main' by 1 commit.
  (use "git push" to publish your local commits)

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	LICENSE

nothing added to commit but untracked files present (use "git add" to track)
```

`LICENSE` hamon untracked — commit faqat index'dagini oldi.

## Kod: `-m`, `-F` va bo'sh commit

Xabarni buyruq qatorida berish — `-m`:

```text
$ git commit -m "Log fayllarini e'tiborsiz qoldirish" -m ".gitignore qo'shildi, ishga.sh bajariladigan."
[main 6dd156b] Log fayllarini e'tiborsiz qoldirish
 2 files changed, 2 insertions(+)
 create mode 100644 .gitignore
 create mode 100755 ishga.sh
$ git log -1 --format=%B
Log fayllarini e'tiborsiz qoldirish

.gitignore qo'shildi, ishga.sh bajariladigan.
```

Bir nechta `-m` alohida paragraflarga (orasida bo'sh qator) birlashtiriladi — sarlavha va tanani muharrirsiz yozish usuli. `-m` bilan `-c`, `-C`, `-F` birga ishlatilmaydi.

Index'da yangi narsa bo'lmasa, Git commit qilmaydi va nega ekanini `status` bilan tushuntiradi:

```text
$ git commit -m "Bo'sh"
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   ishga.sh

no changes added to commit (use "git add" and/or "git commit -a")
```

Hujjatga ko'ra yagona ota bilan bir xil tree'li commit odatda xato, shuning uchun Git uni to'xtatadi. Ataylab kerak bo'lsa (masalan, CI'ni qayta ishga tushirish), `--allow-empty`. Xabarni fayldan yoki standart kirishdan olish — `-F <fayl>` / `-F -`:

```text
$ printf "CI'ni qayta ishga tushirish\n" | git commit --allow-empty -F -
[main 574925b] CI'ni qayta ishga tushirish
```

## Kod: staging'ni chetlab o'tish — `git commit -a`

Index commit'larni aniq yig'ish uchun juda foydali, lekin ba'zan ortiqcha. `-a` (`--all`) commit'dan oldin **barcha tracked** fayllardagi o'zgarish va o'chirishlarni avtomatik stage qiladi:

```text
$ echo "export const b = 20" > src/util/sana.js
$ rm CONTRIBUTING.md
$ git status -s
 D CONTRIBUTING.md
M  README.md
 M src/util/sana.js
?? LICENSE
$ git commit -a -m "README, sana.js va CONTRIBUTING o'chirildi"
[main db617f9] README, sana.js va CONTRIBUTING o'chirildi
 3 files changed, 2 insertions(+), 7 deletions(-)
 delete mode 100644 CONTRIBUTING.md
$ git status -s
?? LICENSE
```

`-a` = `git add -u` + `git commit`: stage qilingan (`README.md`), o'zgargan (`sana.js`) va o'chirilgan (`CONTRIBUTING.md`) fayllar kirdi. **Yangi, untracked `LICENSE` kirmadi** — hujjat aniq aytadi: "Git'ga aytmagan yangi fayllaringizga ta'sir qilmaydi". Istisno — `git add -N` bilan belgilangan fayllar: ular index'da bor, shuning uchun `-a` ularni qo'shadi.

Pro Git ogohlantiradi: bu qulay, lekin ba'zan keraksiz o'zgarishlar ham kirib ketadi (vaqtinchalik `console.log`, sinov uchun o'zgartirilgan konfiguratsiya). `-a` ishlatsangiz, avval `git status` yoki `git diff`ga qarang.

## Kod: faqat tanlangan fayllarni commit qilish

`git commit <yo'l>` — index'dagi boshqa narsalarga qaramay, **faqat** berilgan fayllarning working tree'dagi hozirgi holatini commit qiladi (`--only` rejimi, yo'l berilganda standart):

```text
$ echo "export const a = 10" > src/index.js
$ echo "# Kutubxona v2" > README.md
$ git add README.md
$ git status -s
M  README.md
 M src/index.js
?? LICENSE
$ git commit -m "a qiymati 10 ga" src/index.js
[main e58556e] a qiymati 10 ga
 1 file changed, 1 insertion(+), 1 deletion(-)
$ git status -s
M  README.md
?? LICENSE
```

Commit'ga faqat `src/index.js` kirdi (u stage qilinmagan bo'lsa ham). Stage qilingan `README.md` yo'qolmadi — u index'da kutib turibdi va keyingi `git commit` uni oladi. Buni hujjat "o'zgarishlar yozilish tartibini o'zgartirish" deb ataydi. Yo'l berilgan fayllar Git'ga avvaldan ma'lum bo'lishi kerak (tracked). Merge'ni yakunlashda bu shakl ishlamaydi — merge bitta commit bo'lishi kerak.

`-i` (`--include`) teskarisini qiladi: index'dagi hamma narsa **plyus** berilgan yo'llar. Hujjat ta'kidlaydi: bu odatda faqat konfliktli merge'ni yakunlashda kerak.

Nima kirishini oldindan bilish — `--dry-run`: commit yaratmaydi, status ko'rinishidagi ro'yxat chiqaradi. (E'tibor bering: `--dry-run src/index.js` chiqishida stage qilingan `README.md` "not staged" ro'yxatida ko'rinadi — chunki `--only` rejimida commit vaqtinchalik index'dan yasaladi va unda `README.md` HEAD holatida. Haqiqiy index'da u stage qilinganicha qoladi.)

## Muhandislik nuqtai nazari: Pro Git va Git 2.56 chiqishlaridagi farqlar

Pro Git (2-nashr) misollari eski Git versiyalarida olingan. O'zingiz ko'radigan chiqish biroz boshqacha:

| Pro Git'da | Git 2.56'da | Sabab |
| --- | --- | --- |
| `On branch master` | `On branch main` (yoki sizning `init.defaultBranch`) | Bu qo'llanma muhitida `main` sozlangan ([3-bob](03-birinchi-sozlash.md)) |
| `Your branch is up-to-date with` | `Your branch is up to date with` | Matn o'zgargan |
| `(use "git reset HEAD <file>..." to unstage)` | `(use "git restore --staged <file>..." to unstage)` | Git 2.23 dagi `restore` ([11-bob](11-bekor-qilish.md)) |
| `(use "git checkout -- <file>..." to discard ...)` | `(use "git restore <file>..." to discard ...)` | Xuddi shu |
| — | Birinchi commit'gacha: `(use "git rm --cached <file>..." to unstage)` | HEAD yo'q, `restore --staged` solishtiradigan narsa yo'q |

Pro Git'ning o'zi ham bir joyda `git restore --staged`ni ko'rsatadi, boshqa joylarda eski `git reset HEAD`ni — kitob qisman yangilangan. Ikkala yo'l hozir ham ishlaydi, lekin Git o'zi tavsiya qiladigani `restore`.

## Muhandislik nuqtai nazari: commit'dan oldingi kichik odat

Commit — tarixga yozish. Uni bekor qilish mumkin ([11-bob](11-bekor-qilish.md)), lekin push qilingandan keyin qimmatga tushadi. Shuning uchun commit'dan oldin:

1. `git status` (yoki `-s`) — kutilmagan fayl yo'qmi, `MM` qolib ketmadimi, kerakli yangi fayl `??`da qolmadimi.
2. `git diff --staged` — aynan nima kirayotganini ko'rish ([7-bob](07-diff.md)). Yoki `git commit -v` — xuddi shuni muharrirda.
3. Xabar: sarlavha + kerak bo'lsa tana ([10-bob](10-yaxshi-commit.md)).

Yana ikki eslatma:

- **Hook'lar.** `git commit` `pre-commit`, `prepare-commit-msg`, `commit-msg`, `post-commit` hook'larini ishga tushirishi mumkin (linter, test, xabar formati tekshiruvi). `-n` / `--no-verify` `pre-commit` va `commit-msg`ni chetlab o'tadi — bu qoidani buzish, istisno holatlar uchun ([47-bob](47-hooklar.md)).
- **`COMMIT_EDITMSG`.** Commit xato bilan to'xtasa (masalan hook rad etsa), muharrirda yozgan xabaringiz `.git/COMMIT_EDITMSG`da qoladi — keyingi `git commit` uni ustidan yozguncha. Uzun xabarni qayta yozmaslik uchun `git commit -e -F .git/COMMIT_EDITMSG` — xabar muharrirda qayta ochiladi.
- **`--cleanup`.** Xabar qanday tozalanishini boshqaradi: `strip`, `whitespace`, `verbatim`, `scissors`, `default`. Standart (`default`) rejim muharrirda tahrirlangan xabardan `#` izohlarini olib tashlaydi, lekin `-m` yoki `-F` bilan berilgan xabarda faqat bo'sh joylarni tozalaydi (`whitespace`) — `#` qatorlari **qoladi**:

```text
$ printf 'Sarlavha\n\n# izoh qatori\n' > ../xabar.txt
$ git commit --allow-empty -q -F ../xabar.txt
$ git log -1 --format=%B
Sarlavha

# izoh qatori

$ git commit --allow-empty -q --cleanup=strip -F ../xabar.txt
$ git log -1 --format=%B
Sarlavha
```

## Muhandislik nuqtai nazari: `status` va skriptlar

- Odam uchun: `git status` yoki `git status -sb`. Ko'pchilik `alias.st = status -sb` qiladi ([12-bob](12-teglar-va-aliaslar.md)).
- Skript uchun: `git status --porcelain=v2 -z` (yoki v1). Uzun yoki `-s` formatni tahlil qilmang — ular sozlamalar va versiyaga qarab o'zgaradi.
- Fonda tez-tez chaqiriladigan `status` index'ni yangilash uchun qulf oladi ([5-bob](05-uch-holat.md)) — `git --no-optional-locks status`.
- "Working tree tozami?" degan savolga eng oddiy javob: `test -z "$(git status --porcelain)"`.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `git add` dan keyin faylni yana tahrirlab, darhol commit qilish | Commit'ga eski (`add` paytidagi) versiya kiradi | `git status`da `MM` ko'rsangiz, qayta `git add` |
| `git commit -a` yangi faylni ham qo'shadi deb o'ylash | `-a` faqat tracked fayllarni oladi; yangi fayl commit'dan tashqarida qoladi | Yangi fayl uchun avval `git add <fayl>` |
| Ko'r-ko'rona `git add .` yoki `git add -A` | Log, `.env`, build natijalari tarixga tushadi | Avval `git status`; `.gitignore` ([8-bob](08-gitignore-rm-mv.md)); tanlab `add` yoki `add -p` |
| `git add *.txt` qo'shtirnoqsiz | Shell faqat joriy papkadagi mavjud fayllarni beradi | `git add '*.txt'` |
| Eski maslahat: "o'chirishlar uchun `git add -A` kerak" | Git 2.0 dan beri `git add .` ham o'chirishni stage qiladi | `.` — joriy papka, `-A` — butun repo; farq faqat qamrovda |
| Grafik muharrirni `--wait`siz `core.editor` qilish | Muharrir darhol qaytadi, commit "empty message" bilan bekor bo'ladi | `git config --global core.editor "code --wait"` |
| Skriptda `git status` yoki `-s` chiqishini `grep` qilish | Format versiya va sozlamalarga qarab o'zgaradi | `git status --porcelain` (`-z` bilan) |
| `--no-verify`ni odat qilish | Jamoa hook'lari (lint, test) chetlab o'tiladi | Hook xatosini tuzating; `--no-verify` faqat istisno |
| Hamma ishni bitta katta commit'ga yig'ish | Review, `revert` va `bisect` qiyinlashadi | Index bilan mantiqiy bo'laklarga ajrating ([10-bob](10-yaxshi-commit.md)) |

## Amaliyot

1. Repo'ni klonlang (yoki bare repo yarating va undan klonlang) va `git status`ning uch qatori nimani anglatishini tushuntiring. Bitta commit qilib, `ahead` qatori paydo bo'lganini ko'ring.
2. Ichida ikki fayl bor yangi papka yarating. `git status`, `git status -uall` va `git status -uno` chiqishlarini solishtiring.
3. Pro Git misolidagi `git status -s` holatini (` M`, `MM`, `A `, `M `, `D `, `??`) o'z repo'ngizda qo'lda yarating. Har qatorni chap va o'ng ustun ma'nosi bilan tushuntiring.
4. Bitta fayl o'zgartirib, bittasini o'chirib, ikkita yangi fayl yarating (biri ichki papkada). `git add -u`, `git add -A`, `git add .` (ildizda va ichki papkada) natijalarini `git status -s` bilan solishtiring (har biridan keyin `git restore --staged .`).
5. `git add '*.txt' -n` va `git add *.txt -n` farqini ichki papkasi bor repo'da ko'rsating.
6. `git commit -v` bilan commit qiling, muharrirdagi shablonni o'qing, so'ng xabarni o'chirib saqlang — commit bekor bo'lganini va index o'zgarmaganini tekshiring.
7. Ikki faylni stage qiling, uchinchisini o'zgartirib, faqat uchinchisini `git commit <yo'l>` bilan commit qiling. Keyin `git status -s` — stage qilingan ikki fayl nima bo'ldi?
8. (Qiyinroq) `git status --porcelain=v2 --branch -z` chiqishini o'qiydigan kichik shell skripti yozing: u joriy branch nomini, ahead/behind sonini va staged, unstaged, untracked fayllar sonini chiqarsin. Nom o'zgarishi (`2` qatori) va bo'sh joyli fayl nomi bilan sinab ko'ring.

## Rasmiy hujjat

- Pro Git — Recording Changes to the Repository: <https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository>
- `git status`: <https://git-scm.com/docs/git-status>
- `git add`: <https://git-scm.com/docs/git-add>
- `git commit`: <https://git-scm.com/docs/git-commit>
- `git var` (muharrir tanlash): <https://git-scm.com/docs/git-var>
