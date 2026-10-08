# 20 — Branch — bu ko'rsatkich

[← Oldingi: Revision'larni tanlash](19-revision-tanlash.md) · [Mundarija](README.md) · [Keyingi: Branch yaratish va merge →](21-branch-va-merge.md)

## Tushuncha

Ko'p versiya nazorati tizimlarida "branch" (tarmoq) — loyihaning alohida nusxasi: asosiy chiziqdan ajralib, boshqa ish qilish uchun hamma fayllar boshqa papkaga ko'chiriladi. Git'da bunday emas. Git'da **branch — bitta commit'ga qaratilgan, siljiydigan ko'rsatkich (pointer)**. Boshqa hech narsa emas.

Buni tushunish uchun III qismdagi modelni eslaymiz ([13–19-boblar](13-plumbing-va-porcelain.md)):

- **blob** — bitta faylning mazmuni ([14-bob](14-obyektlar-blob.md));
- **tree** — papka: qaysi nom qaysi blob yoki ichki tree ekani ([15-bob](15-tree-va-index.md));
- **commit** — loyihaning ma'lum paytdagi to'liq surati (snapshot): ildiz tree'ga ko'rsatkich, muallif, xabar va **ota commit(lar)** ([16-bob](16-commit-obyekti.md)). Birinchi commit'ning otasi yo'q, oddiy commit'ning bitta otasi bor, merge commit'ning ikki yoki undan ko'p otasi bo'ladi;
- **ref** — commit hash'ini saqlaydigan oddiy fayl, `HEAD` esa boshqa ref'ga ishora qiluvchi **symbolic ref** ([17-bob](17-reflar-va-head.md)).

Branch — aynan shu ref'ning bir turi: `.git/refs/heads/<nom>` fayli, ichida 40 belgili commit hash'i va qator oxiri. Siz commit qilganingizda Git yangi commit obyektini yozadi va **joriy branch faylidagi hash'ni yangi commit'ga almashtiradi** — branch "oldinga siljiydi".

```text
            HEAD
             │
             ▼
            main
             │
             ▼
  2307bca ← d65e625 ← c5ccad8
  (ota yo'q)
```

Strelkalar orqaga qarab turibdi: har commit o'z **otasini** biladi, ota esa bolalarini bilmaydi. Shuning uchun branch faqat **eng oxirgi** commit'ni (uchini, inglizcha *tip*) ko'rsatsa yetarli — qolgan tarix ota zanjiri bo'ylab topiladi.

`main` (eski repo'larda `master`) hech qanday maxsus branch emas. U shunchaki `git init` birinchi branch'ga beradigan nom ([3-bob](03-birinchi-sozlash.md), `init.defaultBranch`). Uni o'chirish, qayta nomlash, boshqa nom bilan ishlash mumkin — Git uchun barcha branch'lar teng.

## Nega shunday: nega Git'da branch yaratish bir zumda bo'ladi

Branch yaratish — bitta kichik fayl yozish: 40 ta hex belgi va `\n`, jami **41 bayt**. Loyiha 10 fayldan iboratmi yoki 100 000 fayldanmi — farqi yo'q, chunki hech qanday fayl nusxalanmaydi. Snapshot'lar allaqachon `.git/objects` ichida bor, yangi branch shunchaki ulardan biriga yangi "yorliq" osadi.

Eski tizimlarda (masalan, butun papkani nusxalaydigan VCS'larda) branch yaratish loyiha hajmiga qarab soniyalar yoki daqiqalar olardi. Natijada odamlar branch'dan qochishardi. Git'da esa branch arzon, shuning uchun uni har bir kichik vazifa uchun ochish odatiy hol.

Ikkinchi sabab — **ota yozuvi**. Har commit otasini saqlagani uchun ikki branch qayerda ajralganini (umumiy ajdodini) Git avtomatik topa oladi. Bu merge'ni oson qiladi ([21-bob](21-branch-va-merge.md)). Arzon yaratish + oson birlashtirish — Git'da branch'lardan ko'p foydalanishni rag'batlantiradigan ikki asos.

## Kod: birinchi commit — beshta obyekt

Bo'sh papkada uch fayl yaratib, commit qilamiz:

```bash
$ git init
$ echo "# Kutubxona" > README.md
$ echo "console.log('salom')" > app.js
$ echo "MIT" > LICENSE
$ git add README.md app.js LICENSE
$ git commit -m "Birinchi commit"
```

`add` har fayl uchun blob yozadi, `commit` ildiz papka uchun tree va commit obyektini yozadi:

```text
$ git cat-file -p HEAD
tree 12dd77e7b45e7bb687073ba5181359c1c2e6e749
author Ali Valiyev <ali@example.com> 1791349200 +0500
committer Ali Valiyev <ali@example.com> 1791349200 +0500

Birinchi commit

$ git cat-file -p HEAD^{tree}
100644 blob a22a2da24d1ceeef3d0c2f1f4f68923f55b8d4cc	LICENSE
100644 blob 4f30aad0d7bfe8d762b78e2575629696f9922547	README.md
100644 blob 65c316e92d4cf5d094222cbeab25b5e64ffbdf66	app.js

$ find .git/objects -type f | sort
.git/objects/12/dd77e7b45e7bb687073ba5181359c1c2e6e749
.git/objects/23/07bca339ea08e04ac42039e915ab0da2294bca
.git/objects/4f/30aad0d7bfe8d762b78e2575629696f9922547
.git/objects/65/c316e92d4cf5d094222cbeab25b5e64ffbdf66
.git/objects/a2/2a2da24d1ceeef3d0c2f1f4f68923f55b8d4cc
```

Beshta obyekt: uchta blob (fayl mazmunlari), bitta tree (qaysi nom qaysi blob) va bitta commit (`2307bca`, ildiz tree'ga ko'rsatkich va metama'lumot). Birinchi commit'da `parent` qatori yo'q.

Yana ikki commit qilamiz:

```bash
$ echo "function qidir() {}" >> app.js
$ git commit -am "Qidiruv funksiyasi"
$ echo "function royxat() {}" >> app.js
$ git commit -am "Ro'yxat funksiyasi"
```

```text
$ git log --oneline
c5ccad8 Ro'yxat funksiyasi
d65e625 Qidiruv funksiyasi
2307bca Birinchi commit

$ git cat-file -p HEAD
tree 4689aee8ea9b05be249d4f2bf24c3f8b4a2d4995
parent d65e625f34d66f430ef20e0271062d5f941bd7f6
author Ali Valiyev <ali@example.com> 1791349800 +0500
committer Ali Valiyev <ali@example.com> 1791349800 +0500

Ro'yxat funksiyasi
```

Endi `main` qayerda turibdi? Ikki faylni o'qish yetarli:

```text
$ cat .git/HEAD
ref: refs/heads/main
$ cat .git/refs/heads/main
c5ccad86d8bca7ce858c4e680efd20319009feda
```

`HEAD` → `refs/heads/main` → `c5ccad8` → (ota) `d65e625` → (ota) `2307bca`. Mana butun "branch".

## Kod: yangi branch yaratish

```bash
$ git branch testing
```

Bu buyruq hech narsani chiqarmaydi va **joriy commit'ga** qaratilgan yangi ko'rsatkich yaratadi. `.git` ichida nima paydo bo'lganini ko'ramiz:

```text
$ ls -la .git/refs/heads
-rw-r--r--  1 ...  41 ... main
-rw-r--r--  1 ...  41 ... testing

$ cat .git/refs/heads/testing
c5ccad86d8bca7ce858c4e680efd20319009feda
$ wc -c .git/refs/heads/testing
      41 .git/refs/heads/testing
```

Yangi fayl — 41 bayt, ichida `main` bilan **bir xil** hash. Hech qanday obyekt yaratilmadi, hech qanday fayl nusxalanmadi.

Muhim: `git branch` faqat **yaratadi**, unga o'tkazmaydi. `HEAD` hali ham `main`ni ko'rsatadi:

```text
$ cat .git/HEAD
ref: refs/heads/main
$ git symbolic-ref HEAD
refs/heads/main
```

`git log --decorate` (zamonaviy Git'da terminalda standart yoqilgan) har commit yonida unga qaragan ref'larni ko'rsatadi:

```text
$ git log --oneline --decorate
c5ccad8 (HEAD -> main, testing) Ro'yxat funksiyasi
d65e625 Qidiruv funksiyasi
2307bca Birinchi commit
```

`HEAD -> main` — "HEAD `main`ga ishora qiladi" degani. `testing` ham shu commit'da, lekin HEAD unga ulanmagan.

```text
$ git branch
* main
  testing
```

Yulduzcha — joriy branch, ya'ni `HEAD` ishora qilayotgan branch.

```text
            HEAD
             │
             ▼
            main
             │
             ▼
  2307bca ← d65e625 ← c5ccad8
                         ▲
                         │
                      testing
```

### `git branch` ichida nima bo'ladi

`git branch testing` — aslida ikki ishni bajaradi: ref faylini yozadi va reflog'ga yozuv qo'shadi. Ref faylini xuddi shunday plumbing buyrug'i bilan ham yozish mumkin ([17-bob](17-reflar-va-head.md)):

```text
$ git update-ref refs/heads/qolda HEAD
$ git branch
* main
  qolda
  testing
```

Natija bir xil — Git uchun `qolda` ham to'laqonli branch. (Uni `git branch -D qolda` bilan o'chirib qo'yamiz.)

Branch reflog'i — har o'zgarish jurnali — `.git/logs/refs/heads/` ichida:

```text
$ cat .git/logs/refs/heads/testing
0000000000000000000000000000000000000000 c5ccad86d8bca7ce858c4e680efd20319009feda Ali Valiyev <ali@example.com> 1791349200 +0500	branch: Created from main
```

Eski qiymat nollar (branch yo'q edi), yangi qiymat `c5ccad8`. Reflog'ni [42-bobda](42-reflog-va-tiklash.md) batafsil ko'ramiz.

### Boshqa nuqtadan branch yaratish

Ikkinchi argument — boshlang'ich nuqta (*start-point*): branch nomi, commit hash'i, teg yoki har qanday revision ([19-bob](19-revision-tanlash.md)).

```bash
$ git branch eski-versiya v1.0       # teg'dan
$ git branch tuzatish HEAD~2         # ikki commit orqadan
```

Maxsus holat: `A...B` boshlang'ich nuqta sifatida A va B'ning **umumiy ajdodini** (merge base) bildiradi, agar u bitta bo'lsa. Bir tomonini tashlab ketsangiz, `HEAD` olinadi.

```text
$ git branch asos main...testing
$ git rev-parse asos
c5ccad86d8bca7ce858c4e680efd20319009feda
```

## Kod: branch'ga o'tish — `git switch`

```text
$ git switch testing
Switched to branch 'testing'
$ cat .git/HEAD
ref: refs/heads/testing
```

`switch` ning birinchi ishi — `.git/HEAD` faylidagi matnni almashtirish. Ikkinchi ishi — index va working tree'ni yangi branch'ning snapshot'iga moslash (bu safar ikkalasi bir commit'da, shuning uchun fayllar o'zgarmadi).

Endi commit qilamiz:

```text
$ echo "// test" >> app.js
$ git commit -am "Testing'da o'zgarish"
[testing 2cd6c35] Testing'da o'zgarish
 1 file changed, 1 insertion(+)

$ cat .git/refs/heads/testing .git/refs/heads/main
2cd6c357ec88fd1b20790f81b3f638622576f946
c5ccad86d8bca7ce858c4e680efd20319009feda
```

Faqat `testing` fayli o'zgardi — chunki `HEAD` aynan unga ishora qilardi. `main` joyida qoldi. Bu Git'ning asosiy qoidasi: **commit HEAD ishora qilgan branch'ni siljitadi, boshqalarini emas.**

```text
                       main
                        │
                        ▼
  2307bca ← d65e625 ← c5ccad8 ← 2cd6c35
                                   ▲
                                   │
                                testing ◄── HEAD
```

Endi `main`ga qaytamiz:

```text
$ git switch main
Switched to branch 'main'
$ cat .git/HEAD
ref: refs/heads/main
$ cat app.js
console.log('salom')
function qidir() {}
function royxat() {}
```

`// test` qatori g'oyib bo'ldi — u yo'qolmadi, `2cd6c35` commit'ida turibdi. `switch` working tree'ni `main` snapshot'iga qaytardi: Git kerakli fayllarni qo'shadi, o'chiradi va o'zgartiradi.

> **`git log` hamma branch'ni ko'rsatmaydi.** Hozir `git log` ishlatsangiz, `testing` dagi commit chiqmaydi — Git standart holatda faqat `HEAD`dan orqaga yetib boriladigan commit'larni ko'rsatadi. Boshqa branch tarixi uchun nomini bering (`git log testing`), hammasi uchun `--all` qo'shing.

```text
$ git log --oneline
c5ccad8 Ro'yxat funksiyasi
d65e625 Qidiruv funksiyasi
2307bca Birinchi commit

$ git log testing --oneline
2cd6c35 Testing'da o'zgarish
c5ccad8 Ro'yxat funksiyasi
...
```

## Kod: tarix ajraladi

`main`da ham commit qilamiz:

```text
$ echo "// main" >> README.md
$ git commit -am "Main'da boshqa o'zgarish"
[main 44c9c64] Main'da boshqa o'zgarish
 1 file changed, 1 insertion(+)

$ git log --oneline --decorate --graph --all
* 44c9c64 (HEAD -> main) Main'da boshqa o'zgarish
| * 2cd6c35 (testing) Testing'da o'zgarish
|/
* c5ccad8 Ro'yxat funksiyasi
* d65e625 Qidiruv funksiyasi
* 2307bca Birinchi commit
```

Tarix **ajraldi** (diverged): `c5ccad8`dan ikki yo'l chiqdi. Ikkala o'zgarish ham alohida branch'da izolyatsiya qilingan; ular orasida bemalol o'tish va tayyor bo'lganda birlashtirish mumkin. Bularning hammasi uchta buyruq bilan qilindi: `branch`, `switch`, `commit`.

`--graph --all` — kundalik ishda eng foydali kombinatsiya. Ko'pchilik uni alias qilib oladi ([12-bob](12-teglar-va-aliaslar.md)).

`HEAD` reflog'i esa har o'tishni yozib boradi:

```text
$ cat .git/logs/HEAD
... c5ccad8... c5ccad8...  ...	checkout: moving from main to testing
c5ccad8... 2cd6c35...  ...	commit: Testing'da o'zgarish
2cd6c35... c5ccad8...  ...	checkout: moving from testing to main
c5ccad8... 44c9c64...  ...	commit: Main'da boshqa o'zgarish
```

## Kod: switch himoyasi — saqlanmagan o'zgarishlar

Branch almashtirish working tree'ni o'zgartirgani uchun Git sizning saqlanmagan ishingizni yo'qotmaslikka harakat qiladi. Qoida (`git switch` hujjatidan): toza working tree **talab qilinmaydi**, lekin o'tish lokal o'zgarishlarni yo'qotadigan bo'lsa, buyruq to'xtaydi.

`app.js` ikki branch'da farq qiladi. Uni o'zgartirib, o'tib ko'ramiz:

```text
$ echo "// ishlayapman" >> app.js
$ git switch testing
error: Your local changes to the following files would be overwritten by checkout:
	app.js
Please commit your changes or stash them before you switch branches.
Aborting
```

Hech narsa o'zgarmadi — `HEAD` ham, fayl ham. Endi branch'lar orasida **farq qilmaydigan** faylni o'zgartirsak:

```text
$ echo "Copyright" >> LICENSE
$ git switch testing
Switched to branch 'testing'
M	LICENSE
```

O'zgarish yangi branch'ga "olib o'tildi" — chunki `LICENSE` ikkala branch'da bir xil, uni almashtirishga hojat yo'q edi. Bu tez-tez chalkashtiradi: o'zgarish branch'ga "tegishli" emas, u working tree'da yashaydi va commit qilinmaguncha hech qaysi branch'ga yozilmagan.

### `switch -m`: o'zgarishni o'zi bilan olib o'tish

`-m` (`--merge`) bilan Git to'qnashadigan lokal o'zgarishlarni avtomatik stash qiladi, o'tadi va qaytadan qo'llaydi. Qo'llashda konflikt chiqsa, Git 2.56 stash'ni ro'yxatda saqlab qoladi (bu xatti-harakat 2.54 da qo'shilgan; avval faqat bitta urinish berilardi):

```text
$ git switch -m testing
Your local changes are stashed, however applying them
resulted in conflicts.  You can either resolve the conflicts
and then discard the stash with "git stash drop", or, if you
do not want to resolve them now, run "git reset --hard" and
apply the local changes later by running "git stash pop".

Switched to branch 'testing'
The following paths have local changes:
M	app.js

$ git stash list
stash@{0}: autostash while switching to 'testing'

$ cat app.js
console.log('salom')
function qidir() {}
function royxat() {}
<<<<<<< testing
// test
=======
// ishlayapman
>>>>>>> local
```

Konflikt belgilarini [22-bobda](22-konfliktlar.md) batafsil ko'ramiz. Hozircha xulosa: odatda o'tishdan oldin commit qiling yoki `git stash` ([38-bob](38-stash-va-clean.md)) ishlating — bu eng oldindan aytib bo'ladigan yo'l.

Teskari opsiya `--discard-changes` (qisqasi `-f`) — lokal o'zgarishlarni **tashlab yuborib** o'tadi. Bu xavfli: commit qilinmagan, stash qilinmagan ish qaytarib bo'lmaydigan tarzda yo'qoladi.

## Kod: `switch` ning boshqa shakllari

### Yaratish va o'tish birga: `-c`

```text
$ git switch -c tuzatish HEAD~2
Switched to a new branch 'tuzatish'
$ cat .git/HEAD
ref: refs/heads/tuzatish
$ cat .git/refs/heads/tuzatish
d65e625f34d66f430ef20e0271062d5f941bd7f6
```

`git switch -c <yangi> [<start>]` — `git branch <yangi> [<start>]` + `git switch <yangi>` ning **tranzaksion** birikmasi: agar o'tish muvaffaqiyatsiz bo'lsa, branch ham yaratilmaydi. `-C` esa mavjud branch'ni ham majburan `<start>`ga qayta o'rnatadi (`git branch -f` + `switch`).

Eski yo'l — `git checkout -b <yangi>` — hamon ishlaydi va eski maqolalarda ko'p uchraydi:

```text
$ git checkout -b eski-uslub
Switched to a new branch 'eski-uslub'
```

### Oldingi branch'ga qaytish: `-`

```text
$ git switch -
Switched to branch 'testing'
$ git switch -
Switched to branch 'main'
```

`-` — `@{-1}` ning qisqa shakli: "oxirgi o'tgan branch". `@{-N}` — N-chi oldingi. Ular `HEAD` reflog'idagi `checkout: moving from ... to ...` yozuvlaridan hisoblanadi:

```text
$ git rev-parse --symbolic-full-name @{-1}
refs/heads/testing
```

### Detached HEAD: branch'siz commit'ga o'tish

`git switch` argument sifatida **branch** kutadi. Commit hash'ini bersangiz, rad etadi:

```text
$ git switch d65e625
fatal: a branch is expected, got commit 'd65e625'
hint: If you want to detach HEAD at the commit, try again with the --detach option.
```

Bu ataylab qilingan himoya. `--detach` bilan esa:

```text
$ git switch --detach HEAD~1
HEAD is now at 2307bca Birinchi commit
$ cat .git/HEAD
2307bca339ea08e04ac42039e915ab0da2294bca
$ git branch
* (HEAD detached at 2307bca)
  main
  testing
  tuzatish
$ git branch --show-current
$
```

Endi `.git/HEAD`da `ref: ...` emas, to'g'ridan-to'g'ri hash turibdi — HEAD **hech qaysi branch'ga ulanmagan** ([17-bob](17-reflar-va-head.md)). Bu holatda commit qilish mumkin, lekin yangi commit'ni hech qaysi branch ko'rsatmaydi — faqat HEAD:

```text
$ echo x > tajriba.txt && git add tajriba.txt
$ git commit -m "Tajriba"
$ git switch main
Warning: you are leaving 1 commit behind, not connected to
any of your branches:

  f726605 Tajriba

If you want to keep it by creating a new branch, this may be a good time
to do so with:

 git branch <new-branch-name> f726605

Switched to branch 'main'
```

Git ogohlantiradi: `f726605` endi hech qaysi ref'dan yetib bo'lmaydi. U darhol o'chmaydi — reflog'da bir muddat saqlanadi va `gc` uni keyinroq tozalaydi ([18-bob](18-packfile-va-gc.md), [42-bob](42-reflog-va-tiklash.md)). Saqlab qolish uchun detached holatdayoq `git switch -c <nom>` qiling yoki ogohlantirishdagi `git branch` buyrug'ini ishlating.

Detached HEAD qachon foydali: eski versiyani ko'rib chiqish, `bisect` ([41-bob](41-blame-va-bisect.md)), rebase jarayoni ichida ([24-bob](24-rebase.md)), tez tajriba.

### Bo'sh tarixli branch: `--orphan`

```text
$ git switch --orphan sahifalar
Switched to a new branch 'sahifalar'
$ cat .git/HEAD
ref: refs/heads/sahifalar
$ ls .git/refs/heads
main
testing
tuzatish
$ git log
fatal: your current branch 'sahifalar' does not have any commits yet
```

`HEAD` `refs/heads/sahifalar`ga ishora qiladi, lekin bunday fayl **hali yo'q** — branch "tug'ilmagan" (*unborn*). Barcha kuzatiladigan fayllar working tree'dan olib tashlanadi. Birinchi commit otasiz bo'ladi va shu paytda ref fayli paydo bo'ladi. Yangi repo'dagi `main` ham birinchi commit'gacha xuddi shunday holatda turadi. Foydalanish: hujjat sayti uchun alohida tarix (`gh-pages`), butunlay boshqa mazmun.

## Muhandislik nuqtai nazari: branch har doim ham fayl emas

"Branch = `.git/refs/heads/` dagi fayl" — tushunish uchun to'g'ri model, lekin Git ref'larni boshqa joyda ham saqlay oladi.

**`packed-refs`.** Ref'lar ko'p bo'lsa, Git ularni bitta faylga yig'adi ([17-bob](17-reflar-va-head.md), [18-bob](18-packfile-va-gc.md)). `gc` buni avtomatik qiladi:

```text
$ git pack-refs --all
$ ls .git/refs/heads
$ cat .git/packed-refs
# pack-refs with: peeled fully-peeled sorted
44c9c645abc3ed11d4b12ab930443605a348b6b3 refs/heads/main
2cd6c357ec88fd1b20790f81b3f638622576f946 refs/heads/testing
d65e625f34d66f430ef20e0271062d5f941bd7f6 refs/heads/tuzatish
```

`refs/heads/` papkasi bo'sh, lekin branch'lar joyida. Keyingi commit `main` uchun yana alohida loose fayl yozadi va u `packed-refs`dagi yozuvdan ustun turadi.

**`reftable`.** Git 3.0 da yangi repo'lar uchun standart ref formati `reftable` bo'ladi (`BreakingChanges` hujjati) — u yerda `refs/heads/main` degan fayl umuman bo'lmaydi.

**Xulosa:** skriptlarda `.git/refs/heads/...` faylini to'g'ridan-to'g'ri o'qimang yoki yozmang. `git rev-parse <branch>`, `git symbolic-ref HEAD`, `git update-ref`, `git for-each-ref` ishlating — ular har qanday saqlash formatida to'g'ri ishlaydi. Bobdagi `cat` buyruqlari faqat modelni ko'rsatish uchun.

## Muhandislik nuqtai nazari: branch nomlari

Branch nomi ref nomi bo'lgani uchun `git check-ref-format` qoidalariga bo'ysunadi: bo'sh joy, `..`, `~`, `^`, `:`, `?`, `*`, `[`, `\` bo'lishi mumkin emas, `-` bilan boshlanmaydi, `/` bilan tugamaydi, `.lock` bilan tugamaydi va hokazo.

```text
$ git branch "yangi..nom"
fatal: 'yangi..nom' is not a valid branch name
hint: See 'git help check-ref-format'
hint: Disable this message with "git config set advice.refSyntax false"

$ git check-ref-format --branch "feature/login"
feature/login
$ git check-ref-format --branch "feature login"
fatal: 'feature login' is not a valid branch name
```

`/` ruxsat etilgan va jamoalarda keng qo'llanadi: `feature/login`, `fix/123-email`. Diskda bu `refs/heads/feature/login` — ya'ni `feature` **papkasi** ichidagi fayl. Shu sababli bir vaqtda `feature` branch'i va `feature/login` branch'i bo'la olmaydi: `feature` ham fayl, ham papka bo'lolmaydi.

Mavjud nom bilan yaratish rad etiladi — `git branch` mavjud branch'ni jimgina qayta yozmaydi:

```text
$ git branch testing
fatal: a branch named 'testing' already exists
```

## Muhandislik nuqtai nazari: `switch` va `checkout`

Pro Git (2-nashr) misollarining ko'pi `git checkout` bilan yozilgan. `checkout` ikki xil ishni bajaradi: branch almashtirish **va** fayllarni tiklash. Bu chalkashlikka sabab bo'lgani uchun Git 2.23 da u ikkiga bo'lindi:

| Vazifa | Hozirgi buyruq | Eski buyruq |
| --- | --- | --- |
| Branch'ga o'tish | `git switch <branch>` | `git checkout <branch>` |
| Yaratib o'tish | `git switch -c <yangi>` | `git checkout -b <yangi>` |
| Commit'ga detached o'tish | `git switch --detach <commit>` | `git checkout <commit>` |
| Faylni tiklash | `git restore <fayl>` ([11-bob](11-bekor-qilish.md)) | `git checkout -- <fayl>` |

Git 2.51 relizida `switch` va `restore` rasman "eksperimental emas" deb e'lon qilindi. `checkout` o'chirilmaydi va ishlayveradi, lekin yangi kodda `switch`/`restore` tushunarliroq: `switch` hech qachon faylni jimgina ustidan yozmaydi, commit hash'ini berib tasodifan detached holatga tushirmaydi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `git branch yangi` qilib, darhol ishlay boshlash | `branch` faqat yaratadi; commit'lar eski branch'ga tushadi | `git switch -c yangi` yoki `git branch` dan keyin `git switch` |
| Branch'ni "fayllar nusxasi" deb o'ylash | Saqlanmagan o'zgarishlar branch'lar orasida "ko'chib yuradi" deb hayron qolasiz | Branch — commit'ga ko'rsatkich; commit qilinmagan ish working tree'da yashaydi |
| Detached HEAD'da commit qilib, boshqa branch'ga o'tib ketish | Commit'ga hech qaysi ref qaramaydi, `gc` uni o'chiradi | Darhol `git switch -c <nom>`; o'tib ketgan bo'lsangiz — reflog ([42-bob](42-reflog-va-tiklash.md)) |
| `git log`da branch ko'rinmasa, "yo'qoldi" deb o'ylash | `log` faqat HEAD tarixini ko'rsatadi | `git log --oneline --graph --all` |
| `git switch -f` bilan "to'siqni" chetlab o'tish | Commit qilinmagan o'zgarishlar qaytarib bo'lmaydigan tarzda o'chadi | Avval commit yoki `git stash` |
| Skriptda `cat .git/refs/heads/main` | `packed-refs` yoki `reftable`da fayl yo'q bo'lishi mumkin | `git rev-parse main` |
| `feature` va `feature/x` branch'larini birga yaratish | Fayl va papka nomi to'qnashadi | Izchil prefiks: `feature/a`, `feature/b` |

## Amaliyot

1. Yangi repo yarating, uchta fayl bilan birinchi commit qiling. `find .git/objects -type f` bilan beshta obyekt borligini, `git cat-file -t` bilan har birining turini tekshiring.
2. `git branch testing` dan oldin va keyin `ls .git/refs/heads` va `cat .git/HEAD` ni solishtiring. Qaysi fayl paydo bo'ldi, qaysi biri o'zgarmadi?
3. `testing`ga o'ting, commit qiling. Ikkala branch faylini `cat` bilan o'qing va qaysi biri siljiganini tushuntiring.
4. Tarixni ajrating (har branch'da bittadan commit) va `git log --oneline --graph --all` chizgan rasmni qog'ozda `A---B---C` uslubida qayta chizing.
5. Ikki branch'da farq qiladigan faylni o'zgartirib `git switch` qiling — xatoni ko'ring. Keyin farq qilmaydigan faylni o'zgartirib o'ting — o'zgarish "ko'chib o'tganini" ko'ring va sababini tushuntiring.
6. `git switch --detach HEAD~1` qiling, commit yarating, `main`ga qayting. Ogohlantirishdagi hash bilan commit'ni `git branch qutqarildi <hash>` orqali tiklang.
7. (Qiyinroq) Faqat plumbing bilan branch yarating va unga o'ting: `git update-ref refs/heads/plumbing HEAD` va `git symbolic-ref HEAD refs/heads/plumbing`. `git status` va `git branch` natijasi `git switch -c` bilan bir xilmi? Working tree nima uchun o'zgarmadi va qachon bu farq muhim bo'ladi?

## Rasmiy hujjat

- Pro Git — Branches in a Nutshell: <https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell>
- `git branch`: <https://git-scm.com/docs/git-branch>
- `git switch`: <https://git-scm.com/docs/git-switch>
- `git check-ref-format`: <https://git-scm.com/docs/git-check-ref-format>
