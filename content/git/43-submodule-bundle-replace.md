# 43 — Submodule, `bundle` va `replace`

[← Oldingi: `reflog` va ma'lumotni tiklash](42-reflog-va-tiklash.md) · [Mundarija](README.md) · [Keyingi: Imzolash →](44-imzolash.md)

## Tushuncha

Bu bobda bir-biriga bog'liq bo'lmagan, lekin bitta umumiy jihati bor uch asbob ko'riladi: ular Git'ning odatiy "bitta repo — bitta tarix — tarmoq orqali push/fetch" modelidan tashqariga chiqadi.

1. **Submodule** — bir Git repo'ni boshqa Git repo ichida papka sifatida saqlash. Tashqi repo **superproject** deyiladi. Ichkaridagi repo o'z tarixini saqlaydi, superproject esa faqat "ichkarida aynan qaysi commit turishi kerak" degan bitta hash'ni yozib qo'yadi. O'xshatish: kitob ichidagi "ilova: X kitobining 3-nashri, 145-bet" degan havola — ilovaning o'zi kitobga ko'chirilmaydi, faqat aniq nashri ko'rsatiladi.
2. **`git bundle`** — `push` tarmoq orqali yuboradigan hamma narsani (obyektlar va ref'lar) **bitta faylga** joylash. Faylni flesh-diskda, email'da yoki boshqa yo'l bilan olib borib, u yerda undan `clone` yoki `fetch` qilinadi.
3. **`git replace`** — "shu obyektga murojaat qilinganda, uning o'rniga boshqasini ko'rsat" degan qoida. Tarixni qayta yozmasdan (hash'larni o'zgartirmasdan) ikki tarixni bir-biriga "ulash" mumkin.

```text
Submodule:   superproject tree'si
               ├── app.py         (blob)
               └── vendor/db  ──► 160000 commit f4deb28   (boshqa repo'dagi commit)

Bundle:      repo ──git bundle create──► fayl.bundle ──(USB, email)──► git clone/fetch

Replace:     df35e03 ──(refs/replace/df35e03 → 3317128)──► Git 3317128 ni ko'rsatadi
```

## Nega shunday: submodule nega "commit hash", papka mazmuni emas

Pro Git muammoni shunday qo'yadi: loyihangizda boshqa loyihani (kutubxonani) ishlatmoqchisiz. Ikki oddiy yo'lning ikkalasi ham noqulay:

- **kutubxonani paket menejeri orqali o'rnatish** — uni o'zgartirish qiyin, har mijozda o'rnatilgan bo'lishini ta'minlash kerak;
- **kodini loyihaga ko'chirib qo'yish** — o'zingiz kiritgan o'zgarishlarni kutubxonaning yangi versiyasi bilan birlashtirish qiyin bo'ladi.

Submodule uchinchi yo'l: ikki loyiha alohida tarixga ega, lekin biri ikkinchisining ichida ishlatiladi. Buning uchun Git superproject tree'siga papka mazmunini emas, **gitlink** deb ataladigan maxsus yozuvni qo'yadi: rejimi `160000`, turi `commit`, hash — submodule repo'sidagi commit ([15-bob](15-tree-va-index.md), "rejimlar"). Natija:

- superproject tarixi har commit'da submodule'ning **aniq versiyasini** qayd qiladi — kimdir kutubxonaga yangi commit qo'shsa ham, sizning loyihangiz o'zgarmaydi, toki siz ataylab yangilamaguningizcha;
- kutubxona fayllari superproject obyektlar bazasiga tushmaydi — ular submodule'ning o'z bazasida;
- `gitsubmodules` ma'lumotnomasi yana bir foydalanishni aytadi: katta loyihani bir nechta repo'ga bo'lish (hajm, uzatish hajmi, kirish huquqlarini alohida boshqarish uchun).

Bahosi ham shundan kelib chiqadi: Git submodule ichidagi fayllarni kuzatmaydi, faqat hash'ni. Bu bobdagi deyarli hamma "submodule chalkash" holat — shu hash bilan submodule papkasida haqiqatan turgan commit bir-biriga mos kelmay qolishidan.

## Kod: lokal sinov uchun `protocol.file.allow`

Misollar tarmoqsiz, lokal bare repo'lar bilan ([27-bob](27-remote.md)): `kutubxona.git` (kutubxona "serveri"), `loyiha.git` (superproject "serveri") va ularning klonlari. Kutubxonada ikki commit, loyihada bitta:

```bash
$ git -C kutubxona log --oneline
f4deb28 README qo'shildi
76ca944 db.py: ulanish funksiyasi
$ git log --oneline
a91eaca app.py qo'shildi
```

Submodule qo'shishning birinchi urinishi xato beradi:

```bash
$ git submodule add /tmp/misol/kutubxona.git vendor/db
Cloning into '/tmp/misol/loyiha/vendor/db'...
fatal: transport 'file' not allowed
fatal: clone of '/tmp/misol/kutubxona.git' into submodule path '/tmp/misol/loyiha/vendor/db' failed
```

Lekin xuddi shu `kutubxona.git` ni oddiy `git clone` bilan muammosiz klonlagan edik. Farq nimada?

### Nega shunday: CVE-2022-39253 va `user` siyosati

`protocol.<nom>.allow` sozlamasi ([config/protocol](https://git-scm.com/docs/git-config#Documentation/git-config.txt-protocolallow)) har transport uchun uch siyosatdan birini beradi:

| Siyosat | Ma'nosi |
| --- | --- |
| `always` | doim ruxsat |
| `never` | hech qachon |
| `user` | faqat `GIT_PROTOCOL_FROM_USER` o'rnatilmagan yoki `1` bo'lganda — ya'ni buyruqni **foydalanuvchining o'zi** to'g'ridan-to'g'ri bergan bo'lsa |

Standart bo'yicha `http`, `https`, `git`, `ssh` — `always`, `ext` — `never`, qolganlari, jumladan **`file`** (lokal yo'l va `file://`) — `user`. Hujjatning o'zi `user` siyosatini qayerda ishlatishni misol qiladi: "foydalanuvchi kiritmasdan clone/fetch/push bajaradigan buyruqlar, masalan **submodule'larni rekursiv ishga tushirish**". `git submodule` ichki klonlash va fetch'larni aynan shunday "foydalanuvchidan emas" deb belgilab ishga tushiradi — shuning uchun lokal yo'l rad etildi.

Bu standart doim shunday bo'lmagan. `RelNotes/2.30.6` (va uni o'z ichiga olgan `2.38.1`) xavfsizlik tuzatishi — **CVE-2022-39253**:

- lokal yo'ldan klonlashda Git `--local` optimizatsiyasini ishlatadi: obyektlarni nusxalamasdan hardlink qiladi. Zaif versiyalarda Git manba repo'ning `$GIT_DIR/objects` ichidagi **symlink'larni ochib** (dereference), ular ko'rsatgan faylni klonga ko'chirgan. Natijada yovuz niyatli repo'dan klonlaganda, klonning `$GIT_DIR` ichida ixtiyoriy (masalan, kompyuteringizdagi boshqa) fayllar paydo bo'lishi mumkin edi;
- tuzatish: Git endi symlink'larni ochmaydi va `$GIT_DIR/objects` da symlink bor repo'ni `--local` usulida klonlashdan bosh tortadi. **Qo'shimcha ravishda `protocol.file.allow` standarti `user` ga o'zgartirildi.**

Ikkinchi qism submodule bilan bevosita bog'liq: `git clone --recurse-submodules` begona superproject'ning `.gitmodules` faylida yozilgan URL'larni **siz ko'rib chiqmasdan** klonlaydi. U yerda lokal yo'l turgan bo'lsa, yuqoridagi zaiflik siz hech narsa so'ramagan holda ishga tushardi. `user` siyosati shu yo'lni yopadi: lokal yo'lni faqat o'zingiz terib bergan buyruq ishlatadi. (Release notes hujum stsenariysini batafsil yozmaydi — bu bog'liqlik `protocol.allow` hujjatidagi submodule misolidan kelib chiqadi.)

Sinov uchun yechim — ruxsatni **faqat shu buyruq uchun** berish:

```bash
$ git -c protocol.file.allow=always submodule add ../kutubxona.git vendor/db
Cloning into '/tmp/misol/loyiha/vendor/db'...
done.
```

`-c` sozlamani faqat bitta buyruq (va u ishga tushirgan ichki jarayonlar) uchun o'rnatadi, hech qaysi config fayliga yozmaydi. `git config --global protocol.file.allow always` qilish mumkin, lekin bu himoyani siz klonlaydigan **hamma** repo uchun o'chiradi — tavsiya etilmaydi. Haqiqiy loyihada submodule URL'i odatda `https://` yoki `ssh://` bo'ladi va bu muammo umuman chiqmaydi.

E'tibor bering, URL nisbiy: `../kutubxona.git`. `git-submodule` ma'lumotnomasiga ko'ra `./` yoki `../` bilan boshlangan URL superproject'ning standart remote'iga nisbatan hisoblanadi (bu yerda `origin` = `/tmp/misol/loyiha.git`, demak `../kutubxona.git` = `/tmp/misol/kutubxona.git`). Ikkala repo serverda yonma-yon tursa, nisbiy URL hamma uchun ishlaydi — HTTPS bilan klonlagan ham, SSH bilan klonlagan ham o'z protokolida oladi. Hujjatdagi tuzoq: `bar.git` yonidagi `foo.git` uchun `./foo.git` emas, `../foo.git` yoziladi — nisbiy URL papka kabi hisoblanadi.

## Kod: submodule qo'shish — nima o'zgardi

```bash
$ git status
On branch main
...
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	new file:   .gitmodules
	new file:   vendor/db

$ cat .gitmodules
[submodule "vendor/db"]
	path = vendor/db
	url = ../kutubxona.git
```

**`.gitmodules`** — oddiy, versiyalanadigan matn fayli (`.gitignore` kabi). U submodule **nomi** (`"vendor/db"`), **yo'li** va **URL'i** o'rtasidagi bog'lanishni saqlaydi va `push`/`pull` bilan boshqalarga boradi — boshqalar submodule'ni qayerdan olishni shundan biladi. Nom standart bo'yicha yo'lga teng, `--name` bilan boshqa berish mumkin.

Pro Git maslahati: `.gitmodules` dagi URL boshqalar birinchi bo'lib urinadigan manzil, shuning uchun hamma kira oladigan URL yozing. O'zingiz uchun boshqa manzil kerak bo'lsa, uni faqat lokal config'da o'zgartiring: `git config submodule.vendor/db.url <maxfiy-url>`.

Endi `vendor/db` ning o'ziga qaraymiz:

```bash
$ git diff --cached vendor/db
diff --git a/vendor/db b/vendor/db
new file mode 160000
index 0000000..f4deb28
--- /dev/null
+++ b/vendor/db
@@ -0,0 +1 @@
+Subproject commit f4deb28fc07256da5b403d8c304cf08fa706480c

$ git diff --cached --submodule
diff --git a/.gitmodules b/.gitmodules
new file mode 100644
...
Submodule vendor/db 0000000...f4deb28 (new submodule)
```

Papkada ikki fayl bor, lekin Git ularni ko'rmaydi — uning uchun `vendor/db` bitta yozuv, rejimi `160000`, mazmuni — "Subproject commit <hash>". Commit qilamiz:

```bash
$ git commit -m "vendor/db submodule qo'shildi"
[main 0bfcf85] vendor/db submodule qo'shildi
 2 files changed, 4 insertions(+)
 create mode 100644 .gitmodules
 create mode 160000 vendor/db
```

### Gitlink: tree va index ichida

[15-bob](15-tree-va-index.md) da `160000` yozuvini `update-index --cacheinfo` bilan qo'lda yasagan edik. Endi uni haqiqiy submodule'da ko'ramiz:

```bash
$ git ls-files -s
100644 5d4e00dc2e43988ca3be41a0e15709b61702db37 0	.gitmodules
100644 b917a726c93f902e43291d9009d6488385133b67 0	app.py
160000 f4deb28fc07256da5b403d8c304cf08fa706480c 0	vendor/db

$ git ls-tree HEAD
100644 blob 5d4e00dc2e43988ca3be41a0e15709b61702db37	.gitmodules
100644 blob b917a726c93f902e43291d9009d6488385133b67	app.py
040000 tree 3033e0633e9a4df6243d096ac1627b73b50b3adc	vendor

$ git cat-file -p 3033e06
160000 commit f4deb28fc07256da5b403d8c304cf08fa706480c	db

$ git ls-tree -r -l HEAD
100644 blob 5d4e00dc2e43988ca3be41a0e15709b61702db37      66	.gitmodules
100644 blob b917a726c93f902e43291d9009d6488385133b67       9	app.py
160000 commit f4deb28fc07256da5b403d8c304cf08fa706480c       -	vendor/db
```

Uch kuzatish:

- `vendor` — oddiy tree (`040000`), uning ichida `db` — `160000 commit` yozuvi. Ya'ni gitlink tree ichida fayl yoki papka bilan teng turadi.
- Hajm o'rnida `-` — gitlink superproject'da obyekt emas, uning hajmi yo'q.
- `f4deb28` superproject bazasida **yo'q**:

```bash
$ git cat-file -t f4deb28
fatal: Not a valid object name f4deb28
```

Commit submodule'ning o'z bazasida. Superproject faqat hash'ni biladi — shu sababli `fsck`, `gc` va `push` gitlink'ni kuzatib bormaydi.

### `.git/modules/` va `.git` fayli

Submodule'ning Git ma'lumotlari qayerda? `gitsubmodules` hujjati bo'yicha zamonaviy shakl uch qismdan iborat: superproject'ning `$GIT_DIR/modules/` ichidagi Git papkasi, superproject working tree'sidagi ish papkasi va ish papkasi ildizidagi shu Git papkasini ko'rsatuvchi **`.git` fayli**:

```bash
$ ls -la vendor/db
total 24
drwxr-xr-x@ 5 ali   staff  160 Oct  8 17:24 .
drwxr-xr-x@ 3 ali   staff   96 Oct  8 17:24 ..
-rw-r--r--@ 1 ali   staff   37 Oct  8 17:24 .git
-rw-r--r--@ 1 ali   staff   12 Oct  8 17:24 README.md
-rw-r--r--@ 1 ali   staff   32 Oct  8 17:24 db.py

$ cat vendor/db/.git
gitdir: ../../.git/modules/vendor/db

$ ls .git/modules/vendor/db
HEAD
config
description
hooks
index
info
logs
objects
packed-refs
refs

$ git -C .git/modules/vendor/db config core.worktree
../../../../vendor/db
```

`.git` bu yerda papka emas, bir qatorli fayl ("gitfile"). Haqiqiy repo `.git/modules/vendor/db/` da, uning `core.worktree` si esa ish papkasiga qaytib ishora qiladi. Nega shunday murakkab? Pro Git javobi: submodule ma'lumotlari superproject'ning `.git` ida turgani uchun **submodule papkasini o'chirib yuborsangiz ham commit'lar va branch'lar yo'qolmaydi** — masalan, submodule'siz branch'ga o'tib qaytganda (pastda).

Lokal config'ga ham yozuv qo'shildi:

```ini
[submodule "vendor/db"]
	url = /tmp/misol/kutubxona.git
	active = true
```

Bu yerda URL allaqachon **absolyut** — nisbiy yo'l shu repo'ning remote'iga nisbatan hisoblab qo'yilgan.

## Kod: submodule bor loyihani klonlash

Hamkasb loyihani klonlaydi:

```bash
$ git clone /tmp/misol/loyiha.git hamkasb
Cloning into 'hamkasb'...
done.
$ cd hamkasb
$ ls -A vendor/db
$ git submodule status
-f4deb28fc07256da5b403d8c304cf08fa706480c vendor/db
```

Papka bor, lekin **bo'sh**. `git submodule status` boshidagi `-` — "ishga tushirilmagan". Ikki qadam kerak:

```bash
$ git submodule init
Submodule 'vendor/db' (/tmp/misol/kutubxona.git) registered for path 'vendor/db'

$ git -c protocol.file.allow=always submodule update
Cloning into '/tmp/misol/hamkasb/vendor/db'...
done.
Submodule path 'vendor/db': checked out 'f4deb28fc07256da5b403d8c304cf08fa706480c'
```

- `init` — `.gitmodules` dagi URL'ni `.git/config` ga `submodule.<nom>.url` qilib ko'chiradi. `.gitmodules` faqat **andoza**: undan keyin Git `.git/config` dagi qiymatga qaraydi. Shu oraliqda URL'ni o'zingizga moslashingiz mumkin (ma'lumotnoma: `init` mavjud qiymatni o'zgartirmaydi va `.gitmodules` dagi maxsus buyruqli `update = !...` ni xavfsizlik uchun ko'chirmaydi).
- `update` — submodule'ni klonlaydi (`.git/modules/` ga) va superproject yozib qo'ygan commit'ni chiqaradi.

Ruxsatsiz `update` yuqoridagi `transport 'file' not allowed` bilan ikki marta urinib to'xtaydi ("Retry scheduled", "a second time, aborting").

Bir qadamda: `git submodule update --init`; ichma-ich submodule'lar ham bo'lsa — `git submodule update --init --recursive`. Klonlash paytidayoq:

```bash
$ git -c protocol.file.allow=always clone --recurse-submodules /tmp/misol/loyiha.git hamkasb2
Cloning into 'hamkasb2'...
done.
Submodule 'vendor/db' (/tmp/misol/kutubxona.git) registered for path 'vendor/db'
Cloning into '/tmp/misol/hamkasb2/vendor/db'...
done.
Submodule path 'vendor/db': checked out 'f4deb28fc07256da5b403d8c304cf08fa706480c'
```

### Detached HEAD — submodule'ning odatiy holati

```bash
$ git -C vendor/db status
HEAD detached at f4deb28
nothing to commit, working tree clean
```

`update` standart bo'yicha **`checkout`** usulini qo'llaydi: superproject yozgan commit "detached HEAD" holatida chiqariladi ([20-bob](20-branch-bu-ref.md)). Mantiqan to'g'ri — superproject branch'ni emas, aniq commit'ni talab qiladi. Lekin bu holatda qilingan commit'ga hech qaysi branch ko'rsatmaydi va keyingi `update` uni "tashlab ketishi" mumkin (keyin uni faqat reflog orqali topasiz, [42-bob](42-reflog-va-tiklash.md)).

(`git submodule add` qilgan sizning nusxangizda esa submodule `main` branch'ida turadi — u oddiy `clone` bilan yaratilgan.)

## Kod: kutubxona yangilanganda

Kutubxonaga ikki yangi commit push qilindi. Eng oddiy yo'l — submodule ichiga kirib, oddiy repo kabi `fetch` va `merge`:

```bash
$ cd vendor/db
$ git fetch
From /tmp/misol/kutubxona
   f4deb28..47b745a  main       -> origin/main
$ git merge origin/main
Updating f4deb28..47b745a
Fast-forward
 db.py | 4 +++-
 1 file changed, 3 insertions(+), 1 deletion(-)
$ cd ../..
```

Bu `fetch` ruxsatsiz ishladi — uni o'zingiz to'g'ridan-to'g'ri terdingiz (`user` siyosati). Superproject nuqtai nazaridan:

```bash
$ git status
...
	modified:   vendor/db (new commits)

$ git diff
diff --git a/vendor/db b/vendor/db
index f4deb28..47b745a 160000
--- a/vendor/db
+++ b/vendor/db
@@ -1 +1 @@
-Subproject commit f4deb28fc07256da5b403d8c304cf08fa706480c
+Subproject commit 47b745affa5fc734db032204c202e02a585ed6dd

$ git diff --submodule
Submodule vendor/db f4deb28..47b745a:
  > uzil() qo'shildi
  > ulan(): timeout parametri
```

`--submodule` (`--submodule=log`) hash'lar o'rniga submodule'dagi commit ro'yxatini ko'rsatadi. Har safar yozmaslik uchun `diff.submodule log` sozlamasi bor (yana bir qiymati — `diff`, submodule ichidagi o'zgarishlarni to'liq diff qilib ko'rsatadi). `status` uchun ham qisqa xulosa:

```bash
$ git config set diff.submodule log
$ git config set status.submoduleSummary true
$ git status
...
	modified:   vendor/db (new commits)

Submodules changed but not updated:

* vendor/db f4deb28...47b745a (2):
  > uzil() qo'shildi
  > ulan(): timeout parametri
```

Hozircha faqat working tree'dagi submodule o'zgardi. Superproject uni "qulflashi" uchun gitlink'ni commit qilish kerak — xuddi fayl kabi:

```bash
$ git commit -am "vendor/db yangilandi: uzil()"
$ git log -1 -p --submodule
commit c551de9381855d7404960b6d98f639cee6d6d057
Author: Ali Valiyev <ali@example.com>
Date:   Wed Oct 7 10:30:00 2026 +0500

    vendor/db yangilandi: uzil()

Submodule vendor/db f4deb28..47b745a:
  > uzil() qo'shildi
  > ulan(): timeout parametri
```

### `update --remote` va kuzatiladigan branch

Ichkariga kirmasdan: `git submodule update --remote` submodule'da fetch qiladi va **remote'dagi branch** uchini chiqaradi (superproject yozgan commit'ni emas). Standart branch — submodule remote'idagi `HEAD`. Boshqasini kuzatish uchun `set-branch` (yoki Pro Git'dagidek `git config -f .gitmodules submodule.<nom>.branch barqaror`):

```bash
$ git submodule set-branch -b barqaror vendor/db
$ git diff .gitmodules
...
 [submodule "vendor/db"]
 	path = vendor/db
 	url = ../kutubxona.git
+	branch = barqaror

$ git -c protocol.file.allow=always submodule update --remote
From /tmp/misol/kutubxona
   47b745a..384618a  main       -> origin/main
 * [new branch]      barqaror   -> origin/barqaror
Submodule path 'vendor/db': checked out 'bbf7eed83fe6794804470c51601e83cbb2709b40'

$ git diff vendor/db
Submodule vendor/db 47b745a..bbf7eed:
  > versiya 1.0
  > LICENSE qo'shildi
```

Bu safar ruxsat kerak bo'ldi: `submodule update` ichidagi fetch "foydalanuvchidan emas". `-f .gitmodules` (yoki `set-branch`) sozlamani hamma bilan bo'lishadi; faqat `.git/config` ga yozsangiz — faqat sizda ishlaydi. Pro Git eslatmasi: argumentsiz `update --remote` **hamma** submodule'larni yangilaydi, ko'p bo'lsa nomini bering.

## Kod: hamkasbning `pull` i yetarli emas

Hamkasb superproject'ni yangilaydi:

```bash
$ git pull
From /tmp/misol/loyiha
   0bfcf85..c551de9  main       -> origin/main
Fetching submodule vendor/db
From /tmp/misol/kutubxona
   f4deb28..47b745a  main       -> origin/main
Updating 0bfcf85..c551de9
Fast-forward
 vendor/db | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

$ git status
...
	modified:   vendor/db (new commits)

Submodules changed but not updated:

* vendor/db 47b745a...f4deb28 (2):
  < uzil() qo'shildi
  < ulan(): timeout parametri

$ git submodule status
+f4deb28fc07256da5b403d8c304cf08fa706480c vendor/db (heads/main)
```

`pull` submodule'ning **obyektlarini** fetch qildi, lekin submodule papkasini **yangilamadi**. Belgilarni o'qing: `+` — "papkadagi commit index'dagisiga mos emas"; `<` strelkalari — bu commit'lar superproject'da yozilgan, lekin submodule papkasida yo'q. Bu holatda `git commit -a` qilsangiz, hamkasb submodule'ni **eski versiyaga qaytargan** commit qiladi — eng ko'p uchraydigan submodule xatosi. To'g'ri yakun:

```bash
$ git submodule update --init --recursive
Submodule path 'vendor/db': checked out '47b745affa5fc734db032204c202e02a585ed6dd'
$ git status --short
$
```

Pro Git maslahati: `--init` (pull yangi submodule qo'shgan bo'lishi mumkin) va `--recursive` (ichma-ich submodule'lar) ni doim qo'shing. Avtomatlashtirish: `git pull --recurse-submodules` yoki doimiy `git config submodule.recurse true` — bu `--recurse-submodules` opsiyasi bor **hamma** buyruqqa ta'sir qiladi (`clone` dan tashqari).

### URL o'zgarganda: `sync`

Kutubxona yangi manzilga ko'chdi. Superproject'da:

```bash
$ git submodule set-url vendor/db ../db-yangi.git
Synchronizing submodule url for 'vendor/db'
$ git diff
...
-	url = ../kutubxona.git
+	url = ../db-yangi.git
```

`set-url` `.gitmodules` ni o'zgartiradi va sizning lokal sozlamalaringizni ham sinxronlaydi. Hamkasbda esa `pull` faqat `.gitmodules` ni o'zgartiradi, `.git/config` va submodule'ning `origin` i eski manzilda qoladi:

```bash
$ git config get submodule.vendor/db.url
/tmp/misol/kutubxona.git
$ git submodule sync
Synchronizing submodule url for 'vendor/db'
$ git config get submodule.vendor/db.url
/tmp/misol/db-yangi.git
$ git -C vendor/db remote get-url origin
/tmp/misol/db-yangi.git
```

`sync` siz yangi commit'lar faqat yangi manzilda bo'lsa, `update` ularni topa olmay xato beradi. Ketma-ketlik: `git submodule sync --recursive`, keyin `git submodule update --init --recursive`.

## Kod: submodule ichida ishlash

Kutubxonani ham o'zgartirmoqchi bo'lsangiz, detached HEAD'da ishlamang. Avval branch:

```bash
$ cd vendor/db
$ git switch barqaror
Switched to a new branch 'barqaror'
branch 'barqaror' set up to track 'origin/barqaror'.
$ git commit -am "db.py: UTF-8 izohi"
[barqaror ceaf742] db.py: UTF-8 izohi
 1 file changed, 1 insertion(+)
$ cd ../..
```

Shu orada boshqa kimdir `barqaror` ga commit push qildi. Endi `update --remote` ga **qanday birlashtirish** kerakligini aytamiz — `--rebase` yoki `--merge`:

```bash
$ git -c protocol.file.allow=always submodule update --remote --rebase
From /tmp/misol/kutubxona
   bbf7eed..5ed309c  barqaror   -> origin/barqaror
Successfully rebased and updated refs/heads/barqaror.
Submodule path 'vendor/db': rebased into '5ed309c832ccfdbc7c974f8e120b1dc3c4a30cdc'

$ git -C vendor/db log --oneline -3
8886c40 db.py: UTF-8 izohi
5ed309c talablar.txt qo'shildi
bbf7eed versiya 1.0
```

Mahalliy commit yangi upstream ustiga ko'chdi (`ceaf742` → `8886c40`, [24-bob](24-rebase.md)). Xabardagi hash (`5ed309c`) — ustiga rebase qilingan upstream commit, natija emas; natijani `git submodule status` yoki `git -C vendor/db rev-parse HEAD` dan oling.

`update` usulini doimiy qilish: `submodule.<nom>.update` = `checkout` (standart), `rebase`, `merge`, `none` yoki `!buyruq` (oxirgisi faqat `.git/config` da, `.gitmodules` da emas — xavfsizlik).

**`--rebase`/`--merge` ni unutsangiz:**

```bash
$ git -c protocol.file.allow=always submodule update --remote
Submodule path 'vendor/db': checked out '5ed309c832ccfdbc7c974f8e120b1dc3c4a30cdc'
$ git -C vendor/db status | head -1
HEAD detached at 5ed309c
```

Submodule upstream uchiga detached holatda o'tdi — `8886c40` papkada endi yo'q. Lekin u yo'qolmagan: `barqaror` branch'i hamon unga ko'rsatadi, `git -C vendor/db switch barqaror` yetarli. Saqlanmagan o'zgarishlar bo'lsa, `update` ularni bosib ketmaydi — Pro Git ko'rsatgan "Your local changes ... would be overwritten" xatosi bilan to'xtaydi.

### Push: avval submodule, keyin superproject

Superproject'da `8886c40` ni commit qildik, lekin submodule'da u hali push qilinmagan. Superproject'ni push qilsak, hamkasblar `8886c40` ni hech qayerdan ololmaydi. `--recurse-submodules=check` buni ushlaydi:

```bash
$ git push --recurse-submodules=check
The following submodule paths contain changes that can
not be found on any remote:
  vendor/db

Please try

	git push --recurse-submodules=on-demand

or cd to the path and use

	git push

to push them to a remote.

fatal: Aborting.
```

`on-demand` submodule'ni o'zi push qilishga urinadi. Bizning sinovda u muvaffaqiyatsiz bo'ldi:

```bash
$ git push --recurse-submodules=on-demand
Pushing submodule 'vendor/db'
To /tmp/misol/kutubxona.git
 ! [rejected]        main -> main (non-fast-forward)
...
Unable to push submodule 'vendor/db'
fatal: failed to push all needed submodules
```

Submodule ichida superproject'ning joriy branch nomi (`main`) push qilinmoqchi bo'ldi, holbuki ish `barqaror` da, submodule'dagi eski lokal `main` esa orqada qolgan. Hujjatdagi qoida saqlandi — submodule push bo'lmasa, superproject ham push qilinmaydi. Ishonchli yo'l — qo'lda:

```bash
$ git -C vendor/db push
To /tmp/misol/kutubxona.git
   5ed309c..8886c40  barqaror -> barqaror
$ git push --recurse-submodules=check
To /tmp/misol/loyiha.git
   b1c6b12..a007959  main -> main
```

`check` ni doimiy qilish: `git config push.recurseSubmodules check`.

## Kod: submodule bo'yicha konflikt

Ikki branch submodule'ni **turli yo'nalishdagi** commit'larga surgan (Tom — `b05617f`, Ali — `6cc034f`, ikkalasi `8886c40` dan ayrilgan). Superproject'da merge:

```bash
$ git merge tom
hint: Recursive merging with submodules currently only supports trivial cases.
hint: Please manually handle the merging of each conflicted submodule.
hint: This can be accomplished with the following steps:
hint:  - go to submodule (vendor/db), and either merge commit b05617f
hint:    or update to an existing commit which has merged those changes
hint:  - come back to superproject and run:
hint:
hint:       git add vendor/db
...
Failed to merge submodule vendor/db
CONFLICT (submodule): Merge conflict in vendor/db
Automatic merge failed; fix conflicts and then commit the result.
```

Git fast-forward bo'ladigan holatni o'zi hal qiladi (biri ikkinchisining ajdodi bo'lsa — yangisini oladi), lekin ikki tarixni submodule ichida **merge qilmaydi**. Pro Git yozgan paytda Git hatto ikki tomonning hash'ini ham ko'rsatmas edi; v2.56 maslahati aniq qadamlarni beradi. Index'da — oddiy konfliktdagi kabi uch bosqich ([22-bob](22-konfliktlar.md)), faqat `160000` rejimli:

```bash
$ git ls-files -s vendor/db
160000 8886c40d9aba130084d752da0e07ef9f660700d7 1	vendor/db
160000 6cc034fd74d6c8944dc4c1b8da248b0b6e59afeb 2	vendor/db
160000 b05617f3f994d929ccd7675ea8489f1637ed0703 3	vendor/db
$ git submodule status
U0000000000000000000000000000000000000000 vendor/db
```

1 — umumiy ajdod, 2 — bizniki, 3 — ularniki; `status` dagi `U` — konflikt. Yechim — submodule ichida haqiqiy merge, keyin natijani `add`:

```bash
$ cd vendor/db
$ git merge -m "Tom va Ali ishlari birlashtirildi" b05617f
Merge made by the 'ort' strategy.
 tom.txt | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 tom.txt
$ cd ../..
$ git diff
diff --cc vendor/db
index 6cc034f,b05617f..0000000
--- a/vendor/db
+++ b/vendor/db
@@@ -1,1 -1,1 +1,1 @@@
- Subproject commit 6cc034fd74d6c8944dc4c1b8da248b0b6e59afeb
 -Subproject commit b05617f3f994d929ccd7675ea8489f1637ed0703
++Subproject commit a5d82cf87fd8b6e61c82682f09275216fde57b90
$ git add vendor/db
$ git commit --no-edit
```

Pro Git yana bir holatni tushuntiradi: agar submodule'da ikkala commit'ni o'z ichiga olgan merge commit **allaqachon bor** bo'lsa, Git uni taklif qiladi ("Found a possible merge resolution for the submodule"). Taklifni ko'r-ko'rona `update-index` bilan qabul qilish o'rniga, submodule'ga kirib o'sha commit'ga fast-forward qilish va sinab ko'rish tavsiya etiladi.

## Kod: foydali buyruqlar

`foreach` har submodule ichida shell buyrug'ini bajaradi. Mavjud o'zgaruvchilar: `$name`, `$sm_path`, `$displaypath`, `$sha1`, `$toplevel`:

```bash
$ git submodule foreach 'echo $name $sm_path $sha1; git rev-parse --abbrev-ref HEAD'
Entering 'vendor/db'
vendor/db vendor/db 8886c40d9aba130084d752da0e07ef9f660700d7
barqaror
```

Pro Git misollari: `git submodule foreach 'git stash'`, `git submodule foreach 'git switch -c featureA'`. Bitta submodule'da buyruq xato bilan tugasa, `foreach` to'xtaydi; davom etish uchun buyruq oxiriga `|| :` qo'shing.

Ba'zi buyruqlar o'z bayrog'i bilan submodule ichiga ham kiradi:

```bash
$ git ls-files
.gitmodules
app.py
vendor/db
$ git ls-files --recurse-submodules
.gitmodules
app.py
vendor/db/LICENSE
vendor/db/README.md
vendor/db/db.py
...
$ git grep -n uzil
$ git grep -n --recurse-submodules uzil
vendor/db/db.py:3:def uzil():
vendor/db/db.py:4:    return "uzildi"
```

Pro Git'dagi qulay taxalluslar ([12-bob](12-teglar-va-aliaslar.md)):

```bash
git config alias.sdiff '!'"git diff && git submodule foreach 'git diff'"
git config alias.spush 'push --recurse-submodules=on-demand'
git config alias.supdate 'submodule update --remote --merge'
```

## Kod: branch almashtirish va submodule

Submodule'siz eski commit'ga branch ochamiz:

```bash
$ git switch -c eski a91eaca
warning: unable to rmdir 'vendor/db': Directory not empty
Switched to a new branch 'eski'
$ git status --short
?? vendor/
```

Pro Git buni "Git 2.13 dan eski versiyalar muammosi" deb yozadi, lekin v2.56 da ham **bayroqsiz** xuddi shunday: submodule papkasi untracked bo'lib qoladi. Yechim — `--recurse-submodules`:

```bash
$ git switch --recurse-submodules eski
Switched to branch 'eski'
$ ls vendor
ls: vendor: No such file or directory
$ git switch --recurse-submodules main
Switched to branch 'main'
$ git submodule status
 8886c40d9aba130084d752da0e07ef9f660700d7 vendor/db (remotes/origin/barqaror)
```

Papka olib tashlandi va qaytib tiklandi — Git ma'lumotlari `.git/modules/` da turgani uchun hech narsa qayta yuklanmadi. Superproject'da submodule'ni turli commit'larga qo'ygan branch'lar orasida yurganda ham shu bayroq kerak — aks holda har almashtirishdan keyin `modified: vendor/db (new commits)` chiqadi. Doimiy: `git config submodule.recurse true`.

### Mavjud papkani submodule'ga aylantirish

Repo'ni oddiy `git add` bilan qo'shsangiz, Git ogohlantiradi — gitlink yoziladi, lekin `.gitmodules` yo'q, ya'ni boshqalar uni qayerdan olishni bilmaydi:

```bash
$ git clone ../kutubxona.git lib
$ git add lib
warning: adding embedded git repository: lib
hint: You've added another git repository inside your current repository.
hint: Clones of the outer repository will not contain the contents of
hint: the embedded repository and will not know how to obtain it.
hint: If you meant to add a submodule, use:
hint:
hint: 	git submodule add <url> lib
...
$ git ls-files -s
100644 78981922613b2afb6025042ff6bd878ac1994e85 0	a.txt
160000 384618a7e3689f0e90669f836dbfea5d99f6f4fc 0	lib
```

Tuzatish: avval index'dan chiqarish (aks holda `'lib' already exists in the index`), keyin `submodule add`. Papka allaqachon repo bo'lgani uchun klonlash bo'lmaydi:

```bash
$ git rm --cached -f lib
$ git submodule add ../kutubxona.git lib
Adding existing repo at 'lib' to the index
```

Bunday submodule'ning `.git` i papka ichida qoladi ("eski shakl"). `absorbgitdirs` uni `.git/modules/` ga ko'chiradi:

```bash
$ git submodule absorbgitdirs
Migrating git directory of 'lib' from
'/tmp/misol/ichma/lib/.git' to
'/tmp/misol/ichma/.git/modules/lib'
$ cat lib/.git
gitdir: ../.git/modules/lib
```

Pro Git'dagi teskari holat — papkadagi fayllarni submodule'ga ko'chirgan branch'dan eski branch'ga qaytish — `untracked working tree files would be overwritten` xatosini beradi; `checkout -f` bilan o'tish mumkin, lekin saqlanmagan o'zgarishlarni bosib ketadi.

## Kod: submodule'ni o'chirish

`gitsubmodules` hujjatidagi ikki daraja:

**Deinit** — lokal: ish papkasini bo'shatadi va `.git/config` dan `submodule.<nom>` bo'limini olib tashlaydi. Tarixga ta'sir qilmaydi:

```bash
$ git submodule deinit
fatal: Use '--all' if you really want to deinitialize all submodules
$ git submodule deinit vendor/db
Cleared directory 'vendor/db'
Submodule 'vendor/db' (../db-yangi.git) unregistered for path 'vendor/db'
$ git submodule status
-8886c40d9aba130084d752da0e07ef9f660700d7 vendor/db
$ ls .git/modules/vendor
db
```

Argumentsiz `deinit` ataylab xato beradi (hammasini tasodifan o'chirmaslik uchun). `.git/modules/vendor/db` qoldi — `git submodule update --init` tarmoqqa chiqmasdan qaytaradi.

**O'chirish** — tarixda: `git rm` gitlink'ni ham, `.gitmodules` dagi bo'limni ham olib tashlaydi:

```bash
$ git rm vendor/db
rm 'vendor/db'
$ git status -s
M  .gitmodules
D  vendor/db
$ ls .git/modules/vendor
db
```

Commit'dan keyin buni `git revert` bilan qaytarish mumkin. Git papkasi esa ataylab qoldiriladi — eski commit'larni checkout qilganda qayta yuklamaslik uchun. Butunlay tozalash: `.git/modules/<nom>/` ni qo'lda o'chirish.

## Muhandislik nuqtai nazari: submodule qachon kerak, qachon emas

**Qachon kerak.** Ikki loyiha haqiqatan alohida yashaydi (o'z jamoasi, o'z relizlari), lekin siz kutubxonaning **aniq versiyasini** qulflab, ba'zan uning kodini ham o'zgartirmoqchisiz. Yoki katta loyihani kirish huquqi/hajm sababli bir necha repo'ga bo'lish kerak.

**Qachon kerak emas.** Pro Git ochiq aytadi: agar kutubxonani faqat ishlatsangiz, uning tilidagi paket menejeri (npm, Maven, pip...) odatda soddaroq. Submodule bilan har bir jamoa a'zosi `update --init --recursive`, `--recurse-submodules`, "avval submodule'ni push" qoidalarini bilishi shart; bittasi unutsa — tarixda submodule orqaga qaytgan yoki hech qayerda yo'q commit'ga ko'rsatgan commit paydo bo'ladi.

Jamoa uchun minimal kelishuv:

```ini
[submodule]
	recurse = true          # checkout/switch/pull submodule'ni ham yangilaydi
[push]
	recurseSubmodules = check
[status]
	submoduleSummary = true
[diff]
	submodule = log
```

va CI'da `git submodule update --init --recursive` + gitlink'dagi commit submodule remote'ida borligini tekshirish.

## Kod: `git bundle` — repo'ni bitta faylga

Pro Git stsenariysi: tarmoq yo'q (yoki server yo'q), lekin hamkasbga 40 ta commit'ni yuborish kerak va `format-patch` bilan 40 ta fayl jo'natish istalmaydi. Ma'lumotnomaga ko'ra bundle — `.pack` fayl ([18-bob](18-packfile-va-gc.md)) va boshida qaysi ref'lar borligini aytuvchi sarlavha.

Ikki commit'li repo:

```bash
$ git log --oneline
0f61c99 Ikkinchi commit
13e0551 Birinchi commit

$ git bundle create ../repo.bundle HEAD main
$ ls -l ../repo.bundle
-rw-r--r--@ 1 ali   staff  555 Oct  8 17:28 ../repo.bundle
```

(Jarayon xabarlari — "Enumerating objects..." — terminalga ulangan bo'lsa chiqadi; `-q` ularni o'chiradi.) `create` dan keyin `git rev-list` argumentlari keladi: qaysi ref'lar va qaysi commit'lar kirsin. Pro Git: boshqa joyda **klonlanadigan** bo'lsa, `HEAD` ni ham qo'shing.

Fayl ichiga qaraymiz:

```bash
$ head -n 4 ../repo.bundle
# v2 git bundle
0f61c990e7e97a469cb25b3ee3649f68f954c31a HEAD
0f61c990e7e97a469cb25b3ee3649f68f954c31a refs/heads/main

```

Sarlavha: versiya (`v2` — SHA-1 repo'lar uchun; `v3` sarlavhada qo'shimcha imkoniyatlar yozadi, SHA-256 repo'lar uchun shu kerak — `--version`), ref'lar ro'yxati, bo'sh qator. Undan keyin `PACK` bilan boshlanuvchi oddiy packfile.

### Tekshirish va bundle'dan klonlash

```bash
$ git bundle verify ../repo.bundle
../repo.bundle is okay
The bundle contains these 2 refs:
0f61c990e7e97a469cb25b3ee3649f68f954c31a HEAD
0f61c990e7e97a469cb25b3ee3649f68f954c31a refs/heads/main
The bundle records a complete history.
The bundle uses this hash algorithm: sha1

$ git bundle list-heads ../repo.bundle
0f61c990e7e97a469cb25b3ee3649f68f954c31a HEAD
0f61c990e7e97a469cb25b3ee3649f68f954c31a refs/heads/main
```

"complete history" — bundle hech qanday oldingi commit'ni talab qilmaydi, ya'ni bo'sh joyga ham ochiladi. Bundle fayli remote URL o'rnida ishlaydi:

```bash
$ git clone repo.bundle ikkinchi
Cloning into 'ikkinchi'...
$ cd ikkinchi
$ git log --oneline
0f61c99 Ikkinchi commit
13e0551 Birinchi commit
$ git remote -v
origin	/tmp/misol/repo.bundle (fetch)
origin	/tmp/misol/repo.bundle (push)
```

`origin` — faylning o'zi. Undan `fetch`/`pull` qilish mumkin, lekin ma'lumotnomaga ko'ra **bundle'ga `push` qilib bo'lmaydi** — u faqat o'qiladigan manba.

Bundle'da `HEAD` bo'lmasa, Git qaysi branch'ni chiqarishni bilmaydi:

```bash
$ git bundle create ../faqat-ish.bundle ish
$ git clone faqat-ish.bundle besh
Cloning into 'besh'...
warning: remote HEAD refers to nonexistent ref, unable to checkout
```

Pro Git yechimi — `git clone -b ish faqat-ish.bundle besh`. (Sinovda qiziq holat: bundle'da faqat `main` bo'lganda klon baribir ishladi — sinov muhitidagi `init.defaultBranch=main` tasodifan bundle'dagi branch nomiga mos keldi. `-c init.defaultBranch=master` bilan xuddi shu bundle yuqoridagi ogohlantirishni berdi. Bunga tayanmang, `-b` ni yozing.)

### Faqat yangi commit'lar: inkremental bundle

Ikkinchi repo'da uch commit qilindi. Butun repo'ni qayta yuborish ishlaydi, lekin faqat farqni yuborgan yaxshi. Tarmoq protokoli minimal to'plamni o'zi hisoblaydi, bundle'da esa uni **o'zingiz** aytasiz — commit diapazoni bilan ([19-bob](19-revision-tanlash.md)):

```bash
$ git log --oneline main ^origin/main
8141161 Oxirgi commit - ikkinchi repo
ebc282e To'rtinchi commit - ikkinchi repo
86f8a54 Uchinchi commit - ikkinchi repo

$ git bundle create ../commitlar.bundle main ^origin/main
$ ls -l ../commitlar.bundle
-rw-r--r--@ 1 ali   staff  849 Oct  8 17:28 ../commitlar.bundle
$ head -n 4 ../commitlar.bundle
# v2 git bundle
-0f61c990e7e97a469cb25b3ee3649f68f954c31a Ikkinchi commit
814116110bb33f5600fd5c2277cb927d519aa626 refs/heads/main

```

`-` bilan boshlangan qator — **prerequisite** (old shart): qabul qiluvchida bu commit bo'lishi shart. Ma'lumotnomaga ko'ra bunday bundle "thin pack": undagi delta'lar qabul qiluvchida bor obyektlarga tayanadi, shuning uchun kichikroq.

Shu orada birinchi repo'da ham yangi commit paydo bo'ldi. Qabul qilishdan oldin tekshiramiz:

```bash
$ git bundle verify ../commitlar.bundle
../commitlar.bundle is okay
The bundle contains this ref:
814116110bb33f5600fd5c2277cb927d519aa626 refs/heads/main
The bundle requires this ref:
0f61c990e7e97a469cb25b3ee3649f68f954c31a 
The bundle uses this hash algorithm: sha1
```

`verify` bundle formatini **va** old shart commit'lar shu repo'da borligini tekshiradi. Agar yuboruvchi xato qilib faqat oxirgi ikki commit'ni bundle qilganda (`main ^HEAD~2`):

```bash
$ git bundle verify ../yomon.bundle
error: Repository lacks these prerequisite commits:
error: 86f8a545a9e3ef1f2870e37c47c7191ef95c8292 
$ echo $?
1
```

Ko'rsatkich yaxshi: chiqish kodi noldan farqli, ya'ni skriptda ham tekshirsa bo'ladi. Ichidagi ref'larni `list-heads` yoki `ls-remote` bilan ko'rib, `fetch` qilamiz — xuddi oddiy remote'dan:

```bash
$ git bundle list-heads ../commitlar.bundle
814116110bb33f5600fd5c2277cb927d519aa626 refs/heads/main

$ git fetch ../commitlar.bundle main:boshqa-main
From ../commitlar.bundle
 * [new branch]      main       -> boshqa-main

$ git log --oneline --decorate --graph --all
* a7fed86 (HEAD -> main) Uchinchi commit - birinchi repo
| * 8141161 (boshqa-main) Oxirgi commit - ikkinchi repo
| * ebc282e To'rtinchi commit - ikkinchi repo
| * 86f8a54 Uchinchi commit - ikkinchi repo
|/
* 0f61c99 (ish) Ikkinchi commit
* 13e0551 Birinchi commit
```

Endi `boshqa-main` ni oddiy branch kabi merge yoki rebase qilasiz.

### Ma'lumotnomadagi qoidalar

- Bundle'ga **ref nomi** kirishi shart. Faqat hash yoki o'ng tomoni ref bo'lmagan diapazon rad etiladi:

```bash
$ git bundle create ../bosh.bundle $(git rev-parse HEAD)
fatal: Refusing to create empty bundle.
$ git bundle create ../bosh.bundle main~1..main~1
fatal: Refusing to create empty bundle.
```

- Hamma ref'lar: `--all`. Oddiy klon oladigan to'plam: `--branches --tags`. Old shartni boshqa usullar bilan ham berish mumkin: `v1.0.0..main`, `--since=10.days main`, `-10 main`.
- Ehtiyotkorlik bilan "ortiqcha" berish zararsiz — qabul qiluvchida bor obyektlar shunchaki o'tkazib yuboriladi.

**Doimiy "offline" kanal** (ma'lumotnoma misoli): oxirgi yuborilgan joyni teg bilan belgilab, har safar faqat undan keyingisini yuborish. Qabul qiluvchida bundle fayli `origin` bo'lgani uchun faylni yangisi bilan almashtirib `fetch`/`pull` qilish kifoya:

```bash
# yuboruvchi
$ git bundle create ../repo.bundle oxirgi-bundle..main
$ git tag -f oxirgi-bundle main

# qabul qiluvchi (origin = repo.bundle)
$ git fetch
From /tmp/misol/repo.bundle
   0f61c99..a7fed86  main       -> origin/main
```

## Muhandislik nuqtai nazari: bundle zaxira sifatida

Ma'lumotnomaning DISCUSSION bo'limi: repo'ni `cp -r` bilan zaxiralash tavsiya etilmaydi — nusxalash paytida repo'ga yozilsa, nusxa shikastlanishi mumkin. `git bundle create backup.bundle --all` (yoki `git clone --mirror`) Git'ning o'z vositasi bilan izchil surat oladi va `git clone backup.bundle` bilan tiklanadi.

Lekin bundle faqat **ref'lar va ulardan yetib boriladigan obyektlarni** saqlaydi. Unga kirmaydi: index, working tree, stash, lokal config, hook'lar, reflog. Ya'ni bu "tarix zaxirasi", "ish joyi zaxirasi" emas. Ikki tomonda ham SHA-1 yoki ham SHA-256 bo'lishi kerak — bundle sarlavhasi hash algoritmini yozadi.

## Kod: `git replace` — tarixni ulash

Git obyektlari o'zgarmaydi ([14-bob](14-obyektlar-blob.md)), lekin `replace` "o'zgargandek ko'rsatish" imkonini beradi: `refs/replace/<A>` ref'i `B` ga ko'rsatsa, Git `A` so'ralgan har joyda `B` ning mazmunini beradi. Pro Git stsenariysi: uzun tarixli repo'ni ikkiga bo'lish — yangi dasturchilar uchun **qisqa** tarix va tarixni o'rganmoqchilar uchun **to'liq** tarix, keyin kerak bo'lganda ularni `replace` bilan qayta ulash. Afzalligi: qisqa tarixdagi commit hash'lari o'zgarmaydi.

Besh commit'li repo:

```bash
$ git log --oneline
326651f Beshinchi commit
3317128 To'rtinchi commit
5a47d5d Uchinchi commit
cf63a92 Ikkinchi commit
48d86ad Birinchi commit
```

Tarixiy qism — 1–4 commit'lar, qisqa qism — 4–5 (to'rtinchisi ikkalasida ham bor, shu "ustma-ust" joy ulash nuqtasi bo'ladi).

**1-qadam: tarixiy qismni alohida repo'ga.** Branch ochib, uni yangi bare repo'ning `main` iga push qilamiz:

```bash
$ git branch tarix 3317128
$ git remote add loyiha-tarix ../tarix.git
$ git push loyiha-tarix tarix:main
To ../tarix.git
 * [new branch]      tarix -> main
```

**2-qadam: qisqa tarix uchun asos commit.** Ota-onasiz, ichida "to'liq tarixni qanday olish" yo'riqnomasi bo'lgan commit. Uni plumbing buyrug'i `commit-tree` ([16-bob](16-commit-obyekti.md)) bilan uchinchi commit'ning tree'sidan yasaymiz:

```bash
$ echo "To'liq tarix: git remote add loyiha-tarix <url> && git fetch loyiha-tarix && git replace <4-commit> loyiha-tarix/main" | git commit-tree 5a47d5d^{tree}
26d15affbff82bd6a6dc71f83f279ec4eec5dae6
```

**3-qadam: qolgan commit'larni asos ustiga ko'chirish** — `rebase --onto` ([24-bob](24-rebase.md)). `5a47d5d` dan keyingi commit'lar (4 va 5) `26d15af` ustiga:

```bash
$ git rebase --onto 26d15af 5a47d5d
Successfully rebased and updated refs/heads/main.
$ git log --oneline --decorate
d1b83e0 (HEAD -> main) Beshinchi commit
df35e03 To'rtinchi commit
26d15af To'liq tarix: git remote add loyiha-tarix <url> && git fetch loyiha-tarix && git replace <4-commit> loyiha-tarix/main
```

Ota-ona o'zgargani uchun to'rtinchi commit'ning hash'i endi `df35e03` (tree esa o'sha-o'sha). Bu qisqa tarix yangi repo'ga push qilinadi — undan klonlaganlar faqat uch commit ko'radi.

**4-qadam: to'liq tarixni xohlagan odam.** Qisqa repo'ni klonlaydi, tarixiy remote'ni qo'shadi:

```bash
$ git log --oneline main
d1b83e0 Beshinchi commit
df35e03 To'rtinchi commit
26d15af To'liq tarix: ...
$ git remote add loyiha-tarix ../tarix.git
$ git fetch loyiha-tarix
From ../tarix
 * [new branch]      main       -> loyiha-tarix/main
$ git log --oneline loyiha-tarix/main
3317128 To'rtinchi commit
5a47d5d Uchinchi commit
cf63a92 Ikkinchi commit
48d86ad Birinchi commit
```

**5-qadam: ulash.** Qisqa tarixdagi to'rtinchi commit'ni tarixiy repo'dagi to'rtinchisi bilan almashtiramiz:

```bash
$ git replace df35e03 3317128
$ git log --oneline main
d1b83e0 Beshinchi commit
df35e03 To'rtinchi commit
5a47d5d Uchinchi commit
cf63a92 Ikkinchi commit
48d86ad Birinchi commit
```

Tarix uzluksiz ko'rinadi. Pro Git ta'kidlaydigan g'alati jihat: ro'yxatda hash hamon `df35e03`, lekin mazmuni — `3317128` niki. `cat-file` ham almashtirilgan ma'lumotni ko'rsatadi:

```bash
$ git cat-file -p df35e03
tree c295ac8f2dcc766d341ee2cab35a7af71c1a5c93
parent 5a47d5dc82d5a4d7a6aeab9ee6dc01bcf453e99f
author Ali Valiyev <ali@example.com> 1791349440 +0500
committer Ali Valiyev <ali@example.com> 1791349440 +0500

To'rtinchi commit
```

`df35e03` ning haqiqiy otasi `26d15af` edi, bu yerda esa `5a47d5d`. `blame`, `bisect` ([41-bob](41-blame-va-bisect.md)) va boshqa buyruqlar ham to'liq tarix bilan ishlaydi:

```bash
$ git blame f1.txt
^48d86ad (Ali Valiyev 2026-10-07 10:01:00 +0500 1) 1
$ git log --oneline --decorate -2 df35e03
df35e03 (replaced) To'rtinchi commit
5a47d5d Uchinchi commit
```

`--decorate` almashtirilgan commit'ni `(replaced)` deb belgilaydi.

### Ichkarida: `refs/replace/`

```bash
$ git for-each-ref
d1b83e0cca1732c24e129d6250ae4185596c7510 commit	refs/heads/main
33171284ba019b3e1342790c27e1bb24f3abd9a0 commit	refs/remotes/loyiha-tarix/HEAD
33171284ba019b3e1342790c27e1bb24f3abd9a0 commit	refs/remotes/loyiha-tarix/main
d1b83e0cca1732c24e129d6250ae4185596c7510 commit	refs/remotes/origin/HEAD
d1b83e0cca1732c24e129d6250ae4185596c7510 commit	refs/remotes/origin/main
33171284ba019b3e1342790c27e1bb24f3abd9a0 commit	refs/replace/df35e03d7df20379fac2a7e915b650a70b500631
```

Ma'lumotnoma ta'rifi: ref **nomi** — almashtiriladigan obyekt hash'i, **mazmuni** — o'rnini bosuvchi obyekt hash'i ([17-bob](17-reflar-va-head.md)). Hech qanday obyekt o'zgarmadi — faqat bitta ref qo'shildi. Ro'yxat:

```bash
$ git replace
df35e03d7df20379fac2a7e915b650a70b500631
$ git replace -l --format=long
df35e03d7df20379fac2a7e915b650a70b500631 (commit) -> 33171284ba019b3e1342790c27e1bb24f3abd9a0 (commit)
```

Almashtirishni vaqtincha o'chirib, "haqiqatni" ko'rish — `git` dan keyin darhol `--no-replace-objects` (yoki `GIT_NO_REPLACE_OBJECTS` muhit o'zgaruvchisi):

```bash
$ git --no-replace-objects log --oneline main
d1b83e0 Beshinchi commit
df35e03 To'rtinchi commit
26d15af To'liq tarix: ...
$ git --no-replace-objects cat-file -p df35e03 | head -2
tree c295ac8f2dcc766d341ee2cab35a7af71c1a5c93
parent 26d15affbff82bd6a6dc71f83f279ec4eec5dae6
```

### `--graft`, `-d`, turlar

Tarixiy repo'dagi to'rtinchi commit'ni almashtirish o'rniga, `df35e03` ning **faqat otasini** o'zgartirish ham mumkin — `--graft` shu mazmunli, lekin boshqa ota-onali yangi commit yasaydi va unga replace ref qo'yadi:

```bash
$ git replace -d df35e03
Deleted replace ref 'df35e03d7df20379fac2a7e915b650a70b500631'
$ git replace --graft df35e03 loyiha-tarix/main~1
$ git replace -l --format=medium
df35e03d7df20379fac2a7e915b650a70b500631 -> 1123946cb81552bed69f6c3147d979bb659aaf55
$ git log --oneline
d1b83e0 Beshinchi commit
df35e03 To'rtinchi commit
5a47d5d Uchinchi commit
cf63a92 Ikkinchi commit
48d86ad Birinchi commit
```

Natija bir xil, lekin ustma-ust commit shart emas. (`--graft` eskirgan `.git/info/grafts` faylining o'rnini bosadi; eski faylni `--convert-graft-file` replace ref'larga aylantiradi.) Boshqa opsiyalar: `--edit <obyekt>` — obyektni muharrirda tahrirlab, natijani almashtiruvchi qilish; `-f` — mavjud replace ref'ni qayta yozish. Turlar mos bo'lishi shart (`-f` bu cheklovni chetlab o'tadi):

```bash
$ git replace df35e03 HEAD^{tree}
error: Objects must be of the same type.
'df35e03' points to a replaced object of type 'commit'
while 'HEAD^{tree}' points to a replacement object of type 'tree'.
```

### Replace ref'larni bo'lishish

Pro Git "bu ref'larni serverga push qilib boshqalar bilan bo'lishish oson" deydi. To'g'ri, lekin ular **avtomatik** uzatilmaydi — `refs/replace/*` standart refspec'larga kirmaydi:

```bash
$ git push origin 'refs/replace/*'
To /tmp/misol/yangi.git
 * [new reference]   refs/replace/df35e03d... -> refs/replace/df35e03d...

$ git clone yangi.git klon2 && cd klon2
$ git for-each-ref refs/replace
$ git log --oneline | tail -1
26d15af To'liq tarix: ...

$ git fetch origin 'refs/replace/*:refs/replace/*'
From /tmp/misol/yangi
 * [new ref]         refs/replace/df35e03d... -> refs/replace/df35e03d...
$ git log --oneline | tail -2
cf63a92 Ikkinchi commit
48d86ad Birinchi commit
```

Diqqat: `klon2` da `loyiha-tarix` remote'i yo'q, lekin to'liq tarix paydo bo'ldi. Sabab — replace ref'ni push qilganimizda u ko'rsatgan `3317128` va **uning butun tarixi** ham qisqa repo'ga yuklandi. Ya'ni almashtirishni shu repo orqali bo'lishsangiz, ajratishning ma'nosi qolmaydi — Pro Git ham "bu stsenariyda unchalik foydali emas" deydi.

## Muhandislik nuqtai nazari: `replace` ning chegaralari

Ma'lumotnomadagi muhim cheklovlar:

- **Yetib borish tekshiruvlari almashtirishni hisobga olmaydi**: `prune`, pack uzatish (`push`/`fetch`) va `fsck` asl obyektlar bilan ishlaydi. Shuning uchun replace "kosmetik" qatlam — haqiqiy tarix o'zgarmaydi.
- **BUGS**: almashtirilgan blob/tree'ni almashtiruvchisi bilan solishtirish to'g'ri ishlamaydi; `git reset --hard <almashtirilgan-commit>` branch'ni **almashtiruvchi** commit'ga suradi.
- **CAVEATS**: replace ref yoki graft mavjud bo'lsa, **commit-graph** o'chadi — katta repo'larda tarixni ko'rish sekinlashadi.
- Almashtirishni doimiy qilmoqchi bo'lsangiz (masalan, eski tarixni import qilgandan keyin), `git filter-repo` bilan tarixni qayta yozish mumkin ([42-bob](42-reflog-va-tiklash.md)) — u replace ref'larni haqiqiy ota-ona havolalariga aylantiradi. Bu hash'larni o'zgartiradi, shuning uchun jamoa kelishuvi kerak.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `git clone` dan keyin bo'sh submodule papkasida kod qidirish | Klon submodule'larni standart bo'yicha chiqarmaydi | `git clone --recurse-submodules` yoki `git submodule update --init --recursive` |
| `git pull` dan keyin darhol `git commit -a` | Submodule papkasi eski commit'da — commit uni orqaga qaytaradi | `pull` dan keyin `git submodule update --init --recursive`; yoki `submodule.recurse true` |
| Submodule ichida detached HEAD'da commit qilish | Keyingi `update` uni tashlab ketadi | Avval `git switch <branch>`; `update --remote --merge`/`--rebase` |
| Superproject'ni submodule'dan oldin push qilish | Gitlink hech qayerda yo'q commit'ga ko'rsatadi | `push.recurseSubmodules check`; avval submodule'ni push qilish |
| `protocol.file.allow always` ni global yoqish | CVE-2022-39253 himoyasi hamma repo uchun o'chadi | Faqat sinovda, bir buyruq uchun: `git -c protocol.file.allow=always ...` |
| URL o'zgargach faqat `pull` qilish | `.git/config` eski URL'da qoladi | `git submodule sync --recursive` + `update --init --recursive` |
| Submodule'ni papkani o'chirib "o'chirish" | Gitlink va `.gitmodules` qoladi | `git rm <yo'l>` + commit; to'liq — `.git/modules/<nom>` ham |
| Bayroqsiz branch almashtirish | Papka untracked qoladi yoki "new commits" chiqadi | `git switch --recurse-submodules` yoki `submodule.recurse true` |
| Bundle'ni `HEAD` siz yasab, `-b` siz klonlash | "remote HEAD refers to nonexistent ref" | Bundle'ga `HEAD` qo'shish yoki `git clone -b <branch>` |
| Inkremental bundle'ni `verify` siz qabul qilish | Old shart commit yo'q bo'lsa fetch yiqiladi | Avval `git bundle verify`, chiqish kodi 0 bo'lsin |
| Bundle'ni to'liq zaxira deb hisoblash | Stash, config, hook'lar, index kirmaydi | Bundle — tarix zaxirasi; qolganini alohida saqlash |
| `replace` ref'lar klonga o'zi o'tadi deb kutish | `refs/replace/*` standart refspec'da yo'q | `git fetch origin 'refs/replace/*:refs/replace/*'` |

## Amaliyot

1. Ikki lokal bare repo yarating (`kutubxona.git`, `loyiha.git`). Loyiha klonida `git submodule add ../kutubxona.git vendor/k` ni avval oddiy, keyin `-c protocol.file.allow=always` bilan bajaring. Xato xabarini va nega ikkinchisi ishlaganini o'z so'zlaringiz bilan tushuntiring.
2. Commit'dan keyin `git ls-files -s`, `git ls-tree -r -l HEAD` va `git cat-file -p HEAD:vendor` chiqishlarida `160000` yozuvini toping. Shu hash superproject bazasida bormi (`git cat-file -t`)? `vendor/k/.git` faylini va `.git/modules/` ni oching.
3. Loyihani `--recurse-submodules` siz klonlang. `git submodule status` dagi `-` belgisini ko'ring, keyin `init` va `update` ni alohida bajarib, har qadamdan keyin `.git/config` ni solishtiring.
4. Kutubxonaga commit push qiling. Birinchi klonda submodule'ni yangilab commit qiling, ikkinchi klonda `git pull` qiling va `git status` dagi `<` strelkalarini ko'ring. `git submodule update` bilan tuzating.
5. `git submodule set-branch -b <branch>` bilan boshqa branch'ni kuzating, submodule ichida lokal commit qiling va `update --remote --rebase` bilan yangilang. Keyin bayroqsiz `update --remote` qilib, lokal commit'ingiz qayerda qolganini toping.
6. Uch commit'li repo'dan `HEAD` va `main` bilan bundle yasang, `verify` va `list-heads` qiling, undan klonlang. Klonda ikki commit qiling, `main ^origin/main` bilan inkremental bundle yasab, asl repo'ga `fetch` qiling. `head -n 4` bilan ikkala bundle sarlavhasini solishtiring.
7. (Qiyinroq) Besh commit'li repo'da Pro Git'ning `replace` stsenariysini to'liq takrorlang: tarixiy repo'ga push, `commit-tree` bilan asos commit, `rebase --onto`, yangi klonda `git replace`. Keyin xuddi shu natijani `git replace --graft` bilan oling. `git --no-replace-objects log` bilan haqiqiy tarixni ko'ring va replace ref'ni push qilganda server repo'siga qaysi obyektlar qo'shilganini `git count-objects -v` bilan aniqlang.

## Rasmiy hujjat

- Pro Git — Submodules: <https://git-scm.com/book/en/v2/Git-Tools-Submodules>
- Pro Git — Bundling: <https://git-scm.com/book/en/v2/Git-Tools-Bundling>
- Pro Git — Replace: <https://git-scm.com/book/en/v2/Git-Tools-Replace>
- `gitsubmodules` (FORMS, ACTIVE SUBMODULES): <https://git-scm.com/docs/gitsubmodules>
- `git submodule`: <https://git-scm.com/docs/git-submodule>
- `git bundle`: <https://git-scm.com/docs/git-bundle>
- `git replace`: <https://git-scm.com/docs/git-replace>
- `git config` — `protocol.allow`, `protocol.<name>.allow`: <https://git-scm.com/docs/git-config#Documentation/git-config.txt-protocolallow>
- Git 2.38.1 / 2.30.6 xavfsizlik relizi (CVE-2022-39253): <https://github.com/git/git/blob/master/Documentation/RelNotes/2.30.6.adoc>
