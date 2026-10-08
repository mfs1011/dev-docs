# 09 — Tarixni ko'rish: `log`

[← Oldingi: `.gitignore`, `rm` va `mv`](08-gitignore-rm-mv.md) · [Mundarija](README.md) · [Keyingi: Yaxshi commit →](10-yaxshi-commit.md)

## Tushuncha

Bir nechta commit qilganingizdan keyin yoki tayyor repo'ni klon qilganingizda, birinchi savol: **nima bo'lgan?** Kim, qachon, nimani o'zgartirgan va nega? Pro Git aytganidek, bunga eng asosiy va eng kuchli vosita — `git log`.

`git log` HEAD'dan (hozirgi commit'dan) boshlab **ota-ona havolalari** bo'ylab orqaga yuradi va har commit haqida ma'lumot chiqaradi. Esingizda bo'lsin: har **commit** — loyihaning ma'lum paytdagi to'liq surati (snapshot) va u o'zidan oldingi commit'ga (ota-onasiga) havola saqlaydi. Shu havolalar zanjiri — tarix:

```text
41bb09e ← 9f9283d ← 7e654d9 ← 3198b44 ← ... ← 2cc991b  ← main ← HEAD
(birinchi)                                     (eng yangi)
```

`git log` o'ng uchidan boshlab chapga yuradi — shuning uchun standart holatda **eng yangi commit birinchi** chiqadi (teskari xronologik tartib).

Bu bobda `git log`ning uch xil opsiyasini ko'ramiz:

1. **Ko'rinish** — har commit qanday chiqsin: `--oneline`, `--pretty`, `--format`, `--graph`, `--date`.
2. **Tarkib** — commit bilan birga nima ko'rsatilsin: `-p` (patch), `--stat`, `--name-status`.
3. **Cheklash** — qaysi commit'lar ko'rsatilsin: soni, vaqti, muallifi, xabari, fayli, kod o'zgarishi (`-S`, `-G`), branch oralig'i.

Oxirida `git shortlog` (mualliflar bo'yicha xulosa) va `git show` bilan tanishamiz.

> `git log` hech narsani o'zgartirmaydi — faqat o'qiydi. Ixtiyoriy opsiyani bemalol sinab ko'ring.

## Nega shunday: nega tarix "orqaga" o'qiladi

Commit faqat **ota-onasini** biladi, bolalarini emas. Sababi oddiy: commit yaratilganda uning ota-onasi allaqachon mavjud, bolalari esa hali yo'q. Commit obyekti o'zgarmas (uning hash'i mazmunidan hisoblanadi — 14- va 16-boblar), demak keyin "bolam paydo bo'ldi" deb yozib qo'yib bo'lmaydi. Commit obyektining ichi:

```text
$ git cat-file -p 0534cd6
tree 185155ca5c6cfa20d0f03267bdcfcbc198cb7282
parent 7407e42d087b815d9533da5e4c39a670ecd61619
author Vali Aliyev <vali@example.com> 1790948400 +0500
committer Ali Valiyev <ali@example.com> 1791000000 +0500

Kitob: matn ko'rinishi (__str__)
```

`parent` qatori — orqaga yo'naltirilgan yagona havola. Shuning uchun Git tarixni faqat bitta yo'nalishda — yangidan eskiga — yura oladi. `git log` aynan shu yurishning natijasi; uning hamma "cheklash" opsiyalari (`--since`, `--author`, `-- <fayl>`) shu yurish davomida qaysi commit'larni **ko'rsatish**ni hal qiladi.

Rasmiy hujjat buni to'plamlar tilida ta'riflaydi: buyruq qatoridagi commit'lardan erishiladigan commit'lar to'plami olinadi, `^` bilan berilganlardan erishiladiganlari undan **ayiriladi**, qolgani chiqariladi. Bu bobning "oraliqlar" bo'limi shu g'oyaga tayanadi.

## Kod: oddiy `git log`

Sinov repo'si — kichik "Kutubxona" loyihasi, 13 ta commit, ikki muallif (Ali va Vali), bitta birlashtirilgan branch va ikkita tag. Argumentsiz `git log`:

```text
$ git log -3
commit 2cc991b9e0224cb17fefb6ba35cc2ed538cd1e80
Author: Ali Valiyev <ali@example.com>
Date:   Tue Oct 6 08:50:00 2026 +0500

    Ombor: o'chirish xatti-harakati hujjatlashtirildi

commit 3c9796ea6b66a3803694da710e5d59093b7eba3a
Author: Ali Valiyev <ali@example.com>
Date:   Mon Oct 5 17:20:00 2026 +0500

    README: o'rnatish bo'limi

commit ff60b080f95568eecc02d879c464b3b74340c6e0
Author: Ali Valiyev <ali@example.com>
Date:   Sun Oct 4 10:00:00 2026 +0500

    Ombor: kitobni o'chirish
```

Har yozuvda: commit'ning to'liq SHA-1 hash'i, muallifning ismi va email'i, **muallif sanasi** va commit xabari (4 bo'shliq bilan surilgan). `-3` — faqat oxirgi uchtasi (`-n 3`, `--max-count=3` bilan bir xil).

Xabarida tana (body) bo'lgan commit to'liq chiqadi:

```text
$ git log -1 3198b44
commit 3198b448a8e1e05fc6575e4b581ef549b6e2e0b8
Author: Ali Valiyev <ali@example.com>
Date:   Fri Sep 25 16:45:00 2026 +0500

    Ombor: nom bo'yicha qidirish
    
    Hozircha faqat to'liq moslik. Qisman qidiruv keyinroq
    alohida commit'da qo'shiladi.
    
    Reviewed-by: Vali Aliyev <vali@example.com>
```

Merge commit'da qo'shimcha `Merge:` qatori — ota-onalarning qisqa hash'lari:

```text
$ git log -1 7407e42
commit 7407e42d087b815d9533da5e4c39a670ecd61619
Merge: af7becc 666d7be
Author: Ali Valiyev <ali@example.com>
Date:   Thu Oct 1 11:30:00 2026 +0500

    Merge branch 'qisman-qidiruv'
```

Rasmiy hujjatdagi nozik joy: tarixni fayl bo'yicha cheklasangiz, `Merge:` qatoridagi commit'lar **bevosita** ota-onalar bo'lmasligi mumkin — Git ko'rsatilmaydigan commit'larni "sakrab o'tgan" bo'ladi (pastda "Tarixni soddalashtirish").

### Pager

Terminalda `git log` chiqishni **pager** (odatda `less`) orqali ko'rsatadi: bir sahifa ko'rinadi, `Space` — keyingi sahifa, `b` — oldingi, `/matn` — qidirish, `q` — chiqish. Pro Git shu sababli `-<n>` kamdan-kam kerak bo'lishini aytadi. Pager'siz chiqarish: `git --no-pager log`, butunlay o'chirish yoki almashtirish: `core.pager` sozlamasi yoki `GIT_PAGER` muhit o'zgaruvchisi (45-bob). Bu kitobdagi misollar pager'siz ishlatilgan.

Bo'sh repo'da (hali commit yo'q):

```text
$ git log
fatal: your current branch 'main' does not have any commits yet
```

## Kod: har commit'ning o'zgarishi — `-p` va `--stat`

`-p` (`--patch`) har commit'dan keyin u kiritgan o'zgarishni (patch) ko'rsatadi — 7-bobdagi diff formatida:

```diff
$ git log -p -2
commit 2cc991b9e0224cb17fefb6ba35cc2ed538cd1e80
Author: Ali Valiyev <ali@example.com>
Date:   Tue Oct 6 08:50:00 2026 +0500

    Ombor: o'chirish xatti-harakati hujjatlashtirildi

diff --git a/src/ombor.py b/src/ombor.py
index 8d3e963..38360f1 100644
--- a/src/ombor.py
+++ b/src/ombor.py
@@ -16,5 +16,5 @@ def muallif_boyicha(muallif):
 
 
 def ochirish(nom):
-    # TODO: bir xil nomli kitoblar bo'lsa nima qilish kerak?
+    """Shu nomdagi hamma kitobni o'chiradi."""
     kitoblar[:] = [k for k in kitoblar if k.nom != nom]

commit 3c9796ea6b66a3803694da710e5d59093b7eba3a
Author: Ali Valiyev <ali@example.com>
Date:   Mon Oct 5 17:20:00 2026 +0500

    README: o'rnatish bo'limi

diff --git a/README.md b/README.md
index 1b3d568..98c766c 100644
--- a/README.md
+++ b/README.md
@@ -1,3 +1,7 @@
 # Kutubxona
 
 Kitoblar hisobini yurituvchi dastur.
+
+## O'rnatish
+
+    pip install -e .
```

Commit snapshot saqlaydi, diff emas (1-bob) — Git bu patch'ni har safar commit'ni **ota-onasi** bilan solishtirib hisoblaydi. Pro Git ta'kidlaydi: hamkasbingiz qo'shgan commit'larni ko'rib chiqish (code review) uchun juda qulay.

`--stat` — patch o'rniga qisqa statistika:

```text
$ git log --stat -2
commit 2cc991b9e0224cb17fefb6ba35cc2ed538cd1e80
Author: Ali Valiyev <ali@example.com>
Date:   Tue Oct 6 08:50:00 2026 +0500

    Ombor: o'chirish xatti-harakati hujjatlashtirildi

 src/ombor.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

commit 3c9796ea6b66a3803694da710e5d59093b7eba3a
...
 README.md | 4 ++++
 1 file changed, 4 insertions(+)
```

7-bobdagi hamma diff opsiyasi `git log`da ham ishlaydi: `--shortstat`, `--name-only`, `--name-status`, `--numstat`, `--word-diff`, `-w`, `-M` va hokazo:

```text
$ git log --name-status --oneline -3 af7becc
af7becc kitob.py -> model.py
R100	src/kitob.py	src/model.py
M	src/ombor.py
b34d365 Tuzatish: import yo'li paket ichida ishlamasdi
M	src/ombor.py
3198b44 Ombor: nom bo'yicha qidirish
M	src/ombor.py
```

`--raw` ham bor — eski `git whatchanged` buyrug'ining o'rnini bosadi:

```text
$ git log --raw --oneline -1
2cc991b Ombor: o'chirish xatti-harakati hujjatlashtirildi
:100644 100644 8d3e963 38360f1 M	src/ombor.py
```

> **Git 3.0 haqida.** `BreakingChanges` hujjatiga ko'ra `git whatchanged` olib tashlanadi. 2.56 da u allaqachon `--i-still-use-this` opsiyasisiz ishlamaydi va o'rniga `git log --raw --no-merges`ni maslahat beradi. Eski maqolalarda uchrasa, shu buyruqdan foydalaning.

### Merge commit'lar diff'siz chiqadi

E'tibor bering:

```text
$ git log -p -1 7407e42
commit 7407e42d087b815d9533da5e4c39a670ecd61619
Merge: af7becc 666d7be
Author: Ali Valiyev <ali@example.com>
Date:   Thu Oct 1 11:30:00 2026 +0500

    Merge branch 'qisman-qidiruv'
```

Patch yo'q. Bu xato emas: merge commit'ning ikki ota-onasi bor — qaysi biriga nisbatan diff ko'rsatish kerak? Rasmiy hujjat: `--diff-merges` variantlaridan biri (jumladan `-m`, `-c`, `--cc`, `--dd`) aniq berilmasa, `git log` merge'lar uchun diff ko'rsatmaydi va ular `-S` kabi qidiruvga ham **tushmaydi**. Yagona istisno — `--first-parent`.

```text
$ git log --oneline -1 --diff-merges=first-parent --stat 7407e42
7407e42 Merge branch 'qisman-qidiruv'
 src/ombor.py | 6 +++++-
 1 file changed, 5 insertions(+), 1 deletion(-)
$ git log --oneline -1 -m --stat 7407e42
7407e42 (from af7becc) Merge branch 'qisman-qidiruv'
 src/ombor.py | 6 +++++-
 1 file changed, 5 insertions(+), 1 deletion(-)
7407e42 (from 666d7be) Merge branch 'qisman-qidiruv'
 src/{kitob.py => model.py} | 0
 src/ombor.py               | 2 +-
 2 files changed, 1 insertion(+), 1 deletion(-)
```

Birinchi ota-onaga nisbatan — merge `main`ga nima olib keldi (branch'ning ishi). Ikkinchisiga nisbatan — branch'ga `main`dan nima keldi.

| Opsiya | Merge uchun diff |
| --- | --- |
| (hech narsa) | yo'q (`--diff-merges=off`) |
| `--diff-merges=first-parent`, `--dd` | birinchi ota-onaga nisbatan |
| `-m`, `--diff-merges=separate` | har ota-onaga nisbatan alohida (`-m` faqat `-p` yoki `--stat` bilan chiqadi) |
| `-c`, `--diff-merges=combined` | combined diff (7-bob) |
| `--cc`, `--diff-merges=dense-combined` | zich combined diff — `git show` standarti |
| `--remerge-diff` | merge'ni qaytadan bajarib, natijani haqiqiy merge commit bilan solishtiradi — konflikt qanday hal qilinganini ko'rsatadi |

`-m`ning standart formati `log.diffMerges` sozlamasida (standart — `separate`). Merge'lar va ularni ko'rib chiqish — 21–22- va 26-boblarda.

## Kod: chiqish formati — `--oneline` va `--pretty`

Ko'p commit'ni ko'rish uchun eng qulay format — bir qatorli:

```text
$ git log --oneline
2cc991b Ombor: o'chirish xatti-harakati hujjatlashtirildi
3c9796e README: o'rnatish bo'limi
ff60b08 Ombor: kitobni o'chirish
0534cd6 Kitob: matn ko'rinishi (__str__)
7407e42 Merge branch 'qisman-qidiruv'
af7becc kitob.py -> model.py
666d7be Muallif bo'yicha qidirish
b34d365 Tuzatish: import yo'li paket ichida ishlamasdi
25d0476 Qidiruv: qisman va registrga befarq
3198b44 Ombor: nom bo'yicha qidirish
7e654d9 Ombor moduli: kitob qo'shish
9f9283d Kitob klassi qo'shildi
41bb09e Loyiha boshlandi
```

`--oneline` — `--pretty=oneline --abbrev-commit`ning qisqa yozuvi. `--pretty=oneline` o'zi to'liq hash bilan chiqadi:

```text
$ git log --pretty=oneline -2
2cc991b9e0224cb17fefb6ba35cc2ed538cd1e80 Ombor: o'chirish xatti-harakati hujjatlashtirildi
3c9796ea6b66a3803694da710e5d59093b7eba3a README: o'rnatish bo'limi
```

**Qisqa hash** — to'liq hash'ning repo ichida yagona bo'lgan boshlanishi (standart — kamida 7 belgi, katta repo'da Git o'zi ko'paytiradi). `--abbrev=<n>` minimal uzunlikni beradi, `--no-abbrev-commit` qisqartirishni bekor qiladi:

```text
$ git log --oneline --abbrev=10 -2
2cc991b9e0 Ombor: o'chirish xatti-harakati hujjatlashtirildi
3c9796ea6b README: o'rnatish bo'limi
$ git log --oneline --no-abbrev-commit -1
2cc991b9e0224cb17fefb6ba35cc2ed538cd1e80 Ombor: o'chirish xatti-harakati hujjatlashtirildi
```

### Tayyor formatlar

`--pretty=<nom>` (yoki `--format=<nom>`):

```text
$ git log --pretty=short -1
commit 2cc991b9e0224cb17fefb6ba35cc2ed538cd1e80
Author: Ali Valiyev <ali@example.com>

    Ombor: o'chirish xatti-harakati hujjatlashtirildi
$ git log --pretty=fuller -1 0534cd6
commit 0534cd64c06774967f601027b2cd8e70070fe48e
Author:     Vali Aliyev <vali@example.com>
AuthorDate: Fri Oct 2 18:40:00 2026 +0500
Commit:     Ali Valiyev <ali@example.com>
CommitDate: Sat Oct 3 09:00:00 2026 +0500

    Kitob: matn ko'rinishi (__str__)
$ git log --pretty=reference -2
2cc991b (Ombor: o'chirish xatti-harakati hujjatlashtirildi, 2026-10-06)
3c9796e (README: o'rnatish bo'limi, 2026-10-05)
```

| Format | Nima ko'rsatadi |
| --- | --- |
| `oneline` | `<hash> <sarlavha>` — iloji boricha ixcham |
| `short` | hash, muallif, sarlavha (sanasiz) |
| `medium` | hash, muallif, muallif sanasi, to'liq xabar — **standart** |
| `full` | hash, muallif, **commit qiluvchi**, to'liq xabar |
| `fuller` | `full` + ikkala sana (`AuthorDate`, `CommitDate`) |
| `reference` | `<qisqa hash> (<sarlavha>, <qisqa sana>)` — commit xabarida boshqa commit'ga havola uchun |
| `email` | `From`, `Subject: [PATCH] ...` — patch email formati (33-bob) |
| `mboxrd` | `email` kabi, xabardagi `From ` qatorlarini `>` bilan himoyalaydi |
| `raw` | commit obyekti qanday saqlangan bo'lsa, shunday (`tree`, `parent`, vaqt tamg'asi) |
| `format:<satr>`, `tformat:<satr>` | o'zingiz tuzgan format (pastda) |

`raw` — ichki tuzilishni ko'rish uchun foydali: unda **haqiqiy** ota-onalar, to'liq hash'lar va Unix vaqt tamg'asi:

```text
$ git log --pretty=raw -1 7407e42
commit 7407e42d087b815d9533da5e4c39a670ecd61619
tree 4f07a3b21ea83a6f257dfc0ce169efc400803d65
parent af7becc5f7cd85d173057fd253b96dac2d66e98a
parent 666d7beabf654d60784e6052321fb162caa53d2b
author Ali Valiyev <ali@example.com> 1790836200 +0500
committer Ali Valiyev <ali@example.com> 1790836200 +0500

    Merge branch 'qisman-qidiruv'
```

```text
$ git log --format=email -1 3198b44
From 3198b448a8e1e05fc6575e4b581ef549b6e2e0b8 Mon Sep 17 00:00:00 2001
From: Ali Valiyev <ali@example.com>
Date: Fri, 25 Sep 2026 16:45:00 +0500
Subject: [PATCH] Ombor: nom bo'yicha qidirish

Hozircha faqat to'liq moslik. Qisman qidiruv keyinroq
alohida commit'da qo'shiladi.

Reviewed-by: Vali Aliyev <vali@example.com>
```

(`Mon Sep 17 00:00:00 2001` — haqiqiy sana emas, mbox formatidagi qat'iy belgi.)

### Muallif va commit qiluvchi

`fuller` chiqishida ikki xil odam va ikki xil sana ko'rindi. Pro Git farqni shunday tushuntiradi: **muallif** (author) — ishni dastlab yozgan odam; **commit qiluvchi** (committer) — ishni oxirgi marta qo'llagan odam. Masalan, siz loyihaga patch yuborsangiz va asosiy jamoa a'zosi uni qo'llasa, ikkalangiz ham qayd etilasiz: siz — muallif, u — commit qiluvchi. Bizning misolda Vali 2-oktabr kuni yozgan o'zgarishni Ali 3-oktabr kuni qo'llagan.

Commit qiluvchi `rebase`, `cherry-pick`, `commit --amend` (24–25-boblar) paytida ham o'zgaradi — muallif esa saqlanadi. Shuning uchun:

- `git log` standart holatda **muallif sanasini** ko'rsatadi (ish qachon yozilgan);
- vaqt bo'yicha cheklash (`--since`) esa **commit sanasiga** qaraydi (pastda ko'ramiz).

## Kod: o'z formatingiz — `--pretty=format:`

`format:` ichida `%` bilan boshlanadigan **o'rinbosarlar** (placeholder) commit ma'lumoti bilan almashtiriladi. Pro Git misoli:

```text
$ git log --pretty=format:'%h - %an, %ar : %s' -4
2cc991b - Ali Valiyev, 2 days ago : Ombor: o'chirish xatti-harakati hujjatlashtirildi
3c9796e - Ali Valiyev, 3 days ago : README: o'rnatish bo'limi
ff60b08 - Ali Valiyev, 4 days ago : Ombor: kitobni o'chirish
0534cd6 - Vali Aliyev, 6 days ago : Kitob: matn ko'rinishi (__str__)
```

(`%ar` — nisbiy sana, natija buyruqni ishlatgan kuningizga bog'liq.)

Pro Git ta'kidlaydi: `format` mashina o'qishi uchun ayniqsa foydali — formatni o'zingiz aniq belgilagansiz, u Git yangilanishi bilan o'zgarmaydi. `medium` kabi tayyor formatlarga skriptda tayanmang.

Eng ko'p ishlatiladigan o'rinbosarlar:

| O'rinbosar | Ma'nosi |
| --- | --- |
| `%H` / `%h` | commit hash'i — to'liq / qisqa |
| `%T` / `%t` | tree hash'i — to'liq / qisqa |
| `%P` / `%p` | ota-onalar hash'lari — to'liq / qisqa |
| `%an` / `%ae` / `%al` | muallif ismi / email / email'ning `@`gacha qismi |
| `%aN` / `%aE` | `.mailmap` qo'llangan ism / email (pastda) |
| `%ad` | muallif sanasi (`--date=` formatiga bo'ysunadi) |
| `%ar` / `%as` / `%ai` / `%aI` / `%at` / `%aD` / `%ah` | nisbiy / `YYYY-MM-DD` / ISO'ga o'xshash / qat'iy ISO 8601 / Unix vaqti / RFC 2822 / "inson uslubi" |
| `%cn`, `%ce`, `%cd`, `%cr`, `%cs`, ... | xuddi shular commit qiluvchi uchun |
| `%s` | sarlavha (xabarning birinchi qatori) |
| `%b` | tana (sarlavhadan keyingi qism) |
| `%B` | xom xabar (sarlavha + tana) |
| `%f` | fayl nomiga yaroqli sarlavha |
| `%d` / `%D` | ref nomlari (`--decorate` kabi) — qavs bilan / qavssiz |
| `%N` | commit eslatmalari (notes) |
| `%G?`, `%GS`, `%GK` | imzo holati, imzolovchi, kalit (44-bob) |
| `%gd`, `%gs` | reflog selektori va xabari (`-g` bilan, 42-bob) |
| `%(trailers...)` | xabar oxiridagi `Kalit: qiymat` qatorlari (trailer'lar) |
| `%(describe)` | `git describe` kabi nom (34-bob) |
| `%n` | yangi qator |
| `%%` | `%` belgisining o'zi |
| `%x00` | hex kod bo'yicha bayt (masalan NUL) |

Bir nechta misol — hammasi haqiqiy:

```text
$ git log --format='%H%n  tree:   %T%n  ota:    %P%n  muallif: %an <%ae> %ad%n' --date=iso -1 7407e42
7407e42d087b815d9533da5e4c39a670ecd61619
  tree:   4f07a3b21ea83a6f257dfc0ce169efc400803d65
  ota:    af7becc5f7cd85d173057fd253b96dac2d66e98a 666d7beabf654d60784e6052321fb162caa53d2b
  muallif: Ali Valiyev <ali@example.com> 2026-10-01 11:30:00 +0500

$ git log --format='%h%d %s' -4
2cc991b (HEAD -> main, tag: v0.2) Ombor: o'chirish xatti-harakati hujjatlashtirildi
3c9796e README: o'rnatish bo'limi
ff60b08 Ombor: kitobni o'chirish
0534cd6 Kitob: matn ko'rinishi (__str__)
$ git log --format='%h %(trailers:key=Reviewed-by,valueonly)' -1 3198b44
3198b44 Vali Aliyev <vali@example.com>

$ git log --format='%h %f' -3
2cc991b Ombor-o-chirish-xatti-harakati-hujjatlashtirildi
3c9796e README-o-rnatish-bo-limi
ff60b08 Ombor-kitobni-o-chirish
```

**Ustunlarga tekislash.** `%<(N)` keyingi o'rinbosarni kamida N belgi kenglikda chiqaradi, `trunc` bilan uzunini `..` bilan qisqartiradi. `%>(N)` — o'ngga, `%><(N)` — markazga tekislaydi:

```text
$ git log --format='%h %as %<(12,trunc)%an %s' -5
2cc991b 2026-10-06 Ali Valiyev  Ombor: o'chirish xatti-harakati hujjatlashtirildi
3c9796e 2026-10-05 Ali Valiyev  README: o'rnatish bo'limi
ff60b08 2026-10-04 Ali Valiyev  Ombor: kitobni o'chirish
0534cd6 2026-10-02 Vali Aliyev  Kitob: matn ko'rinishi (__str__)
7407e42 2026-10-01 Ali Valiyev  Merge branch 'qisman-qidiruv'
```

**Rang.** `%C(red)`, `%Cgreen`, `%Creset`, `%C(auto)` (Git'ning o'z ranglari: `%h` sariq, `%d` va hokazo). Rang faqat rang yoqilgan bo'lsa chiqadi (terminalda — `color.ui=auto`).

**Shartli belgilar.** `%+x` — o'rinbosar bo'sh bo'lmasa, oldidan yangi qator; `%-x` — bo'sh bo'lsa, oldidagi yangi qatorlarni o'chiradi; `% x` — bo'sh bo'lmasa, oldidan bo'shliq. Masalan `%h% D: %s` — ref bo'lmagan commit'larda ortiqcha bo'shliq qolmaydi (`%d`ning o'zi bo'shliq va qavs bilan boshlanadi, unga bu kerak emas).

### `format:` va `tformat:` farqi

`format:` yozuvlar **orasiga** ajratuvchi qo'yadi — oxirgi yozuvdan keyin yangi qator yo'q. `tformat:` har yozuv **oxiriga** tugatuvchi qo'yadi (`oneline` kabi):

```text
$ git log --format=format:%h -2 | od -c | tail -2
0000000    2   c   c   9   9   1   b  \n   3   c   9   7   9   6   e    
0000017
$ git log --format=tformat:%h -2 | od -c | tail -2
0000000    2   c   c   9   9   1   b  \n   3   c   9   7   9   6   e  \n
0000020
```

Yuqoridagi Pro Git misolida (`--pretty=format:...`) shuning uchun oxirgi qatordan keyin terminal taklifi shu qatorga yopishib qolishi mumkin. `%` bor, lekin `format:` prefiksi yo'q satr `tformat:` deb qabul qilinadi: `--format='%h %s'` = `--pretty=tformat:'%h %s'`. Skriptlarda shu shakl qulayroq.

### Formatga nom berish

Tez-tez ishlatadigan formatni sozlamada saqlash mumkin (45-bob):

```text
$ git -c pretty.qisqa='%h %as %an: %s' log --pretty=qisqa -3
2cc991b 2026-10-06 Ali Valiyev: Ombor: o'chirish xatti-harakati hujjatlashtirildi
3c9796e 2026-10-05 Ali Valiyev: README: o'rnatish bo'limi
ff60b08 2026-10-04 Ali Valiyev: Ombor: kitobni o'chirish
```

```ini
[pretty]
	qisqa = %h %as %an: %s
[format]
	pretty = qisqa      # git log ning standart formati (odatda medium)
```

## Kod: sana formatlari — `--date`

`--date=<format>` `medium`, `fuller` kabi formatlardagi va `%ad`/`%cd` o'rinbosarlaridagi sanani o'zgartiradi. Standart holatda sana **commit yozilgan vaqt mintaqasida** ko'rsatiladi. Bitta commit uchun hamma formatlar:

```text
--date=default: Fri Oct 2 18:40:00 2026 +0500
--date=iso: 2026-10-02 18:40:00 +0500
--date=iso-strict: 2026-10-02T18:40:00+05:00
--date=rfc: Fri, 2 Oct 2026 18:40:00 +0500
--date=short: 2026-10-02
--date=raw: 1790948400 +0500
--date=unix: 1790948400
--date=relative: 6 days ago
--date=human: Fri Oct 2 18:40
--date=format:%d.%m.%Y %H:%M: 02.10.2026 18:40
```

(Har qator `git log -1 --format=%ad --date=<format> 0534cd6` natijasi.)

| Format | Izoh |
| --- | --- |
| `default` | `ctime(3)` uslubi, vaqt mintaqasi bilan |
| `iso` (`iso8601`) | ISO 8601'ga o'xshash: `T` o'rniga bo'shliq, mintaqada `:` yo'q |
| `iso-strict` | qat'iy ISO 8601 — skriptlar uchun |
| `rfc` (`rfc2822`) | email sarlavhalaridagi format |
| `short` | faqat `YYYY-MM-DD` |
| `raw` | Unix soniyalari + mintaqa — commit obyektida aynan shunday saqlanadi |
| `unix` | faqat Unix soniyalari (har doim UTC) |
| `relative` | "6 days ago" — `--relative-date` bilan bir xil |
| `human` | shu yil bo'lsa yilni, yaqin kunlar bo'lsa sanani tashlab qoldiradi |
| `format:<strftime>` | o'z formatingiz: `%d.%m.%Y`, `%c` — tizim lokali |

Oxiriga `-local` qo'shilsa (`iso-local`, `format-local:...`), sana **sizning** vaqt mintaqangizga o'tkaziladi:

```text
$ TZ=UTC git log -1 --format=%ad --date=iso-local 0534cd6
2026-10-02 13:40:00 +0000
```

Doimiy standart — `log.date` sozlamasi.

## Kod: grafik — `--graph`

`--graph` chap tomonda tarixning ASCII grafigini chizadi. Branch va merge'lar ko'rinadi:

```text
$ git log --oneline --graph
* 2cc991b Ombor: o'chirish xatti-harakati hujjatlashtirildi
* 3c9796e README: o'rnatish bo'limi
* ff60b08 Ombor: kitobni o'chirish
* 0534cd6 Kitob: matn ko'rinishi (__str__)
*   7407e42 Merge branch 'qisman-qidiruv'
|\  
| * 666d7be Muallif bo'yicha qidirish
| * 25d0476 Qidiruv: qisman va registrga befarq
* | af7becc kitob.py -> model.py
* | b34d365 Tuzatish: import yo'li paket ichida ishlamasdi
|/  
* 3198b44 Ombor: nom bo'yicha qidirish
* 7e654d9 Ombor moduli: kitob qo'shish
* 9f9283d Kitob klassi qo'shildi
* 41bb09e Loyiha boshlandi
```

`*` — commit, `|` — tarix chizig'i, `|\` — merge (ikki ota-ona), `|/` — branch ajralgan joy.

Yuqoridagi grafiksiz `--oneline` bilan solishtiring: u yerda `666d7be` (29-sentabr) va `b34d365` (28-sentabr) aralash, sana tartibida edi. `--graph` standart holatda **`--topo-order`**ni yoqadi: bir branch'ning commit'lari aralashib ketmasligi uchun ba'zan eskiroq commit yangisidan oldin chiqadi. Tartib opsiyalari:

| Opsiya | Tartib |
| --- | --- |
| (standart) | teskari xronologik (commit sanasi bo'yicha) |
| `--date-order` | bola har doim ota-onadan oldin, qolgani commit sanasi bo'yicha |
| `--author-date-order` | xuddi shunday, lekin muallif sanasi bo'yicha |
| `--topo-order` | bola ota-onadan oldin va parallel chiziqlar aralashmaydi |
| `--reverse` | tanlangan commit'larni teskari tartibda (eng eskisi birinchi) |

**Ref nomlari — `--decorate`.** Branch, tag va HEAD qayerdaligini ko'rsatadi. `--all` — faqat HEAD'dan emas, **hamma** ref'lardan (`refs/` dagi hamma narsa) yurish:

```text
$ git log --oneline --graph --decorate --all
* 2cc991b (HEAD -> main, tag: v0.2) Ombor: o'chirish xatti-harakati hujjatlashtirildi
* 3c9796e README: o'rnatish bo'limi
* ff60b08 Ombor: kitobni o'chirish
* 0534cd6 Kitob: matn ko'rinishi (__str__)
*   7407e42 Merge branch 'qisman-qidiruv'
|\  
| * 666d7be (qisman-qidiruv) Muallif bo'yicha qidirish
| * 25d0476 Qidiruv: qisman va registrga befarq
* | af7becc kitob.py -> model.py
* | b34d365 Tuzatish: import yo'li paket ichida ishlamasdi
|/  
* 3198b44 (tag: v0.1) Ombor: nom bo'yicha qidirish
* 7e654d9 Ombor moduli: kitob qo'shish
* 9f9283d Kitob klassi qo'shildi
* 41bb09e Loyiha boshlandi
```

`HEAD -> main` — HEAD `main` branch'ini ko'rsatmoqda (17- va 20-boblar: branch — `.git/refs/heads/` dagi fayl, HEAD — undagi havola). `--decorate` qiymatlari: `short` (prefikssiz, standart), `full` (`refs/heads/main`), `auto` — terminalga chiqsa `short`, aks holda hech narsa. `log.decorate` sozlanmagan bo'lsa, standart `auto` — shuning uchun terminalda ref'larni ko'rasiz, quvurga (`| grep`) yuborsangiz ko'rmaysiz.

```text
$ git log --oneline --decorate=full -1
2cc991b (HEAD -> refs/heads/main, tag: refs/tags/v0.2) Ombor: o'chirish xatti-harakati hujjatlashtirildi
$ git log --oneline --decorate --decorate-refs=refs/tags -3 --all
2cc991b (tag: v0.2) Ombor: o'chirish xatti-harakati hujjatlashtirildi
3c9796e README: o'rnatish bo'limi
ff60b08 Ombor: kitobni o'chirish
```

`--decorate-refs=` / `--decorate-refs-exclude=` qaysi ref'lar ko'rsatilishini tanlaydi. `--source` — har commit'ga qaysi ref orqali yetib kelinganini ko'rsatadi (`--all` bilan foydali):

```text
$ git log --oneline --source --all -3
2cc991b	refs/heads/main Ombor: o'chirish xatti-harakati hujjatlashtirildi
3c9796e	refs/heads/main README: o'rnatish bo'limi
ff60b08	refs/heads/main Ombor: kitobni o'chirish
```

**Faqat "muhim" commit'lar — `--simplify-by-decoration`.** Faqat branch yoki tag ko'rsatgan commit'lar (va mazmunli tarix uchun kerakli bir nechtasi):

```text
$ git log --oneline --simplify-by-decoration --decorate
2cc991b (HEAD -> main, tag: v0.2) Ombor: o'chirish xatti-harakati hujjatlashtirildi
666d7be (qisman-qidiruv) Muallif bo'yicha qidirish
3198b44 (tag: v0.1) Ombor: nom bo'yicha qidirish
41bb09e Loyiha boshlandi
```

Ko'p ishlatiladigan alias (45-bob): `git config --global alias.lg "log --oneline --graph --decorate --all"`.

Yangi grafik opsiyalari: `--graph-lane-limit=<n>` (Git 2.55) — juda ko'p branch'li repo'da chiziqlar sonini cheklaydi, ortiqchasi `~` bilan almashtiriladi; Git 2.56 dan ota-onasiz "ildiz" commit'lar grafikda suriladi, toki ular tepadagi aloqasiz commit'ga bog'langandek ko'rinmasin (`--no-graph-indent` yoki `log.graphIndent=false` bilan o'chiriladi).

## Kod: commit'larni cheklash — soni va vaqti

```text
$ git log --oneline -n 2 --skip=3
0534cd6 Kitob: matn ko'rinishi (__str__)
7407e42 Merge branch 'qisman-qidiruv'
$ git log --oneline --max-count-oldest=3
7e654d9 Ombor moduli: kitob qo'shish
9f9283d Kitob klassi qo'shildi
41bb09e Loyiha boshlandi
$ git log --oneline --reverse -3
ff60b08 Ombor: kitobni o'chirish
3c9796e README: o'rnatish bo'limi
2cc991b Ombor: o'chirish xatti-harakati hujjatlashtirildi
```

- `-<n>`, `-n <n>`, `--max-count=<n>` — birinchi n ta.
- `--skip=<n>` — avval n tasini tashlab o'tish (sahifalash uchun).
- `--max-count-oldest=<n>` — **eng eski** n ta (Git 2.55 da qo'shilgan).
- `--reverse -3`ga e'tibor bering: eng eski uchtasi emas, **oxirgi uchtasi** teskari tartibda. Rasmiy hujjat: cheklash opsiyalari tartiblash (`--reverse`) dan **oldin** qo'llanadi.

**Vaqt bo'yicha** — Pro Git eng foydali deb ataydigan opsiyalar:

```text
$ git log --oneline --since=2026-10-01
2cc991b Ombor: o'chirish xatti-harakati hujjatlashtirildi
3c9796e README: o'rnatish bo'limi
ff60b08 Ombor: kitobni o'chirish
0534cd6 Kitob: matn ko'rinishi (__str__)
7407e42 Merge branch 'qisman-qidiruv'
$ git log --oneline --since='2026-09-25' --until='2026-09-28 23:59'
b34d365 Tuzatish: import yo'li paket ichida ishlamasdi
25d0476 Qidiruv: qisman va registrga befarq
3198b44 Ombor: nom bo'yicha qidirish
$ git log --oneline --since=1.week
2cc991b Ombor: o'chirish xatti-harakati hujjatlashtirildi
...
7407e42 Merge branch 'qisman-qidiruv'
```

| Opsiya | Ma'nosi |
| --- | --- |
| `--since=<sana>`, `--after=<sana>` | shu sanadan yangiroq commit'lar; `today` — bugungi yarim tun |
| `--until=<sana>`, `--before=<sana>` | shu sanadan eskiroq |
| `--since-as-filter=<sana>` | `--since` kabi, lekin birinchi eski commit'da to'xtamay, butun oraliqni ko'rib chiqadi |

Sana yozuvi juda erkin: `2026-10-01`, `"2026-09-28 23:59"`, `2.weeks`, `"2 years 1 day 3 minutes ago"`, `yesterday`.

**Muhim nozik joy: vaqt cheklovi commit sanasiga qaraydi.** `0534cd6`ning muallif sanasi 2-oktabr, commit sanasi 3-oktabr 09:00. Buyruq 8-oktabr ertalab ishlatildi:

```text
$ git log --oneline --after='5 days ago'
2cc991b Ombor: o'chirish xatti-harakati hujjatlashtirildi
3c9796e README: o'rnatish bo'limi
ff60b08 Ombor: kitobni o'chirish
0534cd6 Kitob: matn ko'rinishi (__str__)
```

`0534cd6` chiqdi, garchi `git log` uning sanasini "Fri Oct 2" deb ko'rsatsa ham. Rebase qilingan commit'larda bu farq kunlab bo'lishi mumkin.

**Nega `--since-as-filter` kerak.** `--since` tezlik uchun yurishni birinchi eski commit'da **to'xtatadi**. Commit sanalari tartibsiz bo'lsa (masalan, soati noto'g'ri kompyuterdan kelgan commit), undan keyingi yangi commit'lar ko'rinmay qolishi mumkin. `--since-as-filter` hammasini ko'rib chiqadi — sekinroq, lekin ishonchli:

```text
$ git log --oneline --since-as-filter=2026-10-04
2cc991b Ombor: o'chirish xatti-harakati hujjatlashtirildi
3c9796e README: o'rnatish bo'limi
ff60b08 Ombor: kitobni o'chirish
```

## Kod: muallif va xabar bo'yicha

`--author=<pattern>` va `--committer=<pattern>` — **regex**, u `Ism <email>` qatorining istalgan joyiga mos kelishi yetarli. Bu kutilmagan natija beradi:

```text
$ git log --oneline --author=Vali
2cc991b Ombor: o'chirish xatti-harakati hujjatlashtirildi
3c9796e README: o'rnatish bo'limi
...
41bb09e Loyiha boshlandi
```

13 ta commit'ning hammasi chiqdi — chunki "Ali **Vali**yev" ham `Vali`ni o'z ichiga oladi. Aniqroq pattern kerak:

```text
$ git log --oneline --author='^Vali'
0534cd6 Kitob: matn ko'rinishi (__str__)
666d7be Muallif bo'yicha qidirish
25d0476 Qidiruv: qisman va registrga befarq
7e654d9 Ombor moduli: kitob qo'shish
$ git log --oneline --author='<vali@'
0534cd6 Kitob: matn ko'rinishi (__str__)
666d7be Muallif bo'yicha qidirish
25d0476 Qidiruv: qisman va registrga befarq
7e654d9 Ombor moduli: kitob qo'shish
$ git log --oneline --committer='^Vali'
666d7be Muallif bo'yicha qidirish
25d0476 Qidiruv: qisman va registrga befarq
7e654d9 Ombor moduli: kitob qo'shish
```

`0534cd6` muallif bo'yicha Vali'niki, commit qiluvchi bo'yicha emas. Har xil opsiyalar **birgalikda** (VA) cheklaydi. "Vali yozgan, Ali qo'llagan" commit'ni qidiramiz:

```text
$ git log --format='%h %an / %cn  %s' --author=vali@ --committer=ali@
0534cd6 Vali Aliyev / Ali Valiyev  Kitob: matn ko'rinishi (__str__)
666d7be Vali Aliyev / Vali Aliyev  Muallif bo'yicha qidirish
25d0476 Vali Aliyev / Vali Aliyev  Qidiruv: qisman va registrga befarq
7e654d9 Vali Aliyev / Vali Aliyev  Ombor moduli: kitob qo'shish
```

Kutilgan bitta emas, to'rtta commit chiqdi. Sababi yana o'sha: `ali@` pattern'i `vali@example.com` ichida ham bor. Regex'ni aniq yozing: `--committer='<ali@'`. Bir xil opsiya bir necha marta berilsa (`--author=A --author=B`), **birortasiga** mos kelgani tanlanadi (YOKI).

**Xabar bo'yicha — `--grep`:**

```text
$ git log --oneline --grep=qidir
7407e42 Merge branch 'qisman-qidiruv'
666d7be Muallif bo'yicha qidirish
3198b44 Ombor: nom bo'yicha qidirish
$ git log --oneline -i --grep=TUZAT
b34d365 Tuzatish: import yo'li paket ichida ishlamasdi
$ git log --oneline --grep=Ombor --grep=README
2cc991b Ombor: o'chirish xatti-harakati hujjatlashtirildi
3c9796e README: o'rnatish bo'limi
ff60b08 Ombor: kitobni o'chirish
3198b44 Ombor: nom bo'yicha qidirish
7e654d9 Ombor moduli: kitob qo'shish
$ git log --oneline --grep=Ombor --grep=o.chir --all-match
2cc991b Ombor: o'chirish xatti-harakati hujjatlashtirildi
ff60b08 Ombor: kitobni o'chirish
$ git log --oneline --grep=Reviewed-by
3198b44 Ombor: nom bo'yicha qidirish
```

`--grep` butun xabarni (tana va trailer'lar ham) qidiradi. Pro Git eslatmasi: bir nechta `--grep` — **birortasi** mos kelsa yetarli; `--all-match` — **hammasi** mos kelishi kerak. `--invert-grep` — mos **kelmaganlarini** ko'rsatadi:

```text
$ git log --oneline --grep=Ombor --invert-grep
3c9796e README: o'rnatish bo'limi
0534cd6 Kitob: matn ko'rinishi (__str__)
7407e42 Merge branch 'qisman-qidiruv'
...
```

Regex turi (`--author`, `--committer`, `--grep` uchun umumiy):

| Opsiya | Pattern turi |
| --- | --- |
| `--basic-regexp` | asosiy POSIX regex — **standart** |
| `-E`, `--extended-regexp` | kengaytirilgan regex: `+`, `?`, `|`, `()` belgilarsiz ishlaydi |
| `-F`, `--fixed-strings` | oddiy matn (regex emas) — `.`, `*` o'zi |
| `-P`, `--perl-regexp` | Perl regex (`\b`, `\d`) — Git shu imkoniyat bilan yig'ilgan bo'lsa |
| `-i`, `--regexp-ignore-case` | registrga befarq |

```text
$ git log --oneline --grep='^Ombor' -E --grep='(qo.shish|qidirish)$' --all-match
3198b44 Ombor: nom bo'yicha qidirish
7e654d9 Ombor moduli: kitob qo'shish
```

## Kod: merge'lar va ota-onalar bo'yicha

```text
$ git log --oneline --merges
7407e42 Merge branch 'qisman-qidiruv'
$ git log --oneline --no-merges -4
2cc991b Ombor: o'chirish xatti-harakati hujjatlashtirildi
...
$ git log --oneline --max-parents=0
41bb09e Loyiha boshlandi
```

- `--no-merges` (= `--max-parents=1`) — Pro Git maslahati: ko'p workflow'larda merge commit'lar tarixning katta qismini egallaydi va ko'p ma'lumot bermaydi.
- `--merges` (= `--min-parents=2`) — faqat merge'lar.
- `--max-parents=0` — ildiz (ota-onasiz) commit'lar; `--min-parents=3` — "octopus" merge'lar.

**`--first-parent`** — merge'da faqat **birinchi** ota-ona bo'ylab yurish. Ya'ni `main`ning o'z tarixi: branch ichidagi commit'lar o'rniga faqat ularni olib kelgan merge ko'rinadi:

```text
$ git log --oneline --first-parent
2cc991b Ombor: o'chirish xatti-harakati hujjatlashtirildi
3c9796e README: o'rnatish bo'limi
ff60b08 Ombor: kitobni o'chirish
0534cd6 Kitob: matn ko'rinishi (__str__)
7407e42 Merge branch 'qisman-qidiruv'
af7becc kitob.py -> model.py
b34d365 Tuzatish: import yo'li paket ichida ishlamasdi
3198b44 Ombor: nom bo'yicha qidirish
7e654d9 Ombor moduli: kitob qo'shish
9f9283d Kitob klassi qo'shildi
41bb09e Loyiha boshlandi
```

`666d7be` va `25d0476` yo'q. Har bir topic branch PR orqali merge qilinadigan loyihada `git log --first-parent main` — "qaysi xususiyatlar qachon qo'shildi" tarixi. Rasmiy hujjatdagi misol: `git log -p -m --first-parent`.

## Kod: fayl bo'yicha

Oxirgi va eng foydali filtr (Pro Git) — **yo'l**. Faqat shu faylni (yoki papkani) o'zgartirgan commit'lar:

```text
$ git log --oneline -- README.md
3c9796e README: o'rnatish bo'limi
41bb09e Loyiha boshlandi
$ git log --oneline -- src/
2cc991b Ombor: o'chirish xatti-harakati hujjatlashtirildi
ff60b08 Ombor: kitobni o'chirish
...
9f9283d Kitob klassi qo'shildi
```

`--` — "opsiyalar va revision'lar tugadi, keyingisi yo'l". Ko'pincha ixtiyoriy, lekin ikki holatda shart:

```text
$ git log --oneline src/kitob.py
fatal: ambiguous argument 'src/kitob.py': unknown revision or path not in the working tree.
Use '--' to separate paths from revisions, like this:
'git <command> [<revision>...] -- [<file>...]'
$ git log --oneline -n 3 -- src/kitob.py
af7becc kitob.py -> model.py
9f9283d Kitob klassi qo'shildi
```

1. Fayl endi mavjud emas (o'chirilgan yoki qayta nomlangan) — Git uni revision deb o'ylaydi.
2. Fayl nomi branch nomi bilan bir xil — rasmiy hujjat misoli: `git log --since="2 weeks ago" -- gitk` (`gitk` nomli branch ham bor).

### `--follow` — qayta nomlashdan keyin ham

`src/kitob.py` 30-sentabrda `src/model.py`ga aylandi. Yangi nom bo'yicha tarix shu yerda uziladi:

```text
$ git log --oneline -- src/model.py
0534cd6 Kitob: matn ko'rinishi (__str__)
af7becc kitob.py -> model.py
$ git log --oneline --follow -- src/model.py
0534cd6 Kitob: matn ko'rinishi (__str__)
af7becc kitob.py -> model.py
9f9283d Kitob klassi qo'shildi
$ git log --oneline --stat --follow -- src/model.py
0534cd6 Kitob: matn ko'rinishi (__str__)
 src/model.py | 3 +++
 1 file changed, 3 insertions(+)
af7becc kitob.py -> model.py
 src/{kitob.py => model.py} | 0
 1 file changed, 0 insertions(+), 0 deletions(-)
9f9283d Kitob klassi qo'shildi
 src/kitob.py | 4 ++++
 1 file changed, 4 insertions(+)
```

`--follow` har commit'da rename'ni aniqlaydi (7-bobdagi `-M` mexanizmi) va eski nom bilan davom etadi. Cheklovi: faqat **bitta fayl** uchun ishlaydi. Rename aniqlash o'xshashlikka tayanadi (8-bob), shuning uchun nomini o'zgartirish va katta tahrirni alohida commit qiling. `log.follow=true` sozlamasi bitta yo'l berilganda `--follow`ni avtomatik yoqadi. Git 2.56 da `--follow` chiziqli bo'lmagan tarixda (fayl turli branch'larda turlicha qayta nomlanganda) yaxshilandi.

**Diff ham yo'l bilan cheklanadi.** `git log -p -- <yo'l>` faqat shu yo'lning diff'ini ko'rsatadi. Commit'ning **to'liq** diff'i kerak bo'lsa (commit'lar yo'l bo'yicha tanlansin, lekin diff to'liq chiqsin) — `--full-diff`.

**Qatorlar oralig'i — `-L`.** Fayl emas, uning bir qismi (qatorlar yoki funksiya) tarixi:

```text
$ git log -L '/def qidirish/,+2:src/ombor.py' --oneline
25d0476 Qidiruv: qisman va registrga befarq
diff --git a/src/ombor.py b/src/ombor.py
index 0602eca..0865bce 100644
--- a/src/ombor.py
+++ b/src/ombor.py
@@ -10,2 +10,2 @@ def qoshish(nom, muallif):
 def qidirish(nom):
-    return [k for k in kitoblar if k.nom == nom]
+    return [k for k in kitoblar if nom.lower() in k.nom.lower()]
3198b44 Ombor: nom bo'yicha qidirish
diff --git a/src/ombor.py b/src/ombor.py
index 1130b18..0602eca 100644
--- a/src/ombor.py
+++ b/src/ombor.py
@@ -8,0 +10,2 @@ kitoblar = []
+def qidirish(nom):
+    return [k for k in kitoblar if k.nom == nom]
```

`-L <boshi>,<oxiri>:<fayl>` yoki `-L :<funksiya>:<fayl>`. Batafsil — 40-bobda.

## Kod: kod o'zgarishi bo'yicha — `-S` va `-G`

Ba'zan savol "qaysi commit **shu kodni** qo'shdi yoki olib tashladi?" Pro Git `-S`ni Git'ning "pickaxe" (cho'kich) opsiyasi deb ataydi: u berilgan satrning fayldagi **uchrashlar sonini o'zgartirgan** commit'larni ko'rsatadi:

```text
$ git log --oneline -S TODO
2cc991b Ombor: o'chirish xatti-harakati hujjatlashtirildi
ff60b08 Ombor: kitobni o'chirish
$ git log --oneline -S muallif_boyicha
666d7be Muallif bo'yicha qidirish
```

`TODO` `ff60b08`da qo'shilgan, `2cc991b`da olib tashlangan. Diff bilan birga:

```diff
$ git log --oneline -p -S TODO -- src/ombor.py
2cc991b Ombor: o'chirish xatti-harakati hujjatlashtirildi
diff --git a/src/ombor.py b/src/ombor.py
...
 def ochirish(nom):
-    # TODO: bir xil nomli kitoblar bo'lsa nima qilish kerak?
+    """Shu nomdagi hamma kitobni o'chiradi."""
...
ff60b08 Ombor: kitobni o'chirish
...
+def ochirish(nom):
+    # TODO: bir xil nomli kitoblar bo'lsa nima qilish kerak?
+    kitoblar[:] = [k for k in kitoblar if k.nom != nom]
```

`-G<regex>` boshqacha: **qo'shilgan yoki o'chirilgan qatori** regex'ga mos keladigan commit'lar. Farq rasmiy hujjat misolidagidek bo'lgan holatda ko'rinadi:

```text
$ git log --oneline -S 'k.nom'
ff60b08 Ombor: kitobni o'chirish
3198b44 Ombor: nom bo'yicha qidirish
$ git log --oneline -G 'k\.nom'
ff60b08 Ombor: kitobni o'chirish
25d0476 Qidiruv: qisman va registrga befarq
3198b44 Ombor: nom bo'yicha qidirish
```

`25d0476` `k.nom == nom` qatorini `nom.lower() in k.nom.lower()` ga almashtirgan: `k.nom` qatorda bor edi va bor bo'lib qoldi — uchrashlar soni o'zgarmadi, shuning uchun `-S` uni ko'rmaydi. `-G` esa `-`/`+` qatorlarida mos kelishni ko'radi.

| | `-S<satr>` | `-G<regex>` |
| --- | --- | --- |
| Nimani tekshiradi | satrning uchrash **soni** o'zgardimi | o'zgargan qatorlarda regex bormi |
| Kodni ko'chirish (soni o'zgarmaydi) | ko'rmaydi | ko'radi |
| Regex | `--pickaxe-regex` bilan | doim regex |
| Tezligi | tezroq | sekinroq (diff hisoblanadi) |
| Qachon | "bu funksiya qachon paydo bo'ldi / yo'qoldi?" | "bu qatorga kim tegdi?" |

Qo'shimcha: `--pickaxe-all` — topilgan commit'ning faqat shu fayli emas, hamma o'zgarishini ko'rsatish; `--find-object=<hash>` — aniq blob'ni qo'shgan/olib tashlagan commit'lar. Esda tuting: merge commit'lar `--diff-merges`siz `-S`/`-G`ga tushmaydi. Qidiruvning hamma usullari (`git grep`, `-L`) — 40-bobda.

## Kod: branch'lar oralig'i

`git log` bitta commit'dan emas, **to'plamdan** ishlaydi. Rasmiy hujjat formulasi: berilgan commit'lardan erishiladiganlar minus `^` bilan berilganlardan erishiladiganlar.

```text
$ git log --oneline v0.1..v0.2
2cc991b Ombor: o'chirish xatti-harakati hujjatlashtirildi
3c9796e README: o'rnatish bo'limi
ff60b08 Ombor: kitobni o'chirish
0534cd6 Kitob: matn ko'rinishi (__str__)
7407e42 Merge branch 'qisman-qidiruv'
af7becc kitob.py -> model.py
666d7be Muallif bo'yicha qidirish
b34d365 Tuzatish: import yo'li paket ichida ishlamasdi
25d0476 Qidiruv: qisman va registrga befarq
```

`A..B` = `B ^A` — "B'dan erishiladigan, lekin A'dan erishilmaydigan". Ya'ni `v0.1` relizidan keyin nima qo'shildi. Opsiyalar bilan birlashtirish mumkin:

```text
$ git log --oneline v0.2 ^v0.1 --no-merges --author='^Vali'
0534cd6 Kitob: matn ko'rinishi (__str__)
666d7be Muallif bo'yicha qidirish
25d0476 Qidiruv: qisman va registrga befarq
$ git log --oneline main..qisman-qidiruv
$ git log --oneline qisman-qidiruv..main
2cc991b Ombor: o'chirish xatti-harakati hujjatlashtirildi
...
b34d365 Tuzatish: import yo'li paket ichida ishlamasdi
```

`main..qisman-qidiruv` bo'sh — branch to'liq merge qilingan, uning hamma commit'i `main`dan erishiladi. Bu "branch merge qilinganmi?" degan savolga javob (23-bob: `git branch --merged`).

**Uch nuqta** — simmetrik farq: ikkalasidan biriga erishiladigan, lekin ikkalasiga emas. `--left-right` qaysi tomondaligini ko'rsatadi:

```text
$ git log --oneline --left-right af7becc...qisman-qidiruv
< af7becc kitob.py -> model.py
> 666d7be Muallif bo'yicha qidirish
< b34d365 Tuzatish: import yo'li paket ichida ishlamasdi
> 25d0476 Qidiruv: qisman va registrga befarq
```

Merge'dan oldingi holat: chapda `main`dagi ikki commit, o'ngda branch'dagi ikkitasi.

Ref guruhlari:

| Opsiya | Nimadan yurish |
| --- | --- |
| `--all` | `refs/` dagi hamma ref va HEAD |
| `--branches[=<glob>]` | lokal branch'lar (`refs/heads`) |
| `--tags[=<glob>]` | tag'lar |
| `--remotes[=<glob>]` | remote-tracking branch'lar (28-bob) |
| `--glob=<glob>` | istalgan ref pattern'i |
| `--exclude=<glob>` | keyingi `--all`/`--branches`... dan chiqarish |
| `--not` | keyingi revision'lar oldiga `^` qo'yish |

```text
$ git log --oneline --branches='qisman*'
666d7be Muallif bo'yicha qidirish
25d0476 Qidiruv: qisman va registrga befarq
3198b44 Ombor: nom bo'yicha qidirish
...
```

Rasmiy hujjatdagi foydali misol: `git log --branches --not --remotes=origin` — lokal branch'larda bor, lekin `origin`ga hali yuborilmagan commit'lar. Revision va oraliq yozuvlarining to'liq ro'yxati (`HEAD~2`, `@{upstream}`, `^@` va boshqalar) — 19-bob.

> Eslatma: `git diff`dagi `..` va `...` boshqa ma'noga ega — u yerda ikki nuqta solishtiriladi (7-bob).

## Muhandislik nuqtai nazari: tarixni soddalashtirish

`git log -- <yo'l>` "shu faylni o'zgartirgan commit'lar"dan ko'ra nozikroq ishlaydi. Rasmiy ta'rif: **yo'llardagi fayllar qanday paydo bo'lganini tushuntirish uchun yetarli** commit'lar. Atama: yo'l bo'yicha ota-onasi bilan bir xil commit — **TREESAME**.

Standart rejim tarixni "yakuniy holatni tushuntiradigan eng sodda tarix"gacha qisqartiradi. Merge'da fayl ota-onalardan biri bilan TREESAME bo'lsa, Git faqat **o'sha** ota-ona bo'ylab yuradi va boshqa branch'ni butunlay tashlab ketadi — chunki natija shu ota-onadan kelgan. Odatda bu kerakli narsa, lekin ba'zan "yo'qolgan" o'zgarishni qidirayotganda chalg'itadi. Boshqa rejimlar:

| Opsiya | Ta'siri |
| --- | --- |
| `--full-history` | yon branch'larni kesmasdan, hamma o'zgartirgan commit'lar |
| `--simplify-merges` | `--full-history` + hech narsa qo'shmagan ortiqcha merge'larni olib tashlash |
| `--show-pulls` | standart + o'zgarishni branch'ga birinchi "olib kirgan" merge'lar |
| `--dense` / `--sparse` | faqat tanlanganlar (+ zarurlari) / soddalashtirilgan tarixdagi hammasi |
| `--ancestry-path[=<commit>]` | oraliqda faqat berilgan commit'ning ajdodlari va avlodlari |

`--graph` va `--parents` "ota-onalarni qayta yozish" (parent rewriting) ni yoqadi: ko'rsatilmagan commit'lar o'rniga grafik to'g'ridan-to'g'ri ko'rsatilgan ajdodga ulanadi. Shu sababli yo'l bilan cheklangan `--graph` hamon bog'langan bo'lib ko'rinadi.

Qachon kerak: "bu o'zgarish merge'da yo'qoldi, qayerda?" degan savolda — `git log --full-history -- <fayl>`. Kundalik ishda standart rejim yetarli.

## Muhandislik nuqtai nazari: `.mailmap` — bir odam, bir nechta email

Bir dasturchi turli kompyuterlardan turli ism yoki email bilan commit qilgan bo'lishi mumkin. `git shortlog` uni ikki odam deb hisoblaydi. Yechim — repo ildizidagi `.mailmap` fayli (`gitmailmap(5)`): "shu email'ni shu ism va email'ga moslash". Sinov uchun (commit qilinmagan fayl):

```text
$ echo 'Vali Aliyev <vali@kutubxona.uz> <vali@example.com>' > .mailmap
$ git shortlog -sne HEAD
     9	Ali Valiyev <ali@example.com>
     4	Vali Aliyev <vali@kutubxona.uz>
$ git log -1 0534cd6 | head -3
commit 0534cd64c06774967f601027b2cd8e70070fe48e
Author: Vali Aliyev <vali@kutubxona.uz>
Date:   Fri Oct 2 18:40:00 2026 +0500
$ git log -1 --no-mailmap 0534cd6 | head -3
commit 0534cd64c06774967f601027b2cd8e70070fe48e
Author: Vali Aliyev <vali@example.com>
Date:   Fri Oct 2 18:40:00 2026 +0500
$ git log -1 --format='%an <%ae> | %aN <%aE>' 0534cd6
Vali Aliyev <vali@example.com> | Vali Aliyev <vali@kutubxona.uz>
```

`.mailmap` faqat **ko'rsatishni** o'zgartiradi — commit obyektlari o'zgarmaydi (o'zgartirib bo'lmaydi ham). `log.mailmap` standart `true`, shuning uchun `git log` uni avtomatik qo'llaydi; `--no-mailmap` o'chiradi. Format o'rinbosarlarida tanlov aniq: `%an`/`%ae` — asl qiymat, `%aN`/`%aE` — moslangan.

## Kod: `git shortlog` — mualliflar bo'yicha xulosa

`git shortlog` commit'larni **muallif** bo'yicha guruhlaydi — reliz e'lonlari uchun mo'ljallangan. Sarlavhadagi `[PATCH]` olib tashlanadi.

```text
$ git shortlog HEAD
Ali Valiyev (9):
      Loyiha boshlandi
      Kitob klassi qo'shildi
      Ombor: nom bo'yicha qidirish
      Tuzatish: import yo'li paket ichida ishlamasdi
      kitob.py -> model.py
      Merge branch 'qisman-qidiruv'
      Ombor: kitobni o'chirish
      README: o'rnatish bo'limi
      Ombor: o'chirish xatti-harakati hujjatlashtirildi

Vali Aliyev (4):
      Ombor moduli: kitob qo'shish
      Qidiruv: qisman va registrga befarq
      Muallif bo'yicha qidirish
      Kitob: matn ko'rinishi (__str__)
```

> **Nega `HEAD` yozildi?** Rasmiy hujjat: revision berilmasa va standart kirish terminal bo'lmasa (skript, CI, quvur), `git shortlog` **standart kirishdan** `git log` chiqishini o'qiydi va repo'ga qaramaydi. Sinovda `HEAD`siz natija bo'sh bo'ldi, `--group=trailer:...` esa xato berdi: `fatal: using --group=trailer with stdin is not supported`. Terminalda `git shortlog` o'zi ishlaydi, lekin skriptda har doim revision'ni aniq yozing.

Ko'p ishlatiladigan shakllar:

```text
$ git shortlog -sn HEAD
     9	Ali Valiyev
     4	Vali Aliyev
$ git shortlog -sne HEAD
     9	Ali Valiyev <ali@example.com>
     4	Vali Aliyev <vali@example.com>
$ git shortlog -sn -c HEAD
    10	Ali Valiyev
     3	Vali Aliyev
$ git shortlog -sn --group=trailer:reviewed-by HEAD
     1	Vali Aliyev
$ git shortlog --format='[%h] %s' v0.1..v0.2 --no-merges
Ali Valiyev (5):
      [b34d365] Tuzatish: import yo'li paket ichida ishlamasdi
      [af7becc] kitob.py -> model.py
      [ff60b08] Ombor: kitobni o'chirish
      [3c9796e] README: o'rnatish bo'limi
      [2cc991b] Ombor: o'chirish xatti-harakati hujjatlashtirildi

Vali Aliyev (3):
      [25d0476] Qidiruv: qisman va registrga befarq
      [666d7be] Muallif bo'yicha qidirish
      [0534cd6] Kitob: matn ko'rinishi (__str__)
```

| Opsiya | Ma'nosi |
| --- | --- |
| `-n`, `--numbered` | commit soni bo'yicha saralash (standart — alifbo) |
| `-s`, `--summary` | faqat sonlar |
| `-e`, `--email` | email'ni ham ko'rsatish |
| `-c`, `--committer` | commit qiluvchi bo'yicha (`--group=committer`) |
| `--group=<tur>` | `author`, `committer`, `trailer:<kalit>`, `format:<format>`; bir necha marta berilsa, har biri bo'yicha sanaladi |
| `--format=<format>` | sarlavha o'rniga boshqa ma'lumot |
| `-w[<kenglik>[,<i1>[,<i2>]]]` | qatorlarni o'rash (standart 76, 6, 9) |

`--group=trailer:reviewed-by` — kim ko'proq review qilgan (trailer'i yo'q commit'lar sanalmaydi). `--group=format:%as` — kunlar bo'yicha. Reliz e'lonlarida `git shortlog --no-merges v0.1..v0.2` — 34-bob.

## Kod: `git show` — bitta commit'ni ko'rish

`git show <commit>` — `git log -1 -p <commit>`ga yaqin, lekin merge uchun `--cc` diff ko'rsatadi va tag, tree, blob'ni ham ko'rsata oladi (16–17-boblar):

```text
$ git show --stat 7407e42
commit 7407e42d087b815d9533da5e4c39a670ecd61619
Merge: af7becc 666d7be
Author: Ali Valiyev <ali@example.com>
Date:   Thu Oct 1 11:30:00 2026 +0500

    Merge branch 'qisman-qidiruv'

 src/ombor.py | 6 +++++-
 1 file changed, 5 insertions(+), 1 deletion(-)
```

`git log`ning format va diff opsiyalari `git show`da ham ishlaydi: `git show --format=fuller`, `git show -s` (diff'siz), `git show HEAD:src/ombor.py` (fayl mazmuni).

## Muhandislik nuqtai nazari: `git log` qanday ishlaydi va nima arzon

`git log` — `git rev-list` (commit'lar ro'yxatini chiqaradigan plumbing) + formatlash + diff. Ichkarida:

1. Boshlang'ich commit'lar (HEAD yoki berilganlar) navbatga qo'yiladi, `^` bilan berilganlar "qiziq emas" deb belgilanadi.
2. Navbatdan eng yangi (commit sanasi bo'yicha) commit olinadi, uning commit obyekti o'qiladi, `parent`lari navbatga qo'shiladi.
3. Har commit cheklash filtrlaridan o'tkaziladi va formatlanadi.

Buning oqibatlari:

- **Metama'lumot bo'yicha filtrlar arzon** — `--author`, `--grep`, `--since`, `--merges` faqat commit obyektini o'qiydi.
- **Yo'l bo'yicha filtr o'rtacha** — har commit'ning tree'sini ota-onasiniki bilan solishtirish kerak, lekin o'zgarmagan papkalar tree hash'i bo'yicha darhol o'tkaziladi.
- **`-p`, `--stat`, `-G`, `--follow` qimmat** — blob'larni o'qib, diff hisoblash kerak. `-S` diff'siz ham ishlaydi (faqat sanaydi), shuning uchun `-G`dan tezroq.
- **`--since` erta to'xtaydi**, `--since-as-filter` to'xtamaydi.
- Katta repo'larda **commit-graph** fayli (`.git/objects/info/commit-graph`, 18-bob) ota-onalar va sanalarni oldindan saqlaydi — `--graph`, `--topo-order`, `A..B` sezilarli tezlashadi. `git maintenance` uni yangilab turadi.

Va eng muhim xulosa: `git log` ko'rsatadigan tarix — **ota-ona havolalari grafi**, vaqt chizig'i emas. Sana — commit ichidagi oddiy maydon, uni istalgan qiymatga qo'yish mumkin (bu kitob misollaridagi kabi). Tarixning haqiqiy tartibi — kim kimning ota-onasi ekani.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `--author=Vali` bilan faqat Vali'ni kutish | Pattern regex, "Ali Valiyev"ga ham mos keladi | `--author='^Vali'` yoki `--author='<vali@'` |
| Merge'ning `-p` diff'i yo'q — "merge bo'sh" deb o'ylash | `git log` merge'lar uchun diff'ni standart holatda ko'rsatmaydi | `--diff-merges=first-parent`, `-m`, `--cc` yoki `git show` |
| `-S` bilan qatorni o'zgartirgan commit'ni qidirish | `-S` faqat uchrashlar soni o'zgarganini ko'radi | `-G<regex>` |
| O'chirilgan fayl tarixini `git log <fayl>` bilan so'rash | Fayl yo'q — Git uni revision deb o'ylaydi | `git log -- <fayl>` |
| Qayta nomlangan fayl tarixi "uzilgan" | Yo'l filtri rename'ni bilmaydi | `git log --follow -- <fayl>` |
| `--since` muallif sanasiga qaraydi deb o'ylash | Vaqt cheklovi commit sanasiga qaraydi | `--format=fuller` bilan ikkala sanani tekshiring |
| `--reverse -3` eng eski uchtasini beradi deb kutish | Cheklash tartiblashdan oldin qo'llanadi — oxirgi uchtasi teskari | `--max-count-oldest=3` yoki `--reverse` + `head` |
| Skriptda `git log` (medium) chiqishini tahlil qilish | Inson uchun format, sozlamalarga bog'liq (mailmap, decorate, date) | `--format='%H%x00%an%x00%s'` kabi aniq format |
| Format qo'shtirnoqsiz: `git log --format=%h %s` | Shell `%s`ni alohida argument qiladi — `fatal: ambiguous argument '%s'` | `--format='%h %s'` |
| Skript/CI'da `git shortlog -sn` | Standart kirishni o'qiydi — bo'sh natija | `git shortlog -sn HEAD` |
| Eski maqoladagi `git whatchanged` | Git 3.0 da olib tashlanadi, 2.56 da rad etadi | `git log --raw --no-merges` |
| `--graph`siz tarixni chiziqli deb o'qish | Parallel branch commit'lari sana bo'yicha aralashadi | `--graph` yoki `--show-linear-break` |

## Amaliyot

1. Ixtiyoriy repo'da `git log`, `--oneline`, `--pretty=short`, `--pretty=fuller` va `--pretty=raw` natijalarini solishtiring. `raw`dagi `tree` va `parent` qatorlarini `git cat-file -p <commit>` bilan tekshiring.
2. `--format` bilan quyidagi ko'rinishni tuzing: `qisqa-hash | YYYY-MM-DD | muallif (12 belgi, kesilgan) | sarlavha`. Uni `pretty.<nom>` sozlamasiga saqlab, `--pretty=<nom>` bilan chaqiring.
3. Ikki xil muallif va commit qiluvchi bilan commit yarating (`GIT_COMMITTER_NAME`, `GIT_COMMITTER_DATE` muhit o'zgaruvchilari bilan). `--author`, `--committer`, `--since` qaysi maydonga qarashini sinab ko'ring.
4. Branch oching, unda ikki commit qiling, `main`da ham ikki commit qiling va `--no-ff` bilan merge qiling. `--graph`, `--first-parent`, `--no-merges`, `main..branch`, `branch...main --left-right` natijalarini tahlil qiling. Merge'ni `-p`, `-m --stat`, `--diff-merges=first-parent` bilan ko'ring.
5. Faylni qayta nomlang va yana bir marta o'zgartiring. `git log -- <yangi-nom>` va `git log --follow -- <yangi-nom>` farqini ko'rsating. Eski nom bilan `git log <eski-nom>` (`--`siz) qanday xato berishini kuzating.
6. Bir commit'da funksiya qo'shing, ikkinchisida uning ichidagi qatorni o'zgartiring (funksiya nomi qolsin), uchinchisida funksiyani o'chiring. `-S<funksiya-nomi>` va `-G<funksiya-nomi>` qaysi commit'larni topishini oldindan ayting, keyin tekshiring.
7. `git shortlog -sn HEAD`, `-c`, `--group=format:%as` natijalarini oling. Keyin `.mailmap` yozib, bitta muallifning email'ini almashtiring va `%ae` bilan `%aE` farqini ko'rsating.
8. (Qiyinroq) Bitta skript yozing: berilgan ikki tag oralig'idagi har commit uchun `hash<TAB>muallif<TAB>sana(ISO)<TAB>sarlavha` chiqarsin, merge'larsiz, eskisidan yangisiga. `--format`, `--date=iso-strict`, `--no-merges`, `--reverse` va `%x09` dan foydalaning. So'ng xuddi shu oraliq uchun `git shortlog --no-merges` bilan reliz e'loni matnini yarating.

## Rasmiy hujjat

- Pro Git — Viewing the Commit History: <https://git-scm.com/book/en/v2/Git-Basics-Viewing-the-Commit-History>
- `git log`: <https://git-scm.com/docs/git-log>
- `git log` — PRETTY FORMATS: <https://git-scm.com/docs/git-log#_pretty_formats>
- `git log` — Commit Limiting va History Simplification: <https://git-scm.com/docs/git-log#_commit_limiting>
- `git shortlog`: <https://git-scm.com/docs/git-shortlog>
- `git show`: <https://git-scm.com/docs/git-show>
- `gitmailmap`: <https://git-scm.com/docs/gitmailmap>
- `gitrevisions` (oraliqlar): <https://git-scm.com/docs/gitrevisions>
