# 23 — Branch'larni boshqarish

[← Oldingi: Konfliktlar](22-konfliktlar.md) · [Mundarija](README.md) · [Keyingi: Rebase →](24-rebase.md)

## Tushuncha

[20–22-boblarda](20-branch-bu-ref.md) branch'larni yaratdik, birlashtirdik va konfliktlarni hal qildik. Branch'lardan har kuni foydalana boshlaganingizda, ular tez ko'payadi: har vazifa, har tuzatish, har tajriba uchun bittadan. Bir necha haftadan keyin `git branch` o'nlab nomni chiqaradi va savollar tug'iladi: qaysilari allaqachon qo'shilgan? Qaysi birida hali saqlanmagan ish bor? Bu branch serverda bormi? Nomi noto'g'ri bo'lsa nima qilish kerak?

Bu bob — shu savollarga javob beradigan vositalar. Ularning deyarli hammasi bitta buyruqda: `git branch`. Pro Git aytganidek, u branch yaratish va o'chirishdan ancha ko'proq ish qiladi:

| Vazifa | Buyruq |
| --- | --- |
| Ro'yxat, oxirgi commit, upstream bilan farq | `git branch`, `-v`, `-vv`, `-a`, `-r` |
| Qo'shilgan / qo'shilmagan branch'lar | `--merged`, `--no-merged` |
| Commit qaysi branch'larda bor | `--contains`, `--no-contains`, `--points-at` |
| Saralash, filtr, o'z formatingiz | `--list <naqsh>`, `--sort`, `--format` |
| O'chirish | `-d`, `-D`, `-d -r`, `--delete-merged` (2.56 da yangi) |
| Nomini o'zgartirish, nusxalash, ko'chirish | `-m`, `-M`, `-c`, `-C`, `-f` |
| Tavsif | `--edit-description` |

Asosiy model o'sha-o'sha: **branch — `.git/refs/heads/` dagi kichik fayl, ichida commit hash'i** ([17-bob](17-reflar-va-head.md), [20-bob](20-branch-bu-ref.md)). Boshqarish buyruqlari faqat shu fayllar (va ularga bog'liq reflog hamda `.git/config` bo'limlari) bilan ishlaydi. Commit'larning o'zi hech qachon o'zgarmaydi. Bob davomida har buyruqdan keyin `.git` ichida aynan nima o'zgarganini ko'ramiz.

## Nega shunday: nega "qo'shilgan" degan savolga Git aniq javob bera oladi

`git branch --merged` "bu branch'ning ishi allaqachon `main`da bormi?" degan savolga javob beradi. Buning uchun Git fayllarni solishtirmaydi, faqat **graf**ga qaraydi: branch uchidagi commit `main`dan orqaga yurib yetib boriladigan bo'lsa (ya'ni u `main`ning ajdodi bo'lsa — [21-bob](21-branch-va-merge.md)), branch qo'shilgan. Branch'ning hamma commit'i `main` tarixida bor, demak uni o'chirsangiz, hech bir commit "yetimga" aylanmaydi.

Shuning uchun Git `-d` (xavfsiz o'chirish) va `-D` (majburiy o'chirish) ni ajratadi: xavfsiz o'chirish aynan shu graf tekshiruvini qiladi va saqlanmagan ishni yo'qotishingizga yo'l qo'ymaydi.

Bu tekshiruvning teskari tomoni ham bor: Git **mazmunni** emas, **tarixni** tekshiradi. [21-bobdagi](21-branch-va-merge.md) `--squash` yoki [24-bobdagi](24-rebase.md) rebase'dan keyin o'zgarishlar `main`da bo'lsa ham, commit'lar boshqa (yangi hash'li) bo'lgani uchun Git branch'ni "qo'shilmagan" deb hisoblaydi. Buni bob davomida yodda tuting.

## Kod: ro'yxat — `git branch`, `-v`

Sinov repo'si (yaratilishi Pro Git ssenariysiga o'xshaydi: `iss53` merge qilingan, `testing` va `feature/qidiruv` — yo'q):

```text
$ git log --oneline --decorate --graph --all
* 8f480b5 (feature/qidiruv) Qidiruv
| * 6feafda (testing) Test fayllari
|/
*   ea1ac76 (HEAD -> main, feature/login) Merge branch 'iss53'
|\
| * 596c833 (iss53) Footer [issue 53]
|/
* d0067f5 Ilova karkasi
* f584fda Boshlanish
```

Argumentsiz `git branch` — lokal branch'lar ro'yxati:

```text
$ git branch
  feature/login
  feature/qidiruv
  iss53
* main
  testing
```

`*` — joriy branch, ya'ni `HEAD` ishora qilayotgan branch ([20-bob](20-branch-bu-ref.md)). Hozir commit qilsangiz, aynan `main` oldinga siljiydi. Rangli terminalda joriy branch yashil bo'ladi; boshqa **worktree**'da ochilgan branch'lar esa `+` belgisi va havorang bilan ko'rsatiladi ([49-bob](49-worktree-va-katta-repo.md)).

Standart tartib — to'liq ref nomi bo'yicha alifbo (`refs/heads/...`). Ichkarida ro'yxat — shunchaki `refs/heads/` ostidagi hamma ref:

```text
$ git for-each-ref --format="%(refname)" refs/heads/
refs/heads/feature/search
refs/heads/fix/123-email
refs/heads/main
refs/heads/sinov
```

(Bu chiqish bob oxiridagi holatdan olingan.) `git branch` — shu ma'lumotning odam uchun ko'rinishi.

**`-v`** — har branch uchidagi commit'ning qisqa hash'i va xabari:

```text
$ git branch -v
  feature/login   ea1ac76 Merge branch 'iss53'
  feature/qidiruv 8f480b5 Qidiruv
  iss53           596c833 Footer [issue 53]
* main            ea1ac76 Merge branch 'iss53'
  testing         6feafda Test fayllari
```

`feature/login` va `main` bir commit'da (`ea1ac76`) — `feature/login` endigina yaratilgan, unda hali ish yo'q. Branch'ning upstream'i bo'lsa, `-v` `[ahead 1]` kabi farqni ham qo'shadi, `-vv` esa upstream nomini ham ko'rsatadi — buni remote bo'limida ko'ramiz.

Joriy branch nomini skriptda olish uchun — `git branch --show-current` (detached HEAD'da bo'sh qator, [20-bob](20-branch-bu-ref.md)).

## Kod: `--merged` va `--no-merged`

```text
$ git branch --merged
  feature/login
  iss53
* main

$ git branch --no-merged
  feature/qidiruv
  testing
```

`--merged` — uchi **joriy commit'dan (`HEAD`) yetib boriladigan** branch'lar. `iss53` — merge commit `ea1ac76` ning ikkinchi otasi orqali yetib boriladi. `feature/login` — `HEAD` bilan bir joyda, u ham "qo'shilgan" (o'zida yangi narsa yo'q). `main` — o'zi.

`--no-merged` — teskarisi: uchida `HEAD` tarixida yo'q commit bor branch'lar.

Pro Git maslahati: `--merged` ro'yxatidagi `*`siz branch'larni odatda bemalol `git branch -d` bilan o'chirish mumkin — ularning ishi allaqachon boshqa branch'da, hech narsa yo'qolmaydi:

```text
$ git branch -d iss53
Deleted branch iss53 (was 596c833).
```

`--no-merged`dagisi esa rad etiladi:

```text
$ git branch -d testing
error: the branch 'testing' is not fully merged
hint: If you are sure you want to delete it, run 'git branch -D testing'
hint: Disable this message with "git config set advice.forceDeleteBranch false"
```

(Pro Git'da xabar `error: The branch 'testing' is not fully merged.` — katta harf va nuqta bilan, maslahat ham `hint:`siz. Hozirgi 2.56 chiqishi yuqoridagidek.)

### Boshqa branch'ga nisbatan

Argumentsiz `--merged`/`--no-merged` **joriy** branch'ga nisbatan ishlaydi. Commit yoki branch nomini bersangiz — o'shanga nisbatan, unga o'tmasdan. Pro Git'dagi misol: `testing`da turib "`main`ga nima qo'shilmagan?":

```text
$ git switch testing
Switched to branch 'testing'
$ git branch --no-merged main
  feature/qidiruv
* testing
```

Yana bir misol — `feature/qidiruv`ga nisbatan:

```text
$ git branch --merged iss53
  iss53
$ git branch --no-merged feature/qidiruv
  testing
```

`iss53` ning tarixi faqat o'zini o'z ichiga oladi (`main` undan keyingi merge commit'da). `feature/qidiruv` esa `main` ustidan ochilgan, shuning uchun unga nisbatan faqat `testing` qo'shilmagan.

Bir nechta filtrni birlashtirish mumkin: hujjat bo'yicha `--merged A --no-merged B` — A'dan yetib boriladigan, lekin B'dan yetib bo'lmaydigan branch'lar.

## Kod: `--contains`, `--no-contains`, `--points-at`

`--merged` "qaysi branch'lar shu commit **ichida**" deb so'rasa, `--contains` teskari savolni beradi: "**qaysi branch'larda** shu commit bor?" (ya'ni uchi shu commit'ning avlodi bo'lgan branch'lar):

```text
$ git branch --contains 6feafda
  testing
$ git branch --contains HEAD
  feature/login
  feature/qidiruv
* main
  testing
```

Hujjatdagi `NOTES` bo'limi to'rt opsiyaning maqsadini ajratib beradi:

| Opsiya | Qaysi savolga javob | Odatiy foydalanish |
| --- | --- | --- |
| `--contains <commit>` | Qaysi branch'larda bu commit bor? | Commit'ni rebase yoki amend qilsangiz, qaysi branch'larga "e'tibor" kerak; xatoli commit qaysi relizlarga tushgan |
| `--no-contains <commit>` | Qaysilarida yo'q? | Tuzatish commit'i hali yetib bormagan branch'lar |
| `--merged [<commit>]` | Qaysilari to'liq shu commit ichida? | Xavfsiz o'chirish uchun nomzodlar |
| `--no-merged [<commit>]` | Qaysilarida hali qo'shilmagan ish bor? | Merge qilish uchun nomzodlar |

`--points-at <obyekt>` — aynan shu commit'da **turgan** branch'lar (ajdod/avlod emas, aniq tenglik):

```text
$ git branch --points-at HEAD
  fix/123-email
* main
```

(Bu chiqish keyingi bosqichdan: `fix/123-email` `main` turgan joyda yaratilgan.)

Git 2.56 relizida `git branch --contains` tezlashtirilgan: ilgari faqat `git tag --contains` ishlatadigan eslab qoluvchi (*memoized*) aylanib chiqish endi branch'lar uchun ham ishlatiladi — ko'p branch'li repo'larda sezilarli farq.

## Kod: naqsh, saralash va format

Bu bo'limdagi chiqishlar bobning keyingi bosqichidagi holatdan olingan: `feature/qidiruv` allaqachon `feature/search` ga, `testing` esa `sinov` ga qayta nomlangan (pastda ko'ramiz), `fix/123-email` va `fix/124-sana` qo'shilgan.

### `--list <naqsh>`

Ko'p branch'li repo'da ro'yxatni qisqartirish uchun shell uslubidagi naqsh (`*`, `?`):

```text
$ git branch --list "fix/*"
  fix/123-email
  fix/124-sana
$ git branch --list "*login*" "fix/1*"
  feature/login
  fix/123-email
  fix/124-sana
```

Bir nechta naqsh — "ulardan biriga mos" degani. Ikki muhim tuzoq:

1. **`--list`siz naqsh — branch yaratishga urinish.** Hujjat ogohlantiradi: naqsh berganda `--list` majburiy, aks holda argument yangi branch nomi deb tushuniladi:

   ```text
   $ git branch "fix/*"
   fatal: 'fix/*' is not a valid branch name
   hint: See 'git help check-ref-format'
   hint: Disable this message with "git config set advice.refSyntax false"
   ```

   Bu yerda `*` nomda ruxsat etilmagani uchun omad keldi ([20-bob](20-branch-bu-ref.md), nom qoidalari). `git branch fix` kabi oddiy so'z bo'lganda esa jimgina yangi branch yaratilardi.
2. **Naqshni qo'shtirnoqqa oling.** Aks holda shell `fix/*` ni joriy papkadagi fayl nomlariga almashtirib yuborishi mumkin.

Remote branch'lar uchun: `git branch -r -l "origin/fix*"`. Hujjat `-a` o'rniga `-r` ni tavsiya qiladi — `-a` bilan nomi tasodifan `origin/` bilan boshlanadigan lokal branch'lar ham aralashib ketadi.

### `--sort`

Kalitlar `git for-each-ref` bilan bir xil; `-` — kamayish tartibida. Eng foydalisi — oxirgi commit sanasi bo'yicha, "qaysi branch'larda yaqinda ish bo'lgan":

```text
$ git branch -v --sort=-committerdate
  feature/search 8f480b5 Qidiruv
  sinov          6feafda Test fayllari
  fix/123-email  ea1ac76 Merge branch 'iss53'
* main           ea1ac76 Merge branch 'iss53'
  feature/login  d0067f5 Ilova karkasi
  fix/124-sana   d0067f5 Ilova karkasi

$ git branch --sort=-refname
  sinov
* main
  fix/124-sana
  fix/123-email
  feature/search
  feature/login
```

Doimiy qilish — `git config branch.sort -committerdate`. `--sort` bir necha marta berilsa, **oxirgisi** asosiy kalit bo'ladi.

### `--format`

O'z ko'rinishingiz — `%(maydon)` o'rinbosarlari bilan (to'liq ro'yxat `git for-each-ref` hujjatida):

```text
$ git branch --format="%(refname:short) | %(objectname:short) | %(committerdate:short) | %(upstream:short) %(upstream:track)"
feature/search | 5a9d445 | 2026-10-07 | origin/feature/search [ahead 1]
fix/123-email | ea1ac76 | 2026-10-07 | origin/fix/123-email
main | ea1ac76 | 2026-10-07 | origin/main [behind 1]
sinov | 6feafda | 2026-10-07 |
```

`--format` bilan `*` belgisi va tekislash yo'qoladi — skriptlar uchun qulay. Skriptlarda baribir `git for-each-ref` afzal: u porcelain chiqish formati o'zgarishidan himoyalangan plumbing buyrug'i ([13-bob](13-plumbing-va-porcelain.md)).

`--column` — ro'yxatni ustunlarda (faqat `-v`siz rejimda):

```text
$ git branch --column
  feature/login    fix/123-email  * main
  feature/search   fix/124-sana     sinov
```

Doimiy — `column.branch` sozlamasi. Ro'yxat uzun bo'lsa, `git branch` pager'da ochiladi (`pager.branch` bilan boshqariladi).

## Kod: o'chirish — `.git` ichida nima yo'qoladi

`-d`dan oldin va keyin `.git`ga qaraymiz:

```text
$ ls .git/refs/heads .git/logs/refs/heads
.git/logs/refs/heads:
feature
main
testing

.git/refs/heads:
feature
main
testing

$ cat .git/refs/heads/testing
6feafdad974d4a81c8ec468a7375c852225b9f51
```

`testing` qo'shilmagan, shuning uchun majburiy o'chirish — `-D` (`--delete --force` ning qisqasi). **Ogohlantirish:** `-D` graf tekshiruvini o'tkazib yuboradi; branch'dagi qo'shilmagan commit'larga endi hech qaysi branch ishora qilmaydi.

```text
$ git branch -D testing
Deleted branch testing (was 6feafda).

$ ls .git/refs/heads .git/logs/refs/heads
.git/logs/refs/heads:
feature
main

.git/refs/heads:
feature
main
```

Ikki narsa o'chdi: ref fayli **va** branch'ning reflog'i (hujjat: "branch reflog'i bo'lsa, u ham o'chiriladi"). Commit esa joyida:

```text
$ git cat-file -t 6feafda
commit
$ git log --oneline -1 6feafda
6feafda Test fayllari
```

`(was 6feafda)` — Git o'chirishda hash'ni ataylab ko'rsatadi: xato qilgan bo'lsangiz, shu hash bilan branch'ni darhol qaytarish mumkin. Ekran allaqachon tozalangan bo'lsa ham, branch reflog'i o'chgan bo'lsa ham, `HEAD` reflog'i qoladi — u siz o'tgan har commit'ni eslaydi:

```text
$ git reflog -6
ea1ac76 HEAD@{0}: checkout: moving from testing to main
6feafda HEAD@{1}: checkout: moving from main to testing
ea1ac76 HEAD@{2}: checkout: moving from feature/qidiruv to main
8f480b5 HEAD@{3}: commit: Qidiruv
ea1ac76 HEAD@{4}: checkout: moving from main to feature/qidiruv
ea1ac76 HEAD@{5}: checkout: moving from testing to main

$ git branch testing 6feafda
$ git branch -v
  feature/login   ea1ac76 Merge branch 'iss53'
  feature/qidiruv 8f480b5 Qidiruv
* main            ea1ac76 Merge branch 'iss53'
  testing         6feafda Test fayllari
```

Branch tiklandi — u shunchaki yana 41 baytlik fayl ([20-bob](20-branch-bu-ref.md)). Lekin yetim commit'lar abadiy turmaydi: reflog yozuvlari muddati o'tgach `git gc` ularni tozalaydi ([18-bob](18-packfile-va-gc.md)). Tiklashning to'liq yo'llari — [42-bobda](42-reflog-va-tiklash.md).

### Nimani o'chirib bo'lmaydi

**Joriy branch'ni** — siz turgan branch'ni o'chirsangiz, `HEAD` mavjud bo'lmagan ref'ga ishora qilib qolardi:

```text
$ git branch -d main
error: cannot delete branch 'main' used by worktree at '/tmp/misol/kutubxona'
```

Xabar "worktree" deydi: tekshiruv hamma worktree'lar uchun bir xil — boshqa worktree'da ochiq branch'ni ham o'chirib bo'lmaydi ([49-bob](49-worktree-va-katta-repo.md)). Avval boshqa branch'ga o'ting. E'tibor bering, `main` ham maxsus emas: boshqa branch'ga (yoki detached HEAD'ga) o'tsangiz, Git `main`ni ham boshqa branch'lar kabi o'chiradi.

Git 2.56 da yana bir himoya qo'shilgan (reliz eslatmasi): faol `git bisect` jarayonida ishlatilayotgan branch'ni `-d` o'chirmaydi va sababini aytadi ([41-bob](41-blame-va-bisect.md)).

Mavjud bo'lmagan branch:

```text
$ git branch -d nomavjud
error: branch 'nomavjud' not found
```

Bir buyruqda bir nechta branch'ni o'chirish mumkin: `git branch -d fix/1 fix/2 fix/3`.

### `-d` aslida nimaga nisbatan tekshiradi

Hujjatdagi aniq qoida: `-d` uchun branch **o'z upstream'iga** to'liq qo'shilgan bo'lishi kerak; upstream sozlanmagan bo'lsa — `HEAD`ga. Upstream bilan farqni remote bo'limida ko'ramiz.

## Kod: nomini o'zgartirish — `-m`

Branch nomini o'zgartirish — `git branch -m <eski> <yangi>` (`--move`). Avval branch'ga tavsif qo'shamiz — bu `.git/config`da bo'lim yaratadi va qayta nomlashda nima bo'lishini ko'rsatadi:

```text
$ git branch --edit-description feature/qidiruv
$ # (tahrirlovchida bitta qator yozildi: "Qidiruv sahifasi: filtr va natijalar")
```

```text
$ git branch -m feature/qidiruv feature/search
$ cat .git/config
[core]
	...
[branch "feature/search"]
	description = Qidiruv sahifasi: filtr va natijalar\n

$ ls .git/refs/heads/feature .git/logs/refs/heads/feature
.git/logs/refs/heads/feature:
login
search

.git/refs/heads/feature:
login
search

$ cat .git/logs/refs/heads/feature/search
0000000000000000000000000000000000000000 ea1ac764709908dc5d6db42b71bd2c785804c4c7 Ali Valiyev <ali@example.com> 1791349500 +0500	branch: Created from HEAD
ea1ac764709908dc5d6db42b71bd2c785804c4c7 8f480b5896533bb23bef5e119b3eada27ad54276 Ali Valiyev <ali@example.com> 1791349560 +0500	commit: Qidiruv
8f480b5896533bb23bef5e119b3eada27ad54276 8f480b5896533bb23bef5e119b3eada27ad54276 Ali Valiyev <ali@example.com> 1791349740 +0500	Branch: renamed refs/heads/feature/qidiruv to refs/heads/feature/search
```

(`\n` — tahrirlovchida yozilgan qator oxiri; `git config` uni qiymat ichida shu ko'rinishda saqlaydi.)

Uchta narsa birga ko'chdi (hujjat: "config va reflog bilan birga"):

| Narsa | Oldin | Keyin |
| --- | --- | --- |
| Ref fayli | `refs/heads/feature/qidiruv` | `refs/heads/feature/search` (ichidagi hash o'sha) |
| Reflog | `logs/refs/heads/feature/qidiruv` | `logs/refs/heads/feature/search` + "renamed" yozuvi |
| Config | `[branch "feature/qidiruv"]` | `[branch "feature/search"]` (tavsif, upstream va h.k.) |
| Commit'lar | — | o'zgarmadi |

Reflog'dagi oxirgi yozuvda eski va yangi qiymat bir xil (`8f480b5 → 8f480b5`) — ko'rsatkich siljimadi, faqat nomi o'zgardi. Tarix ham saqlanib qoldi: `feature/search@{2}` hali ham "yaratilgan payt"ni ko'rsatadi.

**Joriy branch'ni** qayta nomlash uchun eski nomni yozish shart emas:

```text
$ git switch testing
Switched to branch 'testing'
$ git branch -m sinov
$ git branch --show-current
sinov
$ cat .git/HEAD
ref: refs/heads/sinov
```

Git `.git/HEAD`dagi symbolic ref'ni ham o'zi yangiladi. Bu yangi repo'da ham ishlaydi: `git init` dan keyin, birinchi commit'dan oldin ham `git branch -m main` qilish mumkin (`git init`ning o'zi shu maslahatni beradi — pastda).

### Mavjud nomga: `-M`

```text
$ git branch -m feature/search sinov
fatal: a branch named 'sinov' already exists
```

`-M` (`--move --force`) mavjud branch'ni **ustidan yozadi**. **Ogohlantirish:** ustidan yozilgan branch ko'rsatgan commit'lar, boshqa joydan yetib bo'lmasa, yetim qoladi — xuddi `-D` dagidek. Odatda bunga ehtiyoj yo'q.

### Nusxalash: `-c`

`-c` (`--copy`) — `-m` bilan bir xil semantika, faqat eski branch qoladi. Config va reflog ham nusxalanadi:

```text
$ git branch -c feature/search feature/search-v2
$ cat .git/config
...
[branch "feature/search"]
	description = Qidiruv sahifasi: filtr va natijalar\n
[branch "feature/search-v2"]
	description = Qidiruv sahifasi: filtr va natijalar\n

$ cat .git/logs/refs/heads/feature/search-v2
0000000000000000000000000000000000000000 ea1ac76... 	branch: Created from HEAD
ea1ac76... 8f480b5... 	commit: Qidiruv
8f480b5... 8f480b5... 	Branch: renamed refs/heads/feature/qidiruv to refs/heads/feature/search
8f480b5... 8f480b5... 	Branch: copied refs/heads/feature/search to refs/heads/feature/search-v2
```

Oddiy `git branch yangi eski` dan farqi shu: u faqat ref yaratadi (yangi, bo'sh reflog bilan, config'siz). `-c` esa branch'ni "to'liq" — tavsifi, upstream sozlamasi va tarixi bilan — ko'chiradi. `-C` — mavjud nom ustidan.

## Kod: branch'ni boshqa commit'ga surish — `-f`

`git branch` mavjud branch'ni jimgina qayta yozmaydi ([20-bob](20-branch-bu-ref.md)). `-f` (`--force`) bilan esa uni istalgan commit'ga ko'chiradi:

```text
$ git branch feature/login HEAD~1
fatal: a branch named 'feature/login' already exists
$ git branch -f feature/login HEAD~1
$ git branch -v
  feature/login     d0067f5 Ilova karkasi
  feature/search    8f480b5 Qidiruv
  feature/search-v2 8f480b5 Qidiruv
* main              ea1ac76 Merge branch 'iss53'
  sinov             6feafda Test fayllari
```

Bu — faqat bitta ref faylini qayta yozish, working tree'ga tegmaydi. Shuning uchun joriy branch'ni bu yo'l bilan surib bo'lmaydi (index va working tree bilan nomuvofiqlik paydo bo'lardi):

```text
$ git branch -f main HEAD~1
fatal: cannot force update the branch 'main' used by worktree at '/tmp/misol/kutubxona'
```

Joriy branch uchun mos vosita — `git reset` ([39-bob](39-reset-sirlari.md)). `-f` ham yetim commit qoldirishi mumkin: eski joyiga boshqa ref ishora qilmasa — reflog orqali tiklanadi.

## Kod: branch tavsifi

`--edit-description` tahrirlovchini ochadi va matnni `branch.<nom>.description` ga yozadi (yuqorida ko'rdik). Hujjat bo'yicha tavsifdan `format-patch` (muqova xati), `request-pull` va — yoqilgan bo'lsa (`merge.branchdesc`) — `merge` xabari foydalanadi. Ko'p qatorli matn ham mumkin. Bu ma'lumot faqat **lokal** `.git/config`da turadi: push qilinmaydi.

## Kod: remote bilan — `-vv`, `-r`, `-a`

Lokal bare repo'ni remote sifatida ulab ([27-bob](27-remote.md)), branch'larni upstream bilan push qilamiz:

```bash
$ git init --bare /tmp/misol/markaz.git
$ git remote add origin /tmp/misol/markaz.git
$ git push -u origin main
$ git push -u origin feature/search
$ git push -u origin fix/123-email
$ git push -u origin bad-branch-name
```

**`-vv`** — upstream nomi va u bilan farq:

```text
$ git branch -vv
  bad-branch-name 619d3ac [origin/bad-branch-name] Yomon nomli branch ishi
  feature/search  8f480b5 [origin/feature/search] Qidiruv
  fix/123-email   ea1ac76 [origin/fix/123-email] Merge branch 'iss53'
* main            ea1ac76 [origin/main] Merge branch 'iss53'
  sinov           6feafda Test fayllari
```

`feature/search`da commit qilib, push qilmasak:

```text
$ git branch -vv
  bad-branch-name 619d3ac [origin/bad-branch-name] Yomon nomli branch ishi
  feature/search  5a9d445 [origin/feature/search: ahead 1] Qidiruv: filtr
  ...
$ git branch -v
  bad-branch-name 619d3ac Yomon nomli branch ishi
  feature/search  5a9d445 [ahead 1] Qidiruv: filtr
  ...
```

`ahead 1` — lokal'da serverda yo'q bitta commit bor. `behind N` — teskarisi, `gone` — upstream serverda o'chirilgan. Bu raqamlar **oxirgi `fetch`** paytidagi `origin/...` holati bo'yicha hisoblanadi, serverga so'rov yuborilmaydi. Upstream, `ahead`/`behind` va ularni sozlash (`--set-upstream-to`, `--unset-upstream`, `--track`) — [28-bobda](28-remote-branchlar.md).

**`-r`** — faqat remote-tracking branch'lar, **`-a`** — hammasi:

```text
$ git branch -r
  origin/bad-branch-name
  origin/feature/search
  origin/fix/123-email
  origin/main
$ git branch -a
  bad-branch-name
  feature/search
  fix/123-email
* main
  sinov
  remotes/origin/bad-branch-name
  remotes/origin/feature/search
  remotes/origin/fix/123-email
  remotes/origin/main
```

## Kod: remote'dagi branch nomini o'zgartirish

Pro Git ssenariysi: `bad-branch-name` nomi noto'g'ri, uni lokal'da ham, serverda ham `corrected-branch-name` qilish kerak, tarix saqlansin.

**1. Lokal nomini o'zgartirish:**

```text
$ git branch --move bad-branch-name corrected-branch-name
$ git branch -vv
  corrected-branch-name 619d3ac [origin/bad-branch-name] Yomon nomli branch ishi
  ...
$ git config --get-regexp "^branch\.corrected"
branch.corrected-branch-name.remote origin
branch.corrected-branch-name.merge refs/heads/bad-branch-name
```

Muhim kuzatuv: config bo'limi yangi nomga ko'chdi, lekin **upstream hali ham eski nom** (`merge = refs/heads/bad-branch-name`). `-m` faqat lokal ishni qiladi, serverga hech narsa yubormaydi.

**2. Yangi nom bilan push va upstream'ni yangilash:**

```text
$ git push --set-upstream origin corrected-branch-name
To /tmp/misol/markaz.git
 * [new branch]      corrected-branch-name -> corrected-branch-name
branch 'corrected-branch-name' set up to track 'origin/corrected-branch-name'.

$ git branch --all
  corrected-branch-name
  ...
  remotes/origin/bad-branch-name
  remotes/origin/corrected-branch-name
  ...
```

Serverda endi **ikkala** nom bor — Git'da "branch'ni serverda qayta nomlash" degan bitta amal yo'q, bu yangi yaratish + eskisini o'chirish.

**3. Eski nomni serverdan o'chirish:**

```text
$ git push origin --delete bad-branch-name
To /tmp/misol/markaz.git
 - [deleted]         bad-branch-name

$ git branch -vv
  corrected-branch-name 619d3ac [origin/corrected-branch-name] Yomon nomli branch ishi
  ...
```

Pro Git ogohlantirishi: **boshqalar ishlatayotgan branch'ni qayta nomlamang.** Hamkasblaringizda eski nomli lokal branch va eski upstream qoladi; ular `fetch --prune`dan keyin `[gone]` ko'radi va o'zlari ham qayta nomlashi kerak bo'ladi (pastdagi `main` misolida ko'ramiz).

## Kod: remote bilan o'chirish

### `-d` va upstream

`-d` qoidasini endi to'liq ko'rish mumkin — branch o'z **upstream'iga** qo'shilgan bo'lishi kerak:

```text
$ git branch -d feature/search
error: the branch 'feature/search' is not fully merged
hint: If you are sure you want to delete it, run 'git branch -D feature/search'
...

$ git branch -d corrected-branch-name
warning: deleting branch 'corrected-branch-name' that has been merged to
         'refs/remotes/origin/corrected-branch-name', but not yet merged to HEAD
Deleted branch corrected-branch-name (was 619d3ac).
```

`feature/search` — `ahead 1`: push qilinmagan commit bor, `-d` uni himoya qildi. `corrected-branch-name` esa `main`ga qo'shilmagan bo'lsa ham o'chirildi — uning hamma commit'i serverda (`origin/corrected-branch-name`) saqlangan, lokal nusxa keraksiz. Git buni `warning:` bilan aytdi.

### Remote-tracking branch'ni o'chirish: `-d -r`

```text
$ git branch -d -r origin/corrected-branch-name
Deleted remote-tracking branch origin/corrected-branch-name (was 619d3ac).
$ git fetch origin
From /tmp/misol/markaz
 * [new branch]      corrected-branch-name -> origin/corrected-branch-name
```

`-d -r` faqat **lokal nusxani** (`refs/remotes/origin/...`) o'chiradi, serverdagi branch'ga tegmaydi — keyingi `fetch` uni qayta yaratdi. Hujjat: bu faqat serverda branch allaqachon yo'q bo'lganda yoki `fetch` uni olmaydigan qilib sozlanganda ma'noli. Serverda o'chirilgan branch'larning eski nusxalarini tozalashning odatiy yo'li — `git fetch --prune` yoki `git remote prune origin` ([28-bob](28-remote-branchlar.md)). Serverdagi branch'ni o'chirish esa — `git push origin --delete <nom>`.

### Git 2.56: `--delete-merged`

2.56 relizida `git branch`ga yangi opsiya qo'shildi: ishi allaqachon kuzatilayotgan remote branch'ga tushgan lokal branch'larni avtomatik o'chirish. Odatiy holat: branch `origin/main`ni kuzatadi (`--track origin/main`), ishi serverdagi `main`ga qo'shildi — lokal nusxa endi kerak emas.

```text
$ git switch -c fix/125-logo --track origin/main
Switched to a new branch 'fix/125-logo'
branch 'fix/125-logo' set up to track 'origin/main'.
$ git commit -m "Logo tuzatildi"
[fix/125-logo 7699e7d] Logo tuzatildi
$ git push origin fix/125-logo:main
To /tmp/misol/markaz.git
   ea1ac76..7699e7d  fix/125-logo -> main
$ git switch main

$ git branch -vv
  feature/search 5a9d445 [origin/feature/search: ahead 1] Qidiruv: filtr
  fix/123-email  ea1ac76 [origin/fix/123-email] Merge branch 'iss53'
  fix/125-logo   7699e7d [origin/main] Logo tuzatildi
* main           ea1ac76 [origin/main: behind 1] Merge branch 'iss53'
  sinov          6feafda Test fayllari
```

Avval `--dry-run` bilan — hech narsa o'chirilmaydi, faqat ro'yxat:

```text
$ git branch --dry-run --delete-merged origin
Would delete branch fix/125-logo (was 7699e7d).
$ git branch --delete-merged origin
Deleted branch fix/125-logo (was 7699e7d).
```

Argument — upstream naqshi: ref (`origin/main`), remote nomi (`origin` — uning `HEAD`i ko'rsatgan branch, bu yerda `origin/main`) yoki glob (`'origin/*'`). Qo'shimcha argumentlar lokal branch'larni cheklaydi: `git branch --delete-merged 'origin/*' 'fix/*'`.

Nega boshqalari o'chirilmadi? Hujjatdagi istisnolar:

| Branch | Nega qoldi |
| --- | --- |
| `main` | Joriy branch (worktree'da ochiq) |
| `fix/123-email` | U `origin/fix/123-email`ni kuzatadi va push uni aynan o'sha upstream'ga yozadi — "endigina pull qilingan" branch'dan ajratib bo'lmaydi |
| `feature/search` | Ishi upstream'ga hali tushmagan (`ahead 1`) — jimgina o'tkazib yuboriladi |
| `sinov` | Upstream'i yo'q |

Yana istisnolar: upstream ref'i yo'qolgan (`gone`) branch'lar, boshqa (o'chirilmayotgan) branch'ning lokal upstream'i bo'lgan branch'lar va `branch.<nom>.deleteMerged false` sozlangan branch'lar o'chirilmaydi. Oxirgisi — birinchi qismi qo'shilgandan keyin ham ishlashni davom ettirmoqchi bo'lgan branch uchun. `-d` bilan qo'lda o'chirishga bu sozlama ta'sir qilmaydi.

Shu bilan bog'liq filtr — `--forked <upstream>`: upstream'i berilgan branch yoki naqshga mos branch'lar ro'yxati.

```text
$ git branch --forked origin/main
  fix/125-logo
* main
```

(`--delete-merged`dan oldingi holat.) Yangi opsiya bo'lgani uchun eski Git versiyalarida ishlamaydi — skriptlarda buni hisobga oling.

## Kod: standart branch nomini almashtirish (`master` → `main`)

Pro Git bu yerda qattiq ogohlantiradi: `master`/`main` kabi asosiy branch nomini o'zgartirish repo ishlatadigan **integratsiyalar, servislar, yordamchi vositalar, build va reliz skriptlarini buzadi**. Avval jamoa bilan kelishing va repo'dagi eski nomga hamma havolalarni toping.

Eski uslubdagi repo — `master` bilan, serverga push qilingan, hamkasb klon qilgan:

```text
$ git init -b master
$ git commit -m "Boshlanish"
$ git push -u origin master
$ git branch --all
* master
  remotes/origin/master
```

**1. Lokal nomini o'zgartirish:**

```text
$ git branch --move master main
$ git branch -vv
* main e335a26 [origin/master] Boshlanish
$ cat .git/config
...
[branch "main"]
	remote = origin
	merge = refs/heads/master
```

**2. Yangi branch'ni serverga push:**

```text
$ git push --set-upstream origin main
To /tmp/misol/markaz.git
 * [new branch]      main -> main
branch 'main' set up to track 'origin/main'.

$ git fetch origin
$ git branch --all
* main
  remotes/origin/HEAD -> origin/master
  remotes/origin/main
  remotes/origin/master
```

Pro Git'dagi holat aynan shu: `master` serverda hali bor va `origin/HEAD` uni ko'rsatadi. Serverning o'zi ham `master`ni "asosiy" deb biladi — bare repo'ning `HEAD`i:

```text
$ git ls-remote origin
e335a263c47c7a3640f12e41c7fcebe549e3815a	HEAD
e335a263c47c7a3640f12e41c7fcebe549e3815a	refs/heads/main
e335a263c47c7a3640f12e41c7fcebe549e3815a	refs/heads/master
$ git --git-dir=/tmp/misol/markaz.git symbolic-ref HEAD
refs/heads/master
```

Serverdagi `HEAD` — "standart branch": `git clone` qaysi branch'ni ochishini shu hal qiladi.

**3. Eski nomni o'chirishga urinish — server rad etadi:**

```text
$ git push origin --delete master
remote: error: By default, deleting the current branch is denied, because the next
remote: 'git clone' won't result in any file checked out, causing confusion.
...
remote: error: refusing to delete the current branch: refs/heads/master
To /tmp/misol/markaz.git
 ! [remote rejected] master (deletion of the current branch prohibited)
error: failed to push some refs to '/tmp/misol/markaz.git'
```

Server o'zining standart branch'ini o'chirishga yo'l qo'ymaydi (`receive.denyDeleteCurrent`). Avval serverda standart branch'ni almashtirish kerak. Bare repo'da bu — `HEAD` symbolic ref'ini o'zgartirish; GitHub/GitLab'da — repo sozlamalaridagi "Default branch" ([36-bob](36-github-boshqaruv.md)):

```text
$ git --git-dir=/tmp/misol/markaz.git symbolic-ref HEAD refs/heads/main
$ git push origin --delete master
To /tmp/misol/markaz.git
 - [deleted]         master
$ git ls-remote origin
e335a263c47c7a3640f12e41c7fcebe549e3815a	HEAD
e335a263c47c7a3640f12e41c7fcebe549e3815a	refs/heads/main
```

**4. Lokal `origin/HEAD`ni yangilash:**

```text
$ git remote set-head origin --auto
'origin/HEAD' has changed from 'master' and now points to 'main'
$ git branch --all
* main
  remotes/origin/HEAD -> origin/main
  remotes/origin/main
```

Pro Git o'chirishdan **oldin** bajarilishi kerak bo'lgan ishlar ro'yxatini beradi: bog'liq loyihalar kodi va sozlamalari, test-runner konfiguratsiyasi, build va reliz skriptlari, repo hostingidagi standart branch, merge qoidalari va branch nomiga bog'liq boshqa sozlamalar, hujjatlardagi havolalar, eski branch'ga qaratilgan ochiq pull request'lar. Bizdagi tartib Pro Git'dagidan bitta qadam bilan farq qiladi: serverda standart branch'ni o'zgartirmasdan `master`ni o'chirib bo'lmaydi.

### Hamkasb tomonida

Hamkasbning klonida hali `master`:

```text
$ git branch -vv
* master e335a26 [origin/master] Boshlanish
$ git fetch --prune origin
From /tmp/misol/markaz
 - [deleted]         (none)     -> origin/master
   refs/remotes/origin/HEAD has become dangling after refs/remotes/origin/master was deleted
 * [new branch]      main       -> origin/main
$ git branch -vv
* master e335a26 [origin/master: gone] Boshlanish
```

`gone` — upstream serverda yo'q. GitHub hujjati standart branch qayta nomlangandan keyin hamkasblarga to'rt buyruqni tavsiya qiladi (`fetch` yuqorida bajarildi):

```text
$ git branch -m master main
$ git branch -u origin/main main
branch 'main' set up to track 'origin/main'.
$ git remote set-head origin --auto
'origin/HEAD' has changed from 'master' and now points to 'main'
$ git status -sb
## main...origin/main
```

GitHub'da branch'ni veb-interfeys orqali qayta nomlasangiz, GitHub ba'zi ishlarni o'zi qiladi (GitHub hujjati): eski nomli URL'lar yangisiga yo'naltiriladi, branch himoya qoidalari va ochiq PR'larning asosiy (base) branch'i yangilanadi. Lekin raw fayl URL'lari yo'naltirilmaydi va GitHub Actions workflow'lari eski nomga bog'langan bo'lsa, buziladi.

### Yangi repo'lar uchun: `init.defaultBranch`

`git init` birinchi branch'ni qanday nomlashi `init.defaultBranch` sozlamasiga bog'liq ([3-bob](03-birinchi-sozlash.md)). U sozlanmagan bo'lsa, Git 2.56 `master`dan foydalanadi va ogohlantiradi:

```text
$ git init
hint: Using 'master' as the name for the initial branch. This default branch name
hint: will change to "main" in Git 3.0. To configure the initial branch name
hint: to use in all of your new repositories, which will suppress this warning,
hint: call:
hint:
hint: 	git config --global init.defaultBranch <name>
hint:
hint: Names commonly chosen instead of 'master' are 'main', 'trunk' and
hint: 'development'. The just-created branch can be renamed via this command:
hint:
hint: 	git branch -m <name>
hint:
hint: Disable this message with "git config set advice.defaultBranchName false"
Initialized empty Git repository in /tmp/misol/yangi/.git/
```

`git init -b <nom>` (`--initial-branch`) bitta repo uchun nomni beradi. Git 3.0 da standart nom `main` bo'ladi (`BreakingChanges`).

## Muhandislik nuqtai nazari: branch'larni tartibli saqlash

- **Qo'shilgan branch'ni darhol o'chiring.** Pro Git ssenariysida har merge'dan keyin `git branch -d` bor. Ro'yxat qisqa bo'lsa, `--no-merged` haqiqatan ham "ochiq ishlar" ro'yxati bo'lib qoladi.
- **Muntazam tekshiring.** `git branch --merged main` — o'chirishga nomzodlar; `git branch -vv` dagi `gone` — serverda o'chirilgan, lokal'da qolganlar; `git branch --sort=-committerdate` — uzoq vaqt tegilmagan "unutilgan" branch'lar.
- **`-d`ni odat qiling, `-D`ni istisno.** `-d` rad etsa, bu signal: o'qing va tushuning. Squash yoki rebase bilan qo'shilgan branch'larda `-d` doim rad etadi (Git tarixni tekshiradi, mazmunni emas) — u holda `git log main..<branch>` va `git diff main...<branch>` bilan ish haqiqatan tushganini tekshirib, keyin `-D`.
- **Izchil nom prefikslari:** `feature/`, `fix/`, `release/` — `--list "fix/*"` va `--delete-merged ... 'fix/*'` kabi filtrlarni mumkin qiladi. Prefiks papka bo'lgani uchun `fix` va `fix/1` birga bo'la olmaydi ([20-bob](20-branch-bu-ref.md)).
- **Umumiy branch'larni qayta nomlash — jamoaviy qaror.** Shaxsiy, push qilinmagan branch'ni xohlagancha qayta nomlang; boshqalar ishlatayotganini — yo'q.
- **Server tomonda himoya.** Asosiy branch'larni tasodifiy o'chirish yoki majburiy push'dan himoya qilish — hosting sozlamalari (branch protection, [36-bob](36-github-boshqaruv.md)) yoki server hook'lari ([47-bob](47-hooklar.md)) vazifasi. Lokal `git branch` buni ta'minlay olmaydi.

## Muhandislik nuqtai nazari: hamma amal — ref amali

Bob xulosasi — har buyruq `.git` ichida nimaga tegadi:

| Buyruq | Ref fayli | Reflog | `.git/config` | Commit'lar |
| --- | --- | --- | --- | --- |
| `branch -d/-D <nom>` | o'chiriladi | o'chiriladi | `[branch "<nom>"]` bo'limi o'chiriladi | o'zgarmaydi (yetim qolishi mumkin) |
| `branch -m <eski> <yangi>` | ko'chiriladi | ko'chiriladi + "renamed" | bo'lim qayta nomlanadi | o'zgarmaydi |
| `branch -c <eski> <yangi>` | nusxalanadi | nusxalanadi + "copied" | bo'lim nusxalanadi | o'zgarmaydi |
| `branch -f <nom> <commit>` | qayta yoziladi | yangi yozuv | o'zgarmaydi | o'zgarmaydi (eski uch yetim qolishi mumkin) |
| `branch -d -r origin/<nom>` | `refs/remotes/...` o'chiriladi | o'chiriladi | — | o'zgarmaydi |
| `push origin --delete <nom>` | serverdagi `refs/heads/<nom>` o'chiriladi | — | — | o'zgarmaydi |
| `--edit-description` | — | — | `description` yoziladi | — |

Shu sababli skriptlarda `.git/refs` fayllarini qo'lda o'chirish yoki ko'chirish o'rniga shu buyruqlarni (yoki `git update-ref -d`, Git 2.56 dagi `git refs delete/rename`) ishlating: ular reflog va config'ni ham izchil saqlaydi, `packed-refs` va `reftable` formatlarida ham to'g'ri ishlaydi ([17-bob](17-reflar-va-head.md), [20-bob](20-branch-bu-ref.md)).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `-d` rad etganda o'ylamasdan `-D` | Qo'shilmagan yoki push qilinmagan commit'lar yetim qoladi | Avval `git log main..<branch>`; keyin qaror |
| Naqsh bilan `git branch fix` yozish (`--list`siz) | Yangi `fix` branch'i yaratiladi | `git branch --list "fix*"` |
| Squash/rebase'dan keyin `--merged`da branch yo'qligiga hayron bo'lish | Git tarixni tekshiradi, yangi hash'li commit'lar "boshqa" commit | `git diff main...<branch>` bilan mazmunni tekshirib, `-D` |
| `git branch -d -r origin/x` bilan serverdagi branch'ni o'chirdim deb o'ylash | Faqat lokal nusxa o'chadi, `fetch` uni qaytaradi | `git push origin --delete x` |
| Lokal `-m`dan keyin push'da eski upstream qolishi | `branch.<nom>.merge` hali eski nomni ko'rsatadi; push/pull chalkashadi | `git push -u origin <yangi>`, keyin eskisini `--delete` |
| `-M` yoki `-f` bilan mavjud branch ustidan yozish | Eski uchdagi commit'lar yetim qolishi mumkin | Avval `git branch -v`; kerak bo'lsa reflog orqali tiklash |
| Asosiy branch nomini kelishmasdan almashtirish | CI, skriptlar, PR'lar, hamkasblar klonlari buziladi | Pro Git ro'yxati bo'yicha tayyorgarlik, hamkasblarga yo'riqnoma |
| Serverdagi standart branch'ni o'zgartirmasdan uni o'chirishga urinish | Server rad etadi (`deletion of the current branch prohibited`) | Avval hosting'da "Default branch"ni almashtirish |
| Skriptda `git branch` chiqishini parse qilish | `*`, bo'sh joylar, rang, format o'zgarishi | `git for-each-ref --format=... refs/heads/` |

## Amaliyot

1. To'rtta branch'li repo yarating: biri merge qilingan, ikkitasi qo'shilmagan, biri `main` bilan bir joyda. `git branch --merged` va `--no-merged` natijasini oldindan qog'ozga yozing, keyin tekshiring. Nega "bir joyda" turgan branch `--merged`da?
2. Qo'shilmagan branch'ni `-d` bilan o'chirib ko'ring, keyin `-D` bilan o'chiring. `ls .git/refs/heads .git/logs/refs/heads` bilan nima yo'qolganini ko'ring. Branch'ni faqat `git reflog` dan topilgan hash bilan tiklang.
3. Branch'ga `--edit-description` bilan tavsif yozing, keyin uni `-m` bilan qayta nomlang. `.git/config`, ref fayli va reflog'dagi o'zgarishlarni jadvalga yozing. `-c` bilan nusxalang va farqni oddiy `git branch yangi eski` bilan solishtiring.
4. `git branch --contains <commit>` bilan "bu commit qaysi branch'larda bor" savoliga javob bering. Shu commit'ni o'z ichiga olmagan branch'larni `--no-contains` bilan toping.
5. `--format` va `--sort=-committerdate` bilan har branch uchun nom, oxirgi commit sanasi va upstream holatini chiqaradigan alias yozing ([12-bob](12-teglar-va-aliaslar.md)).
6. Lokal bare repo yarating va Pro Git ssenariysi bo'yicha `bad-branch-name` ni serverda ham `corrected-branch-name` ga almashtiring. Har qadamdan keyin `git branch -vv` va `git config --get-regexp "^branch\."` ni tekshiring — upstream qaysi qadamda yangilandi?
7. `--track origin/main` bilan branch oching, uning ishini serverdagi `main`ga push qiling va `git branch --dry-run --delete-merged origin` natijasini ko'ring. Shu branch uchun `branch.<nom>.deleteMerged false` qo'yib, natija qanday o'zgarishini tekshiring.
8. (Qiyinroq) `master` bilan bare repo va ikkita klon yarating. Birinchi klonda `master` → `main` o'tishini to'liq bajaring (server `HEAD`ini ham almashtirib, eski branch'ni o'chirib). Ikkinchi klonda `fetch --prune` dan keyingi `[gone]` holatini ko'ring va GitHub tavsiya qilgan buyruqlar bilan tuzating. Oxirida yangi `git clone` qaysi branch'ni ochishini tekshiring va nima uchunligini server `HEAD`i bilan tushuntiring.

## Rasmiy hujjat

- Pro Git — Branch Management: <https://git-scm.com/book/en/v2/Git-Branching-Branch-Management>
- `git branch` (`--merged`, `--contains`, `-m`, `-c`, `-d`, `--delete-merged`, NOTES): <https://git-scm.com/docs/git-branch>
- `git for-each-ref` (`--format` va `--sort` maydonlari): <https://git-scm.com/docs/git-for-each-ref>
- `git push` (`--delete`, `--set-upstream`): <https://git-scm.com/docs/git-push>
- `git remote` (`set-head`, `prune`): <https://git-scm.com/docs/git-remote>
- `git init` (`-b`, `init.defaultBranch`): <https://git-scm.com/docs/git-init>
- Git 2.56.0 reliz eslatmalari (`--delete-merged`): <https://github.com/git/git/blob/v2.56.0/Documentation/RelNotes/2.56.0.adoc>
- GitHub — Renaming a branch: <https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/renaming-a-branch>
