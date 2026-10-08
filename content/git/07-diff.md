# 07 — `diff`: nima o'zgardi

[← Oldingi: O'zgarishlarni yozish: `status`, `add`, `commit`](06-ozgarishlarni-yozish.md) · [Mundarija](README.md) · [Keyingi: `.gitignore`, `rm` va `mv` →](08-gitignore-rm-mv.md)

## Tushuncha

`git status` **qaysi fayllar** o'zgarganini aytadi. Lekin ko'pincha bu yetmaydi: fayl ichida **aynan nima** o'zgardi — qaysi qator qo'shildi, qaysi biri o'chdi? Bu savolga `git diff` javob beradi. U ikki holatni solishtiradi va farqni **patch** (yamoq) ko'rinishida chiqaradi: `-` bilan boshlangan qator — eskida bor edi, yangida yo'q; `+` bilan boshlangan — yangida paydo bo'ldi; bo'shliq bilan boshlangan — o'zgarmagan, faqat mo'ljal uchun ko'rsatilgan (kontekst).

5-bobdagi uch hududni eslang:

```text
   working tree            index (staging)            HEAD (oxirgi commit)
  (diskdagi fayllar)    (keyingi commit qoralamasi)    (saqlangan snapshot)
         │                       │                            │
         └──── git diff ─────────┘                            │
                                 └──── git diff --staged ─────┘
         └──────────────────── git diff HEAD ─────────────────┘
```

Kundalik ishda `git diff` ikki savolga javob beradi (Pro Git shunday ta'riflaydi):

1. **Nimani o'zgartirdim, lekin hali stage qilmadim?** — `git diff` (working tree ↔ index).
2. **Nimani stage qildim, ya'ni keyingi commit'ga nima kiradi?** — `git diff --staged` (index ↔ HEAD).

Undan tashqari `git diff` istalgan ikki commit'ni, ikki branch'ni, ikki blob'ni va hatto Git'ga umuman aloqasi yo'q ikki faylni solishtira oladi. Bu bobda hammasini ko'ramiz, shuningdek patch formatining har bir qatori nimani anglatishini.

> **Muhim.** `git diff` hech narsani o'zgartirmaydi — u faqat o'qiydi. Uni xohlagancha ishlating.

## Nega shunday: nega `git diff` oxirgi commit'dan beri hamma narsani ko'rsatmaydi

Yangi boshlovchini eng ko'p chalg'itadigan narsa: faylni o'zgartirdingiz, `git add` qildingiz — va `git diff` **bo'sh** qaytdi. "O'zgarishim yo'qoldimi?" Yo'q.

Sabab — Git'da ikkita emas, **uchta** holat bor. Oddiy `git diff` working tree'ni **index** bilan solishtiradi, HEAD bilan emas. `git add` faylning yangi holatini index'ga yozadi (aniqrog'i, uning blob'ini yaratib, index yozuvini shu blob'ga yo'naltiradi — 15-bob). Endi working tree va index bir xil, ular orasida farq yo'q. Farq index bilan HEAD orasiga "ko'chdi" — uni `--staged` ko'rsatadi.

Bu dizayn ataylab shunday: `git diff` sizga "yana nimani `git add` qilishingiz **mumkin**"ligini ko'rsatadi (rasmiy hujjat aynan shunday deydi). Bitta faylning bir qismini stage qilib, qolganini keyinga qoldirsangiz (37-bob), ikkala diff birgalikda to'liq manzarani beradi.

## Kod: stage qilinmagan va stage qilingan o'zgarishlar

Sinov loyihasi — oddiy kalkulyator: `README.md`, `hisob.py`, `sozlama.ini`. Birinchi commit qilingan. Endi `README.md`ga qator qo'shib, uni stage qildik, `hisob.py`ni esa o'zgartirib, stage qilmadik:

```text
$ git status
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	modified:   README.md

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   hisob.py
```

> **Pro Git bilan farq.** Kitobdagi chiqishda `(use "git reset HEAD <file>..." to unstage)` va `git checkout -- <file>` yozilgan. Git 2.23 dan beri maslahatlar `git restore --staged` va `git restore` — 11-bobda batafsil. Kitobdagi `master` o'rniga bu yerda `main`.

**Stage qilinmagan o'zgarishlar** — argumentsiz `git diff`:

```diff
$ git diff
diff --git a/hisob.py b/hisob.py
index 6444213..6c51cef 100644
--- a/hisob.py
+++ b/hisob.py
@@ -9,11 +9,11 @@ def ayirish(a, b):
 
 
 def kopaytirish(a, b):
-    natija = a * b
+    natija = a * b  # ko'paytma
     return natija
 
 
 def bolish(a, b):
     if b == 0:
-        raise ValueError("nolga bo'lib bo'lmaydi")
+        raise ValueError("nolga bo'lish mumkin emas")
     return a / b
```

`README.md` bu yerda **yo'q** — u allaqachon stage qilingan. Uni ko'rish uchun:

```diff
$ git diff --staged
diff --git a/README.md b/README.md
index bb61231..e728dc0 100644
--- a/README.md
+++ b/README.md
@@ -1,3 +1,4 @@
 # Kalkulyator
 
 Oddiy hisob-kitob kutubxonasi.
+Python 3.10+ talab qilinadi.
```

`--staged` va `--cached` — **sinonimlar**, bir xil ishlaydi. `--cached` eski nom (index'ning eski nomi "cache" edi), `--staged` keyin qo'shilgan, eslab qolish osonroq.

Ikkalasini birga — oxirgi commit'dan beri **hamma** o'zgarishni — `git diff HEAD` ko'rsatadi:

```text
$ git diff HEAD
diff --git a/README.md b/README.md
...
+Python 3.10+ talab qilinadi.
diff --git a/hisob.py b/hisob.py
...
```

Rasmiy hujjatdagi qisqa xulosa:

| Buyruq | Nimani solishtiradi | Amaliy ma'nosi |
| --- | --- | --- |
| `git diff` | working tree ↔ index | hali stage qilinmagan o'zgarishlar |
| `git diff --cached` | index ↔ HEAD | `git commit` (`-a`siz) commit qiladigan narsa |
| `git diff HEAD` | working tree ↔ HEAD | `git commit -a` commit qiladigan narsa |
| `git diff AUTO_MERGE` | working tree ↔ avtomatik merge natijasi | konfliktni hal qilishda shu paytgacha qilgan tahrirlaringiz |

Repo'da hali birorta commit bo'lmasa (HEAD "tug'ilmagan" branch'ni ko'rsatsa), `git diff --cached` hamma stage qilingan narsani ko'rsatadi.

### Bitta faylning ikki holati

Pro Git'dagi muhim holat: faylni stage qilib, keyin **yana** o'zgartirish. Endi bitta fayl ikki joyda turli holatda:

```text
$ git add hisob.py
$ printf '\n\ndef daraja(a, n):\n    return a ** n\n' >> hisob.py
$ git status --short
M  README.md
MM hisob.py
```

`MM` — birinchi ustun (index ↔ HEAD) ham, ikkinchi ustun (working tree ↔ index) ham `M`. `git diff` faqat stage'dan keyingi qo'shimchani ko'rsatadi:

```diff
$ git diff
diff --git a/hisob.py b/hisob.py
index 6c51cef..6cc345d 100644
--- a/hisob.py
+++ b/hisob.py
@@ -17,3 +17,7 @@ def bolish(a, b):
     if b == 0:
         raise ValueError("nolga bo'lish mumkin emas")
     return a / b
+
+
+def daraja(a, n):
+    return a ** n
```

E'tibor bering: `index 6c51cef..` — chap tomondagi hash avvalgi diff'ning o'ng tomoni bilan bir xil. Bu index'dagi blob: siz `git add` qilgan holat. Uch holat statistikada aniq ko'rinadi:

```text
$ git diff --cached --stat
 README.md | 1 +
 hisob.py  | 4 ++--
 2 files changed, 3 insertions(+), 2 deletions(-)
$ git diff HEAD --stat
 README.md | 1 +
 hisob.py  | 8 ++++++--
 2 files changed, 7 insertions(+), 2 deletions(-)
```

Hozir `git commit` qilsangiz, `daraja()` funksiyasi commit'ga **kirmaydi** — u faqat diskda. Ikki commit qildik: avval stage qilingan qism, keyin `commit -a` bilan qolgani:

```text
$ git log --oneline
870427f daraja() funksiyasi qo'shildi
444dc5d Izoh va aniqroq xato xabari
0da34c3 Kalkulyatorning birinchi versiyasi
```

## Kod: patch formatini o'qish

Yuqoridagi birinchi diff'ni qatorma-qator tahlil qilamiz. Bu "unified diff" formati — Git uni `diff -u` an'anasidan olgan va biroz kengaytirgan.

```text
diff --git a/hisob.py b/hisob.py         ← 1. "git diff" sarlavhasi
index 6444213..6c51cef 100644           ← 2. kengaytirilgan sarlavha
--- a/hisob.py                          ← 3. eski fayl ("oldingi surat")
+++ b/hisob.py                          ← 3. yangi fayl ("keyingi surat")
@@ -9,11 +9,11 @@ def ayirish(a, b):    ← 4. hunk sarlavhasi
```

**1. `diff --git a/<fayl> b/<fayl>`.** `a/` — eski tomon, `b/` — yangi tomon. Nom faqat rename yoki nusxa bo'lganda farq qiladi. Rasmiy hujjat ta'kidlaydi: fayl yaratilganda yoki o'chirilganda ham bu qatorda `/dev/null` **ishlatilmaydi** (u faqat `---`/`+++` qatorlarida chiqadi).

**2. Kengaytirilgan sarlavha qatorlari.** Har doim emas, kerak bo'lganda chiqadi:

| Qator | Qachon |
| --- | --- |
| `index <hash>..<hash> <rejim>` | mazmun o'zgardi; ikki blob'ning qisqa hash'i, rejim o'zgarmagan bo'lsa — rejim |
| `old mode <rejim>` / `new mode <rejim>` | fayl rejimi o'zgardi (masalan bajariluvchi bo'ldi) |
| `new file mode <rejim>` | yangi fayl |
| `deleted file mode <rejim>` | o'chirilgan fayl |
| `rename from <yo'l>` / `rename to <yo'l>` | qayta nomlash aniqlandi |
| `copy from <yo'l>` / `copy to <yo'l>` | nusxa aniqlandi (`-C`) |
| `similarity index <N>%` | o'zgarmagan qatorlar ulushi (rename/copy uchun) |
| `dissimilarity index <N>%` | o'zgargan qatorlar ulushi (`-B` bilan to'liq qayta yozish) |

Rejim — 6 xonali sakkizlik son: `100644` oddiy fayl, `100755` bajariluvchi, `120000` symlink (15-bobda batafsil). `index` qatoridagi hash'lar — **blob obyektlari** (14-bob). Tekshirib ko'ramiz:

```text
$ git rev-parse --short HEAD:hisob.py
6444213
$ git hash-object hisob.py
6c51cef283be027924c5459591a66f93221b1cf8
```

Chap tomon — HEAD'dagi blob, o'ng tomon — diskdagi faylning mazmuni bo'yicha hisoblangan hash. Ya'ni diff ikki obyektni solishtirmoqda. O'xshashlik ko'rsatkichi butun songa **pastga** yaxlitlanadi; `100%` faqat aynan bir xil fayllar uchun saqlangan.

**3. `---` va `+++`.** An'anaviy unified diff sarlavhasi. Yangi faylda `--- /dev/null`, o'chirilganda `+++ /dev/null`.

**4. Hunk sarlavhasi `@@ -9,11 +9,11 @@ def ayirish(a, b):`.** **Hunk** — o'zgarishlar bo'lagi (bir-biriga yaqin o'zgarishlar va ularning konteksti). `-9,11` — eski faylda 9-qatordan boshlab 11 qator, `+9,11` — yangi faylda 9-qatordan 11 qator. Qator soni bir bo'lsa, `,1` tushirib qoldiriladi (`-12 +12`). Bo'sh faylda `-0,0`.

Oxiridagi `def ayirish(a, b):` — **funksiya konteksti**: hunk qaysi funksiya ichida ekanini topishga yordam beradi. Git uni hunk **boshlanishidan oldingi** qatorlardan qidiradi: standart qoida — harf, `_` yoki `$` bilan boshlanadigan oxirgi qator. Shu sababli bu yerda `def kopaytirish` emas, `def ayirish` turibdi — hunk 9-qatordan, ya'ni `kopaytirish`dan oldingi bo'sh qatorlardan boshlangan. Kontekstni kamaytirsak, natija o'zgaradi:

```diff
$ git diff -U0
diff --git a/hisob.py b/hisob.py
index 6444213..6c51cef 100644
--- a/hisob.py
+++ b/hisob.py
@@ -12 +12 @@ def kopaytirish(a, b):
-    natija = a * b
+    natija = a * b  # ko'paytma
@@ -18 +18 @@ def bolish(a, b):
-        raise ValueError("nolga bo'lib bo'lmaydi")
+        raise ValueError("nolga bo'lish mumkin emas")
```

Har bir til uchun bu qoidani `.gitattributes`dagi `diff=python` kabi drayverlar bilan aniqlashtirish mumkin ("Defining a custom hunk-header", 46-bob). README'dagi diff'da kontekst bo'sh edi (`@@ -1,3 +1,4 @@`): `# Kalkulyator` qatori `#` bilan boshlanadi, standart qoidaga mos kelmaydi.

**Qator prefikslari.** Hunk ichida: ` ` (bo'shliq) — kontekst, `-` — o'chirilgan, `+` — qo'shilgan. Fayl oxirida yangi qator belgisi bo'lmasa, Git `\ No newline at end of file` qatorini qo'shadi. Prefiks belgilarini `--output-indicator-new=`, `--output-indicator-old=`, `--output-indicator-context=` bilan almashtirish mumkin (kamdan-kam kerak).

**Fayl nomlaridagi g'ayrioddiy belgilar** (masalan kirill harflari, bo'shliq) `core.quotePath` sozlamasiga ko'ra qo'shtirnoq va sakkizlik kodlar bilan chiqariladi; `-z` bilan esa o'zgarishsiz (45-bob).

## Kod: kontekst miqdori

Standart kontekst — 3 qator (`diff.context` sozlamasi bilan o'zgartiriladi). `-U<n>` (`--unified=<n>`) uni boshqaradi:

```diff
$ git diff -U1
diff --git a/hisob.py b/hisob.py
index 6444213..6c51cef 100644
--- a/hisob.py
+++ b/hisob.py
@@ -11,3 +11,3 @@ def ayirish(a, b):
 def kopaytirish(a, b):
-    natija = a * b
+    natija = a * b  # ko'paytma
     return natija
@@ -17,3 +17,3 @@ def bolish(a, b):
     if b == 0:
-        raise ValueError("nolga bo'lib bo'lmaydi")
+        raise ValueError("nolga bo'lish mumkin emas")
     return a / b
```

Standart `-U3` da bitta hunk edi, `-U1` da ikkiga bo'lindi — chunki ular orasidagi qatorlar endi kontekstga sig'madi. Yaqin hunk'larni baribir birlashtirish uchun `--inter-hunk-context=<n>`: hunk'lar orasida `n` qatorgacha bo'lsa, ular qo'shiladi:

```text
$ git diff --inter-hunk-context=5 -U1
...
@@ -11,9 +11,9 @@ def ayirish(a, b):
...
```

`-W` (`--function-context`) esa kontekst sifatida **butun funksiyani** ko'rsatadi (funksiya chegarasi hunk sarlavhasi qoidasi bilan aniqlanadi). Kod review'da o'zgarishning qaysi funksiyaga tegishli ekanini to'liq ko'rish uchun qulay:

```diff
$ git diff -U0 -W
...
@@ -11,3 +11,3 @@ def ayirish(a, b):
 def kopaytirish(a, b):
-    natija = a * b
+    natija = a * b  # ko'paytma
     return natija
@@ -16,4 +16,4 @@ def kopaytirish(a, b):
 def bolish(a, b):
     if b == 0:
-        raise ValueError("nolga bo'lib bo'lmaydi")
+        raise ValueError("nolga bo'lish mumkin emas")
     return a / b
```

`-U0` so'radik, lekin `-W` funksiyalarni to'liq qaytardi.

> Tarixiy nozik joy: `-U` raqamsiz yozilsa, xatolik bermaydi — "tarixiy tasodif" tufayli `-p` sinonimi sifatida qabul qilinadi (rasmiy hujjat).

## Kod: qisqacha ko'rinishlar — `--stat` va boshqalar

Katta o'zgarishda avval umumiy manzara kerak: qaysi fayllar, qancha qator.

```text
$ git diff HEAD --stat
 README.md | 1 +
 hisob.py  | 4 ++--
 2 files changed, 3 insertions(+), 2 deletions(-)
```

`--stat` — **diffstat**: har fayl uchun o'zgargan qatorlar soni va `+`/`-` grafigi, oxirida jami. Kenglikni `--stat=<kenglik>[,<nom-kengligi>[,<son>]]` bilan cheklash mumkin; uchinchi raqam — nechta fayl ko'rsatilsin (qolgani `...`).

Boshqa qisqa formatlar (hammasi o'sha holat uchun):

```text
$ git diff HEAD --numstat
1	0	README.md
2	2	hisob.py
$ git diff HEAD --shortstat
 2 files changed, 3 insertions(+), 2 deletions(-)
$ git diff HEAD --name-only
README.md
hisob.py
$ git diff HEAD --name-status
M	README.md
M	hisob.py
```

| Opsiya | Nima chiqaradi | Kimga qulay |
| --- | --- | --- |
| `--stat` | fayl, son, grafik, jami | odam (umumiy manzara) |
| `--numstat` | `qo'shilgan<TAB>o'chirilgan<TAB>yo'l`, nom qisqartirilmaydi | skript |
| `--shortstat` | faqat jami qatori | skript, hisobot |
| `--name-only` | faqat yo'llar | skript (`xargs` bilan) |
| `--name-status` | holat harfi va yo'l | skript, tez ko'rish |
| `--summary` | yaratish, o'chirish, rename, rejim o'zgarishi | odam |
| `--compact-summary` | `--stat` + `(new)`, `(gone)`, `+x` belgilar | odam |
| `--dirstat` | o'zgarishning papkalar bo'yicha foiz taqsimoti | katta loyiha |
| `--raw` | ichki "raw" format (pastda) | plumbing, skript |
| `-p` + `--stat` | ikkalasi birga (`--patch-with-stat`) | review |

### Raw format

`--raw` — `git diff-index`, `git diff-files`, `git diff-tree` kabi past darajadagi (plumbing) buyruqlar formati:

```text
$ git diff HEAD --raw
:100644 100644 bb61231 e728dc0 M	README.md
:100644 100644 6444213 0000000 M	hisob.py
```

Chapdan o'ngga: `:`, eski rejim, yangi rejim, eski blob, yangi blob, holat harfi, TAB, yo'l. `hisob.py`ning yangi hash'i — `0000000`. Rasmiy hujjat sababini aytadi: "dst" working tree'dagi fayl bo'lib, u index bilan **sinxron bo'lmasa**, hash nollar bilan chiqadi — Git bu fayl uchun hali blob yaratmagan (yaratish uchun uni o'qib, hash hisoblash kerak; raw format esa arzon bo'lishi uchun buni qilmaydi). Yaratilgan faylda eski tomonda `000000` rejim va nol hash, o'chirilganda — yangi tomonda.

### Holat harflari

`--name-status`, `--raw` va `--diff-filter` bir xil harflardan foydalanadi:

| Harf | Ma'nosi |
| --- | --- |
| `A` | qo'shilgan (added) |
| `C` | nusxa (copied), ortidan o'xshashlik foizi: `C068` |
| `D` | o'chirilgan (deleted) |
| `M` | mazmun yoki rejim o'zgargan (modified) |
| `R` | qayta nomlangan (renamed), ortidan foiz: `R093` |
| `T` | tur o'zgargan: oddiy fayl ↔ symlink ↔ submodule |
| `U` | merge qilinmagan (konflikt hal qilinmagan) |
| `X` | noma'lum — rasmiy hujjatga ko'ra "ehtimol xato, xabar bering" |

## Kod: so'z darajasidagi diff

Matn (hujjat, Markdown) yoki uzun qatorlarda qator darajasidagi diff noqulay: bitta so'z o'zgarsa ham butun qator `-`/`+` bo'ladi. `--word-diff` o'zgarishni **so'z** darajasida ko'rsatadi:

```text
$ git diff --word-diff -U0
diff --git a/hisob.py b/hisob.py
index 6444213..6c51cef 100644
--- a/hisob.py
+++ b/hisob.py
@@ -12 +12 @@ def kopaytirish(a, b):
    natija = a * b  {+# ko'paytma+}
@@ -18 +18 @@ def bolish(a, b):
        raise ValueError("nolga [-bo'lib bo'lmaydi")-]{+bo'lish mumkin emas")+}
```

`[-...-]` — o'chirilgan, `{+...+}` — qo'shilgan. Bu `plain` rejim (standart). Boshqa rejimlar:

| Rejim | Ko'rinishi |
| --- | --- |
| `--word-diff=plain` | `[-eski-]{+yangi+}` — belgilar ekranlanmaydi, matnda `[-` uchrasa chalkash bo'lishi mumkin |
| `--word-diff=color` | faqat rang bilan (qizil/yashil) — terminalda o'qish uchun eng qulay |
| `--word-diff=porcelain` | skriptlar uchun qatorli format (pastda) |
| `--word-diff=none` | so'z diff'ini qayta o'chirish |
| `--color-words` | `--word-diff=color` ning qisqa yozuvi |

```text
$ git diff --word-diff=porcelain -U0
...
@@ -18 +18 @@ def bolish(a, b):
         raise ValueError("nolga 
-bo'lib bo'lmaydi")
+bo'lish mumkin emas")
~
```

Porcelain'da har bo'lak alohida qatorda, prefiks `-`/`+`/` `, asl matndagi yangi qator esa alohida `~` qatori bilan belgilanadi.

**"So'z" nima?** Standart — bo'shliq bo'lmagan belgilar ketma-ketligi. `--word-diff-regex=<regex>` buni o'zgartiradi (va `--word-diff`ni o'zi yoqadi). Masalan, `.` — har belgi alohida "so'z":

```text
$ git diff --word-diff-regex=. -U0 | tail -2
@@ -18 +18 @@ def bolish(a, b):
        raise ValueError("nolga bo'li[-b-]{+sh+} [-bo'l-]m[-ayd-]{+umk+}i{+n emas+}")
```

Rasmiy hujjatdagi ikki "(!)" ogohlantirish: regex'ga mos kelmagan hamma narsa bo'shliq hisoblanadi va **e'tiborsiz qoldiriladi**; regex moslamasi yangi qatorni o'z ichiga olsa, u jimgina kesiladi. Shuning uchun maxsus regex oxiriga `|[^[:space:]]` qo'shish tavsiya etiladi. Regex'ni `diff.wordRegex` sozlamasi yoki `.gitattributes` drayveri orqali ham berish mumkin; buyruq qatoridagi ustun.

`--word-diff` alohida algoritm emas: Git avval oddiy qator diff'ini oladi, keyin har hunk ichida so'zlarni solishtiradi. Shu sababli natija maxsus so'z-diff asboblaridan kattaroq chiqishi mumkin.

## Kod: whitespace — bo'shliqlarni e'tiborsiz qoldirish va tekshirish

Bo'shliq o'zgarishlari (qator oxiridagi ortiqcha probellar, chekinish) diff'ni "ifloslaydi". Uch xil o'zgarish kiritdik: 2-qatorga oxirida 3 ta probel, 7-qatorda probellar soni oshdi, 12-qatorda probellar umuman olib tashlandi:

```diff
$ git diff -U0
diff --git a/hisob.py b/hisob.py
index 6cc345d..5ccaae9 100644
--- a/hisob.py
+++ b/hisob.py
@@ -2 +2 @@ def qoshish(a, b):
-    natija = a + b
+    natija = a + b   
@@ -7 +7 @@ def ayirish(a, b):
-    natija = a - b
+    natija  =  a - b
@@ -12 +12 @@ def kopaytirish(a, b):
-    natija = a * b  # ko'paytma
+    natija=a*b  # ko'paytma
```

Uch daraja e'tiborsizlik:

```text
$ git diff -U0 --ignore-space-at-eol
...
@@ -7 +7 @@ def ayirish(a, b):
...
@@ -12 +12 @@ def kopaytirish(a, b):
...
$ git diff -U0 -b
...
@@ -12 +12 @@ def kopaytirish(a, b):
-    natija = a * b  # ko'paytma
+    natija=a*b  # ko'paytma
$ git diff -U0 -w
$ git diff -w --quiet; echo $?
0
```

| Opsiya | Nimani e'tiborsiz qoldiradi | Misolda qolgan hunk'lar |
| --- | --- | --- |
| `--ignore-space-at-eol` | faqat qator oxiridagi bo'shliq | 7, 12 |
| `-b`, `--ignore-space-change` | qator oxiri + bo'shliqlar **soni** (bir yoki ko'p bo'shliq teng) | 12 |
| `-w`, `--ignore-all-space` | hamma bo'shliq, hatto biri bo'lib, biri bo'lmasa ham | yo'q |
| `--ignore-cr-at-eol` | qator oxiridagi `\r` (Windows qator oxiri) | — |
| `--ignore-blank-lines` | faqat bo'sh qatorlardan iborat o'zgarishlar | — |
| `-I<regex>` | hamma qatori regex'ga mos o'zgarishlar | — |

> **Ehtiyot bo'ling.** `-w` faqat **ko'rsatishni** o'zgartiradi, faylni emas. `git diff -w` bo'sh qaytsa ham, `git commit` bo'shliq o'zgarishlarini baribir yozadi. Python, YAML, Makefile kabi joylarda chekinish ma'noga ega — u yerda `-w` haqiqiy xatoni yashirishi mumkin.

**`--check` — whitespace xatolarini topish.** Commit'dan oldin ishlatish uchun:

```text
$ git diff --check; echo $?
hisob.py:2: trailing whitespace.
+    natija = a + b   
2
```

Standart holatda xato hisoblanadi: qator oxiridagi bo'shliq (faqat bo'shliqdan iborat qator ham) va boshlang'ich chekinishda tabdan oldin turgan probel. Ro'yxat `core.whitespace` sozlamasi bilan boshqariladi (45-bob). Muammo topilsa, chiqish kodi noldan farqli — shuning uchun `--check`ni pre-commit hook'ga qo'yish mumkin (47-bob). U **konflikt belgilarini** ham topadi (pastda ko'ramiz). `--check` `--exit-code` bilan birga ishlamaydi.

## Kod: commit'lar va branch'larni solishtirish

Ikki commit orasidagi farq — `git diff <commit> <commit>`:

```diff
$ git diff 870427f 8c95e03
diff --git a/README.md b/README.md
index e728dc0..d02a2b4 100644
--- a/README.md
+++ b/README.md
@@ -2,3 +2,7 @@
 
 Oddiy hisob-kitob kutubxonasi.
 Python 3.10+ talab qilinadi.
+
+## Litsenziya
+
+MIT
```

Commit'ni hash, branch nomi, `HEAD~2`, `HEAD^` kabi yozish mumkin (19-bob). Bitta commit berilsa — u bilan **working tree** solishtiriladi (`git diff HEAD`, `git diff main`). Yo'l bilan cheklash — `--` dan keyin:

```text
$ git diff 0da34c3 870427f --stat
 README.md | 1 +
 hisob.py  | 8 ++++++--
 2 files changed, 7 insertions(+), 2 deletions(-)
```

Rasmiy hujjat misollari:

```bash
git diff test             # working tree ↔ "test" branch'ining uchi
git diff HEAD -- ./test   # working tree ↔ HEAD, faqat "test" fayli
git diff HEAD^ HEAD       # oxirgi commit nima o'zgartirdi
```

`HEAD^ HEAD` ko'p ishlatiladi, lekin bitta commit'ni ko'rishning odatiy yo'li — `git show <commit>` (9-bob): u commit ma'lumoti va patch'ni birga beradi.

### Ikki nuqta va uch nuqta

`main` va `yangi-tuzilma` branch'lari `870427f`da ajralgan:

```text
$ git log --oneline --graph --all
* 8c95e03 README: litsenziya
| * 76475de Fayllar src/ ga ko'chirildi
|/  
* 870427f daraja() funksiyasi qo'shildi
* 444dc5d Izoh va aniqroq xato xabari
* 0da34c3 Kalkulyatorning birinchi versiyasi
```

`yangi-tuzilma`da: `hisob.py` → `src/hisob.py`, yangi `ishga-tushir.sh`, `sozlama.ini` o'chirildi. `main`da: README'ga litsenziya qo'shildi. Endi "branch'da nima qilindi?" deb so'raymiz:

```text
$ git diff main yangi-tuzilma --name-status
M	README.md
A	ishga-tushir.sh
D	sozlama.ini
R100	hisob.py	src/hisob.py
$ git diff main yangi-tuzilma --stat
 README.md                | 4 ----
 ishga-tushir.sh          | 2 ++
 sozlama.ini              | 3 ---
 hisob.py => src/hisob.py | 0
 4 files changed, 2 insertions(+), 7 deletions(-)
```

`README.md | 4 ----` — go'yo branch litsenziyani **o'chirgan**. Aslida branch README'ga tegmagan; bu `main`da keyin qo'shilgan qatorlar. Ikki uchni to'g'ridan-to'g'ri solishtirish ikkala tomondagi o'zgarishlarni aralashtiradi. Branch'ning **o'z** o'zgarishlari kerak bo'lsa — uch nuqta:

```text
$ git diff main...yangi-tuzilma --name-status
A	ishga-tushir.sh
D	sozlama.ini
R100	hisob.py	src/hisob.py
$ git merge-base main yangi-tuzilma
870427f75e4aa9a589e761a18ad65d1afd16e1f7
```

`git diff A...B` = `git diff $(git merge-base A B) B` — umumiy ajdod (**merge-base**, 21-bob) bilan B solishtiriladi. Bu pull request'dagi "Files changed" ko'rinishiga mos keladi. Xuddi shuni `--merge-base` opsiyasi bilan ham yozish mumkin:

```text
$ git diff --merge-base main yangi-tuzilma --name-status
A	ishga-tushir.sh
D	sozlama.ini
R100	hisob.py	src/hisob.py
```

| Yozuv | Nima solishtiriladi |
| --- | --- |
| `git diff A B` | A uchi ↔ B uchi |
| `git diff A..B` | xuddi `A B` bilan bir xil |
| `git diff ..B` | `HEAD B` (bo'sh tomon = `HEAD`) |
| `git diff A...B` | merge-base(A, B) ↔ B |
| `git diff --merge-base A B` | xuddi `A...B` |
| `git diff --merge-base A` | merge-base(A, HEAD) ↔ working tree |
| `git diff --cached --merge-base A` | merge-base(A, HEAD) ↔ index |

> **Diqqat: bu yerda `..` va `...` `git log`dagidan boshqa ma'noda.** Rasmiy hujjat aniq aytadi: `diff` ikki **nuqtani** (endpoint) solishtiradi, diapazonni emas. `git log A..B` — "B'da bor, A'da yo'q commit'lar" (19-bob), `git diff A..B` esa shunchaki ikki snapshot farqi. `git diff A...B` ning ma'nosi `git log A...B` (simmetrik farq) ga ham to'g'ri kelmaydi.

## Kod: yaratish, o'chirish, rename va rejim o'zgarishi

`yangi-tuzilma` branch'ining to'liq patch'i — kengaytirilgan sarlavhalarning hammasi bir joyda:

```diff
$ git diff main...yangi-tuzilma
diff --git a/ishga-tushir.sh b/ishga-tushir.sh
new file mode 100755
index 0000000..1363ea0
--- /dev/null
+++ b/ishga-tushir.sh
@@ -0,0 +1,2 @@
+#!/bin/sh
+python3 -m src.hisob
diff --git a/sozlama.ini b/sozlama.ini
deleted file mode 100644
index a25dd3a..0000000
--- a/sozlama.ini
+++ /dev/null
@@ -1,3 +0,0 @@
-[app]
-nom = kalkulyator
-versiya = 1.0
diff --git a/hisob.py b/src/hisob.py
similarity index 100%
rename from hisob.py
rename to src/hisob.py
```

Mazmuni o'zgarmagan rename'da `index` qatori ham, hunk ham yo'q — faqat "qayerdan, qayerga". Qisqacha ko'rinishlar:

```text
$ git diff main...yangi-tuzilma --summary
 create mode 100755 ishga-tushir.sh
 delete mode 100644 sozlama.ini
 rename hisob.py => src/hisob.py (100%)
$ git diff main...yangi-tuzilma --compact-summary
 ishga-tushir.sh (new +x) | 2 ++
 sozlama.ini (gone)       | 3 ---
 hisob.py => src/hisob.py | 0
 3 files changed, 2 insertions(+), 3 deletions(-)
```

**Faqat rejim o'zgarsa** (fayl bajariluvchi qilinsa):

```text
$ chmod +x hisob.py
$ git diff
diff --git a/hisob.py b/hisob.py
old mode 100644
new mode 100755
$ git diff --summary
 mode change 100644 => 100755 hisob.py
```

Git faqat bajarish bitini kuzatadi (`100644` yoki `100755`), boshqa ruxsatlarni emas (15-bob).

### Rename qanday aniqlanadi

8-bobda aytilganidek, Git rename'ni **saqlamaydi** — har safar diff vaqtida "o'chirilgan + qo'shilgan" juftliklarni solishtirib, **hisoblaydi**. Shuning uchun bu diff opsiyasi:

```text
$ git mv hisob.py kalkulyator.py
$ sed -i '' 's/return a \*\* n/return pow(a, n)/' kalkulyator.py
$ git add kalkulyator.py
$ git diff --cached
diff --git a/hisob.py b/kalkulyator.py
similarity index 93%
rename from hisob.py
rename to kalkulyator.py
index 6cc345d..12b6377 100644
--- a/hisob.py
+++ b/kalkulyator.py
@@ -20,4 +20,4 @@ def bolish(a, b):
 
 
 def daraja(a, n):
-    return a ** n
+    return pow(a, n)
$ git diff --cached --name-status
R093	hisob.py	kalkulyator.py
$ git diff --cached -M95% --name-status
D	hisob.py
A	kalkulyator.py
```

(`sed -i ''` — macOS sintaksisi; Linux'da `sed -i`.)

O'xshashlik 93% — standart chegara 50% dan yuqori, rename. `-M95%` bilan chegara oshirildi, 93% yetmadi — natija "o'chirildi + qo'shildi".

| Opsiya | Ma'nosi |
| --- | --- |
| `-M[<n>]`, `--find-renames` | rename'ni aniqlash; `n` — o'xshashlik chegarasi. `-M90%`; `%`siz raqam kasr: `-M5` = 50%, `-M05` = 5%; `-M100%` — faqat aynan bir xil |
| `--no-renames` | rename aniqlashni o'chirish (sozlamadan qat'i nazar) |
| `-C[<n>]`, `--find-copies` | nusxalarni ham aniqlash — manba **shu o'zgarishda o'zgargan** fayl bo'lsagina |
| `--find-copies-harder` | o'zgarmagan fayllarni ham nusxa manbai deb ko'rish. Katta loyihada **juda qimmat** |
| `-B[<n>][/<m>]` | to'liq qayta yozilgan faylni "o'chirish + yaratish" juftiga bo'lish; `-M` bilan birga bunday fayl rename manbai ham bo'la oladi |
| `-l<son>` | rename qidirishning to'liq (O(N²)) bosqichini fayllar soni chegaradan oshsa o'tkazib yuborish; standart — `diff.renameLimit` |
| `-D`, `--irreversible-delete` | o'chirilgan fayl mazmunini chiqarmaslik — faqat o'qish uchun, bunday patch'ni qo'llab bo'lmaydi |

`git diff` va `git log` uchun rename aniqlash standart holatda **yoqilgan** (`diff.renames=true`). Plumbing buyruqlari (`git diff-files` va boshqalar) esa bu sozlamaga qaramaydi.

```text
$ git diff main...yangi-tuzilma --no-renames --name-status
D	hisob.py
A	ishga-tushir.sh
D	sozlama.ini
A	src/hisob.py
```

## Kod: fayllarni turi bo'yicha saralash — `--diff-filter`

`--diff-filter` faqat berilgan turdagi fayllarni qoldiradi; kichik harf — o'sha turni **chiqarib tashlash**:

```text
$ git diff 870427f 7645692 --diff-filter=A --name-status
A	logo.png
$ git diff 870427f 7645692 --diff-filter=a --name-status
M	README.md
```

`--diff-filter=MRC` — faqat o'zgartirilgan, qayta nomlangan va nusxalangan (rasmiy misol). Oxiriga `*` qo'shilsa — "hammasi yoki hech narsa": kamida bitta fayl mos kelsa, hamma fayllar chiqadi. 8-bobda o'chirilgan fayllarni stage qilish uchun `git diff --name-only --diff-filter=D -z | xargs -0 git rm --cached` ishlatgan edik — bu aynan shu opsiya.

## Kod: yangi va binar fayllar

**Untracked fayl `git diff`da ko'rinmaydi** — u index'da yo'q, solishtiradigan narsa yo'q. Lekin uni `git add -N` (`--intent-to-add`) bilan "keyin qo'shaman" deb belgilasangiz, ko'rinadi:

```text
$ printf "yangi g'oya\n" > goyalar.txt
$ git diff
$ git add -N goyalar.txt
$ git status --short
 A goyalar.txt
$ git diff
diff --git a/goyalar.txt b/goyalar.txt
new file mode 100644
index 0000000..76e3223
--- /dev/null
+++ b/goyalar.txt
@@ -0,0 +1 @@
+yangi g'oya
$ git diff --cached --stat
```

`-N` index'ga **bo'sh** yozuv qo'yadi (mazmunsiz): `git diff` uni yangi fayl sifatida ko'rsatadi, `git diff --cached` esa hech narsa ko'rsatmaydi. Bu `git add -p` bilan yangi faylning faqat bir qismini stage qilish uchun ham kerak (37-bob).

**Binar fayllar.** Rasm, arxiv kabi fayllarda qator tushunchasi yo'q. Git ularni (mazmuniga qarab) binar deb aniqlaydi va matn diff'ini chiqarmaydi:

```text
$ git diff
diff --git a/logo.png b/logo.png
index c8b49c8..991c98a 100644
Binary files a/logo.png and b/logo.png differ
$ git diff --stat
 logo.png | Bin 1024 -> 1024 bytes
 1 file changed, 0 insertions(+), 0 deletions(-)
$ git diff --numstat
-	-	logo.png
```

`--numstat`da binar fayl uchun `0 0` emas, `- -` — "qatorlarni sanab bo'lmaydi". Qo'shimcha imkoniyatlar:

- `--binary` — `git apply` qo'llay oladigan binar patch chiqarish (`--full-index`ni ham yoqadi);
- `-a`, `--text` — hamma faylni matn deb ko'rish;
- `.gitattributes`dagi **textconv** — binar faylni matnga aylantirib (masalan `.docx`dan matn, rasmdan EXIF) diff olish. Bunday diff faqat o'qish uchun, qo'llab bo'lmaydi; shuning uchun textconv standart holatda faqat `git diff` va `git log`da ishlaydi (46-bob).

## Kod: blob'lar va Git'dan tashqaridagi fayllar

**Ikki blob** — `<commit>:<yo'l>` yoki to'g'ridan-to'g'ri hash bilan:

```text
$ git diff 0da34c3:hisob.py 870427f:hisob.py --stat
 hisob.py | 8 ++++++--
 1 file changed, 6 insertions(+), 2 deletions(-)
$ git diff 6444213 6cc345d --stat
 6444213 => 6cc345d | 8 ++++++--
 1 file changed, 6 insertions(+), 2 deletions(-)
```

Ikkinchisida fayl nomi yo'q — blob o'zi nomni bilmaydi (14-bob), shuning uchun hash'lar chiqdi.

**Git'dan tashqaridagi ikki fayl** — `--no-index`:

```text
$ git diff --no-index ../07-diff-tashqi/eski.txt ../07-diff-tashqi/yangi.txt; echo $?
diff --git a/../07-diff-tashqi/eski.txt b/../07-diff-tashqi/yangi.txt
index de98044..7be73ce 100644
--- a/../07-diff-tashqi/eski.txt
+++ b/../07-diff-tashqi/yangi.txt
@@ -1,3 +1,3 @@
 a
-b
+B
 c
1
```

Bu oddiy `diff -u` o'rnini bosadi, lekin Git'ning hamma imkoniyati bilan (`--word-diff`, `--stat`, rang). Repo tashqarisida yoki yo'llardan biri working tree tashqarisida bo'lsa, `--no-index`ni yozmasa ham bo'ladi. Bu shakl `--exit-code`ni avtomatik yoqadi — farq bo'lsa `1`.

## Kod: diff chiqish kodi va skriptlar

Standart holatda `git diff` farq bo'lsa ham, bo'lmasa ham `0` bilan chiqadi. Skriptda "o'zgarish bormi?" degan savol uchun:

```text
$ git diff --exit-code; echo $?
0
$ git diff --quiet HEAD~1; echo $?
1
```

- `--exit-code` — `diff(1)` kabi: farq bo'lsa `1`, bo'lmasa `0`.
- `--quiet` — hech narsa chiqarmaydi va `--exit-code`ni yoqadi. Chiqish kodiga ishonib bo'lmaydigan tashqi diff yordamchilarini ham ishga tushirmaydi.

```bash
# commit qilinmagan o'zgarish bo'lsa, deploy qilmaslik
if ! git diff --quiet HEAD; then
  echo "Commit qilinmagan o'zgarishlar bor" >&2
  exit 1
fi
```

Boshqa skript uchun foydali opsiyalar: `-z` (NUL ajratuvchi — g'alati fayl nomlari uchun xavfsiz), `--output=<fayl>` (stdout o'rniga faylga), `--relative[=<papka>]` (faqat shu papkadagi o'zgarishlar va unga nisbatan yo'llar), `-O<fayl>` (fayllar tartibi — masalan avval header'lar, keyin `.c`), `--src-prefix`/`--dst-prefix`/`--no-prefix` (`a/` `b/` o'rniga), `--full-index` (to'liq hash'lar), `--abbrev=<n>`.

## Kod: patch — diff'ni faylga yozish, qaytarish va qo'llash

Diff — shunchaki matn. Uni faylga saqlab, boshqa joyda qo'llash mumkin:

```text
$ git diff 870427f 8c95e03 > ../07-litsenziya.patch
$ git apply --stat ../07-litsenziya.patch
 README.md |    4 ++++
 1 file changed, 4 insertions(+)
$ git apply --check -R ../07-litsenziya.patch
$ git apply -R ../07-litsenziya.patch
$ git diff --stat
 README.md | 4 ----
 1 file changed, 4 deletions(-)
```

`git apply --check` — qo'llash mumkinligini tekshiradi, hech narsa o'zgartirmaydi. `-R` — teskari qo'llash (o'zgarishni bekor qilish). `git diff`ning o'zida ham `-R` bor — kirishlarni almashtiradi:

```text
$ git diff -R 870427f 8c95e03
...
 Python 3.10+ talab qilinadi.
-
-## Litsenziya
-
-MIT
```

Patch'larni email orqali almashish (`format-patch`, `am`) — 33- va 34-boblarda.

Rasmiy hujjatdagi nozik joy: patch'dagi barcha "a/" fayllar o'zgarishdan **oldingi**, barcha "b/" fayllar **keyingi** holatga tegishli. Uni fayl-fayl ketma-ket qo'llash noto'g'ri — masalan, `a`→`b` va `b`→`a` rename'lari birga ikki faylni **almashtiradi**, ketma-ket qo'llansa esa birinchisi ikkinchisini buzadi.

## Muhandislik nuqtai nazari: diff algoritmlari

Bir xil ikki fayl uchun to'g'ri diff'lar ko'p bo'lishi mumkin — qaysi qatorlarni "o'zgarmagan" deb tanlash algoritmga bog'liq. Git'da to'rtta:

| Algoritm | Xususiyati |
| --- | --- |
| `myers` (standart) | asosiy "ochko'z" algoritm, tez |
| `minimal` | eng kichik diff'ni topish uchun qo'shimcha vaqt sarflaydi |
| `patience` | faqat bir marta uchraydigan qatorlarni tayanch qiladi — kod bloklari ko'chganda ko'pincha o'qishliroq |
| `histogram` | patience'ning kengaytmasi, "kam uchraydigan umumiy elementlarni" ham qo'llaydi |

Tanlash: `--diff-algorithm=<nom>`, `--patience`, `--histogram`, `--minimal`, doimiy — `diff.algorithm` sozlamasi (45-bob). Sozlamada boshqasi tanlangan bo'lsa, standartga qaytish uchun `--diff-algorithm=default`.

Yana bir vosita — `--anchored=<matn>`: shu matn bilan boshlanadigan (ikkala faylda bir martadan uchraydigan) qatorni "o'zgarmagan" qilib ushlab qolishga harakat qiladi. Ikki funksiyaning o'rnini almashtirdik:

```diff
$ git diff --no-index c1.c c2.c
...
@@ -1,9 +1,9 @@
-void a()
+void b()
 {
-    x();
+    y();
 }
 
-void b()
+void a()
 {
-    y();
+    x();
 }
$ git diff --no-index --anchored='void a' c1.c c2.c
...
@@ -1,9 +1,9 @@
+void b()
+{
+    y();
+}
+
 void a()
 {
     x();
 }
-
-void b()
-{
-    y();
-}
```

Birinchisi texnik jihatdan to'g'ri, lekin "ikki funksiya ichi o'zgardi" deb aldaydi. Ikkinchisi haqiqatni aytadi: `b()` ko'chdi.

**Indent heuristic** (`--indent-heuristic`, standart yoqilgan) — hunk chegaralarini chekinishga qarab siljitib, qo'shilgan blokni funksiya chegarasiga moslaydi. Uni `--no-indent-heuristic` bilan o'chirish mumkin.

**Ko'chirilgan kodni ranglash** — `--color-moved[=<rejim>]`: bir joydan o'chib, boshqa joyga qo'shilgan qatorlar alohida rangda ko'rinadi (`plain`, `blocks`, `zebra` — standart, `dimmed-zebra`). `--color-moved-ws=` ko'chishni aniqlashda bo'shliqni qanday e'tiborsiz qoldirishni belgilaydi (`allow-indentation-change` — chekinishi o'zgargan blokni ham ko'chgan deb biladi). Refactoring review'da juda foydali; doimiy — `diff.colorMoved`.

> Rasmiy hujjat ogohlantiradi: algoritm, `--word-diff` va heuristikalar kelajakda o'zgarishi mumkin, shuning uchun diff **chiqishiga** tayangan skript yozmang — `--numstat`, `--raw`, `-z` kabi barqaror formatlardan foydalaning.

## Kod: `git difftool` — tashqi dastur bilan ko'rish

Grafik yoki boshqa diff dasturini afzal ko'rsangiz, `git diff` o'rniga `git difftool`. U `git diff`ning **hamma** opsiya va argumentlarini qabul qiladi, faqat natijani tashqi dasturda ochadi. Mavjud asboblar:

```text
$ git difftool --tool-help
'git difftool --tool=<tool>' may be set to one of the following:
		opendiff         Use FileMerge (requires a graphical session)
		vimdiff          Use Vim

The following tools are valid, but not currently available:
		araxis           Use Araxis Merge (requires a graphical session)
		bc               Use Beyond Compare (requires a graphical session)
...
		meld             Use Meld (requires a graphical session)
		nvimdiff         Use Neovim
...
		vscode           Use Visual Studio Code (requires a graphical session)
...
```

Birinchi ro'yxat — shu kompyuterda o'rnatilganlar (natija sizda boshqacha bo'ladi). Asbobni tanlash:

```bash
git difftool -t vimdiff              # bir martalik
git config --global diff.tool meld   # doimiy
```

Standart holatda har fayl oldidan so'raydi (`Launch 'diff -u' [Y/n]?`); `-y` (`--no-prompt`) so'ramaydi. Ro'yxatda yo'q dasturni ishlatish uchun `-x` (`--extcmd`) — u `<buyruq> $LOCAL $REMOTE` tarzida chaqiriladi:

```text
$ sed -i '' 's/versiya = 1.0/versiya = 1.1/' sozlama.ini
$ git difftool -y -x 'diff -u'
--- /tmp/misol/git-blob-hfqW9R/sozlama.ini	2026-10-08 07:28:12
+++ sozlama.ini	2026-10-08 07:28:05
@@ -1,3 +1,3 @@
 [app]
 nom = kalkulyator
-versiya = 1.0
+versiya = 1.1
```

Yoki o'z asbobingizni `difftool.<nom>.cmd` bilan ta'riflang. Buyruq ichida o'zgaruvchilar mavjud: `$LOCAL` — eski holat yozilgan vaqtinchalik fayl, `$REMOTE` — yangi holat, `$MERGED` — solishtirilayotgan faylning nomi, `$BASE` — moslik uchun, `$MERGED` bilan bir xil:

```text
$ git -c difftool.yonma.cmd='diff -y -W 50 "$LOCAL" "$REMOTE"' difftool -y -t yonma
[app]			[app]
nom = kalkulyator	nom = kalkulyator
versiya = 1.0	      |	versiya = 1.1
$ git -c difftool.korsat.cmd='echo "LOCAL=$LOCAL REMOTE=$REMOTE MERGED=$MERGED"' difftool -y -t korsat
LOCAL=/tmp/misol/git-blob-TyVvTV/sozlama.ini REMOTE=sozlama.ini MERGED=sozlama.ini
```

Bu yerda `REMOTE` — working tree'dagi faylning o'zi (vaqtinchalik nusxa emas): working tree bilan solishtirganda Git uni to'g'ridan-to'g'ri beradi, shuning uchun asbobda tahrirlasangiz, o'zgarish faylga yoziladi.

Doimiy sozlama shunday ko'rinadi:

```ini
[diff]
	tool = yonma
[difftool "yonma"]
	cmd = diff -y -W 50 \"$LOCAL\" \"$REMOTE\"
[difftool]
	prompt = false
```

**`-d` (`--dir-diff`)** — fayllarni bittalab emas, ikki vaqtinchalik **papka** (`left/`, `right/`) yaratib, asbobni bir marta ishga tushiradi. Ko'p faylli o'zgarishni grafik asbobda ko'rish uchun qulay:

```text
$ git -c difftool.rek.cmd='diff -ru "$LOCAL" "$REMOTE"' difftool -d -t rek
diff -ru .../git-difftool.s3enPR/left/sozlama.ini .../git-difftool.s3enPR/right/sozlama.ini
--- .../left/sozlama.ini
+++ .../right/sozlama.ini
@@ -1,3 +1,3 @@
...
```

Boshqa opsiyalar:

| Opsiya | Ma'nosi |
| --- | --- |
| `-g`, `--gui` | `diff.tool` o'rniga `diff.guitool`ni ishlatish (topilmasa: `merge.guitool`, `diff.tool`, `merge.tool`) |
| `--prompt` | sozlamaga qaramay har fayl oldidan so'rash |
| `--skip-to=<fayl>`, `--rotate-to=<fayl>` | ro'yxatni shu fayldan boshlash (oldingilarni tashlab yoki oxiriga surib) |
| `--symlinks` / `--no-symlinks` | `-d` rejimida working tree fayllariga symlink yoki nusxa (Windows'da standart — nusxa) |
| `--trust-exit-code` | asbob noldan farqli kod qaytarsa, to'xtash |
| `difftool.<asbob>.path` | asbobning to'liq yo'li (`PATH`da bo'lmasa) |

`--trust-exit-code` ga e'tibor bering: `diff -u` farq topsa `1` qaytaradi — bu "xato" deb hisoblanadi:

```text
$ git difftool -y --trust-exit-code -x 'diff -u' >/dev/null; echo $?
fatal: external diff died, stopping at sozlama.ini
128
```

`difftool` sozlamalari topilmasa, Git `mergetool` sozlamalariga qaytadi — konflikt asbobi (22-bob) va diff asbobini bir marta sozlash kifoya.

## Muhandislik nuqtai nazari: konflikt paytidagi diff

Merge konfliktida (22-bob) index'da bitta faylning **uch** versiyasi turadi — 1-bosqich (umumiy ajdod), 2-bosqich ("bizniki", HEAD), 3-bosqich ("ularniki"):

```text
$ git merge versiya-2
Auto-merging sozlama.ini
CONFLICT (content): Merge conflict in sozlama.ini
Automatic merge failed; fix conflicts and then commit the result.
$ git ls-files -s sozlama.ini
100644 a25dd3a5f64a0a48f6401fd4093fd830783cf185 1	sozlama.ini
100644 c4ec3b487cbc3fd46bba05d810f91f1d1416de0c 2	sozlama.ini
100644 02a092397c5d7f0d653b4ff5c57ffd364c8584e2 3	sozlama.ini
```

Endi `git diff` boshqa formatda — **combined diff** (`diff --cc`):

```text
$ git diff
diff --cc sozlama.ini
index c4ec3b4,02a0923..0000000
--- a/sozlama.ini
+++ b/sozlama.ini
@@@ -1,3 -1,3 +1,7 @@@
  [app]
  nom = kalkulyator
++<<<<<<< HEAD
 +versiya = 1.5
++=======
+ versiya = 2.0
++>>>>>>> versiya-2
```

Bu yerda prefiks ustuni **ikkita** — har ota-ona uchun bittadan. 1-ustun — "bizniki"ga nisbatan, 2-ustun — "ularniki"ga nisbatan. ` +versiya = 1.5` — bu qator bizda bor edi (1-ustun bo'sh), ularnikida yo'q (2-ustunda `+`). `++` — ikkala ota-onada ham yo'q qator (konflikt belgilari). Hunk sarlavhasida `@@@` — ota-onalar soni + 1 ta `@`; rasmiy hujjatga ko'ra bu ataylab qilingan: combined diff'ni `patch -p1`ga adashib berib yubormaslik uchun. `index c4ec3b4,02a0923..0000000` — ikki ota-ona blob'i va natija.

Har bir tomon bilan alohida solishtirish:

| Opsiya | Working tree nima bilan solishtiriladi |
| --- | --- |
| `-1`, `--base` | 1-bosqich (umumiy ajdod) |
| `-2`, `--ours` | 2-bosqich (bizning branch) |
| `-3`, `--theirs` | 3-bosqich (ularning branch'i) |
| `-0` | merge qilinmagan fayllar uchun diff chiqarmay, faqat "Unmerged" deydi |

```text
$ git diff --theirs
* Unmerged path sozlama.ini
diff --git a/sozlama.ini b/sozlama.ini
index 02a0923..2bf85fc 100644
...
+<<<<<<< HEAD
+versiya = 1.5
+=======
 versiya = 2.0
+>>>>>>> versiya-2
```

`--check` unutilgan konflikt belgilarini topadi — commit'dan oldin foydali:

```text
$ git diff --check; echo $?
sozlama.ini:3: leftover conflict marker
sozlama.ini:5: leftover conflict marker
sozlama.ini:7: leftover conflict marker
2
```

`AUTO_MERGE` — `ort` merge strategiyasi konfliktda yozadigan ref, u konflikt belgilari bilan birga avtomatik merge natijasini (tree) ko'rsatadi. Faylni tahrirlagandan keyin `git diff AUTO_MERGE` — **siz** konfliktni hal qilish uchun nima qilganingiz:

```text
$ printf '[app]\nnom = kalkulyator\nversiya = 2.0\n' > sozlama.ini
$ git diff AUTO_MERGE
diff --git a/sozlama.ini b/sozlama.ini
index 2bf85fc..02a0923 100644
--- a/sozlama.ini
+++ b/sozlama.ini
@@ -1,7 +1,3 @@
 [app]
 nom = kalkulyator
-<<<<<<< HEAD
-versiya = 1.5
-=======
 versiya = 2.0
->>>>>>> versiya-2
```

Merge commit qilingandan keyin uni `git show` combined diff bilan ko'rsatadi; `git diff A A^@` va `git diff A^!` ham xuddi shunday (rasmiy hujjat). Combined diff'ning "zich" (`--cc`) shakli ota-onalardan birini o'zgarishsiz tanlagan hunk'larni yashiradi — bizning misolda natija "ularniki" bilan bir xil bo'lgani uchun `git diff HEAD^!` bo'sh chiqadi. Merge commit'larni `log`da ko'rsatish — 9-bob (`--diff-merges`, `--remerge-diff`).

## Muhandislik nuqtai nazari: ichkarida nima bo'ladi

`git diff` bitta buyruq, lekin ichkarida u to'rt past darajadagi amaldan birini tanlaydi:

| Porcelain | Plumbing ekvivalenti | Solishtiradi |
| --- | --- | --- |
| `git diff` | `git diff-files -p` | index ↔ working tree |
| `git diff --cached [<commit>]` | `git diff-index --cached -p <commit>` | tree ↔ index |
| `git diff <commit>` | `git diff-index -p <commit>` | tree ↔ working tree |
| `git diff <commit> <commit>` | `git diff-tree -p <commit> <commit>` | tree ↔ tree |

Har holatda Git ikki **tree** (yoki tree va index/working tree) bo'ylab yuradi, bir xil hash'li yozuvlarni darhol o'tkazib yuboradi (mazmunni o'qimaydi ham — hash teng bo'lsa, mazmun teng, 14-bob) va faqat farqli blob juftlari uchun qator diff'ini hisoblaydi. Shuning uchun katta repo'da ham ikki commit orasidagi diff tez: o'zgarmagan papkalar tree hash'i bo'yicha butunlay tashlab ketiladi.

Working tree bilan solishtirishda Git avval index'dagi fayl **statistikasi**ni (o'lcham, o'zgarish vaqti — `stat` ma'lumoti) diskdagi bilan solishtiradi; mos kelsa, faylni o'qimaydi. Mos kelmasa, mazmunni o'qib tekshiradi. Shu sababli `touch fayl` dan keyin `git diff` fayl haqida hech narsa demaydi, lekin index'dagi stat ma'lumotini yangilaydi (`diff.autoRefreshIndex`, standart `true`).

Diff — Git'ning **ko'rinishi**, saqlash usuli emas. 1-bobda aytilganidek, Git har commit'da to'liq snapshot saqlaydi; diff har safar ikki snapshot'dan yangidan hisoblanadi. Packfile'lardagi delta siqish (18-bob) — bu boshqa narsa, u diff formatiga bog'liq emas.

## Muhandislik nuqtai nazari: kundalik odatlar

- **Commit'dan oldin har doim `git diff --staged`.** `git status` faqat fayl nomlarini ko'rsatadi; tasodifiy debug qatori, parol yoki keraksiz fayl aynan diff'da ko'rinadi.
- **Review uchun uch nuqta.** "Branch nima o'zgartirdi?" — `git diff main...feature`. Ikki nuqta asosiy branch'dagi yangiliklarni ham "teskari" ko'rsatadi.
- **Avval `--stat`, keyin patch.** Katta o'zgarishda umumiy manzara tushunishni tezlashtiradi.
- **Matn uchun `--word-diff`**, refactoring uchun `--color-moved`, chekinish o'zgarishi uchun `-w` (faqat ko'rish uchun!).
- **Skriptda `--quiet`/`--exit-code`, `--name-only -z`, `--numstat`** — inson uchun formatlarga tayanmang.
- Foydali sozlamalar (45-bob): `diff.algorithm=histogram`, `diff.colorMoved=zebra`, `diff.mnemonicPrefix=true`. Oxirgisi `a/`/`b/` o'rniga nimani solishtirayotganingizni ko'rsatadi:

```text
$ git -c diff.mnemonicPrefix=true diff | head -4
diff --git i/README.md w/README.md
index 2921ac7..1f18b2c 100644
--- i/README.md
+++ w/README.md
$ git -c diff.mnemonicPrefix=true diff --cached | head -4
diff --git c/README.md i/README.md
...
```

`i` — index, `w` — working tree, `c` — commit, `o` — obyekt. `--default-prefix` har qanday prefiks sozlamasini bekor qilib, `a/`/`b/`ni qaytaradi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `git add`dan keyin `git diff` bo'sh — "o'zgarish yo'qoldi" deb o'ylash | `git diff` working tree'ni index bilan solishtiradi, endi ular teng | `git diff --staged` yoki `git diff HEAD` |
| Yangi faylni `git diff`da qidirish | Untracked fayl index'da yo'q, solishtirilmaydi | `git add -N <fayl>` yoki `git status`; stage qilingach `--staged` |
| Branch review'da `git diff main feature` | `main`dagi yangi o'zgarishlar "o'chirilgan" bo'lib ko'rinadi | `git diff main...feature` |
| `git diff A..B` ni `git log A..B` bilan bir ma'noda tushunish | `diff` diapazon emas, ikki nuqtani solishtiradi | `diff` uchun `..` = bo'shliq; o'z o'zgarishlari uchun `...` |
| Opsiyani `--` dan keyin yozish: `git diff X -- README.md --stat` | `--stat` fayl nomi deb qabul qilinadi, to'liq patch chiqadi | Opsiyalar `--` dan oldin: `git diff --stat X -- README.md` |
| `git diff -w` bo'sh — "o'zgarish yo'q" deb commit qilish | `-w` faqat ko'rsatishni o'zgartiradi, bo'shliq o'zgarishi commit'ga kiradi | `--check` bilan tekshiring, keraksiz bo'shliqni faylda tuzating |
| Skriptda `git diff` chiqishini tahlil qilish | Format, algoritm va heuristika o'zgarishi mumkin | `--quiet`, `--numstat`, `--name-only -z`, `--raw` |
| Combined diff'ni `patch`ga berish | U qo'llash uchun emas, faqat ko'rish uchun (`@@@` ataylab) | Kerakli tomon bilan oddiy diff: `git diff --ours`, yoki `git show -m`/`--diff-merges=1` |
| `--find-copies-harder`ni katta repo'da doimiy yoqish | Har o'zgarmagan faylni nusxa manbai deb tekshiradi — juda sekin | Faqat kerak bo'lganda, kichik oraliqda |
| `--trust-exit-code` bilan `diff -u` ishlatish | `diff` farq topsa `1` qaytaradi — `difftool` buni xato deb to'xtaydi | Bunday asbob uchun `--trust-exit-code`ni ishlatmang |

## Amaliyot

1. Vaqtinchalik repo'da faylni commit qiling. Uni o'zgartiring, `git add` qiling, yana o'zgartiring. `git diff`, `git diff --staged`, `git diff HEAD` natijalarini va `git status --short` dagi `MM`ni solishtiring. Har diff'dagi `index` qatoridagi hash'larni `git rev-parse HEAD:<fayl>`, `git ls-files -s`, `git hash-object <fayl>` bilan tekshiring.
2. Funksiyalari bor fayl yarating va funksiya o'rtasida bitta qatorni o'zgartiring. `-U0`, `-U1`, standart va `-W` natijalarini solishtiring. Hunk sarlavhasidagi funksiya nomi nega shunday tanlanganini tushuntiring.
3. Markdown faylda bitta paragrafning bir nechta so'zini o'zgartiring. `--word-diff`, `--word-diff=porcelain`, `--color-words` va `--word-diff-regex=.` natijalarini ko'ring.
4. Qator oxiriga probel, o'rtasiga qo'shimcha probel va chekinish o'zgarishi kiriting. `--ignore-space-at-eol`, `-b`, `-w` har biri qaysi hunk'ni yashirishini aniqlang. `git diff --check` chiqish kodini tekshiring.
5. `main`dan branch oching, unda fayl qo'shing va boshqasini o'chiring; keyin `main`da ham o'zgarish qiling. `git diff main branch` va `git diff main...branch` farqini `--name-status` bilan ko'rsating, `git merge-base` bilan tasdiqlang.
6. Faylni `git mv` bilan qayta nomlab, bir qatorini o'zgartiring. `--name-status`dagi `R` foizini o'qing va `-M` chegarasini shu foizdan yuqori qilib "D + A" ga aylantiring.
7. `git diff > o.patch` bilan patch yarating, `git restore .` qiling, keyin `git apply --check` va `git apply` bilan qayta qo'llang. `git apply -R` bilan bekor qiling.
8. (Qiyinroq) Ataylab merge konflikti yarating. `git diff` (combined), `--ours`, `--theirs`, `--base` natijalarini solishtiring va har ustundagi `+`/`-` nimani bildirishini tushuntiring. Konfliktni hal qilgach, `git diff AUTO_MERGE` va `git diff --check` bilan tekshiring. Oxirida `difftool.<nom>.cmd` bilan o'z "asbobingizni" yozib, `$LOCAL`, `$REMOTE`, `$MERGED` qiymatlarini chiqaring.

## Rasmiy hujjat

- Pro Git — Recording Changes to the Repository (Viewing Your Staged and Unstaged Changes): <https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository>
- `git diff`: <https://git-scm.com/docs/git-diff>
- `git difftool`: <https://git-scm.com/docs/git-difftool>
- Diff formati va opsiyalari (`git diff` sahifasining "RAW OUTPUT FORMAT", "GENERATING PATCH TEXT WITH -P", "COMBINED DIFF FORMAT" bo'limlari): <https://git-scm.com/docs/git-diff#_raw_output_format>
- `gitdiffcore` (rename aniqlash, pickaxe ichidan): <https://git-scm.com/docs/gitdiffcore>
- `git apply`: <https://git-scm.com/docs/git-apply>
