# 50 — Buyruqlar xaritasi va checklist

[← Oldingi: Worktree va katta repo'lar](49-worktree-va-katta-repo.md) · [Mundarija](README.md)

## Tushuncha

Bu — kitobning oxirgi bobi. Unda yangi mavzu deyarli yo'q: u **xarita**. Oldingi 49 bobda buyruqlar hikoya ichida, kerak bo'lgan joyda birma-bir kiritildi. Natijada bitta buyruq haqidagi gap bir nechta bobga tarqalib ketdi — masalan, `git config` 3-bobda boshlanib, 12-, 28-, 45-, 47-boblarda davom etadi. Pro Git kitobining "Git Commands" ilovasi xuddi shu muammo uchun yozilgan: buyruqlarni vazifasi bo'yicha guruhlab, har biri kitobning qayerida ishlatilganini ko'rsatadi. Bu bob shu ilova tuzilishiga amal qiladi, lekin havolalar bizning boblarga, ro'yxat esa Git 2.56 holatiga moslangan.

Bobda to'rt qism bor:

1. **Model** — butun kitobning bitta rasmdagi xulosasi. Har buyruqni shu rasm orqali tushunish mumkin.
2. **Buyruqlar xaritasi** — guruhlar bo'yicha jadvallar: buyruq, bir qatorlik vazifasi va batafsil yozilgan bob.
3. **Kundalik checklist** va **"Xato qildim — endi nima?"** jadvali — eng ko'p uchraydigan holatlar uchun tayyor retseptlar.
4. **Git 3.0** — yaqin kelajakda nima o'zgaradi va hozir nimaga tayyorlanish kerak.

### Kitob qanday tuzilgan

| Qism | Boblar | Savol |
| --- | --- | --- |
| I. Boshlash | [1](01-versiya-nazorati.md)–[5](05-uch-holat.md) | Git nima, qanday o'rnatiladi, repo qayerdan olinadi, uch hudud nima |
| II. Kundalik ish | [6](06-ozgarishlarni-yozish.md)–[12](12-teglar-va-aliaslar.md) | O'zgarishni qanday yozish, ko'rish, bekor qilish, teglash |
| III. Git ichkaridan | [13](13-plumbing-va-porcelain.md)–[19](19-revision-tanlash.md) | `.git` ichida nima bor: obyektlar, ref'lar, pack'lar, revision nomlari |
| IV. Branch'lar | [20](20-branch-bu-ref.md)–[26](26-murakkab-merge.md) | Branch, merge, konflikt, rebase, tarixni qayta yozish |
| V. Masofaviy repo | [27](27-remote.md)–[31](31-branch-workflowlari.md) | Remote, tracking, refspec, SSH, branch uslublari |
| VI. Jamoa va GitHub | [32](32-taqsimlangan-workflowlar.md)–[36](36-github-boshqaruv.md) | Workflow'lar, hissa qo'shish, loyihani yuritish, PR |
| VII. Asboblar | [37](37-interaktiv-staging.md)–[44](44-imzolash.md) | `add -p`, `stash`, `reset`, qidiruv, `bisect`, `reflog`, submodule, imzo |
| VIII. Sozlash | [45](45-config-chuqur.md)–[48](48-muhit-ozgaruvchilari.md) | `config`, `.gitattributes`, hook'lar, muhit o'zgaruvchilari |
| IX. Katta loyihalar va yakun | [49](49-worktree-va-katta-repo.md)–50 | Worktree, sparse/partial/shallow, `scalar`, shu xarita |

III qism kitobning skeleti: undan keyingi hamma narsa — branch ham, rebase ham, `reflog` ham — o'sha modelning ustiga qurilgan.

### Butun kitob bitta rasmda

```text
  WORKING TREE              INDEX (staging)            REPOSITORY (.git)
  diskdagi fayllar          .git/index                 obyektlar + ref'lar
 +----------------+       +----------------+       +----------------------------------+
 |                |  add  |                | commit|  OBYEKTLAR (hash bilan, o'zgarmas)|
 |  README.md     |------>|  keyingi       |------>|                                  |
 |  src/app.js    |       |  commit'ning   |       |  commit C2 --> tree --> blob     |
 |                |<------|  loyihasi      |       |     | ota          \--> tree     |
 +----------------+restore+----------------+       |     v                            |
        ^          restore --staged <--------------|  commit C1 --> tree --> blob     |
        |                                          |                                  |
        |  switch / restore --source / reset --hard|  REF'LAR (ko'chadigan nomlar)    |
        +------------------------------------------|  HEAD -> refs/heads/main -> C2   |
                                                   |  refs/tags/v1.0 -> tag -> C1     |
                                                   |  refs/remotes/origin/main -> C1  |
                                                   |  logs/ (reflog): ref qayerda edi |
                                                   +----------------------------------+
                                                          ^ fetch          | push
                                                          |                v
                                                   +----------------------------------+
                                                   |  REMOTE (origin): o'z obyektlari |
                                                   |  va o'z refs/heads/* lari        |
                                                   +----------------------------------+
```

Bu rasmdan beshta qoida chiqadi va kitobdagi deyarli hamma buyruq shulardan biriga tayanadi:

1. **Uch hudud** ([5-bob](05-uch-holat.md)). Fayl uch joyda turli versiyada bo'lishi mumkin: working tree, index, oxirgi commit. `git status` va `git diff` — shu uchtasini solishtirish ([6](06-ozgarishlarni-yozish.md), [7](07-diff.md)).
2. **Obyektlar o'zgarmaydi** ([14](14-obyektlar-blob.md)–[16](16-commit-obyekti.md)). Blob, tree, commit, tag — mazmunning hash'i bilan saqlanadi. "Commit'ni o'zgartirish" (`--amend`, `rebase`) aslida yangi commit yaratadi, eskisi joyida qoladi.
3. **Ref — ko'rsatkich** ([17](17-reflar-va-head.md), [20](20-branch-bu-ref.md)). Branch — commit hash'i yozilgan kichik yozuv, `HEAD` — "hozir qaysi branch'dasiz". Ko'p buyruq faqat ref'ni suradi: `reset`, `branch -f`, `merge` (fast-forward), `push`.
4. **Reflog — xavfsizlik to'ri** ([42-bob](42-reflog-va-tiklash.md)). Har ref harakati lokal jurnalga yoziladi. Obyekt hech qaysi ref'dan va reflog'dan yetib bo'lmay qolganda va muddati o'tgandagina `gc` uni o'chiradi ([18](18-packfile-va-gc.md)).
5. **Remote — boshqa repo** ([27](27-remote.md)–[29](29-fetch-push-ichidan.md)). `fetch` u yerdan obyekt va `refs/remotes/*` ni olib keladi, `push` sizning obyekt va ref'laringizni u yerga yozadi. Ikki repo o'rtasida faqat shu ikki yo'nalish bor.

## Nega shunday: nega buyruqlarni yodlash emas, modelni bilish kerak

`git help -a` Git 2.56 da 154 ta buyruqni sanaydi, ulardan 46 tasi "Main Porcelain" (kundalik foydalanuvchi buyruqlari). Har birining o'nlab opsiyasi bor — yodlab bo'lmaydi. Lekin yuqoridagi model bilan har qanday buyruq haqida to'rtta savol berish kifoya:

- **HEAD yoki branch'ni suradimi?**
- **Index'ni o'zgartiradimi?**
- **Working tree'dagi fayllarga tegadimi?**
- **Boshqa repo bilan gaplashadimi?**

| Buyruq | Branch/HEAD | Index | Working tree | Remote |
| --- | --- | --- | --- | --- |
| `git add` | — | ha | — | — |
| `git commit` | branch oldinga | — | — | — |
| `git restore <fayl>` | — | — | ha (index'dan) | — |
| `git restore --staged <fayl>` | — | ha (HEAD'dan) | — | — |
| `git switch <branch>` | HEAD boshqa branch'ga | ha | ha | — |
| `git reset --soft <c>` | branch `<c>` ga | — | — | — |
| `git reset [--mixed] <c>` | branch `<c>` ga | ha | — | — |
| `git reset --hard <c>` | branch `<c>` ga | ha | ha | — |
| `git merge`, `git rebase` | branch | ha | ha | — |
| `git fetch` | faqat `refs/remotes/*` | — | — | o'qiydi |
| `git pull` | `fetch` + `merge`/`rebase` | ha | ha | o'qiydi |
| `git push` | remote'dagi branch | — | — | yozadi |

Jadvaldan xavfli amalni ham ko'rish mumkin: **working tree ustunida "ha" bo'lgan va commit qilinmagan o'zgarishni ustidan yozadigan buyruq** — haqiqiy yo'qotish xavfi shu yerda. Commit qilingan narsa esa (obyekt bo'lgani uchun) deyarli har doim reflog orqali qaytadi. `reset --hard`, `restore`, `checkout -- <fayl>`, `clean -f`, `stash drop` dan oldin shuni eslang ([11](11-bekor-qilish.md), [38](38-stash-va-clean.md), [39-bob](39-reset-sirlari.md)).

## Buyruqlar xaritasi

Guruhlar Pro Git'ning "Git Commands" ilovasidagi tartibda. Pro Git'dan keyin chiqqan buyruqlar (`switch`, `restore`, `worktree`, `sparse-checkout`, `maintenance`, `scalar` va 2.4x–2.5x dagi yangilari) mos guruhga qo'shilgan. "Batafsil" ustunida — buyruq asosiy yoritilgan bob, qo'shimcha joylar vergul bilan. "—" — kitobda alohida yoritilmagan, ma'lumotnomaga qarang.

Bir maslahat Pro Git'ning o'zidan: uzun opsiyani qisqartirib yozish mumkin — `git commit --amen` ham `--amend` deb tushuniladi, agar harflar bitta opsiyani aniq belgilasa. Skriptlarda esa doim to'liq nomni yozing.

### Sozlash va yordam

| Buyruq | Nima qiladi | Batafsil |
| --- | --- | --- |
| `git config` | Sozlamalarni o'qish va yozish (system/global/local/worktree) | [3](03-birinchi-sozlash.md), [45](45-config-chuqur.md) |
| `git help`, `git <buyruq> -h` | To'liq ma'lumotnoma yoki qisqa opsiyalar ro'yxati | [3](03-birinchi-sozlash.md), [13](13-plumbing-va-porcelain.md) |
| `git version`, `--build-options` | Git versiyasi va yig'ilish parametrlari | [2](02-terminal-va-ornatish.md) |
| `git var` | Git ishlatadigan qiymatlar: muallif, muharrir, pager | [3](03-birinchi-sozlash.md) |
| `git bugreport`, `git diagnose` | Xato hisoboti uchun muhit ma'lumotini yig'ish | — |

### Repo olish va yaratish

| Buyruq | Nima qiladi | Batafsil |
| --- | --- | --- |
| `git init` | Papkada yangi bo'sh repo (`--bare` — working tree'siz) | [4](04-repo-olish.md), [13](13-plumbing-va-porcelain.md) |
| `git clone` | Mavjud repo'ni nusxalash: `init` + `remote add` + `fetch` + `checkout` | [4](04-repo-olish.md), [27](27-remote.md) |
| `git clone --depth/--filter/--sparse` | Sayoz, qisman va siyrak klon | [49](49-worktree-va-katta-repo.md) |
| `scalar clone` | Katta repo uchun tavsiya sozlamalar bilan klon | [49](49-worktree-va-katta-repo.md) |

### Snapshot olish (asosiy ish)

| Buyruq | Nima qiladi | Batafsil |
| --- | --- | --- |
| `git status` | Uch hudud holati: nima stage qilingan, nima o'zgargan, nima kuzatilmaydi | [6](06-ozgarishlarni-yozish.md) |
| `git add` | O'zgarishni index'ga qo'yish (`-p` — bo'laklab) | [6](06-ozgarishlarni-yozish.md), [37](37-interaktiv-staging.md) |
| `git diff` | Working tree, index va commit'lar o'rtasidagi farq | [7](07-diff.md) |
| `git difftool` | Farqni tashqi dasturda ko'rish | [7](07-diff.md), [45](45-config-chuqur.md) |
| `git commit` | Index'dan yangi commit (`--amend` — oxirgisini almashtirish) | [6](06-ozgarishlarni-yozish.md), [10](10-yaxshi-commit.md), [11](11-bekor-qilish.md) |
| `git restore` | Faylni index'dan yoki commit'dan qaytarish (`--staged` — index'ni) | [11](11-bekor-qilish.md) |
| `git reset` | Branch'ni surish va index/working tree'ni moslash | [39](39-reset-sirlari.md) |
| `git rm` | Faylni kuzatuvdan va diskdan olib tashlash (`--cached` — faqat kuzatuvdan) | [8](08-gitignore-rm-mv.md) |
| `git mv` | Nomini o'zgartirish (`rm` + `add` ning qisqasi) | [8](08-gitignore-rm-mv.md) |
| `git clean` | Kuzatilmaydigan fayllarni o'chirish (avval `-n`) | [38](38-stash-va-clean.md) |
| `git check-ignore` | Fayl qaysi `.gitignore` qoidasi bilan e'tiborsiz qolganini aytish | [8](08-gitignore-rm-mv.md) |

### Branch va merge

| Buyruq | Nima qiladi | Batafsil |
| --- | --- | --- |
| `git branch` | Branch yaratish, ro'yxat, nomini o'zgartirish, o'chirish | [20](20-branch-bu-ref.md), [23](23-branch-boshqaruvi.md) |
| `git switch` | Branch'ga o'tish (`-c` — yaratib o'tish, `--detach`) | [20](20-branch-bu-ref.md), [21](21-branch-va-merge.md) |
| `git checkout` | Eski "hammasi bittada" buyruq: branch almashtirish ham, faylni qaytarish ham | [11](11-bekor-qilish.md), [20](20-branch-bu-ref.md) |
| `git merge` | Boshqa branch tarixini birlashtirish (fast-forward yoki merge commit) | [21](21-branch-va-merge.md), [26](26-murakkab-merge.md) |
| `git merge-base` | Ikki commit'ning eng yaqin umumiy ajdodi | [21](21-branch-va-merge.md) |
| `git mergetool` | Konfliktni tashqi dasturda hal qilish | [22](22-konfliktlar.md) |
| `git rerere` | Konflikt yechimini eslab, keyingi safar o'zi qo'llash | [26](26-murakkab-merge.md) |
| `git log` | Tarixni ko'rish, filtrlash, grafik | [9](09-tarixni-korish.md), [19](19-revision-tanlash.md) |
| `git stash` | Commit qilinmagan ishni vaqtincha chetga olish | [38](38-stash-va-clean.md) |
| `git tag` | Commit'ga doimiy nom (lightweight yoki annotated) | [12](12-teglar-va-aliaslar.md), [17](17-reflar-va-head.md) |
| `git worktree` | Bitta repo'dan bir nechta working tree | [49](49-worktree-va-katta-repo.md) |
| `git sparse-checkout` | Working tree'da faqat tanlangan papkalar | [49](49-worktree-va-katta-repo.md) |

### Loyihani ulashish va yangilash

| Buyruq | Nima qiladi | Batafsil |
| --- | --- | --- |
| `git remote` | Remote qo'shish, ko'rish, nomini o'zgartirish, o'chirish | [27](27-remote.md) |
| `git fetch` | Remote'dan obyekt va `refs/remotes/*` ni olib kelish | [27](27-remote.md), [28](28-remote-branchlar.md), [29](29-fetch-push-ichidan.md) |
| `git pull` | `fetch` + `merge` (yoki `--rebase`) | [27](27-remote.md) |
| `git push` | Lokal commit va ref'larni remote'ga yozish (`--force-with-lease`) | [27](27-remote.md), [29](29-fetch-push-ichidan.md) |
| `git ls-remote` | Remote'dagi ref'larni klonlamasdan ko'rish | [27](27-remote.md), [36](36-github-boshqaruv.md) |
| `git submodule` | Boshqa repo'ni papka sifatida ulash | [43](43-submodule-bundle-replace.md) |
| `git bundle` | Repo yoki uning qismini bitta faylga yig'ish | [43](43-submodule-bundle-replace.md) |
| `git archive` | Commit holatini `tar`/`zip` arxivga chiqarish | [34](34-loyihani-yuritish.md) |
| `git credential` | Parol/token helper'lari bilan ishlash | [30](30-ssh-va-credential.md) |
| `git daemon` | Oddiy `git://` server | [29](29-fetch-push-ichidan.md) |

### Ko'rish va solishtirish

| Buyruq | Nima qiladi | Batafsil |
| --- | --- | --- |
| `git show` | Bitta obyektni (ko'pincha commit'ni) diff bilan ko'rsatish | [9](09-tarixni-korish.md), [19](19-revision-tanlash.md) |
| `git shortlog` | Commit'larni muallif bo'yicha guruhlash (reliz eslatmasi uchun) | [9](09-tarixni-korish.md), [34](34-loyihani-yuritish.md) |
| `git describe` | Commit'ga eng yaqin teg asosida odam o'qiydigan nom | [12](12-teglar-va-aliaslar.md) |
| `git range-diff` | Ikki commit seriyasini commit'ma-commit solishtirish | [33](33-hissa-qoshish.md) |
| `git notes` | Commit'ga uni o'zgartirmasdan izoh biriktirish | [33](33-hissa-qoshish.md) |
| `git last-modified` | Har fayl/papkani oxirgi o'zgartirgan commit (eksperimental, 2.52) | [41](41-blame-va-bisect.md) |
| `git repo info`, `git repo structure` | Repo xususiyatlari va hajm statistikasi (2.52) | [13](13-plumbing-va-porcelain.md) |
| `git verify-commit`, `git verify-tag` | Imzoni tekshirish | [44](44-imzolash.md) |

### Debug (xatoni qidirish)

| Buyruq | Nima qiladi | Batafsil |
| --- | --- | --- |
| `git grep` | Working tree, index yoki istalgan commit ichida matn qidirish | [40](40-qidiruv.md) |
| `git log -S/-G/-L` | Satr qachon paydo bo'lgani, qator/funksiya tarixi | [40](40-qidiruv.md) |
| `git blame` | Har qatorni oxirgi o'zgartirgan commit | [41](41-blame-va-bisect.md) |
| `git bisect` | Xato kiritgan commit'ni ikkilik qidiruv bilan topish | [41](41-blame-va-bisect.md) |

### Patch'lar bilan ishlash

| Buyruq | Nima qiladi | Batafsil |
| --- | --- | --- |
| `git cherry-pick` | Tanlangan commit o'zgarishini joriy branch'ga qayta qo'llash | [34](34-loyihani-yuritish.md), [31](31-branch-workflowlari.md) |
| `git rebase` | Commit'larni boshqa asos ustida qayta yozish (`-i` — interaktiv) | [24](24-rebase.md), [25](25-tarixni-qayta-yozish.md) |
| `git revert` | Commit'ni bekor qiluvchi yangi commit (tarix o'zgarmaydi) | [26](26-murakkab-merge.md), [39](39-reset-sirlari.md) |
| `git history` | Bitta commit'ni `reword`/`split`/`fixup`/`drop` qilish (eksperimental, 2.54) | [25](25-tarixni-qayta-yozish.md) |
| `git replay` | Commit'larni yangi asosga ko'chirish, bare repo'da ham (eksperimental) | — ([13-bobdagi](13-plumbing-va-porcelain.md) ro'yxatda) |

### Email orqali ishlash

| Buyruq | Nima qiladi | Batafsil |
| --- | --- | --- |
| `git format-patch` | Commit'larni email formatidagi patch fayllarga | [33](33-hissa-qoshish.md) |
| `git send-email` | Patch'larni SMTP orqali yuborish | [33](33-hissa-qoshish.md) |
| `git imap-send` | Patch'larni IMAP "qoralamalar" papkasiga joylash | [33](33-hissa-qoshish.md) |
| `git request-pull` | "Mendan pull qiling" xati uchun xulosa | [33](33-hissa-qoshish.md) |
| `git am` | Email'dagi patch'ni commit sifatida qo'llash (muallif saqlanadi) | [33](33-hissa-qoshish.md), [34](34-loyihani-yuritish.md) |
| `git apply` | Diff'ni commit qilmasdan fayllarga qo'llash | [7](07-diff.md), [34](34-loyihani-yuritish.md) |

### Tashqi tizimlar

Pro Git'ning 9-bobi (Subversion, Perforce, Mercurial'dan ko'chish) bu kitobda alohida yoritilmagan — hozir ko'p loyiha allaqachon Git'da. Kerak bo'lsa, quyidagilarning ma'lumotnomasi va Pro Git "Git and Other Systems" bobi.

| Buyruq | Nima qiladi | Batafsil |
| --- | --- | --- |
| `git svn` | Subversion repo bilan ikki tomonlama ishlash | — |
| `git p4` | Perforce bilan ishlash | — |
| `git fast-import`, `git fast-export` | Tarixni oqim formatida import/eksport (ko'chirish vositalari asosi) | — ([18](18-packfile-va-gc.md) da eslatiladi) |

### Administrator buyruqlari

| Buyruq | Nima qiladi | Batafsil |
| --- | --- | --- |
| `git gc` | Pack'lash va keraksiz obyektlarni tozalash | [18](18-packfile-va-gc.md) |
| `git maintenance` | Fonda rejalashtirilgan xizmat (prefetch, commit-graph, ...) | [18](18-packfile-va-gc.md), [49](49-worktree-va-katta-repo.md) |
| `git fsck` | Obyekt bazasining butunligini tekshirish, "osilgan" commit'larni topish | [14](14-obyektlar-blob.md), [42](42-reflog-va-tiklash.md) |
| `git reflog` | Ref harakatlari jurnali — tiklashning asosiy vositasi | [42](42-reflog-va-tiklash.md) |
| `git count-objects`, `git prune`, `git repack` | Obyektlar soni, yetim obyektlarni o'chirish, qayta pack'lash | [18](18-packfile-va-gc.md) |
| `git refs` | Ref'lar uchun yangi asbob: `list`, `exists`, `verify`, `migrate`, `optimize`, 2.56 da `create/update/delete/rename` | [17](17-reflar-va-head.md) |
| `git replace` | Obyektni boshqasi bilan almashtirib ko'rsatish (tarixni ulash) | [43](43-submodule-bundle-replace.md) |
| `git filter-branch` | Butun tarixni qayta yozish — eskirgan, o'rniga `filter-repo` | [25](25-tarixni-qayta-yozish.md) |
| `git filter-repo` (tashqi vosita) | Tarixdan fayl/maxfiy ma'lumotni olib tashlash | [25](25-tarixni-qayta-yozish.md), [42](42-reflog-va-tiklash.md) |
| `git hook` | Hook'larni qo'lda ishga tushirish, konfiguratsiyadagi hook'lar | [47](47-hooklar.md) |

### Plumbing (past darajadagi buyruqlar)

Bular skript va tushunish uchun ([13-bob](13-plumbing-va-porcelain.md)); kundalik ishda kerak emas.

| Buyruq | Nima qiladi | Batafsil |
| --- | --- | --- |
| `git hash-object` | Mazmundan obyekt hash'ini hisoblash (`-w` — yozish) | [14](14-obyektlar-blob.md) |
| `git cat-file` | Obyekt turi, hajmi, mazmuni | [14](14-obyektlar-blob.md), [16](16-commit-obyekti.md) |
| `git update-index` | Index'ga yozuvni qo'lda qo'shish/o'zgartirish | [15](15-tree-va-index.md) |
| `git ls-files` | Index tarkibi (`-s` — bosqich va hash bilan) | [15](15-tree-va-index.md), [22](22-konfliktlar.md) |
| `git write-tree`, `git read-tree` | Index'dan tree yasash va teskarisi | [15](15-tree-va-index.md) |
| `git ls-tree` | Tree obyekti tarkibi | [15](15-tree-va-index.md) |
| `git commit-tree` | Tree va otalardan commit obyekti | [16](16-commit-obyekti.md) |
| `git merge-tree` | Index va working tree'ga tegmasdan merge natijasini hisoblash | [16](16-commit-obyekti.md) |
| `git update-ref`, `git symbolic-ref` | Ref va symbolic ref'ni xavfsiz yozish | [17](17-reflar-va-head.md) |
| `git show-ref`, `git for-each-ref` | Ref'lar ro'yxati, filtr va format bilan | [17](17-reflar-va-head.md), [23](23-branch-boshqaruvi.md) |
| `git mktag` | Teg obyektini qo'lda yasash | [17](17-reflar-va-head.md) |
| `git verify-pack` | Pack ichidagi obyektlar va delta'lar | [18](18-packfile-va-gc.md) |
| `git rev-parse` | Revision nomini hash'ga aylantirish, repo yo'llari | [19](19-revision-tanlash.md), [13](13-plumbing-va-porcelain.md) |
| `git rev-list` | Commit'lar ro'yxati (`log` ning asosi) | [9](09-tarixni-korish.md), [49](49-worktree-va-katta-repo.md) |
| `git interpret-trailers` | Commit xabaridagi trailer'larni o'qish/qo'shish | [10](10-yaxshi-commit.md) |
| `git stripspace` | Xabarni Git qoidasi bo'yicha tozalash | [16](16-commit-obyekti.md) |
| `git patch-id` | Diff'ning "barmoq izi" (bir xil o'zgarishni tanish) | [24](24-rebase.md) |
| `git check-attr` | Faylga qaysi atributlar tushishini ko'rsatish | [46](46-gitattributes.md) |
| `git format-rev` | Revision'larni formatlash, matndagi hash'larni almashtirish (eksperimental, 2.55) | bu bob |
| `git url-parse` | Git URL'ini qismlarga ajratish (2.55) | bu bob |
| `git backfill` | Partial clone'da yetishmagan blob'larni to'plab yuklash (2.49) | — ([49](49-worktree-va-katta-repo.md) mavzusi) |

## Kod: 2.5x dagi yangi buyruqlarni ko'rib chiqish

Bu buyruqlar Pro Git'da yo'q — ular so'nggi relizlarda qo'shilgan. RelNotes bo'yicha: `git repo` va `git last-modified` — 2.52, `git refs list`/`exists` — 2.52, `git history` — 2.54 (2.55 da `fixup`, 2.56 da `drop` qo'shilgan), `git format-rev` va `git url-parse` — 2.55, `git refs create/update/delete/rename` — 2.56. `git refs` ning o'zi (`migrate`) — 2.46 dan bor. Sinov uchun ikki commit'li kichik repo:

```bash
$ git log --oneline
4945990 a.txt ga b qo'shildi
c8a1d8f Birinchi commit
```

**`git repo info`** — repo haqidagi savollarga barqaror, skript uchun qulay javob. Avval `git rev-parse` ning turli opsiyalari bilan so'raladigan narsalar endi kalit=qiymat ko'rinishida:

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
```

`object.format` va `references.format` — aynan Git 3.0 da standarti o'zgaradigan ikki narsa (pastda). `path.*` kalitlari 2.56 da qo'shilgan.

**`git repo structure`** — ref'lar va obyektlar statistikasi, katta repo'ni tahlil qilishda foydali:

```bash
$ git repo structure
| Repository structure      | Value |
| ------------------------- | ----- |
| * References              |       |
|   * Count                 |   1   |
|     * Branches            |   1   |
...
| * Reachable objects       |       |
|   * Count                 |   8   |
|     * Commits             |   2   |
|     * Trees               |   3   |
|     * Blobs               |   3   |
...
```

**`git refs`** — ref'lar uchun bitta "asboblar qutisi". `list` — `for-each-ref` ning old tomoni, `exists` — `show-ref --exists` ning o'zi:

```bash
$ git refs list
49459900365951031e4e7d4912165da09c985113 commit	refs/heads/main
$ git refs exists refs/heads/main; echo $?
0
$ git refs exists refs/heads/yoq; echo $?
error: reference does not exist
2
```

Chiqish kodi 2 — "ref yo'q", boshqa xatolar uchun boshqa kod. Skriptda shu farq muhim ([17-bob](17-reflar-va-head.md)).

**`git last-modified`** — har yo'l uchun uni oxirgi o'zgartirgan commit. GitHub kabi sahifadagi "fayl ro'yxati yonidagi oxirgi commit" ustunini bitta buyruqda beradi:

```bash
$ git last-modified
49459900365951031e4e7d4912165da09c985113	a.txt
c8a1d8f0b4cf3fd0e1e87391a3ec773288fc24a2	src
$ git last-modified --recursive
49459900365951031e4e7d4912165da09c985113	a.txt
c8a1d8f0b4cf3fd0e1e87391a3ec773288fc24a2	src/app.js
```

**`git format-rev`** — standart kirishdan revision'larni o'qib, `--pretty` formatida chiqaradi (`log` ni har biri uchun alohida chaqirmaslik uchun):

```bash
$ printf 'HEAD\nHEAD~1\n' | git format-rev --stdin-mode=revs --format='%h %s'
4945990 a.txt ga b qo'shildi
c8a1d8f Birinchi commit
```

**`git url-parse`** — Git tushunadigan URL'larni (shu jumladan `git@host:yo'l` ko'rinishidagi scp uslubini) tahlil qiladi. `-c` siz hech narsa chiqarmaydi va faqat chiqish kodi bilan "URL to'g'rimi" deb javob beradi. Komponentlar: `scheme`, `user`, `password`, `host`, `port`, `path`:

```bash
$ git url-parse git@github.com:ali/loyiha.git; echo "rc=$?"
rc=0
$ git url-parse -c host https://github.com/ali/loyiha.git
github.com
$ git url-parse -c path https://github.com/ali/loyiha.git
/ali/loyiha.git
$ git url-parse -c protocol ssh://git@github.com/ali/loyiha.git
fatal: invalid git URL component 'protocol'
```

**`git history`** — `rebase -i` siz bitta commit'ni o'zgartirish ([25-bob](25-tarixni-qayta-yozish.md)). `--dry-run` hech narsani o'zgartirmaydi, faqat qaysi ref qanday yangilanishini `update-ref --stdin` formatida ko'rsatadi:

```bash
$ git history reword HEAD --dry-run
update refs/heads/main aea8f93bfb56e524bcd76a6d207b00ecf6e7d993 49459900365951031e4e7d4912165da09c985113
```

(Muharrirda xabar o'zgartirilgan; `main` eski `4945990` dan yangi `aea8f93` ga o'tishi kerakligi ko'rinib turibdi, lekin `git log` hamon eski commit'ni ko'rsatadi.)

Nomida "EXPERIMENTAL" bo'lgan buyruqlar (`history`, `last-modified`, `format-rev`, `replay`) — xulqi keyingi relizlarda o'zgarishi mumkin. Ularni qo'lda ishlatish mumkin, lekin muhim skriptlarga hali bog'lamang.

## Kundalik checklist

Bu ro'yxat — kitobdagi maslahatlarning yig'indisi. Qadamlar odat bo'lib qolsa, "Xato qildim" jadvaliga kamdan-kam murojaat qilasiz.

### Ishni boshlashda

- [ ] `git status` — toza holatdan boshlayapsizmi? Qolib ketgan o'zgarish bo'lsa — commit yoki `stash` ([38](38-stash-va-clean.md)).
- [ ] `git fetch` — serverdagi yangi holatni oling ([27](27-remote.md)). `git status` "behind" desa, asosiy branch'ni yangilang: `git switch main && git pull --ff-only`.
- [ ] Har vazifa uchun alohida topic branch, yangilangan asosiy branch'dan: `git switch -c feat/<nom>` ([20](20-branch-bu-ref.md), [31](31-branch-workflowlari.md)). Integratsiya branch'iga to'g'ridan-to'g'ri commit qilmang.
- [ ] Ikkinchi vazifa shoshilinch kelsa — `stash` emas, `git worktree add` ([49](49-worktree-va-katta-repo.md)).

### Commit'dan oldin

- [ ] `git diff` — nima o'zgarganini o'qing; `git diff --check` — keraksiz bo'shliqlar ([7](07-diff.md), [10](10-yaxshi-commit.md)).
- [ ] Bitta commit — bitta mantiqiy o'zgarish. Aralash bo'lsa — `git add -p` ([37](37-interaktiv-staging.md)).
- [ ] `git diff --staged` — commit'ga aynan nima ketayotganini ko'ring. Bu — `.env`, kalit, katta binar fayl tushib qolmasligining oxirgi tekshiruvi.
- [ ] Yangi generatsiya qilinadigan fayl paydo bo'lsa — `.gitignore` ga ([8](08-gitignore-rm-mv.md)).
- [ ] Xabar: qisqa sarlavha, bo'sh qator, "nega" ni tushuntiruvchi tana; jamoa kelishuvi bo'lsa (masalan Conventional Commits) — unga amal ([10](10-yaxshi-commit.md)).
- [ ] Testlar/linter lokal ishlaydi; mumkin bo'lsa `pre-commit` hook'i ([47](47-hooklar.md)).

### Push'dan oldin

- [ ] `git fetch` va `git log --oneline origin/main..HEAD` — asosiy branch'ga nisbatan yuboriladigan commit'lar; kutilmagan commit yo'qmi ([19](19-revision-tanlash.md)). Branch avval push qilingan bo'lsa, `git log --oneline @{upstream}..` — serverda hali yo'qlari ([28](28-remote-branchlar.md)).
- [ ] Hali push qilinmagan commit'larni tartibga keltirish shu payt: `rebase -i`, `--fixup` + `--autosquash` ([25](25-tarixni-qayta-yozish.md)). Push qilingandan keyin — yo'q.
- [ ] Asosiy branch ilgarilab ketgan bo'lsa: `git fetch` + `git rebase origin/main` (o'z branch'ingizda) yoki merge — jamoa kelishuviga qarab ([24](24-rebase.md)).
- [ ] Majburiy push faqat o'z branch'ingizga va faqat `--force-with-lease` bilan ([29](29-fetch-push-ichidan.md)). Umumiy branch'larga — hech qachon.
- [ ] Birinchi push: `git push -u origin <branch>` — upstream bog'lanadi ([28](28-remote-branchlar.md)).

### PR'dan keyin

- [ ] Review izohlariga javob — o'sha branch'da yangi commit'lar bilan; seriyani qayta yozsangiz, reviewer'ga `range-diff` ni ko'rsating ([33](33-hissa-qoshish.md), [35](35-github-fork-va-pr.md)).
- [ ] PR eskirsa — upstream bilan yangilang ([35](35-github-fork-va-pr.md)).
- [ ] Merge qilingach: `git switch main && git pull --ff-only`, keyin lokal branch'ni `git branch -d <branch>` bilan o'chiring (`-d` faqat qo'shilgan branch'ni o'chiradi — bu tekshiruv) ([23](23-branch-boshqaruvi.md)).
- [ ] Serverda o'chirilgan branch'larning lokal nusxalari: `git fetch --prune` ([28](28-remote-branchlar.md)).
- [ ] Reliz bo'lsa — annotated teg va uni alohida push qilish ([12](12-teglar-va-aliaslar.md), [34](34-loyihani-yuritish.md)).

## Xato qildim — endi nima?

Avval uchta savol:

1. **Commit qilinganmi?** Ha bo'lsa, deyarli har doim qaytadi — `git reflog` ([42](42-reflog-va-tiklash.md)). Commit qilinmagan, `add` ham qilinmagan o'zgarish esa `restore`/`reset --hard`/`clean` dan keyin qaytmaydi.
2. **Push qilinganmi?** Yo'q bo'lsa — tarixni bemalol qayta yozing (`--amend`, `reset`, `rebase -i`). Ha bo'lsa va boshqalar olgan bo'lishi mumkin bo'lsa — tarixni o'zgartirmaydigan yo'l (`revert`).
3. **Hozir biror jarayon o'rtasidamisiz?** `git status` merge/rebase/cherry-pick/bisect holatini va qanday chiqishni aytadi — har jarayonning `--abort` i bor ([22](22-konfliktlar.md)).

Jadvaldagi `<hash>` — `git log --oneline` yoki `git reflog` dan olinadigan commit; `<fayl>`, `<branch>` — o'zingizniki. Har retsept sinov repo'sida tekshirilgan.

| # | Holat | Buyruq | Bob |
| --- | --- | --- | --- |
| 1 | Commit xabarida xato (push qilinmagan) | `git commit --amend -m "To'g'ri xabar"` | [11](11-bekor-qilish.md) |
| 2 | Oxirgi commit'ga fayl qo'shish esdan chiqdi | `git add <fayl>` → `git commit --amend --no-edit` | [11](11-bekor-qilish.md) |
| 3 | Eskiroq commit xabari yoki mazmuni xato (push qilinmagan) | `git commit --fixup=<hash>` → `git rebase -i --autosquash <asos>`; xabar uchun `reword` | [25](25-tarixni-qayta-yozish.md) |
| 4 | Noto'g'ri branch'ga commit qildim (`main` ga, push qilinmagan) | `git branch <yangi>` → `git reset --keep HEAD~1` → `git switch <yangi>` | [23](23-branch-boshqaruvi.md), [39](39-reset-sirlari.md) |
| 5 | Commit'ni boshqa branch'ga ham olib o'tish kerak | `git switch <branch>` → `git cherry-pick <hash>` | [34](34-loyihani-yuritish.md) |
| 6 | Faylni xato bilan stage qildim | `git restore --staged <fayl>` (hammasi: `git restore --staged .`) | [11](11-bekor-qilish.md) |
| 7 | Fayldagi o'zgarishlarni tashlab, oxirgi commit holatiga qaytish | `git restore <fayl>` (qaytarib bo'lmaydi!) | [11](11-bekor-qilish.md) |
| 8 | Oxirgi commit'ni bekor qilish, o'zgarishlar qolsin | `git reset --soft HEAD~1` (index'dan ham chiqarish: `git reset HEAD~1`) | [39](39-reset-sirlari.md) |
| 9 | Keraksiz fayl (`.env`, `node_modules`) commit'ga tushdi, push qilinmagan | `git rm --cached <fayl>` → `.gitignore` ga qo'shish → `git commit --amend` | [8](08-gitignore-rm-mv.md), [11](11-bekor-qilish.md) |
| 10 | Kuzatilayotgan fayl endi ignore qilinishi kerak | `git rm --cached <fayl>` + `.gitignore` + commit | [8](08-gitignore-rm-mv.md) |
| 11 | Push qilingan commit'ni bekor qilish | `git revert <hash>` → `git push` | [26](26-murakkab-merge.md), [39](39-reset-sirlari.md) |
| 12 | Push qilingan merge'ni bekor qilish | `git revert -m 1 <merge-hash>` | [26](26-murakkab-merge.md) |
| 13 | `reset --hard` qildim, commit'lar "yo'qoldi" | `git reflog` → `git reset --hard HEAD@{1}` (yoki kerakli `<hash>`) | [42](42-reflog-va-tiklash.md) |
| 14 | Branch'ni o'chirib yubordim | `git branch <nom> <hash>` — hash `Deleted branch ... (was <hash>)` xabarida yoki `git reflog` da | [42](42-reflog-va-tiklash.md) |
| 15 | `--amend` noto'g'ri bo'ldi, oldingi commit kerak | `git reset --soft HEAD@{1}` | [42](42-reflog-va-tiklash.md) |
| 16 | Merge'da konflikt, hozir hal qilmayman | `git merge --abort` | [22](22-konfliktlar.md) |
| 17 | Rebase o'rtasida adashdim | `git rebase --abort` | [24](24-rebase.md) |
| 18 | Rebase tugadi, lekin natija yomon | `git reset --hard ORIG_HEAD` (keyinroq bo'lsa: `git reflog` dagi `rebase (start)` dan oldingi yozuv) | [42](42-reflog-va-tiklash.md) |
| 19 | Cherry-pick'da konflikt, bekor qilish | `git cherry-pick --abort` | [22](22-konfliktlar.md), [34](34-loyihani-yuritish.md) |
| 20 | `pull` keraksiz merge commit yaratdi | `git reset --hard ORIG_HEAD` → `git pull --rebase` | [27](27-remote.md), [42](42-reflog-va-tiklash.md) |
| 21 | Detached HEAD'da commit qildim va chiqib ketdim | `git branch <nom> <hash>` — hash `switch` ogohlantirishida yoki `git reflog` da | [17](17-reflar-va-head.md), [20](20-branch-bu-ref.md) |
| 22 | Detached HEAD'dan oldingi branch'ga qaytish | `git switch -` | [20](20-branch-bu-ref.md) |
| 23 | `stash drop`/`stash clear` qildim, ish kerak | `git fsck --no-reflogs --unreachable \| grep commit` → `git stash apply <hash>` | [38](38-stash-va-clean.md) |
| 24 | `switch` rad etdi: "local changes would be overwritten" | `git stash` → `git switch <branch>` → `git stash pop` (yoki avval commit) | [20](20-branch-bu-ref.md), [38](38-stash-va-clean.md) |
| 25 | Maxfiy kalit commit qilindi, push qilinmagan | `git rm --cached` + `.gitignore` + `git commit --amend` (eskiroq bo'lsa `rebase -i`) | [42](42-reflog-va-tiklash.md) |
| 26 | Maxfiy kalit push qilindi | **Avval kalitni bekor qiling/almashtiring**, keyin `git filter-repo` va jamoa bilan kelishilgan majburiy push | [42](42-reflog-va-tiklash.md) |
| 27 | Tarixda katta fayl bor, repo shishib ketdi | `git filter-repo --strip-blobs-bigger-than ...` (tarixni qayta yozadi) | [42](42-reflog-va-tiklash.md) |
| 28 | Push rad etildi: `(fetch first)` / `non-fast-forward` | `git pull --rebase` → `git push` (majburiy push emas!) | [27](27-remote.md) |
| 29 | Hamkasb `--force` bilan mening commit'imni o'chirib yubordi | O'zingizda: `git reflog show origin/main` → `git push --force-with-lease origin <hash>:main` (yoki merge) | [29](29-fetch-push-ichidan.md) |
| 30 | Branch'ni xato bilan serverga push qildim | `git push origin --delete <branch>` | [28](28-remote-branchlar.md) |
| 31 | Commit'da email/ism noto'g'ri (push qilinmagan) | `git config user.email ...` → `git commit --amend --no-edit --reset-author` | [3](03-birinchi-sozlash.md), [11](11-bekor-qilish.md) |
| 32 | Faylning eski versiyasi kerak | `git restore --source=<hash> -- <fayl>` | [11](11-bekor-qilish.md) |
| 33 | O'chirilgan fayl qaysi commit'da o'chganini bilmayman | `git log --oneline --diff-filter=D -- <fayl>` → `git restore --source=<hash>~1 -- <fayl>` | [7](07-diff.md), [9](09-tarixni-korish.md) |
| 34 | Qaysi commit xato kiritganini bilmayman | `git bisect start <yomon> <yaxshi>` → `git bisect run <test>` | [41](41-blame-va-bisect.md) |
| 35 | `refusing to merge unrelated histories` | Haqiqatan bitta loyiha bo'lsa: `git merge --allow-unrelated-histories <branch>` | [21](21-branch-va-merge.md) |
| 36 | Upstream noto'g'ri branch'ga bog'langan | `git branch -u origin/<to'g'ri>` (olib tashlash: `--unset-upstream`) | [28](28-remote-branchlar.md) |
| 37 | Branch nomi xato | `git branch -m <eski> <yangi>` (serverda ham bo'lsa — yangisini push, eskisini `--delete`) | [23](23-branch-boshqaruvi.md) |
| 38 | Worktree papkasini `rm -rf` bilan o'chirdim | `git worktree prune` | [49](49-worktree-va-katta-repo.md) |
| 39 | `git clean -f` muhim faylni o'chirdi | Git'dan qaytmaydi (fayl hech qachon obyekt bo'lmagan). Oldini olish: doim avval `git clean -n` | [38](38-stash-va-clean.md) |

### Kod: uchta retsept yaqindan

**Noto'g'ri branch'ga commit (4-holat).** `main` da "Login sahifasi" commit qilindi, lekin u alohida branch'da bo'lishi kerak edi. Avval joriy uchiga yangi branch qo'yamiz — commit endi ikki ref'dan ko'rinadi, keyin `main` ni bir qadam orqaga suramiz:

```bash
$ git log --oneline
11600a2 Login sahifasi
d24db6f Boshlang'ich commit
$ git branch login
$ git reset --keep HEAD~1
$ git switch login
Switched to branch 'login'
```

`--keep` — `--hard` ning xavfsiz ukasi: commit qilinmagan o'zgarish bilan to'qnashsa, hech narsani o'chirmasdan to'xtaydi ([39-bob](39-reset-sirlari.md)). Commit ham yo'qolmadi: `login` uni ko'rsatib turibdi.

**`reset --hard` dan keyin tiklash (13-holat).** Ikki commit "o'chib ketdi":

```bash
$ git reset --hard HEAD~2
HEAD is now at a89b07b Login sahifasi qo'shildi
$ git reflog -4
a89b07b HEAD@{0}: reset: moving to HEAD~2
b637216 HEAD@{1}: commit: Login v2
44d9a94 HEAD@{2}: reset: moving to HEAD~1
7468db5 HEAD@{3}: commit: Chala ish
$ git reset --hard HEAD@{1}
HEAD is now at b637216 Login v2
```

Reflog'da `HEAD@{1}` — "bitta harakat oldin HEAD qayerda edi". Commit obyektlari bazada turgan, faqat ref ulardan uzoqlashgan edi — model'dagi 2- va 4-qoida.

**O'chirilgan branch va tashlangan stash (14, 23-holat).** Git o'chirishda hash'ni o'zi aytadi:

```bash
$ git branch -D login
Deleted branch login (was b637216).
$ git branch login b637216
```

Stash ham — commit ([38-bob](38-stash-va-clean.md)). `drop` dan keyin u hech qaysi ref'dan yetib bo'lmaydi, lekin obyekt hali bor. `fsck` yetim commit'larni sanaydi; `drop` chiqargan hash ular orasida:

```bash
$ git stash drop
Dropped refs/stash@{0} (8de9f827411ff2cc08438e93031df4b03b7b3236)
$ git fsck --no-reflogs --unreachable | grep commit
unreachable commit 822a3d998cb26ca0fc15551721dbd23816c90e7b
...
unreachable commit 8de9f827411ff2cc08438e93031df4b03b7b3236
...
$ git log --oneline -1 8de9f82
8de9f82 WIP on main: 8219b70 k main
$ git stash apply 8de9f827411ff2cc08438e93031df4b03b7b3236
On branch main
...
Changes not staged for commit:
...
	modified:   README.md
```

Ro'yxatda boshqa yetim commit'lar ham bor (`--amend`, `reset`, rebase qoldiqlari). Qaysi biri stash ekanini yuqoridagidek `git log --oneline -1 <hash>` bilan bilasiz: stash xabari `WIP on <branch>: ...` (yoki `-m` berilgan bo'lsa `On <branch>: ...`) bilan boshlanadi. `drop` xabarini ko'rmay qolgan bo'lsangiz, ro'yxatdan shu belgi bo'yicha qidirasiz.

**Majburiy push'dan keyin tiklash (29-holat).** Ali `main` ni bir commit orqaga surib `--force` bilan yubordi. Vali `fetch` qilganda Git buni ochiq aytadi, reflog esa eski holatni saqlaydi:

```bash
$ git fetch origin
From /tmp/misol/server
 + cfde957...68953e7 main       -> origin/main  (forced update)
$ git reflog -2 origin/main
68953e7 refs/remotes/origin/main@{0}: fetch origin: forced-update
cfde957 refs/remotes/origin/main@{1}: pull -q --rebase origin main: fast-forward
$ git push --force-with-lease=main:68953e7 origin cfde957:main
To /tmp/misol/server.git
   68953e7..cfde957  cfde957 -> main
```

`--force-with-lease=main:68953e7` — "serverda `main` hali `68953e7` bo'lsagina yoz" degani: shu orada yana kimdir push qilgan bo'lsa, rad etiladi ([29-bob](29-fetch-push-ichidan.md)). Bu yerda push oddiy fast-forward bo'lib chiqdi, chunki `cfde957` yangi uchning avlodi. Lekin bunday "qaytarish"ni jamoa bilan kelishib qiling — Ali o'z tomonida nima uchun orqaga surganini bilishi kerak.

## Git 3.0: nima o'zgaradi va hozir nimaga tayyorlanish kerak

Rasmiy `BreakingChanges` hujjati Git loyihasi orqaga moslikni buzadigan o'zgarishlarni qanday rejalashtirishini tushuntiradi. Kichik relizlar (2.x) moslikni faqat juda jiddiy sabab bilan (masalan xavfsizlik) buzadi. Katta buzuvchi relizlar bir necha yilda bir marta bo'ladi: Git 1.6.0 (2008-yil avgust), Git 2.0 (2014-yil may), keyingisi — Git 3.0. Har o'zgarish `WITH_BREAKING_CHANGES` kompilyatsiya kaliti ortida oldindan tayyorlanadi: shu kalit bilan yig'ilgan Git hozirdanoq 3.0 kabi ishlaydi. Hujjat "tirik" — qarorlar qayta ko'rib chiqilishi mumkin.

### Standart qiymatlar o'zgaradi

| O'zgarish | Hozir (2.56) | Git 3.0 | Sabab (hujjat bo'yicha) | Bob |
| --- | --- | --- | --- | --- |
| Yangi repo hash'i | `sha1` | `sha256` | SHA-1 NIST tomonidan 2011-yilda eskirgan deb e'lon qilingan, amaliy hujumlar bor (SHAttered 2017, Shambles 2020 va boshqalar) | [14](14-obyektlar-blob.md) |
| Ref saqlash formati | `files` | `reftable` | Katta-kichik harf farqli nomlar, atomar yozuv, ko'p ref'da tezlik, kichik hajm | [17](17-reflar-va-head.md) |
| Boshlang'ich branch | `master` (maslahat bilan) | `main` | Katta xostinglar allaqachon `main` ishlatadi | [3](03-birinchi-sozlash.md), [23](23-branch-boshqaruvi.md) |
| `safe.bareRepository` | `all` | `explicit` | Repo ichiga yashirilgan bare repo va uning zararli hook'lari | pastda |
| Yig'ish | Rust ixtiyoriy | Rust majburiy | — (tarqatmalar uchun; 3.0 dan oldingi oxirgi versiya LTS bo'ladi) | [2](02-terminal-va-ornatish.md) |

Muhimi: bular **yangi** repo'lar va standartlarga tegishli. SHA-1 formatidan voz kechish rejasi hozircha yo'q — mavjud repo'laringiz ishlashda davom etadi. SHA-256 va reftable'ning shartli talabi ham yozilgan: ekotizim (kutubxonalar, ilovalar, xostinglar; reftable uchun JGit, libgit2, Gitoxide) tayyor bo'lishi kerak.

### Olib tashlanadigan narsalar

| Narsa | O'rniga | Bob |
| --- | --- | --- |
| `git whatchanged` (2.56 da `--i-still-use-this` siz ishlamaydi) | `git log --raw --no-merges` | [9](09-tarixni-korish.md) |
| `git pack-redundant` (allaqachon `--i-still-use-this` talab qiladi) | `git gc`/`git repack` | [18](18-packfile-va-gc.md) |
| `.git/info/grafts` | `git replace` | [43](43-submodule-bundle-replace.md) |
| `.git/branches/` va `.git/remotes/` dagi remote yozuvlari | `.git/config` dagi `[remote]` bo'limlari | [13](13-plumbing-va-porcelain.md), [27](27-remote.md) |
| `git name-rev --stdin` | `--annotate-stdin` | — |
| `core.commentString=auto` (va `core.commentChar=auto`) | Aniq belgi, masalan `;` | [45](45-config-chuqur.md) |
| `core.preferSymlinkRefs=true` (symref'ni symlink sifatida yozish) | Oddiy matnli symref (2006 dan beri standart) | [17](17-reflar-va-head.md) |

Hujjat **olib tashlanmaydiganini** ham aytadi: `git checkout` qoladi. Uning vazifalarini `switch` va `restore` qoplaydi, lekin `checkout` juda keng tarqalgan, shuning uchun uchala buyruq ham saqlanadi ([20-bob](20-branch-bu-ref.md)).

### Kod: Git 3.0 ni bugun sinab ko'rish

Git'ingiz hozir qanday standartlar bilan yig'ilganini ko'ring:

```bash
$ git version --build-options | grep default
default-ref-format: files
default-hash: sha1
```

`init.defaultBranch` sozlanmagan bo'lsa, `git init` Git 3.0 haqida o'zi ogohlantiradi:

```bash
$ git init eski
hint: Using 'master' as the name for the initial branch. This default branch name
hint: will change to "main" in Git 3.0. To configure the initial branch name
hint: to use in all of your new repositories, which will suppress this warning,
hint: call:
...
Initialized empty Git repository in /tmp/misol/eski/.git/
```

Yangi repo'ni 3.0 standartlari bilan qo'lda yaratish mumkin. Hash 64 belgili bo'lishiga va `.git/reftable/` paydo bo'lishiga e'tibor bering:

```bash
$ git init --object-format=sha256 --ref-format=reftable kelajak
$ cd kelajak
$ echo a > a; git add a; git commit -qm "SHA-256 commit"
$ git repo info object.format references.format
object.format=sha256
references.format=reftable
$ git log --format=%H
0598e6b4e53c1a17f34541c6d1b27eba6ed28b472cf278b6984b2999188395af
$ ls .git
COMMIT_EDITMSG
HEAD
config
...
refs
reftable
```

Mavjud repo'ning ref formatini ko'chirish — `git refs migrate`. Avval `--dry-run`: natija vaqtinchalik papkaga yoziladi, repo o'zgarmaydi:

```bash
$ git refs migrate --ref-format=reftable --dry-run
Finished dry-run migration of refs, the result can be found at '.git/ref_migration.YjUQxA'
$ git refs migrate --ref-format=reftable
$ git repo info references.format
references.format=reftable
```

Hash formatini esa bunday "joyida" o'zgartirib bo'lmaydi — SHA-1 repo'ni SHA-256 ga o'tkazish hamma hash'larni (demak, commit'larni) qayta yozish degani ([14-bob](14-obyektlar-blob.md)).

**`safe.bareRepository`.** Hujjatdagi xavf ssenariysi: hujumchi oddiy repo ichiga bare repo joylaydi va uning config'ida zararli hook yozadi. Siz klonlab, o'sha papkaga `cd` qilsangiz, Git yuqoriga qarab qidirib bare repo'ni topadi va hook ishlaydi — hatto buyruq yozmasangiz ham, chunki ko'p shell prompt'lari fonda `git status` ni chaqiradi. `explicit` qiymati bunday "o'zi topilgan" bare repo bilan ishlashni rad etadi; `--git-dir` yoki `GIT_DIR` bilan aniq ko'rsatilgani ishlayveradi:

```bash
$ cd server.git
$ git rev-parse --is-bare-repository
true
$ git -c safe.bareRepository=explicit rev-parse --is-bare-repository
fatal: cannot use bare repository '/tmp/misol/server.git' (safe.bareRepository is 'explicit')
$ cd ..
$ git -c safe.bareRepository=explicit --git-dir=server.git rev-parse --is-bare-repository
true
```

`.git` papkasi, worktree va submodule papkalariga bu ta'sir qilmaydi. Bu sozlama himoyalangan config'dan (system, global, buyruq qatori) o'qiladi — repo o'zini "xavfsiz" deb e'lon qila olmaydi ([3-bob](03-birinchi-sozlash.md)). Eski xulqni qaytarish: global config'da `safe.bareRepository=all`.

### Hozir nima qilish kerak

- **`init.defaultBranch` ni sozlang** (`git config set --global init.defaultBranch main`). Shunda 3.0 ga o'tishda hech narsa o'zgarmaydi ([3-bob](03-birinchi-sozlash.md)).
- **Skriptlarda `master` ni qattiq yozmang.** Standart branch nomini `git symbolic-ref refs/remotes/origin/HEAD` yoki `git rev-parse --abbrev-ref origin/HEAD` dan oling ([28-bob](28-remote-branchlar.md)).
- **Hash uzunligini 40 deb faraz qilmang.** SHA-256 da u 64 belgi. Qisqa hash'ni `rev-parse --short` dan, formatni `git repo info object.format` yoki `git rev-parse --show-object-format` dan oling ([19-bob](19-revision-tanlash.md)).
- **`.git/refs/...` ni fayl sifatida o'qimang.** Reftable'da u yerda ref'lar yo'q. `git rev-parse`, `git for-each-ref`, `git refs list`, `git update-ref` ishlating ([17-bob](17-reflar-va-head.md)).
- **Eski buyruqlarni almashtiring:** `whatchanged` → `log --raw --no-merges`, `filter-branch` → `filter-repo`, grafts → `replace`.
- **Server'da bare repo'larga** ishlaydigan skriptlarda `--git-dir`/`GIT_DIR` ni aniq bering — `safe.bareRepository=explicit` ostida ham ishlayveradi.
- **SHA-256 yoki reftable'ni ishlab chiqarishda yoqishdan oldin** xostingingiz, CI va IDE'ingiz qo'llab-quvvatlashini tekshiring — hujjatning o'zi ekotizim tayyorligini shart qilib qo'ygan.

## Muhandislik nuqtai nazari: Git'ni o'rganishni qanday davom ettirish

Kitob tugadi, lekin Git o'zgarishda davom etadi — har 2–3 oyda yangi reliz chiqadi. Quyidagi odatlar bilimni dolzarb saqlaydi.

**Model'ga qayting.** Yangi buyruq yoki notanish xatoga duch kelsangiz, "bu qaysi obyektni yaratadi, qaysi ref'ni suradi, qaysi hududga tegadi?" deb so'rang. Ishonchingiz komil bo'lmasa — vaqtinchalik repo'da sinab, `.git` ichiga qarang: `git cat-file -p`, `git reflog`, `GIT_TRACE=1` ([13](13-plumbing-va-porcelain.md), [48](48-muhit-ozgaruvchilari.md)). Bu kitob ham shu usulda yozilgan.

**Birlamchi manbani o'qing.** Ziddiyat bo'lsa, o'rnatilgan versiyangizning `git help <buyruq>` sahifasi — eng ishonchli manba. Blog va Q&A javoblari ko'pincha eski versiya uchun yozilgan (`checkout` o'rniga `switch`, `master` o'rniga `main`, `filter-branch` o'rniga `filter-repo`). Konseptual qo'llanmalar ham bor: `git help -g` ularni sanaydi — `giteveryday` (kundalik minimal buyruqlar), `gitworkflows`, `gitglossary`, `gitfaq`, `gitdatamodel`.

**Relizlarni kuzating.** `Documentation/RelNotes/<versiya>.adoc` — har relizdagi o'zgarishlar ro'yxati. Bu bobdagi yangi buyruqlar ham shu yerdan olingan. Yiliga bir-ikki marta `BreakingChanges` ni ko'zdan kechiring.

**Muammoni avval kichik repo'da takrorlang.** Ishdagi katta repo'da "nega rebase bunday qildi" deb taxmin qilish o'rniga, uch-to'rt commit'li sinov repo'sida xuddi shu holatni yasang. Ko'pincha javob o'zi ko'rinadi, ko'rinmasa — savolni boshqalarga aniq berish mumkin bo'ladi.

**Xavfsiz tajriba muhiti.** `git worktree add` yoki `cp -r` bilan nusxa, `git bundle create zaxira.bundle --all` bilan zaxira ([43](43-submodule-bundle-replace.md)) — keyin `rebase -i`, `filter-repo`, `reset` bilan bemalol tajriba qiling.

**Chuqurlashish uchun yo'nalishlar:**

- *Ichki formatlar:* `gitformat-pack`, `gitformat-index`, `gitformat-commit-graph`, `gitprotocol-v2` — Git serverlari va kutubxonalari qanday ishlashini tushunish uchun.
- *Git'ni dasturdan ishlatish:* Pro Git'ning "Embedding Git in your Applications" ilovasi (libgit2, JGit) va plumbing buyruqlarning `--porcelain`/`-z` chiqishlari ([2](02-terminal-va-ornatish.md), [13](13-plumbing-va-porcelain.md)).
- *Katta repo'lar:* `scalar`, `maintenance`, partial clone ([49](49-worktree-va-katta-repo.md)).
- *Server va xavfsizlik:* hook'lar, imzolar, himoyalangan branch'lar ([36](36-github-boshqaruv.md), [44](44-imzolash.md), [47](47-hooklar.md)).
- *Git loyihasining o'zi:* `git/git` repo'si, `Documentation/SubmittingPatches` va pochta ro'yxati. Git email orqali patch qabul qiladi — 33-bobdagi `format-patch`/`send-email` oqimi shu yerda amalda ishlaydi.

**Jamoaga o'rgating.** Hamkasbga `reflog` ni yoki `--force-with-lease` ni tushuntirish — o'zingiz qanchalik tushunganingizni tekshirishning eng yaxshi usuli. Jamoa uchun bir sahifalik kelishuv yozing: branch nomlari, commit xabari formati, merge yoki rebase, kim majburiy push qilishi mumkin ([31](31-branch-workflowlari.md), [32](32-taqsimlangan-workflowlar.md)).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Buyruqni internetdan nusxalab, nima qilishini bilmasdan ishga tushirish | `reset --hard`, `clean -fdx`, `push --force` qaytarib bo'lmaydigan zarar berishi mumkin | Avval `git help <buyruq>`, `-n`/`--dry-run`; model jadvalidagi to'rt savol |
| "Xato qildim" deb darhol `rm -rf .git` va qayta klon | Lokal commit'lar, stash'lar, reflog — hammasi yo'qoladi | Avval `git status`, `git reflog`; vahimasiz — commit qilingan narsa yo'qolmaydi |
| Push qilingan tarixni `reset`/`rebase` bilan tuzatib, `--force` qilish | Hamkasblar tarixi ajraladi, ularning ishi "yo'qoladi" | Umumiy branch'da — `git revert`; o'z branch'ingizda — `--force-with-lease` |
| Maxfiy kalitni faqat keyingi commit'da o'chirish | Kalit tarixda va klonlarda qoladi | Kalitni darhol bekor qiling; keyin `filter-repo` ([42](42-reflog-va-tiklash.md)) |
| Jarayon o'rtasida (merge/rebase) yangi ish boshlash | Holat chalkashadi, keyingi commit noto'g'ri joyga tushadi | `git status` ni o'qing; `--continue` yoki `--abort` |
| Commit qilinmagan katta ishni uzoq ushlab turish | `restore`/`reset --hard` dan keyin reflog yordam bermaydi | Tez-tez kichik commit (keyin `rebase -i` bilan tartiblash) yoki `stash` |
| `git clean -f` ni `-n` siz | Kuzatilmaydigan fayllar Git'da hech qachon bo'lmagan — qaytmaydi | Avval `git clean -n`, kerak bo'lsa `-i` |
| Skriptda `.git/refs/heads/main` ni o'qish, hash'ni 40 belgi deb tekshirish | Reftable va SHA-256 (Git 3.0 standarti) da buziladi | `git rev-parse`, `git refs list`, `git repo info` |
| Eksperimental buyruqni (`git history`, `last-modified`) CI'ga bog'lash | Xulqi keyingi relizda o'zgarishi mumkin | Qo'lda ishlating; skriptda barqaror plumbing |
| Eski maqoladagi buyruqni (`whatchanged`, `filter-branch`, `checkout -b`) yangi deb o'rganish | Ba'zilari olib tashlanadi, ba'zilarining xavfsizroq o'rinbosari bor | Shu bobdagi xarita va `BreakingChanges` |
| `init.defaultBranch` ni sozlamay, `master`/`main` aralashib ketishi | Jamoada turli nomli standart branch'lar, skriptlar buziladi | `git config set --global init.defaultBranch main` |

## Amaliyot

Bu mashqlar butun kitob bo'yicha takrorlash. Har birini vaqtinchalik papkada qiling va har qadamdan keyin `git status` hamda `git log --oneline --graph --all` ni ko'ring.

1. **Model (1–5, 13–17-boblar).** Bo'sh repo yarating, bitta fayl qo'shib commit qiling. Faqat `find .git/objects -type f` va `git cat-file -p` bilan commit → tree → blob zanjirini qog'ozga chizing. Keyin xuddi shu commit'ni `hash-object -w`, `update-index`, `write-tree`, `commit-tree`, `update-ref` bilan qayta yasang va hash'lar bir xil chiqqanini tekshiring.
2. **Kundalik ish (6–12).** Uch xil o'zgarish qiling (bitta faylda ikki mantiqiy o'zgarish bo'lsin). `git add -p` bilan ularni uch atomar commit'ga bo'ling, birining xabarini `--amend` bilan tuzating, oxirgisiga annotated teg qo'ying va `git describe` natijasini tushuntiring.
3. **Branch'lar (20–26).** Ikki branch'da bitta qatorni turlicha o'zgartiring. Bir marta `merge` bilan (konfliktni `zdiff3` bilan hal qilib), bir marta `rebase` bilan birlashtiring. Ikki natijani `git log --graph` da solishtiring va qaysi holatda qaysi biri ma'qulligini yozing. Keyin merge'ni `revert -m 1` bilan bekor qiling.
4. **Remote (27–31).** Lokal bare repo va ikki klon ("Ali", "Vali") yarating. Ikkalasi ham commit qilsin; ikkinchi `push` rad etilsin. `pull --rebase` bilan hal qiling. Keyin Ali `--force-with-lease` bilan push qilishga urinsin, Vali esa shu orada push qilgan bo'lsin — nima bo'lishini oldindan yozing, keyin tekshiring.
5. **"Xato qildim" jadvali.** Jadvaldan kamida o'nta holatni (4, 8, 13, 14, 15, 18, 21, 23, 29, 33 tavsiya etiladi) ataylab yarating va retsept bilan tiklang. Har biridan keyin `git reflog` da nima yozilganini ko'ring va "nega tiklash mumkin bo'ldi" degan savolga model'ning qaysi qoidasi javob berishini yozing. 7- va 39-holatlarda nega tiklab bo'lmasligini ham tushuntiring.
6. **Asboblar (37–43).** 20 commit'li tarixda bitta commit'ga ataylab xato kiriting (masalan, test skripti `exit 1` qaytaradigan qilib). `git bisect run` bilan uni toping, `git blame` va `git log -L` bilan o'sha qatorning tarixini ko'ring.
7. **Git 3.0 ga tayyorgarlik.** `git init --object-format=sha256 --ref-format=reftable` bilan repo yarating. Kitobdagi biror bobning misollarini (masalan 17-bob) shu repo'da takrorlang: qaysi buyruqlar va chiqishlar farq qiladi (`.git/refs/` tarkibi, hash uzunligi)? `safe.bareRepository=explicit` ni global sozlab, bare repo ichida va `--git-dir` bilan `git log` ni sinang.
8. **(Qiyinroq) O'z xaritangiz.** Ish loyihangiz uchun shu bob uslubida bir sahifalik "jamoa qo'llanmasi" yozing: branch nomlash qoidasi, commit xabari formati, merge yoki rebase siyosati, majburiy push qoidasi, eng ko'p uchraydigan beshta "xato qildim" holati va ularning retsepti. Har qoidaning yonida "nega"sini va kitobdagi bobni ko'rsating. Retseptlarni sinov repo'sida tekshirib chiqing.

## Rasmiy hujjat

- Pro Git — Appendix C: Git Commands: <https://git-scm.com/book/en/v2/Appendix-C:-Git-Commands-Setup-and-Config>
- Pro Git — Git and Other Systems (tashqi tizimlar): <https://git-scm.com/book/en/v2/Git-and-Other-Systems-Git-as-a-Client>
- `git` (hamma buyruqlar ro'yxati, guruhlar bo'yicha): <https://git-scm.com/docs/git>
- `giteveryday` — kundalik minimal buyruqlar: <https://git-scm.com/docs/giteveryday>
- `gitfaq`: <https://git-scm.com/docs/gitfaq>
- `gitglossary`: <https://git-scm.com/docs/gitglossary>
- Git 3.0 o'zgarishlari (`BreakingChanges`): <https://git-scm.com/docs/BreakingChanges>
- `git repo`: <https://git-scm.com/docs/git-repo>
- `git refs`: <https://git-scm.com/docs/git-refs>
- `git history`: <https://git-scm.com/docs/git-history>
- `git last-modified`: <https://git-scm.com/docs/git-last-modified>
- `git format-rev`: <https://git-scm.com/docs/git-format-rev>
- `git url-parse`: <https://git-scm.com/docs/git-url-parse>
- `git reflog`: <https://git-scm.com/docs/git-reflog>
- `git config` (`safe.bareRepository`, `init.defaultBranch`, `init.defaultObjectFormat`, `init.defaultRefFormat`): <https://git-scm.com/docs/git-config>
- Reliz eslatmalari (2.52–2.56): <https://github.com/git/git/tree/master/Documentation/RelNotes>
