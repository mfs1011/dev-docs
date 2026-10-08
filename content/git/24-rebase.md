# 24 — Rebase

[← Oldingi: Branch'larni boshqarish](23-branch-boshqaruvi.md) · [Mundarija](README.md) · [Keyingi: Tarixni qayta yozish →](25-tarixni-qayta-yozish.md)

## Tushuncha

Bir branch'dagi o'zgarishlarni boshqasiga qo'shishning Git'da ikki asosiy yo'li bor: **merge** va **rebase**. Merge'ni [21-bobda](21-branch-va-merge.md) ko'rdik: ikki uchni va umumiy ajdodni solishtirib, ikki otali yangi commit yasaydi. Rebase boshqacha ishlaydi.

**Rebase** — branch'dagi commit'larni boshqa boshlang'ich nuqta ustiga **qaytadan yasash**. `git rebase` hujjatining birinchi jumlasi aynan shunday: "Reapply commits on top of another base tip" — commit'larni boshqa asos uchi ustiga qayta qo'llash. Hujjat yana bir so'z ishlatadi: *transplant* — ko'chirib o'tqazish (bog'bon novdani bir daraxtdan kesib, boshqasiga payvand qilgani kabi).

Odatiy holat:

```text
          B---C   feature (HEAD)
         /
    A---D         main
```

Siz `feature`da `B` va `C` ni yozdingiz, bu orada `main`ga `D` qo'shildi. `feature` da turib `git rebase main` desangiz:

```text
              B'--C'   feature (HEAD)
             /
    A---D              main

    B, C — hali ham bazada bor, lekin hech qaysi branch ularga qaramaydi
```

`B'` va `C'` — `B` va `C` ning **nusxalari emas, yangi commit'lar**. Ular o'sha o'zgarishni (patch'ni) olib yuradi, xabari va muallifi ham o'sha, lekin otasi boshqa, shuning uchun hash'i ham boshqa. Bu bobning eng muhim fikri shu: **rebase commit'ni ko'chirmaydi — yangisini yasaydi, eskisi joyida qoladi.** Qolgan hamma narsa — xavfi, oltin qoida, tiklash usullari — shu fikrdan kelib chiqadi.

Natijada tarix to'g'ri chiziq bo'lib qoladi: go'yo siz ishni `D` dan keyin boshlagansiz. Endi `main` ni `feature` ga **fast-forward** qilish mumkin — merge commit kerak emas.

## Nega shunday: nega commit'ni "ko'chirib" bo'lmaydi

Javob [16-bobdagi](16-commit-obyekti.md) commit obyekti tuzilishida. Commit — matnli obyekt, unda `tree`, `parent`, `author`, `committer` va xabar yozilgan. Commit'ning hash'i shu matnning SHA-1 yig'indisi. Demak `parent` qatori o'zgarsa — hash o'zgaradi. Hash o'zgarsa — bu boshqa obyekt.

Git'da obyektni joyida tahrirlash degan narsa umuman yo'q ([14-bob](14-obyektlar-blob.md)): obyekt nomi uning mazmunidan hisoblanadi, mazmunni o'zgartirsangiz, nom ham o'zgaradi. Shuning uchun "`B` ning otasini `A` dan `D` ga almashtirish" degan amal faqat bitta yo'l bilan bajariladi — `parent D` deb yozilgan **yangi** commit yasash. `B` ning tree'si ham, odatda, o'zgaradi: yangi commit'da `D` ning fayllari ham bor.

`C` ning otasi `B` edi. `B` o'rniga `B'` paydo bo'lgach, `C` ham qayta yasalishi shart — aks holda u eski `B` ga ishora qilib qoladi. Shu sababli rebase **zanjir bo'ylab** hamma commit'ni qayta yozadi: bitta commit o'zgarsa, undan keyingi hammasi o'zgaradi.

## Kod: oddiy rebase va hash'lar

Holatni yasaymiz: `main`da bitta commit, `feature`da ikkita, keyin `main`ga yana bitta.

```bash
$ git log --oneline --graph --all
* dd6d855 litsenziya qo'shildi
| * f82ffbf logout funksiyasi
| * 7d92065 login funksiyasi
|/
* 86558c2 README qo'shildi
```

Rebase'dan oldin `feature` commit'larining to'liq hash'larini yozib qo'yamiz va qaysi commit'lar ko'chishini ko'ramiz:

```bash
$ git switch feature
Switched to branch 'feature'

$ git rev-parse feature~1 feature
7d920653f6706935989b91bcf9373f16f569ca09
f82ffbfea219eaff6fb7ae3a96880f0141873997

$ git merge-base main feature
86558c2b639b4b759c21a7dc0316a38cb935c15a

$ git log --oneline main..feature
f82ffbf logout funksiyasi
7d92065 login funksiyasi
```

`main..feature` — "`feature`dan yetib boriladigan, lekin `main`dan yetib bo'lmaydigan commit'lar" ([19-bob](19-revision-tanlash.md)). Rebase aynan shu ro'yxatni oladi.

Rebase qilamiz. Farqni yaqqol ko'rish uchun committer sanasini `11:00` qilib qo'yamiz (odatda bu — rebase qilingan paytdagi soat):

```bash
$ export GIT_COMMITTER_DATE=2026-10-07T11:00:00+05:00
$ git rebase main
Successfully rebased and updated refs/heads/feature.

$ git log --oneline --graph --all
* 8dbb596 logout funksiyasi
* a8ddf1a login funksiyasi
* dd6d855 litsenziya qo'shildi
* 86558c2 README qo'shildi
```

> Terminalda jarayon davomida `Rebasing (1/2)`, `Rebasing (2/2)` yozuvlari bir qatorda almashib turadi, oxirida faqat `Successfully rebased...` qoladi.

Endi eski va yangi hash'larni yonma-yon qo'yamiz:

```bash
$ git rev-parse feature~1 feature ORIG_HEAD
a8ddf1aaf19591184fee340fb06bd8b4b9c6f4f2
8dbb5968dd4faf87503c1d0ea84df91c10e87da3
f82ffbfea219eaff6fb7ae3a96880f0141873997
```

| Commit | Rebase'dan oldin | Rebase'dan keyin |
| --- | --- | --- |
| login funksiyasi | `7d920653f6...` | `a8ddf1aaf1...` |
| logout funksiyasi | `f82ffbfea2...` | `8dbb5968dd...` |

Ikkala hash ham boshqa. `ORIG_HEAD` esa **eski** uchni — `f82ffbf` ni — ko'rsatib turibdi. `git rebase` hujjatidagi eslatma: rebase boshlanganda `ORIG_HEAD` rebase qilinayotgan branch'ning uchiga o'rnatiladi. `ORIG_HEAD` — oddiy fayl:

```bash
$ cat .git/ORIG_HEAD
f82ffbfea219eaff6fb7ae3a96880f0141873997
```

### Eski va yangi commit obyekti ichida

`git cat-file -p` bilan ikkala "login" commit'ini ochamiz:

```bash
$ git cat-file -p 7d92065
tree caf1dc8298d4eccddb9fcba493c46fbca0f053b3
parent 86558c2b639b4b759c21a7dc0316a38cb935c15a
author Ali Valiyev <ali@example.com> 1791349800 +0500
committer Ali Valiyev <ali@example.com> 1791349800 +0500

login funksiyasi

$ git cat-file -p a8ddf1a
tree adb6046c4c68d80a099e4f38480e2e72047d3f7a
parent dd6d8558ddd895f0094bc3f57ed3dba8452922c3
author Ali Valiyev <ali@example.com> 1791349800 +0500
committer Ali Valiyev <ali@example.com> 1791352800 +0500

login funksiyasi
```

Qator-ma-qator:

- `parent` — `86558c2` (README) edi, `dd6d855` (litsenziya) bo'ldi. Rebase'ning asl maqsadi shu.
- `tree` — boshqa: yangi snapshot'da `LICENSE` fayli ham bor.
- `author` — **o'zgarmagan**, vaqti ham (`1791349800`, ya'ni 10:10). Muallif — o'zgarishni yozgan odam va payt.
- `committer` — vaqt yangi (`1791352800`, ya'ni 11:00). Committer — commit obyektini **yasagan** odam va payt; rebase commit'ni qaytadan yasadi.

Buni `git log` da ham ko'rish mumkin (`%ad` — author date, `%cd` — committer date):

```bash
$ git log --format='%h %ad | %cd %s' --date=format:%H:%M ORIG_HEAD~2..ORIG_HEAD
f82ffbf 10:20 | 10:20 logout funksiyasi
7d92065 10:10 | 10:10 login funksiyasi

$ git log --format='%h %ad | %cd %s' --date=format:%H:%M main..feature
8dbb596 10:20 | 11:00 logout funksiyasi
a8ddf1a 10:10 | 11:00 login funksiyasi
```

Shuning uchun GitHub kabi joylarda rebase qilingan commit'ning "authored" va "committed" sanalari farq qiladi — bu xato emas.

### O'zgarish o'sha — `patch-id`

Hash boshqa bo'lsa ham, commit kiritgan **o'zgarish** bir xil. Git buni o'lchashning alohida usuliga ega — **patch-id**: commit diff'idan (qator raqamlari va bo'shliqlarsiz) hisoblangan yig'indi. Pro Git: Git commit'ning SHA-1 sidan tashqari faqat patch'ga asoslangan yig'indini ham hisoblay oladi.

```bash
$ git show 7d92065 | git patch-id
c57940281edeca4aeae1b304ee38ee38a99acc47 7d920653f6706935989b91bcf9373f16f569ca09

$ git show a8ddf1a | git patch-id
c57940281edeca4aeae1b304ee38ee38a99acc47 a8ddf1aaf19591184fee340fb06bd8b4b9c6f4f2
```

Birinchi ustun (patch-id) bir xil, ikkinchisi (commit hash) har xil. Bu kichik detal keyinroq juda foydali bo'ladi: Git "bu o'zgarish allaqachon bor" ekanini aynan shu yo'l bilan biladi (pastda, "rebase qilinganni rebase qilish").

### Eski commit'lar qayerda qoldi

Eski `7d92065` va `f82ffbf` o'chmagan:

```bash
$ git cat-file -t 7d92065
commit
```

Ularga endi hech qaysi branch qaramaydi, lekin ikki joy ularni eslab turadi — `ORIG_HEAD` va reflog ([42-bob](42-reflog-va-tiklash.md)):

```bash
$ git reflog -5
8dbb596 HEAD@{0}: rebase (finish): returning to refs/heads/feature
8dbb596 HEAD@{1}: rebase (pick): logout funksiyasi
a8ddf1a HEAD@{2}: rebase (pick): login funksiyasi
dd6d855 HEAD@{3}: rebase (start): checkout main
f82ffbf HEAD@{4}: checkout: moving from main to feature

$ git reflog show feature -3
8dbb596 feature@{0}: rebase (finish): refs/heads/feature onto dd6d8558ddd895f0094bc3f57ed3dba8452922c3
f82ffbf feature@{1}: commit: logout funksiyasi
7d92065 feature@{2}: commit: login funksiyasi
```

`HEAD` reflog'i rebase'ning har qadamini ko'rsatadi: `start` — `main` uchiga o'tish, har `pick` — bitta commit'ni qayta yasash, `finish` — branch'ni yangi uchga surish. Branch'ning o'z reflog'ida esa bitta yozuv: `feature@{1}` — rebase'dan oldingi uch. Rebase natijasi yoqmasa, uni qanday bekor qilish (`git reset --hard feature@{1}` yoki `ORIG_HEAD`) — [42-bobda](42-reflog-va-tiklash.md) batafsil, bu yerda takrorlamaymiz.

Bu eski commit'lar abadiy turmaydi: reflog yozuvlari muddati o'tgach, `git gc` ularni o'chiradi (o'sha bobning "reflog qachon tozalanadi" qismi).

### Fast-forward bilan yakunlash

Rebase `main`ga tegmadi — u faqat `feature`ni qayta yozdi. Endi `main` `feature` ning ajdodi, shuning uchun merge oddiy ko'rsatkich surish bo'ladi:

```bash
$ git switch -q main
$ git merge feature
Updating dd6d855..8dbb596
Fast-forward
 login.js  | 1 +
 logout.js | 1 +
 2 files changed, 2 insertions(+)
 create mode 100644 login.js
 create mode 100644 logout.js

$ git log --oneline --graph main
* 8dbb596 logout funksiyasi
* a8ddf1a login funksiyasi
* dd6d855 litsenziya qo'shildi
* 86558c2 README qo'shildi
```

## Kod: merge bilan solishtirish — natija bir xil, tarix boshqa

Pro Git ta'kidlaydi: rebase'ning oxirgi commit'i va merge commit ko'rsatadigan snapshot **bir xil** — farq faqat tarixda. Tekshiramiz. Eski `feature` uchidan (`f82ffbf`) branch yasab, uni rebase'dan oldingi `main`ga (`dd6d855`) merge qilamiz:

```bash
$ git branch eski-feature f82ffbf
$ git switch -q -c merge-varianti dd6d855
$ git merge -q --no-edit eski-feature
$ git log --oneline --graph merge-varianti
*   2adb559 Merge branch 'eski-feature' into merge-varianti
|\
| * f82ffbf logout funksiyasi
| * 7d92065 login funksiyasi
* | dd6d855 litsenziya qo'shildi
|/
* 86558c2 README qo'shildi

$ git rev-parse merge-varianti^{tree} main^{tree}
62a37ba3c397096e525083b381b6e32ed6105fc7
62a37ba3c397096e525083b381b6e32ed6105fc7
```

Tree hash'lari bir xil — fayllar baytma-bayt bir xil ([15-bob](15-tree-va-index.md)). Farq:

| | Merge | Rebase |
| --- | --- | --- |
| Yakuniy snapshot | `62a37ba` | `62a37ba` (bir xil) |
| Tarix shakli | Ayri, keyin qo'shiladi (merge commit bilan) | To'g'ri chiziq |
| Mavjud commit'lar | O'zgarmaydi | Qayta yasaladi (yangi hash) |
| Yangi commit | Bitta merge commit | Har ko'chirilgan commit uchun bittadan |
| Konflikt | Bir marta, hammasi birga | Har commit'da alohida bo'lishi mumkin |
| Haqiqiy vaqt tartibi | Saqlanadi | "Ketma-ket bo'lgandek" ko'rinadi |

Pro Git ifodasi: rebase o'zgarishlarni bir ish chizig'idan boshqasiga **kiritilgan tartibida** qayta o'ynatadi, merge esa ikki uchni olib birlashtiradi.

## Kod: rebase ichidan — `.git/rebase-merge/`

Rebase bir zumda tugamasligi mumkin — masalan, commit'lardan biri konflikt bersa. Bunda Git to'xtaydi va qayerda turganini **fayllarga yozib qo'yadi**, keyin `--continue` aynan o'sha joydan davom ettiradi. Bu fayllarni ko'rish rebase'ni tushunishning eng yaxshi yo'li.

Holat: `feature`da uchta commit, ikkinchisi `app.js` dagi qatorni o'zgartiradi; `main` ham o'sha qatorni boshqacha o'zgartirgan.

```bash
$ git log --oneline --graph --all
* 647ddc4 inglizcha salom
| * 7b8f434 b.txt qo'shildi
| * 215dc70 salomlashish o'zgardi
| * f2a1c83 a.txt qo'shildi
|/
* 2fe0571 app.js yaratildi

$ git rebase main          # feature'da turibmiz
Auto-merging app.js
CONFLICT (content): Merge conflict in app.js
error: could not apply 215dc70... salomlashish o'zgardi
hint: Resolve all conflicts manually, mark them as resolved with
hint: "git add/rm <conflicted_files>", then run "git rebase --continue".
hint: You can instead skip this commit: run "git rebase --skip".
hint: To abort and get back to the state before "git rebase", run "git rebase --abort".
hint: Disable this message with "git config set advice.mergeConflict false"
Could not apply 215dc70... # salomlashish o'zgardi
```

Birinchi commit (`a.txt`) muammosiz o'tdi, ikkinchisida to'xtadi. `.git` ichiga qaraymiz:

```bash
$ ls .git
AUTO_MERGE      MERGE_MSG       config          index           objects
COMMIT_EDITMSG  ORIG_HEAD       description     info            rebase-merge
HEAD            REBASE_HEAD     hooks           logs            refs

$ ls .git/rebase-merge
author-script                   head-name                       orig-head
done                            interactive                     patch
drop_redundant_commits          message                         rewritten-list
end                             msgnum                          stopped-sha
git-rebase-todo                 no-reschedule-failed-exec
git-rebase-todo.backup          onto
```

Eng muhim ikkitasi — **bajarilishi kerak** bo'lgan va **bajarilgan** buyruqlar ro'yxati:

```bash
$ cat .git/rebase-merge/git-rebase-todo
pick 7b8f43482c56db2522d40126c49cc2093f81722f # b.txt qo'shildi

$ cat .git/rebase-merge/done
pick f2a1c83a9029db746a7f90fb2df838c9f60be31e # a.txt qo'shildi
pick 215dc70cd503b8d8202b0ae395f2a06404870817 # salomlashish o'zgardi
```

Ko'rinib turibdiki, rebase — bu **buyruqlar ro'yxati** (todo list) bo'yicha ishlaydigan kichik dastur. Boshida Git `main..feature` dagi har commit uchun `pick <hash>` qatorini yozadi, keyin qatorlarni birma-bir bajaradi va bajarilganini `done` ga o'tkazadi. To'xtagan buyruq `done` ning oxirida turibdi. Boshlang'ich ro'yxatning to'liq nusxasi `git-rebase-todo.backup` da, izohlari bilan:

```bash
$ cat .git/rebase-merge/git-rebase-todo.backup
pick f2a1c83a9029db746a7f90fb2df838c9f60be31e # a.txt qo'shildi
pick 215dc70cd503b8d8202b0ae395f2a06404870817 # salomlashish o'zgardi
pick 7b8f43482c56db2522d40126c49cc2093f81722f # b.txt qo'shildi

# Rebase 647ddc4..7b8f434 onto 647ddc4 (3 commands)
#
# Commands:
# p, pick <commit> = use commit
# r, reword <commit> = use commit, but edit the commit message
# e, edit <commit> = use commit, but stop for amending
# s, squash <commit> = use commit, but meld into previous commit
...
```

Bu — interaktiv rebase'da muharrirda ochiladigan o'sha ro'yxat. Oddiy `git rebase` ham uni yaratadi, faqat sizga ko'rsatmasdan bajaradi. `pick` dan boshqa buyruqlar (`reword`, `squash`, `edit`...) — [25-bob](25-tarixni-qayta-yozish.md) mavzusi.

Qolgan fayllar — holatning boshqa qismlari:

```bash
$ cat .git/rebase-merge/head-name
refs/heads/feature
$ cat .git/rebase-merge/onto
647ddc4e038545294321b1ccdfdc039786022f43
$ cat .git/rebase-merge/orig-head
7b8f43482c56db2522d40126c49cc2093f81722f
$ cat .git/rebase-merge/msgnum
2
$ cat .git/rebase-merge/end
3
$ cat .git/rebase-merge/stopped-sha
215dc70cd503b8d8202b0ae395f2a06404870817
$ cat .git/rebase-merge/rewritten-list
f2a1c83a9029db746a7f90fb2df838c9f60be31e cf32315ad5c76c55fa7ae905d5d984c3243a11b9
$ cat .git/rebase-merge/author-script
GIT_AUTHOR_NAME='Ali Valiyev'
GIT_AUTHOR_EMAIL='ali@example.com'
GIT_AUTHOR_DATE='@1791350400 +0500'
```

| Fayl | Nima saqlaydi |
| --- | --- |
| `head-name` | Qaysi branch rebase qilinyapti — oxirida shu ref yangi uchga suriladi |
| `onto` | Yangi asos — commit'lar shu commit ustiga quriladi |
| `orig-head` | Rebase'dan oldingi branch uchi (`--abort` shu yerga qaytaradi) |
| `msgnum` / `end` | Nechanchi buyruqda turibmiz / jami nechta (`2` dan `3`) |
| `stopped-sha` | To'xtagan commit'ning asl hash'i |
| `rewritten-list` | "Eski hash → yangi hash" jadvali: `f2a1c83` endi `cf32315` |
| `author-script` | Qayta yasaladigan commit'ning muallifi va **asl** sanasi |
| `message` | Commit xabari (konflikt fayllari izoh sifatida qo'shilgan) |
| `patch` | To'xtagan commit kiritgan diff |

`rewritten-list` — rebase "qayta yasash" ekanining to'g'ridan-to'g'ri isboti: Git o'zi eski va yangi hash'larni juftlab yozib boradi (bu ro'yxatni keyin `post-rewrite` hook'i oladi, [47-bob](47-hooklar.md)). `author-script` esa nega muallif sanasi saqlanishini tushuntiradi: Git yangi commit'ni yasashda muallif ma'lumotini shu fayldan oladi.

`.git` ning o'zida ham ikkita belgi bor: `REBASE_HEAD` — hozir qo'llanayotgan commit, `HEAD` esa **branch'ga emas, to'g'ridan-to'g'ri commit'ga** qaraydi:

```bash
$ cat .git/REBASE_HEAD
215dc70cd503b8d8202b0ae395f2a06404870817
$ cat .git/HEAD
cf32315ad5c76c55fa7ae905d5d984c3243a11b9
```

Rebase davomida siz **detached HEAD** holatidasiz ([20-bob](20-branch-bu-ref.md)). `git rebase` hujjatidagi soddalashtirilgan tavsif ham shuni aytadi: Git avval `git checkout --detach <upstream>` ga teng amalni bajaradi, commit'larni birma-bir qayta o'ynatadi (har biri `git cherry-pick` ga o'xshash), oxirida `git checkout -B <branch>` kabi branch'ni yangi uchga suradi. `feature` branch'i esa butun jarayon davomida **eski** joyida — `7b8f434` da turadi.

### `git status` nima deydi

```bash
$ git status
interactive rebase in progress; onto 647ddc4
Last commands done (2 commands done):
   pick f2a1c83 # a.txt qo'shildi
   pick 215dc70 # salomlashish o'zgardi
Next command to do (1 remaining command):
   pick 7b8f434 # b.txt qo'shildi
  (use "git rebase --edit-todo" to view and edit)
You are currently rebasing branch 'feature' on '647ddc4'.
  (fix conflicts and then run "git rebase --continue")
  (use "git rebase --skip" to skip this patch)
  (use "git rebase --abort" to check out the original branch)

Unmerged paths:
  (use "git restore --staged <file>..." to unstage)
  (use "git add <file>..." to mark resolution)
	both modified:   app.js
```

E'tibor bering: biz `-i` bermagan bo'lsak ham, status "**interactive** rebase in progress" deydi. Sababi — hozirgi standart **merge backend** interaktiv rebase mexanizmi ustiga qurilgan (hujjat: "the 'merge' backend used to be known as the interactive backend, but it is now used for non-interactive cases as well"). Status `done` va `git-rebase-todo` fayllarini o'qib chiqaradi.

### Konfliktni hal qilish va davom etish

Konfliktning o'zi merge'dagidek: belgilar, index'dagi uch bosqich, `git add` ([22-bob](22-konfliktlar.md)). Bitta muhim farq bor — **rebase'da `ours` va `theirs` almashadi**:

```bash
$ cat app.js
<<<<<<< HEAD
const xabar = "Hello";
=======
const xabar = "Assalomu alaykum";
>>>>>>> 215dc70 (salomlashish o'zgardi)
console.log(xabar);

$ git show :1:app.js | head -1
const xabar = "Salom";
$ git show :2:app.js | head -1
const xabar = "Hello";
$ git show :3:app.js | head -1
const xabar = "Assalomu alaykum";
```

`HEAD` (`:2:`, "ours") — `main` ning versiyasi, chunki HEAD hozir `main` ustida qurilayotgan yangi zanjirda. Sizning commit'ingiz — `:3:`, "theirs". Hujjat (`--merge` opsiyasi): rebase qilingan qism `<upstream>` dan boshlanib "ours" deb, ishchi branch esa "theirs" deb ko'rsatiladi — "in other words, the sides are swapped". Batafsil — [22-bob](22-konfliktlar.md).

Hal qilamiz va davom etamiz:

```bash
$ printf 'const xabar = "Assalomu alaykum";\nconsole.log(xabar);\n' > app.js
$ git add app.js
$ git rebase --continue
[detached HEAD 8be98f9] salomlashish o'zgardi
 1 file changed, 1 insertion(+), 1 deletion(-)
Successfully rebased and updated refs/heads/feature.
```

`--continue` paytida Git commit xabari uchun muharrirni ochadi (hujjat, "Commit Rewording": konflikt hal qilinayotganda o'zgarish katta bo'lishi mumkin, shuning uchun merge backend xabarni yangilashni taklif qiladi). Bu yerda xabarni o'zgartirmadik. Avtomatlashtirilgan muhitda muharrirsiz o'tish uchun `GIT_EDITOR=true git rebase --continue` ishlatiladi.

Tugagach, `.git/rebase-merge/` papkasi o'chiriladi, `ORIG_HEAD` esa eski uchni saqlab qoladi:

```bash
$ ls .git/rebase-merge
ls: .git/rebase-merge: No such file or directory

$ git log --oneline --graph --all
* f28f577 b.txt qo'shildi
* 8be98f9 salomlashish o'zgardi
* cf32315 a.txt qo'shildi
* 647ddc4 inglizcha salom
* 2fe0571 app.js yaratildi

$ git rev-parse ORIG_HEAD
7b8f43482c56db2522d40126c49cc2093f81722f

$ git reflog -6
f28f577 HEAD@{0}: rebase (finish): returning to refs/heads/feature
f28f577 HEAD@{1}: rebase (pick): b.txt qo'shildi
8be98f9 HEAD@{2}: rebase (continue): salomlashish o'zgardi
cf32315 HEAD@{3}: rebase (pick): a.txt qo'shildi
647ddc4 HEAD@{4}: rebase (start): checkout main
7b8f434 HEAD@{5}: checkout: moving from main to feature
```

Reflog'da konflikt hal qilingan commit `rebase (continue)` deb yozilgan.

### To'xtagan rebase bilan boshqa amallar

| Buyruq | Nima qiladi | Ichkarida |
| --- | --- | --- |
| `git rebase --continue` | Hal qilingan commit'ni yasab, keyingisiga o'tadi | `git-rebase-todo` dan keyingi qatorni oladi |
| `git rebase --skip` | Hozirgi commit'ni **tashlab yuboradi**, keyingisiga o'tadi | O'sha patch yangi tarixga kirmaydi |
| `git rebase --abort` | Hammasini bekor qiladi, branch rebase'dan oldingi holatiga qaytadi | `orig-head` ga qaytadi, `rebase-merge/` o'chiriladi |
| `git rebase --quit` | Rebase'ni to'xtatadi, lekin `HEAD`, index va working tree'ga **tegmaydi** | Faqat `rebase-merge/` o'chiriladi |
| `git rebase --show-current-patch` | Qo'llanayotgan commit'ni ko'rsatadi | `git show REBASE_HEAD` ga teng |
| `git rebase --edit-todo` | Qolgan ro'yxatni muharrirda tahrirlash | `git-rebase-todo` ni ochadi |

`--skip` ehtiyotkorlik talab qiladi: commit'ning o'zgarishi yo'qoladi (lekin asl commit reflog/`ORIG_HEAD` orqali topiladi). U o'zgarish asosiy branch'da allaqachon bor bo'lganda foydali.

### Eski backend: `--apply` va `.git/rebase-apply/`

Pro Git'dagi chiqish boshqacha ko'rinadi:

```text
First, rewinding head to replay your work on top of it...
Applying: added staged command
```

Bu — eski **apply backend**'ning chiqishi. Pro Git rebase'ni shu backend orqali tasvirlaydi: har commit diff'ini vaqtinchalik faylga saqlash, branch'ni asosga qaytarish va diff'larni birma-bir qo'llash. Hozir standart backend — **merge** (`-m`/`--merge`, "Using merging strategies to rebase (default)"). Apply backend'ni `--apply` bilan majburlash mumkin:

```bash
$ git rebase --apply main
First, rewinding head to replay your work on top of it...
Applying: a.txt qo'shildi
Applying: salomlashish o'zgardi
Using index info to reconstruct a base tree...
M	app.js
Falling back to patching base and 3-way merge...
Auto-merging app.js
CONFLICT (content): Merge conflict in app.js
error: Failed to merge in the changes.
hint: Use 'git am --show-current-patch=diff' to see the failed patch
...
Patch failed at 0002 salomlashish o'zgardi

$ ls .git/rebase-apply
0001                    head-name               original-commit         scissors
0002                    keep                    patch                   sign
0003                    last                    patch-merge-index       threeway
abort-safety            messageid               quiet                   utf8
apply-opt               next                    quoted-cr
author-script           onto                    rebasing
final-commit            orig-head               rewritten
```

Apply backend holatini boshqa papkada saqlaydi va todo ro'yxati o'rniga **patch fayllari** (`0001`, `0002`, `0003`) yozadi — `git format-patch` + `git am` ichki ishlatiladi. Hujjat ("BEHAVIORAL DIFFERENCES") merge backend'ni bir necha sabab bilan afzal ko'radi:

- apply backend faqat diff'ning atrofidagi qatorlarga (kontekstga) tayanadi; faylda bir xil kontekst bir necha joyda bo'lsa, o'zgarish **noto'g'ri joyga, konfliktsiz** qo'llanishi mumkin. Merge backend faylning to'liq nusxasi bilan ishlaydi.
- apply backend'da papka nomini o'zgartirishni aniqlash o'chiq.
- apply backend noto'g'ri paytdagi `Ctrl-C` dan keyin `--abort` qilib bo'lmaydigan holatga tushishi mumkin.
- apply backend konfliktdan keyin xabarni tahrirlashni taklif qilmaydi.

Kelajakda `--apply` "no-op" bo'lib qolishi mumkinligi ham hujjatda aytilgan. Xulosa: `--apply` ni faqat eski maqola yoki skriptda uchratasiz; o'zingiz standartdan foydalaning.

## Kod: `--onto` — boshqa joydan kesib, boshqa joyga o'tqazish

Oddiy `git rebase main` ikki narsani bitta argumentdan oladi: **qaysi commit'lar** ko'chiriladi (`main..HEAD`) va **qayerga** (`main` uchiga). `--onto` bularni ajratadi:

```text
git rebase --onto <yangi-asos> <upstream> <branch>

  ko'chiriladigan commit'lar:  <upstream>..<branch>
  qayerga:                     <yangi-asos> ustiga
```

Pro Git misoli. `server` branch'i `main`dan ajralgan, `client` esa `server`dan ajralgan:

```bash
$ git log --oneline --graph --all
* 34a9729 C6
* fa5313f C5
| * 43c417a C10
| * 7b5e670 C4
| | * 16d3a5c C9
| | * 317131b C8
| |/
| * 4deec39 C3
|/
* 4801eb4 C2
* 352b936 C1
```

```text
    C1---C2---C5---C6                 main
           \
            C3---C4---C10             server
              \
               C8---C9                client
```

Mijoz tomondagi (`client`) ishni hozir chiqarmoqchisiz, server tomondagisi esa hali sinovda. Kerakli commit'lar — `client`da bor, `server`da yo'q:

```bash
$ git log --oneline server..client
16d3a5c C9
317131b C8

$ git rebase --onto main server client
Successfully rebased and updated refs/heads/client.

$ git log --oneline --graph --all
* dea2ff8 C9
* 3347150 C8
* 34a9729 C6
* fa5313f C5
| * 43c417a C10
| * 7b5e670 C4
| * 4deec39 C3
|/
* 4801eb4 C2
* 352b936 C1

$ ls
C1.txt  C2.txt  C5.txt  C6.txt  C8.txt  C9.txt
```

Pro Git so'zlari bilan: "`client` ni ol, u `server`dan ajralgan joydan beri qilingan patch'larni top va ularni go'yo `client` to'g'ridan-to'g'ri `main`dan boshlangandek qayta o'ynat". Uchinchi argument (`client`) berilgani uchun Git avval o'sha branch'ga o'tdi.

`ls` natijasiga qarang: `C3.txt` yo'q. `C3` endi `client` tarixida emas. Agar `C8`, `C9` haqiqatan `C3` dagi kodga tayangan bo'lsa, rebase konfliktsiz o'tsa ham, natija **ishlamaydigan** kod bo'lardi. `--onto` faqat ko'chirilayotgan commit'lar tashlab ketilayotganlarga bog'liq bo'lmasa to'g'ri — buni Git tekshira olmaydi, siz tekshirasiz.

Endi `main` ni fast-forward qilamiz, keyin `server` ni ham `main` ustiga olamiz. `git rebase <asos> <branch>` shakli avval `<branch>` ga o'tadi — alohida `switch` shart emas:

```bash
$ git switch -q main
$ git merge client
Updating 34a9729..dea2ff8
Fast-forward
 C8.txt | 1 +
 C9.txt | 1 +
 2 files changed, 2 insertions(+)
 create mode 100644 C8.txt
 create mode 100644 C9.txt

$ git rebase main server
Successfully rebased and updated refs/heads/server.

$ git switch -q main
$ git merge -q server
$ git branch -d client server
Deleted branch client (was dea2ff8).
Deleted branch server (was fd46c3d).

$ git log --oneline
fd46c3d C10
6b6be05 C4
f260fd6 C3
dea2ff8 C9
3347150 C8
34a9729 C6
fa5313f C5
4801eb4 C2
352b936 C1
```

Tarix to'liq to'g'ri chiziq. Bu ish tartibi ko'pincha begona loyihaga hissa qo'shganda kerak bo'ladi: ishingizni `origin/main` ustiga rebase qilib yuborasiz, loyiha egasi integratsiya qilmaydi — faqat fast-forward yoki toza qo'llash.

### `--onto` ning boshqa qo'llanishlari

`git rebase` hujjatidagi yana ikki shakl (`--onto` va `<upstream>` har qanday commit bo'lishi mumkin, branch nomi shart emas):

```text
# Ketma-ket ikki commit'ni (F va G) branch o'rtasidan olib tashlash:
#   E---F---G---H---I---J  topicA
git rebase --onto topicA~5 topicA~3 topicA
#   E---H'---I'---J'  topicA

# topicB topicA ga bog'liq emas — uni to'g'ridan-to'g'ri master ustiga ko'chirish:
git rebase --onto master topicA topicB
```

Birinchisini o'qish: "`topicA~3..topicA` ni (ya'ni `H`, `I`, `J`) `topicA~5` (`E`) ustiga qo'y". `F` va `G` ro'yxatga kirmagani uchun tarixdan tushib qoladi. Commit'larni olib tashlashning qulayroq yo'li — interaktiv rebase'dagi `drop` ([25-bob](25-tarixni-qayta-yozish.md)).

`--onto` uchun maxsus qisqartma ham bor: `A...B` — `A` va `B` ning merge base'i (agar u bitta bo'lsa). Shu asosda `--keep-base` opsiyasi ishlaydi: `git rebase --keep-base main` commit'larni **o'sha eski asos ustida** qayta quradi — `main` oldinga ketgan bo'lsa ham asos siljimaydi. Hujjat: bu asosiy branch tez o'zgarayotganda va har safar uning ustiga ko'chish shart bo'lmaganda foydali; asosan interaktiv rebase bilan (`git rebase -i --keep-base main`) branch ichini tozalash uchun ishlatiladi.

## Kod: rebase nimani tashlab ketadi

`git rebase` hujjatida birinchi qadam aniq yozilgan: "`<upstream>` da **ekvivalenti bo'lmagan**" commit'lar ro'yxatini tuzish. Ya'ni Git patch-id bo'yicha asosiy branch'da allaqachon bor o'zgarishlarni oldindan chiqarib tashlaydi. `eski-feature` (asl `7d92065`, `f82ffbf`) ni allaqachon ularning rebase qilingan nusxalari bor `main` ustiga olsak:

```bash
$ git switch eski-feature
Switched to branch 'eski-feature'
$ git rebase main
warning: skipped previously applied commit 7d92065
warning: skipped previously applied commit f82ffbf
hint: use --reapply-cherry-picks to include skipped commits
hint: Disable this message with "git config set advice.skippedCherryPicks false"
Successfully rebased and updated refs/heads/eski-feature.

$ git log --oneline -3
8dbb596 logout funksiyasi
a8ddf1a login funksiyasi
dd6d855 litsenziya qo'shildi
```

Ikkala commit ham tashlandi — `eski-feature` endi `main` bilan bir joyda. Rebase standart bo'yicha yana quyidagilarni ham tashlaydi:

- **merge commit'larni** — hujjat: rebase ularni todo ro'yxatidan chiqarib, hamma commit'ni bitta to'g'ri chiziqqa qo'yadi. Branch tuzilishini saqlash kerak bo'lsa — `--rebase-merges` (`-r`), u merge'larni qaytadan yasaydi ([25-bob](25-tarixni-qayta-yozish.md));
- rebase'dan keyin **bo'sh bo'lib qolgan** commit'larni (o'zgarishining hammasi asosda allaqachon bor) — `--empty=drop` standart; `keep` yoki `stop` bilan o'zgartiriladi.

Boshidanoq bo'sh (`--allow-empty` bilan ataylab yaratilgan) commit'lar esa saqlanadi.

## Kod: rebase xavfi — boshqalar ishlatgan commit'ni rebase qilish

Pro Git rebase xavfini bitta qoidaga jamlaydi — **oltin qoida**:

> **O'z repo'ngizdan tashqarida mavjud bo'lgan va boshqalar ish asoslagan bo'lishi mumkin bo'lgan commit'larni rebase qilmang.**

Nega? Rebase eski commit'larni tashlab, o'xshash, lekin boshqa commit'lar yasaydi. Agar eski commit'lar kimningdir repo'sida bo'lsa, unda ular **yo'qolmaydi** — natijada bir o'zgarishning ikki nusxasi paydo bo'ladi. Buni lokal bare repo bilan ([27-bob](27-remote.md)) sinab ko'ramiz: `markaz.git` — umumiy server, `men` — sizning klon, `hamkasb` — Hasanning kloni.

**1-qadam.** Siz `C1` ni klonladingiz va lokal `C2`, `C3` qildingiz. Hasan `mavzu` branch'ida `C4`, `main`da `C5` qildi, ularni `C6` merge commit bilan birlashtirib, serverga yubordi. Siz uni olib, o'z ishingiz bilan merge qildingiz (`C7`):

```bash
# men/
$ git fetch -q
$ git merge -q --no-edit origin/main -m C7
$ git log --oneline --graph
*   1f21612 C7
|\
| *   6c9ebc5 C6
| |\
| | * 7022c1f C4
| * | 4cc5ed2 C5
| |/
* | 4deec39 C3
* | 4801eb4 C2
|/
* 352b936 C1
```

**2-qadam.** Hasan fikrini o'zgartirdi: merge o'rniga rebase qilmoqchi. U `main` ni `C5` ga qaytaradi, `mavzu`ni uning ustiga rebase qiladi (`C4'`) va serverga **majburan** yuboradi:

```bash
# hamkasb/
$ git reset -q --hard HEAD^1
$ git rebase -q main mavzu
$ git switch -q main
$ git merge -q mavzu
$ git log --oneline --graph
* dacfa86 C4
* 4cc5ed2 C5
* 352b936 C1

$ git push --force origin main
To /tmp/misol/markaz.git
 + 6c9ebc5...dacfa86 main -> main (forced update)
```

Serverda endi `C6` va asl `C4` yo'q. Lekin sizning `C7` aynan ularga tayangan.

**3-qadam.** Siz yangilanishni olasiz:

```bash
# men/
$ git fetch
From /tmp/misol/markaz
 + 6c9ebc5...dacfa86 main       -> origin/main  (forced update)

$ git status -sb
## main...origin/main [ahead 5, behind 1]
```

`forced update` va `+` belgisi — server tarixi orqaga qaytarilib, qayta yozilganining belgisi ([29-bob](29-fetch-push-ichidan.md)).

Agar odatdagidek merge qilsangiz:

```bash
$ git merge -q --no-edit origin/main -m C8
$ git log --oneline --graph
*   139ed74 C8
|\
| * dacfa86 C4
* |   1f21612 C7
|\ \
| * \   6c9ebc5 C6
| |\ \
| | |/
| |/|
| | * 7022c1f C4
| * | 4cc5ed2 C5
| |/
* | 4deec39 C3
* | 4801eb4 C2
|/
* 352b936 C1

$ git log --format='%h %an %ad %s' --date=format:%H:%M | grep C4
dacfa86 Hasan Karimov 10:04 C4
7022c1f Hasan Karimov 10:04 C4
```

Muallifi, vaqti va xabari bir xil ikkita `C4`. Pro Git aytganidek, bu chalkash; bu tarixni serverga yuborsangiz, Hasan ataylab olib tashlagan `C4` va `C6` ni qaytarib olib kirasiz.

### Rebase qilinganni rebase qilish

Pro Git (Rebase When You Rebase) chiqish yo'lini ko'rsatadi: merge o'rniga **o'zingiz ham rebase qiling**. Merge'dan oldingi holatga qaytamiz (`zaxira` branch'ini 3-qadamdan oldin yasab qo'ygan edik):

```bash
$ git reset -q --hard zaxira
$ git log --oneline origin/main..main
1f21612 C7
6c9ebc5 C6
7022c1f C4
4deec39 C3
4801eb4 C2
```

Bu beshtaning qaysi biri haqiqatan sizniki? `--cherry-mark` patch-id bo'yicha ekvivalent commit'larni `=` bilan belgilaydi:

```bash
$ git log --oneline --cherry-mark --left-right origin/main...main
= dacfa86 C4
> 1f21612 C7
> 6c9ebc5 C6
= 7022c1f C4
> 4deec39 C3
> 4801eb4 C2

$ git show 7022c1f | git patch-id
4b2bda70e44f61795fe1bfb7e73085e09a0837f7 7022c1f611c77721fd081cf882fa45df5e288463
$ git show dacfa86 | git patch-id
4b2bda70e44f61795fe1bfb7e73085e09a0837f7 dacfa8661516777d1beba86fbe598db257b813bf
```

Rebase:

```bash
$ git rebase origin/main
warning: skipped previously applied commit 7022c1f
hint: use --reapply-cherry-picks to include skipped commits
hint: Disable this message with "git config set advice.skippedCherryPicks false"
Successfully rebased and updated refs/heads/main.

$ git log --oneline --graph
* fd96104 C3
* 0c680fd C2
* dacfa86 C4
* 4cc5ed2 C5
* 352b936 C1
```

Pro Git sanagan to'rt qadamni Git o'zi bajardi:

1. Faqat sizning branch'ingizdagi commit'larni aniqladi: `C2`, `C3`, `C4`, `C6`, `C7`.
2. Merge commit'larni chiqarib tashladi: `C6`, `C7` → qoldi `C2`, `C3`, `C4`.
3. Asosda patch'i allaqachon borlarini chiqarib tashladi: `C4` (`C4'` bilan patch-id bir xil) → qoldi `C2`, `C3`.
4. Ularni `origin/main` ustiga qo'ydi.

Bu faqat `C4` va `C4'` deyarli **bir xil patch** bo'lgandagina ishlaydi. Hasan rebase paytida konfliktni hal qilib, kodni o'zgartirgan bo'lsa, patch-id farq qiladi va Git `C4` ni ham qayta qo'llashga urinadi (katta ehtimol bilan konflikt bilan).

### `git pull --rebase`

Xuddi shu natijani bitta buyruq bilan olish mumkin:

```bash
$ git reset -q --hard zaxira
$ git pull --rebase
Successfully rebased and updated refs/heads/main.

$ git log --oneline --graph
* fd96104 C3
* 0c680fd C2
* dacfa86 C4
* 4cc5ed2 C5
* 352b936 C1
```

Hash'lar ham aynan bir xil (`fd96104`) — sinovda committer sanasi bir xil berilgan, demak commit obyektlari baytma-bayt bir xil chiqdi. Bu safar `skipped` ogohlantirishi chiqmadi. Sababi — **fork-point**. `<upstream>` ko'rsatilmasa, `git rebase` (va `pull --rebase`) `--fork-point` rejimida ishlaydi: `origin/main` ning **reflog'ini** ko'rib, server tarixi qayta yozilishidan oldin u qayerda bo'lganini topadi:

```bash
$ git reflog show origin/main
dacfa86 refs/remotes/origin/main@{0}: fetch: forced-update
6c9ebc5 refs/remotes/origin/main@{1}: fetch -q: fast-forward

$ git merge-base --fork-point origin/main zaxira
6c9ebc57e4b4f71042c98dda1022c7f4557f9a81
```

Fork-point `6c9ebc5` (eski `C6`) — demak "sizniki" faqat undan keyingilar: `C2`, `C3` (va tashlanadigan `C7` merge). `C4` umuman ro'yxatga kirmadi.

`git pull` ni doim shunday ishlatish uchun:

```bash
$ git config --global pull.rebase true
```

Pro Git maslahati: agar siz yoki hamkasbingiz yuborilgan tarixni qayta yozishga majbur bo'lsa, hamma `git pull --rebase` ishlatishini bilsin — keyingi og'riq kamroq bo'ladi.

### Qiyin holat: o'zgarishlar bir xil emas

`git rebase` hujjati ("RECOVERING FROM UPSTREAM REBASE") ikki holatni ajratadi:

- **Oson holat** — yuqoridagidek: asosiy branch oddiy rebase qilingan, patch'lar so'zma-so'z bir xil. Oddiy `git rebase <asos>` yetadi.
- **Qiyin holat** — asosiy branch interaktiv rebase bilan tahrirlangan (commit tashlangan, birlashtirilgan), konflikt hal qilingan yoki `commit --amend`, `reset`, `filter-repo` ishlatilgan. Bunda oddiy rebase ba'zan ishlagandek ko'rinadi, lekin hujjat ogohlantiradi: masalan, interaktiv rebase bilan **olib tashlangan commit qayta tirilib qolishi** mumkin.

Qiyin holatda Git'ga "eski asos qayerda tugab, mening ishim qayerdan boshlangan" ni o'zingiz aytasiz — `--onto` bilan. Hujjatdagi shakl (siz `topic` da, `subsystem` qayta yozilgan):

```text
git rebase --onto subsystem subsystem@{1}
```

`subsystem@{1}` — fetch'dan oldingi eski uch (reflog). Yoki commit'laringiz sonini bilsangiz: `topic~3`. Hujjat yana ta'kidlaydi: bu "zanjir effekti" — `topic` dan ish boshlagan har bir kishi ham xuddi shu tiklashni qilishga majbur bo'ladi. Haqiqiy yechim esa — umumiy branch'ni umuman rebase qilmaslik.

## Kod: iflos working tree va `--autostash`

Commit qilinmagan o'zgarish bo'lsa, rebase boshlanmaydi:

```bash
# docs branch'ida bitta commit bor, u main'dan orqada qolgan
$ echo "Yangi qator" >> README.md
$ git rebase main
error: cannot rebase: You have unstaged changes.
error: Please commit or stash them.
```

Sababi tushunarli: rebase `HEAD`, index va working tree'ni bir necha marta almashtiradi ([39-bob](39-reset-sirlari.md)), saqlanmagan ish ostida qolib ketishi mumkin. `--autostash` o'zgarishni vaqtincha stash'ga ([38-bob](38-stash-va-clean.md)) olib qo'yadi va oxirida qaytaradi:

```bash
$ git rebase --autostash main
Created autostash: 4dcf692
Applied autostash.
Successfully rebased and updated refs/heads/docs.

$ git status --short
 M README.md
```

Hujjat ogohlantiradi: oxirgi stash'ni qo'llash murakkab konflikt berishi mumkin. Doimiy yoqish — `rebase.autoStash = true`.

Yana ikki holat:

```bash
$ git switch -q main
$ git rebase main
Current branch main is up to date.

$ git switch -q docs
$ git rebase
There is no tracking information for the current branch.
Please specify which branch you want to rebase against.
...
```

Branch allaqachon asos ustida bo'lsa, rebase hech narsa qilmaydi (hash'lar o'zgarmaydi). Baribir qayta yasash kerak bo'lsa — `-f`/`--force-rebase`. Argumentsiz `git rebase` upstream'ni ([28-bob](28-remote-branchlar.md)) oladi; u sozlanmagan bo'lsa, to'xtaydi.

## Muhandislik nuqtai nazari: merge yoki rebase

Pro Git bu savolga "qaysi biri yaxshi" deb javob bermaydi — avval "tarix nima" degan savolni qo'yadi. Ikki qarash bor:

- **Tarix — bo'lgan voqealar yozuvi.** U hujjat, uni o'zgartirish — haqiqatni "soxtalashtirish". Merge commit'lar chalkash bo'lsa ham, voqea shunday bo'lgan, kelajak uchun saqlansin.
- **Tarix — loyiha qanday qurilgani haqidagi hikoya.** Kitobning birinchi qoralamasini nashr qilmaganingiz kabi, xato yo'llaringizni ham ko'rsatish shart emas. O'quvchiga A dan B ga qanday borilganini aniq aytib bering.

Pro Git'ning amaliy xulosasi ikkalasining yaxshi tomonini oladi: **lokal o'zgarishlarni yuborishdan oldin rebase qilib tartibga soling, lekin biror joyga yuborilgan narsani hech qachon rebase qilmang.**

Amaliy jadval:

| Holat | Tavsiya |
| --- | --- |
| Faqat sizning kompyuteringizdagi commit'lar | Rebase — to'liq erkinlik |
| Yuborilgan, lekin hech kim ustidan ish qilmagan (masalan, o'z PR branch'ingiz) | Rebase mumkin, keyin `git push --force-with-lease` ([29-bob](29-fetch-push-ichidan.md)) |
| Boshqalar ustidan ish qilayotgan branch (`main`, `develop`) | Rebase **yo'q** — faqat merge yoki `revert` ([26-bob](26-murakkab-merge.md)) |
| `main` dagi yangiliklarni o'z feature branch'ingizga olish | Ikkalasi ham mumkin; rebase — chiziqli tarix, merge — haqiqiy tarix |
| Jamoada kelishuv | Bitta qoida tanlang va hamma bir xil ishlatsin (masalan, `pull.rebase true`) |

Rebase'ning yana bir yashirin narxi: ko'chirilgan har oraliq commit'ni **hech kim sinamagan**. `C8'` endi `C6` ustida turibdi — u kompilyatsiya bo'ladimi? Konfliktsiz rebase kod to'g'riligini kafolatlamaydi. Oraliq commit'larni avtomatik tekshirish — `git rebase --exec "make test"` ([25-bob](25-tarixni-qayta-yozish.md)).

## Muhandislik nuqtai nazari: rebase va hook'lar

Rebase boshlanishidan oldin `pre-rebase` hook'i ishga tushadi ([47-bob](47-hooklar.md)) — u ruxsat bermasa, rebase boshlanmaydi. Undan, masalan, allaqachon e'lon qilingan branch'ga birlashtirilgan topic branch'ni rebase qilishni taqiqlash uchun foydalaniladi: Git'ning namuna hook'i (`.git/hooks/pre-rebase.sample`) `next` branch'iga merge qilib bo'lingan topic'larni rebase qilishga yo'l qo'ymaydi, chunki bu e'lon qilingan tarixni qayta yozish bo'lardi. `--no-verify` bu hook'ni chetlab o'tadi. Tugagandan keyin esa `post-rewrite` hook'i ishlaydi va unga `rewritten-list` dagi "eski → yangi" juftlari uzatiladi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Umumiy (`main`, `develop`) branch'ni rebase qilib, `push --force` | Hamkasblar tarixida commit'lar ikki nusxada paydo bo'ladi | Oltin qoida: faqat hali hech kim ustidan ish qilmagan commit'larni rebase qiling |
| Rebase "commit'larni ko'chiradi" deb o'ylash | Hash'lar o'zgarganiga, PR izohlari "yo'qolgani"ga hayron qolasiz | Rebase yangi commit yasaydi; eskisi `ORIG_HEAD`/reflog'da qoladi |
| Rebase konfliktida `--ours` ni "meniki" deb tanlash | Rebase'da `ours` — asos (`main`), `theirs` — sizning commit | `git show :2:fayl`, `:3:fayl` bilan tekshiring ([22-bob](22-konfliktlar.md)) |
| Yarim qolgan rebase'ni unutib, detached HEAD'da ishlashni davom ettirish | Commit'lar hech qaysi branch'ga tushmaydi | `git status` ni o'qing; `.git/rebase-merge/` borligi — rebase davom etmoqda |
| `--skip` ni "konfliktni o'tkazib yuborish" deb tushunish | Commit'ning butun o'zgarishi natijadan chiqib ketadi | Konfliktni hal qilib `--continue`; `--skip` — faqat o'zgarish allaqachon asosda bo'lsa |
| Majburan yangilangan upstream ustiga oddiy `git pull` (merge) | Ikki nusxali commit'lar va ortiqcha merge | `git pull --rebase` yoki `git rebase origin/main` |
| `--onto` bilan bog'liq commit'larni ajratib yuborish | Konflikt yo'q, lekin kod ishlamaydi | Rebase'dan keyin build/test: `--exec` |
| Pro Git'dagi `First, rewinding head...` chiqishini kutish | Hozirgi standart merge backend boshqa chiqadi | Eski chiqish faqat `--apply` da; standartdan foydalaning |

## Amaliyot

1. Ayri tarix yarating (`main`da bitta, `feature`da ikkita commit). Rebase'dan oldin va keyin `git rev-parse feature~1 feature` ni yozib oling. `git cat-file -p` bilan eski va yangi commit'ni solishtiring: qaysi qatorlar o'zgardi, qaysilari o'zgarmadi va nega?
2. O'sha repo'da `git merge` va `git rebase` bilan ikki variantni yasang. `^{tree}` hash'lari bir xilligini tekshiring va tarix grafigini solishtiring.
3. Ikkinchi commit'da konflikt beradigan rebase yasang. To'xtagan paytda `.git/rebase-merge/` dagi `git-rebase-todo`, `done`, `onto`, `orig-head`, `rewritten-list` ni o'qing va har biri nimani bildirishini o'z so'zingiz bilan yozing. Keyin `git status` chiqishi shu fayllardan qanday tuzilganini ko'rsating.
4. Xuddi shu konfliktda bir marta `--continue`, bir marta `--skip`, bir marta `--abort` qiling (har safar boshidan). Natijaviy `git log` larni solishtiring.
5. Pro Git'dagi `server`/`client` tarixini yasang va `git rebase --onto main server client` qiling. `client` dan `server` faylining yo'qolganini ko'ring va bu qachon xavfli ekanini tushuntiring.
6. `git rebase --onto topicA~5 topicA~3 topicA` bilan olti commit'li branch'dan o'rtadagi ikkitasini olib tashlang. Qolgan commit'larning hash'lari nega o'zgardi?
7. (Qiyinroq) Bare repo va ikki klon bilan "rebase xavfi" ssenariysini to'liq takrorlang: hamkasb merge qilib yuboradi, siz merge qilasiz, hamkasb rebase qilib `push --force` qiladi. Keyin uch yo'lni sinang: oddiy merge, `git rebase origin/main`, `git pull --rebase`. Har birida `git log --cherry-mark --left-right origin/main...main` ni ko'rib, ikkinchi va uchinchi yo'l nega bir xil natija berib, lekin biri `skipped` ogohlantirishini chiqarib, ikkinchisi chiqarmasligini `git merge-base --fork-point` bilan tushuntiring.

## Rasmiy hujjat

- Pro Git — Rebasing: <https://git-scm.com/book/en/v2/Git-Branching-Rebasing>
- `git rebase`: <https://git-scm.com/docs/git-rebase>
- `git patch-id`: <https://git-scm.com/docs/git-patch-id>
- `git merge-base` (`--fork-point`): <https://git-scm.com/docs/git-merge-base>
- `git config` (`rebase.*`, `pull.rebase`): <https://git-scm.com/docs/git-config>
