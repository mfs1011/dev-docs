# 49 — Worktree va katta repo'lar

[← Oldingi: Muhit o'zgaruvchilari](48-muhit-ozgaruvchilari.md) · [Mundarija](README.md) · [Keyingi: Buyruqlar xaritasi va checklist →](50-buyruqlar-xaritasi.md)

## Tushuncha

Odatda bitta repo — bitta papka: bitta `.git` va uning yonida bitta **working tree** (fayllar turgan ish papkasi). Bir vaqtda faqat bitta branch "ochiq" bo'ladi. Repo kattalashganda yoki ish ko'payganda bu ikki xil muammoga olib keladi:

1. **Bir vaqtda bir nechta branch kerak.** Siz katta refactoring o'rtasidasiz, fayllar sochilib yotibdi — shu payt shoshilinch tuzatish so'rashadi. `stash` ([38-bob](38-stash-va-clean.md)) bor, lekin chalkash holatni yig'ishtirib-qaytarish xavfli va noqulay.
2. **Repo juda katta.** Yuz minglab fayl, gigabaytlab tarix, katta binar fayllar. To'liq `clone` soatlab yuklanadi, `git status` sekinlashadi, diskda joy yetmaydi — holbuki sizga loyihaning kichik bir qismi kerak.

Git bu muammolar uchun bir nechta mustaqil vositalar beradi. Har biri boshqa "o'lcham"ni qisqartiradi:

| Vosita | Nimani hal qiladi | Nimani qisqartiradi |
| --- | --- | --- |
| `git worktree` | Bir repo'dan bir nechta working tree | Qayta klonlash zaruratini |
| `git sparse-checkout` | Working tree'da faqat kerakli papkalar | Diskdagi fayllar sonini |
| Partial clone (`--filter`) | Obyektlarni kerak bo'lganda yuklash | Yuklanadigan blob/tree'larni |
| Shallow clone (`--depth`) | Tarixni kesib olish | Yuklanadigan commit'larni |
| `git maintenance` | Fonda tartibga keltirish | Buyruqlar kutish vaqtini |
| `scalar` | Yuqoridagilarni bitta buyruqda sozlash | Sozlash mehnatini |
| Git LFS (tashqi vosita) | Katta binar fayllarni tashqi omborda saqlash | Repo ichidagi binar hajmni |

Bularni birlashtirish mumkin: masalan `scalar clone` partial clone + sparse-checkout + maintenance'ni birga yoqadi.

Bu bobda **worktree** — bitta repo'ga ulangan qo'shimcha working tree. Ma'lumotnoma ta'rifi: working tree va uni boshqalardan ajratib turadigan metama'lumot birgalikda "worktree" deyiladi. `git init` yoki `git clone` yaratgani — **main worktree** (asosiy), `git worktree add` qo'shganlari — **linked worktree** (bog'langan). Bare bo'lmagan repo'da bitta asosiy va istalgancha bog'langan worktree bo'ladi.

## Nega shunday: nega ikkinchi `clone` emas, worktree?

Ikkinchi branch uchun repo'ni yana bir marta klonlash ham mumkin. Lekin unda:

- **Obyektlar ikki nusxa.** Har klonda o'z `.git/objects` — katta repo'da gigabaytlar takrorlanadi.
- **Ref'lar alohida.** Bir klonda qilingan commit ikkinchisida ko'rinmaydi — `push`/`fetch` qilish kerak.
- **Sozlamalar, hook'lar alohida.**

Worktree esa repo'ning o'zini — obyektlar, ref'lar, config, hook'larni — **bo'lishadi** va faqat har working tree'ga xos narsalarni alohida saqlaydi: `HEAD`, `index`, `ORIG_HEAD` va shu kabi. Shuning uchun bir worktree'da qilingan commit boshqasida darhol ko'rinadi — ular bitta `refs/heads/` ga yozadi.

Bitta cheklov shu modeldan kelib chiqadi: **bitta branch ikki worktree'da bir vaqtda ochiq bo'lolmaydi.** Agar ikkalasi bir branch'da bo'lsa, birida commit qilish branch'ni siljitadi, ikkinchisining `index`i va fayllari esa eski commit'da qoladi — `git status` yolg'on gapira boshlaydi. Git buni oldindan taqiqlaydi.

Katta repo vositalari esa boshqa savolga javob: "nega hamma narsani yuklash kerak?" Git'ning taqsimlangan modeli ([1-bob](01-versiya-nazorati.md)) har klonda to'liq tarixni nazarda tutadi — bu oflayn ishlash va ishonchlilik beradi. Lekin juda katta repo'da bu narx haddan oshadi. Partial va shallow clone shu kafolatning bir qismidan ongli ravishda voz kechadi: siz kamroq yuklaysiz, evaziga ba'zi amallar serverga murojaat qiladi yoki ishlamaydi.

## Kod: birinchi worktree'lar

Ikki commit'li repo, asosiy working tree'da tugallanmagan ish bor:

```bash
$ git log --oneline
33dbb3e Ikkinchi versiya
59825e0 Boshlang'ich loyiha
$ echo "yarim tayyor" >> src/app.js; echo "yangi" > qoralama.txt
```

Endi uch xil usulda worktree qo'shamiz:

```bash
$ git worktree add ../tuzatish
Preparing worktree (new branch 'tuzatish')
HEAD is now at 33dbb3e Ikkinchi versiya
$ git worktree add -b feature/login ../login main
Preparing worktree (new branch 'feature/login')
HEAD is now at 33dbb3e Ikkinchi versiya
$ git worktree add -d ../sinov HEAD~1
Preparing worktree (detached HEAD 59825e0)
HEAD is now at 59825e0 Boshlang'ich loyiha
```

- `git worktree add <yo'l>` — commit ko'rsatilmasa, yo'lning oxirgi qismi nomidagi branch (`tuzatish`) **avtomatik yaratiladi** va `HEAD` dan boshlanadi. Shunday branch bor bo'lsa va boshqa joyda ochiq bo'lmasa — o'sha branch ochiladi.
- `-b <yangi-branch> <yo'l> <commit>` — yangi branch'ni aniq nom va boshlang'ich nuqta bilan. `-B` — branch bor bo'lsa ham uni shu nuqtaga qayta o'rnatadi.
- `-d` (`--detach`) — branch'siz, detached HEAD ([17-bob](17-reflar-va-head.md)). Tez sinab ko'rish, eski versiyani build qilish uchun qulay: keraksiz branch paydo bo'lmaydi.

Commit o'rniga `-` yozish mumkin — bu `@{-1}`, ya'ni oldingi branch ([19-bob](19-revision-tanlash.md)).

Hamma worktree'lar ro'yxati:

```bash
$ git worktree list
/tmp/misol/49-worktree/ilova    33dbb3e [main]
/tmp/misol/49-worktree/login    33dbb3e [feature/login]
/tmp/misol/49-worktree/sinov    59825e0 (detached HEAD)
/tmp/misol/49-worktree/tuzatish 33dbb3e [tuzatish]
$ git branch -v
+ feature/login 33dbb3e Ikkinchi versiya
* main          33dbb3e Ikkinchi versiya
+ tuzatish      33dbb3e Ikkinchi versiya
```

Asosiy worktree doim birinchi. `git branch` dagi `+` belgisi — "bu branch boshqa worktree'da ochiq" degani (`*` — joriy worktree'dagi).

Endi tuzatishni alohida papkada qilamiz — asosiy papkadagi chalkash holatga tegmasdan:

```bash
$ cd ../tuzatish
$ echo "console.log('tuzatildi')" > src/app.js
$ git commit -q -am "Xatoni tuzatish"
$ cd ../ilova
$ git log --oneline -1 tuzatish
8edcda6 Xatoni tuzatish
$ git status -s
 M src/app.js
?? qoralama.txt
```

Commit asosiy worktree'da darhol ko'rinadi (ref'lar umumiy), asosiy papkadagi o'zgarishlar esa joyida. `stash` kerak bo'lmadi.

Branch boshqa worktree'da ochiq bo'lsa:

```bash
$ git switch feature/login
fatal: 'feature/login' is already used by worktree at '/tmp/misol/49-worktree/login'
$ git worktree add ../ikkinchi-main main
Preparing worktree (checking out 'main')
fatal: 'main' is already used by worktree at '/tmp/misol/49-worktree/ilova'
```

`--force` bu himoyani chetlab o'tadi, lekin "Nega shunday" bo'limidagi sabab tufayli bunga ehtiyoj deyarli bo'lmaydi.

## Kod: worktree ichida — `.git` fayli va `.git/worktrees/`

Bog'langan worktree'da `.git` **papka emas, fayl**:

```bash
$ ls -la ../login
total 16
drwxr-xr-x@ 6 ali   staff  192 Oct  8 17:24 .
drwxr-xr-x@ 6 ali   staff  192 Oct  8 17:24 ..
-rw-r--r--@ 1 ali   staff  173 Oct  8 17:24 .git
-rw-r--r--@ 1 ali   staff    8 Oct  8 17:24 README.md
drwxr-xr-x@ 3 ali   staff   96 Oct  8 17:24 docs
drwxr-xr-x@ 3 ali   staff   96 Oct  8 17:24 src
$ cat ../login/.git
gitdir: /tmp/misol/49-worktree/ilova/.git/worktrees/login
```

Bu [13-bobda](13-plumbing-va-porcelain.md) ko'rilgan **gitfile** mexanizmi: bir qatorli matn, "haqiqiy repo papkasi u yerda". Ko'rsatilgan joy — asosiy repo ichidagi `worktrees/<id>/` papkasi:

```bash
$ find .git/worktrees -type f | sort
.git/worktrees/login/HEAD
.git/worktrees/login/ORIG_HEAD
.git/worktrees/login/commondir
.git/worktrees/login/gitdir
.git/worktrees/login/index
.git/worktrees/login/logs/HEAD
.git/worktrees/sinov/HEAD
...
.git/worktrees/tuzatish/logs/HEAD
$ cat .git/worktrees/login/HEAD .git/worktrees/login/commondir .git/worktrees/login/gitdir
ref: refs/heads/feature/login
../..
/tmp/misol/49-worktree/login/.git
```

Har fayl nima:

| Fayl | Vazifasi |
| --- | --- |
| `HEAD` | Shu worktree'ning o'z HEAD'i (har worktree'da boshqa) |
| `index` | Shu worktree'ning o'z staging hududi ([15-bob](15-tree-va-index.md)) |
| `logs/HEAD` | Shu worktree HEAD'ining reflog'i ([42-bob](42-reflog-va-tiklash.md)) |
| `ORIG_HEAD` | Xavfli amallardan oldingi HEAD |
| `commondir` | Umumiy qismga yo'l: `../..`, ya'ni asosiy `.git` |
| `gitdir` | Teskari bog'lanish: worktree'ning `.git` fayli qayerda |
| `locked` | (bo'lsa) qulf sababi — pastda |
| `config.worktree` | (bo'lsa) shu worktree'ga xos sozlamalar |

Ichki papka nomi (**id**) odatda yo'lning oxirgi qismi; band bo'lsa raqam qo'shiladi (`test-next1`). Bog'lanish **ikki tomonlama**: worktree → repo (`.git` fayli) va repo → worktree (`gitdir` fayli). Pastda ko'rasiz, papka ko'chirilsa aynan shu bog'lanish uziladi.

Git'ning o'zidan so'rash — bog'langan worktree ichida:

```bash
$ git -C ../login rev-parse --git-dir --git-common-dir --show-toplevel
/tmp/misol/49-worktree/ilova/.git/worktrees/login
/tmp/misol/49-worktree/ilova/.git
/tmp/misol/49-worktree/login
$ git -C ../login rev-parse --git-path HEAD --git-path refs/heads/main --git-path index
/tmp/misol/49-worktree/ilova/.git/worktrees/login/HEAD
/tmp/misol/49-worktree/ilova/.git/refs/heads/main
/tmp/misol/49-worktree/ilova/.git/worktrees/login/index
```

Bu yerda ikki o'zgaruvchi bor: `$GIT_DIR` — worktree'ning shaxsiy papkasi, `$GIT_COMMON_DIR` — umumiy `.git` ([48-bob](48-muhit-ozgaruvchilari.md)). `--git-path` har yo'l qaysi biriga tegishli ekanini o'zi hal qiladi: `HEAD` va `index` — shaxsiy, `refs/heads/main` — umumiy. Ma'lumotnomaning maslahati: `.git` ichidagi yo'lni hech qachon o'zingiz yig'mang, `git rev-parse --git-path` dan so'rang.

### Qaysi ref'lar umumiy

Qoida (ma'lumotnoma, REFS bo'limi): `HEAD` kabi **pseudo ref'lar** (`$GIT_DIR` ning o'zida turadiganlar) har worktree'da alohida; `refs/` bilan boshlanadiganlar umumiy. Istisno — `refs/bisect`, `refs/worktree`, `refs/rewritten` ham alohida. Shuning uchun ikki worktree'da bir vaqtda mustaqil `bisect` ([41-bob](41-blame-va-bisect.md)) yoki `rebase` qilish mumkin.

Boshqa worktree'ning shaxsiy ref'larini maxsus yo'llar bilan o'qish mumkin:

```bash
$ git rev-parse worktrees/sinov/HEAD
59825e0532c8db4c6ea6c4386be7a1793571f156
$ git -C ../sinov3 rev-parse main-worktree/HEAD
33dbb3e408a3980a84817218a5be03af7ef9f4dc
```

`worktrees/<id>/...` — bog'langan worktree'niki, `main-worktree/...` — asosiysiniki. Bu yerda id — `.git/worktrees/` dagi papka nomi, worktree papkasining hozirgi nomi emas (`sinov3` ga ko'chirilgan bo'lsa ham id `sinov` qoladi).

## Kod: `lock`, `remove`, `prune`, `move`, `repair`

**Qulflash.** Worktree USB disk yoki tarmoq papkasida bo'lsa va u ulanmagan bo'lsa, Git uni "yo'qolgan" deb hisoblab ma'lumotlarini tozalab yuborishi mumkin. `lock` bunga yo'l qo'ymaydi:

```bash
$ git worktree lock --reason "USB diskda" ../sinov
$ cat .git/worktrees/sinov/locked
USB diskda
$ git worktree list
/tmp/misol/49-worktree/ilova    33dbb3e [main]
/tmp/misol/49-worktree/login    33dbb3e [feature/login]
/tmp/misol/49-worktree/sinov    59825e0 (detached HEAD) locked
/tmp/misol/49-worktree/tuzatish 8edcda6 [tuzatish]
$ git worktree list -v
/tmp/misol/49-worktree/ilova    33dbb3e [main]
/tmp/misol/49-worktree/login    33dbb3e [feature/login]
/tmp/misol/49-worktree/sinov    59825e0 (detached HEAD)
	locked: USB diskda
/tmp/misol/49-worktree/tuzatish 8edcda6 [tuzatish]
```

Qulf — oddiy `locked` fayli, ichida sabab. `-v` sababni keyingi qatorda ko'rsatadi. `git worktree add --lock` yaratish va qulflashni bitta amalda qiladi (ma'lumotnoma: "race condition"siz — orada `prune` ulgurib qolmaydi).

**O'chirish.** To'g'ri yo'l — `git worktree remove`. U faqat **toza** worktree'ni o'chiradi:

```bash
$ git worktree remove ../sinov
fatal: cannot remove a locked working tree, lock reason: USB diskda
use 'remove -f -f' to override or unlock first
$ echo x > ../login/vaqtinchalik.txt
$ git worktree remove ../login
fatal: '../login' contains modified or untracked files, use --force to delete it
$ git worktree remove ../tuzatish
$ git branch -v
+ feature/login 33dbb3e Ikkinchi versiya
* main          33dbb3e Ikkinchi versiya
  tuzatish      8edcda6 Xatoni tuzatish
```

E'tibor bering: worktree o'chdi, **branch qoldi** (`tuzatish` da endi `+` yo'q). Worktree — branch'ni ko'rsatadigan joy, branch'ning o'zi emas. Branch'ni keyin `git branch -d` bilan o'chirasiz ([23-bob](23-branch-boshqaruvi.md)). `--force` — o'zgarishli worktree'ni o'chiradi (o'sha o'zgarishlar **qaytmaydi**: commit qilinmagan fayllar reflog'da ham yo'q); qulflanganini o'chirish uchun `-f -f`.

Skriptlar uchun barqaror format — `--porcelain` (versiyalar va sozlamalardan qat'i nazar o'zgarmaydi; yo'lda g'alati belgilar bo'lishi mumkin bo'lsa, `-z` bilan):

```bash
$ git worktree list --porcelain
worktree /tmp/misol/49-worktree/ilova
HEAD 33dbb3e408a3980a84817218a5be03af7ef9f4dc
branch refs/heads/main

worktree /tmp/misol/49-worktree/login
HEAD 33dbb3e408a3980a84817218a5be03af7ef9f4dc
branch refs/heads/feature/login

worktree /tmp/misol/49-worktree/sinov
HEAD 59825e0532c8db4c6ea6c4386be7a1793571f156
detached
locked USB diskda
...
```

**Papkani qo'lda o'chirsangiz.** `rm -rf` dan keyin `.git/worktrees/login/` yetim qoladi:

```bash
$ rm -rf ../login
$ git worktree list
/tmp/misol/49-worktree/ilova 33dbb3e [main]
/tmp/misol/49-worktree/login 33dbb3e [feature/login] prunable
/tmp/misol/49-worktree/sinov 59825e0 (detached HEAD) locked
$ git worktree prune -n -v
Removing worktrees/login: gitdir file points to non-existent location
$ git worktree prune -v
Removing worktrees/login: gitdir file points to non-existent location
$ ls .git/worktrees
sinov
```

`prunable` — "tozalasa bo'ladi". `prune -n` (dry run) faqat ko'rsatadi, `prune` o'chiradi. Qulflangan `sinov` yo'qolganda ham tegilmasdi — `lock` aynan shu uchun. `prune` ni qo'lda chaqirmasangiz ham, `gc` uni `--expire 3.months.ago` bilan o'zi ishga tushiradi (`gc.worktreePruneExpire`, [18-bob](18-packfile-va-gc.md)). Yetim yozuv xavfli emas, lekin u turgan paytda shu branch'ni boshqa joyda ochib bo'lmaydi.

**Ko'chirish.** `git worktree move` papkani ham, ikkala bog'lanishni ham yangilaydi:

```bash
$ git worktree unlock ../sinov
$ git worktree move ../sinov ../sinov2
$ cat ../sinov2/.git
gitdir: /tmp/misol/49-worktree/ilova/.git/worktrees/sinov
```

Asosiy worktree'ni va submodule'li worktree'larni `move` ko'chirmaydi. Agar papkani oddiy `mv` bilan ko'chirsangiz:

```bash
$ mv ../sinov2 ../sinov3
$ git worktree list
/tmp/misol/49-worktree/ilova  33dbb3e [main]
/tmp/misol/49-worktree/sinov2 59825e0 (detached HEAD) prunable
$ git -C ../sinov3 status
Not currently on any branch.
nothing to commit, working tree clean
$ git worktree repair ../sinov3
repair: gitdir incorrect: /tmp/misol/49-worktree/ilova/.git/worktrees/sinov/gitdir
$ git worktree list
/tmp/misol/49-worktree/ilova  33dbb3e [main]
/tmp/misol/49-worktree/sinov3 59825e0 (detached HEAD)
```

Qiziq holat: `sinov3` ichida Git ishlaydi (uning `.git` fayli hali to'g'ri repo'ga ko'rsatadi), lekin repo tomondan `gitdir` eski joyga qaraydi — `list` uni `prunable` deydi. Shu holatda `prune` ishga tushsa, worktree ma'lumoti o'chib ketardi. `repair` teskari bog'lanishni tuzatdi. Asosiy repo ko'chirilsa — teskarisi: bog'langan worktree'lar repo'ni topolmaydi, `repair` ni asosiy worktree'da ishga tushirasiz.

### Nisbiy yo'llar va `--orphan`

Standart bo'yicha bog'lanish fayllarida **mutlaq** yo'llar. Repo va worktree'lar birga ko'chirilishi kerak bo'lsa (masalan konteynerga ulanadigan papka), `--relative-paths`:

```bash
$ git worktree add --relative-paths -q ../nisbiy tuzatish
$ cat ../nisbiy/.git
gitdir: ../ilova/.git/worktrees/nisbiy
$ cat .git/worktrees/nisbiy/gitdir
../../../../nisbiy/.git
$ git config list --local
core.repositoryformatversion=1
...
extensions.relativeworktrees=true
```

Narxi: repo'ga `extensions.relativeWorktrees` qo'shildi, ya'ni bu imkoniyatni bilmaydigan eski Git versiyalari repo'ni ochishdan bosh tortadi ([13-bob](13-plumbing-va-porcelain.md), `extensions`). Doimiy qilish — `worktree.useRelativePaths = true`.

`--orphan` — tarixsiz yangi branch (masalan hujjat sayti uchun `gh-pages`):

```bash
$ git worktree add --orphan -b gh-pages ../sahifa
Preparing worktree (new branch 'gh-pages')
$ git -C ../sahifa status
On branch gh-pages

No commits yet

nothing to commit (create/copy files and use "git add" to track)
```

## Muhandislik nuqtai nazari: worktree'dan qachon va qanday foydalanish

**Qachon qulay:**

- Shoshilinch tuzatish, ko'rib chiqish (review) uchun boshqa branch'ni ochish — joriy ishni buzmasdan.
- Uzoq ishlaydigan build yoki test boshqa branch'da ketayotganda o'z branch'ingizda ishlashni davom ettirish.
- Ikki versiyani yonma-yon solishtirish (`diff -r ../v1 ../v2` yoki IDE'da ikki oyna).
- Eski reliz'ni build qilish uchun `-d` bilan vaqtinchalik worktree.

**Sozlamalar umumiy.** Standart bo'yicha `.git/config` hamma worktree'larga tegishli. Bitta worktree'ga xos sozlama kerak bo'lsa — `extensions.worktreeConfig = true` va `git config --worktree <kalit> <qiymat>`; qiymat `.git/worktrees/<id>/config.worktree` (asosiysida `.git/config.worktree`) ga yoziladi va `.git/config` dan keyin o'qiladi. Ma'lumotnoma ogohlantiradi: bu kengaytma yoqilganda `core.worktree` va `core.bare` umumiy faylda qolmasligi kerak, `core.sparseCheckout` esa odatda har worktree'da alohida bo'lishi kerak. `sparse-checkout set` buni o'zi qiladi (pastda).

**Hook'lar umumiy.** `.git/hooks` bitta ([47-bob](47-hooklar.md)). Hook ichida `.git` yo'lini qo'lda yig'ish worktree'da buziladi — `git rev-parse --git-dir`.

**Submodule'lar bilan ehtiyot bo'ling.** Ma'lumotnomaning BUGS bo'limi: ko'p checkout hali "experimental", submodule qo'llab-quvvatlash to'liq emas; superproject'ni ko'p worktree'da ochish **tavsiya etilmaydi** ([43-bob](43-submodule-bundle-replace.md)).

**Bare repo + worktree'lar.** Ba'zilar repo'ni `git clone --bare` qilib, har branch uchun worktree ochadi. Ishlaydi (`list` da `(bare)` qatori chiqadi), lekin bare klonda `remote.origin.fetch` refspec'i bo'lmaydi va `fetch` remote-tracking branch'larni yangilamaydi — buni qo'lda sozlash kerak ([29-bob](29-fetch-push-ichidan.md)). Boshlovchi uchun oddiy klon + worktree soddaroq.

## Kod: sparse-checkout — faqat kerakli papkalar

**Sparse checkout** — working tree'da kuzatiladigan fayllarning faqat bir qismini saqlash. Repo, tarix va index to'liq qoladi; diskka faqat tanlangan papkalar yoziladi. Monorepo misoli:

```bash
$ git ls-files
.gitignore
README.md
backend/api/server.go
backend/api/v1/users.go
backend/db/schema.sql
backend/go.mod
docs/index.md
frontend/package.json
frontend/src/main.js
$ git sparse-checkout set backend/api
$ find . -path ./.git -prune -o -type f -print | sort
./.gitignore
./README.md
./backend/api/server.go
./backend/api/v1/users.go
./backend/go.mod
```

Bu **cone rejimi** (standart): siz faqat papka nomlarini berasiz. Natija qoidasi (ma'lumotnoma, "CONE MODE HANDLING"):

- ko'rsatilgan papka ichidagi **hamma narsa**, istalgan chuqurlikda (`backend/api/` va `backend/api/v1/`);
- yo'ldagi har ota papkaning **bevosita** fayllari (`backend/go.mod`, lekin `backend/db/` emas);
- ildizdagi fayllar har doim (`README.md`, `.gitignore`).

Ichkarida bu oddiy `.gitignore` uslubidagi pattern'lar:

```bash
$ cat .git/info/sparse-checkout
/*
!/*/
/backend/
!/backend/*/
/backend/api/
$ git sparse-checkout list
backend/api
```

O'qilishi: `/*` — ildizdagi hamma narsa; `!/*/` — lekin ildizdagi papkalar emas; `/backend/` — backend kiritilsin; `!/backend/*/` — lekin uning ichki papkalari emas; `/backend/api/` — bu ichki papka to'liq. Tartib muhim: pastdagi musbat pattern yuqoridagi inkorni bekor qiladi. Cone rejimida Git bu pattern'larni tanib, sekin pattern moslashtirish o'rniga tez **hash'ga asoslangan** tekshiruv ishlatadi. Fayl qo'lda buzilsa va pattern'lar cone shakliga mos kelmasa, Git ogohlantiradi va sekin (non-cone) rejimga o'tadi.

`set` qaysi sozlamalarni qo'ydi:

```bash
$ git config list --show-scope | grep -E 'sparse|worktreeconfig' | grep -v remote
local	extensions.worktreeconfig=true
worktree	core.sparsecheckout=true
worktree	core.sparsecheckoutcone=true
```

`set` repo'ni avtomatik **worktree'ga xos config**ga o'tkazdi — bir worktree'dagi sparse tanlov boshqasiga tegmasligi uchun. Sparse fayl ham har worktree'da alohida (`git rev-parse --git-path info/sparse-checkout`).

### Fayllar qayerga ketdi — skip-worktree biti

Tushib qolgan fayllar index'dan o'chmagan. Ularda **skip-worktree** biti yoqilgan ([15-bob](15-tree-va-index.md), `update-index`):

```bash
$ git ls-files -t
H .gitignore
H README.md
H backend/api/server.go
H backend/api/v1/users.go
S backend/db/schema.sql
H backend/go.mod
S docs/index.md
S frontend/package.json
S frontend/src/main.js
$ git status
On branch main
Your branch is up to date with 'origin/main'.

You are in a sparse checkout with 56% of tracked files present.

nothing to commit, working tree clean
```

`H` — oddiy kuzatilayotgan fayl, `S` — skip-worktree. Bit yoqilgan fayl working tree'da bo'lmasa, Git uni "o'chirilgan" deb hisoblamaydi. Shuning uchun `git commit -a` tashqaridagi fayllarni o'chirilgan deb yozmaydi, branch almashtirish ularni yangilamaydi. 9 tadan 5 tasi bor — 56%.

Tashqaridagi fayllar baribir repo'da — ularni o'qish mumkin:

```bash
$ git ls-tree --name-only HEAD frontend/
frontend/package.json
frontend/src
$ git show HEAD:frontend/package.json
{}
```

### `add`, `check-rules`, `disable`

```bash
$ git sparse-checkout add docs
$ git sparse-checkout list
backend/api
docs
$ printf 'frontend/src/main.js\nbackend/db/schema.sql\nbackend/go.mod\n' | git sparse-checkout check-rules
backend/go.mod
```

`add` — mavjud tanlovga qo'shadi (`set` — almashtiradi). `check-rules` stdin'dan yo'llarni o'qib, qoidaga mos keladiganlarini chiqaradi — skriptlarda "bu fayl menga ko'rinadimi?" degan savol uchun.

Tanlovdan chiqayotgan papkada kuzatilmaydigan (untracked) fayl bo'lsa, Git uni o'chirmaydi va ogohlantiradi:

```bash
$ mkdir -p frontend/build; echo "kesh" > frontend/build/out.txt
$ git sparse-checkout set backend/api
warning: directory 'frontend/' contains untracked files, but is not in the sparse-checkout cone
$ ls frontend
build
```

Agar o'sha papkadagi untracked fayllar hammasi `.gitignore` bo'yicha e'tiborsiz bo'lsa, papka **o'chiriladi** (ma'lumotnoma shuni aytadi) — `node_modules/` yoki build natijalari tanlovdan chiqqan papkada qolib ketmasligi uchun. Bu ehtiyot bo'lish kerak bo'lgan joy: muhim, lekin ignore qilingan faylni (`.env` kabi) shunday papkada saqlamang. Qolgan fayllarni tozalash uchun `git sparse-checkout clean` bor (`-f` siz hech narsa o'chirmaydi, `--dry-run` ko'rsatadi).

Hammasini qaytarish:

```bash
$ git sparse-checkout disable
$ find . -path ./.git -prune -o -type f -print | sort
./.gitignore
./README.md
./backend/api/server.go
./backend/api/v1/users.go
./backend/db/schema.sql
./backend/go.mod
./docs/index.md
./frontend/build/out.txt
./frontend/package.json
./frontend/src/main.js
```

Klonlashdayoq sparse boshlash — `--sparse` (faqat ildiz fayllari):

```bash
$ git clone -q --sparse monorepo ish2
$ find ish2 -path ish2/.git -prune -o -type f -print | sort
ish2/.gitignore
ish2/README.md
```

Keyin `git sparse-checkout set <papkalar>`. Worktree uchun teng usul: `git worktree add --no-checkout`, ichida `sparse-checkout set`, keyin `git checkout`.

### Non-cone rejim va `init`

`--no-cone` bilan istalgan gitignore pattern berish mumkin (`'/*' '!keraksiz'`). Ma'lumotnoma bu rejimni **eskirgan (deprecated)** deb ataydi va sabablarini sanaydi: har yangilashda O(N·M) moslashtirish (N pattern × M fayl), qo'shtirnoqsiz `*.c` shell tomonidan fayllar ro'yxatiga aylanib ketishi va xato faqat keyinroq bilinishi, `remove` buyrug'ining yo'qligi, `.gitignore` bilan teskari ma'no (u yerda "chiqarib tashla", bu yerda "kirit"), `--sparse-index` bilan ishlamasligi. Xulosa: **cone rejimidan foydalaning.**

`git sparse-checkout init` — ham eskirgan: hozir u bo'sh `set` bilan bir xil. Eski maqolalardagi `init` + `set` ketma-ketligi fayllarni avval o'chirib, keyin qaytarardi — sekin va ignore qilingan fayllarni yo'qotishi mumkin edi. Hozir bitta `set` yetarli.

**Sparse index.** `set --sparse-index` index'ni ham qisqartiradi: tanlovdan tashqaridagi butun papka index'da bitta yozuv bo'ladi. `status`, `add` sezilarli tezlashadi. Lekin hujjat ogohlantiradi: bu ham "experimental", tashqi vositalar va eski Git bunday index'ni tushunmasligi mumkin; muammo bo'lsa `git sparse-checkout init --no-sparse-index`.

> Ma'lumotnoma `sparse-checkout` sahifasida bosh harflar bilan yozilgan: buyruq **experimental**, uning va boshqa buyruqlarning sparse holatdagi xatti-harakati kelajakda o'zgarishi mumkin.

## Kod: partial clone — obyektlarni kerak bo'lganda yuklash

Sparse checkout diskdagi **fayllarni** kamaytiradi, lekin `.git` ichida hamma obyekt baribir yuklangan. **Partial clone** bir qadam oldinga boradi: server klonlashda ba'zi obyektlarni (odatda blob'lar — fayl mazmunlari, [14-bob](14-obyektlar-blob.md)) **umuman yubormaydi**; ular keyin, haqiqatan kerak bo'lganda, birma-bir yuklanadi.

Sinov serveri: uch commit, har birida `assets/rasm.bin` (200 KB) yangilanadi. Server sifatida lokal bare repo, ulanish `file://` orqali — shunda Git haqiqiy tarmoq protokolini ishlatadi (oddiy yo'l bilan klonda u to'g'ridan-to'g'ri nusxa ko'chiradi va filtrlar ishlamaydi).

```bash
$ git -C server.git log --oneline
de8bbc7 Versiya 3
c5600a0 Versiya 2
48f6f6b Versiya 1
$ git clone --filter=blob:none file://$PWD/server.git yarim1
Cloning into 'yarim1'...
warning: filtering not recognized by server, ignoring
```

Server filtrni rad etdi — oddiy to'liq klon bo'ldi. Filtrni qo'llab-quvvatlash serverda yoqilishi kerak ([45-bob](45-config-chuqur.md), server sozlamalari):

```bash
$ git -C server.git config uploadpack.allowFilter true
$ git clone --filter=blob:none file://$PWD/server.git yarim
Cloning into 'yarim'...
$ cd yarim
$ git config list --local
core.repositoryformatversion=1
...
remote.origin.url=file:///tmp/misol/49-partial/server.git
remote.origin.fetch=+refs/heads/*:refs/remotes/origin/*
remote.origin.promisor=true
remote.origin.partialclonefilter=blob:none
branch.main.remote=origin
branch.main.merge=refs/heads/main
```

`origin` endi **promisor remote** — "va'da beruvchi": yetishmagan obyektlarni so'ralganda yuborishga va'da bergan remote. `partialclonefilter` — keyingi `fetch`lar ham shu filtr bilan ishlaydi. `repositoryformatversion=1` — eski Git bu repo'ni yarim holatda ochib, "yo'q obyekt" xatosiga uchramasligi uchun.

GitHub va GitLab kabi xizmatlarda filtr allaqachon yoqilgan — u yerda server sozlamasiga tegmaysiz.

Pack fayllar yonida yangi fayl turi:

```bash
$ ls .git/objects/pack
pack-65c17f6f5c63bda66dcd843fdea212b77fad663c.idx
pack-65c17f6f5c63bda66dcd843fdea212b77fad663c.pack
pack-65c17f6f5c63bda66dcd843fdea212b77fad663c.promisor
pack-65c17f6f5c63bda66dcd843fdea212b77fad663c.rev
pack-95c91126d49b72155fb072a865a84c42d04f2f38.idx
pack-95c91126d49b72155fb072a865a84c42d04f2f38.pack
pack-95c91126d49b72155fb072a865a84c42d04f2f38.promisor
pack-95c91126d49b72155fb072a865a84c42d04f2f38.rev
```

`.promisor` — "bu pack promisor remote'dan keldi" belgisi ([18-bob](18-packfile-va-gc.md)dagi `.keep` kabi). Dizayn hujjati muhim fikrni aytadi: obyekt ikki sababga ko'ra yo'q bo'lishi mumkin — partial clone yoki **repo buzilishi**. Git ularni farqlashi kerak. Promisor pack'dagi obyekt yoki promisor obyekt ishora qilgan obyekt — "va'da qilingan", uning yo'qligi normal. Boshqasi yo'q bo'lsa — buzilish. Shunday qilib Git yo'q obyektlarning qimmat ro'yxatini saqlamaydi.

Nega ikki pack? Birinchisi — klon (commit'lar va tree'lar). Ikkinchisi — `clone` oxiridagi `checkout`: unga `HEAD` ning uchta blob'i kerak edi va Git ularni **bitta so'rov**da yukladi (dizayn hujjati: `checkout` kerakli blob'larni oldindan to'plab oladi).

Nima yo'q:

```bash
$ git rev-list --objects --all --missing=print | grep '^?'
?a31c6ad0d0c93d2d3251d0534d6723d818a41260
?974a91b74b6073f6a7b628418ea39cb4d35b87e1
?786508c82a89dc49bd6ca00cf8fa0f659e09f79f
?b188c846602c0a3424aea68e68d076c9adfa49dd
?dad6ce0972467b424e5714979565540a2668b29f
?1fe01cf99ea809bb31073ffb30e9795a0c0ae992
```

Oldingi ikki commit'ning 3 tadan blob'i — 6 ta. `--missing=print` yo'q obyektni `?` bilan chiqaradi.

Eski versiyani o'qish — yuklash avtomatik:

```bash
$ git cat-file -p HEAD~2:src/app.js
versiya 1
$ git rev-list --objects --all --missing=print | grep -c '^?'
5
```

Ichkarida nima bo'lishini `GIT_TRACE` ([48-bob](48-muhit-ozgaruvchilari.md)) ko'rsatadi:

```bash
$ GIT_TRACE=1 git log -p --oneline -1 HEAD~1 -- src/app.js 2>&1 | grep -E 'run_command|^[0-9a-f]{7} |^[-+]v'
... run_command: git -c fetch.negotiationAlgorithm=noop fetch origin --no-tags --no-write-fetch-head --recurse-submodules=no --filter=blob:none --stdin
... run_command: unset GIT_CONFIG_PARAMETERS GIT_PREFIX; GIT_PROTOCOL=version=2 'git-upload-pack '\''/tmp/misol/49-partial/server.git'\'''
... run_command: git pack-objects --revs --stdout --thin --delta-base-offset --quiet --filter=blob:none
... run_command: git index-pack --stdin --fix-thin --promisor --pack_header=2,1
... run_command: git maintenance run --auto --no-quiet --detach
c5600a0 Versiya 2
-versiya 1
+versiya 2
```

Yetishmagan obyekt uchun Git ichki `git fetch` ishga tushiradi: kerakli hash'larni stdin'dan beradi, "muzokara" qilmaydi (`negotiationAlgorithm=noop`), kelgan pack'ni `--promisor` bilan saqlaydi. Har murojaat — alohida tarmoq so'rovi. Dizayn hujjati shuni cheklov sifatida ochiq aytadi: dinamik yuklash obyektlarni birma-bir oladi, ko'p obyekt kerak bo'lsa (masalan `git log -p` butun tarix bo'yicha) bu **sekin** va har safar autentifikatsiya talab qilishi mumkin.

### Server yo'q bo'lsa

```bash
$ mv server.git server-yoq.git
$ git -C yarim cat-file -p HEAD~2:assets/rasm.bin | head -c 20
fatal: '/tmp/misol/49-partial/server.git' does not appear to be a git repository
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
fatal: could not fetch 786508c82a89dc49bd6ca00cf8fa0f659e09f79f from promisor remote
$ git -C yarim log --oneline
de8bbc7 Versiya 3
c5600a0 Versiya 2
48f6f6b Versiya 1
$ git -C yarim status -s
```

Partial clone'ning asosiy narxi: **tarmoq kerak.** `log`, `status`, joriy fayllar bilan ishlash oflayn ishlaydi; yuklanmagan eski mazmun esa yo'q. Oflayn qolishingizni bilsangiz, kerakli narsani oldindan yuklab oling. `git fsck` promisor obyektlarni tushunadi va yo'q blob'lar uchun xato bermaydi.

### Filtr turlari

`--filter` qiymati `git rev-list` dagi bilan bir xil:

| Filtr | Nimani yubormaydi | Qachon |
| --- | --- | --- |
| `blob:none` | Hamma blob'lar (kerak bo'lganda keladi) | Eng ko'p ishlatiladigani: dasturchi klonlari |
| `blob:limit=<n>[kmg]` | `<n>` va undan katta blob'lar | Katta binar fayllar ko'p bo'lsa |
| `tree:<chuqurlik>` | Ildizdan shu chuqurlikdagi va chuqurroq tree/blob'lar; `tree:0` — hamma tree va blob | CI: faqat bitta commit build qilinadi |
| `object:type=<tur>` | Shu turdan boshqa obyektlar | Maxsus vositalar |
| `sparse:oid=<blob>` | Sparse pattern'ga kirmaydigan blob'lar | Sparse checkout bilan birga |
| `auto` | Server taklif qilgan filtr (promisor-remote protokoli) | Server ko'p promisor'li bo'lsa |

Uch xil klonda obyektlar soni (`--no-checkout` bilan, checkout yuklamasidan oldin):

```bash
$ git -C toliq cat-file --batch-all-objects --batch-check='%(objecttype)' | sort | uniq -c
   9 blob
   3 commit
   9 tree
$ git -C yalang cat-file --batch-all-objects --batch-check='%(objecttype)' | sort | uniq -c
warning: This repository uses promisor remotes. Some objects may not be loaded.
   3 commit
   9 tree
$ git -C daraxtsiz cat-file --batch-all-objects --batch-check='%(objecttype)' | sort | uniq -c
warning: This repository uses promisor remotes. Some objects may not be loaded.
   3 commit
```

`yalang` — `blob:none`, `daraxtsiz` — `tree:0`. `tree:0` da hatto tree'lar ham yo'q: tarix bor (`git log` ishlaydi), lekin hech bir commit'ning "ichi" yo'q. Checkout'dan keyin u faqat HEAD uchun kerakli 3 tree va 3 blob'ni oladi. Bunday klonda `git log -- <fayl>` yoki `blame` kabi tarix bo'ylab "ichiga qaraydigan" buyruqlar har commit uchun tree so'raydi — juda sekin. Shuning uchun `tree:0` bir martalik CI uchun, `blob:none` esa doimiy ish uchun mos.

`blob:limit` da kichik fayllar to'liq keladi, faqat kattalar qoladi:

```bash
$ git -C limitli rev-list --objects --all --missing=print | grep '^?'
?a31c6ad0d0c93d2d3251d0534d6723d818a41260
?786508c82a89dc49bd6ca00cf8fa0f659e09f79f
```

Eski ikki `rasm.bin`.

Filtrni keyin o'zgartirish — `fetch --refetch --filter=...`: dizayn hujjatiga ko'ra u yangi filtr bilan to'liq pack so'raydi, obyektlarni birma-bir yuklashsiz:

```bash
$ git fetch --refetch --filter=blob:limit=100k origin
$ git config get remote.origin.partialclonefilter
blob:none
$ git cat-file --batch-all-objects --batch-check='%(objecttype)' | sort | uniq -c
warning: This repository uses promisor remotes. Some objects may not be loaded.
   7 blob
   3 commit
   9 tree
```

Diqqat: buyruq qatoridagi `--filter` saqlangan `partialclonefilter` ni **o'zgartirmadi** — keyingi oddiy `fetch` yana `blob:none` bilan ishlaydi. Doimiy o'zgartirish uchun sozlamani o'zingiz yangilang.

**Partial clone ≠ shallow clone.** Dizayn hujjati aniq ajratadi: partial clone commit'lar oralig'i *ichida* blob va tree'larni cheklaydi; commit'larning o'zini cheklash (shallow, `--single-branch`, refspec) — boshqa, mustaqil mexanizm.

## Kod: shallow clone — tarixni kesish

**Shallow (sayoz) clone** — faqat oxirgi bir necha commit, eski tarix umuman yo'q. Olti commit'li manba:

```bash
$ git -C manba log --oneline --format='%h %ad %s' --date=short
86c4493 2026-10-06 Commit 6
83d4d0f 2026-10-05 Commit 5
323dd34 2026-10-04 Commit 4
23375ca 2026-10-03 Commit 3
d7efe13 2026-10-02 Commit 2
8046d52 2026-10-01 Commit 1
$ git clone -q --depth 2 file://$PWD/manba sayoz
$ cd sayoz
$ git log --oneline
86c4493 Commit 6
83d4d0f Commit 5
$ cat .git/shallow
83d4d0f6054b4d88a25037868b2a5ba3450692c4
$ git rev-parse --is-shallow-repository
true
```

`.git/shallow` — "chegara" commit'lar ro'yxati ([13-bob](13-plumbing-va-porcelain.md)): Git ularning otasini qidirmaydi. `83d4d0f` commit obyektida ota hash'i yozilgan (commit o'zgarmagan, [16-bob](16-commit-obyekti.md)), lekin Git uni "yo'q" deb hisoblaydi.

`--depth` jimgina **`--single-branch`** ni ham yoqadi:

```bash
$ git branch -a
* main
  remotes/origin/HEAD -> origin/main
  remotes/origin/main
$ git tag
$ git config get remote.origin.fetch
+refs/heads/main:refs/remotes/origin/main
```

Manbada `eski` branch va `v1.0` tegi bor, lekin klonda yo'q; refspec ham faqat `main` uchun ([29-bob](29-fetch-push-ichidan.md)). Keyin `git fetch` boshqa branch'larni olib kelmaydi. Hamma branch uchlari kerak bo'lsa — `--no-single-branch`:

```bash
$ git clone -q --depth 1 --no-single-branch file://$PWD/manba hamma
$ git -C hamma branch -a
* main
  remotes/origin/HEAD -> origin/main
  remotes/origin/eski
  remotes/origin/main
$ git -C hamma log --oneline --all
86c4493 Commit 6
23375ca Commit 3
d7efe13 Commit 2
$ git -C hamma tag
v1.0
```

Har uch (`main`, `eski`, `v1.0` tegi) uchun bittadan commit.

### Chuqurlashtirish va to'liq qilish

```bash
$ git fetch -q --deepen 2
$ git log --oneline
86c4493 Commit 6
83d4d0f Commit 5
323dd34 Commit 4
23375ca Commit 3
$ cat .git/shallow
23375caa98f5d47a9e954cb317dda9eefeb313f6
$ git fetch -q --shallow-since=2026-10-04
$ git log --oneline
86c4493 Commit 6
83d4d0f Commit 5
$ git fetch -q --unshallow
$ git log --oneline
86c4493 Commit 6
...
8046d52 Commit 1
$ ls .git/shallow
ls: .git/shallow: No such file or directory
$ git rev-parse --is-shallow-repository
false
```

| Opsiya | Ma'nosi |
| --- | --- |
| `--depth=<n>` | Har remote branch uchidan `n` commit (`fetch` da — chuqurlikni qayta o'rnatish, qisqartirish ham mumkin) |
| `--deepen=<n>` | Hozirgi chegaradan yana `n` commit |
| `--shallow-since=<sana>` | Shu sanadan keyingi commit'lar |
| `--shallow-exclude=<ref>` | Shu branch/tegdan yetib boriladigan commit'larsiz |
| `--unshallow` | To'liq tarixga aylantirish (`shallow` fayli o'chadi) |

`--unshallow` dan keyin ham klon **single-branch** qoladi (`branch -a` da faqat `main`) — tarix to'ldi, refspec esa o'zgarmadi. Boshqa branch'lar kerak bo'lsa, refspec'ni o'zgartiring: `git remote set-branches origin '*'` va `git fetch`.

**Sana tuzog'i.** Yuqorida `--shallow-since=2026-10-04` "Commit 4" ni (10-04 kuni soat 12:00 da) **kiritmadi**. Sabab — Git sanani "taxminiy" o'qiydi: soat ko'rsatilmasa, hozirgi kun vaqti qo'shiladi (sinov paytida 17:25 edi). Kun boshidan kerak bo'lsa, vaqtni aniq yozing:

```bash
$ git clone -q --shallow-since="2026-10-05 00:00" file://$PWD/manba sana
$ git -C sana log --oneline
86c4493 Commit 6
83d4d0f Commit 5
```

**Lokal yo'l bilan ishlamaydi:**

```bash
$ git clone -q --depth 1 manba lokal
warning: --depth is ignored in local clones; use file:// instead.
```

Lokal klonda Git obyekt fayllarini to'g'ridan-to'g'ri ko'chiradi (yoki hardlink qiladi) — protokol ishlamaydi, demak kesish ham yo'q ([4-bob](04-repo-olish.md)).

### Sayoz klonning cheklovlari

Push ishlaydi (zamonaviy Git'da):

```bash
$ git clone -q --depth 1 file://$PWD/server.git s3 && cd s3
$ echo yangi >> tarix.txt; git commit -qam "Commit 7"
$ git push origin main
To file:///tmp/misol/49-shallow/server.git
   86c4493..ea63343  main -> main
```

Lekin tarixni ko'radigan vositalar **yolg'on gapira** boshlaydi:

```bash
$ git blame tarix.txt
^86c4493 (Ali Valiyev 2026-10-06 12:00:00 +0500 1) qator 1
^86c4493 (Ali Valiyev 2026-10-06 12:00:00 +0500 2) qator 2
...
^86c4493 (Ali Valiyev 2026-10-06 12:00:00 +0500 6) qator 6
ea633430 (Ali Valiyev 2026-10-07 12:00:00 +0500 7) yangi
```

Olti qator turli kunlarda yozilgan, lekin `blame` ([41-bob](41-blame-va-bisect.md)) hammasini chegara commit'iga yozadi (`^` — "chegara", undan narini bilmayman). Xuddi shunday: `git log` qisqa, `merge-base` ([21-bob](21-branch-va-merge.md)) umumiy ajdodni topolmasligi mumkin (merge xato beradi yoki keraksiz konflikt), `bisect` chegaradan nariga o'tolmaydi, `describe` teg topolmaydi.

## Muhandislik nuqtai nazari: shallow yoki partial?

Ko'p yillar sayoz klon CI'da standart yechim edi. Hozir ko'pincha partial clone yaxshiroq:

| | Shallow (`--depth 1`) | Partial (`--filter=blob:none`) |
| --- | --- | --- |
| Commit'lar | Faqat oxirgilari | Hammasi |
| Tree/blob'lar | Faqat shu commit'larniki | Kerak bo'lganda yuklanadi |
| `log`, `merge-base`, `blame` | Noto'g'ri yoki ishlamaydi | To'g'ri (blob kerak bo'lsa — yuklaydi) |
| Keyinchalik chuqurroq ish | `--deepen`/`--unshallow` | Avtomatik |
| Server yuki | Keyingi `fetch` larda chegarani hisoblash og'ir | Odatiy |
| Oflayn | Bor narsa bilan ishlaydi | Yuklanmagan blob kerak bo'lsa — xato |

Qo'llanma tavsiyasi (ma'lumotnoma matnlari asosida):

- **Bir martalik CI build** (faqat bitta commit'ni yig'ish) — `--depth 1` yoki `--filter=tree:0`.
- **Doimiy ish nusxasi, katta repo** — `--filter=blob:none` (+ kerak bo'lsa sparse checkout).
- **Kichik/o'rta repo** — oddiy to'liq klon. Har optimallashtirish o'z murakkabligini olib keladi.

## Kod: `git maintenance` — fonda tartib

Katta repo'da `git gc` daqiqalab ishlaydi va foydalanuvchini kutdiradi. `git maintenance` vazifalarni mayda bo'laklarga ajratib, fonda bajarishga imkon beradi. Vazifalar va strategiyalar jadvali [18-bobda](18-packfile-va-gc.md) batafsil — bu yerda katta repo uchun muhim ikki vazifani sinaymiz.

**`prefetch`** — remote'dagi yangi obyektlarni oldindan yuklash. Hamkasb serverga commit yubordi:

```bash
$ git maintenance run --task=prefetch
$ git for-each-ref --format='%(objectname:short) %(refname)'
2e5e01c refs/heads/main
de7a01e refs/prefetch/remotes/origin/main
2e5e01c refs/remotes/origin/HEAD
2e5e01c refs/remotes/origin/main
$ git log --oneline origin/main
2e5e01c Birinchi
$ git fetch
From /tmp/misol/49-maint/server
   2e5e01c..de7a01e  main       -> origin/main
```

Obyektlar keldi, lekin ular `refs/prefetch/` ostiga yozildi — `origin/main` **joyida**. Ma'lumotnoma sababini aytadi: foydalanuvchi remote-tracking branch'lari ([28-bob](28-remote-branchlar.md)) o'zi `fetch` qilmaguncha siljimasligini kutadi. Keyingi haqiqiy `fetch` deyarli hech narsa yuklamaydi — faqat ref'larni siljitadi. Teglar `prefetch` da yangilanmaydi.

**`commit-graph`** — graf indeksini bosqichma-bosqich yangilash:

```bash
$ git maintenance run --task=commit-graph
$ find .git/objects/info -type f | sort
.git/objects/info/commit-graphs/commit-graph-chain
.git/objects/info/commit-graphs/graph-a4562de5ca8212645c5dffa2e0d480fd1756b4ee.graph
```

Bitta katta fayl emas, "zanjir" (`commit-graph-chain`) — yangi commit'lar uchun kichik qatlam qo'shiladi, butun graf qayta yozilmaydi.

**`is-needed`** — ishlatmasdan, "kerakmi?" deb so'rash (chiqish kodi `0` — kerak, `1` — kerak emas):

```bash
$ git maintenance is-needed --task=loose-objects; echo "kod: $?"
kod: 0
$ git maintenance is-needed --auto --task=loose-objects; echo "kod: $?"
kod: 1
```

`--auto` siz — "vazifa umuman bajarilishi mumkinmi", `--auto` bilan — "chegaralar oshganmi" (loose obyektlar soni va h.k.). Kichik repo'da chegara oshmagan.

### `register`, `start` — rejali xizmat

`git maintenance start` repo'ni ro'yxatga oladi va **operatsion tizim rejalashtiruvchisi**ga yozadi: macOS'da `launchctl`, Linux'da `systemd` taymeri yoki `crontab`, Windows'da `schtasks` (`--scheduler=` bilan tanlanadi). Shundan keyin har soatda `git maintenance run --schedule=hourly` (kunlik, haftalik ham) fonda ishlaydi. Bu tizim sozlamasini o'zgartirgani uchun qo'llanmada `start` ni ishga tushirmaymiz — faqat uning config qismi `register` ni alohida faylga:

```bash
$ git maintenance register --config-file ../men-maint.cfg
$ cat ../men-maint.cfg
[maintenance]
	repo = /tmp/misol/49-maint/men
$ git config list --local | grep ^maintenance
maintenance.auto=false
maintenance.strategy=incremental
$ git maintenance unregister --config-file ../men-maint.cfg
$ cat ../men-maint.cfg
$ git config list --local | grep ^maintenance
maintenance.auto=false
maintenance.strategy=incremental
```

`register` nima qildi (ma'lumotnoma bilan mos):

- repo yo'lini `maintenance.repo` ga qo'shdi — `--config-file` bo'lmasa, **global** config'ga (`~/.gitconfig`). rejali ishga tushirish `git for-each-repo --config=maintenance.repo` orqali aynan shu ro'yxatdagi har repo'da `git maintenance run` ni chaqiradi;
- repo'da buyruqlar oxiridagi avtomatik xizmatni o'chirdi (`maintenance.auto=false`) — endi bu ish fonda;
- `maintenance.strategy=incremental`: `gc` o'chiq (hech narsa o'chirilmaydi), `prefetch` va `commit-graph` soatlik, `loose-objects` va `incremental-repack` kunlik.

`unregister` ro'yxatdan chiqardi, lekin hujjatda aytilganidek `maintenance.auto=false` **qoladi** — avtomatik xizmatni qaytarish uchun uni o'zingiz o'chiring (`git config unset maintenance.auto`). `stop` esa faqat rejalashtiruvchidan olib tashlaydi, ro'yxatni saqlaydi.

## Kod: `scalar` — katta repo uchun tayyor sozlama

`scalar` — Git bilan birga keladigan alohida dastur (Microsoft'ning katta repo'lar uchun vositasidan Git'ga ko'chirilgan). U yangi imkoniyat qo'shmaydi — yuqoridagi hamma narsani **bitta buyruqda** to'g'ri sozlaydi:

```bash
$ scalar -h
usage: scalar [-C <directory>] [-c <key>=<value>] <command> [<options>]

Commands:
	clone
	list
	register
	unregister
	run
	reconfigure
	delete
	help
	version
	diagnose

$ scalar version
git version 2.56.0
$ scalar clone -h
usage: scalar clone [--single-branch] [--branch <main-branch>] [--full-clone]
       	[--[no-]src] [--[no-]tags] [--[no-]maintenance] <url> [<enlistment>]

    -b, --[no-]branch <branch>
                          branch to checkout after clone
    --[no-]full-clone     when cloning, create full working directory
    --[no-]single-branch  only download metadata for the branch that will be checked out
    --[no-]src            create repository within 'src' directory
    --[no-]tags           specify if tags should be fetched during clone
    --[no-]maintenance    specify if background maintenance should be enabled
```

Bu bobda `scalar clone` va `scalar register` ni ishga tushirmaymiz: ikkalasi ham fon xizmatini (`git maintenance start`) yoqadi, ya'ni tizim rejalashtiruvchisiga yozadi. Ma'lumotnoma bo'yicha ular nima qiladi:

- **`scalar clone <url> [<enlistment>]`** — klon, "standart bo'yicha faqat commit va tree obyektlari" (ya'ni `--filter=blob:none`), sparse-checkout yoqilgan (faqat ildiz fayllari, kengaytirish — `git sparse-checkout set`), fon xizmati yoqilgan. Natija `<enlistment>/src` ichida.
- **Enlistment** — loyihaning yuqori papkasi. Ichida `src/` — Git worktree. G'oya: kuzatiladigan fayllar `src/` da, build natijalari esa tashqarida — `status` ularni ko'rib sekinlashmasin. `--no-src` — to'g'ridan-to'g'ri papkaga.
- **`scalar register`** — mavjud repo'ni ro'yxatga olish va fon xizmatini boshlash. **`unregister`** — teskarisi.
- **`scalar run <vazifa>`** — `all`, `config`, `commit-graph`, `fetch` (= `prefetch`), `loose-objects`, `pack-files` (= `incremental-repack`). `config` dan boshqalari `git maintenance` ga uzatiladi.
- **`scalar reconfigure [--all]`** — Git yangilangandan keyin eng so'nggi tavsiya sozlamalarni qo'llash.
- **`scalar diagnose`** — yordam so'rash uchun loglar va statistika bilan `.zip`.

Scalar qo'yadigan sozlamalardan ba'zilari va hujjatdagi sabab:

| Sozlama | Nega |
| --- | --- |
| `core.logAllRefUpdates=true` | Reflog — xatodan qutulishning asosiy manbai ([42-bob](42-reflog-va-tiklash.md)) |
| `commitGraph.changedPaths=true` | Commit-graph'da o'zgargan yo'llar Bloom filtri: `log -- <fayl>` tezlashadi |
| `gc.auto=0` | Oldingi planda `gc` yo'q — hammasi fon xizmatida |
| `fetch.writeCommitGraph=false` | Commit-graph'ni fon xizmati yozadi |
| `index.version=4`, `index.threads=true`, `index.skipHash=true` | Kichikroq va tezroq yoziladigan index |
| `status.aheadBehind=false` | `status` uzoq tarixda ahead/behind sanamasin |
| `log.excludeDecoration=refs/prefetch/*` | `prefetch` ref'lari `log` bezagida chiqmasin |
| `core.autoCRLF=false` | Tezlik uchun qator oxiri o'zgartirishsiz ([46-bob](46-gitattributes.md)) |

Oddiy repo'da `scalar` shart emas. Lekin kodi ochiq, hujjati sozlamalar ro'yxatini sabablari bilan beradi — katta repo uchun o'zingiz qo'lda sozlamoqchi bo'lsangiz ham foydali o'qish.

## Kod: Git LFS — katta binar fayllar (tashqi vosita)

**Git LFS** (Large File Storage) — Git'ning bir qismi **emas**, alohida ochiq kodli kengaytma (git-lfs.com; maqola yozilgan paytda so'nggi versiya v3.8.0). U alohida o'rnatiladi va server tomonda ham qo'llab-quvvatlash kerak (GitHub, GitLab va boshqalar beradi). Sinov muhitida `git-lfs` o'rnatilmagan:

```bash
$ git lfs version
git: 'lfs' is not a git command. See 'git --help'.
```

Shuning uchun bu bo'limdagi LFS buyruqlari **sinalmagan** — ular rasmiy sayt va spetsifikatsiyadan olingan.

**Muammo.** Git har versiyaning to'liq suratini saqlaydi; binar faylda delta siqish yomon ishlaydi ([18-bob](18-packfile-va-gc.md)). 100 MB'lik video 20 marta o'zgarsa — repo'da gigabaytlar va har klon ularni yuklaydi.

**Yechim.** LFS katta faylni repo'ga yozmaydi. Uning o'rniga kichik matnli **ko'rsatkich (pointer)** commit qilinadi, haqiqiy mazmun esa alohida LFS serverida. Ko'rsatkich formati (LFS spetsifikatsiyasidan):

```text
version https://git-lfs.github.com/spec/v1
oid sha256:4d7a214614ab2935c943f9e0ff69d22eadbb8f32b1258daaa5e2ca24d17e2393
size 12345
```

Mexanizm — Git'ning o'z **clean/smudge filtrlari** ([46-bob](46-gitattributes.md)):

- **clean** (`git add` paytida): fayl mazmunini `.git/lfs/objects/` ga qo'yadi, index'ga ko'rsatkichni yozadi;
- **smudge** (checkout paytida): ko'rsatkichni ko'rib, mazmunni lokal ombordan yoki serverdan olib, working tree'ga haqiqiy faylni yozadi.

Rasmiy saytdagi boshlash tartibi:

```bash
# bir marta, har foydalanuvchi uchun (filtrlarni global config'ga yozadi)
git lfs install
# qaysi fayllar LFS'da bo'lishini belgilash
git lfs track "*.psd"
git add .gitattributes
# keyin odatdagi ish
git add file.psd
git commit -m "Add design file"
git push origin main
```

`git lfs track` `.gitattributes` ga quyidagiga o'xshash qator yozadi (spetsifikatsiyadagi misol): `*.psd filter=lfs -text` — ya'ni "bu fayllar `lfs` filtridan o'tsin va matn deb hisoblanmasin". `.gitattributes` ni commit qilish shart — aks holda hamkasblarda filtr ishlamaydi.

Muhim eslatmalar:

- Sayt aytganidek, `track` **mavjud** fayllarni LFS'ga o'tkazmaydi — tarixdagilar uchun `git lfs migrate` (bu tarixni qayta yozadi, [25-bob](25-tarixni-qayta-yozish.md) dagi ogohlantirishlar amal qiladi).
- LFS'siz Git bilan klonlagan odam faylning o'rniga ko'rsatkich matnini ko'radi.
- LFS serveri hajmi va trafigi xizmatlarda ko'pincha alohida hisoblanadi.
- Muqobil (Git'ning o'zida): `--filter=blob:limit=...` partial clone — katta blob'lar faqat kerak bo'lganda yuklanadi, tashqi vositasiz. Lekin u repo'dagi hajmni kamaytirmaydi, faqat yuklashni kechiktiradi.

## Muhandislik nuqtai nazari: katta repo uchun reja

Avval o'lchang: `git count-objects -vH`, `git repo structure` ([18-bob](18-packfile-va-gc.md)). Keyin muammo turiga qarab:

| Belgi | Sabab | Vosita |
| --- | --- | --- |
| Klon juda uzoq, `.git` katta | Ko'p tarix va blob'lar | Partial clone `blob:none` |
| Diskda juda ko'p fayl, `status` sekin | Fayllar soni | Sparse checkout (cone) + sparse index; `core.fsmonitor`, `core.untrackedCache` ([45-bob](45-config-chuqur.md)) |
| Tarixdagi katta binar fayllar | Noto'g'ri saqlash | Kelajak uchun LFS; o'tmish uchun `filter-repo`/`lfs migrate` ([42-bob](42-reflog-va-tiklash.md)) |
| `gc` uzoq ishlab kutdiradi | Oldingi plandagi xizmat | `git maintenance start` (incremental) |
| CI har safar to'liq klonlaydi | Bir martalik build | `--depth 1` yoki `--filter=tree:0` |
| Ikkinchi branch uchun yana klon | Ish usuli | `git worktree` |

Hammasi birga — `scalar clone`.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Worktree papkasini `rm -rf` bilan o'chirish | `.git/worktrees/<id>` yetim qoladi, branch "band" bo'lib turadi | `git worktree remove`; bo'lib o'tgan bo'lsa `git worktree prune` |
| Worktree'ni `mv` bilan ko'chirish | Repo tomondagi `gitdir` eskiradi, `prune` ma'lumotni o'chirishi mumkin | `git worktree move`; bo'lib o'tgan bo'lsa `git worktree repair <yangi-yo'l>` |
| `worktree remove --force` ni o'ylamasdan | Commit qilinmagan o'zgarishlar qaytmaydi (reflog'da yo'q) | Avval `git -C <wt> status`, kerak bo'lsa commit/stash |
| `worktree remove` branch'ni ham o'chiradi deb kutish | Branch qoladi | `git branch -d <branch>` |
| Bir branch'ni ikki worktree'da `--force` bilan ochish | Birida commit — ikkinchisining index'i noto'g'ri | Har worktree'da alohida branch yoki `-d` |
| Hook/skriptda `$PWD/.git/...` | Worktree'da `.git` — fayl | `git rev-parse --git-dir`, `--git-path` |
| Ko'chma diskdagi worktree'ni qulflamaslik | Disk ulanmaganda `gc` uni tozalashi mumkin | `git worktree lock --reason ...` |
| `sparse-checkout --no-cone` va qo'shtirnoqsiz `*.c` | Shell kengaytiradi, xato keyin bilinadi; rejim eskirgan | Cone rejimi, papka nomlari |
| Eski `sparse-checkout init` + `set` | Fayllarni o'chirib-qaytaradi, sekin | Faqat `set` |
| Sparse'dan chiqqan papkada ignore qilingan muhim fayl | Papka butunlay o'chiriladi | Bunday fayllarni tanlov ichida saqlang |
| `--depth` ni lokal yo'l bilan | "ignored in local clones" — to'liq klon bo'ladi | `file://` yoki haqiqiy URL |
| Sayoz klonda `blame`/`merge-base` ga ishonish | Chegaradan nari ko'rinmaydi — noto'g'ri natija | `--unshallow` yoki partial clone |
| `--shallow-since=<kun>` kun boshidan deb kutish | Soatsiz sanaga hozirgi vaqt qo'shiladi | `"2026-10-05 00:00"` |
| `--unshallow` dan keyin hamma branch keladi deb kutish | Klon single-branch qoladi | `git remote set-branches origin '*'` + `fetch` |
| O'z serverida `--filter` ishlamadi deb hayron bo'lish | `uploadpack.allowFilter` o'chiq | Serverda yoqing |
| Partial clone bilan oflayn ishlashga ketish | Yuklanmagan blob kerak bo'lsa — xato | Oldindan kerakli narsani yuklang yoki to'liq klon |
| `tree:0` klonda `log -- <fayl>`, `blame` | Har commit uchun tree so'raladi — juda sekin | Doimiy ish uchun `blob:none` |
| `fetch --filter` saqlangan filtrni o'zgartiradi deb o'ylash | `partialclonefilter` o'zgarmaydi | Sozlamani yangilang |
| `git maintenance start` ni server/umumiy kompyuterda o'ylamasdan | Tizim rejalashtiruvchisiga yoziladi | Avval `register --config-file` bilan ko'ring; `stop`/`unregister` |
| `unregister` dan keyin avtomatik xizmat qaytadi deb kutish | `maintenance.auto=false` qoladi | `git config unset maintenance.auto` |
| `git lfs track` mavjud fayllarni o'tkazadi deb o'ylash | Faqat keyingi `add` lar | `git lfs migrate` (tarixni qayta yozadi) |
| `.gitattributes` ni commit qilmaslik (LFS) | Hamkasblarda katta fayl oddiy blob bo'lib ketadi | `git add .gitattributes` |

## Amaliyot

1. Vaqtinchalik repo'da ikki commit qiling. `git worktree add ../tuzatish`, `-b` va `-d` bilan uch worktree yarating. `git worktree list`, `git branch -v` (`+` belgisi) va `.git/worktrees/` ichidagi fayllarni ko'ring; `commondir` va `gitdir` nima ekanini o'z so'zlaringiz bilan yozing.
2. Bitta worktree'da commit qiling va uning asosiy worktree'da darhol ko'rinishini tekshiring. Keyin o'sha branch'ni asosiy worktree'da `switch` qilib ko'ring — xatoni o'qing va nega Git buni taqiqlashini tushuntiring.
3. Worktree'ni `lock --reason` bilan qulflang, `list -v` va `list --porcelain` ni solishtiring. Boshqa worktree papkasini `rm -rf` bilan o'chiring, `prune -n -v` va `prune -v` ni ishga tushiring. Qulflangan worktree nega tegilmadi?
4. Worktree'ni oddiy `mv` bilan ko'chiring. `git worktree list` nima deydi? Ichida `git status` ishlaydimi? `git worktree repair` bilan tuzating va `.git/worktrees/<id>/gitdir` o'zgarganini ko'ring.
5. 3–4 darajali papkali "monorepo" yarating. `git sparse-checkout set a/b` dan keyin qaysi fayllar qolishini **oldindan** yozing, keyin `find` bilan tekshiring. `.git/info/sparse-checkout` dagi har qatorni izohlang, `git ls-files -t` dagi `S` larni sanang.
6. Lokal bare repo'ni server qiling (`uploadpack.allowFilter true`), uch commit'da katta faylni o'zgartiring. `blob:none`, `blob:limit=100k` va `tree:0` bilan klonlab, `cat-file --batch-all-objects` bilan obyekt turlarini sanang. `GIT_TRACE=1` bilan eski versiyani o'qib, avtomatik `fetch` ni toping. Serverni vaqtincha qayta nomlab, oflayn nima ishlashini aniqlang.
7. `--depth 2` bilan klonlang. `.git/shallow`, `git branch -a`, `remote.origin.fetch` ni ko'ring. `--deepen`, `--shallow-since` (soat bilan va soatsiz) va `--unshallow` ni sinang. Sayoz holatda `git blame` natijasini to'liq klondagisi bilan solishtiring.
8. (Qiyinroq) "Scalar'siz scalar" qiling: `--filter=blob:none --sparse` bilan klon, `sparse-checkout set` bilan bitta papka, `git maintenance register --config-file <fayl>` va `scalar.adoc` dagi tavsiya sozlamalardan beshtasini qo'lda qo'ying. `git maintenance run --task=prefetch --task=commit-graph` dan keyin `refs/prefetch/` va `commit-graphs/` ni tekshiring. Har sozlama nima uchun kerakligini bir gap bilan yozing. (`git maintenance start` ni ishlatmang.)

## Rasmiy hujjat

- `git worktree`: <https://git-scm.com/docs/git-worktree>
- `git sparse-checkout`: <https://git-scm.com/docs/git-sparse-checkout>
- Partial clone dizayn hujjati: <https://git-scm.com/docs/partial-clone>
- `git clone` (`--depth`, `--shallow-since`, `--filter`, `--sparse`, `--single-branch`): <https://git-scm.com/docs/git-clone>
- `git fetch` (`--deepen`, `--unshallow`, `--refetch`): <https://git-scm.com/docs/git-fetch>
- `git rev-list` (`--filter`, `--missing`): <https://git-scm.com/docs/git-rev-list>
- `git maintenance`: <https://git-scm.com/docs/git-maintenance>
- `scalar`: <https://git-scm.com/docs/scalar>
- `gitrepository-layout` (`worktrees/`, `shallow`, `info/sparse-checkout`): <https://git-scm.com/docs/gitrepository-layout>
- Git LFS (tashqi vosita): <https://git-lfs.com/>, spetsifikatsiya: <https://github.com/git-lfs/git-lfs/blob/main/docs/spec.md>
