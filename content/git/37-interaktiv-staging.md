# 37 — Interaktiv staging

[← Oldingi: GitHub: repo va tashkilotni boshqarish](36-github-boshqaruv.md) · [Mundarija](README.md) · [Keyingi: `stash` va `clean` →](38-stash-va-clean.md)

## Tushuncha

Ko'pincha ish shunday bo'ladi: bir faylda bir nechta **mustaqil** o'zgarish qilasiz — bitta xatoni tuzatasiz, yo'l-yo'lakay izoh qo'shasiz, vaqtincha `print` bilan nosozlik qidirasiz. Oxirida `git add hisob.py` desangiz, hammasi bitta commit'ga tushadi. 10-bobda aytilgandek, yaxshi commit **atomar** bo'lishi kerak: bitta mantiqiy o'zgarish, bitta commit.

**Interaktiv staging** — faylni butunligicha emas, **bo'laklab** index'ga qo'shish usuli. Eslatma: **index** (staging area) — keyingi commit'ning "qoralamasi", `.git/index` faylida saqlanadi (5- va [15-bob](15-tree-va-index.md)). Odatda `git add fayl` faylning working tree'dagi to'liq holatini index'ga yozadi. Interaktiv rejimda esa siz o'zingiz tanlaysiz: qaysi fayl, faylning qaysi qismi, hatto qaysi qator.

Bu bobda uchta vosita bor:

| Buyruq | Nima qiladi |
| --- | --- |
| `git add -i` (`--interactive`) | Menyu: fayllarni stage qilish, stage'dan chiqarish, yangi fayl qo'shish, diff ko'rish, patch rejimi |
| `git add -p` (`--patch`) | To'g'ridan-to'g'ri patch rejimi: har bir **hunk** uchun "qo'shaymi?" deb so'raydi |
| `git restore -p`, `git reset -p`, `git stash -p`, `git commit -p` | Xuddi shu hunk tanlash interfeysi, lekin boshqa amal uchun (tashlash, stage'dan chiqarish, stash qilish, commit qilish) |

**Hunk** nima? `git diff` chiqishidagi `@@ -11,6 +12,9 @@` bilan boshlanadigan har bir bo'lak — faylning bir joyidagi o'zgarish va uning atrofidagi bir necha qator kontekst (odatda 3 qator). Bir faylda o'zgarishlar bir-biridan uzoqda bo'lsa, ular alohida hunk'larga bo'linadi; yaqin bo'lsa — bitta hunk'ga qo'shiladi.

```text
working tree            index                 HEAD (oxirgi commit)
(diskdagi fayl)   ──►   (keyingi commit)  ──►  (.git/objects)
                 git add -p
          (faqat tanlangan hunk'lar o'tadi)
```

## Nega shunday: index nima uchun alohida qatlam

Ko'p versiya nazorat tizimlarida "commit qilish" = "o'zgargan fayllarni yozish". Git'da esa orada index bor, va aynan shu oraliq qatlam interaktiv staging'ni mumkin qiladi.

Index — bu faylning **uchinchi versiyasi**. Bir vaqtning o'zida bitta faylning uch xil holati bo'lishi mumkin:

1. `HEAD` dagi versiya — oxirgi commit'da saqlangan;
2. index'dagi versiya — keyingi commit'ga tushadigan;
3. working tree'dagi versiya — diskda, muharriringizda ochiq turgan.

`git add -p` qilganda Git aslida shunday ishlaydi: index'dagi va working tree'dagi versiyalar orasidagi diff'ni oladi, uni hunk'larga bo'ladi, siz tanlagan hunk'lardan yangi patch yasaydi va uni **faqat index'ga** qo'llaydi (`git apply --cached` bilan bir xil ish). Natijada index'da yangi blob paydo bo'ladi — bu fayl mazmunining diskda hech qachon bo'lmagan oraliq holati. Working tree'ga tegilmaydi.

Shuning uchun interaktiv staging'dan keyin `git status` bitta faylni **ikki joyda** ko'rsatadi: "staged" (index'da `HEAD` dan farq bor) va "not staged" (working tree'da index'dan farq bor). Bu xato emas — aynan maqsad shu.

**Muammo.** Bitta katta "aralash" commit'ni review qilish qiyin, `git revert` bilan faqat bir qismini qaytarib bo'lmaydi, `git bisect` (41-bob) aybdor commit'ni topganda ham ichida uchta mavzu bo'lsa, foydasi kam.
**Yechim.** O'zgarishlarni xohlagancha erkin yozing, keyin commit qilishdan oldin `add -p` bilan mavzularga ajrating.

## Kod: sinov repo'sini tayyorlash

Misollar uchun kichik Python moduli. Avval boshlang'ich commit:

```bash
$ git init -b main -q .
$ cat hisob.py
def qoshish(a, b):
    return a + b


def ayirish(a, b):
    return a - b


def kopaytirish(a, b):
    return a * b


def bolish(a, b):
    return a / b


def daraja(a, b):
    return a ** b
$ printf '# Kalkulyator\n\nOddiy hisob-kitob moduli.\n' > README.md
$ printf 'TODO:\n- bolishda nolni tekshirish\n' > TODO
$ git add . && git commit -q -m "Kalkulyator: boshlang'ich versiya"
$ git log --oneline
73d31d6 Kalkulyator: boshlang'ich versiya
```

Endi bir o'tirishda bir nechta ish qilamiz: `README.md` ni yangilaymiz, `TODO` dan bajarilgan bandni o'chiramiz, `hisob.py` ga docstring, izoh, nolga bo'lish tekshiruvi va vaqtinchalik `DEBUG` qatorini qo'shamiz, yana `tajriba.py` degan yangi fayl yaratamiz:

```bash
$ git status -s
 M README.md
 M TODO
 M hisob.py
?? tajriba.py
$ git diff hisob.py
diff --git a/hisob.py b/hisob.py
index 1b47016..114c681 100644
--- a/hisob.py
+++ b/hisob.py
@@ -1,9 +1,10 @@
 def qoshish(a, b):
+    """Ikki sonni qo'shadi."""
     return a + b
 
 
 def ayirish(a, b):
-    return a - b
+    return a - b  # natija manfiy bo'lishi mumkin
 
 
 def kopaytirish(a, b):
@@ -11,6 +12,9 @@ def kopaytirish(a, b):
 
 
 def bolish(a, b):
+    print("DEBUG", a, b)
+    if b == 0:
+        raise ZeroDivisionError("b nol bo'lmasin")
     return a / b
```

`hisob.py` da ikkita hunk bor. Birinchisi ichida aslida **ikki** mustaqil o'zgarish (docstring va izoh) — ular bir-biriga yaqin bo'lgani uchun Git ularni bitta hunk'ga birlashtirgan. Maqsadimiz: nolga bo'lish tekshiruvini (lekin `DEBUG` siz) alohida commit qilish.

> Quyidagi misollarda siz klaviaturada yozadigan javoblar prompt'dan keyin ko'rsatilgan (masalan `What now> u`). Haqiqiy terminal ularni ekranda aks ettiradi; qolgan hamma chiqish Git 2.56.0 dan so'zma-so'z olingan.

## Kod: `git add -i` menyusi

```bash
$ git add -i
           staged     unstaged path
  1:    unchanged        +1/-1 README.md
  2:    unchanged        +0/-1 TODO
  3:    unchanged        +5/-1 hisob.py

*** Commands ***
  1: [s]tatus     2: [u]pdate     3: [r]evert     4: [a]dd untracked
  5: [p]atch      6: [d]iff       7: [q]uit       8: [h]elp
What now>
```

Yuqoridagi jadval — `git status` ning ixcham ko'rinishi:

- **staged** ustuni — `HEAD` bilan index orasidagi farq (commit qilsangiz nima ketadi). `unchanged` — farq yo'q.
- **unstaged** ustuni — index bilan working tree orasidagi farq (yana nimani stage qilish mumkin). `nothing` — farq yo'q.
- `+5/-1` — qo'shilgan va o'chirilgan qatorlar soni. Binar fayl bo'lsa, son o'rniga `binary` yoziladi.
- `tajriba.py` ro'yxatda yo'q: bu jadval faqat **kuzatiladigan** (tracked) fayllarni ko'rsatadi. Untracked fayllar uchun alohida buyruq bor (`add untracked`).

Buyruqni raqami (`2`), bosh harfi (`u`) yoki noyob boshlanishi (`up`, `update`) bilan tanlash mumkin. `h` har birining qisqa tavsifini beradi:

```text
What now> h
status        - show paths with changes
update        - add working tree state to the staged set of changes
revert        - revert staged set of changes back to the HEAD version
patch         - pick hunks and update selectively
diff          - view diff between HEAD and index
add untracked - add contents of untracked files to the staged set of changes
```

### `update` — fayllarni to'liq stage qilish

Prompt **bitta** `>` bilan tugasa (`What now>`), faqat bitta tanlov qilinadi. **Ikkita** `>>` bilan tugasa (`Update>>`), bir nechta tanlash mumkin:

```text
What now> u
           staged     unstaged path
  1:    unchanged        +1/-1 [R]EADME.md
  2:    unchanged        +0/-1 [T]ODO
  3:    unchanged        +5/-1 [h]isob.py
Update>> 1,2
           staged     unstaged path
* 1:    unchanged        +1/-1 [R]EADME.md
* 2:    unchanged        +0/-1 [T]ODO
  3:    unchanged        +5/-1 [h]isob.py
Update>>
updated 2 paths
```

`*` — tanlanganini bildiradi. Bo'sh qator (shunchaki Enter) tanlovni **qo'llaydi**: tanlangan fayllarning working tree holati index'ga yoziladi — `git add README.md TODO` bilan bir xil. Kvadrat qavsdagi harflar — fayl nomining noyob boshlanishi: raqam o'rniga `R` yoki `h` deb yozsangiz ham bo'ladi (rangsiz terminalda qavs bilan, rangli terminalda rang bilan ajratiladi).

Tanlash sintaksisi (`git-add` ma'lumotnomasidan, sinab ko'rilgan):

| Kiritish | Ma'nosi |
| --- | --- |
| `1,2` yoki `1 2` | 1 va 2 |
| `2-5 7,9` | 2, 3, 4, 5, 7, 9 |
| `2-` | 2 va undan keyingi hammasi |
| `*` | hammasi |
| `-2` | 2 ni tanlovdan olib tashlash |

Masalan, `2-` keyin `-2` — natijada faqat 3 tanlangan qoladi:

```text
Update>> 2-
           staged     unstaged path
  1:    unchanged        +1/-1 [R]EADME.md
* 2:    unchanged        +0/-1 [T]ODO
* 3:    unchanged        +5/-1 [h]isob.py
Update>> -2
           staged     unstaged path
  1:    unchanged        +1/-1 [R]EADME.md
  2:    unchanged        +0/-1 [T]ODO
* 3:    unchanged        +5/-1 [h]isob.py
Update>>
updated 1 path
```

Ehtiyot bo'ling: `*` kiritilsa, Git Enter'ni kutmasdan darhol hammasini stage qiladi (sinovda `Update>> *` dan keyin to'g'ridan-to'g'ri `updated 3 paths` chiqdi).

Status endi:

```text
What now> s
           staged     unstaged path
  1:        +1/-1      nothing README.md
  2:        +0/-1      nothing TODO
  3:    unchanged        +5/-1 hisob.py
```

`README.md` va `TODO` ning o'zgarishlari "staged" ustuniga o'tdi, "unstaged" da `nothing` — working tree va index bir xil.

### `revert` — stage'dan chiqarish

Nomi chalg'itmasin: bu `git revert` (commit'ni teskari commit bilan bekor qilish, 26-bob) emas. Bu yerda `revert` index'dagi yozuvni `HEAD` dagi holatga qaytaradi, ya'ni `git restore --staged fayl` bilan bir xil. Working tree'dagi o'zgarishingiz joyida qoladi.

```text
What now> r
           staged     unstaged path
  1:        +1/-1      nothing [R]EADME.md
  2:        +0/-1      nothing [T]ODO
Revert>> 2
           staged     unstaged path
  1:        +1/-1      nothing [R]EADME.md
* 2:        +0/-1      nothing [T]ODO
Revert>>
reverted 1 path
```

E'tibor bering: `Revert>>` ro'yxatida faqat **stage qilingan** fayllar bor va raqamlar **qayta beriladi**. Asosiy statusda `hisob.py` 3-raqam edi, bu yerda esa umuman yo'q. Har prompt'da raqamni yangi ro'yxatdan o'qing — eski raqamni yozsangiz, Git `Huh (4)?` deb javob beradi.

### `diff` — nima commit bo'lishini ko'rish

```text
What now> d
           staged     unstaged path
  1:        +1/-1      nothing [R]EADME.md
Review diff>> 1
diff --git a/README.md b/README.md
index 3636720..460bc49 100644
--- a/README.md
+++ b/README.md
@@ -1,3 +1,3 @@
 # Kalkulyator
 
-Oddiy hisob-kitob moduli.
+Oddiy hisob-kitob moduli (Python 3).
```

Bu `git diff --cached README.md` ning aynan o'zi: `HEAD` va index orasidagi farq.

### `add untracked` va yangi faylni qaytarish

```text
What now> a
           staged     unstaged path
  1: [t]ajriba.py
Add untracked>> 1
           staged     unstaged path
* 1: [t]ajriba.py
Add untracked>>
added 1 path
What now> r
           staged     unstaged path
  1:        +1/-1      nothing [R]EADME.md
  2:        +1/-0      nothing [t]ajriba.py
Revert>> 2
           staged     unstaged path
  1:        +1/-1      nothing [R]EADME.md
* 2:        +1/-0      nothing [t]ajriba.py
Revert>>
note: tajriba.py is untracked now.
reverted 1 path
What now> q
Bye.
```

Yangi faylni `revert` qilish uni index'dan butunlay olib tashlaydi — `HEAD` da u yo'q edi, demak "HEAD holati" = "kuzatilmaydi". Git buni alohida eslatadi: `note: tajriba.py is untracked now.` Fayl diskda qoladi.

```bash
$ git status -s
M  README.md
 M TODO
 M hisob.py
?? tajriba.py
```

## Kod: `git add -p` — hunk'larni tanlash

Menyudagi `5: [p]atch` va buyruq qatoridagi `git add -p` bir xil ish qiladi; `-p` shunchaki menyuni chetlab o'tib, to'g'ridan-to'g'ri patch rejimiga kiradi. Kundalik ishda deyarli har doim `git add -p` ishlatiladi.

```text
$ git add -p hisob.py
diff --git a/hisob.py b/hisob.py
index 1b47016..114c681 100644
--- a/hisob.py
+++ b/hisob.py
@@ -1,9 +1,10 @@
 def qoshish(a, b):
+    """Ikki sonni qo'shadi."""
     return a + b
 
 
 def ayirish(a, b):
-    return a - b
+    return a - b  # natija manfiy bo'lishi mumkin
 
 
 def kopaytirish(a, b):
(1/2) Stage this hunk [y,n,q,a,d,k,K,j,J,g,/,s,e,p,P,?]?
```

`(1/2)` — 2 ta hunk'dan birinchisi. Qavs ichidagi harflar — hozir mavjud buyruqlar. `?` to'liq ro'yxatni beradi:

```text
(1/2) Stage this hunk [y,n,q,a,d,k,K,j,J,g,/,s,e,p,P,?]? ?
y - stage this hunk
n - do not stage this hunk
q - quit; do not stage this hunk or any of the remaining ones
a - stage this hunk and all later hunks in the file
d - do not stage this hunk or any of the later hunks in the file
j - go to the next undecided hunk, roll over at the bottom
J - go to the next hunk, roll over at the bottom
k - go to the previous undecided hunk, roll over at the top
K - go to the previous hunk, roll over at the top
g - select a hunk to go to
/ - search for a hunk matching the given regex
s - split the current hunk into smaller hunks
e - manually edit the current hunk
p - print the current hunk
P - print the current hunk using the pager
? - print help
```

O'zbekcha jadval:

| Tugma | Ma'nosi |
| --- | --- |
| `y` | shu hunk'ni stage qilish |
| `n` | stage qilmaslik |
| `q` | chiqish; shu va qolgan hunk'larni stage qilmaslik (oldin `y` deganlaringiz saqlanadi) |
| `a` | shu va fayldagi qolgan hamma hunk'ni stage qilish |
| `d` | shu va fayldagi qolganlarini stage qilmaslik |
| `j` / `J` | keyingi **qaror qilinmagan** / shunchaki keyingi hunk'ga o'tish (oxiridan boshiga aylanadi) |
| `k` / `K` | oldingi qaror qilinmagan / oldingi hunk'ga qaytish |
| `g` | raqam bo'yicha hunk'ga o'tish |
| `/` | regex bo'yicha hunk qidirish |
| `s` | hunk'ni kichikroqlarga bo'lish |
| `e` | hunk'ni muharrirda qo'lda tahrirlash |
| `p` / `P` | joriy hunk'ni qayta chiqarish / pager orqali chiqarish |

Ro'yxat **kontekstga bog'liq**: faqat hozir ma'noli bo'lgan harflar ko'rsatiladi. `s` faqat hunk'ni bo'lish mumkin bo'lganda chiqadi; birinchi hunk'da `k` bor (aylanib o'tadi), oxirgisida esa `j`/`k` yo'q, chunki qaror qilinmagan boshqa hunk qolmagan. Pro Git'dagi `[y,n,a,d,/,j,J,g,e,?]` ro'yxati eski versiyadan; hozir `q`, `p`, `P`, `k`/`K` ham bor va hunk raqami `(1/2)` ko'rsatiladi.

### `s` — hunk'ni bo'lish

Birinchi hunk'da ikki mavzu aralashgan. `s` bosamiz:

```text
(1/2) Stage this hunk [y,n,q,a,d,k,K,j,J,g,/,s,e,p,P,?]? s
Split into 2 hunks.
@@ -1,5 +1,6 @@
 def qoshish(a, b):
+    """Ikki sonni qo'shadi."""
     return a + b
 
 
 def ayirish(a, b):
(1/3) Stage this hunk [y,n,q,a,d,k,K,j,J,g,/,e,p,P,?]? y
@@ -2,8 +3,8 @@
     return a + b
 
 
 def ayirish(a, b):
-    return a - b
+    return a - b  # natija manfiy bo'lishi mumkin
 
 
 def kopaytirish(a, b):
(1/3) ... 
(2/3) Stage this hunk [y,n,q,a,d,k,K,j,J,g,/,e,p,P,?]? n
```

Endi hunk'lar soni 3 ta. `s` faqat o'zgargan qatorlar orasida **o'zgarmagan kontekst qatori** bo'lsa ishlaydi: Git hunk'ni ana shu kontekst joylaridan kesadi. Agar ikki o'zgarish qo'shni qatorlarda bo'lsa (orasida o'zgarmagan qator yo'q), `s` ro'yxatda chiqmaydi — u holda `e` kerak.

### `e` — hunk'ni qo'lda tahrirlash

Uchinchi hunk'da kerakli tekshiruv va keraksiz `DEBUG` qatori **ketma-ket** turibdi — `s` ularni ajrata olmaydi. `e` bosilsa, Git hunk'ni muharrirda ochadi:

```text
# Manual hunk edit mode -- see bottom for a quick guide.
@@ -11,6 +12,9 @@ def kopaytirish(a, b):
 
 
 def bolish(a, b):
+    print("DEBUG", a, b)
+    if b == 0:
+        raise ZeroDivisionError("b nol bo'lmasin")
     return a / b
 
 
# ---
# To remove '-' lines, make them ' ' lines (context).
# To remove '+' lines, delete them.
# Lines starting with # will be removed.
# If the patch applies cleanly, the edited hunk will immediately be marked for staging.
# If it does not apply cleanly, you will be given an opportunity to
# edit again.  If all lines of the hunk are removed, then the edit is
# aborted and the hunk is left unchanged.
```

Pastdagi qo'llanma — eng muhim qoidalar:

- `+` qatorni stage qilmaslik uchun — uni **o'chiring**.
- `-` qatorni (o'chirishni) stage qilmaslik uchun — boshidagi `-` ni **bo'sh joyga** almashtiring (kontekstga aylanadi).
- `#` bilan boshlangan qatorlar e'tiborga olinmaydi.
- Hamma qatorni o'chirsangiz — tahrir bekor bo'ladi, hunk o'zgarishsiz qoladi.

`print("DEBUG", a, b)` qatorini o'chirib, faylni saqlab yopamiz. Natijani tekshiramiz:

```bash
$ git diff --cached hisob.py
diff --git a/hisob.py b/hisob.py
index 1b47016..abdf516 100644
--- a/hisob.py
+++ b/hisob.py
@@ -1,4 +1,5 @@
 def qoshish(a, b):
+    """Ikki sonni qo'shadi."""
     return a + b
 
 
@@ -11,6 +12,8 @@ def kopaytirish(a, b):
 
 
 def bolish(a, b):
+    if b == 0:
+        raise ZeroDivisionError("b nol bo'lmasin")
     return a / b
 
 
$ git diff hisob.py
diff --git a/hisob.py b/hisob.py
index abdf516..114c681 100644
--- a/hisob.py
+++ b/hisob.py
@@ -4,7 +4,7 @@ def qoshish(a, b):
 
 
 def ayirish(a, b):
-    return a - b
+    return a - b  # natija manfiy bo'lishi mumkin
 
 
 def kopaytirish(a, b):
@@ -12,6 +12,7 @@ def kopaytirish(a, b):
 
 
 def bolish(a, b):
+    print("DEBUG", a, b)
     if b == 0:
         raise ZeroDivisionError("b nol bo'lmasin")
     return a / b
```

Index'da: docstring + tekshiruv. Working tree'da qolgan: izoh + `DEBUG`. Aynan xohlaganimiz.

Tahrir noto'g'ri bo'lsa (masalan, kontekst qatorini o'zgartirsangiz), patch qo'llanmaydi va Git qayta tahrirlashni taklif qiladi:

```text
error: patch failed: hisob.py:11
error: hisob.py: patch does not apply
error: 'git apply --cached' failed
Your edited hunk does not apply. Edit again (saying "no" discards!) [y/n]?
```

`n` desangiz, tahriringiz tashlanadi va hunk asl holida yana so'raladi — index buzilmaydi.

## Kod: ichkarida nima bo'ldi — uchta versiya

Endi `hisob.py` ning uchta turli versiyasi bor va har biri `.git/objects` da (yoki diskda) alohida mazmun:

```bash
$ git rev-parse HEAD:hisob.py
1b47016fbd4330f91edfc6645a95a8da267eebf2
$ git ls-files -s hisob.py
100644 abdf516abd8364c166c8c71e507f829cbdd42ef3 0	hisob.py
$ git hash-object hisob.py
114c681d301de01d62fffd5422b962977d9b2e8b
```

- `1b47016...` — `HEAD` dagi blob (14-bobdagi blob tushunchasi).
- `abdf516...` — index'dagi blob. `git add -p` uni **yaratdi va `.git/objects` ga yozdi**; bu mazmun diskda hech qachon fayl sifatida bo'lmagan.
- `114c681...` — working tree'dagi fayl; `hash-object` (`-w` siz) faqat hisoblaydi, hech narsa yozmaydi.

`git diff` sarlavhalaridagi `index 1b47016..abdf516` va `index abdf516..114c681` aynan shu uchta hash'ning qisqartmasi. Index'dagi versiyani to'liq ko'rish:

```bash
$ git show :hisob.py | head -4
def qoshish(a, b):
    """Ikki sonni qo'shadi."""
    return a + b

```

`:hisob.py` — "index'dagi hisob.py" degani (19-bob, revision sintaksisi).

`add -i` statusi ham buni ko'rsatadi — fayl ikkala ustunda:

```text
           staged     unstaged path
  1:        +1/-1      nothing README.md
  2:    unchanged        +0/-1 TODO
  3:        +3/-0        +2/-1 hisob.py
```

Commit qilamiz:

```bash
$ git add TODO
$ git commit -q -m "bolish: nolga bo'lishni tekshirish, hujjatni yangilash"
$ git log --oneline
5fff48e bolish: nolga bo'lishni tekshirish, hujjatni yangilash
73d31d6 Kalkulyator: boshlang'ich versiya
$ git status -s
 M hisob.py
?? tajriba.py
```

Commit index'dan yasaladi, working tree'dan emas — shuning uchun `DEBUG` qatori commit'ga tushmadi va diskda hamon turibdi.

> **Diqqat: test qiling.** Index'dagi oraliq holat siz hech qachon ishga tushirmagan kod. Murakkab bo'lishda commit'dan oldin uni tekshirish uchun `git stash push --keep-index` (38-bob) bilan working tree'ni vaqtincha index holatiga keltirib, testlarni yurgizing.

## Kod: navigatsiya — `g`, `/`, `j`, `k`

Hunk'lar ko'p bo'lsa, ketma-ket yurish noqulay. `g` hunk'lar ro'yxatini (har birining birinchi o'zgargan qatori bilan) chiqaradi:

```text
(1/2) Stage this hunk [y,n,q,a,d,k,K,j,J,g,/,s,e,p,P,?]? g
  1:  -1,9 +1,10         +    """Ikki sonni qo'shadi."""
  2:  -11,6 +12,9        +    print("DEBUG", a, b)
go to which hunk? 2
@@ -11,6 +12,9 @@ def kopaytirish(a, b):
 ...
(2/2) Stage this hunk [y,n,q,a,d,k,K,j,J,g,/,e,p,P,?]?
```

`/` — regex bo'yicha birinchi mos hunk'ga sakrash:

```text
(1/2) Stage this hunk [y,n,q,a,d,k,K,j,J,g,/,s,e,p,P,?]? /ZeroDiv
@@ -11,6 +12,9 @@ def kopaytirish(a, b):
 
 
 def bolish(a, b):
+    print("DEBUG", a, b)
+    if b == 0:
+        raise ZeroDivisionError("b nol bo'lmasin")
     return a / b
 
 
(2/2) Stage this hunk [y,n,q,a,d,k,K,j,J,g,/,e,p,P,?]?
```

`n` va `y` tanlovi darhol qo'llanmaydi: Git hamma qarorni yig'adi va **oxirida** (fayl yoki sessiya tugaganda) index'ni bir marta yangilaydi. Shuning uchun `K` bilan orqaga qaytib, fikringizni o'zgartirish mumkin.

## Kod: Git 2.52–2.54 dagi yangiliklar

So'nggi relizlarda patch rejimi sezilarli yangilandi (manba: `RelNotes/2.52.0.adoc`, `2.54.0.adoc`):

**1. Hunk'ning joriy holati ko'rsatiladi (2.54).** Qaror qilingan hunk'ga qaytsangiz, prompt'da avvalgi javobingiz yoziladi:

```text
(1/2) Stage this hunk [y,n,q,a,d,k,K,j,J,g,/,e,p,P,?]? n
@@ -12,6 +12,8 @@ def kopaytirish(a, b):
...
(2/2) Stage this hunk [y,n,q,a,d,K,J,g,/,e,p,P,?]? K
@@ -4,7 +4,7 @@ def qoshish(a, b):
...
(1/2) Stage this hunk (was: n) [y,n,q,a,d,k,K,j,J,g,/,e,p,P,?]?
```

`(was: n)` — "bu hunk'ga oldin `n` degansiz".

**2. Fayllar orasida erkin yurish (2.54).** Odatda bir faylning hamma hunk'i hal bo'lishi bilan Git keyingi faylga o'tib ketadi va oldingisiga qaytib bo'lmaydi. Reliz eslatmasida: "`git add -p` learned a new mode that allows the user to revisit a file that was already dealt with". Bu rejim `--no-auto-advance` opsiyasi bilan yoqiladi (`git add -h` da: `--[no-]auto-advance  auto advance to the next file when selecting hunks interactively`). Unda ikki yangi tugma paydo bo'ladi:

```text
$ git add -p --no-auto-advance
...
(1/1) Stage this hunk [y,n,q,a,d,e,>,<,p,P,?]? ?
...
> - go to the next file, roll over at the bottom
< - go to the previous file, roll over at the top
? - print help
```

Sinovda: `TODO` ning yagona hunk'iga `n` deganda Git keyingi faylga **o'tmadi**, o'sha hunk'ni `(was: n)` bilan qayta ko'rsatdi; `>` bilan `hisob.py` ga o'tildi, `<` bilan `TODO` ga qaytildi. Sessiya `q` bilan tugatiladi.

> Bu opsiya `git-add` ma'lumotnomasining v2.56.0 matnida hali tasvirlanmagan — uning mavjudligi `git add -h` chiqishi va reliz eslatmasidan tasdiqlangan.

**3. Boshqa o'zgarishlar (2.52).** `P` (pager orqali chiqarish) tugmasi ro'yxatda ko'rsatiladigan bo'ldi; `y` deb belgilangan hunk'ni keyin `s` bilan bo'lsangiz, bo'laklar endi "qaror qilinmagan" holatga qaytadi (avval hammasi tanlangan bo'lib qolardi); `q` va Ctrl-D (EOF) bir xil ishlaydi — ortiqcha ishsiz chiqadi.

## Kod: kontekst hajmini boshqarish — `-U` va `--inter-hunk-context`

Hunk'lar qanday bo'linishi kontekst qatorlari soniga bog'liq. `git add -p` diff opsiyalarini qabul qiladi:

- `-U<n>` / `--unified=<n>` — kontekst qatorlari soni (standart `diff.context` yoki 3);
- `--inter-hunk-context=<n>` — orasida `n` tagacha qator bo'lgan hunk'larni birlashtirish (standart `diff.interHunkContext` yoki 0).

Kontekstni 1 qatorga kamaytirsak, docstring va izoh o'rtasidagi masofa yetarli bo'lib, Git ularni boshidanoq alohida hunk qiladi — `s` kerak bo'lmaydi:

```text
$ git add -p -U1 hisob.py
...
@@ -1,2 +1,3 @@
...
(1/3) Stage this hunk [y,n,q,a,d,k,K,j,J,g,/,e,p,P,?]?
```

Kamroq kontekst — kichikroq hunk'lar, lekin patch qo'llanishi biroz "mo'rtroq" bo'ladi (kontekst — patch to'g'ri joyga tushganini tekshirish vositasi).

## Kod: yangi fayl va `add -N`

Patch rejimi index va working tree orasidagi farq bilan ishlaydi. Untracked fayl index'da yo'q — demak taqqoslanadigan narsa ham yo'q:

```bash
$ git add -p tajriba.py
No changes.
```

Yechim — **intent-to-add**: `git add -N` faylni index'ga "keyin qo'shiladi" degan bo'sh yozuv sifatida kiritadi. Shundan keyin u kuzatiladi va butun mazmuni hunk sifatida ko'rinadi:

```text
$ git add -N tajriba.py
$ git status -s
 M hisob.py
 A tajriba.py
$ git add -p tajriba.py
diff --git a/tajriba.py b/tajriba.py
new file mode 100644
index 0000000..ed7cda0
--- /dev/null
+++ b/tajriba.py
@@ -0,0 +1 @@
+print("salom")
(1/1) Stage addition [y,n,q,a,d,e,p,P,?]? y
$ git status -s
 M hisob.py
A  tajriba.py
```

` A` (bo'sh joy + A) — intent-to-add; `A ` — haqiqatda stage qilingan. Prompt matni ham o'zgaradi: `Stage addition`. Katta yangi faylning faqat bir qismini birinchi commit'ga kiritishda shu usul qo'l keladi.

## Kod: patch rejimining "qarindoshlari"

Bir xil hunk tanlash interfeysi boshqa buyruqlarda ham bor. Farq faqat **qaysi ikki holat taqqoslanishida** va **tanlangan hunk bilan nima qilinishida**. Prompt matni buni aniq aytadi:

| Buyruq | Taqqoslaydi | Prompt (sinovdan) | Amal |
| --- | --- | --- | --- |
| `git add -p` | index ↔ working tree | `Stage this hunk` | hunk index'ga qo'shiladi |
| `git restore -p` | index ↔ working tree | `Discard this hunk from worktree` | hunk working tree'dan **o'chiriladi** |
| `git restore --staged -p` | HEAD ↔ index | `Unstage this hunk` | hunk index'dan chiqariladi |
| `git reset -p` | HEAD ↔ index | `Unstage this hunk` | `restore --staged -p` bilan bir xil |
| `git stash push -p` | HEAD ↔ working tree | `Stash this hunk` | tanlanganlar stash'ga oladi (38-bob) |
| `git commit -p` | index ↔ working tree | `Stage this hunk` | tanlab, darhol commit qiladi |
| `git checkout -p` | index ↔ working tree | `Discard this hunk from worktree` | `restore -p` ning eski nomi |

`git restore -p` misoli — `DEBUG` qatorini tashlab, izohni qoldiramiz:

```text
$ git restore -p hisob.py
diff --git a/hisob.py b/hisob.py
index abdf516..114c681 100644
--- a/hisob.py
+++ b/hisob.py
@@ -4,7 +4,7 @@ def qoshish(a, b):
 ...
-    return a - b
+    return a - b  # natija manfiy bo'lishi mumkin
 ...
(1/2) Discard this hunk from worktree [y,n,q,a,d,k,K,j,J,g,/,e,p,P,?]? n
@@ -12,6 +12,7 @@ def kopaytirish(a, b):
 
 
 def bolish(a, b):
+    print("DEBUG", a, b)
     if b == 0:
         raise ZeroDivisionError("b nol bo'lmasin")
     return a / b
(2/2) Discard this hunk from worktree [y,n,q,a,d,K,J,g,/,e,p,P,?]? y
$ git diff --stat
 hisob.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
```

> **Ogohlantirish.** `restore -p` (va `checkout -p`) da `y` — **qaytarib bo'lmaydigan** amal: working tree'dagi o'sha o'zgarish hech qayerda saqlanmagan (commit ham, stash ham, blob ham yo'q). Reflog ham yordam bermaydi. Ishonchingiz komil bo'lmasa, avval `git stash push -p` bilan zaxiralang.

`git restore -p` ga `--source=<commit>` ham berish mumkin — u holda working tree istalgan commit bilan taqqoslanadi va o'sha commit'dagi holatga hunk-hunk qaytariladi. `-p` ning ma'lumotnomadagi tavsifi: "restore source va restore location orasidagi farqdan hunk tanlash".

Stage'dan qisman chiqarish:

```text
$ git add hisob.py
$ git status -s
M  hisob.py
?? tajriba.py
$ git restore --staged -p hisob.py
...
(1/1) Unstage this hunk [y,n,q,a,d,e,p,P,?]? y
$ git status -s
 M hisob.py
?? tajriba.py
```

`git reset -p` aynan shu natijani beradi (39-bobda `reset` ning yo'l bilan ishlatilishi batafsil).

Pro Git `git stash save --patch` deb yozadi — `stash save` eskirgan, hozir `git stash push -p` (38-bob). `git checkout --patch` ham ishlaydi, lekin yangi kodda `restore -p` aniqroq (11-bob).

### `git commit -p` dagi tuzoq

```text
$ git status -s
 M hisob.py
A  tajriba.py
$ git commit -p -m "ayirish: izoh"
...
(1/1) Stage this hunk [y,n,q,a,d,e,p,P,?]? y
[main 9162f4c] ayirish: izoh
 2 files changed, 2 insertions(+), 1 deletion(-)
 create mode 100644 tajriba.py
```

`commit -p` faqat siz tanlagan hunk'nigina emas, **index'da oldindan turgan hamma narsani** ham commit qiladi — bu yerda `tajriba.py` ham kirib ketdi. `commit -p` = "`add -p`, keyin `commit`". Oldin index toza ekanini `git status` bilan tekshiring.

## Kod: `git add -e` — butun diff'ni tahrirlash

`git add -e` (`--edit`) hunk tanlash bosqichini o'tkazib yuborib, faylning index'ga nisbatan **butun** diff'ini muharrirda ochadi. Yopilgach, Git hunk sarlavhalarini (`@@ ... @@` dagi qator sonlarini) o'zi to'g'rilaydi va patch'ni index'ga qo'llaydi. Qoidalar `e` tugmasi bilan bir xil. Ma'lumotnoma aytganidek, bu tanlovdan tezroq va moslashuvchanroq, lekin qo'llanmaydigan patch yasab qo'yish ham oson.

## Muhandislik nuqtai nazari: patch'ni tahrirlash qoidalari

`git-add` ma'lumotnomasining "EDITING PATCHES" bo'limi tahrirlarni uch toifaga ajratadi.

**Xavfsiz tahrirlar** — o'zgarishning bir qismini stage qilmaslik:

| Hunk'da ko'rganingiz | Stage qilmaslik uchun |
| --- | --- |
| `+` qator (qo'shilgan) | qatorni o'chiring |
| `-` qator (o'chirilgan) | `-` ni bo'sh joyga almashtiring |
| `-` keyin `+` (o'zgartirilgan) | `-` larni bo'sh joyga, `+` larni o'chiring. Juftlikning faqat yarmini o'zgartirish chalkash natija beradi |

**Ehtiyotkorlik talab qiladigan tahrirlar** — index'ga working tree'da **yo'q** narsani kiritish: kontekst qatorini `-` ga aylantirish (o'chirishni stage qilish), `+` qator matnini o'zgartirish, yangi `+` qator qo'shish. Patch faqat index'ga qo'llangani uchun bular working tree'da "teskari o'zgarish" bo'lib ko'rinadi: index'ga yangi qator qo'shsangiz, `git diff` uni working tree'da "o'chirilgan" deb ko'rsatadi. Ma'lumotnoma bulardan qochishni yoki juda ehtiyot bo'lishni maslahat beradi.

**Mumkin bo'lmagan tahrirlar** — patch'ni qo'llab bo'lmaydigan qiladi:

- yangi kontekst (` `) yoki `-` qator qo'shish;
- kontekst yoki `-` qatorni o'chirish;
- kontekst yoki `-` qator matnini o'zgartirish.

Sabab: kontekst va `-` qatorlar index'dagi **mavjud** matnni tasvirlaydi. Git ular orqali patch qayerga tushishini topadi; ular index'dagiga mos kelmasa — `patch does not apply`.

## Muhandislik nuqtai nazari: qachon interaktiv staging, qachon yo'q

**Qachon foydali:**

- Kod review'dan oldin aralash ishni mavzularga ajratish.
- Nosozlik izlash uchun qo'shilgan `print`/`console.log`ni commit'ga kiritmaslik.
- `git add .` o'rniga "nima qo'shayotganimni ko'raman" odati sifatida — `add -p` majburan har o'zgarishni ko'zdan kechirtiradi. Ko'p dasturchilar `git add -p` ni kundalik standart qilib oladi.

**Qachon kerak emas.** O'zgarishlar bir-biriga chambarchas bog'liq bo'lsa (bir funksiya nomini o'zgartirish va uni chaqirgan hamma joy), ularni bo'lish **ishlamaydigan** oraliq commit beradi. Atomar commit — "kichik" emas, "mantiqiy butun" degani.

**Agar commit'lar allaqachon yaratilgan bo'lsa** — interaktiv staging kech. U holda interaktiv rebase'dagi `edit` + `reset HEAD^` + `add -p` usuli bilan commit'ni bo'lasiz (25-bob).

**Sozlamalar:**

```ini
[interactive]
    singleKey = true        # y/n ni Enter'siz qabul qilish
    diffFilter = delta --color-only   # rangli diff'ni tashqi dastur orqali o'tkazish (misol)
```

- `interactive.singleKey` — bitta tugma bosilishi bilan javob qabul qilinadi. `add`, `checkout`, `restore`, `commit`, `reset`, `stash` ning `--patch` rejimida ishlaydi.
- `interactive.diffFilter` — rangli diff ko'rsatilganda u shu buyruq orqali o'tkaziladi. Shart: chiqishdagi qatorlar asl diff qatorlari bilan **birma-bir** mos qolishi kerak (Git hunk'larni qator raqami bo'yicha kuzatadi).
- `diff.context` va `diff.interHunkContext` — `-U` va `--inter-hunk-context` ning standart qiymatlari.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Faqat `git add .` ishlatish | Debug kodi, tasodifiy fayllar commit'ga tushadi | `git add -p` va `git status` bilan ko'rib qo'shish |
| `add -i` dagi `revert` ni `git revert` deb o'ylash | Bu faqat stage'dan chiqaradi, commit yaratmaydi | Stage'dan chiqarish: `revert` yoki `git restore --staged` |
| Eski raqam bilan tanlash (`Revert>> 4`) | Har ro'yxat qayta raqamlanadi, `Huh (4)?` | Har prompt'dagi ro'yxatni qayta o'qish |
| `e` da kontekst yoki `-` qatorni o'zgartirish | `patch does not apply`, tahrir behuda | Faqat `+` ni o'chirish, `-` ni bo'sh joyga almashtirish |
| `restore -p` da adashib `y` bosish | Working tree o'zgarishi butunlay yo'qoladi, tiklab bo'lmaydi | Avval `git stash push -p` yoki commit bilan zaxira |
| Untracked faylga `add -p` | `No changes.` — hech narsa bo'lmaydi | Avval `git add -N fayl` |
| `commit -p` dan oldin index'ni tekshirmaslik | Oldin stage qilingan narsa ham commit'ga kiradi | `git status` → kerak bo'lsa `git restore --staged` |
| Qisman stage'dan keyin testsiz commit | Index'dagi oraliq holat hech qachon ishga tushirilmagan | `git stash push --keep-index`, testlar, `git stash pop` |
| Bog'liq o'zgarishlarni ajratish | Oraliq commit kompilyatsiya bo'lmaydi, `bisect`ni buzadi | Mantiqiy butunlikni saqlash |

## Amaliyot

1. Vaqtinchalik repo'da bitta faylga bir-biridan uzoq uch o'zgarish qiling. `git add -p` bilan faqat ikkinchisini stage qiling, `git diff --cached` va `git diff` bilan natijani tekshiring.
2. `git add -i` ni oching: `update` bilan ikki faylni stage qiling, `revert` bilan birini qaytaring, `diff` bilan qolganini ko'ring. `Update>>` da `2-`, `*` va `-2` sintaksislarini sinab ko'ring.
3. Bir-biridan 2–3 qator uzoqdagi ikki o'zgarish yarating. `git add -p` da `s` bilan bo'ling. Keyin xuddi shuni `git add -p -U1` bilan qiling — `s` kerak bo'lmasligini tasdiqlang.
4. Qo'shni qatorlarda foydali o'zgarish va `print("DEBUG")` qo'shing. `e` bilan faqat foydali qatorni stage qiling.
5. Qisman stage'dan keyin `git ls-files -s fayl`, `git rev-parse HEAD:fayl` va `git hash-object fayl` hash'larini solishtiring. `git show :fayl` bilan index'dagi mazmunni o'qing va `git diff` sarlavhasidagi `index X..Y` bilan moslang.
6. Yangi fayl yarating, `git add -p` ning `No changes.` deyishini ko'ring, so'ng `git add -N` bilan uni hunk-hunk qo'shing.
7. `git add -p --no-auto-advance` bilan ikki faylda ishlang: birinchi faylga `n` deb, `>` bilan ikkinchisiga o'ting, `<` bilan qaytib, `(was: n)` belgisini ko'ring va fikringizni `y` ga o'zgartiring.
8. (Qiyinroq) `e` rejimida index'ga working tree'da yo'q yangi `+` qator qo'shing. Keyin `git diff` va `git diff --cached` ni ko'ring va ma'lumotnomadagi "o'zgarish working tree'da teskari ko'rinadi" degan ogohlantirishni o'z ko'zingiz bilan tushuntiring. Oxirida `git restore --staged fayl` bilan tozalang.

## Rasmiy hujjat

- Pro Git — Interactive Staging: <https://git-scm.com/book/en/v2/Git-Tools-Interactive-Staging>
- `git add` (INTERACTIVE MODE, EDITING PATCHES): <https://git-scm.com/docs/git-add>
- `git restore`: <https://git-scm.com/docs/git-restore>
- `git reset`: <https://git-scm.com/docs/git-reset>
- `git config` — `interactive.singleKey`, `interactive.diffFilter`: <https://git-scm.com/docs/git-config>
- Git 2.54 reliz eslatmalari: <https://github.com/git/git/blob/master/Documentation/RelNotes/2.54.0.adoc>
