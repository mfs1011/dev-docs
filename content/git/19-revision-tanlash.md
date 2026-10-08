# 19 — Revision'larni tanlash

[← Oldingi: Packfile'lar va `gc`](18-packfile-va-gc.md) · [Mundarija](README.md) · [Keyingi: Branch — bu ko'rsatkich →](20-branch-bu-ref.md)

## Tushuncha

Git buyruqlarining ko'pi argument sifatida **revision** kutadi. **Revision** — Git'ga "qaysi obyekt haqida gapiryapmiz" deb aytishning bir usuli. Ko'pincha bu commit, lekin tree yoki blob ham bo'lishi mumkin (`git show HEAD:README.md` — fayl mazmuni). Rasmiy hujjat (`gitrevisions`) buni *extended SHA-1* sintaksisi deb ataydi: oxir-oqibat har qanday yozuv bitta obyekt nomiga — hash'ga — aylanadi.

Oldingi boblarda ko'rdik: har obyektning nomi — uning mazmunidan hisoblangan 40 belgili hash ([14-bob](14-obyektlar-blob.md)), commit o'z otasini biladi ([16-bob](16-commit-obyekti.md)), ref esa hash'ni saqlaydigan nom ([17-bob](17-reflar-va-head.md)). Revision sintaksisi shu uch narsaning ustiga qurilgan kichik "so'rov tili":

| Nimaga tayanadi | Misollar |
| --- | --- |
| Hash'ning o'zi | `cf44e98cf640...`, `cf44e98` |
| Ref nomi | `main`, `v1.0`, `HEAD`, `origin/main`, `@` |
| Reflog (ref qayerda bo'lgani) | `HEAD@{2}`, `main@{1}`, `main@{yesterday}`, `@{-1}` |
| Ota zanjiri | `HEAD^`, `HEAD~3`, `HEAD^2` |
| Obyekt turi va ichki yo'l | `v1.0^{commit}`, `HEAD^{tree}`, `HEAD:app.js`, `:app.js` |
| Xabar bo'yicha qidiruv | `:/Login`, `main^{/README}` |
| To'plam (diapazon) | `main..topic`, `main...topic`, `^main topic`, `HEAD^!` |

Ikki xil buyruq bor. `git show`, `git switch`, `git branch <nom> <start>` kabi buyruqlar **bitta** obyekt oladi. `git log`, `git rev-list` kabi buyruqlar esa tarixni **aylanib chiqadi** — ularga bitta revision bersangiz ham, ular shu commit'dan **yetib boriladigan** (*reachable*) hamma commit'larni oladi. Diapazon sintaksisi aynan shu ikkinchi turdagi buyruqlar uchun.

Bobdagi barcha misollar bitta repo'da. Uning tarixi:

```text
$ git log --oneline --graph --all
* cf44e98 (HEAD -> main) Versiya 1.1
*   a234310 Merge branch 'topic'
|\
| * 9efa969 (topic) Footer qo'shildi
* | 0ea1e3a Header yangilandi
|/
* a4c79c7 Login xatosi tuzatildi
* db0ee30 Login sahifasi
| * 7a3751b (experiment) Tajriba: kesh testlari
| * 74ff9bb Tajriba: kesh
|/
* be150f0 (tag: v1.0) README yozildi
* 39d613e Loyiha boshlandi
```

`v1.0` — annotated teg ([12-bob](12-teglar-va-aliaslar.md)), `a234310` — ikki otali merge commit (merge'ni [21-bobda](21-branch-va-merge.md) batafsil ko'ramiz).

## Nega shunday: nega bitta commit'ni o'nlab usulda atash mumkin

Hash — yagona va o'zgarmas nom, lekin odam uchun noqulay: uni eslab qolish ham, terish ham qiyin. Odam esa boshqacha o'ylaydi: "main'ning uchi", "bundan ikki commit oldin", "merge qilingan branch'ning oxirgi commit'i", "kecha ertalab main qayerda edi", "serverga hali yubormagan commit'larim". Git'ning revision tili — shu savollarning har birini to'g'ridan-to'g'ri hash'ga aylantirish usuli.

Bu imkoniyatlarning hammasi Git modelidan kelib chiqadi:

- har obyekt hash bilan nomlanadi → hash'ning boshini yozish yetarli, agar u yagona bo'lsa;
- ref — nom → hash xaritasi → branch va teg nomi hash o'rnini bosadi;
- har ref o'zgarishi reflog'ga yoziladi → ref'ning **o'tmishdagi** qiymatini so'rash mumkin;
- commit otasini saqlaydi → "otasi", "bobosi", "ikkinchi otasi" degan yo'nalishlar bor;
- commit graf (DAG) hosil qiladi → "A'dan yetib boriladi, B'dan yetib borilmaydi" degan to'plam savollari ma'noli.

Yangi tushuncha yo'q — faqat oldingi boblardagi modelni so'rash usuli.

## Kod: hash va uning qisqa shakli

To'liq hash har doim ishlaydi. Lekin uning boshini yozish ham yetarli — sharti ikkita: kamida **4 belgi** va repo'da shu bosh bilan boshqa obyekt **yo'q**:

```text
$ git rev-parse HEAD
cf44e98cf640a7821d82b65223bbad323b7de1cd

$ git show -s --oneline a4c79c7
a4c79c7 Login xatosi tuzatildi
$ git show -s --oneline a4c7
a4c79c7 Login xatosi tuzatildi

$ git rev-parse a4c
fatal: ambiguous argument 'a4c': unknown revision or path not in the working tree.
Use '--' to separate paths from revisions, like this:
'git <command> [<revision>...] -- [<file>...]'
```

Uch belgi Git uchun hash emas — u `a4c` degan ref yoki fayl qidiradi va topolmaydi.

`git rev-parse` — Pro Git aytganidek, kundalik buyruq emas, plumbing ([13-bob](13-plumbing-va-porcelain.md)): u har qanday revision'ni to'liq hash'ga aylantiradi. Ushbu bobda u asosiy asbob — har yozuv aslida qaysi obyektni bildirishini ko'rsatadi. Teskari yo'nalish — qisqa, lekin yagona shakl olish:

```text
$ git rev-parse --short HEAD
cf44e98
$ git rev-parse --short=12 HEAD
cf44e98cf640
$ git log --abbrev-commit --pretty=oneline -2
cf44e98 Versiya 1.1
a234310 Merge branch 'topic'
```

Standart qisqa uzunlik `core.abbrev` sozlamasidan keladi. U o'rnatilmagan bo'lsa, Git repo'dagi obyektlar soniga qarab uzunlikni o'zi tanlaydi (kichik repo'da 7 belgi) va kerak bo'lsa uzaytiradi — qisqa nom yagona bo'lib qolishi uchun:

```text
$ git config get core.abbrev
$ git -c core.abbrev=10 log --oneline -1
91f038a149 Yangi fayl
```

(`91f038a` — bob oxirida, upstream bo'limida qo'shiladigan commit.)

### Noaniq qisqa hash

Repo kattalashgani sari qisqa bosh takrorlanishi mumkin. Buni ko'rish uchun alohida repo'da 600 ta commit yaratdik (1800 obyekt) — ikki commit `7f9d` bilan boshlandi:

```text
$ git show 7f9d
error: short object ID 7f9d is ambiguous
hint: The candidates are:
hint:   7f9d6ab commit 2026-10-07 - commit 459
hint:   7f9d945 commit 2026-10-07 - commit 205
fatal: ambiguous argument '7f9d': unknown revision or path not in the working tree.
...

$ git rev-parse --disambiguate=7f9d
7f9d6ab921d42f2fb79b91533f4130f0a423f6f6
7f9d9453a5c5cfe06f33e131fc6e92dc9961bb5a
```

Git taxmin qilmaydi — nomzodlarni ko'rsatib, to'xtaydi. `--disambiguate=<bosh>` shu bosh bilan boshlanuvchi hamma obyektni chiqaradi.

Bir nozik joy: agar buyruq **commit** kutsa, Git nomzodlardan faqat commit'larni hisobga oladi. Shu repo'da `cfe7` bilan bir commit va bir blob boshlanadi:

```text
$ git cat-file -t cfe7
error: short object ID cfe7 is ambiguous
hint: The candidates are:
hint:   cfe7d9b commit 2026-10-07 - commit 39
hint:   cfe77e7 blob
fatal: Not a valid object name cfe7

$ git log --oneline -1 cfe7
cfe7d9b commit 39
```

`cat-file -t` har qanday obyektni qabul qiladi — noaniq. `log` esa faqat commit'dan boshlay oladi — blob'ni chetga surib, yagona commit'ni tanladi.

Pro Git eslatganidek, odatda 8–10 belgi loyiha ichida yagona bo'lishga yetadi: 2019-yilda Linux yadrosi repo'sida 7 milliondan ortiq obyekt bo'lgan va birinchi 12 belgisi bir xil bo'lgan ikki obyekt yo'q edi.

> **SHA-1 to'qnashuvi haqida.** Ikki **turli** obyektning to'liq hash'i tasodifan bir xil chiqishi ehtimoli amalda nolga teng (50% ehtimol uchun taxminan 2^80 obyekt kerak). Ataylab to'qnashuv yaratish esa 2017-yilda ko'rsatilgan (SHAttered); Git bunga qarshi himoyaga ega va SHA-256 ga o'tmoqda ([14-bob](14-obyektlar-blob.md)). Qisqa hash'dagi "noaniqlik" — bu boshqa narsa: to'liq hash'lar farqli, faqat ularning boshi bir xil.

### `git describe` chiqishi ham revision

```text
$ git describe experiment
v1.0-2-g7a3751b
$ git describe HEAD
v1.0-6-gcf44e98
$ git rev-parse v1.0-6-gcf44e98
cf44e98cf640a7821d82b65223bbad323b7de1cd
```

`v1.0-6-gcf44e98` — "eng yaqin teg `v1.0`, undan keyin 6 commit, hash `cf44e98`" ([12-bob](12-teglar-va-aliaslar.md)). Git bu satrni tushunadi: aslida `g` dan keyingi qisqa hash ishlatiladi.

## Kod: ref nomlari

Branch uchidagi commit'ni branch nomi bilan atash mumkin — `main` va `refs/heads/main` dagi hash bir xil narsa. Bir nomni turli to'liqlikda yozsa bo'ladi:

```text
$ git rev-parse main
cf44e98cf640a7821d82b65223bbad323b7de1cd
$ git rev-parse heads/main
cf44e98cf640a7821d82b65223bbad323b7de1cd
$ git rev-parse refs/heads/main
cf44e98cf640a7821d82b65223bbad323b7de1cd
$ git rev-parse @
cf44e98cf640a7821d82b65223bbad323b7de1cd
```

`@` yolg'iz o'zi — `HEAD` ning qisqa shakli.

### Nom qaysi tartibda qidiriladi

Siz `main` deb yozsangiz, Git quyidagi joylarni **shu tartibda** tekshiradi va birinchi topilganini oladi (`gitrevisions`):

1. `.git/<nom>` — amalda faqat `HEAD`, `FETCH_HEAD`, `ORIG_HEAD`, `MERGE_HEAD`, `REBASE_HEAD`, `REVERT_HEAD`, `CHERRY_PICK_HEAD`, `BISECT_HEAD`, `AUTO_MERGE` uchun;
2. `refs/<nom>`;
3. `refs/tags/<nom>`;
4. `refs/heads/<nom>`;
5. `refs/remotes/<nom>`;
6. `refs/remotes/<nom>/HEAD`.

Ref `refs/` papkasidagi faylda ham, `packed-refs` ichida ham bo'lishi mumkin — natija bir xil ([17-bob](17-reflar-va-head.md), [18-bob](18-packfile-va-gc.md)).

Diqqat: **teg branch'dan oldin** turadi. Bir xil nomli teg va branch bo'lsa:

```text
$ git tag experiment 0ea1e3a
$ git rev-parse --short experiment
warning: refname 'experiment' is ambiguous.
0ea1e3a
$ git rev-parse --short heads/experiment
7a3751b
$ git rev-parse --short tags/experiment
0ea1e3a
$ git tag -d experiment
Deleted tag 'experiment' (was 0ea1e3a)
```

Git ogohlantirdi va **teg**ni oldi (3-qoida 4-qoidadan oldin). Aniq bo'lish uchun `heads/...` yoki `tags/...` prefiksini yozing — yoki bunday nomlardan qoching.

### Maxsus `*_HEAD` ref'lar

Ular `.git/` ning ildizida oddiy fayl sifatida turadi va vaqtinchalik holatni yozadi:

| Ref | Kim yozadi | Nima saqlanadi |
| --- | --- | --- |
| `HEAD` | `switch`, `commit` va boshqalar | working tree qaysi commit asosida |
| `ORIG_HEAD` | `merge`, `rebase`, `reset`, `am` | "keskin" amaldan oldingi HEAD — orqaga qaytish uchun |
| `FETCH_HEAD` | `fetch` | oxirgi olingan branch(lar) |
| `MERGE_HEAD` | `merge` (to'xtaganda) | qo'shilayotgan commit(lar) |
| `REBASE_HEAD`, `CHERRY_PICK_HEAD`, `REVERT_HEAD` | tegishli buyruq | qaysi commit'da to'xtagan |
| `BISECT_HEAD` | `bisect --no-checkout` | tekshirilayotgan commit |
| `AUTO_MERGE` | `ort` merge (konfliktda) | working tree holatiga mos tree |

Bizning repo'da `topic` merge qilingan, shuning uchun `ORIG_HEAD` bor — u merge'dan oldingi `main`:

```text
$ ls .git
COMMIT_EDITMSG
HEAD
ORIG_HEAD
config
...
$ cat .git/ORIG_HEAD
0ea1e3afd6222c507876ba7cba4ae7e6cc76f8cd
```

## Kod: reflog nomlari — `@{...}`

Ref har safar o'zgarganda Git bu haqda **reflog**'ga yozadi ([17-bob](17-reflar-va-head.md); batafsil — [42-bob](42-reflog-va-tiklash.md)). Reflog — ref'ning shaxsiy "tarixi": qachon, qaysi buyruq bilan, qaysi hash'dan qaysi hash'ga o'tgan.

```text
$ git reflog
cf44e98 HEAD@{0}: commit: Versiya 1.1
a234310 HEAD@{1}: merge topic: Merge made by the 'ort' strategy.
0ea1e3a HEAD@{2}: commit: Header yangilandi
a4c79c7 HEAD@{3}: checkout: moving from topic to main
9efa969 HEAD@{4}: commit: Footer qo'shildi
a4c79c7 HEAD@{5}: checkout: moving from main to topic
a4c79c7 HEAD@{6}: commit: Login xatosi tuzatildi
db0ee30 HEAD@{7}: commit: Login sahifasi
be150f0 HEAD@{8}: checkout: moving from experiment to main
7a3751b HEAD@{9}: commit: Tajriba: kesh testlari
74ff9bb HEAD@{10}: commit: Tajriba: kesh
be150f0 HEAD@{11}: checkout: moving from main to experiment
be150f0 HEAD@{12}: commit: README yozildi
39d613e HEAD@{13}: commit (initial): Loyiha boshlandi
```

Har qatordagi `HEAD@{n}` — **revision**: "HEAD'ning n qadam oldingi qiymati". `HEAD` ning reflog'i va branch'ning reflog'i farq qiladi — `HEAD` har branch almashishda ham o'zgaradi, `main` esa faqat o'zi siljiganda:

```text
$ git reflog show main
cf44e98 main@{0}: commit: Versiya 1.1
a234310 main@{1}: merge topic: Merge made by the 'ort' strategy.
0ea1e3a main@{2}: commit: Header yangilandi
a4c79c7 main@{3}: commit: Login xatosi tuzatildi
db0ee30 main@{4}: commit: Login sahifasi
be150f0 main@{5}: commit: README yozildi
39d613e main@{6}: commit (initial): Loyiha boshlandi

$ git rev-parse --short main@{1}
a234310
$ git rev-parse --short @{1}
a234310
```

`@{1}` — ref nomisiz shakl: **joriy branch**ning reflog'i (`main@{1}` bilan bir xil, chunki biz `main`damiz). Bu `HEAD@{1}` emas — ikkalasi bu yerda tasodifan mos keldi, lekin chuqurroqda farq chiqadi: `HEAD@{4}` — `9efa969` (`topic`dagi commit), `main@{4}` esa `db0ee30`.

Reflog'da yo'q chuqurlikni so'rasangiz:

```text
$ git rev-parse --short experiment@{10}
fatal: log for 'experiment' only has 3 entries
```

### Vaqt bo'yicha: `<ref>@{<sana>}`

Jingalak qavs ichiga sana yozilsa — "shu paytda ref qayerda edi":

```text
$ git rev-parse --short 'main@{2026-10-07 10:08:00}'
a4c79c7
$ git rev-parse --short 'main@{2026-10-07 10:11:30}'
0ea1e3a
```

10:08 da `main` `a4c79c7` da edi (10:07 dagi commit), 10:11:30 da `0ea1e3a` da (10:11 dagi commit). `{yesterday}`, `{2 weeks ago}`, `{1 month 2 weeks 3 days 1 hour 1 second ago}` kabi nisbiy shakllar **hozirgi vaqtga** nisbatan hisoblanadi:

```text
$ git rev-parse --short 'main@{yesterday}'
warning: log for 'main' only goes back to Wed, 7 Oct 2026 10:00:00 +0500
39d613e
```

Reflog "kecha"gacha yetib bormaydi — Git ogohlantiradi va eng eski yozuvni beradi.

Muhim cheklovlar:

- Bu **sizning lokal** ref'ingizning tarixi. Hamkasbingizning repo'sida `main@{yesterday}` boshqa narsa; yangi `clone` qilingan repo'da reflog deyarli bo'sh. Pro Git o'xshatishi: reflog — shell tarixi (`history`) kabi, faqat sizga tegishli.
- "Kecha qilingan commit'lar" kerak bo'lsa — bu boshqa savol: `git log --since=yesterday` ([9-bob](09-tarixni-korish.md)). `main@{yesterday}` esa "kecha `main` qaysi commit'ni ko'rsatgan".
- Reflog yozuvlari muddat o'tgach `gc` tomonidan tozalanadi ([18-bob](18-packfile-va-gc.md)) — bir necha oydan eski holatni bu yo'l bilan topolmaysiz.

`git log -g` (`--walk-reflogs`) — reflog'ni `log` formatida ko'rsatadi:

```text
$ git log -g -2 main
commit cf44e98cf640a7821d82b65223bbad323b7de1cd
Reflog: main@{0} (Ali Valiyev <ali@example.com>)
Reflog message: commit: Versiya 1.1
Author: Ali Valiyev <ali@example.com>
Date:   Wed Oct 7 10:13:00 2026 +0500

    Versiya 1.1

commit a234310b0873635b3bfb0f2046d8dba7783a2a0c
Reflog: main@{1} (Ali Valiyev <ali@example.com>)
Reflog message: merge topic: Merge made by the 'ort' strategy.
Merge: 0ea1e3a 9efa969
Author: Ali Valiyev <ali@example.com>
Date:   Wed Oct 7 10:12:00 2026 +0500

    Merge branch 'topic'
```

### Oldingi branch: `@{-N}`

`@{-N}` — "N-chi oldin turgan branch (yoki commit)". U `HEAD` reflog'idagi `checkout: moving from X to Y` yozuvlaridan hisoblanadi. `git switch -` aynan `@{-1}` dir ([20-bob](20-branch-bu-ref.md)).

```text
$ git rev-parse --symbolic-full-name @{-1}
refs/heads/topic
$ git rev-parse --abbrev-ref @{-1}
topic
$ git rev-parse --short @{-2}
cf44e98
```

`@{-1}` — `topic` (oxirgi "moving from topic"), `@{-2}` — `main` (undan oldingi "moving from main").

> **PowerShell'da** `{` va `}` maxsus belgilar: `git show "HEAD@{0}"` deb qo'shtirnoqqa oling. **Windows `cmd.exe`** da esa `^` maxsus: `git show "HEAD^"` yoki `HEAD^^`. Bobdagi `'...'` tirnoqlar — bash/zsh uchun.

## Kod: ota zanjiri — `^` va `~`

### `^` — ota; `^N` — N-chi ota

Revision oxiridagi `^` — "shu commit'ning (birinchi) otasi":

```text
$ git log -1 --format='%h %s' 'HEAD^'
a234310 Merge branch 'topic'
$ git log -1 --format='%h %s' 'HEAD^^'
0ea1e3a Header yangilandi
```

`HEAD^` — merge commit. Uning otalari ikkita:

```text
$ git cat-file -p HEAD^
tree 59f05da5a1d2b2e854c8a8836217ca8ad558d212
parent 0ea1e3afd6222c507876ba7cba4ae7e6cc76f8cd
parent 9efa9694ed049d4e2839f6c0a400b475a30349bc
author Ali Valiyev <ali@example.com> 1791349920 +0500
committer Ali Valiyev <ali@example.com> 1791349920 +0500

Merge branch 'topic'
```

`parent` qatorlari **tartib bilan** yozilgan. `^N` — N-chi `parent` qatori:

```text
$ git log -1 --format='%h %s' 'HEAD^^2'
9efa969 Footer qo'shildi
$ git log -1 --format='%h %s' 'HEAD~1^2'
9efa969 Footer qo'shildi
```

**Birinchi ota** — merge qilingan paytda siz turgan branch (`main`). **Ikkinchi ota** — qo'shilgan branch (`topic`). Bu tartib tasodifiy emas, [21-bobda](21-branch-va-merge.md) ko'ramiz: `git merge topic` buyrug'i `main`da ishga tushirilgani uchun shunday.

Oddiy commit'ning ikkinchi otasi yo'q:

```text
$ git log -1 --format='%h %s' 'HEAD^2'
fatal: ambiguous argument 'HEAD^2': unknown revision or path not in the working tree.
...
```

Maxsus holat: `^0` — commit'ning o'zi. U teg obyektidan commit'ga o'tish uchun ishlatiladi (pastda `^{commit}` ga qarang).

### `~N` — N avlod orqaga, faqat birinchi ota bo'ylab

```text
$ git log -1 --format='%h %s' 'HEAD~'
a234310 Merge branch 'topic'
$ git log -1 --format='%h %s' 'HEAD~2'
0ea1e3a Header yangilandi
$ git log -1 --format='%h %s' 'HEAD~3'
a4c79c7 Login xatosi tuzatildi
$ git log -1 --format='%h %s' 'HEAD~~~'
a4c79c7 Login xatosi tuzatildi
```

`HEAD~` = `HEAD^` = `HEAD^1`. Farq son qo'yilganda chiqadi:

- `HEAD^2` — **eni** bo'yicha: bitta qadam, ikkinchi ota;
- `HEAD~2` — **chuqurligi** bo'yicha: ikki qadam, har safar birinchi ota. `HEAD~3` = `HEAD^^^` = `HEAD^1^1^1`.

Ular birlashtiriladi va chapdan o'ngga o'qiladi:

```text
$ git log -1 --format='%h %s' 'HEAD^^2^'
a4c79c7 Login xatosi tuzatildi
```

"HEAD → otasi (merge) → ikkinchi otasi (`9efa969`) → otasi (`a4c79c7`)".

Rasmiy hujjatdagi (Jon Loeliger chizgan) rasm hamma kombinatsiyani ko'rsatadi. `B` va `C` — `A` ning otalari, otalar chapdan o'ngga tartiblangan:

```text
G   H   I   J
 \ /     \ /
  D   E   F
   \  |  / \
    \ | /   |
     \|/    |
      B     C
       \   /
        \ /
         A

A =      = A^0
B = A^   = A^1     = A~1
C =      = A^2
D = A^^  = A^1^1   = A~2
E = B^2  = A^^2
F = B^3  = A^^3
G = A^^^ = A^1^1^1 = A~3
H = D^2  = B^^2    = A^^^2  = A~2^2
I = F^   = B^3^    = A^^3^
J = F^2  = B^3^2   = A^^3^2
```

`B` uch otali (*octopus* merge). `C` ga `~` bilan yetib bo'lmaydi — u birinchi ota emas.

### `--first-parent`: "asosiy chiziq"

`~` faqat birinchi otalar bo'ylab yurgani kabi, `git log --first-parent` ham faqat shu chiziqni ko'rsatadi. Merge orqali kelgan `topic` commit'i (`9efa969`) ro'yxatdan tushib qoladi:

```text
$ git log --oneline --first-parent
91f038a Yangi fayl
cf44e98 Versiya 1.1
a234310 Merge branch 'topic'
0ea1e3a Header yangilandi
a4c79c7 Login xatosi tuzatildi
db0ee30 Login sahifasi
be150f0 README yozildi
39d613e Loyiha boshlandi
```

(`91f038a` keyinroq, upstream bo'limida qo'shiladi.) Bu "`main` branch'ida ketma-ket nima bo'lgan" degan savolga javob.

## Kod: obyekt turi va ichki yo'l

### `^{<tur>}` — kerakli turga "yechish"

Annotated teg — alohida obyekt, u commit'ga ishora qiladi ([17-bob](17-reflar-va-head.md)). Shuning uchun `v1.0` hash'i commit hash'i emas:

```text
$ git rev-parse v1.0
a259530375a5cb7b1d8f7fb3854a0b29f54fc063
$ git cat-file -t v1.0
tag
$ git rev-parse 'v1.0^{commit}'
be150f0149a5b3830118719d3841e4d4d1216f7c
$ git rev-parse 'v1.0^{}'
be150f0149a5b3830118719d3841e4d4d1216f7c
$ git rev-parse --short 'v1.0^0'
be150f0
```

`^{<tur>}` obyektni shu turga yetguncha ketma-ket "yechadi" (teg → commit → tree):

| Yozuv | Ma'nosi |
| --- | --- |
| `<rev>^{commit}` | commit'ga yechish (`^0` — uning qisqa shakli) |
| `<rev>^{tree}` | commit'ning ildiz tree'si |
| `<rev>^{}` | teg bo'lsa — teg bo'lmagan obyektgacha yechish |
| `<rev>^{tag}` | obyekt teg ekanini tekshirish |
| `<rev>^{object}` | shunchaki obyekt mavjudligini tekshirish, yechmasdan |

```text
$ git rev-parse 'HEAD^{tree}'
d0047163d83a7de8c19803c914f3dcd0f4d551bf
$ git cat-file -t 'HEAD^{tree}'
tree
$ git rev-parse 'v1.0^{tag}'
a259530375a5cb7b1d8f7fb3854a0b29f54fc063
```

Ko'pchilik buyruq (`log`, `switch`) teg berilsa, uni o'zi commit'gacha yechadi. `^{commit}` asosan skriptlarda kerak — "menga aynan commit hash'i kerak".

### `<rev>:<yo'l>` — commit ichidagi fayl yoki papka

Ikki nuqtadan keyin yo'l yozilsa — shu commit snapshot'idagi blob yoki tree:

```text
$ git show HEAD:VERSION
1.1
$ git show v1.0:README.md
# Do'kon
$ git show experiment:kesh.js
kesh
$ git rev-parse HEAD:login.js
34ace05ab72fea104cf33104a1eea18d50b62e01
$ git cat-file -p 'HEAD:'
100644 blob 7f9c7d7c8b67d027bb5bb9b1ba38c1d814310f08	README.md
100644 blob 9459d4ba2a0d3cc475f89ed03a13a1517c04798e	VERSION
100644 blob b80f0bd60822d4fa4893de455958ef32f6c521bf	app.js
100644 blob 64a0a69110013999eec7e0cd677e695fd2739dc3	footer.html
100644 blob 8e83f898e5e16ae400db59dda1017acad540f3aa	header.html
100644 blob 34ace05ab72fea104cf33104a1eea18d50b62e01	login.js
```

`HEAD:` (bo'sh yo'l) — ildiz tree, ya'ni `HEAD^{tree}`. Fayl o'sha commit'da bo'lmasa:

```text
$ git show HEAD~3:footer.html
fatal: path 'footer.html' exists on disk, but not in 'HEAD~3'
```

Bu faylni boshqa branch'dan yoki eski versiyadan **o'qish** uchun eng qulay yo'l — branch almashtirmasdan. Yo'l repo ildiziga nisbatan yoziladi; `./` yoki `../` bilan boshlansa — joriy papkaga nisbatan (`HEAD:./README`).

### `:<yo'l>` va `:<N>:<yo'l>` — index ichidagi fayl

Revision qismi bo'lmasa — **index**dagi (staging) versiya ([15-bob](15-tree-va-index.md)):

```text
$ git show :login.js
login
login fix
$ git show :0:login.js
login
login fix
```

`0` — oddiy holat (stage 0). Merge konfliktida index bitta yo'l uchun uchta versiyani saqlaydi. Alohida kichik repo'da konflikt chiqardik:

```text
$ git merge yashil
Auto-merging sozlama.txt
CONFLICT (content): Merge conflict in sozlama.txt
Automatic merge failed; fix conflicts and then commit the result.

$ git ls-files -s
100644 fe1f68410fc62fec57392ed3b02e8b8c389ac425 1	sozlama.txt
100644 0c4041d0067b3428c42e369a5fd02e8d6b9499ca 2	sozlama.txt
100644 22e09919691ce77a12d5b3c1377e0ffebc15765f 3	sozlama.txt

$ git show :1:sozlama.txt
rang = qizil
$ git show :2:sozlama.txt
rang = ko'k
$ git show :3:sozlama.txt
rang = yashil

$ git show :sozlama.txt
fatal: path 'sozlama.txt' is in the index, but not at stage 0
hint: Did you mean ':1:sozlama.txt'?
```

Stage 1 — umumiy ajdod, 2 — joriy branch (`HEAD`, "bizniki"), 3 — qo'shilayotgan branch (`MERGE_HEAD`, "ularniki"). Konfliktni hal qilishda bu juda foydali — [22-bobda](22-konfliktlar.md) davom ettiramiz.

## Kod: commit xabari bo'yicha — `:/` va `^{/...}`

```text
$ git log -1 --format='%h %s' ':/Login'
a4c79c7 Login xatosi tuzatildi
$ git log -1 --format='%h %s' ':/^Tajriba'
7a3751b Tajriba: kesh testlari
$ git log -1 --format='%h %s' 'main^{/README}'
be150f0 README yozildi
```

- `:/<regex>` — xabari regex'ga mos keladigan **eng yosh** commit, **istalgan** ref'dan (HEAD ham) yetib boriladiganlar orasidan. `:/^Tajriba` `experiment` branch'idan topildi.
- `<rev>^{/<regex>}` — xuddi shunday, lekin faqat `<rev>`dan yetib boriladiganlar orasidan. `experiment` `main`dan yetib borilmaydi:

```text
$ git log -1 --format='%h %s' 'main^{/kesh}'
fatal: ambiguous argument 'main^{/kesh}': unknown revision or path not in the working tree.
...
```

- `:/!-<regex>` — **mos kelmaydigan** eng yosh commit; `:/!!` — so'zma-so'z `!` belgisi. `:/!` bilan boshlanadigan boshqa shakllar kelajak uchun band.

```text
$ git log -1 --format='%h %s' ':/!-Versiya'
a234310 Merge branch 'topic'
```

Bu shakllar interaktiv ishda qulay ("Login tuzatilgan commit'ni ko'rsat"), lekin skriptda ishonchsiz — xabar o'zgarishi yoki yangi mos commit paydo bo'lishi mumkin.

## Kod: diapazonlar — commit'lar to'plami

`git log` kabi buyruqlar bitta commit bilan emas, **to'plam** bilan ishlaydi. Qoida oddiy:

- bitta revision `X` — `X` va uning hamma ajdodlari (`X`dan yetib boriladigan hammasi);
- bir nechta revision — ularning har biridan yetib boriladiganlar **birlashmasi**;
- `^X` — `X`dan yetib boriladiganlarni **chiqarib tashlash**.

Qolgan hamma sintaksis — shu uchtasining qisqa shakli.

### Ikki nuqta: `A..B`

`A..B` = `^A B`: "`B`dan yetib boriladi, lekin `A`dan yetib borilmaydi". Amaliy savol: "`experiment`da `main`ga hali qo'shilmagan nima bor?"

```text
$ git log --oneline main..experiment
7a3751b Tajriba: kesh testlari
74ff9bb Tajriba: kesh
```

Teskarisi — "`main`da `experiment`da yo'q nima bor?":

```text
$ git log --oneline experiment..main
cf44e98 Versiya 1.1
a234310 Merge branch 'topic'
0ea1e3a Header yangilandi
9efa969 Footer qo'shildi
a4c79c7 Login xatosi tuzatildi
db0ee30 Login sahifasi
```

`9efa969` ham bor — u `main`dan merge orqali yetib boriladi.

```text
                74ff9bb---7a3751b  ← experiment
               /
  39d613e---be150f0---db0ee30---a4c79c7---0ea1e3a---a234310---cf44e98  ← main
                                          \                 /
                                           9efa969----------  ← topic

  main..experiment = {74ff9bb, 7a3751b}
```

Bir tomonini tashlab ketsangiz, o'rniga `HEAD` qo'yiladi. `experiment`da turib:

```text
$ git switch -q experiment
$ git log --oneline main..
7a3751b Tajriba: kesh testlari
74ff9bb Tajriba: kesh
$ git log --oneline ..main
cf44e98 Versiya 1.1
...
$ git switch -q main
```

`main..` — "`main`dan ajralganimdan beri nima qildim", `..main` — "men ajralganimdan beri `main`da nima bo'ldi". Bu ikki savol kundalik ishda eng ko'p beriladi.

Hujjat bo'yicha yolg'iz `..` — `HEAD..HEAD`, ya'ni bo'sh to'plam. Lekin amalda `git log ..` uni avval **yo'l** (ota papka) deb tushunadi:

```text
$ git log --oneline ..
fatal: ..: '..' is outside repository at '/tmp/misol/dokon'
$ git log --oneline HEAD..HEAD
$
```

### `^` va `--not`: ikkitadan ko'p nuqta

`main..experiment` ni yana ikki usulda yozish mumkin — natija bir xil:

```text
$ git log --oneline ^main experiment
7a3751b Tajriba: kesh testlari
74ff9bb Tajriba: kesh
$ git log --oneline experiment --not main
7a3751b Tajriba: kesh testlari
74ff9bb Tajriba: kesh
```

`^` sintaksisining afzalligi — bir nechta revision. "`topic` yoki `experiment`da bor, lekin `main`da yo'q":

```text
$ git log --oneline topic experiment ^main
7a3751b Tajriba: kesh testlari
74ff9bb Tajriba: kesh
```

`topic` allaqachon merge qilingan — natijada uning commit'i yo'q. Bu "qaysi branch'larda hali qo'shilmagan ish bor" degan savolga javob beradi. `--not` o'zidan **keyingi hamma** revision'ga ta'sir qiladi (keyingi `--not`gacha).

> **Diqqat: `A..B C..D` ikki diapazon emas.** Ko'pchilik buyruq uchun bu bitta to'plam: "`B` yoki `D`dan yetib boriladi, `A` va `C`ning hech biridan yetib borilmaydi".
>
> ```text
> $ git log --oneline be150f0..db0ee30 0ea1e3a..cf44e98
> cf44e98 Versiya 1.1
> a234310 Merge branch 'topic'
> 9efa969 Footer qo'shildi
> ```
>
> `db0ee30` chiqmadi — u `0ea1e3a`dan yetib boriladi, shuning uchun chiqarib tashlandi. Ikki diapazonni alohida solishtiradigan buyruqlar (masalan `git range-diff`) istisno.

### Uch nuqta: `A...B` — simmetrik farq

`A...B` — "`A` yoki `B`dan yetib boriladi, lekin **ikkalasidan ham** emas". Rasmiy ta'rif: `A B --not $(git merge-base --all A B)`.

```text
$ git log --oneline --left-right main...experiment
< cf44e98 Versiya 1.1
< a234310 Merge branch 'topic'
< 0ea1e3a Header yangilandi
< 9efa969 Footer qo'shildi
< a4c79c7 Login xatosi tuzatildi
< db0ee30 Login sahifasi
> 7a3751b Tajriba: kesh testlari
> 74ff9bb Tajriba: kesh
```

`--left-right` har commit qaysi tomonga tegishli ekanini belgilaydi: `<` — chap (`main`), `>` — o'ng (`experiment`). `rev-parse` uch nuqtani nimaga ochishini ko'rsatadi:

```text
$ git rev-parse main..experiment
7a3751b2504c5d787e5d0d4a0ecdc8b30c7dccd5
^cf44e98cf640a7821d82b65223bbad323b7de1cd

$ git rev-parse main...experiment
7a3751b2504c5d787e5d0d4a0ecdc8b30c7dccd5
cf44e98cf640a7821d82b65223bbad323b7de1cd
^be150f0149a5b3830118719d3841e4d4d1216f7c

$ git merge-base main experiment
be150f0149a5b3830118719d3841e4d4d1216f7c
```

`be150f0` — ikki branch'ning umumiy ajdodi (*merge base*, [21-bob](21-branch-va-merge.md)). Ikki tomon necha commit oldinda ekanini sanash:

```text
$ git rev-list --count --left-right main...experiment
6	2
```

`git status` dagi `ahead N, behind M` xabari aynan shu hisob bilan chiqariladi ([28-bob](28-remote-branchlar.md)).

### Ota qisqartmalari: `^@`, `^!`, `^-`

Merge commit'lar bilan ishlash uchun uchta qo'shimcha shakl. Merge commit `a234310` = `HEAD~`:

```text
$ git rev-parse 'HEAD~^@'
0ea1e3afd6222c507876ba7cba4ae7e6cc76f8cd
9efa9694ed049d4e2839f6c0a400b475a30349bc

$ git log --oneline 'HEAD~^!'
a234310 Merge branch 'topic'

$ git log --oneline 'HEAD~^-'
a234310 Merge branch 'topic'
9efa969 Footer qo'shildi
$ git log --oneline 'HEAD~^-2'
a234310 Merge branch 'topic'
0ea1e3a Header yangilandi
```

| Yozuv | Ma'nosi | Qachon kerak |
| --- | --- | --- |
| `X^@` | `X`ning hamma otalari (`X`ning o'zisiz) | otalardan yetib boriladigan hammasi |
| `X^!` | faqat `X` (`X ^X^@`) | bitta commit'ni diapazon sifatida berish |
| `X^-N` | `X^N..X` (N yo'q bo'lsa — 1) | `X^-` — merge orqali **kirib kelgan** commit'lar + merge'ning o'zi |

`HEAD~^-` — "bu merge qaysi commit'larni olib kirdi" degan savolning eng qisqa javobi. `X^2^@` yozish mumkin, `X^@^2` — mumkin emas.

## Kod: `@{upstream}` va `@{push}`

Branch remote branch'ni **kuzatishi** mumkin ([27-bob](27-remote.md), [28-bob](28-remote-branchlar.md)). Buning uchun lokal bare repo yaratib, `main`ni yuboramiz:

```text
$ git remote add origin /tmp/misol/markaz.git
$ git push -q -u origin main
$ git config get branch.main.remote
origin
$ git config get branch.main.merge
refs/heads/main
```

`-u` ikki sozlamani yozdi: `branch.main.remote` va `branch.main.merge`. Endi `@{upstream}` (qisqasi `@{u}`, katta harf bilan ham bo'ladi) shu kuzatilayotgan remote-tracking branch'ni bildiradi:

```text
$ git rev-parse --symbolic-full-name @{upstream}
refs/remotes/origin/main
$ git rev-parse --abbrev-ref @{u}
origin/main
$ git rev-parse --symbolic-full-name main@{U}
refs/remotes/origin/main
$ git rev-parse --abbrev-ref experiment@{u}
fatal: no upstream configured for branch 'experiment'
```

Bitta lokal commit qilamiz va "serverga nima ketadi" deb so'raymiz:

```text
$ echo "x" > yangi.txt && git add yangi.txt
$ git commit -qm "Yangi fayl"
$ git log --oneline @{u}..
91f038a Yangi fayl
$ git log --oneline origin/main..HEAD
91f038a Yangi fayl
$ git status -sb
## main...origin/main [ahead 1]
```

`@{u}..` — upstream'da yo'q, menda bor commit'lar, ya'ni `git push` yuboradigan commit'lar. Teskarisi `..@{u}` — `fetch`dan keyin "serverda men hali olmagan nima bor". Upstream nomini yozmaslik yaxshi: skript har branch'da ishlaydi.

`@{push}` — "`git push` qilsam, qaysi remote-tracking branch yangilanadi". Oddiy holatda u `@{upstream}` bilan bir xil:

```text
$ git rev-parse --symbolic-full-name @{push}
refs/remotes/origin/main
```

Farq "uchburchak" workflow'da chiqadi: bir joydan (`origin`) olasiz, boshqa joyga (o'z fork'ingizga) yuborasiz. Rasmiy hujjatdagi misolda `push.default=current` va `remote.pushdefault=myfork` bilan `@{upstream}` → `refs/remotes/origin/master`, `@{push}` → `refs/remotes/myfork/mybranch` bo'ladi. Fork bilan ishlashni [35-bobda](35-github-fork-va-pr.md) ko'ramiz.

## Muhandislik nuqtai nazari: `log` va `diff`da nuqtalar teskari ma'noga ega

Bu eng ko'p chalkashtiradigan joy. `log` uchun `..` va `...` — commit **to'plami**. `git diff` esa to'plam bilan emas, **ikki snapshot** bilan ishlaydi, va u yerda ma'nolar boshqacha (`git diff` hujjatidan):

| Yozuv | `git log` | `git diff` |
| --- | --- | --- |
| `A..B` | `B`da bor, `A`da yo'q commit'lar | `A` va `B` snapshot'lari orasidagi farq (`git diff A B` bilan bir xil) |
| `A...B` | ikki tomonning farqli commit'lari | `merge-base(A,B)` dan `B`gacha farq — "`B` tomonda nima qilingan" |

```text
$ git diff --stat main..experiment
 VERSION      | 1 -
 footer.html  | 1 -
 header.html  | 1 -
 kesh.js      | 1 +
 kesh.test.js | 1 +
 login.js     | 2 --
 yangi.txt    | 1 -
 7 files changed, 2 insertions(+), 6 deletions(-)

$ git diff --stat main...experiment
 kesh.js      | 1 +
 kesh.test.js | 1 +
 2 files changed, 2 insertions(+)
```

`main..experiment` diff'i `main`dagi o'zgarishlarni "o'chirilgan" deb ko'rsatdi — chunki u shunchaki ikki uchni solishtiradi. `main...experiment` esa faqat `experiment`ning o'z ishini ko'rsatdi — PR'ni ko'rib chiqishda (code review) aynan shu kerak, GitHub ham PR farqini shu ma'noda ko'rsatadi.

Qisqa qoida: **`log` uchun ko'pincha `..`, `diff` uchun ko'pincha `...`**.

## Muhandislik nuqtai nazari: skriptlarda revision

Interaktiv ishda qisqa shakllar qulay, skriptda esa aniqlik muhim:

- **`git rev-parse --verify`** — argument aynan bitta obyektga aylanishini tekshiradi, aks holda xato beradi. `-q` bilan jim, faqat chiqish kodi:

```text
$ git rev-parse --verify main
cf44e98cf640a7821d82b65223bbad323b7de1cd
$ git rev-parse --verify yoq
fatal: Needed a single revision
$ git rev-parse --verify -q yoq ; echo kod=$?
kod=1
```

- **To'liq ref nomlari.** `main` o'rniga `refs/heads/main` — bir xil nomli teg chalkashtirmaydi. Commit kerak bo'lsa — `"$rev^{commit}"`.
- **To'liq hash'ni saqlang.** Bugun yagona `a4c79c7` bir yildan keyin noaniq bo'lishi mumkin. Hujjat, tiket va commit xabarlarida kamida 10–12 belgi yozish xavfsizroq.
- **`:/text` va `@{yesterday}` dan qoching** — natija vaqtga va boshqa commit'larga bog'liq.
- **Tirnoq.** `^`, `~`, `{`, `}`, `!` — shell uchun maxsus bo'lishi mumkin (zsh'da `^` glob, PowerShell'da `{}`, `cmd.exe`da `^`). Murakkab revision'ni `'...'` ichiga oling.

`rev-parse`dan tashqari foydali tekshiruvlar: `git rev-parse --symbolic-full-name <rev>` (qaysi ref ekanini ko'rsatadi), `git rev-parse --abbrev-ref HEAD` (joriy branch nomi), `git merge-base --is-ancestor A B` (A B'ning ajdodimi — [21-bob](21-branch-va-merge.md)).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| 3 belgili hash yozish (`a4c`) | 4 dan kam belgi hash deb tushunilmaydi | Kamida 4, amalda 7–12 belgi |
| Hujjatga 7 belgili hash yozib qo'yish | Repo o'sgach noaniq bo'lishi mumkin | Uzunroq yoki to'liq hash |
| `HEAD^2` ni "ikki commit orqaga" deb o'ylash | `^2` — ikkinchi ota; oddiy commit'da xato beradi | Orqaga N qadam — `HEAD~N` |
| `main@{yesterday}` ni "kecha qilingan commit'lar" deb tushunish | Bu `main` kecha ko'rsatgan bitta commit, faqat lokal reflog'dan | `git log --since=yesterday` |
| Yangi `clone`da `HEAD@{2.months.ago}` | Reflog faqat shu repo'dagi lokal harakatlar, klonda bo'sh | `log --since` yoki teglar |
| `git diff A..B` ni "`B`ning o'zgarishlari" deb o'qish | Ikki uchni solishtiradi, `A`dagi ishni "o'chirilgan" ko'rsatadi | `git diff A...B` |
| `git log A..B C..D` ni ikki diapazon deb kutish | Bitta to'plam: ikkala `^` hamma joyga ta'sir qiladi | Ikki alohida `log` yoki `range-diff` |
| Teg va branch'ga bir xil nom berish | Teg ustun keladi, `warning: refname ... is ambiguous` | Noyob nomlar, kerak bo'lsa `heads/`/`tags/` |
| PowerShell'da `HEAD@{1}` tirnoqsiz | `{}` shell tomonidan buziladi | `"HEAD@{1}"` |

## Amaliyot

1. Uchta commit'li repo yarating. Oxirgi commit'ni beshta usulda ko'rsating: to'liq hash, qisqa hash, `main`, `HEAD`, `@`. Har biri uchun `git rev-parse` bir xil natija berishini tekshiring.
2. Bir necha marta branch almashtiring va commit qiling. `git reflog` va `git reflog show main`ni solishtiring: qaysi yozuvlar faqat `HEAD`da bor va nega? `HEAD@{2}` va `main@{2}` farq qiladigan holatni toping.
3. Ikki branch'ni `git merge --no-ff` bilan birlashtiring. `git cat-file -p HEAD`dagi ikki `parent` qatorini `HEAD^1` va `HEAD^2` bilan solishtiring. `HEAD~2` va `HEAD^2` qaysi commit'larni bildiradi?
4. `git show <eski-commit>:<fayl>` bilan faylning eski versiyasini branch almashtirmasdan o'qing. Keyin `git show <teg>^{tree}` va `git cat-file -p <teg>` natijalarini solishtiring.
5. Ajralgan ikki branch uchun `main..topic`, `topic..main`, `main...topic --left-right` natijalarini qog'ozdagi graf bilan solishtiring. `git rev-list --count --left-right` sonlarini tekshiring.
6. Xuddi shu ikki branch uchun `git diff --stat main..topic` va `git diff --stat main...topic`ni solishtiring va farqni tushuntiring.
7. Lokal bare repo yarating, `push -u` qiling, ikkita commit qo'shing. `git log @{u}..` va `git status -sb` natijalari mos kelishini tekshiring.
8. (Qiyinroq) Merge commit `M` uchun `M^-`, `M^!`, `M^@` to'plamlarini `git rev-parse` va `git log --oneline` bilan oching. Faqat `^`, `--not` va `merge-base` yordamida `A...B` bilan bir xil natija beradigan buyruqni yozing va ikkalasini solishtiring.

## Rasmiy hujjat

- Pro Git — Revision Selection: <https://git-scm.com/book/en/v2/Git-Tools-Revision-Selection>
- `gitrevisions`: <https://git-scm.com/docs/gitrevisions>
- `git rev-parse`: <https://git-scm.com/docs/git-rev-parse>
- `git merge-base`: <https://git-scm.com/docs/git-merge-base>
- `git diff` (`A..B` va `A...B`): <https://git-scm.com/docs/git-diff>
