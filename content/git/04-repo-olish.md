# 04 — Repo olish: `init` va `clone`

[← Oldingi: Birinchi sozlash va yordam](03-birinchi-sozlash.md) · [Mundarija](README.md) · [Keyingi: Uch holat va uch hudud →](05-uch-holat.md)

## Tushuncha

**Repo** (repository, ombor) — loyihaning butun tarixi: har commit, har faylning har versiyasi, branch'lar, teglar va sozlamalar. Git'da repo — oddiy papka, odatda loyihangiz ichidagi yashirin `.git` papkasi.

Repo'ga ega bo'lishning ikki yo'li bor (Pro Git):

1. **`git init`** — versiya nazoratida bo'lmagan mavjud (yoki yangi, bo'sh) papkani Git repo'siga aylantirish;
2. **`git clone`** — boshqa joydagi (serverdagi, GitHub'dagi, qo'shni papkadagi) mavjud repo'ning to'liq nusxasini olish.

Ikkala holatda ham natija bir xil: kompyuteringizda ishga tayyor lokal repo.

```text
  git init                              git clone <url>

  mening-loyiham/                       server: loyiha.git
  ├── README.md                                │  butun tarix
  ├── main.c                                   ▼
  └── .git/   ◄── yangi, bo'sh tarix    loyiha/
                                        ├── README.md   ◄── oxirgi versiya
                                        ├── main.c          (checkout)
                                        └── .git/       ◄── to'liq tarix nusxasi
                                                            + origin remote
```

Bobda uchraydigan uchta atama:

- **working tree** (ishchi daraxt) — siz ko'rib, tahrirlaydigan oddiy fayllar (`README.md`, `main.c`);
- **`.git` papkasi** (Git katalogi, `$GIT_DIR`) — Git'ning o'z ma'lumotlari: obyektlar, ref'lar, sozlamalar. Uni Git o'zi boshqaradi, qo'lda tegilmaydi;
- **bare repo** — working tree'siz repo: faqat `.git` ichidagi narsalar, alohida papkada. Server uchun ishlatiladi.

## Nega shunday: nega `clone`, `checkout` emas

Subversion kabi markazlashgan tizimlarda serverdan loyihani olish buyrug'i `checkout` deb ataladi va u faqat **bitta versiyaning** ishchi nusxasini beradi; tarix serverda qoladi. Pro Git bu farqni ataylab ta'kidlaydi: Git'da buyruq `clone`, chunki Git serverdagi deyarli **hamma ma'lumotni** oladi — har faylning loyiha boshidan beri bo'lgan har versiyasini.

Buning oqibatlari:

- `log`, `diff`, `blame`, branch yaratish — hammasi tarmoqsiz, lokal ishlaydi ([1-bob](01-versiya-nazorati.md));
- har klon — to'laqonli zaxira nusxa. Server diski buzilsa, deyarli istalgan klondan serverni klon qilingan paytdagi holatiga qaytarish mumkin (server tomonidagi hook'lar kabi ba'zi narsalar yo'qolishi mumkin, lekin versiyalangan ma'lumot to'liq bo'ladi);
- klondan keyin sizning nusxangiz va server **teng huquqli**: Git uchun "asosiy" repo yo'q, faqat kelishuv bor ([32-bob](32-taqsimlangan-workflowlar.md)).

`init` esa teskari vaziyat uchun: tarix hali hech qayerda yo'q, uni siz boshlaysiz.

## Kod: mavjud papkani repo qilish

Versiya nazoratisiz loyiha papkasi:

```text
$ cd mening-loyiham
$ ls -A
LICENSE
README.md
main.c
$ git status
fatal: not a git repository (or any of the parent directories): .git
```

Git joriy papkadan boshlab yuqoriga qarab `.git` qidiradi va topmadi. Repo yaratamiz:

```text
$ git init
Initialized empty Git repository in /.../mening-loyiham/.git/
$ ls -A
.git
LICENSE
README.md
main.c
```

Pro Git'dagi papkaga o'tish misollari tizimga qarab farq qiladi: Linux'da `cd /home/user/my_project`, macOS'da `cd /Users/user/my_project`, Windows'da `cd C:/Users/user/my_project`. `git init` esa hamma joyda bir xil.

`git init` **faqat** `.git` papkasini yaratdi. Sizning fayllaringizga tegmadi va ularni hali kuzatmayapti:

```text
$ git status
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	LICENSE
	README.md
	main.c

nothing added to commit but untracked files present (use "git add" to track)
```

**Untracked** (kuzatilmaydigan) — Git papkada borligini ko'radi, lekin hali tarixga kiritilmagan fayl ([5-bob](05-uch-holat.md), [6-bob](06-ozgarishlarni-yozish.md)).

### `.git` ichida nima paydo bo'ldi

```text
$ find .git | sort
.git
.git/HEAD
.git/config
.git/description
.git/hooks
.git/hooks/applypatch-msg.sample
.git/hooks/commit-msg.sample
...
.git/hooks/pre-commit.sample
...
.git/hooks/update.sample
.git/info
.git/info/exclude
.git/objects
.git/objects/info
.git/objects/pack
.git/refs
.git/refs/heads
.git/refs/tags
```

Bu repo'ning "skeleti". Qisqacha (har birini [13-bobda](13-plumbing-va-porcelain.md) chuqur ko'ramiz):

| Narsa | Vazifasi |
| --- | --- |
| `HEAD` | Hozir qaysi branch'dasiz — `ref: refs/heads/main` |
| `config` | Shu repo'ning local sozlamalari ([3-bob](03-birinchi-sozlash.md)) |
| `description` | Faqat GitWeb dasturi ishlatadi, e'tibor bermasa bo'ladi |
| `hooks/` | Namuna hook skriptlari; hammasi `.sample` bilan tugaydi, ya'ni o'chirilgan ([47-bob](47-hooklar.md)) |
| `info/exclude` | Shu repo uchun shaxsiy ignore ro'yxati, commit qilinmaydi ([8-bob](08-gitignore-rm-mv.md)) |
| `objects/` | Obyektlar ombori — blob, tree, commit, teg ([14-bob](14-obyektlar-blob.md)); hozircha bo'sh |
| `refs/heads/`, `refs/tags/` | Branch va teg ko'rsatkichlari ([17-bob](17-reflar-va-head.md)); hozircha bo'sh |

```text
$ cat .git/HEAD
ref: refs/heads/main
$ cat .git/config
[core]
	repositoryformatversion = 0
	filemode = true
	bare = false
	logallrefupdates = true
	ignorecase = true
	precomposeunicode = true
$ cat .git/info/exclude
# git ls-files --others --exclude-from=.git/info/exclude
# Lines that start with '#' are comments.
# For a project mostly in C, the following would be a good set of
# exclude patterns (uncomment them if you want to use them):
# *.[oa]
# *~
```

`bare = false` — bu repo'ning working tree'si bor. `main` nomi `init.defaultBranch` sozlamasidan keldi ([3-bob](03-birinchi-sozlash.md)); sozlanmagan Git 2.56 `master` deb ataydi va maslahat chiqaradi.

### Tug'ilmagan branch

`HEAD` `refs/heads/main`ga ishora qilyapti, lekin `refs/heads/` bo'sh:

```text
$ ls .git/refs/heads
$ git log
fatal: your current branch 'main' does not have any commits yet
$ git rev-parse HEAD
fatal: ambiguous argument 'HEAD': unknown revision or path not in the working tree.
Use '--' to separate paths from revisions, like this:
'git <command> [<revision>...] -- [<file>...]'
```

Branch — commit'ga ko'rsatkich ([20-bob](20-branch-bu-ref.md)), commit esa hali yo'q. Git glossariysi buni **unborn branch** (tug'ilmagan branch) deydi: HEAD hali mavjud bo'lmagan branch'ni ko'rsatadi. Yangi `init` qilingan repo — unga duch kelishning eng odatiy yo'li.

### Birinchi commit

Pro Git tavsiyasi: mavjud fayllarni darhol kuzatishni boshlang va birinchi commit qiling:

```text
$ git add *.c
$ git add LICENSE README.md
$ git commit -m "Loyihaning birinchi versiyasi"
[main (root-commit) 8d792ce] Loyihaning birinchi versiyasi
 3 files changed, 3 insertions(+)
 create mode 100644 LICENSE
 create mode 100644 README.md
 create mode 100644 main.c
```

`root-commit` — otasiz, tarixdagi birinchi commit. Endi branch "tug'ildi":

```text
$ ls .git/refs/heads
main
$ cat .git/refs/heads/main
8d792cee11e02a695d37613916b4e0bd187e35c8
$ find .git/objects -type f | sort
.git/objects/78/f2de106c92b0d60772bd5aa6c1e6da7bf71005
.git/objects/8d/792cee11e02a695d37613916b4e0bd187e35c8
.git/objects/94/8b9945fe8fe1cb3525402bd8fadc5793cdd497
.git/objects/a2/2a2da24d1ceeef3d0c2f1f4f68923f55b8d4cc
.git/objects/d5/24a91c305fbd18c34dfd63c804dcf3326b6efd
```

Beshta obyekt: uchta fayl mazmuni (blob), bitta papka ro'yxati (tree) va commit'ning o'zi (`8d792ce`). `add` va `commit` nima qilishini [6-bobda](06-ozgarishlarni-yozish.md), obyektlarning ichini [14–16-boblarda](14-obyektlar-blob.md) ko'ramiz.

`git init` ma'lumotnomasidagi misol xuddi shu uch qadamni beradi: `git init`, `git add .` (hamma fayl), `git commit`.

### Ichki papkalar va repo chegarasi

Git har buyruqda joriy papkadan yuqoriga `.git` qidiradi. Shuning uchun repo ichidagi istalgan ichki papkadan ishlash mumkin:

```text
$ mkdir src && cd src
$ git rev-parse --show-toplevel
/.../mening-loyiham
```

`.git` papkasi — repo'ning **o'zi**. Uni o'chirsangiz, butun tarix yo'qoladi, fayllar esa oddiy papka bo'lib qoladi:

```text
$ rm -rf .git          # nusxada sinaldi!
$ git status
fatal: not a git repository (or any of the parent directories): .git
```

Bu `rm -rf` — qaytarib bo'lmaydigan amal: agar tarix boshqa joyga (serverga, klonga) yuborilmagan bo'lsa, u butunlay yo'qoladi.

## Kod: `git init` ning boshqa shakllari

### Qayta `init` — xavfsiz

```text
$ git init
Reinitialized existing Git repository in /.../mening-loyiham/.git/
```

Ma'lumotnoma: mavjud repo'da `git init` ishlatish xavfsiz, u mavjud narsani ustidan yozmaydi. Qayta ishlatishning asosiy sababi — yangi qo'shilgan shablonlarni (template) olish yoki `--separate-git-dir` bilan repo'ni boshqa joyga ko'chirish.

### Yangi papka bilan

Papka nomi berilsa, buyruq o'sha papka ichida ishlaydi; papka yo'q bo'lsa, yaratiladi (ichma-ich ham):

```text
$ git init yangi-papka/ichki
Initialized empty Git repository in /.../yangi-papka/ichki/.git/
```

### Boshqa boshlang'ich branch nomi: `-b`

```text
$ git init -b trunk boshqa-nom
Initialized empty Git repository in /.../boshqa-nom/.git/
$ cat boshqa-nom/.git/HEAD
ref: refs/heads/trunk
```

`-b` (`--initial-branch`) faqat shu repo uchun `init.defaultBranch`ni bosib o'tadi. Hech biri berilmasa — hozircha `master`, Git 3.0 dan `main`.

### Hash va ref formati

```text
$ git init -q --object-format=sha256 sha
$ cat sha/.git/config
[extensions]
	objectformat = sha256
[core]
	repositoryformatversion = 1
...

$ git init -q --ref-format=reftable rt
$ ls rt/.git
HEAD
config
description
hooks
info
objects
refs
reftable
$ cat rt/.git/HEAD
ref: refs/heads/.invalid
```

`--object-format=sha256` — obyektlar SHA-1 o'rniga SHA-256 bilan nomlanadi ([14-bob](14-obyektlar-blob.md)); repo formati versiyasi `1` ga ko'tarilib, `extensions` bo'limi qo'shiladi. `--ref-format=reftable` — ref'lar alohida fayllarda emas, `reftable/` ichidagi ikkilik jadvalda saqlanadi. Bunday repo'da `.git/HEAD` faqat eski vositalar uchun "qopqoq" — haqiqiy HEAD reftable ichida ([17-bob](17-reflar-va-head.md)). Ikkalasi ham Git 3.0 da yangi repo'lar uchun standart bo'lishi rejalashtirilgan (`BreakingChanges`). SHA-1 va SHA-256 repo'lari hozircha bir-biri bilan to'g'ridan-to'g'ri ma'lumot almasha olmaydi, shuning uchun xostingingiz qo'llab-quvvatlamasa, `sha256`ni ishlatmang.

### Boshqa opsiyalar

| Opsiya | Nima qiladi |
| --- | --- |
| `-q`, `--quiet` | Faqat xato va ogohlantirishlarni chiqaradi |
| `--bare` | Working tree'siz repo (pastda) |
| `--template=<papka>` | `hooks/`, `info/exclude` kabi fayllarni boshqa shablondan nusxalaydi; tartib: `--template` → `GIT_TEMPLATE_DIR` → `init.templateDir` → standart (`/usr/share/git-core/templates`) |
| `--separate-git-dir=<yo'l>` | `.git` papkasi o'rniga `.git` **faylini** yaratadi, haqiqiy repo boshqa joyda bo'ladi |
| `--shared[=group\|all\|0660...]` | Repo'ni bir guruh foydalanuvchilar uchun yoziladigan qiladi (`core.sharedRepository`); bunday repo'da `receive.denyNonFastForwards` standart yoqiladi |

## Kod: mavjud repo'ni klonlash

Haqiqiy loyihada siz odatda URL bilan klonlaysiz. Pro Git misoli:

```bash
$ git clone https://github.com/libgit2/libgit2
$ git clone https://github.com/libgit2/libgit2 mylibgit   # boshqa papka nomi bilan
```

Bu qo'llanmada hech narsa tarmoqqa yuborilmaydi, shuning uchun mexanizmni lokal repo bilan ko'ramiz — Git uchun lokal yo'l ham to'laqonli URL. Avval "server" vazifasini bajaradigan `markaz` repo'si: ikki branch (`main`, `dev`) va bitta teg (`v1.0`):

```text
$ git -C markaz log --oneline --all --graph --decorate
* 132dc16 (dev) Dev'da ish
* 054b4b2 (HEAD -> main, tag: v1.0) Ilova qo'shildi
* 5ff1cf9 Boshlanish
```

Klonlaymiz:

```text
$ git clone markaz ishchi-nusxa
Cloning into 'ishchi-nusxa'...
done.
$ cd ishchi-nusxa
$ ls -A
.git
README.md
app.js
```

`git clone` ketma-ket shu ishlarni qildi (ma'lumotnoma va Pro Git bo'yicha):

1. `ishchi-nusxa` papkasini yaratdi va ichida `git init` qildi;
2. manba repo'ni `origin` nomli **remote** (masofaviy repo yozuvi) sifatida sozladi;
3. hamma obyektlarni oldi;
4. manbadagi har branch uchun **remote-tracking branch** yaratdi: `origin/main`, `origin/dev`;
5. manbaning joriy branch'idan (`HEAD` → `main`) lokal `main` branch'ini yaratdi va uni working tree'ga chiqardi (checkout).

Natija:

```text
$ git log --oneline --decorate --all
132dc16 (origin/dev) Dev'da ish
054b4b2 (HEAD -> main, tag: v1.0, origin/main, origin/HEAD) Ilova qo'shildi
5ff1cf9 Boshlanish

$ git branch
* main
$ git branch -a
* main
  remotes/origin/HEAD -> origin/main
  remotes/origin/dev
  remotes/origin/main
```

E'tibor bering: **lokal** branch faqat bitta — `main`. `dev` tarixi ham to'liq keldi (`132dc16` bor), lekin u faqat `origin/dev` ko'rsatkichi sifatida — "server oxirgi marta qayerda edi" degan eslatma. `git switch dev` qilsangiz, Git shundan lokal `dev`ni yaratib beradi ([28-bob](28-remote-branchlar.md)). Teg `v1.0` ham avtomatik keldi.

`git status` lokal `main`ning server bilan bog'langanini ko'rsatadi:

```text
$ git status
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

### Klon `.git` ichida nima yozdi

```text
$ cat .git/config
[core]
	repositoryformatversion = 0
	filemode = true
	bare = false
	logallrefupdates = true
	ignorecase = true
	precomposeunicode = true
[remote "origin"]
	url = /.../04-repo-olish/markaz
	fetch = +refs/heads/*:refs/remotes/origin/*
[branch "main"]
	remote = origin
	merge = refs/heads/main
```

Uchta yangi narsa — `init` qilingan repo'dan farqi aynan shular:

- `remote.origin.url` — qayerdan klonlangan;
- `remote.origin.fetch` — **refspec**: "serverdagi `refs/heads/*` ni menda `refs/remotes/origin/*` deb saqla" ([29-bob](29-fetch-push-ichidan.md));
- `branch.main.remote`/`merge` — lokal `main` `origin`dagi `main`ni kuzatadi (upstream), shuning uchun keyin argumentsiz `git pull`/`git push` ishlaydi ([27-bob](27-remote.md), [28-bob](28-remote-branchlar.md)).

Ref'lar:

```text
$ find .git/refs -type f | sort
.git/refs/heads/main
.git/refs/remotes/origin/HEAD
$ cat .git/refs/remotes/origin/HEAD
ref: refs/remotes/origin/main
$ cat .git/packed-refs
# pack-refs with: peeled fully-peeled sorted 
132dc162bbcafda675ced18db5a6d0ac539a27b7 refs/remotes/origin/dev
054b4b26ea045eae3f670d3f8bbb898ca4b6d1a6 refs/remotes/origin/main
79fd38fd89e909e50138e17266e729fb092b032e refs/tags/v1.0
^054b4b26ea045eae3f670d3f8bbb898ca4b6d1a6
```

Klon ref'larni darhol bitta `packed-refs` fayliga yozadi ([17-bob](17-reflar-va-head.md)). `^054b4b2...` qatori — annotated teg `v1.0` qaysi commit'ga ishora qilishi (teg obyekti `79fd38f` ning "ichidagi" commit). `origin/HEAD` — serverdagi standart branch qaysi ekanini eslab qoluvchi symbolic ref.

### Papka nomi

Nom berilmasa, Git URL'ning "odamga o'xshash" (*humanish*) qismini oladi: `/path/to/repo.git` → `repo`, `host.xz:foo/.git` → `foo`. `.git` qo'shimchasi tashlanadi:

```text
$ git clone -q server.git
$ ls -d server*
server
server.git
```

Mavjud papkaga klonlash faqat u **bo'sh** bo'lsa mumkin:

```text
$ git clone markaz sayoz
fatal: destination path 'sayoz' already exists and is not an empty directory.

$ mkdir bosh-papka && cd bosh-papka
$ git clone -q ../markaz .
$ ls -A
.git
README.md
app.js
```

`.` — "shu (bo'sh) papkaning o'ziga".

## Kod: URL turlari va protokollar

Git bir nechta uzatish protokolini qo'llaydi. Ma'lumotnomadagi URL shakllari:

```text
https://<host>[:<port>]/<yo'l>          https://github.com/libgit2/libgit2
ssh://[<user>@]<host>[:<port>]/<yo'l>   ssh://git@example.com/loyiha.git
[<user>@]<host>:<yo'l>                  git@github.com:libgit2/libgit2.git   (scp uslubi, ham SSH)
git://<host>[:<port>]/<yo'l>            git://git.kernel.org/pub/scm/...
/yo'l/repo.git                          lokal yo'l
file:///yo'l/repo.git                   lokal, lekin "tarmoq" usulida
```

- **https** — eng keng tarqalgan, login/token bilan ([30-bob](30-ssh-va-credential.md));
- **SSH** — kalit bilan; scp uslubidagi `git@github.com:...` ham SSH. Bu shakl faqat birinchi `:` dan oldin `/` bo'lmasa tan olinadi — shuning uchun `foo:bar` nomli lokal papkani `./foo:bar` deb yozish kerak;
- **`git://`** — autentifikatsiyasiz; ma'lumotnoma himoyalanmagan tarmoqda ehtiyot bo'lishni tavsiya qiladi;
- `ftp`/`ftps` — eskirgan, ishlatmang.

Protokollarning ichki ishlashi va afzallik-kamchiliklari — [29-bob](29-fetch-push-ichidan.md).

### Lokal yo'l va `file://` farqi

Ma'lumotnoma: lokal yo'l `--local` ni nazarda tutadi — Git "tarmoq" protokolini chetlab o'tib, `.git/objects` dagi fayllarni bevosita nusxalaydi, imkon bo'lsa **hardlink** (bir faylga ikkinchi nom) qiladi. Tekshiramiz — ikkala repo'da bir obyekt bir xil inode raqamiga ega (ya'ni diskda bitta fayl):

```text
$ ls -i ishchi-nusxa/.git/objects/05/ markaz/.git/objects/05/
ishchi-nusxa/.git/objects/05/:
30236986 4b4b26ea045eae3f670d3f8bbb898ca4b6d1a6

markaz/.git/objects/05/:
30236986 4b4b26ea045eae3f670d3f8bbb898ca4b6d1a6
```

Disk joyi ikki marta sarflanmadi. Obyektlar o'zgarmas bo'lgani uchun ([14-bob](14-obyektlar-blob.md)) bu xavfsiz. Zaxira nusxa olayotganda esa alohida nusxa kerak — buning uchun `--no-hardlinks`.

`file://` URL esa haqiqiy uzatish protokolini ishlatadi — server bilan bir xil yo'l:

```text
$ git clone --progress file:///.../markaz tarmoq-nusxa
Cloning into 'tarmoq-nusxa'...
remote: Enumerating objects: 10, done.
remote: Counting objects: 100% (10/10), done.
remote: Compressing objects: 100% (6/6), done.
remote: Total 10 (delta 0), reused 0 (delta 0), pack-reused 0 (from 0)
Receiving objects: 100% (10/10), done.

$ find tarmoq-nusxa/.git/objects -type f | sort
tarmoq-nusxa/.git/objects/pack/pack-03e6ad850c41d765915d11cb598afa2c87423cd9.idx
tarmoq-nusxa/.git/objects/pack/pack-03e6ad850c41d765915d11cb598afa2c87423cd9.pack
tarmoq-nusxa/.git/objects/pack/pack-03e6ad850c41d765915d11cb598afa2c87423cd9.rev
```

(Foiz qatorlari terminalda bitta qatorda yangilanadi; bu yerda yakuniy holati qoldirildi.) `remote:` bilan boshlangan qatorlar — "server" tomoni. Obyektlar alohida fayllar emas, bitta **packfile** sifatida keldi ([18-bob](18-packfile-va-gc.md)) — GitHub'dan klonlaganingizda ham aynan shunday bo'ladi.

## Kod: `clone` opsiyalari

### Boshqa branch yoki teg: `-b`

```text
$ git clone -q -b dev -o markaz markaz dev-nusxa
$ git -C dev-nusxa branch -a
* dev
  remotes/markaz/HEAD -> markaz/main
  remotes/markaz/dev
  remotes/markaz/main
$ git -C dev-nusxa status -sb
## dev...markaz/dev
```

`-b dev` — serverning `HEAD`i emas, `dev` checkout qilinadi. `-o markaz` (`--origin`) — remote nomi `origin` o'rniga `markaz` (standartni `clone.defaultRemoteName` bilan ham o'zgartirish mumkin).

`-b` teg nomini ham qabul qiladi — u holda HEAD **detached** bo'ladi ([20-bob](20-branch-bu-ref.md)):

```text
$ git clone -b v1.0 markaz teg-nusxa
Cloning into 'teg-nusxa'...
done.
warning: refs/tags/v1.0 79fd38fd89e909e50138e17266e729fb092b032e is not a commit!
Note: switching to '054b4b26ea045eae3f670d3f8bbb898ca4b6d1a6'.

You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by switching back to a branch.
...
```

`is not a commit!` ogohlantirishi annotated teg uchun chiqadi: `79fd38f` — teg obyekti, commit emas. Git baribir uni commit'gacha "ochib" (`054b4b2`) checkout qildi. Natija to'g'ri; ogohlantirish chalg'itmasin.

### Faqat oxirgi tarix: `--depth` (shallow clone)

Katta loyihada butun tarix kerak bo'lmasa (masalan, CI'da faqat build qilish uchun):

```text
$ git clone --depth 1 markaz sayoz
Cloning into 'sayoz'...
warning: --depth is ignored in local clones; use file:// instead.
done.
```

Lokal yo'lda `--depth` e'tiborsiz qoldiriladi — Git o'zi `file://` ni maslahat beryapti:

```text
$ git clone -q --depth 1 file:///.../markaz sayoz
$ git -C sayoz log --oneline --all --decorate
054b4b2 (grafted, HEAD -> main, tag: v1.0, origin/main, origin/HEAD) Ilova qo'shildi
$ cat sayoz/.git/shallow
054b4b26ea045eae3f670d3f8bbb898ca4b6d1a6
$ git -C sayoz rev-parse --is-shallow-repository
true
$ git -C sayoz branch -a
* main
  remotes/origin/HEAD -> origin/main
  remotes/origin/main
$ grep fetch sayoz/.git/config
	fetch = +refs/heads/main:refs/remotes/origin/main
```

Faqat bitta commit keldi; `grafted` va `.git/shallow` fayli — "tarix shu yerda kesilgan" belgisi. `--depth` `--single-branch`ni ham nazarda tutadi: `dev` umuman kelmadi va refspec faqat `main`ga torayib qoldi. Yana `--shallow-since=<sana>`, `--shallow-exclude=<ref>` bor. Shallow, partial (`--filter=blob:none`) va sparse klonlar — [49-bob](49-worktree-va-katta-repo.md).

### Checkout'siz: `-n`

```text
$ git clone -n markaz nocheckout
Cloning into 'nocheckout'...
done.
$ ls -A nocheckout
.git
$ git -C nocheckout status --short
D  README.md
D  app.js
```

Tarix to'liq, lekin working tree bo'sh. Index ham bo'sh bo'lgani uchun `status` fayllarni "o'chirilgan" deb ko'rsatadi — hech narsa o'chirilmagan, shunchaki chiqarilmagan. Kerakli branch'ni keyin `git switch` yoki `git checkout` bilan chiqarasiz.

### Boshqa foydali opsiyalar

| Opsiya | Nima qiladi |
| --- | --- |
| `--single-branch` | Faqat bitta branch tarixi (`-b` yoki serverning `HEAD`i) |
| `--no-tags` | Teglarni olmaydi va buni `remote.origin.tagOpt` ga doimiy yozadi |
| `--recurse-submodules` | Submodule'larni ham klonlaydi ([43-bob](43-submodule-bundle-replace.md)) |
| `-c <kalit>=<qiymat>` | Yangi repo'ning `.git/config`iga sozlama yozadi, fetch'dan **oldin** |
| `--filter=blob:none` | Partial clone: fayl mazmunlari kerak bo'lganda yuklanadi |
| `--sparse` | Avval faqat ildiz papkadagi fayllar chiqariladi |
| `--reference <repo>`, `--shared` | Obyektlarni boshqa lokal repo'dan "qarzga" oladi (`objects/info/alternates`); ma'lumotnoma `--shared`ni xavfli deb ogohlantiradi — manba repo'da obyekt o'chsa, klon buziladi |
| `--separate-git-dir=<yo'l>` | `.git` ni boshqa joyda saqlaydi |
| `--revision=<rev>` | Faqat shu revision'gacha bo'lgan tarix, branch'siz, detached HEAD |

`--separate-git-dir` natijasi — `.git` papka emas, bir qatorli **fayl** (*gitfile*): `gitdir: /.../alohida-git`. Xuddi shu mexanizmni submodule'lar va `git worktree` ishlatadi ([43-bob](43-submodule-bundle-replace.md), [49-bob](49-worktree-va-katta-repo.md)).

## Kod: bare repo

**Bare repo** — working tree'siz repo. Glossariy ta'rifi: odatda `.git` qo'shimchali papka bo'lib, oddiy repo'da yashirin `.git` ichida turadigan hamma narsa to'g'ridan-to'g'ri shu papkada bo'ladi va boshqa hech qanday fayl chiqarilmaydi. Serverlar (GitHub ham) repo'larni shunday saqlaydi.

```text
$ git init --bare server.git
Initialized empty Git repository in /.../server.git/
$ ls server.git
HEAD
config
description
hooks
info
objects
refs
$ cat server.git/config
[core]
	repositoryformatversion = 0
	filemode = true
	bare = true
	ignorecase = true
	precomposeunicode = true
```

`.git` papkasi yo'q — papkaning o'zi `.git`. `bare = true`, `logallrefupdates` esa yo'q (bare repo'da reflog standart yoqilmaydi). Working tree talab qiladigan buyruqlar ishlamaydi:

```text
$ cd server.git
$ git status
fatal: this operation must be run in a work tree
$ git rev-parse --is-bare-repository
true
```

### Nega serverda bare repo

Oddiy repo'ga, uning **checkout qilingan** branch'iga push qilib ko'ramiz — `ishchi-nusxa` dan `markaz`ga:

```text
$ git push origin main
remote: error: refusing to update checked out branch: refs/heads/main
remote: error: By default, updating the current branch in a non-bare repository
remote: is denied, because it will make the index and work tree inconsistent
remote: with what you pushed, and will require 'git reset --hard' to match
remote: the work tree to HEAD.
...
To /.../markaz
 ! [remote rejected] main -> main (branch is currently checked out)
error: failed to push some refs to '/.../markaz'
```

Git rad etdi: agar `markaz`dagi `main` siljisa, u yerdagi working tree va index eski holatda qolib ketadi va u yerda ishlayotgan odamning fayllari tarix bilan mos kelmaydi. Bare repo'da working tree yo'q — ziddiyat ham yo'q. Shuning uchun **push qilinadigan markaziy repo bare bo'ladi**.

Bo'sh bare repo'ni klonlab, birinchi commit'ni push qilamiz:

```text
$ git clone server.git bosh
Cloning into 'bosh'...
warning: You appear to have cloned an empty repository.
done.
$ cd bosh
$ echo "# Server" > README.md
$ git add README.md
$ git commit -q -m "Birinchi"
$ git push origin main
To /.../server.git
 * [new branch]      main -> main

$ git -C ../server.git log --oneline
aa813f0 Birinchi
```

Bo'sh repo'ni klonlash ham normal — ogohlantirish shunchaki eslatma. GitHub'da yangi bo'sh repo yaratganingizda ham aynan shu holat. Tarmoqdagi server bilan bunday ishlash [27-bob](27-remote.md) va [29-bob](29-fetch-push-ichidan.md)da.

### Mavjud repo'dan bare nusxa: `--bare` va `--mirror`

```text
$ git clone --bare markaz markaz-bare.git
Cloning into bare repository 'markaz-bare.git'...
done.
$ git -C markaz-bare.git branch -a
  dev
* main
$ cat markaz-bare.git/packed-refs
# pack-refs with: peeled fully-peeled sorted 
132dc162bbcafda675ced18db5a6d0ac539a27b7 refs/heads/dev
054b4b26ea045eae3f670d3f8bbb898ca4b6d1a6 refs/heads/main
79fd38fd89e909e50138e17266e729fb092b032e refs/tags/v1.0
^054b4b26ea045eae3f670d3f8bbb898ca4b6d1a6
$ cat markaz-bare.git/config
...
	bare = true
...
[remote "origin"]
	url = /.../markaz
```

Oddiy klondan farqi: manbaning branch'lari `refs/remotes/origin/*` ga emas, to'g'ridan-to'g'ri **lokal** `refs/heads/*` ga ko'chirildi — `dev` ham, `main` ham oddiy branch. Remote-tracking branch'lar va `fetch` refspec'i yaratilmaydi (faqat `url` yoziladi). Bu — mavjud loyihani serverga joylashning klassik yo'li (Pro Git, "Getting Git on a Server" bo'limi):

```bash
$ git clone --bare my_project my_project.git
$ scp -r my_project.git user@git.example.com:/srv/git
```

`--mirror` — `--bare` ning kuchliroq shakli: **hamma** ref'larni (remote-tracking, notes...) aynan ko'chiradi va keyingi yangilanishlarda ham ularni ustidan yozadigan qilib sozlaydi:

```text
$ git clone -q --mirror markaz oyna.git
$ cat oyna.git/config
...
[remote "origin"]
	url = /.../markaz
	tagOpt = --no-tags
	fetch = +refs/*:refs/*
	mirror = true
```

`fetch = +refs/*:refs/*` — "manbadagi har ref menda aynan shu nom bilan". Ko'zgu (mirror) zaxira yoki boshqa xostingga ko'chirish uchun.

## Muhandislik nuqtai nazari: `init` yoki `clone`?

| Vaziyat | Yo'l |
| --- | --- |
| Yangi loyiha, hali hech qayerda tarix yo'q | `git init`, keyin xostingda bo'sh repo yaratib, `git remote add` + `push` ([27-bob](27-remote.md)) |
| Loyiha GitHub/GitLab'da allaqachon bor | `git clone <url>` — hech qachon `init` + qo'lda fayl nusxalash emas |
| Xostingda README bilan yangi repo yaratdingiz | `git clone` — `init` qilsangiz, ikki bog'liqsiz tarix paydo bo'ladi |
| O'z serveringizda markaziy repo | `git init --bare` yoki mavjud repo'dan `git clone --bare` |
| CI, faqat oxirgi holat kerak | `git clone --depth 1` yoki `--filter=blob:none` |
| Boshqa xostingga to'liq ko'chirish | `git clone --mirror`, keyin `push --mirror` |

Ko'p uchraydigan xato: xostingda (README yoki LICENSE bilan) repo yaratib, lokalda ham `git init` qilib commit qilish. Natijada ikki repo'da **umumiy ajdodsiz** ikki tarix bo'ladi va `push` rad etiladi. To'g'ri yo'l — yoki xostingdagi repo'ni bo'sh yaratish, yoki avval klonlab, keyin ishlash.

## Muhandislik nuqtai nazari: repo ichida repo va `.git` xavfsizligi

- **Ichma-ich repo yaratmang.** Mavjud repo ichidagi papkada `git init` qilsangiz, tashqi repo ichki papkani alohida repo sifatida ko'radi va uning fayllarini kuzatmaydi. Bu ataylab kerak bo'lsa — submodule ([43-bob](43-submodule-bundle-replace.md)).
- **Uy papkasida `git init` qilmang.** Shunda uy ichidagi har papka "repo ichida" bo'lib qoladi va `git status` kutilmagan natija beradi. Har loyiha — o'z papkasida.
- **`.git` ni qo'lda tahrirlamang.** Bu bobdagi `cat`/`find` — faqat o'rganish uchun. Ref va config'larni `git` buyruqlari orqali o'zgartiring: ichki format (masalan `reftable`) o'zgarishi mumkin ([20-bob](20-branch-bu-ref.md)).
- **Klonlangan repo'dagi hook'lar ishlamaydi.** `.git/hooks` serverdan klonlanmaydi — har klon `init` shablonidagi `.sample` fayllarni oladi. Bu xavfsizlik uchun: begona repo klonlanishi bilan sizning kompyuteringizda kod bajarilmaydi ([47-bob](47-hooklar.md)).
- **Begona foydalanuvchining lokal repo'si.** Ma'lumotnoma: `--local` boshqa foydalanuvchiga tegishli repo'lar bilan xavfsizlik sababli ishlamaydi, `--no-local` kerak; `objects` ichida symbolic link bo'lsa klon to'xtaydi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Xostingdagi mavjud loyiha uchun `git init` qilib, fayllarni qo'lda nusxalash | Ikki bog'liqsiz tarix, `push` rad etiladi, server tarixi yo'q | `git clone <url>` |
| `git init` dan keyin fayllar "saqlandi" deb o'ylash | `init` faqat bo'sh `.git` yaratadi; fayllar untracked | `git add` + `git commit` |
| Joy bo'shatish uchun `.git` ni o'chirish | Butun tarix qaytarib bo'lmaydigan tarzda yo'qoladi | `git gc` ([18-bob](18-packfile-va-gc.md)); keraksiz bo'lsa avval zaxira yoki push |
| Uy papkasida yoki repo ichida yana `git init` | Kutilmagan repo chegaralari, fayllar "yo'qoladi" | Har loyiha alohida papkada; `git rev-parse --show-toplevel` bilan tekshiring |
| Checkout qilingan branch'li oddiy repo'ni markaziy repo qilish | `push` `refusing to update checked out branch` bilan rad etiladi | Markaziy repo — `git init --bare` / `git clone --bare` |
| Lokal yo'l bilan `--depth` | `warning: --depth is ignored in local clones` — to'liq tarix keladi | `file:///...` URL |
| Shallow klonda eski tarixni qidirish | `log`, `blame` kesilgan joyda to'xtaydi | `git fetch --unshallow` yoki to'liq klon |
| `clone` dan keyin `git branch` da `dev` ko'rinmasa, "kelmadi" deb o'ylash | Tarix bor, faqat `origin/dev` sifatida | `git branch -a`; `git switch dev` lokal branch yaratadi |
| Bo'sh bo'lmagan papkaga klonlash | `destination path ... already exists and is not an empty directory` | Yangi nom bering yoki bo'sh papkada `git clone <url> .` |

## Amaliyot

1. Uchta fayl bilan papka yarating. `git init` dan oldin va keyin `ls -A` va `git status` ni solishtiring. `find .git | sort` dagi har element vazifasini jadvaldan toping.
2. Birinchi commit'gacha `cat .git/HEAD`, `ls .git/refs/heads`, `git log` natijalarini yozing. Commit'dan keyin nima o'zgardi? "Unborn branch" ni o'z so'zingiz bilan tushuntiring.
3. Ikki branch va bitta tegli repo yarating, uni klonlang. `git branch` va `git branch -a` farqini, `.git/config` dagi uchta yangi yozuvni va `packed-refs` mazmunini tushuntiring.
4. Bir repo'ni lokal yo'l bilan va `file://` bilan klonlang. `ls -i` bilan obyektlarni solishtiring: qaysi birida hardlink, qaysi birida packfile?
5. `git clone --depth 1 file:///...` qiling. `git log`, `cat .git/shallow` va refspec'ni tekshiring. Keyin `git fetch --unshallow` bilan to'liq tarixni oling.
6. `git init --bare markaz.git` yarating, uni klonlang, commit qilib push qiling. Bare repo ichida `git log` ishlaydimi? `git status` chi? Nega?
7. (Qiyinroq) Oddiy (bare bo'lmagan) repo'ning checkout qilingan branch'iga push qilib, rad etilishini ko'ring. Keyin o'sha repo'da boshqa branch'ga o'ting (`git switch -c boshqa`) va push'ni takrorlang — endi o'tdimi? Nega? `receive.denyCurrentBranch` ma'lumotnomasini (`git help config`) o'qib, `updateInstead` qiymati qanday muammoni hal qilishini tushuntiring.

## Rasmiy hujjat

- Pro Git — Getting a Git Repository: <https://git-scm.com/book/en/v2/Git-Basics-Getting-a-Git-Repository>
- Pro Git — Getting Git on a Server (bare repo): <https://git-scm.com/book/en/v2/Git-on-the-Server-Getting-Git-on-a-Server>
- `git init`: <https://git-scm.com/docs/git-init>
- `git clone` (opsiyalar va GIT URLS bo'limi): <https://git-scm.com/docs/git-clone>
- `gitrepository-layout` (`.git` tuzilishi): <https://git-scm.com/docs/gitrepository-layout>
- `gitglossary` (bare repository, unborn): <https://git-scm.com/docs/gitglossary>
