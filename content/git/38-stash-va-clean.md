# 38 — `stash` va `clean`

[← Oldingi: Interaktiv staging](37-interaktiv-staging.md) · [Mundarija](README.md) · [Keyingi: `reset` sirlari: uch daraxt →](39-reset-sirlari.md)

## Tushuncha

Tasavvur qiling: siz bir funksiya ustida ishlayapsiz, fayllar yarim tayyor, testlar o'tmaydi. Shu payt shoshilinch xato haqida xabar keladi — boshqa branch'ga o'tib, uni tuzatish kerak. Yarim tayyor ishni commit qilgingiz kelmaydi (tarixda "WIP, ishlamaydi" degan commit qoladi), lekin uni yo'qotib ham bo'lmaydi.

Buning uchun **`git stash`** bor. **Stash** (inglizcha "yashirib qo'yish") — tugallanmagan o'zgarishlarni vaqtincha olib qo'yadigan joy. U ikki narsani saqlaydi:

- **working tree**'dagi o'zgargan tracked fayllar (diskdagi fayllaringiz, [5-bob](05-uch-holat.md));
- **index**'dagi (staging) o'zgarishlar — `git add` qilib qo'yganlaringiz.

Saqlagandan keyin working tree va index `HEAD` holatiga qaytariladi — papka "toza" bo'ladi. Saqlangan ish **stack**'ga (ustma-ust taxlangan ro'yxatga, oxirgi qo'yilgan birinchi olinadi) qo'shiladi va uni istalgan paytda, hatto boshqa branch'da ham qaytarib qo'llash mumkin.

```text
  ish jarayonida             git stash               git stash pop
 ┌──────────────┐        ┌──────────────┐        ┌──────────────┐
 │ working tree │──┐     │ working tree │        │ working tree │
 │  (o'zgargan) │  │     │   (toza)     │   ┌───▶│  (o'zgargan) │
 ├──────────────┤  │     ├──────────────┤   │    ├──────────────┤
 │ index        │──┤     │ index (toza) │   │    │ index        │
 └──────────────┘  │     └──────────────┘   │    └──────────────┘
                   ▼                        │
              ┌─────────────────────────────┴┐
              │ stash ro'yxati: stash@{0} ... │
              └──────────────────────────────┘
```

Ikkinchi buyruq — **`git clean`**. U teskari ishni qiladi: saqlamaydi, balki **untracked** fayllarni (Git kuzatmayotgan, hech qachon `add` qilinmagan fayllar) **o'chirib tashlaydi**. Build natijalari, vaqtinchalik fayllar, merge'dan qolgan chiqindilarni tozalash uchun ishlatiladi. U xavfli: o'chirilgan untracked faylni Git qaytara olmaydi, chunki u hech qachon Git'ning obyektlar bazasiga tushmagan.

## Nega shunday: stash nega commit bo'lib saqlanadi

Git'da yangi saqlash mexanizmi o'ylab topilmagan. Stash — oddiy **commit obyektlari** ([16-bob](16-commit-obyekti.md)) va bitta **ref** ([17-bob](17-reflar-va-head.md)):

- eng oxirgi stash `.git/refs/stash` faylida turadi;
- eskiroq stash'lar — shu ref'ning **reflog**'ida (`.git/logs/refs/stash`, [42-bob](42-reflog-va-tiklash.md)).

Shuning uchun `stash@{0}`, `stash@{1}` yozuvi — bu reflog sintaksisi ([19-bob](19-revision-tanlash.md)): "`refs/stash` ref'ining 0-, 1-holati". Rasmiy hujjatga ko'ra `stash@{2.hours.ago}` ham ishlaydi, va qisqa yozuv — oddiy son: `git stash show 1` = `git stash show stash@{1}`.

Commit sifatida saqlashning foydasi: stash'ni `git log`, `git show`, `git diff` bilan ko'rish, uni boshqa commit ustiga **merge** qilib qo'llash, kerak bo'lsa `fsck` bilan qaytarib topish mumkin. Yangi formatga yangi asboblar kerak emas.

Stash commit'i qanday tuzilgan — quyida "Kod: stash ichidan" bo'limida haqiqiy obyektlar bilan ko'ramiz.

## Kod: birinchi stash

Sinov repo'si: bitta commit, keyin ikki faylda o'zgarish — biri stage qilingan, biri yo'q.

```bash
$ git init -b main .
$ printf '<h1>Salom</h1>\n' > index.html
$ mkdir lib; printf 'def salom\n  "salom"\nend\n' > lib/app.rb
$ git add . && git commit -m "Bosh sahifa va kutubxona"
$ git log --oneline
bb15882 Bosh sahifa va kutubxona

$ echo '<p>Yangi paragraf</p>' >> index.html
$ git add index.html
$ echo 'def xayr; end' >> lib/app.rb
```

```text
$ git status
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	modified:   index.html

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   lib/app.rb
```

Endi stash qilamiz. `git stash` argumentsiz — `git stash push` bilan bir xil:

```text
$ git stash
Saved working directory and index state WIP on main: bb15882 Bosh sahifa va kutubxona

$ git status
On branch main
nothing to commit, working tree clean

$ git stash list
stash@{0}: WIP on main: bb15882 Bosh sahifa va kutubxona
```

"WIP" — *work in progress*, "jarayondagi ish". Xabar avtomatik: qaysi branch'da va qaysi commit ustida saqlangani.

> Pro Git'dagi chiqishda yana `HEAD is now at 049d078 ...` va `(To restore them type "git stash apply")` qatorlari bor. Git 2.56.0 bu qatorlarni chiqarmaydi — yuqoridagi haqiqiy chiqish shunday. Pro Git `git status` maslahatlarida `git reset HEAD <file>` va `git checkout -- <file>` ko'rsatadi; hozirgi Git `git restore --staged` va `git restore` tavsiya qiladi ([11-bob](11-bekor-qilish.md)).

### Stash'ni ko'rish: `show`

```text
$ git stash show
 index.html | 1 +
 lib/app.rb | 1 +
 2 files changed, 2 insertions(+)

$ git stash show -p
diff --git a/index.html b/index.html
index c81ede0..8ef90bf 100644
--- a/index.html
+++ b/index.html
@@ -1 +1,2 @@
 <h1>Salom</h1>
+<p>Yangi paragraf</p>
diff --git a/lib/app.rb b/lib/app.rb
index a696388..3663b32 100644
--- a/lib/app.rb
+++ b/lib/app.rb
@@ -1,3 +1,4 @@
 def salom
   "salom"
 end
+def xayr; end
```

`show` stash'dagi holatni stash yaratilgan paytdagi commit bilan solishtiradi. Standart — diffstat (`--stat`); `-p` — to'liq patch. `git diff`ning har qanday formati ishlaydi. Standartni config bilan o'zgartirish mumkin: `stash.showPatch=true` (doim patch), `stash.showStat` (standart `true`), `stash.showIncludeUntracked`.

## Kod: qaytarib qo'llash — `apply`, `--index`, `drop`, `pop`

```text
$ git stash apply
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   index.html
	modified:   lib/app.rb

no changes added to commit (use "git add" and/or "git commit -a")
```

Diqqat qiling: ikkala fayl qaytdi, lekin `index.html` endi **stage qilinmagan**. Sababi: standart `apply` faqat working tree o'zgarishlarini qo'llaydi, index'ni tiklamaydi. Index holatini ham qaytarish uchun `--index`:

```text
$ git restore --staged . && git restore .      # tajribani takrorlash uchun tozalaymiz
$ git stash apply --index
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	modified:   index.html

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   lib/app.rb

$ git status -s
M  index.html
 M lib/app.rb
```

Endi aynan stash qilingan paytdagi holat. Har safar `--index` yozmaslik uchun Git 2.52 dan boshlab `stash.index=true` sozlamasi bor — `apply` va `pop` o'zini `--index` berilgandek tutadi (bu `rebase`/`merge`/`pull`ning `--autostash`iga ham ta'sir qiladi).

`apply` stash'ni ro'yxatda **qoldiradi**. O'chirish — `drop`:

```text
$ git stash list
stash@{0}: WIP on main: bb15882 Bosh sahifa va kutubxona
$ git stash drop
Dropped refs/stash@{0} (b3987d3e31f11f56a7385345493485c6159cd56f)
$ git stash list
$
```

Qavs ichidagi hash muhim: bu o'chirilgan stash commit'i. Adashib o'chirsangiz, darhol `git stash store b3987d3...` bilan qaytarish mumkin (pastda "Kod: o'chirilgan stash'ni tiklash").

**`pop`** = `apply` + `drop`. Qo'llash muvaffaqiyatli bo'lsa, stash ro'yxatdan o'chadi; konflikt bo'lsa — **o'chmaydi**.

### Bir nechta stash va xabar bilan saqlash

"WIP on main" ko'p stash'lar orasida hech narsa demaydi. `-m` bilan ma'noli xabar bering:

```text
$ echo 'a' >> index.html
$ git stash push -m "sarlavha rangini sinash"
Saved working directory and index state On main: sarlavha rangini sinash
$ echo 'b' >> lib/app.rb
$ git stash push -m "xayr funksiyasi"
Saved working directory and index state On main: xayr funksiyasi
$ echo 'c' >> index.html
$ git stash save "eski usul"
Saved working directory and index state On main: eski usul

$ git stash list
stash@{0}: On main: eski usul
stash@{1}: On main: xayr funksiyasi
stash@{2}: On main: sarlavha rangini sinash
```

Eng yangisi doim `stash@{0}`; yangi stash qo'shilganda eskilarining raqami bittaga suriladi. Shuning uchun raqamni eslab qolish emas, `list` bilan tekshirish kerak.

`git stash save "xabar"` — eski shakl. Rasmiy hujjatda u **eskirgan (deprecated)** deb belgilangan: `push`dan farqi — pathspec (fayl yo'li) qabul qilmaydi, barcha argumentlar xabarga qo'shib yuboriladi. Yangi skriptlarda `push -m` ishlating.

Aniq stash bilan ishlash:

```text
$ git stash show 1
 lib/app.rb | 1 +
 1 file changed, 1 insertion(+)
$ git stash show stash@{2}
 index.html | 1 +
 1 file changed, 1 insertion(+)
$ git stash drop stash@{0}
Dropped stash@{0} (b7d98c5666b209f115a3b209fcbd75d6a273b657)
$ git stash pop
On branch main
Changes not staged for commit:
  ...
	modified:   lib/app.rb

no changes added to commit (use "git add" and/or "git commit -a")
Dropped refs/stash@{0} (5cbb6056ba497b77bbb6afabb342eabd6a52b846)
```

`list` `git log` opsiyalarini qabul qiladi:

```text
$ git stash list --date=iso
stash@{2026-10-07 10:00:00 +0500}: On main: sarlavha rangini sinash
$ git stash list --stat
stash@{0}: On main: sarlavha rangini sinash

 index.html | 1 +
 1 file changed, 1 insertion(+)
```

Hamma stash'larni birdaniga o'chirish — `git stash clear`. Ehtiyot bo'ling: undan keyin stash'lar hech qanday ref'dan ko'rinmaydi va `gc` ularni o'chirib yuborishi mumkin.

## Kod: stash ichidan — uch commit

Birinchi stash'ni (u hali o'chirilmagan paytda) ichidan ko'rib chiqamiz:

```text
$ cat .git/refs/stash
b3987d3e31f11f56a7385345493485c6159cd56f

$ git cat-file -p stash
tree 6b3f223d2b94800f447e47fac21ce4810035f033
parent bb15882d66830efb68e9eced5fa5c95ce518299d
parent 7c970c0f305d69681aeed7c558947268574e7d10
author Ali Valiyev <ali@example.com> 1791349200 +0500
committer Ali Valiyev <ali@example.com> 1791349200 +0500

WIP on main: bb15882 Bosh sahifa va kutubxona

$ git log --graph --oneline stash
*   b3987d3 WIP on main: bb15882 Bosh sahifa va kutubxona
|\
| * 7c970c0 index on main: bb15882 Bosh sahifa va kutubxona
|/
* bb15882 Bosh sahifa va kutubxona
```

Stash — **ikki ota-onali (merge) commit**. Rasmiy hujjat (DISCUSSION bo'limi) shunday chizadi:

```text
            .----W
           /    /
     -----H----I

H — stash paytidagi HEAD commit'i (bb15882)
I — index holatini yozgan commit, otasi H (7c970c0, "index on main")
W — working tree holatini yozgan commit; 1-ota H, 2-ota I (b3987d3, "WIP on main")
```

Har qismni alohida tekshirish mumkin:

```text
$ git show stash^2:index.html          # index'dagi holat
<h1>Salom</h1>
<p>Yangi paragraf</p>
$ git show stash:lib/app.rb            # working tree'dagi holat
def salom
  "salom"
end
def xayr; end

$ cat .git/logs/refs/stash
0000000000000000000000000000000000000000 b3987d3e31f11f56a7385345493485c6159cd56f Ali Valiyev <ali@example.com> 1791349200 +0500	WIP on main: bb15882 Bosh sahifa va kutubxona
```

Endi `--index` nega ishlashi tushunarli: Git `I` commit'idan index'ni, `W`dan working tree'ni tiklaydi. `--index`siz faqat `W` va `H` orasidagi farq qo'llanadi.

`-u` bilan untracked fayllar ham saqlansa, **uchinchi ota** paydo bo'ladi (pastda ko'ramiz).

## Kod: ijodiy stash — `--keep-index`, `--staged`, `-u`, `-a`

Yangi holat: `.gitignore`da `*.log`, bitta stage qilingan, bitta stage qilinmagan, bitta untracked va bitta ignore qilingan fayl.

```text
$ printf '*.log\n' > .gitignore; git add .gitignore; git commit -m "gitignore"
$ echo '<footer>2026</footer>' >> index.html; git add index.html
$ echo 'def yangi; end' >> lib/app.rb
$ echo 'eslatma' > todo.txt
$ echo 'xato' > debug.log

$ git status -s
M  index.html
 M lib/app.rb
?? todo.txt
```

### `--keep-index` (`-k`): stage qilinganni joyida qoldirish

```text
$ git stash push --keep-index
Saved working directory and index state WIP on main: d44a221 gitignore
$ git status -s
M  index.html
?? todo.txt
```

Muhim nozik joy: `index.html` **stash'ga ham tushdi**, lekin index'da (va working tree'da) qoldi. `--keep-index` "faqat stage qilinmaganni saqla" degani emas — "hammasini saqla, lekin index'ga tegma":

```text
$ git stash show -p
diff --git a/index.html b/index.html
...
+<footer>2026</footer>
diff --git a/lib/app.rb b/lib/app.rb
...
+def yangi; end
```

Bu nega kerak? Rasmiy hujjatdagi "Testing partial commits" misoli: bir nechta o'zgarishdan faqat birinchisini commit qilmoqchisiz va commit'dan **oldin** aynan shu qismni sinab ko'rmoqchisiz:

```bash
git add --patch foo            # birinchi qismni stage qilish (37-bob)
git stash push --keep-index    # qolganini olib qo'yish
# endi diskda faqat stage qilingan holat — build va testni ishga tushiring
git commit -m 'Birinchi qism'
git stash pop                  # qolganiga qaytish
```

### `--staged` (`-S`): faqat stage qilinganni saqlash

Teskari vazifa: faqat index'dagi o'zgarishlarni olib qo'yish, qolganini joyida qoldirish.

```text
$ git status -s
M  index.html
 M lib/app.rb
?? todo.txt
$ git stash push --staged -m 'faqat footer'
Saved working directory and index state On main: faqat footer
$ git status -s
 M lib/app.rb
?? todo.txt
```

Rasmiy hujjat buni "commit'ga o'xshash, faqat commit branch'ga emas, stash'ga tushadi" deb ta'riflaydi. Tipik holat: katta ish o'rtasida bog'liq bo'lmagan kichik tuzatishni ko'rib qoldingiz — tuzatasiz, `add -p` bilan stage qilasiz, `stash push --staged` qilasiz, keyin uni alohida branch'da `pop` qilasiz.

### `-u` (`--include-untracked`): untracked fayllar ham

Standart `git stash` faqat **tracked** fayllarni oladi — `todo.txt` yuqorida joyida qoldi. `-u` untracked fayllarni ham saqlaydi va keyin ularni `git clean` bilan o'chiradi:

```text
$ git stash push -u -m 'kod va todo'
Saved working directory and index state On main: kod va todo
$ git status -s --ignored
!! debug.log
```

`debug.log` qoldi — u **ignore qilingan**, `-u` ignore qilinganlarga tegmaydi. Untracked qism stash'ning uchinchi otasida:

```text
$ git log --graph --oneline stash@{0}
*-.   d1e09ca On main: kod va todo
|\ \
| | * d823d68 untracked files on main: d44a221 gitignore
| * f799160 index on main: d44a221 gitignore
|/
* d44a221 gitignore
* bb15882 Bosh sahifa va kutubxona

$ git cat-file -p stash@{0}^3
tree dc195edd4f3f5a2ed8b06ba0094079d097e63cc8
author Ali Valiyev <ali@example.com> 1791349200 +0500
committer Ali Valiyev <ali@example.com> 1791349200 +0500

untracked files on main: d44a221 gitignore
```

Uchinchi commit'ning **otasi yo'q** — u faqat untracked fayllar daraxtini saqlovchi alohida ildiz commit.

`show` standart holatda untracked qismni ko'rsatmaydi:

```text
$ git stash show stash@{0}
 lib/app.rb | 1 +
 1 file changed, 1 insertion(+)
$ git stash show -u stash@{0}
 lib/app.rb | 1 +
 todo.txt   | 1 +
 2 files changed, 2 insertions(+)
$ git stash show --only-untracked stash@{0}
 todo.txt | 1 +
 1 file changed, 1 insertion(+)
```

### `-a` (`--all`): ignore qilinganlar ham

```text
$ git stash push -a -m 'hammasi'
Saved working directory and index state On main: hammasi
$ git status -s --ignored
$ ls
index.html
lib
```

Endi `debug.log` ham stash'da. `-a` — `git clean -x`ning xavfsiz muqobili: hammasi o'chadi, lekin saqlanadi. Qaytarish:

```text
$ git stash pop
Already up to date.
On branch main
nothing to commit, working tree clean
Dropped refs/stash@{0} (a87f5139b4aff989c886534d3f4394995e767dbf)
$ git status -s --ignored
!! debug.log
```

### Faqat ba'zi fayllarni: pathspec

`push` fayl yo'llarini qabul qiladi — faqat mos kelgan fayllar saqlanadi va `HEAD` holatiga qaytariladi, qolganlari joyida qoladi:

```text
$ git stash push -- lib/app.rb
Saved working directory and index state WIP on main: d44a221 gitignore
```

`push` so'zini tushirib qoldirsangiz, yo'l faqat `--` dan keyin yozilishi mumkin. Bu ataylab qilingan: xato yozilgan buyruq (masalan `git stash pussh`) kutilmagan stash yaratmasin:

```text
$ git stash lib/app.rb
fatal: subcommand wasn't specified; 'push' can't be assumed due to unexpected token 'lib/app.rb'
$ git stash pussh
fatal: subcommand wasn't specified; 'push' can't be assumed due to unexpected token 'pussh'
```

Yo'llar ro'yxati katta bo'lsa — `--pathspec-from-file=<fayl>` (`-` bo'lsa stdin'dan), `--pathspec-file-nul` bilan NUL ajratgich.

### `-p` (`--patch`): hunk'larni tanlab saqlash

`git add -p` ([37-bob](37-interaktiv-staging.md)) dagi interaktiv rejim — faqat savol "Stash this hunk?". Bir faylda ikki o'zgarish:

```text
$ printf '1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n' > raqam.txt; git add raqam.txt; git commit -m "raqamlar"
$ sed -i '' 's/^1$/BIR/; s/^10$/O.N/' raqam.txt      # macOS sed; Linux'da: sed -i
$ git stash push -p
diff --git a/raqam.txt b/raqam.txt
index f00c965..e50ee4e 100644
--- a/raqam.txt
+++ b/raqam.txt
@@ -1,4 +1,4 @@
-1
+BIR
 2
 3
 4
(1/2) Stash this hunk [y,n,q,a,d,k,K,j,J,g,/,e,p,P,?]? y
@@ -7,4 +7,4 @@
 7
 8
 9
-10
+O.N
(2/2) Stash this hunk [y,n,q,a,d,K,J,g,/,e,p,P,?]? n

Saved working directory and index state WIP on main: 5cda43f raqamlar
```

(`y`/`n` javoblari ko'rinishi uchun qo'shildi; sinovda ular stdin'dan berilgan.) Natija:

```text
$ git diff
...
@@ -7,4 +7,4 @@
 7
 8
 9
-10
+O.N
$ git stash show -p
...
@@ -1,4 +1,4 @@
-1
+BIR
 2
 3
 4
```

Birinchi hunk stash'da, ikkinchisi diskda qoldi. Rasmiy hujjatga ko'ra `--patch` avtomatik `--keep-index`ni yoqadi (index'ga tegmaydi); o'chirish uchun `--no-keep-index`. `--patch` va `--staged` birga berilsa, `--patch` ustun.

## Kod: konflikt va xatolar bilan qo'llash

Stash'ni boshqa branch'da yoki toza bo'lmagan working tree'da qo'llash mumkin — Git uni **merge** qiladi. Muammo bo'lsa, uch xil holat bor.

**1. Mazmun konflikti.** Stash yaratilgandan keyin branch'da shu qator o'zgardi:

```text
$ sed -i '' 's/^1$/one/' raqam.txt; git commit -am "inglizcha bir"
$ git stash pop
Auto-merging raqam.txt
CONFLICT (content): Merge conflict in raqam.txt
On branch main
Unmerged paths:
  (use "git restore --staged <file>..." to unstage)
  (use "git add <file>..." to mark resolution)
	both modified:   raqam.txt
...
The stash entry is kept in case you need it again.

$ head -5 raqam.txt
<<<<<<< Updated upstream
one
=======
BIR
>>>>>>> Stashed changes
```

`pop` stash'ni **o'chirmadi** ("The stash entry is kept"). Konfliktni odatdagidek hal qiling ([22-bob](22-konfliktlar.md)), keyin stash'ni o'zingiz `git stash drop` qiling. Konflikt belgilaridagi yorliqlarni `apply` uchun o'zgartirish mumkin: `--label-ours`, `--label-theirs`, `--label-base` (oxirgisi `merge.conflictStyle=diff3`da ko'rinadi):

```text
$ git stash apply --label-ours=main --label-theirs=stash
$ echo $?
1
$ head -5 raqam.txt
<<<<<<< main
one
=======
BIR
>>>>>>> stash
```

Chiqish kodi: rasmiy hujjat bo'yicha `apply`, `pop`, `branch` konfliktda **1**, boshqa sabab bilan muvaffaqiyatsizlikda 1 dan boshqa nol bo'lmagan kod qaytaradi. Skriptlarda shunga tayanish mumkin.

Konfliktli `apply`dan chiqish uchun `git reset --merge` (yoki konfliktni hal qilish).

**2. Working tree'dagi o'zgarish ustidan yozib bo'lmaydi.** Stash o'zgartiradigan faylda saqlanmagan o'zgarish bor:

```text
$ git stash pop
error: Your local changes to the following files would be overwritten by merge:
	raqam.txt
Please commit your changes or stash them before you merge.
Aborting
...
The stash entry is kept in case you need it again.
$ echo $?
128
```

Git hech narsaga tegmadi. Avval o'zgarishni commit yoki stash qiling. Rasmiy hujjat `pop` uchun "working directory index bilan mos bo'lishi kerak" deydi.

**3. Untracked fayl band.** `-u` bilan saqlangan fayl nomida yangi fayl paydo bo'lgan:

```text
$ git stash push -u -m todo
Saved working directory and index state On main: todo
$ echo 'boshqa' > todo.txt
$ git stash pop
Already up to date.
todo.txt already exists, no checkout
error: could not restore untracked files from stash
...
The stash entry is kept in case you need it again.
```

Git mavjud faylni ustidan yozmaydi. Faylni boshqa joyga ko'chiring yoki o'chiring, keyin qayta `pop`.

## Kod: stash'dan branch — `git stash branch`

Stash uzoq turib qoldi, branch esa oldinga ketdi — `apply` konflikt beradi. Eng oson yo'l: stash yaratilgan commit'dan yangi branch ochib, stash'ni o'sha yerda qo'llash. Asos bir xil bo'lgani uchun konflikt bo'lmaydi:

```text
$ git stash list
stash@{0}: WIP on main: 5cda43f raqamlar
stash@{1}: On main: faqat footer
$ git stash branch bir-tajriba
Switched to a new branch 'bir-tajriba'
On branch bir-tajriba
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   raqam.txt
...
Dropped refs/stash@{0} (92b3e6ba1abdeb3ac9f782ecefa5d9dab7a00711)
```

`git stash branch <nom> [<stash>]` uch ishni qiladi: (1) stash'ning `H` commit'idan (`5cda43f`) yangi branch yaratib unga o'tadi; (2) stash'ni working tree va index'ga qo'llaydi (index holati ham tiklanadi); (3) muvaffaqiyatli bo'lsa va stash `stash@{n}` shaklida berilgan bo'lsa — uni o'chiradi.

## Kod: o'chirilgan stash'ni tiklash — `fsck`, `store`, `create`

`drop` yoki `clear` stash commit'larini o'chirmaydi — faqat ref va reflog yozuvini olib tashlaydi. Commit'lar "hech qayerdan yetib bo'lmaydigan" (unreachable) bo'lib qoladi va `gc` ularni tozalaguncha bazada turadi ([42-bob](42-reflog-va-tiklash.md)).

```text
$ git stash list
stash@{0}: On main: faqat footer
$ git stash clear
$ git stash list
$
```

Rasmiy hujjatdagi tiklash usuli — yetib bo'lmaydigan commit'lardan merge commit'larni ajratish:

```text
$ git fsck --unreachable | grep commit | cut -d' ' -f3 | xargs git log --merges --no-walk --oneline
92b3e6b WIP on main: 5cda43f raqamlar
a00170f WIP on main: d44a221 gitignore
a87f513 On main: hammasi
b3987d3 WIP on main: bb15882 Bosh sahifa va kutubxona
b7d98c5 On main: eski usul
b859ea5 WIP on main: d44a221 gitignore
d1e09ca On main: kod va todo
5cbb605 On main: xayr funksiyasi
eb64daf On main: faqat footer
ed4a62b On main: sarlavha rangini sinash
```

Shu bobda yaratilgan barcha stash'lar (pop qilinganlari ham) shu yerda. Eslatma: rasmiy hujjatdagi buyruq oxirida `--grep=WIP` bor — u faqat "WIP on ..." xabarli stash'larni topadi. `-m` bilan saqlangan stash'lar "On main: ..." bilan boshlanadi va `--grep=WIP` ularni o'tkazib yuboradi; shuning uchun yuqorida `--grep`siz ishlatildi.

Topilgan commit'ni stash ro'yxatiga qaytarish — `store`:

```text
$ git stash store -m 'faqat footer (tiklandi)' eb64daf
$ git stash list
stash@{0}: faqat footer (tiklandi)
```

`store` va `create` — skriptlar uchun mo'ljallangan past darajali buyruqlar:

- `git stash create [xabar]` — stash commit'ini yaratadi va hash'ini chiqaradi, lekin uni hech qanday ref'ga yozmaydi va working tree'ni **tozalamaydi**;
- `git stash store [-m xabar] <commit>` — tayyor stash commit'ini `refs/stash`ga yozadi va reflog'ga qo'shadi.

```text
$ echo 'qoralama' >> raqam.txt
$ git stash create 'skript uchun'
1437d7835ae72c007c1704b77f5cb7fd5eb8ca1e
$ git status -s
 M raqam.txt
?? todo.txt
$ git stash store -m 'skript uchun' 1437d7835ae72c007c1704b77f5cb7fd5eb8ca1e
$ git stash list
stash@{0}: skript uchun
stash@{1}: faqat footer (tiklandi)
```

`create` dan keyin `status` o'zgarmagan — fayl hali ham o'zgargan. `store -m` bilan berilgan xabar reflog'ga aynan yoziladi ("On main:" prefiksisiz).

## Kod: stash'ni boshqa kompyuterga ko'chirish — `export` va `import` (Git 2.51+)

Stash `refs/stash` reflog'ida yashaydi, reflog esa `push`/`fetch` bilan uzatilmaydi — stash'lar lokal edi. Git 2.51 da stash'lar uchun almashinuv formati va ikki yangi buyruq qo'shildi: `export` stash'larni oddiy commit zanjiriga aylantiradi, uni har qanday ref kabi push/fetch qilish mumkin; `import` uni qaytarib stash ro'yxatiga qo'shadi.

```text
$ git stash export --print
982f1d0b81b2fc5d1166083108d4e6285c5c0499
$ git stash export --to-ref refs/stashes/ali
$ git push origin refs/stashes/ali
To .../38-stash-markaz.git
 * [new reference]   refs/stashes/ali -> refs/stashes/ali
```

- `--print` — zanjirni yaratadi va faqat hash'ni chiqaradi (skriptlar uchun);
- `--to-ref <ref>` — zanjirni ko'rsatilgan ref'ga yozadi;
- stash'lar ko'rsatilmasa, hammasi eksport qilinadi; `git stash export --to-ref <ref> stash@{1}` kabi tanlash ham mumkin.

Zanjir qanday ko'rinadi:

```text
$ git cat-file -p refs/stashes/ali
tree 4b825dc642cb6eb9a060e54bf8d69288fbee4904
parent 4f7250dccadf5ea7b3804c87853a7557b91505a6
parent 1437d7835ae72c007c1704b77f5cb7fd5eb8ca1e
author Ali Valiyev <ali@example.com> 1791349200 +0500
committer Ali Valiyev <ali@example.com> 1791349200 +0500

git stash: On main: skript uchun

$ git cat-file -p 73c9bab
tree 4b825dc642cb6eb9a060e54bf8d69288fbee4904
author git stash <git@stash> 1000684800 +0000
committer git stash <git@stash> 1000684800 +0000
```

Har stash uchun bitta "o'rovchi" commit: daraxti bo'sh (`4b825dc...` — bo'sh tree hash'i), 1-ota — oldingi o'rovchi, 2-ota — asl stash commit'i. Zanjir boshida muallifi `git stash <git@stash>` bo'lgan bo'sh ildiz commit turadi.

Boshqa klonda:

```text
$ git clone .../38-stash-markaz.git 38-stash-noutbuk && cd 38-stash-noutbuk
$ git fetch origin refs/stashes/ali:refs/stashes/ali
From .../38-stash-markaz
 * [new ref]         refs/stashes/ali -> refs/stashes/ali
$ git stash import refs/stashes/ali
$ git stash list
stash@{0}: On main: skript uchun
stash@{1}: On main: faqat footer
$ git stash show -p stash@{1}
...
+<footer>2026</footer>
```

Ikki narsaga e'tibor bering. Birinchisi: `import` mavjud stash'larni almashtirmaydi, ustiga qo'shadi; almashtirish kerak bo'lsa avval `git stash clear`. Ikkinchisi (sinovda kuzatilgan): import qilingan xabarlar commit xabaridan olinadi — `store -m` bilan reflog'ga yozilgan "faqat footer (tiklandi)" emas, commit'ning o'z xabari "On main: faqat footer" keldi. `refs/stashes/...` nomi — shunchaki kelishuv; ref'ni istalgan nom bilan atash mumkin (refspec haqida [29-bob](29-fetch-push-ichidan.md)).

## Kod: `--autostash` — stash'ni Git o'zi qilsin

Ba'zi buyruqlar iflos working tree'da ishlashdan bosh tortadi. `rebase`, `merge` va `pull`da `--autostash` bor: Git oldin vaqtinchalik stash yaratadi, amalni bajaradi, keyin stash'ni qaytaradi.

```text
$ git rebase main
error: cannot rebase: You have unstaged changes.
error: Please commit or stash them.
$ git rebase --autostash main
Created autostash: 97c7421
Applied autostash.
Successfully rebased and updated refs/heads/mavzu.
```

Doimiy yoqish: `rebase.autoStash`, `merge.autoStash` va Git 2.51 dan `pull.autostash` (u o'rnatilgan bo'lsa `merge.autostash`/`rebase.autostash`ni bekor qiladi). Rasmiy ogohlantirish: amaldan keyingi qo'llash murakkab konflikt berishi mumkin. Konflikt bo'lsa, stash yo'qolmaydi — ro'yxatda qoladi.

## Kod: `git clean` — untracked fayllarni tozalash

> **Ogohlantirish.** `git clean` untracked fayllarni diskdan o'chiradi. Ular Git bazasida hech qachon bo'lmagan, shuning uchun `reflog` ham, `fsck` ham ularni qaytara olmaydi. Doim avval `-n` bilan tekshiring yoki xavfsiz muqobil — `git stash push --all` — ishlating.

Tayyorgarlik: turli xil untracked narsalar va ichma-ich repo:

```text
$ mkdir -p tmp build/out vendor/kutubxona
$ echo 1 > tmp/kesh.txt; echo 2 > build.TMP; echo 3 > build/out/app.o
$ echo 4 > xato.log; echo 5 > lib/qoralama.rb
$ (cd vendor/kutubxona && git init -q && echo k > k.txt)

$ git status -s --ignored
?? build.TMP
?? build/
?? lib/qoralama.rb
?? tmp/
?? todo.txt
?? vendor/
!! debug.log
!! xato.log
```

### `-f` majburiy

```text
$ git clean
fatal: clean.requireForce is true and -f not given: refusing to clean
```

`clean.requireForce` standart `true` — `-f` (`--force`) siz hech narsa o'chirilmaydi. Bu sozlamani `false` qilish tavsiya etilmaydi: tasodifiy `git clean` qimmatga tushadi.

### `-n`: sinov rejimi

```text
$ git clean -n
Would remove build.TMP
Would remove lib/qoralama.rb
Would remove todo.txt
```

`-n` (`--dry-run`) — "nima o'chirilardi" ro'yxati, hech narsa o'chmaydi. Papkalar ro'yxatda yo'q: yo'l ko'rsatilmasa, `clean` untracked **papkalar ichiga kirmaydi**.

### `-d`: papkalar ham

```text
$ git clean -n -d
Would remove build.TMP
Would remove build/
Would remove lib/qoralama.rb
Would remove tmp/
Would remove todo.txt
Would skip repository vendor/kutubxona
```

Ichida `.git` bo'lgan papkani (ichma-ich repo, masalan klon qilingan kutubxona) Git o'chirmaydi — "Would skip repository".

### `-x` va `-X`: ignore qilinganlar

Standart `clean` `.gitignore`dagi fayllarga tegmaydi ([8-bob](08-gitignore-rm-mv.md)).

```text
$ git clean -n -d -x
Would remove build.TMP
Would remove build/
Would remove debug.log
Would remove lib/qoralama.rb
Would remove tmp/
Would remove todo.txt
Would skip repository vendor/kutubxona
Would remove xato.log

$ git clean -n -X
Would remove debug.log
Would remove xato.log
```

- `-x` — ignore qoidalarini e'tiborsiz qoldiradi: untracked **va** ignore qilinganlarning hammasi. To'liq toza build uchun.
- `-X` (katta harf) — **faqat** ignore qilingan fayllar. Build natijalarini o'chirib, qo'lda yaratilgan untracked fayllarni saqlab qolish uchun.

### `-e` va pathspec: doirani toraytirish

```text
$ git clean -n -d -e '*.TMP'
Would remove build/
Would remove lib/qoralama.rb
Would remove tmp/
Would remove todo.txt
Would skip repository vendor/kutubxona

$ git clean -n -- lib
Would remove lib/qoralama.rb
```

`-e <pattern>` qo'shimcha ignore qoidasi qo'shadi (u `-x` bilan ham ishlaydi). Pathspec berilsa, faqat mos yo'llar ko'riladi va `-d` ahamiyatsiz bo'ladi. Yana bir muhim jihat: `clean` **joriy papkadan** boshlab ishlaydi:

```text
$ cd lib && git clean -n
Would remove c.rb
```

### Haqiqiy o'chirish va ikki marta `-f`

```text
$ git clean -f -d
Removing build.TMP
Removing build/
Removing lib/qoralama.rb
Removing tmp/
Removing todo.txt
Skipping repository vendor/kutubxona

$ git status -s --ignored
?? vendor/
!! debug.log
!! xato.log

$ git clean -f -f -d
Removing vendor/
```

Ichma-ich repo faqat ikkinchi `-f` bilan o'chdi — **ichidagi `.git` bilan birga**. Agar u yerda push qilinmagan commit'lar bo'lsa, ular ham yo'qoladi. `-ff`ni faqat nima qilayotganingizni aniq bilganda ishlating. (Submodule'lar haqida [43-bob](43-submodule-bundle-replace.md).)

`-q` (`--quiet`) — o'chirilganlar ro'yxatini chiqarmaydi, faqat xatolar.

### `-i`: interaktiv rejim

```text
$ git clean -x -i
Would remove the following items:
  b.txt      debug.log  lib/c.rb   xato.log
*** Commands ***
    1: clean                2: filter by pattern    3: select by numbers
    4: ask each             5: quit                 6: help
What now> 6
clean               - start cleaning
filter by pattern   - exclude items from deletion
select by numbers   - select items to be deleted by numbers
ask each            - confirm each deletion (like "rm -i")
quit                - stop cleaning
help                - this screen
?                   - help for prompt selection
...
What now> 5
Bye.
```

(`6` va `5` kiritilgan javoblar.) Buyruqlar:

| Buyruq | Nima qiladi |
| --- | --- |
| `1: clean` | Ro'yxatdagilarni o'chiradi va chiqadi |
| `2: filter by pattern` | `Input ignore patterns>>` — bo'sh joy bilan ajratilgan pattern'lar (`*.c *.h`) ro'yxatdan chiqariladi; bo'sh Enter — menyuga qaytish |
| `3: select by numbers` | `Select items to delete>>` — raqamlar: `2-5 7,9`, `7-` (7 dan oxirigacha), `*` (hammasi) |
| `4: ask each` | Har fayl uchun `[y/N]` so'raydi (`rm -i` kabi) |
| `5: quit` | Hech narsa o'chirmasdan chiqish |
| `6: help` | Yordam |

Javobda raqam o'rniga nomning noyob boshini yozish ham mumkin (`c` yoki `clean`). `-i` va `-n`da `clean.requireForce` hisobga olinmaydi — biri o'zi so'raydi, ikkinchisi hech narsa o'chirmaydi.

## Muhandislik nuqtai nazari: stash qachon, commit qachon

Stash — **qisqa muddatli** vosita. U branch'ga bog'lanmagan, push qilinmaydi (`export`siz), reflog orqali yashaydi va `list`da faqat bir qator xabar bilan ko'rinadi. Bir haftadan keyin "stash@{4}: WIP on main" nimaligini hech kim eslamaydi.

| Holat | Tavsiya |
| --- | --- |
| 5 daqiqaga boshqa branch'ga o'tish, `pull` qilish | `git stash` / `pop` yoki `--autostash` |
| Bir necha kunlik tugallanmagan ish | Alohida branch'da WIP commit, keyin `commit --amend` yoki interaktiv rebase bilan tozalash ([25-bob](25-tarixni-qayta-yozish.md)) |
| Ishni boshqa kompyuterga o'tkazish | Branch'ga commit va push; yoki Git 2.51+ da `stash export` |
| Commit'dan oldin qismni sinash | `stash push --keep-index` |
| Bog'liq bo'lmagan kichik tuzatishni ajratish | `stash push --staged` |
| Ikki branch'da bir vaqtda ishlash | `git worktree` ([49-bob](49-worktree-va-katta-repo.md)) — stash bilan har safar almashtirishdan qulayroq |

Rasmiy hujjatdagi "Interrupted workflow" misoli ham shu farqni ko'rsatadi: eski usul — vaqtinchalik branch'ga `commit -a -m WIP`, tuzatish, qaytib `reset --soft HEAD^`. Stash shu uch qadamni ikkitaga qisqartiradi. Ikkalasi ham to'g'ri — muddat va kontekstga qarab tanlang.

## Muhandislik nuqtai nazari: `clean` xavfsizligi

`clean`dan himoya qatlamlari:

1. `clean.requireForce=true` — `-f`siz ishlamaydi;
2. `-n` — oldindan ko'rish odati: avval `-n`, natijani o'qing, keyin `-n`ni `-f`ga almashtiring;
3. ichma-ich repo'lar ikkinchi `-f`siz o'chmaydi;
4. ignore qilinganlar `-x`/`-X`siz o'chmaydi — `.env`, lokal konfiguratsiya fayllari odatda ignore qilingan bo'ladi va `-x` ularni ham o'chiradi.

"Repo'ni yangi klon holatiga keltirish" buyruqlari juftligi ko'p uchraydi:

```bash
git reset --hard        # tracked fayllar HEAD holatiga (39-bob)
git clean -fdx          # untracked va ignore qilinganlar o'chadi
```

Bu ikkisi birga ishlatilganda saqlanmagan **hamma narsa** yo'qoladi: `reset --hard`dan keyin stage qilinmagan o'zgarishlarni, `clean`dan keyin untracked fayllarni Git qaytara olmaydi. Ishonchingiz komil bo'lmasa — `git stash push --all`: natija bir xil (toza papka), lekin hammasi stash'da saqlanib qoladi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `apply`/`pop` dan keyin stage qilingan o'zgarishlar "yo'qoldi" | Standart holatda index tiklanmaydi, hammasi stage qilinmagan bo'lib qaytadi | `git stash apply --index` yoki `stash.index=true` |
| Yangi faylni stash qildim deb o'ylash | Standart `stash` untracked fayllarni olmaydi, ular diskda qoladi | `git stash push -u` (ignore qilinganlar uchun `-a`) |
| Konfliktdan keyin stash'ni yo'qolgan deb o'ylash | `pop` konfliktda stash'ni o'chirmaydi | Konfliktni hal qiling, keyin `git stash drop` |
| Konfliktni hal qilib, `drop`ni unutish | Stash ro'yxatda qoladi, keyin chalkashlik | Hal qilgach `git stash drop` |
| `stash@{N}` raqamini eslab qolish | Yangi stash qo'shilganda raqamlar suriladi | `git stash list` bilan tekshirish, `-m` bilan aniq xabar |
| `git stash save fayl.txt` | `save` pathspec olmaydi — "fayl.txt" xabar bo'lib qoladi, hamma fayl stash'lanadi | `git stash push -- fayl.txt` |
| Stash'ni uzoq muddatli saqlash joyi sifatida ishlatish | Kontekst yo'qoladi, branch'ga bog'lanmagan, boshqa kompyuterda yo'q | WIP commit alohida branch'da |
| `git stash clear`ni bilmasdan ishlatish | Hamma stash ro'yxatdan ketadi, `gc`dan keyin qaytmaydi | `drop` bilan bittalab; adashsangiz darhol `fsck --unreachable` + `stash store` |
| `git clean -fdx`ni `-n`siz ishga tushirish | `.env`, lokal sozlamalar, IDE fayllari ham o'chadi; qaytarib bo'lmaydi | Avval `git clean -ndx`; yoki `git stash push --all` |
| Ichki papkada `git clean` qilib, butun repo tozalandi deb o'ylash | `clean` joriy papkadan boshlab ishlaydi | Repo ildizida ishga tushiring yoki pathspec bering |
| `git clean -ffd` | Ichma-ich repo'lar `.git`i bilan, push qilinmagan commit'lari bilan o'chadi | Ikkinchi `-f`ni faqat ongli ravishda |

## Amaliyot

1. Sinov repo'sida ikki faylni o'zgartiring, birini stage qiling, `git stash` qiling. `git stash apply` va `git stash apply --index` natijalarini `git status -s` bilan solishtiring.
2. `git cat-file -p stash`, `git cat-file -p stash^2` bilan stash'ning ikki ota-onasini toping. `git show stash^2:<fayl>` va `git show stash:<fayl>` farqini tushuntiring.
3. Uchta stash'ni `-m` bilan yarating. O'rtadagisini `git stash show -p 1` bilan ko'ring va faqat uni `pop` qiling. Qolganlarining raqamlari qanday o'zgardi?
4. Untracked va `.gitignore`dagi fayl yarating. `git stash`, `git stash -u`, `git stash -a` har birida qaysi fayl diskda qolishini tekshiring. `-u` stash'ining uchinchi otasini `git log --graph` bilan ko'ring.
5. Stash yarating, keyin branch'da xuddi shu qatorni o'zgartirib commit qiling. `git stash pop` konfliktini oling, `git stash list` stash qolganini tasdiqlang. Keyin `git reset --merge` qilib, `git stash branch` bilan konfliktsiz qo'llang.
6. `git stash drop` qiling, chiqqan hash'ni yozib qo'ymang. `git fsck --unreachable` orqali uni topib, `git stash store` bilan qaytaring.
7. `build/`, `*.tmp` (ignore qilingan) va `qoralama.txt` yarating. `git clean` ning `-n`, `-nd`, `-ndx`, `-nX` natijalarini solishtiring; keyin `-i` rejimida `filter by pattern` bilan `qoralama.txt`ni saqlab, qolganini o'chiring.
8. (Qiyinroq) Ikki lokal klon va bitta bare repo yarating. Birinchi klonda ikki stash yaratib, `git stash export --to-ref refs/stashes/<ism>` va `push` qiling; ikkinchisida `fetch` va `git stash import` qiling. Eksport zanjiridagi har commit'ning otalarini `git cat-file -p` bilan tahlil qiling va asl stash commit'lari hash'lari o'zgarmaganini tasdiqlang.

## Rasmiy hujjat

- Pro Git — Stashing and Cleaning: <https://git-scm.com/book/en/v2/Git-Tools-Stashing-and-Cleaning>
- `git stash`: <https://git-scm.com/docs/git-stash>
- `git clean`: <https://git-scm.com/docs/git-clean>
- `git rebase` (`--autostash`): <https://git-scm.com/docs/git-rebase>
- Git 2.51.0 reliz eslatmalari (`stash export`/`import`): <https://github.com/git/git/blob/master/Documentation/RelNotes/2.51.0.adoc>
