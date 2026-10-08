# Git — model, jamoaviy ish va tiklanish

Bu qo'llanma Git'ni **noldan oxirigacha** o'rgatadi: birinchi commit'dan `.git/objects` ichidagi baytlargacha. Buyruqlarni yodlash emas — Git ma'lumotni qanday saqlashini tushunish, shu model orqali har buyruq nima qilishini oldindan bilish, jamoada xavfsiz ishlash va har qanday xatodan tiklanish.

Boshlovchi uchun ham yozilgan: har yangi atama birinchi uchraganda tushuntiriladi. Lekin hech narsa "soddalashtirish uchun" tashlab ketilmagan — rasmiy hujjatdagi hamma muhim tafsilot o'z joyida.

Manbalar va versiyalar (2026-yil oktabr):

| Narsa | Versiya | Qayerdan olindi |
| --- | --- | --- |
| Git | 2.56.0 | `github.com/git/git` teglari (eng so'nggi barqaror) |
| Ma'lumotnoma (`git help`) | 2.56.0 | `git/git` repo'si, `Documentation/` (v2.56.0 tegi) |
| Pro Git kitobi | 2-nashr | `github.com/progit/progit2` (`git-scm.com/book` manbasi) |
| Sinov muhiti | Git 2.56.0, macOS | Har buyruq vaqtinchalik repo'da ishlatilgan, chiqish natijalari haqiqiy |

> **Git 3.0 haqida.** Rasmiy `BreakingChanges` hujjatiga ko'ra Git 3.0 da yangi repo'lar uchun standart hash SHA-256 bo'ladi, ref'lar `reftable` formatida saqlanadi va boshlang'ich branch nomi `main` bo'ladi. Qo'llanma hozirgi 2.56 bo'yicha yozilgan, farq qiladigan joylarda Git 3.0 alohida eslatiladi.

---

## Har bobning skeleti

- **Tushuncha** — mavzu nima, oddiy so'zlar bilan, kerak bo'lsa rasm bilan.
- **Nega shunday** — Git nega aynan shunday ishlaydi.
- **Kod** — terminalda ishlatiladigan buyruqlar va ularning **haqiqiy** chiqishi.
- **Muhandislik nuqtai nazari** — ichkarida nima bo'ladi, qachon qaysi yo'l, xavf qayerda.
- **Tipik xatolar** — jadval: xato → nega yomon → to'g'ri yo'l.
- **Amaliyot** — o'zingiz qilib ko'radigan mashqlar.
- **Rasmiy hujjat** — Pro Git bo'limi va `git help` sahifalari.

Misollardagi buyruqlarni o'z kompyuteringizda **vaqtinchalik papkada** takrorlang: Git'ni o'qib emas, qilib o'rganiladi.

---

## I qism — Boshlash (1–5)

| # | Bob | Mazmun |
| --- | --- | --- |
| 01 | [Versiya nazorati va Git nima](01-versiya-nazorati.md) | Lokal, markazlashgan, taqsimlangan VCS; Git tarixi; snapshot'lar (diff emas), lokal amallar, butunlik (hash), Git faqat qo'shadi |
| 02 | [Terminal va o'rnatish](02-terminal-va-ornatish.md) | Nega buyruq qatori, Linux/macOS/Windows'da o'rnatish, manbadan yig'ish, versiyani tekshirish |
| 03 | [Birinchi sozlash va yordam](03-birinchi-sozlash.md) | `git config` darajalari (system/global/local), ism va email, muharrir, `init.defaultBranch`, `git help`, `-h` |
| 04 | [Repo olish: `init` va `clone`](04-repo-olish.md) | Mavjud papkani repo qilish, nusxa olish, `.git` paydo bo'lishi, bare repo |
| 05 | [Uch holat va uch hudud](05-uch-holat.md) | Modified/staged/committed; working tree, index, repository; fayl hayot sikli |

## II qism — Kundalik ish (6–12)

| # | Bob | Mazmun |
| --- | --- | --- |
| 06 | [O'zgarishlarni yozish: `status`, `add`, `commit`](06-ozgarishlarni-yozish.md) | Tracked/untracked, `status -s`, staging, `commit -a`, commit xabari muharrirda |
| 07 | [`diff`: nima o'zgardi](07-diff.md) | Working tree vs index vs HEAD, `--staged`, `--stat`, `--word-diff`, difftool, patch formati |
| 08 | [`.gitignore`, `rm` va `mv`](08-gitignore-rm-mv.md) | Pattern sintaksisi, ichma-ich `.gitignore`, `info/exclude`, global ignore, `check-ignore`, `rm --cached`, nomini o'zgartirish |
| 09 | [Tarixni ko'rish: `log`](09-tarixni-korish.md) | `-p`, `--stat`, `--oneline`, `--graph`, `--pretty=format`, vaqt/muallif/fayl bo'yicha cheklash, `-S`, `-G` |
| 10 | [Yaxshi commit](10-yaxshi-commit.md) | Atomar commit, xabar tuzilishi (sarlavha + tana), whitespace tekshiruvi, Conventional Commits |
| 11 | [Bekor qilish: `amend` va `restore`](11-bekor-qilish.md) | `commit --amend`, stage'dan chiqarish, o'zgarishni tashlash, `restore` va eski `checkout`/`reset` yo'llari |
| 12 | [Teglar va alias'lar](12-teglar-va-aliaslar.md) | Lightweight va annotated teg, keyinroq teglash, teglarni push qilish, `describe`, alias'lar |

## III qism — Git ichkaridan (13–19)

Bu qism kitobning skeleti: keyingi har bob (branch, merge, rebase, reset, reflog, remote) shu modelga tayanadi.

| # | Bob | Mazmun |
| --- | --- | --- |
| 13 | [Plumbing, porcelain va `.git` papkasi](13-plumbing-va-porcelain.md) | Ikki daraja buyruqlar, `.git` ichidagi har fayl va papka nima qiladi |
| 14 | [Obyektlar: blob va hash](14-obyektlar-blob.md) | Content-addressable saqlash, `hash-object`, `cat-file -t/-s/-p`, `"blob <hajm>\0"` sarlavhasi, zlib, SHA-1 va SHA-256 |
| 15 | [Tree va index](15-tree-va-index.md) | Tree obyekti, rejimlar (100644, 100755, 120000, 040000), `.git/index`, `update-index`, `write-tree`, `read-tree`, `ls-files -s` |
| 16 | [Commit obyekti](16-commit-obyekti.md) | `commit-tree`, ota zanjiri, muallif va commit qiluvchi, `add` + `commit`ni faqat plumbing bilan takrorlash |
| 17 | [Ref'lar, HEAD va teg obyekti](17-reflar-va-head.md) | `refs/heads`, `update-ref`, symbolic ref `HEAD`, detached HEAD, teg obyekti, `refs/remotes`, `packed-refs`, `git refs` |
| 18 | [Packfile'lar va `gc`](18-packfile-va-gc.md) | Loose va packed obyektlar, delta siqish, `.idx`, `verify-pack`, `count-objects`, `gc`, `maintenance` |
| 19 | [Revision'larni tanlash](19-revision-tanlash.md) | Qisqa SHA, branch va reflog nomlari, `^` va `~`, `..`, `...`, `^` bilan inkor, `@{upstream}` |

## IV qism — Branch'lar (20–26)

| # | Bob | Mazmun |
| --- | --- | --- |
| 20 | [Branch — bu ko'rsatkich](20-branch-bu-ref.md) | Branch = commit'ga ko'rsatkich, HEAD branch'ni ko'rsatadi, branch yaratish arzonligining sababi |
| 21 | [Branch yaratish va merge](21-branch-va-merge.md) | `switch`, `branch`, fast-forward, uch tomonlama merge, merge commit, `merge-base` |
| 22 | [Konfliktlar](22-konfliktlar.md) | Konflikt qachon chiqadi, belgilar, `status`, `mergetool`, `--abort`, `diff3`/`zdiff3`, `checkout --ours/--theirs` |
| 23 | [Branch'larni boshqarish](23-branch-boshqaruvi.md) | Ro'yxat, `-v`, `--merged`/`--no-merged`, nomini o'zgartirish, o'chirish, standart branch nomini almashtirish |
| 24 | [Rebase](24-rebase.md) | Asosiy rebase, `--onto`, rebase xavfi va oltin qoida, rebase qilinganni rebase qilish, merge bilan solishtirish |
| 25 | [Tarixni qayta yozish](25-tarixni-qayta-yozish.md) | Interaktiv rebase: `reword`, `edit`, `squash`, `fixup`, tartibni o'zgartirish, commit'ni bo'lish; `filter-repo`, `git history` |
| 26 | [Murakkab merge](26-murakkab-merge.md) | Merge strategiyalari (`ort`, `ours`, `subtree`), `-X ours/theirs`, whitespace, merge'ni bekor qilish, `revert -m`, `rerere` |

## V qism — Masofaviy repo (27–31)

| # | Bob | Mazmun |
| --- | --- | --- |
| 27 | [Remote'lar](27-remote.md) | `remote -v`, qo'shish, `fetch`, `pull`, `push`, ko'rish, nomini o'zgartirish va o'chirish |
| 28 | [Remote branch'lar va kuzatish](28-remote-branchlar.md) | `origin/main`, tracking branch, upstream, `ahead`/`behind`, remote branch'ni o'chirish |
| 29 | [`fetch` va `push` ichidan](29-fetch-push-ichidan.md) | Refspec, `push` refspec'lari, `--force-with-lease`, uzatish protokollari: lokal, HTTP, SSH, Git |
| 30 | [SSH kalit va credential'lar](30-ssh-va-credential.md) | SSH kalit yaratish, `ssh-agent`, credential helper'lar, token |
| 31 | [Branch bilan ishlash uslublari](31-branch-workflowlari.md) | Uzoq yashovchi branch'lar, topic branch'lar |

## VI qism — Jamoa va GitHub (32–36)

| # | Bob | Mazmun |
| --- | --- | --- |
| 32 | [Taqsimlangan workflow'lar](32-taqsimlangan-workflowlar.md) | Markazlashgan, integratsiya menejeri, diktator va leytenantlar |
| 33 | [Loyihaga hissa qo'shish](33-hissa-qoshish.md) | Kichik jamoa, boshqariladigan jamoa, fork qilingan ochiq loyiha, patch'ni email orqali yuborish |
| 34 | [Loyihani yuritish](34-loyihani-yuritish.md) | Topic branch'larda ishlash, patch qo'llash, `cherry-pick`, reliz tegi, build raqami, `archive`, `shortlog` |
| 35 | [GitHub: fork va pull request](35-github-fork-va-pr.md) | Hisob, SSH, fork, PR oqimi, review, PR'ni yangilash, Markdown |
| 36 | [GitHub: repo va tashkilotni boshqarish](36-github-boshqaruv.md) | Hamkorlar, PR'ni qabul qilish, himoyalangan branch, `CODEOWNERS`, tashkilot, API va `gh` |

## VII qism — Asboblar (37–44)

| # | Bob | Mazmun |
| --- | --- | --- |
| 37 | [Interaktiv staging](37-interaktiv-staging.md) | `add -i`, `add -p` (hunk'larni bo'lish va tahrirlash), `restore -p` |
| 38 | [`stash` va `clean`](38-stash-va-clean.md) | Stash qilish va qaytarish, `--keep-index`, untracked, stash'dan branch, `clean -n/-f/-d/-x` |
| 39 | [`reset` sirlari: uch daraxt](39-reset-sirlari.md) | HEAD, index, working tree; `--soft`/`--mixed`/`--hard`, yo'l bilan reset, squash, `checkout` bilan farqi |
| 40 | [Qidiruv](40-qidiruv.md) | `git grep`, `log -S`/`-G`, qator tarixi `log -L` |
| 41 | [`blame` va `bisect`](41-blame-va-bisect.md) | Qator muallifi, `-L`, `-C`, `bisect` qo'lda va `bisect run` bilan avtomatik |
| 42 | [`reflog` va ma'lumotni tiklash](42-reflog-va-tiklash.md) | Reflog, "yo'qolgan" commit'ni topish, `fsck --lost-found`, katta faylni tarixdan olib tashlash |
| 43 | [Submodule, `bundle` va `replace`](43-submodule-bundle-replace.md) | Submodule qo'shish, klonlash, yangilash, xatolar; bundle orqali uzatish; tarixni `replace` bilan ulash |
| 44 | [Imzolash](44-imzolash.md) | GPG va SSH bilan teg va commit imzolash, tekshirish, `merge --verify-signatures` |

## VIII qism — Sozlash (45–48)

| # | Bob | Mazmun |
| --- | --- | --- |
| 45 | [`git config` chuqur](45-config-chuqur.md) | Muhim sozlamalar, rang, tashqi merge/diff asboblari, qator oxirlari (`autocrlf`), whitespace, server sozlamalari, `includeIf` |
| 46 | [`.gitattributes`](46-gitattributes.md) | Binar fayllar, diff driver'lar, kalit so'zlarni almashtirish (clean/smudge filtrlari), eksport, merge strategiyasi |
| 47 | [Hook'lar](47-hooklar.md) | Klient va server hook'lari, `pre-commit`, `commit-msg`, `pre-push`, `pre-receive`, konfiguratsiyadagi hook'lar, qoida o'rnatish |
| 48 | [Muhit o'zgaruvchilari](48-muhit-ozgaruvchilari.md) | `GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE`, muallif sanalari, `GIT_TRACE`, `GIT_SSH_COMMAND` va boshqalar |

## IX qism — Katta loyihalar va yakun (49–50)

| # | Bob | Mazmun |
| --- | --- | --- |
| 49 | [Worktree va katta repo'lar](49-worktree-va-katta-repo.md) | `worktree`, `sparse-checkout`, partial clone, shallow clone, `maintenance`, `scalar`, Git LFS |
| 50 | [Buyruqlar xaritasi va checklist](50-buyruqlar-xaritasi.md) | Hamma buyruqlar vazifa bo'yicha, kundalik checklist, "xato qildim — endi nima?" jadvali, Git 3.0 |
