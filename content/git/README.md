# Git — model, jamoaviy ish va tiklanish

Buyruqlarni yodlash emas: Git qanday saqlashini tushunish, jamoada xavfsiz ishlash va xatodan tiklanish. Har buyruq vaqtinchalik repo'da sinab ko'riladi.

Rasmiy manba: <https://git-scm.com/doc> (Pro Git). Versiyalar har bobni yozishdan oldin tekshiriladi va shu yerda jadval sifatida beriladi.

> **Holat.** Qo'llanma tayyorlanmoqda — quyida rejalashtirilgan mundarija.

---

## I qism — Asoslar (1–7)

| # | Bob | Mazmun |
| --- | --- | --- |
| 01 | Git nima va nega *(tayyorlanmoqda)* | Versiya nazorati, taqsimlangan model, Git vs GitHub |
| 02 | O'rnatish va sozlash *(tayyorlanmoqda)* | `git config`, ism/email, muharrir, SSH kalit |
| 03 | Uch hudud *(tayyorlanmoqda)* | Working tree, staging (index), repository |
| 04 | Birinchi commit'lar *(tayyorlanmoqda)* | `init`, `add`, `commit`, `status`, `diff`, `log` |
| 05 | Yaxshi commit *(tayyorlanmoqda)* | Kichik va mantiqiy commit, xabar yozish, Conventional Commits |
| 06 | `.gitignore` *(tayyorlanmoqda)* | Nima kiritilmaydi: sirlar, `node_modules`, build |
| 07 | Ichkarida nima bor *(tayyorlanmoqda)* | Blob, tree, commit, SHA — Git qanday saqlaydi |

## II qism — Branch'lar (8–13)

| # | Bob | Mazmun |
| --- | --- | --- |
| 08 | Branch nima *(tayyorlanmoqda)* | Ko'rsatkich, `HEAD`, `switch`, `branch` |
| 09 | Merge *(tayyorlanmoqda)* | Fast-forward, merge commit |
| 10 | Konfliktlar *(tayyorlanmoqda)* | Nega paydo bo'ladi, qanday hal qilinadi, asboblar |
| 11 | Rebase *(tayyorlanmoqda)* | `rebase`, interaktiv rebase (`squash`, `fixup`, `reword`), oltin qoida |
| 12 | Merge vs rebase *(tayyorlanmoqda)* | Tarix ko'rinishi, jamoa kelishuvi |
| 13 | `cherry-pick` va `stash` *(tayyorlanmoqda)* | Bitta commit'ni ko'chirish, ishni vaqtincha chetga olish |

## III qism — Masofaviy repo va jamoa (14–19)

| # | Bob | Mazmun |
| --- | --- | --- |
| 14 | Remote *(tayyorlanmoqda)* | `clone`, `fetch`, `pull`, `push`, upstream |
| 15 | GitHub asoslari *(tayyorlanmoqda)* | Repo, SSH, fork, issue |
| 16 | Pull request *(tayyorlanmoqda)* | PR yaratish, review, izohlar, `gh` CLI |
| 17 | Branch strategiyalari *(tayyorlanmoqda)* | GitHub Flow, trunk-based, Git Flow — qachon qaysi |
| 18 | Himoyalangan branch'lar *(tayyorlanmoqda)* | Majburiy review, CI tekshiruvlari, CODEOWNERS |
| 19 | Teglar va relizlar *(tayyorlanmoqda)* | `tag`, semver, CHANGELOG |

## IV qism — Tiklanish va chuqur (20–24)

| # | Bob | Mazmun |
| --- | --- | --- |
| 20 | Xatoni bekor qilish *(tayyorlanmoqda)* | `restore`, `reset` (soft/mixed/hard), `revert` — qaysi biri xavfsiz |
| 21 | `reflog` — qutqaruvchi *(tayyorlanmoqda)* | "Yo'qolgan" commit'ni topish |
| 22 | Qidiruv va tarix *(tayyorlanmoqda)* | `log` filtrlari, `blame`, `bisect` (xato kiritgan commit'ni topish) |
| 23 | Hook'lar va avtomatlashtirish *(tayyorlanmoqda)* | pre-commit, commit-msg, husky/lefthook |
| 24 | Katta repo va checklist *(tayyorlanmoqda)* | Monorepo, LFS, submodule haqida, kundalik ish ro'yxati |
