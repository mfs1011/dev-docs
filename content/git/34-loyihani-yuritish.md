# 34 — Loyihani yuritish

[← Oldingi: Loyihaga hissa qo'shish](33-hissa-qoshish.md) · [Mundarija](README.md) · [Keyingi: GitHub: fork va pull request →](35-github-fork-va-pr.md)

## Tushuncha

[33-bobda](33-hissa-qoshish.md) biz **hissa qo'shuvchi** tomonida turdik: ishni topic branch'da tayyorlash, `format-patch` bilan patch yaratish, fork'ga push qilib so'rov yuborish. Bu bob — qarama-qarshi tomon. **Maintainer** (loyihani yurituvchi — asosiy repo'ga yozish huquqi bor va begona ishni qabul qiladigan yoki rad etadigan odam) savoli: "Menga patch keldi (yoki "mana bu branch'ni oling" degan xat). Uni qanday qilib xavfsiz sinab ko'raman, ko'rib chiqaman va loyihaga qo'shaman — shunday qilib, ertaga ham, bir yildan keyin ham bu jarayon menga og'ir bo'lmasin?"

Pro Git bu ishni bir necha bosqichga bo'ladi. Biz hammasini lokal repo'larda haqiqatan yurgizamiz:

| Bosqich | Savol | Asosiy buyruqlar |
| --- | --- | --- |
| Topic branch | Begona ishni qayerda sinayman? | `git switch -c <muallif>/<mavzu> main` |
| Email'dan patch | `git diff` yoki `format-patch` bilan kelgan faylni qanday qo'llayman? | `git apply --stat/--check`, `git am`, `am -3`, `--continue/--skip/--abort` |
| Remote branch | Hissa qo'shuvchining o'z repo'si bo'lsa-chi? | `git remote add`, `git fetch`, `git switch -c ... <remote>/<branch>` |
| Ko'rib chiqish | Merge qilsam, aslida nima kiradi? | `log main..topic`, `diff main...topic`, `merge-base` |
| Integratsiya | Merge qilaymi, rebase qilaymi yoki bitta commit'ni olaymi? | `merge`, `rebase` + `merge --ff-only`, `cherry-pick` |
| Reliz | Versiyani qanday belgilayman va tarqataman? | `tag -a`, `describe`, `archive`, `shortlog` |

> **Misollar haqida.** Hamma "server"lar — lokal bare repo'lar (`git init --bare`, [4-bob](04-repo-olish.md)), tarmoqqa hech narsa yuborilmagan, hech qanday xat jo'natilmagan — patch fayllari bir papkadan boshqasiga ko'chiriladi. Yo'llar qisqartirilgan: `~/loyiha/...`. Har commit'ga alohida vaqt berilgan, shuning uchun hash'lar takrorlanadi. Ishtirokchilar (33-bobdagilar): **Ali Valiyev** — maintainer, **Javohir Tursunov**, **Dildora Qosimova** va **Sevara Nazarova** — hissa qo'shuvchilar.

```text
~/loyiha/
├── server.git/    ← asosiy (canonical) repo, faqat Ali yozadi
├── ali/           ← maintainer'ning ish nusxasi
├── javohir/       ← patch'larni fayl/xat sifatida yuboradi
├── dildora/       ← eski asosda ishlagan, seriyasi konflikt beradi
├── sevara/        ← o'z ommaviy repo'siga push qiladi
└── sevara.git/    ← Sevara'ning ommaviy repo'si (fork)
```

Boshlang'ich loyiha — kichik `hisob.py` kutubxonasi (`qosh`, `ayir`, `kopaytir`), `README.md`, `tests/test_hisob.py`. Birinchi commit `ddadeeb Loyiha boshlandi` annotated `v1.0` tegi bilan belgilangan.

## Nega shunday: nega begona ishni avval topic branch'ga olasiz

Kelgan patch — **hali ishonilmagan** kod. U ishlamasligi, testlarni buzishi, boshqa patch'ga bog'liq bo'lishi yoki shunchaki hozir vaqtingiz yetmasligi mumkin. Agar uni to'g'ridan-to'g'ri `main`ga qo'llasangiz, quyidagi savollarga javob qiyinlashadi:

- "Bu patch'ni rad etsam, `main`ni qanday tozalayman?" — `reset` yoki `revert` kerak bo'ladi, `main` esa allaqachon push qilingan bo'lishi mumkin.
- "Ikki hafta keyin qaytib kelsam, qaysi commit'lar shu patch'dan edi?" — `main`da ular boshqa ishlar orasida yo'qolib ketadi.

**Topic branch** ([31-bob](31-branch-workflowlari.md)) — aynan shu muammoning yechimi: vaqtinchalik, bitta mavzuga atalgan branch. Unda patch'ni bemalol tuzatish, tashlab qo'yish va keyin qaytish mumkin; `main` esa toza qoladi. Branch — shunchaki `.git/refs/heads/` dagi kichik fayl ([20-bob](20-branch-bu-ref.md)), shuning uchun har patch uchun yangi branch ochish deyarli bepul.

Pro Git maslahati: nomni mavzuga qarab tanlang (`ruby_client` kabi), shunda bir muddat tashlab qo'ysangiz ham eslab qolasiz. Git loyihasining maintainer'i nomlarga **muallif bosh harflarini** prefiks qilib qo'shadi: `sc/ruby_client` — `sc` hissa qo'shuvchining qisqartmasi. Biz ham shunday qilamiz: `jt/` — Javohir Tursunov, `dq/` — Dildora Qosimova, `sn/` — Sevara Nazarova.

## Kod: topic branch — ishni sinash joyi

Pro Git ikki shaklni ko'rsatadi:

```bash
$ git branch sc/ruby_client master          # faqat yaratish
$ git checkout -b sc/ruby_client master     # yaratish va o'tish (eski yo'l)
```

Hozirgi tavsiya — `switch` ([21-bob](21-branch-va-merge.md)): `git switch -c <nom> <asos>`. Asos sifatida `main`ni aniq yozing — hozir qaysi branch'da turganingizdan qat'i nazar, topic toza `main`dan boshlanadi:

```bash
$ git switch -c jt/bol main
Switched to a new branch 'jt/bol'
```

Endi Javohir yuborgan ishni shu branch'ga qo'shamiz. U qaysi yo'l bilan kelganiga qarab buyruq har xil.

## Kod: `git diff` bilan kelgan patch — `git apply`

Javohir ishini commit qilmay, shunchaki `git diff > bol-qoshish.patch` qilib yubordi. Bunday patch'da **faqat o'zgarish** bor — muallif, sana, commit xabari yo'q:

```bash
$ cat ../bol-qoshish.patch
diff --git a/README.md b/README.md
index e748b59..378da6e 100644
--- a/README.md
+++ b/README.md
@@ -1,3 +1,3 @@
 # Hisob
 
-Oddiy hisob-kitob kutubxonasi.
+Oddiy hisob-kitob kutubxonasi (Python 3.10+).
diff --git a/hisob.py b/hisob.py
index 5701dc8..be27e5b 100644
--- a/hisob.py
+++ b/hisob.py
@@ -8,3 +8,7 @@ def ayir(a, b):
 
 def kopaytir(a, b):
     return a * b
+
+
+def bol(a, b):
+    return a / b
```

Qo'llashdan oldin ikki savol: "nimani o'zgartiradi?" va "toza qo'llanadimi?":

```bash
$ git apply --stat ../bol-qoshish.patch
 README.md |    2 +-
 hisob.py  |    4 ++++
 2 files changed, 5 insertions(+), 1 deletion(-)
$ git apply --check ../bol-qoshish.patch
$ echo $?
0
```

- `--stat` — patch'ni **qo'llamaydi**, faqat diffstat (qaysi fayllarda nechta qator) chiqaradi. Ma'lumotnoma: "Turns off apply".
- `--check` — ham qo'llamaydi, faqat patch joriy working tree'ga (va `--index` bilan index'ga ham) mos kelishini tekshiradi. **Chiqish bo'lmasa — patch toza qo'llanadi.** Muvaffaqiyatsiz bo'lsa nol bo'lmagan kod qaytaradi, shuning uchun skriptlarda ishlatish qulay.

Endi haqiqiy qo'llash:

```bash
$ git apply ../bol-qoshish.patch
$ git status --short
 M README.md
 M hisob.py
```

`git apply` **commit yaratmaydi** va standart bo'yicha index'ga ham tegmaydi — faqat working tree'dagi fayllarni o'zgartiradi. Stage va commit'ni o'zingiz qilasiz. Patch'da muallif yo'q, shuning uchun uni `--author` bilan qo'lda ko'rsatish odobdan:

```bash
$ git add -A
$ git commit -m "bol() funksiyasi va README aniqlik" --author="Javohir Tursunov <javohir@example.com>"
[jt/bol dc8a1c5] bol() funksiyasi va README aniqlik
 Author: Javohir Tursunov <javohir@example.com>
 2 files changed, 5 insertions(+), 1 deletion(-)
$ git log --pretty=fuller -1
commit dc8a1c562f38e43f0fcda7baec4cd0ff25aa7ea5
Author:     Javohir Tursunov <javohir@example.com>
AuthorDate: Wed Oct 7 09:30:00 2026 +0500
Commit:     Ali Valiyev <ali@example.com>
CommitDate: Wed Oct 7 09:30:00 2026 +0500

    bol() funksiyasi va README aniqlik
```

E'tibor bering: `AuthorDate` — Ali commit qilgan vaqt (09:30), Javohir ishni yozgan vaqt emas. Bu ma'lumot patch'da yo'q edi va qayta tiklab bo'lmaydi. Commit xabarini ham Ali o'zi o'ylab topdi. Shu sababli Pro Git aytadi: iloji bo'lsa hissa qo'shuvchilardan `diff` emas, `format-patch` so'rang; `git apply` faqat eski (legacy) patch'lar uchun kerak bo'lishi kerak.

### Nega `patch -p1` emas, `git apply`

Pro Git `git apply`ni GNU `patch -p1` bilan solishtiradi. Natija deyarli bir xil, lekin `git apply`:

| Xususiyat | `patch` | `git apply` |
| --- | --- | --- |
| Noaniq (fuzzy) moslash | Kontekst biroz farq qilsa ham qo'llashga urinadi | Ancha "shubhali" — kontekst aniq mos kelishi kerak (faqat joy siljishi mumkin) |
| Fayl qo'shish, o'chirish, nomini o'zgartirish | `git diff` kengaytirilgan sarlavhalarini tushunmaydi | Tushunadi (`new file mode`, `rename from/to`, rejim o'zgarishi) |
| Bir qismi qo'llanmasa | Qo'llangan qismlar qoladi — working tree "g'alati holatda" | **Hammasi yoki hech narsa**: birorta bo'lak mos kelmasa, hech qaysi fayl o'zgarmaydi |
| Commit | Yo'q | Yo'q (bu `git am` ishi) |

`git apply` Git repo'sidan tashqarida ham ishlaydi — "yaxshiroq `patch`" sifatida. Ma'lumotnomaga ko'ra, bunday holatda ham u ish papkasidan tashqaridagi yo'llarga tegadigan patch'ni rad etadi (`--unsafe-paths` bu tekshiruvni o'chiradi).

### Patch qo'llanmasa: "hammasi yoki hech narsa"

Patch eskirganini ko'rish uchun sinov branch'ida `README.md`ning o'sha qatorini o'zgartiramiz (`README: litsenziya` commit'i) va xuddi shu patch'ni qayta qo'llaymiz:

```bash
$ git switch -c sinov main
Switched to a new branch 'sinov'
$ # ... README.md: "Oddiy hisob-kitob kutubxonasi. Litsenziya: MIT." — commit
$ git apply --check ../bol-qoshish.patch
error: patch failed: README.md:1
error: README.md: patch does not apply
$ echo $?
1
$ git apply ../bol-qoshish.patch
error: patch failed: README.md:1
error: README.md: patch does not apply
$ git status --short
$
```

`hisob.py` qismi bemalol qo'llanishi mumkin edi, lekin `git apply` **uni ham qo'llamadi** — working tree toza. Bu atomarlik (atomicity): yarim qo'llangan patch'ni qo'lda ajratib o'tirmaysiz.

Agar baribir qo'llanadigan qismini olmoqchi bo'lsangiz — `--reject`. U mos kelgan bo'laklarni qo'llaydi, mos kelmaganlarini `<fayl>.rej` ga yozadi (xuddi `patch` kabi):

```bash
$ git apply --reject ../bol-qoshish.patch
Checking patch README.md...
error: while searching for:
# Hisob

Oddiy hisob-kitob kutubxonasi.

error: patch failed: README.md:1
Checking patch hisob.py...
Applying patch README.md with 1 reject...
Rejected hunk #1.
Applied patch hisob.py cleanly.
$ git status --short
 M hisob.py
?? README.md.rej
$ cat README.md.rej
diff a/README.md b/README.md	(rejected hunks)
@@ -1,3 +1,3 @@
 # Hisob
 
-Oddiy hisob-kitob kutubxonasi.
+Oddiy hisob-kitob kutubxonasi (Python 3.10+).
```

Endi `.rej` faylni o'qib, o'zgarishni qo'lda kiritasiz. Yaxshiroq yo'l — **uch tomonlama merge** (`-3`/`--3way`). Patch'dagi `index e748b59..378da6e` qatori **asl blob hash'ini** saqlaydi ([14-bob](14-obyektlar-blob.md)). Agar shu blob sizning repo'ngizda bo'lsa, Git patch qaysi faylga yozilganini aniq tiklaydi va oddiy merge'dagidek konflikt belgilarini qo'yadi:

```bash
$ git restore hisob.py && rm README.md.rej
$ git apply -3 ../bol-qoshish.patch
Applied patch to 'README.md' with conflicts.
Applied patch to 'hisob.py' cleanly.
U README.md
$ git status --short
UU README.md
M  hisob.py
$ cat README.md
# Hisob

<<<<<<< ours
Oddiy hisob-kitob kutubxonasi. Litsenziya: MIT.
=======
Oddiy hisob-kitob kutubxonasi (Python 3.10+).
>>>>>>> theirs
```

E'tibor bering: `-3` index'ga ham yozdi (`M ` birinchi ustunda — staged; ma'lumotnoma: `--3way` `--index`ni nazarda tutadi). Konfliktni hal qilish — [22-bobdagidek](22-konfliktlar.md). Sinovni tugatamiz:

```bash
$ git reset -q --hard
$ git switch main
$ git branch -D sinov
Deleted branch sinov (was 5859df8).
```

### `git apply` ning muhim opsiyalari

| Opsiya | Nima qiladi |
| --- | --- |
| `--stat`, `--numstat`, `--summary` | Qo'llamaydi; diffstat, mashina uchun sonlar, yoki yaratilgan/o'chirilgan/nomi o'zgargan fayllar ro'yxati |
| `--check` | Qo'llamaydi; mos kelishini tekshiradi, xato bo'lsa nol bo'lmagan kod |
| `--apply` | Yuqoridagilardan keyin berilsa — ma'lumotni chiqarib, **qo'llaydi** ham |
| `--index` | Working tree **va** index'ga qo'llaydi; ikkalasidagi fayl bir xil bo'lishi shart |
| `--cached` | Faqat index'ga, working tree'ga tegmaydi |
| `-3`, `--3way` | Blob hash'lari bor bo'lsa uch tomonlama merge, konflikt belgilari bilan; `--reject` bilan birga ishlamaydi |
| `--reject` | Mos kelgan bo'laklarni qo'llaydi, qolganini `*.rej` ga yozadi |
| `-R`, `--reverse` | Patch'ni teskari qo'llaydi (o'zgarishni olib tashlaydi) |
| `-p<n>` | Yo'l boshidan `n` ta komponentni olib tashlaydi (standart `1`: `a/hisob.py` → `hisob.py`) |
| `--directory=<ildiz>` | Hamma yo'llar oldiga papka qo'shadi (patch boshqa repo'dan, endi u quyi papkada) |
| `--exclude=`, `--include=` | Yo'l andozasi bo'yicha fayllarni chiqarib tashlash/tanlash |
| `--whitespace=<amal>` | Yangi qatorlardagi bo'sh joy xatolari: `nowarn`, `warn` (standart), `fix`, `error`, `error-all` ([45-bob](45-config-chuqur.md)) |
| `--recount` | Qo'lda tahrirlangan patch'da bo'lak sarlavhasidagi qator sonlariga ishonmaydi |

## Kod: `format-patch` patch'i — `git am`

Javohir ikkinchi ishini to'g'ri tayyorladi — topic branch, ikki commit va `format-patch` ([33-bob](33-hissa-qoshish.md)):

```bash
$ git format-patch -M origin/main
0001-daraja-funksiyasi.patch
0002-Test-daraja.patch
$ head -4 0001-daraja-funksiyasi.patch
From efcf462cb8540e5b4bdc4113441fd4e7c2554088 Mon Sep 17 00:00:00 2001
From: Javohir Tursunov <javohir@example.com>
Date: Wed, 7 Oct 2026 10:00:00 +0500
Subject: [PATCH 1/2] daraja() funksiyasi
```

Bunday faylni qo'llaydigan buyruq — `git am`. Nomi — "**a**pply a series of patches from a **m**ailbox" (pochta qutisidagi patch seriyasini qo'llash). Ma'lumotnoma uni `format-patch`ning teskarisi deb ataydi: xatni commit xabari, muallif ma'lumoti va patch'ga ajratadi, patch'ni qo'llaydi va **commit yaratadi**.

Bu orada Ali'ning `main`i ham oldinga ketdi — Dildora'ning ilgari yuborgan test patch'i va Ali'ning o'z izohi:

```bash
$ git log --oneline main
e06df87 ayir(): izoh qo'shildi
6787a92 Test: ayir()
ddadeeb Loyiha boshlandi
```

Javohir'ning seriyasi uchun yangi topic:

```bash
$ git switch -c jt/daraja main
Switched to a new branch 'jt/daraja'
$ git am ../javohir/0001-daraja-funksiyasi.patch
Applying: daraja() funksiyasi
$ git am ../javohir/0002-Test-daraja.patch
Applying: Test: daraja()
$ git log --pretty=fuller -2
commit 588e8bed6912d2aa0f340c8a56a9cc293a292469
Author:     Javohir Tursunov <javohir@example.com>
AuthorDate: Wed Oct 7 10:05:00 2026 +0500
Commit:     Ali Valiyev <ali@example.com>
CommitDate: Wed Oct 7 10:30:00 2026 +0500

    Test: daraja()

commit 7d4a30abe909dbc6d47b6b660b46c6d1fa51e2bb
Author:     Javohir Tursunov <javohir@example.com>
AuthorDate: Wed Oct 7 10:00:00 2026 +0500
Commit:     Ali Valiyev <ali@example.com>
CommitDate: Wed Oct 7 10:30:00 2026 +0500

    daraja() funksiyasi
```

Endi `AuthorDate` — Javohir ishni haqiqatan yozgan vaqt (10:00 va 10:05). `git am` xatning qaysi qismidan nimani oladi (ma'lumotnomaning DISCUSSION bo'limi):

| Commit maydoni | Xatdagi manba |
| --- | --- |
| Muallif ismi va email'i | `From:` sarlavhasi |
| Muallik sanasi | `Date:` sarlavhasi |
| Sarlavha (birinchi qator) | `Subject:` — boshidagi `[PATCH ...]` prefiksi olib tashlanadi |
| Xabar tanasi | Bo'sh qatordan patch boshlanishigacha (`---` qatori, [33-bob](33-hissa-qoshish.md)) |
| Commit qiluvchi va uning sanasi | **Siz** va hozirgi vaqt |

Pro Git xulosasi: `Commit` maydoni — patch'ni **qo'llagan** odam va vaqt, `Author` — patch'ni **yaratgan** odam va vaqt ([16-bob](16-commit-obyekti.md)). Hash'lar ham Javohir'nikidan farq qiladi (`efcf462` → `7d4a30a`): ota commit, commit qiluvchi va sana boshqa.

> **Xat tanasidagi sarlavhalar.** Ma'lumotnomaga ko'ra, xat tanasi `From:`, `Date:` yoki `Subject:` qatorlari bilan boshlansa, ular xat sarlavhasidagi qiymatlarni bosib ketadi. Kimdir boshqa odamning patch'ini o'z pochtasidan yuborganda shu usul ishlatiladi — muallif to'g'ri qoladi.

### mbox va interaktiv rejim

Texnik jihatdan `git am` **mbox** faylini o'qiydi — bir yoki bir nechta xat ketma-ket yozilgan oddiy matn fayli. Har xat `From <hash> Mon Sep 17 00:00:00 2001` qatori bilan boshlanadi; `format-patch` chiqishi aynan to'g'ri mbox. Pochta dasturingiz butun seriyani bitta mbox'ga saqlasa, `git am` ularni ketma-ket qo'llaydi:

```bash
$ cat ../javohir/000*.patch > ../daraja.mbox
$ grep '^From [0-9a-f]' ../daraja.mbox
From efcf462cb8540e5b4bdc4113441fd4e7c2554088 Mon Sep 17 00:00:00 2001
From d3cad23f488015c4e73a5c4e56dbbab913d9dcb8 Mon Sep 17 00:00:00 2001
```

Argument berilmasa `git am` standart kirishdan o'qiydi (`git am < seriya.mbox`), papka berilsa — uni Maildir deb hisoblaydi. Ticket tizimiga yuklangan patch'ni esa shunchaki diskka saqlab, fayl nomini berasiz.

Ko'p patch'li mbox'da `-i` (`--interactive`) har patch oldidan to'xtab so'raydi. Sinov branch'ida birinchisiga `y`, ikkinchisiga `n` deb javob beramiz:

```bash
$ git switch -c sinov main
Switched to a new branch 'sinov'
$ git am -i ../daraja.mbox
Commit Body is:
--------------------------
daraja() funksiyasi
--------------------------
Apply? [y]es/[n]o/[e]dit/[v]iew patch/[a]ccept all: Applying: daraja() funksiyasi
Commit Body is:
--------------------------
Test: daraja()
--------------------------
Apply? [y]es/[n]o/[e]dit/[v]iew patch/[a]ccept all:
$ git log --oneline -2
7d4a30a daraja() funksiyasi
e06df87 ayir(): izoh qo'shildi
$ git switch main && git branch -D sinov
```

(`y` va `n` ekranda ko'rinmaydi — ular klaviaturadan kiritilgan.) `v` patch'ni ko'rsatadi, `e` xabarni tahrirlashga ochadi, `a` qolganlarini so'ramasdan qabul qiladi. Pro Git: ko'p patch saqlangan bo'lsa qulay — esingizda bo'lmasa avval ko'rasiz, allaqachon qo'llagan bo'lsangiz o'tkazib yuborasiz. Diqqat: hash yana `7d4a30a` — bir xil ota, bir xil muallif, bir xil vaqt, demak bir xil commit.

### Patch qo'llanmaganda: `--skip`, `--abort`, `--continue`

Endi qiyin holat. Dildora o'z klonini ancha vaqt yangilamadi va `v1.0` ustida ikki commit'li seriya yubordi. Birinchisi — Ali ilgari qo'llagan `Test: ayir()` ning o'zi (u seriyani "to'liq" qayta yubordi), ikkinchisi `ayir()` qatorini o'zgartiradi — Ali esa xuddi shu joyga izoh qo'shgan:

```bash
$ git log --oneline origin/main..main            # dildora/ da
555306e ayir(): suzuvchi nuqta xatosini yaxlitlash
5fd5db4 Test: ayir()
$ git format-patch -o ../xat/ origin/main
../xat/0001-Test-ayir.patch
../xat/0002-ayir-suzuvchi-nuqta-xatosini-yaxlitlash.patch
```

Ali qo'llashga urinadi:

```bash
$ git switch -c dq/ayir main
Switched to a new branch 'dq/ayir'
$ git am ../xat/*.patch
Applying: Test: ayir()
error: patch failed: tests/test_hisob.py:1
error: tests/test_hisob.py: patch does not apply
Patch failed at 0001 Test: ayir()
hint: Use 'git am --show-current-patch=diff' to see the failed patch
hint: When you have resolved this problem, run "git am --continue".
hint: If you prefer to skip this patch, run "git am --skip" instead.
hint: To restore the original branch and stop patching, run "git am --abort".
hint: Disable this message with "git config set advice.mergeConflict false"
$ git status
On branch dq/ayir
You are in the middle of an am session.
  (fix conflicts and then run "git am --continue")
  (use "git am --skip" to skip this patch)
  (use "git am --abort" to restore the original branch)

nothing to commit, working tree clean
```

`git am` **seriyaning o'rtasida to'xtadi** va "am sessiyasi" ochiq qoldi. Uch yo'l bor (ma'lumotnoma):

| Buyruq | Qachon | Nima qiladi |
| --- | --- | --- |
| `git am --continue` (`-r`, `--resolved`) | Patch'ni qo'lda qo'llab, natijani index'ga qo'shgandan keyin | Xatdagi muallif va xabar + **joriy index** bilan commit yaratadi, keyingi patch'ga o'tadi |
| `git am --skip` | Bu patch kerak emas (masalan, allaqachon qo'llangan) | Joriy patch'ni tashlab, keyingisiga o'tadi |
| `git am --abort` | Hammasini bekor qilish | Asl branch'ni va am tegib o'tgan fayllarni am'dan oldingi holatga qaytaradi |
| `git am --quit` | To'xtatish, lekin natijani saqlash | Sessiyani yopadi, `HEAD` va index'ga tegmaydi |
| `git am --retry` | Xuddi shu patch'ni boshqa opsiya bilan qayta urinish | Masalan, `git am --retry -3` |

Pro Git `git am --resolved` deb yozadi — bu hozir ham ishlaydigan sinonim, lekin v2.56.0 xabarlari va ma'lumotnomasi asosiy nom sifatida **`--continue`**ni ko'rsatadi (rebase, cherry-pick, merge bilan bir xil so'z).

Avval nima qo'llanmaganini ko'ramiz:

```bash
$ git am --show-current-patch=diff
---
 tests/test_hisob.py | 1 +
 1 file changed, 1 insertion(+)

diff --git a/tests/test_hisob.py b/tests/test_hisob.py
index 23f6ed2..baa8216 100644
--- a/tests/test_hisob.py
+++ b/tests/test_hisob.py
@@ -1 +1,2 @@
 assert qosh(2, 2) == 4
+assert ayir(5, 3) == 2
-- 
2.56.0
```

Bu qator `main`da allaqachon bor — demak patch kerak emas, o'tkazib yuboramiz. Lekin ikkinchisi ham qo'llanmaydi:

```bash
$ git am --skip
Applying: ayir(): suzuvchi nuqta xatosini yaxlitlash
error: patch failed: hisob.py:3
error: hisob.py: patch does not apply
Patch failed at 0002 ayir(): suzuvchi nuqta xatosini yaxlitlash
hint: ...
```

Oddiy `git am` konflikt belgilarini **qo'ymaydi** — u `git apply` kabi "hammasi yoki hech narsa" ishlaydi, working tree o'zgarmaydi. Qo'lda tuzatish noqulay, shuning uchun sessiyani bekor qilib, `-3` bilan qaytadan boshlaymiz:

```bash
$ git am --abort
$ git log --oneline -1
e06df87 ayir(): izoh qo'shildi
$ git status --short
$
```

`--abort` branch'ni am boshlanishidan oldingi holatga qaytardi. Ma'lumotnoma qo'shadi: patch'lar qo'llanishidan oldin `ORIG_HEAD` branch uchiga o'rnatiladi — `am`ni noto'g'ri branch'da ishga tushirgan bo'lsangiz yoki bir nechta commit muvaffaqiyatli qo'llanib, keyin xato chiqsa, `git reset --hard ORIG_HEAD` bilan ham qaytish mumkin ([39-bob](39-reset-sirlari.md); `--hard` — saqlanmagan o'zgarishlarni o'chiradi). Sessiya ochiq turganda `git am` yangi mbox'ni qabul qilmaydi — avval `--abort` (yoki `--continue`/`--skip` bilan tugatish).

### `-3`: uch tomonlama merge bilan qo'llash

`-3` (`--3way`) — patch toza qo'llanmasa, patch'dagi blob hash'lari ([33-bob](33-hissa-qoshish.md)dagi `index` qatori) bo'yicha **asos daraxtni tiklaydi** va oddiy uch tomonlama merge qiladi:

```bash
$ git am -3 ../xat/*.patch
Applying: Test: ayir()
Using index info to reconstruct a base tree...
M	tests/test_hisob.py
Falling back to patching base and 3-way merge...
No changes -- Patch already applied.
Applying: ayir(): suzuvchi nuqta xatosini yaxlitlash
Using index info to reconstruct a base tree...
M	hisob.py
Falling back to patching base and 3-way merge...
Auto-merging hisob.py
CONFLICT (content): Merge conflict in hisob.py
error: Failed to merge in the changes.
Patch failed at 0002 ayir(): suzuvchi nuqta xatosini yaxlitlash
hint: Use 'git am --show-current-patch=diff' to see the failed patch
hint: When you have resolved this problem, run "git am --continue".
hint: If you prefer to skip this patch, run "git am --skip" instead.
hint: To restore the original branch and stop patching, run "git am --abort".
hint: Disable this message with "git config set advice.mergeConflict false"
```

Ikki xil natija:

1. **Birinchi patch** — `-3`siz konflikt edi, endi Git o'zi aniqladi: "No changes -- Patch already applied." — o'zgarish allaqachon bor, bo'sh commit yaratilmadi. Pro Git'dagi misol aynan shu holat.
2. **Ikkinchi patch** — haqiqiy konflikt, lekin endi fayl ichida oddiy merge belgilari bor:

```bash
$ git status --short
UU hisob.py
$ cat hisob.py
def qosh(a, b):
    return a + b


def ayir(a, b):
<<<<<<< HEAD
    """a dan b ni ayiradi."""
    return a - b
=======
    return round(a - b, 10)
>>>>>>> ayir(): suzuvchi nuqta xatosini yaxlitlash


def kopaytir(a, b):
    return a * b
```

Ikkala tomonni birlashtiramiz (izoh qolsin, yaxlitlash ham kirsin), stage qilamiz va davom ettiramiz:

```bash
$ # ... hisob.py tahrirlandi: izoh + "return round(a - b, 10)"
$ git add hisob.py
$ git am --continue
Applying: ayir(): suzuvchi nuqta xatosini yaxlitlash
$ git log --oneline main..dq/ayir
a5d974b ayir(): suzuvchi nuqta xatosini yaxlitlash
$ git log --format='%h %an | %cn' -1
a5d974b Dildora Qosimova | Ali Valiyev
```

Konfliktni maintainer hal qilgan bo'lsa ham, muallif Dildora bo'lib qoldi.

**Nega `-3` standart emas?** Pro Git sababi: patch qaysi commit (aniqrog'i, qaysi blob'lar) asosida yaratilgan bo'lsa, o'sha obyektlar sizning repo'ngizda bo'lishi kerak. Patch ommaviy commit asosida yaratilgan bo'lsa — `-3` ancha aqlli; hissa qo'shuvchi o'zining hech qayerga chiqmagan commit'i ustida ishlagan bo'lsa — blob'lar topilmaydi va `-3` yordam bermaydi. Doim yoqib qo'ymoqchi bo'lsangiz — `am.threeWay` sozlamasi (standart `false`), bitta chaqiruvda o'chirish — `--no-3way`.

> **`rerere` bilan.** Ma'lumotnomaga ko'ra `git am` ham `--rerere-autoupdate` opsiyasini qabul qiladi. `rerere` yoqilgan bo'lsa ([26-bob](26-murakkab-merge.md)), `-3` dagi konflikt yechimi ham yozib olinadi va xuddi shu konflikt keyingi safar (masalan, Dildora v2 seriyani yuborganda) avtomatik hal qilinadi.

### `git am` ning muhim opsiyalari

| Opsiya | Nima qiladi |
| --- | --- |
| `-3`, `--3way` | Toza qo'llanmasa uch tomonlama merge (`am.threeWay`) |
| `-s`, `--signoff` | Xabar oxiriga **sizning** `Signed-off-by` qatoringizni qo'shadi ([33-bob](33-hissa-qoshish.md)dagi DCO) |
| `-i`, `--interactive` | Har patch oldidan so'raydi |
| `-k`, `--keep` | `Subject:` dagi `[PATCH ...]` dan boshqa narsalarni ham kesmaydi (`git mailinfo -k`) |
| `-c`, `--scissors` | Xat tanasida `-- >8 --` "qaychi" qatorigacha bo'lgan hammasini tashlaydi (`mailinfo.scissors`) |
| `-m`, `--message-id` | Xabarga `Message-ID` qatorini qo'shadi — keyin muhokama xatini topish uchun (`am.messageId`) |
| `--ignore-date` | Muallik sanasi sifatida xatdagi emas, hozirgi vaqt |
| `--committer-date-is-author-date` | Commit qiluvchi sanasini muallik sanasiga tenglaydi — ma'lumotnoma ogohlantiradi: tarix bo'ylab yurish commit sanalari kamaymasligiga tayanadi, kerak bo'lmasa ishlatmang |
| `--whitespace=`, `-p<n>`, `-C<n>`, `--directory=`, `--exclude=`, `--include=`, `--reject` | `git apply`ga uzatiladi (yuqoridagi jadval) |
| `-n`, `--no-verify` | `applypatch-msg` va `pre-applypatch` hook'larini ishga tushirmaydi (`post-applypatch` doim ishlaydi, [47-bob](47-hooklar.md)) |
| `-S[<kalit>]` | Yaratilgan commit'larni imzolaydi ([44-bob](44-imzolash.md)) |
| `--empty=(stop\|drop\|keep)` | Patch'siz xat (masalan, cover letter): standart `stop`, `drop` — tashlab ketish, `keep` — bo'sh commit |
| `--show-current-patch[=diff\|raw]` | To'xtagan patch'ni ko'rsatadi (standart `raw` — butun xat) |

## Kod: remote branch'ni olish

Sevara boshqacha ishlaydi: uning **o'z ommaviy repo'si** bor (`sevara.git` — fork), u yerga `foiz` branch'ini push qildi va Ali'ga xat yozdi: "`foiz` branch'imda yangi funksiya bor". Pro Git: bunday holatda uni remote sifatida qo'shib, branch'ni lokal olasiz.

Bu orada Ali `jt/bol`ni `main`ga merge qilib bo'lgan (merge haqida pastda):

```bash
$ git switch main
$ git merge --no-ff --no-edit jt/bol
Auto-merging hisob.py
Merge made by the 'ort' strategy.
 README.md | 2 +-
 hisob.py  | 4 ++++
 2 files changed, 5 insertions(+), 1 deletion(-)
```

Sevara'ning branch'i:

```bash
$ git remote add sevara ../sevara.git
$ git fetch sevara
From ../sevara
 * [new branch]      foiz       -> sevara/foiz
 * [new branch]      main       -> sevara/main
$ git switch -c sn/foiz sevara/foiz
Switched to a new branch 'sn/foiz'
branch 'sn/foiz' set up to track 'sevara/foiz'.
```

Pro Git'dagi `git checkout -b rubyclient jessica/ruby-client` ning hozirgi shakli — `git switch -c`. Lokal branch avtomatik `sevara/foiz`ni kuzatadi ([28-bob](28-remote-branchlar.md)). Keyinroq Sevara yana yangi branch haqida yozsa, remote allaqachon sozlangan — darhol `fetch` va `switch`.

**Remote yoki email — qaysi biri?** Pro Git mezonlari:

| | Remote qo'shish | Email'dagi patch |
| --- | --- | --- |
| Kim bilan | Doimiy hamkor | Kamdan-kam, bir-ikki patch yuboradigan odam |
| Hissa qo'shuvchiga talab | O'z ommaviy repo'si (server, hosting) | Faqat pochta |
| Maintainer uchun | Yuzlab remote saqlash noqulay | Remote qo'shib-o'chirish shart emas |
| Tarix | **Commit'lar asl holicha** — ish qaysi commit ustiga qurilgani aniq | Faqat diff va metama'lumot |
| Konfliktda | Haqiqiy uch tomonlama merge standart | `-3` kerak va asos commit sizda bo'lishiga umid qilasiz |

Bir martalik hamkor uchun remote saqlamasdan `git pull <URL> <branch>` qilish mumkin — URL ref sifatida yozilmaydi, faqat `FETCH_HEAD` ga tushadi. Buni [32-bobda](32-taqsimlangan-workflowlar.md) ko'rdik. (Pro Git chiqishida `Merge made by the 'recursive' strategy.` — v2.56.0 da standart strategiya `ort`, [26-bob](26-murakkab-merge.md).) Avval ko'rib chiqmoqchi bo'lsangiz — `pull` emas, `git fetch <URL> <branch>` va keyin `FETCH_HEAD` bilan quyidagi buyruqlar.

## Kod: nima kiritilmoqda — `log main..topic` va `diff main...topic`

Topic branch tayyor. Merge qilishdan oldin savol: **aynan nima kiradi?** Holat:

```text
            f1c51d9---b4df5dd                ← sn/foiz (Sevara: foiz(), README)
           /
  ddadeeb---6787a92---e06df87---da81e98      ← main
           \                   /
            dc8a1c5------------              (jt/bol, merge qilingan)
```

`ddadeeb` — merge base: `sn/foiz` va `main`ning eng yaqin umumiy ajdodi.

### Commit'lar: `--not` va `..`

`main`da yo'q, topic'da bor commit'lar:

```bash
$ git log sn/foiz --not main
commit b4df5ddf7ed93e210ad2477ef16adc6bd8cb49fb
Author: Sevara Nazarova <sevara@example.com>
Date:   Wed Oct 7 11:12:00 2026 +0500

    README: funksiyalar ro'yxati

commit f1c51d917ffaf1fdf42f0135ea73cf08748b42db
Author: Sevara Nazarova <sevara@example.com>
Date:   Wed Oct 7 11:10:00 2026 +0500

    foiz() funksiyasi
$ git log --oneline main..sn/foiz
b4df5dd README: funksiyalar ro'yxati
f1c51d9 foiz() funksiyasi
```

`--not main` — undan keyingi ref'dan erishiladigan commit'larni chiqarib tashlaydi; `main..sn/foiz` — xuddi shu narsaning qisqa yozuvi ([19-bob](19-revision-tanlash.md)). Har commit'ning diff'ini ham ko'rish uchun `-p` qo'shing. Teskari yo'nalish — topic yaratilgandan beri `main`ga nima qo'shilgan:

```bash
$ git log --oneline sn/foiz..main
da81e98 Merge branch 'jt/bol'
e06df87 ayir(): izoh qo'shildi
6787a92 Test: ayir()
dc8a1c5 bol() funksiyasi va README aniqlik
```

### Diff: nega `git diff main` aldaydi

Birinchi xayolga keladigani — `git diff main` (topic'da turib):

```bash
$ git diff --stat main
 README.md           | 2 +-
 hisob.py            | 9 ++++-----
 tests/test_hisob.py | 1 -
 3 files changed, 5 insertions(+), 7 deletions(-)
$ git diff main -- README.md
diff --git a/README.md b/README.md
index 378da6e..1699063 100644
--- a/README.md
+++ b/README.md
@@ -1,3 +1,3 @@
 # Hisob
 
-Oddiy hisob-kitob kutubxonasi (Python 3.10+).
+Oddiy hisob-kitob kutubxonasi: qosh, ayir, kopaytir, foiz.
```

Natija chalg'ituvchi: go'yo Sevara `tests/test_hisob.py` dan qator o'chirgan va README'dagi "(Python 3.10+)" ni olib tashlagan. Aslida u bularni ko'rmagan ham — ular `main`ga **keyin** qo'shilgan. Sabab: `git diff A B` ikki **suratni** (snapshot) to'g'ridan-to'g'ri solishtiradi. `main` oldinga ketgan bo'lsa, `main`dagi har yangi narsa topic tomonidan "o'chirilgandek" ko'rinadi. `main` topic'ning to'g'ridan-to'g'ri ajdodi bo'lsa muammo yo'q; tarixlar ajralgan bo'lsa — aldaydi.

Sizga kerak bo'lgani — topic'ning uchi bilan uning `main` bilan **birinchi umumiy ajdodi** (merge base) o'rtasidagi farq. Uni qo'lda topish mumkin:

```bash
$ git merge-base sn/foiz main
ddadeeba52a70a480b091641a5585b3d5b3f6771
$ git diff --stat $(git merge-base sn/foiz main)
 README.md | 2 +-
 hisob.py  | 4 ++++
 2 files changed, 5 insertions(+), 1 deletion(-)
```

Qisqa yo'li — **uch nuqta**. `git diff` kontekstida `A...B` "`A` va `B`ning merge base'i bilan `B` o'rtasidagi diff" degani:

```bash
$ git diff --stat main...sn/foiz
 README.md | 2 +-
 hisob.py  | 4 ++++
 2 files changed, 5 insertions(+), 1 deletion(-)
$ git diff main...sn/foiz -- README.md
diff --git a/README.md b/README.md
index e748b59..1699063 100644
--- a/README.md
+++ b/README.md
@@ -1,3 +1,3 @@
 # Hisob
 
-Oddiy hisob-kitob kutubxonasi.
+Oddiy hisob-kitob kutubxonasi: qosh, ayir, kopaytir, foiz.
```

Endi faqat Sevara'ning haqiqiy ishi ko'rindi. Pro Git: "eslab qolishga arziydigan sintaksis".

> **`..` va `...` — `log` va `diff`da teskari ma'no.** `git log main..topic` — topic'dagi yangi commit'lar (bu bo'limda ishlatgan narsamiz); `git log main...topic` — **simmetrik farq**, ikkala tomondagi yangi commit'lar. `git diff main..topic` esa oddiy `git diff main topic` bilan bir xil (aldaydigan variant), `git diff main...topic` — merge base'dan. Batafsil — [19-bob](19-revision-tanlash.md) va [7-bob](07-diff.md).

Diff'da ko'rinib turibdi: Sevara'ning README qatori `jt/bol` kiritgan qator bilan to'qnashadi. Shuning uchun Ali undan faqat `foiz()` commit'ini oladi (pastda — `cherry-pick`).

## Kod: integratsiya — merge workflow'lari

Topic tayyor bo'lsa, uni uzoq yashovchi branch'ga qanday qo'shish kerak? Pro Git bir nechta andozani ko'rsatadi.

### Oddiy merge: `main`ga merge qiling, topic'ni o'chiring

Eng oddiy workflow: `main`da barqaror kod; topic tugagach (yoki tekshirilgach) uni `main`ga merge qilasiz, topic'ni o'chirasiz va takrorlaysiz. `jt/bol` shunday qo'shildi, endi `dq/ayir`:

```bash
$ git switch main
$ git merge --no-ff --no-edit dq/ayir
Auto-merging hisob.py
Merge made by the 'ort' strategy.
 hisob.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
$ git branch -d jt/bol dq/ayir
Deleted branch jt/bol (was dc8a1c5).
Deleted branch dq/ayir (was a5d974b).
```

`--no-ff` — fast-forward mumkin bo'lsa ham merge commit yaratadi ([21-bob](21-branch-va-merge.md)); tarixda "bu commit'lar bitta mavzu edi" degan chegara qoladi. `-d` faqat to'liq merge qilingan branch'ni o'chiradi.

Pro Git ogohlantiradi: bu eng oddiy workflow, lekin katta yoki barqarorligi muhim loyihada nima kiritilayotganiga juda ehtiyot bo'lish kerak bo'lsa — muammoli.

### Ikki bosqichli merge: `main` va `develop`

Muhimroq loyihada ikkita uzoq yashovchi branch: `main` faqat **juda barqaror reliz** chiqqanda yangilanadi, yangi kod esa avval `develop`ga merge qilinadi. Ikkalasi ham ommaviy repo'ga muntazam push qilinadi:

```text
Topic merge'dan oldin:          develop'ga merge:               Relizdan keyin (main fast-forward):

main     ●                      main     ●                      main              ●  ← v1.1
          \                               \                                      /
develop    ●---●                develop    ●---●-------●         develop  ●---●---●
                \                                \    /                     \    /
topic            ●---●          topic             ●---●                       ●---●
```

Klon qilgan odam barqaror versiya kerak bo'lsa `main`ni, eng yangisini sinamoqchi bo'lsa `develop`ni oladi. Kengaytmasi — yana bitta `integrate` branch: hamma ish avval unga merge qilinadi, testlardan o'tsa `develop`ga, u ham bir muddat o'zini ko'rsatsa — `main`ni fast-forward qilasiz. Bu "barqarorlik darajalari" g'oyasi [31-bobda](31-branch-workflowlari.md) batafsil.

### Katta loyiha: Git'ning o'z tizimi

Git loyihasida to'rtta uzoq yashovchi branch bor: `master`, `next`, `seen` (avval `pu` — proposed updates deb atalgan) va `maint` (texnik xizmat relizlari uchun). Kelgan ish maintainer repo'sida topic'larga yig'iladi; xavfsiz bo'lsa `next`ga merge qilinadi (hamma birga sinab ko'rsin), hali ish kerak bo'lsa — `seen`ga. To'liq barqaror bo'lganda topic `master`ga qayta merge qilinadi, `next` va `seen` vaqti-vaqti bilan `master`dan qayta quriladi. Natijada `master` deyarli doim oldinga yuradi, `next` ba'zan, `seen` esa tez-tez qayta quriladi. `master`ga kirgan topic repo'dan o'chiriladi; `maint` oxirgi relizdan ajratilgan va tuzatishlarni orqaga ko'chirish (backport) uchun.

Bu tizimni biz [31-bobda](31-branch-workflowlari.md) `gitworkflows` qoidalari bilan to'liq yurgizganmiz (lokal server, `next`ni qayta qurish, reliz). Pro Git ham tan oladi: bu workflow ixtisoslashgan; to'liq tushunish uchun Git maintainer qo'llanmasini o'qing (havola pastda).

## Kod: rebase va cherry-pick bilan integratsiya

Boshqa maintainer'lar tarixni asosan **chiziqli** saqlashni afzal ko'radi: begona ishni merge qilmasdan, `main` ustiga rebase yoki cherry-pick qiladi.

### Rebase + fast-forward

`jt/daraja` hali eski `main`dan ajralgan:

```bash
$ git log --oneline --graph main jt/daraja
*   0249304 Merge branch 'dq/ayir'
|\  
| * a5d974b ayir(): suzuvchi nuqta xatosini yaxlitlash
* |   da81e98 Merge branch 'jt/bol'
|\ \  
| |/  
|/|   
| * dc8a1c5 bol() funksiyasi va README aniqlik
| | * 588e8be Test: daraja()
| | * 7d4a30a daraja() funksiyasi
| |/  
|/|   
* | e06df87 ayir(): izoh qo'shildi
* | 6787a92 Test: ayir()
|/  
* ddadeeb Loyiha boshlandi
```

Topic'ni joriy `main` ustida qayta quramiz ([24-bob](24-rebase.md)) va `main`ni fast-forward qilamiz:

```bash
$ git rebase main jt/daraja
Successfully rebased and updated refs/heads/jt/daraja.
$ git switch main
$ git merge --ff-only jt/daraja
Updating 0249304..830402c
Fast-forward
 hisob.py             | 4 ++++
 tests/test_daraja.py | 1 +
 2 files changed, 5 insertions(+)
 create mode 100644 tests/test_daraja.py
$ git branch -d jt/daraja
Deleted branch jt/daraja (was 830402c).
```

`git rebase <asos> <branch>` — avval `<branch>`ga o'tadi, keyin rebase qiladi. `--ff-only` — faqat fast-forward; tarix ajralib qolgan bo'lsa merge commit yaratish o'rniga rad etadi, ya'ni "rebase qilishni unutdim" xatosini darhol ko'rsatadi. Natija — bitta to'g'ri chiziq, merge commit yo'q. Topic hech qayerga e'lon qilinmagan (faqat Ali'ning lokal branch'i), shuning uchun rebase xavfsiz.

### Cherry-pick: bitta commit'ni olish

**Cherry-pick** — "bitta commit uchun rebase": commit kiritgan o'zgarishni (patch'ni) olib, joriy branch'ga qayta qo'llaydi va yangi commit yaratadi. Pro Git ikki holatni aytadi: topic'da bir nechta commit bor, siz faqat bittasini olmoqchisiz; yoki topic'da bitta commit bor va rebase qilishdan ko'ra cherry-pick osonroq.

Sevara'ning ikki commit'idan faqat `foiz()` kerak:

```bash
$ git log --oneline main..sn/foiz
b4df5dd README: funksiyalar ro'yxati
f1c51d9 foiz() funksiyasi
$ git cherry-pick -x f1c51d9
Auto-merging hisob.py
[main 2aa0c95] foiz() funksiyasi
 Author: Sevara Nazarova <sevara@example.com>
 Date: Wed Oct 7 11:10:00 2026 +0500
 1 file changed, 4 insertions(+)
$ git log --pretty=fuller -1
commit 2aa0c957cca57b1edf745b94462a43daa37e1e15
Author:     Sevara Nazarova <sevara@example.com>
AuthorDate: Wed Oct 7 11:10:00 2026 +0500
Commit:     Ali Valiyev <ali@example.com>
CommitDate: Wed Oct 7 11:50:00 2026 +0500

    foiz() funksiyasi
    
    (cherry picked from commit f1c51d917ffaf1fdf42f0135ea73cf08748b42db)
```

O'zgarish o'sha, lekin **hash yangi** (`f1c51d9` → `2aa0c95`): ota commit boshqa, commit qiluvchi va uning sanasi boshqa. Pro Git chiqishidagi `Finished one cherry-pick.` / `[master]: created a0a41a9` — eski versiya formati; hozirgi Git oddiy commit xulosasini chiqaradi.

`-x` — xabar oxiriga `(cherry picked from commit ...)` qatorini yozadi. Ma'lumotnoma maslahati: ikki **ommaviy** branch o'rtasida (masalan, tuzatishni eski reliz `maint` branch'iga orqaga ko'chirishda) foydali; o'z shaxsiy branch'ingizdan cherry-pick qilsangiz — ishlatmang, chunki u hash hech kimga kerak emas. Bu yerda Sevara'ning commit'i ommaviy repo'da bor, shuning uchun qatorda ma'no bor. `-x` faqat konfliktsiz cherry-pick'da qo'shiladi.

Endi topic'ni o'chirib, kerak bo'lmagan commit'ni tashlab yuborish mumkin:

```bash
$ git branch -d sn/foiz
warning: deleting branch 'sn/foiz' that has been merged to
         'refs/remotes/sevara/foiz', but not yet merged to HEAD
Deleted branch sn/foiz (was b4df5dd).
```

Nozik joy: `-d` "to'liq merge qilinmagan branch'ni o'chirmaydi" deyiladi, lekin bu yerda o'chirdi. Sabab: `git branch -d` branch'ni **o'z upstream'iga** (`sevara/foiz`) merge qilingan bo'lsa ham "xavfsiz" deb hisoblaydi va faqat ogohlantiradi. `b4df5dd` yo'qolmadi — u `sevara/foiz` da bor. Upstream'i yo'q branch bo'lsa, `-d` rad etardi va `-D` kerak bo'lardi ([23-bob](23-branch-boshqaruvi.md)).

Cherry-pick ham konflikt berishi mumkin. Unda `git cherry-pick --continue`, `--skip`, `--abort` — xuddi `am` kabi. Bir nechta commit: `git cherry-pick A B` yoki diapazon `git cherry-pick main..topic`. Muhim opsiyalar: `-n` (`--no-commit`, faqat index va working tree'ga qo'llaydi; keyingi `git commit` muallifi — siz), `-m <ota-raqami>` (merge commit'ni cherry-pick qilish — qaysi ota "asosiy chiziq"), `-e` (xabarni tahrirlash), `-s` (Signed-off-by), `--ff` (mumkin bo'lsa fast-forward).

### Rerere

Ko'p merge va rebase qilsangiz yoki uzoq yashovchi topic yuritsangiz, Git'ning **`rerere`** ("reuse recorded resolution" — yozib olingan yechimni qayta ishlatish) imkoniyati yordam beradi. Yoqilgan bo'lsa, Git muvaffaqiyatli merge'lardagi konfliktning "oldingi" va "keyingi" ko'rinishini saqlaydi; xuddi shunday konflikt yana chiqsa, oldingi yechimni o'zi qo'llaydi:

```bash
$ git config --global rerere.enabled true
```

Maintainer uchun ayniqsa foydali: `seen`/`next` kabi integratsiya branch'larini qayta qurganda yoki bir topic'ni har safar yangi `main`ga rebase qilganda bir xil konfliktni qayta-qayta hal qilmaysiz. `git rerere status/diff/forget`, `.git/rr-cache` ichidagi preimage va postimage — [26-bobda](26-murakkab-merge.md) to'liq namoyish bilan.

## Kod: reliz tegi

Reliz chiqarishga qaror qildingiz. Keyinchalik shu relizni istalgan payt qayta yaratish uchun unga **teg** qo'yasiz ([12-bob](12-teglar-va-aliaslar.md)). Reliz uchun annotated teg — muallifi, sanasi va xabari bor alohida obyekt ([17-bob](17-reflar-va-head.md)):

```bash
$ git tag -a v1.1 -m "Hisob 1.1"
$ git describe main
v1.1
$ git push origin main v1.1
To ~/loyiha/server.git
   e06df87..28d973f  main -> main
 * [new tag]         v1.1 -> v1.1
```

(Tegdan oldingi oxirgi commit — `.gitattributes`, uni arxiv bo'limida ko'ramiz.) Maintainer odatda tegni **imzolaydi**: `git tag -s v1.1 -m "..."` — GPG (yoki SSH) kaliti bilan, shunda har kim teg haqiqatan sizniki ekanini tekshira oladi. Kalit yaratish, imzolash va `git tag -v` bilan tekshirish — [44-bobda](44-imzolash.md).

### Ochiq kalitni repo ichida tarqatish

Imzolasangiz, yangi muammo: tekshiruvchilar sizning **ochiq kalitingizni** qayerdan oladi? Git loyihasi maintainer'ining yechimi (Pro Git): ochiq kalitni repo'ga **blob** sifatida yozib, unga to'g'ridan-to'g'ri ishora qiladigan teg qo'yish.

Haqiqiy holatda kalit `gpg -a --export <ID>` bilan chiqariladi va to'g'ridan-to'g'ri `git hash-object -w --stdin` ga uzatiladi. Sinov muhitida GPG yo'q, shuning uchun mexanizmni o'rinbosar matnli fayl bilan ko'rsatamiz — Git uchun farqi yo'q, u har qanday baytlarni blob qiladi:

```bash
$ git hash-object -w --stdin < ../ali-kalit.asc        # haqiqatda: gpg -a --export F721C45A | git hash-object -w --stdin
6a5d03fc8c8c4d5ac52463af17539a8c1ff1e48a
$ git tag -a maintainer-pgp-pub -m "Ali Valiyevning ochiq kaliti" 6a5d03f
```

`hash-object -w` blob'ni `.git/objects`ga yozib, hash'ini qaytaradi ([14-bob](14-obyektlar-blob.md)). Teg esa commit'ga emas, shu blob'ga ishora qiladi:

```bash
$ git cat-file -t maintainer-pgp-pub
tag
$ git cat-file -t 'maintainer-pgp-pub^{}'
blob
$ git cat-file -p maintainer-pgp-pub
object 6a5d03fc8c8c4d5ac52463af17539a8c1ff1e48a
type blob
tag maintainer-pgp-pub
tagger Ali Valiyev <ali@example.com> 1791357000 +0500

Ali Valiyevning ochiq kaliti
$ git push origin maintainer-pgp-pub
To ~/loyiha/server.git
 * [new tag]         maintainer-pgp-pub -> maintainer-pgp-pub
```

Teg obyektidagi `type blob` — teg istalgan turdagi obyektga ishora qila oladi. Endi tekshiruvchi kalitni repo'dan oladi:

```bash
$ git show maintainer-pgp-pub
tag maintainer-pgp-pub
Tagger: Ali Valiyev <ali@example.com>
Date:   Wed Oct 7 12:10:00 2026 +0500

Ali Valiyevning ochiq kaliti
-----BEGIN PGP PUBLIC KEY BLOCK-----
(namuna: bu yerda gpg -a --export chiqishi bo-ladi)
-----END PGP PUBLIC KEY BLOCK-----
$ git cat-file blob maintainer-pgp-pub
-----BEGIN PGP PUBLIC KEY BLOCK-----
(namuna: bu yerda gpg -a --export chiqishi bo-ladi)
-----END PGP PUBLIC KEY BLOCK-----
```

Pro Git `git show maintainer-pgp-pub | gpg --import` ni ko'rsatadi. `git show` teg sarlavhasini ham chiqaradi; faqat blob mazmuni kerak bo'lsa — `git cat-file blob maintainer-pgp-pub | gpg --import` (cat-file tegni blob'gacha o'zi ochadi). Teg xabariga tekshirish bo'yicha ko'rsatma yozsangiz, `git show <teg>` foydalanuvchiga uni ham ko'rsatadi. Bunday teg `git describe` uchun yaramaydi: `fatal: maintainer-pgp-pub is neither a commit nor blob` (u teg obyektini nomlay olmaydi, faqat commit va blob'ni).

## Kod: build raqami — `git describe`

Git'da `v123` kabi **monoton o'suvchi** raqam yo'q — commit'larning nomi hash. Odam o'qiy oladigan nom kerak bo'lsa (build nomi, `--version` chiqishi), `git describe`: eng yaqin tegning nomi + shu tegdan keyingi commit'lar soni + `g` va qisqa hash ([12-bob](12-teglar-va-aliaslar.md)da asoslari). Relizdan keyin Ali yana ikki commit qildi:

```bash
$ git describe main
v1.1-2-g0a08e02
$ git show -s --oneline v1.1-2-g0a08e02
0a08e02 Test: bol()
```

Qismlar: `v1.1` — eng yaqin annotated teg; `2` — `git log v1.1..main` ko'rsatadigan commit'lar soni; `g` — "git" (ma'lumotnoma: dasturiy ta'minot versiyasi qaysi VCS bilan boshqarilishini ko'rsatish uchun); `0a08e02` — `main`ning qisqa hash'i. Shu nom bilan snapshot yoki build'ni odamlarga tushunarli qilib nomlaysiz; Git'ni manbadan yig'sangiz `git --version` ham shunday ko'rinadi. Teg aynan commit'ga qo'yilgan bo'lsa, faqat teg nomi chiqadi (yuqorida `v1.1`).

Nom `git show` va `git switch --detach` kabi buyruqlarda ishlaydi — Git uni oxiridagi qisqa hash bo'yicha topadi. Pro Git ogohlantiradi: shu sababli u **abadiy yaroqli emas**. Repo o'sib, shu prefiksli boshqa obyekt paydo bo'lsa, qisqa hash noaniq bo'lib qoladi — Linux yadrosi obyektlar yagonaligi uchun qisqa hash'ni 8 dan 10 belgiga oshirganda, eski `describe` nomlari yaroqsiz bo'lgan. Ma'lumotnomaga ko'ra standart uzunlik obyektlar soniga qarab o'sadi (kamida 7).

```bash
$ git describe --long v1.1
v1.1-0-g28d973f
$ git describe --abbrev=0 main
v1.1
$ git describe --abbrev=12 main
v1.1-2-g0a08e02998bc
$ echo x >> README.md && git describe --dirty
v1.1-2-g0a08e02-dirty
$ git describe --contains 906c1a1
v1.1~3
$ git describe --exact-match HEAD
fatal: no tag exactly matches '0a08e02998bc5b188ebfa4cd8cb15e2e3b2c20c5'
```

Standart bo'yicha `describe` **faqat annotated** teglarni hisobga oladi. Lightweight teg bilan:

```bash
$ git tag sinov-qurilma HEAD~1
$ git describe
v1.1-2-g0a08e02
$ git describe --tags
sinov-qurilma-1-g0a08e02
```

Repo'da faqat lightweight teg bo'lsa, Git o'zi maslahat beradi: `fatal: No annotated tags can describe '...'. However, there were unannotated tags: try --tags.` Teg umuman bo'lmasa — `--always` qisqa hash'ni zaxira sifatida chiqaradi.

| Opsiya | Ma'nosi |
| --- | --- |
| `--tags` | Lightweight teglar ham |
| `--all` | `refs/` dagi istalgan ref (branch, remote-tracking) |
| `--long` | Teg ustida bo'lsa ham `-0-g<hash>` shakli |
| `--abbrev=<n>` | Hash uzunligi; `0` — faqat teg nomi |
| `--dirty[=<belgi>]` | Working tree o'zgargan bo'lsa `-dirty` qo'shimchasi — build skriptlari uchun |
| `--contains` | Commit'dan **keyingi**, uni o'z ichiga olgan teg (`v1.1~3` — `v1.1`dan 3 qadam orqada) |
| `--exact-match` | Faqat aynan shu commit'dagi teg, aks holda xato |
| `--match`, `--exclude` | Teg nomi andozasi (`--match "v*"`) |
| `--first-parent` | Merge'larda faqat birinchi otani kuzatadi — merge qilingan branch'lardagi teglar hisobga olinmaydi |
| `--always` | Teg topilmasa qisqa hash |

## Kod: reliz arxivi — `git archive`

Git ishlatmaydigan foydalanuvchilar uchun so'nggi suratning **arxivi** kerak — `git archive`. Avval arxivga nima kirmasligini belgilaymiz: testlar va `.gitattributes`ning o'zi foydalanuvchiga kerak emas. Buning uchun `export-ignore` atributi ([46-bob](46-gitattributes.md)) — v1.1 dan oldingi oxirgi commit aynan shu edi:

```gitignore
tests/ export-ignore
.gitattributes export-ignore
```

Pro Git'dagi retsept — `describe` nomi bilan tar.gz:

```bash
$ git archive main --prefix='hisob/' | gzip > `git describe main`.tar.gz
$ ls *.tar.gz
v1.1-2-g0a08e02.tar.gz
$ tar tzf v1.1-2-g0a08e02.tar.gz
hisob/
hisob/README.md
hisob/hisob.py
```

- `main` — arxivlanadigan daraxt (commit, teg yoki tree).
- `--prefix='hisob/'` — har yo'l oldiga qo'shiladi: ochgan odam fayllarni joriy papkaga sochib yubormaydi, `hisob/` papkasini oladi. **Oxiridagi `/` shart** — usiz `hisobREADME.md` bo'lib qoladi.
- `tests/` va `.gitattributes` arxivda yo'q — `export-ignore`.
- Standart format — `tar`, chiqish — standart chiqish (shuning uchun `| gzip`).

Zip ham xuddi shunday, `--format=zip` bilan:

```bash
$ git archive main --prefix='hisob/' --format=zip > `git describe main`.zip
$ unzip -l v1.1-2-g0a08e02.zip
Archive:  v1.1-2-g0a08e02.zip
0a08e02998bc5b188ebfa4cd8cb15e2e3b2c20c5
  Length      Date    Time    Name
---------  ---------- -----   ----
        0  10-07-2026 12:35   hisob/
       55  10-07-2026 12:35   hisob/README.md
      339  10-07-2026 12:35   hisob/hisob.py
---------                     -------
      394                     3 files
```

`Archive:` dan keyingi qator — commit hash'i: ma'lumotnomaga ko'ra zip'da u **fayl izohi** sifatida saqlanadi. Tar'da esa global kengaytirilgan pax sarlavhasida, uni `git get-tar-commit-id` chiqarib oladi:

```bash
$ gzip -dc v1.1-2-g0a08e02.tar.gz | git get-tar-commit-id
0a08e02998bc5b188ebfa4cd8cb15e2e3b2c20c5
```

Shunday qilib, kimdir sizga arxivni qaytarib yuborsa, u qaysi commit'dan yasalganini bilasiz. Fayllar vaqti ham commit vaqti (12:35) — kompyuter soati emas, shuning uchun bir commit'dan ikki marta yasalgan arxiv bir xil bo'ladi.

Zamonaviy qulayliklar (v2.56.0 ma'lumotnomasi): `tar.gz`/`tgz` formatlari ichki gzip bilan, `-o` bilan format fayl kengaytmasidan aniqlanadi:

```bash
$ git archive --list
tar
tgz
tar.gz
zip
$ git archive --prefix=hisob-1.1/ -o hisob-1.1.tar.gz v1.1
$ file hisob-1.1.tar.gz
hisob-1.1.tar.gz: gzip compressed data, from Unix, original size modulo 2^32 10240
$ tar tzvf hisob-1.1.tar.gz
drwxrwxr-x  0 root   root        0 Oct  7 12:00 hisob-1.1/
-rw-rw-r--  0 root   root       55 Oct  7 12:00 hisob-1.1/README.md
-rw-rw-r--  0 root   root      273 Oct  7 12:00 hisob-1.1/hisob.py
```

Teg nomi bilan arxivlash — reliz uchun eng aniq yo'l: `v1.1` hech qachon siljimaydi. Egasi `root` va ruxsatlar `rw-rw-r--` — `git archive` tizim foydalanuvchisini yozmaydi, ruxsatlarni esa `tar.umask` (standart `0002`) bilan cheklaydi.

| Opsiya | Ma'nosi |
| --- | --- |
| `--format=tar\|zip\|tar.gz\|tgz` | Format; berilmasa va `-o` bo'lsa — kengaytmadan, aks holda `tar` |
| `--prefix=<papka>/` | Yo'llar oldiga qo'shimcha (oxirida `/`) |
| `-o <fayl>` | Standart chiqish o'rniga faylga |
| `<daraxt> [<yo'l>...]` | Faqat ko'rsatilgan yo'llar: `git archive -o docs.zip HEAD:docs/` |
| `--add-file=<fayl>` | Git kuzatmaydigan faylni (masalan, yig'ilgan `configure`) qo'shish |
| `--add-virtual-file=<yo'l>:<mazmun>` | Diskda yo'q faylni mazmuni bilan qo'shish |
| `--mtime=<vaqt>` | Fayllar vaqtini belgilash |
| `--worktree-attributes` | `.gitattributes`ni working tree'dan ham o'qish (arxivlanayotgan daraxtdagisidan tashqari) |
| `--remote=<repo>` | Arxivni remote'dan olish (server ruxsat bergan bo'lsa) |
| `-0`...`-9` | Siqish darajasi (zip uchun standart `-6`) |

Ikki nozik joy:

```bash
$ git archive --prefix=hisob/ --add-virtual-file=hisob/VERSIYA:"$(git describe v1.1)" v1.1 | tar tf -
hisob/
hisob/README.md
hisob/hisob.py
hisob/VERSIYA
$ git archive --format=tar v1.1^{tree} | tar tvf - | head -3
-rw-rw-r--  0 root   root       55 Oct  8 18:05 README.md
-rw-rw-r--  0 root   root      273 Oct  8 18:05 hisob.py
```

Birinchisi — build raqamini arxiv ichiga yozishning oddiy yo'li (`--add-virtual-file` yo'liga `--prefix` qo'shilmaydi, shuning uchun to'liq yo'l yozilgan). Ikkinchisi — commit emas, **tree** berilsa: ma'lumotnomaga ko'ra commit ID saqlanmaydi (pax sarlavhasi yo'q) va fayl vaqti **hozirgi vaqt** bo'ladi (bu yerda — sinov o'tkazilgan payt). Takrorlanadigan arxiv kerak bo'lsa, commit yoki teg bering yoki `--mtime` qo'ying.

## Kod: `shortlog` — reliz e'loni

Pochta ro'yxatiga "loyihada nima yangilik" degan xat yozish payti. Oxirgi relizdan beri qo'shilgan ishning tez changelog'i — `git shortlog`. U berilgan diapazondagi commit'larni **muallif bo'yicha** guruhlaydi:

```bash
$ git shortlog --no-merges main --not v1.0
Ali Valiyev (4):
      ayir(): izoh qo'shildi
      Arxivdan testlarni chiqarib tashlash
      bol(): nolga bo'lishda aniq xato
      Test: bol()

Dildora Qosimova (2):
      Test: ayir()
      ayir(): suzuvchi nuqta xatosini yaxlitlash

Javohir Tursunov (3):
      bol() funksiyasi va README aniqlik
      daraja() funksiyasi
      Test: daraja()

Sevara Nazarova (1):
      foiz() funksiyasi
```

`main --not v1.0` — `v1.0..main` bilan bir xil. `--no-merges` — `Merge branch 'jt/bol'` kabi commit'lar ro'yxatni ifloslantirmaydi. Hissa qo'shuvchilar muallif sifatida ko'rinadi — patch'larni `git am` va `cherry-pick` bilan qo'llaganda muallif saqlangani uchun. (Ma'lumotnoma: `shortlog` sarlavhalardan `[PATCH]` ni ham olib tashlaydi.) Faqat reliz tarkibi — `git shortlog --no-merges v1.0..v1.1`.

Statistik ko'rinishlar:

```bash
$ git shortlog -sn --no-merges v1.0..main
     4	Ali Valiyev
     3	Javohir Tursunov
     2	Dildora Qosimova
     1	Sevara Nazarova
$ git shortlog -sne v1.0..main
     6	Ali Valiyev <ali@example.com>
     3	Javohir Tursunov <javohir@example.com>
     2	Dildora Qosimova <dildora@example.com>
     1	Sevara Nazarova <sevara@example.com>
$ git shortlog -sn -c v1.0..main
    12	Ali Valiyev
```

Ikkinchisida `--no-merges` yo'q — Ali'ning ikki merge commit'i ham sanaldi (6). Uchinchisi (`-c` — commit qiluvchi bo'yicha) ko'rsatadi: **hamma 12 commit'ni Ali yozgan** — u maintainer, hamma narsani u qo'llagan. Muallif va commit qiluvchining farqi aynan shu bobning mohiyati.

```bash
$ git shortlog --no-merges --format='[%h] %s' v1.0..v1.1
Ali Valiyev (2):
      [e06df87] ayir(): izoh qo'shildi
      [28d973f] Arxivdan testlarni chiqarib tashlash

Dildora Qosimova (2):
      [6787a92] Test: ayir()
      [a5d974b] ayir(): suzuvchi nuqta xatosini yaxlitlash
...
```

| Opsiya | Ma'nosi |
| --- | --- |
| `-n`, `--numbered` | Alifbo o'rniga commit soni bo'yicha tartiblash |
| `-s`, `--summary` | Faqat sonlar |
| `-e`, `--email` | Email ham |
| `-c`, `--committer` | Commit qiluvchi bo'yicha (`--group=committer`) |
| `--group=trailer:<maydon>` | Trailer bo'yicha, masalan kim ko'proq review qilgan: `git shortlog -ns --group=trailer:reviewed-by` |
| `--format=<format>` | Sarlavha o'rniga `git log --format` qatori |
| `-w[<kenglik>,...]` | Qatorlarni o'rash |

Bir odam turli ism yoki email bilan commit qilgan bo'lsa, ro'yxatda ikki marta chiqadi — buni `.mailmap` fayli bilan birlashtirasiz (ma'lumotnoma: `gitmailmap`).

## Muhandislik nuqtai nazari: ishni qabul qilishning uch yo'li

| | `git apply` (`diff` patch) | `git am` (`format-patch`) | Remote branch |
| --- | --- | --- | --- |
| Muallif va sana | Yo'qoladi — qo'lda `--author` | Saqlanadi | Saqlanadi |
| Commit xabari | Maintainer yozadi | Hissa qo'shuvchiniki | Hissa qo'shuvchiniki |
| Commit hash | Yangi | Yangi (commit qiluvchi — siz) | Asl holicha (merge qilsangiz) |
| Merge commit'lar | — | O'tmaydi ([32-bob](32-taqsimlangan-workflowlar.md)) | O'tadi |
| Konfliktda | `-3` yoki `--reject` | `-3`, `--continue/--skip/--abort` | Oddiy uch tomonlama merge |
| Hissa qo'shuvchiga talab | Hech narsa | Git va pochta | Ommaviy repo |
| Qachon | Eski (legacy) patch'lar | Pochta ro'yxatli loyihalar, bir martalik hissa | Doimiy hamkorlar, katta ishlar |

Integratsiya usulini tanlash:

- **Merge** — tarix haqiqatni aytadi (ish qayerda va qachon ajralgani ko'rinadi), lekin grafik shoxlanadi. Hissa qo'shuvchining commit'lari aynan o'sha hash bilan qoladi — u o'z `main`ini oddiy `pull` bilan yangilaydi.
- **Rebase + fast-forward** — chiziqli tarix, lekin commit'lar yangi hash oladi. Hissa qo'shuvchi o'z branch'ini tashlab, sizning `main`ingizdan qayta boshlashi kerak ([33-bob](33-hissa-qoshish.md)dagi maslahat: topic'ni push qiling, `main`ni emas).
- **Cherry-pick** — bitta-ikkita commit kerak bo'lsa yoki tuzatishni eski reliz branch'iga ko'chirsangiz. Ko'p commit'li topic uchun rebase tozaroq.

Maintainer uchun umumiy qoidalar: har kelgan ish — **alohida topic branch**; merge'dan oldin doim `log main..topic` va `diff main...topic`; testlar topic'da o'tsin, keyin `main`ga; reliz — annotated (imkoni bo'lsa imzolangan) teg; arxiv va build nomi — tegdan.

## Muhandislik nuqtai nazari: ichkarida nima bo'ladi

| Amal | Git'da |
| --- | --- |
| `git apply` | Faqat working tree; `--index` bilan index ham; obyekt yaratmaydi (`-3`dan tashqari) |
| `git am` | Har patch: `git mailinfo` (xatni ajratish) → `git apply --index` → commit; muallif `From:`/`Date:`dan, commit qiluvchi — siz |
| am sessiyasi | `.git/rebase-apply/` papkasi: `0001`, `0002` (bo'lingan xatlar), `next`/`last` (qaysi patch), `author-script`, `msg`, `patch`, `threeway`... — `--abort` yoki tugaganda o'chiriladi |
| am boshlanishi | `ORIG_HEAD` = branch'ning eski uchi |
| `am -3` | `index <eski>..<yangi>` qatoridagi blob'lardan vaqtinchalik asos daraxt, keyin uch tomonlama merge |
| `cherry-pick` | Yangi commit (yangi hash, muallif saqlanadi); konfliktda `CHERRY_PICK_HEAD` |
| `git diff A...B` | `diff $(git merge-base A B) B` |
| Blob'ga teg | `hash-object -w` → `.git/objects/..` dagi blob; teg obyektida `type blob` |
| `git archive` | Tree'dan tar/zip; tar'da commit ID pax sarlavhasida, zip'da izohda; `export-ignore`/`export-subst` atributlari |

Masalan, `-3` konflikt bilan to'xtagan sessiyada:

```bash
$ ls .git/rebase-apply
0001
0002
abort-safety
...
author-script
...
last
...
next
patch
...
threeway
utf8
$ cat .git/rebase-apply/next .git/rebase-apply/last .git/rebase-apply/author-script
2
2
GIT_AUTHOR_NAME='Dildora Qosimova'
GIT_AUTHOR_EMAIL='dildora@example.com'
GIT_AUTHOR_DATE='Wed, 7 Oct 2026 10:40:00 +0500'
$ git rev-parse --short ORIG_HEAD
e06df87
```

`git am --continue` aynan shu `author-script` va `msg` dan commit yasaydi — konfliktni siz hal qilsangiz ham muallif Dildora bo'lib qolishining sababi shu. (Papka nomi `rebase-apply`: tarixan `git rebase` ham patch'larni `am` orqali qo'llagan.)

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Kelgan patch'ni to'g'ridan-to'g'ri `main`ga qo'llash | Rad etish yoki tuzatish qiyin; `main`da sinalmagan kod | Har patch — `main`dan alohida topic branch (`jt/mavzu`) |
| `git apply` dan keyin oddiy `git commit` | Muallif — siz, hissa qo'shuvchining nomi tarixdan yo'qoladi | `git commit --author="Ism <email>"`; yaxshisi — `format-patch` so'rang |
| `format-patch` faylini `git apply` bilan qo'llash | Muallif, sana va xabar e'tiborsiz qoladi | `git am` |
| `git am` to'xtaganda yangi `git am <boshqa mbox>` | Sessiya ochiq, yangi mbox qabul qilinmaydi | Avval `--continue`, `--skip` yoki `--abort` |
| Konfliktni hal qilib, `git add`siz `git am --continue` | am index'dagi holatdan commit yasaydi; index'da yechim yo'q | Faylni tuzatib `git add`, keyin `--continue` |
| Konfliktda `git commit` qilib yuborish | Commit muallifi siz bo'ladi, am sessiyasi ochiq qoladi | `git am --continue` — u muallifni xatdan oladi |
| `-3` doim ishlaydi deb o'ylash | Asos blob'lar sizda bo'lmasa, uch tomonlama merge qila olmaydi | Ommaviy asosdan yaratilgan patch so'rang yoki qo'lda `--reject` |
| Ko'rib chiqishda `git diff main` | `main`ga keyin qo'shilgan narsa "o'chirilgandek" ko'rinadi | `git diff main...topic` |
| Shaxsiy branch'dan `cherry-pick -x` | Hech kim ko'ra olmaydigan hash xabarda qoladi | `-x` faqat ommaviy branch'lar o'rtasida |
| Cherry-pick'dan keyin `branch -d` "xavfsiz" deb o'ylash | Upstream'i bor branch merge qilinmagan bo'lsa ham o'chadi (faqat ogohlantirish) | Ogohlantirishni o'qing; commit `<remote>/<branch>` da qolganini tekshiring |
| E'lon qilingan (boshqalar ishlatayotgan) topic'ni rebase qilish | Boshqalarda ikki nusxali commit'lar | Rebase faqat sizning lokal topic'ingizda; ommaviyda — merge ([24-bob](24-rebase.md)) |
| Relizni branch nomidan arxivlash (`git archive main`) | Ertaga `main` boshqa, arxivni takrorlab bo'lmaydi | Teg bilan: `git archive -o hisob-1.1.tar.gz v1.1` |
| `--prefix=hisob` (oxirida `/`siz) | Yo'llar `hisobREADME.md` bo'lib qoladi | `--prefix=hisob/` |
| Reliz uchun lightweight teg | `describe` uni ko'rmaydi, muallif/sana/xabar yo'q | `git tag -a` (yoki `-s`) |
| `describe` nomini doimiy ID deb saqlash | Qisqa hash vaqt o'tib noaniq bo'lishi mumkin | Doimiy havola uchun to'liq hash yoki teg |
| `shortlog`ni `--no-merges`siz e'lon qilish | "Merge branch ..." qatorlari ro'yxatni ifloslantiradi | `git shortlog --no-merges v1.0..v1.1` |

## Amaliyot

1. Bare server va ikki klon yarating. Ikkinchi klonda ikkita faylni o'zgartirib `git diff > x.patch` qiling. Birinchi klonda topic branch ochib, `git apply --stat`, `--check`, keyin qo'llang va `--author` bilan commit qiling. `git log --pretty=fuller -1` dagi `AuthorDate` qayerdan olinganini tushuntiring.
2. Xuddi shu patch'ni `main`da o'sha qatorlar o'zgargan branch'da qo'llang: oddiy `apply` (working tree o'zgardimi?), `--reject` (`.rej` fayl), `-3` (konflikt belgilari, `git status` dagi ikki ustun). Har birining chiqish kodini yozing.
3. Ikki commit'li seriyani `format-patch` qiling, ularni bitta mbox'ga birlashtiring va `git am -i` bilan birinchisini qabul qilib, ikkinchisini rad eting. `git log --pretty=fuller` bilan muallif va commit qiluvchini solishtiring; patch fayldagi `From <hash>` va yangi commit hash'i nega farq qilishini tushuntiring.
4. Seriyaning birinchi patch'i allaqachon `main`da bo'lgan, ikkinchisi konflikt beradigan holatni yarating. Avval `-3`siz: `--show-current-patch=diff`, `--skip`, `--abort`. Keyin `git am -3`: "No changes -- Patch already applied." ni ko'ring, konfliktni hal qiling va `--continue`. To'xtagan payt `.git/rebase-apply/author-script` ni o'qing.
5. Hissa qo'shuvchi uchun alohida bare repo (fork) yarating, unga topic push qiling. Maintainer'da `remote add` + `fetch` + `switch -c`. `main` oldinga ketgandan keyin `git diff main` va `git diff main...topic` ni solishtiring; farqni `git merge-base` bilan isbotlang.
6. Bir topic'ni `merge --no-ff`, ikkinchisini `rebase` + `merge --ff-only`, uchinchisidan bitta commit'ni `cherry-pick -x` bilan qo'shing. `git log --oneline --graph` ni chizing va `git shortlog -sn` hamda `git shortlog -sn -c` natijalarini tushuntiring.
7. `.gitattributes` ga `tests/ export-ignore` yozib commit qiling, annotated teg qo'ying. `git archive` bilan tar.gz (`describe` nomi bilan) va zip yarating; `tar tzf`, `unzip -l`, `git get-tar-commit-id` bilan tekshiring. Xuddi shuni `<teg>^{tree}` bilan qilib, fayl vaqtlari va commit ID'ga nima bo'lganini ko'ring.
8. (Qiyinroq) Ochiq kalit o'rnida ixtiyoriy matnli faylni `hash-object -w` bilan blob qilib, unga annotated teg qo'ying va bare server'ga push qiling. Boshqa klonda `git fetch --tags` dan keyin faylni faqat Git buyruqlari bilan tiklang. Keyin `git describe` ni `--tags`, `--long`, `--dirty`, `--contains`, `--first-parent` bilan sinab, har birining natijasini merge commit'li tarixda tushuntiring; `--first-parent` qachon boshqa teg tanlashini ko'rsatadigan holat quring.

## Rasmiy hujjat

- Pro Git — Maintaining a Project: <https://git-scm.com/book/en/v2/Distributed-Git-Maintaining-a-Project>
- `git am`: <https://git-scm.com/docs/git-am>
- `git apply`: <https://git-scm.com/docs/git-apply>
- `git cherry-pick`: <https://git-scm.com/docs/git-cherry-pick>
- `git describe`: <https://git-scm.com/docs/git-describe>
- `git archive`: <https://git-scm.com/docs/git-archive>
- `git shortlog`: <https://git-scm.com/docs/git-shortlog>
- `git merge-base`: <https://git-scm.com/docs/git-merge-base>
- `git rerere`: <https://git-scm.com/docs/git-rerere>
- `gitworkflows` (integratsiya branch'lari): <https://git-scm.com/docs/gitworkflows>
- Git maintainer qo'llanmasi (`howto/maintain-git`): <https://git-scm.com/docs/howto/maintain-git>
