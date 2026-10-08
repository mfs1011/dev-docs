# 27 — Remote'lar

[← Oldingi: Murakkab merge](26-murakkab-merge.md) · [Mundarija](README.md) · [Keyingi: Remote branch'lar va kuzatish →](28-remote-branchlar.md)

## Tushuncha

Shu paytgacha hamma ish bitta repo ichida bo'ldi. Jamoada ishlash uchun esa repo'lar bir-biri bilan ma'lumot almashishi kerak. Buning uchun Git'da **remote** tushunchasi bor.

**Remote** — boshqa joyda turgan xuddi shu loyiha repo'sining **qisqa nomi** (taxallusi). Uzun URL'ni har safar yozish o'rniga `origin`, `upstream`, `bobur` kabi nom bilan murojaat qilasiz. Remote odatda internetdagi serverda (GitHub, GitLab, kompaniya serveri) turadi, lekin shart emas: "remote" so'zi "uzoqda" degani emas, "boshqa joyda" degani. Xuddi shu kompyuterdagi boshqa papka ham to'liq huquqli remote bo'la oladi — bu bobdagi hamma misol aynan shunday ishlaydi.

Remote bilan uchta asosiy amal bor:

| Amal | Buyruq | Yo'nalish | Nima o'zgaradi |
| --- | --- | --- | --- |
| Olib kelish | `git fetch` | remote → siz | Obyektlar va `refs/remotes/<remote>/*` (sizning branch'laringiz **o'zgarmaydi**) |
| Olib kelib birlashtirish | `git pull` | remote → siz | `fetch` + joriy branch'ga `merge` yoki `rebase` |
| Yuborish | `git push` | siz → remote | Remote'dagi obyektlar va uning branch'lari |

Bitta repo'da bir nechta remote bo'lishi mumkin: biridan faqat o'qiysiz (masalan, asl loyiha), boshqasiga yozasiz (o'z fork'ingiz). Remote'larni boshqarish — qo'shish, ko'rish, nomini o'zgartirish, o'chirish — `git remote` buyrug'i bilan qilinadi.

Ichki model nuqtai nazaridan ([13–19-boblar](13-plumbing-va-porcelain.md)) remote — bu uch narsaning yig'indisi:

1. `.git/config` dagi `[remote "<nom>"]` bo'limi — URL va **refspec** (qaysi ref qayerga yozilishi qoidasi, [29-bob](29-fetch-push-ichidan.md));
2. `.git/refs/remotes/<nom>/` papkasidagi ref'lar — remote'dagi branch'larning **oxirgi ko'rilgan** holati ([17-bob](17-reflar-va-head.md));
3. `.git/objects` ga olib kelingan obyektlar — ular boshqa obyektlardan farq qilmaydi, "kimniki" degan belgi yo'q.

## Nega shunday: nega `fetch` va birlashtirish alohida qadam

Markazlashgan tizimlarda (SVN) "yangilash" bitta amal: serverdan kelgan o'zgarish darhol ishchi papkangizga tushadi. Git buni ikkiga bo'ladi va bu tasodif emas.

**Birinchidan, `fetch` hech qachon ishingizga tegmaydi.** U faqat yangi obyektlarni `.git/objects` ga qo'shadi va `refs/remotes/origin/*` ref'larini suradi. Sizning `main` branch'ingiz, index va working tree — hammasi joyida qoladi. Shuning uchun `git fetch` ni istalgan payt, hatto yarim ish ustida ham, xavfsiz ishlatish mumkin.

**Ikkinchidan, olib kelgan narsani avval ko'rib chiqish imkoni.** `fetch` dan keyin `git log main..origin/main` bilan nima kelganini, `git diff` bilan nima o'zgarganini ko'rasiz, keyin qaror qilasiz: merge, rebase yoki hozircha hech narsa.

**Uchinchidan, Git taqsimlangan.** Har klon — to'liq repo. Remote — bu "asosiy" nusxa emas, shunchaki boshqa bir nusxa. Git sizning nusxangizni boshqasi bilan majburan sinxronlamaydi; qachon va nimani olishni siz hal qilasiz.

`push` esa teskari tomonga ishlaydi va qat'iy qoidaga bo'ysunadi: remote'dagi branch faqat **fast-forward** bo'lsa yangilanadi (ya'ni siz yuborgan commit remote'dagi commit'ning avlodi bo'lishi kerak). Aks holda kimningdir ishi tarixdan "tushib qoladi". Bu qoida bobning o'rtasida amalda ko'rinadi.

## Kod: tajriba maydoni — server va ikki dasturchi

Bu bobda uchta repo ishlatamiz, hammasi bitta papkada:

```text
27-remote/
├── server.git/   ← "server": bare repo (working tree yo'q, [4-bob])
├── ali/          ← Ali'ning ishchi repo'si
└── vali/         ← Vali'ning ishchi repo'si (keyinroq klon qilinadi)
```

Server sifatida **bare** repo ishlatiladi. Bare repo'da working tree yo'q, faqat `.git` ichidagi narsalar — shuning uchun unga push qilish xavfsiz (nega — "Tipik xatolar" jadvalida).

```bash
$ git init --bare server.git
Initialized empty Git repository in .../27-remote/server.git/
```

Ali hali hech qanday remote'siz, oddiy lokal repo bilan boshlaydi:

```bash
$ git init ali
$ cd ali
$ echo "# Kutubxona" > README.md
$ git add README.md
$ git commit -m "Boshlang'ich commit"
[main (root-commit) 3c8955c] Boshlang'ich commit
 1 file changed, 1 insertion(+)
 create mode 100644 README.md
```

## Kod: remote'larni ko'rish va qo'shish

`git remote` argumentsiz — mavjud remote'lar nomlari ro'yxati. Hozir u bo'sh:

```bash
$ git remote
$
```

Remote qo'shish: `git remote add <nom> <URL>`.

```bash
$ git remote add origin ../server.git
$ git remote -v
origin	../server.git (fetch)
origin	../server.git (push)
```

`-v` (`--verbose`) har remote uchun ikki URL'ni ko'rsatadi: o'qish (`fetch`) va yozish (`push`) uchun. Odatda ular bir xil, lekin alohida sozlash mumkin (pastda `--push` ga qarang). E'tibor bering, `-v` `remote` va kichik buyruq orasiga yoziladi: `git remote -v show origin`.

`origin` — maxsus kalit so'z emas, shunchaki an'anaviy nom. `git clone` klon qilingan manbaga avtomatik shu nomni beradi. Fork bilan ishlaganda asl loyihaga ko'pincha `upstream` nomi beriladi ([33-bob](33-hissa-qoshish.md)).

`remote add` aslida faqat konfiguratsiya yozadi. Buni `.git/config` da ko'ring:

```bash
$ sed -n '/remote/,$p' .git/config
[remote "origin"]
	url = ../server.git
	fetch = +refs/heads/*:refs/remotes/origin/*
```

Ikki qator:

- `url` — repo qayerda;
- `fetch` — **refspec**: "remote'dagi `refs/heads/` ostidagi hamma narsani (`*`) mening `refs/remotes/origin/` papkamga yoz, fast-forward bo'lmasa ham (`+`)". Refspec sintaksisi [29-bob](29-fetch-push-ichidan.md)da batafsil.

Remote qo'shilgani bilan hali hech narsa olib kelinmagan — `refs/remotes` papkasi ham yo'q:

```bash
$ ls .git/refs/remotes
ls: .git/refs/remotes: No such file or directory
```

> **Misollardagi yo'llar haqida.** Bu bobda URL sifatida nisbiy yo'l (`../server.git`) ishlatilgan — natijada chiqishlar qisqa. Haqiqiy loyihada bu yerda `https://github.com/...` yoki `git@github.com:...` turadi; buyruqlar o'zgarmaydi.

### URL qanday bo'lishi mumkin

Git to'rt xil transportni biladi: lokal fayl, SSH, Git protokoli va HTTP(S). Ularning farqi, afzallik va kamchiliklari [29-bob](29-fetch-push-ichidan.md)da. Bu yerda faqat yozilish shakllari (rasmiy `git-fetch` hujjatining "GIT URLS" bo'limidan):

| Shakl | Misol | Transport |
| --- | --- | --- |
| `/yo'l/repo.git` | `/srv/git/loyiha.git` | Lokal |
| `file:///yo'l/repo.git` | `file:///srv/git/loyiha.git` | Lokal (klonlashda `--local` optimizatsiyasisiz) |
| `ssh://[user@]host[:port]/yo'l` | `ssh://git@example.com:2222/loyiha.git` | SSH |
| `[user@]host:yo'l` (scp-ga o'xshash) | `git@github.com:ali/kutubxona.git` | SSH |
| `git://host[:port]/yo'l` | `git://example.com/loyiha.git` | Git (autentifikatsiyasiz) |
| `http[s]://host[:port]/yo'l` | `https://github.com/ali/kutubxona.git` | HTTP(S) |

scp-ga o'xshash shakl faqat birinchi `:` dan oldin `/` bo'lmasa SSH deb tushuniladi. Ya'ni `foo:bar` — SSH (`foo` xostdagi `bar`), `./foo:bar` — lokal papka. `ftp://` ham texnik jihatdan qo'llab-quvvatlanadi, lekin hujjat uni eskirgan va samarasiz deb, ishlatmaslikni aytadi.

## Kod: birinchi push

Ali o'z commit'ini serverga yuboradi: `git push <remote> <branch>`.

```bash
$ git push origin main
To ../server.git
 * [new branch]      main -> main
```

`*` belgisi — "yangi ref yaratildi". Endi `.git/refs` ichiga qarang:

```bash
$ find .git/refs -type f
.git/refs/heads/main
.git/refs/remotes/origin/main
```

`push` muvaffaqiyatli bo'lgach, Git **lokal** `refs/remotes/origin/main` ni ham yaratdi: "serverdagi `main` hozir shu commit'da" degan eslatma. Bu **remote-tracking branch** — remote'dagi branch'ning sizdagi nusxa-ko'rsatkichi. U [28-bob](28-remote-branchlar.md)ning asosiy mavzusi.

```bash
$ git branch -a
* main
  remotes/origin/main
```

## Kod: `clone` — remote'ni avtomatik sozlash

Endi Vali loyihaga qo'shiladi. U `git clone` qiladi:

```bash
$ git clone server.git vali
Cloning into 'vali'...
done.
$ cd vali
$ git remote -v
origin	/.../27-remote/server.git (fetch)
origin	/.../27-remote/server.git (push)
```

`clone` uch ishni bitta buyruqda bajardi: `init`, `remote add origin <URL>` va `fetch`, keyin standart branch'ni checkout qildi ([4-bob](04-repo-olish.md)). Lokal yo'l bilan klonlaganda Git URL'ni absolyut yo'lga aylantirib saqlaydi. Uni o'zgartirish uchun `set-url`:

```bash
$ git remote set-url origin ../server.git
$ git remote -v
origin	../server.git (fetch)
origin	../server.git (push)
```

`set-url` amaliyotda ko'p kerak bo'ladi: repo boshqa serverga ko'chganda yoki HTTPS'dan SSH'ga o'tganda ([30-bob](30-ssh-va-credential.md)) — remote'ni o'chirib qayta qo'shish shart emas, ref'lar va sozlamalar saqlanib qoladi.

Vali o'z ismini shu repo uchun sozlaydi va birinchi hissasini qo'shadi:

```bash
$ git config user.name 'Vali Aliyev'
$ git config user.email vali@example.com
$ echo "Kitoblar ro'yxati" > kitoblar.txt
$ git add kitoblar.txt
$ git commit -m "Kitoblar ro'yxatini qo'shish"
[main 9bca200] Kitoblar ro'yxatini qo'shish
 1 file changed, 1 insertion(+)
 create mode 100644 kitoblar.txt
$ git push
To ../server.git
   3c8955c..9bca200  main -> main
```

Vali `git push` ni argumentsiz yozdi va u ishladi: `clone` uning `main` branch'iga **upstream** (kuzatiladigan remote branch) belgilab qo'ygan. Chiqishdagi `3c8955c..9bca200` — serverdagi `main` qayerdan qayerga surilgani; uni to'g'ridan-to'g'ri `git log 3c8955c..9bca200` ga berish mumkin.

## Kod: `fetch` — ichkarida nima o'zgaradi

Ali hali Vali'ning commit'ini bilmaydi. `fetch` dan **oldin** uning repo holatini yozib olamiz:

```bash
$ cat .git/refs/remotes/origin/main
3c8955c614a4425231ef8cd867c61e8aed0e2a74
$ git count-objects -v
count: 3
size: 12
in-pack: 0
packs: 0
...
```

3 ta loose obyekt: Ali'ning commit'i, tree'si va `README.md` blob'i ([14–16-boblar](14-obyektlar-blob.md)). Endi `fetch`:

```bash
$ git fetch origin
From ../server
   3c8955c..9bca200  main       -> origin/main
```

Chiqish qatori formati `<belgi> <xulosa> <qayerdan> -> <qayerga>`: serverdagi `main` sizdagi `origin/main` ga yozildi, u `3c8955c` dan `9bca200` ga surildi. Belgi bo'sh joy — oddiy fast-forward yangilanish. Boshqa belgilar: `*` yangi ref, `+` majburiy (forced) yangilanish, `-` o'chirilgan (prune), `t` teg yangilandi, `!` rad etildi, `=` o'zgarmagan (faqat `-v` bilan ko'rinadi).

**Keyin** holat:

```bash
$ cat .git/refs/remotes/origin/main
9bca2004399606c68fabbd28296b08a79ede5d0a
$ git count-objects -v
count: 6
size: 24
...
```

Uchta yangi obyekt keldi. Qaysilar ekanini tekshiramiz:

```bash
$ find .git/objects -type f | sort
.git/objects/0d/c01d901b3e2e105bd6237be143c0f36d0149d7
.git/objects/3c/8955c614a4425231ef8cd867c61e8aed0e2a74
.git/objects/4f/30aad0d7bfe8d762b78e2575629696f9922547
.git/objects/7e/25ac1d69f782572177aae70966bbc18cc6dc1f
.git/objects/9b/ca2004399606c68fabbd28296b08a79ede5d0a
.git/objects/d1/7e03064dfa669e25c3f75e988df80fe5ae8fe5
$ git cat-file -p 9bca200
tree 7e25ac1d69f782572177aae70966bbc18cc6dc1f
parent 3c8955c614a4425231ef8cd867c61e8aed0e2a74
author Vali Aliyev <vali@example.com> 1791349800 +0500
committer Vali Aliyev <vali@example.com> 1791349800 +0500

Kitoblar ro'yxatini qo'shish
```

Yangi uchtasi: `9bca200` (commit), `7e25ac1` (uning tree'si), `d17e030` (`kitoblar.txt` blob'i). `README.md` blob'i (`4f30aad`) qayta kelmadi — Ali'da u allaqachon bor edi. Git'ning tarmoq protokoli aynan shuni hisoblaydi: "senda nima bor, menda nima bor — farqini yuboraman" ([29-bob](29-fetch-push-ichidan.md)).

Shuningdek `fetch` `.git/FETCH_HEAD` faylini yozadi:

```bash
$ cat .git/FETCH_HEAD
9bca2004399606c68fabbd28296b08a79ede5d0a	not-for-merge	branch 'main' of ../server
```

Bu fayl — oxirgi `fetch` nimani olib kelganining ro'yxati. `git pull` aynan shu fayldan "nimani birlashtirish kerak"ligini o'qiydi. `not-for-merge` belgisi — Ali'ning `main` branch'iga hali upstream belgilanmagan, shuning uchun Git bu ref'ni birlashtirish uchun nomzod deb bilmaydi.

Eng muhimi — Ali'ning ishi o'zgarmagan:

```bash
$ git status
On branch main
nothing to commit, working tree clean
```

`main` hali `3c8955c` da. Yangi commit faqat `origin/main` orqali ko'rinadi.

## Kod: olib kelinganni ko'rish va birlashtirish

[19-bob](19-revision-tanlash.md)dagi oraliq sintaksisi bilan "serverda bor, menda yo'q" narsani ko'ramiz:

```bash
$ git log --oneline main..origin/main
9bca200 Kitoblar ro'yxatini qo'shish
$ git diff main origin/main --stat
 kitoblar.txt | 1 +
 1 file changed, 1 insertion(+)
```

Hammasi joyida bo'lsa — oddiy `merge` ([21-bob](21-branch-va-merge.md)). `origin/main` boshqa har qanday branch kabi merge qilinadi:

```bash
$ git merge origin/main
Updating 3c8955c..9bca200
Fast-forward
 kitoblar.txt | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 kitoblar.txt
```

Ali'ning tarafida yangi commit yo'q edi, shuning uchun fast-forward: `main` shunchaki oldinga surildi.

Har safar remote nomi va branch yozmaslik uchun Ali o'z `main` iga upstream belgilaydi. Eng oson yo'li — `push -u`:

```bash
$ git push -u origin main
Everything up-to-date
branch 'main' set up to track 'origin/main'.
$ sed -n '/branch/,$p' .git/config
[branch "main"]
	remote = origin
	merge = refs/heads/main
$ git status
On branch main
Your branch is up to date with 'origin/main'.
```

Endi `git status` remote bilan solishtiradi. Upstream, `-u` va `--set-upstream-to` [28-bob](28-remote-branchlar.md)da to'liq ko'riladi.

## Kod: push rad etildi — tarix ajraldi

Endi real hayotdagi eng ko'p uchraydigan holat. Ali va Vali bir vaqtda ishlaydi:

```text
Ali:   ...9bca200---0e4e6f7  "README ga muallif qo'shish"
Vali:  ...9bca200---5a3175a  "Birinchi kitob"
```

Ali birinchi bo'lib push qiladi:

```bash
$ git push
To ../server.git
   9bca200..0e4e6f7  main -> main
```

Vali undan keyin:

```bash
$ git push
To ../server.git
 ! [rejected]        main -> main (fetch first)
error: failed to push some refs to '../server.git'
hint: Updates were rejected because the remote contains work that you do not
hint: have locally. This is usually caused by another repository pushing to
hint: the same ref. If you want to integrate the remote changes, use
hint: 'git pull' before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details.
```

Nega rad etildi? Serverdagi `main` hozir `0e4e6f7` da. Vali uni `5a3175a` ga surmoqchi, lekin `5a3175a` — `0e4e6f7` ning avlodi emas. Agar server buni qabul qilsa, Ali'ning commit'i hech qaysi branch'dan ko'rinmay qoladi va oxir-oqibat `gc` bilan o'chiriladi. Shuning uchun `push` faqat fast-forward'ga ruxsat beradi.

```text
Serverda:            9bca200---0e4e6f7        ← main
Vali yubormoqchi:    9bca200---5a3175a
                     (0e4e6f7 tarixdan tushib qolardi)
```

Vali avval olib keladi va holatni ko'radi:

```bash
$ git fetch
From ../server
   9bca200..0e4e6f7  main       -> origin/main
$ git status
On branch main
Your branch and 'origin/main' have diverged,
and have 1 and 1 different commits each, respectively.
  (use "git pull" if you want to integrate the remote branch with yours)
```

"Diverged" — tarix ikki tomonga ajralgan: Vali'da serverda yo'q 1 commit, serverda Vali'da yo'q 1 commit.

## Kod: `git pull` — ajralgan tarixni qanday birlashtirish

`git pull` = `git fetch` + birlashtirish. Lekin birlashtirishning bir necha usuli bor va Git siz uchun tanlamaydi:

```bash
$ git pull
hint: You have divergent branches and need to specify how to reconcile them.
hint: You can do so by running one of the following commands sometime before
hint: your next pull:
hint:
hint:   git config pull.rebase false  # merge
hint:   git config pull.rebase true   # rebase
hint:   git config pull.ff only       # fast-forward only
hint:
hint: You can replace "git config" with "git config --global" to set a default
hint: preference for all repositories. You can also pass --rebase, --no-rebase,
hint: or --ff-only on the command line to override the configured default per
hint: invocation.
fatal: Need to specify how to reconcile divergent branches.
```

v2.56 ma'lumotnomasiga ko'ra `git pull` ning to'rt yo'li bor:

| Buyruq | Nima qiladi | Natija |
| --- | --- | --- |
| `git pull --ff-only` | Faqat fast-forward; ajralgan bo'lsa — xato | Tarix chiziqli, lekin ish to'xtaydi |
| `git pull --rebase` | `fetch` + `rebase` ([24-bob](24-rebase.md)) | Sizning commit'laringiz remote'ning ustiga qayta yoziladi |
| `git pull --no-rebase` | `fetch` + `merge` | Merge commit paydo bo'ladi |
| `git pull --squash` | `fetch` + `merge --squash` | O'zgarishlar index'da, commit siz qilasiz |

Hech biri sozlanmagan va tarix ajralmagan bo'lsa — Git fast-forward qiladi. Tarix ajralgan bo'lsa — yuqoridagi xato. Rasmiy hujjat buni "`--ff-only` — standart, agar ajralgan tarixni birlashtirish usuli berilmagan bo'lsa" deb ta'riflaydi.

> **Pro Git bilan farq.** Pro Git "Git 2.27 dan boshlab `pull.rebase` sozlanmagan bo'lsa ogohlantirish chiqadi" deydi. Hozirgi (2.56) xatti-harakat qat'iyroq: tarix ajralgan va usul tanlanmagan bo'lsa, bu ogohlantirish emas, **xato** (`fatal`), hech narsa birlashtirilmaydi. Tarix ajralmagan bo'lsa esa sozlamasiz ham jim fast-forward qiladi.

`--ff-only` ajralgan tarixda:

```bash
$ git pull --ff-only
hint: Diverging branches can't be fast-forwarded, you need to either:
hint:
hint: 	git merge --no-ff
hint:
hint: or:
hint:
hint: 	git rebase
hint:
hint: Disable this message with "git config set advice.diverging false"
fatal: Not possible to fast-forward, aborting.
```

**Variant 1 — merge** (`--no-rebase`). Vali'ning repo nusxasida:

```bash
$ git pull --no-rebase
Merge made by the 'ort' strategy.
 README.md | 1 +
 1 file changed, 1 insertion(+)
$ git log --oneline --graph
*   bde482f Merge branch 'main' of ../server
|\
| * 0e4e6f7 README ga muallif qo'shish
* | 5a3175a Birinchi kitob
|/
* 9bca200 Kitoblar ro'yxatini qo'shish
* 3c8955c Boshlang'ich commit
```

Haqiqiy tarix saqlandi — ikki kishi parallel ishlagani grafda ko'rinadi. Kamchiligi: har `pull` da "Merge branch 'main' of ..." commit'lari to'planib, tarixni o'qishni qiyinlashtiradi.

**Variant 2 — rebase** (`--rebase`). Asl `vali` repo'sida:

```bash
$ git log --oneline --graph --all
* 5a3175a Birinchi kitob
| * 0e4e6f7 README ga muallif qo'shish
|/
* 9bca200 Kitoblar ro'yxatini qo'shish
* 3c8955c Boshlang'ich commit
$ git pull --rebase
Successfully rebased and updated refs/heads/main.
$ git log --oneline --graph
* 049b1a7 Birinchi kitob
* 0e4e6f7 README ga muallif qo'shish
* 9bca200 Kitoblar ro'yxatini qo'shish
* 3c8955c Boshlang'ich commit
```

Vali'ning commit'i `0e4e6f7` ustiga qayta qo'yildi va **yangi hash** oldi (`5a3175a` → `049b1a7`): ota-commit o'zgardi, demak commit obyekti ham boshqa ([16-bob](16-commit-obyekti.md)). Tarix chiziqli. Endi push fast-forward bo'ladi:

```bash
$ git status
On branch main
Your branch is ahead of 'origin/main' by 1 commit.
  (use "git push" to publish your local commits)
$ git push
To ../server.git
   0e4e6f7..049b1a7  main -> main
```

Rebase faqat hali **push qilinmagan** commit'lar uchun xavfsiz — bu yerda `5a3175a` hech qachon serverga chiqmagan, shuning uchun muammo yo'q. Rasmiy hujjat `--rebase` haqida ogohlantiradi: bu tarixni qayta yozadi, allaqachon e'lon qilingan tarix uchun ishlatmang ([24-bob](24-rebase.md)dagi oltin qoida).

Har safar flag yozmaslik uchun tanlovni sozlamaga yozing:

```bash
$ git config pull.rebase true
$ git config --get pull.rebase
true
```

| Sozlama | Ma'nosi |
| --- | --- |
| `pull.rebase=false` | `pull` merge qiladi |
| `pull.rebase=true` | `pull` rebase qiladi |
| `pull.rebase=merges` | rebase, lekin lokal merge commit'lar saqlanadi (`--rebase-merges`) |
| `pull.rebase=interactive` | interaktiv rebase ([25-bob](25-tarixni-qayta-yozish.md)) |
| `pull.ff=only` | faqat fast-forward |
| `pull.ff=false` | doim merge commit, hatto fast-forward mumkin bo'lsa ham |
| `pull.autoStash=true` | `pull` dan oldin lokal o'zgarishlarni avtomatik stash qilib, keyin qaytaradi |
| `branch.<nom>.rebase` | bitta branch uchun `pull.rebase` ni almashtiradi |

`pull.autoStash` ayniqsa rebase bilan foydali: merge qiluvchi `pull` to'qnashmaydigan lokal o'zgarishlarga chidaydi, rebase qiluvchi `pull` esa har qanday lokal o'zgarish bo'lsa ishlamaydi.

## Kod: argumentsiz `pull` va `push` qachon ishlamaydi

Argumentsiz `git pull` joriy branch'ning upstream'idan oladi. Upstream yo'q bo'lsa:

```bash
$ git switch -c tajriba
$ git pull
There is no tracking information for the current branch.
Please specify which branch you want to merge with.
See git-pull(1) for details.

    git pull <remote> <branch>

If you wish to set tracking information for this branch you can do so with:

    git branch --set-upstream-to=origin/<branch> tajriba

$ git push
fatal: The current branch tajriba has no upstream branch.
To push the current branch and set the remote as upstream, use

    git push --set-upstream origin tajriba

To have this happen automatically for branches without a tracking
upstream, see 'push.autoSetupRemote' in 'git help config'.
```

Ikkala xabar ham yechimni aytadi. `push.autoSetupRemote` va `push.default` [28-bob](28-remote-branchlar.md)da.

Argumentsiz `git pull` qanday qaror qilishini rasmiy hujjat shunday tushuntiradi:

1. Qaysi remote: `branch.<joriy>.remote`, u bo'lmasa — `origin`.
2. Nimani olish: `remote.<remote>.fetch` refspec'lari.
3. Nimani birlashtirish: `branch.<joriy>.merge` (bo'lsa). Refspec glob (`*`) bo'lsa va `merge` yozilmagan bo'lsa — hech narsa birlashtirilmaydi.

`git pull origin next` kabi aniq yozilsa — `next` olib kelinadi, vaqtincha `FETCH_HEAD` ga yoziladi, `origin/next` ham yangilanadi va joriy branch'ga birlashtiriladi. Bu `git fetch origin` + `git merge origin/next` bilan bir xil.

## Kod: remote'ni ko'zdan kechirish — `git remote show`

```bash
$ git remote show origin
* remote origin
  Fetch URL: ../server.git
  Push  URL: ../server.git
  HEAD branch: main
  Remote branch:
    main tracked
  Local branch configured for 'git pull':
    main merges with remote main
  Local ref configured for 'git push':
    main pushes to main (local out of date)
```

Bu buyruq remote'ga **ulanadi** (ichkarida `git ls-remote` qiladi) va bir joyda ko'rsatadi:

- URL'lar;
- `HEAD branch` — remote'ning standart branch'i;
- remote branch'lar va ularning holati: `tracked` (kuzatilmoqda), `new (next fetch will store in remotes/origin)` (serverda yangi, hali olib kelinmagan), `stale (use 'git remote prune' to remove)` (serverda o'chirilgan, sizda qolgan);
- qaysi lokal branch `pull` da nima bilan birlashadi;
- qaysi lokal branch `push` da qayerga ketadi va holati: `up to date`, `fast-forwardable`, `local out of date` (siz orqadasiz).

Tarmoqqa ulanmasdan, oxirgi `fetch` ma'lumoti bilan — `git remote show -n origin`.

Ali haqiqatan orqada edi; `pull` fast-forward qiladi:

```bash
$ git status
On branch main
Your branch is behind 'origin/main' by 1 commit, and can be fast-forwarded.
  (use "git pull" to update your local branch)
$ git pull
Updating 0e4e6f7..049b1a7
Fast-forward
 kitoblar.txt | 1 +
 1 file changed, 1 insertion(+)
```

Remote'ga ulanib, uning ref'larini to'g'ridan-to'g'ri ko'rish — `git ls-remote`. U hech narsa yozmaydi, faqat ko'rsatadi:

```bash
$ git ls-remote bobur-fork
049b1a75c914c5366a20ac50831fc7aa95dbbe0b	HEAD
049b1a75c914c5366a20ac50831fc7aa95dbbe0b	refs/heads/main
7f3156eef86a4b510856d59eef4b6c4292858b49	refs/heads/tarjima
```

## Kod: bir nechta remote

Bobur ismli hamkasb loyihaning nusxasini o'zida yuritadi (`bobur.git`) va unda `tarjima` branch'ini boshlagan. Ali uning ishini ko'rmoqchi:

```bash
$ git remote add bobur ../bobur.git
$ git remote
bobur
origin
$ git fetch bobur
From ../bobur
 * [new branch]      main       -> bobur/main
 * [new branch]      tarjima    -> bobur/tarjima
$ git branch -r
  bobur/HEAD -> bobur/main
  bobur/main
  bobur/tarjima
  origin/HEAD -> origin/main
  origin/main
```

Har remote o'z nomlar maydoniga ega — `refs/remotes/bobur/` va `refs/remotes/origin/` aralashmaydi:

```bash
$ find .git/refs/remotes -type f | sort
.git/refs/remotes/bobur/HEAD
.git/refs/remotes/bobur/main
.git/refs/remotes/bobur/tarjima
.git/refs/remotes/origin/HEAD
.git/refs/remotes/origin/main
```

`bobur/HEAD` va `origin/HEAD` — remote'ning standart branch'iga symbolic ref ([17-bob](17-reflar-va-head.md)). U tufayli `origin/main` o'rniga qisqa `origin` deb yozish mumkin. `origin/HEAD` Ali'da `clone` siz paydo bo'ldi — buni `fetch` ning yangi xatti-harakati (`fetch.followRemoteHEAD`) qildi, [28-bob](28-remote-branchlar.md)da ko'riladi.

Bobur'ning ishi `main` dan nimasi bilan farq qiladi:

```bash
$ git log --oneline main..bobur/tarjima
7f3156e Inglizcha README
049b1a7 Birinchi kitob
```

(`049b1a7` ham chiqdi, chunki Ali hali `pull` qilmagan paytda tekshirildi.) Endi `git merge bobur/tarjima` yoki undan lokal branch ochish — [28-bob](28-remote-branchlar.md).

### Remote guruhlari

Bir nechta remote'dan birdan olish:

```bash
$ git config remotes.hammasi 'origin bobur'
$ git fetch hammasi
Fetching origin
Fetching bobur
From ../bobur
 * [new branch]      main       -> bobur/main
 * [new branch]      tarjima    -> bobur/tarjima
```

Shuningdek:

- `git fetch --all` — barcha remote'lar (`remote.<nom>.skipFetchAll=true` bo'lganlaridan tashqari);
- `git remote update` — `remotes.default` guruhi, u bo'lmasa `remote.<nom>.skipDefaultUpdate` belgilanmagan barcha remote'lar;
- `git push hammasi` — har remote'ga ketma-ket alohida push. `--atomic` guruh bilan ishlamaydi (atomarlik faqat bitta ulanish ichida kafolatlanadi); bitta remote xato bersa ham qolganlariga push davom etadi, lekin chiqish kodi nol bo'lmaydi.

## Kod: nomini o'zgartirish va o'chirish

```bash
$ git remote rename bobur bobur-fork
$ git branch -r
  bobur-fork/HEAD -> bobur-fork/main
  bobur-fork/main
  bobur-fork/tarjima
  origin/HEAD -> origin/main
  origin/main
$ sed -n '/bobur/,$p' .git/config
[remote "bobur-fork"]
	url = ../bobur.git
	fetch = +refs/heads/*:refs/remotes/bobur-fork/*
```

`rename` faqat nomni emas, **hamma** bog'liq narsani o'zgartiradi: config bo'limi, refspec'ning o'ng tomoni va `refs/remotes/` ichidagi ref'lar. Bu remote'ni kuzatayotgan lokal branch'larning `branch.<nom>.remote` qiymati ham yangilanadi.

O'chirish — `git remote remove` (yoki qisqa `rm`):

```bash
$ git remote remove bobur-fork
$ git branch -r
  origin/HEAD -> origin/main
  origin/main
$ git remote
origin
```

`remove` remote'ning konfiguratsiyasini **va** barcha remote-tracking branch'larini o'chiradi. Obyektlar esa `.git/objects` da qoladi — ularga endi hech qanday ref ko'rsatmasa, keyingi `gc` ularni tozalaydi ([18-bob](18-packfile-va-gc.md)). Agar Bobur'ning commit'idan lokal branch ochgan bo'lsangiz, u saqlanadi.

Chiqish kodlari skriptlar uchun foydali: remote topilmasa — `2`, `add` da remote allaqachon bor bo'lsa — `3`.

## Kod: o'qish va yozish uchun alohida URL

```bash
$ git remote set-url --push bobur ../yoq.git
$ git remote -v
bobur	../bobur.git (fetch)
bobur	../yoq.git (push)
origin	../server.git (fetch)
origin	../server.git (push)
```

`--push` bilan faqat `pushurl` o'zgaradi. `set-url` ning boshqa shakllari:

| Buyruq | Nima qiladi |
| --- | --- |
| `git remote set-url <nom> <yangi>` | Birinchi URL'ni almashtiradi |
| `git remote set-url <nom> <yangi> <eski-regex>` | Regex'ga mos URL'ni almashtiradi |
| `git remote set-url --add <nom> <url>` | Qo'shimcha URL qo'shadi |
| `git remote set-url --delete <nom> <regex>` | Mos URL'larni o'chiradi (hammasini o'chirib bo'lmaydi) |
| `git remote get-url [--push] [--all] <nom>` | URL'ni ko'rsatadi (`insteadOf` ochilgan holda) |

Bir nechta `url` (yoki `pushurl`) bo'lsa, `push` **hammasiga** yuboradi, `fetch` esa faqat **birinchisidan** oladi. Hujjat muhim cheklovni aytadi: push URL va fetch URL bitta joyni ko'rsatishi kerak — push qilganingizni darhol fetch qilsangiz, o'sha narsani ko'rishingiz kerak. Bir joydan olib, boshqa joyga yozmoqchi bo'lsangiz (masalan, asl loyihadan olib, o'z fork'ingizga yozish) — **ikki alohida remote** qiling ([28-bob](28-remote-branchlar.md)dagi `pushRemote`).

### URL qisqartmalari: `insteadOf`

Ko'p repo bitta serverda bo'lsa, URL boshini qisqartirish mumkin:

```bash
$ git config url.../.insteadOf "srv:"
$ git ls-remote --heads srv:server.git
049b1a75c914c5366a20ac50831fc7aa95dbbe0b	refs/heads/main
```

`srv:server.git` avtomatik `../server.git` ga aylandi. Haqiqiy hayotda: `git config --global url."git@github.com:".insteadOf "https://github.com/"` — barcha GitHub HTTPS manzillari SSH orqali ishlaydi. Faqat push uchun almashtirish — `pushInsteadOf`.

## Muhandislik nuqtai nazari: `fetch` + `merge` yoki `pull`

`pull` qulay, lekin ikki amalni ko'r-ko'rona birlashtiradi. Amaliy qoida:

- **Tez-tez `git fetch` qiling** — u hech narsani buzmaydi. Keyin `git status` yoki `git log --oneline main..origin/main` bilan qarang.
- **`pull` xatti-harakatini aniq sozlang.** `pull.rebase=true` (shaxsiy branch'larda chiziqli tarix) yoki `pull.ff=only` (kutilmagan merge commit'lardan himoya). Sozlanmagan `pull` ajralgan tarixda to'xtaydi — bu yaxshi, lekin vaqt oladi.
- **Jamoada bitta kelishuv bo'lsin.** Biri merge, biri rebase qilsa, tarix aralash ko'rinadi.
- **Konflikt bo'lsa** — `pull` merge yoki rebase holatida to'xtaydi. Davom etish yoki bekor qilish — `git merge --abort` / `git rebase --abort` ([22-bob](22-konfliktlar.md)).

## Muhandislik nuqtai nazari: push qoidalari

v2.56 `git push` hujjatining "PUSH RULES" bo'limi:

1. Maqsad **branch** (`refs/heads/*`) bo'lsa — faqat fast-forward; manba commit bo'lishi shart.
2. Maqsad **teg** (`refs/tags/*`) bo'lsa — mavjud tegni yangilash umuman rad etiladi (yangi teg yaratish mumkin).
3. Boshqa ref'lar uchun — murakkabroq qoidalar (tree/blob bilan yangilash rad etiladi).

Yaratish va o'chirish odatda ruxsat etilgan. `--force` yoki refspec oldidagi `+` bu qoidalarni chetlab o'tadi, lekin ikki istisno bor: branch'ga commit bo'lmagan obyektni majburlab ham qo'yib bo'lmaydi va server sozlamasi (`receive.denyNonFastForwards`, `receive.denyDeletes`) yoki hook taqiqlagan narsani `--force` o'tkaza olmaydi. Majburiy push'ning xavfsiz shakli (`--force-with-lease`) — [29-bob](29-fetch-push-ichidan.md).

## Muhandislik nuqtai nazari: `fetch` ma'lumot sizdirishi mumkin

Rasmiy hujjatdagi "SECURITY" bo'limi ogohlantiradi: `fetch` va `push` protokollari bir repo'dagi ma'lumotni boshqa repo'dagi yashirin ma'lumotdan himoya qilish uchun mo'ljallanmagan. Agar repo'da maxfiy tarix bo'lsa, uni alohida repo'ga ajrating. Server tomonidagi ruxsatlar (kim nimani o'qishi mumkin) — repo darajasida, branch darajasida emas.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `git fetch` dan keyin "hech narsa o'zgarmadi" deb o'ylash | `fetch` faqat `origin/*` ni yangilaydi, lokal branch joyida | `git status`, `git log main..origin/main`, keyin `merge`/`rebase` |
| `push` rad etilganda `--force` bilan bosish | Hamkasbning commit'lari serverdan "yo'qoladi" | `git pull --rebase` (yoki merge), keyin oddiy `push` |
| Sozlanmagan `pull` xatosini e'tiborsiz qoldirish | Har safar to'xtaydi, tasodifiy flag tanlanadi | `git config --global pull.rebase true` yoki `pull.ff only` — ongli tanlov |
| Push qilingan commit'larni `pull --rebase` bilan qayta yozish | Boshqalar ishlayotgan tarix o'zgaradi | Rebase faqat push qilinmagan commit'lar uchun |
| Ishchi (non-bare) repo'ning checkout qilingan branch'iga push | `remote rejected ... (branch is currently checked out)` — index va working tree mos kelmay qolardi | Server sifatida `git init --bare` |
| Remote'ni o'chirib qayta qo'shish (URL o'zgarganda) | Upstream sozlamalari yo'qoladi | `git remote set-url` |
| Bitta remote'ga turli joyni ko'rsatuvchi `url` va `pushurl` | `fetch` siz push qilganni ko'rmaydi, holat chalkashadi | Ikki alohida remote, `branch.<nom>.pushRemote` |
| `git push origin/main` deb yozish | `origin/main` remote nomi deb tushuniladi | `git push origin main` (bo'sh joy bilan); 2.56 bu xato uchun maslahat chiqaradi |

Checkout qilingan branch'ga push urinishining haqiqiy chiqishi (qisqartirilgan):

```bash
$ git push ish main
remote: error: refusing to update checked out branch: refs/heads/main
remote: error: By default, updating the current branch in a non-bare repository
remote: is denied, because it will make the index and work tree inconsistent
remote: with what you pushed, and will require 'git reset --hard' to match
remote: the work tree to HEAD.
...
To ../ish-papka
 ! [remote rejected] main -> main (branch is currently checked out)
error: failed to push some refs to '../ish-papka'
```

`[rejected]` (sizning Git'ingiz yubormadi — fast-forward emas) va `[remote rejected]` (server qabul qilmadi — hook yoki `receive.*` sozlamasi) farqiga e'tibor bering.

## Amaliyot

1. `server.git` (bare), `ali/` va `vali/` repo'larini yarating. Ali'da `git remote add`, Vali'da `git clone` ishlating. Ikkalasining `.git/config` dagi `[remote "origin"]` bo'limini solishtiring.
2. Vali commit qilib push qilsin. Ali'da `fetch` dan oldin va keyin `cat .git/refs/remotes/origin/main`, `git count-objects -v` va `cat .git/FETCH_HEAD` ni yozib oling. Qaysi obyektlar kelganini `git cat-file -t` bilan aniqlang.
3. Ikkalangiz bir vaqtda commit qiling, keyin ikkinchi push'ning rad etilishini ko'ring. Bir nusxada `pull --no-rebase`, ikkinchisida `pull --rebase` qilib, `git log --graph` natijalarini solishtiring.
4. `pull.ff=only` sozlab, ajralgan tarixda `git pull` nima qilishini tekshiring.
5. Ikkinchi remote qo'shing, `fetch` qiling, `rename` qiling va `.git/refs/remotes/` va `.git/config` qanday o'zgarganini kuzating. Keyin `remove` qilib, ref'lar o'chganini, obyektlar esa qolganini (`git cat-file -t <hash>`) tasdiqlang.
6. `git remote show origin` ni Ali orqada, oldinda va teng bo'lgan holatlarda ishlating — `push` qatoridagi holat qanday o'zgaradi?
7. `remotes.<guruh>` guruhini yarating va `git fetch <guruh>` qiling. Keyin `insteadOf` bilan qisqa URL prefiksi o'rnatib, `git remote get-url` va `git ls-remote` bilan tekshiring.
8. (Qiyinroq) Non-bare repo'ga push qilishga urining, xatoni o'qing. Keyin o'sha repo'da `git config receive.denyCurrentBranch updateInstead` qilib qayta push qiling — working tree ham yangilandimi? Bu rejim qachon xavfli bo'lishi mumkinligini `git help config` dan topib tushuntiring.

## Rasmiy hujjat

- Pro Git — Working with Remotes: <https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes>
- `git remote`: <https://git-scm.com/docs/git-remote>
- `git fetch`: <https://git-scm.com/docs/git-fetch>
- `git pull`: <https://git-scm.com/docs/git-pull>
- `git push`: <https://git-scm.com/docs/git-push>
- `git ls-remote`: <https://git-scm.com/docs/git-ls-remote>
- Git 2.56 reliz eslatmalari: <https://github.com/git/git/blob/v2.56.0/Documentation/RelNotes/2.56.0.adoc>
