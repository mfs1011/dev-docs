# 32 — Taqsimlangan workflow'lar

[← Oldingi: Branch bilan ishlash uslublari](31-branch-workflowlari.md) · [Mundarija](README.md) · [Keyingi: Loyihaga hissa qo'shish →](33-hissa-qoshish.md)

## Tushuncha

[31-bobda](31-branch-workflowlari.md) bitta repo **ichidagi** branch'larni qanday tashkil qilishni ko'rdik. Endi savol kengroq: bir nechta odam, bir nechta repo — o'zgarishlar **kimdan kimga**, qaysi yo'l bilan oqadi?

Markazlashgan tizimlarda (CVCS — Centralized Version Control System, masalan Subversion) javob bitta. Bitta markaziy server (**hub** — markaz) bor, har dasturchi esa unga ulangan **tugun** (node): hamma o'z ishini shu bitta joy bilan sinxronlaydi.

Git'da esa ([1-bob](01-versiya-nazorati.md)) har klon — to'liq repo. Pro Git buni shunday ifodalaydi: Git'da har dasturchi **potentsial ravishda ham tugun, ham markaz**. U boshqa repo'larga kod yubora oladi va o'zi ham ommaviy repo yuritishi mumkin — boshqalar uning ustiga ish quradi va unga hissa qo'shadi. Shu sababli jamoa tuzilishi juda ko'p xil bo'lishi mumkin.

Pro Git uchta keng tarqalgan andozani (paradigmani) ko'rsatadi:

| Workflow | Kim qayerga yozadi | Kimlar uchun |
| --- | --- | --- |
| **Markazlashgan** (centralized) | Hamma bitta umumiy repo'ga | Kichik va o'rta jamoalar, kompaniya ichida |
| **Integratsiya menejeri** (integration-manager) | Har kim o'z ommaviy repo'siga; asosiy repo'ga faqat maintainer | Ochiq loyihalar, GitHub/GitLab'dagi fork modeli |
| **Diktator va leytenantlar** (dictator and lieutenants) | Dasturchilar → leytenantlar → diktator → etalon repo | Juda katta, ierarxik loyihalar (Linux yadrosi) |

Ularni bittasini tanlash ham, aralashtirib ishlatish ham mumkin. Rasmiy `gitworkflows` hujjati esa boshqa o'qni qo'shadi — o'zgarish **qanday shaklda** uzatiladi:

- **merge workflow** — branch'lar repo'dan repo'ga nusxalanadi (`push`, `fetch`, `pull`); to'liq tarix, merge commit'lar bilan birga, o'tadi;
- **patch workflow** — o'zgarishlar email orqali patch sifatida yuboriladi (`format-patch`, `send-email`, `am`); merge commit'lar o'tmaydi.

Bu bobda uchala andozani lokal bare repo'lar va bir nechta klon bilan **haqiqiy** repo'larda yurgizamiz, keyin merge va patch farqini ko'ramiz. Hissa qo'shuvchining batafsil qadamlari — [33-bob](33-hissa-qoshish.md), maintainer tomoni — [34-bob](34-loyihani-yuritish.md), GitHub'dagi fork va pull request — [35-bob](35-github-fork-va-pr.md).

## Nega shunday: nega Git bitta workflow'ni majburlamaydi

Git'da uchta texnik fakt bor va hamma workflow'lar shulardan kelib chiqadi:

1. **Har klon teng huquqli.** "Asosiy" repo — bu texnik tushuncha emas, **kelishuv**: jamoa shu repo'ni rasmiy deb hisoblaydi. Git uchun u boshqa nusxalardan farq qilmaydi ([27-bob](27-remote.md)).
2. **Bir repo'da istalgancha remote bo'lishi mumkin.** Siz bitta repo'dan o'qib, boshqasiga yozishingiz mumkin. Maintainer o'nta hissa qo'shuvchining repo'sini remote qilib qo'sha oladi.
3. **Yozish huquqi — server darajasida.** Git'ning o'zi kim qayerga push qila olishini boshqarmaydi; buni server (SSH ruxsatlari, GitHub sozlamalari, hook'lar) hal qiladi. Workflow aslida "kimga qaysi repo'ga yozish huquqi berilgan" degan savolga javob.

Shu uch fakt bilan bir xil Git buyruqlaridan butunlay turli tashkiliy tuzilmalar quriladi: hamma bitta repo'ga yozadi (markazlashgan), har kim faqat o'zinikiga (integratsiya menejeri) yoki ko'p bosqichli zanjir (diktator). Git ularning hech birini "to'g'ri" demaydi.

## Kod: markazlashgan workflow

Bitta markaziy repo; hamma undan klon qiladi va unga push qiladi. Pro Git ta'kidlaydi: agar jamoangiz shu modelga o'rgangan bo'lsa, Git bilan ham bemalol davom ettirish mumkin — bitta repo yarating va hammaga push huquqi bering. **Git foydalanuvchilarga bir-birining ishini ustidan yozib yuborishga yo'l qo'ymaydi.**

```text
              ┌──────────────────────┐
              │   umumiy repo (hub)  │
              └──────────────────────┘
               ▲  │      ▲  │      ▲  │
          push │  │ fetch│  │      │  │
               │  ▼      │  ▼      │  ▼
            ┌─────┐   ┌─────┐   ┌──────┐
            │ Ali │   │Jasur│   │Malika│
            └─────┘   └─────┘   └──────┘
```

Tajriba: bare server va uchta dasturchi. Ali loyihani boshlaydi, Jasur va Malika klon qiladi.

```bash
$ git init --bare server.git
Initialized empty Git repository in .../32-markaziy/server.git/
$ git clone server.git ali
Cloning into 'ali'...
warning: You appear to have cloned an empty repository.
done.
$ cd ali
$ # ... "Loyiha boshlandi"
$ git push -q origin main
$ cd ..
$ git clone -q server.git jasur
$ git clone -q server.git malika
```

Pro Git'dagi ssenariy: ikki dasturchi bir vaqtda ish boshlaydi. Birinchisi tugatib push qiladi — muammo yo'q:

```bash
$ cd jasur
$ # ... "Savat sahifasi" (muallif: Jasur Karimov)
$ git push origin main
To .../32-markaziy/server.git
   5a670be..8db562f  main -> main
```

Ikkinchisi push qilmoqchi bo'ladi, lekin push rad etiladi:

```bash
$ cd ../malika
$ # ... "To'lov sahifasi" (muallif: Malika Olimova)
$ git push origin main
To .../32-markaziy/server.git
 ! [rejected]        main -> main (fetch first)
error: failed to push some refs to '.../32-markaziy/server.git'
hint: Updates were rejected because the remote contains work that you do not
hint: have locally. This is usually caused by another repository pushing to
hint: the same ref. If you want to integrate the remote changes, use
hint: 'git pull' before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details.
```

Bu — workflow'ning yuragi: serverdagi `main` faqat **fast-forward** bilan yangilanadi ([27-bob](27-remote.md)dagi push qoidalari). `[rejected]` belgisi — Malika'ning Git'i serverdagi ref'ni ko'rib, o'zi yubormagani ([27-bob](27-remote.md)dagi `[rejected]` va `[remote rejected]` farqi). Malika'ning commit'i Jasur'nikining avlodi emas, demak qabul qilinsa Jasur'ning ishi tarixdan tushib qolardi. Malika avval boshqalarning ishini olib, o'zinikiga birlashtirishi kerak:

```bash
$ git fetch
From .../32-markaziy/server
   5a670be..8db562f  main       -> origin/main
$ git log --oneline --graph --all --decorate
* d7bd831 (HEAD -> main) To'lov sahifasi
| * 8db562f (origin/main, origin/HEAD) Savat sahifasi
|/  
* 5a670be Loyiha boshlandi
$ git merge --no-edit origin/main
Merge made by the 'ort' strategy.
 savat.txt | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 savat.txt
$ git push origin main
To .../32-markaziy/server.git
   8db562f..9d806bb  main -> main
$ git log --oneline --graph --all --decorate
*   9d806bb (HEAD -> main, origin/main, origin/HEAD) Merge remote-tracking branch 'origin/main'
|\  
| * 8db562f Savat sahifasi
* | d7bd831 To'lov sahifasi
|/  
* 5a670be Loyiha boshlandi
```

Endi serverda ikkalasining ishi bor — hech kim hech kimni ustidan yozmadi:

```bash
$ git log --format='%h %an: %s' origin/main
9d806bb Malika Olimova: Merge remote-tracking branch 'origin/main'
d7bd831 Malika Olimova: To'lov sahifasi
8db562f Jasur Karimov: Savat sahifasi
5a670be Ali Valiyev: Loyiha boshlandi
```

Jasur keyingi safar yangiliklarni oladi. Uning `main`i serverdagining ajdodi, shuning uchun oddiy fast-forward:

```bash
$ cd ../jasur
$ git pull --ff-only
From .../32-markaziy/server
   8db562f..9d806bb  main       -> origin/main
Updating 8db562f..9d806bb
Fast-forward
 tolov.txt | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 tolov.txt
```

Merge o'rniga `git pull --rebase` bilan chiziqli tarix ham olish mumkin — ikkala yo'l va `pull.rebase`/`pull.ff` sozlamalari [27-bob](27-remote.md)da.

Pro Git qo'shimcha qiladi: bu model faqat kichik jamoalar uchun emas. Git'ning branch modeli tufayli **yuzlab** dasturchi bitta loyihada **o'nlab** branch orqali bir vaqtda muvaffaqiyatli ishlay oladi. Ya'ni markazlashgan workflow + [31-bob](31-branch-workflowlari.md)dagi topic branch'lar — ko'p kompaniyalarning kundalik tanlovi. GitHub'dagi "shared repository" modeli ([35-bob](35-github-fork-va-pr.md)) ham aynan shu: bitta repo, hamma push qila oladi, lekin topic branch'larda ishlab, PR orqali birlashtiriladi.

## Kod: integratsiya menejeri workflow'i

Git bir nechta remote'ga ruxsat bergani uchun boshqa model mumkin: har dasturchi **o'z ommaviy repo'siga** yozish huquqiga ega va **boshqalarnikini o'qiy** oladi. Odatda bitta **kanonik** (rasmiy) repo bo'ladi — "rasmiy" loyiha. Unga faqat **integratsiya menejeri** (maintainer — loyihani yurituvchi) yozadi.

Pro Git'dagi olti qadam:

1. Maintainer o'z ommaviy repo'siga push qiladi.
2. Hissa qo'shuvchi shu repo'ni klon qiladi va o'zgartiradi.
3. Hissa qo'shuvchi o'z ommaviy nusxasiga push qiladi.
4. Hissa qo'shuvchi maintainer'ga "o'zgarishlarimni oling" degan xat yuboradi.
5. Maintainer hissa qo'shuvchining repo'sini remote qilib qo'shadi va lokal merge qiladi.
6. Maintainer birlashtirilgan o'zgarishlarni asosiy repo'ga push qiladi.

```text
   ommaviy (hamma o'qiydi)                     ommaviy (hamma o'qiydi)
  ┌─────────────────────┐                    ┌──────────────────────┐
  │ loyiha.git          │                    │ dilnoza-ommaviy.git  │
  │ kanonik repo        │                    │ Dilnoza'ning nusxasi │
  └─────────────────────┘                    └──────────────────────┘
     ▲             │                            ▲            │
     │ (6) push    │ (2) clone                  │ (3) push   │ (5) fetch
     │             └────────────────┐           │            │
  ┌──┴──────────────┐            ┌──▼───────────┴──┐         │
  │ Ali (maintainer)│◀── (4) ────│ Dilnoza         │         │
  │ lokal repo      │  "pull     │ lokal repo      │         │
  └─────────────────┘  qiling"   └─────────────────┘         │
     ▲                  xati                                 │
     └───────────────────────────────────────────────────────┘
       (5) Ali Dilnoza'ning repo'sini remote qilib, lokal merge qiladi
```

Repo'lar:

```text
32-integratsiya/
├── loyiha.git/            ← kanonik repo (faqat Ali yozadi)
├── ali/                   ← maintainer'ning ishchi repo'si
├── dilnoza-ommaviy.git/   ← Dilnoza'ning ommaviy repo'si (faqat Dilnoza yozadi)
└── dilnoza/               ← Dilnoza'ning ishchi repo'si
```

**1-qadam.** Maintainer loyihani kanonik repo'ga chiqaradi:

```bash
$ git init --bare loyiha.git
Initialized empty Git repository in .../32-integratsiya/loyiha.git/
$ git clone -q loyiha.git ali
warning: You appear to have cloned an empty repository.
$ cd ali
$ # ... "Kutubxona: asosiy funksiyalar"
$ git push -q origin main
```

**2–3-qadamlar.** Dilnoza'ning `loyiha.git`ga yozish huquqi yo'q. U kanonik repo'ni klon qiladi va o'zi uchun **ommaviy nusxa** yaratadi. Server tomonda bu odatda `git clone --bare` (GitHub'dagi "Fork" tugmasi aynan shuni qiladi — [35-bob](35-github-fork-va-pr.md)):

```bash
$ git clone -q loyiha.git dilnoza
$ git clone --bare loyiha.git dilnoza-ommaviy.git
Cloning into bare repository 'dilnoza-ommaviy.git'...
done.
$ cd dilnoza
$ git remote add ommaviy ../dilnoza-ommaviy.git
$ git remote -v
ommaviy	../dilnoza-ommaviy.git (fetch)
ommaviy	../dilnoza-ommaviy.git (push)
origin	.../32-integratsiya/loyiha.git (fetch)
origin	.../32-integratsiya/loyiha.git (push)
```

Ikki remote: `origin` — o'qish uchun (kanonik), `ommaviy` — yozish uchun (o'ziniki). Ish topic branch'da:

```bash
$ git switch -c sana-format
Switched to a new branch 'sana-format'
$ # ... "Sanani ISO 8601 formatida chiqarish", "Sana formati uchun testlar"
$ git push ommaviy sana-format
To ../dilnoza-ommaviy.git
 * [new branch]      sana-format -> sana-format
```

**4-qadam.** Maintainer'ga xabar. Git'da buning uchun tayyor buyruq bor — `git request-pull <start> <URL> [<end>]`. U "`<start>` dan (maintainer'da allaqachon bor commit) `<end>` gacha bo'lgan o'zgarishlarni `<URL>` dagi repo'dan oling" degan matnni standart chiqishga yozadi. Bu matnni email'ga qo'yasiz:

```bash
$ git request-pull origin/main ../dilnoza-ommaviy.git sana-format
The following changes since commit 175aaceb5ae22f4c31cf6b72a2037cf1896dc19a:

  Kutubxona: asosiy funksiyalar (2026-10-07 10:01:00 +0500)

are available in the Git repository at:

  ../dilnoza-ommaviy.git sana-format

for you to fetch changes up to d448ac1c5e9f083e59ce31e3a4dae45ace25d386:

  Sana formati uchun testlar (2026-10-07 10:03:00 +0500)

----------------------------------------------------------------
Dilnoza Rahimova (2):
      Sanani ISO 8601 formatida chiqarish
      Sana formati uchun testlar

 sana.txt | 2 ++
 1 file changed, 2 insertions(+)
 create mode 100644 sana.txt
```

Ichida hamma kerakli narsa: asos commit (maintainer o'zida borligini tekshira oladi), qayerdan olish (URL va branch), oxirgi commit hash'i (keyin kimdir branch'ni o'zgartirsa, maintainer sezadi), commit'lar ro'yxati va `diffstat`. Hujjatga ko'ra matn branch tavsifi bilan boshlanadi — u `git branch --edit-description` bilan yoziladi (bu yerda tavsif yo'q, shuning uchun chiqmadi). `-p` opsiyasi patch matnini ham qo'shadi. To'liq ish jarayoni — [33-bob](33-hissa-qoshish.md).

> **Muhim.** Avval push, keyin `request-pull`. Buyruq URL'dagi repo'da `<end>` commit'i borligini tekshiradi. Bobur push qilinmagan commit bilan uringanda (chiqish boshi):
>
> ```text
> warn: No match for commit ce3160d7570d1e66b1a4a289045bc75783b3bc3d found at ../bobur-ommaviy.git
> warn: Are you sure you pushed 'xato-matni' there?
> ```
>
> Bu faqat ogohlantirish — matn baribir chiqadi va chiqish kodi 0. Uni e'tiborsiz yuborsangiz, maintainer xatdagi commit'ni topa olmaydi.

**5-qadam.** Maintainer o'z ishini davom ettirgan (Dilnoza'ni kutib o'tirmagan). Xat kelgach, Dilnoza'ning repo'sini remote qilib qo'shadi va **avval ko'rib chiqadi**:

```bash
$ cd ../ali
$ # ... Ali'ning o'z commit'i: "Hujjat yangilandi"
$ git remote add dilnoza ../dilnoza-ommaviy.git
$ git fetch dilnoza
From ../dilnoza-ommaviy
 * [new branch]      main        -> dilnoza/main
 * [new branch]      sana-format -> dilnoza/sana-format
$ git log --oneline main..dilnoza/sana-format
d448ac1 Sana formati uchun testlar
6508ee7 Sanani ISO 8601 formatida chiqarish
$ git diff --stat main...dilnoza/sana-format
 sana.txt | 2 ++
 1 file changed, 2 insertions(+)
```

`main..X` — X'da bor, `main`da yo'q commit'lar; `main...X` bilan `diff` — umumiy ajdoddan beri X'da nima o'zgargani, ya'ni Ali'ning o'z yangi commit'lari aralashmaydi ([19-bob](19-revision-tanlash.md)). Hammasi joyida — merge:

```bash
$ git merge --no-ff --no-edit dilnoza/sana-format
Merge made by the 'ort' strategy.
 sana.txt | 2 ++
 1 file changed, 2 insertions(+)
 create mode 100644 sana.txt
$ git log --oneline --graph --all --decorate
*   ca843ef (HEAD -> main) Merge remote-tracking branch 'dilnoza/sana-format'
|\  
| * d448ac1 (dilnoza/sana-format) Sana formati uchun testlar
| * 6508ee7 Sanani ISO 8601 formatida chiqarish
* | a946d90 Hujjat yangilandi
|/  
* 175aace (origin/main, dilnoza/main, dilnoza/HEAD) Kutubxona: asosiy funksiyalar
```

**6-qadam.** Kanonik repo'ga:

```bash
$ git push origin main
To .../32-integratsiya/loyiha.git
   175aace..ca843ef  main -> main
```

Dilnoza kanonik repo'dan yangilanadi va topic branch'ni ikkala joyda tozalaydi:

```bash
$ cd ../dilnoza
$ git switch main
Switched to branch 'main'
Your branch is up to date with 'origin/main'.
$ git pull --ff-only
From .../32-integratsiya/loyiha
   175aace..ca843ef  main       -> origin/main
Updating 175aace..ca843ef
Fast-forward
 kutubxona.txt | 1 +
 sana.txt      | 2 ++
 2 files changed, 3 insertions(+)
 create mode 100644 sana.txt
$ git branch -d sana-format
Deleted branch sana-format (was d448ac1).
$ git push ommaviy --delete sana-format
To ../dilnoza-ommaviy.git
 - [deleted]         sana-format
```

E'tibor bering: `main`dan oldin "Your branch is up to date with 'origin/main'" — bu faqat **oxirgi ko'rilgan** `origin/main` bilan solishtirish edi; `pull` haqiqiy yangilikni olib keldi ([28-bob](28-remote-branchlar.md)).

### Bir martalik `git pull <URL> <branch>`

Har hissa qo'shuvchini doimiy remote qilib qo'shish shart emas. `gitworkflows` hujjatidagi retsept: xatda "Please pull from `<URL>` `<branch>`" kelsa, maintainer `git pull` bilan olib kelish va merge qilishni **bir qadamda** bajaradi. Bobur ham xuddi shunday ommaviy nusxa yaratib, `xato-matni` branch'ini push qildi:

```bash
$ cd ../ali
$ git pull --no-ff --no-edit ../bobur-ommaviy.git xato-matni
From ../bobur-ommaviy
 * branch            xato-matni -> FETCH_HEAD
Merge made by the 'ort' strategy.
 kutubxona.txt | 1 +
 1 file changed, 1 insertion(+)
$ cat .git/FETCH_HEAD
25046eeca0afbba6102223d17f79be7cf995017f		branch 'xato-matni' of ../bobur-ommaviy
$ git remote
dilnoza
origin
$ git log --oneline --graph -4
*   6cf3ae8 Merge branch 'xato-matni' of ../bobur-ommaviy
|\  
| * 25046ee Xato matnlarini aniqlashtirish
|/  
*   ca843ef Merge remote-tracking branch 'dilnoza/sana-format'
|\  
| * d448ac1 Sana formati uchun testlar
```

Farqlar:

| | `remote add` + `fetch` + `merge` | `git pull <URL> <branch>` |
| --- | --- | --- |
| Remote yaratiladimi | Ha (`.git/config` ga yoziladi) | Yo'q — faqat `FETCH_HEAD` |
| `refs/remotes/...` | Ha, keyin ham ko'rish mumkin | Yo'q |
| Avval ko'rib chiqish | Oson: `log main..dilnoza/x` | Merge darhol bo'ladi (oldin `git fetch <URL> <branch>` + `log ..FETCH_HEAD` qilish mumkin) |
| Merge xabari | `Merge remote-tracking branch 'dilnoza/sana-format'` | `Merge branch 'xato-matni' of <URL>` — manba tarixda qoladi |
| Qachon qulay | Doimiy hissa qo'shuvchi | Bir martalik hissa |

Pro Git ham shuni aytadi ([34-bob](34-loyihani-yuritish.md)da batafsil): doimiy ishlaydigan odamlar uchun remote qo'shish qulay, kamdan-kam hissa qo'shadiganlar uchun URL bilan `pull` yetarli.

`gitworkflows` hujjati shu yerda muhim ogohlantirish beradi: **remote branch'ni haqiqatan merge qilmoqchi bo'lmasangiz, `git pull` ishlatmang.** Yangiliklarni shunchaki olish uchun `git fetch <remote>` yoki `git remote update` kifoya.

### Nega bu model GitHub bilan juda mos

Pro Git: bu GitHub yoki GitLab kabi hub'larga asoslangan vositalarda juda keng tarqalgan workflow — u yerda loyihani fork qilish va o'zgarishlarni hamma ko'rishi uchun fork'ingizga push qilish oson. Asosiy afzalligi — **hech kim hech kimni kutmaydi**: hissa qo'shuvchi ishini davom ettiraveradi, maintainer esa o'zgarishlarni istalgan payt olishi mumkin. Har tomon o'z sur'atida ishlaydi.

Yuqoridagi namoyishda "xat" — `request-pull` matni, "maintainer'ning lokal merge'i" — `remote add` + `merge`. GitHub'da xuddi shu oqim veb-interfeysda: xat o'rniga **pull request**, merge esa "Merge" tugmasi. Bu oqim, review va PR'ni yangilash — [35-bob](35-github-fork-va-pr.md)ning mavzusi.

## Kod: diktator va leytenantlar workflow'i

Bu — ko'p repo'li workflow'ning bir varianti. Pro Git: odatda yuzlab hamkori bo'lgan juda katta loyihalarda ishlatiladi; mashhur misol — **Linux yadrosi**. Repo'ning ma'lum qismlariga mas'ul bir nechta integratsiya menejeri bor — ular **leytenantlar** (lieutenants) deyiladi. Barcha leytenantlarning bitta integratsiya menejeri bor — **xayrixoh diktator** (benevolent dictator). Diktator o'z papkasidan **etalon repo'ga** (reference repository) push qiladi va barcha hamkorlar o'sha repo'dan pull qilishi kerak.

Jarayon (Pro Git bo'yicha):

1. Oddiy dasturchilar o'z topic branch'larida ishlaydi va ishini `master` (bu yerda `main`) ustiga **rebase** qiladi. Bu — diktator push qiladigan etalon repo'ning `master`i.
2. Leytenantlar dasturchilarning topic branch'larini o'z `master`iga merge qiladi.
3. Diktator leytenantlarning `master` branch'larini o'z `master`iga merge qiladi.
4. Diktator shu `master`ni etalon repo'ga push qiladi; boshqa dasturchilar uning ustiga rebase qiladi.

```text
                    ┌──────────────────┐   (4) push    ┌────────────┐
                    │ etalon.git       │ ◀──────────── │  diktator  │
                    │ (reference repo) │               │   (Ali)    │
                    └──────────────────┘               └─────┬──────┘
                              (3) leytenantlarning main'ini  │ merge
                                           ┌─────────────────┴─────────────────┐
                                    ┌──────┴───────┐                    ┌──────┴───────┐
                                    │ leytenant    │                    │ leytenant    │
                                    │ Nodira       │                    │ Otabek       │
                                    │ tarmoq.git   │                    │ ekran.git    │
                                    └──────┬───────┘                    └──────┬───────┘
                       (2) topic'ni merge  │                                   │  (2) merge
                                    ┌──────┴───────┐                    ┌──────┴───────┐
                                    │ dasturchi    │                    │ dasturchi    │
                                    │ Sardor       │                    │ Zarina       │
                                    └──────────────┘                    └──────────────┘

  (1) Har dasturchi etalon.git'dan fetch qilib, topic'ini uning main'i ustiga rebase qiladi
```

Tajriba maydoni — ikki quyi tizim (tarmoq va ekran), har biriga bitta leytenant:

```text
32-diktator/
├── etalon.git/   ← etalon repo, faqat diktator push qiladi
├── diktator/     ← Ali (diktator)
├── tarmoq.git/   ← "tarmoq" leytenantining ommaviy repo'si
├── nodira/       ← Nodira (tarmoq leytenanti)
├── ekran.git/    ← "ekran" leytenantining ommaviy repo'si
├── otabek/       ← Otabek (ekran leytenanti)
├── sardor/       ← dasturchi (tarmoq bo'yicha)
└── zarina/       ← dasturchi (ekran bo'yicha)
```

```bash
$ git init -q --bare etalon.git
$ git clone -q etalon.git diktator
warning: You appear to have cloned an empty repository.
$ cd diktator
$ # ... "Yadro: boshlang'ich versiya"
$ git push -q origin main
$ cd ..
$ git clone -q --bare etalon.git tarmoq.git
$ git clone -q --bare etalon.git ekran.git
$ git clone -q tarmoq.git nodira
$ git clone -q ekran.git otabek
$ git clone -q etalon.git sardor
$ git clone -q etalon.git zarina
```

Dasturchilar o'z topic branch'larini ochadi. Ular etalon repo'dan o'qiydi, o'z quyi tizimi leytenantining repo'siga yozadi:

```bash
$ cd sardor
$ git remote add leytenant ../tarmoq.git
$ git switch -c tcp-timeout
Switched to a new branch 'tcp-timeout'
$ # ... "Tarmoq: TCP timeout sozlamasi"
$ cd ../zarina
$ git remote add leytenant ../ekran.git
$ git switch -c qorongi-mavzu
Switched to a new branch 'qorongi-mavzu'
$ # ... "Ekran: qorong'i mavzu"
```

Shu payt diktator etalon repo'ga yangi commit chiqaradi:

```bash
$ cd ../diktator
$ # ... "Yadro: xotira boshqaruvi"
$ git push origin main
To .../32-diktator/etalon.git
   f35cb8d..58e354d  main -> main
```

**1-qadam: dasturchi etalon ustiga rebase qiladi.**

```bash
$ cd ../sardor
$ git log --oneline --graph --all --decorate
* fc3d46a (HEAD -> tcp-timeout) Tarmoq: TCP timeout sozlamasi
* f35cb8d (origin/main, origin/HEAD, main) Yadro: boshlang'ich versiya
$ git fetch origin
From .../32-diktator/etalon
   f35cb8d..58e354d  main       -> origin/main
$ git rebase origin/main
Rebasing (1/1)Successfully rebased and updated refs/heads/tcp-timeout.
$ git log --oneline --graph --all --decorate
* 8d3865b (HEAD -> tcp-timeout) Tarmoq: TCP timeout sozlamasi
* 58e354d (origin/main, origin/HEAD) Yadro: xotira boshqaruvi
* f35cb8d (main) Yadro: boshlang'ich versiya
$ git push leytenant tcp-timeout
To ../tarmoq.git
 * [new branch]      tcp-timeout -> tcp-timeout
```

Nega rebase, merge emas? Topic hali faqat Sardor'niki — hech kim uning ustiga ish qurmagan, demak qayta yozish xavfsiz ([24-bob](24-rebase.md)dagi oltin qoida). Natijada leytenant **eng yangi** etalon ustiga qurilgan, ortiqcha merge'siz toza topic oladi. Zarina ham xuddi shunday `fetch` + `rebase origin/main` + `push leytenant qorongi-mavzu` qiladi.

**2-qadam: leytenantlar topic'larni o'z `main`iga merge qiladi.** Leytenantning `main`i ham etalonga asoslanadi, shuning uchun avval uni yangilaydi:

```bash
$ cd ../nodira
$ git remote add etalon ../etalon.git
$ git fetch etalon
From ../etalon
 * [new branch]      main       -> etalon/main
$ git merge --ff-only etalon/main
Updating f35cb8d..58e354d
Fast-forward
 yadro.txt | 1 +
 1 file changed, 1 insertion(+)
$ git fetch origin
From .../32-diktator/tarmoq
 * [new branch]      tcp-timeout -> origin/tcp-timeout
$ git merge --no-ff --no-edit origin/tcp-timeout
Merge made by the 'ort' strategy.
 tarmoq.txt | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 tarmoq.txt
$ git push origin main
To .../32-diktator/tarmoq.git
   f35cb8d..e313ba3  main -> main
```

Otabek `ekran.git`da xuddi shunday qiladi (`origin/qorongi-mavzu` → `main`, push).

**3-qadam: diktator leytenantlarning `main`larini merge qiladi.** Diktator alohida dasturchilarni bilishi shart emas — u faqat leytenantlar bilan ishlaydi:

```bash
$ cd ../diktator
$ git remote add tarmoq ../tarmoq.git
$ git remote add ekran ../ekran.git
$ git fetch --multiple tarmoq ekran
Fetching tarmoq
From ../tarmoq
 * [new branch]      main        -> tarmoq/main
 * [new branch]      tcp-timeout -> tarmoq/tcp-timeout
Fetching ekran
From ../ekran
 * [new branch]      main          -> ekran/main
 * [new branch]      qorongi-mavzu -> ekran/qorongi-mavzu
$ git log --oneline main..tarmoq/main
e313ba3 Merge remote-tracking branch 'origin/tcp-timeout'
8d3865b Tarmoq: TCP timeout sozlamasi
$ git log --oneline main..ekran/main
1a30ceb Merge remote-tracking branch 'origin/qorongi-mavzu'
8f38137 Ekran: qorong'i mavzu
$ git merge --no-ff --no-edit tarmoq/main
Merge made by the 'ort' strategy.
 tarmoq.txt | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 tarmoq.txt
$ git merge --no-ff --no-edit ekran/main
Merge made by the 'ort' strategy.
 ekran.txt | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 ekran.txt
$ git log --oneline --graph --decorate main
*   e628f5e (HEAD -> main) Merge remote-tracking branch 'ekran/main'
|\  
| *   1a30ceb (ekran/main, ekran/HEAD) Merge remote-tracking branch 'origin/qorongi-mavzu'
| |\  
| | * 8f38137 (ekran/qorongi-mavzu) Ekran: qorong'i mavzu
| |/  
* |   8364f01 Merge remote-tracking branch 'tarmoq/main'
|\ \  
| |/  
|/|   
| * e313ba3 (tarmoq/main, tarmoq/HEAD) Merge remote-tracking branch 'origin/tcp-timeout'
|/| 
| * 8d3865b (tarmoq/tcp-timeout) Tarmoq: TCP timeout sozlamasi
|/  
* 58e354d (origin/main) Yadro: xotira boshqaruvi
* f35cb8d Yadro: boshlang'ich versiya
```

`git fetch --multiple` — bir buyruqda bir nechta remote'dan olish ([27-bob](27-remote.md)dagi remote guruhlari ham shu ishni qiladi). Grafikda ikki daraja merge ko'rinadi: ichkarida leytenant merge'lari (`e313ba3`, `1a30ceb`), tashqarida diktator merge'lari (`8364f01`, `e628f5e`).

**4-qadam: etalonga push va dasturchilar yangilanadi.**

```bash
$ git push origin main
To .../32-diktator/etalon.git
   58e354d..e628f5e  main -> main
$ cd ../sardor
$ git switch main
Switched to branch 'main'
Your branch is behind 'origin/main' by 1 commit, and can be fast-forwarded.
  (use "git pull" to update your local branch)
$ git pull --ff-only
From .../32-diktator/etalon
   58e354d..e628f5e  main       -> origin/main
Updating f35cb8d..e628f5e
Fast-forward
 ekran.txt  | 1 +
 tarmoq.txt | 1 +
 yadro.txt  | 1 +
 3 files changed, 3 insertions(+)
 create mode 100644 ekran.txt
 create mode 100644 tarmoq.txt
```

Tarixda kim nima qilgani to'liq saqlanadi — kod mualliflari ham, merge qilgan leytenant va diktator ham:

```bash
$ git log --format='%h %<(17)%an %s' main
e628f5e Ali Valiyev       Merge remote-tracking branch 'ekran/main'
8364f01 Ali Valiyev       Merge remote-tracking branch 'tarmoq/main'
1a30ceb Otabek Ekranov    Merge remote-tracking branch 'origin/qorongi-mavzu'
e313ba3 Nodira Tarmoqova  Merge remote-tracking branch 'origin/tcp-timeout'
58e354d Ali Valiyev       Yadro: xotira boshqaruvi
8f38137 Zarina Qodirova   Ekran: qorong'i mavzu
8d3865b Sardor Usmonov    Tarmoq: TCP timeout sozlamasi
f35cb8d Ali Valiyev       Yadro: boshlang'ich versiya
$ git log --format='%h %an: %s' --first-parent main
e628f5e Ali Valiyev: Merge remote-tracking branch 'ekran/main'
8364f01 Ali Valiyev: Merge remote-tracking branch 'tarmoq/main'
58e354d Ali Valiyev: Yadro: xotira boshqaruvi
f35cb8d Ali Valiyev: Yadro: boshlang'ich versiya
```

`--first-parent` diktatorning nuqtai nazari: "qaysi quyi tizim qachon kirdi" — ichki tafsilotsiz. `%<(17)` — maydonni 17 belgigacha to'ldirish (`pretty-formats`, [9-bob](09-tarixni-korish.md)).

Pro Git xulosasi: bu workflow keng tarqalmagan, lekin juda katta loyihalarda yoki qat'iy ierarxik muhitda foydali. U loyiha rahbariga (diktatorga) ishning katta qismini **topshirish** va kodning katta bo'laklarini **bir necha nuqtada** yig'ib, keyin integratsiya qilish imkonini beradi.

## Kod: merge workflow va patch workflow

`gitworkflows` hujjatining "DISTRIBUTED WORKFLOWS" bo'limi yuqoridagi andozalarga boshqa tomondan qaraydi. Taxminan ikkita muhim workflow bor: **merge** va **patch**. Asosiy farq: merge workflow **to'liq tarixni, merge'lar bilan birga** uzata oladi, patch'lar esa yo'q. Ikkalasini parallel ishlatish mumkin — `git.git`da faqat quyi tizim maintainer'lari merge workflow'ni ishlatadi, qolgan hamma patch yuboradi.

**Merge workflow** branch'larni upstream (yuqori oqim — rasmiy tarix egasi) va downstream (quyi oqim — shu tarix ustiga ish quradiganlar) o'rtasida nusxalaydi. Upstream hissalarni rasmiy tarixga merge qiladi; downstream o'z ishini rasmiy tarixga asoslaydi. Uchta vosita: `git push` (branch'ni hamma o'qiy oladigan repo'ga nusxalash), `git fetch` (remote branch'larni o'zingizga nusxalash), `git pull` (fetch va merge bir qadamda). Yuqoridagi uchala namoyish — merge workflow.

Hujjatdagi retseptlar qisqacha:

| Vazifa | Merge workflow | Patch workflow |
| --- | --- | --- |
| O'z ishingizni chiqarish | `git push <remote> <branch>` + boshqalarga qayerdan olishni aytish (`git request-pull`) | `git format-patch -M upstream..topic` + `git send-email --to=<qabul qiluvchi> <patch'lar>` |
| Yangilanib turish | `git fetch <remote>` yoki `git remote update` | Patch endi qo'llanmasa: `git pull --rebase <URL> <branch>` |
| Boshqalarning ishini olish | `git pull <URL> <branch>` | Xatlarni faylga saqlab, yangi topic branch'da `git am < patch` (`-3` bilan) |

**Patch workflow**ni qisqa ko'ramiz (batafsil — [33-bob](33-hissa-qoshish.md) va [34-bob](34-loyihani-yuritish.md)). Dilnoza'ning topic branch'ida ataylab bitta merge bor:

```bash
$ git switch -c tarjima
Switched to a new branch 'tarjima'
$ # ... "Tarjima: o'zbekcha matnlar"
$ git switch -c yordamchi main
Switched to a new branch 'yordamchi'
$ # ... "Yordamchi funksiya"
$ git switch tarjima
Switched to branch 'tarjima'
$ git merge --no-edit yordamchi
Merge made by the 'ort' strategy.
 yordam.txt | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 yordam.txt
$ # ... "Tarjima: xayrlashuv matni"
$ git log --oneline --graph origin/main..tarjima
* 7cd951f Tarjima: xayrlashuv matni
*   e9ef193 Merge branch 'yordamchi' into tarjima
|\  
| * 48d3cf5 Yordamchi funksiya
* 34f3bb7 Tarjima: o'zbekcha matnlar
$ git format-patch -M origin/main..tarjima
0001-Yordamchi-funksiya.patch
0002-Tarjima-o-zbekcha-matnlar.patch
0003-Tarjima-xayrlashuv-matni.patch
```

To'rt commit, lekin **uchta** patch: merge commit (`e9ef193`) patch'ga aylanmadi. `-M` — nomi o'zgargan fayllarni aniqlash (patch'ni qisqaroq va o'qishli qiladi). Maintainer patch'larni yangi topic branch'da qo'llaydi:

```bash
$ cd ../ali
$ git switch -c dr/tarjima
Switched to a new branch 'dr/tarjima'
$ git am -3 ../dilnoza/0*.patch
Applying: Yordamchi funksiya
Applying: Tarjima: o'zbekcha matnlar
Applying: Tarjima: xayrlashuv matni
$ git log --format='%h %an | %cn: %s' main..dr/tarjima
1d33299 Dilnoza Rahimova | Ali Valiyev: Tarjima: xayrlashuv matni
e9f11da Dilnoza Rahimova | Ali Valiyev: Tarjima: o'zbekcha matnlar
6d4af5c Dilnoza Rahimova | Ali Valiyev: Yordamchi funksiya
```

Uchta kuzatuv:

- **Tarix chiziqli bo'ldi** — merge yo'qoldi. Shu sababli hujjat aytadi: patch endi qo'llanmasa, topic'ni **rebase** qilishingiz kerak (merge qila olmaysiz, chunki merge'larni `format-patch` qilib bo'lmaydi). Topic faqat email orqali e'lon qilingan bo'lsa, rebase muammo emas.
- **Muallif saqlandi, commit qiluvchi o'zgardi** (`%an` — Dilnoza, `%cn` — Ali; [16-bob](16-commit-obyekti.md)). Shuning uchun hash'lar ham boshqa: `6d4af5c` ≠ `48d3cf5`.
- **`-3`** — patch ichidagi index ma'lumotidan (`index abc..def` qatori) foydalanib merge base'ni topadi va konflikt bo'lsa uch tomonlama merge qiladi. Bu konfliktlarni hal qilishda yordam beradi.

Hujjat yana qo'shadi: maintainer'lar barcha commit/patch'lar uchun cheklovlar qo'yishi mumkin, masalan **"Signed-off-by"** talabi (`git commit -s` qo'shadigan qator, [33-bob](33-hissa-qoshish.md)). Loyiha hujjatlarini o'qing.

## Muhandislik nuqtai nazari: andozalarni solishtirish

| | Markazlashgan | Integratsiya menejeri | Diktator va leytenantlar |
| --- | --- | --- | --- |
| Repo'lar soni | 1 umumiy + klonlar | 1 kanonik + har hissa qo'shuvchiga 1 ommaviy | 1 etalon + har leytenantga 1 + dasturchilar |
| Kim asosiy repo'ga yozadi | Hamma | Faqat maintainer | Faqat diktator |
| Kirish nazorati | Ishonch: hamma push qila oladi | Kuchli: o'zgarish faqat ko'rib chiqilgandan keyin kiradi | Ko'p bosqichli: har quyi tizim o'z egasidan o'tadi |
| Kutish | Push rad etilsa — darhol fetch + merge | Hech kim kutmaydi, har kim o'z sur'atida | Topic → leytenant → diktator zanjiri sekinroq |
| Zaif tomoni | Yozish huquqi ko'p odamda; "kim buzdi" nazorati jarayonga bog'liq | Maintainer — tor joy (bottleneck) | Murakkab, ierarxiya kerak |
| Tipik joy | Kompaniya ichidagi jamoa | GitHub/GitLab ochiq loyihalari | Linux yadrosi |

Amaliy maslahatlar:

- **Aralashtirish normal.** Kompaniyada markazlashgan repo + topic branch + PR review — markazlashgan va integratsiya menejeri o'rtasidagi narsa: hamma push qila oladi, lekin `main`ga faqat ko'rib chiqilgan PR kiradi (himoyalangan branch — [36-bob](36-github-boshqaruv.md)).
- **Workflow — huquqlar va kelishuv.** Git buyruqlari hamma joyda bir xil (`push`, `fetch`, `merge`, `rebase`). Farq — kimga qaysi repo'ga yozish huquqi berilgani va kim nimani merge qilishi. Buni hujjatlashtiring (`CONTRIBUTING.md`).
- **Upstream va downstream yo'nalishi.** [31-bob](31-branch-workflowlari.md)dagi "pastga faqat aniq sabab bilan merge qiling" qoidasi repo'lar o'rtasida ham amal qiladi: hissa qo'shuvchi topic'iga upstream'ni odat bo'yicha merge qilmaydi. Istisno (`gitworkflows`): maintainer downstream'dan pull qilganda konflikt chiqsa, downstream'dan merge qilib konfliktni o'zi hal qilishni so'rashi mumkin — ehtimol u qanday hal qilishni yaxshiroq biladi. Bu downstream upstream'dan merge qilishi **kerak** bo'lgan kam holatlardan biri.
- **Batafsil taqqoslash** uchun Pro Git Martin Fowler'ning "Patterns for Managing Source Code Branches" qo'llanmasini tavsiya qiladi (<https://martinfowler.com/articles/branching-patterns.html>) — unda integratsiya chastotasi yuqori va past bo'lgan yondashuvlar ham solishtirilgan. Bu Git hujjati emas, tashqi manba.

## Muhandislik nuqtai nazari: ichkarida nima bo'ladi

Uchala andoza ham faqat [27–29-boblar](27-remote.md)dagi mexanizmlardan foydalanadi:

| Workflow qadami | Git'da |
| --- | --- |
| "Ommaviy nusxa" (fork) | `git clone --bare` — obyektlar va `refs/heads/*` nusxasi |
| Hissa qo'shuvchining repo'sini qo'shish | `.git/config` ga `[remote "dilnoza"]` bo'limi |
| Ko'rib chiqish | `refs/remotes/dilnoza/*` + `log A..B`, `diff A...B` |
| Bir martalik pull | `FETCH_HEAD` fayli, remote yaratilmaydi |
| Push rad etilishi | Fast-forward bo'lmasa push qiluvchi Git o'zi yubormaydi (`[rejected]`); server `--force`ni ham `receive.denyNonFastForwards` yoki hook bilan taqiqlashi mumkin (`[remote rejected]`) |
| "Faqat maintainer yozadi" | Git emas — server ruxsatlari (SSH, hosting sozlamalari) |
| Patch | `format-patch` — commit'ni mbox formatidagi matnga; `am` — teskari; merge commit'lar tashlanadi |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Push rad etilganda `--force` | Markazlashgan repo'da hamkasbning commit'lari yo'qoladi | `git fetch` + `merge` (yoki `pull --rebase`), keyin oddiy `push` |
| Hissa qo'shuvchi kanonik repo'ga push qilishga urinadi | Huquq yo'q (yoki bo'lsa — nazoratsiz o'zgarish) | O'z ommaviy repo'ingizga push qiling va `request-pull`/PR yuboring |
| `request-pull` dan oldin push qilmaslik | Maintainer URL'da commit'ni topa olmaydi | Avval `git push <ommaviy> <branch>`, keyin `request-pull` |
| Maintainer ko'rib chiqmasdan `git pull <URL> <branch>` | Begona kod darhol `main`ga merge bo'ladi | `git fetch <URL> <branch>` + `git log main..FETCH_HEAD`, yoki remote qo'shib ko'rib chiqing |
| Yangiliklarni olish uchun `git pull` | Kutilmagan merge commit; `gitworkflows`: merge qilmoqchi bo'lmasangiz `pull` ishlatmang | `git fetch` yoki `git remote update` |
| Leytenantga yuborilgan topic'ni rebase qilib, majburan qayta push | Leytenant allaqachon merge qilgan bo'lsa — ikki nusxadagi commit'lar | Rebase faqat hali hech kim olmagan topic uchun; aks holda yangi branch |
| Patch workflow'da topic'ni yangilash uchun merge | `format-patch` merge'ni yubormaydi, natija qo'llanmaydi | `git pull --rebase <URL> <branch>` yoki `git rebase` |
| Bir nechta hissa qo'shuvchining ishi bitta branch'da | Maintainer birini olib, boshqasini rad eta olmaydi | Har mavzu uchun alohida topic branch ([31-bob](31-branch-workflowlari.md)) |
| Workflow'ni hujjatlashtirmaslik | Har kim o'zicha ishlaydi: biri merge, biri rebase, biri `main`ga push | `CONTRIBUTING.md`: qaysi repo, qaysi branch, qanday so'rov, Signed-off-by kerakmi |

## Amaliyot

1. Bare server va uchta klon bilan markazlashgan workflow'ni yurgizing. Ikki kishi bir vaqtda commit qilsin, ikkinchisining push'i rad etilsin. Bir marta `fetch` + `merge`, bir marta `pull --rebase` bilan hal qiling va `git log --oneline --graph --all` natijalarini solishtiring.
2. Integratsiya menejeri workflow'i: kanonik bare repo, undan `clone --bare` bilan hissa qo'shuvchining ommaviy repo'si. Topic branch'ni ommaviy repo'ga push qilib, `git request-pull` chiqishini oling. Keyin `git branch --edit-description` bilan tavsif yozib, `request-pull`ni qayta ishga tushiring — nima o'zgardi?
3. Maintainer sifatida bir hissani `remote add` + `fetch` + ko'rib chiqish + `merge` bilan, boshqasini `git pull <URL> <branch>` bilan oling. Ikki merge commit xabarini va `.git/config`, `.git/FETCH_HEAD` ni solishtiring.
4. Hissa qo'shuvchi `request-pull` yuborgandan keyin topic'ga yana bitta commit push qilsin. Maintainer xatdagi "up to" hash'i bilan `dilnoza/<branch>` uchini solishtirib, farqni qanday seza oladi?
5. Diktator va leytenantlar: etalon repo, ikki leytenant repo'si, ikki dasturchi. Diktator etalonga yangi commit chiqargandan keyin dasturchilar `rebase origin/main` qilsin. Diktator `git fetch --multiple` bilan leytenantlarni olib merge qilsin. `git log --first-parent` va `git log --format='%an'` bilan kim nimani qilganini ko'rsating.
6. Bitta merge commit'i bor topic branch'dan `git format-patch` qiling va patch'lar sonini commit'lar soni bilan solishtiring. `git am -3` bilan boshqa klonda qo'llang va `%an`/`%cn` farqini tushuntiring.
7. (Qiyinroq) Maintainer `git pull <URL> <branch>` qilganda konflikt chiqadigan holatni yarating. `gitworkflows` tavsiyasiga ko'ra hissa qo'shuvchi tomonida upstream'ni topic'ga merge qilib konfliktni hal qiling, push qiling va maintainer endi konfliktsiz olishini ko'rsating. Keyin xuddi shu holatni patch workflow'da hal qiling (`git pull --rebase`) va ikkala natija tarixini solishtiring.

## Rasmiy hujjat

- Pro Git — Distributed Workflows: <https://git-scm.com/book/en/v2/Distributed-Git-Distributed-Workflows>
- `gitworkflows` (DISTRIBUTED WORKFLOWS bo'limi): <https://git-scm.com/docs/gitworkflows>
- `git request-pull`: <https://git-scm.com/docs/git-request-pull>
- `git pull`: <https://git-scm.com/docs/git-pull>
- `git fetch` (`--multiple`): <https://git-scm.com/docs/git-fetch>
- `git push`: <https://git-scm.com/docs/git-push>
- `git format-patch`: <https://git-scm.com/docs/git-format-patch>
- `git am` (`-3`): <https://git-scm.com/docs/git-am>
- `git send-email`: <https://git-scm.com/docs/git-send-email>
- `git clone` (`--bare`): <https://git-scm.com/docs/git-clone>
