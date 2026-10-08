# 39 — `reset` sirlari: uch daraxt

[← Oldingi: `stash` va `clean`](38-stash-va-clean.md) · [Mundarija](README.md) · [Keyingi: Qidiruv →](40-qidiruv.md)

## Tushuncha

`git reset` va `git checkout` — Git'ni endi o'rganayotgan odamni eng ko'p chalg'itadigan ikki buyruq. Ular juda ko'p ish qiladi va bir qarashda qoidasiz ko'rinadi. Pro Git kitobi buni bitta oddiy model bilan tushuntiradi: **Git uchta "daraxt"ni boshqaradi**, `reset` esa shu uchtasini aniq tartibda qayta yozadi.

Bu yerda "daraxt" so'zi ma'lumot tuzilmasi ma'nosida emas, **"fayllar to'plami"** ma'nosida ishlatiladi.

| Daraxt | Vazifasi | Qayerda saqlanadi |
| --- | --- | --- |
| **HEAD** | Oxirgi commit surati; keyingi commit'ning otasi | `.git/HEAD` → branch → commit → tree |
| **Index** | Keyingi commit uchun taklif qilingan surat (staging) | `.git/index` fayli |
| **Working tree** | "Qum quti" — fayllarni tahrirlaydigan joy | Loyiha papkasi |

Har birini bir jumla bilan:

- **HEAD** — joriy branch'ga ko'rsatkich, branch esa o'sha branch'dagi oxirgi commit'ga ko'rsatkich ([17-bob](17-reflar-va-head.md)). Shuning uchun HEAD — "shu branch'dagi oxirgi commit'ingizning surati" va keyingi commit'ning otasi.
- **Index** — "keyingi commit qanday bo'lishi kerak" degan taklif. `git commit` aynan shuni oladi va tree obyektiga aylantiradi ([15-bob](15-tree-va-index.md)). Texnik jihatdan index daraxt emas, tekis ro'yxat (manifest), lekin shu bobdagi model uchun bu farq muhim emas.
- **Working tree** — qolgan ikkisi `.git` ichida samarali, ammo noqulay shaklda (siqilgan obyektlar) saqlanadi. Working tree ularni oddiy fayllarga ochib beradi, siz ularni muharrirda tahrirlaysiz. Bu — o'zgarishlarni index'ga va tarixga yuborishdan oldin sinab ko'radigan qum quti.

Uchala daraxtning holatini bu bobda doim uchta buyruq bilan ko'ramiz:

```bash
git rev-parse HEAD     # HEAD qaysi commit'da
git ls-files -s        # index'da qaysi blob turibdi
cat file.txt           # working tree'da nima yozilgan
```

Shu uchtasini yodda tuting — bobning qolgan qismi ular ustida qurilgan.

## Nega shunday: nega `reset` uch xil ishlaydi

`reset` uchun alohida "uch rejim" o'ylab topilmagan. U **bitta** algoritm: uchta qadamni ketma-ket bajaradi va siz qayerda to'xtashni aytasiz.

1. HEAD ko'rsatayotgan **branch'ni** ko'rsatilgan commit'ga ko'chirish — `--soft` bo'lsa shu yerda to'xtaydi.
2. **Index'ni** yangi HEAD'ga o'xshatish — `--mixed` (standart) bo'lsa shu yerda to'xtaydi.
3. **Working tree'ni** index'ga o'xshatish — faqat `--hard` bo'lsa.

Mana shu ro'yxatni tushunsangiz, `--soft`, `--mixed`, `--hard` ni yodlash shart emas: har biri "nechanchi qadamgacha" degan savolga javob. Yo'l (fayl nomi) berilsa — 1-qadam tashlab ketiladi, chunki branch commit'ning bir qismiga ko'rsata olmaydi.

Nega aynan shu tartib? Chunki oddiy ish oqimi teskari yo'nalishda yuradi: working tree → (`git add`) → index → (`git commit`) → HEAD. `reset` shu yo'lni orqaga qaytaradi: avval commit'ni bekor qiladi, keyin `add` ni, keyin tahrirni.

## Kod: oddiy ish oqimi uch daraxtda

Bo'sh papkada bitta fayl bilan boshlaymiz. Avval faqat working tree'da nimadir bor:

```bash
$ git init -b main
$ echo v1 > file.txt
$ git status -s
?? file.txt
$ git ls-files -s
$ git rev-parse HEAD
HEAD
fatal: ambiguous argument 'HEAD': unknown revision or path not in the working tree.
...
```

Index bo'sh, HEAD esa hali tug'ilmagan (`unborn`) `main` branch'ini ko'rsatadi — `rev-parse` uni commit'ga aylantira olmaydi. Hozir faqat **working tree**'da kontent bor.

`git add` faylni working tree'dan index'ga ko'chiradi (aniqrog'i: blob obyekt yaratib, index'ga uning hash'ini yozadi):

```bash
$ git add file.txt
$ git ls-files -s
100644 626799f0f85326a8c1fc522db584e86cdfccd51f 0	file.txt
$ git status -s
A  file.txt
```

`git commit` index'ni doimiy suratga aylantiradi: tree obyekt, unga ishora qiluvchi commit obyekt yaratadi va `main` ni shu commit'ga ko'chiradi:

```bash
$ git commit -m "v1"
[main (root-commit) 4367f5c] v1
 1 file changed, 1 insertion(+)
 create mode 100644 file.txt
$ git cat-file -p HEAD
tree cc5fda52eb3ed07cce6357ac11e392cd2dbf6d16
author Ali Valiyev <ali@example.com> 1791349200 +0500
committer Ali Valiyev <ali@example.com> 1791349200 +0500

v1
$ git ls-tree -r HEAD
100644 blob 626799f0f85326a8c1fc522db584e86cdfccd51f	file.txt
```

Endi uchala daraxt bir xil (blob `626799f` hamma joyda) — `git status` hech narsa ko'rsatmaydi.

Faylni o'zgartiramiz. Working tree index'dan farq qiladi — `status` ikkinchi ustunda `M` (qizil, "Changes not staged for commit"):

```bash
$ echo v2 > file.txt
$ git status -s
 M file.txt
$ git add file.txt
$ git status -s
M  file.txt
```

`add` dan keyin `M` birinchi ustunga o'tdi: endi farq **index va HEAD** o'rtasida ("Changes to be committed"). `git status -s` dagi ikki ustun aynan shu ikki taqqoslash: chap ustun — HEAD↔index, o'ng ustun — index↔working tree ([06-bob](06-ozgarishlarni-yozish.md)).

Yana ikkita commit qilamiz — `v2` va `v3`:

```bash
$ git log --oneline
7e2d1ef v3
ff8cf5e v2
4367f5c v1
```

Har versiya blob'ining hash'ini bilib qo'yamiz — keyin index'da qaysi versiya turganini shu bilan taniymiz:

```bash
$ echo v1 | git hash-object --stdin
626799f0f85326a8c1fc522db584e86cdfccd51f
$ echo v2 | git hash-object --stdin
8c1384d825dbbe41309b7dc18ee7991a9085c46e
$ git hash-object file.txt          # hozir v3
29ef827e8a45b1039d908884aae4490157bcb2b4
```

Boshlang'ich holat:

```text
4367f5c (v1) --- ff8cf5e (v2) --- 7e2d1ef (v3)  ← main ← HEAD

HEAD:          7e2d1ef  (file.txt = v3)
index:         29ef827  (v3)
working tree:  v3
```

```bash
$ cat .git/HEAD
ref: refs/heads/main
$ cat .git/refs/heads/main
7e2d1ef8b9e81bf2e8e7b8fa3ff9020a338b6923
```

Branch almashtirish ham shu daraxtlar bilan ishlaydi: `git switch` HEAD'ni boshqa branch'ga yo'naltiradi, index'ni o'sha commit surati bilan to'ldiradi va index'ni working tree'ga ko'chiradi. `clone` ham xuddi shunday.

## Kod: 1-qadam — HEAD'ni ko'chirish (`--soft`)

`reset` birinchi navbatda **HEAD ko'rsatayotgan narsani** ko'chiradi. Bu HEAD'ning o'zini o'zgartirish emas (buni `checkout`/`switch` qiladi): `reset` HEAD ichidagi branch'ni ko'chiradi. `main` da turib `git reset HEAD~` desangiz, `.git/refs/heads/main` fayliga boshqa hash yoziladi, `.git/HEAD` esa `ref: refs/heads/main` bo'lib qoladi.

```bash
$ git reset --soft HEAD~
$ git rev-parse HEAD
ff8cf5e5a7020e3a0669f9f68174babe2316ae9f
$ git ls-files -s
100644 29ef827e8a45b1039d908884aae4490157bcb2b4 0	file.txt
$ cat file.txt
v3
```

HEAD `v2` ga qaytdi, lekin index'da hali ham `v3` blob'i (`29ef827`), working tree'da ham `v3`. Natija:

```bash
$ git status
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	modified:   file.txt

$ git log --oneline
ff8cf5e v2
4367f5c v1
```

```text
4367f5c --- ff8cf5e  ← main ← HEAD
                 \
                  7e2d1ef (v3)   ← endi hech qaysi branch'da emas

HEAD: v2     index: v3     working tree: v3
```

Diqqat bilan qarang: bu **oxirgi `git commit` ni bekor qilish**. `commit` yangi commit yaratib branch'ni unga surgan edi; `reset --soft HEAD~` branch'ni orqaga qaytardi, index va working tree'ga tegmadi. Endi index'ni o'zgartirib qayta `git commit` qilsangiz — `git commit --amend` qiladigan ishni qo'lda bajargan bo'lasiz ([11-bob](11-bekor-qilish.md)).

`v3` commit'i yo'qolmadi. `reset` har safar eski uchni `ORIG_HEAD` ga yozib qo'yadi:

```bash
$ cat .git/ORIG_HEAD
7e2d1ef8b9e81bf2e8e7b8fa3ff9020a338b6923
```

Ma'lumotnomadagi "commit'ni bekor qilib qayta qilish" retsepti shunga tayanadi:

```bash
git commit ...
git reset --soft HEAD^       # commit'ni bekor qilish, fayllar joyida
# ... tuzatishlar ...
git commit -a -c ORIG_HEAD   # eski xabarni muharrirda ochib, qayta commit
```

`-c` xabarni tahrirlashga ochadi, `-C` o'zgartirmasdan oladi.

## Kod: 2-qadam — index'ni yangilash (`--mixed`)

Avvalgi holatga qaytamiz (xuddi shu `v3` xabari va sanasi bilan qayta commit qilganimiz uchun hash ham aynan `7e2d1ef` chiqdi — commit hash'i faqat mazmundan hisoblanadi, [16-bob](16-commit-obyekti.md)). Endi opsiyasiz `reset`:

```bash
$ git reset HEAD~
Unstaged changes after reset:
M	file.txt
$ git rev-parse HEAD
ff8cf5e5a7020e3a0669f9f68174babe2316ae9f
$ git ls-files -s
100644 8c1384d825dbbe41309b7dc18ee7991a9085c46e 0	file.txt
$ cat file.txt
v3
```

Bu safar index ham `v2` blob'iga (`8c1384d`) qaytdi. Faqat working tree'da `v3` qoldi:

```bash
$ git status
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   file.txt

no changes added to commit (use "git add" and/or "git commit -a")
```

```text
HEAD: v2     index: v2     working tree: v3
```

`--mixed` — standart rejim: `git reset HEAD~` va `git reset --mixed HEAD~` bir xil. U commit'ni ham, `git add` ni ham bekor qildi — siz `add` va `commit` dan oldingi holatga qaytdingiz, faqat tahrirlar saqlanib qoldi.

Ma'lumotnoma qo'shimcha opsiya beradi: `-N` (`--intent-to-add`). Mixed reset commit'da qo'shilgan **yangi** faylni index'dan butunlay olib tashlaydi va u untracked bo'lib qoladi — keyin `git add -p` uni ko'rmaydi. `-N` bunday fayllarni "qo'shish niyatida" deb belgilaydi:

```bash
$ git reset -q HEAD~          # oxirgi commit yangi.txt'ni qo'shgan edi
$ git status -s
?? yangi.txt
```

```bash
$ git reset -q -N HEAD~
$ git status -s
 A yangi.txt
$ git ls-files -s
100644 8c1384d825dbbe41309b7dc18ee7991a9085c46e 0	file.txt
100644 67c6bf59448ee311166562ce4ac98a65331dcedd 0	readme.txt
100644 e69de29bb2d1d6434b8b29ae775ad8c2e48c5391 0	yangi.txt
```

`e69de29...` — bo'sh blob'ning hash'i: index'da yozuv bor, lekin mazmuni hali stage qilinmagan. Endi `git add -p` yangi faylni ham taklif qiladi. Bu commit'ni bir nechta commit'ga bo'lishda kerak (pastda).

### Oraliq holat: `MM`

Bir qiziq holat. Mixed reset'dan keyin (HEAD `v2`, index `v2`, working tree `v3`) faqat HEAD'ni `v3` ga qaytarsak nima bo'ladi?

```bash
$ git reset --soft ORIG_HEAD
$ git status -s
MM file.txt
```

HEAD `v3` ga qaytdi, lekin `--soft` index'ga tegmaydi — index'da `v2` qoldi. Endi uchala daraxt **har xil** nuqtada: HEAD↔index farq qiladi (chap `M`), index↔working tree ham farq qiladi (o'ng `M`). Opsiyasiz `git reset` index'ni HEAD'ga tenglaydi va hammasi toza bo'ladi. Bu misol modelni yaxshi tekshiradi: `status` ning ikki ustuni — har doim ikkita alohida taqqoslash.

## Kod: 3-qadam — working tree'ni yangilash (`--hard`)

```bash
$ git reset --hard HEAD~
HEAD is now at ff8cf5e v2
$ git rev-parse HEAD
ff8cf5e5a7020e3a0669f9f68174babe2316ae9f
$ git ls-files -s
100644 8c1384d825dbbe41309b7dc18ee7991a9085c46e 0	file.txt
$ cat file.txt
v2
$ git status -s
```

```text
HEAD: v2     index: v2     working tree: v2
```

Uchala qadam bajarildi: commit, `add` **va** working tree'dagi tahrir — hammasi bekor.

> **Ogohlantirish.** `--hard` — `reset` ni xavfli qiladigan **yagona** bayroq va Git ma'lumotni haqiqatan yo'q qiladigan kam holatlardan biri. U working tree'dagi fayllarni so'roqsiz qayta yozadi. Boshqa har qanday `reset` osongina qaytariladi, `--hard` esa doim emas.

Bu misolda `v3` commit qilingan edi, shuning uchun u obyektlar bazasida bor va reflog orqali qaytadi ([42-bob](42-reflog-va-tiklash.md)):

```bash
$ git reflog -3
ff8cf5e HEAD@{0}: reset: moving to HEAD~
7e2d1ef HEAD@{1}: reset: moving to HEAD
7e2d1ef HEAD@{2}: reset: moving to ORIG_HEAD
$ git reset --hard ORIG_HEAD
HEAD is now at 7e2d1ef v3
```

`ORIG_HEAD` o'rniga `HEAD@{1}` ham ishlaydi. Lekin **commit qilinmagan** tahrir bo'lsa, qaytarish yo'q:

```bash
$ echo "v4 saqlanmagan" > file.txt
$ git status -s
 M file.txt
$ git reset --hard
HEAD is now at 7e2d1ef v3
$ cat file.txt
v3
```

"v4 saqlanmagan" matni hech qachon `git add` qilinmagan — demak, Git'da uning blob'i ham yo'q. U butunlay yo'qoldi. (`git reset --hard` commit'siz yozilsa `git reset --hard HEAD` degani: HEAD joyida qoladi, faqat index va working tree tozalanadi.)

Agar fayl **stage qilingan** bo'lsa, hali umid bor: `git add` blob yaratgan, u `.git/objects` da hech kimga bog'lanmagan holda (dangling) yotadi:

```bash
$ echo "muhim ish" > file.txt
$ git add file.txt
$ git reset --hard -q
$ git fsck --lost-found
dangling blob c694117fd4e76c22ae04348c15861413019aa03b
dangling blob 47e5d40a50f8db1524f5308633ae3f0d1de58619
dangling blob 54f131d62385ad9455fc41938204896c708c8124
$ cat .git/lost-found/other/*
v5
muhim ish
v4
```

Fayl nomi saqlanmaydi, faqat mazmun — avvalgi sinovlardagi barcha stage qilingan versiyalar shu yerda. Bu haqda batafsil — [42-bob](42-reflog-va-tiklash.md). Xulosa: `--hard` dan oldin ishonchingiz komil bo'lmasa, avval `git stash` ([38-bob](38-stash-va-clean.md)) yoki vaqtinchalik commit qiling.

`--hard` haqida ma'lumotnomadagi yana ikki tafsilot:

- Commit'da yo'q, lekin hozir **tracked** fayllar o'chiriladi (working tree commit'ga to'liq mos bo'lishi uchun).
- **Untracked** fayllarga odatda tegilmaydi — lekin ma'lumotnoma "may overwrite untracked files" deydi: agar target commit'da xuddi shu nomli fayl bo'lsa, untracked faylingiz ustidan yoziladi.

```bash
$ echo tmp > tmp.log                 # untracked
$ git reset --hard HEAD~             # HEAD~ da yangi.txt yo'q
HEAD is now at 987bd63 v2
$ ls
file.txt
readme.txt
tmp.log
```

`yangi.txt` (tracked edi) o'chdi, `tmp.log` (untracked) qoldi. Untracked fayllarni tozalash — `git clean` ning ishi ([38-bob](38-stash-va-clean.md)).

### Xulosa: uch qadam

```text
git reset [--soft | --mixed | --hard] <commit>

 1. HEAD ko'rsatgan branch'ni <commit>ga ko'chirish    ← --soft shu yerda to'xtaydi
 2. index'ni HEAD'ga o'xshatish                         ← --mixed (standart) shu yerda
 3. working tree'ni index'ga o'xshatish                 ← faqat --hard
```

Har qanday `reset` (commit bilan) avval `ORIG_HEAD` ni eski uchga o'rnatadi.

## Kod: yo'l bilan `reset`

Fayl yoki papka berilsa, `reset` **1-qadamni tashlab ketadi** va qolganini faqat shu fayllarga qo'llaydi. Mantiqan to'g'ri: HEAD — bitta ko'rsatkich, u bir commit'ning bir qismiga va boshqasining boshqa qismiga ishora qila olmaydi. Index va working tree esa qisman yangilanishi mumkin.

`git reset file.txt` — bu `git reset --mixed HEAD file.txt` ning qisqasi:

1. Branch'ni ko'chirish — *tashlab ketiladi*.
2. Index'ni HEAD'ga o'xshatish — *shu yerda to'xtaydi*.

Ya'ni u `file.txt` ni HEAD'dan index'ga ko'chiradi. Amaldagi ma'nosi — **unstage**:

```bash
$ echo v4 > file.txt
$ git add file.txt
$ git ls-files -s
100644 c694117fd4e76c22ae04348c15861413019aa03b 0	file.txt
$ git status -s
M  file.txt

$ git reset file.txt
Unstaged changes after reset:
M	file.txt
$ git rev-parse HEAD
7e2d1ef8b9e81bf2e8e7b8fa3ff9020a338b6923
$ git ls-files -s
100644 29ef827e8a45b1039d908884aae4490157bcb2b4 0	file.txt
$ cat file.txt
v4
$ git status -s
 M file.txt
```

HEAD qimirlamadi, index `v3` blob'iga qaytdi, working tree'da `v4` turibdi. Bu `git add file.txt` ning aynan teskarisi: `add` — working tree → index, `reset <yo'l>` — HEAD → index.

Fayl nomi branch nomi bilan adashmasligi uchun `--` qo'yish yaxshi odat: `git reset -- file.txt`.

Hozirgi Git'da shu ishning aniqroq nomi bor — `git restore --staged`. Ma'lumotnoma ikkalasini teng deb yozadi:

```bash
$ echo v5 > file.txt
$ git add file.txt
$ git restore --staged file.txt
$ git status -s
 M file.txt
$ git ls-files -s
100644 29ef827e8a45b1039d908884aae4490157bcb2b4 0	file.txt
```

`git status` ham hozir `git restore --staged` ni tavsiya qiladi (yuqoridagi chiqishlarga qarang). Pro Git yozilgan paytda u `git reset HEAD <file>` ni tavsiya qilardi — eski maqolalarda shuni uchratasiz, ikkalasi bir ish qiladi.

### Yo'l bilan rejimlar

Yo'l bilan faqat index o'zgaradi. `--soft` va `--hard` ruxsat etilmaydi, `--mixed` esa eskirgan deb ogohlantiradi:

```bash
$ git reset --hard HEAD~ file.txt
fatal: Cannot do hard reset with paths.
$ git reset --soft HEAD~ file.txt
fatal: Cannot do soft reset with paths.
$ git reset --mixed HEAD~ file.txt
warning: --mixed with paths is deprecated; use 'git reset -- <paths>' instead.
Unstaged changes after reset:
M	file.txt
```

### Boshqa commit'dan faylni olish

HEAD o'rniga istalgan commit berish mumkin — `git reset <commit> -- <yo'l>`. Fayl index'ga o'sha commit'dagi versiyada yoziladi:

```bash
$ git reset 4367f5c file.txt
Unstaged changes after reset:
M	file.txt
$ git rev-parse HEAD
7e2d1ef8b9e81bf2e8e7b8fa3ff9020a338b6923
$ git ls-files -s
100644 626799f0f85326a8c1fc522db584e86cdfccd51f 0	file.txt
$ cat file.txt
v3
```

```text
HEAD: v3     index: v1     working tree: v3
```

```bash
$ git diff --cached
diff --git a/file.txt b/file.txt
index 29ef827..626799f 100644
--- a/file.txt
+++ b/file.txt
@@ -1 +1 @@
-v3
+v1
$ git diff
diff --git a/file.txt b/file.txt
index 626799f..29ef827 100644
--- a/file.txt
+++ b/file.txt
@@ -1 +1 @@
-v1
+v3
```

Bu xuddi faylni working tree'da `v1` ga qaytarib, `git add` qilib, keyin yana `v3` ga qaytargandek — faqat shu qadamlarsiz. Hozir `git commit` qilsangiz, faylni `v1` ga qaytaradigan commit yoziladi, garchi working tree'da `v1` hech qachon bo'lmagan bo'lsa ham. Index'ni ham, working tree'ni ham bir yo'la o'zgartirish uchun `git restore` ishlatiladi:

```bash
$ git restore --source=4367f5c --staged --worktree file.txt
$ git ls-files -s
100644 626799f0f85326a8c1fc522db584e86cdfccd51f 0	file.txt
$ cat file.txt
v1
$ git status -s
M  file.txt
```

### `reset -p`: hunk bo'yicha unstage

`git add -p` kabi, `reset` ham `--patch` (`-p`) qabul qiladi — o'zgarishni bo'lak-bo'lak (hunk) index'dan chiqarish uchun. Interaktiv buyruqlar (`y`, `n`, `s`, `e`, ...) [37-bobda](37-interaktiv-staging.md) batafsil. Ikki hunk'li fayl:

```bash
$ seq 1 12 > son.txt && git add . && git commit -q -m "sonlar"
$ # 2 → ikki, 11 → o'n bir; ikkalasi stage qilindi
$ printf 'n\ny\n' | git reset -p
...
(1/2) Unstage this hunk [y,n,q,a,d,k,K,j,J,g,/,e,p,P,?]? @@ -8,5 +8,5 @@
 8
 9
 10
-11
+o'n bir
 12
(2/2) Unstage this hunk [y,n,q,a,d,K,J,g,/,e,p,P,?]?
```

Birinchi hunk'ga `n` (index'da qolsin), ikkinchisiga `y` (chiqarilsin):

```bash
$ git diff --cached
...
@@ -1,5 +1,5 @@
 1
-2
+ikki
 3
...
$ git diff
...
@@ -8,5 +8,5 @@ ikki
...
-11
+o'n bir
 12
```

`reset -p` — `add -p` ning teskarisi. Ekvivalenti: `git restore -p --staged`.

## Kod: squash — bir nechta commit'ni bittaga

Endi shu bilimni amalda ishlatamiz. Tarixingizda "oops", "WIP", "faylni unutibman" kabi commit'lar bor — ularni push qilishdan oldin bitta toza commit'ga birlashtirmoqchisiz. Buning bir yo'li interaktiv rebase ([25-bob](25-tarixni-qayta-yozish.md)), lekin oddiy holatda `reset --soft` tezroq.

Pro Git'dagi misol: 1-commit `file-a.txt` (v1) qo'shadi, 2-commit uni o'zgartirib `file-b.txt` qo'shadi (WIP), 3-commit `file-a.txt` ni yana o'zgartiradi.

```bash
$ git log --oneline --stat
a15849a oops
 file-a.txt | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
7adac3a WIP
 file-a.txt | 2 +-
 file-b.txt | 1 +
 2 files changed, 2 insertions(+), 1 deletion(-)
87dc942 file-a qo'shildi
 file-a.txt | 1 +
 1 file changed, 1 insertion(+)
```

Branch'ni saqlab qolmoqchi bo'lgan oxirgi commit'ga (`HEAD~2`) qaytaramiz. `--soft` index'ga tegmaydi — demak index'da hali ham **oxirgi** holat (file-a v3 + file-b):

```bash
$ git reset --soft HEAD~2
$ git rev-parse HEAD
87dc942aa050c429cb7e3f5f8276fd9e64b43155
$ git ls-files -s
100644 29ef827e8a45b1039d908884aae4490157bcb2b4 0	file-a.txt
100644 61780798228d17af2d34fce4cfbdf35556832472 0	file-b.txt
$ git status -s
M  file-a.txt
A  file-b.txt
```

Endi bitta `git commit`:

```bash
$ git commit -m "file-a v3 va file-b qo'shildi"
[main 8735164] file-a v3 va file-b qo'shildi
 2 files changed, 2 insertions(+), 1 deletion(-)
 create mode 100644 file-b.txt
$ git log --oneline --stat
8735164 file-a v3 va file-b qo'shildi
 file-a.txt | 2 +-
 file-b.txt | 1 +
 2 files changed, 2 insertions(+), 1 deletion(-)
87dc942 file-a qo'shildi
 file-a.txt | 1 +
 1 file changed, 1 insertion(+)
```

```text
Oldin:  87dc942 --- 7adac3a (WIP) --- a15849a (oops)  ← main
Keyin:  87dc942 --- 8735164                          ← main
```

Endi reachable tarix (push qilinadigan qismi) ikkita commit: birinchisi file-a v1, ikkinchisi file-a'ni v3 ga o'zgartirib, file-b'ni qo'shadi. `v2` versiyasi tarixda yo'q. Ma'lumotnoma ham shuni tasdiqlaydi: `git reset --soft HEAD~5; git commit` oxirgi 5 commit'ni bittaga birlashtiradi — faqat oldindan stage qilingan boshqa o'zgarish bo'lmasin, aks holda u ham commit'ga tushib qoladi.

> Bu tarixni qayta yozish: eski commit'lar boshqa odamlarga allaqachon push qilingan bo'lsa, buni qilmang ([24-bob](24-rebase.md), oltin qoida).

### Teskari vazifa: bitta commit'ni bo'lish

Ma'lumotnomadagi retsept: mixed reset bilan commit'ni bekor qilib, `add -p` bilan qismlarga ajratish.

```bash
git reset -N HEAD^          # commit bekor, o'zgarishlar working tree'da, yangi fayllar ko'rinadigan
git add -p                  # birinchi mantiqiy qismni tanlash
git diff --cached           # tekshirish
git commit -c HEAD@{1}      # eski xabardan boshlab commit
# ... add -p / commit takrorlanadi ...
git add ...
git commit ...
```

`HEAD@{1}` — reset'dan oldin HEAD turgan commit (reflog yozuvi, [19-bob](19-revision-tanlash.md)).

## Kod: `checkout`/`switch` va `reset` farqi

`checkout` ham uch daraxtni o'zgartiradi, va u ham yo'l berilgan-berilmaganiga qarab boshqacha ishlaydi. Hozirgi Git'da `checkout` ning ikki vazifasi ikkita buyruqqa ajratilgan: branch almashtirish — `git switch`, fayl tiklash — `git restore`. Pro Git `checkout` ni ishlatadi; quyida ikkalasini ko'rsatamiz.

### Yo'lsiz: `switch <branch>` va `reset --hard <branch>`

`git switch develop` ham `git reset --hard develop` ga o'xshab, uchala daraxtni `develop` ko'rinishiga keltiradi. Ammo ikki muhim farq bor.

**Birinchi farq: working tree xavfsizligi.** `switch`/`checkout` o'zgartirilgan fayllarni ustidan yozib yubormaslikni tekshiradi. Aslida undan ham aqlliroq: working tree'da oddiy (trivial) merge qiladi — siz o'zgartirMAGAN fayllar yangilanadi, o'zgartirganlaringiz saqlanadi. `reset --hard` esa hech narsani tekshirmay, hammasini almashtiradi.

Repo: `main` (v1) va `develop` (v2), `readme.txt` ikkala branch'da bir xil.

```bash
$ git log --oneline --all --decorate
987bd63 (HEAD -> develop) v2
2ebb6b9 (main) v1
$ echo "qo'shimcha" >> readme.txt       # ikkala branch'da bir xil fayl
$ git switch main
Switched to branch 'main'
M	readme.txt
$ git status -s
 M readme.txt
$ cat file.txt
v1
```

`file.txt` `main` versiyasiga almashdi, `readme.txt` dagi tahrir esa ko'chib o'tdi — chunki ikki branch o'rtasida bu fayl farq qilmaydi. Endi farq qiladigan faylni tahrirlaymiz:

```bash
$ git switch -q develop
$ echo "mening ishim" > file.txt
$ git switch main
error: Your local changes to the following files would be overwritten by checkout:
	file.txt
Please commit your changes or stash them before you switch branches.
Aborting
```

`switch` rad etdi — ishingiz joyida. `reset --hard` bo'lsa:

```bash
$ git reset --hard main
HEAD is now at 2ebb6b9 v1
$ cat file.txt readme.txt
v1
umumiy
```

Ikkala tahrir ("mening ishim" va "qo'shimcha") so'roqsiz yo'qoldi.

**Ikkinchi farq: HEAD qanday yangilanadi.** `reset` HEAD ko'rsatayotgan **branch'ni** ko'chiradi, `switch` esa **HEAD'ning o'zini** boshqa branch'ga yo'naltiradi. Yuqoridagi `reset --hard main` dan keyin:

```bash
$ cat .git/HEAD
ref: refs/heads/develop
$ git rev-parse main develop
2ebb6b9329e5ff36f30332094e4b874a3a0572ec
2ebb6b9329e5ff36f30332094e4b874a3a0572ec
```

Biz hali ham `develop` dami, lekin `develop` ning o'zi `main` commit'iga ko'chirildi — `v2` commit'i bu branch'dan chiqib ketdi. `switch main` dan keyin esa (oldingi misol):

```bash
$ cat .git/HEAD
ref: refs/heads/main
$ git rev-parse main develop
2ebb6b9329e5ff36f30332094e4b874a3a0572ec
987bd6347c67e8e930958c03eafe729c7cf44c99
```

`develop` joyida qoldi, faqat HEAD `main` ga o'tdi.

```text
Boshlanish:     A (main) --- B (develop) ← HEAD

git reset main: A (main, develop) ← HEAD=develop     B — branch'siz qoldi
git switch main: A (main) ← HEAD     B (develop)     — hech qaysi branch qimirlamadi
```

Ikkala holatda ham HEAD oxir-oqibat A commit'ini ko'rsatadi, lekin **qanday** — butunlay boshqa.

### Yo'l bilan: `checkout <commit> -- <fayl>`

`checkout` ni fayl bilan chaqirish HEAD'ni qimirlatmaydi. U `git reset <commit> <fayl>` kabi index'ni o'sha commit'dagi fayl bilan yangilaydi, **va** working tree'dagi faylni ham ustidan yozadi. Ya'ni bu `git reset --hard <commit> <fayl>` bo'lardi (agar `reset` bunga ruxsat bersa edi) — working tree uchun xavfsiz emas va hech narsa so'ramaydi:

```bash
$ echo "yo'qoladi" > file.txt
$ git checkout main -- file.txt
$ cat file.txt
v1
$ git status -s
M  file.txt
```

"yo'qoladi" matni ogohlantirishsiz o'chdi. Hozirgi ekvivalent: `git restore --source=main --staged --worktree file.txt` — u ham xavfsiz emas, lekin nomi nima qilishini aniq aytadi. `checkout -p` ham bor — hunk bo'yicha qaytarish.

### Xulosa jadvali

Pro Git'dagi "shpargalka". HEAD ustunida **REF** — buyruq HEAD ko'rsatgan branch'ni ko'chiradi, **HEAD** — HEAD'ning o'zini ko'chiradi. "WD xavfsiz?" ustunida **YO'Q** bo'lsa — ishlatishdan oldin bir soniya o'ylang.

| Buyruq | HEAD | Index | Working tree | WD xavfsiz? |
| --- | --- | --- | --- | --- |
| **Commit darajasi** | | | | |
| `reset --soft <commit>` | REF | yo'q | yo'q | ha |
| `reset [--mixed] <commit>` | REF | ha | yo'q | ha |
| `reset --hard <commit>` | REF | ha | ha | **YO'Q** |
| `checkout <commit>` / `switch <branch>` | HEAD | ha | ha | ha |
| **Fayl darajasi** | | | | |
| `reset [<commit>] -- <yo'l>` / `restore --staged` | yo'q | ha | yo'q | ha |
| `checkout [<commit>] -- <yo'l>` / `restore --staged --worktree` | yo'q | ha | ha | **YO'Q** |

## Muhandislik nuqtai nazari: `--keep` va `--merge`

Ma'lumotnomada yana ikki rejim bor — ular `--hard` ning ehtiyotkor variantlari.

**`--keep`** — oxirgi commit'larni olib tashlash, lekin working tree'dagi o'zgarishlarni saqlash. HEAD va target o'rtasida farq qiladigan fayllar yangilanadi. Agar shunday faylda lokal o'zgarish bo'lsa — reset bekor qilinadi.

```bash
$ echo "qo'shimcha" >> readme.txt      # readme HEAD va HEAD~ da bir xil
$ git reset --keep HEAD~
$ git rev-parse HEAD
2ebb6b9329e5ff36f30332094e4b874a3a0572ec
$ git status -s
 M readme.txt
$ cat file.txt
v1
```

`file.txt` `v1` ga qaytdi, `readme.txt` dagi tahrir saqlandi. Endi farq qiluvchi faylda tahrir bo'lsa:

```bash
$ echo "mening ishim" > file.txt
$ git reset --keep HEAD~
error: Entry 'file.txt' not uptodate. Cannot merge.
fatal: Could not reset index file to revision 'HEAD~'.
$ git rev-parse HEAD
987bd6347c67e8e930958c03eafe729c7cf44c99
$ cat file.txt
mening ishim
```

Hech narsa o'zgarmadi. Ya'ni `--keep` — "`--hard`, lekin ishimni o'chirmaydi". Kundalik hayotda commit'larni tashlash uchun `--hard` dan ko'ra xavfsizroq tanlov.

**`--merge`** — muvaffaqiyatsiz merge'dan chiqish uchun. Index'ni qayta o'rnatadi va target bilan HEAD o'rtasida farq qiladigan fayllarni yangilaydi, lekin index va working tree o'rtasida farq qiladigan (stage qilinmagan) o'zgarishlarni saqlaydi:

```bash
$ echo "qo'shimcha" >> readme.txt      # merge'ga aloqasiz lokal tahrir
$ git merge main
Auto-merging file.txt
CONFLICT (content): Merge conflict in file.txt
Automatic merge failed; fix conflicts and then commit the result.
$ git ls-files -s
100644 626799f0f85326a8c1fc522db584e86cdfccd51f 1	file.txt
100644 8c1384d825dbbe41309b7dc18ee7991a9085c46e 2	file.txt
100644 9421fa71f8d585f4453a841d94d00962f586ea6e 3	file.txt
100644 67c6bf59448ee311166562ce4ac98a65331dcedd 0	readme.txt
$ git reset --merge
$ git status -s
 M readme.txt
$ git ls-files -s
100644 8c1384d825dbbe41309b7dc18ee7991a9085c46e 0	file.txt
100644 67c6bf59448ee311166562ce4ac98a65331dcedd 0	readme.txt
```

Index'dagi 1/2/3 bosqichli (konflikt) yozuvlar ([22-bob](22-konfliktlar.md)) tozalandi, `readme.txt` dagi tahrir qoldi. `git reset --hard` bu yerda `readme.txt` ni ham o'chirgan bo'lardi. (`git merge --abort` ham ichkarida shunga o'xshash ishlaydi.) Ma'lumotnomadagi yana bir misol: `git pull` dan keyin natija yoqmasa, `git reset --merge ORIG_HEAD` lokal tahrirlarni saqlab merge'ni bekor qiladi — `pull` va `merge` har doim eski uchni `ORIG_HEAD` ga yozadi.

## Muhandislik nuqtai nazari: rejimlarning to'liq jadvali

Ma'lumotnomaning DISCUSSION bo'limi har rejimni fayl holatlari bo'yicha aniq beradi. `A`, `B`, `C`, `D` — faylning turli holatlari; `git reset --<rejim> target` dan oldin va keyin:

```text
working index HEAD target         working index HEAD
----------------------------------------------------
 A       B     C    D     --soft   A       B     D
                          --mixed  A       D     D
                          --hard   D       D     D
                          --merge (ruxsat yo'q)
                          --keep  (ruxsat yo'q)

 A       B     C    C     --soft   A       B     C
                          --mixed  A       C     C
                          --hard   C       C     C
                          --merge (ruxsat yo'q)
                          --keep   A       C     C

 B       B     C    D     --soft   B       B     D
                          --mixed  B       D     D
                          --hard   D       D     D
                          --merge  D       D     D
                          --keep  (ruxsat yo'q)

 B       C     C    C     --soft   B       C     C
                          --mixed  B       C     C
                          --hard   C       C     C
                          --merge  B       C     C
                          --keep   B       C     C
```

Jadvalni o'qish: 1-qator — working tree, index, HEAD va target to'rttasi har xil bo'lsa, `--soft` faqat HEAD'ni D ga o'tkazadi, `--hard` hammasini D qiladi. `--merge` "index va target farq qiladi, index va working tree ham farq qiladi" holatini rad etadi — bunday holat muvaffaqiyatsiz merge'dan qolmaydi (merge boshlanishidan oldin working tree'dagi aralashgan fayllar index bilan teng bo'lishi kafolatlangan). `--keep` esa working tree↔HEAD **va** HEAD↔target farqi bir faylda uchrashsa rad etadi — chunki tashlanayotgan commit'dagi o'zgarish bilan saqlanayotgan tahrir to'qnashishi mumkin. Unmerged (`U`) index bilan `--soft` va `--keep` ruxsat etilmaydi, `--mixed`/`--hard`/`--merge` index'ni target'ga tenglaydi.

## Muhandislik nuqtai nazari: `reset`, `restore`, `revert` — qaysi biri?

Git ma'lumotnomasi (`git help git`, "Reset, restore and revert") uchta o'xshash nomli buyruqni shunday ajratadi:

| Buyruq | Nima qiladi | Tarixni o'zgartiradimi |
| --- | --- | --- |
| `git revert` | Boshqa commit'larni bekor qiladigan **yangi** commit yaratadi | Yo'q, faqat qo'shadi |
| `git restore` | Working tree (yoki index) dagi fayllarni index'dan yoki commit'dan tiklaydi | Yo'q, branch'ga tegmaydi |
| `git reset` | Branch uchini ko'chiradi — commit qo'shish yoki olib tashlash | Ha |

Qaror qilish uchun:

- Commit allaqachon **push qilingan** → `git revert` (tarix saqlanadi, boshqalar buzilmaydi).
- Faqat fayl/index'ni tuzatish kerak → `git restore` (`--staged`, `--worktree`, `--source`).
- Lokal, push qilinmagan commit'larni qayta tashkil qilish → `git reset` (`--soft` squash uchun, `--keep` tashlash uchun, `--hard` faqat ishonchingiz komil bo'lsa).
- Ishni vaqtincha chetga olish → `git stash` ([38-bob](38-stash-va-clean.md)), `reset --hard` emas.

`reset` ichkarida nima o'zgartiradi — ro'yxat: `.git/refs/heads/<branch>` (1-qadam), `.git/ORIG_HEAD`, `.git/logs/HEAD` va branch reflog'i (yangi yozuv), `.git/index` (2-qadam), working tree fayllari (3-qadam). Yangi obyekt yaratilmaydi va hech qanday obyekt o'chirilmaydi — "tashlangan" commit'lar reflog muddati tugab, `gc` ularni tozalaguncha bazada qoladi ([18-bob](18-packfile-va-gc.md), [42-bob](42-reflog-va-tiklash.md)).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Commit qilinmagan ish bor paytda `git reset --hard` | Stage qilinmagan tahrir qaytarib bo'lmas yo'qoladi | Avval `git stash` yoki WIP commit; commit'ni tashlash uchun `reset --keep` |
| Push qilingan commit'larni `reset` bilan olib tashlab `push --force` | Boshqalarning tarixi buziladi | `git revert` |
| `reset --soft` ni "fayllarni ham qaytaradi" deb o'ylash | Faqat branch ko'chadi, index'da eski o'zgarishlar qoladi va keyingi commit'ga tushadi | Kerakli rejimni uch qadam bo'yicha tanlang; `git status` ni tekshiring |
| Squash'dan oldin index'da boshqa narsa stage qilingan bo'lishi | U ham birlashgan commit'ga tushadi | `reset --soft` dan oldin `git status` toza bo'lsin |
| `git reset --hard <commit> <fayl>` ni urinish | `fatal: Cannot do hard reset with paths.` | `git restore --source=<commit> --staged --worktree <fayl>` |
| `git checkout <commit> -- <fayl>` ni xavfsiz deb o'ylash | Working tree'dagi tahrir so'roqsiz yo'qoladi | Avval `git diff <fayl>` bilan tekshiring yoki stash qiling |
| `reset` va `switch` ni adashtirish | `reset` joriy branch'ni ko'chiradi — boshqa branch'ga "o'tmaydi" | Branch almashtirish — `git switch` |
| Xato `reset` dan keyin vahima | Commit'lar odatda yo'qolmagan | `git reset --hard ORIG_HEAD` yoki `git reflog` → `HEAD@{n}` |
| Fayl nomini `--` siz berish | Branch nomi bilan bir xil bo'lsa, noaniqlik | `git reset -- <fayl>` |

## Amaliyot

1. Uch commit'li (`v1`, `v2`, `v3`) repo yarating. `reset --soft HEAD~`, `reset HEAD~`, `reset --hard HEAD~` ning har biridan keyin `git rev-parse HEAD`, `git ls-files -s`, `cat file.txt` natijalarini yozib boring va har birini `ORIG_HEAD` bilan qaytaring.
2. Faylni stage qilib, `git reset file.txt` va `git restore --staged file.txt` natijasi bir xil ekanini `git ls-files -s` bilan tasdiqlang. Keyin `git reset <birinchi-commit> -- file.txt` dan so'ng `git diff --cached` va `git diff` nima ko'rsatishini oldindan ayting, keyin tekshiring.
3. `MM` holatini yarating: mixed reset qiling, keyin `git reset --soft ORIG_HEAD`. Nega `status -s` da ikki `M` chiqishini uch daraxt orqali tushuntiring.
4. "oops", "WIP", "tuzatish" xabarli uchta commit qiling va ularni `reset --soft` bilan bitta commit'ga birlashtiring. Avval index'ga boshqa fayl stage qilib qo'yib, nima bo'lishini ham ko'ring.
5. Ikki branch'li repo'da `git reset --hard <boshqa-branch>` va `git switch <boshqa-branch>` dan keyin `.git/HEAD` va ikkala branch hash'ini solishtiring.
6. Bitta faylni tahrirlab, `git reset --keep HEAD~` ni ikki holatda sinang: tahrir qilingan fayl oxirgi commit'da o'zgargan va o'zgarmagan bo'lsa.
7. Bitta faylda ikki joyni o'zgartirib stage qiling, `printf 'y\nn\n' | git reset -p` bilan faqat bittasini chiqaring.
8. (Qiyinroq) Ikki mustaqil o'zgarishni (bittasi yangi fayl) bitta commit'ga yozing, keyin `git reset -N HEAD^`, `git add -p` va `git commit -c HEAD@{1}` bilan ikki commit'ga bo'ling. `-N` siz qilsangiz yangi fayl nega `add -p` da ko'rinmasligini tushuntiring.

## Rasmiy hujjat

- Pro Git — Reset Demystified: <https://git-scm.com/book/en/v2/Git-Tools-Reset-Demystified>
- `git reset`: <https://git-scm.com/docs/git-reset>
- `git restore`: <https://git-scm.com/docs/git-restore>
- `git` — Reset, restore and revert: <https://git-scm.com/docs/git#_reset_restore_and_revert>
- `git switch`: <https://git-scm.com/docs/git-switch>
