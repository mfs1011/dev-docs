# 13 — Plumbing, porcelain va `.git` papkasi

[← Oldingi: Teglar va alias'lar](12-teglar-va-aliaslar.md) · [Mundarija](README.md) · [Keyingi: Obyektlar: blob va hash →](14-obyektlar-blob.md)

## Tushuncha

Shu paytgacha biz `add`, `commit`, `log`, `switch`, `tag` kabi 20–30 ta buyruq bilan ishladik. Ular qulay: odam o'qiy oladigan chiqish, maslahatlar (`use "git add <file>..."`), ranglar. Lekin Git ularning ostida yana yuzga yaqin "kichik" buyruqqa ega — ular bitta ishni bajaradi, chiqishi quruq va skript uchun mo'ljallangan.

Pro Git bu ikki qatlamni uy jihozlari bilan o'xshatgan atamalar bilan ataydi:

- **Porcelain** (chinni) — foydalanuvchi ko'radigan, qulay buyruqlar: `add`, `commit`, `status`, `branch`, `log`. Hammomdagi chinni lavabo kabi: ko'rinadigan, qo'l tegadigan qism.
- **Plumbing** (quvurlar) — devor ichidagi quvurlar: `hash-object`, `cat-file`, `update-index`, `write-tree`, `commit-tree`, `update-ref`, `rev-parse`. Ko'rinmaydi, lekin suvni aynan ular olib boradi.

Nega Git'da ikki qatlam bor? Pro Git tarixni eslatadi: Git dastlab to'liq, qulay VCS emas, **VCS yasash uchun asboblar to'plami** sifatida yaratilgan edi. Kichik buyruqlar UNIX uslubida bir-biriga ulanib ishlashi yoki skriptlardan chaqirilishi uchun mo'ljallangan. Qulay buyruqlar keyin ularning ustiga qurilgan.

Bu bob bilan kitobning **III qismi — "Git ichkaridan"** boshlanadi. Bu qismda asosan plumbing buyruqlar bilan ishlaymiz, chunki ular Git qanday va nega shunday ishlashini to'g'ridan-to'g'ri ko'rsatadi. Bu bobda esa avval "xarita" chizamiz: buyruqlarning ikki darajasi va Git ma'lumotlarini saqlaydigan `.git` papkasidagi har bir fayl va papka.

**`.git` papkasi** — repo'ning o'zi. Pro Git aytganidek, Git saqlaydigan va boshqaradigan deyarli hamma narsa shu yerda. Loyiha fayllaringiz (working tree) — `.git` dagi ma'lumotdan chiqarilgan "ish nusxasi" xolos.

## Nega shunday: nega ikki daraja buyruq kerak?

Ikki xil foydalanuvchi bor va ularning talablari qarama-qarshi:

1. **Odam** — tushunarli matn, maslahatlar, rang, o'z tilidagi xabarlar istaydi. Git jamoasi bu chiqishni vaqt o'tishi bilan **yaxshilashni** xohlaydi: yangi maslahat qo'shish, so'zlarni o'zgartirish, tartibni almashtirish.
2. **Skript** (CI, IDE, boshqa dastur) — chiqish **hech qachon o'zgarmasligini** xohlaydi. Agar `git status` matnidan `modified:` so'zini qidirib ishlaydigan skript yozsangiz, keyingi versiyada so'z o'zgarsa yoki tarjima yoqilsa, skript buziladi.

Rasmiy `git` ma'lumotnomasi buni shunday hal qiladi: plumbing buyruqlarning interfeysi (kirish, chiqish, opsiyalar, ma'nosi) **porcelain'nikidan ancha barqaror** bo'lishi kerak, chunki ular asosan skriptlar uchun. Porcelain interfeysi esa foydalanuvchi tajribasini yaxshilash uchun **o'zgarishi mumkin**.

Ikkinchi sabab — **tushunish**. Porcelain buyruq bir nechta plumbing qadamni birlashtiradi. Masalan, `git commit` ichida: index'dan tree obyekti yaratish, commit obyekti yaratish, branch ref'ini siljitish, reflog'ga yozish. Bu qadamlarni alohida ko'rsangiz, `reset`, `rebase`, `reflog` kabi "sehrli" buyruqlar oddiy bo'lib qoladi.

Uchinchi sabab — **yangi asboblar**. Ma'lumotnomaga ko'ra Git'ning low-level buyruqlari muqobil porcelain (boshqa interfeys) yaratish uchun yetarli. GUI dasturlar, IDE integratsiyalari va hosting xizmatlari aynan shu qatlamga tayanadi.

## Kod: buyruqlar ro'yxati — `git help -a`

`git help -a` barcha buyruqlarni rasmiy toifalar bo'yicha chiqaradi:

```bash
$ git help -a | grep -E "^[A-Z]"
See 'git help <command>' to read about a specific subcommand
Main Porcelain Commands
Ancillary Commands / Manipulators
Ancillary Commands / Interrogators
Interacting with Others
Low-level Commands / Manipulators
Low-level Commands / Interrogators
Low-level Commands / Syncing Repositories
Low-level Commands / Internal Helpers
User-facing repository, command and file interfaces
Developer-facing file formats, protocols and other interfaces
```

Bu toifalar `git` ma'lumotnomasidagi "GIT COMMANDS" bo'limiga mos:

| Toifa | Ma'nosi | Misollar |
| --- | --- | --- |
| Main Porcelain | Asosiy kundalik buyruqlar | `add`, `commit`, `switch`, `merge`, `log`, `status` |
| Ancillary / Manipulators | Yordamchi, o'zgartiradigan | `config`, `pack-refs`, `reflog`, `repack`, `replace` |
| Ancillary / Interrogators | Yordamchi, so'raydigan | `blame`, `fsck`, `count-objects`, `difftool` |
| Interacting with Others | Boshqa VCS va email | `svn`, `p4`, `send-email`, `request-pull` |
| Low-level / Manipulators | Plumbing: obyekt, index, ref'larni o'zgartiradi | `hash-object`, `update-index`, `write-tree`, `commit-tree`, `update-ref` |
| Low-level / Interrogators | Plumbing: so'raydi va solishtiradi | `cat-file`, `ls-files`, `ls-tree`, `rev-parse`, `rev-list`, `for-each-ref` |
| Low-level / Syncing | Repo'lar orasida ko'chirish | `fetch-pack`, `send-pack`, `http-backend`, `update-server-info` |
| Low-level / Internal Helpers | Boshqa buyruqlar ishlatadigan ichki yordamchilar | `check-ref-format`, `sh-setup`, `stripspace` |

Plumbing "o'zgartiruvchilar" (manipulators) to'liq ro'yxati:

```bash
$ git help -a | sed -n "/^Low-level Commands \/ Manipulators/,/^Low-level Commands \/ Interrogators/p"
Low-level Commands / Manipulators
   apply                   Apply a patch to files and/or to the index
   checkout-index          Copy files from the index to the working tree
   commit-graph            Write and verify Git commit-graph files
   commit-tree             Create a new commit object
   hash-object             Compute object ID and optionally create an object from a file
   index-pack              Build pack index file for an existing packed archive
   merge-file              Run a three-way file merge
   merge-index             Run a merge for files needing merging
   mktag                   Creates a tag object with extra validation
   mktree                  Build a tree-object from ls-tree formatted text
   multi-pack-index        Write and verify multi-pack-indexes
   pack-objects            Create a packed archive of objects
   prune-packed            Remove extra objects that are already in pack files
   read-tree               Reads tree information into the index
   replay                  EXPERIMENTAL: Replay commits on a new base, works with bare repos too
   symbolic-ref            Read, modify and delete symbolic refs
   unpack-objects          Unpack objects from a packed archive
   update-index            Register file contents in the working tree to the index
   update-ref              Update the object name stored in a ref safely
   write-tree              Create a tree object from the current index
```

"So'rovchilar" (interrogators) — `cat-file`, `diff-files`, `diff-index`, `diff-tree`, `for-each-ref`, `ls-files`, `ls-remote`, `ls-tree`, `merge-base`, `name-rev`, `repo`, `rev-list`, `rev-parse`, `show-index`, `show-ref`, `var`, `verify-pack` va boshqalar. Ma'lumotnoma ular haqida muhim kafolat beradi: so'rovchi buyruqlar odatda **working tree'dagi fayllarga tegmaydi**.

Ma'lumotnoma plumbing'ni o'rganishni boshlamoqchi bo'lganlarga `git update-index` va `git read-tree` sahifalarini o'qishni tavsiya qiladi — ularni [15-bobda](15-tree-va-index.md) ko'ramiz.

## Kod: bir savol — ikki javob

Tajriba repo'si (`git init` dan keyin bitta fayl, bitta commit; tafsiloti pastda):

```bash
$ echo "qator 2" >> README.md; echo yangi > yangi.txt
$ git status
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   README.md

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	yangi.txt

no changes added to commit (use "git add" and/or "git commit -a")
```

Bu — odam uchun. Skript uchun xuddi shu ma'lumot:

```bash
$ git status --porcelain
 M README.md
?? yangi.txt
$ git status --porcelain=v2 --branch
# branch.oid 9f648d789a4cb418adeb1b81154a9a74605d6751
# branch.head main
1 .M N... 100644 100644 100644 11d3bc143b7a3f7ce57df79bc7db609d55208b1f 11d3bc143b7a3f7ce57df79bc7db609d55208b1f README.md
? yangi.txt
```

E'tibor bering, nom chalkash: `--porcelain` opsiyasi **skript uchun** format beradi. Ma'lumotnomaga ko'ra u qisqa formatga o'xshaydi, lekin **Git versiyalari va foydalanuvchi sozlamalaridan qat'i nazar barqaror** qoladi. Ya'ni "porcelain" bu yerda "porcelain buyruqlar uchun xom ashyo" ma'nosida. `v2` formati ko'proq ma'lumot beradi: fayl rejimlari, HEAD va index'dagi blob hash'lari.

Boshqa juftliklar — chap tomonda porcelain, o'ngda shu ma'lumotni beradigan plumbing:

```bash
$ git branch
* main
$ git for-each-ref --format="%(refname) %(objectname)" refs/heads
refs/heads/main 9f648d789a4cb418adeb1b81154a9a74605d6751

$ git log --oneline
9f648d7 Birinchi commit
$ git rev-list HEAD
9f648d789a4cb418adeb1b81154a9a74605d6751

$ git rev-parse HEAD main HEAD^{tree}
9f648d789a4cb418adeb1b81154a9a74605d6751
9f648d789a4cb418adeb1b81154a9a74605d6751
271033816745688e1d5ef50049a4f1b03bda51c7
$ git symbolic-ref HEAD
refs/heads/main
```

Plumbing chiqishi qisqa hash yoki bezaklar o'rniga to'liq nom va to'liq hash beradi — mashina uchun ikkilanmaslik muhim. Obyektlarning o'zini ko'rish (bu buyruqlar keyingi boblarning asosiy asboblari):

```bash
$ git cat-file -p HEAD
tree 271033816745688e1d5ef50049a4f1b03bda51c7
author Ali Valiyev <ali@example.com> 1791349200 +0500
committer Ali Valiyev <ali@example.com> 1791349200 +0500

Birinchi commit
$ git ls-tree HEAD
100644 blob 11d3bc143b7a3f7ce57df79bc7db609d55208b1f	README.md
$ git diff-files --stat
 README.md | 1 +
 1 file changed, 1 insertion(+)
```

Uchta qator, uchta obyekt turi: commit → tree → blob. Ularni [14](14-obyektlar-blob.md)–[16-boblarda](16-commit-obyekti.md) birma-bir, qo'lda yaratib o'rganamiz.

| Savol | Porcelain | Plumbing |
| --- | --- | --- |
| Nima o'zgardi? | `git status` | `git status --porcelain`, `git diff-files`, `git diff-index` |
| Qanday branch'lar bor? | `git branch` | `git for-each-ref refs/heads`, `git show-ref --heads` |
| Tarix | `git log` | `git rev-list` |
| Bu nom qaysi commit? | — | `git rev-parse <nom>` |
| HEAD qaysi branch'da? | `git branch --show-current` | `git symbolic-ref HEAD` |
| Obyekt ichida nima bor? | `git show` | `git cat-file -p`, `git ls-tree` |
| Index'da nima bor? | — | `git ls-files -s` |
| Faylni stage qilish | `git add` | `git hash-object -w` + `git update-index` ([15-bob](15-tree-va-index.md)) |
| Commit qilish | `git commit` | `git write-tree` + `git commit-tree` + `git update-ref` ([16-bob](16-commit-obyekti.md)) |
| Branch'ni siljitish | `git reset`, `git branch -f` | `git update-ref` ([17-bob](17-reflar-va-head.md)) |

## Kod: o'z porcelain'ingizni yozish

Plumbing'ning amaliy foydasi — o'z buyrug'ingizni yasash. Ma'lumotnomaga ko'ra `PATH` dagi `git-<nom>` nomli bajariladigan fayl `git <nom>` sifatida ishlaydi. Kichik skript (`../13-bin/git-holat`):

```bash
#!/bin/sh
echo "branch: $(git symbolic-ref --short HEAD)"
echo "commit: $(git rev-parse --short HEAD)"
echo "o'zgargan: $(git status --porcelain | wc -l | tr -d ' ')"
```

```bash
$ chmod +x ../13-bin/git-holat
$ PATH=$PWD/../13-bin:$PATH git holat
branch: main
commit: aea741b
o'zgargan: 0
```

(Bu yerda repo'da ikkinchi commit allaqachon bor va hamma narsa commit qilingan.) Skript faqat barqaror buyruqlardan foydalanadi, shuning uchun Git yangilanganda ham ishlayveradi. Git'ning o'z buyruqlari ham shunday joylashgan — `git --exec-path` ko'rsatgan papkada 180 ga yaqin `git-*` fayl bor:

```bash
$ git --exec-path
.../libexec/git-core
$ ls $(git --exec-path) | grep -c "^git-"
180
```

Ko'pchiligi (bu o'rnatishda 152 tasi) alohida dastur emas, `git` ning o'ziga symlink (built-in buyruq); qolganlari alohida dasturlar yoki shell/Perl skriptlari. Alias ([12-bob](12-teglar-va-aliaslar.md)) bilan farqi: alias — bir qatorlik almashtirish, `git-<nom>` — to'liq dastur.

## Kod: yangi `.git` papkasi

Endi `.git` ning ichiga kiramiz. Yangi repo:

```bash
$ git init 13-papka
Initialized empty Git repository in /tmp/misol/13-papka/.git/
$ cd 13-papka
$ ls -F1 .git
HEAD
config
description
hooks/
info/
objects/
refs/
```

Pro Git'dagi ro'yxat bilan aynan bir xil. Hamma papka va fayllar:

```bash
$ find .git -type d | sort
.git
.git/hooks
.git/info
.git/objects
.git/objects/info
.git/objects/pack
.git/refs
.git/refs/heads
.git/refs/tags
$ find .git -type f -not -path '*/hooks/*' | sort
.git/HEAD
.git/config
.git/description
.git/info/exclude
$ du -sh .git
 80K	.git
```

Bo'sh repo — to'rtta oddiy fayl, o'nlab hook namunalari va bo'sh papkalar. Hammasi 80 KB, deyarli butunlay hook namunalari hisobiga.

Pro Git bularni ikki guruhga ajratadi. **Kam ahamiyatlilar:**

```bash
$ cat .git/description
Unnamed repository; edit this file 'description' to name the repository.
$ cat .git/info/exclude
# git ls-files --others --exclude-from=.git/info/exclude
# Lines that start with '#' are comments.
# For a project mostly in C, the following would be a good set of
# exclude patterns (uncomment them if you want to use them):
# *.[oa]
# *~
$ ls .git/hooks
applypatch-msg.sample
commit-msg.sample
fsmonitor-watchman.sample
post-update.sample
pre-applypatch.sample
pre-commit.sample
pre-merge-commit.sample
pre-push.sample
pre-rebase.sample
pre-receive.sample
prepare-commit-msg.sample
push-to-checkout.sample
sendemail-validate.sample
update.sample
```

- `description` — faqat GitWeb (repo'ni brauzerda ko'rsatadigan eski dastur) uchun. Boshqa hech narsa uni o'qimaydi.
- `info/exclude` — shu repo uchun shaxsiy ignore ro'yxati: `.gitignore` ga o'xshaydi, lekin commit qilinmaydi ([8-bob](08-gitignore-rm-mv.md)).
- `hooks/` — hook skriptlari. `git init` namunalarni o'rnatadi, lekin ularning **hammasi o'chiq**: yoqish uchun `.sample` qo'shimchasini olib tashlab nomini o'zgartirish kerak ([47-bob](47-hooklar.md)).

**Asosiylari** — Pro Git "Git'ning yadrosi" deb ataydigan to'rttasi:

- `objects/` — **ma'lumotlar bazasi**: barcha kontent (fayllar, papkalar, commit'lar, teglar). Hozir bo'sh — faqat `info/` va `pack/` papkalari.
- `refs/` — shu ma'lumotlardagi commit'larga **ko'rsatkichlar**: branch'lar (`heads/`), teglar (`tags/`), remote'lar.
- `HEAD` — hozir qaysi branch'da turganingiz.
- `index` — staging area ma'lumoti. Hozircha **yo'q** — birinchi `git add` da paydo bo'ladi.

```bash
$ cat .git/HEAD
ref: refs/heads/main
```

`HEAD` — **symbolic ref** (ramziy ko'rsatkich): u hash emas, boshqa ref nomini saqlaydi. `refs/heads/main` esa hali mavjud emas — ma'lumotnomaga ko'ra bu qonuniy: HEAD hali yaratilmagan branch'ni ko'rsatishi mumkin. Branch birinchi commit bilan paydo bo'ladi.

```bash
$ cat .git/config
[core]
	repositoryformatversion = 0
	filemode = true
	bare = false
	logallrefupdates = true
	ignorecase = true
	precomposeunicode = true
```

`config` — shu repo'ning lokal sozlamalari (`git config --local`, [3-bob](03-birinchi-sozlash.md)). `git init` yozgan qiymatlar:

| Kalit | Ma'nosi |
| --- | --- |
| `repositoryformatversion` | Repo formati versiyasi (pastda batafsil) |
| `filemode` | Fayl tizimi bajarish bitini (`chmod +x`) to'g'ri saqlaydimi |
| `bare` | Working tree yo'q repo'mi |
| `logallrefupdates` | Branch'lar o'zgarishini `logs/` ga yozish (reflog) |
| `ignorecase`, `precomposeunicode` | macOS fayl tizimi xususiyatlari: katta-kichik harfni farqlamaslik, Unicode normallashtirish. Linux'da bu qatorlar bo'lmaydi |

## Kod: `add` va `commit` `.git` da nimani o'zgartiradi

Har qadamdan oldin va keyin fayllar ro'yxatini solishtiramiz (hook'lardan tashqari):

```bash
$ find .git -type f -not -path '*/hooks/*' | sort > ../f0.txt
$ echo "Salom, Git" > README.md
$ git add README.md
$ find .git -type f -not -path '*/hooks/*' | sort > ../f1.txt
$ comm -13 ../f0.txt ../f1.txt
.git/index
.git/objects/11/d3bc143b7a3f7ce57df79bc7db609d55208b1f
```

`git add` ikki narsa qildi: fayl mazmunini **obyekt** sifatida omborga yozdi (`objects/11/d3bc14...`) va **index** faylini yaratdi. Index — ikkilik fayl, `DIRC` ("dircache") imzosi bilan boshlanadi:

```bash
$ xxd -l 12 .git/index
00000000: 4449 5243 0000 0002 0000 0001            DIRC........
$ git ls-files -s
100644 11d3bc143b7a3f7ce57df79bc7db609d55208b1f 0	README.md
```

Imzo, versiya (2) va yozuvlar soni (1). Index ichida — fayl yo'li, rejimi va blob hash'i. Uning to'liq formati — [15-bobda](15-tree-va-index.md). Endi commit:

```bash
$ git commit -q -m "Birinchi commit"
$ find .git -type f -not -path '*/hooks/*' | sort > ../f2.txt
$ comm -13 ../f1.txt ../f2.txt
.git/COMMIT_EDITMSG
.git/logs/HEAD
.git/logs/refs/heads/main
.git/objects/27/1033816745688e1d5ef50049a4f1b03bda51c7
.git/objects/9f/648d789a4cb418adeb1b81154a9a74605d6751
.git/refs/heads/main
```

Oltita yangi fayl — `git commit` ning to'liq "izi":

| Fayl | Nima |
| --- | --- |
| `objects/27/1033...` | Tree obyekti — index'dan yasalgan papka surati |
| `objects/9f/648d...` | Commit obyekti — tree + muallif + xabar |
| `refs/heads/main` | Endi mavjud branch: ichida commit hash'i |
| `logs/HEAD`, `logs/refs/heads/main` | Reflog: HEAD va `main` qayerdan qayerga siljigani |
| `COMMIT_EDITMSG` | Oxirgi commit xabari (muharrir shu faylni ochadi) |

```bash
$ git log --oneline
9f648d7 Birinchi commit
$ cat .git/refs/heads/main
9f648d789a4cb418adeb1b81154a9a74605d6751
$ cat .git/logs/HEAD
0000000000000000000000000000000000000000 9f648d789a4cb418adeb1b81154a9a74605d6751 Ali Valiyev <ali@example.com> 1791349200 +0500	commit (initial): Birinchi commit
$ cat .git/COMMIT_EDITMSG
Birinchi commit
```

Branch — bu commit hash'i yozilgan 41 baytlik fayl ([20-bob](20-branch-bu-ref.md)). Reflog qatori: eski qiymat (`0000...` — "hech narsa"), yangi qiymat, kim, qachon, nima uchun. Buni [42-bobda](42-reflog-va-tiklash.md) "yo'qolgan" commit'larni topish uchun ishlatamiz.

Endi `git commit` ning plumbing tarkibi ko'rinib turibdi: blob'lar (`add` da yozilgan) → tree (`write-tree`) → commit (`commit-tree`) → ref (`update-ref`) → reflog. Keyingi to'rt bobda aynan shu zanjirni porcelain'siz, qo'lda takrorlaymiz — [14-bob](14-obyektlar-blob.md) birinchi qadamdan, `hash-object` bilan blob yaratishdan boshlaydi.

## Kod: boshqa fayllar — operatsiyalar qoldiradigan izlar

Ikkinchi commit, teg, branch va `reset` dan keyin:

```bash
$ git add README.md
$ GIT_AUTHOR_DATE="2026-10-07T10:05:00+05:00" GIT_COMMITTER_DATE="2026-10-07T10:05:00+05:00" \
    git commit -q -m "Ikkinchi qator"
$ git tag v1 HEAD~1; git branch tajriba
$ git reset -q --soft HEAD~1; cat .git/ORIG_HEAD; git reset -q --soft ORIG_HEAD
aea741b09b47340032759052a3ea58f02d8b30ef
$ git log --oneline
aea741b Ikkinchi qator
9f648d7 Birinchi commit
$ ls .git
COMMIT_EDITMSG
HEAD
ORIG_HEAD
config
description
hooks
index
info
logs
objects
refs
```

`ORIG_HEAD` — `reset`, `merge`, `rebase` kabi "xavfli" amallardan oldin HEAD qayerda bo'lganini saqlaydi. Shuning uchun `git reset --soft ORIG_HEAD` bilan amalni darhol qaytara oldik ([39-bob](39-reset-sirlari.md)). Reflog hammasini qayd etdi:

```bash
$ cat .git/logs/HEAD | cut -c83-
Ali Valiyev <ali@example.com> 1791349200 +0500	commit (initial): Birinchi commit
Ali Valiyev <ali@example.com> 1791349500 +0500	commit: Ikkinchi qator
Ali Valiyev <ali@example.com> 1791349200 +0500	reset: moving to HEAD~1
Ali Valiyev <ali@example.com> 1791349200 +0500	reset: moving to ORIG_HEAD
```

**`packed-refs`.** Ref'lar alohida fayllarda:

```bash
$ find .git/refs -type f | sort
.git/refs/heads/main
.git/refs/heads/tajriba
.git/refs/tags/v1
$ git pack-refs --all
$ find .git/refs -type f
$ cat .git/packed-refs
# pack-refs with: peeled fully-peeled sorted 
aea741b09b47340032759052a3ea58f02d8b30ef refs/heads/main
aea741b09b47340032759052a3ea58f02d8b30ef refs/heads/tajriba
9f648d789a4cb418adeb1b81154a9a74605d6751 refs/tags/v1
$ git rev-parse tajriba v1
aea741b09b47340032759052a3ea58f02d8b30ef
9f648d789a4cb418adeb1b81154a9a74605d6751
```

`refs/` dagi fayllar yo'qoldi, lekin ref'lar ishlayveradi — ular `packed-refs` ga ko'chdi. Minglab teg bo'lgan repo'da bu minglab kichik fayl o'rniga bitta fayl. `git gc` buni avtomatik qiladi. Xulosa: **`.git/refs/` ni to'g'ridan-to'g'ri o'qiydigan skript yozmang** — `git rev-parse`, `git for-each-ref` dan foydalaning ([17-bob](17-reflar-va-head.md)).

**`info/exclude` va plumbing.** Ma'lumotnoma bir nozik nuqtani aytadi: `info/exclude` ni `status`, `add`, `rm`, `clean` kabi porcelain'lar o'qiydi, yadro (plumbing) buyruqlari esa — yo'q:

```bash
$ echo "yangi.txt" >> .git/info/exclude
$ git status --porcelain
$ git ls-files -o --exclude-standard
$ git ls-files -o
yangi.txt
```

`git ls-files -o` (untracked fayllar) ignore qoidalarini faqat so'ralganda qo'llaydi (`--exclude-standard`). Plumbing hech narsani "o'zicha" qilmaydi — hamma narsa aniq opsiya bilan.

**`FETCH_HEAD` va remote'lar.** Lokal bare repo'ga (u haqda pastda) push va fetch'dan keyin:

```bash
$ git init -q --bare ../13-markaz.git
$ git remote add origin ../13-markaz.git; git push -q origin main tajriba
$ git fetch origin; cat .git/FETCH_HEAD
aea741b09b47340032759052a3ea58f02d8b30ef	not-for-merge	branch 'main' of ../13-markaz
aea741b09b47340032759052a3ea58f02d8b30ef	not-for-merge	branch 'tajriba' of ../13-markaz
$ find .git/refs -type f | sort
.git/refs/remotes/origin/HEAD
.git/refs/remotes/origin/main
.git/refs/remotes/origin/tajriba
$ cat .git/refs/remotes/origin/HEAD
ref: refs/remotes/origin/main
$ tail -3 .git/config
[remote "origin"]
	url = ../13-markaz.git
	fetch = +refs/heads/*:refs/remotes/origin/*
```

`FETCH_HEAD` — oxirgi `fetch` nimani olib kelgani (`git pull` undan foydalanadi). `refs/remotes/origin/` — remote branch'lar nusxasi ([28-bob](28-remote-branchlar.md)). Remote sozlamasi esa oddiy `config` bo'limi ([27-bob](27-remote.md)). (`refs/heads/main` va `tajriba` yo'q — ular hali ham `packed-refs` da.)

## Kod: `.git` — butun repo

Pro Git: repo'ni zaxiralash yoki ko'chirish uchun bitta shu papkani nusxalash deyarli hamma narsani beradi. Sinab ko'ramiz — faqat `.git` ni bo'sh papkaga nusxalaymiz:

```bash
$ mkdir 13-zaxira && cp -R 13-papka/.git 13-zaxira/.git
$ cd 13-zaxira
$ ls
$ git status --short
 D README.md
$ git log --oneline
aea741b Ikkinchi qator
9f648d7 Birinchi commit
$ git restore .
$ cat README.md
Salom, Git
qator 2
```

Papkada bitta ham loyiha fayli yo'q edi, lekin butun tarix joyida. Git working tree'ni `.git` dan to'liq qayta tikladi. "Deyarli" so'zi esa muhim: commit qilinmagan o'zgarishlar, untracked fayllar va (ba'zi sozlamalarda) boshqa repo'lardan "qarzga olingan" obyektlar (pastda, `alternates`) bu nusxaga kirmaydi.

## Kod: bare repo — working tree'siz `.git`

Ma'lumotnoma (`gitrepository-layout`) repo'ning ikki ko'rinishini ajratadi: working tree ildizidagi `.git` papkasi va **bare** repo — `<loyiha>.git` papkasi, o'z working tree'si yo'q, odatda boshqalar push va fetch qiladigan "markaz":

Yuqorida yaratgan `13-markaz.git` ga qaraymiz (repo'lar papkasidan):

```bash
$ ls -F1 13-markaz.git
HEAD
config
description
hooks/
info/
objects/
refs/
$ cat 13-markaz.git/config
[core]
	repositoryformatversion = 0
	filemode = true
	bare = true
	ignorecase = true
	precomposeunicode = true
$ git -C 13-markaz.git status
fatal: this operation must be run in a work tree
```

Ichi — oddiy repo'dagi `.git` bilan bir xil, faqat papka o'zi repo. `bare = true`, `logallrefupdates` yo'q (serverda reflog standart bo'yicha yozilmaydi), `index` yo'q (stage qiladigan working tree yo'q). Working tree talab qiladigan buyruqlar ishlamaydi. Bare repo'lar haqida — [4-](04-repo-olish.md) va [27-boblar](27-remote.md).

## Kod: `.git` fayl bo'lishi ham mumkin — gitfile

`gitrepository-layout` dagi eslatma: working tree ildizida `.git` **oddiy matn fayli** ham bo'lishi mumkin, ichida `gitdir: <yo'l>` — haqiqiy repo papkasiga ko'rsatkich. Bu mexanizm **gitfile** deyiladi va `git worktree` hamda `git submodule` tomonidan boshqariladi:

```bash
$ git worktree add -q ../13-ikkinchi tajriba
$ ls -la ../13-ikkinchi | tail -2
-rw-r--r--@  1 ali  staff   170 Oct  8 07:38 .git
-rw-r--r--@  1 ali  staff    19 Oct  8 07:38 README.md
$ cat ../13-ikkinchi/.git
gitdir: /tmp/misol/13-papka/.git/worktrees/13-ikkinchi
```

Ikkinchi working tree uchun asosiy `.git` ichida alohida kichik papka paydo bo'ldi:

```bash
$ find .git/worktrees -type f | sort
.git/worktrees/13-ikkinchi/HEAD
.git/worktrees/13-ikkinchi/ORIG_HEAD
.git/worktrees/13-ikkinchi/commondir
.git/worktrees/13-ikkinchi/gitdir
.git/worktrees/13-ikkinchi/index
.git/worktrees/13-ikkinchi/logs/HEAD
$ cat .git/worktrees/13-ikkinchi/HEAD .git/worktrees/13-ikkinchi/commondir
ref: refs/heads/tajriba
../..
$ git -C ../13-ikkinchi rev-parse --git-dir --git-common-dir
/tmp/misol/13-papka/.git/worktrees/13-ikkinchi
/tmp/misol/13-papka/.git
```

Bu yerda ikki tushuncha ajraladi:

- **git dir** — shu working tree'ga xos qism: o'z `HEAD`, o'z `index`, o'z reflog'i (`logs/HEAD`). Har working tree o'z branch'ida turishi uchun.
- **common dir** — hamma working tree'lar uchun umumiy qism: `objects`, `refs`, `config`, `hooks`. `commondir` fayli unga yo'l (`../..` — ikki daraja yuqori, ya'ni `.git`).

Ma'lumotnomada bu `$GIT_COMMON_DIR` bilan ifodalanadi: u o'rnatilgan bo'lsa, `objects`, `refs` (`refs/bisect`, `refs/rewritten`, `refs/worktree` dan tashqari), `config`, `hooks`, `info`, `packed-refs` va boshqalar common dir'dan olinadi. Worktree'lar — [49-bob](49-worktree-va-katta-repo.md).

## Kod: `.git` ichidagi joyni so'rash — `rev-parse` va `git repo`

Skriptda `.git` yo'lini o'zingiz yig'mang — worktree, gitfile, `GIT_DIR` o'zgaruvchisi bo'lsa, u boshqa joyda bo'ladi. Git'dan so'rang:

```bash
$ git rev-parse --git-dir --show-toplevel --is-bare-repository --is-inside-work-tree
.git
/tmp/misol/13-papka
false
true
$ mkdir -p src; cd src; git rev-parse --git-dir --show-prefix --show-cdup; cd ..
/tmp/misol/13-papka/.git
src/
../
$ git rev-parse --git-path index --git-path hooks/pre-commit --git-path objects
.git/index
.git/hooks/pre-commit
.git/objects
```

`--git-path <yo'l>` — eng to'g'ri usul: u common dir/git dir farqini, `GIT_OBJECT_DIRECTORY`, `core.hooksPath` kabi sozlamalarni hisobga olib, faylning **haqiqiy** joyini beradi. `--show-prefix` — repo ildizidan joriy papkagacha, `--show-cdup` — ildizga qaytish yo'li.

Yangi, hozircha **eksperimental** buyruq — `git repo` (ma'lumotnoma: "THIS COMMAND IS EXPERIMENTAL. THE BEHAVIOR MAY CHANGE."). U repo haqidagi metama'lumotni kalit=qiymat ko'rinishida beradi:

```bash
$ git repo info --keys
layout.bare
layout.shallow
object.format
path.commondir.absolute
path.commondir.relative
path.gitdir.absolute
path.gitdir.relative
references.format
$ git repo info layout.bare object.format references.format
layout.bare=false
object.format=sha1
references.format=files
$ git -C ../13-ikkinchi repo info path.gitdir.relative path.commondir.relative
path.gitdir.relative=../13-papka/.git/worktrees/13-ikkinchi
path.commondir.relative=../13-papka/.git
```

`--all` — hamma kalitlar, `-z` (`--format=nul`) — dasturlar uchun NUL bilan ajratilgan format (qiymatlar hech qachon qo'shtirnoqqa olinmaydi). `git repo structure` — ref'lar va obyektlar statistikasi (bu yerda ikkinchi commit'dan oldingi holat):

```bash
$ git repo structure
| Repository structure      | Value |
| ------------------------- | ----- |
| * References              |       |
|   * Count                 |   1   |
|     * Branches            |   1   |
|     * Tags                |   0   |
...
| * Reachable objects       |       |
|   * Count                 |   3   |
|     * Commits             |   1   |
|     * Trees               |   1   |
|     * Blobs               |   1   |
|     * Tags                |   0   |
|   * Inflated size         | 222 B |
...
|   * Disk size             | 213 B |
...
```

Uchta obyekt — yuqorida `find` bilan ko'rgan blob, tree va commit. `--format=lines` mashina uchun (`objects.commits.count=1` kabi). Jadval formati "o'zgarishi mumkin va mashina tahlili uchun emas" — bu yerda ham porcelain/plumbing tamoyili.

## Kod: boshqa formatlar — `alternates`, `shallow`, `reftable`

**`objects/info/alternates`** — obyektlarni boshqa ombordan "qarzga olish". `git clone --shared` shunday ishlaydi:

```bash
$ git clone -q --shared 13-papka 13-shared
$ cat 13-shared/.git/objects/info/alternates
/tmp/misol/13-papka/.git/objects
$ find 13-shared/.git/objects -type f
13-shared/.git/objects/info/alternates
```

Klonda bitta ham obyekt yo'q — hammasi asl repo'dan o'qiladi. Disk tejaladi, lekin ma'lumotnoma ogohlantiradi: bunday ombor "o'zini o'zi ta'minlamaydi" va asl repo o'chirilsa yoki undan obyektlar tozalansa, klon buziladi.

**`shallow`** — sayoz klon (`--depth`) qayerda tarixni "kesib" qo'yganini saqlaydi:

```bash
$ git clone -q --depth 1 file://$PWD/13-papka 13-sayoz
$ cat 13-sayoz/.git/shallow
aea741b09b47340032759052a3ea58f02d8b30ef
$ git -C 13-sayoz log --oneline
aea741b Ikkinchi qator
$ git -C 13-sayoz repo info layout.shallow
layout.shallow=true
```

`aea741b` ning otasi (`9f648d7`) bu klonda yo'q — `shallow` fayli Git'ga "bu yerdan nariga qarama" deydi ([49-bob](49-worktree-va-katta-repo.md)).

**`reftable`** — ref'larni saqlashning yangi formati. README'da aytilganidek, `BreakingChanges` ga ko'ra Git 3.0 da u standart bo'ladi. Hozir uni qo'lda yoqish mumkin:

```bash
$ git init -q --ref-format=reftable 13-reftable
$ cd 13-reftable; git commit -q --allow-empty -m x
$ find .git -not -path "*/hooks/*" -not -path "*/objects/*" | sort
.git
.git/COMMIT_EDITMSG
.git/HEAD
.git/config
.git/description
.git/hooks
.git/index
.git/info
.git/info/exclude
.git/objects
.git/refs
.git/refs/heads
.git/reftable
.git/reftable/0x000000000001-0x000000000002-1bd3c1f2.ref
.git/reftable/tables.list
$ cat .git/HEAD
ref: refs/heads/.invalid
$ cat .git/refs/heads
this repository uses the reftable format
$ cat .git/config
[extensions]
	refstorage = reftable
[core]
	repositoryformatversion = 1
	...
```

Bu yerda ko'p narsa o'zgardi:

- Ref'lar (va reflog) `reftable/` dagi ikkilik jadvallarda; `tables.list` — joriy jadvallar ro'yxati. Jadval nomining oxiri tasodifiy, sizda boshqacha bo'ladi.
- `HEAD` endi `ref: refs/heads/.invalid`, `refs/heads` esa papka emas, **fayl** — bu "qopqon"lar. Eski Git yoki `.git` ni qo'lda o'qiydigan dastur bu papkani repo deb tanisa ham, ref'larni noto'g'ri o'qimasligi uchun.
- `repositoryformatversion = 1` va `[extensions]` bo'limi.

Shu sababli yana bir bor: ref'larni `cat .git/refs/...` bilan emas, Git buyruqlari bilan o'qing — `git rev-parse HEAD` reftable repo'da ham to'g'ri ishlaydi.

## Muhandislik nuqtai nazari: `repositoryformatversion` va `extensions`

Rasmiy `repository-version` hujjatiga ko'ra har repo `core.repositoryformatversion` bilan belgilanadi va **qoida qat'iy**: Git versiyani tushunmasa, repo bilan ishlashi **mumkin emas** — aks holda noto'g'ri natija yoki hatto ma'lumot yo'qolishi mumkin.

- **0** — Git'ning dastlabki formati.
- **1** — 0 bilan bir xil, lekin Git `[extensions]` bo'limini o'qishi **shart**, va noma'lum `extensions.*` kalit bo'lsa — ishlamasligi shart.

Ya'ni `extensions` — "eski Git, bu repo'ga tegma" signali. Biz uni ikki joyda ko'rdik: `extensions.refstorage = reftable` (shu bob) va `extensions.objectformat = sha256` ([14-bob](14-obyektlar-blob.md)). Hujjat butun repo formatini ko'tarishni imkon qadar kam qilishni tavsiya qiladi; o'rniga alohida fayllar formatini versiyalash (index, packfile) yoki eski klient shunchaki e'tiborsiz qoldiradigan qo'shimcha ma'lumot (masalan, pack bitmap) afzal.

## Muhandislik nuqtai nazari: `.git` xaritasi

`gitrepository-layout` dagi har bir yozuv, qisqacha. Ko'pchiligi oddiy repo'da hech qachon paydo bo'lmaydi — lekin paydo bo'lsa, nimaligini bilasiz.

| Joy | Nima | Batafsil |
| --- | --- | --- |
| `HEAD` | Joriy branch'ga symbolic ref yoki (detached HEAD'da) commit hash'i. Har repo'da **bo'lishi shart** | [17-bob](17-reflar-va-head.md) |
| `config` | Repo sozlamalari | [45-bob](45-config-chuqur.md) |
| `config.worktree` | Ko'p worktree'da asosiy working tree'ga xos sozlamalar | [49-bob](49-worktree-va-katta-repo.md) |
| `description` | Faqat GitWeb uchun nom | — |
| `index` | Staging area (bare repo'da odatda yo'q) | [15-bob](15-tree-va-index.md) |
| `sharedindex.<hash>` | "Split index" rejimida index'ning umumiy qismi | [15-bob](15-tree-va-index.md) |
| `objects/[0-9a-f][0-9a-f]/` | Loose (alohida) obyektlar, hash'ning birinchi 2 belgisi bo'yicha 256 papkaga taqsimlangan | [14-bob](14-obyektlar-blob.md) |
| `objects/pack/` | Packfile'lar (`.pack`) va ularning indekslari (`.idx`) | [18-bob](18-packfile-va-gc.md) |
| `objects/info/packs` | "Dumb" (oddiy HTTP) transport uchun pack ro'yxati; `git update-server-info` yangilaydi | [29-bob](29-fetch-push-ichidan.md) |
| `objects/info/alternates` | Qarzga olinadigan boshqa obyekt omborlari | shu bob |
| `objects/info/http-alternates` | Xuddi shu, HTTP orqali fetch uchun URL'lar | — |
| `refs/heads/<nom>` | Branch'lar | [20-bob](20-branch-bu-ref.md) |
| `refs/tags/<nom>` | Teglar (istalgan obyektga) | [12-](12-teglar-va-aliaslar.md), [17-bob](17-reflar-va-head.md) |
| `refs/remotes/<nom>` | Remote branch nusxalari | [28-bob](28-remote-branchlar.md) |
| `refs/replace/<hash>` | `git replace` almashtirishlari | [43-bob](43-submodule-bundle-replace.md) |
| `packed-refs` | Ko'p ref'ni bitta faylda samarali saqlash | [17-bob](17-reflar-va-head.md) |
| `reftable/` | Yangi ref formati (Git 3.0 da standart) | [17-bob](17-reflar-va-head.md) |
| `logs/` | Reflog'lar: `logs/HEAD`, `logs/refs/heads/<nom>` | [42-bob](42-reflog-va-tiklash.md) |
| `hooks/` | Hook skriptlari (namunalar o'chiq) | [47-bob](47-hooklar.md) |
| `info/exclude` | Shaxsiy ignore ro'yxati (porcelain o'qiydi) | [8-bob](08-gitignore-rm-mv.md) |
| `info/attributes` | Shaxsiy `.gitattributes` | [46-bob](46-gitattributes.md) |
| `info/sparse-checkout` | Sparse checkout pattern'lari | [49-bob](49-worktree-va-katta-repo.md) |
| `info/refs` | Dumb transport uchun ref ro'yxati | [29-bob](29-fetch-push-ichidan.md) |
| `info/grafts` | Eskirgan: soxta ota-commit ma'lumoti. O'rniga `git replace` | [43-bob](43-submodule-bundle-replace.md) |
| `shallow` | Sayoz klon chegarasi | [49-bob](49-worktree-va-katta-repo.md) |
| `commondir` | Umumiy `.git` ga yo'l (worktree ichida) | shu bob |
| `worktrees/<id>/` | Qo'shimcha working tree'lar ma'lumoti (`gitdir`, `locked`, `config.worktree`) | [49-bob](49-worktree-va-katta-repo.md) |
| `modules/` | Submodule'larning repo'lari | [43-bob](43-submodule-bundle-replace.md) |
| `branches/`, `remotes/` | Juda eski remote yozish usuli. Git 3.0 ularni o'qishni to'xtatadi | — |

Hujjatda yo'q, lekin buyruqlar vaqtincha qoldiradigan "pseudo-ref" va fayllar:

| Fayl | Kim yozadi |
| --- | --- |
| `ORIG_HEAD` | `reset`, `merge`, `rebase` — amaldan oldingi HEAD |
| `FETCH_HEAD` | `fetch` — nima olib kelingani |
| `MERGE_HEAD`, `MERGE_MSG` | Davom etayotgan merge ([22-bob](22-konfliktlar.md)) |
| `CHERRY_PICK_HEAD`, `REVERT_HEAD` | Davom etayotgan cherry-pick/revert |
| `COMMIT_EDITMSG`, `TAG_EDITMSG` | Oxirgi commit/teg xabari muharriri ([12-bob](12-teglar-va-aliaslar.md)) |
| `rebase-merge/`, `rebase-apply/` | Davom etayotgan rebase holati ([24-bob](24-rebase.md)) |

## Muhandislik nuqtai nazari: `.git` bilan qo'lda ishlash xavfi

Bu bobda biz `.git` ichini **o'qidik**. Yozish boshqa masala:

- **Obyektlarni tahrirlamang.** Ular o'z hash'i bilan nomlangan; o'zgartirish repo'ni buzadi ([14-bob](14-obyektlar-blob.md)da `fsck` bilan ko'ramiz).
- **Ref fayllarini qo'lda yozmang** — `git update-ref` ishlating. U qulf fayl (`.lock`) bilan atomar yozadi, reflog'ni yangilaydi va `packed-refs`/reftable'ni hisobga oladi.
- **`index` ni tahrirlamang** — ikkilik format, ichida nazorat summasi bor.
- **Xavfsiz o'zgartirishlar:** `config` (lekin `git config` yaxshiroq), `description`, `info/exclude`, `hooks/` ga skript qo'shish.
- **Tajriba uchun** — repo nusxasida ishlang (`cp -R`), yuqoridagi `13-zaxira` kabi.

`.lock` fayllari haqida: Git biror faylni yangilashdan oldin `<fayl>.lock` yaratadi, yangi mazmunni unga yozadi va keyin nomini almashtiradi. Git jarayoni to'satdan to'xtasa, masalan `index.lock` qolib ketishi mumkin. Buni sun'iy qilib ko'ramiz:

```bash
$ touch .git/index.lock
$ git add README.md
fatal: Unable to create '/tmp/misol/13-papka/.git/index.lock': File exists.

Another git process seems to be running in this repository, or the lock file may be stale
$ rm .git/index.lock
```

Xabar ikki imkoniyatni aytadi: yoki boshqa Git jarayoni haqiqatan ishlayapti (masalan, IDE fonda `fetch` qilyapti), yoki qulf "eskirib" qolgan. Boshqa Git jarayoni yo'qligiga ishonch hosil qilgandan keyingina `.lock` faylni o'chiring.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Skriptda `git status` matnini tahlil qilish | Porcelain chiqishi versiyalar va sozlamalar bilan o'zgaradi | `git status --porcelain` (yoki `=v2`), plumbing buyruqlari |
| `--porcelain` ni "odam uchun format" deb o'ylash | Aksincha — skript uchun barqaror format | Odam uchun oddiy `git status` |
| Skriptda `cat .git/refs/heads/main` | Ref `packed-refs` yoki reftable'da bo'lishi mumkin | `git rev-parse main` |
| `.git` yo'lini `$PWD/.git` deb yig'ish | Worktree/submodule'da `.git` — fayl, `GIT_DIR` boshqa joy bo'lishi mumkin | `git rev-parse --git-dir`, `--git-path` |
| `hooks/` dagi `.sample` fayllar ishlaydi deb o'ylash | Hammasi o'chiq | `.sample` qo'shimchasini olib tashlash ([47-bob](47-hooklar.md)) |
| `.git` ichidagi faylni qo'lda tahrirlash | Hash, nazorat summasi, qulflar buziladi | Tegishli plumbing: `update-ref`, `update-index`, `hash-object` |
| Faqat working tree'ni zaxiralash | Tarix `.git` da | `.git` ni ham (yoki `git bundle`, [43-bob](43-submodule-bundle-replace.md)) |
| `--shared` klonni mustaqil zaxira deb hisoblash | Obyektlar asl repo'da | Oddiy `clone` yoki `git repack -a` bilan obyektlarni ko'chirish |
| `index.lock` ni darhol o'chirish | Haqiqatan ishlayotgan Git jarayoni buzilishi mumkin | Avval boshqa Git jarayoni yo'qligini tekshiring |

## Amaliyot

1. Yangi repo yarating va `find .git -type f -not -path '*/hooks/*'` natijasini yozib oling. Har bir faylning vazifasini o'z so'zlaringiz bilan tushuntiring.
2. Bitta faylni `add` qiling, keyin `commit` qiling. Har qadamdan keyin qaysi fayllar paydo bo'lganini `comm` bilan aniqlang va ularni "obyekt", "ref", "reflog", "index" guruhlariga ajrating.
3. `git status`, `git status -s`, `git status --porcelain` va `git status --porcelain=v2 --branch` chiqishlarini solishtiring. `LANG` ni boshqa tilga o'zgartirib (masalan `LANG=de_DE.UTF-8`, agar tarjima o'rnatilgan bo'lsa) qaysi biri o'zgarishini tekshiring.
4. Uchta branch va ikkita teg yarating, `git pack-refs --all` dan keyin `.git/refs` va `.git/packed-refs` ni ko'ring. `git branch -f` bilan branch'ni siljiting — yangi qiymat qayerga yozildi?
5. `git worktree add` bilan ikkinchi working tree yarating. `cat <worktree>/.git`, `git rev-parse --git-dir --git-common-dir` va `git repo info --all` ni ikkala joyda solishtiring.
6. Faqat `.git` ni yangi papkaga nusxalang va repo'ni to'liq tiklang. Untracked fayl va commit qilinmagan o'zgarish nusxaga tushdimi?
7. `git init --ref-format=reftable` bilan repo yarating, ikkita branch qo'shing. `.git/refs/heads` va `.git/HEAD` nima uchun shunday ko'rinishini tushuntiring; `git rev-parse` ishlashini tekshiring.
8. (Qiyinroq) Faqat plumbing buyruqlaridan (`symbolic-ref`, `rev-parse`, `for-each-ref`, `rev-list --count`, `status --porcelain=v2`) foydalanib `git-xulosa` buyrug'ini yozing: joriy branch, uning upstream'dan oldinda/orqada nechta commit ekani, eng yaqin teg va o'zgargan fayllar soni. Uni `PATH` ga qo'yib `git xulosa` sifatida ishga tushiring, detached HEAD'da ham ishlashini ta'minlang.

## Rasmiy hujjat

- Pro Git — Plumbing and Porcelain: <https://git-scm.com/book/en/v2/Git-Internals-Plumbing-and-Porcelain>
- `gitrepository-layout` — `.git` papkasidagi har bir yozuv: <https://git-scm.com/docs/gitrepository-layout>
- `git` — buyruqlar toifalari ("GIT COMMANDS", "Low-level commands"): <https://git-scm.com/docs/git>
- `git repo` (eksperimental): <https://git-scm.com/docs/git-repo>
- `git rev-parse` (`--git-dir`, `--git-path`, `--show-toplevel`): <https://git-scm.com/docs/git-rev-parse>
- `git status` (`--porcelain` formatlari): <https://git-scm.com/docs/git-status>
- `git help` (`-a`): <https://git-scm.com/docs/git-help>
- `gitglossary` — plumbing, porcelain, symbolic ref: <https://git-scm.com/docs/gitglossary>
- `git pack-refs`: <https://git-scm.com/docs/git-pack-refs>
- Repo formati versiyalari: <https://git-scm.com/docs/repository-version>
- Git 3.0 dagi o'zgarishlar (`BreakingChanges`): <https://git-scm.com/docs/BreakingChanges>
