# 11 — Bekor qilish: `amend` va `restore`

[← Oldingi: Yaxshi commit](10-yaxshi-commit.md) · [Mundarija](README.md) · [Keyingi: Teglar va alias'lar →](12-teglar-va-aliaslar.md)

## Tushuncha

Ishlayotganda xato qilish tabiiy: commit'ni erta qilib, faylni qo'shishni unutdingiz; xabarda imlo xatosi; `git add .` keraksiz faylni ham stage qildi; yoki faylga kiritgan o'zgarishlaringiz umuman kerak emas. Bu bob kundalik **bekor qilish** amallarini o'rgatadi — har biri uch hududdan ([05-bob](05-uch-holat.md)) bittasini orqaga qaytaradi:

| Xato qayerda | Nima qilmoqchisiz | Hozirgi buyruq | Eski yo'l (Pro Git, eski maqolalar) |
| --- | --- | --- | --- |
| Oxirgi **commit** | Xabarni yoki tarkibni tuzatish | `git commit --amend` | — (o'zi) |
| **Index** (staging) | Faylni stage'dan chiqarish (unstage) | `git restore --staged <fayl>` | `git reset HEAD <fayl>` |
| **Working tree** | Fayldagi o'zgarishni tashlash | `git restore <fayl>` | `git checkout -- <fayl>` |
| Index **va** working tree | Faylni oxirgi commit holatiga to'liq qaytarish | `git restore -s@ -SW <fayl>` | `git checkout HEAD -- <fayl>` |

Pro Git bu bo'limni ogohlantirish bilan boshlaydi: bekor qilishning ba'zilarini o'zini **bekor qilib bo'lmaydi**. Bu — Git'da xato qilsangiz ishingizni yo'qotishingiz mumkin bo'lgan kam sohalardan biri. Shuning uchun har buyruq uchun "nima yo'qolishi mumkin" degan savolga alohida javob beramiz.

Bu bob **kundalik** amallar haqida. `reset` ning to'liq modeli (uch daraxt, `--soft`/`--mixed`/`--hard`) — [39-bobda](39-reset-sirlari.md), push qilingan commit'ni bekor qilish (`revert`) — [26-bobda](26-murakkab-merge.md), yo'qolgan narsani topish — [42-bobda](42-reflog-va-tiklash.md).

## Nega shunday: nega `git status` o'zi yo'l ko'rsatadi

Pro Git bir qulaylikni alohida ta'kidlaydi: ikki hududning holatini ko'rsatadigan buyruq — `git status` — ularni qanday bekor qilishni ham **eslatib turadi**. Har bo'lim ostida qavs ichida maslahat bor:

```text
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)          ← index'ni bekor qilish
...
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)   ← working tree'ni
```

Bu maslahatlar Git versiyasi bilan o'zgargan. Pro Git'ning birinchi qismi eski Git bilan yozilgan, u yerda `git status` boshqacha maslahat beradi:

```text
  (use "git reset HEAD <file>..." to unstage)
  (use "git checkout -- <file>..." to discard changes in working directory)
```

Sababi tarixiy: avval bu ishlarni `reset` va `checkout` bajarardi — har biri juda ko'p vazifali buyruq. `checkout` ham branch almashtirar, ham faylni tiklardi; bitta noto'g'ri argument butunlay boshqa ish qilardi (pastda misol bor). Git 2.23 da shu vazifalarni ajratish uchun ikki yangi buyruq qo'shildi: `git switch` (branch almashtirish) va `git restore` (fayllarni tiklash). Uzoq vaqt ular "experimental" deb belgilangan edi; Git 2.51 reliz yozuvlariga ko'ra endi **eksperimental emas**. Eski buyruqlar ham ishlaydi va ishlayveradi — eski maqolalarda, skriptlarda ko'rasiz.

Bu bobdagi qoida: **hozirgi Git `git status` da nimani maslahat bersa — shuni ishlating.**

## Kod: `commit --amend` — oxirgi commit'ni almashtirish

### Unutilgan fayl

Eng ko'p uchraydigan holat: commit qildingiz, keyin faylni qo'shishni unutganingizni ko'rdingiz.

```bash
$ git add app.py
$ git commit -m "Ko'paytmani hisoblash"
[main 5c2f252] Ko'paytmani hisoblash
 1 file changed, 2 insertions(+)
$ git status -s
?? hisob.py
```

`app.py` `hisob.py` dan import qiladi, lekin `hisob.py` commit'ga kirmadi — bu commit'ni checkout qilgan odamda kod ishlamaydi. "Unutilgan faylni qo'shish" degan yangi commit qilish mumkin, lekin tarix keraksiz commit bilan to'ladi va oraliq commit buzuq qoladi ([10-bob](10-yaxshi-commit.md), atomarlik). Pro Git yo'li — unutilganni stage qilib, `--amend`:

```bash
$ git add hisob.py
$ git commit --amend
```

Muharrir ochiladi va unda **oldingi commit xabari** turadi (oddiy `commit` da bo'sh bo'lardi). Muharrir nima ko'rsatishini ko'rish uchun `GIT_EDITOR=cat` bilan (o'zgartirmaydi, faqat chiqaradi):

```bash
$ GIT_EDITOR=cat git commit --amend
Ko'paytmani hisoblash

# Please enter the commit message for your changes. Lines starting
# with '#' will be ignored, and an empty message aborts the commit.
#
# Date:      Wed Oct 7 10:10:00 2026 +0500
#
# On branch main
# Changes to be committed:
#	modified:   app.py
#	new file:   hisob.py
#
[main 4d5e0f1] Ko'paytmani hisoblash
 Date: Wed Oct 7 10:10:00 2026 +0500
 2 files changed, 4 insertions(+)
 create mode 100644 hisob.py
```

Endi commit ikkala faylni o'z ichiga oladi. E'tibor bering: status bo'limida `app.py` ham ko'rinadi — u stage qilinmagan bo'lsa ham. Sababi: amend **oldingi commit'ning otasiga** nisbatan yangi surat yasaydi, va bu suratda `app.py` ham, `hisob.py` ham o'zgargan.

Xabarni o'zgartirmaslik kerak bo'lsa, muharrirni ochmaslik uchun `--no-edit`:

```bash
git add hisob.py
git commit --amend --no-edit
```

### Faqat xabarni tuzatish

Pro Git: oxirgi commit'dan keyin hech narsa stage qilinmagan bo'lsa, surat aynan bir xil qoladi, o'zgaradigan yagona narsa — xabar.

```bash
$ git commit --amend -m "Ko'paytmani hisoblash moduli"
[main d70094f] Ko'paytmani hisoblash moduli
 Date: Wed Oct 7 10:10:00 2026 +0500
 2 files changed, 4 insertions(+)
 create mode 100644 hisob.py
$ git rev-parse HEAD^{tree} HEAD@{1}^{tree}
d57754bb28f10aaf2f4a0e9c530ed3020f32a815
d57754bb28f10aaf2f4a0e9c530ed3020f32a815
```

Tree bir xil (`d57754b`) — surat o'zgarmadi. Commit hash'i esa boshqa (`4d5e0f1` → `d70094f`), chunki commit obyekti xabarni ham o'z ichiga oladi ([16-bob](16-commit-obyekti.md)).

**Muammo.** Index'da boshqa narsa stage qilingan bo'lsa-chi? Masalan, keyingi commit uchun `README.md` ni tayyorlab qo'ygansiz, lekin hozir faqat xabarni tuzatmoqchisiz. Oddiy `--amend` `README.md` ni ham commit'ga qo'shib yuboradi. **Yechim** — `--only` (`-o`). Ma'lumotnoma: `--amend` bilan birga berilsa, yo'l ko'rsatish shart emas va oxirgi commit stage qilingan o'zgarishlarsiz tuzatiladi:

```bash
$ echo "# TODO" >> README.md
$ git add README.md
$ git commit --amend --only -m "hisob: ko'paytma funksiyasini qo'shish"
[main a25aef8] hisob: ko'paytma funksiyasini qo'shish
 Date: Wed Oct 7 10:10:00 2026 +0500
 2 files changed, 4 insertions(+)
 create mode 100644 hisob.py
$ git status
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	modified:   README.md
```

Commit'da hali ham faqat `app.py` va `hisob.py`, `README.md` esa index'da kutib turibdi.

### Muallifni tuzatish

Amend qilingan commit ma'lumotnomaga ko'ra **o'sha ota va o'sha muallif**ga ega bo'ladi. Muallif noto'g'ri bo'lsa (masalan, `user.email` sozlanmagan kompyuterda commit qildingiz — [03-bob](03-birinchi-sozlash.md)), ikki yo'l bor:

```bash
$ git commit --amend --no-edit --only --author="Vali Aliyev <vali@example.com>"
$ git log -1 --format='%h %an <%ae> | %cn | %ad'
cf64012 Vali Aliyev <vali@example.com> | Ali Valiyev | Wed Oct 7 10:10:00 2026 +0500
$ git commit --amend --no-edit --only --reset-author
$ git log -1 --format='%h %an <%ae> | %cn | %ad'
37701ef Ali Valiyev <ali@example.com> | Ali Valiyev | Wed Oct 7 10:25:00 2026 +0500
```

`--author` muallifni berilgan qiymatga o'rnatadi (sana saqlanadi). `--reset-author` esa "muallif endi men — commit qiluvchi" deydi va **muallik sanasini ham yangilaydi** (10:10 → 10:25). (Bu misollar ko'rsatish uchun; quyida biz `a25aef8` holatidan davom etamiz.)

### Ichkarida nima bo'ladi: amend — almashtirish, tuzatish emas

Pro Git'dagi eng muhim eslatma: amend oxirgi commit'ni **tuzatmaydi** — uni butunlay yangi, yaxshilangan commit bilan **almashtiradi**. Eski commit chetga suriladi va tarixda xuddi u hech qachon bo'lmagandek ko'rinadi.

Buni obyektlarda ko'ramiz. Amend'dan oldingi commit:

```bash
$ git cat-file -p 5c2f252
tree 57df4c3c76d087c7074217350b02ee07bdd465b7
parent 7c72917cab7929509f274f84a5f22aa66ec955b7
author Ali Valiyev <ali@example.com> 1791349800 +0500
committer Ali Valiyev <ali@example.com> 1791349800 +0500

Ko'paytmani hisoblash
```

Amend'dan keyingi (5 daqiqadan so'ng):

```bash
$ git cat-file -p 4d5e0f1
tree d57754bb28f10aaf2f4a0e9c530ed3020f32a815
parent 7c72917cab7929509f274f84a5f22aa66ec955b7
author Ali Valiyev <ali@example.com> 1791349800 +0500
committer Ali Valiyev <ali@example.com> 1791350100 +0500

Ko'paytmani hisoblash
```

Farqlar va o'xshashliklar:

| Maydon | O'zgardimi | Nega |
| --- | --- | --- |
| `tree` | ha (`57df4c3` → `d57754b`) | `hisob.py` qo'shildi — yangi surat |
| `parent` | **yo'q** (`7c72917`) | Yangi commit eskisining **otasiga** ulanadi, eskisining o'ziga emas |
| `author` (ism va sana) | yo'q | Ma'lumotnoma: muallif saqlanadi |
| `committer` sanasi | ha (`1791349800` → `1791350100`) | Commit obyekti hozir yaratildi |
| Hash | ha (`5c2f252` → `4d5e0f1`) | Mazmun o'zgardi, demak hash ham |

Shuning uchun commit chiqishida `Date: Wed Oct 7 10:10:00 2026` qatori bor — Git sizga muallik sanasi eskicha qolganini eslatadi.

```text
Oldin:   91a17e6 --- 7c72917 --- 5c2f252   ← main

Keyin:   91a17e6 --- 7c72917 --- 4d5e0f1   ← main
                            \
                             5c2f252          (branch'siz, faqat reflog'da)
```

Eski commit o'chirilmadi — u obyektlar bazasida turibdi va reflog uni eslaydi ([42-bob](42-reflog-va-tiklash.md)):

```bash
$ git cat-file -t 5c2f252
commit
$ git reflog -3
4d5e0f1 HEAD@{0}: commit (amend): Ko'paytmani hisoblash
5c2f252 HEAD@{1}: commit: Ko'paytmani hisoblash
7c72917 HEAD@{2}: commit: Ilova kodini qo'shish
```

Ma'lumotnoma `--amend` ni taxminan shunga teng deydi ([39-bob](39-reset-sirlari.md)):

```bash
git reset --soft HEAD^
# ... to'g'ri tree'ni tayyorlash ...
git commit -c ORIG_HEAD
```

Lekin ikki farq bor: `--amend` merge commit'ni ham tuzata oladi (uning ikkala otasi saqlanadi), va u `ORIG_HEAD` ni o'rnatmaydi — sinovda amend'dan keyin `.git/ORIG_HEAD` paydo bo'lmadi. Shuning uchun amend'ni bekor qilishda `ORIG_HEAD` emas, `HEAD@{1}` ishlatiladi.

### Amend'ni bekor qilish

Amend paytida keraksiz narsa qo'shib yubordingiz deylik — masalan, parol yozilgan fayl:

```bash
$ echo "parol=12345" > sozlama.txt
$ git add sozlama.txt
$ git commit -q --amend --no-edit
$ git show --stat --format=%h HEAD
e716907

 app.py      | 2 ++
 hisob.py    | 2 ++
 sozlama.txt | 1 +
 3 files changed, 5 insertions(+)
```

`HEAD@{1}` — amend'dan oldingi commit. `reset --soft` branch'ni unga qaytaradi, index va working tree'ga tegmaydi:

```bash
$ git reset --soft HEAD@{1}
$ git log --oneline -1
a25aef8 hisob: ko'paytma funksiyasini qo'shish
$ git status -s
A  sozlama.txt
```

Commit avvalgi holatida, `sozlama.txt` esa stage qilingan — uni endi `git restore --staged` bilan chiqarib olish mumkin (pastda). Diqqat: `e716907` commit'i va `sozlama.txt` blob'i hali obyektlar bazasida bor. Push qilinmagan bo'lsa, xavf yo'q; reflog muddati tugagach `gc` ularni tozalaydi ([18-bob](18-packfile-va-gc.md)). Agar parol **push qilingan** bo'lsa — uni almashtiring: tarixdan olib tashlash yetmaydi ([42-bob](42-reflog-va-tiklash.md)).

### Push qilingan commit'ni amend qilmang

Pro Git qat'iy: **faqat hali lokal, hech qayerga push qilinmagan commit'larni amend qiling.** Push qilingan commit'ni amend qilib, keyin branch'ni majburan push qilish hamkasblaringizga muammo tug'diradi.

Nega? Ko'ramiz. Lokal bare repo'ga ([04-bob](04-repo-olish.md)) push qilamiz, keyin amend:

```bash
$ git push -q -u origin main
$ git commit --amend -q -m "hisob: kopaytma() funksiyasini qo'shish"
$ git log --oneline --all --graph
* 14b302c hisob: kopaytma() funksiyasini qo'shish
| * a25aef8 hisob: ko'paytma funksiyasini qo'shish
|/  
* 7c72917 Ilova kodini qo'shish
* 91a17e6 Boshlang'ich commit
$ git status -sb
## main...origin/main [ahead 1, behind 1]
```

Bitta xabarni o'zgartirdik, Git esa endi ikki **ajralgan** tarixni ko'radi: lokal `main` da `14b302c`, `origin/main` da `a25aef8`. Push rad etiladi:

```bash
$ git push
To ../11-markaz.git
 ! [rejected]        main -> main (non-fast-forward)
error: failed to push some refs to '../11-markaz.git'
hint: Updates were rejected because the tip of your current branch is behind
hint: its remote counterpart. If you want to integrate the remote changes,
hint: use 'git pull' before pushing again.
...
```

Bu yerda `git pull` maslahatiga amal qilsangiz, eski va yangi commit birlashtiriladi — tarixda ikki bir xil commit va merge paydo bo'ladi. `git push --force` qilsangiz, `a25aef8` ni olib ketgan hamkasblaringizning tarixi sizniki bilan ajraladi ([24-bob](24-rebase.md), "rebase xavfi" — aynan shu muammo). Amal qilish uchun ikki yo'l:

- **Amend'dan voz kechish** — branch'ni remote holatiga qaytarish. `--keep` ([39-bob](39-reset-sirlari.md)) commit qilinmagan ishni saqlaydi:

  ```bash
  $ git reset --keep origin/main
  $ git status -sb
  ## main...origin/main
  ```

- **Branch faqat sizniki bo'lsa** (masalan, hali ko'rib chiqilmagan shaxsiy feature branch) — `git push --force-with-lease`: remote siz kutgan holatda bo'lsagina ustidan yozadi ([29-bob](29-fetch-push-ichidan.md)).

Push qilingan commit'dagi xatoni ochiq tuzatishning to'g'ri yo'li — yangi commit yoki `git revert`.

## Kod: stage'dan chiqarish — `git restore --staged`

Pro Git misoli: ikki faylni alohida commit qilmoqchi edingiz, lekin `git add *` ikkalasini ham stage qildi. Bittasini qanday chiqarish mumkin? `git status` aytadi:

```bash
$ git status
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	modified:   README.md

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   app.py

$ git restore --staged README.md
$ git status
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   README.md
	modified:   app.py

no changes added to commit (use "git add" and/or "git commit -a")
$ cat README.md
Loyiha
# TODO
```

`README.md` index'dan chiqdi, lekin fayldagi o'zgarish (`# TODO`) **joyida**. `--staged` faqat index'ni o'zgartiradi: index'dagi yozuvni HEAD'dagi versiya bilan almashtiradi. Bu `git add` ning teskarisi — `add` working tree'dan index'ga ko'chiradi, `restore --staged` HEAD'dan index'ga. Working tree'ga tegilmaydi, shuning uchun bu buyruq **xavfsiz**: hech narsa yo'qolmaydi.

Bir nechta fayl yoki hammasi: `git restore --staged .`

### Eski yo'l: `git reset HEAD <fayl>`

Pro Git (va eski Git'ning `git status` i) xuddi shu ishni `reset` bilan qiladi:

```bash
$ git add README.md
$ git reset HEAD README.md
Unstaged changes after reset:
M	README.md
$ git status -s
 M README.md
```

Natija bir xil. Pro Git o'zi buni "biroz g'alati, lekin ishlaydi" deydi va ogohlantiradi: `reset` xavfli buyruq bo'lishi mumkin (`--hard` bilan), lekin fayl nomi bilan u working tree'ga tegmaydi. Nega aynan shunday ishlashi — "yo'l bilan reset 1-qadamni tashlab ketadi" — [39-bobda](39-reset-sirlari.md). `HEAD` ni yozmasa ham bo'ladi: `git reset README.md` yoki aniqroq `git reset -- README.md`.

### Birinchi commit'dan oldin

Hali birorta commit bo'lmagan repo'da HEAD hech narsani ko'rsatmaydi — `restore --staged` "HEAD'dan nusxa ol" deya olmaydi:

```bash
$ git init -q -b main
$ git add README.md app.py
$ git status
On branch main

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
	new file:   README.md
	new file:   app.py

$ git restore --staged app.py
fatal: could not resolve 'HEAD'
$ git rm --cached -q app.py
$ git status -s
A  README.md
?? app.py
```

`git status` bu holatda boshqa maslahat beradi — `git rm --cached` ([08-bob](08-gitignore-rm-mv.md)). U faylni index'dan o'chiradi va fayl yana untracked bo'ladi. Qiziq tafsilot: eski yo'l `git reset <fayl>` bu yerda ham ishlaydi (sinovda xatosiz bajarildi) — `restore --staged` esa yo'q.

Commit'lar bor repo'da **yangi** (HEAD'da yo'q) faylga `restore --staged` ham xuddi shunday ishlaydi — fayl untracked bo'lib qoladi:

```bash
$ echo yangi > yangi.txt
$ git add yangi.txt
$ git restore --staged yangi.txt
$ git status -s
?? yangi.txt
```

## Kod: o'zgarishni tashlash — `git restore <fayl>`

Endi `app.py` dagi o'zgarish umuman kerak emas — faylni oxirgi commit (yoki clone) qilingan holatiga qaytarmoqchisiz. `git status` buni ham aytadi:

```bash
$ git status -s
 M app.py
$ git restore app.py
$ git status -s
$ cat app.py
from hisob import kopaytma
print("salom")
print(kopaytma(2, 3))
```

> **Ogohlantirish.** Pro Git: `git restore <fayl>` — **xavfli** buyruq. O'sha fayldagi barcha lokal o'zgarishlar yo'qoladi — Git faylni shunchaki oxirgi stage qilingan yoki commit qilingan versiya bilan almashtiradi. Saqlanmagan o'zgarishlar kerak emasligiga **mutlaqo** ishonchingiz komil bo'lmasa, bu buyruqni ishlatmang.

Nega qaytarib bo'lmaydi? Chunki o'zgarish hech qachon `git add` qilinmagan — Git'da uning blob'i yo'q ([14-bob](14-obyektlar-blob.md)), reflog ham faqat commit'larni eslaydi. Pro Git xulosasi: **Git'da commit qilingan narsani deyarli har doim tiklash mumkin** (o'chirilgan branch'dagi commit'lar ham, `--amend` bilan almashtirilganlar ham). **Lekin hech qachon commit qilinmagan narsani yo'qotsangiz, ehtimol uni boshqa ko'rmaysiz.**

O'zgarishni saqlab qolib, faqat yo'ldan olib qo'ymoqchi bo'lsangiz — `git stash` yoki alohida branch yaxshiroq ([38-bob](38-stash-va-clean.md), [21-bob](21-branch-va-merge.md)).

### Qaysi versiyaga qaytadi: index'ga, HEAD'ga emas

Ma'lumotnoma: `--staged` berilmasa, `restore` faylni **index'dan** tiklaydi (`--staged` bilan — HEAD'dan). Odatda index HEAD bilan bir xil, shuning uchun farq ko'rinmaydi. Lekin fayl stage qilingandan keyin yana tahrirlangan bo'lsa (`MM` holati):

```bash
$ git add README.md                  # "# TODO" stage qilindi
$ echo "# yana" >> README.md         # yana tahrir
$ git status -s
MM README.md
$ git restore README.md
$ cat README.md
Loyiha
# TODO
$ git status -s
M  README.md
```

Faqat **stage qilinmagan** qism (`# yana`) tashlandi; stage qilingan `# TODO` qoldi. Ya'ni `git restore <fayl>` — "oxirgi `git add` dan keyingi o'zgarishlarni tashla". Faylni butunlay oxirgi commit holatiga (index'ni ham) qaytarish uchun manbani HEAD qilib, ikkala joyni ko'rsating:

```bash
$ git restore --source=HEAD --staged --worktree README.md
$ cat README.md
Loyiha
$ git status -s
```

Ma'lumotnomadagi qisqa yozuv — "amaliyroq, lekin o'qilishi qiyinroq":

```bash
git restore -s@ -SW README.md
```

Bu yerda `@` — `HEAD` ning qisqa nomi ([19-bob](19-revision-tanlash.md)), `-S` — `--staged`, `-W` — `--worktree`.

### `restore` ning uch o'qi

`restore` ni ikki savol bilan tushunish mumkin: **qayerga** yozish va **qayerdan** olish.

| Buyruq | Qayerga | Qayerdan (standart) | Natija |
| --- | --- | --- | --- |
| `git restore <fayl>` | working tree | index | Stage qilinmagan o'zgarish tashlanadi |
| `git restore --staged <fayl>` | index | HEAD | Unstage; working tree joyida |
| `git restore -SW <fayl>` | index + working tree | HEAD | Fayl oxirgi commit holatida |
| `git restore -s <commit> <fayl>` | working tree | `<commit>` | Faylning eski versiyasi (index o'zgarmaydi) |

```text
            --source=<commit>
                   │
    HEAD ──(--staged)──► index ──(standart)──► working tree
                   │                               ▲
                   └────────(--staged --worktree)──┘
```

`--source` ga istalgan commit, branch yoki teg berish mumkin. Ma'lumotnomadagi misol: `git restore --source master~2 Makefile` — `Makefile` ni ikki commit oldingi holatga qaytarish. Maxsus holat: `A...B` — ikki commit'ning merge-base'i ([21-bob](21-branch-va-merge.md)).

### O'chirilgan fayllar, glob va papkalar

Faylni tasodifan `rm` bilan o'chirdingizmi? U index'da hali bor — `restore` uni qaytaradi:

```bash
$ rm app.py hisob.py
$ git status -s
 D app.py
 D hisob.py
$ git restore '*.py'
$ git status -s
$ ls
README.md
app.py
hisob.py
```

`'*.py'` dagi **qo'shtirnoq** muhim. Ma'lumotnoma tushuntiradi: qo'shtirnoqsiz shell `*.py` ni working tree'dagi fayllar bo'yicha ochadi — o'chirilgan fayllar u yerda yo'q, ular tiklanmaydi. Qo'shtirnoq bilan esa pattern Git'ga yetib boradi va **index**'dagi yozuvlar bilan solishtiriladi.

Joriy papkadagi hamma narsa: `git restore .` Butun repo (qaysi papkada bo'lishingizdan qat'i nazar): `git restore :/` (`:/` — "repo ildizi" pathspec belgisi, `gitglossary`).

### Hunk bo'yicha: `restore -p`

Fayldagi o'zgarishning bir qismini tashlab, qolganini saqlash mumkin. Masalan, ikkita debug o'zgarishdan faqat `print` ni olib tashlaymiz:

```bash
$ git diff
...
@@ -1,4 +1,4 @@
-# Hisob moduli
+# Hisob moduli (debug)
...
@@ -8,4 +8,5 @@ def kopaytma(a, b):
...
 def bolinma(a, b):
+    print("DEBUG", a, b)
     return a / b
$ git restore -p hisob.py
...
(1/2) Discard this hunk from worktree [y,n,q,a,d,k,K,j,J,g,/,e,p,P,?]? n
...
(2/2) Discard this hunk from worktree [y,n,q,a,d,K,J,g,/,e,p,P,?]? y
$ git diff
...
-# Hisob moduli
+# Hisob moduli (debug)
 def kopaytma(a, b):
     return a * b
```

Savol "Discard ... from worktree" — `y` tanlangan hunk qaytarib bo'lmas tashlanadi. Interaktiv rejimning hamma buyruqlari [37-bobda](37-interaktiv-staging.md).

### Konfliktdagi fayllar

`restore` merge konfliktida ham ishlatiladi: `--ours`/`--theirs` konfliktli faylni bir tomonning versiyasi bilan almashtiradi, `-m` (`--merge`) esa asl konflikt belgilarini qaytadan yaratadi (masalan, qo'lda yechishni buzib qo'ysangiz). Bu [22-bobda](22-konfliktlar.md).

## Kod: eski yo'l — `git checkout -- <fayl>`

Pro Git (eski `git status` maslahatiga ko'ra) o'zgarishni shunday tashlaydi:

```bash
$ echo "o'zgarish" >> README.md
$ git checkout -- README.md
$ git status -s
$ cat README.md
Loyiha
```

Natija `git restore README.md` bilan bir xil, va Pro Git xuddi shunday ogohlantiradi: `git checkout -- <fayl>` xavfli, lokal o'zgarishlar yo'qoladi. Variantlari:

| Eski buyruq | Hozirgi ekvivalenti |
| --- | --- |
| `git checkout -- <fayl>` | `git restore <fayl>` |
| `git checkout HEAD -- <fayl>` | `git restore -s@ -SW <fayl>` |
| `git checkout <commit> -- <fayl>` | `git restore -s <commit> -SW <fayl>` |
| `git reset HEAD <fayl>` | `git restore --staged <fayl>` |
| `git checkout -p` | `git restore -p` |

Diqqat: `checkout <commit> -- <fayl>` faylni **index'ga ham** yozadi (ma'lumotnoma: "replace ... and add them to the index"), shuning uchun ekvivalenti `-SW`, faqat `-s <commit>` emas.

### Nega `--` kerak: `checkout` ning ikki ma'nosi

Ma'lumotnoma: `git checkout <nimadir>` da Git `<nimadir>` branch/commit'mi yoki fayllarmi — **taxmin qiladi**, va noaniqlik bo'lsa uni **branch** deb oladi. Fayl nomi bilan bir xil branch bo'lsa nima bo'lishini ko'ramiz:

```bash
$ git branch hisob.py              # fayl bilan bir xil nomli branch
$ echo x >> hisob.py
$ git checkout hisob.py
Switched to branch 'hisob.py'
M	hisob.py
$ git status -s
 M hisob.py
```

Faylni tiklash o'rniga Git **branch almashtirdi**, o'zgarish esa joyida qoldi. `--` dan keyingi hamma narsa — faqat fayl nomi:

```bash
$ git switch -q main
$ git checkout -- hisob.py
$ git status -s
```

Bunday noaniqlik `restore` da umuman yo'q — u faqat fayllar bilan ishlaydi, branch almashtirish esa `switch` ning ishi. `restore` ni ajratib chiqarishning asosiy sababi shu.

### `checkout` va `restore` ning farqi: overlay rejimi

Bir nozik farq bor. Ma'lumotnomaga ko'ra `git checkout <commit> -- <papka>` standart holatda **overlay** rejimida ishlaydi: manbada yo'q fayllarni hech qachon o'chirmaydi. `git restore --source` esa standart holatda **no-overlay**: manbada yo'q tracked fayllarni o'chirib, papkani manbaga **aniq** moslaydi. Sinov: `HEAD~1` da `hisob.py` yo'q.

```bash
$ git checkout HEAD~1 -- .
$ git status -s
M  app.py
$ ls
README.md
app.py
hisob.py
```

```bash
$ git restore --source=HEAD~1 --staged --worktree .
$ git status -s
M  app.py
D  hisob.py
$ ls
README.md
app.py
```

`checkout` `app.py` ni almashtirdi, lekin `hisob.py` ni qoldirdi — natija hech qachon mavjud bo'lmagan aralash holat. `restore` papkani `HEAD~1` ga to'liq tenglashtirdi. Kerak bo'lsa, xatti-harakatni `--overlay`/`--no-overlay` bilan almashtirish mumkin.

## Muhandislik nuqtai nazari: nimani yo'qotish mumkin

Bobdagi har buyruqni "xavf" bo'yicha tartiblaymiz:

| Buyruq | O'zgaradi | Yo'qolishi mumkin | Qaytarish |
| --- | --- | --- | --- |
| `git restore --staged <fayl>` | index | hech narsa | `git add <fayl>` |
| `git reset HEAD <fayl>` | index | hech narsa | `git add <fayl>` |
| `git commit --amend` (lokal) | branch uchi, yangi commit obyekti | hech narsa (eski commit reflog'da) | `git reset --soft HEAD@{1}` |
| `git commit --amend` + `push --force` | remote tarix | **boshqalarning** ishi bilan ziddiyat | Qiyin; hamkasblar bilan kelishish ([24-bob](24-rebase.md)) |
| `git restore <fayl>` | working tree | **stage qilinmagan o'zgarishlar** | Yo'q |
| `git restore -s@ -SW <fayl>` | index + working tree | stage qilinmagan o'zgarishlar (stage qilinganlari dangling blob bo'lib qoladi) | Faqat blob — `git fsck --lost-found` ([42-bob](42-reflog-va-tiklash.md)) |
| `git checkout -- <fayl>` | working tree | **stage qilinmagan o'zgarishlar** | Yo'q |

Qoida: index'ga tegadigan buyruqlar xavfsiz, **working tree**'ga tegadiganlar — xavfli. Shubha bo'lsa, avval `git diff <fayl>` bilan nima yo'qolishini ko'ring yoki `git stash` qiling.

Ichkarida nima o'zgaradi:

- `restore --staged` — faqat `.git/index` (faylning blob hash'i HEAD'dagi bilan almashtiriladi; [15-bob](15-tree-va-index.md)). Yangi obyekt yaratilmaydi.
- `restore` (working tree) — faqat diskdagi fayl. Git'ning ichki fayllari o'zgarmaydi.
- `commit --amend` — yangi tree (agar tarkib o'zgarsa) va yangi commit obyekti, `.git/refs/heads/<branch>` yangi hash'ga, `.git/logs/HEAD` ga `commit (amend)` yozuvi. Eski commit obyekti o'chirilmaydi.

## Muhandislik nuqtai nazari: qaysi buyruqni tanlash

```text
Xato commit'dami?
├── Ha, oxirgi commit'da, hali push qilinmagan  → git commit --amend
├── Ha, eskiroq commit'da, push qilinmagan       → git commit --fixup=<commit> + rebase -i --autosquash (25-bob)
└── Ha, push qilingan                             → yangi commit yoki git revert (26-bob)

Xato index'dami (noto'g'ri narsa stage qilingan)?
└── git restore --staged <fayl>       (birinchi commit'dan oldin: git rm --cached <fayl>)

Xato working tree'dami (o'zgarish kerak emas)?
├── Butunlay kerak emas, ishonchim komil         → git restore <fayl>
├── Bir qismi kerak emas                         → git restore -p <fayl>
└── Keyinroq kerak bo'lishi mumkin               → git stash (38-bob)

Bir nechta commit'ni bekor qilish / birlashtirish?
└── git reset (39-bob)
```

Ma'lumotnomadagi uch o'xshash nom farqi (`git help git`, "Reset, restore and revert"): `revert` — boshqa commit'larni bekor qiladigan **yangi commit**; `restore` — fayllarni index yoki commit'dan tiklaydi, **branch'ni o'zgartirmaydi**; `reset` — branch uchini ko'chiradi, **tarixni o'zgartiradi** (va index'ni tiklashda `restore` bilan ustma-ust tushadi).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Unutilgan fayl uchun "faylni unutibman" commit'i | Tarix shovqinga to'ladi, oraliq commit buzuq | Push qilinmagan bo'lsa — `git add` + `git commit --amend --no-edit` |
| Push qilingan commit'ni amend qilib `push --force` | Hamkasblarning tarixi ajraladi | `git revert` yoki yangi commit; amend'ni `git reset --keep origin/<branch>` bilan bekor qiling |
| Faqat xabarni tuzatmoqchi bo'lib, index'dagi narsani ham amend'ga qo'shib yuborish | Keyingi commit uchun tayyorlangan o'zgarish noto'g'ri commit'ga tushadi | `git commit --amend --only` |
| Amend'ni `ORIG_HEAD` bilan bekor qilishga urinish | Amend `ORIG_HEAD` ni o'rnatmaydi | `git reset --soft HEAD@{1}` |
| `git restore <fayl>` ni "unstage" deb o'ylash | Working tree'dagi o'zgarish qaytarib bo'lmas yo'qoladi | Unstage — `git restore --staged <fayl>` |
| `git restore <fayl>` faylni oxirgi commit'ga qaytaradi deb o'ylash | Index'dan tiklaydi — stage qilingan o'zgarish qoladi | `git restore -s@ -SW <fayl>` |
| Yangi repo'da `git restore --staged` | `fatal: could not resolve 'HEAD'` | `git rm --cached <fayl>` |
| `git checkout <fayl>` ni `--` siz yozish | Fayl nomi branch nomiga to'g'ri kelsa, branch almashadi | `git restore <fayl>` yoki `git checkout -- <fayl>` |
| `git restore *.py` (qo'shtirnoqsiz) bilan o'chirilgan fayllarni qaytarish | Shell faqat mavjud fayllarni ochadi, o'chirilganlar tiklanmaydi | `git restore '*.py'` |
| `git checkout <commit> -- <papka>` papkani aniq tiklaydi deb o'ylash | Overlay rejimi: manbada yo'q fayllar qoladi | `git restore --source=<commit> -SW <papka>` |
| Kerak bo'lishi mumkin bo'lgan o'zgarishni `restore` bilan tashlash | Commit qilinmagan narsa tiklanmaydi | `git stash` yoki vaqtinchalik branch |

## Amaliyot

1. Commit qiling, keyin yangi faylni qo'shishni unutganingizni "kashf eting" va `git add` + `git commit --amend --no-edit` bilan tuzating. Amend'dan oldin va keyin `git cat-file -p HEAD` ni solishtiring: qaysi maydonlar o'zgardi, qaysilari yo'q?
2. Faqat xabarni `--amend -m` bilan o'zgartiring va `git rev-parse HEAD^{tree} HEAD@{1}^{tree}` bilan tree o'zgarmaganini, `git rev-parse HEAD HEAD@{1}` bilan commit hash'i o'zgarganini tasdiqlang.
3. Index'ga boshqa faylni stage qilib qo'yib, oxirgi commit xabarini `--amend --only` bilan tuzating. `git status` va `git show --stat` bilan stage qilingan fayl commit'ga tushmaganini tekshiring.
4. Amend paytida keraksiz faylni qo'shing, keyin `git reset --soft HEAD@{1}` va `git restore --staged` bilan hammasini oldingi holatga qaytaring.
5. Bitta faylni stage qiling, keyin yana tahrirlang (`MM`). `git restore <fayl>`, `git restore --staged <fayl>` va `git restore -s@ -SW <fayl>` ning har biridan keyin `git status -s` va `git diff`, `git diff --cached` nima ko'rsatishini oldindan aytib, keyin tekshiring.
6. Ikki faylni `rm` bilan o'chiring va ularni `git restore '*.<kengaytma>'` bilan qaytaring. Qo'shtirnoqsiz urinib, farqni tushuntiring.
7. Fayl nomi bilan bir xil branch yarating va `git checkout <nom>`, `git checkout -- <nom>`, `git restore <nom>` natijalarini solishtiring.
8. (Qiyinroq) Lokal bare repo yarating, commit'ni push qiling, keyin uni amend qiling. `git status -sb` va `git log --oneline --all --graph` nima ko'rsatishini tushuntiring; `git push` rad etilishini ko'ring va vaziyatni ikki usulda hal qiling: `git reset --keep origin/main` hamda (ikkinchi klonda hamkasb sifatida `git pull` qilib ko'rgandan keyin) `git push --force-with-lease`. Ikkinchi klonda nima bo'lganini yozib boring.

## Rasmiy hujjat

- Pro Git — Undoing Things: <https://git-scm.com/book/en/v2/Git-Basics-Undoing-Things>
- `git restore`: <https://git-scm.com/docs/git-restore>
- `git commit` (`--amend`, `--only`, `--reset-author`): <https://git-scm.com/docs/git-commit>
- `git reset` (yo'l bilan): <https://git-scm.com/docs/git-reset>
- `git checkout` (eski yo'l, ARGUMENT DISAMBIGUATION): <https://git-scm.com/docs/git-checkout>
- `git` — Reset, restore and revert: <https://git-scm.com/docs/git#_reset_restore_and_revert>
- Git 2.51.0 reliz yozuvlari (`switch` va `restore` endi eksperimental emas): <https://github.com/git/git/blob/master/Documentation/RelNotes/2.51.0.adoc>
