# 26 — Murakkab merge

[← Oldingi: Tarixni qayta yozish](25-tarixni-qayta-yozish.md) · [Mundarija](README.md) · [Keyingi: Remote'lar →](27-remote.md)

## Tushuncha

[21-bobda](21-branch-va-merge.md) merge'ning ikki turini, [22-bobda](22-konfliktlar.md) esa konflikt paytida index'da nima bo'lishini (1/2/3 bosqichlar, `MERGE_HEAD`, `AUTO_MERGE`) ko'rdik. Bu bob — undan keyingi qadam: **merge'ni boshqarish**.

Har `git merge` ortida bitta savol turadi: "ikki (yoki undan ko'p) tarixdan bitta natija tree'sini qanday hosil qilaman?" Bu savolga javob beradigan algoritm — **merge strategiyasi** (*merge strategy*). Siz hozirgacha bilmagan holda doim bittasini ishlatgansiz — `ort`. Chiqishdagi `Merge made by the 'ort' strategy.` qatori aynan shu haqda.

Bobda to'rt mavzu bor:

| Mavzu | Savol | Asosiy buyruqlar |
| --- | --- | --- |
| Strategiyalar va ularning opsiyalari | Natijani qanday hisoblash kerak? | `-s ort`, `-s ours`, `-s subtree`, `-s octopus`, `-X ours`, `-X theirs`, `-X ignore-space-change` |
| Merge'ni bekor qilish | Xato merge qildim — endi nima? | `reset --hard ORIG_HEAD`, `revert -m 1`, "revert'ni revert qilish" |
| Subtree merge | Boshqa loyihani papka sifatida qanday qo'shaman? | `read-tree --prefix`, `merge -s subtree`, `-X subtree=<yo'l>` |
| `rerere` | Bir xil konfliktni qayta-qayta hal qilmaslik mumkinmi? | `rerere.enabled`, `git rerere status/diff/forget`, `.git/rr-cache` |

Ikkita atamani boshidanoq ajratib oling, chunki ular bir xil eshitiladi:

- **strategiya** (`-s <nom>`, `--strategy`) — butun algoritmni almashtiradi;
- **strategiya opsiyasi** (`-X <opsiya>`, `--strategy-option`) — tanlangan strategiyaga (odatda `ort`ga) beriladigan sozlama.

`-s ours` va `-X ours` — butunlay boshqa narsalar. Bob davomida bu farqni amalda ko'ramiz.

## Nega shunday: nega Git bir nechta merge algoritmini saqlaydi

Uch tomonlama merge ([21-bob](21-branch-va-merge.md)) ko'p holatda yetarli: ikki uch va bitta umumiy ajdod. Lekin hayotda boshqa vaziyatlar ham bor:

- **Uch-to'rtta branch'ni bitta commit bilan birlashtirish** — masalan, bir-biriga tegmaydigan bir nechta topic branch'ni sinov uchun yig'ish. Ikki tomonli algoritm bunga mos emas — `octopus` kerak.
- **Boshqa tomonning ishini "qabul qildim" deb belgilash, lekin uning o'zgarishlarini olmaslik** — eski tarixni "yopish" uchun. Bu — `ours` strategiyasi.
- **Bir loyiha boshqasining ichidagi papkaga to'g'ri kelsa** — tree'larni bir-biriga moslab siljitish kerak. Bu — `subtree`.

Git falsafasi: oddiy holatni standart strategiya hal qiladi, maxsus holat uchun maxsus vosita bor, va ularni almashtirish bitta flag bilan. Strategiyaning o'zi faqat "natija tree'si qanday bo'ladi" degan savolga javob beradi. Merge commit obyekti ([16-bob](16-commit-obyekti.md)) har doim bir xil tuziladi: bitta `tree`, bir nechta `parent`.

Ikkinchi savol — **merge'ni bekor qilish** nega oddiy emas. Chunki merge commit ikki narsani yozadi: **ma'lumot** (natija tree'si) va **tarix** (ikkinchi ota — "bu branch endi birlashtirilgan"). `git revert` faqat ma'lumotni qaytaradi; tarixdagi "birlashtirilgan" belgisi qoladi. Bu bobning eng nozik joyi va uni haqiqiy repo'da ko'ramiz.

## Kod: strategiyalar ro'yxati

Mavjud bo'lmagan strategiya nomini bersangiz, Git ro'yxatni o'zi aytadi:

```text
$ git merge -s theirs tarjima
Could not find merge strategy 'theirs'.
Available strategies are: octopus ours recursive resolve subtree.
```

Qiziq tafsilot: ro'yxatda `ort` yo'q, lekin u standart strategiya va `-s ort` bilan ishlaydi (Git 2.56.0 da tekshirildi). v2.56 ma'lumotnomasi (MERGE STRATEGIES) bo'yicha to'liq manzara:

| Strategiya | Nechta uch | Nima qiladi | Qachon |
| --- | --- | --- | --- |
| `ort` | 2 | Uch tomonlama merge; rename'larni aniqlaydi; bir nechta umumiy ajdod bo'lsa, ularni avval birlashtirib, virtual ajdod yasaydi | Standart — bitta branch merge qilinganda |
| `recursive` | 2 | v2.50.0 dan beri `ort` ning sinonimi | Eski skriptlar uchun |
| `resolve` | 2 | Eski, sodda uch tomonlama merge; rename'larni bilmaydi | Deyarli hech qachon |
| `octopus` | 3+ | Ko'p branch'ni bitta commit'da birlashtiradi; qo'lda hal qilish kerak bo'lsa, rad etadi | Standart — bir nechta branch berilganda |
| `ours` | istalgan | Natija tree'si — **har doim joriy branch'niki**; boshqa tomonga umuman qaramaydi | Eski tarixni "yopish" |
| `subtree` | 2 | `ort` ning o'zgartirilgani: tree'larni bir-biriga mos kelguncha siljitadi | Boshqa loyiha papka sifatida |

`ort` nomi — "Ostensibly Recursive's Twin" ("go'yoki recursive'ning egizagi") qisqartmasi: u eski `recursive` o'rniga yozilgan. Git 0.99.9k dan v2.33.0 gacha standart `recursive` edi; v2.34 dan standart — `ort`; v2.50.0 dan `recursive` nomi ham `ort` ga yo'naltirilgan.

> **Pro Git bilan farq.** Pro Git (2-nashr) hamma joyda "standart strategiya — `recursive`" deydi va chiqishlarda `Merge made by the 'recursive' strategy.` ko'rsatadi. Hozir standart — `ort`. `-s recursive` ham ishlaydi va chiqishda hamon `'recursive'` deb yozadi, lekin ichkarida bu `ort`:
>
> ```text
> $ git merge -s recursive -X ours tarjima -m r
> Auto-merging salom.txt
> Merge made by the 'recursive' strategy.
>  salom.txt | 1 +
>  1 file changed, 1 insertion(+)
> ```

`resolve` ning ichki ishini ko'rish ham foydali — u eski "skript" mexanizmini ishlatadi va qadamlarini aytib boradi:

```text
$ git merge -s resolve tarjima -m r
error: Merge requires file-level merging
Trying really trivial in-index merge...
Nope.
Trying simple merge.
Simple merge failed, trying Automatic merge.
Auto-merging salom.txt
ERROR: content conflict in salom.txt
fatal: merge program failed
Automatic merge failed; fix conflicts and then commit the result.
```

Konflikt holati esa `ort` dagi kabi: index'da 1/2/3 bosqichlar, `git merge --abort` bilan qaytish ([22-bob](22-konfliktlar.md)).

`-s` bir necha marta berilishi mumkin — Git ularni tartib bilan sinab ko'radi. `-s` umuman berilmasa, Git o'zi tanlaydi: bitta branch uchun `ort`, bir nechta uchun `octopus`. Standartni o'zgartirish sozlamalari — `pull.twohead` (ikki uch uchun) va `pull.octopus` (ko'p uch uchun). Ma'lumotnoma ularni faqat `pull` uchun ta'riflaydi, lekin sinovda oddiy `git merge` ham ularni o'qidi: `git config pull.twohead resolve` dan keyin `git merge tarjima` `resolve` ning `Trying really trivial in-index merge...` qatorlarini chiqardi. Ularni o'zgartirishga deyarli hech qachon ehtiyoj yo'q.

## Kod: tajriba repo'si

Strategiya va opsiyalarni bitta kichik repo'da solishtiramiz. `salom.txt`:

```text
Salom, dunyo!
Bu - birinchi qator.
Bu - oxirgi qator.
```

`tarjima` branch'ida salom inglizchaga o'tadi va oxiriga qator qo'shiladi; `main`da salom rasmiylashadi va ikkinchi qator o'zgaradi:

```bash
$ git switch -c tarjima
$ # 1-qator: "Hello, world!", oxiriga: "Yangi qator (tarjima)."
$ git commit -am "Inglizcha salom va yangi qator"
$ git switch main
$ # 1-qator: "Assalomu alaykum, dunyo!", 2-qator: "Bu - 1-qator."
$ git commit -am "Rasmiy salom"
```

```text
$ git log --oneline --graph --all
* f26c14e Rasmiy salom
| * 88ac9c2 Inglizcha salom va yangi qator
|/
* b04dcae Boshlang'ich
```

Oddiy merge — konflikt:

```text
$ git merge tarjima
Auto-merging salom.txt
CONFLICT (content): Merge conflict in salom.txt
Automatic merge failed; fix conflicts and then commit the result.

$ cat salom.txt
<<<<<<< HEAD
Assalomu alaykum, dunyo!
Bu - 1-qator.
=======
Hello, world!
Bu - birinchi qator.
>>>>>>> tarjima
Bu - oxirgi qator.
Yangi qator (tarjima).
```

E'tibor bering: 1- va 2-qator **bitta** konflikt bo'lagiga (*hunk*) tushdi. `main` 2-qatorni ham o'zgartirgani uchun ikki o'zgarish yonma-yon turibdi va Git ularni bitta hududga birlashtirdi. Bu keyingi bo'limda muhim bo'ladi. Oxirgi qator konfliktsiz qo'shildi. `git merge --abort` bilan qaytamiz.

## Kod: `-X ours` va `-X theirs` — konfliktli bo'laklarda bir tomonni tanlash

**Muammo.** Konflikt chiqadi, lekin oldindan bilasiz: ziddiyatli joyda har doim bir tomon to'g'ri. Masalan, avtomatik generatsiya qilingan fayl, yoki "bu branch'dagi tarjimalar ustun".

**Yechim.** `ort` strategiyasining `ours`/`theirs` opsiyalari: konflikt belgilari qo'yilmaydi, konfliktli bo'lak to'liq bir tomondan olinadi, **konfliktsiz** o'zgarishlar esa odatdagidek ikkala tomondan birlashtiriladi.

```text
$ git merge -X ours tarjima -m "Merge -X ours"
Auto-merging salom.txt
Merge made by the 'ort' strategy.
 salom.txt | 1 +
 1 file changed, 1 insertion(+)

$ cat salom.txt
Assalomu alaykum, dunyo!
Bu - 1-qator.
Bu - oxirgi qator.
Yangi qator (tarjima).
```

Konfliktli bo'lak — `main`dan, `tarjima`ning konfliktsiz qo'shgan oxirgi qatori ham natijada. Endi teskarisi (avval `git reset --hard HEAD~` bilan oldingi merge'ni olib tashlab):

```text
$ git merge -X theirs tarjima -m "Merge -X theirs"
Auto-merging salom.txt
Merge made by the 'ort' strategy.
 salom.txt | 5 +++--
 1 file changed, 3 insertions(+), 2 deletions(-)

$ cat salom.txt
Hello, world!
Bu - birinchi qator.
Bu - oxirgi qator.
Yangi qator (tarjima).
```

Diqqat qiling: `main`ning `Bu - 1-qator.` o'zgarishi **ham yo'qoldi**, garchi `tarjima` 2-qatorga tegmagan bo'lsa ham. Sababi — u 1-qator bilan bitta konflikt bo'lagida edi, `-X theirs` esa butun bo'lakni oladi. Ya'ni bu opsiyalar **qator** darajasida emas, **bo'lak** darajasida ishlaydi. Shuning uchun `-X ours/theirs` dan keyin natijani `git show` yoki `git diff HEAD~` bilan ko'zdan kechiring.

[22-bobdagi](22-konfliktlar.md) `git restore --theirs <fayl>` bilan farq:

| Buyruq | Qachon | Nimani oladi |
| --- | --- | --- |
| `git restore --theirs fayl` | Konflikt chiqqandan **keyin** | **Butun faylni** stage 3 dan; konfliktsiz o'zgarishlaringiz ham yo'qoladi |
| `git merge -X theirs` | Merge **paytida** | Faqat konfliktli bo'laklarni; qolgan hammasi odatdagidek birlashadi |

Binar fayl uchun `-X ours` butun faylni o'z tomondan oladi (ma'lumotnoma). Bitta faylni qo'lda qayta merge qilganda ham shu tanlov bor: `git merge-file --ours` / `--theirs` / `--union`.

## Kod: `-s ours` — "soxta" merge

Endi strategiyaning o'zi `ours`:

```text
$ git merge -s ours tarjima -m "Merge -s ours"
Merge made by the 'ours' strategy.

$ cat salom.txt
Assalomu alaykum, dunyo!
Bu - 1-qator.
Bu - oxirgi qator.

$ git diff HEAD~ HEAD
$
```

`git diff` bo'sh: natija tree'si birinchi ota bilan **aynan bir xil**. `tarjima`ning konfliktsiz qatori ham kirmadi — `ours` strategiyasi boshqa tomonga umuman qaramaydi. Lekin tarixda bu haqiqiy merge commit:

```text
$ git log --oneline --graph -3
*   9d02374 Merge -s ours
|\
| * 88ac9c2 Inglizcha salom va yangi qator
* | f26c14e Rasmiy salom
|/

$ git branch --merged
* main
  tarjima

$ git merge tarjima
Already up to date.
```

Git endi `tarjima`ni "birlashtirilgan" deb hisoblaydi: u `main`ning ajdodi. Bu aynan maqsad — ma'lumotnoma: "eski yon tarixni almashtirish (*supersede*) uchun mo'ljallangan".

**Qachon kerak.** Pro Git misoli: `release` branch'idan ish olib boryapsiz, keyinroq uni `main`ga merge qilasiz. Shu orada `main`dagi xatoni tuzatuvchi `bugfix` branch'ini `release`ga ham merge qildingiz. `main`da tuzatish allaqachon bor, shuning uchun `main`ga `git merge -s ours bugfix` qilib qo'ysangiz, keyinchalik `release`ni `main`ga merge qilganda shu tuzatish qayta konflikt bermaydi — Git uni allaqachon birlashtirilgan deb biladi.

**Nega `-s theirs` yo'q.** Ma'lumotnoma ataylab aytadi: `-X theirs` opsiyasi bor, lekin u bilan chalkashtiriladigan `theirs` strategiyasi yo'q. Joriy branch'ni boshqasining tree'si bilan almashtirmoqchi bo'lsangiz, bu merge emas — `git reset --hard <branch>` ([39-bob](39-reset-sirlari.md)) yoki o'sha tomonda `git merge -s ours`.

| | `-X ours` | `-s ours` |
| --- | --- | --- |
| Nima | `ort` opsiyasi | Alohida strategiya |
| Konfliktsiz o'zgarishlar | Ikkala tomondan olinadi | Boshqa tomonnikilar **olinmaydi** |
| Konfliktli bo'laklar | Bizning tomondan | — (hech narsa solishtirilmaydi) |
| Natija | Haqiqiy birlashma | Joriy tree + ikkinchi ota |
| Nechta branch | 1 | Istalgancha |

## Kod: bo'sh joy (whitespace) bilan bog'liq konfliktlar

Jamoada kimdir butun faylni qayta formatlasa (masalan, chekinishni 2 dan 4 bo'sh joyga), har qator o'zgaradi va har qanday parallel ish konflikt beradi:

```bash
$ cat hisob.js
function hisob(a, b) {
  const s = a + b;
  return s;
}
$ git switch -c format        # chekinish 2 → 4 bo'sh joy
$ git commit -am "Chekinishni 4 bo'sh joyga o'tkazish"
$ git switch main             # "a + b" → "a + b + 1"
$ git commit -am "Hisobga 1 qo'shish"
```

```text
$ git merge format
Auto-merging hisob.js
CONFLICT (content): Merge conflict in hisob.js
Automatic merge failed; fix conflicts and then commit the result.
```

Mazmun jihatdan konflikt yo'q — `format` faqat bo'sh joylarni o'zgartirgan. `git merge --abort` va qaytadan, bo'sh joyni e'tiborsiz qoldirib:

```text
$ git merge -X ignore-space-change format -m "Merge branch 'format'"
Auto-merging hisob.js
Merge made by the 'ort' strategy.

$ cat hisob.js | sed 's/ /·/g'
function·hisob(a,·b)·{
··const·s·=·a·+·b·+·1;
··return·s;
}
```

Natijada **ikkita bo'sh joyli** chekinish qoldi — `format` branch'ining ishi amalda tushib qoldi. Bu xato emas, ma'lumotnomada yozilgan qoida:

- "their" versiyasi qatorga **faqat** bo'sh joy o'zgarishini kiritgan bo'lsa — "our" versiya olinadi;
- "our" versiya bo'sh joyni o'zgartirgan, "their" esa mazmunni — "their" versiya olinadi;
- qolgan holatda odatdagi merge.

Shu sababli opsiya "konfliktni yo'qotadi", lekin formatlashni saqlamaydi. Formatlash kerak bo'lsa, merge'dan keyin formatlovchini (masalan `prettier`) qayta ishga tushiring. Pro Git yana bir yo'lni ko'rsatadi: [22-bobdagi](22-konfliktlar.md) kabi uch bosqichni `git show :1:`, `:2:`, `:3:` bilan faylga chiqarib, bir tomonni oldindan tozalab, `git merge-file` bilan qayta birlashtirish.

Bo'sh joy opsiyalari:

| Opsiya | `git diff` dagi o'xshashi | Nimani teng deb biladi |
| --- | --- | --- |
| `-X ignore-space-change` | `-b` | Bir yoki undan ko'p bo'sh joy ketma-ketligini bir-biriga teng; qator oxiridagi bo'sh joyni e'tiborsiz |
| `-X ignore-all-space` | `-w` | Bo'sh joyni umuman hisobga olmaydi |
| `-X ignore-space-at-eol` | `--ignore-space-at-eol` | Faqat qator oxiridagi bo'sh joy |
| `-X ignore-cr-at-eol` | `--ignore-cr-at-eol` | Qator oxiridagi CR (`\r`, Windows qator oxiri) |
| `-X renormalize` | — | Uchala versiyani `.gitattributes` qoidalari bo'yicha qayta normallashtirib solishtiradi ([46-bob](46-gitattributes.md)) |

Ma'lumotnoma ogohlantiradi: bo'sh joy o'zgarishi boshqa o'zgarish bilan **bir qatorda** aralashgan bo'lsa, u e'tiborsiz qoldirilmaydi.

### `ort` ning boshqa opsiyalari

| Opsiya | Nima qiladi |
| --- | --- |
| `-X find-renames[=<n>]` | Rename aniqlash (standart yoqilgan), o'xshashlik chegarasi bilan; `merge.renames` sozlamasini almashtiradi |
| `-X no-renames` | Rename aniqlashni o'chiradi |
| `-X diff-algorithm=<alg>` | `histogram` (standart), `myers`, `minimal`, `patience` — bir xil, lekin ahamiyatsiz qatorlar (masalan, turli funksiyalarning `}` qavslari) noto'g'ri moslashib qolishining oldini olish uchun |
| `-X subtree[=<yo'l>]` | Tree'larni berilgan yo'l bilan siljitadi (pastda) |
| `-X patience`, `-X histogram`, `-X rename-threshold=<n>` | Eskirgan sinonimlar |

Ma'lumotnomadagi yana bir nozik qoida: `ort` faqat **ikki uch va merge base**ni solishtiradi, oraliq commit'larni emas. Agar ikkala branch bir xil o'zgarish qilgan, keyin bittasi uni qaytargan (revert) bo'lsa, natijada o'zgarish **qoladi** — merge nuqtai nazaridan qaytargan tomon "hech narsa o'zgartirmagan".

## Kod: `octopus` — ko'p branch'ni bitta commit'da

Uchta bir-biriga tegmaydigan topic branch: `header`, `footer`, `menyu`. `main`da ham bitta yangi commit bor. Bir nechta branch nomini bersangiz, Git avtomatik `octopus` ni tanlaydi:

```text
$ git merge header footer menyu
Trying simple merge with header
Trying simple merge with footer
Trying simple merge with menyu
Merge made by the 'octopus' strategy.
 footer.html | 1 +
 header.html | 1 +
 menyu.html  | 1 +
 3 files changed, 3 insertions(+)
 create mode 100644 footer.html
 create mode 100644 header.html
 create mode 100644 menyu.html

$ git log --oneline --graph
*---.   5e83988 Merge branches 'header', 'footer' and 'menyu'
|\ \ \
| | | * 21268ec Menyu
| | * | d7e12c9 Footer
| | |/
| * / 803940b Header
| |/
* / 59337c4 README tavsifi
|/
* cebb5fd Boshlang'ich
```

`octopus` (sakkizoyoq) nomi grafdan ko'rinib turibdi. Commit obyektida — **to'rtta** `parent`:

```text
$ git cat-file -p HEAD | grep parent
parent 59337c455efa41953a932ecb963f212515e654b5
parent 803940b6c7ed22b9b296dc0a1fc8a51625a6024a
parent d7e12c90adbf91f5b35922ece0f3734de5aa53db
parent 21268ecc9f5a45c58336b7a7b3f60d1fffb319ea

$ git rev-parse HEAD^1 HEAD^2 HEAD^3 HEAD^4
59337c455efa41953a932ecb963f212515e654b5
803940b6c7ed22b9b296dc0a1fc8a51625a6024a
d7e12c90adbf91f5b35922ece0f3734de5aa53db
21268ecc9f5a45c58336b7a7b3f60d1fffb319ea
```

`HEAD^3`, `HEAD^4` — "uchinchi va to'rtinchi ota" sintaksisi ([19-bob](19-revision-tanlash.md)). Tartib — siz yozgan tartib, birinchi ota doim joriy branch.

Bir nozik joy: agar `main`da yangi commit bo'lmaganda (ya'ni `main` hamma branch'larning ajdodi bo'lganda), Git birinchi branch'ga fast-forward qiladi va qolganlarini uning ustiga birlashtiradi — chiqishda `Fast-forwarding to: header` qatori chiqadi va birinchi ota eski `main` emas, `header` bo'ladi. Merge commit majburiy kerak bo'lsa — `--no-ff`.

### `octopus` konfliktni hal qilmaydi

Ikki branch README'ning bir qatorini har xil o'zgartirgan:

```text
$ git merge sarlavha1 sarlavha2
Fast-forwarding to: sarlavha1
Trying simple merge with sarlavha2
Simple merge did not work, trying automatic merge.
Auto-merging README.md
ERROR: content conflict in README.md
fatal: merge program failed
Automatic merge failed; fix conflicts and then commit the result.

$ cat README.md
<<<<<<< .merge_file_HwtoWW
# Mening saytim
=======
# Bizning sayt
>>>>>>> .merge_file_AwaMM1
Kichik sayt.
```

Belgilar ichidagi yorliqlar — vaqtinchalik fayl nomlari, branch nomlari emas: `octopus` eski skript mexanizmi orqali ishlaydi. Ma'lumotnoma: `octopus` "qo'lda hal qilishni talab qiladigan murakkab merge'ni rad etadi" — ya'ni u konfliktni siz bilan birga hal qilish uchun mo'ljallanmagan. To'g'ri yo'l:

```bash
$ git merge --abort
$ git merge sarlavha1          # birma-bir, ort bilan
$ git merge sarlavha2          # konfliktni 22-bobdagi kabi hal qilasiz
```

**Qachon kerak.** Ma'lumotnoma: asosan topic branch uchlarini "to'plab" birlashtirish uchun. Git loyihasining o'zi sinov branch'larini shunday yig'adi. Kundalik jamoa ishida octopus kam uchraydi; ko'p ota `git bisect` va `git log --first-parent` bilan ishlashni biroz murakkablashtiradi.

## Kod: merge'ni bekor qilish

Xato merge qildingiz: branch tayyor emas edi yoki noto'g'ri branch'ga birlashtirdingiz. Pro Git ikki yo'lni ko'rsatadi; qaysi biri to'g'ri ekani bitta savolga bog'liq: **merge commit boshqalarga ketganmi (push qilinganmi)?**

Tajriba tarixi: `tolov` branch'ida ikki commit (`A`, `B`), `main`da `Sozlamalar`, keyin merge:

```text
$ git merge --no-edit tolov
Merge made by the 'ort' strategy.
 tolov.txt | 2 ++
 1 file changed, 2 insertions(+)

$ git log --oneline --graph
*   5701ab9 Merge branch 'tolov'
|\
| * 9eb6ed2 B: naqd to'lov
| * 792afc4 A: karta orqali to'lov
* | 9abe168 Sozlamalar
|/
* 21230e2 Boshlang'ich
```

### 1-yo'l: ref'ni orqaga surish (faqat lokal merge uchun)

Merge hali faqat sizda bo'lsa, eng toza yechim — `main` ko'rsatkichini merge'dan oldingi joyga qaytarish. Merge'dan oldingi `HEAD`ni Git `ORIG_HEAD`ga yozib qo'ygan ([22-bob](22-konfliktlar.md)):

```text
$ cat .git/ORIG_HEAD
9abe168792982b807965eff0ddd2e33ba345fc08
$ git reset --hard ORIG_HEAD
HEAD is now at 9abe168 Sozlamalar

$ git log --oneline --graph --all
* 9abe168 Sozlamalar
| * 9eb6ed2 B: naqd to'lov
| * 792afc4 A: karta orqali to'lov
|/
* 21230e2 Boshlang'ich
```

Pro Git'dagi variant — `git reset --hard HEAD~` (birinchi ota). `reset --hard` uch ish qiladi: branch'ni suradi, index'ni `HEAD`ga moslaydi, working tree'ni index'ga moslaydi ([39-bob](39-reset-sirlari.md)). `tolov` branch'i va uning commit'lari joyida — faqat `main` merge'dan "voz kechdi".

> **Ogohlantirish.** `reset --hard` commit qilinmagan o'zgarishlarni qaytarib bo'lmaydigan qilib o'chiradi. Merge commit'ning o'zi esa yo'qolmaydi — reflog'da turadi va qaytarish mumkin ([42-bob](42-reflog-va-tiklash.md)):
>
> ```text
> $ git reflog -3
> 9abe168 HEAD@{0}: reset: moving to ORIG_HEAD
> 5701ab9 HEAD@{1}: merge tolov: Merge made by the 'ort' strategy.
> 9abe168 HEAD@{2}: commit: Sozlamalar
> $ git reset --hard HEAD@{1}      # merge'ni qaytarish
> ```

Bu yo'lning ikki cheklovi (Pro Git): tarixni qayta yozadi — merge boshqalarda bo'lsa, ishlatmang ([24-bob](24-rebase.md)dagi oltin qoida); merge'dan keyin yangi commit'lar bo'lsa, ular ham yo'qoladi.

### 2-yo'l: `git revert -m 1` (push qilingan merge uchun)

Merge'dan keyin `Log qo'shish` commit'i ham bo'ldi va hammasi serverda. Tarixni o'zgartirib bo'lmaydi — yangi, teskari commit kerak. Oddiy `revert` merge commit uchun ishlamaydi:

```text
$ git revert HEAD~1
error: commit 5701ab91c0ab6804a705e4be8fbcaf307a2ffbdb is a merge but no -m option was given.
fatal: revert failed
```

Nega? Oddiy commit'ning bitta otasi bor, `revert` "ota bilan farqni teskari qo'llaydi". Merge commit'ning ikki otasi bor va Git qaysi otaga nisbatan qaytarishni bilmaydi. `-m <raqam>` (`--mainline`) — qaysi ota "asosiy chiziq" ekanini aytadi:

```text
$ git revert --no-edit -m 1 HEAD~1
[main 849bb3a] Revert "Merge branch 'tolov'"
 Date: Wed Oct 7 13:06:00 2026 +0500
 1 file changed, 2 deletions(-)

$ git cat-file -p HEAD
tree 3b244ce66d6afb603bb5700dc31f66eda642f780
parent ba4e7d79434becedbd2e35f18b64e1f139e74baa
author Ali Valiyev <ali@example.com> 1791360360 +0500
committer Ali Valiyev <ali@example.com> 1791360360 +0500

Revert "Merge branch 'tolov'"

This reverts commit 5701ab91c0ab6804a705e4be8fbcaf307a2ffbdb, reversing
changes made to 9abe168792982b807965eff0ddd2e33ba345fc08.
```

`-m 1` — "1-ota (`9abe168`, `main`) asosiy; 2-ota olib kirgan hamma narsani qaytar". Xabar ham shuni aytadi: "`9abe168` ga qilingan o'zgarishlarni qaytaradi". Revert commit'ning o'zi oddiy, bitta otali commit.

`-m 2` teskari ish qiladi — `tolov` tomonini asosiy deb, `main` tomonida qilingan narsalarni qaytaradi. Bu yerda u `Sozlamalar` commit'ini bekor qilardi:

```text
$ git revert --no-commit -m 2 5701ab9
$ git status -s
D  sozlama.txt
```

Odatda kerakli raqam — `1`: `git merge <branch>` qilganingizda birinchi ota doim siz turgan branch.

```text
Revert'dan keyin:
  ---o---o---M---x---W        ← main     (W = M ning teskarisi)
            /
    ---A---B                  ← tolov

  W'ning tree'si = "M bo'lmaganda qanday bo'lardi" (x ham saqlangan)
```

### Revert'dan keyingi muammo: qayta merge

Endi eng muhim joy. `tolov` jamoasi xatoni tuzatadi va siz branch'ni qayta merge qilmoqchisiz. Avval tuzatishsiz urinib ko'ramiz:

```text
$ git merge tolov
Already up to date.
```

Git uchun `tolov`da `main`dan erishib bo'lmaydigan hech narsa yo'q — `A` va `B` `M` orqali allaqachon `main` tarixida. Endi `tolov`ga yangi commit `C` qo'shiladi (testlar fayli) va qayta merge:

```text
$ git merge --no-edit tolov
Merge made by the 'ort' strategy.
 tolov_test.txt | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 tolov_test.txt

$ cat tolov.txt
# To'lov usullari
```

Merge muvaffaqiyatli, konflikt yo'q — **lekin `A` va `B` ning o'zgarishlari (karta, naqd) yo'q**. Faqat `C` keldi. Sababi: merge base endi `B`:

```text
$ git merge-base HEAD~1 tolov
9eb6ed22a090e8ddf16751f3523c594b292e0dcc
```

Git faqat "`B` dan beri nima o'zgardi"ni solishtiradi; `B` gacha bo'lgan hamma narsa uning nazarida allaqachon birlashtirilgan. Rasmiy "How to revert a faulty merge" maqolasida Linus Torvalds buni shunday ifodalaydi: merge'ni revert qilish **ma'lumotni** qaytaradi, lekin merge'ning **tarixga** ta'sirini mutlaqo bekor qilmaydi. Keyingi merge'lar eski merge'ni oxirgi umumiy holat deb ko'radi.

`git revert` ma'lumotnomasi ham `-m` haqida aynan shuni ogohlantiradi: merge'ni revert qilish "merge olib kirgan tree o'zgarishlarini hech qachon xohlamasligingizni e'lon qiladi"; keyingi merge'lar faqat oldingi revert qilingan merge'ning ajdodi bo'lmagan commit'larning o'zgarishlarini olib kiradi.

Bu xavfli, chunki **jim** bo'ladi: konflikt ham, ogohlantirish ham yo'q. Agar `C` `A`/`B` tegadigan qatorlarni o'zgartirgan bo'lsa, odatda konflikt chiqadi (masalan, revert faylni o'chirgan bo'lsa — `modify/delete`); bu misolda esa jimgina yo'qoldi.

### Yechim: "revert'ni revert qilish"

Noto'g'ri merge'ni olib tashlaymiz (u hali lokal) va to'g'ri yo'ldan boramiz: avval eski revert commit `W` ni revert qilamiz — bu `A` va `B` o'zgarishlarini qaytaradi — keyin qayta merge:

```text
$ git reset --hard HEAD~1
$ git log --oneline -1
849bb3a Revert "Merge branch 'tolov'"

$ git revert --no-edit HEAD
[main 8813a27] Reapply "Merge branch 'tolov'"
 Date: Wed Oct 7 13:09:00 2026 +0500
 1 file changed, 2 insertions(+)
$ cat tolov.txt
# To'lov usullari
karta
naqd

$ git merge --no-edit tolov
Merge made by the 'ort' strategy.
 tolov_test.txt | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 tolov_test.txt

$ git log --oneline --graph
*   663db7b Merge branch 'tolov'
|\
| * b777978 C: to'lov testlari
* | 8813a27 Reapply "Merge branch 'tolov'"
* | 849bb3a Revert "Merge branch 'tolov'"
* | ba4e7d7 Log qo'shish
* | 5701ab9 Merge branch 'tolov'
|\|
| * 9eb6ed2 B: naqd to'lov
| * 792afc4 A: karta orqali to'lov
* | 9abe168 Sozlamalar
|/
* 21230e2 Boshlang'ich
```

Endi `tolov` to'liq birlashgan: `M` va `W` bir-birini yo'qqa chiqaradi, `Reapply` (`Y`) `A`+`B` ni qaytaradi, oxirgi merge `C` ni olib kiradi.

> **Pro Git bilan farq.** Pro Git'da revert'ning revert'i `Revert "Revert "Merge branch 'topic'""` sarlavhasini oladi. Git 2.56 da (2.43 dan beri) bunday commit sarlavhasi `Reapply "..."` bo'ladi; tanasida hamon `This reverts commit 849bb3a...`. `git revert` ma'lumotnomasining DISCUSSION bo'limi: ketma-ket revert'lar `Reapply "Reapply "<asl sarlavha>""` kabi uzun sarlavhalar beradi — ularni qisqaroq, aniqroq qilib qayta yozishni tavsiya qiladi. Va umuman, revert xabarida **nega** qaytarilayotganini yozish qat'iy tavsiya etiladi.

### Ikki xil holat — ikki xil yechim

Rasmiy maqola muhim farqni ajratadi:

| Yon branch qanday tuzatilgan | To'g'ri yo'l |
| --- | --- |
| Eski `A`, `B` ustiga tuzatish commit'lari qo'shilgan (`C`, `D`) — bizning misol | Avval revert'ni revert qiling (`git revert W`), keyin merge |
| Branch noldan qayta qurilgan (rebase qilib, `A'`, `B'`, `C'` — yangi hash'lar) | Revert'ni revert **qilmang**, shunchaki qayta merge qiling — yangi commit'lar eski merge'ning ajdodi emas |

Ikkinchi holatda revert'ni revert qilish o'xshash, lekin bir xil bo'lmagan o'zgarishlarni ikki marta olib kiradi va ko'p konflikt beradi. Maqolaning xulosasi: revert'ni revert qilishni "o'ylamasdan" qilmang.

Maqolaning yana bir maslahati — workflow haqida. Merge'ni revert qilish texnik jihatdan to'g'ri, lekin `git bisect` ([41-bob](41-blame-va-bisect.md)) uchun noqulay: revert — butun branch o'zgarishlarini o'z ichiga olgan bitta katta commit. Imkon bo'lsa, butun merge'ni emas, xatoni qilgan **bitta commit**ni toping va uni tuzating yoki revert qiling. Butun merge'ni revert qilish — "bu branch umuman tayyor emas edi" degan holat uchun.

## Kod: subtree merge — boshqa loyiha papka sifatida

**Muammo.** Loyihangizga boshqa, mustaqil rivojlanayotgan loyihani (masalan, kichik kutubxona) qo'shmoqchisiz — `vendor/sana/` papkasiga. Kutubxona yangilanganda yangilanishlarni olib kelish ham kerak. Oddiy pull ishlamaydi: kutubxonaning `README.md` si sizning `README.md` bilan to'qnashadi, chunki ikkalasi ham ildizda.

**Yechim** (rasmiy "How to use the subtree merge strategy" maqolasi): kutubxonani remote sifatida qo'shib, uning tree'sini papkaga o'qish va keyingi yangilanishlarni `subtree` strategiyasi bilan olish. Bunday branch'ning tarixi asosiy loyihaniki bilan umuman bog'lanmagan — Pro Git ta'kidlaydi: bir repo'dagi hamma branch bir loyihaga tegishli bo'lishi shart emas.

```text
subtree/
├── sana-kutubxona/   ← mustaqil kutubxona: README.md, sana.js
└── sayt/             ← asosiy loyiha: README.md, index.js
```

### Birinchi marta qo'shish

```text
$ git remote add -f sana ../sana-kutubxona
Updating sana
From ../sana-kutubxona
 * [new branch]      main       -> sana/main

$ git merge -s ours --no-commit --allow-unrelated-histories sana/main
Automatic merge went well; stopped before committing as requested

$ git read-tree --prefix=vendor/sana/ -u sana/main
$ git status -s
A  vendor/sana/README.md
A  vendor/sana/sana.js

$ git commit -m "Sana kutubxonasini vendor/sana/ ga qo'shish"
```

Har qadam nima qildi:

1. `remote add -f` — remote qo'shib, darhol `fetch` qildi ([27-bob](27-remote.md)).
2. `merge -s ours --no-commit --allow-unrelated-histories` — merge'ni **boshladi**, lekin tree'ni o'zgartirmadi (`ours`) va commit qilmadi. Maqsad — keyingi commit `sana/main`ni ikkinchi ota sifatida yozsin. `--allow-unrelated-histories` kerak, chunki ikki tarixning umumiy ajdodi yo'q; busiz Git rad etadi:

   ```text
   $ git merge sana/main
   fatal: refusing to merge unrelated histories
   ```
3. `read-tree --prefix=vendor/sana/ -u sana/main` — plumbing buyruq ([13-bob](13-plumbing-va-porcelain.md)): `sana/main` tree'sini index'ga `vendor/sana/` prefiksi bilan o'qiydi; `-u` working tree'ni ham yangilaydi.
4. `commit` — ikki otali merge commit: tree'da sizning fayllaringiz + `vendor/sana/`.

```text
$ git log --oneline --graph
*   5f97580 Sana kutubxonasini vendor/sana/ ga qo'shish
|\
| * 21bbf39 Sana kutubxonasi v1
* 715fe1c Sayt boshlanishi

$ git ls-tree -r HEAD
100644 blob 0be4e3d0e07f4da7ddf749243bf9c82801ff8369	README.md
100644 blob 7f9818fed9e1e278af9b12e5fb16d0f0fcbf79fb	index.js
100644 blob 1ea70b1e6b6d66d4809f3522d2df83df92dd76b5	vendor/sana/README.md
100644 blob f7d45ea96875e13677f29c59bf17a857cda2a6e8	vendor/sana/sana.js
$ git ls-tree -r sana/main
100644 blob 1ea70b1e6b6d66d4809f3522d2df83df92dd76b5	README.md
100644 blob f7d45ea96875e13677f29c59bf17a857cda2a6e8	sana.js
```

Blob'lar (`1ea70b1`, `f7d45ea`) **aynan bir xil** — fayllar nusxalanmagan, faqat boshqa yo'l ostida ko'rsatilgan ([14–15-boblar](14-obyektlar-blob.md)). Ichki model shu: subtree merge — bitta tree'ni boshqa tree ichiga "osib qo'yish".

### Yangilanishlarni olish

Kutubxona README'ga tavsif qo'shdi. Saytda oddiy merge:

```text
$ git fetch sana
$ git merge --no-edit sana/main
Auto-merging README.md
CONFLICT (content): Merge conflict in README.md
Automatic merge failed; fix conflicts and then commit the result.
```

Git kutubxonaning `README.md` o'zgarishini **saytning** ildizdagi `README.md` siga qo'llamoqchi bo'ldi — yo'llar bir xil. `git merge --abort` va `subtree` strategiyasi bilan:

```text
$ git merge -s subtree --no-edit sana/main
Merge made by the 'subtree' strategy.
 vendor/sana/README.md | 1 +
 1 file changed, 1 insertion(+)

$ cat README.md
# Sayt
$ cat vendor/sana/README.md
# Sana kutubxonasi
Sana bilan ishlash uchun funksiyalar.
```

`subtree` strategiyasi `sana/main` tree'si sizning tree'ingizdagi qaysi papkaga mos kelishini **taxmin qiladi** va uni (va umumiy ajdod tree'sini ham) shu joyga siljitib, keyin oddiy `ort` merge qiladi. Taxmin o'rniga yo'lni aniq aytish — `-X subtree=<yo'l>` opsiyasi (ma'lumotnoma uni `subtree` strategiyasining "ilg'orroq shakli" deydi). Xuddi shu yangilanish, shu safar oddiy `ort` + opsiya bilan (`reset --hard HEAD~1` dan keyin):

```text
$ git merge -X subtree=vendor/sana --no-edit sana/main
Merge made by the 'ort' strategy.
 vendor/sana/README.md | 1 +
 1 file changed, 1 insertion(+)
```

Kutubxonada ko'p bir xil nomli papkalar bo'lsa, aniq yo'l xavfsizroq.

> **Kuzatuv.** Bundan oldin kutubxona faqat `sana.js` ga `ertaga()` funksiyasini qo'shgan edi — o'sha yangilanishda oddiy `git merge sana/main` ham to'g'ri ishladi — `ort` ning rename aniqlashi `sana.js` → `vendor/sana/sana.js` ni "100% o'xshash rename" deb topdi. Lekin bunga tayanmang: yuqoridagi `README.md` misoli ko'rsatganidek, bir xil nomli fayl bo'lsa, rename emas, "o'sha fayl o'zgargan" deb tushuniladi.

### Pro Git varianti: `--squash` bilan

Pro Git yangilanishlarni `--squash` bilan olishni ko'rsatadi — kutubxona tarixi loyihangiz tarixiga kirmaydi, faqat o'zgarishlar:

```text
$ git merge --squash -X subtree=vendor/sana sana/main
Automatic merge went well; stopped before committing as requested
Squash commit -- not updating HEAD
$ git status -s
M  vendor/sana/sana.js
```

`MERGE_HEAD` yaratilmaydi (faqat `.git/SQUASH_MSG`) — keyingi `git commit` oddiy, bitta otali commit. Kamchiligi: Git keyingi safar nima birlashtirilganini bilmaydi, shuning uchun takroriy yangilanishlarda konflikt ko'payishi mumkin. Pro Git eski `-s recursive -Xsubtree=rack` yozuvini ishlatadi; hozir `recursive` = `ort`, `-s` ni yozmasa ham bo'ladi.

### Papkani kutubxona bilan solishtirish

Pro Git `git diff-tree -p rack_branch` ni tavsiya qiladi. Lekin sinovda bitta argumentli `git diff-tree -p sana/main` **`sana/main` commit'ini o'z otasi bilan** solishtiradi — ya'ni kutubxonaning oxirgi commit'ini ko'rsatadi, sizning papkangizni emas. To'g'ri solishtirish — ikki tree'ni aniq berish ([19-bob](19-revision-tanlash.md)dagi `<commit>:<yo'l>` sintaksisi):

```text
$ git diff HEAD~1:vendor/sana sana/main
diff --git a/README.md b/README.md
index 1ea70b1..431d887 100644
--- a/README.md
+++ b/README.md
@@ -1 +1,2 @@
 # Sana kutubxonasi
+Sana bilan ishlash uchun funksiyalar.

$ git diff HEAD:vendor/sana sana/main
$
```

(`git diff-tree -p HEAD~1:vendor/sana sana/main` ham xuddi shu natijani beradi.) Bo'sh chiqish — papka kutubxona bilan bir xil.

### Subtree yoki submodule

| | Subtree merge | Submodule ([43-bob](43-submodule-bundle-replace.md)) |
| --- | --- | --- |
| Klonlagandan keyin kod | Darhol bor | `submodule update` kerak |
| Foydalanuvchilarga yuk | Kam — oddiy fayllar | Ko'proq buyruq va tushuncha |
| Repo hajmi | Kutubxona obyektlari ham repo'da | Obyektlarni uzatmaslik mumkin |
| Kutubxonaga o'zgarish yuborish | Murakkabroq | Osonroq |
| Xato xavfi | Noto'g'ri branch'ni noto'g'ri repo'ga push qilish | Submodule versiyasini yangilashni unutish |

Bu jadval — rasmiy maqola va Pro Git fikrlarining yig'indisi. Teskari yo'nalish ham mumkin: `vendor/sana/` dagi o'zgarishlarni kutubxona branch'iga `subtree` strategiyasi bilan merge qilib, kutubxona muallifiga yuborish. Lekin maqola ogohlantiradi: kutubxona sizdan merge qilsa, uning tarixi sizniki bilan bog'lanib qoladi — ular buni xohlamasligi mumkin.

## Kod: `rerere` — konflikt yechimini eslab qolish

**Muammo.** Uzoq yashaydigan topic branch'ni `main` bilan muntazam sinab ko'rasiz: merge qilasiz, konfliktni hal qilasiz, testlaysiz, keyin "sinov merge"ni olib tashlaysiz (branch tarixi keraksiz merge commit'lar bilan to'lmasin). Keyingi safar — o'sha konflikt, o'sha qo'l mehnati. Rebase'da ham shunday.

**Yechim.** `rerere` — "**re**use **re**corded **re**solution", ya'ni "yozib olingan yechimni qayta ishlatish". Git konfliktli holatni va siz uni qanday hal qilganingizni eslab qoladi; o'sha konflikt yana chiqsa, yechimni o'zi qo'llaydi.

Standart holatda o'chiq. Yoqish:

```bash
$ git config --global rerere.enabled true
```

Ma'lumotnoma (`rerere.enabled`): sozlama bo'lmasa ham, `$GIT_DIR` ichida `rr-cache` papkasi bo'lsa, `rerere` yoqilgan hisoblanadi. Ya'ni `mkdir .git/rr-cache` ham uni bitta repo uchun yoqadi; lekin sozlama aniqroq.

### Birinchi konflikt: preimage yoziladi

`salom.py` — `print("hello world")`. `dunyo` branch'ida `world` → `dunyo`, `main`da `hello` → `salom`:

```text
$ ls .git/rr-cache
ls: .git/rr-cache: No such file or directory

$ git merge dunyo
Auto-merging salom.py
CONFLICT (content): Merge conflict in salom.py
Recorded preimage for 'salom.py'
Automatic merge failed; fix conflicts and then commit the result.
```

Yangi qator — `Recorded preimage for 'salom.py'`. **Preimage** — konfliktning hal qilinishidan oldingi surati. `.git` ichiga qaraymiz:

```text
$ find .git/rr-cache -type f
.git/rr-cache/c19d6e3b520331805e13429ee307f5030f6e2546/preimage

$ cat .git/rr-cache/c19d6e3b520331805e13429ee307f5030f6e2546/preimage
def salom():
<<<<<<<
    print("hello dunyo")
=======
    print("salom world")
>>>>>>>
```

Working tree'dagi fayldan ikki farqi bor:

1. **Yorliqlar yo'q** — `<<<<<<< HEAD` emas, shunchaki `<<<<<<<`. Branch nomi ahamiyatsiz bo'lishi kerak: xuddi shu konflikt boshqa nomli branch'da ham chiqishi mumkin.
2. **Tomonlar tartiblangan** — `hello dunyo` (`dunyo` branch'iniki) birinchi turibdi, garchi working tree'da `HEAD` tomoni (`salom world`) birinchi bo'lsa ham. Ikki tomon alifbo tartibida joylashtirilgan.

Git ma'lumotnomasining texnik hujjati (`technical/rerere`) buni "konfliktni normallashtirish" deydi: yorliqlar olib tashlanadi, `diff3`/`zdiff3` uslubidagi ajdod qismi olib tashlanadi, bo'laklar tartiblanadi. Natija: branch'lar teskari tartibda birlashtirilsa ham (masalan, rebase'da `ours`/`theirs` almashganda — [22-bob](22-konfliktlar.md)) konflikt bir xil "ko'rinadi".

Papka nomi `c19d6e3...` — **konflikt ID**: normallashtirilgan bo'laklarning, har biri oxiriga NUL bayt qo'shilib ketma-ket yozilganining SHA-1 hash'i (belgilarsiz). Buni o'zimiz tekshiramiz:

```text
$ printf '    print("hello dunyo")\n\0    print("salom world")\n\0' | shasum
c19d6e3b520331805e13429ee307f5030f6e2546  -
```

Aynan papka nomi. Ya'ni `rr-cache` — "konflikt mazmuni → yechim" lug'ati, kaliti — konfliktning o'zidan hisoblangan hash ([14-bob](14-obyektlar-blob.md)dagi mazmun-manzil g'oyasi bilan bir xil).

Joriy merge'da qaysi fayl qaysi konflikt ID ga tegishli ekanini Git `.git/MERGE_RR` faylida saqlaydi (yozuvlar NUL bilan ajratilgan):

```text
$ cat .git/MERGE_RR | tr '\0' '\n'
c19d6e3b520331805e13429ee307f5030f6e2546	salom.py
```

`rerere` holati haqida buyruqlar:

```text
$ git rerere status
salom.py

$ git rerere diff
--- a/salom.py
+++ b/salom.py
@@ -1,6 +1,6 @@
 def salom():
-<<<<<<<
-    print("hello dunyo")
-=======
+<<<<<<< HEAD
     print("salom world")
->>>>>>>
+=======
+    print("hello dunyo")
+>>>>>>> dunyo

$ git rerere remaining
salom.py
```

- `status` — `rerere` yechimini yozib oladigan fayllar;
- `diff` — preimage bilan hozirgi fayl farqi (hozircha faqat yorliq va tartib farqi);
- `remaining` — `rerere` avtomatik hal qilmagan konfliktli fayllar.

### Hal qilish: postimage yoziladi

```text
$ cat salom.py
def salom():
    print("salom dunyo")

$ git rerere diff
--- a/salom.py
+++ b/salom.py
@@ -1,6 +1,2 @@
 def salom():
-<<<<<<<
-    print("hello dunyo")
-=======
-    print("salom world")
->>>>>>>
+    print("salom dunyo")
```

Bu `diff` — aynan `rerere` eslab qoladigan qoida: "shu ikki variant to'qnashsa — `salom dunyo` qil". `git add` yechimni hali yozmaydi; uni `git commit` yozadi:

```text
$ git add salom.py
$ find .git/rr-cache -type f
.git/rr-cache/c19d6e3b520331805e13429ee307f5030f6e2546/preimage

$ git commit --no-edit
Recorded resolution for 'salom.py'.
[main d759d24] Merge branch 'dunyo'

$ find .git/rr-cache -type f
.git/rr-cache/c19d6e3b520331805e13429ee307f5030f6e2546/preimage
.git/rr-cache/c19d6e3b520331805e13429ee307f5030f6e2546/postimage
$ cat .git/rr-cache/c19d6e3b520331805e13429ee307f5030f6e2546/postimage
def salom():
    print("salom dunyo")
```

**Postimage** — hal qilingan holat. Ma'lumotnoma: `git merge` muvaffaqiyatsiz avtomerge'dan keyin `git rerere` ni o'zi chaqiradi (preimage), `git commit` merge natijasini commit qilganda yana chaqiradi (postimage). Sizdan `rerere.enabled` dan boshqa hech narsa talab qilinmaydi.

```text
.git/
├── rr-cache/
│   └── c19d6e3.../          ← konflikt ID (normallashtirilgan bo'laklar SHA-1)
│       ├── preimage         ← belgili, yorliqsiz, tartiblangan konflikt
│       └── postimage        ← sizning yechimingiz
└── MERGE_RR                 ← joriy merge: konflikt ID ↔ fayl (merge tugagach bo'shaydi)
```

### Qayta merge: yechim avtomatik qo'llanadi

Sinov merge'ni olib tashlab, qayta merge qilamiz:

```text
$ git reset --hard HEAD^
HEAD is now at 4930e9e salom so'zi

$ git merge dunyo
Auto-merging salom.py
CONFLICT (content): Merge conflict in salom.py
Resolved 'salom.py' using previous resolution.
Automatic merge failed; fix conflicts and then commit the result.

$ cat salom.py
def salom():
    print("salom dunyo")
$ git status -s
UU salom.py
```

`Resolved 'salom.py' using previous resolution.` — fayl allaqachon hal qilingan, belgilar yo'q. Lekin **index'ga tegilmagan** — fayl hamon `UU`. Bu ataylab: ma'lumotnoma "`git rerere` index faylini o'zgartirmaydi, yakuniy tekshiruvni `git diff` bilan qilib, ishonch hosil qilgach `git add` qiling" deydi. Avtomatik yechim yangi kontekstda noto'g'ri bo'lishi mumkin:

```text
$ git diff
diff --cc salom.py
index 94f612e,dd0ceba..0000000
--- a/salom.py
+++ b/salom.py
@@@ -1,2 -1,2 +1,2 @@@
  def salom():
-     print("salom world")
 -    print("hello dunyo")
++    print("salom dunyo")
```

Ichkarida `rerere` uch tomonlama merge qiladi: eski preimage, eski postimage va hozirgi konfliktli fayl o'rtasida. Toza chiqsa — natija working tree'ga yoziladi.

Tekshiruvsiz index'ga ham yozilishini xohlasangiz — `rerere.autoUpdate`:

```text
$ git config rerere.autoUpdate true
$ git merge dunyo
Auto-merging salom.py
CONFLICT (content): Merge conflict in salom.py
Staged 'salom.py' using previous resolution.
Automatic merge failed; fix conflicts and then commit the result.
$ git status -s
M  salom.py
```

Endi `Staged` — fayl index'ga qo'shildi, faqat `git commit` qoldi. Merge hamon "muvaffaqiyatsiz" deb tugaydi — Git sizdan natijani ko'rib commit qilishingizni kutadi. `--rerere-autoupdate` / `--no-rerere-autoupdate` flag'lari `merge`, `rebase`, `cherry-pick`, `revert` da shu sozlamani bir martaga almashtiradi.

### Rebase'da ham ishlaydi

Pro Git'dagi asosiy holat: merge'ni bekor qilib, o'rniga rebase qilish. Rebase'da `ours`/`theirs` almashadi, lekin normallashtirish tufayli konflikt ID o'zgarmaydi:

```text
$ git switch dunyo
$ git rebase main
Rebasing (1/1)Auto-merging salom.py
CONFLICT (content): Merge conflict in salom.py
error: could not apply 88c328f... dunyo so'zi
...
Resolved 'salom.py' using previous resolution.
Could not apply 88c328f... # dunyo so'zi

$ cat salom.py
def salom():
    print("salom dunyo")
```

Konfliktni qayta chizib ([22-bob](22-konfliktlar.md)), keyin `rerere` ni qo'lda chaqirish ham mumkin:

```text
$ git restore --conflict=merge salom.py
$ cat salom.py
def salom():
<<<<<<< ours
    print("salom world")
=======
    print("hello dunyo")
>>>>>>> theirs
$ git rerere
Resolved 'salom.py' using previous resolution.

$ git add salom.py
$ git rebase --continue
[detached HEAD 22a3a1f] dunyo so'zi
 1 file changed, 1 insertion(+), 1 deletion(-)
Successfully rebased and updated refs/heads/dunyo.
```

Argumentsiz `git rerere` — "hozirgi konfliktlar uchun yozib ol yoki qo'lla".

### Noto'g'ri yechimni unutish

Yechim yomon chiqqan bo'lsa, uni eslab qolish ham yomon — keyingi safar ham qo'llanadi. `git rerere forget <yo'l>`:

```text
$ git merge dunyo
...
Resolved 'salom.py' using previous resolution.
...
$ git rerere forget salom.py
Updated preimage for 'salom.py'
Forgot resolution for 'salom.py'
$ find .git/rr-cache -type f | sort
.git/rr-cache/c19d6e3b520331805e13429ee307f5030f6e2546/preimage
.git/rr-cache/c19d6e3b520331805e13429ee307f5030f6e2546/thisimage
```

`postimage` o'chdi. Lekin working tree'dagi fayl o'zgarmaydi — u hamon eski yechim bilan turadi. Belgilarni qaytarish uchun `git restore --merge salom.py` ([22-bob](22-konfliktlar.md)), keyin yangi yechim va commit:

```text
$ git restore --merge salom.py
$ # salom.py: print("Assalomu alaykum, dunyo")
$ git add salom.py
$ git commit --no-edit
Recorded resolution for 'salom.py'.
[main a193444] Merge branch 'dunyo'
$ cat .git/rr-cache/c19d6e3b520331805e13429ee307f5030f6e2546/postimage
def salom():
    print("Assalomu alaykum, dunyo")
```

(`thisimage` — `forget` paytida yozilgan oraliq fayl; u ma'lumotnomada hujjatlanmagan ichki tafsilot.)

### `rerere` buyruqlari

| Buyruq | Nima qiladi |
| --- | --- |
| `git rerere` | Hozirgi konfliktlarni yozib oladi yoki eski yechimni qo'llaydi (odatda avtomatik chaqiriladi) |
| `git rerere status` | Yechimi yozib olinadigan fayllar |
| `git rerere diff` | Preimage bilan hozirgi fayl farqi |
| `git rerere remaining` | Avtomatik hal qilinmagan konfliktli fayllar (submodule konfliktlari ham) |
| `git rerere forget <pathspec>` | Shu fayllardagi hozirgi konfliktlar uchun yozilgan yechimni o'chiradi |
| `git rerere clear` | Joriy merge uchun `rerere` metama'lumotini tozalaydi; `git rebase --abort`/`--skip` va `git am --abort`/`--skip` uni o'zi chaqiradi |
| `git rerere gc` | Eski yozuvlarni o'chiradi: hal qilinmaganlarini 15 kundan, hal qilinganlarini 60 kundan keyin (`gc.rerereUnresolved`, `gc.rerereResolved`) |

Ma'lumotnomadagi cheklov: `rerere` konfliktni fayldagi belgilar orqali taniydi. Faylning o'zida konflikt belgisiga o'xshash qatorlar bo'lsa (masalan, `=======` bilan chizilgan sarlavha), `rerere` yechimni yoza olmasligi mumkin — bunda `.gitattributes`dagi `conflict-marker-size` yordam beradi ([46-bob](46-gitattributes.md)).

## Muhandislik nuqtai nazari: qaysi vositani qachon tanlash

| Vaziyat | Vosita | Nega |
| --- | --- | --- |
| Konfliktli joyda bir tomon doim to'g'ri (generatsiya qilingan fayllar) | `-X ours` / `-X theirs` | Konfliktsiz o'zgarishlar saqlanadi |
| Branch'ni "birlashtirildi" deb belgilash, o'zgarishlarini olmay | `-s ours` | Natija tree'si o'zgarmaydi, tarixda ikkinchi ota bor |
| Kimdir formatlashni o'zgartirgan | `-X ignore-space-change`, keyin formatlovchi | Konflikt yo'qoladi, lekin formatlash olinmaydi |
| Bir-biriga tegmaydigan ko'p topic branch'ni sinov uchun yig'ish | `octopus` | Bitta commit; konfliktda — birma-bir merge |
| Lokal, hali push qilinmagan xato merge | `git reset --hard ORIG_HEAD` | Tarix toza, iz qolmaydi |
| Push qilingan xato merge | `git revert -m 1 <merge>` | Tarix o'zgarmaydi; qayta merge'dan oldin revert'ni revert qilish kerakligini unutmang |
| Boshqa loyiha papka sifatida | Subtree merge (`-s subtree` / `-X subtree=`) | Klonlaganda kod darhol bor |
| Bir xil konfliktni qayta-qayta hal qilish | `rerere.enabled=true` | Bir marta hal qilasiz |

Ikkita umumiy qoida:

- **`-X` va `-s` dan keyin natijani ko'zdan kechiring.** Ular konflikt belgilarini olib tashlaydi — ya'ni Git sizga "bu yerda ziddiyat bor edi" deb aytmaydi. `git show --stat HEAD`, `git diff HEAD~`, testlar.
- **Revert qilingan merge'ni hujjatlashtiring.** Revert commit xabariga nega qaytarilganini va "qayta merge'dan oldin bu revert'ni revert qilish kerak" degan eslatmani yozing — bir necha oydan keyin bu narsa esdan chiqadi.

## Muhandislik nuqtai nazari: `rerere` xavfsiz ishlatish

`rerere` deyarli zararsiz, lekin bir nechta odat foydali:

- `rerere.autoUpdate` ni yoqmang, yoki yoqsangiz ham commit'dan oldin `git diff --cached` qiling. Eski yechim yangi kontekstda (masalan, atrofdagi kod o'zgargan) mantiqan noto'g'ri bo'lishi mumkin, sintaktik jihatdan esa to'g'ri ko'rinadi.
- Yomon yechimni darhol `git rerere forget` qiling — aks holda u keyingi rebase'da ham "hal qiladi".
- `rr-cache` lokal: u `push`/`clone` bilan uzatilmaydi. Jamoa a'zolari har biri o'z yechimlarini yig'adi.
- Ma'lumotnomadagi Linux yadrosi misoli: tez-tez "sinov merge" commit'lari bilan to'lgan branch'lar ("useless merges") — yaxshi amaliyot emas. `rerere` bilan sinov merge'ni olib tashlab, faqat yakuniy merge'ni qoldirish mumkin.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `-s ours` ni `-X ours` deb ishlatish | Boshqa branch'ning **hamma** o'zgarishi, konfliktsizlari ham, jimgina tashlanadi | Konfliktlarda bir tomonni tanlash uchun — `-X ours` |
| `-X theirs` faqat konfliktli qatorlarni oladi deb o'ylash | Bo'lak darajasida ishlaydi — yonma-yon turgan o'zgarishlaringiz ham yo'qolishi mumkin | Natijani `git diff HEAD~` bilan tekshiring |
| `git merge -s theirs` qidirish | Bunday strategiya yo'q | `git reset --hard <branch>` yoki boshqa tomonda `-s ours` |
| Merge commit'ni `-m` siz revert qilish | `is a merge but no -m option was given` | `git revert -m 1 <merge>` |
| Revert qilingan branch'ni tuzatib, shunchaki qayta merge qilish | Revert'dan oldingi commit'lar o'zgarishi **jimgina** kelmaydi | Avval `git revert <revert-commit>`, keyin merge |
| Rebase qilib qayta qurilgan branch uchun revert'ni revert qilish | Bir xil o'zgarish ikki marta keladi, ko'p konflikt | Bu holda shunchaki qayta merge |
| Push qilingan merge'ni `reset --hard` bilan olib tashlash | Boshqalar tarixi ajraladi, ular merge'ni qayta olib kirishi mumkin | `revert -m 1` |
| `octopus` merge'da konfliktni hal qilishga urinish | Strategiya bunga mo'ljallanmagan, yorliqlar ham vaqtinchalik fayl nomlari | `--abort`, keyin branch'larni birma-bir merge qiling |
| Subtree yangilanishini oddiy `merge` bilan olish | Bir xil nomli fayllar (README) noto'g'ri joyga birlashadi | `-s subtree` yoki `-X subtree=<yo'l>` |
| `rerere` hal qilgan faylni tekshirmasdan `add` qilish | Eski yechim yangi kodga mos kelmasligi mumkin | `git diff`, testlar; yomon bo'lsa `rerere forget` |

## Amaliyot

1. Ikki branch'da bitta faylning yonma-yon ikki qatorini har xil o'zgartiring (bir tomonda ikkalasini, boshqa tomonda bittasini). `-X ours` va `-X theirs` bilan merge qilib, qaysi o'zgarishlar yo'qolganini aniqlang. Nega `theirs` tegmagan qator ham yo'qoldi?
2. `git merge -s ours <branch>` qiling. `git diff HEAD~ HEAD`, `git cat-file -p HEAD` va `git branch --merged` natijalarini yozib, bu commit "nima saqlaydi" va "nima saqlamaydi"ni tushuntiring.
3. Bir branch'da faylning chekinishini o'zgartiring, boshqasida mazmunini. Oddiy merge, `-X ignore-space-change` va `-X ignore-all-space` natijalarini `sed 's/ /·/g'` bilan solishtiring.
4. To'rtta mustaqil branch yarating va `git merge a b c` bilan octopus merge qiling. `HEAD^1`..`HEAD^4` ni tekshiring. Keyin `main` hamma branch'larning ajdodi bo'lgan holatda takrorlang — `Fast-forwarding to:` qatori va birinchi ota qanday o'zgardi?
5. Merge qiling, keyin bitta commit qo'shing va merge'ni `git revert -m 1` bilan qaytaring. Branch'ga yangi commit qo'shib qayta merge qiling va eski o'zgarishlar kelmaganini isbotlang (`git merge-base` bilan sababini ko'rsating). So'ng revert'ni revert qilib, to'g'ri natijaga erishing.
6. Mustaqil "kutubxona" repo'sini remote qilib qo'shing va `merge -s ours --allow-unrelated-histories` + `read-tree --prefix` bilan `vendor/` ichiga joylang. Kutubxonada ham, loyihangizda ham `README.md` ni o'zgartirib, oddiy merge va `-s subtree` natijasini solishtiring.
7. `rerere.enabled` ni yoqib konflikt yarating. `.git/rr-cache/<id>/preimage` ni o'qing, so'ng konflikt ID ni `printf '...\0...\0' | shasum` bilan o'zingiz hisoblang. Hal qilib commit qiling, `reset --hard HEAD^` va qayta merge — `Resolved ... using previous resolution` ni ko'ring.
8. (Qiyinroq) `rerere` yechimini merge'da yozib oling, keyin o'sha branch'ni teskari yo'nalishda rebase qiling (`ours`/`theirs` almashadi). Yechim baribir qo'llanganini tasdiqlang va `technical/rerere` hujjatidagi "konfliktni normallashtirish" bo'limi asosida nega shunday ekanini tushuntiring. Keyin `diff3` uslubida (`merge.conflictStyle diff3`) takrorlang — konflikt ID o'zgardimi?

## Rasmiy hujjat

- Pro Git — Advanced Merging (Undoing Merges, Other Types of Merges): <https://git-scm.com/book/en/v2/Git-Tools-Advanced-Merging>
- Pro Git — Rerere: <https://git-scm.com/book/en/v2/Git-Tools-Rerere>
- `git merge` (MERGE STRATEGIES, `-s`, `-X`): <https://git-scm.com/docs/git-merge>
- Merge strategiyalari: <https://git-scm.com/docs/git-merge#_merge_strategies>
- `git revert` (`-m`, DISCUSSION): <https://git-scm.com/docs/git-revert>
- How to revert a faulty merge: <https://github.com/git/git/blob/v2.56.0/Documentation/howto/revert-a-faulty-merge.adoc>
- How to use the subtree merge strategy: <https://github.com/git/git/blob/v2.56.0/Documentation/howto/using-merge-subtree.adoc>
- `git read-tree` (`--prefix`): <https://git-scm.com/docs/git-read-tree>
- `git rerere`: <https://git-scm.com/docs/git-rerere>
- Rerere ichki tuzilishi (normallashtirish, konflikt ID): <https://github.com/git/git/blob/v2.56.0/Documentation/technical/rerere.adoc>
