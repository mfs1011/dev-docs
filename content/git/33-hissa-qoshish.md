# 33 — Loyihaga hissa qo'shish

[← Oldingi: Taqsimlangan workflow'lar](32-taqsimlangan-workflowlar.md) · [Mundarija](README.md) · [Keyingi: Loyihani yuritish →](34-loyihani-yuritish.md)

## Tushuncha

[32-bobda](32-taqsimlangan-workflowlar.md) workflow'larni "yuqoridan", ya'ni butun loyiha tuzilishi sifatida ko'rdik: kim qaysi repo'ga yozadi, o'zgarish qaysi yo'l bilan oqadi. Bu bob — **hissa qo'shuvchi** (contributor — loyihaga o'z kodini taklif qiladigan odam) nuqtai nazari. Savol: "Men shu loyihada ishlayapman. Ishimni qanday qilib boshqalarga eng kam og'riq bilan yetkazaman?"

Pro Git ochiq tan oladi: hissa qo'shishni bitta retsept bilan tasvirlab bo'lmaydi, chunki Git juda moslashuvchan va har loyiha o'zicha ishlaydi. Natijaga to'rtta o'zgaruvchi ta'sir qiladi:

| O'zgaruvchi | Savol | Nega muhim |
| --- | --- | --- |
| **Faol hissa qo'shuvchilar soni** | Ikki-uch kishimi yoki minglabmi? Kuniga nechta commit? | Odam ko'p bo'lsa, siz ishlayotgan yoki tasdiq kutayotgan paytda boshqalarning ishi kirib, sizning o'zgarishingizni eskirtirishi yoki buzishi mumkin |
| **Workflow** | Markazlashganmi? Integratsiya menejeri bormi? Leytenantlarmi? Har patch review qilinadimi? | Qaysi branch'ga, kimga, qanday yuborishni shu belgilaydi |
| **Commit huquqi** | Asosiy repo'ga yoza olasizmi? | Yoza olsangiz — push; yoza olmasangiz — fork yoki patch |
| **Tashqi hissa usuli** | Loyiha begona hissani qanday qabul qiladi? Qoidasi bormi? Qancha va qanchalik tez-tez yuborasiz? | Fork + so'rov, email'dagi patch, ticket'ga ilova — har biri boshqa buyruqlar |

Shu o'zgaruvchilar asosida Pro Git oddiydan murakkabga qarab to'rtta holatni ko'rsatadi. Biz ularning hammasini lokal bare repo'lar va bir nechta klon bilan **haqiqatan** yurgizamiz:

1. **Kichik xususiy jamoa** — 2–3 kishi, hamma bitta repo'ga yoza oladi.
2. **Boshqariladigan xususiy jamoa** — kichik guruhlar feature ustida ishlaydi, `main`ni faqat **integrator**lar yangilaydi.
3. **Fork qilingan ochiq loyiha** — yozish huquqi yo'q; o'z fork'ingizga push qilib, so'rov yuborasiz.
4. **Email orqali ochiq loyiha** — o'zgarishlar patch xatlari sifatida pochta ro'yxatiga yuboriladi (`format-patch`, `send-email`).

Har holatda **xususiy** (private) degani — yopiq kodli, tashqi dunyo ko'rmaydigan loyiha. Maintainer (loyihani yurituvchi) tomoni — patch'ni qanday qabul qilish, ko'rib chiqish va integratsiya qilish — [34-bobda](34-loyihani-yuritish.md).

> **Misollar haqida.** Hamma "server"lar — lokal bare repo'lar (`git init --bare`, [4-bob](04-repo-olish.md)), tarmoqqa hech narsa yuborilmagan. Chiqishlardagi yo'llar qisqartirilgan: `~/loyiha/...`. Har commit'ga alohida vaqt berilgan, shuning uchun hash'lar takrorlanadi. Ishtirokchilar: **Ali Valiyev** (maintainer/integrator), **Javohir Tursunov**, **Sevara Nazarova**, **Dildora Qosimova**. Email bilan hech qanday xat yuborilmagan — `send-email` faqat tushuntiriladi.

## Nega shunday: nega hissa qo'shuvchi ishini "qabul qilishga oson" qilib tayyorlashi kerak

Git'da birlashtirish (merge) **klient tomonida** bo'ladi. Subversion kabi markazlashgan tizimlarda, ikki kishi turli fayllarni o'zgartirsa, server o'zi birlashtirib yuborardi. Git'da esa server hech narsani birlashtirmaydi — u faqat ref'ni fast-forward bilan surishga rozi bo'ladi ([27-bob](27-remote.md)). Demak birlashtirish ishi doim kimningdir kompyuterida bajariladi: yoki sizda (push'dan oldin), yoki maintainer'da (sizning ishingizni olganda).

Bundan amaliy xulosa: **birlashtirish qiyinligini kim ko'taradi?** Yaxshi hissa qo'shuvchi bu yukni o'ziga oladi:

- O'zgarishni **eng yangi** asosiy tarix ustiga quradi (kerak bo'lsa rebase qiladi), shunda maintainer'da konflikt chiqmaydi.
- Har mavzuni **alohida topic branch**da saqlaydi — maintainer birini olib, boshqasini rad eta olsin.
- Commit'larni **mantiqan bo'lingan** va **tushunarli xabarli** qilib tayyorlaydi — review qiluvchi har qadamni alohida tushunsin.

Maintainer bitta, hissa qo'shuvchilar ko'p. Agar har kim "o'zi uchun qulay" yuborsa, maintainer tor joyga (bottleneck) aylanadi. Shuning uchun Pro Git'dagi barcha stsenariylarning umumiy g'oyasi bitta: **ishni qabul qiluvchi uchun iloji boricha arzon qiling.**

## Kod: commit qoidalari — qisqa eslatma

Pro Git stsenariylardan oldin commit'lar haqida qisqa qoidalar beradi. Ular [10-bobda](10-yaxshi-commit.md) batafsil (Git loyihasining `Documentation/SubmittingPatches` qo'llanmasi bilan birga) ko'rib chiqilgan, bu yerda faqat hissa qo'shish nuqtai nazaridan xulosa:

| Qoida | Tekshiruv / vosita | Batafsil |
| --- | --- | --- |
| Whitespace (bo'sh joy) xatosi yo'q | `git diff --check` (stage qilingandan keyin — `git diff --cached --check`) | [10-bob](10-yaxshi-commit.md) |
| Har commit — bitta mantiqiy o'zgarish | Dam olish kunlari besh xil masala ustida ishlab, dushanba kuni bitta katta commit yubormang; `git add --patch` bilan bo'ling | [10-bob](10-yaxshi-commit.md), [37-bob](37-interaktiv-staging.md) |
| Xabar: ~50 belgili sarlavha, bo'sh qator, keyin tana | Tanada **sabab** va avvalgi xatti-harakatdan **farq**; buyruq maylida ("Fix bug", "Fixed bug" emas) | [10-bob](10-yaxshi-commit.md) |
| Yuborishdan oldin tarixni tozalash | `git rebase -i` (squash, reword, tartib) | [25-bob](25-tarixni-qayta-yozish.md) |

Nega bu hissa qo'shishda ayniqsa muhim? Pro Git sababini aytadi: branch uchidagi yakuniy surat bitta commit qilsangiz ham, beshta qilsangiz ham **bir xil**. Farq faqat sizdan keyin o'qiydiganlarda — review qiluvchi har o'zgarishni alohida tushunadi, kerak bo'lsa bittasini olib tashlaydi yoki `revert` qiladi. Email workflow'ida bu yanada aniq: commit sarlavhasi xat mavzusiga (`Subject:`), tanasi xat matniga aylanadi (pastda ko'ramiz).

> **"Biz aytganni qiling, qilganimizni emas".** Pro Git ham, bu qo'llanma ham misollarda qisqalik uchun ko'pincha bir qatorli `-m` xabarlar ishlatadi. Haqiqiy loyihada xabarni yuqoridagi qoidalar bo'yicha yozing.

## Kod: kichik xususiy jamoa

Eng oddiy holat: yopiq loyiha, bir-ikki hamkasb, **hammaning** umumiy repo'ga push huquqi bor. Pro Git aytadi: bu Subversion'dagi ishga juda o'xshaydi — faqat siz oflayn commit qila olasiz, branch va merge ancha oson, va **merge serverda emas, klientda** bo'ladi.

```text
~/loyiha/
├── server.git/   ← umumiy repo (hamma push qila oladi)
├── javohir/      ← Javohir'ning klon'i
└── sevara/       ← Sevara'ning klon'i
```

Javohir va Sevara bir xil asosdan (`c69be5c Loyiha boshlandi`) klon qiladi va har biri commit qiladi:

```bash
$ git clone server.git javohir
Cloning into 'javohir'...
done.
$ cd javohir
$ git commit -am "Noto'g'ri standart qiymatni olib tashlash"
[main c93e528] Noto'g'ri standart qiymatni olib tashlash
 1 file changed, 1 insertion(+), 1 deletion(-)
```

```bash
$ cd ../sevara
$ git commit -am "Reset vazifasini qo'shish"
[main 6facfea] Reset vazifasini qo'shish
 1 file changed, 1 insertion(+)
$ git push origin main
To ~/loyiha/server.git
   c69be5c..6facfea  main -> main
```

Push chiqishining oxirgi qatori formati — `<eski>..<yangi>  <lokal ref> -> <remote ref>`: serverdagi `main` `c69be5c` dan `6facfea` ga surildi. Endi Javohir push qilmoqchi:

```bash
$ cd ../javohir
$ git push origin main
To ~/loyiha/server.git
 ! [rejected]        main -> main (fetch first)
error: failed to push some refs to '~/loyiha/server.git'
hint: Updates were rejected because the remote contains work that you do not
hint: have locally. This is usually caused by another repository pushing to
hint: the same ref. If you want to integrate the remote changes, use
hint: 'git pull' before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details.
```

E'tibor bering: Javohir `hisob.py`ni, Sevara `TODO`ni o'zgartirgan — **turli fayllar**. Subversion bunday holatda serverda o'zi birlashtirardi. Git esa yo'q: Javohir avval Sevara'ning ishini olib, **lokal** birlashtirishi shart. Pro Git'dagi `(non-fast forward)` o'rniga hozirgi Git `(fetch first)` deydi — Git serverdagi commit'ni hali ko'rmaganini aytadi ([27-bob](27-remote.md)).

```bash
$ git fetch origin
From ~/loyiha/server
   c69be5c..6facfea  main       -> origin/main
$ git log --oneline --graph --all --decorate
* 6facfea (origin/main, origin/HEAD) Reset vazifasini qo'shish
| * c93e528 (HEAD -> main) Noto'g'ri standart qiymatni olib tashlash
|/  
* c69be5c Loyiha boshlandi
$ git merge --no-edit origin/main
Merge made by the 'ort' strategy.
 TODO | 1 +
 1 file changed, 1 insertion(+)
$ git push origin main
To ~/loyiha/server.git
   6facfea..9affa25  main -> main
```

`fetch` faqat **olib keladi** (`origin/main` yangilanadi), Javohir'ning ishiga tegmaydi. Merge — alohida, ongli qadam. Pro Git maslahati: merge'dan keyin, push'dan oldin **testlarni ishga tushiring** — Sevara'ning o'zgarishi sizniki bilan birga ishlashiga ishonch hosil qiling.

### Topic branch bilan: nimani birlashtirishim kerak?

Bu orada Sevara `xato54` topic branch'ida uchta commit qildi. Javohir'ning yangiliklarini hali olmagan:

```bash
$ cd ../sevara
$ git switch -c xato54
Switched to a new branch 'xato54'
$ git commit -qam "README: o'rnatish bo'limi"
$ git commit -qam "holat() qisqa formatda"
$ git commit -qam "daraxt_royxati() rekursiv"
$ git log --oneline --graph --all --decorate
* 04ee3ee (HEAD -> xato54) daraxt_royxati() rekursiv
* 767ab40 holat() qisqa formatda
* 11b57a3 README: o'rnatish bo'limi
* 6facfea (origin/main, origin/HEAD, main) Reset vazifasini qo'shish
* c69be5c Loyiha boshlandi
```

Javohir push qilganini eshitib, Sevara serverdagi hamma yangilikni oladi:

```bash
$ git fetch origin
From ~/loyiha/server
   6facfea..9affa25  main       -> origin/main
$ git log --oneline --graph --all --decorate
* 04ee3ee (HEAD -> xato54) daraxt_royxati() rekursiv
* 767ab40 holat() qisqa formatda
* 11b57a3 README: o'rnatish bo'limi
| *   9affa25 (origin/main, origin/HEAD) Merge remote-tracking branch 'origin/main'
| |\  
| |/  
|/|   
* | 6facfea (main) Reset vazifasini qo'shish
| * c93e528 Noto'g'ri standart qiymatni olib tashlash
|/  
* c69be5c Loyiha boshlandi
```

Topic tayyor, lekin push qilishdan oldin Sevara bilmoqchi: Javohir'ning ishidan **qaysi qismini** o'zinikiga birlashtirishi kerak? Javob — diapazon ([19-bob](19-revision-tanlash.md)):

```bash
$ git log --no-merges xato54..origin/main
commit c93e52893b54c119a168ad28a1079a5450e44977
Author: Javohir Tursunov <javohir@example.com>
Date:   Wed Oct 7 10:01:00 2026 +0500

    Noto'g'ri standart qiymatni olib tashlash
$ git log --oneline xato54..origin/main
9affa25 Merge remote-tracking branch 'origin/main'
c93e528 Noto'g'ri standart qiymatni olib tashlash
```

`xato54..origin/main` — "`origin/main`da bor, `xato54`da yo'q commit'lar". `--no-merges` merge commit'larni yashiradi: Sevara uchun muhim — **haqiqiy** o'zgarish bitta (Javohir'ning commit'i). Merge `9affa25` hech qanday yangi kod olib kelmaydi, u faqat Javohir'ning va Sevara'ning avvalgi ishini bog'laydi.

Endi uch qadam: `main`ga o'tish, topic'ni merge qilish, Javohir'ning ishini merge qilish.

```bash
$ git switch main
Switched to branch 'main'
Your branch is behind 'origin/main' by 2 commits, and can be fast-forwarded.
  (use "git pull" to update your local branch)
$ git merge xato54
Updating 6facfea..04ee3ee
Fast-forward
 README   | 2 ++
 hisob.py | 4 ++--
 2 files changed, 4 insertions(+), 2 deletions(-)
$ git merge --no-edit origin/main
Auto-merging hisob.py
Merge made by the 'ort' strategy.
 hisob.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
$ git push origin main
To ~/loyiha/server.git
   9affa25..51acc74  main -> main
```

"Behind by 2 commits" — Javohir'ning commit'i va uning merge'i. `xato54` `main`dan boshlangani uchun birinchi merge oddiy fast-forward bo'ldi (`main` ko'rsatkichi shunchaki oldinga surildi, [21-bob](21-branch-va-merge.md)). Ikkinchisi — haqiqiy uch tomonlama merge: ikkalasi ham `hisob.py`ni o'zgartirgan, lekin turli qatorlarda, shuning uchun `Auto-merging` konfliktsiz o'tdi.

Pro Git qayd etadi: `xato54` va `origin/main` — ikkalasi ham "yuqoridagi" ish, ularni **istalgan tartibda** merge qilish mumkin. Yakuniy surat bir xil bo'ladi, faqat tarix boshqacha. Buni tekshiramiz — teskari tartibda merge qilib, ikki natijaning **tree** obyektini ([15-bob](15-tree-va-index.md)) solishtiramiz:

```bash
$ git switch -q -c boshqa-tartib 6facfea
$ git merge -q --no-edit origin/main
$ git merge -q --no-edit xato54
$ git rev-parse main^{tree} boshqa-tartib^{tree}
514038d58e2c9793bc97e507749b75b620744fd6
514038d58e2c9793bc97e507749b75b620744fd6
```

Bir xil tree hash — fayllar bayt-bayt bir xil. (Bu yerda `origin/main` — push'dan keyingi holat emas, sinov oldidan saqlangan `9affa25`; tajriba skriptida aynan shu commit ishlatilgan.)

Yakuniy tarix:

```bash
$ git log --oneline --graph --all --decorate
*   51acc74 (HEAD -> main, origin/main, origin/HEAD) Merge remote-tracking branch 'origin/main'
|\  
| *   9affa25 Merge remote-tracking branch 'origin/main'
| |\  
| * | c93e528 Noto'g'ri standart qiymatni olib tashlash
* | | 04ee3ee (xato54) daraxt_royxati() rekursiv
* | | 767ab40 holat() qisqa formatda
* | | 11b57a3 README: o'rnatish bo'limi
| |/  
|/|   
* | 6facfea Reset vazifasini qo'shish
|/  
* c69be5c Loyiha boshlandi
```

Umumiy ketma-ketlik (Pro Git'dagi sxema):

```text
  topic'da ishlash ──▶ topic'ni main'ga merge ──▶ git fetch origin
                                                       │
                     ┌─────── yangilik bormi? ◀────────┘
                     │ ha                    │ yo'q
                     ▼                       ▼
          git merge origin/main ──▶ testlar ──▶ git push origin main
                                                       │
                                  push rad etildi? ────┘ ha → yana fetch
```

Bunday tarixda merge commit'lar ko'p — `Merge remote-tracking branch 'origin/main'` har push'dan oldin paydo bo'ladi. Chiziqli tarix kerak bo'lsa, `git pull --rebase` yoki `pull.rebase=true` ([27-bob](27-remote.md), [24-bob](24-rebase.md)): lokal commit'lar serverdagining ustiga ko'chiriladi va merge commit kerak bo'lmaydi.

## Kod: boshqariladigan xususiy jamoa

Endi kattaroq yopiq guruh. Pro Git stsenariysi: kichik guruhlar feature'lar ustida ishlaydi, keyin ularning ishini **boshqa odam** — integrator — birlashtiradi. Kompaniya integratsiya menejeri workflow'ining bir turini ishlatadi ([32-bob](32-taqsimlangan-workflowlar.md)), lekin bitta umumiy repo bilan: **`main`ni faqat integratorlar yangilay oladi**, qolgan hamma ish jamoaviy branch'larda.

Rollar:

| Feature | Kim ishlaydi | Serverdagi branch |
| --- | --- | --- |
| Hisobot (`featureA` Pro Git'da) | Sevara + Javohir | `hisobot` |
| Eksport (`featureB`) | Sevara + Dildora | `eksport-ish` (Dildora ochgan) |
| `main` | Faqat Ali (integrator) | `main` |

"Faqat integrator" qoidasini Git'ning o'zi bilmaydi — bu server qoidasi ([32-bob](32-taqsimlangan-workflowlar.md)dagi uchinchi fakt). Odatda uni hosting (GitHub'dagi himoyalangan branch — [36-bob](36-github-boshqaruv.md)) yoki server hook'i ([47-bob](47-hooklar.md)) bajaradi. Tajribada bare repo'ga oddiy `update` hook'ini qo'yamiz. U har yangilanayotgan ref uchun chaqiriladi; nol bo'lmagan kod bilan chiqsa, shu ref yangilanmaydi:

```bash
$ cat server.git/hooks/update
#!/bin/sh
# update <ref> <eski> <yangi>: main'ni faqat integratorlar yangilaydi
if [ "$1" = refs/heads/main ] && [ "$INTEGRATOR" != 1 ]; then
	echo "main'ni faqat integratorlar yangilay oladi" >&2
	exit 1
fi
```

(`INTEGRATOR` o'zgaruvchisi — faqat lokal tajriba uchun hiyla: lokal push'da server jarayoni push qiluvchining muhitini meros oladi. Haqiqiy serverda foydalanuvchini SSH kaliti yoki hosting hisobi aniqlaydi.)

**Sevara `hisobot` ustida ish boshlaydi** va Javohir bilan bo'lishish uchun serverga push qiladi. `main`ga push qila olmaydi, shuning uchun alohida branch:

```bash
$ cd sevara
$ git switch -c hisobot
Switched to a new branch 'hisobot'
$ git commit -am "tarix() ga limit qo'shish"
[hisobot c549c65] tarix() ga limit qo'shish
 1 file changed, 1 insertion(+), 1 deletion(-)
$ git push -u origin hisobot
To ~/loyiha/server.git
 * [new branch]      hisobot -> hisobot
branch 'hisobot' set up to track 'origin/hisobot'.
```

`-u` (`--set-upstream`) — lokal `hisobot`ni `origin/hisobot`ga bog'laydi; keyin shunchaki `git push`/`git pull` yetarli ([28-bob](28-remote-branchlar.md)). Sevara Javohir'ga "`hisobot` branch'ini ko'rib chiq" deb xabar yuboradi va javob kutayotganda **ikkinchi** feature'ni boshlaydi — serverdagi `main`dan, birinchi feature'dan mustaqil:

```bash
$ git fetch origin
From ~/loyiha/server
 * [new branch]      eksport-ish -> origin/eksport-ish
$ git switch -c eksport origin/main
Switched to a new branch 'eksport'
branch 'eksport' set up to track 'origin/main'.
$ git commit -am "daraxt_royxati() rekursiv"
[eksport 38fbcb1] daraxt_royxati() rekursiv
 1 file changed, 1 insertion(+), 1 deletion(-)
$ git commit -am "eksport() ni amalga oshirish"
[eksport fbc3835] eksport() ni amalga oshirish
 1 file changed, 1 insertion(+), 1 deletion(-)
```

`fetch` bir yangilikni ko'rsatdi: Dildora eksport bo'yicha boshlang'ich ishni **`eksport-ish`** nomli branch'ga allaqachon push qilgan ekan. Remote-tracking branch'dan ochilgan `eksport` avtomatik `origin/main`ni kuzatadigan bo'ldi (`branch.autoSetupMerge`, [28-bob](28-remote-branchlar.md)) — buni birozdan keyin o'zgartiramiz.

```bash
$ git log --oneline --graph --all --decorate
* fbc3835 (HEAD -> eksport) eksport() ni amalga oshirish
* 38fbcb1 daraxt_royxati() rekursiv
| * a622b1e (origin/eksport-ish) CSV eksport uchun asos
|/  
| * c549c65 (origin/hisobot, hisobot) tarix() ga limit qo'shish
|/  
* bd78f3f (origin/main, origin/HEAD, main) Loyiha boshlandi
```

Sevara o'z ishini Dildora'niki bilan birlashtiradi va **Dildora ochgan branch'ga** push qiladi — o'zining `eksport` nomi bilan yangi branch ochmaydi:

```bash
$ git merge --no-edit origin/eksport-ish
Auto-merging hisob.py
Merge made by the 'ort' strategy.
 hisob.py | 4 ++++
 1 file changed, 4 insertions(+)
$ git push -u origin eksport:eksport-ish
To ~/loyiha/server.git
   a622b1e..a45b6e5  eksport -> eksport-ish
branch 'eksport' set up to track 'origin/eksport-ish'.
$ git branch -vv
* eksport a45b6e5 [origin/eksport-ish] Merge remote-tracking branch 'origin/eksport-ish' into eksport
  hisobot c549c65 [origin/hisobot] tarix() ga limit qo'shish
  main    bd78f3f [origin/main] Loyiha boshlandi
```

`eksport:eksport-ish` — **refspec** ([29-bob](29-fetch-push-ichidan.md)): "lokal `eksport` ni serverdagi `eksport-ish` ga yoz". Lokal va remote nomlar har xil bo'lishi mumkin. `-u` endi upstream'ni `origin/main` dan `origin/eksport-ish` ga almashtirdi — `git branch -vv` buni ko'rsatadi.

**Javohir `hisobot`ga hissa qo'shadi.** Uning klon'ida lokal `hisobot` yo'q, lekin `git switch hisobot` remote-tracking `origin/hisobot`ni topib, kuzatuvchi branch yaratadi (`--guess`, [28-bob](28-remote-branchlar.md)):

```bash
$ cd ../javohir
$ git fetch -q origin
$ git switch hisobot
Switched to a new branch 'hisobot'
branch 'hisobot' set up to track 'origin/hisobot'.
$ git commit -am "Log chiqishini 25 dan 30 ga oshirish"
[hisobot e08694c] Log chiqishini 25 dan 30 ga oshirish
 1 file changed, 1 insertion(+), 1 deletion(-)
$ git push
To ~/loyiha/server.git
   c549c65..e08694c  hisobot -> hisobot
```

**Sevara Javohir'ning ishini ko'rib chiqadi.** Avval faqat **yangi** commit'larni ko'radi — lokal `hisobot` bilan yangi olingan `origin/hisobot` farqi:

```bash
$ cd ../sevara
$ git fetch origin
From ~/loyiha/server
   c549c65..e08694c  hisobot    -> origin/hisobot
$ git log hisobot..origin/hisobot
commit e08694ce30812f3de89e0ac79507b57931f20789
Author: Javohir Tursunov <javohir@example.com>
Date:   Wed Oct 7 10:10:00 2026 +0500

    Log chiqishini 25 dan 30 ga oshirish
$ git switch hisobot
Switched to branch 'hisobot'
Your branch is behind 'origin/hisobot' by 1 commit, and can be fast-forwarded.
  (use "git pull" to update your local branch)
$ git merge origin/hisobot
Updating c549c65..e08694c
Fast-forward
 hisob.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
$ git commit -am "Birlashtirilgan kodga kichik tuzatish"
[hisobot 67572be] Birlashtirilgan kodga kichik tuzatish
 1 file changed, 1 insertion(+)
$ git push
To ~/loyiha/server.git
   e08694c..67572be  hisobot -> hisobot
```

Sevara qiziqib `main`ga yozishga urinsa — server rad etadi:

```bash
$ git push origin hisobot:main
remote: main'ni faqat integratorlar yangilay oladi
remote: error: hook declined to update refs/heads/main
To ~/loyiha/server.git
 ! [remote rejected] hisobot -> main (hook declined)
error: failed to push some refs to '~/loyiha/server.git'
```

`[remote rejected]` — bu safar Sevara'ning Git'i yubordi, lekin **server** rad etdi (`[rejected]` dan farqi — [27-bob](27-remote.md)). `remote:` bilan boshlangan qatorlar — hook'ning stderr'i, Git uni klientga uzatadi.

**Integrator birlashtiradi.** Sevara, Javohir va Dildora integratorga "`hisobot` va `eksport-ish` tayyor" deb xabar beradi. Ali ikkalasini `main`ga merge qiladi:

```bash
$ cd ../ali
$ git fetch origin
From ~/loyiha/server
 * [new branch]      eksport-ish -> origin/eksport-ish
 * [new branch]      hisobot     -> origin/hisobot
$ git merge --no-ff --no-edit origin/hisobot
Merge made by the 'ort' strategy.
 hisob.py | 3 ++-
 1 file changed, 2 insertions(+), 1 deletion(-)
$ git merge --no-ff --no-edit origin/eksport-ish
Auto-merging hisob.py
Merge made by the 'ort' strategy.
 hisob.py | 8 ++++++--
 1 file changed, 6 insertions(+), 2 deletions(-)
$ INTEGRATOR=1 git push origin main
To ~/loyiha/server.git
   bd78f3f..8aed77d  main -> main
```

Sevara keyingi `fetch`da ikkala feature'ning `main`ga kirganini ko'radi:

```bash
$ cd ../sevara
$ git fetch origin
From ~/loyiha/server
   bd78f3f..8aed77d  main       -> origin/main
$ git log --oneline --graph --all --decorate
*   8aed77d (origin/main, origin/HEAD) Merge remote-tracking branch 'origin/eksport-ish'
|\  
| *   a45b6e5 (origin/eksport-ish, eksport) Merge remote-tracking branch 'origin/eksport-ish' into eksport
| |\  
| | * a622b1e CSV eksport uchun asos
| * | fbc3835 eksport() ni amalga oshirish
| * | 38fbcb1 daraxt_royxati() rekursiv
| |/  
* |   bd81dc7 Merge remote-tracking branch 'origin/hisobot'
|\ \  
| |/  
|/|   
| * 67572be (HEAD -> hisobot, origin/hisobot) Birlashtirilgan kodga kichik tuzatish
| * e08694c Log chiqishini 25 dan 30 ga oshirish
| * c549c65 tarix() ga limit qo'shish
|/  
* bd78f3f (main) Loyiha boshlandi
```

Pro Git xulosasi: ko'p jamoalar Git'ga aynan shu imkoniyat uchun o'tadi — **bir nechta guruh parallel ishlaydi**, turli ish chiziqlari jarayonning **oxirida** birlashtiriladi. Kichik guruhlar butun jamoani jalb qilmasdan va unga xalaqit bermasdan remote branch'lar orqali hamkorlik qila oladi.

```text
  Sevara ─┬─ hisobot ─── push ──┐            ┌── Javohir: switch hisobot, commit, push
          │                     ▼            │
          │              server: hisobot ◀───┘
          │
          └─ eksport ── merge origin/eksport-ish ── push eksport:eksport-ish
                                                        │
                                server: eksport-ish ◀───┘ ◀── Dildora
                                       │
             integrator (Ali): merge hisobot + eksport-ish ──▶ server: main
```

## Kod: fork qilingan ochiq loyiha

Ochiq loyihada sizda asosiy repo'ning branch'larini yangilash huquqi **yo'q**. Ishni maintainer'ga boshqa yo'l bilan yetkazish kerak. Bu bo'lim — **fork** (hosting'dagi o'zingizga tegishli, yoza oladigan nusxa) orqali; keyingi bo'lim — email orqali. Ko'p hosting'lar (GitHub, Bitbucket, repo.or.cz va boshqalar) fork'ni qo'llab-quvvatlaydi va ko'p maintainer'lar aynan shu uslubni kutadi.

```text
~/loyiha/
├── loyiha.git/        ← asl loyiha (faqat Ali yozadi)
├── ali/               ← maintainer
├── sevara-fork.git/   ← Sevara'ning fork'i (faqat Sevara yozadi)
└── sevara/            ← Sevara'ning ishchi repo'si
```

Pro Git tartibi: **avval** asl repo'ni klon qilib, topic branch'da ishlaysiz, **keyin** fork qilasiz.

```bash
$ git clone loyiha.git sevara
Cloning into 'sevara'...
done.
$ cd sevara
$ git switch -c tarix-limit
Switched to a new branch 'tarix-limit'
$ git commit -qam "tarix() ga limit qo'shish"
$ git commit -qam "Log chiqishini 20 dan 30 ga oshirish"
```

> **Maslahat (Pro Git).** Yuborishdan oldin `git rebase -i` bilan commit'larni bitta qilib birlashtirishingiz yoki maintainer review qilishi oson bo'ladigan tartibga keltirishingiz mumkin ([25-bob](25-tarixni-qayta-yozish.md)).

Ish tayyor. Hosting'da "Fork" tugmasi bosiladi — server tomonda bu asl repo'ning bare nusxasi. Tajribada `git clone --bare` (32-bobdagidek):

```bash
$ cd ..
$ git clone --bare loyiha.git sevara-fork.git
Cloning into bare repository 'sevara-fork.git'...
done.
$ cd sevara
$ git remote add fork ../sevara-fork.git
$ git push -u fork tarix-limit
To ../sevara-fork.git
 * [new branch]      tarix-limit -> tarix-limit
branch 'tarix-limit' set up to track 'fork/tarix-limit'.
```

**Nega topic branch'ni push qilamiz, `main`ni emas?** Pro Git sababi: agar ishingiz qabul qilinmasa yoki maintainer undan faqat bitta commit'ni `cherry-pick` qilsa ([34-bob](34-loyihani-yuritish.md)), `main`ingizni orqaga qaytarishga to'g'ri kelmaydi. Maintainer ishingizni `merge`, `rebase` yoki `cherry-pick` qilsa ham, oxir-oqibat u sizga asl repo'dan `pull` orqali qaytib keladi.

Remote nomlari haqida: bu yerda `origin` — asl loyiha (o'qish uchun), `fork` — o'zingizniki (yozish uchun). Ko'p odamlar teskarisini qiladi: o'z fork'ini `origin` deb klon qiladi va aslini `upstream` deb qo'shadi ([35-bob](35-github-fork-va-pr.md)). Ikkalasi ham to'g'ri — muhimi, qaysi nom nimani anglatishini bilish.

### So'rov yuborish: `git request-pull` chuqurroq

Endi maintainer'ga "ishimni oling" deyish kerak. Bu **pull request** deyiladi. Uni hosting veb-sahifasida (GitHub'ning PR mexanizmi — [35-bob](35-github-fork-va-pr.md)) yoki `git request-pull` chiqishini maintainer'ga xat bilan yuborib qilish mumkin. Buyruqning asosiy formati va chiqish qismlari [32-bobda](32-taqsimlangan-workflowlar.md) ko'rsatilgan. Bu yerda uchta nozik joy.

**1. `<end>`ni yozmaslik.** Pro Git misoli — `git request-pull origin/master myfork`, ya'ni oxirgi argumentsiz. Ma'lumotnomaga ko'ra `<end>` standart bo'yicha `HEAD`. Hozirgi Git'da sinab ko'ramiz:

```bash
$ git request-pull origin/main fork
warn: No match for commit 51893ee4a321dce327b4e89039ea9419e91ded42 found at fork
warn: Are you sure you pushed 'HEAD' there?
The following changes since commit f312ce51aa45299ccb6e801601d835cabe7e8178:

  Loyiha boshlandi (2026-10-07 09:00:00 +0500)

are available in the Git repository at:

  ../sevara-fork.git

for you to fetch changes up to 51893ee4a321dce327b4e89039ea9419e91ded42:
...
$ echo $?
1
```

Commit push qilingan, lekin buyruq uni **remote'dagi `HEAD` nomli ref'da** qidirdi (fork'ning `HEAD`i esa `main`ga qaraydi) va topmadi. Natijada xatda branch nomi bo'sh qoldi — maintainer qayerdan olishni bilmaydi — va chiqish kodi 1. Pro Git'dagi chiqish eski versiyadan. **Hozirgi tavsiya: branch nomini doim aniq bering.** Remote nomi esa URL o'rnida ishlaydi — Git uni `remote.fork.url`ga almashtiradi:

```bash
$ git request-pull origin/main fork tarix-limit
The following changes since commit f312ce51aa45299ccb6e801601d835cabe7e8178:
...
are available in the Git repository at:

  ../sevara-fork.git tarix-limit
...
```

**2. Branch tavsifi.** Ma'lumotnoma: xat **branch tavsifi** bilan boshlanadi. Tavsif `branch.<nom>.description` sozlamasida saqlanadi; uni `git branch --edit-description` muharrirda yozadi, `git config` bilan ham qo'yish mumkin.

**3. `<lokal>:<remote>` sintaksisi.** Agar fork'dagi branch nomi lokalnikidan farq qilsa (masalan `git push fork tarix-limit:for-ali`), ikkalasini ham bering — lokal nom bilan tavsif va commit'lar topiladi, remote nom xatga yoziladi:

```bash
$ git config branch.tarix-limit.description "tarix() chiqishini cheklash: katta repo'larda terminal to'lib ketmasin."
$ git request-pull origin/main ../sevara-fork.git tarix-limit:tarix-limit
The following changes since commit f312ce51aa45299ccb6e801601d835cabe7e8178:

  Loyiha boshlandi (2026-10-07 09:00:00 +0500)

are available in the Git repository at:

  ../sevara-fork.git tarix-limit

for you to fetch changes up to 51893ee4a321dce327b4e89039ea9419e91ded42:

  Log chiqishini 20 dan 30 ga oshirish (2026-10-07 10:01:00 +0500)

----------------------------------------------------------------
(from the branch description for tarix-limit local branch)

tarix() chiqishini cheklash: katta repo'larda terminal to'lib ketmasin.
----------------------------------------------------------------
Sevara Nazarova (2):
      tarix() ga limit qo'shish
      Log chiqishini 20 dan 30 ga oshirish

 hisob.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
```

Chiqish standart chiqishga yoziladi — uni o'zingiz xatga qo'yasiz. Git hech narsa yubormaydi.

### Ikkinchi mavzu — yangi branch, eski branch'dan emas

Pro Git maslahati: maintainer bo'lmagan loyihada `main` kabi branch doim `origin/main`ni kuzatsin, ish esa rad etilsa osongina tashlab yuboriladigan topic branch'larda bo'lsin. Ikkinchi mavzu uchun **yangi push qilingan topic ustida davom etmang** — asosiy repo'ning `main`idan boshlang:

```bash
$ git switch -c ls-files origin/main
Switched to a new branch 'ls-files'
branch 'ls-files' set up to track 'origin/main'.
$ git commit -qam "ls-files buyrug'ini qo'shish"
$ git push -q fork ls-files
$ git log --oneline --graph --all --decorate
* 110b346 (HEAD -> ls-files, fork/ls-files) ls-files buyrug'ini qo'shish
| * 51893ee (fork/tarix-limit, tarix-limit) Log chiqishini 20 dan 30 ga oshirish
| * 3300cb7 tarix() ga limit qo'shish
|/  
* f312ce5 (origin/main, origin/HEAD, main) Loyiha boshlandi
```

Endi har mavzu o'z "silos"ida — Pro Git uni **patch navbati**ga o'xshatadi: har birini boshqalariga ta'sir qilmasdan qayta yozish, rebase qilish va o'zgartirish mumkin.

### Maintainer'ning `main`i oldinga ketdi: rebase va qayta yuborish

Maintainer boshqa patch'larni qabul qildi — biri aynan `tarix()` qatorini o'zgartirdi. Endi `tarix-limit` toza merge bo'lmaydi. Pro Git yechimi: branch'ni yangi `origin/main` ustiga **rebase** qiling, konfliktlarni **maintainer uchun o'zingiz** hal qiling va qayta yuboring:

```bash
$ git fetch origin
From ~/loyiha/loyiha
   f312ce5..f346d48  main       -> origin/main
$ git switch tarix-limit
Switched to branch 'tarix-limit'
Your branch is up to date with 'fork/tarix-limit'.
$ git rebase origin/main
Rebasing (1/2)Auto-merging hisob.py
CONFLICT (content): Merge conflict in hisob.py
error: could not apply 3300cb7... tarix() ga limit qo'shish
hint: Resolve all conflicts manually, mark them as resolved with
hint: "git add/rm <conflicted_files>", then run "git rebase --continue".
...
$ cat hisob.py
def tarix(daraxt="main"):
<<<<<<< HEAD
    return buyruq("git log --oneline " + daraxt)
=======
    return buyruq("git log -n 20 " + daraxt)
>>>>>>> 3300cb7 (tarix() ga limit qo'shish)
...
```

Ikkala o'zgarishni saqlab (`git log --oneline -n 20`) hal qilamiz, `add`, `rebase --continue`. Ikkinchi commit ham shu qatorni o'zgartirgani uchun konflikt yana chiqadi — xuddi shunday hal qilinadi (`--oneline -n 30`). Konfliktlarni hal qilish va rebase ichki holati — [22-](22-konfliktlar.md) va [24-boblarda](24-rebase.md).

```bash
$ git add hisob.py
$ git rebase --continue
...
Successfully rebased and updated refs/heads/tarix-limit.
$ git log --oneline --graph --all --decorate
* 1dab6b0 (HEAD -> tarix-limit) Log chiqishini 20 dan 30 ga oshirish
* 4751c12 tarix() ga limit qo'shish
* f346d48 (origin/main, origin/HEAD) tarix() qisqa formatda
| * 110b346 (fork/ls-files, ls-files) ls-files buyrug'ini qo'shish
|/  
| * 51893ee (fork/tarix-limit) Log chiqishini 20 dan 30 ga oshirish
| * 3300cb7 tarix() ga limit qo'shish
|/  
* f312ce5 (main) Loyiha boshlandi
```

Fork'dagi `tarix-limit` hamon eski commit'larda (`51893ee`). Yangi uchi (`1dab6b0`) uning avlodi emas — oddiy push rad etiladi:

```bash
$ git push fork tarix-limit
To ../sevara-fork.git
 ! [rejected]        tarix-limit -> tarix-limit (non-fast-forward)
...
$ git push --force-with-lease fork tarix-limit
To ../sevara-fork.git
 + 51893ee...1dab6b0 tarix-limit -> tarix-limit (forced update)
```

Pro Git bu yerda `git push -f` ishlatadi. Hozirgi tavsiya — **`--force-with-lease`**: u fork'dagi branch siz oxirgi ko'rgan joyda (`fork/tarix-limit` = `51893ee`) turgan bo'lsagina ustiga yozadi ([29-bob](29-fetch-push-ichidan.md), [35-bob](35-github-fork-va-pr.md)). `+` va `...` (uch nuqta) — majburiy yangilanish belgisi. Bu xavfsiz, chunki branch faqat sizniki va maintainer uni hali merge qilmagan. Pro Git muqobilini ham aytadi: yangi ishni **boshqa nomli** branch'ga (masalan `tarix-limit-v2`) push qilish — shunda eski so'rov buzilmaydi.

### Maintainer o'zgartirish so'radi: `merge --squash` bilan v2

Pro Git'dagi oxirgi holat: maintainer ikkinchi branch'ni ko'rdi, g'oya yoqdi, lekin amalga oshirish tafsilotini o'zgartirishni so'radi. Siz bu imkoniyatdan foydalanib ishni joriy `main` ustiga ham ko'chirasiz. Usul — yangi branch, eski ishni **bitta o'zgarish** sifatida olib kelish, tuzatish va bitta commit:

```bash
$ git switch -c ls-files-v2 origin/main
Switched to a new branch 'ls-files-v2'
branch 'ls-files-v2' set up to track 'origin/main'.
$ git merge --squash ls-files
Auto-merging hisob.py
Automatic merge went well; stopped before committing as requested
Squash commit -- not updating HEAD
$ git status --short
M  hisob.py
$ cat .git/SQUASH_MSG
Squashed commit of the following:

commit 110b34636712e06429275e8edbe6e2ad1e748036
Author: Sevara Nazarova <sevara@example.com>
Date:   Wed Oct 7 10:05:00 2026 +0500

    ls-files buyrug'ini qo'shish
```

`--squash` nima qildi? Ma'lumotnomaga ko'ra u haqiqiy merge bo'lgandagidek **working tree va index**ni tayyorlaydi, lekin merge commit **yaratmaydi**, `HEAD`ni ham, `MERGE_HEAD`ni ham yozmaydi. `M ` (birinchi ustunda) — o'zgarish allaqachon stage qilingan. `.git/SQUASH_MSG` — keyingi `git commit` uchun tayyor xabar qoralamasi. Endi tuzatishni kiritib, commit qilamiz:

```bash
$ git commit -qam "fayllar(): kuzatilmagan fayllarni ham ko'rsatish"
$ git cat-file -p HEAD
tree 49b1ff82a2375987a80c8bff5e64932d0a0565f4
parent f346d48f9c4fbabccc1e197bca49f27aab07a877
author Sevara Nazarova <sevara@example.com> 1791351600 +0500
committer Sevara Nazarova <sevara@example.com> 1791351600 +0500

fayllar(): kuzatilmagan fayllarni ham ko'rsatish
$ git push -q fork ls-files-v2
$ git log --oneline --graph --all --decorate
* a829f47 (HEAD -> ls-files-v2) fayllar(): kuzatilmagan fayllarni ham ko'rsatish
| * 1dab6b0 (fork/tarix-limit, tarix-limit) Log chiqishini 20 dan 30 ga oshirish
| * 4751c12 tarix() ga limit qo'shish
|/  
* f346d48 (origin/main, origin/HEAD) tarix() qisqa formatda
| * 110b346 (fork/ls-files, ls-files) ls-files buyrug'ini qo'shish
|/  
* f312ce5 (main) Loyiha boshlandi
```

Commit obyektida **bitta** `parent` qatori ([16-bob](16-commit-obyekti.md)) — `ls-files` bilan hech qanday tarixiy bog'lanish yo'q, lekin uning butun o'zgarishi ichida. Pro Git ham shuni aytadi: kelajakdagi commit'ingizning faqat bitta otasi bo'ladi, siz boshqa branch'ning hamma o'zgarishini olib kirib, yozib qo'yishdan oldin yana o'zgartira olasiz. Shunga yaqin opsiya — `--no-commit`: oddiy merge'ni commit oldidan to'xtatadi, lekin u **haqiqiy** merge bo'lib qoladi (ikki ota).

Maintainer'ga "so'ragan o'zgarishlaringiz `ls-files-v2` branch'ida" deb xabar beriladi:

```bash
$ git request-pull origin/main ../sevara-fork.git ls-files-v2
The following changes since commit f346d48f9c4fbabccc1e197bca49f27aab07a877:

  tarix() qisqa formatda (2026-10-07 10:20:00 +0500)

are available in the Git repository at:

  ../sevara-fork.git ls-files-v2

for you to fetch changes up to a829f478f2cf56c8964613f43cc0946d52f792e5:

  fayllar(): kuzatilmagan fayllarni ham ko'rsatish (2026-10-07 10:40:00 +0500)

----------------------------------------------------------------
Sevara Nazarova (1):
      fayllar(): kuzatilmagan fayllarni ham ko'rsatish

 hisob.py | 4 ++++
 1 file changed, 4 insertions(+)
```

`<start>` endi `f346d48` — maintainer'ning yangi `main`i, ya'ni so'rov **eng yangi** asosga nisbatan.

## Kod: email orqali patch yuborish

Ko'p eski va katta loyihalar (Git'ning o'zi, Linux yadrosi) patch'larni **dasturchilar pochta ro'yxati** (mailing list) orqali qabul qiladi. Har loyihaning o'z qoidasi bor — avval ularni o'qing. Jarayonning boshi oldingi holat bilan bir xil: har patch seriyasi uchun topic branch. Farq — yuborish usuli: fork'ga push qilish o'rniga **har commit'ning email versiyasini** yaratib, ro'yxatga yuborasiz.

**Patch** — bu bir commit kiritgan o'zgarish matn ko'rinishida (diff) va uning metama'lumoti; **patch seriyasi** — bitta mavzuga oid ketma-ket patch'lar.

```bash
$ git switch -c limit
Switched to a new branch 'limit'
$ # ... ikkita commit
$ git log --oneline origin/main..limit
2a37845 Log chiqishini 20 dan 30 ga oshirish
620180c tarix() ga limit qo'shish
$ git format-patch -M origin/main
0001-tarix-ga-limit-qo-shish.patch
0002-Log-chiqishini-20-dan-30-ga-oshirish.patch
```

`git format-patch <since>` — bitta argument berilsa, "joriy branch uchidan `<since>` tarixida yo'q commit'lar" (ya'ni `origin/main..HEAD`). Har **merge bo'lmagan** commit uchun bitta fayl; nomi — tartib raqami va sarlavha (fayl nomi uchun xavfsiz shaklga keltirilgan: `qo'shish` → `qo-shish`, standart 64 baytgacha). Fayl nomlari standart chiqishga yoziladi. `-M` — nomi o'zgargan fayllarni aniqlash.

### Patch faylining tuzilishi

```bash
$ cat 0001-tarix-ga-limit-qo-shish.patch
From 620180cf7b5127566886e0022ea0cd6179f991fd Mon Sep 17 00:00:00 2001
From: Sevara Nazarova <sevara@example.com>
Date: Wed, 7 Oct 2026 10:00:00 +0500
Subject: [PATCH 1/2] tarix() ga limit qo'shish

Katta repo'larda tarix() butun tarixni chiqarib, terminalni to'ldirib
yuboradi. Ko'pincha faqat so'nggi commit'lar kerak bo'ladi, shuning
uchun chiqish 20 ta commit bilan cheklanadi.
---
 hisob.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

diff --git a/hisob.py b/hisob.py
index e2bbec4..c13dc0d 100644
--- a/hisob.py
+++ b/hisob.py
@@ -1,5 +1,5 @@
 def tarix(daraxt="main"):
-    return buyruq("git log " + daraxt)
+    return buyruq("git log -n 20 " + daraxt)
 
 
 def daraxt_royxati(daraxt="main"):
-- 
2.56.0
```

Qatorma-qator:

| Qism | Ma'nosi |
| --- | --- |
| `From 620180c... Mon Sep 17 00:00:00 2001` | **mbox** (bir faylda bir yoki ko'p xat saqlaydigan oddiy matn formati) ajratgichi. Hash — asl commit. Sana **o'zgarmas "sehrli"** qiymat: `file` kabi dasturlar faylni `format-patch` chiqishi deb taniydi |
| `From:`, `Date:` | Commit **muallifi** va muallif sanasi — `git am` aynan shulardan muallifni tiklaydi |
| `Subject: [PATCH 1/2] ...` | Xabarning birinchi paragrafi (sarlavha). Seriyada `[PATCH n/m]`, bitta patch'da `[PATCH]` |
| Bo'sh qatordan `---` gacha | Xabarning qolgan qismi (tana) |
| `---` | Xabar tugadi, patch boshlandi |
| Diffstat va `diff --git ...` | `diff -p --stat` — commit bilan uning otasi o'rtasidagi farq. `index e2bbec4..c13dc0d` — blob hash'lari: `am -3` aynan shu bilan asosni tiklaydi ([34-bob](34-loyihani-yuritish.md)) |
| `-- ` va `2.56.0` | Imzo (RFC 3676 bo'yicha `-- ` qatori bilan ajratilgan); standart bo'yicha Git versiyasi (`--signature`, `--no-signature`) |

Pro Git ta'kidlaydi: `format-patch` bilan yaratilgan xatdan patch qo'llanganda **commit'ning barcha ma'lumoti to'g'ri saqlanadi** — muallif, sana, xabar. Oddiy `git diff > x.patch` da esa bularning hech biri yo'q (farqi — [34-bob](34-loyihani-yuritish.md)).

### `---` dan keyingi izoh

Ba'zan ro'yxatdagilarga commit xabariga kirmasligi kerak bo'lgan narsani aytmoqchisiz ("v1 dan farqi shu", "bu patch X'ga bog'liq"). Uni **`---` qatori bilan `diff --git` qatori orasiga** yozing — dasturchilar o'qiydi, patch qo'llash jarayoni esa e'tiborsiz qoldiradi:

```bash
$ sed -n '9,16p' outgoing/v2-0001-tarix-ga-limit-qo-shish.patch
---
v1 dan farqi: 2-patch'da merge commit'lar ham chiqarib tashlanadi.

 hisob.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

diff --git a/hisob.py b/hisob.py
index e2bbec4..c13dc0d 100644
```

Maintainer (Ali) uni qo'llaganda izoh commit xabariga tushmaydi:

```bash
$ git switch -c sn/limit
Switched to a new branch 'sn/limit'
$ git am ../sevara/outgoing/v2-000[12]-*.patch
Applying: tarix() ga limit qo'shish
Applying: tarix(): 30 ta commit, merge'larsiz
$ git log --format=%B -1 HEAD~1
tarix() ga limit qo'shish

Katta repo'larda tarix() butun tarixni chiqarib, terminalni to'ldirib
yuboradi. Ko'pincha faqat so'nggi commit'lar kerak bo'ladi, shuning
uchun chiqish 20 ta commit bilan cheklanadi.

```

Bunday izohlarni versiyalararo saqlash uchun `git notes` + `format-patch --notes` ham bor — eslatma `---` dan keyin avtomatik qo'shiladi.

### Xabar ichidagi `---` — yashirin tuzoq

Ma'lumotnoma (`format-patch` va `am`, CAVEATS bo'limi) muhim cheklovni aytadi: qabul qiluvchi tomonda quyidagi qatorlardan **birinchisi** patch boshi hisoblanadi va commit xabari shu yerda **kesiladi**:

- faqat uch chiziqcha (`---`) dan iborat qator;
- `diff -` bilan boshlanadigan qator;
- `Index: ` bilan boshlanadigan qator.

Sinab ko'ramiz — xabar tanasida Markdown'dagi kabi `---` ajratgich:

```bash
$ git log -1 --format=%B
Modul tavsifini qo'shish

Fayl boshida qisqa izoh bo'ladi.
---
Bu qator ham xabarning bir qismi edi.

$ git format-patch -1 --stdout > ../izoh.patch
```

Ali qo'llaydi — xato yo'q, lekin:

```bash
$ git am ../izoh.patch
Applying: Modul tavsifini qo'shish
$ git log -1 --format=%B
Modul tavsifini qo'shish

Fayl boshida qisqa izoh bo'ladi.

```

Oxirgi qator jimgina yo'qoldi. Xabarda kod bloki ichida diff (masalan Markdown'dagi misol) bo'lsa, u hatto patch qismi bilan birga **qo'llanib** ketishi mumkin. Ma'lumotnoma yechimi: xabardagi diff yoki shunday matnni **chekinish (indent) bilan** yozing.

### Muhim opsiyalar

| Opsiya | Nima qiladi |
| --- | --- |
| `-<n>`, `-1 <commit>` | Oxirgi n ta commit; faqat bitta commit (`-1 <commit>`) |
| `--root <commit>` | Tarix boshidan `<commit>` gacha (bitta argument diapazon deb tushuniladi) |
| `-o <papka>` | Fayllarni papkaga yozish (`format.outputDirectory`) |
| `--stdout` | Hammasini bitta mbox oqimiga (fayl o'rniga) |
| `-n` / `-N` | Bitta patch'da ham `[PATCH 1/1]` / raqamsiz `[PATCH]` |
| `--cover-letter` | `0000-cover-letter.patch` — seriya haqida kirish xati |
| `-v <n>`, `--reroll-count` | n-chi iteratsiya: `[PATCH v2 ...]`, fayl nomi `v2-0001-...` |
| `--rfc[=<so'z>]` | `[RFC PATCH]` — "qo'llash uchun emas, muhokama uchun"; `--rfc=WIP` — tugallanmagan |
| `--subject-prefix=<p>` | `[PATCH]` o'rniga `[<p>]`; bir nechta loyiha ro'yxatida farqlash uchun |
| `-s`, `--signoff` | Xatga `Signed-off-by` qo'shish (commit'ning o'ziga emas) |
| `--base=<commit>` / `--base=auto` | Seriya qaysi commit ustiga qo'llanishini yozish (`base-commit:` qatori) |
| `--interdiff=<oldingi>`, `--range-diff=<oldingi>` | Reviewer uchun: oldingi versiya bilan farq (cover letter'da) |
| `--thread`, `--in-reply-to=<id>` | Xatlarni bitta suhbat (thread) qilib bog'lash |
| `--to=`, `--cc=` | `To:`/`Cc:` sarlavhalari |
| `--notes` | `git notes` dagi izohni `---` dan keyin qo'shish |

Ba'zilarini sinaymiz:

```bash
$ git format-patch --stdout -1 -n | grep Subject
Subject: [PATCH 1/1] Log chiqishini 20 dan 30 ga oshirish
$ git format-patch --stdout -1 --rfc -v2 | grep Subject
Subject: [RFC PATCH v2] Log chiqishini 20 dan 30 ga oshirish
$ git format-patch --stdout -1 --subject-prefix='PATCH hisob' | grep Subject
Subject: [PATCH hisob] Log chiqishini 20 dan 30 ga oshirish
$ git format-patch -v2 -1
v2-0001-Log-chiqishini-20-dan-30-ga-oshirish.patch
$ git format-patch --stdout -1 -s | sed -n '5,12p'

Signed-off-by: Sevara Nazarova <sevara@example.com>
---
 hisob.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
...
```

`-s` haqida: `Signed-off-by` — ko'p loyihalarda **huquqiy tasdiq** (Developer's Certificate of Origin, [10-bob](10-yaxshi-commit.md)), shuning uchun uni faqat ma'nosini bilib qo'shing. `format-patch -s` faqat **xatga** qo'shadi; tarixingizdagi commit'da ham bo'lishi kerak bo'lsa — `git commit -s`.

**Asos commit (`--base`).** Ma'lumotnomaga ko'ra bu blok maintainer va tekshiruvchilarga seriya **qaysi holatga** qo'llanishini aniq aytadi:

```bash
$ git format-patch --stdout --base=origin/main origin/main | grep base-commit
base-commit: f312ce51aa45299ccb6e801601d835cabe7e8178
$ git format-patch --stdout --base=auto origin/main
fatal: failed to get upstream, if you want to record base commit automatically,
please use git branch --set-upstream-to to track a remote branch.
Or you could specify base commit by --base=<base-commit-id> manually
```

`base-commit:` birinchi xatning oxiriga (imzodan oldin) yoziladi. `--base=auto` upstream'dan hisoblaydi — `limit` esa `main`dan ochilgan va hech narsani kuzatmaydi. `git branch --set-upstream-to=origin/main` qilsangiz ishlaydi; `format.useAutoBase` bilan doimiy yoqish mumkin.

### Cover letter va seriyaning keyingi versiyasi

Bir nechta patch'li seriyaga odatda **cover letter** — "0-patch", ya'ni seriyaning maqsadini tushuntiruvchi kirish xati qo'shiladi:

```bash
$ git format-patch -M --cover-letter -o outgoing/ origin/main
outgoing/0000-cover-letter.patch
outgoing/0001-tarix-ga-limit-qo-shish.patch
outgoing/0002-Log-chiqishini-20-dan-30-ga-oshirish.patch
$ cat outgoing/0000-cover-letter.patch
From 2a37845ea6d8dde5d5b2769794b2fddf6a11690d Mon Sep 17 00:00:00 2001
From: Sevara Nazarova <sevara@example.com>
Date: Wed, 7 Oct 2026 10:01:00 +0500
Subject: [PATCH 0/2] *** SUBJECT HERE ***

*** BLURB HERE ***

Sevara Nazarova (2):
  tarix() ga limit qo'shish
  Log chiqishini 20 dan 30 ga oshirish

 hisob.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

-- 
2.56.0
```

`*** SUBJECT HERE ***` va `*** BLURB HERE ***` — yuborishdan oldin o'zingiz to'ldiradigan joylar. Branch tavsifi bo'lsa, `--cover-from-description` (standart `message`) uni tanaga avtomatik qo'yadi. Ichida — `git shortlog` uslubidagi commit ro'yxati va umumiy diffstat.

Review'dan keyin seriyani tuzatib, **v2** yuborasiz. Reviewer'ga nima o'zgarganini ko'rsatish uchun `--range-diff` — ikki seriyani commit'ma-commit solishtiradi. Avval eski uchini saqlab qo'yamiz:

```bash
$ git branch limit-v1
$ git commit -qa --amend -m "tarix(): 30 ta commit, merge'larsiz"
$ git format-patch -v2 --cover-letter --range-diff=origin/main..limit-v1 -o outgoing/ origin/main
outgoing/v2-0000-cover-letter.patch
outgoing/v2-0001-tarix-ga-limit-qo-shish.patch
outgoing/v2-0002-tarix-30-ta-commit-merge-larsiz.patch
$ sed -n '/^Range-diff/,/^-- $/p' outgoing/v2-0000-cover-letter.patch
Range-diff against v1:
1:  620180c = 1:  620180c tarix() ga limit qo'shish
2:  2a37845 ! 2:  26d775a Log chiqishini 20 dan 30 ga oshirish
    @@ Metadata
     Author: Sevara Nazarova <sevara@example.com>
     
      ## Commit message ##
    -    Log chiqishini 20 dan 30 ga oshirish
    +    tarix(): 30 ta commit, merge'larsiz
     
      ## hisob.py ##
     @@
      def tarix(daraxt="main"):
     -    return buyruq("git log -n 20 " + daraxt)
    -+    return buyruq("git log -n 30 " + daraxt)
    ++    return buyruq("git log -n 30 --no-merges " + daraxt)
...
```

`=` — patch o'zgarmagan, `!` — o'zgargan; ichida "diff'ning diff'i". Bitta nozik joy: ma'lumotnoma `--range-diff=<oldingi uch>` ni ham ruxsat beradi, lekin unda eski seriya "ikki versiyaning **umumiy asosi**dan" hisoblanadi. Bizda faqat oxirgi commit o'zgargan, umumiy asos esa `620180c` bo'lib qoladi — natijada birinchi patch "yangi qo'shilgan" (`-:  ------- > 1:  620180c`) ko'rinardi. Shuning uchun **diapazonni aniq bering** (`origin/main..limit-v1`).

Yangi versiyani eski suhbatga javob sifatida yuborish uchun `--in-reply-to=<eski cover letter'ning Message-ID'si>`. `--thread` qanday sarlavhalar qo'shishini ko'raylik:

```bash
$ git format-patch --stdout --thread --cover-letter origin/main | grep -E '^(Subject|Message-ID|In-Reply-To|References):'
Message-ID: <cover.1791462531.git.sevara@example.com>
Subject: [PATCH 0/2] *** SUBJECT HERE ***
Message-ID: <620180cf7b5127566886e0022ea0cd6179f991fd.1791462531.git.sevara@example.com>
In-Reply-To: <cover.1791462531.git.sevara@example.com>
References: <cover.1791462531.git.sevara@example.com>
Subject: [PATCH 1/2] tarix() ga limit qo'shish
...
```

`shallow` (standart) uslubda har patch cover letter'ga javob bo'ladi; `--thread=deep` da har biri oldingisiga. Ogohlantirish (ma'lumotnoma): `git send-email` o'zi ham standart bo'yicha thread qiladi — ikkalasi bir vaqtda qilmasin.

### Xatni yuborish: `git send-email` (faqat tushuntirish)

Patch faylini email dasturiga **nusxalab qo'yish** ko'pincha buziladi: "aqlli" klientlar qator o'tishlari va bo'sh joylarni o'zgartiradi (`format-patch` ma'lumotnomasi Gmail veb-interfeysi qatorlarni o'rashini o'chirib bo'lmasligini, Thunderbird `format=flowed` bilan patch'ni yaroqsiz qilishini aytadi). Shuning uchun Git ikki vosita beradi.

**1. `git send-email`** — patch'larni to'g'ridan-to'g'ri SMTP orqali yuboradi. Avval sozlama (`~/.gitconfig` dagi `[sendemail]` bo'limi; ma'lumotnomadagi Gmail misoli):

```ini
[sendemail]
	smtpEncryption = ssl
	smtpServer = smtp.gmail.com
	smtpUser = yourname@gmail.com
	smtpServerPort = 465
```

Parolni config fayliga **yozmang**. Ma'lumotnomaga ko'ra birinchi yuborishda parol so'raladi va credential helper sozlangan bo'lsa ([30-bob](30-ssh-va-credential.md)) saqlanadi. Gmail oddiy parolni qabul qilmaydi — ilovaga xos parol yoki OAuth2.0 (`smtpAuth = OAUTHBEARER`) kerak; Outlook faqat `XOAUTH2`. Pro Git'dagi misolda (2-nashr) `[imap]` bo'limida `pass = ...` ochiq yozilgan — buni takrorlamang.

Ma'lumotnomadagi tavsiya etilgan ketma-ketlik:

```bash
$ git format-patch --cover-letter -M origin/main -o outgoing/
$ # outgoing/0000-* ni tahrirlash: mavzu va kirish matni
$ git send-email outgoing/*
```

Bu qo'llanmada hech qanday xat yuborilmagan. Mavjud opsiyalarni ko'rish (chiqish qisqartirilgan):

```bash
$ git send-email -h
git send-email [<options>] <file|directory>
git send-email [<options>] <format-patch options>
git send-email --dump-aliases
git send-email --translate-aliases

  Composing:
    --from                  <str>  * Email From:
    --[no-]to               <str>  * Email To:
    --[no-]cc               <str>  * Email Cc:
...
    --[no-]annotate                * Review each patch that will be sent in an editor.
    --compose                      * Open an editor for introduction.
...
  Administering:
    --confirm               <str>  * Confirm recipients before sending;
                                     auto, cc, compose, always, or never.
    --quiet                        * Output one line of info per email.
    --dry-run                      * Don't actually send the emails.
    --[no-]validate                * Perform patch sanity checks. Default on.
...
```

Muhimlari:

| Opsiya | Ma'nosi |
| --- | --- |
| `--to=<manzil>` | Asosiy qabul qiluvchi — odatda pochta ro'yxati yoki maintainer (`sendemail.to`) |
| `--cc=<manzil>` | Nusxa; mas'ul odamlar |
| `--annotate` | Yuborishdan oldin har patch'ni muharrirda ko'rib chiqish |
| `--compose` | Kirish xatini muharrirda yozish (cover letter o'rniga) |
| `--in-reply-to=<id>` | Seriyani mavjud suhbatga javob qilish |
| `--suppress-cc=<tur>` | Avtomatik Cc'ni o'chirish: `author`, `self`, `sob`, `cc`, `body`, `all`... Standart bo'yicha `Signed-off-by` va `Cc:` qatorlaridagi odamlar Cc'ga qo'shiladi (`--signed-off-by-cc`) |
| `--confirm=<rejim>` | Yuborishdan oldin tasdiq so'rash (`always` — har doim) |
| `--dry-run` | Hamma narsani qiladi, lekin xatni yubormaydi |
| `--validate` | Tekshiruvlar: `sendemail-validate` hook'i, 998 belgidan uzun qatorlar (standart yoqilgan) |

`send-email` argument sifatida fayl, papka yoki to'g'ridan-to'g'ri **revision diapazoni** oladi — oxirgisida o'zi `format-patch`ni chaqiradi. Lekin fayllar bilan ishlash yaxshiroq: yuborishdan oldin ko'rib chiqasiz.

**2. `git imap-send`** — Pro Git'dagi ikkinchi yo'l: patch'larni IMAP serverdagi **Drafts** (qoralamalar) papkasiga joylaydi (`cat *.patch | git imap-send`), keyin siz pochta dasturida `To:` ni to'ldirib, o'zingiz yuborasiz. Sozlama — `[imap]` bo'limi (`folder`, `host`, `user`).

Pro Git va ma'lumotnoma maslahati: birinchi marta haqiqiy ro'yxatga yuborishdan oldin **o'zingizga** yuboring, xatni mbox faylga saqlab, toza branch'da `git am` bilan qo'llab ko'ring. Qo'llanmasa — yoki patch'ning o'zi eskirgan (rebase qilib qayta yarating), yoki pochta dasturingiz bo'sh joylarni buzgan. Mashq uchun sandbox va turli pochta dasturlari bo'yicha qo'llanma: <https://git-send-email.io> (tashqi sayt).

## Muhandislik nuqtai nazari: qaysi holatda qaysi yo'l

| | Kichik xususiy jamoa | Boshqariladigan jamoa | Fork + so'rov | Email |
| --- | --- | --- | --- | --- |
| Asosiy repo'ga yozish | Ha, hammada | Ha, lekin `main`ga faqat integrator | Yo'q | Yo'q |
| Ish qayerga yuboriladi | `origin/main` | Serverdagi jamoaviy branch | O'z fork'ingiz | Pochta ro'yxati |
| Birlashtirishni kim qiladi | Push qiluvchi (o'zi) | Integrator | Maintainer | Maintainer (`git am`) |
| So'rov shakli | Kerak emas | Xabar: "branch tayyor" | `request-pull` yoki PR | Patch xatlari (+ cover letter) |
| Tarix maintainer'ga qanday yetadi | O'zi push qiladi | Branch to'liq, merge'lar bilan | Branch to'liq | Faqat merge'siz commit'lar, yangi hash bilan |
| Eskirganda | `fetch` + `merge`/`rebase` | Branch'ni yangilab push | Rebase + `--force-with-lease` yoki `-v2` branch | Rebase + `format-patch -v2` |

Umumiy amaliy qoidalar:

- **Bir mavzu — bir topic branch.** Ikkinchi mavzuni birinchisining ustiga qurmang (agar haqiqatan unga bog'liq bo'lmasa). Maintainer har birini alohida qabul qilsin yoki rad etsin.
- **Asos — eng yangi upstream.** Yuborishdan oldin `git fetch` va kerak bo'lsa rebase. Konfliktni maintainer emas, siz hal qiling.
- **E'lon qilingan branch'ni qayta yozish — faqat o'zingizniki bo'lsa.** Jamoaviy `hisobot` kabi branch'larda rebase qilmang — Javohir uning ustiga ish qurgan ([24-bob](24-rebase.md)). Fork'dagi shaxsiy topic — boshqa gap.
- **Integratsiya branch'iga `main`ni odat bo'yicha merge qilmang.** Bu [31-bob](31-branch-workflowlari.md)dagi "pastga faqat aniq sabab bilan" qoidasi. Kichik jamoada `main`ni push'dan oldin merge qilish — sabab bor; topic'ga "har ehtimolga qarshi" merge — yo'q.
- **Loyiha qoidalarini o'qing.** `CONTRIBUTING.md`, `SubmittingPatches`: qaysi branch'dan boshlash, Signed-off-by kerakmi, patch'lar qaysi ro'yxatga, qanday prefiks bilan.

## Muhandislik nuqtai nazari: ichkarida nima bo'ladi

| Amal | Git'da |
| --- | --- |
| `push -u origin a:b` | `refs/heads/a` → serverdagi `refs/heads/b`; `.git/config` ga `branch.a.remote`, `branch.a.merge = refs/heads/b` |
| `switch <nom>` (lokal yo'q, `origin/<nom>` bor) | `origin/<nom>` dan yangi branch + upstream sozlamasi |
| `[remote rejected] ... (hook declined)` | Server `update`/`pre-receive` hook'i nol bo'lmagan kod qaytardi; ref o'zgarmadi |
| `merge --squash` | Index va working tree yangilanadi; `.git/SQUASH_MSG` yoziladi; `MERGE_HEAD` yo'q, keyingi commit'ning bitta otasi |
| `request-pull` | `git ls-remote <URL>` bilan commit'ni qidiradi; `shortlog` va `diff --stat` chiqaradi; hech narsa yubormaydi |
| `format-patch` | Har merge bo'lmagan commit → bitta mbox xat; muallif `From:`/`Date:` ga, sarlavha `Subject:` ga, blob hash'lari `index` qatoriga |
| `send-email` | Patch fayllarini o'qiydi, sarlavhalarni to'ldiradi, SMTP (yoki `sendmailCmd`) orqali yuboradi |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Push rad etilganda `--force` | Hamkasbning commit'lari serverdan yo'qoladi | `git fetch` + `merge` (yoki `pull --rebase`), testlar, keyin oddiy `push` |
| Bir nechta mavzuni bitta branch'da yuborish | Maintainer birini olib, boshqasini rad eta olmaydi | Har mavzu — `origin/main`dan alohida topic branch |
| Fork'ga `main`ni push qilib so'rov yuborish | Ish rad etilsa yoki cherry-pick qilinsa, `main`ingizni orqaga qaytarishga to'g'ri keladi | Topic branch'ni push qiling, `main` faqat `origin/main`ni kuzatsin |
| `git request-pull origin/main fork` (branch nomisiz) | Xatda branch bo'sh, `warn: ... pushed 'HEAD'`, chiqish kodi 1 | `git request-pull origin/main fork <branch>` |
| Jamoaviy branch'ni rebase qilib majburan push | Uning ustiga ishlagan hamkasbda ikki nusxali commit'lar | Jamoaviy branch'da faqat merge; rebase — shaxsiy topic'da |
| Rebase'dan keyin `git push -f` | Fork'ga boshqa joydan (masalan maintainer) qo'shilgan commit bilmasdan o'chadi | `git push --force-with-lease` yoki yangi `-v2` branch |
| Patch'ni `git diff > x.patch` bilan yuborish | Muallif, sana, xabar yo'qoladi; maintainer qo'lda commit qilishi kerak | `git format-patch` |
| Patch matnini pochta dasturiga nusxalash | Qator o'tishlari va bo'sh joylar buziladi, patch qo'llanmaydi | `git send-email` yoki `git imap-send`; avval o'zingizga sinov xati |
| Commit xabarida `---` qatori yoki chekinishsiz diff | `git am` xabarni shu joyda kesadi yoki diff'ni qo'llab yuboradi | Bunday matnni chekinish bilan yozing |
| `---` dan keyingi izohni commit xabariga yozish | "Hi, bu mening birinchi patch'im" tarixda abadiy qoladi | Vaqtinchalik izohlar — `---` va `diff --git` orasiga |
| `--range-diff=<eski uch>` (bitta commit) | Umumiy asos noto'g'ri hisoblanib, o'zgarmagan patch'lar "yangi" ko'rinadi | `--range-diff=<asos>..<eski uch>` |
| SMTP parolini `~/.gitconfig` ga yozish | Parol ochiq matnda; dotfile'lar bilan tarqalib ketishi mumkin | Credential helper yoki OAuth2.0 |
| `format-patch -s` "commit'ni imzolaydi" deb o'ylash | Faqat xatga qo'shadi; ma'nosi — DCO tasdig'i | Loyiha talab qilsa `git commit -s`; ma'nosini bilib qo'shing |

## Amaliyot

1. Bare server va ikki klon bilan kichik jamoa stsenariysini takrorlang. Ikkinchi dasturchi topic branch'da uchta commit qilsin. `git log --no-merges topic..origin/main` va `git log topic..origin/main` farqini tushuntiring. Topic va `origin/main`ni ikki xil tartibda merge qilib, `main^{tree}` hash'lari bir xil ekanini ko'rsating.
2. Bare repo'ga `main`ni himoya qiladigan `update` hook'ini qo'ying. Ikki kishi `hisobot` branch'ida navbatma-navbat ishlasin (`git switch hisobot` avtomatik kuzatuvchi branch yaratishini ko'ring). Uchinchi kishi o'z `eksport` branch'ini `git push -u origin eksport:eksport-ish` bilan boshqa nomga push qilsin; `git branch -vv` va `.git/config` dagi `branch.eksport.merge` qiymatini tekshiring.
3. Fork stsenariysi: `clone --bare` bilan fork yarating, topic'ni push qiling. `git request-pull` ni (a) branch nomisiz, (b) remote nomi + branch bilan, (c) `branch.<nom>.description` qo'yib chiqaring. Har birining chiqish kodini (`echo $?`) yozing.
4. Upstream'da topic'ingiz bilan konflikt qiladigan commit qiling. Topic'ni rebase qilib, konfliktni hal qiling va avval oddiy `push`, keyin `--force-with-lease` bilan yuboring. Fork'ga boshqa klondan bitta commit qo'shib, `--force-with-lease` endi nima deyishini ko'ring.
5. `merge --squash` bilan v2 branch yarating. `.git/SQUASH_MSG`, `git cat-file -p HEAD` dagi `parent` qatorlari sonini va `git merge --no-commit` natijasini (`.git/MERGE_HEAD` bormi?) solishtiring.
6. Ikki commit'li seriya uchun `format-patch --cover-letter -o outgoing/` qiling. Cover letter'ni to'ldiring, birinchi patch'ga `---` dan keyin izoh yozing va boshqa klonda `git am` bilan qo'llang — izoh qayerga ketdi?
7. Xabarida `---` qatori va `diff -` bilan boshlanadigan qator bo'lgan commit yarating. `format-patch | git am` dan keyin xabarning qaysi qismi qolganini ko'ring; keyin o'sha qatorlarni chekinish bilan yozib, qayta sinang.
8. (Qiyinroq) Seriyaning v1'ini branch sifatida saqlang, `rebase -i` bilan bitta commit xabarini va boshqasining kodini o'zgartiring. `format-patch -v2 --cover-letter --range-diff=...` ni ikki xil (`<eski uch>` va `<asos>..<eski uch>`) shaklda yarating va natijani solishtiring. `--base=auto` ishlashi uchun nima qilish kerakligini aniqlang va `base-commit:` qatorini oling. `git send-email --dry-run` ni **ishlatmasdan**, `git send-email -h` bo'yicha qaysi opsiyalar bilan seriyani maintainer'ga, ro'yxatni Cc qilib, o'zingizni Cc'dan chiqarib yuborishni yozing.

## Rasmiy hujjat

- Pro Git — Contributing to a Project: <https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project>
- `git format-patch`: <https://git-scm.com/docs/git-format-patch>
- `git send-email`: <https://git-scm.com/docs/git-send-email>
- `git imap-send`: <https://git-scm.com/docs/git-imap-send>
- `git request-pull`: <https://git-scm.com/docs/git-request-pull>
- `git am` (CAVEATS — xabar qayerda kesiladi): <https://git-scm.com/docs/git-am>
- `git merge` (`--squash`, `--no-commit`): <https://git-scm.com/docs/git-merge>
- `git push` (`--force-with-lease`, refspec): <https://git-scm.com/docs/git-push>
- `git range-diff`: <https://git-scm.com/docs/git-range-diff>
- `githooks` (`update`, `sendemail-validate`): <https://git-scm.com/docs/githooks>
- Git loyihasining patch yuborish qo'llanmasi (`SubmittingPatches`): <https://git-scm.com/docs/SubmittingPatches>
