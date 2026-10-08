# 25 — Tarixni qayta yozish

[← Oldingi: Rebase](24-rebase.md) · [Mundarija](README.md) · [Keyingi: Murakkab merge →](26-murakkab-merge.md)

## Tushuncha

Pro Git bu mavzuni shunday fikr bilan boshlaydi: Git'ning yaxshi tomonlaridan biri — qarorni **eng oxirgi paytda** qabul qilish mumkinligi. Qaysi fayl qaysi commit'ga tushishini commit qilishdan oldin staging'da hal qilasiz ([5-bob](05-uch-holat.md)), vaqtincha kerak bo'lmagan ishni `git stash` bilan chetga olasiz ([38-bob](38-stash-va-clean.md)). Xuddi shunday, **bo'lib o'tgan** commit'larni ham boshqacha bo'lgandek qilib qayta yozish mumkin: tartibini almashtirish, xabarini yoki mazmunini o'zgartirish, bir nechtasini birlashtirish, bittasini bo'lish yoki butunlay olib tashlash.

Oxirgi commit'ni o'zgartirish — `git commit --amend` — [11-bobda](11-bekor-qilish.md) ko'rilgan. Pro Git uni "juda kichik rebase" deb ataydi. Undan chuqurroqdagi commit'lar uchun Git'da alohida "tarixni tahrirlash" buyrug'i uzoq vaqt bo'lmagan; buning uchun rebase ishlatiladi. G'oya shunday: commit'larni **o'sha eski asosning o'zi ustiga** qayta rebase qilasiz, lekin jarayonni to'xtatib, har commit bilan nima qilishni o'zingiz aytasiz. Bu — **interaktiv rebase** (`git rebase -i`).

[24-bobdan](24-rebase.md) eslang: rebase — buyruqlar ro'yxati (`.git/rebase-merge/git-rebase-todo`) bo'yicha ishlaydigan dastur, oddiy rebase'da hamma qator `pick`. Interaktiv rebase shu ro'yxatni bajarishdan **oldin** muharrirda ochadi. Siz `pick` ni boshqa so'z bilan almashtirasiz, qatorlarni ko'chirasiz yoki o'chirasiz — Git yangi ro'yxatni bajaradi.

Bobda ishlatiladigan tarix (har bo'limda shu holatdan boshlaymiz):

```bash
$ git log --oneline
0634382 vaqtincha debug
dcc99d0 login va logout
83aea89 foydalanuvchi uchun tset
d3c8ce7 foydalanuvchi modeli
0a0ab06 loyiha boshlandi
```

Kamchiliklari ataylab qilingan: xabarda xato (`tset`), bitta commit'da ikki ish (login va logout), `user.js` da unutilgan maydon, tarixda qolmasligi kerak bo'lgan debug commit.

> **Ogohlantirish.** Bu bobdagi har amal commit'larni qayta yaratadi — hash'lar o'zgaradi. Pro Git maslahati: ishingizdan rozi bo'lmaguningizcha uni yubormang; yuborilgan ishni esa, jiddiy sabab bo'lmasa, yakuniy deb hisoblang. Boshqalar ustidan ish qilgan commit'larni qayta yozish oqibatlari — [24-bob](24-rebase.md), "oltin qoida".

## Nega shunday: nega `HEAD~3` "uchta oxirgi commit"

`git rebase -i` ga qaysi commit'dan **keyingilarni** tahrirlashni aytasiz. Hujjat: `git rebase -i <after-this-commit>` — "o'zgarmay qoladigan oxirgi commit". Oxirgi uchta commit'ni tahrirlash uchun ularning **otasini** berish kerak: `HEAD~3` (yoki `HEAD~2^`). Pro Git ta'kidlaydi: `~3` ni eslab qolish oson, lekin u aslida to'rtinchi commit'ni ko'rsatadi — tahrirlanmaydigan chegara.

Bu oddiy rebase mantig'ining o'zi: `git rebase -i HEAD~3` = "`HEAD~3..HEAD` dagi commit'larni `HEAD~3` ustiga qayta qo'y". Asos o'zgarmaydi, demak siz hech narsani o'zgartirmasangiz, natija ham o'zgarmaydi. Biror commit'ni o'zgartirsangiz — u **va undan keyingi hammasi** qayta yoziladi ([24-bob](24-rebase.md), "nega commit'ni ko'chirib bo'lmaydi").

## Kod: todo ro'yxatini ko'rish va muharrirni almashtirish

Odatda `git rebase -i` sizning muharriringizni (vi, nano, VS Code) ochadi. Qaysi muharrir ochilishini Git tartib bilan aniqlaydi (`git var` hujjati):

| Nima tahrirlanadi | Qaysi qiymat ishlatiladi (birinchi topilgani) |
| --- | --- |
| Todo ro'yxati (`git-rebase-todo`) | `$GIT_SEQUENCE_EDITOR` → `sequence.editor` → `git var GIT_EDITOR` |
| Commit xabari (`COMMIT_EDITMSG`) | `$GIT_EDITOR` → `core.editor` → `$VISUAL` → `$EDITOR` → kompilyatsiyadagi standart (odatda `vi`) |

Ikkala qiymat ham **shell buyrug'i** sifatida ishga tushiriladi, oxiriga tahrirlanadigan fayl yo'li qo'shiladi. Shuning uchun muharrir o'rniga istalgan dasturni berish mumkin — bu bobda shundan foydalanamiz: har bir misolni muharrir oynasisiz, `sed` va kichik skriptlar bilan avtomatlashtiramiz. Natija qo'lda muharrirda tahrirlagandagi bilan bir xil, faqat har qadam ko'rinib turadi.

Avval Git muharrirga qaysi fayllarni berishini ko'raylik. "Muharrir" o'rniga `echo` qo'yamiz — u faqat argumentini chiqaradi:

```bash
$ GIT_SEQUENCE_EDITOR='echo "todo fayli:"' git rebase -i HEAD~3
todo fayli: /tmp/misol/25/.git/rebase-merge/git-rebase-todo
Successfully rebased and updated refs/heads/main.
```

Endi faylning ichini ko'ramiz. `grep -v "^#"` izohlarsiz qismini, `cat` — to'liq matnni chiqaradi; ikkalasi ham faylni o'zgartirmaydi, shuning uchun rebase hech narsa qilmasdan tugaydi:

```bash
$ GIT_SEQUENCE_EDITOR=cat git rebase -i HEAD~3
pick 83aea89 # foydalanuvchi uchun tset
pick dcc99d0 # login va logout
pick 0634382 # vaqtincha debug

# Rebase d3c8ce7..0634382 onto d3c8ce7 (3 commands)
#
# Commands:
# p, pick <commit> = use commit
# r, reword <commit> = use commit, but edit the commit message
# e, edit <commit> = use commit, but stop for amending
# s, squash <commit> = use commit, but meld into previous commit
# f, fixup [-C | -c] <commit> = like "squash" but keep only the previous
#                    commit's log message, unless -C is used, in which case
#                    keep only this commit's message; -c is same as -C but
#                    opens the editor
# x, exec <command> = run command (the rest of the line) using shell
# b, break = stop here (continue rebase later with 'git rebase --continue')
# d, drop <commit> = remove commit
# l, label <label> = label current HEAD with a name
# t, reset <label> = reset HEAD to a label
# m, merge [-C <commit> | -c <commit>] <label> [# <oneline>]
#         create a merge commit using the original merge commit's
#         message (or the oneline, if no original merge commit was
#         specified); use -c <commit> to reword the commit message
# u, update-ref <ref> = track a placeholder for the <ref> to be updated
#                       to this position in the new commits. The <ref> is
#                       updated at the end of the rebase
#
# These lines can be re-ordered; they are executed from top to bottom.
#
# If you remove a line here THAT COMMIT WILL BE LOST.
#
# However, if you remove everything, the rebase will be aborted.
#
Successfully rebased and updated refs/heads/main.

$ git log --oneline -1
0634382 vaqtincha debug
```

Uch narsaga e'tibor bering.

**Tartib teskari.** `git log` eng yangisini tepada ko'rsatadi, todo ro'yxati esa **eng eskisini** tepada. Pro Git tushuntiradi: bu — Git bajaradigan skript, u yuqoridan pastga bajariladi, birinchi qayta qo'llanadigan commit — eng eskisi.

**Hash o'zgarmadi** (`0634382`). Ro'yxat o'zgarmagan, har `pick` qilinadigan commit'ning otasi ham o'zgarmagan — Git ularni qayta yasamaydi, shunchaki "o'tib ketadi" (fast-forward). Reflog'da faqat `start` va `finish` qoladi:

```bash
$ git reflog -2
0634382 HEAD@{0}: rebase (finish): returning to refs/heads/main
0634382 HEAD@{1}: rebase (start): checkout HEAD~3
```

**Izohdagi matn Git uchun emas.** Hujjat: qator oxiridagi commit sarlavhasi "faqat sizning qulayligingiz uchun"; Git **hash'ga** qaraydi. Hash'ni o'chirmang va o'zgartirmang.

Pro Git'dagi ro'yxatda `u, update-ref` va `fixup [-C | -c]` yo'q — ular keyinroq qo'shilgan; ro'yxatning hozirgi ko'rinishi yuqoridagi.

Buyruqlarni qisqa yozish ham mumkin (`p`, `r`, `e`, `s`, `f`, `x`, `b`, `d`). `rebase.abbreviateCommands = true` bo'lsa, Git ro'yxatni o'zi shunday yozadi.

### Avtomatlashtirish qoidasi

Bobdagi har misolda ikki o'zgaruvchi:

- `GIT_SEQUENCE_EDITOR="sed -i.bak '...'"` — todo ro'yxatini o'zgartiradi;
- `GIT_EDITOR="sed -i.bak '...'"` — commit xabarini o'zgartiradi.

`-i.bak` — faylni joyida o'zgartirish (zaxira nusxa `.bak` bilan); bu shakl GNU sed'da ham, macOS'dagi BSD sed'da ham bir xil ishlaydi. Misollarda committer sanasi `11:00` qilib qo'yilgan (`export GIT_COMMITTER_DATE=2026-10-07T11:00:00+05:00`) — hash'lar shu sababli takrorlanadi.

## Kod: `reword` — xabarni o'zgartirish

`83aea89` xabaridagi `tset` ni `test` ga tuzatamiz. Ro'yxatning birinchi qatorida `pick` → `reword`, keyin ochiladigan xabar faylida birinchi qatorni tuzatamiz:

```bash
$ GIT_SEQUENCE_EDITOR="sed -i.bak '1s/^pick/reword/'" \
  GIT_EDITOR="sed -i.bak '1s/tset/test/'" \
  git rebase -i HEAD~3
[detached HEAD 4a8c03d] foydalanuvchi uchun test
 Date: Wed Oct 7 10:03:00 2026 +0500
 1 file changed, 1 insertion(+)
 create mode 100644 user.test.js
Successfully rebased and updated refs/heads/main.

$ git log --oneline
061528b vaqtincha debug
7e20af0 login va logout
4a8c03d foydalanuvchi uchun test
d3c8ce7 foydalanuvchi modeli
0a0ab06 loyiha boshlandi
```

Faqat bitta commit xabari o'zgardi, lekin **uchta** hash yangi: `4a8c03d` dan keyingi `7e20af0` va `061528b` ham qayta yasaldi, chunki ularning ota-bobolari o'zgardi. `d3c8ce7` va `0a0ab06` esa o'z joyida.

`reword` paytida Git commit'ni qo'llab, xabar uchun `GIT_EDITOR` ni chaqiradi. U qaysi faylni oladi:

```bash
$ GIT_SEQUENCE_EDITOR="sed -i.bak '1s/^pick/reword/'" \
  GIT_EDITOR='echo "xabar fayli:"' \
  git rebase -i HEAD~3
xabar fayli: /tmp/misol/25/.git/COMMIT_EDITMSG
[detached HEAD ae5ddc5] foydalanuvchi uchun tset
...
```

`.git/COMMIT_EDITMSG` — oddiy `git commit` ishlatadigan o'sha fayl. `echo` uni o'zgartirmadi, xabar ham o'zgarmadi — lekin hash baribir yangi (`ae5ddc5`, asli `83aea89`): `reword` commit'ni har doim qaytadan yasaydi, committer sanasi esa yangi.

## Kod: `edit` — to'xtab, commit'ni o'zgartirish

`user.js` ga `email` maydonini qo'shishni unutgan edik — bu `d3c8ce7` ("foydalanuvchi modeli") commit'iga tegishli. To'rtta commit orqaga boramiz va birinchisini `edit` qilamiz:

```bash
$ GIT_SEQUENCE_EDITOR="sed -i.bak '1s/^pick/edit/'" git rebase -i HEAD~4
Stopped at d3c8ce7...  # foydalanuvchi modeli
You can amend the commit now, with

  git commit --amend 

Once you are satisfied with your changes, run

  git rebase --continue
```

Git commit'ni qo'llab, **to'xtadi**. Holat:

```bash
$ git status
interactive rebase in progress; onto 0a0ab06
Last command done (1 command done):
   edit d3c8ce7 # foydalanuvchi modeli
Next commands to do (3 remaining commands):
   pick 83aea89 # foydalanuvchi uchun tset
   pick dcc99d0 # login va logout
  (use "git rebase --edit-todo" to view and edit)
You are currently editing a commit while rebasing branch 'main' on '0a0ab06'.
  (use "git commit --amend" to amend the current commit)
  (use "git rebase --continue" once you are satisfied with your changes)

nothing to commit, working tree clean

$ cat .git/HEAD
d3c8ce758f462cc01b5a0611dfaa864ab2db55dc
$ cat .git/rebase-merge/amend
d3c8ce758f462cc01b5a0611dfaa864ab2db55dc
```

`HEAD` — detached, aynan asl `d3c8ce7` da (otasi o'zgarmagani uchun u qayta yasalmagan). `.git/rebase-merge/amend` fayli — "foydalanuvchi shu commit'ni amend qilishi kutilmoqda" degan belgi. Endi oddiy ishni qilamiz — faylni o'zgartirib, `--amend`:

```bash
$ cat > user.js <<'EOF'
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
}
EOF
$ git add user.js
$ git commit --amend --no-edit
[detached HEAD faee2ca] foydalanuvchi modeli
 Date: Wed Oct 7 10:02:00 2026 +0500
 1 file changed, 6 insertions(+)
 create mode 100644 user.js

$ git rebase --continue
Successfully rebased and updated refs/heads/main.

$ git log --oneline
424db98 vaqtincha debug
d5db93a login va logout
6eb40db foydalanuvchi uchun tset
faee2ca foydalanuvchi modeli
0a0ab06 loyiha boshlandi
```

`edit` faqat to'xtash nuqtasi — to'xtagan joyda nima qilishingiz sizning ishingiz: amend, yangi commit qo'shish, testlarni ishga tushirish. Bir nechta qatorni `edit` qilsangiz, Git har birida to'xtaydi.

`break` buyrug'i ham to'xtatadi, lekin hech qanday commit'ni qo'llamasdan — ro'yxatning istalgan joyiga qo'yib, o'sha nuqtada holatni ko'rish uchun. Davom etish — yana `git rebase --continue`.

## Kod: tartibni o'zgartirish va `drop`

Todo ro'yxatini butunlay qayta yozish uchun `sed` noqulay — kichik skript yozamiz. Git skriptga fayl yo'lini birinchi argument (`$1`) qilib beradi:

```bash
$ cat ../tartib.sh
#!/bin/sh
# $1 — Git bergan todo fayli (.git/rebase-merge/git-rebase-todo)
cat > "$1" <<'TODO'
pick dcc99d0 login va logout
pick 83aea89 foydalanuvchi uchun tset
drop 0634382 vaqtincha debug
TODO

$ GIT_SEQUENCE_EDITOR=../tartib.sh git rebase -i HEAD~3
Successfully rebased and updated refs/heads/main.

$ git log --oneline
758f130 foydalanuvchi uchun tset
b3550c7 login va logout
d3c8ce7 foydalanuvchi modeli
0a0ab06 loyiha boshlandi

$ ls
README.md       login.js        logout.js       user.js         user.test.js
```

Ikki commit o'rin almashdi, debug commit'i (`debug.js` bilan birga) tarixdan chiqdi. Qatorni `drop` deb belgilash o'rniga uni **o'chirib tashlash** ham mumkin — natija bir xil. Ro'yxatning izohida katta harf bilan yozilgan: *If you remove a line here THAT COMMIT WILL BE LOST*. Hamma qatorni o'chirsangiz esa rebase bekor qilinadi.

Pro Git ogohlantiradi: commit'ni o'chirish yoki o'zgartirish undan keyingi **hamma** commit'larni qayta yozadi; tarixda qanchalik uzoqqa borsangiz, shuncha ko'p commit qayta yasaladi va keyingi commit'lar o'chirilgan commit'ga bog'liq bo'lsa, konfliktlar ko'payadi.

### Tasodifan o'chirilgan qatorni ushlash

Qatorni tasodifan o'chirib yuborish oson. `rebase.missingCommitsCheck` buni tekshiradi (`ignore` — standart, `warn`, `error`):

```bash
$ git config rebase.missingCommitsCheck error
$ GIT_SEQUENCE_EDITOR="sed -i.bak '/vaqtincha debug/d'" git rebase -i HEAD~3
Warning: some commits may have been dropped accidentally.
Dropped commits (newer to older):
 - 0634382 # vaqtincha debug
To avoid this message, use "drop" to explicitly remove a commit.

Use 'git config rebase.missingCommitsCheck' to change the level of warnings.
The possible behaviours are: ignore, warn, error.

You can fix this with 'git rebase --edit-todo' and then run 'git rebase --continue'.
Or you can abort the rebase with 'git rebase --abort'.
```

Rebase hali hech narsa qilmasdan to'xtadi. `--edit-todo` bilan ro'yxatga aniq `drop` qo'shamiz. Bu yerda "muharrir" — fayl oxiriga qator qo'shadigan `echo ... >>` (Git fayl yo'lini oxiriga qo'shgani uchun bu ishlaydi):

```bash
$ GIT_SEQUENCE_EDITOR='echo "drop 0634382" >>' git rebase --edit-todo
$ grep -v '^#' .git/rebase-merge/git-rebase-todo
pick 83aea89d73c351a7327b616df4b0f07ec4961a61 # foydalanuvchi uchun tset
pick dcc99d0453e3621dab2d9c0c840c28c8f4821c5b # login va logout
drop 0634382c6a5f3edf1dfa995ac43342e6b6bb8283

$ git rebase --continue
Successfully rebased and updated refs/heads/main.

$ git log --oneline
dcc99d0 login va logout
83aea89 foydalanuvchi uchun tset
d3c8ce7 foydalanuvchi modeli
0a0ab06 loyiha boshlandi
```

Git qisqa hash'larni to'liq hash'ga kengaytirib qo'ydi. Yana bir kuzatuv: tartib o'zgarmagani uchun `83aea89` va `dcc99d0` qayta yasalmadi — o'chirilgan commit **oxirgi** edi, undan keyin hech narsa yo'q.

## Kod: `squash` — commit'larni birlashtirish

Pro Git misoli: uchta commit'dan bitta yasash. Birinchisi `pick` qoladi, keyingilari `squash`. Hujjat: `squash` (yoki `fixup`) qilingan commit **o'zidan oldingi** commit'ga qo'shiladi; mualliflar har xil bo'lsa, natija birinchi commit muallifiga yoziladi.

Git birlashtirilgan xabar shablonini qanday tuzishini ko'rish uchun xabar muharriri o'rniga `cat`:

```bash
$ GIT_SEQUENCE_EDITOR="sed -i.bak '2,3s/^pick/squash/'" GIT_EDITOR=cat git rebase -i HEAD~3
# This is a combination of 3 commits.
# This is the 1st commit message:

foydalanuvchi uchun tset

# This is the commit message #2:

login va logout

# This is the commit message #3:

vaqtincha debug

# Please enter the commit message for your changes. Lines starting
# with '#' will be ignored, and an empty message aborts the commit.
#
# Date:      Wed Oct 7 10:03:00 2026 +0500
#
# interactive rebase in progress; onto d3c8ce7
# Last commands done (3 commands done):
#    squash dcc99d0 # login va logout
#    squash 0634382 # vaqtincha debug
# No commands remaining.
# You are currently rebasing branch 'main' on 'd3c8ce7'.
#
# Changes to be committed:
#	new file:   debug.js
#	new file:   login.js
#	new file:   logout.js
#	new file:   user.test.js
#
[detached HEAD 6b31146] foydalanuvchi uchun tset
 Date: Wed Oct 7 10:03:00 2026 +0500
 4 files changed, 4 insertions(+)
 create mode 100644 debug.js
 create mode 100644 login.js
 create mode 100644 logout.js
 create mode 100644 user.test.js
Successfully rebased and updated refs/heads/main.

$ git log --oneline
6b31146 foydalanuvchi uchun tset
d3c8ce7 foydalanuvchi modeli
0a0ab06 loyiha boshlandi

$ git log -1 --format=%B
foydalanuvchi uchun tset

login va logout

vaqtincha debug
```

Shablonda uchala xabar ketma-ket; `#` bilan boshlangan qatorlar olib tashlanadi. Haqiqiy ishda siz bu yerda bitta mazmunli xabar yozasiz. Natijaviy commit'ning muallif sanasi — birinchi commit'niki (`Date: ... 10:03:00`).

### `fixup` — xabarsiz birlashtirish

`fixup` — `squash` ning o'zi, faqat qo'shilayotgan commit'ning xabari tashlab yuboriladi va muharrir ochilmaydi. Hujjatdagi ikki varianti:

| Buyruq | Mazmun | Xabar |
| --- | --- | --- |
| `squash <c>` | Oldingisiga qo'shiladi | Ikkala xabar birlashtiriladi, muharrir ochiladi |
| `fixup <c>` | Oldingisiga qo'shiladi | Faqat oldingisining xabari |
| `fixup -C <c>` | Oldingisiga qo'shiladi | Faqat **shu** commit'ning xabari, muharrirsiz |
| `fixup -c <c>` | Oldingisiga qo'shiladi | Faqat shu commit'ning xabari, muharrir ochiladi |

## Kod: `--fixup` va `--autosquash` — tuzatishni oldindan belgilash

Hujjatdagi "INTERACTIVE MODE" ish tartibini tasvirlaydi: siz ishlaysiz, commit qilasiz, keyin oldingi commit'lardan birida xato topasiz va uni tuzatasiz. Tuzatish tegishli commit'ga borib qo'shilishi kerak, lekin u commit seriyaning ichida, `--amend` qilib bo'lmaydi. Buning uchun tuzatishni **maxsus belgili** commit sifatida yozasiz, keyin interaktiv rebase uni o'zi joyiga qo'yadi.

`git commit` hujjatida uch shakl:

- `--fixup=<commit>` — sarlavhasi `fixup! <asl sarlavha>` bo'lgan commit; mazmun asl commit'ga qo'shiladi, xabar o'zgarmaydi;
- `--fixup=amend:<commit>` — `amend! <asl sarlavha>`; mazmun ham qo'shiladi, asl xabar ham shu commit'dagi xabar bilan almashtiriladi;
- `--fixup=reword:<commit>` — `amend!` commit, lekin faqat xabar (index'dagi o'zgarishlar hisobga olinmaydi).

`email` maydonini `d3c8ce7` uchun, `tset` xatosini `83aea89` uchun tuzatamiz:

```bash
$ cat > user.js <<'EOF'
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
}
EOF
$ git add user.js
$ git commit --fixup=d3c8ce7
[main bcdc1bd] fixup! foydalanuvchi modeli
 1 file changed, 4 insertions(+), 1 deletion(-)

$ GIT_EDITOR="sed -i.bak '3s/tset/test/'" git commit --fixup=reword:83aea89
[main 5847982] amend! foydalanuvchi uchun tset

$ git log -1 --format=%B
amend! foydalanuvchi uchun tset

foydalanuvchi uchun test
```

`amend!` commit'ning xabari ikki qismdan iborat: sarlavha (`amend! <asl sarlavha>` — Git asl commit'ni shu orqali topadi) va tana — asl commit'ning **yangi** xabari. Muharrirda tanani tahrirlaymiz (shuning uchun `sed` 3-qatorni o'zgartiradi, 1-qatorni emas).

Endi tarix:

```bash
$ git log --oneline
5847982 amend! foydalanuvchi uchun tset
bcdc1bd fixup! foydalanuvchi modeli
0634382 vaqtincha debug
dcc99d0 login va logout
83aea89 foydalanuvchi uchun tset
d3c8ce7 foydalanuvchi modeli
0a0ab06 loyiha boshlandi
```

`--autosquash` bilan Git todo ro'yxatini o'zi tuzatadi. Nima tayyorlaganini ko'rish uchun ro'yxatni o'zgartirmasdan chiqaramiz:

```bash
$ GIT_SEQUENCE_EDITOR='grep -v "^#"' git rebase -i --autosquash HEAD~6
pick d3c8ce7 # foydalanuvchi modeli
fixup bcdc1bd # fixup! foydalanuvchi modeli
pick 83aea89 # foydalanuvchi uchun tset
fixup -C 5847982 # amend! foydalanuvchi uchun tset # empty
pick dcc99d0 # login va logout
pick 0634382 # vaqtincha debug

Successfully rebased and updated refs/heads/main.

$ git log --oneline
c957132 vaqtincha debug
aeb916b login va logout
c0ba34e foydalanuvchi uchun test
faee2ca foydalanuvchi modeli
0a0ab06 loyiha boshlandi
```

Hujjatda aytilgandek: `fixup!` qatori `fixup` ga, `amend!` qatori `fixup -C` ga aylandi va har biri o'z commit'ining **darhol ostiga** ko'chirildi. `# empty` — `reword:` commit'i fayl o'zgartirmaganining belgisi. Moslik sarlavha yoki hash bo'yicha topiladi; to'liq mos kelmasa, sarlavha boshi bo'yicha.

E'tibor bering: `faee2ca` — `edit` bo'limidagi natija bilan **bir xil hash**. Ikki xil yo'l (`edit` + `--amend` va `--fixup` + `--autosquash`) bir xil tree, ota, muallif va committer'ni berdi — demak bir xil obyekt. Commit hash'i qanday yo'l bilan kelganingizga emas, faqat natijaga bog'liq.

`rebase.autoSquash = true` sozlamasi `--autosquash` ni interaktiv rebase uchun doimiy yoqadi (`--no-autosquash` bilan o'chiriladi). Code review'da bu juda qulay: sharhlarga javoban `--fixup` commit'lar yuborasiz (ko'rib chiquvchi faqat tuzatishni ko'radi), merge'dan oldin esa `git rebase -i --autosquash` bilan ularni joyiga singdirasiz.

## Kod: commit'ni bo'lish

`dcc99d0` ("login va logout") ikki ishni qiladi — ularni ikki commit'ga ajratamiz. Hujjatdagi ("SPLITTING COMMITS") tartib: commit'ni `edit` qiling, to'xtaganda `git reset HEAD^`, keyin qismlarni alohida commit qiling.

```bash
$ GIT_SEQUENCE_EDITOR="sed -i.bak '/login va logout/s/^pick/edit/'" git rebase -i HEAD~3
Stopped at dcc99d0...  # login va logout
You can amend the commit now, with

  git commit --amend 

Once you are satisfied with your changes, run

  git rebase --continue

$ git reset HEAD^
$ git status --short
?? login.js
?? logout.js
```

`git reset HEAD^` (`--mixed`, [39-bob](39-reset-sirlari.md)) `HEAD` ni va index'ni bitta orqaga suradi, working tree esa o'zgarmaydi. Natijada commit "yo'qoladi", uning o'zgarishlari esa commit qilinmagan holda qoladi (bu yerda fayllar yangi bo'lgani uchun — kuzatilmaydigan). Endi qismlarga bo'lib commit qilamiz. Bitta fayl ichidagi o'zgarishlarni bo'lish kerak bo'lsa — `git add -p` ([37-bob](37-interaktiv-staging.md)):

```bash
$ git add login.js
$ git commit -m "login funksiyasi"
[detached HEAD 4199b6b] login funksiyasi
 1 file changed, 1 insertion(+)
 create mode 100644 login.js
$ git add logout.js
$ git commit -m "logout funksiyasi"
[detached HEAD 6c1de1d] logout funksiyasi
 1 file changed, 1 insertion(+)
 create mode 100644 logout.js

$ git rebase --continue
Successfully rebased and updated refs/heads/main.

$ git log --oneline
523287a vaqtincha debug
6c1de1d logout funksiyasi
4199b6b login funksiyasi
83aea89 foydalanuvchi uchun tset
d3c8ce7 foydalanuvchi modeli
0a0ab06 loyiha boshlandi
```

Pro Git e'tibor qaratgan detal: `83aea89` o'zgarmadi. U ro'yxatda bo'lsa ham, `pick` edi va hech qanday o'zgarishdan oldin qo'llandi — Git uni qayta yasamadi.

Hujjat qo'shimcha maslahat beradi: oraliq commit'lar to'g'ri (kompilyatsiya bo'ladi, testdan o'tadi) ekaniga ishonchingiz komil bo'lmasa, har commit'dan keyin qolgan o'zgarishlarni `git stash` bilan chetga olib, sinab ko'ring va kerak bo'lsa amend qiling.

## Kod: `exec` — har qadamda tekshirish

Tartibni o'zgartirish va bo'lish **hech kim sinamagan** oraliq commit'lar yaratadi. Hujjat buning uchun `exec` buyrug'ini tavsiya qiladi: ro'yxatga `exec <buyruq>` qatori qo'yilsa, Git uni shell'da (`/bin/sh`, working tree ildizida) ishga tushiradi; buyruq muvaffaqiyatsiz bo'lsa (nol bo'lmagan kod), rebase to'xtaydi.

`--exec` har commit yaratadigan qatordan keyin `exec` qo'shadi. Haqiqiy loyihada bu `make test` yoki `npm test` bo'ladi; misolda "tarixda `debug.js` bo'lmasin" degan tekshiruvni ishlatamiz:

```bash
$ GIT_SEQUENCE_EDITOR='grep -v "^#"' git rebase -i --exec 'test ! -f debug.js' HEAD~3
pick 83aea89 # foydalanuvchi uchun tset
exec test ! -f debug.js
pick dcc99d0 # login va logout
exec test ! -f debug.js
pick 0634382 # vaqtincha debug
exec test ! -f debug.js

Executing: test ! -f debug.js
Executing: test ! -f debug.js
Executing: test ! -f debug.js
warning: execution failed: test ! -f debug.js
You can fix the problem, and then run

  git rebase --continue

$ git status
interactive rebase in progress; onto d3c8ce7
Last commands done (6 commands done):
   pick 0634382 # vaqtincha debug
   exec test ! -f debug.js
  (see more in file .git/rebase-merge/done)
No commands remaining.
You are currently editing a commit while rebasing branch 'main' on 'd3c8ce7'.
...
```

Tekshiruv uchinchi commit'da yiqildi va Git aynan o'sha commit ustida to'xtadi. Muammoni tuzatish yo'lini siz tanlaysiz — bu yerda commit'ni butunlay tashlaymiz:

```bash
$ git reset -q --hard HEAD~1
$ git rebase --continue
Successfully rebased and updated refs/heads/main.

$ git log --oneline
dcc99d0 login va logout
83aea89 foydalanuvchi uchun tset
d3c8ce7 foydalanuvchi modeli
0a0ab06 loyiha boshlandi
```

`--exec` ni `-i` siz ham berish mumkin — ichki interaktiv mexanizmdan foydalanadi, lekin ro'yxatni ko'rsatmaydi. Bir nechta buyruq: `--exec "cmd1 && cmd2"` yoki bir nechta `--exec`. `--autosquash` bilan birga ishlatilsa, `exec` faqat har squash/fixup guruhining oxiriga qo'yiladi. Muvaffaqiyatsiz `exec` ni `--continue` dan keyin qayta ishga tushirish kerak bo'lsa — `--reschedule-failed-exec` (yoki `rebase.rescheduleFailedExec`).

## Kod: `--update-refs` — ustma-ust branch'lar

Katta ishni bir-biriga tayangan bir nechta branch'ga bo'lish odatiy hol ("stacked branches"): `qism-1` — birinchi PR, `main` (yoki `qism-2`) uning ustida. Pastdagi commit'ni tahrirlasak, nima bo'ladi?

```bash
$ git branch qism-1 HEAD~1
$ git log --oneline --decorate -3
0634382 (HEAD -> main) vaqtincha debug
dcc99d0 (qism-1) login va logout
83aea89 foydalanuvchi uchun tset
```

Oddiy interaktiv rebase bilan `83aea89` ni `reword` qilamiz:

```bash
$ GIT_SEQUENCE_EDITOR="sed -i.bak '1s/^pick/reword/'" \
  GIT_EDITOR="sed -i.bak '1s/tset/test/'" git rebase -q -i HEAD~3
$ git log --oneline --graph --decorate --all
* 061528b (HEAD -> main) vaqtincha debug
* 7e20af0 login va logout
* 4a8c03d foydalanuvchi uchun test
| * dcc99d0 (qism-1) login va logout
| * 83aea89 foydalanuvchi uchun tset
|/
* d3c8ce7 foydalanuvchi modeli
* 0a0ab06 loyiha boshlandi
```

Rebase faqat **joriy** branch'ni suradi. `qism-1` eski commit'larda qoldi — endi ikki versiya bor va `qism-1` ni qo'lda `git branch -f qism-1 7e20af0` qilish kerak. `--update-refs` buni o'zi qiladi (xuddi shu boshlang'ich holatdan):

```bash
$ GIT_SEQUENCE_EDITOR="sed -i.bak '1s/^pick/reword/'" \
  GIT_EDITOR="sed -i.bak '1s/tset/test/'" git rebase -i --update-refs HEAD~3
[detached HEAD 4a8c03d] foydalanuvchi uchun test
 Date: Wed Oct 7 10:03:00 2026 +0500
 1 file changed, 1 insertion(+)
 create mode 100644 user.test.js
Successfully rebased and updated refs/heads/main.
Updated the following refs with --update-refs:
	refs/heads/qism-1

$ git log --oneline --graph --decorate --all
* 061528b (HEAD -> main) vaqtincha debug
* 7e20af0 (qism-1) login va logout
* 4a8c03d foydalanuvchi uchun test
* d3c8ce7 foydalanuvchi modeli
* 0a0ab06 loyiha boshlandi

$ git reflog show qism-1
7e20af0 qism-1@{0}: rewritten during rebase
dcc99d0 qism-1@{1}: branch: Created from HEAD~1
```

Ichkarida Git todo ro'yxatiga `update-ref refs/heads/qism-1` qatorini qo'shadi (ro'yxatni `cat` bilan ko'rsangiz, `pick dcc99d0` dan keyin turadi), branch esa rebase oxirida suriladi. Hujjat: boshqa worktree'da ochiq turgan branch'lar bunday yangilanmaydi. `rebase.updateRefs = true` — doimiy yoqish.

Ehtiyot bo'ling: `--update-refs` qayta yozilayotgan commit'larga qaragan **har qanday** lokal branch'ni suradi — vaqtincha "zaxira" uchun yasagan branch'ingiz ham shunga kiradi. Zaxirani tag yoki boshqa joydagi commit bilan qiling.

## Kod: merge'lar va birinchi commit

**Merge commit'lar.** [24-bobda](24-rebase.md) ko'rdik: rebase merge commit'larni standart bo'yicha tashlab yuboradi. Interaktiv rebase'da ham shunday — ro'yxatda faqat oddiy commit'lar bo'ladi:

```bash
$ git log --oneline --graph -4
*   3650bc5 Merge branch 'tema'
|\
| * 9944fb8 tema ishi
|/
* 0634382 vaqtincha debug
* dcc99d0 login va logout

$ GIT_SEQUENCE_EDITOR='grep -v "^#"' git rebase -i HEAD~2
pick 0634382 # vaqtincha debug
pick 9944fb8 # tema ishi

Successfully rebased and updated refs/heads/main.
```

Natijada `3650bc5` yo'qoladi, tarix to'g'ri chiziq bo'ladi. Branch tuzilishini saqlash uchun — `--rebase-merges` (`-r`). Ro'yxat ancha boshqacha:

```bash
$ git reset -q --hard ORIG_HEAD
$ GIT_SEQUENCE_EDITOR='grep -v "^#"' git rebase -i -r HEAD~2
label onto

reset onto
pick 0634382 # vaqtincha debug
label branch-point
pick 9944fb8 # tema ishi
label tema

reset branch-point # vaqtincha debug
merge -C 3650bc5 tema # Merge branch 'tema'

Successfully rebased and updated refs/heads/main.
```

Bu — kichik dasturlash tili: `label` joriy `HEAD` ga nom beradi (vaqtincha `refs/rewritten/<nom>` ref'i sifatida, rebase tugagach o'chadi), `reset` `HEAD` ni o'sha nomga qaytaradi, `merge -C <asl>` asl merge commit xabari bilan merge'ni qaytadan yasaydi. Hujjat ogohlantiradi: asl merge'dagi konflikt yechimlari va qo'lda qilingan o'zgarishlar avtomatik ko'chmaydi — ularni yana hal qilishingizga to'g'ri kelishi mumkin. Bu ro'yxatni tahrirlab, bitta branch'ni ikkiga bo'lish ham mumkin — hujjatda CMake/TLS misoli bor.

**Birinchi (root) commit.** Uning otasi yo'q, shuning uchun `HEAD~5` mavjud emas:

```bash
$ git rebase -i HEAD~5
fatal: invalid upstream 'HEAD~5'

$ GIT_SEQUENCE_EDITOR="sed -i.bak '1s/^pick/reword/'" \
  GIT_EDITOR="sed -i.bak '1s/.*/Kutubxona loyihasi boshlandi/'" \
  git rebase -i --root
...
Successfully rebased and updated refs/heads/main.

$ git log --oneline
bfd4b2a vaqtincha debug
fc9f51c login va logout
653ed99 foydalanuvchi uchun tset
74f9678 foydalanuvchi modeli
fbe3012 Kutubxona loyihasi boshlandi
```

`--root` — "branch'dan yetib boriladigan hamma commit'lar, root ham". Root o'zgargani uchun **butun** tarix qayta yozildi.

## Kod: eksperimental `git history`

Git 2.54 da yangi buyruq paydo bo'ldi: `git history`. Release notes bo'yicha:

| Versiya | Nima qo'shildi |
| --- | --- |
| 2.54 | `git history` buyrug'i (eksperimental), `reword` va `split` |
| 2.55 | `fixup` |
| 2.56 | `drop` — commit'ni olib tashlash, avlodlari uning otasi ustiga qayta qo'yiladi |

Hujjat sarlavhasi: *EXPERIMENTAL: Rewrite history*, ichida katta harflar bilan: "THIS COMMAND IS EXPERIMENTAL. THE BEHAVIOR MAY CHANGE." — buyruq xatti-harakati keyingi versiyalarda o'zgarishi mumkin. Maqsadi: bitta commit'ni o'zgartirish kabi kundalik ishlarni `rebase -i` dan soddaroq, "fikri aniq" (opinionated) yo'l bilan qilish.

```bash
$ git history -h
usage: git history drop <commit> [--dry-run] [--update-refs=(branches|head)] [--empty=(drop|keep|abort)]
   or: git history fixup <commit> [--dry-run] [--update-refs=(branches|head)] [--reedit-message] [--empty=(drop|keep|abort)]
   or: git history reword <commit> [--dry-run] [--update-refs=(branches|head)]
   or: git history split <commit> [--dry-run] [--update-refs=(branches|head)] [--] [<pathspec>...]
```

### `reword` va `--dry-run`

Boshlang'ich tarix, `qism-1` branch'i `HEAD~1` da. Avval `--dry-run`: ref'lar o'zgarmaydi, faqat qanday yangilanishini `git update-ref` formatida chiqaradi (yangi obyektlar esa yoziladi):

```bash
$ git branch qism-1 HEAD~1
$ GIT_EDITOR="sed -i.bak '1s/tset/test/'" git history reword 83aea89 --dry-run
update refs/heads/qism-1 7e20af0e31dfe5812182384fcc431c92fb292aa7 dcc99d0453e3621dab2d9c0c840c28c8f4821c5b
update refs/heads/main 061528bb697198d468238eb89bdf2c4f8c6c02d9 0634382c6a5f3edf1dfa995ac43342e6b6bb8283
```

Har qatorda: ref, yangi qiymat, eski qiymat. Endi haqiqatan:

```bash
$ GIT_EDITOR="sed -i.bak '1s/tset/test/'" git history reword 83aea89
$ git log --oneline --decorate
061528b (HEAD -> main) vaqtincha debug
7e20af0 (qism-1) login va logout
4a8c03d foydalanuvchi uchun test
d3c8ce7 foydalanuvchi modeli
0a0ab06 loyiha boshlandi

$ git reflog -1
061528b HEAD@{0}: reword: updating 83aea89
$ git reflog show qism-1 -1
7e20af0 qism-1@{0}: reword: updating 83aea89
```

Ikki narsa diqqatga sazovor:

- Hash'lar (`4a8c03d`, `7e20af0`, `061528b`) — `rebase -i` + `reword` + `--update-refs` bilan olingan natija bilan **aynan bir xil**. Ichki model o'sha: yangi commit obyektlari, ref'larni surish.
- `qism-1` ham o'zi yangilandi — `git history` standart bo'yicha (`--update-refs=branches`) o'zgartirilgan commit'ning avlodi bo'lgan **barcha** lokal branch'larni suradi. Faqat joriy branch kerak bo'lsa — `--update-refs=head`.

### `fixup` va `drop`

`fixup` — index'dagi (stage qilingan) o'zgarishlarni ko'rsatilgan commit'ga qo'shadi. Hujjat: bu `git commit --fixup=<commit>` + `git rebase --autosquash <commit>~` ga o'xshaydi:

```bash
$ cat > user.js <<'EOF'
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
}
EOF
$ git add user.js
$ git history fixup d3c8ce7
$ git log --oneline --decorate
c957132 (HEAD -> main) vaqtincha debug
aeb916b (qism-1) login va logout
c0ba34e foydalanuvchi uchun test
faee2ca foydalanuvchi modeli
0a0ab06 loyiha boshlandi
```

Yana tanish hash'lar: `faee2ca`, `c0ba34e`, `aeb916b`, `c957132` — `--fixup` + `--autosquash` bo'limidagi natijaning o'zi. Uch xil asbob, bir xil obyektlar.

`drop` — commit'ni olib tashlaydi. Revision sintaksisi ([19-bob](19-revision-tanlash.md)) bilan xabar bo'yicha topamiz:

```bash
$ git history drop 'main^{/vaqtincha}'
$ git log --oneline --decorate
aeb916b (HEAD -> main, qism-1) login va logout
c0ba34e foydalanuvchi uchun test
faee2ca foydalanuvchi modeli
0a0ab06 loyiha boshlandi
```

`main` olib tashlangan commit'ning otasiga — `aeb916b` ga — tushdi. Hujjat: `drop` root commit'ni va merge commit'ni olib tashlay olmaydi; `HEAD` qayta yozilsa, index va working tree yangi `HEAD` ga moslanadi, saqlanmagan o'zgarishlar ustidan yozilishi kerak bo'lsa — ref'lar yangilanishidan oldin to'xtaydi.

### `split`

`split` commit'ni ikkiga bo'ladi: siz tanlagan hunk'lar ([37-bob](37-interaktiv-staging.md)) yangi commit'ga ajraladi va u asl commit'ning **otasi** bo'ladi; qolgani asl commit'da qoladi. Ikkala xabar muharrirda so'raladi, muallif asl commit'niki. Hunk savollariga stdin orqali javob beramiz (`y` — `login.js` ajratilsin, `n` — `logout.js` qolsin), xabarlarni skript yozadi:

```bash
$ cat ../bolish.sh
#!/bin/sh
# $1 — .git/COMMIT_EDITMSG; qaysi fayl commit'ga tushayotganiga qarab xabar yozamiz
if grep -q 'new file:   login.js' "$1"; then
  echo "login funksiyasi" > "$1"
else
  echo "logout funksiyasi" > "$1"
fi

$ printf 'y\nn\n' | GIT_EDITOR=../bolish.sh git history split HEAD
diff --git a/login.js b/login.js
new file mode 100644
index 0000000..2818ecf
--- /dev/null
+++ b/login.js
@@ -0,0 +1 @@
+function login() {}
(1/1) Stage addition [y,n,q,a,d,?]? 
diff --git a/logout.js b/logout.js
new file mode 100644
index 0000000..f29fc1b
--- /dev/null
+++ b/logout.js
@@ -0,0 +1 @@
+function logout() {}
(1/1) Stage addition [y,n,q,a,d,?]? 

$ git log --oneline --decorate --stat -2
505c195 (HEAD -> main, qism-1) logout funksiyasi
 logout.js | 1 +
 1 file changed, 1 insertion(+)
622297b login funksiyasi
 login.js | 1 +
 1 file changed, 1 insertion(+)
```

(Javoblar stdin'dan kelgani uchun terminalda ko'rinmaydi.) Muharrirga beriladigan shablon (`GIT_EDITOR` o'rniga `cat` qo'ysangiz ko'rinadi):

```text
login va logout

# Please enter the commit message for the split-out changes. Lines starting
# with '#' will be ignored, and an empty message aborts the commit.
# Changes to be committed:
#	new file:   login.js
#
```

Hujjat: hamma hunk'ni yoki birortasini ham tanlamaslik mumkin emas — commit'lardan biri bo'sh bo'lib qolardi. Sinovda bitta faylli commit'ning yagona hunk'ini tanlaganda (ya'ni hammasini) Git shunday rad etdi: `error: split commit tree matches original commit`.

### `rebase` dan farqlari va cheklovlari

Hujjat (DESCRIPTION, LIMITATIONS) bo'yicha:

| | `git rebase -i` | `git history` |
| --- | --- | --- |
| Holat | Bosqichma-bosqich, to'xtashi mumkin (`.git/rebase-merge/`) | Bir zumda: yo muvaffaqiyat, yo hech narsa o'zgarmaydi |
| Konflikt | To'xtab, hal qilishni so'raydi | Rad etadi: `error: fixup would produce conflicts; aborting` |
| Merge'li tarix | `--rebase-merges` bilan | Hali yo'q: `error: replaying merge commits is not supported yet!` |
| Boshqa branch'lar | Faqat joriy (yoki `--update-refs`) | Standart bo'yicha barcha avlod branch'lar |
| Bare repo | Yo'q (working tree kerak) | Ko'p buyruqlari ishlaydi (`fixup` dan tashqari — u index'ni o'qiydi) |
| Hook'lar | Ishga tushadi | Hozircha ishga tushmaydi |
| Bir necha commit'ni birdan | Ha | Yo'q — bitta commit, bitta amal |

Konflikt cheklovi ataylab qilingan: hujjat aytadi, tarixni qayta yozish "holatli" (stateful) amal bo'lmasligi kerak; Git birinchi darajali konfliktlarni o'rgangach, cheklov olib tashlanishi mumkin. Sinovda ikkala xato ham haqiqiy chiqdi:

```bash
$ git history fixup d3c8ce7
error: fixup would produce conflicts; aborting

$ git history reword 83aea89      # merge commit'li tarixda
error: replaying merge commits is not supported yet!
```

Hujjatning o'z tavsiyasi: commit'lar to'plamini boshqa asosga ko'chirish yoki bir nechta commit'ni birdan tahrirlash kerak bo'lsa — `git rebase` ishlating. Eksperimental ekanini hisobga olib, uni skriptlarda va jamoa qo'llanmalarida hozircha asosiy vosita qilmang.

## Kod: butun tarixni qayta yozish — `filter-branch` va `filter-repo`

Yuqoridagilarning hammasi bir nechta commit uchun. Butun tarix bo'ylab mexanik o'zgarish kerak bo'lsa (har commit'dan faylni olib tashlash, hamma joyda email'ni almashtirish, quyi papkani ildiz qilish), boshqa asbob kerak. Pro Git uni "yadroviy variant" deb ataydi.

### `git filter-branch` — eskirgan

Pro Git ham, v2.56.0 ma'lumotnomasi ham bir xil xulosa beradi. Ma'lumotnoma (WARNING bo'limi): `git filter-branch` da kutilmagan tarzda **buzilgan tarix** yaratadigan ko'plab tuzoqlar bor, ishlashi juda sekin (muammolarni tekshirishga vaqt qoldirmaydi), bu xavfsizlik va tezlik muammolarini orqaga moslikni buzmasdan tuzatib bo'lmaydi — **shuning uchun uni ishlatish tavsiya etilmaydi**. O'rniga `git filter-repo`.

Eski maqolalarda ko'p uchraydigani uchun bir misol — Pro Git va ma'lumotnomadagi email almashtirish (`--env-filter` — har commit uchun muallif/committer o'zgaruvchilarini o'zgartiradi):

```bash
$ git filter-branch --env-filter '
if test "$GIT_AUTHOR_EMAIL" = "ali@example.com"
then
	GIT_AUTHOR_EMAIL=ali.valiyev@example.com
fi
if test "$GIT_COMMITTER_EMAIL" = "ali@example.com"
then
	GIT_COMMITTER_EMAIL=ali.valiyev@example.com
fi
' -- --all
WARNING: git-filter-branch has a glut of gotchas generating mangled history
	 rewrites.  Hit Ctrl-C before proceeding to abort, then use an
	 alternative filtering tool such as 'git filter-repo'
	 (https://github.com/newren/git-filter-repo/) instead.  See the
	 filter-branch manual page for more details; to squelch this warning,
	 set FILTER_BRANCH_SQUELCH_WARNING=1.
Proceeding with filter-branch...

Rewrite 0a0ab06e21e0d7e433555418565dbf2431820449 (1/5) (0 seconds passed, remaining 0 predicted)
...
Ref 'refs/heads/main' was rewritten

$ git log --format='%h %ae %s'
0208a09 ali.valiyev@example.com vaqtincha debug
6d02402 ali.valiyev@example.com login va logout
feeecbf ali.valiyev@example.com foydalanuvchi uchun tset
35fb6ed ali.valiyev@example.com foydalanuvchi modeli
9adcdf3 ali.valiyev@example.com loyiha boshlandi

$ git for-each-ref
0208a0985d0839018b747530b6ab4aceabe52b6b commit	refs/heads/main
0634382c6a5f3edf1dfa995ac43342e6b6bb8283 commit	refs/original/refs/heads/main
```

Kuzatuvlar:

- Ogohlantirishdan keyin buyruq 10 soniya kutadi — `Ctrl-C` bosishga ulgurishingiz uchun.
- **Hamma** hash o'zgardi, root commit'niki ham. Pro Git: commit otasining SHA-1 ini o'z ichida saqlagani uchun, faqat mos email'li commit'lar emas, butun tarix qayta yoziladi.
- Eski uch `refs/original/` ostida "zaxira" sifatida qoladi. Qayta ishga tushirsangiz: `Cannot create a new backup. A previous backup already exists in refs/original/` — `-f` kerak. Ma'lumotnoma ogohlantiradi: bu zaxira **haqiqiy zaxira emas** (izohli tag'larni oddiy tag'ga aylantirib yuborishi mumkin).
- `--env-filter` faqat muallif va committer'ni o'zgartiradi, tag yaratuvchilar (tagger) o'zgarmaydi — bu ham ma'lumotnoma sanagan tuzoqlardan biri.

Ma'lumotnomaning SAFETY bo'limidagi boshqa tuzoqlar: shell parchalari OS'ga bog'liq (BSD va GNU farqi jimgina noto'g'ri natija berishi mumkin), bo'sh joyli va ASCII bo'lmagan fayl nomlari noto'g'ri ishlanadi, `--all` standart emas (qisman qayta yozish eski va yangi tarixni aralashtirishga olib keladi), ishdan keyin avtomatik tozalash yo'q, commit xabarlaridagi boshqa commit hash'lariga havolalar eskirib qoladi. Har commit'ni to'liq checkout qilgani uchun katta repo'da juda sekin.

Pro Git'dagi yana ikki shakl — `--tree-filter 'rm -f passwords.txt'` (har commit'dan fayl olib tashlash) va `--subdirectory-filter trunk` (quyi papkani yangi ildiz qilish) — xuddi shu sabablarga ko'ra endi tavsiya etilmaydi. Katta faylni tarixdan olib tashlashning to'liq yo'li (`filter-branch --index-filter`, `refs/original` ni tozalash, `gc`) — [42-bobda](42-reflog-va-tiklash.md).

### `git filter-repo` — hozirgi tavsiya

`git filter-repo` — Git bilan birga kelmaydigan, alohida o'rnatiladigan Python skripti (<https://github.com/newren/git-filter-repo>). Pro Git: u `filter-branch` ishlatiladigan ko'pchilik holatda yaxshiroq ishlaydi. Asosiy xususiyatlari, uni yuqoridagi tuzoqlardan himoya qiladigan qoidalari (faqat yangi klonda ishlashi, `origin` ni olib tashlashi, o'zi tozalashi) va fayl olib tashlash misollari — [42-bobda](42-reflog-va-tiklash.md).

Bu bobdagi vazifalarga mos opsiyalar (filter-repo rasmiy hujjatidan):

| Vazifa | `filter-branch` (eski) | `filter-repo` |
| --- | --- | --- |
| Email/ismni almashtirish | `--env-filter` | `--mailmap <fayl>` — muallif, committer **va tagger** |
| Quyi papkani ildiz qilish | `--subdirectory-filter trunk` | `--subdirectory-filter trunk` |
| Yo'lni qayta nomlash | `--tree-filter` + `mv` | `--path-rename eski:yangi` |
| Matnni (parol) almashtirish | `--tree-filter` + `sed` | `--replace-text <fayl>` |
| Commit xabarlarini o'zgartirish | `--msg-filter` | `--message-callback` (Python kodi) |

Mailmap fayli formati (filter-repo hujjatidagi misol):

```text
<new@ema.il> <old1@ema.il>
New Name And <new@ema.il> <old2@ema.il>
```

> `filter-repo` buyruqlari qo'llanma muallifining sinov muhitida ishga tushirilmagan (asbob o'rnatilmagan) — opsiyalar asbobning rasmiy hujjatidan olingan.

## Muhandislik nuqtai nazari: qayta yozish shartmi

Har qanday qayta yozish — hamkorlar uchun narx. Ba'zan esa qayta yozish umuman kerak emas.

**Faqat ko'rinish muhim bo'lsa — `.mailmap`.** Muallif email'i noto'g'ri bo'lsa, lekin tarix allaqachon umumiy bo'lsa, repo ildiziga `.mailmap` qo'shish yetarli — tarix o'zgarmaydi, `git log` va `git shortlog` esa to'g'ri nomni ko'rsatadi:

```bash
$ cat .mailmap
Ali Valiyev <ali.valiyev@example.com> <ali@example.com>

$ git log --format='%h %ae | %aE %s' -2
0634382 ali@example.com | ali.valiyev@example.com vaqtincha debug
dcc99d0 ali@example.com | ali.valiyev@example.com login va logout

$ git shortlog -se HEAD
     5	Ali Valiyev <ali.valiyev@example.com>
```

`%ae` — commit'da yozilgani, `%aE` — mailmap hisobga olingani. Hash'lar o'zgarmadi.

**Xato commit allaqachon yuborilgan bo'lsa — `git revert`** ([26-bob](26-murakkab-merge.md)): u xatoni bekor qiluvchi yangi commit qo'shadi, tarixni qayta yozmaydi. Pro Git `filter-branch` haqida aytgan qoida umumiy: oddiy bitta commit muammoni hal qilsa, butun tarixni qayta yozmang.

**Maxfiy ma'lumot (parol, kalit) tarixga tushgan bo'lsa** — qayta yozish yetarli emas: u allaqachon klonlarda, fork'larda, CI keshlarida bo'lishi mumkin. Birinchi qadam — kalitni **bekor qilish/almashtirish**, keyin tarixni tozalash ([42-bob](42-reflog-va-tiklash.md)).

Qaror jadvali:

| Holat | Asbob |
| --- | --- |
| Oxirgi commit, hali yuborilmagan | `git commit --amend` ([11-bob](11-bekor-qilish.md)) |
| Bir nechta lokal commit: xabar, tartib, birlashtirish, bo'lish | `git rebase -i` |
| Tuzatish code review paytida | `git commit --fixup` → `git rebase -i --autosquash` |
| Bitta commit'ni tez o'zgartirish (va tajriba qilishga tayyor bo'lsangiz) | `git history` (eksperimental) |
| Butun tarix bo'ylab mexanik o'zgarish | `git filter-repo` |
| Faqat muallif nomi ko'rinishi | `.mailmap` |
| Umumiy branch'dagi xato | `git revert` |

## Muhandislik nuqtai nazari: qayta yozilgan branch'ni yuborish

Yuborilgan branch'ni (masalan, o'z PR branch'ingizni) qayta yozgan bo'lsangiz, oddiy `git push` rad etiladi — server tarixi sizning tarixingizning ajdodi emas. Majburlash kerak, lekin `--force` emas, `--force-with-lease` ([29-bob](29-fetch-push-ichidan.md)): u serverdagi branch siz oxirgi ko'rgan joyda turganini tekshiradi va o'sha orada hamkasbingiz biror narsa yuborgan bo'lsa, uni o'chirib yubormaydi.

Code review jarayonida yana bir narsa: ba'zi platformalar commit'lar qayta yozilganda eski commit'larga yozilgan izohlarni "eskirgan" deb belgilaydi. Review davomida `--fixup` commit'lar qo'shish va faqat oxirida `--autosquash` qilish — ko'rib chiquvchining ishini osonlashtiradi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Oxirgi 3 ta commit uchun `git rebase -i HEAD~2` | `HEAD~2` — chegara, u tahrirlanmaydi; faqat 2 ta commit ro'yxatda | Tahrirlanadigan eng eski commit'ning **otasini** bering: `HEAD~3` |
| Todo ro'yxatini `git log` tartibida o'qish | Ro'yxat teskari: eng eskisi tepada | Yuqoridan pastga bajarilishini eslang |
| Ro'yxatdagi sarlavhani tahrirlab, xabar o'zgaradi deb kutish | Git sarlavhaga qaramaydi, faqat hash'ga | `reword` ishlating |
| Qatorni tasodifan o'chirish | Commit yo'qoladi | `drop` ni aniq yozing; `rebase.missingCommitsCheck = error` |
| `squash` ni ro'yxatning birinchi qatoriga qo'yish | Unga qo'shiladigan "oldingi" commit yo'q | Birinchi qator `pick` bo'lsin |
| Yuborilgan umumiy branch'ni qayta yozib `push --force` | Hamkasblar tarixi buziladi, commit'lar ikki nusxada | Faqat lokal yoki o'zingizning branch; umumiy branch'da `revert` |
| Tartib o'zgargandan keyin testlarsiz yuborish | Oraliq commit'lar buzilgan, `bisect` ishlamaydi | `git rebase -i --exec "make test"` |
| Stacked branch'larda pastdagisini rebase qilib, yuqoridagini unutish | Branch eski commit'larda qoladi | `--update-refs` |
| Yangi skriptda `git filter-branch` | Rasmiy hujjat tavsiya etmaydi: tuzoqlar va sekinlik | `git filter-repo` |
| `git history` ni barqaror buyruq deb skriptga qo'yish | Eksperimental: xatti-harakati o'zgarishi mumkin | Skriptlarda `rebase` ishlating |
| `git history` faqat joriy branch'ni o'zgartiradi deb o'ylash | Standart: barcha avlod branch'lar suriladi | `--update-refs=head` yoki avval `--dry-run` |

## Amaliyot

1. Besh commit'li tarix yarating. `GIT_SEQUENCE_EDITOR=cat git rebase -i HEAD~3` bilan ro'yxatni ko'ring, keyin hash'lar o'zgarmaganini va reflog'da faqat `start`/`finish` yozilganini tekshiring. Nega shunday?
2. `sed` ni `GIT_SEQUENCE_EDITOR` va `GIT_EDITOR` ga berib, muharrir ochmasdan o'rtadagi commit xabarini `reword` qiling. Qaysi commit'larning hash'i o'zgardi, qaysilari o'zgarmadi?
3. `edit` bilan eski commit'da to'xtang, `.git/rebase-merge/` ichini (`done`, `git-rebase-todo`, `amend`) va `.git/HEAD` ni o'qing. Faylni o'zgartirib, `--amend` va `--continue` qiling.
4. Ikkita `git commit --fixup` va bitta `git commit --fixup=reword:` commit yarating. `git rebase -i --autosquash` tayyorlagan ro'yxatni o'zgartirmasdan chiqarib ko'ring va natijani tushuntiring.
5. Ikki faylni o'zgartirgan commit'ni `edit` + `git reset HEAD^` bilan ikkiga bo'ling. Keyin xuddi shuni `git history split` bilan qiling. Natijaviy tarixlarni solishtiring.
6. `--exec` bilan har commit'da ishlaydigan tekshiruv yozing, u o'rtadagi commit'da yiqilsin. To'xtagan joyda muammoni tuzatib, rebase'ni oxiriga yetkazing.
7. `qism-1` va `qism-2` ustma-ust branch'larini yarating. Pastdagi commit'ni avval oddiy, keyin `--update-refs` bilan tahrirlang va `git log --graph --all` farqini ko'rsating.
8. (Qiyinroq) Bir xil boshlang'ich repo'ning uch nusxasida bitta tuzatishni uch yo'l bilan bajaring: `edit` + `--amend`, `--fixup` + `--autosquash`, `git history fixup`. Committer sanasini bir xil qilib (`GIT_COMMITTER_DATE`), uchala natijada hash'lar bir xil chiqishini tekshiring va buning sababini commit obyekti tuzilishi orqali tushuntiring. Keyin sanani o'zgartirib, nima bo'lishini ko'ring.

## Rasmiy hujjat

- Pro Git — Rewriting History: <https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History>
- `git rebase` (INTERACTIVE MODE, SPLITTING COMMITS, REBASING MERGES): <https://git-scm.com/docs/git-rebase>
- `git commit` (`--fixup`, `--squash`): <https://git-scm.com/docs/git-commit>
- `git history` (eksperimental): <https://git-scm.com/docs/git-history>
- `git filter-branch` (WARNING, SAFETY): <https://git-scm.com/docs/git-filter-branch>
- `git var` (`GIT_SEQUENCE_EDITOR`, `GIT_EDITOR`): <https://git-scm.com/docs/git-var>
- `gitmailmap`: <https://git-scm.com/docs/gitmailmap>
- Git 2.54 / 2.55 / 2.56 release notes: <https://github.com/git/git/tree/master/Documentation/RelNotes>
- git-filter-repo: <https://github.com/newren/git-filter-repo>
