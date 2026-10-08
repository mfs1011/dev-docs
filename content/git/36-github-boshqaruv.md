# 36 — GitHub: repo va tashkilotni boshqarish

[← Oldingi: GitHub: fork va pull request](35-github-fork-va-pr.md) · [Mundarija](README.md) · [Keyingi: Interaktiv staging →](37-interaktiv-staging.md)

## Tushuncha

[35-bobda](35-github-fork-va-pr.md) siz **hissa qo'shuvchi** edingiz: fork qildingiz, branch ochdingiz, pull request yubordingiz. Bu bobda stolning narigi tomoniga o'tamiz — siz **loyiha egasi** (maintainer)siz. Sizga PR keladi, siz uni ko'rib chiqasiz, sinaysiz, qabul qilasiz yoki yopasiz. Loyiha o'sgach, qoidalar kerak bo'ladi: `main` ga to'g'ridan-to'g'ri push qilinmasin, har o'zgarishni kimdir ko'rib chiqsin, testlar o'tmaguncha merge bo'lmasin.

Bob to'rt qismdan iborat:

1. **Repo'ni yuritish** — repo yaratish, hamkorlar (collaborator), PR'ni qabul qilish, PR ref'lari (`refs/pull/*`), maxsus fayllar (`README`, `CONTRIBUTING`), standart branch, repo'ni boshqa egaga o'tkazish.
2. **Qoidalar** — himoyalangan branch (protected branch), ruleset'lar va `CODEOWNERS`.
3. **Tashkilot** (organization) — jamoalar (team), rollar, audit log.
4. **Avtomatlashtirish** — webhook'lar, REST API, `gh` CLI.

Muhim farq: GitHub — Git emas. Git — bu dastur (siz o'rganayotgan buyruqlar). GitHub — Git repo'larini saqlaydigan **xizmat** va uning ustiga qurilgan veb-interfeys: PR, review, ruxsatlar, qoidalar — bularning hech biri Git'ning o'zida yo'q. Lekin ichkarida hammasi oddiy Git ref'lari va push'larga borib taqaladi. Shuning uchun bobda har GitHub imkoniyatining **Git darajasidagi** ko'rinishini ham lokal bare repo'da sinab ko'rsatamiz.

> **Manba haqida.** Pro Git'ning GitHub bobi 2014-yilda yozilgan va skrinshotlari eskirgan ("Services" bo'limi, "Applications" tab, `master`). Bu bobdagi interfeys nomlari va qoidalar hozirgi **docs.github.com** hujjatidan olingan. GitHub interfeysi tez-tez o'zgaradi — tugma nomi farq qilsa, rasmiy hujjatga qarang.

## Nega shunday: nega qoidalar serverda turadi

Git taqsimlangan tizim — har kimning kompyuterida to'liq repo bor va har kim o'z repo'sida xohlagan narsasini qila oladi: commit'ni o'chirish, tarixni qayta yozish, `--force`. Lokal hook'lar ([47-bob](47-hooklar.md)) ham yordam bermaydi: ular klonlanmaydi va foydalanuvchi ularni `--no-verify` bilan chetlab o'tishi mumkin.

Demak, "hech kim `main` ni force-push qilmasin" degan qoidani **faqat umumiy server** majburlay oladi — push aynan u yerga keladi. Git'ning o'zida ham buning oddiy vositalari bor (`receive.denyNonFastForwards`, `receive.denyDeletes`, `pre-receive` hook). GitHub esa shu g'oyani ancha boyitadi: kim, qaysi branch'ga, qanday shart bilan (review, testlar, imzo) yozishi mumkinligini interfeysdan sozlash imkonini beradi.

## Kod: repo yaratish va hamkorlar qo'shish

**Repo yaratish.** Veb-interfeysda o'ng yuqoridagi `+` → **New repository**. Majburiy maydon faqat nom; qolgani (tavsif, public/private, README, `.gitignore`, litsenziya) ixtiyoriy. Natijada repo `<foydalanuvchi>/<loyiha>` nomi bilan yaratiladi va ikki manzil bilan ochiladi:

```text
https://github.com/<foydalanuvchi>/<loyiha>        ← HTTPS
git@github.com:<foydalanuvchi>/<loyiha>            ← SSH
```

Ikkalasidan ham `fetch` va `push` qilish mumkin, lekin ruxsat ulanayotgan foydalanuvchining hisob ma'lumotlariga qarab beriladi ([30-bob](30-ssh-va-credential.md)). Pro Git maslahati: ochiq loyiha uchun HTTPS manzilini tarqating — uni klonlash uchun GitHub hisobi ham, SSH kalit ham kerak emas, va u brauzerda ochiladigan manzilning o'zi.

Xuddi shu ishni `gh` CLI bilan (sintaksis `gh repo create --help` dan; bu yerda haqiqiy GitHub'ga yuborilmagan):

```bash
gh repo create my-project --public --clone                      # yaratib, lokalga klonlash
gh repo create my-project --private --source=. --remote=upstream  # mavjud papkadan
```

**Hamkor (collaborator) qo'shish.** Shaxsiy hisobdagi repo'da boshqa odamga push ruxsatini berish — uni hamkor qilish: repo'da **Settings** → **Collaborators** (hozirgi interfeysda "Collaborators and teams" yoki "Access" bo'limi) → foydalanuvchi nomini kiritish. Hamkor taklifni qabul qilgach, repo'ga o'qish va yozish huquqiga ega bo'ladi. Ruxsatni olib tashlash ham shu sahifada.

Tashkilotdagi repo'larda ruxsatlar nozikroq — besh darajali rollar bilan (pastda, "Tashkilot" qismida).

## Kod: PR qabul qilish — uch yo'l

Sizga PR keldi. PR ikki joydan kelishi mumkin:

- **fork'dagi branch'dan** — odatda siz uning branch'iga, u sizning branch'ingizga push qila olmaydi;
- **shu repo'ning boshqa branch'idan** — ikkala tomon ham branch'ga yozishi mumkin (jamoa ichidagi ish).

Ko'rib chiqish (review) jarayonini [35-bobda](35-github-fork-va-pr.md) ko'rdik: qatorga izoh, butun PR'ga izoh, "Approve" yoki "Request changes". PR yaratilganda va har yangi izohda sizga bildirishnoma (notification) keladi.

Kod tayyor bo'lgach, uni birlashtirishning uch yo'li bor.

### 1-yo'l: veb-interfeysdagi Merge tugmasi

Eng oddiy yo'l. GitHub'da uch **merge usuli** bor (repo sozlamalarida qaysi biri yoqilganini tanlaysiz):

| Usul | Nima bo'ladi | Tarix |
| --- | --- | --- |
| **Create a merge commit** (standart) | `git merge --no-ff` — fast-forward mumkin bo'lsa ham **har doim** merge commit yaratiladi | PR'dagi hamma commit'lar + bitta merge commit |
| **Squash and merge** | PR'dagi hamma commit'lar bitta commit'ga siqiladi | Chiziqli, PR = 1 commit; oraliq commit'lar va ularning vaqti yo'qoladi |
| **Rebase and merge** | Commit'lar bittadan base branch ustiga ko'chiriladi, merge commit yo'q | Chiziqli, lekin commit'lar **yangi hash** oladi |

Uchala usulni lokal ravishda takrorlab ko'raylik — shunda GitHub tugmasi ichkarida nima qilishini aniq ko'rasiz. Sinov sharoiti: `server.git` — "GitHub" o'rnidagi bare repo, `fork.git` — Laylo'ning fork'i, unda `sekinroq` branch'ida ikki commit bor, `main` da esa Laylo fork qilgandan keyin `README tavsifi` commit'i qo'shilgan.

```text
$ git log --graph --oneline          # (usul-merge branch'ida)
*   504a032 Merge pull request #1 from laylo/sekinroq
|\  
| * 0e802d6 Izoh qo'shildi
| * ed23826 Kechikishni 50 ga oshirish
* | c3dd16a README tavsifi
|/  
* 6ec6efe fade.ino qo'shildi
* 6046e8c Boshlang'ich commit
```

Bu `git merge --no-ff -m "Merge pull request #1 from laylo/sekinroq" pr-1` natijasi — "Create a merge commit" tugmasi ham aynan shunday graf hosil qiladi. `--no-ff` haqida batafsil — [21-bob](21-branch-va-merge.md).

**Squash and merge** — `git merge --squash` ga o'xshaydi:

```text
$ git merge --squash pr-1
Automatic merge went well; stopped before committing as requested
Squash commit -- not updating HEAD
$ git commit -qm "Kechikishni 50 ga oshirish (#1)"
$ git log --graph --oneline
* d2c13b2 Kechikishni 50 ga oshirish (#1)
* c3dd16a README tavsifi
* 6ec6efe fade.ino qo'shildi
* 6046e8c Boshlang'ich commit
```

Laylo'ning ikki commit'i bitta `d2c13b2` ga aylandi; `0e802d6` va `ed23826` `main` tarixida yo'q.

**Rebase and merge** — commit'lar `main` ustiga qayta yoziladi ([24-bob](24-rebase.md)):

```text
$ git log --graph --oneline
* 28f810e Izoh qo'shildi
* e38ec33 Kechikishni 50 ga oshirish
* c3dd16a README tavsifi
...
$ git log -2 --format='%h %an | %cn | %s'
28f810e Laylo Karimova | Ali Valiyev | Izoh qo'shildi
e38ec33 Laylo Karimova | Ali Valiyev | Kechikishni 50 ga oshirish
$ git log -2 --format='%h %an | %cn | %s' pr-1
0e802d6 Laylo Karimova | Laylo Karimova | Izoh qo'shildi
ed23826 Laylo Karimova | Laylo Karimova | Kechikishni 50 ga oshirish
```

Muallif (`%an`) saqlandi, lekin commit qiluvchi (`%cn`) o'zgardi va hash'lar yangi. GitHub hujjati shuni alohida ta'kidlaydi: GitHub'dagi "Rebase and merge" oddiy `git rebase` dan farqli ravishda **har doim** committer ma'lumotini yangilaydi va yangi SHA yaratadi (hatto fast-forward mumkin bo'lsa ham), shuningdek boshidanoq bo'sh bo'lgan commit'larni tashlab yuboradi. Muallif va commit qiluvchi farqi — [16-bob](16-commit-obyekti.md).

Qaysi usulni tanlash — "Muhandislik nuqtai nazari" qismida.

### 2-yo'l: lokal `pull` — remote qo'shmasdan

PR bildirishnomasida GitHub buyruq qatori uchun ko'rsatma ham beradi. Klassik usul — fork URL'idan branch'ni to'g'ridan-to'g'ri `pull` qilish (remote qo'shmasdan, [34-bob](34-loyihani-yuritish.md)):

```text
$ git switch -c laylo-sekinroq main
$ git pull --no-rebase ../fork.git sekinroq
From ../fork
 * branch            sekinroq   -> FETCH_HEAD
Merge made by the 'ort' strategy.
 fade.ino | 3 ++-
 1 file changed, 2 insertions(+), 1 deletion(-)
```

Haqiqiy GitHub'da `../fork.git` o'rnida `https://github.com/laylo/fade` bo'ladi. Bu usulning afzalligi — avval alohida branch'da sinab, testlarni ishga tushirib, keyin `main` ga birlashtirish mumkin.

### 3-yo'l: `.patch` URL va `git am`

Har PR'ning `.diff` va `.patch` ko'rinishi bor: PR manziliga `.patch` qo'shsangiz (`https://github.com/<egasi>/<repo>/pull/1.patch`), `git format-patch` formatidagi matn qaytadi. Pro Git misoli:

```bash
curl https://github.com/tonychacon/fade/pull/1.patch | git am
```

Lokal ekvivalent — `format-patch` chiqishini `am` ga uzatish ([34-bob](34-loyihani-yuritish.md)):

```text
$ (cd ../hissachi && git format-patch --stdout main..sekinroq) | git am
Applying: Kechikishni 50 ga oshirish
Applying: Izoh qo'shildi
$ git log --format='%h %an | %cn | %s' -3
28f810e Laylo Karimova | Ali Valiyev | Izoh qo'shildi
e38ec33 Laylo Karimova | Ali Valiyev | Kechikishni 50 ga oshirish
c3dd16a Ali Valiyev | Ali Valiyev | README tavsifi
```

E'tibor bering: hash'lar yuqoridagi rebase natijasi bilan **bir xil** (`28f810e`, `e38ec33`). Ajablanarli emas — ota commit, tree, muallif, commit qiluvchi, sanalar va xabar bir xil bo'lsa, commit obyekti bayt-baytigacha bir xil bo'ladi, demak hash ham ([16-bob](16-commit-obyekti.md)). Sinov muhitida sana qotirilgani uchun shunday chiqdi; haqiqiy hayotda commit qiluvchi sanasi farq qiladi.

PR'ni birlashtirmaslikka qaror qilsangiz — uni **Close** qilasiz, muallifga xabar boradi.

## Kod: PR ref'lari — `refs/pull/<N>/head` va `merge`

PR'lar ko'p bo'lsa, har fork uchun remote qo'shish noqulay. GitHub buning uchun yashirin ref'lar beradi. Har PR uchun serverda ikkita ref bor:

- `refs/pull/<N>/head` — PR branch'ining oxirgi commit'i;
- `refs/pull/<N>/merge` — "Merge" tugmasi bosilsa paydo bo'ladigan **sinov merge commit**'i (GitHub uni o'zi yaratib turadi; konflikt bo'lsa, u bo'lmaydi).

Ular `refs/heads/` ostida emas, shuning uchun oddiy `clone`/`fetch` ularni olmaydi — standart refspec faqat `refs/heads/*` ni ko'chiradi ([29-bob](29-fetch-push-ichidan.md)).

Sinov uchun `server.git` da GitHub'ning ishini qo'lda bajardik: Laylo'ning branch'ini `refs/pull/1/head` ga yozdik va `main` bilan sinov merge'ini `refs/pull/1/merge` ga qo'ydik. Endi serverdagi hamma ref'larni `ls-remote` bilan ko'ramiz:

```text
$ git ls-remote origin
c3dd16ac697734606a6f7ed50713187f753e34c8	HEAD
c3dd16ac697734606a6f7ed50713187f753e34c8	refs/heads/main
0e802d68ffa331ae408cf360c9263b1a11a49fff	refs/pull/1/head
fba6b131bd85435a895ce44c6de32e4ad351da7e	refs/pull/1/merge
```

`ls-remote` — plumbing buyruq ([13-bob](13-plumbing-va-porcelain.md)): u hech narsa yuklamaydi, faqat serverdagi ref'lar ro'yxatini ko'rsatadi. GitHub repo'sida `git ls-remote origin` ni ishlatsangiz, ochiq PR'lar soniga qarab shunday `refs/pull/...` qatorlarini ko'rasiz.

**Bitta PR'ni olish.** Ref'ni to'g'ridan-to'g'ri `fetch` qilish mumkin:

```text
$ git fetch origin refs/pull/1/head
From .../36-github-boshqaruv/server
 * branch            refs/pull/1/head -> FETCH_HEAD
$ cat .git/FETCH_HEAD
0e802d68ffa331ae408cf360c9263b1a11a49fff		'refs/pull/1/head' of .../36-github-boshqaruv/server
```

Commit yuklandi va `.git/FETCH_HEAD` fayliga yozildi. Keyin `git merge FETCH_HEAD` qilish mumkin, lekin merge xabari g'alati chiqadi. Qulayrog'i — GitHub hujjatidagi shakl, darhol lokal branch yaratadi:

```text
$ git fetch origin pull/1/head:pr-1
From .../36-github-boshqaruv/server
 * [new ref]         refs/pull/1/head -> pr-1
$ git log --oneline main..pr-1
0e802d6 Izoh qo'shildi
ed23826 Kechikishni 50 ga oshirish
```

`pull/1/head` qisqa yozuvi `refs/pull/1/head` ga aylandi — Git ref nomini `refs/` ostida qidiradi ([19-bob](19-revision-tanlash.md)).

**Hamma PR'larni doimiy kuzatish.** `.git/config` dagi remote bo'limiga ikkinchi refspec qo'shamiz:

```bash
git config --add remote.origin.fetch '+refs/pull/*/head:refs/remotes/origin/pr/*'
```

```ini
[remote "origin"]
	url = .../36-github-boshqaruv/server.git
	fetch = +refs/heads/*:refs/remotes/origin/*
	fetch = +refs/pull/*/head:refs/remotes/origin/pr/*
```

Ikkinchi qator: "serverdagi `refs/pull/123/head` ko'rinishidagi hamma ref'ni lokalda `refs/remotes/origin/pr/123` sifatida saqla". Endi oddiy `fetch` PR'larni ham olib keladi:

```text
$ git fetch
From .../36-github-boshqaruv/server
 * [new ref]         refs/pull/1/head -> origin/pr/1
$ git switch pr/1
Switched to a new branch 'pr/1'
branch 'pr/1' set up to track 'origin/pr/1'.
```

`origin/pr/1` — oddiy remote-tracking ref ([28-bob](28-remote-branchlar.md)): faqat o'qish uchun, har `fetch` da yangilanadi. `git switch pr/1` uni ko'rib, kuzatuvchi lokal branch yaratdi (Pro Git'da bu `git checkout pr/2` bilan ko'rsatilgan — hozir `switch` tavsiya etiladi).

Refspec'dagi `head` o'rniga `merge` yozsangiz, sinov merge commit'larini olasiz — "Merge" tugmasini bosmasdan natijani lokal sinash uchun. Sinovimizda `refs/pull/1/merge` ning tree'si qo'lda qilingan `--no-ff` merge tree'si bilan bir xil:

```text
$ git fetch -q origin refs/pull/1/merge:pr-1-merge
$ git rev-parse pr-1-merge^{tree} usul-merge^{tree}
74a95742834997bde8248662c03461ba64e575e9
74a95742834997bde8248662c03461ba64e575e9
```

**`refs/pull/` ga yozib bo'lmaydi.** GitHub bu nomlar maydonini faqat o'qish uchun qilgan. Git'ning o'zida buni `receive.hideRefs` sozlamasi bilan qilish mumkin — u yashirin ref'ni push orqali yangilash yoki o'chirishni rad etadi (fetch'ga ta'sir qilmaydi). Sinov serverimizda `git config receive.hideRefs refs/pull` qo'yilgan:

```text
$ git push origin pr-1:refs/pull/1/head
To .../36-github-boshqaruv/server.git
 ! [remote rejected] pr-1 -> refs/pull/1/head (deny updating a hidden ref)
error: failed to push some refs to '.../36-github-boshqaruv/server.git'
```

GitHub'da ham xuddi shu xabar chiqadi — `deny updating a hidden ref`. PR'ni yangilash uchun uning **manba branch'iga** push qilinadi ([35-bob](35-github-fork-va-pr.md)), `refs/pull/` ga emas.

`gh` bilan PR'ni lokalga olish (sintaksis `gh pr checkout --help` dan):

```bash
gh pr checkout 32                                   # PR raqami bo'yicha
gh pr checkout https://github.com/OWNER/REPO/pull/32
gh pr checkout 32 --branch review-32                # lokal branch nomini o'zingiz berasiz
```

**PR ustiga PR.** PR faqat `main` ga emas, tarmoqdagi istalgan branch'ga — hatto boshqa PR'ning branch'iga ham ochilishi mumkin. PR ochish sahifasida "base" (qayerga) va "compare" (qayerdan) branch'lari, kerak bo'lsa fork ham tanlanadi. Bu biror PR'ga bog'liq g'oyani taklif qilish yoki maqsad branch'ga push huquqi bo'lmaganda foydali.

## Kod: eslatmalar, bildirishnomalar va maxsus fayllar

**@-eslatma.** Har qanday izohda `@` yozsangiz, loyiha ishtirokchilari ro'yxati chiqadi. Eslatilgan odam bildirishnoma oladi va mavzuga "obuna" bo'ladi — keyingi har faollik haqida ham xabar keladi. Siz PR/issue ochganingizda, izoh yozganingizda yoki repo'ni kuzatayotganingizda (watch) ham avtomatik obuna bo'lasiz. To'xtatish uchun sahifadagi **Unsubscribe** tugmasi.

**Bildirishnomalar** ikki kanal orqali keladi: veb (GitHub ichidagi bildirishnomalar sahifasi) va email. GitHub email'larida filtrlash uchun foydali sarlavhalar bor. Pro Git misolidan:

```text
Message-ID: <tonychacon/fade/pull/1@github.com>
List-ID: tonychacon/fade <fade.tonychacon.github.com>
List-Unsubscribe: <mailto:unsub+i-XXX@reply.github.com>,...
```

`Message-ID` dagi `<egasi>/<repo>/<tur>/<raqam>` qismidan (`pull` yoki `issues`) pochta qoidalarini tuzish mumkin. Email'ga javob yozsangiz, u PR muhokamasiga izoh bo'lib tushadi.

**Maxsus fayllar.** GitHub repo'dagi ba'zi fayllarni taniydi:

| Fayl | Nima qiladi |
| --- | --- |
| `README` (`README.md`, `README.adoc`...) | Repo bosh sahifasida render qilinadi: loyiha nima, qanday o'rnatiladi, misol, litsenziya, qanday hissa qo'shiladi |
| `CONTRIBUTING` (`CONTRIBUTING.md`) | PR va issue ochishda havola sifatida ko'rsatiladi; repo sahifasida "Contributing" yorlig'i. Qidirish tartibi: `.github/`, ildiz, `docs/` |
| `CODEOWNERS` | Fayl egalarini belgilaydi — pastda batafsil |
| `CODE_OF_CONDUCT`, issue/PR shablonlari | Jamoa "sog'lig'i" fayllari; tashkilotning maxsus `.github` repo'sida standart sifatida ham berilishi mumkin |

**Standart branch'ni almashtirish.** Standart branch — PR'lar odatda ochiladigan, repo sahifasida ko'rinadigan va `clone` qilinganda checkout bo'ladigan branch. GitHub hujjati bo'yicha: **Settings** → "Default branch" bo'limi → almashtirish tugmasi → yangi branch → **Update** → **I understand, update the default branch**. Admin huquqi va kamida ikkita branch kerak. `gh` bilan: `gh repo edit --default-branch main`. Branch nomini o'zgartirishning Git tomoni — [23-bob](23-branch-boshqaruvi.md).

**Repo'ni o'tkazish (transfer).** **Settings** → **Danger Zone** → **Transfer**. Repo boshqa foydalanuvchi yoki tashkilotga o'tadi; issue'lar, PR'lar, wiki, yulduzchalar, kuzatuvchilar, webhook'lar birga ko'chadi. GitHub eski manzildan **yo'naltirish** (redirect) o'rnatadi — nafaqat brauzer uchun, `git clone`/`fetch`/`push` uchun ham. Ikki ogohlantirish:

- eski manzilda **yangi repo yoki fork yaratilsa**, yo'naltirish butunlay o'chadi;
- shuning uchun lokal klonlarda remote URL'ni yangilab qo'ying: `git remote set-url origin YANGI_URL` ([27-bob](27-remote.md)).

## Kod: himoyalangan branch'lar

**Muammo.** Hamkorlarga yozish huquqini berdingiz. Endi har biri `main` ga to'g'ridan-to'g'ri push qila oladi, uni force-push bilan qayta yoza oladi yoki o'chira oladi.

**Yechim.** Himoyalangan branch (protected branch) qoidasi: **Settings** → **Branches** → "Add branch protection rule". Qoida nom shabloni bilan branch'larga bog'lanadi (`fnmatch` sintaksisi: `main`, `release/*`, `*release*`). GitHub hujjatidagi sozlamalar:

| Sozlama | Ma'nosi |
| --- | --- |
| Require pull request reviews before merging | Merge'dan oldin belgilangan sondagi tasdiq (approve) kerak |
| Dismiss stale pull request approvals when new commits are pushed | Yangi commit diff'ni o'zgartirsa, oldingi tasdiqlar bekor bo'ladi |
| Require review from Code Owners | `CODEOWNERS` dagi egalardan biri tasdiqlashi kerak |
| Require approval of the most recent reviewable push | Oxirgi push'ni push qilgan odamdan **boshqa** kishi tasdiqlashi kerak |
| Require status checks to pass before merging | CI tekshiruvlari muvaffaqiyatli (yoki skipped/neutral) bo'lishi kerak |
| Require branches to be up to date before merging | "Qat'iy" rejim: PR branch'i base'ning eng so'nggi holatini o'z ichiga olishi kerak |
| Require conversation resolution before merging | Hamma izoh muhokamalari "resolved" bo'lishi kerak |
| Require signed commits | Faqat tasdiqlangan imzoli commit'lar ([44-bob](44-imzolash.md)) |
| Require linear history | Merge commit taqiqlanadi — faqat squash yoki rebase |
| Require merge queue | Merge'lar navbat orqali, base'ning eng yangi holati bilan sinab birlashtiriladi |
| Require deployments to succeed before merging | Belgilangan muhitlarga deploy muvaffaqiyatli bo'lishi kerak |
| Lock branch | Branch faqat o'qish uchun: commit ham, o'chirish ham mumkin emas |
| Do not allow bypassing the above settings | Qoidalar adminlarga ham amal qiladi |
| Restrict who can push to matching branches | Push faqat sanab o'tilgan odam, jamoa yoki ilovalarga |
| Allow force pushes | Force-push'ga ruxsat (standartda o'chiq); faqat ma'lum odamlarga ham berish mumkin |
| Allow deletions | Branch'ni o'chirishga ruxsat (standartda o'chiq) |

Qoida yaratish uchun repo admini yoki "edit repository rules" huquqi kerak. Hujjat bo'yicha himoyalangan branch'lar GitHub Free'dagi **public** repo'larda va GitHub Team / Enterprise Cloud tariflaridagi hamma repo'larda mavjud. Muhim cheklov: bitta branch'ga **bir vaqtda faqat bitta** himoya qoidasi amal qiladi — shablonlar kesishsa, qaysi biri ishlashi chalkash bo'ladi.

**Git darajasida nima bo'ladi.** "Allow force pushes" va "Allow deletions" o'chiq bo'lganda GitHub push'ni rad etadi. Oddiy Git serverida xuddi shunday ikki sozlama bor (`git help config`):

- `receive.denyNonFastForwards` — fast-forward bo'lmagan yangilanishni rad etadi, **push majburiy (`--force`) bo'lsa ham**;
- `receive.denyDeletes` — ref'ni o'chiradigan push'ni rad etadi.

Sinov serverida ikkalasini yoqib ko'ramiz:

```text
$ git -C ../server.git config receive.denyNonFastForwards true
$ git -C ../server.git config receive.denyDeletes true
$ git push --force origin usul-merge:main
remote: error: denying non-fast-forward refs/heads/main (you should pull first)
To .../server.git
 ! [remote rejected] usul-merge -> main (non-fast-forward)
error: failed to push some refs to '.../server.git'
$ git push origin --delete eski
remote: error: denying ref deletion for refs/heads/eski
To .../server.git
 ! [remote rejected] eski (deletion prohibited)
error: failed to push some refs to '.../server.git'
```

`--force` ham yordam bermadi — qaror serverda. "Require pull request reviews" yoki "status checks" kabi murakkab qoidalarni oddiy Git serverida `pre-receive` hook bilan yozish mumkin ([47-bob](47-hooklar.md)); GitHub ularni tayyor holda beradi.

## Kod: ruleset'lar — himoyaning yangi avlodi

Ruleset — branch yoki teg'larga qo'llanadigan **nomlangan qoidalar to'plami**. U himoyalangan branch qoidalarining zamonaviy muqobili: **Settings** → **Rules** → **Rulesets** → **New ruleset** → **New branch ruleset** (teg uchun — **New tag ruleset**).

Himoyalangan branch'dan asosiy farqlari (GitHub hujjatidan):

- **Qatlamlanadi.** Bitta branch'ga bir nechta ruleset bir vaqtda amal qilishi mumkin; bir qoida bir necha joyda turli sozlangan bo'lsa, **eng qat'iysi** ishlaydi.
- **Holat (enforcement status).** **Active** — darhol majburlanadi; **Disabled** — majburlanmaydi; **Evaluate** — majburlamay, faqat "o'tardi/o'tmasdi" natijasini "Rule insights" sahifasida ko'rsatadi (qoidani yoqishdan oldin sinash uchun; mavjudligi tarifga bog'liq). Ruleset'ni o'chirmasdan vaqtincha to'xtatish mumkin.
- **Shaffof.** Repo'ni o'qish huquqi bor har kim faol ruleset'larni ko'ra oladi.
- **Chetlab o'tish ro'yxati (bypass list).** Kimga qoidani chetlab o'tishga ruxsat — rol (admin, maintain, write), jamoa, GitHub App. Har biri uchun **Always allow** yoki **For pull requests only** (faqat PR orqali — iz qoladi).
- **Nishon (target).** "Include default branch", "Include all branches" yoki `fnmatch` shabloni; istisno ham qo'shish mumkin.
- **Teg'lar uchun ham** ishlaydi, **push ruleset'lar** esa butun repo'dagi har push'ni tekshiradi (va fork tarmog'iga ham tarqaladi).
- Tashkilot darajasida ko'p repo'ga birdaniga qo'llash, JSON sifatida eksport/import qilish mumkin.

Ruleset'dagi qoidalar (asosiylari):

| Qoida | Ma'nosi |
| --- | --- |
| Restrict creations / updates / deletions | Mos nomli branch/teg'ni yaratish, unga push qilish, o'chirish — faqat bypass huquqi borlarga (deletions standartda yoqiq) |
| Block force pushes | Force-push taqiqlanadi (standartda yoqiq) |
| Require linear history | Merge commit yo'q |
| Require a pull request before merging | O'zgarish faqat PR orqali |
| Require status checks to pass before merging | CI o'tishi shart |
| Require signed commits | Faqat imzoli commit'lar |
| Require deployments to succeed before merging | Muhitlarga deploy |
| Require code scanning results | Kod skanerlash ogohlantirishlari bo'lsa, merge yo'q |
| Restrict file paths / file path length / file extensions / file size | (push ruleset'lar) belgilangan yo'l, kengaytma, hajmdagi fayllarni push qilishni taqiqlash |

`fnmatch` bo'yicha eslatma: `*` belgisi `/` ni qamramaydi; ko'p darajali nom uchun `**/*` (masalan `releases/**/*`). Teskari to'plam (`[^...]`) va extglob qo'llab-quvvatlanmaydi.

Ruleset'larni terminaldan ko'rish (sintaksis `gh ruleset --help` dan):

```bash
gh ruleset list                 # repo yoki tashkilotdagi ruleset'lar
gh ruleset check feature-x      # shu branch'ga qaysi qoidalar amal qiladi
gh api repos/{owner}/{repo}/rulesets --input file.json   # JSON'dan ruleset yaratish (REST API)
```

## Kod: `CODEOWNERS`

`CODEOWNERS` — "bu fayllarga kim mas'ul" ro'yxati. PR shu fayllarga tegsa, egalariga **avtomatik review so'rovi** yuboriladi. Himoya qoidasida "Require review from Code Owners" yoqilgan bo'lsa, ulardan **birining** tasdig'i majburiy bo'ladi (hammasining emas).

Joylashuvi: `.github/`, repo ildizi yoki `docs/` — GitHub shu tartibda qidiradi va birinchi topilganini ishlatadi. Fayl 3 MB dan kichik bo'lishi kerak. Har branch'da o'z `CODEOWNERS` i bo'lishi mumkin; PR uchun uning **base branch'idagi** fayl hisobga olinadi.

GitHub hujjatidagi namuna asosida:

```gitignore
# Har qator: <shablon> <egalar...>. Oxirgi mos kelgan qator yutadi.
*                @global-owner1 @global-owner2

# .js fayllar — faqat @js-owner (yuqoridagi * ni bekor qiladi)
*.js             @js-owner

# egasi email bilan ham ko'rsatilishi mumkin
*.go             docs@example.com

# tashkilot jamoasi
*.txt            @octo-org/octocats

# ildizdagi /build/logs/ va ichidagi hamma narsa
/build/logs/     @doctocat

# docs/ ning bevosita ichidagi fayllar (docs/a/b.md emas)
docs/*           docs@example.com

# /apps/ — @octocat, lekin /apps/github — faqat @doctocat
/apps/           @octocat
/apps/github     @doctocat

# istalgan joydagi logs papkasi
**/logs          @octocat

# CODEOWNERS'ning o'ziga ham ega qo'ying
/.github/CODEOWNERS @owner_username
```

Sintaksis `.gitignore` ga ([8-bob](08-gitignore-rm-mv.md)) o'xshaydi, lekin uchta istisno bilan: `!` bilan inkor **ishlamaydi**, `[ ]` belgilar oralig'i **ishlamaydi**, `#` bilan boshlanadigan shablonni `\#` bilan ekranlash **ishlamaydi** (izoh deb olinadi). Eng muhim qoida — **oxirgi mos kelgan qator yutadi**, shuning uchun umumiy shablonlar yuqorida, aniqlari pastda. Bir qatordagi hamma egaga so'rov boradi; egalarni bir necha qatorga bo'lsangiz, faqat oxirgisi amal qiladi.

Egalar (`@user`, `@org/team`, email) repo'ga **yozish** huquqiga ega bo'lishi shart. Noto'g'ri qatorlar jimgina o'tkazib yuboriladi — xatolarni GitHub `CODEOWNERS` faylini ochganda ko'rsatadi.

## Kod: tashkilot (organization)

Tashkilot — bir guruh odamlarning umumiy loyihalari uchun hisob: ochiq loyiha jamoalari (`rails`, `perl`) yoki kompaniyalar. Shaxsiy hisob kabi uning ham nomlar maydoni (`github.com/<tashkilot>/<repo>`), avatari, bosh sahifasi bor. Yaratish: `+` → **New organization**, nom va aloqa email'i. Tashkilot egasi sifatida fork qilganda yoki repo yaratganda tashkilot nomlar maydonini tanlashingiz mumkin.

**Tashkilot rollari** (GitHub hujjatidan):

| Rol | Kim |
| --- | --- |
| Owner | To'liq boshqaruv; davomiylik uchun kamida ikki kishi tavsiya etiladi |
| Member | Standart rol; standartda repo yarata oladi |
| Moderator | Tashkilot a'zosi bo'lmaganlarni bloklash, izohlarni yashirish |
| Billing manager | To'lov sozlamalari |
| Security manager | Xavfsizlik ogohlantirishlarini ko'rish, xavfsizlik sozlamalari, hamma repo'ni o'qish |
| Outside collaborator | Tashkilot a'zosi emas, lekin ba'zi repo'larga ruxsati bor (masalan, pudratchi) |

**Repo rollari** — tashkilot repo'sida kimga qancha huquq:

| Rol | Kim uchun | Asosiy huquqlar |
| --- | --- | --- |
| Read | Kod yozmaydigan ishtirokchilar | Pull, fork, issue ochish, PR'ga izoh |
| Triage | Issue va PR'larni tartibga soluvchilar | + label, issue yopish/ochish, review so'rash |
| Write | Faol dasturchilar | + push, PR merge, reliz |
| Maintain | Loyiha menejerlari | + repo sozlamalarining bir qismi, webhook'lar; xavfli amallarsiz |
| Admin | To'liq mas'ullar | + ruxsatlar, himoya qoidalari, repo'ni o'chirish |

**Jamoalar (teams).** Ruxsatlarni har repo'da har odamga alohida bermaslik uchun odamlar jamoalarga yig'iladi va jamoaga repo'lar bo'yicha rol beriladi. Masalan, `frontend`, `backend`, `deployscripts` repo'lari bo'lsa: `@acme/frontend` jamoasiga birinchi ikkitasi, `@acme/ops` jamoasiga oxirgi ikkitasi. Jamoalar:

- **ichma-ich** bo'lishi mumkin — bola jamoa ota jamoaning ruxsatlarini meros oladi;
- **visible** (hamma a'zo ko'radi) yoki **secret** (faqat a'zolari) bo'ladi;
- `@org/team` bilan eslatiladi — jamoaning **hamma** a'zosi obuna bo'ladi; kimdan so'rashni bilmasangiz qulay;
- `CODEOWNERS` da ega sifatida va review so'rovida ishlatiladi.

Pro Git maslahati: jamoalar faqat ruxsat uchun emas — `ux`, `refactoring`, `legal` kabi "qiziqish" jamoalari savolni to'g'ri odamlarga yetkazishga yordam beradi.

**Audit log.** Tashkilot egalari **Audit log** sahifasida tashkilot darajasidagi hodisalarni ko'radi: nima bo'ldi, kim qildi, qayerdan. Hodisa turi, joy yoki odam bo'yicha filtrlash mumkin.

## Kod: webhook'lar

Pro Git "Services" (tayyor integratsiyalar) bo'limini ham tasvirlaydi — GitHub hujjatiga ko'ra **GitHub Services iste'foga chiqarilgan**, o'rniga webhook'lar ishlatiladi (bugun bunga GitHub Apps va GitHub Actions ham qo'shiladi).

**Webhook** — GitHub'da biror hodisa bo'lganda (push, PR ochildi, issue izohi...) siz bergan URL'ga HTTP POST so'rovi bilan JSON yuborish. Bu "so'rab turish" (API'ni har daqiqada tekshirish) o'rniga "xabar berish": kamroq resurs, deyarli darhol. Repo, tashkilot yoki GitHub App darajasida yaratiladi: **Settings** → **Webhooks** → **Add webhook** → URL, content type, **secret**, hodisalar (standart — faqat `push`).

Pro Git'dagi Sinatra misoli g'oyasi: push payload'idan kim push qilgani (`pusher.name`), qaysi ref (`ref`), qaysi fayllar o'zgargani (`commits[].added/modified/removed`) o'qiladi va shartga mos kelsa xat yuboriladi. E'tibor bering, payload'dagi `ref` — to'liq ref nomi: `refs/heads/special-branch` (kitob misolida `ref/heads/...` deb xato yozilgan — `s` tushib qolgan, bu shart hech qachon bajarilmaydi).

**Payload'ni tekshirish.** Ochiq URL'ga istalgan kishi so'rov yubora oladi. Shuning uchun secret o'rnatiladi va GitHub har so'rovga `X-Hub-Signature-256` sarlavhasini qo'shadi: payload'ning secret bilan HMAC-SHA256 qiymati, `sha256=` prefiksi bilan. Server o'zi ham hisoblab, **doimiy vaqtli** solishtirish (`secure_compare`, `crypto.timingSafeEqual`) bilan tekshiradi. GitHub hujjatidagi sinov qiymatlarini `openssl` bilan tekshiramiz:

```text
$ printf 'Hello, World!' | openssl dgst -sha256 -hmac "It's a Secret to Everybody"
757107ea0eb2509fc211221cce984b8a37570b6d7586c22c46f4379c8b043e17
```

Hujjatdagi kutilgan qiymat — `sha256=757107ea0eb2509fc211221cce984b8a37570b6d7586c22c46f4379c8b043e17`. Mos keldi.

Webhook sozlamalari sahifasida so'nggi yetkazishlar (so'rov va javobning sarlavha va tanasi) ko'rinadi va istalganini qayta yuborish (redeliver) mumkin — xizmatni tuzatishda juda qulay.

## Kod: REST API va `gh`

Webhook "nima bo'ldi" deydi; ko'proq ma'lumot olish yoki amal bajarish (izoh yozish, label qo'yish, PR'ni merge qilish) uchun **API** kerak. Veb-saytda qila oladigan deyarli hamma narsani API orqali avtomatlashtirish mumkin.

Asosiy narsalar (GitHub REST API hujjatidan):

- manzil: `https://api.github.com`;
- `Accept: application/vnd.github+json` sarlavhasi tavsiya etiladi;
- `X-GitHub-Api-Version: 2022-11-28` — API versiyasi;
- `User-Agent` majburiy (usiz `403`) — `curl` uni o'zi qo'yadi;
- autentifikatsiya: `Authorization: Bearer <TOKEN>` (Pro Git'dagi `Authorization: token <TOKEN>` shakli ham ishlaydi);
- sahifalash `Link` sarlavhasi orqali (`rel="next"`, `rel="last"`).

Ochiq ma'lumotni token'siz o'qish mumkin (Pro Git misoli):

```bash
curl https://api.github.com/users/schacon
curl https://api.github.com/gitignore/templates/Java
```

Yozish (masalan, issue'ga izoh) — token bilan. GitHub hujjatidagi shakl:

```bash
curl --request POST \
  --url "https://api.github.com/repos/OWNER/REPO/issues/6/comments" \
  --header "Accept: application/vnd.github+json" \
  --header "X-GitHub-Api-Version: 2022-11-28" \
  --header "Authorization: Bearer YOUR-TOKEN" \
  --data '{"body":"Yangi izoh"}'
```

**Token.** Pro Git'dagi "Applications" tab endi **Settings** → **Developer settings** → **Personal access tokens**. Ikki xil token bor: **fine-grained** (bitta foydalanuvchi yoki tashkilot, tanlangan repo'lar, aniq ruxsatlar — GitHub shuni tavsiya qiladi) va **classic** (hamma kirish mumkin bo'lgan repo'larga keng ruxsat). Token parol kabi saqlanadi: muddat qo'ying, minimal ruxsat bering, kodga yozmang ([30-bob](30-ssh-va-credential.md)).

**Rate limit** (soatiga so'rovlar): token'siz — 60; shaxsiy token bilan — 5 000; GitHub Actions'dagi `GITHUB_TOKEN` — repo uchun 1 000; GitHub App — kamida 5 000. Qolgan miqdor `x-ratelimit-remaining`, tiklanish vaqti `x-ratelimit-reset` sarlavhalarida; umumiy holat — `GET /rate_limit`.

**Commit status API.** Pro Git'ning so'nggi misoli: har commit'ga bir yoki bir nechta **status** biriktirish mumkin — `POST /repos/<egasi>/<repo>/statuses/<sha>`, tanasida `state` (`success`, `failure`, `error`, `pending`), `description`, `target_url` va `context`. `context` — bir commit'dagi turli tekshiruvlarni ajratadi (masalan `ci/test` va `validate/signoff`). Pro Git'da webhook har push'dagi commit xabarida `Signed-off-by` bor-yo'qligini tekshirib, shu API orqali yashil belgi yoki qizil xoch qo'yadi. PR sahifasi oxirgi commit statusini ko'rsatadi; himoya qoidasidagi "Require status checks" aynan shu (va zamonaviy "check runs") natijalariga qaraydi. Bugun bunday tekshiruvlar odatda GitHub Actions bilan yoziladi.

**`gh api`.** `gh` CLI token va sarlavhalarni o'zi qo'shadi; `{owner}` va `{repo}` joriy repo'dan olinadi (sintaksis `gh api --help` dan):

```bash
gh api repos/{owner}/{repo}/issues/123/comments -f body='Hi from CLI'   # -f bo'lsa, POST
gh api repos/{owner}/{repo}/issues --jq '.[].title'                     # javobdan maydon
gh api -X GET search/issues -f q='repo:cli/cli is:open remote'          # GET + query
gh api --paginate repos/{owner}/{repo}/pulls                            # hamma sahifalar
```

Kundalik maintainer ishi uchun tayyor buyruqlar (`--help` lardan):

```bash
gh pr list --state open --base main          # ochiq PR'lar
gh pr checkout 32                            # PR'ni lokalga olish
gh pr review 32 --approve                    # tasdiqlash
gh pr review 32 --request-changes -b "Test qo'shing"
gh pr merge 32 --squash --delete-branch      # yoki --merge / --rebase
gh pr merge 32 --auto --squash               # talablar bajarilganda avtomatik merge
gh repo edit --enable-squash-merge --delete-branch-on-merge
```

Pro Git eslatgan **Octokit** — bir nechta til uchun rasmiy API kutubxonalari (HTTP'ni o'zi boshqaradi): <https://github.com/octokit>.

## Muhandislik nuqtai nazari: qaysi merge usuli

| Savol | Merge commit | Squash | Rebase |
| --- | --- | --- | --- |
| PR'ning ichki tarixi saqlanadimi | Ha | Yo'q | Ha (yangi hash'lar bilan) |
| `main` chiziqlimi | Yo'q | Ha | Ha |
| Butun PR'ni bitta `revert` bilan qaytarish | `revert -m 1` ([26-bob](26-murakkab-merge.md)) | Oddiy `revert` | Har commit alohida |
| `bisect` ([41-bob](41-blame-va-bisect.md)) aniqligi | Yaxshi, agar commit'lar toza bo'lsa | Qo'pol — butun PR bitta qadam | Yaxshi |
| Hissachining lokal branch'i | O'zgarmaydi, `branch -d` ishlaydi | `main` da yo'q — `branch -d` "not fully merged" deydi | Hash'lar boshqa — xuddi shunday |

Amaliy qoida: PR'dagi commit'lar "WIP", "tuzatdim", "yana tuzatdim" bo'lsa — squash. Har commit mantiqiy, atomar bo'lsa ([10-bob](10-yaxshi-commit.md)) — merge commit yoki rebase. Ko'p jamoalar bitta usulni tanlab, qolganlarini repo sozlamalarida o'chirib qo'yadi; "Require linear history" yoqilsa, merge commit usuli o'z-o'zidan yopiladi. Merge queue yoqilsa, usulni navbat belgilaydi.

## Muhandislik nuqtai nazari: himoyani qanday qurish

Kichik jamoa uchun boshlang'ich to'plam (`main` ga ruleset):

1. **Require a pull request before merging** — 1 tasdiq; "dismiss stale approvals" yoqiq.
2. **Require status checks to pass** — CI testlari.
3. **Block force pushes** va **Restrict deletions** — tarix va branch saqlanadi.
4. `CODEOWNERS` + "Require review from Code Owners" — muhim papkalar uchun (masalan `/infra/`, `/.github/`).
5. Bypass ro'yxati — minimal; zarur bo'lsa "For pull requests only".

Nimaga e'tibor berish kerak:

- **Qoidalar adminlarga ham amal qilsin** ("Do not allow bypassing"), aks holda shoshilinch paytda "bir martaga" chetlab o'tish odatga aylanadi.
- **Ruleset'ni avval Evaluate rejimida** sinang (mavjud bo'lsa) — kimning ishi to'xtashini oldindan ko'rasiz.
- **`CODEOWNERS` ning o'ziga ega qo'ying** — aks holda har kim o'zini istalgan papkaga ega qilib, review'ni chetlab o'tishi mumkin.
- **"Require branches to be up to date"** qat'iy, lekin ko'p PR bo'lsa, har merge'dan keyin hamma PR qayta yangilanishi kerak bo'ladi — bunda merge queue yaxshiroq.
- **Tashkilotda** ruxsatni odamga emas, jamoaga bering; kamida ikki owner; tashqi pudratchilar — outside collaborator, a'zo emas.

## Muhandislik nuqtai nazari: PR ref'lari va xavfsizlik

`refs/pull/*/head` — **begona** kod. Uni `fetch` qilish xavfsiz (bu shunchaki obyektlar), lekin `switch` qilib, `npm install`, `make`, testlar yoki hook'larni ishga tushirish — uning kodini kompyuteringizda bajarish demak. Avval `git log -p main..pr-1` bilan ko'rib chiqing, ayniqsa build skriptlari, CI konfiguratsiyasi va `package.json` dagi o'zgarishlarni.

Xuddi shu sabab bilan CI'da fork'dan kelgan PR'lar odatda maxfiy kalitlarsiz ishga tushiriladi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `main` ni himoyasiz qoldirish | Kimdir `push --force` bilan tarixni o'chiradi yoki review'siz kod tushadi | Ruleset: PR talab, force-push va o'chirish bloklangan |
| Adminlarga qoidalarni chetlab o'tishga ruxsat | "Bir martalik" istisno odatga aylanadi | "Do not allow bypassing" yoki minimal bypass ro'yxati |
| `CODEOWNERS` da umumiy `*` ni faylning oxiriga yozish | Oxirgi mos qator yutadi — `*` hammasini bosib ketadi | Umumiy shablonlar yuqorida, aniqlari pastda |
| `CODEOWNERS` da `!` yoki `[a-z]` ishlatish | Ishlamaydi, qator jimgina o'tkazib yuboriladi | Aniq yo'llar yoki `*`/`**` shablonlari |
| Yozish huquqi yo'q odamni `CODEOWNERS` ga yozish | Unga review so'rovi bormaydi | Egaga (yoki jamoasiga) write rolini bering |
| `refs/pull/1/head` ga push qilish | `deny updating a hidden ref` — faqat o'qish uchun | PR manba branch'iga push qiling |
| Squash'dan keyin hissachi eski branch'da davom etadi | Keyingi PR'da eski commit'lar yana chiqadi, konflikt | Merge'dan keyin branch'ni o'chirib, yangisini `origin/main` dan oching |
| Repo'ni ko'chirgandan keyin eski nomda yangi repo ochish | Yo'naltirishlar butunlay o'chadi, eski klonlar sinadi | Eski nomni bo'sh qoldiring, `git remote set-url` |
| Token'ni skriptga yozib commit qilish | Repo'ni o'qigan har kim hisobingiz nomidan ishlay oladi | Fine-grained token, muddat, `gh auth login` yoki secret'lar |
| Webhook secret'siz yoki `==` bilan tekshirish | Soxta so'rovlar, timing hujumi | Secret + `X-Hub-Signature-256` ni doimiy vaqtli solishtirish |
| `gh api` bilan GET qilmoqchi bo'lib `-f` qo'shish | `-f` metodni POST ga o'zgartiradi | `-X GET` ni aniq yozing |

## Amaliyot

1. Bo'sh papkada `git init --bare -b main server.git` yarating, uni ikki marta klonlang ("maintainer" va "hissachi"). Hissachi branch'ida ikki commit qilib, `server.git` ga `refs/pull/1/head` nomi bilan yozing (`git push origin HEAD:refs/pull/1/head`).
2. Maintainer klonida `git ls-remote origin` bilan PR ref'ini ko'ring, so'ng `git fetch origin pull/1/head:pr-1` bilan lokal branch yarating.
3. `remote.origin.fetch` ga `+refs/pull/*/head:refs/remotes/origin/pr/*` qo'shing, `git fetch` va `git branch -r` natijasini ko'ring.
4. `pr-1` ni uch usulda alohida branch'larga birlashtiring: `merge --no-ff`, `merge --squash` + `commit`, `rebase`. Har birida `git log --graph --oneline` va `git log --format='%h %an | %cn'` ni solishtiring.
5. Serverda `receive.hideRefs refs/pull`, `receive.denyNonFastForwards true`, `receive.denyDeletes true` ni yoqing va har birini buzadigan push'ni sinab, rad xabarlarini o'qing.
6. O'z loyihangiz uchun `CODEOWNERS` yozing: umumiy ega, `/docs/` uchun alohida ega, `CODEOWNERS` ning o'ziga ega. Har yo'l uchun "oxirgi mos qator" qoidasi bo'yicha kim ega bo'lishini qog'ozda aniqlang.
7. GitHub hujjatidagi webhook sinov qiymatlarini (`It's a Secret to Everybody`, `Hello, World!`) `openssl dgst -sha256 -hmac` bilan tekshiring. Payload'da bitta belgini o'zgartirib, imzo butunlay o'zgarishini ko'ring.
8. (Qiyinroq) Sinov serverida `hooks/pre-receive` skriptini yozing ([47-bob](47-hooklar.md)): `refs/heads/main` ga kelgan har yangi commit xabarida `Signed-off-by:` bo'lmasa, push'ni rad etsin. Bu — Pro Git'dagi status API misolining server tomonidagi "qattiq" varianti; ikkalasining farqini (ogohlantirish vs taqiq) yozib chiqing.

## Rasmiy hujjat

- Pro Git — GitHub, Maintaining a Project: <https://git-scm.com/book/en/v2/GitHub-Maintaining-a-Project>
- Pro Git — GitHub, Managing an organization: <https://git-scm.com/book/en/v2/GitHub-Managing-an-organization>
- Pro Git — GitHub, Scripting GitHub: <https://git-scm.com/book/en/v2/GitHub-Scripting-GitHub>
- GitHub — About protected branches: <https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches>
- GitHub — About rulesets: <https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets>
- GitHub — Available rules for rulesets: <https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets>
- GitHub — About code owners: <https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners>
- GitHub — About merge methods: <https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/about-merge-methods-on-github>
- GitHub — Checking out pull requests locally: <https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/checking-out-pull-requests-locally>
- GitHub — Roles in an organization: <https://docs.github.com/en/organizations/managing-peoples-access-to-your-organization-with-roles/roles-in-an-organization>
- GitHub — Repository roles: <https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/repository-roles-for-an-organization>
- GitHub — About teams: <https://docs.github.com/en/organizations/organizing-members-into-teams/about-teams>
- GitHub — About webhooks: <https://docs.github.com/en/webhooks/about-webhooks>
- GitHub — Validating webhook deliveries: <https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries>
- GitHub — Getting started with the REST API: <https://docs.github.com/en/rest/using-the-rest-api/getting-started-with-the-rest-api>
- GitHub — Rate limits for the REST API: <https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api>
- GitHub CLI manual: <https://cli.github.com/manual>
- `git ls-remote`: <https://git-scm.com/docs/git-ls-remote>
- `git config` (`receive.denyNonFastForwards`, `receive.denyDeletes`, `receive.hideRefs`): <https://git-scm.com/docs/git-config>
