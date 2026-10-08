# 05 — Uch holat va uch hudud

[← Oldingi: Repo olish: `init` va `clone`](04-repo-olish.md) · [Mundarija](README.md) · [Keyingi: O'zgarishlarni yozish: `status`, `add`, `commit` →](06-ozgarishlarni-yozish.md)

## Tushuncha

Pro Git bu mavzuni "Git'ni o'rganishda eng muhim narsa" deb ataydi va bunga asos bor: keyingi har bir buyruq (`add`, `commit`, `diff`, `restore`, `reset`, `stash`, `switch`) aslida shu bobdagi uch hudud o'rtasida ma'lumot ko'chiradi. Shu modelni tushunsangiz, buyruqlarni yodlash shart bo'lmaydi — har birining nima qilishini o'zingiz chiqarib olasiz.

### Uch holat

Git kuzatayotgan fayl uch asosiy holatdan birida bo'ladi:

- **Modified** (o'zgartirilgan) — faylni o'zgartirdingiz, lekin bu o'zgarish hali Git bazasiga yozilmagan va keyingi commit'ga belgilanmagan.
- **Staged** (tayyorlangan) — o'zgartirilgan faylning **aynan hozirgi versiyasini** keyingi commit'ga kirishi uchun belgilab qo'ydingiz.
- **Committed** (saqlangan) — ma'lumot lokal bazada xavfsiz saqlangan.

Bu yerda **commit** — loyihaning ma'lum paytdagi to'liq surati (snapshot), muallif, sana va xabar bilan birga ([1-bob](01-versiya-nazorati.md)).

### Uch hudud

Shu uch holatga Git loyihasining uch qismi mos keladi:

```text
  Working tree              Staging area (index)          Git directory (repository)
  (ishchi papka)            (.git/index)                  (.git/objects, .git/refs ...)

  ┌──────────────┐          ┌──────────────┐              ┌──────────────┐
  │ diskdagi     │  git add │ keyingi      │  git commit  │ commit'lar   │
  │ oddiy        │ ───────► │ commit       │ ───────────► │ tarixi       │
  │ fayllar      │          │ loyihasi     │              │ (obyektlar)  │
  └──────────────┘          └──────────────┘              └──────────────┘
         ▲                                                       │
         └──────────────── git switch / git restore ─────────────┘
                     (fayllarni bazadan diskka chiqarish)
```

1. **Working tree** (ishchi daraxt, ishchi papka) — loyihaning bitta versiyasi diskka "chiqarilgan" holati. Bu fayllarni muharrirda ochasiz, o'zgartirasiz, o'chirasiz. Rasmiy lug'at (`gitglossary`) ta'rifi: haqiqatda checkout qilingan fayllar daraxti; odatda u `HEAD` commit'ining tree'si **plyus** siz qilgan, lekin hali commit qilinmagan lokal o'zgarishlardan iborat.
2. **Staging area** — keyingi commit'ga nima kirishini saqlaydigan fayl. Uning texnik nomi **index**; Git hujjatlarida ikkala nom ham, ba'zan eski "cache" nomi ham ishlatiladi (`--cached` opsiyasi shundan qolgan). Diskda bu bitta fayl: `.git/index`.
3. **Git directory** (repository, `.git` papkasi) — loyihaning metama'lumotlari va obyektlar bazasi. Bu Git'ning eng muhim qismi: boshqa kompyuterdan `clone` qilganingizda aynan shu nusxalanadi ([4-bob](04-repo-olish.md)).

Oddiy o'xshatish — oshxona:

- **working tree** — ish stoli: ustida masalliqlar, idishlar, chala ishlar. Tartibsiz bo'lishi tabiiy;
- **index** — tarqatish stoli: mijozga chiqadigan likopchani shu yerda yig'asiz. Har narsani emas, faqat tayyorini qo'yasiz;
- **repository** — fotoalbom: likopcha tayyor bo'lganda uni suratga olib, albomga yopishtirasiz. Albomdagi surat o'zgarmaydi.

Muhim nuqta: likopchaga qo'yilgan narsa — o'sha **paytdagi** holat. Keyin ish stolida yana nimadir o'zgartirsangiz, likopchadagisi o'zgarmaydi. Git'da ham xuddi shunday — buni quyida ko'rsatamiz.

### Asosiy ish oqimi

1. Working tree'dagi fayllarni o'zgartirasiz.
2. Keyingi commit'ga kirishi kerak bo'lgan o'zgarishlarnigina **tanlab** stage qilasiz (`git add`) — index'ga **faqat** shular qo'shiladi.
3. Commit qilasiz (`git commit`): Git index'dagi fayllarni qanday bo'lsa shundayligicha oladi va bu snapshot'ni Git directory'ga doimiy yozadi.

Shundan holatlar ta'rifi kelib chiqadi:

| Fayl versiyasi qayerda | Holat |
| --- | --- |
| Git directory'da (commit'da) bor, keyin o'zgarmagan | committed (unmodified) |
| O'zgartirilgan va index'ga qo'shilgan | staged |
| Checkout qilinganidan keyin o'zgartirilgan, lekin index'ga qo'shilmagan | modified |

## Nega shunday: nega o'rtada index bor

Ko'p VCS'larda ikki hudud bor: ishchi nusxa va repo. "Commit" — o'zgargan hamma narsani yozish. Git ataylab uchinchi hududni qo'shgan. Nega?

**Birinchi sabab — commit'ni yig'ish.** Bir soat ishlab, uchta mustaqil narsani o'zgartirgan bo'lishingiz mumkin: xatoni tuzatdingiz, yangi funksiya boshladingiz, yo'l-yo'lakay formatlashni to'g'riladingiz. Index bo'lmasa, uchalasi bitta aralash commit'ga tushardi. Index bilan ularni alohida-alohida, mantiqiy commit'larga ajratasiz: avval faqat tuzatishni stage qilib commit qilasiz, keyin qolganini. Hatto bitta faylning bir qismini ham ([37-bob](37-interaktiv-staging.md), `git add -p`). Yaxshi commit nima ekanini [10-bobda](10-yaxshi-commit.md) ko'ramiz.

**Ikkinchi sabab — commit'ni oldindan ko'rish.** Index — "keyingi commit'ning qoralamasi". Commit qilishdan oldin unga aynan nima kirishini `git status` va `git diff --staged` bilan tekshirasiz ([6-bob](06-ozgarishlarni-yozish.md), [7-bob](07-diff.md)). Qoralama yoqmasa, uni o'zgartirasiz — tarixga hali hech narsa yozilmagan.

**Uchinchi sabab — tezlik.** Index faqat ro'yxat emas, u keshdir (rasmiy lug'at: "stat ma'lumotlari bilan fayllar to'plami"). Har fayl uchun hajmi, o'zgartirilgan vaqti va boshqa `stat()` maydonlari saqlanadi. Shu tufayli `git status` 100 000 faylli loyihada ham har faylni o'qib, hash hisoblamaydi — avval vaqt va hajmni solishtiradi, faqat farq qilganlarini ochadi. Bu tafsilotni pastda ko'ramiz.

**To'rtinchi sabab — merge.** Konflikt paytida index bir faylning bir nechta versiyasini (umumiy ajdod, "bizniki", "ularniki") bir vaqtda saqlay oladi. Merge'ni tugatish = index'da har fayl uchun bitta yakuniy versiya qoldirish ([22-bob](22-konfliktlar.md)).

Index'ni chetlab o'tish ham mumkin (`git commit -a`, [6-bob](06-ozgarishlarni-yozish.md)), lekin u yo'qolmaydi — `-a` shunchaki `add`ni siz uchun avtomatik bajaradi. Git'da har commit **doim** index'dan yasaladi.

## Kod: bo'sh repo — hali index yo'q

Bobdagi buyruqlarni vaqtinchalik papkada takrorlang.

```text
$ git init
Initialized empty Git repository in .../oshxona/.git/
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
```

Yangi repo'da index fayli hali yo'q — u birinchi `git add`da paydo bo'ladi. Fayl yaratamiz:

```text
$ echo "Osh: guruch, sabzi, go'sht" > osh.md
$ git status
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	osh.md

nothing added to commit but untracked files present (use "git add" to track)
```

`osh.md` faqat working tree'da bor. Index ham, repo ham undan bexabar — bu **untracked** (kuzatilmaydigan) fayl. Qisqa shaklda:

```text
$ git status -s
?? osh.md
```

`??` — "Git bu faylni tanimaydi". Qisqa format belgilari [6-bobda](06-ozgarishlarni-yozish.md) to'liq tushuntiriladi.

## Kod: `git add` — fayl index'ga va bazaga tushadi

```text
$ git add osh.md
$ ls -la .git/index
-rw-r--r--  1 ...  104 ... .git/index
$ find .git/objects -type f
.git/objects/d2/708f950f0e2150542501a7825a05fc1836a7a2
```

Ikki narsa sodir bo'ldi:

1. `.git/objects` ichida **blob** obyekti paydo bo'ldi — fayl mazmunining siqilgan nusxasi, nomi esa mazmunning hash'i ([14-bob](14-obyektlar-blob.md)).
2. `.git/index` fayli yaratildi va unga yozuv qo'shildi: "`osh.md` yo'li — mana shu blob".

Index ichini `git ls-files --stage` (qisqasi `-s`) ko'rsatadi:

```text
$ git ls-files -s
100644 d2708f950f0e2150542501a7825a05fc1836a7a2 0	osh.md
```

`gitdatamodel` hujjati bo'yicha har index yozuvining to'rt maydoni bor:

| Maydon | Qiymat | Ma'nosi |
| --- | --- | --- |
| Fayl turi (rejim) | `100644` | Oddiy fayl (`100755` — bajariladigan, `120000` — symlink, `160000` — submodule uchun gitlink) |
| Obyekt ID | `d2708f9...` | Fayl mazmuni saqlangan blob'ning hash'i |
| Stage raqami | `0` | Odatda 0; konflikt paytida 1, 2, 3 bo'ladi |
| Yo'l | `osh.md` | Repo ildiziga nisbatan fayl yo'li |

Index'dagi versiyani o'qish mumkin — `:<yo'l>` sintaksisi "index'dagi shu fayl" degani ([19-bob](19-revision-tanlash.md)):

```text
$ git cat-file -p :osh.md
Osh: guruch, sabzi, go'sht
```

Fayl endi **tracked** (kuzatiladigan) va **staged**:

```text
$ git status
On branch main

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
	new file:   osh.md

$ git status -s
A  osh.md
```

E'tibor bering: hali birorta commit yo'q, shuning uchun Git stage'dan chiqarish uchun `git rm --cached` ni maslahat beradi (solishtiradigan `HEAD` yo'q). Commit'lar paydo bo'lgach, maslahat `git restore --staged` ga almashadi.

Index faylining boshi — 4 baytlik `DIRC` imzosi ("dircache"), versiya (2) va yozuvlar soni (1):

```text
$ xxd .git/index | head -1
00000000: 4449 5243 0000 0002 0000 0001 6ac6 ff4c  DIRC........j..L
```

Formatni [15-bobda](15-tree-va-index.md) bayt-baytigacha ko'ramiz.

## Kod: `git commit` — index'dan snapshot

```text
$ git commit -m "Osh retsepti"
[main (root-commit) 500363e] Osh retsepti
 1 file changed, 1 insertion(+)
 create mode 100644 osh.md

$ find .git/objects -type f | sort
.git/objects/13/82341eb8678d514037d0e455904551e84ee509
.git/objects/50/0363e6e943612b941d4a4d139888486329370b
.git/objects/d2/708f950f0e2150542501a7825a05fc1836a7a2
```

Commit yangi blob yozmadi — blob `add` paytida allaqachon yozilgan edi. Commit faqat ikki obyekt qo'shdi: index'dan yasalgan **tree** (`1382341`) va **commit** (`500363e`). Keyin joriy branch'ni (`main`) yangi commit'ga siljitdi ([20-bob](20-branch-bu-ref.md)).

Endi uch hudud bir xil:

```text
$ git status
On branch main
nothing to commit, working tree clean
$ git status -s
$
```

Bo'sh chiqish — hammasi toza. Lug'atda bunga nom bor: working tree **clean** (toza), agar u joriy branch commit'iga mos kelsa; aks holda u **dirty** (iflos) — commit qilinmagan o'zgarishlari bor.

HEAD'dagi tree va index bir xil blob'ni ko'rsatadi:

```text
$ git ls-tree HEAD
100644 blob d2708f950f0e2150542501a7825a05fc1836a7a2	osh.md
$ git ls-files -s
100644 d2708f950f0e2150542501a7825a05fc1836a7a2 0	osh.md
```

## Kod: bitta fayl — uch xil versiya

Mana bobning asosiy tajribasi. Faylni o'zgartiramiz:

```text
$ echo "Ziravor: zira" >> osh.md
$ git status
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   osh.md

no changes added to commit (use "git add" and/or "git commit -a")
$ git status -s
 M osh.md
```

Fayl **modified**: working tree index'dan farq qiladi. Stage qilamiz:

```text
$ git add osh.md
$ git status -s
M  osh.md
```

Endi **staged**: index HEAD'dan farq qiladi, working tree esa index bilan bir xil. `M` belgisi chap ustunga ko'chganiga e'tibor bering — chap ustun index holati, o'ng ustun working tree holati.

Commit qilishdan oldin yana bir qator qo'shamiz:

```text
$ echo "Tuz: bir choy qoshiq" >> osh.md
$ git status
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	modified:   osh.md

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   osh.md

$ git status -s
MM osh.md
```

Bitta fayl bir vaqtning o'zida ham "commit'ga tayyor", ham "tayyor emas" ro'yxatida. G'alati tuyuladi, lekin model bo'yicha mantiqiy: endi `osh.md`ning **uch xil versiyasi** bor va har biri o'z hududida turibdi. Ularni alohida o'qiymiz:

```text
$ git show HEAD:osh.md          # repository: oxirgi commit
Osh: guruch, sabzi, go'sht

$ git show :osh.md              # index: keyingi commit qoralamasi
Osh: guruch, sabzi, go'sht
Ziravor: zira

$ cat osh.md                    # working tree: diskdagi fayl
Osh: guruch, sabzi, go'sht
Ziravor: zira
Tuz: bir choy qoshiq
```

Hash'lar ham uch xil:

```text
$ git rev-parse HEAD:osh.md :osh.md
d2708f950f0e2150542501a7825a05fc1836a7a2
6a3a0cf548f2542b404218ec201058dfc42d6ff5
$ git hash-object osh.md
207eb76581656ba3a3fb077c034e53bc13c426dc
```

`git hash-object` (`-w`siz) faqat hisoblaydi, yozmaydi. Working tree versiyasi bazada hali yo'q:

```text
$ git cat-file -e 207eb76581656ba3a3fb077c034e53bc13c426dc
$ echo $?
1
$ git cat-file -t 6a3a0cf
blob
```

Index versiyasi esa bazada bor — `add` uni allaqachon yozgan.

```text
   HEAD (500363e)            index                    working tree
  ┌────────────────┐      ┌────────────────┐      ┌────────────────┐
  │ osh.md         │      │ osh.md         │      │ osh.md         │
  │ d2708f9        │      │ 6a3a0cf        │      │ (207eb76)      │
  │ Osh            │      │ Osh            │      │ Osh            │
  │                │      │ Ziravor        │      │ Ziravor        │
  │                │      │                │      │ Tuz            │
  └────────────────┘      └────────────────┘      └────────────────┘
           └──── "M" (chap) ───────┘└───── "M" (o'ng) ─────┘
```

Endi commit qilsak, nima yoziladi?

```text
$ git commit -m "Zira qo'shildi"
[main 8a13dbf] Zira qo'shildi
 1 file changed, 1 insertion(+)
$ git show HEAD:osh.md
Osh: guruch, sabzi, go'sht
Ziravor: zira
$ git status -s
 M osh.md
```

Commit **index'dagi** versiyani oldi — "Tuz" qatori kirmadi, u working tree'da modified bo'lib qoldi. Bu Pro Git ta'kidlaydigan asosiy qoida: Git faylni `git add` qilingan paytdagi holatida stage qiladi; undan keyingi o'zgarishlar uchun `add`ni qayta ishlatish kerak.

Qolgan farqni `git diff` ko'rsatadi (index va working tree orasida, [7-bob](07-diff.md)):

```diff
$ git diff
diff --git a/osh.md b/osh.md
index 6a3a0cf..207eb76 100644
--- a/osh.md
+++ b/osh.md
@@ -1,2 +1,3 @@
 Osh: guruch, sabzi, go'sht
 Ziravor: zira
+Tuz: bir choy qoshiq
```

`index 6a3a0cf..207eb76` qatorida yuqoridagi ikki hash'ni taniysiz.

## Kod: fayl hayot sikli

Pro Git yana bir o'qni ham ajratadi: har fayl yo **tracked**, yo **untracked**.

- **Tracked** — oxirgi snapshot'da bo'lgan yoki yangi stage qilingan fayllar, ya'ni Git biladigan fayllar. Ular unmodified, modified yoki staged bo'lishi mumkin.
- **Untracked** — qolgan hamma narsa: oxirgi snapshot'da ham, index'da ham yo'q fayllar. (Bunga `.gitignore` bilan e'tiborsiz qoldirilgan **ignored** fayllar alohida toifa sifatida qo'shiladi — [8-bob](08-gitignore-rm-mv.md).)

Aniqrog'i, "tracked" = **index'da yozuvi bor**. `clone`dan keyin hamma fayl tracked va unmodified, chunki Git ularni hozirgina checkout qildi.

```text
  Untracked        Unmodified        Modified          Staged
      │                 │                │                │
      │──── git add ───────────────────────────────────► │
      │                 │                │                │
      │                 │── tahrirlash ─►│                │
      │                 │                │─── git add ──► │
      │                 │◄──────────────────── git commit │
      │                 │                │                │
      │◄─ git rm --cached + commit       │                │
```

Har o'tishni sinab ko'ramiz:

```text
$ echo "Manti: un, go'sht, piyoz" > manti.md
$ git status -s
?? manti.md                        # untracked
$ git add manti.md
$ git status -s
A  manti.md                        # yangi, staged
$ echo "Bug'da pishiriladi" >> manti.md
$ git status -s
AM manti.md                        # index'da yangi, keyin yana o'zgargan
```

`AM` — index'ga qo'shilgan (`A`), keyin working tree'da o'zgargan (`M`). Kuzatishni bekor qilish, ya'ni index'dan olib tashlash (diskdagi fayl qoladi):

```text
$ git rm --cached manti.md
error: the following file has staged content different from both the
file and the HEAD:
    manti.md
(use -f to force removal)
```

Git rad etdi: index'dagi versiya diskdagidan ham, HEAD'dagidan ham farq qiladi — uni o'chirsangiz, o'sha versiya hech qayerda qolmaydi. Bu ma'lumotni yo'qotishdan himoya. Diskdagi bilan bir xil bo'lsa, ishlaydi:

```text
$ git restore --staged manti.md
$ git status -s
?? manti.md
$ git add manti.md
$ git rm --cached manti.md
rm 'manti.md'
$ git status -s
?? manti.md
```

Commit qilingan faylni kuzatuvdan chiqarish ham xuddi shunday — index'dan o'chirish, keyin commit:

```text
$ git rm --cached osh.md
rm 'osh.md'
$ git status -s
D  osh.md
?? manti.md
?? osh.md
```

Bir vaqtda ikki yozuv: `D ` — "index'dan o'chirilgan, keyingi commit'da bu fayl bo'lmaydi", `??` — "diskda shunday fayl bor, lekin Git uni kuzatmaydi". Commit qilinsa, `osh.md` untracked bo'lib qoladi. Biz buni bekor qilamiz:

```text
$ git restore --staged osh.md
$ git status -s
?? manti.md
```

`rm`, `rm --cached` va `.gitignore` bilan birga ishlashni [8-bobda](08-gitignore-rm-mv.md) to'liq ko'ramiz.

## Kod: qaysi buyruq qaysi yo'nalishda ko'chiradi

Uch hudud orasida ma'lumot ikki yo'nalishda harakatlanadi. Bu jadvalni boshingizda saqlang — keyingi boblar shuni kengaytiradi:

| Buyruq | Qayerdan | Qayerga | Bob |
| --- | --- | --- | --- |
| `git add <fayl>` | working tree | index (+ blob bazaga) | [6](06-ozgarishlarni-yozish.md) |
| `git commit` | index | repository (tree + commit, branch siljiydi) | [6](06-ozgarishlarni-yozish.md) |
| `git restore --staged <fayl>` | HEAD | index | [11](11-bekor-qilish.md) |
| `git restore <fayl>` | index | working tree | [11](11-bekor-qilish.md) |
| `git restore --staged --worktree <fayl>` | HEAD | index va working tree | [11](11-bekor-qilish.md) |
| `git switch <branch>` | repository | index va working tree (HEAD ham) | [20](20-branch-bu-ref.md) |
| `git reset --soft/--mixed/--hard` | repository | HEAD / +index / +working tree | [39](39-reset-sirlari.md) |

Eng ko'p chalkashtiriladigani — `git restore <fayl>` **HEAD'dan emas, index'dan** tiklaydi:

```text
$ echo "Qatiq bilan" >> osh.md
$ git add osh.md
$ echo "Choy bilan" >> osh.md
$ git status -s osh.md
MM osh.md
$ git restore osh.md
$ git status -s osh.md
M  osh.md
$ tail -2 osh.md
Tuz: bir choy qoshiq
Qatiq bilan
```

"Choy" tashlandi (working tree index'ga tenglashtirildi), "Qatiq" esa qoldi, chunki u index'da edi. HEAD holatiga to'liq qaytish uchun avval index'ni, keyin working tree'ni tiklash kerak:

```text
$ git restore --staged osh.md
$ git status -s osh.md
 M osh.md
$ git restore osh.md
$ git status -s osh.md
$
```

> **Ogohlantirish.** `git restore <fayl>` working tree'dagi commit qilinmagan va stage qilinmagan o'zgarishni **qaytarib bo'lmaydigan** tarzda o'chiradi — u hech qachon Git bazasiga yozilmagan edi. Ishlatishdan oldin `git diff` bilan nimani yo'qotayotganingizni ko'ring.

## Muhandislik nuqtai nazari: index — tekis ro'yxat, tree — daraxt

`gitdatamodel` hujjati alohida ta'kidlaydi: tree'dan farqli o'laroq, index — **tekis** (flat) fayllar ro'yxati. Papkalar alohida yozuv emas, ular yo'l ichida turadi:

```text
$ mkdir shirinlik
$ echo "Halva: un, shakar, yog'" > shirinlik/halva.md
$ git add manti.md shirinlik
$ git commit -m "Manti va halva"
[main 777254b] Manti va halva
 2 files changed, 2 insertions(+)
 create mode 100644 manti.md
 create mode 100644 shirinlik/halva.md

$ git ls-files -s
100644 d723fae98735af0a8e3135df91bc1779a1d7b619 0	manti.md
100644 207eb76581656ba3a3fb077c034e53bc13c426dc 0	osh.md
100644 402895f22935c6e4b7b7352372326bb0b93165e9 0	shirinlik/halva.md

$ git ls-tree HEAD
100644 blob d723fae98735af0a8e3135df91bc1779a1d7b619	manti.md
100644 blob 207eb76581656ba3a3fb077c034e53bc13c426dc	osh.md
040000 tree 2b604e2e6589112a8beda8121b07653749d83227	shirinlik
```

Index'da `shirinlik/halva.md` — bitta qator. Commit'da esa `shirinlik` — alohida tree obyekti (`040000`), uning ichida `halva.md`. Commit paytida Git tekis ro'yxatni daraxtga aylantiradi. Bundan bir amaliy xulosa: **bo'sh papka index'ga tushmaydi** — index'da faqat fayl yozuvlari bor, shuning uchun Git bo'sh papkani kuzatmaydi (odatda ichiga `.gitkeep` kabi fayl qo'yiladi — bu Git kelishuvi emas, shunchaki an'ana).

`git ls-tree -r HEAD` (`-r` — rekursiv) daraxtni yoyib, index'ga o'xshash ro'yxat beradi — uni `ls-files -s` bilan solishtirish uch hudud modelini tekshirishning yaxshi usuli.

## Muhandislik nuqtai nazari: index — stat kesh

Lug'at index'ni shunday ta'riflaydi: "stat ma'lumotlari bilan fayllar to'plami; mazmuni obyekt sifatida saqlanadi". `--debug` bu ma'lumotni ko'rsatadi:

```text
$ git ls-files --debug
osh.md
  ctime: 1791426396:31590104
  mtime: 1791426396:31590104
  dev: 16777231	ino: 30222124
  uid: 501	gid: 0
  size: 62	flags: 0
```

`git status` har faylni o'qib hash hisoblash o'rniga avval shu maydonlarni diskdagi fayl bilan solishtiradi. Mos kelsa — fayl o'zgarmagan deb hisoblanadi. Mos kelmasa — mazmuni tekshiriladi. Faylni mazmunini o'zgartirmasdan "tegib" chiqamiz:

```text
$ touch osh.md
$ git diff-files
:100644 100644 207eb76581656ba3a3fb077c034e53bc13c426dc 0000000000000000000000000000000000000000 M	osh.md
```

`git diff-files` — faqat stat'ga qaraydigan plumbing buyrug'i ([13-bob](13-plumbing-va-porcelain.md)). U "o'zgargan bo'lishi mumkin" deydi, yangi hash o'rnida nollar — "hali hisoblanmagan". Endi `status`:

```text
$ git status -s
$ git diff-files
$
```

`status` mazmunni tekshirdi, o'zgarish yo'qligini ko'rdi va **index'dagi stat ma'lumotini yangiladi** — keyingi `diff-files` endi jim. `git status` hujjatida bu "background refresh" deb atalgan: `status` index'ni yangilab yozadi, toki keyingi buyruqlar shu hisobni takrorlamasin. Shu sababli `status` faqat o'qiydigan buyruq emas — u `.git/index`ni yozishi va qisqa muddat qulf (`index.lock`) olishi mumkin. Fonda `status` ishlatadigan dasturlar (masalan, muharrir plaginlari) uchun hujjat `git --no-optional-locks status` ni tavsiya qiladi.

## Muhandislik nuqtai nazari: `add` qilingan narsa deyarli yo'qolmaydi

Ko'rdik: blob `commit`da emas, `add`da yoziladi. Demak, bir marta stage qilingan har versiya bazada qoladi — hatto keyin uni boshqasi bilan almashtirsangiz ham:

```text
$ echo "Qaymoq bilan" >> manti.md
$ git add manti.md
$ git ls-files -s
100644 ecb7fbe33b75b9832423befb6881b15f3d3c4db8 0	manti.md
$ echo "Suzma bilan" >> manti.md
$ git add manti.md
$ git ls-files -s
100644 17cf4bc12f658c6a0f1e8379b31f0b473d918010 0	manti.md

$ git fsck --dangling
dangling blob ecb7fbe33b75b9832423befb6881b15f3d3c4db8
$ git cat-file -p ecb7fbe
Manti: un, go'sht, piyoz
Qaymoq bilan
```

Birinchi versiyaga endi hech narsa ishora qilmaydi (index ham, commit ham) — u **dangling** (osilib qolgan) obyekt. Lekin u hali bazada va uni o'qish mumkin. `gc` bunday obyektlarni ma'lum muddatdan keyin o'chiradi ([18-bob](18-packfile-va-gc.md)); tiklash usullari [42-bobda](42-reflog-va-tiklash.md).

Xulosa xavfsizlik darajasi bo'yicha:

| Hudud | Yo'qolsa tiklash mumkinmi |
| --- | --- |
| Faqat working tree'dagi o'zgarish | Yo'q — Git uni hech qachon ko'rmagan |
| Index'ga `add` qilingan, commit qilinmagan | Odatda ha, `fsck` orqali — `gc`gacha |
| Commit qilingan | Ha — reflog va ref'lar orqali |

Shuning uchun xavfli amaldan oldin (`reset --hard`, `restore`, `switch -f`) hech bo'lmasa `git add` yoki `git stash` qilish odati foydali.

## Muhandislik nuqtai nazari: index'da bir faylning bir necha versiyasi

Index yozuvidagi **stage raqami** odatda `0`. Merge konfliktida esa bitta yo'l uchun uchta yozuv paydo bo'ladi. Alohida repo'da ikki branch'da bitta qatorni har xil o'zgartirib, merge qilamiz:

```text
$ git merge ikkinchi
Auto-merging osh.md
CONFLICT (content): Merge conflict in osh.md
Automatic merge failed; fix conflicts and then commit the result.

$ git ls-files -s
100644 cd430181a12e26a90fac3e7b9e3f14c956c73c6d 1	osh.md
100644 189d6ec61ec95723be134cc6b37fe13239b6400f 2	osh.md
100644 863a956eb13f2dcf1cdf7d95aaa9a0aba5ac3ef8 3	osh.md
$ git status -s
UU osh.md
```

- `1` — umumiy ajdoddagi versiya;
- `2` — "bizniki" (joriy branch, HEAD);
- `3` — "ularniki" (qo'shilayotgan branch).

Bunday index **unmerged** deyiladi va undan commit yasab bo'lmaydi. Konfliktni hal qilib `git add` qilsangiz, uch yozuv o'rniga bitta `0` yozuv qoladi. Bekor qilish ham index'ni tiklaydi:

```text
$ git merge --abort
$ git ls-files -s
100644 189d6ec61ec95723be134cc6b37fe13239b6400f 0	osh.md
```

Batafsil — [22-bob](22-konfliktlar.md).

## Muhandislik nuqtai nazari: working tree'siz repo

Uch hudud har repo'da shart emas. **Bare** repo'da ([4-bob](04-repo-olish.md)) faqat Git directory bor — working tree ham, index ham yo'q. Server'dagi markaziy repo'lar shunday bo'ladi: unda hech kim fayl tahrirlamaydi, faqat push qilinadi.

```text
$ git clone --bare oshxona yalang.git
$ cd yalang.git
$ ls
HEAD
config
description
hooks
info
objects
packed-refs
refs
$ git status
fatal: this operation must be run in a work tree
$ git rev-parse --is-bare-repository
true
```

`index` fayli yo'q, `status` esa ishlamaydi — solishtiradigan working tree yo'q. Teskari holat ham bor: bitta repo'ga bir nechta working tree ulash mumkin (`git worktree`, [49-bob](49-worktree-va-katta-repo.md)), har birining o'z index'i bo'ladi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `git add` qilib, keyin faylni yana tahrirlab, darhol commit qilish | Commit'ga `add` paytidagi versiya kiradi, keyingi tahrir tushmaydi | Commit'dan oldin `git status`; `MM` ko'rsangiz, qayta `git add` |
| `git add`ni "faylni loyihaga qo'shish" deb tushunish | Bir marta qo'shdim, endi doim kiradi deb o'ylaysiz | `add` — "shu **mazmunni** keyingi commit'ga qo'sh"; har o'zgarishdan keyin qayta kerak |
| `git restore <fayl>` HEAD'ga qaytaradi deb o'ylash | U index'dan tiklaydi; stage qilingan o'zgarish qoladi | HEAD'ga to'liq: `git restore --staged --worktree <fayl>` |
| Muhim ishni faqat working tree'da uzoq saqlash | Tasodifiy `restore`/`reset --hard` uni butunlay o'chiradi | Tez-tez commit (keyin tozalash mumkin, [25-bob](25-tarixni-qayta-yozish.md)) yoki `stash` |
| Bo'sh papkani commit qilishga urinish | Index faqat fayllarni saqlaydi, papka tushmaydi | Ichiga fayl qo'ying (masalan `.gitkeep`) |
| "Untracked" va "ignored"ni bir narsa deb o'ylash | Untracked `status`da ko'rinadi, ignored — yo'q | [8-bob](08-gitignore-rm-mv.md): `.gitignore`, `git status --ignored` |
| `git status`ni fonda tez-tez ishlatadigan skript | `index.lock` uchun boshqa Git buyruqlari bilan to'qnashadi | `git --no-optional-locks status` |

## Amaliyot

1. Yangi repo yarating. `git add`dan oldin va keyin `ls .git/index` va `find .git/objects -type f` natijalarini solishtiring. Blob qachon paydo bo'ldi — `add`dami yoki `commit`dami?
2. Bitta faylni `MM` holatiga keltiring. `git show HEAD:<fayl>`, `git show :<fayl>` va `cat <fayl>` bilan uch versiyani chiqaring va `git rev-parse` bilan ularning hash'larini oling. Qaysi hash bazada yo'q va nega?
3. `MM` holatida `git commit` qiling. `git show HEAD:<fayl>` bilan aynan qaysi versiya yozilganini tekshiring va natijani uch hudud modeli bilan tushuntiring.
4. Fayl hayot siklining har o'tishini (`??` → `A ` → `AM` → `A ` → commit → ` M` → `M ` → commit) qo'lda bosib chiqing va har qadamda `git status -s` chiqishini yozib boring.
5. Ichida papka bor loyihada `git ls-files -s`, `git ls-tree HEAD` va `git ls-tree -r HEAD` natijalarini solishtiring. Index'da nechta yozuv, ildiz tree'da nechta yozuv bor?
6. `touch` bilan faylga tegib, `git diff-files` va `git status` ishlating, so'ng yana `git diff-files`. Ikkinchi `diff-files` nega jim? `git ls-files --debug` dagi `mtime` o'zgardimi?
7. Faylni ikki marta har xil mazmun bilan `add` qiling va `git fsck --dangling` bilan birinchi versiyani toping, `git cat-file -p` bilan o'qing.
8. (Qiyinroq) Ikki branch'da bitta qatorni har xil o'zgartirib konflikt yarating. `git ls-files -s` dagi 1, 2, 3 yozuvlarning har birini `git cat-file -p` bilan o'qing va qaysi biri qaysi branch'dan ekanini aniqlang. So'ng `git show :1:<fayl>`, `:2:`, `:3:` sintaksisi bilan ham xuddi shu natijani oling ([19-bob](19-revision-tanlash.md)).

## Rasmiy hujjat

- Pro Git — What is Git? (The Three States): <https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F>
- Pro Git — Recording Changes to the Repository: <https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository>
- `gitdatamodel` (THE INDEX): <https://git-scm.com/docs/gitdatamodel>
- `gitglossary` (working tree, index, clean, dirty, unmerged index): <https://git-scm.com/docs/gitglossary>
- `git ls-files`: <https://git-scm.com/docs/git-ls-files>
- `git status` (BACKGROUND REFRESH): <https://git-scm.com/docs/git-status>
